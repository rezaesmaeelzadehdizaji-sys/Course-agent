// ============================================================
// generate-course14.mjs — Course 14: Intro to Field Service
// CPC Short Courses — Canadian Poultry Training Series
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course14.mjs
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
  ImageRun,
  LevelFormat,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 14');
const OUT_FILE  = path.join(OUT_DIR, 'Intro_to_Field_Service.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

function productBuf(name) {
  const p = path.join(OUT_DIR, `product_${name}.jpg`);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

// JPEG dimensions reader for natural aspect ratio
function jpegDims(buf) {
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
    bold:      opts.bold      || false,
    italics:   opts.italics   || false,
    color:     opts.color     || BODY_GRAY,
    size:      opts.size      || 24,
    font:      'Calibri',
    subScript: opts.subScript || false,
    superScript: opts.superScript || false,
  });
}

function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({
        text:    seg.text,
        bold:    seg.bold    || false,
        italics: seg.italics || false,
        color:   seg.color   || BODY_GRAY,
        size:    seg.size    || 24,
        font:    'Calibri',
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

// Embedded PNG figure + caption
function image(buf, caption, widthIn = 5.8, type = 'png') {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.6);
  if (type === 'png') {
    try {
      const view = new DataView(buf.buffer, buf.byteOffset);
      const pw   = view.getUint32(16, false);
      const ph   = view.getUint32(20, false);
      if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
    } catch (_) {}
  } else {
    try {
      const d = jpegDims(buf);
      if (d) hpx = Math.round(wpx * d.h / d.w);
    } catch (_) {}
  }
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type })],
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

// Product photo (JPEG) + caption
function productImage(buf, caption, widthIn = 2.3) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 1.33);
  try {
    const d = jpegDims(buf);
    if (d) hpx = Math.round(wpx * d.h / d.w);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'jpg' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
    }),
  ];
}

// Callout box (blue-tinted, used for key facts or tips)
function callout(title, lines) {
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: MED_BLUE };
  const rows = [
    new TableRow({
      children: [new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
            spacing: { before: 60, after: 80 },
          }),
          ...lines.map(l => new Paragraph({
            children: [new TextRun({ text: l, color: BODY_GRAY, size: 22, font: 'Calibri' })],
            spacing: { before: 0, after: 60 },
            indent: { left: convertInchesToTwip(0.15) },
          })),
        ],
        shading: { type: ShadingType.SOLID, color: 'EAF1FB' },
        borders: { top: bdr, bottom: bdr, left: bdr, right: bdr },
        margins: { top: convertInchesToTwip(0.12), bottom: convertInchesToTwip(0.12), left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
      })],
    }),
  ];
  return [
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
    new Paragraph({ spacing: { before: 0, after: 160 } }),
  ];
}

