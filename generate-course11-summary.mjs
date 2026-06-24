// ============================================================
// generate-course11-summary.mjs — Summary Page: Course 11
// Necropsy of Common Diseases — CPC Short Courses
// Run: node generate-course11-summary.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, PageNumber, BorderStyle, ShadingType,
  convertInchesToTwip, ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR    = path.join(__dirname, 'Course 11');
const OUT_FILE   = path.join(OUT_DIR, 'Summary_Page_Course11_NecropsyCommonDiseases.docx');
const LOGO_PATH  = path.join(__dirname, 'logo.png');

const COURSE_TITLE  = 'Necropsy of Common Diseases';
const COURSE_NUMBER = '11';

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

function run(text, opts = {}) {
  return new TextRun({
    text, bold: opts.bold || false, italics: opts.italics || false,
    color: opts.color || BODY_GRAY, size: opts.size || 24, font: 'Calibri',
  });
}
function para(children, opts = {}) {
  const kids = Array.isArray(children) ? children : [run(children, opts)];
  return new Paragraph({
    children: kids,
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
  });
}
function sectionHead(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MED_BLUE, size: 28, font: 'Calibri' })],
    alignment: AlignmentType.LEFT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
    spacing: { before: 320, after: 160 },
  });
}
function bullet(children, lvl = 0) {
  const kids = Array.isArray(children) ? children : [run(children)];
  return new Paragraph({
    children: kids,
    numbering: { reference: 'bullet-list', level: lvl },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}
function numbered(children, lvl = 0) {
  const kids = Array.isArray(children) ? children : [run(children)];
  return new Paragraph({
    children: kids,
    numbering: { reference: 'numbered-list', level: lvl },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}
function subItem(children, lvl = 1) {
  const kids = Array.isArray(children) ? children : [run(children)];
  return new Paragraph({
    children: kids,
    numbering: { reference: 'sub-alpha-list', level: lvl - 1 },
    spacing: { after: 60, line: 276, lineRule: 'auto' },
  });
}
function spacer(after = 120) { return new Paragraph({ children: [run('')], spacing: { after } }); }

function buildHeader() {
  return new Header({
    children: [new Paragraph({
      children: [
        new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
        new TextRun({ text: COURSE_TITLE, color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
        new TextRun({ text: `CPC Short Courses  |  Course ${COURSE_NUMBER}  |  Page `, color: '888888', size: 18, font: 'Calibri' }),
        new TextRun({ children: [PageNumber.CURRENT], color: '888888', size: 18, font: 'Calibri' }),
        new TextRun({ text: ' of ', color: '888888', size: 18, font: 'Calibri' }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], color: '888888', size: 18, font: 'Calibri' }),
      ],
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
    })],
  });
}

const pageMargin = {
  top: convertInchesToTwip(1), bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25),
};

// COVER BLOCK
function buildCoverBlock() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const items = [];
  items.push(new Paragraph({ children: [run('')], spacing: { before: 720, after: 0 } }));
  items.push(new Paragraph({
    children: [new TextRun({ text: `COURSE ${COURSE_NUMBER}: CPC SHORT COURSES`, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
  }));
  if (logoBuffer) {
    let lw = 120, lh = 120;
    try { const v = new DataView(logoBuffer.buffer, logoBuffer.byteOffset); const pw = v.getUint32(16,false), ph = v.getUint32(20,false); if (pw>0&&ph>0) lh=Math.round(lw*ph/pw); } catch(_){}
    items.push(new Paragraph({ children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })], alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 } }));
  }
  items.push(
    new Paragraph({ children: [new TextRun({ text: COURSE_TITLE, bold: true, color: DARK_BLUE, size: 44, font: 'Calibri Light' })], alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'Course Summary', color: MED_BLUE, size: 24, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 } }),
    new Paragraph({ children: [run('')], alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD } }, spacing: { before: 0, after: 300 } }),
    new Paragraph({ children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Duration: 1-Hour Lecture, 1-Hour Workshop', color: '595959', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Prerequisite: Courses 7 (Common Poultry Diseases) and 10 (Necropsy of Normal Birds)', color: '595959', size: 20, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'June 2026', color: '595959', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 } }),
  );
  return items;
}

