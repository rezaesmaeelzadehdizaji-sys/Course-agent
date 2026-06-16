// ============================================================
// generate-course16-figures.mjs
// Generates 4 PNG process figures for Course 16:
// Preparing for an Inspection Audit
// Uses @resvg/resvg-js (WASM, no native build tools needed)
// Run: node generate-course16-figures.mjs
// ============================================================

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 16');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// CPC color palette
const C = {
  darkBlue:  '#1F3864',
  medBlue:   '#2E74B5',
  lightBlue: '#D6E4F0',
  paleBlue:  '#EBF2FA',
  gold:      '#C9A84C',
  lightGold: '#FDF6E3',
  gray:      '#3C3C3C',
  lightGray: '#F5F5F5',
  green:     '#2E7D32',
  lightGreen:'#E8F5E9',
  orange:    '#E65100',
  lightOrange:'#FFF3E0',
  amber:     '#F9A825',
  lightAmber:'#FFF8E1',
  red:       '#C62828',
  lightRed:  '#FFEBEE',
  teal:      '#00695C',
  lightTeal: '#E0F2F1',
  purple:    '#6A1B9A',
  lightPurple:'#F3E5F5',
  white:     '#FFFFFF',
};

function svgToPng(svgStr, filename) {
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: 'original' },
    font:  { loadSystemFonts: true },
  });
  const png     = resvg.render().asPng();
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, png);
  console.log('Generated:', filename, `(${(png.length / 1024).toFixed(1)} KB)`);
  return outPath;
}

const DEFS = (color = '#555555', id = 'arr') =>
  `<defs>
    <marker id="${id}" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 9 3.5, 0 7" fill="${color}"/>
    </marker>
  </defs>`;

