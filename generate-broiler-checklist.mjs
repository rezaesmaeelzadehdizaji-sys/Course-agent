// ============================================================
// generate-broiler-checklist.mjs — CPC Broiler Weekly Management Checklist (Weeks 1-6)
// Ross 308 growth targets (Aviagen) + CPC temperature and lighting targets
// CPC-branded handout. American English, no em/en dashes.
// Run: node generate-broiler-checklist.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, PageNumber, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, convertInchesToTwip, ImageRun, HeightRule,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'CPC Checklists');
const OUT_FILE  = path.join(OUT_DIR, 'CPC_Broiler_Weekly_Checklist.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

function run(text, opts = {}) {
  return new TextRun({
    text, bold: opts.bold || false, italics: opts.italics || false,
    color: opts.color || BODY_GRAY, size: opts.size || 22, font: opts.font || 'Calibri',
  });
}
function para(text, opts = {}) {
  return new Paragraph({
    children: Array.isArray(text) ? text : [run(text, opts)],
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: { after: opts.after !== undefined ? opts.after : 120, line: 276, lineRule: 'auto' },
  });
}
function weekHead(text) {
  return new Paragraph({
    children: [run(text, { bold: true, color: MED_BLUE, size: 26, font: 'Calibri Light' })],
    spacing: { before: 240, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  });
}
function check(text) {
  return new Paragraph({
    children: [
      run('☐  ', { font: 'Segoe UI Symbol', size: 24, color: MED_BLUE }),
      ...(Array.isArray(text) ? text : [run(text)]),
    ],
    indent: { left: convertInchesToTwip(0.32), hanging: convertInchesToTwip(0.32) },
    spacing: { after: 70, line: 276, lineRule: 'auto' },
  });
}

function buildHeader() {
  return new Header({ children: [ new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ text: 'Broiler Weekly Management Checklist', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  }) ] });
}
function buildFooter() {
  return new Footer({ children: [ new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  Broiler Weekly Checklist  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.CURRENT], color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ text: ' of ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], color: '888888', size: 18, font: 'Calibri' }),
    ],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  }) ] });
}

const pageMargin = { top: convertInchesToTwip(0.9), bottom: convertInchesToTwip(0.9), left: convertInchesToTwip(1), right: convertInchesToTwip(1) };

// ---- at-a-glance table ----
function glanceTable() {
  const colW = [440, 700, 900, 1240, 560, 1420, 2080, 1300]; // twips, sum = 8640
  const hdrBg = MED_BLUE, altBg = 'EBF2FA';
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
  const ACTUAL = 3; // index of the blank "Actual (your weight)" column
  const hdrCell = (t, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA }, borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: i === ACTUAL ? GOLD : hdrBg },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 50, after: 50 }, children: [run(t, { bold: true, size: 16, color: i === ACTUAL ? DARK_BLUE : 'FFFFFF' })] })],
  });
  const dataCell = (t, i, shade, bold = false) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA }, borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: i === ACTUAL ? 'FFFDF3' : (shade ? altBg : 'FFFFFF') },
    children: [new Paragraph({ alignment: (i <= 5 && i !== ACTUAL) ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: 40, after: 40 }, children: [run(t, { size: 17, color: BODY_GRAY, bold })] })],
  });
  const headers = ['Wk', 'Days', 'Target wt', 'Actual (your wt)', 'FCR', 'House temp (bird level)', 'Light : Dark, lux', 'Feed'];
  const rows = [
    ['0', 'Day 0 (place)', '~44 g', '', '-', '32-34°C', '18 : 6, 50-100 lux', 'Starter'],
    ['1', '1-7', '~210 g', '', '~0.83', '32-34°C to 29°C', '18 : 6, 50-100 lux', 'Starter'],
    ['2', '8-14', '~535 g', '', '~1.03', '27-29°C', '18 : 6, 30-50 lux', 'Starter / Grower'],
    ['3', '15-21', '~1,010 g', '', '~1.16', '26°C', '18 : 6, 20-30 lux', 'Grower'],
    ['4', '22-28', '~1,615 g', '', '~1.29', '24°C', '18 : 6, 10-20 lux; day 28: 22 : 2, 3-5 lux', 'Grower / Finisher'],
    ['5', '29-35', '~2,295 g', '', '~1.42', '21-22°C', '22 : 2, 3-5 lux', 'Finisher'],
    ['6', '36-42', '~2,995 g', '', '~1.55', '20-21°C (min 18)', '22 : 2, 3-5 lux', 'Finisher'],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, margins: { top: 0, bottom: 0, left: 40, right: 40 },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((c, ci) => dataCell(c, ci, ri % 2 === 1, ci === 0)), height: { value: 460, rule: HeightRule.ATLEAST } })),
    ],
  });
}

