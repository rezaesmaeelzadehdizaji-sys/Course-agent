// ============================================================
// generate-course16.mjs — Course 16: Preparing for an Inspection Audit
// CPC Short Courses
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course16.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
  Header, Footer, PageNumber, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, convertInchesToTwip, HeadingLevel,
  LevelFormat, TableOfContents, ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 16');
const OUT_FILE  = path.join(OUT_DIR, 'Preparing_for_an_Inspection_Audit.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');
const COURSE_TITLE = 'Preparing for an Inspection Audit';

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}
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

// ---- colors ----
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

// ---- helpers ----
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
        text: seg.text, bold: seg.bold || false, italics: seg.italics || false,
        color: seg.color || BODY_GRAY, size: seg.size || 24, font: 'Calibri',
      }))
    : [run(text, { bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })];
  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing:   { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent:    opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}
function h1(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } }); }
function h2(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } }); }

function bullet(text, lvl = 0) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY_GRAY, size: 24, font: 'Calibri' }))
    : [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}
function numberedRef(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' })],
    numbering: { reference: 'references-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function image(buf, caption, widthIn = 5.9) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.66);
  try {
    const view = new DataView(buf.buffer, buf.byteOffset);
    const pw = view.getUint32(16, false);
    const ph = view.getUint32(20, false);
    if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'png' })],
      alignment: AlignmentType.CENTER, spacing: { before: 160, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 },
    }),
  ];
}

function photoImage(buf, caption, widthIn = 5.0) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.66);
  try {
    const d = jpegDims(buf);
    if (d) hpx = Math.round(wpx * d.h / d.w);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'jpg' })],
      alignment: AlignmentType.CENTER, spacing: { before: 140, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 },
    }),
  ];
}

// ---- header / footer ----
function buildHeader() {
  return new Header({ children: [ new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ text: COURSE_TITLE, color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  }) ] });
}
function buildFooter() {
  return new Footer({ children: [ new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  Course 16  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.CURRENT], color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ text: ' of ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], color: '888888', size: 18, font: 'Calibri' }),
    ],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  }) ] });
}

const pageMargin = {
  top: convertInchesToTwip(1), bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25),
};

// ---- cover ----
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 16: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 },
    }),
  ];
  if (logoBuffer) {
    let lw = 144, lh = 144;
    try {
      const view = new DataView(logoBuffer.buffer, logoBuffer.byteOffset);
      const pw = view.getUint32(16, false), ph = view.getUint32(20, false);
      if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw);
    } catch (_) {}
    children.push(new Paragraph({
      children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
      alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
    }));
  }
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Preparing for an Inspection Audit', bold: true, color: DARK_BLUE, size: 50, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Staying Audit-Ready Every Day on a Canadian Poultry Farm', color: MED_BLUE, size: 26, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 560 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '', color: GOLD })],
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
      spacing: { before: 0, after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Duration: 2 Hours', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'July 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 800 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from national on-farm assurance programs, regulatory standards, industry guides, and the CPC Learning Centre. It does not replace the official program manuals, the advice of your provincial marketing board, or the direction of a licensed veterinarian or regulatory authority. Always follow the current version of the program you are audited under.', color: '808080', size: 18, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
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

// ---- TOC + Introduction ----
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
      para('An inspection audit is just someone from outside your operation coming to confirm that what you do every day matches what the program says you should do. For most Canadian poultry farmers, that audit is not a rare event. It is a regular part of being a supply-managed producer. Once a year, give or take, a trained auditor walks your barn, looks at your records, and checks that your flock is being raised safely and humanely. Pass it, and you keep your license to ship birds and eggs. The good news is that the same habits that get you through an audit are the habits that grow healthier flocks and make you more money.'),
      para('This course is built to take the stress out of audit day. We will walk through who audits a Canadian poultry farm and why, the six areas every auditor looks at, how to get your barn and your paperwork ready, how to handle the auditor when they are standing in your driveway, and what to do with the report afterward. The goal is simple: stop treating the audit as a once-a-year scramble and start running a barn that is ready any day of the year. If you keep good records and your daily routine is solid, the audit becomes a formality instead of a fire drill.'),
      para('A quick word on scope. This course is about getting ready for and getting through an audit. It is not a deep dive into the rules themselves. For the full picture of the laws, supply management, and codes that govern poultry farming in Canada, see Course 17 (Regulatory Framework in Poultry Production) in this series.'),

      h2('Learning Objectives'),
      bullet('Explain what an inspection audit is, the main types you will face, and why they exist in Canadian poultry production.'),
      bullet('Identify the six key areas an auditor reviews on a poultry farm, and what they are actually looking for in each one.'),
      bullet('Run an internal pre-audit self-check on your own barn and records, and find your weak spots before the auditor does.'),
      bullet('Fix the deficiencies that show up most often, and assign clear responsibilities so your whole team is ready.'),
      bullet('Host an auditor professionally on the day, answer questions calmly, and show your records and procedures with confidence.'),
      bullet('Read an audit report, close out corrective actions properly, and turn each audit into a step toward a better-run farm.'),
      bullet('Build daily routines that keep you audit-ready year round, so the audit is never a scramble.'),
    ],
  };
}

