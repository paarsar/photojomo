const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Local server version
  await page.goto('http://localhost:3333/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'local.png', fullPage: true });
  console.log('Local screenshotted');

  // Live site
  await page.goto('https://capturecaribbean.figma.site', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'live.png', fullPage: true });
  console.log('Live screenshotted');

  await browser.close();
})();
