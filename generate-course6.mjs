// ============================================================
// generate-course6.mjs — Course 6: Poultry Anatomy and Physiology
// CPC Short Courses
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course6.mjs
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
  LevelFormat,
  TableOfContents,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 6');
const OUT_FILE  = path.join(OUT_DIR, 'Poultry_Anatomy_and_Physiology_draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

// Image helpers
function imgFile(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}
function jpegDims(buf) {
  if (!buf) return null;
  let i = 2;
  while (i < buf.length - 10) {
    if (buf[i] !== 0xFF) break;
    const marker = buf[i + 1];
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
      return { h: (buf[i+5]<<8)|buf[i+6], w: (buf[i+7]<<8)|buf[i+8] };
    }
    const segLen = (buf[i+2]<<8)|buf[i+3];
    i += 2 + segLen;
  }
  return null;
}
function pngDims(buf) {
  if (!buf || buf[0] !== 0x89) return null;
  return { w: (buf[16]<<24)|(buf[17]<<16)|(buf[18]<<8)|buf[19], h: (buf[20]<<24)|(buf[21]<<16)|(buf[22]<<8)|buf[23] };
}

// ============================================================
// COLORS
// ============================================================
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

// ============================================================
// HELPERS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({
    text,
    bold:       opts.bold      || false,
    italics:    opts.italics   || false,
    color:      opts.color     || BODY_GRAY,
    size:       opts.size      || 24,
    font:       'Calibri',
    subScript:  opts.subScript  || false,
    superScript: opts.superScript || false,
  });
}

function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({
        text:        seg.text,
        bold:        seg.bold       || false,
        italics:     seg.italics    || false,
        color:       seg.color      || BODY_GRAY,
        size:        seg.size       || 24,
        font:        'Calibri',
        subScript:   seg.subScript  || false,
        superScript: seg.superScript || false,
      }))
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

function numberedRef(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })],
    numbering: { reference: 'references-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Labeled bold lead-in paragraph
function labeled(label, bodyText, opts = {}) {
  const bodyChildren = Array.isArray(bodyText)
    ? bodyText.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY_GRAY, size: 24, font: 'Calibri' }))
    : [run(bodyText)];
  return new Paragraph({
    children: [run(label + ' ', { bold: true }), ...bodyChildren],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 100, line: 276, lineRule: 'auto' },
    indent: opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}

// Embed a real JPEG photo
function embedPhoto(buf, caption, widthIn = 5.8) {
  if (!buf) return [];
  const dims = jpegDims(buf);
  const dpi  = 96;
  let wpx    = Math.round(widthIn * dpi);
  let hpx    = dims ? Math.round(wpx * dims.h / dims.w) : Math.round(wpx * 0.67);
  const maxH = Math.round(4.5 * dpi);
  if (hpx > maxH) { hpx = maxH; wpx = dims ? Math.round(hpx * dims.w / dims.h) : wpx; }
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'jpg' })],
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

// Embed a real PNG image (diagram or illustration)
function embedPng(buf, caption, widthIn = 5.8) {
  if (!buf) return [];
  const dims = pngDims(buf);
  const dpi  = 96;
  let wpx    = Math.round(widthIn * dpi);
  let hpx    = dims && dims.w > 0 ? Math.round(wpx * dims.h / dims.w) : Math.round(wpx * 0.6);
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'png' })],
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

// Gray placeholder with photo brief
function photoPlaceholder(label, brief, caption) {
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, color: '595959', size: 22, font: 'Calibri', bold: true })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: convertInchesToTwip(0.25), after: 80 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: brief, color: '888888', size: 20, font: 'Calibri', italics: true })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 80 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: 'Photograph to be supplied by CPC team.', color: 'BBBBBB', size: 18, font: 'Calibri', italics: true })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: convertInchesToTwip(0.25) },
                }),
              ],
              shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
              borders: {
                top:    { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                left:   { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                right:  { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
              },
              margins: {
                top:    convertInchesToTwip(0.2),
                bottom: convertInchesToTwip(0.2),
                left:   convertInchesToTwip(0.3),
                right:  convertInchesToTwip(0.3),
              },
            }),
          ],
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 240 },
    }),
  ];
}

// Comparison table for Section 6
function comparisonTable() {
  const colW  = [2160, 2160, 2160, 2160]; // 4 columns = 8640 twips total
  const hdrBg = '2E74B5';
  const altBg = 'EBF2FA';
  const bdr   = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cb    = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hdrCell = (text, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cb,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
    })],
  });

  const dataCell = (text, i, shade) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cb,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({
      alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18, color: BODY_GRAY })],
    })],
  });

  const headers = ['Feature', 'Broilers', 'Commercial Layers', 'Broiler Breeders'];
  const rows = [
    ['Market/peak weight',       '2.5–3 kg at 38–45 days', '1.5–2 kg at 72+ weeks', '3.5–4.5 kg at 60+ weeks'],
    ['Breast muscle (% BW)',     '21–29%',                  '10–14%',                 'Intermediate'],
    ['FCR',                      '1.5–1.7:1',               'Not usually used',       'Not usually used'],
    ['Primary health risk',      'Ascites, SDS, woody breast', 'Osteoporosis, fatty liver', 'Over-conditioning, reduced fertility'],
    ['Key nutritional focus',    'Energy and amino acids',  'Calcium and vitamin D',  'Energy balance, micronutrients'],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => dataCell(cell, ci, ri % 2 === 1)),
      })),
    ],
  });
}

