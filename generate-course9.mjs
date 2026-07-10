// ============================================================
// generate-course9.mjs — Course 9: The Value of Poultry Diagnostics
// CPC Short Courses — Canadian Poultry Training Series
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course9.mjs
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
  LevelFormat,
  TableOfContents,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 9');
const OUT_FILE  = path.join(OUT_DIR, 'The_Value_of_Poultry_Diagnostics_revised.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

function productBuf(name) {
  const p = path.join(OUT_DIR, `product_${name}.jpg`);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

// JPEG dimensions reader for natural aspect ratio
function jpegDims(buf) {
  let i = 2;
  while (i < buf.length - 10) {
    if (buf[i] !== 0xFF) break;
    const marker = buf[i + 1];
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
      return { h: (buf[i+5]<<8)|buf[i+6], w: (buf[i+7]<<8)|buf[i+8] };
    }
    const segLen = (buf[i+2]<<8)|buf[i+3];
    i += 2 + segLen;
  }
  return null;
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
    bold:    opts.bold    || false,
    italics: opts.italics || false,
    color:   opts.color   || BODY_GRAY,
    size:    opts.size    || 24,
    font:    'Calibri',
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
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });
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

// Embedded PNG figure + caption
function image(buf, caption, widthIn = 5.8) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.6);
  try {
    const view = new DataView(buf.buffer, buf.byteOffset);
    const pw   = view.getUint32(16, false);
    const ph   = view.getUint32(20, false);
    if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'png' })],
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

// Product photo (JPEG) + caption
function productImage(buf, caption, widthIn = 2.3) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 1.33); // 3:4 default
  try {
    const d = jpegDims(buf);
    if (d) hpx = Math.round(wpx * d.h / d.w);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'jpg' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
    }),
  ];
}

