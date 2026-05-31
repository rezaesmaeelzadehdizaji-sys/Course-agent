// patch-course8-reorder-sections.mjs
// 1. Remove eye-drop/spray comparison paragraph from Introduction
// 2. Reorder sections: Water(1→1) Eye-Drop(3→2) Spray(4→3) Wing-Web(2→4) Injection(6→5) In-Ovo(5→6)
// 3. Renumber all section headings (H1 "Section X:" and H2 "X.Y  Title")
// 4. Insert eye-drop/spray paragraph after "respiratory pathogens first make contact with the bird." (in new Sec 2)
// 5. Update cached TOC entries to reflect new section names and order
// Run: node patch-course8-reorder-sections.mjs

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
const OUT = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
let xml = await zip.file('word/document.xml').async('string');

// Sanity check — no bare & before we start
const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) throw new Error(`Unescaped & in source XML (${bad.length} found)`);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Extract the eye-drop/spray comparison paragraph from Introduction
// ─────────────────────────────────────────────────────────────────────────────
const EYEDROP_MARKER = 'Field and experimental studies show that live vaccines delivered by eye-drop';
const eyedropIdx = xml.indexOf(EYEDROP_MARKER);
if (eyedropIdx === -1) throw new Error('Eye-drop paragraph not found');

const eyedropParaStart = xml.lastIndexOf('<w:p>', eyedropIdx);
const eyedropParaEnd = xml.indexOf('</w:p>', eyedropIdx) + '</w:p>'.length;
const eyedropParaXml = xml.substring(eyedropParaStart, eyedropParaEnd);

console.log('✓ Eye-drop paragraph found at', eyedropParaStart, '-', eyedropParaEnd);
console.log('  Text:', EYEDROP_MARKER.substring(0, 60) + '...');

// Remove from current position
xml = xml.substring(0, eyedropParaStart) + xml.substring(eyedropParaEnd);
console.log('✓ Eye-drop paragraph removed from Introduction');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Identify section boundaries (H1 headings)
// After removal, positions shift — recalculate
// ─────────────────────────────────────────────────────────────────────────────
function findH1Sections(xml) {
  const re = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading1"[^>]*\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
  const sections = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    const text = [...m[0].matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('').trim();
    sections.push({ pos: m.index, text });
  }
  return sections;
}

const h1s = findH1Sections(xml);
h1s.forEach(h => console.log('H1 at', h.pos, ':', h.text));

// Find positions for each named section
const secIdx = name => h1s.findIndex(h => h.text.includes(name));

const idxTOC        = secIdx('Table of Contents');
const idxIntro      = secIdx('Introduction');
const idxSec1Water  = secIdx('Section 1');
const idxSec2Wing   = secIdx('Section 2');
const idxSec3Eye    = secIdx('Section 3');
const idxSec4Spray  = secIdx('Section 4');
const idxSec5InOvo  = secIdx('Section 5');
const idxSec6Inj    = secIdx('Section 6');
const idxJournals   = secIdx('Recommended Peer-Reviewed Journals');
const idxRefs       = secIdx('References');

if ([idxTOC,idxIntro,idxSec1Water,idxSec2Wing,idxSec3Eye,idxSec4Spray,idxSec5InOvo,idxSec6Inj,idxJournals].some(i => i === -1)) {
  throw new Error('Could not find all expected section headings');
}

// Extract chunks: from h1s[i].pos to h1s[i+1].pos
const chunk = (startIdx, endIdx) => xml.substring(h1s[startIdx].pos, h1s[endIdx].pos);

const preamble  = xml.substring(0, h1s[idxTOC].pos);      // everything before TOC
const tocChunk  = chunk(idxTOC, idxIntro);                 // TOC H1 through Intro H1
const introChunk= chunk(idxIntro, idxSec1Water);           // Introduction section
const sec1      = chunk(idxSec1Water, idxSec2Wing);        // Section 1: Water
const sec2Wing  = chunk(idxSec2Wing, idxSec3Eye);          // Section 2: Wing Web
const sec3Eye   = chunk(idxSec3Eye, idxSec4Spray);         // Section 3: Eye Drop
const sec4Spray = chunk(idxSec4Spray, idxSec5InOvo);       // Section 4: Spray
const sec5InOvo = chunk(idxSec5InOvo, idxSec6Inj);         // Section 5: In-Ovo
const sec6Inj   = chunk(idxSec6Inj, idxJournals);          // Section 6: Injection
const postamble = xml.substring(h1s[idxJournals].pos);     // Journals + References

