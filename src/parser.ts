import * as core from '@actions/core';
import * as yaml from 'js-yaml';
import { OnFilter, EventFilter } from './types';

const KNOWN_FILTER_KEYS = new Set([
  'types',
  'branches',
  'branches-ignore',
  'tags',
  'tags-ignore',
  'paths',
  'paths-ignore',
]);

export function parseOnFilter(input: string): OnFilter {
  const parsed = yaml.load(input);

  if (parsed === null || parsed === undefined) {
    throw new Error('Empty on filter definition');
  }

  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('on filter must be a YAML mapping');
  }

  const result: OnFilter = {};
  const record = parsed as Record<string, unknown>;

  for (const [eventName, filterDef] of Object.entries(record)) {
    if (filterDef === null || filterDef === undefined) {
      result[eventName] = null;
      continue;
    }

    if (typeof filterDef !== 'object' || Array.isArray(filterDef)) {
      throw new Error(`Filter for event '${eventName}' must be a YAML mapping or null`);
    }

    const filter = filterDef as Record<string, unknown>;
    const eventFilter: EventFilter = {};

    for (const [key, value] of Object.entries(filter)) {
      if (!KNOWN_FILTER_KEYS.has(key)) {
        core.warning(`Unknown filter key '${key}' in event '${eventName}'`);
        eventFilter[key] = value;
        continue;
      }

      if (!Array.isArray(value)) {
        throw new Error(`Filter key '${key}' in event '${eventName}' must be an array`);
      }

      const strArray = value.map((v) => String(v));
      (eventFilter as Record<string, unknown>)[key] = strArray;
    }

    if (eventFilter.branches && eventFilter['branches-ignore']) {
      throw new Error(
        `Event '${eventName}' cannot have both 'branches' and 'branches-ignore'`
      );
    }
    if (eventFilter.tags && eventFilter['tags-ignore']) {
      throw new Error(`Event '${eventName}' cannot have both 'tags' and 'tags-ignore'`);
    }
    if (eventFilter.paths && eventFilter['paths-ignore']) {
      throw new Error(`Event '${eventName}' cannot have both 'paths' and 'paths-ignore'`);
    }

    result[eventName] = eventFilter;
  }

  return result;
}
