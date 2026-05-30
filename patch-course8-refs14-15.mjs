// patch-course8-refs14-15.mjs
// 1. Replace [NEEDS SOURCE] with [14,15] in the eye-drop/spray paragraph
// 2. Append refs 14 and 15 to the bibliography
// Run: node patch-course8-refs14-15.mjs

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

// Reusable run XML builders
const boldBlueRun = (text) =>
  '<w:r><w:rPr>' +
  '<w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/>' +
  '<w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="22"/><w:szCs w:val="22"/>' +
  '</w:rPr>' +
  `<w:t xml:space="preserve">${text}</w:t></w:r>`;

const grayRun = (text) =>
  '<w:r><w:rPr>' +
  '<w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/>' +
  '<w:color w:val="3C3C3C"/><w:sz w:val="22"/><w:szCs w:val="22"/>' +
  '</w:rPr>' +
  `<w:t xml:space="preserve">${text}</w:t></w:r>`;

const refPPr =
  '<w:pPr><w:spacing w:after="80" w:line="260" w:lineRule="auto"/>' +
  '<w:ind w:left="504" w:hanging="504"/></w:pPr>';

const refPara = (num, text) =>
  `<w:p>${refPPr}${boldBlueRun(num + '.  ')}${grayRun(text)}</w:p>`;

// Verified citations (PubMed-confirmed)
// Ref 14: Al-Rasheed et al. 2023 — PMID 37316407
// Ref 15: Andreasen et al. 1989  — PMID 2549939
const EN = '–'; // en dash for page ranges in citations

const REF14_TEXT =
  'Al-Rasheed M, Ball C, Parthiban S, Ganapathy K. ' +
  'Evaluation of protection and immunity induced by infectious bronchitis vaccines ' +
  'administered by oculonasal, spray or gel routes in commercial broiler chicks. ' +
  `Vaccine. 2023;41(31):4508${EN}4524. doi:10.1016/j.vaccine.2023.05.073.`;

const REF15_TEXT =
  'Andreasen JR Jr, Glisson JR, Goodwin MA, Resurreccion RS, Villegas P, Brown J. ' +
  'Studies of infectious laryngotracheitis vaccines: immunity in broilers. ' +
  `Avian Dis. 1989;33(3):516${EN}523. PMID: 2549939.`;

// Anchor = unique end of ref 13 paragraph
const REF13_ANCHOR = 'merckvetmanual.com</w:t></w:r></w:p>';

const fixes = [
  // Fix 1: swap [NEEDS SOURCE] for citation numbers
  ['[NEEDS SOURCE]', '[14,15]'],
  // Fix 2: append refs 14 and 15 immediately after ref 13
  [
    REF13_ANCHOR,
    REF13_ANCHOR + refPara('14', REF14_TEXT) + refPara('15', REF15_TEXT),
  ],
];

let changeCount = 0;
for (const [find, replace] of fixes) {
  if (xml.includes(find)) {
    xml = xml.split(find).join(replace);
    changeCount++;
    console.log(`  ✓ Applied: "${find.substring(0, 70)}..."`);
  } else {
    console.log(`  ⚠ NOT FOUND: "${find.substring(0, 70)}..."`);
  }
}

const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (badAfter) throw new Error(`Unescaped & introduced (${badAfter.length} found)`);

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT, buf);

console.log(`\nDone. Applied ${changeCount}/${fixes.length} fixes.`);
console.log(`Written to: ${OUT}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
