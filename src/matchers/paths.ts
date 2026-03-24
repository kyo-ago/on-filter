import * as core from '@actions/core';
import picomatch from 'picomatch';
import { ActionContext, EventFilter, FilterResult } from '../types';
import { getChangedFilesFromApi } from '../changed-files/api';
import { getChangedFilesFromGit } from '../changed-files/git';

async function getChangedFiles(context: ActionContext, token: string): Promise<string[]> {
  if (context.eventName === 'pull_request' || context.eventName === 'pull_request_target') {
    if (!context.pullRequest) {
      throw new Error('pull_request event but no pull request data in context');
    }
    return getChangedFilesFromApi(
      token,
      context.repo.owner,
      context.repo.repo,
      context.pullRequest.number
    );
  }

  if (context.eventName === 'push') {
    if (!context.push) {
      throw new Error('push event but no push data in context');
    }
    return getChangedFilesFromGit(context.push.before, context.push.after);
  }

  throw new Error(`paths filter is not supported for event '${context.eventName}'`);
}

function fileMatchesPatterns(file: string, patterns: string[]): boolean {
  const negativePatterns: string[] = [];
  const positivePatterns: string[] = [];

  for (const pattern of patterns) {
    if (pattern.startsWith('!')) {
      negativePatterns.push(pattern.slice(1));
    } else {
      positivePatterns.push(pattern);
    }
  }

  let matched = false;

  if (positivePatterns.length > 0) {
    const isMatch = picomatch(positivePatterns, { dot: true });
    matched = isMatch(file);
  }

  if (matched && negativePatterns.length > 0) {
    const isNegMatch = picomatch(negativePatterns, { dot: true });
    if (isNegMatch(file)) {
      matched = false;
    }
  }

  return matched;
}

export async function matchPaths(
  context: ActionContext,
  filter: EventFilter,
  token: string
): Promise<FilterResult> {
  const paths = filter.paths;
  const pathsIgnore = filter['paths-ignore'];

  if (!paths && !pathsIgnore) {
    return { matched: true, reason: 'No paths filter specified' };
  }

  const changedFiles = await getChangedFiles(context, token);
  core.debug(`Changed files (${changedFiles.length}): ${JSON.stringify(changedFiles)}`);

  if (changedFiles.length === 0) {
    if (paths) {
      return { matched: false, reason: 'No changed files and paths filter is specified' };
    }
    return { matched: true, reason: 'No changed files and only paths-ignore is specified' };
  }

  if (paths) {
    core.debug(`Matching changed files against paths: ${JSON.stringify(paths)}`);
    const anyMatch = changedFiles.some((file) => fileMatchesPatterns(file, paths));
    if (anyMatch) {
      return { matched: true, reason: 'At least one changed file matches paths filter' };
    }
    return { matched: false, reason: 'No changed file matches paths filter' };
  }

  if (pathsIgnore) {
    core.debug(
      `Matching changed files against paths-ignore: ${JSON.stringify(pathsIgnore)}`
    );
    const allIgnored = changedFiles.every((file) => fileMatchesPatterns(file, pathsIgnore));
    if (allIgnored) {
      return { matched: false, reason: 'All changed files match paths-ignore filter' };
    }
    return {
      matched: true,
      reason: 'At least one changed file does not match paths-ignore filter',
    };
  }

  return { matched: true, reason: 'No paths filter applied' };
}
