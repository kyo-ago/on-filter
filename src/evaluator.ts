import * as core from '@actions/core';
import { OnFilter, ActionContext } from './types';
import { matchEvent } from './matchers/event';
import { matchTypes } from './matchers/types';
import { matchBranches } from './matchers/branches';
import { matchTags } from './matchers/tags';
import { matchPaths } from './matchers/paths';

export async function evaluate(
  onFilter: OnFilter,
  context: ActionContext,
  token: string
): Promise<boolean> {
  core.debug(`Evaluating filter for event '${context.eventName}'`);
  core.debug(`Context: ${JSON.stringify(context)}`);

  // Step 1: Check event name
  const eventResult = matchEvent(context.eventName, onFilter);
  core.debug(`Event match: ${eventResult.matched} - ${eventResult.reason}`);
  if (!eventResult.matched) {
    return false;
  }

  // Step 2: Get event filter (null means no sub-filters, just event match)
  const eventFilter = onFilter[context.eventName];
  if (eventFilter === null || eventFilter === undefined) {
    core.debug('No sub-filters for event, matched by event name only');
    return true;
  }

  // Step 3: Check types
  const typesResult = matchTypes(context.action, eventFilter);
  core.debug(`Types match: ${typesResult.matched} - ${typesResult.reason}`);
  if (!typesResult.matched) {
    return false;
  }

  // Step 4: Check branches
  const branchesResult = matchBranches(context, eventFilter);
  core.debug(`Branches match: ${branchesResult.matched} - ${branchesResult.reason}`);
  if (!branchesResult.matched) {
    return false;
  }

  // Step 5: Check tags
  const tagsResult = matchTags(context, eventFilter);
  core.debug(`Tags match: ${tagsResult.matched} - ${tagsResult.reason}`);
  if (!tagsResult.matched) {
    return false;
  }

  // Step 6: Check paths
  const pathsResult = await matchPaths(context, eventFilter, token);
  core.debug(`Paths match: ${pathsResult.matched} - ${pathsResult.reason}`);
  if (!pathsResult.matched) {
    return false;
  }

  return true;
}
