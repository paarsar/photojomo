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
      const gqjo = document.querySelector('.css-19gqjo');
      if (!gqjo) return null;

      const children = [];
      function walk(el, depth) {
        if (depth > 5) return;
        const r = el.getBoundingClientRect();
        const text = el.childElementCount === 0 ? el.textContent.trim().slice(0, 40) : '';
        children.push({
          depth,
          class: el.className?.substring(0, 60),
          w: Math.round(r.width), h: Math.round(r.height),
          x: Math.round(r.x), y: Math.round(r.y),
          text,
        });
        for (const child of el.children) walk(child, depth + 1);
      }
      walk(gqjo, 0);
      return children;
    });

    console.log(`\n=== ${name} ===`);
    data?.forEach(c => {
      const indent = '  '.repeat(c.depth);
      console.log(`${indent}"${c.class}" ${c.w}x${c.h} @ (${c.x},${c.y}) ${c.text ? `"${c.text}"` : ''}`);
    });
  }

  await browser.close();
})();
