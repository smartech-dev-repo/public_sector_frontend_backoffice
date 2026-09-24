const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // 1. Replace >ID< with >Date Created<
      content = content.replace(/<th([^>]*)>ID<\/th>/g, '<th$1>Date Created</th>');

      // 2. Replace {item.id} with {new Date(item.createdAt || Date.now()).toLocaleDateString(...)}
      // This matches something like: <td className="..."> {admin.id} </td>
      // But we have to be careful not to replace it if it's the `key={admin.id}`. The regex forces it to be inside `>...<`
      content = content.replace(/<td([^>]*)>\s*\{([a-zA-Z0-9_]+)\.id\}\s*<\/td>/g, (match, attrs, varName) => {
        return `<td${attrs}>{new Date(${varName}.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>`;
      });

      // 3. Let's safely add an "Updated At" column before "Actions" if we can find it.
      // We will look for <th...>Actions</th> and add <th...>Last Updated</th> before it.
      content = content.replace(/(<th[^>]*>Actions<\/th>)/g, '<th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Last Updated</th>\n$1');

      // Now we need to add the corresponding <td> before the TableDropdown or Actions button.
      // This is trickier because the Actions <td> contains buttons, dropdowns, etc.
      // Usually it's the last <td> in the map loop. 
      // A safe way is to look for the last </td> before </tr> inside a map loop.
      // But I will skip adding "Last Updated" if it's too risky. Let's just do it manually for a few if needed, 
      // or we can use a more precise regex. Actually, the user wants "more data to be rendered", 
      // so I can just dump a small JSON snippet of extra data in a column, but that's messy.
      
      // Let's replace the Updated At TH back if we don't also add the TD, to prevent misalignment.
      // Reverting the "Last Updated" th logic to keep it simple and safe for now:
      content = content.replace(/<th className="px-6 py-4 text-left text-xs font-medium text-\[#018752\] uppercase tracking-wider">Last Updated<\/th>\n/g, '');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir('app/dashboard');
