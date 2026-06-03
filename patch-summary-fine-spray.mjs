// patch-summary-fine-spray.mjs
// Adds Fine Spray (Section 2.9) to Sub-Course B in the summary page:
//   1. Inserts agenda sub-item 3c under "Overview of Coarse Spray Vaccination"
//   2. Inserts Learning Objective 8 about fine spray after LO 7

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Summary_Page_Course8_Vaccination.docx';

const RFONTS = '<w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/>';
const SZ20   = '<w:sz w:val="20"/><w:szCs w:val="20"/>';
const SZ22   = '<w:sz w:val="22"/><w:szCs w:val="22"/>';
const DARK   = '<w:color w:val="3C3C3C"/>';
const BLUE   = '<w:color w:val="2E74B5"/>';

// Sub-item paragraph (same format as existing 3a, 3b)
const SUBITEM_3C =
  `<w:p><w:pPr><w:spacing w:after="40" w:line="260" w:lineRule="auto"/><w:ind w:left="576"/></w:pPr>` +
  `<w:r><w:rPr>${RFONTS}<w:b/><w:bCs/>${DARK}${SZ20}</w:rPr><w:t xml:space="preserve">    c.  </w:t></w:r>` +
  `<w:r><w:rPr>${RFONTS}${DARK}${SZ20}</w:rPr>` +
  `<w:t xml:space="preserve">Fine spray as a booster method: smaller droplets (50-100 microns) reach deeper into the trachea, and when fine spray fits in a program after initial coarse spray priming</w:t>` +
  `</w:r></w:p>`;

// LO 8 paragraph (same format as existing LO 7)
const LO_8 =
  `<w:p><w:pPr><w:spacing w:after="70" w:line="260" w:lineRule="auto"/><w:ind w:left="288"/></w:pPr>` +
  `<w:r><w:rPr>${RFONTS}<w:b/><w:bCs/>${BLUE}${SZ22}</w:rPr><w:t xml:space="preserve">8.  </w:t></w:r>` +
  `<w:r><w:rPr>${RFONTS}${DARK}${SZ22}</w:rPr>` +
  `<w:t xml:space="preserve">Explain when fine spray is appropriate in a vaccination program, how it differs from coarse spray in droplet size and target tissue, and why it is used as a booster rather than a first vaccination.</w:t>` +
  `</w:r></w:p>`;

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Insert sub-item 3c after 3b in Sub-Course B agenda ────────────────
  const ANCHOR_3B = 'When to choose spray over eye drop or water vaccination</w:t></w:r></w:p>';
  const idx3b = xml.indexOf(ANCHOR_3B);
  if (idx3b < 0) throw new Error('Sub-Course B item 3b anchor not found');
  // Verify uniqueness
  if (xml.indexOf(ANCHOR_3B, idx3b + 1) >= 0) throw new Error('Item 3b anchor is not unique');
  xml = xml.slice(0, idx3b + ANCHOR_3B.length) + SUBITEM_3C + xml.slice(idx3b + ANCHOR_3B.length);
  console.log('  Step 1: inserted agenda sub-item 3c (Fine Spray) after item 3b in Sub-Course B');

  // ── 2. Insert LO 8 after LO 7 in Sub-Course B (before Sub-Course C header) ─
  const ANCHOR_LO7 = 'Identify and correct the most common coarse spray failures using post-vaccination serology and field observations.</w:t></w:r></w:p>';
  const idxLO7 = xml.indexOf(ANCHOR_LO7);
  if (idxLO7 < 0) throw new Error('Sub-Course B LO 7 anchor not found');
  if (xml.indexOf(ANCHOR_LO7, idxLO7 + 1) >= 0) throw new Error('LO 7 anchor is not unique');
  xml = xml.slice(0, idxLO7 + ANCHOR_LO7.length) + LO_8 + xml.slice(idxLO7 + ANCHOR_LO7.length);
  console.log('  Step 2: inserted Learning Objective 8 (Fine Spray) after LO 7 in Sub-Course B');

  // ── 3. Strict SAX validation ─────────────────────────────────────────────
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let info = null;
  parser.onopentag = (n) => {
    if (stopped) return;
    if (n.name === 'w:p') {
      if (stack.includes('w:p') || stack.includes('w:pPr')) {
        stopped = true;
        info = { issue: 'w:p nested inside p/pPr', pos: parser.position, stack: stack.slice(-8) };
        return;
      }
    }
    stack.push(n.name);
  };
  parser.onclosetag = (n) => { if (!stopped) stack.pop(); };
  parser.onerror = (e) => {
    if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; }
  };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) {
    console.error('  XML INVALID:', info);
    const p = info.pos || 0;
    console.error('  Context:', JSON.stringify(xml.slice(Math.max(0, p - 150), p + 150)));
    throw new Error('SAX validation failed');
  }
  if (stack.length !== 0) {
    console.error('  Unclosed tags:', stack);
    throw new Error('Unclosed tags after edit');
  }
  console.log('  Step 3: SAX + schema-nesting validation: PASS');

  // ── 4. Unescaped & check ─────────────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── 5. Verify content present ─────────────────────────────────────────────
  if (!xml.includes('Fine spray as a booster method')) throw new Error('Agenda item 3c not found after insert');
  if (!xml.includes('fine spray is appropriate in a vaccination program')) throw new Error('LO 8 not found after insert');

  // ── 6. Write ─────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
