// add-postvax-reactions-course8.mjs
// Adds a new section "Post-Vaccination Reactions: What to Expect and When to Act"
// to Course 8, inserted before the Recommended Peer-Reviewed Journals heading.
// Also adds ref [21]: Butcher GD, Miles RD, Nilipour AH (UF/IFAS Extension VM097).
// Sources: CPC General Principles [1], Merial Coarse Spray [14], Merck Vet Manual [15],
//          Butcher et al. UF/IFAS Extension VM097 [21 - new].

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';
const OUT = 'Course 8/Vaccination_draft.docx';

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── XML builders ──────────────────────────────────────────────────────────────

function h1(text) {
  return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${esc(text)}</w:t></w:r></w:p>`;
}

function h2(text) {
  return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>${esc(text)}</w:t></w:r></w:p>`;
}

function body(text) {
  return `<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
}

// bold label + normal continuation in one paragraph
function labeled(label, text) {
  return (
    `<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>` +
    `<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">${esc(label)}</w:t></w:r>` +
    `<w:r><w:t xml:space="preserve"> ${esc(text)}</w:t></w:r></w:p>`
  );
}

function bullet(text) {
  return (
    `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/>` +
    `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>` +
    `<w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>` +
    `<w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  );
}

function refPara(num, text) {
  return (
    `<w:p><w:pPr><w:spacing w:after="80" w:line="260" w:lineRule="auto"/>` +
    `<w:ind w:left="504" w:hanging="504"/></w:pPr>` +
    `<w:r><w:rPr><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>` +
    `<w:t xml:space="preserve">${num}.  </w:t></w:r>` +
    `<w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>` +
    `<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  );
}

// ── Section content ───────────────────────────────────────────────────────────

const sectionXml = [

  h1('Post-Vaccination Reactions: What to Expect and When to Act'),

  body(
    'Every live respiratory vaccine you give the flock will produce some degree of response in the birds. ' +
    'Newcastle Disease virus, Infectious Bronchitis virus, and Infectious Laryngotracheitis vaccines are ' +
    'all live viruses that replicate in the respiratory mucosa. That replication is what triggers immunity. ' +
    'Some visible flock response at 2 to 5 days post-vaccination is normal and expected. The goal, as the ' +
    'CPC Learning Centre General Principles of Vaccination guide puts it, is immunization without harsh ' +
    'reaction and secondary infection [1]. Mild means the vaccine is doing its job. Harsh means something went wrong.'
  ),

  h2('Mild reactions are normal'),

  body(
    'A mild post-vaccination reaction appears 2 to 3 days after live respiratory vaccination and resolves on ' +
    'its own within 5 to 7 days [21]. You may hear a faint tracheal rattle when you walk the barn, notice slightly ' +
    'watery eyes on a few birds, or see the flock a little quieter than usual for a day or two. Feed and water ' +
    'consumption may dip briefly before coming back. These signs reflect local immune activation in the upper ' +
    'respiratory mucosa: the tissue the vaccine is designed to stimulate. No intervention is needed for a ' +
    'normal reaction. Do not reach for antibiotics because birds sound raspy at day 3.'
  ),

  h2('What makes a reaction worse than expected'),

  body('Several factors can push a normal vaccine reaction into a serious flock problem:'),

  labeled(
    'Route and droplet size.',
    'Finer spray droplets penetrate deeper into the respiratory tract than coarse droplets. Aerosol droplets ' +
    'below 50 microns can reach the air sacs. Fine spray at 50 to 100 microns reaches the tracheal mucosa ' +
    'and lower airway. Coarse spray above 100 microns deposits at the conjunctiva and upper nares, which is ' +
    'the intended target tissue for initial vaccination [1,14]. Using a worn nozzle or running the sprayer at ' +
    'wrong pressure can shift a coarse spray run into fine spray territory. The vaccine lands deeper than intended, ' +
    'and the tracheal reaction is harder than expected [14,15].'
  ),

  labeled(
    'Concurrent Mycoplasma infection.',
    'Flocks carrying Mycoplasma gallisepticum (MG) or Mycoplasma synoviae (MS) need special consideration ' +
    'at vaccination time [21]. Mycoplasma colonizes the respiratory lining and leaves the mucosal surface ' +
    'already inflamed before vaccination day. When a live respiratory vaccine lands on that tissue, the ' +
    'reaction is amplified well beyond what a clean flock experiences. In Mycoplasma-positive operations, ' +
    'work with your veterinarian before scheduling live respiratory vaccination: earlier timing, less ' +
    'aggressive routes, and antibiotic coverage during the vaccine reaction may all be needed.'
  ),

  labeled(
    'Secondary E. coli infection.',
    'The most common complication after a live respiratory vaccine reaction is opportunistic E. coli ' +
    'invasion of the air sacs [21]. Local inflammation from the vaccine opens a window for bacteria ' +
    'already in the litter or drinker lines to reach deeper into the respiratory tract. Good litter ' +
    'management and clean drinkers before vaccination day are direct defenses against this. High ' +
    'bacterial load in the environment converts a manageable tracheal reaction into airsacculitis or septicemia.'
  ),

  labeled(
    'Immunosuppression from IBD, Marek\'s, or mycotoxins.',
    'The CPC Learning Centre General Principles of Vaccination guide is explicit: birds suppressed by ' +
    'infectious bursal disease, Marek\'s Disease, or mycotoxin-contaminated feed do not respond ' +
    'efficiently to active vaccination [1]. Infectious bursal disease destroys B-cells in the bursa of ' +
    'Fabricius: the cells the bird depends on to build antibody after vaccination. A flock with active IBD ' +
    'at the time of respiratory vaccination may produce poor titers while still reacting to the vaccine. ' +
    'That is the worst outcome: a visible reaction with inadequate protection built behind it. Track your ' +
    'flock\'s IBD status and time respiratory vaccinations away from active IBD challenge periods.'
  ),

  labeled(
    'Vaccinating sick or stressed birds.',
    'The CPC Learning Centre General Principles of Vaccination guide is unambiguous: vaccinate only ' +
    'healthy birds, and never vaccinate a flock that is already stressed or diseased at the time of ' +
    'vaccination [1]. A bird whose immune system is already fighting a field challenge will react harder ' +
    'to the vaccine and protect less. If birds are showing respiratory signs or other illness before the ' +
    'scheduled vaccination day, call your veterinarian before opening any vials.'
  ),

  h2('Do not stack live vaccines on an active reaction'),

  body(
    'If a flock is already reacting to a live respiratory vaccination, do not add another live respiratory ' +
    'vaccine on top of it. Applying a second live vaccine while the first reaction is still running does not ' +
    'boost immunity. It compounds the respiratory inflammation in the trachea and airways, and can drive a ' +
    'manageable reaction into a severe flock-wide respiratory event [15]. Wait for the flock to fully recover, ' +
    'then discuss the timing and sequencing of the next vaccination with your veterinarian before proceeding.'
  ),

  h2('When to call your veterinarian'),

  body('Contact your veterinarian if any of the following appear after vaccination:'),

  bullet('The reaction has not started to resolve by day 7, or signs are clearly worsening after day 5.'),
  bullet('You see significant mortality appearing alongside the respiratory signs.'),
  bullet('Birds are developing facial swelling, sinusitis, or severe breathing difficulty.'),
  bullet('Post-vaccination serology at 21 days comes back with low or widely scattered titers.'),

  body(
    'The response depends on what is driving the severity. Secondary bacterial airsacculitis needs antibiotic ' +
    'therapy targeting E. coli. Mycoplasma amplification requires antibiotics targeting Mycoplasma. Wrong ' +
    'vaccine strain or route needs diagnostic workup and a full program review with your veterinarian. None of ' +
    'those decisions should be made without veterinary involvement.'
  ),

  h2('The biosecurity link'),

  body(
    'Post-vaccination reactions are worse in barns with poor litter management and inadequate biosecurity. ' +
    'The CPC Learning Centre General Principles of Vaccination guide connects this directly: if disease agents ' +
    'build up from flock to flock without proper cleanout and disinfection, the challenge can overwhelm even ' +
    'a well-vaccinated bird, and post-vaccine respiratory problems increase [1]. Good vaccination and good ' +
    'biosecurity are not alternatives to each other. They work together, and the flock\'s reaction profile ' +
    'after vaccination is one of the clearest indicators of how well both are performing.'
  ),

].join('');

