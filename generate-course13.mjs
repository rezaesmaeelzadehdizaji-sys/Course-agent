// ============================================================
// generate-course13.mjs — Course 13: Poultry Welfare
// CPC Short Courses — Canadian Poultry Training Series
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course13.mjs
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
import { createCanvas } from 'canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 13');
const OUT_FILE  = path.join(OUT_DIR, 'Poultry_Welfare.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
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
const BODY      = '3C3C3C';

// ============================================================
// HELPERS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({
    text,
    bold:        opts.bold        || false,
    italics:     opts.italics     || false,
    color:       opts.color       || BODY_GRAY,
    size:        opts.size        || 24,
    font:        'Calibri',
    subScript:   opts.subScript   || false,
    superScript: opts.superScript || false,
  });
}

function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({
        text:        seg.text,
        bold:        seg.bold        || false,
        italics:     seg.italics     || false,
        color:       seg.color       || BODY_GRAY,
        size:        seg.size        || 24,
        font:        'Calibri',
        subScript:   seg.subScript   || false,
        superScript: seg.superScript || false,
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

// JPEG photo + caption
function photo(buf, caption, widthIn = 5.8) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.67);
  try {
    const d = jpegDims(buf);
    if (d) hpx = Math.round(wpx * d.h / d.w);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'jpg' })],
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

// ============================================================
// GENERATE FIVE DOMAINS FIGURE (canvas-based PNG)
// ============================================================
function generateFiveDomainsFigure() {
  const W = 780, H = 520;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Domain positions: center + 4 satellite positions
  const cx = W / 2, cy = H / 2;
  const r_center = 80;
  const r_sat    = 66;
  const orbit    = 185;

  // Satellite positions (clockwise from top-left)
  const domains = [
    { label: 'Domain 1',  sub: 'Nutrition',                  x: cx - orbit, y: cy - orbit * 0.7, bg: '#E8F0FB', border: '#2E74B5' },
    { label: 'Domain 2',  sub: 'Physical\nEnvironment',      x: cx + orbit, y: cy - orbit * 0.7, bg: '#E8F0FB', border: '#2E74B5' },
    { label: 'Domain 3',  sub: 'Health',                     x: cx + orbit, y: cy + orbit * 0.7, bg: '#E8F0FB', border: '#2E74B5' },
    { label: 'Domain 4',  sub: 'Behavioral\nInteractions',  x: cx - orbit, y: cy + orbit * 0.7, bg: '#E8F0FB', border: '#2E74B5' },
  ];

  // Draw arrows from each domain to center
  ctx.strokeStyle = '#C9A84C';
  ctx.lineWidth = 2.5;
  for (const d of domains) {
    const dx = cx - d.x, dy = cy - d.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const ux = dx/dist, uy = dy/dist;
    const startX = d.x + ux * (r_sat + 4);
    const startY = d.y + uy * (r_sat + 4);
    const endX   = cx  - ux * (r_center + 6);
    const endY   = cy  - uy * (r_center + 6);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(endY - startY, endX - startX);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - 12 * Math.cos(angle - 0.4), endY - 12 * Math.sin(angle - 0.4));
    ctx.lineTo(endX - 12 * Math.cos(angle + 0.4), endY - 12 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = '#C9A84C';
    ctx.fill();
  }

  // Draw satellite domains
  for (const d of domains) {
    ctx.beginPath();
    ctx.arc(d.x, d.y, r_sat, 0, Math.PI * 2);
    ctx.fillStyle = d.bg;
    ctx.fill();
    ctx.strokeStyle = d.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#1F3864';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.label, d.x, d.y - 14);

    ctx.fillStyle = '#3C3C3C';
    ctx.font = '12px Arial';
    const lines = d.sub.split('\n');
    lines.forEach((line, li) => {
      const yOff = lines.length === 1 ? 10 : 6 + li * 16;
      ctx.fillText(line, d.x, d.y + yOff);
    });
  }

  // Draw center domain
  ctx.beginPath();
  ctx.arc(cx, cy, r_center, 0, Math.PI * 2);
  ctx.fillStyle = '#2E74B5';
  ctx.fill();
  ctx.strokeStyle = '#1F3864';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Domain 5', cx, cy - 18);
  ctx.font = '13px Arial';
  ctx.fillText('Mental State', cx, cy + 2);
  ctx.font = '11px Arial';
  ctx.fillStyle = '#D0E4FF';
  ctx.fillText('(Affective Experience)', cx, cy + 22);

  // Title
  ctx.fillStyle = '#1F3864';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('The Five Domains Model of Animal Welfare', W/2, 14);

  const outPath = path.join(OUT_DIR, 'fig1_1_five_domains.png');
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('Generated fig1_1_five_domains.png');
  return fs.readFileSync(outPath);
}

// ============================================================
// GENERATE GAIT SCORING FIGURE (canvas-based PNG)
// ============================================================
function generateGaitScoringFigure() {
  const W = 720, H = 340;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = '#1F3864';
  ctx.font = 'bold 15px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Bristol Gait Scoring Scale for Broiler Chickens', W/2, 24);

  ctx.fillStyle = '#888888';
  ctx.font = '11px Arial';
  ctx.fillText('Six-point gait score, GS 0 to GS 5', W/2, 44);

  const scores = [
    { gs: 0, label: 'Normal',              detail: 'Regular, even strides. Well balanced.',                    welfare: 'No concern',      col: '#27AE60' },
    { gs: 1, label: 'Minor deviation',     detail: 'Slight irregularity. Normal function.',                   welfare: 'Acceptable',      col: '#82C341' },
    { gs: 2, label: 'Obvious abnormality', detail: 'Uneven strides. Little impact on function.',              welfare: 'Monitor closely', col: '#F39C12' },
    { gs: 3, label: 'Impaired function',   detail: 'Clear defect. Function impaired.',                       welfare: 'Action needed',   col: '#E67E22' },
    { gs: 4, label: 'Severe difficulty',   detail: 'Great difficulty walking. Severe impairment.',            welfare: 'Euthanize',       col: '#E74C3C' },
    { gs: 5, label: 'Unable to walk',      detail: 'Reluctant to move. Cannot walk many strides.',            welfare: 'Euthanize',       col: '#C0392B' },
  ];

  const rowH = 38, topY = 62;
  const colX = [20, 55, 175, 440, 600];
  const headers = ['GS', 'Description', 'Observable gait', 'Welfare concern'];

  ctx.fillStyle = '#2E74B5';
  ctx.fillRect(16, topY, W-32, rowH);
  headers.forEach((h, i) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(h, colX[i], topY + 24);
  });

  scores.forEach((s, idx) => {
    const y = topY + rowH + idx * rowH;
    ctx.fillStyle = idx % 2 === 0 ? '#F8FBFF' : '#FFFFFF';
    ctx.fillRect(16, y, W-32, rowH);
    ctx.strokeStyle = '#D0D0D0';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(16, y, W-32, rowH);

    ctx.beginPath();
    ctx.arc(colX[0] + 14, y + rowH/2, 13, 0, Math.PI*2);
    ctx.fillStyle = s.col;
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(String(s.gs), colX[0]+14, y+rowH/2+4);

    ctx.fillStyle = '#1F3864';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(s.label, colX[1], y + 16);
    ctx.fillStyle = '#555555';
    ctx.font = '11px Arial';
    ctx.fillText(s.detail, colX[1], y + 30);

    ctx.fillStyle = s.col;
    ctx.font = 'bold 11px Arial';
    ctx.fillText(s.welfare, colX[3]+2, y + rowH/2 + 4);
  });

  // Welfare threshold note
  ctx.fillStyle = '#E74C3C';
  ctx.font = 'italic 11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GS 3 or above: birds are in pain and require immediate attention', W/2, topY + rowH*7 + 4);

  const outPath = path.join(OUT_DIR, 'fig3_1_gait_scoring.png');
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('Generated fig3_1_gait_scoring.png');
  return fs.readFileSync(outPath);
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
          new TextRun({ text: 'Poultry Welfare', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 13  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
// WELFARE ASSESSMENT TABLE (Welfare Indicator Summary)
// ============================================================
function buildWelfareIndicatorTable() {
  const colW = [1400, 2600, 2600, 2040]; // 8640 total
  const hdrBg = '2E74B5';
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
      alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18, color: BODY })],
    })],
  });

  const headers = ['Indicator', 'What you see', 'What it signals', 'Action'];
  const rows = [
    ['Gait score', 'GS 3-5: bird limping badly or refusing to move', 'Leg pain, lameness, growth problems', 'Act on GS 3 and review litter and growth; euthanize GS 4-5'],
    ['Footpad dermatitis', 'Dark, crusty or ulcerated lesions on foot pads', 'Wet litter, high ammonia, immune stress', 'Reduce litter moisture; improve ventilation'],
    ['Hock burns', 'Brown burn lesions on hock joint skin', 'Extended contact with wet litter', 'Same as FPD: litter moisture and air quality'],
    ['Feather pecking', 'Bare patches, bleeding wounds on back or vent', 'Overcrowding, light, diet, stress, boredom', 'Investigate root cause; adjust light, space, diet'],
    ['Keel bone injury', 'Swollen, deformed, or fractured breastbone', 'Trauma in cage-free systems', 'Reduce perch height; manage pop-hole timing'],
    ['Elevated mortality', 'Daily mortality above 0.5% for two days running, or a sudden spike', 'Disease, heat stress, trauma, management gap', 'Call your veterinarian promptly; keep dead birds cool for post-mortem'],
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
}

