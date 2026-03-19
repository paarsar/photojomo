const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://capturecaribbean.figma.site';
const ASSETS_DIR = path.join(__dirname, 'assets');
const SCRAPED_DIR = path.join(__dirname, 'scraped');

fs.mkdirSync(ASSETS_DIR, { recursive: true });

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
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Collect all asset paths from all rendered HTML files
const assetPaths = new Set();
const pages = fs.readdirSync(SCRAPED_DIR);
for (const page of pages) {
  const htmlFile = path.join(SCRAPED_DIR, page, 'rendered.html');
  if (!fs.existsSync(htmlFile)) continue;
  const html = fs.readFileSync(htmlFile, 'utf8');
  const matches = html.matchAll(/\/_assets\/v11\/([^"'\s,]+)/g);
  for (const m of matches) {
    // Strip query params for the filename, but download full URL
    const assetPath = m[1].split('?')[0];
    assetPaths.add(assetPath);
  }
}

console.log(`Found ${assetPaths.size} unique assets. Downloading...`);

(async () => {
  let done = 0;
  for (const assetPath of assetPaths) {
    const url = `${BASE_URL}/_assets/v11/${assetPath}`;
    const ext = path.extname(assetPath) || '.png';
    const filename = assetPath.replace(/\//g, '_');
    const dest = path.join(ASSETS_DIR, filename);
    try {
      await download(url, dest);
      done++;
      process.stdout.write(`\r  Downloaded ${done}/${assetPaths.size}`);
    } catch (e) {
      console.error(`\n  Failed: ${url} — ${e.message}`);
    }
  }
  console.log(`\nDone! ${done} assets saved to ./assets/`);
})();
