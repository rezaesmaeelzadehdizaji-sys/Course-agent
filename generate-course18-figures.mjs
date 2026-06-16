// ============================================================
// generate-course18-figures.mjs
// Generates 3 PNG process figures for Course 18:
// Current Poultry Issues (Hot Topics)
// Uses @resvg/resvg-js (WASM, no native build tools needed)
// Run: node generate-course18-figures.mjs
// ============================================================

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 18');
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
// FIGURE 2.1 — How Avian Influenza Reaches Your Barn
// ============================================================
function fig1() {
  const W = 820, H = 560;
  let body = DEFS(C.gray, 'a18');
  // reservoir box (top)
  const resX = 210, resW = 400, resY = 66, resH = 64;
  body += `<rect x="${resX}" y="${resY}" width="${resW}" height="${resH}" rx="9" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="1.8"/>`;
  body += wrapText(resX + resW / 2, resY + 26, ['The reservoir: wild waterfowl'], { fill: C.medBlue, size: 14.5, weight: 'bold' });
  body += wrapText(resX + resW / 2, resY + 46, ['Ducks and geese carry the virus and shed it without looking sick'], { fill: C.gray, size: 12 });
  // four route boxes
  const routes = [
    { t: 'Water & feed', l: ['Ponds, puddles, and feed', 'contaminated by droppings'] },
    { t: 'People & clothing', l: ['Boots, hands, and coveralls', 'carrying the virus in'] },
    { t: 'Equipment & vehicles', l: ['Shared tools, trucks, and', 'crates moving between farms'] },
    { t: 'Pests & wild birds', l: ['Rodents and small birds', 'tracking it into the barn'] },
  ];
  const rW = 178, rH = 86, gap = 12, rY = 200;
  const totalW = rW * 4 + gap * 3;
  const startX = (W - totalW) / 2;
  routes.forEach((r, i) => {
    const x = startX + i * (rW + gap);
    body += `<rect x="${x}" y="${rY}" width="${rW}" height="${rH}" rx="8" fill="${C.lightAmber}" stroke="${C.amber}" stroke-width="1.6"/>`;
    body += wrapText(x + rW / 2, rY + 26, [r.t], { fill: C.orange, size: 13, weight: 'bold' });
    body += wrapText(x + rW / 2, rY + 46, r.l, { fill: C.gray, size: 11, lh: 15 });
    // arrow from reservoir down to each route
    body += dArrow(x + rW / 2, resY + resH + 2, x + rW / 2, rY - 3, C.gray, 'a18');
    // arrow from route down to barn
    body += dArrow(x + rW / 2, rY + rH + 2, W / 2, 392, C.gray, 'a18');
  });
  // barn box (bottom)
  const bX = 250, bW = 320, bY = 396, bH = 74;
  body += `<rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="9" fill="${C.lightRed}" stroke="${C.red}" stroke-width="2"/>`;
  body += wrapText(bX + bW / 2, bY + 30, ['Your flock'], { fill: C.red, size: 15, weight: 'bold' });
  body += wrapText(bX + bW / 2, bY + 52, ['Strong biosecurity blocks every one of these routes'], { fill: C.gray, size: 12 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'How Avian Influenza Reaches Your Barn')}
  ${body}
  ${caption(W, H, 'The virus starts in wild birds and rides onto the farm on water, people, equipment, and pests.')}
</svg>`;
  svgToPng(svg, 'fig18_1.png');
}

// ============================================================
// FIGURE 2.2 — The Widening Reach of H5N1 (clade 2.3.4.4b)
// ============================================================
function fig2() {
  const W = 820, H = 560;
  let body = DEFS(C.gray, 'b18');
  const tiers = [
    { fill: C.lightBlue, stroke: C.medBlue, t: 'Wild birds', l: ['The natural reservoir, spread along migratory flyways worldwide'] },
    { fill: C.lightGold, stroke: C.gold, t: 'Domestic poultry', l: ['Heavy losses in commercial and backyard flocks across Canada'] },
    { fill: C.lightOrange, stroke: C.orange, t: 'Wild and farmed mammals', l: ['Foxes, skunks, cats, marine mammals; sheep, goats, and alpacas'] },
    { fill: C.lightTeal, stroke: C.teal, t: 'Dairy cattle (new since 2024)', l: ['First jump into US dairy herds; spread cow-to-cow through milking'] },
    { fill: C.lightRed, stroke: C.red, t: 'Sporadic human cases', l: ['Mostly mild, in people with close animal contact; no sustained human spread'] },
  ];
  const tW = 560, tH = 64, gapY = 18, x = (W - tW) / 2;
  let y = 70;
  tiers.forEach((tr, i) => {
    body += `<rect x="${x}" y="${y}" width="${tW}" height="${tH}" rx="9" fill="${tr.fill}" stroke="${tr.stroke}" stroke-width="1.8"/>`;
    body += wrapText(x + tW / 2, y + 27, [tr.t], { fill: tr.stroke, size: 14, weight: 'bold' });
    body += wrapText(x + tW / 2, y + 47, tr.l, { fill: C.gray, size: 11.5 });
    if (i < tiers.length - 1) body += dArrow(x + tW / 2, y + tH + 1, x + tW / 2, y + tH + gapY - 2, C.gray, 'b18');
    y += tH + gapY;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'The Widening Reach of H5N1 (Clade 2.3.4.4b)')}
  ${body}
  ${caption(W, H, 'Once a bird virus, H5N1 now reaches many mammals and, rarely, people. The risk to most farmers is still occupational.')}
</svg>`;
  svgToPng(svg, 'fig18_2.png');
}

