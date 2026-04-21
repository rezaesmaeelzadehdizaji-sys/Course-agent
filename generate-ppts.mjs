import PptxGenJS from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const C3 = path.join(__dirname, 'Course 3');
const C7 = path.join(__dirname, 'Course 7');

// ─── Palette ───────────────────────────────────────────────────────────────
const DARK_GREEN  = '1B4332';
const MED_GREEN   = '2D6A4F';
const LIGHT_GREEN = '52B788';
const GOLD        = 'D4A017';
const WHITE       = 'FFFFFF';
const DARK_TEXT   = '1A1A2E';
const BODY_TEXT   = '2C3E50';
const GRAY_BG     = 'F5F5F5';
const LIGHT_GRAY  = 'D9D9D9';
const RED_WARN    = 'C0392B';

const LOGO_PATH   = path.join(__dirname, 'logo.png');
const LOGO_EXISTS = fs.existsSync(LOGO_PATH);

// ─── Helpers ───────────────────────────────────────────────────────────────
function img(folder, filename) {
  const p = path.join(folder, filename);
  if (!fs.existsSync(p)) { console.warn('MISSING IMAGE:', p); return null; }
  return p;
}

function titleSlide(pptx, seriesLabel, title, subtitle, date) {
  const s = pptx.addSlide();
  // full background
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: DARK_GREEN } });
  // gold accent bar
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 4.5, w: 10, h: 0.15, fill: { color: GOLD } });
  s.addText(seriesLabel, { x: 0.5, y: 0.35, w: 9, h: 0.4, fontSize: 13, color: LIGHT_GREEN, bold: false, align: 'center', fontFace: 'Calibri' });
  s.addText(title, { x: 0.5, y: 1.05, w: 9, h: 1.8, fontSize: 34, color: WHITE, bold: true, align: 'center', fontFace: 'Calibri', valign: 'middle' });
  s.addText(subtitle, { x: 0.5, y: 2.9, w: 9, h: 0.8, fontSize: 16, color: LIGHT_GREEN, align: 'center', fontFace: 'Calibri', italic: true });
  s.addText(date, { x: 0.5, y: 4.0, w: 9, h: 0.4, fontSize: 12, color: LIGHT_GREEN, align: 'center', fontFace: 'Calibri' });
  s.addText('Canadian Poultry Training Series  |  Canadian Poultry Consultants (CPC)', { x: 0.5, y: 4.65, w: 9, h: 0.35, fontSize: 11, color: WHITE, align: 'center', fontFace: 'Calibri' });
  if (LOGO_EXISTS) s.addImage({ path: LOGO_PATH, x: 9.0, y: 0.1, w: 0.7, h: 0.7 });
  return s;
}

function sectionSlide(pptx, num, title, subtitle) {
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: MED_GREEN } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 4.5, w: 10, h: 0.15, fill: { color: GOLD } });
  if (num) {
    s.addText(num, { x: 0.5, y: 0.7, w: 9, h: 0.5, fontSize: 15, color: GOLD, bold: true, align: 'center', fontFace: 'Calibri' });
  }
  s.addText(title, { x: 0.5, y: 1.3, w: 9, h: 1.8, fontSize: 32, color: WHITE, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri' });
  if (subtitle) {
    s.addText(subtitle, { x: 0.5, y: 3.2, w: 9, h: 0.7, fontSize: 15, color: LIGHT_GREEN, align: 'center', fontFace: 'Calibri', italic: true });
  }
  if (LOGO_EXISTS) s.addImage({ path: LOGO_PATH, x: 9.0, y: 0.1, w: 0.7, h: 0.7 });
  return s;
}

// content slide: heading + bullets (left) + optional image (right)
function contentSlide(pptx, heading, bullets, imgPath, imgOpts) {
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: DARK_GREEN } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0.75, w: 10, h: 0.04, fill: { color: GOLD } });
  s.addText(heading, { x: 0.25, y: 0.05, w: 8.5, h: 0.65, fontSize: 20, color: WHITE, bold: true, fontFace: 'Calibri', valign: 'middle' });
  if (LOGO_EXISTS) s.addImage({ path: LOGO_PATH, x: 9.1, y: 0.1, w: 0.55, h: 0.55 });

  const hasImg = imgPath && fs.existsSync(imgPath);
  const contentW = hasImg ? 5.6 : 9.5;

  const bulletObjs = bullets.map(b => {
    if (typeof b === 'string') {
      if (b.startsWith('  ')) {
        return { text: b.trim(), options: { bullet: { indent: 25 }, fontSize: 13, color: BODY_TEXT, fontFace: 'Calibri', paraSpaceBefore: 2 } };
      }
      return { text: b, options: { bullet: true, fontSize: 14, color: DARK_TEXT, fontFace: 'Calibri', bold: false, paraSpaceBefore: 4 } };
    }
    return b;
  });

  s.addText(bulletObjs, { x: 0.3, y: 0.9, w: contentW, h: 4.55, valign: 'top', fontFace: 'Calibri' });

  if (hasImg) {
    const io = { x: 6.05, y: 0.9, w: 3.7, h: 4.2, ...(imgOpts || {}) };
    s.addImage({ path: imgPath, ...io });
    if (imgOpts && imgOpts.caption) {
      s.addText(imgOpts.caption, { x: 6.05, y: 5.1, w: 3.7, h: 0.35, fontSize: 9, color: '888888', align: 'center', fontFace: 'Calibri', italic: true });
    }
  }
  return s;
}

// slide with large centered image + small caption
function imageSlide(pptx, heading, imgPath, caption, bullets) {
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: DARK_GREEN } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0.75, w: 10, h: 0.04, fill: { color: GOLD } });
  s.addText(heading, { x: 0.25, y: 0.05, w: 8.5, h: 0.65, fontSize: 20, color: WHITE, bold: true, fontFace: 'Calibri', valign: 'middle' });
  if (LOGO_EXISTS) s.addImage({ path: LOGO_PATH, x: 9.1, y: 0.1, w: 0.55, h: 0.55 });
  if (imgPath && fs.existsSync(imgPath)) {
    s.addImage({ path: imgPath, x: 0.4, y: 0.88, w: 9.2, h: 4.3 });
    if (caption) s.addText(caption, { x: 0.4, y: 5.22, w: 9.2, h: 0.3, fontSize: 10, color: '888888', align: 'center', fontFace: 'Calibri', italic: true });
  }
  if (bullets && bullets.length) {
    const bulletObjs = bullets.map(b => ({ text: b, options: { bullet: true, fontSize: 13, color: WHITE, fontFace: 'Calibri' } }));
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.0, w: 9.4, h: 0.1, fill: { color: DARK_GREEN, transparency: 40 } });
    s.addText(bulletObjs, { x: 0.3, y: 1.0, w: 9.4, h: 4.4, valign: 'top', fontFace: 'Calibri', fill: { color: '000000', transparency: 70 } });
  }
  return s;
}

// two-column content slide
function twoColSlide(pptx, heading, leftTitle, leftBullets, rightTitle, rightBullets) {
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: DARK_GREEN } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0.75, w: 10, h: 0.04, fill: { color: GOLD } });
  s.addText(heading, { x: 0.25, y: 0.05, w: 8.5, h: 0.65, fontSize: 20, color: WHITE, bold: true, fontFace: 'Calibri', valign: 'middle' });
  if (LOGO_EXISTS) s.addImage({ path: LOGO_PATH, x: 9.1, y: 0.1, w: 0.55, h: 0.55 });
  // divider
  s.addShape(pptx.ShapeType.rect, { x: 4.9, y: 0.85, w: 0.05, h: 4.6, fill: { color: LIGHT_GRAY } });
  // left
  if (leftTitle) s.addText(leftTitle, { x: 0.3, y: 0.88, w: 4.4, h: 0.45, fontSize: 14, color: MED_GREEN, bold: true, fontFace: 'Calibri' });
  const leftObjs = leftBullets.map(b => ({ text: b, options: { bullet: true, fontSize: 13, color: DARK_TEXT, fontFace: 'Calibri', paraSpaceBefore: 3 } }));
  s.addText(leftObjs, { x: 0.3, y: leftTitle ? 1.35 : 0.9, w: 4.4, h: 4.1, valign: 'top' });
  // right
  if (rightTitle) s.addText(rightTitle, { x: 5.1, y: 0.88, w: 4.6, h: 0.45, fontSize: 14, color: MED_GREEN, bold: true, fontFace: 'Calibri' });
  const rightObjs = rightBullets.map(b => ({ text: b, options: { bullet: true, fontSize: 13, color: DARK_TEXT, fontFace: 'Calibri', paraSpaceBefore: 3 } }));
  s.addText(rightObjs, { x: 5.1, y: rightTitle ? 1.35 : 0.9, w: 4.6, h: 4.1, valign: 'top' });
  return s;
}

// table slide for summary
function tableSlide(pptx, heading, rows, colWidths) {
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: DARK_GREEN } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0.75, w: 10, h: 0.04, fill: { color: GOLD } });
  s.addText(heading, { x: 0.25, y: 0.05, w: 8.5, h: 0.65, fontSize: 20, color: WHITE, bold: true, fontFace: 'Calibri', valign: 'middle' });
  if (LOGO_EXISTS) s.addImage({ path: LOGO_PATH, x: 9.1, y: 0.1, w: 0.55, h: 0.55 });
  s.addTable(rows, { x: 0.3, y: 0.9, w: 9.4, colW: colWidths, fontFace: 'Calibri', fontSize: 11, border: { type: 'solid', pt: 0.5, color: LIGHT_GRAY }, valign: 'middle' });
  return s;
}