// ---- Section 1 ----
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 1: Understanding Audits'),

      h2('1.1 What Is an Inspection Audit?'),
      para('An audit is a structured check. An auditor compares how your farm actually runs against a written standard, then records where you meet it and where you fall short. It is not a pop quiz and it is not personal. The standard is public, the checklist is known ahead of time, and you can see exactly what will be looked at long before the auditor arrives. That is what makes audits manageable: there are no trick questions.'),
      para('For most Canadian poultry farmers, your everyday audit is your national on-farm assurance program, delivered through your commodity board. For chicken, that means the Chicken Farmers of Canada Raised by a Canadian Farmer On-Farm Food Safety Program [1] and the Raised by a Canadian Farmer Animal Care Program [2]. Both are mandatory for registered farmers, and both are built on a science-based foundation: the poultry Code of Practice developed by the National Farm Animal Care Council [3]. The Code is the agreed national standard for how poultry should be cared for and handled, and the on-farm programs turn it into things an auditor can actually check.'),
      para('An audit is different from a casual farm visit. Your service rep or veterinarian might drop by and give you advice, but that is not an audit. An audit is documented, scored against the standard, and tied to your ability to keep producing. When you understand that the auditor is just confirming the gap between your daily practice and the written standard, the whole thing gets a lot less intimidating.'),

      h2('1.2 Types of Audits: Regulatory, Company, Certification, Welfare, and Food Safety'),
      para('Not every audit is the same, and it helps to know which kind is knocking. Most farms see one main on-farm program audit a year, but several different types exist and some farms face more than one.'),
      bullet([{ text: 'Food safety audits: ', bold: true }, { text: 'These confirm you are producing safe food. Chicken farms are audited under the On-Farm Food Safety Program [1], which covers biosecurity, feed and water, cleaning and disinfection, inputs, flock monitoring, and records. Egg farms follow the Egg Farmers of Canada Start Clean-Stay Clean program [4], and turkey farms follow the Turkey Farmers of Canada On-Farm Food Safety Program [5]. All of these are built on HACCP, the same hazard-based system used across the food industry.' }]),
      bullet([{ text: 'Welfare audits: ', bold: true }, { text: 'These confirm your birds are cared for properly. The Chicken Farmers of Canada Animal Care Program [2], and the animal care programs run by the egg and turkey sectors, check that housing, feeding, handling, and catching all meet the NFACC Code of Practice [3]. Mortality, lameness, and how birds are caught and loaded all get looked at.' }]),
      bullet([{ text: 'Certification audits: ', bold: true }, { text: 'Some certifications tie your food safety and welfare results together into a single mark. On egg farms, passing both Start Clean-Stay Clean and the Animal Care Program earns Egg Quality Assurance certification [6], which is what lets those eggs carry the EQA logo at retail.' }]),
      bullet([{ text: 'Regulatory inspections: ', bold: true }, { text: 'These come from government rather than your board. The Canadian Food Inspection Agency sets the National Avian On-Farm Biosecurity Standard [7] and can inspect a farm directly, especially during a disease outbreak, a trace-back, or a food safety recall. Provincial agencies may inspect for environmental rules, deadstock disposal, or labor safety.' }]),
      bullet([{ text: 'Company or buyer audits: ', bold: true }, { text: 'Your processor, hatchery, or a retail customer may run its own audit on top of the national program. It is usually the same barn and the same records, with a few extra boxes specific to that buyer.' }]),

      h2('1.3 The Purpose and Benefits of Audits'),
      para('It is easy to see an audit as red tape. But step back and the system makes sense. In Canada, most poultry programs are national in design but delivered locally. Your provincial marketing board, such as the BC Chicken Marketing Board, schedules the audit, trains the auditors, and tracks your corrective actions [8]. The rules are set nationally so a chicken raised in British Columbia is held to the same standard as one raised in Ontario or Nova Scotia. That consistency is what lets the whole industry tell buyers and the public, with one voice, that Canadian poultry is safe and well cared for.'),
      ...image(figBuf('fig16_1.png'), 'Figure 1.1: The layers of oversight on a Canadian poultry farm. The rules are set nationally, delivered and audited by your provincial board, with the federal regulator and your buyers adding their own checks. Source: CPC Short Courses.'),
      para('The audit also protects you directly. It is the proof behind your product. When a grocery chain or an export market asks how Canadian farmers can guarantee safe, humanely raised birds, the answer is the audited on-farm program every registered farmer follows. Without it, every farm would have to prove itself on its own, and one bad operator could drag down the price everyone gets.'),
      para('There is a quieter benefit too. A good audit is a free second set of eyes on your operation. An experienced auditor walks dozens of barns a year and will spot the water line you stopped noticing, the records gap that could bite you later, or the rodent activity creeping in along the back wall. Farmers who treat the audit as a checkup instead of a hurdle tend to run tighter, more profitable barns. The same records that satisfy an auditor, including mortality, feed use, water use, and medication, are the numbers that tell you how your flock is really doing.'),
    ],
  };
}

