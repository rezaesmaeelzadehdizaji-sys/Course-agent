// generate-course8-pptx.cjs
// Course 8 lecture deck: Fundamentals of Poultry Vaccination & Treatment (V3 content, November 2026).
// Output: Course 8/Course8_Vaccination_and_Treatment_Presentation.pptx
// Structured deck: theme + layouts + sections + speaker notes. Bracketed numbers in the notes
// are the reference numbers of Course 8/Vaccination_and_Treatment_V3.docx.
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
const OUT = path.join(C8, 'Course8_Vaccination_and_Treatment_Presentation.pptx');
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
pres.title = 'Course 8: Fundamentals of Poultry Vaccination and Treatment';
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
    { text: { text: 'CPC Short Courses  |  Course 8: Vaccination and Treatment', options: { x: 0.5, y: 5.2, w: 6, h: 0.3, fontSize: 10, color: MUTED, margin: 0 } } },
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
  // ================= OPENING =================
  section('Opening');
  {
    const s = pres.addSlide({ masterName: 'CPC_TITLE', sectionTitle: curSection });
    s.addText('COURSE 8: CPC SHORT COURSES', { placeholder: 'kicker' });
    s.addText('Fundamentals of Poultry Vaccination & Treatment', { placeholder: 'title' });
    s.addText([
      { text: 'Practical vaccination and treatment training for Canadian poultry farms', options: { italic: true, breakLine: true } },
      { text: '2-Hour Lecture  |  November 2026', options: { fontSize: 14 } },
    ], { placeholder: 'body' });
    s.addNotes('Welcome. This is the lecture half of Course 8. The practical session is where you get your hands on the equipment. Today is about the why behind each step, so the hands-on part makes sense. Before any vaccination program starts, it is designed with your flock veterinarian: vaccine choice, timing, and schedule depend on regional disease pressure, breeder immunity, and your production system [1]. Nothing here replaces that advice.');
  }
  {
    const s = content('Vaccinating is not the same as immunity', 'The one idea that runs through the whole course. Giving the vaccine is the action. Immunity is the result, and it only shows up when the bird\u2019s own immune system answers the vaccine. A vial can be opened, the dose given, and the records can say "done" while the birds carry almost no protection. The CPC Learning Centre puts it well: vaccination is an art. It takes knowledge, attention, and hands-on skill that improves with experience [1]. Most failures are invisible: chlorine left in the lines, the wrong droplet size, a drop that runs off the eye, cold oil vaccine, a missed in-ovo placement.');
    const cols = [
      ['What you do', 'Open the vial. Give the dose. Write it in the records.'],
      ['What can go wrong', 'Warm vaccine, chlorine in the lines, wrong droplets, birds missed.'],
      ['What you want', 'Every bird builds its own protection, evenly across the flock.'],
    ];
    cols.forEach(([t, b], i) => {
      const x = 0.5 + i * 3.05;
      card(s, x, 1.45, 2.85, 2.3, t, b, { bullet: false, fill: i === 2 ? NAVY : TINT, titleColor: i === 2 ? GOLD : NAVY, bodyColor: i === 2 ? WHITE : INK, bodySize: 15 });
      if (i < 2) s.addShape(pres.ShapeType.rightArrow, { x: x + 2.88, y: 2.45, w: 0.15, h: 0.3, fill: { color: GOLD }, line: { color: GOLD } });
    });
    text(s, 'The route gets the vaccine into the bird. The bird\u2019s own immune response turns it into protection.', { x: 0.5, y: 4.05, w: 9, h: 0.6, fontSize: 17, italic: true, color: BLUE });
  }
  {
    const s = content('Today\u2019s agenda', 'Eight sections. Sections 1 to 6 are the vaccination routes: water, spray, eye drop, wing web, injection, in-ovo. Section 7 is what a normal reaction looks like and when to call. Section 8 is treatment: antibiotics, the law, and resistance.');
    const items = ['Water vaccination', 'Spray: coarse and fine', 'Eye drop', 'Wing web', 'Injection (killed vaccines)', 'In-ovo', 'Post-vaccination reactions', 'Treatment and AMR'];
    items.forEach((t, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.6 + col * 4.55, y = 1.2 + row * 0.95;
      badge(s, x, y, 0.62, String(i + 1));
      text(s, t, { x: x + 0.8, y: y + 0.08, w: 3.6, h: 0.5, fontSize: 17, valign: 'middle', bold: true, color: NAVY });
    });
  }

  // ================= IMMUNITY PRIMER =================
  section('How Protection Works');
  {
    const s = content('Two ways a bird gets protected', 'Passive immunity: ready-made antibodies the chick gets from its mother through the egg. It did nothing to earn them, and they fade over the first few weeks. Active immunity: protection the bird builds itself after meeting a pathogen or a vaccine. It takes a week or two to come up, but it lasts and it can be boosted. Vaccination drives active immunity in a controlled, safe way [2]. Active immunity has two arms: antibodies that block the pathogen, and immune cells that clean up infected cells. Routes lean on these arms differently, which is why each method is set up differently [2].');
    card(s, 0.5, 1.3, 4.35, 3.55, 'Passive: from the hen', ['Antibodies passed through the egg', 'Protects the chick in its first weeks', 'Fades on its own', 'Only as good as the breeder flock\u2019s vaccination'], { bodySize: 15 });
    card(s, 5.15, 1.3, 4.35, 3.55, 'Active: built by the bird', ['Comes from a vaccine or a field infection', 'Takes 1 to 2 weeks to build', 'Lasts, and can be boosted', 'What every vaccination is aiming for'], { bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }
  {
    const s = content('Three antibodies worth knowing', 'IgM appears first after any new exposure. IgY (the bird\u2019s version of IgG) builds after IgM, gives long-term whole-body protection, and is what serology measures. IgA works at the wet surfaces: gut, airways, eyes. It catches pathogens at the door. Eye drop, coarse spray, and water vaccines work mainly through IgA. Killed injected vaccines work mainly through IgY [2].');
    const rows = [
      ['IgM', 'The first responder', 'Shows up first after any new exposure.'],
      ['IgY', 'The blood antibody', 'Long-term, whole-body protection. What the lab measures. Boosted by killed injections.'],
      ['IgA', 'The door guard', 'Protects the gut, airways, and eyes. Built by water, spray, and eye drop vaccines.'],
    ];
    rows.forEach(([ab, role, desc], i) => {
      const y = 1.25 + i * 1.22;
      badge(s, 0.6, y, 0.95, ab, { size: 20, fill: i === 2 ? BLUE : (i === 1 ? NAVY : GOLD), color: i === 0 ? NAVY : WHITE });
      text(s, role, { x: 1.8, y: y + 0.02, w: 7.6, h: 0.4, fontSize: 18, bold: true, color: NAVY });
      text(s, desc, { x: 1.8, y: y + 0.44, w: 7.6, h: 0.55, fontSize: 15 });
    });
  }
  {
    const s = content('Maternal antibodies: why timing matters', 'From the CPC Learning Centre Maternal Antibody Transfer bulletin: even a breeder flock with high, even titers can produce chicks where one in ten carries no maternal antibody at all. In a 25,000-chick flock that is 2,500 or more chicks with no protection from the hen, and the number climbs fast when breeder titers slip [3]. Vaccinate while maternal antibody is high and it neutralizes the vaccine. Vaccinate too late and chicks are exposed before they are protected [3]. There are no universal titer targets: track your own breeder titers and set farm baselines with your veterinarian [3].');
    stat(s, 0.5, 1.3, 3.4, '1 in 10', 'chicks can carry no maternal antibody, even from a good breeder flock', { bigSize: 54, bigH: 1.0, labelH: 0.8 });
    stat(s, 0.5, 3.25, 3.4, '2,500', 'unprotected chicks in a 25,000-chick placement', { bigSize: 44, labelH: 0.6, color: NAVY });
    card(s, 4.4, 1.3, 2.45, 3.5, 'Too early', 'Maternal antibody is still high and neutralizes the vaccine before the chick can respond.', { bullet: false, bodySize: 15 });
    card(s, 7.05, 1.3, 2.45, 3.5, 'Too late', 'Maternal protection has faded and the field virus gets there first.', { bullet: false, bodySize: 15 });
  }
  {
    const s = content('Live versus killed vaccines', 'Modified-live vaccines carry a weakened virus that replicates without causing disease. Strong local immunity at the site, often after one dose. Fragile: heat, chlorine, and disinfectant kill them, and some reaction is expected. Most water, spray, eye drop, and wing web vaccines are modified-live [4,5]. Killed vaccines cannot multiply, so they are safe and stable. They lean on the antibody arm, usually need an adjuvant and more than one dose, and work best as a boost after live priming [6]. That is why the pre-lay injection round uses killed vaccines [4,5].');
    card(s, 0.5, 1.3, 4.35, 3.6, 'Live (modified-live)', ['Replicates in the bird', 'Strong local (IgA) protection', 'Often one dose primes', 'Fragile: heat, sun, chlorine', 'Some reaction is expected', 'Water, spray, eye drop, wing web'], { bodySize: 15 });
    card(s, 5.15, 1.3, 4.35, 3.6, 'Killed (inactivated)', ['Cannot multiply or spread', 'Strong blood (IgY) antibody', 'Works best after live priming', 'Oil carrier releases it slowly', 'Must be injected', 'Pre-lay round in layers and breeders'], { bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }

  // ================= SECTION 1: WATER =================
  section('1. Water Vaccination');
  divider('SECTION 1', 'Water vaccination', 'The whole flock in one session, without catching a bird. Done right, broad coverage at low labor cost. Done wrong, false confidence.',
    'Water vaccination covers the whole flock without catching a bird. Birds drink the vaccine from their own drinkers over about two hours. When corners are cut, the vials were opened and the session ran, but the birds are not protected.');
  {
    const s = content('What goes in the water', 'IBD: the main use of water vaccination in broilers; time it around maternal antibody [8,3]. Newcastle: live La Sota, Clone 30, B1 strains; some vaccine reaches the eyes and upper airway as birds drink, so they build IgA there too [9,10]. IB: water works for mass application; spray and eye drop target the airway directly [11]. Coccidiosis: live oocysts in the first week, mostly breeders, sometimes broilers; follow your veterinarian. AE: around 10 to 12 weeks in breeder and layer pullets, well before lay; by water or wing web [4,5]. What water cannot do: Marek\u2019s needs injection or in-ovo [4,7]; Fowl Pox needs the skin.');
    const chips = [['IBD', 'Main broiler use; timed around maternal antibody'], ['Newcastle', 'Live La Sota, Clone 30, B1 strains'], ['Infectious bronchitis', 'Mass use; spray or eye drop reach the airway'], ['Coccidiosis', 'Live oocysts in week 1, mostly breeders'], ['Avian encephalomyelitis', 'Pullets around 10 to 12 weeks, before lay']];
    chips.forEach(([t, d], i) => {
      const y = 1.2 + i * 0.73;
      badge(s, 0.5, y + 0.05, 0.45, String(i + 1), { size: 14 });
      text(s, t, { x: 1.1, y, w: 4.2, h: 0.3, fontSize: 16, bold: true, color: NAVY });
      text(s, d, { x: 1.1, y: y + 0.3, w: 4.2, h: 0.35, fontSize: 13, color: MUTED });
    });
    await photo(s, 'New-LS-Mass vaccine vials.jpg', 5.6, 1.2, 3.9, 3.0, 'Live ND/IB vaccine for flock use. Source: CPC Short Courses.');
    text(s, 'Not by water: Marek\u2019s (injection or in-ovo) and Fowl Pox (wing web).', { x: 5.6, y: 4.4, w: 3.9, h: 0.6, fontSize: 13, italic: true, color: RED });
  }
  {
    const s = content('IB keeps changing: cover every bird', 'From the CPC Learning Centre Infectious Bronchitis fact sheet: the virus changes constantly, and a vaccine against one type protects poorly against another. Strong, even flock immunity gives it fewer chances to multiply and change, while patchy immunity lets new types arise. Partial coverage also lets the vaccine virus keep passing bird to bird, where it can grow harsher [12]. In Canadian lab testing from 2014 to 2023, about half of the IBV typed were variants related to U.S. strains, and DMV/1639 has been a steady challenge since it was first found in Ontario in 2015 [17]. It has reached other provinces; CPC has not yet found it in BC flocks. The vaccines here have not controlled it on their own, so biosecurity has to back them up [12].');
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 5.1, h: 3.7, fill: { color: NAVY }, line: { color: NAVY }, rectRadius: 0.08, objectName: 'quote' });
    text(s, '\u201CStrong, even flock immunity gives it fewer chances to multiply and change, while patchy immunity lets new types arise.\u201D', { x: 0.8, y: 1.45, w: 4.5, h: 2.3, fontSize: 21, italic: true, color: WHITE, valign: 'middle' });
    text(s, 'CPC Learning Centre, Infectious Bronchitis fact sheet', { x: 0.8, y: 3.95, w: 4.5, h: 0.6, fontSize: 13, color: GOLD });
    stat(s, 6.0, 1.15, 3.5, 'About half', 'of IBV typed in Canada (2014 to 2023) were variants related to U.S. strains', { bigSize: 30, bigH: 0.6, labelH: 0.8 });
    stat(s, 6.0, 2.7, 3.5, 'DMV/1639', 'first found in Ontario in 2015; since in other provinces, not yet found by CPC in BC', { bigSize: 30, bigH: 0.6, labelH: 0.85, color: NAVY });
    text(s, 'Vaccine alone has not controlled it. Back it with tight biosecurity.', { x: 6.0, y: 4.3, w: 3.5, h: 0.6, fontSize: 13, italic: true, color: RED });
  }
  {
    const s = content('Cold chain: keep it at 2 to 8\u00B0C, every step', 'The cold chain is the unbroken run of refrigeration from the manufacturer to the moment you open the vial. A failure is any point where the vaccine gets too warm or freezes. The damage is invisible: the vial looks the same, but the live virus is dead or weakened [14,15,16]. Transport in a hard cooler with ice packs. Keep vials covered, out of sunlight [14]. Record serial number and expiry of every vial [14,16]. Check expiry before vaccination day.');
    stat(s, 0.5, 1.25, 3.0, '2\-8\u00B0C', 'from arrival on the farm until the vial is opened', { bigSize: 54, bigH: 1.0, labelH: 0.7 });
    const rules = [['Never frozen', 'A vial that froze can look fine and still be damaged. Do not use it.'], ['Never in the sun', 'UV light kills live virus fast. Keep vials covered.'], ['Cooler with ice packs', 'Check the temperature before you head to the barn.'], ['Write it down', 'Serial number and expiry date of every vial.']];
    rules.forEach(([t, d], i) => {
      const x = 3.9 + (i % 2) * 2.85, y = 1.25 + Math.floor(i / 2) * 1.85;
      card(s, x, y, 2.65, 1.65, t, d, { bullet: false, bodySize: 14 });
    });
    text(s, 'Once potency is lost, no amount of good technique brings it back.', { x: 0.5, y: 3.4, w: 3.0, h: 1.2, fontSize: 15, italic: true, color: BLUE });
  }
  {
    const s = content('Get the chlorine out first', 'Chlorine kills bacteria, and it kills vaccine virus. It is one of the easiest failures to make, and one of the easiest to prevent. Turn the chlorinator off 72 hours before [14]. On town water, use a charcoal filter for 72 hours [14]. Bypass inline filters and pressure reducers [14]. Clean drinkers with mild soap only, no disinfectant, then flush [14]. Rinse lines with powdered milk, about 454 g per 190 L (1 lb per 50 gal) [14]. The CPC Learning Centre adds the other half: keep chlorine, disinfectants, and water medication out for 24 hours after vaccination too [1].');
    const steps = [['72 h before', 'Chlorinator off. Charcoal filter on town water.'], ['Day before', 'Mild soap on drinkers, no disinfectant. Flush.'], ['Before mixing', 'Milk rinse: 454 g per 190 L. Bypass filters.'], ['24 h after', 'Still no chlorine, disinfectant, or medication.']];
    steps.forEach(([t, d], i) => {
      const x = 0.5 + i * 2.3;
      badge(s, x + 0.75, 1.3, 0.6, String(i + 1));
      if (i < 3) s.addShape(pres.ShapeType.line, { x: x + 1.4, y: 1.6, w: 1.7, h: 0, line: { color: GOLD, width: 2 } });
      text(s, t, { x, y: 2.05, w: 2.1, h: 0.4, fontSize: 17, bold: true, color: NAVY, align: 'center' });
      text(s, d, { x, y: 2.5, w: 2.1, h: 1.1, fontSize: 14, align: 'center' });
    });
    card(s, 0.5, 3.85, 9.0, 1.05, null, 'Chlorine left in the lines kills the vaccine before a single bird drinks it.', { bullet: false, bodySize: 17, fill: NAVY, bodyColor: WHITE });
  }
  {
    const s = content('Mixing the vaccine', 'Use clean plastic buckets, containers, and stirrers. Hard metal content can kill live vaccine [15]. Milk powder goes in first, about 454 g per 190 L, mixed well [14,16]. Dissolve each vial with a little of the milk-water, never plain tap water. Pour it into the main batch. Rinse every vial: skip the rinse and up to 15% of the dose stays in the glass [14]. Do not use a proportioner or medicator: dilutions can be off and parts may hold disinfectant [14]. The batch must be drunk within two hours [14,15].');
    const steps = ['Plastic buckets and stirrers only', 'Milk powder in first: 454 g per 190 L', 'Dissolve each vial in milk-water', 'Pour into the batch and mix', 'Rinse every vial: 15% hides in the glass', 'Drunk within 2 hours, or discard'];
    steps.forEach((t, i) => {
      const y = 1.2 + i * 0.62;
      badge(s, 0.5, y, 0.45, String(i + 1), { size: 14 });
      text(s, t, { x: 1.1, y: y + 0.05, w: 4.3, h: 0.4, fontSize: 16, valign: 'middle' });
    });
    card(s, 5.8, 1.2, 3.7, 3.65, 'Skip the proportioner', 'It can run the wrong dilution, and its parts may still carry disinfectant. Put the vaccine straight into the drinker system after the milk pre-flush.', { bullet: false, bodySize: 15 });
  }
  {
    const s = content('How much water to mix', 'Use 40% of the flock\u2019s expected daily water use for that age and temperature [14]. The Merial guide volumes per 1,000 broilers assume about 21\u00B0C outside: 10 L at week 1, 20 at week 2, 29 at week 3, 38 at week 4 [14]. Birds drink more in warm weather. A plain-water practice run one or two days before confirms how much the flock drinks in two hours: that is your target volume [14].');
    s.addChart(pres.ChartType.bar, [{ name: 'Liters per 1,000 broilers', labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [10, 20, 29, 38] }], {
      x: 0.5, y: 1.15, w: 5.4, h: 3.8, barDir: 'col', chartColors: [THEME.colors.accent1],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 14, dataLabelColor: THEME.colors.dk2, dataLabelFontFace: '+mn-lt',
      showTitle: true, title: 'Vaccine water, liters per 1,000 broilers', titleFontSize: 14, titleColor: THEME.colors.dk2, titleFontFace: '+mn-lt',
      catAxisLabelColor: THEME.colors.accent5, valAxisLabelColor: THEME.colors.accent5, catAxisLabelFontSize: 13, valAxisLabelFontSize: 11, catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt',
      valGridLine: { color: 'E3E8EF', size: 0.75 }, catGridLine: { style: 'none' }, showLegend: false, valAxisMaxVal: 45,
    });
    stat(s, 6.3, 1.3, 3.2, '40%', 'of the flock\u2019s expected daily water use', { bigSize: 48, bigH: 0.9 });
    text(s, 'Based on about 21\u00B0C outside. Add water on hot days, cut back on cold ones. A plain-water practice run 1 to 2 days before gives your real number.', { x: 6.3, y: 2.95, w: 3.2, h: 1.9, fontSize: 14 });
  }
  {
    const s = content('Vaccination day', 'Withhold water about two hours to build thirst [14,16]; breeders: water off one hour before lights off, vaccinate one hour after lights on [14]. Vaccinate on a feed day [14,16]. Bells, troughs, cups: pour by hand. Nipples: pump (about 1/3 hp) or gravity-feed from a tank; open the far end and close it when the white milk solution comes through [14]. Walk the barn to get birds drinking [14]. Water back on as soon as the vaccine is gone [14]. Drinker space: the Merial minimums are 1 bell per 100 birds, 1 nipple per 15, 1 cup per 30, 1 trough per 150 (6 ft) or 200 (8 ft). More space is better [14].');
    await photo(s, 'fig1_2.png', 0.5, 1.1, 9.0, 4.0, null);
  }
  {
    const s = content('During and after: is every bird drinking?', 'Walk at 30-minute intervals. The solution should be white (milk) or blue (commercial stabilizer) and moving down the lines; clear means distribution trouble. The whole volume gone in two hours [14]. Blue-dye check: tongues of 100 birds from at least three spots, at least 90% well stained [15]. Common failures: chlorine not cleared, chicks vaccinated while maternal antibody is high [3], not thirsty enough, immunosuppression from IBD, Marek\u2019s, or mycotoxins [8], wrong strain for the region [11,17].');
    bullets(s, ['Walk the flock every 30 minutes', 'Solution white or blue in the lines, never clear', 'All of it gone within 2 hours', { text: 'Blue tongues on at least 90 of 100 birds checked', options: { bold: true, color: NAVY } }], { x: 0.5, y: 1.2, w: 4.4, h: 2.2, fontSize: 16 });
    text(s, 'Usual reasons it fails', { x: 0.5, y: 3.4, w: 4.4, h: 0.35, fontSize: 16, bold: true, color: RED });
    text(s, 'Chlorine left in the lines \u2022 maternal antibody still high \u2022 birds not thirsty \u2022 immunosuppression \u2022 wrong strain for your area', { x: 0.5, y: 3.8, w: 4.4, h: 1.1, fontSize: 14 });
    await photo(s, 'Commercial broiler flock.jpg', 5.2, 1.2, 4.3, 3.6, 'Broilers on nipple lines. Source: CPC Short Courses.');
  }
  {
    const s = content('Protect yourself from the vaccine', 'Live Newcastle virus can cause conjunctivitis in people. Wear gloves, a mask, and safety glasses for preparation and administration [14,16]. The Merck Veterinary Manual notes cases are usually short-lived and mostly in laboratory workers and vaccination crews handling large amounts of virus [10]. If vaccine gets in your eyes, flush with water and see a physician. Burn empty vials and containers [14], incinerate unused reconstituted vaccine [1], wash hands and forearms. Vaccinate only healthy birds [1].');
    await photo(s, 'conjunctivitis due to the NDV vaccine contatct.jpg', 0.5, 1.15, 2.9, 3.75, 'NDV conjunctivitis in a person. Source: CPC Short Courses.');
    const ppe = [['Gloves', 'For mixing and for the whole session'], ['Mask and safety glasses', 'Or a face shield'], ['Splash in the eye?', 'Flush with water, then see a physician'], ['Clean up', 'Burn empty vials; wash hands and forearms']];
    ppe.forEach(([t, d], i) => {
      const x = 3.8 + (i % 2) * 2.9, y = 1.2 + Math.floor(i / 2) * 1.85;
      card(s, x, y, 2.7, 1.65, t, d, { bullet: false, bodySize: 14 });
    });
  }

  // ================= SECTION 2: SPRAY =================
  section('2. Spray Vaccination');
  divider('SECTION 2', 'Spray vaccination', 'A whole barn in one walk. No water starvation, no catching. Droplet size decides where the vaccine lands.',
    'Spray applies live respiratory vaccine as droplets that land on the respiratory lining. The stair-step approach: coarse spray first to prime the upper airway, then fine spray with a slightly more reactive strain to drive protection deeper [1].');
  {
    const s = content('Droplet size decides where vaccine lands', 'From the CPC Learning Centre General Principles of Vaccination guide: coarse spray is over 100 microns, fine spray 50 to 100, aerosol under 50 [1]. Coarse lands on the eye and upper nasal passages, the same pathway as eye drop: Harderian gland and airway lymphoid tissue, local IgA [1,2]. Fine reaches the trachea. Aerosol can reach the air sacs. A worn nozzle or wrong pressure can turn a coarse run into fine spray: the vaccine lands deeper than intended and the reaction is harder [18,22]. Fine spray is a booster for primed birds, mostly layer and breeder programs; never a first vaccination.');
    const bands = [['Coarse', 'over 100 \u00B5m', 'Eye and upper nose', 'First vaccination', 1.2, BLUE], ['Fine', '50 to 100 \u00B5m', 'Trachea, lower airway', 'Booster in primed birds', 0.8, NAVY], ['Aerosol', 'under 50 \u00B5m', 'Can reach the air sacs', 'Harshest reaction', 0.45, RED]];
    bands.forEach(([n, size, where, use, d, col], i) => {
      const x = 0.5 + i * 3.05;
      const cx = x + 0.6 - d / 2;
      s.addShape(pres.ShapeType.ellipse, { x: cx, y: 1.3 + (1.2 - d) / 2, w: d, h: d, fill: { color: col }, line: { color: col }, objectName: 'droplet' });
      text(s, n, { x: x + 1.35, y: 1.45, w: 1.5, h: 0.4, fontSize: 20, bold: true, color: col });
      text(s, size, { x: x + 1.35, y: 1.88, w: 1.5, h: 0.4, fontSize: 14, color: MUTED });
      text(s, where, { x, y: 3.1, w: 2.85, h: 0.4, fontSize: 16, bold: true, color: NAVY });
      text(s, use, { x, y: 3.5, w: 2.85, h: 0.4, fontSize: 14 });
    });
    card(s, 0.5, 4.1, 9.0, 0.85, null, 'A worn nozzle or wrong pressure turns coarse spray into fine spray: the vaccine lands deeper and the reaction gets harder.', { bullet: false, bodySize: 15, fill: TINT });
  }
  {
    const s = content('Coarse spray: the settings that matter', 'From the Merial coarse spray bulletin [18]: dedicated sprayer, never used for anything else; check the pattern against a light; practice run with water 1 to 2 days before. Constant 4.5 to 5.0 bar (65 to 75 psi). Distilled, demineralized, or deionized water; CPC uses commercial distilled water. Volumes: 3 L per 10,000 at day 1 on farm; 7 to 8 L per 10,000 over 7 days. Fans off during the run and for 20 minutes after; in summer, go very early and restart fans early if birds heat up. Broilers grouped along the wall, no more than 4 m (12 ft) from you, nozzle pointed down 1 m (3 ft) above their heads, lights dimmed, slow steady walk. Breeder pullets on a feed day; caged pullets sprayed at the face. No water starvation needed.');
    const st = [['4.5\-5.0 bar', '65 to 75 psi, held constant'], ['1 m', 'nozzle above the birds\u2019 heads, pointing down'], ['4 m', 'maximum from you to the wall'], ['20 min', 'fans stay off after the run']];
    st.forEach(([b, l], i) => {
      const x = 0.5 + i * 2.3;
      s.addShape(pres.ShapeType.roundRect, { x, y: 1.2, w: 2.1, h: 1.75, fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.08, objectName: 'stat' });
      stat(s, x + 0.15, 1.3, 1.85, b, l, { bigSize: i === 0 ? 24 : 34, bigH: 0.7, labelH: 0.75 });
    });
    text(s, 'Water and volume', { x: 0.5, y: 3.2, w: 4.3, h: 0.35, fontSize: 16, bold: true, color: NAVY });
    bullets(s, ['Commercial distilled water (what CPC uses)', 'Day 1 on farm: 3 L per 10,000 birds', 'Over 7 days: 7 to 8 L per 10,000 birds'], { x: 0.5, y: 3.6, w: 4.3, h: 1.4, fontSize: 14 });
    text(s, 'In the barn', { x: 5.2, y: 3.2, w: 4.3, h: 0.35, fontSize: 16, bold: true, color: NAVY });
    bullets(s, ['Sprayer used for vaccine only, ever', 'Lights dimmed, birds grouped, walk slowly', 'Hot weather: go very early in the morning'], { x: 5.2, y: 3.6, w: 4.3, h: 1.4, fontSize: 14 });
  }
  {
    const s = content('Spray troubleshooting', 'Low titers: check the water for chlorine, pressure (too high makes a fine mist), walking speed, vial rinsing [18]. High CV, a wide spread bird to bird: uneven coverage. Little or no response: cold chain first, then diluent [18]. Serology at about 21 days is a good coverage check. The CPC Learning Centre IB fact sheet recommends a second live dose by coarse spray at 2 to 3 weeks of age on top of the day-1 hatchery spray [12]. And from the General Principles guide: if germs build up over flock after flock without cleanout and disinfection, the challenge can overwhelm what the vaccine can handle [1]. Mask for spray; N95 for fine spray.');
    const rows = [['Low titers', 'Chlorine in the water, pressure too high, walking too fast, vials not rinsed'], ['Wide spread bird to bird', 'Uneven coverage: sections sprayed too fast or from too far away'], ['Little or no response', 'Cold chain first, then the diluent']];
    rows.forEach(([t, d], i) => {
      const y = 1.2 + i * 0.95;
      text(s, t, { x: 0.5, y, w: 4.6, h: 0.35, fontSize: 16, bold: true, color: NAVY });
      text(s, d, { x: 0.5, y: y + 0.37, w: 4.6, h: 0.55, fontSize: 14 });
    });
    card(s, 5.4, 1.2, 4.1, 2.0, 'Water decides it', 'Chlorinated or mineral-rich water kills live vaccine. CPC uses commercial distilled water.', { bullet: false, fill: NAVY, titleColor: GOLD, bodyColor: WHITE, bodySize: 15 });
    card(s, 5.4, 3.4, 4.1, 1.5, 'Vaccine is not the whole story', 'Without cleanout and disinfection, disease pressure can overwhelm a well-vaccinated flock.', { bullet: false, bodySize: 14 });
  }

  {
    const s = content('Boosters at 2 to 3 weeks: now a 7-day withdrawal', 'Depending on the farm, CPC’s veterinary team recommends a second round of live vaccine in week 2 to 3: the Zoetis live Massachusetts and Connecticut type IB vaccine by coarse spray [12], and on some farms a live IBD vaccine, Bursine 2. Until 2026 every vaccine used in a food animal in Canada had a withdrawal period of at least 21 days. Since February 2, 2026, CFIA Memorandum 2026-01 sets 7 days for six live IB and IBD vaccines made in the U.S., so broilers can be boosted closer to slaughter age: CLONEVAC D-78, UNIVAX PLUS, Bursine 2, MILDVAC-Ma5, and the two Zoetis live bronchitis vaccines (Massachusetts type; Massachusetts and Connecticut type) [13]. During the changeover, stock still labeled 21 days may be used with 7 days. Every other vaccine: follow the label [13].');
    stat(s, 0.5, 1.2, 3.4, '7 days', 'withdrawal before slaughter for six live IB and IBD vaccines since Feb 2, 2026. It used to be 21.', { bigSize: 54, bigH: 1.0, labelH: 1.0 });
    text(s, 'Both CPC boosters are on the CFIA list.', { x: 0.5, y: 3.3, w: 3.4, h: 0.5, fontSize: 15, italic: true, color: BLUE });
    card(s, 4.3, 1.2, 5.2, 1.25, 'IB booster, week 2 to 3', 'Zoetis live Massachusetts and Connecticut type vaccine, by coarse spray.', { bullet: false, bodySize: 15 });
    card(s, 4.3, 2.6, 5.2, 1.25, 'IBD booster, on some farms', 'Bursine 2, week 2 to 3. Your veterinarian decides by farm.', { bullet: false, bodySize: 15 });
    card(s, 0.5, 4.05, 9.0, 0.85, null, 'Every other vaccine keeps the withdrawal on its label: at least 21 days. Check before you vaccinate.', { bullet: false, bodySize: 15, fill: NAVY, bodyColor: WHITE });
  }

  // ================= SECTION 3: EYE DROP =================
  section('3. Eye Drop Vaccination');
  divider('SECTION 3', 'Eye drop vaccination', 'One drop, one bird, straight to the door the virus uses.',
    'Eye drop puts one drop of live vaccine on the eye. It is absorbed, fires the Harderian gland behind the eye, and drains down the tear duct into the nose and throat. Eye drop usually gives the most even, reliable response of any live route because every bird gets a full dose [20,21]. The cost is labor: 50,000 birds is 50,000 handlings.');
  {
    const s = content('How eye drop works, and how to do it', 'IgA guards the eye, airways, and gut [2]. The Harderian gland behind the eye is a major IgA producer and fires when vaccine touches the eye [2]. Extra vaccine drains through the tear duct into the nose and upper throat, the entry points for ILT and IB [19]. The CPC ILT profile notes ILT naturally enters through the airway and the eye, so eye drop copies the natural route; it is the standard route for ILT [19]. Technique: hold firmly, head tilted so the eye faces up, dropper 1 to 2 cm above the eye, never touching it, one drop on the eye not the lid, hold until it is absorbed and the bird blinks.');
    const flow = [['Drop on the eye', 'Absorbed through the eye surface'], ['Harderian gland', 'Behind the eye, makes local IgA'], ['Tear duct', 'Carries vaccine to nose and throat']];
    flow.forEach(([t, d], i) => {
      const y = 1.2 + i * 1.2;
      badge(s, 0.5, y, 0.7, String(i + 1));
      text(s, t, { x: 1.4, y: y + 0.0, w: 3.4, h: 0.38, fontSize: 17, bold: true, color: NAVY });
      text(s, d, { x: 1.4, y: y + 0.4, w: 3.4, h: 0.45, fontSize: 14 });
    });
    card(s, 5.1, 1.2, 4.4, 3.7, 'Technique', ['Hold the bird firmly, head controlled', 'Tilt so the eye faces up', 'Dropper 1 to 2 cm above; never touch the eye', 'One drop on the eye, not the eyelid', 'Hold until it is absorbed and the bird blinks'], { bodySize: 15 });
  }
  {
    const s = content('Check the dropper, then check the birds', 'Eye drop vaccines are made to be given as one drop of about 0.03 mL (30 \u00B5L) [16]. Count drops into 1 mL before you start: about 30 to 35 is right. Far fewer: drops too big, vaccine runs off. Far more: too small, birds short-dosed. Use the specified diluent, never tap water; mix gently; prepare only 1 to 2 hours\u2019 worth. Blue-dye check: tongues of 2% of birds right after handling [1]. Rotate operators; fatigue causes errors. Serology at 14 to 21 days is the best confirmation. No visible reaction at day 5 to 7 with ND or IB vaccines is a warning: a mild reaction is expected, and none usually means little immune stimulation took place [22].');
    stat(s, 0.5, 1.2, 3.0, '0.03 mL', 'one drop per bird: about 30 to 35 drops per mL', { bigSize: 40, bigH: 0.85, labelH: 0.7 });
    card(s, 0.5, 3.0, 3.0, 1.9, 'Wrong drop size', 'Too big runs off the eye. Too small short-doses the bird. Fix the tip.', { bullet: false, bodySize: 14 });
    card(s, 3.8, 1.2, 2.75, 3.7, 'Blue-dye check', 'Look at the tongues of 2% of vaccinated birds right after handling. No blue means the drop missed or the bird was let go too soon.', { bullet: false, bodySize: 14, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
    card(s, 6.75, 1.2, 2.75, 3.7, 'Watch the crew', 'Rotate operators. Tired hands drop on the lid and release birds early. Serology at 14 to 21 days tells you what built.', { bullet: false, bodySize: 14 });
  }

  // ================= SECTION 4: WING WEB =================
  section('4. Wing Web Vaccination');
  divider('SECTION 4', 'Wing web vaccination', 'The only route that shows you proof on the bird.',
    'A two-pronged needle puts live vaccine into the skin of the wing web. Seven to ten days later you can see whether it took. Fowl Pox is the main target; some programs also use it for AE, chicken anemia virus, and live fowl cholera vaccines in breeder pullets [1,16].');
  {
    const s = content('Fowl Pox and the wing web', 'The CPC Learning Centre Fowl Pox profile: Fowl Pox is slow-moving and rolls through a flock bird to bird, so you can vaccinate healthy birds ahead of the wave and many will build immunity before the virus reaches them. Confirm the diagnosis at the lab first [23]. The two-pronged applicator must go through both skin layers of the web, avoiding feathers, blood vessels, and bone. Never into the muscle. Dip between birds without hitting the bottom of the vial; keep the vial cool [16]. Applicator needles: change every 500 to 1,000 birds [16].');
    await photo(s, 'photo2_1.jpg', 0.5, 1.15, 4.4, 3.4, 'Dry Fowl Pox on comb and wattles. Source: Lucyin (CC BY-SA 4.0).');
    card(s, 5.2, 1.15, 4.3, 3.75, 'Why the wing web works', ['Puts live vaccine into the skin, where pox naturally enters', 'Slow outbreaks: vaccinate ahead of the wave', 'Confirm the diagnosis at the lab first', 'Through both skin layers; never the muscle', 'Also used for AE, CAV, and live fowl cholera in breeder pullets'], { bodySize: 14 });
  }
  {
    const s = content('Reading the take at 7 to 10 days', 'Check at 7 to 10 days [16]. The CPC General Principles rule of thumb: 2% of the flock [1]; Cobb says at least 50 to 100 birds picked at random [16]. Good take: two nodules, one from each prong. Weak: one. Miss: none [16]. A large, weeping lesion with spreading redness points to bacterial contamination: dirty applicator, contaminated vial, or vaccine in the muscle [1]. If one bird in five has no take, one in five is unprotected, and in an outbreak those birds are the leading edge. Low takes: check cold chain records, needle sharpness, restraint, reconstitution.');
    await photo(s, 'pox_take_wingweb.jpg', 0.5, 1.15, 3.0, 3.75, 'Take nodule (circled). Andrews SJ et al. 2022 (CC BY 4.0).');
    const sc = [['Good take', 'Two nodules, one from each prong', GREEN], ['Weak take', 'One nodule', GOLD], ['Miss', 'No nodule: no protection', RED]];
    sc.forEach(([t, d, col], i) => {
      const y = 1.2 + i * 0.85;
      badge(s, 3.9, y, 0.55, String(2 - i < 0 ? 0 : (2 - i)), { fill: col, color: WHITE, size: 18 });
      text(s, t, { x: 4.6, y: y - 0.02, w: 4.9, h: 0.33, fontSize: 16, bold: true, color: NAVY });
      text(s, d, { x: 4.6, y: y + 0.3, w: 4.9, h: 0.3, fontSize: 14 });
    });
    card(s, 3.9, 3.85, 5.6, 1.05, null, 'Check 2% of the flock, and at least 50 to 100 birds at random. Nearly every bird should have a good take.', { bullet: false, bodySize: 15, fill: NAVY, bodyColor: WHITE });
  }

  // ================= SECTION 5: INJECTION =================
  section('5. Injection Vaccination');
  divider('SECTION 5', 'Injection vaccination', 'The pre-lay killed round: the boost that carries layers and breeders through lay.',
    'Close to transfer, your veterinarian schedules killed multivalent vaccines, under the skin or into the breast. Killed vaccines given after live priming are what produce the high, even titers layers and breeders depend on [1]. Once birds are in lay you cannot redo it without disrupting production.');
  {
    const s = content('Why the pre-lay injection matters', 'By 16 to 18 weeks the live vaccines have primed the immune system [5]. A killed injection then produces high, even serum titers [1]. In the Merck example programs: commercial layers get killed ND/IB at about 18 weeks; broiler breeders get killed IBD, reovirus, and ND/IB at about 16 to 18 weeks [5]. The CPC Learning Centre IB fact sheet puts the killed IB shot at 16 to 20 weeks in pullets, helping protect kidney and oviduct, and it only works if the live vaccines went in properly first [12]. In breeders, the only way to get chicks with high, even maternal titers is breeder hens with high, even titers [3]. EDS-76 has no live vaccine: the killed shot before lay is the only protection [4].');
    await photo(s, 'Injection vaccination in pullets befor transfer to layeing house 2.png', 0.5, 1.15, 4.0, 3.5, 'Injecting a killed vaccine. Source: CPC Short Courses.');
    const tl = [['Live vaccines in rear', 'Prime the immune system'], ['16 to 18 weeks', 'Killed injection boosts titers'], ['Into lay', 'Protection for the hen and, in breeders, her chicks']];
    tl.forEach(([t, d], i) => {
      const y = 1.25 + i * 1.2;
      badge(s, 4.9, y, 0.6, String(i + 1));
      text(s, t, { x: 5.7, y: y - 0.02, w: 3.8, h: 0.38, fontSize: 17, bold: true, color: NAVY });
      text(s, d, { x: 5.7, y: y + 0.38, w: 3.8, h: 0.5, fontSize: 14 });
    });
  }
  {
    const s = content('Injector set-up and vaccine handling', 'From the Merial injection bulletin [24]: store at 2 to 8\u00B0C in the dark, never frozen; out of the fridge 24 hours ahead to reach about 22\u00B0C; shake well 30 seconds before and at regular intervals; do not vaccinate on a feed day (regurgitation). Calibrate with mineral oil: five doses of 0.5 mL should give 2.5 mL; check again halfway through the day. 18-gauge needles, 6 mm (1/4 in) for SC, 12 mm (1/2 in) for IM [1,24]. Change needles every 500 to 1,000 birds at most [16,24]; the CPC General Principles guide says every 200 to 500 [1]. A second person follows the vaccinator to catch missed birds (head shaking, bleeding, wet feathers) and revaccinate them [24].');
    const cards = [['Warm it', 'Out of the fridge 24 h ahead, to about 22\u00B0C'], ['Shake it', '30 seconds before filling, and often during'], ['Calibrate', '5 doses of 0.5 mL = 2.5 mL. Again halfway'], ['Needles', '18 gauge. 6 mm SC, 12 mm IM'], ['Change them', 'Every 500 to 1,000 birds; CPC: 200 to 500'], ['Not on feed day', 'A full crop plus handling means regurgitation']];
    cards.forEach(([t, d], i) => {
      const x = 0.5 + (i % 3) * 3.05, y = 1.2 + Math.floor(i / 3) * 1.9;
      card(s, x, y, 2.85, 1.7, t, d, { bullet: false, bodySize: 14 });
    });
  }
  {
    const s = content('Under the skin or into the breast', 'SC is preferred for killed vaccines: IM can cause abscesses and condemnations [24]. SC: lift a tent of skin at the back of the neck, needle through the skin into the pocket pointing down the neck toward the body; you feel resistance through the skin, then it moves freely; if not, pull out and retry [16,24]. Full dose before withdrawing. IM: breast muscle 3 to 5 cm (1 to 1.5 in) to one side of the keel, needle toward the tail at about 45 degrees; not on the midline, not too deep [16]. Pre-warming also reduces harsh local reactions [16].');
    card(s, 0.5, 1.2, 4.35, 3.7, 'Subcutaneous (preferred)', ['Back of the neck, on the midline', 'Lift a tent of skin', 'Needle points down the neck, toward the body', 'Resistance, then it slides freely', 'Full dose before you pull out'], { bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
    card(s, 5.15, 1.2, 4.35, 3.7, 'Intramuscular (only if the label says)', ['Breast muscle, 3 to 5 cm from the keel', 'Needle toward the tail at about 45\u00B0', 'Never on the keel midline', 'Not too deep: avoid the body cavity', 'More abscesses and condemnations than SC'], { bodySize: 15 });
  }
  {
    const s = content('Self-injection with oil vaccine is an emergency', 'The Cobb guide calls accidental human injection with oil emulsion products a serious danger: oil in a finger or hand can cut off circulation and cause severe injury, and a doctor usually has to clean it out [16]. The Merial bulletin: consult a doctor immediately [24]. Go even if only a tiny amount went in, take the vaccine label, and record the incident. Prevention: handlers present each bird at the right angle so the vaccinator is not reaching or struggling [16].');
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 9.0, h: 2.1, fill: { color: RED }, line: { color: RED }, rectRadius: 0.08, objectName: 'warning' });
    text(s, 'Treat it as a medical emergency, not a scratch.', { x: 0.8, y: 1.35, w: 8.4, h: 0.6, fontSize: 24, bold: true, color: WHITE });
    text(s, 'Oil injected into a finger or hand can cut off circulation and cause severe injury. A doctor usually has to clean the oil out.', { x: 0.8, y: 2.0, w: 8.4, h: 1.1, fontSize: 17, color: WHITE });
    const st = [['Go now', 'See a doctor right away, even for a tiny amount'], ['Take the label', 'The doctor needs to know what went in'], ['Prevent it', 'Handlers present the bird so the vaccinator never reaches']];
    st.forEach(([t, d], i) => card(s, 0.5 + i * 3.05, 3.55, 2.85, 1.35, t, d, { bullet: false, bodySize: 14 }));
  }

  // ================= SECTION 6: IN-OVO + QUICK REFERENCE =================
  section('6. In-Ovo and Quick Reference');
  {
    const s = content('In-ovo: protection before hatch', 'At about day 18 of incubation, machines at the hatchery inject vaccine into the amniotic fluid; the embryo swallows it before hatch [4,5]. Marek\u2019s (HVT, HVT/SB-1, Rispens), IBD, and in some programs ND [4,5]. Mild IBD can be combined with the Marek\u2019s dose [5]. Vectored vaccines, where a Marek\u2019s or Fowl Pox backbone carries ILT, ND, or IBD antigens, are common in-ovo or at day old [5]. Cell-associated Marek\u2019s vaccines are stored in liquid nitrogen at the hatchery [7]. This is the hatchery\u2019s job. Yours: know what the chicks arrived with, and time farm boosters with your veterinarian so they complement it.');
    stat(s, 0.5, 1.2, 2.6, 'Day 18', 'of a 21-day incubation, vaccine goes into the amniotic fluid', { bigSize: 44, bigH: 0.85, labelH: 0.9 });
    card(s, 3.4, 1.2, 3.0, 3.7, 'Given in-ovo', ['Marek\u2019s: HVT, HVT/SB-1, Rispens', 'IBD, sometimes with Marek\u2019s', 'Newcastle in some programs', 'Vectored vaccines carrying ILT, ND, or IBD'], { bodySize: 14 });
    card(s, 6.6, 1.2, 2.9, 3.7, 'Your part', ['Hatchery runs the machine and liquid nitrogen storage', 'Know what the chicks arrived with', 'Time farm boosters with your veterinarian'], { bodySize: 14, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
    text(s, 'Hatchery responsibility', { x: 0.5, y: 3.4, w: 2.6, h: 0.35, fontSize: 14, bold: true, color: MUTED });
    text(s, 'Equipment, egg trays, needle calibration, and vaccine storage are managed by hatchery staff.', { x: 0.5, y: 3.75, w: 2.6, h: 1.1, fontSize: 13 });
  }
  {
    const s = content('Quick reference: vaccine type and route', 'One page, every route. Use it when you sit down with your veterinarian to build or review a program. The route gets the vaccine in; the bird\u2019s immune response turns it into protection. Sections listed are in the course handbook.');
    const head = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12 } });
    const rowsL = [['Marek\u2019s', 'Live', 'In-ovo, or SC at hatchery'], ['IBD', 'Live', 'Water; in-ovo'], ['Newcastle', 'Live + killed', 'Water, spray, eye drop; injection'], ['Infectious bronchitis', 'Live + killed', 'Spray, eye drop, water; injection'], ['ILT', 'Live', 'Eye drop; coarse spray'], ['Fowl Pox', 'Live', 'Wing web']];
    const rowsR = [['AE', 'Live', 'Water; wing web'], ['Coccidiosis', 'Live oocyst', 'Water; spray'], ['EDS-76', 'Killed', 'Injection'], ['Reovirus', 'Live + killed', 'Injection'], ['IBH', 'Killed (autogenous)', 'Injection'], [[{ text: 'Salmonella', options: { italic: true } }, { text: ' (SE, ST)' }], 'Killed bacterin', 'Injection']];
    const mk = rows => [[head('Disease'), head('Type'), head('Main route')], ...rows.map((r, i) => r.map(c => ({ text: Array.isArray(c) ? c.map(run => ({ text: run.text, options: { fontSize: 12, color: INK, ...(run.options || {}) } })) : c, options: { fontSize: 12, color: INK, fill: { color: i % 2 ? 'FFFFFF' : THEME.colors.lt2 } } })))];
    s.addTable(mk(rowsL), { x: 0.5, y: 1.2, w: 4.4, colW: [1.45, 1.05, 1.9], rowH: 0.47, border: { type: 'solid', pt: 0.5, color: 'D5DEEA' }, margin: 0.05, valign: 'middle', fontFace: 'Calibri' });
    s.addTable(mk(rowsR), { x: 5.1, y: 1.2, w: 4.4, colW: [1.45, 1.15, 1.8], rowH: 0.47, border: { type: 'solid', pt: 0.5, color: 'D5DEEA' }, margin: 0.05, valign: 'middle', fontFace: 'Calibri' });
  }

  // ================= SECTION 7: REACTIONS =================
  section('7. Post-Vaccination Reactions');
  divider('SECTION 7', 'Post-vaccination reactions', 'Mild means the vaccine is doing its job. Harsh means something went wrong.',
    'Every live respiratory vaccine produces some response. The goal, in the words of the CPC Learning Centre General Principles guide, is immunization without harsh reaction and secondary infection [1].');
  {
    const s = content('Normal, or time to call?', 'Butcher and colleagues: a mild respiratory reaction shows at 2 to 3 days after vaccination, lasts about 5 to 7 days, and settles on its own; no intervention is needed [22]. Faint rattle, slightly watery eyes, a quiet flock for a day or two, a brief dip in feed and water. Do not reach for antibiotics because birds sound raspy at day 3. After killed oil vaccines, a small firm lump at the SC site is the adjuvant releasing antigen slowly [1]. Call your veterinarian for any of the four signs on the right. Large spreading abscesses, weeping lesions, or depression past 24 to 48 hours after injection also need a call.');
    card(s, 0.5, 1.2, 4.35, 3.7, 'Normal: let it run', ['Starts 2 to 3 days after live vaccine', 'Lasts about 5 to 7 days, settles on its own', 'Faint rattle, a few watery eyes, quiet flock', 'Small firm lump after a killed oil vaccine', 'No antibiotics for a day-3 rattle'], { bodySize: 15, fill: TINT });
    card(s, 5.15, 1.2, 4.35, 3.7, 'Call your veterinarian', ['Not easing by day 7, or worse after day 5', 'Significant deaths with the respiratory signs', 'Swollen faces, sinusitis, hard breathing', 'Serology at 21 days low or widely scattered'], { bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }
  {
    const s = content('What turns a mild reaction into a problem', 'Droplets too fine, from a worn nozzle or wrong pressure: deeper and harder [18,22]. MG-positive flocks: the airway lining is already inflamed, so the reaction is amplified; work with your veterinarian on a less aggressive route and antibiotic cover during the reaction [22]. Secondary E. coli is a common complication: dirty litter and drinkers feed it [22]. Sick or stressed birds react harder and end up less protected; vaccinate only healthy birds [1]. Do not stack a second live respiratory vaccine on an active reaction: wait for recovery and plan the timing with your veterinarian [1].');
    const f = [['Droplets too fine', 'Worn nozzle or wrong pressure sends vaccine deeper'], [[{ text: 'Mycoplasma', options: { italic: true } }, { text: ' in the flock' }], 'Airways already inflamed; plan with your veterinarian'], [[{ text: 'E. coli', options: { italic: true } }, { text: ' waiting' }], 'Dirty litter and drinkers turn a rattle into airsacculitis'], ['Sick, stressed, or stacked', 'Vaccinate healthy birds only; never on top of an active reaction']];
    f.forEach(([t, d], i) => {
      const x = 0.5 + (i % 2) * 4.65, y = 1.2 + Math.floor(i / 2) * 1.9;
      badge(s, x, y + 0.1, 0.55, String(i + 1), { fill: i === 3 ? RED : GOLD, color: i === 3 ? WHITE : NAVY });
      text(s, t, { x: x + 0.75, y: y + 0.05, w: 3.6, h: 0.4, fontSize: 17, bold: true, color: NAVY });
      text(s, d, { x: x + 0.75, y: y + 0.5, w: 3.6, h: 1.0, fontSize: 14 });
    });
  }

  // ================= SECTION 8: TREATMENT AND AMR =================
  section('8. Treatment and AMR');
  divider('SECTION 8', 'Treatment and AMR', 'Principles of treatment. Even a well-immunized flock can get sick: treat legally, responsibly, and on a diagnosis.',
    'A bacterial infection takes hold, a disease the program does not cover shows up, or immunity falls short in part of the flock. Then the birds may need antibiotics.');
  {
    const s = content('Antibiotic resistance in plain words', 'AMR happens when bacteria that should be killed by an antibiotic survive and pass on that ability [25]. Every use applies selection pressure. Canada\u2019s national surveillance program tracks resistant Salmonella in chickens, chicken meat, and people, and has seen some resistant strains increasing [26]. First step before any antibiotic: a diagnosis. Fresh dead or cull birds to your veterinarian or the lab, with culture and sensitivity (C and S): which bug, and which drugs still kill it on your farm. Canadian stewardship experts make the same point: let C and S results guide the drug, especially before reaching for antibiotics that matter most in human medicine [27].');
    const flow = [['Antibiotic used', 'Most bacteria die'], ['Tough ones survive', 'They carry and spread resistance'], ['Next treatment fails', 'Same drug, weaker result']];
    flow.forEach(([t, d], i) => {
      const x = 0.5 + i * 3.05;
      card(s, x, 1.2, 2.85, 1.55, t, d, { bullet: false, bodySize: 14 });
      if (i < 2) s.addShape(pres.ShapeType.rightArrow, { x: x + 2.88, y: 1.82, w: 0.15, h: 0.3, fill: { color: GOLD }, line: { color: GOLD } });
    });
    card(s, 0.5, 3.0, 9.0, 1.9, 'First step: find out what you are treating', 'Get fresh dead or cull birds to your veterinarian or the lab and ask for culture and sensitivity. It tells you which bacteria, and which drugs still work on your farm. Treating on a guess wastes money and breeds resistance.', { bullet: false, bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }
  {
    const s = content('What the law requires', 'Since December 1, 2018, every medically important antimicrobial in Canada needs a prescription from a licensed veterinarian before use in a food animal; what used to be sold over the counter now needs that prescription [28]. To prescribe, your veterinarian needs a valid veterinarian-client-patient relationship (VCPR): they must know your operation well enough to make a clinical judgment. Health Canada ranks antimicrobials in four categories by importance to human medicine; ionophores used for coccidiosis control sit in Category IV, the group not used in human medicine [29]. What your veterinarian needs from you: regular updates on mortality, feed and water, behavior; fresh birds for testing; a clear history; then the prescription followed exactly, full dose and full course.');
    stat(s, 0.5, 1.2, 3.6, 'Dec 1, 2018', 'medically important antibiotics became prescription-only in Canada', { bigSize: 36, bigH: 0.8, labelH: 0.75 });
    card(s, 0.5, 3.0, 3.6, 1.9, 'Ionophores', 'Category IV in Health Canada\u2019s ranking: the group not used in human medicine.', { bullet: false, bodySize: 14 });
    card(s, 4.4, 1.2, 5.1, 3.7, 'Before you treat', ['A valid VCPR with your veterinarian', 'A veterinary prescription', 'Keep your veterinarian updated before a crisis', 'Fresh birds and a clear history to the lab', 'Full dose, full course, exactly as written'], { bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }
  {
    const s = content('Treatment routes, withdrawal, and records', 'Water: fastest in an outbreak, because sick birds stop eating before they stop drinking. Flush lines before and after to clear biofilm. Feed: suits longer-running programs your veterinarian prescribes; slower in an outbreak. Injectable: precise dose for breeders, small groups, or when no water or feed form exists. Every label has a withdrawal time; shipping birds or selling eggs before it ends is a food safety violation, and residues can mean condemnation, suspension, or lost contracts. Keep a written record of every treatment: dates, drug and active ingredient and category, dose and route, birds treated, prescription number, withdrawal date.');
    const r = [['Water', 'Fastest in an outbreak. Flush lines before and after.'], ['Feed', 'Longer-running programs. Slow when birds are off feed.'], ['Injectable', 'Precise dose for breeders and small groups.']];
    r.forEach(([t, d], i) => card(s, 0.5, 1.2 + i * 1.25, 4.0, 1.1, t, d, { bullet: false, bodySize: 14 }));
    card(s, 4.8, 1.2, 4.7, 3.6, 'Record every treatment', ['Start and end dates', 'Drug, active ingredient, category', 'Dose and route', 'Number and type of birds', 'Prescription number', 'Withdrawal date from the last dose'], { bodySize: 15, fill: NAVY, titleColor: GOLD, bodyColor: WHITE });
  }

  // ================= CLOSE =================
  section('Close');
  {
    const s = pres.addSlide({ masterName: 'CPC_SECTION', sectionTitle: curSection });
    s.addText('KEY TAKEAWAYS', { placeholder: 'kicker' });
    s.addText('What to take back to the barn', { placeholder: 'title' });
    const t = ['Vaccinating is not immunity. Every bird has to get a live, full dose.', 'Cold chain 2 to 8\u00B0C, chlorine out, milk in, all drunk in 2 hours.', 'Droplet size, drop size, and needle depth decide where vaccine lands.', 'Check your work: blue tongues, wing web takes, serology.', 'Mild reaction is normal. Know the four signs that need a call.', 'No antibiotic without a VCPR, a prescription, and a diagnosis.'];
    t.forEach((x, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      badge(s, 0.8 + col * 4.3, 3.2 + row * 0.66, 0.42, String(i + 1), { size: 13 });
      s.addText(x, { isTextBox: true, x: 1.35 + col * 4.3, y: 3.12 + row * 0.66, w: 3.65, h: 0.58, fontSize: 14, color: WHITE, margin: 0, valign: 'middle' });
    });
    s.addNotes('Recap the six points. Then the practical session: water system set-up, sprayer calibration, dropper calibration, wing web technique, injector calibration with mineral oil. Questions now.');
  }
  // References (V3 numbering), split over two slides
  const refs = [
    'CPC Learning Centre. General Principles of Vaccination [Technical Bulletin].',
    'Burns Grogan K, et al. Avian Immune System: A Brief Review. Merial; 2008.',
    'CPC Learning Centre. Maternal Antibody Transfer [Technical Bulletin].',
    'Swayne DE, ed. Diseases of Poultry. 14th ed. Wiley-Blackwell; 2020.',
    'Merck Veterinary Manual. Vaccination Programs for Poultry. 2023.',
    'Merck Veterinary Manual. Types of Vaccines for Animals. 2026.',
    'Montiel E. Troubleshooting a Marek\u2019s Disease Outbreak. Merial; 2005.',
    'CPC Learning Centre. Infectious Bursal Disease [Disease Profile].',
    'Rohollahzadeh H, et al. Comp Clin Path. 2018;27(5):1241-1255.',
    'Merck Veterinary Manual. Newcastle Disease in Poultry. 2026.',
    'CPC Learning Centre. Infectious Bronchitis Virus [Disease Profile].',
    'Dizaji R. Infectious Bronchitis in Chickens [Fact Sheet]. CPC Learning Centre; 2026.',
    'Canadian Food Inspection Agency. Memorandum 2026-01: Reduction of the withdrawal period for certain chicken vaccines. 2026.',
    'Merial. Water Vaccination [Technical Bulletin].',
    'Fernandez A. Drinking Water Vaccination [Aviagen Brief]. 2008.',
    'Cobb-Vantress. Cobb Vaccination Management Guide. 2025.',
    'Ojkic D, Susta L, Martin E. J Vet Diagn Invest. 2024;36(6):804-808.',
    'Merial. Coarse Spray Vaccination [Technical Bulletin].',
    'CPC Learning Centre. Infectious Laryngotracheitis [Disease Profile].',
    'Al-Rasheed M, et al. Vaccine. 2023;41(31):4508-4524.',
    'Andreasen JR Jr, et al. Avian Dis. 1989;33(3):516-523.',
    'Butcher GD, Miles RD, Nilipour AH. ND and IB Vaccine Reactions in Commercial Broilers. UF/IFAS EDIS VM097; 2002, rev. 2017.',
    'CPC Learning Centre. Fowl Pox in the Fraser Valley [Disease Profile].',
    'Merial. Injection of Inactivated Vaccines [Technical Bulletin].',
    'World Health Organization. Antimicrobial resistance [Fact sheet].',
    'Public Health Agency of Canada. CIPARS 2023: Key and Integrated Findings. 2025.',
    'Canadian Academy of Health Sciences. AMR/AMU in Food-Producing Animals in Canada. 2025.',
    'Health Canada. Responsible use of Medically Important Antimicrobials in animals.',
    'Health Canada. Categorization of Antimicrobial Drugs Based on Importance in Human Medicine. 2009.',
  ];
  for (let part = 0; part < 2; part++) {
    const s = content(part === 0 ? 'Sources (1 of 2)' : 'Sources (2 of 2)', 'Full citations are in the reference list of the Course 8 handbook (Vaccination and Treatment, V3). Numbers match the bracketed numbers in these speaker notes.');
    const slice = refs.slice(part * 15, part * 15 + 15);
    [0, 1].forEach(col => {
      const items = slice.slice(col * 8, col * 8 + 8);
      s.addText(items.map((r, i) => ({ text: `${part * 15 + col * 8 + i + 1}.  ${r}`, options: { breakLine: i < items.length - 1, paraSpaceAfter: 5 } })), { isTextBox: true, x: 0.5 + col * 4.6, y: 1.15, w: 4.4, h: 3.9, fontSize: 12.5, color: INK, margin: 0, valign: 'top' });
    });
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('Wrote', OUT, fs.statSync(OUT).size, 'bytes,', pres.slides.length, 'slides');
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
