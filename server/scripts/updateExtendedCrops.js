const fs = require('fs');
let content = fs.readFileSync('src/data/cropDatasetExtended.ts', 'utf8');
content = content.replace(/(id:\s*'([^']+)'[\s\S]*?imageUrl:\s*)'https:\/\/images\.unsplash\.com\/[^']+'/g, (match, prefix, id) => {
  return `${prefix}'/crops/${id}.webp'`;
});
fs.writeFileSync('src/data/cropDatasetExtended.ts', content, 'utf8');
console.log('Successfully updated cropDatasetExtended.ts with local crop paths');
