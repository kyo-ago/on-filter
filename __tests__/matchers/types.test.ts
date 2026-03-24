import { matchTypes } from '../../src/matchers/types';
import { EventFilter } from '../../src/types';

jest.mock('@actions/core');

test.each<[string | undefined, EventFilter, boolean]>([
  ['opened', {}, true],
  ['opened', { types: ['opened', 'synchronize'] }, true],
  ['closed', { types: ['opened', 'synchronize'] }, false],
  [undefined, { types: ['opened'] }, false],
])('matchTypes(%s, filter) => matched=%s', (action, filter, expected) => {
  expect(matchTypes(action, filter).matched).toBe(expected);
});
