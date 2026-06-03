// patch-course8-remove-repeats.mjs
// Removes repeated content across sections and adds cross-references:
// 1. Section 2.5: delete first 2 "Ventilation rules" bullets (repeat of paragraph above)
// 2. Section 2.7: delete "Burn all empty vaccine containers." bullet (covered in 1.7)
// 3. Section 3.7: delete "Expected post-vaccination flock response" paragraph (= Section 7.1)
//                 replace with a single cross-reference sentence to Section 7
//                 delete "Severe post-vaccination reaction" paragraph (= Section 7.4)
//                 delete "All three vaccination methods... same foundation" (= 2.8 closing)

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';
const OUT = 'Course 8/Vaccination_draft.docx';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Helper: find the full <w:p>…</w:p> block containing anchor text
function findPara(xml, anchor) {
  const idx = xml.indexOf(anchor);
  if (idx < 0) throw new Error('Anchor not found: ' + anchor.slice(0, 60));
  // Walk back to the true <w:p opening tag (not <w:pPr or <w:pStyle)
  let s = idx;
  while (s > 0) {
    const pos = xml.lastIndexOf('<w:p', s - 1);
    const tag = xml.slice(pos, pos + 5);
    if (tag === '<w:p>' || tag === '<w:p ') { s = pos; break; }
    s = pos;
  }
  const e = xml.indexOf('</w:p>', idx) + 6;
  return { start: s, end: e };
}

// A body paragraph (gray, justified) for the cross-reference replacement
function bodyPara(text) {
  return (
    `<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>` +
    `<w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  );
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Section 2.5: delete first two ventilation-rule bullets ───────────────
  // These two bullets repeat the text already in the paragraph just above them.
  const fans1 = findPara(xml, 'Turn off all fans before starting the spray run.');
  const fans2 = findPara(xml, 'Turn all fans back on 20 minutes after the run is complete.');
  // They should be contiguous
  if (fans1.end !== fans2.start) throw new Error('Fan bullets not contiguous');
  xml = xml.slice(0, fans1.start) + xml.slice(fans2.end);
  console.log('  Deleted: ventilation rule bullets 1 & 2 (Section 2.5)');

  // ── 2. Section 2.7: delete "Burn all empty vaccine containers." bullet ────────
  const burn = findPara(xml, 'Burn all empty vaccine containers.');
  xml = xml.slice(0, burn.start) + xml.slice(burn.end);
  console.log('  Deleted: "Burn all empty vaccine containers." (Section 2.7)');

  // ── 3. Section 3.7: replace Expected + Severe paragraphs with cross-ref ────
  // The order in the document is: Expected → No visible → Severe → Uneven → All three
  // Delete Expected paragraph
  const expected = findPara(xml, 'Expected post-vaccination flock response');
  // Cross-reference paragraph inserted in its place
  const xref = bodyPara(
    'For what to expect after live respiratory vaccination — including normal mild reactions, ' +
    'factors that make reactions worse, and when to call your veterinarian — see Section 7.'
  );
  xml = xml.slice(0, expected.start) + xref + xml.slice(expected.end);
  console.log('  Replaced "Expected post-vaccination flock response" with Section 7 cross-reference (Section 3.7)');

  // Delete Severe paragraph (position has shifted; re-search)
  const severe = findPara(xml, 'Severe post-vaccination reaction');
  xml = xml.slice(0, severe.start) + xml.slice(severe.end);
  console.log('  Deleted: "Severe post-vaccination reaction" paragraph (Section 3.7)');

  // ── 4. Section 3.7: delete closing "All three... same foundation" sentence ───
  const allThree = findPara(xml, 'All three vaccination methods covered so far depend on the same foundation');
  xml = xml.slice(0, allThree.start) + xml.slice(allThree.end);
  console.log('  Deleted: "All three vaccination methods..." closing sentence (Section 3.7)');

  // ── 5. Validate ───────────────────────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── 6. Write ──────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log(`\n  Done. ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
