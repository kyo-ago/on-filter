import { getChangedFilesFromGit } from '../../src/changed-files/git';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

const mockExec = jest.fn();
jest.mock('@actions/exec', () => ({
  exec: (...args: unknown[]) => mockExec(...args),
}));

describe('getChangedFilesFromGit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs git diff for normal push', async () => {
    mockExec.mockImplementation(
      (_cmd: string, _args: string[], opts: { listeners: { stdout: (d: Buffer) => void } }) => {
        opts.listeners.stdout(Buffer.from('src/main.ts\nREADME.md\n'));
        return Promise.resolve(0);
      }
    );

    const files = await getChangedFilesFromGit('abc123', 'def456');
    expect(files).toEqual(['src/main.ts', 'README.md']);
    expect(mockExec).toHaveBeenCalledWith(
      'git',
      ['diff', '--name-only', 'abc123...def456'],
      expect.any(Object)
    );
  });

  it('lists all files for new branch (null SHA)', async () => {
    mockExec.mockImplementation(
      (_cmd: string, _args: string[], opts: { listeners: { stdout: (d: Buffer) => void } }) => {
        opts.listeners.stdout(Buffer.from('src/main.ts\npackage.json\n'));
        return Promise.resolve(0);
      }
    );

    const files = await getChangedFilesFromGit(
      '0000000000000000000000000000000000000000',
      'def456'
    );
    expect(files).toEqual(['src/main.ts', 'package.json']);
    expect(mockExec).toHaveBeenCalledWith(
      'git',
      ['ls-tree', '-r', '--name-only', 'def456'],
      expect.any(Object)
    );
  });

  it('lists all files for empty before', async () => {
    mockExec.mockImplementation(
      (_cmd: string, _args: string[], opts: { listeners: { stdout: (d: Buffer) => void } }) => {
        opts.listeners.stdout(Buffer.from('file.ts\n'));
        return Promise.resolve(0);
      }
    );

    const files = await getChangedFilesFromGit('', 'def456');
    expect(files).toEqual(['file.ts']);
  });

  it('returns empty array for empty output', async () => {
    mockExec.mockImplementation(
      (_cmd: string, _args: string[], opts: { listeners: { stdout: (d: Buffer) => void } }) => {
        opts.listeners.stdout(Buffer.from(''));
        return Promise.resolve(0);
      }
    );

    const files = await getChangedFilesFromGit('abc123', 'def456');
    expect(files).toEqual([]);
  });
});
