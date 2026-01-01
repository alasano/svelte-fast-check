# svelte-fast-check

Up to 24x faster type checker for Svelte/SvelteKit projects. Built with svelte2tsx + tsgo.

[한국어](./README.ko.md)

## Motivation

As our project grew, `svelte-check` became slow. We needed incremental builds and typescript-go support, but `svelte-check` has many considerations (Language Server compatibility, etc.) that make official support take time.

See also:

- [Incremental build support request](https://github.com/sveltejs/language-tools/issues/2131) (2023~)
- [typescript-go support request](https://github.com/sveltejs/language-tools/issues/2733) (Blocked)

## Benchmark

Measured on Watnee's melting project, M4 Pro.

**Project size:**

- Svelte: 282 files (63k lines)
- TypeScript: 741 files (119k lines)

| Command                                  | Time  | Comparison      |
| ---------------------------------------- | ----- | --------------- |
| `svelte-check`                           | 14.4s | baseline        |
| `svelte-fast-check`                      | 2.6s  | **5.5x faster** |
| `svelte-fast-check --incremental` (cold) | 6.0s  | 2.4x faster     |
| `svelte-fast-check --incremental` (warm) | 0.6s  | **24x faster**  |

> In warm state, type checking completes in 0.6 seconds - fast enough to run on every save.

## Installation

```bash
npm install -D svelte-fast-check
# or
bun add -D svelte-fast-check
```

## Usage

```bash
# Basic
npx svelte-fast-check

# Incremental mode (recommended)
npx svelte-fast-check --incremental

# Even faster with bun
bun svelte-fast-check --incremental
```

### CLI Options

| Option            | Short | Description                                            |
| ----------------- | ----- | ------------------------------------------------------ |
| `--incremental`   | `-i`  | Convert only changed files, use tsgo incremental build |
| `--raw`           | `-r`  | Show raw output without filtering/mapping              |
| `--config <path>` | `-c`  | Specify config file path                               |

## Configuration

Works out of the box for most projects. Automatically reads `paths` and `exclude` from `tsconfig.json`.

For custom configuration, create `svelte-fast-check.config.ts`:

```typescript
import type { FastCheckConfig } from 'svelte-fast-check';

export default {
  srcDir: './src',
  exclude: ['../src/**/*.test.ts'],
} satisfies FastCheckConfig;
```

## How It Works

```
.svelte files
     ↓
[svelte2tsx] parallel conversion
     ↓
.svelte.tsx files (.fast-check/tsx/)
     ↓
[tsgo] type check
     ↓
error list
     ↓
[filter] remove false positives from svelte2tsx generated code
     ↓
[map] convert to original .svelte locations via sourcemap
     ↓
final output
```

### Cache Structure

```
.fast-check/
├── tsx/           # converted .svelte.tsx files
├── maps/          # sourcemap files
├── tsconfig.json  # generated tsconfig
└── .tsbuildinfo   # tsgo incremental build info
```

## Non-Goals

`svelte-fast-check` focuses only on fast type checking. The following features are not supported:

- **Svelte compiler warnings** - `state_referenced_locally`, `css-unused-selector`, etc.
- **CSS diagnostics** - style-related checks
- **Language Server** - IDE autocompletion, hover info, go to definition, etc.
- **Watch mode** - file change detection and auto-rerun

For these features, use `svelte-check` or `svelte-language-server`.

## Limitations

- **tsgo is still in preview** - Experimental feature under development by the TypeScript team. Use with caution in production CI.
- **Some false positives may occur** - We filter false positives from svelte2tsx conversion, but it may not be perfect.

## Using with svelte-check

We recommend using `svelte-fast-check` for fast feedback during development, and `svelte-check` for accurate validation in CI:

```json
{
  "scripts": {
    "check": "svelte-fast-check --incremental",
    "check:ci": "svelte-check"
  }
}
```

## Credits

Built on [svelte2tsx](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx) and inspired by [svelte-check](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check) from [svelte-language-tools](https://github.com/sveltejs/language-tools).

## License

MIT License

Copyright (c) 2025 Song Jaehak (astralhpi)

---

Built at [melting.chat](https://melting.chat)