// ── Reference [21] ────────────────────────────────────────────────────────────

const ref21 = refPara(
  21,
  'Butcher GD, Miles RD, Nilipour AH. Newcastle and Infectious Bronchitis Vaccine Reactions in Commercial ' +
  'Broilers [Extension Publication VM097]. Gainesville, FL: University of Florida Institute of Food and ' +
  'Agricultural Sciences Extension [cited 2026 Jun]. Available from: edis.ifas.ufl.edu/publication/VM097'
);

// ── Anchor strings ────────────────────────────────────────────────────────────

// Insert new section before the Recommended Peer-Reviewed Journals heading paragraph
const JOURNALS_ANCHOR  = 'w14:paraId="4395DD1A"';

// Insert ref [21] after ref [20] — find the end of ref 20's paragraph
const REF20_TEXT = 'Injection of Inactivated Vaccines [Technical Bulletin]. Merial. Available via CPC Learning Centre: cpclearningcentre.ca';

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // 1. Find Recommended Peer-Reviewed Journals heading and insert new section before it
  const journalsIdx = xml.indexOf(JOURNALS_ANCHOR);
  if (journalsIdx < 0) throw new Error('Journals heading anchor not found');
  const journalsPStart = xml.lastIndexOf('<w:p ', journalsIdx);
  console.log(`  Journals heading at ${journalsPStart}`);
  xml = xml.slice(0, journalsPStart) + sectionXml + xml.slice(journalsPStart);
  console.log('  New section inserted');

  // 2. Find end of ref [20] paragraph and insert ref [21] after it
  const ref20Idx = xml.indexOf(REF20_TEXT);
  if (ref20Idx < 0) throw new Error('Ref 20 text not found');
  const ref20End = xml.indexOf('</w:p>', ref20Idx) + 6;
  xml = xml.slice(0, ref20End) + ref21 + xml.slice(ref20End);
  console.log('  Ref [21] added after ref [20]');

  // 3. Validate
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML: ${bad.length} found`);

  // 4. Write
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log(`\n  Done. ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
