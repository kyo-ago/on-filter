import { evaluate } from '../src/evaluator';
import { ActionContext, OnFilter } from '../src/types';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

jest.mock('../src/matchers/paths', () => ({
  matchPaths: jest.fn().mockResolvedValue({ matched: true, reason: 'mocked' }),
}));

import { matchPaths } from '../src/matchers/paths';
const mockedMatchPaths = matchPaths as jest.MockedFunction<typeof matchPaths>;

function makePushContext(ref = 'refs/heads/main'): ActionContext {
  return {
    eventName: 'push',
    ref,
    push: { before: 'abc', after: 'def' },
    repo: { owner: 'test', repo: 'test' },
  };
}

function makePrContext(baseRef = 'main', action = 'opened'): ActionContext {
  return {
    eventName: 'pull_request',
    ref: 'refs/pull/1/merge',
    action,
    pullRequest: { number: 1, baseRef },
    repo: { owner: 'test', repo: 'test' },
  };
}

describe('evaluate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMatchPaths.mockResolvedValue({ matched: true, reason: 'mocked' });
  });

  it('returns false when event does not match', async () => {
    const filter: OnFilter = { pull_request: null };
    const result = await evaluate(filter, makePushContext(), 'token');
    expect(result).toBe(false);
  });

  it('returns true when event matches with no sub-filters', async () => {
    const filter: OnFilter = { push: null };
    const result = await evaluate(filter, makePushContext(), 'token');
    expect(result).toBe(true);
  });

  it('returns true when all filters pass', async () => {
    const filter: OnFilter = {
      push: { branches: ['main'] },
    };
    const result = await evaluate(filter, makePushContext(), 'token');
    expect(result).toBe(true);
  });

  it('returns false when branch does not match', async () => {
    const filter: OnFilter = {
      push: { branches: ['develop'] },
    };
    const result = await evaluate(filter, makePushContext(), 'token');
    expect(result).toBe(false);
  });

  it('returns false when types do not match', async () => {
    const filter: OnFilter = {
      pull_request: { types: ['closed'] },
    };
    const result = await evaluate(filter, makePrContext('main', 'opened'), 'token');
    expect(result).toBe(false);
  });

  it('returns true with matching types', async () => {
    const filter: OnFilter = {
      pull_request: { types: ['opened', 'synchronize'] },
    };
    const result = await evaluate(filter, makePrContext('main', 'opened'), 'token');
    expect(result).toBe(true);
  });

  it('evaluates paths filter', async () => {
    mockedMatchPaths.mockResolvedValue({ matched: false, reason: 'no match' });
    const filter: OnFilter = {
      push: { paths: ['src/**'] },
    };
    const result = await evaluate(filter, makePushContext(), 'token');
    expect(result).toBe(false);
  });

  it('returns false when tags filter does not match for branch push', async () => {
    const filter: OnFilter = {
      push: { tags: ['v*'] },
    };
    const result = await evaluate(filter, makePushContext('refs/heads/main'), 'token');
    expect(result).toBe(false);
  });

  it('returns true for tag push matching tags filter', async () => {
    const filter: OnFilter = {
      push: { tags: ['v*'] },
    };
    const ctx = makePushContext('refs/tags/v1.0.0');
    const result = await evaluate(filter, ctx, 'token');
    expect(result).toBe(true);
  });

  it('handles combined branches and paths filters', async () => {
    const filter: OnFilter = {
      push: { branches: ['main'], paths: ['src/**'] },
    };
    mockedMatchPaths.mockResolvedValue({ matched: true, reason: 'match' });
    const result = await evaluate(filter, makePushContext(), 'token');
    expect(result).toBe(true);
  });

  it('returns false when branch matches but paths do not', async () => {
    const filter: OnFilter = {
      push: { branches: ['main'], paths: ['src/**'] },
    };
    mockedMatchPaths.mockResolvedValue({ matched: false, reason: 'no match' });
    const result = await evaluate(filter, makePushContext(), 'token');
    expect(result).toBe(false);
  });
});
