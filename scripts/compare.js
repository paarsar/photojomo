const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Screenshot of our extracted file
  await page.goto('file://' + path.join(__dirname, 'html-output/index.html'), { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'compare-ours.png', fullPage: true });
  console.log('Our version screenshotted');

  // Screenshot of live site
  await page.goto('https://capturecaribbean.figma.site', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'compare-live.png', fullPage: true });
  console.log('Live site screenshotted');

  await browser.close();
})();
