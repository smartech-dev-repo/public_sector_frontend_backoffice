const fs = require('fs');

const files = [
  'app/dashboard/agent-security/page.tsx',
  'app/dashboard/clients/page.tsx',
  'app/dashboard/roles/page.tsx',
  'app/dashboard/admins/page.tsx',
  'app/dashboard/agent/[id]/page.tsx',
  'app/dashboard/permissions/page.tsx',
  'app/dashboard/loan-requests/page.tsx',
  'app/credit-risk/agent-management/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already refactored
  if (content.includes('useConfirm')) continue;

  // Add import
  const importStatement = "import { useConfirm } from '@/app/composables/useConfirm';\n";
  // Insert import after the last import
  const lastImportIndex = content.lastIndexOf('import ');
  const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
  content = content.slice(0, insertIndex) + importStatement + content.slice(insertIndex);

  // Add useConfirm hook
  // Find the first component definition
  content = content.replace(/(export default function \w+\(.*\) \{|const \w+ = \(.*\) => \{)/, "$1\n  const { confirm } = useConfirm();\n");

  // Replace confirms
  // Case 1: if (!confirm(...)) return;
  content = content.replace(/if\s*\(!confirm\(`([^`]+)`\)\)\s*return;/g, "const confirmed = await confirm({ message: `$1` });\n    if (!confirmed) return;");
  content = content.replace(/if\s*\(!confirm\('([^']+)'\)\)\s*return;/g, "const confirmed = await confirm({ message: '$1' });\n    if (!confirmed) return;");

  // Case 2: if (confirm(...)) {
  content = content.replace(/if\s*\(\s*confirm\(`([^`]+)`\)\s*\)\s*\{/g, "const confirmed = await confirm({ message: `$1` });\n    if (confirmed) {");
  content = content.replace(/if\s*\(\s*confirm\('([^']+)'\)\s*\)\s*\{/g, "const confirmed = await confirm({ message: '$1' });\n    if (confirmed) {");

  fs.writeFileSync(file, content, 'utf8');
  console.log('Refactored', file);
}
