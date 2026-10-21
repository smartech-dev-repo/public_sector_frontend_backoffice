const fs = require('fs');

const postmanData = JSON.parse(fs.readFileSync('Public Sector Backend.postman_collection.json', 'utf8'));

const extractEndpoints = (item) => {
  let endpoints = [];
  if (item.request) {
    let method = item.request.method;
    let url = typeof item.request.url === 'object' ? item.request.url.raw : item.request.url;
    url = url.split('?')[0];
    url = url.replace(/{{.*?}}/g, ':id');
    url = url.replace(/00000000-0000-0000-0000-000000000000/g, ':id');
    url = url.replace(/does%2Fnot%2Fexist\.xlsx/g, ':id');
    endpoints.push(`${method} ${url}`);
  }
  if (item.item) {
    item.item.forEach(subItem => {
      endpoints = endpoints.concat(extractEndpoints(subItem));
    });
  }
  return endpoints;
};

let pmEndpoints = extractEndpoints(postmanData);
pmEndpoints = [...new Set(pmEndpoints)].map(e => e.replace('{{base_url}}', ''));

const tsDir = '/Users/marquis/public-sector/admin/app/api_factory/modules';
let tsContent = '';
fs.readdirSync(tsDir).forEach(file => {
  if(file.endsWith('.ts')) {
    tsContent += fs.readFileSync(`${tsDir}/${file}`, 'utf8') + '\n';
  }
});

let tsEndpoints = [];
const regex = /\.(get|post|patch|put|delete)\(\s*[`'"](.*?)[`'"]/g;
let match;
while ((match = regex.exec(tsContent)) !== null) {
  let method = match[1].toUpperCase();
  let url = match[2];
  url = url.replace(/\${.*?}/g, ':id');
  tsEndpoints.push(`${method} ${url}`);
}

pmEndpoints.forEach(ep => {
  if (!tsEndpoints.includes(ep)) {
    console.log("Missing in TS:", ep);
  }
});

