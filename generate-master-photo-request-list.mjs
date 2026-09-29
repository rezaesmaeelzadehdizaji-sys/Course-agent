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

function dupTable(items) {
  const colW = [420, 620, 800, 7952];
  const headers = ['#', 'Course', 'Ref', 'Matched CPC Factsheet request (already covers this)'];
  const bodyRows = items.map((it, i) => new TableRow({
    cantSplit: true,
    children: [
      dataCell(String(i + 1), colW[0]),
      dataCell(`C${it.course}`, colW[1]),
      dataCell(it.ref, colW[2]),
      dataCell(it.matched, colW[3], { size: 16 }),
    ],
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => hdrCell(h, colW[i])) }), ...bodyRows],
  });
}

// ============================================================
// DATA — every real-world (farm/animal) Photo across the 16 built
// courses that is not a genuine CPC-owned photo. Two ways an item
// lands here:
//   (a) Borrowed — sourced from a textbook, journal, manufacturer
//       site, or Wikimedia, with a real attribution shown in the
//       course.
//   (b) AI-generated — an AI-rendered placeholder with no real
//       source at all, currently captioned "Source: CPC Short
//       Courses" like a genuine photo, which is indistinguishable
//       from a real one by caption text alone.
// Diagrams, charts, and infographics (Figure captions) are excluded
// on purpose, whatever their origin — the user has confirmed those
// are fine as-is and are not part of this request.
// Also excluded: captions sourced solely to "CPC Learning Centre"
// (already CPC's own).
// ============================================================