// ============================================================
// FIGURE 3.1 — Catching an Emerging Disease Early
// ============================================================
function fig3() {
  const W = 820, H = 540;
  let body = DEFS(C.gray, 'c18');
  const steps = [
    { fill: C.lightGreen, stroke: C.green, t: 'You, on the barn floor', l: ['The daily walk: spot a drop in feed or water, more deaths,', 'odd droppings, a fall in egg numbers. Write it down and act.'] },
    { fill: C.lightBlue, stroke: C.medBlue, t: 'Your veterinarian and the diagnostic lab', l: ['Birds and samples go to a provincial lab. Testing names the', 'problem and flags anything new or unusual.'] },
    { fill: C.lightGold, stroke: C.gold, t: 'National surveillance (CanNAISS and the CFIA)', l: ['Lab results feed the national picture so a new threat is seen', 'early, across farms, not one barn at a time.'] },
    { fill: C.lightAmber, stroke: C.amber, t: 'Early warning and control', l: ['Alerts, vaccine and management changes, and a faster', 'response that protects every flock in the system.'] },
  ];
  const sW = 660, sH = 78, gapY = 22, x = (W - sW) / 2;
  let y = 70;
  steps.forEach((s, i) => {
    body += `<rect x="${x}" y="${y}" width="${sW}" height="${sH}" rx="9" fill="${s.fill}" stroke="${s.stroke}" stroke-width="1.8"/>`;
    body += `<circle cx="${x + 26}" cy="${y + sH / 2}" r="15" fill="${s.stroke}"/>`;
    body += wrapText(x + 26, y + sH / 2 + 5, [String(i + 1)], { fill: C.white, size: 15, weight: 'bold' });
    body += wrapText(x + 52, y + 28, [s.t], { fill: s.stroke, size: 13.5, weight: 'bold', anchor: 'start' });
    body += wrapText(x + 52, y + 48, s.l, { fill: C.gray, size: 11.5, anchor: 'start', lh: 16 });
    if (i < steps.length - 1) body += dArrow(x + sW / 2, y + sH + 1, x + sW / 2, y + sH + gapY - 2, C.gray, 'c18');
    y += sH + gapY;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Catching an Emerging Disease Early')}
  ${body}
  ${caption(W, H, 'Early warning starts with the farmer. What you notice and report is the first link in the chain.')}
</svg>`;
  svgToPng(svg, 'fig18_3.png');
}

fig1(); fig2(); fig3();
console.log('All Course 18 figures generated.');
