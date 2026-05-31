// patch-course8-renumber-citations.mjs
// Renumber all in-text citations and reorder bibliography entries
// to match the new section order (Water→EyeDrop→Spray→WingWeb→Injection→InOvo)
//
// First-appearance order after section reorder: 2,3,5,11,12,10,8,1,14,15,9,6,13,7,4
// → maps each to new sequential number 1–15
//
// Run: node patch-course8-renumber-citations.mjs

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
const OUT = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
let xml = await zip.file('word/document.xml').async('string');

const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) throw new Error(`Unescaped & in source XML (${bad.length} found)`);

// ─────────────────────────────────────────────────────────────────────────────
// Renumbering map: old citation number → new citation number
// Based on first-appearance order: 2,3,5,11,12,10,8,1,14,15,9,6,13,7,4
// ─────────────────────────────────────────────────────────────────────────────
const OLD_TO_NEW = {
   1:  8,   // Water Vaccination TB → appears 8th
   2:  1,   // General Principles → appears 1st
   3:  2,   // Burns Grogan Avian Immune System → appears 2nd
   4: 15,   // Injection of Inactivated Vaccines TB → appears 15th
   5:  3,   // Maternal Antibody Transfer → appears 3rd
   6: 12,   // Coarse Spray Vaccination TB → appears 12th
   7: 14,   // Fowl Pox Disease Profile → appears 14th
   8:  7,   // IBV Disease Profile → appears 7th
   9: 11,   // ILT Disease Profile → appears 11th
  10:  6,   // IBD Disease Profile → appears 6th
  11:  4,   // Montiel Marek's Disease TB → appears 4th
  12:  5,   // Diseases of Poultry 14th ed → appears 5th
  13: 13,   // Merck Vet Manual → stays 13th
  14:  9,   // Al-Rasheed IB oculonasal Vaccine 2023 → appears 9th
  15: 10,   // Andreasen ILT Avian Dis 1989 → appears 10th
};

// The new bibliography order (sorted by new number = appearance order):
// New 1:  old 2  General Principles of Vaccination
// New 2:  old 3  Burns Grogan — Avian Immune System
// New 3:  old 5  Maternal Antibody Transfer
// New 4:  old 11 Montiel — Marek's Disease
// New 5:  old 12 Diseases of Poultry 14th ed
// New 6:  old 10 IBD Disease Profile
// New 7:  old 8  IBV Disease Profile
// New 8:  old 1  Water Vaccination TB
// New 9:  old 14 Al-Rasheed IB oculonasal
// New 10: old 15 Andreasen ILT
// New 11: old 9  ILT Disease Profile
// New 12: old 6  Coarse Spray Vaccination TB
// New 13: old 13 Merck Vet Manual
// New 14: old 7  Fowl Pox Disease Profile
// New 15: old 4  Injection of Inactivated Vaccines TB
const NEW_ORDER_OLD_NUMS = [2, 3, 5, 11, 12, 10, 8, 1, 14, 15, 9, 6, 13, 7, 4];

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Rename in-text citations using temp markers to avoid cascading
// ─────────────────────────────────────────────────────────────────────────────

// Collect all unique citation patterns from the XML text
const allPatterns = new Set();
const citePat = /\[(\d+(?:,\d+)*)\]/g;
let m;
while ((m = citePat.exec(xml)) !== null) {
  allPatterns.add(m[1]);
}

// Sort patterns by length descending (handle multi-number patterns first)
const sortedPatterns = [...allPatterns].sort((a, b) => b.length - a.length);
console.log('Citation patterns to process:', sortedPatterns);

// Pass 1: replace each pattern with a unique temp marker
for (const pattern of sortedPatterns) {
  const oldNums = pattern.split(',').map(Number);
  const newNums = oldNums.map(n => OLD_TO_NEW[n]).sort((a, b) => a - b);
  const newPattern = newNums.join(',');
  const tempMarker = `[RNTEMP_${newPattern}_RNTEMP]`;
  const count = (xml.match(new RegExp('\\[' + pattern.replace(/,/g, ',') + '\\]', 'g')) || []).length;
  xml = xml.split('[' + pattern + ']').join(tempMarker);
  console.log(`  [${pattern}] → [${newPattern}] (${count} occurrences)`);
}

// Pass 2: replace all temp markers with final bracket notation
xml = xml.replace(/\[RNTEMP_(\d+(?:,\d+)*)_RNTEMP\]/g, '[$1]');
console.log('\n✓ In-text citations renumbered');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Extract, reorder, and renumber bibliography paragraphs
// Bibliography paragraphs have w:ind w:left="504" w:hanging="504"
// ─────────────────────────────────────────────────────────────────────────────

