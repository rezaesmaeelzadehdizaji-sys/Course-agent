// ============================================================
// generate-course15-figures.mjs
// Generates 5 PNG diagram figures for Course 15: Serology 101
// Uses @resvg/resvg-js (WASM, no native build tools needed)
// Run: node generate-course15-figures.mjs
// ============================================================

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 15');

// CPC color palette
const C = {
  darkBlue:   '#1F3864',
  medBlue:    '#2E74B5',
  lightBlue:  '#D6E4F0',
  gold:       '#C9A84C',
  lightGold:  '#FDF6E3',
  gray:       '#3C3C3C',
  lightGray:  '#F5F5F5',
  green:      '#2E7D32',
  lightGreen: '#E8F5E9',
  orange:     '#E65100',
  lightOrange:'#FFF3E0',
  amber:      '#F9A825',
  lightAmber: '#FFF8E1',
  red:        '#C62828',
  lightRed:   '#FFEBEE',
  white:      '#FFFFFF',
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
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" marker-end="url(#${id})"/>`;
}

function box(x, y, w, h, fill, stroke, text1, text2 = '', rx = 6, fontSize = 13) {
  const mid = y + h / 2;
  const t1y = text2 ? mid - 7 : mid + 5;
  const t2y = mid + 12;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
<text x="${x + w / 2}" y="${t1y}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">${text1}</text>
${text2 ? `<text x="${x + w / 2}" y="${t2y}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">${text2}</text>` : ''}`;
}

function caption(W, H, text) {
  return `<rect x="0" y="${H - 32}" width="${W}" height="32" fill="${C.lightGray}"/>
<line x1="0" y1="${H - 32}" x2="${W}" y2="${H - 32}" stroke="${C.gold}" stroke-width="2"/>
<text x="${W / 2}" y="${H - 12}" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11">${text}</text>`;
}

function titleBar(W, text) {
  return `<rect x="0" y="0" width="${W}" height="48" fill="${C.darkBlue}"/>
<line x1="0" y1="48" x2="${W}" y2="48" stroke="${C.gold}" stroke-width="3"/>
<text x="${W / 2}" y="30" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="15" font-weight="bold">${text}</text>`;
}

// ============================================================
// FIGURE 15.1 — Two Lines of Defense: Innate vs Acquired Immunity
// ============================================================
function fig15_1() {
  const W = 800, H = 480;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, "A Bird's Two Lines of Defense")}
  ${DEFS(C.gray, 'gr')}

  <!-- Top box: Bird exposed to a germ -->
  <rect x="280" y="64" width="240" height="46" rx="8" fill="${C.darkBlue}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="86" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Bird Meets a Germ</text>
  <text x="400" y="102" text-anchor="middle" fill="${C.lightBlue}" font-family="Arial, sans-serif" font-size="10">(bacteria, virus, or vaccine strain)</text>

  ${dArrow(370, 110, 230, 150, C.gray, 'gr')}
  ${dArrow(430, 110, 570, 150, C.gray, 'gr')}

  <!-- Left branch: Innate immunity -->
  <rect x="50" y="155" width="340" height="290" rx="8" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="2"/>
  <text x="220" y="182" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Innate Immunity</text>
  <text x="220" y="200" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Always on. Reacts the same way every time.</text>

  ${box(70, 215, 300, 42, C.white, C.green, 'Physical barriers', 'Skin, feathers, mucus in the airway', 6, 12)}
  ${box(70, 265, 300, 42, C.white, C.green, 'General inflammation', 'Redness, heat, swelling at the site', 6, 12)}
  ${box(70, 315, 300, 42, C.white, C.green, 'Roving immune cells', 'Engulf and destroy germs on contact', 6, 12)}

  <rect x="70" y="370" width="300" height="60" rx="6" fill="${C.white}" stroke="${C.green}" stroke-dasharray="4,3"/>
  <text x="220" y="392" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Fast, but does not "remember"</text>
  <text x="220" y="410" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Same response on day 1 and day 100</text>

  <!-- Right branch: Acquired immunity -->
  <rect x="410" y="155" width="340" height="290" rx="8" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="2"/>
  <text x="580" y="182" text-anchor="middle" fill="${C.medBlue}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Acquired Immunity</text>
  <text x="580" y="200" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Builds up after exposure. Targets one germ.</text>

  <rect x="430" y="212" width="300" height="56" rx="6" fill="${C.white}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="580" y="232" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Active immunity</text>
  <text x="580" y="248" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">The bird builds its own antibodies</text>
  <text x="580" y="262" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">after infection or vaccination</text>

  <rect x="430" y="276" width="300" height="56" rx="6" fill="${C.white}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="580" y="296" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Passive immunity</text>
  <text x="580" y="312" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Maternal antibodies pass from hen to</text>
  <text x="580" y="326" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">chick through the egg yolk</text>

  <rect x="430" y="340" width="300" height="92" rx="6" fill="${C.white}" stroke="${C.medBlue}" stroke-dasharray="4,3"/>
  <text x="580" y="362" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Slower to start, but specific and</text>
  <text x="580" y="378" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">leaves a "memory"</text>
  <text x="580" y="399" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Antibody levels in the blood (titers) are</text>
  <text x="580" y="414" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">part of this. This is what serology measures.</text>

  ${caption(W, H, 'Figure 1.1  |  Innate immunity reacts to everything the same way; acquired immunity learns and remembers')}
