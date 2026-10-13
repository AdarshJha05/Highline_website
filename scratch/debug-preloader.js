const fs = require('fs');

// Check Courses.dc.html for preloader pattern
const c = fs.readFileSync('Courses.dc.html', 'utf8');

// Find all script type=none
const firstScript = c.indexOf('<script>');
const firstScriptEnd = c.indexOf('</script>', firstScript);
const scriptContent = c.substring(firstScript + '<script>'.length, firstScriptEnd);
fs.writeFileSync('scratch/courses-script.js', scriptContent);

// Check if the pattern exists differently
const plIdx = scriptContent.indexOf('hl-site-preloader');
console.log('hl-site-preloader at:', plIdx);
if(plIdx !== -1) {
  console.log('Context:', scriptContent.substring(Math.max(0, plIdx-50), plIdx+300));
}

// Check the timeout
const toIdx = scriptContent.indexOf('setTimeout(dismissPreloader, 2200)');
console.log('Timeout 2200 at:', toIdx);
if(toIdx !== -1) {
  console.log('Context:', scriptContent.substring(Math.max(0, toIdx-100), toIdx+100));
}

// Check replaceWith
const rwIdx = scriptContent.indexOf('replaceWith');
console.log('replaceWith at:', rwIdx);
if(rwIdx !== -1) {
  console.log('Context:', scriptContent.substring(Math.max(0, rwIdx-300), rwIdx+100));
}
