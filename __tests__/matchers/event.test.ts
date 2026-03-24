import { matchEvent } from '../../src/matchers/event';
import { OnFilter } from '../../src/types';

jest.mock('@actions/core');

test.each<[string, OnFilter, boolean]>([
  ['push', { push: null }, true],
  ['push', { pull_request: null }, false],
  ['pull_request', { push: null, pull_request: null }, true],
  ['schedule', { push: null }, false],
])('matchEvent(%s) => matched=%s', (eventName, filter, expected) => {
  expect(matchEvent(eventName, filter).matched).toBe(expected);
});
