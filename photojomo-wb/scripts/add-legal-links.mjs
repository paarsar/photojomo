import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'src/app/pages/home/home.component.html',
  'src/app/pages/about-us/about-us.component.html',
  'src/app/pages/contact/contact.component.html',
  'src/app/pages/exhibition/exhibition.component.html',
  'src/app/pages/global-tour/global-tour.component.html',
  'src/app/pages/residency/residency.component.html',
  'src/app/pages/saint-lucia/saint-lucia.component.html',
  'src/app/pages/caribbean-connections/caribbean-connections.component.html',
  'src/app/pages/caribbean-connections/about-connections/about-connections.component.html',
  'src/app/pages/caribbean-connections/experience/experience.component.html',
  'src/app/pages/caribbean-connections/contact-connections/contact-connections.component.html',
];

for (const file of files) {
  let src = readFileSync(file, 'utf8');
  if (src.includes('footer-legal-links')) continue;

  const re = /([ \t]*)<p class="[^"]*textContents">\s*\n\s*© 2026 Capture Caribbean\s*\n\s*<\/p>/;
  const match = src.match(re);
  if (!match) {
    console.log(`SKIP (no match): ${file}`);
    continue;
  }
  const indent = match[1];
  const nav =
    `${indent}<nav class="footer-legal-links" aria-label="Legal">\n` +
    `${indent}  <a routerLink="/info/rules">Official Rules</a>\n` +
    `${indent}  <a routerLink="/info/privacy-policy">Privacy Policy</a>\n` +
    `${indent}  <a routerLink="/info/terms-and-conditions">Terms of Service</a>\n` +
    `${indent}</nav>\n`;

  src = src.replace(re, (full) => nav + full);
  writeFileSync(file, src);
  console.log(`OK: ${file}`);
}
