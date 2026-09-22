const fs = require('fs');
const postman = JSON.parse(fs.readFileSync('/Users/marquis/public-sector/admin/Public Sector Backend.postman_collection (2).json', 'utf8'));

const endpoints = [];

function extractEndpoints(items, folderPath = '') {
  for (const item of items) {
    if (item.item) {
      extractEndpoints(item.item, folderPath ? `${folderPath}/${item.name}` : item.name);
    } else if (item.request) {
      const method = item.request.method;
      let url = '';
      if (typeof item.request.url === 'string') {
        url = item.request.url;
      } else if (item.request.url && item.request.url.raw) {
        url = item.request.url.raw;
      }
      
      // Clean url (remove {{base_url}})
      url = url.replace('{{base_url}}', '');
      endpoints.push({ method, url, name: item.name, folderPath });
    }
  }
}

extractEndpoints(postman.item);
console.log(JSON.stringify(endpoints, null, 2));
