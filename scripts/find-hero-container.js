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
      const els = [...document.querySelectorAll('p, div')];
      const titleEl = els.find(el => el.childElementCount === 0 && el.textContent.trim().includes('Your Vision'));
      if (!titleEl) return { error: 'title not found' };

      const ancestors = [];
      let el = titleEl.parentElement;
      for (let i = 0; i < 25 && el && el.tagName !== 'BODY'; i++) {
        const r = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        ancestors.push({
          i,
          class: el.className?.substring(0, 80),
          w: Math.round(r.width), h: Math.round(r.height),
          x: Math.round(r.x), y: Math.round(r.y),
          cssWidth: cs.width,
          cssPosition: cs.position,
        });
        el = el.parentElement;
      }
      return ancestors;
    });

    console.log(`\n=== ${name} ===`);
    // Only show where size changes
    let lastW = -1;
    data.forEach((a) => {
      if (a.w !== lastW) {
        console.log(`  [${a.i}] "${a.class.split(' ').slice(0,3).join(' ')}" ${a.w}x${a.h} @ (${a.x},${a.y}) cssW=${a.cssWidth} pos=${a.cssPosition}`);
        lastW = a.w;
      }
    });
  }

  await browser.close();
})();
