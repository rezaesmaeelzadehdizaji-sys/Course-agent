// patch-summary8-remove-s75.mjs
// Updates the Course 8 summary page after Section 7.5 removal:
//   1. Remove agenda item "5.  The biosecurity link"
//   2. Change "five factors" → "four factors" in Learning Objective 2

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Summary_Page_Course8_Vaccination.docx';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Remove agenda item "5.  The biosecurity link" paragraph ────────────
  const AGENDA_ANCHOR = 'The biosecurity link';
  const aIdx = xml.indexOf(AGENDA_ANCHOR);
  if (aIdx < 0) throw new Error('Agenda anchor not found');
  if (xml.indexOf(AGENDA_ANCHOR, aIdx + 1) >= 0) throw new Error('Agenda anchor not unique');

  let pStart = aIdx - 1;
  while (pStart >= 0) {
    if (xml[pStart] === '<') {
      const tag = xml.slice(pStart, xml.indexOf('>', pStart) + 1);
      if (tag === '<w:p>' || tag.startsWith('<w:p ')) break;
    }
    pStart--;
  }
  if (pStart < 0) throw new Error('<w:p> for agenda item not found');
  const pEnd = xml.indexOf('</w:p>', aIdx) + '</w:p>'.length;
  xml = xml.slice(0, pStart) + xml.slice(pEnd);
  console.log('  Step 1: removed agenda item "5.  The biosecurity link"');

  // ── 2. Change "five factors" → "four factors" in LO 2 ────────────────────
  const OLD_LO = 'Name the five factors that can amplify a vaccine reaction into a serious flock-wide problem.';
  const NEW_LO = 'Name the four factors that can amplify a vaccine reaction into a serious flock-wide problem.';
  if (!xml.includes(OLD_LO)) throw new Error('LO 2 anchor not found');
  if ((xml.split(OLD_LO).length - 1) > 1) throw new Error('LO 2 anchor not unique');
  xml = xml.replace(OLD_LO, NEW_LO);
  console.log('  Step 2: updated LO 2 — "five factors" → "four factors"');

  // ── 3. SAX validation ─────────────────────────────────────────────────────
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
  parser.onerror    = (e) => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) { console.error('XML INVALID:', info); throw new Error('SAX validation failed'); }
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  console.log('  Step 3: SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