// Callout box with two-column layout for Before/During/After style tables
function twoColTable(headers, rows) {
  const colW = [2160, 6480]; // 2" + 6" = 8640 twips
  const hdrBg = '2E74B5';
  const altBg = 'EBF2FA';
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hCell = (text, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
    })],
  });

  const dCell = (text, i, shade) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({
      alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18 })],
    })],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    rows: [
      new TableRow({ children: headers.map((h, i) => hCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => dCell(cell, ci, ri % 2 === 1)),
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
          new TextRun({ text: 'Intro to Field Service', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 14  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
      children: [new TextRun({ text: 'COURSE 14: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),

    ...(logoBuffer ? [
      new Paragraph({
        children: [new ImageRun({ data: logoBuffer, transformation: { width: 150, height: 150 }, type: 'png' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360 },
      }),
    ] : [
      new Paragraph({ children: [new TextRun({ text: '[CPC Logo]', color: '888888', size: 22, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 } }),
    ]),

    new Paragraph({
      children: [new TextRun({ text: 'Intro to Field Service', bold: true, color: MED_BLUE, size: 52, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'Practical Skills for Barn Visits, Flock Assessment, and Working with Farmers', italics: true, color: MED_BLUE, size: 26, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
    }),

    new Paragraph({
      children: [new TextRun({ text: '___________________________________', color: GOLD, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'Duration: 45-Minute Lecture + 2-Hour Workshop', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'June 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
    }),

    new Paragraph({
      children: [new TextRun({
        text: 'This course is produced by the CPC Learning Centre for educational purposes. Content is intended for trained poultry industry professionals. It does not replace the advice of a licensed veterinarian, integrator management manuals, or regulatory requirements. Always follow current CFIA, NFACC, and integrator-specific protocols.',
        color: '888888', size: 18, font: 'Calibri', italics: true,
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      indent: { left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
    }),
  ];

  return {
    properties: { page: { margin: pageMargin }, titlePage: true },
    headers:  { default: buildHeader() },
    footers:  { default: buildFooter() },
    children,
  };
}

// ============================================================
// TOC SECTION
// ============================================================
function buildTOCSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:  { default: buildHeader() },
    footers:  { default: buildFooter() },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'Table of Contents', bold: true, color: MED_BLUE, size: 32, font: 'Calibri' })],
        spacing: { before: 0, after: 240 },
      }),
      new TableOfContents('Table of Contents', {
        hyperlink: true,
        headingStyleRange: '1-2',
        stylesWithLevels: [{ styleName: 'Heading 1', level: 1 }, { styleName: 'Heading 2', level: 2 }],
      }),
      pageBreak(),
    ],
  };
}

// ============================================================
// BODY SECTIONS
// ============================================================
function buildBodySection() {
  const photo1_1 = figBuf('photo1_1_commercial_broiler_flock.jpg');
  const photo2_1 = figBuf('photo2_1_biosecurity_entry.png');
  const photo3_1 = figBuf('photo3_1_barn_observation.png');
  const bootsImg = productBuf('elastic_top_boots');
  const evoWashImg = productBuf('chlorinated_evo_wash');

  const children = [

    // ── INTRODUCTION ─────────────────────────────────────────
    h1('Introduction'),

    para('Field service is what connects the farm to the rest of the production system. A field service technician or representative visits contract growers on a regular schedule, checks how the flock is progressing, catches problems before they become expensive, and keeps the farmer connected to veterinary, nutritional, and management support. In commercial Canadian poultry production, the service technician is typically the first person a grower calls when something looks wrong [1].'),

    para('This course covers the practical core of field service: how to prepare for a farm visit, how to walk a barn systematically, how to read a production record, how to communicate what you find to the farmer, and when to escalate. The two-hour workshop that follows this lecture gives you the chance to practice these skills in a barn setting.'),

    para('By the end of this course, you should be able to:'),

    numbered('Explain what field service really involves and where you fit between the integrator, the veterinarian, and the grower.'),
    numbered('Get ready for a farm visit and follow Canadian biosecurity standards so you never carry disease from one barn to the next.'),
    numbered('Walk a barn the same way every time, reading the flock and the environment so nothing slips past you.'),
    numbered('Read the daily records for mortality, water, feed, and body weight, and catch a bad trend before it turns into a real problem.'),
    numbered('Tell the farmer what you found so it leads to action, and know when it is time to call the veterinarian.'),
    numbered('Leave behind a visit record clear enough that the next person can pick up right where you left off.'),

    new Paragraph({ spacing: { before: 0, after: 160 } }),

    // ── SECTION 1 ─────────────────────────────────────────────
    h1('Section 1: The Role of Field Service'),

    h2('1.1  What Field Service Means in Commercial Poultry'),

    para('In a contract production system, the integrator supplies chicks, feed, medication, and technical service. The grower supplies labor, housing, and utilities. The service technician is the integrator\'s representative on farm, the person who turns company protocols into what actually happens in the barn [1].'),

    para('A typical service technician visits each contract farm once a week and provides management advice specific to the flock age and strain [1]. Visits become more frequent during health challenges or critical growth phases: the first week of placement, late-stage grow-out before market, or whenever disease is suspected. Between visits, the technician stays reachable for the grower\'s questions.'),

    para('Service technicians assist with scheduling chick arrivals, confirming feed delivery timing, and calling market load-out when the flock is ready to ship [1]. They carry company policy changes to the grower and report flock progress back to management. Think of the role as two-directional: information flows both ways through you.'),

    ...image(photo1_1, 'Photo 1.1: A commercial broiler flock at mid-grow-out. Field service visits typically begin with a visual assessment of how birds distribute across the barn floor. Source: CPC Short Courses.', 5.5, 'jpg'),

    h2('1.2  Where You Fit in the Production Chain'),

    para('The chain runs from the integrator\'s management and veterinary team, through you, to the grower and their birds. Your job is to be the most reliable, most consistent link in that chain.'),

    para('The company veterinarian is your resource for disease diagnosis and treatment decisions. You are not the veterinarian, but you are the veterinarian\'s eyes and ears on farm. When you describe what you\'re seeing clearly and accurately, the veterinarian can give you better guidance without having to drive to every farm.'),

    para('Integrators track production closely: feed conversion, daily gain, mortality rate, and condemnations at the plant [1]. Margins in this business are tight enough that small shifts in any of these numbers matter. Your job is to turn those numbers into action on the farm. A flock with a slowly climbing mortality rate may look stable to management until someone on the ground identifies the feeding line that\'s running half-speed.'),

    h2('1.3  Three Outcomes of Every Visit'),

    para('A farm visit is only useful if it produces three things:'),

    ...callout('The three outcomes of every farm visit', [
      '1. You know how the flock is doing (assessment)',
      '2. The farmer knows what to adjust (recommendation)',
      '3. You have a record of what you found (documentation)',
    ]),

    para('If you leave a farm without all three, the visit did not accomplish its purpose. An assessment without a recommendation leaves the farmer without direction. A recommendation without a record means the next person who visits has no context. Keep that in mind through everything that follows.'),

    // ── SECTION 2 ─────────────────────────────────────────────
    pageBreak(),
    h1('Section 2: Before the Visit'),

    h2('2.1  Pre-Visit Preparation'),

    para('Show up prepared. Pull the farm\'s production records before you leave the office. Review the previous mortality trend, the last body weight check, the water and feed consumption figures from the past week, and any concerns noted in the last visit report. Know the flock\'s age, breed, and vaccination status before you walk in the door.'),

    para('Check for any active disease alerts from CFIA or the provincial authority for your region. If a notifiable disease is circulating nearby, your visit protocol changes. Enhanced cleaning and disinfection apply, and in some cases only essential visits are allowed [2].'),

    para('The CFIA Poultry Service Industry Biosecurity Guide is explicit on this point. Call the producer before you arrive. Ask about the flock\'s current health status, any vaccination or treatment given since your last visit, and any concerns they have about the birds [2]. A phone call before you get there saves surprises at the barn door.'),

    h2('2.2  Canadian Biosecurity Requirements for Service Personnel'),

    para('The CFIA Poultry Service Industry Biosecurity Guide establishes a risk-based zone system for all poultry premises [2]. Understanding it is not optional. It is the minimum standard for any service personnel entering a commercial poultry operation in Canada.'),

    new Paragraph({ spacing: { before: 80, after: 80 } }),

    twoColTable(
      ['Zone', 'Description and Your Responsibilities'],
      [
        ['Controlled Access Zone (CAZ)', 'Outer farm area. Sign the visitor log. Park at least 15 meters from barn air inlets and exhaust fans. Do not bring vehicles with poultry contact history closer than required.'],
        ['Service Area', 'Transitional space: egg rooms, feed access points, utility entries. Change into clean coveralls and footwear before entering. Disinfect hands.'],
        ['Restricted Access Zone (RAZ)', 'Live bird housing. Highest biosecurity demands. Wear fresh or disinfected coveralls and boots. Use hairnet or hooded coveralls. This is where you spend most of your visit.'],
      ]
    ),

    new Paragraph({ spacing: { before: 80, after: 80 } }),

    para('Sign the visitor logbook at the farm entrance for every visit. The CFIA guide requires that service providers always leave documentation on the premises about their service activity. A signed visitor log satisfies this requirement [2].'),

    para('Vehicle positioning matters: park so that your vehicle does not cross in front of barn air inlets or exhaust fans. Disease can travel through the air and straight into the barn through these openings [2].'),

    h2('2.3  PPE and the Biosecurity Entry'),

    para('Before entering the Restricted Access Zone, put on clean premises-designated or disposable coveralls and boots [2]. Change footwear between zones. Disinfect your boot soles at the foot bath, or swap boot covers, whenever you move from a lower-risk area to a higher-risk one.'),

    para('At the end of the visit, bag any contaminated items, wipe down equipment surfaces, and disinfect before leaving. If you are visiting multiple farms in a day, change coveralls and boots between premises. On high-risk days, such as a regional disease alert or a farm with confirmed illness, consider showering out before you move to your next stop.'),

    para('The CPC Learning Centre and CPC Shop provide the Elastic Top Boots for dedicated barn footwear and the Chlorinated EVO Wash for boot dip and footwear sanitation. Dedicated, farm-specific footwear is one of the simplest and most effective things you can do to stop disease from moving between farms on your boots.'),

    ...(bootsImg ? productImage(bootsImg, 'Elastic Top Boots. Dedicated barn footwear prevents cross-contamination between farms. Source: canadianpoultry.ca/shop.') : []),
    ...(evoWashImg ? productImage(evoWashImg, 'Chlorinated EVO Wash. Foaming chlorine wash for footwear and boot dips at farm entry. Source: canadianpoultry.ca/shop.') : []),

    ...image(photo2_1, 'Photo 2.1: Biosecurity entry at a commercial poultry barn. Clean coveralls and boot dip are the minimum entry standard for service personnel under CFIA guidelines [2]. Source: CPC Short Courses.', 5.5, 'png'),

    // ── SECTION 3 ─────────────────────────────────────────────
    pageBreak(),
    h1('Section 3: The Barn Walk'),

    h2('3.1  What to Notice Before You Go Inside'),

    para('The barn walk starts before you touch the door handle. Stop outside for a moment and use your senses. Healthy birds in a well-managed barn produce a low, even, contented murmur. If what you hear is silence, alarm calls, or labored breathing, write it down before you open the door.'),

    para('Look through the observation window before entering. Healthy broilers at mid-grow-out distribute fairly evenly across the floor when active and cluster loosely near feeders and drinkers during eating and drinking times. Tight piling in corners suggests chilling or poor ventilation. Birds crowding one end of the barn may be chasing a warm zone or avoiding a draft. A barn where all the birds are sitting flat and quiet during what should be an active period is worth investigating further [3,4].'),

    para('Smell tells you things immediately. If you can smell ammonia at the barn door, the air inside is already carrying more than the birds should be living in. A sweet-rotten smell means there is carcass decomposing in the litter. A sour, acidic smell suggests wet litter and potential yeast or bacterial overgrowth [3]. Note what you smell before you step inside, because once you are in for a few minutes your nose adjusts.'),

    para('Poultry Signals: A Practical Guide for Bird-Focused Poultry Farming by Bestman, Ruis, Heijmans, and van Middelkoop describes the approach this way: always use all your senses, and before you enter the poultry house, stop and listen without disturbing the flock [4]. That is the foundation of every good barn walk.'),

    para('For a full systematic barn assessment framework covering Temperature, Feed, Light, Air, Water, and Sanitation and Space, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),

    h2('3.2  The Systematic Walk: What to Look For'),

    para('Enter calmly. A door slamming creates a brief flush response that masks normal distribution and makes it harder to spot birds that were already quiet and sluggish before you arrived.'),

    para('Walk the full perimeter of the barn first, then cross diagonal paths. This ensures you cover the edges, the center, and every section of feeder and drinker line. Note bird distribution: are there gaps where birds have moved away from a section? Are there piles at specific spots?'),

    para('Check feeders and drinkers at multiple points, not just the first few near the entry door. A failed auger, a blocked joint, or a drinker line out of adjustment can leave a whole section without access while the controller still reads normal.'),

    para('Pick up a handful of litter. Squeeze it. Good litter forms a loose ball but does not ooze moisture and does not smell of ammonia when you hold it close. Dry, dusty litter with visible feather packs is also wrong. Good litter is friable, slightly moist, and crumbles when you drop it [3].'),

    para('Measure ammonia at bird level, not at your head height, which is well above the zone where chicks and growing birds breathe. Use an ammonia detection meter or chemical indicator tube held at or below knee height. Record the reading in your visit notes.'),

    ...image(photo3_1, 'Photo 3.1: Barn observation is the foundation of field service. Walking the full barn systematically gives you a picture of bird distribution, behavior, and environmental conditions before you examine any individual bird. Source: CPC Short Courses.', 5.5, 'png'),

    h2('3.3  Bird Conformation Assessment'),

    para('Once you have a picture of the flock as a whole, catch a sample of birds for individual assessment. The CPC Learning Centre Spotting Disease Early guide recommends randomly selecting birds from different areas of the barn and examining them from head to toes [3]. Do not just catch the birds closest to you at the door.'),

    para('The guide walks through what to check on each bird [3]:'),

    bullet('Color: pale suggests anemia or chilling; dark or dusky suggests dehydration or fever'),
    bullet('Size: swollen infraorbital sinus or swollen joints indicate inflammation; underweight or depleted muscle mass indicates a performance problem'),
    bullet('Position: drooping wings, twisted neck (torticollis), or a crouched hunched stance all indicate something is wrong internally'),
    bullet('Heat: joints that feel warm to the touch indicate active inflammation at that site'),
    bullet('Soiling: vent soiling, caked toes, or stained feathers point to enteric problems and abnormal droppings'),
    bullet('Discharges: healthy eyes, nostrils, and the vent do not discharge; any discharge means investigate the color, consistency, and smell'),
    bullet('Alertness: a healthy bird is quick to react to your presence; a sick bird is slow, droopy-eyed, and does not respond normally when you approach'),
    bullet('Vocalization: snicking, sneezing, or rattling respiration are audible signs; note which birds are making the sound and how many [3]'),

    new Paragraph({ spacing: { before: 0, after: 160 } }),

    para('If you are keeping a daily list and comparing bird-by-bird across visits, you will find abnormalities that a single snapshot misses. The guide makes the point clearly: if you keep a list from day to day and evaluate the abnormal alongside the normal, you will be surprised by how much you actually see [3].'),

    // ── SECTION 4 ─────────────────────────────────────────────
    pageBreak(),
    h1('Section 4: Reading Performance Data'),

    h2('4.1  Daily Records: What They Tell You'),

    para('Pull the record book before your barn walk, not after. Knowing the trend going into the walk tells you what to look for. A mortality spike that started three days ago is more alarming than a spike that started yesterday.'),

    para('The NFACC Code of Practice requires that mortalities and culls be recorded daily and that dead birds be removed and disposed of daily [5]. A farm without current mortality records is a compliance issue and a management issue at the same time. If a grower is not keeping records, that is a conversation to have.'),

    para('Under the NFACC Code, cases involving unexpected illness, death, or increases in mortality rates must be investigated. Consult a veterinarian and submit samples to a lab if the cause is not clear [5]. That language defines your responsibility: unexpected increases require action, not just observation.'),

    h2('4.2  Mortality Patterns: Normal vs. Concerning'),

    para('In a well-managed commercial broiler flock, cumulative mortality typically runs between 3 and 5% over the full grow-out cycle, with the highest daily rates in the first week of life [1]. Know the normal pattern so you recognize when something is off.'),

    para('Here is what the pattern usually looks like across a standard grow-out:'),

    new Paragraph({ spacing: { before: 80, after: 80 } }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 2160, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, bottom: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, left: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, right: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' } },
              shading: { type: ShadingType.SOLID, color: MED_BLUE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [run('Flock Age', { bold: true, size: 18, color: 'FFFFFF' })] })],
            }),
            new TableCell({
              width: { size: 3240, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, bottom: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, left: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, right: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' } },
              shading: { type: ShadingType.SOLID, color: MED_BLUE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [run('Typical Daily Mortality', { bold: true, size: 18, color: 'FFFFFF' })] })],
            }),
            new TableCell({
              width: { size: 3240, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, bottom: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, left: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, right: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' } },
              shading: { type: ShadingType.SOLID, color: MED_BLUE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [run('What Raises Concern', { bold: true, size: 18, color: 'FFFFFF' })] })],
            }),
          ],
        }),
        ...([
          ['Days 1–3', 'Up to 0.2% per day', 'High early mortality: chick quality, brooding failure, yolk sac infection'],
          ['Days 4–14', 'Declining, <0.1% per day', 'Flat or rising daily rate: management error, early disease challenge'],
          ['Days 15–28', '<0.1% per day', 'Sudden spike: respiratory or enteric disease outbreak'],
          ['Days 29–42', 'Low, may slowly rise with weight', 'Rapidly climbing rate in final 2 weeks: heat stress, ascites, systemic disease'],
        ]).map(([age, typical, concern], ri) => new TableRow({
          children: [age, typical, concern].map((text, ci) => new TableCell({
            width: { size: [2160, 3240, 3240][ci], type: WidthType.DXA },
            borders: { top: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, bottom: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, left: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }, right: { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' } },
            shading: { type: ShadingType.SOLID, color: ri % 2 === 1 ? 'EBF2FA' : 'FFFFFF' },
            children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: 50, after: 50 }, children: [run(text, { size: 18 })] })],
          })),
        })),
      ],
    }),

    new Paragraph({ spacing: { before: 80, after: 160 } }),

    para('A mortality rate that doubles over 2 to 3 days without an obvious management cause (feeder failure, temperature crash, ventilation shutdown) is a red flag. Investigate the same day.'),

    h2('4.3  Water and Feed as Early Warning Signals'),

    para('The CPC Learning Centre Spotting Disease Early guide explains it plainly: when a disease or stress occurs, a decrease in water consumption is usually noticed a day or two before the decrease in feed consumption [3]. Water meters that record daily consumption are your earliest warning system.'),

    para('Record water and feed consumption at the same time every day. The guide recommends this specifically so that comparisons are valid across days [3]. A reading taken at 6 a.m. one day and 2 p.m. the next gives you a misleading comparison.'),

    para('The water-to-feed ratio at thermoneutral temperatures runs approximately 1.6 to 1.8 parts water per part feed for growing broilers [6]. A ratio that drops below 1.5 suggests water access is restricted. Check pressure, drinker height, and any blocked lines. A ratio climbing above 2.0 to 2.5 during cool weather suggests the birds are sick (increased water consumption with reduced feed intake is a classic early disease response) or there is a drinker leak inflating the meter reading.'),

    h2('4.4  Spot Weighing and Weight Uniformity'),

    para('As the flock approaches market weight, spot-weigh by randomly catching birds from several different areas of the barn. Thirty to 50 birds spread across the house is a reasonable sample [1,6]. Avoid catching only near the door; birds there tend to be more active and often represent a different weight distribution than birds deeper in the barn.'),

    para('Calculate average daily gain: divide the current average weight by the flock\'s age in days, or use the difference from the last weigh-in divided by the days between. Compare to the breed target [6].'),

    para('The coefficient of variation (CV) tells you how uniform the flock is. A CV above 10 to 12% at weeks 3 to 4 means the flock has a significant spread in body size. That gap almost always traces back to the first week: poor water or feed access during brooding, an early disease challenge, or an uneven temperature distribution that pushed some chicks off feed [6]. By week 4 you can see it in the weight data even when the cause is long gone.'),

    // ── SECTION 5 ─────────────────────────────────────────────
    pageBreak(),
    h1('Section 5: Working with the Farmer'),

    h2('5.1  Building the Relationship'),

    para('The farmer runs the farm. Your job is to support them, not supervise them. That distinction matters. Contract growers often deal with equipment issues, tight margins, labor challenges, and environmental problems that are outside their control but still affect flock performance [1]. A service technician who shows up understanding those pressures and comes prepared with useful information is welcome. One who shows up unprepared and lectures gets avoided.'),

    para('Come prepared every visit: know their flock history, remember what you discussed last time, and follow up on whatever you recommended. If you told them to check the drinker pressure on line 3, ask what they found. Consistency and follow-through build the trust that makes a grower call you when something first looks wrong, not three days later when it is already a bigger problem.'),

    h2('5.2  Communicating Findings'),

    para('Start with what you observed, not your conclusion. "I noticed the birds in the far house are quieter than usual and water consumption dropped about 15% yesterday" is more actionable than "I think they\'re getting sick." Observations invite the farmer into the conversation. Conclusions shut it down.'),

    para('Be specific about what you want changed and why. If you are asking them to raise the drinker height in house 2, explain what you saw that led to that recommendation. If you are asking them to cull more aggressively, explain what the grade-out data shows about small birds at market and what it costs per bird.'),

    para('Avoid jargon and condescension. Experienced commercial growers have seen more flocks than most textbooks describe. Many of them know their birds better than a newly graduated technician. Listen as much as you talk, especially when you are new to a farm.'),

    h2('5.3  The Visit Record'),

    para('Write the visit record the same day. Details blur fast, and the record is only useful if it is accurate.'),

    para('A complete visit record covers the basics: date, time, farm and barn ID, flock age, and placement date. Add the numbers: mortality for the day and the cumulative total, water and feed consumption, and any body weight data you collected. Then round it out with what you saw (temperature, ammonia level, litter condition), what you told the farmer to do, and what you committed to follow up on before your next visit.'),

    para('Leave a copy with the farmer; keep one in your records. The CFIA Poultry Service Industry Biosecurity Guide requires that service providers leave documentation of their service activity on the premises [2]. The visit record satisfies this requirement and builds the farm health history at the same time.'),

    para('The NFACC Code of Practice recommends that producers establish and document a working relationship with a veterinarian, and that they keep written emergency response protocols [5]. Your visit records are part of that documentation chain.'),

    h2('5.4  When to Call the Veterinarian'),

    para('You are not the veterinarian. Knowing when to escalate is as important as knowing how to assess.'),

    ...callout('Escalate to the veterinarian when you see:', [
      'Unexplained mortality increase: daily rate doubling over 2-3 days with no obvious management cause',
      'Systemic signs in a significant portion of the flock: swollen heads, green or watery diarrhea, neurological signs, widespread respiratory distress',
      'Signs that point to a notifiable disease: sudden high mortality with multiple systems affected (call CFIA as well)',
      'No response to treatment within 48-72 hours of a protocol starting',
      'Multiple barns on the same farm showing similar signs simultaneously',
      'Unusual lesions found during an on-farm necropsy that do not match common management-related findings',
    ]),

    para('When you call the veterinarian, have your records ready. The veterinarian needs: the flock age, mortality trend over the past 5 to 7 days, vaccination and treatment history, water and feed consumption trend, what you saw during the barn walk, and what the birds look like on individual examination. A clear, organized briefing gets you a faster and more accurate response.'),

    para('For a full profile of common poultry diseases and the clinical signs that distinguish one from another, see Course 7 (Common Poultry Diseases) in this series.'),

    // ── SECTION 6 ─────────────────────────────────────────────
    pageBreak(),
    h1('Section 6: Practical Field Skills'),

    h2('6.1  On-Farm Necropsy Basics'),

    para('Service technicians are often asked to perform a basic on-farm post-mortem on fresh mortality to help the veterinarian understand what is happening before birds are submitted to the diagnostic lab. A structured approach gives the most information from the least time.'),

    para('Work from the outside in. First look at the feathers, skin, and muscle condition before you open the bird. Then examine the body cavity systematically. Note what is present and what is absent. A pale liver is just as significant as a swollen one. Empty intestines tell you something different than hemorrhagic intestines.'),

    para('At the farm, you are sorting findings into two buckets. The first is management or trauma-related: skin scratches, bruising, ascites fluid with no other lesions, or pasting from wet litter. The second is systemic disease: generalized organ changes, abnormal content in the respiratory tract, petechial hemorrhages, or unusual odors from specific organs.'),

    para('Never substitute an on-farm post-mortem for lab submission when the cause of mortality is unclear [3]. When mortality is present, the CPC Learning Centre Spotting Disease Early guide is clear that you should send live moribund birds representing the current clinical picture, not birds that died hours ago [3]. Section 6.2 covers how many birds to send and how to package them. Your job at the farm is to give the pathologist enough information to get started, not to make the final diagnosis.'),

    para('For a complete guide to post-mortem examination technique and what normal organs look like, see Course 10 (Necropsy, Normal Birds) in this series.'),

    h2('6.2  Sample Collection'),

    para('When the veterinarian asks you to collect and submit samples, how you handle them determines whether the lab gets usable results. Poorly collected or improperly stored samples waste everyone\'s time and delay the diagnosis.'),

    para('The best submission is 10 to 12 live moribund birds showing the current clinical signs, packaged to arrive alive at the lab [3]. Second best is fresh mortality: birds that have died within the past 2 to 4 hours, chilled but not frozen. Frozen birds lose tissue architecture and many diagnostic tests cannot be run on them.'),

    para('Label every sample bag clearly: farm ID, flock age, placement date, clinical signs you observed, vaccines given and dates, any treatments given and when. A completed submission form reduces the number of phone calls the lab has to make to you and gets your results back faster [3].'),

    para('During transport, keep samples chilled at about 4 degrees Celsius (refrigerator temperature), never frozen. Avoid extended exposure to ambient temperatures, especially in summer.'),

    h2('6.3  The Farm Health Record Over Time'),

    para('A single visit record is a snapshot. A series of visit records is a health history. Over multiple flocks and multiple years, your visit records build a timeline, and patterns show up in that timeline that you would never spot from a single visit.'),

    para('Flag concerning trends early. A mortality curve that is creeping up day after day is much easier to address at week 2 than at week 4. A farm that consistently has high early mortality across three successive flocks is telling you something about the brooding setup or chick quality that one visit report will not reveal.'),

    para('Write records with continuity in mind. If someone else needs to cover your farms, because you are away, because of staff changes, or because of an emergency, they must be able to read your records and understand what was happening without calling you. Cover the mortality trend, bird behavior notes, and environmental readings such as temperature, ammonia level, and carbon dioxide. Add weight data, the water and feed trend, any treatments given and the authorization you acted under, and the specific follow-up actions you committed to.'),

    ...callout('A useful visit record captures:', [
      'Date, farm ID, barn IDs visited, flock age',
      'Mortality: today\'s count, cumulative total, and whether the trend is stable, rising, or falling',
      'Water consumption: today\'s reading and comparison to the 3-day average',
      'Feed consumption: today\'s reading and comparison to the 3-day average',
      'Environmental: temperature range recorded, ammonia level at bird height, litter condition description',
      'Body weights: date weighed, average weight, CV if calculated, breed target for comparison',
      'Bird behavior: distribution, activity level, any abnormal sounds or signs',
      'Recommendations given to the farmer: specific and actionable',
      'Follow-up committed: what you will do before your next visit and when',
    ]),

    // ── WORKSHOP NOTE ─────────────────────────────────────────
    pageBreak(),
    h1('Workshop: Practical Field Visit Exercise'),

    para('The two-hour workshop that follows this lecture covers the hands-on skills that cannot be taught from a slide deck. You will:'),

    numbered('Walk a working commercial barn using the systematic protocol described in Section 3. Your task is to produce a complete barn walk assessment: distribution pattern, environmental readings, and individual bird examination of at least 5 birds.'),
    numbered('Read a set of real production records (mortality trend, water consumption, feed consumption, and weight data) and identify which flocks require follow-up action and what that action should be.'),
    numbered('Practice the visit record. Complete a standardized visit form based on what you found in the barn walk exercise. Debrief with the group on what you each recorded and what you might have missed.'),
    numbered('Communication role-play. In pairs, practice delivering a difficult finding to a "farmer" (played by a classmate). The scenario: you found elevated early mortality and the farmer\'s records are behind. Your job is to communicate the finding, get the records up to date, and agree on a plan without damaging the relationship.'),

    new Paragraph({ spacing: { before: 0, after: 160 } }),

    para('We run the workshop on a real farm with a real flock. Biosecurity protocols apply from the moment you arrive in the parking lot. CPC provides PPE for every participant.'),

    // ── RECOMMENDED JOURNALS ─────────────────────────────────
    pageBreak(),
    h1('Recommended Journals and Resources'),

    para('The following journals and publications are useful for staying current on poultry health, production management, and field service practices:'),

    bullet('Poultry Science: peer-reviewed journal covering broiler and layer management, nutrition, health, and welfare (poultryscience.org)'),
    bullet('Avian Diseases: peer-reviewed journal of the American Association of Avian Pathologists, covering poultry pathology, diagnostics, and disease management'),
    bullet('Canadian Poultry Magazine: industry publication covering Canadian commercial poultry news, management practices, and policy (canadianpoultrymag.com)'),
    bullet('The Poultry Site: international industry news and technical articles (thepoultrysite.com)'),
    bullet('CFIA Animal Health Notices: subscribe for alerts on reportable diseases and national biosecurity updates (inspection.canada.ca)'),
    bullet('NFACC Code of Practice updates: check nfacc.ca for the most current version of the poultry Code and any associated guidance documents'),

    new Paragraph({ spacing: { before: 0, after: 240 } }),

    // ── REFERENCES ─────────────────────────────────────────────
    pageBreak(),
    h1('References'),

    numberedRef('United States Department of Agriculture, Animal and Plant Health Inspection Service. Poultry Industry Manual. Washington, DC: National Animal Health Emergency Management System. Available from: aphis.usda.gov/sites/default/files/poultry_ind_manual.pdf'),
    numberedRef('Canadian Food Inspection Agency. Poultry Service Industry Biosecurity Guide [Internet]. Ottawa: Canadian Food Inspection Agency. Available from: inspection.canada.ca/en/animal-health/terrestrial-animals/biosecurity/standards-and-principles/poultry-service-industry [cited 2026 Jun]'),
    numberedRef('CPC Learning Centre. Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
    numberedRef('Bestman M, Ruis M, Heijmans J, van Middelkoop K. Poultry Signals: A Practical Guide for Bird-Focused Poultry Farming. Zutphen: Roodbont Publishers; 2012.'),
    numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys. Lacombe: National Farm Animal Care Council; 2016. Available from: nfacc.ca/poultry-code-of-practice'),
    numberedRef('Aviagen. Ross 308 Broiler Management Handbook. Huntsville, AL: Aviagen; 2025. Available from: aviagen.com/assets/Tech_Center/Ross_Broiler/Aviagen-ROSS-Broiler-Handbook-EN.pdf'),

  ]; // end children

  return {
    properties: { page: { margin: pageMargin } },
    headers:  { default: buildHeader() },
    footers:  { default: buildFooter() },
    children,
  };
}

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.7), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.3) } } } }],
      },
      {
        reference: 'references-list',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) } } } }],
      },
    ],
  },
  styles: {
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { bold: true, color: MED_BLUE, size: 28, font: 'Calibri' },
        paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } } },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { bold: true, color: DARK_BLUE, size: 24, font: 'Calibri' },
        paragraph: { spacing: { before: 280, after: 120 } },
      },
    ],
  },
  sections: [
    buildCoverSection(),
    buildTOCSection(),
    buildBodySection(),
  ],
});