// ============================================================
// NFACC STOCKING TABLE
// ============================================================
function buildStockingTable() {
  const colW = [2880, 2880, 2880]; // 8640
  const hdrBg = '2E74B5';
  const altBg = 'EBF2FA';
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hdrCell = (text, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })] })],
  });

  const dataCell = (text, i, shade) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 50, after: 50 }, children: [run(text, { size: 18, color: BODY })] })],
  });

  const headers = ['Housing type', 'NFACC limit or status', 'Conditions / notes'];
  const rows = [
    ['Broilers (standard)',                '31 kg/m²',           'Normal maximum at any time'],
    ['Broilers (enhanced monitoring)',     '38 kg/m²',           'Only with daily environment and water monitoring, a Flock Health Plan, and alarms'],
    ['Broiler breeders',                   '34 kg/m²',           'Maximum under the 2016 Code'],
    ['Conventional layer cages (battery)', 'Phased out by 2036', 'NFACC 2017 layer Code transition'],
    ['Enriched cage / cage-free (layers)', 'System-specific',    'Per NFACC 2017 layer Code space allowances'],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((cell, ci) => dataCell(cell, ci, ri % 2 === 1)) })),
    ],
  });
}

// ============================================================
// COVER PAGE
// ============================================================
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 13: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
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
    children.push(new Paragraph({
      children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    }));
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Poultry Welfare', bold: true, color: DARK_BLUE, size: 52, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'Practical Principles for Everyday Farm Management', color: MED_BLUE, size: 26, font: 'Calibri', italics: true })],
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
      children: [new TextRun({ text: 'Duration: 1 Hour', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'July 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
    }),

    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature, industry management guides, and regulatory codes of practice. This material does not replace the advice of a licensed veterinarian or regulatory authority.', color: '808080', size: 18, font: 'Calibri', italics: true })],
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
function buildIntroSection(fiveDomainsBuf) {
  const broilerPhoto = figBuf('photo1_1_broiler_flock.jpg');
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', { headingStyleRange: '1-3' }),

      h1('Introduction'),
      para('Every time you walk into your barn, you are making welfare decisions. How warm is it? Do the birds have enough water? Is the litter dry? Are birds moving freely? Welfare is not an audit category. It is the everyday standard of care that keeps your birds healthy, productive, and worth raising. When welfare slips, production slips. It is that direct.'),
      para('The NFACC Code of Practice sets the minimum standards for commercial poultry in Canada [1]. This course goes beyond the minimum. It gives you a practical framework for understanding what good welfare looks like, how to measure it, and what to do when something is off. Whether you run broilers, layers, or breeders, the principles are the same: birds that are comfortable, well-fed, healthy, and able to behave normally perform better and are less likely to break down with disease.'),
      ...photo(broilerPhoto, 'Photo 1.1: A well-managed commercial broiler flock in a modern barn. Uniform bird distribution, dry litter, and active behavior are visible welfare markers. Source: CPC Short Courses.', 5.5),

      h2('Learning Objectives'),
      bullet('Define poultry welfare and explain why it matters for flock health, farm performance, and sustainability.'),
      bullet('Describe the Five Freedoms and the Five Domains model, and understand how they apply to your daily management decisions.'),
      bullet('Identify the key welfare needs for broilers, layers, and breeders across feed, water, environment, health, and behavior.'),
      bullet('Recognize on-farm welfare indicators including gait score, footpad dermatitis, hock burns, keel bone condition, feather condition, and daily mortality.'),
      bullet('Apply the basic welfare assessment steps described in the Welfare Quality® protocol to your own barn walk-throughs.'),
      bullet('Reduce stress in your flock through better temperature control, air quality, litter management, and lighting programs.'),
      bullet('Handle and prepare birds for transport in a low-stress, humane way that meets Canadian regulatory standards.'),
      bullet('Integrate daily welfare checks into your regular farm routine and know when to call for veterinary support.'),
    ],
  };
}

// ============================================================
// SECTION 1: UNDERSTANDING POULTRY WELFARE
// ============================================================
function buildSection1(fiveDomainsBuf) {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 1: Understanding Poultry Welfare'),

      h2('1.1 What Welfare Means on a Commercial Farm'),
      para('Welfare comes down to one thing: how well a bird can cope with the conditions it lives in. The NFACC Code of Practice for chickens (2016) frames it around the bird\'s ability to stay healthy, comfortable, and able to behave normally [1]. On a working farm, that comes down to a few practical questions: Is the barn the right temperature? Do birds have clean water and feed? Is the litter dry? Are they moving around normally?'),
      para('Welfare is not just an ethics issue. Uncomfortable, stressed, or injured birds cost you money. Pain suppresses growth. Chronic heat stress cuts feed intake and slows weight gain. Poor litter drives up footpad dermatitis and respiratory disease, which means more condemnations at the plant and more antibiotic costs. Managing welfare well is managing your input costs well.'),

      h2('1.2 The Five Freedoms: Where the Framework Started'),
      para('The welfare framework most producers recognize starts with the Brambell Committee Report (1965), commissioned after public concern about intensive livestock conditions in the UK [2]. That report established the idea that animals should have basic freedoms from suffering. In 1979, the UK Farm Animal Welfare Council formalized these into the Five Freedoms [3]:'),
      bullet('Freedom from hunger and thirst: ready access to fresh water and feed to maintain full health.'),
      bullet('Freedom from discomfort: appropriate environment including shelter and a comfortable resting area.'),
      bullet('Freedom from pain, injury, and disease: prevention or rapid diagnosis and treatment.'),
      bullet('Freedom to express normal behavior: sufficient space, facilities, and company of the animal\'s own kind.'),
      bullet('Freedom from fear and distress: conditions and treatment that avoid mental suffering.'),
      para('The Five Freedoms are a minimum standard, a checklist of things birds should be free from. They are still the baseline used in NFACC codes and in most poultry welfare audit programs.'),

      h2('1.3 The Five Domains: Where the Science Is Now'),
      para('The Five Domains model takes a broader view [4]. Instead of only asking what birds should be free from, it asks what the bird is actually experiencing across five connected areas:'),
      ...image(fiveDomainsBuf, 'Figure 1.1: The Five Domains model of animal welfare. Domains 1-4 are physical and functional factors that feed into Domain 5, the bird\'s mental state. Source: CPC Short Courses.', 5.5),
      para('Domains 1 through 4 are the conditions you control as a farmer: nutrition, the physical environment, health, and behavioral interactions. Domain 5, mental state, is the outcome: how the bird actually feels as a result of those conditions. A bird with access to feed and clean water, in a comfortable barn with good air quality, is experiencing positive Domain 5. A bird in wet litter, with footpad lesions and a gait score of 3, is experiencing negative Domain 5, and it is costing you performance.'),
      para('The Five Domains model is useful because it frames every management decision as something that either supports or undermines the bird\'s experience. Ventilation is not just an engineering problem. It is a welfare problem. Litter management is not just about ammonia. It is about what the bird experiences every time it takes a step.'),

      h2('1.4 Why Welfare Connects Directly to Production'),
      para('Here is the finding that matters most for every farmer: how you manage the barn day to day, temperature, air, water, litter, matters more to bird welfare than how many birds are in the pen. That comes from one of the largest broiler studies ever run, covering 2.7 million birds across ten major producers [5]. It means every farmer can move the needle on welfare, whatever the housing system.'),
      para('A stressed bird, whether the stress comes from heat, crowding, or bullying, runs down its own immune system and gut lining and converts feed less efficiently. Flocks with consistently good welfare have lower mortality, better feed conversion, more even weights at slaughter, and fewer condemnations. Welfare and performance move together.'),

      new Paragraph({ children: [], spacing: { before: 80 } }),
    ],
  };
}