console.log('\nSection chunk lengths:');
console.log('  sec1 (Water):', sec1.length, 'chars');
console.log('  sec2Wing:', sec2Wing.length, 'chars');
console.log('  sec3Eye:', sec3Eye.length, 'chars');
console.log('  sec4Spray:', sec4Spray.length, 'chars');
console.log('  sec5InOvo:', sec5InOvo.length, 'chars');
console.log('  sec6Inj:', sec6Inj.length, 'chars');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Rename section numbers within each moved chunk
// Strategy: use temp markers to avoid collision (e.g., 2→4, 3→2, 4→3)
// ─────────────────────────────────────────────────────────────────────────────
function renameSection(chunk, fromNum, toNum) {
  // Replace "Section X:" heading text
  let c = chunk.replace(
    new RegExp(`Section ${fromNum}:`, 'g'),
    `Section ${toNum}:`
  );
  // Replace "X.Y  " subsection prefixes in heading text (two spaces after number)
  // Also handle "X.Y " with one space (defensive)
  for (let sub = 1; sub <= 10; sub++) {
    c = c.replace(
      new RegExp(`${fromNum}\\.${sub}  `, 'g'),
      `${toNum}.${sub}  `
    );
  }
  return c;
}

// For Wing Web: 2 → 4 (no conflict since 4 is already pulled out)
// For Eye Drop: 3 → 2
// For Spray:    4 → 3
// For Injection: 6 → 5
// For In-Ovo:   5 → 6
//
// Potential conflict: 3→2 and 4→3 could cascade if applied globally,
// but we apply to individual chunks, so no issue.

const sec2_as_sec4 = renameSection(sec2Wing,  2, 4);
const sec3_as_sec2 = renameSection(sec3Eye,   3, 2);
const sec4_as_sec3 = renameSection(sec4Spray, 4, 3);
const sec5_as_sec6 = renameSection(sec5InOvo, 5, 6);
const sec6_as_sec5 = renameSection(sec6Inj,   6, 5);

console.log('\n✓ Section renaming applied:');
console.log('  Wing Web 2→4, Eye Drop 3→2, Spray 4→3, In-Ovo 5→6, Injection 6→5');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: Reassemble in new order
// New order: preamble + TOC + Intro + Sec1(Water) + Sec2(EyeDrop) + Sec3(Spray)
//            + Sec4(WingWeb) + Sec5(Injection) + Sec6(InOvo) + postamble
// ─────────────────────────────────────────────────────────────────────────────
xml = preamble + tocChunk + introChunk + sec1 + sec3_as_sec2 + sec4_as_sec3
    + sec2_as_sec4 + sec6_as_sec5 + sec5_as_sec6 + postamble;

console.log('\n✓ Sections reordered');
console.log('  New order: Water → Eye Drop → Spray → Wing Web → Injection → In-Ovo');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: Insert eye-drop/spray paragraph after "respiratory pathogens" anchor
// This is now in Section 2 (Eye Drop) after renaming
// ─────────────────────────────────────────────────────────────────────────────
const RESP_ANCHOR = 'respiratory pathogens first make contact with the bird.</w:t></w:r></w:p>';
const respIdx = xml.indexOf(RESP_ANCHOR);
if (respIdx === -1) throw new Error('"respiratory pathogens" anchor not found after reorder');

const insertAt = respIdx + RESP_ANCHOR.length;
xml = xml.substring(0, insertAt) + eyedropParaXml + xml.substring(insertAt);

