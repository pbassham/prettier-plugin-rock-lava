<h1 align="center">
  <br>
  Lava Prettier Plugin
  <br>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/prettier-plugin-rock-lava"><img src="https://img.shields.io/npm/v/prettier-plugin-rock-lava.svg?sanitize=true" alt="Version"></a>
  <a href="https://github.com/pbassham/prettier-plugin-rock-lava/blob/main/LICENSE.md"><img src="https://img.shields.io/npm/l/prettier-plugin-rock-lava.svg?sanitize=true" alt="License"></a>
  <a href="https://github.com/pbassham/prettier-plugin-rock-lava/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/pbassham/prettier-plugin-rock-lava/actions/workflows/ci.yml/badge.svg"></a>
    <a href="https://npmcharts.com/compare/prettier-plugin-rock-lava?minimal=true"><img src="https://img.shields.io/npm/dm/prettier-plugin-rock-lava.svg?sanitize=true" alt="Downloads"></a>
</p>

[Prettier](https://prettier.io) is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.

This plugin teaches Prettier how to format [Rock RMS](https://www.rockrms.com/) **Lava** templates (and the HTML they live in).

## Status

This plugin is published on npm and usable today. It's still evolving, so if you
hit a formatting bug or have a suggestion, please [open an issue](https://github.com/pbassham/prettier-plugin-rock-lava/issues).

## Installation

```bash
# with npm
npm install --save-dev prettier prettier-plugin-rock-lava

# with bun
bun add --dev prettier prettier-plugin-rock-lava
```

## Usage

See our [Wiki](https://github.com/pbassham/prettier-plugin-rock-lava/wiki) pages on the subject:

- [In the terminal](https://github.com/pbassham/prettier-plugin-rock-lava/wiki/Use-it-in-your-terminal) (with Node.js)
- [In the browser](https://github.com/pbassham/prettier-plugin-rock-lava/wiki/Use-it-in-the-browser)
- [In your editor](https://github.com/pbassham/prettier-plugin-rock-lava/wiki/Use-it-in-your-editor)
- [In a CI workflow](https://github.com/pbassham/prettier-plugin-rock-lava/wiki/Use-it-in-CI)
- [As a pre-commit hook](https://github.com/pbassham/prettier-plugin-rock-lava/wiki/Use-it-as-a-pre-commit-hook)
- [With a bundler](https://github.com/pbassham/prettier-plugin-rock-lava/wiki/Use-it-with-a-bundler)

## Using it in your other repositories

### Per-project (recommended for shared/JS projects)

Install it as a dev dependency in the repo where you edit `.lava` files:

```bash
npm install --save-dev prettier prettier-plugin-rock-lava
```

Then add a `.prettierrc.json`:

```json
{
  "plugins": ["prettier-plugin-rock-lava"],
  "printWidth": 600,
  "tabWidth": 4
}
```

### Global setup (no per-project `node_modules`)

If your Lava projects aren't JS projects and you don't want a `node_modules`
folder in each one, install the plugin **once** in a fixed folder that is
independent of your Node version manager (so the path doesn't break when you
switch Node versions):

```bash
mkdir -p ~/.prettier-lava && cd ~/.prettier-lava
npm init -y
npm install prettier-plugin-rock-lava
npm install -g prettier   # the Prettier engine, found via resolveGlobalModules
```

Create a global `~/.prettierrc.json` that points at the **absolute path** to the
plugin's entry file:

```json
{
  "plugins": [
    "/Users/<you>/.prettier-lava/node_modules/prettier-plugin-rock-lava/dist/index.js"
  ]
}
```

> A bare package name does **not** work for a global config — Prettier resolves
> plugins relative to the file being formatted, so you must use the absolute
> path to `dist/index.js`.

Update later with:

```bash
cd ~/.prettier-lava && npm install prettier-plugin-rock-lava@latest
```

### CLI

```bash
prettier --write "**/*.lava"
```

The plugin registers the `.lava` extension and the `lava` / `Lava` VS Code
language IDs automatically, so no `overrides` block is required. If your files
use a different extension, add:

```json
{
  "overrides": [{ "files": "*.lava", "options": { "parser": "lava-html" } }]
}
```

### VS Code setup

Install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode),
then configure it for whichever scope suits you — a single project, a whole
workspace, or a VS Code **profile**. In all cases the Prettier extension
resolves the plugin from the `plugins` entry in the `.prettierrc` it loads, so
the same config powers both the CLI and the editor.

#### Per-project (the repo has its own Prettier config)

If the Lava project is a JS project (or you don't mind a `node_modules`), install
the plugin locally and add a project `.prettierrc` with a `plugins` entry. Then
add to the repo's `.vscode/settings.json`:

```json
{
  "[lava]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "files.associations": {
    "*.lava": "lava"
  },
  "prettier.documentSelectors": ["**/*.lava"]
}
```

Prettier finds the project's `.prettierrc` by walking up from each file, so no
`prettier.configPath` is needed here.

#### Workspace / global (using the shared `~/.prettierrc.json` from above)

When you rely on the global `~/.prettierrc.json` (the [Global setup](#global-setup-no-per-project-node_modules)),
point the extension at it with `prettier.configPath`. Put this in a workspace
`.vscode/settings.json` to scope it to one project, or in your **User**
`settings.json` to apply everywhere:

```json
{
  "prettier.configPath": "~/.prettierrc.json",
  "prettier.resolveGlobalModules": true,
  "prettier.documentSelectors": ["**/*.lava"],
  "[lava]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

> **Use the `~/` form, not an absolute path.** Prettier auto-discovers
> `~/.prettierrc.json` for any *saved* file under your home directory, so saved
> `.lava` files format either way. But **new, unsaved (untitled) files have no
> path on disk**, and the extension can only resolve `configPath` for them when
> it starts with `~` on macOS — an absolute path is silently dropped for
> untitled docs. Writing `~/.prettierrc.json` makes new files set to the Lava
> language mode format too.
>
> Setting `prettier.configPath` at the **User** level forces that one config for
> *every* project (it overrides each project's own `.prettierrc`). If you also
> work in non-Lava projects, prefer the workspace or profile scope below.

#### VS Code profile

A [VS Code profile](https://code.visualstudio.com/docs/editor/profiles) is the
cleanest way to enable this only when you want it: the settings apply when the
profile is active and leave no global footprint otherwise. Create (or open) a
"Rock Lava" profile, then add the same block as above to **that profile's**
`settings.json` (Command Palette → _Preferences: Open Settings (JSON)_ while the
profile is active):

```json
{
  "prettier.configPath": "~/.prettierrc.json",
  "prettier.resolveGlobalModules": true,
  "prettier.documentSelectors": ["**/*.lava"],
  "[lava]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

#### Untitled / brand-new files

If a freshly created untitled file (language mode set to Lava, never saved)
shows _"Prettier … is configured as formatter but it cannot format
'Lava'-files,"_ that's a registration quirk in the Prettier extension — at
startup it only registers its built-in languages, and it adds `lava` only after
it has loaded the plugin config for a **saved file in an open workspace folder**
(untitled docs don't trigger this). To work around it, once per window:

- open a workspace **folder** (not just loose files), and
- click into any **saved** file once (a `.lava` file is ideal) — this registers
  `lava` for the rest of the session, after which untitled Lava files format.

Saving the scratch file as `something.lava` also formats it immediately, since
it then has a path on disk.

<!-- ## Playground

You can try it out in your browser in the [playground](https://shopify.github.io/prettier-plugin-liquid/). -->

## Configuration

Prettier for Lava supports the following options.

| Name                        | Default | Description                                                                                                                                                      |
| --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `printWidth`                | `600`   | Changed from Prettier's default (`80`) ([see prettier docs](https://prettier.io/docs/en/options.html#print-width))                                               |
| `tabWidth`                  | `4`     | Changed from Prettier's default (`2`) ([see prettier docs](https://prettier.io/docs/en/options.html#tab-width))                                                  |
| `useTabs`                   | `false` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#tabs))                                                                         |
| `singleQuote`               | `false` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#quotes))                                                                       |
| `lavaSingleQuote`           | `true`  | Use single quotes instead of double quotes in Lava tag and objects (since v0.2.0).                                                                               |
| `embeddedSingleQuote`       | `true`  | Use single quotes instead of double quotes in embedded languages (JavaScript, CSS, TypeScript inside `<script>`, `<style>` or Liquid equivalent) (since v0.4.0). |
| `htmlWhitespaceSensitivity` | `css`   | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#html-whitespace-sensitivity))                                                  |
| `singleLineLinkTags`        | `false` | If set to `true`, will print `<link>` tags on a single line to remove clutter                                                                                    |

## Ignoring code

We support the following comments (either via HTML or Lava comments):

- `prettier-ignore`
- `prettier-ignore-attribute`
- `prettier-ignore-attributes` (alias)

They target the next node in the tree. Unparseable code can't be ignored and will throw an error.

```liquid
{% # prettier-ignore %}
<div         class="x"       >hello world</div            >

{% # prettier-ignore-attributes %}
<div
  [[#if Condition]]
    class="a b c"
  [[/if ]]
></div>
```

## Known issues

Take a look at our [known issues](./KNOWN_ISSUES.md) and [open issues](https://github.com/pbassham/prettier-plugin-rock-lava/issues).

## Contributing

[Read our contributing guide](CONTRIBUTING.md)

## Acknowledgments

This plugin builds on the original Lava fork created by Garrett Johnson, who
first adapted Prettier's Liquid formatting to Rock RMS Lava. Many thanks for
that foundation.

## License

MIT.
