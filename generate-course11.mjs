// ============================================================
// generate-course11.mjs — Course 11: Necropsy of Common Diseases
// CPC Short Courses
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course11.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
  Header, Footer, PageNumber, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, convertInchesToTwip,
  HeadingLevel, TableOfContents, ImageRun, LevelFormat,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR    = path.join(__dirname, 'Course 11');
const OUT_FILE   = path.join(OUT_DIR, 'Necropsy_Common_Diseases_draft.docx');
const LOGO_PATH  = path.join(__dirname, 'logo.png');

const COURSE_TITLE   = 'Necropsy of Common Diseases';
const COURSE_NUMBER  = '11';

// COLORS
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

// HELPERS
function run(text, opts = {}) {
  return new TextRun({
    text, bold: opts.bold || false, italics: opts.italics || false,
    color: opts.color || BODY_GRAY, size: opts.size || 24, font: 'Calibri',
    subScript: opts.subScript || false, superScript: opts.superScript || false,
  });
}
// Latin binomial italicization. Longer/multiword names listed first so the
// regex matches the full binomial before the bare genus.
const SPECIES_RE = /(Mycoplasma gallisepticum|Mycoplasma synoviae|Pasteurella multocida|Clostridium perfringens|Ascaridia galli|Heterakis gallinarum|Histomonas meleagridis|Aspergillus fumigatus|Eimeria maxima|Eimeria tenella|Eimeria acervulina|Eimeria necatrix|Eimeria brunetti|E\. coli|E\. tenella|E\. acervulina|E\. maxima|E\. necatrix|E\. brunetti|Eimeria|Clostridium|Mycoplasma|Pasteurella|Salmonella|Campylobacter|Capillaria|Enterococcus|Aspergillus)/g;
// Split a text segment into runs, italicizing any Latin species names while
// preserving the segment's existing bold/italics/color/size.
function splitSci(text, base = {}) {
  const out = []; let last = 0; let m; SPECIES_RE.lastIndex = 0;
  while ((m = SPECIES_RE.exec(text))) {
    if (m.index > last) out.push({ ...base, text: text.slice(last, m.index) });
    out.push({ ...base, text: m[0], italics: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ ...base, text: text.slice(last) });
  if (out.length === 0) out.push({ ...base, text });
  return out;
}
// Expand a string or array of segments into TextRuns, auto-italicizing species.
function sciRuns(text, defaultSize = 24, baseOpts = {}) {
  const segs = Array.isArray(text)
    ? text.flatMap(s => splitSci(s.text, { bold: s.bold || false, italics: s.italics || false, color: s.color || BODY_GRAY, size: s.size || defaultSize }))
    : splitSci(text, { bold: baseOpts.bold || false, italics: baseOpts.italics || false, color: baseOpts.color || BODY_GRAY, size: baseOpts.size || defaultSize });
  return segs.map(s => new TextRun({ text: s.text, bold: s.bold || false, italics: s.italics || false, color: s.color || BODY_GRAY, size: s.size || defaultSize, font: 'Calibri' }));
}

function para(text, opts = {}) {
  const children = sciRuns(text, 24, { bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size });
  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent: opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}
function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } });
}
function bullet(text, lvl = 0) {
  const children = sciRuns(text, 24);
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}
function numberedRef(text) {
  return new Paragraph({
    children: sciRuns(text, 24),
    numbering: { reference: 'references-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }
function spacer(after = 120) { return new Paragraph({ children: [run('')], spacing: { after } }); }

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}
function jpegDims(buf) {
  let i = 2;
  while (i < buf.length - 10) {
    if (buf[i] !== 0xFF) break;
    const marker = buf[i + 1];
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) return { h: (buf[i+5]<<8)|buf[i+6], w: (buf[i+7]<<8)|buf[i+8] };
    const segLen = (buf[i+2]<<8)|buf[i+3];
    i += 2 + segLen;
  }
  return null;
}
function image(buf, caption, widthIn = 5.9) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.6);
  const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
  const type   = isJpeg ? 'jpg' : 'png';
  try {
    if (isJpeg) {
      const d = jpegDims(buf);
      if (d && d.w > 0 && d.h > 0) hpx = Math.round(wpx * d.h / d.w);
    } else {
      const view = new DataView(buf.buffer, buf.byteOffset);
      const pw = view.getUint32(16, false), ph = view.getUint32(20, false);
      if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
    }
  } catch (_) {}
  return [
    new Paragraph({ children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type })], alignment: AlignmentType.CENTER, spacing: { before: 160, after: 0 } }),
    new Paragraph({ children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 } }),
  ];
}

// HEADER / FOOTER
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

// CALLOUT BOX
function callout(label, text, bgColor = 'EBF2FA', borderColor = MED_BLUE) {
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        children: [
          new Paragraph({ children: [new TextRun({ text: label, bold: true, color: borderColor, size: 22, font: 'Calibri' })], spacing: { before: 60, after: 60 } }),
          new Paragraph({ children: [new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' })], spacing: { before: 0, after: 60 }, alignment: AlignmentType.JUSTIFIED }),
        ],
        shading: { type: ShadingType.SOLID, color: bgColor },
        borders: { top: bdr, bottom: bdr, left: { style: BorderStyle.SINGLE, size: 16, color: borderColor }, right: bdr },
        margins: { top: convertInchesToTwip(0.1), bottom: convertInchesToTwip(0.1), left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
      })],
    })],
  });
}

// COVER
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const children   = [new Paragraph({ children: [run('')], spacing: { before: 1440, after: 0 } })];
  children.push(new Paragraph({
    children: [new TextRun({ text: `COURSE ${COURSE_NUMBER}: CPC SHORT COURSES`, bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 },
  }));
  if (logoBuffer) {
    let lw = 144, lh = 144;
    try { const v = new DataView(logoBuffer.buffer, logoBuffer.byteOffset); const pw = v.getUint32(16,false), ph = v.getUint32(20,false); if (pw>0&&ph>0) lh=Math.round(lw*ph/pw); } catch(_){}
    children.push(new Paragraph({ children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }));
  }
  children.push(
    new Paragraph({ children: [new TextRun({ text: COURSE_TITLE, bold: true, color: DARK_BLUE, size: 52, font: 'Calibri Light' })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Reading Disease Lesions at the Necropsy Table', color: MED_BLUE, size: 26, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 560 } }),
    new Paragraph({ children: [run('')], alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } }, spacing: { before: 0, after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 24, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'Duration: 1-Hour Lecture, 1-Hour Workshop', color: '595959', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'Prerequisite: Courses 7 (Common Poultry Diseases) and 10 (Necropsy of Normal Birds)', color: '595959', size: 22, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'June 2026', color: '595959', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: 'Disclaimer: This course is intended for educational purposes only. Necropsy and diagnosis are the work of a licensed veterinarian or pathologist, and this material does not replace their advice, diagnosis, or treatment. Always handle dead birds and tissues under your farm biosecurity plan, and consult your veterinarian for flock health decisions.', color: '888888', size: 18, font: 'Calibri', italics: true })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 0 } }),
  );
  return { properties: { page: { margin: pageMargin } }, headers: { default: buildHeader() }, footers: { default: buildFooter() }, children };
}

// DISEASE LESION TABLE
function lesionTable(headers, rows) {
  const colW  = headers.map(() => Math.floor(8640 / headers.length));
  const hdrBg = MED_BLUE;
  const altBg = 'EBF2FA';
  const bdr   = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cb    = { top: bdr, bottom: bdr, left: bdr, right: bdr };
  const hdrCell = (t, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA }, borders: cb,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: sciRuns(t, 18, { bold: true, color: 'FFFFFF' }) })],
  });
  const dataCell = (t, i, shade) => {
    const kids = sciRuns(t, 18);
    return new TableCell({
      width: { size: colW[i], type: WidthType.DXA }, borders: cb,
      shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
      children: [new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 50, after: 50 }, children: kids })],
    });
  };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((c, ci) => dataCell(c, ci, ri % 2 === 1)) })),
    ],
  });
}

