#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = process.cwd();
const specsDir = path.join(rootDir, 'e2e/specs');
const onFilterDir = path.join(rootDir, 'e2e/generated/on-filter');
const oracleDir = path.join(rootDir, 'e2e/generated/oracle-workflows');

function listSpecFiles() {
  if (!fs.existsSync(specsDir)) {
    return [];
  }

  return fs
    .readdirSync(specsDir)
    .filter((entry) => entry.endsWith('.yml') || entry.endsWith('.yaml'))
    .sort();
}

function assertValidSpec(specPath, content) {
  if (!content || typeof content !== 'object') {
    throw new Error(`Invalid spec file: ${specPath}`);
  }

  if (typeof content.name !== 'string' || content.name.trim() === '') {
    throw new Error(`Missing/invalid "name" in ${specPath}`);
  }

  if (!content.on || typeof content.on !== 'object') {
    throw new Error(`Missing/invalid "on" block in ${specPath}`);
  }
}

function serializeYaml(doc) {
  return yaml.dump(doc, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

function toOnFilterYaml(onBlock) {
  return serializeYaml(onBlock);
}

function indentBlock(content, spaces) {
  const prefix = ' '.repeat(spaces);
  return content
    .trimEnd()
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
}

function toOracleWorkflowYaml(name, onBlock) {
  const onYaml = toOnFilterYaml(onBlock);

  return [
    `name: oracle-${name}`,
    'on:',
    indentBlock(onYaml, 2),
    'jobs:',
    '  oracle:',
    '    runs-on: ubuntu-slim',
    '    steps:',
    '      - run: echo oracle workflow trigger definition',
    '',
  ].join('\n');
}

function cleanDir(dirPath, keepFiles) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return;
  }

  const keep = new Set(keepFiles);
  for (const entry of fs.readdirSync(dirPath)) {
    const filePath = path.join(dirPath, entry);
    if (fs.statSync(filePath).isFile() && !keep.has(entry)) {
      fs.unlinkSync(filePath);
    }
  }
}

function writeGeneratedFiles() {
  const specs = listSpecFiles();
  const onFilterFiles = [];
  const oracleFiles = [];

  for (const specFile of specs) {
    const specPath = path.join(specsDir, specFile);
    const loaded = yaml.load(fs.readFileSync(specPath, 'utf8'));
    assertValidSpec(specPath, loaded);

    const spec = loaded;
    const outputName = `${spec.name}.yml`;

    const onFilterYaml = toOnFilterYaml(spec.on);
    const oracleWorkflowYaml = toOracleWorkflowYaml(spec.name, spec.on);

    fs.mkdirSync(onFilterDir, { recursive: true });
    fs.mkdirSync(oracleDir, { recursive: true });

    fs.writeFileSync(path.join(onFilterDir, outputName), onFilterYaml);
    fs.writeFileSync(path.join(oracleDir, outputName), oracleWorkflowYaml);

    onFilterFiles.push(outputName);
    oracleFiles.push(outputName);
  }

  cleanDir(onFilterDir, onFilterFiles);
  cleanDir(oracleDir, oracleFiles);

  console.log(`Generated ${onFilterFiles.length} spec artifact(s).`);
}

writeGeneratedFiles();
