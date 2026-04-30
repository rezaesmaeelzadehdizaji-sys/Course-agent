// ============================================================
// generate-course3-revised.mjs — Course 3: T-FLAWS Assessment Management Tool
// CPC Short Courses — Revised & Aligned Draft (April 2026)
// Updated to current CLAUDE.md standards:
//   - CPC Short Courses cover branding
//   - Farmer-Flow humanization pass applied
//   - Vancouver-style numbered citations added throughout
//   - Photo numbering fixed (Photos 1-10, no duplicates)
//   - Reference 27 (Kittelsen) corrected
//   - Em dashes removed from body text
// Uses docx v9.6.1 (local node_modules)
// Run: node generate-course3-revised.mjs
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  HeadingLevel,
  TableOfContents,
  BorderStyle,
  convertInchesToTwip,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 3');
const OUT_FILE  = path.join(OUT_DIR, 'T-FLAWS_Assessment_Management_Tool_draft.docx');
const SRC_FILE  = path.join(OUT_DIR, '_source_images.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

// ============================================================
// EXTRACT SOURCE IMAGES FROM EXISTING DOCX
// Images in document order confirmed via XML relationship analysis:
//   image1.png  = CPC logo (cover)            1.50" x 1.50"
//   image2.png  = Figure 1: FPD scoring       6.50" x 3.25"
//   image3.jpg  = Photo 1: FPD reference      6.02" x 3.02"
//   image4.jpg  = Photo 2: FPD field example  6.01" x 3.97"
//   image5.png  = Figure 2: Feather scoring   6.50" x 2.52"
//   image6.jpg  = Photo 3: Feather loss       4.48" x 2.91"
//   image7.png  = Figure 3: Gait scoring      6.50" x 3.25"
//   image8.jpg  = Photo 4: Lame broiler       6.03" x 3.30"
//   image9.jpg  = Photo 5: Splay-legged       6.00" x 3.67"
//   image10.png = Photo 6: Tibial TD          4.50" x 5.39" (scaled)
//   image11.png = Figure 4: Distribution      6.50" x 3.25"
//   image12.jpg = Photo 7: Broiler house      6.01" x 3.57"
//   image13.jpg = Photo 8: Broiler flock      6.00" x 3.80"
//   image14.png = Figure 5: Weight dist.      6.50" x 3.51"
//   image15.png = Figure 6: Skin conditions   6.50" x 3.26"
//   image16.jpg = Photo 9: Bumblefoot         6.00" x 3.40"
//   image17.jpg = Photo 10: Cyanosis          6.03" x 3.56"
// ============================================================
const srcZip = await JSZip.loadAsync(fs.readFileSync(SRC_FILE));

async function extractImg(fname) {
  const f = srcZip.files[`word/media/${fname}`];
  return f ? f.async('nodebuffer') : null;
}

const IMG = {
  logo:  { buf: await extractImg('image1.png'),  type: 'png', w: 1.50, h: 1.50 },
  fig1:  { buf: await extractImg('image2.png'),  type: 'png', w: 6.50, h: 3.25 },
  ph1:   { buf: fs.readFileSync(path.join(OUT_DIR, 'aaap_fpd_scoring_2022.png')), type: 'png', w: 6.50, h: 3.27 },
  ph2:   { buf: await extractImg('image4.jpg'),  type: 'jpg', w: 6.01, h: 3.97 },
  fig2:  { buf: await extractImg('image5.png'),  type: 'png', w: 6.50, h: 2.52 },
  ph3:   { buf: await extractImg('image6.jpg'),  type: 'jpg', w: 4.48, h: 2.91 },
  fig3:  { buf: await extractImg('image7.png'),  type: 'png', w: 6.50, h: 3.25 },
  ph4:   { buf: await extractImg('image8.jpg'),  type: 'jpg', w: 6.03, h: 3.30 },
  ph5:   { buf: await extractImg('image9.jpg'),  type: 'jpg', w: 6.00, h: 3.67 },
  ph6:   { buf: await extractImg('image10.png'), type: 'png', w: 4.50, h: 5.39 },
  fig4:  { buf: await extractImg('image11.png'), type: 'png', w: 6.50, h: 3.25 },
  ph7:   { buf: await extractImg('image12.jpg'), type: 'jpg', w: 6.01, h: 3.57 },
  ph8:   { buf: fs.readFileSync(path.join(OUT_DIR, 'Broiler farm.png')), type: 'png', w: 6.00, h: 4.50 },
  fig5:  { buf: await extractImg('image14.png'), type: 'png', w: 6.50, h: 3.51 },
  fig6:  { buf: await extractImg('image15.png'), type: 'png', w: 6.50, h: 3.26 },
  ph9:   { buf: await extractImg('image16.jpg'), type: 'jpg', w: 6.00, h: 3.40 },
  ph10:  { buf: await extractImg('image17.jpg'), type: 'jpg', w: 6.03, h: 3.56 },
};

// ============================================================
// COLOURS
// ============================================================
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';
const RED       = 'CC0000';

// ============================================================
// HELPERS
// ============================================================
function run(text, opts = {}) {
  return new TextRun({
    text,
    bold:    opts.bold    || false,
    italics: opts.italics || false,
    color:   opts.color   || BODY_GRAY,
    size:    opts.size    || 24,
    font:    'Calibri',
  });
}

// para() accepts a plain string OR an array of segment objects
// Segment: { text, bold?, italics?, color?, size? }
function para(content, opts = {}) {
  const children = Array.isArray(content)
    ? content.map(s => new TextRun({
        text:    s.text,
        bold:    s.bold    || false,
        italics: s.italics || false,
        color:   s.color   || BODY_GRAY,
        size:    s.size    || 24,
        font:    'Calibri',
      }))
    : [run(content, { bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })];

  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing:   { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent:    opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } });
}

function bullet(content, lvl = 0) {
  const children = Array.isArray(content)
    ? content.map(s => new TextRun({
        text:    s.text,
        bold:    s.bold    || false,
        italics: s.italics || false,
        color:   s.color   || BODY_GRAY,
        size:    24,
        font:    'Calibri',
      }))
    : [new TextRun({ text: content, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({
    children,
    numbering: { reference: 'bullet-list', level: lvl },
    spacing:   { after: 80, line: 276, lineRule: 'auto' },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

const DPI = 96;
function embedImage(key, caption) {
  const img = IMG[key];
  if (!img || !img.buf) return [];
  const wpx = Math.round(img.w * DPI);
  const hpx = Math.round(img.h * DPI);
  return [
    new Paragraph({
      children: [new ImageRun({ data: img.buf, transformation: { width: wpx, height: hpx }, type: img.type })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 160, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 60, after: 240 },
    }),
  ];
}

// Needs-source inline text runs
function needsSource() {
  return { text: ' [NEEDS SOURCE]', bold: true, color: RED };
}

// ============================================================
// HEADER / FOOTER
// ============================================================
function buildHeader() {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ text: 'T-FLAWS Assessment Management Tool', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
        ],
        alignment: AlignmentType.RIGHT,
        border:    { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
      }),
    ],
  });
}

function buildFooter() {
  // Static footer (no PAGE / NUMPAGES fields). Live page-number fields
  // make Word display the "fields may refer to other files" dialog on
  // every open, even when the file is in a Trusted Location.
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'CPC Short Courses  |  Course 3 of 17  |  T-FLAWS Assessment Management Tool', color: '888888', size: 18, font: 'Calibri' }),
        ],
        alignment: AlignmentType.CENTER,
        border:    { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
      }),
    ],
  });
}