// Write initial file
fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));
console.log('Initial docx written to', OUT_FILE);

// ============================================================
// POST-BUILD PATCH: kill the "fields may refer to other files" dialog
// ============================================================
const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

// TOC entries (text must match heading text exactly, including section numbers and spacing)
const tocEntries = [
  { lvl: 1, text: 'Introduction', page: 2 },
  { lvl: 1, text: 'Section 1: The Role of Field Service', page: 3 },
  { lvl: 2, text: '1.1  What Field Service Means in Commercial Poultry', page: 3 },
  { lvl: 2, text: '1.2  Where You Fit in the Production Chain', page: 3 },
  { lvl: 2, text: '1.3  Three Outcomes of Every Visit', page: 4 },
  { lvl: 1, text: 'Section 2: Before the Visit', page: 5 },
  { lvl: 2, text: '2.1  Pre-Visit Preparation', page: 5 },
  { lvl: 2, text: '2.2  Canadian Biosecurity Requirements for Service Personnel', page: 5 },
  { lvl: 2, text: '2.3  PPE and the Biosecurity Entry', page: 6 },
  { lvl: 1, text: 'Section 3: The Barn Walk', page: 7 },
  { lvl: 2, text: '3.1  What to Notice Before You Go Inside', page: 7 },
  { lvl: 2, text: '3.2  The Systematic Walk: What to Look For', page: 8 },
  { lvl: 2, text: '3.3  Bird Conformation Assessment', page: 8 },
  { lvl: 1, text: 'Section 4: Reading Performance Data', page: 10 },
  { lvl: 2, text: '4.1  Daily Records: What They Tell You', page: 10 },
  { lvl: 2, text: '4.2  Mortality Patterns: Normal vs. Concerning', page: 10 },
  { lvl: 2, text: '4.3  Water and Feed as Early Warning Signals', page: 11 },
  { lvl: 2, text: '4.4  Spot Weighing and Weight Uniformity', page: 11 },
  { lvl: 1, text: 'Section 5: Working with the Farmer', page: 13 },
  { lvl: 2, text: '5.1  Building the Relationship', page: 13 },
  { lvl: 2, text: '5.2  Communicating Findings', page: 13 },
  { lvl: 2, text: '5.3  The Visit Record', page: 13 },
  { lvl: 2, text: '5.4  When to Call the Veterinarian', page: 14 },
  { lvl: 1, text: 'Section 6: Practical Field Skills', page: 15 },
  { lvl: 2, text: '6.1  On-Farm Necropsy Basics', page: 15 },
  { lvl: 2, text: '6.2  Sample Collection', page: 15 },
  { lvl: 2, text: '6.3  The Farm Health Record Over Time', page: 16 },
  { lvl: 1, text: 'Workshop: Practical Field Visit Exercise', page: 17 },
  { lvl: 1, text: 'Recommended Journals and Resources', page: 18 },
  { lvl: 1, text: 'References', page: 19 },
];

