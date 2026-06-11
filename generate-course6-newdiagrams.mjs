// ============================================================
// generate-course6-newdiagrams.mjs
// Reviewer-requested diagrams for Course 6:
//   - Lower (back half) digestive tract        -> figure_3_2_lower_digestive.png
//   - Female reproductive tract (oviduct)       -> figure_3_4_repro_tract.png
//   - Urinary system (kidneys / uric acid)      -> figure_3_5_urinary.png
//   - Immune system organs (vaccination tie-in) -> figure_3_6_immune.png
// House style matches generate-course6-diagrams.mjs
// Run: node generate-course6-newdiagrams.mjs
// ============================================================
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'Course 6');

function render(svgStr, filename) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'original' } });
  const buf   = resvg.render().asPng();
  fs.writeFileSync(path.join(OUT, filename), buf);
  console.log('✓', filename, `(${(buf.length / 1024).toFixed(0)} KB)`);
}

// Shared style block
const STYLE = `
  .bg { fill: #FAFAFA; }
  .border { fill: none; stroke: #C9A84C; stroke-width: 2; }
  .title { font-family: Calibri, Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #1F3864; }
  .subtitle { font-family: Calibri, Arial, sans-serif; font-size: 12px; fill: #555; }
  .label { font-family: Calibri, Arial, sans-serif; font-size: 13px; fill: #222; }
  .label-bold { font-family: Calibri, Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #1F3864; }
  .small { font-family: Calibri, Arial, sans-serif; font-size: 11px; fill: #666; }
  .lead { stroke: #7A5C2E; stroke-width: 1.1; fill: none; stroke-dasharray: 4,3; }
`;