</svg>`;
}

// ============================================================
// FIGURE 15.2 — Primary vs Secondary Immune Response
// ============================================================
function fig15_2() {
  const W = 800, H = 480;
  const x0 = 80, y0 = 380, xAxisLen = 660, yAxisLen = 300;

  // Primary response curve points (slow rise, lower peak, slow decline)
  const primary = [
    [x0 + 0,   y0],
    [x0 + 60,  y0 - 5],
    [x0 + 120, y0 - 15],
    [x0 + 180, y0 - 60],
    [x0 + 230, y0 - 95],
    [x0 + 280, y0 - 100],
    [x0 + 340, y0 - 85],
    [x0 + 400, y0 - 65],
  ];
  // Secondary response curve (after 2nd exposure: faster, higher, longer)
  const secondary = [
    [x0 + 400, y0 - 65],
    [x0 + 430, y0 - 70],
    [x0 + 460, y0 - 130],
    [x0 + 500, y0 - 210],
    [x0 + 560, y0 - 255],
    [x0 + 620, y0 - 250],
    [x0 + 660, y0 - 230],
  ];

  const toPath = (pts) => 'M ' + pts.map(p => p.join(' ')).join(' L ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Primary vs. Secondary Antibody Response')}
  ${DEFS(C.gray, 'axisArr')}

  <!-- Axes -->
  <line x1="${x0}" y1="${y0}" x2="${x0 + xAxisLen}" y2="${y0}" stroke="${C.gray}" stroke-width="2" marker-end="url(#axisArr)"/>
  <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - yAxisLen}" stroke="${C.gray}" stroke-width="2" marker-end="url(#axisArr)"/>
  <text x="${x0 + xAxisLen / 2}" y="${y0 + 60}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Time (days to weeks)</text>
  <text x="30" y="${y0 - yAxisLen / 2}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" transform="rotate(-90 30 ${y0 - yAxisLen / 2})">Antibody Level (Titer)</text>

  <!-- Exposure markers -->
  <line x1="${x0 + 0}" y1="${y0}" x2="${x0 + 0}" y2="${y0 + 14}" stroke="${C.medBlue}" stroke-width="3"/>
  <text x="${x0 + 0}" y="${y0 + 30}" text-anchor="middle" fill="${C.medBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">1st exposure</text>
  <text x="${x0 + 0}" y="${y0 + 44}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">(infection or vaccine)</text>

  <line x1="${x0 + 400}" y1="${y0}" x2="${x0 + 400}" y2="${y0 + 14}" stroke="${C.green}" stroke-width="3"/>
  <text x="${x0 + 400}" y="${y0 + 30}" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">2nd exposure</text>
  <text x="${x0 + 400}" y="${y0 + 44}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">(booster or field challenge)</text>

  <!-- Curves -->
  <path d="${toPath(primary)}" fill="none" stroke="${C.medBlue}" stroke-width="3"/>
  <path d="${toPath(secondary)}" fill="none" stroke="${C.green}" stroke-width="3"/>

  <!-- Lag period shading -->
  <rect x="${x0}" y="${y0 - 4}" width="60" height="4" fill="${C.amber}"/>
  <text x="${x0 + 30}" y="${y0 - 10}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">lag (4-20 days)</text>

  <!-- Labels for curves -->
  <rect x="${x0 + 130}" y="${y0 - 145}" width="190" height="40" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}"/>
  <text x="${x0 + 225}" y="${y0 - 128}" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Primary response</text>
  <text x="${x0 + 225}" y="${y0 - 113}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Slow rise, lower peak</text>

  <rect x="${x0 + 470}" y="${y0 - 295}" width="190" height="40" rx="6" fill="${C.lightGreen}" stroke="${C.green}"/>
  <text x="${x0 + 565}" y="${y0 - 278}" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Secondary response</text>
  <text x="${x0 + 565}" y="${y0 - 263}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Fast, much higher peak</text>

  ${caption(W, H, 'Figure 1.2  |  Memory cells from the first exposure drive a faster, bigger response the second time')}
</svg>`;
}