// ============================================================
// SECTION 2: WHAT YOUR BIRDS NEED
// ============================================================
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 2: What Your Birds Need'),

      h2('2.1 Feed and Water Access'),
      para('Access to feed and water is the most basic welfare requirement. The NFACC Code requires that all birds have ready access to feed and water at all times, appropriate for their age and production type [1]. This sounds straightforward, but there are several ways it can break down.'),
      bullet('Water temperature at the nipple should be 10-14°C. Hot water reduces intake quickly. Press a nipple in the middle of a hot summer afternoon and feel what comes out. If it is warm, birds are backing off.'),
      bullet('Water-to-feed ratio at thermoneutral temperatures runs approximately 1.6-1.8:1. That ratio climbs above 2:1 under heat stress.'),
      bullet('Feed line failures, bridged bins, and blocked auger joints can leave an entire section without feed while the bin reads full. Check that feed is actually flowing, not just that the system is running.'),
      bullet('Layer and breeder systems: ensure adequate feeder and drinker space per bird. Competition at the feeder drives stress, pecking order disruption, and reduced intake in subordinate birds.'),
      para('For more on daily water and feed monitoring, see Course 3 (T-FLAWS Assessment Management Tool) in this series, which covers the full feed and water checkpoint framework in practical detail.'),

      h2('2.2 Environment: Temperature, Air Quality, and Litter'),
      para('Birds cannot sweat. They depend on you to manage the thermal environment. Temperature problems develop faster in poultry than in almost any other livestock species because birds are small, metabolically active, and housed at density.'),
      bullet('Brooding (day 0-2): 32-34°C at bird level. The sensor is not the bird. Check temperature at chick height.'),
      bullet('As feathering develops, reduce temperature gradually, approximately 0.5°C every 2-3 days, until the barn reaches grow-out temperature (around 20-22°C by week 3).'),
      bullet('Adult birds in heat stress: increased water intake, panting, wing drooping, reduced feed intake, and clustering near air inlets.'),
      para('Air quality matters as much as temperature. Ammonia from litter breakdown irritates the airways, damages the eyes, and weakens the birds\' defenses. It also shows up on the scale: at 50 ppm broilers finish around 6% lighter, and at 75 ppm about 9% lighter with more of them dying [6].'),
      bullet('Ammonia and CO2 must be kept down with ventilation, and the litter kept dry. Section 5.2 (air quality) and 5.3 (litter) give the target levels and how to hit them.'),
      para('For a full daily monitoring framework covering temperature, feed, light, air, water, and sanitation, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),

      h2('2.3 Lighting for Welfare and Production'),
      para('Light affects bird behavior, growth, reproduction, and rest. The NFACC Code requires a minimum dark period of 4 continuous hours per 24-hour cycle for broilers and broiler breeders to support normal rest behavior [1]. For layers, the NFACC Code recommends at least 8 hours of darkness per 24-hour period [7].'),
      bullet('First 7 days: 50 to 100 lux at 18 hours of light with 6 hours of dark, so chicks can find feed and water easily.'),
      bullet('From week 2, step the light intensity down gradually week by week as the birds mature. Dimmer light calms activity and cuts pecking. Birds settle quickly in true darkness. If they are still moving around at night, something is letting light in.'),
      bullet('For layers: light programs drive sexual maturity and production. Consult your integrator or management manual for the specific program for your strain and housing system.'),

      h2('2.4 Health Care and Disease Management'),
      para('Sick and injured birds must be identified promptly and either treated or humanely euthanized. Leaving a bird with a gait score of 4 or 5 to deteriorate is a welfare failure, not just a production loss. The NFACC Code requires that you inspect birds at least once daily and remove all sick, injured, and dead birds promptly [1].'),
      para('Early disease detection is a welfare duty. When you see feed or water intake drop, mortality climb, or bird behavior change, that is a welfare signal as much as a production signal. For disease-specific profiles, see Course 7 (Common Poultry Diseases) in this series.'),

      h2('2.5 Space, Movement, and Natural Behavior'),
      para('Birds need enough space to move, feed, drink, rest, and express normal species-specific behavior. The NFACC Code (2016) sets stocking density limits based on live weight per square meter [1]:'),
      para('NFACC stocking density limits for Canadian commercial operations [1,7]:'),
      buildStockingTable(),
      new Paragraph({ spacing: { before: 100, after: 0 } }),
      para('Overcrowding limits movement, drives competition at feeders and drinkers, increases disease transmission, worsens litter quality, and raises ammonia. But housing conditions, litter quality, and temperature outweigh stocking density as the main welfare driver [5]. Even at permitted densities, poor management causes welfare problems, and good management at the same density produces healthy birds.'),
      para('Layer hens in any non-cage system, and broiler breeders on floor systems, must have perches, nesting, and dust-bathing opportunities appropriate to their strain and life stage [7]. These behaviors reduce stress, maintain normal social hierarchies, and reduce injurious pecking.'),
    ],
  };
}