// Assign anchor IDs
const entriesWithAnchor = tocEntries.map((e, i) => ({
  ...e,
  anchor: `_Toc${String(100000 + i).padStart(8, '0')}`,
}));

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tocRow(e) {
  const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
  const indent    = e.lvl === 1 ? 0 : 220;
  const text      = escapeXml(e.text);
  return (
    '<w:p><w:pPr>' +
      `<w:pStyle w:val="${styleName}"/>` +
      '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>' +
      '<w:spacing w:after="60"/>' +
      (indent ? `<w:ind w:left="${indent}"/>` : '') +
    '</w:pPr>' +
    `<w:hyperlink w:anchor="${e.anchor}" w:history="1">` +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>` +
      '<w:r><w:tab/></w:r>' +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="22"/></w:rPr><w:t>${e.page}</w:t></w:r>` +
    '</w:hyperlink></w:p>'
  );
}

const cachedRows = entriesWithAnchor.map(tocRow).join('');

// Patch document.xml
let docXml = await outZip.file('word/document.xml').async('string');

// Strip all w:dirty flags
docXml = docXml.replace(/\sw:dirty="true"/g, '');

// Inject cached TOC rows
const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  sdt = sdt.replace(
    /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
    `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`
  );
  docXml = docXml.replace(sdtMatch[0], sdt);
}
docXml = docXml.replace(/\sw:dirty="true"/g, ''); // belt-and-braces