// Placeholder for missing photos
function photoPlaceholder(label, brief, captionText) {
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, color: '595959', size: 22, font: 'Calibri', bold: true })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: convertInchesToTwip(0.25), after: 80 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: brief, color: '888888', size: 20, font: 'Calibri', italics: true })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 80 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: 'Photograph to be supplied by CPC team.', color: 'BBBBBB', size: 18, font: 'Calibri', italics: true })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: convertInchesToTwip(0.25) },
                }),
              ],
              shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
              borders: {
                top:    { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                left:   { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                right:  { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
              },
              margins: {
                top:    convertInchesToTwip(0.2),
                bottom: convertInchesToTwip(0.2),
                left:   convertInchesToTwip(0.3),
                right:  convertInchesToTwip(0.3),
              },
            }),
          ],
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: captionText, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 240 },
    }),
  ];
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
          new TextRun({ text: 'The Value of Poultry Diagnostics', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 9  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
// COVER PAGE
// ============================================================
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),

    new Paragraph({
      children: [new TextRun({ text: 'COURSE 9: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
  ];

  if (logoBuffer) {
    let lw = 144, lh = 144;
    try {
      const view = new DataView(logoBuffer.buffer, logoBuffer.byteOffset);
      const pw   = view.getUint32(16, false);
      const ph   = view.getUint32(20, false);
      if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw);
    } catch (_) {}
    children.push(
      new Paragraph({
        children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'The Value of Poultry Diagnostics', bold: true, color: DARK_BLUE, size: 52, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'Using Lab Tools and Farm Data to Protect Flock Health and Profits', color: MED_BLUE, size: 26, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 560 },
    }),

    new Paragraph({
      children: [new TextRun({ text: '', color: GOLD })],
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
      spacing: { before: 0, after: 400 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'Duration: 2 Hours', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'June 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature, industry management guides, and veterinary diagnostic resources. This material does not replace the advice of a licensed veterinarian, pathologist, or regulatory authority.', color: '808080', size: 18, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    pageBreak(),
  );

  return {
    properties: { titlePage: true, page: { margin: pageMargin } },
    headers: { first: new Header({ children: [new Paragraph({ children: [] })] }) },
    footers: { first: new Footer({ children: [new Paragraph({ children: [] })] }) },
    children,
  };
}

// ============================================================
// TOC + INTRODUCTION
// ============================================================
function buildIntroSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', { headingStyleRange: '1-3' }),
      pageBreak(),

      h1('Introduction'),
      para('Keeping your flock healthy is the single best way to protect your farm\'s bottom line. But if you only call for help when you are already picking up dead birds, you are playing catch-up and losing money. Poultry diagnostics is the tool that lets you get ahead. It is the process of identifying diseases, nutritional gaps, feed issues, and environmental stress before they get out of hand. In this course, we will show you how diagnostics can work on your farm, whether you run a small family flock or a large commercial barn. You will learn to use lab tests, on-farm monitoring, and veterinary support to spot problems early, cut down on bird losses, and make sure your treatments are actually working [1,2].'),
      para('Many growers view diagnostics as a final autopsy, an autopsy report that explains why birds died. That is a limited way to look at a powerful management tool. Routine monitoring, water tracking, and strategic blood screening act like a dashboard for your barn. They show you exactly where the flock stands and warn you of trouble days before you see a single sick bird. Once you know how to collect a clean sample, read a serology report with your veterinarian, and tell the difference between a management problem and an infection, you get ahead of problems instead of chasing them.'),

      h2('Learning Objectives'),
      bullet('Explain what poultry diagnostics are and why they are essential for keeping your birds healthy and your farm profitable.'),
      bullet('Identify the early, subtle changes in bird behavior, water intake, or feed consumption that tell you it is time to call for a lab test.'),
      bullet('Describe the main diagnostic tools available, including blood tests, necropsies, and house monitoring, and know when to use each one.'),
      bullet('Collect and handle basic farm samples, such as blood cards, fecal droppings, water, feed, and fresh mortalities, so they arrive at the lab in usable condition.'),
      bullet('Work with your veterinarian or extension agent to read and understand lab reports, including mean titers and uniformity scores.'),
      bullet('Use your test results to guide real decisions on treatments, day-to-day management, and your long-term vaccination plan.'),
      bullet('Work out what diagnostics are actually worth on your farm by comparing the small cost of a test with the much bigger cost of missing or delaying a diagnosis.'),
    ],
  };
}

// ============================================================
// SECTION 1: WHY POULTRY DIAGNOSTICS MATTER
// ============================================================
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 1: Why Poultry Diagnostics Matter in Modern Farming'),
      h2('1.1 The Role of Diagnostics in Flock Health and Farm Viability'),
      para('In a modern commercial poultry house, everything runs on tight margins and tight timing. In a broiler barn holding 20,000 birds or more, a single disease outbreak can move through the house in days. In layers, a disease that damages egg production or shell quality can hurt profitability for months. Diagnostics is not a luxury in that environment. It is the steering wheel that keeps your flock on track [3,4].'),
      para('Every dollar you spend on diagnostic monitoring protects the much bigger money already tied up in your chicks, feed, and labor. Think of it as three jobs working together to build a picture of what is normal for your farm:'),
      bullet([{ text: 'Tracking the immune system. ', bold: true }, { text: 'Routine serology (blood tests) shows whether your birds are carrying the antibody protection you paid for in the vaccine program, and flags an early field challenge before birds ever look sick.' }]),
      bullet([{ text: 'Monitoring and recording the environment. ', bold: true }, { text: 'Logging daily water, feed, temperature, and ventilation gives you the numbers to catch a problem the moment a trend bends the wrong way, instead of relying on your gut.' }]),
      bullet([{ text: 'Submitting early mortalities. ', bold: true }, { text: 'Sending in the first few fresh dead birds for necropsy tells you what is actually killing them, days before the rest of the flock follows.' }]),
      para('Once you have that baseline, you do not have to guess when a number moves the wrong way. You know exactly what to watch for: water intake dropping overnight, daily mortality ticking up, weekly gains stalling, or egg production slipping. When one of those shifts, you have hard data to guide your response. That is what stops a small virus problem from turning into a costly bacterial infection and keeps you out of expensive blanket antibiotics.'),
      ...image(figBuf('fig9_1.png'), 'Figure 1.1: The continuous diagnostic and farm health feedback loop. Monitoring feed and water trends informs veterinary testing, which results in targeted on-farm action plans. Source: CPC Short Courses.'),
      para('Diagnostics is a routine part of farm management, not just something you reach for in a crisis. When your barn decisions are driven by what the lab tells you, subclinical problems show up earlier, you adjust ventilation before birds are stressed, and you know your vaccination program is actually working [1].'),

      h2('1.2 Common Misconceptions: Cost vs. Investment, Diagnostics vs. Autopsy'),
      para('The most common reason growers skip diagnostic work is the belief that lab testing is too expensive. Here is the honest version: testing can be a waste of money, but only if you never use the information it gives you and never change how you manage the barn because of it. Used properly, it is the opposite of a cost. Everything we do in farming is risk management. So the real question is this: what are you doing right now to manage the risk of losing one or two percent of your flock, and what is that loss actually worth to you? A standard diagnostic submission, including necropsy and basic PCR testing, costs a few hundred dollars. Losing even one percent of a 20,000-bird broiler flock to a preventable disease like Infectious Bursal Disease (IBD) or Infectious Bronchitis means thousands of dollars gone in lost market weight, plus all the feed those birds ate while they were going downhill [2,4].'),
      para('The table below compares the two approaches.'),

      new Paragraph({ spacing: { before: 160, after: 0 } }),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [para('Scenario', { bold: true, alignment: AlignmentType.LEFT })], shading: { fill: 'D6E4F0' } }),
              new TableCell({ children: [para('Action Taken', { bold: true, alignment: AlignmentType.LEFT })], shading: { fill: 'D6E4F0' } }),
              new TableCell({ children: [para('Flock Performance Impact', { bold: true, alignment: AlignmentType.LEFT })], shading: { fill: 'D6E4F0' } }),
              new TableCell({ children: [para('Economic Outcome', { bold: true, alignment: AlignmentType.LEFT })], shading: { fill: 'D6E4F0' } }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [para('Proactive Diagnostic Screening', { alignment: AlignmentType.LEFT })] }),
              new TableCell({ children: [para('Submit a routine serology panel and early-mortality necropsy at the first sign of a problem.', { alignment: AlignmentType.LEFT })] }),
              new TableCell({ children: [para('Identify the issue early; adjust the vaccine program or management before performance drops.', { alignment: AlignmentType.LEFT })] }),
              new TableCell({ children: [para('Testing cost is a fraction of the potential loss. Flock performance is maintained.', { alignment: AlignmentType.LEFT })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [para('Delayed Action / Guessing', { alignment: AlignmentType.LEFT })] }),
              new TableCell({ children: [para('Wait for obvious signs; treat empirically with broad-spectrum antibiotics.', { alignment: AlignmentType.LEFT })] }),
              new TableCell({ children: [para('Mortality climbs; FCR worsens; days of poor performance cannot be recovered.', { alignment: AlignmentType.LEFT })] }),
              new TableCell({ children: [para('Loss on a commercial flock can quickly exceed the full testing cost many times over.', { alignment: AlignmentType.LEFT })] }),
            ],
          }),
        ],
      }),

      new Paragraph({ spacing: { before: 160, after: 0 } }),

      para([
        { text: 'Another misconception is that diagnostics is only for dead birds. An autopsy, or post-mortem examination, is simply a tool to find out why a specific bird died. Diagnostics is much broader. It covers monitoring water and feed trends, checking incoming water quality, running drag swabs for ' },
        { text: 'Salmonella', italics: true },
        { text: ', and testing blood from healthy birds to measure their antibody levels. The goal is to keep the flock alive and performing well, not just to write a death certificate [1,2].' },
      ]),
    ],
  };
}

