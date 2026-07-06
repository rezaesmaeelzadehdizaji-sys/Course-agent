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
function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } });
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
function numbered(text, lvl = 0) {
  const children = Array.isArray(text)
    ? text.map(s => new TextRun({ text: s.text, bold: s.bold || false, italics: s.italics || false, color: s.color || BODY_GRAY, size: 24, font: 'Calibri', subScript: s.subScript || false, superScript: s.superScript || false }))
    : [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'decimal-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
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

const verificationSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 360" font-family="Calibri, Arial, sans-serif">
  <rect width="780" height="360" fill="white"/>
  <text x="390" y="28" text-anchor="middle" font-size="15" font-weight="bold" fill="#1F3864">Verifying Death After Euthanasia: Three-Check Protocol</text>
  <!-- Check 1 -->
  <rect x="20" y="50" width="220" height="200" rx="10" fill="#EBF2FA" stroke="#2E74B5" stroke-width="2"/>
  <circle cx="130" cy="90" r="26" fill="#2E74B5"/>
  <text x="130" y="86" text-anchor="middle" font-size="18" fill="white" font-weight="bold">1</text>
  <text x="130" y="101" text-anchor="middle" font-size="10" fill="white">CHECK</text>
  <text x="130" y="132" text-anchor="middle" font-size="13" font-weight="bold" fill="#1F3864">Corneal Reflex</text>
  <line x1="50" y1="145" x2="210" y2="145" stroke="#C9A84C" stroke-width="1.5"/>
  <text x="130" y="163" text-anchor="middle" font-size="11" fill="#3C3C3C">Gently touch the surface</text>
  <text x="130" y="179" text-anchor="middle" font-size="11" fill="#3C3C3C">of the eyeball with a</text>
  <text x="130" y="195" text-anchor="middle" font-size="11" fill="#3C3C3C">fingertip or swab.</text>
  <text x="130" y="215" text-anchor="middle" font-size="11" font-weight="bold" fill="#C0504D">No blink = pass</text>
  <text x="130" y="233" text-anchor="middle" font-size="11" fill="#888" font-style="italic">Blink = not dead yet</text>
  <!-- Check 2 -->
  <rect x="280" y="50" width="220" height="200" rx="10" fill="#EBF2FA" stroke="#2E74B5" stroke-width="2"/>
  <circle cx="390" cy="90" r="26" fill="#2E74B5"/>
  <text x="390" y="86" text-anchor="middle" font-size="18" fill="white" font-weight="bold">2</text>
  <text x="390" y="101" text-anchor="middle" font-size="10" fill="white">CHECK</text>
  <text x="390" y="132" text-anchor="middle" font-size="13" font-weight="bold" fill="#1F3864">No Heartbeat</text>
  <line x1="310" y1="145" x2="470" y2="145" stroke="#C9A84C" stroke-width="1.5"/>
  <text x="390" y="163" text-anchor="middle" font-size="11" fill="#3C3C3C">Place stethoscope or</text>
  <text x="390" y="179" text-anchor="middle" font-size="11" fill="#3C3C3C">fingertips behind the</text>
  <text x="390" y="195" text-anchor="middle" font-size="11" fill="#3C3C3C">left elbow (keel side).</text>
  <text x="390" y="215" text-anchor="middle" font-size="11" font-weight="bold" fill="#C0504D">Silence = pass</text>
  <text x="390" y="233" text-anchor="middle" font-size="11" fill="#888" font-style="italic">Any beat = not dead yet</text>
  <!-- Check 3 -->
  <rect x="540" y="50" width="220" height="200" rx="10" fill="#EBF2FA" stroke="#2E74B5" stroke-width="2"/>
  <circle cx="650" cy="90" r="26" fill="#2E74B5"/>
  <text x="650" y="86" text-anchor="middle" font-size="18" fill="white" font-weight="bold">3</text>
  <text x="650" y="101" text-anchor="middle" font-size="10" fill="white">CHECK</text>
  <text x="650" y="132" text-anchor="middle" font-size="13" font-weight="bold" fill="#1F3864">No Breathing</text>
  <line x1="570" y1="145" x2="730" y2="145" stroke="#C9A84C" stroke-width="1.5"/>
  <text x="650" y="163" text-anchor="middle" font-size="11" fill="#3C3C3C">Watch the chest and</text>
  <text x="650" y="179" text-anchor="middle" font-size="11" fill="#3C3C3C">abdomen for any</text>
  <text x="650" y="195" text-anchor="middle" font-size="11" fill="#3C3C3C">movement for 60 s.</text>
  <text x="650" y="215" text-anchor="middle" font-size="11" font-weight="bold" fill="#C0504D">No movement = pass</text>
  <text x="650" y="233" text-anchor="middle" font-size="11" fill="#888" font-style="italic">Movement = not dead yet</text>
  <!-- Rule -->
  <rect x="20" y="268" width="740" height="75" rx="6" fill="#EAF2EA" stroke="#538135" stroke-width="1.5"/>
  <text x="390" y="288" text-anchor="middle" font-size="12" font-weight="bold" fill="#538135">All three checks must PASS. Wait at least 5 minutes of continuous absence before declaring death.</text>
  <text x="390" y="308" text-anchor="middle" font-size="11" fill="#3C3C3C">Wing flapping and muscle movement after euthanasia are normal reflexes and do NOT indicate the bird is still alive.</text>
  <text x="390" y="326" text-anchor="middle" font-size="11" fill="#3C3C3C">If any check fails: apply a secondary method immediately (decapitation or a second application of your primary method).</text>
  <text x="390" y="344" text-anchor="middle" font-size="10" fill="#888" font-style="italic">Source: Iowa State VDPAM; Merck Veterinary Manual [4,11]</text>
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
    new Paragraph({ children: [new TextRun({ text: 'June 2026', color: '595959', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: 'Disclaimer: This course is intended for educational purposes only. The information provided does not replace professional veterinary advice, diagnosis, or treatment. Euthanasia procedures must comply with applicable provincial animal welfare legislation. Always consult a licensed veterinarian for guidance on welfare decisions.', color: '888888', size: 18, font: 'Calibri', italics: true })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 0 } }),
  );
  return { properties: { page: { margin: pageMargin } }, headers: { default: buildHeader() }, footers: { default: buildFooter() }, children };
}

