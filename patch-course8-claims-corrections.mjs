// patch-course8-claims-corrections.mjs
// Fixes confirmed factual errors found during claims-level source verification.
//
// Every claim below was cross-checked against the cited source PDF before patching.
//
// Sources checked:
//   [11] = Water-Vax.pdf (Merial Water Vaccination Technical Bulletin)
//   [20] = Inactive-Vax.pdf (Merial Injection of Inactivated Vaccines)
//   [1]  = principles_of_vaccination.pdf (CPC Learning Centre General Principles)
//   [21] = Butcher et al. VM132 (PDF header confirms VM132, not VM097)
//
// Errors fixed:
//  1. Bell drinker ratio: course 1/50 → Water-Vax [11] says 1/100
//  2. Nipple drinker ratio: course 1/10-12 → Water-Vax [11] says 1/15
//  3. Cup drinker ratio: course 1/25 → Water-Vax [11] says 1/30
//  4. Feed day instruction: course softens "do NOT vaccinate on the feed day" to "try to avoid
//     right after a big feed" → restore hard instruction per Inactive-Vax [20]
//  5. Needle spec: course "18 to 20 gauge" and "1.5 cm / 2 to 2.5 cm" → source [1,20] says
//     18-gauge, 6 mm (1/4 inch) for SC and 12 mm (1/2 inch) for IM
//  6. Agitation: course "if it runs longer than 30-45 min" → Inactive-Vax [20] says
//     "regularly (for 30 seconds) during vaccination" — no session-length qualifier
//  7. Reference [21] document number VM097 → VM132 (confirmed from PDF header text)

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const FIXES = [
  // 1. Bell drinker ratio — Water-Vax says 1/100, not 1/50
  {
    desc: 'Fix §1.6 drinker table: Bell drinker 1 per 50 → 1 per 100 (Water-Vax [11])',
    old: 'Bell drinkers: 1 per 50 birds',
    new: 'Bell drinkers: 1 per 100 birds',
  },

  // 2. Nipple drinker ratio — Water-Vax says 1/15, not 1/10-12
  {
    desc: 'Fix §1.6 drinker table: Nipple drinker 1 per 10-12 → 1 per 15 (Water-Vax [11])',
    old: 'Nipple drinkers: 1 per 10-12 birds',
    new: 'Nipple drinkers: 1 per 15 birds',
  },

  // 3. Cup drinker ratio — Water-Vax says 1/30, not 1/25
  {
    desc: 'Fix §1.6 drinker table: Cup drinker 1 per 25 → 1 per 30 (Water-Vax [11])',
    old: 'Cup drinkers: 1 per 25 birds',
    new: 'Cup drinkers: 1 per 30 birds',
  },

  // 4. Feed day instruction — Inactive-Vax says "do NOT vaccinate the birds on the feed day"
  //    The course softens this to a mild suggestion, which contradicts the source.
  {
    desc: 'Fix §5.3 feed day: "try to avoid right after big feed" → "do not vaccinate on feed day" (Inactive-Vax [20])',
    old: 'Try to avoid injecting birds right after a big feed, because a full crop plus handling can cause some birds to bring feed back up and increases the risk of aspiration. Aim to vaccinate at a steady time of day when birds are settled and not crowding the feeders or drinkers.',
    new: 'Do not vaccinate the birds on the feed day [20]. A full crop combined with handling increases the risk of regurgitation and aspiration. Aim to vaccinate when birds have had several hours without feed and are settled.',
  },

  // 5. Needle specification — Inactive-Vax [20]: "18-gauge X 1/4 inch needles"
  //    Principles of Vaccination [1]: "6-mm (1/4 inch) or a 12-mm (1/2 inch)"
  //    Course had "18 to 20 gauge", "1.5 cm" for SC, "2 to 2.5 cm" for IM — all wrong.
  {
    desc: 'Fix §5.3 needle: "18 to 20 gauge / 1.5 cm / 2 to 2.5 cm" → "18-gauge / 6 mm / 12 mm" per [1,20]',
    old: 'Most killed vaccine protocols call for an 18 to 20 gauge needle. Use a shorter needle (1.5 cm) for subcutaneous injection and a longer needle (2 to 2.5 cm) for intramuscular injection. Change the needle at no more than every 1,000 birds, and immediately if it becomes bent, dull, or contaminated [20].',
    new: 'Most killed vaccine protocols call for an 18-gauge needle. Use a shorter needle (6 mm / 1/4 inch) for subcutaneous injection and a longer needle (12 mm / 1/2 inch) for intramuscular injection [1,20]. Change the needle at no more than every 1,000 birds, and immediately if it becomes bent, dull, or contaminated [20].',
  },

  // 6. Agitation — Inactive-Vax [20] says "Agitate vaccine regularly (for 30 seconds) during
  //    vaccination" with no session-length qualifier. Course added "if it runs longer than
  //    30 to 45 minutes" which is not in the source.
  {
    desc: 'Fix §5.3 agitation: "if it runs longer than 30-45 min" → "regularly (for 30 seconds)" per [20]',
    old: 'periodically during the session if it runs longer than 30 to 45 minutes. Separation during a long session means the later birds are receiving a different antigen concentration than the early birds [20].',
    new: 'regularly (for 30 seconds) throughout the vaccination session [20]. Separation in the vial means the later birds are receiving a different antigen concentration than the early birds.',
  },

  // 7a. Reference VM097 → VM132 in the label
  {
    desc: 'Fix bibliography [21]: extension publication number VM097 → VM132 (confirmed from PDF header)',
    old: 'Extension Publication VM097',
    new: 'Extension Publication VM132',
  },

  // 7b. Reference VM097 → VM132 in the URL
  {
    desc: 'Fix bibliography [21]: URL VM097 → VM132',
    old: 'edis.ifas.ufl.edu/publication/VM097',
    new: 'edis.ifas.ufl.edu/publication/VM132',
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
