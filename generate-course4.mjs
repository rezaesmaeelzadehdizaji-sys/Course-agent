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
  NumberFormat,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'Course 4');
const OUT_FILE = path.join(OUT_DIR, '4-Salmonella_and_Food_Safety.docx');

// ============================================================
// COLOUR PALETTE
// ============================================================
const DARK_BLUE   = '1F3864';
const MED_BLUE    = '2E6DA4';
const LIGHT_BLUE  = 'DDEEFF';
const GOLD        = 'C9A84C';
const BODY_GRAY   = '3C3C3C';
const PLACEHOLDER_GRAY = 'F2F2F2';
const BORDER_GRAY = 'AAAAAA';
const WHITE       = 'FFFFFF';
const RED_WARN    = 'CC0000';

// ============================================================
// HELPER: plain paragraph
// ============================================================
function para(text, opts = {}) {
  const runs = [];
  if (Array.isArray(text)) {
    text.forEach(seg => {
      runs.push(new TextRun({
        text: seg.text,
        bold: seg.bold || false,
        italics: seg.italics || false,
        color: seg.color || BODY_GRAY,
        size: seg.size || 24,
        font: 'Calibri',
      }));
    });
  } else {
    runs.push(new TextRun({
      text,
      bold: opts.bold || false,
      italics: opts.italics || false,
      color: opts.color || BODY_GRAY,
      size: opts.size || 24,
      font: 'Calibri',
    }));
  }
  return new Paragraph({
    children: runs,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent: opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
    style: opts.style || undefined,
  });
}

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function bullet(text, lvl = 0) {
  const runs = [];
  if (Array.isArray(text)) {
    text.forEach(seg => runs.push(new TextRun({
      text: seg.text,
      bold: seg.bold || false,
      italics: seg.italics || false,
      color: seg.color || BODY_GRAY,
      size: 24,
      font: 'Calibri',
    })));
  } else {
    runs.push(new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' }));
  }
  return new Paragraph({
    children: runs,
    numbering: { reference: 'bullet-list', level: lvl },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}

function numbered(text, lvl = 0) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })],
    numbering: { reference: 'numbered-list', level: lvl },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}

function spacer(lines = 1) {
  const children = [];
  for (let i = 0; i < lines; i++) {
    children.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 0 } }));
  }
  return children;
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Image placeholder: single-cell gray table + caption
function imagePlaceholder(caption) {
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: PLACEHOLDER_GRAY, type: ShadingType.CLEAR, color: PLACEHOLDER_GRAY },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: BORDER_GRAY },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_GRAY },
              left: { style: BorderStyle.SINGLE, size: 6, color: BORDER_GRAY },
              right: { style: BorderStyle.SINGLE, size: 6, color: BORDER_GRAY },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '[IMAGE PLACEHOLDER]',
                    bold: true,
                    color: '888888',
                    size: 22,
                    font: 'Calibri',
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 600, after: 600 },
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const captionPara = new Paragraph({
    children: [
      new TextRun({
        text: caption,
        italics: true,
        color: '555555',
        size: 20,
        font: 'Calibri',
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200 },
  });

  return [table, captionPara];
}

// Bold label + normal text inline helper
function boldInline(label, rest, opts = {}) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, color: BODY_GRAY, size: 24, font: 'Calibri' }),
      new TextRun({ text: rest, color: BODY_GRAY, size: 24, font: 'Calibri' }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
  });
}

// ============================================================
// HEADER / FOOTER
// ============================================================
function buildHeader(title) {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ text: title, color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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

// ============================================================
// COVER PAGE
// ============================================================
function buildCoverSection() {
  const header = buildHeader('Salmonella and Food Safety');
  const footer = buildFooter();

  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: header },
    footers: { default: footer },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'Canadian Poultry Training Series', color: MED_BLUE, size: 24, font: 'Calibri Light', bold: false })],
        alignment: AlignmentType.CENTER,
        spacing: { before: convertInchesToTwip(1.2), after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Course 4 of 17', color: GOLD, size: 22, font: 'Calibri', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Salmonella', color: DARK_BLUE, size: 72, font: 'Calibri Light', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: '& Food Safety', color: DARK_BLUE, size: 64, font: 'Calibri Light', bold: false })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Protecting Your Flock, Your Farm, and Your Customers',
            color: MED_BLUE,
            size: 28,
            font: 'Calibri',
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Table({
        width: { size: 60, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: DARK_BLUE, type: ShadingType.CLEAR, color: DARK_BLUE },
                borders: {
                  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({ children: [new TextRun({ text: '', size: 4 })], spacing: { after: 0 } }),
                ],
              }),
            ],
          }),
        ],
      }),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({ text: 'Canadian Poultry Consultants (CPC)', color: BODY_GRAY, size: 22, font: 'Calibri', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'April 2026  |  Version 1.0', color: '888888', size: 20, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Duration: 1.5-Hour Lecture',
            color: MED_BLUE,
            size: 20,
            font: 'Calibri',
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Disclaimer: ',
            bold: true,
            color: '555555',
            size: 18,
            font: 'Calibri',
          }),
          new TextRun({
            text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature, industry management guides, and regulatory documents. Items marked [NEEDS SOURCE] require additional verification before publication. This material does not replace the advice of a licensed veterinarian or regulatory authority.',
            color: '555555',
            size: 18,
            font: 'Calibri',
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 80 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY },
        },
      }),
      pageBreak(),
    ],
  };
}

