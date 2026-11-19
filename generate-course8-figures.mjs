// Generates the 3 diagram PNGs for Course 8 (Vaccination):
//   Course 8/fig1_2.png  Water volume and consumption timeline
//   Course 8/fig2_2.png  Wing web vaccination site anatomy
//   Course 8/fig3_1.png  Eye drop vaccination administration
//
// Run with: node generate-course8-figures.mjs

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const OUT_DIR    = path.join(__dirname, 'Course 8');

// CPC brand palette
const BLUE   = '#2E74B5';
const NAVY   = '#1F3864';
const GOLD   = '#C9A84C';
const INK    = '#3C3C3C';
const MUTED  = '#888888';
const BG     = '#FFFFFF';
const SOFT   = '#EBF2FA';
const ACCENT = '#A23B3B'; // for warning/restriction band
const FLESH  = '#F4CFA8';
const DERM   = '#D9A77E';
const SUBC   = '#FFE3D0';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Figure 1.2  Water volume and consumption timeline during vaccination
// ---------------------------------------------------------------------------
function fig1_2() {
  const W = 1400, H = 760;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Title -->
  <text x="${W/2}" y="48" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="30" font-weight="700" fill="${NAVY}">
    Water timeline for a successful water vaccination
  </text>
  <text x="${W/2}" y="80" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="18" fill="${MUTED}">
    Birds must be thirsty enough to drink the full dose within two hours
  </text>

  <!-- Axis -->
  <line x1="100" y1="500" x2="1300" y2="500" stroke="${INK}" stroke-width="2"/>
  <polygon points="1300,500 1288,494 1288,506" fill="${INK}"/>

  <!-- Time tick marks and labels -->
  ${[
    {x:140,   t:'-2 h',  l:'2 hours before'},
    {x:380,   t:'-30 min', l:'Milk stabilizer mixed in'},
    {x:540,   t:'0',      l:'Vaccine added'},
    {x:900,   t:'+2 h',   l:'Vaccine gone, water back on'},
  ].map(p => `
    <line x1="${p.x}" y1="495" x2="${p.x}" y2="510" stroke="${INK}" stroke-width="2"/>
    <text x="${p.x}" y="540" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
          font-size="18" font-weight="700" fill="${INK}">${p.t}</text>
    <text x="${p.x}" y="562" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
          font-size="14" fill="${MUTED}">${p.l}</text>
  `).join('')}

  <!-- Phase bands (colored bars above the timeline) -->
  <!-- 1. Water withdrawal -->
  <rect x="140" y="200" width="400" height="60" rx="8" fill="${SOFT}" stroke="${BLUE}" stroke-width="2"/>
  <text x="340" y="232" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="18" font-weight="700" fill="${NAVY}">Water withdrawal (30 min to 2 h)</text>
  <text x="340" y="255" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="14" fill="${INK}">Birds build mild thirst</text>

  <!-- 2. Two-hour vaccine window -->
  <rect x="540" y="160" width="360" height="100" rx="8" fill="${BLUE}" stroke="${NAVY}" stroke-width="2"/>
  <text x="720" y="195" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="20" font-weight="700" fill="white">Two-hour vaccine window</text>
  <text x="720" y="222" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="15" fill="white">All birds must drink in this time</text>
  <text x="720" y="245" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="14" fill="white" font-style="italic">Skim milk powder added to stabilize the vaccine</text>

  <!-- 3. Normal water back on as soon as the vaccine is consumed -->
  <rect x="900" y="200" width="380" height="60" rx="8" fill="${SOFT}" stroke="${BLUE}" stroke-width="2"/>
  <text x="1090" y="232" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="18" font-weight="700" fill="${NAVY}">Normal water back on</text>
  <text x="1090" y="255" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="14" fill="${INK}">As soon as the vaccine water is gone. Do not leave birds dry.</text>

  <!-- Consumption curve (illustrative) -->
  <path d="M 140 460 L 380 460 L 540 460 L 560 360 L 720 305 L 880 360 L 900 405 L 1100 430 L 1300 430"
        fill="none" stroke="${GOLD}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="720" cy="305" r="6" fill="${GOLD}"/>
  <text x="720" y="290" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="14" font-weight="700" fill="${GOLD}">Peak drinking</text>

  <!-- Curve legend -->
  <line x1="160" y1="660" x2="220" y2="660" stroke="${GOLD}" stroke-width="4"/>
  <text x="230" y="666" font-family="Calibri,Arial,sans-serif" font-size="16" fill="${INK}">Flock water consumption rate</text>

  <!-- Key rules box -->
  <rect x="650" y="630" width="640" height="100" rx="10" fill="${SOFT}" stroke="${BLUE}" stroke-width="1.5"/>
  <text x="670" y="658" font-family="Calibri,Arial,sans-serif" font-size="16" font-weight="700" fill="${NAVY}">Key rules</text>
  <text x="670" y="682" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- Chlorine and sanitizer off from 72 hours before to 24 hours after</text>
  <text x="670" y="702" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- Vaccine water = 40% of daily intake; confirm with a practice run</text>
  <text x="670" y="722" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- All birds must access drinkers; raise or lower lines as needed</text>
</svg>`;
  return { name: 'fig1_2.png', svg, w: W, h: H };
}

// ---------------------------------------------------------------------------
// Figure 2.2  Wing web vaccination site anatomy
// ---------------------------------------------------------------------------
function fig2_2() {
  const W = 1400, H = 900;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="${W/2}" y="48" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="30" font-weight="700" fill="${NAVY}">
    Wing web vaccination: the right site and the right depth
  </text>
  <text x="${W/2}" y="80" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="18" fill="${MUTED}">
    Two skin layers, no muscle, no bone, no large blood vessel
  </text>

  <!-- LEFT PANEL: simplified bird outline showing where the wing web is -->
  <g transform="translate(60,140)">
    <text x="280" y="0" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
          font-size="20" font-weight="700" fill="${NAVY}">Where the wing web is</text>

    <!-- bird body silhouette -->
    <ellipse cx="280" cy="320" rx="180" ry="140" fill="#F8E4C6" stroke="${INK}" stroke-width="2"/>
    <!-- head -->
    <circle cx="120" cy="220" r="55" fill="#F8E4C6" stroke="${INK}" stroke-width="2"/>
    <!-- beak -->
    <polygon points="68,215 30,225 68,235" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/>
    <!-- eye -->
    <circle cx="105" cy="210" r="5" fill="${INK}"/>
    <!-- comb -->
    <path d="M 100 175 Q 110 155 120 170 Q 130 150 140 170 Q 150 155 158 175" fill="#C73E3E" stroke="${INK}" stroke-width="1.5"/>
    <!-- leg -->
    <line x1="290" y1="450" x2="290" y2="540" stroke="${INK}" stroke-width="3"/>
    <polygon points="270,540 310,540 290,560" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/>
    <line x1="340" y1="450" x2="340" y2="540" stroke="${INK}" stroke-width="3"/>
    <polygon points="320,540 360,540 340,560" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/>
    <!-- tail -->
    <polygon points="450,290 510,260 510,330" fill="#F8E4C6" stroke="${INK}" stroke-width="2"/>

    <!-- wing extended out, showing wing web -->
    <path d="M 280 240 Q 360 130 480 100 Q 500 140 470 180 Q 380 200 320 270 Z"
          fill="#FBEFD4" stroke="${INK}" stroke-width="2"/>
    <!-- wing web area (highlight) -->
    <path d="M 285 245 Q 340 165 410 145 Q 425 175 405 200 Q 350 215 320 265 Z"
          fill="${SOFT}" stroke="${BLUE}" stroke-width="2.5" stroke-dasharray="6 4"/>
    <text x="365" y="195" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${NAVY}">Wing web</text>
    <text x="358" y="213" font-family="Calibri,Arial,sans-serif" font-size="12" fill="${INK}">(patagium)</text>

    <!-- callout arrow to cross-section -->
    <line x1="430" y1="170" x2="560" y2="170" stroke="${BLUE}" stroke-width="2" stroke-dasharray="4 4"/>
    <polygon points="560,170 548,164 548,176" fill="${BLUE}"/>

    <text x="280" y="610" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="14" font-style="italic" fill="${MUTED}">
      Hold the wing open. The thin fold of skin between the body and the
    </text>
    <text x="280" y="630" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="14" font-style="italic" fill="${MUTED}">
      humerus is the wing web. No feathers, no muscle.
    </text>
  </g>

  <!-- RIGHT PANEL: cross-section of the wing web with bifurcated needle -->
  <g transform="translate(700,140)">
    <text x="320" y="0" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
          font-size="20" font-weight="700" fill="${NAVY}">Cross-section: correct needle depth</text>

    <!-- two skin layers (dorsal and ventral) -->
    <!-- dorsal -->
    <path d="M 40 220 Q 320 180 600 220 L 600 270 Q 320 230 40 270 Z"
          fill="${DERM}" stroke="${INK}" stroke-width="2"/>
    <text x="40" y="200" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${INK}">Dorsal skin (top layer)</text>

    <!-- subcutaneous space between layers -->
    <path d="M 40 270 Q 320 230 600 270 L 600 350 Q 320 310 40 350 Z"
          fill="${SUBC}" stroke="${INK}" stroke-width="1.5"/>
    <text x="40" y="395" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}" font-style="italic">
      Loose connective tissue between layers
    </text>
    <text x="40" y="412" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}" font-style="italic">
      where the bifurcated needle deposits vaccine
    </text>

    <!-- ventral -->
    <path d="M 40 350 Q 320 310 600 350 L 600 400 Q 320 360 40 400 Z"
          fill="${DERM}" stroke="${INK}" stroke-width="2"/>
    <text x="600" y="445" text-anchor="end" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${INK}">Ventral skin (bottom layer)</text>

    <!-- bifurcated needle (two prongs) -->
    <g transform="translate(290,40)">
      <!-- handle -->
      <rect x="-25" y="0" width="50" height="30" fill="${INK}"/>
      <rect x="-30" y="30" width="60" height="20" fill="${MUTED}"/>
      <!-- stem -->
      <rect x="-3" y="50" width="6" height="100" fill="${INK}"/>
      <!-- bifurcation -->
      <line x1="-3" y1="150" x2="-12" y2="225" stroke="${INK}" stroke-width="4"/>
      <line x1="3"  y1="150" x2="12"  y2="225" stroke="${INK}" stroke-width="4"/>
      <!-- vaccine drops in the fork -->
      <ellipse cx="0" cy="205" rx="9" ry="5" fill="${BLUE}" opacity="0.85"/>
    </g>

    <!-- needle penetrates top layer, vaccine sits in connective tissue -->
    <text x="350" y="100" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Bifurcated needle</text>
    <text x="350" y="120" font-family="Calibri,Arial,sans-serif" font-size="12" fill="${MUTED}">Holds a measured dose between the prongs</text>

    <!-- arrow showing vaccine deposit -->
    <line x1="350" y1="310" x2="305" y2="285" stroke="${BLUE}" stroke-width="2"/>
    <polygon points="305,285 315,290 312,278" fill="${BLUE}"/>
    <text x="355" y="305" font-family="Calibri,Arial,sans-serif" font-size="13" font-weight="700" fill="${BLUE}">Vaccine deposit site</text>
    <text x="355" y="322" font-family="Calibri,Arial,sans-serif" font-size="12" fill="${INK}">Between the two skin layers</text>

    <!-- TAKE-OFF SCAB box -->
    <rect x="40" y="500" width="560" height="130" rx="10" fill="${SOFT}" stroke="${BLUE}" stroke-width="1.5"/>
    <text x="60" y="528" font-family="Calibri,Arial,sans-serif" font-size="16" font-weight="700" fill="${NAVY}">Take after 7 to 10 days</text>
    <text x="60" y="552" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">A small scab or swelling at the site means the vaccine took.</text>
    <text x="60" y="574" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Check 50 to 100 birds per house. Less than 95 percent take = revaccinate.</text>
    <text x="60" y="596" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">No scab = needle missed the web, dose was lost, or vaccine was inactive.</text>
  </g>
</svg>`;
  return { name: 'fig2_2.png', svg, w: W, h: H };
}

