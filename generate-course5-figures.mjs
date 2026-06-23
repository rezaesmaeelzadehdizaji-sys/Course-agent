// ============================================================
// generate-course5-figures.mjs
// Generates 8 PNG diagram figures for Course 5: Sustainability
// Uses @resvg/resvg-js (WASM, no native build tools needed)
// Run: node generate-course5-figures.mjs
// ============================================================

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 5');

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
  teal:      '#00695C',
  lightTeal: '#E0F2F1',
  red:       '#C62828',
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

// Reusable arrow marker definitions
const DEFS = (color = '#555555', id = 'arr') =>
  `<defs>
    <marker id="${id}" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 9 3.5, 0 7" fill="${color}"/>
    </marker>
  </defs>`;

// Simple horizontal line arrow
function hArrow(x1, y, x2, color = '#555555', id = 'arr') {
  return `<line x1="${x1}" y1="${y}" x2="${x2 - 2}" y2="${y}" stroke="${color}" stroke-width="2" marker-end="url(#${id})"/>`;
}

// Diagonal arrow
function dArrow(x1, y1, x2, y2, color = '#555555', id = 'arr') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" marker-end="url(#${id})"/>`;
}

// Box with text (single or two lines)
function box(x, y, w, h, fill, stroke, text1, text2 = '', rx = 6) {
  const mid = y + h / 2;
  const t1y = text2 ? mid - 7 : mid + 5;
  const t2y = mid + 12;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
<text x="${x + w / 2}" y="${t1y}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${text1}</text>
${text2 ? `<text x="${x + w / 2}" y="${t2y}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">${text2}</text>` : ''}`;
}

// Caption bar at the bottom
function caption(W, H, text) {
  return `<rect x="0" y="${H - 32}" width="${W}" height="32" fill="${C.lightGray}"/>
<line x1="0" y1="${H - 32}" x2="${W}" y2="${H - 32}" stroke="${C.gold}" stroke-width="2"/>
<text x="${W / 2}" y="${H - 12}" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11">${text}</text>`;
}

// Title bar at the top
function titleBar(W, text) {
  return `<rect x="0" y="0" width="${W}" height="48" fill="${C.darkBlue}"/>
<line x1="0" y1="48" x2="${W}" y2="48" stroke="${C.gold}" stroke-width="3"/>
<text x="${W / 2}" y="30" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="15" font-weight="bold">${text}</text>`;
}

