// ============================================================
// generate-course8-summary.mjs — Course 8 Summary Page
// Vaccination – water, wing web, eye drop (3 sub-courses)
// CPC Short Courses
// Run: node generate-course8-summary.mjs
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
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 8');
const OUT_FILE  = path.join(OUT_DIR, 'Summary_Page_Course8_Vaccination.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

// ============================================================
// COLOURS
// ============================================================
const DARK_BLUE  = '1F3864';
const MED_BLUE   = '2E74B5';
const BODY_GRAY  = '3C3C3C';
const GOLD       = 'C9A84C';

// ============================================================
// LOGO
// ============================================================
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

// Section heading: bold blue + gold bottom border
function sectionLabel(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD } },
  });
}

// Sub-course banner: larger, dark blue, gold underline
function subCourseHeader(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: DARK_BLUE, size: 30, font: 'Calibri' })],
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  });
}

// Numbered agenda item
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

// Lettered sub-item
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

// Numbered learning objective
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

// Bullet for Important Notes
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
          new TextRun({ text: 'Vaccination – water, wing web, eye drop', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 8  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
children.push(
  new Paragraph({
    children: [new TextRun({ text: 'COURSE 8: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
  })
);

if (logoBuf) {
  children.push(
    new Paragraph({
      children: [new ImageRun({ data: logoBuf, transformation: { width: 96, height: 96 }, type: 'png' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    })
  );
}

children.push(
  new Paragraph({
    children: [new TextRun({ text: 'Vaccination', bold: true, color: DARK_BLUE, size: 42, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 20 },
  })
);

children.push(
  new Paragraph({
    children: [new TextRun({ text: 'water, wing web, eye drop', bold: true, color: DARK_BLUE, size: 30, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
  })
);

children.push(
  new Paragraph({
    children: [new TextRun({ text: 'Course Summary', italics: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
  })
);

children.push(
  new Paragraph({
    children: [new TextRun({ text: '_______________________________________________', color: GOLD, size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
  })
);

children.push(
  new Paragraph({
    children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: BODY_GRAY, size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
  })
);

children.push(
  new Paragraph({
    children: [new TextRun({ text: 'Duration: 1-Hour Lecture, 1.5-Hour Workshop (3 Sub-Courses)', color: BODY_GRAY, size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
  })
);

children.push(
  new Paragraph({
    children: [new TextRun({ text: 'May 2026', color: BODY_GRAY, size: 22, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
  })
);

// ============================================================
// SUB-COURSE A: POULTRY WATER VACCINATION
// ============================================================
children.push(subCourseHeader('Sub-Course A: Poultry Water Vaccination'));

children.push(sectionLabel('Introduction'));

children.push(p(
  'Water vaccination is one of the most practical ways to protect a large flock. Birds drink the vaccine from their own drinkers, so you get broad coverage without catching or handling each bird individually. Done right, the whole flock gets its dose in a single session with far less labor than injection-based methods.'
));

children.push(p(
  'In this sub-course, you will learn how to prepare the vaccine correctly, set up your water system before vaccination day, calculate the right volume for your flock size and age, and confirm that the flock actually drank enough to receive a full dose.'
, { spaceAfter: 120 }));

children.push(sectionLabel('Agenda'));

children.push(numbered(1, 'Welcome & Introduction'));
children.push(subitem('a', 'Course objectives and expectations'));
children.push(subitem('b', 'Why water vaccination is the go-to method for large commercial flocks'));

children.push(numbered(2, 'Fundamentals of Poultry Immunology'));
children.push(subitem('a', 'How the gut and mucosal immune system respond to oral vaccines'));
children.push(subitem('b', 'What affects vaccine uptake and whether protection actually builds'));

children.push(numbered(3, 'Overview of Water Vaccination'));
children.push(subitem('a', 'Diseases you can and cannot control through the water route'));
children.push(subitem('b', 'Advantages over injection methods, and where water vaccination falls short'));

children.push(numbered(4, 'Vaccine Handling & Preparation'));
children.push(subitem('a', 'Cold chain from storage to the barn'));
children.push(subitem('b', 'Reconstituting the vials and mixing correctly'));
children.push(subitem('c', 'Why skim milk powder is added and how much to use'));

children.push(numbered(5, 'Water System Management'));
children.push(subitem('a', 'Taking chlorine out of the lines 72 hours before vaccination'));
children.push(subitem('b', 'Cleaning drinkers without leaving disinfectant residue'));
children.push(subitem('c', 'Setting the right volume per 1,000 birds for your flock age'));

children.push(numbered(6, 'Practical Water Vaccination Procedures'));
children.push(subitem('a', 'Water starvation: how long and how to manage it'));
children.push(subitem('b', 'Delivering the vaccine through different drinker systems'));
children.push(subitem('c', 'Walking the barn to confirm birds are actively drinking'));

children.push(numbered(7, 'Biosecurity & Safety Protocols'));
children.push(subitem('a', 'PPE requirements, especially for Newcastle Disease vaccines'));
children.push(subitem('b', 'Safe handling and disposal of empty vials'));

children.push(numbered(8, 'Monitoring, Evaluation & Troubleshooting'));
children.push(subitem('a', 'How to tell whether the flock consumed the full vaccine dose'));
children.push(subitem('b', 'The most common mistakes and how to catch them before vaccination day'));
children.push(subitem('c', 'Adjusting for different ages or drinker types'));

children.push(numbered(9, 'Hands-On Demonstration / Practical Session'));
children.push(subitem('a', 'Mixing vaccine and delivering it through a water system'));
children.push(subitem('b', 'Watching how birds respond during and after vaccination'));
children.push(subitem('c', 'Q&A session'));

children.push(numbered(10, 'Review, Assessment & Closing Remarks'));
children.push(subitem('a', 'Summary of key learnings'));
children.push(subitem('b', 'Participant evaluation'));
children.push(subitem('c', 'Certificates and next steps'));

children.push(p('', { spaceAfter: 40 }));

children.push(sectionLabel('Learning Objectives'));

children.push(lo(1, 'Explain how the gut and mucosal immune system respond to live oral vaccines.'));
children.push(lo(2, 'Name the key diseases that can be prevented through the water vaccination route.'));
children.push(lo(3, 'Prepare vaccine correctly: cold chain handling, reconstitution, skim milk protection, and vial rinsing.'));
children.push(lo(4, 'Set up the water system for vaccination day: remove chlorine, clean drinkers, and calculate the right volume for flock age.'));
children.push(lo(5, 'Apply PPE correctly and follow safe handling procedures for live virus vaccines.'));
children.push(lo(6, 'Confirm vaccine consumption during the vaccination window and identify when the flock has not received a full dose.'));
children.push(lo(7, 'Diagnose and fix the most common water vaccination failures.'));

// ============================================================
// SUB-COURSE B: POULTRY WING WEB VACCINATION
// ============================================================
children.push(subCourseHeader('Sub-Course B: Poultry Wing Web Vaccination'));

children.push(sectionLabel('Introduction'));

children.push(p(
  'Wing web vaccination puts vaccine directly into individual birds, one at a time. It is the standard method for Fowl Pox and has a clear advantage over mass-vaccination routes: you can go back 7 to 10 days later, look at 2% of your flock, and see a visible mark at each injection site that confirms the vaccine actually took.'
));

children.push(p(
  'In this sub-course, you will learn the correct anatomical site, proper needle technique using the wing web applicator, how to distinguish a good take from a failed one, and how to handle birds through the process with minimal stress and injury.',
  { spaceAfter: 120 }
));

children.push(sectionLabel('Agenda'));

children.push(numbered(1, 'Welcome & Introduction'));
children.push(subitem('a', 'Course objectives and expectations'));
children.push(subitem('b', 'When wing web vaccination is the right choice and why'));

children.push(numbered(2, 'Fundamentals of Poultry Immunology'));
children.push(subitem('a', 'How local skin immune responses differ from systemic immunity'));
children.push(subitem('b', 'What a vaccine take is and what it tells you about immune stimulation'));

children.push(numbered(3, 'Overview of Wing Web Vaccination'));
children.push(subitem('a', 'Target diseases – Fowl Pox as the primary example'));
children.push(subitem('b', 'Advantages and limitations compared to other routes'));

children.push(numbered(4, 'Vaccine Handling & Preparation'));
children.push(subitem('a', 'Cold chain from refrigerator to the barn'));
children.push(subitem('b', 'Reconstituting and dosing correctly'));
children.push(subitem('c', 'Preventing contamination between birds'));

children.push(numbered(5, 'Equipment & Technique'));
children.push(subitem('a', 'The wing web applicator: double-needle design and how it works'));
children.push(subitem('b', 'Sterilizing and maintaining your applicator'));
children.push(subitem('c', 'Correct needle angle and depth'));

children.push(numbered(6, 'Practical Wing Web Vaccination Procedures'));
children.push(subitem('a', 'Holding and restraining the bird safely'));
children.push(subitem('b', 'Finding the correct site and placing the injection'));
children.push(subitem('c', 'Moving through the flock with minimal handling stress'));

children.push(numbered(7, 'Biosecurity & Safety Protocols'));
children.push(subitem('a', 'PPE and hand hygiene'));
children.push(subitem('b', 'Disinfecting equipment between flocks'));

children.push(numbered(8, 'Monitoring, Evaluation & Troubleshooting'));
children.push(subitem('a', 'Reading a successful vaccine take at day 7 to 10'));
children.push(subitem('b', 'What a failed take looks like and what caused it'));
children.push(subitem('c', 'Managing post-vaccination reactions'));

children.push(numbered(9, 'Hands-On Demonstration / Practical Session'));
children.push(subitem('a', 'Wing web injection practice on a bird'));
children.push(subitem('b', 'Observing lesion development in previously vaccinated birds'));
children.push(subitem('c', 'Q&A session'));

children.push(numbered(10, 'Review, Assessment & Closing Remarks'));
children.push(subitem('a', 'Summary of key learnings'));
children.push(subitem('b', 'Participant evaluation'));
children.push(subitem('c', 'Certificates and next steps'));

children.push(p('', { spaceAfter: 40 }));

children.push(sectionLabel('Learning Objectives'));

children.push(lo(1, 'Explain the immune mechanism behind wing web vaccination and why a take forms at the injection site.'));
children.push(lo(2, 'Identify the diseases suited to wing web vaccination, with Fowl Pox as the primary example.'));
children.push(lo(3, 'Demonstrate correct handling, reconstitution, and cold chain maintenance for wing web vaccines.'));
children.push(lo(4, 'Restrain birds safely and place the injection at the correct site with the wing web applicator.'));
children.push(lo(5, 'Apply PPE and hygiene protocols to prevent contamination between birds.'));
children.push(lo(6, 'Inspect vaccinated birds at day 7 to 10 and correctly classify takes as successful, failed, or reacting.'));
children.push(lo(7, 'Identify the root cause of poor take rates and apply the appropriate correction.'));

// ============================================================
// SUB-COURSE C: POULTRY EYE DROP VACCINATION
// ============================================================
children.push(subCourseHeader('Sub-Course C: Poultry Eye Drop Vaccination'));

children.push(sectionLabel('Introduction'));

children.push(p(
  'Eye drop vaccination places vaccine directly on the eye\'s mucosal surface, which is the most direct route to respiratory immunity. A single drop is absorbed through the conjunctiva, stimulates local IgA antibody production at the eye and in the upper respiratory tract, and drains through the nasolacrimal duct to reach the nasal and pharyngeal tissues where respiratory pathogens first make contact.'
));

children.push(p(
  'It is the preferred method for ILT and IBV respiratory strains because the vaccine reaches the mucosal tissue where protection is actually needed. In this sub-course, you will learn correct bird handling, dropper calibration and technique, how to confirm every bird received a full dose, and how to fix the errors that most commonly lead to missed birds or wasted vaccine.',
  { spaceAfter: 120 }
));

children.push(sectionLabel('Agenda'));

children.push(numbered(1, 'Welcome & Introduction'));
children.push(subitem('a', 'Course objectives and expectations'));
children.push(subitem('b', 'Why eye drop vaccination is the right route for certain respiratory diseases'));

children.push(numbered(2, 'Fundamentals of Poultry Immunology'));
children.push(subitem('a', 'Mucosal immunity at the eye: Harderian gland, IgA, and nasolacrimal drainage'));
children.push(subitem('b', 'Factors that affect vaccine effectiveness through the ocular route'));

children.push(numbered(3, 'Overview of Eye Drop Vaccination'));
children.push(subitem('a', 'Target diseases: Newcastle Disease, Infectious Bronchitis, ILT, and others'));
children.push(subitem('b', 'Advantages over water and spray routes for respiratory pathogens'));

children.push(numbered(4, 'Vaccine Handling & Preparation'));
children.push(subitem('a', 'Cold chain requirements from storage to administration'));
children.push(subitem('b', 'Reconstitution technique and diluent choice'));
children.push(subitem('c', 'Preventing contamination of the dropper and vial'));

children.push(numbered(5, 'Equipment & Technique'));
children.push(subitem('a', 'Calibrating your dropper: confirming drop volume per squeeze'));
children.push(subitem('b', 'Handling and maintaining droppers during a vaccination session'));
children.push(subitem('c', 'Using blue dye in the diluent to verify coverage'));

children.push(numbered(6, 'Practical Eye Drop Vaccination Procedures'));
children.push(subitem('a', 'Restraining the bird and positioning the head correctly'));
children.push(subitem('b', 'Placing the drop on the conjunctiva and waiting for absorption'));
children.push(subitem('c', 'Moving through a large flock efficiently'));

children.push(numbered(7, 'Biosecurity & Safety Protocols'));
children.push(subitem('a', 'PPE: gloves and eye protection for live virus vaccines'));
children.push(subitem('b', 'Cleaning and disinfecting droppers and equipment'));

children.push(numbered(8, 'Monitoring, Evaluation & Troubleshooting'));
children.push(subitem('a', 'Checking flock coverage using the blue dye tongue test'));
children.push(subitem('b', 'Recognizing vaccination errors in the field'));
children.push(subitem('c', 'Adjusting technique for younger birds or large flock sizes'));

children.push(numbered(9, 'Hands-On Demonstration / Practical Session'));
children.push(subitem('a', 'Eye drop administration practice on a live bird'));
children.push(subitem('b', 'Observing how the immune response develops over days following vaccination'));
children.push(subitem('c', 'Q&A session'));

children.push(numbered(10, 'Review, Assessment & Closing Remarks'));
children.push(subitem('a', 'Summary of key learnings'));
children.push(subitem('b', 'Participant evaluation'));
children.push(subitem('c', 'Certificates and next steps'));

children.push(p('', { spaceAfter: 40 }));

children.push(sectionLabel('Learning Objectives'));

children.push(lo(1, 'Explain how mucosal and systemic immunity are stimulated through the ocular route.'));
children.push(lo(2, 'Identify the respiratory diseases best controlled through eye drop vaccination.'));
children.push(lo(3, 'Reconstitute vaccine and calibrate a dropper correctly before beginning a vaccination session.'));
children.push(lo(4, 'Restrain a bird and administer a single drop to the eye, confirming absorption before release.'));
children.push(lo(5, 'Apply biosecurity and PPE protocols throughout the session.'));
children.push(lo(6, 'Use the blue dye method or other monitoring tools to verify that the full flock received coverage.'));
children.push(lo(7, 'Identify and correct errors in eye drop vaccination technique.'));

// ============================================================
// IMPORTANT NOTES
// ============================================================
children.push(sectionLabel('Important Notes'));

children.push(noteBullet('Participants should bring note-taking materials to each sub-course session.'));
children.push(noteBullet('Canadian Poultry Consultants will provide boot covers, gloves, and coveralls for the hands-on workshop component.'));
children.push(noteBullet('A certificate of completion is available to all participants who attend the full session.'));

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

// ============================================================
// WRITE OUTPUT
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buf);
console.log('Summary page written:', OUT_FILE);
console.log('File size:', (buf.length / 1024).toFixed(1), 'KB');