// ============================================================
// SECTION 3: WELFARE INDICATORS EVERY FARMER SHOULD KNOW
// ============================================================
function buildSection3(gaitBuf) {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 3: Welfare Indicators Every Farmer Should Know'),

      para('Welfare assessment on a commercial farm means measuring outcomes on the birds, not just checking that management practices are in place. The most widely used science-based framework for this is the Welfare Quality® assessment protocol [8]. It focuses on what you can actually see on the birds: how they walk, the condition of their feet, the state of their feathers, and how they behave. What follows are the key indicators you should be checking on every barn walk-through.'),

      h2('3.1 Gait and Leg Health in Broilers'),
      para('Leg problems are one of the biggest welfare issues in commercial broiler production. Modern broilers have been bred to put on muscle fast, faster than their legs and joints can keep up with. That mismatch is why some degree of leg weakness shows up in every commercial flock.'),
      ...image(gaitBuf, 'Figure 3.1: Bristol gait scoring scale for broiler chickens. Birds scoring GS 3 or above are in pain and require immediate attention. Source: CPC Short Courses.', 5.8),
      para('Leg problems are widespread. Recent studies estimate that 14 to 30% of fast-growing broilers have moderate to severe gait impairment, and about 3.3% are almost unable to walk [9]. Use the six-point Bristol gait score (GS 0-5) on a sample of birds at every barn check.'),
      bullet('GS 0-1: Normal to minor deviation. No welfare concern.'),
      bullet('GS 2: Obvious gait abnormality. Walking is still functional. Monitor and investigate cause.'),
      bullet('GS 3: Clear defect, function impaired. These birds are in pain. Action is required.'),
      bullet('GS 4-5: Severe difficulty or unable to walk. Humanely euthanize immediately. These birds cannot reach feed and water.'),
      para('High leg scores in a flock are often a signal of litter quality problems, calcium-phosphorus imbalances, or mycotoxin exposure. If you are seeing more than 5% of birds at GS 2+ during your assessment, investigate and act before it gets worse.'),

      h2('3.2 Footpad Dermatitis'),
      para('Footpad dermatitis (FPD) is a contact dermatitis on the underside of the foot, caused primarily by wet, ammonia-rich litter. It is one of the most commonly observed welfare lesions in commercial broiler production and is a direct signal of litter management problems.'),
      bullet('Mild FPD (Score 1-2): superficial dark discoloration. Common and manageable.'),
      bullet('Severe FPD (Score 3-4): ulceration, deep lesions, secondary infection. Painful and affects bird movement and feed access.'),
      para('Footpad dermatitis is scored on a 0 to 4 scale, either on your barn walk or at the slaughter line [8]. Many Canadian processing plants score FPD as part of their welfare monitoring. High scores at the plant come back to affect your relationship with your processor and your market access.'),
      para('The main driver is litter moisture. Keep litter at 20-25% moisture. In cold Canadian winters, ventilation tends to drop to conserve heat, and that is when litter gets wet and FPD rates climb. Do not sacrifice air quality to save heating costs.'),

      h2('3.3 Hock Burns'),
      para('Hock burns are contact lesions on the skin of the hock joint, scored 0-4 under the same scale used for FPD [8]. Like FPD, they reflect how much time birds are spending in contact with wet litter, and rates can swing widely between flocks depending on litter conditions, season, and bird age. High hock burn rates are a red flag for the same litter and ventilation problems that drive FPD.'),
      para('Both FPD and hock burns can be scored at slaughter as part of your standard welfare audit. If you are getting feedback from the plant on high lesion scores, check your litter moisture and ventilation management first.'),
      ...photo(figBuf('fpd_hockburn.jpg'), 'Photo 3.1: Footpad dermatitis and hock burn on a commercial broiler. The dark, necrotic tissue on the footpad is an advanced FPD lesion; the brown discoloration over the hock joint is a hock burn. Both trace back to chronic wet litter. Source: USDA Agricultural Research Service (public domain).', 5.0),

      h2('3.4 Keel Bone Condition in Laying Hens'),
      para('Keel bone fractures are one of the biggest welfare issues in laying hens, and far more common than most people realize. Reported rates run from 53 to 100% of hens in cage-free systems by the end of lay, and 50 to 98% even in enriched cages [10]. Fractures cause chronic pain, reduce egg production, and affect how well birds get around. As Canada moves away from battery cages under the NFACC 2017 Code [7], this becomes a bigger welfare challenge every year.'),
      para('Common causes include:'),
      bullet('Weak bones (osteoporosis): during lay, most of the hen\'s calcium goes into eggshells instead of the skeleton, so the bones thin out. This internal bone weakness, made worse by high egg production and early onset of lay, is a major and often underappreciated cause, not just outside knocks.'),
      bullet('Collisions and hard landings on perches, feeders, or nest boxes, especially in multi-tier aviary systems.'),
      bullet('Multi-tier structures that birds cannot navigate safely.'),
      ...photo(figBuf('Keel bone fc.jpg'), 'Photo 3.2: Checking a keel bone for fractures. (A) Palpation: running the fingers along the length of the keel to feel for fractures. Shown here on a live bird; in the study it was done post-mortem. (B) The inner surface of the keel bone at necropsy. An old, healed fracture with callus (the bony repair tissue) is visible toward the rear of the keel (circled). (C) A radiograph of the keel showing a fracture (circled). Source: panels A and B, Kittelsen et al., Avian Pathology 2023; panel C, Uysal and Laçin, Brazilian Journal of Poultry Science 2024.', 5.8),
      para('Management options include reducing perch height, using padded or rounded perch surfaces, breeding for strains with better bone density, and managing pop-hole timing to reduce rush-flight behavior at dawn.'),

      h2('3.5 Feather Condition and Pecking Injuries'),
      para('Feather pecking and cannibalism are welfare emergencies once they start. Bare patches, bleeding wounds on the back, wings, or vent area, and dead birds with body injuries are signs that injurious pecking has already started. The challenge is that by the time you see bleeding, the flock is already in a problem state.'),
      para('Before you assume every bare patch is pecking, rule out two other causes. First, genetics: the tendency to feather peck is partly inherited, and brown-feathered layers are generally more prone to it than white strains, with the back a common site of wear. Strains differ too. Lohmann Brown hens, for example, tend to lose feather cover faster with age and are more prone to injurious pecking than Hy-Line Brown [11]. Second, in breeders, worn or bare backs and saddles usually come from mating, as the males tread the hens, not from pecking. Manage the male-to-female ratio and watch back and saddle condition, as covered in Section 4.3.'),
      para('Feather pecking rarely has a single cause. Common triggers include:'),
      bullet('Overcrowding and competition at feeders and drinkers.'),
      bullet('Lighting that is too bright or unevenly distributed.'),
      bullet('Nutritional deficiencies, especially methionine, sodium, and insoluble fiber.'),
      bullet('Sudden dietary changes or transitions.'),
      bullet('External parasites such as mites and lice, which damage feathers directly and irritate birds enough to trigger pecking.'),
      bullet('Inadequate environmental enrichment in cage-free systems (no perches, no foraging substrate).'),
      ...photo(figBuf('feather and pecking.jpg'), 'Photo 3.3: How feather pecking escalates if it is not caught early. (A) Heavily broken feathers. (B) Almost bald, with skin starting to show. (C) A bald patch of red, irritated skin. (D) Open, bleeding wounds: cannibalism. Once you see blood, the flock is already in trouble. Source: panels A to C, Aviagen Brief, Feathering in Broiler Breeder Females, 2024; panel D, Poultry Hub Australia (poultryhub.org).', 5.5),
      para('Prevention is far more effective than treatment. Once cannibalism establishes itself in a flock, it is very difficult to stop. Management interventions include:'),
      bullet('Dimming lights to 6-8 lux, or switching to red light, during an outbreak. Under dim or red light birds cannot see blood and fresh wounds as easily, which slows the spread of pecking and cannibalism [12].'),
      bullet('Ensuring adequate feeder space per bird.'),
      bullet('Providing enrichment: scratch areas, straw bales, pecking blocks in non-cage systems.'),
      bullet('Reviewing the diet for fiber, methionine, and sodium adequacy. A salt (sodium) shortfall in particular is a recognized trigger for cannibalism, so make sure the ration meets the birds\' sodium needs [13].'),
      bullet('Beak treatment as a last resort when management alternatives have been exhausted.'),

      h2('3.6 Daily Mortality and Flock Behavior'),
      para('Your daily mortality record is a welfare dashboard. A sudden jump in daily mortality means something changed. The CPC Learning Centre Spotting Disease Early guide puts it clearly: water consumption drops before feed consumption drops, feed drops before you see sick birds, and sick birds appear before mortality climbs [14]. If you are waiting for mortality to tell you something is wrong, you are behind the problem by days.'),
      bullet('In a healthy flock, daily broiler mortality is low, usually around 0.05 to 0.1% of the birds per day.'),
      bullet('Cumulative mortality target at processing weight: below 4%.'),
      bullet('Investigate right away if daily mortality runs above 0.5% for two days in a row, or on any sudden spike. Call your veterinarian promptly. Set fresh dead birds aside and keep them cool so the veterinarian can examine them.'),
      para('Behavioral changes are welfare signals too. Birds that are piling in corners, not distributing evenly across the barn, sitting rather than walking, or showing reduced feeding activity are telling you something is wrong with the environment or their health, often before any other measurable indicator changes.'),

      h2('3.7 At-a-Glance: Key Welfare Indicators'),
      para('Summary of welfare indicators and what they signal [1,8,9]:'),
      buildWelfareIndicatorTable(),
      new Paragraph({ spacing: { before: 100, after: 0 } }),
    ],
  };
}