const pageMargin = {
  top:    convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left:   convertInchesToTwip(1.25),
  right:  convertInchesToTwip(1.25),
};

// ============================================================
// COVER PAGE
// ============================================================
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1800, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 3 OF 17: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 200 },
    }),
  ];

  if (logoBuffer) {
    let lw = 144, lh = 144;
    try {
      const view = new DataView(logoBuffer.buffer, logoBuffer.byteOffset);
      const pw   = view.getUint32(16, false);
      const ph   = view.getUint32(20, false);
      if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw);
    } catch (_) {}
    children.push(
      new Paragraph({
        children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
        alignment: AlignmentType.CENTER,
        spacing:   { before: 300, after: 300 },
      })
    );
  } else {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: '[CPC LOGO PLACEHOLDER]', bold: true, color: '999999', size: 28, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing:   { before: 300, after: 300 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'T-FLAWS Assessment Management Tool', bold: true, color: DARK_BLUE, size: 56, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'A Structured Flock Assessment Framework for Commercial Poultry Farmers in Canada', color: MED_BLUE, size: 30, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '───────────────────────────────────', color: MED_BLUE, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Duration: 2 hours', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'April 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 800 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from the field experience of Canadian poultry consultants, peer-reviewed scientific literature, and industry management guides. This material does not replace the advice of a licensed veterinarian or regulatory authority.', color: '808080', size: 18, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
    }),
    pageBreak(),
  );

  return {
    properties: { titlePage: true, page: { margin: pageMargin } },
    headers: { first: new Header({ children: [new Paragraph({ children: [] })] }) },
    footers: { first: new Footer({ children: [new Paragraph({ children: [] })] }) },
    children,
  };
}

// ============================================================
// TABLE OF CONTENTS — real Word TOC field with cached entries
// Post-build patch injects pre-computed page numbers into the
// SDT cache so the TOC renders correctly on first open.
// ============================================================
function buildTocSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', {
        hyperlink:        true,
        headingStyleRange: '1-2',
      }),
    ],
  };
}

// ============================================================
// INTRODUCTION
// ============================================================
function buildIntroSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Introduction to T-FLAWS'),
      para("Good poultry farmers walk their barns differently. They are not just looking for dead birds. They are looking at how the flock is sitting, where the wet patches are, which corner is too quiet. T-FLAWS just gives that walk a name and a checklist."),
      para("It stands for Toes, Feathers, Legs, Activity, Weight, and Skin. Six things. You check them on the same farm walk you already do. None of them take a lab. None of them need a special tool. A flashlight, a scale, your eyes, and ten extra minutes per barn."),
      para("The reason these six work together is that birds break down in a pattern. Wet litter hits the feet before it hits the hocks, and the hocks before it hits the breast. A sore-legged bird stops walking to the feeder days before you notice the weight gap. One thing pulls the next. If you only check one, you catch the problem late. If you check all six, you catch it on Day 14 instead of Day 28."),
      para("Welfare audits and the NFACC Code of Practice already expect this kind of on-farm monitoring [23]. T-FLAWS is just a way to put numbers on what good farmers have always done by feel."),
      h2('What This Guide Is For'),
      para("Each section covers one letter. What you are looking at. Why it matters at the plant. How to score it. What to do when the number is bad. The guide is written for working broiler, layer, and breeder farmers and the consultants who walk barns with them. You should be able to take it into the barn this afternoon and start using it."),
      h2('When to Do Your Assessments'),
      para("Broilers run on a fixed schedule. Day 7 you only need Activity and Weight, just to confirm the chicks settled. Day 14 do the full six. Day 21 again. Day 28 before thinning to see your condition. Day 35 or at depopulation for the final read."),
      para("Layers and breeders run on a calendar instead of a flock cycle. Once a month is the baseline. Add an extra walk any time something changes. A jump in mortality. A new feed batch. A heat wave or a cold snap. Anything that breaks the pattern earns a T-FLAWS walk that week."),
    ],
  };
}