function dArrow(x1, y1, x2, y2, color = '#555555', id = 'arr') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.5" marker-end="url(#${id})"/>`;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// word-wrap helper -> tspans
function wrapText(x, y, lines, opts = {}) {
  const lh   = opts.lh || 16;
  const fill = opts.fill || C.gray;
  const size = opts.size || 12.5;
  const weight = opts.weight || 'normal';
  const anchor = opts.anchor || 'middle';
  return lines.map((ln, i) =>
    `<text x="${x}" y="${y + i * lh}" text-anchor="${anchor}" fill="${fill}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}">${esc(ln)}</text>`
  ).join('\n');
}

function titleBar(W, text) {
  return `<rect x="0" y="0" width="${W}" height="48" fill="${C.darkBlue}"/>
<line x1="0" y1="48" x2="${W}" y2="48" stroke="${C.gold}" stroke-width="3"/>
<text x="${W / 2}" y="31" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="17" font-weight="bold">${esc(text)}</text>`;
}

function caption(W, H, text) {
  return `<rect x="0" y="${H - 30}" width="${W}" height="30" fill="${C.lightGray}"/>
<line x1="0" y1="${H - 30}" x2="${W}" y2="${H - 30}" stroke="${C.gold}" stroke-width="2"/>
<text x="${W / 2}" y="${H - 11}" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-style="italic">${esc(text)}</text>`;
}

// ============================================================
// FIGURE 16.1 — Who Audits a Canadian Poultry Farm
// ============================================================
function fig1() {
  const W = 820, H = 540;
  const bandX = 60, bandW = W - 120;
  const bands = [
    {
      y: 70, h: 90, fill: C.lightBlue, stroke: C.medBlue,
      tag: 'FEDERAL', tagFill: C.medBlue,
      title: 'Canadian Food Inspection Agency (CFIA)',
      lines: ['Sets the National Avian On-Farm Biosecurity Standard and federal food-safety', 'and animal-health rules. Steps in directly during a disease outbreak or recall.'],
    },
    {
      y: 175, h: 100, fill: C.lightGreen, stroke: C.green,
      tag: 'NATIONAL', tagFill: C.green,
      title: 'National commodity programs (the ones that audit your barn)',
      lines: ['Chicken Farmers of Canada: On-Farm Food Safety Program + Animal Care Program.', 'Egg Farmers of Canada: Start Clean-Stay Clean + Animal Care (EQA certification).', 'Turkey Farmers of Canada: On-Farm Food Safety Program + Flock Care Program.'],
    },
    {
      y: 290, h: 90, fill: C.lightGold, stroke: C.gold,
      tag: 'PROVINCIAL', tagFill: C.amber,
      title: 'Provincial marketing boards deliver and audit those programs',
      lines: ['Your provincial board (for example, the BC Chicken Marketing Board) schedules', 'the on-farm audit, trains the auditors, and tracks your corrective actions.'],
    },
    {
      y: 395, h: 90, fill: C.lightPurple, stroke: C.purple,
      tag: 'BUYERS', tagFill: C.purple,
      title: 'Processors, certifiers, and specialty programs',
      lines: ['Your processor, a welfare certification, or an organic or specialty label may run', 'its own audit on top of the national program. Same barn, a few extra checkboxes.'],
    },
  ];

  let body = '';
  for (const b of bands) {
    body += `<rect x="${bandX}" y="${b.y}" width="${bandW}" height="${b.h}" rx="8" fill="${b.fill}" stroke="${b.stroke}" stroke-width="1.6"/>`;
    body += `<rect x="${bandX}" y="${b.y}" width="118" height="${b.h}" rx="8" fill="${b.tagFill}"/>`;
    body += `<rect x="${bandX + 100}" y="${b.y}" width="18" height="${b.h}" fill="${b.tagFill}"/>`;
    body += wrapText(bandX + 59, b.y + b.h / 2 + 4, [b.tag], { fill: C.white, size: 13, weight: 'bold' });
    body += wrapText(bandX + 135, b.y + 26, [b.title], { fill: b.stroke, size: 13.5, weight: 'bold', anchor: 'start' });
    body += wrapText(bandX + 135, b.y + 46, b.lines, { fill: C.gray, size: 12, anchor: 'start', lh: 16 });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Who Audits a Canadian Poultry Farm')}
  ${body}
  ${caption(W, H, 'Most farms face one main on-farm audit a year, delivered by their provincial board, with the rules set nationally.')}
</svg>`;
  svgToPng(svg, 'fig16_1.png');
}

// ============================================================
// FIGURE 16.2 — The Six Areas Every Auditor Checks
// ============================================================
function fig2() {
  const W = 820, H = 540;
  const cells = [
    { tag: '1', fill: C.lightBlue,  stroke: C.medBlue, title: 'Biosecurity', lines: ['Entry protocols, footbaths,', 'visitor log, anteroom, pest', 'and wild-bird control'] },
    { tag: '2', fill: C.lightGreen, stroke: C.green,   title: 'Flock Health & Welfare', lines: ['Mortality records, vaccination', 'log, catching and handling,', 'lame and cull bird care'] },
    { tag: '3', fill: C.lightGold,  stroke: C.gold,    title: 'Housing & Environment', lines: ['Ventilation, litter quality,', 'lighting, stocking density,', 'temperature records'] },
    { tag: '4', fill: C.lightTeal,  stroke: C.teal,    title: 'Feed & Water', lines: ['Feed storage and labels,', 'annual water test, drinker', 'access and water quality'] },
    { tag: '5', fill: C.lightOrange,stroke: C.orange,  title: 'Records', lines: ['Flock performance, medication', 'and treatment logs, mortality,', 'shipping and receiving slips'] },
    { tag: '6', fill: C.lightPurple,stroke: C.purple,  title: 'Safety & Compliance', lines: ['PPE, labeled chemical storage,', 'pesticide handling, deadstock', 'disposal, staff training'] },
  ];
  const colW = 232, colH = 150, gapX = 26, gapY = 26;
  const startX = (W - (colW * 3 + gapX * 2)) / 2;
  const startY = 78;
  let body = '';
  cells.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = startX + col * (colW + gapX);
    const y = startY + row * (colH + gapY);
    body += `<rect x="${x}" y="${y}" width="${colW}" height="${colH}" rx="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.8"/>`;
    body += `<circle cx="${x + 26}" cy="${y + 26}" r="15" fill="${c.stroke}"/>`;
    body += wrapText(x + 26, y + 31, [c.tag], { fill: C.white, size: 15, weight: 'bold' });
    body += wrapText(x + colW / 2 + 14, y + 31, [c.title], { fill: c.stroke, size: 14.5, weight: 'bold' });
    body += wrapText(x + colW / 2, y + 64, c.lines, { fill: C.gray, size: 12, lh: 17 });
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'The Six Areas Every Auditor Checks')}
  ${body}
  ${caption(W, H, 'If you can show clean records and a working routine in all six areas, you will pass almost any poultry audit.')}
</svg>`;
  svgToPng(svg, 'fig16_2.png');
}

// ============================================================
// FIGURE 16.3 — Pre-Audit Readiness Self-Check
// ============================================================
function fig3() {
  const W = 820, H = 520;
  const steps = [
    { fill: C.lightBlue, stroke: C.medBlue, title: '1. Pull your records', lines: ['Gather the binder or open the app.', 'Flip through the last 12 months.', 'Fill any gaps before audit day.'] },
    { fill: C.lightGreen, stroke: C.green, title: '2. Walk the barn with the auditor’s eyes', lines: ['Start at the road and walk in.', 'Footbath, anteroom, feed, water,', 'litter, dead-bird area, chemicals.'] },
    { fill: C.lightAmber, stroke: C.amber, title: '3. Fix the deficiencies you find', lines: ['Top repeat issues: water testing,', 'density, rodent control, feed', 'medication cross-contamination.'] },
    { fill: C.lightPurple, stroke: C.purple, title: '4. Assign who does what', lines: ['One person owns records, one owns', 'biosecurity, one hosts the auditor.', 'Everyone knows their part.'] },
  ];
  const boxX = 70, boxW = W - 140, boxH = 86, gap = 22;
  let y = 70;
  let body = DEFS(C.medBlue, 'a3');
  steps.forEach((s, i) => {
    body += `<rect x="${boxX}" y="${y}" width="${boxW}" height="${boxH}" rx="8" fill="${s.fill}" stroke="${s.stroke}" stroke-width="1.6"/>`;
    body += wrapText(boxX + 24, y + 28, [s.title], { fill: s.stroke, size: 14.5, weight: 'bold', anchor: 'start' });
    body += wrapText(boxX + 24, y + 49, s.lines, { fill: C.gray, size: 12, anchor: 'start', lh: 15 });
    if (i < steps.length - 1) {
      body += dArrow(W / 2, y + boxH + 1, W / 2, y + boxH + gap - 2, C.medBlue, 'a3');
    }
    y += boxH + gap;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Getting Ready: A Simple Pre-Audit Self-Check')}
  ${body}
  ${caption(W, H, 'Run this self-check a few weeks out, not the night before. Small fixes are easy with time; deficiencies are not.')}
</svg>`;
  svgToPng(svg, 'fig16_3.png');
}

// ============================================================
// FIGURE 16.4 — After the Audit: The Corrective Action Loop
// ============================================================
function fig4() {
  const W = 820, H = 470;
  const cx = W / 2, cy = 250, r = 150;
  const nodes = [
    { ang: -90, fill: C.lightBlue, stroke: C.medBlue, title: 'Read the report', lines: ['Pass, or a list of', 'corrective actions'] },
    { ang: -18, fill: C.lightAmber, stroke: C.amber, title: 'Get a deadline', lines: ['Each fix has a', 'due date'] },
    { ang: 54, fill: C.lightGreen, stroke: C.green, title: 'Fix it for real', lines: ['Change the routine,', 'not just the day'] },
    { ang: 126, fill: C.lightTeal, stroke: C.teal, title: 'Show proof', lines: ['Photo, receipt, or', 'updated record'] },
    { ang: 198, fill: C.lightPurple, stroke: C.purple, title: 'Keep it fixed', lines: ['Build it into daily', 'work so it holds'] },
  ];
  let body = DEFS(C.gold, 'a4');
  // circular arrows
  const pts = nodes.map(n => {
    const a = n.ang * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    // shorten endpoints toward node centers
    const dx = q.x - p.x, dy = q.y - p.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const sx = p.x + ux * 56, sy = p.y + uy * 56;
    const ex = q.x - ux * 56, ey = q.y - uy * 56;
    body += dArrow(sx, sy, ex, ey, C.gold, 'a4');
  }
  nodes.forEach((n, i) => {
    const p = pts[i];
    body += `<circle cx="${p.x}" cy="${p.y}" r="52" fill="${n.fill}" stroke="${n.stroke}" stroke-width="2"/>`;
    body += wrapText(p.x, p.y - 6, [n.title], { fill: n.stroke, size: 12.5, weight: 'bold' });
    body += wrapText(p.x, p.y + 11, n.lines, { fill: C.gray, size: 10.5, lh: 12 });
  });
  body += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">Every audit</text>`;
  body += `<text x="${cx}" y="${cy + 13}" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">makes the next</text>`;
  body += `<text x="${cx}" y="${cy + 32}" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">one easier</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'After the Audit: The Corrective Action Loop')}
  ${body}
  ${caption(W, H, 'A corrective action is not closed when you fix it once. It is closed when it cannot come back.')}
</svg>`;
  svgToPng(svg, 'fig16_4.png');
}

fig1();
fig2();
fig3();
fig4();
console.log('All Course 16 figures generated.');