// ============================================================
// SECTION 4: WELFARE IN YOUR PRODUCTION SYSTEM
// ============================================================
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 4: Welfare in Your Production System'),

      h2('4.1 Broiler Welfare Priorities'),
      para('Commercial broilers in Canada are housed at up to 31 kg/m² under the NFACC Code (2016), or up to 38 kg/m² where the enhanced monitoring conditions are met [1]. At that density, the bird environment is your most powerful welfare tool. Litter quality, air quality, temperature, and water access drive almost every significant welfare indicator in the broiler house.'),
      para('The key broiler welfare priorities in approximate order of impact:'),
      numbered('Leg health: rapid growth creates locomotor weakness. Monitor gait score weekly from week 3 onward [9].'),
      numbered('Footpad dermatitis and hock burns: driven by litter moisture. Manage ventilation and litter conditioning proactively [8].'),
      numbered('Heat stress: most dangerous at slaughter weight. Birds at 2+ kg have limited ability to regulate body temperature. Start monitoring actively once bird-level temperature climbs above 22°C, and have full tunnel ventilation running well before it reaches 25-28°C.'),
      numbered('Catching and loading: the final welfare event on the farm. Rough handling causes bruising, fractures, and stress-related mortality. Catching team management is a welfare intervention.'),
      para('Broilers reach target weight in 35-42 days. That is a short window to get things right. Problems that develop in the first week of the grow-out compound through the rest of the cycle. Correct them fast.'),

      h2('4.2 Laying Hen Welfare and Housing Systems'),
      para('Laying hen welfare in Canada is undergoing the most significant transition in the industry\'s history. The NFACC Code of Practice for Pullets and Laying Hens (2017) requires that all battery cage systems be phased out by 2036, with no new battery cages installed after 2017 [7]. The industry is transitioning to enriched cages and cage-free systems, each with different welfare profiles.'),
      ...photo(figBuf('free cage.jpg'), 'Photo 4.1: Three cage-free laying hen systems. Left: a floor or free-run barn, where hens live on a single littered level. Center: a multi-tier aviary, with raised platforms, perches, and nest boxes. Right: a free-range barn with access to the outdoors. Cage-free housing lets hens move, perch, dust-bathe, and nest more naturally, but the added height and hard landings in multi-tier systems raise the risk of keel bone fractures. Source: Egg Farmers of Alberta (eggs.ab.ca).', 5.8),
      para('Enriched cages provide perches, nest boxes, and scratch pads, which reduce the behavioral frustration common in conventional battery cages.'),
      ...photo(figBuf('cage system.jpg'), 'Photo 4.2: A conventional battery cage (left) next to enriched cage systems (center and right). Compared with the bare battery cage, enriched cages give hens more vertical and horizontal space and private nesting areas (the red curtains, center), plus scratch pads on the floor (right). These features let hens nest, perch, and scratch, which reduces the frustration seen in battery cages. Source: Egg Farmers of Alberta (eggs.ab.ca).', 5.8),
      para('Cage-free systems (aviary, floor, free-run, free-range) allow greater expression of natural behavior but introduce new welfare challenges:'),
      bullet('Keel bone fractures, from both weak bones (osteoporosis from high lay) and collisions in multi-tier systems. Section 3.4 covers the prevalence and management.'),
      bullet('Feather pecking and cannibalism, which are harder to control in group-housed flocks without beak treatment.'),
      bullet('Respiratory disease risk from higher ammonia levels in larger floor-managed groups.'),
      bullet('Smothering during fear responses or thunderstorms in large flocks without appropriate barn design.'),
      para('The welfare performance of cage-free systems depends heavily on barn design, management competence, and stocking management. The transition to cage-free is not automatically a welfare improvement without skilled management.'),

      h2('4.3 Breeder Welfare Considerations'),
      para('Breeders carry a welfare problem that broilers and layers do not. To hold them at the right weight for good hatching eggs, you have to restrict their feed. But a breeder has the same fast-growth genetics and the same big appetite as the broilers it produces, so a feed-restricted breeder is a genuinely hungry bird, day in and day out. That is the trade-off you are managing.'),
      para('Key breeder welfare concerns:'),
      bullet('Feed restriction and chronic hunger in both male and female breeders, especially during the rearing phase. This requires careful pen management and feeding system design to minimize fighting and feeder competition.'),
      bullet('Leg health in males: breeder males carry significant body weight and are active in mating. Monitor gait score and remove severely lame males promptly.'),
      bullet('Mating injury to females: treading injuries are common in heavy-breed breeders. Manage male-to-female ratio and monitor hen back/saddle condition.'),
      bullet('Floor access and dustbathing: breeders on litter should have full floor access, and litter condition should be managed to allow dustbathing behavior.'),
      ...photo(figBuf('breeder farm.jpg'), 'Photo 4.3: A broiler breeder barn on floor (litter) housing. Birds have full floor access on dry bedding for scratching and dust-bathing, with nest boxes down the center and feed and water lines within easy reach. Keeping the litter dry and friable is what lets the birds dust-bathe and keeps their feet healthy. Source: Chicken Farmers of Canada (chicken.ca).', 5.8),
    ],
  };
}

// ============================================================
// SECTION 5: REDUCING STRESS AND IMPROVING THE ENVIRONMENT
// ============================================================
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 5: Reducing Stress and Improving the Environment'),

      h2('5.1 Thermal Comfort at Every Age'),
      para('Thermal management is a welfare intervention at every stage. The CPC Learning Centre Heat Stress Technical Bulletin identifies thermal stress as one of the most significant welfare and production risks in commercial poultry, with effects ranging from reduced feed intake and lower growth rates to immune suppression and increased mortality [15].'),
      para('Practical thermal management by production stage:'),
      bullet('Brooding (day 0-2): 32-34°C at bird level, then reduce gradually. Birds cluster away from heat means it is too hot. Birds pile means it is too cold. Read the birds, not just the controller.'),
      ...photo(figBuf('distribution.jpg'), 'Figure 5.1: Reading brooding temperature from chick distribution. Too hot (top): chicks spread to the edges, away from the heat. Correct (center): chicks are spread evenly across the floor. Too cold (bottom): chicks pile together under the heat source. Read the birds, not just the controller. Source: CPC Short Courses.', 4.6),
      bullet('Grow-out (weeks 2-6): step down gradually. Feathered broilers at week 3 should be comfortable at 25-27°C. By week 5, 20-22°C is appropriate.'),
      bullet('Laying hens: optimal production range 18-24°C. Below 10°C reduces feed intake. Above 27°C, egg production, shell quality, and bird health all suffer.'),
      bullet('Summer management: pre-cool the barn before birds arrive. Run tunnel ventilation before the barn reaches critical temperature, not after birds are already in heat stress.'),
      para('For a full thermal monitoring protocol integrated with feed, air, water, and sanitation checkpoints, refer to Course 3 (T-FLAWS Assessment Management Tool) in this series.'),

      h2('5.2 Ventilation and Air Quality'),
      para('Good air quality is not optional. At the levels that build up in a poorly ventilated barn, ammonia cuts body weight and raises mortality, and the damage is direct [6]. It paralyzes the tiny hairs (cilia) that line the windpipe, the birds\' first line of defense against respiratory bugs. Once those are knocked out, bacteria that would normally get cleared reach the lungs and air sacs.'),
      bullet('Target ammonia: below 10 ppm during brooding; below 25 ppm throughout the grow-out.'),
      bullet('Action threshold: 25 ppm at bird level. Your nose is an early warning: most people first smell ammonia at about 20 to 30 ppm, right around the level where it starts harming birds [16]. But do not rely on smell alone. Anyone who works in the barn every day goes nose-blind to ammonia and can stop noticing even high levels [16]. Check with a simple ammonia meter or colorimetric tube, and do not wait until birds show signs.'),
      bullet('CO2 target: below 3,000 ppm. High CO2 signals inadequate minimum ventilation rate.'),
      bullet('Humidity: 60-70% during brooding; 50-60% from week 2 onward. High humidity drives ammonia and wet litter. In wet regions and seasons, like coastal BC winters, the outside air is already damp and you may not hit the exact target. Dry, friable litter matters more than the number. Keep minimum ventilation running and aim the incoming air up at the ceiling so it warms and mixes before it reaches the birds. That is how the air picks up and carries moisture out, even in cold, damp weather. Ceiling stirring fans help, and open up a bit more during the warmer, drier part of the day [17].'),
      para('Litter treatment products can help manage ammonia between flocks and during the grow-out. Acidifying agents reduce ammonia volatilization from litter, lowering both the welfare and production impact. The CPC Enhanced Litter Treatment is one such amendment, applied to the litter to cut ammonia, moisture, and bacterial load, usually before placement.'),
      ...photo(figBuf('product_enhanced_litter_treatment.jpg'), 'Photo 5.1: Enhanced Litter Treatment. A litter amendment applied before placement to reduce ammonia, moisture, and bacterial load in the litter. Source: canadianpoultry.ca/shop.', 2.3),

      h2('5.3 Litter Quality Management'),
      para('Litter quality is the single most controllable welfare factor in a broiler house. Poor litter causes FPD, hock burns, elevated ammonia, respiratory disease, and higher bacterial load. Good litter reduces all of these simultaneously.'),
      para('Target litter moisture: 20-25%. Below 15%, litter becomes dusty and creates respiratory irritation. Above 30%, ammonia generation increases sharply and FPD lesions begin forming.'),
      para('Practical litter management steps:'),
      bullet('Start each flock on fresh or well-managed reused litter. Ensure pre-placement moisture is within target range.'),
      bullet('Identify and fix wet spots early. A single drinker leak can wet the surrounding area within hours, and that patch spreads.'),
      bullet('Increase ventilation in the wet areas of the barn before the next check. Do not let wet patches sit.'),
      bullet('Treat wet, high-ammonia spots with a litter amendment. Section 5.2 covers the litter treatment products.'),
      bullet('Re-use litter management: test moisture and bacterial load between flocks. Highly contaminated litter should not be re-used.'),

      h2('5.4 Light Programs That Support Welfare'),
      para('Lighting is not just a production setting, it is a welfare tool. Birds in continuous light cannot rest properly, and that drives chronic stress and more injurious pecking, so the minimum dark period the NFACC Code requires is there for welfare, not just performance [1]. Section 2.3 gives the lux levels, day lengths, and dark-period rules by age and bird type.'),
      para('Uniform light distribution is as important as intensity. Hot spots with high intensity over feeders or drinkers can drive pecking at those locations. Walk the barn with a light meter and check that intensity is consistent across the floor.'),
      ...photo(figBuf('lux.jpg'), 'Photo 5.2: A handheld light meter (lux meter). Walking the barn with one is the only reliable way to confirm light intensity is on target and even across the floor. Estimating lux by eye does not work. Source: daltonsupplies.com/products.', 1.6),
    ],
  };
}