// ============================================================
// T: TOES
// ============================================================
function buildToesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('T: Toes'),
      h2('What Are We Looking At?'),
      para("Pick a bird up, flip it, look at the underside of the foot. The skin should be smooth and yellow. What you are checking for is footpad dermatitis, FPD or pododermatitis if your vet writes it down. It runs from a bit of darkening on the surface to a deep crater that bleeds when you press it. Three scores [26,28]:"),
      para([{text:'Score 0: ', bold:true},{text:'Clean foot. Skin smooth, no dark patches. Mild scale or faint discoloration may be present but no lesion. That is what a dry-litter flock looks like.'}]),
      para([{text:'Score 1: ', bold:true},{text:"Surface starting to go. Brownish patches, the top layer of skin breaking down. The bird is not lame yet but the litter has been wet for a while."}]),
      para([{text:'Score 2: ', bold:true},{text:'A real lesion. Deep, often with black dead tissue. Covers a good chunk of the pad. The bird is in pain when it walks. This is what gets the foot condemned.'}]),
      para("While the bird is in your hands, look for three other things. Bumblefoot, which is a hard scabby lump from a staph infection that got in through a small cut. Curled toes that did not straighten after hatch. And black, dead toe tips in chicks under a week old."),
      h2('Why It Matters to Your Operation'),
      para("Two reasons. The first is the audit. FPD is the first thing the welfare auditor pulls a bird to check, every time. It is named in the NFACC Code and in the Chicken Farmers of Canada Animal Care Program [23]. The second is the kill floor. Grade 2 feet get condemned. You lose the foot, and on a bad flock you lose enough feet to notice it in the cheque [26]."),
      para("There is a third reason too, and it is the one most farmers under-value. Bad feet are a litter signal. By the time the feet show Score 2 lesions, your ammonia has been high for weeks, and high ammonia has already cost you in FCR and respiratory health that you never billed to the foot problem [13]."),
      h2('How to Do the Assessment'),
      para("Pick up 100 birds per barn. Pull them from at least five spots across the floor, not just by the door. Check both feet on every bird and score the worse one. Do not bother before Day 21, the lesions need time to develop."),
      para("Your numbers: Score 2 should be under 5% [28]. If Score 1 is above 20% at Day 21 you are heading for a Score 2 problem and you have about a week to fix the litter."),
      h2('What to Do When Scores Are High'),
      para([{text:'Score 1 above 20%: ', bold:true},{text:"The litter is going wet on you. Walk every drinker line and look for drips. Check nipple height (it should match bird height, you adjust it weekly). Bump up the ventilation rate. Do not wait for Score 2 to confirm it."}]),
      para([{text:'Score 2 above 5%: ', bold:true},{text:'This is chronic wet litter, not a one-off. A spot fix will not catch you up. Sit down with whoever runs your ventilation, pull the last two weeks of humidity readings, and figure out what changed.'}]),
      para([{text:'Bumblefoot: ', bold:true},{text:"Look for what is cutting the birds. Sharp edges on slats, broken nipple ends, rough patches in the flooring. The "},{text:"Staphylococcus aureus", italics:true},{text:" is everywhere, but it cannot get in without a wound."}]),
      para([{text:'Curled toes: ', bold:true},{text:"Almost always one of two things. Either the diet is short on riboflavin (B2), or the hatchery had an incubation temperature problem. Call the hatchery first, check feed second."}]),
      para([{text:'Black toe tips in young chicks: ', bold:true},{text:"Usually brooding ran too hot, or the chicks dried out before they found water. Either way, fix it on the next placement, you cannot save the toes you have."}]),
      para("Keep ammonia under 25 ppm at bird level. NFACC requires it [23]. Biotin in the diet at 150 to 300 mcg per kg keeps the skin tough enough to resist breakdown [1,9]."),
      ...embedImage('fig1', 'Figure 1. Footpad Dermatitis Scoring Scale (Welfare Quality® 0-2). Score 0: healthy intact foot; Score 1: early surface erosion; Score 2: deep ulceration with necrotic tissue. Source: Welfare Quality® Assessment Protocol for Poultry, 2009.'),
      ...embedImage('ph1', 'Photo 1. Broiler footpad scoring reference, 0 to 2 scale. Score 0: normal pad, no lesion (mild discoloration acceptable). Score 1: hyperkeratosis, thickening of skin, lesion(s) covering less than 1/2 of foot pad. Score 2: lesion(s) covering more than 1/2 of foot pad, may include the toes, hemorrhages or swelling of foot pad. Source: AAAP Broiler Foot Condition Scoring Guide (2022).'),
      ...embedImage('ph2', 'Photo 2. Footpad dermatitis and hock burn on a commercial broiler, field example. The dark necrotic tissue on the footpad is a Score 2 FPD lesion; the brown discoloration on the hock joint is a Score 1-2 hock burn. Both indicate chronic litter moisture problems. Source: USDA Agricultural Research Service. Public Domain.'),
    ],
  };
}

// ============================================================
// F: FEATHERS
// ============================================================
function buildFeathersSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('F: Feathers'),
      h2('What Are We Looking At?'),
      para("Walk through the flock at a normal pace and look at backs, wings, necks, tails, breasts. The score runs 0 to 4. A 0 is a fully feathered bird, no gaps. A 4 is a bird with a big bare patch, sometimes with a wound. Everything else is in between. Score each body region on its own, because the back can be at a 3 while the wings are still at a 0."),
      para("The score is the easy part. The harder part is working out why the feathers are gone. Pulled feathers leave a clean quill stub at the skin, that is pecking [4]. Broken or frayed feathers usually mean mites or lice. And if every bird in the flock looks under-feathered to the same degree, that is not behaviour, that is feed or genetics."),
      h2('Why It Matters to Your Operation'),
      para("Feathers are insulation. A bird with a bare back has to eat more feed just to hold body temperature, and that shows up in FCR especially in cold weather [31]. In a layer flock the bigger problem is what comes next. Once a peck draws blood, the rest of the birds notice. Cannibalism can take a flock from a small problem to mass mortality inside a day [4]. At the plant, badly feathered birds slow the picker line and tear during defeathering, which downgrades the carcass."),
      h2('How to Do the Assessment'),
      para("Score 50 birds per barn. Each body region separately, do not just give one number to the whole bird. In broilers start at Day 21, before that the feathers are still coming in. In layers and breeders this is a monthly job."),
      para([
        {text:"When you find a bare patch, get up close and look at the feathers around the edge. Quill stubs poking out of the skin means pecking. Frayed, dirty, broken feathers means parasites [4]. To confirm mites, walk the barn at night with a flashlight, especially the corners of nest boxes and under perches. Red mite ("},
        {text:"Dermanyssus gallinae", italics:true},
        {text:") feeds in the dark; if the population is heavy you will see it on the wood. If every single bird in the flock is feathering poorly, mites are not the cause, look at diet and breed first."},
      ]),
      h2('What to Do When You See Feather Loss'),
      para([{text:'Bare back and vent: ', bold:true},{text:"This is pecking until proven otherwise. First fix is the lighting. Drop broilers under 10 lux, layers under 20 lux, and walk the barn to make sure no one corner is brighter than another. Add something for the birds to peck, hanging cabbages or pecking blocks work fine, do not over-think it. Then check feeder and drinker access; pecking gets worse where birds compete."}]),
      para([{text:'Broken feathers on both sides: ', bold:true},{text:"Treat as mites until you rule them out. Red mite especially can take a flock down fast in summer. Get an approved acaricide and a sanitation pass through the barn before the next placement."}]),
      para([{text:'Stress bars across the feather shaft: ', bold:true},{text:"You cannot fix the feather, but the bar is a record of when the bird had a bad few days. Match the position of the bar against your flock records. Disease, temperature spike, feed outage. Whatever you find, that is the thing to prevent next cycle."}]),
      para("On nutrition, the methionine plus cysteine number on your feed spec has to match the breed recommendation. Sulfur Amino Acids shortages are the most common diet-driven cause of poor feather quality [1,9]."),
      ...embedImage('fig2', 'Figure 2. Feather Coverage Scoring Scale (LayWel Protocol). Score 0: full plumage; Score 2: moderate loss with bare skin visible; Score 4: large bare area, possible skin wound. Source: LayWel Welfare Assessment Protocol for Laying Hens.'),
      ...embedImage('ph3', 'Photo 3. A hen showing significant feather loss on the back and neck, classic feather pecking damage. The exposed skin on the dorsal surface is characteristic of Score 3-4 feather damage from subordinate rank or chronic pecking. Source: Wikimedia Commons, CC BY 1.0.'),
    ],
  };
}

