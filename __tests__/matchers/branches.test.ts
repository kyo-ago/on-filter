import { matchBranches } from '../../src/matchers/branches';
import { ActionContext, EventFilter } from '../../src/types';

jest.mock('@actions/core');

function makePushContext(ref: string): ActionContext {
  return {
    eventName: 'push',
    ref,
    repo: { owner: 'test', repo: 'test' },
  };
}

function makePrContext(baseRef: string): ActionContext {
  return {
    eventName: 'pull_request',
    ref: 'refs/pull/1/merge',
    pullRequest: { number: 1, baseRef },
    repo: { owner: 'test', repo: 'test' },
  };
}

it('passes when no branches filter', () => {
  expect(matchBranches(makePushContext('refs/heads/main'), {}).matched).toBe(true);
});

it('returns not matched when ref is a tag', () => {
  expect(matchBranches(makePushContext('refs/tags/v1.0'), { branches: ['main'] }).matched).toBe(
    false
  );
});

describe('push event', () => {
  test.each<[string, EventFilter, boolean]>([
    ['refs/heads/main', { branches: ['main'] }, true],
    ['refs/heads/develop', { branches: ['main'] }, false],
    ['refs/heads/feature/test', { branches: ['feature/**'] }, true],
    ['refs/heads/release-v1', { branches: ['release-*'] }, true],
    ['refs/heads/feature/test', { branches: ['feature*'] }, false],
    ['refs/heads/releases/v1/patch', { branches: ['releases/**'] }, true],
  ])('ref=%s => matched=%s', (ref, filter, expected) => {
    expect(matchBranches(makePushContext(ref), filter).matched).toBe(expected);
  });
});

describe('branches-ignore', () => {
  test.each<[string, EventFilter, boolean]>([
    ['refs/heads/temp-branch', { 'branches-ignore': ['temp-*'] }, false],
    ['refs/heads/main', { 'branches-ignore': ['temp-*'] }, true],
  ])('ref=%s => matched=%s', (ref, filter, expected) => {
    expect(matchBranches(makePushContext(ref), filter).matched).toBe(expected);
  });
});

describe('pull_request event', () => {
  test.each<[string, EventFilter, boolean]>([
    ['main', { branches: ['main'] }, true],
    ['develop', { branches: ['main'] }, false],
  ])('baseRef=%s => matched=%s', (baseRef, filter, expected) => {
    expect(matchBranches(makePrContext(baseRef), filter).matched).toBe(expected);
  });
});
