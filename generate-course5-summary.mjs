// ============================================================
// generate-course5-summary.mjs
// Produces Course 5 Summary Page as a standalone .docx
// Run: node generate-course5-summary.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, PageNumber, BorderStyle,
  WidthType, convertInchesToTwip, HeadingLevel,
  LevelFormat, ImageRun,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE  = path.join(__dirname, 'Course 5', 'Sustainability_Summary_Page.docx');
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
const run  = (text, opts = {}) => new TextRun({ text, font: 'Calibri', size: opts.size || 24, color: opts.color || BODY, bold: opts.bold || false, italics: opts.italics || false });
const para = (text, opts = {}) => new Paragraph({
  children: Array.isArray(text)
    ? text.map(s => run(s.text, s))
    : [run(text, opts)],
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

function bullet(text, lvl = 0) {
  const indent = lvl === 0
    ? { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) }
    : { left: convertInchesToTwip(0.8), hanging: convertInchesToTwip(0.2) };
  const marker = lvl === 0 ? '•' : '◦';
  return new Paragraph({
    children: [run(`${marker}  ${text}`, { size: 23 })],
    spacing: { after: 70, line: 276, lineRule: 'auto' },
    indent,
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
  return new Header({
    children: [new Paragraph({
      children: [
        run('CPC Short Courses  |  ', { size: 18, color: '888888' }),
        run('Sustainability in Poultry Farming — Course Summary', { size: 18, color: MED_BLUE, bold: true }),
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
        run('CPC Short Courses  |  Course 5  |  Page ', { size: 18, color: '888888' }),
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
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const coverChildren = [
    new Paragraph({ children: [run('')], spacing: { before: 1200, after: 0 } }),
    new Paragraph({
      children: [run('COURSE 5: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
    }),
  ];

  if (logoBuffer) {
    let lw = 144, lh = 144;
    try {
      const v = new DataView(logoBuffer.buffer, logoBuffer.byteOffset);
      const pw = v.getUint32(16, false), ph = v.getUint32(20, false);
      if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw);
    } catch (_) {}
    coverChildren.push(new Paragraph({
      children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 200 },
    }));
  }

  coverChildren.push(
    new Paragraph({
      children: [run('Sustainability in Poultry Farming', { bold: true, color: DARK_BLUE, size: 52 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 120 },
    }),
    new Paragraph({
      children: [run('Course Summary Page', { color: MED_BLUE, size: 28, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
    }),
    new Paragraph({
      children: [run('')],
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
      spacing: { before: 0, after: 360 },
    }),
    new Paragraph({
      children: [run('CPC Short Courses', { bold: true, color: '595959', size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
    }),
    new Paragraph({
      children: [run('Duration: 2-Hour Lecture', { color: '595959', size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
    }),
    new Paragraph({
      children: [run('May 2026', { color: '595959', size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 700 },
    }),
    new Paragraph({
      children: [run('This course has been developed for educational purposes for commercial poultry farmers in Canada.', { color: '808080', size: 18, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
  );

  // ---- Body section ----
  const body = [
    // Title line
    new Paragraph({
      children: [run('5.  Sustainability', { bold: true, size: 36, color: DARK_BLUE })],
      spacing: { before: 0, after: 60 },
    }),
    new Paragraph({
      children: [run('Course Duration: 2-hour lecture', { size: 23, italics: true, color: '595959' })],
      spacing: { before: 0, after: 280 },
    }),

    // Introduction
    sectionHead('Introduction'),
    para('Sustainability in poultry farming comes down to raising birds in a way that does not wear out your land, keeps your flock healthy, and keeps the farm profitable not just this cycle but for years to come. Demand for chicken is not dropping off, but neither are feed costs, waste management requirements, or the pressure from regulators and neighbours to manage what comes off your property. Sustainable practices are the smart path forward: they cut costs, improve efficiency, and help you raise cleaner, healthier birds. In short, running a sustainable operation is not just good for the environment. It is good for your bottom line.'),
    para('In this course, we cover practical, low-cost methods you can put to work right now to save resources, reduce pollution, improve how the barn runs, and build a farm that holds up through tight margins and tougher regulations. Sustainability is not about one big overhaul or expensive technology. It is about small, smart decisions you make every grow-out that add up for both the operation and the community around it.'),

    // Agenda
    sectionHead('Agenda'),
    numbered(1,  'Welcome and Introduction'),
    subItem('a', 'What sustainability means on a working farm'),
    subItem('b', 'Why it matters for poultry farmers right now'),
    numbered(2,  'Environmental Impact of Poultry Farming'),
    subItem('a', 'Water, soil, and air management'),
    subItem('b', 'Common environmental challenges of commercial production'),
    numbered(3,  'Efficient Use of Resources'),
    subItem('a', 'Cutting feed waste'),
    subItem('b', 'Water-saving practices'),
    subItem('c', 'Getting smarter about energy use on the farm'),
    numbered(4,  'Manure and Waste Management'),
    subItem('a', 'Putting litter to work as fertilizer'),
    subItem('b', 'Reducing odor and pollution'),
    subItem('c', 'Safe storage and handling'),
    numbered(5,  'Animal Welfare and Flock Health'),
    subItem('a', 'How healthy birds connect to sustainable production'),
    subItem('b', 'Housing, ventilation, and stress reduction'),
    numbered(6,  'Low-Cost Sustainable Solutions'),
    subItem('a', 'Composting and reuse of materials'),
    subItem('b', 'Making better use of natural light and airflow'),
    subItem('c', 'Affordable renewable energy options: solar and biogas'),
    numbered(7,  'Economic Benefits of Sustainability'),
    subItem('a', 'Where the real cost savings show up'),
    subItem('b', 'How sustainable practices strengthen your market position'),
    subItem('c', 'What long-term farm resilience looks like'),
    numbered(8,  'Farmer Self-Assessment'),
    subItem('a', 'Taking an honest look at your own operation'),
    subItem('b', 'Finding the improvements that will actually make a difference'),
    numbered(9,  'Q and A / Sharing Experiences'),
    subItem('a', 'Your practical challenges'),
    subItem('b', 'What has actually worked for other farmers'),
    numbered(10, 'Summary and Key Takeaways'),

    // Learning Objectives
    sectionHead('Learning Objectives'),
    numbered(1,  'Understand what sustainability actually means for a commercial poultry operation and why it matters for keeping the farm running and profitable long-term.'),
    numbered(2,  'Identify farming practices that cut waste, save money, and protect the land and water your operation depends on.'),
    numbered(3,  'Recognize the real impacts of commercial chicken production on soil, water, air, and the people living nearby, both the benefits and the problems to manage.'),
    numbered(4,  'Get more value out of every kilogram of feed, every liter of water, every kilowatt of power, and every building on the property so nothing is going to waste.'),
    numbered(5,  'Apply sound manure management so your litter builds soil health instead of becoming a runoff problem or a regulatory headache.'),
    numbered(6,  'Run the flock in a way that keeps birds healthy and comfortable, cutting down on the losses that better management would have prevented.'),
    numbered(7,  "Evaluate whether renewable energy options like solar panels or biogas are a realistic fit for your farm's scale and budget."),
    numbered(8,  'Assess your own operation honestly, identify the gaps, and come away with a few concrete changes you can make in the next grow-out.'),
    numbered(9,  'Understand that a well-managed sustainable farm is also a more profitable farm, with lower input costs, better performance, and a stronger position in the market.'),

    // Important Notes
    sectionHead('Important Notes'),
    bullet('Participants should bring note-taking items.'),
    bullet('A certificate of completion is available to all participants.'),
  ];

  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       'Sustainability in Poultry Farming — Course Summary',
    description: 'Course 5 Summary Page — CPC Short Courses',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 24, color: BODY }, paragraph: { spacing: { after: 140 } } },
      },
    },
    sections: [
      {
        properties: { titlePage: true, page: { margin: pageMargin } },
        headers: { first: new Header({ children: [new Paragraph({ children: [] })] }) },
        footers: { first: new Footer({ children: [new Paragraph({ children: [] })] }) },
        children: coverChildren,
      },
      {
        properties: { page: { margin: pageMargin } },
        headers: { default: buildHeader() },
        footers: { default: buildFooter() },
        children: body,
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_FILE, buf);
  console.log('Done:', OUT_FILE);
  console.log('Size:', (buf.length / 1024).toFixed(1), 'KB');
}

main().catch(e => { console.error(e); process.exit(1); });