// Oviduct table (egg formation timeline)
function oviductTable() {
  const colW  = [1800, 1680, 1680, 3480]; // 8640 total
  const hdrBg = '2E74B5';
  const altBg = 'EBF2FA';
  const bdr   = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cb    = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hdrCell = (text, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cb,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
    })],
  });

  const dataCell = (text, i, shade) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cb,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({
      alignment: i === 3 ? AlignmentType.LEFT : AlignmentType.CENTER,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18, color: BODY_GRAY })],
    })],
  });

  const headers = ['Section', 'Length', 'Time', 'What Happens'];
  const rows = [
    ['Infundibulum', '3–4 in',  '15–17 min',  'Yolk captured; fertilization occurs here if sperm present'],
    ['Magnum',       '13 in',   '~3 hours',   'Thick albumen (egg white) deposited around yolk'],
    ['Isthmus',      '4 in',    '~75 min',    'Two shell membranes form around the albumen'],
    ['Shell gland',  '4–5 in',  '20+ hours',  'Calcium carbonate shell deposited; most shell built overnight'],
    ['Vagina',       '4–5 in',  'Minutes',    'Bloom (cuticle) seals pores; egg laid large-end-first'],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => dataCell(cell, ci, ri % 2 === 1)),
      })),
    ],
  });
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
          new TextRun({ text: 'Poultry Anatomy and Physiology', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 6  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
// COVER PAGE
// ============================================================
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),

    new Paragraph({
      children: [new TextRun({ text: 'COURSE 6: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
  ];

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
        spacing: { before: 200, after: 200 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Poultry Anatomy and Physiology', bold: true, color: DARK_BLUE, size: 56, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'Understanding the Bird: Practical Knowledge for Better Farm Decisions', color: MED_BLUE, size: 28, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 560 },
    }),

    new Paragraph({
      children: [new TextRun({ text: '', color: GOLD })],
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
      spacing: { before: 0, after: 400 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'Duration: 2 Hours', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'May 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature, industry management guides, and regulatory documents. This material does not replace the advice of a licensed veterinarian, agronomist, or regulatory authority.', color: '808080', size: 18, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
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
// TOC + INTRODUCTION
// ============================================================
function buildIntroSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', { headingStyleRange: '1-2' }),

      h1('Introduction'),
      para('Understanding how a chicken\'s body works is one of the most practical things a farmer can know. How a chicken is built shapes its growth rate, egg production, feed conversion, behavior, and health. Meat birds, layers, and breeders may look similar at a distance, but their bodies are built for very different jobs, and those differences explain why the management rules for each type are not the same [1,2].'),
      para('This course walks through the major body systems of the chicken: what they do, how they connect to the conditions in the barn, and what goes wrong when those conditions are off. You will also see how the way each type is built directly drives the management priorities for that production type. A farmer who understands the bird makes better decisions, catches problems earlier, and loses fewer birds to conditions that could have been avoided.'),

      h2('Learning Objectives'),
      bullet('Identify the major external and internal body parts of poultry and explain their practical functions.'),
      bullet('Describe the key differences in the anatomy and physiology of meat birds versus layers and breeders.'),
      bullet('Understand how anatomy affects production, including growth, egg laying, fertility, and overall health.'),
      bullet('Recognize common health indicators linked to specific body systems.'),
      bullet('Apply appropriate management practices based on bird type, whether for meat production or egg production.'),
      bullet('Adjust feeding, housing, and care to match the physiological needs of each poultry category.'),
      bullet('Use anatomical knowledge to make early decisions that prevent disease, reduce losses, and improve farm productivity.'),
    ],
  };
}

// ============================================================
// SECTION 1: INTRODUCTION TO POULTRY ANATOMY & PHYSIOLOGY
// ============================================================
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Section 1: Introduction to Poultry Anatomy and Physiology'),

      h2('1.1  Why the Bird\'s Body Matters to You'),
      para('Every management decision on a poultry farm, from ventilation rates to feed particle size to lighting schedules, has its logic in how the bird is built. Ventilation targets come from the anatomy of the respiratory system. Phase feeding follows the bird\'s changing digestive capacity. Lighting programs work because the reproductive system responds to day length. When you understand how the bird is built, the rules make sense and you apply them correctly. When you do not, you follow recipes without understanding when to adapt them [1,2].'),
      para('You do not need a veterinary degree to use this knowledge effectively. What you need is a clear picture of what is going on inside the bird. This course builds that picture section by section, starting with the outside of the bird and working inward through each body system.'),

      ...embedPhoto(imgFile('Commercial broiler flock.jpg'), 'Photo 1.1: A flock of healthy commercial broiler chickens showing alert posture and good body condition. Flock-level observation is the first step in daily health monitoring. Source: CPC Short Courses.'),

      h2('1.2  Meat Birds, Layers, and Breeders: Built for Different Jobs'),
      para('All three production types are the same species, Gallus gallus domesticus, but decades of selective breeding have pushed them in fundamentally different directions.'),
      para('A commercial broiler is a feed-conversion machine. Its pectoralis major (breast) muscle grows faster and reaches a greater proportion of body weight than any other production animal. Heritage birds from the 1950s carried breast muscle at roughly 9% of body weight; modern genetics have pushed that to 21 to 29%, composed almost entirely of fast-twitch white muscle fibers [3,4]. That extraordinary growth rate comes at a cost: the cardiovascular system struggles to keep pace, which creates predictable health problems in weeks four and five.'),
      para('A commercial layer lives for a year or more, cycling an egg nearly every day. Her body is built for sustained activity and reproduction, not rapid muscle growth. She has a lighter frame, stronger legs, and a skeleton that carries a special calcium reserve (medullary bone), drawn down every night to build each eggshell [5,6].'),
      para('A broiler breeder carries significant muscle mass from broiler genetics but must also keep producing fertile eggs across a 40-week production cycle. This requires careful feed restriction throughout the rearing period to prevent the bird from getting too heavy to lay or mate effectively. Getting the breeder to target body weight and holding her there is one of the most demanding management challenges in commercial production [7].'),
      para('Understanding these differences tells you why the management rules for each type are different, and what happens when those rules break down.'),
    ],
  };
}

// ============================================================
// SECTION 2: EXTERNAL ANATOMY
// ============================================================
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Section 2: External Anatomy'),

      h2('2.1  Key External Structures and Their Functions'),
      para('The external anatomy of a chicken is a direct window into the bird\'s health. A farmer who knows what healthy looks like can spot a sick bird quickly.'),

      labeled('Comb and wattles:', 'In a healthy bird they are bright red, slightly warm, and firm. They are not just cosmetic: blood flow through the comb dissipates heat, making the comb important for temperature regulation in hot weather. A pale or shrunken comb tells you the bird is anemic, dehydrated, or cold-stressed. A blue or purple comb means circulation is failing, which points to respiratory or cardiovascular disease [8,9].'),
      labeled('Eyes:', 'Should be clear, bright, and have a copper-red iris. Discharge, swelling, or a sunken appearance are signs of disease or injury. Closed or partially closed eyes in a standing bird usually indicate the bird is ill and weak [8,9].'),
      labeled('Nares and beak:', 'The nostrils should be clean and open. Nasal discharge or crusted nares point to respiratory infection. Check that the beak closes cleanly. Open the beak and look inside: white plaques or lesions in the mouth point to candidiasis or vitamin A deficiency.'),
      labeled('Feathers:', 'Healthy feathers cover the bird from head to vent, lying flat and close to the body. A bird that is ruffled, fluffed up, and hunched is either cold-stressed or sick. Dirty feathers around the vent area may indicate enteric disease. Patchy feather loss in females around the back and neck can indicate over-mating by males. Feather pecking in a flock signals stress, overcrowding, nutritional imbalance, or inadequate lighting [8,9].'),
      labeled('Body condition (keel):', 'Run your finger along the breastbone (keel). In a bird at correct body condition you feel moderate tissue over both sides of the keel with no sharp ridge. A prominent, easily palpated keel edge means the bird is losing condition. In layers, check that pubic bones (just below the vent) are at least two finger-widths apart, which indicates the bird is actively laying [8,9].'),
      labeled('Legs and feet:', 'The shanks should be smooth and clean. The foot pads should be intact, free of lesions and swelling. Scales that are rough, lifted, or crusty on the shanks point to leg mite infestation. Swollen, discolored hocks or foot pads point to bumblefoot or infectious synovitis. Any bird that is reluctant to bear weight or cannot keep up with the flock needs immediate attention.'),

      ...embedPhoto(imgFile('photo_2_1_comb_wattles.jpg'), 'Photo 2.1: Close view of a hen in a barn coop showing the bright-red comb and eye. A firm, warm, bright-red comb indicates good circulatory health. Source: Wikimedia Commons, CC BY 2.0.'),

      ...embedPhoto(imgFile('Photo 2.2, foot pad.jpg'), 'Photo 2.2: Healthy chicken foot pad with smooth shanks and an intact, unblemished plantar surface. A clean foot pad rules out bumblefoot and pododermatitis on flock walks. Source: Ohio State University Extension, Ohioline VME-20 (ohioline.osu.edu/factsheet/vme-20).'),

      h2('2.2  Reading the Bird: Signs of Health from the Outside'),
      para('A healthy bird is alert, moving, eating, drinking, and interacting normally with the flock. Any bird sitting away from others, with eyes closed, standing hunched, or showing labored breathing (tail bobbing with each breath) is telling you something is wrong. By the time one bird is visibly sick, the flock problem has usually been building for several days [8,9].'),
      para('The CPC Learning Centre "Spotting Disease Early" guide provides a practical framework: the first change is always behavioral. Water consumption drops before feed intake; feed intake drops before posture changes; posture changes before mortality climbs [10]. Walking the barn once or twice a day with both eyes open, not just checking feed and water levels, is what separates farms that catch problems at day one from those that catch them at day four when options are narrower.'),
      para('For a systematic daily barn assessment framework that uses external indicators alongside environmental checks, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),
    ],
  };
}