// ---- Section 2 ----
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 2: Key Areas Audited'),
      para('Almost every poultry audit, no matter who runs it, covers the same six areas. Learn these six and you know where to look on your own farm. If you can show a clean record and a working routine in each one, you will pass nearly any audit you face.'),
      ...image(figBuf('fig16_2.png'), 'Figure 2.1: The six areas every poultry auditor checks. Each one combines something the auditor sees in the barn with something they read in your records. Source: CPC Short Courses.'),

      h2('2.1 Biosecurity'),
      para('Biosecurity is usually the first thing an auditor looks at, because it starts before they even reach the barn. They will watch how you control who and what comes onto the farm. Expect them to check your farm entry setup: a clear line between the dirty outside and the clean barn side, a working footbath or boot-change station, dedicated barn boots and coveralls, and an anteroom where people change before stepping in with the birds. They will ask for your visitor log and look at whether it is actually filled in, not blank for the last three months.'),
      para('They will also look for the things that let disease walk in: gaps under doors, feed spills drawing in wild birds, standing water, rodent bait stations that are empty or missing, and bird-proofing on air inlets. The Canadian Food Inspection Agency National Avian On-Farm Biosecurity Standard frames all of this around two ideas: exclusion, keeping disease off the farm, and containment, stopping it from spreading if it does get in [7]. An auditor is really just checking whether your daily habits deliver those two things. Because biosecurity is the backbone of the whole audit, it is worth knowing in depth. For the full set of protocols, from line-of-separation design to disinfectant selection and PPE, see Course 2 (Biosecurity) in this series.'),

      h2('2.2 Flock Health and Welfare'),
      para('Here the auditor is confirming your birds are healthy and treated humanely, and that you can prove it. The single most important document is your daily mortality record. They will want to see dead birds counted and logged every day, with notes when something jumps. A barn with no mortality record, or one filled in all at once in the same pen, is a red flag.'),
      para('They will check your vaccination records against what should have been given, look at how sick and lame birds are handled, and confirm you have a humane way to deal with culls. Catching and loading get attention too, since rough handling shows up as bruising and downgrades at the plant. The CPC Learning Centre Spotting Disease Early guide makes the same point an auditor is checking for: walking the barn every day with your eyes, ears, and nose catches problems while they are still small, and the daily record is where that walk gets written down [9]. For the full disease profiles behind the conditions an auditor may ask about, see Course 7 (Common Poultry Diseases) in this series.'),

      h2('2.3 Housing and Environment'),
      para('This is the part of the audit that happens by feel as much as by paper. The auditor walks in and reads the barn the way an experienced grower does. Is the air fresh or is there an ammonia bite at bird level? Is the litter dry and friable, or wet and capped? Is the light even down the length of the barn? Are birds spread out comfortably or packed and panting?'),
      para('Behind those impressions are specific checks. Ventilation has to deliver fresh air without chilling or overheating the flock. Litter has to be kept dry enough to protect foot health. Lighting has to meet the program intensity and the required dark period. And stocking density has to stay within the limit for your program, which is why density and high-density monitoring are among the most common things auditors flag [8]. Your temperature and environment records back all of this up. For a complete daily framework covering temperature, litter, air, light, and space, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),

      h2('2.4 Feed and Water Management'),
      para('Birds eat and drink all day, so feed and water are squarely in the audit. On feed, the auditor checks that it is stored clean and dry, kept away from rodents and wild birds, and that medicated feed is labeled and recorded so it cannot end up in the wrong flock. Feed records and tags need to match what went into the birds.'),
      para('On water, the big one is the annual water test. Testing your water at least once a year, and keeping the result on file, is one of the most commonly missed requirements on Canadian poultry farms [8]. The CPC Learning Centre Drinking Water Management guide explains why this matters beyond the audit: water is the largest single thing birds consume, and dirty lines or poor-quality water quietly drag down intake, gut health, and growth [10]. The auditor will also look at drinker access, line cleaning between flocks, and whether birds at the far end of the barn get the same water as those near the header.'),

      h2('2.5 Record-Keeping'),
      para('If biosecurity is what an auditor sees, records are what they read, and this is where most audits are won or lost. A clean barn with no paperwork still fails. The records they expect are the ones you should be keeping anyway to run the place: daily mortality, feed and water use, flock performance, barn temperature, and every treatment and medication given.'),
      para('Medication records get special attention. Every antimicrobial used, the reason, the dose, and the withdrawal time before shipping all have to be written down. This ties directly into the Chicken Farmers of Canada Responsible Antimicrobial Use Strategy, the industry plan that has already removed the preventive use of the antibiotics most important to human medicine and keeps pushing use down [11]. An auditor checks that your treatment log is complete and that nothing shipped before its withdrawal time was up. The CPC Learning Centre Spotting Disease Early guide reinforces the habit that makes these records easy: write it down the same day, every day, rather than trying to reconstruct a month from memory [9].'),

      h2('2.6 Safety and Compliance'),
      para('The last area is about running a safe, compliant operation for the people and the surroundings, not just the birds. The auditor will look at personal protective equipment being available and used, and at how chemicals are stored. Disinfectants, pesticides, and medications need to be labeled, kept in their original containers, and stored away from feed. They will check how you handle and dispose of deadstock, since improper deadstock disposal is both a biosecurity risk and a regulatory one. Pesticide application, fuel and propane handling, and basic staff training round out this area. None of it is complicated, but it is easy to let slide, and it is exactly the kind of thing an outside set of eyes will catch.'),
    ],
  };
}

