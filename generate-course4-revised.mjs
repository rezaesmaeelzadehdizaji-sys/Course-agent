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
      para('Salmonella is one of the most common bacterial pathogens linked to foodborne illness worldwide, and commercial poultry operations are a primary reservoir. What makes this pathogen particularly challenging is that infected birds often appear completely healthy, showing no clinical signs while actively shedding the bacteria in their droppings and contaminating their environment [1]. This silent carriage means that a flock can test positive at the processing plant even when the farmer has observed no signs of disease in the barn.'),
      para('In Canada, Salmonella contamination in poultry products is a significant public health concern. The Public Health Agency of Canada (PHAC) estimates that non-typhoidal Salmonella causes approximately 87,500 illnesses, 925 hospitalizations, and 17 deaths per year in Canada, with poultry among the leading sources [2]. For commercial poultry farmers, this creates both a legal obligation and a market responsibility: products must meet Canadian Food Inspection Agency (CFIA) standards, and consumer trust depends on consistent food safety practices throughout the production chain [3].'),
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
      bullet([{ text: 'Paratyphoid serovars: ', bold: true }, { text: 'A large group including SE, ST, and Salmonella Infantis. These serovars typically cause little or no visible disease in adult birds but are readily transmitted to humans through contaminated products. Most common food safety concern in Canadian broiler and layer operations [1,2].' }]),
      bullet([{ text: 'Host-adapted serovars: ', bold: true }, { text: 'Salmonella Pullorum (pullorum disease) and Salmonella Gallinarum (fowl typhoid). Both are reportable diseases in Canada under federal and provincial legislation. Any suspected case must be reported to CFIA immediately [3].' }]),
      bullet([{ text: 'Arizonosis: ', bold: true }, { text: 'Caused by Salmonella arizonae, primarily a concern in turkey flocks. Less common in Canada [4].' }]),
      ...image(imgBuf(1), 'Figure 1.1: Salmonella classification in commercial poultry. Paratyphoid serovars (SE, ST) are the primary food safety concern. Pullorum disease and fowl typhoid are reportable diseases in Canada. (Generated diagram, CPC Short Courses.)'),
      h2('1.2 The Biology of Salmonella'),
      para('Here is what makes Salmonella so hard to get rid of once it is in your barn — and why shortcuts in cleanout always come back to bite you:'),
      bullet([{ text: 'Environmental persistence: ', bold: true }, { text: 'Salmonella can survive in dry litter, dust, soil, and on equipment surfaces for weeks to months under favorable conditions [1,5].' }]),
      bullet([{ text: 'Wide temperature range: ', bold: true }, { text: 'The organism multiplies between 7 and 48°C, with an optimum around 37°C. Improperly refrigerated products can support rapid bacterial growth.' }]),
      bullet([{ text: 'Resistance to drying: ', bold: true }, { text: 'Salmonella in dried poultry feces or dust can remain viable for extended periods, making thorough cleanout and disinfection between flocks essential [5].' }]),
      bullet([{ text: 'Heat sensitivity: ', bold: true }, { text: 'Salmonella is destroyed by cooking. An internal temperature of 74°C for at least 15 seconds kills the organism [2].' }]),
      ...image(imgBuf0(), 'Figure 1.2: Scientific illustration of Salmonella typhimurium. Each cell is a rod-shaped (bacillus) gram-negative bacterium measuring 0.7-1.5 x 2-5 micrometres. Peritrichous flagella (visible as thin filaments projecting in all directions) give the organism motility and aid colonization of the intestinal tract. (Generated scientific illustration, CPC Short Courses. Actual electron micrographs to be supplied by the CPC team.)', 5.8),
      h2('1.3 How Salmonella Affects Birds'),
      para('In commercial broiler and layer operations, adult birds infected with paratyphoid serovars typically show no clinical signs. They are colonized in the intestinal tract and shed bacteria intermittently in their feces, contaminating litter, water, and the environment [1].'),
      para('Clinical disease is more common in young chicks under three weeks of age and may present as:'),
      bullet('Weakness and lethargy'),
      bullet('Huddling and chilling'),
      bullet('Diarrhea and pasting of the vent'),
      bullet('Increased mortality in the first week of life'),
      para('For layer flocks, Salmonella Enteritidis is of particular concern because it can colonize the reproductive tract of hens and contaminate the internal contents of intact, clean-shelled eggs before the shell is formed, a route called transovarian (vertical) transmission [1,6]. This means that an egg can be internally contaminated even if the shell appears clean and uncracked.'),
      h2('1.4 How Salmonella Affects Humans'),
      para('Human salmonellosis typically presents as an acute gastrointestinal illness beginning 6 to 72 hours after ingestion of contaminated food. Symptoms include nausea and vomiting, abdominal cramping and diarrhea (which may be bloody), fever (38 to 39°C), and headache. In healthy adults, illness is usually self-limiting, resolving within 4 to 7 days [2].'),
      para('In vulnerable groups, including children under five, the elderly, pregnant women, and immunocompromised individuals, the illness can be severe and life-threatening. Antimicrobial resistance in Salmonella is a growing concern; responsible antimicrobial use on the farm helps slow the development and spread of resistance [2,7].'),
      h2('1.5 How Salmonella Spreads: Transmission Routes'),
      para('Salmonella spreads through two main routes: vertical (egg-transmitted) and horizontal (within-flock and farm-to-farm spread). Understanding both is essential for building an effective control strategy [1].'),
      h3('Vertical Transmission'),
      para('Vertical transmission occurs when Salmonella passes from a hen to her eggs, either by contaminating the eggshell during laying or by colonizing the reproductive tract itself. Breeder flocks that test positive for SE can pass the infection to their offspring through contaminated hatching eggs, establishing Salmonella in the day-old chick population before the birds arrive on the grow-out farm [1,6].'),
      h3('Horizontal Transmission'),
      para('Horizontal transmission is the most common route in commercial broiler and layer operations. It includes contaminated feed, unclean water or drinker biofilm, vectors and vermin (rodents, flies, darkling beetles, wild birds), movement of people and equipment between barns, and contaminated litter [1,5].'),
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
      para('Feed is one of the most significant risk factors for introducing Salmonella into a flock. Raw feed ingredients, especially those of animal origin such as meat and bone meal, feather meal, and fish meal, can carry Salmonella [5]. Although feed mills use heat treatment to reduce bacterial contamination, post-process contamination during storage and transport can reintroduce the organism. Key feed-related risks include:'),
      bullet('Purchasing feed from suppliers without documented Salmonella control programs'),
      bullet('Storing feed in open bins accessible to rodents and wild birds'),
      bullet('Using damaged feed bags or bins where moisture can enter and support bacterial growth'),
      bullet('Providing feed that has been stored too long, especially in warm, humid conditions'),
      h2('2.2 Contaminated Water'),
      para('Most farmers watch their feed closely but overlook water as a Salmonella entry point. Surface water from dugouts, ponds, or open streams carries a high bacterial load, and well water can be compromised through seasonal fluctuations or aging infrastructure [1]. The bigger issue inside the barn is biofilm: the sticky buildup on the inner walls of your drinker lines that accumulates over the course of a flock. Salmonella shelters inside biofilm and survives regular flushing — it takes a proper water-line flush with an approved acidic or enzyme-based cleaner to break it down. If you are not cleaning drinker lines at turnover, you are starting every flock with a contaminated water system.'),
      h2('2.3 Carrier Birds and Asymptomatic Shedding'),
      para('A flock that has been exposed to Salmonella may include a variable proportion of carrier birds: individuals that harbor the bacteria in their intestinal tract without showing any clinical signs. These birds shed Salmonella intermittently, contaminating litter and the surrounding environment [1]. Stressful events such as feed or water withdrawal, handling, transport, and co-infections can trigger increased shedding by carrier birds, elevating contamination levels in the barn. This is particularly relevant at the time of catching and loading for slaughter.'),
      h2('2.4 Wild Animals, Rodents, and Insects'),
      para('Wild animals are important reservoirs of Salmonella and can introduce new serovars onto the farm:'),
      bullet([{ text: 'Rodents (rats and mice): ', bold: true }, { text: 'Both can be heavily colonized with Salmonella and contaminate feed, water, and litter through their droppings and urine. A single rodent can shed millions of Salmonella organisms per gram of feces [5].' }]),
      bullet([{ text: 'Wild birds: ', bold: true }, { text: 'Starlings, sparrows, pigeons, and other species that gain access to poultry barns can introduce Salmonella through their droppings. Wild bird exclusion is a fundamental biosecurity measure [1].' }]),
      bullet([{ text: 'Darkling beetles (Alphitobius diaperinus): ', bold: true }, { text: 'These insects thrive in poultry litter and are known to harbor and transmit Salmonella. They are extremely difficult to eradicate once established and can maintain Salmonella between flock cycles even after thorough cleanout [1,5].' }]),
      bullet([{ text: 'Flies: ', bold: true }, { text: 'House flies and other insects can mechanically transfer Salmonella from contaminated manure or carcasses to feed, water, and barn surfaces.' }]),
      h2('2.5 Farm Worker Practices'),
      para('People are among the most mobile vectors on a poultry farm. Farm workers, veterinarians, service technicians, catching crews, and visitors can all carry Salmonella on their clothing, footwear, and hands from one barn or farm to another [1,5]. High-risk practices include:'),
      bullet('Moving between barns without changing boots and outer clothing'),
      bullet('Entering the barn after visiting another poultry farm without observing the required downtime'),
      bullet('Inadequate or no handwashing before and after barn entry'),
      bullet('Sharing equipment (shovels, rakes, forklifts) between barns without disinfection'),
      bullet('Allowing catching crews onto the farm without enforcing your biosecurity protocols'),
      h2('2.6 Equipment and Litter'),
      para('Any object that can carry contamination between animals or locations is a fomite. Common fomites for Salmonella in poultry production include egg flats and crates, chick delivery boxes, feed delivery vehicles, litter removal equipment, and dead bird containers. Poultry litter also accumulates a large reservoir of Salmonella over the course of a grow-out cycle [1,5].'),
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
      para('All-in and all-out (AIAO) management, placing and removing an entire flock at one time and fully cleaning and disinfecting before the next placement, is the single most effective management tool for breaking the cycle of Salmonella between flocks [1]. Continuous housing, where new birds are introduced while older birds remain, dramatically increases the probability of Salmonella carryover.'),
      ...image(imgBuf(5), 'Figure 3.1: Biosecurity zones and entry protocol. The clean zone (left) encompasses the production barn and dedicated equipment. The entry point (centre) enforces boot dips, coverall changes, handwashing, and visitor logging. The outside zone (right) includes public roads and delivery vehicles, which must not cross the line. (Generated diagram, CPC Short Courses.)'),
      h2('3.2 Feed and Water Safety'),
      para('Start with your feed supplier: ask specifically whether their program includes heat treatment of finished feed, post-processing contamination controls, and routine environmental Salmonella testing. If they cannot show you documentation, find a supplier who can [5]. On the farm, protect every bag and bin: sealed, covered storage, no residual feed left between flocks, and zero rodent access to any feed storage area.'),
      para('For water: test well water for total coliform and E. coli at least annually. Install and maintain an in-line treatment system (chlorination or acidification is appropriate for most Canadian operations). Flush and clean drinker lines at the end of every flock cycle with an approved water-line cleaner to break down biofilm [1].'),
      h2('3.3 Competitive Exclusion'),
      para('Competitive exclusion (CE) works on a simple principle: get the right bacteria into your chicks before Salmonella does. These products, which contain defined mixtures of beneficial intestinal bacteria, are applied to day-old chicks to colonize the gut and crowd out Salmonella before it gets a foothold [1,5]. CE is most effective when given at hatch — before any Salmonella exposure — and when used alongside a broader biosecurity and management program. Several CE products are licensed for use in Canada. Ask your veterinarian which product fits your intake schedule and production type.'),
      h2('3.4 Vaccination'),
      para('Vaccines against Salmonella Enteritidis are available in Canada and are used primarily in layer and breeder flocks, where the risk of vertical transmission and persistent flock colonization is highest [1,8].'),
      bullet([{ text: 'Live attenuated vaccines: ', bold: true }, { text: 'Stimulate both systemic and mucosal immunity. Typically administered in water or by spray to young pullets. Boost intestinal immunity and reduce colonization.' }]),
      bullet([{ text: 'Killed vaccines: ', bold: true }, { text: 'Used as a booster following live vaccination, usually administered by injection near the time of transfer to the layer barn. Boost systemic immunity and are associated with reduced egg contamination rates [1,8].' }]),
      para('Vaccination does not eliminate Salmonella from a flock, but it reduces the level of intestinal colonization and the probability of transovarian transmission. It is most effective when combined with biosecurity and management controls. Consult your integrator or provincial veterinarian regarding vaccination requirements [3].'),
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
      para('Manure and litter from Salmonella-positive flocks must be handled carefully to prevent spreading contamination to adjacent fields, waterways, or neighboring farms. Store litter and manure in covered, contained areas away from barn entrances, water sources, and neighboring property. Do not apply fresh (untreated) manure from a positive flock to fields used for growing vegetables or fruits consumed raw. Dead bird disposal must comply with provincial regulations; remove dead birds daily and process immediately [5,9].'),
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
      para('The 24 to 48 hours before catching and transport represent a high-risk period for Salmonella. Stress from feed withdrawal, catching, and transport triggers increased shedding by carrier birds, and fecal contamination of feathers during catching can raise carcass contamination levels at the plant [1,5].'),
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
      para('Cross-contamination is the transfer of Salmonella from raw poultry to ready-to-eat foods, and is a leading cause of human salmonellosis linked to poultry [2]. For farms involved in direct sales, cross-contamination prevention is your responsibility. Key practices:'),
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
