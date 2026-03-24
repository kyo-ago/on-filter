import { getChangedFilesFromApi } from '../../src/changed-files/api';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

const mockListFiles = jest.fn();
jest.mock('@actions/github', () => ({
  getOctokit: () => ({
    rest: {
      pulls: {
        listFiles: mockListFiles,
      },
    },
  }),
}));

describe('getChangedFilesFromApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns file names from API', async () => {
    mockListFiles.mockResolvedValue({
      data: [{ filename: 'src/main.ts' }, { filename: 'README.md' }],
    });
    const files = await getChangedFilesFromApi('token', 'owner', 'repo', 1);
    expect(files).toEqual(['src/main.ts', 'README.md']);
  });

  it('handles pagination', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => ({ filename: `file${i}.ts` }));
    const page2 = [{ filename: 'file100.ts' }];

    mockListFiles
      .mockResolvedValueOnce({ data: page1 })
      .mockResolvedValueOnce({ data: page2 });

    const files = await getChangedFilesFromApi('token', 'owner', 'repo', 1);
    expect(files).toHaveLength(101);
    expect(mockListFiles).toHaveBeenCalledTimes(2);
  });

  it('returns empty array when no files', async () => {
    mockListFiles.mockResolvedValue({ data: [] });
    const files = await getChangedFilesFromApi('token', 'owner', 'repo', 1);
    expect(files).toEqual([]);
  });
});
