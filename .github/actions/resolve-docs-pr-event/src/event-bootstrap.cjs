'use strict';
const fs = require('node:fs');
try {
  const path = process.env.RESOLVED_PR_EVENT_PATH;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!path || !repository) throw new Error();
  const event = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (!Number.isSafeInteger(event?.pull_request?.number) || event.pull_request.number <= 0 ||
      typeof event?.repository?.full_name !== 'string' ||
      event.repository.full_name.toLowerCase() !== repository.toLowerCase()) throw new Error();
  process.env.GITHUB_EVENT_PATH = path;
  process.env.GITHUB_EVENT_NAME = 'pull_request';
} catch (_) {
  throw new Error('Unable to restore validated pull request event');
}
