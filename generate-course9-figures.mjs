// ============================================================
// generate-course9-figures.mjs
// Generates 5 PNG diagram figures for Course 9: Poultry Diagnostics
// Uses @resvg/resvg-js (WASM, no native build tools needed)
// Run: node generate-course9-figures.mjs
// ============================================================

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 9');

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
// FIGURE 9.1 — The Role of Diagnostics in Flock Health
// ============================================================
function fig9_1() {
  const W = 800, H = 450;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'How Diagnostics Drive On-Farm Health &amp; Profitability')}
  ${DEFS(C.medBlue, 'db')}
  ${DEFS(C.green, 'dg')}
  ${DEFS(C.orange, 'do')}

  <!-- Central farm state -->
  <rect x="270" y="160" width="260" height="130" rx="10" fill="${C.darkBlue}" stroke="${C.gold}" stroke-width="2.5"/>
  <text x="400" y="210" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">The Farm Ecosystem</text>
  <text x="400" y="235" text-anchor="middle" fill="${C.lightBlue}" font-family="Arial, sans-serif" font-size="12">Daily observations, water &amp; feed intake</text>
  <text x="400" y="255" text-anchor="middle" fill="${C.lightBlue}" font-family="Arial, sans-serif" font-size="12">Normal vs. Abnormal baseline</text>

  <!-- Left: Inputs & Monitoring -->
  ${box(20,  188, 190, 74, C.lightBlue, C.medBlue, 'Daily Surveillance', 'Water meters, behaviors, droppings')}

  <!-- Right: Lab & Veterinary Analysis -->
  ${box(590, 188, 190, 74, C.lightGreen, C.green, 'Diagnostic Testing', 'Serology, PCR, Necropsy')}

  <!-- Bottom: Actions & Corrective Plans -->
  ${box(270, 345, 260, 60, C.lightOrange, C.orange, 'Actionable Corrective Plans', 'Vaccination adjust, biosecurity, therapy')}

  <!-- Connecting arrows -->
  <!-- Left to Center -->
  ${hArrow(210, 225, 270, C.medBlue, 'db')}
  <!-- Center to Right (When abnormal signs are spotted) -->
  ${hArrow(530, 225, 590, C.green, 'dg')}
  <!-- Right to Bottom (Lab feedback leads to veterinary action plan) -->
  ${dArrow(685, 262, 530, 360, C.green, 'dg')}
  <!-- Bottom to Left (Closing the loop: actions change management) -->
  ${dArrow(270, 375, 115, 262, C.orange, 'do')}

  <!-- Supporting notes -->
  <text x="400" y="105" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12" font-style="italic">Early detection and veterinary verification prevent minor challenges from becoming herd-wide mortalities.</text>
  <text x="400" y="125" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Diagnostics is a loop of continuous observation, testing, and adjustment.</text>

  ${caption(W, H, 'Figure 1.1  |  The Role of Diagnostics in Flock Health Loop')}
