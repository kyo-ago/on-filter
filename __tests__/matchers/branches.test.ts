import { matchBranches } from '../../src/matchers/branches';
import { ActionContext } from '../../src/types';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

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

describe('matchBranches', () => {
  it('passes when no branches filter', () => {
    const result = matchBranches(makePushContext('refs/heads/main'), {});
    expect(result.matched).toBe(true);
  });

  describe('push event', () => {
    it('matches exact branch name', () => {
      const result = matchBranches(makePushContext('refs/heads/main'), {
        branches: ['main'],
      });
      expect(result.matched).toBe(true);
    });

    it('does not match different branch', () => {
      const result = matchBranches(makePushContext('refs/heads/develop'), {
        branches: ['main'],
      });
      expect(result.matched).toBe(false);
    });

    it('matches wildcard pattern', () => {
      const result = matchBranches(makePushContext('refs/heads/feature/test'), {
        branches: ['feature/**'],
      });
      expect(result.matched).toBe(true);
    });

    it('matches single-star pattern', () => {
      const result = matchBranches(makePushContext('refs/heads/release-v1'), {
        branches: ['release-*'],
      });
      expect(result.matched).toBe(true);
    });

    it('single star does not match slashes', () => {
      const result = matchBranches(makePushContext('refs/heads/feature/test'), {
        branches: ['feature*'],
      });
      expect(result.matched).toBe(false);
    });

    it('double star matches deep paths', () => {
      const result = matchBranches(makePushContext('refs/heads/releases/v1/patch'), {
        branches: ['releases/**'],
      });
      expect(result.matched).toBe(true);
    });
  });

  describe('branches-ignore', () => {
    it('excludes matching branch', () => {
      const result = matchBranches(makePushContext('refs/heads/temp-branch'), {
        'branches-ignore': ['temp-*'],
      });
      expect(result.matched).toBe(false);
    });

    it('includes non-matching branch', () => {
      const result = matchBranches(makePushContext('refs/heads/main'), {
        'branches-ignore': ['temp-*'],
      });
      expect(result.matched).toBe(true);
    });
  });

  describe('pull_request event', () => {
    it('matches base branch', () => {
      const result = matchBranches(makePrContext('main'), {
        branches: ['main'],
      });
      expect(result.matched).toBe(true);
    });

    it('does not match different base branch', () => {
      const result = matchBranches(makePrContext('develop'), {
        branches: ['main'],
      });
      expect(result.matched).toBe(false);
    });
  });

  it('returns not matched when ref is a tag', () => {
    const result = matchBranches(makePushContext('refs/tags/v1.0'), {
      branches: ['main'],
    });
    expect(result.matched).toBe(false);
  });
});
