// patch-c8-add-fine-spray.mjs
// Adds fine spray vaccination as Section 2.9 within a renamed Section 2 "Spray Vaccination"
// Updates: intro paragraph count, Section 2 H1 title (TOC + body), Section 2 intro para,
//          new H2 2.9 heading + 5 body paragraphs, TOC entry for 2.9

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

function fixAll(xml, find, repl, label) {
  const n = (xml.split(find).length - 1);
  if (n === 0) { console.error('NOT FOUND:', label); process.exit(1); }
  console.log('  OK (' + n + 'x)  ' + label);
  return xml.split(find).join(repl);
}

function bodyPara(text, paraId) {
  return '<w:p w14:paraId="' + paraId + '" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">' + text + '</w:t></w:r></w:p>';
}

// ============================================================
// STEP 1: Update intro paragraph (six -> seven methods, add fine spray)
// ============================================================
console.log('\n--- Step 1: Update intro paragraph ---');
xml = fix(xml,
  'This course covers six distinct vaccination methods used in Canadian commercial poultry: water vaccination, coarse spray vaccination, eye drop vaccination, wing web vaccination, injection vaccination with killed multivalent vaccines, and in-ovo vaccination.',
  'This course covers seven distinct vaccination methods used in Canadian commercial poultry: water vaccination, coarse spray vaccination, fine spray vaccination, eye drop vaccination, wing web vaccination, injection vaccination with killed multivalent vaccines, and in-ovo vaccination. Coarse spray and fine spray are covered together in Section 2, as they share the same core principles but differ in droplet size and the depth of the respiratory tract they target.',
  'Intro: six -> seven methods + fine spray added'
);

// ============================================================
// STEP 2: Rename Section 2 heading in both TOC and body
// Both contain the exact same text string
// ============================================================
console.log('\n--- Step 2: Rename Section 2 heading ---');
xml = fixAll(xml,
  'Section 2: Poultry Coarse Spray Vaccination',
  'Section 2: Spray Vaccination',
  'Section 2 title rename (TOC + body)'
);

// ============================================================
// STEP 3: Add Section 2 intro paragraph before 2.1 H2
// Anchor: start of 2.1 H2 paragraph (unique paraId)
// ============================================================
console.log('\n--- Step 3: Add Section 2 intro paragraph ---');
const s2IntroPara = bodyPara(
  'Spray vaccination applies live respiratory vaccines as liquid droplets that land on the mucosa of the respiratory tract. The most important variable is particle size. Coarse spray droplets (greater than 100 microns) land on the conjunctiva and upper nasal passages, priming mucosal immune cells at the entry points of the respiratory system. Fine spray droplets (50 to 100 microns) are small enough to travel deeper, reaching the tracheal lining and stimulating immune cells in the lower airway tissue. The CPC Learning Centre General Principles of Vaccination guide describes a stair-step approach: start with coarse spray for an initial prime, then progress to fine spray with a slightly more reactive vaccine strain to drive protection deeper into the trachea [1]. Coarse spray is covered in Sections 2.1 through 2.8. Fine spray is covered in Section 2.9.',
  'AA030001'
);
xml = fix(xml,
  '<w:p w14:paraId="2AC79FA1"',
  s2IntroPara + '<w:p w14:paraId="2AC79FA1"',
  'Section 2 intro paragraph inserted before 2.1'
);

// ============================================================
// STEP 4: Add H2 heading + fine spray content after Section 2.8
// Anchor: last paragraph of 2.8 (unique sentence)
// ============================================================
console.log('\n--- Step 4: Add fine spray section ---');

const heading29 =
  '<w:p w14:paraId="AA030002" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09">' +
  '<w:pPr><w:pStyle w:val="Heading2"/></w:pPr>' +
  '<w:bookmarkStart w:id="46" w:name="_Toc231132504"/>' +
  '<w:r><w:t>2.9  Fine Spray Vaccination</w:t></w:r>' +
  '<w:bookmarkEnd w:id="46"/></w:p>';

const finePara1 = bodyPara(
  'Fine spray particles at 50 to 100 microns are inhaled past the nares and conjunctiva and land on the tracheal mucosa. This is deeper than coarse spray reaches. The result is a stronger local immune response in the lower airway and better coverage of the tissues most commonly infected by IBV and NDV in birds that already carry some base immunity. The CPC Learning Centre General Principles of Vaccination guide describes fine spray as the next step in a stair-step program: once coarse spray has primed the upper respiratory tract, fine spray with a more reactive vaccine strain drives the response deeper, building on the existing immune memory [1].',
  'AA030003'
);

const finePara2 = bodyPara(
  'In Canadian commercial poultry, fine spray is used in two distinct settings. At the hatchery, automated spray cabinet systems deliver mild IBV strains to day-of-age chicks on conveyor trays before farm placement. The CPC Learning Centre guide notes that hatchery spray cabinets are widely used for IBV vaccine administration in Canada [1]. Coverage is uniform because the cabinet controls the droplet size, volume, and exposure time automatically without individual bird handling. On the farm, fine spray is used mainly in layer and breeder programs, where the longer production cycle supports a multi-stage respiratory vaccination schedule that builds progressively deeper immunity over time. Commercial broiler programs in Canada generally rely on water vaccination and coarse spray for on-farm IBV and NDV boosters, with hatchery cabinet spray handling the initial IBV prime.',
  'AA030004'
);

