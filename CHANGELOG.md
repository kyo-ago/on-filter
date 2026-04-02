# Changelog

## [v0.0.2](https://github.com/kyo-ago/on-filter/compare/v0.0.1...v0.0.2) - 2026-04-02
- Add tagpr for automated release management by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/11
- Add tagpr outputs and action-update-semver for semver tag management by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/12
- security: pin GitHub Actions to commit SHAs and add explicit permissions by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/13
- Disable credential persistence in E2E workflow checkout by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/14
- fix: create unique commits for tag pushes in trigger-e2e to avoid SHA collision by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/16
- fix: use GitHub App token in tagpr to allow PR creation by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/18
- Update CI/CD workflows: Node.js 24 and ubuntu-slim runner by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/21
- Expand e2e test coverage for workflow trigger filters by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/22
- Fix paths-ignore matching logic when no files are changed by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/23
- Upgrade actions/create-github-app-token to v3.0.0 by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/25
- Remove tag-based triggers from verify workflow by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/26

## [v0.0.1](https://github.com/kyo-ago/on-filter/commits/v0.0.1) - 2026-03-26
- Implement on-filter GitHub Action by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/4
- Generate E2E trigger artifacts and enforce generation in CI by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/6
- Add E2E verification and trigger workflows for on-filter testing by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/8
- Add comprehensive README with usage, inputs/outputs, examples, and dev guide by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/9
- fix: avoid duplicate CI runs on push+pull_request by @kyo-ago in https://github.com/kyo-ago/on-filter/pull/10
