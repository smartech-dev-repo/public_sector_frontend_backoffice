#!/usr/bin/env node
/**
 * Keeps build output, scratch scripts, data dumps and secrets out of the repository.
 *
 *   node scripts/check-repo-files.mjs           checks every tracked file (CI)
 *   node scripts/check-repo-files.mjs --staged  checks files staged for commit (pre-commit hook)
 *
 * The root of the repo is an allowlist: a new top-level file or folder fails until it's added
 * to ROOT_ALLOWED below, in the same change. Everything else is checked against BLOCKED.
 * Exits 1 and lists each offending file with the reason.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

const ROOT_ALLOWED = new Set([
  // folders
  '.githooks',
  '.github',
  'app',
  'components',
  'hooks',
  'lib',
  'public',
  'scripts',
  // files
  '.dockerignore',
  '.env.example',
  '.gitignore',
  'AGENTS.md',
  'CLAUDE.md',
  'Dockerfile',
  'README.md',
  'eslint.config.mjs',
  'next-env.d.ts',
  'next.config.mjs',
  'package-lock.json',
  'package.json',
  'postcss.config.mjs',
  'tailwind.config.js',
  'tsconfig.json',
]);

/** [pattern tested against the full path, reason] */
const BLOCKED = [
  [/(^|\/)(\.next|\.nuxt|\.output|out|build|dist|coverage|node_modules|\.kilo|\.turbo|\.vercel)\//, 'build output, dependencies or tool cache'],
  [/\.tsbuildinfo$/, 'TypeScript build cache'],
  [/(^|\/)\.env(\.(?!example$)[^/]*)?$/, 'environment file (may hold secrets); only .env.example is allowed'],
  [/\.(pem|key|p12|pfx|jks|keystore)$|(^|\/)id_(rsa|ed25519|ecdsa)/, 'private key or certificate'],
  [/\.postman_(collection|environment)[^/]*\.json$/i, 'Postman export; the backend repo owns the collection'],
  [/\.(csv|xlsx?|sql|sqlite3?|db|dump|bak|zip|tar|gz|tgz|rar|7z)$/i, 'data dump or archive (may hold personal data)'],
  [/\.(log|tmp|swp|orig|rej)$|~$/, 'log, temp or merge leftover'],
  [/(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$/, 'OS metadata'],
  [/(^|\/)\.(idea|vscode|fleet)\//, 'editor settings'],
  [/^(app|components|hooks|lib)\/.*\.(py|cjs|vue|txt)$/, 'scratch script or leftover from the Nuxt app'],
  [/^scripts\/.*\.(py|txt|json)$/, 'scratch file; scripts/ is for maintained tooling only'],
];

const MAX_BYTES = 1024 * 1024;

const staged = process.argv.includes('--staged');
const args = staged
  ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']
  : ['ls-files', '-z'];
const files = execFileSync('git', args, { encoding: 'utf8' }).split('\0').filter(Boolean);

const problems = [];
for (const file of files) {
  const hit = BLOCKED.find(([pattern]) => pattern.test(file));
  if (hit) {
    problems.push([file, hit[1]]);
    continue;
  }
  if (!ROOT_ALLOWED.has(file.split('/')[0])) {
    problems.push([file, 'not an expected top-level file or folder (add it to ROOT_ALLOWED in scripts/check-repo-files.mjs if it really belongs)']);
    continue;
  }
  let size = 0;
  try {
    size = staged
      ? Number(execFileSync('git', ['cat-file', '-s', `:${file}`], { encoding: 'utf8' }).trim())
      : statSync(file).size;
  } catch {
    continue;
  }
  if (size > MAX_BYTES && file !== 'package-lock.json') {
    problems.push([file, `larger than 1 MB (${(size / 1024 / 1024).toFixed(1)} MB); large files don't belong in git`]);
  }
}

if (problems.length) {
  console.error(`\nThese files must not be committed to this repository:\n`);
  for (const [file, reason] of problems) console.error(`  ${file}\n      ${reason}`);
  console.error(
    staged
      ? `\nUnstage them (git restore --staged <file>) and add them to .gitignore if they'll keep reappearing.\n`
      : `\nRemove them (git rm --cached <file>) and add them to .gitignore if they'll keep reappearing.\n`,
  );
  process.exit(1);
}
console.log(`check-repo-files: ${files.length} ${staged ? 'staged' : 'tracked'} file(s) OK`);
