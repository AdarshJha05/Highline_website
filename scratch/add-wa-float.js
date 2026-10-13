const fs = require('fs');

// WhatsApp SVG icon as data URI
const waIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

// WhatsApp float HTML to inject before </body></html>
const waFloatHTML = `
<!-- Floating WhatsApp Button -->
<a id="hl-wa-float" href="https://wa.me/919392882152?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20your%20courses." target="_blank" rel="noopener" aria-label="Chat on WhatsApp" style="position:fixed;bottom:24px;right:24px;z-index:9999;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#25D366,#128C7E);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,0.45),0 2px 8px rgba(0,0,0,0.18);text-decoration:none;transition:transform 0.2s cubic-bezier(.34,1.56,.64,1),box-shadow 0.2s ease" onmouseover="this.style.transform='scale(1.12)';this.style.boxShadow='0 8px 24px rgba(37,211,102,0.55),0 4px 12px rgba(0,0,0,0.22)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 16px rgba(37,211,102,0.45),0 2px 8px rgba(0,0,0,0.18)'">${waIconSVG}</a>
`;

const files = [
  'Home v4.dc.html',
  'Courses.dc.html',
  'Course.dc.html',
  'About v2.dc.html',
  'Admissions.dc.html',
  'Contact v2.dc.html',
  'FAQ.dc.html',
  'Placements.dc.html',
  'Pay Fees.dc.html',
  'Legal.dc.html',
  'Resources.dc.html'
];

let updatedCount = 0;

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(`SKIP (not found): ${f}`);
    continue;
  }
  
  let c = fs.readFileSync(f, 'utf8');
  
  // Find the template section
  const tTag = '<script type="__bundler/template">';
  const tStart = c.lastIndexOf(tTag);
  const tEnd = c.lastIndexOf('</script>');
  
  if (tStart === -1 || tEnd === -1) {
    console.log(`SKIP (no template): ${f}`);
    continue;
  }
  
  const before = c.substring(0, tStart + tTag.length);
  const rawStr = c.substring(tStart + tTag.length, tEnd);
  const after = c.substring(tEnd);
  
  // Parse the HTML template
  let html;
  try {
    html = JSON.parse(rawStr);
  } catch(e) {
    console.log(`SKIP (JSON parse error): ${f}:`, e.message);
    continue;
  }
  
  // Check if already has the float button
  if (html.indexOf('hl-wa-float') !== -1) {
    console.log(`SKIP (already has float): ${f}`);
    continue;
  }
  
  // Find </body></html> in the HTML template
  const bodyClose = html.lastIndexOf('</body>');
  if (bodyClose === -1) {
    console.log(`SKIP (no </body>): ${f}`);
    continue;
  }
  
  // Insert the WhatsApp button before </body>
  const newHtml = html.substring(0, bodyClose) + waFloatHTML + html.substring(bodyClose);
  
  // Re-serialize back into JSON
  const newRaw = JSON.stringify(newHtml);
  
  // Rebuild the file
  const newContent = before + newRaw + after;
  fs.writeFileSync(f, newContent, 'utf8');
  
  console.log(`UPDATED: ${f}`);
  updatedCount++;
}

console.log(`\nDone. Updated ${updatedCount} files.`);
