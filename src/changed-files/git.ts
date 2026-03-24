import * as core from '@actions/core';
import * as exec from '@actions/exec';

const NULL_SHA = '0000000000000000000000000000000000000000';

export async function getChangedFilesFromGit(
  before: string,
  after: string
): Promise<string[]> {
  if (before === NULL_SHA || before === '') {
    core.debug('New branch detected (before is null SHA), listing all files');
    let output = '';
    await exec.exec('git', ['ls-tree', '-r', '--name-only', after], {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    });
    const files = output
      .trim()
      .split('\n')
      .filter((f) => f.length > 0);
    core.debug(`All files in tree (${files.length}): ${JSON.stringify(files)}`);
    return files;
  }

  let output = '';
  await exec.exec('git', ['diff', '--name-only', `${before}...${after}`], {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });

  const files = output
    .trim()
    .split('\n')
    .filter((f) => f.length > 0);
  core.debug(`Changed files from git diff (${files.length}): ${JSON.stringify(files)}`);
  return files;
}
