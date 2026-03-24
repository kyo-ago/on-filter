import { parseOnFilter } from '../src/parser';

jest.mock('@actions/core');

test.each([
  ['push:', { push: null }],
  [
    'push:\n  branches: [main, develop]',
    { push: { branches: ['main', 'develop'] } },
  ],
  [
    'push:\n  branches-ignore: [temp-*]',
    { push: { 'branches-ignore': ['temp-*'] } },
  ],
  [
    "push:\n  paths: ['src/**', 'lib/**']",
    { push: { paths: ['src/**', 'lib/**'] } },
  ],
  [
    'pull_request:\n  types: [opened, synchronize]',
    { pull_request: { types: ['opened', 'synchronize'] } },
  ],
  [
    "push:\n  tags: ['v*']",
    { push: { tags: ['v*'] } },
  ],
  [
    'push:\n  branches: [main]\npull_request:\n  branches: [main]',
    { push: { branches: ['main'] }, pull_request: { branches: ['main'] } },
  ],
  [
    "push:\n  branches: [main]\n  paths: ['src/**']",
    { push: { branches: ['main'], paths: ['src/**'] } },
  ],
])('parses %s', (input, expected) => {
  expect(parseOnFilter(input)).toEqual(expected);
});

test.each([
  ['', 'Empty on filter definition'],
  ['hello', 'on filter must be a YAML mapping'],
  ['- push\n- pull_request', 'on filter must be a YAML mapping'],
  [
    'push:\n  branches: [main]\n  branches-ignore: [temp]',
    "cannot have both 'branches' and 'branches-ignore'",
  ],
  [
    "push:\n  tags: ['v*']\n  tags-ignore: ['v0.*']",
    "cannot have both 'tags' and 'tags-ignore'",
  ],
  [
    "push:\n  paths: ['src/**']\n  paths-ignore: ['docs/**']",
    "cannot have both 'paths' and 'paths-ignore'",
  ],
  ['push:\n  branches: main', 'must be an array'],
])('throws for invalid input: %s', (input, expectedError) => {
  expect(() => parseOnFilter(input)).toThrow(expectedError);
});

it('warns on unknown filter key', () => {
  const core = require('@actions/core');
  parseOnFilter('push:\n  branches: [main]\n  unknown-key: something');
  expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('Unknown filter key'));
});
