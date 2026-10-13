const fs = require('fs');

// Compare git diff of the current file vs the last known working state
// The last working commit was c63a3e8 (before our changes)
// Let's look at what the original runtime script looked like at that commit

// First, let's see ALL the changes between working version and now
// by looking at git diff

// Let me also check if the issue is that after replaceWith, 
// the runtime script re-executes itself (it's in document.scripts)
// and on second run, tries to parse manifest/template again

// In the template, there are NO bundler scripts
// But the OUTER HTML has: __bundler/manifest, __bundler/ext_resources, 
//   __bundler/page_order, __bundler/template, and the runtime <script>
// After replaceWith with doc.documentElement (from template), 
// these outer scripts are GONE
// So 'const dead = Array.from(document.scripts)' gets the NEW doc's scripts
// which are: 1 external src script (blob uuid) + 2 inline scripts

// The await p; for the external script should wait for it to load
// If the blob URL for that uuid was not properly resolved, script load FAILS
// onerror fires, promise resolves, execution continues

// Let me check what uuid is expected and if it's in the manifest
const c = fs.readFileSync('Home v4.dc.html', 'utf8');

const tTag = '<script type="__bundler/template">';
const tStart = c.lastIndexOf(tTag);
const tEnd = c.lastIndexOf('</script>');
const rawStr = c.substring(tStart + tTag.length, tEnd);
const html = JSON.parse(rawStr);

const mTag = '<script type="__bundler/manifest">';
const mStart = c.indexOf(mTag);
const mEnd = c.indexOf('</script>', mStart);
const manifest = JSON.parse(c.substring(mStart + mTag.length, mEnd));

// The template has a script src="1b8e0513-6c20-4924-b2ac-89c4b38e042d"
// This UUID should be in the manifest
const targetUuid = '1b8e0513-6c20-4924-b2ac-89c4b38e042d';
console.log('UUID in manifest:', targetUuid in manifest);
console.log('UUID mime:', manifest[targetUuid] ? manifest[targetUuid].mime : 'NOT FOUND');
console.log('UUID compressed:', manifest[targetUuid] ? manifest[targetUuid].compressed : 'N/A');
console.log('UUID data length:', manifest[targetUuid] ? manifest[targetUuid].data.length : 0);

// Also list all UUIDs in template
const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
const templateUuids = [...new Set(html.match(uuidPattern) || [])];
console.log('\nAll UUIDs referenced in template:', templateUuids.length);
templateUuids.forEach(u => {
  const inManifest = u in manifest;
  console.log(`  ${u}: in manifest=${inManifest}`);
});

// Check total manifest entries
const manifestKeys = Object.keys(manifest);
console.log('\nTotal manifest entries:', manifestKeys.length);
