const fs = require('fs');

const postmanPath = '/Users/marquis/public-sector/admin/Public Sector Backend.postman_collection (6).json';
const postman = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

const postmanEndpoints = [];
function extractEndpoints(items, folderPath = '') {
  for (const item of items) {
    if (item.item) {
      extractEndpoints(item.item, folderPath ? `${folderPath}/${item.name}` : item.name);
    } else if (item.request) {
      const method = item.request.method.toUpperCase();
      let url = '';
      if (typeof item.request.url === 'string') {
        url = item.request.url;
      } else if (item.request.url && item.request.url.raw) {
        url = item.request.url.raw;
      }
      url = url.replace('{{base_url}}', '');
      let cleanUrl = url.split('?')[0].replace(/{{.*?}}/g, ':id');
      cleanUrl = cleanUrl.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, ':id');
      postmanEndpoints.push(`${method} ${cleanUrl}`);
    }
  }
}
extractEndpoints(postman.item);
const uniquePostmanEndpoints = [...new Set(postmanEndpoints)];

const tsDir = '/Users/marquis/public-sector/admin/app/api_factory/modules';
let tsContent = '';
fs.readdirSync(tsDir).forEach(file => {
  tsContent += fs.readFileSync(require('path').join(tsDir, file), 'utf8') + '\n';
});

const tsEndpoints = [];
const regex = /\.(get|post|patch|put|delete)\(\s*[`'"](.*?)[`'"]/g;
let match;
while ((match = regex.exec(tsContent)) !== null) {
  let method = match[1].toUpperCase();
  let url = match[2];
  url = url.replace(/\${.*?}/g, ':id');
  tsEndpoints.push(`${method} ${url}`);
}
const uniqueTsEndpoints = [...new Set(tsEndpoints)];

console.log('--- Missing in Code (in Postman 6 but not in codebase) ---');
for (const ep of uniquePostmanEndpoints) {
  if (!uniqueTsEndpoints.includes(ep)) {
    console.log(ep);
  }
}