// ============================================================
// L: LEGS
// ============================================================
function buildLegsSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('L: Legs'),
      h2('What Are We Looking At?'),
      para("Stand still at the end of the barn and let the birds walk. Do not chase them, do not even take a step. The Bristol Gait Score [17] is what you use, six numbers from 0 to 5:"),
      para([{text:'Score 0: ', bold:true},{text:"Walks like nothing is wrong. Smooth, balanced, full weight on both legs."}]),
      para([{text:'Score 1: ', bold:true},{text:"A small hitch you notice if you look. The bird still moves around the barn fine."}]),
      para([{text:'Score 2: ', bold:true},{text:"Clear limp. You do not have to look twice. The bird is slower and balances less well."}]),
      para([{text:'Score 3: ', bold:true},{text:"The bird stops moving unless it has to. Stands in one spot. It is in real pain."}]),
      para([{text:'Score 4: ', bold:true},{text:"Cannot walk without flapping its wings to stay up. It is not getting to the feeder and drinker on its own."}]),
      para([{text:'Score 5: ', bold:true},{text:"Down on its side and cannot get up. Euthanise on the spot. Do not leave it for tomorrow."}]),
      para("Two more things while you are looking. Hock burn, that brown patch or ulcer on the back of the hock, scored 0 to 2 the same way as the foot. And crooked legs that bow in or out (valgus and varus). When you post-mortem a lame bird, open the tibia and look in the growth plate. A white rubbery plug where there should be bone is tibial dyschondroplasia."),
      h2('Why It Matters to Your Operation'),
      para("Lameness is the biggest single welfare and production problem in modern broilers. A UK study across many farms found more than 27% of birds at slaughter walking at gait 3 or worse [18]. That is not a one-off, that is the industry baseline you are trying to beat."),
      para("A Score 3 bird is in pain. It does not walk to the feeder enough, so it falls off the weight curve. It lies down on wet litter, so it gets a breast blister. The auditor sees it. The processor sees it. The contract consequences are not theoretical, every Canadian processor program scores leg health and high rates show up in your file."),
      h2('How to Do the Assessment'),
      para("Score 150 birds moving freely. The trick is to stand back. The minute you walk into the middle of the flock the lame birds get up and try to move with the others, and you cannot tell who is sore. Score as you go, do not try to remember. Then catch 30 of them and flip them to score the hock. Start at Day 28 in broilers, before that lameness numbers are too low to mean anything."),
      para("Any time you have a dead or culled lame bird in the bucket, open the tibia. The white cartilage plug tells you straight away whether you have a calcium, phosphorus, or Vitamin D3 problem in the diet."),
      h2('What to Do When Scores Are High'),
      para([{text:'Gait 3+ above 5%: ', bold:true},{text:"This will hit both your audit and your weight gain. The first thing to look at is your lighting. NFACC requires at least 4 consecutive hours of darkness, and 6 hours is the recommended best practice [23]. That dark period is when the legs grow and recover. After that, check bedding depth (5 cm minimum at placement) and run your feed spec past your breed standard [1,9]."}]),
      para([{text:'Hock burn at Score 2 above 5%: ', bold:true},{text:"Same problem as wet feet. Fix is the same. Ventilation up, drinker leaks fixed, caked litter pulled out."}]),
      para([{text:'Crooked legs (valgus/varus): ', bold:true},{text:"Multiple birds with the same deformity is a feed or genetics problem. One bird with one crooked leg is usually an old injury."}]),
      para([{text:'Tibial dyschondroplasia in post-mortems: ', bold:true},{text:"Pull your nutritionist in and look at the calcium-to-phosphorus ratio and the Vitamin D3 number. Also check the feed for mycotoxin contamination, that is a known cause too [21]."}]),
      para([{text:'Hot, swollen joints in several birds: ', bold:true},{text:"Septic arthritis. Send two or three fresh birds to your vet before it gets through the barn."}]),
      ...embedImage('fig3', 'Figure 3. Bristol Gait Scoring Scale. Score 0: normal fluid movement; Score 3: marked impairment, reluctant to walk; Score 5: unable to walk, requires immediate action. Adapted from Kestin et al. (1992).'),
      ...embedImage('ph4', 'Photo 4. A commercial broiler with significant leg impairment, consistent with Gait Score 3-4. The bird is resting on its hocks and unable to maintain normal standing posture, indicating pain and inability to access feed and water reliably. Source: Glass Walls Project (Israel), CC BY-SA 4.0.'),
      ...embedImage('ph5', 'Photo 5. Splay-legged broilers, Gait Score 4-5. These birds cannot walk normally and are unable to reach feed and water. This level of impairment requires immediate humane euthanasia. Rapid growth genetics combined with poor flooring and lighting programs are primary risk factors. Source: Glass Walls Project (Israel) / Wikimedia Commons, CC BY-SA 4.0.'),
    ],
  };
}

// ============================================================
// A: ACTIVITY
// ============================================================
function buildActivitySection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('A: Activity'),
      h2('What Are We Looking At?'),
      para("Activity is reading the flock as a whole instead of one bird at a time. Where are they sitting. What are they doing right now. How close can you get before they move. There is no fancy equipment, just two minutes of standing still and looking."),
      para("Distribution gets scored 1 to 3. A 1 is birds spread out everywhere, 2 is some uneven patches, 3 is clear clumps with bare floor between them. A flock that is content and comfortable is everywhere. The minute you see a big bare patch, something is pushing them off it. Cold spot, draft, light glare, leak. Find it before you assume the birds are wrong."),
      h2('Why It Matters to Your Operation'),
      para("Activity is the first thing that changes when something is going wrong, before mortality, before weight, before any of the numbers you check on the report. Birds usually back off feed 24 to 48 hours before a disease shows clinically [32]. Most experienced farmers can feel that something is off long before they can put a name on it. T-FLAWS just gives that gut feeling a number you can record and compare from week to week [12]."),
      h2('How to Do the Assessment'),
      para("Before you open the door, stop and listen for thirty seconds. A relaxed flock has a low, steady chatter. Silence is bad. Distressed noise is bad. Piling at the door is bad. You already have information before you walk in."),
      para("When you go in, stand still inside the door for two minutes. Score distribution from there, before the birds react to you. Then walk down the centre aisle slowly. The target is birds moving away from you only when you are within a metre. If they scatter from three metres or more, the catching crew is going to fight them at depop [16]."),
      para("Last thing, count what 100 birds in front of you are doing right now. Feeding, drinking, resting, anything else. Do it twice with a minute in between. That is your behaviour score."),
      h2('What to Do When Activity Looks Wrong'),
      para([{text:'Birds piling on heaters or brooders: ', bold:true},{text:"The barn is cold somewhere. Walk it with a thermometer at 30 cm off the floor across the whole width. You want every reading inside a 2°C band."}]),
      para([{text:'Birds crowded in the middle, walls empty: ', bold:true},{text:"Usually a draft or hot spot at the wall. Check side curtain seals. Check if the wall heaters are still running when they should not be."}]),
      para([{text:'More than 70% sitting during the light period: ', bold:true},{text:"Too many. Birds sit because they are sore, sick, or breathing bad air. Test ammonia at nose height first. Above 10 ppm, open up ventilation now. CO2 above 3,000 ppm is over the regulatory ceiling [15] and birds back off feed at that level."}]),
      para([{text:'Birds scattering hard when you walk in (over 2 m): ', bold:true},{text:"They are not used to people. Spend more time in the barn quietly. Five minutes of just walking calmly every day pays back at catch [16]."}]),
      para([{text:'Sudden pile against a wall: ', bold:true},{text:"Panic. Light failed, a loud noise spooked them, or something got into the barn. Check the lights and the perimeter immediately."}]),
      ...embedImage('fig4', 'Figure 4. Flock Distribution Patterns. Left: birds spread evenly, healthy environment. Right: clustering with bare floor areas, indicating a temperature, air quality, or light gradient problem.'),
      ...embedImage('ph7', 'Photo 6. Inside a commercial broiler house. Observe how birds are distributed across the floor and the litter condition. Even distribution with active birds is a sign of a well-managed environment. Source: USDA, Public Domain.'),
      ...embedImage('ph8', 'Photo 7. Commercial broiler flock on litter. When assessing Activity, look for any large empty floor areas or tight clustering, both are warning signs. A healthy flock shows birds spread across the available space.'),
    ],
  };
}

