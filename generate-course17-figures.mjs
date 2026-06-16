// ============================================================
// generate-course17-figures.mjs
// Generates 4 PNG process figures for Course 17:
// Regulatory Framework in Poultry Production
// Uses @resvg/resvg-js (WASM, no native build tools needed)
// Run: node generate-course17-figures.mjs
// ============================================================

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 17');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const C = {
  darkBlue:  '#1F3864', medBlue:   '#2E74B5', lightBlue: '#D6E4F0', paleBlue:  '#EBF2FA',
  gold:      '#C9A84C', lightGold: '#FDF6E3', gray:      '#3C3C3C', lightGray: '#F5F5F5',
  green:     '#2E7D32', lightGreen:'#E8F5E9', orange:    '#E65100', lightOrange:'#FFF3E0',
  amber:     '#F9A825', lightAmber:'#FFF8E1', red:       '#C62828', lightRed:  '#FFEBEE',
  teal:      '#00695C', lightTeal: '#E0F2F1', purple:    '#6A1B9A', lightPurple:'#F3E5F5',
  white:     '#FFFFFF',
};

function svgToPng(svgStr, filename) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'original' }, font: { loadSystemFonts: true } });
  const png = resvg.render().asPng();
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, png);
  console.log('Generated:', filename, `(${(png.length / 1024).toFixed(1)} KB)`);
  return outPath;
}

const DEFS = (color = '#555555', id = 'arr') =>
  `<defs><marker id="${id}" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="${color}"/></marker></defs>`;
