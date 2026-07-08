// ============================================================
// generate-course12.mjs — Course 12: Humane Euthanasia
// CPC Short Courses
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course12.mjs
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
const OUT_DIR    = path.join(__dirname, 'Course 12');
const OUT_FILE   = path.join(OUT_DIR, 'Humane_Euthanasia_draft.docx');
const LOGO_PATH  = path.join(__dirname, 'logo.png');

const COURSE_TITLE   = 'Humane Euthanasia';
const COURSE_NUMBER  = '12';

// COLORS
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';
const RED_WARN  = 'C0504D';
const RED_BG    = 'FDECEA';
const GREEN_BG  = 'EAF2EA';
const GREEN_ACC = '538135';

// HELPERS
function run(text, opts = {}) {
  return new TextRun({
    text, bold: opts.bold || false, italics: opts.italics || false,
    color: opts.color || BODY_GRAY, size: opts.size || 24, font: 'Calibri',
    subScript: opts.subScript || false, superScript: opts.superScript || false,
  });
}
function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text.map(s => new TextRun({ text: s.text, bold: s.bold || false, italics: s.italics || false, color: s.color || BODY_GRAY, size: s.size || 24, font: 'Calibri' }))
    : [run(text, { bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })];
  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent: opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}
function h1(text, pageBreakBefore = false) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 }, pageBreakBefore });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } });
}
function bullet(text, lvl = 0) {
  const children = Array.isArray(text)
    ? text.map(s => new TextRun({ text: s.text, bold: s.bold || false, italics: s.italics || false, color: s.color || BODY_GRAY, size: 24, font: 'Calibri', subScript: s.subScript || false, superScript: s.superScript || false }))
    : [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}
function numbered(text, instance = 1, lvl = 0) {
  const children = Array.isArray(text)
    ? text.map(s => new TextRun({ text: s.text, bold: s.bold || false, italics: s.italics || false, color: s.color || BODY_GRAY, size: 24, font: 'Calibri', subScript: s.subScript || false, superScript: s.superScript || false }))
    : [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'decimal-list', level: lvl, instance }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}
function numberedRef(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })],
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

// SVG image embedded with minimal PNG fallback (required by docx v9 for SVG type)
const PNG_1X1_WHITE = Buffer.from([
  0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x0d,
  0x49,0x48,0x44,0x52,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
  0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,0xde,0x00,0x00,0x00,
  0x0c,0x49,0x44,0x41,0x54,0x08,0xd7,0x63,0xf8,0xcf,0xc0,0x00,
  0x00,0x00,0x02,0x00,0x01,0xe2,0x21,0xbc,0x33,0x00,0x00,0x00,
  0x00,0x49,0x45,0x4e,0x44,0xae,0x42,0x60,0x82,
]);
function svgImage(svgString, caption, widthIn = 5.9) {
  const buf = Buffer.from(svgString, 'utf8');
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  const vbMatch = svgString.match(/viewBox="[^"]*"/);
  let hpx = Math.round(wpx * 0.55);
  if (vbMatch) {
    const parts = vbMatch[0].replace('viewBox="','').replace('"','').trim().split(/\s+/);
    if (parts.length >= 4) {
      const vw = parseFloat(parts[2]), vh = parseFloat(parts[3]);
      if (vw > 0 && vh > 0) hpx = Math.round(wpx * vh / vw);
    }
  }
  return [
    new Paragraph({
      children: [new ImageRun({
        data: buf,
        transformation: { width: wpx, height: hpx },
        type: 'svg',
        fallback: { data: PNG_1X1_WHITE, type: 'png' },
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 0 },
    }),
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
  const leftBdr = { style: BorderStyle.SINGLE, size: 16, color: borderColor };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        children: [
          new Paragraph({ children: [new TextRun({ text: label, bold: true, color: borderColor, size: 22, font: 'Calibri' })], spacing: { before: 60, after: 60 } }),
          new Paragraph({ children: [new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' })], spacing: { before: 0, after: 60 }, alignment: AlignmentType.JUSTIFIED }),
        ],
        shading: { type: ShadingType.SOLID, color: bgColor },
        borders: { top: bdr, bottom: bdr, left: leftBdr, right: bdr },
        margins: { top: convertInchesToTwip(0.1), bottom: convertInchesToTwip(0.1), left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
      })],
    })],
  });
}

function calloutMulti(label, lines, bgColor = 'EBF2FA', borderColor = MED_BLUE) {
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
  const leftBdr = { style: BorderStyle.SINGLE, size: 16, color: borderColor };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        children: [
          new Paragraph({ children: [new TextRun({ text: label, bold: true, color: borderColor, size: 22, font: 'Calibri' })], spacing: { before: 60, after: 60 } }),
          ...lines.map(l => new Paragraph({ children: [new TextRun({ text: l, color: BODY_GRAY, size: 22, font: 'Calibri' })], spacing: { before: 0, after: 40 }, alignment: AlignmentType.LEFT })),
          new Paragraph({ children: [run('')], spacing: { before: 0, after: 20 } }),
        ],
        shading: { type: ShadingType.SOLID, color: bgColor },
        borders: { top: bdr, bottom: bdr, left: leftBdr, right: bdr },
        margins: { top: convertInchesToTwip(0.1), bottom: convertInchesToTwip(0.1), left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
      })],
    })],
  });
}

// DATA TABLE
function dataTable(headers, rows, colWidths) {
  const total = 8640;
  const colW = colWidths || headers.map(() => Math.floor(total / headers.length));
  const hdrBg = MED_BLUE;
  const altBg = 'EBF2FA';
  const bdr   = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cb    = { top: bdr, bottom: bdr, left: bdr, right: bdr };
  const hdrCell = (t, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA }, borders: cb,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [run(t, { bold: true, size: 18, color: 'FFFFFF' })] })],
  });
  const dataCell = (t, i, shade, align) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA }, borders: cb,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({ alignment: align || AlignmentType.LEFT, spacing: { before: 50, after: 50 }, children: [run(t, { size: 18 })] })],
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((c, ci) => dataCell(c, ci, ri % 2 === 1)) })),
    ],
  });
}

// CO2 subscript helpers
const co2r = () => [run('CO'), run('2', { subScript: true })];

// ============================================================
// SVG FIGURES
// ============================================================

const decisionTreeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 580" font-family="Calibri, Arial, sans-serif">
  <rect width="800" height="580" fill="white"/>
  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#1F3864">When to Euthanize: Decision Guide</text>
  <!-- Top box: You find a bird that is not right -->
  <rect x="250" y="50" width="300" height="50" rx="8" fill="#2E74B5"/>
  <text x="400" y="73" text-anchor="middle" font-size="13" fill="white" font-weight="bold">You find a bird that is not right</text>
  <text x="400" y="91" text-anchor="middle" font-size="12" fill="white">injured, ill, or down</text>
  <!-- Arrow down -->
  <line x1="400" y1="100" x2="400" y2="130" stroke="#555" stroke-width="2" marker-end="url(#arr)"/>
  <!-- Diamond: Can it recover? -->
  <polygon points="400,130 530,180 400,230 270,180" fill="#C9A84C"/>
  <text x="400" y="175" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Can it eat, drink,</text>
  <text x="400" y="193" text-anchor="middle" font-size="12" fill="white" font-weight="bold">and move on its own?</text>
  <!-- Arrow left: No -->
  <line x1="270" y1="180" x2="160" y2="180" stroke="#555" stroke-width="2" marker-end="url(#arr)"/>
  <text x="215" y="170" text-anchor="middle" font-size="12" fill="#C0504D" font-weight="bold">No</text>
  <!-- Left box: Euthanize now -->
  <rect x="30" y="155" width="130" height="50" rx="8" fill="#C0504D"/>
  <text x="95" y="178" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Euthanize now</text>
  <text x="95" y="196" text-anchor="middle" font-size="11" fill="white">Do not delay</text>
  <!-- Arrow right: Yes -->
  <line x1="530" y1="180" x2="640" y2="180" stroke="#555" stroke-width="2" marker-end="url(#arr)"/>
  <text x="585" y="170" text-anchor="middle" font-size="12" fill="#538135" font-weight="bold">Yes</text>
  <!-- Right box: Treat / recovery pen -->
  <rect x="640" y="155" width="130" height="50" rx="8" fill="#538135"/>
  <text x="705" y="178" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Treat or move</text>
  <text x="705" y="196" text-anchor="middle" font-size="11" fill="white">to recovery pen</text>
  <!-- Arrow down from diamond -->
  <line x1="400" y1="230" x2="400" y2="260" stroke="#555" stroke-width="2" marker-end="url(#arr)"/>
  <!-- Diamond: Suffering obvious? -->
  <polygon points="400,260 530,310 400,360 270,310" fill="#C9A84C"/>
  <text x="400" y="305" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Is it in obvious</text>
  <text x="400" y="323" text-anchor="middle" font-size="12" fill="white" font-weight="bold">pain or distress?</text>
  <!-- Arrow left: Yes -->
  <line x1="270" y1="310" x2="160" y2="310" stroke="#555" stroke-width="2" marker-end="url(#arr)"/>
  <text x="215" y="300" text-anchor="middle" font-size="12" fill="#C0504D" font-weight="bold">Yes</text>
  <!-- Left box: Euthanize now (second) -->
  <rect x="30" y="285" width="130" height="50" rx="8" fill="#C0504D"/>
  <text x="95" y="308" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Euthanize now</text>
  <text x="95" y="326" text-anchor="middle" font-size="11" fill="white">NFACC requirement</text>
  <!-- Arrow right: No -->
  <line x1="530" y1="310" x2="640" y2="310" stroke="#555" stroke-width="2" marker-end="url(#arr)"/>
  <text x="585" y="300" text-anchor="middle" font-size="12" fill="#538135" font-weight="bold">No</text>
  <!-- Right box: Monitor closely -->
  <rect x="640" y="285" width="130" height="50" rx="8" fill="#538135"/>
  <text x="705" y="308" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Monitor closely</text>
  <text x="705" y="326" text-anchor="middle" font-size="11" fill="white">recheck later</text>
  <!-- Arrow down: Unsure -->
  <line x1="400" y1="360" x2="400" y2="390" stroke="#555" stroke-width="2" marker-end="url(#arr)"/>
  <text x="420" y="380" font-size="12" fill="#555">Unsure?</text>
  <!-- Bottom box: Call your veterinarian -->
  <rect x="250" y="395" width="300" height="50" rx="8" fill="#2E74B5"/>
  <text x="400" y="418" text-anchor="middle" font-size="13" fill="white" font-weight="bold">Call your veterinarian or barn supervisor</text>
  <text x="400" y="436" text-anchor="middle" font-size="12" fill="white">Get guidance before the bird suffers longer</text>
  <!-- Rule box at bottom -->
  <rect x="80" y="470" width="640" height="90" rx="6" fill="#FFF3E0" stroke="#C9A84C" stroke-width="2"/>
  <text x="400" y="492" text-anchor="middle" font-size="12" font-weight="bold" fill="#1F3864">NFACC Code of Practice Rule (2016):</text>
  <text x="400" y="512" text-anchor="middle" font-size="11" fill="#3C3C3C">Sick or injured birds showing obvious signs of pain must be promptly treated or euthanized.</text>
  <text x="400" y="532" text-anchor="middle" font-size="11" fill="#3C3C3C">Compromised chicks at placement must be euthanized within 1 hour of flock processing completion.</text>
  <text x="400" y="552" text-anchor="middle" font-size="11" fill="#888" font-style="italic">Source: NFACC Code of Practice, 2016 [2]</text>
  <!-- Arrow marker -->
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#555"/>
    </marker>
  </defs>
