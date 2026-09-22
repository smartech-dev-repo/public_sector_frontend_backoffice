const fs = require('fs');
const path = require('path');

const composablesDir = path.join(__dirname, 'app/composables/modules');
const files = fs.readdirSync(composablesDir);

files.forEach(file => {
  if (!file.endsWith('.ts')) return;
  const filePath = path.join(composablesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find all state variables initialized as arrays: const [name, setName] = useState([]...
  const arraySetters = [];
  const regex = /const \[\w+, (set\w+)\] = useState\(\[\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    arraySetters.push(match[1]);
  }

  // Now for each array setter, find `setX(res.data);` and replace with safe extraction
  arraySetters.forEach(setter => {
    const searchStr = `${setter}(res.data);`;
    if (content.includes(searchStr)) {
      const replaceStr = `let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      ${setter}(dataList);`;
      
      content = content.replace(new RegExp(`${setter}\\(res\\.data\\);`, 'g'), replaceStr);
      
      // Also fix the return statement right after if it returns res.data
      content = content.replace(
        new RegExp(`${setter}\\(dataList\\);\\s*return res\\.data;`, 'g'),
        `${setter}(dataList);\n      return dataList;`
      );
    }
  });

  fs.writeFileSync(filePath, content, 'utf-8');
});
console.log('Fixed array extraction');
