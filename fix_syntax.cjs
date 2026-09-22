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
  const fixRegex = /{(\w+)\.length === 0 \? \(\s*<EmptyState message="([^"]+)" \/>\s*\) : \(/g;
  if (content.match(fixRegex)) {
    content = content.replace(fixRegex, (match, varName, msg) => {
      return `{${varName}.length === 0 && <EmptyState message="${msg}" />}`;
    });
    fs.writeFileSync(file, content);
    console.log('Fixed syntax:', file);
  }
}
