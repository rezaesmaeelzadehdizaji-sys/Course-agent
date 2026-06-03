// patch-course8-injection-timing.mjs
// Two text edits in Section 5:
//   1. Rewrite "Injection day timing" sentence block
//   2. Remove "tents the loose skin at the nape of the neck," from Photo 5.1 caption

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const fixes = [
  [
    'Injection day timing: unlike water vaccination, do NOT plan injection sessions on a feed day. Birds that have recently eaten may regurgitate during handling and restraint, which stresses the bird and increases the risk of aspiration [20]. Schedule injection sessions on a non-feed day.',
    'Timing on injection day: unlike water vaccination, you do not need birds hungry or thirsty before you start. Try to avoid injecting birds right after a big feed, because a full crop plus handling can cause some birds to bring feed back up and increases the risk of aspiration. Aim to vaccinate at a steady time of day when birds are settled and not crowding the feeders or drinkers.',
  ],
  [
    'The operator tents the loose skin at the nape of the neck, inserts the needle at a low angle between the skin and the underlying muscle',
    'The operator inserts the needle at a low angle between the skin and the underlying muscle',
  ],
];

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  for (const [find, replace] of fixes) {
    if (!xml.includes(find)) throw new Error('Anchor not found: ' + find.slice(0, 70));
    if ((xml.split(find).length - 1) > 1) throw new Error('Anchor not unique: ' + find.slice(0, 70));
    xml = xml.replace(find, replace);
    console.log('  Replaced:', find.slice(0, 70) + '...');
  }

  // SAX + schema-nesting validation
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let info = null;
  parser.onopentag = (n) => {
    if (stopped) return;
    if (n.name === 'w:p' && (stack.includes('w:p') || stack.includes('w:pPr'))) {
      stopped = true; info = { issue: 'nested w:p', pos: parser.position }; return;
    }
    stack.push(n.name);
  };
  parser.onclosetag = (n) => { if (!stopped) stack.pop(); };
  parser.onerror = (e) => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) { console.error('XML INVALID:', info); throw new Error('SAX validation failed'); }
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  console.log('  SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
