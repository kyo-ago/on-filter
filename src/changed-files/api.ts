import * as core from '@actions/core';
import * as github from '@actions/github';

export async function getChangedFilesFromApi(
  token: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string[]> {
  const octokit = github.getOctokit(token);
  const files: string[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: perPage,
      page,
    });

    for (const file of response.data) {
      files.push(file.filename);
    }

    if (response.data.length < perPage) {
      break;
    }
    page++;
  }

  core.debug(`Changed files from API (${files.length}): ${JSON.stringify(files)}`);
  return files;
}
