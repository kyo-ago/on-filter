import { matchTags } from '../../src/matchers/tags';
import { ActionContext } from '../../src/types';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

function makeTagContext(ref: string): ActionContext {
  return {
    eventName: 'push',
    ref,
    repo: { owner: 'test', repo: 'test' },
  };
}

describe('matchTags', () => {
  it('passes when no tags filter', () => {
    const result = matchTags(makeTagContext('refs/heads/main'), {});
    expect(result.matched).toBe(true);
  });

  it('matches exact tag name', () => {
    const result = matchTags(makeTagContext('refs/tags/v1.0'), {
      tags: ['v1.0'],
    });
    expect(result.matched).toBe(true);
  });

  it('does not match different tag', () => {
    const result = matchTags(makeTagContext('refs/tags/v2.0'), {
      tags: ['v1.*'],
    });
    expect(result.matched).toBe(false);
  });

  it('matches wildcard tag pattern', () => {
    const result = matchTags(makeTagContext('refs/tags/v1.2.3'), {
      tags: ['v*'],
    });
    expect(result.matched).toBe(true);
  });

  it('returns false when ref is not a tag but tags filter exists', () => {
    const result = matchTags(makeTagContext('refs/heads/main'), {
      tags: ['v*'],
    });
    expect(result.matched).toBe(false);
  });

  it('passes when ref is not a tag and only tags-ignore exists', () => {
    const result = matchTags(makeTagContext('refs/heads/main'), {
      'tags-ignore': ['v*'],
    });
    expect(result.matched).toBe(true);
  });

  describe('tags-ignore', () => {
    it('excludes matching tag', () => {
      const result = matchTags(makeTagContext('refs/tags/v0.1-alpha'), {
        'tags-ignore': ['*-alpha'],
      });
      expect(result.matched).toBe(false);
    });

    it('includes non-matching tag', () => {
      const result = matchTags(makeTagContext('refs/tags/v1.0'), {
        'tags-ignore': ['*-alpha'],
      });
      expect(result.matched).toBe(true);
    });
  });

  it('matches double star pattern for nested tags', () => {
    const result = matchTags(makeTagContext('refs/tags/releases/v1/patch'), {
      tags: ['releases/**'],
    });
    expect(result.matched).toBe(true);
  });
});
