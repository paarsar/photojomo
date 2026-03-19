const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('file://' + path.join(__dirname, 'html-output/index.html'), { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'verify-ours.png', fullPage: true });
  console.log('Done');
  await browser.close();
})();
