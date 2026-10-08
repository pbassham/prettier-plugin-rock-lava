# Changelog

All notable changes to `prettier-plugin-rock-lava` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.6]

### Fixed

- Raw tags no longer lose their parameters when formatted. `{% javascript %}`,
  `{% style %}` and `{% raw %}` had their markup stripped (e.g.
  `{% javascript url:'~/Scripts/moment.min.js' id:'moment' %}` became a bare
  `{% javascript %}`, silently dropping external script includes), and inside
  a `{% lava %}` tag every raw tag (`javascript`, `stylesheet`, `style`, `sql`,
  `raw`) lost its parameters. Parameters are now kept verbatim, with or
  without an embedded-language body.

## [0.10.5]

### Fixed

- Rock shorthand comments in template text (`//- ...` and `/- ... -/`) are now
  parsed as comments instead of plain text. Previously Prettier reflowed them
  like prose, which could change what Rock renders: a `/-` block comment that
  followed a `//-` line was joined onto that line, so Rock treated the rest of
  the block as visible output. Line comments now always end their line, short
  block comments collapse onto one line, and multi-line block comments are
  reindented like HTML comments. An unterminated `/-` and comments inside
  quoted attribute values are left as text, matching Rock.

## [0.10.0]

### Removed

- Dropped Prettier 2 support. The plugin now targets **Prettier 3 only** — the
  `prettier` peer dependency is `^3.0.0`. Removed the dual `embed2`/`embed3`
  printer paths, the `prettier2`/`prettier3` dev dependencies and module-alias
  test shim, and the `PRETTIER_MAJOR` CI matrix.

### Changed

- Migrated the playground to Prettier 3: it now loads the `prettier@3`
  standalone build plus the `babel`/`estree`/`postcss` browser plugins, and
  awaits the now-async `prettier.format`.
- Revived and re-targeted the project for Rock RMS **Lava** (forked from
  `prettier-plugin-liquid`).

## [0.9.1]

- Last release published under the original fork. Earlier history tracked the
  upstream Shopify `prettier-plugin-liquid` changelog and has been removed.
