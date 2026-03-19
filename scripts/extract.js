const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://capturecaribbean.figma.site';
const PAGES = [
  { slug: '/', name: 'index' },
  { slug: '/global-tour', name: 'global-tour' },
  { slug: '/exhibition', name: 'exhibition' },
  { slug: '/caribbean-connection', name: 'caribbean-connection' },
  { slug: '/residency', name: 'residency' },
  { slug: '/first-wave-challenge', name: 'first-wave-challenge' },
  { slug: '/saint-lucia', name: 'saint-lucia' },
  { slug: '/contact', name: 'contact' },
  { slug: '/about-us', name: 'about-us' },
];
const OUT_DIR = path.join(__dirname, 'html-output');

async function extractPage(page, url, name) {
  console.log(`Extracting: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);

  const rawHTML = await page.evaluate(() => document.documentElement.outerHTML);

  // Replace all relative paths with absolute URLs pointing to the live CDN
  const fixed = rawHTML
    .replace(/from '\/_runtimes\//g, `from '${BASE_URL}/_runtimes/`)
    .replace(/import "\/_runtimes\//g, `import "${BASE_URL}/_runtimes/`)
    .replace(/src="\/_assets\//g, `src="${BASE_URL}/_assets/`)
    .replace(/srcset="([^"]*)"/g, (m, p1) => `srcset="${p1.replace(/\/_assets\//g, `${BASE_URL}/_assets/`)}"`)
    .replace(/url\("?\/_assets\//g, `url("${BASE_URL}/_assets/`)
    .replace(/url\("?\/_woff\//g, `url("${BASE_URL}/_woff/`)
    .replace(/href="\/_/g, `href="${BASE_URL}/_`)
    // Fix internal page links to point to local html files
    .replace(/href="\/global-tour"/g, 'href="global-tour.html"')
    .replace(/href="\/exhibition"/g, 'href="exhibition.html"')
    .replace(/href="\/caribbean-connection"/g, 'href="caribbean-connection.html"')
    .replace(/href="\/residency"/g, 'href="residency.html"')
    .replace(/href="\/first-wave-challenge"/g, 'href="first-wave-challenge.html"')
    .replace(/href="\/saint-lucia"/g, 'href="saint-lucia.html"')
    .replace(/href="\/contact"/g, 'href="contact.html"')
    .replace(/href="\/about-us"/g, 'href="about-us.html"')
    .replace(/href="\/"/g, 'href="index.html"');

  fs.writeFileSync(path.join(OUT_DIR, `${name}.html`), fixed);
  console.log(`  ✓ ${name}.html saved`);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const { slug, name } of PAGES) {
    await extractPage(page, BASE_URL + slug, name);
  }

  await browser.close();
  console.log(`\nDone! Files in ./html-output/`);
})();
