const fs = require('fs');
const path = require('path');

function findFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const res = path.resolve(dir, file);
    if (fs.statSync(res).isDirectory()) findFiles(res, files);
    else if (res.endsWith('.tsx') && !res.includes('layout.tsx') && !res.includes('components')) files.push(res);
  }
  return files;
}

const files = findFiles('/Users/marquis/public-sector/admin/app/dashboard').concat(findFiles('/Users/marquis/public-sector/admin/app/credit-risk'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add imports if not there and we need them
  if (content.includes('loading && <div') || content.match(/{\w+\.length === 0 && \(/)) {
    if (!content.includes('PulseLoader')) {
      content = content.replace(/(import .*;\n)(?!import)/, `$1import PulseLoader from '@/app/components/ui/PulseLoader';\nimport EmptyState from '@/app/components/ui/EmptyState';\n`);
    }

    // Replace loading
    content = content.replace(/{loading && <div[^>]+>Loading[^<]+<\/div>}/g, '{loading && <PulseLoader />}');

    // Replace empty states
    // A bit tricky because of variable names: e.g. {roles.length === 0 && ( ... )}
    const emptyStateRegex = /{(\w+)\.length === 0 && \(\s*<div[^>]+>([^<]+)<\/div>\s*\)}/g;
    content = content.replace(emptyStateRegex, (match, varName, msg) => {
      return `{${varName}.length === 0 ? (\n            <EmptyState message="${msg}" />\n          ) : (`;
    });

    // Oh wait, if we replace {var.length === 0 && ...} with ? ... : (, we break JSX because the table isn't inside the ( ... ).
    // It's safer to just replace the div inside the &&.
    const emptyStateSafeRegex = /{(\w+)\.length === 0 && \(\s*<div[^>]+>([^<]+)<\/div>\s*\)}/g;
    content = content.replace(emptyStateSafeRegex, (match, varName, msg) => {
      return `{${varName}.length === 0 && <EmptyState message="${msg}" />}`;
    });

    fs.writeFileSync(file, content);
    console.log('Refactored:', file);
  }
}
