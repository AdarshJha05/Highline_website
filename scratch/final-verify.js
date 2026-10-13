const fs = require('fs');

const files = ['Home v4.dc.html', 'Courses.dc.html', 'Course.dc.html', 'About v2.dc.html', 'FAQ.dc.html'];

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const tTag = '<script type="__bundler/template">';
  const tStart = c.lastIndexOf(tTag);
  const tEnd = c.lastIndexOf('</script>');
  const afterTagStart = tStart + tTag.length;
  
  // Check 1: No premature </script in the template block
  const firstClose = c.indexOf('</script', afterTagStart);
  const premature = firstClose !== tEnd;
  
  // Check 2: JSON parses correctly
  let jsonOk = false;
  let html = '';
  try {
    const rawStr = c.substring(afterTagStart, tEnd);
    html = JSON.parse(rawStr);
    jsonOk = true;
  } catch(e) {
    console.log(`${f}: ✗ JSON PARSE FAILED: ${e.message}`);
    continue;
  }
  
  // Check 3: WhatsApp float present
  const hasWaFloat = html.includes('hl-wa-float');
  
  // Check 4: No </script in the JSON string value
  const hasScriptInHtml = html.includes('</script');
  
  const status = !premature && jsonOk && hasWaFloat ? '✓' : '✗';
  console.log(`${status} ${f}`);
  console.log(`   No premature </script: ${!premature}`);
  console.log(`   JSON valid: ${jsonOk}`);
  console.log(`   WhatsApp float: ${hasWaFloat}`);
  console.log(`   </script in HTML value (OK, just in JSON): ${hasScriptInHtml}`);
}