// ============================================================
// FIGURE 1.1 — Environmental Footprint
// ============================================================
function fig1_1() {
  const W = 800, H = 500;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Environmental Footprint of a Commercial Broiler Farm')}
  ${DEFS(C.medBlue, 'ai')}
  ${DEFS(C.green, 'ao')}

  <!-- INPUTS label -->
  <text x="130" y="76" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-decoration="underline">INPUTS</text>

  <!-- Input boxes -->
  ${box(30,  84, 200, 44, C.lightBlue, C.medBlue, 'Feed', '60–70% of production cost')}
  ${box(30, 138, 200, 44, C.lightBlue, C.medBlue, 'Water', '1.6–1.8x feed intake by weight')}
  ${box(30, 192, 200, 44, C.lightBlue, C.medBlue, 'Energy', 'Heating, ventilation, lighting')}
  ${box(30, 246, 200, 44, C.lightBlue, C.medBlue, 'Chicks &amp; Litter', 'Day-old placement inputs')}

  <!-- Central farm box -->
  <rect x="270" y="140" width="260" height="172" rx="10" fill="${C.darkBlue}" stroke="${C.gold}" stroke-width="2.5"/>
  <text x="400" y="202" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="17" font-weight="bold">Commercial</text>
  <text x="400" y="226" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="17" font-weight="bold">Broiler Farm</text>
  <text x="400" y="261" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="12">20,000+ birds per cycle</text>
  <text x="400" y="281" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="12">6–8 week grow-out</text>
  <text x="400" y="300" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="12">FCR target: ~1.6 kg feed/kg gain</text>

  <!-- OUTPUTS label -->
  <text x="672" y="76" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-decoration="underline">OUTPUTS</text>

  <!-- Output boxes -->
  ${box(572,  84, 200, 44, C.lightGreen, C.green,  'Meat (Protein)', 'Primary saleable product')}
  ${box(572, 138, 200, 44, C.lightAmber, C.amber,  'Manure / Litter', '20–33 t/cycle; fertilizer value')}
  ${box(572, 192, 200, 44, C.lightOrange,C.orange, 'Ammonia &amp; GHG', '~8% of global livestock GHG')}
  ${box(572, 246, 200, 44, C.lightBlue,  C.medBlue,'Wastewater', 'Cleanout and runoff risk')}

  <!-- Input → Farm arrows -->
  ${dArrow(230, 106, 270, 210, C.medBlue, 'ai')}
  ${dArrow(230, 160, 270, 220, C.medBlue, 'ai')}
  ${dArrow(230, 214, 270, 230, C.medBlue, 'ai')}
  ${dArrow(230, 268, 270, 240, C.medBlue, 'ai')}

  <!-- Farm → Output arrows -->
  ${dArrow(530, 215, 572, 106, C.green,  'ao')}
  ${dArrow(530, 225, 572, 160, C.amber,  'ao')}
  ${dArrow(530, 235, 572, 214, C.orange, 'ao')}
  ${dArrow(530, 245, 572, 268, C.medBlue,'ao')}

  <!-- Note -->
  <text x="${W/2}" y="430" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="11" font-style="italic">Efficient resource use reduces inputs per kg of output. Proper manure management converts a waste stream into a crop nutrient asset.</text>

  ${caption(W, H, 'Figure 1.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 1.2 — Ammonia Sources and Impacts
// ============================================================
function fig1_2() {
  const W = 800, H = 440;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Ammonia in the Barn: Sources, Drivers, and Impacts')}
  ${DEFS('#888888', 'a1')}

  <!-- Step boxes across top -->
  ${box(30, 68, 175, 55, C.lightAmber, C.amber, 'Manure in Litter', 'Urea + bacteria')}
  ${box(240, 68, 175, 55, C.lightOrange, C.orange, 'Urease Enzyme', 'Converts urea to NH3')}
  ${box(450, 68, 175, 55, '#FFEBEE', C.red, 'NH3 in Barn Air', 'Volatile release')}
  ${box(660, 68, 110, 55, C.lightGray, '#888888', 'Outdoor Air', 'Ecosystem impact')}

  <!-- Arrows between steps -->
  ${hArrow(205, 95, 240, C.orange, 'a1')}
  ${hArrow(415, 95, 450, C.red, 'a1')}
  ${hArrow(625, 95, 660, '#888888', 'a1')}

  <!-- Factors accelerating production -->
  <rect x="30" y="168" width="395" height="160" rx="8" fill="#FFF8E1" stroke="${C.amber}" stroke-width="1.5"/>
  <text x="228" y="189" text-anchor="middle" fill="${C.orange}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Factors That Accelerate NH3 Production</text>
  <line x1="30" y1="196" x2="425" y2="196" stroke="${C.amber}" stroke-width="1"/>

  <text x="50" y="218" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  High litter moisture (&gt;30%) — wet manure releases NH3 faster</text>
  <text x="50" y="240" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Elevated temperature — microbial activity increases with heat</text>
  <text x="50" y="262" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  High pH — alkaline litter favors NH3 volatilization</text>
  <text x="50" y="284" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Poor ventilation — allows NH3 to accumulate rather than dilute</text>
  <text x="50" y="306" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  High stocking density — more manure per unit of air volume</text>

  <!-- Impacts panel -->
  <rect x="450" y="168" width="320" height="160" rx="8" fill="#FFEBEE" stroke="${C.red}" stroke-width="1.5"/>
  <text x="610" y="189" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Impacts of Elevated NH3</text>
  <line x1="450" y1="196" x2="770" y2="196" stroke="${C.red}" stroke-width="1"/>

  <text x="470" y="218" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  &gt;25 ppm: respiratory mucosa damage in birds</text>
  <text x="470" y="240" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  &gt;50 ppm: welfare concern; performance falls</text>
  <text x="470" y="262" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Chronic worker exposure: occupational health risk</text>
  <text x="470" y="284" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Off-farm: acid deposition, ecosystem N loading</text>
  <text x="470" y="306" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Community: odor complaints, regulatory scrutiny</text>

  <!-- Management solutions -->
  <rect x="30" y="345" width="740" height="42" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="400" y="361" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Management Solutions:</text>
  <text x="400" y="378" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Litter amendments (alum) · Proper minimum ventilation · Litter moisture control · Manure removal frequency</text>

  ${caption(W, H, 'Figure 1.2  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 2.1 — Resource Efficiency
// ============================================================
function fig2_1() {
  const W = 800, H = 480;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Resource Efficiency in a Broiler Barn: Where Losses Occur')}

  <!-- Column headers -->
  <text x="133" y="76" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">RESOURCE</text>
  <text x="400" y="76" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">COMMON WASTE POINTS</text>
  <text x="668" y="76" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">EFFICIENCY ACTIONS</text>
  <line x1="20" y1="82" x2="780" y2="82" stroke="${C.gold}" stroke-width="2"/>

  <!-- ROW 1: FEED -->
  <rect x="20"  y="90" width="220" height="82" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="130" y="116" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">FEED</text>
  <text x="130" y="135" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">60–70% of production cost</text>
  <text x="130" y="153" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">FCR target ~1.6</text>

  <rect x="260"  y="90" width="260" height="82" rx="6" fill="#FFEBEE" stroke="${C.red}" stroke-width="1"/>
  <text x="390" y="112" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10006; Waste Points</text>
  <text x="270" y="130" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Feeder height too low/high</text>
  <text x="270" y="148" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Wet feed under drinkers</text>
  <text x="270" y="166" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Rodent access to feed bins</text>

  <rect x="540" y="90" width="240" height="82" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1"/>
  <text x="660" y="112" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10004; Efficiency Actions</text>
  <text x="550" y="130" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Adjust feeder height weekly</text>
  <text x="550" y="148" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Phase feeding program</text>
  <text x="550" y="166" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Seal all storage bins</text>

  <!-- ROW 2: WATER -->
  <rect x="20"  y="186" width="220" height="82" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="130" y="212" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">WATER</text>
  <text x="130" y="231" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">1.6–1.8x feed intake</text>
  <text x="130" y="249" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">20,000+ litres/day</text>

  <rect x="260" y="186" width="260" height="82" rx="6" fill="#FFEBEE" stroke="${C.red}" stroke-width="1"/>
  <text x="390" y="208" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10006; Waste Points</text>
  <text x="270" y="226" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Drinker line leaks undetected</text>
  <text x="270" y="244" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Wrong nipple pressure</text>
  <text x="270" y="262" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Biofilm in lines (water quality)</text>

  <rect x="540" y="186" width="240" height="82" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1"/>
  <text x="660" y="208" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10004; Efficiency Actions</text>
  <text x="550" y="226" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Daily water meter readings</text>
  <text x="550" y="244" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Calibrate nipple pressure by age</text>
  <text x="550" y="262" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Flush lines between flocks</text>

  <!-- ROW 3: ENERGY -->
  <rect x="20"  y="282" width="220" height="82" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="130" y="308" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">ENERGY</text>
  <text x="130" y="327" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Heating + ventilation</text>
  <text x="130" y="345" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">= largest operating cost</text>

  <rect x="260" y="282" width="260" height="82" rx="6" fill="#FFEBEE" stroke="${C.red}" stroke-width="1"/>
  <text x="390" y="304" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10006; Waste Points</text>
  <text x="270" y="322" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Insulation gaps in barn walls</text>
  <text x="270" y="340" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Incandescent/CFL lighting</text>
  <text x="270" y="358" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Fixed-speed fans in mild weather</text>

  <rect x="540" y="282" width="240" height="82" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1"/>
  <text x="660" y="304" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10004; Efficiency Actions</text>
  <text x="550" y="322" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Seal insulation gaps</text>
  <text x="550" y="340" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• LED lighting conversion</text>
  <text x="550" y="358" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Variable-speed fan controllers</text>

  <!-- Key metric row -->
  <rect x="20" y="378" width="760" height="46" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="396" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Key Metric: A 0.1-point FCR improvement on 20,000 birds = meaningful cost reduction per kg gain.</text>
  <text x="400" y="413" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Every resource saved is a direct profit improvement — efficiency and sustainability are the same goal.</text>

  ${caption(W, H, 'Figure 2.2  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 3.1 — Manure Management Cycle
// ============================================================
function fig3_1() {
  const W = 800, H = 540;
  const cx = 400, cy = 265, r = 130;
  // 6 nodes around a circle, starting from top
  function node(angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  const nodes = [0, 60, 120, 180, 240, 300].map(a => ({ a, ...node(a) }));

  const labels = [
    { main: 'Litter Removal', sub: 'After each flock' },
    { main: 'Covered Storage', sub: 'Away from water' },
    { main: 'Manure Analysis', sub: 'N, P, K content' },
    { main: 'Land Application', sub: 'Match to crop rate' },
    { main: 'Crop Uptake', sub: 'Nutrient recovery' },
    { main: 'Composting', sub: 'Optional: pathogen kill' },
  ];

  const colors = [C.medBlue, C.amber, C.orange, C.green, C.teal, C.red];
  const lightColors = [C.lightBlue, C.lightAmber, C.lightOrange, C.lightGreen, C.lightTeal, '#FFEBEE'];

  let circles = '';
  let arcs = '';
  labels.forEach((lbl, i) => {
    const n = nodes[i];
    circles += `<circle cx="${n.x.toFixed(0)}" cy="${n.y.toFixed(0)}" r="48" fill="${lightColors[i]}" stroke="${colors[i]}" stroke-width="2"/>
<text x="${n.x.toFixed(0)}" y="${(n.y - 7).toFixed(0)}" text-anchor="middle" fill="${colors[i]}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">${lbl.main}</text>
<text x="${n.x.toFixed(0)}" y="${(n.y + 9).toFixed(0)}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">${lbl.sub}</text>`;

    // Connecting arc (dashed)
    const next = nodes[(i + 1) % 6];
    // Draw a straight dashed line between node edges
    const dx = next.x - n.x, dy = next.y - n.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len, uy = dy / len;
    const x1 = n.x + ux * 50, y1 = n.y + uy * 50;
    const x2 = next.x - ux * 52, y2 = next.y - uy * 52;
    arcs += `<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="${C.gold}" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#cyc)"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Poultry Manure Management Cycle')}
  <defs>
    <marker id="cyc" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 9 3.5, 0 7" fill="${C.gold}"/>
    </marker>
  </defs>

  <!-- Cycle arcs -->
  ${arcs}
  <!-- Cycle nodes -->
  ${circles}

  <!-- Center label -->
  <circle cx="${cx}" cy="${cy}" r="52" fill="${C.darkBlue}" stroke="${C.gold}" stroke-width="2"/>
  <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Closed-Loop</text>
  <text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Manure</text>
  <text x="${cx}" y="${cy + 24}" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="11">Management</text>

  <!-- Key note bottom -->
  <rect x="20" y="458" width="760" height="44" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="476" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Key Rule: Always get a manure analysis before land application.</text>
  <text x="400" y="493" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Nutrient content varies widely by flock, feed, and moisture. Guessing application rates leads to over-application and regulatory risk.</text>

  ${caption(W, H, 'Figure 3.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 4.1 — Litter Moisture and Bird Welfare
// ============================================================
function fig4_1() {
  const W = 800, H = 500;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Litter Moisture Management: Cause and Effect Chain')}
  ${DEFS(C.orange, 'oa')}

  <!-- Root causes row -->
  <text x="400" y="76" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">ROOT CAUSES</text>

  ${box(20,   86, 168, 52, '#FFF3E0', C.orange, 'Insufficient', 'Minimum Ventilation')}
  ${box(202,  86, 168, 52, '#FFF3E0', C.orange, 'Drinker Leaks', 'Nipples, regulators')}
  ${box(384,  86, 168, 52, '#FFF3E0', C.orange, 'Enteric Disease', 'Wet droppings')}
  ${box(566,  86, 168, 52, '#FFF3E0', C.orange, 'High Stocking', 'Density excess')}

  <!-- Arrows converging down -->
  ${dArrow(104, 138, 260, 178, C.orange, 'oa')}
  ${dArrow(286, 138, 300, 178, C.orange, 'oa')}
  ${dArrow(468, 138, 360, 178, C.orange, 'oa')}
  ${dArrow(650, 138, 420, 178, C.orange, 'oa')}

  <!-- Wet litter box -->
  <rect x="190" y="178" width="420" height="62" rx="8" fill="#FFCDD2" stroke="${C.red}" stroke-width="2.5"/>
  <text x="400" y="202" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">WET LITTER  (&gt;30% moisture)</text>
  <text x="400" y="220" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Most common and costly management failure</text>
  <text x="400" y="234" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">in commercial broiler production</text>

  <!-- Consequences label -->
  <text x="400" y="258" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">CONSEQUENCES</text>

  <!-- Arrows diverging to consequences (from wet litter bottom y=240 to boxes at y=265) -->
  ${dArrow(260, 240, 92,  265, C.red, 'oa')}
  ${dArrow(330, 240, 242, 265, C.red, 'oa')}
  ${dArrow(400, 240, 393, 265, C.red, 'oa')}
  ${dArrow(470, 240, 544, 265, C.red, 'oa')}
  ${dArrow(540, 240, 695, 265, C.red, 'oa')}

  <!-- Consequence boxes (5 boxes, width=143, gap=8, no overlap) -->
  ${box(20,  265, 143, 64, '#FFEBEE', C.red, 'Footpad', 'Dermatitis')}
  ${box(171, 265, 143, 64, '#FFEBEE', C.red, 'Breast', 'Blisters')}
  ${box(322, 265, 143, 64, '#FFEBEE', C.red, 'High NH3', '&gt;25 ppm')}
  ${box(473, 265, 143, 64, '#FFEBEE', C.red, 'Disease', 'Pressure Rise')}
  ${box(624, 265, 143, 64, '#FFEBEE', C.red, 'Performance', 'Loss &amp; Mortality')}

  <!-- Management solutions bar -->
  <rect x="20" y="352" width="760" height="54" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1.5"/>
  <text x="400" y="371" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Management Solutions — Target: Litter Moisture 20–25%</text>
  <text x="400" y="389" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Increase minimum ventilation  ·  Fix drinker leaks immediately  ·  Apply litter amendment (alum)  ·  Raise barn temperature</text>
  <text x="400" y="405" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Footpad dermatitis at plant = late detection. Wet litter starts impacting birds 2–3 weeks before slaughter.</text>

  ${caption(W, H, 'Figure 4.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 5.1 — Renewable Energy Options
// ============================================================
function fig5_1() {
  const W = 800, H = 480;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Renewable Energy Options for Commercial Poultry Farms')}
  ${DEFS(C.amber, 'ra')}
  ${DEFS(C.green, 'ga').replace('id="ga"', 'id="ga"')}

  <!-- Vertical divider -->
  <line x1="400" y1="55" x2="400" y2="415" stroke="${C.gold}" stroke-width="1.5" stroke-dasharray="6,4"/>

  <!-- SOLAR section -->
  <text x="200" y="75" text-anchor="middle" fill="${C.amber}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">&#9728;  Solar Photovoltaic (PV)</text>

  <!-- Barn roof with panels -->
  <polygon points="40,185 200,100 360,185" fill="#E0E0E0" stroke="#9E9E9E" stroke-width="1.5"/>
  <!-- Solar panels -->
  <rect x="90"  y="130" width="35" height="22" rx="2" fill="${C.medBlue}" stroke="#1976D2" stroke-width="1"/>
  <rect x="132" y="118" width="35" height="22" rx="2" fill="${C.medBlue}" stroke="#1976D2" stroke-width="1"/>
  <rect x="174" y="108" width="35" height="22" rx="2" fill="${C.medBlue}" stroke="#1976D2" stroke-width="1"/>
  <rect x="216" y="118" width="35" height="22" rx="2" fill="${C.medBlue}" stroke="#1976D2" stroke-width="1"/>
  <rect x="258" y="130" width="35" height="22" rx="2" fill="${C.medBlue}" stroke="#1976D2" stroke-width="1"/>
  <!-- Barn walls -->
  <rect x="40" y="185" width="320" height="70" fill="#ECEFF1" stroke="#9E9E9E" stroke-width="1.5"/>
  <text x="200" y="228" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">Broiler Barn</text>

  <!-- Sun -->
  <circle cx="340" cy="88" r="22" fill="${C.amber}" opacity="0.85"/>
  <text x="340" y="94" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">&#9728;</text>

  <!-- Solar flow lines -->
  <line x1="200" y1="185" x2="200" y2="260" stroke="${C.amber}" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="200" y="280" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Inverter</text>
  <line x1="200" y1="285" x2="130" y2="310" stroke="${C.amber}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ra)"/>
  <line x1="200" y1="285" x2="270" y2="310" stroke="${C.amber}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ra)"/>
  <text x="100" y="327" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Barn use</text>
  <text x="300" y="327" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Grid export</text>

  <!-- Solar key facts -->
  <rect x="30" y="342" width="350" height="64" rx="6" fill="${C.lightAmber}" stroke="${C.amber}" stroke-width="1.5"/>
  <text x="205" y="360" text-anchor="middle" fill="${C.orange}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Key Facts</text>
  <text x="45"  y="378" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Large south-facing barn roof = good solar resource</text>
  <text x="45"  y="394" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Net metering: sell surplus to grid (rules vary by province)</text>

  <!-- BIOGAS section -->
  <text x="600" y="75" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">&#9836;  Biogas (Anaerobic Digestion)</text>

  <!-- Biogas flow diagram -->
  ${box(420,  90, 130, 45, C.lightAmber, C.amber, 'Poultry Litter', '+ other organics')}
  <line x1="550" y1="112" x2="578" y2="112" stroke="${C.green}" stroke-width="2" marker-end="url(#ga)"/>
  ${box(580,  90, 130, 45, C.lightGreen, C.green, 'Digester', 'Anaerobic process')}
  <line x1="645" y1="135" x2="645" y2="160" stroke="${C.green}" stroke-width="2" marker-end="url(#ga)"/>
  ${box(580, 162, 130, 45, C.lightTeal, C.teal, 'Biogas', 'Mainly CH4 + CO2')}

  <!-- From biogas: two outputs -->
  <line x1="580" y1="184" x2="510" y2="220" stroke="${C.teal}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ga)"/>
  <line x1="710" y1="184" x2="720" y2="220" stroke="${C.teal}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ga)"/>
  ${box(435, 222, 115, 38, C.lightBlue, C.medBlue, 'Heat &amp; Power', 'Barn energy')}
  ${box(665, 222, 115, 38, C.lightGreen, C.green, 'Digestate', 'Crop fertilizer')}

  <!-- From digester: digestate arrow -->
  <line x1="645" y1="135" x2="772" y2="183" stroke="${C.green}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ga)"/>

  <!-- Biogas key facts -->
  <rect x="420" y="282" width="360" height="80" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1.5"/>
  <text x="600" y="300" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Key Facts</text>
  <text x="435" y="318" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Converts litter methane to usable energy (reduces GHG)</text>
  <text x="435" y="335" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Digestate replaces synthetic fertilizer on crop fields</text>
  <text x="435" y="352" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Higher capital cost; feasibility study essential first</text>

  <!-- Both: availability note -->
  <rect x="20" y="378" width="760" height="30" rx="4" fill="${C.lightGray}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="397" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11">Federal and provincial grant programs available for both technologies — check Agriculture and Agri-Food Canada and your provincial farm organization.</text>

  ${caption(W, H, 'Figure 5.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 6.1 — Economic Benefits by Time Horizon
// ============================================================
function fig6_1() {
  const W = 800, H = 460;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Economic Benefits of Sustainable Poultry Farm Management')}

  <!-- Column headers -->
  <rect x="20"  y="55" width="234" height="40" rx="6" fill="${C.green}" />
  <text x="137" y="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">IMMEDIATE SAVINGS</text>
  <rect x="268" y="55" width="264" height="40" rx="6" fill="${C.medBlue}"/>
  <text x="400" y="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">MEDIUM-TERM BENEFITS</text>
  <rect x="546" y="55" width="234" height="40" rx="6" fill="${C.darkBlue}"/>
  <text x="663" y="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">LONG-TERM RESILIENCE</text>

  <!-- IMMEDIATE column -->
  <rect x="20" y="100" width="234" height="230" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1.5"/>
  <text x="137" y="122" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Current cycle impact</text>
  <line x1="30" y1="128" x2="244" y2="128" stroke="${C.green}" stroke-width="1"/>
  <text x="35" y="148" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Feed FCR improvement</text>
  <text x="35" y="168" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Water leak detection</text>
  <text x="35" y="188" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; LED lighting savings</text>
  <text x="35" y="208" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Litter amendment cost</text>
  <text x="35" y="228" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   reduction</text>
  <text x="35" y="248" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Manure value captured</text>
  <text x="35" y="268" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Reduced medication</text>
  <text x="35" y="288" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   cost from better health</text>
  <text x="137" y="318" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-style="italic">Payback: This cycle</text>

  <!-- MEDIUM-TERM column -->
  <rect x="268" y="100" width="264" height="230" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="400" y="122" text-anchor="middle" fill="${C.medBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">1–5 year horizon</text>
  <line x1="278" y1="128" x2="522" y2="128" stroke="${C.medBlue}" stroke-width="1"/>
  <text x="283" y="148" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Better contract position</text>
  <text x="283" y="168" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   with integrator</text>
  <text x="283" y="188" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Third-party certification</text>
  <text x="283" y="208" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   access (e.g. CFC On-Farm)</text>
  <text x="283" y="228" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Reduced regulatory risk</text>
  <text x="283" y="248" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   as rules tighten</text>
  <text x="283" y="268" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Solar / insulation ROI</text>
  <text x="283" y="282" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Antimicrobial resistance</text>
  <text x="283" y="300" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   (AMR) compliance ready</text>
  <text x="400" y="318" text-anchor="middle" fill="${C.medBlue}" font-family="Arial, sans-serif" font-size="11" font-style="italic">Payback: 1–3 production years</text>

  <!-- LONG-TERM column -->
  <rect x="546" y="100" width="234" height="230" rx="6" fill="#E8EAF6" stroke="${C.darkBlue}" stroke-width="1.5"/>
  <text x="663" y="122" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">5+ year horizon</text>
  <line x1="556" y1="128" x2="770" y2="128" stroke="${C.darkBlue}" stroke-width="1"/>
  <text x="561" y="148" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Input volatility shield</text>
  <text x="561" y="168" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   (feed, energy, water)</text>
  <text x="561" y="188" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Higher farm value at</text>
  <text x="561" y="208" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   sale or succession</text>
  <text x="561" y="228" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Full renewable energy</text>
  <text x="561" y="248" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   offset potential</text>
  <text x="561" y="268" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Environmental legacy</text>
  <text x="561" y="288" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   and community trust</text>
  <text x="663" y="318" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11" font-style="italic">Payback: Compound over career</text>

  <!-- Bottom note -->
  <rect x="20" y="345" width="760" height="42" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="363" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Sustainability is not an extra cost. Every efficiency gain is a direct profit improvement.</text>
  <text x="400" y="380" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">The farms that manage resources tightly today are best positioned for the cost, regulatory, and market environment of tomorrow.</text>

  ${caption(W, H, 'Figure 6.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 7.1 — Self-Assessment Cycle
// ============================================================
function fig7_1() {
  const W = 800, H = 500;
  // Box dimensions and corner positions (top-left origin)
  const bw = 156, bh = 90;
  // Boxes at four corners; center circle at (400, 240)
  // Box 1 top-left, Box 2 top-right, Box 3 bottom-right, Box 4 bottom-left
  const s1 = { bx: 97,  by: 80,  num: '1', main: 'MEASURE',   sub: ['Record baseline FCR,', 'water, energy,', 'litter condition'], color: C.medBlue,  light: C.lightBlue };
  const s2 = { bx: 547, by: 80,  num: '2', main: 'IDENTIFY',  sub: ['Find the gap',          'Compare to targets', 'Rank by impact'],    color: C.orange,   light: C.lightOrange };
  const s3 = { bx: 547, by: 320, num: '3', main: 'IMPLEMENT', sub: ['One change per cycle',  'Keep it specific',  ''],                   color: C.green,    light: C.lightGreen };
  const s4 = { bx: 97,  by: 320, num: '4', main: 'TRACK',     sub: ['Compare result to',     'baseline',          'Share with veterinarian'],     color: C.amber,    light: C.lightAmber };

  function stepBox(s) {
    const mcx = s.bx + bw / 2;
    return `
    <rect x="${s.bx}" y="${s.by}" width="${bw}" height="${bh}" rx="8" fill="${s.light}" stroke="${s.color}" stroke-width="2.5"/>
    <circle cx="${s.bx + 16}" cy="${s.by + 16}" r="12" fill="${s.color}"/>
    <text x="${s.bx + 16}" y="${s.by + 21}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${s.num}</text>
    <text x="${mcx}" y="${s.by + 33}" text-anchor="middle" fill="${s.color}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${s.main}</text>
    ${s.sub[0] ? `<text x="${mcx}" y="${s.by + 51}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">${s.sub[0]}</text>` : ''}
    ${s.sub[1] ? `<text x="${mcx}" y="${s.by + 64}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">${s.sub[1]}</text>` : ''}
    ${s.sub[2] ? `<text x="${mcx}" y="${s.by + 77}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">${s.sub[2]}</text>` : ''}`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Farmer Self-Assessment Cycle — One Improvement per Grow-Out')}
  <defs>
    <marker id="cyc7" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 9 3.5, 0 7" fill="${C.gold}"/>
    </marker>
  </defs>

  <!-- Arrows drawn first so boxes sit on top -->
  <!-- 1 to 2: rightward across top (y=125 = vertical center of top boxes) -->
  <line x1="255" y1="125" x2="543" y2="125" stroke="${C.gold}" stroke-width="2.5" marker-end="url(#cyc7)"/>
  <!-- 2 to 3: downward on right side -->
  <line x1="625" y1="172" x2="625" y2="316" stroke="${C.gold}" stroke-width="2.5" marker-end="url(#cyc7)"/>
  <!-- 3 to 4: leftward across bottom (y=365 = vertical center of bottom boxes) -->
  <line x1="545" y1="365" x2="257" y2="365" stroke="${C.gold}" stroke-width="2.5" marker-end="url(#cyc7)"/>
  <!-- 4 to 1: upward on left side (completes the cycle) -->
  <line x1="175" y1="318" x2="175" y2="174" stroke="${C.gold}" stroke-width="2.5" marker-end="url(#cyc7)"/>

  <!-- Center -->
  <circle cx="400" cy="240" r="55" fill="${C.darkBlue}" stroke="${C.gold}" stroke-width="2"/>
  <text x="400" y="230" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Continuous</text>
  <text x="400" y="247" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Improvement</text>
  <text x="400" y="263" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="11">Per grow-out</text>

  <!-- Step boxes -->
  ${stepBox(s1)}
  ${stepBox(s2)}
  ${stepBox(s3)}
  ${stepBox(s4)}

  <!-- Bottom note -->
  <rect x="20" y="428" width="760" height="40" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="446" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Apply to: Feed efficiency  ·  Water management  ·  Litter quality  ·  Energy use  ·  Flock health</text>
  <text x="400" y="462" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Share results with your veterinarian and fieldperson. They can help interpret what you are seeing across other farms.</text>

  ${caption(W, H, 'Figure 7.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 1.3 — Nipple Drinker Leak
// ============================================================
function fig1_3() {
  const W = 800, H = 380;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Nipple Drinker Leak: Water Waste and Litter Damage')}

  <!-- LEFT PANEL: schematic (x 20-460) -->
  <!-- Drinker main line (pipe) -->
  <rect x="60" y="85" width="360" height="14" rx="4" fill="${C.medBlue}" stroke="${C.darkBlue}" stroke-width="1.5"/>
  <text x="240" y="79" text-anchor="middle" fill="${C.medBlue}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Nipple drinker main line (water supply)</text>

  <!-- Normal nipple (left) -->
  <rect x="100" y="99" width="10" height="28" rx="2" fill="${C.medBlue}" stroke="${C.darkBlue}" stroke-width="1"/>
  <ellipse cx="105" cy="129" rx="8" ry="5" fill="${C.medBlue}" stroke="${C.darkBlue}" stroke-width="1"/>
  <text x="105" y="153" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="10">OK</text>

  <!-- Leaking nipple (center) — highlighted -->
  <rect x="230" y="99" width="10" height="28" rx="2" fill="${C.red}" stroke="#8B0000" stroke-width="1.5"/>
  <ellipse cx="235" cy="129" rx="8" ry="5" fill="${C.red}" stroke="#8B0000" stroke-width="1.5"/>
  <!-- Drip chain -->
  <circle cx="235" cy="138" r="3" fill="${C.medBlue}" opacity="0.9"/>
  <circle cx="234" cy="148" r="4" fill="${C.medBlue}" opacity="0.8"/>
  <circle cx="236" cy="160" r="5" fill="${C.medBlue}" opacity="0.7"/>
  <text x="262" y="140" fill="${C.red}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Loose</text>
  <text x="262" y="153" fill="${C.red}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">connection</text>

  <!-- Normal nipple (right) -->
  <rect x="360" y="99" width="10" height="28" rx="2" fill="${C.medBlue}" stroke="${C.darkBlue}" stroke-width="1"/>
  <ellipse cx="365" cy="129" rx="8" ry="5" fill="${C.medBlue}" stroke="${C.darkBlue}" stroke-width="1"/>
  <text x="365" y="153" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="10">OK</text>

  <!-- Litter floor -->
  <rect x="60" y="175" width="360" height="38" rx="4" fill="#D7CCA8" stroke="#A09060" stroke-width="1.5"/>
  <!-- Wet patch under leaking nipple -->
  <ellipse cx="235" cy="181" rx="55" ry="16" fill="#8B6914" opacity="0.6"/>
  <text x="235" y="185" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="9" font-weight="bold">Wet litter patch</text>
  <text x="130" y="198" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Dry litter</text>
  <text x="355" y="198" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Dry litter</text>

  <!-- Floor label -->
  <text x="240" y="228" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10" font-style="italic">Barn floor / litter surface</text>

  <!-- RIGHT PANEL: impact facts (x 490-780) -->
  <rect x="490" y="68" width="290" height="220" rx="8" fill="#FFEBEE" stroke="${C.red}" stroke-width="1.5"/>
  <text x="635" y="90" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Impact of One Leaking Nipple</text>
  <line x1="500" y1="96" x2="770" y2="96" stroke="${C.red}" stroke-width="1"/>
  <text x="505" y="116" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  100s of liters wasted per day</text>
  <text x="505" y="138" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Wet litter patch grows daily</text>
  <text x="505" y="160" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Local ammonia spike &gt;25 ppm</text>
  <text x="505" y="182" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Footpad dermatitis risk rises</text>
  <text x="505" y="204" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  Often undetected for days</text>
  <text x="505" y="226" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679;  More amendment cost needed</text>
  <text x="505" y="250" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Fix: Daily water meter reading detects</text>
  <text x="505" y="264" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">a leak before litter is saturated.</text>

  <!-- Bottom note -->
  <rect x="20" y="310" width="760" height="32" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="400" y="330" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11">A barn with a water meter that is read daily finds drinker problems before they become litter problems.</text>

  ${caption(W, H, 'Figure 1.3  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 2.2 — Feeder Height Comparison
// ============================================================
function fig2_2() {
  const W = 800, H = 380;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Feeder Height: Correct vs. Incorrect Setting')}

  <!-- LEFT PANEL: INCORRECT -->
  <rect x="20" y="60" width="358" height="220" rx="8" fill="#FFEBEE" stroke="${C.red}" stroke-width="2"/>
  <text x="199" y="84" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">&#10006;  TOO LOW — Feed Spill</text>

  <!-- Feeder pan (too low) -->
  <rect x="120" y="118" width="160" height="22" rx="4" fill="${C.amber}" stroke="#8B6000" stroke-width="1.5"/>
  <text x="200" y="133" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Feed Pan</text>
  <!-- Spilled feed dots -->
  <circle cx="165" cy="148" r="4" fill="${C.amber}" opacity="0.8"/>
  <circle cx="180" cy="152" r="3" fill="${C.amber}" opacity="0.7"/>
  <circle cx="155" cy="154" r="3" fill="${C.amber}" opacity="0.6"/>
  <circle cx="230" cy="150" r="4" fill="${C.amber}" opacity="0.8"/>
  <circle cx="242" cy="155" r="3" fill="${C.amber}" opacity="0.7"/>
  <circle cx="170" cy="160" r="2" fill="${C.amber}" opacity="0.6"/>
  <!-- Litter floor -->
  <rect x="60" y="165" width="278" height="22" rx="3" fill="#D7CCA8" stroke="#A09060" stroke-width="1"/>
  <text x="199" y="178" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="9">Litter floor</text>
  <!-- Bird silhouette (crouching to reach low feeder) -->
  <ellipse cx="200" cy="148" rx="20" ry="12" fill="#E0D0C0" stroke="#A09060" stroke-width="1"/>
  <circle cx="185" cy="140" r="9" fill="#E0D0C0" stroke="#A09060" stroke-width="1"/>

  <text x="199" y="214" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">Birds scratch feed over the rim.</text>
  <text x="199" y="230" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">Spilled feed contaminates litter.</text>
  <text x="199" y="250" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Check and raise weekly!</text>

  <!-- RIGHT PANEL: CORRECT -->
  <rect x="422" y="60" width="358" height="220" rx="8" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="2"/>
  <text x="601" y="84" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">&#10004;  SHOULDER LEVEL — No Spill</text>

  <!-- Feeder pan at shoulder height -->
  <rect x="520" y="130" width="160" height="22" rx="4" fill="${C.amber}" stroke="#8B6000" stroke-width="1.5"/>
  <text x="600" y="145" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Feed Pan</text>
  <!-- No spilled feed -->
  <!-- Litter floor clean -->
  <rect x="460" y="165" width="278" height="22" rx="3" fill="#D7CCA8" stroke="#A09060" stroke-width="1"/>
  <text x="601" y="178" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="9">Litter floor — clean</text>
  <!-- Bird silhouette (upright, comfortable) -->
  <ellipse cx="600" cy="150" rx="20" ry="13" fill="#E0D0C0" stroke="#A09060" stroke-width="1"/>
  <circle cx="584" cy="138" r="9" fill="#E0D0C0" stroke="#A09060" stroke-width="1"/>

  <text x="601" y="214" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">Birds eat comfortably with no waste.</text>
  <text x="601" y="230" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">Litter stays dry under the feeder.</text>
  <text x="601" y="250" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Adjust height weekly as birds grow.</text>

  <!-- Bottom note -->
  <rect x="20" y="298" width="760" height="44" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="316" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Rule: Feeder rim at shoulder height of the birds at all times. Adjust at least weekly.</text>
  <text x="400" y="333" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Feed cost = 60–70% of production cost. Feeder height adjustment costs nothing and reduces waste immediately.</text>

  ${caption(W, H, 'Figure 2.2  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 2.3 — LED vs Incandescent Energy Savings
// ============================================================
function fig2_3() {
  const W = 800, H = 380;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'LED Lighting in the Broiler Barn: Energy Savings')}

  <!-- Y-axis label -->
  <text x="30" y="200" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" transform="rotate(-90,30,200)">Energy use (% of incandescent)</text>
  <line x1="70" y1="65" x2="70" y2="280" stroke="${C.gray}" stroke-width="1.5"/>
  <!-- Y grid lines + labels -->
  <line x1="68" y1="65"  x2="72" y2="65"  stroke="${C.gray}" stroke-width="1.5"/>
  <line x1="68" y1="111" x2="72" y2="111" stroke="${C.gray}" stroke-width="1.5"/>
  <line x1="68" y1="157" x2="72" y2="157" stroke="${C.gray}" stroke-width="1.5"/>
  <line x1="68" y1="203" x2="72" y2="203" stroke="${C.gray}" stroke-width="1.5"/>
  <line x1="68" y1="280" x2="72" y2="280" stroke="${C.gray}" stroke-width="1.5"/>
  <text x="62" y="69"  text-anchor="end" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">100%</text>
  <text x="62" y="115" text-anchor="end" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">75%</text>
  <text x="62" y="161" text-anchor="end" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">50%</text>
  <text x="62" y="207" text-anchor="end" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">25%</text>
  <text x="62" y="284" text-anchor="end" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">0%</text>
  <!-- X axis -->
  <line x1="70" y1="280" x2="500" y2="280" stroke="${C.gray}" stroke-width="1.5"/>

  <!-- Incandescent bar (100%) -->
  <rect x="110" y="65" width="120" height="215" rx="4" fill="#FF8F00" opacity="0.85"/>
  <text x="170" y="88" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">100%</text>
  <text x="170" y="300" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Incandescent</text>

  <!-- CFL bar (~30% of incandescent; saves ~70%) -->
  <rect x="270" y="215" width="120" height="65" rx="4" fill="${C.amber}" opacity="0.85"/>
  <text x="330" y="207" text-anchor="middle" fill="${C.amber}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">~30%</text>
  <text x="330" y="300" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">CFL</text>

  <!-- LED bar (~20% of incandescent = 80% savings) -->
  <rect x="430" y="237" width="120" height="43" rx="4" fill="${C.green}" opacity="0.9"/>
  <text x="490" y="229" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">15–25%</text>
  <text x="490" y="300" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">LED</text>

  <!-- Savings callout -->
  <rect x="560" y="65" width="220" height="230" rx="8" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1.5"/>
  <text x="670" y="86" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">LED Advantage</text>
  <line x1="570" y1="92" x2="770" y2="92" stroke="${C.green}" stroke-width="1"/>
  <text x="575" y="112" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">&#9679; 75–85% energy savings</text>
  <text x="575" y="132" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">   vs. incandescent</text>
  <text x="575" y="154" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">&#9679; Fully dimmable for light</text>
  <text x="575" y="172" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">   management programs</text>
  <text x="575" y="194" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">&#9679; 50,000+ hour bulb life</text>
  <text x="575" y="216" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">&#9679; Payback: in future</text>
  <text x="575" y="238" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#9679; No capital required for</text>
  <text x="575" y="258" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">   entry-level retrofits</text>

  <!-- Bottom note -->
  <rect x="20" y="312" width="760" height="30" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="331" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="11">LED savings per cycle compound across every flock run. Source: Tabler et al. 2019 (MSU Ext. P2894); Hein 2025 (Canadian Poultry Magazine).</text>

  ${caption(W, H, 'Figure 2.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 3.2 — Covered vs Uncovered Litter Storage
// ============================================================
function fig3_2() {
  const W = 800, H = 380;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Litter Storage: Covered vs. Uncovered Pile')}

  <!-- LEFT PANEL: UNCOVERED (bad) -->
  <rect x="20" y="60" width="358" height="220" rx="8" fill="#FFEBEE" stroke="${C.red}" stroke-width="2"/>
  <text x="199" y="82" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">&#10006;  UNCOVERED PILE</text>

  <!-- Pile shape -->
  <polygon points="80,210 199,110 318,210" fill="#C8B06A" stroke="#8B7030" stroke-width="2"/>
  <!-- NH3 wavy lines -->
  <path d="M 150,145 Q 145,130 155,115 Q 165,100 155,88" stroke="${C.orange}" stroke-width="2" fill="none" opacity="0.8"/>
  <path d="M 199,130 Q 194,115 204,100 Q 214,85 204,72" stroke="${C.orange}" stroke-width="2" fill="none" opacity="0.8"/>
  <path d="M 248,145 Q 243,130 253,115 Q 263,100 253,88" stroke="${C.orange}" stroke-width="2" fill="none" opacity="0.8"/>
  <text x="199" y="68" text-anchor="middle" fill="${C.orange}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">NH3 + Odor</text>
  <!-- Fly dots -->
  <text x="120" y="108" fill="${C.red}" font-family="Arial, sans-serif" font-size="14">&#x2022;</text>
  <text x="270" y="102" fill="${C.red}" font-family="Arial, sans-serif" font-size="14">&#x2022;</text>
  <text x="145" y="92" fill="${C.red}" font-family="Arial, sans-serif" font-size="14">&#x2022;</text>
  <text x="199" y="210" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="9">Uncovered litter pile</text>

  <text x="199" y="238" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">Continuous NH3 loss</text>
  <text x="199" y="255" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">Nitrogen value destroyed</text>
  <text x="199" y="272" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">Fly breeding habitat</text>

  <!-- RIGHT PANEL: COVERED (good) -->
  <rect x="422" y="60" width="358" height="220" rx="8" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="2"/>
  <text x="601" y="82" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="13" font-weight="bold">&#10004;  COVERED / TARPED PILE</text>

  <!-- Pile shape -->
  <polygon points="482,210 601,120 720,210" fill="#C8B06A" stroke="#8B7030" stroke-width="2"/>
  <!-- Tarp over pile -->
  <polygon points="465,213 601,108 737,213" fill="none" stroke="${C.medBlue}" stroke-width="3" stroke-dasharray="8,4"/>
  <text x="601" y="105" text-anchor="middle" fill="${C.medBlue}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Tarp / Cover</text>
  <!-- Containment checkmark -->
  <text x="601" y="160" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="28" font-weight="bold">&#10004;</text>
  <text x="601" y="210" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="9">Covered litter pile</text>

  <text x="601" y="238" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">NH3 and odor contained</text>
  <text x="601" y="255" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">Nitrogen value retained</text>
  <text x="601" y="272" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">Fly habitat eliminated</text>

  <!-- Bottom note -->
  <rect x="20" y="298" width="760" height="44" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="316" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">A covered pile reduces odor complaints, retains fertilizer value, and is easier to defend in a regulatory inspection.</text>
  <text x="400" y="333" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Minimum setback: 15–30 m from any water body. Check provincial regulations for your region.</text>

  ${caption(W, H, 'Figure 3.2  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 4.2 — Litter Moisture: Dry vs. Wet Comparison
// ============================================================
function fig4_2() {
  const W = 800, H = 380;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Litter Condition: Target vs. Problem Moisture Level')}

  <!-- LEFT: Good litter -->
  <rect x="20" y="60" width="358" height="220" rx="8" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="2"/>
  <text x="199" y="82" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">TARGET  —  20–25% Moisture</text>

  <!-- Litter texture (light, fluffy dots) -->
  <rect x="60" y="100" width="278" height="90" rx="6" fill="#E8DCA0" stroke="#C0A840" stroke-width="1.5"/>
  <text x="199" y="138" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="22" font-weight="bold">&#x2605; &#x2605; &#x2605; &#x2605; &#x2605;</text>
  <text x="199" y="162" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11" font-style="italic">Dry · Friable · Fluffy · Light</text>
  <text x="199" y="178" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="10">Low ammonia  ·  Low caking risk</text>

  <text x="199" y="218" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">&#10004; Birds walk and rest comfortably</text>
  <text x="199" y="237" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">&#10004; Minimal footpad contact exposure</text>
  <text x="199" y="256" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">&#10004; NH3 stays below 20 ppm</text>

  <!-- RIGHT: Problem litter -->
  <rect x="422" y="60" width="358" height="220" rx="8" fill="#FFEBEE" stroke="${C.red}" stroke-width="2"/>
  <text x="601" y="82" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">PROBLEM  —  &gt;30% Moisture</text>

  <!-- Litter texture (dark, caked) -->
  <rect x="462" y="100" width="278" height="90" rx="6" fill="#6B5220" stroke="#3E3010" stroke-width="1.5"/>
  <text x="601" y="142" text-anchor="middle" fill="#E0C080" font-family="Arial, sans-serif" font-size="22" font-weight="bold">&#x2716; &#x2716; &#x2716; &#x2716; &#x2716;</text>
  <text x="601" y="163" text-anchor="middle" fill="#E0C080" font-family="Arial, sans-serif" font-size="11" font-style="italic">Wet · Compacted · Crusted</text>
  <text x="601" y="178" text-anchor="middle" fill="#E0C080" font-family="Arial, sans-serif" font-size="10">High ammonia  ·  Caked surface</text>

  <text x="601" y="218" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">&#10006; Footpad dermatitis developing</text>
  <text x="601" y="237" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">&#10006; Breast blisters &amp; lesions rising</text>
  <text x="601" y="256" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">&#10006; NH3 above 25 ppm possible</text>

  <!-- Bottom note -->
  <rect x="20" y="298" width="760" height="44" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="316" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Action: If litter feels wet underfoot at day 14, find the cause — ventilation, drinker leak, or enteric disease.</text>
  <text x="400" y="333" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Litter moisture above 30% starts damaging footpads within days. By the time you see it at the plant, it has been a problem for weeks.</text>

  ${caption(W, H, 'Figure 4.2  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 4.3 — Footpad Dermatitis Scoring Guide
// ============================================================
function fig4_3() {
  const W = 800, H = 380;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Footpad Dermatitis Scoring — Welfare Quality Protocol')}

  <!-- SCORE 0 -->
  <rect x="20" y="60" width="232" height="224" rx="8" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="2"/>
  <text x="136" y="82" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">SCORE 0</text>
  <text x="136" y="98" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11">Healthy — No Lesion</text>
  <!-- Footpad shape (oval, pink healthy) -->
  <ellipse cx="136" cy="158" rx="60" ry="48" fill="#FFCCBC" stroke="#E64A19" stroke-width="2"/>
  <!-- Toe outlines -->
  <ellipse cx="90"  cy="118" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <ellipse cx="136" cy="112" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <ellipse cx="182" cy="118" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <text x="136" y="162" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="28">&#10004;</text>
  <text x="136" y="230" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Intact, pink surface</text>
  <text x="136" y="248" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">No discoloration</text>
  <text x="136" y="268" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Target for all birds</text>

  <!-- SCORE 1 -->
  <rect x="284" y="60" width="232" height="224" rx="8" fill="${C.lightAmber}" stroke="${C.amber}" stroke-width="2"/>
  <text x="400" y="82" text-anchor="middle" fill="${C.orange}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">SCORE 1</text>
  <text x="400" y="98" text-anchor="middle" fill="${C.orange}" font-family="Arial, sans-serif" font-size="11">Mild — Small Lesion</text>
  <!-- Footpad shape (mild lesion, centre discoloration) -->
  <ellipse cx="400" cy="158" rx="60" ry="48" fill="#FFCCBC" stroke="#E64A19" stroke-width="2"/>
  <ellipse cx="354" cy="118" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <ellipse cx="400" cy="112" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <ellipse cx="446" cy="118" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <!-- Central mild lesion -->
  <ellipse cx="400" cy="158" rx="18" ry="14" fill="#8B4513" opacity="0.5"/>
  <text x="400" y="230" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Small central lesion</text>
  <text x="400" y="248" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Dark discoloration &lt;25% pad</text>
  <text x="400" y="268" text-anchor="middle" fill="${C.orange}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Early warning — check litter</text>

  <!-- SCORE 2 -->
  <rect x="548" y="60" width="232" height="224" rx="8" fill="#FFEBEE" stroke="${C.red}" stroke-width="2"/>
  <text x="664" y="82" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">SCORE 2</text>
  <text x="664" y="98" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11">Severe — Large Lesion</text>
  <!-- Footpad shape (severe, large dark crust) -->
  <ellipse cx="664" cy="158" rx="60" ry="48" fill="#FFCCBC" stroke="#E64A19" stroke-width="2"/>
  <ellipse cx="618" cy="118" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <ellipse cx="664" cy="112" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <ellipse cx="710" cy="118" rx="14" ry="10" fill="#FFCCBC" stroke="#E64A19" stroke-width="1.5"/>
  <!-- Severe lesion (large dark crust >33%) -->
  <ellipse cx="664" cy="155" rx="42" ry="35" fill="#3E1A00" opacity="0.75"/>
  <text x="664" y="230" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Necrotic crust &gt;33% of pad</text>
  <text x="664" y="248" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Dark, ulcerated surface</text>
  <text x="664" y="268" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Welfare violation — plant penalty</text>

  <!-- Bottom note -->
  <rect x="20" y="298" width="760" height="44" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="316" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Score 2 at the plant = litter was wet for 2–3 weeks during the grow-out. Early action prevents it.</text>
  <text x="400" y="333" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Scoring protocol: Welfare Quality Assessment Protocol for Poultry, Welfare Quality Consortium, 2009.</text>

  ${caption(W, H, 'Figure 4.3  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('Generating Course 5 figures...\n');

  const svgs = [
    { fn: fig1_1, file: 'fig1_1.png' },
    { fn: fig1_2, file: 'fig1_2.png' },
    { fn: fig1_3, file: 'fig1_3.png' },
    { fn: fig2_1, file: 'fig2_1.png' },
    { fn: fig2_2, file: 'fig2_2.png' },
    { fn: fig2_3, file: 'fig2_3.png' },
    { fn: fig3_1, file: 'fig3_1.png' },
    { fn: fig3_2, file: 'fig3_2.png' },
    { fn: fig4_1, file: 'fig4_1.png' },
    { fn: fig4_2, file: 'fig4_2.png' },
    { fn: fig4_3, file: 'fig4_3.png' },
    { fn: fig6_1, file: 'fig6_1.png' },
    { fn: fig7_1, file: 'fig7_1.png' },
  ];

  for (const { fn, file } of svgs) {
    svgToPng(fn(), file);
  }

  console.log('\nAll figures generated in', OUT_DIR);
}

main().catch(err => { console.error(err); process.exit(1); });
