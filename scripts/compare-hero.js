const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Local
  await page.goto('http://localhost:3333/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'hero-local.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('local done');

  // Live
  await page.goto('https://capturecaribbean.figma.site', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'hero-live.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('live done');

  await browser.close();
})();
