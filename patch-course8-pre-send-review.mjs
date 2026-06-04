// patch-course8-pre-send-review.mjs
// Applies all corrections found during pre-send sentence-level review.
//
// Errors fixed:
//  1. "see Section 5" → "see Section 6" (in-ovo is Section 6)
//  2. "All six vaccination methods" → "All seven vaccination methods"
//  3. Remove the inactivated Marek's clause from §5 intro (Marek's vaccines are live, not inactivated)
//  4. "-80°C in liquid nitrogen dewars" → "in liquid nitrogen dewars (-196°C)" (LN2 is –196°C, not –80°C)
//  5. "oviduct; meaning" → "oviduct, meaning" (semicolon used as em-dash substitute)
//  6. "have shifted, Delmarva strain" → comma splice: split into two sentences
//  7. "mass application, many programs" → comma splice: split into two sentences
//  8. "right pressure, right particle size" → missing "the"
//  9. "day 7–10" in prose → "day 7 to 10" (en dash banned in body prose)
// 10. "between flocks. [17,18]" → citation before period: "between flocks [17,18]."
// 11. "dry place [2]" → wrong citation; immunology paper cited for cleaning protocol → "[1]"
// 12. "British Columbia yet [9]" → regional genotyping claim needs both sources → "[9,10]"

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const FIXES = [
  // 1. Wrong section cross-reference
  {
    desc: 'Fix §1.1 cross-ref: Section 5 → Section 6 (in-ovo)',
    old: 'see Section 5 of this course',
    new: 'see Section 6 of this course',
  },

  // 2. Wrong method count in §2.8
  {
    desc: 'Fix §2.8: "All six" → "All seven" vaccination methods',
    old: 'All six vaccination methods in this course depend on the same foundation',
    new: 'All seven vaccination methods in this course depend on the same foundation',
  },

  // 3. Inactivated Marek's clause in §5 intro (Marek's vaccines are live, not inactivated)
  {
    desc: 'Fix §5 intro: remove inactivated Marek\'s Disease clause (Marek vaccines are live)',
    old: ", and for inactivated Marek's Disease vaccine in programs where the in-ovo HVT dose is supplemented with an SB-1 or bivalent product at hatch",
    new: '',
  },

  // 4. Wrong liquid nitrogen temperature in §6
  {
    desc: 'Fix §6: liquid nitrogen temp -80°C → -196°C',
    old: 'require storage at -80°C in liquid nitrogen dewars',
    new: 'require storage in liquid nitrogen dewars (-196°C)',
  },

  // 5. Semicolon used as em-dash substitute in §1.2
  {
    desc: 'Fix §1.2 IBV: semicolon → comma before "meaning"',
    old: 'permanently scar the oviduct; meaning those hens may never lay properly',
    new: 'permanently scar the oviduct, meaning those hens may never lay properly',
  },

  // 6. Comma splice in §1.2 IBV paragraph
  {
    desc: 'Fix §1.2 IBV: comma splice "shifted, Delmarva" → two sentences',
    old: 'the dominant field strains have shifted, Delmarva strain has made up',
    new: 'the dominant field strains have shifted. The Delmarva strain has made up',
  },

  // 7. Comma splice in §1.2 IBV paragraph
  {
    desc: 'Fix §1.2 IBV: comma splice "mass application, many programs" → two sentences',
    old: 'drinking water works well for mass application, many programs use both at different stages',
    new: 'drinking water works well for mass application. Many programs use both at different stages',
  },

  // 8. Missing "the" in §2 intro
  {
    desc: 'Fix §2 intro: missing "the" before "right particle size"',
    old: 'the right pressure, right particle size, the right height',
    new: 'the right pressure, the right particle size, the right height',
  },

  // 9. En dash in body prose §2.8 (only allowed in table cells)
  {
    desc: 'Fix §2.8: en dash in prose "day 7–10" → "day 7 to 10"',
    old: 'a take is visible at day 7–10, or water vaccination',
    new: 'a take is visible at day 7 to 10, or water vaccination',
  },

  // 10. Citation [17,18] placed after period instead of before
  {
    desc: 'Fix §3 intro: citation [17,18] placed after period → move before period',
    old: "the actual 'take' more variable between flocks. [17,18]",
    new: "the actual 'take' more variable between flocks [17,18].",
  },

  // 11. Wrong citation [2] for wing web applicator cleaning (cite immunology paper for a protocol step)
  {
    desc: 'Fix §4.6: wrong citation [2] for applicator cleaning → [1] (CPC General Principles)',
    old: 'store in a clean, dry place [2].',
    new: 'store in a clean, dry place [1].',
  },

  // 12. IBV regional claim cites only CPC bulletin [9]; add Ojkic 2024 genotyping paper [10]
  {
    desc: 'Fix §1.8: IBV regional claim cites [9] only → add [10] (Ojkic 2024 genotyping)',
    old: 'British Columbia yet [9].',
    new: 'British Columbia yet [9,10].',
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
