# on-filter

## E2E trigger spec as single source of truth

`e2e/specs/*.yml` is the only source of truth for trigger definitions used in E2E checks.

- `npm run e2e:generate`
  - Generates the `on-filter` input YAML under `e2e/generated/on-filter/*.yml`.
  - Generates oracle workflow definitions under `e2e/generated/oracle-workflows/*.yml`.
- `npm run e2e:check`
  - Regenerates artifacts and fails if there is any diff in `e2e/generated/`.

CI runs `npm run e2e:check` so manual edits to generated files are detected and rejected.