// ============================================================
// DOCUMENT CHILDREN
// ============================================================
function buildBody() {
  const fig11_2_1 = figBuf('fig11_2_1.png');
  const fig11_1  = figBuf('fig11_1.png');
  const fig11_2  = figBuf('fig11_2.png');
  const fig11_3  = figBuf('fig11_3.png');
  const photoIBD = figBuf('photo_ibd_muscle_hemorrhage.jpg');
  const photoMar = figBuf('photo_mareks_cutaneous.jpg');
  const figEim   = figBuf('fig_eimeria_lifecycle_usda.jpg');
  const photoNE     = figBuf('photo_necrotic_enteritis.jpg');
  const photoBursa  = figBuf('photo_ibd_bursa.jpg');
  const photoND     = figBuf('photo_newcastle_proventriculus.jpg');
  const photoCocci  = figBuf('photo_coccidiosis_ceca.jpg');
  const photoChol   = figBuf('photo_fowl_cholera_liver.jpg');
  const organMap    = figBuf('chicken_systems_overview.jpeg');

  return [
    // TOC PAGE
    pageBreak(),
    new Paragraph({ text: 'Table of Contents', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 240 } }),
    new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-2', stylesWithLevels: [{ styleId: 'Heading1', level: 1 }, { styleId: 'Heading2', level: 2 }] }),
    pageBreak(),

    // ─── INTRODUCTION ───
    h1('Introduction'),
    para('A well-performed necropsy is one of the most useful early-warning tools on a commercial farm. Course 10 covered what a healthy bird looks like inside. This course covers what disease looks like: the specific lesions that help you recognize when something serious is moving through the flock, so you can describe what you see accurately and get the right birds and samples to your veterinarian fast.'),
    para('Be clear about one thing from the start. The necropsy and the diagnosis are your veterinarian\'s job, not the farmer\'s. Reading disease lesions and confirming what actually killed a bird takes years of training, hands-on experience, and laboratory backup that no farm has on its own. Many of these diseases look alike on the table, and several of the most serious ones are reportable, so the final call belongs to your veterinarian and the diagnostic laboratory. A full diagnostic necropsy also belongs in a dedicated necropsy room: an isolated, biosecure space built to keep pathogens away from your live birds. Whenever you can manage it, the right move is to send the dead birds or the samples to your veterinarian or the lab, or have your veterinarian come to the farm. What this course gives you is the trained eye to recognize when a lesion is serious, describe it accurately, and know when to stop and pick up the phone. That makes you a sharper partner for your veterinarian, not a replacement for one.'),
    para('Mortality spikes, production drops, poor feed conversion, birds that look wrong but are hard to pin down. Looking inside a few fresh birds often tells you within minutes whether you have a problem worth chasing. This course walks through the lesions associated with the most common bacterial, viral, parasitic, and metabolic diseases in broilers, layers, and breeders. You will also learn how to collect the right samples for the lab and how to turn what you find into the kind of clear report that helps your veterinarian reach a diagnosis quickly.'),
    para('Whether you are raising meat birds, layers, or breeders, early recognition of disease through the necropsy table can prevent large losses and give your veterinarian the information they need to act fast. For a full disease profile of each condition covered here, see Course 7 (Common Poultry Diseases) in this series.'),
    spacer(80),
    para('Learning Objectives', { bold: true }),
    bullet('Recognize abnormal lesions associated with major poultry diseases.'),
    bullet('Distinguish between bacterial, viral, parasitic, and nutritional lesions.'),
    bullet('Identify the most common disease indicators in meat birds, including airsacculitis, coccidiosis, and IBD.'),
    bullet('Identify the most common disease indicators in layers and breeders, including salpingitis, Marek\'s disease, and fatty liver syndrome.'),
    bullet('Collect appropriate tissue samples for diagnostic laboratory testing.'),
    bullet('Interpret necropsy findings alongside flock history and clinical signs.'),
    bullet('Turn necropsy findings into practical management actions, and work with your veterinarian on diagnosis and any treatment decisions.'),
    pageBreak(),

    // ─── SECTION 1 ───
    h1('1. Purpose of Necropsy in Disease Diagnosis'),
    h2('1.1  How Necropsy Supports Early Detection'),
    para('Watching a sick flock tells you something is wrong. A necropsy tells you what. Most disease processes leave distinct marks on organs, tissues, and body cavities that match a specific cause. Spotting those marks early gives you a head start on the problem and gives your veterinarian a concrete picture rather than a vague clinical description.'),
    para('Birds that die early in an outbreak often have the most acute and diagnostic lesions. As a disease runs its course, lesions become more complex, secondary infections pile on, and the picture gets harder to read. That is why the first few birds that die unexpectedly deserve an immediate necropsy rather than a trip to the mortality bin.'),
    para('The CPC Learning Centre Spotting Disease Early guide puts it directly: water consumption drops one to two days before feed intake falls, and observant farmers catch the warning before the flock goes downhill [1]. Necropsy is the follow-up step that confirms what you are seeing in the barn.'),

    h2('1.2  Linking Lesions to Flock History and Symptoms'),
    para('Lesions are most meaningful when you read them alongside flock history. A bird with fibrin wrapped around its heart means something different in a four-week-old broiler than in a 60-week-old layer. The same lesion in a flock that skipped its Marek\'s vaccination has a different weight than in a fully vaccinated flock. Always ask these questions before you start:'),
    bullet('What is the age of the bird and the flock?'),
    bullet('What is the mortality pattern? Sudden spike or slow chronic climb?'),
    bullet('What clinical signs did you observe before death? Respiratory, digestive, neurological, or production-related?'),
    bullet('What is the vaccination history and any recent farm events?'),
    bullet('What does the rest of the barn look like: feed and water intake, litter condition, ventilation, stocking density?'),
    para('Taking two minutes to think through these questions before you open the bird focuses your necropsy on what you are most likely to find.'),

    h2('1.3  When Necropsy Should Be Prioritized'),
    para('Not every dead bird needs a necropsy. But certain patterns demand one immediately:'),
    bullet('Mortality above 0.5% in a single day for a broiler flock, or any unexplained spike over baseline.'),
    bullet('Two or more consecutive days of rising mortality without a clear cause.'),
    bullet('Birds dying with unusual neurological signs: head shaking, star-gazing, circling, or wing paralysis.'),
    bullet('Sudden drop in feed or water intake without a management explanation.'),
    bullet('Any bird showing facial swelling, cyanosis of the comb and wattles, or hemorrhages on unfeathered skin. These are Avian Influenza red flags. Stop, call your veterinarian, and do not open the bird until you have guidance.'),
    bullet('Pre-slaughter weight checks that fall short: high coefficient of variation or poor uniformity often traces back to a disease event that necropsy can identify.'),
    para('Necropsying five to six fresh, acutely dead or recently euthanized birds gives you a representative picture of what is happening in the flock [1].'),
    pageBreak(),

    // ─── SECTION 2 ───
    h1('2. Preparation and Biosecurity'),
    h2('2.1  Tools and Safety Precautions'),
    para('A proper field necropsy kit contains: a sharp scalpel or sturdy scissors, bone cutters or poultry shears, forceps, a cutting board or plastic-lined surface, leak-proof sample bags, permanent marker and labels, gloves, and a face mask. For a full list of equipment, refer to Course 10 (Necropsy of Normal Birds) in this series.'),
    para('Biosecurity at the necropsy table protects you and your remaining flock. Several poultry diseases can infect humans: Salmonella, Campylobacter, and Avian Influenza all pose real risks when handling fresh carcasses. Wear gloves every time. A face mask and eye protection are good habits, especially for respiratory presentations where aerosols may carry pathogens. Dispose of carcasses and contaminated material in sealed bags to prevent attracting scavengers and spreading infectious material [2].'),
    para('This is exactly why your veterinarian works in a dedicated necropsy room: an isolated space set well apart from any live birds, built so nothing from a diseased carcass can travel back into a barn. On the farm you will not have that room. The next best thing is to pick a spot as far from your barns as you can manage, on a surface you can clean and disinfect, never inside or right beside a house full of live birds. Better still, whenever you can manage it, send the birds or the samples to your veterinarian or the diagnostic lab rather than opening them on the farm at all. The diagnosis is theirs to make, and they have the biosecure facilities, the science, and the laboratory tools to make it safely and correctly.'),
    para('Never perform a necropsy on a bird you suspect has Avian Influenza until you have contacted your veterinarian or the CFIA. The suspected-AI protocol is: isolate the barn, call your veterinarian, do not move birds, and wait for guidance before any further investigation.'),
    callout('CRITICAL RULE', 'If you see: dark cyanotic comb/wattles, hemorrhages on shanks or feet, birds dying peracutely with no other obvious cause: STOP. Do not open additional birds. Call your veterinarian immediately. Avian Influenza requires CFIA involvement before any on-farm diagnostic work proceeds.', 'FDECEA', 'C0504D'),
    spacer(120),

    h2('2.2  Selecting Appropriate Birds'),
    para('Select fresh-dead birds that died within the last two to four hours, or birds that are acutely ill and have been humanely euthanized. Avoid birds that have been dead overnight or in warm conditions; decomposition changes the appearance of organs quickly and makes lesion interpretation unreliable. If you must use a bird found dead in the morning, keep it refrigerated and perform the necropsy within a few hours.'),
    para('Choose birds that represent the flock\'s problem. If birds are dying from one area of the barn, open birds from that area. If the mortality is scattered, pick birds that show the clinical signs you are trying to investigate. Never select the biggest, healthiest-looking bird in the pen. The sick ones are the ones with the story you need.'),

    h2('2.3  Sample Handling for Laboratory Submission'),
    para('Good diagnostic results depend on good samples. When submitting to a provincial diagnostic laboratory:'),
    bullet('Send at least six live, clinically affected birds in addition to any carcasses. Labs prefer to perform their own necropsy on fresh birds. A dead bird in a bag shipped overnight gives much less information than a live bird that arrives at the lab.'),
    bullet('If sending fresh tissues: place them in sealed, leak-proof containers with ice packs. Refrigerate at 4 degrees Celsius, never freeze diagnostic samples. Freezing destroys histopathology and makes virus isolation difficult.'),
    bullet('For bacterial culture: collect intestinal contents, liver, and air sac swabs from multiple birds, keep them refrigerated, and ship overnight.'),
    bullet('For serology and virology: whole blood in a red-top tube (no anticoagulant) or tracheal/cloacal swabs in viral transport media.'),
    bullet('Include a detailed submission form: flock age, number of birds affected, mortality rate, clinical signs, vaccination history, and a copy of the mortality graph if you have one.'),
    para('The CFIA maintains a list of approved animal health diagnostic laboratories across Canada [3]. Your veterinarian will know which lab serves your region and what specific submission protocols apply.'),
    spacer(80),
    ...image(fig11_2_1, 'Figure 2.1: Laboratory sample submission guide showing which sample type, test method, and pathogen or condition each submission is designed to identify. Source: CPC Short Courses.', 5.9),
    pageBreak(),

    // ─── SECTION 3 ───
    h1('3. Overview of Common Necropsy Lesions'),
    h2('3.1  What Abnormal Findings Look Like'),
    para('Normal poultry organs are clean, well-defined, and consistent in color. Disease changes all of that. The table below gives you a quick orientation to what you are looking for across the major body systems. Sections 4 and 5 break these down by disease.'),
    spacer(80),
    lesionTable(
      ['Body System', 'Normal Appearance', 'Key Abnormal Signs', 'Common Causes'],
      [
        ['Air sacs', 'Clear, thin, invisible membranes', 'Cloudy, thickened, foamy, or caseous exudate', 'Colibacillosis, MG, IBV, ND'],
        ['Heart and pericardium', 'Clean surface, no excess fluid', 'White fibrin plaques on heart surface, excess fluid in pericardial sac', 'Colibacillosis, Fowl Cholera'],
        ['Liver', 'Firm, dark red-brown, no spots', 'Pale, friable, hemorrhagic, yellow spots, or swollen', 'Colibacillosis, IBH, FLHS, Fowl Cholera'],
        ['Small intestine', 'Thin wall, pink, content visible', 'Ballooned, friable, pseudomembrane, bloody content', 'Necrotic Enteritis, Coccidiosis'],
        ['Ceca', 'Light orange-brown content', 'Blood-filled, cecal cores of clotted blood', 'E. tenella coccidiosis'],
        ['Bursa of Fabricius', 'Firm, cream-colored, smooth', 'Enlarged and hemorrhagic (acute IBD) or shrunken (chronic)', 'IBD'],
        ['Kidneys', 'Dark red, smooth', 'Swollen, pale, urate deposits (chalky white tubules)', 'IBV renal form, IBD, dehydration'],
        ['Peripheral nerves (sciatic)', 'Uniform white, symmetric', 'Enlarged, asymmetric, loss of striations', "Marek's Disease"],
        ['Abdominal cavity', 'No free fluid', 'Yellow/orange fluid (yolk), straw-colored fluid (ascites), caseous material', 'Ascites, Egg Peritonitis'],
        ['Oviduct', 'Thin-walled, normal lumen', 'Caseous exudate, impacted with abnormal egg material', 'Salpingitis'],
      ]
    ),
    spacer(160),

    h2('3.2  Acute vs Chronic Disease Lesions'),
    para('Acute lesions look fresh and dramatic: bright red hemorrhages, yellow fibrin that peels off cleanly, swollen organs with clear borders. These birds died early in the disease process or from a fast-moving condition. Chronic lesions look organized and dull: gray-white fibrin that has become adherent and rubbery, shrunken or fibrosed organs, caseous (cheesy) material that has been there long enough to solidify. A flock with a mix of acute and chronic lesions tells you the disease has been present for more than a week.'),
    para('Differentiating acute from chronic also changes your response. Acute disease calls for immediate sampling and rapid diagnosis. Chronic disease suggests the pathogen has been circulating for a while, secondary infections have set in, and vaccination or management failures may be part of the picture. Let the lesion guide your urgency.'),
    ...image(fig11_1, 'Figure 3.1: Lesion timeline from acute to chronic. Lesion character changes as disease progresses from initial infection through peak mortality to resolution. Source: CPC Short Courses.'),
    pageBreak(),

    // ─── SECTION 4 ───
    h1('4. Common Diseases in Meat Birds (Broilers)'),
    h2('4.1  Bacterial Diseases'),

    para([{ text: 'Colibacillosis (', bold: true }, { text: 'E. coli' }, { text: ')', bold: true }]),
    para('Colibacillosis is the most common bacterial septicemia in commercial broilers and the single most frequent reason for condemnation at the processing plant [4]. The CPC Learning Centre Colibacillosis disease profile identifies the classic lesion triad: airsacculitis, pericarditis, and perihepatitis [4]. At the necropsy table you will see:'),
    bullet([{ text: 'Air sacs:', bold: true }, { text: ' Cloudy, thickened, with yellow-white foamy or creamy exudate. In mild cases, the air sac is slightly hazy. In severe cases, it is packed with caseous material.' }]),
    bullet([{ text: 'Pericardium:', bold: true }, { text: ' White fibrin plaques on the heart surface, excess fluid in the pericardial sac. In chronic cases the fibrin becomes adherent and rubber-like.' }]),
    bullet([{ text: 'Liver:', bold: true }, { text: ' Yellow-white fibrin coating the liver surface (perihepatitis). In septicemic cases the liver is dark, swollen, and friable.' }]),
    bullet([{ text: 'Peritonitis:', bold: true }, { text: ' Yellow egg yolk-like material in the abdominal cavity in laying hens, fibrinous deposits on intestinal serosa in broilers.' }]),
    para('Colibacillosis rarely acts alone. It enters through respiratory or intestinal mucosal damage caused by a primary virus or management problem. Look for the primary cause: IBV, IBD, or poor ventilation that opened the door for the E. coli. Confirm the diagnosis with air sac swab culture from multiple birds [5].'),

    spacer(40),
    para([{ text: 'Necrotic Enteritis (', bold: true }, { text: 'Clostridium perfringens', italics: true }, { text: ')', bold: true }]),
    para('Necrotic enteritis hits broilers hard between two and five weeks of age. Mortality ranges from 2 to 50% depending on flock susceptibility, and it can run for five to fourteen days [6]. The intestinal lesions are unmistakable once you have seen them:'),
    bullet([{ text: 'Small intestine:', bold: true }, { text: ' The jejunum and ileum are ballooned, thin-walled, and extremely fragile. The contents smell foul, a characteristic that is hard to miss.' }]),
    bullet([{ text: 'Pseudomembrane:', bold: true }, { text: ' A tan to yellow diphtheritic membrane lines the intestinal surface. In severe cases this membrane sloughs off in sheets as you open the gut.' }]),
    bullet([{ text: 'Intestinal wall:', bold: true }, { text: ' Paper-thin and easily torn, containing brown or blood-tinged fluid.' }]),
    para('Necrotic enteritis almost never starts on its own. Coccidiosis, especially Eimeria maxima infection, is the most common predisposing factor. High fishmeal or grain-heavy diets (wheat, barley, oats) also create the intestinal environment that Clostridium perfringens exploits. When you find necrotic enteritis lesions, check the intestine for concurrent coccidial lesions [6].'),
    ...image(photoNE, 'Photo 4.1: Necrotic enteritis in the small intestine of a broiler. The gut has been cut open to show the thickened wall and the loose yellow false membrane lining the inner surface, the hallmark lesion of this disease. Source: Vegad JL, A Colour Atlas of Poultry Diseases.', 5.0),
    callout('Practical Tip', 'Necrotic enteritis birds often die before you see obvious clinical signs in the barn. If you open a bird with that smell (sulfurous, foul) before you see any other changes, take it seriously. Check the intestine from duodenum to cloaca before concluding the necropsy.', 'EAF2EA', '538135'),
    spacer(120),

    para([{ text: 'Airsacculitis Complex', bold: true }]),
    para('Airsacculitis as an isolated finding usually means a primary respiratory pathogen opened the door and E. coli finished the job. The air sac system runs from the lungs deep into the abdominal cavity, which means an infection here spreads quickly. At necropsy you will find cloudy, thickened air sac membranes ranging from slightly milky to packed with yellow caseous exudate. In severe cases the liver and heart are coated in fibrin as the infection extends into the body cavity.'),
    para([
      { text: 'Airsacculitis with fibrinous perihepatitis and pericarditis in a three to five week old broiler is the classic colibacillosis picture. Airsacculitis with mucoid tracheal exudate and thickened tracheal wall, but less liver and heart involvement, points more toward ' },
      { text: 'Mycoplasma gallisepticum', italics: true },
      { text: ' (MG) as the primary agent [5].' },
    ]),

    h2('4.2  Viral Diseases'),
    para([{ text: 'Infectious Bronchitis (IBV)', bold: true }]),
    para('The CPC Learning Centre IBV disease profile notes an incubation period of 18 to 36 hours and primary respiratory signs in young birds [7]. The necropsy reflects the form of IBV involved:'),
    bullet([{ text: 'Respiratory form:', bold: true }, { text: ' Mucus and exudate in the trachea and bronchi. Air sacs cloudy and thickened. In young birds the tracheal mucosa is congested and reddened. Sinuses may be swollen and full of mucus.' }]),
    bullet([{ text: 'Renal form:', bold: true }, { text: ' Swollen, pale kidneys with white urate deposits in the tubules. Ureters distended. Gout-like deposits on visceral surfaces in severe cases. Mortality in the renal form can reach 25% in susceptible young flocks [7].' }]),
    bullet([{ text: 'Reproductive form (layers):', bold: true }, { text: ' Cystic oviduct from early infection. False layers: birds appear to be producing but the oviduct is blocked, filled with watery fluid rather than a normal egg.' }]),
    para('IBV in broilers often presents as a flock that falls off feed and water quickly, with coughing and rales. At necropsy, always check the kidneys in addition to the respiratory tract. The renal form can appear with minimal respiratory signs and is easily missed without a thorough organ check.'),

    spacer(40),
    para([{ text: 'Infectious Bursal Disease (IBD)', bold: true }]),
    para('IBD hits broilers hardest at three to six weeks of age. The CPC Learning Centre IBD disease profile describes the lesion progression precisely [8]:'),
    bullet([{ text: 'Day 3 to 4 after infection:', bold: true }, { text: ' The bursa of Fabricius doubles in size. It is pale, with a straw-colored transudate between folds and hemorrhages in the follicles.' }]),
    bullet([{ text: 'Day 5 onward:', bold: true }, { text: ' The bursa shrinks to one-third of its normal size. The edema resolves and lymphoid tissue begins to deplete.' }]),
    bullet([{ text: 'Muscle hemorrhages:', bold: true }, { text: ' Ecchymotic (blotchy) hemorrhages in the breast and thigh muscles. This is one of the most visible gross findings.' }]),
    bullet([{ text: 'Proventriculus-gizzard junction:', bold: true }, { text: ' Hemorrhages at the mucosal junction between proventriculus and gizzard.' }]),
    bullet([{ text: 'Kidneys:', bold: true }, { text: ' Enlarged with urate deposits in tubules, similar to the IBV renal form.' }]),
    para('The classic strain presents with visible morbidity and mortality. The variant strain, which is immunosuppressive, may not produce classic lesions: the bursa shows lymphoid depletion without obvious inflammation, and the main problem is secondary infections that follow [8].'),
    ...image(photoBursa, 'Photo 4.2: Bursa of Fabricius in a broiler with acute IBD (arrow). Opened up, the bursa is congested and hemorrhagic. The bursa is the first place to look in any young bird you suspect of IBD. Source: Vegad JL, A Colour Atlas of Poultry Diseases.', 4.5),
    ...image(photoIBD, 'Photo 4.3: Intramuscular hemorrhage in the breast muscle of a broiler affected by Infectious Bursal Disease (IBD). The ecchymotic hemorrhages are visible as dark streaks within pale muscle tissue. Source: Wikimedia Commons (Public Domain).', 4.5),

    spacer(40),
    para([{ text: 'Newcastle Disease (ND)', bold: true }]),
    para('The lesions in Newcastle disease depend on which strain (pathotype) is involved [9]:'),
    bullet([{ text: 'Velogenic viscerotropic ND:', bold: true }, { text: ' The most severe form. Hemorrhages at the proventricular mucosa (especially at the junction with the gizzard), cecal tonsils, and Peyer\'s patches. Necrotic plaques on the intestinal mucosa. Petechiae on serous membranes. This is the presentation you report to your veterinarian immediately.' }]),
    bullet([{ text: 'Velogenic neurotropic ND:', bold: true }, { text: ' Nervous signs dominate: torticollis (twisted neck), wing paralysis, tremors, and star-gazing. Gross lesions in the brain are subtle (meningeal hyperemia and mild petechiae). The clinical signs are the diagnostic clue here.' }]),
    bullet([{ text: 'Mesogenic / Lentogenic ND:', bold: true }, { text: ' Mild respiratory disease. Lesions are limited to congestion and mucoid exudate in the trachea and slight air sac haze. Low mortality. Most commercial flocks with proper vaccination do not progress beyond this.' }]),
    ...image(photoND, 'Photo 4.4: Opened proventriculus of a broiler with virulent Newcastle disease. Note the pinpoint hemorrhages on the tips of the glands, especially at the junction with the gizzard. This is one of the most diagnostic lesions of the viscerotropic form. Source: Vegad JL, A Colour Atlas of Poultry Diseases.', 4.2),
    para('Peracute Newcastle deaths may have no gross lesions at all. If you have unexplained rapid mortality in a well-vaccinated flock, Newcastle is on the differential alongside Avian Influenza. Both require immediate veterinary contact.'),

    spacer(40),
    para([{ text: 'Avian Influenza: Recognizing Suspicious Lesions', bold: true }]),
    para('You are not expected to diagnose Avian Influenza (AI) on the farm. You are expected to recognize when a presentation is suspicious and respond appropriately. The CFIA and your veterinarian take it from there [3,10].'),
    para('Suspicious presentations include:'),
    bullet('Rapid onset of high mortality with no prior illness signs.'),
    bullet('Cyanosis, edema, and hemorrhagic necrosis of the comb and wattles.'),
    bullet('Hemorrhages or petechiae on the skin of the shanks and feet.'),
    bullet('Hemorrhages in the trachea, proventriculus, and on serosal surfaces.'),
    bullet('Birds dying peracutely with no obvious gross lesions at all.'),
    para('If you open a bird and see this combination, close the bird, secure the barn, and call your veterinarian immediately. Do not move any birds or equipment off the farm. Highly pathogenic AI is a federally reportable disease in Canada, and the response protocol requires CFIA involvement [3,10].'),

    h2('4.3  Parasitic Conditions'),
    para([{ text: 'Coccidiosis', bold: true }]),
    para('The intestinal lesion from coccidiosis depends entirely on which Eimeria species is involved. Each species colonizes a specific segment of the intestine, and the gross appearance varies accordingly [11]:'),
    lesionTable(
      ['Eimeria Species', 'Location in Gut', 'Gross Lesion at Necropsy'],
      [
        ['E. tenella', 'Ceca only', 'Bright red blood-filled ceca. Cecal cores (clotted blood, tissue debris, oocysts) in surviving birds. Most visually dramatic.'],
        ['E. acervulina', 'Duodenum', 'White longitudinal plaques or ladder-like striations on the duodenal mucosa. Pale, thickened duodenal wall.'],
        ['E. maxima', 'Jejunum (mid-gut)', 'Ballooned intestine with thickened, congested wall and petechial hemorrhage. Intestinal lumen contains blood-tinged fluid. Lesions often precede necrotic enteritis.'],
        ['E. necatrix', 'Jejunum (mid-gut)', 'White and red spots on the serosal surface. Interior shows petechiae and necrotic patches.'],
        ['E. brunetti', 'Lower small intestine, rectum', 'Hemorrhagic, necrotic mucosa in the lower gut. Watery bloody content.'],
      ]
    ),
    spacer(120),
    ...image(photoCocci, 'Photo 4.5: Cecal coccidiosis caused by Eimeria tenella in a young broiler. Both ceca are greatly enlarged and distended with blood, the most visually dramatic lesion in poultry coccidiosis. Source: Vegad JL, A Colour Atlas of Poultry Diseases.', 4.0),
    spacer(120),
    ...image(figEim, 'Figure 4.1: The Eimeria life cycle showing how oocysts ingested from litter cause intestinal damage through repeated rounds of merozoite multiplication and cell lysis. Source: USDA Agricultural Research Service (Public Domain).', 5.2),

    para('Coccidiosis causes direct intestinal damage and opens the door to necrotic enteritis. If you find any of the intestinal lesions above, look at the same segment carefully for early Clostridium overgrowth. Mixed Eimeria species infections are common in field conditions, so the picture may not fit a single species cleanly.'),

    spacer(40),
    para([{ text: 'Worms (Internal Parasites)', bold: true }]),
    para('Internal parasites are less common in modern all-in, all-out broiler production but still appear in multi-age or outdoor-access flocks. At necropsy:'),
    bullet([{ text: 'Ascaridia galli', bold: true }, { text: ' (large roundworm): Cream-colored worms 5 to 10 cm long in the small intestine lumen. Heavy burdens cause intestinal thickening, reduced feed efficiency, and competition for nutrients.' }]),
    bullet([{ text: 'Heterakis gallinarum', bold: true }, { text: ' (cecal worm): Small worms in the ceca. Clinically mild in themselves, but important as the vector for Histomonas meleagridis (blackhead in turkeys).' }]),
    bullet([{ text: 'Capillaria', bold: true }, { text: ' (hairworms): Very fine worms embedded in the mucosal surface of the upper intestine or crop. Cause mucosal thickening and erosion. Easy to miss without careful scraping of the mucosa.' }]),
    para('Worm identification at necropsy is largely visual. Collect a segment of affected intestine with the parasites inside for laboratory confirmation.'),

    h2('4.4  Metabolic and Management Problems'),
    para([{ text: 'Ascites (Pulmonary Hypertension Syndrome)', bold: true }]),
    para('Ascites in broilers is a cardiovascular disease, not an infectious one. Fast-growing birds in cool weather with poor air quality are the highest-risk group. The CPC Learning Centre Ascites disease profile identifies the key lesion sequence [12]:'),
    bullet([{ text: 'Abdominal cavity:', bold: true }, { text: ' Yellow or straw-colored fluid fills the abdomen. In severe cases, organized clots or gelatinous fibrin may be present.' }]),
    bullet([{ text: 'Heart:', bold: true }, { text: ' Right ventricle is dilated and hypertrophied. The right atrium is enlarged. In acute deaths the right ventricle may be blood-filled and flaccid.' }]),
    bullet([{ text: 'Liver:', bold: true }, { text: ' Congested, swollen, and dark. The capsule may be thickened. In chronic cases the liver takes on a nutmeg appearance from back-pressure venous congestion.' }]),
    bullet([{ text: 'Lungs:', bold: true }, { text: ' Congested and edematous. Pulmonary capillary hypertension is the driving mechanism, so the lungs show the consequences of increased vascular resistance.' }]),
    para('An ascitic bird opens looking like it is full of water. The intestines are pushed aside by free abdominal fluid. If you find a sudden-death bird with no free fluid, no infectious lesions, and a well-filled gut, think SDS (sudden death syndrome) rather than ascites. Check the heart carefully to tell the two apart.'),

    spacer(40),
    para([{ text: 'Sudden Death Syndrome (SDS)', bold: true }]),
    para('Sudden death syndrome kills fast-growing, well-conditioned broilers, usually males, with a brief wing-beating convulsion before death. At necropsy the findings are characteristically minimal [13]:'),
    bullet([{ text: 'Heart:', bold: true }, { text: ' Contracted ventricles and dilated, blood-filled atria. The cardiac finding is opposite to what you expect from a normal post-mortem relaxation. The ventricular contraction at death is a cardiac arrhythmia event.' }]),
    bullet([{ text: 'Lungs:', bold: true }, { text: ' Congested, sometimes edematous. This changes quickly post-mortem, so examine the lungs before any autolytic changes set in.' }]),
    bullet([{ text: 'Gastrointestinal tract:', bold: true }, { text: ' Full of ingesta. These birds were eating and growing normally right up to the moment they died. This is the tell: a well-nourished bird with no obvious disease lesions.' }]),
    para('SDS is a diagnosis of exclusion at the necropsy table. You see very little. The key is the cardiac finding and the absence of infectious lesions elsewhere. SDS mortality spikes often follow a period of rapid growth, hot weather stress, or a growth catch-up after feed restriction.'),

    spacer(40),
    para([{ text: 'Skeletal Deformities', bold: true }]),
    para('Leg problems in broilers cost the industry through mortality, reduced mobility, and downgrading at the plant. Three main conditions are identifiable at necropsy [14]:'),
    bullet([{ text: 'Tibial dyschondroplasia (TD):', bold: true }, { text: ' A plug of firm, white avascular cartilage in the proximal tibiotarsus. The bird may have walked poorly for days before dying. Visible on cross-section of the tibia as an abnormal cartilage mass extending into the bone.' }]),
    bullet([{ text: 'Valgus/varus deformity:', bold: true }, { text: ' Lateral or medial deviation of the tibiotarsus (bowed or knock-kneed legs). Visible externally and confirmed on bone examination. Causes include genetics, fast growth, and nutritional imbalances.' }]),
    bullet([{ text: 'Spondylolisthesis (kinky back):', bold: true }, { text: ' Compression of the spinal cord by a displaced thoracic vertebra. Birds sit on their hocks and kick frantically. At necropsy, examine the spine at the thoracic level: you will find a displaced or fractured vertebra with spinal cord compression.' }]),
    pageBreak(),

    // ─── SECTION 5 ───
    h1('5. Common Diseases in Layers and Breeders'),
    h2('5.1  Reproductive System Disorders'),
    para([{ text: 'Egg Peritonitis', bold: true }]),
    para('Egg yolk peritonitis is one of the most common causes of sporadic death in layers and breeder hens around peak production. The lesions are difficult to miss [15]:'),
    bullet([{ text: 'Abdominal cavity:', bold: true }, { text: ' Yellow or orange egg yolk material free in the abdomen. In fresh cases it is fluid and oily. In older cases it has cooked into a solid, caseous mass with a distinctive cooked-egg smell.' }]),
    bullet([{ text: 'Peritoneum:', bold: true }, { text: ' Thickened, inflamed, and often covered in fibrin from secondary E. coli infection. In chronic peritonitis the abdominal surfaces are matted together with adhesions.' }]),
    bullet([{ text: 'Ovary:', bold: true }, { text: ' Atretic (shrunken) follicles, ruptured follicles, or follicular hemorrhage depending on the stage of disease. In acute cases the ovary may look normal.' }]),
    para('Egg peritonitis often starts when reverse peristalsis pushes yolk material from the oviduct back into the abdominal cavity, or when a follicle ruptures into the coelom rather than being caught by the infundibulum. Secondary E. coli infection is almost universal once yolk material sits in the warm abdominal cavity [15].'),

    spacer(40),
    para([{ text: 'Salpingitis', bold: true }]),
    para('Salpingitis is inflammation of the oviduct, and it is often found alongside egg peritonitis or as a separate cause of production loss and mortality. The oviduct is the first place to examine in any layer or breeder hen that has died or been euthanized due to reproductive failure [16]:'),
    bullet([{ text: 'Oviduct:', bold: true }, { text: ' Thickened, inflamed walls. The lumen contains yellow or white caseous exudate instead of normal secretions. In severe cases the entire oviduct is packed solid with pus or necrotic material (a "lash egg").' }]),
    bullet([{ text: 'Impacted oviduct:', bold: true }, { text: ' The oviduct fills with a large mass of albumin, yolk, and inflammatory debris. The bird stops laying but the abdomen becomes enlarged. This is a chronic end-stage presentation.' }]),
    bullet([{ text: 'Bacterial involvement:', bold: true }, { text: ' E. coli, ' }, { text: 'Mycoplasma', italics: true }, { text: ', Salmonella, and Pasteurella are all associated with salpingitis. Swab the oviduct contents for culture to identify the primary organism.' }]),

    h2('5.2  Bacterial Diseases'),
    para([{ text: 'Fowl Cholera (', bold: true }, { text: 'Pasteurella multocida', italics: true }, { text: ')', bold: true }]),
    para('Fowl cholera hits layers and breeders harder than broilers, and it kills fast in the acute form. The CPC Learning Centre Fowl Cholera disease profile describes the acute lesion set clearly [17]:'),
    bullet([{ text: 'Acute form:', bold: true }, { text: ' Hemorrhages around the heart and on the lungs. Yellow-white pinpoint spots on the liver surface (multifocal hepatic necrosis). Excess clear fluid in the pericardial sac and abdominal cavity. General reddening of tissues from septicemia. Birds often found dead with no prior illness.' }]),
    bullet([{ text: 'Chronic form:', bold: true }, { text: ' Swollen, hot wattles. Swollen eyes (periorbital edema). Respiratory involvement with mucoid exudate in trachea and air sacs. Arthritis in joints with caseous deposits. The wattle and eye swelling are classic visual signs, and you will see fibrinous adhesions and caseous material in the joints when you open them.' }]),
    para('Acute fowl cholera in a flock with good birds suddenly dead is a production emergency. Culture from fresh liver and heart blood confirms the diagnosis. Pasteurella multocida grows readily on standard culture media within 24 hours [17].'),
    ...image(photoChol, 'Photo 5.1: Liver from a chicken with acute fowl cholera. The surface is dotted with tiny white necrotic spots (multifocal hepatic necrosis), the classic liver lesion of this disease. Source: Vegad JL, A Colour Atlas of Poultry Diseases.', 4.2),

    spacer(40),
    para([{ text: 'Mycoplasmosis (MG and MS)', bold: true }]),
    para([
      { text: 'Mycoplasma gallisepticum', italics: true },
      { text: ' (MG) and ' },
      { text: 'Mycoplasma synoviae', italics: true },
      { text: ' (MS) are chronic respiratory and synovitis pathogens that cost the layer and breeder industry through reduced production, increased condemnation, and treatment costs rather than through acute mortality [18,19].' },
    ]),
    para('At necropsy, the lesions depend on which organism is involved and how far the disease has progressed:'),
    bullet([{ text: 'MG (respiratory form):', bold: true }, { text: ' Cloudy, thickened air sacs ranging from slightly hazy to opaque. Mucoid or caseous exudate in the air sac lumen. Tracheal mucosa congested and thickened. Swollen infraorbital sinuses, sometimes with caseous plugs. Concurrent E. coli infection (from the immunosuppression MG causes) adds pericarditis and perihepatitis to the picture.' }]),
    bullet([{ text: 'MS (synovitis form):', bold: true }, { text: ' Swollen hock joints and foot pads. Open the joint to find a creamy, viscous fluid (synovial exudate) instead of the thin, clear joint lubricant you see in a healthy bird. The tendon sheaths may also be thickened. This is one of the cleanest diagnostic presentations in poultry: swollen joint, open it, find cream-colored exudate, and MS is your primary differential.' }]),
    para('MG and MS are often present together. PCR testing of tracheal or choanal swabs from live birds is the most sensitive diagnostic method, but the gross lesions at necropsy give you strong evidence to work with while you wait for lab results [18,19].'),

    h2('5.3  Viral Diseases'),
    para([{ text: "Marek's Disease", bold: true }]),
    para("Marek's disease causes two distinct lesion patterns, and knowing which form you are dealing with matters for your vaccination audit [20]:"),
    bullet([{ text: 'Neural form:', bold: true }, { text: ' Enlarged peripheral nerves. The sciatic nerves are the most accessible: after removing the abdominal organs, find them running bilaterally in the sacral region alongside the vertebral column, just under the kidneys. In a healthy bird they are uniform, slightly striated, and bilaterally symmetric. In Marek\'s neural form, one or both are obviously enlarged, swollen, and have lost their normal striations. Compare left to right. Asymmetry is the key finding. The vagus, brachial, and femoral nerves may also be affected.' }]),
    bullet([{ text: 'Visceral form:', bold: true }, { text: ' Whitish lymphoma nodules in multiple organs: liver, spleen, gonads, kidney, heart, proventriculus, and intestine. Tumor nodules range from pinpoint to several centimeters. The liver may be diffusely enlarged with a mottled appearance or studded with discrete white nodules. This form has 10 to 70% mortality depending on the strain and immune status of the flock [20].' }]),
    bullet([{ text: 'Cutaneous form:', bold: true }, { text: ' Enlarged, reddened feather follicles visible as nodular skin lesions, usually on the neck and back. Less common in well-vaccinated commercial flocks.' }]),
    ...image(photoMar, "Photo 5.2: Cutaneous form of Marek's disease in a broiler showing enlarged, reddened feather follicles on the skin surface. Source: Roman Halouzka, Wikimedia Commons (CC BY-SA 3.0).", 4.5),

    para("Marek's disease in a vaccinated flock is a vaccination failure investigation. Check: Was the vaccine kept at the right temperature? Was the dose correct? Were birds exposed to field virus before the vaccine had time to protect them? Vaccination does not prevent infection. It prevents tumor development. Course 7 covers the full disease profile and vaccination strategy in detail."),

    spacer(40),
    para([{ text: 'Infectious Bronchitis and Newcastle Disease in Layers', bold: true }]),
    para('IBV and ND in laying flocks present differently than in broilers because egg production amplifies the consequences:'),
    bullet([{ text: 'IBV in layers:', bold: true }, { text: ' A production drop of 25 to 50% or more during a field infection. At necropsy, birds infected as chicks may have cystic or regressed oviducts: the virus permanently damaged the reproductive tract, creating "false layers" that produce no eggs despite going through the laying cycle. Ovarian follicles may be shrunken or inactive.' }]),
    bullet([{ text: 'ND in layers:', bold: true }, { text: ' Neurological signs and an acute production drop. Velogenic ND in a layer flock produces hemorrhagic lesions in the ovary, oviduct, and intestine. In the oviduct, thin-shelled and soft-shelled eggs accumulate before the bird stops laying altogether.' }]),
    para('Both conditions require rapid veterinary involvement. ND is a reportable disease in Canada. Confirm with laboratory testing before treating or adjusting vaccination protocols.'),

    h2('5.4  Nutritional and Metabolic Issues'),
    para([{ text: 'Fatty Liver Hemorrhagic Syndrome (FLHS)', bold: true }]),
    para('FLHS kills laying hens at or near peak production, typically those on high-energy diets with limited activity. The necropsy is diagnostic in obvious cases [21]:'),
    bullet([{ text: 'Liver:', bold: true }, { text: ' Enlarged, pale yellow to putty-colored, and extremely fragile. You cannot lift the right lobe cleanly without tearing it. Fat infiltration is visible as yellowish discoloration throughout the liver tissue.' }]),
    bullet([{ text: 'Blood clot:', bold: true }, { text: ' A large subcapsular hematoma on the dorsal aspect of the right hepatic lobe. This is the most pathognomonic finding: a dark red blood clot sitting on top of a pale, friable liver is FLHS until proven otherwise.' }]),
    bullet([{ text: 'Abdominal fat:', bold: true }, { text: ' Excessive oily, unsaturated fat deposits throughout the abdominal cavity. The bird looks obese internally.' }]),
    bullet([{ text: 'Pallor:', bold: true }, { text: ' Pale comb, pale mucous membranes from internal blood loss into the hematoma or free abdominal hemorrhage.' }]),
    para('The liver dry matter in FLHS birds is at least 40% fat, which explains the friability [21]. These birds are often the heaviest in the flock. Management response: evaluate diet energy density, body weight targets, and whether feed restriction programs are being followed correctly.'),

    spacer(40),
    para([{ text: 'Calcium Deficiency and Cage Layer Fatigue', bold: true }]),
    para('Calcium deficiency in laying hens causes a progressive skeletal failure as bone calcium is mobilized to meet the demand for eggshell formation [22]. At necropsy:'),
    bullet([{ text: 'Bone:', bold: true }, { text: ' Thin cortical bone. Cross-sectioning a femur or tibia reveals cancellous (spongy) bone replacing compact cortical bone. Bones fracture easily during necropsy handling.' }]),
    bullet([{ text: 'Keel bone:', bold: true }, { text: ' Palpable fractures in the keel (sternum). Keel fractures are extremely common in commercial laying hens and can be detected by running your finger along the keel surface.' }]),
    bullet([{ text: 'Cage layer fatigue:', bold: true }, { text: ' Birds found unable to stand in cage systems. At necropsy, spinal cord compression or pathological fractures from severely osteoporotic bone. The cord compression is visible at the thoracic vertebrae.' }]),
    bullet([{ text: 'Egg production context:', bold: true }, { text: ' Thin-shelled or soft-shelled eggs preceding the clinical presentation. The progression from thin shells to broken shells to loss of production is the diagnostic timeline to look for in the flock records.' }]),
    para('Calcium deficiency responds well to dietary correction when caught early. If multiple hens in the same stage of lay are showing this pattern, audit the diet formulation, calcium source particle size (large particles are absorbed more slowly and support overnight shell formation), and light programs.'),
    pageBreak(),

    // ─── SECTION 6 ───
    h1('6. Necropsy Lesion Recognition by Body System'),
    para('The following table summarizes lesion patterns by body system. Use this as a field reference when you are at the necropsy table and need to orient your findings toward a diagnosis.'),
    spacer(80),
    lesionTable(
      ['Body System', 'Inspect for', 'Abnormal Finding', 'Disease(s) to Consider'],
      [
        ['Trachea', 'Color, wall thickness, exudate', 'Red, congested mucosa; thick mucus; cheesy plugs', 'IBV, ND, MG, ILT'],
        ['Lungs', 'Color, texture, nodules', 'Congested, edematous; gray-white nodules', 'AI, Aspergillosis, Colibacillosis'],
        ['Air sacs (thoracic and abdominal)', 'Transparency, exudate', 'Cloudy, thickened; caseous yellow exudate', 'Colibacillosis, MG, IBV'],
        ['Proventriculus-gizzard junction', 'Mucosal hemorrhage', 'Petechiae, ecchymoses at junction', 'Newcastle Disease (velogenic), IBD'],
        ['Bursa of Fabricius', 'Size vs. age-expected; texture', 'Enlarged/hemorrhagic (acute IBD); shrunken (chronic IBD)', 'IBD'],
        ['Small intestine (jejunum/ileum)', 'Wall thickness, content, smell', 'Ballooned, friable, pseudomembrane, foul odor', 'Necrotic Enteritis'],
        ['Intestine (by segment)', 'Mucosal lesions', 'White plaques (duodenum), bloody ceca, blood-tinged fluid (mid-gut)', 'Coccidiosis (species-specific)'],
        ['Cecal tonsils and Peyer\'s patches', 'Hemorrhage, necrosis', 'Necrotic foci, hemorrhage', 'Newcastle Disease (viscerotropic)'],
        ['Liver', 'Color, texture, surface', 'Yellow spots (cholera), friable/pale (FLHS/IBH), fibrin coat', 'Fowl Cholera, FLHS, Colibacillosis, IBH'],
        ['Spleen', 'Size, nodules', 'Enlarged with white lymphoma nodules', "Marek's Disease (visceral)"],
        ['Kidneys', 'Color, swelling, urates', 'Pale/swollen with chalk-white tubules', 'IBV renal form, IBD, dehydration'],
        ['Sciatic/peripheral nerves', 'Size, symmetry', 'Enlarged, asymmetric, dull striations', "Marek's Disease (neural)"],
        ['Heart/pericardium', 'Fibrin, fluid, chamber size', 'Fibrin plaques; dilated right heart; contracted ventricles', 'Colibacillosis, Ascites, SDS'],
        ['Abdominal cavity', 'Free fluid, exudate, yolk', 'Straw fluid (ascites); yolk material (egg peritonitis)', 'Ascites, Egg Peritonitis'],
        ['Oviduct', 'Wall, lumen content', 'Caseous exudate; impacted; inflamed wall', 'Salpingitis'],
        ['Skin and feather follicles', 'Nodules, color', 'Enlarged reddened follicles; hemorrhagic or necrotic patches', "Marek's (cutaneous), Fowl Pox"],
        ['Hock and foot pad joints', 'Swelling, exudate', 'Swollen joint with cream exudate', [{ text: 'Mycoplasma synoviae', italics: true }, { text: ' (MS)' }]],
        ['Bone (cross-section)', 'Cortical thickness', 'Thin cortex, fragile, cancellous replacement', 'Calcium deficiency, cage layer fatigue'],
        ['Skeletal muscles (breast/thigh)', 'Color, texture, hemorrhage', 'Ecchymotic hemorrhages in muscle', 'IBD'],
      ]
    ),
    spacer(160),
    ...image(organMap, 'Figure 6.1: Internal anatomy of the chicken showing where each organ system sits in the body. Use it to place the organs named in the lesion table above when you are working at the necropsy table. Source: Purina Animal Nutrition LLC.', 5.4),
    pageBreak(),

    // ─── SECTION 7 ───
    h1('7. Case Studies and Problem-Solving'),
    para('The following case walkthroughs illustrate how necropsy findings connect to flock history and lead to a diagnosis. These are based on common field presentations.'),

    h2('7.1  Case 1: Broiler Mortality Spike at 28 Days'),
    para([{ text: 'Flock history:', bold: true }, { text: ' Ross 308 broilers, 28 days old, 40,000 birds. Mortality has been running 0.2% per day for 10 days and jumped to 0.8% yesterday. Birds look dull, are piling at feeders, and water consumption has dropped. No changes to feed, vaccination schedule completed on time.' }]),
    para([{ text: 'Necropsy findings (6 birds):', bold: true }, { text: ' Air sacs cloudy and thickened with yellow exudate. White fibrin on the heart surface in 4 of 6 birds. Liver slightly swollen with fibrin coat. Kidneys pale, slightly swollen with urate deposits in 2 of 6 birds. Intestines: normal in 4 birds, slight thickening and blood-tinged fluid in the mid-jejunum in 2 birds.' }]),
    para([{ text: 'Interpretation:', bold: true }, { text: ' The airsacculitis-pericarditis-perihepatitis triad is classic colibacillosis. The renal involvement in 2 birds suggests IBV-renal may have been the primary trigger. The jejunal changes in 2 birds suggest low-grade E. maxima coccidiosis as a second contributing factor.' }]),
    para([{ text: 'Next steps:', bold: true }, { text: ' Submit 8 live birds to the provincial lab: air sac swabs for E. coli sensitivity, tracheal swabs for IBV PCR, intestinal scrapings for oocyst count. Review vaccination records for IBV coverage. Assess ventilation and stocking density as contributing factors.' }]),

    h2('7.2  Case 2: Layer Flock with Production Drop and Deaths'),
    para([{ text: 'Flock history:', bold: true }, { text: ' ISA Brown layers, 42 weeks of age, 20,000 hens in conventional cages. Egg production fell 18% over 10 days. Ten to fifteen birds dying per day, found on cage floors. Birds appear dull, some with distended abdomens.' }]),
    para([{ text: 'Necropsy findings (8 birds):', bold: true }, { text: ' Distended abdomen with yellow-orange fluid and solid cooked-egg material in 6 of 8 birds. Oviduct inflamed and containing caseous exudate in 4 of 8 birds. Liver pale and enlarged in 3 of 8 birds. One bird: swollen left sciatic nerve, liver with 3 white nodules. Ovarian follicles atretic in most birds.' }]),
    para([{ text: 'Interpretation:', bold: true }, { text: ' Egg peritonitis and salpingitis are the primary findings. Colibacillosis secondary to the reproductive tract infection is likely. The single bird with nerve and liver findings suggests concurrent Marek\'s disease, which may be suppressing immunity in this flock.' }]),
    para([{ text: 'Next steps:', bold: true }, { text: ' Oviduct swabs for bacterial culture and sensitivity. ELISA serology for Marek\'s antibody status across the flock, and PCR on spleen tissue from the affected bird for Marek\'s virus confirmation. Review vaccination records and Marek\'s vaccine cold chain compliance. Assess diet, body condition score, and calcium supply.' }]),

    h2('7.3  Case 3: Young Broiler Flock, Sudden Mortality at 3 Weeks'),
    para([{ text: 'Flock history:', bold: true }, { text: ' Ross 308 broilers, 21 days old, 60,000 birds. Mortality jumped from 0.1% to 2.5% in a 36-hour period. Birds found dead and dying with loose, watery droppings and some vent staining. No prior problems. Litter moisture has been high this week.' }]),
    para([{ text: 'Necropsy findings (6 birds):', bold: true }, { text: ' Bursa of Fabricius: enlarged and pale in 4 birds, with hemorrhagic follicles visible on incision. Hemorrhages in breast muscles in 5 of 6 birds. Kidneys swollen with urate deposits in 3 of 6 birds. Proventriculus-gizzard junction: small hemorrhages in 3 birds. No significant respiratory or intestinal findings.' }]),
    para([{ text: 'Interpretation:', bold: true }, { text: ' Classic acute IBD. The enlarged, hemorrhagic bursa, intramuscular hemorrhages, and renal lesions match the CPC Learning Centre IBD disease profile exactly [8]. The rapid onset, age at peak IBD susceptibility, and high-moisture litter environment support the diagnosis.' }]),
    para([{ text: 'Next steps:', bold: true }, { text: ' Submit fresh bursa from 3 birds to lab for IBD virus isolation and strain identification. Review IBD vaccination timing and maternal antibody data for this breeder flock. Check water quality and litter management. Flag for potential viral variant involvement if variant strains have been circulating in your region [8].' }]),
    pageBreak(),

    // ─── SECTION 8 ───
    h1('8. Farmer-Friendly Diagnostic Pathway'),
    h2('8.1  When to Submit Samples'),
    para('Not every necropsy leads to a lab submission. But these situations always do:'),
    bullet('Daily mortality above 0.5% for two or more consecutive days without a known cause.'),
    bullet('Any presentation that looks like Avian Influenza, Newcastle disease, or another reportable disease. Call your veterinarian first, then follow their guidance on whether to submit and to which lab.'),
    bullet('Mortality that is not responding to an ongoing treatment protocol after 48 hours.'),
    bullet('Any time the lesion pattern is unclear and you cannot connect the findings to a diagnosis.'),
    bullet('Routine flock health monitoring: some farms necropsy a set number of birds each week and submit quarterly for a clean bill of health and early pathogen detection.'),
    para('The earlier you submit, the better the result. Fresh samples give the lab the best chance of finding the pathogen. Decomposed samples yield unreliable culture results and cannot be used for histopathology or virus isolation [2].'),

    h2('8.2  What to Tell the Veterinarian or Diagnostic Lab'),
    para('The submission form is only as good as the information you put into it. A well-completed form gets your results faster and more accurately. Include:'),
    bullet([{ text: 'Flock identity:', bold: true }, { text: ' Species, breed/strain, age, flock size, production type (broiler/layer/breeder).' }]),
    bullet([{ text: 'Mortality data:', bold: true }, { text: ' Daily mortality for the past 14 days if possible, or at minimum the current rate and how long it has been elevated.' }]),
    bullet([{ text: 'Clinical signs observed:', bold: true }, { text: ' What you saw in the barn: respiratory, digestive, neurological, reproductive. When it started and how quickly it progressed.' }]),
    bullet([{ text: 'Production metrics:', bold: true }, { text: ' Egg production curve, feed and water intake, current body weight vs. expected.' }]),
    bullet([{ text: 'Vaccination history:', bold: true }, { text: ' Full vaccination schedule with dates, routes, and vaccine products used.' }]),
    bullet([{ text: 'Your necropsy observations:', bold: true }, { text: ' What you found when you opened the birds. Use the language from this course: airsacculitis, pericarditis, enlarged bursa, cecal blood. Specific observations are more useful than "the insides looked bad."' }]),
    bullet([{ text: 'Recent treatments or feed changes:', bold: true }, { text: ' Any antibiotics, coccidiostats, or feed changes in the past 30 days.' }]),
    para('Your veterinarian is your partner in this process. The CPC Learning Centre Spotting Disease Early guide emphasizes that the veterinarian needs a full picture to make the right call [1]. A complete history dramatically improves diagnostic accuracy and speeds up the time from submission to result.'),

    h2('8.3  Using Necropsy Findings to Take Immediate Action'),
    para('While your veterinarian works toward a confirmed diagnosis, you do not have to sit and wait. These are holding actions to limit losses, not a substitute for the diagnosis itself. Based on what you found at the necropsy table, you can move immediately on several fronts:'),
    bullet([{ text: 'Airsacculitis with fibrinous pericarditis:', bold: true }, { text: ' Colibacillosis is the primary differential. Review ventilation quality, stocking density, and litter moisture. Colibacillosis secondary to a primary virus means you need to look for the underlying cause.' }]),
    bullet([{ text: 'Ballooned intestine with pseudomembrane:', bold: true }, { text: ' Necrotic enteritis. Look at the coccidiosis control program and the diet composition immediately. This cannot wait for lab confirmation.' }]),
    bullet([{ text: 'Blood-filled ceca:', bold: true }, { text: ' Eimeria tenella coccidiosis. Check your anticoccidial program: is resistance developing? Wet litter accelerates oocyst cycling and drives heavier challenge. Tighten litter management alongside the treatment response.' }]),
    bullet([{ text: 'Enlarged bursa with muscle hemorrhages:', bold: true }, { text: ' IBD. Notify your veterinarian and review maternal antibody data and vaccination timing. Check the rest of the flock for signs of immunosuppression, because other diseases often follow.' }]),
    bullet([{ text: 'Yellow yolk in the abdominal cavity:', bold: true }, { text: ' Egg peritonitis. Assess diet, body condition, and whether stressors (heat, handling, overcrowding) have been triggering follicular rupture or reverse peristalsis.' }]),
    bullet([{ text: 'Pale yellow friable liver with blood clot:', bold: true }, { text: ' FLHS. This is almost always a nutritional and management problem. Review body weight targets, feed energy, and whether hens are under-exercised.' }]),
    ...image(fig11_3, 'Figure 8.1: Field diagnostic pathway connecting necropsy findings to immediate on-farm response. Use this flowchart at the necropsy table to guide your next steps while waiting for laboratory confirmation. Source: CPC Short Courses.'),
    spacer(80),
    para('One last reminder, the same one we opened with. The necropsy and the diagnosis are your veterinarian\'s job first. The steps above buy you time and limit losses, but they do not replace a confirmed diagnosis, which takes the science, the experience, and the laboratory backup that your veterinarian brings. Whenever you can, send the dead birds or the samples to your veterinarian or the diagnostic lab, or have your veterinarian come to the farm in person. Opening birds yourself in the barn is the fallback, for the times when you cannot get samples away fast enough or no veterinarian can reach you. What this course gives you is the trained eye to recognize a serious lesion, describe it clearly, and know when to stop and call. Use it to be a sharper partner for your veterinarian, and let them make the final call.'),
    pageBreak(),

    // ─── RECOMMENDED JOURNALS ───
    h1('Recommended Journals and Resources'),
    bullet([{ text: 'Avian Diseases:', bold: true }, { text: ' Official publication of the American Association of Avian Pathologists. Primary source for peer-reviewed field-relevant necropsy and disease research.' }]),
    bullet([{ text: 'Poultry Science:', bold: true }, { text: ' Broad-scope journal covering production, health, and management. Frequent practical disease studies.' }]),
    bullet([{ text: 'Avian Pathology:', bold: true }, { text: ' European-based peer-reviewed journal. Strong coverage of infectious diseases, field diagnostics, and vaccination.' }]),
    bullet([{ text: 'Merck Veterinary Manual (merckvetmanual.com):', bold: true }, { text: ' Free online reference. Poultry disease profiles are accurate, regularly updated, and farmer-accessible.' }]),
    bullet([{ text: 'Diseases of Poultry, 14th Edition (Swayne et al.):', bold: true }, { text: ' The standard textbook reference for poultry disease. Available in the CPC reference library.' }]),
    bullet([{ text: 'CPC Learning Centre (cpclearningcentre.ca):', bold: true }, { text: ' Disease profiles, flock management guides, and technical bulletins specific to Canadian commercial production. Free access.' }]),
    pageBreak(),

    // ─── REFERENCES ───
    h1('References'),
    numberedRef('CPC Learning Centre. Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
    numberedRef('CEVA Animal Health. Poultry Necropsy Techniques [Technical Guide]. CEVA Sante Animale. Available via CPC Learning Centre: cpclearningcentre.ca'),
    numberedRef('Canadian Food Inspection Agency. CFIA-approved animal health diagnostic laboratories [cited 2026 Jun]. Available from: inspection.canada.ca/en/animal-health/terrestrial-animals/our-approved-laboratories'),
    numberedRef('CPC Learning Centre. Colibacillosis [Disease Profile]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
    numberedRef('Merck Veterinary Manual. Colibacillosis in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/colibacillosis/colibacillosis-in-poultry'),
    numberedRef('Merck Veterinary Manual. Necrotic Enteritis in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/necrotic-enteritis/necrotic-enteritis-in-poultry'),
    numberedRef('CPC Learning Centre. Infectious Bronchitis Virus (IBV) [Disease Profile]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
    numberedRef('CPC Learning Centre. Infectious Bursal Disease (IBD) [Disease Profile]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
    numberedRef('Merck Veterinary Manual. Newcastle Disease in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/newcastle-disease-and-other-paramyxovirus-infections/newcastle-disease-in-poultry'),
    numberedRef('Merck Veterinary Manual. Avian Influenza in Poultry and Wild Birds. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/avian-influenza-in-poultry-and-wild-birds/avian-influenza-in-poultry-and-wild-birds'),
    numberedRef('Merck Veterinary Manual. Coccidiosis in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/coccidiosis-in-poultry/coccidiosis-in-poultry'),
    numberedRef('CPC Learning Centre. Ascites [Disease Profile]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
    numberedRef('Merck Veterinary Manual. Sudden Death Syndrome of Broiler Chickens. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/sudden-death-syndrome-of-broiler-chickens/sudden-death-syndrome-of-broiler-chickens'),
    numberedRef('Merck Veterinary Manual. Noninfectious Skeletal Disorders in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/disorders-of-the-skeletal-system-in-poultry/noninfectious-skeletal-disorders-in-poultry'),
    numberedRef('Merck Veterinary Manual. Egg Peritonitis in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/disorders-of-the-reproductive-system-in-poultry/egg-peritonitis-in-poultry'),
    numberedRef('Merck Veterinary Manual. Salpingitis in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/disorders-of-the-reproductive-system-in-poultry/salpingitis-in-poultry'),
    numberedRef('CPC Learning Centre. Fowl Cholera [Disease Profile]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
    numberedRef('Merck Veterinary Manual. Mycoplasma gallisepticum Infection in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/mycoplasmosis/mycoplasma-gallisepticum-infection-in-poultry'),
    numberedRef('Merck Veterinary Manual. Mycoplasma synoviae Infection in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/mycoplasmosis/mycoplasma-synoviae-infection-in-poultry'),
    numberedRef("Merck Veterinary Manual. Marek's Disease in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/neoplasms-in-poultry/marek-s-disease-in-poultry"),
    numberedRef('Merck Veterinary Manual. Fatty Liver Hemorrhagic Syndrome in Poultry. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/fatty-liver-hemorrhagic-syndrome/fatty-liver-hemorrhagic-syndrome-in-poultry'),
    numberedRef('Merck Veterinary Manual. Calcium Metabolism Problems in Hens. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com/poultry/disorders-of-the-reproductive-system-in-poultry/calcium-metabolism-problems-in-hens'),
    numberedRef('CPC Learning Centre. Inclusion Body Hepatitis [Disease Profile]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
  ];
}

// ============================================================
// TOC ENTRIES
// ============================================================
const tocEntries = [
  { lvl: 1, text: 'Introduction', page: 3 },
  { lvl: 1, text: '1. Purpose of Necropsy in Disease Diagnosis', page: 4 },
  { lvl: 2, text: '1.1  How Necropsy Supports Early Detection', page: 4 },
  { lvl: 2, text: '1.2  Linking Lesions to Flock History and Symptoms', page: 4 },
  { lvl: 2, text: '1.3  When Necropsy Should Be Prioritized', page: 5 },
  { lvl: 1, text: '2. Preparation and Biosecurity', page: 6 },
  { lvl: 2, text: '2.1  Tools and Safety Precautions', page: 6 },
  { lvl: 2, text: '2.2  Selecting Appropriate Birds', page: 6 },
  { lvl: 2, text: '2.3  Sample Handling for Laboratory Submission', page: 7 },
  { lvl: 1, text: '3. Overview of Common Necropsy Lesions', page: 8 },
  { lvl: 2, text: '3.1  What Abnormal Findings Look Like', page: 8 },
  { lvl: 2, text: '3.2  Acute vs Chronic Disease Lesions', page: 9 },
  { lvl: 1, text: '4. Common Diseases in Meat Birds (Broilers)', page: 10 },
  { lvl: 2, text: '4.1  Bacterial Diseases', page: 10 },
  { lvl: 2, text: '4.2  Viral Diseases', page: 13 },
  { lvl: 2, text: '4.3  Parasitic Conditions', page: 17 },
  { lvl: 2, text: '4.4  Metabolic and Management Problems', page: 19 },
  { lvl: 1, text: '5. Common Diseases in Layers and Breeders', page: 22 },
  { lvl: 2, text: '5.1  Reproductive System Disorders', page: 22 },
  { lvl: 2, text: '5.2  Bacterial Diseases', page: 24 },
  { lvl: 2, text: '5.3  Viral Diseases', page: 26 },
  { lvl: 2, text: '5.4  Nutritional and Metabolic Issues', page: 28 },
  { lvl: 1, text: '6. Necropsy Lesion Recognition by Body System', page: 30 },
  { lvl: 1, text: '7. Case Studies and Problem-Solving', page: 33 },
  { lvl: 2, text: '7.1  Case 1: Broiler Mortality Spike at 28 Days', page: 33 },
  { lvl: 2, text: '7.2  Case 2: Layer Flock with Production Drop and Deaths', page: 34 },
  { lvl: 2, text: '7.3  Case 3: Young Broiler Flock, Sudden Mortality at 3 Weeks', page: 35 },
  { lvl: 1, text: '8. Farmer-Friendly Diagnostic Pathway', page: 36 },
  { lvl: 2, text: '8.1  When to Submit Samples', page: 36 },
  { lvl: 2, text: '8.2  What to Tell the Veterinarian or Diagnostic Lab', page: 37 },
  { lvl: 2, text: '8.3  Using Necropsy Findings to Take Immediate Action', page: 38 },
  { lvl: 1, text: 'Recommended Journals and Resources', page: 40 },
  { lvl: 1, text: 'References', page: 41 },
];

// ============================================================
// NUMBERING DEFINITIONS
// ============================================================
const numberingConfig = {
  config: [
    { reference: 'bullet-list', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.8), hanging: convertInchesToTwip(0.2) } } } },
    ]},
    { reference: 'numbered-list', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.2) } } } },
    ]},
    { reference: 'references-list', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) }, spacing: { after: 80 } } } },
    ]},
  ],
};

