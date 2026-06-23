// ============================================================
// generate-course9-summary.mjs
// Produces Course 9 Summary Page as a standalone .docx
// Single-section layout matching Course 5 summary format
// Run: node generate-course9-summary.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, PageNumber, BorderStyle,
  convertInchesToTwip, ImageRun,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 9');
const OUT_FILE  = path.join(OUT_DIR, 'Value_of_Poultry_Diagnostics_Summary_Page.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY      = '3C3C3C';
const GOLD      = 'C9A84C';

const pageMargin = {
  top:    convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left:   convertInchesToTwip(1.25),
  right:  convertInchesToTwip(1.25),
};

// ---- helpers ----
const run = (text, opts = {}) => new TextRun({
  text,
  font:    'Calibri',
  size:    opts.size    || 24,
  color:   opts.color   || BODY,
  bold:    opts.bold    || false,
  italics: opts.italics || false,
});

const para = (text, opts = {}) => new Paragraph({
  children: Array.isArray(text)
    ? text.map(s => run(s.text, s))
    : [run(text, opts)],
  alignment: opts.alignment || AlignmentType.LEFT,
  spacing:   { after: opts.after !== undefined ? opts.after : 140, line: 276, lineRule: 'auto' },
  indent:    opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
});

function sectionHead(text) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 26, color: MED_BLUE })],
    spacing:  { before: 280, after: 100 },
    border:   { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [run(`•  ${text}`, { size: 23 })],
    spacing:  { after: 70, line: 276, lineRule: 'auto' },
    indent:   { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) },
  });
}

function numbered(n, text) {
  return new Paragraph({
    children: [run(`${n}.  ${text}`, { size: 23 })],
    spacing:  { after: 70, line: 276, lineRule: 'auto' },
    indent:   { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.25) },
  });
}

function subItem(letter, text) {
  return new Paragraph({
    children: [run(`${letter}.  ${text}`, { size: 22 })],
    spacing:  { after: 60, line: 276, lineRule: 'auto' },
    indent:   { left: convertInchesToTwip(0.8), hanging: convertInchesToTwip(0.25) },
  });
}

