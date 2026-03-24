import { matchEvent } from '../../src/matchers/event';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

describe('matchEvent', () => {
  it('matches when event name is in filter', () => {
    const result = matchEvent('push', { push: null });
    expect(result.matched).toBe(true);
  });

  it('does not match when event name is not in filter', () => {
    const result = matchEvent('push', { pull_request: null });
    expect(result.matched).toBe(false);
  });

  it('matches with multiple events', () => {
    const result = matchEvent('pull_request', {
      push: null,
      pull_request: null,
    });
    expect(result.matched).toBe(true);
  });

  it('does not match unknown event', () => {
    const result = matchEvent('schedule', { push: null });
    expect(result.matched).toBe(false);
  });
});
