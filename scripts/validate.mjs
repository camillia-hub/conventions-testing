#!/usr/bin/env node
// Validates a Camillia conventions pack against the anti-collision placement
// contract: hub.json declares the extension id, and every convention file is
// a flat conventions/cam-ext-<id>-<name>.md markdown document with an H1
// heading and at least 1 KB of content.
// Zero dependencies; requires Node.js 22 or later.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(repoRoot, 'conventions');

const MIN_FILES = 3;
const MIN_BYTES = 1024;
const KEBAB_ID = /^[a-z0-9](-?[a-z0-9]){2,39}$/;

function fail(message) {
  console.error(`validate: FAIL - ${message}`);
  process.exit(1);
}

let hub;
try {
  hub = JSON.parse(await readFile(join(repoRoot, 'hub.json'), 'utf8'));
} catch {
  fail('hub.json is missing or not valid JSON');
}
const id = hub.id;
if (typeof id !== 'string' || !KEBAB_ID.test(id)) {
  fail("hub.json must declare a unique kebab-case extension 'id'");
}
if (hub.kind !== 'conventions-pack') {
  fail(`hub.json kind must be 'conventions-pack' (found '${hub.kind}')`);
}
if (hub.contentDir !== 'conventions') {
  fail(`hub.json contentDir must be 'conventions' (found '${hub.contentDir}')`);
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

const entries = await readdir(contentDir, { withFileTypes: true });

if (entries.some((entry) => entry.isDirectory())) {
  fail('conventions/ is a flat shared directory; subdirectories are not allowed');
}

const stray = entries
  .filter((entry) => entry.isFile() && !entry.name.toLowerCase().endsWith('.md'))
  .map((entry) => entry.name);
if (stray.length > 0) {
  fail(`conventions/ may only carry markdown files: ${stray.join(', ')}`);
}

const prefix = `cam-ext-${id}-`;
const mdFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
  .map((entry) => entry.name)
  .sort();

if (mdFiles.length < MIN_FILES) {
  fail(`conventions/ must contain at least ${MIN_FILES} .md files (found ${mdFiles.length})`);
}

for (const name of mdFiles) {
  if (!name.startsWith(prefix)) {
    fail(`conventions/${name} must be named ${prefix}<name>.md (shared-directory prefix)`);
  }
  if (name.slice(prefix.length) === '.md') {
    fail(`conventions/${name} has an empty name after the ${prefix} prefix`);
  }

  const filePath = join(contentDir, name);
  const buffer = await readFile(filePath);
  const text = buffer.toString('utf8');

  if (buffer.length < MIN_BYTES) {
    fail(`conventions/${name} is too small (${buffer.length} bytes; need at least ${MIN_BYTES})`);
  }

  if (!text.startsWith('# ')) {
    fail(`conventions/${name} must start with an H1 heading ("# ...")`);
  }
}

console.log(`validate: OK - ${mdFiles.length} convention file(s) carry the ${prefix} prefix and passed`);