// ---- Section 3 ----
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 3: Preparing for an Audit'),
      para('Preparing for an audit is not about cleaning up for one big day. It is about running a quick self-check far enough ahead that you have time to fix what you find. Do this a few weeks out, not the night before. Small problems are cheap and easy to fix with time on your side. The same problems found on audit day become deficiencies on your report.'),
      ...image(figBuf('fig16_3.png'), 'Figure 3.1: A simple pre-audit self-check. Pull your records, walk the barn the way an auditor would, fix what you find, and make sure every job has an owner. Source: CPC Short Courses.'),

      h2('3.1 Reviewing Records and Documentation'),
      para('Start at the desk, because records are where audits are most often lost. Pull out your binder or open your farm app and flip through the last twelve months. You are looking for gaps: days with no mortality count, a water test that is more than a year old, a treatment that was given but never logged, a vaccination record that does not match the program. Every blank is a question you would rather answer now than in front of an auditor.'),
      para('Make sure the core records are present and current: daily mortality, feed and water use, flock performance, barn temperature and environment, vaccination, full medication and treatment logs, your annual water test, and your shipping and receiving slips. If a record is missing and the event already happened, do not invent it. Note honestly that it was not recorded and fix the habit going forward. An auditor respects an honest gap far more than a record that looks too neat to be real.'),

      h2('3.2 Conducting Internal Pre-Audit Checks'),
      para('Now leave the desk and walk the barn the way the auditor will. Start at the road and move inward, because that is the path disease and the auditor both take. Stop at the entrance: is the footbath fresh, are the dedicated boots there, is the visitor log filled in? Move through the anteroom and into the barn. Check the air, the litter, the light, the feed lines, the drinkers, the density, the dead-bird area, and the chemical store.'),
      para('The trick is to walk it with fresh eyes. We all go barn-blind to the things we pass every day. One good way around it is to swap farms with a neighbor and check each other, or have your CPC service rep do a mock audit before the real one. They will see the empty bait station and the cracked footbath that you have stopped noticing. Write down everything you find, exactly as an auditor would, so you have a punch list to work through.'),

      h2('3.3 Fixing Common Deficiencies Before Inspection'),
      para('Most farms trip on the same handful of things, so check these first. Across Canadian poultry farms, the most common corrective actions year after year are a short, predictable list [8]:'),
      bullet('Annual water testing not done or out of date. Book the test now and file the result. This is the single most commonly missed item.'),
      bullet('Stocking density and high-density monitoring. Make sure your density math is current and documented, and that any high-density monitoring required by your program is being done and recorded.'),
      bullet('Barn and yard maintenance and rodent control. Tidy the perimeter, close gaps, and get bait stations stocked, mapped, and logged.'),
      bullet('Medicated feed and cross-contamination. Confirm medicated feed is labeled, recorded, and handled so it cannot reach the wrong flock, and that bins and lines are flushed when switching feeds.'),
      para('Work through your punch list and close out what you can before audit day. For anything you cannot fix in time, such as a structural repair that needs a contractor, have a written plan with a date. Walking the auditor to a known problem and showing them the dated repair plan is far better than having them discover it cold.'),

      h2('3.4 Assigning Responsibilities to Farm Staff'),
      para('On a one-person farm, you wear every hat and you know where everything is. On a farm with staff, an audit can fall apart simply because nobody knew who was supposed to keep the visitor log or stock the bait stations. Fix that before the audit by giving every job an owner. One person owns the records, one owns biosecurity and the entry, one owns the daily barn walk, and one is the point person who hosts the auditor.'),
      para('Make sure everyone knows the basics of the program, not just their own corner. An auditor may ask the person catching birds how they handle a lame bird, or ask a barn hand where the chemicals are stored. Answers like that show the program is lived on your farm, not just written in a binder. A short team huddle before audit week, walking through who does what and what the auditor will ask, pays off more than any last-minute cleanup.'),
    ],
  };
}

