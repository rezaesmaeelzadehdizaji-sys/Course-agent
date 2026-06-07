// ============================================================
// generate-course10-summary.mjs
// Produces Course 10 Summary Page as a standalone .docx
// Single-section layout matching Course 5 / Course 9 summary format
// Run: node generate-course10-summary.mjs
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
const OUT_DIR   = path.join(__dirname, 'Course 10');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course10_Necropsy_Normal_Birds.docx');
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

const run = (text, opts = {}) => new TextRun({
  text, font: 'Calibri',
  size: opts.size || 24, color: opts.color || BODY,
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
    children: [run(`${n}.  `, { size: 23, bold: true, color: MED_BLUE }), run(text, { size: 23 })],
    spacing: { after: 70, line: 276, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.25) },
  });
}
function subItem(letter, text) {
  return new Paragraph({
    children: [run(`${letter}.  `, { size: 22, color: '888888' }), run(text, { size: 22 })],
    spacing: { after: 60, line: 276, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.8), hanging: convertInchesToTwip(0.25) },
  });
}
function buildHeader() {
  return new Header({
    children: [new Paragraph({
      children: [
        run('CPC Short Courses  |  ', { size: 18, color: '888888' }),
        run('Necropsy of Normal Birds', { size: 18, color: MED_BLUE, bold: true }),
      ],
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
    })],
  });
}
function buildFooter() {
  return new Footer({
    children: [new Paragraph({
      children: [
        run('CPC Short Courses  |  Course 10  |  Page ', { size: 18, color: '888888' }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '888888', font: 'Calibri' }),
        run(' of ', { size: 18, color: '888888' }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '888888', font: 'Calibri' }),
      ],
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
    })],
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const children = [];

  // ---- Cover block (flows into content, no page break) ----
  children.push(new Paragraph({ children: [run('')], spacing: { before: 480, after: 0 } }));
  children.push(new Paragraph({
    children: [run('COURSE 10: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
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
    children: [run('Necropsy of Normal Birds', { bold: true, color: DARK_BLUE, size: 50 })],
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
  children.push(para('Duration: 1-Hour Lecture, 1-Hour Workshop', { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('Prerequisite: Course 6 (Poultry Anatomy and Physiology)', { color: '595959', size: 22, italics: true, alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('June 2026', { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 360 }));

  // ---- Introduction (humanized to Farmer-Flow) ----
  children.push(sectionHead('Introduction'));
  children.push(para('A necropsy, the careful post-mortem look inside a bird, is one of the most useful tools you have for understanding flock health. But here is the catch: you cannot spot an abnormal organ until you know exactly what a healthy one looks like. This hands-on module fixes that. We open healthy birds on purpose and walk every organ, learning the normal color, size, and feel before we ever talk about disease.'));
  children.push(para('Because a fast-growing meat bird and a hen in full lay are built for very different jobs, their insides look different too. The session covers both broilers and layers and breeders, side by side, so you can read either bird with confidence. That foundation helps you catch disease early, spot a feed or management problem, and talk clearly with your veterinarian and the diagnostic lab.'));

  // ---- Agenda (headings match course body H1/H2) ----
  children.push(sectionHead('Agenda'));
  children.push(numbered(1, 'Purpose of Conducting a Necropsy on Normal Birds'));
  children.push(subItem('a', 'Why it is important to learn normal anatomy'));
  children.push(subItem('b', 'How baseline knowledge improves disease detection'));
  children.push(numbered(2, 'General Necropsy Procedure'));
  children.push(subItem('a', 'Needed tools, preparation, and biosecurity'));
  children.push(subItem('b', 'Opening the bird and exposing the organ systems'));
  children.push(numbered(3, 'Normal Anatomy Overview (All Bird Types)'));
  children.push(subItem('a', 'External examination: skin, feathers, joints, and feet'));
  children.push(subItem('b', 'Internal organs: heart, lungs, liver, spleen, and intestines'));
  children.push(subItem('c', 'Normal colors, textures, and organ sizes'));
  children.push(numbered(4, 'Normal Meat Bird Features (Broilers)'));
  children.push(subItem('a', 'Musculoskeletal development and the large breast muscles'));
  children.push(subItem('b', 'Heart, liver, and metabolic features in fast-growing birds'));
  children.push(subItem('c', 'Typical gastrointestinal tract condition'));
  children.push(subItem('d', 'Normal reproductive structures'));
  children.push(numbered(5, 'Normal Layer and Breeder Features'));
  children.push(subItem('a', 'Reproductive system: ovary, oviduct, and egg development'));
  children.push(subItem('b', 'Bone health and keel evaluation'));
  children.push(subItem('c', 'Organ size and fat distribution in productive hens'));
  children.push(numbered(6, 'Comparing Bird Types: Key Differences to Note'));
  children.push(subItem('a', 'Growth versus reproduction priorities'));
  children.push(subItem('b', 'Body fat, muscle mass, and organ development'));
  children.push(subItem('c', 'How production stage influences necropsy findings'));
  children.push(numbered(7, 'Common Mistakes to Avoid'));
  children.push(subItem('a', 'Misinterpreting natural variations'));
  children.push(subItem('b', 'Poor sampling or contamination'));
  children.push(subItem('c', 'Ignoring age-related differences'));
  children.push(numbered(8, 'Hands-On Demonstration and Case Review'));
  children.push(subItem('a', 'Walk-through necropsy of a broiler and a layer'));
  children.push(subItem('b', 'Identifying healthy organs in both types'));

  // ---- Learning Objectives (humanized, source wording as baseline) ----
  children.push(sectionHead('Learning Objectives'));
  children.push(numbered(1, 'Explain why opening a healthy bird is the foundation for ever recognizing a sick one.'));
  children.push(numbered(2, 'Carry out a basic necropsy safely and correctly, following proper biosecurity.'));
  children.push(numbered(3, 'Identify the normal structures of all the major organ systems.'));
  children.push(numbered(4, 'Recognize the normal growth features of meat birds (broilers).'));
  children.push(numbered(5, 'Describe the normal reproductive features of layers and breeders.'));
  children.push(numbered(6, 'Compare normal anatomy between fast-growing broilers and egg-producing hens.'));
  children.push(numbered(7, 'Tell normal findings apart from early signs of disease, nutritional shortfall, or a management slip.'));
  children.push(numbered(8, 'Use what you see on the table to support better flock health management and decisions.'));

  // ---- Important Notes (kept as source) ----
  children.push(sectionHead('Important Notes'));
  children.push(bullet('Participants should bring note-taking items.'));
  children.push(bullet('Canadian Poultry Consultants will provide boot covers, gloves, and coveralls for the workshop.'));
  children.push(bullet('A certificate of completion is available to all participants.'));

  const doc = new Document({
    creator: 'CPC Short Courses',
    title: 'Necropsy of Normal Birds — Course Summary',
    description: 'Course 10 Summary Page — CPC Short Courses',
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