function coverChildren() {
  const logo = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const kids = [
    new Paragraph({ children: [run('CPC SHORT COURSES', { bold: true, color: MED_BLUE, size: 22 })], alignment: AlignmentType.CENTER, spacing: { before: 120, after: 160 } }),
  ];
  if (logo) {
    let lw = 118, lh = 118;
    try { const v = new DataView(logo.buffer, logo.byteOffset); const pw = v.getUint32(16, false), ph = v.getUint32(20, false); if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw); } catch (_) {}
    kids.push(new Paragraph({ children: [new ImageRun({ data: logo, transformation: { width: lw, height: lh }, type: 'png' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 140 } }));
  }
  kids.push(
    new Paragraph({ children: [run('Broiler Weekly Management Checklist', { bold: true, color: DARK_BLUE, size: 40, font: 'Calibri Light' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 } }),
    new Paragraph({ children: [run('Weeks 1 to 6. Ross 308 growth targets with CPC temperature and lighting.', { italics: true, color: MED_BLUE, size: 22 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 } }),
    new Paragraph({ children: [run('___________________________________', { color: GOLD, size: 22 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
    new Paragraph({ children: [run('For commercial broiler farmers  |  August 2026', { color: '595959', size: 20 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 260 } }),
  );
  return kids;
}

async function main() {
  const notesLine = (label, body) => para([run(label + ' ', { bold: true }), run(body)]);
  const doc = new Document({
    creator: 'CPC Short Courses', title: 'CPC Broiler Weekly Management Checklist',
    styles: { default: { document: { run: { font: 'Calibri', size: 22, color: BODY_GRAY } } } },
    sections: [{
      properties: { page: { margin: pageMargin } },
      headers: { default: buildHeader() }, footers: { default: buildFooter() },
      children: [
        ...coverChildren(),
        para('Use this alongside your daily barn walk. Growth targets are Aviagen Ross 308 (as hatched); temperature and lighting are CPC targets. A good day-old chick weighs about 44 g at placement. Write your own placement and day-7, 14, 21, 28, 35, and 42 weights in the gold Actual column to see how the flock tracks against target. Read bird behavior and adjust: evenly spread birds are comfortable, huddling means too cold, panting means too hot.', { after: 160 }),
        glanceTable(),
        new Paragraph({ spacing: { after: 80 } }),

        weekHead('Week 1  |  Days 1-7  |  Brooding'),
        check('Pre-warm the litter. Start at bird-level temperature 32-34°C at day 1 and bring it down to about 29°C by day 7. That is a 3 to 5°C drop across the week, the biggest of the grow-out, so ease it off by what the chicks tell you: evenly spread and active is right. Keep RH 60-70%.'),
        check('Light 18 hours on to 6 hours off from day 1. Do not skip the dark period. 50-100 lux so every chick finds feed and water.'),
        check('Crop fill: 75% filled at 2 hours, over 80% at 8 hours, over 95% at 24 hours. Water at every drinker, feed on paper.'),
        check('Release chicks to the whole house by about day 7. Weigh at day 7 (target about 210 g) and check uniformity.'),

        weekHead('Week 2  |  Days 8-14'),
        check('Temperature about 27-29°C, now easing down more slowly, roughly 0.5°C every 2-3 days as the birds feather in. Keep reading bird distribution for comfort.'),
        check('Lighting 18 : 6. Step intensity down to 30-50 lux.'),
        check('Move starter to grower feed around day 10 to 11. Keep litter dry. Watch for early coccidiosis (wet litter, loose droppings).'),
        check('Weigh at day 14 (target about 535 g).'),

        weekHead('Week 3  |  Days 15-21'),
        check('Temperature about 26°C. Step up minimum ventilation as birds grow.'),
        check('Lighting 18 : 6 at 20-30 lux. Supports rest behavior and bone development.'),
        check('Grower feed. Walk the barn for gait, leg health, and footpads. Peak coccidiosis and necrotic enteritis window.'),
        check('Weigh at day 21 (target about 1,010 g).'),

        weekHead('Week 4  |  Days 22-28'),
        check('Temperature about 24°C. Ventilation management is increasingly critical.'),
        check('Lighting 18 : 6 at 10-20 lux through day 27, then switch to 22 : 2 at 3-5 lux from day 28.'),
        check('Move grower to finisher feed around day 25. Footpad and hock scoring. Keep ammonia under 25 ppm.'),
        check('Weigh at day 28 (target about 1,615 g).'),

        weekHead('Week 5  |  Days 29-35'),
        check('Temperature about 21-22°C. Keep RH 50-70%. Air quality and ventilation at peak load.'),
        check('Lighting 22 : 2 at 3-5 lux.'),
        check('Finisher feed. Have a heat-stress plan ready (water, air speed). Daily walk for mortality, culls, and leg health.'),
        check('Weigh at day 35 (target about 2,295 g). Book catching crew and processor slot.'),

        weekHead('Week 6  |  Days 36-42  |  Finishing and catch prep'),
        check('Temperature 20-21°C (minimum 18). NFACC acceptable range 18-24°C. Maximize air speed for big birds.'),
        check('Lighting 22 : 2 at 3-5 lux.'),
        check('Confirm feed-withdrawal timing before catching. Final weights at day 42 (target about 2,995 g), FCR about 1.55.'),
        check('Catching and loading welfare. Biosecurity for the crew. Complete shipping records (mortality, treatments, withdrawal times).'),

        weekHead('CPC lighting notes'),
        notesLine('Dark period:', 'the 6-hour dark period from day 1 supports circadian rhythm, welfare, and bone mineralization. Do not skip it.'),
        notesLine('LED fixtures:', 'check for flicker at low lux. A steady 15 lux beats a flickering 10 lux.'),
        notesLine('Measure it:', 'always use a light meter. Judging lux by eye is unreliable.'),

        new Paragraph({ spacing: { after: 40 } }),
        para([run('Targets sourced from: ', { bold: true, size: 18 }), run('Aviagen, Ross 308 Broiler Performance Objectives 2022 (body weight, FCR); Aviagen, Ross Broiler Management Handbook 2025 (crop fill, feeding program); CPC Learning Centre Broiler Lighting Guidelines (lighting); CPC Learning Centre broiler temperature guide, NFACC-aligned (temperature). Ross 308 weights are as hatched; males run heavier, females lighter. Always fine-tune temperature and light by bird behavior.', { size: 18, color: '666666' })], { after: 0 }),
      ],
    }],
  });

  let buffer = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);
  // kill the "fields may refer to other files" dialog: strip dirty, updateFields=false
  let docXml = await zip.file('word/document.xml').async('string');
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');
  const emEn = (docXml.match(/[—–]/g) || []).length;
  if (emEn > 0) console.warn('WARNING: ' + emEn + ' em/en dashes in document.xml');
  zip.file('word/document.xml', docXml);
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!settings.includes('<w:updateFields')) settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  zip.file('word/settings.xml', settings);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE, '(' + (buffer.length / 1024).toFixed(1) + ' KB)');
}
main().catch(e => { console.error(e); process.exit(1); });
