// patch-course8-move-sc-preferred.mjs
// Moves "Subcutaneous injection is the preferred route..." from after Photo 5.1
// and merges it into the "two standard injection routes" paragraph (before Photo 5.1).

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

function saxValidate(xml) {
  const parser = sax.parser(true);
  const stack = []; let stopped = false; let info = null;
  parser.onopentag = n => {
    if (stopped) return;
    if (n.name === 'w:p' && (stack.includes('w:p') || stack.includes('w:pPr'))) {
      stopped = true; info = { issue: 'nested w:p', pos: parser.position }; return;
    }
    stack.push(n.name);
  };
  parser.onclosetag = () => { if (!stopped) stack.pop(); };
  parser.onerror = e => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) throw new Error('XML INVALID: ' + JSON.stringify(info));
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);
}

function findParaStart(xml, pos) {
  let idx = xml.lastIndexOf('<w:p', pos);
  while (idx >= 0) {
    const tag5 = xml.slice(idx, idx + 5);
    if (tag5 === '<w:p>' || tag5 === '<w:p ') return idx;
    idx = xml.lastIndexOf('<w:p', idx - 1);
  }
  return -1;
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── Step 1: Delete the SC preferred paragraph (currently after Photo 5.1) ──
  const SC_ANCHOR = 'Subcutaneous injection is the preferred route for killed multivalent vaccines in commercial poultry';
  const scHit = xml.indexOf(SC_ANCHOR);
  if (scHit < 0) throw new Error('NOT FOUND: SC preferred paragraph');
  const scStart = findParaStart(xml, scHit);
  const scEnd = xml.indexOf('</w:p>', scHit) + '</w:p>'.length;
  xml = xml.slice(0, scStart) + xml.slice(scEnd);
  console.log('  Deleted SC preferred paragraph from after Photo 5.1');

  // ── Step 2: Append its text to the two-standard paragraph (before Photo 5.1)
  const TAIL_OLD = 'replace it immediately if it gets bent, dulled, or contaminated [21].';
  const TAIL_NEW =
    'replace it immediately if it gets bent, dulled, or contaminated [21]. ' +
    'Subcutaneous injection is the preferred route for killed multivalent vaccines in commercial poultry [21]. ' +
    'Intramuscular injection carries a higher risk of abscesses at the injection site and carcass condemnations at processing. ' +
    'Unless the vaccine label specifies IM, default to SC.';

  if (!xml.includes(TAIL_OLD)) throw new Error('NOT FOUND: two-standard paragraph tail');
  if (xml.split(TAIL_OLD).length - 1 > 1) throw new Error('NOT UNIQUE: two-standard paragraph tail');
  xml = xml.split(TAIL_OLD).join(TAIL_NEW);
  console.log('  Appended SC preferred text to two-standard paragraph (now sits before Photo 5.1)');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
