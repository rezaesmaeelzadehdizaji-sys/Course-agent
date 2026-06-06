// ============================================================
// generate-course8-summary.mjs — Course 8 Summary Page
// Fundamentals of Poultry Vaccination & Treatment
// CPC Short Courses — June 2026
// Run: node generate-course8-summary.mjs
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  Footer,
  BorderStyle,
  convertInchesToTwip,
  ImageRun,
  PageNumber,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 8');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course8_Vaccination.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

const logoBuf = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

// ============================================================
// HELPERS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({
    text,
    bold:    opts.bold    || false,
    italics: opts.italics || false,
    color:   opts.color   || BODY_GRAY,
    size:    opts.size    || 22,
    font:    'Calibri',
  });
}

function p(content, opts = {}) {
  const children = Array.isArray(content)
    ? content.map(s => new TextRun({
        text:    s.text,
        bold:    s.bold    || false,
        italics: s.italics || false,
        color:   s.color   || BODY_GRAY,
        size:    s.size    || 22,
        font:    'Calibri',
      }))
    : [run(content, opts)];
  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing:   { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 100, line: 260, lineRule: 'auto' },
    indent:    opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}

function sectionLabel(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD } },
  });
}

function numbered(num, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}.  `, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' }),
    ],
    spacing: { after: 60, line: 260, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.2) },
  });
}

function subitem(letter, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `    ${letter}.  `, bold: true, color: BODY_GRAY, size: 20, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 20, font: 'Calibri' }),
    ],
    spacing: { after: 40, line: 260, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.4) },
  });
}

function lo(num, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}.  `, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' }),
    ],
    spacing: { after: 70, line: 260, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.2) },
  });
}

function noteBullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' })],
    bullet: { level: 0 },
    spacing: { after: 60, line: 260, lineRule: 'auto' },
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
          new TextRun({ text: 'Fundamentals of Poultry Vaccination & Treatment', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 8  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
  top:    convertInchesToTwip(0.75),
  bottom: convertInchesToTwip(0.75),
  left:   convertInchesToTwip(1.0),
  right:  convertInchesToTwip(1.0),
};

// ============================================================
// DOCUMENT BODY
// ============================================================
const children = [];

// ----- COVER BLOCK -----
children.push(new Paragraph({
  children: [new TextRun({ text: 'COURSE 8: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 60 },
}));

if (logoBuf) {
  children.push(new Paragraph({
    children: [new ImageRun({ data: logoBuf, transformation: { width: 96, height: 96 }, type: 'png' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
  }));
}

children.push(new Paragraph({
  children: [new TextRun({ text: 'Fundamentals of Poultry Vaccination & Treatment', bold: true, color: DARK_BLUE, size: 40, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 30 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: 'Course Summary', italics: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 40 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: '_______________________________________________', color: GOLD, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 60 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: BODY_GRAY, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 40 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: 'Duration: 2-Hour Lecture, 2-Hour Practical Session', color: BODY_GRAY, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 40 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: 'June 2026', color: BODY_GRAY, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 360 },
}));

// ============================================================
// INTRODUCTION
// ============================================================
children.push(sectionLabel('Introduction'));

children.push(p(
  'Every vaccination method has a different entry point into the immune system, and every route comes with its own technique, equipment, and troubleshooting challenges. This course covers all six vaccination routes used in Canadian commercial poultry production: water, coarse and fine spray, eye drop, wing web, injection, and in-ovo. By the end, you will know which route fits which disease and flock type, how to execute each one correctly, and how to spot when something has gone wrong.'
));

children.push(p(
  'The course also covers the principles of responsible antibiotic treatment. When vaccination does not fully protect the flock, you may be dealing with a secondary bacterial infection that needs treatment. Canadian law sets clear rules for when and how antibiotics can be used, and knowing those rules protects your flock, your market access, and your license to treat.',
  { spaceAfter: 120 }
));

// ============================================================
// AGENDA
// ============================================================
children.push(sectionLabel('Agenda'));

children.push(numbered(1, 'Section 1: Poultry Water Vaccination'));
children.push(subitem('a', 'Immune responses to oral vaccines; diseases prevented through water'));
children.push(subitem('b', 'Cold chain, system preparation, dosing, and delivery'));
children.push(subitem('c', 'Monitoring flock uptake and troubleshooting failures'));

children.push(numbered(2, 'Section 2: Spray Vaccination'));
children.push(subitem('a', 'Coarse spray: equipment, pressure settings, ventilation management, and technique by flock type'));
children.push(subitem('b', 'Fine spray as a booster method: droplet size, target tissue, and program placement'));

children.push(numbered(3, 'Section 3: Poultry Eye Drop Vaccination'));
children.push(subitem('a', 'Ocular route and mucosal immunity; target diseases'));
children.push(subitem('b', 'Dropper calibration, bird handling, and coverage confirmation using blue dye'));

children.push(numbered(4, 'Section 4: Poultry Wing Web Vaccination'));
children.push(subitem('a', 'Fowl Pox as the primary target; applicator technique and site identification'));
children.push(subitem('b', 'Reading the vaccine take at day 7 to 10 and identifying failures'));

children.push(numbered(5, 'Section 5: Injection Vaccination'));
children.push(subitem('a', 'Subcutaneous and intramuscular technique for killed vaccines'));
children.push(subitem('b', 'Injector calibration, cold chain, PPE, and post-vaccination serology'));

children.push(numbered(6, 'Section 6: In-Ovo Vaccination'));
children.push(subitem('a', 'Hatchery timing at day 18; target diseases and strains'));
children.push(subitem('b', 'What in-ovo priming means for farm-level booster scheduling'));

children.push(numbered(7, 'Section 7: Post-Vaccination Reactions'));
children.push(subitem('a', 'Normal reactions: onset, signs, and self-limiting duration'));
children.push(subitem('b', 'What amplifies a reaction; stacking live vaccines; when to call your veterinarian'));

children.push(numbered(8, 'Section 8: Principles of Treatment (Including AMR)'));
children.push(subitem('a', 'What antibiotic resistance is and why it matters on your farm'));
children.push(subitem('b', 'Canadian law: VCPR, Veterinary Health Certificate, and prescription requirements'));
children.push(subitem('c', 'Water, feed, and injectable treatment routes; withdrawal times and record-keeping'));

children.push(p('', { spaceAfter: 40 }));

// ============================================================
// LEARNING OBJECTIVES
// ============================================================
children.push(sectionLabel('Learning Objectives'));

children.push(lo(1,  'Choose the correct vaccination route for each disease and flock type, and explain the immune mechanism behind that route.'));
children.push(lo(2,  'Maintain the cold chain from storage to the barn and prepare vaccines correctly for each delivery method.'));
children.push(lo(3,  'Perform water, spray, eye drop, wing web, subcutaneous, and intramuscular vaccination using correct technique for each route.'));
children.push(lo(4,  'Set up, calibrate, and maintain the equipment required for each vaccination method.'));
children.push(lo(5,  'Monitor flock response after vaccination and identify the signs that coverage was incomplete.'));
children.push(lo(6,  'Apply PPE correctly and follow safe handling and disposal procedures for live and killed vaccines.'));
children.push(lo(7,  'Describe a normal post-vaccination reaction and name the four signs that require a veterinarian call.'));
children.push(lo(8,  'Explain how antibiotic resistance develops and why misuse of antibiotics threatens long-term flock productivity and market access.'));
children.push(lo(9,  'State the Canadian legal requirements for antibiotic use: VCPR, Veterinary Health Certificate, and prescription rules that took effect December 1, 2018.'));
children.push(lo(10, 'Select the appropriate treatment route for each situation, observe withdrawal times, and maintain complete treatment records.'));

// ============================================================
// IMPORTANT NOTES
// ============================================================
children.push(sectionLabel('Important Notes'));

children.push(noteBullet('Participants should bring note-taking materials to each session.'));
children.push(noteBullet('Canadian Poultry Consultants will provide boot covers, gloves, and coveralls for the practical session component.'));
children.push(noteBullet('A certificate of completion is available to all participants who attend the full course.'));
children.push(noteBullet('All antibiotic use discussed in this course is subject to current Health Canada regulations. Consult your veterinarian before initiating any treatment.'));

// ============================================================
// BUILD DOCUMENT
// ============================================================
const doc = new Document({
  styles: {
    paragraphStyles: [
      {
        id: 'Normal',
        name: 'Normal',
        run: { font: 'Calibri', size: 22, color: BODY_GRAY },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          {
            level: 0,
            format: 'bullet',
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) } } },
          },
        ],
      },
    ],
  },
  sections: [{
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children,
  }],
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buf);
console.log('Summary page written:', OUT_FILE);
console.log('File size:', (buf.length / 1024).toFixed(1), 'KB');
