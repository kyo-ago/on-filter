import * as core from '@actions/core';
import { parseOnFilter } from './parser';
import { evaluate } from './evaluator';
import { getActionContext } from './context';

async function run(): Promise<void> {
  try {
    const onInput = core.getInput('on', { required: true });
    const token = core.getInput('token', { required: false });

    core.debug(`on input:\n${onInput}`);

    const onFilter = parseOnFilter(onInput);
    core.debug(`Parsed filter: ${JSON.stringify(onFilter)}`);

    const context = getActionContext();
    core.debug(`Action context: ${JSON.stringify(context)}`);

    const result = await evaluate(onFilter, context, token);
    const resultStr = result ? 'true' : 'false';

    core.setOutput('result', resultStr);
    core.info(`result=${resultStr}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

run();
