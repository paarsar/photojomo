const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const [name, url] of [
    ['live', 'https://capturecaribbean.figma.site'],
    ['local', 'http://localhost:3333/index.html'],
  ]) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    const data = await page.evaluate(() => {
      const p = document.querySelector('.css-k1oxlm');
      if (!p) return { error: 'not found' };
      const cs = window.getComputedStyle(p);
      const r = p.getBoundingClientRect();

      // Check if font is actually loaded
      const fontLoaded = document.fonts.check(`64px "Sora:Regular"`);

      // Also check char codes of text
      const text = p.textContent;
      const charCodes = [...text].map(c => c.charCodeAt(0));

      return {
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontVariationSettings: cs.fontVariationSettings,
        width: Math.round(r.width),
        height: Math.round(r.height),
        text: text.trim(),
        textLength: text.length,
        charCodes: charCodes.slice(0, 25),
        fontLoaded,
      };
    });

    console.log(`\n=== ${name} ===`);
    console.log(JSON.stringify(data, null, 2));
  }

  await browser.close();
})();