// ============================================================
// W: WEIGHT
// ============================================================
function buildWeightSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('W: Weight'),
      h2('What Are We Looking At?'),
      para("Two numbers. The average, which tells you whether the flock is on the breed curve. And the spread, which tells you whether the flock is uniform. The spread is your coefficient of variation, CV%, just the standard deviation divided by the mean and multiplied by 100. Broilers should be under 10% at every weigh [1,9]. Layer pullets coming up to point of lay should be under 8% [19]. A CV that drifts up is the first sign that something is hitting one part of the barn harder than the other."),
      para("At Day 1 the number that matters is crop fill. Pick up a chick, put a finger on the crop. It should feel like a small, firm balloon. Empty crop means the chick has not found feed or water, and you have about 24 hours to fix that before it falls behind for good."),
      h2('Why It Matters to Your Operation'),
      para("Weight is the number your contract is built on. If you fall a couple of days behind the breed curve early, you almost never catch up [1]. A wide CV at harvest means a mix of small and large carcasses, and processors penalise that because it slows the cut-up line."),
      para("In layers, poor uniformity at point of lay is one of the most common reasons for a flat peak. If half the flock is ready to lay and the other half is not, you never get a clean peak production number, you just get a wide soft hump [19]."),
      h2('How to Do the Assessment'),
      para("Weigh 100 birds per barn, pulled from at least five spots across the floor. Birds near the door are not the same as birds at the back wall, and weighing only the easy ones will lie to you. Calculate average, standard deviation, and CV. Compare average to the breed curve [1,9]. Do this every week from Day 7 on."),
      para("For crop fill, palpate 50 chicks 24 hours after placement. The target is 95% of them with full crops. If you are under that, the placement was bad and you need to figure out why before tomorrow."),
      h2('What to Do When Numbers Are Off'),
      para([{text:'Average more than 10% below breed standard: ', bold:true},{text:"Check the scale first. You would be surprised how often a calibration is the answer. Then go through the list. Is feed actually arriving on time. Are drinker flow rates within spec. Is the air quality acceptable. Is there a low-grade disease in the barn no one has named yet. Work the list, do not jump to a conclusion."}]),
      para([{text:'CV above 12%: ', bold:true},{text:"You have winners and losers in the same barn. Walk the floor and look for a pattern. If the small birds are all in one corner, that corner has a problem, a slow drinker line, a cold spot, a feeder pan that does not fill. Every bird needs a feeder within 3 metres."}]),
      para([{text:'Two peaks on the weight chart (bimodal): ', bold:true},{text:"That is two populations sharing the barn. Usually a dominance problem, the bigger birds keeping the smaller ones off the feed. Look for bullying, look for resource bottlenecks, look for floor-level gradients."}]),
      para([{text:'Poor crop fill at 24 hours: ', bold:true},{text:"Brooding temperature first. It should be 25 to 30°C at chick level, not at the controller. Then put feed directly in front of the chicks on paper or trays, and verify that the drinkers are actually flowing. Cold chicks do not eat."}]),
      para([{text:'Growth lag flock after flock: ', bold:true},{text:"This is a feed problem, not a barn problem. Get your nutritionist out to look at energy density, amino acid balance, and feed digestibility before you change anything else in the barn."}]),
      ...embedImage('fig5', 'Figure 5. Body Weight Distribution: Uniform Flock (CV below 10%, narrow bell curve) vs. Non-Uniform Flock (CV above 15%, wide flat distribution). Adapted from Aviagen Ross 308 Performance Objectives.'),
    ],
  };
}

// ============================================================
// S: SKIN
// ============================================================
function buildSkinSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('S: Skin'),
      h2('What Are We Looking At?'),
      para("Skin is the rest of the bird, beyond the feet and hocks. Flip the bird onto its back and look at the breast, the belly, and the thighs. Five things to look for, in order of how much they cost you:"),
      para([{text:'Cellulitis: ', bold:true},{text:"A yellow or greenish patch of firm tissue under the skin, usually on the thigh or low belly. It is stuck to the muscle underneath. The bird gets condemned for it at the plant, the whole carcass, no salvage [14]."}]),
      para([{text:'Breast blister (sternal bursitis): ', bold:true},{text:"A soft swelling right over the keel bone. Sometimes a small bump, sometimes a fluid-filled sac the size of a golf ball. It comes from birds sitting on the keel too much, which means lameness or wet litter underneath them."}]),
      para([{text:'Ammonia burn: ', bold:true},{text:"A red, irritated patch on the breast and belly skin. Chemical burn from lying on wet, ammonia-soaked litter. If you are seeing it, your birds have been lying down too long on bad bedding."}]),
      para([{text:'Skin colour: ', bold:true},{text:"Pale means anaemia or bleeding. Blue (cyanosis) means the bird is not getting enough oxygen, look for ascites or a respiratory problem. Yellow (jaundice) means the liver is in trouble [22]."}]),
      para([{text:'Scratches and tears: ', bold:true},{text:"Small cuts in the barn become big cellulitis at the plant. Every cut is a doorway [14]."}]),
      h2('Why It Matters to Your Operation'),
      para("Cellulitis is the number one reason whole carcasses get condemned at Canadian broiler plants [14]. A small spot might get trimmed, but anything bigger and the whole bird is gone. That is 100% loss on that bird, not a partial."),
      para("The thing about cellulitis is that it almost always starts with a wound the catching crew gave the bird, or a sharp edge in your barn, or a peck. So your cellulitis rate is really a report card on your handling, your equipment, and your biosecurity. When the rate goes up, something changed in how birds are being treated."),
      h2('How to Do the Assessment'),
      para("Do this while you are weighing or handling birds. Flip the bird, look at the breast, belly, and thighs in good light. For a breast blister, press lightly over the keel. Healthy tissue is firm. A blister moves under your finger. Score blisters as absent, small (under 2 cm), or large (over 2 cm)."),
      para("For colour, compare bird to bird in the same light. In layers and breeders also check the comb and wattles, pale means anaemia, dark or black means a circulation problem."),
      para("The single most useful skin data you will ever get is your processor condemnation report. Pull it after every kill. The cellulitis number, broken down by category, tells you everything the in-barn assessment cannot."),
      h2('What to Do When You See Skin Problems'),
      para([{text:'Cellulitis rate rising: ', bold:true},{text:"Start with the catching crew. How are they grabbing birds, are wing grabs happening, are crates being overfilled, are birds being dragged. Then walk the barn looking for anything sharp, broken slats, exposed wire ends, raw feeder rims. Last, review your "},{text:"E. coli",italics:true},{text:" program. Poulvac E. coli (Zoetis, licensed in Canada) used at the right age cuts cellulitis rates noticeably [29]."}]),
      para([{text:'Breast blisters above 5%: ', bold:true},{text:"Lame birds are lying down too much. Fix the lameness first, the blisters will follow. Then look at litter, soft and dry is forgiving on the breast, hard and caked is not. In breeders, count whether birds are actually using the perches you put in."}]),
      para([{text:'Ammonia burn on the belly: ', bold:true},{text:"Your litter is above 35% moisture and ammonia is above 25 ppm [23]. This is a ventilation emergency. It is not just a welfare problem, you are losing condemnation revenue every day this continues."}]),
      para([{text:'Cyanosis or jaundice in more than a couple of birds: ', bold:true},{text:"Same-day call to your vet. Bag two or three fresh dead birds, chill them, get them off to post-mortem before the weekend."}]),
      ...embedImage('fig6', 'Figure 6. Key Skin Conditions in Commercial Broiler Production. A: Cellulitis, fibrinous plaque, total condemnation. B: Breast blister over keel bone. C: Ammonia burn on ventral skin. Sources: Opengart; Elfadil et al. (1996).'),
      ...embedImage('ph9', 'Photo 8. Bumblefoot (pododermatitis) in a rooster, showing advanced bacterial skin infection with the characteristic raised scab and surrounding tissue inflammation. In commercial broilers, any open skin wound is a potential entry point for Escherichia coli and Staphylococcus aureus, leading to cellulitis and carcass condemnation. Source: Sylvain Larrat / Wikimedia Commons, CC BY 4.0.'),
      ...embedImage('ph10', 'Photo 9. Chickens showing cyanosis, blue-purple skin discoloration, indicating severely reduced oxygen delivery. In commercial flocks, cyanosis points to ascites (Pulmonary Hypertension Syndrome), respiratory disease, or acute ventilation failure. Multiple cyanotic birds is a same-day veterinary emergency. Source: Otwarte Klatki (Open Cages) / Wikimedia Commons, CC BY 2.0.'),
    ],
  };
}

