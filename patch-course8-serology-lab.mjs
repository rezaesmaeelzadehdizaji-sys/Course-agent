// patch-course8-serology-lab.mjs
// Appends "You may also want to verify the accuracy of the lab results."
// to the post-vaccination serology paragraph in Section 5.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const fixes = [
  [
    'Work with your veterinarian to interpret serology results and decide whether revaccination is needed [5,20].',
    'Work with your veterinarian to interpret serology results and decide whether revaccination is needed [5,20]. You may also want to verify the accuracy of the lab results.',
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
