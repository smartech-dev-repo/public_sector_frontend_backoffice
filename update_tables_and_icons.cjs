const fs = require('fs');
const path = require('path');

const FILTER_SVG = '<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="8" x2="20" y2="8"></line><circle cx="9" cy="8" r="2"></circle><line x1="4" y1="16" x2="20" y2="16"></line><circle cx="15" cy="16" r="2"></circle></svg>';
const EXPORT_SVG = '<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>';
const BUTTON_CLASS = 'flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Update thead
      content = content.replace(/<thead(?:\s+className="[^"]*")?>/g, '<thead className="bg-[#E9F4EE]">');
      content = content.replace(/(<thead className="bg-\[#E9F4EE\]">)\s*<tr(?:\s+className="[^"]*")?>/g, '$1\n                  <tr>');

      // Update th
      content = content.replace(/<th(?:\s+className="[^"]*")?>([\s\S]*?)<\/th>/g, (match, inner) => {
        return '<th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">' + inner + '</th>';
      });

      // Update Filter / Export buttons
      content = content.replace(/<button([^>]*)>([\s\S]*?)<\/button>/g, (match, attrs, inner) => {
        if (/^\s*<svg[\s\S]*?<\/svg>\s*Filter\s*$/.test(inner)) {
          let newAttrs = attrs.replace(/className="[^"]*"/, `className="${BUTTON_CLASS}"`);
          return `<button${newAttrs}>${FILTER_SVG} Filter</button>`;
        }
        if (/^\s*<svg[\s\S]*?<\/svg>\s*Export as Excel \(\.xlsx\)\s*$/.test(inner)) {
          let newAttrs = attrs.replace(/className="[^"]*"/, `className="${BUTTON_CLASS}"`);
          return `<button${newAttrs}>${EXPORT_SVG} Export as Excel (.xlsx)</button>`;
        }
        return match;
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir('app/dashboard');
