# Contributing to prettier-plugin-lava

Requirements:

- Node v16+
- Bun

```
git clone git@github.com:pbassham/prettier-plugin-lava
bun install
bun test
```

## Context

There's a lot of abstract concepts that goes into making this plugin.

- Take a look at our plugin's [principles](./docs/principles/index.md).
- Read [HOW_IT_WORKS.md](HOW_IT_WORKS.md) for a technical overview.
- Read [Whitespace Handling](./docs/whitespace-handling.md) for an overview of how we deal with that internally.

The source code for this plugin is in TypeScript.

## Standards

- PR should explain what the feature does, and why the change exists.
- PR should include any carrier specific documentation explaining how it works.
- Code should be generic and reusable.

## Formating

This plugin uses prettier to format its TypeScript codebase. To format your code before a commit, run the following command:

```
bun run format
```

## Testing

This prettier plugin has two suites of tests: unit tests (`src/**/*.spec.ts`) and integration tests (`test/**/*.spec.ts`).

To run all tests:

```bash
bun run test
```

To run the idempotence tests (formatting an already-formatted file is a no-op):

```bash
bun run test:idempotence
```

To run from source on another repo or file:

```bash
# build the code so you can run it (only need to do it once)
bun run build

# run prettier on a file or folder
prettier --plugin . --write path/to/files.lava
```

## Running from source on another code base

### Adding new integration tests

- Copy any of the folder in the `test/` directory and rename it to something appropriate.
- In the `index.lava` file, type code that should be made prettier
- In the `fixed.lava` file, type what you'd expect the plugin to output

## How to contribute

1. Fork it ( https://github.com/pbassham/prettier-plugin-lava/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