</svg>`;
}

// ============================================================
// FIGURE 9.2 — Types of Diagnostic Tests Matrix
// ============================================================
function fig9_2() {
  const W = 800, H = 500;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Diagnostic Methods: What They Detect and When to Use Them')}

  <!-- Headers -->
  <rect x="20" y="60" width="160" height="35" fill="${C.darkBlue}"/>
  <text x="100" y="82" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">METHOD</text>

  <rect x="188" y="60" width="280" height="35" fill="${C.medBlue}"/>
  <text x="328" y="82" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">WHAT IT DETECTS / HOW IT WORKS</text>

  <rect x="476" y="60" width="304" height="35" fill="${C.gold}"/>
  <text x="628" y="82" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">PRIMARY APPLICATIONS &amp; VALUE</text>

  <!-- Row 1: Serology -->
  <rect x="20" y="105" width="160" height="74" rx="4" fill="${C.lightBlue}" stroke="${C.medBlue}"/>
  <text x="100" y="140" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Serology</text>
  <text x="100" y="156" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">(ELISA, HI, Plate)</text>

  <rect x="188" y="105" width="280" height="74" rx="4" fill="${C.lightGray}" stroke="#ccc"/>
  <text x="200" y="125" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Circulating antibodies in blood serum</text>
  <text x="200" y="143" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Differentiates protective titers, maternal</text>
  <text x="200" y="161" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">antibodies, and field challenges</text>

  <rect x="476" y="105" width="304" height="74" rx="4" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="488" y="125" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Evaluating vaccination response (titers)</text>
  <text x="488" y="143" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Paired samples check for active challenge</text>
  <text x="488" y="161" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Flock uniformity profiling (%CV)</text>

  <!-- Row 2: Necropsy -->
  <rect x="20" y="187" width="160" height="74" rx="4" fill="${C.lightAmber}" stroke="${C.amber}"/>
  <text x="100" y="222" text-anchor="middle" fill="${C.orange}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Necropsy</text>
  <text x="100" y="238" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">(Post-mortem)</text>

  <rect x="188" y="187" width="280" height="74" rx="4" fill="${C.lightGray}" stroke="#ccc"/>
  <text x="200" y="207" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Gross internal tissue and organ abnormalities</text>
  <text x="200" y="225" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Visualizes inflammation, hemorrhages,</text>
  <text x="200" y="243" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">lesions, parasite damage, and airsacculitis</text>

  <rect x="476" y="187" width="304" height="74" rx="4" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="488" y="207" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Direct confirmation of death causes</text>
  <text x="488" y="225" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Rapid diagnostic indicator in mortality spikes</text>
  <text x="488" y="243" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Identifies lesion distribution in the flock</text>

  <!-- Row 3: PCR & Virology -->
  <rect x="20" y="269" width="160" height="74" rx="4" fill="#E8F5E9" stroke="${C.green}"/>
  <text x="100" y="304" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">PCR &amp; Virology</text>
  <text x="100" y="320" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">(DNA/RNA Detection)</text>

  <rect x="188" y="269" width="280" height="74" rx="4" fill="${C.lightGray}" stroke="#ccc"/>
  <text x="200" y="289" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Genetic material (viral/bacterial DNA/RNA)</text>
  <text x="200" y="307" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Amplifies tiny pathogen traces; highly</text>
  <text x="200" y="325" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">specific (differentiates variants/strains)</text>

  <rect x="476" y="269" width="304" height="74" rx="4" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="488" y="289" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Confirms viral presence (IBV, NDV, IBHV)</text>
  <text x="488" y="307" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Identifies strain variants (e.g. DMG strain)</text>
  <text x="488" y="325" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Extremely fast turnaround (24–48 hours)</text>

  <!-- Row 4: Bacteriology -->
  <rect x="20" y="351" width="160" height="74" rx="4" fill="#FFEBEE" stroke="${C.red}"/>
  <text x="100" y="386" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Bacteriology</text>
  <text x="100" y="402" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">(Culture &amp; Sensitivity)</text>

  <rect x="188" y="351" width="280" height="74" rx="4" fill="${C.lightGray}" stroke="#ccc"/>
  <text x="200" y="371" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Bacterial growth on agar plates</text>
  <text x="200" y="389" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Isolates specific bacteria and tests which</text>
  <text x="200" y="407" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">antibiotics will actually kill them</text>

  <rect x="476" y="351" width="304" height="74" rx="4" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="488" y="371" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Identifies E. coli, Salmonella, Enterococcus</text>
  <text x="488" y="389" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Antibiotic Sensitivity prevents treatment failure</text>
  <text x="488" y="407" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Crucial for reducing antimicrobial resistance</text>

  ${caption(W, H, 'Figure 2.1  |  Matrix of Common Diagnostic Methods and Applications')}
</svg>`;
}

