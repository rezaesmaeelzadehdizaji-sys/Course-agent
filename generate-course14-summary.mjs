// ============================================================
// generate-course14-summary.mjs — Course 14 Summary Page
// Intro to Field Service
// CPC Short Courses
// Run: node generate-course14-summary.mjs
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 14');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course14_FieldService.docx');
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

function agendaSub(letter, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${letter}.  `, bold: false, color: '888888', size: 22, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' }),
    ],
    spacing: { after: 60, line: 276, lineRule: 'auto' },
    indent:  { left: convertInchesToTwip(0.5) },
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
          new TextRun({ text: 'Intro to Field Service', bold: true, color: MED_BLUE, size: 18, font: 'Calibri' }),
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
// DOCUMENT CONTENT
// ============================================================
const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

const children = [

  // ── COVER BLOCK ──────────────────────────────────────────
  new Paragraph({ spacing: { before: 480, after: 0 } }),

  new Paragraph({
    children: [new TextRun({ text: 'COURSE 14: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
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
    children: [new TextRun({ text: 'Intro to Field Service', bold: true, color: DARK_BLUE, size: 44, font: 'Calibri' })],
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
    children: [new TextRun({ text: 'Duration: 45-Minute Lecture + 2-Hour Workshop', color: '595959', size: 22, font: 'Calibri' })],
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

  para([
    { text: 'Who this course is for: ', bold: true },
    { text: 'field service technicians and service representatives who visit contract poultry farms on behalf of an integrator, hatchery, or feed company. Throughout the course, you are the technician making the visit and the grower is the person you support.' },
  ]),

  para('Field service is the link between the integrator and the farm. The service technician visits contract growers regularly, checks how the flock is progressing, catches problems before they get expensive, and keeps the farmer connected to veterinary, nutritional, and management support. In commercial Canadian poultry production, the service technician is usually the first call a grower makes when something looks wrong.'),

  para('This course covers the practical core of field service: how to prepare for a farm visit, how to walk a barn systematically, how to read a production record, how to communicate what you find, and when to escalate. The hands-on workshop gives participants practice in a real barn setting.'),

  // ── AGENDA ───────────────────────────────────────────────
  sectionHead('Agenda'),

  agendaItem(1, 'The Role of Field Service'),
  agendaSub('a', 'What field service means in commercial poultry production'),
  agendaSub('b', 'Where the service technician fits in the production chain'),
  agendaSub('c', 'Three outcomes every visit must deliver'),

  agendaItem(2, 'Before the Visit'),
  agendaSub('a', 'Pre-visit preparation: reviewing records and flock history'),
  agendaSub('b', 'Canadian biosecurity requirements: CFIA zone system for service personnel'),
  agendaSub('c', 'PPE and biosecurity entry protocol'),

  agendaItem(3, 'The Barn Walk'),
  agendaSub('a', 'What to notice before you go inside: using all five senses'),
  agendaSub('b', 'Systematic walk protocol: perimeter, diagonals, feeder and drinker lines'),
  agendaSub('c', 'Bird conformation assessment: the CPC Learning Centre eight-point check'),

  agendaItem(4, 'Reading Performance Data'),
  agendaSub('a', 'Daily records: what they tell you and why they matter'),
  agendaSub('b', 'Mortality patterns: normal range versus what triggers action'),
  agendaSub('c', 'Water and feed as early warning signals'),
  agendaSub('d', 'Spot weighing and interpreting weight uniformity'),

  agendaItem(5, 'Working with the Farmer'),
  agendaSub('a', 'Building the relationship: preparation, follow-through, and trust'),
  agendaSub('b', 'Communicating findings clearly and constructively'),
  agendaSub('c', 'The visit record: what to include and how to write it'),
  agendaSub('d', 'When to call the veterinarian: escalation criteria'),

  agendaItem(6, 'Practical Field Skills'),
  agendaSub('a', 'On-farm necropsy basics: what you are looking for and what you are not'),
  agendaSub('b', 'Sample collection: how to collect, label, and transport diagnostic samples'),
  agendaSub('c', 'The farm health record over time: building a usable history'),

  new Paragraph({
    children: [
      new TextRun({ text: 'Workshop (2 hours): ', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' }),
      new TextRun({ text: 'Barn walk exercise, record interpretation, visit record completion, communication role-play.', color: BODY_GRAY, size: 24, font: 'Calibri' }),
    ],
    spacing: { before: 120, after: 160 },
  }),

  // ── LEARNING OBJECTIVES ──────────────────────────────────
  sectionHead('Learning Objectives'),

  para('By the end of this course, participants will be able to:'),

  loItem(1, 'Explain what field service really involves and where you fit between the integrator, the veterinarian, and the grower.'),
  loItem(2, 'Get ready for a farm visit and follow Canadian biosecurity standards so you never carry disease from one barn to the next.'),
  loItem(3, 'Walk a barn the same way every time, reading the flock and the environment so nothing slips past you.'),
  loItem(4, 'Read the daily records for mortality, water, feed, and body weight, and catch a bad trend before it turns into a real problem.'),
  loItem(5, 'Tell the farmer what you found so it leads to action, and know when it is time to call the veterinarian.'),
  loItem(6, 'Leave behind a visit record clear enough that the next person can pick up right where you left off.'),

  new Paragraph({ spacing: { before: 80, after: 0 } }),

  // ── IMPORTANT NOTES ──────────────────────────────────────
  sectionHead('Important Notes'),

  para('This course requires access to a working commercial poultry barn for the workshop component. Biosecurity protocols apply from the moment participants arrive in the parking lot. Contact CPC 2 to 3 days before the workshop for biosecurity advice specific to the host farm, because some requirements have to be met before you arrive and you need time to act on them. PPE is provided by CPC for all workshop participants.'),

  para('Participants are expected to come to the lecture with a basic understanding of commercial poultry production. The course builds on concepts from Course 3 (T-FLAWS Assessment Management Tool) and Course 7 (Common Poultry Diseases). Reviewing those courses before attending is recommended.'),

  para('The visit record form used in the workshop will be provided at the course. Participants keep their completed form as a working reference.'),

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
console.log(`Dirty flags: ${dirtyLeft} (must be 0)`);
console.log(`Em dashes: ${emDashes} (must be 0)`);
