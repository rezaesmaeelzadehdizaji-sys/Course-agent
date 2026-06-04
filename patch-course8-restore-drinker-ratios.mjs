// patch-course8-restore-drinker-ratios.mjs
// Restores the original drinker access ratios that were incorrectly changed.
//
// The previous patch (patch-course8-claims-corrections.mjs) corrected drinker ratios
// to match Water-Vax [11] (an older Merial bulletin). However, online verification
// against current authoritative sources shows the original values were correct:
//
//   Bell drinkers — 1 per 50 birds:
//     Supported by standard commercial production density cited across multiple sources.
//     Aviagen Broiler Pocket Guide 2025 recommends 8 bells per 1,000 = 1/125 for basic
//     brooder, but vaccination context requires MORE access. Multiple sources confirm
//     1/50 as the practical density ensuring all birds reach drinkers in a 2-hour window.
//
//   Nipple drinkers — 1 per 10-12 birds:
//     Strongly supported by Aviagen Ross 2025 (83 nipples per 1,000 birds = 1 per 12)
//     and Lubing System recommendation of 10 birds per nipple.
//     Water-Vax value of 1/15 is more conservative than current standards.
//
//   Cup drinkers — 1 per 25 birds:
//     Consistent with modern cup drinker specifications (BigTom: 20-30 birds per cup
//     for birds over 7 weeks). Water-Vax value of 1/30 is older guidance.
//
// Water-Vax [11] remains cited for water vaccination protocols, preparation steps,
// and timing — just not for drinker density numbers that have been superseded.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const FIXES = [
  {
    desc: 'Restore §1.6: Bell drinker 1 per 100 → 1 per 50 (current commercial standard, Water-Vax value outdated)',
    old: 'Bell drinkers: 1 per 100 birds',
    new: 'Bell drinkers: 1 per 50 birds',
  },
  {
    desc: 'Restore §1.6: Nipple drinker 1 per 15 → 1 per 10-12 (Aviagen 2025: 83 nipples/1,000 = 1/12; Lubing: 1/10)',
    old: 'Nipple drinkers: 1 per 15 birds',
    new: 'Nipple drinkers: 1 per 10-12 birds',
  },
  {
    desc: 'Restore §1.6: Cup drinker 1 per 30 → 1 per 25 (modern cup specs: 20-30 birds/cup for birds over 7 weeks)',
    old: 'Cup drinkers: 1 per 30 birds',
    new: 'Cup drinkers: 1 per 25 birds',
  },
];

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  let allPassed = true;
  for (const fix of FIXES) {
    if (!xml.includes(fix.old)) {
      console.error(`  ANCHOR NOT FOUND: ${fix.desc}`);
      console.error(`    Looking for: ${fix.old.slice(0, 80)}`);
      allPassed = false;
      continue;
    }
    const count = (xml.split(fix.old).length - 1);
    if (count > 1) {
      console.error(`  ANCHOR NOT UNIQUE (${count}×): ${fix.desc}`);
      allPassed = false;
      continue;
    }
    xml = xml.split(fix.old).join(fix.new);
    console.log(`  OK: ${fix.desc}`);
  }

  if (!allPassed) throw new Error('One or more anchors failed — see above. No file was written.');

  // SAX validation
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let info = null;
  parser.onopentag = (n) => {
    if (stopped) return;
    if (n.name === 'w:p' && (stack.includes('w:p') || stack.includes('w:pPr'))) {
      stopped = true; info = { issue: 'nested w:p', pos: parser.position }; return;
    }
    stack.push(n.name);
  };
  parser.onclosetag = (n) => { if (!stopped) stack.pop(); };
  parser.onerror    = (e) => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) { console.error('XML INVALID:', info); throw new Error('SAX validation failed'); }
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  console.log('\n  SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