// ============================================================
// SECTION 2: WHAT POULTRY DIAGNOSTICS INVOLVES
// ============================================================
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 2: What Poultry Diagnostics Involves'),
      h2('2.1 Types of Diagnostic Tests'),
      para('There are several diagnostic tools available, and each one is built to find a different type of problem. Knowing what each test does means you and your veterinarian can pick the right one the first time [1,3].'),
      ...image(figBuf('fig9_2.png'), 'Figure 2.1: Diagnostic methods matrix detailing Serology, Necropsy, Histopathology, PCR, and Bacteriology applications. Source: CPC Short Courses.'),
      para('Each method has a specific role:'),
      bullet([
        { text: 'Serology tests like ELISA, HI, and plate agglutination check the blood for antibodies. This helps you see if your birds responded to a vaccine or if they\'ve been exposed to a virus out in the barn. The ELISA is the most common test for routine flock screening because it is fast and handles large sample numbers. The HI (Hemagglutination Inhibition) test is more specific and is used for Newcastle Disease and Avian Influenza. Rapid Plate Agglutination is a quick on-farm test to screen for ' },
        { text: 'Mycoplasma gallisepticum', italics: true },
        { text: ' (MG) and ' },
        { text: 'Mycoplasma synoviae', italics: true },
        { text: ' (MS) [1].' },
      ]),
      bullet([{ text: 'Necropsy: ', bold: true }, { text: 'An examination of a fresh bird carcass after death. The pathologist looks for visible changes inside the bird, such as fluid in the air sacs, bleeding in the gut, swollen kidneys, or signs of septicemia: infection and inflammation across different organs. Within hours, you have clues about what is hitting your birds [5].' }]),
      bullet([{ text: 'Histopathology: ', bold: true }, { text: 'Examining thin slices of tissue under a microscope. If a necropsy shows swollen kidneys, histopathology lets the pathologist look at those kidney cells and confirm whether a specific virus or a nutritional problem caused the damage [5].' }]),
      bullet([{ text: 'PCR (Polymerase Chain Reaction): ', bold: true }, { text: 'Finds the DNA or RNA fingerprint of a virus or bacterium in the sample. It catches pathogens in tiny amounts and returns a result in 24 to 48 hours. PCR is particularly useful for identifying which strain of Infectious Bronchitis Virus (IBV) or Inclusion Body Hepatitis virus (IBHV, a Fowl Adenovirus) you are dealing with [1,3]. For IBV, knowing the strain lets your veterinarian pick the right vaccine strain. For IBH, strain typing guides the development of an autogenous vaccine, a custom vaccine prepared from your specific field isolate, because no single commercial vaccine covers all IBH serotypes [3].' }]),
      bullet([{ text: 'Bacteriology (Culture and Sensitivity): ', bold: true }, { text: 'Grows bacteria from tissue samples on lab plates to identify what species is present, then tests which antibiotics will actually kill it. That sensitivity result stops you from treating with the wrong drug and helps cut down on antimicrobial resistance [3].' }]),
      para('That last test, bacteriology with culture and sensitivity, deserves a closer look, because it is not just useful to you. Your veterinarian needs this lab data to do their job properly, in two specific ways:'),
      bullet([{ text: 'To diagnose the problem and prescribe targeted therapy. ', bold: true }, { text: 'A veterinarian cannot responsibly hand you an antibiotic on a hunch. Since December 2018, every medically important antibiotic in Canada is prescription-only, and a sound prescription rests on knowing exactly which bug you are dealing with and which drug will actually kill it. Culture and sensitivity is what turns a guess into a targeted treatment [6].' }]),
      bullet([{ text: 'To meet CFIA requirements at audit and before slaughter. ', bold: true }, { text: 'When a flock is treated with an extra-label drug, the CFIA Food Animal Information Document requires the operator to keep the veterinary prescription with its withdrawal time, plus, where residue testing applies, a test report from a Standards Council of Canada accredited laboratory with samples collected under veterinary supervision. That paperwork has to follow the flock to the plant. Without the supporting lab work behind it, a veterinary recommendation does not hold up at a CFIA audit [7].' }]),

      h2('2.2 Sample Collection and Handling'),
      para('The accuracy of any lab test depends on the quality of the sample you submit. In veterinary medicine, the rule is "garbage in, garbage out." A degraded or contaminated sample will lead to incorrect results, wasting your money and delaying treatment [2]. The best approach is to have your veterinarian collect and submit the samples. They know exactly what to collect, how to package it, and which lab to send it to for the specific disease you are investigating. This matters especially when specific tissues need to be taken from the right location and in the right condition.'),
      ...image(figBuf('fig9_3.png'), 'Figure 2.2: Guidelines for collecting and submitting fecal, blood, water/feed, and mortality samples. Source: CPC Short Courses.'),
      para('Here is how to collect each type of sample:'),
      bullet([{ text: 'Fecal / Litter samples: ', bold: true }, { text: 'Collect fresh droppings from multiple spots around the barn. Skip dry crust and clean litter. Put the droppings in a sealed plastic bag and keep them cool. Do not freeze fecal samples. Freezing kills parasite eggs (coccidia oocysts) and throws off the bacterial counts.' }]),
      bullet([{ text: 'Water and Feed samples: ', bold: true }, { text: 'Collect water from the very end of the drinker lines. That is the water the birds actually drink, not the cleaner water sitting at the header. If you are on a well, send a water sample to the lab at least once a year. For feed, take samples from the center of the feed bin or feeders, not from the edges where dust or wet clumps collect. Use sterile containers for water [8,9].' }]),
      bullet([{ text: 'Blood in tubes (preferred): ', bold: true }, { text: 'The most reliable blood sample for serology is venous blood drawn into plain red-top or serum separator tubes. Because this requires a clean venipuncture and correct handling to prevent hemolysis, your CPC technician or veterinarian will typically collect and submit this type of sample on your behalf. If the CPC team is visiting your farm, request a blood-in-tube submission at the same visit [1].' }]),
      bullet([{ text: 'Blood cards (farmer alternative): ', bold: true }, { text: 'If a veterinarian visit is not possible right away, you can collect blood yourself using wing-vein pricks from 12 to 24 representative birds and filling the circles on a filter card. Air-dry the cards completely at room temperature before bagging them. Damp cards will mold and destroy the proteins the lab needs for serology [1].' }]),
      ...image(figBuf('Blood sampleing.png'), 'Photo 2.1: Red-top blood tubes, syringes, and dried blood spot cards set up for flock serology sampling in a commercial broiler barn. Source: CPC Short Courses.'),
      bullet([{ text: 'Fresh Mortalities: ', bold: true }, { text: 'Submit 10 to 12 fresh birds for necropsy. Choose recent mortalities or live birds showing the same signs as the problem flock. Keep them chilled at 4°C in transport. Do not freeze them. Freezing tears apart the cell walls and destroys the tissue detail the pathologist needs [5].' }]),

      para([
        { text: 'Never forget that you are handling live pathogens during collection. This matters for two reasons. First, whatever is making these birds sick can ride out of the barn on your hands, boots, or clothing and walk straight into the next flock you visit, so sloppy sampling spreads the very disease you are trying to pin down. Second, some poultry bugs, including ' },
        { text: 'Salmonella', italics: true },
        { text: ' and avian influenza, can make people sick too, so protecting yourself is part of the job. Put on disposable gloves, use your farm-dedicated boots, and wash your hands before and after [4].' },
      ]),
      para('Have these basic supplies ready at the barn door and before your sampling kit leaves the property:'),
      ...productImage(productBuf('elastic_top_boots'), 'Photo 2.2: Elastic Top Boots. Durable rubber boots designed for quick sanitation and dedicated barn use during sample collection. Source: canadianpoultry.ca/shop.'),
      ...productImage(productBuf('chlorinated_evo_wash'), 'Photo 2.3: Chlorinated EVO Wash. A foaming chlorine-based sanitizer for disinfecting sampling kits and transport containers. Source: canadianpoultry.ca/shop.'),
      para('Put on dedicated rubber barn boots before entering each house so you are not tracking pathogens from barn to barn. Wipe your transport containers down with a foaming chlorine sanitizer before they leave the property.'),
    ],
  };
}

