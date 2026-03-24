import * as core from '@actions/core';
import picomatch from 'picomatch';
import { ActionContext, EventFilter, FilterResult } from '../types';

function getBranchName(context: ActionContext): string | null {
  const { eventName } = context;

  if (eventName === 'pull_request' || eventName === 'pull_request_target') {
    if (context.pullRequest) {
      return context.pullRequest.baseRef;
    }
    return null;
  }

  if (context.ref.startsWith('refs/heads/')) {
    return context.ref.replace('refs/heads/', '');
  }

  return null;
}

function matchPatterns(branchName: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    const isMatch = picomatch(pattern, { dot: true });
    if (isMatch(branchName)) {
      core.debug(`Branch '${branchName}' matches pattern '${pattern}'`);
      return true;
    }
  }
  return false;
}

export function matchBranches(context: ActionContext, filter: EventFilter): FilterResult {
  const branches = filter.branches;
  const branchesIgnore = filter['branches-ignore'];

  if (!branches && !branchesIgnore) {
    return { matched: true, reason: 'No branches filter specified' };
  }

  const branchName = getBranchName(context);

  if (branchName === null) {
    return { matched: false, reason: 'Could not determine branch name from context' };
  }

  core.debug(`Branch name: ${branchName}`);

  if (branches) {
    core.debug(`Matching branch against include patterns: ${JSON.stringify(branches)}`);
    if (matchPatterns(branchName, branches)) {
      return { matched: true, reason: `Branch '${branchName}' matches branches filter` };
    }
    return {
      matched: false,
      reason: `Branch '${branchName}' does not match any branches pattern`,
    };
  }

  if (branchesIgnore) {
    core.debug(`Matching branch against ignore patterns: ${JSON.stringify(branchesIgnore)}`);
    if (matchPatterns(branchName, branchesIgnore)) {
      return {
        matched: false,
        reason: `Branch '${branchName}' matches branches-ignore filter`,
      };
    }
    return {
      matched: true,
      reason: `Branch '${branchName}' does not match any branches-ignore pattern`,
    };
  }

  return { matched: true, reason: 'No branches filter applied' };
}