// ---------------------------------------------------------------------------
// Figure 3.1  Eye drop vaccination administration
// ---------------------------------------------------------------------------
function fig3_1() {
  const W = 1400, H = 820;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="${W/2}" y="48" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="30" font-weight="700" fill="${NAVY}">
    Eye drop vaccination: drop, drainage, and immune entry
  </text>
  <text x="${W/2}" y="80" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="18" fill="${MUTED}">
    The drop reaches Harderian gland tissue through the nasolacrimal duct
  </text>

  <!-- Side view of chicken head -->
  <g transform="translate(120,130)">

    <!-- skull / head outline (side view) -->
    <path d="M 60 280 Q 60 120 280 80 Q 480 60 620 170 Q 660 230 640 320 Q 620 400 480 430 Q 280 460 140 410 Q 60 380 60 280 Z"
          fill="#F8E4C6" stroke="${INK}" stroke-width="2.5"/>

    <!-- beak -->
    <path d="M 660 220 L 760 240 L 760 270 L 660 285 Z" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>
    <line x1="660" y1="255" x2="760" y2="255" stroke="${INK}" stroke-width="1.5"/>

    <!-- nostril -->
    <ellipse cx="685" cy="232" rx="6" ry="3" fill="${INK}"/>

    <!-- comb -->
    <path d="M 230 80 Q 250 40 280 70 Q 310 30 340 70 Q 370 35 400 75 Q 430 45 460 80"
          fill="#C73E3E" stroke="${INK}" stroke-width="2"/>

    <!-- wattle -->
    <path d="M 600 290 Q 595 360 580 380 Q 565 360 575 290 Z" fill="#C73E3E" stroke="${INK}" stroke-width="2"/>

    <!-- ear -->
    <ellipse cx="320" cy="280" rx="22" ry="14" fill="#FBEFD4" stroke="${INK}" stroke-width="1.5"/>

    <!-- EYE -->
    <ellipse cx="480" cy="210" rx="40" ry="28" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
    <ellipse cx="486" cy="212" rx="22" ry="20" fill="#7A5A2C" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="488" cy="212" r="8" fill="${INK}"/>
    <circle cx="492" cy="208" r="3" fill="white"/>

    <!-- conjunctival surface highlight -->
    <path d="M 442 220 Q 480 232 520 220" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-dasharray="3 2"/>
    <text x="395" y="270" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${BLUE}">Conjunctival</text>
    <text x="412" y="288" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${BLUE}">surface</text>

    <!-- DROPPER from above -->
    <g transform="translate(465,40)">
      <rect x="-12" y="0" width="24" height="60" fill="${MUTED}" stroke="${INK}" stroke-width="1.5"/>
      <rect x="-6"  y="60" width="12" height="40" fill="${INK}"/>
      <path d="M -6 100 Q 0 130 6 100 Z" fill="${INK}"/>
    </g>
    <!-- falling drop -->
    <ellipse cx="465" cy="155" rx="6" ry="9" fill="${BLUE}"/>
    <!-- splash on conjunctival surface -->
    <path d="M 460 185 Q 470 190 480 185 Q 490 190 500 185" stroke="${BLUE}" stroke-width="2" fill="none"/>

    <!-- LACRIMAL DUCT path (eye to nostril) -->
    <path d="M 520 215 Q 580 225 660 235" fill="none" stroke="${ACCENT}" stroke-width="3.5" stroke-dasharray="8 4"/>
    <polygon points="660,235 650,230 650,240" fill="${ACCENT}"/>
    <text x="540" y="200" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${ACCENT}">Nasolacrimal duct</text>
    <text x="540" y="218" font-family="Calibri,Arial,sans-serif" font-size="12" fill="${INK}">Vaccine drains to nasal cavity</text>

    <!-- HARDERIAN GLAND callout (immune tissue behind the eye) -->
    <circle cx="425" cy="225" r="22" fill="none" stroke="${NAVY}" stroke-width="2"/>
    <line x1="404" y1="240" x2="320" y2="380" stroke="${NAVY}" stroke-width="2"/>
    <rect x="120" y="370" width="280" height="80" rx="8" fill="${SOFT}" stroke="${NAVY}" stroke-width="1.5"/>
    <text x="135" y="395" font-family="Calibri,Arial,sans-serif" font-size="15" font-weight="700" fill="${NAVY}">Harderian gland</text>
    <text x="135" y="416" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}">Local immune tissue behind the eye</text>
    <text x="135" y="434" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}">samples the vaccine and primes IgA</text>

  </g>

  <!-- STEP CARDS -->
  <g transform="translate(60,640)">
    <rect x="0" y="0" width="410" height="140" rx="10" fill="${BG}" stroke="${BLUE}" stroke-width="2"/>
    <circle cx="35" cy="35" r="22" fill="${BLUE}"/>
    <text x="35" y="42" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="22" font-weight="700" fill="white">1</text>
    <text x="72" y="40" font-family="Calibri,Arial,sans-serif" font-size="17" font-weight="700" fill="${NAVY}">Hold head level</text>
    <text x="72" y="62" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Cup the bird, tilt slightly so the eye is up.</text>
    <text x="72" y="82" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Open eye is the target, not the feathers.</text>
    <text x="72" y="105" font-family="Calibri,Arial,sans-serif" font-size="13" font-style="italic" fill="${MUTED}">Bird stays calm if held firmly and quietly.</text>
  </g>
  <g transform="translate(490,640)">
    <rect x="0" y="0" width="410" height="140" rx="10" fill="${BG}" stroke="${BLUE}" stroke-width="2"/>
    <circle cx="35" cy="35" r="22" fill="${BLUE}"/>
    <text x="35" y="42" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="22" font-weight="700" fill="white">2</text>
    <text x="72" y="40" font-family="Calibri,Arial,sans-serif" font-size="17" font-weight="700" fill="${NAVY}">Place one full drop</text>
    <text x="72" y="62" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Dropper held 1 to 2 cm above the eye.</text>
    <text x="72" y="82" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Do not touch the eye with the tip.</text>
    <text x="72" y="105" font-family="Calibri,Arial,sans-serif" font-size="13" font-style="italic" fill="${MUTED}">Half a drop is a missed bird. Use a fresh full drop.</text>
  </g>
  <g transform="translate(920,640)">
    <rect x="0" y="0" width="410" height="140" rx="10" fill="${BG}" stroke="${BLUE}" stroke-width="2"/>
    <circle cx="35" cy="35" r="22" fill="${BLUE}"/>
    <text x="35" y="42" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="22" font-weight="700" fill="white">3</text>
    <text x="72" y="40" font-family="Calibri,Arial,sans-serif" font-size="17" font-weight="700" fill="${NAVY}">Confirm the drop ran in</text>
    <text x="72" y="62" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Watch the bird blink and the drop disappear.</text>
    <text x="72" y="82" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Only then release the bird.</text>
    <text x="72" y="105" font-family="Calibri,Arial,sans-serif" font-size="13" font-style="italic" fill="${MUTED}">If it ran off the feathers, that bird is unvaccinated.</text>
  </g>
