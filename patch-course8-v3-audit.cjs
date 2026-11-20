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
const OUT = process.env.C8_OUT || 'Course 8/Vaccination_and_Treatment_V3.docx';   // C8_OUT: build elsewhere, e.g. while the docx is open in Word
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
// Insert a new "Bold label. Body text" paragraph after `anchorFind`, cloned from `templateFind`
// (a non-list paragraph whose first run is a bold label), so the formatting matches the document.
function insertLabeledAfter(anchorFind, templateFind, label, bodyText) {
  const anchor = findPara(anchorFind);
  let clone = findPara(templateFind).replace(/<w:bookmark(Start|End)[^>]*\/>/g, '').replace(/\sw14:paraId="[^"]*"/, '').replace(/\sw14:textId="[^"]*"/, '');
  const ns = nodes(clone);
  for (let k = ns.length - 1; k >= 0; k--) {
    const n = ns[k];
    const t = k === 0 ? esc(label) : k === 1 ? ' ' + esc(bodyText) : '';
    clone = clone.slice(0, n.i) + '<w:t xml:space="preserve">' + t + n.close + clone.slice(n.i + n.len);
  }
  xml = xml.replace(anchor, anchor + clone);
  log.push('INSERT labeled after ' + anchorFind.slice(0, 50));
}
// Remove a figure: the caption paragraph and the drawing paragraph right before it.
function deleteImageWithCaption(captionFind) {
  const cap = findPara(captionFind);
  const at = xml.indexOf(cap);
  const before = xml.slice(0, at);
  const imgStart = before.lastIndexOf('<w:p ') > before.lastIndexOf('<w:p>') ? before.lastIndexOf('<w:p ') : before.lastIndexOf('<w:p>');
  const imgPara = xml.slice(imgStart, at);
  if (!/<w:drawing>/.test(imgPara) || !/^<w:p[ >][\s\S]*<\/w:p>$/.test(imgPara)) throw new Error('no drawing paragraph before caption: ' + captionFind);
  xml = xml.slice(0, imgStart) + xml.slice(at + cap.length);
  log.push('DELETE image+caption ' + captionFind.slice(0, 40));
}
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
  // CPC week 2-3 boosters + CFIA Memorandum 2026-01 (7-day withdrawal for six live IB/IBD vaccines), added 2026-11-19 at the user's request
  insertLabeledAfter('A live AE vaccine given to breeder and layer pullets', 'Maternal antibodies and vaccination timing.',
    'Boosting at 2 to 3 weeks.',
    'Depending on the farm, CPC’s veterinary team recommends a second round of live vaccine in week 2 to 3: the Zoetis live Massachusetts and Connecticut type IB vaccine, given by coarse spray (Section 2.2), and on some farms a live IBD vaccine, Bursine 2, as well. Until 2026, every vaccine used in a food animal in Canada carried a withdrawal period of at least 21 days, the minimum wait between vaccinating and slaughter [105]. Since February 2, 2026, the CFIA has set a 7-day withdrawal period for six live IB and IBD vaccines made in the U.S., so broilers can be boosted closer to slaughter age [105]. The six are CLONEVAC D-78, UNIVAX PLUS, and Bursine 2 for IBD, and MILDVAC-Ma5 plus the two Zoetis live bronchitis vaccines (Massachusetts type, and Massachusetts and Connecticut type) for IB. During the changeover, stock still labeled with 21 days may be used with the 7-day withdrawal [105]. Every other vaccine keeps the withdrawal period on its label, so check the label before you vaccinate [105].');
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
  rep('to maximize vaccine quality and viability [17].', 'to maximize vaccine quality and viability [17]. CPC uses commercial distilled water for spray vaccination.');
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
  rep('or loss of contract.', 'or loss of contract. Vaccines carry a withdrawal period on their labels too (Section 1.2).');
  rep('8.3  Treatment Routes', '8.3  Treatment Route');   // TOC row now matches the heading text

  // ---------------- Journals ----------------
  rep('published by the Houghton Poultry Research Station;', 'official journal of the World Veterinary Poultry Association, published by Taylor & Francis;');

  // ---------------- Second full double-check pass (2026-11-19): tone, redundancy, unsupported claims ----------------
  // Numbers below are V2 numbers (renumbered automatically further down).
  rep('The protocols in this course are practical foundations. They are not a substitute for veterinary advice.',
    'The steps in this course are the practical basics. They do not replace advice from your veterinarian.');
  rep('Because the same CPC team designs the program, supplies the vaccines, and checks it on farm, your birds stay on a steady, predictable path from placement to production.',
    'The same CPC team designs the program, supplies the vaccines, and checks the results on farm, so nothing falls through the cracks between placement and production.');
  rep(/Modified-live vaccines \(MLVs\) contain a live virus[\s\S]*?in this course are modified-live vaccines \[4,5\]\./,
    'Modified-live vaccines (MLVs) carry a weakened virus. It still grows in the bird, but it does not make the bird sick. Because it grows, it builds strong protection right where it lands, in the gut, the eye, or the airways, and one dose is often enough. The catch is that live vaccine is fragile. Break the cold chain, or let it touch chlorine or disinfectant, and it dies. And because the virus is growing in the flock, expect a mild reaction. Most vaccines given in the water, by spray, by eye drop, or in the wing web in this course are modified-live [4,5].');
  deletePara('Two immune mechanisms run in parallel after vaccination');   // repeats the primer's "two arms" paragraph
  rep('The primary use of water vaccination in broiler production. The vaccine targets the bursa of Fabricius and stimulates humoral immunity to protect against the immunosuppressive effects of the field virus [8].',
    'The main reason broiler farms vaccinate in the water. The vaccine protects the bursa of Fabricius, where the chick’s antibody-making cells develop, so the field virus cannot wreck the chick’s immune system [8].');
  rep('Live attenuated lentogenic strains including La Sota, Clone 30, and B1 (Hitchner B1) go into the water and replicate in the gut and upper airways.',
    'Mild live strains such as La Sota, Clone 30, and B1 (Hitchner B1) go into the water and grow in the gut and upper airways.');
  rep('Cold chain failure is one of the most common and least visible causes of vaccination failure in the field.',
    'A broken cold chain is one of the easiest failures to miss, because you cannot see it.');
  rep('The milk proteins coat the vaccine virus particles and provide a physical buffer against any water impurities or pH fluctuations that might inactivate the live virus.',
    'The CPC Learning Centre General Principles guide calls the milk protein a raincoat for the virus: it coats the vaccine and soaks up the dirt and chlorine traces in the water that would kill it [1].');
  deletePara('Vaccination of stressed or diseased flocks leads to poor immune response');   // home is Section 7.2
  rep(/Spray vaccination applies live respiratory vaccines as liquid droplets[\s\S]*?Fine spray is covered in Section 2\.9\./,
    'Droplet size decides where the vaccine lands. Coarse droplets, over 100 microns, land on the eyes and the inside of the nose. Fine droplets, 50 to 100 microns, travel deeper into the windpipe. Aerosol droplets, under 50 microns, can reach the air sacs [1]. Coarse spray is covered in Sections 2.1 to 2.8. Fine spray, the follow-up step in a flock that is already primed, is in Section 2.9.');
  rep('Once the droplets land on the conjunctiva or nares, the same immune pathway as eye drop vaccination is triggered. The vaccine antigen reaches the Harderian gland and the bronchus-associated lymphoid tissue (BALT), stimulating local IgA production and mucosal immunity across the respiratory tract.',
    'Once the droplets land on the eye or in the nose, the vaccine works the same way as an eye drop: it reaches the Harderian gland behind the eye and the immune tissue in the airways, and both make local IgA [2].');
  rep('The target disease requires mucosal respiratory immunity rather than systemic protection.', 'The disease is one you stop in the airways, not in the blood.');
  rep('A rapid prime-boost schedule requires vaccinating large numbers in a short window.', 'You need to vaccinate a lot of birds in a short window.');
  rep('Precision per-bird dosing is required (ILT, high-priority primer doses).', 'Every bird needs an exact dose (ILT, key first doses).');
  rep('Water-soluble vaccines are specified by label for the water route.', 'The label says the vaccine goes in the water.');
  rep('Ventilation control is the factor most often overlooked in spray vaccination. Fans moving air through the barn during the spray will push droplets away from the birds before they are inhaled and remove the vaccine cloud from the air space before coverage is complete.',
    'Fans are easy to forget on spray day. Running fans blow the vaccine cloud away from the birds and out of the barn before they can breathe it in.');
  rep(/Photo 2\.2: A hatchery spray cabinet[\s\S]*?Source: CPC Short Courses\./,
    'Photo 2.2: Left, a hatchery spray cabinet putting coarse droplets over a tray of day-old chicks. Right, chicks after spray vaccination, with blue dye droplets on their heads and backs. Source: CPC Short Courses.');
  deletePara('All seven vaccination methods in this course depend on the same foundation');   // repeats the Introduction
  rep(/Fine spray particles are inhaled past the nares and conjunctiva[\s\S]*?building on the existing immune memory \[1\]\./,
    'Fine spray droplets are small enough to be breathed in past the eyes and nose and land in the windpipe, so they build protection deeper in the airways than coarse spray can reach [1]. The CPC Learning Centre General Principles guide describes vaccination as a stair-step: coarse spray first, then finer spray or a slightly stronger strain to push protection deeper [1].');
  rep(/Fine spray fits into a vaccination program as a booster after initial priming[\s\S]*?stronger reaction that fine spray delivers\./,
    'Fine spray is a booster, never a first vaccine. Prime the flock first with water or coarse spray, then follow with fine spray and a slightly stronger strain. It fits layer and breeder programs best, where the long laying cycle leaves room for several rounds of respiratory vaccine. On broiler farms fine spray is less common. The day-old IB spray at the hatchery is coarse spray with a mild strain, because a newly hatched chick’s airways cannot handle a deep, harsh reaction.');
  rep(/Eye drop vaccination puts a single drop of live vaccine directly onto the conjunctival surface[\s\S]*?first make contact with the bird\./,
    'Eye drop vaccination puts one drop of live vaccine on each bird’s eye. From there it works on the gland behind the eye and drains down into the nose and throat (Section 3.1), building protection right where respiratory germs get in.');
  rep(/IgA is the key antibody at mucosal surfaces[\s\S]*?upper respiratory mucosa\./,
    'When vaccine touches the eye, it triggers IgA, the antibody that guards the wet surfaces of the eye, airways, and gut (see the primer in the Introduction) [2].');
  rep('When a vaccine drop is absorbed through the conjunctiva, excess vaccine and the IgA response generated at the eye drains through this duct into the nasal cavity and upper pharynx. This extends mucosal protection to include the nasal passages and the beginning of the trachea, the entry points for ILT and IBV [18].',
    'Extra vaccine drains from the eye down this duct into the nose and throat, so protection reaches the nose and the top of the windpipe too, which is where respiratory viruses like ILT get in [18].');
  rep('For some serotypes, eye drop is specified in the vaccine protocol to ensure adequate Harderian gland stimulation.', 'Some IB vaccine labels call for eye drop.');
  deletePara('Avian Metapneumovirus (aMPV):');   // no source supports it
  // Photo 3.1 (old image showed the drop on the forehead) is swapped for a real Cobb photo near the end.
  rep('drops placed too far left', 'drops landing on the eyelid');
  rep('Eye drop vaccination has one additional disposal step because used droppers are also biohazardous waste.',
    'Eye drop adds one disposal step: used droppers count as biohazard waste, so burn them with the empty vials.');
  rep('Wing web vaccination is a hands-on individual-bird procedure. The quality of every injection depends on correct restraint, correct site identification, and correct needle placement. Movement at the time of injection can compromise vaccine delivery, resulting in partial or failed vaccine uptake.',
    'Wing web is one bird at a time, and every bird depends on three things: a firm hold, the right spot, and a clean stab. A bird that moves at the wrong moment gets part of a dose or none.');
  deletePara('Injection vaccination is also used in commercial broiler programs for certain diseases');   // unsourced, not Canadian practice
  rep('A typical pre-transfer layer program may use a product covering three to five diseases in one dose.',
    'A pre-transfer layer program may use one product that covers several diseases in a single dose.');
  rep(' carriage and vertical transmission through the egg is a food safety and regulatory priority in Canadian layer and breeder flocks [4].',
    ' carriage, and its spread through the egg, is a food safety priority in layer and breeder flocks [4].');
  rep('Killed vaccines, particularly oil emulsion products, must be stored at 2 to 8°C. They must never be frozen. Freezing breaks the oil-in-water emulsion and the product cannot be used. A frozen and thawed oil vaccine looks different: you will see separation, oiliness, or clumping. Discard any vial with these signs [22].',
    'Killed vaccines, especially oil emulsions, must be stored at 2 to 8°C and never frozen [22]. Freezing can break the emulsion, so throw out any vial that looks separated or lumpy.');
  rep(/In-ovo vaccination is a hatchery procedure\.[\s\S]*?set for the season\./,
    'In-ovo is the hatchery’s job: the machines, the needles, the egg trays, and keeping the vaccine cold are all handled there. Your part is knowing what your chicks arrived with, so that any boosters on the farm build on that protection instead of clashing with it. Sort out the timing with your veterinarian before the season’s program is set.');
  rep(/Finer spray droplets penetrate deeper into the respiratory tract than coarse droplets\.[\s\S]*?the tracheal reaction is harder than expected \[17,23\]\./,
    'Finer droplets go deeper and cause harder reactions. The droplet sizes are in Section 2 [1]. A worn nozzle or the wrong pressure can turn a coarse spray run into fine spray, and then the reaction is harder than expected [17,23].');
  rep(' colonizes the respiratory lining and leaves the mucosal surface already inflamed before vaccination day.', ' lives on the airway lining and keeps it inflamed before the vaccine ever arrives.');
  rep('complication after a live respiratory vaccine reaction is opportunistic ', 'complication after a live respiratory vaccine reaction is ');
  rep(' invasion of the air sacs [23].', ' getting into the air sacs [23].');
  rep('Local inflammation from the vaccine opens a window for bacteria already in the litter or drinker lines to reach deeper into the respiratory tract.',
    'The irritation from the vaccine opens the door for bacteria already in the litter or drinker lines to get deeper into the airways.');
  rep('Every time an antibiotic is used, it applies selection pressure on the bacteria present. The ones that survive are the ones most likely to carry and spread resistance.',
    'Every time you use an antibiotic, it kills the easy bacteria and leaves the tough ones. Those survivors carry and spread resistance.');

  rep('This is the most common avoidable failure in water vaccination programs, and it is entirely preventable with a 72-hour shutdown of your disinfection system before vaccination day.',
    'It is one of the easiest failures to make and one of the easiest to prevent: shut off your disinfection system 72 hours before vaccination day.');
  rep('Most common preventable failure. The vaccine was inactivated before birds drank it.', 'The vaccine was dead before the birds drank it.');
  rep('The most common complication after a live', 'A common complication after a live');   // Butcher describes it as common, not the most common

  rep('Water vaccination is the most widely used mass-vaccination method in commercial poultry. Birds drink', 'Birds drink');

  rep('The most common causes are vaccine injected', 'Likely causes include vaccine injected');

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
    105: 'Canadian Food Inspection Agency. Memorandum 2026-01: Reduction of the withdrawal period for certain chicken vaccines. Ottawa: Canadian Centre for Veterinary Biologics, CFIA; 2026 Jan 12 [cited 2026 Nov]. Available from: inspection.canada.ca/en/animal-health/veterinary-biologics/memoranda/memorandum-2026-01',
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

  // ---------------- Section starts: page-break paragraph -> pageBreakBefore on the heading ----------------
  // A paragraph holding only <w:br w:type="page"/> before a Heading 1 lands alone on a blank page
  // whenever the previous page fills exactly (page 18 before Section 2 did). Sections 8 and the
  // Journals already used pageBreakBefore on the heading, so make every section start the same.
  {
    let fixed = 0;
    xml = xml.replace(/<w:p\b[^>]*>(?:<w:pPr>(?:(?!<\/w:pPr>)[\s\S])*<\/w:pPr>)?<w:r>(?:<w:rPr>(?:(?!<\/w:rPr>)[\s\S])*<\/w:rPr>)?<w:br w:type="page"\/><\/w:r><\/w:p>(<w:p\b[^>]*>)(<w:pPr>)((?:(?!<\/w:pPr>)[\s\S])*?<w:pStyle w:val="Heading1"\/>(?:<w:keepNext\/>)?(?:<w:keepLines\/>)?)/g,
      (m, pOpen, pPrOpen, head) => { fixed++; return pOpen + pPrOpen + head + (/<w:pageBreakBefore\/>/.test(m) ? '' : '<w:pageBreakBefore/>'); });
    if (fixed !== 8) throw new Error(`expected 8 section-start page breaks, converted ${fixed}`);
    if (/<w:p\b[^>]*><w:r><w:br w:type="page"\/><\/w:r><\/w:p><w:p\b[^>]*><w:pPr><w:pStyle w:val="Heading1"/.test(xml)) throw new Error('page-break paragraph survived before a Heading 1');
    log.push(`SECTION BREAKS converted: ${fixed}`);
  }

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

  // ---------------- Spray volume table: drop the redundant per-1,000 column ----------------
  // The Merial bulletin [18] gives volumes per 10,000 birds; the per-1,000 column just divided by 10.
  {
    const i = xml.indexOf('Volume per 10,000 birds');
    if (xml.indexOf('Volume per 10,000 birds', i + 1) >= 0) throw new Error('more than one per-10,000 table');
    if (i < 0) throw new Error('spray volume table not found');
    const s = xml.lastIndexOf('<w:tbl>', i), e = xml.indexOf('</w:tbl>', i) + '</w:tbl>'.length;
    let tbl = xml.slice(s, e);
    tbl = tbl.replace(/<w:tblGrid>[\s\S]*?<\/w:tblGrid>/, '<w:tblGrid><w:gridCol w:w="4150"/><w:gridCol w:w="4150"/></w:tblGrid>');
    let rows = 0;
    tbl = tbl.replace(/<w:tr\b[\s\S]*?<\/w:tr>/g, tr => {
      const cells = [...tr.matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)];
      if (cells.length !== 3) throw new Error('spray volume row does not have 3 cells');
      rows++;
      const last = cells[2];
      return tr.slice(0, last.index) + tr.slice(last.index + last[0].length);
    });
    tbl = tbl.replace(/<w:tcW w:w="2800" w:type="dxa"\/>/g, '<w:tcW w:w="4150" w:type="dxa"/>');
    if (rows !== 3 || /per 1,000 birds|300 mL|700-800 mL/.test(tbl)) throw new Error('spray volume column not removed cleanly');
    xml = xml.slice(0, s) + tbl + xml.slice(e);
    { const lp = findPara('Volume targets [18]:'); if (lp.includes('<w:keepNext/>')) throw new Error('label already keepNext'); xml = xml.replace(lp, lp.replace('<w:pPr>', '<w:pPr><w:keepNext/>')); }   // keep the label on the table's page
    log.push('SPRAY VOLUME TABLE: per-1,000 column removed');
  }

  // ---------------- Real photos replace the suspected AI images (2026-11-20) ----------------
  // 6.1: user-supplied Course 8/Inovo.jpg, credited to poultry.network.
  // 1.2, 2.1, 3.1, 4.2 and the new 5.2: photos from the Cobb Vaccination Management Guide (2025, ref 16)
  // in Course 8/Cobb_Vaccination_Guide.pdf, extracted from pp. 20, 16, 22, 23 and 26, as the user directed.
  let rels = await zip.file('word/_rels/document.xml.rels').async('string');
  {
    const COBB = 'Source: Cobb-Vantress, Cobb Vaccination Management Guide, 2025.';
    let relN = 0, docPrN = 0;
    const addImageRel = (file, media) => {
      const id = `rIdC8photo${++relN}`;
      rels = rels.replace('</Relationships>', `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${media}"/></Relationships>`);
      zip.file(`word/media/${media}`, fs.readFileSync(file));
      return id;
    };
    const setDrawing = (d, rid, widthIn, pw, ph) => {
      const cx = Math.round(widthIn * 914400), cy = Math.round(cx * ph / pw);
      if ((d.match(/<w:drawing>/g) || []).length !== 1) throw new Error('expected one drawing in the photo paragraph');
      return d.replace(/r:embed="[^"]+"/, `r:embed="${rid}"`)
        .replace(/<wp:extent cx="\d+" cy="\d+"\/>/, `<wp:extent cx="${cx}" cy="${cy}"/>`)
        .replace(/<a:ext cx="\d+" cy="\d+"\/>/, `<a:ext cx="${cx}" cy="${cy}"/>`);
    };
    const captionPara = text => '<w:p><w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:iCs/><w:color w:val="555555"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>' +
      `<w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
    const photoAt = captionFind => {
      const cap = findPara(captionFind), at = xml.indexOf(cap), before = xml.slice(0, at);
      const imgStart = Math.max(before.lastIndexOf('<w:p '), before.lastIndexOf('<w:p>'));
      const imgPara = xml.slice(imgStart, at);
      if (!/<w:drawing>/.test(imgPara) || !/^<w:p[ >][\s\S]*<\/w:p>$/.test(imgPara)) throw new Error('no drawing paragraph before caption: ' + captionFind);
      return { cap, at, imgStart, imgPara };
    };
    const swapPhoto = (captionFind, file, media, pw, ph, widthIn, caption) => {
      const { cap, at, imgStart, imgPara } = photoAt(captionFind);
      const d = setDrawing(imgPara, addImageRel(file, media), widthIn, pw, ph);
      xml = xml.slice(0, imgStart) + d + captionPara(caption) + xml.slice(at + cap.length);
      log.push('PHOTO swapped: ' + caption.slice(0, 12));
    };
    const insertPhotoAfter = (paraFind, templateCaption, file, media, pw, ph, widthIn, caption) => {
      let d = photoAt(templateCaption).imgPara;
      d = d.replace(/ w14:(paraId|textId)="[^"]*"/g, '').replace(/ wp14:(anchorId|editId)="[^"]*"/g, '').replace('<w:lastRenderedPageBreak/>', '')
        .replace(/<wp:docPr id="\d+" name="[^"]*"/, () => { const n = 880000 + (++docPrN); return `<wp:docPr id="${n}" name="Picture ${n}"`; });
      d = setDrawing(d, addImageRel(file, media), widthIn, pw, ph);
      const p = findPara(paraFind);
      xml = xml.replace(p, p + d + captionPara(caption));
      log.push('PHOTO inserted: ' + caption.slice(0, 12));
    };

    swapPhoto('Photo 1.2:', 'Course 8/cobb_water_nipple.jpg', 'image_cobb_water.jpg', 1470, 539, 5.8,
      'Photo 1.2: Broilers at a nipple drinker line. On vaccination day, walk the house to check that all the birds are drinking. ' + COBB);
    swapPhoto('Photo 2.1:', 'Course 8/cobb_spray_backpack.jpg', 'image_cobb_spray.jpg', 1485, 912, 5.8,
      'Photo 2.1: A three-person backpack spray crew in a broiler house: one sprayer for each side of the house and one down the middle. ' + COBB);
    swapPhoto('Photo 3.1:', 'Course 8/cobb_eye_drop.jpg', 'image_cobb_eyedrop.jpg', 1011, 683, 4.8,
      'Photo 3.1: Eye drop vaccination. One hand steadies the head while the dropper tip is tilted toward the open eye. The tip never touches the eye. ' + COBB);
    swapPhoto('Photo 4.2:', 'Course 8/cobb_wing_web.jpg', 'image_cobb_wingweb.jpg', 1161, 808, 4.8,
      'Photo 4.2: Wing web vaccination. The two-pronged applicator goes through the web on the underside of the wing, clear of feathers, blood vessels, and bone. ' + COBB);
    insertPhotoAfter('Subcutaneous (SC) injection: This route puts the vaccine under the skin', 'Photo 5.1:', 'Course 8/cobb_sc_neck.jpg', 'image_cobb_scneck.jpg', 1485, 1122, 4.6,
      'Photo 5.2: Subcutaneous injection in the back of the neck. The needle goes into the pocket under the lifted skin, pointing toward the body. ' + COBB);
    swapPhoto('Photo 6.1:', 'Course 8/Inovo.jpg', 'image_inovo.jpg', 980, 513, 5.8,
      'Photo 6.1: In-ovo injection heads lined up over a tray of eggs at the hatchery, one head for each egg. Source: poultry.network.');
    for (const n of ['1.2', '2.1', '3.1', '4.2', '5.2', '6.1']) if ((joined(xml).match(new RegExp(`Photo ${n.replace('.', '\.')}:`, 'g')) || []).length !== 1) throw new Error('photo caption count wrong for ' + n);
  }

  // ---------------- Checks ----------------
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('unescaped &');
  if (/\[10[1-5]\]/.test(xml)) throw new Error('placeholder survived');
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
  zip.file('word/_rels/document.xml.rels', rels);
  zip.file('word/media/image5.png', fs.readFileSync(NEWFIG), { createFolders: false });   // Figure 1.1, corrected timeline
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log('Wrote', OUT, buf.length, 'bytes');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
