const fs = require('fs');

const c = fs.readFileSync('Home v4.dc.html','utf8');
const tTag = '<script type="__bundler/template">';
const tStart = c.lastIndexOf(tTag);
const tEnd = c.lastIndexOf('</script>');
const rawStr = c.substring(tStart + tTag.length, tEnd);
const html = JSON.parse(rawStr);

const waIdx = html.indexOf('hl-wa-float');
console.log('hl-wa-float found at:', waIdx);
if(waIdx !== -1) {
  console.log('Context:', html.substring(Math.max(0, waIdx-50), waIdx+500));
}
