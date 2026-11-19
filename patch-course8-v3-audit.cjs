// Course 8 V3: full claims-and-references audit fixes (November 2026).
// Source: Course 8/_superseded/Vaccination_and_Treatment_V2.docx (the published V2, never modified)
// Output: Course 8/Vaccination_and_Treatment_V3.docx
// After running, refresh TOC pages: render to PDF, pdftotext -layout, then
//   node toc-refresh-course8-v3.cjs "Course 8/Vaccination_and_Treatment_V3.docx" <pages.txt>
// Every edit below is listed in Course 8/reference_verification_log.md (2026-11-19 addendum).
// New references enter as placeholder numbers 101-104, then the whole document is
// renumbered by first appearance and the bibliography is physically reordered.
const JSZip = require('jszip');
const fs = require('fs');

const SRC = 'Course 8/_superseded/Vaccination_and_Treatment_V2.docx';
const OUT = 'Course 8/Vaccination_and_Treatment_V3.docx';
const NEWFIG = 'Course 8/fig1_2.png';           // corrected water timeline (Figure 1.1)

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const PARA_RE = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g;
const T_RE = /(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g;

function nodes(p) { return [...p.matchAll(T_RE)].map(m => ({ i: m.index, open: m[1], text: m[2], close: m[3], len: m[0].length })); }
function joined(p) { return nodes(p).map(n => n.text).join(''); }

// Replace `old` (string or RegExp, matched against the paragraph's joined text) with `nw`.
// The replacement inherits the formatting of the run where the match starts.
function replaceInPara(p, old, nw) {
  const ns = nodes(p);
  const full = ns.map(n => n.text).join('');
  let idx, mlen;
  if (old instanceof RegExp) { const m = full.match(old); if (!m) return null; idx = m.index; mlen = m[0].length; }
  else { const o = esc(old); idx = full.indexOf(o); if (idx < 0) return null; mlen = o.length; }
  const end = idx + mlen;
  let pos = 0, s = -1, e = -1, sOff = 0, eOff = 0;
  ns.forEach((n, k) => {
    const a = pos, b = pos + n.text.length;
    if (s < 0 && idx >= a && idx < b) { s = k; sOff = idx - a; }
    if (s < 0 && idx === b && k === ns.length - 1) { s = k; sOff = n.text.length; }
    if (end > a && end <= b && e < 0 && s >= 0) { e = k; eOff = end - a; }
    pos = b;
  });
  if (e < 0) e = s, eOff = sOff + mlen;
  const newTexts = ns.map(n => n.text);
  newTexts[s] = ns[s].text.slice(0, sOff) + esc(nw) + ns[e].text.slice(eOff);
  for (let k = s + 1; k <= e; k++) newTexts[k] = '';
  let out = p;
  for (let k = ns.length - 1; k >= 0; k--) {
    if (newTexts[k] === ns[k].text) continue;
    const n = ns[k];
    out = out.slice(0, n.i) + '<w:t xml:space="preserve">' + newTexts[k] + n.close + out.slice(n.i + n.len);
  }
  return out;
}

let xml;
const log = [];
function rep(old, nw, expect = 1) {
  let hits = 0;
  xml = xml.replace(PARA_RE, p => {
    let cur = p, r;
    while ((r = replaceInPara(cur, old, nw)) !== null) {
      hits++; cur = r;
      if (typeof old === 'string' && nw.includes(old)) break;   // avoid infinite loop
      if (old instanceof RegExp) break;
    }
    return cur;
  });
  if (hits !== expect) throw new Error(`rep expected ${expect} hit(s), got ${hits}: ${String(old).slice(0, 90)}`);
  log.push(String(old).slice(0, 70));
}
function findPara(find) {
  const ps = xml.match(PARA_RE).filter(p => joined(p).includes(esc(find)));
  if (ps.length !== 1) throw new Error(`findPara expected 1, got ${ps.length}: ${find}`);
  return ps[0];
}
function deletePara(find) { const p = findPara(find); xml = xml.replace(p, ''); log.push('DELETE ' + find.slice(0, 60)); }
function insertAfter(find, text) {
  const p = findPara(find);
  let clone = p.replace(/<w:bookmark(Start|End)[^>]*\/>/g, '').replace(/\sw14:paraId="[^"]*"/, '').replace(/\sw14:textId="[^"]*"/, '');
  const ns = nodes(clone);
  for (let k = ns.length - 1; k >= 0; k--) {
    const n = ns[k];
    const t = k === 0 ? esc(text) : '';
    clone = clone.slice(0, n.i) + '<w:t xml:space="preserve">' + t + n.close + clone.slice(n.i + n.len);
  }
  xml = xml.replace(p, p + clone);
  log.push('INSERT after ' + find.slice(0, 50));
}

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  xml = await zip.file('word/document.xml').async('string');

  // ---------------- Cover ----------------
  rep('June 2026', 'November 2026');

  // ---------------- Introduction ----------------
  rep('(mainly IgA and IgM), which the chick swallows', '(mainly IgA), which the chick swallows');
  rep(/notes that in a 25.000-chick flock[^\[]*\[3\]\./,
    'notes that even a breeder flock with high, even titers can produce chicks where one in ten carries no maternal antibody at all. In a 25,000-chick flock, that is 2,500 or more chicks with no protection from the hen, and the number climbs fast when breeder titers slip [3].');
  rep('protect less predictably than a good viral vaccine [4,5].', 'protect less predictably than a good viral vaccine [4].');

  // Learning objectives
  rep('you need a valid VCPR with your veterinarian, a Veterinary Health Certificate, and a prescription.',
    'you need a valid veterinarian-client-patient relationship (VCPR) and a veterinary prescription.');
  insertAfter('Recognize what a vaccination failure looks like in the flock',
    'Tell a normal post-vaccination reaction from one that needs your veterinarian, and know when to make that call.');

  // ---------------- Section 1 ----------------
  rep('Infectious Bursal Disease (IBD/Gumboro):', 'Infectious Bursal Disease (IBD):');
  rep('field virus [8].Timing', 'field virus [8]. Timing');
  rep('highly transmissible and a tremendous hazard', 'highly transmissible and is a tremendous hazard');
  rep('for unvaccinated flocks" [11].',
    'for unvaccinated flocks" [11]. The newer CPC Learning Centre Infectious Bronchitis fact sheet explains why even coverage matters so much with this virus: it changes constantly, and a vaccine against one type protects poorly against another. Strong, even flock immunity gives it fewer chances to multiply and change, while patchy immunity lets new types arise [104]. Partial coverage also lets the vaccine virus itself keep passing from bird to bird, where it can grow harsher [104].');
  rep('A live AE vaccine given in the drinking water to breeder and layer pullets, usually somewhere between 10 and 15 weeks of age and well before lay, builds the immunity that protects the next generation through the egg [4,5]. Wing web is the other route used for AE, covered in Section 4.',
    'A live AE vaccine given to breeder and layer pullets, usually around 10 to 12 weeks of age and well before lay, builds the immunity that protects the next generation through the egg [4,5]. It can go in the drinking water, and many programs give it by wing web instead (Section 4) [5].');
  rep('Freezing destroys most live vaccines by rupturing the viral envelope. A vaccine that froze and thawed is useless, even if it still looks fine in the vial.',
    'Live vaccines belong at 2°C to 8°C, not frozen [12,13]. A vial that froze can be damaged even though it still looks fine, so do not use it.');
  rep('This is both a good production practice and a regulatory requirement for traceability in commercial operations.',
    'If the flock has a problem later, it is the first thing your veterinarian will ask for.');
  rep('72 hours before vaccination [12,13]. This gives', '72 hours before vaccination [12]. This gives');
  rep('Do not shorten this window.',
    'Do not shorten this window. The CPC Learning Centre General Principles of Vaccination guide adds the other half: keep chlorine, disinfectants, and water medication out of the lines for 24 hours after vaccination as well [1].');
  rep('Aqueduct water:', 'Town water:');
  rep('chlorine residual from the line [12,13].', 'chlorine residual from the line [12].');
  rep('Use clean plastic buckets or containers for vaccine preparation; avoid metal equipment, as metal ions can inactivate or damage live vaccines [15].',
    'Use clean plastic buckets, containers, and stirrers for vaccine preparation. Hard metal content can kill a live vaccine, which is why the Aviagen guidance calls for plastic equipment throughout [13].');
  rep('(1 lb per 50 gallons) and mix thoroughly [12,13].', '(1 lb per 50 gallons) and mix thoroughly [12,14].');
  rep('to the drinkers promptly [12,13].', 'to the drinkers promptly [12,14].');
  rep('Vaccinate on feed days [12,13].', 'Vaccinate on feed days [12,14].');
  rep(/Minimum drinker access ratios \[12,13,14\]:[\s\S]*?within the two-hour window\./,
    'Every bird has to get a drink inside the two-hour window, so drinker space matters on vaccination day [14]. The Merial water vaccination bulletin sets these minimums: 1 bell drinker per 100 birds, 1 nipple per 15 birds, 1 cup per 30 birds, and 1 trough per 150 birds (6 foot) or per 200 birds (8 foot) [12]. Those are floor values. More drinker space than that makes it easier for every bird to get its dose.');
  rep('This is not a precaution against a rare event. Newcastle Disease regularly affects personnel who work with NDV-containing vaccines without eye protection.',
    'The eye infection is usually short-lived, but it does happen: the Merck Veterinary Manual notes the cases are mostly in laboratory workers and vaccination crews handling large amounts of virus [10].');
  insertAfter('Check that the full prepared volume was consumed within two hours.',
    'If you used a blue-dye stabilizer, check the tongues of 100 birds from at least three spots in the barn. At least 90% should be well stained [13].');
  rep('IBV variant strains are emerging in Ontario but not in British Columbia yet [11,16]. A program built on Massachusetts and Connecticut strains alone may not protect against circulating variants.',
    'Variant IBV strains are now common in Canada. In lab testing of Canadian samples from 2014 to 2023, about half of the IBV typed were variants related to U.S. strains, and the DMV/1639 strain has been a steady field challenge since it was first found in Ontario in 2015 [16]. The CPC Learning Centre Infectious Bronchitis fact sheet notes it has since reached other provinces, although CPC has not yet found it in BC flocks, and that the vaccines available here have not kept it under control on their own, so tight biosecurity has to back them up [104]. A program built on Massachusetts and Connecticut strains alone may not protect against these variants.');

  // ---------------- Section 2 ----------------
  rep('respiratory reaction rather than protection [1,5,17].', 'respiratory reaction rather than protection [1,17].');
  rep('with eye drop or wing web vaccination [1,5].', 'with eye drop or wing web vaccination [1,2].');
  rep('more precise individual dosing [1,11,18].',
    'more precise individual dosing [1,11,18]. For IB in broilers, the CPC Learning Centre Infectious Bronchitis fact sheet recommends a second live dose by coarse spray at 2 to 3 weeks of age, on top of the day-1 hatchery spray [104].');
  rep('Coarse spray vaccination requires one additional precaution in comparison to other vaccine methods: the use of a mask or respirator.',
    'The mask matters more with spray than with any other method, because you are walking through the vaccine cloud.');
  rep(/The CPC General Principles guide is direct:[\s\S]*?\[1\]\./,
    'The CPC Learning Centre General Principles of Vaccination guide is direct about it: if disease germs are allowed to build up flock after flock without cleanout and disinfection, the challenge can get big enough to overwhelm what the vaccine can handle [1].');
  rep(/Review water quality \(chlorine contamination\)[\s\S]*?reduce the effective vaccine delivery \[17\]/,
    'Check the water (chlorine), the pressure (too high makes a fine mist), your walking speed (too fast), and whether every vial was rinsed. Any one of these cuts the dose the birds actually get [17].');
  rep(/Indicates uneven vaccine coverage\.[\s\S]*?variable exposure between flocks or birds\.\s*/,
    'A wide spread from bird to bird means coverage was uneven. Usually some sections were sprayed too fast, or from too far away from the birds or the wall.');
  rep(/Most associated with cold-chain failure or use of incorrect diluent\.[\s\S]*?vaccine reconstitution \[17\]\./,
    'Think cold chain first, then the diluent. Chlorinated water kills the vaccine, so mix it only in distilled or deionized water [17].');
  rep(/Cold-chain management is just as important for spray vaccination[\s\S]*?otherwise correct \[17\]\./,
    'Cold chain matters just as much for spray as for water. Store vaccine at 2-8°C (35-45°F) and bring it to the barn in a cooler with ice packs until you mix it [17]. Keep vials and mixed vaccine out of the sun. Heat and sunlight kill live vaccine fast, and after that, perfect technique cannot save it.');
  rep('Never use this equipment for herbicides, pesticides, disinfectants, or other chemicals, as even trace residues can inactivate live vaccine organisms and compromise flock protection.',
    'Never use it for herbicides, pesticides, disinfectants, or anything else. Even a trace of residue can kill the vaccine.');
  rep('storage rules are the same as for coarse spray (see Section 2.4).', 'storage rules are the same as for coarse spray (see Sections 2.3 and 2.7).');
  rep('follow the same rules as coarse spray (see Sections 2.4 and 2.7).', 'follow the same rules as coarse spray (see Sections 2.4, 2.5, and 2.7).');

  // ---------------- Section 3 ----------------
  rep(/Field and experimental studies show that live vaccines delivered by eye-drop[\s\S]*?\[19,20\]\./,
    'Eye drop usually gives the most even, reliable response of any live vaccine route, because every bird gets a full dose straight to the eye and upper airway. Spray and water can protect well too, but they depend more on water quality, equipment, droplet size, and how the birds drink, so the take varies more from flock to flock [19,20].');
  rep(' For more on ILT and other respiratory disease profiles, see Course 7 (Common Poultry Diseases) in this series.', '');
  rep('Each drop should be within the range of 25-35 µL. Before starting, calibrate the system by counting how many drops are required to deliver 1 mL using a syringe or measuring device.',
    'Eye drop vaccines are made to be given as one drop of about 0.03 mL (30 µL) per bird [14]. Before you start, check the dropper: squeeze drops into a syringe or measuring tube and count how many it takes to make 1 mL.');
  rep(/A target of approximately 30 drops per mL \(~33 µL per drop\) is acceptable and indicates correct droplet size\.\s*/,
    'About 30 to 35 drops per mL means the drop size is right.');
  rep('Fewer than 25 drops per mL:', 'Far fewer than 30 drops per mL:');
  rep('Drops are too large. Adjust by reducing pressure or checking for an oversized nozzle/tip.',
    'The drops are too big, and vaccine will run off the eye. Check that you have the right tip for that vaccine.');
  rep('More than 40 drops per mL:', 'Far more than 35 drops per mL:');
  rep('Drops are too small. Increase pressure or replace the nozzle/tip if worn or incorrect.',
    'The drops are too small, and birds get short-dosed. Replace a worn or wrong tip.');
  rep(/Incorrect droplet size results in uneven vaccine delivery[^\[]*\[4\]\.\s*/,
    'Get the drop size wrong and some birds get too much vaccine while others get too little.');
  rep('2% of vaccinated birds immediately after handling.', '2% of vaccinated birds immediately after handling [1].');
  rep('If you see nothing at day 5 to 7, the immune response did not kick in the way it should.',
    'For Newcastle and IB vaccines a mild reaction is expected, and no reaction at all usually means little immune stimulation took place [23].');

  // ---------------- Section 4 ----------------
  rep('Wing web vaccination is also used in some programs for Avian Encephalomyelitis (AE) and Chicken Anemia Virus (CAV) in breeder pullets, where confirming individual immunity before the production phase begins is critical.',
    'Wing web vaccination is also used in some programs for Avian Encephalomyelitis (AE), Chicken Anemia Virus (CAV), and live fowl cholera vaccines in breeder pullets, where confirming individual immunity before the production phase begins is critical [1,14].');
  rep('you can vaccinate healthy birds ahead of the wave and give them 7 to 10 days to build protective immunity before the virus reaches them [21].',
    'you can vaccinate healthy birds ahead of the wave, and many of them will build immunity before the virus reaches them [21]. The same profile stresses one step first: confirm the diagnosis at the lab before you vaccinate [21].');
  rep('Photo: Lucyin, CC BY-SA 4.0.', 'Source: Lucyin (CC BY-SA 4.0).');
  rep('The vaccine deposits between the two skin layers and the loose connective tissue between them by the bifurcated needle.',
    'The bifurcated needle deposits the vaccine in the skin layers and the loose connective tissue between them.');
  rep('notes that confirming take rates across a sample of the flock is the only way to know whether your wing web vaccination program is working [1].',
    'gives the rule of thumb: check 2% of the flock for takes [1].');
  rep('Inspect the injection sites at 7 to 10 days post-vaccination.', 'Inspect the injection sites at 7 to 10 days post-vaccination [14].');
  rep('Take rate standard:', 'How many to check:');
  rep(/Check 2% of the flock \(minimum 20 birds\) at day 7 to 10\. A take rate of 90% or higher is the target\. Below 80% means something in your protocol broke down\./,
    'Check 2% of the flock [1], and at least 50 to 100 birds picked at random around the barn [14]. Score each one: two nodules (one from each prong) is a good take, one nodule is a weak take, and no nodule is a miss [14]. Nearly every bird should have a good take. If you are finding more than the odd miss, something in your protocol broke down.');
  rep('A vaccination session that was completed efficiently but produced an 80% take rate means one in five birds is unprotected.',
    'If one bird in five has no take, one bird in five is unprotected, however smoothly the session seemed to go.');
  rep('Source: Tesfaye YT et al., Acta Vet Scand. 2022;64:38. CC BY 4.0.',
    'Source: Andrews SJ et al., Trop Anim Health Prod. 2022;54:315 (CC BY 4.0).');
  rep('The wing web method has one additional safety point specific to the applicator.',
    'The wing web method adds one safety point of its own: the applicator has two sharp needles, so keep it pointed away from your hands and other people as you move between birds.');
  deletePara('If working with NDV-containing wing web products');
  rep('Low take rate (below 80%):', 'Low take rate:');

  // ---------------- Section 5 ----------------
  rep('They are the final, high-dose priming event that builds', 'They are the final, high-dose boost that builds');
  rep('Inactivated vaccines are the cornerstone of antibody-based protection programs in laying and breeding flocks [22].',
    'Killed vaccines given after live priming are what produce the high, even titers that laying and breeding flocks depend on [1].');
  rep(/By 14 to 18 weeks, the live vaccines given earlier have primed the immune system\. When you follow that with a killed injection, the bird.s immune system recognizes the antigens and responds hard: high serum titers that stay elevated for the full production cycle \[4,22\]\./,
    'By 16 to 18 weeks, the live vaccines given earlier have primed the immune system [5]. When you follow that with a killed injection, the immune system recognizes the antigens and responds hard, with high, even serum titers [1].');
  rep('explains that the level of protection a day-old chick carries at placement depends almost entirely on the titer of her dam at the time the egg was laid [3].',
    'puts it plainly: the only way to get chicks with high, even maternal titers is to start with breeder hens that have high, even titers [3].');
  rep('typically vaccinated at 14 to 16 weeks, before transfer to the laying house at 16 to 18 weeks.',
    'in the Merck example program, the killed Newcastle and IB injection goes in at about 18 weeks, before lay [5].');
  rep('typically vaccinated at 18 to 20 weeks, before moving to the production barn, sometimes with a second injection 4 to 6 weeks later during lay.',
    'killed IBD, reovirus, and Newcastle/IB products go in at about 16 to 18 weeks, before the move to the production barn [5].');
  rep('The killed IBV component in a multivalent product reinforces the mucosal immunity from earlier live IB vaccinations and contributes to systemic titer.',
    'The killed IBV component in a multivalent product builds on the priming from earlier live IB vaccinations and raises the systemic titer. The CPC Learning Centre Infectious Bronchitis fact sheet puts the killed shot at 16 to 20 weeks in pullets, adds that it helps protect the kidney and oviduct, and warns that it only works well when the live vaccines went in properly first [104].');
  deletePara('Some multivalent products include a killed ILT component');
  rep('protect chicks from early Gumboro challenge', 'protect chicks from early IBD challenge');
  rep(/Use an automatic multi-dose injector[\s\S]*?high-volume administration \[22\]\./,
    'Use an automatic multi-dose injector with the fill tube running straight into the vaccine bottle. Set properly, it gives every bird the same dose and resets on its own, which a hand syringe cannot match on a big flock. Set it to the label dose, then fire five doses into a graduated syringe or measuring tube before the first bird and check the total. The Merial bulletin calibrates with mineral oil, because it flows much like the vaccine: five doses of 0.5 mL should give 2.5 mL [22].');
  rep(/A second calibration check should be performed midway through the vaccination session \[22\]\.[\s\S]*?delivering the intended dose\./,
    'Check it again halfway through the day [22]. As the vaccine warms or cools and the injector parts wear, the dose drifts. Five more test shots at the midpoint tell you it is still on target.');
  rep(/Avoid vaccinating when birds have just eaten a large meal\.[\s\S]*?regurgitation and aspiration\./,
    'To avoid regurgitation, the Merial bulletin says not to vaccinate on a feed day [22]. For skip-a-day flocks, that means the off-feed day. For full-fed birds, do not catch them right after a big feed push. A full crop plus handling is how birds regurgitate and inhale feed.');
  rep('Oil emulsion vaccines must be gently shaken before filling the injector and regularly (for 30 seconds) throughout the vaccination session [22].',
    'Shake oil emulsion vaccines well for 30 seconds before filling the injector, and again for 30 seconds at regular intervals through the session [22].');
  rep('Most killed poultry vaccines are dosed at 0.5 mL per bird. Some products specify 1.0 mL. Never reduce the dose: the antigen load in killed vaccines is matched to the labeled volume [22].',
    'The common dose for killed poultry vaccines is 0.5 mL per bird [1], and some products use a smaller volume such as 0.2 mL [22]. Never cut the dose: the antigen in a killed vaccine is matched to the labeled volume.');
  rep('Store oil emulsion vaccines at the back of the fridge away from the freezer compartment and out of direct light, check the thermometer on delivery day, and never pack them in a cooler with ice directly touching the bottles. Light exposure degrades the emulsion over time [22].',
    'Store oil emulsion vaccines in the fridge, in the dark, and away from the freezer compartment or cooling plate where they could freeze [22]. Check the thermometer on delivery day, and never pack them in a cooler with ice touching the bottles.');
  rep('(SC) and intramuscular (IM).  Your', '(SC) and intramuscular (IM). Your');
  rep('Swap the needle out at least every 1,000 birds, and replace it immediately if it gets bent, dulled, or contaminated [22].',
    'Change the needle at least every 500 to 1,000 birds [14,22], and sooner if it gets bent, dull, or dirty. The CPC Learning Centre General Principles guide is stricter still, at every 200 to 500 birds, because an overused needle causes bleeders, tissue damage, and pain [1].');
  rep('and carcass condemnations at processing.', 'and carcass condemnations at processing [22].');
  rep(/Slide the needle in at a shallow angle \(about 20 to 30 degrees\)[\s\S]*?try again \[22\]\./,
    'Slide the needle through the skin into that pocket, pointing down the neck toward the body, and give the full dose before pulling the needle out. You feel resistance as the needle goes through the skin, then it moves freely. If it does not, or you hit resistance again, you are in the skin, the muscle, or near the spine, so pull out and try again [14,22].');
  rep('go into the big breast muscle just to one side of the keel, with the needle at about a 45-degree angle.',
    'go into the big breast muscle about 3 to 5 cm (1 to 1.5 inches) to one side of the keel, with the needle pointing toward the tail at about a 45-degree angle.');
  rep('then pull the needle out smoothly [22].', 'then pull the needle out smoothly [14].');
  rep('increases the risk of persistent reactions [22].', 'increases the risk of persistent reactions.');
  rep('Work at a steady pace that allows correct restraint on every bird [22].', 'Work at a steady pace that allows correct restraint on every bird [14].');
  rep(/Accidental needle stick or spray from the injector tip[\s\S]*?\[22\]\./,
    'The real hazard with injection is not NDV. It is self-injection with an oil vaccine, covered just below [14,22].');
  rep('A dull needle causes more tissue trauma and increases post-injection reaction rates [22].',
    'A dull or overused needle causes more tissue damage and more bleeders [1].');
  rep(/If you stick yourself with a needle used on poultry[\s\S]*?requires documentation \[22\]\./,
    'Treat self-injection with an oil-based vaccine as a medical emergency, not a scratch. Oil injected into a finger or hand can cut off circulation and cause severe injury, and a doctor usually has to clean the oil out [14]. See a doctor right away, even if only a tiny amount went in [22]. Take the vaccine label with you, and report and record the incident.');
  rep('and operator name [22]. CFIA inspectors and your veterinarian will ask for these records.',
    'and operator name [14,22]. Your veterinarian will ask for these records.');
  rep('not general waste [22].', 'not general waste.');
  rep('Review technique, equipment, and the warming protocol [22].', 'Review technique, equipment, and the warming protocol [14].');
  rep('run blood titers 4 to 6 weeks after vaccination, or at first egg in layer programs.',
    'run blood titers once the response has had time to build. Antibodies take about three weeks to come up after vaccination [13], so test no earlier than that, at the age your veterinarian sets.');
  rep('if something does not line up with what you see in the barn [4,22].', 'if something does not line up with what you see in the barn [4].');

  // ---------------- Section 6 ----------------
  rep('liquid nitrogen dewars (-196°C) at the hatchery [1].', 'liquid nitrogen dewars (-196°C) at the hatchery [7].');
  rep(/which matters because Marek.s Disease virus can be present in barn litter from day one \[7\]\./,
    'which matters because chicks can meet Marek’s Disease virus very early in life [4].');
  rep(' For a full treatment of in-ovo vaccination equipment, technique, egg handling, and hatchery management protocols, see the Hatchery Management and Incubation Biology course in this series.', '');
  rep('Gumboro (IBD)', 'Infectious Bursal Disease (IBD)');

  // ---------------- Section 7 ----------------
  rep('After live vaccines administration:', 'After live vaccines:');
  rep('Injection site reactions after killed vaccines administration:', 'Injection site reactions after killed vaccines:');
  rep('This is the oil adjuvant creating a slow-release antigen depot. The lump typically resolves over 2 to 3 weeks.',
    'This is the oil adjuvant doing its job, releasing the antigen slowly over a long period [1].');
  rep('should prompt immediate contact with your veterinarian [22].', 'should prompt immediate contact with your veterinarian.');
  rep('Contact your veterinarian immediately [22].', 'Contact your veterinarian immediately.');
  rep(' and resolves on its own within 5 to 7 days [23].', ', lasts about 5 to 7 days, and settles on its own [23].');
  rep('the intended target tissue for initial vaccination [1,17].', 'the intended target tissue for initial vaccination [1].');
  rep('the tracheal reaction is harder than expected [5,17].', 'the tracheal reaction is harder than expected [17,23].');
  rep(' (MG) or Mycoplasma synoviae (MS) need special consideration', ' (MG) need special consideration');
  rep(': earlier timing, less aggressive routes, and antibiotic coverage during the vaccine reaction may all be needed.',
    ': a less aggressive route and antibiotic cover during the vaccine reaction may both be needed [23].');
  rep(/Applying a second live vaccine while the first reaction is still running[\s\S]*?\[5\]\./,
    'A flock still reacting to a live vaccine is not a healthy flock, and the CPC Learning Centre General Principles guide says to vaccinate only healthy birds [1]. A second live vaccine on top of an active reaction does not boost immunity. It piles more inflammation onto airways that are already irritated and can turn a manageable reaction into a flock-wide respiratory problem.');

  // ---------------- Section 8 ----------------
  rep('pass on that ability to resist treatment [24].', 'pass on that ability to resist treatment [101].');
  rep('First, some bacteria found in poultry barns can also cause illness in people, so resistance that develops on your farm can affect human health [24].',
    'First, some bacteria found in poultry barns can also make people sick. Canada’s national surveillance program tracks resistant Salmonella in chickens, in chicken meat, and in people, and it has seen some of those resistant strains increasing [24].');
  rep('A targeted treatment based on a culture and sensitivity report is both the most effective treatment and the most responsible one [24].',
    'Canadian stewardship experts make the same point: let culture and sensitivity results guide which drug you use, especially before reaching for the antibiotics that matter most in human medicine [102].');
  rep('This covers all antimicrobials that Health Canada classifies as medically important: Categories I, II, and III, which include nearly all antibiotics used routinely in poultry production. Over-the-counter purchase of these products is no longer legal [25].',
    'Anything in that group that used to sit on the farm store shelf over the counter now needs that prescription [25]. Health Canada ranks antimicrobials in four categories by how much they matter in human medicine. Ionophores, the coccidiosis-control products most poultry farmers know, sit in Category IV, the group not used in human medicine at all [103].');
  rep('Feed medication works well for preventive or control programs written under a specific veterinary prescription for your flock category.',
    'Feed medication suits longer-running programs your veterinarian prescribes for your flock.');
  rep('8.3  Treatment Routes', '8.3  Treatment Route');   // TOC row now matches the heading text

  // ---------------- Journals ----------------
  rep('published by the Houghton Poultry Research Station;', 'official journal of the World Veterinary Poultry Association, published by Taylor & Francis;');

  // ---------------- References: text edits by OLD number ----------------
  const bibEdits = {
    5: t => t.replace('[cited 2026 May]', '[cited 2026 Nov]'),
    6: t => t.replace('[cited 2026 Jul]', '[cited 2026 Nov]'),
    10: t => t.replace('&amp; Co.; 2023 [cited 2026 May]', '&amp; Co.; 2026 [cited 2026 Nov]'),
    13: () => esc('Fernandez A. Drinking Water Vaccination [Aviagen Brief]. Aviagen; 2008 Sep. Available from: aviagen.com [cited 2026 Nov].'),
    14: t => t.replace('[cited 2026 May]', '[cited 2026 Nov]'),
    23: () => esc('Butcher GD, Miles RD, Nilipour AH. Newcastle and Infectious Bronchitis Vaccine Reactions in Commercial Broilers. EDIS publication VM097 (originally VM132). Gainesville, FL: University of Florida IFAS Extension; 2002, revised 2017 [cited 2026 Nov]. doi:10.32473/edis-vm097-2002'),
    24: () => esc('Public Health Agency of Canada. Canadian Integrated Program for Antimicrobial Resistance Surveillance (CIPARS) 2023: Key and Integrated Findings. Ottawa: Public Health Agency of Canada; 2025 [cited 2026 Nov]. Available from: canada.ca/en/public-health/services/publications/drugs-health-products/canadian-integrated-program-antimicrobial-resistance-surveillance-2023-key-integrated-findings.html'),
    25: t => t.replace('[cited 2026 Jun]', '[cited 2026 Nov]'),
  };
  const newRefs = {
    101: 'World Health Organization. Antimicrobial resistance [Fact sheet]. Geneva: World Health Organization [cited 2026 Nov]. Available from: who.int/news-room/fact-sheets/detail/antimicrobial-resistance',
    102: 'Canadian Academy of Health Sciences. Antimicrobial Resistance / Antimicrobial Use in Food-Producing Animals in Canada: Strategic Interventions to Strengthen Antimicrobial Stewardship. Ottawa: Canadian Academy of Health Sciences; 2025.',
    103: 'Health Canada. Categorization of Antimicrobial Drugs Based on Importance in Human Medicine. Ottawa: Health Canada; 2009 [cited 2026 Nov]. Available from: canada.ca/en/health-canada/services/drugs-health-products/veterinary-drugs/antimicrobial-resistance/categorization-antimicrobial-drugs-based-importance-human-medicine.html',
    104: 'Dizaji R. Infectious Bronchitis in Chickens [Fact Sheet]. CPC Learning Centre; 2026. Available from: canadianpoultry.ca/learning-centre',
  };

  // ---------------- Renumber by first appearance ----------------
  const allParas = xml.match(PARA_RE);
  const refHead = allParas.findIndex(p => /Heading1/.test(p) && joined(p) === 'References');
  const introHead = allParas.findIndex(p => /Heading1/.test(p) && joined(p) === 'Introduction');
  if (refHead < 0 || introHead < 0) throw new Error('headings not found');
  const CIT = /\[(\d+(?:,\s*\d+)*)\]/g;
  const order = [];
  for (let k = introHead; k < refHead; k++) {
    for (const m of joined(allParas[k]).matchAll(CIT)) for (const n of m[1].split(',').map(Number)) if (!order.includes(n)) order.push(n);
  }
  const map = {}; order.forEach((o, i) => map[o] = i + 1);

  // bibliography paragraphs (old numbering)
  const bibParas = allParas.slice(refHead + 1).filter(p => /w:hanging="504"/.test(p));
  const bib = {};
  for (const p of bibParas) { const n = Number(joined(p).match(/^(\d+)\.\s/)[1]); bib[n] = p; }
  for (const o of order) if (!bib[o] && !newRefs[o]) throw new Error('cited but no bib entry: ' + o);
  const dropped = Object.keys(bib).map(Number).filter(n => !order.includes(n));
  console.log('Dropped (no longer cited):', dropped.join(', ') || 'none');

  // rewrite citations in body paragraphs
  const sortedUnique = a => [...new Set(a)].sort((x, y) => x - y);
  for (let k = introHead; k < refHead; k++) {
    const p = allParas[k];
    let np = p;
    const ns = nodes(p);
    // ensure citations are never split across runs
    const inNodes = ns.reduce((c, n) => c + (n.text.match(CIT) || []).length, 0);
    const inJoined = (joined(p).match(CIT) || []).length;
    if (inNodes !== inJoined) throw new Error('citation split across runs: ' + joined(p).slice(0, 80));
    for (let j = ns.length - 1; j >= 0; j--) {
      const n = ns[j];
      const t = n.text.replace(CIT, (_, g) => '[' + sortedUnique(g.split(',').map(x => map[Number(x)])).join(',') + ']');
      if (t !== n.text) np = np.slice(0, n.i) + n.open + t + n.close + np.slice(n.i + n.len);
    }
    if (np !== p) xml = xml.replace(p, np);
  }

  // rebuild bibliography in new order
  const template = bibParas[0];
  function bibPara(newNum, textXml) {
    let p = template.replace(/\sw14:paraId="[^"]*"/, '').replace(/\sw14:textId="[^"]*"/, '');
    const ns = nodes(p);
    const texts = [`${newNum}.  `, textXml];
    for (let j = ns.length - 1; j >= 0; j--) p = p.slice(0, ns[j].i) + '<w:t xml:space="preserve">' + (texts[j] ?? '') + ns[j].close + p.slice(ns[j].i + ns[j].len);
    return p;
  }
  const newBib = order.map(o => {
    let textXml;
    if (newRefs[o]) textXml = esc(newRefs[o]);
    else {
      textXml = nodes(bib[o]).slice(1).map(n => n.text).join('');
      if (bibEdits[o]) { const before = textXml; textXml = bibEdits[o](textXml); if (textXml === before) throw new Error('bib edit had no effect: ' + o); }
    }
    return bibPara(map[o], textXml);
  }).join('');
  const firstBib = xml.indexOf(bibParas[0]);
  const lastBib = xml.indexOf(bibParas[bibParas.length - 1]) + bibParas[bibParas.length - 1].length;
  xml = xml.slice(0, firstBib) + newBib + xml.slice(lastBib);

  // ---------------- Italicize genus names introduced by the new text ----------------
  // Splits the run holding the word into pre / italic word / post runs.
  function italicize(word, paraFind) {
    const p = findPara(paraFind);
    const runs = [...p.matchAll(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g)];
    const r = runs.find(m => !/<w:i\/>/.test(m[0]) && m[0].includes(word));
    if (!r) throw new Error('italicize: run not found for ' + word);
    const run = r[0];
    const rPr = (run.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || ['<w:rPr></w:rPr>'])[0];
    const t = run.match(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/)[1];
    const k = t.indexOf(word);
    const mk = (txt, ital) => txt ? `<w:r>${ital ? rPr.replace('<w:rPr>', '<w:rPr><w:i/><w:iCs/>') : rPr}<w:t xml:space="preserve">${txt}</w:t></w:r>` : '';
    const replacement = mk(t.slice(0, k), false) + mk(word, true) + mk(t.slice(k + word.length), false);
    xml = xml.replace(p, p.replace(run, replacement));
  }
  italicize('Salmonella', 'tracks resistant Salmonella in chickens');

  // ---------------- Checks ----------------
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('unescaped &');
  if (/\[10[1-4]\]/.test(xml)) throw new Error('placeholder survived');
  if ((xml.match(/w:dirty=/g) || []).length) throw new Error('dirty flag');
  const finalParas = xml.match(PARA_RE);
  const fo = [];
  const rh = finalParas.findIndex(p => /Heading1/.test(p) && joined(p) === 'References');
  const ih = finalParas.findIndex(p => /Heading1/.test(p) && joined(p) === 'Introduction');
  for (let k = ih; k < rh; k++) for (const m of joined(finalParas[k]).matchAll(CIT)) for (const n of m[1].split(',').map(Number)) if (!fo.includes(n)) fo.push(n);
  if (fo.some((n, i) => n !== i + 1)) throw new Error('first-appearance order not sequential: ' + fo.join(','));
  const bibCount = finalParas.slice(rh + 1).filter(p => /w:hanging="504"/.test(p)).length;
  if (bibCount !== fo.length) throw new Error(`bib count ${bibCount} != cited ${fo.length}`);

  console.log(`Edits applied: ${log.length}. References: ${fo.length}.`);
  console.log('Old -> new map:', order.map(o => `${o}->${map[o]}`).join(' '));

  zip.file('word/document.xml', xml);
  zip.file('word/media/image5.png', fs.readFileSync(NEWFIG), { createFolders: false });   // Figure 1.1, corrected timeline
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log('Wrote', OUT, buf.length, 'bytes');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