// ---- Section 4 ----
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 4: During the Audit'),
      para('If you have done the prep, audit day is the easy part. Your job now is to host the auditor well, give them clear and honest information, show them your barn and your records, and answer questions calmly. None of that requires a perfect farm. It requires an organized one and a straight answer.'),

      h2('4.1 Hosting Inspectors Professionally'),
      para('Treat the auditor as a professional doing a necessary job, because that is what they are. Be there at the agreed time, have your records pulled and ready, and have your dedicated boots and coveralls set out for them at the entry. Respect your own biosecurity rules with them watching: if everyone changes boots and signs the log to enter, you do it too. Hosting the audit smoothly tells the auditor, before they read a single page, that this is a well-run farm.'),
      para('Keep it businesslike and cooperative. You do not need to hover, argue, or oversell. Walk them through what they ask to see, answer plainly, and let the farm speak for itself. Auditors notice the tone of a visit, and a calm, organized host makes the whole day go faster for both of you.'),

      h2('4.2 Providing Clear and Accurate Information'),
      para('When the auditor asks for a record, give them that record, not a story around it. Clear, accurate, and honest is the rule. If your mortality spiked one week because of a heat event, show the record and say so. Auditors deal in facts and they have seen real farms with real problems. A documented problem that you handled well looks far better than a suspiciously perfect record.'),
      para('Never guess and never make something up to fill a gap. If you do not know an answer, say you will find out, and then find out. If a record is missing, say it is missing. The fastest way to turn a routine audit into a hard one is to give an answer that does not hold up, because then the auditor starts wondering what else does not hold up.'),

      h2('4.3 Demonstrating Procedures and Practices'),
      para('Auditors do not just read about your practices. Sometimes they want to see them. You might be asked to show how you mix a footbath, how you handle and examine a bird, how you check a sick bird, or how you record a treatment. The point is to confirm that the written procedure is the real procedure.'),
      para('This is easy when your paperwork describes what you actually do. The trap is having a fancy written protocol that nobody follows. If your records say footbaths are refreshed daily, you should be able to show fresh footbath solution and the staff member who changes it. Keep your written procedures honest and simple enough that they match daily life in the barn, and demonstrations take care of themselves.'),

      h2('4.4 Addressing Questions Calmly and Accurately'),
      para('Some questions will feel like a test. They are not. The auditor is filling in their checklist, and they often have to ask the question even when the answer is obvious. Stay calm, listen to what is actually being asked, and answer that question rather than the one you feared.'),
      para('If you disagree with something the auditor observes, it is fine to say so respectfully and show your evidence. Audits have a process for noting disagreements, and a calm, fact-based response is part of a normal audit, not a fight. What does not help is getting defensive or treating the auditor as the enemy. Remember the auditor does not set your score out of spite. They record what they find against the standard, and a measured answer with a record to back it up is your best tool.'),
    ],
  };
}

