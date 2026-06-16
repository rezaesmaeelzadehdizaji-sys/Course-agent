// ============================================================
// generate-course17-summary.mjs
// Course 17 Summary Page — standalone .docx (single-section layout)
// Run: node generate-course17-summary.mjs
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
const OUT_DIR   = path.join(__dirname, 'Course 17');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course17_Regulatory_Framework.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY      = '3C3C3C';
const GOLD      = 'C9A84C';
const COURSE_TITLE = 'Regulatory Framework in Poultry Production';

const pageMargin = {
  top: convertInchesToTwip(1), bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25),
};

const run = (text, opts = {}) => new TextRun({
  text, font: 'Calibri', size: opts.size || 24, color: opts.color || BODY,
  bold: opts.bold || false, italics: opts.italics || false,
});
const para = (text, opts = {}) => new Paragraph({
  children: Array.isArray(text) ? text.map(s => run(s.text, s)) : [run(text, opts)],
  alignment: opts.alignment || AlignmentType.LEFT,
  spacing: { after: opts.after !== undefined ? opts.after : 140, line: 276, lineRule: 'auto' },
  indent: opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
});
function sectionHead(text) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 26, color: MED_BLUE })],
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  });
}
function bullet(text) {
  return new Paragraph({
    children: [run(`•  ${text}`, { size: 23 })],
    spacing: { after: 70, line: 276, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) },
  });
}
function numbered(n, text) {
  return new Paragraph({
    children: [run(`${n}.  ${text}`, { size: 23 })],
    spacing: { after: 70, line: 276, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.25) },
  });
}
function subItem(letter, text) {
  return new Paragraph({
    children: [run(`${letter}.  ${text}`, { size: 22 })],
    spacing: { after: 60, line: 276, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.8), hanging: convertInchesToTwip(0.25) },
  });
}
function buildHeader() {
  return new Header({ children: [new Paragraph({
    children: [
      run('CPC Short Courses  |  ', { size: 18, color: '888888' }),
      run(COURSE_TITLE, { size: 18, color: MED_BLUE, bold: true }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}
function buildFooter() {
  return new Footer({ children: [new Paragraph({
    children: [
      run('CPC Short Courses  |  Course 17  |  Page ', { size: 18, color: '888888' }),
      new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '888888', font: 'Calibri' }),
      run(' of ', { size: 18, color: '888888' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '888888', font: 'Calibri' }),
    ],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const children = [];

  children.push(new Paragraph({ children: [run('')], spacing: { before: 480, after: 0 } }));
  children.push(new Paragraph({
    children: [run('COURSE 17: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
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
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 160 },
    }));
  }
  children.push(new Paragraph({
    children: [run(COURSE_TITLE, { bold: true, color: DARK_BLUE, size: 44 })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
  }));
  children.push(new Paragraph({
    children: [run('Course Summary', { color: MED_BLUE, size: 28, italics: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 400 },
  }));
  children.push(new Paragraph({
    children: [run('')], alignment: AlignmentType.CENTER,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
    spacing: { before: 0, after: 280 },
  }));
  children.push(para('CPC Short Courses', { bold: true, color: '595959', alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('Duration: 2-Hour Lecture', { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('June 2026', { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 360 }));

  // Introduction (humanized, farmer-flow)
  children.push(sectionHead('Introduction'));
  children.push(para('Raising healthy birds is only half the job. Running a poultry farm in Canada also means working inside a set of rules that cover animal welfare, biosecurity, food safety, marketing, supply management, and the records you keep. Those rules exist to protect bird health, public health, and a fair marketplace for every producer. When you understand how they apply to your barn, you stay in compliance, you steer clear of legal trouble, and you run an operation that buyers and consumers trust.'));
  children.push(para('This course walks through the main federal and provincial regulations, the industry codes, and the supply management system that shape poultry farming in Canada. It lays out what you actually have to do, from the daily work in the barn to the day an inspector shows up at your door.'));

  // Agenda (locked headings from source)
  children.push(sectionHead('Agenda'));
  children.push(numbered(1, 'Overview of the Regulatory Landscape'));
  children.push(subItem('a', 'Who regulates poultry in Canada: federal vs provincial vs industry bodies'));
  children.push(subItem('b', 'Key regulatory agencies and organizations'));
  children.push(numbered(2, 'Supply Management & Market Regulation'));
  children.push(subItem('a', 'How supply management works for poultry and eggs'));
  children.push(subItem('b', 'Relevant legislation and organizational oversight'));
  children.push(numbered(3, 'Animal Welfare & Care Standards'));
  children.push(subItem('a', 'Codes of Practice for care and handling of poultry'));
  children.push(subItem('b', 'Mandated housing, environment, feeding, transport, and handling standards'));
  children.push(numbered(4, 'Biosecurity, Animal Health & Disease Prevention'));
  children.push(subItem('a', 'On-farm biosecurity standards and disease-control regulations'));
  children.push(subItem('b', 'Regulatory requirements for hatcheries, breeders, supply flocks'));
  children.push(numbered(5, 'Food Safety, Processing & Product Standards'));
  children.push(subItem('a', 'Regulation of poultry products for slaughter, processing, sale'));
  children.push(subItem('b', 'Standards for labeling, slaughter, pathogen control, processing'));
  children.push(numbered(6, 'Record-Keeping, Audits & Compliance'));
  children.push(subItem('a', 'What records need to be maintained'));
  children.push(subItem('b', 'How audits, inspections, and compliance checks are carried out'));
  children.push(numbered(7, 'Provincial Variation: Example from British Columbia'));
  children.push(subItem('a', 'How provincial regulations overlay federal/industry rules'));
  children.push(subItem('b', 'Role of provincial acts, marketing boards, welfare laws'));
  children.push(numbered(8, 'Implications for Farmers & Good Practices'));
  children.push(subItem('a', 'What compliance means for everyday farm management'));
  children.push(subItem('b', 'Advantages: access to markets, consumer trust, animal welfare, disease prevention'));
  children.push(subItem('c', 'Risks of non-compliance and how to avoid them'));

  // Learning Objectives (humanized)
  children.push(sectionHead('Learning Objectives'));
  children.push(numbered(1, 'Name the main federal, provincial, and industry bodies that regulate poultry production in Canada, and know what each one does.'));
  children.push(numbered(2, 'Explain how the supply management system works for poultry and eggs, and what being part of it means for your farm.'));
  children.push(numbered(3, 'Understand the role and importance of the NFACC Codes of Practice for poultry care, housing, welfare, transport, and handling.'));
  children.push(numbered(4, 'Describe what current regulations require for biosecurity, animal health, and disease prevention.'));
  children.push(numbered(5, 'Understand your obligations around food safety, processing, and selling poultry products, including slaughter, microbial control, and labeling.'));
  children.push(numbered(6, 'Know which records you must keep, and what to expect during audits, inspections, and compliance checks.'));
  children.push(numbered(7, 'See how federal, provincial, and industry rules fit together, and how they shape what you do on the farm.'));
  children.push(numbered(8, 'Identify the practical steps that keep you compliant and let you benefit from the system: better welfare, stronger biosecurity, market access, and consumer trust.'));

  // Important Notes
  children.push(sectionHead('Important Notes'));
  children.push(bullet('Participants should bring note-taking items.'));
  children.push(bullet('A certificate of completion is available to all participants.'));

  const doc = new Document({
    creator: 'CPC Short Courses',
    title: `${COURSE_TITLE} — Course Summary`,
    description: 'Course 17 Summary Page — CPC Short Courses',
    styles: { default: { document: { run: { font: 'Calibri', size: 24, color: BODY }, paragraph: { spacing: { after: 140 } } } } },
    sections: [{
      properties: { page: { margin: pageMargin } },
      headers: { default: buildHeader() },
      footers: { default: buildFooter() },
      children,
    }],
  });
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_FILE, buf);
  console.log('Done:', OUT_FILE);
  console.log('Size:', (buf.length / 1024).toFixed(1), 'KB');
}
main().catch(e => { console.error(e); process.exit(1); });