// ============================================================
// MAIN
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const doc = new Document({
  numbering: numberingConfig,
  styles: {
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', run: { bold: true, color: MED_BLUE, size: 32, font: 'Calibri Light' }, paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } } } },
      { id: 'Heading2', name: 'Heading 2', run: { bold: true, color: MED_BLUE, size: 26, font: 'Calibri Light' }, paragraph: { spacing: { before: 280, after: 120 } } },
    ],
  },
  sections: [
    buildCoverSection(),
    {
      properties: { page: { margin: pageMargin } },
      headers: { default: buildHeader() },
      footers: { default: buildFooter() },
      children: buildBody(),
    },
  ],
});

// Write initial buffer
fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));
console.log('Initial docx written. Applying post-build patches...');

// ---- POST-BUILD PATCH ----
const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

function escapeXml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

const entriesWithAnchor = tocEntries.map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8,'0')}` }));

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
const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  sdt = sdt.replace(/\sw:dirty="true"/g, '');
  sdt = sdt.replace(/<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/, `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`);
  docXml = docXml.replace(sdtMatch[0], sdt);
}
docXml = docXml.replace(/\sw:dirty="true"/g, '');

// Inject bookmarks
let entryIdx = 0;
let bookmarkId = 2000;
const normText = s => s.replace(/\s+/g,' ').trim();
const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
docXml = docXml.replace(headingRegex, (match, lvlStr) => {
  if (entryIdx >= entriesWithAnchor.length) return match;
  const lvl = Number(lvlStr);
  const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
  const heading = normText(textRuns);
  const entry   = entriesWithAnchor[entryIdx];
  if (lvl !== entry.lvl) return match;
  if (normText(heading) !== normText(entry.text)) return match;
  entryIdx++;
  const id = bookmarkId++;
  return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
});
if (entryIdx !== entriesWithAnchor.length) console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length}`);
outZip.file('word/document.xml', docXml);

// settings.xml
let settings = await outZip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g,'');
settings = settings.replace('<w:displayBackgroundShape/>','<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
outZip.file('word/settings.xml', settings);

// TOC styles
let stylesXml = await outZip.file('word/styles.xml').async('string');
if (!/w:styleId="TOC1"/.test(stylesXml)) {
  const tocStyles =
    '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
  stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
  outZip.file('word/styles.xml', stylesXml);
}

// Verify
const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
if (dirtyLeft > 0) console.warn(`WARNING: ${dirtyLeft} w:dirty flags remain!`);
else console.log('w:dirty check: 0 flags (PASS)');

const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log(`\nCourse 11 docx written: ${OUT_FILE}`);
console.log(`File size: ${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB`);

// dash check
const dashCount = (docXml.match(/—/g) || []).length;
if (dashCount > 0) console.warn(`Em dash check: ${dashCount} em dashes found — review required`);
else console.log('Em dash check: 0 em dashes (PASS)');