// ============================================================
// TABLE OF CONTENTS
// ============================================================
function buildTocSection() {
  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', {
        hyperlink: true,
        headingStyleRange: '1-3',
        stylesWithLevels: [
          { styleName: 'Heading 1', level: 1 },
          { styleName: 'Heading 2', level: 2 },
          { styleName: 'Heading 3', level: 3 },
        ],
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
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Introduction'),
      para(
        'Salmonella is one of the most common bacterial pathogens linked to foodborne illness worldwide, and commercial poultry operations are a primary reservoir. What makes this pathogen particularly challenging is that infected birds often appear completely healthy, showing no clinical signs while actively shedding the bacteria in their droppings and contaminating their environment [1]. This silent carriage means that a flock can test positive at the processing plant even when the farmer has observed no signs of disease in the barn.'
      ),
      para(
        'In Canada, Salmonella contamination in poultry products is a significant public health concern. The Public Health Agency of Canada (PHAC) estimates that non-typhoidal Salmonella causes approximately 87,500 illnesses, 925 hospitalizations, and 17 deaths per year in Canada, with poultry among the leading sources [2]. For commercial poultry farmers, this creates both a legal obligation and a market responsibility: products must meet Canadian Food Inspection Agency (CFIA) standards, and consumer trust depends on consistent food safety practices throughout the production chain [3].'
      ),
      para(
        'This course is designed to give you, the farmer, a practical understanding of what Salmonella is, how it enters and spreads through your operation, and what you can do to reduce the risk. We will cover biosecurity, hygiene, processing, storage, record-keeping, and your responsibilities as a producer. By the end of this session, you will have the tools to identify high-risk points on your farm and implement targeted, evidence-based control measures.'
      ),
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
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Section 1: Understanding Salmonella'),
      h2('1.1 What Is Salmonella?'),
      para(
        'Salmonella is a genus of gram-negative, rod-shaped bacteria belonging to the family Enterobacteriaceae. More than 2,600 distinct serovars (antigenic variants) have been identified, but only a subset are of practical significance in commercial poultry production [1]. The two serovars most commonly associated with human foodborne illness from poultry in Canada are Salmonella Enteritidis (SE) and Salmonella Typhimurium (ST) [2].'
      ),
      para(
        'In poultry, Salmonella infections are broadly classified into three categories based on host range and clinical presentation:'
      ),
      bullet([{ text: 'Host-adapted serovars: ', bold: true }, { text: 'Salmonella Pullorum and Salmonella Gallinarum. These serovars are highly adapted to chickens and turkeys and cause significant disease in young birds (pullorum disease) or in older flocks (fowl typhoid). Both are reportable diseases in Canada and are the subject of federal eradication programs [3].' }]),
      bullet([{ text: 'Paratyphoid serovars: ', bold: true }, { text: 'A large group including Salmonella Enteritidis, Salmonella Typhimurium, Salmonella Infantis, and others. These serovars typically cause little or no visible disease in adult birds but are readily transmitted to humans through contaminated products [1].' }]),
      bullet([{ text: 'Arizonosis: ', bold: true }, { text: 'Caused by Salmonella arizonae, primarily a concern in turkey flocks. Less common in Canada than the other categories [4].' }]),
      para(
        'For commercial egg and broiler operations in Canada, the paratyphoid serovars, particularly SE and ST, represent the greatest food safety risk because they are maintained in apparently healthy flocks without producing obvious clinical signs [1,2].'
      ),
      h2('1.2 The Biology of Salmonella'),
      para(
        'Understanding a few key biological characteristics of Salmonella helps explain why it is so difficult to eliminate from a farm environment:'
      ),
      bullet([{ text: 'Environmental persistence: ', bold: true }, { text: 'Salmonella can survive in dry litter, dust, soil, and on equipment surfaces for weeks to months under favorable conditions. In moist litter at barn temperatures, survival can extend beyond six months [1,5].' }]),
      bullet([{ text: 'Wide temperature range: ', bold: true }, { text: 'The organism multiplies at temperatures between 7 and 48 degrees Celsius, with an optimum around 37 degrees. This means that improperly refrigerated products can support rapid bacterial growth.' }]),
      bullet([{ text: 'Resistance to drying: ', bold: true }, { text: 'Salmonella in dried poultry feces or dust can remain viable for extended periods, making thorough cleanout and disinfection between flocks essential [5].' }]),
      bullet([{ text: 'Minimal infectious dose: ', bold: true }, { text: 'In vulnerable human populations, as few as 15 to 20 organisms may be sufficient to cause illness, underscoring the importance of preventing any contamination of consumer products [2].' }]),
      bullet([{ text: 'Heat sensitivity: ', bold: true }, { text: 'Salmonella is destroyed by cooking. An internal temperature of 74 degrees Celsius for at least 15 seconds kills the organism. This is why properly cooked poultry products are safe even when the raw meat was contaminated [2].' }]),
      ...imagePlaceholder('Figure 1.1: Electron micrograph showing Salmonella bacteria (rod-shaped cells). Replace with an appropriate high-resolution image licensed for educational use.'),
      h2('1.3 How Salmonella Affects Birds'),
      para(
        'In commercial broiler and layer operations, adult birds infected with paratyphoid serovars typically show no clinical signs. They are colonized in the intestinal tract and shed bacteria intermittently in their feces, contaminating litter, water, and the environment around them [1].'
      ),
      para(
        'Clinical disease is more common in young chicks (under three weeks of age) and may present as:'
      ),
      bullet('Weakness and lethargy'),
      bullet('Huddling and chilling'),
      bullet('Diarrhea and pasting of the vent'),
      bullet('Increased mortality in the first week of life'),
      bullet('In some cases, joint swelling or nervous signs'),
      para(
        'In day-old chicks hatched from contaminated eggs (vertical transmission), septicemia can cause high mortality in the first few days of life. However, chicks that survive the neonatal period become carriers, shedding Salmonella into the flock environment for the remainder of the grow-out cycle [1,4].'
      ),
      para(
        'For layer flocks, Salmonella Enteritidis is of particular concern because it can colonize the reproductive tract of hens and contaminate the internal contents of intact, clean-shelled eggs before the shell is formed, a route called transovarian (vertical) transmission [1,6]. This means that an egg can be internally contaminated even if the shell appears clean and uncracked.'
      ),
      h2('1.4 How Salmonella Affects Humans'),
      para(
        'Human salmonellosis typically presents as an acute gastrointestinal illness beginning 6 to 72 hours after ingestion of contaminated food. Symptoms include:'
      ),
      bullet('Nausea and vomiting'),
      bullet('Abdominal cramping and diarrhea (which may be bloody)'),
      bullet('Fever (38 to 39 degrees Celsius)'),
      bullet('Headache and muscle aches'),
      para(
        'In healthy adults, illness is usually self-limiting, resolving within 4 to 7 days. However, in vulnerable groups, including children under five years, the elderly, pregnant women, and immunocompromised individuals, the illness can be severe and life-threatening. Invasive salmonellosis, where the bacteria enter the bloodstream, requires hospitalization and antibiotic treatment [2].'
      ),
      para(
        'Antimicrobial resistance is a growing concern. Some strains of Salmonella, particularly multi-drug resistant ST, are more difficult to treat and represent a heightened public health risk. Responsible antimicrobial use on the farm helps slow the development and spread of resistance [2,7].'
      ),
      h2('1.5 How Salmonella Spreads: Transmission Routes'),
      para(
        'Salmonella spreads through two main routes: vertical (egg-transmitted) and horizontal (barn-to-barn and within-flock spread). Understanding both is essential for building an effective control strategy [1].'
      ),
      h3('Vertical Transmission'),
      para(
        'Vertical transmission occurs when Salmonella passes from a hen to her eggs, either by contaminating the eggshell during laying (from infected feces in the nest) or by colonizing the reproductive tract itself, resulting in internal egg contamination. Breeder flocks that test positive for SE can pass the infection to their offspring through contaminated hatching eggs, establishing Salmonella in the day-old chick population before the birds arrive on the grow-out farm [1,6].'
      ),
      h3('Horizontal Transmission'),
      para(
        'Horizontal transmission is the most common route in commercial broiler and layer operations. It includes:'
      ),
      bullet([{ text: 'Bird-to-bird contact: ', bold: true }, { text: 'Infected birds shed Salmonella in feces; healthy birds ingest contaminated litter, feed, or water.' }]),
      bullet([{ text: 'Contaminated feed: ', bold: true }, { text: 'Improperly processed or stored feed can introduce Salmonella directly into the barn. Animal-protein feed ingredients (meat and bone meal, fish meal) carry a higher contamination risk than plant-based ingredients [5].' }]),
      bullet([{ text: 'Contaminated water: ', bold: true }, { text: 'Surface water, inadequately treated well water, or improperly maintained drinker systems can serve as a vehicle for Salmonella [1].' }]),
      bullet([{ text: 'Vectors and vermin: ', bold: true }, { text: 'Rodents, flies, beetles (particularly darkling beetles/Alphitobius diaperinus), and wild birds can carry and introduce Salmonella into the barn [1,5].' }]),
      bullet([{ text: 'People and equipment: ', bold: true }, { text: 'Farm workers, service technicians, and equipment moving between barns or farms can mechanically transfer Salmonella on boots, clothing, and tools [1].' }]),
      bullet([{ text: 'Contaminated litter: ', bold: true }, { text: 'Re-use of litter between flocks without proper treatment can carry over Salmonella from a positive flock to the next placement.' }]),
      ...imagePlaceholder('Figure 1.2: Diagram illustrating vertical and horizontal Salmonella transmission routes in a commercial poultry operation. Replace with original diagram.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 2: RISKS ON THE POULTRY FARM
// ============================================================
function buildSection2() {
  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Section 2: Risks on the Poultry Farm'),
      para(
        'Salmonella can enter a poultry farm through multiple pathways, and once established in the barn environment, it is difficult to eliminate without a full cleanout and disinfection. Identifying the specific risk factors present on your farm is the first step toward effective control [1,5].'
      ),
      h2('2.1 Contaminated Feed'),
      para(
        'Feed is one of the most significant risk factors for introducing Salmonella into a flock. Raw feed ingredients, especially those of animal origin such as meat and bone meal, feather meal, and fish meal, can carry Salmonella [5]. Although feed mills use heat treatment (pelleting) to reduce bacterial contamination, post-process contamination during storage and transport can reintroduce the organism.'
      ),
      para('Key feed-related risks include:'),
      bullet('Purchasing feed from suppliers without documented Salmonella control programs'),
      bullet('Storing feed in open bins or areas accessible to rodents and birds'),
      bullet('Using damaged feed bags or bins where moisture can enter and support bacterial growth'),
      bullet('Providing feed that has been stored too long, especially in warm, humid conditions'),
      bullet('Adding unprocessed agricultural by-products (kitchen scraps, bakery waste) to the diet without heat treatment'),
      h2('2.2 Contaminated Water'),
      para(
        'Water is a less commonly recognized but important route of Salmonella entry and maintenance on poultry farms [1]. Surface water from ponds, dugouts, or open streams is particularly high risk. Well water can be contaminated by surface runoff, especially near manure storage or in areas with high wildlife activity.'
      ),
      para('Drinker system hygiene is equally important. Biofilms that form on the inner surfaces of water lines provide a protected environment where Salmonella and other pathogens can survive regular flushing. Key practices for water risk reduction are addressed in Section 4.'),
      h2('2.3 Carrier Birds and Asymptomatic Shedding'),
      para(
        'A flock that has been exposed to Salmonella may include a variable proportion of carrier birds: individuals that harbor the bacteria in their intestinal tract without showing any clinical signs. These birds shed Salmonella intermittently, contaminating litter and the surrounding environment, and can trigger new cycles of infection within the flock [1].'
      ),
      para(
        'The proportion of shedders in a flock can fluctuate over the grow-out cycle. Stressful events such as feed or water withdrawal, handling, transport, and co-infections can trigger increased shedding by carrier birds, elevating contamination levels in the barn environment [1]. This is particularly relevant at the time of catching and loading for slaughter, when Salmonella shedding rates in broiler flocks typically rise sharply.'
      ),
      h2('2.4 Wild Animals, Rodents, and Insects'),
      para(
        'Wild animals are important reservoirs of Salmonella and can introduce new serovars onto the farm. Of particular concern are:'
      ),
      bullet([{ text: 'Rodents (rats and mice): ', bold: true }, { text: 'Both rats and mice can be heavily colonized with Salmonella and contaminate feed, water, and litter through their droppings and urine. A single rodent can shed millions of Salmonella organisms per gram of feces [5].' }]),
      bullet([{ text: 'Wild birds: ', bold: true }, { text: 'Starlings, sparrows, pigeons, and other species that gain access to poultry barns can introduce Salmonella through their droppings. Wild bird exclusion is a fundamental biosecurity measure [1].' }]),
      bullet([{ text: 'Darkling beetles (Alphitobius diaperinus): ', bold: true }, { text: 'These insects thrive in poultry litter and are known to harbor and transmit Salmonella. They are extremely difficult to eradicate once established and can maintain Salmonella between flock cycles even after thorough cleanout [1,5].' }]),
      bullet([{ text: 'Flies: ', bold: true }, { text: 'House flies and other insects can mechanically transfer Salmonella from contaminated manure or carcasses to feed, water, and barn surfaces.' }]),
      ...imagePlaceholder('Figure 2.1: Darkling beetle (Alphitobius diaperinus) in poultry litter. These insects are important vectors of Salmonella in commercial barn environments. Replace with appropriate educational image.'),
      h2('2.5 Farm Worker Practices'),
      para(
        'People are among the most mobile vectors on a poultry farm. Farm workers, veterinarians, service technicians, catching crews, and visitors can all carry Salmonella on their clothing, footwear, and hands from one barn or farm to another [1,5].'
      ),
      para('High-risk practices include:'),
      bullet('Moving between barns without changing boots and outer clothing'),
      bullet('Entering the barn after visiting another poultry farm without showering and changing'),
      bullet('Inadequate or no handwashing before and after barn entry'),
      bullet('Sharing equipment (shovels, rakes, forklifts) between barns without disinfection'),
      bullet('Allowing catching crews onto the farm without enforcing your biosecurity protocols'),
      para(
        'Catching and loading crews present a particularly high risk because they typically work across multiple farms in a short time. Establishing and enforcing clear visitor and crew biosecurity protocols is one of the highest-impact actions a farmer can take to reduce Salmonella introduction [5].'
      ),
      h2('2.6 Equipment and Fomites'),
      para(
        'Any object that can carry contamination between animals or locations is a fomite. In poultry production, common fomites for Salmonella include:'
      ),
      bullet('Egg flats and crates (particularly reusable plastic egg crates)'),
      bullet('Chick delivery boxes'),
      bullet('Feed delivery vehicles and augurs'),
      bullet('Litter removal equipment'),
      bullet('Pressure washers and cleaning equipment that is not disinfected between barns'),
      bullet('Dead bird containers and disposal vehicles'),
      para(
        'Single-use or thoroughly sanitized materials significantly reduce fomite-associated risk. Any equipment entering the barn from outside the farm should be considered contaminated until proven otherwise [1].'
      ),
      h2('2.7 Litter Management'),
      para(
        'Poultry litter accumulates a large reservoir of Salmonella over the course of a grow-out cycle. In operations that reuse litter between flocks (windrow composting, heated litter re-use), the efficiency of litter treatment in reducing Salmonella to safe levels is variable and depends on achieving adequate internal temperatures throughout the litter mass [5].'
      ),
      para(
        'Fresh litter placed at the start of each flock is not automatically free of Salmonella. Wood shavings and other litter materials have been identified as sources of Salmonella, particularly if stored in conditions accessible to rodents or wild birds. Sourcing litter from reputable, covered storage is important [1].'
      ),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 3: PREVENTION AND CONTROL
// ============================================================
function buildSection3() {
  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Section 3: Prevention and Control Measures'),
      para(
        'No single intervention eliminates Salmonella from a commercial poultry operation. An effective program requires a layered approach, combining biosecurity, feed and water management, environmental controls, competitive exclusion, vaccination, and monitoring. Each layer reduces the probability of Salmonella introduction or amplification; together, they provide meaningful risk reduction [1,5].'
      ),
      h2('3.1 Biosecurity: The Foundation'),
      para(
        'Biosecurity is the set of practices that prevent the introduction of disease agents into your farm and their spread between barns. For Salmonella, biosecurity addresses the most common entry routes: people, vehicles, equipment, and live birds [1,5].'
      ),
      h3('Farm Perimeter Security'),
      bullet('Establish a clearly marked farmyard boundary.'),
      bullet('Limit the number of entry points and post biosecurity requirement signs at all entry points.'),
      bullet('Maintain a visitor log. Record the name, organization, date, and any recent poultry farm contacts for every person who enters the production area.'),
      bullet('Require a minimum 48-hour "downtime" for anyone who has visited another poultry operation before entering your barns.'),
      h3('Vehicle Control'),
      bullet('Designate a vehicle hygiene area at the farm perimeter.'),
      bullet('Require all delivery vehicles (feed, chicks, catch trucks) to be washed and disinfected before entering the production area whenever possible.'),
      bullet('Minimize the distance that outside vehicles travel toward the barns.'),
      bullet('Do not allow catching crew vehicles past the designated parking area.'),
      h3('All-In and All-Out Management'),
      para(
        'All-in and all-out (AIAO) management, placing and removing an entire flock at one time and fully cleaning and disinfecting before the next placement, is the single most effective management tool for breaking the cycle of Salmonella between flocks [1]. Continuous housing, where new birds are introduced while older birds remain, dramatically increases the probability of Salmonella carryover.'
      ),
      h2('3.2 Feed Safety Measures'),
      para(
        'Work with your feed supplier to verify that their Salmonella control program includes:'
      ),
      bullet('Heat treatment of finished feed (pelleting at sufficient temperature and duration to achieve a lethal reduction)'),
      bullet('Post-process contamination controls (sealed bins, covered conveyors, rodent control at the mill)'),
      bullet('Regular environmental Salmonella monitoring in the mill with documented results'),
      bullet('Certificates of analysis or Salmonella status documentation for high-risk ingredients'),
      para(
        'On the farm, protect feed from contamination by maintaining covered, sealed bins, cleaning out residual feed between flocks before re-filling, and eliminating rodent access to all feed storage areas [5].'
      ),
      h2('3.3 Water Safety Measures'),
      para(
        'Provide clean, treated drinking water from a reliable source. Key practices for water management include:'
      ),
      bullet('Test well water for total coliform and E. coli at least annually; more frequent testing is warranted after flooding or heavy rainfall.'),
      bullet('Install and maintain an in-line water treatment system (chlorination or acidification) sized appropriately for your barn capacity.'),
      bullet('Flush and clean drinker lines at the end of each flock cycle. Use an approved water-line cleaner to remove biofilm.'),
      bullet('Check drinker pressure and flow rates regularly. Leaking nipple drinkers create wet litter that increases Salmonella survival in the barn [1].'),
      bullet('Do not allow birds access to standing water outside the barn.'),
      h2('3.4 Competitive Exclusion'),
      para(
        'Competitive exclusion (CE) products contain defined mixtures of beneficial bacteria that, when administered to chicks at hatch or early in life, colonize the intestinal tract and prevent Salmonella from establishing. CE is most effective when administered to day-old chicks before Salmonella exposure occurs, and when combined with other biosecurity and management measures [1,5].'
      ),
      para(
        'Several CE products are licensed for use in Canada. Consult your veterinarian or poultry specialist to select an appropriate product for your operation and to confirm correct administration protocols.'
      ),
      h2('3.5 Vaccination'),
      para(
        'Vaccines against Salmonella Enteritidis are available in Canada and are used primarily in layer and breeder flocks, where the risk of vertical (egg) transmission and persistent flock colonization is highest [1,8].'
      ),
      para('Both live attenuated and killed (inactivated) Salmonella vaccines are available:'),
      bullet([{ text: 'Live attenuated vaccines: ', bold: true }, { text: 'Stimulate both systemic and mucosal immunity. Typically administered in water or by spray to young pullets. Examples used in Canada include products based on modified SE and/or ST strains.' }]),
      bullet([{ text: 'Killed vaccines: ', bold: true }, { text: 'Used as a booster following live vaccination, usually administered by injection near the time of transfer to the layer barn. Boost systemic immunity and are associated with reduced egg contamination rates [1,8].' }]),
      para(
        'Vaccination does not eliminate Salmonella from a flock, but it reduces the level of intestinal colonization and the probability of transovarian transmission. It is most effective when combined with biosecurity and management controls. In Canada, several provincial quota boards and processor programs may specify vaccination requirements; consult your integrator or provincial veterinarian [3].'
      ),
      h2('3.6 Rodent and Pest Control'),
      para(
        'An active, documented rodent control program is a core component of Salmonella prevention. Key elements include:'
      ),
      bullet('Regular inspection of the barn perimeter and interior for signs of rodent activity (droppings, gnaw marks, burrows, runways).'),
      bullet('Maintaining an uncluttered 1 to 2 meter cleared zone around the exterior of all barn buildings to eliminate rodent harborage.'),
      bullet('Sealing all gaps larger than 6 mm in barn walls, foundations, and roof lines.'),
      bullet('Placing and maintaining bait stations at regular intervals around the barn perimeter, inside equipment storage areas, and under feed storage bins.'),
      bullet('Keeping records of rodent activity levels and bait consumption to track program effectiveness.'),
      bullet('Scheduling professional pest control service at least twice per year, or more frequently if rodent pressure is high.'),
      para(
        'Darkling beetle control requires an integrated approach including thorough litter removal and cleanout, approved insecticide application to barn floors and walls before litter placement, and monitoring throughout the flock cycle [5].'
      ),
      h2('3.7 Litter Treatment Between Flocks'),
      para(
        'For operations using litter re-use programs, the most consistently effective treatment for reducing Salmonella in built-up litter is composting or in-house heating methods (litter windrow composting using barn heating systems). To achieve adequate Salmonella reduction, the internal temperature of the litter windrow must reach at least 55 degrees Celsius throughout the windrow mass for a minimum of 3 days [5]. Composting that does not achieve this temperature throughout the windrow provides unreliable Salmonella reduction.'
      ),
      para(
        'Fresh litter programs, while more expensive, provide the most reliable Salmonella-free start for each new flock when litter is sourced from a covered, rodent-excluded storage and is not recontaminated during transport.'
      ),
      h2('3.8 Salmonella Monitoring and Testing'),
      para(
        'In Canada, the CFIA oversees the National Salmonella Action Plan for Chicken (NSAPC), which requires commercial broiler integrators to implement pre-harvest Salmonella testing programs. Flock results influence processing scheduling and may trigger additional biosecurity interventions [3].'
      ),
      para('Understanding your flock testing results helps you evaluate the effectiveness of your biosecurity program and identify barns or flocks with persistent Salmonella issues. Key actions when a flock tests positive include:'),
      bullet('Review and reinforce biosecurity and cleaning protocols for the affected barn.'),
      bullet('Investigate likely sources of introduction (feed, water, visitors, litter).'),
      bullet('Consult with your veterinarian regarding additional control measures such as competitive exclusion or organic acid water treatments.'),
      bullet('Report results to your integrator or supply management organization as required.'),
      ...imagePlaceholder('Figure 3.1: Biosecurity signage and boot dip at barn entry. Posted biosecurity protocols reduce the risk of Salmonella introduction by people and equipment. Replace with appropriate farm photograph.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 4: GOOD HYGIENE PRACTICES
// ============================================================
function buildSection4() {
  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Section 4: Good Hygiene Practices'),
      para(
        'Good Hygiene Practices (GHP) are the day-to-day personal and environmental hygiene habits that prevent the spread of Salmonella on the farm. GHP forms the behavioral backbone of any biosecurity program: even the best written protocols fail when individual hygiene habits are inconsistent [5,9].'
      ),
      h2('4.1 Handwashing'),
      para(
        'Hands are one of the most effective transfer mechanisms for Salmonella between people, birds, and surfaces. Proper handwashing is the simplest, most evidence-based intervention available to reduce contamination at every step of farm work [9].'
      ),
      para('Correct handwashing procedure:'),
      numbered('Wet hands with clean, running water (warm or cold).'),
      numbered('Apply soap and lather thoroughly, covering all surfaces including backs of hands, between fingers, and under nails.'),
      numbered('Scrub for at least 20 seconds.'),
      numbered('Rinse completely under running water.'),
      numbered('Dry with a clean paper towel or air dryer. Never share cloth towels.'),
      para('Wash hands:'),
      bullet('Before and immediately after entering any poultry barn'),
      bullet('After handling live birds or carcasses'),
      bullet('After removing gloves (gloves do not eliminate the need for handwashing)'),
      bullet('After handling litter, feces, or soiled equipment'),
      bullet('Before eating, drinking, or touching your face'),
      bullet('After using the toilet'),
      para(
        'Provide adequate handwashing facilities at every barn entry point. These must include clean running water, soap, and a supply of disposable paper towels. Alcohol-based hand sanitizer is a useful supplement but should not replace soap and water when hands are visibly soiled [9].'
      ),
      h2('4.2 Protective Clothing and Footwear'),
      para(
        'Dedicated barn clothing reduces the risk of both introducing Salmonella into the barn and carrying it off the farm on your person [1,5].'
      ),
      para('Minimum protective clothing standards:'),
      bullet([{ text: 'Coveralls or dedicated barn clothing: ', bold: true }, { text: 'Worn only inside the barn. Change and launder after each flock cycle or more frequently if visibly soiled. Do not wear barn clothing in vehicles, homes, or public spaces.' }]),
      bullet([{ text: 'Dedicated barn boots: ', bold: true }, { text: 'Rubber or waterproof boots used only inside the designated barn or production area. Boots are among the most effective vehicles for transferring Salmonella between barns and should never leave the production zone without cleaning and disinfecting first [1].' }]),
      bullet([{ text: 'Boot dips: ', bold: true }, { text: 'Maintain foot baths or spray stations at every barn entrance. Use an approved disinfectant at the correct concentration (follow the product label). Change disinfectant solutions regularly; a fouled, turbid boot dip is ineffective and may actually spread contamination. Effective disinfectants for boot dips include quaternary ammonium compounds and iodophors at the correct dilutions [5].' }]),
      bullet([{ text: 'Gloves: ', bold: true }, { text: 'Wear disposable or cleanable gloves when handling carcasses, taking samples, or administering medications. Change gloves between barns.' }]),
      bullet([{ text: 'Hair and beard coverage: ', bold: true }, { text: 'Required in some processing environments and recommended in production areas where personal hygiene is audited.' }]),
      h2('4.3 Clean Housing and Barn Sanitation'),
      para(
        'The cleanout and disinfection protocol between flocks is the most critical hygiene event in the barn cycle. A thorough cleanout removes the bulk of the organic material in which Salmonella survives, and disinfection reduces the residual bacterial population to a level that is much less likely to re-infect the incoming flock [1,5].'
      ),
      h3('Standard Cleanout and Disinfection Protocol'),
      numbered('Remove all birds and equipment from the barn.'),
      numbered('Remove all litter, manure, and debris from the barn. Pay attention to corners, under feed and water lines, and wall edges where litter accumulates.'),
      numbered('Dry-sweep or blow down all surfaces, including walls, ceiling, fans, and attic spaces where dust accumulates.'),
      numbered('Apply a detergent-based foaming agent or pre-soak to all surfaces. Allow adequate contact time to loosen organic material.'),
      numbered('Pressure-wash all surfaces thoroughly. Start from the top of the barn (ceiling, fans, light fixtures) and work down to the floor. Focus on areas that are difficult to access.'),
      numbered('Allow the barn to dry completely. Salmonella disinfection is significantly less effective on wet surfaces because organic material dilutes and inactivates most disinfectants.'),
      numbered('Apply an approved disinfectant at the correct concentration and contact time according to the label. Rotate between disinfectant classes over successive flock cycles to reduce the risk of selecting for resistant organisms.'),
      numbered('Allow the barn to sit empty (downtime) for as long as practical before the next flock. Even 7 to 14 days of downtime after disinfection significantly reduces residual Salmonella levels.'),
      numbered('Before placement, collect environmental swabs from a representative sample of locations in the barn for Salmonella culture. Document the results.'),
      h3('Common Mistakes in Barn Sanitation'),
      bullet('Insufficient dry cleanout before washing (organic material protects bacteria from disinfectants)'),
      bullet('Using disinfectant at below-label concentrations to save cost'),
      bullet('Applying disinfectant to wet or dirty surfaces'),
      bullet('Skipping the downtime period due to production pressure'),
      bullet('Not disinfecting equipment and vehicles entering the barn after cleanout'),
      ...imagePlaceholder('Figure 4.1: Pressure-washing barn walls between flock cycles. Thorough physical removal of organic material is the essential first step before disinfection is applied. Replace with appropriate farm photograph.'),
      h2('4.4 Waste Management'),
      para(
        'Manure and litter from Salmonella-positive flocks must be handled with care to prevent spreading contamination to adjacent fields, waterways, or neighboring farms [5].'
      ),
      bullet('Store litter and manure in covered, contained areas away from barn entrances, water sources, and neighboring property.'),
      bullet('Do not apply fresh (untreated) manure from a positive flock to fields used for growing vegetables or fruits consumed raw.'),
      bullet('Composted litter that has reached adequate internal temperatures is significantly safer for land application than raw litter.'),
      bullet('Maintain manure transport vehicles as clean as possible and do not allow litter trucks into the barn production area without prior approval.'),
      bullet('Dead bird disposal must comply with provincial regulations. Composting of carcasses in an approved on-farm composter is common in Canada. Never leave dead birds in the barn; remove daily and process immediately [5,9].'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 5: SAFE PROCESSING AND STORAGE
// ============================================================
function buildSection5() {
  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Section 5: Safe Processing and Storage'),
      para(
        'For most commercial poultry producers in Canada, federally or provincially inspected processing plants handle the slaughter and primary processing of birds. However, farmers play a critical role in the food safety continuum by managing bird health, reducing pre-harvest Salmonella colonization levels, and ensuring proper handling from the barn to the loading dock [3,6].'
      ),
      h2('5.1 Pre-Harvest Management'),
      para(
        'The 24 to 48 hours before catching and transport represent a high-risk period for Salmonella in the flock. Stress from feed withdrawal, catching, and transport triggers increased shedding by carrier birds, and fecal contamination of feathers during catching can raise carcass contamination levels at the plant [1,5].'
      ),
      para('Pre-harvest practices that reduce Salmonella risk:'),
      bullet([{ text: 'Feed withdrawal timing: ', bold: true }, { text: 'Follow your processor\'s specified feed withdrawal guidelines. Excessive withdrawal time causes intestinal damage that increases the risk of fecal contamination during processing; insufficient time means full intestinal contents at slaughter [6].' }]),
      bullet([{ text: 'Water access: ', bold: true }, { text: 'Maintain water access up to 1 to 2 hours before catching. Dehydrated birds experience more intestinal fragility at slaughter.' }]),
      bullet([{ text: 'Catching crew biosecurity: ', bold: true }, { text: 'Ensure catching crew members change into clean coveralls and boots before entering the barn. Crews working across multiple farms in a single day carry a higher Salmonella transfer risk.' }]),
      bullet([{ text: 'Minimize time-to-slaughter: ', bold: true }, { text: 'Extended holding of birds in transport crates without access to water increases stress and fecal shedding. Coordinate scheduling to minimize holding time.' }]),
      h2('5.2 Egg Safety: On-Farm Practices for Layer Operations'),
      para(
        'For commercial table egg producers, on-farm egg handling practices are critical to preventing Salmonella contamination. The CFIA requires that eggs for human consumption meet specific standards for cleanliness, shell integrity, and temperature management [3,6].'
      ),
      h3('Nest Box and Barn Hygiene'),
      bullet('Keep nesting areas clean and dry. Wet, soiled nests dramatically increase the risk of shell contamination.'),
      bullet('Collect eggs frequently (minimum 3 to 4 times per day for loose-housed flocks). Frequent collection reduces the time eggs spend in a warm, contaminated environment.'),
      bullet('Remove floor eggs promptly. Floor eggs have a much higher rate of fecal shell contamination and should be processed as second-grade or discarded; do not sell floor eggs as Grade A.'),
      h3('Egg Handling'),
      bullet('Handle eggs gently to prevent shell cracking. Cracked eggs have a dramatically higher Salmonella contamination risk and must not enter the Grade A market.'),
      bullet([{ text: 'Do not wash eggs, ', bold: true }, { text: 'unless you are licensed and equipped to do so under CFIA-approved conditions. Improper washing can remove the protective cuticle (bloom) on the shell surface and drive contamination into the egg through the shell pores. Washing with water cooler than the egg creates a negative pressure differential that actively pulls surface bacteria into the egg [6].' }]),
      bullet('Cool eggs promptly after collection to below 12 degrees Celsius. Rapid cooling slows any bacterial growth and maintains interior egg quality.'),
      bullet('Store eggs at 7 to 12 degrees Celsius for farm storage pending grading. Refrigerated storage (below 7 degrees Celsius) is required at the grading station and at retail.'),
      h3('Egg Transport'),
      bullet('Use clean, sanitized egg flats or crates. Reusable plastic egg flats must be washed and disinfected between uses.'),
      bullet('Protect eggs from temperature fluctuations during transport. Condensation on the shell surface of cold eggs in a warm environment can promote bacterial penetration.'),
      ...imagePlaceholder('Figure 5.1: Proper egg collection and handling in a layer barn. Frequent collection and prompt cooling are the most effective on-farm tools for reducing Salmonella risk in table eggs. Replace with appropriate farm photograph.'),
      h2('5.3 Temperature Control for Poultry Meat'),
      para(
        'Salmonella is killed by cooking, but temperature control throughout the chilled and frozen supply chain prevents bacterial multiplication after processing. Farmers who sell poultry directly to consumers (via on-farm direct sales or farmers markets, where permitted under provincial regulations) must understand and apply appropriate temperature control standards [3].'
      ),
      bullet([{ text: 'Refrigeration: ', bold: true }, { text: 'Fresh poultry meat must be kept at or below 4 degrees Celsius at all times after processing. At this temperature, Salmonella growth is greatly slowed but not eliminated; refrigeration buys time, it does not eliminate the hazard.' }]),
      bullet([{ text: 'Freezing: ', bold: true }, { text: 'Frozen poultry should be stored at or below -18 degrees Celsius. Freezing does not kill Salmonella but prevents any growth. Note that some Salmonella cells remain viable after freezing and thawing, so frozen poultry must still be handled and cooked correctly.' }]),
      bullet([{ text: 'Cooking temperature: ', bold: true }, { text: 'All poultry products (whole birds, parts, ground poultry) must reach an internal temperature of at least 74 degrees Celsius (165 degrees Fahrenheit) throughout the product to ensure Salmonella destruction [2,9]. This applies to all cuts, including wings and thighs close to the bone.' }]),
      bullet([{ text: 'Cold chain maintenance: ', bold: true }, { text: 'Do not allow poultry products to sit at room temperature for more than 2 hours (or 1 hour when ambient temperature is above 32 degrees Celsius). After cooking, maintain hot food above 60 degrees Celsius, or cool rapidly to below 4 degrees Celsius within 2 hours.' }]),
      h2('5.4 Preventing Cross-Contamination'),
      para(
        'Cross-contamination, the transfer of Salmonella from raw poultry to ready-to-eat foods, is a leading cause of human salmonellosis linked to poultry [2]. While most cross-contamination occurs in the consumer kitchen, it can also occur during on-farm direct sales, farmers market operations, and farm slaughter activities.'
      ),
      para('Key cross-contamination prevention practices:'),
      bullet('Use separate, color-coded cutting boards and utensils for raw poultry and other foods.'),
      bullet('Wash hands thoroughly after handling raw poultry and before touching any other food or surface.'),
      bullet('Sanitize all surfaces and equipment that have contacted raw poultry.'),
      bullet('Store raw poultry below and away from ready-to-eat foods in refrigerators and transport coolers.'),
      bullet('Use sealed, leak-proof containers or packaging for raw poultry to prevent drip contamination.'),
      h2('5.5 Transport and Market Safety'),
      para(
        'For direct-sale operations, transport and market handling are extensions of your food safety program. Insulated coolers and refrigerated transport units must be pre-cooled before loading poultry products. Cooler temperatures should be verified with a calibrated thermometer before and during transport.'
      ),
      para(
        'At farmers markets or on-farm retail, keep products in covered, temperature-controlled display units. Do not allow raw poultry to sit on uncovered tables in ambient temperatures. Post clear notices reminding consumers to refrigerate products immediately and cook to the correct internal temperature.'
      ),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 6: FARMER RESPONSIBILITIES AND CONSUMER SAFETY
// ============================================================
function buildSection6() {
  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Section 6: Farmer Responsibilities and Consumer Safety'),
      para(
        'Canadian commercial poultry farmers operate within a regulatory framework that places specific food safety obligations on them. Beyond regulatory compliance, maintaining consumer confidence depends on a culture of food safety that is embedded in every aspect of farm management [3,9].'
      ),
      h2('6.1 Regulatory Framework in Canada'),
      para('The following federal and provincial agencies and programs are relevant to Salmonella control in Canadian commercial poultry:'),
      bullet([{ text: 'Canadian Food Inspection Agency (CFIA): ', bold: true }, { text: 'Oversees the Safety of Human Food Regulations and administers the National Salmonella Action Plan for Chicken (NSAPC). The NSAPC includes pre-harvest surveillance of commercial broiler flocks, with testing conducted at defined intervals before slaughter. Positive flock results may trigger additional interventions at the processing plant and are tracked nationally [3].' }]),
      bullet([{ text: 'Public Health Agency of Canada (PHAC): ', bold: true }, { text: 'Monitors and reports on foodborne illness trends in Canada, including Salmonella outbreaks linked to poultry products.' }]),
      bullet([{ text: 'Chicken Farmers of Canada (CFC): ', bold: true }, { text: 'Administers the On-Farm Food Safety (OFFS) Program for broiler producers. The CFC OFFS program requires documented biosecurity and Salmonella control practices as part of membership and quota requirements. Producers are subject to third-party audits [3].' }]),
      bullet([{ text: 'Egg Farmers of Canada (EFC): ', bold: true }, { text: 'Administers the Start Clean and Stay Clean on-farm food safety program for commercial egg producers, which includes requirements for Salmonella control and flock testing [3].' }]),
      bullet([{ text: 'Provincial veterinary services: ', bold: true }, { text: 'Pullorum disease and fowl typhoid (Salmonella Pullorum and Salmonella Gallinarum) are reportable diseases under federal and most provincial regulations. Any suspected case must be reported to your provincial veterinarian or the CFIA immediately.' }]),
      h2('6.2 Record-Keeping'),
      para(
        'Accurate, complete record-keeping is the evidence base for your food safety program. Records demonstrate that biosecurity and hygiene protocols were followed, support traceability in the event of a product recall or outbreak investigation, and provide the documentation required for audits under the CFC or EFC on-farm food safety programs [3,9].'
      ),
      para('Minimum records to maintain for Salmonella control:'),
      bullet([{ text: 'Visitor and crew log: ', bold: true }, { text: 'Date, name, organization, and recent farm contacts for every person who enters the production area.' }]),
      bullet([{ text: 'Flock placement records: ', bold: true }, { text: 'Source of chicks or pullets, arrival date, number of birds, any health concerns noted at delivery.' }]),
      bullet([{ text: 'Feed records: ', bold: true }, { text: 'Feed supplier, delivery dates, batch or lot numbers. Retain delivery tickets.' }]),
      bullet([{ text: 'Water testing results: ', bold: true }, { text: 'Date of sample, results, and any corrective actions taken.' }]),
      bullet([{ text: 'Cleanout and disinfection records: ', bold: true }, { text: 'Date, products used, concentrations, contact times, and environmental swab results for each flock cycle.' }]),
      bullet([{ text: 'Mortality records: ', bold: true }, { text: 'Daily mortality counts. Unusual spikes may indicate a Salmonella-related disease event.' }]),
      bullet([{ text: 'Medication and vaccination records: ', bold: true }, { text: 'Products used, dates, batch numbers, withdrawal periods observed.' }]),
      bullet([{ text: 'Salmonella testing results: ', bold: true }, { text: 'Flock-level results from integrator or provincial testing programs and any on-farm environmental monitoring results.' }]),
      bullet([{ text: 'Pest control records: ', bold: true }, { text: 'Dates of inspections, rodent activity levels observed, bait products used, and contractor visit records.' }]),
      para('All records should be retained for a minimum of 2 years or as required by your provincial food safety program. Store records in a secure, dry location and have them readily accessible for audit.'),
      h2('6.3 Monitoring Flock Health'),
      para(
        'Daily observation of your flock is the most important early warning system for Salmonella and other disease events. Because Salmonella infection in adult birds is usually subclinical, routine monitoring focuses on indicators that may signal increased bacterial burden rather than classic disease signs.'
      ),
      para('Daily flock monitoring should include:'),
      bullet('Walk the barn at least twice daily and record observations.'),
      bullet('Check feed and water consumption. Unexpected drops in consumption are one of the earliest indicators of flock stress or disease.'),
      bullet('Observe bird behavior and distribution. Are birds uniformly distributed, or are they huddling, crowding near feeders and drinkers, or avoiding certain areas?'),
      bullet('Assess litter condition. Wet areas under drinker lines, or unexplained wet patches, may indicate leaks or abnormal fecal output.'),
      bullet('Note fecal consistency and color. Loose, watery, or discolored droppings can indicate enteric infection.'),
      bullet('Count and record daily mortality. Remove dead birds immediately.'),
      bullet('Report any unusual signs to your veterinarian promptly. Early investigation prevents disease from spreading through the flock.'),
      h2('6.4 Ensuring Safe Products for the Market'),
      para(
        'Consumer confidence in Canadian poultry products depends on every producer maintaining food safety standards throughout the production chain. A single high-profile Salmonella outbreak linked to Canadian poultry affects the entire industry\'s reputation and market access. Your on-farm practices directly contribute to the safety record of the products that reach Canadian families [2,3].'
      ),
      para('Practical steps to ensure safe products:'),
      bullet('Participate fully in your integrator\'s or supply management organization\'s food safety program and submit required samples on time.'),
      bullet('Act on positive Salmonella test results promptly: investigate the source, implement corrective actions, and document what you did.'),
      bullet('Communicate transparently with your veterinarian, integrator, and provincial authorities when you identify a potential food safety issue. Early notification protects both public health and your operation.'),
      bullet('Keep up to date with changing regulations and best practices. Food safety requirements for poultry producers continue to evolve, and producers who stay current are better positioned for market access.'),
      bullet('Consider on-farm food safety certification as a marketing tool where direct sales are permitted. Consumer demand for farm-to-table transparency is growing in Canada.'),
      h2('6.5 Key Takeaways'),
      para('Before leaving this course, review the following key points:'),
      bullet('Salmonella is a zoonotic pathogen that can be carried by healthy-appearing birds and transmitted to humans through poultry products.'),
      bullet('The two serovars of greatest food safety concern in Canadian poultry are Salmonella Enteritidis and Salmonella Typhimurium.'),
      bullet('Control requires a layered approach: biosecurity, feed and water management, competitive exclusion, vaccination (where appropriate), hygiene, and monitoring.'),
      bullet('All-in and all-out management, combined with thorough cleanout and disinfection between flocks, is the most effective tool for breaking the Salmonella cycle between flocks.'),
      bullet('Pre-harvest management, egg handling, temperature control, and cross-contamination prevention are the farmer\'s contribution to food safety beyond the barn.'),
      bullet('Record-keeping is not administrative burden; it is the evidence that your food safety program works.'),
      bullet('Salmonella Pullorum and Salmonella Gallinarum are reportable diseases; suspected cases must be reported to authorities immediately.'),
      bullet('Consumer trust in Canadian poultry products is earned through consistent, documented food safety practices at the farm level.'),
      ...imagePlaceholder('Figure 6.1: Commercial poultry barn with visible biosecurity signage, footbath, and change station at barn entry. A well-managed entry protocol is visible evidence of a producer\'s commitment to food safety. Replace with appropriate farm photograph.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// RECOMMENDED JOURNALS
// ============================================================
function buildJournalSection() {
  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para(
        'The following peer-reviewed journals are the primary scientific literature sources for Salmonella research in commercial poultry. Farmers and advisors seeking to stay current with evidence on Salmonella control are encouraged to access these publications through university libraries or online databases.'
      ),
      bullet([{ text: 'Poultry Science ', italics: true }, { text: '(official journal of the Poultry Science Association, USA): Publishes original research on all aspects of poultry biology, health, and production, including Salmonella epidemiology and control.' }]),
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
    '[1]  Russell, S.M. Controlling Salmonella in Poultry Production. Woodhead Publishing; 2012.',
    '[2]  Public Health Agency of Canada. Salmonellosis (non-typhoidal) [Internet]. Ottawa: Government of Canada; 2023 [cited 2026 Apr]. Available from: phac-aspc.gc.ca',
    '[3]  Canadian Food Inspection Agency. National Salmonella Action Plan for Chicken [Internet]. Ottawa: Government of Canada; 2023 [cited 2026 Apr]. Available from: inspection.canada.ca',
    '[4]  Swayne, D.E., Boulianne, M., Logue, C.M., McDougald, L.R., Nair, V., Suarez, D.L., editors. Diseases of Poultry. 14th ed. Hoboken (NJ): Wiley-Blackwell; 2020.',
    '[5]  Bell, D.D., Weaver, W.D. Commercial Chicken Meat and Egg Production. 5th ed. Norwell (MA): Springer; 2002.',
    '[6]  Tablante, N.L. Common Poultry Diseases and Their Prevention. eXtension; 2013.',
    '[7]  World Health Organization. WHO List of Critically Important Antimicrobials for Human Medicine. 6th rev. Geneva: WHO; 2019.',
    '[8]  CEVA Sante Animale. CEVA Handbook of Poultry Diseases. Vol 1. Libourne: CEVA; 2020.',
    '[9]  National Farm Animal Care Council (NFACC). Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys. Lacombe (AB): NFACC; 2016.',
  ];

  return {
    properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) } } },
    headers: { default: buildHeader('Salmonella and Food Safety') },
    footers: { default: buildFooter() },
    children: [
      h1('References'),
      para(
        'References are listed in order of first citation. This course draws primarily from the following peer-reviewed textbooks, regulatory guidance documents, and industry resources held in the Canadian Poultry Consultants reference library.'
      ),
      ...refs.map(r => new Paragraph({
        children: [new TextRun({ text: r, color: BODY_GRAY, size: 22, font: 'Calibri' })],
        spacing: { after: 120, line: 260, lineRule: 'auto' },
        indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.4) },
      })),
    ],
  };
}

// ============================================================
// NUMBERING DEFINITIONS
// ============================================================
function buildNumbering() {
  return {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 24, color: BODY_GRAY } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 22, color: BODY_GRAY } } },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.35) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 24, color: BODY_GRAY } } },
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
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Calibri Light', size: 40, bold: true, color: DARK_BLUE },
        paragraph: {
          spacing: { before: 400, after: 160 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
        },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Calibri', size: 30, bold: true, color: MED_BLUE },
        paragraph: { spacing: { before: 320, after: 120 } },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Calibri', size: 26, bold: true, color: BODY_GRAY, italics: true },
        paragraph: { spacing: { before: 200, after: 100 } },
      },
    ],
  };
}

// ============================================================
// BUILD AND WRITE DOCUMENT
// ============================================================
async function main() {
  console.log('Building Course 4: Salmonella and Food Safety...');

  const doc = new Document({
    creator: 'Canadian Poultry Consultants',
    title: 'Salmonella and Food Safety',
    description: 'Course 4 of 17 — CPC Short Courses',
    features: { updateFields: true },
    styles: buildStyles(),
    numbering: buildNumbering(),
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

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
}

main().catch(err => { console.error(err); process.exit(1); });
