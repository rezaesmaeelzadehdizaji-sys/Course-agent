// ============================================================
// generate-course6-diagrams.mjs
// Creates the 3 anatomy diagrams for Course 6 as PNG files
// using @resvg/resvg-js to render SVG → PNG
// ============================================================
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'Course 6');

function render(svgStr, filename) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'original' } });
  const data  = resvg.render();
  const buf   = data.asPng();
  const dest  = path.join(OUT, filename);
  fs.writeFileSync(dest, buf);
  console.log('✓', filename, `(${(buf.length/1024).toFixed(0)} KB)`);
}

// ============================================================
// FIGURE 3.1 — POULTRY DIGESTIVE SYSTEM
// ============================================================
const digestiveSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="540" viewBox="0 0 760 540">
  <defs>
    <style>
      .bg { fill: #FAFAFA; }
      .organ { fill: #E8D5A3; stroke: #9A7B4F; stroke-width: 1.5; }
      .organ2 { fill: #D4E8B0; stroke: #4F7A2A; stroke-width: 1.5; }
      .label { font-family: Calibri, Arial, sans-serif; font-size: 14px; fill: #222222; }
      .label-bold { font-family: Calibri, Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #1F3864; }
      .title { font-family: Calibri, Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #1F3864; }
      .subtitle { font-family: Calibri, Arial, sans-serif; font-size: 13px; fill: #555; }
      .line { stroke: #7A5C2E; stroke-width: 1.2; fill: none; stroke-dasharray: 4,3; }
      .arrow { stroke: #7A5C2E; stroke-width: 1.8; fill: none; marker-end: url(#arrowhead); }
      .border { fill: none; stroke: #C9A84C; stroke-width: 2; }
    </style>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#7A5C2E"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect class="bg" width="760" height="540" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="532" rx="6"/>

  <!-- Title -->
  <text class="title" x="380" y="36" text-anchor="middle">Poultry Digestive System</text>
  <text class="subtitle" x="380" y="54" text-anchor="middle">From beak to cloaca — no teeth at any point in this system</text>

  <!-- BIRD BODY SILHOUETTE (simplified lateral view) -->
  <!-- Body oval -->
  <ellipse cx="310" cy="290" rx="140" ry="100" fill="#F0EDE0" stroke="#BBA888" stroke-width="1.5"/>
  <!-- Head -->
  <circle cx="195" cy="200" r="40" fill="#F0EDE0" stroke="#BBA888" stroke-width="1.5"/>
  <!-- Beak -->
  <polygon points="160,192 145,200 160,208" fill="#D4A017" stroke="#A07810" stroke-width="1"/>
  <!-- Eye -->
  <circle cx="185" cy="195" r="5" fill="#8B4513"/>
  <circle cx="186" cy="194" r="2" fill="#FFF" opacity="0.5"/>
  <!-- Neck -->
  <path d="M 198 240 Q 210 265 220 280" stroke="#BBA888" stroke-width="18" fill="none" stroke-linecap="round"/>
  <!-- Tail feathers -->
  <path d="M 445 270 Q 480 250 490 235 Q 485 260 490 275 Q 475 265 480 285" fill="#D8C890" stroke="#9A8A50" stroke-width="1"/>
  <!-- Legs -->
  <line x1="280" y1="380" x2="270" y2="430" stroke="#BBA888" stroke-width="6"/>
  <line x1="340" y1="385" x2="350" y2="430" stroke="#BBA888" stroke-width="6"/>
  <!-- Wings -->
  <path d="M 230 260 Q 290 230 350 240 Q 300 265 230 275 Z" fill="#E8D5A3" stroke="#9A7B4F" stroke-width="1"/>

  <!-- DIGESTIVE ORGANS INSIDE BODY -->
  <!-- Esophagus (neck area) -->
  <path d="M 195 240 Q 210 268 222 285" stroke="#E8A87C" stroke-width="8" fill="none" stroke-linecap="round"/>

  <!-- Crop (bulge at base of neck) -->
  <ellipse cx="225" cy="255" rx="20" ry="16" fill="#F5C87A" stroke="#C49030" stroke-width="1.5"/>

  <!-- Proventriculus -->
  <ellipse cx="245" cy="295" rx="16" ry="20" fill="#E8A87C" stroke="#9A5C3C" stroke-width="1.5"/>

  <!-- Gizzard -->
  <ellipse cx="265" cy="330" rx="28" ry="24" fill="#C4845A" stroke="#7A4030" stroke-width="2"/>

  <!-- Small intestine coils -->
  <path d="M 290 340 Q 330 325 345 340 Q 360 355 340 370 Q 315 385 295 370 Q 280 355 295 345" fill="#D4E8A0" stroke="#5A8A2A" stroke-width="1.5" fill-opacity="0.8"/>

  <!-- Ceca (two small pouches) -->
  <ellipse cx="330" cy="360" rx="12" ry="18" fill="#B8D890" stroke="#4A7A20" stroke-width="1.5"/>
  <ellipse cx="356" cy="362" rx="11" ry="17" fill="#B8D890" stroke="#4A7A20" stroke-width="1.5"/>

  <!-- Large intestine / colon -->
  <path d="M 370 355 Q 400 345 415 360 Q 420 375 405 385" stroke="#D4A87C" stroke-width="10" fill="none" stroke-linecap="round"/>

  <!-- Cloaca -->
  <ellipse cx="408" cy="395" rx="18" ry="14" fill="#C49060" stroke="#8A5030" stroke-width="1.5"/>

  <!-- Liver (behind stomach) -->
  <path d="M 295 290 Q 320 278 335 295 Q 330 315 305 312 Z" fill="#D46060" fill-opacity="0.7" stroke="#A03030" stroke-width="1"/>
  <!-- Pancreas -->
  <path d="M 305 332 Q 335 328 342 340" stroke="#E8C080" stroke-width="6" fill="none" stroke-linecap="round"/>

  <!-- ============================================================ -->
  <!-- LABELS — right side -->
  <!-- ============================================================ -->

  <!-- Beak -->
  <line class="line" x1="148" y1="200" x2="80" y2="165"/>
  <text class="label-bold" x="76" y="158">Beak</text>
  <text class="label" x="76" y="172">(no teeth)</text>

  <!-- Esophagus -->
  <line class="line" x1="208" y1="255" x2="80" y2="245"/>
  <text class="label-bold" x="76" y="238">Esophagus</text>

  <!-- Crop -->
  <line class="line" x1="218" y1="258" x2="80" y2="290"/>
  <text class="label-bold" x="76" y="283">Crop</text>
  <text class="label" x="76" y="297">Feed storage &amp; moistening</text>

  <!-- Proventriculus -->
  <line class="line" x1="242" y1="302" x2="80" y2="330"/>
  <text class="label-bold" x="76" y="323">Proventriculus</text>
  <text class="label" x="76" y="337">HCl + pepsin — protein digestion starts</text>

  <!-- Gizzard -->
  <line class="line" x1="250" y1="340" x2="80" y2="370"/>
  <text class="label-bold" x="76" y="363">Gizzard</text>
  <text class="label" x="76" y="377">Mechanical grinding — particles &lt; 0.1 mm</text>

  <!-- Labels — left/right side -->
  <!-- Small intestine -->
  <line class="line" x1="345" y1="355" x2="520" y2="305"/>
  <text class="label-bold" x="522" y="298">Small intestine</text>
  <text class="label" x="522" y="312">(duodenum, jejunum, ileum)</text>
  <text class="label" x="522" y="326">Nutrient absorption</text>

  <!-- Liver -->
  <line class="line" x1="320" y1="295" x2="520" y2="340"/>
  <text class="label-bold" x="522" y="333">Liver + Pancreas</text>
  <text class="label" x="522" y="347">Bile salts &amp; enzymes → duodenum</text>

  <!-- Ceca -->
  <line class="line" x1="342" y1="370" x2="520" y2="385"/>
  <text class="label-bold" x="522" y="378">Ceca (×2)</text>
  <text class="label" x="522" y="392">Fermentation, B vitamins, water reabsorption</text>

  <!-- Cloaca -->
  <line class="line" x1="415" y1="395" x2="520" y2="425"/>
  <text class="label-bold" x="522" y="418">Cloaca</text>
  <text class="label" x="522" y="432">Digestive + urinary + reproductive exit</text>

  <!-- Flow arrow overall -->
  <text class="subtitle" x="130" y="490" text-anchor="middle">← Feed direction of flow →</text>

  <!-- Note at bottom -->
  <line x1="40" y1="510" x2="720" y2="510" stroke="#C9A84C" stroke-width="1"/>
  <text class="subtitle" x="380" y="528" text-anchor="middle">Total gut transit time approximately 4–6 hours in broilers</text>
</svg>`;

// ============================================================
// FIGURE 3.2 — AVIAN AIR SAC SYSTEM
// ============================================================
const airSacSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="540" viewBox="0 0 760 540">
  <defs>
    <style>
      .bg { fill: #FAFAFA; }
      .sac { fill-opacity: 0.55; stroke-width: 1.8; }
      .sac-cervical { fill: #A8D8EA; stroke: #3A8FAA; }
      .sac-interclavicular { fill: #B8E0C0; stroke: #3A8A50; }
      .sac-thoracic-ant { fill: #FFD9A0; stroke: #C88030; }
      .sac-thoracic-post { fill: #FFB8A0; stroke: #C84030; }
      .sac-abdominal { fill: #C8B8E8; stroke: #5830A0; }
      .lung { fill: #FF9999; fill-opacity: 0.6; stroke: #CC3333; stroke-width: 2; }
      .body { fill: #F0EDE0; stroke: #BBA888; stroke-width: 1.5; }
      .label { font-family: Calibri, Arial, sans-serif; font-size: 13px; fill: #222; }
      .label-bold { font-family: Calibri, Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #1F3864; }
      .title { font-family: Calibri, Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #1F3864; }
      .subtitle { font-family: Calibri, Arial, sans-serif; font-size: 12px; fill: #555; }
      .line { stroke: #556; stroke-width: 1.1; fill: none; stroke-dasharray: 3,3; }
      .arrow-flow { stroke: #2255AA; stroke-width: 2.2; fill: none; stroke-linecap: round; }
      .border { fill: none; stroke: #C9A84C; stroke-width: 2; }
      .num { font-family: Calibri, Arial, sans-serif; font-size: 11px; font-weight: bold; fill: #FFFFFF; }
    </style>
    <marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#2255AA"/>
    </marker>
    <marker id="arrowBlue2" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <polygon points="8 0, 0 3, 8 6" fill="#2255AA"/>
    </marker>
  </defs>

  <rect class="bg" width="760" height="540" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="532" rx="6"/>

  <!-- Title -->
  <text class="title" x="380" y="34" text-anchor="middle">The Avian Respiratory System: Nine Air Sacs</text>
  <text class="subtitle" x="380" y="52" text-anchor="middle">Air flows in one direction through the parabronchi — gas exchange occurs during BOTH inhalation and exhalation</text>

  <!-- BIRD BODY OUTLINE (dorsal/lateral view) -->
  <ellipse class="body" cx="340" cy="290" rx="155" ry="120"/>
  <!-- Head -->
  <circle class="body" cx="200" cy="200" r="38"/>
  <!-- Beak -->
  <polygon points="167,192 152,200 167,208" fill="#D4A017" stroke="#A07810" stroke-width="1"/>
  <!-- Eye -->
  <circle cx="190" cy="196" r="5" fill="#8B4513"/>
  <!-- Neck -->
  <path d="M 203 237 Q 218 265 226 282" stroke="#BBA888" stroke-width="16" fill="none" stroke-linecap="round"/>
  <!-- Tail -->
  <path d="M 488 270 Q 515 252 522 240 Q 516 262 520 278 Q 506 268 510 284" fill="#D8C890" stroke="#9A8A50" stroke-width="1"/>
  <!-- Legs -->
  <line x1="308" y1="404" x2="298" y2="450" stroke="#BBA888" stroke-width="5"/>
  <line x1="365" y1="408" x2="375" y2="450" stroke="#BBA888" stroke-width="5"/>

  <!-- ============================================================ -->
  <!-- AIR SACS — numbered -->
  <!-- 1. Cervical (unpaired) — neck -->
  <ellipse class="sac sac-cervical" cx="222" cy="250" rx="22" ry="28"/>
  <text class="num" x="218" y="255" text-anchor="middle">1</text>

  <!-- 2+3. Interclavicular (2) — chest -->
  <ellipse class="sac sac-interclavicular" cx="255" cy="275" rx="22" ry="24"/>
  <text class="num" x="251" y="280" text-anchor="middle">2</text>
  <ellipse class="sac sac-interclavicular" cx="295" cy="270" rx="22" ry="24"/>
  <text class="num" x="291" y="275" text-anchor="middle">3</text>

  <!-- 4+5. Anterior thoracic -->
  <ellipse class="sac sac-thoracic-ant" cx="282" cy="310" rx="28" ry="24"/>
  <text class="num" x="278" y="315" text-anchor="middle">4</text>
  <ellipse class="sac sac-thoracic-ant" cx="335" cy="308" rx="28" ry="24"/>
  <text class="num" x="331" y="313" text-anchor="middle">5</text>

  <!-- 6+7. Posterior thoracic -->
  <ellipse class="sac sac-thoracic-post" cx="315" cy="355" rx="30" ry="22"/>
  <text class="num" x="311" y="360" text-anchor="middle">6</text>
  <ellipse class="sac sac-thoracic-post" cx="368" cy="352" rx="30" ry="22"/>
  <text class="num" x="364" y="357" text-anchor="middle">7</text>

  <!-- 8+9. Abdominal (large) -->
  <ellipse class="sac sac-abdominal" cx="360" cy="300" rx="40" ry="32"/>
  <text class="num" x="356" y="305" text-anchor="middle">8</text>
  <ellipse class="sac sac-abdominal" cx="420" cy="295" rx="40" ry="32"/>
  <text class="num" x="416" y="300" text-anchor="middle">9</text>

  <!-- LUNGS (rigid, don't expand) -->
  <ellipse class="lung" cx="305" cy="280" rx="25" ry="18"/>
  <ellipse class="lung" cx="358" cy="278" rx="25" ry="18"/>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:10px;font-weight:bold;fill:#993333;" x="331" y="274" text-anchor="middle">LUNGS</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:9px;fill:#993333;" x="331" y="284" text-anchor="middle">(rigid, fixed)</text>

  <!-- ============================================================ -->
  <!-- AIRFLOW DIAGRAM (bottom) -->
  <!-- ============================================================ -->
  <rect x="35" y="465" width="690" height="60" rx="6" fill="#EEF4FF" stroke="#8899CC" stroke-width="1"/>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:12px;font-weight:bold;fill:#1F3864;" x="380" y="481" text-anchor="middle">Unidirectional Airflow — requires TWO breathing cycles to fully traverse the lung</text>
  <!-- Inhalation arrow -->
  <text class="subtitle" x="80" y="503">Inhalation →</text>
  <path class="arrow-flow" d="M 155 500 L 195 500" marker-end="url(#arrowBlue)"/>
  <text class="label" x="200" y="503">Trachea</text>
  <path class="arrow-flow" d="M 245 500 L 280 500" marker-end="url(#arrowBlue)"/>
  <text class="label" x="285" y="503">Posterior air sacs</text>
  <path class="arrow-flow" d="M 385 500 L 420 500" marker-end="url(#arrowBlue)"/>
  <text class="label" x="425" y="503">Parabronchi (lungs)</text>
  <path class="arrow-flow" d="M 525 500 L 560 500" marker-end="url(#arrowBlue)"/>
  <text class="label" x="565" y="503">Anterior sacs</text>
  <path class="arrow-flow" d="M 625 500 L 660 500" marker-end="url(#arrowBlue)"/>
  <text class="label" x="665" y="503">Out</text>
  <text class="subtitle" x="380" y="519" text-anchor="middle">Gas exchange occurs in the parabronchi on BOTH breath strokes — far more efficient than mammalian tidal breathing</text>

  <!-- ============================================================ -->
  <!-- LEGEND -->
  <!-- ============================================================ -->
  <text class="label-bold" x="540" y="105">Air Sac Legend</text>
  <!-- 1 cervical -->
  <rect x="540" y="112" width="14" height="14" rx="3" fill="#A8D8EA" stroke="#3A8FAA" stroke-width="1.5" fill-opacity="0.7"/>
  <text class="label" x="560" y="123">1 — Cervical (unpaired)</text>
  <!-- 2-3 interclavicular -->
  <rect x="540" y="132" width="14" height="14" rx="3" fill="#B8E0C0" stroke="#3A8A50" stroke-width="1.5" fill-opacity="0.7"/>
  <text class="label" x="560" y="143">2–3 — Interclavicular (×2)</text>
  <!-- 4-5 ant thoracic -->
  <rect x="540" y="152" width="14" height="14" rx="3" fill="#FFD9A0" stroke="#C88030" stroke-width="1.5" fill-opacity="0.7"/>
  <text class="label" x="560" y="163">4–5 — Anterior thoracic (×2)</text>
  <!-- 6-7 post thoracic -->
  <rect x="540" y="172" width="14" height="14" rx="3" fill="#FFB8A0" stroke="#C84030" stroke-width="1.5" fill-opacity="0.7"/>
  <text class="label" x="560" y="183">6–7 — Posterior thoracic (×2)</text>
  <!-- 8-9 abdominal -->
  <rect x="540" y="192" width="14" height="14" rx="3" fill="#C8B8E8" stroke="#5830A0" stroke-width="1.5" fill-opacity="0.7"/>
  <text class="label" x="560" y="203">8–9 — Abdominal (×2)</text>
  <!-- Lungs -->
  <rect x="540" y="212" width="14" height="14" rx="3" fill="#FF9999" stroke="#CC3333" stroke-width="1.5" fill-opacity="0.7"/>
  <text class="label" x="560" y="223">Lungs (rigid, fixed)</text>

  <!-- Key management note -->
  <rect x="540" y="238" width="198" height="72" rx="4" fill="#FFF8E8" stroke="#C9A84C" stroke-width="1.5"/>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;font-weight:bold;fill:#7A4A00;" x="639" y="253" text-anchor="middle">Farm Management Note</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:10px;fill:#555;" x="548" y="267">No diaphragm — the sternum</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:10px;fill:#555;" x="548" y="280">moves in/out to drive breathing.</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:10px;fill:#555;" x="548" y="293">Grip around chest = bird</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:10px;fill:#555;" x="548" y="306">cannot breathe.</text>

  <line x1="40" y1="455" x2="720" y2="455" stroke="#C9A84C" stroke-width="1"/>
</svg>`;

// ============================================================
// FIGURE 3.3 — HEN OVIDUCT (EGG FORMATION)
// ============================================================
const oviductSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="540" viewBox="0 0 760 540">
  <defs>
    <style>
      .bg { fill: #FAFAFA; }
      .title { font-family: Calibri, Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #1F3864; }
      .subtitle { font-family: Calibri, Arial, sans-serif; font-size: 12px; fill: #555; }
      .label { font-family: Calibri, Arial, sans-serif; font-size: 13px; fill: #333; }
      .label-bold { font-family: Calibri, Arial, sans-serif; font-size: 13.5px; font-weight: bold; fill: #1F3864; }
      .time { font-family: Calibri, Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #7A3A00; }
      .line { stroke: #777; stroke-width: 1.1; fill: none; stroke-dasharray: 4,3; }
      .border { fill: none; stroke: #C9A84C; stroke-width: 2; }
    </style>
    <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#444"/>
    </marker>
    <marker id="arrW" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#2255AA"/>
    </marker>
  </defs>

  <rect class="bg" width="760" height="540" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="532" rx="6"/>

  <!-- Title -->
  <text class="title" x="380" y="34" text-anchor="middle">Egg Formation in the Hen's Oviduct</text>
  <text class="subtitle" x="380" y="52" text-anchor="middle">Only the LEFT oviduct is functional. Total formation time: approximately 25–26 hours.</text>

  <!-- ============================================================ -->
  <!-- OVIDUCT SECTIONS — vertical layout, top to bottom -->
  <!-- Flow direction: ovary → infundibulum → magnum → isthmus → shell gland → vagina → cloaca -->
  <!-- ============================================================ -->

  <!-- OVARY (cluster of follicles) -->
  <circle cx="100" cy="100" r="32" fill="#FFD080" fill-opacity="0.8" stroke="#C89030" stroke-width="2"/>
  <circle cx="86" cy="88" r="10" fill="#FFB830" stroke="#A07020" stroke-width="1.5"/>
  <circle cx="112" cy="88" r="14" fill="#FFB830" stroke="#A07020" stroke-width="1.5"/>
  <circle cx="95" cy="115" r="8" fill="#FFB830" stroke="#A07020" stroke-width="1.5"/>
  <circle cx="116" cy="112" r="10" fill="#FFB830" stroke="#A07020" stroke-width="1.5"/>
  <text class="label-bold" x="100" y="150" text-anchor="middle">Ovary</text>
  <text class="subtitle" x="100" y="163" text-anchor="middle">All ova</text>
  <text class="subtitle" x="100" y="175" text-anchor="middle">present at hatch</text>

  <!-- Arrow from ovary to infundibulum -->
  <path d="M 135 100 L 185 100" stroke="#444" stroke-width="2" marker-end="url(#arr)" fill="none"/>

  <!-- ============================================================ -->
  <!-- Section blocks — horizontal left to right then wrap -->
  <!-- Row 1: Infundibulum | Magnum | Isthmus -->
  <!-- Row 2: Shell Gland | Vagina | Cloaca -->

  <!-- 1. INFUNDIBULUM -->
  <rect x="195" y="68" width="130" height="80" rx="8" fill="#FFEEBB" stroke="#C89030" stroke-width="2"/>
  <text class="label-bold" x="260" y="90" text-anchor="middle">1. Infundibulum</text>
  <text class="label" x="260" y="105" text-anchor="middle">Length: 3–4 in</text>
  <text class="time" x="260" y="120" text-anchor="middle">⏱ 15–17 min</text>
  <text class="label" x="260" y="135" text-anchor="middle" style="font-size:11px;fill:#666;">Fertilization site</text>
  <!-- Egg yolk symbol -->
  <circle cx="260" cy="108" r="0" fill="none"/>
  <!-- Arrow to next -->
  <path d="M 330 108 L 355 108" stroke="#444" stroke-width="2" marker-end="url(#arr)" fill="none"/>

  <!-- 2. MAGNUM -->
  <rect x="360" y="68" width="130" height="80" rx="8" fill="#FFF0CC" stroke="#B87820" stroke-width="2"/>
  <text class="label-bold" x="425" y="90" text-anchor="middle">2. Magnum</text>
  <text class="label" x="425" y="105" text-anchor="middle">Length: 13 in</text>
  <text class="time" x="425" y="120" text-anchor="middle">⏱ ~3 hours</text>
  <text class="label" x="425" y="135" text-anchor="middle" style="font-size:11px;fill:#666;">Thick albumen added</text>
  <!-- Arrow to next -->
  <path d="M 495 108 L 520 108" stroke="#444" stroke-width="2" marker-end="url(#arr)" fill="none"/>

  <!-- 3. ISTHMUS -->
  <rect x="525" y="68" width="130" height="80" rx="8" fill="#FFE8AA" stroke="#A87030" stroke-width="2"/>
  <text class="label-bold" x="590" y="90" text-anchor="middle">3. Isthmus</text>
  <text class="label" x="590" y="105" text-anchor="middle">Length: 4 in</text>
  <text class="time" x="590" y="120" text-anchor="middle">⏱ ~75 min</text>
  <text class="label" x="590" y="135" text-anchor="middle" style="font-size:11px;fill:#666;">Shell membranes form</text>

  <!-- Connecting arrow down + left for Row 2 -->
  <path d="M 590 148 L 590 175 L 590 190" stroke="#444" stroke-width="2" marker-end="url(#arr)" fill="none"/>

  <!-- 4. SHELL GLAND (UTERUS) — large, most time spent here -->
  <rect x="525" y="200" width="130" height="100" rx="8" fill="#C8E8C0" stroke="#3A8A40" stroke-width="2.5"/>
  <text class="label-bold" x="590" y="220" text-anchor="middle">4. Shell Gland</text>
  <text class="label" x="590" y="234" text-anchor="middle">(Uterus)</text>
  <text class="label" x="590" y="249" text-anchor="middle">Length: 4–5 in</text>
  <text class="time" x="590" y="266" text-anchor="middle">⏱ 20+ HOURS</text>
  <text class="label" x="590" y="281" text-anchor="middle" style="font-size:11px;fill:#666;">Calcium shell deposited</text>
  <text class="label" x="590" y="293" text-anchor="middle" style="font-size:11px;fill:#666;">(mostly overnight)</text>
  <!-- Arrow left -->
  <path d="M 520 250 L 495 250" stroke="#444" stroke-width="2" marker-end="url(#arr)" fill="none"/>

  <!-- 5. VAGINA -->
  <rect x="360" y="215" width="130" height="80" rx="8" fill="#E0F0C8" stroke="#4A8030" stroke-width="2"/>
  <text class="label-bold" x="425" y="238" text-anchor="middle">5. Vagina</text>
  <text class="label" x="425" y="253" text-anchor="middle">Length: 4–5 in</text>
  <text class="time" x="425" y="268" text-anchor="middle">⏱ Minutes</text>
  <text class="label" x="425" y="283" text-anchor="middle" style="font-size:11px;fill:#666;">Bloom (cuticle) applied</text>
  <!-- Arrow left -->
  <path d="M 355 255 L 330 255" stroke="#444" stroke-width="2" marker-end="url(#arr)" fill="none"/>

  <!-- 6. CLOACA + EXIT -->
  <rect x="195" y="215" width="130" height="80" rx="8" fill="#D8E8F0" stroke="#3A6A80" stroke-width="2"/>
  <text class="label-bold" x="260" y="238" text-anchor="middle">Cloaca</text>
  <text class="label" x="260" y="253" text-anchor="middle">Egg exits</text>
  <text class="label" x="260" y="268" text-anchor="middle">large-end-first</text>
  <!-- Arrow down to egg illustration -->
  <path d="M 260 300 L 260 330" stroke="#444" stroke-width="2" marker-end="url(#arr)" fill="none"/>

  <!-- Final egg illustration -->
  <ellipse cx="260" cy="370" rx="38" ry="45" fill="#FFEEBB" stroke="#C8A020" stroke-width="2.5"/>
  <!-- Shell label inside egg -->
  <ellipse cx="260" cy="370" rx="28" ry="35" fill="none" stroke="#CCCCCC" stroke-width="1" stroke-dasharray="3,2"/>
  <ellipse cx="260" cy="370" rx="18" ry="22" fill="#FFF8CC" fill-opacity="0.8" stroke="#E8D080" stroke-width="1"/>
  <circle cx="260" cy="374" r="9" fill="#FFB830" stroke="#D08020" stroke-width="1"/>
  <text class="label-bold" x="260" y="430" text-anchor="middle">Complete Egg</text>
  <text class="subtitle" x="260" y="443" text-anchor="middle">~3 g calcium in shell</text>

  <!-- ============================================================ -->
  <!-- CALCIUM NOTE -->
  <!-- ============================================================ -->
  <rect x="40" y="355" width="140" height="110" rx="6" fill="#FFF0F0" stroke="#CC4444" stroke-width="1.5"/>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:12px;font-weight:bold;fill:#AA2222;" x="110" y="374" text-anchor="middle">Calcium Demand</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="110" y="390" text-anchor="middle">~3 g per shell</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="110" y="405" text-anchor="middle">20–40% from</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="110" y="420" text-anchor="middle">medullary bone</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="110" y="435" text-anchor="middle">(overnight, when</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="110" y="450" text-anchor="middle">hen is not eating)</text>

  <!-- ============================================================ -->
  <!-- SPERM STORAGE NOTE -->
  <!-- ============================================================ -->
  <rect x="530" y="330" width="200" height="90" rx="6" fill="#F0F0FF" stroke="#4444AA" stroke-width="1.5"/>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:12px;font-weight:bold;fill:#222288;" x="630" y="350" text-anchor="middle">Sperm Storage</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="538" y="366">Stored at the uterovaginal</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="538" y="380">junction (UVJ)</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="538" y="394">Viable for 2–3 weeks</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="538" y="408">Fertilization = infundibulum</text>

  <!-- LIGHT TRIGGER NOTE -->
  <rect x="40" y="480" width="680" height="46" rx="6" fill="#FFF8E8" stroke="#C9A84C" stroke-width="1.5"/>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:12px;font-weight:bold;fill:#7A4A00;" x="380" y="498" text-anchor="middle">Light Trigger</text>
  <text style="font-family:Calibri,Arial,sans-serif;font-size:11px;fill:#555;" x="380" y="515" text-anchor="middle">Ovulation is triggered by photoperiod detected in the hypothalamus. Ovulation almost never occurs after 3 PM. 14–16 hours light per day maintains consistent production.</text>
</svg>`;

// ============================================================
// FIGURE 5.1 — COMMERCIAL LAYING HEN (ILLUSTRATION)
// ============================================================
const layerHenSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="480" viewBox="0 0 760 480">
  <defs>
    <style>
      .bg { fill: #F8F6F0; }
      .title { font-family: Calibri, Arial, sans-serif; font-size: 17px; font-weight: bold; fill: #1F3864; }
      .label { font-family: Calibri, Arial, sans-serif; font-size: 13px; fill: #333; }
      .label-bold { font-family: Calibri, Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #1F3864; }
      .note { font-family: Calibri, Arial, sans-serif; font-size: 11px; fill: #666; font-style: italic; }
      .line { stroke: #888; stroke-width: 1.1; fill: none; stroke-dasharray: 4,3; }
      .border { fill: none; stroke: #C9A84C; stroke-width: 2; }
    </style>
  </defs>
  <rect class="bg" width="760" height="480" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="472" rx="6"/>

  <!-- Background: barn setting -->
  <rect x="4" y="4" width="752" height="300" rx="6" fill="#F5EDD5" fill-opacity="0.6"/>
  <!-- Floor -->
  <rect x="4" y="310" width="752" height="166" rx="0" fill="#D4C090" fill-opacity="0.5"/>
  <!-- Litter texture lines -->
  <line x1="50" y1="340" x2="150" y2="340" stroke="#B09060" stroke-width="0.8" opacity="0.4"/>
  <line x1="200" y1="355" x2="320" y2="355" stroke="#B09060" stroke-width="0.8" opacity="0.4"/>
  <line x1="420" y1="345" x2="560" y2="345" stroke="#B09060" stroke-width="0.8" opacity="0.4"/>
  <line x1="600" y1="360" x2="700" y2="360" stroke="#B09060" stroke-width="0.8" opacity="0.4"/>

  <!-- MAIN HEN BODY (white leghorn) -->
  <!-- Body -->
  <ellipse cx="360" cy="280" rx="110" ry="85" fill="#F5F5F0" stroke="#C8C0A0" stroke-width="2"/>
  <!-- Wing detail -->
  <path d="M 280 255 Q 340 230 400 245 Q 360 270 280 275 Z" fill="#E8E8E0" stroke="#C0B890" stroke-width="1.2"/>
  <!-- Neck -->
  <path d="M 310 220 Q 295 195 285 175" stroke="#C8C0A0" stroke-width="22" fill="none" stroke-linecap="round"/>
  <path d="M 310 220 Q 295 195 285 175" stroke="#F0EDE0" stroke-width="18" fill="none" stroke-linecap="round"/>
  <!-- Head -->
  <circle cx="278" cy="160" r="38" fill="#F5F5F0" stroke="#C8C0A0" stroke-width="1.8"/>
  <!-- Comb (single comb, bright red) -->
  <path d="M 268 125 Q 272 108 276 118 Q 280 103 284 115 Q 288 100 292 112 Q 295 105 298 118 Q 285 122 268 125 Z" fill="#DD2020" stroke="#AA1010" stroke-width="1"/>
  <!-- Wattles -->
  <ellipse cx="268" cy="175" rx="10" ry="14" fill="#DD3030" stroke="#AA1010" stroke-width="1"/>
  <ellipse cx="280" cy="178" rx="10" ry="14" fill="#DD3030" stroke="#AA1010" stroke-width="1"/>
  <!-- Beak -->
  <path d="M 242 158 L 230 165 L 242 172" fill="#E8C060" stroke="#C09040" stroke-width="1"/>
  <!-- Eye -->
  <circle cx="262" cy="156" r="7" fill="#CC8800"/>
  <circle cx="262" cy="156" r="4" fill="#553300"/>
  <circle cx="264" cy="154" r="1.5" fill="#FFFFFF" opacity="0.7"/>
  <!-- Earlobes (white for leghorn) -->
  <ellipse cx="255" cy="165" rx="7" ry="9" fill="#F0EDE0" stroke="#C8C0A0" stroke-width="1"/>

  <!-- Tail feathers -->
  <path d="M 465 240 Q 510 215 525 198 Q 518 225 525 242 Q 505 232 512 252 Q 490 242 495 260" fill="#E0DCB0" stroke="#A89860" stroke-width="1.2"/>

  <!-- Legs -->
  <line x1="330" y1="358" x2="316" y2="415" stroke="#D4A820" stroke-width="7"/>
  <line x1="390" y1="362" x2="404" y2="415" stroke="#D4A820" stroke-width="7"/>
  <!-- Feet -->
  <line x1="316" y1="415" x2="295" y2="428" stroke="#D4A820" stroke-width="4"/>
  <line x1="316" y1="415" x2="316" y2="432" stroke="#D4A820" stroke-width="4"/>
  <line x1="316" y1="415" x2="336" y2="428" stroke="#D4A820" stroke-width="4"/>
  <line x1="404" y1="415" x2="383" y2="428" stroke="#D4A820" stroke-width="4"/>
  <line x1="404" y1="415" x2="404" y2="432" stroke="#D4A820" stroke-width="4"/>
  <line x1="404" y1="415" x2="424" y2="428" stroke="#D4A820" stroke-width="4"/>

  <!-- Pubic bones area indicator -->
  <ellipse cx="430" cy="340" rx="15" ry="10" fill="none" stroke="#2255AA" stroke-width="2" stroke-dasharray="3,2"/>
  <line class="line" x1="445" y1="340" x2="510" y2="340"/>
  <text class="label-bold" x="514" y="337">Pubic bones</text>
  <text class="note" x="514" y="350">2+ finger-widths = active layer</text>

  <!-- Feather quality indicator -->
  <line class="line" x1="360" y1="240" x2="360" y2="185"/>
  <line class="line" x1="360" y1="185" x2="530" y2="185"/>
  <text class="label-bold" x="534" y="182">Full feather coverage</text>
  <text class="note" x="534" y="195">Tight, clean — healthy indicator</text>

  <!-- Comb indicator -->
  <line class="line" x1="290" y1="113" x2="380" y2="90"/>
  <text class="label-bold" x="384" y="87">Bright red, firm comb</text>
  <text class="note" x="384" y="100">Pale = health problem; blue = circulation failure</text>

  <!-- Eye indicator -->
  <line class="line" x1="256" y1="150" x2="180" y2="115"/>
  <text class="label-bold" x="100" y="112">Clear, bright eye</text>
  <text class="note" x="100" y="125">Copper-red iris — healthy</text>

  <!-- Wattle indicator -->
  <line class="line" x1="270" y1="190" x2="140" y2="210"/>
  <text class="label-bold" x="70" y="207">Red wattles</text>
  <text class="note" x="70" y="220">Warm to touch — normal</text>

  <!-- Body condition (keel) -->
  <line class="line" x1="330" y1="310" x2="180" y2="340"/>
  <text class="label-bold" x="70" y="337">Keel check</text>
  <text class="note" x="70" y="350">Moderate tissue over breastbone — good body condition</text>

  <!-- Alert posture label -->
  <text class="label-bold" x="380" y="450" text-anchor="middle">Commercial White Leghorn Laying Hen — Key External Health Indicators</text>
  <text class="note" x="380" y="465" text-anchor="middle">Upright posture, alert eye, and active red comb are the first signs to observe during a barn walk</text>
</svg>`;

// ============================================================
// FIGURE 7.1 — FEED PARTICLE SIZE AND GRIT
// ============================================================
const feedGritSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="420" viewBox="0 0 760 420">
  <defs>
    <style>
      .bg { fill: #F8F6F0; }
      .title { font-family: Calibri, Arial, sans-serif; font-size: 17px; font-weight: bold; fill: #1F3864; }
      .label { font-family: Calibri, Arial, sans-serif; font-size: 13px; fill: #333; }
      .label-bold { font-family: Calibri, Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #1F3864; }
      .note { font-family: Calibri, Arial, sans-serif; font-size: 11.5px; fill: #555; }
      .border { fill: none; stroke: #C9A84C; stroke-width: 2; }
    </style>
  </defs>
  <rect class="bg" width="760" height="420" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="412" rx="6"/>

  <!-- Title -->
  <text class="title" x="380" y="34" text-anchor="middle">Feed Particle Size and Insoluble Grit</text>
  <text class="note" x="380" y="50" text-anchor="middle" style="font-size:12px;">Left: commercial broiler crumble feed. Right: coarse insoluble limestone grit. The gizzard requires mechanical challenge to develop properly.</text>

  <!-- Wooden surface background -->
  <rect x="30" y="65" width="700" height="290" rx="6" fill="#C8A878" fill-opacity="0.4" stroke="#A08050" stroke-width="1"/>
  <!-- Wood grain lines -->
  <line x1="30" y1="100" x2="730" y2="100" stroke="#A07040" stroke-width="0.6" opacity="0.3"/>
  <line x1="30" y1="140" x2="730" y2="140" stroke="#A07040" stroke-width="0.6" opacity="0.3"/>
  <line x1="30" y1="180" x2="730" y2="180" stroke="#A07040" stroke-width="0.6" opacity="0.3"/>
  <line x1="30" y1="220" x2="730" y2="220" stroke="#A07040" stroke-width="0.6" opacity="0.3"/>
  <line x1="30" y1="260" x2="730" y2="260" stroke="#A07040" stroke-width="0.6" opacity="0.3"/>
  <line x1="30" y1="300" x2="730" y2="300" stroke="#A07040" stroke-width="0.6" opacity="0.3"/>

  <!-- DIVIDING LINE -->
  <line x1="380" y1="65" x2="380" y2="355" stroke="#888" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text class="label-bold" x="197" y="82" text-anchor="middle">Broiler Crumble Feed</text>
  <text class="label-bold" x="557" y="82" text-anchor="middle">Insoluble Limestone Grit</text>

  <!-- ============================================================ -->
  <!-- LEFT: CRUMBLE FEED PELLETS -->
  <!-- Many small, irregular brown/tan particles -->
  <!-- Row 1 -->
  <ellipse cx="80"  cy="115" rx="9"  ry="6"  fill="#C8933A" stroke="#9A6820" stroke-width="0.8" transform="rotate(-15,80,115)"/>
  <ellipse cx="105" cy="108" rx="8"  ry="5"  fill="#B87830" stroke="#8A5818" stroke-width="0.8" transform="rotate(20,105,108)"/>
  <ellipse cx="128" cy="120" rx="10" ry="6"  fill="#C89040" stroke="#9A6828" stroke-width="0.8" transform="rotate(-8,128,120)"/>
  <ellipse cx="155" cy="110" rx="8"  ry="5"  fill="#B87028" stroke="#8A5018" stroke-width="0.8" transform="rotate(12,155,110)"/>
  <ellipse cx="180" cy="122" rx="9"  ry="6"  fill="#CC9840" stroke="#9A7030" stroke-width="0.8" transform="rotate(-5,180,122)"/>
  <ellipse cx="205" cy="112" rx="8"  ry="5"  fill="#B87830" stroke="#8A5820" stroke-width="0.8" transform="rotate(18,205,112)"/>
  <ellipse cx="230" cy="118" rx="9"  ry="6"  fill="#C89038" stroke="#9A6820" stroke-width="0.8" transform="rotate(-12,230,118)"/>
  <ellipse cx="255" cy="108" rx="8"  ry="5"  fill="#BE8030" stroke="#8E6020" stroke-width="0.8" transform="rotate(8,255,108)"/>
  <ellipse cx="280" cy="120" rx="9"  ry="6"  fill="#C89040" stroke="#9A6830" stroke-width="0.8" transform="rotate(-20,280,120)"/>
  <ellipse cx="305" cy="112" rx="8"  ry="5"  fill="#B87028" stroke="#8A5018" stroke-width="0.8" transform="rotate(15,305,112)"/>
  <ellipse cx="340" cy="118" rx="9"  ry="6"  fill="#CC9840" stroke="#9A7028" stroke-width="0.8" transform="rotate(-10,340,118)"/>
  <!-- Row 2 -->
  <ellipse cx="70"  cy="148" rx="8"  ry="5"  fill="#B88030" stroke="#8A5820" stroke-width="0.8" transform="rotate(22,70,148)"/>
  <ellipse cx="92"  cy="155" rx="10" ry="6"  fill="#C89040" stroke="#9A6828" stroke-width="0.8" transform="rotate(-8,92,155)"/>
  <ellipse cx="118" cy="143" rx="9"  ry="6"  fill="#C89038" stroke="#9A6820" stroke-width="0.8" transform="rotate(5,118,143)"/>
  <ellipse cx="145" cy="158" rx="8"  ry="5"  fill="#BE8030" stroke="#8E6020" stroke-width="0.8" transform="rotate(-18,145,158)"/>
  <ellipse cx="170" cy="148" rx="9"  ry="6"  fill="#C89040" stroke="#9A6830" stroke-width="0.8" transform="rotate(12,170,148)"/>
  <ellipse cx="198" cy="158" rx="8"  ry="5"  fill="#B87830" stroke="#8A5818" stroke-width="0.8" transform="rotate(-6,198,158)"/>
  <ellipse cx="225" cy="145" rx="10" ry="6"  fill="#CC9840" stroke="#9A7028" stroke-width="0.8" transform="rotate(20,225,145)"/>
  <ellipse cx="252" cy="158" rx="9"  ry="6"  fill="#C89038" stroke="#9A6820" stroke-width="0.8" transform="rotate(-14,252,158)"/>
  <ellipse cx="278" cy="148" rx="8"  ry="5"  fill="#B87028" stroke="#8A5018" stroke-width="0.8" transform="rotate(8,278,148)"/>
  <ellipse cx="305" cy="158" rx="9"  ry="6"  fill="#C89040" stroke="#9A6830" stroke-width="0.8" transform="rotate(-22,305,158)"/>
  <ellipse cx="335" cy="148" rx="8"  ry="5"  fill="#BE8030" stroke="#8E6020" stroke-width="0.8" transform="rotate(16,335,148)"/>
  <!-- Rows 3-6: more crumble particles -->
  <ellipse cx="80"  cy="190" rx="9" ry="6" fill="#C89040" stroke="#9A6828" stroke-width="0.8" transform="rotate(-10,80,190)"/>
  <ellipse cx="108" cy="198" rx="8" ry="5" fill="#B87830" stroke="#8A5818" stroke-width="0.8" transform="rotate(18,108,198)"/>
  <ellipse cx="135" cy="185" rx="10" ry="6" fill="#CC9840" stroke="#9A7028" stroke-width="0.8" transform="rotate(-5,135,185)"/>
  <ellipse cx="162" cy="200" rx="9" ry="6" fill="#C89038" stroke="#9A6820" stroke-width="0.8" transform="rotate(12,162,200)"/>
  <ellipse cx="190" cy="188" rx="8" ry="5" fill="#BE8030" stroke="#8E6020" stroke-width="0.8" transform="rotate(-20,190,188)"/>
  <ellipse cx="218" cy="200" rx="9" ry="6" fill="#C89040" stroke="#9A6830" stroke-width="0.8" transform="rotate(6,218,200)"/>
  <ellipse cx="245" cy="190" rx="8" ry="5" fill="#B87028" stroke="#8A5018" stroke-width="0.8" transform="rotate(-14,245,190)"/>
  <ellipse cx="272" cy="200" rx="9" ry="6" fill="#C89040" stroke="#9A6828" stroke-width="0.8" transform="rotate(22,272,200)"/>
  <ellipse cx="300" cy="188" rx="10" ry="6" fill="#CC9840" stroke="#9A7028" stroke-width="0.8" transform="rotate(-8,300,188)"/>
  <ellipse cx="335" cy="195" rx="8" ry="5" fill="#B87830" stroke="#8A5818" stroke-width="0.8" transform="rotate(10,335,195)"/>
  <!-- More rows -->
  <ellipse cx="90"  cy="232" rx="9" ry="6" fill="#C89038" stroke="#9A6820" stroke-width="0.8" transform="rotate(-16,90,232)"/>
  <ellipse cx="118" cy="240" rx="8" ry="5" fill="#BE8030" stroke="#8E6020" stroke-width="0.8" transform="rotate(5,118,240)"/>
  <ellipse cx="145" cy="228" rx="9" ry="6" fill="#C89040" stroke="#9A6830" stroke-width="0.8" transform="rotate(-22,145,228)"/>
  <ellipse cx="172" cy="242" rx="10" ry="6" fill="#B87028" stroke="#8A5018" stroke-width="0.8" transform="rotate(18,172,242)"/>
  <ellipse cx="200" cy="230" rx="8" ry="5" fill="#C89040" stroke="#9A6828" stroke-width="0.8" transform="rotate(-6,200,230)"/>
  <ellipse cx="228" cy="242" rx="9" ry="6" fill="#CC9840" stroke="#9A7028" stroke-width="0.8" transform="rotate(14,228,242)"/>
  <ellipse cx="255" cy="232" rx="8" ry="5" fill="#B87830" stroke="#8A5818" stroke-width="0.8" transform="rotate(-10,255,232)"/>
  <ellipse cx="283" cy="240" rx="9" ry="6" fill="#C89038" stroke="#9A6820" stroke-width="0.8" transform="rotate(20,283,240)"/>
  <ellipse cx="312" cy="230" rx="8" ry="5" fill="#BE8030" stroke="#8E6020" stroke-width="0.8" transform="rotate(-18,312,230)"/>
  <ellipse cx="342" cy="238" rx="9" ry="6" fill="#C89040" stroke="#9A6830" stroke-width="0.8" transform="rotate(8,342,238)"/>

  <!-- SIZE INDICATOR for crumble -->
  <line x1="55" y1="285" x2="95" y2="285" stroke="#555" stroke-width="1.5"/>
  <line x1="55" y1="280" x2="55" y2="290" stroke="#555" stroke-width="1.5"/>
  <line x1="95" y1="280" x2="95" y2="290" stroke="#555" stroke-width="1.5"/>
  <text class="note" x="75" y="300" text-anchor="middle">2–4 mm</text>
  <text class="note" x="75" y="313" text-anchor="middle">crumble</text>

  <!-- ============================================================ -->
  <!-- RIGHT: LIMESTONE GRIT (larger, white/gray irregular chunks) -->
  <!-- Fewer, larger, white/cream/gray particles -->
  <polygon points="410,105 425,95 445,108 440,125 420,128" fill="#E8E8DC" stroke="#B0A888" stroke-width="1.5"/>
  <polygon points="455,110 475,98 492,112 488,135 460,138" fill="#D8D8CC" stroke="#A0A090" stroke-width="1.5"/>
  <polygon points="502,100 525,90 545,108 538,130 510,132" fill="#E0E0D0" stroke="#A8A898" stroke-width="1.5"/>
  <polygon points="555,112 578,98 598,115 592,138 560,140" fill="#E8E8DC" stroke="#B0A888" stroke-width="1.5"/>
  <polygon points="608,102 632,90 652,108 646,132 612,135" fill="#D8D8CC" stroke="#A0A090" stroke-width="1.5"/>
  <polygon points="662,108 688,95 710,112 705,136 668,140" fill="#E0E0D0" stroke="#A8A898" stroke-width="1.5"/>
  <!-- Row 2 grit -->
  <polygon points="395,148 418,135 438,152 432,175 400,178" fill="#E0E0D0" stroke="#A8A898" stroke-width="1.5"/>
  <polygon points="445,145 470,132 492,150 486,175 450,178" fill="#E8E8DC" stroke="#B0A888" stroke-width="1.5"/>
  <polygon points="502,152 528,138 550,156 543,182 508,185" fill="#D8D8CC" stroke="#A0A090" stroke-width="1.5"/>
  <polygon points="560,145 585,132 608,150 601,175 565,178" fill="#E0E0D0" stroke="#A8A898" stroke-width="1.5"/>
  <polygon points="618,150 645,136 668,154 661,180 622,183" fill="#E8E8DC" stroke="#B0A888" stroke-width="1.5"/>
  <polygon points="678,145 705,132 725,150 718,175 682,178" fill="#D8D8CC" stroke="#A0A090" stroke-width="1.5"/>
  <!-- Row 3 grit -->
  <polygon points="405,198 430,185 452,202 445,228 408,231" fill="#E8E8DC" stroke="#B0A888" stroke-width="1.5"/>
  <polygon points="462,205 488,190 510,208 504,233 466,236" fill="#D8D8CC" stroke="#A0A090" stroke-width="1.5"/>
  <polygon points="520,198 548,185 570,202 563,228 525,232" fill="#E0E0D0" stroke="#A8A898" stroke-width="1.5"/>
  <polygon points="580,205 606,190 628,208 622,235 584,238" fill="#E8E8DC" stroke="#B0A888" stroke-width="1.5"/>
  <polygon points="638,200 665,186 688,204 681,230 642,234" fill="#D8D8CC" stroke="#A0A090" stroke-width="1.5"/>
  <!-- Row 4 grit -->
  <polygon points="420,250 446,235 468,253 462,278 424,282" fill="#E0E0D0" stroke="#A8A898" stroke-width="1.5"/>
  <polygon points="480,248 508,233 532,251 526,278 484,282" fill="#E8E8DC" stroke="#B0A888" stroke-width="1.5"/>
  <polygon points="545,252 574,237 598,255 590,282 550,286" fill="#D8D8CC" stroke="#A0A090" stroke-width="1.5"/>
  <polygon points="610,248 638,234 662,252 655,278 614,282" fill="#E0E0D0" stroke="#A8A898" stroke-width="1.5"/>
  <polygon points="672,252 700,236 722,254 715,280 676,284" fill="#E8E8DC" stroke="#B0A888" stroke-width="1.5"/>

  <!-- SIZE INDICATOR for grit -->
  <line x1="410" y1="305" x2="465" y2="305" stroke="#555" stroke-width="1.5"/>
  <line x1="410" y1="300" x2="410" y2="310" stroke="#555" stroke-width="1.5"/>
  <line x1="465" y1="300" x2="465" y2="310" stroke="#555" stroke-width="1.5"/>
  <text class="note" x="437" y="320" text-anchor="middle">8–15 mm</text>
  <text class="note" x="437" y="333" text-anchor="middle">insoluble grit</text>

  <!-- ============================================================ -->
  <!-- EXPLANATORY NOTES -->
  <!-- ============================================================ -->
  <rect x="30" y="360" width="700" height="50" rx="5" fill="#FFF8E8" stroke="#C9A84C" stroke-width="1.5"/>
  <text class="label-bold" x="380" y="378" text-anchor="middle">Why it matters</text>
  <text class="note" x="380" y="393" text-anchor="middle">Coarser feed particles and insoluble grit challenge the gizzard to develop its full grinding capacity. A well-developed gizzard reduces feed particles to below 0.1 mm.</text>
  <text class="note" x="380" y="406" text-anchor="middle">Providing insoluble grit in the first 10–14 days of brooding improves gizzard development and feed conversion for the rest of the grow-out.</text>
</svg>`;

// ============================================================
// RENDER ALL FIVE
// ============================================================
console.log('Rendering anatomy diagrams...');
render(digestiveSVG,  'figure_3_1_digestive.png');
render(airSacSVG,     'figure_3_2_air_sacs.png');
render(oviductSVG,    'figure_3_3_oviduct.png');
render(layerHenSVG,   'figure_5_1_layer_hen.png');
render(feedGritSVG,   'figure_7_1_feed_grit.png');
console.log('\nAll diagrams complete. Files saved to Course 6/');
