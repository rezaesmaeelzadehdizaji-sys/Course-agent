// patch-course8-corrections.mjs
// Applies verified factual and citation corrections to Course 8 Vaccination_draft.docx
// Run: node patch-course8-corrections.mjs

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
const OUT = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
let xml = await zip.file('word/document.xml').async('string');

// Verify no unescaped & before starting
const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) throw new Error(`Unescaped & in source XML (${bad.length} found)`);

const fixes = [
  // --- Factual corrections ---

  // Fix 1: Section 4.3 PSI value: 65-73 → 65-75 (CPC Coarse-Spray.pdf says "65-75 PSI")
  [
    '4.5-5.0 Bar (65-73 PSI)',
    '4.5-5.0 Bar (65-75 PSI)',
  ],

  // Fix 2: Section 6.3 warming time: "at least one hour" → "24 hours" (CPC Inactive-Vax.pdf)
  // Source says: "Take vaccine out of the refrigerator 24 hours before administration"
  [
    'Remove vaccine from the refrigerator at least one hour before vaccination and allow it to warm to 20 to 25°C.',
    'Remove vaccine from the refrigerator 24 hours before vaccination to allow it to reach room temperature (approximately 22°C / 72°F). Cold vaccine is more viscous and harder to inject.',
  ],

  // Also remove the sentence that followed (now absorbed into above)
  [
    ' Cold vaccine is more viscous, harder to inject, and causes more pain and tissue reaction at the injection site than vaccine at room temperature.',
    '',
  ],

  // Fix 3: Section 6.3 needle change frequency: "every 500 birds" → "every 1,000 birds" (CPC Inactive-Vax.pdf)
  // Source says: "Change the needle at no more than every 1,000 birds"
  [
    'Change the needle at least every 500 birds, and immediately if it becomes bent, dull, or contaminated.',
    'Change the needle at no more than every 1,000 birds, and immediately if it becomes bent, dull, or contaminated.',
  ],

  // Fix 4: Section 6.3 calibration fluid: "clean cup of water" → "mineral oil" (CPC Inactive-Vax.pdf)
  // Source says: "calibrate... using mineral oil (because it is liquid with a viscosity similar to vaccine)"
  [
    'test-inject into a clean cup of water to confirm the volume is correct.',
    'test-inject five doses into a syringe using mineral oil (its viscosity is similar to vaccine, giving an accurate calibration check).',
  ],

  // --- Reference corrections ---

  // Fix 5: Ref [3] author "Burns Grogan KA" → "Burns Grogan K"
  // The "(A)" in the source document is the institution superscript marker, not a middle initial.
  // Author is Karen Burns Grogan → Vancouver style → Burns Grogan K
  [
    'Burns Grogan KA, Fernandez RJ, Rojo Barranon FJ, Garcia Espinosa H.',
    'Burns Grogan K, Fernández RJ, Rojo Barranón FJ, García Espinosa H.',
  ],

  // Fix 6: Ref [4] title "Inactivated Vaccine Administration" → "Injection of Inactivated Vaccines"
  // Actual document title from Inactive-Vax.pdf is "Injection of Inactivated Vaccines"
  [
    'Merial. Inactivated Vaccine Administration [Technical Bulletin].',
    'Merial. Injection of Inactivated Vaccines [Technical Bulletin].',
  ],

  // Also fix the in-text citations that use the old title
  [
    'CPC Learning Centre Inactivated Vaccine Administration bulletin is the reference document for this section',
    'CPC Learning Centre Injection of Inactivated Vaccines bulletin is the reference document for this section',
  ],
  [
    'CPC Learning Centre Inactivated Vaccine Administration bulletin describes inactivated vaccines',
    'CPC Learning Centre Injection of Inactivated Vaccines bulletin describes inactivated vaccines',
  ],
  [
    'CPC Learning Centre Inactivated Vaccine Administration guide specifies changing the needle',
    'CPC Learning Centre Injection of Inactivated Vaccines guide specifies changing the needle',
  ],
  [
    'The CPC Learning Centre Inactivated Vaccine Administration bulletin [4].',
    'The CPC Learning Centre Injection of Inactivated Vaccines bulletin [4].',
  ],
  [
    'CPC Learning Centre Inactivated Vaccine Administration bulletin specifies recording',
    'CPC Learning Centre Injection of Inactivated Vaccines bulletin specifies recording',
  ],

  // Fix 7: Ref [11] add year 2005 (©2005 Merial Limited per the source document)
  [
    'Montiel E. Troubleshooting a Marek’s Disease Outbreak [Technical Bulletin]. CPC Learning Centre; [cited 2026 May].',
    'Montiel E. Troubleshooting a Marek’s Disease Outbreak [Technical Bulletin]. Merial; 2005 [cited 2026 May].',
  ],
];

let changeCount = 0;
for (const [find, replace] of fixes) {
  if (find === '') continue;
  if (xml.includes(find)) {
    xml = xml.split(find).join(replace);
    changeCount++;
    console.log(`  ✓ Fixed: "${find.substring(0, 60)}..."`);
  } else {
    console.log(`  ⚠ NOT FOUND (may already be fixed): "${find.substring(0, 60)}..."`);
  }
}

// Verify no unescaped & slipped in
const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (badAfter) throw new Error(`Unescaped & introduced in replacement (${badAfter.length} found)`);

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT, buf);

console.log(`\nDone. Applied ${changeCount}/${fixes.filter(([f]) => f).length} fixes.`);
console.log(`Written to: ${OUT}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