// ============================================================
// SECTION 3: BENEFITS OF EARLY AND ACCURATE DIAGNOSIS
// ============================================================
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 3: Benefits of Early and Accurate Diagnosis'),
      h2('3.1 Preventing Massive Losses: Early Warnings in Water and Feed Consumption'),
      para('Commercial birds live in tight groups. A disease challenge can move through a house in days. Catching it early is everything. Long before birds start coughing, huddling, or looking lethargic, their behavior shifts. Your daily water and feed meters are the most sensitive early indicators of that shift [2].'),
      para('Water consumption is particularly sensitive. The CPC Learning Centre \'Spotting Disease Early\' guide identifies when disease or stress hits the flock, water intake drops before feed intake, often a full day or two before birds start coughing or show other signs. A notable unexplained drop in your water meter on a single day is a strong early warning. If you wait until you have sick birds or high mortalities, you have already lost days you cannot get back [2].'),
      para([
        { text: 'When the meters drop, call your veterinarian and, based on their consultation, get birds or blood cards to the lab that day. Getting that diagnosis early lets you start treatment or fix the ventilation before ' },
        { text: 'E. coli', italics: true },
        { text: ' moves in behind the virus and causes the real damage [2,3].' },
      ]),

      h2('3.2 Stopping Disease Transmission and Protecting Neighboring Barns'),
      para('In poultry-dense regions, like the Fraser Valley in British Columbia or parts of Southern Ontario, biosecurity is a shared responsibility. An infectious outbreak in your barn does not just threaten your birds. It threatens every poultry farm within several kilometers. Airborne pathogens, wild birds, and shared service vehicles can carry viruses like Newcastle Disease, ILT, or Avian Influenza from farm to farm [4].'),
      para('An early and accurate diagnostic result allows you to lock down your farm immediately. You can stop visitors, cancel feed deliveries or manure hauling, adjust your exhaust fan directions, and warn neighboring growers to increase their biosecurity. Early diagnosis is the only way to contain a highly contagious disease and prevent a localized problem from becoming a regional quarantine [4]. For the full biosecurity protocols that back up this rapid response, see Course 2 (Biosecurity) in this series.'),

      h2('3.3 Enhancing Performance: Uncovering Subclinical Disease'),
      para('Not all diseases kill birds. In fact, some of the most expensive conditions in poultry farming are subclinical. None of them will drop your flock overnight. But each one quietly chips away at gut function or immune response, and by the time you notice the damage, feed costs have climbed and birds are coming off the truck lighter than they should be [4].'),
      para('Common subclinical challenges include:'),
      bullet([{ text: 'Subclinical Coccidiosis: ', bold: true }, { text: 'Tiny protozoan parasites damage the gut lining so the bird cannot absorb what it eats. Feed goes in, but it does not come out as weight. The FCR climbs and flock uniformity drops.' }]),
      bullet([
        { text: 'Subclinical Infectious Bursal Disease (IBD): ', bold: true },
        { text: 'The virus hits the bursa of Fabricius, the organ that builds the chick\'s immune system. Young birds that survive can suffer lasting immune damage. They pick up ' },
        { text: 'E. coli', italics: true },
        { text: ' easily and do not respond properly to the next round of vaccinations [3].' },
      ]),
      bullet([{ text: 'Mycoplasma: ', bold: true }, { text: 'MG and MS quietly inflame the air sacs and joints without killing a single bird. Growth slows and you start seeing more condemnations at the plant [3].' }]),

      para('Routine diagnostics is the only way to catch these problems. Regular coccidia oocyst counts on fecal samples and IBD titer checks on blood cards let you find these performance-drainers before they cost you the whole flock\'s margin. Fix your vaccination or coccidiostat program early, not after the damage is done [1,2]. For full disease profiles on IBD, Mycoplasma, and the other common subclinical pathogens, see Course 7 (Common Poultry Diseases) in this series.'),
    ],
  };
}

