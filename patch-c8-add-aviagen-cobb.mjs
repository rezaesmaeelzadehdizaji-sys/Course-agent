// patch-c8-add-aviagen-cobb.mjs
// Adds Aviagen (2008) and Cobb-Vantress (2025) as new references [12] and [13]
// Supplements 12 targeted [11] citations with additional validated sources
// Then cascades renumber: old [12-18] shift to [14-20]

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const JSZip = require('./node_modules/jszip/dist/jszip.js');
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';
const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
let xml = await zip.file('word/document.xml').async('string');

function fix(xml, find, repl, label) {
  const n = (xml.split(find).length - 1);
  if (n === 0) { console.error('NOT FOUND:', label); process.exit(1); }
  if (n > 1)   { console.error('AMBIGUOUS (' + n + '):', label); process.exit(1); }
  console.log('  OK  ' + label);
  return xml.split(find).join(repl);
}

// ============================================================
// STEP 1: Supplement [11] citations with [19]=Aviagen, [20]=Cobb
//         (temporary numbers; cascade renumber assigns final positions)
// ============================================================
console.log('\n--- Step 1: Supplement citations ---');

// [11,19,20] -- cold chain confirmed by both Aviagen (2-8C, cooler) and Cobb (2-7C, cool packs)
xml = fix(xml,
  'Never expose to direct sunlight [11].',
  'Never expose to direct sunlight [11,19,20].',
  'Section 1 cold chain: sunlight [11,19,20]');

xml = fix(xml,
  'Keep vaccine between 2°C and 8°C from arrival at the farm until the vial is opened [11].',
  'Keep vaccine between 2°C and 8°C from arrival at the farm until the vial is opened [11,19,20].',
  'Section 1 cold chain: 2-8C storage [11,19,20]');

xml = fix(xml,
  'store at 2-8°C, keep shaded, and do not freeze [11].',
  'store at 2-8°C, keep shaded, and do not freeze [11,19,20].',
  'Wing web cold chain [11,19,20]');

xml = fix(xml,
  'Do not expose to sunlight [11].',
  'Do not expose to sunlight [11,19,20].',
  'Eye drop section: cold chain [11,19,20]');

// [11,19] -- confirmed specifically by Aviagen Brief
xml = fix(xml,
  'Turn off the chlorinator 72 hours before vaccination [11].',
  'Turn off the chlorinator 72 hours before vaccination [11,19].',
  'Chlorinator 72h [11,19]');

xml = fix(xml,
  'use a charcoal filter 72 hours before vaccination to remove chlorine residual from the line [11].',
  'use a charcoal filter 72 hours before vaccination to remove chlorine residual from the line [11,19].',
  'Charcoal filter [11,19]');

xml = fix(xml,
  'Add skim milk powder to the vaccine water at a rate of approximately 454 g per 190 litres (1 lb per 50 gallons) and mix thoroughly [11].',
  'Add skim milk powder to the vaccine water at a rate of approximately 454 g per 190 litres (1 lb per 50 gallons) and mix thoroughly [11,19].',
  'Skim milk preparation [11,19]');

xml = fix(xml,
  'The vaccine should be consumed within two hours of preparation [11].',
  'The vaccine should be consumed within two hours of preparation [11,19].',
  '2-hour consumption window [11,19]');

xml = fix(xml,
  'Withhold water for approximately two hours before vaccination to build enough thirst to drive birds to the drinkers promptly [11].',
  'Withhold water for approximately two hours before vaccination to build enough thirst to drive birds to the drinkers promptly [11,19].',
  'Water withdrawal timing [11,19]');

xml = fix(xml,
  'Vaccinate on feed days [11].',
  'Vaccinate on feed days [11,19].',
  'Feed day vaccination [11,19]');

// [11,20] -- confirmed specifically by Cobb 2025 Guide
xml = fix(xml,
  'Record the serial number and expiry date of every vaccine used [11].',
  'Record the serial number and expiry date of every vaccine used [11,20].',
  'Record keeping [11,20]');

xml = fix(xml,
  'Wear gloves, a mask, and safety glasses during both preparation and administration [11].',
  'Wear gloves, a mask, and safety glasses during both preparation and administration [11,20].',
  'PPE gloves/mask/glasses [11,20]');

// ============================================================
// STEP 2: Add bibliography entries [19] Aviagen and [20] Cobb after [18]
// ============================================================
console.log('\n--- Step 2: Add bibliography entries ---');

const bib18end = 'Merial. Injection of Inactivated Vaccines [Technical Bulletin]. Merial. Available via CPC Learning Centre: cpclearningcentre.ca</w:t></w:r></w:p>';

const bib19para = '<w:p w14:paraId="BB010001" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="80" w:line="260" w:lineRule="auto"/><w:ind w:left="504" w:hanging="504"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve">19.  </w:t></w:r><w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Aviagen. Drinking Water Vaccination [Technical Brief]. Aviagen; 2008. Available from: aviagen.com [cited 2026 May].</w:t></w:r></w:p>';

const bib20para = '<w:p w14:paraId="BB010002" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="80" w:line="260" w:lineRule="auto"/><w:ind w:left="504" w:hanging="504"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve">20.  </w:t></w:r><w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Cobb-Vantress. Vaccination Guide. Cobb-Vantress; 2025. Available from: cobbgenetics.com [cited 2026 May].</w:t></w:r></w:p>';

if (!xml.includes(bib18end)) { console.error('NOT FOUND: bib [18] anchor'); process.exit(1); }
xml = xml.split(bib18end).join(bib18end + bib19para + bib20para);
console.log('  OK  Added [19] Aviagen and [20] Cobb after [18]');