// ============================================================
// SECTION 3: INTERNAL BODY SYSTEMS
// ============================================================
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Section 3: Internal Body Systems Overview'),

      para('The diagram below shows the position of every major organ system inside a commercial laying hen. Work through it once before reading the sections that follow. It will anchor every labeled structure to an actual location in the bird\'s body.'),

      ...embedPhoto(imgFile('chicken systems.jpeg'), 'Figure 3.1: Internal anatomy of the chicken showing the position of all major organ systems. Source: Purina Animal Nutrition LLC.'),

      h2('3.1  The Digestive System'),
      para('A chicken\'s digestive tract has no teeth. It swallows feed whole and relies on a sequence of mechanical and chemical processes to extract nutrients. Every major feeding decision, from particle size to phase feeding to grit use, has its roots in this anatomy [1].'),

      labeled('Crop:', 'The first stop after the esophagus. The crop is a pouch in the lower neck that stores feed and water until the rest of the tract is ready to receive it. It also begins the softening of dry feed through moisture absorption. When the crop empties, the bird signals hunger. In day-old chicks, crop fill at 24 hours is a key welfare indicator: the target is 100% of chicks showing a full, firm crop [1].'),
      labeled('Proventriculus (true stomach):', 'This is where chemical digestion begins. The proventriculus secretes hydrochloric acid and pepsinogen to start breaking down protein. It is relatively small and moves feed through quickly into the gizzard [1].'),
      labeled('Gizzard:', 'The mechanical stomach. Two sets of powerful smooth muscles grind feed against small stones (grit) retained in the gizzard. This grinding reduces feed particles to approximately 1 to 2 mm before they pass into the small intestine [1,11]. A strong, well-conditioned gizzard means better feed conversion. Birds raised on fine mash without insoluble grit often end up with a soft, weak gizzard that does not grind efficiently. Coarser feed particles and insoluble grit in the first two weeks give the gizzard the resistance it needs to build up properly for the rest of the grow-out.'),

      ...embedPhoto(imgFile('photo_3_1_gizzard.jpg'), 'Photo 3.1: Proventriculus and gizzard (left) from a chicken. The proventriculus is narrow and glandular; the gizzard is thick-walled and muscular. A chicken gizzard (right) opened to show the thick muscular walls and tough koilin lining. The koilin layer (pale yellow) protects the muscle from the grinding action. Grit particles retained in the chamber work against the ridged lining to break down feed. Source: Wikimedia Commons / Bjferstern, CC BY-SA 3.0.'),
      labeled('Small intestine (duodenum, jejunum, ileum):', 'The liver and pancreas release digestive enzymes and bile into the duodenum. The jejunum and ileum are where nutrients are absorbed across the villi into the bloodstream. The condition of the intestinal lining determines how much of each gram of feed actually enters the bird. Enteric disease, mycotoxins, or coccidiosis damage the villi and directly reduce nutrient absorption and feed efficiency [12,13].'),
      labeled('Ceca:', 'Two blind pouches at the junction of the small and large intestine. The ceca ferment undigested material and produce short-chain fatty acids and B vitamins. They also reabsorb water and support immune function. Cecal output, the dark, pasty, slightly pungent dropping produced once or twice a day, is completely normal and should not be mistaken for diarrhea [1].'),
      labeled('Cloaca:', 'The shared exit point for the gut, kidneys, and reproductive tract. Feces, urine, and eggs all pass through the cloaca. Because of this shared exit, egg contamination can occur when hens have enteric disease, which is one reason Salmonella control requires managing gut health as well as external hygiene.'),

      ...embedPhoto(imgFile('Chicken Digestive System.JPG'), 'Figure 3.2: The digestive tract, from the gizzard outlet to the vent. The small intestine absorbs nutrients, the two ceca ferment fiber and reclaim water, and everything exits through the cloaca. Source: USDA.'),

      h2('3.2  The Respiratory System'),
      para('A bird\'s respiratory system works nothing like a mammal\'s, and understanding the difference changes how you think about ventilation, ammonia, and dust management.'),
      para('Chickens have no diaphragm. Instead, the sternum and rib cage move in and out to drive breathing [14]. If you hold a bird too tightly around the chest, you restrict this movement and the bird cannot breathe. Catch birds by the body, not the chest.'),
      para('The lungs of the chicken are unlike ours. They don\'t swell and shrink. Birds instead have nine air sacs that act like bellows to push air steadily one way through the lung tissue. Air flows through tiny tubes called parabronchi, and the important thing is that fresh air continues to flow through during both inhalation and exhalation. That\'s why chickens extract more oxygen out of each breath than we do. It\'s a more efficient system, which is important when you\'re dealing with fast growing birds that need a lot of oxygen [14].'),
      para('The nine air sacs are: one cervical, two interclavicular, two anterior thoracic, two posterior thoracic, and two abdominal. They also connect directly to the pneumatic (hollow) bones: skull, humerus, clavicle, keel, pelvic girdle, and lumbar and sacral vertebrae [15]. This means a broken pneumatic bone can directly affect breathing. It also means respiratory infections can spread into bone.'),
      para('The management implication is straightforward. That efficiency comes with a trade-off. Ammonia at 10 ppm already damages the cilia lining the respiratory tract, the primary defense against bacteria and irritants [14]. The bird cannot cough pathogens out the way a mammal can. When cilia are destroyed by ammonia or dust, bacteria reach the air sacs directly. A flock visibly damaged by ammonia, with watery eyes and bubbling faces, has been breathing damaging air for days or weeks before those signs appeared.'),
      para('High dust loads make it worse. Every square meter of poorly managed litter sends bacteria, endotoxins, and mold spores into the air. Adequate ventilation is not a comfort measure: it is a basic immune defense requirement.'),

      ...embedPng(imgFile('respiratory system.png'), 'Figure 3.3: The avian upper respiratory tract showing the nine air sacs, larynx, trachea, syrinx, bronchi, and lungs. The syrinx is the sound-producing organ unique to birds. Unlike mammalian lungs, gas exchange occurs during both inhalation and exhalation. Source: CPC Short Courses.'),

      h2('3.3  The Circulatory System'),
      para('A chicken\'s heart is four-chambered, like a mammal\'s, and it works extremely hard. The resting heart rate is approximately 250 to 300 beats per minute [16]. The left ventricle is the largest chamber by far, with much thicker walls than the right, because it has to push blood to the entire body at high pressure. The right ventricle only needs to move blood through the nearby lungs, which offer much less resistance.'),
      para('Body temperature runs at 41 to 42°C. Blood volume is approximately 6 to 9% of body weight, which means a 2.5 kg broiler carries roughly 150 to 225 mL of blood [8,9].'),
      para('Here\'s what matters for fast-growing broilers: their hearts and lungs can\'t keep up with how quickly they\'re putting on muscle [17]. By week four or five, many birds are carrying more breast meat than their heart and lungs were built to handle. When it\'s cold, you\'re at altitude, or the barn\'s poorly ventilated, the heart can\'t push enough oxygen to all that muscle. The right side of the heart works overtime trying to force blood through congested lungs. Eventually, fluid backs up into the belly. That\'s ascites. In other cases, the heart just gives out without warning, and you lose a healthy-looking bird overnight. That\'s Sudden Death Syndrome. Both come down to the same problem: muscle growth outpaces heart and lung capacity [18,19].'),

      h2('3.4  The Skeletal and Muscular Systems'),
      para('A chicken\'s skeleton is built light and strong for wing use and limited flight. Compared to a mammal of the same size, the bones are lighter, several sections are fused for rigidity, and a deep keel anchors the main flight muscles. These features are what you work with in the barn, and they shape how you handle the bird and what can go wrong.'),
      labeled('Pneumatic bones:', 'The skull, humerus, clavicle, keel, pelvic girdle, and lumbar and sacral vertebrae are hollow and connected to the air sac system [15]. A fracture of a pneumatic bone can compromise breathing. Rough catching, improper handling, or falls during transport can cause these fractures.'),
      labeled('Medullary bone:', 'Found only in female birds approaching or in lay. Medullary bone is a dense, spongy calcium reserve found in the tibia, femur, pubic bones, ribs, ulna, and several other bones. As pullets approach lay, estrogen triggers the buildup of medullary bone as a labile calcium bank. During the 20 hours the shell is forming overnight, when the hen is not eating, she draws on medullary bone to supply the calcium her shell needs [6]. This process repeats every 24 hours throughout the laying cycle.'),

      ...embedPng(imgFile('medullary bone.png'), 'Photo 3.2: Medullary bone in a chicken. During lay, calcium is mobilized from the medullary bone to form strong eggshells. Source: CPC Short Courses.'),

      labeled('Keel (sternum):', 'The breastbone and its forward-facing ridge (the keel) serve as the attachment surface for the large pectoral muscles. In broilers, palpating the keel is a rapid body condition check: a sharp, easily felt keel edge means the bird is too thin. In layers, keel damage from repeated impacts against the floor, perch, or nesting equipment is a significant welfare issue in cage-free and aviary systems [15].'),

      ...embedPhoto(imgFile('Poultry anatomy.jpg'), 'Photo 3.3: The skeletal and muscular anatomy of the chicken. The left side shows the major muscle groups (pectoral, biceps, triceps); the right side shows the skeleton, including the keel, sternum, pelvis, and the wing and leg bones. Source: USDA.'),

      para('The pectoral muscles (breast) tell two very different stories in broilers versus layers.'),
      para('In today\'s broilers, almost all of the big breast muscle is made of fast-twitch "go" fibers, the same kind wild birds use for a short, explosive burst of flight. Back in the 1950s, that breast made up only about 9% of the bird\'s body; in modern meat birds it is closer to one quarter, and often even more [3,4]. That huge, fast-growing breast is what makes a broiler pay the bills, but it also sets the stage for woody breast. When the muscle grows faster than the blood supply can keep up, parts of it run short on oxygen, the tissue gets damaged, and it heals back with scar tissue, leaving those hard, "woody" fillets that get downgraded at the plant.'),
      para('In layers, the pectoralis is smaller and less developed. The leg muscles are proportionally larger and more red (slow-twitch), built for sustained movement across months rather than explosive bursts.'),

      h2('3.5  The Reproductive System'),
      para('Only the left ovary and oviduct develop fully in female chickens. The right side shuts down before hatch and stays dormant for life [20]. At hatch, a pullet already carries all the ova she will ever lay, tens of thousands of potential eggs, though only a small fraction will mature over her productive life. No new ova develop after hatching.'),
      para('The oviduct is 25 to 27 inches long in a fully productive layer. Egg formation from ovulation to laying takes approximately 25 to 26 hours and passes through five distinct sections [20]. Figure 3.4 shows the layout of the tract, and Table 3.1 lays out the timing section by section.'),

      ...embedPhoto(imgFile('Poultry reproductive System.JPG'), 'Figure 3.4: (a) The hen\'s reproductive tract. Only the left ovary and oviduct develop. The yolk is released from the ovary, caught by the infundibulum, then wrapped in egg white, membranes, and finally the calcium shell as it moves down the tract. (b) The rooster\'s reproductive system. The two testes lie inside the abdominal cavity near the kidneys, unlike mammals where the testes are usually located outside the body. Source: USDA.'),

      para('Table 3.1: Egg formation timeline by oviduct section [20].', { spaceAfter: 60 }),
      oviductTable(),
      new Paragraph({ spacing: { before: 80, after: 0 } }),

      para('The calcium cost of each egg is significant. Each shell contains approximately 2 grams of calcium [5]. During the 20-plus hours of shell formation (mostly at night, when the hen is not eating), she mobilizes 20 to 40% of that calcium from medullary bone [5]. The diet must supply the balance. A layer on an adequate calcium diet (3.5 to 4.5% of diet by weight) can meet her daily needs and maintain bone health. A layer on an inadequate calcium diet will exhaust her medullary bone and begin resorbing structural cortical bone, leading to progressive osteoporosis, fractures, and end-of-lay collapse [5,6].'),
      para('Ovulation is triggered by light. The hypothalamus detects the change in day length and triggers the hormone chain that drives follicle growth and ovulation. Ovulation almost never occurs after 3 PM under normal daylight conditions, which means hens laying late in the day skip the next morning\'s ovulation and miss a laying day [20]. Careful lighting management using 14 to 16 hours of light per day maintains consistent ovulation timing across the flock. For detailed lighting program guidance, see the CPC Learning Centre Lighting Program Guidelines for Broilers 2026 [21], which covers both the technical setup and the practical management of lighting transitions.'),

      h2('3.6  The Urinary System'),
      para('The bird\'s urinary system explains something a farmer sees every single day: the white cap on top of a normal dropping. A bird gets rid of its nitrogen waste as uric acid, a thick white paste, not as watery urine the way a mammal does [22]. So when you look at a normal dropping, the white part is the "urine" from the kidneys and the darker part is the feces from the gut. Reading droppings starts with knowing which part comes from where.'),
      para('A bird has two reddish-brown kidneys, each in three lobes, tucked tight against the backbone and the pelvic bones, right behind the lungs [22]. You cannot feel them in a live bird; you see them at necropsy sitting in hollows in the bone. There is no bladder. Birds do not store urine. A narrow tube (the ureter) runs straight from each kidney to the cloaca [22]. To save water, the bird moves urine backward into the lower gut and reclaims some of the water before it passes out [22]. That helps the bird hold water, but it also means the kidneys lean on the bird drinking enough in the first place.'),
      para('Here is what goes wrong. When the kidneys cannot keep up, when a bird is short of water, or when non-laying birds get a high-calcium layer ration, uric acid builds up in the blood and crystallizes out as chalky white deposits. On the organs, that is visceral gout; in the joints, articular gout [22,23]. At necropsy a gout bird looks like the heart, liver, and air sacs were dusted with white chalk. Infectious bronchitis and a few other diseases can damage the kidneys and trigger the same thing, which is one more reason those diseases matter on a layer farm [23].'),
      para('The prevention is plain. Keep clean water in front of the birds at all times, especially in hot weather when intake climbs and any water-line problem shows up fast. Do not feed a layer (high-calcium) ration to pullets or non-laying birds, because their kidneys cannot clear that calcium load. For the full barn water management framework, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),

      ...embedPhoto(imgFile('Chicken urinary System.JPG'), 'Figure 3.5: The avian urinary system. Two kidneys sit tight against the backbone and drain through the ureters directly to the cloaca; there is no bladder. Nitrogen leaves the body as uric acid, the white cap on a normal dropping. Source: USDA.'),

      h2('3.7  The Immune System'),
      para('It is worth knowing the immune system for one simple reason: every vaccine you give and every disease challenge your flock faces runs straight through it. A few of its parts are unique to birds, and most of them are biggest in young birds, which is exactly why early life is when the immune system gets built.'),
      para('There are two "training schools" where the bird makes its defense cells. The bursa of Fabricius is a small pouch just above the vent, and it is found only in birds. It trains the B-cells that make antibodies [24]. The thymus runs as strips of tissue up both sides of the neck, and it trains the T-cells that find and kill infected cells [24]. Both organs are largest in the young bird and shrink with age. Once the cells are trained, they move out and stand guard in the spleen, in the cecal tonsils at the gut, and in the Harderian gland behind the eye [24].'),
      para('Two of these matter directly for day-to-day management. The bursa is the target of Gumboro disease (infectious bursal disease). Wreck the bursa early and the bird cannot make antibodies properly, so every other vaccine works poorly and the bird stays vulnerable. That is why the immunosuppressive diseases like Gumboro and Marek\'s are taken so seriously. For the full profiles of those diseases, see Course 7 (Common Poultry Diseases) in this series. The Harderian gland matters because spray and eye-drop vaccines land right where this gland can pick them up, which is why those routes work well for respiratory diseases.'),
      para('The other piece is maternal antibodies. A chick hatches with antibodies passed from the hen through the yolk [24]. They protect the chick for the first couple of weeks, then fade. Vaccinate too early, while those maternal antibodies are still high, and they soak up the vaccine before it can do its job. Vaccinate too late, and disease gets there first. Timing the vaccine around maternal antibody levels is the whole game. For the full vaccination programs and the hands-on technique for water, spray, eye-drop, and injection routes, see Course 8 (Vaccination) in this series.'),

      ...embedPhoto(imgFile('Chick immune system.JPG'), 'Figure 3.6: The main immune organs of the chicken. The bursa of Fabricius and the thymus train new defense cells and are largest in young birds; the spleen, cecal tonsils, and Harderian gland are where those cells stand guard. Maternal antibodies passed through the yolk protect the chick early but fade, which is why vaccination timing is built around them. Source: CPC Short Courses.'),
    ],
  };
}

