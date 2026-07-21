import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer,
  PageNumber, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  convertInchesToTwip, HeadingLevel, TableOfContents, ImageRun, LevelFormat,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 15');
const OUT_FILE  = path.join(OUT_DIR, 'Serology_101.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

// ============================================================
// COLORS
// ============================================================
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

// ============================================================
// HELPERS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({
    text,
    bold:      opts.bold      || false,
    italics:   opts.italics   || false,
    color:     opts.color     || BODY_GRAY,
    size:      opts.size      || 24,
    font:      'Calibri',
    subScript: opts.subScript || false,
    superScript: opts.superScript || false,
  });
}

function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({
        text:    seg.text,
        bold:    seg.bold    || false,
        italics: seg.italics || false,
        color:   seg.color   || BODY_GRAY,
        size:    seg.size    || 24,
        font:    'Calibri',
      }))
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
    ? text.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY_GRAY, size: 24, font: 'Calibri' }))
    : [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}

function numbered(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })],
    numbering: { reference: 'numbered-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}

function numberedRef(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })],
    numbering: { reference: 'references-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Image embed. PNG by default; pass type 'jpg' for JPEG. Auto-detects dimensions for aspect ratio.
function image(buf, caption, widthIn = 5.8, type = 'png') {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.6);
  const isJpg = (type === 'jpg' || type === 'jpeg');
  try {
    if (isJpg) {
      let i = 2, w = 0, h = 0;
      while (i < buf.length) {
        if (buf[i] !== 0xFF) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) { h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); break; }
        i += 2 + buf.readUInt16BE(i + 2);
      }
      if (w > 0 && h > 0) hpx = Math.round(wpx * h / w);
    } else {
      const view = new DataView(buf.buffer, buf.byteOffset);
      const pw = view.getUint32(16, false);
      const ph = view.getUint32(20, false);
      if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
    }
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: isJpg ? 'jpg' : 'png' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 160, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 60, after: 240 },
    }),
  ];
}

// Callout box (blue-tinted table cell with title + lines)
function callout(title, lines) {
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: MED_BLUE };
  const rows = [
    new TableRow({
      children: [new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
            spacing: { before: 60, after: 80 },
          }),
          ...lines.map(l => new Paragraph({
            children: [new TextRun({ text: l, color: BODY_GRAY, size: 22, font: 'Calibri' })],
            spacing: { before: 0, after: 60 },
            indent: { left: convertInchesToTwip(0.15) },
          })),
        ],
        shading: { type: ShadingType.SOLID, color: 'EAF1FB' },
        borders: { top: bdr, bottom: bdr, left: bdr, right: bdr },
        margins: { top: convertInchesToTwip(0.12), bottom: convertInchesToTwip(0.12), left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
      })],
    }),
  ];
  return [
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
    new Paragraph({ spacing: { before: 0, after: 160 } }),
  ];
}

// Small data table (header row + zebra-striped data rows). colW must sum to 8640.
function dataTable(headers, rows, colW) {
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hdrCell = (text, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: MED_BLUE },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
    })],
  });

  const dataCell = (text, i, shade) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: shade ? 'EBF2FA' : 'FFFFFF' },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18, color: BODY_GRAY })],
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
          new TextRun({ text: 'Serology 101', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 15  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
// COVER SECTION
// ============================================================
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 15: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 },
    }),
    ...(logoBuffer ? [
      new Paragraph({
        children: [new ImageRun({ data: logoBuffer, transformation: { width: 150, height: 150 }, type: 'png' })],
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 },
      }),
    ] : [
      new Paragraph({
        children: [new TextRun({ text: '[CPC Logo]', bold: true, color: MED_BLUE, size: 28, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 },
      }),
    ]),
    new Paragraph({
      children: [new TextRun({ text: 'Serology 101', bold: true, color: MED_BLUE, size: 52, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Reading Titers, Drawing Blood, and Making Sense of Lab Results', italics: true, color: MED_BLUE, size: 26, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 480 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '___________________________________', color: GOLD, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Duration: 2-Hour Lecture + 1-Hour Workshop', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'July 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 480 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'This course is produced by the CPC Learning Centre for educational purposes. Content is intended for trained poultry industry professionals. It does not replace the advice of a licensed veterinarian, integrator management manuals, or regulatory requirements. Always follow current CFIA, NFACC, and integrator-specific protocols.',
        color: '888888', size: 18, font: 'Calibri', italics: true,
      })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
      indent: { left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
    }),
  ];
  return {
    properties: { page: { margin: pageMargin }, titlePage: true },
    headers:  { default: buildHeader() },
    footers:  { default: buildFooter() },
    children,
  };
}

// ============================================================
// TOC SECTION
// ============================================================
function buildTOCSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:  { default: buildHeader() },
    footers:  { default: buildFooter() },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'Table of Contents', bold: true, color: MED_BLUE, size: 32, font: 'Calibri' })],
        spacing: { before: 0, after: 240 },
      }),
      new TableOfContents('Table of Contents', {
        hyperlink: true,
        headingStyleRange: '1-2',
        stylesWithLevels: [{ styleName: 'Heading 1', level: 1 }, { styleName: 'Heading 2', level: 2 }],
      }),
      pageBreak(),
    ],
  };
}