// ============================================================
// STEP 3: Cascade renumber
// New [19] Aviagen and [20] Cobb first appear in Section 1 alongside [11]
// => they become the new [12] and [13]
// Old [12]->[14], [13]->[15], [14]->[16], [15]->[17], [16]->[18], [17]->[19], [18]->[20]
// New [19]->[12], [20]->[13]
// ============================================================
console.log('\n--- Step 3: Cascade renumber ---');

const remap = { 12:14, 13:15, 14:16, 15:17, 16:18, 17:19, 18:20, 19:12, 20:13 };

// Step 3a: Remap all in-text citation brackets atomically (one regex pass, no collisions)
let bracketChanges = 0;
xml = xml.replace(/\[(\d+(?:,\d+)*)\]/g, (match, nums) => {
  const parts = nums.split(',').map(n => {
    const num = parseInt(n);
    return remap[num] !== undefined ? remap[num] : num;
  });
  const newMatch = '[' + parts.join(',') + ']';
  if (newMatch !== match) bracketChanges++;
  return newMatch;
});
console.log('  In-text brackets remapped:', bracketChanges);

// Step 3b: Remap bibliography labels via temp-marker technique
const labelFmt = (n) => 'preserve">' + n + '.  </w:t>';
const tmpFmt   = (n) => 'preserve">TMP' + String(n).padStart(3,'0') + '.  </w:t>';

// Pass 1: old numbers -> temp markers
for (const old of [12,13,14,15,16,17,18,19,20]) {
  if (!xml.includes(labelFmt(old))) { console.error('NOT FOUND bib label:', old); process.exit(1); }
  xml = xml.split(labelFmt(old)).join(tmpFmt(old));
  console.log('  Label', old, '-> TMP' + old);
}

// Pass 2: temp markers -> new numbers
for (const [old, newN] of [[12,14],[13,15],[14,16],[15,17],[16,18],[17,19],[18,20],[19,12],[20,13]]) {
  xml = xml.split(tmpFmt(old)).join(labelFmt(newN));
  console.log('  TMP' + old + ' -> label', newN);
}

const tmpLeft = (xml.match(/TMP\d{3}\.  /g) || []).length;
if (tmpLeft > 0) { console.error('FAIL: ' + tmpLeft + ' TMP markers remain'); process.exit(1); }
console.log('  TMP markers remaining:', tmpLeft, '(must be 0)');

// ============================================================
// STEP 4: Physical reorder bibliography paragraphs 12-20
// ============================================================
console.log('\n--- Step 4: Physical reorder bibliography ---');

function extractBibPara(label) {
  const anchor = 'preserve">' + label + '.  </w:t>';
  const anchorIdx = xml.indexOf(anchor);
  if (anchorIdx === -1) { console.error('NOT FOUND in bib:', label); process.exit(1); }
  const pStart = xml.lastIndexOf('<w:p ', anchorIdx);
  const pEnd = xml.indexOf('</w:p>', anchorIdx) + '</w:p>'.length;
  return { start: pStart, end: pEnd, text: xml.substring(pStart, pEnd) };
}

// Extract paras 12-20 in LABEL order (desired final order)
const paras = [];
for (let n = 12; n <= 20; n++) {
  paras.push(extractBibPara(n));
}

// The physical block spans from earliest to latest start/end
const blockStart = Math.min(...paras.map(p => p.start));
const blockEnd   = Math.max(...paras.map(p => p.end));

// Reconstruct in label order (12, 13, 14, ..., 20)
const newBlock = paras.map(p => p.text).join('');
xml = xml.substring(0, blockStart) + newBlock + xml.substring(blockEnd);
console.log('  Bibliography paragraphs 12-20 physically reordered');

// ============================================================
// STEP 5: Validate
// ============================================================
console.log('\n--- Step 5: Validate ---');

const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) { console.error('FAIL: unescaped &'); process.exit(1); }

const joined = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map(m => m[1]).join('');
const firstApp = {};
for (const m of [...joined.matchAll(/\[(\d+(?:,\d+)*)\]/g)]) {
  for (const n of m[1].split(',').map(Number)) {
    if (firstApp[n] === undefined) firstApp[n] = m.index;
  }
}
const sortedOrder = Object.entries(firstApp)
  .map(([n, p]) => ({ n: parseInt(n), p }))
  .sort((a,b) => a.p - b.p)
  .map(x => x.n);
console.log('  Final first-appearance order:', sortedOrder.join(', '));

let ok = true;
for (let i = 0; i < sortedOrder.length - 1; i++) {
  if (sortedOrder[i] > sortedOrder[i+1]) {
    console.error('  ORDER VIOLATION: [' + sortedOrder[i] + '] before [' + sortedOrder[i+1] + ']');
    ok = false;
  }
}
if (ok) console.log('  Citation order: SEQUENTIAL -- all good.');

const c11solo  = (joined.match(/\[11\]/g) || []).length;
const c11multi = (joined.match(/\[11,/g) || []).length;
console.log('  [11] solo:', c11solo, '  [11,x] multi-ref:', c11multi, '  Total [11]:', c11solo + c11multi);

// Confirm new refs appear in bibliography
const bib12ok = joined.includes('12.  ') && joined.includes('Aviagen');
const bib13ok = joined.includes('13.  ') && joined.includes('Cobb-Vantress');
console.log('  [12] Aviagen in bibliography:', bib12ok);
console.log('  [13] Cobb-Vantress in bibliography:', bib13ok);

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(SRC, buf);
console.log('\nSaved:', buf.length.toLocaleString(), 'bytes');
console.log('\nRemapping summary: old [12-18] -> new [14-20]; new Aviagen -> [12]; new Cobb -> [13]');
