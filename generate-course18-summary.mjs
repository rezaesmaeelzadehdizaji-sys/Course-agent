// ============================================================
// generate-course18-summary.mjs
// Course 18 Summary Page — standalone .docx (single-section layout)
// Run: node generate-course18-summary.mjs
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
const OUT_DIR   = path.join(__dirname, 'Course 18');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course18_Hot_Topics.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY      = '3C3C3C';
const GOLD      = 'C9A84C';
const COURSE_TITLE = 'Current Poultry Issues (Hot Topics)';

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
      run('CPC Short Courses  |  Course 18  |  Page ', { size: 18, color: '888888' }),
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
    children: [run('COURSE 18: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
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
    children: [run(COURSE_TITLE, { bold: true, color: DARK_BLUE, size: 46 })],
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

  // Introduction (farmer-flow)
  children.push(sectionHead('Introduction'));
  children.push(para('Poultry farming never stands still. New diseases show up, old ones come back in new forms, and a virus that was a wild-bird problem one year can be in your barn the next. Avian influenza has shown every farmer in Canada how fast a hot topic can turn into a real emergency. This course keeps you current on the issues that matter most right now: where avian influenza stands today, how it is behaving, and what other diseases are emerging on the radar in Canada.'));
  children.push(para('The goal is simple. The earlier you understand a threat, the better you can protect your flock, your livelihood, and the farms around you. We will look at what avian influenza is and where it stands now, how it spreads and gets onto farms, your legal duty to report it, and how an outbreak is handled. Then we will turn to the emerging and re-emerging diseases on the radar in Canada, how surveillance catches them early, and the part you play in keeping the whole industry ahead of the next threat.'));

  // Agenda (locked headings)
  children.push(sectionHead('Agenda'));
  children.push(numbered(1, 'Staying Current: Why Hot Topics Matter'));
  children.push(subItem('a', 'What hot topics are and why they matter to your farm'));
  children.push(subItem('b', 'Where to get reliable, current information'));
  children.push(numbered(2, 'Avian Influenza'));
  children.push(subItem('a', 'What avian influenza is and the current situation'));
  children.push(subItem('b', 'How it spreads and gets onto farms'));
  children.push(subItem('c', 'Recognizing it and your legal duty to report'));
  children.push(subItem('d', 'The outbreak response and protecting your farm'));
  children.push(numbered(3, 'Emerging and Re-Emerging Disease Issues'));
  children.push(subItem('a', 'What emerging means and what drives it'));
  children.push(subItem('b', 'Diseases on the radar in Canada'));
  children.push(subItem('c', 'Surveillance and early warning'));
  children.push(subItem('d', 'What farmers should do'));

  // Learning Objectives
  children.push(sectionHead('Learning Objectives'));
  children.push(numbered(1, 'Explain why staying current on poultry hot topics protects your farm, and where to find reliable information.'));
  children.push(numbered(2, 'Describe what avian influenza is, the difference between low and high pathogenic strains, and where the disease stands today in Canada and globally.'));
  children.push(numbered(3, 'Recognize the warning signs of avian influenza and carry out your legal duty to report a suspected case to the CFIA.'));
  children.push(numbered(4, 'Understand how an avian influenza outbreak is handled in Canada, and the biosecurity steps that protect your flock during high-risk periods.'));
  children.push(numbered(5, 'Explain what makes a disease emerging or re-emerging, and name the disease issues currently on the radar in Canada.'));
  children.push(numbered(6, 'Understand how disease surveillance and early-warning systems work, and the part you play in them.'));

  // Important Notes
  children.push(sectionHead('Important Notes'));
  children.push(bullet('Participants should bring note-taking items.'));
  children.push(bullet('A certificate of completion is available to all participants.'));
  children.push(bullet('Hot-topic content changes quickly. Always confirm the current disease situation with the CFIA and your veterinarian.'));

  const doc = new Document({
    creator: 'CPC Short Courses',
    title: `${COURSE_TITLE} — Course Summary`,
    description: 'Course 18 Summary Page — CPC Short Courses',
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
