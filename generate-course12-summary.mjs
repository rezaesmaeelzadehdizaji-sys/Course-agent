// ============================================================
// generate-course12-summary.mjs — Course 12 Summary Page
// Humane Euthanasia
// CPC Short Courses — July 2026
// Run: node generate-course12-summary.mjs
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  Footer,
  BorderStyle,
  convertInchesToTwip,
  ImageRun,
  PageNumber,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 12');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course12_HumaneEuthanasia.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

const logoBuf = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

// ============================================================
// HELPERS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({
    text,
    bold:    opts.bold    || false,
    italics: opts.italics || false,
    color:   opts.color   || BODY_GRAY,
    size:    opts.size    || 22,
    font:    'Calibri',
  });
}

function p(content, opts = {}) {
  const children = Array.isArray(content)
    ? content.map(s => new TextRun({
        text:    s.text,
        bold:    s.bold    || false,
        italics: s.italics || false,
        color:   s.color   || BODY_GRAY,
        size:    s.size    || 22,
        font:    'Calibri',
      }))
    : [run(content, opts)];
  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing:   { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 100, line: 260, lineRule: 'auto' },
    indent:    opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}

function sectionLabel(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD } },
  });
}

function numbered(num, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}.  `, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' }),
    ],
    spacing: { after: 60, line: 260, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.2) },
  });
}

function subitem(letter, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `    ${letter}.  `, bold: true, color: BODY_GRAY, size: 20, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 20, font: 'Calibri' }),
    ],
    spacing: { after: 40, line: 260, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.4) },
  });
}

function lo(num, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}.  `, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' }),
      new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' }),
    ],
    spacing: { after: 70, line: 260, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.2) },
  });
}

function noteBullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' })],
    bullet: { level: 0 },
    spacing: { after: 60, line: 260, lineRule: 'auto' },
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
          new TextRun({ text: 'Humane Euthanasia', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 12  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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

const pageMargin = {
  top:    convertInchesToTwip(0.75),
  bottom: convertInchesToTwip(0.75),
  left:   convertInchesToTwip(1.0),
  right:  convertInchesToTwip(1.0),
};

// ============================================================
// DOCUMENT BODY
// ============================================================
const children = [];

// ----- COVER BLOCK -----
children.push(new Paragraph({
  children: [new TextRun({ text: 'COURSE 12: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 60 },
}));

if (logoBuf) {
  children.push(new Paragraph({
    children: [new ImageRun({ data: logoBuf, transformation: { width: 96, height: 96 }, type: 'png' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
  }));
}

children.push(new Paragraph({
  children: [new TextRun({ text: 'Humane Euthanasia', bold: true, color: DARK_BLUE, size: 40, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 30 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: 'Course Summary', italics: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 40 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: '_______________________________________________', color: GOLD, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 60 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: BODY_GRAY, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 40 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: 'Duration: 1-Hour Lecture, 1-Hour Workshop', color: BODY_GRAY, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 40 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: 'July 2026', color: BODY_GRAY, size: 22, font: 'Calibri' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 360 },
}));

// ============================================================
// INTRODUCTION
// ============================================================
children.push(sectionLabel('Introduction'));

children.push(p(
  'A bird that is suffering and cannot recover needs to be euthanized quickly and correctly. That is not just a welfare obligation; it is a legal one under the NFACC Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys and the Chicken Farmers of Canada Animal Care Program. Delayed or incorrectly performed euthanasia is a compliance failure, and it is something auditors check for.'
));

children.push(p(
  'This course covers every method approved for on-farm use in Canada: manual cervical dislocation, mechanical cervical dislocation, the non-penetrating captive bolt, CO2 euthanasia, blunt force trauma, and decapitation. You will learn when each method is appropriate, how to perform each one correctly, how to confirm that death has occurred, and what records you need to keep. The practical workshop gives you hands-on time with the equipment in a controlled setting before you need to use it in the barn.',
  { spaceAfter: 120 }
));

// ============================================================
// AGENDA
// ============================================================
children.push(sectionLabel('Agenda'));

children.push(numbered(1, 'Understanding Humane Euthanasia'));
children.push(subitem('a', 'Definition, purpose, and the ethics of timely action'));
children.push(subitem('b', 'Legal obligations under NFACC and the Chicken Farmers of Canada Animal Care Program'));
children.push(subitem('c', 'Why delayed euthanasia is a welfare and compliance problem'));

children.push(numbered(2, 'When to Euthanize'));
children.push(subitem('a', 'Criteria for making the call: conditions that do not respond to treatment'));
children.push(subitem('b', 'Recognizing suffering: broken bones, severe injury, inability to reach feed or water'));
children.push(subitem('c', 'Decision guidelines and when to consult your veterinarian'));

children.push(numbered(3, 'Approved Methods'));
children.push(subitem('a', 'Manual cervical dislocation: technique, weight limits, and correct execution'));
children.push(subitem('b', 'Mechanical cervical dislocation (KED): device types, sizing, and technique'));
children.push(subitem('c', 'Non-penetrating captive bolt: placement by species and correct use'));
children.push(subitem('d', 'CO2 euthanasia: immersion technique, exposure time, and safety'));
children.push(subitem('e', 'Blunt force trauma: for large birds where no device is available'));
children.push(subitem('f', 'Decapitation: as a primary method and as a backup'));
children.push(subitem('g', 'Methods that are not approved and why'));

children.push(numbered(4, 'Practical Steps'));
children.push(subitem('a', 'Step-by-step execution for each approved method'));
children.push(subitem('b', 'Equipment requirements and pre-use checks'));
children.push(subitem('c', 'Biosecurity during euthanasia'));
children.push(subitem('d', 'Differences between chick and adult bird euthanasia'));

children.push(numbered(5, 'Verification of Death'));
children.push(subitem('a', 'The three-check protocol: third-eyelid reflex, neck muscle tone, and pinch response'));
children.push(subitem('b', 'The five-minute heartbeat and breathing check before placing birds in the mortality bin'));

children.push(numbered(6, 'Carcass Disposal'));
children.push(subitem('a', 'Approved disposal methods: rendering, composting, incineration, on-farm burial'));
children.push(subitem('b', 'Provincial regulations and how to find the rules that apply to your farm'));

children.push(numbered(7, 'Record-Keeping and Staff Training'));
children.push(subitem('a', 'What the Chicken Farmers of Canada Animal Care Program requires you to document'));
children.push(subitem('b', 'Training staff: who can perform euthanasia and what competency looks like'));

children.push(numbered(8, 'Workshop: Practical Demonstration'));
children.push(subitem('a', 'Hands-on practice with each approved method under supervision'));
children.push(subitem('b', 'Common mistakes and how to avoid them'));
children.push(subitem('c', 'Handling difficult situations: large birds, tight spaces, and method failures'));

children.push(p('', { spaceAfter: 40 }));

// ============================================================
// LEARNING OBJECTIVES
// ============================================================
children.push(sectionLabel('Learning Objectives'));

children.push(lo(1, 'Define humane euthanasia and explain the ethical and legal obligation to act promptly when a bird is suffering.'));
children.push(lo(2, 'Use a clear decision framework to identify which birds require euthanasia and which can be treated.'));
children.push(lo(3, 'Perform manual cervical dislocation correctly for broiler chicks and adult birds within approved weight limits.'));
children.push(lo(4, 'Select the correct mechanical cervical dislocation device for the bird size and use it correctly.'));
children.push(lo(5, 'Apply CO2 euthanasia correctly using the immersion method: prefill and seal the chamber, and continue exposure until all reflexes cease.'));
children.push(lo(6, 'Apply the three-check death verification protocol and observe the five-minute rule before moving birds.'));
children.push(lo(7, 'Describe approved carcass disposal methods and identify the provincial rules that apply to your operation.'));
children.push(lo(8, 'Complete the records required by the Chicken Farmers of Canada Animal Care Program and train staff to perform euthanasia competently.'));

// ============================================================
// IMPORTANT NOTES
// ============================================================
children.push(sectionLabel('Important Notes'));

children.push(noteBullet('Participants should bring note-taking materials to each session.'));
children.push(noteBullet('The practical workshop uses demonstration materials. No live birds are used during training.'));
children.push(noteBullet('A certificate of completion is available to all participants who attend the full course.'));
children.push(noteBullet('Euthanasia practices on your farm must comply with the NFACC Code of Practice and your applicable Chicken Farmers of Canada or provincial quota requirements. Consult your veterinarian or flock advisor if you are uncertain about the method appropriate for a specific situation.'));

// ============================================================
// BUILD DOCUMENT
// ============================================================
const doc = new Document({
  styles: {
    paragraphStyles: [
      {
        id: 'Normal',
        name: 'Normal',
        run: { font: 'Calibri', size: 22, color: BODY_GRAY },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          {
            level: 0,
            format: 'bullet',
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) } } },
          },
        ],
      },
    ],
  },
  sections: [{
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children,
  }],
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const buf = await Packer.toBuffer(doc);

// ---- POST-BUILD PATCH: subscript the 2 in every CO2 (match course body) ----
const outZip = await JSZip.loadAsync(buf);
let docXml = await outZip.file('word/document.xml').async('string');
let co2Count = 0;
docXml = docXml.replace(/<w:r>(<w:rPr>[\s\S]*?<\/w:rPr>)?(<w:t\b[^>]*>)([^<]*)<\/w:t><\/w:r>/g, (m, rpr, topen, text) => {
  if (!text.includes('CO2')) return m;
  rpr = rpr || '';
  const subRpr = rpr ? rpr.replace('</w:rPr>', '<w:vertAlign w:val="subscript"/></w:rPr>') : '<w:rPr><w:vertAlign w:val="subscript"/></w:rPr>';
  const parts = text.split('CO2');
  let out = '';
  parts.forEach((part, i) => {
    if (i > 0) { co2Count++; out += `<w:r>${rpr}${topen}CO</w:t></w:r>`; out += `<w:r>${subRpr}${topen}2</w:t></w:r>`; }
    if (part.length) out += `<w:r>${rpr}${topen}${part}</w:t></w:r>`;
  });
  return out;
});
outZip.file('word/document.xml', docXml);
const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log('Summary page written:', OUT_FILE);
console.log('CO2 subscript conversions:', co2Count);
console.log('File size:', (patched.length / 1024).toFixed(1), 'KB');
