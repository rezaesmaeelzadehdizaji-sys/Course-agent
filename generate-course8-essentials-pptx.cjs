// generate-course8-essentials-pptx.cjs
// Course 8 Essentials deck: Vaccination and Treatment Basics (beginner edition, DRAFT, November 2026).
// Output: Course 8/Essentials/Course8_Essentials_Presentation.pptx
// Layouts and helpers copied from generate-course8-pptx.cjs so both decks share one look.
// Structured deck: theme + layouts + sections + speaker notes. Bracketed numbers in the notes
// are the reference numbers of Course 8/Essentials/Vaccination_and_Treatment_Essentials_draft.docx.
// Photos: only genuine photographs (CPC or openly licensed, credited on the slide). Images that
// look AI-generated are deliberately not used; process content is drawn as diagrams instead.
// apply_theme.js lives in the pptx skill folder and resolves jszip via NODE_PATH: point it here.
process.env.NODE_PATH = require('path').join(__dirname, 'node_modules');
require('module').Module._initPaths();
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { applyTheme } = require('C:/Users/rezae/.claude/skills/synced/33cb1383-3333-4ffc-bfc5-b721e3c66e2f_acc7843b-6056-432c-bb61-a96c4e547994/pptx/scripts/apply_theme.js');

const ROOT = __dirname;
const C8 = path.join(ROOT, 'Course 8');
const OUT = path.join(C8, 'Essentials', 'Course8_Essentials_Presentation.pptx');
const CACHE = fs.mkdtempSync(path.join(os.tmpdir(), 'c8deck-'));

const THEME = {
  name: 'CPC Short Courses',
  headFontFace: 'Calibri',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1A1A1A', lt1: 'FFFFFF', dk2: '1F3864', lt2: 'EBF2FA',
    accent1: '2E74B5', accent2: 'C9A84C', accent3: '3E7D4F', accent4: 'A93226',
    accent5: '5F6B7A', accent6: 'BDD3EE', hlink: '2E74B5', folHlink: '1F3864',
  },
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = 'CPC Learning Centre';
pres.company = 'Canadian Poultry Consultants';
pres.title = 'Course 8 Essentials: Vaccination and Treatment Basics';
const C = pres.SchemeColor;
const NAVY = C.text2, BLUE = C.accent1, GOLD = C.accent2, GREEN = C.accent3, RED = C.accent4, MUTED = C.accent5, TINT = C.background2, WHITE = C.background1, INK = C.text1, MIDBLUE = C.accent6;
const LOGO = path.join(ROOT, 'logo.png');

// ---------------- Layouts ----------------
pres.defineSlideMaster({
  title: 'CPC_TITLE',
  background: { color: NAVY },
  objects: [
    { image: { path: LOGO, x: 4.35, y: 0.35, w: 1.3, h: 1.3 } },
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.5, y: 1.8, w: 9, h: 0.4, fontSize: 14, bold: true, color: GOLD, align: 'center', charSpacing: 2 }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 2.2, w: 9, h: 1.2, fontSize: 38, bold: true, color: WHITE, align: 'center', valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.75, y: 3.45, w: 8.5, h: 1.4, fontSize: 16, color: MIDBLUE, align: 'center', valign: 'top' }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CPC_SECTION',
  background: { color: NAVY },
  objects: [
    { image: { path: LOGO, x: 9.0, y: 0.25, w: 0.7, h: 0.7 } },
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.8, y: 1.55, w: 8.4, h: 0.5, fontSize: 18, bold: true, color: GOLD, align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 2.05, w: 8.4, h: 1.2, fontSize: 40, bold: true, color: WHITE, align: 'left', valign: 'top' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 3.35, w: 8.0, h: 1.0, fontSize: 18, color: MIDBLUE, align: 'left', valign: 'top' }, text: '' } },
  ],
  slideNumber: { x: 9.1, y: 5.2, w: 0.6, h: 0.3, fontSize: 10, color: MIDBLUE, align: 'right' },
});
pres.defineSlideMaster({
  title: 'CPC_CONTENT',
  background: { color: WHITE },
  margin: [0.5, 0.5, 0.55, 0.5],
  objects: [
    { image: { path: LOGO, x: 9.1, y: 0.22, w: 0.6, h: 0.6 } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.22, w: 8.4, h: 0.75, fontSize: 28, bold: true, color: NAVY, align: 'left', valign: 'middle', margin: 0 }, text: '' } },
    { text: { text: 'CPC Short Courses  |  Course 8 Essentials: Vaccination and Treatment Basics', options: { x: 0.5, y: 5.2, w: 6, h: 0.3, fontSize: 10, color: MUTED, margin: 0 } } },
  ],
  slideNumber: { x: 9.1, y: 5.2, w: 0.6, h: 0.3, fontSize: 10, color: MUTED, align: 'right' },
});

