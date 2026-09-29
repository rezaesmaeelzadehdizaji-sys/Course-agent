// ============================================================
// generate-master-photo-request-list.mjs
// Master Photo Request List — every photo/figure across the 16
// built CPC Short Courses that is currently sourced from somewhere
// other than CPC, to hand to the CPC team as one request.
//
// Built by extracting every "Photo X.Y:" / "Figure X.Y:" caption
// from each course's current final .docx and keeping only the ones
// whose attribution is not "CPC Short Courses" or the CPC shop.
// Run: node generate-master-photo-request-list.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, PageNumber, BorderStyle, ShadingType, HeightRule,
  convertInchesToTwip, ImageRun, Table, TableRow, TableCell, WidthType,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Master Photo Request List');
const OUT_FILE  = path.join(OUT_DIR, 'Master_Photo_Request_List.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const MED_BLUE  = '2E74B5';
const DARK_BLUE = '1F3864';
const GOLD      = 'C9A84C';
const BODY      = '3C3C3C';
const GRAY      = '888888';
const HDR_BG    = '2E74B5';
const ALT_BG    = 'EBF2FA';
const CONTENT_W = 9792; // 0.85" margins on Letter

const TITLE     = 'MASTER PHOTO REQUEST LIST';
const HDR_TITLE = 'Master Photo Request List';
const FTR_TITLE = 'Master Photo Request List';

// ---------- text helpers ----------
function run(text, o = {}) {
  return new TextRun({ text, bold: o.bold || false, italics: o.italics || false, color: o.color || BODY, size: o.size || 21, font: o.font || 'Calibri' });
}
function sectionBar(title) {
  return new Paragraph({
    children: [new TextRun({ text: title, bold: true, color: 'FFFFFF', size: 24, font: 'Calibri' })],
    shading: { type: ShadingType.SOLID, color: HDR_BG },
    keepNext: true, keepLines: true,
    spacing: { before: 220, after: 90 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      left: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      right: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
    },
  });
}
function subHead(text, count) {
  const label = count !== undefined ? `${text}  (${count})` : text;
  return new Paragraph({
    children: [new TextRun({ text: label, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
    keepNext: true, keepLines: true,
    spacing: { before: 160, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  });
}
function para(text, o = {}) {
  return new Paragraph({ children: Array.isArray(text) ? text : [run(text, o)], spacing: { after: o.after !== undefined ? o.after : 120, line: 264, lineRule: 'auto' } });
}
function bullet(text, o = {}) {
  return new Paragraph({
    children: [run('•  ', { bold: true, color: MED_BLUE, size: o.size || 20 }), run(text, { size: o.size || 20 })],
    spacing: { after: o.after !== undefined ? o.after : 70, line: 250, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.18) },
  });
}
function spacer(after = 80) { return new Paragraph({ spacing: { after }, children: [] }); }

// ---------- header / footer ----------
function buildHeader() {
  return new Header({ children: [new Paragraph({
    children: [new TextRun({ text: 'CPC Short Courses  |  ', color: GRAY, size: 18, font: 'Calibri' }), new TextRun({ text: HDR_TITLE, bold: true, color: MED_BLUE, size: 18, font: 'Calibri' })],
    alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}
function buildFooter() {
  return new Footer({ children: [new Paragraph({
    children: [new TextRun({ text: `CPC Short Courses  |  ${FTR_TITLE}  |  Page `, color: GRAY, size: 18, font: 'Calibri' }), new TextRun({ children: [PageNumber.CURRENT], color: GRAY, size: 18, font: 'Calibri' }), new TextRun({ text: ' of ', color: GRAY, size: 18, font: 'Calibri' }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: GRAY, size: 18, font: 'Calibri' })],
    alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}
const pageMargin = { top: convertInchesToTwip(0.7), bottom: convertInchesToTwip(0.7), left: convertInchesToTwip(0.85), right: convertInchesToTwip(0.85) };

// ---------- generic data table ----------
const thinBdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
const cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };

function hdrCell(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: HDR_BG },
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: [new Paragraph({ spacing: { after: 0 }, children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })] })],
  });
}
function dataCell(text, w, o = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: cellBdr,
    shading: { type: ShadingType.SOLID, color: o.shade ? ALT_BG : 'FFFFFF' },
    margins: { top: 45, bottom: 45, left: 90, right: 90 },
    children: [new Paragraph({ spacing: { after: 0 }, children: [run(text, { size: o.size || 17 })] })],
  });
}

function filingTable() {
  const colW = [1500, 1700, 6592];
  const headers = ['Value', 'Lands on', 'Use it for'];
  const rows = [
    ['Barn walk', 'Farm visit', 'The barn and its systems: housing, litter, equipment, general flock views. No bird is handled.'],
    ['Bird handling', 'Farm visit', 'Needs a live bird: a comb or foot check, a chick cull, a weigh day, a blood draw, a vaccination technique.'],
    ['Bird exam', 'Necropsy session', 'External lesion on a bird before it is opened: navel, pox scabs, footpad, cage layer fatigue, HPAI external signs.'],
    ['Necropsy', 'Necropsy session', 'Once the bird is open. This is most of the list, since Course 11 teaches disease recognition through internal lesions.'],
    ['Plant', 'Plant visit', 'The processing floor itself. Needs arranged plant access, not a farm visit or a necropsy table.'],
    ['Equipment / product', 'Vendor or lab supply', 'A device, kit, or sample photographed on its own. No bird in frame at all.'],
    ['Diagram', 'CPC redraw', 'Not a photograph. An anatomy or process diagram currently redrawn from a textbook or manufacturer source; needs original CPC artwork, not a photo shoot.'],
  ];
  const bodyRows = rows.map((r, ri) => new TableRow({
    cantSplit: true,
    children: r.map((c, ci) => dataCell(c, colW[ci], { shade: ri % 2 === 1, size: 18 })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => hdrCell(h, colW[i])) }), ...bodyRows],
  });
}

function photoTable(items) {
  const colW = [420, 620, 800, 4552, 3400];
  const headers = ['#', 'Course', 'Ref', 'What CPC needs to supply', 'Current source (remove once replaced)'];
  const bodyRows = items.map((it, i) => new TableRow({
    cantSplit: true,
    children: [
      dataCell(String(it.seq), colW[0]),
      dataCell(`C${it.course}`, colW[1]),
      dataCell(it.ref, colW[2]),
      dataCell(it.need, colW[3]),
      dataCell(it.source, colW[4], { size: 16 }),
    ],
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => hdrCell(h, colW[i])) }), ...bodyRows],
  });
}