function buildHeader() {
  return new Header({
    children: [new Paragraph({
      children: [
        run('CPC Short Courses  |  ', { size: 18, color: '888888' }),
        run('The Value of Poultry Diagnostics', { size: 18, color: MED_BLUE, bold: true }),
      ],
      alignment: AlignmentType.RIGHT,
      border:    { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
    })],
  });
}

function buildFooter() {
  return new Footer({
    children: [new Paragraph({
      children: [
        run('CPC Short Courses  |  Course 9  |  Page ', { size: 18, color: '888888' }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '888888', font: 'Calibri' }),
        run(' of ', { size: 18, color: '888888' }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '888888', font: 'Calibri' }),
      ],
      alignment: AlignmentType.CENTER,
      border:    { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
    })],
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [];

  // ---- Cover block (no page break — flows directly into content) ----
  // Top spacer
  children.push(new Paragraph({ children: [run('')], spacing: { before: 480, after: 0 } }));

  // Course label
  children.push(new Paragraph({
    children: [run('COURSE 9: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing:   { before: 0, after: 200 },
  }));

  // Logo
  if (logoBuffer) {
    let lw = 144, lh = 144;
    try {
      const v = new DataView(logoBuffer.buffer, logoBuffer.byteOffset);
      const pw = v.getUint32(16, false), ph = v.getUint32(20, false);
      if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw);
    } catch (_) {}
    children.push(new Paragraph({
      children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 160 },
    }));
  }

  // Course title
  children.push(new Paragraph({
    children: [run('The Value of Poultry Diagnostics', { bold: true, color: DARK_BLUE, size: 52 })],
    alignment: AlignmentType.CENTER,
    spacing:   { before: 0, after: 120 },
  }));

  // Subtitle
  children.push(new Paragraph({
    children: [run('Course Summary', { color: MED_BLUE, size: 28, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing:   { before: 0, after: 400 },
  }));

  // Gold rule
  children.push(new Paragraph({
    children: [run('')],
    alignment: AlignmentType.CENTER,
    border:    { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
    spacing:   { before: 0, after: 280 },
  }));

  // Metadata
  children.push(para('CPC Short Courses', { bold: true, color: '595959', alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('Duration: 2-Hour Lecture',     { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('May 2026',                      { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 360 }));

  // ---- Content starts here — no page break ----

  // Introduction
  children.push(sectionHead('Introduction'));
  children.push(para('Keeping your flock healthy is the single best way to protect your farm\'s bottom line. But if you only call for help when you are already picking up dead birds, you are playing catch-up and losing money. Poultry diagnostics is the tool that lets you get ahead. It is the process of identifying diseases, nutritional gaps, feed issues, and environmental stress before they get out of hand. In this course, we will show you how diagnostics can work on your farm, whether you run a small family flock or a large commercial barn. You will learn to use lab tests, on-farm monitoring, and veterinary support to spot problems early, cut down on bird losses, and make sure your treatments are actually working.'));

  // Agenda (strictly matching the source document structure and locked headings)
  children.push(sectionHead('Agenda'));
  children.push(numbered(1,  'Welcome & Course Overview'));
  children.push(subItem('a', 'Why poultry diagnostics matter in modern farming'));
  children.push(subItem('b', 'Common misconceptions about diagnostics'));
  children.push(numbered(2,  'What Poultry Diagnostics Involves'));
  children.push(subItem('a', 'Types of diagnostic tests (lab testing, on-farm checks, necropsy, environmental monitoring)'));
  children.push(subItem('b', 'Samples required and proper sampling techniques'));
  children.push(numbered(3,  'Benefits of Early and Accurate Diagnosis'));
  children.push(subItem('a', 'Reducing mortality and economic loss'));
  children.push(subItem('b', 'Preventing disease spread'));
  children.push(subItem('c', 'Improving feed efficiency and performance'));
  children.push(numbered(4,  'Using Diagnostics for Decision-Making'));
  children.push(subItem('a', 'When to call for diagnostic support'));
  children.push(subItem('b', 'Interpreting results with veterinarians and extension workers'));
  children.push(subItem('c', 'Linking diagnostics to treatment and prevention plans'));
  children.push(numbered(5,  'Case Studies & Practical Examples'));
  children.push(subItem('a', 'Common farm problems diagnosed early'));
  children.push(subItem('b', 'Outcomes when diagnosis is delayed'));
  children.push(numbered(6,  'Q&A and Discussion'));
  children.push(subItem('a', 'Farmer experiences'));
  children.push(subItem('b', 'Key takeaways'));

  // Learning Objectives (humanized to Farmer-Flow)
  children.push(sectionHead('Learning Objectives'));
  children.push(numbered(1,  'Explain what poultry diagnostics are and why they are essential for keeping your birds healthy and your farm profitable.'));
  children.push(numbered(2,  'Identify the early, subtle changes in bird behavior, water intake, or feed consumption that tell you it is time to call for a lab test.'));
  children.push(numbered(3,  'Describe the main diagnostic tools available, including blood tests, necropsies, and house monitoring, and know when to use each one.'));
  children.push(numbered(4,  'Collect and handle basic farm samples, such as blood cards, fecal droppings, water, feed, and fresh mortalities, so they arrive at the lab in usable condition.'));
  children.push(numbered(5,  'Work with your veterinarian or extension agent to read and understand lab reports, including mean titers and uniformity scores.'));
  children.push(numbered(6,  'Use diagnostic results to make smart decisions about treatments, management adjustments, and long-term vaccination plans.'));
  children.push(numbered(7,  'Calculate the real economic value of using diagnostics on your farm, comparing the low cost of a test to the high cost of a delayed diagnosis.'));

  // Important Notes
  children.push(sectionHead('Important Notes'));
  children.push(bullet('Participants should bring note-taking items.'));
  children.push(bullet('A certificate of completion is available to all participants.'));

  // ---- Build document ----
  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       'The Value of Poultry Diagnostics — Course Summary',
    description: 'Course 9 Summary Page — CPC Short Courses',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 24, color: BODY }, paragraph: { spacing: { after: 140 } } },
      },
    },
    sections: [{
      properties: { page: { margin: pageMargin } },
      headers:    { default: buildHeader() },
      footers:    { default: buildFooter() },
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_FILE, buf);
  console.log('Done:', OUT_FILE);
  console.log('Size:', (buf.length / 1024).toFixed(1), 'KB');
}

main().catch(e => { console.error(e); process.exit(1); });
