import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'src/app/pages/caribbean-connections/about-connections/about-connections.component.html',
  'src/app/pages/caribbean-connections/experience/experience.component.html',
  'src/app/pages/caribbean-connections/contact-connections/contact-connections.component.html',
];

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');

  let position = 0;
  const figureRe = /^(\s*)<figure class="polaroid (polaroid-r[1-6])">/;
  const updated = lines.map((line) => {
    const m = line.match(figureRe);
    if (!m) return line;
    if (line.includes('polaroid-p')) return line;
    const withPosition = line.replace(
      /class="polaroid (polaroid-r[1-6])"/,
      `class="polaroid $1 polaroid-p${position}"`,
    );
    position += 1;
    return withPosition;
  });

  if (position !== 14) {
    console.warn(`WARN: ${file} has ${position} polaroids (expected 14)`);
  }

  writeFileSync(file, updated.join('\n'));
  console.log(`OK: ${file} (${position} polaroids labeled)`);
}
