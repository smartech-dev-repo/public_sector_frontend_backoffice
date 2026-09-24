const fs = require('fs');
const path = require('path');

const composablesDir = path.join(__dirname, 'app', 'composables', 'modules');
const pagesDir = path.join(__dirname, 'app', 'dashboard');

// 1. Update composables
const composableFiles = fs.readdirSync(composablesDir).filter(f => f.endsWith('.ts'));

composableFiles.forEach(file => {
  const filePath = path.join(composablesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  if (content.includes('setMeta')) return; // Already patched

  content = content.replace(/const \[loading, setLoading\] = useState\(false\);/, 
    `const [loading, setLoading] = useState(false);\n  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });`);

  content = content.replace(/let dataList = (.*?);/, 
    `let dataList = $1;\n      if (res.data?.meta) setMeta(res.data.meta);`);

  content = content.replace(/return \{ (.*?) \};/g, `return { $1, meta };`);

  fs.writeFileSync(filePath, content);
});

// 2. Update pages
const findPages = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    let fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findPages(fullPath));
    } else if (file.endsWith('page.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
};

const pageFiles = findPages(pagesDir);

pageFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('<Pagination')) return; // Already patched

  // Determine what composable is used
  const useHookMatch = content.match(/const \{([^}]+)\} = use([A-Za-z]+)\(/);
  if (useHookMatch) {
      if (!content.includes('meta')) {
         content = content.replace(useHookMatch[1], useHookMatch[1] + ', meta ');
      }
  }

  // Import Pagination if not already
  if (!content.includes('import Pagination')) {
    content = content.replace(/import .*? from 'react';/, `$& \nimport Pagination from '@/app/components/ui/Pagination';`);
    if (!content.includes('import Pagination')) {
      content = `import Pagination from '@/app/components/ui/Pagination';\n` + content;
    }
  }

  // Find the fetch function call
  const fetchFnMatch = content.match(/fetch([A-Za-z]+)\(/);
  let fetchFn = fetchFnMatch ? fetchFnMatch[0].replace('(', '') : null;
  
  if (fetchFn) {
      if (!content.includes('const [page, setPage]')) {
          content = content.replace(/(export default function [^{]+\{)/, 
            `$1\n  const [page, setPage] = useState(1);\n  const [limit, setLimit] = useState(25);`);
      }

      // Update the fetch call
      content = content.replace(new RegExp(`(${fetchFn})\\(\\);`, 'g'), `$1({ page, limit });`);
      
      // Update dependencies
      content = content.replace(new RegExp(`\\[${fetchFn}\\]`), `[${fetchFn}, page, limit]`);
  }

  // Find the table and insert pagination
  if (content.includes('</table>')) {
      const paginationJSX = `
          {meta && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Pagination
                totalItems={meta.total || 0}
                currentPage={page || 1}
                itemsPerPage={limit || 25}
                onPageChange={(p) => setPage(p)}
                onItemsPerPageChange={(l) => setLimit(l)}
              />
            </div>
          )}
      `;
      content = content.replace(/<\/table>\s*<\/div>/, `</table></div>\n${paginationJSX}`);
  }

  fs.writeFileSync(filePath, content);
});

console.log("Pagination script executed (v2).");
