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

## Can this be used in production?

Soon? Yes. Right now? No. We're still working on it. We're looking for feedback on the plugin. If you have any feedback, please open an issue.

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

## Using a local build in your other repositories

Until this fork is published to npm, you can consume it directly from a local
build. From this repo:

```bash
bun install
bun run build   # emits dist/ and standalone.js
```

Then, in the repository where you edit `.lava` files:

1. **Point Prettier at the plugin.** Add a `.prettierrc` (or `.prettierrc.json`)
   with an absolute or relative path to this folder:

   ```json
   {
     "plugins": ["/absolute/path/to/prettier-plugin-rock-lava"],
     "printWidth": 600,
     "tabWidth": 4
   }
   ```

   Alternatively, link it once with your package manager so a bare name works:

   ```bash
   # from prettier-plugin-rock-lava
   bun link
   # from your other repo
   bun link prettier-plugin-rock-lava
   ```

   then use `"plugins": ["prettier-plugin-rock-lava"]`.

2. **Associate `.lava` files.** The plugin registers the `.lava` extension and
   the `lava` / `Lava` VS Code language IDs automatically, so no `overrides`
   block is required. If your files use a different extension, add:

   ```json
   {
     "overrides": [{ "files": "*.lava", "options": { "parser": "lava-html" } }]
   }
   ```

3. **Format from the CLI:**

   ```bash
   prettier --write "**/*.lava"
   ```

### VS Code setup

Install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode),
then add to the target repo's `.vscode/settings.json`:

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

The Prettier extension resolves the plugin from the `plugins` entry in your
`.prettierrc`, so the same configuration powers both the CLI and the editor.

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