console.log('✓ Eye-drop/spray comparison paragraph inserted after "respiratory pathogens..." sentence');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6: Update the TOC cached entries to reflect new section order
// The TOC SDT contains <w:p> rows with TOC1/TOC2 styles
// We need to update the section name text within those rows
// ─────────────────────────────────────────────────────────────────────────────
const sdtMatch = xml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  // Rename sections in TOC text runs (the cached entries)
  // Old order: Sec1(Water), Sec2(WingWeb), Sec3(EyeDrop), Sec4(Spray), Sec5(InOvo), Sec6(Inj)
  // New order: Sec1(Water), Sec2(EyeDrop), Sec3(Spray), Sec4(WingWeb), Sec5(Inj), Sec6(InOvo)
  // The TOC text runs contain the heading text. We need to update section numbers in them.

  // Replace subsection numbers in TOC (X.Y  Title format):
  // Wing Web 2.x → 4.x, Eye Drop 3.x → 2.x, Spray 4.x → 3.x, InOvo 5→6, Inj 6.x→5.x
  // Use temp markers to avoid cascade replacements
  sdt = sdt.replace(/Section 2:/g, 'Section FOUR:');
  sdt = sdt.replace(/Section 3:/g, 'Section TWO:');
  sdt = sdt.replace(/Section 4:/g, 'Section THREE:');
  sdt = sdt.replace(/Section 5:/g, 'Section SIX:');
  sdt = sdt.replace(/Section 6:/g, 'Section FIVE:');
  sdt = sdt.replace(/Section FOUR:/g, 'Section 4:');
  sdt = sdt.replace(/Section TWO:/g, 'Section 2:');
  sdt = sdt.replace(/Section THREE:/g, 'Section 3:');
  sdt = sdt.replace(/Section SIX:/g, 'Section 6:');
  sdt = sdt.replace(/Section FIVE:/g, 'Section 5:');

  // Subsection numbers in TOC
  for (let sub = 1; sub <= 10; sub++) {
    // Use temp markers
    sdt = sdt.replace(new RegExp(`2\\.${sub}  `, 'g'), `FOUR.${sub}  `);
    sdt = sdt.replace(new RegExp(`3\\.${sub}  `, 'g'), `TWO.${sub}  `);
    sdt = sdt.replace(new RegExp(`4\\.${sub}  `, 'g'), `THREE.${sub}  `);
    sdt = sdt.replace(new RegExp(`6\\.${sub}  `, 'g'), `FIVE.${sub}  `);
  }
  for (let sub = 1; sub <= 10; sub++) {
    sdt = sdt.replace(new RegExp(`FOUR\\.${sub}  `, 'g'), `4.${sub}  `);
    sdt = sdt.replace(new RegExp(`TWO\\.${sub}  `, 'g'), `2.${sub}  `);
    sdt = sdt.replace(new RegExp(`THREE\\.${sub}  `, 'g'), `3.${sub}  `);
    sdt = sdt.replace(new RegExp(`FIVE\\.${sub}  `, 'g'), `5.${sub}  `);
  }

  // Note: page numbers in TOC will be stale — user needs to right-click → Update Field in Word
  xml = xml.replace(sdtMatch[0], sdt);
  console.log('✓ TOC cached entries updated (section names reordered; page numbers need manual Update Field in Word)');
} else {
  console.log('⚠ No TOC SDT found — skipping TOC update');
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 7: Final sanity checks
// ─────────────────────────────────────────────────────────────────────────────
const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (badAfter) throw new Error(`Unescaped & introduced (${badAfter.length} found)`);

// Verify new section order in headings
const finalH1s = findH1Sections(xml);
console.log('\nFinal section order:');
finalH1s.forEach(h => console.log(' ', h.text));

// Verify eye-drop para present in section 2 (Eye Drop) area
const eyedropInFinal = xml.indexOf(EYEDROP_MARKER);
const sec2Pos = finalH1s.find(h => h.text.includes('Section 2'))?.pos ?? -1;
const sec3Pos = finalH1s.find(h => h.text.includes('Section 3'))?.pos ?? -1;
if (eyedropInFinal > sec2Pos && eyedropInFinal < sec3Pos) {
  console.log('\n✓ Eye-drop comparison paragraph confirmed in Section 2 (Eye Drop)');
} else {
  console.log('\n⚠ Eye-drop paragraph position:', eyedropInFinal, '| Sec2:', sec2Pos, '| Sec3:', sec3Pos);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 8: Write output
// ─────────────────────────────────────────────────────────────────────────────
zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT, buf);

console.log(`\nDone.`);
console.log(`Written to: ${OUT}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
console.log('\nNOTE: Open in Word and right-click TOC → Update Field → Update entire table');
console.log('      to refresh page numbers after the section reorder.');
