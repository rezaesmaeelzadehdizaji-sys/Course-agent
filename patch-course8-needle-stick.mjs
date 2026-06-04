// patch-course8-needle-stick.mjs
// Re-inserts the "Accidental needle stick" bullet after the shared PPE bullet,
// with two corrections:
//   1. Citation [20] placed before the period, not after
//   2. "toward the operator's eyes" → "toward the operator's body and eyes respectively"

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

// ListParagraph bullet matching surrounding PPE list items (numId=2, ilvl=0)
const NEW_PARA =
  `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr>` +
  `<w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>` +
  `<w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>` +
  `<w:r><w:t xml:space="preserve">Accidental needle stick or spray from the injector tip can direct vaccine toward the operator’s body and eyes respectively, which is a different risk from NDV exposure [20].</w:t></w:r></w:p>`;

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  if (xml.includes('Accidental needle stick')) throw new Error('Sentence already present — nothing to reinsert');

  // ── 1. Insert corrected paragraph after the shared PPE bullet ─────────────
  const ANCHOR = 'Standard PPE requirements, including gloves, safety glasses or face shield, and vial disposal, are the same as described in Section 1.7.</w:t></w:r></w:p>';
  const idx = xml.indexOf(ANCHOR);
  if (idx < 0) throw new Error('PPE bullet anchor not found');
  if (xml.indexOf(ANCHOR, idx + 1) >= 0) throw new Error('PPE bullet anchor not unique');

  const insertAt = idx + ANCHOR.length;
  xml = xml.slice(0, insertAt) + NEW_PARA + xml.slice(insertAt);
  console.log('  Step 1: inserted corrected needle-stick bullet after shared PPE bullet');

  // ── 2. SAX + schema-nesting validation ────────────────────────────────────
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
  console.log('  Step 2: SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── 3. Write ──────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
