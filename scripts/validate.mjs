// Validates a Camillia conventions pack before it is published.
// Zero dependencies; requires Node.js 22 or later.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(repoRoot, 'conventions');

const MIN_FILES = 3;
const MIN_BYTES = 1024;

function fail(message) {
  console.error(`validate: ${message}`);
  process.exit(1);
}

let dirStat;
try {
  dirStat = await stat(contentDir);
} catch {
  fail('conventions/ directory is missing');
}

if (!dirStat.isDirectory()) {
  fail('conventions/ exists but is not a directory');
}

const entries = await readdir(contentDir);
const mdFiles = entries
  .filter((name) => name.toLowerCase().endsWith('.md'))
  .sort();

if (mdFiles.length < MIN_FILES) {
  fail(`conventions/ must contain at least ${MIN_FILES} .md files (found ${mdFiles.length})`);
}

let failures = 0;

for (const name of mdFiles) {
  const filePath = join(contentDir, name);
  const buffer = await readFile(filePath);
  const text = buffer.toString('utf8');

  if (buffer.length < MIN_BYTES) {
    console.error(`validate: ${name} is too small (${buffer.length} bytes; need at least ${MIN_BYTES})`);
    failures += 1;
  }

  if (!text.startsWith('# ')) {
    console.error(`validate: ${name} must start with an H1 heading ("# ...")`);
    failures += 1;
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`validate: OK - ${mdFiles.length} convention file(s) passed`);
