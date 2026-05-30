// patch-course8-iga-eyedrop.mjs
// Fix 1: Replace IgA/respiratory paragraph with shorter route-matching statement
// Fix 2: Insert new eye-drop vs spray/water paragraph after the intro's last sentence
// Run: node patch-course8-iga-eyedrop.mjs

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

// --- Fix 1: Replace IgA/respiratory paragraph text ---
const IGA_OLD = 'For respiratory vaccines like Newcastle Disease (NDV) and Infectious Bronchitis (IBV) delivered by water, the IgA generated in the gut travels to the respiratory surfaces and blocks virus at the entry point. For Infectious Bursal Disease (IBD/Gumboro), the IgA response at the gut lining itself is where the protection sits.';
const IGA_NEW = 'How we give a live vaccine helps decide where the bird builds IgA and local protection, so we try to match the route to the main entry point of that virus. We also choose the route with current field strains in mind, because different virus strains like different tissues in the bird.';

// --- Fix 2: Insert new paragraph after "...each demands its own protocol." ---
// The anchor is the closing tags immediately after that sentence (unique in the document)
const ANCHOR = 'each demands its own protocol.</w:t></w:r></w:p>';

// New paragraph uses same body text formatting as surrounding paragraphs
const NEW_PARA_XML =
  '<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>' +
  '<w:r><w:rPr>' +
  '<w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/>' +
  '<w:b w:val="false"/><w:bCs w:val="false"/><w:i w:val="false"/><w:iCs w:val="false"/>' +
  '<w:color w:val="3C3C3C"/><w:sz w:val="24"/><w:szCs w:val="24"/>' +
  '</w:rPr>' +
  '<w:t xml:space="preserve">Field and experimental studies show that live vaccines delivered by eye-drop usually give the most uniform and reliable immune response, because every bird receives a full dose directly to the eye and upper airways. Spray and drinking-water vaccination can also protect well but are more sensitive to water quality, equipment, droplet size, and bird drinking behavior, which makes the actual \'take\' more variable between flocks. [NEEDS SOURCE]</w:t>' +
  '</w:r></w:p>';

const fixes = [
  [IGA_OLD, IGA_NEW],
  [ANCHOR, ANCHOR + NEW_PARA_XML],
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

// Verify no unescaped & slipped in
const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (badAfter) throw new Error(`Unescaped & introduced (${badAfter.length} found)`);

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT, buf);

console.log(`\nDone. Applied ${changeCount}/${fixes.length} fixes.`);
console.log(`Written to: ${OUT}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
