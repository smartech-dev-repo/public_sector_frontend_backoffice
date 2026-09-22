const fs = require('fs');

const data = JSON.parse(fs.readFileSync('Public Sector Backend.postman_collection.json', 'utf8'));

function extractEndpoints(items, path = '') {
  let endpoints = [];
  for (const item of items) {
    if (item.item) {
      endpoints = endpoints.concat(extractEndpoints(item.item, path + item.name + ' / '));
    } else if (item.request) {
      const method = item.request.method;
      const url = item.request.url?.raw || (item.request.url?.path ? item.request.url.path.join('/') : 'unknown');
      endpoints.push({
        folder: path,
        name: item.name,
        method,
        url: url.replace(/{{[^}]+}}/g, '') // remove environment vars like {{baseUrl}}
      });
    }
  }
  return endpoints;
}

const endpoints = extractEndpoints(data.item);
endpoints.forEach(e => console.log(`[${e.method}] ${e.name} - ${e.url}`));
