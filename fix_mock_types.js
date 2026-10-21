const fs = require('fs');
for (const file of ['app/api_factory/modules/agents.ts', 'app/api_factory/modules/loans.ts']) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/res\.type ===/g, "(res as any).type ===");
  fs.writeFileSync(file, code, 'utf-8');
}