</svg>`;

const verificationSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 378" font-family="Calibri, Arial, sans-serif">
  <rect width="780" height="378" fill="white"/>
  <text x="390" y="28" text-anchor="middle" font-size="15" font-weight="bold" fill="#1F3864">Verifying Death After Euthanasia: Three-Check Protocol</text>
  <!-- Check 1 -->
  <rect x="20" y="50" width="220" height="200" rx="10" fill="#EBF2FA" stroke="#2E74B5" stroke-width="2"/>
  <circle cx="130" cy="90" r="26" fill="#2E74B5"/>
  <text x="130" y="86" text-anchor="middle" font-size="18" fill="white" font-weight="bold">1</text>
  <text x="130" y="101" text-anchor="middle" font-size="10" fill="white">CHECK</text>
  <text x="130" y="132" text-anchor="middle" font-size="13" font-weight="bold" fill="#1F3864">Third Eyelid</text>
  <line x1="50" y1="145" x2="210" y2="145" stroke="#C9A84C" stroke-width="1.5"/>
  <text x="130" y="163" text-anchor="middle" font-size="11" fill="#3C3C3C">Touch the corner of</text>
  <text x="130" y="179" text-anchor="middle" font-size="11" fill="#3C3C3C">the eye and watch</text>
  <text x="130" y="195" text-anchor="middle" font-size="11" fill="#3C3C3C">the third eyelid.</text>
  <text x="130" y="215" text-anchor="middle" font-size="11" font-weight="bold" fill="#C0504D">No sweep = dead</text>
  <text x="130" y="233" text-anchor="middle" font-size="11" fill="#888" font-style="italic">It sweeps = alive</text>
  <!-- Check 2 -->
  <rect x="280" y="50" width="220" height="200" rx="10" fill="#EBF2FA" stroke="#2E74B5" stroke-width="2"/>
  <circle cx="390" cy="90" r="26" fill="#2E74B5"/>
  <text x="390" y="86" text-anchor="middle" font-size="18" fill="white" font-weight="bold">2</text>
  <text x="390" y="101" text-anchor="middle" font-size="10" fill="white">CHECK</text>
  <text x="390" y="132" text-anchor="middle" font-size="13" font-weight="bold" fill="#1F3864">Neck Muscle Tone</text>
  <line x1="310" y1="145" x2="470" y2="145" stroke="#C9A84C" stroke-width="1.5"/>
  <text x="390" y="163" text-anchor="middle" font-size="11" fill="#3C3C3C">A live bird tries to</text>
  <text x="390" y="179" text-anchor="middle" font-size="11" fill="#3C3C3C">lift its head. Watch</text>
  <text x="390" y="195" text-anchor="middle" font-size="11" fill="#3C3C3C">for the effort.</text>
  <text x="390" y="215" text-anchor="middle" font-size="11" font-weight="bold" fill="#C0504D">No lift = dead</text>
  <text x="390" y="233" text-anchor="middle" font-size="11" fill="#888" font-style="italic">Lifts head = alive</text>
  <!-- Check 3 -->
  <rect x="540" y="50" width="220" height="200" rx="10" fill="#EBF2FA" stroke="#2E74B5" stroke-width="2"/>
  <circle cx="650" cy="90" r="26" fill="#2E74B5"/>
  <text x="650" y="86" text-anchor="middle" font-size="18" fill="white" font-weight="bold">3</text>
  <text x="650" y="101" text-anchor="middle" font-size="10" fill="white">CHECK</text>
  <text x="650" y="132" text-anchor="middle" font-size="13" font-weight="bold" fill="#1F3864">Pinch Response</text>
  <line x1="570" y1="145" x2="730" y2="145" stroke="#C9A84C" stroke-width="1.5"/>
  <text x="650" y="163" text-anchor="middle" font-size="11" fill="#3C3C3C">Pinch the comb or a</text>
  <text x="650" y="179" text-anchor="middle" font-size="11" fill="#3C3C3C">toe firmly and watch</text>
  <text x="650" y="195" text-anchor="middle" font-size="11" fill="#3C3C3C">for any reaction.</text>
  <text x="650" y="215" text-anchor="middle" font-size="11" font-weight="bold" fill="#C0504D">No reaction = dead</text>
  <text x="650" y="233" text-anchor="middle" font-size="11" fill="#888" font-style="italic">Flinch = alive</text>
  <!-- Rule -->
  <rect x="20" y="266" width="740" height="100" rx="6" fill="#EAF2EA" stroke="#538135" stroke-width="1.5"/>
  <text x="390" y="290" text-anchor="middle" font-size="12" font-weight="bold" fill="#538135">All three field checks must PASS. Then confirm no heartbeat and no breathing for 5 minutes before disposal.</text>
  <text x="390" y="311" text-anchor="middle" font-size="11" fill="#3C3C3C">Wing flapping and muscle twitching after euthanasia are normal reflexes and do NOT mean the bird is alive.</text>
  <text x="390" y="331" text-anchor="middle" font-size="11" fill="#3C3C3C">If any check fails: apply a secondary method immediately (decapitation or a second application of your primary method).</text>
  <text x="390" y="352" text-anchor="middle" font-size="10" fill="#888" font-style="italic">Source: Poultry Industry Council [5]; Merck and Iowa State VDPAM [4,13]</text>
</svg>`;

// ============================================================
// COVER
// ============================================================
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
    new Paragraph({ children: [new TextRun({ text: 'On-Farm Decision-Making, Methods, and Practical Skill', color: MED_BLUE, size: 26, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 560 } }),
    new Paragraph({ children: [run('')], alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } }, spacing: { before: 0, after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 24, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'Duration: 1-Hour Lecture, 1-Hour Workshop', color: '595959', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'July 2026', color: '595959', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: 'Disclaimer: This course is intended for educational purposes only. The information provided does not replace professional veterinary advice, diagnosis, or treatment. Euthanasia procedures must comply with applicable provincial animal welfare legislation. Always consult a licensed veterinarian for guidance on welfare decisions.', color: '888888', size: 18, font: 'Calibri', italics: true })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 0 } }),
  );
  return { properties: { page: { margin: pageMargin } }, headers: { default: buildHeader() }, footers: { default: buildFooter() }, children };
}