// ---- Section 5 ----
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 5: After the Audit'),
      para('The audit is not over when the auditor drives away. What you do with the report is what turns an audit from a yearly hurdle into a tool that makes your farm better. Most of the value is in the follow-up.'),
      ...image(figBuf('fig16_4.png'), 'Figure 5.1: The corrective action loop. Read the report, get a deadline for each item, fix it for real, show proof, and keep it fixed so it cannot come back. Source: CPC Short Courses.'),

      h2('5.1 Understanding Audit Reports'),
      para('Your audit report tells you one of two things: you passed clean, or you passed with a list of corrective actions to close out. A corrective action request, often shortened to a CAR, is the auditor saying that something did not meet the standard and here is what needs fixing. Most CARs are small and routine. They are not a punishment, and getting a couple of them does not mean you failed.'),
      para('Read the report carefully and make sure you understand each item and its deadline. Some programs also require a minimum overall score along with closing out every critical item. On egg farms, for example, the Start Clean-Stay Clean food safety audit requires meeting all critical control elements and reaching at least a 90 percent score to keep Egg Quality Assurance certification [4,6]. If anything in the report is unclear, call your provincial board or your service rep before the clock runs out. It is far better to ask than to guess and miss the deadline.'),

      h2('5.2 Implementing Corrective Actions'),
      para('Every corrective action comes with a deadline, so the first job is to sort them by what is due soonest and what carries the most risk. A missing water test you can close in a week. A ventilation upgrade may take longer and need a plan with a date. Either way, do not just paper over the issue. Fix the thing that caused it.'),
      para('There is a real difference between fixing a problem for the day and fixing it for good. If the CAR was an empty bait station, restocking it closes the item, but building bait-station checks into your weekly routine is what keeps it closed. When you report a corrective action as complete, you usually need to show proof: a photo, a receipt, a lab result, or an updated record. Keep that proof with your audit file so the next audit can see the issue was handled and stayed handled.'),

      h2('5.3 Continuous Improvement and Preparation for Future Audits'),
      para('The farmers who find audits easiest are the ones who never really stop preparing. Each audit report is a free map of your weak spots. If the same kind of CAR keeps showing up year after year, that is the part of your operation to rebuild, not just patch. A repeat finding is a sign that the fix never became a habit.'),
      para('The smartest move after an audit is to fold its lessons straight into your daily and weekly routines. That way the work that keeps you compliant becomes ordinary, not a special project you mount once a year. An audit handled this way makes the next one easier, and the one after that easier still. Over time the audit stops being something that happens to you and becomes something your farm is simply always ready for.'),
    ],
  };
}

// ---- Section 6 ----
function buildSection6() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 6: Practical Tips for Staying Audit-Ready'),
      para('Everything in this course comes down to one idea: a farm that is run well every day is a farm that is ready for an audit any day. The tips below are the practical habits that get you there, so the audit never catches you off guard.'),

      h2('6.1 Daily Routines That Maintain Audit Readiness'),
      para('Audit readiness is built one ordinary day at a time. The daily barn walk is the center of it. The CPC Learning Centre Spotting Disease Early guide describes the walk well: go through the barn every day using your eyes, ears, and nose, and write down what you see while you are seeing it [9]. That single habit feeds your mortality record, your environment notes, and your early-warning system all at once.'),
      para('Wrap a few more habits around that walk. Record mortality the same day, every day. Keep the visitor log at the door and actually use it. Refresh the footbath on schedule. Glance at your water and feed meters and note anything odd. Keep the chemical store tidy as you go. None of these take more than a few minutes, and together they mean your records are never behind and your barn is never more than a day from audit-ready. The same routine is the core of systematic daily monitoring covered in Course 3 (T-FLAWS Assessment Management Tool) in this series.'),

      h2('6.2 Checklists for Record-Keeping, Hygiene, and Welfare'),
      para('A simple checklist turns good intentions into something that actually gets done. You do not need anything fancy. A laminated sheet at the barn door or a few standing reminders in your farm app will do. Build short checklists around the three things audits care about most.'),
      bullet([{ text: 'Records checklist: ', bold: true }, { text: 'mortality logged daily, treatments and medications recorded with dose and withdrawal, feed and water use noted, water test current within the year, shipping and receiving slips filed.' }]),
      bullet([{ text: 'Hygiene and biosecurity checklist: ', bold: true }, { text: 'footbath fresh, dedicated boots and coveralls in place, visitor log filled in, entry clean, bait stations stocked and logged, feed spills cleaned up.' }]),
      bullet([{ text: 'Welfare checklist: ', bold: true }, { text: 'daily barn walk done, sick and lame birds handled and culled humanely, density within limit, litter dry, air and light right for the birds age.' }]),
      para('Run the checklists on a set rhythm: some items daily, some weekly, the water test yearly. When the checklist is part of the routine, the pre-audit self-check in Section 3 turns into a quick confirmation instead of a frantic catch-up.'),

      h2('6.3 Staff Training and Accountability'),
      para('On any farm with more than one set of hands, the audit reflects the whole team, not just the owner. The farm is only as audit-ready as the person who skips the footbath or forgets to log a treatment. That is why a little training and clear accountability go a long way. Everyone who works in the barn should know the basics of the program and exactly which records and routines they are responsible for.'),
      para('Keep it practical. A short walkthrough when someone is hired, a quick refresher before audit season, and clear ownership of each task is usually enough. Write down who is responsible for what, so there is no confusion on a busy morning. When every person knows their part and knows it matters, audit readiness stops depending on the owner remembering everything and becomes something the whole farm carries together. That is the real goal: not passing one audit, but running a barn that is always ready for the next.'),
    ],
  };
}