// ============================================================
// SECTION 4: USING DIAGNOSTICS FOR DECISION-MAKING
// ============================================================
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 4: Quality Decisions Need Quality Diagnostics'),
      h2('4.1 When to Call for Support: Knowing Your Baseline'),
      para('To recognize when a flock is in trouble, you must know what is normal for your barn. Every farm has a baseline: normal daily water intake, typical flock behavior at different ages, and normal daily mortality (typically under 0.05% per day after the first week) [2,4].'),
      para('The CPC Learning Centre \'Spotting Disease Early\' guide recommends contacting your veterinarian or service representative immediately if you observe any of the following triggers [2,4]:'),
      bullet('A notable unexplained drop in daily water or feed consumption, with no obvious mechanical cause, on a single day.'),
      bullet('Daily mortality running above 0.5% for two days in a row, or any sudden jump in dead birds.'),
      bullet('Birds huddling, going quiet, or making a soft clicking sound (snicking) on your night barn walk.'),
      bullet('Weekly gains dropping suddenly, or birds starting to spread wide in size.'),
      bullet('In layers, a drop of 5% or more in daily production, or a sudden increase in cracked or soft-shelled eggs.'),

      h2('4.2 Interpreting Lab Reports: Mean Titers and Uniformity'),
      para('When your serology report comes back, focus on two numbers: the Mean Titer and the Coefficient of Variation (%CV). The mean titer is the average antibody level across the flock. Your veterinarian or vaccine manufacturer will give you the target range to compare it against. The %CV tells you how evenly the flock responded. A low %CV means birds are all at similar levels and coverage is solid. A high %CV means the flock is split: some birds are well-protected, others barely have any coverage at all. Interpreting these numbers correctly takes technical knowledge, so always go through the results with your veterinarian rather than acting on them alone. For a full walkthrough of reading serology reports, interpreting %CV thresholds, and acting on the results, see Course 15 (Serology 101) in this series [1].'),

      h2('4.3 Confirming a Field Challenge: Paired Samples'),
      para('A single blood sample showing high titers cannot tell you whether the birds responded well to vaccination or are actively fighting a field virus. To answer that, the lab needs two sets of blood from the same barn: one taken as soon as you notice something is off, and another from the same birds 10 to 14 days later. If titers hold steady, the high level came from the vaccine. If they jump significantly between the two samples, you have confirmed an active field challenge [1].'),
      para('Be realistic about the timing, though. Because that second sample comes 10 to 14 days after the first, the confirmed answer usually lands too late to save the flock standing in the barn right now. This is still super useful information, but its real payoff is going forward. It becomes part of your farm\'s health history, and more importantly it shapes the vaccination program for the next flock placed in that barn. Case Study A later in this course shows exactly that: the paired titers did not rescue the flock they were drawn from, but they drove the breeder vaccination change and the tighter clean-out that turned the following flocks around [1].'),

      h2('4.4 Management Errors vs. Infections'),
      para('When a flock performance issue occurs, growers often assume an infectious disease is responsible. The CPC Learning Centre \'Spotting Disease Early\' guide notes that a high percentage of bird submissions to the laboratory are in fact non-infectious conditions linked to management errors. Walk your barn and check the basics before you submit anything [2].'),
      ...image(figBuf('fig9_5.png'), 'Figure 4.1: Decision tree to troubleshoot management factors before submitting laboratory samples. Source: CPC Short Courses.'),
      para('Always investigate these non-infectious factors first. For a systematic barn-entry checklist covering temperature, feed, light, air, water, and sanitation, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),
      bullet([{ text: 'Water line issues: ', bold: true }, { text: 'Check for airlocks, clogged nipples, or a failure in the line regulator. A sudden drop in water intake is often a mechanical failure, not a disease.' }]),
      bullet([{ text: 'Feed line blockages: ', bold: true }, { text: 'Verify that the feed lines are running and that bins are not empty. A blocked boot at the feed bin can starve a house in hours.' }]),
      bullet([{ text: 'Temperature and ventilation: ', bold: true }, { text: 'Ensure the temperature matches the birds\' age. Chilling or overheating causes birds to huddle and stop eating or drinking. Check your ammonia level too. Even before birds show respiratory signs, high ammonia suppresses immunity and can look exactly like an infectious respiratory disease. If you can smell ammonia at bird level when you walk in, it is already too high [4].' }]),
    ],
  };
}

