// fix-c8-merial-attribution.mjs
// Fix copyright attribution: [11] [12] [18] [2] are Merial-authored bulletins
// hosted on cpclearningcentre.ca — they must be attributed to Merial, not CPC Learning Centre.
//
// References affected:
//   [2]  Burns Grogan et al. Avian Immune System: A Brief Review. Merial; 2008.
//   [11] Merial. Water Vaccination [Technical Bulletin]. Merial.
//   [12] Merial. Coarse Spray Vaccination [Technical Bulletin]. Merial.
//   [18] Merial. Injection of Inactivated Vaccines [Technical Bulletin]. Merial.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const JSZip = require('./node_modules/jszip/dist/jszip.js');
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';

function replaceAll(xml, find, repl, label) {
  const count = (xml.split(find).length - 1);
  if (count === 0) { console.error('NOT FOUND:', label); process.exit(1); }
  console.log(`  ${count}x  ${label}`);
  return xml.split(find).join(repl);
}

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  console.log('Fixing Merial attribution (replacing "CPC Learning Centre" with "Merial"):\n');

  // ---- [11] Water Vaccination Technical Bulletin (Merial) ----
  xml = replaceAll(xml,
    'The CPC Learning Centre Water Vaccination Technical Bulletin',
    'The Merial Water Vaccination Technical Bulletin',
    '[11] Water Vaccination Technical Bulletin'
  );
  xml = replaceAll(xml,
    'The CPC Learning Centre Water Vaccination guide',
    'The Merial Water Vaccination Technical Bulletin',
    '[11] Water Vaccination guide → Technical Bulletin'
  );
  // One variant: "The CPC Learning Centre guide assumes..."
  xml = replaceAll(xml,
    'The CPC Learning Centre guide assumes an outdoor temperature',
    'The Merial Water Vaccination Technical Bulletin assumes an outdoor temperature',
    '[11] guide assumes → Technical Bulletin'
  );

  // ---- [12] Coarse Spray Vaccination Technical Bulletin (Merial) ----
  xml = replaceAll(xml,
    'The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin',
    'The Merial Coarse Spray Vaccination Technical Bulletin',
    '[12] Coarse Spray Vaccination Technical Bulletin'
  );

  // ---- [18] Injection of Inactivated Vaccines (Merial) ----
  // "guide" variant first (more specific), then "bulletin" variant
  xml = replaceAll(xml,
    'The CPC Learning Centre Injection of Inactivated Vaccines guide',
    'The Merial Injection of Inactivated Vaccines Technical Bulletin',
    '[18] Injection of Inactivated Vaccines guide → Technical Bulletin'
  );
  xml = replaceAll(xml,
    'The CPC Learning Centre Injection of Inactivated Vaccines bulletin',
    'The Merial Injection of Inactivated Vaccines bulletin',
    '[18] Injection of Inactivated Vaccines bulletin'
  );

  // ---- [2] Avian Immune System: A Brief Review (Merial) ----
  xml = replaceAll(xml,
    'The CPC Learning Centre Article on the Avian Immune System',
    'The Merial Avian Immune System review',
    '[2] Avian Immune System article'
  );

  // ---- Validate no unescaped & ----
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) { console.error('\nFAIL: unescaped & found'); process.exit(1); }

  // ---- Spot-check: confirm no Merial docs still say "CPC Learning Centre" ----
  const checks = [
    'CPC Learning Centre Water Vaccination',
    'CPC Learning Centre Coarse Spray',
    'CPC Learning Centre Injection of Inactivated',
    'CPC Learning Centre Article on the Avian',
  ];
  let clean = true;
  checks.forEach(c => {
    if (xml.includes(c)) { console.error('\nSTILL FOUND (not fixed):', c); clean = false; }
  });
  if (clean) console.log('\nSpot-check clean: no Merial bulletins still attributed to CPC Learning Centre.');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log('Saved:', buf.length.toLocaleString(), 'bytes');
})();
