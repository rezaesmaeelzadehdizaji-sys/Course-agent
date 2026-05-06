// ============================================================
// generate-course3-tflaws.mjs  -  Course 3: T-FLAWS Assessment Management Tool
// CPC Short Courses — May 2026 rebuild (v2 — comprehensive revision)
// T-FLAWS: Temperature, Feed, Light, Air, Water, Sanitation & Space
// Run: node generate-course3-tflaws.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
  Header, Footer, HeadingLevel, TableOfContents, BorderStyle,
  convertInchesToTwip, ImageRun, PageNumber, Table, TableRow,
  TableCell, WidthType, ShadingType,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const C3       = path.join(__dirname, 'Course 3');
const C4       = path.join(__dirname, 'Course 4');
const C7       = path.join(__dirname, 'Course 7');
const OUT_FILE = path.join(C3, 'T-FLAWS_Assessment_Management_Tool_draft.docx');

// ── Logo ─────────────────────────────────────────────────────
const LOGO_PATH = path.join(__dirname, 'logo.png');
const logoBuf   = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

// ── Load images ───────────────────────────────────────────────
function loadImg(p) { return fs.existsSync(p) ? fs.readFileSync(p) : null; }

const IMG = {
  farm:        loadImg(path.join(C3, 'Broiler farm.png')),
  fig11:       loadImg(path.join(C3, 'Fig 1.1_Chicken distribution absed on temperature.png')),
  flock4:      loadImg(path.join(C4, 'early_disease_detection_flock.png')),
  cropfill:    loadImg(path.join(C3, 'photo2.2.png')),
  cpcled:      loadImg(path.join(C3, 'CPC_Lighting_method_in first dayold_chicks.jpg')),
  lux:         loadImg(path.join(C3, '5_lux_vs_20_lux_broiler_barn.png')),
  airflow:     loadImg(path.join(C3, 'Correct air flow through the barn.png')),
  ventilation: loadImg(path.join(C3, 'Broiler_farm_ventilation.png')),
  nippleHeight:loadImg(path.join(C3, 'Figure 5.1, nipple height.png')),
  wetlitter:   loadImg(path.join(C3, 'nipple-leaking-wet-litter.png')),
  biosec:      loadImg(path.join(C4, 'biosecurity_door_closed_chicks.png')),
  digital:     loadImg(path.join(C3, 'Digital farm management.png')),
};

// Log which images loaded
Object.entries(IMG).forEach(([k, v]) => {
  if (!v) console.warn(`WARNING: image not found — ${k}`);
});

// helper: read PNG dimensions
function pngDim(buf) {
  try {
    const v = new DataView(buf.buffer, buf.byteOffset);
    return { w: v.getUint32(16, false), h: v.getUint32(20, false) };
  } catch (_) { return { w: 1, h: 1 }; }
}

// ── Colours ───────────────────────────────────────────────────
const DKBLUE = '1F3864';
const BLUE   = '2E74B5';
const GOLD   = 'C9A84C';
const GRAY   = '595959';
const LGRAY  = '888888';
const BODY   = '3C3C3C';

// ── Page margins ──────────────────────────────────────────────
const margin = {
  top:    convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left:   convertInchesToTwip(1.25),
  right:  convertInchesToTwip(1.25),
};

// ── Typography helpers ────────────────────────────────────────
const run = (text, opts = {}) => new TextRun({
  text,
  font:    opts.font    ?? 'Calibri',
  size:    opts.size    ?? 24,
  bold:    opts.bold    ?? false,
  italics: opts.italics ?? false,
  color:   opts.color   ?? BODY,
  ...opts,
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 160 },
  children: [run(text, { size: 28, bold: true, color: BLUE })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 120 },
  children: [run(text, { size: 24, bold: true, color: BLUE })],
});

const p = (children, opts = {}) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing:   { before: 100, after: 140, line: 280 },
  children:  Array.isArray(children) ? children : [run(children, opts)],
});

const b = (text, lvl = 0) => new Paragraph({
  bullet:    { level: lvl },
  spacing:   { before: 60, after: 60, line: 276 },
  children:  Array.isArray(text) ? text : [run(text)],
});

// Side-bar callout with gold left border
const callout = (text) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing:   { before: 180, after: 180, line: 280 },
  indent:    { left: convertInchesToTwip(0.25), right: convertInchesToTwip(0.25) },
  border:    { left: { style: BorderStyle.THICK, size: 12, color: GOLD, space: 8 } },
  children:  Array.isArray(text) ? text : [run(text, { italics: true, color: GRAY })],
});

// Inline bold label followed by body text (body may be a string or array of TextRuns)
const labeled = (label, body) => p([
  run(label + ' ', { bold: true }),
  ...(Array.isArray(body) ? body : [run(body)]),
]);

// CO2 with subscripted 2 — returns array of two TextRuns
const co2r = () => [run('CO'), run('2', { subScript: true })];

// CPC temperature target table (Source: CPC Learning Centre)
function tempTable() {
  const colW = [800, 1100, 1100, 1100, 1100, 1100, 2340]; // twips, total = 8640
  const hdrBg = '2E74B5';
  const altBg = 'EBF2FA';
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hdrCell = (text, colIdx) => new TableCell({
    width: { size: colW[colIdx], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
    })],
  });

  const dataCell = (text, colIdx, shade) => new TableCell({
    width: { size: colW[colIdx], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({
      alignment: colIdx === 6 ? AlignmentType.LEFT : AlignmentType.CENTER,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18, color: BODY })],
    })],
  });

  const headers = ['Age', 'House Temp (°C)', 'House Temp (°F)', 'Floor Temp (°C)', 'Floor Temp (°F)', 'Litter Temp (°C)', 'Key Notes'];
  const rows = [
    ['Day 1',    '32–34',          '89–93',          '31', '88', '27',    'Pre-warm litter before chick arrival'],
    ['Day 7',    '29',                  '85',                  '28', '83', '-',     'Reduce ~0.5°C every 2–3 days as birds feather in'],
    ['Day 14',   '27–29',          '79–84',          '26', '78', '-',     'Continue gradual weekly reduction of 2–3°C'],
    ['Day 21',   '26',                  '78',                  '24', '75', '-',     'Monitor bird distribution for comfort'],
    ['Day 28',   '24',                  '75',                  '22', '72', '-',     'Ventilation management becomes increasingly critical'],
    ['Day 35',   '21–22',          '70–72',          '20', '68', '-',     'Maintain RH 50–70%'],
    ['Day 42+',  '20–21 (min. 18)','68–70 (min. 65)','19', '66', '-',     'NFACC acceptable range: 18–24°C; adjust for season'],
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

// CPC lighting schedule table (Source: CPC Learning Centre)
function lightingTable() {
  const colW = [1400, 1200, 1200, 1400, 3440]; // twips, total = 8640
  const hdrBg = '2E74B5';
  const altBg = 'EBF2FA';
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hdrCell = (text, colIdx) => new TableCell({
    width: { size: colW[colIdx], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
    })],
  });

  const dataCell = (text, colIdx, shade) => new TableCell({
    width: { size: colW[colIdx], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({
      alignment: colIdx === 4 ? AlignmentType.LEFT : AlignmentType.CENTER,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18, color: BODY })],
    })],
  });

  const headers = ['Age', 'Light Hours', 'Dark Hours', 'Intensity', 'Why It Matters'];
  const rows = [
    ['Day 1–7',         '18 hrs', '6 hrs', '50–100 lux', 'Chicks find feed, water, and heat source easily'],
    ['Day 7–13',        '18 hrs', '6 hrs', '30–50 lux',  'Eyes adjust; reduce stress gradually'],
    ['Day 14–21',       '18 hrs', '6 hrs', '20–30 lux',  'Supports rest behavior and bone development'],
    ['Day 22–27',       '18 hrs', '6 hrs', '10–15 lux',  'Steady reduction continues'],
    ['Day 28–31',       '22 hrs', '2 hrs', '5–10 lux',   'Extended light supports feed intake and growth'],
    ['Day 32–harvest',  '24 hrs', '-',     '3–5 lux',    'If shipping earlier than 34 days, reduce dark hours earlier'],
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

// Image + caption helper
function imgBlock(buf, type, widthIn, caption) {
  if (!buf) {
    return [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80 },
        rows: [new TableRow({ children: [new TableCell({
          borders: {
            top:    { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' },
            left:   { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' },
            right:  { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' },
          },
          shading: { type: ShadingType.SOLID, color: 'F5F5F5' },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing:   { before: 700, after: 700 },
            children:  [run('[Image placeholder — to be supplied by CPC team]', { color: '999999', italics: true })],
          })],
        })]})],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing:   { before: 60, after: 200 },
        children:  [run(caption, { italics: true, size: 20, color: LGRAY })],
      }),
    ];
  }
  const dpi    = 96;
  const wpx    = Math.round(widthIn * dpi);
  let   hpx    = Math.round(wpx * 0.6);
  if (type === 'png') {
    const dim = pngDim(buf);
    if (dim.w > 0) hpx = Math.round(wpx * dim.h / dim.w);
  } else if (type === 'jpg') {
    try {
      let i = 2;
      while (i < buf.length - 4) {
        if (buf[i] === 0xFF && buf[i+1] >= 0xC0 && buf[i+1] <= 0xC3) {
          const h = (buf[i+5] << 8) | buf[i+6];
          const w = (buf[i+7] << 8) | buf[i+8];
          if (w > 0) hpx = Math.round(wpx * h / w);
          break;
        }
        i += 2 + ((buf[i+2] << 8) | buf[i+3]);
      }
    } catch (_) {}
  }
  const irType = type === 'jpg' ? 'jpg' : 'png';
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { before: 180, after: 60 },
      children:  [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: irType })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { before: 60, after: 200 },
      children:  [run(caption, { italics: true, size: 20, color: LGRAY })],
    }),
  ];
}

