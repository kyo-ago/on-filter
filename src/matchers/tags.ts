import * as core from '@actions/core';
import picomatch from 'picomatch';
import { ActionContext, EventFilter, FilterResult } from '../types';

function getTagName(context: ActionContext): string | null {
  if (context.ref.startsWith('refs/tags/')) {
    return context.ref.replace('refs/tags/', '');
  }
  return null;
}

function matchPatterns(tagName: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    const isMatch = picomatch(pattern, { dot: true });
    if (isMatch(tagName)) {
      core.debug(`Tag '${tagName}' matches pattern '${pattern}'`);
      return true;
    }
  }
  return false;
}

export function matchTags(context: ActionContext, filter: EventFilter): FilterResult {
  const tags = filter.tags;
  const tagsIgnore = filter['tags-ignore'];

  if (!tags && !tagsIgnore) {
    return { matched: true, reason: 'No tags filter specified' };
  }

  const tagName = getTagName(context);

  if (tagName === null) {
    if (tags) {
      return { matched: false, reason: 'Ref is not a tag but tags filter is specified' };
    }
    return { matched: true, reason: 'Ref is not a tag and only tags-ignore is specified' };
  }

  core.debug(`Tag name: ${tagName}`);

  if (tags) {
    core.debug(`Matching tag against include patterns: ${JSON.stringify(tags)}`);
    if (matchPatterns(tagName, tags)) {
      return { matched: true, reason: `Tag '${tagName}' matches tags filter` };
    }
    return { matched: false, reason: `Tag '${tagName}' does not match any tags pattern` };
  }

  if (tagsIgnore) {
    core.debug(`Matching tag against ignore patterns: ${JSON.stringify(tagsIgnore)}`);
    if (matchPatterns(tagName, tagsIgnore)) {
      return { matched: false, reason: `Tag '${tagName}' matches tags-ignore filter` };
    }
    return {
      matched: true,
      reason: `Tag '${tagName}' does not match any tags-ignore pattern`,
    };
  }

  return { matched: true, reason: 'No tags filter applied' };
}
