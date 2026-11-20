// ============================================================
// generate-course8-essentials.mjs
// Course 8 Essentials: Vaccination and Treatment Basics (beginner edition, DRAFT)
// For new farmers with a high-school science background. A short companion to the full
// Course 8 (Vaccination_and_Treatment_V3.docx), which stays the main course.
// Every fact is taken from a source already verified in the Course 8 V3 audit
// (Course 8/reference_verification_log.md, 2026-11-19 addendum).
// Citations are written as keys, e.g. [@WATER] or [@WATER,@COBB], and numbered automatically
// in order of first appearance; the reference list is built from the same registry.
// Run: node generate-course8-essentials.mjs
// Then refresh TOC page numbers (LibreOffice render + toc-refresh-course8-v3.cjs).
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
  Header, Footer, PageNumber, BorderStyle, convertInchesToTwip, HeadingLevel,
  LevelFormat, TableOfContents, ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR   = path.join(__dirname, 'Course 8');
const OUT_DIR   = path.join(__dirname, 'Course 8', 'Essentials');
const OUT_FILE  = path.join(OUT_DIR, 'Vaccination_and_Treatment_Essentials_draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');
const COURSE_TITLE = 'Vaccination and Treatment Basics';
fs.mkdirSync(OUT_DIR, { recursive: true });

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

// ---------------- References (all verified in the Course 8 V3 audit) ----------------
const REFS = {
  GP:     'General Principles of Vaccination [Technical Bulletin]. CPC Learning Centre. Available from: cpclearningcentre.ca',
  MAB:    'Canadian Poultry Consultants. Maternal Antibody Transfer [Technical Bulletin]. CPC Learning Centre. Available from: cpclearningcentre.ca',
  AVIAGEN:'Fernandez A. Drinking Water Vaccination [Aviagen Brief]. Aviagen; 2008 Sep. Available from: aviagen.com [cited 2026 Nov].',
  WATER:  'Merial. Water Vaccination [Technical Bulletin]. Merial. Available via CPC Learning Centre: cpclearningcentre.ca',
  IBFS:   'Dizaji R. Infectious Bronchitis in Chickens [Fact Sheet]. CPC Learning Centre; 2026. Available from: canadianpoultry.ca/learning-centre',
  SPRAY:  'Merial. Coarse Spray Vaccination [Technical Bulletin]. Merial. Available via CPC Learning Centre: cpclearningcentre.ca',
  COBB:   'Cobb-Vantress. Cobb Vaccination Management Guide. Cobb-Vantress; 2025. Available from: cobbgenetics.com [cited 2026 Nov].',
  INJ:    'Merial. Injection of Inactivated Vaccines [Technical Bulletin]. Merial. Available via CPC Learning Centre: cpclearningcentre.ca',
  BUTCHER:'Butcher GD, Miles RD, Nilipour AH. Newcastle and Infectious Bronchitis Vaccine Reactions in Commercial Broilers. EDIS publication VM097 (originally VM132). Gainesville, FL: University of Florida IFAS Extension; 2002, revised 2017 [cited 2026 Nov]. doi:10.32473/edis-vm097-2002',
  WHO:    'World Health Organization. Antimicrobial resistance [Fact sheet]. Geneva: World Health Organization [cited 2026 Nov]. Available from: who.int/news-room/fact-sheets/detail/antimicrobial-resistance',
  CFIA:   'Canadian Food Inspection Agency. Memorandum 2026-01: Reduction of the withdrawal period for certain chicken vaccines. Ottawa: Canadian Centre for Veterinary Biologics, CFIA; 2026 Jan 12 [cited 2026 Nov]. Available from: inspection.canada.ca/en/animal-health/veterinary-biologics/memoranda/memorandum-2026-01',
  HC:     'Health Canada. Responsible use of Medically Important Antimicrobials in animals. Ottawa: Health Canada [cited 2026 Nov]. Available from: canada.ca/en/health-canada/services/drugs-health-products/veterinary-drugs/antimicrobial-resistance/actions/responsible-use-antimicrobials.html',
};
const order = [];
function cites(s) {
  return s.replace(/\[(@[A-Z]+(?:,@[A-Z]+)*)\]/g, (_, g) => {
    const nums = g.split(',').map(k => {
      const key = k.slice(1);
      if (!REFS[key]) throw new Error('Unknown reference key ' + key);
      if (!order.includes(key)) order.push(key);
      return order.indexOf(key) + 1;
    });
    return '[' + [...new Set(nums)].sort((a, b) => a - b).join(',') + ']';
  });
}

