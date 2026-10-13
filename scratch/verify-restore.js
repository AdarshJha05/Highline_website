const fs = require('fs');

const c = fs.readFileSync('Home v4.dc.html', 'utf8');
const firstScript = c.indexOf('<script>');
const firstScriptEnd = c.indexOf('</script>', firstScript);
const script = c.substring(firstScript + '<script>'.length, firstScriptEnd);

// Verify 1: preloader injection block IS back
const hasPlInjection = script.includes("pl.id = 'hl-site-preloader'");
console.log('✓ Preloader injection back:', hasPlInjection);

// Verify 2: replaceWith is present
const hasReplaceWith = script.includes('document.documentElement.replaceWith');
console.log('✓ replaceWith present:', hasReplaceWith);

// Verify 3: timeout is 800 (not 2200)
const has2200 = script.includes('setTimeout(dismissPreloader, 2200)');
const has800 = script.includes('setTimeout(dismissPreloader, 800)');
console.log('✓ Timeout 2200ms removed:', !has2200);
console.log('✓ Timeout 800ms present:', has800);

// Verify 4: WhatsApp float still in template
const tTag = '<script type="__bundler/template">';
const tStart = c.lastIndexOf(tTag);
const tEnd = c.lastIndexOf('</script>');
const rawStr = c.substring(tStart + tTag.length, tEnd);
const html = JSON.parse(rawStr);
const hasWaFloat = html.includes('hl-wa-float');
console.log('✓ WhatsApp float preserved:', hasWaFloat);

// Verify 5: body opacity delay is 0ms (not 400ms)
const has400 = html.includes("e.remove()},400)");
const has0 = html.includes("e.remove()},0)");
console.log('✓ Body opacity 400ms removed:', !has400);
console.log('✓ Body opacity 0ms set:', has0);

// Verify 6: Check that the structure around replaceWith is correct
const rwIdx = script.indexOf('document.documentElement.replaceWith');
const plIdx = script.indexOf("pl.id = 'hl-site-preloader'");
console.log('\npreloader injection at:', plIdx, '| replaceWith at:', rwIdx);
console.log('✓ Preloader injection BEFORE replaceWith:', plIdx < rwIdx);