const pb = () => new Paragraph({ children: [new PageBreak()] });

// ── Header / Footer ───────────────────────────────────────────
const hdr = () => new Header({ children: [new Paragraph({
  alignment: AlignmentType.RIGHT,
  border:    { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  children: [
    run('CPC Short Courses  |  ', { size: 18, color: LGRAY }),
    run('T-FLAWS Assessment Management Tool', { size: 18, bold: true, color: BLUE }),
  ],
})]});

const ftr = () => new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  border:    { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  children: [
    run('CPC Short Courses  |  Course 3  |  Page ', { size: 18, color: LGRAY }),
    new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: LGRAY }),
    run(' of ', { size: 18, color: LGRAY }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: LGRAY }),
  ],
})]});

const blankHdr = new Header({ children: [new Paragraph({ children: [] })] });
const blankFtr = new Footer({ children: [new Paragraph({ children: [] })] });

// ── TOC entries ───────────────────────────────────────────────
const tocEntries = [
  { lvl: 1, text: 'Introduction to T-FLAWS', page: 3 },
  { lvl: 2, text: 'What Is T-FLAWS?', page: 3 },
  { lvl: 2, text: 'Who Is This Course For?', page: 3 },
  { lvl: 2, text: 'How to Use This Checklist', page: 4 },
  { lvl: 1, text: 'T: Temperature', page: 5 },
  { lvl: 2, text: 'Why Temperature Matters', page: 5 },
  { lvl: 2, text: 'Target Ranges by Bird Age', page: 5 },
  { lvl: 2, text: 'What Farmers See', page: 7 },
  { lvl: 2, text: 'What to Do', page: 8 },
  { lvl: 1, text: 'F: Feed', page: 9 },
  { lvl: 2, text: 'Why Feed Management Matters', page: 9 },
  { lvl: 2, text: 'What to Check', page: 9 },
  { lvl: 2, text: 'What Farmers See', page: 11 },
  { lvl: 2, text: 'What to Do', page: 12 },
  { lvl: 1, text: 'L: Light', page: 13 },
  { lvl: 2, text: 'Why Light Programs Matter', page: 13 },
  { lvl: 2, text: 'What to Check', page: 15 },
  { lvl: 2, text: 'What Farmers See', page: 15 },
  { lvl: 2, text: 'What to Do', page: 16 },
  { lvl: 1, text: 'A: Air', page: 17 },
  { lvl: 2, text: 'Why Ventilation Matters', page: 17 },
  { lvl: 2, text: 'Key Air Quality Indicators', page: 17 },
  { lvl: 2, text: 'What Farmers See', page: 19 },
  { lvl: 2, text: 'What to Do', page: 20 },
  { lvl: 1, text: 'W: Water', page: 21 },
  { lvl: 2, text: 'Why Water Matters', page: 21 },
  { lvl: 2, text: 'What to Check', page: 22 },
  { lvl: 2, text: 'What Farmers See', page: 24 },
  { lvl: 2, text: 'What to Do', page: 24 },
  { lvl: 1, text: 'S: Sanitation & Space', page: 26 },
  { lvl: 2, text: 'Sanitation', page: 26 },
  { lvl: 2, text: 'Space:', page: 27 },
  { lvl: 2, text: 'Litter Management', page: 27 },
  { lvl: 2, text: 'Stocking Density', page: 28 },
  { lvl: 2, text: 'What Farmers See', page: 29 },
  { lvl: 2, text: 'What to Do', page: 29 },
  { lvl: 1, text: 'Using T-FLAWS as a System', page: 30 },
  { lvl: 1, text: 'Where to Keep Learning', page: 31 },
  { lvl: 2, text: 'Key Scientific Journals', page: 31 },
  { lvl: 2, text: 'Key Institutional Resources', page: 31 },
  { lvl: 1, text: 'References', page: 32 },
];

const ea = tocEntries.map((e, i) => ({
  ...e,
  anchor: `_Toc${String(100000 + i).padStart(8, '0')}`,
}));