// ---------------- Paragraph helpers ----------------
const seg = (s) => (typeof s === 'string' ? { text: s } : s);
function runs(text, size = 24) {
  const parts = Array.isArray(text) ? text : [text];
  return parts.map(seg).map(p => new TextRun({ text: cites(p.text).replace(/(d) (g|L|mL|m|ft|bar|psi)/g, '$1 $2').replace(/(d) to (d)/g, '$1 to $2'), bold: p.bold || false, italics: p.italics || false, color: p.color || BODY_GRAY, size, font: 'Calibri' }));
}
function para(text, opts = {}) {
  return new Paragraph({ children: runs(text), alignment: AlignmentType.LEFT, spacing: { after: opts.spaceAfter ?? 160, line: 276, lineRule: 'auto' } });
}
function labeled(label, body) { return para([{ text: label + ' ', bold: true, color: DARK_BLUE }, ...(Array.isArray(body) ? body : [body])]); }
function h1(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } }); }
function h2(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } }); }
function bullet(text) { return new Paragraph({ children: runs(text), numbering: { reference: 'bullet-list', level: 0 }, spacing: { after: 80, line: 276, lineRule: 'auto' } }); }
let stepList = 0;
function newSteps() { stepList++; }
function step(text) { return new Paragraph({ children: runs(text), numbering: { reference: 'steps', level: 0, instance: stepList }, spacing: { after: 80, line: 276, lineRule: 'auto' } }); }
function callout(text) {
  return new Paragraph({
    children: runs(text), alignment: AlignmentType.LEFT,
    shading: { type: 'clear', color: 'auto', fill: 'EBF2FA' },
    indent: { left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
    spacing: { before: 120, after: 200, line: 276, lineRule: 'auto' },
  });
}
function numberedRef(text) { return new Paragraph({ children: [new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' })], numbering: { reference: 'references-list', level: 0 }, spacing: { after: 80, line: 276, lineRule: 'auto' } }); }
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function jpegDims(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
function image(file, caption, widthIn = 5.0) {
  const p = path.join(SRC_DIR, file);
  if (!fs.existsSync(p)) throw new Error('Missing image ' + p);
  const buf = fs.readFileSync(p);
  const wpx = Math.round(widthIn * 96);
  const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
  let hpx = Math.round(wpx * 0.66);
  if (isJpeg) { const d = jpegDims(buf); if (d) hpx = Math.round(wpx * d.h / d.w); }
  else { const v = new DataView(buf.buffer, buf.byteOffset); hpx = Math.round(wpx * v.getUint32(20, false) / v.getUint32(16, false)); }
  return [
    new Paragraph({ children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: isJpeg ? 'jpg' : 'png' })], alignment: AlignmentType.CENTER, spacing: { before: 160, after: 0 }, keepNext: true }),
    new Paragraph({ children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 } }),
  ];
}

function buildHeader() {
  return new Header({ children: [new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ text: COURSE_TITLE, color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}
function buildFooter() {
  return new Footer({ children: [new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  Course 8 Essentials  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.CURRENT], color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ text: ' of ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], color: '888888', size: 18, font: 'Calibri' }),
    ],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}
const pageMargin = { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) };
const body = (children) => (children = children.filter(Boolean), { properties: { page: { margin: pageMargin } }, headers: { default: buildHeader() }, footers: { default: buildFooter() }, children });

// ---------------- Cover ----------------
function buildCover() {
  const logo = fs.readFileSync(LOGO_PATH);
  const center = (text, o) => new Paragraph({ children: [new TextRun({ text, font: 'Calibri', ...o.run })], alignment: AlignmentType.CENTER, spacing: o.spacing });
  return {
    properties: { titlePage: true, page: { margin: pageMargin } },
    headers: { first: new Header({ children: [new Paragraph({ children: [] })] }) },
    footers: { first: new Footer({ children: [new Paragraph({ children: [] })] }) },
    children: [
      new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),
      center('COURSE 8: CPC SHORT COURSES', { run: { bold: true, color: MED_BLUE, size: 24 }, spacing: { before: 0, after: 240 } }),
      new Paragraph({ children: [new ImageRun({ data: logo, transformation: { width: 144, height: 144 }, type: 'png' })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),
      center('Vaccination and Treatment Basics', { run: { bold: true, color: MED_BLUE, size: 46 }, spacing: { before: 200, after: 200 } }),
      center('Course 8 Essentials: a starter course for new poultry farmers', { run: { italics: true, color: MED_BLUE, size: 26 }, spacing: { before: 0, after: 400 } }),
      center('___________________________________', { run: { color: GOLD, size: 22 }, spacing: { before: 0, after: 400 } }),
      center('CPC Short Courses', { run: { bold: true, color: '595959', size: 24 }, spacing: { before: 0, after: 120 } }),
      center('Duration: 1-Hour Lecture', { run: { color: '595959', size: 22 }, spacing: { before: 0, after: 120 } }),
      center('November 2026', { run: { color: '595959', size: 22 }, spacing: { before: 0, after: 800 } }),
      center('This material is intended for educational purposes for Canadian poultry producers and farm staff who are new to the industry. It is a short introduction, not a full course: the complete version is Course 8 (Fundamentals of Poultry Vaccination & Treatment). Use it together with current provincial and federal regulations, your breed management guide, and the advice of a licensed poultry veterinarian. Vaccination programs must be designed with veterinary oversight. The CPC team reviews and updates this series. If you spot something that needs correcting, tell us at admin@canadianpoultry.ca.', { run: { italics: true, color: '808080', size: 18 }, spacing: { before: 0, after: 120 } }),
    ],
  };
}

// ---------------- Introduction ----------------
function buildIntro() {
  return body([
    h1('Table of Contents'),
    new TableOfContents('Table of Contents', { headingStyleRange: '1-2' }),
    pageBreak(),
    h1('Introduction'),
    para('This is a starter course on vaccinating poultry and using antibiotics the right way. It is written for people who are new to running or working in a poultry barn. You do not need a science background. If you finished high school, you have everything you need.'),
    para('Here is the one idea to hold on to. Giving a vaccine is not the same as protecting a bird. You can open the vial, give the dose, and write "done" in the records, and still end up with birds that have almost no protection. Protection only happens when each bird gets a live, full dose and its own body answers it. Almost everything in this course is about closing that gap.'),
    para('The CPC Learning Centre puts it simply: vaccination is an art. It takes knowledge, care, and hands-on skill that gets better with practice [@GP]. Your veterinarian decides which vaccines your flock gets and when [@GP]. Your job is to make sure every one of those vaccines actually reaches every bird.'),
    h2('What You Will Learn'),
    bullet('What a vaccine does, and the difference between live and killed vaccines.'),
    bullet('How to keep vaccine alive from the fridge to the bird, and how to protect yourself.'),
    bullet('How to vaccinate through the drinking water, step by step.'),
    bullet('The basics of spray, eye drop, wing web, and injection vaccination.'),
    bullet('What a normal reaction looks like after vaccination, and when to call your veterinarian.'),
    bullet('The rules for antibiotics in Canada: prescriptions, withdrawal times, and records.'),
  ]);
}

// ---------------- Section 1 ----------------
function buildS1() {
  return body([
    h1('Section 1: Vaccine Basics'),
    h2('1.1 What a Vaccine Does'),
    para('A vaccine shows the bird a germ ahead of time, in a form that cannot make it sick. The bird’s immune system learns to recognize that germ, so if the real one shows up later, the bird can fight it off. The protection does not appear right away. Antibodies take about three weeks to build up after vaccination [@AVIAGEN].'),
    para('A vaccine can only work in a healthy bird. Vaccinate only healthy flocks, and never a flock that is already stressed or sick [@GP].'),
    h2('1.2 Live and Killed Vaccines'),
    labeled('Live vaccines', 'contain a weakened germ that can still grow in the bird without making it sick. Because they are alive, they are fragile: heat and light kill them, so they have to be stored cold and kept in the dark [@GP]. Most vaccines given in the water, by spray, by eye drop, or in the wing web are live.'),
    labeled('Killed vaccines', 'contain a germ that has been killed, usually mixed in oil. They cannot grow, so they have to be injected into each bird [@GP]. They work best as a boost after the flock has already had a live vaccine: given that way, they build high, even protection [@GP]. That is why pullets get a round of killed injections before they start laying.'),
    h2('1.3 Protection From the Hen'),
    para('Chicks are not born empty-handed. The hen passes antibodies to the chick through the egg, and these protect it for its first couple of weeks [@MAB]. These are called maternal antibodies. They fade on their own.'),
    para('This matters for timing. Vaccinate chicks while their maternal antibodies are still high, and those antibodies can knock out the vaccine before it works. Vaccinate too late, and the chicks are left unprotected [@MAB]. Your veterinarian uses blood tests from the breeder flock to pick the right day [@GP].'),
    callout('Even a good breeder flock can produce chicks where one in ten carries no maternal antibody at all. In a flock of 25,000 chicks, that is 2,500 or more birds with no protection from the hen [@MAB].'),
  ]);
}

// ---------------- Section 2 ----------------
function buildS2() {
  return body([
    h1('Section 2: Keeping the Vaccine Alive'),
    h2('2.1 The Cold Chain'),
    para('A live vaccine is a living thing, and it dies at the wrong temperature. The "cold chain" means keeping it cold at every step, from the delivery truck to your fridge to the barn. The scary part is that a dead vaccine looks exactly like a good one. Nothing you do in the barn can bring it back.'),
    bullet('Store vaccine between 2°C and 8°C [@WATER].'),
    bullet('Carry it to the barn in a cooler with ice packs [@WATER].'),
    bullet('Keep it out of the sun. Sunlight kills live vaccine [@WATER].'),
    bullet('Do not let it freeze. If a vial froze, do not use it.'),
    bullet('Write down the serial number and expiry date of every vial you use [@WATER].'),
    h2('2.2 Protect Yourself'),
    para('Some live vaccines can affect people too. The live Newcastle disease vaccine can give you an eye infection (conjunctivitis) if it splashes into your eyes or you rub your eyes with dirty gloves. Wear gloves, a mask, and safety glasses while you mix and give vaccine [@WATER]. If vaccine gets in your eyes, rinse them with clean water and see a doctor.'),
    ...image('conjunctivitis due to the NDV vaccine contatct.jpg', 'Photo 2.1: An eye infection (conjunctivitis) in a person caused by Newcastle disease virus carried to the eye on the hands. Source: CPC Short Courses.', 1.5),
    para('When you are done, burn all empty vials and containers [@WATER]. Any mixed vaccine left over at the end should be burned too, not poured out [@GP]. Wash your hands and arms before you eat or touch your face.'),
  ]);
}

// ---------------- Section 3 ----------------
function buildS3() {
  return body([
    h1('Section 3: Vaccinating Through the Water'),
    para('Water vaccination is a simple, quick way to vaccinate a whole flock [@AVIAGEN]. The birds drink the vaccine from their own drinkers, and you never have to catch a bird. It sounds easy, which is exactly why it goes wrong so often. The four steps below are where it succeeds or fails.'),
    h2('3.1 Get the Water Lines Ready'),
    para('Chlorine is great for killing germs in the water. The trouble is, it kills vaccine too. If chlorine is still in the lines on vaccination day, the vaccine is dead before a single bird drinks it. It is one of the easiest mistakes to make, and one of the easiest to avoid.'),
    (newSteps(), null),
    step('Turn off the chlorinator 72 hours before vaccinating. On town water that has chlorine in it, put a charcoal filter on the line for those 72 hours [@WATER].'),
    step('Clean the drinkers with mild soap only. Do not use disinfectant [@WATER].'),
    step('Flush the lines, then rinse them with skim milk powder mixed at about 454 g per 190 L (1 lb per 50 gallons) [@WATER]. The milk soaks up traces of chlorine and dirt.'),
    step('Keep chlorine, disinfectants, and water medication out of the lines for 24 hours after vaccinating too [@GP].'),
    h2('3.2 Mix It Right'),
    para('First, work out how much water to use. A good rule is 40% of what the flock drinks in a day, and the birds should finish it within about two hours [@WATER,@AVIAGEN]. A practice run with plain water one or two days before tells you how much your flock really drinks in that time [@WATER].'),
    (newSteps(), null),
    step('Use clean plastic buckets and stirrers. Metal in the water can damage live vaccine [@AVIAGEN].'),
    step('Mix the skim milk powder into the water first, at the same 454 g per 190 L [@WATER].'),
    step('Open each vial under the milk water so the vaccine dissolves, then pour it into the batch and stir.'),
    step('Rinse every empty vial in the batch. If you skip this, up to 15% of the vaccine stays stuck in the glass [@WATER].'),
    h2('3.3 Vaccination Day'),
    para('Birds have to be thirsty enough to drink their whole dose quickly. Turn the water off for about two hours before vaccinating, and vaccinate on a feed day [@WATER]. For nipple lines, push the vaccine water in until you see the white milk solution come out the far end of each line. Then walk slowly through the barn to get the birds up and drinking [@WATER]. As soon as the vaccine water is gone, turn the normal water back on [@WATER].'),
    ...image('fig1_2.png', 'Figure 3.1: The water timeline on vaccination day: a short dry period, a two-hour window to drink the whole dose, and normal water back on as soon as it is gone. Source: CPC Short Courses.', 5.9),
    h2('3.4 Check Your Work'),
    para('Do not just assume it worked. Walk the barn every half hour during vaccination. The water in the lines should look white (milk) or blue (a colored stabilizer), and it should all be gone within about two hours.'),
    para('If you used a blue dye, you can see who drank. Check the tongues of 100 birds from at least three different spots in the barn. At least 90% should be stained blue [@AVIAGEN].'),
    ...image('cobb_water_nipple.jpg', 'Photo 3.1: Broilers at a nipple drinker line. On vaccination day, walk the house to check that all the birds are drinking. Source: Cobb-Vantress, Cobb Vaccination Management Guide, 2025.', 4.4),
    callout('Why every bird matters. Some viruses, like infectious bronchitis, change all the time. The CPC Learning Centre Infectious Bronchitis fact sheet explains that strong, even flock immunity gives the virus fewer chances to multiply and change, while patchy immunity lets new types arise [@IBFS].'),
  ]);
}

// ---------------- Section 4 ----------------
function buildS4() {
  return body([
    h1('Section 4: Other Ways to Vaccinate'),
    para('Water is not right for every vaccine. Your veterinarian picks the method that matches the disease. Common examples from the CPC Learning Centre General Principles guide [@GP]:'),
    bullet([{ text: 'Water: ', bold: true }, { text: 'infectious bursal disease (IBD), Newcastle disease, and infectious bronchitis.' }]),
    bullet([{ text: 'Spray: ', bold: true }, { text: 'mild infectious bronchitis vaccine, often at the hatchery.' }]),
    bullet([{ text: 'Eye drop: ', bold: true }, { text: 'infectious laryngotracheitis (ILT), one exact dose per bird.' }]),
    bullet([{ text: 'Wing web: ', bold: true }, { text: 'fowl pox, and sometimes avian encephalomyelitis.' }]),
    bullet([{ text: 'Injection: ', bold: true }, { text: 'killed vaccines, given before pullets start laying.' }]),
    bullet([{ text: 'At the hatchery: ', bold: true }, { text: 'Marek’s disease, injected into the egg at day 18.' }]),
    h2('4.1 Spray'),
    para('Spray covers a whole barn in one walk, with no catching and no thirsty birds. Droplet size is everything: drops that are too fine go too deep into the airways and the birds react harder. Follow the Merial coarse spray settings [@SPRAY]:'),
    bullet('Keep the pressure steady at 4.5 to 5.0 bar (65 to 75 psi).'),
    bullet('Use distilled water, never chlorinated water. CPC uses commercial distilled water.'),
    bullet('Hold the nozzle pointing down, 1 m (3 ft) above the birds’ heads, and stay within 4 m (12 ft) of the wall.'),
    bullet('Turn the fans off while you spray and keep them off for 20 minutes after. On hot days, vaccinate very early in the morning.'),
    bullet('Use the sprayer for vaccine only. Never use it for disinfectant or pesticide.'),
    ...image('cobb_spray_backpack.jpg', 'Photo 4.1: A three-person backpack spray crew in a broiler house: one sprayer for each side of the house and one down the middle. Source: Cobb-Vantress, Cobb Vaccination Management Guide, 2025.', 5.2),
    labeled('Boosting at 2 to 3 weeks.', 'Depending on the farm, CPC’s veterinary team recommends a second round of live vaccine in week 2 to 3: a live infectious bronchitis vaccine (the Zoetis Massachusetts and Connecticut type) by coarse spray [@IBFS], and on some farms a live IBD vaccine (Bursine 2) as well.'),
    h2('4.2 Eye Drop'),
    para('Eye drop is the most exact way to give a live respiratory vaccine: one drop, one bird. Hold the bird firmly, tilt its head so the eye faces up, and let one drop of about 0.03 mL fall onto the eye [@COBB]. Do not touch the dropper to the eye. Hold the bird until the drop disappears when it blinks. If you added blue dye, check the tongues of 2% of the birds afterward: a blue tongue means the drop went in [@GP].'),
    ...image('cobb_eye_drop.jpg', 'Photo 4.2: Eye drop vaccination. One hand steadies the head while the dropper tip is tilted toward the open eye. The tip never touches the eye. Source: Cobb-Vantress, Cobb Vaccination Management Guide, 2025.', 3.8),
    h2('4.3 Wing Web'),
    para('A two-pronged needle is dipped in vaccine and pushed through the thin skin of the wing web, the flap of skin on the inside of the wing. It is mostly used for fowl pox [@GP]. This is the only method that shows you proof on the bird. Seven to ten days later, check the wing web of 2% of the flock [@GP], and at least 50 to 100 birds picked at random around the barn [@COBB]. Two small bumps, one from each prong, is a good "take". No bump means that bird was missed and is not protected [@COBB].'),
    ...image('cobb_wing_web.jpg', 'Photo 4.3: Wing web vaccination. The two-pronged applicator goes through the web on the underside of the wing, clear of feathers, blood vessels, and bone. Source: Cobb-Vantress, Cobb Vaccination Management Guide, 2025.', 3.8),
    ...image('pox_take_wingweb.jpg', 'Photo 4.4: A take after wing web vaccination (circled). A small firm bump like this means the vaccine went in and the bird is responding. Source: Andrews SJ et al., Trop Anim Health Prod. 2022;54:315 (CC BY 4.0).', 1.35),
    h2('4.4 Injection'),
    para('Killed vaccines are injected one bird at a time, usually under the loose skin at the back of the neck. Before pullets move to the laying barn, your veterinarian will often schedule a round of these. The Merial injection bulletin gives the key steps [@INJ]:'),
    bullet('Take the vaccine out of the fridge 24 hours ahead so it warms to about 22°C. Cold oil vaccine is thick and hard to inject.'),
    bullet('Shake it well for 30 seconds before you start, and often while you work.'),
    bullet('Do not vaccinate on a feed day. A full crop plus handling makes birds bring up feed.'),
    bullet('Have a second person watch for missed birds (head shaking, bleeding, wet feathers) and vaccinate them again.'),
    ...image('cobb_sc_neck.jpg', 'Photo 4.5: Injection under the skin at the back of the neck. The needle goes into the pocket under the lifted skin, pointing toward the body. Source: Cobb-Vantress, Cobb Vaccination Management Guide, 2025.', 3.0),
    callout('If you inject yourself with an oil vaccine, treat it as an emergency, even if only a tiny amount went in. Oil injected into a finger or hand can cut off the blood supply and cause serious injury [@COBB]. See a doctor right away and take the vaccine label with you [@INJ].'),
  ]);
}

// ---------------- Section 5 ----------------
function buildS5() {
  return body([
    h1('Section 5: After Vaccination'),
    h2('5.1 What Normal Looks Like'),
    para('A live respiratory vaccine makes the birds a little "sick" on purpose. That small reaction is the immune system going to work. A mild reaction usually shows up 2 to 3 days after vaccination, lasts about 5 to 7 days, and settles on its own [@BUTCHER]. You might hear a light rattle when you walk the barn, see a few birds with watery eyes, or notice the flock is quieter for a day or two. This needs no treatment. Do not reach for antibiotics because birds sound a bit raspy on day 3.'),
    para('If you see no reaction at all after a Newcastle or infectious bronchitis vaccine, mention it to your veterinarian. It can mean the vaccine did not take [@BUTCHER].'),
    para([{ text: 'Dirty litter and dirty drinkers can turn a mild reaction into a real problem, because germs like ' }, { text: 'E. coli', italics: true }, { text: ' take advantage of the irritated airways [@BUTCHER]. Clean water and dry litter before vaccination day help a lot.' }]),
    h2('5.2 When to Call Your Veterinarian'),
    para('Call your veterinarian if you see any of these after vaccinating:'),
    bullet('The reaction is not getting better by day 7, or it is getting worse after day 5.'),
    bullet('More birds are dying than usual.'),
    bullet('Birds have swollen faces or are struggling to breathe.'),
    bullet('Large, swollen, or weeping sores where birds were injected or vaccinated in the wing web.'),
    para('Do not give another live vaccine to a flock that is still reacting to the last one. Talk to your veterinarian first.'),
  ]);
}

// ---------------- Section 6 ----------------
function buildS6() {
  return body([
    h1('Section 6: Antibiotics: The Rules'),
    h2('6.1 Why Antibiotics Need Care'),
    para('Vaccines help prevent disease, but even a well-vaccinated flock can get a bacterial infection. Antibiotics can treat those, but only if they keep working. When bacteria survive an antibiotic and pass on that toughness, the drug stops working. This is called antimicrobial resistance, or AMR [@WHO]. Using the wrong drug, the wrong dose, or stopping early all help resistant bacteria win.'),
    para('So before any antibiotic goes in, find out what you are treating. Send fresh dead birds to your veterinarian or the lab. The lab can tell you which germ is causing the problem and which drugs still kill it.'),
    h2('6.2 Prescriptions, Withdrawal Times, and Records'),
    labeled('You need a prescription.', 'Since December 1, 2018, antibiotics that matter in human medicine can only be sold in Canada with a prescription from a veterinarian [@HC]. Your veterinarian has to know your farm and your birds to write one, so keep them up to date on how the flock is doing.'),
    labeled('Follow it exactly.', 'Give the full dose for the full number of days, even if the birds look better sooner. Stopping early leaves the toughest bacteria behind.'),
    labeled('Respect the withdrawal time.', 'Every antibiotic label tells you how many days must pass after the last dose before birds can go to slaughter or eggs can be sold. Shipping too early is a food safety violation. Vaccines have withdrawal times too. Since February 2, 2026, six live IB and IBD vaccines, including Bursine 2 and the Zoetis Massachusetts and Connecticut IB vaccine, need only 7 days before slaughter instead of 21 [@CFIA]. Every other vaccine keeps the withdrawal time on its label, at least 21 days [@CFIA]. Always check the label.'),
    labeled('Write it down.', 'For every treatment, record the date started and finished, the drug, the dose and how it was given, which birds were treated, the prescription number, and the date the withdrawal time ends.'),
  ]);
}

// ---------------- Checklist + Learn more ----------------
function buildChecklist() {
  return body([
    h1('Your Vaccination Day Checklist'),
    para('Use this list every time. Each line is explained in the section shown in brackets.'),
    bullet('Your veterinarian has confirmed the vaccine, the day, and the method (Introduction).'),
    bullet('The flock is healthy and not stressed (Section 1).'),
    bullet('Vaccine stored at 2°C to 8°C, in date, serial number written down (Section 2).'),
    bullet('Gloves, mask, and safety glasses ready (Section 2).'),
    bullet('Chlorinator off 72 hours, drinkers cleaned with soap, lines rinsed with milk (Section 3).'),
    bullet('Practice run done, so you know how much water to mix (Section 3).'),
    bullet('Every vial rinsed, all vaccine drunk within about two hours, normal water back on (Section 3).'),
    bullet('Results checked: blue tongues, wing web takes, or the reaction you expect (Sections 3 to 5).'),
    bullet('Empty vials and leftover vaccine burned, hands washed (Section 2).'),
    h1('Want to Learn More?'),
    para('This course covers the basics. When you are ready for more, the full Course 8 (Fundamentals of Poultry Vaccination & Treatment) in this series goes deeper into how immunity works, every vaccination method, reactions, and responsible antibiotic use. The CPC Learning Centre also has short bulletins and disease profiles at canadianpoultry.ca/learning-centre. And the best teacher is your own veterinarian: ask them to walk through your flock’s program with you.'),
  ]);
}

function buildRefs() {
  return body([h1('References'), ...order.map(k => numberedRef(REFS[k]))]);
}

function buildStyles() {
  return {
    default: { document: { run: { font: 'Calibri', size: 24, color: BODY_GRAY }, paragraph: { spacing: { after: 160, line: 276, lineRule: 'auto' } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', run: { font: 'Calibri Light', size: 36, bold: true, color: DARK_BLUE }, paragraph: { spacing: { before: 480, after: 240 }, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { font: 'Calibri Light', size: 30, bold: true, color: MED_BLUE }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 1 } },
    ],
  };
}
function buildNumbering() {
  const lvl = (format, text) => [{ level: 0, format, text, alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } }];
  return { config: [
    { reference: 'bullet-list', levels: lvl(LevelFormat.BULLET, '•') },
    { reference: 'steps', levels: lvl(LevelFormat.DECIMAL, '%1.') },
    { reference: 'references-list', levels: lvl(LevelFormat.DECIMAL, '%1.') },
  ] };
}

async function main() {
  // Sections are built in document order, so citation numbers follow first appearance.
  const sections = [buildCover(), buildIntro(), buildS1(), buildS2(), buildS3(), buildS4(), buildS5(), buildS6(), buildChecklist()];
  sections.push(buildRefs());
  // Each "steps" list should restart at 1: docx numbering instances do this per reference+instance.
  const doc = new Document({ creator: 'CPC Short Courses', title: COURSE_TITLE, description: 'Course 8 Essentials, CPC Short Courses', features: { updateFields: false }, styles: buildStyles(), numbering: buildNumbering(), sections });

  let buffer = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!settings.includes('<w:updateFields')) settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  zip.file('word/settings.xml', settings);

  let docXml = await zip.file('word/document.xml').async('string');
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  // Cached TOC rows (page numbers refreshed afterwards from a LibreOffice render)
  const headings = [...docXml.matchAll(/<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g)]
    .map(m => ({ lvl: Number(m[1]), text: [...m[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(t => t[1]).join('').trim() }))
    .filter(h => h.text !== 'Table of Contents');
  const entries = headings.map((e, i) => ({ ...e, page: 0, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));
  const tocRow = (e) => '<w:p><w:pPr>' + `<w:pStyle w:val="${e.lvl === 1 ? 'TOC1' : 'TOC2'}"/>` + '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs>' + (e.lvl === 1 ? '' : '<w:ind w:left="440"/>') + '</w:pPr>' +
    `<w:hyperlink w:anchor="${e.anchor}" w:history="1"><w:r><w:t xml:space="preserve">${e.text}</w:t></w:r><w:r><w:tab/></w:r><w:r><w:t>${e.page}</w:t></w:r></w:hyperlink></w:p>`;
  const sepTag = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx = docXml.indexOf(sepTag);
  const endIdx = docXml.indexOf(endTag, sepIdx);
  if (sepIdx < 0 || endIdx < 0) throw new Error('TOC field markers not found');
  docXml = docXml.slice(0, sepIdx + sepTag.length) + entries.map(tocRow).join('') + docXml.slice(endIdx);
  let k = 0, bid = 1000;
  docXml = docXml.replace(/<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g, (m) => {
    const t = [...m.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(x => x[1]).join('').trim();
    if (k >= entries.length || t !== entries[k].text) return m;
    const id = bid++; const a = entries[k++].anchor;
    return `<w:bookmarkStart w:id="${id}" w:name="${a}"/>${m}<w:bookmarkEnd w:id="${id}"/>`;
  });
  if (k !== entries.length) throw new Error(`TOC bookmarks matched ${k}/${entries.length}`);

  let stylesXml = await zip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    stylesXml = stylesXml.replace('</w:styles>',
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="440"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style></w:styles>');
    zip.file('word/styles.xml', stylesXml);
  }

  // Checks
  if ((docXml.match(/w:dirty=/g) || []).length) throw new Error('w:dirty flag left');
  if (docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g)) throw new Error('unescaped &');
  if (/[—–]/.test(docXml)) throw new Error('em/en dash in document');
  if (/\[@/.test(docXml)) throw new Error('unresolved citation key');
  const unused = Object.keys(REFS).filter(k2 => !order.includes(k2));
  if (unused.length) throw new Error('reference defined but never cited: ' + unused.join(', '));

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, buffer);
  console.log(`Done: ${OUT_FILE} (${(buffer.length / 1024).toFixed(0)} KB), ${order.length} references, ${entries.length} TOC rows`);
}
main().catch(err => { console.error(err); process.exit(1); });
