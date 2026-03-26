import * as core from '@actions/core';
import * as exec from '@actions/exec';

const NULL_SHA = '0000000000000000000000000000000000000000';

async function runGit(args: string[]): Promise<string> {
  const chunks: Buffer[] = [];
  await exec.exec('git', args, {
    listeners: {
      stdout: (data: Buffer) => chunks.push(data),
    },
  });
  return Buffer.concat(chunks).toString();
}

export async function getChangedFilesFromGit(
  before: string,
  after: string
): Promise<string[]> {
  if (before === NULL_SHA || before === '') {
    core.debug('New branch detected (before is null SHA), using diff-tree for changed files');
    const output = await runGit(['diff-tree', '--no-commit-id', '-r', '--name-only', after]);
    const files = output
      .trim()
      .split('\n')
      .filter((f) => f.length > 0);
    core.debug(`Changed files from diff-tree (${files.length}): ${JSON.stringify(files)}`);
    return files;
  }

  const output = await runGit(['diff', '--name-only', `${before}...${after}`]);
  const files = output
    .trim()
    .split('\n')
    .filter((f) => f.length > 0);
  core.debug(`Changed files from git diff (${files.length}): ${JSON.stringify(files)}`);
  return files;
}
