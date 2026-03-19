const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const [name, url] of [
    ['index', 'http://localhost:3333/index.html'],
    ['contact', 'http://localhost:3333/contact.html'],
    ['about-us', 'http://localhost:3333/about-us.html'],
  ]) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `nav-${name}.png`, clip: { x: 0, y: 0, width: 1440, height: 120 } });
    console.log(`${name} done`);
  }

  await browser.close();
})();
