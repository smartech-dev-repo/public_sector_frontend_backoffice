const fs = require('fs');
const path = require('path');

const collectionData = fs.readFileSync('/Users/marquis/public-sector/admin/Public Sector Backend.postman_collection.json', 'utf8');
const collection = JSON.parse(collectionData);

const endpoints = [];
function extractEndpoints(itemGroup, prefix = '') {
  for (const item of itemGroup.item) {
    if (item.item) {
      extractEndpoints(item, prefix + item.name + '/');
    } else {
      if (item.request && item.request.url) {
        let rawUrl = '';
        if (typeof item.request.url === 'string') {
          rawUrl = item.request.url;
        } else if (item.request.url.raw) {
          rawUrl = item.request.url.raw;
        }
        endpoints.push({
          method: item.request.method,
          url: rawUrl,
          name: item.name,
          folder: prefix
        });
      }
    }
  }
}
extractEndpoints(collection);

let output = '';
endpoints.forEach(ep => {
  const shortUrl = ep.url.replace(/{{base_url}}|{{URL}}/g, '');
  output += `${ep.method} ${shortUrl} - ${ep.name} (${ep.folder})\n`;
});

fs.writeFileSync('all_endpoints_check.txt', output);
console.log(`Found ${endpoints.length} endpoints.`);
