// patch-course8-photo43.mjs
// Replaces Photo 4.3 image (image12.jpg) with pox_take_wingweb.jpg
// and updates caption and dimensions for the portrait image.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';
const OUT = 'Course 8/Vaccination_draft.docx';
const NEW_IMG = 'Course 8/pox_take_wingweb.jpg';

// New image: 241×307 px (portrait). Display at 3.5" wide.
// cx = 3.5" × 914400 EMU/in = 3200400
// cy = 3200400 × (307/241) = 4076987
const NEW_CX = 3200400;
const NEW_CY = Math.round(3200400 * 307 / 241);  // 4076987

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const NEW_CAPTION = 'Photo 4.3: A confirmed take nodule at the wing web site from the stab technique. A firm bump or developing scab like the circled nodule is the field sign that the vaccine was delivered correctly and the immune response is underway. Source: Tesfaye YT et al., Acta Vet Scand. 2022;64:38. CC BY 4.0.';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Replace image bytes ──────────────────────────────────────────────────
  if (!zip.files['word/media/image12.jpg']) throw new Error('word/media/image12.jpg not found in docx');
  const newImgBytes = fs.readFileSync(NEW_IMG);
  zip.file('word/media/image12.jpg', newImgBytes);
  console.log(`  Replaced word/media/image12.jpg (${newImgBytes.length} bytes)`);

  // ── 2. Update wp:extent and a:ext dimensions ────────────────────────────────
  // Both pairs currently read cx="5486400" cy="2247900"
  const OLD_DIMS = /cx="5486400" cy="2247900"/g;
  const dimMatches = (xml.match(OLD_DIMS) || []).length;
  console.log(`  Found ${dimMatches} old dimension pair(s) to replace`);
  if (dimMatches === 0) throw new Error('Old Photo 4.3 dimensions not found — check anchor');
  xml = xml.replace(OLD_DIMS, `cx="${NEW_CX}" cy="${NEW_CY}"`);
  console.log(`  Updated dimensions to ${NEW_CX}×${NEW_CY} EMU (${(NEW_CX/914400).toFixed(2)}"×${(NEW_CY/914400).toFixed(2)}")`);

  // ── 3. Replace caption paragraph ─────────────────────────────────────────────
  const OLD_ANCHOR = 'Photo 4.3: Real wing web vaccination take reactions';
  const anchorIdx = xml.indexOf(OLD_ANCHOR);
  if (anchorIdx < 0) throw new Error('Old Photo 4.3 caption anchor not found');

  // Find paragraph boundaries
  const pStart = xml.lastIndexOf('<w:p', anchorIdx);
  const pEnd = xml.indexOf('</w:p>', anchorIdx) + 6;

  const newCapPara =
    `<w:p><w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr>` +
    `<w:r><w:rPr><w:i/><w:iCs/><w:color w:val="555555"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>` +
    `<w:t xml:space="preserve">${esc(NEW_CAPTION)}</w:t></w:r></w:p>`;

  xml = xml.slice(0, pStart) + newCapPara + xml.slice(pEnd);
  console.log('  Caption paragraph replaced');

  // ── 4. Validate ─────────────────────────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML: ${bad.length} found`);

  // Verify new caption is present
  if (!xml.includes('A confirmed take nodule at the wing web site')) throw new Error('New caption not found after replacement');

  // ── 5. Write ─────────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log(`\n  Done. ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
