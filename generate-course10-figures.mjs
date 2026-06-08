// ============================================================
// generate-course10-figures.mjs
// Generates PNG diagram figures for Course 10: Necropsy — Normal Birds
// Uses @resvg/resvg-js (WASM, no native build tools needed)
// Run: node generate-course10-figures.mjs
// ============================================================

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 10');

// CPC color palette
const C = {
  darkBlue:  '#1F3864',
  medBlue:   '#2E74B5',
  lightBlue: '#D6E4F0',
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
  liver:     '#7B3F2E',
  flesh:     '#F2C9B8',
  yolk:      '#F4B400',
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

function hArrow(x1, y, x2, color = '#555555', id = 'arr') {
  return `<line x1="${x1}" y1="${y}" x2="${x2 - 2}" y2="${y}" stroke="${color}" stroke-width="2" marker-end="url(#${id})"/>`;
}
function dArrow(x1, y1, x2, y2, color = '#555555', id = 'arr') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" marker-end="url(#${id})"/>`;
}

function box(x, y, w, h, fill, stroke, text1, text2 = '', rx = 6) {
  const mid = y + h / 2;
  const t1y = text2 ? mid - 7 : mid + 5;
  const t2y = mid + 12;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
<text x="${x + w / 2}" y="${t1y}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${text1}</text>
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
// FIGURE 1.1 — Why learn normal first
// ============================================================
function fig1_1() {
  const W = 820, H = 380;
  const steps = [
    ['Know what NORMAL', 'looks like inside', C.lightBlue, C.medBlue],
    ['Spot a change', 'the moment it shows', C.lightGreen, C.green],
    ['Faster, surer', 'diagnosis', C.lightAmber, C.amber],
    ['Fewer dead birds,', 'lower losses', C.lightGold, C.gold],
  ];
  const bw = 170, bh = 80, gap = 30, y = 110;
  let x = 40;
  let boxes = '';
  steps.forEach((s, i) => {
    boxes += box(x, y, bw, bh, s[2], s[3], s[0], s[1], 8);
    if (i < steps.length - 1) boxes += hArrow(x + bw + 4, y + bh / 2, x + bw + gap - 2, C.gray);
    x += bw + gap;
  });
  const foot = `<rect x="40" y="240" width="740" height="86" rx="8" fill="${C.lightGray}" stroke="${C.gold}" stroke-width="1.5"/>
<text x="410" y="268" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">The whole point of this course</text>
<text x="410" y="292" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">You cannot recognize an abnormal organ until you have seen plenty of healthy ones.</text>
<text x="410" y="310" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">Open normal birds on purpose, so a real lesion jumps out at you later.</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${DEFS(C.gray)}
  ${titleBar(W, 'Why Open a Healthy Bird? Learn Normal First')}
  ${boxes}
  ${foot}
  ${caption(W, H, 'Knowing normal is the foundation of every necropsy. Source: CPC Short Courses.')}
</svg>`;
}

// ============================================================
// FIGURE 2.1 — Necropsy toolkit
// ============================================================
function fig2_1() {
  const W = 820, H = 420;
  const tools = [
    ['Sharp knife', '4 to 6 inch blade'],
    ['Poultry / bone shears', 'cut ribs and bone'],
    ['Tissue scissors', 'sharp / blunt tips'],
    ['Forceps with teeth', 'hold and lift tissue'],
    ['Disposable gloves', 'one pair per bird'],
    ['Cutting board / tray', 'cleanable surface'],
    ['Formalin jars + labels', '10% buffered formalin'],
    ['Disinfectant + bags', 'clean up and carcass disposal'],
  ];
  const cols = 4, bw = 175, bh = 90, gx = 16, gy = 24;
  const startX = 40, startY = 80;
  let cells = '';
  tools.forEach((t, i) => {
    const cx = startX + (i % cols) * (bw + gx);
    const cy = startY + Math.floor(i / cols) * (bh + gy);
    cells += box(cx, cy, bw, bh, i % 2 ? C.lightGold : C.lightBlue, i % 2 ? C.gold : C.medBlue, t[0], t[1], 8);
  });
  const note = `<rect x="40" y="320" width="740" height="56" rx="8" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1.5"/>
<text x="410" y="344" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Set out everything before you start.</text>
<text x="410" y="363" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Stopping mid-bird to find a tool is how you contaminate samples and lose your place.</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'The Necropsy Toolkit')}
  ${cells}
  ${note}
  ${caption(W, H, 'A simple kit covers most farm necropsies. Source: CPC Short Courses.')}
</svg>`;
}

// ============================================================
// FIGURE 2.2 — Systematic 5-stage necropsy sequence
// ============================================================
function fig2_2() {
  const W = 820, H = 470;
  const stages = [
    ['1. Before you cut', 'Review flock history. Note clinical signs. Euthanize humanely. Look the bird over outside: skin, feathers, joints, feet, vent.'],
    ['2. Start at the head', 'Wet the feathers. Open the mouth, throat, and windpipe. Check the sinuses. Follow the gullet down to the crop.'],
    ['3. Open the body', 'Pop both hip joints so the legs lie flat. Reflect the breast skin back to expose the breast muscle and belly.'],
    ['4. Expose the organs', 'Cut along the breastbone and through the ribs. Lift the breast plate off to open the chest and belly in one view.'],
    ['5. Examine in order', 'Work through every system the same way each time: liver, spleen, heart, lungs, air sacs, gut, kidneys, nerves, joints, brain.'],
  ];
  const x = 40, bw = 740, bh = 70, gy = 14;
  let y = 78;
  let rows = '';
  stages.forEach((s, i) => {
    rows += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="${i % 2 ? C.lightBlue : C.lightGold}" stroke="${i % 2 ? C.medBlue : C.gold}" stroke-width="1.5"/>
<text x="${x + 18}" y="${y + 28}" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${s[0]}</text>
<text x="${x + 18}" y="${y + 52}" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11.5">${s[1]}</text>`;
    if (i < stages.length - 1) rows += dArrow(x + bw / 2, y + bh, x + bw / 2, y + bh + gy - 2, C.gray);
    y += bh + gy;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${DEFS(C.gray)}
  ${titleBar(W, 'A Good Necropsy Is the Same Every Time')}
  ${rows}
  ${caption(W, H, 'The same five-stage routine, bird after bird, so nothing gets skipped. Source: CPC Short Courses.')}
</svg>`;
}

// ============================================================
// FIGURE 5.1 — Hen reproductive tract
// ============================================================
function fig5_1() {
  const W = 820, H = 470;
  // Ovary follicle hierarchy (cluster) on left
  const ovX = 130, ovY = 150;
  const foll = [
    [ovX, ovY, 34, 'F1'],
    [ovX + 60, ovY - 30, 26, 'F2'],
    [ovX + 50, ovY + 45, 20, 'F3'],
    [ovX - 38, ovY + 40, 15, 'F4'],
    [ovX - 30, ovY - 38, 11, ''],
    [ovX + 95, ovY + 10, 9, ''],
  ];
  let ovary = `<text x="${ovX + 20}" y="80" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Ovary: a graded cluster of yolks</text>`;
  foll.forEach(f => {
    ovary += `<circle cx="${f[0]}" cy="${f[1]}" r="${f[2]}" fill="${C.yolk}" stroke="#b8860b" stroke-width="1.5"/>`;
    if (f[3]) ovary += `<text x="${f[0]}" y="${f[1] + 4}" text-anchor="middle" fill="#5b3b00" font-family="Arial, sans-serif" font-size="11" font-weight="bold">${f[3]}</text>`;
  });
  ovary += `<text x="${ovX + 20}" y="250" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Biggest (F1) ovulates next. Tiny ones wait their turn.</text>`;

  // Oviduct sections as a flow on the right
  const sects = [
    ['Infundibulum', 'catches the yolk', '15-20 min'],
    ['Magnum', 'adds the egg white', 'about 3 h'],
    ['Isthmus', 'adds shell membranes', 'about 1.25 h'],
    ['Shell gland', 'lays down the shell', '18-21 h'],
    ['Vagina', 'egg is laid', 'minutes'],
  ];
  const sx = 420, sw = 360, sh = 46, sgy = 10;
  let sy = 95;
  let flow = `<text x="${sx + sw / 2}" y="80" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Oviduct: five sections, in order</text>`;
  sects.forEach((s, i) => {
    flow += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="6" fill="${i % 2 ? C.lightBlue : C.lightGold}" stroke="${i % 2 ? C.medBlue : C.gold}" stroke-width="1.3"/>
<text x="${sx + 14}" y="${sy + 20}" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12.5" font-weight="bold">${s[0]}</text>
<text x="${sx + 14}" y="${sy + 37}" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">${s[1]}</text>
<text x="${sx + sw - 12}" y="${sy + 29}" text-anchor="end" fill="${C.orange}" font-family="Arial, sans-serif" font-size="11.5" font-weight="bold">${s[2]}</text>`;
    if (i < sects.length - 1) flow += dArrow(sx + sw / 2, sy + sh, sx + sw / 2, sy + sh + sgy - 1, C.gray);
    sy += sh + sgy;
  });
  const total = `<rect x="${sx}" y="${sy + 4}" width="${sw}" height="34" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1.5"/>
<text x="${sx + sw / 2}" y="${sy + 26}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Yolk to laid egg: about 24 to 26 hours</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${DEFS(C.gray)}
  ${titleBar(W, 'The Normal Working Hen: Ovary and Oviduct')}
  ${ovary}
  ${flow}
  ${total}
  ${caption(W, H, 'Only the left ovary and oviduct develop in the hen. Source: CPC Short Courses.')}
</svg>`;
}

// ============================================================
// FIGURE 6.1 — Broiler vs Layer comparison
// ============================================================
function fig6_1() {
  const W = 820, H = 470;
  const rows = [
    ['What you are looking at', 'Meat bird (broiler)', 'Layer / breeder hen'],
    ['Breast muscle', 'Huge, deep, pale', 'Moderate, leaner'],
    ['Body fat', 'Fat pad in belly', 'Fat shifts with lay'],
    ['Ovary / oviduct', 'Tiny, thread-like', 'Active: yolks + wide oviduct'],
    ['Liver', 'Large, can be fatty', 'Enlarged, yolk-color in lay'],
    ['Keel / bones', 'Soft, fast-grown', 'Tested by egg calcium demand'],
    ['Typical age seen', 'Days to ~6 weeks', 'Months, in full production'],
  ];
  const x = 40, w = 740;
  const cw = [250, 245, 245];
  const rh = 52, startY = 72;
  let y = startY;
  let table = '';
  rows.forEach((r, ri) => {
    const isHead = ri === 0;
    let cx = x;
    r.forEach((cell, ci) => {
      const fill = isHead ? C.darkBlue : (ri % 2 ? C.lightGray : C.white);
      const tcol = isHead ? 'white' : C.gray;
      const fw = isHead || ci === 0 ? 'bold' : 'normal';
      table += `<rect x="${cx}" y="${y}" width="${cw[ci]}" height="${rh}" fill="${fill}" stroke="#cccccc" stroke-width="1"/>
<text x="${cx + 12}" y="${y + rh / 2 + 4}" fill="${tcol}" font-family="Arial, sans-serif" font-size="12" font-weight="${fw}">${cell}</text>`;
      cx += cw[ci];
    });
    y += rh;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Same Species, Two Different Normals')}
  ${table}
  ${caption(W, H, 'Broilers are built for growth; hens are built for eggs. Read the bird accordingly. Source: CPC Short Courses.')}
</svg>`;
}

// ============================================================
// FIGURE 7.1 — Common mistakes: normal vs "do not call it disease"
// ============================================================
function fig7_1() {
  const W = 820, H = 460;
  const items = [
    ['Normal variation', 'Meckel\'s diverticulum (a small bump midway down the gut), bile-stained gut wall, a firm dark spleen, and white urates in the kidneys are all normal.', 'Do not chase these as lesions.'],
    ['Poor sampling', 'Frozen, stale, or contaminated tissue. Touching the gut, then the lung. Submitting only one bird instead of a representative set.', 'Garbage in, garbage out at the lab.'],
    ['Age differences', 'A large bursa and thymus in a young bird are normal and shrink with age. Fat and muscle also shift as a hen comes into lay.', 'Judge each organ against the bird\'s age.'],
  ];
  const x = 40, w = 740, bh = 104, gy = 16;
  let y = 74;
  let blocks = '';
  items.forEach((it) => {
    const lines = wrap(it[1], 70);
    let ttext = '';
    lines.forEach((ln, li) => {
      ttext += `<text x="${x + 215}" y="${y + 32 + li * 18}" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11.5">${ln}</text>`;
    });
    ttext += `<text x="${x + 215}" y="${y + 32 + lines.length * 18 + 6}" fill="${C.red}" font-family="Arial, sans-serif" font-size="11.5" font-weight="bold">${it[2]}</text>`;
    blocks += `<rect x="${x}" y="${y}" width="${w}" height="${bh}" rx="8" fill="${C.lightRed}" stroke="${C.red}" stroke-width="1.4"/>
<rect x="${x}" y="${y}" width="195" height="${bh}" rx="8" fill="${C.red}"/>
<rect x="${x + 180}" y="${y}" width="15" height="${bh}" fill="${C.red}"/>
<text x="${x + 97}" y="${y + bh / 2 + 5}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${it[0]}</text>
${ttext}`;
    y += bh + gy;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Three Traps That Turn Normal Into a False Alarm')}
  ${blocks}
  ${caption(W, H, 'Most "lesions" called in by new staff are normal structures. Source: CPC Short Courses.')}
</svg>`;
}

function wrap(text, max) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  words.forEach(w => {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; }
    else cur += ' ' + w;
  });
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

// ============================================================
// BUILD ALL
// ============================================================
svgToPng(fig1_1(), 'fig10_1.png');
svgToPng(fig2_1(), 'fig10_2.png');
svgToPng(fig2_2(), 'fig10_3.png');
svgToPng(fig5_1(), 'fig10_5.png');
svgToPng(fig6_1(), 'fig10_6.png');
svgToPng(fig7_1(), 'fig10_7.png');
console.log('All Course 10 figures generated.');