// ============================================================
// FIGURE 3.2 — LOWER (BACK HALF) DIGESTIVE TRACT
// ============================================================
const lowerDigestiveSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520">
  <defs>
    <style>${STYLE}
      .gut { fill: #E9C9A0; stroke: #9A6B3C; stroke-width: 2; }
      .gut2 { fill: #D8E8B0; stroke: #5A8A2A; stroke-width: 2; }
      .tube { stroke: #C99A66; stroke-width: 12; fill: none; stroke-linecap: round; }
    </style>
    <marker id="aH" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#7A5C2E"/></marker>
  </defs>
  <rect class="bg" width="760" height="520" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="512" rx="6"/>
  <text class="title" x="380" y="34" text-anchor="middle">The Lower Digestive Tract (Back Half)</text>
  <text class="subtitle" x="380" y="53" text-anchor="middle">From the gizzard outlet to the vent. This is where most nutrients are absorbed and droppings take their final form.</text>

  <!-- Entry from gizzard -->
  <path class="tube" d="M 150 110 L 200 110"/>
  <text class="small" x="150" y="100">from gizzard →</text>

  <!-- Duodenal loop (with pancreas inside) -->
  <path d="M 200 110 Q 290 95 300 150 Q 305 200 230 200 Q 180 200 200 150 Q 210 120 200 110 Z" class="gut"/>
  <ellipse cx="248" cy="150" rx="34" ry="14" fill="#F0D58A" stroke="#C49A30" stroke-width="1.5"/>
  <text class="small" x="248" y="154" text-anchor="middle" style="font-weight:bold;fill:#7A5A10;">pancreas</text>

  <!-- Jejunum + ileum coils -->
  <path d="M 250 205 Q 330 215 320 260 Q 310 300 250 295 Q 200 290 230 330 Q 260 365 340 350" fill="none" stroke="#E9C9A0" stroke-width="20" stroke-linecap="round"/>
  <path d="M 250 205 Q 330 215 320 260 Q 310 300 250 295 Q 200 290 230 330 Q 260 365 340 350" fill="none" stroke="#9A6B3C" stroke-width="1.5"/>

  <!-- Ileo-cecal junction -->
  <circle cx="345" cy="350" r="8" fill="#C99A66" stroke="#9A6B3C" stroke-width="1.5"/>

  <!-- Two ceca (paired blind pouches) -->
  <path d="M 345 350 Q 300 380 300 430 Q 300 455 318 455 Q 332 455 332 430 Q 332 390 360 360" class="gut2"/>
  <path d="M 350 352 Q 395 382 398 432 Q 398 457 380 457 Q 366 457 366 432 Q 366 392 360 362" class="gut2"/>

  <!-- Colon / rectum -->
  <path class="tube" d="M 348 350 Q 420 350 450 380" />
  <path d="M 348 350 Q 420 350 450 380" fill="none" stroke="#B07A40" stroke-width="1.2"/>

  <!-- Cloaca -->
  <ellipse cx="470" cy="405" rx="34" ry="26" fill="#CBA06A" stroke="#8A5A30" stroke-width="2"/>
  <text class="small" x="470" y="402" text-anchor="middle" style="font-weight:bold;fill:#FFF;">CLOACA</text>
  <text class="small" x="470" y="415" text-anchor="middle" style="fill:#FFF8E8;">3 compartments</text>
  <!-- Vent -->
  <path d="M 500 415 Q 520 418 528 412" stroke="#8A5A30" stroke-width="6" fill="none" stroke-linecap="round"/>
  <text class="small" x="538" y="416">vent</text>

  <!-- Droppings out -->
  <path d="M 470 432 L 470 460" stroke="#7A5C2E" stroke-width="2" marker-end="url(#aH)" fill="none"/>
  <ellipse cx="470" cy="478" rx="20" ry="12" fill="#6B5230"/>
  <ellipse cx="470" cy="471" rx="13" ry="6" fill="#F2F2EA" stroke="#CFCFC0" stroke-width="0.8"/>
  <text class="small" x="498" y="482">normal dropping</text>

  <!-- LABELS (right column) -->
  <line class="lead" x1="298" y1="150" x2="560" y2="120"/>
  <text class="label-bold" x="564" y="116">Duodenum</text>
  <text class="small" x="564" y="130">Bile and enzymes enter here.</text>

  <line class="lead" x1="320" y1="260" x2="560" y2="170"/>
  <text class="label-bold" x="564" y="166">Jejunum &amp; ileum</text>
  <text class="small" x="564" y="180">Villi absorb nutrients to blood.</text>
  <text class="small" x="564" y="194">Damage here = lost feed.</text>

  <line class="lead" x1="332" y1="430" x2="560" y2="250"/>
  <text class="label-bold" x="564" y="246">Ceca (×2)</text>
  <text class="small" x="564" y="260">Ferment fiber, reclaim water, make</text>
  <text class="small" x="564" y="274">B vitamins. Empty as dark, pasty</text>
  <text class="small" x="564" y="288">cecal droppings 1–2× a day.</text>
  <text class="small" x="564" y="302">Normal, not diarrhea.</text>

  <line class="lead" x1="445" y1="375" x2="560" y2="335"/>
  <text class="label-bold" x="564" y="331">Colon (rectum)</text>
  <text class="small" x="564" y="345">Short. Final water reabsorption.</text>

  <line class="lead" x1="504" y1="405" x2="560" y2="378"/>
  <text class="label-bold" x="564" y="374">Cloaca</text>
  <text class="small" x="564" y="388">Shared exit for gut, kidneys,</text>
  <text class="small" x="564" y="402">and reproductive tract.</text>

  <line x1="40" y1="498" x2="720" y2="498" stroke="#C9A84C" stroke-width="1"/>
  <text class="subtitle" x="380" y="513" text-anchor="middle">The white cap on a normal dropping is urine (uric acid) from the kidneys. The darker portion is feces from the gut.</text>
</svg>`;

// ============================================================
// FIGURE 3.4 — FEMALE REPRODUCTIVE TRACT (OVIDUCT IN SITU)
// ============================================================
const reproTractSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520">
  <defs>
    <style>${STYLE}
      .ovi { fill: #FBE6B8; stroke: #C49030; stroke-width: 2; }
      .ovi-d { fill: #F4D79A; stroke: #B07820; stroke-width: 2; }
      .shell { fill: #CFE8C4; stroke: #3A8A40; stroke-width: 2.5; }
    </style>
    <marker id="aR" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#555"/></marker>
  </defs>
  <rect class="bg" width="760" height="520" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="512" rx="6"/>
  <text class="title" x="380" y="34" text-anchor="middle">The Hen's Reproductive Tract</text>
  <text class="subtitle" x="380" y="53" text-anchor="middle">Only the LEFT ovary and oviduct work. The egg is built as it travels down the tract. Total time: about 25–26 hours.</text>

  <!-- OVARY with follicle hierarchy -->
  <ellipse cx="150" cy="150" rx="20" ry="26" fill="#F6C46A" stroke="#B8841E" stroke-width="1.5"/>
  <circle cx="138" cy="128" r="20" fill="#FFC23A" stroke="#C8881C" stroke-width="1.5"/>
  <circle cx="172" cy="135" r="15" fill="#FFCB54" stroke="#C8881C" stroke-width="1.5"/>
  <circle cx="160" cy="170" r="11" fill="#FFD877" stroke="#C8881C" stroke-width="1.5"/>
  <circle cx="132" cy="162" r="8"  fill="#FFE08C" stroke="#C8881C" stroke-width="1.2"/>
  <text class="label-bold" x="150" y="208" text-anchor="middle">Ovary</text>
  <text class="small" x="150" y="222" text-anchor="middle">Yolks (follicles) ripen</text>
  <text class="small" x="150" y="236" text-anchor="middle">in order of size</text>

  <!-- Infundibulum (funnel) -->
  <path d="M 188 130 Q 230 110 255 140 L 240 160 Q 215 140 192 150 Z" class="ovi"/>
  <line class="lead" x1="238" y1="128" x2="300" y2="95"/>
  <text class="label-bold" x="304" y="92">Infundibulum</text>
  <text class="small" x="304" y="106">Catches the yolk. Fertilization happens here.</text>
  <text class="small" x="304" y="120">15–17 min.</text>

  <!-- Magnum (long, folded) -->
  <path d="M 250 150 Q 320 165 300 215 Q 285 255 235 245 Q 200 238 235 285" fill="none" stroke="#FBE6B8" stroke-width="26" stroke-linecap="round"/>
  <path d="M 250 150 Q 320 165 300 215 Q 285 255 235 245 Q 200 238 235 285" fill="none" stroke="#C49030" stroke-width="1.5"/>
  <line class="lead" x1="305" y1="200" x2="430" y2="150"/>
  <text class="label-bold" x="434" y="147">Magnum</text>
  <text class="small" x="434" y="161">Thick egg white (albumen) added. ~3 hours.</text>

  <!-- Isthmus -->
  <path d="M 235 285 Q 270 300 300 300" fill="none" stroke="#F4D79A" stroke-width="20" stroke-linecap="round"/>
  <line class="lead" x1="280" y1="300" x2="430" y2="195"/>
  <text class="label-bold" x="434" y="192">Isthmus</text>
  <text class="small" x="434" y="206">Two shell membranes form. ~75 min.</text>

  <!-- Shell gland (uterus) -->
  <ellipse cx="345" cy="320" rx="46" ry="38" class="shell"/>
  <ellipse cx="345" cy="320" rx="26" ry="32" fill="#FFF6DA" stroke="#E2C880" stroke-width="1.5"/>
  <ellipse cx="345" cy="322" rx="13" ry="15" fill="#FFC23A" stroke="#C8881C" stroke-width="1"/>
  <text class="small" x="345" y="372" text-anchor="middle" style="font-weight:bold;fill:#2E6A30;">egg</text>
  <line class="lead" x1="391" y1="320" x2="470" y2="300"/>
  <text class="label-bold" x="474" y="296">Shell gland (uterus)</text>
  <text class="small" x="474" y="310">Calcium shell laid down, mostly overnight.</text>
  <text class="small" x="474" y="324">20+ hours. ~2 g of calcium per shell.</text>

  <!-- Vagina + cloaca -->
  <path d="M 345 358 Q 345 400 380 415" fill="none" stroke="#E0F0C8" stroke-width="18" stroke-linecap="round"/>
  <path d="M 345 358 Q 345 400 380 415" fill="none" stroke="#4A8030" stroke-width="1.2"/>
  <ellipse cx="405" cy="425" rx="30" ry="22" fill="#D8E8F0" stroke="#3A6A80" stroke-width="2"/>
  <text class="small" x="405" y="429" text-anchor="middle" style="font-weight:bold;fill:#2A5060;">cloaca</text>
  <line class="lead" x1="380" y1="400" x2="474" y2="360"/>
  <text class="label-bold" x="478" y="356">Vagina &amp; bloom</text>
  <text class="small" x="478" y="370">Cuticle (bloom) seals the pores.</text>
  <text class="small" x="478" y="384">Egg is laid large-end-first. Minutes.</text>

  <!-- Laid egg -->
  <ellipse cx="455" cy="460" rx="22" ry="28" fill="#FFEFC4" stroke="#C8A020" stroke-width="2"/>
  <text class="small" x="495" y="464">egg laid</text>

  <!-- Calcium / light callouts (bottom-left, clear of the tract) -->
  <rect x="44" y="350" width="280" height="46" rx="6" fill="#FFF0F0" stroke="#CC4444" stroke-width="1.5"/>
  <text class="small" x="184" y="368" text-anchor="middle" style="font-weight:bold;fill:#AA2222;">Calcium cost</text>
  <text class="small" x="184" y="383" text-anchor="middle">20–40% of each shell comes from the hen's bone overnight.</text>

  <rect x="44" y="404" width="280" height="46" rx="6" fill="#FFF8E8" stroke="#C9A84C" stroke-width="1.5"/>
  <text class="small" x="184" y="422" text-anchor="middle" style="font-weight:bold;fill:#7A4A00;">Light triggers laying</text>
  <text class="small" x="184" y="437" text-anchor="middle">Ovulation rarely after 3 PM. 14–16 h light holds production.</text>
</svg>`;

// ============================================================
// FIGURE 3.5 — URINARY SYSTEM (KIDNEYS / URIC ACID)
// ============================================================
const urinarySVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="500" viewBox="0 0 760 500">
  <defs>
    <style>${STYLE}
      .kidney { fill: #9A4A3C; stroke: #5A2820; stroke-width: 2; }
      .ureter { stroke: #E8B84C; stroke-width: 6; fill: none; stroke-linecap: round; }
      .spine { fill: #E8E4D6; stroke: #B8B098; stroke-width: 1.5; }
    </style>
    <marker id="aU" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#2255AA"/></marker>
  </defs>
  <rect class="bg" width="760" height="500" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="488" rx="6"/>
  <text class="title" x="380" y="34" text-anchor="middle">The Urinary System: Kidneys and Uric Acid</text>
  <text class="subtitle" x="380" y="53" text-anchor="middle">Birds have no bladder. They get rid of nitrogen as uric acid, the white paste on top of a normal dropping.</text>

  <!-- Backbone -->
  <rect class="spine" x="195" y="90" width="30" height="300" rx="8"/>
  <text class="small" x="210" y="84" text-anchor="middle">backbone / pelvis</text>

  <!-- Left kidney (3 lobes) -->
  <path d="M 165 100 Q 150 130 158 160 Q 145 195 156 230 Q 145 265 160 300 Q 175 300 188 288 L 188 110 Q 178 100 165 100 Z" class="kidney"/>
  <text class="small" x="120" y="200" style="fill:#FFF;font-weight:bold;" transform="rotate(-90,120,200)" text-anchor="middle">LEFT KIDNEY (3 lobes)</text>
  <!-- Right kidney (3 lobes) -->
  <path d="M 255 100 Q 270 130 262 160 Q 275 195 264 230 Q 275 265 260 300 Q 245 300 232 288 L 232 110 Q 242 100 255 100 Z" class="kidney"/>

  <!-- Ureters -->
  <path class="ureter" d="M 178 300 Q 195 340 210 360"/>
  <path class="ureter" d="M 242 300 Q 225 340 210 360"/>
  <text class="small" x="150" y="335" style="fill:#A87A10;font-weight:bold;">ureters</text>

  <!-- Cloaca -->
  <ellipse cx="210" cy="385" rx="34" ry="24" fill="#CBA06A" stroke="#8A5A30" stroke-width="2"/>
  <text class="small" x="210" y="389" text-anchor="middle" style="fill:#FFF;font-weight:bold;">CLOACA</text>

  <!-- Water reclaim arrow (backward into gut) -->
  <path d="M 235 380 Q 290 372 300 350" stroke="#2255AA" stroke-width="2" fill="none" marker-end="url(#aU)" stroke-dasharray="5,3"/>
  <text class="small" x="305" y="350" style="fill:#2255AA;">water moved back into gut and reclaimed</text>

  <!-- Dropping out -->
  <path d="M 210 410 L 210 432" stroke="#7A5C2E" stroke-width="2" marker-end="url(#aU)" fill="none"/>
  <ellipse cx="210" cy="455" rx="26" ry="15" fill="#6B5230"/>
  <ellipse cx="210" cy="446" rx="17" ry="8" fill="#F2F2EA" stroke="#CFCFC0" stroke-width="1"/>
  <line class="lead" x1="232" y1="446" x2="300" y2="438"/>
  <text class="label-bold" x="304" y="435">White urate cap = "urine"</text>
  <text class="small" x="304" y="449">Uric acid, not watery pee. Dark part below is feces.</text>

  <!-- RIGHT COLUMN facts -->
  <line class="lead" x1="262" y1="160" x2="430" y2="110"/>
  <text class="label-bold" x="434" y="107">Two kidneys, tucked against the backbone</text>
  <text class="small" x="434" y="121">Reddish-brown, three lobes each, set into the pelvic bones,</text>
  <text class="small" x="434" y="135">right behind the lungs. You only see them at necropsy.</text>

  <line class="lead" x1="230" y1="240" x2="430" y2="175"/>
  <text class="label-bold" x="434" y="172">No bladder</text>
  <text class="small" x="434" y="186">Birds do not store urine. Ureters run straight to the cloaca.</text>

  <!-- Gout warning box -->
  <rect x="430" y="210" width="300" height="120" rx="6" fill="#FFF0F0" stroke="#CC4444" stroke-width="1.5"/>
  <text class="label-bold" x="580" y="230" text-anchor="middle" style="fill:#AA2222;">When it backs up: GOUT</text>
  <text class="small" x="444" y="250">If the kidneys cannot keep up, the bird is short of water,</text>
  <text class="small" x="444" y="265">or non-laying birds get a high-calcium layer ration, uric</text>
  <text class="small" x="444" y="280">acid builds up in the blood and crystallizes out as chalky</text>
  <text class="small" x="444" y="295">white deposits: on the organs (visceral gout) or in the</text>
  <text class="small" x="444" y="310">joints (articular gout). At necropsy it looks like the heart</text>
  <text class="small" x="444" y="325">and liver were dusted with white chalk.</text>

  <!-- Prevention box -->
  <rect x="430" y="342" width="300" height="74" rx="6" fill="#EAF4EA" stroke="#3A8A40" stroke-width="1.5"/>
  <text class="label-bold" x="580" y="361" text-anchor="middle" style="fill:#2E6A30;">Prevention on the farm</text>
  <text class="small" x="444" y="379">Steady clean water, especially in heat. Do not feed layer</text>
  <text class="small" x="444" y="394">(high-calcium) rations to pullets or non-laying birds. Watch</text>
  <text class="small" x="444" y="409">water lines and keep birds drinking.</text>

  <line x1="40" y1="470" x2="408" y2="470" stroke="#C9A84C" stroke-width="1"/>
  <text class="small" x="224" y="486" text-anchor="middle" style="fill:#555;">Reading droppings: white = kidneys, dark = gut.</text>
</svg>`;

// ============================================================
// FIGURE 3.6 — IMMUNE SYSTEM ORGANS (VACCINATION TIE-IN)
// ============================================================
const immuneSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520">
  <defs>
    <style>${STYLE}
      .body { fill: #F0EDE0; stroke: #BBA888; stroke-width: 1.5; }
      .prim { fill: #BFE0F0; stroke: #2A7AA0; stroke-width: 2; }
      .sec { fill: #CDE8C4; stroke: #3A8A40; stroke-width: 2; }
    </style>
  </defs>
  <rect class="bg" width="760" height="520" rx="8"/>
  <rect class="border" x="4" y="4" width="752" height="512" rx="6"/>
  <text class="title" x="380" y="34" text-anchor="middle">The Immune System: Where Vaccines Do Their Work</text>
  <text class="subtitle" x="380" y="53" text-anchor="middle">Every vaccine and every disease challenge runs through these organs. Most are biggest in young birds.</text>

  <!-- Bird outline (lateral) -->
  <ellipse class="body" cx="300" cy="300" rx="150" ry="105"/>
  <circle class="body" cx="175" cy="215" r="36"/>
  <polygon points="143,208 128,216 143,224" fill="#D4A017" stroke="#A07810" stroke-width="1"/>
  <circle cx="165" cy="210" r="5" fill="#8B4513"/>
  <path d="M 180 250 Q 200 280 215 295" stroke="#BBA888" stroke-width="15" fill="none" stroke-linecap="round"/>
  <line x1="270" y1="402" x2="262" y2="448" stroke="#BBA888" stroke-width="5"/>
  <line x1="335" y1="404" x2="345" y2="448" stroke="#BBA888" stroke-width="5"/>
  <path d="M 430 285 Q 460 268 470 256 Q 463 278 468 292 Q 452 282 456 300" fill="#D8C890" stroke="#9A8A50" stroke-width="1"/>

  <!-- Harderian gland (behind eye) -->
  <ellipse class="sec" cx="188" cy="223" rx="9" ry="7"/>
  <line class="lead" x1="188" y1="223" x2="120" y2="150"/>
  <text class="label-bold" x="40" y="147">Harderian gland</text>
  <text class="small" x="40" y="161">Behind the eye. Spray and eye-drop</text>
  <text class="small" x="40" y="175">vaccines land right where it can act.</text>

  <!-- Thymus (along neck, both sides) -->
  <ellipse class="prim" cx="198" cy="262" rx="7" ry="13"/>
  <ellipse class="prim" cx="210" cy="278" rx="7" ry="13"/>
  <line class="lead" x1="204" y1="270" x2="120" y2="235"/>
  <text class="label-bold" x="40" y="232">Thymus</text>
  <text class="small" x="40" y="246">Strips up both sides of the neck.</text>
  <text class="small" x="40" y="260">Trains T-cells. Shrinks with age.</text>

  <!-- Spleen -->
  <circle class="sec" cx="275" cy="288" r="15"/>
  <line class="lead" x1="275" y1="288" x2="120" y2="320"/>
  <text class="label-bold" x="40" y="317">Spleen</text>
  <text class="small" x="40" y="331">Filters blood. Where defense cells gather.</text>

  <!-- Cecal tonsils (at ceca) -->
  <ellipse class="sec" cx="345" cy="345" rx="11" ry="9"/>
  <line class="lead" x1="345" y1="345" x2="120" y2="395"/>
  <text class="label-bold" x="40" y="392">Cecal tonsils</text>
  <text class="small" x="40" y="406">Immune guard posts at the gut.</text>

  <!-- Bursa of Fabricius (above vent) -->
  <ellipse class="prim" cx="408" cy="330" rx="16" ry="13"/>
  <line class="lead" x1="408" y1="330" x2="500" y2="250"/>
  <text class="label-bold" x="504" y="247">Bursa of Fabricius</text>
  <text class="small" x="504" y="261">A pouch just above the vent. Trains the</text>
  <text class="small" x="504" y="275">B-cells that make antibodies. Found ONLY</text>
  <text class="small" x="504" y="289">in birds, and only in young birds.</text>
  <text class="small" x="504" y="303" style="fill:#AA2222;">Gumboro disease destroys it: wreck the</text>
  <text class="small" x="504" y="317" style="fill:#AA2222;">bursa early and every vaccine works poorly.</text>

  <!-- Legend (top-left, clear of the bird) -->
  <rect x="40" y="74" width="20" height="14" rx="3" class="prim"/>
  <text class="small" x="66" y="85">Primary organs (train new cells): thymus, bursa</text>
  <rect x="40" y="94" width="20" height="14" rx="3" class="sec"/>
  <text class="small" x="66" y="105">Secondary organs (cells stand guard): spleen, cecal tonsils, Harderian gland</text>

  <!-- Maternal antibody / vaccination timing box -->
  <rect x="40" y="430" width="680" height="74" rx="6" fill="#FFF8E8" stroke="#C9A84C" stroke-width="1.5"/>
  <text class="label-bold" x="380" y="450" text-anchor="middle" style="fill:#7A4A00;">Maternal antibodies and vaccination timing</text>
  <text class="small" x="380" y="468" text-anchor="middle">A chick hatches with antibodies passed from the hen through the yolk. They protect it for the first couple of weeks, then fade.</text>
  <text class="small" x="380" y="483" text-anchor="middle">Vaccinate too early and those antibodies soak up the vaccine before it works. Too late, and disease gets there first.</text>
  <text class="small" x="380" y="498" text-anchor="middle">Timing the vaccine around maternal antibody levels is the whole game. See Course 8 (Vaccination) in this series.</text>
</svg>`;

console.log('Rendering reviewer-requested diagrams...');
render(lowerDigestiveSVG, 'figure_3_2_lower_digestive.png');
render(reproTractSVG,     'figure_3_4_repro_tract.png');
render(urinarySVG,        'figure_3_5_urinary.png');
render(immuneSVG,         'figure_3_6_immune.png');
console.log('\nDone. Files saved to Course 6/');
