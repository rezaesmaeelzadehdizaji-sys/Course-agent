// ============================================================
// generate-course4.mjs — Course 4: Salmonella & Food Safety
// CPC Short Courses — Canadian Poultry Training Series
// Uses docx v9.6.1 (local node_modules)
// Run: node generate-course4.mjs
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Tab,
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
  LevelFormat,
  TabStopType,
  LeaderType,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 4');
const OUT_FILE  = path.join(OUT_DIR, '4-Salmonella_and_Food_Safety.docx');
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

// Static TOC entries with dot leader tab stop and estimated page number
const TOC_TAB = 8640; // 6 inches from left margin in twips (fits 1.25" margins on letter)
function tocLine1(text, page) {
  return new Paragraph({
    children: [
      new TextRun({ text, bold: true, color: DARK_BLUE, size: 22, font: 'Calibri' }),
      new TextRun({ children: [new Tab()] }),
      new TextRun({ text: String(page), bold: true, color: DARK_BLUE, size: 22, font: 'Calibri' }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: TOC_TAB, leader: LeaderType.DOT }],
    spacing: { after: 120, line: 240, lineRule: 'auto' },
  });
}
function tocLine2(text, page) {
  return new Paragraph({
    children: [
      new TextRun({ text, color: MED_BLUE, size: 20, font: 'Calibri' }),
      new TextRun({ children: [new Tab()] }),
      new TextRun({ text: String(page), color: MED_BLUE, size: 20, font: 'Calibri' }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: TOC_TAB, leader: LeaderType.DOT }],
    spacing: { after: 60, line: 240, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.3) },
  });
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
// TABLE OF CONTENTS — static with estimated page numbers
// ============================================================
function buildTocSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      tocLine1('Introduction', 4),
      tocLine2('Learning Objectives', 4),
      tocLine2('Course Agenda', 4),
      tocLine2('Important Notes for Participants', 5),
      tocLine1('Section 1: Understanding Salmonella', 5),
      tocLine2('1.1  What Is Salmonella?', 5),
      tocLine2('1.2  The Biology of Salmonella', 6),
      tocLine2('1.3  How Salmonella Affects Birds', 6),
      tocLine2('1.4  How Salmonella Affects Humans', 7),
      tocLine2('1.5  How Salmonella Spreads: Transmission Routes', 7),
      tocLine1('Section 2: Risks on the Poultry Farm', 8),
      tocLine2('2.1  Contaminated Feed', 8),
      tocLine2('2.2  Contaminated Water', 8),
      tocLine2('2.3  Carrier Birds and Asymptomatic Shedding', 9),
      tocLine2('2.4  Wild Animals, Rodents, and Insects', 9),
      tocLine2('2.5  Farm Worker Practices', 9),
      tocLine2('2.6  Equipment and Litter', 10),
      tocLine1('Section 3: Prevention and Control Measures', 10),
      tocLine2('3.1  Biosecurity: The Foundation', 10),
      tocLine2('3.2  Feed and Water Safety', 11),
      tocLine2('3.3  Competitive Exclusion', 11),
      tocLine2('3.4  Vaccination', 12),
      tocLine2('3.5  Rodent and Pest Control', 12),
      tocLine2('3.6  Salmonella Monitoring and Testing', 12),
      tocLine1('Section 4: Good Hygiene Practices', 13),
      tocLine2('4.1  Handwashing', 13),
      tocLine2('4.2  Protective Clothing and Footwear', 13),
      tocLine2('4.3  Barn Cleanout and Disinfection', 14),
      tocLine2('4.4  Waste Management', 15),
      tocLine1('Section 5: Safe Processing and Storage', 15),
      tocLine2('5.1  Pre-Harvest Management', 15),
      tocLine2('5.2  Temperature Control', 16),
      tocLine2('5.3  Egg Safety: On-Farm Practices for Layer Operations', 16),
      tocLine2('5.4  Preventing Cross-Contamination', 17),
      tocLine1('Section 6: Farmer Responsibilities and Consumer Safety', 18),
      tocLine2('6.1  Regulatory Framework in Canada', 18),
      tocLine2('6.2  Record-Keeping', 18),
      tocLine2('6.3  Monitoring Flock Health', 19),
      tocLine2('6.4  Key Takeaways', 19),
      tocLine1('Recommended Peer-Reviewed Journals', 20),
      tocLine1('References', 21),
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
      para('This course gives you, the farmer, a practical understanding of what Salmonella is, how it enters and spreads through your operation, and what you can do to reduce the risk. We cover biosecurity, hygiene, processing, storage, record-keeping, and your regulatory responsibilities. By the end of this session, you will have the tools to identify high-risk points on your farm and implement targeted, evidence-based control measures.'),
      h2('Learning Objectives'),
      para('By completing this course, you will be able to:'),
      bullet('Explain what Salmonella is and why it is a major food safety concern in poultry farming.'),
      bullet('Identify common sources and pathways through which Salmonella enters and spreads on a poultry farm.'),
      bullet('Recognize the risks Salmonella poses to birds, farm workers, and consumers.'),
      bullet('Apply basic biosecurity practices to reduce the chance of Salmonella contamination.'),
      bullet('Demonstrate good hygiene practices such as proper handwashing, cleaning, and use of protective clothing.'),
      bullet('Implement safe handling, processing, and storage of poultry meat and eggs to prevent foodborne illness.'),
      bullet('Monitor and maintain farm records related to flock health and cleanliness to support food safety standards.'),
      bullet('Make informed decisions that improve product safety and consumer confidence.'),
      h2('Course Agenda'),
      numbered('Welcome and Introduction'),
      numbered('Understanding Salmonella'),
      numbered('Risks on the Poultry Farm'),
      numbered('Prevention and Control Measures'),
      numbered('Good Hygiene Practices'),
      numbered('Safe Processing and Storage'),
      numbered('Farmer Responsibilities and Consumer Safety'),
      numbered('Q and A Discussion'),
      numbered('Summary and Key Takeaways'),
      h2('Important Notes for Participants'),
      bullet('Please bring note-taking materials to this session.'),
      bullet('A certificate of completion is available to all participants who attend the full lecture.'),
      bullet('Questions are welcome throughout; a dedicated Q and A period is scheduled at the end.'),
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
      para('Salmonella is a genus of gram-negative, rod-shaped bacteria belonging to the family Enterobacteriaceae. More than 2,600 distinct serovars (antigenic variants) have been identified, but only a subset are of practical significance in commercial poultry production [1]. The two serovars most commonly associated with human foodborne illness from poultry in Canada are Salmonella Enteritidis (SE) and Salmonella Typhimurium (ST) [2].'),
      para('In poultry, Salmonella infections fall into three categories based on host range and clinical presentation:'),
      bullet([{ text: 'Paratyphoid serovars: ', bold: true }, { text: 'A large group including SE, ST, and Salmonella Infantis. These serovars typically cause little or no visible disease in adult birds but are readily transmitted to humans through contaminated products. Most common food safety concern in Canadian broiler and layer operations [1,2].' }]),
      bullet([{ text: 'Host-adapted serovars: ', bold: true }, { text: 'Salmonella Pullorum (pullorum disease) and Salmonella Gallinarum (fowl typhoid). Both are reportable diseases in Canada under federal and provincial legislation. Any suspected case must be reported to CFIA immediately [3].' }]),
      bullet([{ text: 'Arizonosis: ', bold: true }, { text: 'Caused by Salmonella arizonae, primarily a concern in turkey flocks. Less common in Canada [4].' }]),
      ...image(imgBuf(1), 'Figure 1.1: Salmonella classification in commercial poultry. Paratyphoid serovars (SE, ST) are the primary food safety concern. Pullorum disease and fowl typhoid are reportable diseases in Canada. (Generated diagram, CPC Short Courses.)'),
      h2('1.2 The Biology of Salmonella'),
      para('Understanding key biological characteristics of Salmonella explains why it is so difficult to eliminate from a farm environment:'),
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
      para('Salmonella can enter a poultry farm through multiple pathways, and once established in the barn environment, it is difficult to eliminate without a full cleanout and disinfection. Identifying the specific risk factors present on your farm is the first step toward effective control [1,5].'),
      h2('2.1 Contaminated Feed'),
      para('Feed is one of the most significant risk factors for introducing Salmonella into a flock. Raw feed ingredients, especially those of animal origin such as meat and bone meal, feather meal, and fish meal, can carry Salmonella [5]. Although feed mills use heat treatment to reduce bacterial contamination, post-process contamination during storage and transport can reintroduce the organism. Key feed-related risks include:'),
      bullet('Purchasing feed from suppliers without documented Salmonella control programs'),
      bullet('Storing feed in open bins accessible to rodents and wild birds'),
      bullet('Using damaged feed bags or bins where moisture can enter and support bacterial growth'),
      bullet('Providing feed that has been stored too long, especially in warm, humid conditions'),
      h2('2.2 Contaminated Water'),
      para('Water is a less commonly recognized but important route of Salmonella entry and maintenance on poultry farms [1]. Surface water from ponds, dugouts, or open streams is particularly high risk. Biofilms that form on the inner surfaces of water lines provide a protected environment where Salmonella and other pathogens can survive regular flushing.'),
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
      para('No single intervention eliminates Salmonella from a commercial poultry operation. An effective program requires a layered approach, combining biosecurity, feed and water management, environmental controls, competitive exclusion, vaccination, and monitoring. Each layer reduces the probability of Salmonella introduction or amplification; together, they provide meaningful risk reduction [1,5].'),
      h2('3.1 Biosecurity: The Foundation'),
      para('Biosecurity is the set of practices that prevent the introduction of disease agents into your farm and their spread between barns. For Salmonella, it addresses the most common entry routes: people, vehicles, equipment, and live birds [1,5].'),
      bullet('Establish a clearly marked farmyard boundary. Limit the number of entry points and post biosecurity requirement signs at all entry points.'),
      bullet('Maintain a visitor log. Record the name, organization, date, and any recent poultry farm contacts for every person who enters the production area.'),
      bullet('Require a minimum 48-hour downtime for anyone who has visited another poultry operation before entering your barns.'),
      bullet('Require all delivery vehicles to be washed and disinfected before entering the production area whenever possible.'),
      h3('All-In and All-Out Management'),
      para('All-in and all-out (AIAO) management, placing and removing an entire flock at one time and fully cleaning and disinfecting before the next placement, is the single most effective management tool for breaking the cycle of Salmonella between flocks [1]. Continuous housing, where new birds are introduced while older birds remain, dramatically increases the probability of Salmonella carryover.'),
      ...image(imgBuf(5), 'Figure 3.1: Biosecurity zones and entry protocol. The clean zone (left) encompasses the production barn and dedicated equipment. The entry point (centre) enforces boot dips, coverall changes, handwashing, and visitor logging. The outside zone (right) includes public roads and delivery vehicles, which must not cross the line. (Generated diagram, CPC Short Courses.)'),
      h2('3.2 Feed and Water Safety'),
      para('Work with your feed supplier to verify that their Salmonella control program includes heat treatment of finished feed, post-process contamination controls, and regular environmental Salmonella monitoring. On the farm, protect feed from contamination by maintaining covered, sealed bins, cleaning out residual feed between flocks before re-filling, and eliminating rodent access to all feed storage areas [5].'),
      para('For water: test well water for total coliform and E. coli at least annually. Install and maintain an in-line water treatment system (chlorination or acidification). Flush and clean drinker lines at the end of each flock cycle using an approved water-line cleaner to remove biofilm [1].'),
      h2('3.3 Competitive Exclusion'),
      para('Competitive exclusion (CE) products contain defined mixtures of beneficial bacteria that, when administered to chicks at hatch or early in life, colonize the intestinal tract and prevent Salmonella from establishing. CE is most effective when administered to day-old chicks before Salmonella exposure occurs, and when combined with other biosecurity and management measures [1,5]. Several CE products are licensed for use in Canada. Consult your veterinarian to select an appropriate product for your operation.'),
      h2('3.4 Vaccination'),
      para('Vaccines against Salmonella Enteritidis are available in Canada and are used primarily in layer and breeder flocks, where the risk of vertical transmission and persistent flock colonization is highest [1,8].'),
      bullet([{ text: 'Live attenuated vaccines: ', bold: true }, { text: 'Stimulate both systemic and mucosal immunity. Typically administered in water or by spray to young pullets. Boost intestinal immunity and reduce colonization.' }]),
      bullet([{ text: 'Killed vaccines: ', bold: true }, { text: 'Used as a booster following live vaccination, usually administered by injection near the time of transfer to the layer barn. Boost systemic immunity and are associated with reduced egg contamination rates [1,8].' }]),
      para('Vaccination does not eliminate Salmonella from a flock, but it reduces the level of intestinal colonization and the probability of transovarian transmission. It is most effective when combined with biosecurity and management controls. Consult your integrator or provincial veterinarian regarding vaccination requirements [3].'),
      h2('3.5 Rodent and Pest Control'),
      para('An active, documented rodent control program is a core component of Salmonella prevention. Key elements include:'),
      bullet('Regular inspection of the barn perimeter and interior for signs of rodent activity (droppings, gnaw marks, burrows, runways).'),
      bullet('Maintaining an uncluttered cleared zone around the exterior of all barn buildings to eliminate rodent harborage.'),
      bullet('Sealing all gaps larger than 6 mm in barn walls, foundations, and roof lines.'),
      bullet('Placing and maintaining bait stations at regular intervals around the barn perimeter and under feed storage bins.'),
      bullet('Keeping records of rodent activity levels and bait consumption to track program effectiveness.'),
      h2('3.6 Salmonella Monitoring and Testing'),
      para('In Canada, the CFIA oversees the National Salmonella Action Plan for Chicken (NSAPC), which requires commercial broiler integrators to implement pre-harvest Salmonella testing programs. Understanding your flock testing results helps you evaluate the effectiveness of your biosecurity program and identify barns or flocks with persistent Salmonella issues. When a flock tests positive: review and reinforce biosecurity and cleaning protocols for the affected barn, investigate likely sources of introduction, and consult with your veterinarian regarding additional control measures [3].'),
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
      para('Good Hygiene Practices (GHP) are the day-to-day personal and environmental hygiene habits that prevent the spread of Salmonella on the farm. GHP forms the behavioral backbone of any biosecurity program: even the best written protocols fail when individual hygiene habits are inconsistent [5,9].'),
      h2('4.1 Handwashing'),
      para('Hands are one of the most effective transfer mechanisms for Salmonella between people, birds, and surfaces. Correct handwashing procedure:'),
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
      para('The cleanout and disinfection protocol between flocks is the most critical hygiene event in the barn cycle. A thorough cleanout removes the bulk of the organic material in which Salmonella survives, and disinfection reduces the residual bacterial population to a level that is much less likely to re-infect the incoming flock [1,5].'),
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
      para('For most commercial poultry producers in Canada, federally or provincially inspected processing plants handle the slaughter and primary processing of birds. However, farmers play a critical role in the food safety continuum by managing bird health, reducing pre-harvest Salmonella colonization levels, and ensuring proper handling from the barn to the loading dock [3,6].'),
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
      para('Canadian commercial poultry farmers operate within a regulatory framework that places specific food safety obligations on them. Beyond regulatory compliance, maintaining consumer confidence depends on a culture of food safety embedded in every aspect of farm management [3,9].'),
      h2('6.1 Regulatory Framework in Canada'),
      bullet([{ text: 'Canadian Food Inspection Agency (CFIA): ', bold: true }, { text: 'Oversees the Safety of Human Food Regulations and administers the National Salmonella Action Plan for Chicken (NSAPC). The NSAPC includes pre-harvest surveillance of commercial broiler flocks, with testing conducted at defined intervals before slaughter. Positive flock results may trigger additional interventions at the processing plant [3].' }]),
      bullet([{ text: 'Chicken Farmers of Canada (CFC): ', bold: true }, { text: 'Administers the On-Farm Food Safety (OFFS) Program for broiler producers, which requires documented biosecurity and Salmonella control practices. Producers are subject to third-party audits [3].' }]),
      bullet([{ text: 'Egg Farmers of Canada (EFC): ', bold: true }, { text: 'Administers the Start Clean and Stay Clean on-farm food safety program for commercial egg producers, which includes requirements for Salmonella control and flock testing [3].' }]),
      bullet([{ text: 'Reportable diseases: ', bold: true }, { text: 'Salmonella Pullorum and Salmonella Gallinarum are reportable diseases under federal and most provincial regulations. Any suspected case must be reported to your provincial veterinarian or the CFIA immediately [3].' }]),
      h2('6.2 Record-Keeping'),
      para('Accurate, complete record-keeping is the evidence base for your food safety program. Minimum records to maintain:'),
      bullet([{ text: 'Visitor and crew log: ', bold: true }, { text: 'Date, name, organization, and recent farm contacts for every person who enters the production area.' }]),
      bullet([{ text: 'Flock placement records: ', bold: true }, { text: 'Source of chicks or pullets, arrival date, number of birds, any health concerns noted at delivery.' }]),
      bullet([{ text: 'Feed records: ', bold: true }, { text: 'Feed supplier, delivery dates, batch or lot numbers. Retain delivery tickets.' }]),
      bullet([{ text: 'Cleanout and disinfection records: ', bold: true }, { text: 'Date, products used, concentrations, contact times, and environmental swab results for each flock cycle.' }]),
      bullet([{ text: 'Salmonella testing results: ', bold: true }, { text: 'Flock-level results from integrator or provincial testing programs and any on-farm environmental monitoring results.' }]),
      bullet([{ text: 'Pest control records: ', bold: true }, { text: 'Dates of inspections, rodent activity levels observed, bait products used, and contractor visit records.' }]),
      para('All records should be retained for a minimum of 2 years or as required by your provincial food safety program.'),
      h2('6.3 Monitoring Flock Health'),
      para('Daily observation of your flock is the most important early warning system for Salmonella and other disease events. Because Salmonella infection in adult birds is usually subclinical, routine monitoring focuses on indicators that may signal increased bacterial burden:'),
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
  //  1. Remove <w:updateFields> from settings.xml
  //  2. Italicize formal Latin genus/species names in all body text runs
  //     - Salmonella (genus) + optional lowercase species (arizonae, typhimurium): italic
  //     - Serovar names starting with capital letter (Enteritidis, Typhimurium, Pullorum,
  //       Gallinarum, Infantis) are NOT italicized per standard microbiological style
  //     - Alphitobius diaperinus (darkling beetle): italic
  //     - Section headings (Heading1/2/3) are excluded
  const zip = await JSZip.loadAsync(buffer);

  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  zip.file('word/settings.xml', settings);

  let docXml = await zip.file('word/document.xml').async('string');

  docXml = docXml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, para => {
    // Skip section headings
    if (/w:val="Heading[123]"/.test(para)) return para;
    // Process each text run within this paragraph
    return para.replace(
      /(<w:r\b[^>]*>)((?:<w:rPr>[\s\S]*?<\/w:rPr>)?)(<w:t(?:\s+xml:space="preserve")?>)([\s\S]*?)(<\/w:t>\s*<\/w:r>)/g,
      (m, rOpen, rPr, _tOpen, text) => {
        if (!/Salmonella|Alphitobius/.test(text)) return m;
        // Build italic variant of the run's rPr (insert <w:i/> after opening <w:rPr>)
        const rPrItalic = rPr
          ? rPr.replace('<w:rPr>', '<w:rPr><w:i/>')
          : '<w:rPr><w:i/></w:rPr>';
        // Split text into italic (genus/species) and non-italic (serovar, surrounding) segments
        const parts = [];
        let last = 0;
        // Only match known species names (lowercase) — NOT common English words
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
