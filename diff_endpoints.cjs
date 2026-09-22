const fs = require('fs');
const path = require('path');

const postmanEndpointsStr = fs.readFileSync('all_endpoints_check.txt', 'utf8');
const postmanEndpoints = [];
for (const line of postmanEndpointsStr.split('\n')) {
  if (line.trim()) {
    // format: METHOD /url - Name (Folder)
    const [methodUrl, ...rest] = line.split(' - ');
    const [method, url] = methodUrl.split(' ');
    // normalize url (remove query params)
    const cleanUrl = url.split('?')[0].replace(/{{.*?}}/g, ':id');
    postmanEndpoints.push(`${method} ${cleanUrl}`);
  }
}

const uniquePostmanEndpoints = [...new Set(postmanEndpoints)];

const tsDir = '/Users/marquis/public-sector/admin/app/api_factory/modules';
let tsContent = '';
fs.readdirSync(tsDir).forEach(file => {
  tsContent += fs.readFileSync(path.join(tsDir, file), 'utf8') + '\n';
});

const tsEndpoints = [];
const regex = /\.(get|post|patch|put|delete)\(\s*[`'"](.*?)[`'"]/g;
let match;
while ((match = regex.exec(tsContent)) !== null) {
  let method = match[1].toUpperCase();
  let url = match[2];
  // normalize url
  url = url.replace(/\${.*?}/g, ':id');
  tsEndpoints.push(`${method} ${url}`);
}

const uniqueTsEndpoints = [...new Set(tsEndpoints)];

console.log('--- Missing in TS (in Postman but not in Code) ---');
for (const ep of uniquePostmanEndpoints) {
  if (!uniqueTsEndpoints.includes(ep)) {
    console.log(ep);
  }
}

