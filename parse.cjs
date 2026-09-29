const fs = require('fs');

const postmanData = JSON.parse(fs.readFileSync('Public Sector Backend.postman_collection.json', 'utf8'));

const extractEndpoints = (item) => {
  let endpoints = [];
  if (item.request) {
    let method = item.request.method;
    let url = typeof item.request.url === 'object' ? item.request.url.raw : item.request.url;
    url = url.split('?')[0];
    url = url.replace(/{{base_url}}/g, '');
    url = url.replace(/{{.*?}}/g, ':id');
    url = url.replace(/00000000-0000-0000-0000-000000000000/g, ':id');
    url = url.replace(/does%2Fnot%2Fexist\.xlsx/g, ':id');
    if (!url.startsWith('/')) {
        url = '/' + url;
    }
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
pmEndpoints = [...new Set(pmEndpoints)];

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
  if (!url.startsWith('/')) {
      url = '/' + url;
  }
  tsEndpoints.push(`${method} ${url}`);
}

const missingInTS = pmEndpoints.filter(ep => !tsEndpoints.includes(ep));
const missingInPM = tsEndpoints.filter(ep => !pmEndpoints.includes(ep));

console.log("Missing in TS:", missingInTS);
console.log("Missing in Postman:", missingInPM);
