// ============================================================
// generate-farm-visit-checklist-rapid.mjs
// Poultry Farm Visit Checklist — RAPID / routine version
// Abbotsford Veterinary Clinic
// A short 2-page form for routine barn visits (the essentials).
// Run: node generate-farm-visit-checklist-rapid.mjs
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

const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR      = path.join(__dirname, 'Farm Visit Checklist');
const OUT_FILE     = path.join(OUT_DIR, 'Poultry_Farm_Visit_Checklist_Rapid.docx');
const LOGO_PATH    = path.join(__dirname, 'Abbvet Logo-1.png');
const TAGLINE_PATH = path.join(__dirname, 'Abbvet Logo-2.png');

const MED_BLUE  = '2E6699';   // clinic blue
const DARK_BLUE = '1F4E79';
const GREEN     = '6EBF4D';    // clinic green
const BODY      = '3C3C3C';
const GRAY      = '888888';
const LABEL_BG  = 'EDF2F9';
const HDR_BG    = '2E6699';
const ALT_BG    = 'F5F8FC';
const CONTENT_W = 9600;

// ---------- text helpers ----------
function run(text, o = {}) {
  return new TextRun({ text, bold: o.bold || false, italics: o.italics || false, color: o.color || BODY, size: o.size || 20, font: o.font || 'Calibri' });
}
function box(size = 20) { return new TextRun({ text: '☐  ', font: 'Segoe UI Symbol', size, color: BODY }); }

function sectionBar(num, title) {
  return new Paragraph({
    children: [ new TextRun({ text: `${num}.  ${title}`, bold: true, color: 'FFFFFF', size: 22, font: 'Calibri' }) ],
    shading: { type: ShadingType.SOLID, color: HDR_BG },
    spacing: { before: 150, after: 90 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 3 },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 3 },
      left: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 3 },
      right: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 3 },
    },
  });
}
function hint(text) {
  return new Paragraph({ children: [new TextRun({ text, italics: true, color: GRAY, size: 17, font: 'Calibri' })], spacing: { after: 70 } });
}
function options(label, arr, o = {}) {
  const children = [];
  if (label) children.push(run(label + '   ', { bold: true, size: 19 }));
  arr.forEach(opt => { children.push(box(19)); children.push(run(opt + '     ', { size: 19 })); });
  return new Paragraph({ children, spacing: { after: o.after !== undefined ? o.after : 60 }, indent: { left: convertInchesToTwip(0.06) } });
}
function spacer(after = 70) { return new Paragraph({ spacing: { after }, children: [] }); }

// ---------- table helpers ----------
const thinBdr = { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' };
const cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };

function labelCell(text, w) {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: LABEL_BG }, margins: { top: 30, bottom: 30, left: 80, right: 80 },
    children: [new Paragraph({ children: [run(text, { bold: true, size: 18 })], spacing: { after: 0 } })] });
}
function blankCell(w) {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, borders: cellBdr, margins: { top: 30, bottom: 30, left: 80, right: 80 }, children: [new Paragraph({ spacing: { after: 0 } })] });
}
function kv2Table(pairs) {
  const W = [1900, 2900, 1900, 2900];
  const rows = [];
  for (let i = 0; i < pairs.length; i += 2) {
    rows.push(new TableRow({ height: { value: 330, rule: HeightRule.ATLEAST }, children: [labelCell(pairs[i], W[0]), blankCell(W[1]), labelCell(pairs[i + 1] || '', W[2]), blankCell(W[3])] }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

// Readings: Parameter | Reading | Target | OK
function readingsTable(rows) {
  const W = [3100, 1700, 3600, 1200];
  const hdr = (t, i) => new TableCell({ width: { size: W[i], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: HDR_BG }, margins: { top: 30, bottom: 30, left: 80, right: 80 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(t, { bold: true, size: 17, color: 'FFFFFF' })], spacing: { after: 0 } })] });
  const body = rows.map((r, ri) => new TableRow({ height: { value: 300, rule: HeightRule.ATLEAST }, children: [
    new TableCell({ width: { size: W[0], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 28, bottom: 28, left: 80, right: 80 }, children: [new Paragraph({ children: [run(r[0], { size: 17, bold: true })], spacing: { after: 0 } })] }),
    new TableCell({ width: { size: W[1], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 28, bottom: 28, left: 80, right: 80 }, children: [new Paragraph({ spacing: { after: 0 } })] }),
    new TableCell({ width: { size: W[2], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 28, bottom: 28, left: 80, right: 80 }, children: [new Paragraph({ children: [run(r[1], { size: 16, color: GRAY })], spacing: { after: 0 } })] }),
    new TableCell({ width: { size: W[3], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: ri % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 28, bottom: 28, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Y  /  N', size: 15, color: 'B0B0B0', font: 'Calibri' })], spacing: { after: 0 } })] }),
  ] }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ tableHeader: true, children: ['Parameter', 'Reading', 'Target guide', 'OK?'].map(hdr) }), ...body] });
}

function checkGrid(items, cols = 2) {
  const noBdr = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const none = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };
  const w = Math.floor(CONTENT_W / cols);
  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    const cells = [];
    for (let c = 0; c < cols; c++) {
      const txt = items[i + c];
      cells.push(new TableCell({ width: { size: w, type: WidthType.DXA }, borders: none, margins: { top: 14, bottom: 14, left: 30, right: 100 },
        children: [new Paragraph({ children: txt ? [box(18), run(txt, { size: 18 })] : [], spacing: { after: 0 } })] }));
    }
    rows.push(new TableRow({ children: cells }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function blankGridTable(headers, widths, nRows) {
  const hdr = (t, i) => new TableCell({ width: { size: widths[i], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: HDR_BG }, margins: { top: 30, bottom: 30, left: 70, right: 70 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(t, { bold: true, size: 16, color: 'FFFFFF' })], spacing: { after: 0 } })] });
  const rows = [new TableRow({ tableHeader: true, children: headers.map(hdr) })];
  for (let r = 0; r < nRows; r++) {
    rows.push(new TableRow({ height: { value: 360, rule: HeightRule.ATLEAST }, children: headers.map((_, i) => new TableCell({ width: { size: widths[i], type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: r % 2 ? ALT_BG : 'FFFFFF' }, margins: { top: 30, bottom: 30, left: 70, right: 70 }, children: [new Paragraph({ spacing: { after: 0 } })] })) }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function writeBox(label, lines = 2) {
  const inner = [new Paragraph({ children: [run(label, { bold: true, size: 18, color: MED_BLUE })], spacing: { after: 40 } })];
  for (let i = 0; i < lines; i++) inner.push(new Paragraph({ spacing: { after: 0, line: 320, lineRule: 'auto' }, children: [run('', {})] }));
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: GREEN };
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, borders: { top: bdr, bottom: bdr, left: bdr, right: bdr }, margins: { top: 60, bottom: 60, left: 110, right: 110 }, children: inner })] })] });
}

// ---------- header / footer ----------
function buildHeader() {
  return new Header({ children: [new Paragraph({
    children: [ new TextRun({ text: 'Abbotsford Veterinary Clinic  |  ', color: GRAY, size: 17, font: 'Calibri' }), new TextRun({ text: 'Rapid Farm Visit Checklist', bold: true, color: MED_BLUE, size: 17, font: 'Calibri' }) ],
    alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GREEN } },
  })] });
}
function buildFooter() {
  return new Footer({ children: [new Paragraph({
    children: [ new TextRun({ text: 'Routine Walkthrough Essentials  |  Page ', color: GRAY, size: 17, font: 'Calibri' }), new TextRun({ children: [PageNumber.CURRENT], color: GRAY, size: 17, font: 'Calibri' }), new TextRun({ text: ' of ', color: GRAY, size: 17, font: 'Calibri' }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: GRAY, size: 17, font: 'Calibri' }) ],
    alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: GREEN } },
  })] });
}
const pageMargin = { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.85), right: convertInchesToTwip(0.85) };

// ============================================================
// CONTENT
// ============================================================
const logoBuffer    = fs.existsSync(LOGO_PATH)    ? fs.readFileSync(LOGO_PATH)    : null;
const taglineBuffer = fs.existsSync(TAGLINE_PATH) ? fs.readFileSync(TAGLINE_PATH) : null;
const C = [];

// compact branded top block
if (logoBuffer) {
  C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new ImageRun({ data: logoBuffer, transformation: { width: 210, height: 57 }, type: 'png' })] }));
}
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [new TextRun({ text: 'RAPID POULTRY FARM VISIT CHECKLIST', bold: true, color: DARK_BLUE, size: 30, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: 'Routine Walkthrough Essentials', italics: true, color: MED_BLUE, size: 20, font: 'Calibri' })] }));
if (taglineBuffer) {
  C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new ImageRun({ data: taglineBuffer, transformation: { width: 150, height: 34 }, type: 'png' })] }));
}
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 90 }, children: [run('For routine visits. Tick what applies, record readings and counts, note anything off in the boxes. Use the full checklist for a health investigation or first visit.', { italics: true, color: GRAY, size: 17 })] }));

