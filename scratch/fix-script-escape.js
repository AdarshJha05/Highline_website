const fs = require('fs');
const { execSync } = require('child_process');

// THE REAL FIX:
// Inside any <script> tag in HTML, the sequence </script (case-insensitive) terminates the tag.
// The template JSON is stored inside a <script type="__bundler/template"> tag.
// If the JSON string contains </script (from the template HTML having <script> tags),
// the browser HTML parser terminates the outer script tag early, breaking JSON parsing.
//
// Fix: escape every occurrence of </ inside the template script tag by replacing it with <\/
// This is the standard practice (the runtime script itself does this with resourceScript).

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

let totalFixed = 0;

for (const f of files) {
  if (!fs.existsSync(f)) { console.log('SKIP:', f); continue; }
  
  let c = fs.readFileSync(f, 'utf8');
  
  // Find the template script tag
  const tTag = '<script type="__bundler/template">';
  const tStart = c.lastIndexOf(tTag);
  
  if (tStart === -1) { console.log(`SKIP (no template tag): ${f}`); continue; }
  
  const afterTagStart = tStart + tTag.length;
  
  // Find the TRUE end of this script block: 
  // We need to find </script> that is NOT inside the JSON string content.
  // The approach: find the closing </script> by looking for it at the FILE level
  // Since our JSON may contain </script>, we must find the LAST </script> in the file
  // (which is the actual closing tag, not one inside the JSON)
  const tEnd = c.lastIndexOf('</script>');
  
  if (tEnd <= tStart) { console.log(`SKIP (no end): ${f}`); continue; }
  
  const rawJsonStr = c.substring(afterTagStart, tEnd);
  
  // Check if it has the problem: any </script in the raw JSON content
  // The browser sees the LITERAL file bytes, not the JSON-decoded string
  // So </script anywhere in the file between the tag boundaries breaks it
  const hasScriptClose = rawJsonStr.toLowerCase().includes('</script');
  
  if (!hasScriptClose) {
    console.log(`OK (no fix needed): ${f}`);
    continue;
  }
  
  // Parse the JSON to get the HTML
  let html;
  try {
    html = JSON.parse(rawJsonStr);
    console.log(`${f}: Parsed OK, raw length=${rawJsonStr.length}`);
  } catch(e) {
    console.log(`${f}: JSON parse error: ${e.message}`);
    // Try to fix by using the lastIndexOf approach - but we need to use
    // the FIRST valid JSON end. Let me try a different approach:
    // use the last </script> as the boundary
    console.log('  Trying alternative parse...');
    try {
      // Check if rawJsonStr itself is valid
      html = JSON.parse(rawJsonStr.trim());
    } catch(e2) {
      console.log('  Alternative also failed:', e2.message);
      continue;
    }
  }
  
  // Re-serialize the JSON and escape </  to <\/ so browser HTML parser
  // won't terminate the script tag prematurely.
  // <\/ in a JSON string is valid and decodes to </ when JSON.parse runs.
  const safeJson = JSON.stringify(html).replace(/<\//g, '<\\/');
  
  // Verify the escaped version has no </script
  const stillHasScriptClose = safeJson.toLowerCase().includes('</script');
  if (stillHasScriptClose) {
    console.log(`  WARNING: Still has </script after escaping! Something went wrong.`);
    continue;
  }
  
  // Rebuild the file
  const before = c.substring(0, afterTagStart);
  const after = c.substring(tEnd);
  const newContent = before + safeJson + after;
  
  // Final validation: check that the outer file no longer has premature </script
  const premature = newContent.indexOf('</script', afterTagStart);
  console.log(`  Premature </script at: ${premature} (expected: ${newContent.lastIndexOf('</script')})`);
  
  if (premature !== newContent.lastIndexOf('</script>')) {
    // There's still a premature close - something is wrong
    // Check if there are multiple template-like closes
    let idx = afterTagStart;
    let closes = [];
    while((idx = newContent.indexOf('</script', idx)) !== -1) {
      closes.push(idx);
      idx += 8;
    }
    console.log(`  All </script positions after template start: ${closes.join(', ')}`);
    // If the only ones are in </script> at the very end, we're fine
    // Otherwise there's still a problem
  }
  
  fs.writeFileSync(f, newContent, 'utf8');
  console.log(`FIXED: ${f}`);
  totalFixed++;
}

console.log(`\nDone. Fixed ${totalFixed} files.`);
