const fs = require('fs');
const path = require('path');

const composablesDir = path.join(__dirname, 'app/composables/modules');
const files = fs.readdirSync(composablesDir);

files.forEach(file => {
  if (!file.endsWith('.ts')) return;
  const filePath = path.join(composablesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('useCallback')) {
    content = content.replace("import { useState } from 'react';", "import { useState, useCallback } from 'react';");
    content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect, useCallback } from 'react';");
  }

  content = content.replace(/const (\w+) = async \((.*?)\) => {([\s\S]*?)\n  };/g, "const $1 = useCallback(async ($2) => {$3\n  }, []);");
  
  // also fix non-async functions if any
  content = content.replace(/const (\w+) = \((.*?)\) => {([\s\S]*?)\n  };/g, (match, p1, p2, p3) => {
    if (p1.startsWith('use') || p1 === 'loading' || p1 === 'error' || p1 === 'setLoading' || p1 === 'setError' || p1 === 'setClients' || p1 === 'setAgents') return match;
    return `const ${p1} = useCallback((${p2}) => {${p3}\n  }, []);`;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
});
console.log('Fixed composables');
