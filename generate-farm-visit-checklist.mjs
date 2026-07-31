// ============================================================
// generate-farm-visit-checklist.mjs
// Poultry Farm Visit Checklist — Veterinary Barn Walkthrough
// and Report Worksheet
// A fill-in field form a veterinarian completes during a barn
// walk and later turns into a client report.
// Run: node generate-farm-visit-checklist.mjs
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  BorderStyle,
  ShadingType,
  HeightRule,
  convertInchesToTwip,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR    = path.join(__dirname, 'Farm Visit Checklist');
const OUT_FILE   = path.join(OUT_DIR, 'Poultry_Farm_Visit_Checklist.docx');
const LOGO_PATH    = path.join(__dirname, 'Abbvet Logo-1.png');   // clinic logo + wordmark
const TAGLINE_PATH = path.join(__dirname, 'Abbvet Logo-2.png');   // "together we ARE animal care"

// Abbotsford Veterinary Clinic brand colors (sampled from logo)
const MED_BLUE  = '2E6699';   // clinic blue
const DARK_BLUE = '1F4E79';   // deep blue for the title
const GOLD      = '6EBF4D';   // clinic green (accent rules / underlines)
const BODY      = '3C3C3C';
const GRAY      = '888888';
const LABEL_BG  = 'EDF2F9';   // very light blue for label cells
const HDR_BG    = '2E6699';   // section bar / table header (clinic blue)
const ALT_BG    = 'F5F8FC';   // zebra

const CONTENT_W = 9360;       // 1" side margins on Letter = 6.5" = 9360 twips

// ============================================================
// TEXT HELPERS
// ============================================================
function run(text, o = {}) {
  return new TextRun({
    text,
    bold:    o.bold    || false,
    italics: o.italics || false,
    color:   o.color   || BODY,
    size:    o.size    || 20,
    font:    o.font    || 'Calibri',
  });
}

// empty ballot box, renders reliably in Segoe UI Symbol
function box(size = 22) {
  return new TextRun({ text: '☐  ', font: 'Segoe UI Symbol', size, color: BODY });
}

function para(text, o = {}) {
  const children = Array.isArray(text) ? text : [run(text, o)];
  return new Paragraph({
    children,
    alignment: o.alignment || AlignmentType.LEFT,
    spacing:   { after: o.after !== undefined ? o.after : 120, line: 264, lineRule: 'auto' },
    indent:    o.indent ? { left: convertInchesToTwip(o.indent) } : undefined,
  });
}

