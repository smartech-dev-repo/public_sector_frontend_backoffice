const fs = require('fs');
const path = require('path');

const replaceRules = [
  // Backgrounds
  { regex: /\bbg-white\b/g, replacement: 'bg-card' },
  { regex: /\bbg-slate-50\b/g, replacement: 'bg-muted/30' },
  { regex: /\bbg-slate-100\b/g, replacement: 'bg-muted/50' },
  { regex: /\bbg-slate-900\b/g, replacement: 'bg-slate-900 dark:bg-slate-800' }, // For inverted elements
  
  // Borders
  { regex: /\bborder-slate-100\b/g, replacement: 'border-border/50' },
  { regex: /\bborder-slate-200\b/g, replacement: 'border-border' },
  { regex: /\bborder-slate-300\b/g, replacement: 'border-border' },

  // Text colors
  { regex: /\btext-slate-800\b/g, replacement: 'text-foreground' },
  { regex: /\btext-slate-900\b/g, replacement: 'text-foreground' },
  { regex: /\btext-slate-700\b/g, replacement: 'text-foreground/90' },
  { regex: /\btext-slate-600\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-slate-500\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-muted-foreground/70' },

  // Hover states
  { regex: /\bhover:bg-slate-50\b/g, replacement: 'hover:bg-accent' },
  { regex: /\bhover:bg-slate-100\b/g, replacement: 'hover:bg-accent' },
  { regex: /\bhover:text-slate-600\b/g, replacement: 'hover:text-foreground' },
  { regex: /\bhover:text-slate-800\b/g, replacement: 'hover:text-foreground' },
  { regex: /\bhover:text-slate-900\b/g, replacement: 'hover:text-foreground' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const targetDirs = [
  path.join(__dirname, 'app/dashboard'),
  path.join(__dirname, 'components'),
  path.join(__dirname, 'app/components')
];

let files = [];
targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    files = files.concat(walk(dir));
  }
});

let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  replaceRules.forEach(rule => {
    newContent = newContent.replace(rule.regex, rule.replacement);
  });

  // Table header background specific fix
  newContent = newContent.replace(/bg-\[#E9F4EE\]/g, 'bg-[#E9F4EE] dark:bg-emerald-950/20');
  newContent = newContent.replace(/text-\[#018752\]/g, 'text-emerald-700 dark:text-emerald-400');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    modifiedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`\nAggressively updated ${modifiedFiles} files to support dark mode!`);