// ============================================================
// DATA — every non-CPC-sourced Photo/Figure caption found across
// the 16 built courses (Course 3, 4, 7, 9, 16 had none). Excludes:
//  - captions sourced solely to "CPC Learning Centre" (already CPC's own)
//  - Course 5's 7 uncaptioned SVG figures (diagrams, not real photos)
//  - Course 7's 31 AI-rendered placeholders (already tracked in
//    "Course 7/requested photos.docx", a separate, existing list)
// ============================================================

const DATA = {
  'Barn walk': [
    { course: 5,  ref: 'Photo 1.1', need: 'Front exterior or wide interior shot of a Canadian commercial broiler barn.', source: 'Chicken Farmers of Canada, CC BY 2.0' },
    { course: 13, ref: 'Photo 4.1', need: 'A conventional battery cage next to enriched cage systems with nesting curtains and scratch pads.', source: 'Egg Farmers of Alberta (eggs.ab.ca)' },
    { course: 13, ref: 'Photo 4.2', need: 'Three cage-free layer housing systems: floor housing, a multi-tier aviary, and free range with outdoor access.', source: 'Egg Farmers of Alberta (eggs.ab.ca)' },
    { course: 13, ref: 'Photo 4.3', need: 'A broiler breeder barn on floor housing, with nest boxes and feed and water lines.', source: 'Chicken Farmers of Canada (chicken.ca)' },
    { course: 13, ref: 'Photo 5.2', need: 'Dry, friable litter next to dark, wet, caked litter, side by side.', source: 'fresheggsdaily.blog and fidarfeed.com' },
    { course: 14, ref: 'Photo 4.1', need: 'A suspended automatic weigh platform at bird level, shown early in the flock with chicks on it.', source: 'anyload.com' },
  ],
  'Bird handling': [
    { course: 5,  ref: 'Photo 4.1', need: 'Day-old broiler chicks arriving and settling at placement, spread out on litter with feed and water in reach.', source: 'USDA/Joe Valbuena, public domain' },
    { course: 6,  ref: 'Photo 2.1', need: "Close view of a live hen's comb and eye, showing healthy color.", source: 'Wikimedia Commons, CC BY 2.0' },
    { course: 6,  ref: 'Photo 2.2', need: 'A healthy chicken foot, top and bottom, with smooth shanks and an unblemished pad.', source: 'Aviagen' },
    { course: 6,  ref: 'Photo 5.1', need: 'A healthy commercial white leghorn laying hen, live, showing comb, eyes, and posture.', source: 'USDA Agricultural Research Service / Stephen Ausmus, Public Domain' },
    { course: 8,  ref: 'Photo 4.1', need: "Classic dry-form fowl pox lesions on a live bird's comb and wattles.", source: 'Lucyin, CC BY-SA 4.0' },
    { course: 8,  ref: 'Photo 4.3', need: 'A confirmed wing web vaccination take nodule at the stab site.', source: 'Tesfaye YT et al., Acta Vet Scand. 2022;64:38, CC BY 4.0' },
    { course: 12, ref: 'Photo 1.1', need: 'Day-old chicks settling in at placement, active and spread across fresh litter, chick check underway.', source: 'cobbgenetics.com' },
    { course: 12, ref: 'Photo 2.1', need: 'Common chick culls in one frame: cross-beak, splayed or twisted legs, twisted neck, infected navel, labored breathing.', source: 'salto.com.ph; ceva.vn; Olkowski et al., Acta Vet Scand 2019; Taha & Mohammed, J Educ Sci 2022' },
    { course: 12, ref: 'Photo 3.1', need: 'Manual cervical dislocation shown step by step: securing the bird, gripping the head, the stretch that separates the neck at the skull base.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 12, ref: 'Photo 3.4', need: 'Decapitation setups: a restraining cone for a larger bird, hand-held shears for a chick.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 13, ref: 'Photo 3.2', need: "Keel bone check on a live bird: fingers running the length of the keel to feel for a fracture.", source: 'Kittelsen et al., Avian Pathology 2023 (palpation panel)' },
    { course: 13, ref: 'Photo 3.3', need: 'How feather pecking escalates: broken feathers, a balding patch, irritated skin, an open bleeding wound.', source: 'Aviagen Brief, Feathering in Broiler Breeder Females, 2024; Poultry Hub Australia' },
    { course: 15, ref: 'Photo 4.1', need: 'Wing (brachial) vein blood collection technique on a live chicken, shown from three angles.', source: 'Norecopa (norecopa.no); Kelly & Alworth, Lab Anim 2013;42:359-361' },
  ],
  'Bird exam': [
    { course: 5,  ref: 'Photo 4.3', need: 'Footpad dermatitis scored 0 to 2 on a broiler foot: normal, mild hyperkeratosis, and a failing lesion with hemorrhage or swelling.', source: 'American Association of Avian Pathologists, 2022' },
    { course: 10, ref: 'Photo 3.1', need: 'Head-to-toe outside check on a bird before it is opened: feathers, skin, head, legs, feet, hocks, footpads, keel.', source: 'Cobb Post Mortem Guide, Breeders, 2022' },
    { course: 11, ref: 'Photo 4.4', need: 'Chick navels showing omphalitis: a red, hyperemic unhealed navel and an unabsorbed yolk sac.', source: 'ASA Handbook on Poultry Diseases; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 4.9', need: 'External HPAI signs: facial swelling, a cyanotic blue-purple comb and wattle, hemorrhages on the shanks and feet.', source: 'Diseases of Poultry, 14th ed.; Picture Book of Infectious Poultry Diseases (FAO-CEVA); CEVA Handbook of Poultry Diseases; ASA Handbook on Poultry Diseases' },
    { course: 11, ref: 'Photo 4.16', need: 'A dehydrated bird with sunken eyes and dry, tacky breast muscle (external panel of a dehydration/gout composite).', source: 'Elanco Broiler Disease Reference Guide; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 5.9', need: 'Fowl pox in two forms: scabby comb and face nodules (dry form), caseous plaques lining the mouth and throat (wet form).', source: 'CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 5.11', need: 'A hen down and unable to stand, thin broken eggshells, and a soft deformed keel bone (cage layer fatigue).', source: 'Merck Veterinary Manual (msdvetmanual.com)' },
    { course: 13, ref: 'Photo 3.1', need: 'Footpad dermatitis and hock burn on a commercial broiler, foot and hock in one frame.', source: 'USDA Agricultural Research Service, public domain' },
    { course: 18, ref: 'Photo 2.2', need: 'External HPAI signs: swollen face, blue-purple comb and wattles, bruising on the shanks and feet.', source: 'Diseases of Poultry, 14th ed.; Picture Book of Infectious Poultry Diseases (FAO-CEVA); CEVA Handbook of Poultry Diseases; ASA Handbook on Poultry Diseases' },
  ],
  'Necropsy': [
    { course: 6,  ref: 'Photo 3.1', need: 'Proventriculus and gizzard removed from a chicken, plus a gizzard opened to show the koilin lining.', source: 'Wikimedia Commons / Bjferstern, CC BY-SA 3.0' },
    { course: 6,  ref: 'Photo 3.3', need: 'Skeletal and muscular anatomy of the chicken: muscle groups on one side, the labeled skeleton on the other.', source: 'USDA' },
    { course: 10, ref: 'Photo 2.5', need: 'Full necropsy routine in six steps: euthanize, open the beak, open the body wall, lift the breast plate, work through the organs, open the skull.', source: 'Cobb Post Mortem Guide, Breeders, 2022' },
    { course: 10, ref: 'Photo 3.4', need: 'The syrinx exposed, a pair of healthy lungs lifted out, and the abdominal air sacs in a normal bird.', source: 'Cobb Post Mortem Guide, Breeders, 2022 (2 panels); Li W et al., Scientific Reports 2020 (1 panel)' },
    { course: 10, ref: 'Photo 3.7', need: 'Proventriculus and gizzard with a ruler for scale, plus a gizzard opened to show the koilin lining.', source: 'Wikimedia Commons / Bjferstern, CC BY-SA 3.0' },
    { course: 10, ref: 'Photo 3.10', need: 'A laying hen opened up with the reproductive tract still in place: pre-ovulatory follicles and an active oviduct.', source: 'Apperson et al., Veterinary Sciences 2017, CC BY 4.0' },
    { course: 10, ref: 'Photo 4.1', need: 'Meat-bird musculoskeletal check in three views: breast muscle, leg and foot, a long bone cut to show the growth plate.', source: 'Cobb Post Mortem Guide, Breeders, 2022' },
    { course: 10, ref: 'Photo 4.2', need: 'Gut opened segment by segment, crop through ceca, showing normal lining and contents.', source: 'USDA' },
    { course: 10, ref: 'Photo 5.1', need: "Hen's reproductive tract lifted out and laid flat: graded follicles F1 through F5, oviduct to the shell gland.", source: 'Apperson et al., Veterinary Sciences 2017, CC BY 4.0' },
    { course: 11, ref: 'Photo 4.1', need: 'Opened bird showing airsacculitis, fibrinous pericarditis and perihepatitis, and peritonitis (colibacillosis).', source: 'Diseases of Poultry, 14th ed.; Elanco Broiler Disease Reference Guide' },
    { course: 11, ref: 'Photo 4.2', need: 'Opened small intestine with the dark diphtheritic membrane and raised necrotic plaques of necrotic enteritis.', source: 'ASA Handbook on Poultry Diseases; Elanco Broiler Disease Reference Guide; Vegad JL, A Colour Atlas of Poultry Diseases' },
    { course: 11, ref: 'Photo 4.3', need: 'Air sacs at four severity grades, from a hazy mild air sac to one packed with caseous exudate.', source: 'ASA Handbook on Poultry Diseases; Elanco Broiler Disease Reference Guide' },
    { course: 11, ref: 'Photo 4.5', need: 'Staphylococcosis findings: an opened infected joint, femoral head necrosis, a green septicemic liver, gangrenous dermatitis, bumblefoot scabs.', source: 'Merck Veterinary Manual; Diseases of Poultry, 14th ed.; Elanco Broiler Disease Reference Guide' },
    { course: 11, ref: 'Photo 4.6', need: 'Infectious bronchitis: a swollen wet face, mottled urate-studded kidneys, a congested opened trachea.', source: 'Picture Book of Infectious Poultry Diseases (FAO-CEVA); Important Poultry Diseases, Intervet; CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 4.7', need: 'Range of IBD lesions: muscle and proventricular hemorrhages, a swollen versus hemorrhagic bursa, urate-studded kidneys.', source: 'CEVA Handbook of Poultry Diseases; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 4.8', need: 'Virulent Newcastle disease: torticollis in a live bird, proventricular hemorrhages, tracheal and intestinal bleeding, cecal tonsil hemorrhage.', source: 'CEVA Handbook of Poultry Diseases; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 4.11', need: 'Reovirus in two forms: a swollen hock and tendon sheath with exudate, and helicopter disease with a shrunken pancreas.', source: 'CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 4.12', need: 'Opened intestine and cecum with Ascaridia roundworms, Capillaria hairworms, and Heterakis cecal worms.', source: 'Elanco Broiler Disease Reference Guide; Aviagen; Chicken Scratch (The Foundry)' },
    { course: 11, ref: 'Photo 4.13', need: "Ascites: an opened abdomen filled with straw-colored fluid, plus an enlarged right ventricle beside a normal heart.", source: 'Elanco Broiler Disease Reference Guide; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 4.15', need: 'Broiler skeletal conditions: spondylolisthesis with a displaced vertebra, valgus leg deviation, tibial dyschondroplasia cartilage plugs.', source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 4.17', need: 'Aspergillosis nodules studding the lung and air sacs, plus a cerebral granuloma in a disseminated case.', source: 'Elanco Broiler Disease Reference Guide; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 5.1', need: 'Hemorrhagic ovarian follicles, yolk peritonitis filling the abdomen, shrunken atretic follicles in a hen.', source: 'Vegad JL, A Colour Atlas of Poultry Diseases' },
    { course: 11, ref: 'Photo 5.2', need: 'Opened oviduct packed with caseous pus, and a severe case with a layered lash egg.', source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 5.3', need: 'Fowl cholera: a swollen fibrinous wattle, heart-surface blood spots, necrotic liver spots, pleuropneumonia.', source: 'CEVA Handbook of Poultry Diseases; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 5.4', need: 'MG sinusitis and airsacculitis, plus MS synovitis with a swollen hock and gelatinous exudate.', source: 'CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 5.5', need: "Marek's disease range: a gray discolored iris, thickened skin and feather follicles, mesenteric and ovarian tumors, sciatic nerve swelling.", source: 'Roman Halouzka, Wikimedia Commons, CC BY-SA 3.0' },
    { course: 11, ref: 'Photo 5.6', need: 'A cystic oviduct from early IBV and hemorrhagic follicles from Newcastle disease, with the misshapen and thin-shelled eggs they produce.', source: 'Picture Book of Infectious Poultry Diseases (FAO-CEVA)' },
    { course: 11, ref: 'Photo 5.7', need: 'ILT conjunctivitis and an opened trachea showing bloody mucus, blood-streaked plugs, and a caseous plug.', source: 'Diseases of Poultry, 14th ed.; CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 5.8', need: 'Swollen heads in broilers and breeders, infraorbital sinusitis in turkeys, serofibrinous exudate and ovary inflammation (aMPV).', source: 'CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 5.10', need: 'A dark blood clot on a pale, fat-laden liver, the giveaway for fatty liver hemorrhagic syndrome.', source: 'CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 6.1', need: 'Duck plague lesions: proventricular and esophageal hemorrhage, intestinal ulcers, a necrotic liver and spleen.', source: 'Merck Veterinary Manual (merckvetmanual.com)' },
    { course: 11, ref: 'Photo 6.2', need: 'Bleeding from the nares and an enlarged liver studded with hemorrhagic foci in a duckling.', source: 'ASA Handbook on Poultry Diseases; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 6.3', need: "A pale dilated heart, an enlarged fibrin-coated liver, an inflamed intestine (Derzsy's disease).", source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 6.4', need: 'Fibrinous exudate coating the heart and spreading over the liver in new duck disease (Riemerellosis).', source: 'Diseases of Poultry, 14th ed.; Merck Veterinary Manual' },
    { course: 11, ref: 'Photo 7.1', need: 'Severe duodenal bleeding and an enlarged, mottled spleen in hemorrhagic enteritis.', source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 7.2', need: 'Target-like necrotic liver nodules and caseous cecal cores in turkey blackhead (histomoniasis).', source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 8.1', need: 'Pigeon paramyxovirus torticollis and a spinal cord cross section showing hemorrhage.', source: 'CEVA Handbook of Poultry Diseases; Oltramari de Souza et al., Pesq Vet Bras 2018' },
    { course: 18, ref: 'Photo 3.1', need: 'A fluid-filled cystic oviduct from an IBV-infected pullet, the false-layer lesion behind DMV/1639.', source: 'Picture Book of Infectious Poultry Diseases (FAO-CEVA)' },
    { course: 18, ref: 'Photo 3.3', need: 'aMPV findings at necropsy: exudate packing the head and inflamed ovary tissue.', source: 'CEVA Handbook of Poultry Diseases' },
  ],
  'Plant': [
    { course: 17, ref: 'Photo 5.1', need: 'A federally inspected poultry processing line, the stage where a bird becomes food.', source: 'meatpoultry.com' },
  ],
  'Equipment / product': [
    { course: 5,  ref: 'Photo 5.1', need: 'Solar panels installed on a Canadian barn roof.', source: 'Robin Stott / geograph.org.uk, CC BY-SA 2.0' },
    { course: 12, ref: 'Photo 3.2', need: 'The three KED device sizes and correct placement at the skull base.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 12, ref: 'Photo 3.3', need: 'The non-penetrating captive bolt device and correct head placement.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 12, ref: 'Photo 3.5', need: 'A CO2 euthanasia station: cylinders, regulator, sealed chamber, exhaust fan.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 13, ref: 'Photo 5.3', need: 'A handheld light meter (lux meter) used to check barn light levels.', source: 'daltonsupplies.com' },
    { course: 15, ref: 'Photo 2.1', need: 'A commercial ELISA test kit: microplates, standards, conjugate, substrate, stop solution.', source: 'Romer Labs (AgraQuant)' },
    { course: 15, ref: 'Photo 2.2', need: 'Plate agglutination test drops for Mycoplasma gallisepticum: a smooth negative drop next to a clumped positive.', source: 'Kabir A, et al. Eur J Agric Food Sci. 2021' },
    { course: 15, ref: 'Photo 5.1', need: 'Three spun blood tubes side by side: EDTA whole blood, heparin plasma, clear serum.', source: 'Wikimedia Commons, Uwe Gille' },
    { course: 17, ref: 'Photo 5.2', need: 'A culture plate of bacterial colonies grown from a raw poultry sample.', source: 'meatpoultry.com' },
  ],
  'Diagram (CPC redraw, not a photo)': [
    { course: 6,  ref: 'Figure 3.1', need: 'Labeled internal-anatomy diagram of the chicken showing all major organ systems.', source: 'Purina Animal Nutrition LLC' },
    { course: 6,  ref: 'Figure 3.2', need: 'Digestive-tract diagram from gizzard outlet to vent.', source: 'USDA' },
    { course: 6,  ref: 'Figure 3.4', need: 'Hen and rooster reproductive-tract diagram.', source: 'USDA' },
    { course: 6,  ref: 'Figure 3.5', need: 'Avian urinary-system diagram, kidneys and ureters to the cloaca.', source: 'USDA, Happy Morning Farm LLC' },
    { course: 10, ref: 'Figure 5.1', need: "Working diagram of the hen's reproductive tract with timing per section.", source: 'Cobb Post Mortem Guide, Breeders, 2022 (illustration)' },
    { course: 12, ref: 'Figure 5.1', need: 'The three field checks for confirming death diagram.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 15, ref: 'Figure 2.2', need: 'The HI test principle diagram alongside a real result plate.', source: 'microbenotes.com' },
    { course: 15, ref: 'Figure 4.1', need: 'Diagonal-walk sampling diagram.', source: 'BioChek Interpretation and Application of Results Manual' },
  ],
};

// ============================================================
// ASSEMBLY
// ============================================================
const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
const C = [];

let totalCount = 0;
for (const k of Object.keys(DATA)) totalCount += DATA[k].length;

// cover block
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: 'CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })] }));
if (logoBuffer) C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new ImageRun({ data: logoBuffer, transformation: { width: 90, height: 90 }, type: 'png' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: TITLE, bold: true, color: DARK_BLUE, size: 36, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Photos to request from the CPC team, across all built courses', italics: true, color: MED_BLUE, size: 22, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 90 }, children: [new TextRun({ text: '___________________________________', color: GOLD, size: 22, font: 'Calibri' })] }));

C.push(para(`Every course was scanned for every "Photo" and "Figure" caption in its current final file, and each one was checked against its Source line. This list keeps only the ${totalCount} that are currently attributed to somewhere other than CPC: textbooks, journal articles, manufacturer sites, and Wikimedia Commons among them. Once CPC supplies a real replacement for an item below, that item drops out and the course gets rebuilt with the new photo and a "Source: CPC Short Courses" caption.`, { after: 80 }));
C.push(para('Courses 3, 4, 7, 9, and 16 have no items on this list; every photo and figure in those four is already CPC-owned. Course 5 also has seven diagrams with no source line at all (they are CPC\'s own charts, just missing a caption) and Course 7 has 31 AI-rendered placeholder photos awaiting real replacements. Neither of those is a borrowed photo, so neither is on this list; the Course 7 placeholders already have their own tracking document at Course 7/requested photos.docx.', { after: 0 }));

// FILING SYSTEM
C.push(sectionBar('How This List Is Filed'));
C.push(para('Every item below is tagged with one of these seven values. The value tells CPC what kind of session produces the replacement, not what course it is for.', { after: 100 }));
C.push(filingTable());
C.push(spacer(100));
C.push(bullet('Necropsy carries most of the list (39 of 85) because Course 11 teaches disease recognition almost entirely through internal lesions; nearly every disease profile in that course needs a real opened-bird photo.'));
C.push(bullet('Bird exam is its own line, separate from Necropsy, because the lesion is external and disappears once the bird is opened. It has to be caught before the bird goes on the table.'));
C.push(bullet('Plant is its own line because a processing-line photo needs arranged plant access. It is not a farm visit and not a necropsy-table shot.'));
C.push(bullet('Equipment / product items need no bird and no farm visit at all: a device, a kit, or a sample photographed on a bench is enough.'));
C.push(bullet('Diagram items are not photo requests. CPC cannot "go shoot" an anatomy diagram; these need an illustrator to redraw them in CPC\'s own style, not a photo day.'));
C.push(bullet('No status column. This list only reflects what each course currently shows; it does not track what has already been sent or delivered.'));
C.push(bullet('The table carries no prose beyond the "what CPC needs to supply" cell; context and reasoning live in this section, not in the list itself.'));

// PER-CATEGORY LISTS
let seq = 0;
for (const [cat, items] of Object.entries(DATA)) {
  C.push(sectionBar(cat));
  const rows = items
    .slice()
    .sort((a, b) => a.course - b.course)
    .map(it => { seq++; return { seq, ...it }; });
  C.push(photoTable(rows));
  C.push(spacer(60));
}

C.push(sectionBar('Notes for CPC'));
C.push(bullet('Where "What CPC needs to supply" describes several panels in one item (for example, a lesion composite in Course 11), one real photo per panel is the ideal outcome; a single strong photo of the most important panel is an acceptable start.'));
C.push(bullet('Shots should be real Canadian commercial-flock conditions wherever the subject allows it, landscape orientation where possible, and well lit.'));
C.push(bullet('Where a lesion or clinical sign is the point of the photo, it must be clearly visible; use a close-up if needed.'));
C.push(bullet('This list regenerates from the courses themselves. As photos land, rerun the extraction against the updated course files and this list shrinks.'));

// ============================================================
// WRITE + PATCH
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const doc = new Document({ sections: [{ properties: { page: { margin: pageMargin } }, headers: { default: buildHeader() }, footers: { default: buildFooter() }, children: C }] });
fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));
console.log('Written:', OUT_FILE, fs.statSync(OUT_FILE).size, 'bytes');
console.log('Total items:', seq);

const zip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));
let xml = await zip.file('word/document.xml').async('string');
xml = xml.replace(/\sw:dirty="true"/g, '');
zip.file('word/document.xml', xml);
let settings = await zip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
if (!settings.includes('w:updateFields')) settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
zip.file('word/settings.xml', settings);
fs.writeFileSync(OUT_FILE, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log('Em dashes (must be 0):', (xml.match(/—/g) || []).length, '| En dashes (must be 0):', (xml.match(/–/g) || []).length);
console.log('Done:', OUT_FILE);
