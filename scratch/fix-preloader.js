const fs = require('fs');

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

let totalUpdated = 0;

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(`SKIP (not found): ${f}`);
    continue;
  }
  
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  // FIX 1: Remove duplicate preloader injection that happens right before replaceWith
  // The runtime creates a NEW preloader div into the parsed doc, but the static HTML 
  // body already has #hl-site-preloader, so after replaceWith there are two of them.
  // Strategy: use regex to match doc.body preloader block regardless of line ending style
  
  // Match: if (doc.body) { ... pl.id = 'hl-site-preloader' ...  }
  //        if (doc.head) { ... ps.id = 'hl-pre-css' ... }
  //        document.documentElement.replaceWith(...)
  // And replace with just the replaceWith line.
  
  const preloaderBlockRegex = /(\s+if \(doc\.body\) \{[\s\S]*?pl\.id = 'hl-site-preloader'[\s\S]*?\}\s+if \(doc\.head\) \{[\s\S]*?ps\.id = 'hl-pre-css'[\s\S]*?\}\s+)(document\.documentElement\.replaceWith\(doc\.documentElement\);)/;
  
  if (preloaderBlockRegex.test(c)) {
    c = c.replace(preloaderBlockRegex, '\n    $2');
    console.log(`  Fix 1 applied (removed double preloader): ${f}`);
    changed = true;
  } else {
    console.log(`  Fix 1 SKIPPED (pattern not found): ${f}`);
  }
  
  // FIX 2: Reduce slow fallback timeout from 2200ms → 800ms
  // Also speed up the rAF dismiss (250→100ms) and load dismiss (100→30ms)
  const slowTimeoutRegex = /requestAnimationFrame\(function\(\) \{ setTimeout\(dismissPreloader, 250\); \}\);(\s*)window\.addEventListener\('load', function\(\) \{ setTimeout\(dismissPreloader, 100\); \}\);(\s*)setTimeout\(dismissPreloader, 2200\);/;
  
  if (slowTimeoutRegex.test(c)) {
    c = c.replace(slowTimeoutRegex, 
      `requestAnimationFrame(function() { setTimeout(dismissPreloader, 100); });$1window.addEventListener('load', function() { setTimeout(dismissPreloader, 30); });$2setTimeout(dismissPreloader, 800);`
    );
    console.log(`  Fix 2 applied (reduced timeouts): ${f}`);
    changed = true;
  } else {
    console.log(`  Fix 2 SKIPPED (timeout pattern not found): ${f}`);
  }
  
  // FIX 3: Fix the body{opacity:0} flash in the TEMPLATE HTML
  // The inline script in the template uses sessionStorage to briefly hide body with opacity:0
  // and removes the style after 400ms - this causes the "flicker" before content shows.
  // Change the 400ms removal delay to 0ms (instant removal).
  // This is inside the JSON-encoded template.
  const tTag = '<script type="__bundler/template">';
  const tStart = c.lastIndexOf(tTag);
  const tEnd = c.lastIndexOf('</script>');
  
  if (tStart !== -1 && tEnd !== -1) {
    const before = c.substring(0, tStart + tTag.length);
    const rawStr = c.substring(tStart + tTag.length, tEnd);
    const after = c.substring(tEnd);
    
    let html;
    try {
      html = JSON.parse(rawStr);
    } catch(e) {
      console.log(`  Fix 3 SKIPPED (JSON parse error): ${f}`);
      if (changed) fs.writeFileSync(f, c, 'utf8');
      continue;
    }
    
    // The body{opacity:0} inline script pattern in the template HTML
    // Look for the hl_pre3 check with the 400ms timeout  
    const opacityPattern = /\(function\(\)\{try\{var s=sessionStorage[\s\S]{0,400}body\{opacity:0\}[\s\S]{0,400}setTimeout\(function\(\)\{var e=document\.getElementById\('hl-cover'\);if\(e\)e\.remove\(\)\},400\)\}catch\(e\)\{\}\}\)\(\);/;
    
    if (opacityPattern.test(html)) {
      // Replace the 400ms timeout with immediate removal (0ms)
      // Also make it skip the opacity:0 entirely on repeat visits
      const newOpacityScript = `(function(){try{var s=sessionStorage;if(!window.matchMedia||!matchMedia('(prefers-reduced-motion: reduce)').matches){var e=document.getElementById('hl-cover');if(e)e.remove()}}catch(e){}})();`;
      html = html.replace(opacityPattern, newOpacityScript);
      const newRaw = JSON.stringify(html);
      c = before + newRaw + after;
      console.log(`  Fix 3 applied (removed body opacity delay): ${f}`);
      changed = true;
    } else {
      // Try simpler approach: just replace the 400ms delay with 0ms
      if (html.includes("e.remove()},400)")) {
        html = html.replace(/e\.remove\(\)\},400\)/g, "e.remove()},0)");
        const newRaw = JSON.stringify(html);
        c = before + newRaw + after;
        console.log(`  Fix 3b applied (changed 400ms->0ms): ${f}`);
        changed = true;
      } else {
        console.log(`  Fix 3 SKIPPED (pattern not found): ${f}`);
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(f, c, 'utf8');
    console.log(`  SAVED: ${f}`);
    totalUpdated++;
  }
}

console.log(`\nDone. Updated ${totalUpdated} files.`);