// ============================================================
// DOCUMENT
// ============================================================
const doc = new Document({
  creator: 'CPC Learning Centre',
  title:   'T-FLAWS Assessment Management Tool',
  sections: [

    // ── COVER ────────────────────────────────────────────────
    {
      properties: { titlePage: true, page: { margin } },
      headers: { first: blankHdr },
      footers: { first: blankFtr },
      children: [
        new Paragraph({ spacing: { before: 1800, after: 0 }, children: [run('')] }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 200 },
          children:  [run('COURSE 3: CPC SHORT COURSES', { size: 22, bold: true, color: BLUE })],
        }),

        ...(logoBuf ? [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 200, after: 200 },
          children:  [new ImageRun({ data: logoBuf, transformation: { width: 144, height: 144 }, type: 'png' })],
        })] : []),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 200, after: 200 },
          children:  [run('T-FLAWS Assessment Management Tool', {
            size: 56, bold: true, color: DKBLUE, font: 'Calibri Light',
          })],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 600 },
          children:  [run('A Practical Barn Entry Checklist for Canadian Poultry Farmers', {
            size: 30, italics: true, color: BLUE,
          })],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 400 },
          children:  [run('___________________________________', { color: GOLD, size: 22 })],
        }),

        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
          children: [run('CPC Short Courses', { bold: true, color: GRAY, size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
          children: [run('Duration: 2 hours', { color: GRAY, size: 22 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 800 },
          children: [run('May 2026', { color: GRAY, size: 22 })] }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 0 },
          children:  [run(
            'This course has been developed for educational purposes for commercial poultry farmers in Canada. ' +
            'Content is drawn from the field experience of Canadian poultry consultants, peer-reviewed scientific ' +
            'literature, and industry management guides. This material does not replace the advice of a licensed ' +
            'veterinarian or regulatory authority.',
            { size: 18, italics: true, color: LGRAY },
          )],
        }),
        pb(),
      ],
    },

    // ── TOC ──────────────────────────────────────────────────
    // Note: no pb() at the end — the section break handles page flow.
    // Removing pb() here eliminates the blank page 3.
    {
      properties: { page: { margin } },
      headers: { default: hdr() },
      footers: { default: ftr() },
      children: [
        h1('Table of Contents'),
        new TableOfContents('Table of Contents', { headingStyleRange: '1-2' }),
      ],
    },

    // ── BODY ─────────────────────────────────────────────────
    {
      properties: { page: { margin } },
      headers: { default: hdr() },
      footers: { default: ftr() },
      children: [

        // ── INTRODUCTION ──────────────────────────────────
        h1('Introduction to T-FLAWS'),
        h2('What Is T-FLAWS?'),
        p('Every time you walk into a barn, you are making decisions. You can feel the air, hear the birds, and see how they are spread across the floor. T-FLAWS gives that walk a consistent structure so nothing gets missed.'),
        p([
          run('T-FLAWS stands for '),
          run('Temperature, Feed, Light, Air, Water, and Sanitation & Space', { bold: true }),
          run('. Six checkpoints. Six things that, when managed well every single day, give your birds the best possible environment to perform and stay healthy.'),
        ]),
        p('T-FLAWS is a barn-entry checklist developed by the CPC Learning Centre as a practical adaptation of the standard FLAWS management framework used across the poultry industry [9]. The addition of Temperature as a standalone first checkpoint reflects how critical thermal management is, particularly in the first week of a flock [1,12].'),
        callout('T-FLAWS is not a disease diagnostic tool. If birds are sick, call your veterinarian. T-FLAWS is what you check before that point. It is what keeps problems from developing in the first place.'),

        h2('Who Is This Course For?'),
        p('This course is for commercial poultry farmers, barn technicians, and farm staff managing broiler, layer, or breeder operations in Canada. The checklist applies across production types. Specific numbers and temperature targets cited in each section refer primarily to broiler production. If you manage layers or turkeys, use your breed management guide for species-specific targets alongside these principles.'),
        p('The six T-FLAWS checkpoints are equally valuable to:'),
        b('Farm owners and employees doing daily barn checks'),
        b('Veterinarians and service technicians visiting the farm'),
        b('New farmers building consistent observation habits from day one'),
        b('Experienced farmers standardizing their routines across multiple barns'),

        h2('How to Use This Checklist'),
        p('Work through T-FLAWS every time you walk the barn. Temperature is the first thing you assess when you come through the door. Space and Sanitation are your final scan before you leave. With experience, the routine becomes second nature, and you will know quickly when something is off.'),
        p('Use it every day, on every visit. Record anything that is off and what you did about it. A written daily log gives you patterns over time, and patterns tell you where the next problem will come from before it arrives.'),

        ...imgBlock(IMG.farm, 'png', 5.8, 'Photo 1.1: A commercial broiler barn. T-FLAWS gives every barn visit a consistent six-point structure. Source: CPC Short Courses.'),

        pb(),

        // ── T: TEMPERATURE ────────────────────────────────
        h1('T: Temperature'),
        h2('Why Temperature Matters'),
        p('Temperature is the first thing you assess when you enter the barn, and it is also the most likely factor to be wrong at placement. A day-old chick cannot regulate its own body temperature. It depends entirely on the environment you provide [1].'),
        p('The consequences of getting temperature wrong in the first week are lasting. Cold chicks do not eat or drink properly. Their gut development falls behind, their immune system is compromised, and their seven-day weight, an important early performance milestone, will reflect the failure [1]. Research shows that while seven-day weight correlates with flock direction, measurements from week three onward are the more reliable predictors of final body weight, but by then the gap from a cold start has already compounded. A cold start is one of the most expensive mistakes in broiler production, and it is entirely preventable.'),
        p('The same applies at the other end. Heat stress later in the flock suppresses feed intake, elevates mortality, and cuts your feed conversion ratio [6]. Birds cannot tell you they are too hot. They show you.'),

        h2('Target Ranges by Bird Age'),
        p('Always check temperature at chick level, not at the ceiling sensor. Your barn controller reads what the sensor sees, and on a cold night or over a cold floor, that reading can be 3 to 5 degrees higher than what the birds are actually experiencing [1]. That gap is enough to stunt a whole flock in the first week.'),
        p('Target temperatures at bird level for broilers [4,11]:'),
        tempTable(),
        new Paragraph({ spacing: { before: 80, after: 0 } }),
        p('These are targets, not fixed rules. The birds tell you more than any sensor. If they are spread evenly across the heated area, eating and drinking actively, the temperature is right. If they are piling up or pushing to the walls, something is off.'),
        p('Pre-heat the barn at least 24 to 48 hours before placement, including the floor. The litter surface at chick level needs to reach 30 degrees Celsius before the first bird arrives [1]. Warm air over a cold floor is not enough for day-olds. They lose heat through the floor just as fast as through the air.'),

        ...imgBlock(IMG.fig11, 'png', 5.8, 'Figure 1.1: Chick distribution patterns at correct temperature (even spread), too cold (huddling under heat source), and too hot (crowding to barn edges). Source: CPC Short Courses.'),

        h2('What Farmers See'),
        labeled('Cold birds:', 'Chicks huddle tightly in a dense cluster under the heat source, often chirping loudly. They are not exploring, not eating, and not using the water. Early mortality will be elevated. If you see a pile of chicks, the temperature at bird level is too low.'),
        labeled('Heat stressed birds:', 'Birds pant with beaks open and wings held away from the body. They move away from the center of the barn and crowd near the walls or water lines. Feed intake drops. In older, heavier broilers, sudden heat stress can cause cardiac deaths.'),
        labeled('Well-distributed birds:', 'Evenly spread across the heated area, active, vocalizing normally, and visiting feeders and drinkers regularly. This is the target.'),
        callout('If more than 20 percent of your birds are clustered in one part of the barn during the first week, temperature, draft, or light distribution is the cause. Find it before you leave the barn.'),

        h2('What to Do'),
        b('Place a minimum-maximum thermometer at bird level in at least two locations per barn, not on the wall or near the ceiling'),
        b('Check the temperature gradient from the inlet end to the fan end and adjust fan speed or heat distribution accordingly'),
        b('If birds are cold: check for drafts at inlets, check heater output, and verify litter temperature with a surface thermometer'),
        b('If birds are heat stressed: increase ventilation rate first, then evaluate whether setpoint adjustments are needed'),
        b('Record temperature at every barn check alongside bird distribution observations'),
        b('Pre-warm the barn and litter at least 24 to 48 hours before every placement [1]'),

        pb(),

        // ── F: FEED ───────────────────────────────────────
        h1('F: Feed'),
        h2('Why Feed Management Matters'),
        p('A bird that cannot find feed or reach it comfortably does not grow. Feed access is the engine of production, and it is also one of the most reliable early-warning signals in your barn. Birds reduce feed intake before they show any other visible sign of stress or illness [1,11].'),
        p('A drop in daily feed consumption of more than 10 percent from the previous day, without a corresponding change in diet or management, is a red flag. Before you call it a feed problem, check the other five T-FLAWS points. Hot barns, poor air quality, low water flow, and high stocking density all suppress feed intake before they show up as anything else.'),
        p('Feed management is not just about keeping the bins full. It is about making sure every bird in every corner of your barn can reach good quality feed without competition, waste, or physical barriers. Use feeder trays at 1 per 100 to 150 chicks for the first few days [11]. When you get this right, birds grow more evenly and there are fewer surprises at weigh-out.'),

        h2('What to Check'),
        p('At every walk, check these:'),
        labeled('Feeder levels:', 'Pans and troughs should have adequate feed without being overfilled. Overfilling increases waste and allows birds to sort, leaving fines at the bottom and wasting nutrient-dense particles.'),
        labeled('Feeder height:', 'The lip of the feeder should sit at back level as the bird stands. Too high and smaller birds cannot reach it. Too low and feed is wasted into the litter [11]. The CPC Broiler Management Bulletin recommends adjusting feeder height at a minimum of once per week as birds grow [11].'),
        labeled('Feed distribution:', 'Walk the full barn length and check that feed is actually moving to every station. A failed auger or blocked joint can leave an entire section empty while the bin outside reads full. If birds at one end are pecking at empty pans, trace the delivery system back from that point to find the blockage.'),
        labeled('Feed quality:', 'Look at the feed and smell it. Caked or wet feed near drinker lines means moisture is getting in, usually from a leaking nipple or condensation on the line. Mold or an off-smell is a storage problem. Wet feed is also the most common reason an auger stalls or bridges in the bin [11].'),
        labeled('Access:', 'Every bird needs a clear run at a feeder. If you see the same birds getting pushed off every time they approach, you do not have enough feeder space. Some pecking-order sorting is normal and works itself out over time, but birds being consistently kept away from feed is a management problem that needs fixing [16,17,13,14,15].'),

        ...imgBlock(IMG.flock4, 'png', 5.8, 'Photo 2.1: Early flock assessment. Even access to feeders and good bird distribution across the barn is a visible indicator of correct temperature, light, and feed management. Source: CPC Short Courses.'),

        h2('What Farmers See'),
        labeled('High weight variation (CV):', 'High CV at seven or fourteen days almost always starts in the first week. Some birds got to the feeder consistently; others got pushed out and fell behind. That gap does not close on its own. It gets wider every week through the grow-out.'),
        labeled('Birds pecking at empty pans:', 'Birds are programmed to keep seeking feed. If you see birds pecking at an empty pan or auger trough, feed is not reaching that station. Check the delivery system upstream from that point.'),
        labeled('Litter wet near feed lines:', 'Bridged or damp feed falls out of pans or auger tubes into the litter. Wet feed near feeder lines is a bridge and blockage indicator, not just a waste problem.'),
        labeled('Sorting behavior:', 'If birds are pushing feed around rather than eating steadily, the feed form or particle size may be wrong. Chicks on crumbles should not be sorting as though they are on mash.'),

        h2('What to Do'),
        b('Adjust feeder height at minimum once per week; keep a record of adjustments with date and bird age [11]'),
        b('Walk the full feeder line at every check and manually test flow at the far end of the barn'),
        b('Remove wet, molded, or visibly contaminated feed from pans immediately and identify the source of moisture'),
        b('Monitor daily feed consumption using bin meters or manual records and compare to breed target consumption curves [1]'),
        b('If a batch of feed smells abnormal or shows unusual bridging, retain a sample and notify your feed supplier before feeding the whole delivery'),
        b('In the first 48 hours, check crop fill at 2, 4, 8, 12, 24, and 48 hours post-placement: target 75% of crops full at 2 hours, 80% at 4 hours, 95% at 24 hours, and 100% by 48 hours. A bird with an empty crop at 24 hours is already behind [1]'),

        ...imgBlock(IMG.cropfill, 'png', 5.8, 'Photo 2.2: Crop fill at 24 hours. The chick on the left has a full, rounded crop, while the chick on the right has an empty crop. Source: CPC Short Courses.'),

        pb(),

        // ── L: LIGHT ──────────────────────────────────────
        h1('L: Light'),
        h2('Why Light Programs Matter'),
        p('Light is a powerful management tool that is easy to forget about because it is always on. Birds live by light cycles. Light duration and intensity control when they eat, when they rest, and how their metabolism runs. A poorly managed light program is a source of chronic, invisible stress that shows up in your performance data without an obvious cause.'),

        p('Good lighting in the first week is not about brightness for its own sake. It is about making sure every chick finds feed and water within the first few hours. That single factor shapes the entire flock\'s performance. Below are the CPC broiler lighting guidelines [12].'),
        lightingTable(),
        new Paragraph({ spacing: { before: 80, after: 0 } }),
        p('Key practical notes:', { bold: true }),
        b('The 6-hour dark period from Day 1 supports circadian rhythm, welfare, and bone mineralization; do not skip it.'),
        b('If using LED fixtures, check for flickering at lower lux settings. A steady 15 lux is better than a flickering 10 lux.'),
        b('Use a light meter; estimating lux by eye is unreliable.'),

        callout('In the first few days after your chicks arrive, they need to find feed fast. The CPC team recommends a simple and effective approach: direct your LEDs over the feed trays rather than lighting the whole barn evenly [12]. The bright spot acts like a signal, pulling chicks straight toward the feed. It is a small adjustment that can make a real difference in how quickly a new flock gets off to a strong start [12].'),

        ...imgBlock(IMG.cpcled, 'jpg', 5.8, 'Photo 3.1: In the first few days after placement, directing LEDs over the feed trays draws chicks straight to feed. The bright spot gives newly placed birds a clear cue to start eating right away. Source: CPC Short Courses [12].'),

        h2('What to Check'),
        b('Walk every section of the barn and visually confirm all bulbs and fixtures are functioning'),
        b('Identify any dark zones (bulb failures, fixture faults) and any unusually bright areas'),
        b('Check your controller or timer program against the target hours of light for the current day of age'),
        b('Measure lux intensity with an LED-compatible light meter if available, particularly after replacing bulbs or retrofitting LED fixtures; use an LED-specific meter for accuracy [12]'),
        b('For layers: confirm that the photoperiod schedule is tracking correctly for age of lay and production targets'),

        callout('One burned-out section in a dark barn is enough to push birds away from feeders and waterers in that area. If you see birds piling in a lit section while an adjacent section is empty, look up. A bulb or circuit has failed.'),

        h2('What Farmers See'),
        labeled('Crowding in lit zones:', 'Birds naturally move toward light. When one section is darker than the rest, birds leave it and crowd the brighter areas. Feed and water access in the dark zone falls immediately. Weight variation in the flock increases.'),
        labeled('Restless birds at night:', 'Birds should go quiet quickly once the lights drop. If they are still moving around after lights out, something is letting light in. Check fixtures, door seals, and any gaps in the curtains or sidewalls. True darkness is what they need. Find the leak and close it.'),
        labeled('Layer production deviations:', 'If your hens fall below production targets or go off lay unexpectedly, verify the light schedule before looking at nutrition or disease. An incorrectly programmed timer is one of the first things to check.'),
        labeled('Poor uniformity in growers:', 'Uneven lux across the barn during the first week is a contributor to uneven feed and water access in that critical window, which translates directly to weight variation at seven days.'),

        ...imgBlock(IMG.lux, 'png', 5.8, 'Photo 3.2: The same barn at 5 lux (top) and 20 lux (bottom). Research shows that birds kept at 5 lux display reduced exploratory behavior; less walking, foraging, and preening, compared to birds at 20 lux. This is why lighting intensity matters at the right time and for the right reason. Source: CPC Short Courses.'),

        h2('What to Do'),
        b('Replace failed bulbs the same day you find them, not at the next maintenance cycle'),
        b('Verify timer accuracy at each weekly check; timers drift and controllers can fail silently'),
        b('Consult CPC Lighting Program Guidelines for Broilers, the breed management handbook (Ross or Cobb) and the National Farm Animal Care Council (NFACC) for your light schedule; your integrator may have additional requirements specific to your contract [1,4,12]'),
        b('After installing LED fixtures, verify lux levels with an LED-specific light meter and compare to your target intensity, not just a visual assessment [12]'),
        b('Keep a light program log with every change noted, so production deviations can be correlated with management events'),
        b('In growing barns, check that dark periods are genuinely dark; even small light leaks from curtains or door gaps disrupt the rest cycle'),

        pb(),

        // ── A: AIR ────────────────────────────────────────
        h1('A: Air'),
        h2('Why Ventilation Matters'),
        p('Ventilation is the most underestimated management factor in commercial poultry. It is invisible, it requires constant adjustment, and when it fails, birds absorb the consequences before most farmers notice anything wrong.'),
        p('The job of ventilation is to pull out heat, moisture, ammonia, carbon dioxide, and dust, and bring in fresh air at the right temperature and speed for the birds in front of you [1,5]. Minimum ventilation has to run every hour of every day, including cold Canadian winters. Turning down fans to cut heating costs in January is one of the most common management mistakes in this business. You pay for it weeks later in respiratory disease, bad litter, and feed conversion that does not add up [5].'),
        p('Air quality is not a comfort issue. It is a health, welfare, and money issue. Getting it right matters as much as any vaccine or feed additive on your farm [5].'),

        h2('Key Air Quality Indicators'),
        labeled('Ammonia:', 'This is one of the most practical things you can track during your daily barn walk. Above 10 ppm at bird level, ammonia starts quietly weakening your birds\' immune defense [5]. By 15 to 20 ppm, that stress is real, even if you cannot see it yet in performance [5]. Push past 25 ppm and you will start seeing visible eye damage: irritation, swelling, and birds that are far more vulnerable to any respiratory bug that comes through the barn [5]. At 50 ppm and above, the airways themselves take a hit. The rule is simple: do not wait for a meter reading. If you can smell it when you walk in, it is already too high.'),
        p('The most important thing to know about ammonia is that you can smell it before your birds are in serious danger. If you walk into the barn and can smell ammonia at your standing height, concentrations at bird level are higher than they are at your nose. Fix it now, not at the end of the day.'),
        callout('The ammonia rule: if you can smell it when you walk in, your birds have been breathing unsafe concentrations since before your last visit. Ventilation rate needs to increase and litter moisture needs to be assessed immediately.'),
        labeled('Carbon dioxide:', [
          ...co2r(), run(' above 3,000 ppm indicates the minimum ventilation rate is insufficient for the current stocking density and bird size [1]. '),
          ...co2r(), run(' itself is not as immediately damaging as ammonia at these concentrations, but it is a reliable indicator of overall air quality. If '),
          ...co2r(), run(' is high, minimum ventilation is too low.'),
        ]),
        labeled('Relative humidity:', 'During brooding (the first two weeks), target relative humidity is 60 to 70 percent to protect day-old respiratory surfaces. From two weeks onward, 50 to 60 percent is the appropriate target [5]. Below 50 percent, dust levels rise and respiratory irritation increases. Above 70 percent at any age, litter moisture builds rapidly, ammonia production accelerates, and footpad dermatitis rates climb. Humidity is a direct reflection of ventilation rate; if humidity is high, your minimum ventilation is too low.'),
        labeled('Air temperature and speed:', 'The temperature and speed of incoming air at bird level matters. In cold weather, cold air entering too fast and landing on birds causes drafts, which chills young birds and causes them to huddle even when your barn thermostat shows an adequate temperature. Adjust inlet openings to direct air up and across the roof before it falls to bird level [1].'),

        ...imgBlock(IMG.airflow, 'png', 5.8, 'Figure 4.1: Minimum ventilation airflow in a broiler barn. Cold air enters through the sidewall inlets, is directed up toward the roof peak where it mixes with warm air, and falls back down to bird level as tempered, draft-free air. Source: CPC Short Courses.'),

        ...imgBlock(IMG.ventilation, 'png', 5.8, 'Photo 4.1: Commercial broiler barn interior. Proper ventilation keeps air fresh at bird level without drafts. Litter condition and bird distribution are visible indicators of air quality management. Source: CPC Short Courses.'),

        h2('What Farmers See'),
        b('Persistent wet eyes or foam eyes on multiple birds: early sign of ammonia exposure above safe levels'),
        b('Sneezing, head shaking, or rattling sounds: dust and ammonia irritating the upper airway'),
        b([run('Open-mouth breathing in cool conditions: indicates high '), ...co2r(), run(', not heat')]),
        b('Condensation running down walls and pooling at the base: humidity too high, ventilation rate too low'),
        b('Rapid litter deterioration not explained by drinker leaks: insufficient air exchange is allowing moisture to build in the litter'),
        b('Birds avoiding certain barn sections: check for cold drafts from inlets at those locations'),

        h2('What to Do'),
        b('Check all fans for correct function and airflow direction at every visit; note any that are slow or reversed'),
        b('Check inlet opening positions and adjust for outside temperature and wind conditions according to your barn management system [1]'),
        b('Walk the full barn length at bird level and feel for drafts, check for stagnant zones, and smell for ammonia in every section'),
        b('If you detect ammonia: increase ventilation rate and immediately check litter moisture in the affected area'),
        b('Use an ammonia meter or test strips at bird level, not at standing height, for accurate readings'),
        b('Do not shut down minimum ventilation in cold weather; adjust heater output to compensate for increased fresh air, not fan speed [1]'),
        b('Maintain a scheduled ventilation equipment maintenance log; fans, controllers, and inlets fail gradually and silently'),

        pb(),

        // ── W: WATER ──────────────────────────────────────
        h1('W: Water'),
        h2('Why Water Matters'),
        p('Water is the most critical nutrient in your barn. Broilers typically consume about twice as much water as feed by volume under comfortable temperatures, and this ratio rises sharply during heat stress [18,19]. Water and feed intake track each other so closely that a drop in one almost always signals a drop in the other. If water is restricted for any reason, feed intake falls quickly behind. By the time you notice a change on a meter or daily record, the bird is already behind [18].'),
        p('Managing water in a commercial barn is more than keeping the tanks full. Pressure, flow rate, line height, water temperature, and quality at the nipple all matter. A line that looks fine at the header tank can still fail at the nipple if pressure is off, biofilm has built up, or you have not adjusted height in a week [2,10].'),
        p('The CPC Drinking Water Management Bulletin notes that water intake monitoring is one of the most sensitive daily health indicators available to the farmer [10]. A drop in water consumption before any other sign of disease is detectable is a consistent pattern. If your meter readings drop by more than 10 percent compared to the previous day without a management change, investigate all T-FLAWS points and contact your veterinarian.'),

        h2('What to Check'),
        labeled('Nipple flow:', 'Activate several nipples along each line by pressing the trigger pin and confirm that water flows freely. A nipple that requires excessive force or produces only a trickle has failed or is blocked. The CPC Drinking Water Management guide recommends a starting flow rate of 25 ml per minute per nipple for young chicks, with 8 to 12 birds per nipple and 10 to 12 bell drinkers per 1000 birds with a water depth of 1.9 cm (0.75 inches) as the standard allocation [10].'),
        labeled('Line pressure:', 'Overpressure causes nipples to drip constantly, wetting the litter below. Underpressure means birds work hard for very little water and drink less than they need. Pressure regulators must be checked and adjusted as bird size increases and demand grows [2].'),
        labeled('Line height:', 'Chicks should be able to see and easily reach the nipples. In the first days, set the line so their backs are on a slight angle while they drink, not standing straight up. As they grow, keep raising the nipples so the birds have to reach a bit, but are not stretching or jumping to get a drink. If the line is too low, they twist their heads and drip water into the litter. If it is too high, the smaller birds stop trying to drink. Walk the barn and fine-tune nipple height every day as the birds grow [2].'),

        ...imgBlock(IMG.nippleHeight, 'png', 5.8, 'Figure 5.1: Nipple drinker line height by bird age. In the first two days, the line is set at chick eye level. From day 3, the target is a 45-degree drinking angle. By day 10, birds should drink nearly straight up. Adjust at least daily in the first week, then weekly thereafter. Source: CPC Short Courses.'),

        labeled('Water temperature:', 'Birds back off warm water fast. On a hot day, press a nipple and feel what comes out. If it is warm to the touch, intake will drop. Target 10 to 14 degrees Celsius at the nipple [2]. In summer, check that above-ground supply lines are insulated, and know that some operations need active chilling systems by mid-season.'),
        labeled('Consumption records:', 'If your system has water meters, check daily volume against the breed target curve. The Ross Broiler Management Handbook provides expected water intake by day of age at a given temperature [1]. Any deviation greater than 10 percent in either direction needs an explanation.'),
        labeled('Line cleanliness and biofilm:', 'Biofilm develops on the inside of drinker lines within days of a flock placement. It is a slimy buildup you cannot always see, but it harbors bacteria and reduces water quality at the point of consumption [2,10]. Flush lines with high pressure at 1 minute per 60 feet of line before each flock placement. During the flock, run an acidifier through the lines weekly to break down biofilm. The CPC Drinking Water Management guide lists several validated options including citric acid (200 grams per gallon stock solution) and chlorine-based products [10]. Flush lines 12 hours after administering vaccines, vitamins, or antibiotics.'),
        labeled('Water quality at the nipple:', 'Test at the nipple, not just at the header tank. CPC water quality targets: pH 6.0 to 8.0 (optimal 6.8 to 7.5), total dissolved solids at or below 500 mg/L, total coliforms at zero per 100 mL [10]. Annual water analysis from a certified lab is recommended as a baseline.'),

        h2('What Farmers See'),
        labeled('Birds clustered at drinker lines waiting:', 'Flow is insufficient for the number of birds at that line. This can be a pressure issue, a blocked nipple, or a failed regulator.'),
        labeled('Wet litter under drinker lines:', 'Overpressure or dripping nipples. The wet litter under the line will generate ammonia and footpad problems within days if not corrected.'),
        labeled('Yellow or stringy droppings:', 'Can indicate dehydration or reduced water intake. Check flow and pressure before assuming a disease cause.'),
        labeled('Increased aggression and early feather pecking:', 'Competition at water points is a common and underappreciated trigger for early pecking behavior. Ensure there are enough functioning nipples per bird for the current age and density.'),

        h2('What to Do'),
        b('Flush drinker lines at the beginning of every flock and at regular intervals during production [2,10]'),
        b('Run a water acidifier through lines weekly during the flock to prevent biofilm buildup; consult your veterinarian for product selection [10]'),
        b('Adjust line height daily in the first week and at least weekly after that; the CPC guide recommends raising lines so birds drink at a 45-degree angle from day 3, and nearly straight up by day 10 [10]'),
        b('Test water quality at the nipple, not just at the header tank, at minimum once per flock; test for pH, total dissolved solids, coliform count [2,10]'),
        b('If nipple flow is low, check the regulator, filter, and the full line for blockages or heavy biofilm'),
        b('During hot weather, check water temperature at the nipple and increase line-flush frequency to keep water cool'),
        b('Record daily water consumption and flag any drop of more than 10 percent for the same day of age versus previous flocks [1,10]'),
        b('Disinfect your well annually; use unscented household bleach (5 to 6% chlorine) or UV systems following the CPC Drinking Water Management dosing guide for well diameter [10]'),

        pb(),

        // ── S: SANITATION & SPACE ─────────────────────────
        h1('S: Sanitation & Space'),

        // ── Sanitation ────────────────────────────────────
        h2('Sanitation'),
        p('Good biosecurity does not need to be complicated. It just needs to happen every single day, without shortcuts.'),
        p('Start at the door. Before anyone sets foot in your barn (you, your workers, the veterinarian, the feed delivery driver), they put on clean coveralls and clean boots. A footbath at the entrance is not a nice-to-have. It is a must.'),
        p('If you can, set up a Danish entry system. It sounds technical, but it is simple: a bench and a clearly marked line on the floor that separates the outside world from your barn. You step up to that line, swap your outside boots and coveralls for barn-only ones, and cross over. Every person, every visit, every time. If you have the space, add a shower area so people can wash up before suiting up. That is your first and best line of defense.'),
        p('Think of that doorway as a wall between your birds and everything trying to make them sick. The wall only works if it is respected on every visit.'),
        p('Keep your water lines clean. Run an acidifier through them weekly to break down biofilm, the slimy buildup inside drinker lines that you cannot always see but that harbors bacteria [2,10]. Flush lines thoroughly after every flock before placing a new one.'),

        ...imgBlock(IMG.biosec, 'png', 5.8, 'Photo 6.1: Danish entry system at the barn entrance. Proper sanitation starts before you enter. A clean biosecurity line protects every bird inside. Source: CPC Short Courses.'),

        h2('Space:'),

        // ── Litter Management ──────────────────────────────
        h2('Litter Management'),
        p('Litter is not just bedding. It is a living environment that generates heat, moisture, and ammonia when it is mismanaged, and provides warmth, a place for birds to dust-bathe, and foot comfort when it is managed well. Wet litter affects temperature, air quality, and water management all at the same time. Getting litter right is the foundation of the whole T-FLAWS system.'),
        p('The target for litter moisture is 20 to 25 percent [7]. University and industry research consistently confirms this as the sweet spot for healthy broiler production. Above 25 percent, footpad dermatitis starts climbing. Above 30 percent, ammonia builds fast and conditions that favor gut disease become a real risk. Good litter is loose, light-colored, and crumbles when you grab a handful. Problem litter is wet, dark, caked, and you can smell the ammonia as soon as you walk in.'),
        p('Common causes of wet litter include:'),
        b('Leaking nipple drinkers or failed pressure regulators'),
        b('Inadequate ventilation allowing humidity to build in the litter surface'),
        b('High dietary salt levels driving excess water consumption'),
        b('Disease causing watery droppings'),
        b('Insufficient litter depth at placement or poor-quality litter material'),
        p('Wet patches spread. Moisture creates a feedback loop: wet litter prevents drying underneath, microbial activity generates more heat and moisture, and the affected area grows. A small wet patch under a dripping nipple becomes a large problem within days if not corrected. Walk the full barn perimeter and the center on every visit. Litter problems are easier to catch in a corner than to remediate across an entire barn floor.'),

        callout('If your litter is wet, your ammonia is rising and your ventilation rate needs to increase. Fix the source of moisture, increase ventilation, and consider applying a litter amendment if recommended by your veterinarian. Do not wait for footpad scores to tell you what the litter already shows.'),

        ...imgBlock(IMG.wetlitter, 'png', 5.8, 'Photo 6.2: A leaking nipple drinker drips water onto the litter directly below, creating a wet patch that spreads quickly in a crowded barn. Fix leaks the same day you find them. Source: CPC Short Courses.'),

        // ── Stocking Density ─────────────────────────────
        h2('Stocking Density'),
        p('Stocking density affects every other T-FLAWS checkpoint. Higher density means more heat produced per square meter (T), more moisture and ammonia in the air (A), more competition for feeders and waterers (F and W), and less space per bird to rest, move, and express normal behavior (welfare).'),
        p('The National Farm Animal Care Council (NFACC) Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys sets the legal and welfare standards for commercial broiler production in Canada. Under conventional programs, the maximum stocking density is 31 kg per square meter live weight. Programs with enhanced welfare auditing can operate up to 38 kg per square meter [4].'),
        p('These are legal maximums, not production targets. Running at the ceiling on every flock means your ventilation, feeding, and water systems have zero margin for error. On a hot day in a barn packed to the limit, a single fan failure or a blocked nipple line becomes a serious welfare and mortality event. A barn with a bit of space to spare gives you time to catch problems before they escalate.'),

        h2('What Farmers See'),
        labeled('Wet, dark, caked litter patches:', 'Most commonly found under drinker lines, near walls, and in corners with poor air circulation. Check for the moisture source before applying a treatment.'),
        labeled('Strong ammonia on barn entry:', 'If the smell hits you at the door, litter moisture is high and ventilation rate is insufficient. Both problems need to be addressed simultaneously.'),
        labeled('Reddened or eroded footpads:', 'Early footpad dermatitis is a visible outcome of wet litter. By the time you see it on the birds, the litter has been wet for several days. Check and score footpads weekly to catch the trend before it becomes a processing problem.'),
        labeled('Competition at feeders and waterers:', 'If birds are pushing each other off feeders and drinkers just to get a turn, you have a density problem. Check how many feeders and drinkers are running relative to bird numbers, and whether they are spread evenly across the floor.'),
        labeled('Increased aggression and piling:', 'Crowded birds under heat or feed pressure start piling at night, and piling kills birds fast. Spreading them out is not a fix. Find what is driving it: heat, short feed, poor air. Something is wrong and it needs to be corrected, not managed around.'),

        h2('What to Do'),
        b('Walk the full barn length and perimeter for litter inspection at every visit; focus on corners and drinker lines where wet patches start'),
        b('Fix water leaks immediately, the same day they are identified, not at the next maintenance cycle'),
        b('Increase ventilation rate when litter surface is visibly damp, even if other parameters appear acceptable'),
        b('Apply a litter amendment product only if recommended by your veterinarian and consistent with your production protocol; some amendments alter ammonia chemistry without addressing the root cause [7]'),
        b('Ensure full cleanout, disinfection, and complete dry-down between every flock [7,8]'),
        b('Do not place a new flock on litter that does not meet your pre-placement quality targets, regardless of schedule pressure [7]'),
        b('Maintain stocking density within NFACC limits; adjust for seasonal conditions, and plan density reductions in summer months when ventilation capacity is most stressed [4]'),

        pb(),

        // ── SYSTEM ────────────────────────────────────────
        h1('Using T-FLAWS as a System'),
        p('The value of T-FLAWS is not in any single point. It is in the discipline of checking all six, in the same order, every time you enter a barn.'),
        p('The six points are connected. A problem in one almost always affects the others:'),
        b('Cold temperature causes birds to huddle, which localizes their droppings and wets the litter under the heat source (T worsening S)'),
        b('High ammonia from wet litter suppresses feed intake and irritates airways, making birds more vulnerable to respiratory disease (A and S worsening F and health)'),
        b('Poor ventilation raises humidity, accelerates litter breakdown, and raises ammonia further (A worsening both A and S in a feedback loop)'),
        b('Restricted water causes feed intake to fall rapidly, Fix water first before investigating other causes (W driving F)'),
        b('High stocking density creates competition for every resource, amplifying any deficiency in T, F, L, A, or W (S amplifying everything else)'),
        p('When you find a T-FLAWS problem, ask what else it is touching. Wet litter near the drinkers is not just a water pressure issue. It is also a prompt to check ammonia, ventilation rate, footpad condition, and feed intake in that section. Fix one thing and check the rest, because they are rarely independent.'),
        callout('The farmers who get the most from T-FLAWS are not the ones who use it to find problems. They are the ones who use it to prevent them. By the time a problem is visible in your birds, it has usually been building in your management for several days.'),

        ...imgBlock(IMG.digital, 'png', 5.8, 'Photo 7.1: Digital flock management tools can support daily T-FLAWS records, making patterns visible across flocks and seasons. Source: CPC Short Courses.'),

        pb(),

        // ── WHERE TO KEEP LEARNING ────────────────────────
        h1('Where to Keep Learning'),
        h2('Key Scientific Journals'),
        b('Poultry Science: the primary peer-reviewed research journal for commercial poultry production (poultryscience.org)'),
        b("World's Poultry Science Journal: WPSA journal covering global production and welfare research"),
        b('Canadian Journal of Animal Science: covers Canadian production conditions, regulation, and management'),
        b('Animals: open-access journal with applied welfare and management research'),

        h2('Key Institutional Resources'),
        b('CPC Learning Centre, Canadian Poultry Consultants Ltd.: canadianpoultry.ca/learning-centre/. Technical Bulletins, Disease Profiles, Broiler and Layer Flock Management guides.'),
        b('Aviagen Resource Centre: aviagen.com. Ross and ArborAcres breed management handbooks, water quality and biosecurity guides, updated annually.'),
        b('National Farm Animal Care Council (NFACC): nfacc.ca. Codes of Practice for all Canadian poultry species.'),
        b('Canadian Food Inspection Agency (CFIA): inspection.canada.ca. Biosecurity standards for commercial poultry production.'),
        b('Poultry Industry Council (PIC): poultryindustrycouncil.ca. Canadian production data, extension resources, and on-farm benchmarking tools.'),

        pb(),

        // ── REFERENCES ────────────────────────────────────
        h1('References'),
        p('References listed in order of appearance.'),

        new Paragraph({ spacing: { before: 100, after: 80 }, children: [
          run('[1]', { bold: true }), run('  Aviagen. Ross Broiler Management Handbook. Aviagen Group Ltd., Huntsville, AL, USA, 2025.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[2]', { bold: true }), run('  Aviagen. Water Quality in Poultry Production. Aviagen Group Ltd., Huntsville, AL, USA, 2025.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[3]', { bold: true }), run('  Bell DD, Weaver WD (eds). Commercial Chicken Meat and Egg Production, 5th ed. Springer Science & Business Media, New York, 2002.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[4]', { bold: true }), run('  National Farm Animal Care Council (NFACC). Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys. NFACC, Lacombe, AB, Canada, 2016.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[5]', { bold: true }), run('  Pottguter R. Poultry Signals: A Practical Guide for Poultry Farming. Roodbont Publishers, Zutphen, Netherlands, 2009.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[6]', { bold: true }), run('  Daghir NJ (ed). Poultry Production in Hot Climates, 2nd ed. CABI, Wallingford, UK, 2008.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[7]', { bold: true }), run('  Aviagen. Best Practices in Biosecurity for Ross Broiler Operations. Aviagen Group Ltd., Huntsville, AL, USA.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[8]', { bold: true }), run('  Canadian Food Inspection Agency (CFIA). Biosecurity Guide for Commercial Poultry Production. CFIA, Ottawa, ON, Canada.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[9]', { bold: true }), run('  CPC Learning Centre. T-FLAWS Barn Management Framework. Canadian Poultry Consultants Ltd., Canada. [Unpublished proprietary framework; confirmed by CPC, personal communication, 2026.]'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[10]', { bold: true }), run('  CPC Learning Centre. Drinking Water Management. Integrated Poultry Health Management Series. Canadian Poultry Consultants Ltd., Canada, 2011.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[11]', { bold: true }), run('  CPC Learning Centre. Broiler Management. CPC Technical Bulletin, Flock Management Series. Canadian Poultry Consultants Ltd., Canada.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[12]', { bold: true }), run('  CPC Learning Centre. Broiler Lighting Program Guidelines for Broilers 2026. Canadian Poultry Consultants Ltd., Canada, 2026.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[13]', { bold: true }), run('  Leighton GM, Drury JP, Small J, Miller ET. Unfamiliarity generates costly aggression in interspecific avian dominance hierarchies. Nature Communications. 2024;15:335. https://doi.org/10.1038/s41467-023-44613-0'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[14]', { bold: true }), run('  Miller ET, Bonter DN, Eldermire C, Freeman BG, Greig EI, Harmon LJ, Lisle C, Hochachka WM. Fighting over food unites the birds of North America in a continental dominance hierarchy. Behavioral Ecology. 2017;28(6):1454-1463. https://doi.org/10.1093/beheco/arx108'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[15]', { bold: true }), run('  Francis ML, Plummer KE, Lythgoe BA, Macallan C, Currie TE, Blount JD. Effects of supplementary feeding on interspecific dominance hierarchies in garden birds. PLoS One. 2018;13(9):e0202152. https://doi.org/10.1371/journal.pone.0202152'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[16]', { bold: true }), run('  Grethen KJ, Gomez Y, Toscano MJ. Coup in the coop: Rank changes in chicken dominance hierarchies over maturation. Behav Processes. 2023;210:104904. https://doi.org/10.1016/j.beproc.2023.104904'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[17]', { bold: true }), run('  Jacob J. Normal behaviors of chickens in small and backyard poultry flocks. University of Kentucky Cooperative Extension Service. Available from: https://poultry.extension.org/articles/poultry-behavior/normal-behaviors-of-chickens-in-small-and-backyard-poultry-flocks/'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[18]', { bold: true }), run('  Lott BD, Simmons JD, May JD. Water intake: a good measure of broiler performance. Avian Advice. University of Arkansas Cooperative Extension Service; 2003. Available from: https://www.thepoultrysite.com/articles/water-intake-a-good-measure-of-broiler-performance'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[19]', { bold: true }), run('  Edge CK. Evaluation of water needs for modern commercial broiler production [dissertation]. Auburn (AL): Auburn University; 2022. (Water:feed ratios reported as 1.62 to 2.06 kg water per kg feed; a 2:1 ratio is commonly assumed in the broiler industry.)'),
        ]}),
      ],
    },
  ],
});

