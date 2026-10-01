const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      getFiles(p, files);
    } else {
      files.push(p);
    }
  }
  return files;
}

const apiFiles = getFiles('app/api_factory/modules').filter(f => f.endsWith('.ts'));
const uiFiles = getFiles('app/dashboard').filter(f => f.endsWith('.tsx'));
const composableFiles = getFiles('app/composables/modules').filter(f => f.endsWith('.ts'));

const uiContent = uiFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const composableContent = composableFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const fullContent = uiContent + '\n' + composableContent;

apiFiles.forEach(api => {
  const content = fs.readFileSync(api, 'utf8');
  // Match `someFunc: (params) => {` or `someFunc: async (params) => {`
  const matches = [...content.matchAll(/([a-zA-Z0-9_]+):\s*(?:async\s*)?\(/g)];
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const funcName = match[1];
      const regex = new RegExp(`\\b${funcName}\\b`);
      if (!regex.test(fullContent)) {
         console.log(`Unused API method: ${funcName} in ${api}`);
      }
    });
  }
});
