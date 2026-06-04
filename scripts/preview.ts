/**
 * Before/after preview tool for prettier-plugin-rock-lava.
 *
 * Usage:
 *   bun run preview path/to/file.lava            # format a file, show before/after
 *   bun run preview path/to/file.lava --width 40 # override printWidth
 *   echo '{% assign x=1 %}' | bun run preview     # format stdin
 *   bun run preview --case test/lava-tag-assign/index.lava  # show every chunk
 *
 * It uses the live source in src/ (not the built bundle), so edits to the
 * printer show up immediately.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import * as prettier from 'prettier';
import * as plugin from '../src';

const PREVIEW_DIR = path.join(__dirname, '..', '.preview');

const ESC = (n: number) => `\x1b[${n}m`;
const dim = (s: string) => `${ESC(2)}${s}${ESC(0)}`;
const bold = (s: string) => `${ESC(1)}${s}${ESC(0)}`;
const cyan = (s: string) => `${ESC(36)}${s}${ESC(0)}`;
const green = (s: string) => `${ESC(32)}${s}${ESC(0)}`;
const red = (s: string) => `${ESC(31)}${s}${ESC(0)}`;

async function format(content: string, options: any = {}) {
  return prettier.format(content, {
    printWidth: 80,
    tabWidth: 2,
    parser: 'lava-html',
    plugins: [plugin],
    ...options,
  });
}

function box(title: string, body: string, color = cyan) {
  const lines = body.replace(/\n$/, '').split('\n');
  const header = color(bold(`┌─ ${title} `.padEnd(60, '─')));
  const out = lines.map((l) => color('│ ') + l).join('\n');
  return `${header}\n${out}`;
}

function parseArgs(argv: string[]) {
  const opts: any = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--width' || a === '-w') opts.printWidth = parseInt(argv[++i], 10);
    else if (a === '--case') opts.caseFile = argv[++i];
    else if (a === '--tab') opts.tabWidth = parseInt(argv[++i], 10);
    else if (a === '--open' || a === '-o') opts.open = true;
    else positional.push(a);
  }
  return { opts, positional };
}

/**
 * Writes before/after .lava files into .preview/ and opens them as a VSCode
 * diff. Returns the file paths. `slug` names the pair so multiple previews
 * don't clobber each other.
 */
function openInVscode(before: string, after: string, slug: string) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const beforePath = path.join(PREVIEW_DIR, `${slug}.before.lava`);
  const afterPath = path.join(PREVIEW_DIR, `${slug}.after.lava`);
  fs.writeFileSync(beforePath, before.replace(/\n*$/, '\n'), 'utf8');
  fs.writeFileSync(afterPath, after.replace(/\n*$/, '\n'), 'utf8');
  execFileSync('code', ['--diff', beforePath, afterPath]);
  return { beforePath, afterPath };
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'preview'
  );
}

// Splits a fixture-style file into named chunks, mirroring test-helpers.ts
const PARAGRAPH_SPLITTER = /(?:\r?\n){2,}(?=\/\/|It|When|If|focus|debug|skip|<)/i;
const TEST_MESSAGE = /^(\/\/|It|When|If|focus|debug|skip)((\s|\S)(?!<)(?!{)(?!---))*./i;

async function runCaseFile(file: string, open = false, widthOverride?: number) {
  const source = fs.readFileSync(file, 'utf8');
  const chunks = source.split(PARAGRAPH_SPLITTER).map((s) => s.trimEnd());

  // In --open mode, assemble ALL cases into one before/after pair (each case
  // labeled with a comment) so you get a single scrollable diff for the file.
  const beforeParts: string[] = [];
  const afterParts: string[] = [];

  for (const chunk of chunks) {
    const msgMatch = TEST_MESSAGE.exec(chunk);
    const message = msgMatch ? msgMatch[0].replace(/\r?\n/g, ' ').trim() : '(chunk)';
    const widthMatch = /printWidth:\s*(\d+)/.exec(message);
    const width =
      widthOverride ?? (widthMatch ? parseInt(widthMatch[1], 10) : 80);
    // When --width overrides, rewrite the label so it reflects the real width.
    const label =
      widthOverride != null
        ? message.replace(/\s*printWidth:\s*\d+/, '').trimEnd() +
          ` [printWidth: ${widthOverride}]`
        : message;
    const input = chunk.replace(TEST_MESSAGE, '').trimStart();
    if (!input.trim()) continue;

    if (open) {
      let output: string;
      try {
        output = (await format(input, { printWidth: width })).trimEnd();
      } catch (e: any) {
        output = `{%- comment -%} ERROR: ${e.message ?? e} {%- endcomment -%}`;
      }
      const header = `//- ${label}`;
      beforeParts.push(`${header}\n${input}`);
      afterParts.push(`${header}\n${output}`);
    } else {
      console.log('\n' + bold(green('● ' + label)));
      await previewOne(input, { printWidth: width });
    }
  }

  if (open) {
    const slug = slugify(path.basename(path.dirname(file)) || path.basename(file));
    const { beforePath, afterPath } = openInVscode(
      beforeParts.join('\n\n'),
      afterParts.join('\n\n'),
      slug,
    );
    console.log(green('Opened diff in VSCode:'));
    console.log('  ' + dim(beforePath) + '  ↔  ' + dim(afterPath));
  }
}

async function previewOne(input: string, opts: any) {
  if (opts.open) {
    let output: string;
    try {
      output = await format(input, opts);
    } catch (e: any) {
      console.log(box('ERROR', String(e.message ?? e), red));
      return;
    }
    const { beforePath, afterPath } = openInVscode(input, output, opts.slug ?? 'snippet');
    console.log(green('Opened diff in VSCode:'));
    console.log('  ' + dim(beforePath) + '  ↔  ' + dim(afterPath));
    return;
  }

  console.log(box('BEFORE', input, dim));
  try {
    const output = await format(input, opts);
    console.log(box(`AFTER  (printWidth: ${opts.printWidth ?? 80})`, output, cyan));
  } catch (e: any) {
    console.log(box('ERROR', String(e.message ?? e), red));
  }
}

async function main() {
  const { opts, positional } = parseArgs(process.argv.slice(2));

  if (opts.caseFile) {
    await runCaseFile(opts.caseFile, !!opts.open, opts.printWidth);
    return;
  }

  let input: string;
  let slug = 'snippet';
  if (positional[0]) {
    input = fs.readFileSync(positional[0], 'utf8');
    slug = slugify(path.basename(positional[0], path.extname(positional[0])));
  } else {
    input = fs.readFileSync(0, 'utf8'); // stdin
  }

  await previewOne(input, {
    printWidth: opts.printWidth ?? 80,
    ...(opts.tabWidth ? { tabWidth: opts.tabWidth } : {}),
    open: !!opts.open,
    slug,
  });
}

main();