// ============================================================
// FIGURE 15.3 — How an AGID Result Forms (mechanism + line of identity)
// ============================================================
function fig15_3() {
  const W = 820, H = 580;
  const rad = d => (Math.PI / 180) * d;

  // ---- small well helper for the mechanism strip ----
  const well = (x, y, fill, label, r = 15) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${C.gray}" stroke-width="1.5"/>` +
    `<text x="${x}" y="${y + 4}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">${label}</text>`;

  // ============ MECHANISM STRIP (top) ============
  const my = 168; // well row y for the strip
  // Stage 2 wells sit at x=410 (Ag) and x=480 (Ab); arrows live in the gap between them,
  // outside both wells, and the dot trails funnel toward the meeting point (~445, my).
  const diff =
    dArrow(429, my, 443, my, C.orange, 'agO') +
    dArrow(461, my, 447, my, C.medBlue, 'agB') +
    `<circle cx="431" cy="${my - 11}" r="2.7" fill="${C.orange}"/>` +
    `<circle cx="437" cy="${my - 7}"  r="2.7" fill="${C.orange}"/>` +
    `<circle cx="443" cy="${my - 3}"  r="2.7" fill="${C.orange}"/>` +
    `<circle cx="459" cy="${my + 11}" r="2.7" fill="${C.medBlue}"/>` +
    `<circle cx="453" cy="${my + 7}"  r="2.7" fill="${C.medBlue}"/>` +
    `<circle cx="447" cy="${my + 3}"  r="2.7" fill="${C.medBlue}"/>`;

  // ============ ROSETTE (bottom) ============
  const cx = 215, cy = 415, R = 92, wr = 17;
  const angles = [-90, -30, 30, 90, 150, 210];
  // roles clockwise from top: +ctrl, test(+), +ctrl, test(NEG), +ctrl, test(+)
  const roles  = ['ctrl', 'testpos', 'ctrl', 'testneg', 'ctrl', 'testpos'];
  const fillFor  = r => r === 'ctrl' ? C.lightBlue : r === 'testpos' ? C.lightGreen : C.lightRed;
  const labelFor = r => r === 'ctrl' ? '+ctrl' : 'test';
  const reacts   = i => roles[i] !== 'testneg';
  const pt = (ang, rr) => [cx + rr * Math.cos(rad(ang)), cy + rr * Math.sin(rad(ang))];

  // fused precipitin arcs (line of identity) between adjacent reacting wells; gap at the negative well
  let arcs = '';
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6;
    if (reacts(i) && reacts(j)) {
      const [ax, ay] = pt(angles[i], R - wr - 6);
      const [bx, by] = pt(angles[j], R - wr - 6);
      const aj = angles[j] < angles[i] ? angles[j] + 360 : angles[j];
      const midAng = (angles[i] + aj) / 2;
      const [kx, ky] = pt(midAng, R * 0.40);
      arcs += `<path d="M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${kx.toFixed(1)} ${ky.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}" fill="none" stroke="${C.darkBlue}" stroke-width="3"/>`;
    }
  }
  // wells
  let wells = '';
  angles.forEach((a, i) => {
    const [wx, wy] = pt(a, R);
    wells += `<circle cx="${wx.toFixed(1)}" cy="${wy.toFixed(1)}" r="${wr}" fill="${fillFor(roles[i])}" stroke="${C.gray}" stroke-width="1.5"/>`;
    wells += `<text x="${wx.toFixed(1)}" y="${(wy + 3.5).toFixed(1)}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="9" font-weight="bold">${labelFor(roles[i])}</text>`;
  });
  const [nx, ny] = pt(90, R); // negative well (bottom)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'How an AGID Result Forms')}
  ${DEFS(C.orange, 'agO')}
  ${DEFS(C.medBlue, 'agB')}
  ${DEFS(C.gray, 'agStage')}
  ${DEFS(C.red, 'agPtr')}

  <!-- ===== Mechanism strip ===== -->
  <rect x="18" y="62" width="784" height="168" rx="8" fill="${C.lightGray}" stroke="#DDD"/>
  <text x="30" y="84" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Where the line comes from: antigen and antibody diffuse together and drop out as a solid line</text>

  <!-- Stage 1 -->
  ${well(140, my, C.amber, 'Ag')}
  ${well(200, my, C.lightBlue, 'Ab')}
  <text x="170" y="212" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">1. Antigen and serum</text>
  <text x="170" y="226" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">sit in separate wells</text>
  ${dArrow(250, my, 320, my, C.gray, 'agStage')}

  <!-- Stage 2 -->
  ${well(410, my, C.amber, 'Ag')}
  ${well(480, my, C.lightBlue, 'Ab')}
  ${diff}
  <text x="445" y="212" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">2. Both spread through</text>
  <text x="445" y="226" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">the gel toward each other</text>
  ${dArrow(520, my, 590, my, C.gray, 'agStage')}

  <!-- Stage 3: precipitin line forms between the two wells -->
  ${well(680, my, C.amber, 'Ag')}
  ${well(740, my, C.lightBlue, 'Ab')}
  <line x1="710" y1="${my - 20}" x2="710" y2="${my + 20}" stroke="#FFFFFF" stroke-width="6"/>
  <line x1="710" y1="${my - 20}" x2="710" y2="${my + 20}" stroke="${C.darkBlue}" stroke-width="3"/>
  <text x="710" y="212" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">3. A visible precipitin</text>
  <text x="710" y="226" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">line forms where they meet</text>

  <!-- ===== Rosette ===== -->
  <text x="30" y="270" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Reading the plate: antigen in the center well, serum in the six wells around it</text>

  <circle cx="${cx}" cy="${cy}" r="118" fill="${C.lightGray}" stroke="#BBB" stroke-width="1.5"/>
  ${arcs}
  <circle cx="${cx}" cy="${cy}" r="${wr}" fill="${C.amber}" stroke="${C.gray}" stroke-width="1.5"/>
  <text x="${cx}" y="${cy + 3.5}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="9" font-weight="bold">Ag</text>
  ${wells}

  <!-- Pointer: line of identity (top-right junction) -->
  ${dArrow(430, 300, 262, 352, C.red, 'agPtr')}
  <rect x="430" y="286" width="360" height="52" rx="6" fill="${C.lightGreen}" stroke="${C.green}"/>
  <text x="442" y="306" fill="${C.green}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">POSITIVE: line of identity</text>
  <text x="442" y="324" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">The test line joins the control line in one smooth curve.</text>

  <!-- Pointer: negative well (bottom) -->
  ${dArrow(430, 470, nx + 22, ny - 6, C.red, 'agPtr')}
  <rect x="430" y="446" width="360" height="52" rx="6" fill="${C.lightRed}" stroke="${C.red}"/>
  <text x="442" y="466" fill="${C.red}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">NEGATIVE: no line</text>
  <text x="442" y="484" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">No antibody in the serum, so the curve breaks at that well.</text>

  <!-- Legend -->
  <rect x="430" y="352" width="360" height="86" rx="6" fill="${C.white}" stroke="#CCC"/>
  <circle cx="446" cy="370" r="7" fill="${C.amber}" stroke="${C.gray}"/>
  <text x="460" y="374" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Ag: the known antigen for the disease tested</text>
  <circle cx="446" cy="392" r="7" fill="${C.lightBlue}" stroke="${C.gray}"/>
  <text x="460" y="396" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">+ctrl: known positive control serum</text>
  <circle cx="446" cy="414" r="7" fill="${C.lightGreen}" stroke="${C.gray}"/>
  <text x="460" y="418" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">test: the bird's serum</text>
  <line x1="440" y1="432" x2="452" y2="432" stroke="${C.darkBlue}" stroke-width="3"/>
  <text x="460" y="436" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">precipitin line (antigen and antibody locked together)</text>

  ${caption(W, H, 'Figure 2.1  |  Antigen and antibody diffuse together to form a precipitin line; a test line that fuses with the control line is a positive line of identity')}
