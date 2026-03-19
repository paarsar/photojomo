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
      const find = (text) => {
        const els = [...document.querySelectorAll('p, h1, h2, span, div')];
        return els.find(el => el.childElementCount === 0 && el.textContent.trim().includes(text));
      };

      const rect = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };

      const heroTitle = find('Your Vision');
      const caribAwait = find('Caribbean Awaits');
      const subtitle = find('HONORING') || find('Honoring');
      const enterBtn = find('Enter The');
      const winBtn = find('Win a Trip');

      // Find the hero image container
      const heroImg = document.querySelector('img[src*="5162c9366"]');
      const heroImgParent = heroImg?.parentElement;

      return {
        heroImg: rect(heroImg),
        heroTitle: rect(heroTitle),
        titleClass: heroTitle?.className,
        caribAwait: rect(caribAwait),
        subtitle: rect(subtitle),
        enterBtn: rect(enterBtn),
        winBtn: rect(winBtn),
      };
    });

    console.log(`\n=== ${name} ===`);
    console.log(JSON.stringify(data, null, 2));
  }

  await browser.close();
})();
