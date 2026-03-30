import { matchPaths } from '../../src/matchers/paths';
import { ActionContext } from '../../src/types';

jest.mock('@actions/core');

jest.mock('../../src/changed-files/api', () => ({
  getChangedFilesFromApi: jest.fn(),
}));

jest.mock('../../src/changed-files/git', () => ({
  getChangedFilesFromGit: jest.fn(),
}));

import { getChangedFilesFromApi } from '../../src/changed-files/api';
import { getChangedFilesFromGit } from '../../src/changed-files/git';

const mockedApiFiles = getChangedFilesFromApi as jest.MockedFunction<
  typeof getChangedFilesFromApi
>;
const mockedGitFiles = getChangedFilesFromGit as jest.MockedFunction<
  typeof getChangedFilesFromGit
>;

function makePushContext(): ActionContext {
  return {
    eventName: 'push',
    ref: 'refs/heads/main',
    push: { before: 'abc123', after: 'def456' },
    repo: { owner: 'test', repo: 'test' },
  };
}

function makePrContext(): ActionContext {
  return {
    eventName: 'pull_request',
    ref: 'refs/pull/1/merge',
    pullRequest: { number: 1, baseRef: 'main' },
    repo: { owner: 'test', repo: 'test' },
  };
}

describe('matchPaths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes when no paths filter', async () => {
    const result = await matchPaths(makePushContext(), {}, 'token');
    expect(result.matched).toBe(true);
  });

  describe('push event', () => {
    it('matches when changed file matches paths', async () => {
      mockedGitFiles.mockResolvedValue(['src/main.ts', 'README.md']);
      const result = await matchPaths(makePushContext(), { paths: ['src/**'] }, 'token');
      expect(result.matched).toBe(true);
    });

    it('does not match when no changed file matches paths', async () => {
      mockedGitFiles.mockResolvedValue(['README.md', 'docs/guide.md']);
      const result = await matchPaths(makePushContext(), { paths: ['src/**'] }, 'token');
      expect(result.matched).toBe(false);
    });

    it('does not match when no changed files', async () => {
      mockedGitFiles.mockResolvedValue([]);
      const result = await matchPaths(makePushContext(), { paths: ['src/**'] }, 'token');
      expect(result.matched).toBe(false);
    });
  });

  describe('pull_request event', () => {
    it('uses API to get changed files', async () => {
      mockedApiFiles.mockResolvedValue(['src/index.ts']);
      const result = await matchPaths(makePrContext(), { paths: ['src/**'] }, 'token');
      expect(result.matched).toBe(true);
      expect(mockedApiFiles).toHaveBeenCalledWith('token', 'test', 'test', 1);
    });
  });

  describe('paths-ignore', () => {
    it('matches when not all files are ignored', async () => {
      mockedGitFiles.mockResolvedValue(['src/main.ts', 'docs/readme.md']);
      const result = await matchPaths(
        makePushContext(),
        { 'paths-ignore': ['docs/**'] },
        'token'
      );
      expect(result.matched).toBe(true);
    });

    it('does not match when all files are ignored', async () => {
      mockedGitFiles.mockResolvedValue(['docs/readme.md', 'docs/guide.md']);
      const result = await matchPaths(
        makePushContext(),
        { 'paths-ignore': ['docs/**'] },
        'token'
      );
      expect(result.matched).toBe(false);
    });

    it('does not match when no changed files and paths-ignore', async () => {
      mockedGitFiles.mockResolvedValue([]);
      const result = await matchPaths(
        makePushContext(),
        { 'paths-ignore': ['docs/**'] },
        'token'
      );
      expect(result.matched).toBe(false);
    });
  });

  describe('negation patterns', () => {
    it('negation pattern excludes previously matched files', async () => {
      mockedGitFiles.mockResolvedValue(['src/main.ts', 'src/generated/output.ts']);
      const result = await matchPaths(
        makePushContext(),
        { paths: ['src/**', '!src/generated/**'] },
        'token'
      );
      expect(result.matched).toBe(true); // src/main.ts still matches
    });

    it('all files negated means no match', async () => {
      mockedGitFiles.mockResolvedValue(['src/generated/output.ts']);
      const result = await matchPaths(
        makePushContext(),
        { paths: ['src/**', '!src/generated/**'] },
        'token'
      );
      expect(result.matched).toBe(false);
    });
  });

  it('throws for unsupported event', async () => {
    const ctx: ActionContext = {
      eventName: 'schedule',
      ref: '',
      repo: { owner: 'test', repo: 'test' },
    };
    await expect(matchPaths(ctx, { paths: ['src/**'] }, 'token')).rejects.toThrow(
      'not supported'
    );
  });

  describe('dot files', () => {
    it('matches dot files with ** pattern', async () => {
      mockedGitFiles.mockResolvedValue(['.github/workflows/ci.yml']);
      const result = await matchPaths(
        makePushContext(),
        { paths: ['.github/**'] },
        'token'
      );
      expect(result.matched).toBe(true);
    });
  });
});
