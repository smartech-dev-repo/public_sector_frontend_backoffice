const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      getFiles(p, files);
    } else {
      files.push(p);
    }
  }
  return files;
}

const composables = getFiles('app/composables/modules').filter(f => f.endsWith('.ts'));
const uiFiles = getFiles('app/dashboard').filter(f => f.endsWith('.tsx'));

const uiContent = uiFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

composables.forEach(comp => {
  const content = fs.readFileSync(comp, 'utf8');
  const returnMatch = content.match(/return\s+{([^}]+)}/);
  if (returnMatch) {
    const exports = returnMatch[1].split(',').map(s => s.trim().split(':')[0]).filter(Boolean);
    exports.forEach(exp => {
      if (['loading', 'error', 'meta', 'agents', 'clients', 'roles', 'permissions', 'documents', 'invites', 'admins', 'auditLogs', 'departments', 'ippisRecords', 'loans', 'reports'].includes(exp)) return; // skip state vars
      
      const regex = new RegExp(`\\b${exp}\\b`);
      if (!regex.test(uiContent)) {
         console.log(`Unused export: ${exp} in ${comp}`);
      }
    });
  }
});
