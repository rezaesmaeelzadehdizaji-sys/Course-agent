// ============================================================
// generate-course8-chooser.mjs
// One-page client handout: "Which Course 8 Is Right for You?"
// Helps farmers, managers, and owners pick between Course 8 Essentials (beginner edition)
// and the full Course 8. Guidance only, so it makes no factual claims that need citations.
// Output: Course 8/Which_Course_8_Is_Right_for_You.docx
// Run: node generate-course8-chooser.mjs
// ============================================================
import {
  Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, PageNumber,
  BorderStyle, convertInchesToTwip, LevelFormat, Table, TableRow, TableCell, WidthType,
  ShadingType, ImageRun, VerticalAlign,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, 'Course 8', 'Which_Course_8_Is_Right_for_You.docx');
const LOGO = fs.readFileSync(path.join(__dirname, 'logo.png'));
const TITLE = 'Which Course 8 Is Right for You?';

const NAVY = '1F3864', BLUE = '2E74B5', GOLD = 'C9A84C', BODY = '3C3C3C', TINT = 'EBF2FA', WHITE = 'FFFFFF';
const SZ = 21;   // 10.5 pt body

const t = (text, o = {}) => new TextRun({ text, font: 'Calibri', size: o.size || SZ, bold: o.bold || false, italics: o.italics || false, color: o.color || BODY });
const p = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [t(children, o)], alignment: o.align || AlignmentType.LEFT, spacing: { before: o.before || 0, after: o.after ?? 80, line: 252, lineRule: 'auto' }, numbering: o.numbering, keepNext: o.keepNext });
const head = (text, color = NAVY) => p([t(text, { bold: true, size: 24, color })], { before: 120, after: 60, keepNext: true });
const bullet = (runs, color = BODY) => p((Array.isArray(runs) ? runs : [runs]).map(r => typeof r === 'string' ? t(r, { color }) : r), { numbering: { reference: color === WHITE ? 'bullet-white' : 'bullet', level: 0 }, after: 40 });
const label = (a, b, color = BODY, lc = NAVY) => p([t(a + ' ', { bold: true, color: lc }), t(b, { color })], { after: 60 });

const none = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: none, bottom: none, left: none, right: none };
function cell(children, fill, widthTwip) {
  return new TableCell({
    children, width: { size: widthTwip, type: WidthType.DXA }, borders: noBorders,
    shading: { type: ShadingType.CLEAR, color: 'auto', fill },
    margins: { top: 120, bottom: 120, left: 160, right: 160 }, verticalAlign: VerticalAlign.TOP,
  });
}

// ---- The two versions, side by side ----
const COLW = 4920, GAP = 160;   // page content 10,000 twips at 0.75" margins on Letter
const essentials = cell([
  p([t('Course 8 Essentials', { bold: true, size: 26, color: NAVY })], { after: 20 }),
  p([t('Vaccination and Treatment Basics', { italics: true, color: BLUE })], { after: 100 }),
  label('Best for:', 'barn crew, new hires, family members starting out, and vaccination crews.'),
  label('Length:', '1-hour lecture.'),
  p([t('You learn to do the job right:', { bold: true, color: NAVY })], { after: 40 }),
  bullet('Keeping vaccine alive, from the fridge to the bird'),
  bullet('Water vaccination, step by step'),
  bullet('Spray, eye drop, wing web, and injection basics'),
  bullet('Protecting yourself, including the self-injection warning'),
  bullet('What is normal after vaccinating, and when to call your veterinarian'),
  bullet('The rules for antibiotics'),
  label('You take home:', 'a vaccination-day checklist.'),
], TINT, COLW);
const full = cell([
  p([t('Course 8', { bold: true, size: 26, color: GOLD })], { after: 20 }),
  p([t('Fundamentals of Poultry Vaccination & Treatment', { italics: true, color: WHITE })], { after: 100 }),
  label('Best for:', 'farm managers, owners and operators, experienced farmers moving into a new type of operation, and service technicians.', WHITE, GOLD),
  label('Length:', '2-hour lecture and 2-hour practical session.', WHITE, GOLD),
  p([t('Everything in Essentials, plus:', { bold: true, color: GOLD })], { after: 40 }),
  bullet('How immunity works, and why vaccines fail', WHITE),
  bullet('All seven vaccination methods in depth, including in-ovo and the pre-lay injection round', WHITE),
  bullet('Reading reactions and troubleshooting a flock that did not respond', WHITE),
  bullet('Checking results with blood tests and wing web takes', WHITE),
  bullet('Responsible antibiotic use, the law, withdrawal times, and records', WHITE),
], NAVY, COLW);
const versions = new Table({
  width: { size: COLW * 2 + GAP, type: WidthType.DXA }, columnWidths: [COLW, GAP, COLW],
  borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
  rows: [new TableRow({ children: [essentials, cell([p('')], WHITE, GAP), full] })],
});