// Find the References H1 heading position
const refsHeadIdx = xml.indexOf('>References<');
if (refsHeadIdx === -1) throw new Error('References heading not found');

// Extract bibliography section XML (from heading to end of document)
const beforeBib = xml.substring(0, refsHeadIdx + '>References<'.length);
const afterRefsHeadClose = xml.indexOf('</w:p>', refsHeadIdx);
const bibSectionStart = afterRefsHeadClose + '</w:p>'.length;

const bibSectionXml = xml.substring(bibSectionStart);

// Extract individual bibliography paragraph XMLs
const bibParaRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:ind w:left="504" w:hanging="504"[^>]*\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
const bibParas = [];
let bm;
while ((bm = bibParaRe.exec(bibSectionXml)) !== null) {
  const texts = [...bm[0].matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('');
  // First number run tells us the old number: "N.  "
  const numMatch = texts.trim().match(/^(\d+)\.\s/);
  if (numMatch) {
    const oldNum = parseInt(numMatch[1]);
    bibParas.push({ oldNum, xml: bm[0], text: texts.trim() });
  }
}

console.log(`\nFound ${bibParas.length} bibliography paragraphs`);
bibParas.forEach(p => console.log(`  Old [${p.oldNum}]: ${p.text.substring(0, 80)}...`));

if (bibParas.length !== 15) {
  console.log('⚠ Expected 15 bibliography entries, got', bibParas.length);
}

// Create a map from old number to para XML
const bibByOldNum = {};
bibParas.forEach(p => bibByOldNum[p.oldNum] = p.xml);

// Build reordered bibliography in new number order
// NEW_ORDER_OLD_NUMS = [2,3,5,11,12,10,8,1,14,15,9,6,13,7,4]
// New number i+1 = entry with old number NEW_ORDER_OLD_NUMS[i]
function updateBibNumber(paraXml, newNum) {
  // The first bold blue <w:t> run contains "N.  " — replace just that number
  // It looks like: <w:t xml:space="preserve">N.  </w:t>
  return paraXml.replace(
    /(<w:t xml:space="preserve">)\d+\.\s{1,3}(<\/w:t>)/,
    (match, open, close) => `${open}${newNum}.  ${close}`
  );
}

let reorderedBibXml = '';
NEW_ORDER_OLD_NUMS.forEach((oldNum, idx) => {
  const newNum = idx + 1;
  const paraXml = bibByOldNum[oldNum];
  if (!paraXml) {
    console.log(`⚠ No bibliography paragraph found for old [${oldNum}]`);
    return;
  }
  const updatedXml = updateBibNumber(paraXml, newNum);
  reorderedBibXml += updatedXml;
  const text = [...updatedXml.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('').trim();
  console.log(`  New [${newNum}] ← old [${oldNum}]: ${text.substring(0, 70)}...`);
});

// Reconstruct the bib section: replace the old paragraph block with reordered one
// The old block starts right after the References H1 paragraph and ends with the last bib para
const firstBibPara = bibParas[0];
const lastBibPara = bibParas[bibParas.length - 1];

// Find original bib block in bibSectionXml
const firstParaInBib = bibSectionXml.indexOf(firstBibPara.xml);
const lastParaEnd = bibSectionXml.indexOf(lastBibPara.xml) + lastBibPara.xml.length;

const newBibSection = bibSectionXml.substring(0, firstParaInBib)
                    + reorderedBibXml
                    + bibSectionXml.substring(lastParaEnd);

// Reassemble full XML
xml = xml.substring(0, bibSectionStart) + newBibSection;
console.log('\n✓ Bibliography reordered and renumbered');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Verify — check citation first-appearance order
// ─────────────────────────────────────────────────────────────────────────────
const allTexts = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join(' ');
const seenNums = new Set();
const appearOrder = [];
const verifyRe = /\[(\d+(?:,\d+)*)\]/g;
let vm;
while ((vm = verifyRe.exec(allTexts)) !== null) {
  vm[1].split(',').map(Number).forEach(n => {
    if (!seenNums.has(n)) { seenNums.add(n); appearOrder.push(n); }
  });
}
console.log('\nVerification — first-appearance order:', appearOrder.join(', '));
const isOrdered = appearOrder.every((n, i) => i === 0 || n > appearOrder[i-1]);
console.log('Is sequential?', isOrdered ? 'YES ✓' : 'NO — check above for errors');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: Sanity check and write
// ─────────────────────────────────────────────────────────────────────────────
const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (badAfter) throw new Error(`Unescaped & introduced (${badAfter.length} found)`);

const tempLeft = (xml.match(/RNTEMP/g) || []).length;
if (tempLeft > 0) throw new Error(`${tempLeft} RNTEMP markers left in XML — temp replacement incomplete`);

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT, buf);

console.log(`\nDone. Written to: ${OUT}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