</svg>`;
  return { name: 'fig3_1.png', svg, w: W, h: H };
}

// ---------------------------------------------------------------------------
// Figure 4.1  Coarse spray vaccination technique in a commercial broiler barn
// Based on CPC Coarse Spray Vaccination Technical Bulletin
// ---------------------------------------------------------------------------
function fig4_1() {
  const W = 1400, H = 860;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Title -->
  <text x="${W/2}" y="48" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="30" font-weight="700" fill="${NAVY}">
    Coarse spray vaccination technique
  </text>
  <text x="${W/2}" y="80" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="18" fill="${MUTED}">
    Based on the CPC Learning Centre Coarse Spray Vaccination Technical Bulletin
  </text>

  <!-- ===== BARN CROSS-SECTION ===== -->
  <!-- Floor -->
  <rect x="100" y="550" width="1200" height="30" fill="#D4B896" stroke="${INK}" stroke-width="2"/>
  <!-- Left wall -->
  <rect x="100" y="200" width="20" height="380" fill="#C0C0C0" stroke="${INK}" stroke-width="2"/>
  <!-- Right wall -->
  <rect x="1280" y="200" width="20" height="380" fill="#C0C0C0" stroke="${INK}" stroke-width="2"/>
  <!-- Roof -->
  <polygon points="80,200 700,100 1320,200" fill="#888888" stroke="${INK}" stroke-width="2"/>
  <!-- Roof interior line -->
  <polygon points="120,200 700,110 1280,200" fill="#EEEEEE" stroke="${INK}" stroke-width="1.5"/>

  <!-- Barn label -->
  <text x="700" y="130" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="16" fill="${MUTED}">Commercial broiler barn (cross-section view)</text>

  <!-- ===== BIRDS on the floor, grouped near left wall ===== -->
  <!-- CPC bulletin: group birds along the side walls for broilers -->
  ${Array.from({length:14}, (_, i) => {
    const x = 140 + i * 42;
    const y = 530;
    return `
    <ellipse cx="${x}" cy="${y}" rx="18" ry="10" fill="#F8E4C6" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="${x-10}" cy="${y-4}" r="5" fill="#F8E4C6" stroke="${INK}" stroke-width="1"/>
    <line x1="${x-5}" y1="${y+8}" x2="${x-7}" y2="${y+20}" stroke="${INK}" stroke-width="1.2"/>
    <line x1="${x+2}" y1="${y+8}" x2="${x+2}" y2="${y+20}" stroke="${INK}" stroke-width="1.2"/>`;
  }).join('')}

  <!-- Birds scattered in the middle -->
  ${Array.from({length:8}, (_, i) => {
    const x = 740 + i * 50;
    const y = 525;
    return `
    <ellipse cx="${x}" cy="${y}" rx="18" ry="10" fill="#F8E4C6" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="${x-10}" cy="${y-4}" r="5" fill="#F8E4C6" stroke="${INK}" stroke-width="1"/>
    <line x1="${x-5}" y1="${y+8}" x2="${x-7}" y2="${y+20}" stroke="${INK}" stroke-width="1.2"/>
    <line x1="${x+2}" y1="${y+8}" x2="${x+2}" y2="${y+20}" stroke="${INK}" stroke-width="1.2"/>`;
  }).join('')}

  <!-- ===== VACCINATOR walking with sprayer ===== -->
  <g transform="translate(480,310)">
    <!-- body -->
    <ellipse cx="0" cy="80" rx="22" ry="35" fill="#4472C4" stroke="${INK}" stroke-width="1.5"/>
    <!-- head -->
    <circle cx="0" cy="30" r="22" fill="#F8E4C6" stroke="${INK}" stroke-width="1.5"/>
    <!-- mask/PPE -->
    <ellipse cx="0" cy="44" rx="15" ry="10" fill="white" stroke="${INK}" stroke-width="1.5"/>
    <!-- safety glasses -->
    <rect x="-18" y="22" width="36" height="12" rx="4" fill="none" stroke="${NAVY}" stroke-width="2"/>
    <!-- hat -->
    <ellipse cx="0" cy="10" rx="24" ry="7" fill="#2E74B5"/>
    <!-- legs -->
    <line x1="-10" y1="110" x2="-14" y2="165" stroke="${INK}" stroke-width="5"/>
    <line x1="10"  y1="110" x2="12"  y2="165" stroke="${INK}" stroke-width="5"/>
    <!-- arm holding sprayer -->
    <line x1="22" y1="70" x2="70" y2="100" stroke="${INK}" stroke-width="4"/>
    <!-- Sprayer wand -->
    <rect x="60" y="90" width="8" height="80" fill="${MUTED}" stroke="${INK}" stroke-width="1.5" transform="rotate(-15,64,130)"/>
    <!-- Nozzle -->
    <ellipse cx="92" cy="162" rx="10" ry="6" fill="${INK}" transform="rotate(-15,92,162)"/>
    <!-- tank on back -->
    <rect x="-35" y="50" width="22" height="50" rx="6" fill="${NAVY}" stroke="${INK}" stroke-width="1.5"/>
  </g>

  <!-- ===== SPRAY CONE from nozzle ===== -->
  <!-- Nozzle approximately at (540,455) after transform -->
  <path d="M 540 455 L 430 540 L 660 540 Z" fill="${BLUE}" opacity="0.18" stroke="${BLUE}" stroke-width="1.5" stroke-dasharray="4 3"/>
  <!-- spray droplets -->
  ${[[490,495],[510,510],[530,490],[555,505],[575,520],[590,498],[610,515],[535,530],[565,535]].map(([x,y]) =>
    `<circle cx="${x}" cy="${y}" r="3" fill="${BLUE}" opacity="0.7"/>`
  ).join('')}

  <!-- ===== MEASUREMENT ARROWS ===== -->
  <!-- Nozzle height: 1 m above birds (from nozzle ~y455 to floor ~y535) -->
  <line x1="660" y1="455" x2="660" y2="535" stroke="${GOLD}" stroke-width="2.5"/>
  <polygon points="660,455 654,470 666,470" fill="${GOLD}"/>
  <polygon points="660,535 654,520 666,520" fill="${GOLD}"/>
  <rect x="665" y="480" width="160" height="35" rx="5" fill="${SOFT}" stroke="${GOLD}" stroke-width="1.5"/>
  <text x="745" y="498" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${NAVY}">1 m (3 ft)</text>
  <text x="745" y="514" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="12" fill="${INK}">nozzle above birds</text>

  <!-- Distance from wall: max 4 m (vaccinator at x~480 to left wall at x~120) -->
  <line x1="120" y1="480" x2="480" y2="480" stroke="${ACCENT}" stroke-width="2.5"/>
  <polygon points="120,480 135,474 135,486" fill="${ACCENT}"/>
  <polygon points="480,480 465,474 465,486" fill="${ACCENT}"/>
  <rect x="190" y="455" width="230" height="35" rx="5" fill="#FFE8E8" stroke="${ACCENT}" stroke-width="1.5"/>
  <text x="305" y="473" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${ACCENT}">Max 4 m (12 ft)</text>
  <text x="305" y="489" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="12" fill="${INK}">vaccinator to side wall</text>

  <!-- Walk direction arrow -->
  <path d="M 490 620 L 900 620" stroke="${NAVY}" stroke-width="2.5" stroke-dasharray="6 4"/>
  <polygon points="900,620 882,613 882,627" fill="${NAVY}"/>
  <text x="695" y="645" text-anchor="middle" font-family="Calibri,Arial,sans-serif"
        font-size="15" font-weight="700" fill="${NAVY}">Walk slowly down the barn</text>

  <!-- ===== FANS (turned off during vaccination) ===== -->
  <g transform="translate(1100,320)">
    <circle cx="0" cy="0" r="35" fill="none" stroke="${MUTED}" stroke-width="3" stroke-dasharray="5 3"/>
    <text x="0" y="-45" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="13" font-weight="700" fill="${ACCENT}">Fans OFF</text>
    <text x="0" y="-28" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="11" fill="${MUTED}">during vaccination</text>
    <line x1="-25" y1="-25" x2="25" y2="25" stroke="${ACCENT}" stroke-width="3"/>
    <line x1="25" y1="-25" x2="-25" y2="25" stroke="${ACCENT}" stroke-width="3"/>
    <circle cx="0" cy="0" r="8" fill="${MUTED}"/>
  </g>

  <!-- ===== KEY RULES BOX ===== -->
  <rect x="100" y="620" width="520" height="210" rx="10" fill="${SOFT}" stroke="${BLUE}" stroke-width="1.5"/>
  <text x="120" y="648" font-family="Calibri,Arial,sans-serif" font-size="17" font-weight="700" fill="${NAVY}">Key rules (CPC Coarse Spray Bulletin)</text>
  <text x="120" y="672" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- Distilled, demineralized, or deionized water only (no chlorinated water)</text>
  <text x="120" y="694" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- Volume: 3 L/10,000 birds at day 1; 7-8 L/10,000 birds after day 7</text>
  <text x="120" y="716" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- Pressure: 4.5-5.0 Bar (65-75 PSI) — steady throughout the run</text>
  <text x="120" y="738" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- Fans off during vaccination; back on 20 min after</text>
  <text x="120" y="760" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- Practice run with water 1-2 days before to check volume and speed</text>
  <text x="120" y="782" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- Rinse each vial well (15% dose lost if vials are not rinsed)</text>
  <text x="120" y="804" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">- PPE: gloves, mask, safety glasses (Newcastle conjunctivitis risk)</text>

  <!-- ===== SPRAY DIRECTION label ===== -->
  <rect x="650" y="620" width="260" height="75" rx="10" fill="${BG}" stroke="${BLUE}" stroke-width="1.5"/>
  <text x="780" y="648" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="15" font-weight="700" fill="${NAVY}">Nozzle direction</text>
  <text x="780" y="668" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="14" fill="${INK}">Downward, toward birds</text>
  <text x="780" y="686" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="13" font-style="italic" fill="${MUTED}">Not horizontal, not upward</text>

  <!-- ===== PSI GAUGE ===== -->
  <rect x="650" y="710" width="260" height="120" rx="10" fill="${BG}" stroke="${NAVY}" stroke-width="1.5"/>
  <text x="780" y="738" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="15" font-weight="700" fill="${NAVY}">Spray pressure</text>
  <text x="780" y="762" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="24" font-weight="700" fill="${BLUE}">4.5-5.0 Bar</text>
  <text x="780" y="786" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="18" fill="${INK}">65-75 PSI</text>
  <text x="780" y="806" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="12" font-style="italic" fill="${MUTED}">Constant throughout the run</text>

  <!-- ===== POST-VAX TIMELINE ===== -->
  <rect x="940" y="620" width="360" height="210" rx="10" fill="${BG}" stroke="${GOLD}" stroke-width="2"/>
  <text x="1120" y="648" text-anchor="middle" font-family="Calibri,Arial,sans-serif" font-size="16" font-weight="700" fill="${NAVY}">After vaccination</text>
  <line x1="960" y1="660" x2="1280" y2="660" stroke="${GOLD}" stroke-width="1.5"/>
  <text x="960" y="685" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${NAVY}">0 min</text>
  <text x="1010" y="685" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}">Vaccination complete</text>
  <text x="960" y="715" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${NAVY}">20 min</text>
  <text x="1010" y="715" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}">Turn all fans back ON</text>
  <text x="960" y="745" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${NAVY}">Rinse</text>
  <text x="1010" y="745" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}">Flush sprayer with distilled water</text>
  <text x="960" y="775" font-family="Calibri,Arial,sans-serif" font-size="14" font-weight="700" fill="${NAVY}">Sanitize</text>
  <text x="1010" y="775" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}">Sanitize with Clean Tabs, store inverted</text>
  <text x="1010" y="795" font-family="Calibri,Arial,sans-serif" font-size="13" fill="${INK}">to dry in a clean place</text>
  <text x="960" y="820" font-family="Calibri,Arial,sans-serif" font-size="13" font-style="italic" fill="${ACCENT}">Hot weather: vaccinate at dawn</text>
</svg>`;
  return { name: 'fig4_1.png', svg, w: W, h: H };
}

// ---------------------------------------------------------------------------
// Render all
// ---------------------------------------------------------------------------
const figs = [fig1_2(), fig2_2(), fig3_1(), fig4_1()];

for (const f of figs) {
  const outPath = path.join(OUT_DIR, f.name);
  await sharp(Buffer.from(f.svg))
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  const stat = fs.statSync(outPath);
  console.log(`Wrote ${f.name}  ${f.w}x${f.h}  ${stat.size} bytes`);
}

console.log('\nAll 4 Course 8 figures rendered.');
