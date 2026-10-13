const fs = require('fs');

// Extract template from Home v4.dc.html and save to scratch
const c = fs.readFileSync('Home v4.dc.html','utf8');
const tTag = '<script type="__bundler/template">';
const tStart = c.lastIndexOf(tTag);
const tEnd = c.lastIndexOf('</script>');
const rawStr = c.substring(tStart + tTag.length, tEnd);

const html = JSON.parse(rawStr);

// Find body closing tag
const bodyCloseIdx = html.lastIndexOf('</body>');
console.log('body close idx:', bodyCloseIdx);
console.log('Total html length:', html.length);
console.log('Near body close:', html.substring(Math.max(0, bodyCloseIdx-300), bodyCloseIdx + 50));
