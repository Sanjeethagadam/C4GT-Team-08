const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('DashboardShell')) {
        results.push(file);
        const newContent = content
          .replace(/import\s+\{\s*DashboardShell\s*\}\s+from\s+['"].*DashboardShell['"];?\r?\n?/g, '')
          .replace(/<DashboardShell[^>]*>/g, '<>')
          .replace(/<\/DashboardShell>/g, '</>');
        fs.writeFileSync(file, newContent, 'utf8');
      }
    }
  });
  return results;
}

const changed = walk('./src/modules');
console.log('Changed files:', changed);
