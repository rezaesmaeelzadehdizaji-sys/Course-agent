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
  ${box(30, 138, 200, 44, C.lightBlue, C.medBlue, 'Water', '1.7–2.0x feed intake by weight')}
  ${box(30, 192, 200, 44, C.lightBlue, C.medBlue, 'Energy', 'Heating, ventilation, lighting')}
  ${box(30, 246, 200, 44, C.lightBlue, C.medBlue, 'Chicks &amp; Litter', 'Day-old placement inputs')}

  <!-- Central farm box -->
  <rect x="270" y="140" width="260" height="172" rx="10" fill="${C.darkBlue}" stroke="${C.gold}" stroke-width="2.5"/>
  <text x="400" y="202" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="17" font-weight="bold">Commercial</text>
  <text x="400" y="226" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="17" font-weight="bold">Broiler Farm</text>
  <text x="400" y="261" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="12">20,000+ birds per cycle</text>
  <text x="400" y="281" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="12">6–8 week grow-out</text>
  <text x="400" y="300" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="12">FCR target: ~1.8 kg feed/kg gain</text>

  <!-- OUTPUTS label -->
  <text x="672" y="76" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-decoration="underline">OUTPUTS</text>

  <!-- Output boxes -->
  ${box(572,  84, 200, 44, C.lightGreen, C.green,  'Meat (Protein)', 'Primary saleable product')}
  ${box(572, 138, 200, 44, C.lightAmber, C.amber,  'Manure / Litter', '50–80 t/cycle; fertilizer value')}
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
  <text x="130" y="153" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">FCR target ~1.8</text>

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
  <text x="130" y="231" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">1.7–2.0x feed intake</text>
  <text x="130" y="249" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Tens of 000s L/day</text>

  <rect x="260" y="186" width="260" height="82" rx="6" fill="#FFEBEE" stroke="${C.red}" stroke-width="1"/>
  <text x="390" y="208" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10006; Waste Points</text>
  <text x="270" y="226" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Drinker line leaks undetected</text>
  <text x="270" y="244" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Wrong nipple pressure</text>
  <text x="270" y="262" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Biofilm in lines (water quality)</text>

  <rect x="540" y="186" width="240" height="82" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1"/>
  <text x="660" y="208" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10004; Efficiency Actions</text>
  <text x="550" y="226" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Daily water meter readings</text>
  <text x="550" y="244" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Set pressure 15–25 psi</text>
  <text x="550" y="262" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Flush lines between flocks</text>

  <!-- ROW 3: ENERGY -->
  <rect x="20"  y="282" width="220" height="82" rx="6" fill="${C.lightBlue}" stroke="${C.medBlue}" stroke-width="1.5"/>
  <text x="130" y="308" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="15" font-weight="bold">ENERGY</text>
  <text x="130" y="327" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Heating + ventilation</text>
  <text x="130" y="345" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">= largest operating cost</text>

  <rect x="260" y="282" width="260" height="82" rx="6" fill="#FFEBEE" stroke="${C.red}" stroke-width="1"/>
  <text x="390" y="304" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="11" font-weight="bold">&#10006; Waste Points</text>
  <text x="270" y="322" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Insulation gaps in barn walls</text>
  <text x="270" y="340" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">• Incandescent/T8 lighting</text>
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

  ${caption(W, H, 'Figure 2.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 3.1 — Manure Management Cycle
// ============================================================
function fig3_1() {
  const W = 800, H = 480;
  const cx = 400, cy = 230, r = 150;
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
    { main: 'Land Application', sub: 'Matched to crop needs' },
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
  <rect x="20" y="400" width="760" height="44" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="418" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Key Rule: Always get a manure analysis before land application.</text>
  <text x="400" y="435" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Nutrient content varies widely by flock, feed, and moisture. Guessing application rates leads to over-application and regulatory risk.</text>

  ${caption(W, H, 'Figure 3.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
</svg>`;
}

// ============================================================
// FIGURE 4.1 — Litter Moisture and Bird Welfare
// ============================================================
function fig4_1() {
  const W = 800, H = 460;
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
  <rect x="190" y="178" width="420" height="60" rx="8" fill="#FFCDD2" stroke="${C.red}" stroke-width="2.5"/>
  <text x="400" y="203" text-anchor="middle" fill="${C.red}" font-family="Arial, sans-serif" font-size="16" font-weight="bold">WET LITTER (&gt;30% moisture)</text>
  <text x="400" y="224" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">The single most common and costly management failure in commercial broiler production</text>

  <!-- Arrows diverging to consequences -->
  ${dArrow(260, 238, 104, 275, C.red, 'oa')}
  ${dArrow(330, 238, 240, 275, C.red, 'oa')}
  ${dArrow(400, 238, 400, 275, C.red, 'oa')}
  ${dArrow(470, 238, 560, 275, C.red, 'oa')}
  ${dArrow(540, 238, 680, 275, C.red, 'oa')}

  <!-- Consequence boxes -->
  ${box(20,   275, 158, 64, '#FFEBEE', C.red, 'Footpad', 'Dermatitis')}
  ${box(188,  275, 158, 64, '#FFEBEE', C.red, 'Breast', 'Blisters')}
  ${box(356,  275, 158, 64, '#FFEBEE', C.red, 'High NH3', '&gt;25 ppm = resp. damage')}
  ${box(524,  275, 158, 64, '#FFEBEE', C.red, 'Disease', 'Pressure Rise')}
  ${box(610,  275, 170, 64, '#FFEBEE', C.red, 'Performance', 'Loss &amp; Mortality')}

  <!-- Consequences label -->
  <text x="400" y="270" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">CONSEQUENCES</text>

  <!-- Management solutions bar -->
  <rect x="20" y="360" width="760" height="54" rx="6" fill="${C.lightGreen}" stroke="${C.green}" stroke-width="1.5"/>
  <text x="400" y="379" text-anchor="middle" fill="${C.green}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Management Solutions — Target: Litter Moisture 20–25%</text>
  <text x="400" y="397" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Increase minimum ventilation  ·  Fix drinker leaks immediately  ·  Apply litter amendment (alum)  ·  Raise barn temperature</text>
  <text x="400" y="413" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Footpad dermatitis at plant = late detection. Wet litter starts impacting birds 2–3 weeks before slaughter.</text>

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
  <text x="283" y="208" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   access (e.g. CCC)</text>
  <text x="283" y="228" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Reduced regulatory risk</text>
  <text x="283" y="248" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">   as rules tighten</text>
  <text x="283" y="268" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; Solar / insulation ROI</text>
  <text x="283" y="288" fill="${C.gray}" font-family="Arial, sans-serif" font-size="12">&#9679; AMR compliance ready</text>
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
  const W = 800, H = 480;
  const cx = 400, cy = 240;
  const r  = 130;
  // 4 steps: top, right, bottom, left
  const steps = [
    { angle:  -90, color: C.medBlue,  light: C.lightBlue,  num: '1', main: 'MEASURE',   sub: 'Record baseline\nFCR, water, energy,\nlitter condition' },
    { angle:    0, color: C.orange,   light: C.lightOrange, num: '2', main: 'IDENTIFY',  sub: 'Find the gap\nCompare to targets\nRank by impact' },
    { angle:   90, color: C.green,    light: C.lightGreen,  num: '3', main: 'IMPLEMENT', sub: 'One change\nper cycle\nKeep it specific' },
    { angle:  180, color: C.amber,    light: C.lightAmber,  num: '4', main: 'TRACK',     sub: 'Compare result\nto baseline\nShare with vet' },
  ];

  let nodes = '', arrows = '';
  steps.forEach((s, i) => {
    const rad = s.angle * Math.PI / 180;
    const nx  = cx + r * Math.cos(rad);
    const ny  = cy + r * Math.sin(rad);
    // Box
    const bw = 140, bh = 88;
    const bx = nx - bw / 2, by = ny - bh / 2;
    nodes += `<rect x="${bx.toFixed(0)}" y="${by.toFixed(0)}" width="${bw}" height="${bh}" rx="8" fill="${s.light}" stroke="${s.color}" stroke-width="2.5"/>`;
    nodes += `<circle cx="${(bx + 16).toFixed(0)}" cy="${(by + 16).toFixed(0)}" r="12" fill="${s.color}"/>`;
    nodes += `<text x="${(bx + 16).toFixed(0)}" y="${(by + 21).toFixed(0)}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${s.num}</text>`;
    nodes += `<text x="${nx.toFixed(0)}" y="${(by + 24).toFixed(0)}" text-anchor="middle" fill="${s.color}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${s.main}</text>`;
    // Sub-text lines
    const subLines = s.sub.split('\n');
    subLines.forEach((ln, li) => {
      nodes += `<text x="${nx.toFixed(0)}" y="${(by + 44 + li * 15).toFixed(0)}" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">${ln}</text>`;
    });

    // Arc arrow to next step
    const next = steps[(i + 1) % 4];
    const nextRad = next.angle * Math.PI / 180;
    const midAngle = (s.angle + (next.angle - s.angle + 360) % 360 / 2) * Math.PI / 180;
    // Arrow on the circle between nodes, inset by 75px
    const ar = r - 2;
    const startAngle = (s.angle + 45) * Math.PI / 180;
    const endAngle   = (next.angle - 45) * Math.PI / 180;
    const ax1 = cx + ar * Math.cos(startAngle);
    const ay1 = cy + ar * Math.sin(startAngle);
    const ax2 = cx + ar * Math.cos(endAngle);
    const ay2 = cy + ar * Math.sin(endAngle);
    arrows += `<path d="M ${ax1.toFixed(0)} ${ay1.toFixed(0)} A ${ar} ${ar} 0 0 1 ${ax2.toFixed(0)} ${ay2.toFixed(0)}" stroke="${C.gold}" stroke-width="2.5" fill="none" marker-end="url(#cyc7)"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  ${titleBar(W, 'Farmer Self-Assessment Cycle — One Improvement per Grow-Out')}
  <defs>
    <marker id="cyc7" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 9 3.5, 0 7" fill="${C.gold}"/>
    </marker>
  </defs>

  <!-- Arcs first (behind nodes) -->
  ${arrows}

  <!-- Center -->
  <circle cx="${cx}" cy="${cy}" r="55" fill="${C.darkBlue}" stroke="${C.gold}" stroke-width="2"/>
  <text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Continuous</text>
  <text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Improvement</text>
  <text x="${cx}" y="${cy + 25}" text-anchor="middle" fill="${C.gold}" font-family="Arial, sans-serif" font-size="11">Per cycle</text>

  <!-- Step nodes -->
  ${nodes}

  <!-- Bottom note -->
  <rect x="20" y="400" width="760" height="42" rx="6" fill="${C.lightGold}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="400" y="418" text-anchor="middle" fill="${C.darkBlue}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Apply to: Feed efficiency  ·  Water management  ·  Litter quality  ·  Energy use  ·  Flock health</text>
  <text x="400" y="435" text-anchor="middle" fill="${C.gray}" font-family="Arial, sans-serif" font-size="11">Share results with your veterinarian and fieldperson — they can help interpret what you are seeing across other farms.</text>

  ${caption(W, H, 'Figure 7.1  |  CPC Short Courses — Course 5: Sustainability in Poultry Farming')}
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
    { fn: fig2_1, file: 'fig2_1.png' },
    { fn: fig3_1, file: 'fig3_1.png' },
    { fn: fig4_1, file: 'fig4_1.png' },
    { fn: fig5_1, file: 'fig5_1.png' },
    { fn: fig6_1, file: 'fig6_1.png' },
    { fn: fig7_1, file: 'fig7_1.png' },
  ];

  for (const { fn, file } of svgs) {
    svgToPng(fn(), file);
  }

  console.log('\nAll figures generated in', OUT_DIR);
}

main().catch(err => { console.error(err); process.exit(1); });