// ============================================================
// SECTION 6: HANDLING, TRANSPORT, AND SLAUGHTER
// ============================================================
function buildSection6() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 6: Handling, Transport, and Slaughter'),

      h2('6.1 Calm Handling on the Farm'),
      para('The way you and your team handle birds every day is a welfare practice. Poultry have a flight response. Any sudden movement, loud noise, or rough contact triggers fear and struggling, which causes injury. Calm, controlled handling reduces stress hormones, reduces bruising, and makes birds easier to manage.'),
      para('Basic handling principles:'),
      bullet('Move slowly and deliberately around birds. Avoid sudden movements and loud noises near the flock.'),
      bullet('When catching a bird, use both hands. Support the body under the breast with one hand and the feet with the other. Do not grab single wings.'),
      bullet('Carry birds breast-side toward your body. This supports the bird\'s weight naturally and reduces struggling.'),
      bullet('Do not drag birds across the floor or stack them against pen walls. Injuries from improper handling are welfare violations and a direct cost.'),
      bullet('Train all farm workers who have contact with birds. Welfare during daily management reflects directly in catching-day outcomes.'),
      ...photo(figBuf('handling.jpg'), 'Photo 6.1: Calm, correct handling. The bird is supported with both hands and held close, unhurried. Handling birds gently in daily management keeps them used to people and pays off in lower stress and fewer injuries on catching day. Source: CPC Short Courses.', 5.5),

      h2('6.2 Catching and Loading for Transport'),
      para('Catching day is the highest-risk welfare event for broilers. Handling, dim light, restraint, and loading all hit the birds at once, and that is when injuries and death losses spike. How your catching crew performs directly determines your welfare results at the plant.'),
      para('Best practices for catching and loading [8]:'),
      bullet('Reduce light intensity to 1-2 lux before catching begins. Low light reduces bird activity and flight response.'),
      bullet('Catch at night or in early morning when barn temperatures are lower. Heat stress during catching is a mortality risk.'),
      bullet('Use mechanical harvesters where available. Manual catching at commercial scale should be done by trained crews using controlled technique.'),
      bullet('Load birds to module or crate specifications. Overcrowded crates cause crush injuries and suffocation.'),
      bullet('Complete catching in under 2-3 hours where possible. Extended catching time increases heat stress, especially in older birds.'),
      ...photo(figBuf('shipment.jpg'), 'Photo 6.2: Catching and loading on shipment day, done under dim blue and green light. Working in near-darkness keeps the birds calm and cuts flapping, injury, and stress. A trained, professional crew loading gently into transport crates is a direct welfare intervention. Source: CPC Short Courses.', 5.8),

      h2('6.3 From Farm to Plant: Reducing Pre-Slaughter Stress'),
      para('Once birds leave your farm, a different set of welfare risks applies: the trailer microclimate, how long the journey takes, and holding conditions at the plant. For broiler transport in Atlantic Canada, four things drove dead-on-arrival (DOA) rates: journey length, bird age, which catching team loaded the birds, and how long they waited in the holding barn [18]. The typical DOA rate was around 0.29%, but individual loads ran from near zero to almost 2% depending on those factors. Western Canada shows the cold-weather side of the same picture. Four loads tracked through a Saskatchewan winter ran dead-on-arrival rates of 0.7 to 1.4%, several times the Atlantic figure, driven by cold and windchill inside the trailer [19].'),
      ...photo(figBuf('shipment mix.jpg'), 'Photo 6.3: Loading for transport in the cool, dark early hours to hold down heat stress. From here on, the handling at loading, the journey, and the wait at the plant are what drive the dead-on-arrival rate. Source: CPC Short Courses.', 5.8),
      para('Your influence over transport welfare is limited once the truck leaves, but you can control several key factors:'),
      bullet('Time feed withdrawal so the birds are off feed about 8 to 12 hours total by slaughter, counting catching, transport, and the wait at the plant, not 8 to 12 hours on the farm on top of the journey [20]. Too short leaves full crops and guts that contaminate carcasses at the plant; too long causes weight loss and weakens the gut. Leave water in front of the birds until the catching crew is ready, then pull it just before they start. Follow your integrator\'s specific withdrawal schedule.'),
      bullet('Communicate with the catching crew supervisor about any bird health concerns in the flock. Compromised birds have higher transport mortality risk.'),
      bullet('Canadian winters: extreme cold is as dangerous as extreme heat for birds in transit. Ensure transport vehicles have appropriate curtain management for the season.'),
      para('Pre-slaughter welfare is regulated in Canada under the Health of Animals Regulations, administered by the Canadian Food Inspection Agency (CFIA). Violations, including dead-on-arrival rates above threshold, cruelty incidents at the plant, or transport regulation breaches, can result in regulatory action. Your welfare practices on the farm and at catch are the first line of compliance.'),
    ],
  };
}

