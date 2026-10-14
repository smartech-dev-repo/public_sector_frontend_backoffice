const fs = require('fs');
const path = require('path');

const postmanFile = 'Public Sector Backend.postman_collection.json';
const apiModulesDir = path.join(process.cwd(), 'app', 'api_factory', 'modules');

const postmanData = JSON.parse(fs.readFileSync(postmanFile, 'utf8'));

function extractEndpoints(item, endpoints = []) {
  if (item.item) {
    item.item.forEach(subItem => extractEndpoints(subItem, endpoints));
  } else if (item.request) {
    const method = item.request.method;
    let url = '';
    if (typeof item.request.url === 'string') {
      url = item.request.url;
    } else if (item.request.url && item.request.url.path) {
      url = item.request.url.path.join('/');
    }
    endpoints.push({ method, url: '/' + url });
  }
  return endpoints;
}

let postmanEndpoints = extractEndpoints(postmanData);

let apiCode = '';
const readDir = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            readDir(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            apiCode += fs.readFileSync(fullPath, 'utf8') + '\n';
        }
    });
};
readDir(apiModulesDir);

const missing = new Set();
postmanEndpoints.forEach(ep => {
    const cleanUrl = ep.url
        .replace(/{{.*?}}/g, '')
        .replace(/[0-9a-fA-F\-]{36}/g, '')
        .replace(/\/\//g, '/')
        .replace(/\/$/, '')
        .replace(/^\//, ''); // e.g. "admin/invites"
        
    if (cleanUrl && cleanUrl.length > 3) {
       if (!apiCode.includes(cleanUrl)) {
           missing.add(`[${ep.method}] ${ep.url}`);
       }
    }
});

console.log([...missing].sort().join('\n'));

