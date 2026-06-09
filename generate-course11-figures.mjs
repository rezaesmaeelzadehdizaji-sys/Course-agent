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

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

fig2_1();
console.log('\nAll Course 11 figures generated.');
