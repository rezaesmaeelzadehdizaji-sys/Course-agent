// ============================================================
// generate-audit-day-checklist.mjs
// Audit Day Checklist (farmer-friendly)
// CPC Short Courses
// Run: node generate-audit-day-checklist.mjs
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
const OUT_FILE  = path.join(OUT_DIR, 'Audit_Day_Checklist.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const MED_BLUE  = '2E74B5';
const DARK_BLUE = '1F3864';
const GOLD      = 'C9A84C';
const BODY      = '3C3C3C';
const GRAY      = '888888';
const LABEL_BG  = 'EAF1FA';
const HDR_BG    = '2E74B5';
const CONTENT_W = 9792;

const TITLE     = 'AUDIT DAY CHECKLIST';
const HDR_TITLE = 'Audit Day';
const FTR_TITLE = 'Audit Day Checklist';

// ---------- text helpers ----------
function run(text, o = {}) {
  return new TextRun({ text, bold: o.bold || false, italics: o.italics || false, color: o.color || BODY, size: o.size || 21, font: o.font || 'Calibri' });
}
function box(size = 21) { return new TextRun({ text: '☐  ', font: 'Segoe UI Symbol', size, color: BODY }); }

function sectionBar(num, title) {
  return new Paragraph({
    children: [new TextRun({ text: `${num}.  ${title}`, bold: true, color: 'FFFFFF', size: 24, font: 'Calibri' })],
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
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Get Ready for Your On-Farm Inspection', italics: true, color: MED_BLUE, size: 24, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 90 }, children: [new TextRun({ text: '___________________________________', color: GOLD, size: 22, font: 'Calibri' })] }));
C.push(para('An on-farm audit checks that you are doing what your food safety and animal care programs require, and that you can prove it with records. Most of an audit is paperwork and a barn walk. If your barn is run right every day and your records are in order, audit day is just showing your work. Get your records out and go through this list a few days ahead, then again the morning of.', { after: 90 }));
C.push(para([
  run('This list follows the '),
  run('Raised by a Canadian Farmer On-Farm Food Safety Program (OFFSP)', { bold: true }),
  run(' and '),
  run('Animal Care Program (ACP)', { bold: true }),
  run(' for chicken. Turkey, egg, and other sectors run their own equivalent programs, so check the one that applies to your farm. For the full picture, see Course 16 (Preparing for an Inspection Audit) and Course 17 (Regulatory Framework in Poultry Production) in this series.'),
], { after: 60 }));

// 1 — RECORDS
C.push(sectionBar(1, 'Records to Have Ready'));
C.push(hint('This is where most of the audit happens. Have these out and organized before the auditor arrives. If it is not written down, it did not happen as far as an audit is concerned.'));
C.push(checkGrid([
  'Flock records: placement, daily mortality, feed, water, weights',
  'Medication and treatment records (product, dose, dates, withdrawal)',
  'Vaccination records',
  'Feed records and delivery slips (source, medicated feed)',
  'Water test results and treatment records',
  'Cleaning and disinfection records between flocks',
  'Downtime records',
  'Dead bird disposal records',
  'Pest control records (bait station map and check dates)',
  'Visitor and entry log',
  'Training records (who is trained on the programs)',
  'Written procedures (SOPs) on hand',
  'Corrective actions from your last audit, closed out',
  'Manure management records',
], 2));

// 2 — FOOD SAFETY
C.push(sectionBar(2, 'Food Safety'));
C.push(checkGrid([
  'Medicated feed used to label or prescription, withdrawals recorded',
  'Water tested and treated, results on file',
  'Feed stored clean and dry, bins identified',
  'No expired or unlabeled medications or chemicals',
  'Medications and chemicals stored properly and separately',
  'Pest control program active with a current map',
  'Cleaning and disinfection done and recorded between flocks',
  'Dead bird handling sanitary and recorded',
  'Needle and sharps handling recorded (broken-needle policy)',
  'Only approved products used, nothing off-label without a script',
], 2));

// 3 — ANIMAL CARE
C.push(sectionBar(3, 'Animal Care'));
C.push(checkGrid([
  'Stocking density within your program limit',
  'Temperature, air (ammonia), and ventilation on target',
  'Lighting program run with a real dark period',
  'Feed and water within reach of all birds',
  'Daily flock monitoring written down',
  'Sick and injured birds managed and culled promptly',
  'Euthanasia method acceptable and staff trained',
  'Catching and handling done properly',
  'Emergency plan in place, alarms and backup generator tested',
  'Welfare looks good: few lame birds, clean footpads, good feather cover',
], 2));
C.push(hint('The daily monitoring records are what tie your animal care program together. Your Daily Barn Visit sheets are exactly the proof an auditor wants to see.'));

// 4 — BIOSECURITY
C.push(sectionBar(4, 'Biosecurity'));
C.push(checkGrid([
  'Restricted area / controlled access zone signed',
  'Anteroom or clear entry line, boot change',
  'Footbaths present and freshly charged',
  'Visitor protocol and log in use',
  'Vehicles and shared equipment cleaned',
  'Wild bird and rodent access controlled',
], 2));

// 5 — THE BARN WALK
C.push(sectionBar(5, 'The Barn Walk (what the auditor will see)'));
C.push(checkGrid([
  'Barn clean, tidy, and orderly',
  'Birds bright and in good condition',
  'Feed and water systems clean and working',
  'Litter dry and well managed',
  'Ventilation running right, air fresh',
  'Mortality collection area clean and managed',
  'No obvious food-safety or welfare problems',
  'Entry, footbath, and PPE ready for the auditor',
], 2));

// 6 — ON AUDIT DAY
C.push(sectionBar(6, 'On Audit Day'));
C.push(checkGrid([
  'Records organized and easy to find',
  'Someone available to walk the auditor through',
  'You know your numbers (mortality, medication, density)',
  'Barn entry and clean clothing ready for the auditor',
], 2));
C.push(hint('Be straight with the auditor. If something is not perfect, show them the corrective action you are already taking. Auditors trust a farmer who knows their own gaps far more than one who hides them.'));
C.push(spacer(30));
C.push(writeBox('Things to double-check or fix before the auditor arrives:', 2));

// 7 — AFTER THE AUDIT
C.push(sectionBar(7, 'After the Audit'));
C.push(checkGrid([
  'Went over the findings with the auditor',
  'Corrective actions written down with who and by when',
], 2));
C.push(spacer(20));
C.push(writeBox('Corrective actions and target dates:', 2));
C.push(spacer(20));
C.push(kv2Table(['Farmer / manager', 'Date', 'Auditor', 'Date']));

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
