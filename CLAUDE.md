# CLAUDE.md

Guidance for AI coding agents working in this repository.

## What this project is

`prettier-plugin-rock-lava` is a [Prettier](https://prettier.io) plugin that
teaches Prettier how to format **Lava** templates (and the HTML they live in).

Lava is the templating language used by [Rock RMS](https://www.rockrms.com/), an
open-source church-management platform. Lava is a superset/fork of the
[Liquid](https://shopify.github.io/liquid/) templating language (Shopify), so
much of the parsing/printing machinery here descends from Shopify's
`prettier-plugin-liquid`.

### Lava basics

- Output (drops): `{{ Person.NickName }}`
- Tags / logic: `{% assign name = 'Ted' %}`, `{% if %}…{% endif %}`,
  `{% for item in collection %}…{% endfor %}`
- Filters use PascalCase and the pipe symbol: `{{ value | TitleCase }}`
- Shortcodes use a distinct delimiter: `{[ shortcode ]}…{[ endshortcode ]}`
- Comments: `{% comment %}…{% endcomment %}`, `//- single line`, `/- multi -/`

## Embedded languages

A Lava template is rarely "just Lava." It is HTML with Lava interleaved, and it
commonly **embeds other languages inline**. Rock exposes Lava commands/tags that
contain foreign-language bodies, and the plugin formats those bodies with the
appropriate sub-formatter:

| Embedded language | How it appears in Lava/Rock                                        | Formatter used                                        |
| ----------------- | ------------------------------------------------------------------ | ----------------------------------------------------- |
| **JavaScript**    | `<script>` and `{% javascript %}…{% endjavascript %}`              | Prettier `babel`                                      |
| **CSS**           | `<style>` and `{% stylesheet %}` / `{% style %}`                   | Prettier `css`                                        |
| **SQL**           | `{% sql %}…{% endsql %}` (runs against SQL Server / T-SQL in Rock) | `sql-formatter` (`transactsql`, upper-cased keywords) |
| TypeScript        | `<script type="application/x-typescript">`                         | Prettier `typescript`                                 |
| JSON              | `<script type="...json">`                                          | Prettier `json`                                       |
| Markdown          | `<script type="text/markdown">`                                    | Prettier `markdown`                                   |

Notes:

- If an embedded `style`/`stylesheet`/`sql` body contains Lava tokens, it is
  treated as plain text (kind `text`) and passed through untouched, because the
  sub-formatter cannot parse Lava.
- The embed logic lives in [src/printer/embed.ts](src/printer/embed.ts). Markup
  kinds are decided in [src/parser/stage-2-ast.ts](src/parser/stage-2-ast.ts)
  (`RawMarkupKinds`, `toRawMarkupKindFromLavaNode`, `toRawMarkupKindFromHtmlNode`).

### XAML and HTMX/Helix

Rock templates can also contain other inline content that this plugin does
**not** special-case and currently passes through as text/HTML:

- **XAML** — Rock's mobile shell renders XAML, and Lava is used to build XAML
  markup for the mobile app. There is no dedicated XAML formatter; XAML bodies
  flow through as raw/text.
- **HTMX / Helix** — Rock ships **Helix**, a custom fork of HTMX, for building
  interactive server-rendered UIs. These are just HTML attributes
  (e.g. `hx-*`-style attributes) on normal elements, so they are handled by the
  HTML printer like any other attribute and require no embedded-language
  handling.

When asked to add formatting support for XAML or Helix-specific constructs,
treat them as new cases in the parser's raw-markup detection and the embed
printer — mirror how SQL/JavaScript are wired up.

## Tooling: use Bun

This repo uses **[Bun](https://bun.sh)** for installing dependencies and running
scripts/tests. Prefer Bun over npm/yarn:

```bash
# Install dependencies
bun install

# Build (shims → grammar, TS compile, standalone bundle)
bun run build

# Run the test suite (Prettier 2 by default)
bun run test

# Run tests against Prettier 3
bun run test:3

# Idempotence tests
bun run test:idempotence

# Type-check only
bun run type-check

# Format the plugin's own source
bun run format
```

The `package.json` scripts already shell out to `bun run …` for their internal
steps (e.g. `build` calls `bun run build:shims`), so staying on Bun keeps
everything consistent.

## Architecture quick map

- `grammar/lava-html.ohm` — Ohm grammar. `blockName` is an **enumerated** list of
  known block tags; only tags in it can use `{% endX %}`. Regenerate the `.ohm.js`
  via `node build/shims.js` (run by `bun run build:shims`) after grammar edits.
- `src/parser/stage-1-cst.ts` — flat Concrete Syntax Tree.
- `src/parser/stage-2-ast.ts` — hierarchical AST; pairs open/close tags; assigns
  embedded-language `RawMarkupKinds`.
- `src/printer/` — Prettier `Doc` printing. `printer-lava-html.ts` is the entry
  point; `print/lava.ts` handles Lava tags; `embed.ts` handles embedded languages
  (supports both Prettier 2 `embed2` and Prettier 3 `embed3` APIs).
- Tests live under `test/<feature>/` and `src/**/*.spec.ts`.

## Conventions

- Block tags must exist in the enumerated `blockName` grammar rule — a blanket
  fallback that matches any identifier breaks inline-vs-block detection (the CST
  is flat and pairing happens in stage 2). Keep the list explicit.
- Inline/unknown tags fall through to a generic base-case printer and work
  without grammar changes.
- The plugin supports both Prettier 2 and 3; changes to printing must keep both
  `embed2` and `embed3` paths working.
