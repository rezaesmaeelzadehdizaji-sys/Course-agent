// patch-course8-fig41-photo42.mjs
// 1. Remove Figure 4.1 (image paragraph + caption paragraph)
// 2. Merge Figure 4.1 caption details into Photo 4.2 caption
// 3. Replace Photo 4.2 image (image8.png) with Course 8/spray at broiler barn.png
// Run: node patch-course8-fig41-photo42.mjs

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
const NEW_PHOTO = path.join(__dirname, 'Course 8', 'spray at broiler barn.png');

if (!fs.existsSync(NEW_PHOTO)) throw new Error(`New photo not found: ${NEW_PHOTO}`);

const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
let xml = await zip.file('word/document.xml').async('string');

const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) throw new Error(`Unescaped & in source XML (${bad.length} found)`);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Locate the four paragraphs
// ─────────────────────────────────────────────────────────────────────────────
const rId15idx = xml.indexOf('r:embed="rId15"');
const fig41imgStart = xml.lastIndexOf('<w:p ', rId15idx);
const fig41imgEnd   = xml.indexOf('</w:p>', rId15idx) + '</w:p>'.length;

const fig41capIdx   = xml.indexOf('Figure 4.1');
const fig41capStart = xml.lastIndexOf('<w:p ', fig41capIdx);
const fig41capEnd   = xml.indexOf('</w:p>', fig41capIdx) + '</w:p>'.length;

const ph42capIdx    = xml.indexOf('Photo 4.2');
const ph42capStart  = xml.lastIndexOf('<w:p ', ph42capIdx);
const ph42capEnd    = xml.indexOf('</w:p>', ph42capIdx) + '</w:p>'.length;

console.log('Figure 4.1 image para: ', fig41imgStart, '–', fig41imgEnd);
console.log('Figure 4.1 caption para:', fig41capStart, '–', fig41capEnd);
console.log('Photo 4.2  caption para:', ph42capStart,  '–', ph42capEnd);

