/**
 * Regenerates a test's `fixed.lava` (the expected output) by formatting every
 * chunk of its `index.lava` with the live printer. Use this AFTER you've
 * deliberately changed a formatting rule and confirmed the new output is what
 * you want — it "blesses" the current printer output as the new expectation.
 *
 * Usage:
 *   bun run bless test/lava-lava-tag           # rewrite that dir's fixed.lava
 *   bun run bless test/lava-lava-tag --dry     # print the new fixed.lava, don't write
 *
 * It mirrors test-helpers.ts exactly: same paragraph splitter, same per-chunk
 * printWidth/options parsing, so the regenerated file aligns chunk-for-chunk
 * with the test runner. The chunk's message/option header is preserved verbatim
 * from index.lava; only the body is reformatted.
 *
 * WARNING: this trusts the current printer output. Review the diff
 * (git diff <dir>/fixed.lava) before committing.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';
import * as plugin from '../src';

const PARAGRAPH_SPLITTER = /(?:\r?\n){2,}(?=\/\/|It|When|If|focus|debug|skip|<)/i;
const TEST_MESSAGE = /^(\/\/|It|When|If|focus|debug|skip)((\s|\S)(?!<)(?!{)(?!---))*./i;

// Same defaults the test harness applies (see test-helpers.ts getTestSetup).
const BASE_OPTIONS = { printWidth: 80, tabWidth: 2, trailingComma: 'es5' as const };

async function format(content: string, options: any) {
  return prettier.format(content, {
    ...options,
    parser: 'lava-html',
    plugins: [plugin],
  });
}

function parseOptions(header: string) {
  const options: any = { ...BASE_OPTIONS };
  const optionsParser = /(?<name>\w+): (?<value>[^\s]*)/g;
  let match: RegExpExecArray | null;
  while ((match = optionsParser.exec(header)) !== null) {
    try {
      options[match.groups!.name] = JSON.parse(match.groups!.value);
    } catch {
      /* not a JSON option (e.g. part of prose) — ignore */
    }
  }
  return options;
}

async function blessChunk(chunk: string): Promise<string> {
  const msgMatch = TEST_MESSAGE.exec(chunk);
  const header = msgMatch ? msgMatch[0] : '';
  const body = chunk.replace(TEST_MESSAGE, '').trimStart();
  if (!body.trim()) return chunk; // nothing to format
  const options = parseOptions(header.replace(/\r?\n/g, ' '));
  const formatted = (await format(body, options)).trimEnd();
  return header ? `${header.trimEnd()}\n${formatted}` : formatted;
}

async function main() {
  const argv = process.argv.slice(2);
  const dry = argv.includes('--dry');
  const dir = argv.find((a) => !a.startsWith('--'));
  if (!dir) {
    console.error('usage: bun run bless <test-dir> [--dry]');
    process.exit(1);
  }

  const indexPath = path.join(dir, 'index.lava');
  const fixedPath = path.join(dir, 'fixed.lava');
  const source = fs.readFileSync(indexPath, 'utf8');
  const chunks = source.split(PARAGRAPH_SPLITTER).map((s) => s.trimEnd());

  const blessed: string[] = [];
  for (const chunk of chunks) {
    blessed.push(await blessChunk(chunk));
  }
  const output = blessed.join('\n\n') + '\n';

  if (dry) {
    process.stdout.write(output);
  } else {
    fs.writeFileSync(fixedPath, output, 'utf8');
    console.log(`Wrote ${fixedPath} (${chunks.length} chunks)`);
    console.log('Review with:  git diff ' + fixedPath);
  }
}

main();
