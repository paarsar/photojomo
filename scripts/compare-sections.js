const { chromium } = require('playwright');

async function cropSection(page, url, waitMs, y, height, outFile) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  // Scroll through the page to trigger lazy loading
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: outFile, clip: { x: 0, y, width: 1440, height } });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const sections = [
    { label: 'hero',         y: 0,    h: 700  },
    { label: 'tripath',      y: 700,  h: 700  },
    { label: 'residency',    y: 1400, h: 700  },
    { label: 'introducing',  y: 2100, h: 600  },
  ];

  for (const s of sections) {
    await cropSection(page, 'http://localhost:3333/index.html', 4000, s.y, s.h, `diff-local-${s.label}.png`);
    await cropSection(page, 'https://capturecaribbean.figma.site', 5000, s.y, s.h, `diff-live-${s.label}.png`);
    console.log(`${s.label} done`);
  }

  await browser.close();
})();
