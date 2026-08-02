// ============================================================
// generate-daily-barn-checklist.mjs
// Daily Barn Visit Checklist (farmer-friendly)
// CPC Short Courses
// Run: node generate-daily-barn-checklist.mjs
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
const OUT_DIR   = path.join(__dirname, 'Farmer Checklists');
const OUT_FILE  = path.join(OUT_DIR, 'Daily_Barn_Visit_Checklist.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const MED_BLUE  = '2E74B5';   // CPC blue
const DARK_BLUE = '1F3864';
const GOLD      = 'C9A84C';    // CPC gold
const BODY      = '3C3C3C';
const GRAY      = '888888';
const LABEL_BG  = 'EAF1FA';
const HDR_BG    = '2E74B5';
const ALT_BG    = 'F5F8FC';
const CONTENT_W = 9792;        // 0.85" side margins on Letter

const TITLE     = 'DAILY BARN VISIT CHECKLIST';
const HDR_TITLE = 'Daily Barn Visit';
const FTR_TITLE = 'Daily Barn Visit Checklist';

// ---------- text helpers ----------
function run(text, o = {}) {
  return new TextRun({ text, bold: o.bold || false, italics: o.italics || false, color: o.color || BODY, size: o.size || 21, font: o.font || 'Calibri' });
}
function box(size = 21) { return new TextRun({ text: '☐  ', font: 'Segoe UI Symbol', size, color: BODY }); }

function sectionBar(title) {
  return new Paragraph({
    children: [new TextRun({ text: title, bold: true, color: 'FFFFFF', size: 24, font: 'Calibri' })],
    shading: { type: ShadingType.SOLID, color: HDR_BG },
    keepNext: true, keepLines: true,
    spacing: { before: 150, after: 80 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      left: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
      right: { style: BorderStyle.SINGLE, size: 2, color: HDR_BG, space: 4 },
    },
  });
}
function subHead(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
    keepNext: true, keepLines: true,
    spacing: { before: 110, after: 55 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  });
}
function hint(text) {
  return new Paragraph({ children: [new TextRun({ text, italics: true, color: GRAY, size: 18, font: 'Calibri' })], keepNext: true, spacing: { after: 90 } });
}
function para(text, o = {}) {
  return new Paragraph({ children: Array.isArray(text) ? text : [run(text, o)], spacing: { after: o.after !== undefined ? o.after : 100, line: 264, lineRule: 'auto' } });
}
function options(label, arr, o = {}) {
  const children = [];
  if (label) children.push(run(label + '   ', { bold: true, size: 20 }));
  arr.forEach(opt => { children.push(box(20)); children.push(run(opt + '     ', { size: 20 })); });
  return new Paragraph({ children, spacing: { after: o.after !== undefined ? o.after : 60 }, indent: { left: convertInchesToTwip(0.06) } });
}
function spacer(after = 70) { return new Paragraph({ spacing: { after }, children: [] }); }

// ---------- table helpers ----------
const thinBdr = { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' };
const cellBdr = { top: thinBdr, bottom: thinBdr, left: thinBdr, right: thinBdr };

function labelCell(text, w) {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, borders: cellBdr, shading: { type: ShadingType.SOLID, color: LABEL_BG }, margins: { top: 40, bottom: 40, left: 90, right: 90 },
    children: [new Paragraph({ children: [run(text, { bold: true, size: 20 })], spacing: { after: 0 } })] });
}
function blankCell(w) {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, borders: cellBdr, margins: { top: 40, bottom: 40, left: 90, right: 90 }, children: [new Paragraph({ spacing: { after: 0 } })] });
}
function kv2Table(pairs) {
  const W = [1980, 2916, 1980, 2916];
  const rows = [];
  for (let i = 0; i < pairs.length; i += 2)
    rows.push(new TableRow({ cantSplit: true, height: { value: 360, rule: HeightRule.ATLEAST }, children: [labelCell(pairs[i], W[0]), blankCell(W[1]), labelCell(pairs[i + 1] || '', W[2]), blankCell(W[3])] }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}
function kv1Table(labels) {
  const W = [2600, 7192];
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: labels.map(l => new TableRow({ cantSplit: true, height: { value: 360, rule: HeightRule.ATLEAST }, children: [labelCell(l, W[0]), blankCell(W[1])] })) });
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
      cells.push(new TableCell({ width: { size: w, type: WidthType.DXA }, borders: none, margins: { top: 18, bottom: 18, left: 30, right: 120 },
        children: [new Paragraph({ children: txt ? [box(20), run(txt, { size: 20 })] : [], spacing: { after: 0 } })] }));
    }
    rows.push(new TableRow({ cantSplit: true, children: cells }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}
function writeBox(label, lines = 2) {
  const inner = [new Paragraph({ children: [run(label, { bold: true, size: 20, color: MED_BLUE })], spacing: { after: 50 } })];
  for (let i = 0; i < lines; i++) inner.push(new Paragraph({ spacing: { after: 0, line: 340, lineRule: 'auto' }, children: [run('', {})] }));
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: GOLD };
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ cantSplit: true, children: [new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, borders: { top: bdr, bottom: bdr, left: bdr, right: bdr }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: inner })] })] });
}

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

// ============================================================
// CONTENT
// ============================================================
const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
const C = [];

