// ============================================================
// generate-course16-summary.mjs
// Course 16 Summary Page — standalone .docx (single-section layout)
// Run: node generate-course16-summary.mjs
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
const OUT_DIR   = path.join(__dirname, 'Course 16');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course16_Inspection_Audit.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY      = '3C3C3C';
const GOLD      = 'C9A84C';

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
      run('Preparing for an Inspection Audit', { size: 18, color: MED_BLUE, bold: true }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}
function buildFooter() {
  return new Footer({ children: [new Paragraph({
    children: [
      run('CPC Short Courses  |  Course 16  |  Page ', { size: 18, color: '888888' }),
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
    children: [run('COURSE 16: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
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
    children: [run('Preparing for an Inspection Audit', { bold: true, color: DARK_BLUE, size: 48 })],
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
  children.push(para('Inspection audits are a routine part of poultry farming in Canada, the regular check that confirms your farm is producing safe food and caring for its birds the way the program says it should. Getting ready for one does not have to be a yearly scramble. The same records and daily habits that get you through an audit are the ones that grow healthier flocks and protect your bottom line. This course shows you who audits a Canadian poultry farm and why, the six areas an auditor always checks, how to get your barn and paperwork ready ahead of time, how to handle audit day with confidence, and what to do with the report so the next audit is even easier.'));

  // Agenda (locked headings from source)
  children.push(sectionHead('Agenda'));
  children.push(numbered(1, 'Understanding Audits'));
  children.push(subItem('a', 'What is an inspection audit?'));
  children.push(subItem('b', 'Types of audits: regulatory, company, certification, welfare, food safety'));
  children.push(subItem('c', 'The purpose and benefits of audits'));
  children.push(numbered(2, 'Key Areas Audited'));
  children.push(subItem('a', 'Biosecurity: farm entry protocols, footbaths, visitor control'));
  children.push(subItem('b', 'Flock health & welfare: mortality records, vaccination, handling'));
  children.push(subItem('c', 'Housing & environment: ventilation, litter quality, lighting, space'));
  children.push(subItem('d', 'Feed & water management: storage, quality, availability'));
  children.push(subItem('e', 'Record-keeping: flock performance, medication logs, mortality, treatments'));
  children.push(subItem('f', 'Safety & compliance: personal protective equipment, chemical storage'));
  children.push(numbered(3, 'Preparing for an Audit'));
  children.push(subItem('a', 'Reviewing records and documentation'));
  children.push(subItem('b', 'Conducting internal pre-audit checks'));
  children.push(subItem('c', 'Fixing common deficiencies before inspection'));
  children.push(subItem('d', 'Assigning responsibilities to farm staff'));
  children.push(numbered(4, 'During the Audit'));
  children.push(subItem('a', 'Hosting inspectors professionally'));
  children.push(subItem('b', 'Providing clear and accurate information'));
  children.push(subItem('c', 'Demonstrating procedures and practices'));
  children.push(subItem('d', 'Addressing questions calmly and accurately'));
  children.push(numbered(5, 'After the Audit'));
  children.push(subItem('a', 'Understanding audit reports'));
  children.push(subItem('b', 'Implementing corrective actions'));
  children.push(subItem('c', 'Continuous improvement and preparation for future audits'));
  children.push(numbered(6, 'Practical Tips'));
  children.push(subItem('a', 'Daily routines that maintain audit readiness'));
  children.push(subItem('b', 'Checklists for record-keeping, hygiene, and welfare'));
  children.push(subItem('c', 'Staff training and accountability'));

  // Learning Objectives (humanized)
  children.push(sectionHead('Learning Objectives'));
  children.push(numbered(1, 'Explain the purpose and types of inspection audits in poultry farming, and why they exist in Canada.'));
  children.push(numbered(2, 'Identify the six key areas an auditor reviews on a poultry farm, and what they look for in each.'));
  children.push(numbered(3, 'Run an internal pre-audit check on your own barn and records to find weak spots before the auditor does.'));
  children.push(numbered(4, 'Prepare staff and documentation so the audit runs smoothly and every job has an owner.'));
  children.push(numbered(5, 'Host an auditor well on the day: communicate clearly, present records, and demonstrate your practices.'));
  children.push(numbered(6, 'Read an audit report and close out corrective actions properly so they stay fixed.'));
  children.push(numbered(7, 'Build daily routines that keep the farm audit-ready year round and improve overall operations.'));

  // Important Notes
  children.push(sectionHead('Important Notes'));
  children.push(bullet('Participants should bring note-taking items.'));
  children.push(bullet('A certificate of completion is available to all participants.'));

  const doc = new Document({
    creator: 'CPC Short Courses',
    title: 'Preparing for an Inspection Audit — Course Summary',
    description: 'Course 16 Summary Page — CPC Short Courses',
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
