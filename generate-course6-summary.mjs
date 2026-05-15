// ============================================================
// generate-course6-summary.mjs
// Produces Course 6 Summary Page as a standalone .docx
// Single-section layout matching Course 5 summary format
// Run: node generate-course6-summary.mjs
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
const OUT_FILE  = path.join(__dirname, 'Course 6', 'Summary_Page_Course6_PoultryAnatomy.docx');
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
        run('Poultry Anatomy and Physiology', { size: 18, color: MED_BLUE, bold: true }),
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
        run('CPC Short Courses  |  Course 6  |  Page ', { size: 18, color: '888888' }),
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

  // Course label
  children.push(new Paragraph({
    children: [run('COURSE 6: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
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
    children: [run('Poultry Anatomy and Physiology', { bold: true, color: DARK_BLUE, size: 52 })],
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
  children.push(para('Duration: 2-Hour Lecture', { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 80 }));
  children.push(para('May 2026',                  { color: '595959', size: 22, alignment: AlignmentType.CENTER, after: 360 }));

  // ---- Content starts here — no page break ----

  // Introduction
  children.push(sectionHead('Introduction'));
  children.push(para('Understanding how a chicken\'s body works is one of the most practical things a farmer can know. How a bird is built shapes every management decision on the farm, from ventilation targets to feed particle size to lighting schedules. Meat birds, layers, and breeders may look similar at a glance, but their bodies are built for very different jobs. Broilers deposit breast muscle at a rate that puts constant pressure on the cardiovascular system. Layers cycle calcium through their skeleton every single day to build eggshells. Breeders have to balance both.'));
  children.push(para('In this course, farmers explore the key body systems of the chicken and learn how those physiological differences drive real management decisions. Understanding the bird helps you catch problems earlier, feed and house each production type correctly, and make smarter calls when something goes wrong.'));

  // Agenda
  children.push(sectionHead('Agenda'));
  children.push(numbered(1, 'Introduction to Poultry Anatomy and Physiology'));
  children.push(subItem('a', 'Why understanding the bird\'s body matters'));
  children.push(subItem('b', 'Differences between meat birds and layers and breeders'));
  children.push(numbered(2, 'External Anatomy'));
  children.push(subItem('a', 'Key body parts and their functions'));
  children.push(subItem('b', 'Signs of health seen from the outside'));
  children.push(numbered(3, 'Internal Body Systems Overview'));
  children.push(subItem('a', 'Digestive system'));
  children.push(subItem('b', 'Respiratory system'));
  children.push(subItem('c', 'Circulatory system'));
  children.push(subItem('d', 'Skeletal and muscular systems'));
  children.push(subItem('e', 'Reproductive system'));
  children.push(numbered(4, 'Meat Birds (Broilers)'));
  children.push(subItem('a', 'Anatomy built for rapid muscle growth'));
  children.push(subItem('b', 'Feed conversion and metabolism'));
  children.push(subItem('c', 'Common health challenges'));
  children.push(subItem('d', 'Key management considerations'));
  children.push(numbered(5, 'Layers and Breeders'));
  children.push(subItem('a', 'Anatomy for egg production and reproduction'));
  children.push(subItem('b', 'Reproductive tract and egg formation'));
  children.push(subItem('c', 'Nutritional needs to support laying and fertility'));
  children.push(subItem('d', 'Health issues specific to layers and breeders'));
  children.push(numbered(6, 'Comparing Meat Birds vs Layers and Breeders'));
  children.push(subItem('a', 'Growth patterns'));
  children.push(subItem('b', 'Body structure'));
  children.push(subItem('c', 'Metabolic differences'));
  children.push(subItem('d', 'Housing and management implications'));
  children.push(numbered(7, 'Practical Application for Farmers'));
  children.push(subItem('a', 'Feeding strategies'));
  children.push(subItem('b', 'Housing adjustments'));
  children.push(subItem('c', 'Health monitoring'));
  children.push(subItem('d', 'Handling and welfare considerations'));
  children.push(numbered(8, 'Summary and Key Takeaways'));
  children.push(subItem('a', 'Review of major points'));
  children.push(subItem('b', 'Q and A or discussion'));

  // Learning Objectives
  children.push(sectionHead('Learning Objectives'));
  children.push(numbered(1, 'Identify the major external and internal body parts of poultry and explain what each one actually does.'));
  children.push(numbered(2, 'Describe the key differences in anatomy and physiology between meat birds, layers, and breeders.'));
  children.push(numbered(3, "Understand how a bird's body directly affects production: growth, egg laying, fertility, and health."));
  children.push(numbered(4, 'Recognize the health indicators tied to specific body systems, so you know where to look and what to look for.'));
  children.push(numbered(5, 'Apply the right management practices for each bird type, whether you are raising birds for meat or eggs.'));
  children.push(numbered(6, 'Adjust feeding, housing, and daily care to match the physiological needs of each production category.'));
  children.push(numbered(7, 'Use basic anatomical knowledge to make early calls that prevent disease, cut losses, and improve performance.'));

  // Important Notes
  children.push(sectionHead('Important Notes'));
  children.push(bullet('Participants should bring note-taking items.'));
  children.push(bullet('A certificate of completion is available to all participants.'));

  // ---- Build document ----
  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       'Poultry Anatomy and Physiology — Course Summary',
    description: 'Course 6 Summary Page — CPC Short Courses',
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