// ============================================================
// SECTION 5: CASE STUDIES AND PRACTICAL EXAMPLES
// ============================================================
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 5: Case Studies and Practical Examples'),
      h2('5.1 Case Study A: Catching Subclinical Infectious Bursal Disease (IBD)'),
      para([
        { text: 'What this grower was seeing: ', bold: true },
        { text: 'A broiler grower in Ontario noticed performance slipping, even though the birds did not look obviously sick.' },
      ]),
      bullet('Feed conversion crept up to about 1.72, against their usual target of 1.60.'),
      bullet('Mortality stayed around 3 percent, which was normal for this farm.'),
      para('The main concern showed up at the plant: birds came in with a wide spread in body weights, with too many smaller birds in each load. On day-to-day checks the flock looked healthy, but the numbers and the lack of uniformity pointed to something quietly holding part of the flock back.'),
      para([
        { text: 'What was done to investigate: ', bold: true },
        { text: 'By the fourth flock, the grower and their veterinarian decided to dig in rather than accept the new "normal." They pulled blood samples at 14 days and again at 28 days to check IBD antibody levels and how even the response was across the flock.' },
      ]),
      bullet('Day 14: %CV came back at 25%, a fairly even response.'),
      bullet('Day 28: %CV jumped to 92%, a sign the flock had split into two very different groups, some birds still tracking the vaccine response and others showing a much higher exposure.'),
      para('To connect these numbers with what was happening inside the birds, three smaller, poor-growing birds were sent for necropsy. The pathologist found the bursa of Fabricius severely shrunken in all three birds. Histopathology showed most of the immune tissue inside the bursa had been destroyed, the hallmark of subclinical infectious bursal disease [3,5].'),
      para('The conclusion: subclinical IBD was quietly wrecking the birds\' immune systems without ever causing obvious clinical signs.'),
      para([
        { text: 'What changed on the farm: ', bold: true },
        { text: 'With a clear diagnosis in hand, the veterinarian and grower focused on two things: stronger early immunity and less virus pressure in the barn. The breeder flock vaccination program was adjusted so chicks arrived with stronger, more consistent maternal antibody levels against IBD. On the broiler side, the grower tightened up cleaning and disinfection between flocks, including a thorough scrub of the concrete floor with a chlorine-based sanitizer effective against IBD virus.' },
      ]),
      para([
        { text: 'The result: ', bold: true },
        { text: 'FCR on the next flock came back at 1.62. Birds were noticeably more uniform at catching, with far fewer small, lagging birds. That feed efficiency gain alone was worth more than $3,800 in feed savings on that flock.' },
      ]),
      para('The lesson holds for big and small operations alike. A "quiet" immunosuppressive problem like subclinical IBD can chip away at performance flock after flock. Pulling flock records, running basic diagnostics, and acting on what they show can turn that around.'),

      h2('5.2 Case Study B: Waiting On A Water Drop'),
      para([
        { text: 'What this grower saw: ', bold: true },
        { text: 'On day 22 of a 38-day broiler flock, the barn computer flagged a 12% drop in daily water use compared with the recent average. The grower walked the barn, checked the regulators and nipples, and everything looked normal. Since the birds did not look obviously sick, they decided to wait a day or two and see if things bounced back on their own.' },
      ]),
      para([
        { text: 'What happened next: ', bold: true },
        { text: 'By day 24, feed intake was down about 15% and birds were noticeably quieter and more lethargic. On day 25, the daily dead count jumped from 8 birds to 45. At that point the grower called their veterinarian, who picked up 10 fresh dead birds and got them to the lab the same afternoon [2].' },
      ]),
      para([
        { text: 'At necropsy, the lab found a heavy layer of fibrin around the heart and liver, cloudy fluid in the air sacs, and clear signs of septicemia. PCR testing came back positive for Infectious Bronchitis Virus, and ' },
        { text: 'E. coli', italics: true },
        { text: ' was growing strongly on culture as a major secondary bug [3,5].' },
      ]),
      para([
        { text: 'What it cost the flock: ', bold: true },
        { text: 'Those three days of "wait and see" gave the Infectious Bronchitis Virus time to damage the birds\' airways. Once their defenses were down, ' },
        { text: 'E. coli', italics: true },
        { text: ' moved in and went septic, hitting the flock hard. Emergency antibiotics cost around $1,500. By the end of the flock, mortality had climbed to 4.5%, and the poorer FCR pushed the total loss for that cycle to over $5,200.' },
      ]),
      para([
        { text: 'If the grower had sent in a few fresh mortalities as soon as the water curve dropped on day 22, the veterinarian could have reacted earlier. With quick lab results, plus supportive steps like electrolytes, tighter ventilation control, and a targeted plan, they likely could have kept that ' },
        { text: 'E. coli', italics: true },
        { text: ' problem much smaller. In this case, the difference between acting on the first water warning and waiting three days was roughly a $5,200 lesson [2].' },
      ]),
    ],
  };
}