// ============================================================
// SECTION 7: THE FARMER'S DAILY WELFARE ROLE
// ============================================================
function buildSection7() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 7: The Farmer\'s Daily Welfare Role'),

      h2('7.1 Daily Welfare Walk-Through'),
      para('Every barn check is a welfare check. The CPC Learning Centre Spotting Disease Early guide describes the systematic five-sense barn walk: what you see, hear, smell, touch, and observe in water and feed consumption before you touch a single bird [14]. That approach applies directly to welfare monitoring.'),
      para('Welfare observations to make on every barn check:'),
      bullet('Bird distribution: are birds spreading evenly across the barn, or clustering? Clustering signals temperature, light, ventilation, or water access problems.'),
      bullet('Activity and behavior: are birds moving, feeding, and drinking? How many are sitting? Sitting birds that do not rise when approached are a welfare flag.'),
      bullet('Feather and skin condition: scan for bare patches, wounds, blood, or soiling. Wet-feathered or soiled birds signal environmental or health problems.'),
      bullet('Foot and leg health: pick up a sample of birds and observe gait. Five to ten birds per pen is a useful sample for gait scoring.'),
      bullet('Dead bird count and condition: remove and record all dead birds. If anything looks unusual, keep those birds cool and call your veterinarian to examine them. Do not guess at the cause yourself.'),
      bullet('Feed and water intake: compare today\'s consumption against the previous day. A 5-10% drop is a welfare signal that requires investigation within the same day.'),

      h2('7.2 Recording and Reporting Problems'),
      para('Welfare management depends on documentation. You cannot track trends, respond to problems, or demonstrate compliance without records. At minimum, you should be recording:'),
      bullet('Daily mortality count and any visual observations.'),
      bullet('Feed and water consumption relative to expected intake.'),
      bullet('Any treatment or culling decisions and the reason.'),
      bullet('Welfare incidents: catching injuries, handling problems, any bird with a gait score of 3 or above found in the barn.'),
      para('Report welfare concerns to your integrator, veterinarian, or service tech when they exceed your normal range. A sudden change in mortality or welfare indicators is not something to manage silently. Getting the right expertise on-farm early saves money and bird lives.'),

      h2('7.3 Building a Welfare-Competent Team'),
      para('Welfare outcomes on a commercial farm are not just about the head farmer. Anyone who enters the barn, including employees, catchers, service technicians, and delivery personnel, has an effect on bird welfare. Your welfare standard is only as good as the person making the least effort.'),
      para('Practical steps for building welfare competence:'),
      bullet('Orient all new staff to welfare standards before they work unsupervised around birds. Show them the basics: how to handle a bird, how to euthanize an injured bird, what to report.'),
      bullet('Walk the barn with employees, not just ahead of them. Observation of handling behavior is the most effective welfare training.'),
      bullet('Ensure all staff know the farm\'s euthanasia protocol and have access to the tools to perform it. A bird with a GS 5 that no one euthanizes because no one has a tool available is a welfare failure that reflects on the farm.'),
      bullet('Set the expectation that welfare problems are reported, not hidden. A culture where problems get flagged early produces better welfare outcomes and costs less money.'),
      para('For a detailed euthanasia protocol and technique training, see Course 12 (Humane Euthanasia) in this series.'),

      new Paragraph({ children: [], spacing: { before: 80 } }),
    ],
  };
}

// ============================================================
// RECOMMENDED JOURNALS
// ============================================================
function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      bullet('Poultry Science (Oxford Academic / Elsevier)'),
      bullet('Animal Welfare (UFAW / Cambridge University Press)'),
      bullet("World's Poultry Science Journal (Cambridge University Press)"),
      bullet('Veterinary Record (British Veterinary Association)'),
      bullet('Preventive Veterinary Medicine (Elsevier)'),
      bullet('Animals (MDPI, open access)'),
      bullet('Avian Pathology (Taylor & Francis)'),
      bullet('Canadian Veterinary Journal (CVMA)'),
      new Paragraph({ children: [], spacing: { before: 80 } }),
    ],
  };
}

// ============================================================
// REFERENCES
// ============================================================
function buildReferencesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('References'),
      numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys. Burnaby, BC: NFACC; 2016. Available from: nfacc.ca [cited 2026 Jun].'),
      numberedRef('Brambell FWR. Report of the Technical Committee to Enquire into the Welfare of Animals Kept under Intensive Livestock Husbandry Systems. London: HMSO; 1965.'),
      numberedRef('Farm Animal Welfare Council. Five Freedoms [Press statement]. Surrey, UK: FAWC; 1979. Available from: webarchive.nationalarchives.gov.uk [cited 2026 Jun].'),
      numberedRef('Mellor DJ, Beausoleil NJ, Littlewood KE, McLean AN, McGreevy PD, Jones B, Wilkins C. The 2020 Five Domains Model: Including Human-Animal Interactions in Assessments of Animal Welfare. Animals (Basel). 2020;10(10):1870. doi:10.3390/ani10101870.'),
      numberedRef('Dawkins MS, Donnelly CA, Jones TA. Chicken welfare is influenced more by housing conditions than by stocking density. Nature. 2004;427(6972):342-344. doi:10.1038/nature02226.'),
      numberedRef('Miles DM, Branton SL, Lott BD. Atmospheric ammonia is detrimental to the performance of modern commercial broilers. Poult Sci. 2004;83(10):1650-1654. doi:10.1093/ps/83.10.1650.'),
      numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Pullets and Laying Hens. Burnaby, BC: NFACC; 2017. Available from: nfacc.ca [cited 2026 Jun].'),
      numberedRef('Welfare Quality® Consortium. Welfare Quality® Assessment Protocol for Poultry (Broilers, Laying Hens). Lelystad, Netherlands: Welfare Quality® Consortium; 2009.'),
      numberedRef('Santos MN, Widowski TM, Kiarie EG, Guerin MT, Edwards AM, Torrey S. In pursuit of a better broiler: walking ability and incidence of contact dermatitis in conventional and slower growing strains of broiler chickens. Poult Sci. 2022;101(4):101768. doi:10.1016/j.psj.2022.101768.'),
      numberedRef('Abdallah N, Kursun K, Baylan M. Keel bone damage in commercial laying hen hybrids. Vet Med Sci. 2025;11(5):e70518. doi:10.1002/vms3.70518.'),
      numberedRef('Morrissey K, Brocklehurst S, Baker L, Widowski TM, Sandilands V. Can non-beak treated hens be kept in commercial furnished cages? Exploring the effects of strain and extra environmental enrichment on behaviour, feather cover, and mortality. Animals (Basel). 2016;6(3):17. doi:10.3390/ani6030017.'),
      numberedRef('Shi H, Li B, Tong Q, Zheng W, Zeng D, Feng G. Effects of LED light color and intensity on feather pecking and fear responses of layer breeders in natural mating colony cages. Animals (Basel). 2019;9(10):814. doi:10.3390/ani9100814.'),
      numberedRef('Scheideler SE. Cannibalism by Poultry [NebGuide G1670]. Lincoln (NE): University of Nebraska-Lincoln Extension; 2007. Available from: extensionpubs.unl.edu.'),
      numberedRef('CPC Learning Centre. Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca.'),
      numberedRef('CPC Learning Centre. Heat Stress [Technical Bulletin]. CPC Learning Centre. Available from: cpclearningcentre.ca.'),
      numberedRef('Martin GP, Fabian EE. Detecting Ammonia in Poultry Housing Using Inexpensive Instruments. University Park (PA): Penn State Extension; 2026 [cited 2026 Jul]. Available from: extension.psu.edu.'),
      numberedRef('Campbell J, Davis J, Linhoss J, Griggs K, Smith C, Edge C, Rueda M. Cold Weather Ventilation and Moisture Control of Poultry Houses. Auburn (AL): Alabama Cooperative Extension System; 2022 [cited 2026 Jul]. Available from: aces.edu.'),
      numberedRef('Caffrey NP, Dohoo IR, Cockram MS. Factors affecting mortality risk during transportation of broiler chickens for slaughter in Atlantic Canada. Prev Vet Med. 2017;147:199-208. doi:10.1016/j.prevetmed.2017.09.011.'),
      numberedRef('Knezacek TD, Olkowski AA, Kettlewell PJ, Mitchell MA, Classen HL. Temperature gradients in trailers and changes in broiler rectal and core body temperature during winter transportation in Saskatchewan. Can J Anim Sci. 2010;90(3):321-330. doi:10.4141/cjas09083.'),
      numberedRef('Vitek S, Jacobs L. Preslaughter Welfare of Broiler Chickens [APSC-209P]. Blacksburg (VA): Virginia Cooperative Extension, Virginia Tech; [cited 2026 Jul]. Available from: pubs.ext.vt.edu.'),
    ],
  };
}

// ============================================================
// STYLES
// ============================================================
function buildStyles() {
  return {
    paragraphStyles: [
      {
        id: 'Heading1', name: 'heading 1',
        run: { bold: true, color: MED_BLUE, size: 32, font: 'Calibri Light' },
        paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } } },
      },
      {
        id: 'Heading2', name: 'heading 2',
        run: { bold: true, color: DARK_BLUE, size: 26, font: 'Calibri Light' },
        paragraph: { spacing: { before: 280, after: 120 } },
      },
      {
        id: 'Heading3', name: 'heading 3',
        run: { bold: true, color: MED_BLUE, size: 22, font: 'Calibri' },
        paragraph: { spacing: { before: 200, after: 100 } },
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
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.2) } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.7), hanging: convertInchesToTwip(0.2) } } } },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.45), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
      {
        reference: 'references-list',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.45), hanging: convertInchesToTwip(0.45) } } } },
        ],
      },
    ],
  };
}