// ---------------- Helpers ----------------
let curSection = '';
function section(title) { curSection = title; pres.addSection({ title }); }
function content(title, notes) {
  const s = pres.addSlide({ masterName: 'CPC_CONTENT', sectionTitle: curSection });
  s.addText(title, { placeholder: 'title' });
  if (notes) s.addNotes(notes);
  return s;
}
function divider(kicker, title, sub, notes) {
  const s = pres.addSlide({ masterName: 'CPC_SECTION', sectionTitle: curSection });
  s.addText(kicker, { placeholder: 'kicker' });
  s.addText(title, { placeholder: 'title' });
  if (sub) s.addText(sub, { placeholder: 'body' });
  if (notes) s.addNotes(notes);
  return s;
}
function text(s, t, o) { s.addText(t, { isTextBox: true, fontSize: 15, color: INK, valign: 'top', margin: 0, ...o }); }
function bullets(s, items, o) {
  const arr = items.map((it, i) => {
    const runText = typeof it === 'string' ? it : it.text;
    return { text: runText, options: { bullet: { indent: 16 }, breakLine: i < items.length - 1, paraSpaceAfter: 6, ...(typeof it === 'string' ? {} : it.options) } };
  });
  s.addText(arr, { isTextBox: true, fontSize: 15, color: INK, valign: 'top', margin: 0, ...o });
}
function card(s, x, y, w, h, title, body, o = {}) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: o.fill || TINT }, line: { color: o.fill || TINT }, rectRadius: 0.08, objectName: 'card' });
  const pad = 0.15;
  if (title) s.addText(title, { isTextBox: true, x: x + pad, y: y + pad, w: w - 2 * pad, h: o.titleH || 0.4, fontSize: o.titleSize || 16, bold: true, color: o.titleColor || NAVY, margin: 0, valign: 'top' });
  if (body) {
    const by = y + pad + (title ? (o.titleH || 0.4) + 0.05 : 0);
    const content = Array.isArray(body) ? body.map((b, i) => ({ text: b, options: { bullet: o.bullet === false ? false : { indent: 14 }, breakLine: i < body.length - 1, paraSpaceAfter: 4 } })) : body;
    s.addText(content, { isTextBox: true, x: x + pad, y: by, w: w - 2 * pad, h: h - (by - y) - pad, fontSize: o.bodySize || 14, color: o.bodyColor || INK, margin: 0, valign: 'top' });
  }
}
function badge(s, x, y, d, label, o = {}) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: o.fill || GOLD }, line: { color: o.fill || GOLD }, objectName: 'badge' });
  s.addText(label, { isTextBox: true, x, y, w: d, h: d, fontSize: o.size || 16, bold: true, color: o.color || NAVY, align: 'center', valign: 'middle', margin: 0 });
}
function stat(s, x, y, w, big, label, o = {}) {
  s.addText(big, { isTextBox: true, x, y, w, h: o.bigH || 0.8, fontSize: o.bigSize || 40, bold: true, color: o.color || BLUE, margin: 0, valign: 'bottom' });
  s.addText(label, { isTextBox: true, x, y: y + (o.bigH || 0.8) + 0.05, w, h: o.labelH || 0.6, fontSize: 13, color: o.labelColor || INK, margin: 0, valign: 'top' });
}
async function photo(s, file, x, y, w, h, credit) {
  const src = path.join(C8, file);
  const out = path.join(CACHE, file.replace(/[^\w.]+/g, '_').replace(/\.\w+$/, '.jpg'));
  // trim plain white borders so product shots fill their box
  if (!fs.existsSync(out)) await sharp(src).trim({ threshold: 12 }).resize({ width: 1600, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 84 }).toFile(out);
  const meta = await sharp(out).metadata();
  const capH = credit ? 0.28 : 0;
  const boxH = h - capH;
  const r = meta.width / meta.height;
  let iw = w, ih = w / r;
  if (ih > boxH) { ih = boxH; iw = boxH * r; }
  const ix = x + (w - iw) / 2;
  s.addImage({ path: out, x: ix, y, w: iw, h: ih, altText: credit || file, objectName: 'photo' });
  if (credit) s.addText(credit, { isTextBox: true, x, y: y + ih + 0.04, w, h: 0.24, fontSize: 10, color: MUTED, align: 'center', margin: 0, italic: true });
}