// ============================================================
// SECTION 4: MEAT BIRDS (BROILERS)
// ============================================================
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Section 4: Meat Birds (Broilers)'),

      h2('4.1  Built for Rapid Muscle Growth'),
      para('A commercial broiler today reaches 2.5 to 3 kg in 38 to 45 days. A heritage bird from the 1950s would have needed over 100 days to reach the same market weight [4]. The driver is genetics: the muscle cells of a broiler multiply and develop faster than those of any other chicken type, and breeding selection has pushed that advantage relentlessly [3].'),
      para('In today\'s meat birds, the big breast muscle alone makes up around a quarter of the bird\'s live weight. It is built almost entirely from fast "white" muscle fibers, and those fibers are very good at packing on meat quickly, but they burn a lot of fuel to do it. As the broiler grows, the breast puts on weight even faster than the rest of the body, so breast yield keeps climbing as you raise birds to heavier weights [3].'),
      para('To keep pace with this muscle growth, the digestive system has also been selected for efficiency. Broilers with better feed conversion ratios have proportionally heavier gizzards, longer ceca, and lower relative liver weight. The gut in a high-performing broiler is built to squeeze every bit of energy and protein from each gram of feed [11].'),

      ...embedPng(imgFile('Broiler wide breast.png'), 'Photo 4.1: Commercial broiler showing the characteristic broad breast profile of modern genetics. Source: CPC Short Courses.'),

      h2('4.2  Feed Conversion and Metabolism'),
      para('Modern broilers achieve feed conversion ratios of approximately 1.5 to 1.7 kg feed per kg of gain [25]. They get there through high feed intake, fast muscle growth, and less energy spent on movement than layers do. More feed energy goes toward muscle growth; less is spent on movement and heat [3,17].'),
      para('Phase feeding (starter, grower, finisher diets) is designed around the broiler\'s changing requirements. Early diets are high in protein to support rapid muscle growth. Later diets shift the energy-to-protein ratio as the bird deposits more fat in the final weeks. Getting those transitions right means knowing what the bird needs at each stage: feed ahead of the curve, not behind it.'),

      h2('4.3  Common Health Challenges in Broilers'),
      para('The same genetics that make the broiler grow fast create predictable health vulnerabilities. The conditions in this section are the non-infectious ones: metabolic and structural problems that come from the bird\'s own biology and growth rate, not from a virus, bacteria, or parasite. They are not random events. They follow directly from the biological trade-offs described above. The infectious diseases that also hit broilers, and how to tell them apart from these, are covered separately in Course 7 (Common Poultry Diseases) in this series.'),

      labeled('Ascites (pulmonary hypertension syndrome):', 'The heart and lungs grow more slowly as a proportion of body mass than the muscle does. In cold, high-altitude, or poorly ventilated conditions, the demand for oxygen outpaces the supply. The right ventricle overloads and gives out. When that happens, fluid backs up into the body cavity. You see a swollen, heavy belly, labored breathing, and a blue-purple comb. Ascites is more common in cold-weather flocks and at higher altitudes. Adequate ventilation, avoiding early cold snaps, and lighting or feed restriction programs that slightly slow early growth to let the cardiovascular system keep up are the main prevention tools [19]. For the full ascites disease profile, see Course 7 (Common Poultry Diseases) in this series.'),
      labeled('Sudden Death Syndrome (SDS):', 'There are no warning signs. One minute the bird looks healthy; the next it is dead, typically on its back. SDS hits predominantly males and the fastest-growing birds in the flock. It most commonly affects birds between 2 and 4 weeks of age, during the fastest period of muscle growth. In commercial flocks, SDS typically accounts for 0.5 to 4% of bird losses [18]. Like ascites, it comes from the bird\'s heart and lungs falling behind its muscle growth. For the full SDS disease profile, see Course 7 (Common Poultry Diseases) in this series.'),
      labeled('Skeletal disorders:', 'Fast bone growth before the skeleton matures can produce angular limb deformities, tibial dyschondroplasia, and crooked leg alignment. A bird that cannot walk freely cannot reach feed and water, which directly costs performance. Lameness in broilers is both a welfare concern and a real production loss. Adequate calcium, phosphorus, and vitamin D3 in early diets, plus dry litter to prevent footpad dermatitis, are the tools that prevent it [26].'),
      labeled('Woody breast and white striping:', 'When the breast grows so fast that the blood supply can\'t keep up, parts of the muscle run short on oxygen. Those spots get damaged, fill with fluid, and heal up as tough scar tissue, giving that hard, rubbery feel we call woody breast. White striping is basically a milder version of the same problem. You see both issues more often in big, fast-growing birds, and they can really hurt your grading at the plant. The heavier you grow them, the higher the risk, so your main levers are good ventilation, pulling birds a bit earlier, and using genetics that give up a little speed in exchange for better breast quality [3].'),

      h2('4.4  Key Management Considerations'),
      para('The broiler\'s anatomy points to a short list of things that are not optional.'),
      bullet('Ventilation must keep ammonia below 10 ppm throughout the house. At this concentration, cilia are already beginning to be damaged. A broiler at week four is carrying a cardiovascular system already running near its limits: adding respiratory stress accelerates failure [14,19].'),
      bullet('Lighting and early feed programs can slightly slow growth in the first seven days, giving the heart and lungs a chance to keep up. Some integrators use short dark periods or alternate-day lighting protocols for this purpose. For the full lighting protocol, see the CPC Learning Centre Lighting Program Guidelines for Broilers 2026 [21].'),
      bullet('Litter management keeps foot pad dermatitis under control. Broilers live on the same surface from placement to catch. Wet litter means foot pad contact with caustic ammonia and bacteria all day, every day. Maintaining litter moisture at 20 to 25% protects foot pad integrity and welfare scores [27].'),
      bullet('Stocking density affects air quality, activity levels, and leg health. The NFACC Code of Practice sets conventional maximum stocking density at 31 kg/m² live weight for commercial broilers. Exceeding this increases the risk of all the conditions above.'),
      para('For the daily management framework that monitors these parameters through the grow-out, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),
    ],
  };
}

