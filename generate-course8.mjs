// ============================================================
// generate-course8.mjs — Course 8: Vaccination
// water vaccination, wing web vaccination, eye drop vaccination
// CPC Short Courses — Canadian Poultry Training Series
// Run: node generate-course8.mjs
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  HeadingLevel,
  TableOfContents,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 8');
const OUT_FILE  = process.env.OUT_FILE || path.join(OUT_DIR, 'Vaccination_draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

// ============================================================
// COLOURS
// ============================================================
const DARK_BLUE  = '1F3864';
const MED_BLUE   = '2E74B5';
const BODY       = '3C3C3C';
const GOLD       = 'C9A84C';

// ============================================================
// HELPERS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({
    text,
    bold:        opts.bold        || false,
    italics:     opts.italics     || false,
    color:       opts.color       || BODY,
    size:        opts.size        || 24,
    font:        'Calibri',
    subScript:   opts.subScript   || false,
    superScript: opts.superScript || false,
  });
}

function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text.map(seg =>
        (seg instanceof TextRun)
          ? seg
          : new TextRun({
              text:        seg.text,
              bold:        seg.bold        || false,
              italics:     seg.italics     || false,
              color:       seg.color       || BODY,
              size:        seg.size        || 24,
              font:        'Calibri',
              subScript:   seg.subScript   || false,
              superScript: seg.superScript || false,
            })
      )
    : [run(text, { bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })];
  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing:   { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent:    opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } });
}

function bullet(text, lvl = 0) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY, size: 24, font: 'Calibri' }))
    : [new TextRun({ text, color: BODY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}

function numbered(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY, size: 24, font: 'Calibri' })],
    numbering: { reference: 'numbered-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}

function b(text) {
  const children = Array.isArray(text) ? text : [run(text, { bold: true })];
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: 0 }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}

function labeled(label, body) {
  const bodyRuns = Array.isArray(body) ? body : [run(body)];
  return para([run(label, { bold: true }), ...bodyRuns]);
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function callout(text) {
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: GOLD };
  return new Paragraph({
    children: [new TextRun({ text, bold: false, color: BODY, size: 24, font: 'Calibri', italics: true })],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 120, after: 120, line: 276 },
    indent: { left: convertInchesToTwip(0.4), right: convertInchesToTwip(0.4) },
    border: { top: bdr, bottom: bdr, left: bdr, right: bdr },
  });
}

// Placeholder image block (gray bordered cell + caption) — used as fallback if file missing
function imagePlaceholder(label, caption) {
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        children: [new TableCell({
          shading: { type: ShadingType.SOLID, color: 'F5F5F5' },
          borders: cellBorders,
          margins: { top: 400, bottom: 400, left: 600, right: 600 },
          children: [new Paragraph({
            children: [new TextRun({ text: `[ ${label} ]`, color: '888888', size: 22, italics: true, font: 'Calibri' })],
            alignment: AlignmentType.CENTER,
          })],
        })],
      })],
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 240 },
    }),
  ];
}

// ============================================================
// IMAGE EMBEDDING
// ============================================================
function imgBuf(name) {
  const p = path.join(OUT_DIR, name);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p);
}
// PNG dimensions from IHDR
function pngDims(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
// JPEG dimensions from SOF markers
function jpegDims(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
      const height = buf.readUInt16BE(i + 5);
      const width  = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return { width: 0, height: 0 };
}
// Render an embedded image with caption. type: 'png' | 'jpg', widthIn = display width in inches.
function embedImage(buf, type, caption, widthIn = 6.0) {
  const dims = type === 'png' ? pngDims(buf) : jpegDims(buf);
  const dpi  = 96;
  const wpx  = Math.round(widthIn * dpi);
  const hpx  = Math.round((dims.height / dims.width) * wpx);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [new ImageRun({
        data: buf,
        transformation: { width: wpx, height: hpx },
        type,
      })],
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
  ];
}
// figureOrPlaceholder: tries to embed the named file from Course 8/, falls back to gray placeholder.
function figureOrPlaceholder(filename, label, caption, widthIn = 6.0) {
  const buf = imgBuf(filename);
  if (!buf) return imagePlaceholder(label, caption);
  const type = filename.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  return embedImage(buf, type, caption, widthIn);
}

// ============================================================
// INLINE DATA TABLE
// ============================================================
function dataTable(headers, rows, colWidths) {
  const hdrBg = MED_BLUE;
  const altBg = 'EBF2FA';
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hdrCell = (text, i) => new TableCell({
    width: { size: colWidths[i], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
    })],
  });

  const dataCell = (text, i, shade) => new TableCell({
    width: { size: colWidths[i], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({
      alignment: i === colWidths.length - 1 ? AlignmentType.LEFT : AlignmentType.CENTER,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18, color: BODY })],
    })],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => dataCell(cell, ci, ri % 2 === 1)),
      })),
    ],
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
          new TextRun({ text: 'Vaccination – water, wing web, eye drop, spray', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
  top:    convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left:   convertInchesToTwip(1.25),
  right:  convertInchesToTwip(1.25),
};

// ============================================================
// COVER PAGE SECTION
// ============================================================
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1800, after: 0 } }),

    new Paragraph({
      children: [new TextRun({ text: 'COURSE 8: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),
  ];

  if (logoBuffer) {
    children.push(
      new Paragraph({
        children: [new ImageRun({ data: logoBuffer, transformation: { width: 110, height: 110 }, type: 'png' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Vaccination', bold: true, color: MED_BLUE, size: 52, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'water, wing web, eye drop, spray, in-ovo', bold: true, color: MED_BLUE, size: 36, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Practical Vaccination Training for Canadian Poultry Farms', italics: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '_______________________________________________', color: GOLD, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', color: BODY, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Duration: 1-Hour Lecture, 1.5-Hour Workshop (4 Sub-Courses)', color: BODY, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'May 2026', color: BODY, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'This material is intended for educational purposes for Canadian poultry producers, farm staff, and industry professionals. Content should be used in conjunction with current provincial and federal regulations, breed-specific management guides, and the advice of a licensed poultry veterinarian. Vaccination programs must be designed with veterinary oversight and reviewed regularly for local disease prevalence.',
        italics: true, color: '555555', size: 18, font: 'Calibri',
      })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 80, after: 0 },
    })
  );

  return {
    properties: { page: { margin: pageMargin } },
    children,
  };
}

// ============================================================
// TOC SECTION
// ============================================================
const tocEntries = [
  { lvl: 1, text: 'Introduction', page: 3 },
  { lvl: 1, text: 'Section 1: Poultry Water Vaccination', page: 4 },
  { lvl: 2, text: '1.1  Immune Responses to Oral Vaccines', page: 4 },
  { lvl: 2, text: '1.2  Diseases Prevented by Water Vaccination', page: 5 },
  { lvl: 2, text: '1.3  Cold Chain and Vaccine Storage', page: 6 },
  { lvl: 2, text: '1.4  Preparing Your Water System', page: 7 },
  { lvl: 2, text: '1.5  Vaccine Preparation and Mixing', page: 8 },
  { lvl: 2, text: '1.6  Running the Vaccination', page: 9 },
  { lvl: 2, text: '1.7  Biosecurity, PPE, and Safety', page: 11 },
  { lvl: 2, text: '1.8  Monitoring and Troubleshooting', page: 12 },
  { lvl: 1, text: 'Section 2: Poultry Wing Web Vaccination', page: 13 },
  { lvl: 2, text: '2.1  When to Use Wing Web Vaccination', page: 13 },
  { lvl: 2, text: '2.2  Fowl Pox: The Primary Target Disease', page: 14 },
  { lvl: 2, text: '2.3  Equipment, Cold Chain, and Vaccine Handling', page: 15 },
  { lvl: 2, text: '2.4  Bird Restraint and Vaccination Technique', page: 16 },
  { lvl: 2, text: '2.5  Reading the Vaccine Take', page: 17 },
  { lvl: 2, text: '2.6  Biosecurity, Safety, and Post-Vaccination Hygiene', page: 18 },
  { lvl: 2, text: '2.7  Monitoring and Troubleshooting', page: 19 },
  { lvl: 1, text: 'Section 3: Poultry Eye Drop Vaccination', page: 20 },
  { lvl: 2, text: '3.1  How Eye Drop Vaccination Works', page: 20 },
  { lvl: 2, text: '3.2  Target Diseases', page: 21 },
  { lvl: 2, text: '3.3  Equipment and Vaccine Preparation', page: 22 },
  { lvl: 2, text: '3.4  Administration Technique', page: 23 },
  { lvl: 2, text: '3.5  Confirming Uniform Coverage', page: 24 },
  { lvl: 2, text: '3.6  Biosecurity, PPE, and Safety', page: 25 },
  { lvl: 2, text: '3.7  Monitoring and Troubleshooting', page: 26 },
  { lvl: 1, text: 'Section 4: Poultry Coarse Spray Vaccination', page: 28 },
  { lvl: 2, text: '4.1  How Coarse Spray Vaccination Works', page: 28 },
  { lvl: 2, text: '4.2  Target Diseases and When to Use Spray', page: 29 },
  { lvl: 2, text: '4.3  Equipment and Spray Settings', page: 30 },
  { lvl: 2, text: '4.4  Diluent, Volume, and Vaccine Preparation', page: 31 },
  { lvl: 2, text: '4.5  Ventilation Management', page: 32 },
  { lvl: 2, text: '4.6  Running the Vaccination', page: 33 },
  { lvl: 2, text: '4.7  Biosecurity, PPE, and Safety', page: 35 },
  { lvl: 2, text: '4.8  Monitoring and Troubleshooting', page: 36 },
  { lvl: 1, text: 'Section 5: In-Ovo Vaccination', page: 37 },
  { lvl: 1, text: 'Recommended Peer-Reviewed Journals', page: 39 },
  { lvl: 1, text: 'References', page: 40 },
];

const entriesWithAnchor = tocEntries.map((e, i) => ({
  ...e,
  anchor: `_Toc${String(10000000 + i).padStart(8, '0')}`,
}));

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildTocSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', {
        hyperlink: true,
        headingStyleRange: '1-2',
        stylesWithLevels: [
          { styleId: 'Heading1', level: 1 },
          { styleId: 'Heading2', level: 2 },
        ],
      }),
      pageBreak(),
    ],
  };
}

