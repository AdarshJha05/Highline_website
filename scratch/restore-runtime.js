const fs = require('fs');
const { execSync } = require('child_process');

// Strategy: 
// 1. Get the original runtime script from c63a3e8 (last known working commit)
// 2. Extract it from each file
// 3. Apply ONLY the timeout reduction (2200ms -> 800ms) - keep everything else original
// 4. Leave the preloader injection block INTACT (it was there for a reason)
// 5. Also keep the WhatsApp float button we added

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

for (const f of files) {
  if (!fs.existsSync(f)) { console.log('SKIP:', f); continue; }
  
  // Get original file from git
  let origContent;
  try {
    origContent = execSync(`git show c63a3e8:"${f}"`, { maxBuffer: 50 * 1024 * 1024 }).toString();
  } catch(e) {
    console.log(`SKIP (git error): ${f}:`, e.message.substring(0,100));
    continue;
  }
  
  let currentContent = fs.readFileSync(f, 'utf8');
  
  // Extract the runtime script from original (between first <script> and </script>)
  const origScriptStart = origContent.indexOf('<script>');
  const origScriptEnd = origContent.indexOf('</script>', origScriptStart);
  if (origScriptStart === -1 || origScriptEnd === -1) {
    console.log(`SKIP (no script): ${f}`);
    continue;
  }
  const origRuntime = origContent.substring(origScriptStart, origScriptEnd + '</script>'.length);
  
  // Extract the current runtime script location in current file
  const curScriptStart = currentContent.indexOf('<script>');
  const curScriptEnd = currentContent.indexOf('</script>', curScriptStart);
  if (curScriptStart === -1 || curScriptEnd === -1) {
    console.log(`SKIP (no current script): ${f}`);
    continue;
  }
  
  // Replace current runtime with original runtime
  let newContent = currentContent.substring(0, curScriptStart) + origRuntime + currentContent.substring(curScriptEnd + '</script>'.length);
  
  // Now apply ONLY the timeout reduction to the restored script - reduce 2200 -> 800ms
  newContent = newContent.replace(
    'setTimeout(dismissPreloader, 2200);',
    'setTimeout(dismissPreloader, 800);'
  );
  
  // Also fix the body opacity 400ms -> 0ms (Fix 3) in the TEMPLATE only if needed
  // Extract template from current file (after other changes)
  const tTag = '<script type="__bundler/template">';
  const tStart = newContent.lastIndexOf(tTag);
  const tEnd = newContent.lastIndexOf('</script>');
  if (tStart !== -1 && tEnd !== -1) {
    const before = newContent.substring(0, tStart + tTag.length);
    const rawStr = newContent.substring(tStart + tTag.length, tEnd);
    const after = newContent.substring(tEnd);
    
    try {
      let html = JSON.parse(rawStr);
      // Only apply if the 400ms is still present in this version
      if (html.includes("e.remove()},400)")) {
        html = html.replace(/e\.remove\(\)\},400\)/g, "e.remove()},0)");
        newContent = before + JSON.stringify(html) + after;
        console.log(`  Fix 3b also applied: ${f}`);
      }
    } catch(e) {
      console.log(`  Fix 3 parse error: ${f}`);
    }
  }
  
  fs.writeFileSync(f, newContent, 'utf8');
  console.log(`RESTORED + FIXED: ${f}`);
}

console.log('\nDone.');
