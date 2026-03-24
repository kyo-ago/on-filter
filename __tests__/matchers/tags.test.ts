import { matchTags } from '../../src/matchers/tags';
import { ActionContext, EventFilter } from '../../src/types';

jest.mock('@actions/core');

function makeTagContext(ref: string): ActionContext {
  return {
    eventName: 'push',
    ref,
    repo: { owner: 'test', repo: 'test' },
  };
}

test.each<[string, EventFilter, boolean]>([
  ['refs/heads/main', {}, true],
  ['refs/tags/v1.0', { tags: ['v1.0'] }, true],
  ['refs/tags/v2.0', { tags: ['v1.*'] }, false],
  ['refs/tags/v1.2.3', { tags: ['v*'] }, true],
  ['refs/heads/main', { tags: ['v*'] }, false],
  ['refs/heads/main', { 'tags-ignore': ['v*'] }, true],
  ['refs/tags/releases/v1/patch', { tags: ['releases/**'] }, true],
])('matchTags(%s, filter) => matched=%s', (ref, filter, expected) => {
  expect(matchTags(makeTagContext(ref), filter).matched).toBe(expected);
});

describe('tags-ignore', () => {
  test.each<[string, EventFilter, boolean]>([
    ['refs/tags/v0.1-alpha', { 'tags-ignore': ['*-alpha'] }, false],
    ['refs/tags/v1.0', { 'tags-ignore': ['*-alpha'] }, true],
  ])('ref=%s => matched=%s', (ref, filter, expected) => {
    expect(matchTags(makeTagContext(ref), filter).matched).toBe(expected);
  });
});