// ============================================================
// MAIN CONTENT SECTION
// ============================================================
function buildContentSection() {
  const c = [];

  // ---- INTRODUCTION ----
  c.push(h1('Introduction'));

  c.push(para(
    'Every vaccine you give a bird is only as good as the decisions you made before opening the vial. The storage temperature, the water quality, the technique you used, and whether the bird actually absorbed the dose: these are what determine whether your vaccination program works or fails. A vial that came off the truck at the right temperature can still be wasted in the barn if the water lines still have chlorine in them, or if birds are not thirsty enough to drink their full dose.'
  ));

  c.push(para(
    'The CPC Learning Centre General Principles of Vaccination guide puts it plainly: vaccination is an art [2]. It takes knowledge, attention to detail, and practiced technique. This course covers four distinct vaccination methods that together represent most of what a commercial poultry operation will use: water vaccination, wing web vaccination, eye drop vaccination, and coarse spray vaccination. Each method targets different diseases through different immune pathways, and each demands its own protocol.'
  ));

  c.push(para(
    'Before any vaccination program begins, consult your flock veterinarian. Vaccine selection, timing, and schedules are driven by regional disease pressure, the immune status of your breeders, and your specific production system [2]. The protocols in this course are practical foundations. They are not a substitute for veterinary advice.'
  ));

  c.push(para([
    { text: 'How the avian immune system responds to vaccines.', bold: true },
    { text: ' The avian immune system has two main branches: innate immunity (present from hatch, non-specific) and adaptive immunity (acquired through exposure or vaccination) [3]. Adaptive immunity is further divided into humoral immunity, driven by B cells that produce antibodies, and cell-mediated immunity, driven by T cells that directly destroy infected cells [3]. Vaccination targets the adaptive system, training it to recognize and respond to a specific pathogen before the bird ever encounters the real thing.' },
  ]));

  c.push(para(
    'Three antibody types matter most to vaccination: IgM is the first antibody produced after initial exposure. IgY (equivalent to IgG in mammals) develops after IgM and drives the recall response when the bird encounters the antigen again. IgA is produced constantly at mucosal surfaces in the gut, airways, and eyes, and stops pathogens from attaching to those surfaces before they can cause infection [3]. Eye drop and water vaccination work largely through IgA. Inactivated injected vaccines work primarily through IgY.'
  ));

  c.push(para([
    { text: 'Maternal antibodies and vaccination timing.', bold: true },
    { text: ' Hens pass antibodies to their chicks through the yolk (IgY) and the albumen (IgA) [5]. These maternal antibodies protect chicks in the first weeks of life. The CPC Learning Centre Maternal Antibody Transfer bulletin notes that in a flock of 25,000, as many as 2,500 birds may carry no maternal antibodies at all, even when flock titers look acceptable [5]. Vaccinating chicks while maternal antibodies are still high will cause vaccine failure: the maternal antibody neutralizes the vaccine before the chick can build its own immunity [5]. Vaccinating too late leaves birds unprotected. Work with your veterinarian and breeder flock serology to time vaccinations correctly.' },
  ]));

  c.push(para(
    'For more on the diseases these vaccines target, see Course 7 (Common Poultry Diseases) in this series.'
  ));

  c.push(para([
    { text: 'Learning objectives for Course 8:', bold: true },
  ]));
  c.push(bullet('Explain the immune mechanisms relevant to water, wing web, eye drop, and coarse spray vaccination routes.'));
  c.push(bullet('Identify which diseases are controlled through each vaccination method.'));
  c.push(bullet('Handle, store, and prepare vaccines correctly at each step from refrigerator to bird.'));
  c.push(bullet('Apply correct technique for water vaccination, wing web injection, eye drop administration, and coarse spray vaccination.'));
  c.push(bullet('Use PPE and biosecurity protocols for each method.'));
  c.push(bullet('Monitor flock response and identify vaccination failures before they become production losses.'));

  // ============================================================
  // SECTION 1: WATER VACCINATION
  // ============================================================
  c.push(pageBreak());
  c.push(h1('Section 1: Poultry Water Vaccination'));

  c.push(para(
    'Water vaccination is the most widely used mass-vaccination method in commercial poultry. Birds drink the vaccine solution from their own drinkers over a two-hour window, and the entire flock can be vaccinated in a single session without catching a single bird. When the protocol is followed correctly, it provides broad coverage at low labor cost. When corners are cut, it provides false confidence: the vials were opened, the session ran, but the birds are not protected.'
  ));

  // 1.1
  c.push(h2('1.1  Immune Responses to Oral Vaccines'));

  c.push(para(
    'When a bird drinks a live attenuated vaccine, the vaccine virus contacts the gut lining and the gut-associated lymphoid tissue (GALT). The GALT includes the cecal tonsils and other lymphoid patches that sample the gut contents and start the immune response [3]. B cells in the GALT produce IgA antibodies that travel to mucosal surfaces throughout the bird: the gut, the respiratory tract, and the eye.'
  ));

  c.push(para(
    'The result is mucosal immunity. For respiratory vaccines like Newcastle Disease (NDV) and Infectious Bronchitis (IBV) delivered by water, the IgA built in the gut travels to the respiratory surfaces and blocks virus before it can get a foothold. For gut-targeting vaccines like Infectious Bursal Disease (IBD/Gumboro), the IgA response right at the gut lining is what provides the protection.'
  ));

  c.push(para(
    'The CPC Learning Centre General Principles of Vaccination guide explains that the humoral immune response, driven by B cells derived from the bursa of Fabricius, produces the antibodies that block infection [2]. Cell-mediated immunity, driven by T cells from the thymus, handles destruction of already-infected cells. Effective vaccination programs stimulate both branches [2].'
  ));

  c.push(para([
    { text: 'What oral vaccination cannot do.', bold: true },
    { text: ' Not every disease can be controlled through the water route. Marek\'s Disease requires a cell-associated herpesvirus vaccine delivered by subcutaneous injection or in-ovo administration at the hatchery [11,12]. For a brief overview of in-ovo vaccination, see Section 5 of this course. Fowl Pox is not effectively delivered by water: it needs direct contact with the skin to stimulate a local pox immune response, which is why wing web vaccination is used instead. For respiratory diseases where direct individual delivery matters (ILT in particular), eye drop vaccination is more reliable than water.' },
  ]));

  // 1.2
  c.push(h2('1.2  Diseases Prevented by Water Vaccination'));

  c.push(para(
    'The following diseases are commonly controlled through water vaccination programs in Canadian commercial poultry operations:'
  ));

  c.push(bullet([
    { text: 'Infectious Bursal Disease (IBD/Gumboro)', bold: true },
    { text: ': The primary use of water vaccination in broiler production. The vaccine targets the bursa of Fabricius and stimulates humoral immunity to protect against the immunosuppressive effects of the field virus [10]. Gumboro strikes birds between 3 and 6 weeks of age, and a break at this age leads to secondary infections throughout grow-out [10]. Timing of the water vaccination must account for maternal antibody levels from the breeder flock [5].' },
  ]));

  c.push(bullet([
    { text: 'Newcastle Disease (NDV)', bold: true },
    { text: ': Live attenuated lentogenic strains including La Sota, Clone 30, and B1 (Hitchner B1) are routinely delivered by water. These strains replicate in the respiratory and gut lining and build broad local and systemic protection. NDV is highly contagious and federally reportable in Canada [12], and vaccination is a cornerstone of commercial broiler and layer programs.' },
  ]));

  c.push(bullet([
    { text: 'Infectious Bronchitis (IBV)', bold: true },
    { text: ': A highly contagious coronavirus affecting the respiratory, renal, and reproductive systems in chickens of all ages [8]. The CPC Learning Centre IBV Disease Profile describes IBV as "highly transmissible and a tremendous hazard for unvaccinated flocks" [8]. Multiple serotypes circulate in Canada, including Massachusetts, Connecticut, and variants [8]. Live IBV vaccines are frequently delivered by water and coarse spray together for broad mucosal coverage.' },
  ]));

  c.push(bullet([
    { text: 'Coccidiosis (live oocyst vaccines)', bold: true },
    { text: ': Live coccidial vaccines are sometimes delivered through the drinking water in early chick placement, seeding the litter with low-pathogenicity oocysts to establish controlled immunity. Protocols vary and require veterinary guidance.' },
  ]));

  c.push(...figureOrPlaceholder(
    'photo1_1.jpg',
    'Photo 1.1: Water vaccination in a commercial broiler barn',
    'Photo 1.1: A commercial broiler house of the kind used for water vaccination across Canada. Drinker lines run the full length of the barn so every bird can reach water during the two-hour vaccine window. Photo: USDA/Joe Valbuena, public domain.',
    5.6
  ));

  // 1.3
  c.push(h2('1.3  Cold Chain and Vaccine Storage'));

  c.push(para(
    'Live vaccines are biological materials. They are alive, and they die at the wrong temperature. Once a vaccine loses potency, no amount of correct technique in the barn will recover it. Cold chain failure is one of the most common and least visible causes of vaccination failure in the field.'
  ));

  c.push(para(
    'The CPC Learning Centre Water Vaccination Technical Bulletin specifies: store at 2-8°C (35-45°F). Transport in a cooler with an ice pack until the moment of use. Never expose to direct sunlight [1].'
  ));

  c.push(labeled('Temperature range:', ' Keep vaccine between 2°C and 8°C from arrival at the farm until the vial is opened [1].'));
  c.push(labeled('Transport:', ' Use a hard-sided cooler with gel ice packs. Check the temperature inside the cooler before leaving for the barn. If the cooler warms during the drive, the vaccine is already degrading.'));
  c.push(labeled('No freezing:', ' Freezing destroys most live vaccines by rupturing the viral envelope. A vaccine that froze and thawed is useless, even if it still looks fine in the vial.'));
  c.push(labeled('No sunlight:', ' UV light in direct sunlight inactivates live virus rapidly. Keep vials covered until the moment of use [1].'));
  c.push(labeled('Record keeping:', ' The CPC Learning Centre Water Vaccination guide emphasizes recording the serial number and expiry date of every vaccine used [1]. This is both a good production practice and a regulatory requirement for traceability in commercial operations.'));

  c.push(para(
    'Check expiry dates on every vial before vaccination day. An expired vaccine may have reduced potency even if it was stored correctly. Never assume a vial is good because it was refrigerated.'
  ));

  // 1.4
  c.push(h2('1.4  Preparing Your Water System'));

  c.push(para(
    'Chlorine kills bacteria. It also kills vaccine virus. If you vaccinate through a water line that still has chlorine in it, the chlorine will inactivate the live vaccine before birds drink it. This is the most common avoidable failure in water vaccination programs, and it is entirely preventable with a 72-hour shutdown of your disinfection system before vaccination day.'
  ));

  c.push(labeled('Chlorinator:', ' Turn off the chlorinator 72 hours before vaccination [1]. This gives enough time for residual chlorine to dissipate from the water lines and drinkers through normal water use. Do not shorten this window.'));
  c.push(labeled('Aqueduct water:', ' If your water comes from a municipal supply that adds chlorine, use a charcoal filter 72 hours before vaccination to remove chlorine residual from the line [1].'));
  c.push(labeled('Drinker cleaning:', ' The CPC Learning Centre Water Vaccination guide directs: clean drinkers with a mild soap only. Do not use a disinfectant [1]. Disinfectant residue on drinker surfaces will inactivate the vaccine. After cleaning, flush lines thoroughly with fresh water.'));
  c.push(labeled('Milk pre-rinse:', ' Rinse the drinkers and water lines with a powdered milk solution (approximately 454 g per 190 litres, equivalent to 1 lb per 50 gallons) [1]. The milk proteins coat the inside of the lines and drinker surfaces, neutralizing any remaining traces of disinfectant or organic matter that could harm the vaccine.'));

  c.push(para(
    'A practice run one to two days before vaccination day is strongly recommended. The CPC Learning Centre Water Vaccination guide suggests using plain water for this run to confirm exactly how much water the flock drinks in a two-hour window at the expected age and environmental temperature [1]. This number becomes your target vaccine volume.'
  ));

  c.push(para(
    'Calculate the vaccine volume using 40% of the flock\'s expected daily water consumption for that age and temperature [1]. The CPC Learning Centre Water Vaccination Technical Bulletin provides reference volumes per 1,000 birds by age:'
  ));

  // Water volume table
  c.push(para('Table 1.1: Water vaccination volumes per 1,000 broiler birds (CPC Learning Centre) [1]:', { spaceAfter: 60 }));
  c.push(dataTable(
    ['Age (weeks)', 'Volume per 1,000 birds (litres)'],
    [
      ['1', '10'],
      ['2', '20'],
      ['3', '29'],
      ['4', '38'],
    ],
    [4320, 4320]
  ));
  c.push(new Paragraph({ spacing: { before: 60, after: 80 } }));

  c.push(para(
    'Note: volumes increase with age and change with ambient temperature. Birds drink more in warm weather. The CPC Learning Centre guide assumes an outdoor temperature of approximately 21°C (70°F) as the baseline [1]. Increase volume on hot days; reduce on cold days. Confirm with a practice run.'
  ));

  // 1.5
  c.push(h2('1.5  Vaccine Preparation and Mixing'));

  c.push(para(
    'The skim milk powder protects the vaccine. Mix it into the water first, before the vaccine is added. The milk proteins coat the vaccine virus particles and provide a physical buffer against any water impurities or pH fluctuations that might inactivate the live virus. Do not skip this step and do not add the vaccine first.'
  ));

  c.push(para(
    'The CPC Learning Centre Water Vaccination guide gives the following preparation protocol [1]:'
  ));

  c.push(numbered('Add skim milk powder to the vaccine water at a rate of approximately 454 g per 190 litres (1 lb per 50 gallons) and mix thoroughly [1].'));
  c.push(numbered('Dissolve the vaccine by adding a small amount of the milk-water solution directly to each vaccine vial. Do not use plain tap water at this step.'));
  c.push(numbered('Add the dissolved vaccine to the main milk-water solution.'));
  c.push(numbered('Rinse each vial thoroughly before discarding. The CPC Learning Centre guide notes that failing to rinse vials properly can waste up to 15% of the vaccine dose [1].'));
  c.push(numbered('Record the serial number and expiry date of every vial used [1].'));

  c.push(para(
    'Do not add vaccine to standing water with no milk protection. Do not use a proportioner or medicator to deliver the vaccine: proportioners use concentrations and dilutions that can exceed safe ranges, and internal parts may have residual disinfectant [1]. Add vaccine directly to the drinker system after pre-flushing with the milk solution.'
  ));

  c.push(callout(
    'The vaccine should be consumed within two hours of preparation [1]. Prepare only the volume you can deliver in that window. If the flock does not finish in two hours, the remaining vaccine loses potency and should be discarded.'
  ));

  // 1.6
  c.push(h2('1.6  Running the Vaccination'));

  c.push(labeled('Water starvation:', ' Withhold water for approximately two hours before vaccination to build enough thirst to drive birds to the drinkers promptly [1]. Do not starve birds for longer than necessary: stress suppresses the immune response and defeats the purpose. For breeders, the CPC Learning Centre guide recommends turning off water one hour before lights off, then vaccinating one hour after lights come on the following morning [1].'));

  c.push(labeled('Vaccinate on feed days:', ' Birds drink more actively when feed is available. The CPC Learning Centre Water Vaccination guide specifies: vaccinate on feed days [1].'));

  c.push(labeled('Delivering the vaccine by drinker type [1]:', ' Match the delivery method to your drinker system:'));
  c.push(bullet('Bell drinkers, troughs, and cups: pour the prepared vaccine solution directly into each drinker by hand.'));
  c.push(bullet('Nipple drinker systems: transfer the vaccine from a tank to the water lines using a sump pump (approximately 1/3 horsepower) or by gravity feed. Open the water line at the far end of the barn and close it when the white milk-vaccine solution is visible coming out the end. This confirms the entire line is primed with vaccine solution.'));

  c.push(labeled('Walk the barn:', ' Once vaccine solution is available in the drinkers, walk through the barn to encourage birds to move and drink [1]. Birds at rest will not self-direct to the drinkers in the numbers needed. Active stimulation increases uptake. A well-vaccinated flock is one where birds are actively drinking, not one where the solution was simply available.'));

  c.push(labeled('Confirm consumption:', ' The vaccine solution should be fully consumed within two hours of delivery [1]. If consumption appears incomplete, walk the flock again. Observe for areas where birds are avoiding drinkers: this can indicate a system blockage, a zone where chlorine was not fully cleared, or overcrowding that is preventing access.'));

  c.push(labeled('Post-vaccination water:', ' Once the vaccine solution is fully consumed, restore normal water to the flock [1]. Do not leave birds without water after vaccination.'));

  c.push(...figureOrPlaceholder(
    'fig1_2.png',
    'Figure 1.2: Water volume and consumption timeline during vaccination',
    'Figure 1.2: Timeline showing the short water withdrawal period before vaccination, the two-hour vaccine window when birds must drink the full dose, and the resumption of normal water afterward. Source: CPC Short Courses.',
    6.2
  ));

  c.push(labeled('Drinker ratios [1]:',
    ' The CPC Learning Centre Water Vaccination Technical Bulletin specifies minimum drinker access ratios: Bell drinkers: 1 per 100 birds. Nipple drinkers: 1 per 15 birds. Cup drinkers: 1 per 30 birds. Troughs (6 foot): 1 per 150 birds. Troughs (8 foot): 1 per 200 birds. These ratios matter during vaccination because all birds need to drink within the two-hour window.'
  ));

  // 1.7
  c.push(h2('1.7  Biosecurity, PPE, and Safety'));

  c.push(para(
    'Live Newcastle Disease Virus in water vaccines can cause conjunctivitis in humans. The CPC Learning Centre Water Vaccination Technical Bulletin specifies: wear gloves, a mask, and safety glasses during both preparation and administration [1]. This is not a precaution against a rare event. Newcastle Disease regularly affects personnel who work with NDV-containing vaccines without eye protection.'
  ));

  c.push(bullet('Wear disposable gloves throughout preparation and vaccination.'));
  c.push(bullet('Wear a face mask and safety glasses or a face shield.'));
  c.push(bullet('If vaccine contacts your eyes, flush immediately with water and consult a physician.'));
  c.push(bullet('Burn all empty vaccine vials and containers after use [1]. Do not leave open vials where wild birds or other animals can contact them.'));
  c.push(bullet('Wash hands and forearms thoroughly after vaccination and before eating or touching your face.'));

  c.push(para(
    'Do not vaccinate birds that are already sick, stressed from heat, or showing signs of respiratory disease [2]. The CPC Learning Centre General Principles of Vaccination guide is explicit: vaccinate only healthy birds [2]. Vaccination of stressed or diseased flocks leads to poor immune response, increased reaction rates, and inadequate protection.'
  ));

  // 1.8
  c.push(h2('1.8  Monitoring and Troubleshooting'));

  c.push(para(
    'The goal of monitoring is not to catch failures after they happen. It is to catch setup problems before vaccination day and consumption problems during the two-hour window. Both are fixable. A failure you discover three weeks post-vaccination when birds are sick is not.'
  ));

  c.push(labeled('Before vaccination:', ' Confirm chlorine is off. Check drinkers are clean with no disinfectant residue. Confirm vaccine vials were stored at 2-8°C and are within expiry. Run a plain-water practice run 24-48 hours in advance to confirm volume and timing [1].'));
  c.push(labeled('During vaccination:', ' Walk the flock at 30-minute intervals. Confirm birds are actively drinking. Confirm the vaccine solution is white (milk still active) and moving through the drinker lines. If solution runs clear, something is wrong with distribution.'));
  c.push(labeled('After vaccination:', ' Check that the full prepared volume was consumed within two hours. If large volumes remain, investigate: drinker system blockage, poor water starvation, or birds deterred from drinking by environmental stressors.'));

  c.push(para(
    'Common causes of water vaccination failure:'
  ));

  c.push(bullet([
    { text: 'Chlorine not removed (72-hour window not respected):', bold: true },
    { text: ' Most common preventable failure. The vaccine was inactivated before birds drank it.' },
  ]));
  c.push(bullet([
    { text: 'High maternal antibody neutralization:', bold: true },
    { text: ' Chicks vaccinated too early, before maternal antibody titers have declined sufficiently, will not respond to the vaccine. Coordinate timing with your veterinarian and breeder flock serology [5].' },
  ]));
  c.push(bullet([
    { text: 'Insufficient water starvation:', bold: true },
    { text: ' Birds are not thirsty enough to drink their full dose in the two-hour window.' },
  ]));
  c.push(bullet([
    { text: 'Immunosuppression:', bold: true },
    { text: ' IBD, Marek\'s Disease, and mycotoxins all suppress the immune system. Birds with active IBD infection at vaccination time may not respond adequately to any vaccine [10].' },
  ]));
  c.push(bullet([
    { text: 'Wrong vaccine strain for regional disease pressure:', bold: true },
    { text: ' IBV variant strains are emerging in Ontario and other Canadian provinces [8]. A program built on Massachusetts and Connecticut strains alone may not protect against circulating variants. Discuss with your veterinarian.' },
  ]));

  // ============================================================
  // SECTION 2: WING WEB VACCINATION
  // ============================================================
  c.push(pageBreak());
  c.push(h1('Section 2: Poultry Wing Web Vaccination'));

  c.push(para(
    'Wing web vaccination delivers live vaccine directly into the skin of individual birds using a specialized double-needle applicator. Each bird gets a confirmed dose. Seven to ten days after vaccination, you can inspect the injection sites and see whether the vaccine worked. That visible take is what makes wing web vaccination different from every mass-vaccination method: it gives you proof, bird by bird, that immunity was stimulated.'
  ));

  // 2.1
  c.push(h2('2.1  When to Use Wing Web Vaccination'));

  c.push(para(
    'Use wing web vaccination when the disease requires direct skin contact with the vaccine virus to stimulate local immunity, when confirming individual bird protection matters, or when vaccination-in-the-face-of-outbreak is necessary because of the disease\'s slow spread dynamics.'
  ));

  c.push(para(
    'Fowl Pox is the primary disease controlled by wing web vaccination in Canadian commercial flocks. The CPC Learning Centre Fowl Pox Disease Profile explains that Fowl Pox is a slow-moving disease that rolls through a flock gradually as the virus moves bird to bird [7]. This slow progression is what makes wing web vaccination effective even in the face of an active outbreak: you can vaccinate healthy birds ahead of the wave and give them 7 to 10 days to build protective immunity before the virus reaches them [7].'
  ));

  c.push(para(
    'Wing web vaccination is also used in some programs for Avian Encephalomyelitis (AE) in breeder pullets, where confirming individual immunity before the production phase begins is critical.'
  ));

  // 2.2
  c.push(h2('2.2  Fowl Pox: The Primary Target Disease'));

  c.push(para(
    'Understanding why wing web vaccination is used for Fowl Pox requires understanding how Fowl Pox spreads and what it does to a flock.'
  ));

  c.push(para(
    'The CPC Learning Centre Fowl Pox Disease Profile describes two forms of the disease: the dry form and the wet form [7].'
  ));

  c.push(bullet([
    { text: 'Dry form:', bold: true },
    { text: ' Caused by direct contact between birds (pecking) or mosquito bites. Produces raised, reddened lesions on the skin that progress through pustule and scabbing stages. Clinical effect is generally mild, with slight drops in feed consumption and production [7].' },
  ]));
  c.push(bullet([
    { text: 'Wet form:', bold: true },
    { text: ' Caused by transmission through fly contact or aerosol, usually entering through mucous membranes. Lesions appear in the eye, nasal passages, mouth, throat, and trachea. The wet form is more severe: birds may be unable to eat or breathe and can die from asphyxiation if the trachea becomes blocked [7].' },
  ]));

  c.push(para(
    'Poxvirus is exceptionally hardy in the environment. The CPC Learning Centre Fowl Pox profile notes it can survive in dried scabs for months or even years [7]. Carryover from one flock to the next through contaminated litter or equipment is a major route of introduction. Mosquitoes and flies serve as vectors between flocks and from wild bird populations [7].'
  ));

  c.push(para(
    'There is no treatment for Fowl Pox. Affected birds can be culled if severely ill. For the rest of the flock, vaccination in the face of disease is the appropriate response, because the disease moves slowly enough that many birds can be protected before the virus reaches them [7]. Always confirm the diagnosis by laboratory testing (histology or virus identification) before vaccinating into an outbreak [7].'
  ));

  c.push(para(
    'Prevention through biosecurity is the best long-term approach: no commingling of birds from different sources, strict visitor control with clean coveralls and boot covers, and mosquito management during the vector season [7]. For more on biosecurity protocols, see Course 2 (Biosecurity) in this series.'
  ));

  c.push(...figureOrPlaceholder(
    'photo2_1.jpg',
    'Photo 2.1: Dry form Fowl Pox lesions on the comb and wattles',
    'Photo 2.1: Classic dry form Fowl Pox in a chicken. Raised scab-like lesions on the comb and wattles are the most recognizable field sign. These are the lesions wing web vaccination is designed to prevent. Photo: Lucyin, CC BY-SA 4.0.',
    5.0
  ));

  // 2.3
  c.push(h2('2.3  Equipment, Cold Chain, and Vaccine Handling'));

  c.push(para(
    'Wing web vaccines are live virus vaccines. Cold chain requirements are the same as for water vaccines: store at 2-8°C, keep shaded, and do not freeze [1].'
  ));

  c.push(labeled('The wing web applicator:', ' Wing web vaccination uses a specialized bifurcated (double-needle) applicator. The two-needle design punctures both layers of the wing web skin simultaneously and deposits vaccine between them. This is not a standard injection syringe. Using the wrong equipment produces an incorrect injection depth, vaccine in muscle tissue instead of dermis, and a failed take.'));

  c.push(labeled('Applicator preparation:', ' The applicator must be sterile before use. Rinse with 70% isopropyl alcohol and allow to air-dry completely before dipping into vaccine. Any residual alcohol on the needles will inactivate the live virus.'));

  c.push(labeled('Vaccine reconstitution:', ' Follow the manufacturer\'s diluent instructions. Most Fowl Pox vaccines are lyophilized (freeze-dried) and require reconstitution with a specific diluent volume. Add the diluent to the vial and mix gently. Do not shake vigorously.'));

  c.push(labeled('Dipping between birds:', ' The applicator is dipped into the vaccine vial between each bird. Keep the vial cool (in an insulated cup with ice) throughout the session. Vaccine potency drops rapidly once the vial is opened and warmed.'));

  c.push(labeled('Applicator hygiene:', ' If blood or debris accumulates on the needles, clean with a fresh alcohol wipe and allow to dry briefly before continuing. A contaminated applicator increases the risk of post-vaccination bacterial infections at injection sites.'));

  c.push(labeled('Record keeping:', ' Note the serial number and expiry date of every vial used, along with the number of birds vaccinated, the date, and the operator [1].'));

  // 2.4
  c.push(h2('2.4  Bird Restraint and Vaccination Technique'));

  c.push(para(
    'Wing web vaccination is a hands-on individual-bird procedure. The quality of every injection depends on correct restraint, correct site identification, and correct needle placement. A bird that moves at the moment of injection will produce a missed take.'
  ));

  c.push(labeled('Restraint:', ' Hold the bird firmly against your body with one hand. The other hand is free to manipulate the wing. Birds should be calm. Struggling birds increase the risk of injury to the bird and to the operator, and reduce take rates. Work quickly and confidently.'));

  c.push(labeled('Finding the wing web:', ' Extend the wing away from the body. The wing web is the thin, featherless fold of skin on the underside of the wing, between the upper arm (humerus) and forearm (radius/ulna). It is the patagium: a membrane of skin stretched across the inner angle of the wing. This is the correct site. Do not inject into the wing muscle.'));

  c.push(labeled('Injection technique:', ' Dip the applicator needles into the vaccine vial. Position the applicator perpendicular to the wing web membrane. Push both needles cleanly through both layers of skin in a single smooth motion. Withdraw without twisting. A small droplet of vaccine should be visible at the puncture site. This confirms vaccine was delivered between the skin layers, not into muscle and not missed entirely.'));

  c.push(labeled('Move to the next bird:', ' Work at a steady pace. Dip the applicator between each bird. Change vaccine vials when the current vial is empty and record the next serial number.'));

  c.push(...figureOrPlaceholder(
    'fig2_2.png',
    'Figure 2.2: Wing web vaccination site anatomy',
    'Figure 2.2: Left, where the wing web sits when the wing is held open. Right, cross-section showing the two skin layers and the loose connective tissue between them where the bifurcated needle deposits the vaccine. Source: CPC Short Courses.',
    6.5
  ));

  // 2.5
  c.push(h2('2.5  Reading the Vaccine Take'));

  c.push(para(
    'The vaccine take is the single feature that separates wing web vaccination from every other method: it is visible proof of immune stimulation. The CPC Learning Centre General Principles of Vaccination guide notes that confirming take rates across a sample of the flock is the only way to know whether your wing web vaccination program is working [2].'
  ));

  c.push(labeled('When to check:', ' Inspect the injection sites at 7 to 10 days post-vaccination. This is when the take is fully formed and reliably visible.'));

  c.push(labeled('What a good take looks like:', ' A small, firm bump or pustule at the injection site, sometimes with a dry scab forming on top. The surrounding tissue is minimally affected. This is the local pox immune response in progress: the vaccine virus has replicated in the dermis and stimulated the immune system exactly as intended.'));

  c.push(labeled('No take:', ' No visible bump, no swelling, no scab. The injection site looks completely normal. This means either the bird was missed entirely (needle passed through air, not tissue), or the vaccine was already inactivated before injection. A bird with no take has no protection.'));

  c.push(labeled('Excessive reaction:', ' A large, swollen, weeping lesion with spreading redness and possible discharge. This usually indicates secondary bacterial contamination at the injection site, from a dirty applicator, a contaminated vial, or injection into muscle where vaccine does not belong.'));

  c.push(labeled('Take rate standard:', ' Check 2% of the flock (a minimum of 20 birds in any flock) at day 7 to 10. A take rate of 90% or higher is the target. A take rate below 80% indicates a vaccination protocol problem and should prompt a review of cold chain, applicator technique, and reconstitution procedure.'));

  c.push(callout(
    'A vaccination session that was completed efficiently but produced an 80% take rate means one in five birds is unprotected. In a Fowl Pox outbreak, those birds become the leading edge of further spread. Take rate checks are not a formality.'
  ));

  // 2.6
  c.push(h2('2.6  Biosecurity, Safety, and Post-Vaccination Hygiene'));

  c.push(para(
    'Wing web vaccines are live bird-adapted viruses. The risk to humans is low, but standard PPE protects both the operator and the birds.'
  ));

  c.push(bullet('Wear disposable gloves throughout the session.'));
  c.push(bullet('If working with NDV-containing wing web products (less common in this route), add safety glasses.'));
  c.push(bullet('The CPC Learning Centre Inactivated Vaccine Administration guide specifies changing the needle at no more than every 1,000 birds [4]. For the wing web applicator, inspect the needles regularly for bending or dulling. A dull or bent needle produces an unclean puncture and increases reaction rates.'));
  c.push(bullet('Burn all empty vaccine vials after the session [1]. Do not discard open vials in accessible waste bins.'));
  c.push(bullet('After the session, disinfect the applicator with 70% isopropyl alcohol, rinse well with clean water, and store in a clean, dry place [3].'));
  c.push(bullet('Do not use the same applicator for different vaccine types without full cleaning and sterilization between uses.'));

  // 2.7
  c.push(h2('2.7  Monitoring and Troubleshooting'));

  c.push(labeled('Low take rate (below 80%):', [
    run(' Review cold chain records from the vaccine\'s arrival to the day of vaccination. A single temperature excursion above 8°C can reduce take rate dramatically. Confirm the applicator is functioning correctly and needles are sharp. Review restraint technique: a bird that moved at the moment of injection may have received a missed or partial dose. Evaluate whether the vaccine vial was fully reconstituted and whether the diluent was at the correct temperature.'),
  ]));

  c.push(labeled('No takes at all:', [
    run(' Usually a cold chain failure. The vaccine virus was inactivated before use. This can also occur if alcohol disinfectant on the applicator needles was not fully dried before dipping into vaccine. Rule out both before repeating the vaccination session.'),
  ]));

  c.push(labeled('High rate of excessive reactions:', [
    run(' Secondary bacterial infection. Inspect applicator needles for contamination. Check that the vaccine solution was not contaminated (dipping the applicator into the vial repeatedly introduces surface bacteria from the birds). In flocks with active bacterial disease, keep separate vaccine vials for different barns and replace vials if they show any turbidity or odor.'),
  ]));

  c.push(labeled('Vaccination in face of active Fowl Pox outbreak:', [
    run(' Confirm the diagnosis by laboratory testing before vaccinating into the outbreak [7]. Vaccinate all birds not yet showing lesions. Accept that birds already incubating the virus (exposed within the past 4 to 6 days) may still develop lesions despite vaccination. The goal is to stop the wave, not to treat birds that are already infected.'),
  ]));

  // ============================================================
  // SECTION 3: EYE DROP VACCINATION
  // ============================================================
  c.push(pageBreak());
  c.push(h1('Section 3: Poultry Eye Drop Vaccination'));

  c.push(para(
    'Eye drop vaccination puts a single drop of live vaccine directly onto the conjunctival surface of each bird\'s eye. The drop is absorbed through the conjunctiva, stimulates the Harderian gland (a specialized avian gland located behind the eye that produces local IgA), and drains through the nasolacrimal duct into the nasal cavity and upper respiratory tract. The result is local mucosal immunity exactly where respiratory pathogens first make contact with the bird.'
  ));

  c.push(para(
    'For respiratory diseases like Infectious Laryngotracheitis (ILT) and Infectious Bronchitis (IBV), this direct delivery to the respiratory mucosa is why eye drop vaccination is often more reliable than water vaccination. The vaccine reaches the tissue where protection is needed most. The tradeoff is labor: every bird must be individually handled and held until the drop is absorbed. In a flock of 50,000 birds, that is 50,000 individual handlings.'
  ));

  // 3.1
  c.push(h2('3.1  How Eye Drop Vaccination Works'));

  c.push(para(
    'The CPC Learning Centre Article on the Avian Immune System explains that IgA is the key antibody at mucosal surfaces: it stops pathogens from attaching and taking hold at the gut lining, airways, and eye [3]. IgA is produced constantly at the eye, respiratory tract, gut, and other mucosal surfaces. When vaccine antigen contacts the conjunctiva, it triggers local IgA production that spreads across the eye and upper respiratory mucosa.'
  ));

  c.push(labeled('The Harderian gland:', ' The Harderian gland is a large gland located behind the eye in birds. It is a primary site of IgA production in the avian immune system. When vaccine antigen contacts the conjunctiva, the Harderian gland is directly stimulated [3]. This is why the ocular route produces superior local respiratory immunity compared to systemic injection for respiratory disease vaccines.'));

  c.push(labeled('Nasolacrimal drainage:', ' The eye and nasal cavity are connected by the nasolacrimal duct. When a vaccine drop is absorbed through the conjunctiva, excess vaccine and the IgA response generated at the eye drains through this duct into the nasal cavity and upper pharynx. This extends mucosal protection to include the nasal passages and the beginning of the trachea, the entry points for ILT and IBV [9].'));

  c.push(para(
    'The CPC Learning Centre ILT Disease Profile notes that the natural route of infection for ILT is via the respiratory tract and the ocular route (eyes) [9]. Eye drop vaccination mimics this natural infection route to stimulate immunity at exactly the right site. This is why eye drop is the standard route for ILT vaccination in Canada and is preferred over water delivery for respiratory strains of IBV.'
  ));

  // 3.2
  c.push(h2('3.2  Target Diseases'));

  c.push(bullet([
    { text: 'Infectious Laryngotracheitis (ILT)', bold: true },
    { text: ': A herpesvirus causing acute respiratory disease in chickens. The CPC Learning Centre ILT Disease Profile describes outbreaks causing up to 50-70% mortality in severe cases, with typical mortality in the 10-20% range and disease persisting for 2 to 6 weeks [9]. The CPC Learning Centre ILT profile also notes that in Delmarva in 1998, approximately 200 ILT cases caused losses exceeding $1 million USD [9]. Eye drop or intranasal delivery is the preferred vaccination route for live ILT vaccines in commercial flocks.' },
  ]));

  c.push(bullet([
    { text: 'Newcastle Disease (NDV)', bold: true },
    { text: ': Eye drop delivery of live NDV vaccines (La Sota, Clone 30, B1) produces strong local mucosal immunity in the upper respiratory tract. It is preferred over water in programs where uniform individual coverage matters most, such as breeder or layer operations where a single poorly protected bird can carry the virus and re-expose the rest of the flock.' },
  ]));

  c.push(bullet([
    { text: 'Infectious Bronchitis (IBV)', bold: true },
    { text: ': The CPC Learning Centre IBV Disease Profile notes that IBV is "highly transmissible and a tremendous hazard for unvaccinated flocks" [8]. Eye drop or coarse spray delivery of live IBV vaccines targets the respiratory mucosa directly. For some serotypes, eye drop is specified in the vaccine protocol to ensure adequate Harderian gland stimulation.' },
  ]));

  c.push(bullet([
    { text: 'Avian Metapneumovirus (aMPV)', bold: true },
    { text: ': Eye drop or spray vaccination is used for aMPV in turkey and some commercial chicken programs where the virus is endemic.' },
  ]));

  // 3.3
  c.push(h2('3.3  Equipment and Vaccine Preparation'));

  c.push(labeled('Dropper calibration:', ' The standard volume per eye drop for poultry vaccines is in the range of 25 to 35 microlitres (µL). Before beginning a vaccination session, calibrate your dropper by counting how many drops fill 1 mL from a calibrated syringe. Thirty drops per mL equals approximately 33 µL per drop, which is within the correct range. If drops are too large (fewer than 25 per mL), reduce pressure. If too small (more than 40 per mL), increase pressure or change the dropper tip. Consistent drop size is essential for uniform dose delivery across the flock [12].'));

  c.push(labeled('Diluent:', ' Use the manufacturer-specified diluent for each vaccine. Most live eye drop vaccines use a sterile physiological saline or purified water diluent. Do not substitute tap water.'));

  c.push(labeled('Blue dye option:', ' Some programs add a non-toxic blue dye to the diluent at reconstitution. When a bird receives the correct drop and the nasolacrimal drainage occurs, the dye stains the beak or tongue blue within a few minutes. This gives you a rapid field check to confirm the drop drained through correctly rather than running off the eyelid. Check 2% of the flock immediately after vaccination.'));

  c.push(labeled('Cold chain:', ' Remove vaccine from the refrigerator immediately before use. Keep the reconstituted vaccine vial in a cool, shaded container throughout the session. Do not expose to sunlight [1].'));

  c.push(labeled('Reconstitution:', ' Add the diluent to the lyophilized vaccine and mix gently. Vigorous shaking can damage the viral particles. Prepare only enough for one to two hours of vaccination at a time. Discard unused reconstituted vaccine at the end of the session.'));

  // 3.4
  c.push(h2('3.4  Administration Technique'));

  c.push(para(
    'The technique is straightforward but must be applied consistently across every bird in the flock. A drop that runs off the eyelid is a missed dose. A bird released before absorption is complete is unprotected.'
  ));

  c.push(numbered('Pick up the bird and hold it firmly against your body. Control the head so it cannot turn away.'));
  c.push(numbered('Tilt the bird\'s head slightly so the eye faces upward. This prevents the drop from immediately running sideways off the eyelid.'));
  c.push(numbered('Position the dropper tip approximately 1 to 2 cm above the eye. Do not touch the dropper to the eye surface: contact contamination can introduce bacteria into the vial.'));
  c.push(numbered('Squeeze the dropper to deliver a single drop directly onto the center of the conjunctiva (the clear surface of the eye, not the eyelid).'));
  c.push(numbered('Hold the bird in position until the drop is absorbed. You will see the bird blink, which distributes the vaccine across the conjunctival surface. Do not release until the drop is no longer visible on the eye.'));
  c.push(numbered('Set the bird down and move to the next. Maintain a steady working pace.'));

  c.push(para(
    'Common errors in technique:'
  ));
  c.push(bullet([
    { text: 'Drop on the eyelid, not the eye:', bold: true },
    { text: ' The vaccine runs off onto feathers and is wasted. Watch where the drop lands before confirming the bird is done.' },
  ]));
  c.push(bullet([
    { text: 'Releasing the bird before absorption:', bold: true },
    { text: ' The bird shakes its head and flings the drop off. The dose is lost.' },
  ]));
  c.push(bullet([
    { text: 'Dropper contact with the eye surface:', bold: true },
    { text: ' Introduces bacteria from the conjunctiva back into the vaccine vial. Replace the vial if contact occurs.' },
  ]));
  c.push(bullet([
    { text: 'Drops too large:', bold: true },
    { text: ' Excess vaccine runs off regardless of technique. Recalibrate the dropper.' },
  ]));

  c.push(...figureOrPlaceholder(
    'fig3_1.png',
    'Figure 3.1: Eye drop vaccination administration',
    'Figure 3.1: Correct head position with the eye facing up, a full drop placed on the conjunctival surface, and the nasolacrimal drainage pathway that carries vaccine antigen to the Harderian gland and the upper respiratory tract. Source: CPC Short Courses.',
    6.5
  ));

  // 3.5
  c.push(h2('3.5  Confirming Uniform Coverage'));

  c.push(para(
    'With water vaccination, you can assess coverage by watching flock drinking behavior during the two-hour window. With eye drop vaccination, you are doing individual handlings: every bird is in your hands. The question is not whether coverage is happening but whether your technique is consistently correct throughout a long session.'
  ));

  c.push(labeled('Blue dye tongue check:', ' If blue dye was added to the diluent, check the beaks or tongues of 2% of vaccinated birds immediately after handling. Blue coloring confirms the nasolacrimal drainage occurred and the drop reached the nasal cavity. A bird with no blue on the tongue after vaccination should be re-checked: either the drop was placed incorrectly or the bird was released before drainage.'));

  c.push(labeled('Operator fatigue management:', ' Eye drop vaccination over large flocks becomes physically demanding. Fatigue leads to technique errors: drops placed too far left, birds released too soon, dropper tips contacting eyes. Rotate operators regularly. Set a pace that allows correct technique to be maintained throughout the session, not just at the start.'));

  c.push(labeled('Post-vaccination serology:', ' The most reliable confirmation of coverage is serology at 14 to 21 days post-vaccination. A flock with uniform, well-stimulated titers confirms that the vaccination program worked. Low or non-uniform titers at this point indicate either cold chain failure, technique problems, or maternal antibody interference. Work with your veterinarian to interpret serology results.'));

  // 3.6
  c.push(h2('3.6  Biosecurity, PPE, and Safety'));

  c.push(para(
    'Eye drop vaccines for ILT and NDV contain live, replication-competent virus. The risk to humans is real but manageable with correct PPE. The CPC Learning Centre Water Vaccination guide notes that Newcastle Disease virus contact can cause conjunctivitis in humans [1]. This applies equally to NDV eye drop vaccines.'
  ));

  c.push(bullet('Wear safety glasses or a face shield throughout the vaccination session when using NDV or ILT vaccines.'));
  c.push(bullet('Wear disposable gloves. Replace gloves if they become visibly soiled.'));
  c.push(bullet('If vaccine contacts your eyes, flush immediately with copious clean water for 15 minutes and consult a physician.'));
  c.push(bullet('Wash hands and forearms thoroughly after each session.'));
  c.push(bullet('Burn all empty vaccine vials and discard single-use droppers in a sealed bag before burning [1].'));
  c.push(bullet('Do not eat, drink, or touch your face during a vaccination session.'));

  c.push(para(
    'Regarding bird biosecurity: maintain your normal farm entry and exit protocols during and after vaccination. A vaccination session that brings many workers into the barn is also a biosecurity risk. Ensure all personnel handling birds are in clean coveralls and footwear, and follow your farm biosecurity plan throughout the session. For more on farm biosecurity protocols, see Course 2 (Biosecurity) in this series.'
  ));

  // 3.7
  c.push(h2('3.7  Monitoring and Troubleshooting'));

  c.push(labeled('Expected post-vaccination flock response:', [
    run(' Live respiratory vaccines delivered by eye drop will produce a mild reaction in the flock at 5 to 7 days post-vaccination. Birds may show brief, mild respiratory signs: quiet tracheal rales, a small increase in eye moisture, slight depression for 12 to 24 hours. This is the expected immune stimulation response, not a disease outbreak. A reaction that is severe, prolonged, or accompanied by mortality is not expected and should prompt immediate consultation with your veterinarian.'),
  ]));

  c.push(labeled('No visible flock reaction at day 5 to 7:', [
    run(' The expected mild reaction did not occur. Possible causes: vaccine inactivated before delivery (cold chain failure), technique errors resulting in widespread missed doses, or high maternal antibody levels neutralizing the vaccine. Review cold chain records and technique consistency. Check serology at day 14 to 21.'),
  ]));

  c.push(labeled('Severe post-vaccination reaction:', [
    run(' Respiratory disease with significant mortality appearing 5 to 10 days after eye drop vaccination most commonly indicates either that the wrong vaccine strain was used, that the flock was already incubating a respiratory pathogen at vaccination time, or that the vaccine lot had higher-than-expected pathogenicity. Do not vaccinate a flock showing active respiratory signs [2]. Contact your veterinarian immediately.'),
  ]));

  c.push(labeled('Uneven serology (wide range of titers at day 21):', [
    run(' High coefficient of variation in post-vaccination serology indicates that some birds received adequate doses and some did not. Review technique consistency across operators. Check for zones in the barn where birds were not accessible or where operators had difficulty. High CV in serology is the serological equivalent of poor water uptake in water vaccination: a coverage problem, not a vaccine problem.'),
  ]));

  c.push(callout(
    'All three vaccination methods covered so far depend on the same foundation: a well-timed program designed with veterinary input, vaccines kept cold from factory to barn, and a technique executed consistently on every bird. The best vaccination program in the world fails at any one of those three points.'
  ));

  // ============================================================
  // SECTION 4: POULTRY COARSE SPRAY VACCINATION
  // ============================================================
  c.push(pageBreak());
  c.push(h1('Section 4: Poultry Coarse Spray Vaccination'));

  c.push(para(
    'Coarse spray vaccination lets you cover an entire barn in a single walk-through. There is no water starvation, no individual bird handling, and no limit on flock size. The vaccine is diluted in clean water and applied as a coarse mist over the birds\' heads. Each bird inhales and absorbs the vaccine through the conjunctiva and nares. When it is done correctly, uniform flock coverage is achievable in minutes. When it is done incorrectly, missed birds and failed protection are the result. The difference lies in the details: the right diluent, the right volume, the right pressure, the right height, and fans off at the right time. This section draws directly from the CPC Learning Centre Coarse Spray Vaccination Technical Bulletin [6].'
  ));

  c.push(h2('4.1  How Coarse Spray Vaccination Works'));

  c.push(para(
    'Coarse spray vaccines target the upper respiratory mucosa. The large droplets a properly calibrated sprayer produces at 4.5-5.0 Bar settle on the conjunctiva and nares rather than going deep into the lungs. That matters because the mucosal immune tissue in the upper airways is where protection against diseases like Newcastle Disease and Infectious Bronchitis needs to start. Fine mist particles from a worn nozzle or wrong pressure travel past that immune tissue and into the deep lung, missing the site where the protection needs to build. [6,13]'
  ));

  c.push(para(
    'Once the droplets land on the conjunctiva or nares, the same immune pathway as eye drop vaccination is triggered. The vaccine antigen reaches the Harderian gland and the bronchus-associated lymphoid tissue (BALT), stimulating local IgA production and mucosal immunity across the respiratory tract. The advantage over eye drop vaccination is speed: coarse spray covers a whole barn floor in one pass. The trade-off is that you cannot verify individual bird coverage the way you can with eye drop or wing web vaccination. [2,13]'
  ));

  c.push(h2('4.2  Target Diseases and When to Use Spray'));

  c.push(para(
    'Coarse spray is well suited to live respiratory vaccines. The main targets in Canadian commercial broiler programs are Newcastle Disease virus (NDV) and Infectious Bronchitis virus (IBV). Some operations also use coarse spray for initial priming doses against Infectious Laryngotracheitis (ILT), though eye drop is often preferred for ILT due to more precise individual dosing. [2,8,9]'
  ));

  c.push(labeled('Choose coarse spray when:', ''));
  c.push(bullet([{ text: 'The target disease requires mucosal respiratory immunity rather than systemic protection.' }]));
  c.push(bullet([{ text: 'Flock size or labor availability makes individual bird handling impractical.' }]));
  c.push(bullet([{ text: 'A rapid prime-boost schedule requires vaccinating large numbers in a short window.' }]));
  c.push(bullet([{ text: 'The vaccine label specifies the coarse spray route.' }]));

  c.push(labeled('Choose eye drop or water vaccination instead when:', ''));
  c.push(bullet([{ text: 'Precision per-bird dosing is required (ILT, high-priority primer doses).' }]));
  c.push(bullet([{ text: 'Water-soluble vaccines are specified by label for the water route.' }]));
  c.push(bullet([{ text: 'Flock health, age, or weather conditions make barn spray impractical.' }]));

  c.push(h2('4.3  Equipment and Spray Settings'));

  c.push(para(
    'The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin specifies the use of a Hardi sprayer for this procedure [6]. That sprayer must be kept exclusively for vaccination. It must never be used for pesticides, herbicides, or disinfectants. Residue contamination of any of those chemicals, even in trace amounts, will damage or destroy the live vaccine.'
  ));

  c.push(labeled('Before vaccination day:', ''));
  c.push(bullet([{ text: 'Rinse the sprayer with clean water.' }]));
  c.push(bullet([{ text: 'Spray at a light source to observe spray particle size and pattern. Large, visible droplets that fall quickly are correct. A fine mist that hangs in the air is not.' }]));
  c.push(bullet([{ text: 'Run a practice pass with water only, one or two days before vaccination. This tells you how much water you need per section and how fast to walk to achieve the correct volume. [6]' }]));

  c.push(para(
    'Maintain constant pressure throughout the vaccination run. The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin specifies 4.5-5.0 Bar (65-73 PSI) [6]. Pressure below that range produces larger, heavier droplets that fall short of the birds. Pressure above that range produces fine mist that misses the target tissue.'
  ));

  c.push(h2('4.4  Diluent, Volume, and Vaccine Preparation'));

  c.push(para(
    'Water quality is not optional for spray vaccination. The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin states to use distilled, demineralized, or deionized water to maximize vaccine quality and viability [6]. Chlorinated tap water, well water, or any water with mineral contamination will degrade a live vaccine before it reaches the birds.'
  ));

  c.push(labeled('Volume targets [6]:', ''));

  const sprayVolTable = (() => {
    const colW = [2800, 2800, 2800];
    const hdrBg = MED_BLUE;
    const altBg = 'EBF2FA';
    const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
    const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
    const hdrCell = (text, i) => new TableCell({
      width: { size: colW[i], type: WidthType.DXA },
      borders: cellBorders,
      shading: { type: ShadingType.SOLID, color: hdrBg },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
      })],
    });
    const dataCell = (text, i, shade) => new TableCell({
      width: { size: colW[i], type: WidthType.DXA },
      borders: cellBorders,
      shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 50 },
        children: [run(text, { size: 18, color: BODY })],
      })],
    });
    const headers = ['Age', 'Volume per 10,000 birds', 'Volume per 1,000 birds'];
    const rows = [
      ['Day 1 (farm spray)', '3 L', '300 mL'],
      ['Older than 7 days', '7-8 L', '700-800 mL'],
    ];
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      rows: [
        new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
        ...rows.map((row, ri) => new TableRow({
          children: row.map((cell, ci) => dataCell(cell, ci, ri % 2 === 1)),
        })),
      ],
    });
  })();
  c.push(sprayVolTable);
  c.push(new Paragraph({ spacing: { before: 80, after: 0 } }));

  c.push(labeled('Vaccine preparation steps [6]:', ''));
  c.push(bullet([{ text: 'Prepare enough doses for each floor section or the whole barn before starting.' }]));
  c.push(bullet([{ text: 'Dissolve the vaccine in the vials first, then add to the measured water.' }]));
  c.push(bullet([{ text: 'Rinse each vial properly after emptying. The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin notes that 15% of the vaccine dose is lost if vials are not rinsed [6]. That is a significant portion of the dose in every run.' }]));
  c.push(bullet([{ text: 'Shake well after mixing.' }]));
  c.push(bullet([{ text: 'Record the serial number and expiry date for every vaccine vial used. This record is essential if a failure investigation is needed later.' }]));

  c.push(para(
    'Cold chain applies here just as it does for water vaccination and wing web vaccination. The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin specifies storage at 2-8°C (35-45°F), transported in a cooler on ice until used, and protected from sunlight at all times [6]. A vaccine that has been warm-stored or sun-exposed will not perform, regardless of correct technique in the barn.'
  ));

  c.push(h2('4.5  Ventilation Management'));

  c.push(para(
    'Ventilation control is the factor most often overlooked in spray vaccination. Fans moving air through the barn during the spray will push droplets away from the birds before they are inhaled, and remove the vaccine cloud from the air space before coverage is complete.'
  ));

  c.push(para(
    'The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin is specific on this point: turn off all fans before starting, and do not turn them back on until 20 minutes after vaccination is complete [6]. That 20-minute window allows the vaccine cloud to settle onto the birds and be absorbed. If ventilation resumes too early, birds in the sections vaccinated last may not have received a full dose.'
  ));

  c.push(labeled('Ventilation rules [6]:', ''));
  c.push(bullet([{ text: 'Turn off all fans before starting the spray run.' }]));
  c.push(bullet([{ text: 'Turn all fans back on 20 minutes after the run is complete.' }]));
  c.push(bullet([{ text: 'In hot summer weather, vaccinate very early in the morning when outside temperatures are coolest. This gives you a safe window to hold ventilation without heat stress.' }]));
  c.push(bullet([{ text: 'Monitor birds and air quality throughout. If heat stress builds before the 20-minute window closes, resume ventilation early rather than risk bird welfare.' }]));

  c.push(h2('4.6  Running the Vaccination'));

  c.push(para(
    'Technique in the barn differs by bird type and housing system. The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin specifies the following procedures [6]:'
  ));

  c.push(labeled('Broilers (floor housing):', ''));
  c.push(bullet([{ text: 'Group birds along the side walls before starting. This concentrates them where the spray will be applied.' }]));
  c.push(bullet([{ text: 'Keep the distance between the vaccinator and the side wall to a maximum of 4 metres (12 feet). Birds beyond that range will not receive adequate coverage. [6]' }]));
  c.push(bullet([{ text: 'Reduce light intensity over the birds. Turn off other lights in the barn if possible. Dim light keeps birds calm and grouped.' }]));
  c.push(bullet([{ text: 'Hold the spray nozzle in a downward direction, 1 metre (3 feet) above the birds\' heads. This is the height that produces the correct droplet size and landing pattern at the recommended pressure. [6]' }]));
  c.push(bullet([{ text: 'Walk slowly and steadily down the barn. Rushing produces uneven coverage.' }]));

  c.push(labeled('Breeder pullets:', ''));
  c.push(bullet([{ text: 'Vaccinate on the feed day. Birds will be concentrated at the feed lines, which improves coverage distribution. [6]' }]));
  c.push(bullet([{ text: 'Dim lights over the feed lines during the spray run.' }]));

  c.push(labeled('Pullets (cage housing):', ''));
  c.push(bullet([{ text: 'Dim barn lights before starting.' }]));
  c.push(bullet([{ text: 'Walk down the barn at a slow, steady pace, spraying directly at the face of the birds in each cage row. [6]' }]));

  c.push(para(
    'No water starvation is required for coarse spray vaccination. Birds do not need to be thirsty to receive the vaccine through the respiratory route. [6]'
  ));

  c.push(...figureOrPlaceholder(
    'fig4_1.png',
    'Figure 4.1: Coarse spray vaccination technique',
    'Figure 4.1: Coarse spray vaccination technique in a commercial broiler barn. Birds grouped along the side wall. Vaccinator walks slowly with the nozzle 1 m (3 ft) above the birds in a downward direction. Maximum 4 m (12 ft) from wall. Fans off during the run and for 20 minutes after. Pressure: 4.5-5.0 Bar (65-73 PSI). Source: CPC Short Courses.',
    6.5
  ));

  c.push(h2('4.7  Biosecurity, PPE, and Safety'));

  c.push(para(
    'Spray vaccination using live Newcastle Disease virus creates a real occupational exposure risk. The CPC Learning Centre Coarse Spray Vaccination Technical Bulletin states clearly: wear gloves, a mask, and safety glasses during preparation and vaccine administration to avoid eye infection (conjunctivitis) following Newcastle virus contact [6]. This is not a formality. Newcastle Disease virus can cause conjunctivitis and mild flu-like symptoms in exposed humans.'
  ));

  c.push(labeled('PPE requirements [6]:', ''));
  c.push(bullet([{ text: 'Gloves during preparation and throughout the spray run.' }]));
  c.push(bullet([{ text: 'Mask to prevent inhalation of the vaccine cloud.' }]));
  c.push(bullet([{ text: 'Safety glasses or a face shield. The spray cloud is concentrated in the barn and contact with the eyes is likely without eye protection.' }]));

  c.push(labeled('After vaccination [6]:', ''));
  c.push(bullet([{ text: 'Rinse the Hardi sprayer thoroughly with distilled water immediately after use.' }]));
  c.push(bullet([{ text: 'Sanitize with "Clean Tabs" or an equivalent approved sanitizer.' }]));
  c.push(bullet([{ text: 'Rinse again with distilled water, then store upside down to dry in a clean location.' }]));
  c.push(bullet([{ text: 'Burn all empty vaccine containers.' }]));

  c.push(callout(
    'The sprayer used for vaccination must never be used for pesticides, herbicides, or disinfectants. Even trace contamination from a previous use will inactivate a live vaccine. Keep a dedicated sprayer for vaccination only and label it clearly. [6]'
  ));

  c.push(h2('4.8  Monitoring and Troubleshooting'));

  c.push(para(
    'Unlike wing web vaccination, where a take is visible at day 7-10, or water vaccination, where you can see birds actively drinking, coarse spray coverage is harder to verify in real time. The key monitoring steps are before and after the run, not during it.'
  ));

  c.push(labeled('Before the run:', ''));
  c.push(bullet([{ text: 'Practice run with water confirms the volume needed and the walking speed required to deliver that volume to each section. Do this 1-2 days ahead of vaccination day. [6]' }]));
  c.push(bullet([{ text: 'Check spray pattern at a light source. Correct droplet size should be visible as falling coarse drops, not a hanging mist.' }]));
  c.push(bullet([{ text: 'Confirm fans are off before starting.' }]));

  c.push(labeled('During and after the run:', ''));
  c.push(bullet([{ text: 'Watch birds as you walk. They should be calm and grouped. Birds scattering or piling may mean light levels are too high or the spray is startling them.' }]));
  c.push(bullet([{ text: 'Confirm the 20-minute ventilation hold is completed before turning fans back on.' }]));
  c.push(bullet([{ text: 'For respiratory vaccines, post-vaccination serology (titer testing at 21 days post-vaccination) is the most reliable way to confirm that coverage was achieved uniformly across the flock.' }]));

  c.push(labeled('Common failures and causes:', ''));
  c.push(bullet([{ text: 'Low titers in post-vaccination serology: check water quality (chlorine contamination), pressure (too high producing fine mist), walking speed (too fast), or vial rinsing (not done). [6]' }]));
  c.push(bullet([{ text: 'Wide spread in serology titers (high CV): indicates uneven coverage. Sections of the barn vaccinated quickly or at the wrong distance from the wall will have lower-titer birds than sections done correctly.' }]));
  c.push(bullet([{ text: 'No immune response in vaccinated birds: cold chain failure or wrong diluent (chlorinated water) are the most common causes. Distilled or deionized water is non-negotiable. [6]' }]));

  c.push(callout(
    'All four vaccination methods in this course depend on the same foundation: a well-timed program designed with veterinary input, vaccines kept cold from factory to barn, and a technique executed consistently on every bird. The best vaccination program in the world fails at any one of those three points.'
  ));

  // ============================================================
  // SECTION 5: IN-OVO VACCINATION (brief overview)
  // ============================================================
  c.push(pageBreak());
  c.push(h1('Section 5: In-Ovo Vaccination'));

  c.push(para(
    'In-ovo vaccination delivers vaccine to the developing embryo inside the egg at approximately 18 days of a 21-day incubation period, before the chick hatches [12,13]. Automated machines at the hatchery pierce the eggshell and deposit a measured vaccine dose into the amniotic fluid. In the 24 to 48 hours before hatch, the embryo swallows the amniotic fluid and absorbs the vaccine. By the time the chick arrives in the barn, it already has immunity primed from before hatch [13].'
  ));

  c.push(para(
    'The main vaccines delivered in-ovo in commercial broiler and breeder programs are Marek\'s Disease (using HVT, bivalent HVT/SB-1, or CVI988/Rispens strains), Infectious Bursal Disease, and in some programs Newcastle Disease [12,13]. For Marek\'s Disease in particular, in-ovo has largely replaced post-hatch subcutaneous injection in high-volume hatcheries: every egg in the setter receives a confirmed dose automatically, with no additional labor per chick. Protection begins before the chick encounters the virus environment at placement, which matters because Marek\'s Disease virus can be present in barn litter from day one [11].'
  ));

  c.push(para(
    'In-ovo vaccination is a hatchery procedure. Equipment setup, egg tray positioning, needle calibration, sanitation between trays, and vaccine refrigeration at the injector station are all managed by hatchery staff, not barn managers. What the barn manager needs to understand is that in-ovo-vaccinated chicks arrive with immunity already primed, and any farm-level booster doses required by the flock program must be timed to complement that primed immunity, not compete with it. Timing conflicts between in-ovo and early farm-level boosters should be resolved with your veterinarian before the vaccination program is set for the season. For a full treatment of in-ovo vaccination equipment, technique, egg handling, and hatchery management protocols, see the Hatchery Management and Incubation Biology course in this series.'
  ));

  // ============================================================
  // RECOMMENDED JOURNALS
  // ============================================================
  c.push(pageBreak());
  c.push(h1('Recommended Peer-Reviewed Journals'));

  c.push(para(
    'The following journals publish current research on poultry vaccination, immunology, and disease control. Canadian poultry producers and farm managers can use these resources to stay current on emerging disease strains and evidence-based vaccination protocols:'
  ));

  c.push(bullet([{ text: 'Avian Diseases:', bold: true }, { text: ' official journal of the American Association of Avian Pathologists; peer-reviewed research on poultry diseases, vaccines, and diagnostics.' }]));
  c.push(bullet([{ text: 'Avian Pathology:', bold: true }, { text: ' published by the Houghton Poultry Research Station; covers vaccine development and field efficacy studies.' }]));
  c.push(bullet([{ text: 'Poultry Science:', bold: true }, { text: ' broad coverage of production, health, and management research including vaccination programs.' }]));
  c.push(bullet([{ text: 'Vaccine:', bold: true }, { text: ' Elsevier; covers the full spectrum of animal and human vaccine research including novel adjuvant and delivery systems.' }]));
  c.push(bullet([{ text: 'Canadian Veterinary Journal:', bold: true }, { text: ' published by the Canadian Veterinary Medical Association; Canada-specific disease and vaccination reports.' }]));

  // ============================================================
  // REFERENCES
  // ============================================================
  c.push(h1('References'));

  const refs = [
    'Canadian Poultry Consultants. Water Vaccination [Technical Bulletin]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Gillingham S. General Principles of Vaccination [Technical Bulletin]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Burns Grogan KA, Fernandez RJ, Rojo Barranon FJ, Garcia Espinosa H. Avian Immune System: A Brief Review [Article]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Canadian Poultry Consultants. Inactivated Vaccine Administration [Technical Bulletin]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Canadian Poultry Consultants. Maternal Antibody Transfer [Technical Bulletin]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Canadian Poultry Consultants. Coarse Spray Vaccination [Technical Bulletin]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Canadian Poultry Consultants. Fowl Pox in the Fraser Valley [Disease Profile]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Canadian Poultry Consultants. Infectious Bronchitis Virus (IBV) [Disease Profile]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Canadian Poultry Consultants. Infectious Laryngotracheitis (ILT) [Disease Profile]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Canadian Poultry Consultants. Infectious Bursal Disease (IBD): Causative Agent, Diagnosis and Prevention [Disease Profile]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Montiel E. Troubleshooting a Marek\'s Disease Outbreak [Technical Bulletin]. CPC Learning Centre; [cited 2026 May]. Available from: cpclearningcentre.ca',
    'Saif YM, Fadly AM, Glisson JR, McDougald LR, Nolan LK, Swayne DE, editors. Diseases of Poultry. 14th ed. Ames, Iowa: Wiley-Blackwell; 2022.',
    'Merck Veterinary Manual. Vaccination of Poultry. Kenilworth, NJ: Merck & Co.; 2023 [cited 2026 May]. Available from: merckvetmanual.com',
  ];

  refs.forEach((ref, i) => {
    c.push(new Paragraph({
      children: [
        new TextRun({ text: `${i + 1}.  `, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' }),
        new TextRun({ text: ref, color: BODY, size: 22, font: 'Calibri' }),
      ],
      spacing: { after: 80, line: 260, lineRule: 'auto' },
      indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.35) },
    }));
  });

  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children:   c,
  };
}