</svg>`;
}

// ============================================================
// FIGURE 15.4 — Doubling-Dilution (Log2) Titer Scale
// ============================================================
function fig15_4() {
  const W = 800, H = 420;
  const dilutions = ['1:2','1:4','1:8','1:16','1:32','1:64','1:128','1:256','1:512','1:1,024','1:2,048+'];
  const groups    = [1,2,3,4,5,6,7,8,9,10,11];

  const startX = 60, endX = 760, n = dilutions.length;
  const step = (endX - startX) / (n - 1);
  const barY = 200, barH = 36;

  let bars = '';
  dilutions.forEach((d, i) => {
    const x = startX + i * step - 28;
    const shade = i < 4 ? C.lightRed : (i < 7 ? C.lightAmber : C.lightGreen);
    const stroke = i < 4 ? C.red : (i < 7 ? C.amber : C.green);
    bars += `<rect x="${x}" y="${barY}" width="56" height="${barH}" fill="${shade}" stroke="${stroke}" stroke-width="1.5"/>`;
    bars += `<text x="${x + 28}" y="${barY + 23}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">${d}</text>`;
    bars += `<text x="${x + 28}" y="${barY + 70}" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${groups[i]}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Doubling-Dilution Titer Scale (HI / AGID-Style Reports)')}
  ${DEFS(C.gray, 'titerArr')}

  <text x="${W/2}" y="100" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">Each step on the scale is twice the antibody of the step before it.</text>
  <text x="${W/2}" y="118" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">A jump from titer group 4 to group 6 is a 4-fold rise, not a 50% increase.</text>

  <text x="${startX - 10}" y="${barY - 14}" text-anchor="start" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Reciprocal serum dilution showing a positive reaction:</text>
  ${bars}
  <text x="${startX - 10}" y="${barY + 50}" text-anchor="start" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Titer group (log2):</text>

  ${dArrow(startX, barY + 80, endX, barY + 80, C.gray, 'titerArr')}
  <text x="${startX + 60}" y="${barY + 100}" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Low / negative</text>
  <text x="${(startX+endX)/2}" y="${barY + 100}" text-anchor="middle" fill="${C.amber}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Moderate response</text>
  <text x="${endX - 60}" y="${barY + 100}" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Strong response</text>

  <rect x="60" y="330" width="700" height="50" rx="6" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="410" y="350" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">ELISA reports work differently: the lab converts a light-density reading into a continuous</text>
  <text x="410" y="368" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">titer number (e.g. 4,200) using a standard curve, not a doubling-dilution series.</text>

  ${caption(W, H, 'Figure 6.1  |  Reading the doubling-dilution scale used for HI and AGID titer reports')}
