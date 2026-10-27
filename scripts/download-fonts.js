const fs = require('fs');
const path = require('path');
const https = require('https');

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap';

const destDir = path.resolve(__dirname, '../client/public/fonts');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function fetchText(uri) {
  return new Promise((resolve, reject) => {
    https.get(uri, { headers: { 'User-Agent': ua } }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

function downloadBinary(uri, dest) {
  return new Promise((resolve, reject) => {
    https.get(uri, { headers: { 'User-Agent': ua } }, (res) => {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
  });
}

async function main() {
  console.log('Fetching Google Fonts stylesheet...');
  const css = await fetchText(url);
  const regex = /url\((https:\/\/[^)]+\.woff2)\)/g;
  let match;
  const urls = [];
  while ((match = regex.exec(css)) !== null) {
    if (!urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }

  console.log(`Found ${urls.length} font woff2 chunks.`);
  let localCss = css;
  for (let i = 0; i < urls.length; i++) {
    const fontUrl = urls[i];
    const fileName = `font-${i + 1}.woff2`;
    const destPath = path.join(destDir, fileName);
    console.log(`Downloading (${i + 1}/${urls.length}): ${fileName}`);
    await downloadBinary(fontUrl, destPath);
    localCss = localCss.split(fontUrl).join(`/fonts/${fileName}`);
  }

  fs.writeFileSync(path.join(destDir, 'fonts.css'), localCss, 'utf8');
  console.log('Self-hosted fonts saved to client/public/fonts/fonts.css!');
}

main().catch((err) => {
  console.error('Error downloading fonts:', err);
  process.exit(1);
});