// ---- Journals ----
function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para('The following journals publish current research on poultry health, welfare, food safety, and on-farm management. They are good sources for farmers, service reps, and veterinarians who want to stay current with the science behind the programs they are audited under:'),
      bullet([{ text: 'Poultry Science ', bold: true, italics: true }, { text: '(Elsevier / Poultry Science Association): broad research on commercial poultry nutrition, management, housing, and welfare.' }]),
      bullet([{ text: 'Journal of Applied Poultry Research ', bold: true, italics: true }, { text: '(Poultry Science Association): applied, on-farm studies on management practices, food safety, and production.' }]),
      bullet([{ text: 'Avian Diseases ', bold: true, italics: true }, { text: '(American Association of Avian Pathologists): poultry disease, biosecurity, and diagnostic research.' }]),
      bullet([{ text: 'Canadian Veterinary Journal ', bold: true, italics: true }, { text: '(Canadian Veterinary Medical Association): Canadian veterinary practice, disease surveillance, and food-animal welfare.' }]),
    ],
  };
}

// ---- References ----
function buildReferencesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('References'),
      para('References are listed in order of first appearance in the text. Sources are the national on-farm assurance programs, regulatory standards, recognized industry bodies, and the CPC Learning Centre.'),
      numberedRef('Chicken Farmers of Canada. Raised by a Canadian Farmer On-Farm Food Safety Program. Ottawa: Chicken Farmers of Canada; [cited 2026 Jun]. Available from: chickenfarmers.ca'),
      numberedRef('Chicken Farmers of Canada. Raised by a Canadian Farmer Animal Care Program. Ottawa: Chicken Farmers of Canada; [cited 2026 Jun]. Available from: chickenfarmers.ca'),
      numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys. Ottawa: NFACC; 2016 [cited 2026 Jun]. Available from: nfacc.ca'),
      numberedRef('Egg Farmers of Canada. Start Clean-Stay Clean on-farm food safety program. Ottawa: Egg Farmers of Canada; [cited 2026 Jun]. Available from: eggfarmers.ca'),
      numberedRef('Turkey Farmers of Canada. On-Farm Food Safety Program and Flock Care Program. Ottawa: Turkey Farmers of Canada; [cited 2026 Jun]. Available from: turkeyfarmersofcanada.ca'),
      numberedRef('Egg Quality Assurance (EQA). Trust in every egg: the EQA certification mark. [cited 2026 Jun]. Available from: eggquality.ca'),
      numberedRef('Canadian Food Inspection Agency. National Avian On-Farm Biosecurity Standard. 2nd ed. Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('British Columbia Chicken Marketing Board. Public Accountability Report. Abbotsford, BC: BCCMB; [cited 2026 Jun]. Available from: bcchicken.ca'),
      numberedRef('Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
      numberedRef('Leslie M. Drinking Water Management [Flock Management Guide]. CPC Learning Centre; 2011. Available from: cpclearningcentre.ca'),
      numberedRef('Chicken Farmers of Canada. Responsible Antimicrobial Use Strategy. Ottawa: Chicken Farmers of Canada; [cited 2026 Jun]. Available from: chickenfarmers.ca'),
    ],
  };
}

// ---- styles ----
function buildStyles() {
  return {
    default: { document: { run: { font: 'Calibri', size: 24, color: BODY_GRAY }, paragraph: { spacing: { after: 160, line: 276, lineRule: 'auto' } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 36, bold: true, color: DARK_BLUE },
        paragraph: { spacing: { before: 480, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 30, bold: true, color: MED_BLUE },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 26, bold: true, italics: true, color: MED_BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
    ],
  };
}

// ---- numbering ----
function buildNumbering() {
  return {
    config: [
      { reference: 'bullet-list', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(1.0), hanging: convertInchesToTwip(0.25) } } } },
      ] },
      { reference: 'references-list', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
      ] },
    ],
  };
}

