// ============================================================
// generate-course4-revised.mjs — Course 4: Salmonella & Food Safety
// CPC Short Courses — Canadian Poultry Training Series
// REVISED: Farmer-Flow rewrites, removed lecture-specific sections,
//          aligned with CLAUDE.md Farmer-Flow Style Scoring System
// Uses docx v9.6.1 (local node_modules)
// Run: node generate-course4-revised.mjs
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  HeadingLevel,
  TableOfContents,
  LevelFormat,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 4');
const OUT_FILE  = path.join(OUT_DIR, 'Course 4 - revised aligned draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

// Image paths
function imgPath(n) { return path.join(OUT_DIR, `img${n}.png`); }
function imgBuf(n)  { return fs.existsSync(imgPath(n)) ? fs.readFileSync(imgPath(n)) : null; }
function imgBuf0()  {
  const p = path.join(OUT_DIR, 'img0_salmonella.png');
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

// ============================================================
// COLOURS
// ============================================================
const DARK_BLUE  = '1F3864';
const MED_BLUE   = '2E74B5';
const BODY_GRAY  = '3C3C3C';
const GOLD       = 'C9A84C';

// ============================================================
// HELPERS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({
    text,
    bold:    opts.bold    || false,
    italics: opts.italics || false,
    color:   opts.color   || BODY_GRAY,
    size:    opts.size    || 24,
    font:    'Calibri',
  });
}

function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY_GRAY, size: seg.size || 24, font: 'Calibri' }))
    : [run(text, { bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })];
  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing:   { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent:    opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } });
}
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });
}

function bullet(text, lvl = 0) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY_GRAY, size: 24, font: 'Calibri' }))
    : [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}

function numbered(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })],
    numbering: { reference: 'numbered-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}


// Embedded PNG image + caption
function image(buf, caption, widthIn = 5.8) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  // Read actual PNG dimensions from IHDR chunk
  let hpx = Math.round(wpx * 0.47); // default fallback ratio
  try {
    const view = new DataView(buf.buffer, buf.byteOffset);
    const pw   = view.getUint32(16, false);
    const ph   = view.getUint32(20, false);
    if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
  } catch (_) {}

  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: buf,
          transformation: { width: wpx, height: hpx },
          type: 'png',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 160, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 60, after: 240 },
    }),
  ];
}

// ============================================================
// HEADER / FOOTER
// ============================================================
function buildHeader() {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ text: 'Salmonella and Food Safety', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
        ],
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
      }),
    ],
  });
}

function buildFooter() {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'Canadian Poultry Training Series  |  Course 4 of 17  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ children: [PageNumber.CURRENT], color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ text: ' of ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], color: '888888', size: 18, font: 'Calibri' }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
      }),
    ],
  });
}

const pageMargin = {
  top:    convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left:   convertInchesToTwip(1.25),
  right:  convertInchesToTwip(1.25),
};

