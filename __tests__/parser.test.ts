import { parseOnFilter } from '../src/parser';

jest.mock('@actions/core', () => ({
  warning: jest.fn(),
  debug: jest.fn(),
}));

describe('parseOnFilter', () => {
  it('parses simple event with no filters', () => {
    const result = parseOnFilter('push:');
    expect(result).toEqual({ push: null });
  });

  it('parses event with branches filter', () => {
    const result = parseOnFilter(`
push:
  branches: [main, develop]
`);
    expect(result).toEqual({
      push: { branches: ['main', 'develop'] },
    });
  });

  it('parses event with branches-ignore filter', () => {
    const result = parseOnFilter(`
push:
  branches-ignore: [temp-*]
`);
    expect(result).toEqual({
      push: { 'branches-ignore': ['temp-*'] },
    });
  });

  it('parses event with paths filter', () => {
    const result = parseOnFilter(`
push:
  paths: ['src/**', 'lib/**']
`);
    expect(result).toEqual({
      push: { paths: ['src/**', 'lib/**'] },
    });
  });

  it('parses event with types filter', () => {
    const result = parseOnFilter(`
pull_request:
  types: [opened, synchronize]
`);
    expect(result).toEqual({
      pull_request: { types: ['opened', 'synchronize'] },
    });
  });

  it('parses event with tags filter', () => {
    const result = parseOnFilter(`
push:
  tags: ['v*']
`);
    expect(result).toEqual({
      push: { tags: ['v*'] },
    });
  });

  it('parses multiple events', () => {
    const result = parseOnFilter(`
push:
  branches: [main]
pull_request:
  branches: [main]
`);
    expect(result).toEqual({
      push: { branches: ['main'] },
      pull_request: { branches: ['main'] },
    });
  });

  it('parses combined filters', () => {
    const result = parseOnFilter(`
push:
  branches: [main]
  paths: ['src/**']
`);
    expect(result).toEqual({
      push: { branches: ['main'], paths: ['src/**'] },
    });
  });

  it('throws on empty input', () => {
    expect(() => parseOnFilter('')).toThrow('Empty on filter definition');
  });

  it('throws on non-object input', () => {
    expect(() => parseOnFilter('hello')).toThrow('on filter must be a YAML mapping');
  });

  it('throws on array input', () => {
    expect(() => parseOnFilter('- push\n- pull_request')).toThrow(
      'on filter must be a YAML mapping'
    );
  });

  it('throws on branches + branches-ignore', () => {
    expect(() =>
      parseOnFilter(`
push:
  branches: [main]
  branches-ignore: [temp]
`)
    ).toThrow("cannot have both 'branches' and 'branches-ignore'");
  });

  it('throws on tags + tags-ignore', () => {
    expect(() =>
      parseOnFilter(`
push:
  tags: ['v*']
  tags-ignore: ['v0.*']
`)
    ).toThrow("cannot have both 'tags' and 'tags-ignore'");
  });

  it('throws on paths + paths-ignore', () => {
    expect(() =>
      parseOnFilter(`
push:
  paths: ['src/**']
  paths-ignore: ['docs/**']
`)
    ).toThrow("cannot have both 'paths' and 'paths-ignore'");
  });

  it('warns on unknown filter key', () => {
    const core = require('@actions/core');
    parseOnFilter(`
push:
  branches: [main]
  unknown-key: something
`);
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('Unknown filter key')
    );
  });

  it('throws on non-array filter value', () => {
    expect(() =>
      parseOnFilter(`
push:
  branches: main
`)
    ).toThrow("must be an array");
  });
});
