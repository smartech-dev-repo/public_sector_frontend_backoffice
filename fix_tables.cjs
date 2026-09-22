const fs = require('fs');
const path = require('path');
function findFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const res = path.resolve(dir, file);
    if (fs.statSync(res).isDirectory()) findFiles(res, files);
    else if (res.endsWith('.tsx')) files.push(res);
  }
  return files;
}
const files = findFiles('/Users/marquis/public-sector/admin/app');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<table') && !content.includes('overflow-x-auto')) {
     content = content.replace(/(<table[^>]*>)/, '<div className="overflow-x-auto">\n$1');
     content = content.replace(/(<\/table>)/, '$1\n</div>');
     fs.writeFileSync(file, content);
     console.log('Fixed', file);
  }
}