// ---- build ----
async function main() {
  console.log('Building Course 16: Preparing for an Inspection Audit...');
  const doc = new Document({
    creator: 'CPC Short Courses',
    title: COURSE_TITLE,
    description: 'Course 16 — CPC Short Courses',
    features: { updateFields: false },
    styles: buildStyles(),
    numbering: buildNumbering(),
    sections: [
      buildCoverSection(),
      buildIntroSection(),
      buildSection1(),
      buildSection2(),
      buildSection3(),
      buildSection4(),
      buildSection5(),
      buildSection6(),
      buildJournalSection(),
      buildReferencesSection(),
    ],
  });

  let buffer = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);

  // settings.xml — disable auto field update
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!settings.includes('<w:updateFields')) {
    settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  }
  zip.file('word/settings.xml', settings);

  let docXml = await zip.file('word/document.xml').async('string');
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  const entriesWithAnchor = [
    { lvl: 1, text: 'Introduction', page: 3 },
    { lvl: 2, text: 'Learning Objectives', page: 3 },
    { lvl: 1, text: 'Section 1: Understanding Audits', page: 4 },
    { lvl: 2, text: '1.1 What Is an Inspection Audit?', page: 4 },
    { lvl: 2, text: '1.2 Types of Audits: Regulatory, Company, Certification, Welfare, and Food Safety', page: 4 },
    { lvl: 2, text: '1.3 The Purpose and Benefits of Audits', page: 5 },
    { lvl: 1, text: 'Section 2: Key Areas Audited', page: 7 },
    { lvl: 2, text: '2.1 Biosecurity', page: 7 },
    { lvl: 2, text: '2.2 Flock Health and Welfare', page: 8 },
    { lvl: 2, text: '2.3 Housing and Environment', page: 8 },
    { lvl: 2, text: '2.4 Feed and Water Management', page: 9 },
    { lvl: 2, text: '2.5 Record-Keeping', page: 9 },
    { lvl: 2, text: '2.6 Safety and Compliance', page: 10 },
    { lvl: 1, text: 'Section 3: Preparing for an Audit', page: 11 },
    { lvl: 2, text: '3.1 Reviewing Records and Documentation', page: 11 },
    { lvl: 2, text: '3.2 Conducting Internal Pre-Audit Checks', page: 12 },
    { lvl: 2, text: '3.3 Fixing Common Deficiencies Before Inspection', page: 12 },
    { lvl: 2, text: '3.4 Assigning Responsibilities to Farm Staff', page: 13 },
    { lvl: 1, text: 'Section 4: During the Audit', page: 14 },
    { lvl: 2, text: '4.1 Hosting Inspectors Professionally', page: 14 },
    { lvl: 2, text: '4.2 Providing Clear and Accurate Information', page: 14 },
    { lvl: 2, text: '4.3 Demonstrating Procedures and Practices', page: 15 },
    { lvl: 2, text: '4.4 Addressing Questions Calmly and Accurately', page: 15 },
    { lvl: 1, text: 'Section 5: After the Audit', page: 16 },
    { lvl: 2, text: '5.1 Understanding Audit Reports', page: 16 },
    { lvl: 2, text: '5.2 Implementing Corrective Actions', page: 16 },
    { lvl: 2, text: '5.3 Continuous Improvement and Preparation for Future Audits', page: 17 },
    { lvl: 1, text: 'Section 6: Practical Tips for Staying Audit-Ready', page: 18 },
    { lvl: 2, text: '6.1 Daily Routines That Maintain Audit Readiness', page: 18 },
    { lvl: 2, text: '6.2 Checklists for Record-Keeping, Hygiene, and Welfare', page: 18 },
    { lvl: 2, text: '6.3 Staff Training and Accountability', page: 19 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals', page: 20 },
    { lvl: 1, text: 'References', page: 21 },
  ].map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));

  function escapeXml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tocRow(e) {
    const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
    const indent = e.lvl === 1 ? '' : '<w:ind w:left="440"/>';
    const text = escapeXml(e.text);
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
  const tocEntries = entriesWithAnchor.map(tocRow).join('');
  const sepTag = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx = docXml.indexOf(sepTag);
  if (sepIdx !== -1) {
    const endIdx = docXml.indexOf(endTag, sepIdx);
    if (endIdx !== -1) docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
  }

  {
    let entryIdx = 0, bookmarkId = 1000;
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
      console.warn(`Course 16 TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length}. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
    }
  }

  let stylesXml = await zip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    const tocStyles =
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="440"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
    stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
    zip.file('word/styles.xml', stylesXml);
  }

  const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
  if (dirtyLeft > 0) throw new Error(`Still ${dirtyLeft} w:dirty flags — dialog will appear`);
  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found)`);

  // em-dash / en-dash guard for body
  const emEn = (docXml.match(/[—–]/g) || []).length;
  if (emEn > 0) console.warn(`WARNING: ${emEn} em/en dash characters found in document.xml`);

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE);
  console.log('Size:', (buffer.length / 1024).toFixed(1), 'KB');
}

main().catch(err => { console.error(err); process.exit(1); });
