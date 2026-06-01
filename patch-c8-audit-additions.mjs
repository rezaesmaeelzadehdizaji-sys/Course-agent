// patch-c8-audit-additions.mjs
// Implements all audit findings from c8_ref_audit.txt into Course 8 Vaccination_draft.docx
// Uses existing bibliography references [1],[3],[11],[13],[18] — no new refs needed for these additions
// Aviagen brief additions are DEFERRED pending vet resolution of the 40% vs 50-60% conflict

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const JSZip = require('./node_modules/jszip/dist/jszip.js');
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';

// Paragraph XML template for body text (normal body paragraph format from this docx)
function bodyPara(text, paraId) {
  return `<w:p w14:paraId="${paraId}" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
}

// Insert a new paragraph after a unique anchor string
function insertAfter(xml, anchor, newPara, label) {
  if (!xml.includes(anchor)) {
    console.error(`NOT FOUND: ${label}`);
    console.error(`  Anchor: ${anchor.substring(0, 80)}`);
    process.exit(1);
  }
  const count = (xml.match(new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count > 1) {
    console.error(`AMBIGUOUS (${count} matches): ${label}`);
    process.exit(1);
  }
  console.log(`  OK: ${label}`);
  return xml.split(anchor).join(anchor + newPara);
}

// Inline text replacement
function replace(xml, find, repl, label) {
  if (!xml.includes(find)) {
    console.error(`NOT FOUND: ${label}`);
    console.error(`  Find: ${find.substring(0, 80)}`);
    process.exit(1);
  }
  console.log(`  OK: ${label}`);
  return xml.split(find).join(repl);
}

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  console.log('Starting comprehensive audit patch...\n');

  // ============================================================
  // GROUP 1: Introduction — IgA/IgY and maternal antibody section
  // ============================================================

  // 1. Add maternal IgA specificity for IBV and NDV [3]
  // After: "Eye drop, coarse spray, and water vaccines work mainly through IgA.
  //         Killed injected vaccines work mainly through IgY [2]."
  // Anchor: end of that paragraph (IgY run ends with 'gY [2].')
  const igyAnchor = 'gY [2].</w:t></w:r></w:p>';
  xml = insertAfter(xml, igyAnchor,
    bodyPara(
      'The CPC Learning Centre Maternal Antibody Transfer bulletin notes that while IgG provides broad protection, maternal IgA may act as the primary defense against Infectious Bronchitis Virus and Newcastle Disease specifically [3]. This is why vaccination programs targeting IBV and NDV in breeder flocks have a direct impact on chick protection during the first week of life.',
      'AA010001'
    ),
    'Maternal IgA IBV/NDV note [3]'
  );

  // 2. Add no universal titer targets [3]
  // After: "Work with your veterinarian and breeder flock serology to time vaccinations correctly."
  const vetSerologyAnchor = 'Work with your veterinarian and breeder flock serology to time vaccinations correctly.</w:t></w:r></w:p>';
  xml = insertAfter(xml, vetSerologyAnchor,
    bodyPara(
      'The CPC Learning Centre Maternal Antibody Transfer bulletin is clear that there are no universal titer targets to aim for [3]. Titers vary by region, flock history, and program. The most practical approach is to track your own breeder titers over time and work with your veterinarian to set farm-specific baselines for your operation.',
      'AA010002'
    ),
    'No universal titer target [3]'
  );

  // ============================================================
  // GROUP 2: Section 1.4 — Water preparation
  // ============================================================

  // 3. Add filter bypass rule [11]
  // After: "Turn off the chlorinator 72 hours before vaccination [11]...Do not shorten this window."
  const chlorinatorAnchor = 'Do not shorten this window.</w:t></w:r></w:p>';
  xml = insertAfter(xml, chlorinatorAnchor,
    bodyPara(
      'If your system has inline filters or pressure reducers, bypass or remove them during vaccination. They trap minerals, bacteria, and disinfectant residues that will inactivate the vaccine [11].',
      'AA010003'
    ),
    'Filter bypass during vaccination [11]'
  );

  // ============================================================
  // GROUP 3: Section 1.7 — PPE and biosecurity (water vaccination)
  // ============================================================

  // 4. Add incinerate unused vaccine [1]
  // After: "Burn all empty vaccine vials and containers after use [11]. Do not leave open vials..."
  const burnVialsAnchor = 'Do not leave open vials where wild birds or other animals can contact them.</w:t></w:r></w:p>';
  xml = insertAfter(xml, burnVialsAnchor,
    bodyPara(
      'Unused reconstituted vaccine remaining at the end of the session must also be incinerated, not poured down the drain or left out [1]. The CPC Learning Centre General Principles of Vaccination guide specifies that all used and unused vaccines must be properly disposed of by incineration.',
      'AA010004'
    ),
    'Incinerate unused vaccine [1]'
  );

  // ============================================================
  // GROUP 4: Section 2.1 — Spray particle size in microns [1]
  // ============================================================

  // 5. Add spray particle size classification in microns
  // After: "Large, visible droplets that fall quickly are correct. A fine mist that hangs in the air is not."
  const dropletAnchor = 'A fine mist that hangs in the air is not.</w:t></w:r></w:p>';
  xml = insertAfter(xml, dropletAnchor,
    bodyPara(
      'Coarse spray particles are defined as larger than 100 microns, large enough to land on the conjunctiva and nares without being inhaled deeply. Fine spray (50 to 100 microns) and aerosol (below 50 microns) travel deeper into the respiratory tract, bypassing the mucosal target tissue and increasing the risk of respiratory reaction rather than protection [1]. This is why the correct nozzle and pressure setting matters as much as the vaccine itself.',
      'AA010005'
    ),
    'Spray particle size in microns [1]'
  );

  // ============================================================
  // GROUP 5: Section 1.8 — Monitoring (water vaccination)
  // ============================================================

  // 6. Add 70% birds drink + challenge dose / cleanout link [1]
  // After: "the most reliable way to confirm that coverage was achieved uniformly across the flock."
  const serologyAnchor = 'the most reliable way to confirm that coverage was achieved uniformly across the flock.</w:t></w:r></w:p>';
  xml = insertAfter(xml, serologyAnchor,
    bodyPara(
      'Even with a well-run session, the CPC Learning Centre General Principles of Vaccination guide notes that only about 70% of birds typically drink within the two-hour vaccination window [1]. This is exactly why flock preparation matters: correct water starvation and running the session at the right time of day are what push coverage higher.',
      'AA010006'
    ) +
    bodyPara(
      'Vaccination is not the whole story. The CPC General Principles guide is direct: if disease agents are allowed to build up over successive flocks without cleanout and disinfection, the challenge dose can overwhelm even a correctly vaccinated bird [1]. Good vaccination and good biosecurity work together.',
      'AA010007'
    ),
    '70% birds drink + cleanout challenge dose [1]'
  );

  // ============================================================
  // GROUP 6: Section 5.3 — Killed vaccine cold chain and preparation
  // ============================================================

  // 7. Fix citation error: "Do not heat above 25°C [18]." — [18] does not state this limit
  // [18] says the target is 22°C; does not set a 25°C upper limit
  xml = replace(xml,
    'Do not heat above 25°C [18].',
    'Verify with a thermometer that the vaccine has reached the right temperature before starting [18].',
    'Fix 25°C citation error'
  );

  // 8. Add darkness storage requirement for killed vaccines [18]
  // After the oil emulsion cold chain paragraph
  const oilEmulsionAnchor = 'never pack them in a cooler with ice directly touching the bottles [18].</w:t></w:r></w:p>';
  xml = insertAfter(xml, oilEmulsionAnchor,
    bodyPara(
      'Store oil emulsion vaccines in darkness as well as cold. Light exposure degrades the emulsion over time [18].',
      'AA010008'
    ),
    'Darkness storage for killed vaccines [18]'
  );

  // 9. Add "do NOT vaccinate on feed day" for injection vaccination [18]
  // After the "Discard any vial with these signs [18]." paragraph (cold chain section)
  // and BEFORE "Warming before use" paragraph
  const discardVialAnchor = 'Discard any vial with these signs [18].</w:t></w:r></w:p>';
  xml = insertAfter(xml, discardVialAnchor,
    bodyPara(
      'Injection day timing: unlike water vaccination, do NOT plan injection sessions on a feed day. Birds that have recently eaten may regurgitate during handling and restraint, which stresses the bird and increases the risk of aspiration [18]. Schedule injection sessions on a non-feed day.',
      'AA010009'
    ),
    '"Do NOT vaccinate on feed day" for injection [18]'
  );

  // 10. Add mid-session calibration check [18]
  // After: "Do not use a manual syringe for large flocks: speed and consistency both suffer [18]."
  const calibrationAnchor = 'Do not use a manual syringe for large flocks: speed and consistency both suffer [18].</w:t></w:r></w:p>';
  xml = insertAfter(xml, calibrationAnchor,
    bodyPara(
      'Calibrate the injector again at the midpoint of the vaccination session [18]. Viscosity and mechanical wear can shift dose delivery during a long run. A second five-dose check into mineral oil at the halfway point confirms the injector is still delivering the correct volume.',
      'AA010010'
    ),
    'Mid-session calibration check [18]'
  );

  // ============================================================
  // GROUP 7: Section 5.4 — SC/IM injection technique
  // ============================================================

  // 11. Add SC preferred over IM note [18]
  // Before the "Subcutaneous (SC) injection:" paragraph (paraId 155C8AA5)
  // Anchor: end of Photo 5.1 caption paragraph
  const photo51Anchor = 'and injects the full dose before withdrawing. Source: CPC Short Courses.</w:t></w:r></w:p><w:p w14:paraId="155C8AA5"';
  if (!xml.includes(photo51Anchor)) {
    console.error('NOT FOUND: SC preferred anchor (photo 5.1 + paraId)');
    process.exit(1);
  }
  console.log('  OK: SC preferred over IM [18]');
  xml = xml.split(photo51Anchor).join(
    'and injects the full dose before withdrawing. Source: CPC Short Courses.</w:t></w:r></w:p>' +
    bodyPara(
      'Subcutaneous injection is the preferred route for killed multivalent vaccines in commercial poultry [18]. The CPC Learning Centre Injection of Inactivated Vaccines bulletin is specific: intramuscular injection carries a higher risk of abscesses at the injection site and carcass condemnations at processing. Unless the vaccine label specifies IM, default to SC.',
      'AA010011'
    ) +
    '<w:p w14:paraId="155C8AA5"'
  );

  // 12. Add missed bird signs + second-person quality check [18]
  // After: "Work at a steady pace that allows correct restraint on every bird [18]."
  const restraintAnchor = 'Work at a steady pace that allows correct restraint on every bird [18].</w:t></w:r></w:p>';
  xml = insertAfter(xml, restraintAnchor,
    bodyPara(
      'The CPC Learning Centre Injection of Inactivated Vaccines bulletin recommends having a second person follow the vaccinator [18]. Missed birds will often shake their heads, scratch at the injection site, bleed from the neck, or show wet feathers from a mis-fired injector. Catch those birds and revaccinate on the spot.',
      'AA010012'
    ),
    'Missed bird signs + second-person check [18]'
  );

  // ============================================================
  // GROUP 8: Section 5.5 — Post-session injector maintenance [18]
  // ============================================================

  // 13. Add injector maintenance protocol after sharps disposal
  // After: "Used needles go in a sealed sharps container, not general waste [18]."
  const sharpsAnchor = 'Used needles go in a sealed sharps container, not general waste [18].</w:t></w:r></w:p>';
  xml = insertAfter(xml, sharpsAnchor,
    bodyPara(
      'After the session, clean the injector with 70% ethyl or isopropyl alcohol, rinse thoroughly with clean water, then rinse again with mineral oil to protect the internal seals. Store in a clean, dry place [18].',
      'AA010013'
    ),
    'Post-session injector maintenance [18]'
  );

  // ============================================================
  // GROUP 9: Section 6 — In-ovo vaccination additions
  // ============================================================

  // 14. Add -80°C Marek's + IBD combined + vectored vaccines [1,13]
  // After: "Marek's Disease virus can be present in barn litter from day one [4]."
  // (end of the main in-ovo paragraph)
  const mareksLitterAnchor = 'barn litter from day one [4].</w:t></w:r></w:p>';
  xml = insertAfter(xml, mareksLitterAnchor,
    bodyPara(
      'Cell-associated Marek\'s Disease vaccines, including CVI988/Rispens and bivalent HVT/SB-1 products, require storage at -80°C in liquid nitrogen dewars at the hatchery [1]. This is a hatchery responsibility, not a farm responsibility. Barn managers should understand that these products cannot be held in a standard refrigerator, and any break in the cold chain at the hatchery will compromise the immunity your birds arrive with.',
      'AA010014'
    ) +
    bodyPara(
      'Some hatcheries combine a mild strain IBD vaccine with the Marek\'s in-ovo dose, delivering both antigens in a single injection [13]. This can eliminate the need for a separate IBD water vaccination step in the first two weeks, provided the hatchery program is set up for it.',
      'AA010015'
    ) +
    bodyPara(
      'Vectored recombinant vaccines, where the Marek\'s Disease or Fowl Pox vaccine backbone carries additional antigens for ILT, Newcastle Disease, or IBD, are increasingly used in-ovo or in day-old chicks [13]. One in-ovo administration can prime multiple disease pathways at once. Ask your veterinarian whether vectored products are available for the disease challenges in your region.',
      'AA010016'
    ),
    '-80°C Marek\'s + IBD combined + vectored vaccines [1,13]'
  );

  // ============================================================
  // VALIDATION
  // ============================================================

  // Check no unescaped ampersands
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) {
    console.error(`\nFAIL: ${bad.length} unescaped & found — Word will reject this file`);
    process.exit(1);
  }

  // Check all new paraIds are present
  const newParaIds = ['AA010001','AA010002','AA010003','AA010004','AA010005',
                      'AA010006','AA010007','AA010008','AA010009','AA010010',
                      'AA010011','AA010012','AA010013','AA010014','AA010015','AA010016'];
  for (const id of newParaIds) {
    if (!xml.includes(id)) console.warn(`  WARN: paraId ${id} not found in output`);
  }

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);

  console.log('\nAll additions applied successfully.');
  console.log('Output written to:', SRC);
  console.log('File size:', buf.length.toLocaleString(), 'bytes');
})();
