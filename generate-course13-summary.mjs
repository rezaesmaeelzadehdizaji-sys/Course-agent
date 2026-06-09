// ============================================================
// generate-course13-summary.mjs
// Course 13: Poultry Welfare — CPC Short Courses Summary Page
// Run: node generate-course13-summary.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, PageNumber, BorderStyle, convertInchesToTwip, ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 13');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course13_PoultryWelfare.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const MED_BLUE  = '2E74B5';
const DARK_BLUE = '1F3864';
const GOLD      = 'C9A84C';
const BODY_GRAY = '3C3C3C';
const GRAY_TEXT = '595959';

const pageMargin = {
  top:    convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left:   convertInchesToTwip(1.25),
  right:  convertInchesToTwip(1.25),
};

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

function p(children, opts = {}) {
  const arr = typeof children === 'string'
    ? [run(children, opts)]
    : children;
  return new Paragraph({
    children: arr,
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: opts.after !== undefined ? opts.after : 160, line: 276, lineRule: 'auto' },
    border: opts.border || undefined,
  });
}

function sectionHead(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MED_BLUE, size: 28, font: 'Calibri' })],
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
  });
}

function agendaNum(n, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${n}.  `, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' }),
    ],
    spacing: { before: 80, after: 40 },
  });
}

function agendaSub(letter, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `     ${letter}.  `, color: '888888', size: 22, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' }),
    ],
    spacing: { before: 20, after: 20 },
    indent: { left: convertInchesToTwip(0.2) },
  });
}

function agendaItem(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: '     •  ', color: '888888', size: 22, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' }),
    ],
    spacing: { before: 20, after: 20 },
    indent: { left: convertInchesToTwip(0.3) },
  });
}

function loNum(n, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${n}.  `, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' }),
    ],
    spacing: { before: 60, after: 60 },
  });
}