// ============================================================
// SECTION 6: RECOMMENDED PEER-REVIEWED JOURNALS
// ============================================================
function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para('The following journals publish current research on poultry pathology, serology, diagnostics, and farm management. These are appropriate sources for veterinarians and growers seeking to stay current with scientific developments:'),
      bullet([{ text: 'Poultry Science ', bold: true, italics: true }, { text: '(Elsevier / Poultry Science Association): The primary journal for research on commercial poultry nutrition, genetics, physiology, and flock management.' }]),
      bullet([{ text: 'Avian Diseases ', bold: true, italics: true }, { text: '(American Association of Avian Pathologists): Focused specifically on poultry health, disease transmission, vaccines, and diagnostic pathology.' }]),
      bullet([{ text: 'Canadian Veterinary Journal ', bold: true, italics: true }, { text: '(Canadian Veterinary Medical Association): Covers veterinary clinical practice and infectious disease surveillance in Canada, including poultry.' }]),
      bullet([{ text: 'Avian Pathology ', bold: true, italics: true }, { text: '(Taylor & Francis / World Veterinary Poultry Association): International research on infectious diseases and pathological methods in poultry.' }]),
    ],
  };
}

// ============================================================
// SECTION 7: REFERENCES
// ============================================================
function buildReferencesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('References'),
      para('References are listed in order of first appearance in the text. All sources are peer-reviewed literature, veterinary manuals, or guides from recognized regulatory and scientific bodies.'),
      numberedRef('Bowes V. Serology 101: Or How To Interpret Those Funny-Looking Graphs [Technical Bulletin]. Animal Health Centre, Abbotsford, BC; 2003. Available from: cpclearningcentre.ca.'),
      numberedRef('Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca.'),
      numberedRef('Diseases of Poultry. Swayne DE, editor. 14th ed. Hoboken, NJ: Wiley-Blackwell; 2020.'),
      numberedRef('Ross Broiler Management Handbook. Huntsville, AL: Aviagen; 2025.'),
      numberedRef('Dinev I. Ceva Handbook of Poultry Diseases. 1st ed. Libourne, France: Ceva Santé Animale; 2014.'),
      numberedRef('Health Canada. Responsible use of Medically Important Antimicrobials in animals. Ottawa: Health Canada; 2018 [cited 2026 Jun]. Available from: canada.ca.'),
      numberedRef('Canadian Food Inspection Agency. Food Animal Information Document for Poultry. Ottawa: CFIA [cited 2026 Jun]. Available from: inspection.canada.ca.'),
      numberedRef('Aviagen. Aviagen Brief: Water Quality. Huntsville, AL: Aviagen; 2025.'),
      numberedRef('Managing the Nipple Drinker Line [Technical Bulletin]. CPC Learning Centre. Available from: cpclearningcentre.ca.'),
    ],
  };
}

// ============================================================
// STYLES
// ============================================================
function buildStyles() {
  return {
    default: {
      document: {
        run:       { font: 'Calibri', size: 24, color: BODY_GRAY },
        paragraph: { spacing: { after: 160, line: 276, lineRule: 'auto' } },
      },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 36, bold: true, color: DARK_BLUE },
        paragraph: {
          spacing: { before: 480, after: 240 },
          border:  { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
          outlineLevel: 0,
        },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 30, bold: true, color: MED_BLUE },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 26, bold: true, italics: true, color: MED_BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  };
}

// ============================================================
// NUMBERING
// ============================================================
function buildNumbering() {
  return {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(1.0), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
      {
        reference: 'references-list',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
    ],
  };
}

