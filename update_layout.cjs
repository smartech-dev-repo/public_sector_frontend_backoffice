const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf-8');
code = code.replace("import ToastContainer from '@/app/components/ui/Toast';", "import ToastContainer from '@/app/components/ui/Toast';\nimport { ConfirmProvider } from '@/app/composables/useConfirm';");
code = code.replace("{children}", "<ConfirmProvider>\n          {children}\n        </ConfirmProvider>");
fs.writeFileSync('app/layout.tsx', code, 'utf-8');