// ============================================================
// FIGURE 9.3 — Minimum Sample Submission Guidelines
// ============================================================
function fig9_3() {
  const W = 800, H = 530;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Sample Submission Guidelines: Getting Clean Data to the Lab')}

  <!-- 4 Sample Category Boxes — height expanded to 350 to fit blood tube content -->

  <!-- 1. Fecal/Litter -->
  <rect x="25" y="80" width="170" height="350" rx="8" fill="${C.lightGray}" stroke="#ccc" stroke-width="1.5"/>
  <rect x="25" y="80" width="170" height="40" rx="8" fill="${C.amber}"/>
  <text x="110" y="105" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Fecal / Litter</text>
  <text x="35" y="145" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Submission Goal:</text>
  <text x="35" y="162" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Detect coccidia oocysts</text>
  <text x="35" y="179" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">or enteric bacteria</text>
  <text x="35" y="210" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Procedure:</text>
  <text x="35" y="227" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Collect fresh droppings</text>
  <text x="35" y="244" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Use clean plastic bags</text>
  <text x="35" y="261" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Pool 5–10 spots per pen</text>
  <text x="35" y="278" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Keep cool (do not freeze)</text>

  <!-- 2. Blood Samples (Serology) -->
  <rect x="215" y="80" width="170" height="350" rx="8" fill="${C.lightGray}" stroke="#ccc" stroke-width="1.5"/>
  <rect x="215" y="80" width="170" height="40" rx="8" fill="${C.medBlue}"/>
  <text x="300" y="105" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Blood Samples</text>
  <text x="225" y="145" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Submission Goal:</text>
  <text x="225" y="162" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Antibody titer checks</text>
  <text x="225" y="179" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">for vaccine/field response</text>
  <!-- Preferred: tubes — full sub-box enclosing header + bullets -->
  <rect x="219" y="189" width="162" height="82" rx="4" fill="${C.medBlue}" opacity="0.08" stroke="${C.medBlue}" stroke-width="1"/>
  <rect x="219" y="189" width="162" height="20" rx="4" fill="${C.medBlue}" opacity="0.3"/>
  <text x="300" y="203" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">★ PREFERRED: Blood in Tubes</text>
  <text x="225" y="222" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">• CPC team / vet collects</text>
  <text x="225" y="237" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">• Plain red-top serum tubes</text>
  <text x="225" y="252" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">• Prevents hemolysis</text>
  <!-- Farmer option: cards — full sub-box enclosing header + bullets -->
  <rect x="219" y="281" width="162" height="78" rx="4" fill="#888" opacity="0.07" stroke="#999" stroke-width="1"/>
  <rect x="219" y="281" width="162" height="20" rx="4" fill="#888" opacity="0.2"/>
  <text x="300" y="295" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">FARMER OPTION: Blood Cards</text>
  <text x="225" y="314" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">• 12–24 birds, wing vein</text>
  <text x="225" y="329" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">• Fill filter card circles</text>
  <text x="225" y="344" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">• Air dry fully before bag</text>

  <!-- 3. Water / Feed -->
  <rect x="405" y="80" width="170" height="350" rx="8" fill="${C.lightGray}" stroke="#ccc" stroke-width="1.5"/>
  <rect x="405" y="80" width="170" height="40" rx="8" fill="${C.green}"/>
  <text x="490" y="105" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Water / Feed</text>
  <text x="415" y="145" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Submission Goal:</text>
  <text x="415" y="162" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Verify sanitation or check</text>
  <text x="415" y="179" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">mycotoxin levels</text>
  <text x="415" y="210" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Procedure:</text>
  <text x="415" y="227" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Water: Sterile tube from</text>
  <text x="415" y="244" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">  end of drinker line</text>
  <text x="415" y="261" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Feed: 1 kg representative</text>
  <text x="415" y="278" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">  sample from bin center</text>

  <!-- 4. Dead Birds (Necropsy) -->
  <rect x="595" y="80" width="170" height="350" rx="8" fill="${C.lightGray}" stroke="#ccc" stroke-width="1.5"/>
  <rect x="595" y="80" width="170" height="40" rx="8" fill="${C.red}"/>
  <text x="680" y="105" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Dead Birds</text>
  <text x="605" y="145" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Submission Goal:</text>
  <text x="605" y="162" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Post-mortem review</text>
  <text x="605" y="179" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">gross lesion checks</text>
  <text x="605" y="210" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Procedure:</text>
  <text x="605" y="227" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Submit 10–12 birds</text>
  <text x="605" y="244" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Choose fresh dead birds</text>
  <text x="605" y="261" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Live birds with signs</text>
  <text x="605" y="278" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Transport immediately</text>

  <!-- Bottom alert -->
  <rect x="25" y="452" width="740" height="30" rx="4" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="395" y="471" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Crucial Rule: Do not freeze samples. Keep them chilled (4°C) to prevent tissue crystallization.</text>

  ${caption(W, H, 'Figure 2.2  |  Guidelines for Basic Diagnostic Sample Collection and Submission')}
</svg>`;
}

// ============================================================
// FIGURE 9.4 — Deciphering Serology (Titer Distribution and Uniformity)
// ============================================================
function fig9_4() {
  const W = 800, H = 450;
  
  // Helper to draw a mock histogram
  // Excellent Uniformity: tight bell curve (CV < 30%)
  // Poor Uniformity: flat or bimodal (CV > 81%)
  
  let histExcellent = '';
  let histPoor = '';
  
  // Excellent bars (centered around group 4)
  // Heights: G0:0, G1:2, G2:5, G3:18, G4:52, G5:19, G6:4, G7:0
  const exHeights = [0, 2, 5, 18, 52, 19, 4, 0];
  exHeights.forEach((h, idx) => {
    const x = 50 + idx * 25;
    const y = 260 - h * 2.5;
    const height = h * 2.5;
    histExcellent += `<rect x="${x}" y="${y}" width="22" height="${height}" fill="${C.green}" stroke="${C.darkBlue}" stroke-width="0.5"/>`;
  });

  // Poor/Bimodal bars (peaks at G1 and G6)
  // Heights: G0:12, G1:28, G2:16, G3:8, G4:5, G5:14, G6:25, G7:10
  const prHeights = [12, 28, 16, 8, 5, 14, 25, 10];
  prHeights.forEach((h, idx) => {
    const x = 450 + idx * 25;
    const y = 260 - h * 2.5;
    const height = h * 2.5;
    histPoor += `<rect x="${x}" y="${y}" width="22" height="${height}" fill="${C.red}" stroke="${C.darkBlue}" stroke-width="0.5"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Understanding Serology: Excellent vs. Poor Uniformity (%CV)')}

  <!-- Left: Excellent Uniformity -->
  <rect x="30" y="65" width="340" height="280" rx="6" fill="${C.lightGray}" stroke="#ccc"/>
  <text x="200" y="88" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Excellent Uniformity (%CV &lt; 30%)</text>
  <text x="200" y="106" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Tight response to vaccination or single maternal cohort</text>
  
  <!-- Excellent Hist -->
  ${histExcellent}
  <!-- X-axis -->
  <line x1="45" y1="260" x2="255" y2="260" stroke="${C.gray}" stroke-width="1.5"/>
  <text x="150" y="278" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Titer Groups (0 to 7)</text>
  <!-- Summary Box -->
  <rect x="50" y="290" width="300" height="44" rx="4" fill="#E8F5E9" stroke="${C.green}"/>
  <text x="200" y="307" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">CV = 18.5% — High Uniformity</text>
  <text x="200" y="323" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">All birds protected equally; no gaps in immunity</text>

  <!-- Right: Poor / Bimodal Uniformity -->
  <rect x="430" y="65" width="340" height="280" rx="6" fill="${C.lightGray}" stroke="#ccc"/>
  <text x="600" y="88" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Poor / Bimodal Uniformity (%CV &gt; 81%)</text>
  <text x="600" y="106" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Suboptimal vaccination prime or active field challenge</text>
  
  <!-- Poor Hist -->
  ${histPoor}
  <!-- X-axis -->
  <line x1="445" y1="260" x2="655" y2="260" stroke="${C.gray}" stroke-width="1.5"/>
  <text x="550" y="278" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Titer Groups (0 to 7)</text>
  <!-- Summary Box -->
  <rect x="450" y="290" width="300" height="44" rx="4" fill="#FFEBEE" stroke="${C.red}"/>
  <text x="600" y="307" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">CV = 85.2% — Bimodal Split</text>
  <text x="600" y="323" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Half flock vulnerable (left peak); half challenged (right peak)</text>

  <!-- Standards Bar -->
  <rect x="30" y="360" width="740" height="44" rx="6" fill="${C.lightGold}" stroke="${C.gold}"/>
  <text x="400" y="378" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Uniformity Standards (%CV): &lt;30% Excellent | 30–50% Good | 51–80% Fair | &gt;81% Poor or Bimodal</text>
  <text x="400" y="394" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Evaluate breeder titers 4 weeks post-killed vaccine. Target: 8 out of 10 birds above protective thresholds [1].</text>

  ${caption(W, H, 'Figure 4.1  |  Titer Histograms and Coefficient of Variation (%CV) Profiles')}
</svg>`;
}

// ============================================================
// FIGURE 9.5 — Management Errors vs. Infections Decision Tree
// ============================================================
function fig9_5() {
  const W = 800, H = 450;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'On-Farm Investigation: Management Errors vs. Infectious Disease')}
  ${DEFS(C.gray, 'gr')}
  ${DEFS(C.red, 'rd')}
  ${DEFS(C.green, 'grn')}

  <!-- Start: Abnormal Flock Sign Spotted -->
  <rect x="250" y="65" width="300" height="50" rx="8" fill="${C.darkBlue}" stroke="${C.gold}" stroke-width="2"/>
  <text x="400" y="88" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Abnormal Sign Spotted (e.g. Water Drop)</text>
  <text x="400" y="104" text-anchor="middle" fill="${C.lightBlue}" font-family="Arial, sans-serif" font-size="10">Alert raised 1–2 days before feed consumption drop</text>

  <!-- Step 1: Check Management Factors First -->
  <rect x="250" y="150" width="300" height="74" rx="6" fill="${C.lightAmber}" stroke="${C.amber}" stroke-width="1.5"/>
  <text x="400" y="172" text-anchor="middle" fill="${C.orange}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Step 1: Investigate Non-Infectious Causes</text>
  <text x="260" y="192" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Check water meters, line pressure, air temp, ventilation</text>
  <text x="260" y="209" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Look for beak trimming errors, crowding, feed line blocks</text>

  <!-- Down Arrows -->
  ${dArrow(400, 115, 400, 150, C.gray, 'gr')}
  ${dArrow(400, 224, 400, 260, C.gray, 'gr')}

  <!-- Decision Point -->
  <polygon points="400,260 520,290 400,320 280,290" fill="${C.lightGray}" stroke="${C.darkBlue}" stroke-width="1.5"/>
  <text x="400" y="294" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Are systems OK?</text>

  <!-- Branch left: Systems failed -->
  ${dArrow(280, 290, 180, 290, C.red, 'rd')}
  <text x="220" y="280" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">NO</text>
  ${box(20, 262, 150, 56, '#FFEBEE', C.red, 'Correct Management', 'Adjust settings, fix leaks')}

  <!-- Branch right: Systems OK, sign persists -->
  ${dArrow(520, 290, 620, 290, C.green, 'grn')}
  <text x="580" y="280" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">YES</text>
  ${box(630, 262, 150, 56, '#E8F5E9', C.green, 'Call Veterinarian', 'Prepare sample submission')}

  <!-- Bottom Tip -->
  <rect x="20" y="375" width="760" height="30" rx="4" fill="${C.lightGray}" stroke="${C.darkBlue}"/>
  <text x="400" y="394" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">CPC Learning Centre: A high percentage of lab submissions are non-infectious management errors. Check your barn first.</text>

  ${caption(W, H, 'Figure 4.1  |  Flock Troubleshooting Decision Tree')}
</svg>`;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  svgToPng(fig9_1(), 'fig9_1.png');
  svgToPng(fig9_2(), 'fig9_2.png');
  svgToPng(fig9_3(), 'fig9_3.png');
  svgToPng(fig9_4(), 'fig9_4.png');
  svgToPng(fig9_5(), 'fig9_5.png');

  console.log('All figures generated successfully!');
}

main().catch(console.error);