// CONTENT
const children = [
  ...buildCoverBlock(),
  sectionHead('Introduction'),
  para('You already know how to run a necropsy. This course shows you what disease looks like when you get in there. From a bloody cecum that screams coccidiosis to an enlarged sciatic nerve that confirms Marek\'s, the lesions in this course are the ones you will actually find on your farm.'),
  para('The key is connecting what you see at the necropsy table to what is happening in the barn. A bird opening with fibrin on the heart and cloudy air sacs tells a specific story. So does a pale, falling-apart liver with a blood clot on top. Each lesion points to a short list of differentials, and from there to an action. This course builds that visual vocabulary.'),
  para('We cover bacterial, viral, parasitic, and metabolic disease presentations in broilers, layers, and breeders. Three case walkthroughs give you practice connecting lesion patterns to real diagnostic decisions and management responses.'),
  spacer(80),
  sectionHead('Agenda'),
  numbered('Course Overview and Objectives', 0),
  subItem('Why necropsy supports early detection in commercial flocks', 1),
  subItem('Linking lesion findings to flock history and symptoms', 1),
  subItem('When to prioritize a necropsy', 1),
  numbered('Preparation and Biosecurity', 0),
  subItem('Tool checklist and personal protection at the necropsy table', 1),
  subItem('Selecting the right birds for accurate findings', 1),
  subItem('Sample handling and packaging for laboratory submission', 1),
  numbered('Overview of Common Lesion Patterns', 0),
  subItem('Recognizing abnormal organ appearance across body systems', 1),
  subItem('Distinguishing acute from chronic disease presentations', 1),
  numbered('Common Diseases in Meat Birds', 0),
  subItem('Bacterial: Colibacillosis, Necrotic Enteritis, Airsacculitis', 1),
  subItem('Viral: IBV, IBD, Newcastle Disease, Avian Influenza', 1),
  subItem('Parasitic: Coccidiosis (species-specific lesion sites), internal worms', 1),
  subItem('Metabolic: Ascites, Sudden Death Syndrome, skeletal disorders', 1),
  numbered('Common Diseases in Layers and Breeders', 0),
  subItem('Reproductive: Egg peritonitis, Salpingitis', 1),
  subItem('Bacterial: Fowl Cholera, Mycoplasmosis (MG and MS)', 1),
  subItem('Viral: Marek\'s Disease, IBV, Newcastle Disease in layers', 1),
  subItem('Nutritional and metabolic: FLHS, calcium deficiency', 1),
  numbered('Body-System Lesion Recognition Table', 0),
  subItem('Quick reference: lesion by system, disease differentials', 1),
  numbered('Case Studies: Problem-Solving at the Necropsy Table', 0),
  subItem('Case 1: Broiler mortality spike at 28 days (airsacculitis, IBV/colibacillosis)', 1),
  subItem('Case 2: Layer flock with production drop and deaths (egg peritonitis, Marek\'s)', 1),
  subItem('Case 3: Young broiler flock, sudden mortality at 3 weeks (IBD)', 1),
  numbered('Farmer-Friendly Diagnostic Pathway', 0),
  subItem('When to submit samples and what to tell the lab', 1),
  subItem('Using necropsy findings to take immediate on-farm action', 1),
  spacer(80),
  sectionHead('Learning Objectives'),
  para('By the end of this course, participants should be able to:'),
  bullet('Identify gross lesions associated with the major bacterial, viral, parasitic, and metabolic diseases in commercial poultry.'),
  bullet('Use lesion location, color, and texture to build a short differential diagnosis list at the necropsy table.'),
  bullet('Distinguish between disease presentations that require immediate veterinary contact (Avian Influenza, Newcastle Disease) and those that support on-farm management decisions.'),
  bullet('Collect and package tissue samples correctly for provincial diagnostic laboratory submission.'),
  bullet('Interpret necropsy findings alongside flock history, mortality patterns, and production records.'),
  bullet('Apply necropsy results to identify the primary pathogen versus secondary complications.'),
  bullet('Use the body-system lesion table as a practical field reference during necropsy.'),
  spacer(80),
  sectionHead('Important Notes'),
  bullet('The necropsy and the diagnosis are the veterinarian\'s job. Reading disease lesions and confirming a cause takes science, training, experience, and a dedicated biosecure necropsy facility. This course builds the farmer\'s eye to recognize serious lesions, describe them accurately, and know when to stop and call. Whenever possible, send the birds or samples to your veterinarian or the diagnostic lab; opening birds on the farm is the fallback, not a replacement for professional diagnosis.'),
  bullet('This course builds directly on Course 10 (Necropsy of Normal Birds). Participants who have not taken Course 10 should review it before this session.'),
  bullet('Avian Influenza protocol: if any presentation suggests AI (cyanotic comb, hemorrhages on shanks, peracute unexplained mortality), stop the necropsy, isolate the barn, and call your veterinarian immediately. Do not continue the necropsy until you have guidance.'),
  bullet('All disease-specific findings in this course are supported by verifiable references from the Merck Veterinary Manual and CPC Learning Centre disease profiles.'),
  bullet('The hands-on workshop portion will use preserved or fresh specimens to practice lesion identification across the major disease categories.'),
  bullet('For full disease profiles and treatment options, see Course 7 (Common Poultry Diseases) in this series.'),
];

// NUMBERING
const numberingConfig = {
  config: [
    { reference: 'bullet-list', levels: [
      { level: 0, format: 'bullet', text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) } } } },
    ]},
    { reference: 'numbered-list', levels: [
      { level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) } } } },
    ]},
    { reference: 'sub-alpha-list', levels: [
      { level: 0, format: 'lowerLetter', text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.8), hanging: convertInchesToTwip(0.2) } } } },
    ]},
  ],
};

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const doc = new Document({
  numbering: numberingConfig,
  sections: [{
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children,
  }],
});

const buf = await Packer.toBuffer(doc);

// Strip w:dirty
const zip = await JSZip.loadAsync(buf);
let xml = await zip.file('word/document.xml').async('string');
xml = xml.replace(/\sw:dirty="true"/g, '');
const dashCount = (xml.match(/—/g) || []).length;
if (dashCount > 0) console.warn(`Em dash check: ${dashCount} em dashes in summary`);
else console.log('Em dash check (summary): PASS');
zip.file('word/document.xml', xml);

let settings = await zip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g,'');
settings = settings.replace('<w:displayBackgroundShape/>','<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
zip.file('word/settings.xml', settings);

const patched = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log(`\nCourse 11 summary page written: ${OUT_FILE}`);
console.log(`File size: ${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB`);
