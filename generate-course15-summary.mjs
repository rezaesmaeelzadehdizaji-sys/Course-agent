// ============================================================
// generate-course15-summary.mjs — Course 15 Summary Page
// Serology 101
// CPC Short Courses
// Run: node generate-course15-summary.mjs
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
  convertInchesToTwip,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 15');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course15_Serology101.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const MED_BLUE  = '2E74B5';
const DARK_BLUE = '1F3864';
const GOLD      = 'C9A84C';
const BODY_GRAY = '3C3C3C';

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

function sectionHead(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MED_BLUE, size: 26, font: 'Calibri' })],
    spacing: { before: 240, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  });
}

function agendaItem(num, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}.  `, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' }),
    ],
    spacing: { after: 80, line: 276, lineRule: 'auto' },
    indent:  { left: convertInchesToTwip(0.15) },
  });
}

function loItem(num, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}.  `, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' }),
    ],
    spacing: { after: 100, line: 276, lineRule: 'auto' },
    indent:  { left: convertInchesToTwip(0.15) },
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
          new TextRun({ text: 'Serology 101', bold: true, color: MED_BLUE, size: 18, font: 'Calibri' }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 15  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
// DOCUMENT CONTENT
// ============================================================
const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

const children = [

  // ── COVER BLOCK ──────────────────────────────────────────
  new Paragraph({ spacing: { before: 480, after: 0 } }),

  new Paragraph({
    children: [new TextRun({ text: 'COURSE 15: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 240 },
  }),

  ...(logoBuffer ? [
    new Paragraph({
      children: [new ImageRun({ data: logoBuffer, transformation: { width: 130, height: 130 }, type: 'png' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
  ] : [
    new Paragraph({ children: [new TextRun({ text: '[CPC Logo]', color: '888888', size: 22, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 } }),
  ]),

  new Paragraph({
    children: [new TextRun({ text: 'Serology 101', bold: true, color: DARK_BLUE, size: 44, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
  }),

  new Paragraph({
    children: [new TextRun({ text: 'Course Summary', italics: true, color: MED_BLUE, size: 26, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
  }),

  new Paragraph({
    children: [new TextRun({ text: '___________________________________', color: GOLD, size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),

  new Paragraph({
    children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
  }),

  new Paragraph({
    children: [new TextRun({ text: 'Duration: 2-Hour Lecture + 1-Hour Workshop', color: '595959', size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
  }),

  new Paragraph({
    children: [new TextRun({ text: 'July 2026', color: '595959', size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
  }),

  // ── INTRODUCTION ─────────────────────────────────────────
  sectionHead('Introduction'),

  para('A blood sample can tell you things a barn walk cannot. Serology, testing the antibody levels in your birds\' blood, shows you how well your flock responded to vaccination and whether it has been exposed to disease out in the field.'),

  para('This course walks through how those blood tests work, what the results actually mean, and how to use them to make real decisions on your farm: whether your vaccination program is working, whether a disease has moved through your flock without you seeing it, and when a result is telling you something versus when it is just noise.'),

  // ── AGENDA ───────────────────────────────────────────────
  sectionHead('Agenda'),

  agendaItem(1, 'Class introductions'),
  agendaItem(2, 'The role of antibodies in immunity'),
  agendaItem(3, 'Serologic tests'),
  agendaItem(4, 'The limitations of serology'),
  agendaItem(5, 'Poultry blood sampling techniques'),
  agendaItem(6, 'Sample handling and lab submission'),
  agendaItem(7, 'Interpreting serologic results'),

  new Paragraph({
    children: [
      new TextRun({ text: 'Workshop (1 hour): ', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' }),
      new TextRun({ text: 'Hands-on practice drawing blood samples, handling and labeling serum, and completing a lab submission form, followed by reading real HI and ELISA reports against flock history to practice interpretation.', color: BODY_GRAY, size: 24, font: 'Calibri' }),
    ],
    spacing: { before: 120, after: 160 },
  }),

  // ── LEARNING OBJECTIVES ──────────────────────────────────
  sectionHead('Learning Objectives'),

  para('By the end of this course, participants will be able to:'),

  loItem(1, 'Explain what antibodies are and what a titer result on a lab report actually represents.'),
  loItem(2, 'Read a serology report against the flock\'s vaccination history and health background, not just as numbers on a page.'),
  loItem(3, 'Describe what serology can and cannot tell you about flock health, so you don\'t read too much into a result or miss what it\'s telling you.'),
  loItem(4, 'Draw a blood sample from a bird confidently and safely.'),
  loItem(5, 'Prepare and handle blood samples so the serum that reaches the lab is good enough to test.'),
  loItem(6, 'Fill out a lab submission form correctly, requesting the right tests for the question being asked.'),

  new Paragraph({ spacing: { before: 80, after: 0 } }),

  // ── IMPORTANT NOTES ──────────────────────────────────────
  sectionHead('Important Notes'),

  para('Participants should bring note-taking items.'),
  para('Canadian Poultry Consultants will provide boot covers, gloves, and coveralls for the workshop.'),
  para('A certificate of completion is available to all participants.'),

];

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const doc = new Document({
  sections: [{
    properties: { page: { margin: pageMargin } },
    headers:  { default: buildHeader() },
    footers:  { default: buildFooter() },
    children,
  }],
});

fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));
console.log('Summary page written to', OUT_FILE);
console.log('File size:', fs.statSync(OUT_FILE).size, 'bytes');

// ============================================================
// POST-BUILD PATCH: strip w:dirty, set updateFields=false
// ============================================================
const zip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));
let xml = await zip.file('word/document.xml').async('string');
xml = xml.replace(/\sw:dirty="true"/g, '');
zip.file('word/document.xml', xml);

let settings = await zip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
if (!settings.includes('w:updateFields')) {
  settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
}
zip.file('word/settings.xml', settings);

const patched = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log('Patched summary written to', OUT_FILE);

// Em dash check
const dirtyLeft = (xml.match(/w:dirty=/g) || []).length;
const emDashes  = (xml.match(/—/g) || []).length;
const enDashes  = (xml.match(/–/g) || []).length;
console.log(`Dirty flags: ${dirtyLeft} (must be 0)`);
console.log(`Em dashes: ${emDashes} (must be 0)`);
console.log(`En dashes: ${enDashes} (must be 0)`);
