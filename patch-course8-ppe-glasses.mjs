// patch-course8-ppe-glasses.mjs
// Two edits in Section 5 PPE list:
//   1. Add "safety glasses or face shield" into the gloves/vial disposal bullet
//   2. Remove the standalone "Safety glasses or face shield." paragraph entirely

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Add safety glasses to the shared-PPE bullet ────────────────────────
  const OLD_PPE = 'Standard PPE requirements, including gloves and vial disposal, are the same as described in Section 1.7.';
  const NEW_PPE = 'Standard PPE requirements, including gloves, safety glasses or face shield, and vial disposal, are the same as described in Section 1.7.';

  if (!xml.includes(OLD_PPE)) throw new Error('PPE bullet anchor not found');
  if ((xml.split(OLD_PPE).length - 1) > 1) throw new Error('PPE bullet anchor not unique');
  xml = xml.replace(OLD_PPE, NEW_PPE);
  console.log('  Step 1: updated shared-PPE bullet to include safety glasses');

  // ── 2. Remove standalone "Safety glasses or face shield." paragraph ─────────
  const PARA_ANCHOR = 'Safety glasses or face shield. Accidental needle stick or spray from the injector tip can direct vaccine toward the operator';

  const anchorIdx = xml.indexOf(PARA_ANCHOR);
  if (anchorIdx < 0) throw new Error('Safety glasses paragraph anchor not found');
  if (xml.indexOf(PARA_ANCHOR, anchorIdx + 1) >= 0) throw new Error('Safety glasses anchor not unique');

  // Walk backward to find the opening <w:p> or <w:p > (not <w:pPr>, <w:pStyle>, etc.)
  let pStart = -1;
  let pos = anchorIdx - 1;
  while (pos >= 0) {
    if (xml[pos] === '<') {
      const tagEnd = xml.indexOf('>', pos);
      const tag = xml.slice(pos, tagEnd + 1);
      if (tag === '<w:p>' || tag.startsWith('<w:p ')) { pStart = pos; break; }
    }
    pos--;
  }
  if (pStart < 0) throw new Error('<w:p> opener not found for safety glasses paragraph');

  // Find the closing </w:p>
  const pEnd = xml.indexOf('</w:p>', anchorIdx) + '</w:p>'.length;
  if (pEnd < '</w:p>'.length) throw new Error('</w:p> not found after anchor');

  // Verify the paragraph we found actually contains the anchor
  const para = xml.slice(pStart, pEnd);
  if (!para.includes(PARA_ANCHOR)) throw new Error('Paragraph boundary mismatch');

  xml = xml.slice(0, pStart) + xml.slice(pEnd);
  console.log('  Step 2: removed standalone safety glasses paragraph');

  // ── 3. SAX + schema-nesting validation ────────────────────────────────────
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

  // ── 4. Write ──────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