// ============================================================
// SECTION 5: LAYERS AND BREEDERS
// ============================================================
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Section 5: Layers and Breeders'),

      h2('5.1  Built for Egg Production and Reproduction'),
      para('A commercial layer has a lighter frame, stronger legs, and a more developed pelvic region than a broiler of the same age. As she approaches sexual maturity, the pubic bones spread to allow eggs to pass. A practical field check: two or more finger-widths between the pubic bones typically indicates an active layer [8,9]. The layer\'s smaller muscle mass means she needs less dietary protein and energy for maintenance, freeing more nutrients for egg production.'),
      para('Most pullets start laying their first eggs around 18 to 20 weeks of age, depending on breed, lighting program, and season [28]. From there, production climbs quickly. Commercial white-egg layers like Hy-Line W-36 and other Leghorn-type birds usually hit their stride around 26 to 28 weeks of age, when they are laying very close to one egg per hen per day under good management [29]. Brown-egg strains used in Canada, such as Lohmann Brown-Classic and Hy-Line Brown, follow a similar timeline and are also bred to peak in the mid-90s or better for hen-day production when they are managed and fed well [29,30].'),
      para('In Canada, most farms now plan for roughly a year of production from a flock, about 50 to 52 weeks of lay, so birds are often kept through to around 68 to 70 weeks of age in the first cycle if production and shell quality stay strong [31]. Instead of using a hard "we ship at 72 weeks" rule, the real decision point is whether the birds are still paying their way: good egg numbers, strong shells, acceptable mortality, and reasonable feed conversion. When those pieces start slipping, that is when you look at whether it makes more sense to ship the flock and bring in new pullets.'),
      para('In theory, you can induce a molt to "reset" hens and get another round of lay with better shells, and both white-egg and brown-egg strains will respond, but in Canada this is not something we rely on as a normal tool. Old-style forced molting by taking away feed or water is not acceptable here, and national veterinary guidance says molt should only be considered in unusual situations, under a vet and nutritionist, and using humane, non-fasting methods if it is used at all [28,32].'),
      para('Broiler breeders combine the larger frame of broiler genetics with the reproductive requirement of sustained egg production. Feed restriction starts early in rearing to prevent over-conditioning. An overweight broiler breeder has reduced ovulation rate, lower fertilization, and higher embryo mortality. An underweight breeder also performs poorly. Keeping the breeder at target body weight through a carefully managed step-up feeding program is the core of breeder management [7].'),

      ...embedPhoto(imgFile('photo_5_1_layer_hen.jpg'), 'Photo 5.1: Commercial white leghorn laying hen. A bright-red firm comb, clear amber eyes, full white plumage, and upright alert posture all indicate a bird in good health. Source: USDA Agricultural Research Service / Stephen Ausmus, Public Domain.'),

      h2('5.2  The Reproductive Tract and Egg Formation'),
      para('The oviduct and egg formation process are covered in full in Section 3.5 above. Here are the production implications.'),
      para('The timing of the first egg is determined by light. Pullets are kept on short or shortening day lengths to delay sexual maturity until they reach target body weight and bone development. Stimulating ovulation too early, when the pullet is underweight and her bones are not fully developed, produces small eggs with poor shells and increases the risk of prolapse. Stimulating lay at the right time requires the pullet to have reached frame maturity and have adequate calcium reserves already laid down as medullary bone.'),
      para('In broiler breeders, fertilization is the key output. The male must be in good physical condition, at the right body weight, and have adequate access to all females. In floor-pen breeder operations, the male to female ratio is typically managed at about 8 to 10 males per 100 females to maintain good fertility [7]. Sperm can remain viable in the hen\'s sperm storage tubules for up to two to three weeks, but fertility drops the longer it has been since her last mating.'),

      h2('5.3  Nutritional Needs for Laying and Fertility'),
      para('A layer needs roughly 4 grams of calcium every day, far more than feed provides at standard inclusion levels. The diet must contain 3.5 to 4.5% calcium by weight, balanced with available phosphorus and vitamin D3 to support calcium absorption and bone metabolism [5,6]. Too little calcium and the skeleton pays. Too much, and kidney function can be compromised.'),
      para('Vitamin D3 is not optional: it is required for active calcium absorption in the small intestine, for medullary bone formation, and for normal shell gland function [33,34,35,36]. Layers raised indoors receive no UV light for natural vitamin D synthesis, so dietary supplementation is the only supply [33,34,35,36].'),
      para('Breeders require additional attention to vitamin E, selenium, folate, and biotin, all of which affect whether embryos develop and hatch normally. Vitamin D3 deficiency in the breeder diet produces chicks that are weak and unable to stand normally in the hatchery. These are problems that trace back to the hen\'s nutrition, not to incubation conditions [7].'),

      h2('5.4  Health Issues Specific to Layers and Breeders'),
      labeled('Osteoporosis and bone fractures:', 'These are the biggest bone problem in laying hens. Over a long laying cycle, hens pull calcium out of their bones day after day to make shells, and the skeleton slowly loses strength. The longer you keep birds in lay, the more structural bone is broken down faster than it can be rebuilt, so keel and leg fractures show up more often toward the end of the cycle. Keeping dietary calcium and vitamin D3 at the right levels all the way through lay, and managing barns to reduce panic, falls and hard landings, are the main tools we have to cut down on fractures [5,6].'),
      labeled('Prolapse:', 'When the oviduct or cloaca prolapses through the vent, other birds in the pen peck at it immediately. Prolapse is more common when pullets come into lay too early (before adequate body size), when eggs are unusually large, or when birds are stressed. It is more prevalent in cage-free systems where birds are more active and collisions are common. Any bird found with tissue protruding from the vent should be removed from the pen immediately.'),
      labeled('Internal laying:', 'Yolk peritonitis happens when an egg or egg yolk slips into the belly instead of going down the oviduct. The belly slowly fills with yolk and fluid, which then gets infected. It is a slow, creeping problem and is usually fatal in the end. These hens often have a big, soft, fluid-filled belly and lose weight over time, even though they may still be eating. It shows up more often in very high-producing hens and in breeder birds that have been pushed too hard or kept laying past their best production period.'),
      labeled('Fatty liver syndrome:', 'Layers in cages are prone to hepatic lipidosis (fatty liver disease). Restricted movement combined with high-energy diets leads to fat buildup in the liver. The liver enlarges, becomes fragile, and can rupture. Rupture causes acute internal hemorrhage and sudden death. Fatty liver is one of the most common causes of sudden death in peak-production cage layers. Managing energy density in late-lay diets and ensuring adequate choline and methionine in the feed are the primary management tools.'),
    ],
  };
}

// ============================================================
// SECTION 6: COMPARING MEAT BIRDS VS LAYERS AND BREEDERS
// ============================================================
function buildSection6() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Section 6: Comparing the Physiology of Meat Birds, Layers, and Breeders'),

      para('Anatomy is how the bird is built. Physiology is how those parts actually work day to day: how the bird turns feed into meat or eggs, how it moves calcium, how hard the heart and gut have to run. This is where the course title earns its second half. All three production types share the same basic anatomy, the same organs in the same places, but their physiology pulls in very different directions, and that is what drives the different management rules for each one. This section puts that physiology side by side.'),
      para('Table 6.1 summarizes the key physiological and production differences across the three main production types [3,5,8,9,17,18,19,25].', { spaceAfter: 60 }),
      comparisonTable(),
      new Paragraph({ spacing: { before: 80, after: 0 } }),

      h2('6.1  Growth Patterns'),
      para('Broilers grow faster than any other farm animal in the first five to six weeks. A modern broiler reaches 2.5 kg or more in about 38 days; a heritage bird of the 1950s would have needed over 100 days for the same weight [4]. By six weeks, a good layer pullet will usually weigh around 400 to 500 g. A broiler breeder pullet at the same age is heavier, often 700 to 900 g, because she is already on a feed-restricted program to keep her on the target weight chart [7].'),
      para('The growth curves pull apart because we feed them very differently. A broiler is basically allowed to eat as much as it wants, so it grows fast and puts on a lot of meat. A layer pullet is on a controlled ration so she builds a good frame and strong bones without getting too fat too early.'),

      h2('6.2  Body Structure'),
      para('Picking up a broiler and picking up a layer of similar age tells you immediately that these are not the same animal. The broiler is broad-chested, heavy, and often breathes with a slight effort even at rest. The layer is lean, narrow, active, and alert. The broiler\'s pectoral muscles are thick and fill the hand when you hold the bird. The layer\'s keel is prominent and easy to feel through lighter breast tissue.'),
      para('In breeders, the body structure sits between the two types: more breast muscle than a layer, but a leaner condition than a broiler because the feed restriction program has prevented the excess fat deposition that an unrestricted broiler-genetics bird would carry.'),

      h2('6.3  Metabolic Differences'),
      para('Broilers put most of what they eat toward laying down protein and growing muscle fast. Their muscle cells multiply and develop faster than those in layers or breeders [3].'),
      para('Layers push most of their feed energy toward egg production. Just keeping up with the daily calcium demand takes a big slice of everything the hen eats. A high-producing layer is running a continuous mineral and protein production line alongside her basic maintenance needs. Energy not directed toward eggs is stored as fat in the liver and abdomen, which is why over-conditioning in cage environments becomes a health problem.'),
      para('Breeders have to hit a middle ground: enough muscle and body condition to be a healthy broiler-type bird, but light and balanced enough to lay plenty of fertile eggs over roughly 40 weeks of production. That balance is managed mainly through feed restriction and close body weight monitoring, backed up by good lighting, space, and overall flock management.'),

      h2('6.4  Housing and Management Implications'),
      para('Broilers need ventilation to handle the heat and moisture a fast-growing flock generates, keep ammonia down from the litter, and density control to protect leg health. The bird\'s fast metabolism generates real heat and moisture. Ventilation must keep up as the flock grows week by week.'),
      para('Layers need good nest boxes, enough perch space, and enough floor space so they can move, perch, and lay in a nest the way a hen naturally wants to. They also need plenty of calcium, and timing matters. Offering coarse calcium (like limestone grit) in the afternoon, before the hen starts forming the shell overnight, helps keep more calcium available in the gut during the night when she needs it most.'),
      para('Breeders need separate feeding systems for males and females so you can control body weight for each sex on its own. When males and females eat together at the same feeders, it is very hard to keep roosters on their target weight and still give hens what they need. In a well-run breeder barn, farmers weigh a sample of hens and roosters every week and tweak feed levels to keep both sexes on their target charts.'),
    ],
  };
}