// ============================================================
// ASSEMBLE DOCUMENT
// ============================================================
const doc = new Document({
  styles: {
    paragraphStyles: [
      {
        id: 'Normal',
        name: 'Normal',
        run: { font: 'Calibri', size: 24, color: BODY },
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        run: { bold: true, color: DARK_BLUE, size: 30, font: 'Calibri' },
        paragraph: { spacing: { before: 360, after: 160 } },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        run: { bold: true, color: MED_BLUE, size: 26, font: 'Calibri' },
        paragraph: { spacing: { before: 280, after: 120 } },
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
            style: {
              paragraph: {
                indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) },
              },
            },
          },
          {
            level: 1,
            format: 'bullet',
            text: '○',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: convertInchesToTwip(0.65), hanging: convertInchesToTwip(0.25) },
              },
            },
          },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [
          {
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) },
              },
            },
          },
        ],
      },
    ],
  },
  sections: [
    buildCoverSection(),
    buildTocSection(),
    buildContentSection(),
  ],
});

// ============================================================
// WRITE INITIAL FILE
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const rawBuf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, rawBuf);
console.log('Initial file written:', OUT_FILE, '—', (rawBuf.length / 1024).toFixed(1), 'KB');

// ============================================================
// POST-BUILD PATCH: suppress Word "fields may refer to other files" dialog
// ============================================================
const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

