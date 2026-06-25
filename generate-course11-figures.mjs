// ============================================================
// generate-course11-figures.mjs
// Generates PNG diagram figures for Course 11: Necropsy — Common Diseases
// Uses @resvg/resvg-js (WASM, no native build tools needed)
// Run: node generate-course11-figures.mjs
// ============================================================

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 11');

const C = {
  darkBlue:   '#1F3864',
  medBlue:    '#2E74B5',
  lightBlue:  '#D6E4F0',
  paleBlue:   '#EBF2FA',
  gold:       '#C9A84C',
  lightGold:  '#FDF6E3',
  gray:       '#3C3C3C',
  midGray:    '#666666',
  lightGray:  '#F5F5F5',
  green:      '#2E7D32',
  lightGreen: '#E8F5E9',
  red:        '#C62828',
  lightRed:   '#FFEBEE',
  orange:     '#E65100',
  amber:      '#F9A825',
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
}

// ── FIGURE 2.1  Laboratory Sample Submission Guide ───────────────────────────
function fig2_1() {
  const W = 1100;

  // Table layout
  const colX   = [20, 20, 20];     // padding-left per column
  const colW   = [280, 280, 480];  // column widths
  const colXL  = [20, 320, 620];   // column left edges (cumulative)
  const hdrH   = 46;
  const rowH   = 70;

  const headers = ['Sample Type', 'Diagnostic Test', 'Pathogen / Condition Identified'];

  // 5 data rows; column 3 is long — uses wrapping via SVG text trick (tspan lines)
  const rows = [
    [
      'Live, clinically affected\nbirds (minimum 6)',
      'Full necropsy +\ndiagnostic panel',
      'Comprehensive pathogen\nidentification across all body systems',
    ],
    [
      'Fresh tissue (bursa, liver,\nintestine, air sac)\n— refrigerated, not frozen',
      'Histopathology',
      'Confirms tissue damage and\nintranuclear inclusion bodies;\nprimary test for IBHV',
    ],
    [
      'Tracheal / cloacal swabs\nin viral transport media',
      'PCR / Virus isolation',
      'Confirms viral presence:\nIBV, NDV, AI, IBHV',
    ],
    [
      'Intestinal content, liver,\nor air sac swab',
      'Bacterial culture\n&amp; sensitivity',
      'Identifies E. coli, Salmonella,\nEnterococcus',
    ],
    [
      'Whole blood — red top\n(no anticoagulant)',
      'Serology (ELISA / HI)',
      'Antibody titres:\nIBV, NDV, IBD, MG, AI',
    ],
  ];

  const tableTop  = 70;   // y offset below title
  const tableH    = hdrH + rows.length * rowH;
  const H         = tableTop + tableH + 30;

  // Row background alternation
  const rowBg = (i) => i % 2 === 0 ? C.paleBlue : C.white;

  // Helper: multi-line text inside a cell
  function cellText(lines, x, cy, color = C.gray, bold = false, size = 13) {
    const dy = 16;
    const startY = cy - ((lines.length - 1) * dy) / 2;
    return lines.map((l, i) =>
      `<text x="${x}" y="${startY + i * dy}" font-family="Calibri,Arial,sans-serif" ` +
      `font-size="${size}" fill="${color}" ${bold ? 'font-weight="bold"' : ''} ` +
      `dominant-baseline="middle">${l}</text>`
    ).join('\n');
  }

  let svgParts = [];

  // Title
  svgParts.push(
    `<text x="${W / 2}" y="40" font-family="Calibri,Arial,sans-serif" font-size="16" ` +
    `font-weight="bold" fill="${C.darkBlue}" text-anchor="middle">` +
    `Figure 2.1: Laboratory Sample Submission Guide</text>`
  );

  // Header row
  svgParts.push(
    `<rect x="20" y="${tableTop}" width="${W - 40}" height="${hdrH}" fill="${C.medBlue}"/>`
  );
  headers.forEach((h, ci) => {
    const cx = colXL[ci] + colW[ci] / 2;
    const cy = tableTop + hdrH / 2;
    svgParts.push(
      `<text x="${cx}" y="${cy}" font-family="Calibri,Arial,sans-serif" font-size="14" ` +
      `font-weight="bold" fill="${C.white}" text-anchor="middle" dominant-baseline="middle">${h}</text>`
    );
  });

  // Data rows
  rows.forEach((row, ri) => {
    const rowY = tableTop + hdrH + ri * rowH;
    const cy   = rowY + rowH / 2;

    // Background
    svgParts.push(
      `<rect x="20" y="${rowY}" width="${W - 40}" height="${rowH}" fill="${rowBg(ri)}"/>`
    );

    // Column dividers
    svgParts.push(
      `<line x1="${colXL[1]}" y1="${rowY}" x2="${colXL[1]}" y2="${rowY + rowH}" ` +
      `stroke="#AAAAAA" stroke-width="1"/>`,
      `<line x1="${colXL[2]}" y1="${rowY}" x2="${colXL[2]}" y2="${rowY + rowH}" ` +
      `stroke="#AAAAAA" stroke-width="1"/>`
    );

    // Cell text
    row.forEach((cell, ci) => {
      const lines = cell.split('\n');
      const cx    = colXL[ci] + 10;  // left-aligned with small indent
      const isCol3 = ci === 2;
      svgParts.push(
        cellText(lines, cx, cy, isCol3 ? C.green : C.gray, false, 12.5)
      );
    });
  });

  // Table outer border
  svgParts.push(
    `<rect x="20" y="${tableTop}" width="${W - 40}" height="${tableH}" ` +
    `fill="none" stroke="${C.medBlue}" stroke-width="2"/>`
  );
  // Horizontal lines between rows
  rows.forEach((_, ri) => {
    const lineY = tableTop + hdrH + ri * rowH;
    svgParts.push(
      `<line x1="20" y1="${lineY}" x2="${W - 20}" y2="${lineY}" stroke="#CCCCCC" stroke-width="1"/>`
    );
  });

  // Gold accent bar at top
  svgParts.push(
    `<line x1="20" y1="14" x2="${W - 20}" y2="14" stroke="${C.gold}" stroke-width="3"/>`
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.white}"/>
  ${svgParts.join('\n  ')}
</svg>`;

  svgToPng(svg, 'fig11_2_1.png');
}

// ── FIGURE 3.1  Lesion Timeline: Acute to Chronic ────────────────────────────
function fig3_1() {
  const W = 1100, H = 360;
  const stages = [
    { t: 'Initial Infection', d: 'Day 0–1', lines: ['Little or no visible', 'change. Organs still', 'look normal.'], col: C.lightBlue, bar: C.medBlue },
    { t: 'Acute', d: 'Day 1–4', lines: ['Bright red hemorrhage.', 'Fresh yellow fibrin that', 'peels off cleanly.', 'Swollen organs, clear borders.'], col: C.lightRed, bar: C.red },
    { t: 'Subacute', d: 'Day 4–7', lines: ['Fibrin organizing and', 'becoming rubbery.', 'Exudate thickening,', 'secondary infection sets in.'], col: C.lightGold, bar: C.amber },
    { t: 'Chronic', d: 'Day 7+', lines: ['Gray-white adherent fibrin.', 'Cheesy (caseous) material.', 'Shrunken, fibrosed organs.', 'Harder to read.'], col: C.lightGray, bar: C.midGray },
  ];
  const margin = 30, gap = 24;
  const cardW = (W - margin * 2 - gap * (stages.length - 1)) / stages.length;
  const cardTop = 96, cardH = 180;
  let parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="${C.white}"/>`);
  parts.push(`<line x1="${margin}" y1="14" x2="${W - margin}" y2="14" stroke="${C.gold}" stroke-width="3"/>`);
  parts.push(`<text x="${W / 2}" y="42" font-family="Calibri,Arial,sans-serif" font-size="17" font-weight="bold" fill="${C.darkBlue}" text-anchor="middle">Figure 3.1: How Lesions Change from Acute to Chronic</text>`);
  parts.push(`<text x="${W / 2}" y="66" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${C.midGray}" text-anchor="middle">The earlier a bird dies in the disease process, the fresher and more diagnostic the lesion.</text>`);
  // timeline arrow under cards
  const arrowY = cardTop + cardH + 28;
  parts.push(`<line x1="${margin}" y1="${arrowY}" x2="${W - margin - 14}" y2="${arrowY}" stroke="${C.darkBlue}" stroke-width="2.5"/>`);
  parts.push(`<polygon points="${W - margin - 14},${arrowY - 7} ${W - margin},${arrowY} ${W - margin - 14},${arrowY + 7}" fill="${C.darkBlue}"/>`);
  parts.push(`<text x="${margin}" y="${arrowY + 24}" font-family="Calibri,Arial,sans-serif" font-size="12" fill="${C.midGray}">Time since infection</text>`);
  stages.forEach((s, i) => {
    const x = margin + i * (cardW + gap);
    parts.push(`<rect x="${x}" y="${cardTop}" width="${cardW}" height="${cardH}" rx="6" fill="${s.col}" stroke="${s.bar}" stroke-width="1.5"/>`);
    parts.push(`<rect x="${x}" y="${cardTop}" width="${cardW}" height="30" rx="6" fill="${s.bar}"/>`);
    parts.push(`<rect x="${x}" y="${cardTop + 16}" width="${cardW}" height="14" fill="${s.bar}"/>`);
    parts.push(`<text x="${x + cardW / 2}" y="${cardTop + 20}" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="bold" fill="${C.white}" text-anchor="middle">${s.t}</text>`);
    parts.push(`<text x="${x + cardW / 2}" y="${cardTop + 50}" font-family="Calibri,Arial,sans-serif" font-size="12.5" font-weight="bold" fill="${s.bar}" text-anchor="middle">${s.d}</text>`);
    s.lines.forEach((l, li) => {
      parts.push(`<text x="${x + 12}" y="${cardTop + 74 + li * 17}" font-family="Calibri,Arial,sans-serif" font-size="11.5" fill="${C.gray}">${l}</text>`);
    });
    // node on the timeline
    parts.push(`<circle cx="${x + cardW / 2}" cy="${arrowY}" r="5" fill="${s.bar}"/>`);
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('\n  ')}</svg>`;
  svgToPng(svg, 'fig11_1.png');
}

// ── FIGURE 8.1  Field Diagnostic Pathway ─────────────────────────────────────
function fig8_1() {
  const W = 1100;
  const rows = [
    { find: 'Airsacculitis with fibrin on heart and liver', act: 'Colibacillosis. Check ventilation, stocking density, and litter moisture. Look for the primary virus that opened the door.' },
    { find: 'Ballooned gut with loose yellow false membrane', act: 'Necrotic enteritis. Review the coccidiosis control program and diet now. Do not wait for the lab.' },
    { find: 'Both ceca filled with blood', act: 'Eimeria tenella coccidiosis. Check the anticoccidial program for resistance. Tighten litter management.' },
    { find: 'Enlarged bursa with breast-muscle hemorrhage', act: 'IBD. Notify your veterinarian. Review maternal antibody data and vaccination timing. Watch for immunosuppression.' },
    { find: 'Yellow yolk material loose in the abdomen', act: 'Egg peritonitis. Assess diet, body condition, and stressors driving follicle rupture or reverse peristalsis.' },
    { find: 'Pale, friable liver with a blood clot on top', act: 'FLHS. Review body weight targets, feed energy density, and whether hens are under-exercised.' },
  ];
  const margin = 30, titleH = 96, rowH = 64, gapY = 12;
  const findW = 360, arrowW = 60, actX = margin + findW + arrowW;
  const actW = W - margin - actX;
  const tableTop = titleH;
  const warnH = 70;
  const H = titleH + rows.length * (rowH + gapY) + 20 + warnH + 24;
  let parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="${C.white}"/>`);
  parts.push(`<line x1="${margin}" y1="14" x2="${W - margin}" y2="14" stroke="${C.gold}" stroke-width="3"/>`);
  parts.push(`<text x="${W / 2}" y="42" font-family="Calibri,Arial,sans-serif" font-size="17" font-weight="bold" fill="${C.darkBlue}" text-anchor="middle">Figure 8.1: From Necropsy Finding to Immediate Action</text>`);
  parts.push(`<text x="${W / 2}" y="66" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${C.midGray}" text-anchor="middle">Use this at the necropsy table to act now, while you wait for laboratory confirmation.</text>`);
  // column headers
  parts.push(`<text x="${margin + findW / 2}" y="${tableTop - 6}" font-family="Calibri,Arial,sans-serif" font-size="12.5" font-weight="bold" fill="${C.medBlue}" text-anchor="middle">WHAT YOU SEE</text>`);
  parts.push(`<text x="${actX + actW / 2}" y="${tableTop - 6}" font-family="Calibri,Arial,sans-serif" font-size="12.5" font-weight="bold" fill="${C.green}" text-anchor="middle">WHAT TO DO NOW</text>`);
  function wrap(text, max) {
    const words = text.split(' '); const out = []; let line = '';
    for (const w of words) { if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; } else line += ' ' + w; }
    if (line.trim()) out.push(line.trim());
    return out;
  }
  rows.forEach((r, i) => {
    const y = tableTop + 4 + i * (rowH + gapY);
    const cy = y + rowH / 2;
    // find box
    parts.push(`<rect x="${margin}" y="${y}" width="${findW}" height="${rowH}" rx="5" fill="${C.paleBlue}" stroke="${C.medBlue}" stroke-width="1.3"/>`);
    const fl = wrap(r.find, 42);
    fl.forEach((l, li) => parts.push(`<text x="${margin + 12}" y="${cy - (fl.length - 1) * 8 + li * 16}" font-family="Calibri,Arial,sans-serif" font-size="12.5" font-weight="bold" fill="${C.darkBlue}" dominant-baseline="middle">${l}</text>`));
    // arrow
    parts.push(`<line x1="${margin + findW + 8}" y1="${cy}" x2="${actX - 10}" y2="${cy}" stroke="${C.gold}" stroke-width="2.5"/>`);
    parts.push(`<polygon points="${actX - 10},${cy - 6} ${actX},${cy} ${actX - 10},${cy + 6}" fill="${C.gold}"/>`);
    // action box
    parts.push(`<rect x="${actX}" y="${y}" width="${actW}" height="${rowH}" rx="5" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1.3"/>`);
    const al = wrap(r.act, 64);
    const ital = s => s.replace(/(Eimeria tenella|Mycoplasma gallisepticum|Mycoplasma synoviae|Pasteurella multocida|Clostridium perfringens|E\. coli)/g, '<tspan font-style="italic">$1</tspan>');
    al.forEach((l, li) => parts.push(`<text x="${actX + 12}" y="${cy - (al.length - 1) * 8 + li * 16}" font-family="Calibri,Arial,sans-serif" font-size="11.8" fill="${C.gray}" dominant-baseline="middle">${ital(l)}</text>`));
  });
  // warning bar
  const wy = tableTop + 4 + rows.length * (rowH + gapY) + 10;
  parts.push(`<rect x="${margin}" y="${wy}" width="${W - margin * 2}" height="${warnH}" rx="6" fill="${C.lightRed}" stroke="${C.red}" stroke-width="2"/>`);
  parts.push(`<rect x="${margin}" y="${wy}" width="10" height="${warnH}" rx="3" fill="${C.red}"/>`);
  parts.push(`<text x="${margin + 24}" y="${wy + 26}" font-family="Calibri,Arial,sans-serif" font-size="13.5" font-weight="bold" fill="${C.red}">Finding unclear, or signs of a reportable disease (Avian Influenza, Newcastle)?</text>`);
  parts.push(`<text x="${margin + 24}" y="${wy + 48}" font-family="Calibri,Arial,sans-serif" font-size="12.5" fill="${C.gray}">Stop. Secure the barn, call your veterinarian first, then submit fresh samples to the provincial diagnostic laboratory.</text>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('\n  ')}</svg>`;
  svgToPng(svg, 'fig11_3.png');
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// fig2_1() removed June 2026 — Figure 2.1 is now a native Word table in the body, not an image.
fig3_1();
fig8_1();
console.log('\nAll Course 11 figures generated.');
