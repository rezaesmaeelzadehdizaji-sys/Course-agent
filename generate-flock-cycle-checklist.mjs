// ============================================================
// generate-flock-cycle-checklist.mjs
// Flock Cycle Checklist (farmer-friendly):
// Pre-Placement, Placement, Pre-Shipment, Ship Day
// CPC Short Courses
// Run: node generate-flock-cycle-checklist.mjs
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
const OUT_FILE  = path.join(OUT_DIR, 'Flock_Cycle_Checklist.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const MED_BLUE  = '2E74B5';
const DARK_BLUE = '1F3864';
const GOLD      = 'C9A84C';
const BODY      = '3C3C3C';
const GRAY      = '888888';
const LABEL_BG  = 'EAF1FA';
const HDR_BG    = '2E74B5';
const CONTENT_W = 9792;

const TITLE     = 'FLOCK CYCLE CHECKLIST';
const HDR_TITLE = 'Flock Cycle';
const FTR_TITLE = 'Flock Cycle Checklist';

// ---------- text helpers ----------
function run(text, o = {}) {
  return new TextRun({ text, bold: o.bold || false, italics: o.italics || false, color: o.color || BODY, size: o.size || 21, font: o.font || 'Calibri' });
}
function box(size = 21) { return new TextRun({ text: '☐  ', font: 'Segoe UI Symbol', size, color: BODY }); }

function sectionBar(num, title) {
  return new Paragraph({
    children: [new TextRun({ text: `Stage ${num}:  ${title}`, bold: true, color: 'FFFFFF', size: 24, font: 'Calibri' })],
    shading: { type: ShadingType.SOLID, color: HDR_BG },
    keepNext: true, keepLines: true,
    spacing: { before: 160, after: 80 },
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
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Pre-Placement, Placement, Pre-Shipment, and Ship Day', italics: true, color: MED_BLUE, size: 23, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 90 }, children: [new TextRun({ text: '___________________________________', color: GOLD, size: 22, font: 'Calibri' })] }));
C.push(para('These are the milestone days that set up a whole flock. Get the barn right before the chicks come, start them well on placement day, and plan the finish so the birds ship clean and on target. Work through each stage in order. Temperatures are given in both Fahrenheit and Celsius. Confirm the exact targets against your breed guide and, for ship day, your processor.', { after: 60 }));

// ── STAGE 1: PRE-PLACEMENT ──────────────────────────────────
C.push(sectionBar(1, 'Pre-Placement (before the chicks arrive)'));
C.push(kv2Table(['Barn / house', 'Chicks due (date)', 'Breed / strain', 'Number expected']));
C.push(subHead('Clean barn and litter'));
C.push(checkGrid([
  'Barn washed, disinfected, and rested (downtime done)',
  'Fresh litter in at an even depth',
  'Floor preheated before the litter went in',
  'Barn sealed up, no gaps letting heat or pests in',
], 2));
C.push(subHead('Heat (this is the big one)'));
C.push(checkGrid([
  'Preheat started early: 48 hours ahead in cold weather, 24 in warm',
  'Air about 90°F (32°C) at placement',
  'Floor at least 86°F (30°C), warm to the hand',
  'Litter warm, about 82 to 86°F (28 to 30°C), not cold',
  'Humidity around 60 to 70%',
  'Chick-level heat under brooders 90 to 93°F (32 to 34°C)',
], 2));
C.push(hint('A cold floor is the hidden chick-killer. Chicks lose heat through their feet, so warm the floor and litter, not just the air. Check the floor with your hand or a probe, do not trust the wall thermostat alone.'));
C.push(subHead('Water'));
C.push(checkGrid([
  'Lines flushed and biofilm cleaned out between flocks',
  'Water cool, clean, and sanitizer set',
  'Drinkers lowered to chick height and primed',
  'Enough drinker access for the whole placement',
], 2));
C.push(subHead('Feed'));
C.push(checkGrid([
  'Correct starter feed in the bin',
  'Feed on paper or trays where the chicks will land',
  'Supplemental feeders and paper in place',
  'Feed fresh, no old feed left from last flock',
], 2));
C.push(subHead('Air, light, and equipment'));
C.push(checkGrid([
  'Minimum ventilation set and test-run',
  'Lights bright for arrival (about 50 to 100 lux for the first week)',
  'Heaters, alarms, and backup generator tested',
  'Biosecurity ready: footbath, boots, clean entry',
  'Placement plan and record sheets ready',
  'Everyone knows their job for arrival',
], 2));

// ── STAGE 2: PLACEMENT ──────────────────────────────────────
C.push(sectionBar(2, 'Placement (chick arrival day)'));
C.push(kv2Table(['Placement date', 'Chicks placed', 'Hatchery', 'Time chicks in']));
C.push(subHead('Getting chicks in'));
C.push(checkGrid([
  'Chicks look good: alert, dry, standing well, good navels',
  'Unloaded quickly, not left sitting in boxes',
  'Chicks spread evenly across the brooding area',
  'Dead-on-arrival and weak chicks counted and recorded',
], 2));
C.push(subHead('First few hours'));
C.push(checkGrid([
  'Chick-level temperature 90 to 93°F (32 to 34°C)',
  'Chicks finding feed and water quickly',
  'Water at the right height, clean and cool',
  'Feed easy to find on the paper',
  'Lights bright, long day so they find feed and water',
  'Humidity around 60 to 70%',
], 2));
C.push(subHead('Read the chicks'));
C.push(options('How are the chicks sitting?', ['Spread evenly (comfortable)', 'Huddled under heat (too cold)', 'Away from heat, panting (too hot)'], { after: 40 }));
C.push(hint('The chicks are your best thermometer. Spread evenly and chirping softly means the heat is right. Piled under the brooder means cold. Pushed to the walls and panting means hot. Adjust, then check again in an hour.'));
C.push(checkGrid([
  'Crop check at 2 hours: about 3 in 4 chicks have a full, soft crop',
  'Crop check at 24 hours: nearly every chick has fed and drunk',
], 1));

// ── STAGE 3: PRE-SHIPMENT ───────────────────────────────────
C.push(sectionBar(3, 'Pre-Shipment (the days before catching)'));
C.push(kv2Table(['Planned ship date', 'Target weight', 'Catching crew booked', 'Trucks booked']));
C.push(checkGrid([
  'Ship date, weight, crew, and transport all confirmed',
  'Any medication withdrawal times are met and birds are clear',
  'Feed withdrawal timing planned with your processor',
  'Barn getting ready for catching (clutter cleared)',
  'Plan set for raising or removing feeders and drinkers',
  'Biosecurity briefing ready for the catching crew',
  'Final weights and records up to date',
  'Weather checked for catching and hauling day',
], 2));
C.push(hint('Confirm in writing that every treatment given this flock has cleared its withdrawal time before ship day. This is a food-safety must, not a maybe.'));

// ── STAGE 4: SHIP DAY ───────────────────────────────────────
C.push(sectionBar(4, 'Ship Day (catching and loading)'));
C.push(kv2Table(['Ship date', 'Load / start time', 'Birds to load', 'Processor']));
C.push(subHead('Feed and water'));
C.push(checkGrid([
  'Feed timed so guts are empty at processing (usually 8 to 12 hours total off feed, set with your processor)',
  'Water left available until just before catching starts',
], 1));
C.push(hint('Too little time off feed and the guts are full, which risks contamination at the plant. Too much (past about 12 hours) and birds lose weight and gut strength. Your processor sets the exact clock based on travel time.'));
C.push(subHead('Set up for calm catching'));
C.push(checkGrid([
  'Feeders and drinkers raised or removed',
  'Lights dimmed or switched to blue to keep birds calm',
  'Catching crew following your biosecurity',
  'Birds handled gently, right number per crate or module',
], 2));
C.push(subHead('Loading'));
C.push(checkGrid([
  'Loading density adjusted for the weather (fewer per crate in heat)',
  'Birds and trucks protected from heat, cold, and wind',
  'Loading steady, birds not left standing in full crates',
], 2));
C.push(subHead('Finish up'));
C.push(checkGrid([
  'Final counts done: loaded, culls, dead',
  'Paperwork complete: manifest and food-safety declaration',
  'Medication and withdrawal records handed over',
  'Barn cleared, cleanout started for the next flock',
], 2));
C.push(spacer(30));
C.push(writeBox('Notes for this flock (what to do differently next time):', 2));

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
console.log('Em dashes (0):', (xml.match(/—/g) || []).length, '| en (0):', (xml.match(/–/g) || []).length, '| °F count:', (xml.match(/°F/g) || []).length);
console.log('Done:', OUT_FILE);
