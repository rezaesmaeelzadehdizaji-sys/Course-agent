// ============================================================
// generate-course18-action-card.mjs
// Avian Influenza: The First 24 Hours — one-page action card
// Companion to Course 18 (Current Poultry Issues, Hot Topics)
// Every line traces to a source already verified for Course 18.
// Run: node generate-course18-action-card.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, BorderStyle, ShadingType, HeightRule,
  convertInchesToTwip, ImageRun, Table, TableRow, TableCell, WidthType,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 18');
const OUT_FILE  = path.join(OUT_DIR, 'First_24_Hours_Avian_Influenza.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const MED_BLUE  = '2E74B5';
const DARK_BLUE = '1F3864';
const GOLD      = 'C9A84C';
const BODY      = '3C3C3C';
const GRAY      = '888888';
const RED       = 'C0504D';
const LABEL_BG  = 'EAF1FA';
const RED_BG    = 'FDECEA';
const CONTENT_W = 9792;

const TITLE     = 'AVIAN INFLUENZA: THE FIRST 24 HOURS';
const HDR_TITLE = 'First 24 Hours';
const FTR_TITLE = 'Avian Influenza: The First 24 Hours';

// ---------- helpers ----------
const run = (text, o = {}) => new TextRun({
  text, bold: o.bold || false, italics: o.italics || false,
  color: o.color || BODY, size: o.size || 20, font: 'Calibri',
});
const box = (size = 20) => new TextRun({ text: '☐  ', font: 'Segoe UI Symbol', size, color: BODY });

function sectionBar(title, bg = MED_BLUE) {
  const b = { style: BorderStyle.SINGLE, size: 2, color: bg, space: 4 };
  return new Paragraph({
    children: [new TextRun({ text: title, bold: true, color: 'FFFFFF', size: 22, font: 'Calibri' })],
    shading: { type: ShadingType.SOLID, color: bg },
    keepNext: true, keepLines: true,
    spacing: { before: 90, after: 55 },
    border: { top: b, bottom: b, left: b, right: b },
  });
}
function line(text, o = {}) {
  return new Paragraph({
    children: [run(text, o)],
    spacing: { after: o.after !== undefined ? o.after : 50, line: 250, lineRule: 'auto' },
  });
}
function check(text) {
  return new Paragraph({
    children: [box(), run(text)],
    spacing: { after: 40, line: 250, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.06) },
  });
}
function bullet(text, color) {
  return new Paragraph({
    children: [run('•  ', { bold: true, color: color || MED_BLUE }), run(text)],
    spacing: { after: 40, line: 250, lineRule: 'auto' },
    indent: { left: convertInchesToTwip(0.06) },
  });
}

// contact table with blanks the producer fills in
const thin = { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' };
const cellBdr = { top: thin, bottom: thin, left: thin, right: thin };
function labelCell(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: cellBdr,
    shading: { type: ShadingType.SOLID, color: LABEL_BG },
    margins: { top: 40, bottom: 40, left: 90, right: 90 },
    children: [new Paragraph({ children: [run(text, { bold: true })], spacing: { after: 0 } })],
  });
}
function blankCell(w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: cellBdr,
    margins: { top: 40, bottom: 40, left: 90, right: 90 },
    children: [new Paragraph({ spacing: { after: 0 } })],
  });
}
function contactTable(rows) {
  const W = [3100, 6692];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(l => new TableRow({
      cantSplit: true, height: { value: 340, rule: HeightRule.ATLEAST },
      children: [labelCell(l, W[0]), blankCell(W[1])],
    })),
  });
}
function callout(text) {
  const b = { style: BorderStyle.SINGLE, size: 6, color: RED };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        borders: { top: b, bottom: b, left: b, right: b },
        shading: { type: ShadingType.SOLID, color: RED_BG },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ children: [run(text, { bold: true, color: RED, size: 21 })], spacing: { after: 0 } })],
      })],
    })],
  });
}