const finePara3 = bodyPara(
  'The practical difference between coarse and fine spray is the depth of immunity they build. Coarse spray (greater than 100 microns) is the right choice for primary vaccination of unprimed birds, because it targets the entry-point tissues of the upper respiratory tract without driving reactive live virus deep into the airway. Fine spray (50 to 100 microns) is the right choice for boosting birds that already carry base immunity from a prior coarse spray or water vaccination, where driving the antigen deeper will expand protection without triggering an excessive reaction. Aerosol spray (less than 50 microns), which reaches the air sacs and deep bronchi, is not used in routine on-farm programs because the reaction risk in partially immunized birds is too high [1].',
  'AA030005'
);

const finePara4 = bodyPara(
  'Fine spray requires a nozzle capable of producing droplets in the 50 to 100 micron range. Standard coarse spray backpack sprayers are designed for larger droplets and cannot reliably produce fine spray without changing the nozzle tip and adjusting operating pressure. Confirm the correct tip size and settings with the manufacturer before use. The sprayer must be dedicated to vaccination only. Never use a fine spray applicator for disinfection, water line treatment, or insecticide application. Residue from those products will inactivate live vaccine.',
  'AA030006'
);

const finePara5 = bodyPara(
  'PPE requirements for fine spray match coarse spray: gloves, safety glasses, and a mask are mandatory during preparation and application. Operator exposure risk is higher than for coarse spray because smaller droplets are more easily inhaled. A properly fitted N95 or equivalent respirator is recommended over a standard surgical mask when applying fine spray in barn. Fan management follows the same rule as coarse spray: turn all fans off before starting, and do not turn them back on until 20 minutes after the session is complete.',
  'AA030007'
);

const fineBlock = heading29 + finePara1 + finePara2 + finePara3 + finePara4 + finePara5;

// The anchor includes the following page-break paragraph's unique paraId to avoid ambiguity
const pageBreakPara = '<w:p w14:paraId="79478086"';
xml = fix(xml,
  'The best vaccination program in the world fails at any one of those three points.</w:t></w:r></w:p>' + pageBreakPara,
  'The best vaccination program in the world fails at any one of those three points.</w:t></w:r></w:p>' + fineBlock + pageBreakPara,
  'Fine spray section 2.9 inserted after last 2.8 para'
);

// ============================================================
// STEP 5: Add TOC entry for 2.9 Fine Spray Vaccination
// Insert after the 2.8 TOC entry, before Section 3 TOC1 entry
// Anchor: unique end of 2.8 TOC para
// ============================================================
console.log('\n--- Step 5: Add 2.9 TOC entry ---');

const toc29 =
  '<w:p w14:paraId="AA030008" w14:textId="77777777" w:rsidR="008C3A67" w:rsidRDefault="008C3A67">' +
  '<w:pPr><w:pStyle w:val="TOC2"/><w:rPr>' +
  '<w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi"/>' +
  '<w:noProof/><w:kern w:val="2"/><w:sz w:val="24"/><w:szCs w:val="24"/>' +
  '<w14:ligatures w14:val="standardContextual"/>' +
  '</w:rPr></w:pPr>' +
  '<w:hyperlink w:anchor="_Toc231132504" w:history="1">' +
  '<w:r w:rsidRPr="00542FD8"><w:rPr><w:rStyle w:val="Hyperlink"/><w:noProof/></w:rPr>' +
  '<w:t>2.9  Fine Spray Vaccination</w:t></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:tab/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:instrText xml:space="preserve"> PAGEREF _Toc231132504 \\h </w:instrText></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:t>--</w:t></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>' +
  '</w:hyperlink></w:p>';

// Anchor: unique end of the 2.8 TOC paragraph (anchor ID _Toc231132503 only appears once)
const toc28EndAnchor = '_Toc231132503 \\h </w:instrText></w:r><w:r><w:rPr><w:noProof/></w:rPr></w:r><w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:noProof/></w:rPr><w:t>21</w:t></w:r><w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:hyperlink></w:p>';

xml = fix(xml,
  toc28EndAnchor,
  toc28EndAnchor + toc29,
  'TOC entry 2.9 inserted after 2.8 TOC'
);

// ============================================================
// STEP 6: Validate
// ============================================================
console.log('\n--- Step 6: Validate ---');

const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) { console.error('FAIL: unescaped &'); process.exit(1); }
console.log('  No unescaped & found');

// Check new paraIds present
const newIds = ['AA030001','AA030002','AA030003','AA030004','AA030005','AA030006','AA030007','AA030008'];
for (const id of newIds) {
  if (!xml.includes(id)) console.warn('  WARN: paraId ' + id + ' not found in output');
  else console.log('  OK paraId:', id);
}

// Check heading renames
if (xml.includes('Poultry Coarse Spray Vaccination')) {
  console.error('FAIL: old Section 2 title still present');
  process.exit(1);
}
console.log('  Section 2 title rename confirmed: no "Poultry Coarse Spray Vaccination" remains');

// Check seven in intro
if (xml.includes('seven distinct')) console.log('  Intro updated to seven methods');
else { console.error('FAIL: intro not updated'); process.exit(1); }

// Check fine spray heading present
if (xml.includes('2.9  Fine Spray Vaccination')) console.log('  2.9 Fine Spray Vaccination heading present');
else { console.error('FAIL: 2.9 heading missing'); process.exit(1); }

// Check bookmark 46
if (xml.includes('w:id="46"')) console.log('  Bookmark ID 46 present');

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(SRC, buf);
console.log('\nSaved:', buf.length.toLocaleString(), 'bytes');
