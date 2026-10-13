const fs = require('fs');

const c = fs.readFileSync('Home v4.dc.html', 'utf8');
const tTag = '<script type="__bundler/template">';
const tStart = c.lastIndexOf(tTag);
const tEnd = c.lastIndexOf('</script>');
const rawStr = c.substring(tStart + tTag.length, tEnd);
const html = JSON.parse(rawStr);

// Find ALL occurrences of </script in the JSON raw string
let idx = 0;
let count = 0;
while((idx = rawStr.indexOf('</script', idx)) !== -1 && count < 10) {
  count++;
  console.log(`\n=== Occurrence ${count} at position ${idx} ===`);
  console.log('Context:', rawStr.substring(Math.max(0, idx-100), idx+100));
  idx += 8;
}

// Also check: does the OUTER html file have </script prematurely?
// Find the bundler/template script block in the raw file
const rawTemplateStart = c.indexOf(tTag) + tTag.length;
// Find the FIRST </script after this point
const firstScriptClose = c.indexOf('</script', rawTemplateStart);
console.log('\n=== In outer file ===');
console.log('Template starts at:', rawTemplateStart);
console.log('First </script after template start:', firstScriptClose);
console.log('Expected lastIndexOf </script:', tEnd);
console.log('Are they the same?', firstScriptClose === tEnd);
if (firstScriptClose !== tEnd) {
  console.log('\n!!! CRITICAL: </script found PREMATURELY inside template script tag !!!');
  console.log('Premature close at:', firstScriptClose);
  console.log('Context of premature close:');
  console.log(c.substring(Math.max(0, firstScriptClose-200), firstScriptClose+50));
}