// ============================================================
// BODY SECTION
// ============================================================
function buildBodySection() {
  const children = [

    // ── INTRODUCTION ─────────────────────────────────────────
    h1('Introduction'),

    para('A blood sample can tell you things a barn walk cannot. Serology, testing the antibody levels in your birds\' blood, shows you how well your flock responded to vaccination and whether it has been exposed to disease out in the field.'),

    para('This course walks through how those blood tests work, what the results actually mean, and how to use them to make real decisions on your farm: whether your vaccination program is working, whether a disease has moved through your flock without you seeing it, and when a result is telling you something versus when it is just noise.'),

    h2('Learning Objectives'),
    numbered('Explain what antibodies are and what a titer result on a lab report actually represents.'),
    numbered('Read a serology report against the flock\'s vaccination history and health background, not just as numbers on a page.'),
    numbered('Describe what serology can and cannot tell you about flock health, so you don\'t read too much into a result or miss what it\'s telling you.'),
    numbered('Draw a blood sample from a bird confidently and safely.'),
    numbered('Prepare and handle blood samples so the serum that reaches the lab is good enough to test.'),
    numbered('Fill out a lab submission form correctly, requesting the right tests for the question being asked.'),

    para('The hands-on portion of this session is where it all comes together. You will practice drawing a blood sample, handling and labeling serum, and filling out a lab submission form, the same steps your flock\'s blood goes through before it ever reaches the lab.'),

    // ── SECTION 1 ─────────────────────────────────────────────
    h1('Section 1: The Role of Antibodies in Immunity'),

    h2('1.1  Innate vs. Acquired Immunity'),

    para('Every bird hatches with two layers of defense against disease. The first layer is innate immunity: skin, mucus, body temperature, and general-purpose immune cells that react the same way no matter what they run into. It works fast, but it does not get any better with repeat exposure.'),

    para('The second layer is acquired immunity, and this is the layer that learns. When a bird is exposed to a specific disease agent, whether through vaccination or a field infection, its immune system builds antibodies aimed at that exact target. Antibodies are proteins made by a type of white blood cell called a B-lymphocyte, and each one is built to match a specific invader [1].'),

    ...image(figBuf('fig15_1.png'), 'Figure 1.1: Innate immunity reacts to everything the same way. Acquired immunity learns and remembers. Source: CPC Short Courses.'),

    para('Picture an infectious bronchitis virus trying to attach to the cells lining a bird\'s trachea. That attachment is the first step of infection. If the virus arrives coated in antibodies the bird already made against it, it cannot attach, and the infection never gets started. The CPC Learning Centre Serology 101 presentation uses this exact example to explain why antibody levels matter [1].'),

    para('Chicks also start life with a head start: passive immunity, antibodies passed from the hen into the egg yolk. These maternal antibodies give the chick some early protection, then fade away over the first few weeks as the chick starts building its own response. Serology testing measures this whole picture, maternal antibodies, vaccine response, and field exposure, all as antibody titers in the blood [1].'),

    h2('1.2  How Antibody Levels Build After Vaccination or Infection'),

    para('The first time a bird meets a disease agent, whether that is its first vaccine dose or its first brush with field disease, the response is called the primary response. Antibody production starts slowly, the levels reached are modest, and they do not last long on their own. But the immune system does not forget: it sets aside memory cells tuned to that specific target [1,2].'),

    ...image(figBuf('fig15_2.png'), 'Figure 1.2: Memory cells from the first exposure drive a faster, bigger response the second time. Source: CPC Short Courses.'),

    para('The second time the bird meets the same agent, those memory cells are already standing by. Antibody production ramps up faster and climbs much higher than it did the first time. This is the secondary response, and it is the reason a booster vaccination produces a stronger result than the first dose, and why a flock that has already been vaccinated and then runs into field disease often shows a sharp jump in titer [1,2].'),

    para('Live and killed vaccines feed into this picture differently. A live vaccine, even though it is a weakened strain, gives the immune system something close to a real infection to respond to, so the antibody response tends to be stronger. A killed vaccine produces a milder response on its own, which is why killed vaccines are usually given as a booster after a live prime, building on memory cells the live vaccine already created [1].'),

    para('For more on building a vaccination program around this first dose, then booster pattern, see Course 8 (Vaccination) in this series.'),

    // ── SECTION 2 ─────────────────────────────────────────────
    h1('Section 2: Serologic Tests'),

    h2('2.1  Reading a Lab Report: What Serology Measures'),

    para('When the lab finishes running your flock\'s blood samples, the report comes back with a titer number for each disease tested. The titer is a measure of how much antibody that bird\'s serum contains against that specific pathogen. On its own, a titer number does not tell you much. The CPC Learning Centre Serology 101 presentation is clear that results only make sense alongside everything else going on in the flock: vaccination history, production numbers, condemnations at the plant, clinical signs, and necropsy findings [1].'),

    para('Three lab methods show up most often on a poultry serology report: ELISA, AGID and plate agglutination, and hemagglutination inhibition (HI). Each one answers the same basic question, how much antibody is in this sample, but they get there differently, and each has its own strengths.'),

    h2('2.2  ELISA Testing'),

    para('ELISA stands for enzyme-linked immunosorbent assay, and it is the workhorse test for poultry serology. A test plate is coated with the antigen for the disease being tested. When diluted serum is added, any matching antibodies in the sample latch onto that antigen. A reagent is added that turns shades of blue depending on how much antibody is bound, and a plate reader converts that color into a titer number for every well [1].'),

    para('The biggest advantage of ELISA is speed. The test is fully automated, and a single lab can run hundreds, even thousands, of serum samples in a day. That is why ELISA is the default test for routine flock monitoring of infectious bronchitis, infectious bursal disease, and avian reovirus [3].'),

    para('ELISA does have one real limitation worth remembering: it tells you how much antibody is there, but not which strain triggered it. If your flock\'s infectious bronchitis titers come back higher than expected, ELISA cannot tell you which strain of the virus is behind it, only that the birds have responded to something [3].'),

    h2('2.3  AGID and Plate Agglutination'),

    para('Agar gel immunodiffusion, or AGID, works on a completely different principle than ELISA. Where ELISA reads antibody as an enzyme-linked color change, AGID is a gel-based precipitation test you read by eye. A small plate of gel is cut with a pattern of seven wells: one in the center and six arranged around it. The center well is filled with antigen, and serum samples go in the wells around it, including at least one known positive and one known negative control. Both the antigen and any antibodies in the serum spread out through the gel toward each other.'),

    para('If the serum contains antibodies that match the antigen, a visible line forms in the gel where the two meet. When that line connects smoothly with the line from a known positive control, it is called a line of identity, and that is a positive result. If the lines stay separate, or bend away from each other instead of joining, the result is negative. A clear positive line usually shows up within 24 hours, though weak positives can take up to 48 hours to appear [4].'),

    ...image(figBuf('fig15_3.png'), 'Figure 2.1: How an AGID result forms. Antigen and antibody diffuse through the gel and form a visible precipitin line where they meet. On the plate, a test line that fuses smoothly with the positive control line is a line of identity (positive); where no line forms, the result is negative. Source: CPC Short Courses.'),

    para('Plate agglutination is a third method. A drop of antigen is mixed directly with a drop of blood or serum on a plate, and if antibodies are present, the mixture clumps visibly within minutes [1].'),

    h2('2.4  Hemagglutination Inhibition (HI) Testing'),

    para('Hemagglutination inhibition, or HI, is built around a quirk of certain viruses. Newcastle disease virus has a surface protein, hemagglutinin-neuraminidase (HN), that makes red blood cells stick together, or agglutinate, when mixed in a test tube. If a bird\'s serum contains antibodies against Newcastle disease virus, those antibodies bind to the HN protein and block it from clumping the red blood cells. That blocking is the "inhibition" in hemagglutination inhibition [5].'),

    para('To run the test, the lab makes a series of doubling dilutions of the serum, then adds a fixed amount of virus and red blood cells to each one. The titer is read as the highest dilution that still completely blocks the clumping. Because each step is a doubling dilution, titers are reported on what is called a log2 scale, the same doubling scale used for AGID titers [5]. Section 6.1 walks through how to read that scale on a lab report.'),

    // ── SECTION 3 ─────────────────────────────────────────────
    h1('Section 3: The Limitations of Serology'),

    h2('3.1  What Serology Can and Cannot Tell You'),

    para('A titer number tells you that a bird\'s immune system has been exposed to something, vaccine or field strain, and made antibodies against it. It does not tell you everything else you might want to know, and treating it as the whole picture is where serology gets misread.'),

    bullet('Serology only shows part of the picture: the antibody (humoral) response. It says nothing about a bird\'s T-cell (cell-mediated) immune response, which also plays a role in disease protection and does not show up on any titer report [6].'),
    bullet('Seroconversion takes time. After exposure, it usually takes 4 to 20 days before antibody levels rise enough to show up on a test [1].'),
    bullet('A single sample is a snapshot, not a trend. One titer reading cannot tell you whether antibody levels are rising, holding steady, or already falling [1].'),
    bullet('Serology cannot reliably tell field strain from vaccine strain. ELISA is a quantitative test, it measures how much antibody, not which exact strain triggered it [3].'),
    bullet('Cross-reactions happen. Antibodies raised against one strain, or even one related pathogen, can sometimes register on a test built for a different one [1].'),
    bullet('Test error is real. Lab equipment, reagent batches, and sample quality all add some noise to every result [1].'),

    para('This is also why a single titer number means very little without something to compare it to. A titer of 2,000 against avian reovirus might be routine for one flock and a red flag for another, depending on what that flock\'s vaccination program and history normally produce [1,3]. Build your own baseline from your own flocks over time, and compare new results against that baseline first.'),

    h2('3.2  Paired Samples: Confirming a Field Challenge'),

    para('When you suspect a flock has been hit by field disease, a single blood draw will not confirm it. What confirms it is a rise in titer between two samples taken from the same birds, a few weeks apart. This is called paired sampling, and it is the most reliable way serology can support a disease diagnosis.'),

    para('The first sample, sometimes called the acute sample, should be drawn as soon as you notice clinical signs. The second sample is drawn from the same birds 3 to 5 weeks later [7]. If the flock was actually challenged by that pathogen, a clear rise in titer between the two samples points to recent exposure to that disease [7].'),

    para('One practical tip: freeze the first sample instead of sending it right away, then run both samples together when the second one is collected. Testing them side by side in the same batch removes a lot of the lab-to-lab and reagent-batch variation that can otherwise muddy the comparison [7].'),

    para('The same paired approach works for checking how well a killed vaccine is taking. Titer response from a killed vaccine peaks 3 to 5 weeks after the shot, so a sample taken before vaccination and a second one 3 to 5 weeks after gives you a before and after picture of how the flock responded [7].'),

    para('If a paired-sample result points to a specific pathogen, see Course 7 (Common Poultry Diseases) in this series for the clinical signs and lesions that go with it.'),

    // ── SECTION 4 ─────────────────────────────────────────────
    h1('Section 4: Poultry Blood Sampling Techniques'),

    h2('4.1  Equipment, Site Selection, and How Many Birds to Sample'),

    para('Good serology starts before the needle ever goes into a bird. For routine monitoring, pick normal, healthy birds, not culls or birds that look sick. A sick bird\'s titer does not represent the flock. If you are working up a suspected disease problem, it is the opposite: sample the birds that are actually showing signs [7].'),

    para('For routine flock profiling, collect serum from 10 to 20 birds, with 20 the better target and 10 the minimum that still gives a usable estimate of the flock\'s antibody status [7]. The CPC Learning Centre Serology 101 presentation makes the same point from the lab\'s side: you\'re using a small sample to stand in for the whole flock, so it has to be big enough for the result to mean something. Pooling several birds\' blood into one sample makes it harder for the test to catch a positive [1].'),

    para('Use a disposable, sterile syringe, 3 cc or 5 cc depending on how much blood you need. Swap in a fresh needle every 5 to 10 birds, and always change all your equipment between flocks so you are not carrying disease from one barn to the next. A dull needle tears tissue instead of slipping into the vein, which makes the draw harder on you and the bird [7]. Needle size depends on where you are drawing from:'),

    dataTable(
      ['Site', 'Needle Length', 'Needle Gauge'],
      [
        ['Wing vein', '0.5–1.0 inch (1.25–2.54 cm)', '20–22 gauge'],
        ['Cardiac puncture', '1.5 inch (3.81 cm)', '18–20 gauge'],
      ],
      [2880, 2880, 2880]
    ),
    new Paragraph({ spacing: { before: 80, after: 0 } }),

    para('Two sites cover almost every situation on a commercial farm. The wing (brachial) vein is the everyday choice for birds 4 weeks and older. In younger birds, this vein is too small to get a usable sample. Cardiac puncture, drawing blood directly from the heart, gives a larger, cleaner sample, but only trained personnel should do it: poor technique can cause fatal bleeding [7]. The wing vein is the technique covered in the workshop.'),

    h2('4.2  Drawing Blood from the Wing Vein'),

    para('The wing vein draw is a one-person job once you get the hang of it. Hold the bird by both legs, then tuck its legs under your non-dominant elbow so both your hands are free to work with the wing [7].'),

    ...image(figBuf('blood collection\'.jpg'), 'Photo 4.1: Wing (brachial) vein blood collection in a chicken, shown from three angles. The arrow (top left) marks the brachial vein on the inside of the wing; the other two panels show the needle drawing blood into the syringe. Source: Norecopa (norecopa.no); Kelly & Alworth, Lab Anim 2013;42:359-361; foodagribusiness.world.', 5.8, 'jpg'),

    bullet([{ text: 'Step 1: ', bold: true }, { text: 'Pull back a few feathers on the underside of the wing so you can see the brachial vein running along the inside of the wing [7].' }]),
    bullet([{ text: 'Step 2: ', bold: true }, { text: 'Line the needle up with the vein, bevel facing up, with the tip pointed toward the wing tip [7].' }]),
    bullet([{ text: 'Step 3: ', bold: true }, { text: 'Insert the needle under the skin first, then into the vein, about midway between the elbow and shoulder joints [7].' }]),
    bullet([{ text: 'Step 4: ', bold: true }, { text: 'Pull back gently on the plunger. If the needle is in the vein, blood flows in with very little pull. Pulling too hard creates negative pressure that collapses the vein and stops the flow [7].' }]),
    bullet([{ text: 'Step 5: ', bold: true }, { text: 'If a hematoma, a swelling under the skin from leaking blood, starts to form before you have collected enough, stop. Once a hematoma forms, the vein is impossible to see and the draw is over for that side. Try the opposite wing instead [7].' }]),
    bullet([{ text: 'Step 6: ', bold: true }, { text: 'When you are done, remove the needle and press a finger gently over the site for a few seconds to help it clot [7].' }]),

    para('If blood does not flow into the syringe, there are three usual reasons: the needle missed the vein, the needle is plugged with a clot, or a hematoma is already forming. Discard used needles straight into a sharps container. Never recap a used needle [7].'),

    // ── SECTION 5 ─────────────────────────────────────────────
    h1('Section 5: Sample Handling and Lab Submission'),

    h2('5.1  Clotting and Separating Serum'),

    para('Once blood is in the syringe, remove the needle before pushing the blood into the clot tube. Forcing blood back through the needle ruptures red blood cells, a problem called hemolysis, and a hemolyzed sample is a poor sample [7].'),

    para('Let the blood run gently down the inside wall of the tube, and keep the tube nearly flat while the clot forms. A flat tube gives the clot more surface area, and more surface area means more serum separates out. A tube left standing upright produces only a small amount of serum [7].'),

    para('Clotting works best at 80 to 100°F (27 to 38°C), and at that range, serum separates from the clot in about 12 to 18 hours. Cooler temperatures slow the process down and give you less serum. Do not shake the tubes, do not freeze them while the clot is forming, and do not leave them in a hot truck or in direct sun. All of these damage the sample [7].'),

    para('Once the clot has fully formed, separate the serum by pouring it off or gently teasing the clot away from the side of the tube with a wooden stick. A good serum sample looks clear to pale yellow, like the tube on the right below [7].'),

    ...image(figBuf('photo5_1_serum_tubes.png'), 'Photo 5.1: Blood collection tubes after clotting and centrifugation. The Serum tube (right) shows clear, pale serum separated from the clotted red cell layer below, the appearance you\'re looking for in a good sample. Source: Wikimedia Commons (CC BY-SA), Uwe Gille.', 4.0),

    h2('5.2  What the Lab Needs From You'),

    para('Not every sample that makes it to the lab is worth testing. A sample is the wrong sample if any of these problems show up [7]:'),

    ...callout('Do NOT send serum samples to the lab that:', [
      'Contain less than 0.25 mL of serum',
      'Are excessively hemolyzed (red)',
      'Are excessively lipemic (fatty, cloudy from a recent meal)',
      'Contain clots',
      'Are gelled, slimy, or contain cheese-like particles',
    ]),

    para('Each of these has a cause you can usually trace back. Hemolyzed (red) samples come from rough handling, forcing blood through a needle, or shaking the tube. Lipemic (cloudy, fatty) samples often come from birds sampled too soon after eating. Gelled samples usually come from dehydrated birds, common in hot weather or under stress. Slimy serum with cheese-like particles is a different problem: the sample sat too warm for too long and bacteria or mold moved in. Those bugs feed on the antibodies in the serum, so by the time it looks like that, the titer result is no longer trustworthy [7].'),

    para('Once a serum sample passes the visual check, keep it cool, 45°F (7°C), and get it to the lab quickly. If it will not arrive within 3 to 5 days, freeze it instead, between +14°F and -40°F (-10°C and -40°C). Cap each tube tightly, group samples by flock in a sealed bag, and label every tube clearly. Avoid shipping on Thursdays or Fridays. A package that sits in a courier depot over the weekend arrives at the lab in worse shape than one mailed earlier in the week [7].'),

    para('Labeling matters as much as the sample itself. The CPC Learning Centre Serology 101 presentation lays out a typical lab code: a flock number, a letter for first or second bleeding (A or B), a code for the type of bird (BB for broiler breeder, for example), the flock\'s age in weeks, a submitter code, an owner code, and the test being requested, something like "123 A BB 18 X 345, IBD-XR" [1].'),

    para('Write down everything the lab needs to put your numbers in context: flock ID and location, age, date of collection, the full vaccination program, and any health or production history worth flagging [7]. The BioChek lab manual makes the same point from its side: label every sample with company ID, flock ID, age, and bird type before it goes in for testing, or there is nothing to compare the titer against [8].'),

    // ── SECTION 6 ─────────────────────────────────────────────
    h1('Section 6: Interpreting Serologic Results'),

    h2('6.1  Reading the Titer Scale'),

    para('Titer numbers on a lab report are not just any numbers, they follow a doubling pattern: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, and so on. Each step up is twice the antibody level of the step before it. A titer of 32 means twice the antibody of a titer of 16, and so on up the scale [1].'),

    ...image(figBuf('fig15_4.png'), 'Figure 6.1: Reading the doubling-dilution scale used for HI and AGID titer reports. Source: CPC Short Courses.'),

    para('Because the steps double, labs often report the same number as a log2 value instead, just counting the number of doubling steps from 1. A titer of 1024 and a log2 titer of 10 are the same result written two different ways. Either way the report shows it, what you are looking for is the same thing: where does this flock sit on the ladder, and is that where you would expect it to be [1]?'),

    para('The lab report will also give you a mean titer for the flock, the average of all the individual titers from the birds you sampled. A mean titer on its own only means something next to what you would expect from your vaccination program at that age. That is why building your own baseline from your own flocks, as Section 3.1 covers, matters more than any single number on a single report [1].'),

    h2('6.2  Flock Uniformity: %CV'),

    para('The mean titer tells you how strong the response was on average. The %CV, short for coefficient of variation, tells you how even that response was across the flock. The lab gets that number by taking the standard deviation of the titers, dividing it by the mean, and multiplying by 100 [3].'),

    para('A low %CV means the birds you sampled were all sitting close to the same titer, a sign of a uniform vaccination response or a recent shared field exposure. A high %CV means some birds responded strongly and others barely responded at all, even though the mean might look fine [3,8].'),

    ...image(figBuf('fig15_5.png'), 'Figure 6.2: A low %CV means the whole flock responded about the same way. Source: CPC Short Courses.'),

    para('Current guidance from the BioChek lab manual gives the following %CV ranges [8]:'),

    dataTable(
      ['%CV', 'Flock Uniformity'],
      [
        ['< 40%', 'Excellent'],
        ['40–60%', 'Good'],
        ['> 60%', 'Need to Improve'],
      ],
      [4320, 4320]
    ),
    new Paragraph({ spacing: { before: 80, after: 0 } }),

    para('These ranges apply to inactivated (killed) vaccines. Live vaccines naturally produce more spread between birds, so a %CV under 60% is the realistic target after a live vaccination. With live priming, whether every bird tested positive at all matters more than the %CV number, since a live vaccine that did not reach every bird is a coverage problem the %CV alone will not show you [8].'),

    // ── RECOMMENDED JOURNALS ─────────────────────────────────
    pageBreak(),
    h1('Recommended Journals and Resources'),

    para('The following journals and publications are useful for staying current on poultry diagnostics, immunology, and serology interpretation:'),

    bullet('Avian Diseases: peer-reviewed journal of the American Association of Avian Pathologists, covering poultry pathology, diagnostics, and disease management'),
    bullet('Journal of Veterinary Science: peer-reviewed journal publishing diagnostic immunology research, including hemagglutination inhibition test development'),
    bullet('Poultry Science: peer-reviewed journal covering broiler, layer, and breeder management, nutrition, health, and welfare (poultryscience.org)'),
    bullet('Canadian Poultry Magazine: industry publication covering Canadian commercial poultry news, management practices, and policy (canadianpoultrymag.com)'),
    bullet('CFIA Animal Health Notices: subscribe for alerts on reportable diseases, including avian influenza (inspection.canada.ca)'),

    new Paragraph({ spacing: { before: 0, after: 240 } }),

    // ── REFERENCES ─────────────────────────────────────────────
    pageBreak(),
    h1('References'),

    numberedRef('CPC Learning Centre. Bowes V. Serology 101: Or How To Interpret Those Funny-Looking Graphs [Technical Bulletin]. Animal Health Centre, Abbotsford, BC; 2003. Available from: cpclearningcentre.ca'),
    numberedRef('Merck Veterinary Manual. Administration of Vaccines in Animals. Kenilworth, NJ: Merck & Co.; 2023 [cited 2026 Jun]. Available from: merckvetmanual.com/pharmacology/vaccines-and-immunotherapy/administration-of-vaccines-in-animals'),
    numberedRef('Zavala G. Serology Interpretation, Real Science, Real Results: The Ten Principles to Interpret and Monitor with Confidence. IDEXX Laboratories; 2017. Available from: idexx.com/files/poultry_baselines_ten-principles-serology-interpretation.pdf'),
    numberedRef('United States Department of Agriculture, Animal and Plant Health Inspection Service, National Veterinary Services Laboratories. Agar Gel Immunodiffusion Test to Detect Antibodies to Type A Influenza Virus [SOP NVSL-SOP-0045.03]. Ames, IA: National Veterinary Services Laboratories; 2021 [cited 2026 Jun]. Available from: aphis.usda.gov/sites/default/files/Avian_AGID_SOP.pdf'),
    numberedRef('Choi KS, Kye SJ, Jeon WJ, Park MJ, Kim S, Seul HJ, Kwon JH. Preparation and diagnostic utility of a hemagglutination inhibition test antigen derived from the baculovirus-expressed hemagglutinin-neuraminidase protein gene of Newcastle disease virus. J Vet Sci. 2013;14(3):291-297. doi:10.4142/jvs.2013.14.3.291'),
    numberedRef('Erf GF, Kong HR, Falcon DM, Byrne KA. Two-Window Approach to Monitor and Assess Cellular and Humoral Immune Responses in Poultry. Poultry. 2023;2(1):82-97. doi:10.3390/poultry2010009'),
    numberedRef('Hy-Line International. Proper Collection and Handling of Diagnostic Samples: Part One, Serology and Blood Collection [Technical Update]. Hy-Line International; 2016. Available from: hyline.com'),
    numberedRef('BioChek. Interpretation and Application of Results Manual. Reeuwijk, Netherlands: BioChek; 2017. Available from: biochek.com'),

  ]; // end children

  return {
    properties: { page: { margin: pageMargin } },
    headers:  { default: buildHeader() },
    footers:  { default: buildFooter() },
    children,
  };
}

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.7), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.3) } } } }],
      },
      {
        reference: 'references-list',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) } } } }],
      },
    ],
  },
  styles: {
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { bold: true, color: MED_BLUE, size: 28, font: 'Calibri' },
        paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } } },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { bold: true, color: DARK_BLUE, size: 24, font: 'Calibri' },
        paragraph: { spacing: { before: 280, after: 120 } },
      },
    ],
  },
  sections: [
    buildCoverSection(),
    buildTOCSection(),
    buildBodySection(),
  ],
});