// Inject bookmarks around heading paragraphs
let entryIdx = 0;
let bookmarkId = 1000;
const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
docXml = docXml.replace(headingRegex, (match, lvlStr) => {
  if (entryIdx >= entriesWithAnchor.length) return match;
  const lvl = Number(lvlStr);
  const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
  const heading = textRuns.trim();
  const entry = entriesWithAnchor[entryIdx];
  const norm = s => s.replace(/\s+/g, ' ').trim();
  if (lvl !== entry.lvl) return match;
  if (norm(heading) !== norm(entry.text)) return match;
  entryIdx++;
  const id = bookmarkId++;
  return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
});
if (entryIdx !== entriesWithAnchor.length) {
  console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries`);
}

outZip.file('word/document.xml', docXml);

// Patch settings.xml: updateFields=false
let settings = await outZip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
settings = settings.replace(
  '<w:displayBackgroundShape/>',
  '<w:displayBackgroundShape/><w:updateFields w:val="false"/>'
);
outZip.file('word/settings.xml', settings);

// Add TOC1/TOC2 styles
let stylesXml = await outZip.file('word/styles.xml').async('string');
if (!/w:styleId="TOC1"/.test(stylesXml)) {
  const tocStyles =
    '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
  stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
  outZip.file('word/styles.xml', stylesXml);
}

// Sanity check: must be 0 dirty flags remaining
const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
if (dirtyLeft > 0) {
  console.error(`ERROR: Still ${dirtyLeft} w:dirty flags — dialog will appear`);
} else {
  console.log('Dirty flag check: PASSED (0 dirty flags)');
}

// Check for em dashes in body prose
const emDashCount = (docXml.match(/—/g) || []).length;
if (emDashCount > 0) {
  console.warn(`EM DASH WARNING: ${emDashCount} em dash(es) found in document — review before publishing`);
} else {
  console.log('Em dash check: PASSED (0 em dashes)');
}

// Write final patched docx
const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log('Patched docx written to', OUT_FILE);
console.log('File size:', fs.statSync(OUT_FILE).size, 'bytes');
