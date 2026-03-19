const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://capturecaribbean.figma.site';
const PAGES = [
  '/',
  '/global-tour',
  '/exhibition',
  '/caribbean-connection',
  '/residency',
  '/first-wave-challenge',
  '/saint-lucia',
  '/contact',
  '/about-us',
];
const OUT_DIR = path.join(__dirname, 'scraped');

async function scrapePage(page, url, slug) {
  const name = slug.replace(/\//g, '') || 'home';
  const dir = path.join(OUT_DIR, name);
  fs.mkdirSync(dir, { recursive: true });

  console.log(`\nScraping: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Screenshot
  await page.screenshot({ path: path.join(dir, 'screenshot.png'), fullPage: true });

  // Raw HTML
  const html = await page.content();
  fs.writeFileSync(path.join(dir, 'rendered.html'), html);

  // Text content
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(path.join(dir, 'text.txt'), text);

  // Design tokens
  const tokens = await page.evaluate(() => {
    const colors = new Set();
    const fonts = new Set();
    const fontSizes = new Set();
    document.querySelectorAll('*').forEach(el => {
      const s = window.getComputedStyle(el);
      if (s.color && s.color !== 'rgba(0, 0, 0, 0)') colors.add(s.color);
      if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add(s.backgroundColor);
      if (s.fontFamily) fonts.add(s.fontFamily);
      if (s.fontSize) fontSizes.add(s.fontSize);
    });
    return {
      colors: [...colors],
      fonts: [...fonts],
      fontSizes: [...fontSizes].sort((a, b) => parseFloat(a) - parseFloat(b)),
    };
  });
  fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(tokens, null, 2));

  console.log(`  ✓ ${name} — screenshot, HTML, text, tokens saved`);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Load homepage first to check for login
  console.log('Loading homepage...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });

  const bodyText = await page.evaluate(() => document.body.innerText || '');
  const needsLogin = bodyText.includes('Log in') || bodyText.includes('Sign up');

  if (needsLogin) {
    console.log('\n>>> Login required. Please log in in the browser window.');
    console.log('>>> Waiting up to 2 minutes...\n');
    try {
      await page.waitForFunction(
        () => {
          const t = document.body.innerText || '';
          return !t.includes('Log in') && !t.includes('Sign up') && t.length > 300;
        },
        { timeout: 120000, polling: 1000 }
      );
      console.log('Logged in!');
    } catch {
      console.log('Timed out — proceeding anyway.');
    }
    await page.waitForTimeout(3000);
  }

  // Scrape all pages
  for (const slug of PAGES) {
    await scrapePage(page, BASE_URL + slug, slug);
  }

  await browser.close();
  console.log('\nDone! All pages saved to ./scraped/');
})();