// ═══════════════════════════════════════════════════════════════════════════
// COURSE 3: T-FLAWS Assessment Management Tool (1 hour, ~30 slides)
// ═══════════════════════════════════════════════════════════════════════════
async function buildCourse3() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Canadian Poultry Consultants (CPC)';
  pptx.company = 'CPC Training Series';
  pptx.subject = 'T-FLAWS Assessment Management Tool';

  // 1. Title
  titleSlide(pptx, 'COURSE 3 OF 17 — CANADIAN POULTRY TRAINING SERIES',
    'T-FLAWS\nAssessment Management Tool',
    'A Structured Flock Assessment Framework for Commercial Poultry Farmers in Canada',
    'April 2026  |  60-Minute Presentation');

  // 2. Agenda
  contentSlide(pptx, 'What We Cover Today', [
    'Introduction: What is T-FLAWS and why it matters',
    'T — Toes (Footpad Dermatitis): scoring, causes, action plan',
    'F — Feathers: coverage scoring, pecking vs. nutrition vs. parasites',
    'L — Legs: Bristol Gait Score, hock burn, TD on post-mortem',
    'A — Activity: flock distribution, flight distance, early warning signals',
    'W — Weight: uniformity (CV%), crop fill, growth tracking',
    'S — Skin: cellulitis, breast blisters, cyanosis, ammonia burns',
    'Summary table and Q&A',
  ], null);

  // 3. What is T-FLAWS?
  contentSlide(pptx, 'What is T-FLAWS?', [
    'T-FLAWS = Toes, Feathers, Legs, Activity, Weight, Skin',
    'Six things you check on every farm walk that together tell you almost everything about how your flock is doing right now',
    'These are not six separate problems — they are six windows into the same flock:',
    '  Wet litter shows first in toes, then hocks, then breast skin',
    '  A bird in pain stops moving: changes activity, then weight',
    '  One issue runs into the next — catch things early',
    'T-FLAWS is what Canadian welfare audits and Chicken Farmers of Canada programs expect',
    'The NFACC Code of Practice calls for systematic on-farm monitoring — this guide gives you the tools',
  ], null);

  // 4. Six windows into your flock (visual concept)
  contentSlide(pptx, 'Six Windows Into Your Flock', [
    'Toes (FPD) → Wet litter signal, welfare audit benchmark',
    'Feathers → Pecking, parasites, nutritional deficiency',
    'Legs → #1 welfare issue in broilers; audit and contract risk',
    'Activity → Earliest early-warning system you have (24-48 hrs ahead)',
    'Weight → Your production contract is built on this number',
    'Skin → Cellulitis = #1 total carcass condemnation cause in Canada',
    '',
    'Assess all six together. One problem almost always touches two or more.',
  ], null);

  // 5. When to Assess
  twoColSlide(pptx, 'When to Do Your Assessments',
    'Broilers',
    ['Day 7 — Activity + Weight only (are chicks settled in?)',
     'Day 14 — All six components (early growth check)',
     'Day 21 — Mid-cycle: your warning window before problems compound',
     'Day 28 — Pre-thinning condition score',
     'Day 35 / Depopulation — Final assessment'],
    'Layers & Breeders',
    ['Monthly full T-FLAWS assessment',
     'Any time something unusual happens:',
     '  Mortality spike',
     '  Feed or water change',
     '  Weather event',
     '  New personnel or catching crew']);

  // 6. T: Toes — FPD Scoring
  contentSlide(pptx, 'T = TOES: Footpad Dermatitis (FPD) Scoring',
    ['Turn the bird over and look at the bottom of both feet. Score the worst foot.',
     '',
     'Score 0 — Healthy: intact skin, no dark patches, no swelling. This is what you want.',
     'Score 1 — Early damage: discoloration, surface erosion, not yet through to deep tissue. Act now.',
     'Score 2 — Serious: deep ulceration, dark necrotic tissue, often >1/3 of footpad. Bird is in pain.',
     '',
     'Also note:',
     '  Bumblefoot — swollen scabby lump from Staph aureus entering a skin break',
     '  Curled toes — riboflavin (B2) deficiency or hatchery incubation problem',
     '  Toe necrosis in new chicks — high brooding temperature or dehydration on arrival'],
    img(C3, 'fpd_scoring_scale.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.5, caption: 'FPD Scoring Scale: Score 0 (healthy) to Score 2 (deep ulceration). Welfare Quality® protocol.' });

  // 7. Why FPD Matters
  contentSlide(pptx, 'Why Footpad Dermatitis Matters to Your Operation',
    ['Welfare auditors check FPD first — it is front and center in:',
     '  NFACC Code of Practice',
     '  Chicken Farmers of Canada Animal Care Program',
     '',
     'Direct revenue impact: Grade 2 feet = condemned at the plant. Bird by bird.',
     '',
     'FPD is a reliable signal: your litter is too wet, your ammonia is too high',
     '  These problems cost you in FCR and respiratory health even before you see FPD',
     '',
     'Target: fewer than 5% Score 2. If Score 1 is above 20% at Day 21 — act now.'],
    img(C3, 'fpd_hockburn.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.3, caption: 'Score 2 FPD lesion (footpad) and hock burn — both indicate chronic litter moisture. USDA ARS.' });

  // 8. How to Assess Toes
  contentSlide(pptx, 'How to Assess: Toes', [
    'Pick up at least 100 birds per barn',
    'Pull from at least 5 different spots across the floor — not just near the door',
    'Check both feet on each bird: score is whichever foot is worse',
    'Do not assess before Day 21 — feet need time to show real lesions',
    '',
    'Your targets:',
    '  Score 2: fewer than 5% of birds',
    '  Score 1 above 20% at Day 21 = warning, act now',
    '',
    'Keep ammonia below 25 ppm at bird level at all times — NFACC requirement',
    'Biotin in diet: 150-300 mcg/kg complete feed to support skin integrity',
  ], null);

  // 9. What to Do — Toes
  contentSlide(pptx, 'Action Plan: Toes', [
    'Score 1 climbing above 20%:',
    '  Check ventilation rates, every drinker for leaks, nipple height for bird size',
    '',
    'Score 2 above 5%:',
    '  Full ventilation and litter review — not just a spot fix',
    '',
    'Bumblefoot:',
    '  Find what is cutting feet (sharp edges, rough flooring). Treat the wound.',
    '',
    'Curled toes:',
    '  Riboflavin (B2) shortage in diet OR hatchery incubation temperature problem',
    '',
    'Toe necrosis in new chicks:',
    '  Check brooding temperature and hydration at arrival — first 24 hours matter',
  ], null);

  // 10. F: Feathers
  contentSlide(pptx, 'F = FEATHERS: Coverage Scoring (0–4 Scale)',
    ['Walk through the flock: look at backs, wings, neck, tail, and breast',
     '',
     'Score 0 — Full intact feather coverage. No gaps.',
     'Score 1 — Minor bare patches, feathers intact around them',
     'Score 2 — Moderate loss, bare skin visible in multiple areas',
     'Score 3 — Large bare areas, skin exposed',
     'Score 4 — Large bare area with open wounds',
     '',
     'Key question: WHY are the feathers gone?',
     '  Pecking — feather pulled out cleanly at base; quill stub left behind',
     '  Mites/lice — feathers broken and frayed, not pulled out',
     '  Poor nutrition / genetics — uniform slow feathering across whole flock'],
    img(C3, 'feather_loss.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.3, caption: 'Score 3-4 feather loss on dorsal surface — classic feather pecking damage.' });

  // 11. Why Feathers Matter
  contentSlide(pptx, 'Why Feather Condition Matters',
    ['Feathers keep birds warm and protect skin underneath',
     'FCR penalty: 5-15% increase when significant feather loss occurs (bird burns extra feed to stay warm)',
     '',
     'In layers: pecking that draws blood can escalate to full cannibalism in hours',
     '',
     'At the plant: poor feather coverage slows defeathering lines and causes skin tears that downgrade the carcass',
     '',
     'Sulfur amino acids (methionine + cysteine) must be at breed-recommended levels',
     '  Low SAA is one of the most common nutritional drivers of poor feather quality'],
    img(C3, 'feather_pecking.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Feather pecking damage — exposed dorsal skin. Wikimedia Commons CC BY 1.0.' });

  // 12. Action Plan: Feathers
  contentSlide(pptx, 'Action Plan: Feathers', [
    'Back and vent feather loss (feather pecking):',
    '  Drop lighting below 10 lux (broilers) / 20 lux (layers)',
    '  Ensure uniform light across the barn — hotspots cause pecking',
    '  Add enrichment: pecking blocks, hanging cabbages',
    '  Verify all birds have fair feeder and drinker access',
    '',
    'Broken or frayed feathers (both sides of flock):',
    '  Check for red mite (Dermanyssus gallinae) — inspect at night (feeds after dark)',
    '  Treat promptly with approved acaricides + sanitation plan',
    '',
    'Stress bars (horizontal weak lines on feather shaft):',
    '  Tells you flock went through a significant stress: disease, temperature extreme, feed gap',
    '  Bars do not fix themselves — go back and look at your records',
  ], null);

  // 13. L: Legs — Bristol Gait Score
  contentSlide(pptx, 'L = LEGS: Bristol Gait Scoring Scale (0–5)',
    ['Stand at the end of the barn. Watch birds walk undisturbed.',
     '',
     'Score 0 — Normal: fluid, balanced movement, full weight on both legs',
     'Score 1 — Slight abnormality: minor hitch, bird gets around fine',
     'Score 2 — Definite impairment: clear limp or difficulty balancing',
     'Score 3 — Marked impairment: bird is reluctant to move; in significant pain',
     'Score 4 — Cannot walk without using wings for support; cannot reliably reach feed/water',
     'Score 5 — Cannot walk at all. Lateral recumbency. Humane euthanasia required IMMEDIATELY.',
     '',
     'Also check:',
     '  Hock burn — dark discoloration/ulceration on back of hock (score 0-2)',
     '  Valgus/varus deformity — legs angling in or out'],
    img(C3, 'lame_broiler.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.2, caption: 'Broiler at Gait Score 3-4, resting on hocks. Glass Walls Project CC BY-SA 4.0.' });

  // 14. Why Leg Health Matters
  contentSlide(pptx, 'Why Leg Health Matters to Your Operation', [
    'Leg problems are the single biggest welfare and production issue in commercial broiler farming',
    '',
    'A large-scale UK study: over 27% of broilers at slaughter had Gait Score 3 or worse',
    '',
    'A Score 3 bird is in pain:',
    '  Not walking to feeder and drinker',
    '  Falls behind on weight',
    '  More likely to get breast blisters from lying on wet litter',
    '  Red flag for processor welfare audits',
    '',
    'Canadian processor programs all score leg health',
    '  High lameness rates have contract consequences',
  ], null);

  // 15. How to Assess Legs
  contentSlide(pptx, 'How to Assess: Legs',
    ['Watch at least 150 birds moving freely — do not chase them, just observe and score',
     'After the gait walk: catch 30 birds, flip them, check hock burn on both legs',
     'Assess from Day 28 onward in broilers',
     '',
     'Post-mortem check (lame or dead birds):',
     '  Open the tibiae and look for a white, rubbery cartilage plug in the growth plate',
     '  This is Tibial Dyschondroplasia (TD) — tells you about Ca:P and Vitamin D3 balance',
     '',
     'Target: Gait Score 3+ in fewer than 5% of birds',
     'Hock burn Score 2 in fewer than 5% of birds'],
    img(C3, 'splay_leg_broiler.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Splay-legged broilers (Gait Score 4-5) — requires immediate euthanasia. CC BY-SA 4.0.' });

  // 16. TD and Hock Burn
  contentSlide(pptx, 'Tibial Dyschondroplasia + Hock Burn: What They Tell You',
    ['Tibial Dyschondroplasia (TD):',
     '  White rubbery plug of cartilage in the proximal tibial growth plate on post-mortem',
     '  Cartilage that never converted to bone properly',
     '  Review your Ca:P ratio and Vitamin D3 levels with your nutritionist',
     '  Mycotoxin exposure can also cause TD — check your feed source',
     '',
     'Hock Burn Score 2 above 5%:',
     '  Same root cause as FPD — litter is too wet',
     '  Fix: ventilation review + drinker management + litter caking removal',
     '',
     'Swollen hot joints in multiple birds:',
     '  Septic arthritis — get fresh birds to your vet for diagnosis BEFORE it spreads'],
    img(C3, 'tibial_td.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Tibial dyschondroplasia (TD): white cartilaginous plug in proximal tibial growth plate. Wikimedia CC BY 4.0.' });

  // 17. Action Plan: Legs
  contentSlide(pptx, 'Action Plan: Legs', [
    'Gait Score 3+ above 5%:',
    '  Check lighting first — NFACC requires 6+ consecutive hours of darkness per day (leg health protection)',
    '  Check bedding depth (minimum 5 cm at placement)',
    '  Review nutrition against your breed spec',
    '',
    'Valgus or varus (crooked legs):',
    '  Multiple birds affected symmetrically = nutritional or genetic cause',
    '  Single bird with one crooked leg = likely an injury',
    '',
    'Any Score 5 bird:',
    '  Euthanise immediately. No delay. This is a welfare and NFACC compliance requirement.',
    '',
    'High TD on post-mortem:',
    '  Review Ca:P ratio and Vitamin D3 with your nutritionist',
    '  Check feed for mycotoxin contamination',
  ], null);

  // 18. A: Activity
  contentSlide(pptx, 'A = ACTIVITY: What Are We Looking At?',
    ['Activity is reading the whole flock — how birds are moving, where they are, how they behave when you walk in',
     '',
     'Three things to assess:',
     '  Flock distribution across the floor (scored 1-3)',
     '  What birds are doing: feeding, drinking, resting, preening',
     '  Flight distance: how close before birds move away from you',
     '',
     'Distribution scoring:',
     '  Score 1 — Birds spread evenly across the whole floor (what you want)',
     '  Score 2 — Some uneven patches',
     '  Score 3 — Birds bunched in clusters with big open bare floor areas (investigate immediately)',
     '',
     'Clustering always means something. Open bare floor = birds are telling you something.'],
    img(C3, 'broiler_house.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Commercial broiler house interior. Even flock distribution signals a well-managed environment. USDA.' });

  // 19. Activity: Early Warning System
  contentSlide(pptx, 'Activity: Your Earliest Warning System',
    ['Research shows feeding behaviour changes 24-48 hours before disease becomes clinically obvious',
     '',
     'If you walk your barn daily, you can often FEEL that something is off before you can name it',
     '',
     'T-FLAWS Activity gives that instinct a structure so you can act before it costs you',
     '',
     'What clustering tells you:',
     '  Near brooders/heat sources → barn too cold or cold spots at walls',
     '  Crowded center, walls empty → overheating at perimeter',
     '  More than 70% sitting during light period → pain, illness, or poor air quality',
     '',
     'Flight distance over 2 meters: your birds have not been handled enough — will be hard to manage at depopulation'],
    img(C3, 'broiler_flock.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Commercial broiler flock on litter. Any large empty floor areas or tight clustering are warning signs.' });

  // 20. How to Assess: Activity
  contentSlide(pptx, 'How to Assess: Activity', [
    'BEFORE opening the barn door: stop and listen for 30 seconds',
    '  Quiet uniform chatter = good',
    '  Distressed noise, silence, or piling near the door = already a warning',
    '',
    'When you enter: pause for 2 minutes, watch from just inside',
    '  Score distribution BEFORE birds react to your presence',
    '',
    'Walk slowly down the center aisle: note flight distance',
    '  Target: birds move away at 1 meter or less',
    '  Birds scattering at 3+ meters: insufficient handling, problem at depopulation',
    '',
    'Quick behavioral scan: count what 100 birds in front of you are doing right now',
    '  Do this twice, 1 minute apart: feeding / drinking / resting / other',
  ], null);

  // 21. Action Plan: Activity
  contentSlide(pptx, 'Action Plan: Activity', [
    'Clustering near heat sources: Map temperature at 30 cm off floor across full barn width; target uniformity within 2°C',
    '',
    'Crowded center, walls empty: Check side curtain leakage; check supplemental heat near walls',
    '',
    'More than 70% birds sitting during light period:',
    '  Check ammonia IMMEDIATELY — if above 10 ppm at nose height, open ventilation now',
    '  CO2 above 3,000 ppm causes lethargy — check that too',
    '',
    'Sudden piling or pile-up along a wall:',
    '  Panic response. Look for light failure, sudden noise, or evidence of predator entry.',
    '',
    'Persistent high flight distance (birds scatter at 2+ meters):',
    '  Spend more time in the barn quietly every day. Daily calm walks reduce fear responses.',
  ], null);

  // 22. W: Weight
  contentSlide(pptx, 'W = WEIGHT: What Are We Looking At?', [
    'Weight tells you two things:',
    '  How fast your flock is growing vs. where it should be (breed curve)',
    '  How evenly that weight is distributed across the barn (uniformity)',
    '',
    'Key metric: Coefficient of Variation (CV%)',
    '  CV% = standard deviation ÷ mean × 100',
    '  Broilers: target CV below 10% at every weigh',
    '  Layer pullets approaching point of lay: target CV below 8%',
    '  Non-uniform pullets start laying out of sync — flattens your peak production',
    '',
    'Day 1 crop fill check:',
    '  Feel the crop of newly placed chicks — should feel full, like a small firm balloon',
    '  If it does not, those chicks have not found feed and water',
  ], null);

  // 23. Why Weight Matters
  contentSlide(pptx, 'Why Weight and Uniformity Matter', [
    'Weight is the primary number your production contract is built around',
    'Fall behind the breed curve: the gap compounds — you do not catch up easily',
    '',
    'Wide CV% at harvest creates a wide range of carcass sizes',
    '  Processors penalise this because it disrupts their cut-up lines',
    '',
    'In layers: poor uniformity at point of lay is one of the most common causes of a disappointing laying curve',
    '  Birds that have not developed evenly will not all peak at the same time',
    '',
    'Every percent of CV% above target is a production management problem you can fix',
  ], null);

  // 24. How to Assess Weight
  contentSlide(pptx, 'How to Assess: Weight', [
    'Weigh at least 100 birds per barn',
    'Pull from at least 5 locations spread across the full floor — not just birds near the door',
    'Calculate: average weight, standard deviation, CV%',
    'Compare average to your breed standard growth curve for that day of age',
    'Run this every week starting at Day 7',
    '',
    'Crop fill at 24 hours post-placement:',
    '  Palpate the crop on at least 50 chicks at 24 hours',
    '  Target: 95%+ of chicks with full crops',
    '  Below 95%: you have a placement issue — Day 1 matters more than almost anything else',
    '',
    'Calibrate your scale regularly — you would be surprised how often a scale is the issue',
  ], null);

  // 25. Action Plan: Weight
  contentSlide(pptx, 'Action Plan: Weight', [
    'Average weight more than 10% below breed standard:',
    '  Calibrate your scale first. Then: feed delivery working? Drinkers flowing at the right rate? Air quality? Disease pressure?',
    '',
    'CV above 12%:',
    '  Walk the barn and look for patterns — are underweight birds concentrated in one area?',
    '  Points to: temperature gradient, drinker line with low flow, feeder not running properly',
    '  Every bird should be within 3 meters of a feeder',
    '',
    'Bimodal weight distribution (two peaks on your chart):',
    '  Two-subpopulation problem: bullying, resource access, or barn gradient',
    '',
    'Poor crop fill at 24 hours:',
    '  Check brooding temperature (25-30°C at chick level), put crumble right in front of birds, verify drinker flow rates',
    '',
    'Persistent lag across multiple flocks: bring your nutritionist in — energy density, amino acids, digestibility',
  ], null);

  // 26. S: Skin
  contentSlide(pptx, 'S = SKIN: What Are We Looking At?',
    ['Look at the whole body — beyond feet and hocks:',
     '',
     'Cellulitis: yellow/greenish fibrinous plaque under skin (thigh, abdomen, breast)',
     '  Subcutaneous bacterial infection. Entire carcass condemned at the plant.',
     '',
     'Breast blister (sternal bursitis): fluid-filled swelling over keel bone',
     '  Caused by birds lying on breast too long — lame birds + wet litter',
     '',
     'Ammonia burn (contact dermatitis): reddened inflamed skin on ventral breast and abdomen',
     '  Chemical damage from wet, ammonia-rich litter. Birds have been lying on bad litter.',
     '',
     'Skin color:',
     '  Pale → anemia or blood loss',
     '  Blue/cyanotic → not enough oxygen: ascites or respiratory disease',
     '  Yellow/jaundiced → liver problem'],
    img(C3, 'cyanosis_chickens.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Cyanosis (blue-purple skin) in commercial chickens — reduced oxygen delivery. Emergency: call your vet today.' });

  // 27. Why Skin Matters
  contentSlide(pptx, 'Why Skin Matters: Cellulitis is Your #1 Condemnation Cause',
    ['Cellulitis = #1 cause of TOTAL carcass condemnation at Canadian broiler processing plants',
     '',
     'Not a partial trim. The entire bird is condemned. That is 100% revenue loss for that bird.',
     '',
     'Cellulitis starts with a skin wound:',
     '  Catching crew scratches',
     '  Rough surfaces in the barn',
     '  Peck wounds',
     '',
     'When your cellulitis rate goes up, something in your management or catching system has changed',
     '',
     'Pull your processor condemnation report after EVERY kill. Cellulitis rate by category is the most important skin data you will get.'],
    img(C3, 'bumblefoot.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Bumblefoot (pododermatitis): raised scab with tissue inflammation. Any open skin wound is a potential cellulitis entry point. CC BY 4.0.' });

  // 28. Action Plan: Skin
  contentSlide(pptx, 'Action Plan: Skin', [
    'Cellulitis rate rising:',
    '  Review catching crew handling: wing grabs, overfilling crates, dragging birds across surfaces',
    '  Check barn for anything that scratches: broken slats, sharp wire, feeder edges',
    '  Review your E. coli vaccination program (Poulvac E. coli, Zoetis Canada) — timing is critical',
    '',
    'Breast blisters above 5%:',
    '  Fix the leg health problem first — lame birds lie down too much',
    '  Look at litter quality: soft dry litter is more forgiving on the breast',
    '',
    'Ammonia burns on ventral skin:',
    '  Litter moisture above 35% and ammonia above 25 ppm',
    '  URGENT — ventilation and litter management problem, not just a welfare issue',
    '',
    'Cyanosis or jaundice in multiple birds:',
    '  Same-day call to your poultry vet. Submit 2-3 fresh chilled dead birds for post-mortem immediately.',
  ], null);

  // 29. Summary Table
  tableSlide(pptx, 'T-FLAWS Quick Reference Summary', [
    [
      { text: 'Component', options: { bold: true, color: WHITE, fill: { color: DARK_GREEN }, fontSize: 12, fontFace: 'Calibri' } },
      { text: 'What You Score', options: { bold: true, color: WHITE, fill: { color: DARK_GREEN }, fontSize: 12, fontFace: 'Calibri' } },
      { text: 'Target / Threshold', options: { bold: true, color: WHITE, fill: { color: DARK_GREEN }, fontSize: 12, fontFace: 'Calibri' } },
      { text: 'First Action When High', options: { bold: true, color: WHITE, fill: { color: DARK_GREEN }, fontSize: 12, fontFace: 'Calibri' } },
    ],
    [
      { text: 'T: Toes (FPD)', options: { bold: true, color: MED_GREEN, fontSize: 11, fontFace: 'Calibri' } },
      { text: '0-2 scale per foot', options: { fontSize: 11, fontFace: 'Calibri' } },
      { text: '<5% Score 2; <20% Score 1 at D21', options: { fontSize: 11, fontFace: 'Calibri' } },
      { text: 'Ventilation + drinker check', options: { fontSize: 11, fontFace: 'Calibri' } },
    ],
    [
      { text: 'F: Feathers', options: { bold: true, color: MED_GREEN, fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: '0-4 scale by region', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Score 0-1 across flock', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Identify cause first (peck/mite/nutrition)', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
    ],
    [
      { text: 'L: Legs', options: { bold: true, color: MED_GREEN, fontSize: 11, fontFace: 'Calibri' } },
      { text: 'Bristol Gait 0-5; Hock 0-2', options: { fontSize: 11, fontFace: 'Calibri' } },
      { text: '<5% Gait 3+; Euthanise Score 5', options: { fontSize: 11, fontFace: 'Calibri' } },
      { text: 'Lighting (6h dark); litter depth; nutrition', options: { fontSize: 11, fontFace: 'Calibri' } },
    ],
    [
      { text: 'A: Activity', options: { bold: true, color: MED_GREEN, fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Distribution score 1-3; flight distance', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Score 1; <1m flight distance', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Map temperature + check ammonia/CO2', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
    ],
    [
      { text: 'W: Weight', options: { bold: true, color: MED_GREEN, fontSize: 11, fontFace: 'Calibri' } },
      { text: 'CV%; vs breed curve', options: { fontSize: 11, fontFace: 'Calibri' } },
      { text: 'CV <10% broilers; <8% pullets', options: { fontSize: 11, fontFace: 'Calibri' } },
      { text: 'Calibrate scale; check resource access', options: { fontSize: 11, fontFace: 'Calibri' } },
    ],
    [
      { text: 'S: Skin', options: { bold: true, color: MED_GREEN, fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Cellulitis; breast blisters; colour', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Pull processor condemnation report', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Catching crew review; E. coli vaccine timing', options: { fontSize: 11, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
    ],
  ], [1.5, 1.8, 2.2, 3.9]);

  // 30. Key Takeaways + Q&A
  const s30 = pptx.addSlide();
  s30.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: DARK_GREEN } });
  s30.addShape(pptx.ShapeType.rect, { x: 0, y: 4.5, w: 10, h: 0.15, fill: { color: GOLD } });
  s30.addText('Key Takeaways', { x: 0.5, y: 0.2, w: 9, h: 0.6, fontSize: 22, color: WHITE, bold: true, align: 'center', fontFace: 'Calibri' });
  const takeaways = [
    'T-FLAWS is one system: six indicators that are connected, not isolated',
    'Your earliest warning is Activity — 24-48 hours before disease is visible',
    'Wet litter shows up in Toes first, then Legs and Skin — fix litter, fix multiple scores',
    'Cellulitis = #1 total carcass condemnation cause. Pull your processor report after every kill.',
    'NFACC requires systematic monitoring — T-FLAWS is exactly that tool',
    'Score 5 leg: euthanise immediately. No exceptions.',
  ];
  const koObjs = takeaways.map(t => ({ text: t, options: { bullet: true, fontSize: 14, color: WHITE, fontFace: 'Calibri', paraSpaceBefore: 6 } }));
  s30.addText(koObjs, { x: 0.6, y: 0.9, w: 8.8, h: 3.2, valign: 'top' });
  s30.addShape(pptx.ShapeType.rect, { x: 2.5, y: 4.15, w: 5, h: 0.05, fill: { color: GOLD } });
  s30.addText('Questions & Discussion', { x: 0.5, y: 4.25, w: 9, h: 0.5, fontSize: 20, color: GOLD, bold: true, align: 'center', fontFace: 'Calibri' });
  s30.addText('Canadian Poultry Training Series — Course 3 of 17  |  canadianpoultry.ca/learning-centre', { x: 0.5, y: 4.85, w: 9, h: 0.35, fontSize: 10, color: LIGHT_GREEN, align: 'center', fontFace: 'Calibri' });

  const out3 = path.join(C3, 'Course3_T-FLAWS_Presentation.pptx');
  await pptx.writeFile({ fileName: out3 });
  console.log('✓ Course 3 PPTX written:', out3);
}

// ═══════════════════════════════════════════════════════════════════════════
// COURSE 7: Common Poultry Diseases (2 hours, ~58 slides)
// ═══════════════════════════════════════════════════════════════════════════
async function buildCourse7() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Canadian Poultry Consultants (CPC)';
  pptx.company = 'CPC Training Series';
  pptx.subject = 'Common Poultry Diseases: Practical Training for Farmers';

  // 1. Title
  titleSlide(pptx, 'COURSE 7 OF 17 — CANADIAN POULTRY TRAINING SERIES',
    'Common Poultry Diseases\nPractical Training for Farmers',
    'A Practical Disease Management Guide for Commercial Poultry Farmers in Canada',
    'April 2026  |  2-Hour Presentation');

  // 2. Agenda
  twoColSlide(pptx, 'What We Cover Today (2 Hours)',
    'First Hour',
    ['Introduction: disease pays off to know',
     'How disease gets into your barn',
     'Biosecurity basics',
     'Common diseases in broilers:',
     '  Coccidiosis, NE, Yolk sac infection',
     '  CRD/IBV, IBD, IBH, Ascites',
     'Common diseases in layers and breeders',
     '  Fowl cholera, Marek\'s, ILT',
     '  Cage fatigue, IBV, aMPV, E. coli peritonitis'],
    'Second Hour',
    ['Common diseases in ducks and geese',
     '  Avian Influenza, Botulism, Duck plague',
     '  DVH, Derzsy\'s, Riemerellosis',
     'Common diseases in turkeys',
     '  HE, Blackhead, Reovirus, E. coli, MG',
     'Cross-species disease concerns',
     '  Newcastle Disease, PPMV-1',
     'Practical disease prevention',
     'Reacting to disease: step-by-step',
     'Summary, discussion questions, Q&A']);

  // 3. Introduction
  contentSlide(pptx, 'Introduction: Your Birds Are Everything',
    ['When birds are doing well, everything else falls into place: good growth, steady production, less stress day to day',
     '',
     'When disease hits, it can move quickly:',
     '  It might start with just a few off birds',
     '  Before you notice, it is already spreading through the flock',
     '',
     'Going digital helps: real-time info on water intake, feed consumption, weight gain, temperature, air, humidity',
     '  Small changes show up early',
     '  Step in sooner, make the right call, stay ahead of problems',
     '',
     'Not all birds face the same risks: broilers, layers, breeders, turkeys, ducks, and geese each have their own vulnerabilities'],
    img(C7, 'Digital flock management.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Digital barn management system displaying real-time environmental parameters.' });

  // 4. Why Knowing Diseases Pays Off
  contentSlide(pptx, '1. Why Knowing Your Bird\'s Diseases Pays Off', [
    'Disease does not just cost you birds — it costs you money in ways that sneak up on you:',
    '  Sick broilers grow slower, eat more feed, and still do not hit target weight',
    '  Diseases like Salmonella can make people sick — a problem no one wants at the end of the supply chain',
    '',
    'Most problems give you warning signs before they spiral out of control:',
    '  Watery or swollen eyes',
    '  Birds with ruffled feathers',
    '  Sudden drop in feed or water intake — these are red flags',
    '',
    'Know what "normal" looks like in your barn so you can catch "not normal" the moment it shows up',
    '',
    'If 50 broilers suddenly stop eating and huddle in corners: pick up the phone and call your vet.',
    'Waiting costs you more than the call ever will.',
  ], null);

  // 5. How Disease Gets In
  contentSlide(pptx, '2. How Disease Gets Into Your Barn',
    ['Disease does not appear out of nowhere — it gets carried in. Once inside, it moves fast.',
     '',
     'Common entry routes:',
     '  Sick birds passing disease directly to healthy ones',
     '  Contaminated equipment: shared drinker, borrowed glove, shovel, bucket',
     '  Feed and water: keep feed storage sealed against rodents and wild birds',
     '  Air: IBV and Avian Influenza travel on dust and air currents between houses',
     '',
     'The one most farmers underestimate: PEOPLE',
     '  Your own boots and clothing carry pathogens from pen to pen',
     '  Change footwear between houses. Use boot dips. Ten seconds. It matters.',
     '',
     'Wild migratory birds: one of the most serious threats. Can carry Avian Influenza silently.',
     'Rule: if it touches your birds or their environment, it can carry something harmful.'],
    img(C7, 'contaminated outside.jpg'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Contaminated outdoor environment at a barn entry. Wild birds, equipment, boots — all disease vectors.' });

  // 6. Biosecurity Basics
  contentSlide(pptx, '3. Biosecurity Basics: First Line of Defence',
    ['Good biosecurity is not complicated — but it must be CONSISTENT',
     '',
     'Start at the door:',
     '  Everyone entering: clean coveralls + clean footwear before crossing the threshold',
     '  Footbath at entrance — not optional',
     '  Danish entry system: physical boundary between outside world and clean barn',
     '  Shower-in if possible; barn-only coveralls and boots',
     '',
     'Keep water lines clean:',
     '  Run an acidifier weekly to break down biofilm (harbours bacteria — often overlooked)',
     '',
     'Barn environment is a disease prevention tool:',
     '  Too damp or crowded = invitation for coccidiosis',
     '  Too dry = airways irritated, more vulnerable to respiratory disease',
     '  Hit your ventilation targets, monitor humidity (RH%)',
     '  Climate control is as much disease prevention as any vaccine'],
    img(C7, 'biosecurity_door_closed_chicks.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Danish entry system (biosecurity bench) at barn entrance: physical divide between clean and dirty zones.' });

  // 7. Section: Broiler Diseases
  sectionSlide(pptx, 'SECTION 4', 'Common Diseases in Broilers', 'What to Watch For');

  // 8. Broilers: Introduction to the Group
  contentSlide(pptx, 'Common Diseases in Broilers: Why They Are Vulnerable',
    ['Broilers grow fast — and that speed comes at a cost',
     'The faster a bird grows, the more stress its body is under, and the more vulnerable it becomes to disease',
     '',
     'Seven key diseases to know in your broiler barn:',
     '  1. Coccidiosis',
     '  2. Necrotic Enteritis (Clostridium perfringens)',
     '  3. Yolk Sac Infection',
     '  4. CRD and Infectious Bronchitis Virus (IBV)',
     '  5. Infectious Bursal Disease (IBD / Gumboro)',
     '  6. Inclusion Body Hepatitis (IBH)',
     '  7. Ascites (Water Belly)',
     '',
     'Knowing what to look for puts you ahead of the problem'],
    img(C7, 'early_disease_detection_flock.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Systematic daily observation is your first line of on-farm diagnosis.' });

  // 9. Coccidiosis
  contentSlide(pptx, 'Coccidiosis (Eimeria spp.)',
    ['Caused by: Eimeria species — a parasitic infection',
     '',
     'Signs to watch for:',
     '  Bloody droppings: bright red or orange-tinged with mucus',
     '  Birds sitting down, stop eating, look like they have given up',
     '  Increased mortality in younger birds',
     '',
     'Act fast: do NOT wait. Call your vet and get medicated feed or water treatment started right away.',
     'The sooner you act, the less of your flock you lose.',
     '',
     'Prevention:',
     '  Keep litter dry — wet litter is a breeding ground for coccidia',
     '  Follow your vaccination schedule (live coccidiosis vaccine or coccidiostat in feed)',
     '  Full cleanout and disinfection between every batch'],
    img(C7, 'coccidiosis_v4_fixed.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Broiler showing signs consistent with coccidiosis — bloody droppings, reduced feed intake, huddling. Call your vet.' });

  // 10. Necrotic Enteritis
  contentSlide(pptx, 'Necrotic Enteritis (Clostridium perfringens)',
    ['A gut disease on the rise across Canadian poultry production as antibiotic growth promoters are withdrawn',
     '',
     'Signs to watch for:',
     '  Dark brown drooping, depressed birds',
     '  Sudden death — birds look fine, then they are not',
     '  Often strikes alongside coccidiosis (the two diseases go hand in hand)',
     '',
     'In layers: NE often follows coccidiosis — double hit on gut health',
     '',
     'Prevention:',
     '  Managing coccidia well is your best NE prevention',
     '  Keep litter dry and avoid overcrowding',
     '  Consult your vet: probiotics, competitive exclusion products, and feed additives',
     '  Vaccination options available in Canada — ask your vet'],
    img(C7, 'NE_droppings_final.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Dark brown droppings and depressed birds may indicate Necrotic Enteritis (Clostridium perfringens).' });

  // 11. Yolk Sac Infection
  contentSlide(pptx, 'Yolk Sac Infection (Omphalitis / Mushy Chick Disease)',
    ['Signs to watch for:',
     '  Losing chicks in the first 7 days of life',
     '  Peak mortality at 3-5 days old',
     '  Inactive chicks from placement — not interested in feed or water, just fade',
     '',
     'Two distinct sources of the problem:',
     '  Hatchery: poor temperature and humidity management during incubation → infection',
     '  Breeder level: inadequate vaccination → reduced maternal antibody transfer to chick;',
     '               poor flock hygiene → vertical transmission through egg contamination',
     '',
     'There is not much you can do once it is happening',
     'Monitor early mortality closely — tells you if your chick source has a problem',
     '',
     'Key action: report to your chick supplier. This is their problem to fix.'],
    img(C7, 'Yoik sacculitis mortality.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Omphalitis/yolk sac infection in a day-old chick — inactive from placement, peak mortality Days 3-5.' });

  // 12. CRD and IBV
  contentSlide(pptx, 'CRD and Infectious Bronchitis Virus (IBV)',
    ['Two most common respiratory culprits in broilers — they look similar',
     '',
     'Signs:',
     '  Sneezing, nasal discharge',
     '  Birds not growing the way they should',
     '',
     'Key difference:',
     '  CRD (Mycoplasma gallisepticum) builds gradually',
     '  IBV hits fast: within a few days you can have birds sneezing right across the barn',
     '',
     'Walk into a barn full of sneezing? That is IBV until proven otherwise.',
     'Get your vet on the phone.',
     '',
     'Prevention:',
     '  IBV vaccination is your main defence — make sure it is part of your program',
     '  Specific vaccine strains matter for your region — ask your vet which strains are circulating'],
    img(C7, 'crd_ibv_respiratory.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Respiratory signs (sneezing, nasal discharge, higher mortality) in a broiler barn — CRD/IBV co-infection.' });

  // 13. IBD
  contentSlide(pptx, 'Infectious Bursal Disease (IBD / Gumboro Disease)',
    ['Signs:',
     '  White, watery droppings — the red flag',
     '  Birds lose appetite, sit with ruffled feathers, look depressed',
     '  Typically hits birds 3-6 weeks old; sudden elevated mortality',
     '',
     'Why IBD is dangerous:',
     '  It attacks the immune system (bursa of Fabricius)',
     '  Leaves birds wide open to other infections',
     '  If IBD gets into an unvaccinated flock: you will be fighting secondary problems long after',
     '',
     'Prevention:',
     '  Vaccination is critical — unvaccinated flocks are completely vulnerable',
     '  Review your vaccination timing and method with your vet',
     '  Some newer IBD strains are more virulent — confirm your vaccine covers current field strains'],
    img(C7, 'IBD_final_droppings.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'White watery droppings and depressed birds with IBD (Gumboro disease) — birds 3-6 weeks old, sudden elevated mortality.' });

  // 14. IBH
  contentSlide(pptx, 'IBH — Inclusion Body Hepatitis (Adenovirus)',
    ['Often catches farmers off guard because it hits surprisingly early',
     '',
     'Timeline:',
     '  Mortality most commonly seen from 3 to 7 weeks of age',
     '  Sudden onset: peaks within 3-4 days',
     '  Total course: 9-15 days',
     '',
     'Why it is different from most diseases:',
     '  Comes in through the chick itself — passed down from breeder flocks',
     '  By the time you see it in your barn, it was already there on arrival',
     '  No treatment once it hits',
     '',
     'The solution is UPSTREAM:',
     '  Breeders must be vaccinated so chicks come in with immunity already built in',
     '  If this is a recurring problem on your farm: call your vet',
     '  Autogenous vaccines can be produced specifically for your breeder flock'],
    img(C7, 'ibh_broiler_outbreak.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'IBH causes mortality in broilers, typically presenting at 3-7 weeks — sudden onset, peaks in 3-4 days.' });

  // 15. Ascites
  contentSlide(pptx, 'Ascites (Water Belly / Pulmonary Hypertension Syndrome)',
    ['Pick up a bird that seems sluggish and abnormally heavy:',
     '  Soft, fluid-filled belly? That is ascites.',
     '  Fluid building up in the abdomen because the heart and lungs cannot keep up with rapid growth',
     '',
     'This is not caused by a germ — it is a management and environment problem:',
     '  Poor ventilation worsens it',
     '  Overcrowding worsens it',
     '  Fast-growing genetics are the underlying vulnerability',
     '',
     'What to do:',
     '  Improve ventilation immediately',
     '  Manage stocking density',
     '  Consult your veterinarian',
     '  Some nutritional interventions (antioxidants, slower early growth) can help',
     '  Breeding companies have programs to reduce ascites susceptibility — check your breed spec'],
    img(C7, 'ascites_bigger_belly.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Broiler with ascites (water belly): abdominal fluid accumulation from heart/lung failure to keep pace with rapid growth.' });

  // 16. Broiler Prevention Summary
  contentSlide(pptx, 'Broiler Prevention: The Basics That Cover Everything', [
    'Start with clean chicks: source from properly vaccinated, disease-free breeder flocks',
    '  What comes in the box sets the tone for the whole grow-out',
    '',
    'Follow your vaccination schedule: do not skip or delay. Your vet-recommended program exists for a reason.',
    '',
    'Clean between every batch: full cleanout, disinfection, and dry-out before new chicks arrive. No shortcuts.',
    '',
    'Keep litter dry: fix drinker leaks immediately; manage ventilation to control moisture',
    '',
    'Do not overcrowd: stress damages air quality and makes every disease hit harder',
    '',
    'Ventilate properly: fresh air, correct temperature, and humidity are disease prevention tools',
    '',
    'Keep water clean always: clean drinker lines regularly',
  ], null);

  // 17. Section: Layers and Breeders
  sectionSlide(pptx, 'SECTION 5', 'Common Diseases in Layers and Breeders', 'What Quietly Costs You Money Before It Becomes Obvious');

  // 18. Layers/Breeders: Overview
  contentSlide(pptx, 'Layers and Breeders: The Long Game',
    ['These birds live in your barn 60-80 weeks or more',
     'A small unmanaged problem in week 20 can drag down production all the way to week 70-80',
     '',
     'Main health challenge categories:',
     '  Gut health problems',
     '  Respiratory disease',
     '  Drops in egg production, shell quality, or hatchability',
     '  Bone and metabolic issues',
     '',
     'Most of these diseases are manageable',
     'Even vaccinated flocks are not bulletproof — newer disease variants break through standard vaccine programs',
     '',
     'Your best tools: daily observation + good records + working relationship with your flock vet'],
    img(C7, 'layer barn.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Commercial laying hen barn. Feather condition, eggshell quality, and production rate are the primary health indicators.' });

  // 19. Fowl Cholera
  contentSlide(pptx, 'Fowl Cholera (Pasteurella multocida)',
    ['Follows the migration season in Canada — often arrives with wild Canada Geese or Snow Geese',
     '',
     'Still showing up in Canadian breeder flocks — catching some farmers off guard',
     'Even appearing in vaccinated birds now',
     '',
     'Classic signs:',
     '  Facial swelling',
     '  Green droppings',
     '  Puffy, swollen wattles',
     '',
     'In commercial flocks today:',
     '  More likely to quietly settle into joints and cause lameness before anything obvious',
     '',
     'Do NOT assume vaccination alone has you covered',
     'Wild goose control around your property is part of your fowl cholera program'],
    img(C7, 'fowl_cholera_matte_wattles.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Swollen wattles in hens with fowl cholera. Pasteurella multocida septicemia causes rapid vascular compromise.' });

  // 20. Marek's Disease
  contentSlide(pptx, "Marek's Disease",
    ["A herpes virus infection — causes unilateral (one-sided) leg paralysis and grey eye",
     "Primarily seen in pullets and older layers",
     "",
     "If you're running a commercial operation and birds are vaccinated at the hatchery: your risk is low",
     "",
     "The bigger concern right now:",
     "  Backyard and small flocks where hatchery vaccination is not guaranteed",
     "  Marek's virus persists in the environment (shed in feather follicle dust)",
     "  One unvaccinated bird in a mixed flock is a risk",
     "",
     "Signs in unvaccinated flocks:",
     "  Unilateral leg paralysis (one leg stretched forward, one back)",
     "  Grey, irregular pupil (Marek's eye)",
     "  Weight loss, pale comb",
     "",
     "Vaccination at hatchery is nearly 100% effective — do not skip it"],
    img(C7, 'Marek.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: "Marek's disease: unilateral leg paralysis caused by lymphomatous infiltration of the sciatic nerve." });

  // 21. ILT
  contentSlide(pptx, 'Infectious Laryngotracheitis (ILT)',
    ['Another herpes virus infection',
     '',
     'Signs:',
     '  Sneezing and bloody coughing',
     '  Birds extending their neck gasping for air',
     '  Watery eyes',
     '  Egg production drops',
     '',
     'NOTIFIABLE DISEASE in Canada — you are required to report it to the CFIA',
     '',
     'In commercial operations: relatively stable, not a major active threat',
     'Watch for it especially near small or backyard flocks (which may carry it)',
     '',
     'Vaccination available and used in endemic areas',
     'If you suspect ILT: isolate birds, call your vet, and report to CFIA'],
    img(C7, 'ILT_breeder_farm.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Hemorrhagic tracheal exudate from a bird with ILT. Blood-tinged mucus and severe respiratory distress are hallmarks.' });

  // 22. Layer Osteoporosis
  contentSlide(pptx, 'Layer Osteoporosis (Previously: Cage Layer Fatigue)',
    ['What happens when a hen\'s body cannot keep up with the calcium demands of laying',
     '',
     'Signs:',
     '  Weak, easily broken legs',
     '  Soft or deformed keel bone',
     '  Hens that cannot stand up',
     '',
     'Still one of the most frequently reported conditions in Canadian laying flocks',
     '  Tied directly to feed management: calcium and phosphorus balance',
     '',
     'As the industry moves to cage-free housing: the name is changing, but the problem is not going away',
     '  Cage-free hens can actually develop MORE keel bone fractures from perch collisions and falls',
     '',
     'Prevention:',
     '  Consult your feed company: update calcium/phosphorus levels as the flock ages',
     '  Ensure vitamin D3 levels are adequate throughout the laying period'],
    img(C7, 'Cage Fatigue_layer_farm.PNG'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Layer hens with osteoporosis: bone fragility and keel deformities in peak-production hens with inadequate calcium.' });

  // 23. IBV in Layers
  contentSlide(pptx, 'Infectious Bronchitis (IBV) in Layers',
    ['The real culprit behind most sudden egg production drops in Canadian flocks',
     'Thin shells, wrinkled eggs, shell-less eggs, drop in production',
     '',
     'IBV is everywhere in Canada right now',
     '  Dominant Delmarva (DMV) variant is breaking through vaccines in some Eastern Canadian layer flocks',
     '  Even vaccinated birds may not be fully protected',
     '',
     'Signs in layers:',
     '  Sudden production drop',
     '  Soft-shelled, shell-less, or misshapen eggs',
     '  Respiratory signs: sneezing, nasal discharge',
     '',
     'If egg quality tanks or production peaks lower than expected:',
     '  IBV should be the FIRST thing you rule out',
     '  Contact your vet: serology or PCR testing can confirm the strain'],
    img(C7, 'IBV_layer_farm.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Layer barn affected by IBV: wrinkled or soft-shelled eggs, production drop, and respiratory signs are the triad.' });

  // 24. aMPV
  contentSlide(pptx, 'Avian Metapneumovirus (aMPV) — A Growing Concern',
    ['Primarily known as a turkey disease — but it also infects chickens',
     '',
     'aMPV arrived in Canada in 2024:',
     '  Already confirmed in Ontario, Manitoba, and Quebec',
     '  Most farmers have not had to deal with this until recently',
     '',
     'Signs:',
     '  Swollen heads and eye infections',
     '  Tilted necks',
     '  Poor peak production and egg drops',
     '  Spreads through the air — once in a barn, it moves quickly',
     '',
     'IMMEDIATELY NOTIFIABLE TO THE CFIA',
     '  If you suspect aMPV: isolate birds, call your vet, report to CFIA today',
     '',
     'Vaccines are being developed and licensed in Canada — ask your vet about current availability'],
    img(C7, 'aMPV.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Breeder barn affected by aMPV: swollen head, eye infection, and respiratory signs. Notifiable to CFIA.' });

  // 25. Bacterial Peritonitis / Salpingitis
  contentSlide(pptx, 'Bacterial Peritonitis and Salpingitis (E. coli)', [
    'Currently the SINGLE MOST COMMON condition being diagnosed in Canadian layer flocks',
    '',
    'Signs:',
    '  Hens dying in lay (no prior obvious illness)',
    '  Pasted vents',
    '  Swollen abdomen',
    '  Higher-than-expected early-lay mortality',
    '',
    'Why it is increasing:',
    '  Denser housing as industry moves cage-free',
    '  Reduced antibiotic use',
    '',
    'Your best defences:',
    '  Clean water management',
    '  Good litter management',
    '  Early-lay mortality monitoring',
    '  E. coli vaccination (effectiveness varies — works best alongside management, not standalone)',
  ], null);

  // 26. Layers Prevention Summary
  contentSlide(pptx, 'Layer and Breeder Practical Prevention', [
    'Clean your barn before birds arrive: E. coli, coccidia, and Clostridium survive in litter and water lines',
    '',
    'Vaccination is your foundation, not your finish line:',
    '  Core vaccines: IBV, IBD, Marek\'s, ILT, E. coli, aMPV, Salmonella, ND, AE',
    '  Only works as well as the bird\'s immune system allows — stress and poor nutrition blunt the response',
    '',
    'Feed and water are medicine:',
    '  Ca:P imbalances lead directly to weak bones and soft shells later in lay',
    '  Update feed program as flock ages — not just at placement',
    '',
    'Watch your birds every day:',
    '  Drops in water intake, feed, or egg numbers show up 24-48 hours before dead birds do',
    '  Investigate any deviation immediately. Do not wait to call your vet.',
  ], null);

  // 27. Section: Ducks and Geese
  sectionSlide(pptx, 'SECTION 6', 'Common Diseases in Ducks and Geese', 'Waterfowl Have Their Own Set of Challenges');

  // 28. Ducks/Geese Overview
  contentSlide(pptx, 'Ducks and Geese: Unique Risks',
    ['Waterfowl are hardier than chickens in some ways — but exposed to different risks:',
     '  Stagnant water',
     '  Wild migratory birds',
     '  Damp environments',
     '',
     'Knowing what to look for can be the difference between catching something early and losing a good chunk of your flock',
     '',
     'Six key diseases in waterfowl:',
     '  Avian Influenza (Bird Flu)',
     '  Botulism (Limberneck)',
     '  Duck Viral Enteritis (Duck Plague)',
     '  Duck Virus Hepatitis (DVH)',
     "  Derzsy's Disease (Goose Parvovirus)",
     '  Riemerellosis (New Duck Disease)'],
    img(C7, 'Canadian duck and geese farming-2.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Canadian duck and goose farming. Waterfowl are natural reservoirs for avian influenza — heightened biosecurity is essential.' });

  // 29. Avian Influenza
  contentSlide(pptx, 'Avian Influenza (Bird Flu): The Biggest Threat in Canada', [
    'The biggest cross-species threat in Canadian poultry — full stop',
    '',
    'Signs:',
    '  Sudden and severe drop in egg production',
    '  Birds going off feed',
    '  Swollen heads',
    '  Rapid, unexplained deaths',
    '',
    'Highly Pathogenic Avian Influenza (HPAI):',
    '  Spreads fast — entire flocks must be depopulated to stop it',
    '  Wild migratory waterfowl can deposit it on your property without showing a single symptom',
    '',
    'FEDERALLY REPORTABLE DISEASE — call your vet AND the CFIA IMMEDIATELY if you have any suspicion',
    '  Early reporting protects your farm AND your neighbours',
    '  Do not wait for lab confirmation before reporting',
  ], null);

  // 30. Botulism
  contentSlide(pptx, 'Botulism (Limberneck) in Waterfowl',
    ['Caused by: Clostridium botulinum producing a toxin in stagnant water and decaying organic matter',
     '',
     'Signs:',
     '  Progressive weakness',
     '  Inability to hold their heads up — farmers call this "limberneck"',
     '  Can move through a flock quickly',
     '',
     'Source: stagnant, dirty water or decomposing material in ponds',
     '',
     'Any sudden weakness in waterfowl: check the water source FIRST',
     '',
     'Response:',
     '  Remove affected birds from water (they can drown)',
     '  Drain and clean the water source before other birds drink from it',
     '  Call your vet — antitoxin available in early cases'],
    img(C7, 'Limberneck diseases.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Duck with limberneck (botulism): flaccid neck paralysis caused by C. botulinum toxin from decaying organic matter in ponds.' });

  // 31. Duck Viral Enteritis
  contentSlide(pptx, 'Duck Viral Enteritis (Duck Plague)',
    ['Signs:',
     '  Sudden deaths — often birds that looked healthy the day before',
     '  Visible bleeding around the bill or vent',
     '  High mortality, spreads fast through the flock',
     '',
     'First reported in Canada: 1976, Muscovy duck flock in Alberta',
     '',
     'Transmission:',
     '  Contact with infected wild waterfowl',
     '  Flocks near open water or along migration routes are especially vulnerable',
     '',
     'Once it is in, it is hard to stop',
     '',
     'Prevention:',
     '  Vaccination available for duck flocks in Canada',
     '  Limit contact with wild waterfowl',
     '  Biosecurity at water sources'],
    img(C7, 'duck_viral_enteritis_fixed.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Duck Viral Enteritis (Duck Plague): bloody droppings with high mortality in adult ducks and geese.' });

  // 32. DVH
  contentSlide(pptx, 'Duck Virus Hepatitis (DVH)',
    ['A highly contagious viral disease that primarily strikes ducklings under 3 weeks old',
     '',
     'Signs:',
     '  Weakness, then birds fall on their sides',
     '  Heads thrown back in a spasm — opisthotonos',
     '  Mortality can be extremely high in young flocks',
     '',
     'There is no treatment once signs appear',
     '',
     'Prevention is your only tool:',
     '  Source ducklings from clean hatcheries',
     '  Maternal vaccination of breeder ducks passes protective antibodies to ducklings',
     '  Tight biosecurity — clean sourcing only',
     '',
     'If you see sudden spasms and head-back deaths in ducklings under 3 weeks: call your vet immediately'],
    img(C7, 'duck_virus_hepatitis.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Duck Virus Hepatitis causes acute high mortality in young ducklings under 3 weeks — no treatment, prevention only.' });

  // 33. Derzsy's Disease
  contentSlide(pptx, "Derzsy's Disease (Goose Parvovirus)",
    ['Targets goslings under 4 weeks old and young Muscovy ducklings — the most vulnerable birds',
     '',
     'Signs:',
     '  Lethargy, poor appetite',
     '  In severe cases: sudden death with no warning',
     '  Survivors: often come out weak and stunted, never reaching full potential',
     '  In severe cases: ascites (fluid in abdomen) and heart problems',
     '',
     'No treatment — source prevention is your only real line of defence',
     '',
     'Prevention:',
     '  Source from clean, vaccinated breeding stock',
     '  Vaccination of breeder flock is effective',
     '  Quarantine any new birds before introducing to your flock'],
    img(C7, 'derzsys_duck_farm.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: "Goslings affected by Derzsy's Disease: stunted growth, ascites, and heart problems. Highly lethal parvoviral infection." });

  // 34. Riemerellosis
  contentSlide(pptx, 'Riemerellosis (New Duck Disease)',
    ['Caused by: Riemerella anatipestifer — one of the biggest threats to young ducklings and goslings',
     '',
     'Typically strikes birds 1-7 weeks old',
     '',
     'Signs:',
     '  Watery eyes',
     '  Greenish diarrhea',
     '  Neurological signs: head tremors, loss of coordination, birds flipping onto backs and paddling',
     '',
     'Spreads: through the air AND through small foot scratches between birds',
     'Crowded, wet conditions are a recipe for an outbreak',
     '',
     'Response:',
     '  Isolate affected birds IMMEDIATELY',
     '  Keep brooder dry',
     '  Call your vet early — proper antibiotic treatment works best when started quickly'],
    img(C7, 'riemerellosis_fixed_onehead.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Duck with torticollis and greenish diarrhea caused by Riemerellosis. Neurological signs are characteristic findings.' });

  // 35. Waterfowl Prevention
  contentSlide(pptx, 'Keeping Your Waterfowl Flock Safe', [
    'Refresh pond or trough water regularly and remove all decaying plant material',
    'Keep waterfowl SEPARATE from your chickens — different pathogens, easy cross-transmission',
    'Control mosquitoes around ponds — they can carry and transmit several diseases',
    'Limit exposure to wild migratory birds: use netting or covered runs where possible',
    'Source ducklings and goslings from reputable, disease-tested hatcheries',
    'Keep litter dry and avoid overcrowding — especially with young birds',
    '',
    'Know your reportable diseases:',
    '  Avian Influenza: report to your provincial vet IMMEDIATELY',
    '',
    'When in doubt: ISOLATE first and call your vet',
    '  Early action almost always leads to a better outcome',
  ], null);

  // 36. Section: Turkeys
  sectionSlide(pptx, 'SECTION 7', 'Common Diseases in Turkeys', 'Among the Most Disease-Sensitive Birds in Your Barn');

  // 37. Turkeys: Overview
  contentSlide(pptx, 'Turkeys: Why They Need Special Attention',
    ['Turkeys are among the most disease-sensitive birds in your barn',
     'They react harder than chickens to the same pathogens',
     'A problem simmering quietly in a mixed flock can hit your turkeys fast and hard',
     '',
     'Five key diseases to know:',
     '  1. Hemorrhagic Enteritis (HE)',
     '  2. Blackhead Disease (Histomoniasis)',
     '  3. Reovirus (Viral Arthritis / Lameness)',
     '  4. Colibacillosis (E. coli Infection)',
     '  5. Infectious Sinusitis (Mycoplasma gallisepticum/MG)',
     '',
     'Knowing the main threats and what to watch for early puts you ahead of the curve'],
    img(C7, 'Canadian Turkey farming-2.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Commercial turkey production in Canada. Turkeys are highly susceptible to HE, Blackhead, and some respiratory pathogens.' });

  // 38. Hemorrhagic Enteritis
  contentSlide(pptx, 'Hemorrhagic Enteritis (HE) in Turkeys',
    ['Caused by: Turkey Adenovirus 3',
     'Targets turkeys 6-12 weeks of age',
     '',
     'Signs:',
     '  Bloody droppings',
     '  Sudden deaths in birds that looked healthy the day before',
     '  General slump across the flock',
     '',
     'Why it is dangerous:',
     '  Suppresses the immune system — leaves birds wide open to secondary bacterial infections',
     '  Secondary infections are often what cause the real losses',
     '',
     'Prevention:',
     '  Vaccination is available and WIDELY RECOMMENDED in commercial turkey operations across Canada',
     '  Vaccinate as part of your routine health program — do not wait for an outbreak'],
    img(C7, 'HE_turkey_farm.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Hemorrhagic Enteritis in turkeys: bloody droppings and intestinal hemorrhage, typically in 6-12 week-old birds.' });

  // 39. Blackhead Disease
  contentSlide(pptx, 'Blackhead Disease (Histomoniasis)',
    ['Caused by: Histomonas meleagridis — attacks the liver and ceca',
     '',
     'Signs:',
     '  Depressed birds',
     '  Sulphur-yellow droppings — characteristic',
     '  Darkened head (hence "blackhead")',
     '  Stop eating',
     '',
     'Showing up in Atlantic Canada and Ontario turkey and layer flocks in recent years',
     '  Linked partly to milder winters not killing off parasites the way cold snaps used to',
     '',
     'Transmission: through soil-dwelling cecal worm (Heterakis gallinarum)',
     '  Infected ground can remain a risk for YEARS',
     '',
     'Critical rule: NEVER let turkeys onto ground previously used by chickens',
     '  Chickens carry the parasite without showing signs'],
    img(C7, 'blackhead_subtle_head.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Turkey with Blackhead Disease: sulphur-yellow diarrhea and depressed, darkened head cyanosis.' });

  // 40. Reovirus
  contentSlide(pptx, 'Reovirus (Viral Arthritis / Lameness) in Turkeys', [
    'A serious and costly issue in Ontario turkey flocks',
    '',
    'Signs:',
    '  Birds reluctant to walk',
    '  Swollen tendons around the hock joint',
    '  In severe cases: ruptured tendons',
    '  Heavy toms are most commonly affected',
    '',
    'There is no cure once birds are lame',
    '',
    'Prevention strategy:',
    '  Maternal vaccination of BREEDER flocks to protect poults',
    '  Poults from vaccinated breeders receive maternal antibodies',
    '  This is the most effective strategy available',
    '',
    'If you are seeing lameness in toms: talk to your vet about your breeder vaccination program',
  ], null);

  // 41. Colibacillosis + MG in Turkeys
  twoColSlide(pptx, 'E. coli (Colibacillosis) and MG in Turkeys',
    'E. coli — #1 Bacterial Problem in Canadian Turkeys',
    ['Always present in the environment',
     'Becomes serious when birds are stressed, immunosuppressed, or when ventilation slips',
     'Signs: respiratory symptoms, swollen joints, sudden deaths',
     'Internal lesions on post-mortem',
     'Controls: litter management, ventilation, vaccination, control of HE and aMPV'],
    'Infectious Sinusitis (MG / Mycoplasma gallisepticum)',
    ['Slow-burning — rarely kills but quietly drains production numbers',
     'Signs: swollen sinuses under eyes, nasal discharge, laboured breathing',
     'Can be passed from breeder to poult through the egg',
     'Source from MG-clean breeders is essential',
     'Proper antibiotics can manage; eradication through blood testing is the long-term answer']);

  // 42. Turkey Prevention
  contentSlide(pptx, 'Keeping Your Turkey Flock Safe', [
    'Keep turkeys STRICTLY SEPARATED from chickens:',
    '  Many diseases pass silently between species and hit turkeys much harder',
    '  This includes Blackhead, Mycoplasma, and some respiratory viruses',
    '',
    'Know your reportable diseases:',
    '  Avian Influenza AND aMPV must be reported to the CFIA IMMEDIATELY',
    '',
    'Invest in good ventilation and dry litter:',
    '  Most bacterial diseases thrive in damp, poorly aired barns',
    '',
    'Source poults from MG-clean, disease-tested hatcheries',
    '',
    'Vaccinate for Hemorrhagic Enteritis as a routine part of your health program',
    '',
    'Keep wild birds out: fencing, netting, and covered runs reduce AI and aMPV exposure dramatically',
    '',
    'Work with your flock veterinarian regularly — not just when things go wrong',
  ], null);

  // 43. Section: Cross-Species
  sectionSlide(pptx, 'SECTION 8', 'Cross-Species Disease Concerns', 'When Disease Does Not Care What Kind of Bird It Is In');

  // 44. Cross-Species Overview
  contentSlide(pptx, 'Cross-Species Disease: The Multi-Farm Risk',
    ['Some of the most serious threats in Canadian poultry move freely between chickens, turkeys, ducks, and geese',
     '',
     'They can also arrive from a pigeon on your roofline or a wild bird during migration',
     '',
     'Keeping species separate is not just good practice — it is one of your most powerful disease prevention tools',
     '',
     'Key cross-species diseases in Canada:',
     '  Avian Influenza (covered in waterfowl section)',
     '  Fowl Cholera (Pasteurella multocida)',
     '  Newcastle Disease (Virulent Newcastle Disease / VND)',
     '  Pigeon Paramyxovirus (PPMV-1)',
     '  Mycoplasma (MG and MS)',
     '  Avian Metapneumovirus (aMPV)'],
    img(C7, 'Cross-species-diseases-2.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Cross-species disease risk on mixed Canadian poultry operations: shared airspace, equipment, and proximity create transmission pathways.' });

  // 45. Newcastle Disease
  contentSlide(pptx, 'Newcastle Disease (Virulent Newcastle Disease / VND)', [
    'Highly contagious viral disease affecting virtually every bird species on your farm',
    '',
    'Chickens are hit hardest, but turkeys, geese, and ducks are all vulnerable',
    '',
    'Signs:',
    '  Respiratory distress and diarrhea',
    '  Twisted necks and tremors',
    '  Sudden death',
    '',
    'Newcastle Disease re-emerged in Canada in 2025:',
    '  Two commercial pigeon farms in Chilliwack, British Columbia tested positive',
    '  A sharp reminder that no one should be complacent',
    '',
    'FEDERALLY REPORTABLE DISEASE under Canada\'s Health of Animals Act',
    '  Report to your vet and the CFIA immediately if you have any suspicion',
    '',
    'Pigeons are a key reservoir — seal your barns against pigeon entry',
  ], null);

  // 46. PPMV-1
  contentSlide(pptx, 'Pigeon Paramyxovirus (PPMV-1)',
    ['Racing and feral pigeons are the primary reservoir of this virus in Canada',
     '  Detected in Ontario feral pigeon population for decades',
     '',
     'PPMV-1 is a variant of the same virus that causes Newcastle Disease',
     '  Once it jumps from pigeons to your poultry: it can trigger Newcastle-like outbreaks',
     '',
     'Signs in affected birds:',
     '  Neurological signs: tremors, torticollis (neck twisting)',
     '  Diarrhea',
     '  Respiratory distress',
     '',
     'If pigeons have access to your barns, feed, or water: this is your risk',
     '',
     'Treated as a reportable concern when virulent strains are detected',
     '',
     'Practical rule: eliminate ALL pigeon access to barns — seal gaps, cover vents, remove perching'],
    img(C7, 'ppmv1_pigeon_opisthotonos_v3.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Pigeon with opisthotonos (head thrown back) caused by PPMV-1. Racing and feral pigeons are the primary reservoir in Canada.' });

  // 47. Managing Cross-Species Risk
  contentSlide(pptx, 'Managing Cross-Species Risk on Your Farm', [
    'There is no single minimum distance that guarantees prevention — full separation is the standard',
    '',
    'Safest approach:',
    '  Different buildings or different sites',
    '  No shared water, equipment, clothing, or traffic flow between species',
    '',
    'Firm habits that make a major difference:',
    '  Raise species in completely separate barns — not just different pens in the same barn',
    '  Maintain maximum distance between species if separate barns are not possible',
    '  Ensure SEPARATE ventilation systems between species',
    '  Never reuse leftover feed between species',
    '  Eliminate pigeon and wild bird access to all barns',
    '    Seal all gaps, cover vents, and remove perching opportunities',
    '',
    'Know your reportable diseases: AI, Newcastle Disease, and aMPV all require immediate CFIA reporting',
    'Build a relationship with a flock vet BEFORE there is a crisis',
  ], null);

  // 48. Section: Prevention
  sectionSlide(pptx, 'SECTION 9', 'Practical Disease Prevention', 'Daily Habits That Become Second Nature');

  // 49. Prevention: Daily Habits
  contentSlide(pptx, 'Daily Habits That Make a Difference', [
    'Biosecurity applies to EVERYONE:',
    '  Keep a visitor log, provide clean coveralls and boot covers',
    '  One exception is all it takes to let disease in',
    '',
    'Wash hands, change boots, and put on clean coveralls before entering any barn',
    '  And again before moving between barns housing different species',
    '',
    'Walk your flock every day and keep a simple health log:',
    '  Feed and water consumption, behaviour, unusual deaths',
    '  Something feels off? Call your vet THE SAME DAY — not the same week',
    '',
    'Keep litter dry and remove wet patches promptly:',
    '  Damp bedding is the single most common driver of bacterial disease in Canadian poultry barns',
    '',
    'Cover all feed at all times:',
    '  Keep out rodents, wild birds, and pigeons — all carry and transmit serious pathogens',
  ], null);

  // 50. Prevention: Vaccination + All-In/All-Out
  contentSlide(pptx, 'Vaccination and All-In/All-Out Production', [
    'Follow a vaccination program developed WITH your veterinarian:',
    '  Specific to your species, region, and production system',
    '  A program for a BC chicken barn may not be right for an Ontario turkey operation',
    '  Do not skip or delay: your program exists for a reason',
    '',
    'Practice all-in, all-out production where possible:',
    '  Move an entire flock in and out together',
    '  Full cleanout + dry rest period between flocks',
    '  Dramatically reduces disease carryover from one batch to the next',
    '',
    'Dispose of dead birds promptly using approved methods:',
    '  Composting, incinerator outside the barn, rendering, or burial',
    '  Leaving carcasses in or near the barn is an open invitation for disease to spread',
    '',
    'Know your reportable diseases and have the CFIA number accessible: 1-800-442-2342',
  ], null);

  // 51. Section: Reacting to Disease
  sectionSlide(pptx, 'SECTION 10', 'Reacting to Disease', 'The First Few Hours Matter More Than Most Farmers Realize');

  // 52. What to Do When Birds Get Sick
  contentSlide(pptx, 'What to Do When Birds Get Sick',
    ['Step 1 — Isolate first, ask questions later:',
     '  The moment you notice a bird drooping, off feed, or showing unusual signs',
     '  Move it to a separate pen AWAY from the rest of the flock',
     '  Do not wait to see if others get sick before you act',
     '',
     'Step 2 — Call your vet, not the internet:',
     '  Poultry diseases can look remarkably similar to each other',
     '  The wrong treatment can make things worse or delay proper diagnosis',
     '  Your vet is your first call, every time',
     '',
     'Step 3 — Support the birds while you wait:',
     '  Clean fresh water, dry bedding, warmth, and good airflow',
     '  You may not be able to treat without guidance, but you can keep birds comfortable'],
    img(C7, 'early_disease_detection_flock.png'),
    { x: 5.9, y: 0.88, w: 3.8, h: 4.0, caption: 'Systematic daily observation of bird behaviour, feed/water consumption, and mortality is your first line of diagnosis.' });

  // 53. Address the Source
  contentSlide(pptx, 'Address the Source, Not Just the Symptom', [
    'Isolating sick birds is step one — but removing the SOURCE is equally urgent',
    '',
    'Examples:',
    '  Ducks with neck drooping (botulism): isolate birds AND drain/clean the pond',
    '  Respiratory signs in a barn: isolate birds AND check for ventilation failures',
    '  Sudden IBV across the barn: isolate AND check neighbouring barns',
    '',
    'Treating sick birds without removing the source puts you right back in the same situation',
    '',
    'Never use leftover medications or traditional remedies without veterinary direction:',
    '  Antibiotic resistance is a growing challenge in Canadian poultry',
    '  Improper use makes it worse for every farmer',
    '',
    'Document everything:',
    '  Number of affected birds, signs observed, when it started, any recent farm changes',
    '  Your vet will ask — having it written down leads to a faster, more accurate diagnosis',
  ], null);

  // 54. Section: Summary
  sectionSlide(pptx, 'SECTION 11', 'Summary and Discussion', 'What It All Comes Down To');

  // 55. Summary: Three Things
  contentSlide(pptx, 'What It All Comes Down To', [
    'Three things working together:',
    '  1. Daily observation',
    '  2. Strong farm habits',
    '  3. Close relationship with your veterinarian',
    '',
    'Your birds tell you everything, if you are paying attention:',
    '  A bird sitting alone in a corner or a sudden dip in feed consumption is your cue to call your vet — not wait and see',
    '',
    'Housing and hygiene do the heavy lifting:',
    '  Clean dry litter, proper ventilation, and well-maintained equipment eliminate conditions most diseases need to take hold',
    '',
    'Your veterinarian is a partner, not a last resort:',
    '  Regular check-ins even when birds are healthy keep your program current',
    '  Build the kind of relationship where your vet already knows your operation when it matters most',
  ], null);

  // 56. Discussion Questions
  contentSlide(pptx, 'Discussion Questions for the Group', [
    '1. What disease risks are most relevant to your specific farm setup, species, and region?',
    '',
    '2. Have you experienced a disease outbreak before, and what did you wish you had known or done differently?',
    '',
    '3. What is one biosecurity habit you could realistically improve on your farm starting this week?',
    '',
    '4. Farmer Q&A: Open discussion of local farm challenges and solutions',
    '',
    '',
    'CFIA Reportable Disease Hotline: 1-800-442-2342',
    'Canadian Poultry Consultant Learning Centre: canadianpoultry.ca/learning-centre',
  ], null);

  // 57. Key Reportable Diseases Reference
  tableSlide(pptx, 'Key Reportable Diseases — Know Before You Need It', [
    [
      { text: 'Disease', options: { bold: true, color: WHITE, fill: { color: DARK_GREEN }, fontSize: 11, fontFace: 'Calibri' } },
      { text: 'Species Affected', options: { bold: true, color: WHITE, fill: { color: DARK_GREEN }, fontSize: 11, fontFace: 'Calibri' } },
      { text: 'Reporting Requirement', options: { bold: true, color: WHITE, fill: { color: DARK_GREEN }, fontSize: 11, fontFace: 'Calibri' } },
      { text: 'First Action', options: { bold: true, color: WHITE, fill: { color: DARK_GREEN }, fontSize: 11, fontFace: 'Calibri' } },
    ],
    [
      { text: 'Avian Influenza (HPAI)', options: { bold: true, color: RED_WARN, fontSize: 10, fontFace: 'Calibri' } },
      { text: 'All species + wild birds', options: { fontSize: 10, fontFace: 'Calibri' } },
      { text: 'FEDERALLY REPORTABLE — immediate', options: { fontSize: 10, fontFace: 'Calibri', color: RED_WARN, bold: true } },
      { text: 'Isolate flock, call vet + CFIA', options: { fontSize: 10, fontFace: 'Calibri' } },
    ],
    [
      { text: 'Newcastle Disease (VND)', options: { bold: true, color: RED_WARN, fontSize: 10, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'All species', options: { fontSize: 10, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'FEDERALLY REPORTABLE — immediate', options: { fontSize: 10, fontFace: 'Calibri', color: RED_WARN, bold: true, fill: { color: GRAY_BG } } },
      { text: 'Isolate, call vet + CFIA', options: { fontSize: 10, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
    ],
    [
      { text: 'aMPV', options: { bold: true, color: MED_GREEN, fontSize: 10, fontFace: 'Calibri' } },
      { text: 'Chickens, turkeys', options: { fontSize: 10, fontFace: 'Calibri' } },
      { text: 'Immediately notifiable to CFIA', options: { fontSize: 10, fontFace: 'Calibri' } },
      { text: 'Isolate, call vet + CFIA', options: { fontSize: 10, fontFace: 'Calibri' } },
    ],
    [
      { text: 'ILT', options: { bold: true, color: MED_GREEN, fontSize: 10, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Chickens', options: { fontSize: 10, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Notifiable — report to CFIA', options: { fontSize: 10, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
      { text: 'Isolate, call vet, submit birds', options: { fontSize: 10, fontFace: 'Calibri', fill: { color: GRAY_BG } } },
    ],
    [
      { text: 'Duck Viral Enteritis (Duck Plague)', options: { bold: true, color: MED_GREEN, fontSize: 10, fontFace: 'Calibri' } },
      { text: 'Ducks, geese', options: { fontSize: 10, fontFace: 'Calibri' } },
      { text: 'Notifiable — report to CFIA', options: { fontSize: 10, fontFace: 'Calibri' } },
      { text: 'Isolate, call vet', options: { fontSize: 10, fontFace: 'Calibri' } },
    ],
  ], [2.2, 1.8, 2.5, 2.9]);

  // 58. Final / Q&A
  const s58 = pptx.addSlide();
  s58.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: DARK_GREEN } });
  s58.addShape(pptx.ShapeType.rect, { x: 0, y: 4.5, w: 10, h: 0.15, fill: { color: GOLD } });
  s58.addText('Course 7 Key Takeaways', { x: 0.5, y: 0.2, w: 9, h: 0.55, fontSize: 22, color: WHITE, bold: true, align: 'center', fontFace: 'Calibri' });
  const takeaways7 = [
    'Most outbreaks are not bad luck — they are the result of a small lapse that built up over time',
    'Your earliest warning: daily observation of eating, drinking, droppings, and movement',
    'Damp litter is the single most common driver of bacterial disease in Canadian barns',
    'Isolate first, call your vet, remove the SOURCE not just the symptom',
    'Reportable diseases — AI, Newcastle, aMPV, ILT — call CFIA: 1-800-442-2342',
    'Species separation is one of your most powerful disease prevention tools',
    'Your vet is a partner. Regular check-ins save more money than emergency calls.',
  ];
  const ko7Objs = takeaways7.map(t => ({ text: t, options: { bullet: true, fontSize: 13, color: WHITE, fontFace: 'Calibri', paraSpaceBefore: 5 } }));
  s58.addText(ko7Objs, { x: 0.6, y: 0.85, w: 8.8, h: 3.25, valign: 'top' });
  s58.addShape(pptx.ShapeType.rect, { x: 2.5, y: 4.15, w: 5, h: 0.05, fill: { color: GOLD } });
  s58.addText('Questions & Discussion', { x: 0.5, y: 4.25, w: 9, h: 0.5, fontSize: 20, color: GOLD, bold: true, align: 'center', fontFace: 'Calibri' });
  s58.addText('Canadian Poultry Training Series — Course 7 of 17  |  canadianpoultry.ca/learning-centre', { x: 0.5, y: 4.85, w: 9, h: 0.35, fontSize: 10, color: LIGHT_GREEN, align: 'center', fontFace: 'Calibri' });

  const out7 = path.join(C7, 'Course7_Common_Poultry_Diseases_Presentation.pptx');
  await pptx.writeFile({ fileName: out7 });
  console.log('✓ Course 7 PPTX written:', out7);
}

// ─── Run both ───────────────────────────────────────────────────────────────
console.log('Building Course 3 presentation...');
await buildCourse3();
console.log('Building Course 7 presentation...');
await buildCourse7();
console.log('\nDone.');
