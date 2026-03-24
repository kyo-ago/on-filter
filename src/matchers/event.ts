import * as core from '@actions/core';
import { OnFilter, FilterResult } from '../types';

export function matchEvent(eventName: string, onFilter: OnFilter): FilterResult {
  const eventNames = Object.keys(onFilter);
  core.debug(`Event names in filter: ${JSON.stringify(eventNames)}`);
  core.debug(`Current event: ${eventName}`);

  if (eventNames.includes(eventName)) {
    return { matched: true, reason: `Event '${eventName}' matches filter` };
  }

  return {
    matched: false,
    reason: `Event '${eventName}' not in filter events [${eventNames.join(', ')}]`,
  };
}
