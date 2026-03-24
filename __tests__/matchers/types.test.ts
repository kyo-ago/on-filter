import { matchTypes } from '../../src/matchers/types';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

describe('matchTypes', () => {
  it('passes when no types filter', () => {
    const result = matchTypes('opened', {});
    expect(result.matched).toBe(true);
  });

  it('matches when action is in types', () => {
    const result = matchTypes('opened', { types: ['opened', 'synchronize'] });
    expect(result.matched).toBe(true);
  });

  it('does not match when action is not in types', () => {
    const result = matchTypes('closed', { types: ['opened', 'synchronize'] });
    expect(result.matched).toBe(false);
  });

  it('does not match when no action but types specified', () => {
    const result = matchTypes(undefined, { types: ['opened'] });
    expect(result.matched).toBe(false);
  });
});
