const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, 'html-output');
const NG_DIR = path.join(__dirname, '..', 'photojomo-web');
const PAGES_DIR = path.join(NG_DIR, 'src', 'app', 'pages');
const ASSETS_FONTS_DIR = path.join(NG_DIR, 'src', 'assets', 'fonts');

fs.mkdirSync(PAGES_DIR, { recursive: true });
fs.mkdirSync(ASSETS_FONTS_DIR, { recursive: true });

const pages = [
  { file: 'index.html',                 slug: 'home',                  route: '',                     selector: 'app-home',                  dir: 'home' },
  { file: 'global-tour.html',           slug: 'global-tour',           route: 'global-tour',           selector: 'app-global-tour',           dir: 'global-tour' },
  { file: 'exhibition.html',            slug: 'exhibition',            route: 'exhibition',            selector: 'app-exhibition',            dir: 'exhibition' },
  { file: 'caribbean-connection.html',  slug: 'caribbean-connection',  route: 'caribbean-connection',  selector: 'app-caribbean-connection',  dir: 'caribbean-connection' },
  { file: 'residency.html',             slug: 'residency',             route: 'residency',             selector: 'app-residency',             dir: 'residency' },
  { file: 'first-wave-challenge.html',  slug: 'first-wave-challenge',  route: 'first-wave-challenge',  selector: 'app-first-wave-challenge',  dir: 'first-wave-challenge' },
  { file: 'saint-lucia.html',           slug: 'saint-lucia',           route: 'saint-lucia',           selector: 'app-saint-lucia',           dir: 'saint-lucia' },
  { file: 'contact.html',               slug: 'contact',               route: 'contact',               selector: 'app-contact',               dir: 'contact' },
  { file: 'about-us.html',              slug: 'about-us',              route: 'about-us',              selector: 'app-about-us',              dir: 'about-us' },
];

// Slug to camelCase component name
function toCamelCase(slug) {
  return slug.split('-').map((s, i) => i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

// Convert .html nav link hrefs to Angular routerLinks
function fixNavLinks(html) {
  return html
    .replace(/href="index\.html"/g, 'routerLink="/"')
    .replace(/href="global-tour\.html"/g, 'routerLink="/global-tour"')
    .replace(/href="exhibition\.html"/g, 'routerLink="/exhibition"')
    .replace(/href="caribbean-connection\.html"/g, 'routerLink="/caribbean-connection"')
    .replace(/href="residency\.html"/g, 'routerLink="/residency"')
    .replace(/href="first-wave-challenge\.html"/g, 'routerLink="/first-wave-challenge"')
    .replace(/href="saint-lucia\.html"/g, 'routerLink="/saint-lucia"')
    .replace(/href="contact\.html"/g, 'routerLink="/contact"')
    .replace(/href="about-us\.html"/g, 'routerLink="/about-us"');
}

// Extract everything between <style> and </style>, skipping noscript blocks
function extractStyles(html) {
  // Remove noscript blocks first so we don't pick up display:none for #container
  const noNoscript = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  const styles = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(noNoscript)) !== null) {
    styles.push(m[1]);
  }
  return styles.join('\n');
}

// Extract the <div id="container"> ... </div> body content
function extractContainer(html) {
  const start = html.indexOf('<div id="container">');
  if (start === -1) return '';
  // find the closing </div> that matches
  let depth = 0;
  let i = start;
  while (i < html.length) {
    if (html.startsWith('<div', i)) depth++;
    else if (html.startsWith('</div>', i)) {
      depth--;
      if (depth === 0) {
        return html.slice(start, i + 6);
      }
    }
    i++;
  }
  return html.slice(start);
}

// Fix font paths: fonts/ -> assets/fonts/
function fixFontPaths(css) {
  return css.replace(/url\("fonts\//g, 'url("/assets/fonts/');
}

let allCss = '';
const routeParts = [];
const importParts = [];

for (const page of pages) {
  const filePath = path.join(HTML_DIR, page.file);
  const html = fs.readFileSync(filePath, 'utf8');

  let css = extractStyles(html);
  css = fixFontPaths(css);

  let container = extractContainer(html);
  container = container.replace(/<\/body>/g, '').replace(/<\/html>/g, '');
  container = fixNavLinks(container);

  const componentName = toCamelCase(page.slug) + 'Component';
  const pageDir = path.join(PAGES_DIR, page.dir);
  fs.mkdirSync(pageDir, { recursive: true });

  // Write template
  fs.writeFileSync(path.join(pageDir, `${page.dir}.component.html`), container);

  // Write styles (no ViewEncapsulation needed - we'll put all CSS globally)
  // But write per-component css file anyway for reference
  fs.writeFileSync(path.join(pageDir, `${page.dir}.component.css`), '/* Styles are in global styles.css */');

  // Write component TS
  const ts = `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: '${page.selector}',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './${page.dir}.component.html',
  styleUrls: ['./${page.dir}.component.css'],
})
export class ${componentName} {}
`;
  fs.writeFileSync(path.join(pageDir, `${page.dir}.component.ts`), ts);

  // Collect CSS for global styles
  allCss += `\n/* ===== ${page.slug} ===== */\n${css}\n`;

  // Route
  const routePath = page.route === '' ? '' : page.route;
  importParts.push(`import { ${componentName} } from './pages/${page.dir}/${page.dir}.component';`);
  routeParts.push(`  { path: '${routePath}', component: ${componentName} }`);

  console.log(`✓ Generated ${page.dir} component`);
}

// Write global styles (start fresh, Tailwind directives first)
const tailwindDirectives = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n`;
fs.writeFileSync(path.join(NG_DIR, 'src', 'styles.css'), tailwindDirectives + allCss);
console.log('✓ Wrote global styles.css');

// Write app.routes.ts
const routesContent = `import { Routes } from '@angular/router';
${importParts.join('\n')}

export const routes: Routes = [
${routeParts.join(',\n')},
  { path: '**', redirectTo: '' },
];
`;
fs.writeFileSync(path.join(NG_DIR, 'src', 'app', 'app.routes.ts'), routesContent);
console.log('✓ Wrote app.routes.ts');

// Write app.component.html (just the router outlet)
fs.writeFileSync(path.join(NG_DIR, 'src', 'app', 'app.component.html'), '<router-outlet />\n');
console.log('✓ Wrote app.component.html');

// Update app.component.ts to import RouterOutlet
const appComponentTs = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}
`;
fs.writeFileSync(path.join(NG_DIR, 'src', 'app', 'app.component.ts'), appComponentTs);
console.log('✓ Wrote app.component.ts');

console.log('\nDone! Now copy fonts...');
