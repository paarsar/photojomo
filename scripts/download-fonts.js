const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://capturecaribbean.figma.site';
const FONTS_DIR = path.join(__dirname, 'html-output', 'fonts');
const HTML_DIR = path.join(__dirname, 'html-output');

fs.mkdirSync(FONTS_DIR, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve();
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

// Collect all font URLs across all HTML files
const fontPaths = new Set();
for (const file of fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(HTML_DIR, file), 'utf8');
  for (const m of html.matchAll(/capturecaribbean\.figma\.site(\/_woff\/[^")\s]+\.woff2)/g)) {
    fontPaths.add(m[1]);
  }
}

console.log(`Found ${fontPaths.size} unique font files. Downloading...`);

(async () => {
  let done = 0;
  const fontMap = {};

  for (const fontPath of fontPaths) {
    const filename = fontPath.replace(/\//g, '_').replace(/^_/, '');
    const dest = path.join(FONTS_DIR, filename);
    const url = BASE_URL + fontPath;
    try {
      await download(url, dest);
      fontMap[fontPath] = `fonts/${filename}`;
      done++;
      process.stdout.write(`\r  Downloaded ${done}/${fontPaths.size}`);
    } catch (e) {
      console.error(`\n  Failed: ${url}`);
    }
  }

  console.log(`\nUpdating HTML files to use local fonts...`);

  // Update all HTML files to use local font paths
  for (const file of fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'))) {
    const filePath = path.join(HTML_DIR, file);
    let html = fs.readFileSync(filePath, 'utf8');
    for (const [original, local] of Object.entries(fontMap)) {
      html = html.replaceAll(`https://capturecaribbean.figma.site${original}`, local);
      html = html.replaceAll(`capturecaribbean.figma.site${original}`, local);
    }
    fs.writeFileSync(filePath, html);
    console.log(`  ✓ ${file} updated`);
  }

  console.log('\nDone!');
})();