// ============================================================
// COVER PAGE  — matches Course 3 / Course 7 pattern exactly
// ============================================================
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [
    // Large top spacer
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1800, after: 0 } }),

    // Course label — small blue uppercase
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 4 OF 17: CANADIAN POULTRY TRAINING SERIES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 200 },
    }),
  ];

  // CPC Logo (if present)
  if (logoBuffer) {
    let lw = 144, lh = 144;
    try {
      const view = new DataView(logoBuffer.buffer, logoBuffer.byteOffset);
      const pw   = view.getUint32(16, false);
      const ph   = view.getUint32(20, false);
      if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw);
    } catch (_) {}
    children.push(
      new Paragraph({
        children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
        alignment: AlignmentType.CENTER,
        spacing:   { before: 300, after: 300 },
      })
    );
  }

  children.push(
    // Main title
    new Paragraph({
      children: [new TextRun({ text: 'Salmonella & Food Safety', bold: true, color: DARK_BLUE, size: 56, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 200, after: 200 },
    }),

    // Subtitle
    new Paragraph({
      children: [new TextRun({ text: 'Protecting Your Flock, Your Farm, and Your Customers', color: MED_BLUE, size: 30, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 600 },
    }),

    // Divider
    new Paragraph({
      children: [new TextRun({ text: '───────────────────────────────────', color: MED_BLUE, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 400 },
    }),

    // Organization
    new Paragraph({
      children: [new TextRun({ text: 'Canadian Poultry Training Series Course', bold: true, color: '595959', size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
    }),

    // Duration
    new Paragraph({
      children: [new TextRun({ text: 'Duration: 1.5-Hour Lecture', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
    }),

    // Date
    new Paragraph({
      children: [new TextRun({ text: 'April 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 800 },
    }),

    // Disclaimer
    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature, industry management guides, and regulatory documents. This material does not replace the advice of a licensed veterinarian or regulatory authority.', color: '808080', size: 18, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
    }),

    pageBreak(),
  );

  return {
    properties: { titlePage: true, page: { margin: pageMargin } },
    headers: { first: new Header({ children: [new Paragraph({ children: [] })] }) },
    footers: { first: new Footer({ children: [new Paragraph({ children: [] })] }) },
    children,
  };
}

// ============================================================
// TABLE OF CONTENTS — real Word TOC field (no hyperlink switch,
// which was triggering the "fields referencing other files" dialog)
// JSZip post-processing injects pre-cached entries so page numbers
// display immediately; user can still right-click > Update Field.
// ============================================================
function buildTocSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', {
        headingStyleRange: '1-3',
      }),
      pageBreak(),
    ],
  };
}

// ============================================================
// INTRODUCTION
// ============================================================
function buildIntroSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Introduction'),
      para('Salmonella is one of those problems that can be in your flock before anyone sees it. The birds look normal, they eat and drink, nothing sets off an alarm in the barn — and then the testing results come back from the plant [1]. That gap between what you observe and what the samples show is what makes Salmonella management so demanding. You cannot manage what you cannot see, which is why every layer of your food safety program has to work whether or not you ever spot a sick bird.'),
      para('The numbers behind Salmonella are not small. The Public Health Agency of Canada estimates about 87,500 illnesses, 925 hospitalizations, and 17 deaths every year from non-typhoidal Salmonella, with poultry consistently among the top sources [2]. That translates directly to regulatory scrutiny on your farm: your products must meet CFIA standards, and when a positive result comes back on your flock, it does not stay between you and the plant [3].'),
      para('This course gives you a practical, field-tested understanding of what Salmonella is, how it gets into your barn, and what you can do to reduce the risk before the CFIA sampling truck shows up at your door. We cover biosecurity, hygiene, cleanout protocols, pre-harvest management, record-keeping, and your regulatory obligations. By the end of this course, you will know where the high-risk points are on your farm and what specifically to do about them.'),
      h2('Learning Objectives'),
      para('By completing this course, you will be able to:'),
      bullet('Know why Salmonella is your biggest ongoing food safety obligation — and how regulators will hold you accountable.'),
      bullet('Spot the specific entry points on your farm where Salmonella gets in, and what it takes to close them.'),
      bullet('Understand what your birds will (and will not) show you when Salmonella is present in the flock.'),
      bullet('Apply the layered control measures that consistently keep flock and carcass contamination low.'),
      bullet('Run your cleanout, hygiene, and pest control programs in a way that holds up to a third-party audit.'),
      bullet('Keep the records that demonstrate your food safety program is working — and protect you if a flock tests positive.'),
      bullet('Know exactly when to report to CFIA, and what happens if you do not.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 1: UNDERSTANDING SALMONELLA
// ============================================================
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 1: Understanding Salmonella'),
      h2('1.1 What Is Salmonella?'),
      para('When farmers ask why Salmonella is such a persistent problem, the answer starts with what this organism actually is: not a single pathogen, but a large family of related bacteria. Over 2,600 distinct variants, called serovars, have been identified, but only a handful matter in commercial poultry production [1]. The two that drive the vast majority of human illness cases linked to Canadian poultry are Salmonella Enteritidis (SE) and Salmonella Typhimurium (ST) — and these are the serovars your food safety program needs to target [2].'),
      para('For practical purposes, Salmonella in your operation falls into three groups:'),
      bullet([{ text: 'Paratyphoid serovars (SE, ST, Salmonella Infantis): ', bold: true }, { text: 'Your birds will not look sick with these. Adult birds carry them silently and shed them in their droppings. The contamination still reaches the consumer. These are the serovars driving most of the Salmonella food safety pressure on Canadian broiler and layer farms [1,2].' }]),
      bullet([{ text: 'Host-adapted serovars (Pullorum, Gallinarum): ', bold: true }, { text: 'These cause visible, serious disease in your birds — high mortality, sick flocks. Both are federally reportable. If you suspect either one, stop what you are doing and call CFIA immediately [3].' }]),
      bullet([{ text: 'Arizonosis: ', bold: true }, { text: 'Caused by Salmonella arizonae, primarily a concern in turkey flocks. Less common in Canada [4].' }]),
      ...image(imgBuf(1), 'Figure 1.1: Salmonella classification in commercial poultry. Paratyphoid serovars (SE, ST) are the primary food safety concern. Pullorum disease and fowl typhoid are reportable diseases in Canada. (Generated diagram, CPC Short Courses.)'),
      h2('1.2 The Biology of Salmonella'),
      para('Here is what makes Salmonella so hard to get rid of once it is in your barn — and why shortcuts in cleanout always come back to bite you:'),
      bullet([{ text: 'Survives in the barn environment: ', bold: true }, { text: 'In dry litter, dust, soil, and on equipment surfaces, Salmonella can stay alive for weeks to months. A barn that looks clean is not necessarily safe [1,5].' }]),
      bullet([{ text: 'Grows across a wide temperature range: ', bold: true }, { text: 'Salmonella multiplies between 7 and 48°C, fastest around 37°C. Anything that sits at room temperature after slaughter is a growth opportunity.' }]),
      bullet([{ text: 'Survives drying: ', bold: true }, { text: 'Dried fecal dust can carry live Salmonella. This is why dry-sweeping before washing matters — you have to remove that material physically before disinfectant can reach the surface [5].' }]),
      bullet([{ text: 'Killed by heat: ', bold: true }, { text: 'Cooking destroys Salmonella completely. An internal temperature of 74°C throughout the product is the line [2]. Below that, the risk remains.' }]),
      ...image(imgBuf0(), 'Figure 1.2: Scientific illustration of Salmonella typhimurium. Each cell is a rod-shaped (bacillus) gram-negative bacterium measuring 0.7-1.5 x 2-5 micrometres. Peritrichous flagella (visible as thin filaments projecting in all directions) give the organism motility and aid colonization of the intestinal tract. (Generated scientific illustration, CPC Short Courses. Actual electron micrographs to be supplied by the CPC team.)', 5.8),
      h2('1.3 How Salmonella Affects Birds'),
      para('In your broiler or layer barn, most birds carrying Salmonella will look perfectly normal. They eat, drink, grow, and lay — and shed the bacteria intermittently in their droppings, contaminating the litter and everything that touches it [1]. You will not see it happening. That is the problem.'),
      para('Young chicks — especially under three weeks — are more vulnerable. When disease does appear at that age, you will see:'),
      bullet('Weakness and lethargy'),
      bullet('Huddling and chilling'),
      bullet('Diarrhea and pasting of the vent'),
      bullet('Increased mortality in the first week of life'),
      para('In layer flocks, Salmonella Enteritidis has an extra trick: it can colonize a hen\'s reproductive tract and get inside the egg before the shell even forms — a route called transovarian transmission [1,6]. The shell can look perfectly clean and uncracked, and the egg is already contaminated inside. That is what makes SE in laying flocks so serious, and why egg safety protocols in this course are not optional steps.'),
      h2('1.4 How Salmonella Affects Humans'),
      para('When a person gets Salmonella from contaminated poultry, it hits fast. Symptoms come on 6 to 72 hours after eating: cramping, diarrhea that can be bloody, nausea, fever around 38 to 39°C, general misery. For a healthy adult, it usually clears in four to seven days [2].'),
      para('For children under five, the elderly, pregnant women, and anyone immunocompromised, it can be life-threatening. That is the end user of your product — and that population does not have the immune reserves to fight off what a healthy person can shake off. There is also a longer-term issue: overuse of antimicrobials in poultry production drives resistance in Salmonella strains that eventually show up in human patients with limited treatment options. Responsible antimicrobial stewardship on your farm matters beyond your property line [2,7].'),
      h2('1.5 How Salmonella Spreads: Transmission Routes'),
      para('Salmonella gets into a flock two ways: through the egg before placement (vertical), or through everything that touches your barn after placement (horizontal). Both need to be part of your control plan [1].'),
      h3('Vertical Transmission'),
      para('Vertical transmission means the problem arrives before you even start. If a breeder flock is positive for SE, Salmonella can contaminate hatching eggs — and the day-old chicks placed on your grow-out farm may already be shedding before you have done anything wrong [1,6]. Your cleanest barn cannot fix what came in the door on placement day.'),
      h3('Horizontal Transmission'),
      para('Horizontal transmission is what most farms deal with most of the time. It covers everything that moves into or around your barn: contaminated feed, biofilm in drinker lines, rodents, flies, darkling beetles, wild birds gaining access, people moving between barns without changing gear, and equipment shared between operations [1,5]. Any one of those routes can establish Salmonella in a clean flock.'),
      ...image(imgBuf(3), 'Figure 1.3: Salmonella transmission routes. Vertical transmission (left) passes infection from breeder to egg to chick. Horizontal transmission (right) spreads Salmonella through feed, water, rodents, insects, people, and equipment. (Generated diagram, CPC Short Courses.)'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 2: RISKS ON THE POULTRY FARM
// ============================================================
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 2: Risks on the Poultry Farm'),
      para('Salmonella does not appear out of nowhere — it gets into your barn through something you can usually trace and control. Understanding the specific entry points on your operation is the first step toward building a program that actually works. Once it is established in the barn environment, it will not leave without a proper cleanout [1,5].'),
      h2('2.1 Contaminated Feed'),
      para('Feed is one of the most direct ways Salmonella arrives on a farm. Ingredients of animal origin — meat and bone meal, feather meal, fish meal — can carry the organism, and while most feed mills heat-treat the finished product, that protection ends the moment the bag opens or the bin is exposed [5]. Post-mill contamination during transport and storage is a real and documented risk. Watch for:'),
      bullet('Purchasing feed from suppliers without documented Salmonella control programs'),
      bullet('Storing feed in open bins accessible to rodents and wild birds'),
      bullet('Using damaged feed bags or bins where moisture can enter and support bacterial growth'),
      bullet('Providing feed that has been stored too long, especially in warm, humid conditions'),
      h2('2.2 Contaminated Water'),
      para('Most farmers watch their feed closely but overlook water as a Salmonella entry point. Surface water from dugouts, ponds, or open streams carries a high bacterial load, and well water can be compromised through seasonal fluctuations or aging infrastructure [1]. The bigger issue inside the barn is biofilm: the sticky buildup on the inner walls of your drinker lines that accumulates over the course of a flock. Salmonella shelters inside biofilm and survives regular flushing — it takes a proper water-line flush with an approved acidic or enzyme-based cleaner to break it down. If you are not cleaning drinker lines at turnover, you are starting every flock with a contaminated water system.'),
      h2('2.3 Carrier Birds and Asymptomatic Shedding'),
      para('Once some birds in your flock pick up Salmonella, they become carriers — shedding intermittently in their droppings without a single visible sign [1]. You cannot pick them out. And any stressor — feed withdrawal, a concurrent infection, the stress of catching — pushes shedding higher. This is why contamination levels in the barn tend to peak in the 24 to 48 hours before loading: you are stressing the birds at exactly the moment it matters most.'),
      h2('2.4 Wild Animals, Rodents, and Insects'),
      para('Some of the hardest Salmonella introductions to prevent come from things you did not invite in. Each one has its own way of getting around your defences:'),
      bullet([{ text: 'Rodents: ', bold: true }, { text: 'Rats and mice are heavily colonized with Salmonella and contaminate everything they touch — feed, water, litter — through droppings and urine. A single rodent can shed millions of Salmonella organisms per gram of feces [5]. One active rodent infestation can undo a good biosecurity program.' }]),
      bullet([{ text: 'Wild birds: ', bold: true }, { text: 'Starlings, sparrows, and pigeons that get into your barn drop Salmonella directly into the feed and litter. They are hard to keep out completely, but gaps in walls, fans, and vents make it much worse [1].' }]),
      bullet([{ text: 'Darkling beetles (Alphitobius diaperinus): ', bold: true }, { text: 'Once established in litter, these insects are almost impossible to eliminate. They carry Salmonella through flock cycles and survive even after thorough cleanout by hiding deep in insulation and cracks [1,5].' }]),
      bullet([{ text: 'Flies: ', bold: true }, { text: 'House flies pick up Salmonella from manure or dead birds and carry it directly to feed, drinkers, and barn surfaces. A fly pressure problem is a Salmonella amplification problem.' }]),
      h2('2.5 Farm Worker Practices'),
      para('The most mobile contamination source on your farm is the people walking through your barn door. Every worker, technician, vet, or visitor who has been on another poultry operation that day can bring Salmonella in on their boots, coveralls, and hands — and most of the time, no one knows it is happening [1,5]. The riskiest moments:'),
      bullet('Moving between barns without changing boots and outer clothing'),
      bullet('Entering the barn after visiting another poultry farm without observing the required downtime'),
      bullet('Inadequate or no handwashing before and after barn entry'),
      bullet('Sharing equipment (shovels, rakes, forklifts) between barns without disinfection'),
      bullet('Allowing catching crews onto the farm without enforcing your biosecurity protocols'),
      h2('2.6 Equipment and Litter'),
      para('Equipment is a silent carrier. Anything that travels between barns or between farms can carry Salmonella with it: egg flats, chick delivery boxes, feed trucks, litter equipment, dead bird bins [1,5]. None of it looks contaminated. All of it can be. And as the flock ages, litter builds up its own Salmonella load week by week — by the time you are near slaughter weight, that litter is a significant bacterial reservoir on its own.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 3: PREVENTION AND CONTROL
// ============================================================
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 3: Prevention and Control Measures'),
      para('There is no silver bullet for Salmonella. No single product, protocol, or program eliminates it on its own — and any salesperson who tells you otherwise is selling you something. What works is stacking multiple layers of control, so that when one layer is breached, the next one catches it. That is the approach this section walks you through [1,5].'),
      h2('3.1 Biosecurity: The Foundation'),
      para('Biosecurity is the wall that keeps Salmonella out of your barn. It is not about one measure — it is about controlling every route through which the organism can arrive: the people walking in, the vehicles delivering, the equipment coming from other farms, and the chicks coming through the door [1,5].'),
      bullet('Establish a clearly marked farmyard boundary. Limit the number of entry points and post biosecurity requirement signs at all entry points.'),
      bullet('Maintain a visitor log. Record the name, organization, date, and any recent poultry farm contacts for every person who enters the production area.'),
      bullet('Require a minimum 48-hour downtime for anyone who has visited another poultry operation before entering your barns.'),
      bullet('Require all delivery vehicles to be washed and disinfected before entering the production area whenever possible.'),
      h3('All-In and All-Out Management'),
      para('All-in, all-out (AIAO) is the most effective single tool you have for breaking the Salmonella cycle between flocks: one flock in, one flock out, then a full cleanout and disinfection before the next placement [1]. Continuous housing — adding new birds to a barn where older birds are still present — almost guarantees Salmonella carryover. The new flock steps into a contaminated environment from day one, and you are managing uphill for the entire grow-out.'),
      ...image(imgBuf(5), 'Figure 3.1: Biosecurity zones and entry protocol. The clean zone (left) encompasses the production barn and dedicated equipment. The entry point (centre) enforces boot dips, coverall changes, handwashing, and visitor logging. The outside zone (right) includes public roads and delivery vehicles, which must not cross the line. (Generated diagram, CPC Short Courses.)'),
      h2('3.2 Feed and Water Safety'),
      para('Start with your feed supplier: ask specifically whether their program includes heat treatment of finished feed, post-processing contamination controls, and routine environmental Salmonella testing. If they cannot show you documentation, find a supplier who can [5]. On the farm, protect every bag and bin: sealed, covered storage, no residual feed left between flocks, and zero rodent access to any feed storage area.'),
      para('For water: test well water for total coliform and E. coli at least annually. Install and maintain an in-line treatment system (chlorination or acidification is appropriate for most Canadian operations). Flush and clean drinker lines at the end of every flock cycle with an approved water-line cleaner to break down biofilm [1].'),
      h2('3.3 Competitive Exclusion'),
      para('Competitive exclusion (CE) works on a simple principle: get the right bacteria into your chicks before Salmonella does. These products, which contain defined mixtures of beneficial intestinal bacteria, are applied to day-old chicks to colonize the gut and crowd out Salmonella before it gets a foothold [1,5]. CE is most effective when given at hatch — before any Salmonella exposure — and when used alongside a broader biosecurity and management program. Several CE products are licensed for use in Canada. Ask your veterinarian which product fits your intake schedule and production type.'),
      h2('3.4 Vaccination'),
      para('Vaccination against Salmonella Enteritidis is available in Canada and is standard practice in layer and breeder operations, where SE in the eggs is the core concern [1,8].'),
      bullet([{ text: 'Live attenuated vaccines: ', bold: true }, { text: 'Given in water or by spray to young pullets. These prime the gut\'s immune response, making it harder for Salmonella to establish in the intestinal tract and reducing shedding.' }]),
      bullet([{ text: 'Killed vaccines: ', bold: true }, { text: 'Injected at or near transfer to the layer barn, as a booster after the live series. Associated with lower rates of egg contamination [1,8].' }]),
      para('Vaccination brings colonization down and makes transovarian transmission less likely — but it does not eliminate Salmonella from a flock. Think of it as one layer in a program, not a replacement for biosecurity and management. Talk to your integrator or provincial vet about what vaccination schedule fits your production type and current regulatory requirements [3].'),
      h2('3.5 Rodent and Pest Control'),
      para('Rodents are one of the most reliable ways to bring Salmonella into a barn and one of the hardest problems to get rid of once they are established. Your rodent control program needs to be active, documented, and continuous — not something you ramp up after you spot a problem. Key elements:'),
      bullet('Regular inspection of the barn perimeter and interior for signs of rodent activity (droppings, gnaw marks, burrows, runways).'),
      bullet('Maintaining an uncluttered cleared zone around the exterior of all barn buildings to eliminate rodent harborage.'),
      bullet('Sealing all gaps larger than 6 mm in barn walls, foundations, and roof lines.'),
      bullet('Placing and maintaining bait stations at regular intervals around the barn perimeter and under feed storage bins.'),
      bullet('Keeping records of rodent activity levels and bait consumption to track program effectiveness.'),
      h2('3.6 Salmonella Monitoring and Testing'),
      para('Under Canada\'s National Salmonella Action Plan for Chicken (NSAPC), your integrator is required to run pre-harvest flock testing. That result is not just paperwork — it tells you whether your biosecurity is working and whether a specific barn is carrying a higher-than-expected load [3]. When a flock tests positive, treat it as a signal rather than a setback: go back through your cleanout records, visitor logs, and pest control data. Find where the gap was, fix it, and document what you changed. Then call your veterinarian to discuss additional interventions for the next cycle.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 4: GOOD HYGIENE PRACTICES
// ============================================================
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 4: Good Hygiene Practices'),
      para('You can have the best biosecurity plan on paper, but if the people walking in and out of your barn are not following basic hygiene every single time, that plan is worthless. Salmonella moves on hands, boots, coveralls, and equipment — and every shortcut in daily hygiene is a new opportunity for it to spread [5,9].'),
      h2('4.1 Handwashing'),
      para('Your hands move between birds, equipment, litter, and your face in a way nothing else does. That makes them one of the fastest Salmonella transfer routes on the farm — and the easiest one to control. Correct handwashing procedure:'),
      numbered('Wet hands with clean, running water (warm or cold).'),
      numbered('Apply soap and lather thoroughly, covering all surfaces including backs of hands, between fingers, and under nails.'),
      numbered('Scrub for at least 20 seconds.'),
      numbered('Rinse completely under running water.'),
      numbered('Dry with a clean paper towel or air dryer. Never share cloth towels.'),
      para('Wash hands before and immediately after entering any poultry barn, after handling live birds or carcasses, after handling litter or soiled equipment, before eating or drinking, and after using the toilet. Provide adequate handwashing facilities at every barn entry point with clean running water, soap, and disposable paper towels [9].'),
      h2('4.2 Protective Clothing and Footwear'),
      bullet([{ text: 'Coveralls or dedicated barn clothing: ', bold: true }, { text: 'Worn only inside the barn. Change and launder after each flock cycle or more frequently if visibly soiled.' }]),
      bullet([{ text: 'Dedicated barn boots: ', bold: true }, { text: 'Rubber or waterproof boots used only inside the designated barn or production area. Boots are among the most effective vehicles for transferring Salmonella between barns [1].' }]),
      bullet([{ text: 'Boot dips: ', bold: true }, { text: 'Maintain footbaths at every barn entrance using an approved disinfectant at the correct concentration. Change disinfectant solutions regularly; a fouled boot dip is ineffective and may spread contamination [5].' }]),
      bullet([{ text: 'Gloves: ', bold: true }, { text: 'Wear disposable or cleanable gloves when handling carcasses, taking samples, or administering medications. Change gloves between barns.' }]),
      h2('4.3 Barn Cleanout and Disinfection'),
      para('Cleanout is the one moment in your flock cycle where you have a real chance to reset the barn. Everything after that — your biosecurity protocols, your CE product, your vaccination program — is working uphill against whatever Salmonella load you left behind. A proper cleanout breaks that cycle [1,5].'),
      ...image(imgBuf(4), 'Figure 4.1: Between-flock cleanout and disinfection protocol. Each step builds on the previous; skipping any step significantly reduces effectiveness. Dry cleanout and full drying before disinfectant application are the two most commonly skipped steps. (Generated diagram, CPC Short Courses.)'),
      h3('Key Cleanout Principles'),
      bullet('Remove all litter, manure, and debris from the barn, including corners, under feed and water lines, and wall edges.'),
      bullet('Dry-sweep or blow down all surfaces including walls, ceiling, fans, and attic spaces where dust accumulates.'),
      bullet('Apply a detergent-based foaming agent and pressure-wash all surfaces. Start from the top (ceiling, fans, light fixtures) and work down to the floor.'),
      bullet('Allow the barn to dry completely before applying disinfectant. Salmonella disinfection is significantly less effective on wet surfaces.'),
      bullet('Apply an approved disinfectant at the correct concentration and contact time. Rotate between disinfectant classes over successive flock cycles.'),
      bullet('Allow the barn to sit empty for at least 7 to 14 days after disinfection before the next flock.'),
      h2('4.4 Waste Management'),
      para('Litter from a positive flock is a contamination hazard the moment it leaves your barn. Keep it covered and contained, well away from barn entrances, water sources, and neighboring properties. Do not put fresh, untreated manure from a positive flock onto fields that grow produce eaten raw — the risk of spreading contamination downstream is real [5,9]. For dead birds: pull them daily and process immediately. Letting mortality accumulate is both a Salmonella amplification point and an audit flag.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 5: SAFE PROCESSING AND STORAGE
// ============================================================
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 5: Safe Processing and Storage'),
      para('The plant handles the kill, but your farm determines how much Salmonella arrives on the truck. Pre-harvest colonization levels in your flock directly influence carcass contamination rates at slaughter — and that means your test results, your integrator relationship, and your market access all depend on what you do in the barn [3,6].'),
      h2('5.1 Pre-Harvest Management'),
      para('The window between final feed withdrawal and loading is when Salmonella pressure peaks in your flock. Withdrawal stress, the chaos of catching, and the stress of transport push carrier birds to shed at higher levels — and feathers covered in fecal material during catching carry that contamination directly to the processing line [1,5]. What you manage in these 24 to 48 hours shows up in your carcass results.'),
      bullet([{ text: 'Feed withdrawal timing: ', bold: true }, { text: 'Follow your processor\'s specified feed withdrawal guidelines. Excessive withdrawal time causes intestinal damage that increases contamination risk during processing [6].' }]),
      bullet([{ text: 'Water access: ', bold: true }, { text: 'Maintain water access up to 1 to 2 hours before catching. Dehydrated birds experience more intestinal fragility at slaughter.' }]),
      bullet([{ text: 'Catching crew biosecurity: ', bold: true }, { text: 'Ensure catching crew members change into clean coveralls and boots before entering the barn. Crews working across multiple farms in a single day carry a higher Salmonella transfer risk.' }]),
      h2('5.2 Temperature Control'),
      ...image(imgBuf(2), 'Figure 5.1: Temperature control for Salmonella safety. Refrigeration slows growth but does not kill bacteria. The danger zone (4 to 60°C) allows rapid multiplication. Cooking to 74°C throughout the product destroys Salmonella completely. (Generated diagram, CPC Short Courses.)'),
      bullet([{ text: 'Refrigeration: ', bold: true }, { text: 'Fresh poultry meat must be kept at or below 4°C at all times after processing. Refrigeration slows Salmonella growth greatly but does not eliminate it.' }]),
      bullet([{ text: 'Freezing: ', bold: true }, { text: 'Frozen poultry should be stored at or below -18°C. Freezing does not kill Salmonella; frozen poultry must still be handled and cooked correctly.' }]),
      bullet([{ text: 'Cooking temperature: ', bold: true }, { text: 'All poultry products must reach an internal temperature of at least 74°C (165°F) throughout the product to ensure Salmonella destruction [2,9]. This applies to all cuts, including wings and thighs close to the bone.' }]),
      bullet([{ text: 'Cold chain maintenance: ', bold: true }, { text: 'Do not allow poultry products to sit at room temperature for more than 2 hours. After cooking, maintain hot food above 60°C, or cool rapidly to below 4°C within 2 hours.' }]),
      h2('5.3 Egg Safety: On-Farm Practices for Layer Operations'),
      bullet('Keep nesting areas clean and dry. Wet, soiled nests dramatically increase the risk of shell contamination.'),
      bullet('Collect eggs frequently: minimum 3 to 4 times per day for loose-housed flocks. Frequent collection reduces the time eggs spend in a warm, contaminated environment.'),
      bullet('Remove floor eggs promptly. Floor eggs have a much higher rate of fecal shell contamination and must not be sold as Grade A.'),
      bullet([{ text: 'Do not wash eggs ', bold: true }, { text: 'unless you are licensed and equipped to do so under CFIA-approved conditions. Washing with water cooler than the egg creates a negative pressure differential that actively pulls surface bacteria into the egg through the shell pores [6].' }]),
      bullet('Cool eggs promptly after collection to below 12 degrees Celsius. Store eggs at 7 to 12 degrees Celsius pending grading.'),
      bullet('Use clean, sanitized egg flats or crates. Reusable plastic egg flats must be washed and disinfected between uses.'),
      h2('5.4 Preventing Cross-Contamination'),
      para('If your farm does direct sales or on-farm processing, cross-contamination is your problem. Raw poultry onto a surface, a board, or hands that then touch ready-to-eat food is one of the most common ways people end up sick from poultry [2]. The rules are simple, and they need to be followed every time:'),
      bullet('Use separate, color-coded cutting boards and utensils for raw poultry and other foods.'),
      bullet('Wash hands thoroughly after handling raw poultry and before touching any other food or surface.'),
      bullet('Sanitize all surfaces and equipment that have contacted raw poultry.'),
      bullet('Store raw poultry below and away from ready-to-eat foods in refrigerators and transport coolers.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 6: FARMER RESPONSIBILITIES
// ============================================================
function buildSection6() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 6: Farmer Responsibilities and Consumer Safety'),
      para('Salmonella control in Canada is not optional — it is written into federal law, provincial regulations, and the program requirements of every major commodity organization you sell into. Knowing which rules apply to you, what records you need to keep, and when to pick up the phone to CFIA is just as important as anything you do in the barn [3,9].'),
      h2('6.1 Regulatory Framework in Canada'),
      bullet([{ text: 'Canadian Food Inspection Agency (CFIA): ', bold: true }, { text: 'Oversees the Safety of Human Food Regulations and administers the National Salmonella Action Plan for Chicken (NSAPC). The NSAPC includes pre-harvest surveillance of commercial broiler flocks, with testing conducted at defined intervals before slaughter. Positive flock results may trigger additional interventions at the processing plant [3].' }]),
      bullet([{ text: 'Chicken Farmers of Canada (CFC): ', bold: true }, { text: 'Administers the On-Farm Food Safety (OFFS) Program for broiler producers, which requires documented biosecurity and Salmonella control practices. Producers are subject to third-party audits [3].' }]),
      bullet([{ text: 'Egg Farmers of Canada (EFC): ', bold: true }, { text: 'Administers the Start Clean and Stay Clean on-farm food safety program for commercial egg producers, which includes requirements for Salmonella control and flock testing [3].' }]),
      bullet([{ text: 'Reportable diseases: ', bold: true }, { text: 'Salmonella Pullorum and Salmonella Gallinarum are reportable diseases under federal and most provincial regulations. Any suspected case must be reported to your provincial veterinarian or the CFIA immediately [3].' }]),
      h2('6.2 Record-Keeping'),
      para('If your flock tests positive and CFIA comes knocking, your records are the difference between a manageable situation and a serious one. Think of them not as paperwork but as proof that you ran a clean, responsible operation. At minimum, keep the following:'),
      bullet([{ text: 'Visitor and crew log: ', bold: true }, { text: 'Date, name, organization, and recent farm contacts for every person who enters the production area.' }]),
      bullet([{ text: 'Flock placement records: ', bold: true }, { text: 'Source of chicks or pullets, arrival date, number of birds, any health concerns noted at delivery.' }]),
      bullet([{ text: 'Feed records: ', bold: true }, { text: 'Feed supplier, delivery dates, batch or lot numbers. Retain delivery tickets.' }]),
      bullet([{ text: 'Cleanout and disinfection records: ', bold: true }, { text: 'Date, products used, concentrations, contact times, and environmental swab results for each flock cycle.' }]),
      bullet([{ text: 'Salmonella testing results: ', bold: true }, { text: 'Flock-level results from integrator or provincial testing programs and any on-farm environmental monitoring results.' }]),
      bullet([{ text: 'Pest control records: ', bold: true }, { text: 'Dates of inspections, rodent activity levels observed, bait products used, and contractor visit records.' }]),
      para('All records should be retained for a minimum of 2 years or as required by your provincial food safety program.'),
      h2('6.3 Monitoring Flock Health'),
      para('Your birds will not show you when Salmonella is shedding — but they will give you early clues that something in the barn is off. Your daily walk is the most underutilized tool in your food safety program. Know what to look for:'),
      bullet('Walk the barn at least twice daily and record observations.'),
      bullet('Check feed and water consumption. Unexpected drops are one of the earliest indicators of flock stress or disease.'),
      bullet('Observe bird behavior and distribution. Huddling, crowding near feeders and drinkers, or avoiding certain areas are warning signs.'),
      bullet('Assess litter condition. Wet areas under drinker lines or unexplained wet patches may indicate leaks or abnormal fecal output.'),
      bullet('Note fecal consistency and color. Loose, watery, or discolored droppings can indicate enteric infection.'),
      bullet('Count and record daily mortality. Remove dead birds immediately.'),
      bullet('Report any unusual signs to your veterinarian promptly. Early investigation prevents disease from spreading.'),
      h2('6.4 Key Takeaways'),
      bullet('Salmonella is a zoonotic pathogen that can be carried by healthy-appearing birds and transmitted to humans through poultry products.'),
      bullet('The two serovars of greatest food safety concern in Canadian poultry are Salmonella Enteritidis and Salmonella Typhimurium.'),
      bullet('Control requires a layered approach: biosecurity, feed and water management, competitive exclusion, vaccination (where appropriate), hygiene, and monitoring.'),
      bullet('All-in and all-out management, combined with thorough cleanout and disinfection between flocks, is the most effective tool for breaking the Salmonella cycle between flocks.'),
      bullet('All poultry products must reach 74°C internal temperature to ensure Salmonella destruction.'),
      bullet('Record-keeping is not administrative burden; it is the evidence that your food safety program works.'),
      bullet('Salmonella Pullorum and Salmonella Gallinarum are reportable diseases; suspected cases must be reported to CFIA immediately.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// RECOMMENDED JOURNALS
// ============================================================
function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para('The following peer-reviewed journals are the primary scientific literature sources for Salmonella research in commercial poultry.'),
      bullet([{ text: 'Poultry Science ', italics: true }, { text: '(official journal of the Poultry Science Association): Publishes original research on all aspects of poultry biology, health, and production, including Salmonella epidemiology and control.' }]),
      bullet([{ text: 'Avian Diseases ', italics: true }, { text: '(official journal of the American Association of Avian Pathologists): Focuses on poultry and avian health, with frequent Salmonella-related content.' }]),
      bullet([{ text: 'Avian Pathology ', italics: true }, { text: '(official journal of the World Veterinary Poultry Association): International journal covering avian infectious diseases, including Salmonella serovars and control strategies.' }]),
      bullet([{ text: 'Zoonoses and Public Health ', italics: true }, { text: '(Wiley-Blackwell): Covers the science of zoonotic diseases at the human-animal-environment interface, including foodborne Salmonella.' }]),
      bullet([{ text: 'Journal of Food Protection ', italics: true }, { text: '(International Association for Food Protection): Covers food safety science, including pathogen reduction in poultry processing and handling.' }]),
      bullet([{ text: 'Foodborne Pathogens and Disease ', italics: true }, { text: '(Mary Ann Liebert): Publishes research on the epidemiology, ecology, and control of foodborne pathogens, including Salmonella in poultry supply chains.' }]),
      bullet([{ text: 'International Journal of Food Microbiology ', italics: true }, { text: '(Elsevier): Broad food microbiology scope including Salmonella ecology, antimicrobial resistance, and control interventions.' }]),
      pageBreak(),
    ],
  };
}

// ============================================================
// REFERENCES
// ============================================================
function buildReferencesSection() {
  const refs = [
    '[1]  Russell SM. Controlling Salmonella in Poultry Production. Woodhead Publishing; 2012.',
    '[2]  Public Health Agency of Canada. Salmonellosis (non-typhoidal) [Internet]. Ottawa: Government of Canada; 2023 [cited 2026 Apr]. Available from: phac-aspc.gc.ca',
    '[3]  Canadian Food Inspection Agency. National Salmonella Action Plan for Chicken [Internet]. Ottawa: Government of Canada; 2023 [cited 2026 Apr]. Available from: inspection.canada.ca',
    '[4]  Swayne DE, Boulianne M, Logue CM, McDougald LR, Nair V, Suarez DL, editors. Diseases of Poultry. 14th ed. Hoboken (NJ): Wiley-Blackwell; 2020.',
    '[5]  Bell DD, Weaver WD. Commercial Chicken Meat and Egg Production. 5th ed. Norwell (MA): Springer; 2002.',
    '[6]  Tablante NL. Common Poultry Diseases and Their Prevention. eXtension; 2013.',
    '[7]  World Health Organization. WHO List of Critically Important Antimicrobials for Human Medicine. 6th rev. Geneva: WHO; 2019.',
    '[8]  CEVA Sante Animale. CEVA Handbook of Poultry Diseases. Vol 1. Libourne: CEVA; 2020.',
    '[9]  National Farm Animal Care Council (NFACC). Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys. Lacombe (AB): NFACC; 2016.',
  ];

  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('References'),
      para('References are listed in order of first citation. This course draws primarily from the following peer-reviewed textbooks, regulatory guidance documents, and industry resources held in the Canadian Poultry Consultants reference library.'),
      ...refs.map(r => new Paragraph({
        children: [new TextRun({ text: r, color: BODY_GRAY, size: 22, font: 'Calibri' })],
        spacing: { after: 120, line: 260, lineRule: 'auto' },
        indent:  { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.4) },
      })),
    ],
  };
}

// ============================================================
// NUMBERING
// ============================================================
function buildNumbering() {
  return {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          {
            level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 24, color: BODY_GRAY },
            },
          },
          {
            level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 22, color: BODY_GRAY },
            },
          },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [
          {
            level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.35) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 24, color: BODY_GRAY },
            },
          },
        ],
      },
    ],
  };
}