function noteBullet(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: '•  ', color: MED_BLUE, size: 24, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' }),
    ],
    spacing: { before: 40, after: 40 },
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
          new TextRun({ text: 'Poultry Welfare', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 13  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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

// ============================================================
// DOCUMENT CHILDREN
// ============================================================
const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

const children = [];

// --- COVER BLOCK ---
children.push(
  new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 480, after: 0 } }),

  new Paragraph({
    children: [new TextRun({ text: 'COURSE 13: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
);

if (logoBuffer) {
  let lw = 130, lh = 130;
  try {
    const view = new DataView(logoBuffer.buffer, logoBuffer.byteOffset);
    const pw   = view.getUint32(16, false);
    const ph   = view.getUint32(20, false);
    if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw);
  } catch (_) {}
  children.push(new Paragraph({
    children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  }));
}

children.push(
  new Paragraph({
    children: [new TextRun({ text: 'Poultry Welfare', bold: true, color: DARK_BLUE, size: 44, font: 'Calibri Light' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 100 },
  }),

  new Paragraph({
    children: [new TextRun({ text: 'Course Summary', italics: true, color: MED_BLUE, size: 26, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
  }),

  new Paragraph({
    children: [new TextRun({ text: '' })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
    spacing: { before: 0, after: 280 },
  }),

  new Paragraph({
    children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: GRAY_TEXT, size: 24, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
  }),

  new Paragraph({
    children: [new TextRun({ text: 'Duration: 1-Hour Lecture', color: GRAY_TEXT, size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
  }),

  new Paragraph({
    children: [new TextRun({ text: 'June 2026', color: GRAY_TEXT, size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
  }),
);

// --- INTRODUCTION ---
children.push(
  sectionHead('Introduction'),

  p('Poultry welfare is the foundation of every healthy, productive farm. When birds are comfortable, well-fed, and living in a clean environment, they grow better, lay more consistently, and get sick less often. Good welfare is not a separate task from good farming. It is the result of getting the basics right every day.'),
  p('This course covers the core principles of poultry welfare in practical terms you can apply on broiler, layer, and breeder farms. You will learn what welfare means on a working farm, how to spot problems before they affect production, and what management changes make the biggest difference.'),
);

// --- AGENDA ---
children.push(
  sectionHead('Agenda'),

  agendaNum(1, 'Understanding Poultry Welfare'),
  agendaSub('a', 'Definition and importance'),
  agendaSub('b', 'The "Five Freedoms" / "Five Domains" explained'),
  agendaSub('c', 'How welfare affects farm performance and disease risk'),

  agendaNum(2, 'Key Welfare Needs for Poultry'),
  agendaSub('a', 'Nutrition & Water: quality, access, consistency'),
  agendaSub('b', 'Environment: temperature, ventilation, lighting, litter'),
  agendaSub('c', 'Health Care: early detection, treatment, culling'),
  agendaSub('d', 'Behavior: space to move, perch (for layers), dust bathing'),
  agendaSub('e', 'Social/Human Interaction: calm handling and reduced stress'),

  agendaNum(3, 'Welfare Indicators Farmers Should Monitor'),
  agendaSub('a', 'Behavior and activity levels'),
  agendaSub('b', 'Feather condition and pecking injuries'),
  agendaSub('c', 'Footpad health, hock burns, keel bone condition'),
  agendaSub('d', 'Mortality patterns'),
  agendaSub('e', 'Growth and productivity changes'),

  agendaNum(4, 'Welfare in Different Production Systems'),
  agendaSub('a', 'Broiler-specific welfare needs'),
  agendaSub('b', 'Layer & breeder considerations'),
  agendaSub('c', 'Special attention to high-density housing'),

  agendaNum(5, 'Reducing Stress and Improving Environment'),
  agendaSub('a', 'Temperature control at different ages'),
  agendaSub('b', 'Proper ventilation and ammonia reduction'),
  agendaSub('c', 'Litter quality management'),
  agendaSub('d', 'Lighting programs for welfare and productivity'),

  agendaNum(6, 'Handling, Transport, and Slaughter Welfare'),
  agendaSub('a', 'Calm bird handling techniques'),
  agendaSub('b', 'Reducing injury and stress during transport'),
  agendaSub('c', 'Humane slaughter and euthanasia basics'),

  agendaNum(7, "Farm Workers' Role in Welfare"),
  agendaSub('a', 'Daily welfare checks'),
  agendaSub('b', 'Reporting problems early'),
  agendaSub('c', 'Training and competence'),

  new Paragraph({
    children: [new TextRun({ text: 'Practical Demonstrations', bold: true, color: DARK_BLUE, size: 24, font: 'Calibri' })],
    spacing: { before: 120, after: 40 },
  }),
  agendaItem('Live welfare assessment walk-through'),
  agendaItem('Using checklists and scoring tools'),
);

// --- LEARNING OBJECTIVES ---
children.push(
  sectionHead('Learning Objectives'),

  loNum(1, 'Define poultry welfare and explain why it is essential for production and sustainability.'),
  loNum(2, 'Describe the core welfare principles (Five Freedoms / Five Domains).'),
  loNum(3, 'Identify practical on-farm welfare needs for broilers, layers, and breeders.'),
  loNum(4, 'Recognize key indicators of good and poor welfare.'),
  loNum(5, 'Conduct basic welfare assessments using simple checklists.'),
  loNum(6, 'Improve environmental conditions to reduce stress and disease.'),
  loNum(7, 'Handle, transport, and manage birds in a low-stress, humane manner.'),
  loNum(8, 'Integrate welfare practices into daily farm routines to promote healthy, productive flocks.'),
);

// --- IMPORTANT NOTES ---
children.push(
  sectionHead('Important Notes'),
  noteBullet('Participants should bring note-taking items.'),
  noteBullet('A certificate of completion is available to all participants.'),
);

// ============================================================
// BUILD + POST-PATCH
// ============================================================
(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: pageMargin } },
      headers:    { default: buildHeader() },
      footers:    { default: buildFooter() },
      children,
    }],
  });

  let buffer = await Packer.toBuffer(doc);

  // Patch: strip w:dirty, set updateFields=false
  const zip = await JSZip.loadAsync(buffer);

  let docXml  = await zip.file('word/document.xml').async('string');
  let settings = await zip.file('word/settings.xml').async('string');

  docXml   = docXml.replace(/\s*w:dirty="true"/g, '');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!settings.includes('<w:updateFields')) {
    settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  }

  // Em dash check
  const em = (docXml.match(/—/g) || []).length;
  if (em > 0) console.warn(`Em dash check: ${em} found in summary page XML`);
  else console.log('Em dash check: PASSED');

  zip.file('word/document.xml', docXml);
  zip.file('word/settings.xml', settings);

  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, buffer);

  console.log('Done:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
})();
