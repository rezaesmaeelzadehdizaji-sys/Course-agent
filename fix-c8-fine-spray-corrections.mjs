// fix-c8-fine-spray-corrections.mjs
// Two corrections to the fine spray section (2.9):
// 1. Remove incorrect claim that hatchery cabinet spray = fine spray
//    (hatchery cabinet uses COARSE spray for day-old chicks; fine spray is a later-stage booster)
// 2. Strip PPE/fan/equipment paragraphs down to cross-references — no need to repeat coarse spray rules

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
// FIX 1: Correct "where fine spray fits" paragraph (AA030004)
// Remove hatchery cabinet = fine spray claim; correctly position
// fine spray as a later-stage booster for birds with base immunity
// ============================================================
console.log('\n--- Fix 1: Correct hatchery cabinet claim ---');
xml = fix(xml,
  'In Canadian commercial poultry, fine spray is used in two distinct settings. At the hatchery, automated spray cabinet systems deliver mild IBV strains to day-of-age chicks on conveyor trays before farm placement. The CPC Learning Centre guide notes that hatchery spray cabinets are widely used for IBV vaccine administration in Canada [1]. Coverage is uniform because the cabinet controls the droplet size, volume, and exposure time automatically without individual bird handling. On the farm, fine spray is used mainly in layer and breeder programs, where the longer production cycle supports a multi-stage respiratory vaccination schedule that builds progressively deeper immunity over time. Commercial broiler programs in Canada generally rely on water vaccination and coarse spray for on-farm IBV and NDV boosters, with hatchery cabinet spray handling the initial IBV prime.',
  'Fine spray fits into a vaccination program as a booster after initial priming, not as a first vaccination in unprimed birds. A typical sequence starts with water vaccination or coarse spray to prime the upper respiratory tract, then follows with fine spray using a slightly more reactive vaccine strain to drive immunity deeper into the tracheal mucosa. This approach is most practical in layer and breeder programs, where the longer production cycle supports a multi-stage respiratory vaccination schedule. In commercial broiler programs, fine spray is less common on farm. The hatchery cabinet spray that primes day-of-age chicks for IBV uses coarse spray with a mild strain: larger droplets are safer for newly hatched birds, whose respiratory tissues cannot yet tolerate the deeper penetration and stronger reaction that fine spray delivers. Fine spray becomes appropriate once birds are older and already carry base immunity to build on.',
  'AA030004: corrected hatchery cabinet = coarse, not fine'
);

// ============================================================
// FIX 2: Simplify comparison paragraph (AA030005)
// Remove aerosol sentence — particle-size overview already covered
// in the Section 2 intro paragraph added earlier
// ============================================================
console.log('\n--- Fix 2: Simplify comparison paragraph ---');
xml = fix(xml,
  'The practical difference between coarse and fine spray is the depth of immunity they build. Coarse spray (greater than 100 microns) is the right choice for primary vaccination of unprimed birds, because it targets the entry-point tissues of the upper respiratory tract without driving reactive live virus deep into the airway. Fine spray (50 to 100 microns) is the right choice for boosting birds that already carry base immunity from a prior coarse spray or water vaccination, where driving the antigen deeper will expand protection without triggering an excessive reaction. Aerosol spray (less than 50 microns), which reaches the air sacs and deep bronchi, is not used in routine on-farm programs because the reaction risk in partially immunized birds is too high [1].',
  'Coarse spray targets the upper respiratory entry points and is the right choice for first vaccination. Fine spray drives the antigen deeper and is the right follow-up once birds already carry base immunity. That distinction determines when each method belongs in a program: coarse spray or water vaccination for the prime, fine spray for the boost when you need broader and deeper tracheal coverage [1].',
  'AA030005: simplified comparison, removed repeated aerosol content'
);

// ============================================================
// FIX 3: Simplify equipment paragraph (AA030006)
// Strip the repeated rules (dedicated sprayer, no disinfectant residue)
// — those are already covered in Section 2.4
// ============================================================
console.log('\n--- Fix 3: Simplify equipment paragraph ---');
xml = fix(xml,
  'Fine spray requires a nozzle capable of producing droplets in the 50 to 100 micron range. Standard coarse spray backpack sprayers are designed for larger droplets and cannot reliably produce fine spray without changing the nozzle tip and adjusting operating pressure. Confirm the correct tip size and settings with the manufacturer before use. The sprayer must be dedicated to vaccination only. Never use a fine spray applicator for disinfection, water line treatment, or insecticide application. Residue from those products will inactivate live vaccine.',
  'Fine spray requires a nozzle tip rated for 50 to 100 micron droplets. Standard coarse spray nozzle tips will not achieve this range without a tip swap and pressure adjustment. Confirm the correct tip and operating pressure with the manufacturer before use. All other equipment handling, cleaning, and storage rules are the same as for coarse spray (see Section 2.4).',
  'AA030006: simplified equipment paragraph'
);

// ============================================================
// FIX 4: Simplify PPE paragraph (AA030007)
// Cross-reference Sections 2.4 and 2.7 instead of repeating the rules
// ============================================================
console.log('\n--- Fix 4: Simplify PPE paragraph ---');
xml = fix(xml,
  'PPE requirements for fine spray match coarse spray: gloves, safety glasses, and a mask are mandatory during preparation and application. Operator exposure risk is higher than for coarse spray because smaller droplets are more easily inhaled. A properly fitted N95 or equivalent respirator is recommended over a standard surgical mask when applying fine spray in barn. Fan management follows the same rule as coarse spray: turn all fans off before starting, and do not turn them back on until 20 minutes after the session is complete.',
  'PPE requirements, vaccine handling, and fan management for fine spray follow the same rules as coarse spray (see Sections 2.4 and 2.7). The one additional precaution: fine droplets are more easily inhaled by the operator than coarse spray droplets, so use a properly fitted N95 or equivalent respirator rather than a standard surgical mask during application.',
  'AA030007: simplified PPE/fan to cross-reference only'
);

// ============================================================
// VALIDATE
// ============================================================
console.log('\n--- Validate ---');
const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) { console.error('FAIL: unescaped &'); process.exit(1); }
console.log('  No unescaped & found');

if (xml.includes('At the hatchery, automated spray cabinet')) {
  console.error('FAIL: old hatchery cabinet claim still present');
  process.exit(1);
}
console.log('  Hatchery cabinet claim removed from fine spray section');

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(SRC, buf);
console.log('\nSaved:', buf.length.toLocaleString(), 'bytes');
