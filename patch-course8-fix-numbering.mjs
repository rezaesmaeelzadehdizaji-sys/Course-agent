// patch-course8-fix-numbering.mjs
// 1. Remove Figure 2.2 (image para kept, caption removed)
// 2. Insert Wing web vaccination.png as the new Photo 4.2 at that position
// 3. Renumber all figure/photo labels to match the current section order:
//      Section 1 (Water):     Figure 1.2 → Figure 1.1,  Photos 1.x unchanged
//      Section 2 (Spray):     Photo 4.1 → Photo 2.1,  Photo 4.2 → Photo 2.2
//      Section 3 (Eye Drop):  Photo 3.1 unchanged
//      Section 4 (Wing Web):  Photo 2.1 → Photo 4.1,  [new] Photo 4.2,  Photo 2.2 → Photo 4.3
//      Section 5 (Injection): Photo 6.1 → Photo 5.1
//      Section 6 (In-Ovo):   Photo 5.1 → Photo 6.1
// Run: node patch-course8-fix-numbering.mjs

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC       = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
const NEW_PHOTO = path.join(__dirname, 'Course 8', 'Wing web vaccination.png');

const CAPTION_LABEL = 'Photo 4.2:';
const CAPTION_BODY  =
  ' Where the wing web sits when the wing is held open. ' +
  'The vaccine deposits between the two skin layers and the loose connective tissue ' +
  'between them by the bifurcated needle. Source: CPC Short Courses.';

if (!fs.existsSync(NEW_PHOTO)) throw new Error(`New photo not found: ${NEW_PHOTO}`);

const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
let xml   = await zip.file('word/document.xml').async('string');

const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) throw new Error(`Unescaped & in source XML (${bad.length} found)`);

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Snapshot Figure 2.2 caption paragraph as styling template (before renaming)
// ─────────────────────────────────────────────────────────────────────────────
const fig22idx      = xml.indexOf('Figure 2.2:');
if (fig22idx === -1) throw new Error('Figure 2.2 caption not found');
const fig22capStart = xml.lastIndexOf('<w:p ', fig22idx);
const fig22capEnd   = xml.indexOf('</w:p>', fig22idx) + 6;
const oldCapTemplate = xml.substring(fig22capStart, fig22capEnd);