// ── Build ─────────────────────────────────────────────────────
console.log('Building document...');
const rawBuf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, rawBuf);
console.log('Initial file written. Applying post-build patches...');

// ── POST-BUILD PATCH ──────────────────────────────────────────
const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tocRow(e) {
  const style  = e.lvl === 1 ? 'TOC1' : 'TOC2';
  const indent = e.lvl === 1 ? 0 : 220;
  const text   = escapeXml(e.text);
  return (
    '<w:p><w:pPr>' +
      `<w:pStyle w:val="${style}"/>` +
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

const cachedRows = ea.map(tocRow).join('');

// 1. Patch document.xml
let docXml = await outZip.file('word/document.xml').async('string');
const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  sdt = sdt.replace(/\sw:dirty="true"/g, '');
  sdt = sdt.replace(
    /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
    `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`,
  );
  docXml = docXml.replace(sdtMatch[0], sdt);
}
docXml = docXml.replace(/\sw:dirty="true"/g, '');

// 2. Inject bookmarks
const norm = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
let entryIdx  = 0;
let bookmarkId = 1000;
const hRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
docXml = docXml.replace(hRe, (match, lvlStr) => {
  if (entryIdx >= ea.length) return match;
  const lvl  = Number(lvlStr);
  const text = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
  const entry = ea[entryIdx];
  if (lvl !== entry.lvl) return match;
  if (norm(text) !== norm(entry.text)) return match;
  entryIdx++;
  const id = bookmarkId++;
  return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
});
if (entryIdx !== ea.length) {
  console.warn(`TOC bookmark warning: ${entryIdx}/${ea.length} matched.`);
  console.warn('Unmatched:', ea.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | '));
}
outZip.file('word/document.xml', docXml);

// 3. settings.xml — updateFields=false (robust: remove any existing, then insert)
let settings = await outZip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
settings = settings.replace(/<w:updateFields[^>]*>[\s\S]*?<\/w:updateFields>/g, '');
settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
outZip.file('word/settings.xml', settings);

// 4. TOC styles
let stylesXml = await outZip.file('word/styles.xml').async('string');
if (!/w:styleId="TOC1"/.test(stylesXml)) {
  const tocStyles =
    '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
  stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
  outZip.file('word/styles.xml', stylesXml);
}

// 5. Verify
const dirtyLeft  = (docXml.match(/w:dirty=/g) || []).length;
const bookmarks  = (docXml.match(/<w:bookmarkStart/g) || []).length;
const hyperlinks = (docXml.match(/<w:hyperlink/g) || []).length;
console.log(`w:dirty remaining : ${dirtyLeft}  (must be 0)`);
console.log(`TOC bookmarks     : ${bookmarks}  (expected ${ea.length})`);
console.log(`TOC hyperlinks    : ${hyperlinks}  (expected ${ea.length})`);
console.log(`updateFields      :`, settings.match(/<w:updateFields[^>]*>/g));
if (dirtyLeft > 0) throw new Error(`${dirtyLeft} w:dirty flags remain — dialog will fire`);

// 6. Write final
const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log(`\nDone. Output: ${OUT_FILE}`);
console.log('NOTE: Word shows the field-update dialog on FIRST open only.');
console.log('      Click YES once, then Ctrl+S. It will not appear again on subsequent opens.');