function dArrow(x1, y1, x2, y2, color = '#555555', id = 'arr') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.5" marker-end="url(#${id})"/>`;
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function wrapText(x, y, lines, opts = {}) {
  const lh = opts.lh || 16, fill = opts.fill || C.gray, size = opts.size || 12.5;
  const weight = opts.weight || 'normal', anchor = opts.anchor || 'middle', style = opts.style || 'normal';
  return lines.map((ln, i) =>
    `<text x="${x}" y="${y + i * lh}" text-anchor="${anchor}" fill="${fill}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" font-style="${style}">${esc(ln)}</text>`
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
// FIGURE 1.1 — The Three Layers of Poultry Regulation in Canada
// ============================================================
function fig1() {
  const W = 820, H = 540;
  const bandX = 60, bandW = W - 120;
  const bands = [
    { y: 70, h: 112, fill: C.lightBlue, stroke: C.medBlue, tag: 'FEDERAL', tagFill: C.medBlue,
      title: 'Government of Canada',
      lines: ['Agriculture and Agri-Food Canada sets national policy and trade rules.',
              'The Canadian Food Inspection Agency runs food safety, animal health,',
              'humane transport, and reportable-disease control.'] },
    { y: 197, h: 132, fill: C.lightGreen, stroke: C.green, tag: 'NATIONAL', tagFill: C.green,
      title: 'National industry bodies',
      lines: ['Farm Products Council of Canada oversees supply management.',
              'Chicken, Egg, Turkey, and Hatching Egg national agencies set quota',
              'and run the on-farm food safety and animal care programs.',
              'NFACC writes the Codes of Practice that the programs are built on.'] },
    { y: 344, h: 122, fill: C.lightGold, stroke: C.gold, tag: 'PROVINCIAL', tagFill: C.amber,
      title: 'Provincial marketing boards and laws',
      lines: ['Your provincial board (for example, the BC Chicken Marketing Board)',
              'holds quota, licenses farms, and delivers and audits the programs.',
              'Provincial law (such as the BC PCA Act) adds welfare enforcement.'] },
  ];
  let body = '';
  for (const b of bands) {
    body += `<rect x="${bandX}" y="${b.y}" width="${bandW}" height="${b.h}" rx="8" fill="${b.fill}" stroke="${b.stroke}" stroke-width="1.6"/>`;
    body += `<rect x="${bandX}" y="${b.y}" width="118" height="${b.h}" rx="8" fill="${b.tagFill}"/>`;
    body += `<rect x="${bandX + 100}" y="${b.y}" width="18" height="${b.h}" fill="${b.tagFill}"/>`;
    body += wrapText(bandX + 59, b.y + b.h / 2 + 4, [b.tag], { fill: C.white, size: 13, weight: 'bold' });
    body += wrapText(bandX + 135, b.y + 26, [b.title], { fill: b.stroke, size: 14, weight: 'bold', anchor: 'start' });
    body += wrapText(bandX + 135, b.y + 48, b.lines, { fill: C.gray, size: 12, anchor: 'start', lh: 17 });
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'The Three Layers of Poultry Regulation in Canada')}
  ${body}
  ${caption(W, H, 'Federal law sets the floor, national industry bodies set the programs, and your provincial board delivers and audits them.')}
</svg>`;
  svgToPng(svg, 'fig17_1.png');
}

// ============================================================
// FIGURE 2.1 — The Three Pillars of Supply Management
// ============================================================
function fig2() {
  const W = 820, H = 540;
  const cols = [
    { tag: '1', fill: C.lightBlue, stroke: C.medBlue, title: 'Production discipline',
      lines: ['Farmers produce to a quota', 'matched to what Canadians', 'will buy. No chronic surplus,', 'no dumping below cost.'] },
    { tag: '2', fill: C.lightGreen, stroke: C.green, title: 'Import control',
      lines: ['Tariff rate quotas (TRQs) set', 'how much poultry comes in at', 'a low tariff, so imports do not', 'flood the home market.'] },
    { tag: '3', fill: C.lightGold, stroke: C.gold, title: 'Producer pricing',
      lines: ['Prices are set to cover the', 'cost of production, giving', 'farmers a fair, predictable', 'return for their birds.'] },
  ];
  const colW = 224, colH = 220, gapX = 28;
  const startX = (W - (colW * 3 + gapX * 2)) / 2;
  const startY = 84;
  let body = '';
  cols.forEach((c, i) => {
    const x = startX + i * (colW + gapX);
    body += `<rect x="${x}" y="${startY}" width="${colW}" height="${colH}" rx="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.8"/>`;
    body += `<circle cx="${x + colW / 2}" cy="${startY + 36}" r="20" fill="${c.stroke}"/>`;
    body += wrapText(x + colW / 2, startY + 42, [c.tag], { fill: C.white, size: 18, weight: 'bold' });
    body += wrapText(x + colW / 2, startY + 84, [c.title], { fill: c.stroke, size: 14.5, weight: 'bold' });
    body += wrapText(x + colW / 2, startY + 116, c.lines, { fill: C.gray, size: 12.5, lh: 18 });
  });
  // base bar
  const baseY = startY + colH + 22;
  body += `<rect x="${startX}" y="${baseY}" width="${colW * 3 + gapX * 2}" height="56" rx="8" fill="${C.darkBlue}"/>`;
  body += wrapText(W / 2, baseY + 23, ['Result: stable supply, predictable prices, and a fair return'], { fill: C.white, size: 14, weight: 'bold' });
  body += wrapText(W / 2, baseY + 43, ['without ongoing government subsidies'], { fill: C.lightGold, size: 12.5 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'The Three Pillars of Supply Management')}
  ${body}
  ${caption(W, H, 'Supply management balances how much is produced, how much is imported, and what farmers are paid.')}
</svg>`;
  svgToPng(svg, 'fig17_2.png');
}

// ============================================================
// FIGURE 4.1 — If You Suspect a Reportable Disease
// ============================================================
function fig3() {
  const W = 820, H = 560;
  const cx = W / 2;
  const boxes = [
    { y: 72,  h: 78, fill: C.lightRed, stroke: C.red, title: 'You see warning signs',
      lines: ['Sudden high mortality, a sharp drop in feed or water intake,', 'or respiratory or nervous-system signs spreading through the flock.'] },
    { y: 188, h: 86, fill: C.lightAmber, stroke: C.amber, title: 'Call your veterinarian and report to the CFIA right away',
      lines: ['Avian influenza and Newcastle disease are reportable under the Health of', 'Animals Act. By law, suspected cases must be reported to the CFIA. Do not wait', 'for confirmation, and do not move birds, eggs, or equipment off the farm.'] },
    { y: 312, h: 70, fill: C.lightBlue, stroke: C.medBlue, title: 'The CFIA investigates',
      lines: ['Inspectors sample the flock and confirm or rule out the disease.', 'You tighten biosecurity and hold everything in place while they work.'] },
    { y: 420, h: 78, fill: C.lightGreen, stroke: C.green, title: 'If confirmed: control and recover',
      lines: ['Quarantine and movement control, humane depopulation if required,', 'cleaning and disinfection, and federal compensation for ordered destruction.'] },
  ];
  let body = DEFS(C.gray, 'a17');
  const bw = 660, bx = cx - bw / 2;
  boxes.forEach((b, i) => {
    body += `<rect x="${bx}" y="${b.y}" width="${bw}" height="${b.h}" rx="9" fill="${b.fill}" stroke="${b.stroke}" stroke-width="1.8"/>`;
    body += wrapText(cx, b.y + 24, [b.title], { fill: b.stroke, size: 14, weight: 'bold' });
    body += wrapText(cx, b.y + 45, b.lines, { fill: C.gray, size: 12, lh: 16 });
    if (i < boxes.length - 1) {
      const yA = b.y + b.h, yB = boxes[i + 1].y;
      body += dArrow(cx, yA + 2, cx, yB - 3, C.gray, 'a17');
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'If You Suspect a Reportable Disease')}
  ${body}
  ${caption(W, H, 'Reporting fast is both the law and the best way to protect your flock and your neighbors.')}
</svg>`;
  svgToPng(svg, 'fig17_3.png');
}

// ============================================================
// FIGURE 6.1 — The Records That Keep You Compliant
// ============================================================
function fig4() {
  const W = 820, H = 560;
  const cells = [
    { tag: 'A', fill: C.lightBlue, stroke: C.medBlue, title: 'Flock & mortality', lines: ['Daily mortality, flock', 'performance, placement', 'and shipping dates'] },
    { tag: 'B', fill: C.lightGreen, stroke: C.green, title: 'Treatments & medication', lines: ['Every drug, the reason,', 'dose, and withdrawal', 'time before shipping'] },
    { tag: 'C', fill: C.lightTeal, stroke: C.teal, title: 'Feed & water', lines: ['Feed tags and source,', 'medicated feed records,', 'annual water test'] },
    { tag: 'D', fill: C.lightGold, stroke: C.gold, title: 'Biosecurity', lines: ['Visitor log, cleaning and', 'disinfection, pest control,', 'dead-bird handling'] },
    { tag: 'E', fill: C.lightOrange, stroke: C.orange, title: 'Animal care', lines: ['Vaccination, barn', 'environment, density and', 'high-density monitoring'] },
    { tag: 'F', fill: C.lightPurple, stroke: C.purple, title: 'Shipping & inputs', lines: ['Receiving slips, chick and', 'poult source, catch and', 'load records'] },
  ];
  const colW = 232, colH = 132, gapX = 26, gapY = 24;
  const startX = (W - (colW * 3 + gapX * 2)) / 2;
  const startY = 78;
  let body = '';
  cells.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = startX + col * (colW + gapX);
    const y = startY + row * (colH + gapY);
    body += `<rect x="${x}" y="${y}" width="${colW}" height="${colH}" rx="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.8"/>`;
    body += `<circle cx="${x + 26}" cy="${y + 26}" r="15" fill="${c.stroke}"/>`;
    body += wrapText(x + 26, y + 31, [c.tag], { fill: C.white, size: 14, weight: 'bold' });
    body += wrapText(x + 48, y + 30, [c.title], { fill: c.stroke, size: 13.5, weight: 'bold', anchor: 'start' });
    body += wrapText(x + 18, y + 58, c.lines, { fill: C.gray, size: 11.5, anchor: 'start', lh: 16 });
  });
  const barY = startY + colH * 2 + gapY + 18;
  body += `<rect x="${startX}" y="${barY}" width="${colW * 3 + gapX * 2}" height="50" rx="8" fill="${C.darkBlue}"/>`;
  body += wrapText(W / 2, barY + 21, ['Kept current and on file, these records are what an annual audit checks'], { fill: C.white, size: 13.5, weight: 'bold' });
  body += wrapText(W / 2, barY + 39, ['and what tells you how your flock is really doing'], { fill: C.lightGold, size: 12 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'The Records That Keep You Compliant')}
  ${body}
  ${caption(W, H, 'The paperwork an auditor wants is the same paperwork that runs a good barn.')}
</svg>`;
  svgToPng(svg, 'fig17_4.png');
}

fig1(); fig2(); fig3(); fig4();
console.log('All Course 17 figures generated.');