// ID line
C.push(kv2Table([
  'Farm / premises', 'Visit date',
  'Attending veterinarian', 'Barn / house',
  'Bird type & age', 'Flock / lot no.',
  'Current bird count', 'Cumulative mortality %',
]));

// 1. Records snapshot
C.push(sectionBar(1, 'Records Snapshot'));
C.push(hint('The daily numbers first. They flag trouble before the birds show it.'));
C.push(options('Mortality trend:', ['Stable / low', 'Rising', 'Spike', 'Uneven between rooms']));
C.push(readingsTable([
  ['Mortality (last 24 h / cumulative)', 'Against breed target for age'],
  ['Feed intake vs target', 'Against management guide for age'],
  ['Water intake vs target', 'Sudden change = investigate'],
  ['Water:feed ratio', 'About 1.7-1.8:1 at normal temp'],
  ['Average body weight', 'Against breed standard for age'],
  ['Uniformity (CV %)', 'Lower is better; high = a problem'],
]));

// 2. Environment quick scan
C.push(sectionBar(2, 'Environment Quick Scan'));
C.push(hint('Readings at bird level: temperature, feed, light, air, water, sanitation and space.'));
C.push(readingsTable([
  ['Temperature at bird level', 'Breed target for age'],
  ['Ammonia (NH3)', 'Under 15 ppm; act above 20'],
  ['Carbon dioxide (CO2)', 'Under 3,000 ppm'],
  ['Relative humidity', '60-70% brooding; 50-60% grow-out'],
  ['Litter moisture / condition', 'Dry and friable, about 20-25%'],
  ['Light at bird level', 'Even and to program; dark period given'],
]));
C.push(spacer(50));
C.push(checkGrid([
  'Birds evenly spread (not huddled or panting)',
  'No ammonia sting at bird level',
  'Fans and inlets running to program',
  'Litter dry, no wet spots or caking',
  'Feed present in all lines, fresh',
  'Drinkers clean, no leaks under lines',
  'Water flow correct for age, not warm',
  'Stocking density fine for age',
], 2));

// 3. Flock & birds
C.push(sectionBar(3, 'Flock & Birds (quick walk)'));
C.push(hint('Walk quietly first, then handle a few birds. Note counts out of the number checked.'));
C.push(options('Activity:', ['Bright, active', 'Mixed', 'Dull / lethargic']));
C.push(spacer(30));
C.push(checkGrid([
  'Distribution even (no piling or dead spots)',
  'Body condition and feather cover good for age',
  'No respiratory signs (sneezing, rales, gasping)',
  'Eyes and nostrils clear, no swollen heads',
  'Droppings normal (no wet, blood, undigested feed)',
  'Few or no lame birds; footpads intact',
  'No pecking, cannibalism, or skin lesions',
  'No nervous signs (tremor, twisted neck, paralysis)',
  'Culls handled promptly and humanely',
  'Feed and water within reach of all birds',
], 2));
C.push(spacer(40));
C.push(writeBox('Anything abnormal (what, where, how many):', 2));

// 4. Findings & actions
C.push(sectionBar(4, 'Findings & Actions'));
C.push(options('Overall flock status:', ['Good', 'Fair', 'Poor', 'Critical']));
C.push(spacer(30));
C.push(blankGridTable(['Priority', 'Finding / observation', 'Action', 'By when'], [1300, 3700, 3200, 1400], 4));
C.push(hint('Priority: Urgent = today. Soon = within days / before next placement. Monitor = watch and recheck.'));
C.push(spacer(30));
C.push(kv2Table([
  'Next visit / recheck', 'Report to follow by',
  'Veterinarian', 'Date',
  'Grower / manager', 'Received a copy',
]));

// ============================================================
// ASSEMBLY
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const doc = new Document({ sections: [{ properties: { page: { margin: pageMargin } }, headers: { default: buildHeader() }, footers: { default: buildFooter() }, children: C }] });
fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));
console.log('Rapid checklist written:', OUT_FILE, fs.statSync(OUT_FILE).size, 'bytes');

// post-build patch
const zip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));
let xml = await zip.file('word/document.xml').async('string');
xml = xml.replace(/\sw:dirty="true"/g, '');
zip.file('word/document.xml', xml);
let settings = await zip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
if (!settings.includes('w:updateFields')) settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
zip.file('word/settings.xml', settings);
fs.writeFileSync(OUT_FILE, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log('Em dashes (must be 0):', (xml.match(/—/g) || []).length);
console.log('Done:', OUT_FILE);
