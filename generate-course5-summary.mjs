// ============================================================
// generate-course5-summary.mjs
// Produces Course 5 Summary Page as a standalone .docx
// Single-section layout matching Course 4 summary format
// Run: node generate-course5-summary.mjs
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
        run('Sustainability in Poultry Farming', { size: 18, color: MED_BLUE, bold: true }),
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
        run('CPC Short Courses  |  Course 5  |  Page ', { size: 18, color: '888888' }),
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

  // ---- Cover block (no page break — flows directly into content) ----
  // Top spacer
  children.push(new Paragraph({ children: [run('')], spacing: { before: 480, after: 0 } }));

  // Course label
  children.push(new Paragraph({
    children: [run('COURSE 5: CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 24 })],
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
    children: [run('Sustainability in Poultry Farming', { bold: true, color: DARK_BLUE, size: 52 })],
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
  children.push(para('Sustainability in poultry farming comes down to raising birds in a way that does not wear out your land, keeps your flock healthy, and keeps the farm profitable not just this cycle but for years to come. Demand for chicken is not dropping off, but neither are feed costs, waste management requirements, or the pressure from regulators and neighbours to manage what comes off your property. Sustainable practices are the smart path forward: they cut costs, improve efficiency, and help you raise cleaner, healthier birds. In short, running a sustainable operation is not just good for the environment. It is good for your bottom line.'));
  children.push(para('In this course, we cover practical, low-cost methods you can put to work right now to save resources, reduce pollution, improve how the barn runs, and build a farm that holds up through tight margins and tougher regulations. Sustainability is not about one big overhaul or expensive technology. It is about small, smart decisions you make every grow-out that add up for both the operation and the community around it.'));

  // Agenda
  children.push(sectionHead('Agenda'));
  children.push(numbered(1,  'Welcome and Introduction'));
  children.push(subItem('a', 'What sustainability means on a working farm'));
  children.push(subItem('b', 'Why it matters for poultry farmers right now'));
  children.push(numbered(2,  'Environmental Impact of Poultry Farming'));
  children.push(subItem('a', 'Water, soil, and air management'));
  children.push(subItem('b', 'Common environmental challenges of commercial production'));
  children.push(numbered(3,  'Efficient Use of Resources'));
  children.push(subItem('a', 'Cutting feed waste'));
  children.push(subItem('b', 'Water-saving practices'));
  children.push(subItem('c', 'Getting smarter about energy use on the farm'));
  children.push(numbered(4,  'Manure and Waste Management'));
  children.push(subItem('a', 'Putting litter to work as fertilizer'));
  children.push(subItem('b', 'Reducing odor and pollution'));
  children.push(subItem('c', 'Safe storage and handling'));
  children.push(numbered(5,  'Animal Welfare and Flock Health'));
  children.push(subItem('a', 'How healthy birds connect to sustainable production'));
  children.push(subItem('b', 'Housing, ventilation, and stress reduction'));
  children.push(numbered(6,  'Low-Cost Sustainable Solutions'));
  children.push(subItem('a', 'Composting and reuse of materials'));
  children.push(subItem('b', 'Making better use of natural light and airflow'));
  children.push(subItem('c', 'Affordable renewable energy options: solar and biogas'));
  children.push(numbered(7,  'Economic Benefits of Sustainability'));
  children.push(subItem('a', 'Where the real cost savings show up'));
  children.push(subItem('b', 'How sustainable practices strengthen your market position'));
  children.push(subItem('c', 'What long-term farm resilience looks like'));
  children.push(numbered(8,  'Farmer Self-Assessment'));
  children.push(subItem('a', 'Taking an honest look at your own operation'));
  children.push(subItem('b', 'Finding the improvements that will actually make a difference'));
  children.push(numbered(9,  'Q and A / Sharing Experiences'));
  children.push(subItem('a', 'Your practical challenges'));
  children.push(subItem('b', 'What has actually worked for other farmers'));
  children.push(numbered(10, 'Summary and Key Takeaways'));

  // Learning Objectives
  children.push(sectionHead('Learning Objectives'));
  children.push(numbered(1,  'Understand what sustainability actually means for a commercial poultry operation and why it matters for keeping the farm running and profitable long-term.'));
  children.push(numbered(2,  'Identify farming practices that cut waste, save money, and protect the land and water your operation depends on.'));
  children.push(numbered(3,  'Recognize the real impacts of commercial chicken production on soil, water, air, and the people living nearby, both the benefits and the problems to manage.'));
  children.push(numbered(4,  'Get more value out of every kilogram of feed, every liter of water, every kilowatt of power, and every building on the property so nothing is going to waste.'));
  children.push(numbered(5,  'Apply sound manure management so your litter builds soil health instead of becoming a runoff problem or a regulatory headache.'));
  children.push(numbered(6,  'Run the flock in a way that keeps birds healthy and comfortable, cutting down on the losses that better management would have prevented.'));
  children.push(numbered(7,  "Evaluate whether renewable energy options like solar panels or biogas are a realistic fit for your farm's scale and budget."));
  children.push(numbered(8,  'Assess your own operation honestly, identify the gaps, and come away with a few concrete changes you can make in the next grow-out.'));
  children.push(numbered(9,  'Understand that a well-managed sustainable farm is also a more profitable farm, with lower input costs, better performance, and a stronger position in the market.'));

  // Important Notes
  children.push(sectionHead('Important Notes'));
  children.push(bullet('Participants should bring note-taking items.'));
  children.push(bullet('A certificate of completion is available to all participants.'));

  // ---- Build document ----
  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       'Sustainability in Poultry Farming — Course Summary',
    description: 'Course 5 Summary Page — CPC Short Courses',
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
