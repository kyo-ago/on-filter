import { getChangedFilesFromGit } from '../../src/changed-files/git';

jest.mock('@actions/core');

const mockExec = jest.fn();
jest.mock('@actions/exec', () => ({
  exec: (...args: unknown[]) => mockExec(...args),
}));

type ExecOpts = { listeners: { stdout: (d: Buffer) => void } };

const NULL_SHA = '0000000000000000000000000000000000000000';

test.each([
  {
    name: 'runs git diff for normal push',
    stdout: 'src/main.ts\nREADME.md\n',
    before: 'abc123',
    after: 'def456',
    expectedFiles: ['src/main.ts', 'README.md'],
    expectedGitArgs: ['diff', '--name-only', 'abc123...def456'],
  },
  {
    name: 'lists all files for new branch (null SHA)',
    stdout: 'src/main.ts\npackage.json\n',
    before: NULL_SHA,
    after: 'def456',
    expectedFiles: ['src/main.ts', 'package.json'],
    expectedGitArgs: ['ls-tree', '-r', '--name-only', 'def456'],
  },
  {
    name: 'lists all files for empty before',
    stdout: 'file.ts\n',
    before: '',
    after: 'def456',
    expectedFiles: ['file.ts'],
    expectedGitArgs: ['ls-tree', '-r', '--name-only', 'def456'],
  },
  {
    name: 'returns empty array for empty output',
    stdout: '',
    before: 'abc123',
    after: 'def456',
    expectedFiles: [],
    expectedGitArgs: ['diff', '--name-only', 'abc123...def456'],
  },
])('$name', async ({ stdout, before, after, expectedFiles, expectedGitArgs }) => {
  mockExec.mockImplementation((_cmd: string, _args: string[], opts: ExecOpts) => {
    opts.listeners.stdout(Buffer.from(stdout));
    return Promise.resolve(0);
  });

  const files = await getChangedFilesFromGit(before, after);
  expect(files).toEqual(expectedFiles);
  expect(mockExec).toHaveBeenCalledWith('git', expectedGitArgs, expect.any(Object));
});
