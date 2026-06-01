// fix-c8-merial-inline.mjs
// Remove Merial bulletin name attributions from body text.
// Keep citation numbers. Rewrite as direct instruction in farmer-flow voice.
// References affected: [2] [11] [12] [18] -- all Merial-authored.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const JSZip = require('./node_modules/jszip/dist/jszip.js');
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';

function fix(xml, find, repl, label) {
  if (!xml.includes(find)) {
    console.error('  NOT FOUND:', label, '\n    Looking for:', find.substring(0, 80));
    process.exit(1);
  }
  const n = (xml.split(find).length - 1);
  console.log('  ' + n + 'x  ' + label);
  return xml.split(find).join(repl);
}

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  console.log('Removing Merial inline attributions:\n');

  // ---- [11] Water Vaccination ----
  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin specifies: store at 2-8°C (35-45°F). Transport in a cooler with an ice pack until the moment of use. Never expose to direct sunlight [11].',
    'Store live vaccines at 2-8°C (35-45°F). Transport in a cooler with an ice pack until the moment of use. Never expose to direct sunlight [11].',
    '[11] specifies: store at 2-8C'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin emphasizes recording the serial number and expiry date of every vaccine used [11].',
    'Record the serial number and expiry date of every vaccine used [11].',
    '[11] record serial number'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin directs: clean drinkers with a mild soap only.',
    'Clean drinkers with mild soap only.',
    '[11] drinker cleaning'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin suggests using plain water for this run to confirm exactly how much water the flock drinks in a two-hour window at the expected age and environmental temperature [11].',
    'Use plain water for this practice run to confirm exactly how much water the flock drinks in a two-hour window at the expected age and temperature [11].',
    '[11] practice run'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin provides reference volumes per 1,000 birds by age:',
    'Reference volumes per 1,000 birds by age [11]:',
    '[11] reference volumes'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin assumes an outdoor temperature of approximately 21°C (70°F) as the baseline [11].',
    'These volumes are based on an outdoor temperature of approximately 21°C (70°F) [11].',
    '[11] baseline temperature'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin gives the following preparation protocol [11]:',
    'Vaccine preparation protocol [11]:',
    '[11] preparation protocol'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin specifies: vaccinate on feed days [11].',
    'Vaccinate on feed days [11].',
    '[11] feed day rule'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin specifies minimum drinker access ratios:',
    'Minimum drinker access ratios [11]:',
    '[11] drinker ratios'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin specifies: wear gloves, a mask, and safety glasses during both preparation and administration [11].',
    'Wear gloves, a mask, and safety glasses during both preparation and administration [11].',
    '[11] PPE'
  );

  xml = fix(xml,
    'The Merial Water Vaccination Technical Bulletin notes that Newcastle Disease virus contact can cause conjunctivitis in humans [11].',
    'Newcastle Disease virus contact can cause conjunctivitis in humans [11].',
    '[11] NDV conjunctivitis'
  );

  // ---- [12] Coarse Spray ----
  xml = fix(xml,
    'This section draws directly from the Merial Coarse Spray Vaccination Technical Bulletin [12].',
    'The procedures in this section follow standard coarse spray vaccination protocols [12].',
    '[12] section intro'
  );

  xml = fix(xml,
    'The Merial Coarse Spray Vaccination Technical Bulletin specifies the use of a Hardi sprayer for this procedure [12].',
    'Use a Hardi sprayer for this procedure [12].',
    '[12] Hardi sprayer'
  );

  xml = fix(xml,
    'The Merial Coarse Spray Vaccination Technical Bulletin specifies 4.5-5.0 Bar (65-75 PSI) [12].',
    'The correct operating pressure is 4.5-5.0 Bar (65-75 PSI) [12].',
    '[12] pressure setting'
  );

  xml = fix(xml,
    'The Merial Coarse Spray Vaccination Technical Bulletin states to use distilled, demineralized, or deionized water to maximize vaccine quality and viability [12].',
    'Use distilled, demineralized, or deionized water to maximize vaccine quality and viability [12].',
    '[12] water quality'
  );

  xml = fix(xml,
    'The Merial Coarse Spray Vaccination Technical Bulletin notes that 15% of the vaccine dose is lost if vials are not rinsed [12].',
    'Vials not rinsed properly lose approximately 15% of the vaccine dose [12].',
    '[12] vial rinse loss'
  );

  xml = fix(xml,
    'The Merial Coarse Spray Vaccination Technical Bulletin specifies storage at 2-8°C (35-45°F), transported in a cooler on ice until used, and protected from sunlight at all times [12].',
    'Store spray vaccines at 2-8°C (35-45°F), transport in a cooler on ice until use, and protect from sunlight at all times [12].',
    '[12] cold chain'
  );

  xml = fix(xml,
    'The Merial Coarse Spray Vaccination Technical Bulletin is specific on this point: turn off all fans before starting, and do not turn them back on until 20 minutes after vaccination is complete [12].',
    'Turn off all fans before starting. Do not turn them back on until 20 minutes after vaccination is complete [12].',
    '[12] fan management'
  );

  xml = fix(xml,
    'The Merial Coarse Spray Vaccination Technical Bulletin specifies the following procedures [12]:',
    'Spray procedures by bird type [12]:',
    '[12] procedures by type'
  );

  xml = fix(xml,
    'The Merial Coarse Spray Vaccination Technical Bulletin states clearly: wear gloves, a mask, and safety glasses during preparation and vaccine administration to avoid eye infection (conjunctivitis) following Newcastle virus contact [12].',
    'Wear gloves, a mask, and safety glasses during preparation and administration to avoid eye infection (conjunctivitis) following Newcastle virus contact [12].',
    '[12] PPE'
  );

  // ---- [18] Injection of Inactivated Vaccines ----
  xml = fix(xml,
    'The Merial Injection of Inactivated Vaccines Technical Bulletin specifies changing the needle at no more than every 1,000 birds [18].',
    'Change the needle at no more than every 1,000 birds [18].',
    '[18] needle change'
  );

  // Cornerstone sentence is split across two <w:t> runs -- fix each part separately
  xml = fix(xml,
    'The Merial Injection of Inactivated Vaccines bulletin describes inactivated vaccines as "the cornerstone of antibody-based protection pro',
    'Inactivated vaccines are the cornerstone of antibody-based protection pro',
    '[18] cornerstone part 1'
  );
  xml = fix(xml,
    'grams in laying and breeding flocks" [18].',
    'grams in laying and breeding flocks [18].',
    '[18] cornerstone part 2'
  );

  xml = fix(xml,
    'The Merial Injection of Inactivated Vaccines bulletin is the reference document for this section [18]. Follow it for all equipment selection and vaccine handling steps.',
    "Follow the vaccine label and your veterinarian's instructions for all equipment selection and vaccine handling steps [18].",
    '[18] reference document'
  );

  xml = fix(xml,
    'The Merial Injection of Inactivated Vaccines bulletin is specific: intramuscular injection carries a higher risk of abscesses at the injection site and carcass condemnations at processing. Unless the vaccine label specifies IM, default to SC.',
    'Intramuscular injection carries a higher risk of abscesses at the injection site and carcass condemnations at processing. Unless the vaccine label specifies IM, default to SC.',
    '[18] SC preferred'
  );

  xml = fix(xml,
    'The Merial Injection of Inactivated Vaccines bulletin recommends having a second person follow the vaccinator [18].',
    'Have a second person follow the vaccinator [18].',
    '[18] second person'
  );

  xml = fix(xml,
    'The Merial Injection of Inactivated Vaccines bulletin specifies recording the following for every injection session: product name, manufacturer, serial number, expiry date, number of birds vaccinated, date of vaccination, and operator name [18].',
    'For every injection session, record the product name, manufacturer, serial number, expiry date, number of birds vaccinated, date of vaccination, and operator name [18].',
    '[18] record keeping'
  );

  xml = fix(xml,
    'Both are described in the Merial Injection of Inactivated Vaccines bulletin [18].',
    'Both are covered in the following sections [18].',
    '[18] both routes intro'
  );

  // ---- [2] Avian Immune System (Merial) ----
  xml = fix(xml,
    'The Merial Avian Immune System review explains that IgA is the key antibody at mucosal surfaces: it stops pathogens from attaching and taking hold at the gut lining, airways, and eye [2].',
    'IgA is the key antibody at mucosal surfaces: it stops pathogens from attaching and taking hold at the gut lining, airways, and the eye surface [2].',
    '[2] IgA mucosal'
  );

  // ---- Validate ----
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) { console.error('\nFAIL: unescaped & found'); process.exit(1); }

  // Spot-check: no Merial name in text body
  const remaining = ['The Merial Water', 'The Merial Coarse', 'The Merial Injection', 'The Merial Avian',
                     'the Merial Water', 'the Merial Coarse', 'the Merial Injection'];
  let clean = true;
  remaining.forEach(function(s) {
    if (xml.includes(s)) { console.error('\nSTILL FOUND:', s); clean = false; }
  });
  if (clean) console.log('\nAll Merial inline attributions removed.');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log('Saved:', buf.length.toLocaleString(), 'bytes');
})();
