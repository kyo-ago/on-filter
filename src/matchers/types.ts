import * as core from '@actions/core';
import { EventFilter, FilterResult } from '../types';

export function matchTypes(action: string | undefined, filter: EventFilter): FilterResult {
  if (!filter.types) {
    return { matched: true, reason: 'No types filter specified' };
  }

  core.debug(`Matching action '${action}' against types: ${JSON.stringify(filter.types)}`);

  if (!action) {
    return { matched: false, reason: 'No action in event payload but types filter specified' };
  }

  if (filter.types.includes(action)) {
    return { matched: true, reason: `Action '${action}' matches types filter` };
  }

  return {
    matched: false,
    reason: `Action '${action}' not in types [${filter.types.join(', ')}]`,
  };
}
