const fs = require('fs');
const endpoints = fs.readFileSync('admin_endpoints_list.txt', 'utf8').split('\n').filter(l => l.trim() !== '');
const files = fs.readdirSync('app/api_factory/modules').map(f => ({ name: f, content: fs.readFileSync('app/api_factory/modules/' + f, 'utf8') }));

const missing = [];
for (const line of endpoints) {
  const match = line.match(/^([A-Z]+) ([\/\w\-\{\}\?=\%]+)/);
  if (match) {
    const method = match[1];
    let path = match[2];
    path = path.split('?')[0]; 
    
    const parts = path.split('/').filter(p => p && !p.startsWith('{{'));
    
    let found = false;
    for (const f of files) {
        let baseRoute = parts.join('/');
        if (baseRoute === '') continue;
        if (f.content.includes(baseRoute)) {
             found = true;
             break;
        }
    }
    
    if (!found) {
       missing.push(line);
    }
  }
}
console.log('MISSING OR UNMATCHED ENDPOINTS:');
console.log(missing.join('\n'));
