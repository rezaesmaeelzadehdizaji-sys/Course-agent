// ============================================================
// generate-course6-oxidative.mjs
// One diagram for Course 6, Section 7.5:
//   Oxidative stress = free radicals outpacing antioxidant defense
//   -> figure_7_5_oxidative_stress.png
// House style matches generate-course6-newdiagrams.mjs
// Run: node generate-course6-oxidative.mjs
// ============================================================
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'Course 6');

function render(svgStr, filename) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'original' }, font: { loadSystemFonts: true } });
  const buf   = resvg.render().asPng();
  fs.writeFileSync(path.join(OUT, filename), buf);
  console.log('OK', filename, `(${(buf.length / 1024).toFixed(0)} KB)`);
}

const STYLE = `
  .bg { fill: #FAFAFA; }
  .border { fill: none; stroke: #C9A84C; stroke-width: 2; }
  .title { font-family: Calibri, Arial, sans-serif; font-size: 19px; font-weight: bold; fill: #1F3864; }
  .subtitle { font-family: Calibri, Arial, sans-serif; font-size: 12px; fill: #555; }
  .h { font-family: Calibri, Arial, sans-serif; font-size: 14px; font-weight: bold; }
  .label { font-family: Calibri, Arial, sans-serif; font-size: 12px; fill: #222; }
  .small { font-family: Calibri, Arial, sans-serif; font-size: 11px; fill: #555; }
  .whitebold { font-family: Calibri, Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #FFFFFF; }
`;

const W = 820, H = 560;

// consequence chain box
function chain(x, y, w, text, fill, stroke) {
  return `<rect x="${x}" y="${y}" width="${w}" height="42" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  <text class="label" x="${x + w / 2}" y="${y + 26}" text-anchor="middle">${text}</text>`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>${STYLE}</style>
    <marker id="ar" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#7A5C2E"/></marker>
    <marker id="arRed" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#C62828"/></marker>
  </defs>
  <rect class="bg" width="${W}" height="${H}" rx="8"/>
  <rect class="border" x="4" y="4" width="${W - 8}" height="${H - 8}" rx="6"/>

  <text class="title" x="${W / 2}" y="34" text-anchor="middle">Oxidative Stress: When Damage Outpaces Defense</text>
  <text class="subtitle" x="${W / 2}" y="54" text-anchor="middle">Everyday metabolism makes damaging free radicals. The bird mops them up with an antioxidant system. Stress tips the balance.</text>

  <!-- LEFT PAN: free radicals / triggers -->
  <rect x="30" y="78" width="360" height="196" rx="8" fill="#FDECEA" stroke="#C62828" stroke-width="2"/>
  <text class="h" x="210" y="102" text-anchor="middle" fill="#C62828">Free radicals (ROS) build up</text>
  <text class="small" x="210" y="120" text-anchor="middle">More than 90% come from normal metabolism in the cells</text>
  <text class="label" x="50" y="146">Triggers that push production up:</text>
  <text class="label" x="60" y="168">- Heat stress (the big one)</text>
  <text class="label" x="60" y="188">- Crowding / high stocking density</text>
  <text class="label" x="60" y="208">- Rancid fat or moldy (mycotoxin) feed</text>
  <text class="label" x="60" y="228">- Very fast growth in modern broilers</text>
  <text class="label" x="60" y="248">- Infection, transport, catching, ammonia</text>

  <!-- RIGHT PAN: antioxidant defenses -->
  <rect x="430" y="78" width="360" height="196" rx="8" fill="#E9F5EA" stroke="#2E7D32" stroke-width="2"/>
  <text class="h" x="610" y="102" text-anchor="middle" fill="#2E7D32">Antioxidant defenses mop them up</text>
  <text class="small" x="610" y="120" text-anchor="middle">Built-in enzymes plus what you put in the feed</text>
  <text class="label" x="450" y="146">The bird's own enzymes:</text>
  <text class="label" x="460" y="168">- SOD, then catalase and glutathione peroxidase</text>
  <text class="small" x="470" y="185">(glutathione peroxidase needs selenium to work)</text>
  <text class="label" x="450" y="212">From the diet:</text>
  <text class="label" x="460" y="234">- Vitamin E and vitamin C</text>
  <text class="label" x="460" y="254">- Selenium, plus plant antioxidants (polyphenols)</text>

  <!-- Balance tips: text on its own clear line, single down-arrow below (no crossing) -->
  <text class="h" x="${W / 2}" y="294" text-anchor="middle" fill="#C62828">When triggers overwhelm the defenses, the balance tips into OXIDATIVE STRESS</text>
  <line x1="${W / 2}" y1="302" x2="${W / 2}" y2="317" stroke="#C62828" stroke-width="3" marker-end="url(#arRed)"/>

  <!-- Consequence band -->
  <rect x="30" y="322" width="760" height="150" rx="8" fill="#FFFFFF" stroke="#CCC" stroke-width="1.5"/>
  <text class="h" x="50" y="346" fill="#1F3864">What the bird pays for it</text>

  ${chain(50, 360, 200, 'Cell membranes, gut lining damaged', '#FDECEA', '#C62828')}
  <line x1="250" y1="381" x2="286" y2="381" stroke="#7A5C2E" stroke-width="2" marker-end="url(#ar)"/>
  ${chain(288, 360, 210, 'Leaky gut + weaker immunity', '#FFF3E0', '#E65100')}
  <line x1="498" y1="381" x2="534" y2="381" stroke="#7A5C2E" stroke-width="2" marker-end="url(#ar)"/>
  ${chain(536, 360, 234, 'Secondary infection gets a foothold', '#FDECEA', '#C62828')}

  <text class="label" x="50" y="428" fill="#1F3864">The performance hit you actually see:</text>
  ${chain(50, 438, 172, 'Lower feed intake', '#EAF1FB', '#2E74B5')}
  ${chain(232, 438, 172, 'Lower daily gain', '#EAF1FB', '#2E74B5')}
  ${chain(414, 438, 172, 'Worse feed conversion', '#EAF1FB', '#2E74B5')}
  ${chain(596, 438, 174, 'Higher mortality', '#EAF1FB', '#2E74B5')}

  <!-- Bottom message -->
  <rect x="30" y="486" width="760" height="56" rx="8" fill="#FDF6E3" stroke="#C9A84C" stroke-width="1.5"/>
  <text class="label-bold" x="46" y="508" font-family="Calibri, Arial, sans-serif" font-size="13" font-weight="bold" fill="#1F3864">Often blamed on "an infection" or "a bad vaccine."</text>
  <text class="label" x="46" y="528">The real fix is finding and removing the stress trigger and supporting the antioxidant defenses, not reaching first for antibiotics.</text>

  <text class="small" x="${W - 20}" y="${H - 12}" text-anchor="end">Source: CPC Short Courses.</text>
</svg>`;

render(svg, 'figure_7_5_oxidative_stress.png');