// ============================================================
// WHERE TO KEEP LEARNING
// ============================================================
function buildResourcesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('Where to Keep Learning'),
      para("If you want to go deeper on any of this, the list below is where the science actually lives. You do not need a university account for most of it. A lot of these journals have open-access articles you can read for free, and the provincial ag extension services in Canada usually post plain-language summaries of the important papers. Bookmark a couple, check them once a month."),
      h2('Key Scientific Journals'),
      para([{text:'Poultry Science.', bold:true, italics:true},{text:' Oxford University Press / Poultry Science Association. All aspects of poultry production, health, nutrition, genetics, and processing. ISSN: 0032-5791'}]),
      para([{text:'Avian Diseases.', bold:true, italics:true},{text:' American Association of Avian Pathologists (AAAP). Avian diseases, diagnostic pathology, infectious disease, and immunology. ISSN: 0005-2086'}]),
      para([{text:"World's Poultry Science Journal.", bold:true, italics:true},{text:" Taylor & Francis / World's Poultry Science Association. International poultry science, production, nutrition, genetics, health, and welfare. ISSN: 0043-9339"}]),
      para([{text:'British Poultry Science.', bold:true, italics:true},{text:' Taylor & Francis. European poultry production systems, genetics, nutrition, and welfare. ISSN: 0007-1668'}]),
      para([{text:'Journal of Applied Poultry Research.', bold:true, italics:true},{text:' Oxford University Press / Poultry Science Association. Applied commercial poultry production, management, environment, and processing. ISSN: 1056-6171'}]),
      para([{text:'Avian Pathology.', bold:true, italics:true},{text:' Taylor & Francis. Avian diseases, diagnostics, pathology, and immunology. ISSN: 0307-9457'}]),
      para([{text:'Animal Welfare.', bold:true, italics:true},{text:' UFAW. Animal welfare science, policy, and practice across all species including poultry. ISSN: 0962-7286'}]),
      para([{text:'Applied Animal Behaviour Science.', bold:true, italics:true},{text:' Elsevier. Animal behavior of domestic and laboratory animals, with strong poultry welfare coverage. ISSN: 0168-1591'}]),
      para([{text:'Canadian Veterinary Journal.', bold:true, italics:true},{text:' CVMA. Clinical and research articles relevant to veterinary practice in Canada. ISSN: 0008-5286'}]),
      para([{text:'Veterinary Record.', bold:true, italics:true},{text:' BMJ / BVA. Clinical findings, case reports, and research across all species. ISSN: 0042-4900'}]),
      h2('Key Institutional Resources'),
      bullet('National Farm Animal Care Council (NFACC), Codes of Practice: www.nfacc.ca'),
      bullet('Canadian Food Inspection Agency (CFIA), Meat Hygiene and Animal Welfare: www.inspection.gc.ca'),
      bullet('Aviagen Technical Resources, Ross Breed Manuals: www.aviagen.com'),
      bullet('Cobb-Vantress Technical Resources, Cobb Breed Manuals: www.cobb-vantress.com'),
      bullet('Lohmann Tierzucht, Layer Breed Guides: www.lohmann-tierzucht.com'),
      bullet('Merck Veterinary Manual, Poultry Section: www.merckvetmanual.com/poultry'),
      bullet('Welfare Quality® Assessment Protocols: www.welfarequalitynetwork.net'),
      bullet('Canadian Poultry Consultant Learning Centre: www.canadianpoultry.ca/learning-centre/'),
    ],
  };
}

