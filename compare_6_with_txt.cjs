const fs = require('fs');

const postmanPath = '/Users/marquis/public-sector/admin/Public Sector Backend.postman_collection (6).json';
const postman = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

const postmanEndpoints = [];
function extractEndpoints(items, folderPath = '') {
  for (const item of items) {
    if (item.item) {
      extractEndpoints(item.item, folderPath ? `${folderPath}/${item.name}` : item.name);
    } else if (item.request) {
      let url = '';
      if (typeof item.request.url === 'string') {
        url = item.request.url;
      } else if (item.request.url && item.request.url.raw) {
        url = item.request.url.raw;
      }
      postmanEndpoints.push(url);
    }
  }
}
extractEndpoints(postman.item);
const uniquePostmanEndpoints = [...new Set(postmanEndpoints)];

const oldEndpointsStr = fs.readFileSync('/Users/marquis/public-sector/admin/current_endpoints.txt', 'utf8');
const oldEndpoints = oldEndpointsStr.split('\n')
  .map(l => l.trim().replace(/^"|"$/g, ''))
  .filter(Boolean);

console.log('--- NEW ENDPOINTS (in Collection 6 but not in current_endpoints.txt) ---');
for (const ep of uniquePostmanEndpoints) {
  if (!oldEndpoints.includes(ep)) {
    console.log(ep);
  }
}

console.log('\n--- REMOVED ENDPOINTS (in current_endpoints.txt but not in Collection 6) ---');
for (const ep of oldEndpoints) {
  if (!uniquePostmanEndpoints.includes(ep)) {
    console.log(ep);
  }
}
