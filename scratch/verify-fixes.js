const fs = require('fs');

const c = fs.readFileSync('Home v4.dc.html', 'utf8');

// Verify Fix 1: No more double preloader in runtime script
const firstScript = c.indexOf('<script>');
const firstScriptEnd = c.indexOf('</script>', firstScript);
const script = c.substring(firstScript, firstScriptEnd);

// Check that preloader injection is gone from before replaceWith
const plBeforeReplace = script.indexOf("pl.id = 'hl-site-preloader'");
const replaceWithIdx = script.indexOf('document.documentElement.replaceWith');
console.log('=== FIX 1 VERIFICATION ===');
console.log('preloader injection in runtime at:', plBeforeReplace);
console.log('replaceWith at:', replaceWithIdx);
if (plBeforeReplace === -1) {
  console.log('✓ Fix 1 OK: No duplicate preloader injection in runtime');
} else {
  console.log('✗ Fix 1 FAILED: Preloader injection still present at', plBeforeReplace);
  console.log('  Context around replaceWith:', script.substring(Math.max(0, replaceWithIdx-300), replaceWithIdx+50));
}

// Verify Fix 2: Timeout reduced
console.log('\n=== FIX 2 VERIFICATION ===');
const has2200 = script.includes('setTimeout(dismissPreloader, 2200)');
const has800 = script.includes('setTimeout(dismissPreloader, 800)');
console.log('Has 2200ms timeout:', has2200, '(should be false)');
console.log('Has 800ms timeout:', has800, '(should be true)');

// Verify Fix 3: body opacity delay removed
const tTag = '<script type="__bundler/template">';
const tStart = c.lastIndexOf(tTag);
const tEnd = c.lastIndexOf('</script>');
const rawStr = c.substring(tStart + tTag.length, tEnd);
const html = JSON.parse(rawStr);

console.log('\n=== FIX 3 VERIFICATION ===');
const has400 = html.includes("e.remove()},400)");
const has0 = html.includes("e.remove()},0)");
console.log('Has 400ms opacity delay:', has400, '(should be false)');
console.log('Has 0ms opacity delay:', has0, '(should be true)');

console.log('\n=== SUMMARY ===');
const allGood = plBeforeReplace === -1 && !has2200 && has800 && !has400;
console.log(allGood ? '✓ All fixes verified!' : '✗ Some fixes missing - check above');