// ============================================================
// BUILD AND WRITE
// ============================================================
async function main() {
  console.log('Building Course 9: The Value of Poultry Diagnostics...');

  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       'The Value of Poultry Diagnostics',
    description: 'Course 9 — CPC Short Courses',
    features:    { updateFields: false },
    styles:      buildStyles(),
    numbering:   buildNumbering(),
    sections: [
      buildCoverSection(),
      buildIntroSection(),
      buildSection1(),
      buildSection2(),
      buildSection3(),
      buildSection4(),
      buildSection5(),
      buildJournalSection(),
      buildReferencesSection(),
    ],
  });

  let buffer = await Packer.toBuffer(doc);

  // Post-build patch via JSZip
  const zip = await JSZip.loadAsync(buffer);

  // 1. settings.xml — disable auto field update to suppress dialog
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!settings.includes('<w:updateFields')) {
    settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  }
  zip.file('word/settings.xml', settings);

  // 2-3. document.xml — strip dirty flags + inject cached TOC + inject bookmarks
  let docXml = await zip.file('word/document.xml').async('string');

  // 2. Strip w:dirty="true" from all field characters
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  // 3. TOC entries with anchors for clickable rows (estimated pages)
  const entriesWithAnchor = [
    { lvl: 1, text: 'Introduction',                                                                   page: 3  },
    { lvl: 2, text: 'Learning Objectives',                                                             page: 3  },
    { lvl: 1, text: 'Section 1: Why Poultry Diagnostics Matter in Modern Farming',                    page: 4  },
    { lvl: 2, text: '1.1 The Role of Diagnostics in Flock Health and Farm Viability',                  page: 4  },
    { lvl: 2, text: '1.2 Common Misconceptions: Cost vs. Investment, Diagnostics vs. Autopsy',         page: 5  },
    { lvl: 1, text: 'Section 2: What Poultry Diagnostics Involves',                                    page: 6  },
    { lvl: 2, text: '2.1 Types of Diagnostic Tests',                                                   page: 6  },
    { lvl: 2, text: '2.2 Sample Collection and Handling',                                              page: 7  },
    { lvl: 1, text: 'Section 3: Benefits of Early and Accurate Diagnosis',                             page: 11 },
    { lvl: 2, text: '3.1 Preventing Massive Losses: Early Warnings in Water and Feed Consumption',    page: 11 },
    { lvl: 2, text: '3.2 Stopping Disease Transmission and Protecting Neighboring Barns',              page: 11 },
    { lvl: 2, text: '3.3 Enhancing Performance: Uncovering Subclinical Disease',                       page: 11 },
    { lvl: 1, text: 'Section 4: Quality Decisions Need Quality Diagnostics',                            page: 13 },
    { lvl: 2, text: '4.1 When to Call for Support: Knowing Your Baseline',                             page: 13 },
    { lvl: 2, text: '4.2 Interpreting Lab Reports: Mean Titers and Uniformity',                         page: 13 },
    { lvl: 2, text: '4.3 Confirming a Field Challenge: Paired Samples',                                 page: 13 },
    { lvl: 2, text: '4.4 Management Errors vs. Infections',                                            page: 14 },
    { lvl: 1, text: 'Section 5: Case Studies and Practical Examples',                                  page: 15 },
    { lvl: 2, text: '5.1 Case Study A: Catching Subclinical Infectious Bursal Disease (IBD)',           page: 15 },
    { lvl: 2, text: '5.2 Case Study B: Waiting On A Water Drop',                                      page: 16 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals',                                              page: 17 },
    { lvl: 1, text: 'References',                                                                      page: 18 },
  ].map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function tocRow(e) {
    const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
    const indent    = e.lvl === 1 ? '' : '<w:ind w:left="440"/>';
    const text      = escapeXml(e.text);
    return (
      '<w:p><w:pPr>' +
        `<w:pStyle w:val="${styleName}"/>` +
        '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs>' +
        indent +
      '</w:pPr>' +
      `<w:hyperlink w:anchor="${e.anchor}" w:history="1">` +
        `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>` +
        '<w:r><w:tab/></w:r>' +
        `<w:r><w:t>${e.page}</w:t></w:r>` +
      '</w:hyperlink></w:p>'
    );
  }

  const tocEntries   = entriesWithAnchor.map(tocRow).join('');
  const sepTag       = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag       = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx       = docXml.indexOf(sepTag);
  if (sepIdx !== -1) {
    const endIdx = docXml.indexOf(endTag, sepIdx);
    if (endIdx !== -1) {
      docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
    }
  }

  // 3b. Inject bookmarks around heading paragraphs for clickable TOC
  {
    let entryIdx  = 0;
    let bookmarkId = 1000;
    const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    docXml = docXml.replace(headingRegex, (match, lvlStr) => {
      if (entryIdx >= entriesWithAnchor.length) return match;
      const lvl      = Number(lvlStr);
      const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
      const heading  = textRuns.trim();
      const entry    = entriesWithAnchor[entryIdx];
      const norm     = (s) => s.replace(/\s+/g, ' ').trim();
      
      // Since e.g. "Section 1: Why Poultry Diagnostics Matter in Modern Farming" matches the TOC text
      // and "1.1 The Role of Diagnostics in Flock Health and Farm Viability" matches Heading2, we verify match:
      if (lvl !== entry.lvl) return match;
      if (norm(heading) !== norm(entry.text)) return match;
      
      entryIdx++;
      const id = bookmarkId++;
      return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
    });
    if (entryIdx !== entriesWithAnchor.length) {
      console.warn(`Course 9 TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
    }
  }

  // 4. Add TOC1 / TOC2 styles to styles.xml if missing
  let stylesXml = await zip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    const tocStyles =
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="440"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
    stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
    zip.file('word/styles.xml', stylesXml);
  }

  // 5. Sanity check: must have 0 dirty flags
  const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
  if (dirtyLeft > 0) {
    throw new Error(`Still ${dirtyLeft} w:dirty flags in document.xml — "fields may refer to other files" dialog will appear`);
  }

  // 6. Validate no unescaped ampersands
  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found), Word will reject the file`);

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
}

main().catch(err => { console.error(err); process.exit(1); });
