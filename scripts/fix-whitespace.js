const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, 'html-output');
const PRE_CLASSES = ['css-4r4q1m', 'css-k1oxlm', 'css-366pmd', 'css-f9j6z9'];

for (const file of fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'))) {
  const filePath = path.join(HTML_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let count = 0;

  // Fix: <tagname ...class="...pre-class..."\n>\n  text with spaces\n</tagname>
  // Strip leading/trailing whitespace from text-only content inside elements with pre classes
  const classPattern = PRE_CLASSES.join('|');
  // Match opening tag that contains one of the pre classes, then capture the content, then closing tag
  // This handles both single-line and multi-line cases where the tag spans multiple lines
  html = html.replace(
    /(<(?:p|span|div)[^>]*(?:css-4r4q1m|css-k1oxlm|css-366pmd|css-f9j6z9)[^>]*>)\s+([^<]+?)\s+(<\/(?:p|span|div)>)/g,
    (match, open, text, close) => {
      count++;
      return `${open}${text.trim()}${close}`;
    }
  );

  fs.writeFileSync(filePath, html);
  console.log(`${file}: fixed ${count} elements`);
}