import { LevelFormat } from 'docx';

// ============================================================
// MAIN
// ============================================================
(async () => {
  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Generate figures
  console.log('Generating figures...');
  const fiveDomainsBuf = generateFiveDomainsFigure();
  const gaitBuf        = generateGaitScoringFigure();

  console.log('Building document...');

  const doc = new Document({
    description: 'Course 13 — CPC Short Courses',
    features:    { updateFields: false },
    styles:      buildStyles(),
    numbering:   buildNumbering(),
    sections: [
      buildCoverSection(),
      buildIntroSection(fiveDomainsBuf),
      buildSection1(fiveDomainsBuf),
      buildSection2(),
      buildSection3(gaitBuf),
      buildSection4(),
      buildSection5(),
      buildSection6(),
      buildSection7(),
      buildJournalSection(),
      buildReferencesSection(),
    ],
  });

  let buffer = await Packer.toBuffer(doc);

  // ============================================================
  // POST-BUILD PATCH: suppress "fields may refer to other files"
  // ============================================================
  const zip = await JSZip.loadAsync(buffer);

  // 1. settings.xml — disable auto field update
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!settings.includes('<w:updateFields')) {
    settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  }
  zip.file('word/settings.xml', settings);

  // 2. document.xml — strip dirty flags + inject cached TOC + inject bookmarks
  let docXml = await zip.file('word/document.xml').async('string');

  // Strip w:dirty="true" from all field characters
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  // 3. TOC entries with anchors for clickable rows
  const entriesWithAnchor = [
    { lvl: 1, text: 'Introduction',                                                                page: 3  },
    { lvl: 2, text: 'Learning Objectives',                                                         page: 3  },
    { lvl: 1, text: 'Section 1: Understanding Poultry Welfare',                                    page: 5  },
    { lvl: 2, text: '1.1 What Welfare Means on a Commercial Farm',                                 page: 5  },
    { lvl: 2, text: '1.2 The Five Freedoms: Where the Framework Started',                          page: 5  },
    { lvl: 2, text: '1.3 The Five Domains: Where the Science Is Now',                              page: 6  },
    { lvl: 2, text: '1.4 Why Welfare Connects Directly to Production',                             page: 7  },
    { lvl: 1, text: 'Section 2: What Your Birds Need',                                             page: 8  },
    { lvl: 2, text: '2.1 Feed and Water Access',                                                   page: 8  },
    { lvl: 2, text: '2.2 Environment: Temperature, Air Quality, and Litter',                       page: 9  },
    { lvl: 2, text: '2.3 Lighting for Welfare and Production',                                     page: 9  },
    { lvl: 2, text: '2.4 Health Care and Disease Management',                                      page: 10 },
    { lvl: 2, text: '2.5 Space, Movement, and Natural Behavior',                                   page: 10 },
    { lvl: 1, text: 'Section 3: Welfare Indicators Every Farmer Should Know',                      page: 11 },
    { lvl: 2, text: '3.1 Gait and Leg Health in Broilers',                                        page: 12 },
    { lvl: 2, text: '3.2 Footpad Dermatitis',                                                     page: 13 },
    { lvl: 2, text: '3.3 Hock Burns',                                                             page: 14 },
    { lvl: 2, text: '3.4 Keel Bone Condition in Laying Hens',                                     page: 14 },
    { lvl: 2, text: '3.5 Feather Condition and Pecking Injuries',                                  page: 15 },
    { lvl: 2, text: '3.6 Daily Mortality and Flock Behavior',                                     page: 15 },
    { lvl: 2, text: '3.7 At-a-Glance: Key Welfare Indicators',                                    page: 16 },
    { lvl: 1, text: 'Section 4: Welfare in Your Production System',                                page: 17 },
    { lvl: 2, text: '4.1 Broiler Welfare Priorities',                                              page: 17 },
    { lvl: 2, text: '4.2 Laying Hen Welfare and Housing Systems',                                  page: 18 },
    { lvl: 2, text: '4.3 Breeder Welfare Considerations',                                          page: 19 },
    { lvl: 1, text: 'Section 5: Reducing Stress and Improving the Environment',                    page: 20 },
    { lvl: 2, text: '5.1 Thermal Comfort at Every Age',                                           page: 20 },
    { lvl: 2, text: '5.2 Ventilation and Air Quality',                                            page: 21 },
    { lvl: 2, text: '5.3 Litter Quality Management',                                              page: 22 },
    { lvl: 2, text: '5.4 Light Programs That Support Welfare',                                    page: 23 },
    { lvl: 1, text: 'Section 6: Handling, Transport, and Slaughter',                               page: 24 },
    { lvl: 2, text: '6.1 Calm Handling on the Farm',                                              page: 24 },
    { lvl: 2, text: '6.2 Catching and Loading for Transport',                                     page: 25 },
    { lvl: 2, text: '6.3 From Farm to Plant: Reducing Pre-Slaughter Stress',                      page: 25 },
    { lvl: 1, text: "Section 7: The Farmer's Daily Welfare Role",                                  page: 27 },
    { lvl: 2, text: '7.1 Daily Welfare Walk-Through',                                             page: 27 },
    { lvl: 2, text: '7.2 Recording and Reporting Problems',                                       page: 28 },
    { lvl: 2, text: '7.3 Building a Welfare-Competent Team',                                      page: 28 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals',                                          page: 30 },
    { lvl: 1, text: 'References',                                                                  page: 30 },
  ].map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

  const tocEntries = entriesWithAnchor.map(tocRow).join('');
  const sepTag     = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag     = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx     = docXml.indexOf(sepTag);
  if (sepIdx !== -1) {
    const endIdx = docXml.indexOf(endTag, sepIdx);
    if (endIdx !== -1) {
      docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
    }
  }

  // Inject bookmarks around heading paragraphs for clickable TOC
  {
    let entryIdx  = 0;
    let bookmarkId = 1000;
    const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    docXml = docXml.replace(headingRegex, (match, lvlStr) => {
      if (entryIdx >= entriesWithAnchor.length) return match;
      const lvl      = Number(lvlStr);
      const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
      const heading  = textRuns.trim()
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
      const entry    = entriesWithAnchor[entryIdx];
      const norm     = (s) => s.replace(/\s+/g, ' ').trim();
      if (lvl !== entry.lvl) return match;
      if (norm(heading) !== norm(entry.text)) return match;
      entryIdx++;
      const id = bookmarkId++;
      return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
    });
    if (entryIdx !== entriesWithAnchor.length) {
      console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length}. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
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

  // 5. Sanity checks
  const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
  if (dirtyLeft > 0) {
    throw new Error(`Still ${dirtyLeft} w:dirty flags in document.xml — "fields may refer to other files" dialog will appear`);
  }

  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found), Word will reject the file`);

  // 6. British English sweep
  const britishPatterns = [
    /\b\w+isation\b/gi, /\b\w+ised\b/gi, /\b\w+ising\b/gi, /\b\w+ises\b/gi,
    /\bcolour/gi, /\bbehaviour/gi, /\bcentre\b/gi, /\bdefenc/gi, /\bneighbour/gi,
    /\bhospitalis/gi, /\bcolonis/gi, /\bgrey\b/gi, /\bmould\b/gi, /\bsulph/gi,
    /\bfaec/gi, /\boedem/gi, /\banaem/gi, /\bdiarrhoea/gi, /\bhaemo/gi,
    /\baluminium\b/gi, /\btyre\b/gi, /\bmanoeuvre/gi, /\bprogramme\b/gi,
  ];
  let britishHits = 0;
  britishPatterns.forEach(p => {
    const hits = (docXml.match(p) || []).length;
    if (hits > 0) { console.warn(`British spelling: ${p} matched ${hits} times`); britishHits += hits; }
  });
  if (britishHits === 0) console.log('British spelling sweep: PASSED (0 hits)');

  // 7. Em dash check
  const emDashCount = (docXml.match(/—/g) || []).length;
  if (emDashCount > 0) console.warn(`Em dash check: ${emDashCount} em dashes found — review before publishing`);
  else console.log('Em dash check: PASSED (0 em dashes)');

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  fs.writeFileSync(OUT_FILE, buffer);
  console.log('\nDone:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
})();
