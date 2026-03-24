import * as github from '@actions/github';
import { ActionContext } from './types';

export function getActionContext(): ActionContext {
  const { context } = github;
  const ctx: ActionContext = {
    eventName: context.eventName,
    ref: context.ref,
    repo: context.repo,
  };

  if (context.payload.action) {
    ctx.action = context.payload.action;
  }

  if (context.payload.pull_request) {
    ctx.pullRequest = {
      number: context.payload.pull_request.number,
      baseRef: context.payload.pull_request.base.ref,
    };
  }

  if (context.eventName === 'push' && context.payload) {
    ctx.push = {
      before: context.payload.before ?? '',
      after: context.payload.after ?? '',
    };
  }

  return ctx;
}