</svg>`;
}

// ============================================================
// FIGURE 15.5 — %CV Histogram Comparison (BioChek 2017 scale)
// ============================================================
function fig15_5() {
  const W = 800, H = 460;

  // Excellent: tight bell curve, CV < 40%
  const exHeights = [1, 4, 14, 48, 26, 6, 1];
  // Need to Improve: wide / two-humped spread, CV > 60%
  const niHeights = [16, 22, 12, 8, 12, 18, 14];

  let histEx = '';
  exHeights.forEach((h, idx) => {
    const x = 55 + idx * 32;
    const y = 270 - h * 2.7;
    histEx += `<rect x="${x}" y="${y}" width="26" height="${h*2.7}" fill="${C.green}" stroke="${C.darkBlue}" stroke-width="0.5"/>`;
  });

  let histNi = '';
  niHeights.forEach((h, idx) => {
    const x = 455 + idx * 32;
    const y = 270 - h * 2.7;
    histNi += `<rect x="${x}" y="${y}" width="26" height="${h*2.7}" fill="${C.red}" stroke="${C.darkBlue}" stroke-width="0.5"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Reading the Lab Histogram: Uniform vs. Spread-Out Response')}

  <!-- Left: Excellent -->
  <rect x="30" y="65" width="350" height="280" rx="6" fill="${C.lightGray}" stroke="#ccc"/>
  <text x="205" y="90" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Tight, Uniform Peak</text>
  <text x="205" y="108" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Most birds land in the same titer range</text>
  ${histEx}
  <line x1="50" y1="270" x2="280" y2="270" stroke="${C.gray}" stroke-width="1.5"/>
  <text x="165" y="290" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Titer groups, low to high</text>
  <rect x="50" y="300" width="310" height="40" rx="4" fill="${C.lightGreen}" stroke="${C.green}"/>
  <text x="205" y="318" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">%CV under 40%: "Excellent" uniformity</text>
  <text x="205" y="334" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Even vaccine uptake across the flock</text>

  <!-- Right: Need to Improve -->
  <rect x="420" y="65" width="350" height="280" rx="6" fill="${C.lightGray}" stroke="#ccc"/>
  <text x="595" y="90" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Wide or Two-Humped Spread</text>
  <text x="595" y="108" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Some birds high, some low or negative</text>
  ${histNi}
  <line x1="440" y1="270" x2="670" y2="270" stroke="${C.gray}" stroke-width="1.5"/>
  <text x="555" y="290" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Titer groups, low to high</text>
  <rect x="440" y="300" width="310" height="40" rx="4" fill="${C.lightRed}" stroke="${C.red}"/>
  <text x="595" y="318" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">%CV over 60%: "Need to Improve"</text>
  <text x="595" y="334" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Missed birds, uneven water uptake, or field challenge</text>

  <!-- Standards bar -->
  <rect x="30" y="360" width="740" height="60" rx="6" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="400" y="382" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Current ELISA uniformity guide: under 40% CV is Excellent, 40-60% is Good, over 60% is Need to Improve</text>
  <text x="400" y="400" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Target under 40% CV after a killed (inactivated) vaccine; under 60% CV after a live vaccine, with all birds testing positive [9]</text>

  ${caption(W, H, 'Figure 6.2  |  A low %CV means the whole flock responded about the same way')}