// ---- Quick check ----
const quickCheck = [
  head('Quick check: on your farm, are you the one who...'),
  ...[
    'sits down with the veterinarian to plan the vaccination program?',
    'decides when to call the veterinarian, or when to treat?',
    'signs treatment records, or deals with audits and withdrawal times?',
    'trains or supervises the people who vaccinate?',
    'has to work out why a flock did not respond to a vaccine?',
  ].map(q => p([t(q)], { numbering: { reference: 'steps', level: 0 }, after: 30 })),
  p([t('Any "yes": ', { bold: true, color: NAVY }), t('take the full Course 8.   '), t('All "no": ', { bold: true, color: NAVY }), t('start with Course 8 Essentials.')], { before: 80, after: 60 }),
];

// ---- Advice ----
const advice = [
  head('Pick by the job you do, not by your schooling'),
  p('Both versions are written in plain farm language, and neither needs a science background. A farmer with years in the barn and no formal training belongs in the full course if they run the farm. A new hire with a degree may still be best served by Essentials in their first season.'),
  head('Not sure? Start with Essentials'),
  p('Essentials leads straight into the full course. Take it first, then come back for the full version once you have a season of vaccinating behind you.'),
  head('For owners: the crew package'),
  p('The owner and the farm manager take the full Course 8. The barn crew takes Essentials, so the people giving the vaccine know exactly what the people planning it expect. Ask us about adding the hands-on practical session for your crew: calibrating a sprayer or reading a wing web take is the same skill whoever holds the tool.'),
];

const doc = new Document({
  creator: 'CPC Short Courses', title: TITLE,
  numbering: { config: [
    { reference: 'bullet', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.18) } } } }] },
    { reference: 'bullet-white', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { run: { color: WHITE }, paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.18) } } } }] },
    { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { run: { bold: true, color: BLUE, font: 'Calibri' }, paragraph: { indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.25) } } } }] },
  ] },
  sections: [{
    properties: { page: { margin: { top: convertInchesToTwip(0.7), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.75), right: convertInchesToTwip(0.75), header: convertInchesToTwip(0.35), footer: convertInchesToTwip(0.3) } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } }, children: [
      new TextRun({ text: 'CPC Short Courses  |  ', font: 'Calibri', size: 18, color: '888888' }),
      new TextRun({ text: TITLE, font: 'Calibri', size: 18, bold: true, color: BLUE }),
    ] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } }, children: [
      new TextRun({ text: 'CPC Short Courses  |  Course 8  |  Page ', font: 'Calibri', size: 18, color: '888888' }),
      new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: '888888' }),
      new TextRun({ text: ' of ', font: 'Calibri', size: 18, color: '888888' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: '888888' }),
    ] })] }) },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new ImageRun({ data: LOGO, transformation: { width: 64, height: 64 }, type: 'png' })] }),
      p([t('COURSE 8: CPC SHORT COURSES', { bold: true, color: BLUE, size: 20 })], { align: AlignmentType.CENTER, after: 40 }),
      p([t(TITLE, { bold: true, color: NAVY, size: 40 })], { align: AlignmentType.CENTER, after: 40 }),
      p([t('Two versions of our vaccination and treatment course. Here is how to choose.', { italics: true, color: BLUE, size: 22 })], { align: AlignmentType.CENTER, after: 40 }),
      p([t('___________________________________', { color: GOLD, size: 22 })], { align: AlignmentType.CENTER, after: 160 }),
      versions,
      ...quickCheck,
      ...advice,
      p([t('Questions about which course fits your team? Talk to the CPC team at admin@canadianpoultry.ca.', { italics: true, color: BLUE })], { align: AlignmentType.CENTER, before: 120, after: 0 }),
    ],
  }],
});

const buf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buf);
console.log('Wrote', OUT_FILE, buf.length, 'bytes');