function twoCol(items, useBox) {
  const noB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const none = { top: noB, bottom: noB, left: noB, right: noB };
  const w = Math.floor(CONTENT_W / 2);
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const cells = [];
    for (let c = 0; c < 2; c++) {
      const t = items[i + c];
      cells.push(new TableCell({
        width: { size: w, type: WidthType.DXA }, borders: none,
        margins: { top: 14, bottom: 14, left: 20, right: 110 },
        children: [new Paragraph({
          children: t ? (useBox ? [box(19), run(t, { size: 19 })] : [run('•  ', { bold: true, color: MED_BLUE, size: 19 }), run(t, { size: 19 })]) : [],
          spacing: { after: 0, line: 240, lineRule: 'auto' },
        })],
      }));
    }
    rows.push(new TableRow({ cantSplit: true, children: cells }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function buildHeader() {
  return new Header({ children: [new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  ', color: GRAY, size: 18, font: 'Calibri' }),
      new TextRun({ text: HDR_TITLE, bold: true, color: MED_BLUE, size: 18, font: 'Calibri' }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}
function buildFooter() {
  return new Footer({ children: [new Paragraph({
    children: [new TextRun({ text: `CPC Short Courses  |  ${FTR_TITLE}`, color: GRAY, size: 18, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  })] });
}

// ============================================================
const logo = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
const C = [];

if (logo) C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 50 },
  children: [new ImageRun({ data: logo, transformation: { width: 58, height: 58 }, type: 'png' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 24 },
  children: [new TextRun({ text: TITLE, bold: true, color: DARK_BLUE, size: 32, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 50 },
  children: [new TextRun({ text: 'Pin this up. It is what to do on the morning it does not add up.', italics: true, color: MED_BLUE, size: 21, font: 'Calibri' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 55 },
  children: [new TextRun({ text: '___________________________________', color: GOLD, size: 18, font: 'Calibri' })] }));

// 1 — signs
C.push(sectionBar('1.  STOP AND CALL IF YOU SEE'));
C.push(line('Sudden death loss that does not add up is enough on its own. Alongside it you may see:', { bold: true, size: 20, after: 30 }));
C.push(twoCol([
  'Birds quiet and deeply depressed',
  'Swelling of the skin under the eyes',
  'Egg drop, soft-shelled or shell-less eggs',
  'Combs and wattles swollen and congested',
  'Diarrhea',
  'Hemorrhages on the hocks',
]));
C.push(line('You do not need all of these, and you do not need to know what it is. That is the laboratory’s job.', { italics: true, color: GRAY, size: 19, after: 60 }));

// 2 — the call
C.push(sectionBar('2.  MAKE THE CALL. A SUSPICION IS ENOUGH.'));
C.push(callout('Avian influenza is reportable under the Health of Animals Act. By law you report a suspicion. You do not wait for a lab result to confirm it first.'));
C.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
C.push(line('Fill these in now, while it is a quiet day:', { bold: true, size: 20, after: 60 }));
C.push(contactTable([
  'Your veterinarian',
  'CFIA district office',
  'Marketing board',
  'Hatchery / processor / feed mill',
]));

// 3 — hold everything
C.push(sectionBar('3.  HOLD EVERYTHING IN PLACE WHILE YOU WAIT'));
C.push(twoCol([
  'No birds leave the property',
  'No equipment or vehicles leave',
  'No eggs leave the property',
  'Nobody in who does not have to be',
  'No manure or litter leaves',
  'Write down what you saw, where, and when',
], true));

// 4 — do not
C.push(sectionBar('4.  DO NOT', RED));
C.push(bullet('Do not open birds looking for an answer. Post-mortem is the veterinarian’s job, and cutting into a suspect bird puts virus in the air.', RED));
C.push(bullet('Do not move birds to isolate them somewhere else on the farm. You spread it.', RED));
C.push(bullet('Do not wait overnight to see if it settles down.', RED));

// 5 — neighbor breaks
C.push(sectionBar('5.  IF YOUR NEIGHBOR BREAKS AND YOU ARE CLEAN'));
C.push(bullet('You are probably inside a primary control zone even though your flock is healthy.'));
C.push(bullet('Birds, hatching eggs, table eggs, manure, litter, feed, and anything else that has been around birds need CFIA permission to move into, out of, within, or through that zone.'));
C.push(bullet('Some moves run under a general permit, some need a specific one. The CFIA has an online tool that tells you which.'));
C.push(bullet('Know now who at your processor, hatchery, and feed mill handles permits.'));

// 6 — protect yourself
C.push(sectionBar('6.  PROTECT YOURSELF AND YOUR STAFF'));
C.push(bullet('Wear protective equipment to handle sick or dead birds. Cover up before you walk into a barn with heavy unexplained death loss.'));
C.push(bullet('For a few days after that kind of exposure, watch yourself for fever, cough, or sore and watery eyes.'));
C.push(bullet('If you get sick, tell your physician you work with poultry. That one sentence changes what they test you for.'));

C.push(new Paragraph({ spacing: { before: 70, after: 0 }, alignment: AlignmentType.CENTER,
  children: [run('Summarizes Course 18 (Current Poultry Issues). Confirm current requirements with the CFIA and your veterinarian.', { italics: true, color: GRAY, size: 16 })] }));

const doc = new Document({
  creator: 'CPC Short Courses',
  title: 'Avian Influenza: The First 24 Hours',
  description: 'Course 18 companion action card, CPC Short Courses',
  styles: { default: { document: { run: { font: 'Calibri', size: 20, color: BODY }, paragraph: { spacing: { after: 60 } } } } },
  sections: [{
    properties: { page: { margin: { top: convertInchesToTwip(0.55), bottom: convertInchesToTwip(0.5), left: convertInchesToTwip(0.85), right: convertInchesToTwip(0.85) } } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: C,
  }],
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buf);
console.log('Done:', OUT_FILE);
console.log('Size:', (buf.length / 1024).toFixed(1), 'KB');