// Sanity: Fig4.1 image+cap must be directly before Photo 4.2 image
if (fig41imgEnd !== fig41capStart) throw new Error('Figure 4.1 image and caption are not adjacent');
if (fig41capEnd !== ph42capStart - (ph42capStart - fig41capEnd)) {
  console.log('Note: there may be paragraphs between Fig4.1 caption and Ph4.2 image para');
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Build merged Photo 4.2 caption text
// Original Figure 4.1 caption technical details:
//   - Nozzle 1 m (3 ft) above birds, downward direction
//   - Maximum 4 m (12 ft) from wall
//   - Fans off during run and 20 minutes after
//   - Pressure 4.5–5.0 Bar (65–75 PSI)
// Original Photo 4.2 narrative:
//   - Vaccinator in full PPE walks spray run
//   - Nozzle directed downward over grouped birds along side wall
//   - Fans off during run
//   - Standard in-barn spray technique for large flocks
// ─────────────────────────────────────────────────────────────────────────────
const MERGED_CAPTION =
  'Photo 4.2: A vaccinator in full PPE (coveralls, respirator, gloves) ' +
  'walks a coarse spray run through a commercial broiler barn. ' +
  'The nozzle is held 1 m (3 ft) above birds grouped along the side wall, ' +
  'directed downward, and the run stays within 4 m (12 ft) of the wall. ' +
  'All fans are off during the run and for 20 minutes after to let the droplets settle. ' +
  'Recommended nozzle pressure is 4.5–5.0 Bar (65–75 PSI). ' +
  'Source: CPC Short Courses.';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Extract old Photo 4.2 caption paragraph XML and replace its <w:t> text
// ─────────────────────────────────────────────────────────────────────────────
const oldCaptionParaXml = xml.substring(ph42capStart, ph42capEnd);

// The caption paragraph has mixed runs (bold italic "Photo 4.2:" + normal body text).
// Strategy: keep the paragraph structure but replace all <w:t>…</w:t> content.
// The first <w:t> run contains "Photo 4.2:" (or splits over a few runs).
// Replace everything from the first <w:t> to the last </w:t> with two runs:
//   Run 1 (bold italic): "Photo 4.2:"
//   Run 2 (normal):      rest of the merged caption
//
// Simpler approach: find the second <w:t> onward and collapse into one text run
// by replacing the text content only inside each run.

// Collect all <w:t> runs and their positions
const tRunRe = /(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g;
let match;
const runs = [];
while ((match = tRunRe.exec(oldCaptionParaXml)) !== null) {
  runs.push({ start: match.index, end: match.index + match[0].length, open: match[1], text: match[2], close: match[3] });
}

console.log('\nPhoto 4.2 caption runs:');
runs.forEach((r, i) => console.log(`  [${i}] "${r.text}"`));

// Build the new caption para XML:
// Keep the paragraph properties and run properties from the original.
// Replace only the text content: first run gets "Photo 4.2:", subsequent runs get the rest.
// The simplest safe approach: replace the joined text of all runs with our merged text,
// distributing it across the same number of runs (or collapsing into fewer).
// We'll put the full text in the last run and empty earlier runs — or better,
// put "Photo 4.2:" in run[0] and the remainder in run[1], clear the rest.

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Split caption: label vs body
const labelPart = 'Photo 4.2:';
const bodyPart  = ' ' + MERGED_CAPTION.substring('Photo 4.2: '.length);

let newCaptionParaXml = oldCaptionParaXml;

if (runs.length >= 2) {
  // Put label in run[0], body in run[1], clear runs[2+]
  newCaptionParaXml = newCaptionParaXml.substring(0, runs[0].start)
    + runs[0].open + escapeXml(labelPart) + runs[0].close;

  // For run[1], ensure xml:space="preserve" so leading space is kept
  const run1Open = runs[1].open.includes('xml:space')
    ? runs[1].open
    : runs[1].open.replace('<w:t', '<w:t xml:space="preserve"');
  newCaptionParaXml += run1Open + escapeXml(bodyPart) + runs[1].close;

  // Append everything after run[1] end, skipping runs[2+] text content
  // (keep their structure but empty their text)
  let tail = oldCaptionParaXml.substring(runs[1].end);
  for (let i = 2; i < runs.length; i++) {
    const r = runs[i];
    // These runs exist after runs[1] in the original; adjust position in tail
    const relStart = r.start - runs[1].end;
    if (relStart >= 0) {
      tail = tail.substring(0, relStart) + r.open + '' + r.close + tail.substring(relStart + r.open.length + r.text.length + r.close.length);
    }
  }
  newCaptionParaXml += tail;
} else if (runs.length === 1) {
  // Only one run — replace its text with the full merged caption
  newCaptionParaXml = newCaptionParaXml.substring(0, runs[0].start)
    + runs[0].open + escapeXml(MERGED_CAPTION) + runs[0].close
    + newCaptionParaXml.substring(runs[0].end);
} else {
  throw new Error('No <w:t> runs found in Photo 4.2 caption paragraph');
}

console.log('\nNew Photo 4.2 caption text:');
const newCapText = [...newCaptionParaXml.matchAll(/<w:t(?:[^>]*)>([^<]*)<\/w:t>/g)].map(m=>m[1]).join('');
console.log(' ', newCapText.substring(0, 200));

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: Rebuild XML
//   - Remove: fig41imgStart → fig41capEnd (image + caption of Figure 4.1)
//   - Keep: everything between fig41capEnd and ph42capStart unchanged (Photo 4.2 image para)
//   - Replace: ph42capStart → ph42capEnd with newCaptionParaXml
// ─────────────────────────────────────────────────────────────────────────────
xml = xml.substring(0, fig41imgStart)
       + xml.substring(fig41capEnd, ph42capStart)   // Photo 4.2 image para (unchanged)
       + newCaptionParaXml
       + xml.substring(ph42capEnd);

console.log('\n✓ Figure 4.1 removed (image + caption)');
console.log('✓ Photo 4.2 caption updated with merged content');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: Replace image8.png (Photo 4.2) with the new spray photo
// ─────────────────────────────────────────────────────────────────────────────
const newPhotoBuf = fs.readFileSync(NEW_PHOTO);

// Read new PNG dimensions from header (bytes 16-19 = width, 20-23 = height)
const newW = newPhotoBuf.readUInt32BE(16);
const newH = newPhotoBuf.readUInt32BE(20);
console.log(`\nNew photo dimensions: ${newW} x ${newH} px`);

// Read old image8.png dimensions to compare
const oldImg8Buf = await zip.file('word/media/image8.png').async('nodebuffer');
const oldW = oldImg8Buf.readUInt32BE(16);
const oldH = oldImg8Buf.readUInt32BE(20);
console.log(`Old image8.png dimensions: ${oldW} x ${oldH} px`);

// Update cx/cy in document XML if aspect ratio changed significantly
// Current cx/cy are stored in the <wp:extent> element for rId16
const extentRe = /(<wp:extent cx=")(\d+)(" cy=")(\d+)("\/?>)/;
// Find the extent near rId16
const rId16idx = xml.indexOf('r:embed="rId16"');
const drawingRegion = xml.substring(Math.max(0, rId16idx - 2000), rId16idx + 500);
const extentMatch = drawingRegion.match(extentRe);

if (extentMatch) {
  const oldCx = parseInt(extentMatch[2]);
  const oldCy = parseInt(extentMatch[4]);
  // Keep the same display width (cx), adjust height to match new aspect ratio
  const newCy = Math.round(oldCx * newH / newW);
  console.log(`Old cx=${oldCx} cy=${oldCy}  →  New cx=${oldCx} cy=${newCy}`);

  if (Math.abs(newCy - oldCy) > 10000) {
    // Aspect ratio changed — update cy
    const newExtent = `${extentMatch[1]}${oldCx}${extentMatch[3]}${newCy}${extentMatch[5]}`;
    const regionStart = xml.lastIndexOf('r:embed="rId16"', rId16idx);
    // Replace within the drawing region in the full xml
    const absRegionStart = Math.max(0, rId16idx - 2000);
    const absRegionEnd   = rId16idx + 500;
    let region = xml.substring(absRegionStart, absRegionEnd);
    region = region.replace(extentRe, newExtent);
    xml = xml.substring(0, absRegionStart) + region + xml.substring(absRegionEnd);
    console.log('✓ Extent (cy) updated in document XML');
  } else {
    console.log('Aspect ratio close enough — keeping original extent');
  }
} else {
  console.log('⚠ Could not find <wp:extent> near rId16 — skipping dimension update');
}

// Replace the binary in the zip
zip.file('word/media/image8.png', newPhotoBuf);
console.log('✓ image8.png replaced with new spray photo');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6: Sanity checks and write
// ─────────────────────────────────────────────────────────────────────────────
const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (badAfter) throw new Error(`Unescaped & introduced (${badAfter.length} found)`);

// Verify Figure 4.1 is gone and Photo 4.2 still present
if (xml.includes('Figure 4.1')) throw new Error('Figure 4.1 still in document — removal failed');
if (!xml.includes('Photo 4.2'))  throw new Error('Photo 4.2 missing — something went wrong');
console.log('\n✓ Figure 4.1 confirmed absent');
console.log('✓ Photo 4.2 confirmed present');

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(SRC, buf);

console.log(`\nDone. Written to: ${SRC}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
