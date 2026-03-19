const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const [name, url] of [
    ['live', 'https://capturecaribbean.figma.site'],
    ['local', 'http://localhost:3333/index.html'],
  ]) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4000);

    const data = await page.evaluate(() => {
      const r = el => { const b = el?.getBoundingClientRect(); return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null; };
      const cs = el => { const s = window.getComputedStyle(el); return { pos: s.position, w: s.width, h: s.height, top: s.top, left: s.left, transform: s.transform }; };

      const x82 = document.querySelector('.css-x82mwy');
      const ipijnl = document.querySelector('.css-ipijnl');
      const gqjo = document.querySelector('.css-19gqjo');
      const heroImg = document.querySelector('img[src*="5162c9366"]');

      return {
        heroImg: r(heroImg),
        x82mwy: { rect: r(x82), computed: x82 ? cs(x82) : null },
        ipijnl: { rect: r(ipijnl), computed: ipijnl ? cs(ipijnl) : null },
        gqjo: { rect: r(gqjo), computed: gqjo ? cs(gqjo) : null },
      };
    });

    console.log(`\n=== ${name} ===`);
    console.log(JSON.stringify(data, null, 2));
  }

  await browser.close();
})();
