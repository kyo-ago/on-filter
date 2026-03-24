export interface EventFilter {
  types?: string[];
  branches?: string[];
  'branches-ignore'?: string[];
  tags?: string[];
  'tags-ignore'?: string[];
  paths?: string[];
  'paths-ignore'?: string[];
  [key: string]: unknown;
}

export type OnFilter = Record<string, EventFilter | null>;

export interface ActionContext {
  eventName: string;
  ref: string;
  action?: string;
  pullRequest?: {
    number: number;
    baseRef: string;
  };
  push?: {
    before: string;
    after: string;
  };
  repo: {
    owner: string;
    repo: string;
  };
}

export interface FilterResult {
  matched: boolean;
  reason: string;
}