(async () => {
  // Reference numbers in the notes follow the Essentials document:
  // 1 General Principles, 2 Aviagen water brief, 3 Maternal Antibody Transfer, 4 Merial Water,
  // 5 CPC IB fact sheet, 6 Merial Coarse Spray, 7 Cobb guide, 8 Merial Injection,
  // 9 Butcher (reactions), 10 WHO (AMR), 11 Health Canada (prescriptions).

  section('Opening');
  {
    const s = pres.addSlide({ masterName: 'CPC_TITLE', sectionTitle: curSection });
    s.addText('COURSE 8 ESSENTIALS: CPC SHORT COURSES', { placeholder: 'kicker' });
    s.addText('Vaccination and Treatment Basics', { placeholder: 'title' });
    s.addText([
      { text: 'A starter course for new poultry farmers', options: { italic: true, breakLine: true } },
      { text: '1-Hour Lecture  |  November 2026', options: { fontSize: 14 } },
    ], { placeholder: 'body' });
    s.addNotes('Welcome. This is the short, beginner version of Course 8. No science background needed. We cover what vaccines do, how to keep them alive, how to vaccinate through the water step by step, the other methods in brief, what is normal after vaccination, and the rules for antibiotics. Your veterinarian designs the program; your job is to make sure every vaccine reaches every bird [1].');
  }
  {
    const s = content('Giving a vaccine is not the same as protecting a bird', 'The one idea for today. You can open the vial, give the dose, and write "done" in the records, and still have birds with almost no protection. Protection only happens when each bird gets a live, full dose and its own body answers it. The CPC Learning Centre calls vaccination an art: knowledge, care, and hands-on skill [1].');
    const cols = [['You give it', 'Open the vial. Give the dose. Write it down.'], ['Things go wrong', 'Warm vaccine, chlorine in the lines, birds missed.'], ['The goal', 'Every bird gets a live, full dose and builds protection.']];
    cols.forEach(([t, b], i) => {
      const x = 0.5 + i * 3.05;
      card(s, x, 1.45, 2.85, 2.2, t, b, { bullet: false, fill: i === 2 ? NAVY : TINT, titleColor: i === 2 ? GOLD : NAVY, bodyColor: i === 2 ? WHITE : INK, bodySize: 16 });
      if (i < 2) s.addShape(pres.ShapeType.rightArrow, { x: x + 2.88, y: 2.4, w: 0.15, h: 0.3, fill: { color: GOLD }, line: { color: GOLD } });
    });
    text(s, 'Your veterinarian picks the vaccines. Your job: make sure every one reaches every bird.', { x: 0.5, y: 4.0, w: 9, h: 0.6, fontSize: 17, italic: true, color: BLUE });
  }
  {
    const s = content('What we will cover', 'Six short parts. The water section gets the most time because it is the job you will do most often.');
    const items = ['Vaccine basics', 'Keeping vaccine alive', 'Vaccinating through the water', 'Other ways to vaccinate', 'After vaccination', 'Antibiotics: the rules'];
    items.forEach((t, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.7 + col * 4.5, y = 1.35 + row * 1.15;
      badge(s, x, y, 0.7, String(i + 1));
      text(s, t, { x: x + 0.95, y: y + 0.1, w: 3.4, h: 0.5, fontSize: 19, bold: true, color: NAVY, valign: 'middle' });
    });
  }

  section('1. Vaccine Basics');
  {
    const s = content('What a vaccine does', 'A vaccine shows the bird a germ ahead of time in a form that cannot make it sick, so the immune system learns to fight it. Protection is not instant: antibodies take about three weeks to build up [2]. Vaccinate only healthy flocks [1]. Live vaccines contain a weakened germ that grows in the bird; they are fragile and must be kept cold and dark [1]. Killed vaccines are dead germs in oil, injected one bird at a time, and work best as a boost after a live vaccine [1].');
    stat(s, 0.5, 1.25, 2.8, '3 weeks', 'about how long antibodies take to build after vaccination', { bigSize: 44, bigH: 0.9, labelH: 0.8 });
    text(s, 'Vaccinate healthy birds only. A sick or stressed flock responds poorly.', { x: 0.5, y: 3.25, w: 2.8, h: 1.2, fontSize: 15, italic: true, color: BLUE });
    card(s, 3.6, 1.25, 2.85, 3.65, 'Live vaccine', ['A weakened germ that grows in the bird', 'Water, spray, eye drop, wing web', 'Fragile: keep it cold and dark'], { bodySize: 15 });
    card(s, 6.65, 1.25, 2.85, 3.65, 'Killed vaccine', ['A dead germ, mixed in oil', 'Injected one bird at a time', 'Best as a boost after a live vaccine'], { bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }
  {
    const s = content('Protection from the hen', 'The hen passes antibodies to the chick through the egg. They protect the chick for its first couple of weeks, then fade [3]. Vaccinate while they are still high and they can knock out the vaccine; vaccinate too late and chicks are unprotected [3]. Your veterinarian uses breeder blood tests to pick the day. Even a good breeder flock can produce chicks where one in ten carries no maternal antibody: 2,500 in a flock of 25,000 [3].');
    stat(s, 0.5, 1.25, 3.4, '1 in 10', 'chicks can carry no protection from the hen, even from a good breeder flock', { bigSize: 54, bigH: 1.0, labelH: 0.8 });
    stat(s, 0.5, 3.25, 3.4, '2,500', 'unprotected chicks in a flock of 25,000', { bigSize: 40, labelH: 0.6, color: NAVY });
    card(s, 4.4, 1.25, 2.45, 3.6, 'Too early', 'The hen’s antibodies are still high and knock out the vaccine.', { bullet: false, bodySize: 15 });
    card(s, 7.05, 1.25, 2.45, 3.6, 'Too late', 'The hen’s protection is gone and the disease gets there first.', { bullet: false, bodySize: 15 });
  }

  section('2. Keeping Vaccine Alive');
  {
    const s = content('Keep it cold: 2 to 8°C, every step', 'A live vaccine is a living thing and dies at the wrong temperature. A dead vaccine looks exactly like a good one. Store at 2 to 8 degrees, carry it in a cooler with ice packs, keep it out of the sun, write down the serial number and expiry date [4]. Do not use a vial that froze.');
    stat(s, 0.5, 1.25, 3.0, '2-8°C', 'from the delivery truck until the vial is opened', { bigSize: 54, bigH: 1.0, labelH: 0.7 });
    text(s, 'A dead vaccine looks exactly like a good one.', { x: 0.5, y: 3.4, w: 3.0, h: 1.0, fontSize: 16, italic: true, color: BLUE });
    const rules = [['Cooler with ice packs', 'From the fridge to the barn.'], ['Out of the sun', 'Sunlight kills live vaccine.'], ['Never frozen', 'If a vial froze, do not use it.'], ['Write it down', 'Serial number and expiry date.']];
    rules.forEach(([t, d], i) => card(s, 3.9 + (i % 2) * 2.85, 1.25 + Math.floor(i / 2) * 1.85, 2.65, 1.65, t, d, { bullet: false, bodySize: 15 }));
  }
  {
    const s = content('Protect yourself', 'The live Newcastle disease vaccine can cause an eye infection in people. Wear gloves, a mask, and safety glasses when you mix and give vaccine [4]. If it splashes in your eyes, rinse with clean water and see a doctor. Burn empty vials [4] and any leftover mixed vaccine [1]. Wash hands and arms before eating.');
    await photo(s, 'conjunctivitis due to the NDV vaccine contatct.jpg', 0.5, 1.15, 2.9, 3.75, 'Eye infection from Newcastle virus. Source: CPC Short Courses.');
    const ppe = [['Gloves', 'For mixing and the whole session'], ['Mask and glasses', 'Or a face shield'], ['Splash in the eye?', 'Rinse with water, see a doctor'], ['Clean up', 'Burn empty vials; wash hands']];
    ppe.forEach(([t, d], i) => card(s, 3.8 + (i % 2) * 2.9, 1.2 + Math.floor(i / 2) * 1.85, 2.7, 1.65, t, d, { bullet: false, bodySize: 15 }));
  }

  section('3. Water Vaccination');
  divider('PART 3', 'Vaccinating through the water', 'A simple, quick way to vaccinate a whole flock, and an easy one to get wrong.', 'Birds drink the vaccine from their own drinkers and you never catch a bird. Four steps decide whether it works: get the lines ready, mix it right, run the day, check your work.');
  {
    const s = content('Step 1: get the chlorine out', 'Chlorine kills germs in the water, and it kills vaccine too. It is one of the easiest mistakes to make, and one of the easiest to avoid. Chlorinator off 72 hours before; charcoal filter on town water [4]. Clean drinkers with mild soap, no disinfectant [4]. Flush and rinse lines with skim milk, 454 g per 190 L [4]. Keep chlorine and medication out for 24 hours after [1].');
    const steps = [['72 h before', 'Chlorinator off. Charcoal filter on town water.'], ['Day before', 'Clean drinkers with mild soap. No disinfectant.'], ['Before mixing', 'Rinse lines with milk: 454 g per 190 L.'], ['24 h after', 'Still no chlorine or medication.']];
    steps.forEach(([t, d], i) => {
      const x = 0.5 + i * 2.3;
      badge(s, x + 0.75, 1.3, 0.6, String(i + 1));
      if (i < 3) s.addShape(pres.ShapeType.line, { x: x + 1.4, y: 1.6, w: 1.7, h: 0, line: { color: GOLD, width: 2 } });
      text(s, t, { x, y: 2.05, w: 2.1, h: 0.4, fontSize: 17, bold: true, color: NAVY, align: 'center' });
      text(s, d, { x, y: 2.5, w: 2.1, h: 1.1, fontSize: 15, align: 'center' });
    });
    card(s, 0.5, 3.85, 9.0, 1.05, null, 'Chlorine left in the lines kills the vaccine before a single bird drinks it.', { bullet: false, bodySize: 17, fill: NAVY, bodyColor: WHITE });
  }
  {
    const s = content('Step 2: mix it right', 'Use 40% of what the flock drinks in a day, drunk within about two hours [2,4]. A plain-water practice run one or two days before tells you the real amount [4]. Plastic buckets and stirrers only: metal can damage vaccine [2]. Milk powder in first. Dissolve each vial in the milk water, pour it in, stir. Rinse every vial: up to 15% stays in the glass otherwise [4].');
    stat(s, 0.5, 1.25, 3.0, '40%', 'of the flock’s daily water, drunk in about 2 hours', { bigSize: 54, bigH: 1.0, labelH: 0.7 });
    text(s, 'Do a practice run with plain water 1 to 2 days before.', { x: 0.5, y: 3.35, w: 3.0, h: 1.0, fontSize: 15, italic: true, color: BLUE });
    const steps = ['Plastic buckets and stirrers only', 'Milk powder in first', 'Dissolve each vial in the milk water', 'Pour it in and stir', 'Rinse every vial: 15% hides in the glass'];
    steps.forEach((t, i) => {
      const y = 1.3 + i * 0.7;
      badge(s, 4.0, y, 0.5, String(i + 1), { size: 15 });
      text(s, t, { x: 4.7, y: y + 0.05, w: 4.8, h: 0.42, fontSize: 17, valign: 'middle' });
    });
  }
  {
    const s = content('Step 3: vaccination day', 'Water off for about two hours so birds are thirsty; vaccinate on a feed day [4]. On nipple lines, push the vaccine water through until the white milk shows at the far end. Walk the barn to get birds drinking [4]. When the vaccine water is gone, turn normal water back on [4].');
    await photo(s, 'fig1_2.png', 0.5, 1.1, 9.0, 4.0, null);
  }
  {
    const s = content('Step 4: check your work', 'Walk the barn every half hour. The water should look white or blue and be gone in about two hours. With a blue dye, check tongues of 100 birds from at least three spots: at least 90% should be blue [2]. Why it matters: the CPC Learning Centre IB fact sheet explains that strong, even immunity gives viruses like infectious bronchitis fewer chances to change, while patchy immunity lets new types arise [5].');
    stat(s, 0.5, 1.25, 4.2, '90 of 100', 'birds should have a blue tongue when you check', { bigSize: 48, bigH: 0.95, labelH: 0.6 });
    bullets(s, ['Walk the barn every 30 minutes', 'Water white or blue in the lines', 'All gone in about 2 hours'], { x: 0.5, y: 3.0, w: 4.2, h: 1.8, fontSize: 16 });
    s.addShape(pres.ShapeType.roundRect, { x: 5.1, y: 1.25, w: 4.4, h: 3.6, fill: { color: NAVY }, line: { color: NAVY }, rectRadius: 0.08, objectName: 'quote' });
    text(s, 'Why every bird matters', { x: 5.4, y: 1.45, w: 3.8, h: 0.4, fontSize: 16, bold: true, color: GOLD });
    text(s, 'Strong, even flock immunity gives a virus like infectious bronchitis fewer chances to change. Patchy immunity lets new types arise.', { x: 5.4, y: 1.95, w: 3.8, h: 2.0, fontSize: 18, italic: true, color: WHITE });
    text(s, 'CPC Learning Centre, IB fact sheet', { x: 5.4, y: 4.15, w: 3.8, h: 0.4, fontSize: 12, color: MIDBLUE });
  }

  section('4. Other Methods');
  {
    const s = content('Which method for which job', 'Each method gets vaccine in a different way, and your veterinarian picks the one that fits the disease. Examples from the CPC Learning Centre General Principles guide [1].');
    const head = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 15 } });
    const rows = [['Water', 'IBD, Newcastle, infectious bronchitis'], ['Spray', 'Mild infectious bronchitis, often at the hatchery'], ['Eye drop', 'ILT, where every bird needs an exact dose'], ['Wing web', 'Fowl pox, sometimes AE'], ['Injection', 'Killed vaccines before pullets start laying'], ['At the hatchery', 'Marek’s, injected into the egg at day 18']];
    s.addTable([[head('Method'), head('Common examples')], ...rows.map((r, i) => r.map((c, j) => ({ text: c, options: { fontSize: 15, bold: j === 0, color: j === 0 ? NAVY : INK, fill: { color: i % 2 ? 'FFFFFF' : THEME.colors.lt2 } } })))],
      { x: 0.5, y: 1.2, w: 9.0, colW: [2.4, 6.6], rowH: 0.52, border: { type: 'solid', pt: 0.5, color: 'D5DEEA' }, margin: 0.08, valign: 'middle', fontFace: 'Calibri' });
  }
  {
    const s = content('Spray and eye drop', 'Spray: one walk covers the barn. Steady 4.5 to 5.0 bar (65 to 75 psi), commercial distilled water (what CPC uses), nozzle down 1 m above heads, within 4 m of the wall, fans off during and 20 minutes after, sprayer for vaccine only [6]. Eye drop: one drop of about 0.03 mL on the eye [7]; hold the bird until the drop disappears; blue-dye check on 2% of birds [1].');
    card(s, 0.5, 1.2, 4.35, 3.7, 'Spray', ['Steady 4.5 to 5.0 bar (65 to 75 psi)', 'Commercial distilled water (what CPC uses)', 'Nozzle down, 1 m above the heads', 'Within 4 m of the wall', 'Fans off, and 20 min after', 'Sprayer for vaccine only'], { bodySize: 15 });
    card(s, 5.15, 1.2, 4.35, 3.7, 'Eye drop', ['One drop of about 0.03 mL', 'Head tilted, eye facing up', 'Never touch the dropper to the eye', 'Hold until the drop disappears', 'Blue tongues on 2% of birds'], { bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }
  {
    const s = content('Boosters at 2 to 3 weeks: now a 7-day withdrawal', 'Depending on the farm, CPC’s veterinary team recommends a second round of live vaccine in week 2 to 3: the Zoetis live Massachusetts and Connecticut type IB vaccine by coarse spray [5], and on some farms a live IBD vaccine, Bursine 2. Until 2026 every vaccine used in a food animal in Canada had a withdrawal period of at least 21 days. Since February 2, 2026, CFIA Memorandum 2026-01 sets 7 days for six live IB and IBD vaccines made in the U.S., so broilers can be boosted closer to slaughter age: CLONEVAC D-78, UNIVAX PLUS, Bursine 2, MILDVAC-Ma5, and the two Zoetis live bronchitis vaccines (Massachusetts type; Massachusetts and Connecticut type) [12]. During the changeover, stock still labeled 21 days may be used with 7 days. Every other vaccine: follow the label [12].');
    stat(s, 0.5, 1.2, 3.4, '7 days', 'withdrawal before slaughter for six live IB and IBD vaccines since Feb 2, 2026. It used to be 21.', { bigSize: 54, bigH: 1.0, labelH: 1.0 });
    text(s, 'Both CPC boosters are on the CFIA list.', { x: 0.5, y: 3.3, w: 3.4, h: 0.5, fontSize: 15, italic: true, color: BLUE });
    card(s, 4.3, 1.2, 5.2, 1.25, 'IB booster, week 2 to 3', 'Zoetis live Massachusetts and Connecticut type vaccine, by coarse spray.', { bullet: false, bodySize: 15 });
    card(s, 4.3, 2.6, 5.2, 1.25, 'IBD booster, on some farms', 'Bursine 2, week 2 to 3. Your veterinarian decides by farm.', { bullet: false, bodySize: 15 });
    card(s, 0.5, 4.05, 9.0, 0.85, null, 'Every other vaccine keeps the withdrawal on its label: at least 21 days. Check before you vaccinate.', { bullet: false, bodySize: 15, fill: NAVY, bodyColor: WHITE });
  }
  {
    const s = content('Wing web: the take shows on the bird', 'A two-pronged needle goes through the thin skin of the wing web, mostly for fowl pox [1]. Seven to ten days later, check 2% of the flock [1] and at least 50 to 100 birds at random [7]. Two small bumps is a good take. No bump means the bird was missed and is not protected [7].');
    await photo(s, 'pox_take_wingweb.jpg', 0.5, 1.15, 3.0, 3.75, 'Take nodule (circled). Andrews SJ et al. 2022 (CC BY 4.0).');
    const sc = [['2', 'Good take', 'Two bumps, one from each prong', GREEN], ['1', 'Weak take', 'One bump', GOLD], ['0', 'Miss', 'No bump: not protected', RED]];
    sc.forEach(([n, t, d, col], i) => {
      const y = 1.25 + i * 0.95;
      badge(s, 3.9, y, 0.6, n, { fill: col, color: WHITE, size: 20 });
      text(s, t, { x: 4.7, y: y - 0.02, w: 4.8, h: 0.35, fontSize: 18, bold: true, color: NAVY });
      text(s, d, { x: 4.7, y: y + 0.33, w: 4.8, h: 0.35, fontSize: 15 });
    });
    card(s, 3.9, 4.05, 5.6, 0.85, null, 'Check at 7 to 10 days: 2% of the flock, at least 50 to 100 birds.', { bullet: false, bodySize: 16, fill: NAVY, bodyColor: WHITE });
  }
  {
    const s = content('Injection, and one serious warning', 'Killed vaccines go under the skin at the back of the neck. Out of the fridge 24 hours ahead to warm to about 22 degrees; shake well for 30 seconds and often; not on a feed day; a second person catches missed birds [8]. Self-injection with oil vaccine is an emergency: oil in a finger or hand can cut off blood flow and cause serious injury [7]. See a doctor right away and take the label [8].');
    card(s, 0.5, 1.2, 4.35, 3.7, 'Injection basics', ['Out of the fridge 24 h ahead (about 22°C)', 'Shake well, 30 seconds, and often', 'Not on a feed day', 'A second person catches missed birds'], { bodySize: 15 });
    s.addShape(pres.ShapeType.roundRect, { x: 5.15, y: 1.2, w: 4.35, h: 3.7, fill: { color: RED }, line: { color: RED }, rectRadius: 0.08, objectName: 'warning' });
    text(s, 'Injected yourself?', { x: 5.45, y: 1.4, w: 3.8, h: 0.5, fontSize: 22, bold: true, color: WHITE });
    text(s, 'Treat it as an emergency, even for a tiny amount. Oil in a finger can cut off the blood flow. See a doctor right away and take the vaccine label.', { x: 5.45, y: 2.0, w: 3.8, h: 2.6, fontSize: 17, color: WHITE });
  }

  section('5. After Vaccination');
  {
    const s = content('Normal, or time to call?', 'A mild reaction appears 2 to 3 days after a live respiratory vaccine, lasts about 5 to 7 days, and settles on its own [9]: a light rattle, a few watery eyes, a quiet flock. No treatment. No reaction at all after a Newcastle or IB vaccine is worth mentioning to your veterinarian [9]. Dirty litter and drinkers let germs like E. coli turn a mild reaction into a problem [9]. Call your veterinarian for any of the signs on the right. Never give another live vaccine to a flock still reacting.');
    card(s, 0.5, 1.2, 4.35, 3.7, 'Normal: let it run', ['Starts 2 to 3 days after', 'Lasts about 5 to 7 days', 'Light rattle, a few watery eyes', 'No antibiotics for a day-3 rattle'], { bodySize: 16 });
    card(s, 5.15, 1.2, 4.35, 3.7, 'Call your veterinarian', ['Not better by day 7, or worse after day 5', 'More birds dying than usual', 'Swollen faces or hard breathing', 'Big, swollen, or weeping sores'], { bodySize: 16, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }

  section('6. Antibiotics');
  {
    const s = content('Antibiotics: the rules', 'When bacteria survive an antibiotic and pass on that toughness, the drug stops working: antimicrobial resistance [10]. Find out what you are treating first: send fresh dead birds to your veterinarian or the lab. Since December 1, 2018, antibiotics that matter in human medicine need a veterinary prescription in Canada [11]. Give the full course. Respect the withdrawal time on the label; vaccines have one too (7 days for the six live IB and IBD vaccines covered by the CFIA memorandum, at least 21 for the rest) [12]. Record every treatment.');
    stat(s, 0.5, 1.2, 3.6, 'Dec 1, 2018', 'antibiotics that matter in human medicine became prescription-only', { bigSize: 36, bigH: 0.8, labelH: 0.8 });
    text(s, 'Bacteria that survive pass on their toughness. That is how drugs stop working.', { x: 0.5, y: 3.1, w: 3.6, h: 1.4, fontSize: 15, italic: true, color: BLUE });
    const rules = [['Get a diagnosis', 'Fresh dead birds to the lab first'], ['Get a prescription', 'From your veterinarian'], ['Finish the course', 'Full dose, every day'], ['Withdrawal time', 'No shipping until it ends'], ['Write it down', 'Every treatment, every time']];
    rules.forEach(([t, d], i) => {
      const y = 1.2 + i * 0.74;
      badge(s, 4.5, y, 0.5, String(i + 1), { size: 15 });
      text(s, t, { x: 5.2, y: y - 0.02, w: 4.3, h: 0.32, fontSize: 16, bold: true, color: NAVY });
      text(s, d, { x: 5.2, y: y + 0.3, w: 4.3, h: 0.3, fontSize: 14 });
    });
  }

  section('Close');
  {
    const s = pres.addSlide({ masterName: 'CPC_SECTION', sectionTitle: curSection });
    s.addText('REMEMBER', { placeholder: 'kicker' });
    s.addText('Five things to take back to the barn', { placeholder: 'title' });
    const t = ['Every bird needs a live, full dose.', 'Keep vaccine at 2 to 8°C, out of the sun.', 'Chlorine off 72 hours; milk in; drunk in about 2 hours.', 'Check your work: blue tongues, wing web takes.', 'No antibiotic without a prescription and a diagnosis.'];
    t.forEach((x, i) => {
      const col = i < 3 ? 0 : 1, row = i < 3 ? i : i - 3;
      badge(s, 0.8 + col * 4.4, 3.2 + row * 0.62, 0.42, String(i + 1), { size: 13 });
      s.addText(x, { isTextBox: true, x: 1.35 + col * 4.4, y: 3.12 + row * 0.62, w: 3.7, h: 0.58, fontSize: 14, color: WHITE, margin: 0, valign: 'middle' });
    });
    s.addNotes('Recap the five points. For more depth, the full Course 8 covers immunity, every method, reactions, and responsible antibiotic use. Questions?');
  }
  {
    const refs = [
      'CPC Learning Centre. General Principles of Vaccination [Technical Bulletin].',
      'Fernandez A. Drinking Water Vaccination [Aviagen Brief]. 2008.',
      'CPC Learning Centre. Maternal Antibody Transfer [Technical Bulletin].',
      'Merial. Water Vaccination [Technical Bulletin].',
      'Dizaji R. Infectious Bronchitis in Chickens [Fact Sheet]. CPC Learning Centre; 2026.',
      'Merial. Coarse Spray Vaccination [Technical Bulletin].',
      'Cobb-Vantress. Cobb Vaccination Management Guide. 2025.',
      'Merial. Injection of Inactivated Vaccines [Technical Bulletin].',
      'Butcher GD, Miles RD, Nilipour AH. ND and IB Vaccine Reactions in Commercial Broilers. UF/IFAS EDIS VM097; 2002, rev. 2017.',
      'World Health Organization. Antimicrobial resistance [Fact sheet].',
      'Health Canada. Responsible use of Medically Important Antimicrobials in animals.',
      'Canadian Food Inspection Agency. Memorandum 2026-01: Reduction of the withdrawal period for certain chicken vaccines. 2026.',
    ];
    const s = content('Sources', 'Full citations are in the Essentials handbook reference list. Numbers match the bracketed numbers in these speaker notes.');
    [0, 1].forEach(col => {
      const items = refs.slice(col * 6, col * 6 + 6);
      s.addText(items.map((r, i) => ({ text: `${col * 6 + i + 1}.  ${r}`, options: { breakLine: i < items.length - 1, paraSpaceAfter: 6 } })), { isTextBox: true, x: 0.5 + col * 4.6, y: 1.15, w: 4.4, h: 3.9, fontSize: 13, color: INK, margin: 0, valign: 'top' });
    });
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('Wrote', OUT, fs.statSync(OUT).size, 'bytes,', pres.slides.length, 'slides');
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