// ============================================================
// DOCUMENT BODY
// ============================================================
function buildBody() {
  return [
    // TOC (body section already starts on a new page via the section break;
    // no leading pageBreak, which would leave a blank page 2)
    new Paragraph({ text: 'Table of Contents', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 240 } }),
    new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-2', stylesWithLevels: [{ styleId: 'Heading1', level: 1 }, { styleId: 'Heading2', level: 2 }] }),

    // ─── INTRODUCTION ───
    // The 38-row TOC fills its page; Introduction flows to the next page on its
    // own. A pageBreak here would land an empty break-paragraph and blank a page.
    h1('Introduction'),
    para('Euthanasia is not a failure of farm management. A bird that cannot eat, cannot drink, or cannot move without pain is already suffering. Getting it off feed and water faster does not help it. Doing nothing is the failure. Timely, humane euthanasia is one of the most important skills on a commercial farm, and it is one that every person on the floor needs to be able to do correctly.'),
    para('This course covers the why, when, and how of humane euthanasia for Canadian commercial poultry farmers working with broilers, layers, and breeders. It is built around the methods approved by the American Veterinary Medical Association (AVMA) Guidelines for the Euthanasia of Animals (2020 Edition) [1] and the National Farm Animal Care Council (NFACC) Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys [2]. Both documents carry regulatory weight in Canada through the Chicken Farmers of Canada Animal Care Program and equivalent programs for other species [3].'),
    para('You will learn how to recognize when a bird cannot recover, how to choose the right method for the bird in front of you, how to perform the technique correctly, how to confirm that the job is done, and how to handle carcasses and paperwork afterward. The workshop session builds the hands-on competency that the lecture introduces.'),
    spacer(80),
    para('Learning Objectives', { bold: true }),
    bullet('Explain what humane euthanasia is and why the NFACC Code requires it.'),
    bullet('Spot the signs that tell you a bird needs to come off the floor now.'),
    bullet('Pick the right method for the bird in front of you, based on its size, species, and the equipment you have.'),
    bullet('Carry out each approved method correctly, and show you can do it under supervision.'),
    bullet('Confirm the bird is actually dead with the three-check protocol before it goes in the bin.'),
    bullet('Protect yourself and the rest of the flock while you work and after you finish.'),
    bullet('Handle and dispose of carcasses the way your province and farm program require.'),
    bullet('Keep the records an auditor will ask to see.'),

    // ─── SECTION 1 ───
    h1('1. Understanding Humane Euthanasia', true),
    h2('1.1  Definition and Purpose'),
    para('Humane euthanasia means ending a bird\'s life fast, with no chance of it coming back, and with as little pain and fear as possible. The AVMA Guidelines describe the goal as rapid loss of consciousness followed by cardiac or respiratory arrest and, ultimately, complete loss of brain function [1]. The key word is rapid. A slow or incomplete procedure is not euthanasia. It is prolonged suffering by a different name.'),
    para('On a commercial farm, the birds you will be euthanizing are ones that have no realistic chance of recovery. They are suffering now, and they will keep suffering if you leave them. The job is simple: end the pain quickly, get that bird out of the flock, and stop it from becoming a disease source for the birds around it.'),
    para('The NFACC Code of Practice is direct on this point. Sick or injured birds showing obvious signs of pain must be promptly treated or euthanized [2]. "Promptly" is not a suggestion. Farmers and barn staff who delay euthanasia for compromised birds risk both animal welfare violations and audit failures under the Chicken Farmers of Canada Animal Care Program [3].'),

    h2('1.2  Ethical Considerations'),
    para('Handling a living animal at the end of its life requires composure and focus. That is not always easy. Birds can struggle, reflexes can look alarming even when the animal is already unconscious, and the process can feel uncomfortable for people who have not done it before. These reactions are normal. What matters is that the discomfort you feel does not cause you to rush, skip a step, or avoid doing the job at all.'),
    para('A bird left to suffer in the corner of a barn because no one wanted to deal with it is a welfare failure. The ethical standard for euthanasia is not comfort for the person performing it. It is the fastest possible end of suffering for the animal. Professional composure comes with training and practice, which is exactly what this course provides.'),
    para('Staff who perform euthanasia regularly need access to refresher training and a clear understanding that they are doing the right thing for the animal. Farms where euthanasia is treated as routine farm management, not as a distressing exception, have better welfare outcomes and better audit records [3].'),

    h2('1.3  Why Timely Euthanasia Matters for Welfare and Productivity'),
    para('A bird that cannot compete for feed and water drags flock uniformity down. It sits in the corner, loses body condition, and becomes a focus for pecking. Left in place, it can also become a source of secondary infection for surrounding birds. Pulling it early eliminates these effects.'),
    para('Compromised chicks at placement are the most important group to catch early. Under the Chicken Farmers of Canada Animal Care Program, birds in pain must be promptly treated or euthanized, and culls must be handled daily, not left [3]. A chick that cannot stand or find feed in the first 24 hours has almost no chance of reaching market weight profitably. Every hour you delay costs the bird more suffering and costs you more feed and floor space.'),
    spacer(80),
    callout('Chick Placement Rule', 'Any chick that cannot stand, has an obvious deformity preventing it from reaching feed or water, or is clearly below half the expected weight of its pen-mates must be euthanized within the first handling pass. Do not place it and hope. NFACC requires compromised birds at placement to be euthanized within 1 hour of completion of flock processing. [2]', 'EBF2FA', MED_BLUE),
    spacer(80),
    ...image(figBuf('chicke placement.jpg'), 'Photo 1.1: Day-old chicks settling in at placement, active and spread out across fresh litter with easy access to feed and water. Run a chick check the same day: sample around 100 chicks across the brooding area and score their condition and crop fill, so you catch a weak batch before birds are lost in the flock. Source: cobbgenetics.com.', 5.1),
    spacer(60),
    para('Pulling sick birds early also protects the flock. A bird with an open wound, a respiratory bug, or a gut infection is shedding germs into the barn the whole time it sits there. Get it out fast and you lower the disease pressure on the rest, which can save you a treatment later.'),

    // ─── SECTION 2 ───
    h1('2. When to Euthanize a Bird', true),
    h2('2.1  Criteria for Euthanasia'),
    para('The question is not "could this bird possibly survive?" The question is "can this bird reach market in reasonable condition without ongoing suffering?" If the answer is no, euthanize now.'),
    para('The following conditions require immediate euthanasia. Do not put the bird back and check on it later. Do not wait for your supervisor to walk by. Any bird with any of these signs needs to come off the floor now:'),
    bullet('Cannot stand or bear weight on both legs, and does not respond to gentle encouragement to move.'),
    bullet('Cannot reach feed or water without being moved or supported.'),
    bullet('Has an open wound that exposes muscle, bone, or organ tissue.'),
    bullet('Is being pecked by other birds and is unable to escape.'),
    bullet('Is severely emaciated with no muscle cover over the keel.'),
    bullet('Has labored, open-mouth breathing at rest in normal temperature conditions.'),
    bullet('Appears to have significant neurological impairment: circling, star-gazing, or complete loss of righting reflex with no improvement in 10 minutes.'),
    bullet('Has been found in poor condition that has clearly been present for more than a day.'),
    spacer(60),
    ...image(figBuf('chick abnormalities.jpg'), 'Photo 2.1: Common chick defects that make a bird a cull on the first handling pass: cross-beak, splayed or twisted legs, a twisted neck, an unhealed or infected navel, and open-mouth labored breathing, along with thin, patchy down. Birds like these cannot reach feed and water on their own and will not catch up. Source: salto.com.ph; ceva.vn; Olkowski et al., Acta Vet Scand 2019; Taha & Mohammed, J Educ Sci 2022.', 5.5),
    spacer(120),

    h2('2.2  Recognizing Irreversible Suffering'),
    para('Some conditions look bad but are actually treatable. Others look manageable but are already past the point of recovery. The table below gives you a quick guide to what can typically be managed versus what requires immediate euthanasia in a commercial broiler or layer setting.'),
    spacer(80),
    dataTable(
      ['Condition', 'Manageable with Treatment', 'Euthanize Now'],
      [
        ['Leg / mobility problem', 'Mild leg weakness: bird can stand with encouragement, access feed and water on its own', 'Cannot stand, cannot reach feed or water, has been down for more than 1 day'],
        ['Respiratory signs', 'Mild rattling in one or two birds: isolate, monitor, call veterinarian', 'Gasping open-mouthed at rest, head pulled back, cyanotic comb in cool conditions'],
        ['Wound / injury', 'Minor superficial wound: clean, monitor', 'Open wound exposing muscle, bone, or viscera. Active pecking target.'],
        ['Body condition', 'Thin but mobile bird in a young flock: check management', 'Emaciated, keel bone fully palpable with no muscle cover, dehydrated'],
        ['Neurological signs', 'Mild incoordination in a young chick: move to recovery pen, recheck within a few hours', 'Full loss of righting reflex, circling, or star-gazing with no improvement in 10 min'],
        ['Deformity', 'Mild beak or toe defect not affecting feed access', 'Cross-beak severe enough to prevent feed intake, or any structural defect preventing normal movement'],
      ],
      [2400, 3200, 3040]
    ),
    spacer(160),

    h2('2.3  Decision-Making in Practice'),
    ...svgImage(decisionTreeSvg, 'Figure 2.1: Decision guide for when to euthanize. Start at the top and work through each question. Any bird that cannot eat, drink, or move on its own, or that is in obvious pain, must come off the floor. Source: CPC Short Courses.', 5.9),
    para('If you are unsure, call your veterinarian or barn supervisor before you walk away from the bird. Do not put it back and hope. Hope is not a welfare plan. If you are waiting for guidance, keep the bird separated from the flock and away from active pecking while you make the call.'),

    // ─── SECTION 3 ───
    h1('3. Approved Humane Euthanasia Methods', true),
    h2('3.1  Overview of Approved Methods'),
    para('The AVMA 2020 Guidelines classify euthanasia methods as Acceptable or Acceptable with Conditions for each species [1]. The Merck Veterinary Manual translates this into practical on-farm guidance [4]. For poultry, the methods a trained worker can use fall into three groups: physical, gas, and injectable. Each has its place. No single method fits every bird or every barn.'),
    spacer(80),
    dataTable(
      ['Method', 'Who Can Use It', 'Best For', 'Key Conditions'],
      [
        ['Manual cervical dislocation', 'Trained farm worker', 'Individual birds up to approximately 2.3 kg (broilers to 7 weeks)', 'Requires demonstrated training. Single rapid motion. Confirm death with 3-check protocol.'],
        ['Mechanical cervical dislocation (KED device)', 'Trained farm worker', 'Individual birds: KED-S up to 1.8 kg; KED-C up to 13.6 kg (broiler breeders)', 'Device must match bird size. Same 3-check confirmation required.'],
        ['Non-penetrating captive bolt', 'Trained farm worker', 'Heavier birds: breeders, turkeys', 'Apply to the correct skull site. Kills in one step in poultry. Confirm death, and use a backup only if a bird is not dead.'],
        ['CO2 euthanasia', 'Trained farm worker', 'Small groups, individual birds, hatchery culls', 'Minimum 80% CO2 for chicks; >50% for adults. Continue until all reflexes cease.'],
        ['Blunt force trauma', 'Trained farm worker', 'Large birds where other methods are not practical', 'Restrain the bird. One vertical blow to the top of the head with a heavy tool. Training critical. Confirm death; secondary method if needed.'],
        ['Decapitation', 'Trained farm worker', 'Smaller birds; definitive backup for any size', 'Sharp overlapping-blade shears, one clean cut. Kills by blood loss, so use cervical dislocation or captive bolt first where practical. Confirm death.'],
        ['Injectable barbiturate overdose', 'Licensed veterinarian only', 'Any bird when a veterinarian is present', 'Intravenous injection. Fastest, most reliable. Not available for routine farm use.'],
      ],
      [1800, 1800, 2160, 2880]
    ),
    spacer(160),
    para([{ text: 'Source:', bold: true }, { text: ' American Veterinary Medical Association, Guidelines for the Euthanasia of Animals: 2020 Edition [1]; Merck Veterinary Manual (citing AVMA 2020) [4]; Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry [5].' }]),

    h2('3.2  Manual Cervical Dislocation'),
    para('Manual cervical dislocation is the most widely used method for individual bird euthanasia on Canadian farms. Done right by a trained worker, it knocks the bird out and kills it in one motion by tearing apart the brainstem and spinal cord. Done wrong, the bird stays conscious and suffers.'),
    para([{ text: 'When it is appropriate:', bold: true }, { text: ' Broilers up to approximately 2.3 kg (typically up to 7 weeks of age). Smaller layers and growers. The AVMA gives about 2.3 kg as the practical upper limit, and it becomes difficult and unreliable in heavier birds [1,6,7].' }]),
    para([{ text: 'When it is not appropriate:', bold: true }, { text: ' Broiler breeders at production weight (3.5 to 4.5 kg). Heavy turkeys. Birds over 3 kg in any situation where a mechanical device or captive bolt is available [6].' }]),
    para('Here is the technique, based on published broiler research [6]:'),
    numbered('Take the bird\'s legs and lower body in one hand and rest its back against your thigh or side.'),
    numbered('With your other hand, grip the head right behind the skull, between your thumb and first two fingers.'),
    numbered('In a single rapid motion: pull the head firmly downward and simultaneously press your knuckle into the back of the neck at the skull base, stretching and dislocating the cervical vertebrae.'),
    numbered('The motion must be fast and decisive. A slow pull does not dislocate the joint. Do it in one smooth movement.'),
    numbered('You will feel the separation, and the neck will elongate.'),
    numbered('Before the bird goes in the mortality bin, run the three-check protocol to confirm it is dead (see Section 5).'),
    spacer(60),
    ...image(figBuf('chick Euthanasia.jpg'), 'Photo 3.1: Manual cervical dislocation, step by step. Secure the lower body and legs in one hand (left), grip the head behind the skull between thumb and fingers (center), then stretch the neck down and back in one fast motion (right). The diagrams show the target: the neck must separate at the base of the skull, between the skull and the first vertebra (green check), not lower down the neck (red X). Source: Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016 [5].', 5.9),
    spacer(80),
    callout('Key Point', 'Wing flapping after cervical dislocation is a normal reflex response, not a sign that the bird is still conscious. A bird with a properly dislocated cervical joint is irreversibly unconscious from the moment of dislocation. The flapping is spinal motor activity, not voluntary movement. Do not be alarmed by it. Do be alarmed if the bird raises its head and tries to right itself. That means the dislocation failed.', 'EBF2FA', MED_BLUE),
    spacer(120),

    h2('3.3  Mechanical Cervical Dislocation (KED Devices)'),
    para('KED stands for Koechner Euthanizing Device, a plier-style tool positioned at the base of the skull, perpendicular to the neck. The handles are closed in a single firm motion, separating the skull from the first cervical vertebra. It comes in several sizes to match different bird weights [8]:'),
    para([{ text: 'Device sizing:', bold: true }]),
    bullet('KED-S: birds up to 1.8 kg (chicks, pullets, young growers)'),
    bullet('KED-C: birds up to approximately 13.6 kg (broiler breeders, large market birds)'),
    bullet('KED-T: birds up to approximately 29 kg (turkeys)'),
    spacer(60),
    ...image(figBuf('KED.jpg'), 'Photo 3.2: The three KED sizes, KED-S, KED-C, and KED-T, each matched to bird weight (top row). The bottom panels show correct use: the device is closed at the base of the skull, between the skull and the first neck vertebra, on a chick with the KED-S (left) and a turkey with the KED-T (right). Match the device to the bird and place it at the skull base every time. Source: Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016 [5].', 5.9),
    spacer(60),
    para('Do not reach for the KED as an automatic upgrade for birds you can already put down by hand. In broilers, hand dislocation worked faster and cleaner, and reflexes came back in about half the KED birds versus very few done by hand [6]. For broilers in this weight range, do it by hand (see Section 3.2).'),
    para('The KED earns its place on birds too heavy for reliable hand dislocation, mainly broiler breeders at production weight. In that range it works well, about a 98% kill rate in one breeder study [8]. Use it there, not as a substitute for hand dislocation on smaller birds.'),
    para('Expect more skin damage and bleeding with the KED, and reflexes can return after it. Neither tells you the bird is dead. Run the three-check protocol (Section 5) on every KED bird before it goes in the mortality bin.'),

    h2('3.4  Non-Penetrating Captive Bolt'),
    para('The non-penetrating captive bolt strikes the skull hard without breaking through it. In a bird, that alone is enough to kill. A chicken or turkey skull is small and light, so the blow causes massive brain trauma and death, not just a knockout. In trials on chickens and turkeys, purpose-built poultry devices like the Zephyr and the TED killed the bird outright almost every time, 89 to 100% [9,10]. Cattle and pigs are different: there the same kind of bolt only stuns, so you have to follow with a separate kill step.'),
    para('Captive bolt devices are particularly useful for heavier birds where manual cervical dislocation is not reliable: broiler breeders at late production weight, large male turkeys, and birds where a mechanical cervical dislocation device of the appropriate size is not available. Placement is what makes it work, and it differs by species [5]:'),
    bullet('Chickens: place the bolt directly behind the comb, firmly against the head, with the bird\'s "chin" resting on a hard, solid surface.'),
    bullet('Turkeys: place the bolt on top of the head, between the ears and eyes, with the bird\'s "chin" on a hard, solid surface.'),
    para('Follow the manufacturer\'s instructions in all cases. With a non-penetrating device, fire twice in quick succession if it allows. A penetrating bolt needs only one shot. Hands-on training on the specific device is mandatory before you use it.'),
    spacer(60),
    ...image(figBuf('Captive bolt.jpg'), 'Photo 3.3: The non-penetrating captive bolt, a Zephyr (left), and where to place it. On a chicken, apply it behind the comb, firmly against the head (center). On a turkey, apply it on top of the head, between the ears and eyes (right). The skull views mark the target site on a chicken (red) and a turkey (blue). Source: Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016 [5]; CPC Short Courses.', 5.9),
    spacer(60),
    para('No application is perfect, so confirm death with the three-check protocol on every bird and apply a backup if one is not dead (see Section 5). Used properly, the captive bolt is one of the fastest ways to put down a heavy bird where cervical dislocation is not practical [8].'),

    h2('3.5  CO2 Euthanasia'),
    para([
      { text: 'Carbon dioxide (' }, { text: 'CO', bold: false }, { text: '2' }, { text: ') is an approved poultry method under the AVMA 2020 Guidelines, listed as "Acceptable with Conditions" [1]. The gas pushes the oxygen out of the air the bird is breathing, so it loses consciousness and then dies. It works well for hatchery culls, small groups, or the odd individual bird when a manual or mechanical method is not practical.' },
    ]),
    para('Here is the practical part: you fill a sealed chamber from a CO2 cylinder, then put the birds in. You do not measure a percentage or meter the gas. Immersing birds in a chamber already full of CO2 is what the research shows works [11]. CO2 is heavier than air, so a sealed chamber filled from the cylinder pushes the air out and reaches the high concentration you need on its own. The birds are your gauge. In a proper chamber they lose consciousness within seconds and stop moving.'),
    para('What matters in practice [1,11]:'),
    bullet('Prefill the chamber from the cylinder before the birds go in. They go down faster and struggle less than if you trickle gas in with the birds already inside.'),
    bullet('Fill it full, and fill it fuller for chicks. Day-old to 3-week chicks need a higher concentration than adult birds to die quickly, so a half-filled chamber will not do. Fill it, then immerse them.'),
    bullet('Keep the gas running until every bird has completely stopped moving, then leave it on at least 1 more minute to be sure.'),
    bullet('The chamber must seal. A leaky lid lets air back in, drops the concentration, and gives a slower, less humane death. Check the seal every time.'),
    bullet([{ text: 'The only way to actually read the concentration is a ' }, { text: 'CO' }, { text: '2', subScript: true }, { text: ' gas meter. Without one, trust a full, sealed, prefilled chamber and watch that the birds go down fast.' }]),
    spacer(60),
    ...image(figBuf('CO2.jpg'), 'Photo 3.5: A practical CO2 euthanasia station. Two CO2 cylinders, chained upright, feed a sealed chamber through a regulator and hose. Birds go in the trays, and the sealed lid keeps the gas concentration high. The exhaust fan above the station protects the worker. Source: Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016 [5].', 3.2),
    spacer(80),
    calloutMulti(
      'CO2 Safety: Critical Worker Protection Rules',
      [
        'CO2 is colorless, odorless, and heavier than air. It collects at floor level and in low areas.',
        'Always euthanize in a well-ventilated area. Never use a CO2 chamber in a confined space without airflow.',
        'Never lean over an open CO2 chamber. Approach from the side, not directly above.',
        'CO2 concentrations above 3% cause headache and dizziness. Concentrations above 7-10% cause rapid unconsciousness.',
        'If you feel lightheaded or short of breath, move to fresh air immediately and tell someone.',
        'CO2 cylinders must be stored and transported upright, secured against tipping.',
      ],
      RED_BG, RED_WARN
    ),
    spacer(120),

    h2('3.6  Blunt Force Trauma'),
    para('Blunt force trauma is a sharp, heavy blow to the top of the head that causes immediate brain damage and knocks the bird out on the spot. The Poultry Industry Council guidelines put it forward for large birds where the other methods are not practical, for example a heavy bird when you have no captive bolt and cervical dislocation is not reliable [5]. The AVMA 2020 Guidelines list it as acceptable with conditions [1].'),
    para('Restrain the bird so the strike lands where you aim, the same way every time. Deliver one vertical blow to the top of the head, hard enough to knock the bird out cold in a single strike. The tool has to be big enough to hit the head reliably and heavy enough to do it in one blow. A missed or weak strike is both a welfare failure and a danger to you, so training and practice are not optional [5].'),
    spacer(60),
    ...image(figBuf('Blunt force.jpg'), 'Photo 3.6: The tool has to be big enough and heavy enough to knock a bird out in one blow. A heavy mallet (top) or a solid club (bottom) delivers a reliable single strike. A light or short object risks a missed or partial blow. Source: CPC Short Courses.', 5.0),
    spacer(60),
    para('Death comes from the brain injury itself, or from a secondary method once the bird is out (see Section 5.3). Confirm death with the three-check protocol before disposal. This is a hard method to carry out and to watch, so weigh its effect on you and anyone nearby, and use a cleaner method whenever one is available [1,5].'),

    h2('3.7  Decapitation'),
    para('Decapitation takes the head off in a single stroke of sharp shears. It is final: once the head is off, the bird cannot come back, which is why it is the go-to backup when another method fails (see Section 5.3). The AVMA 2020 Guidelines list it as an approved method with conditions [1].'),
    para('The honest catch is that decapitation kills by blood loss, not by wrecking the brain, so the bird is not knocked out on the spot the way it is with cervical dislocation or a captive bolt. Brain activity can carry on in the severed head for a short time. So use cervical dislocation or a captive bolt first where either is practical, and reach for decapitation on smaller birds, or when you need a sure way to finish the job.'),
    para('If you use it, the conditions that matter [5]:'),
    bullet('Shears must be sharp, and the blades must overlap when they close, not just meet edge to edge. Dull or meeting blades crush instead of cut.'),
    bullet('Match the shears to the bird. Light poultry scissors are for small birds. Heavier birds need heavy shears that take the neck in one cut.'),
    bullet('For larger birds, a restraining cone helps. It holds the body and wings still and keeps the head down, which makes the cut cleaner and safer and keeps the bird calmer.'),
    bullet('One clean, fast cut all the way through the neck. Do not saw at it.'),
    bullet('Confirm death with the three-check protocol before the bird goes in the mortality bin (see Section 5).'),
    spacer(60),
    ...image(figBuf('decapitation.jpg'), 'Photo 3.4: Decapitation setups. A restraining cone holds a larger bird still with the head down for a clean cut (chicken, top left; turkey, top right). Smaller birds and chicks are held by hand and decapitated with sharp shears (bottom). Source: Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry, 2nd ed., 2016 [5]; CPC Short Courses.', 4.5),
    spacer(60),

    h2('3.8  Methods That Are NOT Acceptable'),
    para('The methods below make birds suffer, do not kill reliably, or put people at risk. They are not acceptable for poultry, and you must not use them:'),
    bullet('Drowning: causes air hunger and distress before unconsciousness. Not acceptable for any species.'),
    bullet('Thoracic compression (chest squeezing): causes pain and prolonged asphyxia. Not acceptable for conscious birds.'),
    bullet('Placing birds in plastic bags, alone or in groups, without gas: causes hypoxia with prolonged distress.'),
    bullet('Burying or burning live birds: illegal under provincial animal welfare legislation.'),
    bullet('CO2 at low concentrations (below 30%) as the only method: does not produce reliable rapid unconsciousness.'),
    bullet('Carbon monoxide (CO): extreme human safety hazard. Not used in commercial settings.'),
    bullet('Neck twisting without proper dislocation of the joint: does not consistently destroy brainstem function. Must be the rapid dislocating motion described in Section 3.2.'),

    // ─── SECTION 4 ───
    h1('4. Practical Steps for Each Approved Method', true),
    h2('4.1  Equipment Required'),
    para('Before the flock arrives, every barn should have a complete euthanasia kit in a known location and every person working in the barn should know where it is. You do not want to be searching for equipment with a suffering bird in your hand.'),
    spacer(80),
    dataTable(
      ['Method', 'Equipment Required', 'Stored Where'],
      [
        ['Manual cervical dislocation', 'Gloves. Mortality bin. Death-confirmation checklist.', 'Barn entry point or supervisor station'],
        ['KED device', 'KED device (correct size for flock). Gloves. Mortality bin.', 'Barn entry point, secured wall mount'],
        ['Captive bolt', 'Captive bolt device. Cartridges or compressed gas charge. Safety lock. Gloves. Mortality bin. Backup method (poultry shears) if an application fails.', 'Locked barn cabinet'],
        ['CO2 chamber', 'CO2 cylinder with regulator and hose. Sealable chamber sized for the birds. Gloves. Mortality bin.', 'Barn entry, well-ventilated area'],
        ['Blunt force trauma', 'Hard, smooth, rounded object (rubber mallet). Gloves. Mortality bin.', 'Barn entry point'],
        ['Decapitation', 'Sharp poultry shears sized to the bird. Gloves. Mortality bin.', 'Barn entry point'],
      ],
      [1800, 4320, 2520]
    ),
    spacer(160),

    h2('4.2  Worker Safety and Biosecurity'),
    para('Poultry euthanasia carries real zoonotic and contamination risks. These are the non-negotiables:'),
    bullet([{ text: 'Gloves every time.', bold: true }, { text: ' Salmonella, Campylobacter, and other pathogens shed by sick birds can infect humans through skin contact, especially through cuts or abrasions. Gloves protect you.' }]),
    bullet([{ text: 'No contact between carcasses and your face.', bold: true }, { text: ' Respiratory pathogens can be transmitted through aerosols when handling freshly dead birds. Do not rub your eyes, nose, or mouth with gloved hands.' }]),
    bullet([{ text: 'Change gloves between pens.', bold: true }, { text: ' Working several areas of the barn? Change or sanitize your gloves each time you move to a new section.' }]),
    bullet([{ text: 'Sealed mortality bin, lid on.', bold: true }, { text: ' Every bird you put down goes straight into it. Never leave carcasses on the floor.' }]),
    bullet([{ text: 'Wash up after.', bold: true }, { text: ' Once the gloves come off, wash with soap and water or sanitize before you touch anything else in the barn.' }]),
    bullet([{ text: 'Deal with the equipment properly.', bold: true }, { text: ' Spent captive bolt cartridges go in your sharps disposal. CO2 cylinders go back to the supplier. Anything single-use and contaminated goes in a sealed waste bag.' }]),
    para('For farms enrolled in On-Farm Food Safety programs, the record of each euthanasia event (method used, number of birds, date) may be required as part of your audit documentation. A brief daily mortality log that includes euthanasia events satisfies this requirement [3].'),

    h2('4.3  Differences by Bird Age and Size'),
    para('The same principles apply across all ages and sizes, but the method you choose and the technique you use need to match the bird.'),
    spacer(80),
    dataTable(
      ['Bird Type', 'Weight Range', 'Recommended Method(s)', 'Notes'],
      [
        ['Day-old / placement chicks', '< 100 g', 'CO2 (for groups); manual cervical dislocation (single bird)', 'Chicks tolerate CO2, so fill the chamber fully and immerse them. For a single chick, cervical dislocation is quick.'],
        ['Broiler chicks (1-3 weeks)', '100 g to 500 g', 'Manual cervical dislocation; KED-S; CO2', 'Cervical dislocation is easy at this size. The KED-S fits birds up to 1.8 kg. CO2 works for groups.'],
        ['Market-age broilers (5-7 weeks)', '1.5 to 3 kg', 'Manual cervical dislocation (up to about 2.3 kg); KED-C', 'Hand dislocation works to about 2.3 kg. Above that, use the KED-C.'],
        ['Broiler breeders (males)', '3.5 to 5 kg', 'KED-C; non-penetrating captive bolt; blunt force trauma', 'Too heavy for reliable hand dislocation, and a CO2 chamber is not practical at this size. Use a device, or blunt force trauma where no device is available.'],
        ['Broiler breeders (females)', '2.5 to 4 kg', 'Manual cervical dislocation (if under 3 kg); KED-C', 'Check the individual bird. Use the KED-C for birds you cannot confidently dislocate by hand.'],
        ['Commercial layers', '1.5 to 2 kg', 'Manual cervical dislocation; KED-C; CO2', 'Same approach as market-age broilers. CO2 works for small groups.'],
        ['Turkeys (small)', '< 5 kg', 'KED-C; manual cervical dislocation (small birds)', 'The KED-C covers this range. Restraint is harder than with chickens.'],
        ['Turkeys (large, commercial)', '10 to 20 kg', 'KED-T; non-penetrating captive bolt', 'Too heavy for hand dislocation and for a CO2 chamber. Use the turkey KED-T (rated to 29 kg) or a non-penetrating captive bolt.'],
      ],
      [2000, 1500, 2600, 2540]
    ),
    spacer(160),
    para([{ text: 'KED sizing: ', bold: true, size: 20 }, { text: 'KED-S fits birds up to 1.8 kg, KED-C up to 13.6 kg, and the turkey KED-T up to 29 kg (see Section 3.3).', size: 20 }]),
    para([{ text: 'Source:', bold: true }, { text: ' AVMA Guidelines for the Euthanasia of Animals: 2020 Edition [1]; Boyal et al. 2022, Poultry Science [8]; Ripplinger et al. 2024, Poultry Science [7]; Woolcott et al. 2018, Animals [10]; Humane Slaughter Association [12].' }]),

    // ─── SECTION 5 ───
    h1('5. Verification of Death', true),
    h2('5.1  Why Verification Matters'),
    para('Wing flapping, muscle tremors, and gasping movements are common after euthanasia. They are reflex responses from the nervous system, not signs of consciousness. If you drop a bird in the mortality bin based on those signs alone, you may be disposing of a bird that is not fully dead.'),
    para('To be sure a bird is dead, you have to check the reflexes and responses that only switch off once the brain has truly stopped. The twitching and gasping after euthanasia do not tell you that. The field checks below do [5].'),

    h2('5.2  The Three-Check Protocol'),
    ...image(figBuf('three checks.jpg'), 'Figure 5.1: The three field checks for confirming death, the third-eyelid reflex, neck muscle tone, and pinch response, with the heartbeat and breathing check as the final backstop. Source: Poultry Industry Council [5]; CPC Short Courses.', 5.9),
    para('Run these three field checks on every bird, in this order [5]:'),
    numbered([{ text: 'Third-eyelid reflex:', bold: true }, { text: ' Touch the corner of the eye lightly with a fingertip or a clean swab. In a live bird, the third eyelid, a thin pale membrane, flicks across the eye. It keeps working until the bird is almost gone, so it is the check you can trust most. No flick across the eye means the bird is dead.' }], 2),
    numbered([{ text: 'Neck muscle tone:', bold: true }, { text: ' A bird that is still alive tries to lift its head. Hold the bird and watch. No effort to raise the head means the bird is deeply unconscious or dead.' }], 2),
    numbered([{ text: 'Response to a pinch:', bold: true }, { text: ' Pinch the comb or a toe hard. Any flinch or pull-away means the bird is not dead, so go straight to a backup method. No reaction at all tells you it is dead.' }], 2),
    spacer(80),
    callout('Confirm and Wait 5 Minutes', 'The reflex checks tell you the bird is dead, but do not rush it to the bin. Wait 5 minutes, then confirm there is no heartbeat (feel or listen behind the left elbow, keel side) and no breathing (no chest or abdomen movement). This matters most after CO2, where a bird pulled out too early can come back. Five minutes with no heartbeat and no breathing confirms death [4,13].', 'EBF2FA', MED_BLUE),
    spacer(120),

    h2('5.3  When Euthanasia Fails'),
    para('Method failures happen, even with trained operators. A cervical dislocation that did not fully separate the joint can leave a bird unconscious but not dead. So can a CO2 exposure cut short, or a captive bolt that caught the skull at the wrong angle. If any of the three checks fails, the bird needs immediate secondary treatment.'),
    para('Secondary methods for an incompletely euthanized bird:'),
    bullet('Manual cervical dislocation as a follow-up to CO2 or captive bolt (if the bird is small enough).'),
    bullet('Decapitation with poultry shears: definitive. Always confirms death. Appropriate for any size bird when other methods fail.'),
    bullet('Apply a second CO2 exposure if equipment is available and the first exposure time was insufficient.'),
    para('Do not leave the barn with a bird that has not passed all three checks. Do not hand the responsibility to another person without making sure they know the bird still needs attention. You performed the euthanasia, and confirmation of death is part of that job.'),

    // ─── SECTION 6 ───
    h1('6. Carcass Disposal', true),
    h2('6.1  Approved Disposal Methods'),
    para('Carcass disposal for euthanized birds follows the same rules as routine mortality management. In Canada, disposal regulations are set by provincial governments, not the federal CFIA, and they vary by province. The table below covers the methods used on Canadian farms: rendering, composting, on-farm burial, and incineration. Your farm program and provincial regulations specify which methods apply to your operation.'),
    spacer(80),
    dataTable(
      ['Disposal Method', 'How It Works', 'Key Requirements'],
      [
        ['Rendering', 'Carcasses collected by a licensed renderer and processed into meal and fat', 'British Columbia: store carcasses in sealed containers, away from live birds, and have a dead stock service pick them up before they start to decompose. Pickup is more urgent in warm weather and less urgent when carcasses are frozen [14]. Manitoba requires refrigeration or freezing if carcasses are held more than 48 hours after death [15]. The renderer sets the collection schedule.'],
        ['On-farm composting', 'Carcasses layered with carbon-rich material (sawdust, straw, wood chips) in an active compost pile', 'Carbon material must fully cover each layer of carcasses. The pile must reach internal temperatures high enough to kill pathogens. Follow your provincial composting requirements.'],
        ['On-farm burial', 'Carcasses buried in a designated pit on the farm property', 'British Columbia requires that buried mortalities not contaminate groundwater, watercourses, or water supplies and be buried deep enough to keep predators from digging them up [14]. Manitoba requires burial pits at least 100 meters from any watercourse, spring, sinkhole, or well, with a minimum of 1 meter of impermeable cover over the carcasses [15]. Setback distances vary by province, so check your local rules.'],
        ['Incineration', 'Carcasses burned in an approved incinerator', 'Must comply with provincial environmental regulations for emissions. Not all provinces permit on-farm incineration without a permit.'],
      ],
      [1800, 3240, 3600]
    ),
    spacer(160),
    para([{ text: 'Source:', bold: true }, { text: ' British Columbia Ministry of Agriculture, Farm Practices: Mortality Disposal [14]; Manitoba Agriculture, Protocol for Deadstock Disposal by On-Farm Burial [15]; Chicken Farmers of Canada Animal Care Program [3].' }]),

    h2('6.2  Biosecurity During Disposal'),
    para('Carcasses are a source of pathogens. How you handle them between euthanasia and disposal affects the rest of your flock.'),
    bullet('Never drag carcasses through the barn. Carry them directly to the sealed mortality container.'),
    bullet('Sealed mortality containers prevent scavengers (rodents, birds, flies) from accessing carcasses and spreading pathogens off the farm.'),
    bullet('Outdoor composting or burial sites must be fenced or otherwise protected from wildlife access.'),
    bullet('If your flock has a notifiable disease (or is suspected of one), carcass disposal must follow your veterinarian\'s or the CFIA\'s specific instructions. Normal routine disposal may be suspended during a disease investigation.'),
    bullet('Rendering is the preferred method during disease investigations because it guarantees pathogen destruction at the processing facility.'),
    para('If you ever suspect Avian Influenza (sudden high mortality, hemorrhages on skin or combs, neurological signs), do not move any carcasses until your veterinarian has assessed the situation. Call first, dispose later.'),

    // ─── SECTION 7 ───
    h1('7. Record-Keeping and Staff Training', true),
    h2('7.1  Documentation for Welfare Audits'),
    para('The Chicken Farmers of Canada Animal Care Program and equivalent programs for layers and turkeys require that farms have a written euthanasia standard operating procedure (SOP) and that all barn staff are trained on it [3]. Auditors ask to see both the written SOP and evidence that training has occurred.'),
    para('What your euthanasia records must cover:'),
    bullet('The method or methods your farm uses for each species and size class of bird.'),
    bullet('The name and date of training for each person authorized to perform euthanasia on your farm.'),
    bullet('A daily or flock-level mortality log that includes the number of birds euthanized (versus found dead) and the method used.'),
    bullet('Any euthanasia events that were outside the normal routine, such as a bird requiring a secondary method or a batch disposal event.'),
    para('A simple daily mortality log that has a column for "euthanized" and a column for "found dead," with a note of the method used, satisfies most audit requirements. Your integrator or marketing board may have a specific form. If they do, use it.'),
    spacer(80),
    callout('Audit Tip', 'Auditors have identified euthanasia training documentation as one of the most common gaps in Animal Care Program records. A farm can have excellent welfare practices but fail an audit if it cannot show written records of who was trained, on what method, and when. Keep training records for every barn worker, updated any time a new person joins the team or a method changes.', GREEN_BG, GREEN_ACC),
    spacer(120),

    h2('7.2  Ensuring All Staff Are Competent'),
    para('Anyone who works in the barn alone at any point in the day must be competent to perform euthanasia without supervision. This includes part-time workers, contract catchers, and temporary staff during placement or depopulation. If a person cannot perform euthanasia competently, they should not be the only person in the barn.'),
    para('Competency means:'),
    bullet('They can identify a bird that requires immediate euthanasia without being told.'),
    bullet('They can correctly perform the euthanasia method approved for your farm for the size and species of bird in that barn.'),
    bullet('They can apply the three-check death confirmation protocol correctly.'),
    bullet('They know what to do if the first attempt fails.'),
    bullet('They know where the mortality bin is and how to access it.'),
    para('Initial training should include hands-on practice with supervision, not just watching a demonstration once. The AVMA uses the phrase "demonstrated proficiency" in the 2020 Guidelines [1]. That means doing it, not watching it.'),

    h2('7.3  Regular Refresher Training'),
    para('Euthanasia technique degrades without practice, especially for methods that require physical skill (cervical dislocation, captive bolt placement). The Chicken Farmers of Canada Animal Care Program recommends regular refresher training as part of your farm\'s ongoing training program [3].'),
    para('Refresher training should happen:'),
    bullet('Any time your farm changes euthanasia methods or adds new equipment.'),
    bullet('When you hire new barn staff, regardless of prior experience.'),
    bullet('Annually for all staff, or more frequently if your audit program requires it.'),
    bullet('Any time a method failure occurs, as a corrective event.'),
    para('The Poultry Industry Council puts out euthanasia training resources and its Practical Guidelines for On-Farm Euthanasia of Poultry, a solid reference to keep on hand [5]. Your veterinarian or your integrator rep can also come out and run hands-on sessions. If you want guidance that holds up the same way across provinces, start with the Poultry Industry Council material.'),
    para('The CPC Learning Centre also runs a hands-on Humane Euthanasia course most years. It is a good place to get new staff trained and to keep experienced hands sharp. Call CPC or check the dates at canadianpoultry.ca/events.'),

    // ─── SECTION 8 ───
    h1('8. Workshop: Practical Demonstration', true),
    h2('8.1  Workshop Overview'),
    para('The workshop session is the practical counterpart to this lecture. It is where you build the hands-on skill under supervision, because reading about a technique is not the same as being able to do it.'),
    para('The workshop will cover:'),
    numbered('Manual cervical dislocation: technique demonstration, supervised practice, feedback.', 3),
    numbered('Using the KED: picking the right size, where to place it, and how to apply it for the bird you have.', 3),
    numbered('Setting up a CO2 chamber: hooking up the cylinder, getting the concentration right, loading and sealing the birds in, and confirming death.', 3),
    numbered('Three-check death verification: practice applying the protocol to euthanized birds.', 3),
    numbered('Carcass handling and mortality bin protocol: correct procedure from euthanasia to bin.', 3),

    h2('8.2  Common Mistakes and How to Avoid Them'),
    spacer(80),
    dataTable(
      ['Common Mistake', 'Why It Is a Problem', 'Correct Approach'],
      [
        ['Slow or hesitant cervical dislocation pull', 'Does not dislocate the joint. Bird may be conscious but immobilized.', 'Practice the motion until it is fast and decisive. One smooth, rapid pull.'],
        ['Trying to dislocate a bird that is too heavy', 'Cannot achieve proper joint separation. Method fails.', 'Know your weight limit. Use KED-C or captive bolt for heavy birds.'],
        ['Not sealing the CO2 chamber properly', 'Gas leaks out, concentration drops, bird takes longer to die', 'Check the seal before every use. Keep the lid firmly closed during the entire exposure.'],
        ['Removing birds from CO2 too early', 'Bird may recover from unconsciousness. Wakes up in the mortality bin.', 'Maintain exposure until all reflexes cease, then continue for 1 more minute minimum.'],
        ['Skipping the three-check protocol because the bird looked dead', 'Incomplete euthanasia. Bird may still be alive in the mortality bin.', 'Every bird. Every time. The three checks take 30 seconds.'],
        ['Using blunt force trauma on a bird too large for the technique', 'First blow may not achieve immediate unconsciousness. Multiple blows required.', 'Blunt force only for neonatal chicks or very small birds. Use a mechanical method for larger birds.'],
        ['Disposing of a bird before confirming death', 'Animal welfare violation. Bird may recover in a sealed bin without access to air.', 'Never put a bird in a sealed container until all three checks have passed.'],
      ],
      [2400, 2880, 3360]
    ),
    spacer(160),

    h2('8.3  Handling Difficult Situations'),
    para('Some euthanasia situations are harder to manage than others. Here are the ones that farm workers most commonly find challenging:'),
    para([{ text: 'Large, agitated birds.', bold: true }, { text: ' A scared bird fights back. For manual cervical dislocation, secure the legs and body before attempting the technique. For heavier birds, a partner can hold the body while you apply the device or perform the dislocation. Never try to euthanize a fighting bird one-handed. You will not do it cleanly, and you may injure yourself.' }]),
    para([{ text: 'Birds in tight spaces.', bold: true }, { text: ' Birds that collapse in a corner or between feeders need to be extracted gently before euthanasia. Move feeders or drinkers if needed. Do not attempt a dislocating motion in a space too small to complete it fully.' }]),
    para([{ text: 'Large numbers of compromised chicks at placement.', bold: true }, { text: ' A CO2 chamber handles multiple chicks at once and is more efficient than individual manual euthanasia for batches of 10 or more birds. If you have a large number of compromised chicks and no CO2 equipment is available, manual euthanasia with a second trained person present is the right approach. One person holds, one performs the procedure. Do not rush.' }]),
    para([{ text: 'When a method fails on the first attempt.', bold: true }, { text: ' Do not panic. The bird is almost certainly unconscious by now, so apply a secondary method right away and confirm death, as covered in Section 5.3.' }]),

    // ─── RECOMMENDED JOURNALS ───
    h1('Recommended Journals and Resources', true),
    para('For ongoing professional development on poultry euthanasia, welfare, and management:'),
    bullet([{ text: 'Poultry Science' }, { text: ': peer-reviewed research on production, welfare, and husbandry. Publishes regularly on euthanasia methods and welfare assessment.' }]),
    bullet([{ text: 'Animals (MDPI)' }, { text: ': open-access journal covering farm animal welfare and welfare-related research.' }]),
    bullet([{ text: 'Journal of Applied Animal Welfare Science' }, { text: ': applied welfare research relevant to commercial production.' }]),
    bullet([{ text: 'AVMA Guidelines for the Euthanasia of Animals: 2020 Edition' }, { text: '. The primary reference document for all approved euthanasia methods. Available at avma.org.' }]),
    bullet([{ text: 'NFACC Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys (2016)' }, { text: '. The Canadian standard for on-farm euthanasia requirements. Available at nfacc.ca.' }]),
    bullet([{ text: 'Poultry Industry Council: Practical Guidelines for On-Farm Euthanasia of Poultry' }, { text: '. Practical guidance document for Canadian poultry farms. Available at poultryindustrycouncil.ca.' }]),

    // ─── REFERENCES ───
    h1('References', true),
    // Bibliography in first-appearance order per Vancouver style
    numberedRef('American Veterinary Medical Association. Guidelines for the Euthanasia of Animals: 2020 Edition. Schaumburg, IL: AVMA; 2020. Available from: avma.org'),
    numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys. Ottawa: NFACC; 2016. Available from: nfacc.ca'),
    numberedRef('Chicken Farmers of Canada. Animal Care Program Manual. Ottawa: CFC; 2018. Available from: chickenfarmers.ca'),
    numberedRef('Merck Veterinary Manual. Euthanasia of Animals. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com'),
    numberedRef('Poultry Industry Council. Practical Guidelines for On-Farm Euthanasia of Poultry. 2nd ed. Guelph, ON: PIC; 2016. Available from: poultryindustrycouncil.ca'),
    numberedRef('Jacobs L, Bourassa DV, Harris CE, Buhr RJ. Euthanasia: manual versus mechanical cervical dislocation for broilers. Animals. 2019;9(2):47. doi:10.3390/ani9020047'),
    numberedRef('Ripplinger EN, Crespo R, Pullin AN, Carnaccini S, Nelson NC, Trindade PHE, et al. Efficacy of a novel cervical dislocation tool for humane euthanasia of broilers and broiler breeders. Poult Sci. 2024;103(3):103449. doi:10.1016/j.psj.2024.103449'),
    numberedRef('Boyal RS, Buhr RJ, Harris CE, Jacobs L, Bourassa DV. Evaluation of mechanical cervical dislocation, captive bolt, carbon dioxide, and electrical methods for individual on-farm euthanasia of broiler breeders. Poult Sci. 2022;101(9):102000. doi:10.1016/j.psj.2022.102000'),
    numberedRef('Bandara RMAS, Torrey S, Turner PV, Schwean-Lardner K, Widowski TM. Anatomical pathology, behavioral, and physiological responses induced by application of non-penetrating captive bolt devices in layer chickens. Front Vet Sci. 2019;6:89. doi:10.3389/fvets.2019.00089'),
    numberedRef('Woolcott CR, Torrey S, Turner PV, Serpa L, Schwean-Lardner K, Widowski TM. Evaluation of two models of non-penetrating captive bolt devices for on-farm euthanasia of turkeys. Animals (Basel). 2018;8(3):42. doi:10.3390/ani8030042'),
    numberedRef('Baker BI, Torrey S, Widowski TM, Turner PV, Knezacek TD, Nicholds J, Crowe TG, Schwean-Lardner K. Defining characteristics of immersion carbon dioxide gas for successful euthanasia of neonatal and young broilers. Poult Sci. 2020;99(9):4408-4416. doi:10.1016/j.psj.2020.05.039'),
    numberedRef('Humane Slaughter Association. Cervical dislocation and decapitation (manual and mechanical). Wheathampstead: HSA [cited 2026 Jun]. Available from: hsa.org.uk'),
    numberedRef('Iowa State University College of Veterinary Medicine, Veterinary Diagnostic and Production Animal Medicine. Secondary Steps and Confirmation of Death. Ames, IA: Iowa State University [cited 2026 Jun]. Available from: vetmed.iastate.edu'),
    numberedRef('British Columbia Ministry of Agriculture. Farm Practices: Mortality Disposal. Order No. 870.218-46. Victoria: Government of British Columbia; 2014 [cited 2026 Jun]. Available from: gov.bc.ca'),
    numberedRef('Manitoba Agriculture. Protocol for Deadstock Disposal by On-Farm Burial. Winnipeg: Government of Manitoba [cited 2026 Jun]. Available from: gov.mb.ca/agriculture'),
  ];
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullet-list',
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.3) } } } },
            { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.6), hanging: convertInchesToTwip(0.3) } } } },
          ],
        },
        {
          reference: 'decimal-list',
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.3) } } } },
          ],
        },
        {
          reference: 'references-list',
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.4) } } } },
          ],
        },
      ],
    },
    styles: {
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', run: { bold: true, color: MED_BLUE, size: 32, font: 'Calibri Light' }, paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { bold: true, color: DARK_BLUE, size: 26, font: 'Calibri Light' }, paragraph: { spacing: { before: 280, after: 120 } } },
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
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_FILE, buf);
  console.log('Initial write complete. Applying post-build patches...');

  // ---- POST-BUILD PATCH ----
  const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

  // TOC entries
  const tocEntries = [
    { lvl: 1, text: 'Introduction', page: '3' },
    { lvl: 1, text: '1. Understanding Humane Euthanasia', page: '4' },
    { lvl: 2, text: '1.1  Definition and Purpose', page: '4' },
    { lvl: 2, text: '1.2  Ethical Considerations', page: '4' },
    { lvl: 2, text: '1.3  Why Timely Euthanasia Matters for Welfare and Productivity', page: '4' },
    { lvl: 1, text: '2. When to Euthanize a Bird', page: '6' },
    { lvl: 2, text: '2.1  Criteria for Euthanasia', page: '6' },
    { lvl: 2, text: '2.2  Recognizing Irreversible Suffering', page: '7' },
    { lvl: 2, text: '2.3  Decision-Making in Practice', page: '8' },
    { lvl: 1, text: '3. Approved Humane Euthanasia Methods', page: '9' },
    { lvl: 2, text: '3.1  Overview of Approved Methods', page: '9' },
    { lvl: 2, text: '3.2  Manual Cervical Dislocation', page: '10' },
    { lvl: 2, text: '3.3  Mechanical Cervical Dislocation (KED Devices)', page: '11' },
    { lvl: 2, text: '3.4  Non-Penetrating Captive Bolt', page: '12' },
    { lvl: 2, text: '3.5  CO2 Euthanasia', page: '13' },
    { lvl: 2, text: '3.6  Blunt Force Trauma', page: '15' },
    { lvl: 2, text: '3.7  Decapitation', page: '16' },
    { lvl: 2, text: '3.8  Methods That Are NOT Acceptable', page: '17' },
    { lvl: 1, text: '4. Practical Steps for Each Approved Method', page: '19' },
    { lvl: 2, text: '4.1  Equipment Required', page: '19' },
    { lvl: 2, text: '4.2  Worker Safety and Biosecurity', page: '19' },
    { lvl: 2, text: '4.3  Differences by Bird Age and Size', page: '20' },
    { lvl: 1, text: '5. Verification of Death', page: '22' },
    { lvl: 2, text: '5.1  Why Verification Matters', page: '22' },
    { lvl: 2, text: '5.2  The Three-Check Protocol', page: '22' },
    { lvl: 2, text: '5.3  When Euthanasia Fails', page: '23' },
    { lvl: 1, text: '6. Carcass Disposal', page: '24' },
    { lvl: 2, text: '6.1  Approved Disposal Methods', page: '24' },
    { lvl: 2, text: '6.2  Biosecurity During Disposal', page: '25' },
    { lvl: 1, text: '7. Record-Keeping and Staff Training', page: '26' },
    { lvl: 2, text: '7.1  Documentation for Welfare Audits', page: '26' },
    { lvl: 2, text: '7.2  Ensuring All Staff Are Competent', page: '26' },
    { lvl: 2, text: '7.3  Regular Refresher Training', page: '27' },
    { lvl: 1, text: '8. Workshop: Practical Demonstration', page: '28' },
    { lvl: 2, text: '8.1  Workshop Overview', page: '28' },
    { lvl: 2, text: '8.2  Common Mistakes and How to Avoid Them', page: '28' },
    { lvl: 2, text: '8.3  Handling Difficult Situations', page: '29' },
    { lvl: 1, text: 'Recommended Journals and Resources', page: '30' },
    { lvl: 1, text: 'References', page: '31' },
  ];

  const entriesWithAnchor = tocEntries.map((e, i) => ({
    ...e,
    anchor: `_Toc${String(100000 + i).padStart(8, '0')}`,
  }));

  function escapeXml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
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
    sdt = sdt.replace(
      /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
      `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`
    );
    docXml = docXml.replace(sdtMatch[0], sdt);
  }
  docXml = docXml.replace(/\sw:dirty="true"/g, '');

  // Inject bookmarks
  let entryIdx = 0;
  let bookmarkId = 1000;
  const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  docXml = docXml.replace(headingRegex, (match, lvlStr) => {
    if (entryIdx >= entriesWithAnchor.length) return match;
    const lvl = Number(lvlStr);
    const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
    const heading = norm(textRuns.trim());
    const entry = entriesWithAnchor[entryIdx];
    if (lvl !== entry.lvl) return match;
    if (norm(heading) !== norm(entry.text)) return match;
    entryIdx++;
    const id = bookmarkId++;
    return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
  });
  if (entryIdx !== entriesWithAnchor.length) {
    console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length}`);
  }

  // Subscript the 2 in every CO2 (carbon dioxide), wherever it appears (paras,
  // tables, callouts, captions). Splits each text run into CO + subscript 2 + rest.
  let co2Count = 0;
  docXml = docXml.replace(/<w:r>(<w:rPr>[\s\S]*?<\/w:rPr>)?(<w:t\b[^>]*>)([^<]*)<\/w:t><\/w:r>/g, (m, rpr, topen, text) => {
    if (!text.includes('CO2')) return m;
    rpr = rpr || '';
    const subRpr = rpr ? rpr.replace('</w:rPr>', '<w:vertAlign w:val="subscript"/></w:rPr>')
                       : '<w:rPr><w:vertAlign w:val="subscript"/></w:rPr>';
    const parts = text.split('CO2');
    let out = '';
    parts.forEach((part, i) => {
      if (i > 0) {
        co2Count++;
        out += `<w:r>${rpr}${topen}CO</w:t></w:r>`;
        out += `<w:r>${subRpr}${topen}2</w:t></w:r>`;
      }
      if (part.length) out += `<w:r>${rpr}${topen}${part}</w:t></w:r>`;
    });
    return out;
  });
  console.log(`CO2 subscript conversions: ${co2Count}`);

  outZip.file('word/document.xml', docXml);

  // Patch settings.xml
  let settings = await outZip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  if (!settings.includes('<w:updateFields')) {
    settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
  }
  outZip.file('word/settings.xml', settings);

  // Add TOC1 / TOC2 styles
  let stylesXml = await outZip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    const tocStyles =
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
    stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
    outZip.file('word/styles.xml', stylesXml);
  }

  // Verify no dirty flags
  const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
  if (dirtyLeft > 0) console.warn(`WARNING: ${dirtyLeft} w:dirty flags remain — Word dialog may appear`);
  else console.log('w:dirty check: PASS (0 flags)');

  // Em dash check
  const emDashes = (docXml.match(/—/g) || []).length;
  if (emDashes > 0) console.warn(`WARNING: ${emDashes} em dashes found in document XML`);
  else console.log('Em dash check: PASS');

  // British spelling check
  const britishPatterns = [/\b\w+isation\b/gi, /\bcolour/gi, /\bbehaviour/gi, /\bcentre\b/gi];
  let britishFound = 0;
  for (const p of britishPatterns) { const m = docXml.match(p); if (m) britishFound += m.length; }
  if (britishFound > 0) console.warn(`WARNING: ${britishFound} potential British spellings found`);
  else console.log('American English check: PASS');

  const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, patched);
  console.log(`\nCourse 12 generated: ${OUT_FILE}`);
  console.log(`File size: ${(patched.length / 1024).toFixed(1)} KB`);
}

main().catch(err => { console.error('ERROR:', err); process.exit(1); });