</svg>`;
}

// ============================================================
// FIGURE 15.6 — Locating the Brachial (Wing) Vein for Blood Collection
// ============================================================
function fig15_6() {
  const W = 800, H = 490;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Locating the Brachial (Wing) Vein')}
  ${DEFS(C.gray, 'wingArr')}
  ${DEFS(C.red, 'veinArr')}

  <text x="40" y="95" text-anchor="start" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">Underside of an extended wing, feathers parted at the elbow.</text>

  <!-- Wing outline (extended wing, underside view) -->
  <path d="M 110 180 L 690 230 L 660 290 L 620 320 L 540 340 L 420 350 L 300 345 L 190 320 L 120 270 Z"
        fill="${C.lightAmber}" stroke="${C.gray}" stroke-width="2"/>

  <!-- Shoulder marker -->
  <circle cx="140" cy="225" r="8" fill="${C.medBlue}"/>
  <text x="140" y="200" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Shoulder</text>

  <!-- Elbow marker -->
  <circle cx="430" cy="290" r="8" fill="${C.medBlue}"/>
  <text x="430" y="380" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Elbow joint</text>
  ${dArrow(430, 368, 430, 300, C.darkBlue, 'wingArr')}

  <!-- Wingtip label -->
  <text x="650" y="200" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Toward wingtip</text>
  ${dArrow(560, 215, 660, 220, C.darkBlue, 'wingArr')}

  <!-- Brachial vein line (between shoulder and elbow) -->
  <path d="M 145 222 Q 290 248 425 285" fill="none" stroke="${C.red}" stroke-width="3.5"/>
  <text x="330" y="275" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Brachial (wing) vein</text>

  <!-- Needle, inserted mid-way, shallow angle, bevel up, toward wingtip -->
  <g>
    <line x1="200" y1="170" x2="290" y2="240" stroke="${C.gray}" stroke-width="6" stroke-linecap="round"/>
    <line x1="200" y1="170" x2="160" y2="143" stroke="${C.gray}" stroke-width="10" stroke-linecap="round"/>
    <text x="160" y="125" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Syringe</text>
  </g>
  <circle cx="290" cy="240" r="5" fill="${C.darkBlue}"/>

  <!-- Callout box for needle insertion point -->
  <rect x="430" y="60" width="340" height="115" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}"/>
  <text x="600" y="82" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Insertion point</text>
  <text x="445" y="102" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">- Mid-way between the elbow and shoulder</text>
  <text x="445" y="120" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">- Bevel up, needle nearly parallel to the vein,</text>
  <text x="455" y="136" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">  tip pointed toward the wingtip</text>
  <text x="445" y="156" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">- 20-22 gauge needle, 0.5-1.0 inch, for birds</text>
  <text x="455" y="172" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">  4 weeks and older [8]</text>

  <!-- Bottom note -->
  <rect x="60" y="408" width="680" height="42" rx="6" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="400" y="428" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Go in under the skin first, then into the vein. Pull back gently. A hard pull collapses</text>
  <text x="400" y="444" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">the vein and stops the flow before you have enough blood [8]</text>

  ${caption(W, H, 'Figure 4.1  |  Brachial vein location and needle angle for a wing-vein blood draw')}
</svg>`;
}

// ============================================================
// MAIN
// ============================================================
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

svgToPng(fig15_1(), 'fig15_1.png');
// fig15_2.png: replaced 2026-07-21 with a manually-supplied Figure 1.2 (primary vs.
// secondary antibody response, IgM/IgG, B-cell/plasma-cell detail). Do not regenerate
// from fig15_2() below, it would overwrite the manually-supplied file.
svgToPng(fig15_3(), 'fig15_3.png');
svgToPng(fig15_4(), 'fig15_4.png');
svgToPng(fig15_5(), 'fig15_5.png');
svgToPng(fig15_6(), 'fig15_6.png');

console.log('All Course 15 figures generated.');