// ============================================================
// SECTION 7: PRACTICAL APPLICATION FOR FARMERS
// ============================================================
function buildSection7() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Section 7: Practical Application for Farmers'),

      h2('7.1  Feeding Strategies'),
      para('The way the gut is built explains why particle size and grit matter. A gizzard that never has to work hard does not develop full grinding power. Giving birds some coarser particles or insoluble grit early in life helps the gizzard grow and do its job properly, which can support better feed use as the flock grows [11]. This does not mean moving to a full whole-grain diet. In practice, it means using a small amount of whole grain (for example 2 to 5% wheat) or offering insoluble grit in the early brooding period as a management tool, not an optional extra.'),
      para('Phase feeding means changing rations as the bird\'s needs change. If you feed a heavy finisher feed in the first week, you waste expensive amino acids the chick can\'t use yet and you don\'t give it the starter nutrients it needs to build early muscle. Each feed change should be based on where the birds are in their growth (weight and look), not just what the calendar says.'),
      para('For layers, calcium timing matters as much as calcium content. Providing coarse calcium sources such as oyster shell or limestone grit in the afternoon (not just in the complete feed) improves calcium availability at the time the hen needs it most, during overnight shell formation. Hens on a balanced layer diet but without coarse calcium access often show poorer shell quality late in the cycle [5].'),

      ...embedPng(imgFile('Broiler crumble feed_Vs_Limestone grit.png'), 'Photo 7.1: Broiler crumble feed (left) compared to coarse insoluble limestone grit (right). Grit challenges the gizzard to develop its full grinding capacity. Providing insoluble grit in the first 10 to 14 days of brooding improves gizzard development and feed conversion. Source: CPC Short Courses.'),

      h2('7.2  Housing Adjustments'),
      para('The air sac system means ventilation is a basic respiratory health requirement, not a comfort measure. Ammonia above 10 ppm is actively destroying the primary immune defense of every bird in the house. In cold weather, the temptation is to close up and conserve heat. A warm barn with 50 ppm ammonia is far more damaging to the flock than a slightly cooler barn with clean air [14].'),
      para('Duct placement, inlet design, and ceiling height all affect how evenly fresh air moves through a broiler flock. A bird breathing stale air in a corner near the floor has the same anatomy as a bird breathing clean air near a well-designed inlet, but its "environmental history" is very different. Over time, poor air quality in those dead spots is harder on the bird\'s respiratory tract and cilia and sets that group up for more health and performance problems. Getting even air distribution across the floor is just as important as hitting the target ventilation rate.'),
      para('For layers in cage-free or aviary systems, the keel bone is a welfare problem worth tracking. Hens learn to navigate elevated structures, but collisions and falls cause keel fractures that go undetected in most barn checks. Monitoring keel damage rates at processing is the most reliable indicator of in-barn conditions. Lower perch heights, cushioned edges on nest boxes, and good lighting in transition zones reduce the collision rate.'),

      h2('7.3  Health Monitoring'),
      para('The CPC Learning Centre "Spotting Disease Early" guide recommends a daily routine that starts with water consumption (water drops before feed intake), a five-sense walk through the barn, and checking individual birds at floor level [10]. What the anatomy tells you is where to look and what each sign means.'),
      para('A bird with respiratory disease shows tail-bobbing (the sternum pumping harder to compensate for reduced airflow), nasal discharge, or open-mouth breathing. Because the sternum drives breathing, a bird working hard to breathe pumps the whole rear of its body with every breath. You can see it from several meters away.'),
      para('A bird with digestive disease shows pasty vent, weight loss reflected in a prominent keel, or altered droppings. Cecal droppings that are darker or more frequent than normal, or watery droppings that lack the dark cecal portion, point to enteric disease. Compare several birds from different parts of the house, not just one area.'),
      para('A bird with cardiovascular distress shows blue or purple comb, lethargy, and abdominal swelling. In a broiler flock approaching week four, any bird showing those three signs together is a strong ascites candidate.'),
      para('For the full systematic daily monitoring framework, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),

      h2('7.4  Handling and Welfare Considerations'),
      para('Never pick up a bird by its legs alone. The bird\'s body weight pulling against the hip joint causes pain and can dislocate the joint. Hold the wings against the body and support the bird\'s weight from underneath. In commercial operations, trained catchers handle large numbers of birds; proper technique cuts wing and leg fractures, which hurt both bird welfare and carcass quality.'),
      para('Catch and handle birds in low light. In dim conditions, birds see poorly and stay calmer and less active. Cut the time between catch and loading, keep birds upright rather than inverted, and you reduce heat stress and the acid buildup in muscle tissue that hurts meat quality at processing.'),
      para('Never hold a bird tightly around the chest. The sternum and rib cage must be free to move for the bird to breathe. A handler gripping too tightly around the chest stops the bird from breathing. This is especially important for individual bird examinations and for holding birds during vaccination.'),
    ],
  };
}

// ============================================================
// SECTION 8: SUMMARY AND KEY TAKEAWAYS
// ============================================================
function buildSection8() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Summary and Key Takeaways'),

      para('This course has covered the major body systems of the commercial chicken and the practical management implications of each. The key points to carry from each section:'),

      h2('The Bird\'s Design Purpose'),
      bullet('Broilers, layers, and breeders are the same species but built for fundamentally different jobs. Broilers deposit breast muscle at a rate that creates predictable cardiovascular stress. Layers cycle calcium through their skeleton daily to build eggshells. Breeders must balance both.'),

      h2('External Anatomy as a Health Tool'),
      bullet('The comb and wattles reflect circulatory health: pale means anemia or cold stress; blue means cardiovascular failure.'),
      bullet('Feather condition, posture, and behavior change before visible physical signs. The daily barn walk is the most important diagnostic tool on the farm.'),
      bullet('Keel palpation gives rapid body condition information in any production type.'),

      h2('The Digestive System'),
      bullet('No teeth: feed goes from crop to proventriculus to gizzard for chemical and mechanical digestion.'),
      bullet('Gizzard development in early brooding affects feed conversion for the rest of the grow-out. Coarser feed or insoluble grit access supports gizzard development.'),
      bullet('Cecal droppings are normal. Watery droppings or excessive vent pasting indicate enteric disease.'),

      h2('The Respiratory System'),
      bullet('Nine air sacs, no diaphragm, unidirectional airflow through parabronchi. The bird breathes using sternal movement, not lung expansion.'),
      bullet('Ammonia above 10 ppm destroys the cilia that defend the respiratory system. This is the most important ventilation threshold in the barn.'),
      bullet('Pneumatic bones are connected to the air sac system. A broken humerus or keel can directly affect breathing.'),

      h2('The Circulatory System'),
      bullet('Resting heart rate approximately 250 to 300 beats per minute. Body temperature 41 to 42°C [16].'),
      bullet('The broiler\'s cardiovascular system grows more slowly than its muscle mass after week three. This is the root cause of ascites and Sudden Death Syndrome.'),

      h2('The Skeletal and Muscular Systems'),
      bullet('Modern broiler breast muscle accounts for 21 to 29% of body weight, up from roughly 9% in heritage birds of the 1950s [4]. Fast growth outpacing blood supply causes woody breast.'),
      bullet('Medullary bone in layers is a labile calcium bank, deposited and resorbed every 24 hours to supply calcium for eggshell formation.'),
      bullet('Inadequate dietary calcium in layers leads to osteoporosis and fractures, not just poor shell quality.'),

      h2('The Reproductive System'),
      bullet('Only the left ovary and oviduct are functional. Egg formation takes 25 to 26 hours through five oviduct sections.'),
      bullet('Shell formation takes 20-plus hours and deposits approximately 2 grams of calcium, of which 20 to 40% comes from medullary bone overnight [5,6].'),
      bullet('Ovulation is light-triggered. Lighting program management is reproductive system management.'),

      h2('The Urinary System'),
      bullet('Birds have no bladder and pass nitrogen waste as uric acid, the white cap on a normal dropping. The white part comes from the kidneys; the dark part is feces from the gut.'),
      bullet('When uric acid backs up (dehydration, kidney damage, or high-calcium feed given to non-laying birds), it crystallizes on the organs or in the joints as gout. Steady clean water and the right ration for the bird\'s stage are the prevention [22,23].'),

      h2('The Immune System'),
      bullet('The bursa of Fabricius (unique to birds) and the thymus train the bird\'s defense cells, and both are largest in young birds. The bursa is the target of Gumboro disease, which is why immunosuppressive diseases hurt every vaccine [24].'),
      bullet('Chicks hatch with maternal antibodies from the yolk that fade over the first weeks. Vaccination timing is built around those levels [24].'),

      h2('Management Takeaways'),
      bullet('Feed particle size and grit access in early brooding shape gizzard development and feed conversion.'),
      bullet('Ventilation is not a comfort measure: it is a respiratory immune defense measure. Keep ammonia below 10 ppm.'),
      bullet('Cardiovascular stress in broilers after week three is unavoidable in fast genetics, but it is manageable through ventilation, lighting programs, and stocking density.'),
      bullet('Layer calcium management is bone management. Every egg that leaves the barn contains calcium that came from the diet or the skeleton.'),
      bullet('Handle birds by supporting the body, not gripping the chest. The rib cage must be free to move for the bird to breathe.'),
    ],
  };
}