// cover block
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: 'CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })] }));
if (logoBuffer) C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new ImageRun({ data: logoBuffer, transformation: { width: 90, height: 90 }, type: 'png' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: TITLE, bold: true, color: DARK_BLUE, size: 40, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Your Every-Day Walk-Through', italics: true, color: MED_BLUE, size: 24, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 90 }, children: [new TextRun({ text: '___________________________________', color: GOLD, size: 22, font: 'Calibri' })] }));
C.push(para('Walk your barn the same way every day. The birds tell you what they need before any gauge does. Catching a small problem on your morning walk is what keeps it from turning into a big one. This walk covers the T-FLAWS checkpoints: Temperature, Feed, Light, Air, Water, and Sanitation. Tick what you check, note anything off, and fix what you can before you leave.', { after: 60 }));

// TODAY'S NUMBERS
C.push(sectionBar("Today's Numbers"));
C.push(kv2Table([
  'Date', 'Flock day (age)',
  'Barn / house', 'Weather today',
  'Dead birds today', 'Running total dead',
  'Feed used', 'Water used',
  'Overnight low temp', 'Daytime high temp',
]));
C.push(options('Water use vs yesterday:', ['About the same', 'Up', 'Down'], { after: 40 }));
C.push(hint('Water is your earliest warning. A sudden drop or jump means something changed. Find out what.'));

// WATCH THE BIRDS
C.push(sectionBar('Watch the Birds First'));
C.push(hint('Stand still for a minute when you walk in. Let the birds settle and just watch them before you touch anything.'));
C.push(checkGrid([
  'Birds active, spread out, and busy',
  'Eating and drinking normally',
  'No birds off on their own or not moving',
  'No piling in corners',
  'No droopy, ruffled, or hunched birds',
  'Birds move away easily as you walk',
], 2));
C.push(subHead('Listen and look closer'));
C.push(checkGrid([
  'No sneezing, coughing, or snicking',
  'No rattly or open-mouth breathing',
  'No swollen or watery eyes / faces',
  'No lame birds or sore feet',
  'No pecking wounds or injuries',
  'Droppings look normal (firm, with cecal)',
], 2));
C.push(options('Birds to cull today:', ['None', 'A few (pull and record)'], { after: 40 }));
C.push(hint('Pull weak, injured, or sick birds promptly and humanely. Write down how many, it tells a story over the week.'));

// THE ENVIRONMENT WALK
C.push(sectionBar('Walk the Barn: Air, Heat, Water, Feed, Light, Litter'));

C.push(subHead('Air'));
C.push(checkGrid([
  'No sharp ammonia sting in your eyes or nose',
  'Air does not feel stuffy, damp, or dusty',
  'Fans running as they should',
  'Inlets open and air moving right',
  'No draft blowing straight onto the birds',
  'No moldy or sour smell',
], 2));

C.push(subHead('Heat / comfort'));
C.push(options('How are the birds sitting?', ['Spread evenly (just right)', 'Huddled (too cold)', 'Panting / against the walls (too hot)'], { after: 40 }));
C.push(checkGrid([
  'Bird-level temperature on target for their age',
  'Heaters or brooders working',
  'Heat even across the barn, no cold ends',
], 2));

C.push(subHead('Water'));
C.push(checkGrid([
  'Every drinker working, none stuck',
  'Water clean and cool (press a nipple and feel)',
  'No leaks or wet litter under the lines',
  'Drinker height right for the birds',
], 2));

C.push(subHead('Feed'));
C.push(checkGrid([
  'Feed in every feeder, none empty or jammed',
  'Feed fresh, no mold, crust, or off smell',
  'Feeders at the right height for the birds',
  'Feed getting eaten (pans not sitting full)',
], 2));

C.push(subHead('Light'));
C.push(checkGrid([
  'Lights on the right schedule and bright enough',
  'Birds get a real dark period to rest',
  'No bulbs out and no dark corners birds avoid',
], 2));

C.push(subHead('Litter and floor'));
C.push(checkGrid([
  'Litter dry and loose underfoot',
  'No wet spots or caking, check under drinkers',
  'No unusual buildup or smell',
], 2));

// BEFORE YOU LEAVE
C.push(sectionBar('Before You Leave'));
C.push(checkGrid([
  'Fixed anything you could right now',
  'Equipment and alarms all working',
], 2));
C.push(spacer(30));
C.push(writeBox('What needs attention (and what you already did about it):', 2));
C.push(spacer(30));
C.push(options('Anything worrying you?', ['No, all good', 'Yes, calling my service tech / veterinarian'], { after: 40 }));
C.push(hint('When something looks wrong and you are not sure, call early. Your service technician or veterinarian would rather hear from you today than next week.'));
C.push(spacer(20));
C.push(kv2Table(['Walk done by', 'Time']));

// ============================================================
// ASSEMBLY + PATCH
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const doc = new Document({ sections: [{ properties: { page: { margin: pageMargin } }, headers: { default: buildHeader() }, footers: { default: buildFooter() }, children: C }] });
fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));
console.log('Written:', OUT_FILE, fs.statSync(OUT_FILE).size, 'bytes');

const zip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));
let xml = await zip.file('word/document.xml').async('string');
xml = xml.replace(/\sw:dirty="true"/g, '');
zip.file('word/document.xml', xml);
let settings = await zip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
if (!settings.includes('w:updateFields')) settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
zip.file('word/settings.xml', settings);
fs.writeFileSync(OUT_FILE, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log('Em dashes (0):', (xml.match(/—/g) || []).length, '| en (0):', (xml.match(/–/g) || []).length);
console.log('Done:', OUT_FILE);
