const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const [name, url] of [
    ['contact', 'http://localhost:3333/contact.html'],
    ['index', 'http://localhost:3333/index.html'],
  ]) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const navData = await page.evaluate(() => {
      // Find the logo image
      const logo = document.querySelector('img[src*="b33f0486"]') || document.querySelector('img[src*="8c2c2d78"]');
      const logoRect = logo?.getBoundingClientRect();

      // Find nav link elements containing "Home"
      const allText = [...document.querySelectorAll('p')];
      const homeEl = allText.find(el => el.textContent.trim() === 'Home');
      const homeRect = homeEl?.getBoundingClientRect();

      // Find the nav wrapper (closest positioned ancestor of logo)
      let navWrapper = logo?.parentElement;
      while (navWrapper && getComputedStyle(navWrapper).position === 'static') {
        navWrapper = navWrapper.parentElement;
      }
      const navRect = navWrapper?.getBoundingClientRect();
      const navClass = navWrapper?.className;

      return {
        logo: logoRect ? { x: logoRect.x, y: logoRect.y, w: logoRect.width, h: logoRect.height } : null,
        home: homeRect ? { x: homeRect.x, y: homeRect.y, w: homeRect.width, h: homeRect.height } : null,
        nav: navRect ? { x: navRect.x, y: navRect.y, w: navRect.width, h: navRect.height } : null,
        navClass,
      };
    });

    console.log(`\n=== ${name} ===`);
    console.log(JSON.stringify(navData, null, 2));
  }

  await browser.close();
})();
