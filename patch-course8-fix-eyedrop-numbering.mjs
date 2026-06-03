// patch-course8-fix-eyedrop-numbering.mjs
// Eye drop administration steps (Section 3.4) share numId 3 with the water vaccination
// reconstitution steps (Section 1). Word continues the counter, so the eye drop steps
// render as 6-11 instead of 1-6.
// Fix: add numId 4 (same abstractNumId 1, startOverride=1) and assign it to the 6 eye drop paragraphs.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';
const OUT = 'Course 8/Vaccination_draft.docx';

// Unique text anchors for the first and last eye drop step paragraphs
const FIRST_STEP = 'Pick up the bird and hold it firmly against your body.';
const LAST_STEP  = 'Set the bird down and move to the next. Keep your pace steady and consistent throughout.';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml    = await zip.file('word/document.xml').async('string');
  let numXml = await zip.file('word/numbering.xml').async('string');

  // ── 1. Add numId 4 to numbering.xml ────────────────────────────────────────
  const NEW_NUM = `<w:num w:numId="4"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>`;
  if (numXml.includes('w:numId="4"')) {
    console.log('  numId 4 already exists — skipping numbering.xml update');
  } else {
    numXml = numXml.replace('</w:numbering>', NEW_NUM + '</w:numbering>');
    console.log('  numId 4 added to numbering.xml');
  }
  zip.file('word/numbering.xml', numXml);

  // ── 2. Find the range of the 6 eye drop step paragraphs ────────────────────
  const firstIdx = xml.indexOf(FIRST_STEP);
  if (firstIdx < 0) throw new Error('First step anchor not found');
  const lastIdx = xml.indexOf(LAST_STEP);
  if (lastIdx < 0) throw new Error('Last step anchor not found');
  const lastParaEnd = xml.indexOf('</w:p>', lastIdx) + 6;

  // Extract the chunk covering all 6 paragraphs
  const firstParaStart = xml.lastIndexOf('<w:p', firstIdx);
  console.log(`  Eye drop steps range: ${firstParaStart} → ${lastParaEnd}`);

  // Confirm all 6 paragraphs in this range use numId 3
  const chunk = xml.slice(firstParaStart, lastParaEnd);
  const numId3Count = (chunk.match(/numId w:val="3"/g) || []).length;
  console.log(`  Found ${numId3Count} numId="3" instances in range (expected 6)`);
  if (numId3Count !== 6) throw new Error(`Expected 6 numId 3 instances, found ${numId3Count}`);

  // Replace numId 3 → numId 4 within this exact range only
  const fixedChunk = chunk.replace(/numId w:val="3"/g, 'numId w:val="4"');
  xml = xml.slice(0, firstParaStart) + fixedChunk + xml.slice(lastParaEnd);

  // ── 3. Validate ────────────────────────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML: ${bad.length} found`);

  // Confirm water vax steps still use numId 3
  const waterStillOk = xml.includes('Add skim milk powder to the vaccine water');
  console.log(`  Water vax steps still present: ${waterStillOk}`);

  // ── 4. Write ────────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log(`\n  Done. ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
