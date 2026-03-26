# on-filter

A GitHub Actions action that lets you use the standard `on` event syntax as a **job-level filter**.

## Overview

GitHub Actions `on` filters (branches, tags, paths, types) only work at the workflow level. `on-filter` brings the same syntax down to the job level, so you can conditionally run individual jobs without duplicating workflows or writing complex conditional expressions.

## Usage

```yaml
jobs:
  check:
    runs-on: ubuntu-latest
    outputs:
      result: ${{ steps.filter.outputs.result }}
    steps:
      - uses: kyo-ago/on-filter@main
        id: filter
        with:
          on: |
            push:
              branches: [main]
              paths: ['src/**']
          token: ${{ github.token }}

  build:
    needs: check
    if: needs.check.outputs.result == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Running build"
```

## Inputs

| Input   | Required | Default              | Description |
|---------|----------|----------------------|-------------|
| `on`    | Yes      | —                    | Filter condition in GitHub Actions `on` syntax (YAML string) |
| `token` | No       | `${{ github.token }}` | GitHub token used to fetch changed files for `paths` filters on pull requests |

## Outputs

| Output   | Description |
|----------|-------------|
| `result` | `"true"` if the current event matches the filter, `"false"` otherwise |

## Supported filters

The `on` input accepts the same syntax as the workflow-level `on` key.

| Filter          | Supported events |
|-----------------|-----------------|
| `branches`      | `push`, `pull_request` |
| `branches-ignore` | `push`, `pull_request` |
| `tags`          | `push` |
| `tags-ignore`   | `push` |
| `paths`         | `push`, `pull_request` |
| `paths-ignore`  | `push`, `pull_request` |
| `types`         | `pull_request` |

Glob patterns (e.g. `src/**`, `v[0-9]*`) are supported for all filter fields.

## Examples

**Push to main branch:**
```yaml
on: |
  push:
    branches: [main]
```

**Pull request opened or synchronized targeting main:**
```yaml
on: |
  pull_request:
    branches: [main]
    types: [opened, synchronize]
```

**Push tag matching `v*` but not release candidates:**
```yaml
on: |
  push:
    tags:
      - 'v*'
    tags-ignore:
      - '*-rc*'
```

**Push with changes under `src/`:**
```yaml
on: |
  push:
    paths:
      - 'src/**'
```

**Push ignoring `docs/` changes:**
```yaml
on: |
  push:
    paths-ignore:
      - 'docs/**'
```

**Any pull request (no sub-filters):**
```yaml
on: |
  pull_request:
```

## Development

### Prerequisites

- Node.js 24 (see `.nvmrc`)

### Setup

```bash
npm ci
```

### Commands

| Command              | Description |
|----------------------|-------------|
| `npm test`           | Run unit tests |
| `npm run lint`       | Run ESLint |
| `npm run format`     | Check formatting with Prettier |
| `npm run build`      | Compile TypeScript and bundle to `dist/index.js` |
| `npm run all`        | Run format, lint, test, and build |
| `npm run e2e:generate` | Generate E2E test artifacts from specs |
| `npm run e2e:check`  | Verify generated artifacts are up to date |

### E2E testing

E2E test specifications live in `e2e/specs/*.yml`. Each spec defines a filter and is the single source of truth for E2E checks.

- `npm run e2e:generate` produces action input YAMLs under `e2e/generated/on-filter/` and oracle workflows under `e2e/generated/oracle-workflows/`.
- `npm run e2e:check` regenerates artifacts and fails if any diff is detected.
- CI enforces both that generated files are up to date and that `dist/` reflects the latest build.

## License

MIT