// ============================================================
// REFERENCES
// ============================================================
function buildReferencesSection() {
  const refs = [
    '1. Aviagen. (2022). Ross 308 broiler: Performance objectives. Aviagen Group.',
    '2. Aviagen. (2022). Ross broiler management handbook. Aviagen Group.',
    '3. Aviagen. (2022). Ross broiler: Environmental management supplement. Aviagen Group.',
    '4. Bilcik, B., & Keeling, L. J. (1999). Changes in feather condition in relation to feather pecking and aggressive behaviour in laying hens. British Poultry Science, 40(4), 444-451.',
    '5. Canadian Food Inspection Agency. (2019). Meat hygiene manual of procedures: Chapter 17. Government of Canada.',
    '6. Canadian Food Inspection Agency. (2022). Codes of practice for the care and handling of chickens, turkeys and breeders from hatch to slaughter. Government of Canada.',
    '7. Canadian Veterinary Medical Association. (2020). CVMA position statement on farm animal welfare. CVMA.',
    '8. CEVA Animal Health. (2020). Poultry feather condition scoring guide. CEVA Sante Animale.',
    '9. Cobb-Vantress. (2021). Cobb 500 broiler performance and nutrition supplement. Cobb-Vantress Inc.',
    '10. Cobb-Vantress. (2021). Cobb broiler management guide. Cobb-Vantress Inc.',
    '11. Decina, C., Berke, O., van Staaveren, N., Baes, C., Widowski, T., & Harlander-Matauschek, A. (2019). Evidence for a relationship between feather pecking and feather cover scores in laying hen flocks. Poultry Science, 98(1), 439-444. https://doi.org/10.3382/ps/pey329',
    '12. Dawkins, M. S., Donnelly, C. A., & Jones, T. A. (2004). Chicken welfare is influenced more by housing conditions than by stocking density. Nature, 427(6972), 342-344.',
    '13. Ekstrand, C., Algers, B., & Svedberg, J. (1997). Rearing conditions and foot-pad dermatitis in Swedish broiler chickens. Preventive Veterinary Medicine, 31(3-4), 167-174.',
    '14. Elfadil, A. A., Vaillancourt, J. P., & Meek, A. H. (1996). Description of cellulitis lesions and associations between cellulitis and other indicators of health in broiler chickens. Avian Diseases, 40(3), 677-688.',
    '15. European Food Safety Authority. (2012). Scientific opinion on the use of animal-based measures to assess welfare of broilers. EFSA Journal, 10(7), 2774. https://doi.org/10.2903/j.efsa.2012.2774',
    '16. Jones, R. B. (1996). Fear and adaptability in poultry: Insights, implications and imperatives. World\'s Poultry Science Journal, 52(2), 131-174.',
    '17. Kestin, S. C., Knowles, T. G., Tinch, A. E., & Gregory, N. G. (1992). Prevalence of leg weakness in broiler chickens and its relationship with genotype. Veterinary Record, 131(9), 190-194.',
    '18. Knowles, T. G., Kestin, S. C., Haslam, S. M., Brown, S. N., Green, L. E., Butterworth, A., Pope, S. J., Pfeiffer, D., & Nicol, C. J. (2008). Leg disorders in broiler chickens: Prevalence, risk factors and prevention. PLoS ONE, 3(2), e1545.',
    '19. Lohmann Tierzucht. (2021). Lohmann LSL-Classic management guide. Lohmann Tierzucht GmbH.',
    '20. Merck Veterinary Manual. (2022). Footpad dermatitis in poultry. Merck & Co., Inc.',
    '21. Merck Veterinary Manual. (2022). Lameness in poultry. Merck & Co., Inc.',
    '22. Merck Veterinary Manual. (2022). Skin disorders in poultry. Merck & Co., Inc.',
    '23. National Farm Animal Care Council. (2016). Code of practice for the care and handling of hatching eggs, breeders, chickens and turkeys. NFACC.',
    '24. Opengart, K. (2008). Necrotic dermatitis. In Y. M. Saif et al. (Eds.), Diseases of poultry (12th ed., pp. 1092-1095). Blackwell Publishing.',
    '25. Riber, A. B., van de Weerd, H. A., de Jong, I. C., & Steenfeldt, S. (2018). Review of environmental enrichment for broiler chickens. Poultry Science, 97(2), 378-396.',
    '26. Shepherd, E. M., & Fairchild, B. D. (2010). Footpad dermatitis in poultry. Poultry Science, 89(10), 2043-2051.',
    '27. Kittelsen, K. E., Granquist, E. G., Kolbjornsen, O., Nafstad, O., & Moe, R. O. (2015). A comparison of post-mortem findings in broilers dead-on-farm and dead-on-arrival at the abattoir. Poultry Science, 94(10), 2417-2422.',
    '28. Welfare Quality®. (2009). Welfare Quality assessment protocol for poultry. Welfare Quality Consortium.',
    '29. Zoetis. (2021). Poulvac E. coli: Product monograph. Zoetis Canada Inc.',
    '30. Zuidhof, M. J., Schneider, B. L., Carney, V. L., Korver, D. R., & Robinson, F. E. (2014). Growth, efficiency, and yield of commercial broilers from 1957, 1978, and 2005. Poultry Science, 93(12), 2970-2982.',
    '31. van Krimpen, M. M., Binnendijk, G. P., van den Anker, I., Heetkamp, M. J. W., Kwakkel, R. P., & van den Brand, H. (2014). Effects of ambient temperature, feather cover, and housing system on energy partitioning and performance in laying hens. Journal of Animal Science, 92(11), 5019-5031. https://doi.org/10.2527/jas.2014-7627',
    '32. Elbers, A. R. W., & Gonzales, J. L. (2021). Mortality levels and production indicators for suspicion of highly pathogenic avian influenza virus infection in commercially farmed ducks. Pathogens, 10(11), 1498. https://doi.org/10.3390/pathogens10111498',
  ];

  return {
    properties: { page: { margin: pageMargin } },
    headers:    { default: buildHeader() },
    footers:    { default: buildFooter() },
    children: [
      h1('References'),
      ...refs.map(r => para(r, { spaceAfter: 80 })),
    ],
  };
}

// ============================================================
// ASSEMBLE & WRITE DOCUMENT
// ============================================================
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          {
            level: 0,
            format: 'bullet',
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } },
          },
          {
            level: 1,
            format: 'bullet',
            text: '◦',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(1.0), hanging: convertInchesToTwip(0.25) } } },
          },
        ],
      },
    ],
  },
  sections: [
    buildCoverSection(),
    buildTocSection(),
    buildIntroSection(),
    buildToesSection(),
    buildFeathersSection(),
    buildLegsSection(),
    buildActivitySection(),
    buildWeightSection(),
    buildSkinSection(),
    buildResourcesSection(),
    buildReferencesSection(),
  ],
});

// Write to disk
const buf = await Packer.toBuffer(doc);
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, buf);