// ============================================================
// STYLES
// ============================================================
function buildStyles() {
  return {
    default: {
      document: {
        run: { font: 'Calibri', size: 24, color: BODY_GRAY },
        paragraph: { spacing: { after: 160, line: 276, lineRule: 'auto' } },
      },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 36, bold: true, color: DARK_BLUE },
        paragraph: {
          spacing: { before: 480, after: 240 },
          border:  { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
          outlineLevel: 0,
        },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 30, bold: true, color: MED_BLUE },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 26, bold: true, italics: true, color: MED_BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  };
}

// ============================================================
// BUILD AND WRITE
// ============================================================
async function main() {
  console.log('Building Course 4: Salmonella and Food Safety...');

  const doc = new Document({
    creator:     'Canadian Poultry Consultants',
    title:       'Salmonella and Food Safety',
    description: 'Course 4 of 17 — CPC Short Courses',
    features:    { updateFields: false },
    styles:      buildStyles(),
    numbering:   buildNumbering(),
    sections: [
      buildCoverSection(),
      buildTocSection(),
      buildIntroSection(),
      buildSection1(),
      buildSection2(),
      buildSection3(),
      buildSection4(),
      buildSection5(),
      buildSection6(),
      buildJournalSection(),
      buildReferencesSection(),
    ],
  });

  let buffer = await Packer.toBuffer(doc);

  // Post-process with JSZip:
  //  1. settings.xml — strip <w:updateFields> (prevents auto-update dialog)
  //  2. document.xml — strip w:dirty="true" (suppresses "update fields" dialog on open)
  //  3. document.xml — inject pre-cached TOC entries with page numbers so the TOC
  //     displays correctly immediately without requiring a manual update
  //  4. document.xml — italicize formal Latin genus/species names in all body text
  const zip = await JSZip.loadAsync(buffer);

  // 1. settings.xml
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  zip.file('word/settings.xml', settings);

  // 2-4. document.xml
  let docXml = await zip.file('word/document.xml').async('string');

  // 2. Remove w:dirty="true" from every fldChar element
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  // 3. Inject pre-cached TOC entries with estimated page numbers
  //    Format: TOC1/TOC2 styled paragraphs with dot-leader tab + page number
  const t1 = (text, pg) =>
    `<w:p><w:pPr><w:pStyle w:val="TOC1"/>` +
    `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs></w:pPr>` +
    `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>` +
    `<w:r><w:tab/></w:r><w:r><w:t>${pg}</w:t></w:r></w:p>`;
  const t2 = (text, pg) =>
    `<w:p><w:pPr><w:pStyle w:val="TOC2"/>` +
    `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs>` +
    `<w:ind w:left="440"/></w:pPr>` +
    `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>` +
    `<w:r><w:tab/></w:r><w:r><w:t>${pg}</w:t></w:r></w:p>`;

  const tocEntries = [
    t1('Introduction', 4),
    t2('Learning Objectives', 4),
    t1('Section 1: Understanding Salmonella', 5),
    t2('1.1  What Is Salmonella?', 5),
    t2('1.2  The Biology of Salmonella', 6),
    t2('1.3  How Salmonella Affects Birds', 6),
    t2('1.4  How Salmonella Affects Humans', 7),
    t2('1.5  How Salmonella Spreads: Transmission Routes', 7),
    t1('Section 2: Risks on the Poultry Farm', 8),
    t2('2.1  Contaminated Feed', 8),
    t2('2.2  Contaminated Water', 8),
    t2('2.3  Carrier Birds and Asymptomatic Shedding', 9),
    t2('2.4  Wild Animals, Rodents, and Insects', 9),
    t2('2.5  Farm Worker Practices', 9),
    t2('2.6  Equipment and Litter', 10),
    t1('Section 3: Prevention and Control Measures', 10),
    t2('3.1  Biosecurity: The Foundation', 10),
    t2('3.2  Feed and Water Safety', 11),
    t2('3.3  Competitive Exclusion', 11),
    t2('3.4  Vaccination', 12),
    t2('3.5  Rodent and Pest Control', 12),
    t2('3.6  Salmonella Monitoring and Testing', 12),
    t1('Section 4: Good Hygiene Practices', 13),
    t2('4.1  Handwashing', 13),
    t2('4.2  Protective Clothing and Footwear', 13),
    t2('4.3  Barn Cleanout and Disinfection', 14),
    t2('4.4  Waste Management', 15),
    t1('Section 5: Safe Processing and Storage', 15),
    t2('5.1  Pre-Harvest Management', 15),
    t2('5.2  Temperature Control', 16),
    t2('5.3  Egg Safety: On-Farm Practices for Layer Operations', 16),
    t2('5.4  Preventing Cross-Contamination', 17),
    t1('Section 6: Farmer Responsibilities and Consumer Safety', 18),
    t2('6.1  Regulatory Framework in Canada', 18),
    t2('6.2  Record-Keeping', 18),
    t2('6.3  Monitoring Flock Health', 19),
    t2('6.4  Key Takeaways', 19),
    t1('Recommended Peer-Reviewed Journals', 20),
    t1('References', 21),
  ].join('');

  const sepTag = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx = docXml.indexOf(sepTag);
  if (sepIdx !== -1) {
    const endIdx = docXml.indexOf(endTag, sepIdx);
    if (endIdx !== -1) {
      docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
    }
  }

  // 4. Italicize formal Latin genus/species names in all non-heading paragraphs
  //    Rule: Salmonella (genus) always italic; Salmonella + known lowercase species also italic
  //    Serovar names (Enteritidis, Typhimurium, Pullorum, Gallinarum, Infantis) NOT italic
  //    Alphitobius diaperinus (darkling beetle) also italic
  //
  //    IMPORTANT: <w:i/> must be inserted at the correct OOXML position within <w:rPr>:
  //    after <w:rFonts> and <w:b>/<w:bCs>, but BEFORE <w:color> and <w:sz>.
  //    Inserting at the start (after <w:rPr>) violates schema order and Word silently ignores it.
  function insertItalic(rPr) {
    if (!rPr) return '<w:rPr><w:i/></w:rPr>';
    // The docx library writes <w:i w:val="false"/> on every non-italic run.
    // Adding a second <w:i/> after it is invalid OOXML — Word uses the first one and
    // ignores the second, so italic never renders. Replace the explicit-false instead.
    if (rPr.includes('<w:i w:val="false"/>')) {
      return rPr
        .replace('<w:i w:val="false"/>', '<w:i/>')
        .replace('<w:iCs w:val="false"/>', '<w:iCs/>');
    }
    // Already italic (e.g. figure captions) — no change needed
    if (/<w:i\/>|<w:i>/.test(rPr)) return rPr;
    // No italic element at all — insert before <w:color> or <w:sz> (correct OOXML position)
    for (const anchor of ['<w:color ', '<w:sz ', '<w:szCs ', '</w:rPr>']) {
      const idx = rPr.indexOf(anchor);
      if (idx !== -1) return rPr.slice(0, idx) + '<w:i/>' + rPr.slice(idx);
    }
    return rPr.replace('<w:rPr>', '<w:rPr><w:i/>');
  }

  docXml = docXml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, para => {
    if (/w:val="Heading[123]"/.test(para)) return para;
    return para.replace(
      /(<w:r\b[^>]*>)((?:<w:rPr>[\s\S]*?<\/w:rPr>)?)(<w:t(?:\s+xml:space="preserve")?>)([\s\S]*?)(<\/w:t>\s*<\/w:r>)/g,
      (m, rOpen, rPr, _tOpen, text) => {
        if (!/Salmonella|Alphitobius/.test(text)) return m;
        const rPrItalic = insertItalic(rPr);
        const parts = [];
        let last = 0;
        const taxRe = /Salmonella(?:[ ](?:arizonae|typhimurium|enterica|bongori))?|Alphitobius[ ]+diaperinus/g;
        let sm;
        while ((sm = taxRe.exec(text)) !== null) {
          if (sm.index > last) parts.push({ t: text.slice(last, sm.index), i: false });
          parts.push({ t: sm[0], i: true });
          last = sm.index + sm[0].length;
        }
        if (last < text.length) parts.push({ t: text.slice(last), i: false });
        return parts
          .filter(p => p.t.length > 0)
          .map(p => `${rOpen}${p.i ? rPrItalic : rPr}<w:t xml:space="preserve">${p.t}</w:t></w:r>`)
          .join('');
      }
    );
  });

  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found), Word will reject`);

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
}

main().catch(err => { console.error(err); process.exit(1); });