// blue section bar with white bold text
function sectionBar(num, title) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}.  `, bold: true, color: 'FFFFFF', size: 24, font: 'Calibri' }),
      new TextRun({ text: title, bold: true, color: 'FFFFFF', size: 24, font: 'Calibri' }),
    ],
    shading: { type: ShadingType.SOLID, color: HDR_BG },
    spacing: { before: 260, after: 120 },
    border: {
      top:    { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      left:   { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      right:  { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
    },
  });
}

// blue bold sub-heading with gold underline
function subHead(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
    spacing: { before: 160, after: 80 },
    border:  { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  });
}

// small gray instruction line under a heading
function hint(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, color: GRAY, size: 18, font: 'Calibri' })],
    spacing: { after: 100 },
  });
}

// one checkbox item
function check(text, o = {}) {
  return new Paragraph({
    children: [box(20), run(text, { size: 20 })],
    spacing: { after: 40, line: 252, lineRule: 'auto' },
    indent:  { left: convertInchesToTwip(0.08) },
  });
}

// a label followed by inline checkbox options: "Label  ☐ a  ☐ b  ☐ c"
function options(label, arr, o = {}) {
  const children = [];
  if (label) children.push(run(label + '   ', { bold: true, size: 20 }));
  arr.forEach(opt => {
    children.push(box(20));
    children.push(run(opt + '     ', { size: 20 }));
  });
  return new Paragraph({
    children,
    spacing: { after: o.after !== undefined ? o.after : 70 },
    indent:  { left: convertInchesToTwip(0.08) },
  });
}

// ============================================================
// TABLE HELPERS
// ============================================================
const thinBdr = { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' };
const cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };

function labelCell(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: cellBdr,
    shading: { type: ShadingType.SOLID, color: LABEL_BG },
    margins: { top: 40, bottom: 40, left: 90, right: 90 },
    children: [new Paragraph({ children: [run(text, { bold: true, size: 19 })], spacing: { after: 0 } })],
  });
}

function blankCell(w, text = '', o = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: cellBdr,
    shading: o.shade ? { type: ShadingType.SOLID, color: o.shade } : undefined,
    margins: { top: 40, bottom: 40, left: 90, right: 90 },
    children: [new Paragraph({
      alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: text ? [run(text, { size: 19, color: o.color || BODY })] : [],
      spacing: { after: 0 },
    })],
  });
}

// Two fields per row: [label | blank | label | blank]
function kv2Table(pairs) {
  const W = [1820, 2860, 1820, 2860];
  const rows = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const a = pairs[i];
    const b = pairs[i + 1] || '';
    rows.push(new TableRow({
      height: { value: 360, rule: HeightRule.ATLEAST },
      children: [
        labelCell(a, W[0]),
        blankCell(W[1]),
        b ? labelCell(b, W[2]) : blankCell(W[2], '', { shade: LABEL_BG }),
        b ? blankCell(W[3]) : blankCell(W[3]),
      ],
    }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

// One field per row: [label | blank]
function kv1Table(labels) {
  const W = [2500, 6860];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: labels.map(l => new TableRow({
      height: { value: 360, rule: HeightRule.ATLEAST },
      children: [labelCell(l, W[0]), blankCell(W[1])],
    })),
  });
}

// Readings table: Parameter | Reading | Target guide | OK?
function readingsTable(rows) {
  const W = [3120, 1760, 3280, 1200];
  const hdr = (t, i) => new TableCell({
    width: { size: W[i], type: WidthType.DXA },
    borders: cellBdr,
    shading: { type: ShadingType.SOLID, color: HDR_BG },
    margins: { top: 40, bottom: 40, left: 90, right: 90 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(t, { bold: true, size: 18, color: 'FFFFFF' })], spacing: { after: 0 } })],
  });
  const body = rows.map((r, ri) => new TableRow({
    height: { value: 340, rule: HeightRule.ATLEAST },
    children: [
      new TableCell({ width: { size: W[0], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 40, bottom: 40, left: 90, right: 90 }, children: [new Paragraph({ children: [run(r[0], { size: 18, bold: true })], spacing: { after: 0 } })] }),
      new TableCell({ width: { size: W[1], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 40, bottom: 40, left: 90, right: 90 }, children: [new Paragraph({ spacing: { after: 0 } })] }),
      new TableCell({ width: { size: W[2], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 40, bottom: 40, left: 90, right: 90 }, children: [new Paragraph({ children: [run(r[1], { size: 17, color: GRAY })], spacing: { after: 0 } })] }),
      new TableCell({ width: { size: W[3], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 40, bottom: 40, left: 90, right: 90 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Y  /  N', size: 16, color: 'B0B0B0', font: 'Calibri' })], spacing: { after: 0 } })] }),
    ],
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ tableHeader: true, children: ['Parameter', 'Reading', 'Target guide', 'OK?'].map(hdr) }), ...body],
  });
}

// Checkboxes laid out in a borderless grid (cols per row)
function checkGrid(items, cols = 2) {
  const noBdr = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const none = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };
  const w = Math.floor(CONTENT_W / cols);
  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    const cells = [];
    for (let c = 0; c < cols; c++) {
      const txt = items[i + c];
      cells.push(new TableCell({
        width: { size: w, type: WidthType.DXA },
        borders: none,
        margins: { top: 20, bottom: 20, left: 40, right: 120 },
        children: [new Paragraph({ children: txt ? [box(19), run(txt, { size: 19 })] : [], spacing: { after: 0 } })],
      }));
    }
    rows.push(new TableRow({ children: cells }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

// A bordered free-text write box with room to write
function writeBox(label = 'Observations / notes:', lines = 3) {
  const inner = [new Paragraph({ children: [run(label, { bold: true, size: 19, color: MED_BLUE })], spacing: { after: 60 } })];
  for (let i = 0; i < lines; i++) inner.push(new Paragraph({ spacing: { after: 0, line: 340, lineRule: 'auto' }, children: [run('', {})] }));
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: GOLD };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        borders: { top: bdr, bottom: bdr, left: bdr, right: bdr },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: inner,
      })],
    })],
  });
}

// generic header-row data table (list of column labels + N blank rows)
function blankGridTable(headers, widths, nRows) {
  const hdr = (t, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    borders: cellBdr,
    shading: { type: ShadingType.SOLID, color: HDR_BG },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(t, { bold: true, size: 17, color: 'FFFFFF' })], spacing: { after: 0 } })],
  });
  const rows = [new TableRow({ tableHeader: true, children: headers.map(hdr) })];
  for (let r = 0; r < nRows; r++) {
    rows.push(new TableRow({
      height: { value: 380, rule: HeightRule.ATLEAST },
      children: headers.map((_, i) => new TableCell({
        width: { size: widths[i], type: WidthType.DXA },
        borders: cellBdr,
        shading: { type: ShadingType.SOLID, color: r % 2 ? ALT_BG : 'FFFFFF' },
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [new Paragraph({ spacing: { after: 0 } })],
      })),
    }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

// filled reference table (blue header + pre-filled text rows)
function refTable(headers, widths, rows) {
  const hdr = (t, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    borders: cellBdr,
    shading: { type: ShadingType.SOLID, color: HDR_BG },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({ children: [run(t, { bold: true, size: 18, color: 'FFFFFF' })], spacing: { after: 0 } })],
  });
  const dataRow = (r, ri) => new TableRow({
    children: r.map((txt, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      borders: cellBdr,
      shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' },
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
      children: [new Paragraph({ children: [run(txt, { size: 18, bold: i === 0 })], spacing: { after: 0 } })],
    })),
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ tableHeader: true, children: headers.map(hdr) }), ...rows.map(dataRow)],
  });
}

function spacer(after = 100) { return new Paragraph({ spacing: { after }, children: [] }); }

// ============================================================
// HEADER / FOOTER
// ============================================================
function buildHeader() {
  return new Header({ children: [new Paragraph({
    children: [
      new TextRun({ text: 'Abbotsford Veterinary Clinic  |  ', color: GRAY, size: 18, font: 'Calibri' }),
      new TextRun({ text: 'Poultry Farm Visit Checklist', bold: true, color: MED_BLUE, size: 18, font: 'Calibri' }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}

function buildFooter() {
  return new Footer({ children: [new Paragraph({
    children: [
      new TextRun({ text: 'Veterinary Barn Walkthrough & Report Worksheet  |  Page ', color: GRAY, size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.CURRENT], color: GRAY, size: 18, font: 'Calibri' }),
      new TextRun({ text: ' of ', color: GRAY, size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], color: GRAY, size: 18, font: 'Calibri' }),
    ],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}

const pageMargin = {
  top: convertInchesToTwip(0.9), bottom: convertInchesToTwip(0.9),
  left: convertInchesToTwip(1), right: convertInchesToTwip(1),
};

// ============================================================
// CONTENT
// ============================================================
const logoBuffer    = fs.existsSync(LOGO_PATH)    ? fs.readFileSync(LOGO_PATH)    : null;
const taglineBuffer = fs.existsSync(TAGLINE_PATH) ? fs.readFileSync(TAGLINE_PATH) : null;
const C = [];

// ---- COVER BLOCK ----
C.push(new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }));
if (logoBuffer) {
  // Abbvet Logo-1.png is 211 x 57 (3.70:1) — preserve aspect ratio
  C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 150 },
    children: [new ImageRun({ data: logoBuffer, transformation: { width: 300, height: 81 }, type: 'png' })] }));
}
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
  children: [new TextRun({ text: 'POULTRY FARM VISIT CHECKLIST', bold: true, color: DARK_BLUE, size: 40, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 150 },
  children: [new TextRun({ text: 'Veterinary Barn Walkthrough & Report Worksheet', italics: true, color: MED_BLUE, size: 24, font: 'Calibri' })] }));
if (taglineBuffer) {
  // Abbvet Logo-2.png is 172 x 39 (4.41:1) — the "together we ARE animal care" tagline
  C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 },
    children: [new ImageRun({ data: taglineBuffer, transformation: { width: 225, height: 51 }, type: 'png' })] }));
}
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 },
  children: [new TextRun({ text: '___________________________________', color: GOLD, size: 22, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
  children: [run('Complete during the barn walk. Each numbered section maps to a section of the written client report.', { italics: true, color: GRAY, size: 19 })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
  children: [run('Tick what applies, record readings and counts, and use the note boxes for detail. N/A any section that does not fit the flock type.', { italics: true, color: GRAY, size: 19 })] }));

// ============================================================
// 1 — VISIT & FARM IDENTIFICATION
// ============================================================
C.push(sectionBar(1, 'Visit & Farm Identification'));
C.push(kv2Table([
  'Farm / premises name', 'Premises ID (PID)',
  'Owner / manager', 'Contact phone',
  'Farm address', 'Email',
  'Attending veterinarian', 'Clinic / license no.',
  'Visit date', 'Time in / time out',
  'Barn / house ID', 'No. of barns on site',
]));
C.push(spacer(60));
C.push(options('Purpose of visit:', ['Routine / scheduled', 'Health investigation', 'Follow-up', 'Pre-placement', 'Audit / certification', 'Other']));
C.push(options('Outside conditions:', ['Cold', 'Mild', 'Hot', 'Wet', 'Windy', 'Dry']));
C.push(kv2Table(['Outside temp', '', 'Others present on visit', '']));

// ============================================================
// 2 — FLOCK DETAILS
// ============================================================
C.push(sectionBar(2, 'Flock Details'));
C.push(options('Production type:', ['Broiler', 'Layer', 'Pullet', 'Broiler breeder', 'Layer breeder', 'Turkey', 'Other']));
C.push(options('Housing:', ['Floor / litter', 'Slats', 'Conventional cage', 'Enriched cage', 'Aviary / free-run', 'Free-range', 'Tunnel', 'Natural']));
C.push(spacer(40));
C.push(kv2Table([
  'Breed / strain', 'Flock / lot no.',
  'Placement date', 'Flock age (days / weeks)',
  'Birds placed', 'Current bird count',
  'Cumulative mortality %', 'Age at expected market / lay',
  'Current ration / feed phase', 'Feed mill / supplier',
  'Water source', 'Water treatment / sanitizer',
]));
C.push(spacer(50));
C.push(options('Vaccination program on file:', ['Yes', 'No', 'Reviewed today']));
C.push(options('Previous lab / necropsy history reviewed:', ['Yes', 'No', 'None on file']));
C.push(kv1Table(['Date of last veterinary visit / key history']));

// ============================================================
// 3 — RECORDS & PERFORMANCE REVIEW
// ============================================================
C.push(sectionBar(3, 'Records & Performance Review'));
C.push(hint('Go through the daily records with the grower. Numbers often show a problem before you can see it in the birds.'));
C.push(options('Daily mortality pattern:', ['Stable / low', 'Slowly rising', 'Sudden spike', 'Uneven between rooms']));
C.push(options('Feed intake vs target:', ['On target', 'Below', 'Above', 'Dropped suddenly']));
C.push(options('Water intake vs target:', ['On target', 'Below', 'Above', 'Dropped suddenly', 'Spiked']));
C.push(options('Body weight vs target:', ['On target', 'Under', 'Over', 'Poor uniformity']));
C.push(spacer(40));
C.push(readingsTable([
  ['Cumulative mortality to date', 'Compare to breed target for age'],
  ['Yesterday / last 24 h mortality', 'Watch for day-over-day doubling'],
  ['Feed consumed (per bird / total)', 'Against management guide for age'],
  ['Water consumption', 'Water:feed roughly 1.7-1.8:1 at normal temp'],
  ['Water:feed ratio', 'Rises in heat; sudden change = investigate'],
  ['Average body weight', 'Against breed standard for age'],
  ['Weight uniformity (CV %)', 'Lower CV is better; high CV = a problem'],
  ['FCR / feed conversion (broilers)', 'Against breed standard'],
  ['Production % / egg weight (layers)', 'Against strain lay curve'],
  ['Hatchability / fertility (breeders)', 'Against strain target'],
]));
C.push(spacer(50));
C.push(subHead('Medication & treatment history'));
C.push(kv1Table(['Products given, dose, dates, withdrawal', 'Reason for treatment / response']));
C.push(spacer(40));
C.push(writeBox('Records notes (trends, anything that does not add up):', 3));

// ============================================================
// 4 — BIOSECURITY & EXTERIOR
// ============================================================
C.push(sectionBar(4, 'Biosecurity & Exterior'));
C.push(hint('Assess before you enter the birds. Mark items that need attention; add detail in the note box.'));
C.push(checkGrid([
  'Perimeter / fencing / gates secure',
  'Entry signage and visitor log in use',
  'Anteroom / Danish entry / clear line of separation',
  'Boot change or dedicated barn footwear',
  'Footbath present, clean, correctly charged',
  'Coveralls / dedicated clothing available',
  'Hand hygiene station stocked',
  'Rodent bait stations present and maintained',
  'No evidence of rodent activity (droppings, runs)',
  'No darkling beetle / insect burden in litter',
  'Wild bird access controlled (screens, no gaps)',
  'No standing water or attractants near barn',
  'Feed bins sound, lids closed, no spillage',
  'Dead bird storage / composter managed properly',
  'Mortality disposal method appropriate',
  'Vehicle / delivery access controlled',
  'Water source protected (well cap, no contamination)',
  'Manure storage sited and managed correctly',
], 2));
C.push(spacer(50));
C.push(writeBox('Biosecurity notes and gaps:', 3));

// ============================================================
// 5 — ENVIRONMENT WALKTHROUGH (T-FLAWS)
// ============================================================
C.push(sectionBar(5, 'Environment Walkthrough (T-FLAWS)'));
C.push(hint('T-FLAWS: Temperature, Feed, Light, Air, Water, Sanitation & Space. Log readings at bird level, then work through each area.'));
C.push(subHead('Environment readings (measure at bird level)'));
C.push(readingsTable([
  ['Temperature at bird level', 'Match breed guide for age; brooding day 0-2 ~32-34 C'],
  ['Relative humidity', '60-70% brooding; 50-60% grow-out'],
  ['Ammonia (NH3)', 'Aim below 15 ppm; investigate above 20; harmful above 25'],
  ['Carbon dioxide (CO2)', 'Below 3,000 ppm; higher = too little ventilation'],
  ['Light intensity at bird level', 'At least 20 lux early on (NFACC: first 3 days); no dark spots'],
  ['Photoperiod / dark period', 'Real dark period; NFACC minimum 4 h continuous per 24 h'],
  ['Nipple flow rate', 'Match to age per drinker maker (rises with age)'],
  ['Water temperature at drinker', 'About 10-14 C'],
  ['Water pH', 'About 6.0-8.0 at the drinker'],
  ['Litter moisture', 'About 20-25%; wet or capped = a problem'],
  ['Stocking density', 'Broiler NFACC: <=31 kg/m2 (up to 38 enhanced)'],
]));
C.push(hint('Target guides are general starting points. Confirm against the flock’s own management guide (Ross, Cobb, Lohmann, Hy-Line) and the NFACC Code of Practice.'));

C.push(subHead('T: Temperature'));
C.push(checkGrid([
  'Bird-level temperature within target for age',
  'Heat even across the house (no cold ends)',
  'Birds evenly spread (not huddled or panting)',
  'No drafts or cold spots at floor level',
  'Heaters / brooders working, no gaps',
  'Bird comfort matches the thermostat reading',
], 2));

C.push(subHead('F: Feed'));
C.push(options('Feeder type:', ['Pan', 'Chain / trough', 'Tube', 'Supplemental paper / trays']));
C.push(checkGrid([
  'Feeder space adequate for flock size',
  'Feed present in all lines, none empty',
  'Feed fresh, no mold, caking, or off smell',
  'Distribution even across the house',
  'No blocked, bridged, or failed feeders',
  'Feed height / pan setting correct for age',
  'Crop fill good on a sample (brooding)',
  'Feed form correct (crumble / pellet / mash), low fines',
], 2));

C.push(subHead('L: Light'));
C.push(checkGrid([
  'Intensity adequate and even at bird level',
  'No dark spots where birds avoid feed / water',
  'Photoperiod matches the lighting program',
  'A real dark period is provided',
  'Bulbs / fixtures clean and all working',
  'Dimmers set correctly, no flicker',
], 2));

C.push(subHead('A: Air'));
C.push(checkGrid([
  'No ammonia sting at bird level (eyes / nose)',
  'Minimum ventilation adequate (CO2 in range)',
  'Air inlets opening and directing air correctly',
  'Fans running to program, none stalled',
  'No drafts blowing directly on birds',
  'Dust level acceptable',
  'No damp, stale, or moldy smell',
  'No condensation on ceiling or walls',
], 2));

C.push(subHead('W: Water'));
C.push(options('Drinker type:', ['Nipple', 'Bell', 'Cup', 'Trough']));
C.push(checkGrid([
  'Drinker height / pressure correct for age',
  'Flow rate matches age (checked, not assumed)',
  'Nipples / cups clean, no biofilm or slime',
  'No leaks; litter under lines is dry',
  'Water clear, no smell, no visible fouling',
  'Medicator / sanitizer working as intended',
  'Enough drinker access for the whole flock',
  'Water temperature comfortable (not warm)',
], 2));

C.push(subHead('S: Sanitation & Space'));
C.push(checkGrid([
  'Stocking density within target for type',
  'Litter dry, friable, and of adequate depth',
  'No wet spots, caking, or capped litter',
  'General cleanliness good (walls, equipment)',
  'No excess dust, cobwebs, or clutter',
  'Manure / belt system managed properly',
  'Birds have room to reach feed and water',
  'No crowding or piling in corners',
], 2));
C.push(spacer(40));
C.push(writeBox('Environment notes (what is driving any issue and where):', 3));

// ============================================================
// 6 — FLOCK HEALTH & BIRD OBSERVATION
// ============================================================
C.push(sectionBar(6, 'Flock Health & Bird Observation'));
C.push(hint('Walk the flock quietly first, then handle a sample of birds. Record counts out of the number examined so findings stay comparable between visits.'));
C.push(subHead('General flock impression'));
C.push(options('Activity / alertness:', ['Bright, active', 'Mixed', 'Dull / lethargic']));
C.push(options('Distribution:', ['Even', 'Piling', 'Avoiding areas', 'Crowding feed / water']));
C.push(options('Flock voice:', ['Normal / content', 'Quiet', 'Distress / gasping sounds']));
C.push(options('Uniformity by eye:', ['Even', 'Some tail-enders', 'Wide spread']));
C.push(spacer(40));

C.push(subHead('Birds handled (record count / number examined)'));
C.push(blankGridTable(
  ['Sign / observation', '# affected', '# examined', 'Notes'],
  [3560, 1400, 1400, 3000], 1));
C.push(checkGrid([
  'Body condition / fleshing adequate',
  'Feather cover normal for age',
  'Hydration good (skin, eyes, feet)',
  'Crop fill / gut fill appropriate',
  'Vent clean, no pasting or staining',
  'No swollen heads / sinuses',
  'Eyes clear, no discharge or foam',
  'Nostrils clear, no discharge',
], 2));
C.push(spacer(30));

C.push(subHead('Legs, feet & mobility'));
C.push(options('Gait score sample (0-5):', ['0', '1', '2', '3', '4', '5', 'Not scored']));
C.push(options('Footpad (FPD) score (0-2):', ['0 none', '1 mild', '2 severe']));
C.push(options('Hock burn:', ['None', 'Mild', 'Severe']));
C.push(checkGrid([
  'Few / no visibly lame birds',
  'No swollen hocks or joints',
  'No twisted legs / valgus-varus',
  'Footpads intact (no ulcers)',
  'Birds move off readily when approached',
  'No birds stuck / down / unable to reach feed',
], 2));
C.push(hint('Scoring systems vary. Record which system you used (for example gait score 0-5, FPD 0-2) so results compare between visits.'));
C.push(spacer(30));

C.push(subHead('Respiratory'));
C.push(checkGrid([
  'No sneezing / coughing heard',
  'No rales (rattly breathing) on a quiet listen',
  'No gasping or open-mouth breathing',
  'No head shaking / nasal discharge',
  'No swollen sinuses or faces',
  'No watery or foamy eyes',
], 2));
C.push(spacer(20));

C.push(subHead('Droppings & gut health'));
C.push(options('Droppings:', ['Normal + cecal', 'Wet / watery', 'Mucoid', 'Blood', 'Undigested feed', 'Orange / foamy']));
C.push(checkGrid([
  'Litter under birds consistent with normal droppings',
  'No widespread wet / loose droppings',
  'No blood or heavy mucus noted',
  'Vent feathers clean (no pasting)',
], 2));
C.push(spacer(20));

C.push(subHead('Skin, eyes & behavior'));
C.push(checkGrid([
  'No pecking injuries / cannibalism',
  'No feather loss beyond normal for age',
  'No scabs / pox-type lesions',
  'No scratches or skin tears on handling',
  'No nervous signs (tremor, twisted neck, paralysis)',
  'No lameness cluster suggesting infection',
], 2));
C.push(spacer(20));

C.push(subHead('Culls & sick birds'));
C.push(kv2Table(['No. of culls today', '', 'Sick / hospital pen used', '']));
C.push(options('Cull management:', ['Prompt and humane', 'Delayed', 'Needs review']));
C.push(spacer(30));

C.push(subHead('Type-specific checks (complete the relevant block)'));
C.push(para([run('Layers / breeders:  ', { bold: true, size: 20 })]));
C.push(checkGrid([
  'Egg production on target for age',
  'Shell / egg quality acceptable',
  'No unexplained production drop',
  'Nest boxes used (few floor eggs)',
  'No prolapse / vent pecking cluster',
  'Feather cover consistent with lay stage',
], 2));
C.push(para([run('Broilers / turkeys:  ', { bold: true, size: 20 })]));
C.push(checkGrid([
  'Growth on track, good fleshing',
  'No ascites / sudden death cluster',
  'Leg strength good for weight',
  'No heat stress signs (panting, spreading)',
], 2));
C.push(spacer(40));
C.push(writeBox('Flock health notes (what you saw, where, how many):', 4));

// ============================================================
// 7 — MORTALITY & POST-MORTEM (VETERINARIAN)
// ============================================================
C.push(sectionBar(7, 'Mortality & Post-Mortem (Veterinarian)'));
C.push(hint('Post-mortem examination and interpretation are the veterinarian’s role. Record gross findings by system and note samples taken.'));
C.push(kv2Table(['Birds examined post-mortem', '', 'Fresh dead / culled / found dead', '']));
C.push(spacer(30));
C.push(subHead('Gross findings by system'));
C.push(kv1Table([
  'Respiratory (trachea, air sacs, lungs)',
  'Digestive (crop, proventriculus, gut, ceca)',
  'Liver / spleen',
  'Kidneys / urate',
  'Heart / pericardium',
  'Reproductive (ovary, oviduct)',
  'Musculoskeletal (joints, bone, muscle)',
  'Skin / integument',
  'Nervous (brain, nerves)',
]));
C.push(spacer(40));
C.push(subHead('Differential considerations / working assessment'));
C.push(writeBox('Most likely causes to explain the picture (records + flock signs + lesions):', 3));
C.push(spacer(30));
C.push(subHead('Samples collected for the laboratory'));
C.push(blankGridTable(
  ['Sample / tissue', 'Site or bird', 'Test requested', 'Lab / date sent'],
  [2340, 2340, 2340, 2340], 4));
C.push(spacer(50));

// ============================================================
// 8 — EQUIPMENT & INFRASTRUCTURE
// ============================================================
C.push(sectionBar(8, 'Equipment & Infrastructure'));
C.push(checkGrid([
  'Ventilation fans clean and running to program',
  'Air inlets / tunnel doors operating freely',
  'Evaporative cooling / foggers working (if fitted)',
  'Controller and sensors reading accurately',
  'High / low temperature alarm tested',
  'Standby generator present and test-run',
  'Heating system serviced and safe',
  'Feed system (augers, bins) sound, no leaks',
  'Water regulators, filters, medicator serviced',
  'Lighting system / dimmers working',
  'Nest boxes / slats / perches sound (if fitted)',
  'Manure belts / scrapers / pit managed (if fitted)',
  'Emergency backup / power failure plan in place',
  'Spare parts and basic tools on hand',
], 2));
C.push(kv2Table(['Last generator test date', '', 'Alarm last verified', '']));
C.push(spacer(40));
C.push(writeBox('Equipment notes and repairs needed:', 3));

// ============================================================
// 9 — SUMMARY OF FINDINGS & RECOMMENDATIONS
// ============================================================
C.push(sectionBar(9, 'Summary of Findings & Recommendations'));
C.push(hint('This section becomes the heart of the client report. Prioritize actions so the grower knows what to fix first.'));
C.push(options('Overall flock health status:', ['Good', 'Fair', 'Poor', 'Critical']));
C.push(spacer(30));
C.push(subHead('What is going well'));
C.push(writeBox('Strengths worth noting to the grower:', 2));
C.push(spacer(30));
C.push(subHead('Priority findings & recommended actions'));
C.push(hint('Priority: Urgent = act now / today. Soon = before next placement or within days. Monitor = watch and reassess.'));
C.push(blankGridTable(
  ['Priority', 'Finding / observation', 'Recommended action', 'Who', 'By when'],
  [1200, 2760, 3000, 1200, 1200], 6));
C.push(spacer(50));
C.push(subHead('Immediate actions agreed on the day'));
C.push(writeBox('Actions started or agreed with the grower during the visit:', 2));
C.push(spacer(30));
C.push(subHead('Follow-up plan'));
C.push(kv2Table([
  'Samples / results pending', 'Expected date',
  'Next visit / recheck date', 'Report to follow by',
]));
C.push(spacer(50));

// ============================================================
// 10 — SIGN-OFF
// ============================================================
C.push(sectionBar(10, 'Sign-Off'));
C.push(kv2Table([
  'Veterinarian (print)', 'License no.',
  'Signature', 'Date',
  'Grower / manager (print)', 'Received a copy',
  'Signature', 'Date',
]));
C.push(spacer(40));
C.push(options('Written report to follow:', ['Yes', 'No', 'Verbal only requested']));

// ============================================================
// APPENDIX — QUICK REFERENCE TARGETS
// ============================================================
C.push(new Paragraph({ children: [], pageBreakBefore: true, spacing: { after: 0 } }));
C.push(sectionBar('A', 'Quick Reference: Target Guides & Scoring'));
C.push(hint('General field reference only. Targets change with breed, age, season, and the flock’s own management guide. Always confirm against the current Ross, Cobb, Lohmann, Hy-Line, or NFACC standard for the flock in front of you.'));

C.push(subHead('Environment targets'));
C.push(refTable(['Parameter', 'Target guide'], [3400, 5960], [
  ['Brooding temperature (day 0-2)', 'About 32-34 C at bird level; ease down as chicks feather'],
  ['Relative humidity', '60-70% brooding, 50-60% grow-out'],
  ['Ammonia (NH3)', 'Target under 15 ppm; investigate above 20; harmful above 25'],
  ['Carbon dioxide (CO2)', 'Keep under 3,000 ppm'],
  ['Light (brooding, early days)', 'At least 20 lux so chicks find feed (NFACC: first 3 days)'],
  ['Dark period', 'At least 4 continuous hours per 24 h (NFACC minimum; many give 6+)'],
  ['Water:feed ratio', 'About 1.7-1.8:1 at normal temperature; rises in heat'],
  ['Water temperature at drinker', 'About 10-14 C'],
  ['Water pH', 'About 6.0-8.0'],
  ['Litter moisture', 'About 20-25%'],
  ['Stocking density (broiler, NFACC)', 'Up to 31 kg/m2 conventional; up to 38 kg/m2 enhanced'],
]));
C.push(spacer(40));

C.push(subHead('Scoring scales (record which system you used)'));
C.push(refTable(['Scale', 'Range', 'Quick meaning'], [2500, 1700, 5160], [
  ['Gait score', '0 to 5', '0 = walks normally; 3 = clear lameness; 5 = cannot walk. Score a sample and record the spread.'],
  ['Footpad (FPD)', '0 to 2', '0 = clean pad; 1 = mild or superficial; 2 = severe ulceration. Some programs use 0 to 4.'],
  ['Hock burn', 'None to severe', 'Discoloration or lesion on the back of the hock from wet litter.'],
  ['Litter score', '0 to 4', '0 = dry and friable; 4 = wet and caked. Welfare Quality scale (other systems use 0-10 or 1-10). Higher scores drive footpad and hock lesions.'],
  ['Droppings', 'Describe', 'Normal formed plus periodic cecal. Note wet, mucoid, bloody, orange, or undigested feed.'],
]));
C.push(spacer(40));

C.push(subHead('Mortality prompts to investigate'));
C.push(check('Daily mortality doubles day-over-day, or climbs above the flock’s own running baseline for age.'));
C.push(check('A sudden spike, or deaths clustered in one room, one age, or one area.'));
C.push(check('Water or feed intake drops before, or alongside, a rise in mortality.'));
C.push(check('First-week mortality running higher than the breed target (chick quality, brooding, or navel / yolk issues).'));
C.push(hint('Breed targets differ. Read every number against the standard for that flock, not a single universal figure.'));

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const doc = new Document({
  sections: [{
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: C,
  }],
});

fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));
console.log('Checklist written to', OUT_FILE);
console.log('File size:', fs.statSync(OUT_FILE).size, 'bytes');

// POST-BUILD PATCH: strip w:dirty, updateFields=false, dash check
const zip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));
let xml = await zip.file('word/document.xml').async('string');
xml = xml.replace(/\sw:dirty="true"/g, '');
zip.file('word/document.xml', xml);
let settings = await zip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
if (!settings.includes('w:updateFields')) settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
zip.file('word/settings.xml', settings);
const patched = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
const emDashes = (xml.match(/—/g) || []).length;
console.log('Em dashes (must be 0):', emDashes);
console.log('Done:', OUT_FILE);