// ============================================================
// DOCUMENT BODY
// ============================================================
function buildBody() {
  return [
    // TOC
    pageBreak(),
    new Paragraph({ text: 'Table of Contents', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 240 } }),
    new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-2', stylesWithLevels: [{ styleId: 'Heading1', level: 1 }, { styleId: 'Heading2', level: 2 }] }),
    pageBreak(),

    // ─── INTRODUCTION ───
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
    pageBreak(),

    // ─── SECTION 1 ───
    h1('1. Understanding Humane Euthanasia'),
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
    para('Compromised chicks at placement are the most important group to catch early. The Chicken Farmers of Canada Animal Care Program guidelines are specific: the greatest positive impact comes from culling compromised chicks immediately after identification, not at the end of the placement day [3]. A chick that cannot stand or find feed in the first 24 hours has almost no chance of reaching market weight profitably. Every hour you delay costs the bird more suffering and costs you more feed and floor space.'),
    para('Pulling sick birds early also protects the flock. A bird with an open wound, a respiratory bug, or a gut infection is shedding germs into the barn the whole time it sits there. Get it out fast and you lower the disease pressure on the rest, which can save you a treatment later.'),
    pageBreak(),

    // ─── SECTION 2 ───
    h1('2. When to Euthanize a Bird'),
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
    spacer(80),
    callout('Chick Placement Rule', 'Any chick that cannot stand, has an obvious deformity preventing it from reaching feed or water, or is clearly below half the expected weight of its pen-mates must be euthanized within the first handling pass. Do not place it and hope. NFACC requires compromised birds at placement to be euthanized within 1 hour of completion of flock processing. [2]', 'EBF2FA', MED_BLUE),
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
    pageBreak(),

    // ─── SECTION 3 ───
    h1('3. Approved Humane Euthanasia Methods'),
    h2('3.1  Overview of Approved Methods'),
    para('The AVMA 2020 Guidelines classify euthanasia methods as Acceptable or Acceptable with Conditions for each species [1]. The Merck Veterinary Manual translates this into practical on-farm guidance [4]. For poultry, the methods a trained worker can use fall into three groups: physical, gas, and injectable. Each has its place. No single method fits every bird or every barn.'),
    spacer(80),
    dataTable(
      ['Method', 'Who Can Use It', 'Best For', 'Key Conditions'],
      [
        ['Manual cervical dislocation', 'Trained farm worker', 'Individual birds up to approximately 2.3 kg (broilers to 7 weeks)', 'Requires demonstrated training. Single rapid motion. Confirm death with 3-check protocol.'],
        ['Mechanical cervical dislocation (KED device)', 'Trained farm worker', 'Individual birds: KED-S up to 1.8 kg; KED-C up to 13.6 kg (broiler breeders)', 'Device must match bird size. Same 3-check confirmation required.'],
        ['Non-penetrating captive bolt', 'Trained farm worker', 'Heavier birds: breeders, turkeys', 'Apply to the correct site on the skull. Confirm insensibility immediately. Follow with secondary method.'],
        ['CO2 euthanasia', 'Trained farm worker', 'Small groups, individual birds, hatchery culls', 'Minimum 80% CO2 for chicks; >50% for adults. Continue until all reflexes cease.'],
        ['Blunt force trauma', 'Trained farm worker', 'Neonatal chicks only', 'Single firm blow to top of skull. Technique-dependent. Seek alternatives where available.'],
        ['Injectable barbiturate overdose', 'Licensed veterinarian only', 'Any bird when a veterinarian is present', 'Intravenous injection. Fastest, most reliable. Not available for routine farm use.'],
      ],
      [1800, 1800, 2160, 2880]
    ),
    spacer(160),
    para([{ text: 'Source:', bold: true }, { text: ' American Veterinary Medical Association, Guidelines for the Euthanasia of Animals: 2020 Edition [1]; Merck Veterinary Manual (citing AVMA 2020) [4]; Poultry Industry Council, Practical Guidelines for On-Farm Euthanasia of Poultry [5].' }]),

    h2('3.2  Manual Cervical Dislocation'),
    para('Manual cervical dislocation is the most widely used method for individual bird euthanasia on Canadian farms. Done right by a trained worker, it knocks the bird out and kills it in one motion by tearing apart the brainstem and spinal cord. Done wrong, the bird stays conscious and suffers.'),
    para([{ text: 'When it is appropriate:', bold: true }, { text: ' Broilers up to approximately 2.3 kg (typically up to 7 weeks of age). Smaller layers and growers. It becomes physically difficult and unreliable in heavier birds [6,7].' }]),
    para([{ text: 'When it is not appropriate:', bold: true }, { text: ' Broiler breeders at production weight (3.5 to 4.5 kg). Heavy turkeys. Birds over 3 kg in any situation where a mechanical device or captive bolt is available [6].' }]),
    para('Here is the technique, based on published broiler research [6]:'),
    numbered('Take the bird\'s legs and lower body in one hand and rest its back against your thigh or side.'),
    numbered('With your other hand, grip the head right behind the skull, between your thumb and first two fingers.'),
    numbered('In a single rapid motion: pull the head firmly downward and simultaneously press your knuckle into the back of the neck at the skull base, stretching and dislocating the cervical vertebrae.'),
    numbered('The motion must be fast and decisive. A slow pull does not dislocate the joint. Do it in one smooth movement.'),
    numbered('You will feel the separation. The neck will elongate. Involuntary wing flapping is normal and expected.'),
    numbered('Before the bird goes in the mortality bin, run the three-check protocol to confirm it is dead (see Section 5).'),
    spacer(80),
    callout('Key Point', 'Wing flapping after cervical dislocation is a normal reflex response, not a sign that the bird is still conscious. A bird with a properly dislocated cervical joint is irreversibly unconscious from the moment of dislocation. The flapping is spinal motor activity, not voluntary movement. Do not be alarmed by it. Do be alarmed if the bird raises its head and tries to right itself. That means the dislocation failed.', 'EBF2FA', MED_BLUE),
    spacer(120),

    h2('3.3  Mechanical Cervical Dislocation (KED Devices)'),
    para('KED stands for Koechner Euthanizing Device, a plier-style tool positioned at the base of the skull, perpendicular to the neck. The handles are closed in a single firm motion, separating the skull from the first cervical vertebra. It comes in several sizes to match different bird weights [8]:'),
    para([{ text: 'Device sizing:', bold: true }]),
    bullet('KED-S: birds up to 1.8 kg (chicks, pullets, young growers)'),
    bullet('KED-C: birds up to approximately 13.6 kg (broiler breeders, large market birds)'),
    bullet('KED-T: birds up to approximately 29 kg (turkeys)'),
    para('Do not reach for the KED as an automatic upgrade for birds you can already euthanize by hand. A study comparing manual cervical dislocation to the KED in broilers found manual dislocation worked faster: birds lost reflexes and stopped moving sooner. Reflexes returned, a sign the bird may have been regaining consciousness, in roughly half of the KED-euthanized birds, compared to 0 to 15% of birds done by hand. The researchers recommended manual cervical dislocation as the better choice for broilers in this weight range [6]. See Section 3.2 for technique.'),
    para('Where the KED earns its place is on birds too heavy for manual dislocation to be reliable: broiler breeders at production weight and similarly large birds. A study on broiler breeders averaging 3.86 to 4.39 kg found the KED achieved a 98% success rate, 57 of 59 birds [8]. This is the weight range where the device is the right tool, not a substitute for manual dislocation on smaller birds.'),
    para('Expect more visible skin damage and bleeding with the KED than with the manual method. In the broiler study, 68 to 95% of KED-euthanized birds showed broken skin or bleeding, compared to none of the birds done by hand [6]. The appearance alone does not tell you whether the bird is dead.'),
    para('Reflexes returned in close to half the KED-euthanized birds in the research above. That makes the three-check protocol in Section 5 essential, not optional, after KED use. Check corneal reflex, heartbeat, and respiration on every bird, every time, before it goes in the mortality bin.'),

    h2('3.4  Non-Penetrating Captive Bolt'),
    para('The non-penetrating captive bolt hits the skull hard enough to knock the bird out cold on impact. It does not go into the brain. Because it does not destroy brain tissue, you have to follow it right away with a second step that finishes the job: cervical dislocation, decapitation, or bleeding the bird out. A captive bolt on its own, with no second step, is not acceptable.'),
    para('Captive bolt devices are particularly useful for heavier birds where manual cervical dislocation is not reliable: broiler breeders at late production weight, large male turkeys, and birds where a mechanical cervical dislocation device of the appropriate size is not available. The device must be applied to the correct anatomical site on the skull at the proper angle to produce effective stunning. Manufacturer instructions and hands-on training are mandatory before using this equipment.'),
    para('In broiler breeder research, the non-penetrating captive bolt knocked birds out immediately and reliably at full production weight [8]. For heavy birds where cervical dislocation is not practical, it is one of the fastest ways to get a bird unconscious.'),

    h2('3.5  CO2 Euthanasia'),
    para([
      { text: 'Carbon dioxide (' }, { text: 'CO', bold: false }, { text: '2' }, { text: ') is an approved poultry method under the AVMA 2020 Guidelines, listed as "Acceptable with Conditions" [1]. The gas pushes the oxygen out of the air the bird is breathing, so it loses consciousness and then dies. It works well for hatchery culls, small groups, or the odd individual bird when a manual or mechanical method is not practical.' },
    ]),
    para('What the research says you need to get right [9]:'),
    bullet([
      { text: 'Chicks (day-old to 3 weeks): ' }, { text: 'fill the chamber to at least 80% CO', bold: true }, { text: '2', bold: true, subScript: true }, { text: '. Below 60%, chicks do not die quickly or reliably [9].' },
    ]),
    bullet([
      { text: 'Adult birds: ' }, { text: 'above 50% CO', bold: true }, { text: '2', bold: true, subScript: true }, { text: ' knocks them out fast. Fill the chamber to a high concentration before you put the birds in. They go down quicker and struggle less than if you let the gas build up slowly [1,9].' },
    ]),
    bullet([
      { text: 'Fill rate: ' }, { text: 'For gradual fill methods, a displacement rate of 30 to 70% of the chamber volume per minute is the range used in research settings [1]. Pre-fill (immersion) method is preferred for speed and welfare.' },
    ]),
    bullet('Continue CO2 flow until you have confirmed absence of all reflexes: corneal blink, heartbeat, and respiration. Then maintain for a minimum of 1 additional minute to be certain [9].'),
    bullet('Chamber must seal. Gas leaks reduce concentration in the breathing zone and produce a slower, less humane death.'),
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

    h2('3.6  Blunt Force Trauma for Neonatal Chicks'),
    para('Blunt force trauma (a single firm blow to the skull) is listed by the AVMA 2020 Guidelines as "Acceptable with Conditions" for poultry and is used primarily for neonatal chicks and very small birds at hatchery placement [1]. It requires significant operator skill to ensure that a single blow produces immediate and irreversible loss of consciousness.'),
    para('The AVMA notes that those using this method should search for alternatives where feasible [1]. The Poultry Industry Council Practical Guidelines for On-Farm Euthanasia of Poultry recommends CO2 as the preferred method for large numbers of compromised chicks at placement, with blunt force trauma reserved for individual birds when no alternative is immediately available [5].'),
    para('If using this method: one blow, applied to the top of the skull with a firm, solid object. Multiple strikes indicate the first strike was not adequate, which is an animal welfare problem. If the first strike was not effective, immediately apply a second strike. Then confirm death with the three-check protocol before disposal.'),

    h2('3.7  Methods That Are NOT Acceptable'),
    para('The methods below make birds suffer, do not kill reliably, or put people at risk. They are not acceptable for poultry, and you must not use them:'),
    bullet('Drowning: causes air hunger and distress before unconsciousness. Not acceptable for any species.'),
    bullet('Thoracic compression (chest squeezing): causes pain and prolonged asphyxia. Not acceptable for conscious birds.'),
    bullet('Placing birds in plastic bags, alone or in groups, without gas: causes hypoxia with prolonged distress.'),
    bullet('Burying or burning live birds: illegal under provincial animal welfare legislation.'),
    bullet('CO2 at low concentrations (below 30%) as the only method: does not produce reliable rapid unconsciousness.'),
    bullet('Carbon monoxide (CO): extreme human safety hazard. Not used in commercial settings.'),
    bullet('Neck twisting without proper dislocation of the joint: does not consistently destroy brainstem function. Must be the rapid dislocating motion described in Section 3.2.'),
    pageBreak(),

    // ─── SECTION 4 ───
    h1('4. Practical Steps for Each Approved Method'),
    h2('4.1  Equipment Required'),
    para('Before the flock arrives, every barn should have a complete euthanasia kit in a known location and every person working in the barn should know where it is. You do not want to be searching for equipment with a suffering bird in your hand.'),
    spacer(80),
    dataTable(
      ['Method', 'Equipment Required', 'Stored Where'],
      [
        ['Manual cervical dislocation', 'Gloves. Mortality bin. Death-confirmation checklist.', 'Barn entry point or supervisor station'],
        ['KED device', 'KED device (correct size for flock). Gloves. Mortality bin.', 'Barn entry point, secured wall mount'],
        ['Captive bolt', 'Captive bolt device. Cartridges or compressed gas charge. Safety lock. Gloves. Mortality bin. Secondary method (shears or scalpel for exsanguination).', 'Locked barn cabinet'],
        ['CO2 chamber', 'CO2 cylinder with regulator and hose. Sealable chamber sized for the birds. Gloves. Mortality bin.', 'Barn entry, well-ventilated area'],
        ['Blunt force trauma', 'Hard, smooth, rounded object (rubber mallet). Gloves. Mortality bin.', 'Barn entry point'],
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
        ['Day-old / placement chicks', '< 100 g', 'CO2 (preferred for multiples); blunt force trauma (single bird)', 'CO2 at 80-100% preferred. Blunt force: single firm blow, confirm with 3-check.'],
        ['Broiler chicks (1-3 weeks)', '100 g to 500 g', 'Manual cervical dislocation; CO2', 'Cervical dislocation technique is the same; grip is smaller. CO2 efficient for groups.'],
        ['Market-age broilers (5-7 weeks)', '1.5 to 3 kg', 'Manual cervical dislocation; KED-C', 'Upper weight limit for comfortable manual technique. KED-C handles this range well.'],
        ['Broiler breeders (males)', '3.5 to 5 kg', 'KED-C; Non-penetrating captive bolt; CO2', 'Manual technique is unreliable and physically demanding at this weight. Use a device.'],
        ['Broiler breeders (females)', '2.5 to 4 kg', 'Manual cervical dislocation (if < 3 kg); KED-C; CO2', 'Assess individual bird weight. Use KED-C for birds you cannot confidently dislocate manually.'],
        ['Commercial layers', '1.5 to 2 kg', 'Manual cervical dislocation; CO2', 'Same approach as market-age broilers.'],
        ['Turkeys (small)', '< 5 kg', 'KED-C; Manual cervical dislocation', 'Physical restraint may be more difficult than with chickens due to size and strength.'],
        ['Turkeys (large, commercial)', '10 to 20 kg', 'Non-penetrating captive bolt + secondary method; CO2', 'Manual and KED-C methods are not reliable or safe at this weight. Captive bolt required.'],
      ],
      [2000, 1500, 2600, 2540]
    ),
    spacer(160),
    para([{ text: 'Source:', bold: true }, { text: ' AVMA Guidelines for the Euthanasia of Animals: 2020 Edition [1]; Boyal et al. 2022, Poultry Science [8]; Ripplinger et al. 2024, Poultry Science [7]; Humane Slaughter Association [10].' }]),
    pageBreak(),

    // ─── SECTION 5 ───
    h1('5. Verification of Death'),
    h2('5.1  Why Verification Matters'),
    para('Wing flapping, muscle tremors, and gasping movements are common after euthanasia. They are reflex responses from the nervous system, not signs of consciousness. If you drop a bird in the mortality bin based on those signs alone, you may be disposing of a bird that is not fully dead.'),
    para('To be sure a bird is dead, you have to check the signs that show the brain and heart have truly stopped for good. The twitching and gasping after euthanasia do not tell you that. Only the three-check protocol does [4,11].'),

    h2('5.2  The Three-Check Protocol'),
    ...svgImage(verificationSvg, 'Figure 5.1: The three-check death confirmation protocol. All three checks must pass. Absence of corneal blink, heartbeat, and respiration for a sustained period of at least 5 minutes confirms death. Voluntary reflexes after euthanasia are expected and do not indicate consciousness. Source: CPC Short Courses.', 5.9),
    para('Apply the three-check protocol in this order:'),
    numbered([{ text: 'Corneal reflex:', bold: true }, { text: ' Touch the surface of the eyeball gently with a fingertip or clean swab. A live or incompletely euthanized bird will blink. A dead bird will not. This is the fastest and most reliable indicator of brainstem function loss [4].' }]),
    numbered([{ text: 'Heartbeat:', bold: true }, { text: ' Place your fingers or a stethoscope behind the left elbow on the keel side of the chest. Listen or feel for any heartbeat. For CO2 or manual cervical dislocation cases, you are looking for complete asystole (no beat at all). If you feel a weak or irregular pulse: the bird is not dead yet.' }]),
    numbered([{ text: 'Respiration:', bold: true }, { text: ' Watch the chest and abdomen carefully for 60 seconds. Any movement of the ribcage or abdominal wall indicates the bird is still breathing. A dead bird will have no respiratory movement.' }]),
    spacer(80),
    callout('The 5-Minute Rule', 'If all three checks pass, wait 5 minutes and recheck the heartbeat and corneal reflex before final disposal. This is especially important after CO2 euthanasia, where birds can recover from light exposure. A bird that was unconscious but not dead may resume respiration if removed from the CO2 atmosphere prematurely. Five minutes of confirmed absence of all three signs means the bird is dead. [4,11]', 'EBF2FA', MED_BLUE),
    spacer(120),

    h2('5.3  When Euthanasia Fails'),
    para('Method failures happen, even with trained operators. A cervical dislocation that did not fully separate the joint can leave a bird unconscious but not dead. So can a CO2 exposure cut short, or a captive bolt that caught the skull at the wrong angle. If any of the three checks fails, the bird needs immediate secondary treatment.'),
    para('Secondary methods for an incompletely euthanized bird:'),
    bullet('Manual cervical dislocation as a follow-up to CO2 or captive bolt (if the bird is small enough).'),
    bullet('Decapitation with poultry shears: definitive. Always confirms death. Appropriate for any size bird when other methods fail.'),
    bullet('Apply a second CO2 exposure if equipment is available and the first exposure time was insufficient.'),
    para('Do not leave the barn with a bird that has not passed all three checks. Do not hand the responsibility to another person without making sure they know the bird still needs attention. You performed the euthanasia, and confirmation of death is part of that job.'),
    pageBreak(),

    // ─── SECTION 6 ───
    h1('6. Carcass Disposal'),
    h2('6.1  Approved Disposal Methods'),
    para('Carcass disposal for euthanized birds follows the same rules as routine mortality management. In Canada, disposal regulations are set by provincial governments, not the federal CFIA, and they vary by province. The table below covers the methods used on Canadian farms: rendering, composting, on-farm burial, and incineration. Your farm program and provincial regulations specify which methods apply to your operation.'),
    spacer(80),
    dataTable(
      ['Disposal Method', 'How It Works', 'Key Requirements'],
      [
        ['Rendering', 'Carcasses collected by a licensed renderer and processed into meal and fat', 'Carcasses must be stored refrigerated or frozen if retained more than 48 hours after death (Manitoba standard). Keep in sealed containers. Renderer provides collection schedule.'],
        ['On-farm composting', 'Carcasses layered with carbon-rich material (sawdust, straw, wood chips) in an active compost pile', 'Carbon material must fully cover each layer of carcasses. Pile must reach internal temperatures sufficient to kill pathogens. CFIA has specific composting procedures (see Appendix B, Chicken Farmers of Canada) [3].'],
        ['On-farm burial', 'Carcasses buried in a designated pit on the farm property', 'Manitoba requires burial pits at least 100 meters from any watercourse, spring, sinkhole, or well, with a minimum of 1 meter of impermeable cover over the carcasses [12]. British Columbia requires that buried mortalities not contaminate groundwater and be deep enough to prevent predator access [13]. Setback distances vary by province, so check your local rules.'],
        ['Incineration', 'Carcasses burned in an approved incinerator', 'Must comply with provincial environmental regulations for emissions. Not all provinces permit on-farm incineration without a permit.'],
      ],
      [1800, 3240, 3600]
    ),
    spacer(160),
    para([{ text: 'Source:', bold: true }, { text: ' Manitoba Agriculture, Protocol for Deadstock Disposal by On-Farm Burial [12]; British Columbia Ministry of Agriculture, Farm Practices: Mortality Disposal [13]; Chicken Farmers of Canada Animal Care Program [3].' }]),

    h2('6.2  Biosecurity During Disposal'),
    para('Carcasses are a source of pathogens. How you handle them between euthanasia and disposal affects the rest of your flock.'),
    bullet('Never drag carcasses through the barn. Carry them directly to the sealed mortality container.'),
    bullet('Sealed mortality containers prevent scavengers (rodents, birds, flies) from accessing carcasses and spreading pathogens off the farm.'),
    bullet('Outdoor composting or burial sites must be fenced or otherwise protected from wildlife access.'),
    bullet('If your flock has a notifiable disease (or is suspected of one), carcass disposal must follow your veterinarian\'s or the CFIA\'s specific instructions. Normal routine disposal may be suspended during a disease investigation.'),
    bullet('Rendering is the preferred method during disease investigations because it guarantees pathogen destruction at the processing facility.'),
    para('If you ever suspect Avian Influenza (sudden high mortality, hemorrhages on skin or combs, neurological signs), do not move any carcasses until your veterinarian has assessed the situation. Call first, dispose later.'),
    pageBreak(),

    // ─── SECTION 7 ───
    h1('7. Record-Keeping and Staff Training'),
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
    pageBreak(),

    // ─── SECTION 8 ───
    h1('8. Workshop: Practical Demonstration'),
    h2('8.1  Workshop Overview'),
    para('The workshop session is the practical counterpart to this lecture. It is where you develop the hands-on skill that converts knowledge into competency. You cannot demonstrate proficiency by reading about a technique. You demonstrate it by doing it correctly under supervision.'),
    para('The workshop will cover:'),
    numbered('Manual cervical dislocation: technique demonstration, supervised practice, feedback.'),
    numbered('Using the KED: picking the right size, where to place it, and how to apply it for the bird you have.'),
    numbered('Setting up a CO2 chamber: hooking up the cylinder, getting the concentration right, loading and sealing the birds in, and confirming death.'),
    numbered('Three-check death verification: practice applying the protocol to euthanized birds.'),
    numbered('Carcass handling and mortality bin protocol: correct procedure from euthanasia to bin.'),

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
    para([{ text: 'When a method fails on the first attempt.', bold: true }, { text: ' Do not panic. Apply a secondary method immediately: another cervical dislocation attempt, decapitation, or continued CO2 exposure. The bird is almost certainly unconscious by now. Your job is to confirm it is dead, right away.' }]),
    pageBreak(),

    // ─── RECOMMENDED JOURNALS ───
    h1('Recommended Journals and Resources'),
    para('For ongoing professional development on poultry euthanasia, welfare, and management:'),
    bullet([{ text: 'Poultry Science' }, { text: ': peer-reviewed research on production, welfare, and husbandry. Publishes regularly on euthanasia methods and welfare assessment.' }]),
    bullet([{ text: 'Animals (MDPI)' }, { text: ': open-access journal covering farm animal welfare and welfare-related research.' }]),
    bullet([{ text: 'Journal of Applied Animal Welfare Science' }, { text: ': applied welfare research relevant to commercial production.' }]),
    bullet([{ text: 'AVMA Guidelines for the Euthanasia of Animals: 2020 Edition' }, { text: '. The primary reference document for all approved euthanasia methods. Available at avma.org.' }]),
    bullet([{ text: 'NFACC Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys (2016)' }, { text: '. The Canadian standard for on-farm euthanasia requirements. Available at nfacc.ca.' }]),
    bullet([{ text: 'Poultry Industry Council: Practical Guidelines for On-Farm Euthanasia of Poultry' }, { text: '. Practical guidance document for Canadian poultry farms. Available at poultryindustrycouncil.ca.' }]),
    pageBreak(),

    // ─── REFERENCES ───
    h1('References'),
    // Bibliography in first-appearance order per Vancouver style
    numberedRef('American Veterinary Medical Association. Guidelines for the Euthanasia of Animals: 2020 Edition. Schaumburg, IL: AVMA; 2020. Available from: avma.org'),
    numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys. Ottawa: NFACC; 2016. Available from: nfacc.ca'),
    numberedRef('Chicken Farmers of Canada. Animal Care Program Manual. Ottawa: CFC; 2018. Available from: chickenfarmers.ca'),
    numberedRef('Merck Veterinary Manual. Euthanasia of Animals. Kenilworth, NJ: Merck & Co.; 2024 [cited 2026 Jun]. Available from: merckvetmanual.com'),
    numberedRef('Poultry Industry Council. Practical Guidelines for On-Farm Euthanasia of Poultry. Guelph, ON: PIC; 2016. Available from: poultryindustrycouncil.ca'),
    numberedRef('Jacobs L, Bourassa DV, Harris CE, Buhr RJ. Euthanasia: manual versus mechanical cervical dislocation for broilers. Animals. 2019;9(2):47. doi:10.3390/ani9020047'),
    numberedRef('Ripplinger EN, Crespo R, Pullin AN, Carnaccini S, Nelson NC, Trindade PHE, et al. Efficacy of a novel cervical dislocation tool for humane euthanasia of broilers and broiler breeders. Poult Sci. 2024;103(3):103449. doi:10.1016/j.psj.2024.103449'),
    numberedRef('Boyal RS, Buhr RJ, Harris CE, Jacobs L, Bourassa DV. Evaluation of mechanical cervical dislocation, captive bolt, carbon dioxide, and electrical methods for individual on-farm euthanasia of broiler breeders. Poult Sci. 2022;101(9):102000. doi:10.1016/j.psj.2022.102000'),
    numberedRef('Baker BI, Torrey S, Widowski TM, Turner PV, Knezacek TD, Nicholds J, Crowe TG, Schwean-Lardner K. Defining characteristics of immersion carbon dioxide gas for successful euthanasia of neonatal and young broilers. Poult Sci. 2020;99(9):4408-4416. doi:10.1016/j.psj.2020.05.039'),
    numberedRef('Humane Slaughter Association. Cervical dislocation and decapitation (manual and mechanical). Wheathampstead: HSA [cited 2026 Jun]. Available from: hsa.org.uk'),
    numberedRef('Iowa State University College of Veterinary Medicine, Veterinary Diagnostic and Production Animal Medicine. Secondary Steps and Confirmation of Death. Ames, IA: Iowa State University [cited 2026 Jun]. Available from: vetmed.iastate.edu'),
    numberedRef('Manitoba Agriculture. Protocol for Deadstock Disposal by On-Farm Burial. Winnipeg: Government of Manitoba [cited 2026 Jun]. Available from: gov.mb.ca/agriculture'),
    numberedRef('British Columbia Ministry of Agriculture. Farm Practices: Mortality Disposal. Order No. 870.218-46. Victoria: Government of British Columbia; 2014 [cited 2026 Jun]. Available from: gov.bc.ca'),
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
    { lvl: 2, text: '1.3  Why Timely Euthanasia Matters for Welfare and Productivity', page: '5' },
    { lvl: 1, text: '2. When to Euthanize a Bird', page: '6' },
    { lvl: 2, text: '2.1  Criteria for Euthanasia', page: '6' },
    { lvl: 2, text: '2.2  Recognizing Irreversible Suffering', page: '6' },
    { lvl: 2, text: '2.3  Decision-Making in Practice', page: '7' },
    { lvl: 1, text: '3. Approved Humane Euthanasia Methods', page: '8' },
    { lvl: 2, text: '3.1  Overview of Approved Methods', page: '8' },
    { lvl: 2, text: '3.2  Manual Cervical Dislocation', page: '8' },
    { lvl: 2, text: '3.3  Mechanical Cervical Dislocation (KED Devices)', page: '9' },
    { lvl: 2, text: '3.4  Non-Penetrating Captive Bolt', page: '10' },
    { lvl: 2, text: '3.5  CO2 Euthanasia', page: '10' },
    { lvl: 2, text: '3.6  Blunt Force Trauma for Neonatal Chicks', page: '11' },
    { lvl: 2, text: '3.7  Methods That Are NOT Acceptable', page: '11' },
    { lvl: 1, text: '4. Practical Steps for Each Approved Method', page: '12' },
    { lvl: 2, text: '4.1  Equipment Required', page: '12' },
    { lvl: 2, text: '4.2  Worker Safety and Biosecurity', page: '12' },
    { lvl: 2, text: '4.3  Differences by Bird Age and Size', page: '13' },
    { lvl: 1, text: '5. Verification of Death', page: '14' },
    { lvl: 2, text: '5.1  Why Verification Matters', page: '14' },
    { lvl: 2, text: '5.2  The Three-Check Protocol', page: '14' },
    { lvl: 2, text: '5.3  When Euthanasia Fails', page: '15' },
    { lvl: 1, text: '6. Carcass Disposal', page: '16' },
    { lvl: 2, text: '6.1  Approved Disposal Methods', page: '16' },
    { lvl: 2, text: '6.2  Biosecurity During Disposal', page: '16' },
    { lvl: 1, text: '7. Record-Keeping and Staff Training', page: '17' },
    { lvl: 2, text: '7.1  Documentation for Welfare Audits', page: '17' },
    { lvl: 2, text: '7.2  Ensuring All Staff Are Competent', page: '18' },
    { lvl: 2, text: '7.3  Regular Refresher Training', page: '18' },
    { lvl: 1, text: '8. Workshop: Practical Demonstration', page: '19' },
    { lvl: 2, text: '8.1  Workshop Overview', page: '19' },
    { lvl: 2, text: '8.2  Common Mistakes and How to Avoid Them', page: '19' },
    { lvl: 2, text: '8.3  Handling Difficult Situations', page: '20' },
    { lvl: 1, text: 'Recommended Journals and Resources', page: '21' },
    { lvl: 1, text: 'References', page: '22' },
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