const DATA = {
  'Barn walk': [
    { course: 3,  ref: 'Photo 6.1', need: 'A Danish-entry biosecurity setup at a barn door: clean/dirty line, bench, boot change, footbath.', source: 'AI-generated placeholder, no real source (same AI image also used as Course 7 Photo 7 and Course 14 Photo 2.3)' },
    { course: 5,  ref: 'Photo 1.1', need: 'Front exterior or wide interior shot of a Canadian commercial broiler barn.', source: 'Chicken Farmers of Canada, CC BY 2.0' },
    { course: 7,  ref: 'Photo 1',   need: 'Modern Canadian commercial barn exterior with a digital flock-management monitor at the entrance and a rainwater treatment setup.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 2',   need: 'Interior wide shot of a modern Canadian cage-free or enriched layer barn.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 3',   need: 'Interior of a Canadian commercial turkey grow-out barn with mature toms on dry shavings.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 4',   need: 'Canadian commercial waterfowl operation: ducks or geese housed with bell drinkers or a pond area, dry bedding.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 6',   need: 'Outside of a barn showing contamination entry points: wild birds near vents, tire tracks, an open feed hopper.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 7',   need: 'A Danish-entry biosecurity setup at a barn door with brooding chicks visible on the clean side.', source: 'AI-generated placeholder, no real source (same image reused in Course 3 Photo 6.1, Course 14 Photo 2.3; one real photo fixes all three)' },
    { course: 7,  ref: 'Photo 12',  need: 'A broiler house at 2 to 5 weeks during an inclusion body hepatitis outbreak, scattered mortality on the litter.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 19',  need: 'A layer flock during an IBV hit: thin-shelled or misshapen eggs on the collection belt, barn visible behind.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 26',  need: 'A turkey barn at 4 to 12 weeks during hemorrhagic enteritis: bloody droppings, sudden-death birds scattered.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 30',  need: 'Mixed-species farm risk scene: chickens, turkeys, and ducks or geese close together, ideally with a wild bird in frame.', source: 'AI-generated placeholder, no real source' },
    { course: 13, ref: 'Photo 4.1', need: 'A conventional battery cage next to enriched cage systems with nesting curtains and scratch pads.', source: 'Egg Farmers of Alberta (eggs.ab.ca)' },
    { course: 13, ref: 'Photo 4.2', need: 'Three cage-free layer housing systems: floor housing, a multi-tier aviary, and free range with outdoor access.', source: 'Egg Farmers of Alberta (eggs.ab.ca)' },
    { course: 13, ref: 'Photo 4.3', need: 'A broiler breeder barn on floor housing, with nest boxes and feed and water lines.', source: 'Chicken Farmers of Canada (chicken.ca)' },
    { course: 14, ref: 'Photo 2.3', need: 'Biosecurity entry at a commercial poultry barn: clean coveralls and a boot dip station.', source: 'AI-generated placeholder, no real source (duplicate of Course 7 Photo 7)' },
  ],
  'Bird handling': [
    { course: 5,  ref: 'Photo 4.1', need: 'Day-old broiler chicks arriving and settling at placement, spread out on litter with feed and water in reach.', source: 'USDA/Joe Valbuena, public domain' },
    { course: 6,  ref: 'Photo 2.1', need: "Close view of a live hen's comb and eye, showing healthy color.", source: 'Wikimedia Commons, CC BY 2.0' },
    { course: 6,  ref: 'Photo 2.2', need: 'A healthy chicken foot, top and bottom, with smooth shanks and an unblemished pad.', source: 'Aviagen' },
    { course: 6,  ref: 'Photo 5.1', need: 'A healthy commercial white leghorn laying hen, live, showing comb, eyes, and posture.', source: 'USDA Agricultural Research Service / Stephen Ausmus, Public Domain' },
    { course: 8,  ref: 'Photo 4.3', need: 'A confirmed wing web vaccination take nodule at the stab site.', source: 'Tesfaye YT et al., Acta Vet Scand. 2022;64:38, CC BY 4.0' },
    { course: 12, ref: 'Photo 1.1', need: 'Day-old chicks settling in at placement, active and spread across fresh litter, chick check underway.', source: 'cobbgenetics.com' },
    { course: 12, ref: 'Photo 2.1', need: 'Common chick culls in one frame: cross-beak, splayed or twisted legs, twisted neck, infected navel, labored breathing.', source: 'salto.com.ph; ceva.vn; Olkowski et al., Acta Vet Scand 2019; Taha & Mohammed, J Educ Sci 2022' },
    { course: 12, ref: 'Photo 3.1', need: 'Manual cervical dislocation shown step by step: securing the bird, gripping the head, the stretch that separates the neck at the skull base.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 12, ref: 'Photo 3.4', need: 'Decapitation setups: a restraining cone for a larger bird, hand-held shears for a chick.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 13, ref: 'Photo 3.2', need: "Keel bone check on a live bird: fingers running the length of the keel to feel for a fracture.", source: 'Kittelsen et al., Avian Pathology 2023 (palpation panel)' },
    { course: 13, ref: 'Photo 3.3', need: 'How feather pecking escalates: broken feathers, a balding patch, irritated skin, an open bleeding wound.', source: 'Aviagen Brief, Feathering in Broiler Breeder Females, 2024; Poultry Hub Australia' },
    { course: 15, ref: 'Photo 4.1', need: 'Wing (brachial) vein blood collection technique on a live chicken, shown from three angles.', source: 'Norecopa (norecopa.no); Kelly & Alworth, Lab Anim 2013;42:359-361' },
    { course: 7,  ref: 'Photo 10',  need: 'Broilers showing respiratory signs at flock level: swollen sinuses, watery eyes, nasal discharge, open-mouth breathing.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 13',  need: 'A broiler with obvious ascites, held by a farmer or photographed in-pen to show the distended belly.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 31',  need: 'A single sick broiler pulled out and placed in an isolation pen with clean water, dry bedding, a heat lamp.', source: 'AI-generated placeholder, no real source' },
  ],
  'Bird exam': [
    { course: 7,  ref: 'Photo 8',   need: 'Close-up of broiler droppings showing bloody or tarry coccidiosis-type droppings, depressed bird in the background.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 11',  need: 'White, chalky, watery IBD-type droppings on broiler litter, with a ruffled, depressed bird in the same frame.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 14',  need: 'Necrotic enteritis field picture: foul, loose, orange-brown or mucoid droppings, depressed birds nearby.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 18',  need: 'A layer osteoporosis / cage-fatigue hen: collapsed, unable to stand, visibly deformed keel.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 21',  need: 'A duck or goose with botulism "limberneck": neck drooped, head unable to be held up.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 22',  need: 'An adult duck with Duck Viral Enteritis: visible blood around the bill or vent, dead bird on the ground.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 23',  need: 'A young duckling under 3 weeks with Duck Virus Hepatitis: fallen on its side, head thrown back in opisthotonos.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 24',  need: "Goslings or young Muscovy ducklings with Derzsy's disease: lethargic, poor feathering, stunted.", source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 25',  need: 'A duckling 1 to 7 weeks old with Riemerellosis: watery eyes, greenish diarrhea, head tremor.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 27',  need: 'A turkey with Histomoniasis (Blackhead): depressed bird, sulfur-colored droppings behind it.', source: 'AI-generated placeholder, no real source' },
    { course: 7,  ref: 'Photo 29',  need: 'A feral or racing pigeon with PPMV-1 neurological signs: twisted neck or opisthotonos, perched on a barn roofline.', source: 'AI-generated placeholder, no real source' },
    { course: 10, ref: 'Photo 3.1', need: 'Head-to-toe outside check on a bird before it is opened: feathers, skin, head, legs, feet, hocks, footpads, keel.', source: 'Cobb Post Mortem Guide, Breeders, 2022' },
    { course: 11, ref: 'Photo 4.9', need: 'External HPAI signs: facial swelling, a cyanotic blue-purple comb and wattle, hemorrhages on the shanks and feet.', source: 'Diseases of Poultry, 14th ed.; Picture Book of Infectious Poultry Diseases (FAO-CEVA); CEVA Handbook of Poultry Diseases; ASA Handbook on Poultry Diseases' },
    { course: 11, ref: 'Photo 4.16', need: 'A dehydrated bird with sunken eyes and dry, tacky breast muscle (external panel of a dehydration/gout composite).', source: 'Elanco Broiler Disease Reference Guide; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 5.11', need: 'A hen down and unable to stand, thin broken eggshells, and a soft deformed keel bone (cage layer fatigue).', source: 'Merck Veterinary Manual (msdvetmanual.com)' },
    { course: 18, ref: 'Photo 2.2', need: 'External HPAI signs: swollen face, blue-purple comb and wattles, bruising on the shanks and feet.', source: 'Diseases of Poultry, 14th ed.; Picture Book of Infectious Poultry Diseases (FAO-CEVA); CEVA Handbook of Poultry Diseases; ASA Handbook on Poultry Diseases' },
  ],
  'Necropsy': [
    { course: 6,  ref: 'Photo 3.1', need: 'Proventriculus and gizzard removed from a chicken, plus a gizzard opened to show the koilin lining.', source: 'Wikimedia Commons / Bjferstern, CC BY-SA 3.0' },
    { course: 6,  ref: 'Photo 3.3', need: 'Skeletal and muscular anatomy of the chicken: muscle groups on one side, the labeled skeleton on the other.', source: 'USDA' },
    { course: 10, ref: 'Photo 2.5', need: 'Full necropsy routine in six steps: euthanize, open the beak, open the body wall, lift the breast plate, work through the organs, open the skull.', source: 'Cobb Post Mortem Guide, Breeders, 2022' },
    { course: 10, ref: 'Photo 3.3', need: 'The heart in place at the front of the opened chest, in its normal position and orientation.', source: 'AI-generated placeholder, no real source' },
    { course: 10, ref: 'Photo 3.4', need: 'The syrinx exposed, a pair of healthy lungs lifted out, and the abdominal air sacs in a normal bird.', source: 'Cobb Post Mortem Guide, Breeders, 2022 (2 panels); Li W et al., Scientific Reports 2020 (1 panel)' },
    { course: 10, ref: 'Photo 3.8', need: 'The full digestive tract laid out from front to back, crop through cloaca, at necropsy.', source: 'AI-generated placeholder, no real source' },
    { course: 10, ref: 'Photo 3.7', need: 'Proventriculus and gizzard with a ruler for scale, plus a gizzard opened to show the koilin lining.', source: 'Wikimedia Commons / Bjferstern, CC BY-SA 3.0' },
    { course: 10, ref: 'Photo 3.10', need: 'A laying hen opened up with the reproductive tract still in place: pre-ovulatory follicles and an active oviduct.', source: 'Apperson et al., Veterinary Sciences 2017, CC BY 4.0' },
    { course: 10, ref: 'Photo 4.1', need: 'Meat-bird musculoskeletal check in three views: breast muscle, leg and foot, a long bone cut to show the growth plate.', source: 'Cobb Post Mortem Guide, Breeders, 2022' },
    { course: 10, ref: 'Photo 4.2', need: 'Gut opened segment by segment, crop through ceca, showing normal lining and contents.', source: 'USDA' },
    { course: 10, ref: 'Photo 5.1', need: "Hen's reproductive tract lifted out and laid flat: graded follicles F1 through F5, oviduct to the shell gland.", source: 'Apperson et al., Veterinary Sciences 2017, CC BY 4.0' },
    { course: 11, ref: 'Photo 4.2', need: 'Opened small intestine with the dark diphtheritic membrane and raised necrotic plaques of necrotic enteritis.', source: 'ASA Handbook on Poultry Diseases; Elanco Broiler Disease Reference Guide; Vegad JL, A Colour Atlas of Poultry Diseases' },
    { course: 11, ref: 'Photo 4.3', need: 'Air sacs at four severity grades, from a hazy mild air sac to one packed with caseous exudate.', source: 'ASA Handbook on Poultry Diseases; Elanco Broiler Disease Reference Guide' },
    { course: 11, ref: 'Photo 4.5', need: 'Staphylococcosis findings: an opened infected joint, femoral head necrosis, a green septicemic liver, gangrenous dermatitis, bumblefoot scabs.', source: 'Merck Veterinary Manual; Diseases of Poultry, 14th ed.; Elanco Broiler Disease Reference Guide' },
    { course: 11, ref: 'Photo 4.6', need: 'Infectious bronchitis: a swollen wet face, mottled urate-studded kidneys, a congested opened trachea.', source: 'Picture Book of Infectious Poultry Diseases (FAO-CEVA); Important Poultry Diseases, Intervet; CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 4.7', need: 'Range of IBD lesions: muscle and proventricular hemorrhages, a swollen versus hemorrhagic bursa, urate-studded kidneys.', source: 'CEVA Handbook of Poultry Diseases; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 4.8', need: 'Virulent Newcastle disease: torticollis in a live bird, proventricular hemorrhages, tracheal and intestinal bleeding, cecal tonsil hemorrhage.', source: 'CEVA Handbook of Poultry Diseases; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 4.15', need: 'Broiler skeletal conditions: spondylolisthesis with a displaced vertebra, valgus leg deviation, tibial dyschondroplasia cartilage plugs.', source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 4.17', need: 'Aspergillosis nodules studding the lung and air sacs, plus a cerebral granuloma in a disseminated case.', source: 'Elanco Broiler Disease Reference Guide; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 5.1', need: 'Hemorrhagic ovarian follicles, yolk peritonitis filling the abdomen, shrunken atretic follicles in a hen.', source: 'Vegad JL, A Colour Atlas of Poultry Diseases' },
    { course: 11, ref: 'Photo 5.2', need: 'Opened oviduct packed with caseous pus, and a severe case with a layered lash egg.', source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 5.4', need: 'MG sinusitis and airsacculitis, plus MS synovitis with a swollen hock and gelatinous exudate.', source: 'CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 5.5', need: "Marek's disease range: a gray discolored iris, thickened skin and feather follicles, mesenteric and ovarian tumors, sciatic nerve swelling.", source: 'Roman Halouzka, Wikimedia Commons, CC BY-SA 3.0' },
    { course: 11, ref: 'Photo 5.6', need: 'A cystic oviduct from early IBV and hemorrhagic follicles from Newcastle disease, with the misshapen and thin-shelled eggs they produce.', source: 'Picture Book of Infectious Poultry Diseases (FAO-CEVA)' },
    { course: 11, ref: 'Photo 5.10', need: 'A dark blood clot on a pale, fat-laden liver, the giveaway for fatty liver hemorrhagic syndrome.', source: 'CEVA Handbook of Poultry Diseases' },
    { course: 11, ref: 'Photo 6.1', need: 'Duck plague lesions: proventricular and esophageal hemorrhage, intestinal ulcers, a necrotic liver and spleen.', source: 'Merck Veterinary Manual (merckvetmanual.com)' },
    { course: 11, ref: 'Photo 6.2', need: 'Bleeding from the nares and an enlarged liver studded with hemorrhagic foci in a duckling.', source: 'ASA Handbook on Poultry Diseases; Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 6.3', need: "A pale dilated heart, an enlarged fibrin-coated liver, an inflamed intestine (Derzsy's disease).", source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 6.4', need: 'Fibrinous exudate coating the heart and spreading over the liver in new duck disease (Riemerellosis).', source: 'Diseases of Poultry, 14th ed.; Merck Veterinary Manual' },
    { course: 11, ref: 'Photo 7.1', need: 'Severe duodenal bleeding and an enlarged, mottled spleen in hemorrhagic enteritis.', source: 'Diseases of Poultry, 14th ed' },
    { course: 11, ref: 'Photo 8.1', need: 'Pigeon paramyxovirus torticollis and a spinal cord cross section showing hemorrhage.', source: 'CEVA Handbook of Poultry Diseases; Oltramari de Souza et al., Pesq Vet Bras 2018' },
    { course: 18, ref: 'Photo 3.1', need: 'A fluid-filled cystic oviduct from an IBV-infected pullet, the false-layer lesion behind DMV/1639.', source: 'Picture Book of Infectious Poultry Diseases (FAO-CEVA)' },
    { course: 18, ref: 'Photo 3.3', need: 'aMPV findings at necropsy: exudate packing the head and inflamed ovary tissue.', source: 'CEVA Handbook of Poultry Diseases' },
  ],
  'Plant': [
    { course: 17, ref: 'Photo 5.1', need: 'A federally inspected poultry processing line, the stage where a bird becomes food.', source: 'meatpoultry.com' },
  ],
  'Equipment / product': [
    { course: 5,  ref: 'Photo 5.1', need: 'Solar panels installed on a Canadian barn roof.', source: 'Robin Stott / geograph.org.uk, CC BY-SA 2.0' },
    { course: 10, ref: 'Photo 2.1', need: 'A basic farm necropsy kit laid out on a clean, disinfectable surface.', source: 'AI-generated placeholder, no real source' },
    { course: 12, ref: 'Photo 3.2', need: 'The three KED device sizes and correct placement at the skull base.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 12, ref: 'Photo 3.3', need: 'The non-penetrating captive bolt device and correct head placement.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 12, ref: 'Photo 3.5', need: 'A CO2 euthanasia station: cylinders, regulator, sealed chamber, exhaust fan.', source: 'Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016' },
    { course: 15, ref: 'Photo 2.1', need: 'A commercial ELISA test kit: microplates, standards, conjugate, substrate, stop solution.', source: 'Romer Labs (AgraQuant)' },
    { course: 15, ref: 'Photo 2.2', need: 'Plate agglutination test drops for Mycoplasma gallisepticum: a smooth negative drop next to a clumped positive.', source: 'Kabir A, et al. Eur J Agric Food Sci. 2021' },
    { course: 15, ref: 'Photo 5.1', need: 'Three spun blood tubes side by side: EDTA whole blood, heparin plasma, clear serum.', source: 'Wikimedia Commons, Uwe Gille' },
    { course: 17, ref: 'Photo 5.2', need: 'A culture plate of bacterial colonies grown from a raw poultry sample.', source: 'meatpoultry.com' },
  ],
};

// Items removed because they duplicate a request already on the CPC Factsheet
// master photo list (D:\Course agent\Master Photo Request List\CPC-PhotoMasterList.pdf),
// so CPC only gets asked once. See DUPLICATES_REMOVED below for the full record.
const DUPLICATES_REMOVED = [
  { course: 3,  ref: 'Photo 2.1',  matched: 'Poor brooding / Spotting disease early (flock-walk scene; same AI image as Course 7 Photo 5, Course 14 Photo 5.1, Course 16 Photo 2.1)' },
  { course: 7,  ref: 'Photo 5',    matched: 'Spotting disease early (farm visits): "Birds sitting when the flock should be active, or a quiet patch in an otherwise busy barn"' },
  { course: 14, ref: 'Photo 5.1',  matched: 'Spotting disease early (duplicate of Course 7 Photo 5)' },
  { course: 16, ref: 'Photo 2.1',  matched: 'Spotting disease early (duplicate of Course 7 Photo 5)' },
  { course: 13, ref: 'Photo 5.2',  matched: 'Litter quality (farm visits): "Wet, caked or slick litter beside dry friable litter that crumbles in the hand"' },
  { course: 14, ref: 'Photo 4.1',  matched: 'Breeder weight and uniformity (farm visits): "close-up of the scale in use"' },
  { course: 7,  ref: 'Photo 16',   matched: "Marek's (farm visits): \"Bird down with one leg pushed forward, the other trailing back\"" },
  { course: 8,  ref: 'Photo 4.1',  matched: 'Fowl pox (before you open the bird): "Dry pox: scabby nodules on the comb, wattles and around the eye"' },
  { course: 5,  ref: 'Photo 4.3',  matched: 'Litter quality (farm visits): "Footpad and hock burn on a bird out of a wet litter barn"' },
  { course: 13, ref: 'Photo 3.1',  matched: 'Litter quality (farm visits), same footpad/hock burn request as Course 5 Photo 4.3' },
  { course: 7,  ref: 'Photo 9',    matched: 'Yolk sacculitis (before you open the bird): "Day-old chick turned over: wet, red or scabbed navel"' },
  { course: 11, ref: 'Photo 4.4',  matched: 'Yolk sacculitis (before you open the bird), same navel/yolk-sac request as Course 7 Photo 9' },
  { course: 7,  ref: 'Photo 15',   matched: 'Fowl cholera (before you open the bird): "Swollen wattles on an affected bird... Head and shoulders"' },
  { course: 7,  ref: 'Photo 17',   matched: 'ILT (farm visits): "Gasping bird with neck stretched up, blood spattered on a wall, feeder or drinker line"' },
  { course: 7,  ref: 'Photo 20',   matched: 'aMPV (before you open the bird): "Broiler or breeder with swelling around the eye and over the head; a twisted neck"' },
  { course: 7,  ref: 'Photo 28',   matched: 'Mycoplasma (farm visits): "Turkey face: swelling below the eye, wet or foamy eye, discharge at the nostril"' },
  { course: 11, ref: 'Photo 5.9',  matched: 'Fowl pox, both before-open dry-pox and once-open wet-pox entries cover this composite' },
  { course: 11, ref: 'Photo 4.1',  matched: 'E. coli post-mortem (once the bird is open), both entries: caseous liver/heart sac/air sac, and air sac suds look' },
  { course: 11, ref: 'Photo 4.11', matched: 'Viral arthritis post-mortem (once the bird is open): "Back of the hock with skin off, tendons swollen"' },
  { course: 11, ref: 'Photo 4.12', matched: 'Worms (once the bird is open): "Roundworms in an opened intestine"' },
  { course: 11, ref: 'Photo 4.13', matched: 'Ascites post-mortem (once the bird is open): "Opened abdomen with straw-colored fluid... a heart cut across beside a normal one"' },
  { course: 11, ref: 'Photo 5.3',  matched: 'Fowl cholera (before you open the bird): swollen wattle, and Fowl cholera liver (once the bird is open)' },
  { course: 11, ref: 'Photo 5.7',  matched: 'ILT post-mortem (once the bird is open): "Opened trachea with blood, mucus plugs or cheesy yellow material"' },
  { course: 11, ref: 'Photo 5.8',  matched: 'aMPV, both before-open entries (turkey head, broiler/breeder head) cover the external signature in this composite' },
  { course: 11, ref: 'Photo 7.2',  matched: 'Blackhead, turkeys (once the bird is open): "Target shaped depressed lesions on the liver, and thickened ceca with a solid core"' },
  { course: 13, ref: 'Photo 5.3',  matched: 'Lighting (farm visits): "A lux meter held at bird head height with the reading clearly visible"' },
];

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

C.push(para(`Every course was scanned for every "Photo" caption in its current final file. Real-world subjects only, farm scenes, live birds, lesions, equipment. Diagrams, charts, and infographics are excluded on purpose, whatever their origin; those are fine as they are and are not part of this request.`, { after: 80 }));
C.push(para(`Two things put a photo on this list. Borrowed: sourced from a textbook, journal, manufacturer site, or Wikimedia, with a real attribution shown in the course (61 items). AI-generated: an AI-rendered placeholder with no real source at all, currently captioned "Source: CPC Short Courses" exactly like a genuine photo, which is why it cannot be told apart from a real one by caption text alone (29 items, 24 of them in Course 7, 5 more found in Courses 3, 10, and 14). ${totalCount} items in total. Once CPC supplies a real replacement, that item drops out and the course gets rebuilt with the new photo and a proper "Source: CPC Short Courses" caption.`, { after: 80 }));
C.push(para('This list has already been checked against the CPC Factsheet project\'s master photo list (CPC-PhotoMasterList.pdf) so CPC is not asked for the same photo twice. 26 items that duplicated a factsheet request, by concept or by near-identical wording, were removed; the full removal record is at the end of this document.', { after: 80 }));
C.push(para('Courses 4, 9, and 16 have no items on this list. Every other course has at least one, and Course 7 has the most since much of its disease gallery was built on AI placeholders pending real photos.', { after: 0 }));

// FILING SYSTEM
C.push(sectionBar('How This List Is Filed'));
C.push(para('Every item below is tagged with one of these six values. The value tells CPC what kind of session produces the replacement, not what course it is for, and not whether the current image is borrowed or AI-generated.', { after: 100 }));
C.push(filingTable());
C.push(spacer(100));
C.push(bullet('Necropsy carries most of the list (33 of 90) because Course 11 teaches disease recognition almost entirely through internal lesions; nearly every disease profile in that course needs a real opened-bird photo.'));
C.push(bullet('Bird exam is its own line, separate from Necropsy, because the lesion is external and disappears once the bird is opened. It has to be caught before the bird goes on the table.'));
C.push(bullet('Plant is its own line because a processing-line photo needs arranged plant access. It is not a farm visit and not a necropsy-table shot.'));
C.push(bullet('Equipment / product items need no bird and no farm visit at all: a device, a kit, or a sample photographed on a bench is enough.'));
C.push(bullet('One AI image is reused across three courses under different captions: the biosecurity-entry scene (Course 7 Photo 7) also stands in for Course 3 Photo 6.1 and Course 14 Photo 2.3. One real photo of that scene clears all three rows.'));
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
C.push(bullet('One Course 4 photo (Photo 1.1, chicks at placement on litter with a feeder line) could not be confirmed as either a real sourced photo or an AI placeholder from the files on hand. It looks like a real photo on visual inspection and is not on this list, but is worth a quick visual confirmation from CPC since its provenance is not documented.'));
C.push(bullet('This list regenerates from the courses themselves. As photos land, rerun the extraction against the updated course files and this list shrinks.'));

// REMOVED AS DUPLICATES
C.push(sectionBar('Removed as Duplicates of the CPC Factsheet List'));
C.push(para(`These ${DUPLICATES_REMOVED.length} items were on an earlier draft of this list but were cut after checking them against the CPC Factsheet project's master photo list, since CPC is already being asked for a matching photo there, by concept or by near-identical wording. Kept off this list on purpose, not forgotten.`, { after: 100 }));
C.push(dupTable(DUPLICATES_REMOVED));

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