// Write initial file
fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));
console.log('Initial docx written to', OUT_FILE);

// ============================================================
// POST-BUILD PATCH: kill the "fields may refer to other files" dialog
// ============================================================
const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

// TOC entries (text must match heading text exactly, including section numbers and spacing)
const tocEntries = [
  { lvl: 1, text: 'Introduction', page: 2 },
  { lvl: 1, text: 'Section 1: The Role of Antibodies in Immunity', page: 3 },
  { lvl: 2, text: '1.1  Innate vs. Acquired Immunity', page: 3 },
  { lvl: 2, text: '1.2  How Antibody Levels Build After Vaccination or Infection', page: 4 },
  { lvl: 1, text: 'Section 2: Serologic Tests', page: 5 },
  { lvl: 2, text: '2.1  Reading a Lab Report: What Serology Measures', page: 5 },
  { lvl: 2, text: '2.2  ELISA Testing', page: 6 },
  { lvl: 2, text: '2.3  AGID and Plate Agglutination', page: 7 },
  { lvl: 2, text: '2.4  Hemagglutination Inhibition (HI) Testing', page: 8 },
  { lvl: 1, text: 'Section 3: The Limitations of Serology', page: 9 },
  { lvl: 2, text: '3.1  What Serology Can and Cannot Tell You', page: 9 },
  { lvl: 2, text: '3.2  Paired Samples: Confirming a Field Challenge', page: 10 },
  { lvl: 1, text: 'Section 4: Poultry Blood Sampling Techniques', page: 11 },
  { lvl: 2, text: '4.1  Equipment, Site Selection, and How Many Birds to Sample', page: 11 },
  { lvl: 2, text: '4.2  Drawing Blood from the Wing Vein', page: 12 },
  { lvl: 1, text: 'Section 5: Sample Handling and Lab Submission', page: 13 },
  { lvl: 2, text: '5.1  Clotting and Separating Serum', page: 13 },
  { lvl: 2, text: '5.2  What the Lab Needs From You', page: 14 },
  { lvl: 1, text: 'Section 6: Interpreting Serologic Results', page: 15 },
  { lvl: 2, text: '6.1  Reading the Titer Scale', page: 15 },
  { lvl: 2, text: '6.2  Flock Uniformity: %CV', page: 16 },
  { lvl: 1, text: 'Recommended Journals and Resources', page: 17 },
  { lvl: 1, text: 'References', page: 18 },
];

