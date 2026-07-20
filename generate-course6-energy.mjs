// ============================================================
// generate-course6-energy.mjs
// One diagram for Course 6, Section 7.5:
//   The energy priority ladder (maintenance paid first, eggs last)
//   and how stress / acute phase proteins jump the queue.
//   -> figure_7_5_energy_priority.png
// House style matches generate-course6-oxidative.mjs
// Run: node generate-course6-energy.mjs
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
  .rungt { font-family: Calibri, Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #1F3864; }
  .rungs { font-family: Calibri, Arial, sans-serif; font-size: 11px; fill: #444; }
  .badge { font-family: Calibri, Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #FFFFFF; }
  .grp { font-family: Calibri, Arial, sans-serif; font-size: 11px; font-weight: bold; }
  .h { font-family: Calibri, Arial, sans-serif; font-size: 13px; font-weight: bold; }
  .lab { font-family: Calibri, Arial, sans-serif; font-size: 11px; fill: #222; }
  .small { font-family: Calibri, Arial, sans-serif; font-size: 11px; fill: #555; }
`;

const W = 820, H = 545;
const X = 40, BW = 462;      // rung x and width
const BADGE = 62;             // badge center x

// one rung
function rung(y, num, title, sub, fill, stroke, badgeFill) {
  return `<rect x="${X}" y="${y}" width="${BW}" height="52" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  <circle cx="${BADGE}" cy="${y + 26}" r="14" fill="${badgeFill}"/>
  <text class="badge" x="${BADGE}" y="${y + 30}" text-anchor="middle">${num}</text>
  <text class="rungt" x="90" y="${y + 22}">${title}</text>
  <text class="rungs" x="90" y="${y + 40}">${sub}</text>`;
}

const AMBER = { f: '#FFF3E6', s: '#E65100', b: '#E65100' };
const BLUE  = { f: '#EAF1FB', s: '#2E74B5', b: '#2E74B5' };

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>${STYLE}</style>
    <marker id="arRed" markerWidth="10" markerHeight="8" refX="8.5" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#C62828"/></marker>
  </defs>
  <rect class="bg" width="${W}" height="${H}" rx="8"/>
  <rect class="border" x="4" y="4" width="${W - 8}" height="${H - 8}" rx="6"/>

  <text class="title" x="${W / 2}" y="34" text-anchor="middle">How a Bird Spends Its Energy: The Priority Order</text>
  <text class="subtitle" x="${W / 2}" y="54" text-anchor="middle">The bird pays for staying alive first. Only the energy left over goes into growth and eggs.</text>

  <!-- Group labels (rotated in the left margin so they never overlap the rungs) -->
  <text class="grp" x="20" y="204" text-anchor="middle" fill="#E65100" transform="rotate(-90 20 204)">MAINTENANCE (paid first)</text>
  <text class="grp" x="20" y="398" text-anchor="middle" fill="#2E74B5" transform="rotate(-90 20 398)">PRODUCTION (last)</text>

  ${rung( 88, 1, 'Basal metabolism', 'Staying alive: heart, breathing, keeping the organs running', AMBER.f, AMBER.s, AMBER.b)}
  ${rung(148, 2, 'Body temperature', 'Keeping warm or cool (thermoregulation)', AMBER.f, AMBER.s, AMBER.b)}
  ${rung(208, 3, 'Feather cover', 'Growing and keeping feathers, which also help hold body heat', AMBER.f, AMBER.s, AMBER.b)}
  ${rung(268, 4, 'Activity', 'Standing, walking, getting to feed and water', AMBER.f, AMBER.s, AMBER.b)}

  <line x1="${X}" y1="332" x2="${X + BW}" y2="332" stroke="#BBB" stroke-width="1" stroke-dasharray="4,3"/>

  ${rung(342, 5, 'Body weight gain', 'Growth: putting on muscle and meat', BLUE.f, BLUE.s, BLUE.b)}
  ${rung(402, 6, 'Egg production', 'Making eggs, the very last thing the body funds', BLUE.f, BLUE.s, BLUE.b)}

  <!-- Right callout: stress jumps the queue -->
  <rect x="524" y="88" width="266" height="232" rx="8" fill="#FDECEA" stroke="#C62828" stroke-width="2"/>
  <text class="h" x="657" y="110" text-anchor="middle" fill="#C62828">When stress or infection hits</text>
  <text class="lab" x="538" y="134">The body makes emergency immune</text>
  <text class="lab" x="538" y="150">proteins called acute phase proteins.</text>
  <text class="lab" x="538" y="172">Building them costs amino acids and</text>
  <text class="lab" x="538" y="188">energy, and the bird also eats less.</text>
  <text class="lab" x="538" y="210">That new demand jumps the queue</text>
  <text class="lab" x="538" y="226">near the top of the list.</text>
  <text class="h" x="538" y="252" fill="#C62828">So the bottom is starved first:</text>
  <text class="lab" x="538" y="272">growth and eggs slow down before</text>
  <text class="lab" x="538" y="288">anything else, even with no disease</text>
  <text class="lab" x="538" y="304">you can see.</text>

  <!-- Arrow from callout down to the production rungs -->
  <path d="M 640 320 C 620 360, 560 372, ${X + BW + 6} 388" fill="none" stroke="#C62828" stroke-width="2.5" marker-end="url(#arRed)"/>

  <!-- Bottom takeaway -->
  <rect x="40" y="474" width="740" height="46" rx="8" fill="#FDF6E3" stroke="#C9A84C" stroke-width="1.5"/>
  <text class="lab" x="56" y="494" font-weight="bold" fill="#1F3864">Read it like a bill the bird pays top to bottom.</text>
  <text class="lab" x="56" y="512">A stressed flock loses weight gain and egg output first, which is why poor performance shows up before obvious sickness.</text>

  <text class="small" x="${W - 20}" y="${H - 12}" text-anchor="end">Source: CPC Short Courses.</text>
</svg>`;

render(svg, 'figure_7_5_energy_priority.png');