const tRuns = [...oldCapTemplate.matchAll(/(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g)];
console.log(`Figure 2.2 caption: ${tRuns.length} text run(s)`);
tRuns.forEach((r, i) => console.log(`  [${i}] "${r[2].substring(0, 60)}"`));

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Rename all old figure/photo labels using temp markers (cascade-safe)
// All replacements are same net length — positions stay stable
// ─────────────────────────────────────────────────────────────────────────────
const labelRenames = [
  ['Figure 1.2', 'TMPFIG12'],   // Water: Figure 1.2 → Figure 1.1
  ['Photo 4.1',  'TMPSPR41'],   // Spray: Photo 4.1 → Photo 2.1
  ['Photo 4.2',  'TMPSPR42'],   // Spray: Photo 4.2 → Photo 2.2
  ['Photo 2.1',  'TMPWNG21'],   // WingWeb: Photo 2.1 → Photo 4.1
  ['Photo 2.2',  'TMPWNG22'],   // WingWeb: Photo 2.2 → Photo 4.3
  ['Photo 6.1',  'TMPINJ61'],   // Injection: Photo 6.1 → Photo 5.1
  ['Photo 5.1',  'TMPOVO51'],   // InOvo: Photo 5.1 → Photo 6.1
];
const labelResolve = [
  ['TMPFIG12', 'Figure 1.1'],
  ['TMPSPR41', 'Photo 2.1'],
  ['TMPSPR42', 'Photo 2.2'],
  ['TMPWNG21', 'Photo 4.1'],
  ['TMPWNG22', 'Photo 4.3'],
  ['TMPINJ61', 'Photo 5.1'],
  ['TMPOVO51', 'Photo 6.1'],
];

for (const [old, tmp] of labelRenames) {
  const count = (xml.split(old).length - 1);
  xml = xml.split(old).join(tmp);
  console.log(`  "${old}" → ${tmp} (${count} occurrence(s))`);
}
for (const [tmp, neo] of labelResolve) {
  xml = xml.split(tmp).join(neo);
}
console.log('✓ Labels renamed');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Remove the Figure 2.2 caption paragraph
// After STEP 2, caption still says "Figure 2.2" (it wasn't in the rename list)
// ─────────────────────────────────────────────────────────────────────────────
const fig22idxAfter = xml.indexOf('Figure 2.2');
if (fig22idxAfter === -1) throw new Error('Figure 2.2 caption not found after label renaming');

const capStart2 = xml.lastIndexOf('<w:p ', fig22idxAfter);
const capEnd2   = xml.indexOf('</w:p>', fig22idxAfter) + 6;
xml = xml.substring(0, capStart2) + xml.substring(capEnd2);
console.log('✓ Figure 2.2 caption paragraph removed');

// Also update any remaining "Figure 2.2" text (e.g. in docPr descr attribute)
xml = xml.split('Figure 2.2').join('Photo 4.2');
console.log('✓ Remaining "Figure 2.2" references updated to "Photo 4.2"');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: Build new Photo 4.2 caption using the template's run structure
// ─────────────────────────────────────────────────────────────────────────────
let newCapXml;
if (tRuns.length >= 2) {
  newCapXml = oldCapTemplate.substring(0, tRuns[0].index)
    + tRuns[0][1] + escapeXml(CAPTION_LABEL) + tRuns[0][3];
  const run1Open = tRuns[1][1].includes('xml:space')
    ? tRuns[1][1]
    : tRuns[1][1].replace('<w:t', '<w:t xml:space="preserve"');
  newCapXml += run1Open + escapeXml(CAPTION_BODY) + tRuns[1][3];
  let tail = oldCapTemplate.substring(tRuns[1].index + tRuns[1][0].length);
  for (let i = 2; i < tRuns.length; i++) {
    const r = tRuns[i];
    const relStart = r.index - (tRuns[1].index + tRuns[1][0].length);
    if (relStart >= 0) {
      tail = tail.substring(0, relStart) + r[1] + '' + r[3]
        + tail.substring(relStart + r[0].length);
    }
  }
  newCapXml += tail;
} else {
  // Single run — replace full text content
  newCapXml = oldCapTemplate.substring(0, tRuns[0].index)
    + '<w:t xml:space="preserve">' + escapeXml(CAPTION_LABEL + CAPTION_BODY) + '</w:t>'
    + oldCapTemplate.substring(tRuns[0].index + tRuns[0][0].length);
}

// Insert new caption right after the (repurposed) Figure 2.2 image paragraph (rId19)
const rId19idx = xml.indexOf('r:embed="rId19"');
if (rId19idx === -1) throw new Error('rId19 not found — image paragraph missing');
const imgParaEnd = xml.indexOf('</w:p>', rId19idx) + 6;
xml = xml.substring(0, imgParaEnd) + newCapXml + xml.substring(imgParaEnd);
console.log('✓ New Photo 4.2 caption inserted after image paragraph');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: Replace image binary and update extent dimensions
// Current extent: cx=5943600, cy=3819525 (6.5" × 4.18")
// New image: 1326×1186 px (nearly square) → new cy=5316071 (5.81")
// ─────────────────────────────────────────────────────────────────────────────
const newPhotoBuf = fs.readFileSync(NEW_PHOTO);
const newW = newPhotoBuf.readUInt32BE(16);
const newH = newPhotoBuf.readUInt32BE(20);
console.log(`\nNew photo: ${newW} × ${newH} px`);

const rId19idx2    = xml.indexOf('r:embed="rId19"');
const regStart     = Math.max(0, rId19idx2 - 2000);
const regEnd       = rId19idx2 + 500;
let   region       = xml.substring(regStart, regEnd);
const extentRe     = /(<wp:extent cx=")(\d+)(" cy=")(\d+)("\/?>)/;
const extentMatch  = region.match(extentRe);

if (extentMatch) {
  const oldCx = parseInt(extentMatch[2]);
  const oldCy = parseInt(extentMatch[4]);
  const newCy = Math.round(oldCx * newH / newW);
  console.log(`Extent: cx=${oldCx} cy=${oldCy} → cy=${newCy} (delta ${Math.abs(newCy-oldCy)} EMU)`);
  const newExtent = `${extentMatch[1]}${oldCx}${extentMatch[3]}${newCy}${extentMatch[5]}`;
  region = region.replace(extentRe, newExtent);
  xml = xml.substring(0, regStart) + region + xml.substring(regEnd);
  console.log('✓ Extent (cy) updated');
} else {
  console.log('⚠ <wp:extent> not found near rId19 — skipping dimension update');
}

zip.file('word/media/image11.png', newPhotoBuf);
console.log('✓ image11.png replaced with Wing web vaccination.png');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6: Sanity checks
// ─────────────────────────────────────────────────────────────────────────────
const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (badAfter) throw new Error(`Unescaped & introduced (${badAfter.length} found)`);

const tmpLeft = (xml.match(/TMP(?:FIG|SPR|WNG|INJ|OVO)\d+/g) || []).length;
if (tmpLeft > 0) throw new Error(`${tmpLeft} temp markers still in XML`);

const checks = [
  ['Figure 2.2', false, 'Figure 2.2 still present'],
  ['Figure 1.1', true,  'Figure 1.1 missing (Section 1)'],
  ['Figure 1.2', false, 'Figure 1.2 still present (not renamed)'],
  ['Photo 2.1',  true,  'Photo 2.1 missing (Section 2/Spray)'],
  ['Photo 2.2',  true,  'Photo 2.2 missing (Section 2/Spray)'],
  ['Photo 3.1',  true,  'Photo 3.1 missing (Section 3/Eye Drop)'],
  ['Photo 4.1',  true,  'Photo 4.1 missing (Section 4/Wing Web)'],
  ['Photo 4.2',  true,  'Photo 4.2 missing (new, Section 4/Wing Web)'],
  ['Photo 4.3',  true,  'Photo 4.3 missing (Section 4/Wing Web)'],
  ['Photo 5.1',  true,  'Photo 5.1 missing (Section 5/Injection)'],
  ['Photo 6.1',  true,  'Photo 6.1 missing (Section 6/In-Ovo)'],
  ['Photo 4.1: A hatchery spray', false, 'Old Photo 4.1 (Spray hatchery) caption not renamed — still says Photo 4.1'],
  ['Photo 6.1',  true,  'Photo 6.1 missing (In-Ovo)'],
];

let allOk = true;
for (const [label, shouldExist, msg] of checks) {
  const found = xml.includes(label);
  if (shouldExist !== found) { console.log('⚠', msg); allOk = false; }
  else console.log(`  ✓ "${label}" ${shouldExist ? 'present' : 'absent'}`);
}

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(SRC, buf);

console.log(`\n${allOk ? '✓ All checks passed.' : '⚠ Some checks failed — see above.'}`);
console.log(`Done. Written to: ${SRC}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
console.log('\nNote: new Photo 4.2 (Wing Web) is displayed at 6.5" wide × 5.81" tall (correct');
console.log('      aspect ratio for the 1326×1186 source). Resize in Word if preferred.');