// ============================================================
// POST-BUILD PATCH — inject cached TOC entries
// Each Heading-1 / Heading-2 in the document gets a pre-rendered
// row with an estimated page number, so the TOC displays correctly
// the moment the file opens (before any field update).
// Also injects updateFields=true so Word does not prompt.
// ============================================================
{
  const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));
  let docXml = await outZip.file('word/document.xml').async('string');

  // Estimated page numbers (1-indexed; Word starts at 1 on cover).
  // Cover = 1, TOC = 2, content begins at 3.
  const tocEntries = [
    { lvl: 1, text: 'Introduction to T-FLAWS',  page: 3  },
    { lvl: 2, text: 'What This Guide Is For',   page: 3  },
    { lvl: 2, text: 'When to Do Your Assessments', page: 3 },
    { lvl: 1, text: 'T: Toes',                  page: 4  },
    { lvl: 2, text: 'What Are We Looking At?',  page: 4  },
    { lvl: 2, text: 'Why It Matters to Your Operation', page: 4 },
    { lvl: 2, text: 'How to Do the Assessment', page: 4  },
    { lvl: 2, text: 'What to Do When Scores Are High', page: 4 },
    { lvl: 1, text: 'F: Feathers',              page: 7  },
    { lvl: 2, text: 'What Are We Looking At?',  page: 7  },
    { lvl: 2, text: 'Why It Matters to Your Operation', page: 7 },
    { lvl: 2, text: 'How to Do the Assessment', page: 7  },
    { lvl: 2, text: 'What to Do When You See Feather Loss', page: 7 },
    { lvl: 1, text: 'L: Legs',                  page: 9  },
    { lvl: 2, text: 'What Are We Looking At?',  page: 9  },
    { lvl: 2, text: 'Why It Matters to Your Operation', page: 9 },
    { lvl: 2, text: 'How to Do the Assessment', page: 10 },
    { lvl: 2, text: 'What to Do When Scores Are High', page: 10 },
    { lvl: 1, text: 'A: Activity',              page: 12 },
    { lvl: 2, text: 'What Are We Looking At?',  page: 12 },
    { lvl: 2, text: 'Why It Matters to Your Operation', page: 12 },
    { lvl: 2, text: 'How to Do the Assessment', page: 12 },
    { lvl: 2, text: 'What to Do When Activity Looks Wrong', page: 12 },
    { lvl: 1, text: 'W: Weight',                page: 15 },
    { lvl: 2, text: 'What Are We Looking At?',  page: 15 },
    { lvl: 2, text: 'Why It Matters to Your Operation', page: 15 },
    { lvl: 2, text: 'How to Do the Assessment', page: 15 },
    { lvl: 2, text: 'What to Do When Numbers Are Off', page: 15 },
    { lvl: 1, text: 'S: Skin',                  page: 17 },
    { lvl: 2, text: 'What Are We Looking At?',  page: 17 },
    { lvl: 2, text: 'Why It Matters to Your Operation', page: 17 },
    { lvl: 2, text: 'How to Do the Assessment', page: 17 },
    { lvl: 2, text: 'What to Do When You See Skin Problems', page: 17 },
    { lvl: 1, text: 'Where to Keep Learning',   page: 20 },
    { lvl: 2, text: 'Key Scientific Journals',  page: 20 },
    { lvl: 2, text: 'Key Institutional Resources', page: 20 },
    { lvl: 1, text: 'References',               page: 22 },
  ];

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Assign each TOC entry a unique anchor name. These match bookmarks we
  // inject around the matching heading paragraphs below, so Ctrl+click on
  // a TOC row jumps to the heading like in Word's native TOC.
  const entriesWithAnchor = tocEntries.map((e, i) => ({
    ...e,
    anchor: `_Toc${String(100000 + i).padStart(8, '0')}`,
  }));

  function tocRow(e) {
    const styleName  = e.lvl === 1 ? 'TOC1' : 'TOC2';
    const indent     = e.lvl === 1 ? 0 : 220;
    const titleSize  = 22;
    const text       = escapeXml(e.text);
    return (
      '<w:p>' +
        '<w:pPr>' +
          `<w:pStyle w:val="${styleName}"/>` +
          `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>` +
          `<w:spacing w:after="60"/>` +
          (indent ? `<w:ind w:left="${indent}"/>` : '') +
        '</w:pPr>' +
        `<w:hyperlink w:anchor="${e.anchor}" w:history="1">` +
          `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="${titleSize}"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>` +
          `<w:r><w:tab/></w:r>` +
          `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="${titleSize}"/></w:rPr><w:t>${e.page}</w:t></w:r>` +
        '</w:hyperlink>' +
      '</w:p>'
    );
  }

  const cachedRows = entriesWithAnchor.map(tocRow).join('');

  // Replace the empty SDT content the docx library produced with cached entries.
  // The library generates: <w:sdt><w:sdtPr>...</w:sdtPr><w:sdtContent>...</w:sdtContent></w:sdt>
  // containing only the begin/separate/end fldChar pair. We swap in cached rows
  // BEFORE the end fldChar so the TOC renders immediately.
  //
  // CRITICAL: also strip w:dirty="true" from the begin fldChar. If the field is
  // marked dirty Word treats it as needing update on open and shows the
  // "fields may refer to other files" prompt every time, even with
  // updateFields=true in settings.xml.
  const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
  if (sdtMatch) {
    let sdt = sdtMatch[0];
    // Strip dirty flag from any fldChar in the SDT
    sdt = sdt.replace(/\sw:dirty="true"/g, '');
    // Inject cached rows between <separate/> and the end paragraph.
    sdt = sdt.replace(
      /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
      `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`
    );
    docXml = docXml.replace(sdtMatch[0], sdt);
    // Belt-and-braces: strip w:dirty anywhere else in document body
    docXml = docXml.replace(/\sw:dirty="true"/g, '');
  }

  // ---- Inject bookmarks around heading paragraphs so the TOC hyperlinks work ----
  // Walk every Heading1/Heading2 paragraph in document order, and if the next
  // unmatched TOC entry has the same level + text, wrap the paragraph with
  // bookmarkStart/bookmarkEnd carrying the entry's anchor name.
  {
    let entryIdx = 0;
    let bookmarkId = 1000;
    const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    docXml = docXml.replace(headingRegex, (match, lvlStr) => {
      if (entryIdx >= entriesWithAnchor.length) return match;
      const lvl = Number(lvlStr);
      // Concatenate every <w:t>...</w:t> run inside this paragraph
      const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
      const heading = textRuns.trim();
      const entry = entriesWithAnchor[entryIdx];
      if (lvl !== entry.lvl) return match;
      if (heading !== entry.text.trim()) return match;
      entryIdx++;
      const id = bookmarkId++;
      return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
    });
    if (entryIdx !== entriesWithAnchor.length) {
      console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
    }
    outZip.file('word/document.xml', docXml);
  }

  // Patch settings.xml: do NOT auto-update fields on open.
  // updateFields=true told Word to refresh fields, which re-triggers the
  // "fields may refer to other files" dialog. With cached entries already
  // present and dirty flags stripped, Word should leave the TOC alone.
  let settings = await outZip.file('word/settings.xml').async('string');
  // Remove any prior updateFields setting we injected in earlier runs
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!/<w:updateFields/.test(settings)) {
    settings = settings.replace(
      '<w:displayBackgroundShape/>',
      '<w:displayBackgroundShape/><w:updateFields w:val="false"/>'
    );
  }
  outZip.file('word/settings.xml', settings);

  // Ensure TOC styles exist so the cached rows render with proper indent/leader dots
  let stylesXml = await outZip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    const tocStyles =
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
    stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
    outZip.file('word/styles.xml', stylesXml);
  }

  // XML validation: ensure no bare ampersands
  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in document.xml (${bad.length} found)`);

  const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, patched);
  console.log(`Written: ${OUT_FILE}`);
  console.log(`Size: ${(patched.length / 1024).toFixed(1)} KB`);
  console.log(`TOC entries cached: ${tocEntries.length}`);
}