// ============================================================
// JOURNALS + REFERENCES
// ============================================================
function buildReferencesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      bullet('Poultry Science (Elsevier / Oxford Academic)'),
      bullet('British Poultry Science (Taylor & Francis)'),
      bullet('Journal of Applied Poultry Research (Elsevier)'),
      bullet('Avian Diseases (American Association of Avian Pathologists)'),
      bullet('Frontiers in Veterinary Science (Frontiers Media)'),
      bullet('Canadian Journal of Animal Science (NRC Research Press)'),

      h1('References'),
      numberedRef('Avian Digestive System. Small and Backyard Poultry [Internet]. Poultry Extension; [cited 2026 May]. Available from: poultry.extension.org/articles/poultry-anatomy/avian-digestive-system/'),
      numberedRef('Bell DD, Weaver WD Jr. Commercial Chicken Meat and Egg Production. 5th ed. Norwell (MA): Springer; 2002.'),
      numberedRef('Zheng Q, Zhang Y, Chen Y, Yang N, Wang XJ, Zhu D. Systematic identification of genes involved in divergent skeletal muscle growth rates of broiler and layer chickens. BMC Genomics. 2009;10:87. Available from: pmc.ncbi.nlm.nih.gov/articles/PMC2656524/'),
      numberedRef('Zuidhof MJ, Schneider BL, Carney VL, Korver DR, Robinson FE. Growth, efficiency, and yield of commercial broilers from 1957, 1978, and 2005. Poult Sci. 2014;93(12):2970-2982. doi:10.3382/ps.2014-04291. PMID: 25260522.'),
      numberedRef('Sinclair-Black M, Garcia RA, Ellestad LE. Physiological regulation of calcium and phosphorus utilization in laying hens. Front Physiol. 2023;14:1112499. doi:10.3389/fphys.2023.1112499. Available from: pmc.ncbi.nlm.nih.gov/articles/PMC9942826/'),
      numberedRef('Whitehead CC. Overview of bone biology in the egg-laying hen. Poult Sci. 2004;83(2):193-199. Available from: pubmed.ncbi.nlm.nih.gov/14979569/'),
      numberedRef('Aviagen. Ross Parent Stock Management Handbook 2023. Newbridge (UK): Aviagen Ltd; 2023. Available from: aviagen.com/assets/Tech_Center/Ross_PS/Aviagen_Ross_PS_Handbook_2023_Interactive_EN.pdf'),
      numberedRef('Sato Y. Physical Examination of Backyard Poultry. In: Merck Veterinary Manual [Internet]. Merck Sharp & Dohme LLC; [cited 2026 May]. Available from: merckvetmanual.com/exotic-and-laboratory-animals/backyard-poultry/physical-examination-of-backyard-poultry'),
      numberedRef('Ohio State University Extension. Poultry Husbandry [Ohioline factsheet VME-20]. Columbus (OH): The Ohio State University; [cited 2026 May]. Available from: ohioline.osu.edu/factsheet/vme-20'),
      numberedRef('Spotting Disease Early [Flock Management Guide]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca'),
      numberedRef('Huang Q, Wen C, Yan W, Sun C, Gu S, Zheng J, Yang N. Comparative analysis of the characteristics of digestive organs in broiler chickens with different feed efficiencies. Poult Sci. 2022;101(12):102184. doi:10.1016/j.psj.2022.102184. Available from: pmc.ncbi.nlm.nih.gov/articles/PMC9579418/'),
      numberedRef('Aviagen. Gut Health in Poultry: The World Within, Gut Health Update [Technical Article]. Aviagen; 2019. Available from: aviagen.com'),
      numberedRef('Ravindran V, Abdollahi MR. Nutrition and Digestive Physiology of the Broiler Chick: State of the Art and Outlook. Animals (Basel). 2021;11(10):2795. Available from: pmc.ncbi.nlm.nih.gov/articles/PMC8532940/'),
      numberedRef('Avian Respiratory System. Small and Backyard Poultry [Internet]. Poultry Extension; [cited 2026 May]. Available from: poultry.extension.org/articles/poultry-anatomy/avian-respiratory-system/'),
      numberedRef('Avian Skeletal System. Small and Backyard Poultry [Internet]. Poultry Extension; [cited 2026 May]. Available from: poultry.extension.org/articles/poultry-anatomy/avian-skeletal-system/'),
      numberedRef('Resting Heart Rates. MSD Veterinary Manual [Internet]. Merck Sharp and Dohme LLC; [cited 2026 May]. Available from: msdvetmanual.com/multimedia/table/resting-heart-rates'),
      numberedRef('Tickle PG, Paxton H, Rankin JW, Hutchinson JR, Codd JR. Anatomical and biomechanical traits of broiler chickens across ontogeny. Part I. Anatomy of the musculoskeletal respiratory apparatus and changes in organ size. PeerJ. 2014;2:e432. doi:10.7717/peerj.432. Available from: pmc.ncbi.nlm.nih.gov/articles/PMC4103091/'),
      numberedRef('Sudden Death Syndrome of Broiler Chickens. In: Merck Veterinary Manual [Internet]. Merck Sharp & Dohme LLC; [cited 2026 May]. Available from: merckvetmanual.com/poultry/sudden-death-syndrome-of-broiler-chickens'),
      numberedRef('Ascites Syndrome in Poultry. In: Merck Veterinary Manual [Internet]. Merck Sharp & Dohme LLC; [cited 2026 May]. Available from: merckvetmanual.com/poultry/miscellaneous-conditions-of-poultry/ascites-syndrome-in-poultry'),
      numberedRef('Avian Reproductive System (Female). Small and Backyard Poultry [Internet]. Poultry Extension; [cited 2026 May]. Available from: poultry.extension.org/articles/poultry-anatomy/avian-reproductive-female/'),
      numberedRef('McIlwee M. CPC Lighting Program Guidelines for Broilers 2026 [Technical Bulletin]. CPC Learning Centre; 2026. Available from: cpclearningcentre.ca'),
      numberedRef('Poultry Hub Australia. Excretory System [Internet]. Armidale (NSW): Poultry Hub Australia; [cited 2026 Jun]. Available from: poultryhub.org/anatomy-and-physiology/body-systems/excretory-system'),
      numberedRef('Urate Deposition (Gout) in Poultry. In: Merck Veterinary Manual [Internet]. Merck Sharp & Dohme LLC; [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/miscellaneous-conditions-of-poultry/urate-deposition-gout-in-poultry'),
      numberedRef('Butcher GD, Miles RD. The Avian Immune System [Internet]. Document VM74/VM016. Gainesville (FL): University of Florida IFAS Extension; [cited 2026 Jun]. Available from: edis.ifas.ufl.edu/publication/VM016'),
      numberedRef('Aviagen. Ross Broiler Management Handbook 2025. Newbridge (UK): Aviagen Ltd; 2025. Available from: aviagen.com'),
      numberedRef('Swayne DE, editor. Diseases of Poultry. 14th ed. Hoboken (NJ): Wiley-Blackwell; 2020.'),
      numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys. Lacombe (AB): NFACC; 2016. Available from: nfacc.ca'),
      numberedRef('BC SPCA. Egg-Laying Hens [Internet]. Vancouver (BC): BC SPCA; [cited 2026 May]. Available from: spca.bc.ca/programs-services/farm-animal-programs/farm-animal-production/egg-laying-hens/'),
      numberedRef('Hy-Line International. Hy-Line Brown Variety [Internet]. West Des Moines (IA): Hy-Line International; [cited 2026 May]. Available from: hyline.com/varieties/brown'),
      numberedRef('Lohmann Breeders. Lohmann Brown-Classic Cage Housing Management Guide [Internet]. Cuxhaven (Germany): Lohmann Breeders GmbH; [cited 2026 May]. Available from: lohmann-breeders.com/strains/lohmann-brown-classic-cage-housing/'),
      numberedRef('Arulnathan V, Turner I, Bamber N, Ferdous J, Grassauer F, Doyon M, Pelletier N. A systematic review of potential productivity, egg quality, and animal welfare implications of extended lay cycles in commercial laying hens in Canada. Poult Sci. 2024;103(4):103475. doi:10.1016/j.psj.2024.103475. PMID: 38364604; PMCID: PMC10877952.'),
      numberedRef('Canadian Veterinary Medical Association. Induced Moulting of Poultry [Position Statement]. Ottawa (ON): CVMA; [cited 2026 May]. Available from: canadianveterinarians.net/policy-and-outreach/position-statements/statements/induced-moulting-of-poultry/'),
      numberedRef('Warren MF, Pitman PM, Hodgson DD, Thompson NC, Livingston KA. Dietary super-doses of cholecalciferol fed to aged laying hens illustrates limitation of 24,25-dihydroxycholecalciferol conversion. Curr Dev Nutr. 2024;8(5):102156. doi:10.1016/j.cdnut.2024.102156.'),
      numberedRef('DSM Nutritional Products. Vitamin Supplementation Guidelines. Basel (Switzerland): DSM; 2006.'),
      numberedRef('DSM Nutritional Products. Optima: Nutricion Vitaminica de los animales para la produccion de alimentos de calidad. Basel (Switzerland): DSM; 2002.'),
      numberedRef('Vitamin Deficiencies in Poultry. In: Merck Veterinary Manual [Internet]. Merck Sharp & Dohme LLC; [cited 2026 May]. Available from: merckvetmanual.com/poultry/nutrition-and-management-poultry/vitamin-deficiencies-in-poultry'),
    ],
  };
}

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================
async function main() {
  const numbering = {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.8), hanging: convertInchesToTwip(0.2) } } } },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
      {
        reference: 'references-list',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
    ],
  };

  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       'Poultry Anatomy and Physiology',
    description: 'Course 6 — CPC Short Courses',
    numbering,
    styles: {
      default: {
        document:  { run: { font: 'Calibri', size: 24, color: BODY_GRAY }, paragraph: { spacing: { after: 160 } } },
        heading1:  { run: { bold: true, color: DARK_BLUE, size: 32, font: 'Calibri' }, paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } } } },
        heading2:  { run: { bold: true, color: MED_BLUE, size: 28, font: 'Calibri' }, paragraph: { spacing: { before: 280, after: 120 } } },
      },
    },
    sections: [
      buildCoverSection(),
      buildIntroSection(),
      buildSection1(),
      buildSection2(),
      buildSection3(),
      buildSection4(),
      buildSection5(),
      buildSection6(),
      buildSection7(),
      buildSection8(),
      buildReferencesSection(),
    ],
  });

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_FILE, buffer);

  // ---- POST-BUILD PATCH ----
  const zip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

  // 1. Strip w:dirty flags
  let docXml = await zip.file('word/document.xml').async('string');
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  // 2. TOC entries with anchors
  const entriesWithAnchor = [
    { lvl: 1, text: 'Introduction',                                                           page: 3  },
    { lvl: 2, text: 'Learning Objectives',                                                     page: 3  },
    { lvl: 1, text: 'Section 1: Introduction to Poultry Anatomy and Physiology',               page: 5  },
    { lvl: 2, text: '1.1  Why the Bird\'s Body Matters to You',                                page: 5  },
    { lvl: 2, text: '1.2  Meat Birds, Layers, and Breeders: Built for Different Jobs',         page: 5  },
    { lvl: 1, text: 'Section 2: External Anatomy',                                             page: 7  },
    { lvl: 2, text: '2.1  Key External Structures and Their Functions',                        page: 7  },
    { lvl: 2, text: '2.2  Reading the Bird: Signs of Health from the Outside',                 page: 9  },
    { lvl: 1, text: 'Section 3: Internal Body Systems Overview',                               page: 10 },
    { lvl: 2, text: '3.1  The Digestive System',                                               page: 10 },
    { lvl: 2, text: '3.2  The Respiratory System',                                             page: 12 },
    { lvl: 2, text: '3.3  The Circulatory System',                                             page: 13 },
    { lvl: 2, text: '3.4  The Skeletal and Muscular Systems',                                  page: 14 },
    { lvl: 2, text: '3.5  The Reproductive System',                                            page: 16 },
    { lvl: 2, text: '3.6  The Urinary System',                                                 page: 17 },
    { lvl: 2, text: '3.7  The Immune System',                                                  page: 18 },
    { lvl: 1, text: 'Section 4: Meat Birds (Broilers)',                                        page: 21 },
    { lvl: 2, text: '4.1  Built for Rapid Muscle Growth',                                      page: 21 },
    { lvl: 2, text: '4.2  Feed Conversion and Metabolism',                                     page: 22 },
    { lvl: 2, text: '4.3  Common Health Challenges in Broilers',                               page: 22 },
    { lvl: 2, text: '4.4  Key Management Considerations',                                      page: 23 },
    { lvl: 1, text: 'Section 5: Layers and Breeders',                                          page: 24 },
    { lvl: 2, text: '5.1  Built for Egg Production and Reproduction',                          page: 24 },
    { lvl: 2, text: '5.2  The Reproductive Tract and Egg Formation',                           page: 25 },
    { lvl: 2, text: '5.3  Nutritional Needs for Laying and Fertility',                         page: 26 },
    { lvl: 2, text: '5.4  Health Issues Specific to Layers and Breeders',                      page: 26 },
    { lvl: 1, text: 'Section 6: Comparing the Physiology of Meat Birds, Layers, and Breeders',  page: 28 },
    { lvl: 2, text: '6.1  Growth Patterns',                                                    page: 28 },
    { lvl: 2, text: '6.2  Body Structure',                                                     page: 28 },
    { lvl: 2, text: '6.3  Metabolic Differences',                                              page: 29 },
    { lvl: 2, text: '6.4  Housing and Management Implications',                                page: 29 },
    { lvl: 1, text: 'Section 7: Practical Application for Farmers',                            page: 30 },
    { lvl: 2, text: '7.1  Feeding Strategies',                                                 page: 30 },
    { lvl: 2, text: '7.2  Housing Adjustments',                                                page: 31 },
    { lvl: 2, text: '7.3  Health Monitoring',                                                  page: 31 },
    { lvl: 2, text: '7.4  Handling and Welfare Considerations',                                page: 32 },
    { lvl: 1, text: 'Summary and Key Takeaways',                                               page: 33 },
    { lvl: 2, text: 'The Bird\'s Design Purpose',                                              page: 33 },
    { lvl: 2, text: 'External Anatomy as a Health Tool',                                       page: 33 },
    { lvl: 2, text: 'The Digestive System',                                                    page: 33 },
    { lvl: 2, text: 'The Respiratory System',                                                  page: 33 },
    { lvl: 2, text: 'The Circulatory System',                                                  page: 33 },
    { lvl: 2, text: 'The Skeletal and Muscular Systems',                                       page: 34 },
    { lvl: 2, text: 'The Reproductive System',                                                 page: 34 },
    { lvl: 2, text: 'The Urinary System',                                                      page: 34 },
    { lvl: 2, text: 'The Immune System',                                                       page: 34 },
    { lvl: 2, text: 'Management Takeaways',                                                    page: 34 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals',                                      page: 36 },
    { lvl: 1, text: 'References',                                                              page: 36 },
  ].map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function tocRow(e) {
    const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
    const indent    = e.lvl === 1 ? '' : '<w:ind w:left="440"/>';
    const text      = escapeXml(e.text);
    return (
      '<w:p><w:pPr>' +
        `<w:pStyle w:val="${styleName}"/>` +
        '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs>' +
        indent +
      '</w:pPr>' +
      `<w:hyperlink w:anchor="${e.anchor}" w:history="1">` +
        `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>` +
        '<w:r><w:tab/></w:r>' +
        `<w:r><w:t>${e.page}</w:t></w:r>` +
      '</w:hyperlink></w:p>'
    );
  }

  const tocEntries = entriesWithAnchor.map(tocRow).join('');
  const sepTag     = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag     = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx     = docXml.indexOf(sepTag);
  if (sepIdx !== -1) {
    const endIdx = docXml.indexOf(endTag, sepIdx);
    if (endIdx !== -1) {
      docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
    }
  }

  // 3. Inject bookmarks around heading paragraphs
  {
    let entryIdx   = 0;
    let bookmarkId = 1000;
    const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    docXml = docXml.replace(headingRegex, (match, lvlStr) => {
      if (entryIdx >= entriesWithAnchor.length) return match;
      const lvl      = Number(lvlStr);
      const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
      const heading  = textRuns.trim();
      const entry    = entriesWithAnchor[entryIdx];
      const decodeXml = (s) => s.replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      const norm     = (s) => decodeXml(s).replace(/\s+/g, ' ').trim();
      if (lvl !== entry.lvl) return match;
      if (norm(heading) !== norm(entry.text)) return match;
      entryIdx++;
      const id = bookmarkId++;
      return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
    });
    if (entryIdx !== entriesWithAnchor.length) {
      console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
    }
  }

  // 4. Add TOC1/TOC2 styles if missing
  let stylesXml = await zip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    const tocStyles =
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="440"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
    stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
    zip.file('word/styles.xml', stylesXml);
  }

  // 5. updateFields = false
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (settings.includes('<w:displayBackgroundShape/>')) {
    settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  } else {
    settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
  }
  zip.file('word/settings.xml', settings);

  // 6. Sanity checks
  const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
  if (dirtyLeft > 0) throw new Error(`Still ${dirtyLeft} w:dirty flags — dialog will appear`);

  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found), Word will reject the file`);

  // 7. Em dash check
  const emDashCount = (docXml.match(/—/g) || []).length;
  if (emDashCount > 0) console.warn(`WARNING: ${emDashCount} em dash(es) found in document.xml — review before publishing`);

  // 8. British English sweep
  const britishChecks = [/\b\w+isation\b/gi, /\b\w+ised\b/gi, /\bbehaviour\b/gi, /\bcolour\b/gi, /\bcentre\b/gi, /\bgrey\b/gi, /\bmould\b/gi, /\bsulph/gi, /\bfaec/gi, /\bhaemo/gi, /\bdiarrhoea\b/gi];
  britishChecks.forEach(re => {
    const matches = docXml.match(re);
    if (matches) console.warn(`British English detected: ${re} matches: ${matches.join(', ')}`);
  });

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, buffer);

  console.log('Done:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
  console.log('');
  console.log('Verification:');
  console.log('  w:dirty count (must be 0):', (docXml.match(/w:dirty=/g) || []).length);
  console.log('  Em dashes:', emDashCount);
  console.log('  TOC entries:', entriesWithAnchor.length);
  console.log('');
  console.log('TOC note: First open in Word, click Yes on the fields dialog, then Ctrl+S.');
  console.log('Subsequent opens will not show the dialog.');
}

main().catch(err => { console.error(err); process.exit(1); });
