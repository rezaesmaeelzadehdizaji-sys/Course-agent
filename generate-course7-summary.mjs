// ============================================================
// generate-course7-summary.mjs
// Produces Course 7 Summary Page as a standalone .docx
// Single-section layout matching the Course 5/6 summary format
// Content extracted from "Short Courses summary pdage drafts.docx"
// Run: node generate-course7-summary.mjs
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
const OUT_FILE  = path.join(__dirname, 'Course 7', 'Summary_Page_Course7_CommonPoultryDiseases.docx');
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

function bullet(text) {
  return new Paragraph({
    children: [run(`•  ${text}`, { size: 23 })],
    spacing:  { after: 70, line: 276, lineRule: 'auto' },
    indent:   { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) },
  });
}

function buildHeader() {
  return new Header({
    children: [new Paragraph({
      children: [
        run('CPC Short Courses  |  ', { size: 18, color: '888888' }),
        run('Common Poultry Diseases', { size: 18, color: MED_BLUE, bold: true }),
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
        run('CPC Short Courses  |  Course 7  |  Page ', { size: 18, color: '888888' }),
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
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [];

  // ---- Cover block ----
  children.push(new Paragraph({ children: [run('')], spacing: { before: 480, after: 0 } }));

  children.push(new Paragraph({
    children: [run('COURSE 7: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing:   { before: 0, after: 200 },
  }));

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

  children.push(new Paragraph({
    children: [run('Common Poultry Diseases', { bold: true, color: DARK_BLUE, size: 52 })],
    alignment: AlignmentType.CENTER,
    spacing:   { before: 0, after: 120 },
  }));

  children.push(new Paragraph({
    children: [run('Course Summary', { color: MED_BLUE, size: 28, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing:   { before: 0, after: 400 },
  }));

  children.push(new Paragraph({
    children: [run('')],
    alignment: AlignmentType.CENTER,
    border:    { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
    spacing:   { before: 0, after: 280 },
  }));

  children.push(para('CPC Short Courses', { bold: true, color: '595959', alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('Duration: 2-Hour Lecture', { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('April 2026',               { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 360 }));

  // ---- Content — no page break ----

  // Introduction
  children.push(sectionHead('Introduction'));
  children.push(para('Healthy birds are the foundation of a successful poultry farm. Diseases can spread quickly, cut production, drive up costs, and even wipe out an entire flock if they are not understood and caught early. Meat birds, layers, breeders, ducks, and geese each face different disease risks because of their anatomy, growth rates, environments, and behaviors.'));
  children.push(para('In this course, farmers learn how to recognize the most common poultry diseases, understand how they spread, and know the key steps for preventing and controlling them. With this knowledge, you can protect your flock, reduce losses, and keep a safe, profitable operation.'));

  // Agenda
  children.push(sectionHead('Agenda'));
  children.push(numbered(1, 'Why Knowledge of Disease Matters'));
  children.push(subItem('a', 'How diseases affect performance, costs, and food safety'));
  children.push(subItem('b', 'Understanding symptoms and early warning signs'));
  children.push(numbered(2, 'How Diseases Spread'));
  children.push(subItem('a', 'Biosecurity basics'));
  children.push(subItem('b', 'Transmission through feed, water, equipment, and people'));
  children.push(subItem('c', 'Environmental factors (ventilation, crowding, moisture)'));
  children.push(numbered(3, 'Common Diseases in Meat Birds (Broilers)'));
  children.push(subItem('a', 'Fast growth and disease susceptibility'));
  children.push(subItem('b', 'Typical conditions and early signs'));
  children.push(subItem('c', 'Prevention and management strategies'));
  children.push(numbered(4, 'Common Diseases in Layers and Breeders'));
  children.push(subItem('a', 'Long production cycles and reproductive challenges'));
  children.push(subItem('b', 'Egg-related disease indicators'));
  children.push(subItem('c', 'Management practices to reduce disease pressure'));
  children.push(numbered(5, 'Common Diseases in Ducks and Geese'));
  children.push(subItem('a', 'Waterfowl-specific risks'));
  children.push(subItem('b', 'Environmental and water-related diseases'));
  children.push(subItem('c', 'Prevention and flock care for mixed-species farms'));
  children.push(numbered(6, 'Cross-Species Disease Concerns'));
  children.push(subItem('a', 'Diseases that spread between different poultry types'));
  children.push(subItem('b', 'Farm layout and management considerations'));
  children.push(numbered(7, 'Practical Disease Prevention'));
  children.push(subItem('a', 'Hygiene and sanitation'));
  children.push(subItem('b', 'Vaccination awareness (general concepts)'));
  children.push(subItem('c', 'Farm monitoring and record-keeping'));
  children.push(subItem('d', 'Handling sick birds safely'));
  children.push(numbered(8, 'What to Do When You Suspect a Disease'));
  children.push(subItem('a', 'Isolating affected birds'));
  children.push(subItem('b', 'Seeking veterinary advice'));
  children.push(subItem('c', 'Improving immediate conditions (clean water, dry bedding, airflow)'));
  children.push(numbered(9, 'Summary and Key Takeaways'));
  children.push(subItem('a', 'Review of main diseases and prevention actions'));
  children.push(subItem('b', 'Q and A and farmer discussion'));

  // Learning Objectives
  children.push(sectionHead('Learning Objectives'));
  children.push(numbered(1, 'Recognize common signs of illness across different poultry species.'));
  children.push(numbered(2, 'Identify major diseases affecting meat birds, layers, breeders, ducks, and geese.'));
  children.push(numbered(3, 'Understand how diseases spread and what increases the risk of an outbreak.'));
  children.push(numbered(4, 'Apply core biosecurity practices to reduce disease introduction and spread.'));
  children.push(numbered(5, 'Take early action when symptoms appear, including isolation and observation.'));
  children.push(numbered(6, 'Manage housing, feed, and water systems in ways that lower disease pressure.'));
  children.push(numbered(7, 'Use record-keeping and routine checks to monitor flock health over time.'));
  children.push(numbered(8, 'Adapt disease-prevention methods to the needs of each bird type on the farm.'));

  // Important Notes
  children.push(sectionHead('Important Notes'));
  children.push(bullet('Participants should bring note-taking items.'));
  children.push(bullet('A certificate of completion is available to all participants.'));

  // ---- Build document ----
  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       'Common Poultry Diseases — Course Summary',
    description: 'Course 7 Summary Page — CPC Short Courses',
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

  if (!fs.existsSync(path.dirname(OUT_FILE))) {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  }

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_FILE, buf);
  console.log('Done:', OUT_FILE);
  console.log('Size:', (buf.length / 1024).toFixed(1), 'KB');
}

main().catch(e => { console.error(e); process.exit(1); });