const entriesWithAnchor = tocEntries.map((e, i) => ({
  ...e,
  anchor: `_Toc${String(100000 + i).padStart(8, '0')}`,
}));

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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

let docXml = await outZip.file('word/document.xml').async('string');
docXml = docXml.replace(/\sw:dirty="true"/g, '');

const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  sdt = sdt.replace(
    /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
    `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`
  );
  docXml = docXml.replace(sdtMatch[0], sdt);
}
docXml = docXml.replace(/\sw:dirty="true"/g, '');

let entryIdx = 0;
let bookmarkId = 1000;
const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
docXml = docXml.replace(headingRegex, (match, lvlStr) => {
  if (entryIdx >= entriesWithAnchor.length) return match;
  const lvl = Number(lvlStr);
  const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
  const heading = textRuns.trim();
  const entry = entriesWithAnchor[entryIdx];
  const norm = s => s.replace(/\s+/g, ' ').trim();
  if (lvl !== entry.lvl) return match;
  if (norm(heading) !== norm(entry.text)) return match;
  entryIdx++;
  const id = bookmarkId++;
  return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
});
if (entryIdx !== entriesWithAnchor.length) {
  console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
}

outZip.file('word/document.xml', docXml);

let settings = await outZip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
settings = settings.replace(
  '<w:displayBackgroundShape/>',
  '<w:displayBackgroundShape/><w:updateFields w:val="false"/>'
);
outZip.file('word/settings.xml', settings);

let stylesXml = await outZip.file('word/styles.xml').async('string');
if (!/w:styleId="TOC1"/.test(stylesXml)) {
  const tocStyles =
    '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
  stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
  outZip.file('word/styles.xml', stylesXml);
}

const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
if (dirtyLeft > 0) {
  console.error(`ERROR: Still ${dirtyLeft} w:dirty flags - dialog will appear`);
} else {
  console.log('Dirty flag check: PASSED (0 dirty flags)');
}

const emDashCount = (docXml.match(/—/g) || []).length;
if (emDashCount > 0) {
  console.warn(`EM DASH WARNING: ${emDashCount} em dash(es) found in document - review before publishing`);
} else {
  console.log('Em dash check: PASSED (0 em dashes)');
}

const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log('Patched docx written to', OUT_FILE);
console.log('File size:', fs.statSync(OUT_FILE).size, 'bytes');
