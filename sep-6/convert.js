const fs = require('fs');
const path = require('path');

const files = [
  'GPB-AE-Offsite-Notes.md',
  'GPB-Offsite-AI-Vendor-Directory.md',
  'GPB-Offsite-Link-Index.md',
  'Rod_Discussion_Summary.md',
  'GPB-Offsite-Agentic-Landscape.md'
];

async function convert() {
  const { marked } = await import('marked');
  
  files.forEach(file => {
    const md = fs.readFileSync(file, 'utf-8');
    const html = marked(md);
    const htmlFile = file.replace('.md', '.html');
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${path.basename(file, '.md')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f4; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 15px; color: #666; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    fs.writeFileSync(htmlFile, fullHtml);
    console.log(`Converted ${file} -> ${htmlFile}`);
  });

  console.log('All files converted!');
}

convert();