// 1. Build cached TOC rows with clickable hyperlinks
function tocRow(e) {
  const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
  const indent    = e.lvl === 1 ? 0 : 220;
  const text      = escapeXml(e.text);
  return (
    '<w:p><w:pPr>' +
      `<w:pStyle w:val="${styleName}"/>` +
      '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>' +
      '<w:spacing w:after="60"/>' +
      (indent ? `<w:ind w:left="${indent}"/>` : '') +
    '</w:pPr>' +
    `<w:hyperlink w:anchor="${e.anchor}" w:history="1">` +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>` +
      '<w:r><w:tab/></w:r>' +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="22"/></w:rPr><w:t>${e.page}</w:t></w:r>` +
    '</w:hyperlink></w:p>'
  );
}
const cachedRows = entriesWithAnchor.map(tocRow).join('');

// 2. Patch document.xml
let docXml = await outZip.file('word/document.xml').async('string');
const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  sdt = sdt.replace(/\sw:dirty="true"/g, '');
  sdt = sdt.replace(
    /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
    `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`
  );
  docXml = docXml.replace(sdtMatch[0], sdt);
}
docXml = docXml.replace(/\sw:dirty="true"/g, '');

// 3. Inject bookmarks around headings
let entryIdx = 0;
let bookmarkId = 2000;
const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
docXml = docXml.replace(headingRegex, (match, lvlStr) => {
  if (entryIdx >= entriesWithAnchor.length) return match;
  const lvl = Number(lvlStr);
  const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
  const heading = textRuns.trim();
  const entry = entriesWithAnchor[entryIdx];
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  if (lvl !== entry.lvl) return match;
  if (norm(heading) !== norm(entry.text)) return match;
  entryIdx++;
  const id = bookmarkId++;
  return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
});
if (entryIdx !== entriesWithAnchor.length) {
  console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} headings`);
}

outZip.file('word/document.xml', docXml);

// 4. Patch settings.xml
let settings = await outZip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
settings = settings.replace(
  '<w:displayBackgroundShape/>',
  '<w:displayBackgroundShape/><w:updateFields w:val="false"/>'
);
if (!settings.includes('<w:updateFields')) {
  settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
}
outZip.file('word/settings.xml', settings);

// 5. Add TOC1 / TOC2 styles
let stylesXml = await outZip.file('word/styles.xml').async('string');
if (!/w:styleId="TOC1"/.test(stylesXml)) {
  const tocStyles =
    '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
  stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
  outZip.file('word/styles.xml', stylesXml);
}

// 6. Verify no dirty flags remain
const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
if (dirtyLeft > 0) {
  console.error(`ERROR: ${dirtyLeft} w:dirty flags still in document.xml — Word dialog will appear`);
} else {
  console.log('Dirty flag check: PASS (0 w:dirty flags)');
}

// 7. Spelling sweep — check for British forms
const britishPatterns = [/\bcolour/gi, /\bbehaviour/gi, /\bcentre\b/gi, /\bdefenc/gi, /\bneighbour/gi, /\bgrey\b/gi, /\bmould\b/gi, /\bsulph/gi, /\bfaec/gi, /\boedem/gi, /\bdiarrhoea/gi, /\bhaemo/gi, /\borganis/gi, /\brecognis/gi, /\banalyse/gi];
// Strip "Learning Centre" (CPC Learning Centre is the org's proper name — not a British-spelling error)
const allText = docXml.replace(/<[^>]+>/g, ' ').replace(/learning centre/gi, 'learning center');
const britishHits = britishPatterns.filter(p => p.test(allText));
if (britishHits.length > 0) {
  console.warn('British spelling check: FAIL — found patterns:', britishHits.map(p => p.toString()));
} else {
  console.log('British spelling check: PASS');
}

// 8. Em dash check
const emDashCount = (docXml.match(/—/g) || []).length;
if (emDashCount > 0) {
  console.warn(`Em dash check: FAIL — ${emDashCount} em dashes found in document.xml`);
} else {
  console.log('Em dash check: PASS');
}

// 9. Write final patched file
const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log('\nFinal patched file written:', OUT_FILE);
console.log('Final size:', (patched.length / 1024).toFixed(1), 'KB');
console.log('\nBuild complete. Open', OUT_FILE, 'in Word.');
