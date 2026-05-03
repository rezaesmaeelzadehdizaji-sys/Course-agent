// ============================================================
// generate-course3-tflaws.mjs  -  Course 3: T-FLAWS Assessment Management Tool
// CPC Short Courses — May 2026 rebuild
// T-FLAWS: Temperature, Feed, Light, Air, Water, Sanitation & Space
// Developed by CPC Learning Centre (Mike and Dr. Stew)
// Run: node generate-course3-tflaws.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
  Header, Footer, HeadingLevel, TableOfContents, BorderStyle,
  convertInchesToTwip, ImageRun, PageNumber, Table, TableRow,
  TableCell, WidthType, ShadingType,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const C3       = path.join(__dirname, 'Course 3');
const C4       = path.join(__dirname, 'Course 4');
const C7       = path.join(__dirname, 'Course 7');
const OUT_FILE = path.join(C3, 'T-FLAWS_Assessment_Management_Tool_draft.docx');

// ── Logo ─────────────────────────────────────────────────────
const LOGO_PATH = path.join(__dirname, 'logo.png');
const logoBuf   = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

// ── Load images ───────────────────────────────────────────────
function loadImg(p) { return fs.existsSync(p) ? fs.readFileSync(p) : null; }

const IMG = {
  farm:     loadImg(path.join(C3, 'Broiler farm.png')),          // cover / intro
  house:    loadImg(path.join(C3, 'broiler_house.jpg')),          // A: Air  barn interior
  flock4:   loadImg(path.join(C4, 'early_disease_detection_flock.png')), // F: Feed flock
  biosec:   loadImg(path.join(C4, 'biosecurity_door_closed_chicks.png')), // S: Sanitation
  digital:  loadImg(path.join(C7, 'Digital flock management.png')),       // System section
};

// helper: read PNG dimensions
function pngDim(buf) {
  try {
    const v = new DataView(buf.buffer, buf.byteOffset);
    return { w: v.getUint32(16, false), h: v.getUint32(20, false) };
  } catch (_) { return { w: 1, h: 1 }; }
}

// ── Colours ───────────────────────────────────────────────────
const DKBLUE = '1F3864';
const BLUE   = '2E74B5';
const GOLD   = 'C9A84C';
const GRAY   = '595959';
const LGRAY  = '888888';
const BODY   = '3C3C3C';

// ── Page margins ──────────────────────────────────────────────
const margin = {
  top:    convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left:   convertInchesToTwip(1.25),
  right:  convertInchesToTwip(1.25),
};

// ── Typography helpers ────────────────────────────────────────
const run = (text, opts = {}) => new TextRun({
  text,
  font:    opts.font    ?? 'Calibri',
  size:    opts.size    ?? 24,
  bold:    opts.bold    ?? false,
  italics: opts.italics ?? false,
  color:   opts.color   ?? BODY,
  ...opts,
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 160 },
  children: [run(text, { size: 28, bold: true, color: BLUE })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 120 },
  children: [run(text, { size: 24, bold: true, color: BLUE })],
});

const p = (children, opts = {}) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing:   { before: 100, after: 140, line: 280 },
  children:  Array.isArray(children) ? children : [run(children, opts)],
});

const b = (text, lvl = 0) => new Paragraph({
  bullet:    { level: lvl },
  spacing:   { before: 60, after: 60, line: 276 },
  children:  Array.isArray(text) ? text : [run(text)],
});

// Side-bar callout with gold left border
const callout = (text) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing:   { before: 180, after: 180, line: 280 },
  indent:    { left: convertInchesToTwip(0.25), right: convertInchesToTwip(0.25) },
  border:    { left: { style: BorderStyle.THICK, size: 12, color: GOLD, space: 8 } },
  children:  Array.isArray(text) ? text : [run(text, { italics: true, color: GRAY })],
});

// Inline bold label followed by body text
const labeled = (label, body) => p([
  run(label + ' ', { bold: true }),
  run(body),
]);

// Image + caption helper
function imgBlock(buf, type, widthIn, caption) {
  if (!buf) {
    return [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80 },
        rows: [new TableRow({ children: [new TableCell({
          borders: {
            top:    { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' },
            left:   { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' },
            right:  { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' },
          },
          shading: { type: ShadingType.SOLID, color: 'F5F5F5' },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing:   { before: 700, after: 700 },
            children:  [run('[Image placeholder - to be supplied by CPC team]', { color: '999999', italics: true })],
          })],
        })]})],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing:   { before: 60, after: 200 },
        children:  [run(caption, { italics: true, size: 20, color: LGRAY })],
      }),
    ];
  }
  const dpi    = 96;
  const wpx    = Math.round(widthIn * dpi);
  let   hpx    = Math.round(wpx * 0.6);
  if (type === 'png') {
    const dim = pngDim(buf);
    if (dim.w > 0) hpx = Math.round(wpx * dim.h / dim.w);
  } else if (type === 'jpg') {
    // Try reading JPEG dimensions from EXIF/SOF markers
    try {
      let i = 2;
      while (i < buf.length - 4) {
        if (buf[i] === 0xFF && buf[i+1] >= 0xC0 && buf[i+1] <= 0xC3) {
          const h = (buf[i+5] << 8) | buf[i+6];
          const w = (buf[i+7] << 8) | buf[i+8];
          if (w > 0) hpx = Math.round(wpx * h / w);
          break;
        }
        i += 2 + ((buf[i+2] << 8) | buf[i+3]);
      }
    } catch (_) {}
  }
  const irType = type === 'jpg' ? 'jpg' : 'png';
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { before: 180, after: 60 },
      children:  [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: irType })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { before: 60, after: 200 },
      children:  [run(caption, { italics: true, size: 20, color: LGRAY })],
    }),
  ];
}

const pb = () => new Paragraph({ children: [new PageBreak()] });

// ── Header / Footer ───────────────────────────────────────────
const hdr = () => new Header({ children: [new Paragraph({
  alignment: AlignmentType.RIGHT,
  border:    { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  children: [
    run('CPC Short Courses  |  ', { size: 18, color: LGRAY }),
    run('T-FLAWS Assessment Management Tool', { size: 18, bold: true, color: BLUE }),
  ],
})]});

const ftr = () => new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  border:    { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  children: [
    run('CPC Short Courses  |  Course 3  |  Page ', { size: 18, color: LGRAY }),
    new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: LGRAY }),
    run(' of ', { size: 18, color: LGRAY }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: LGRAY }),
  ],
})]});

const blankHdr = new Header({ children: [new Paragraph({ children: [] })] });
const blankFtr = new Footer({ children: [new Paragraph({ children: [] })] });

// ── TOC entries ───────────────────────────────────────────────
const tocEntries = [
  { lvl: 1, text: 'Introduction to T-FLAWS', page: 3 },
  { lvl: 2, text: 'What Is T-FLAWS?', page: 3 },
  { lvl: 2, text: 'Who Is This Course For?', page: 3 },
  { lvl: 2, text: 'How to Use This Checklist', page: 4 },
  { lvl: 1, text: 'T: Temperature', page: 5 },
  { lvl: 2, text: 'Why Temperature Matters', page: 5 },
  { lvl: 2, text: 'Target Ranges by Bird Age', page: 5 },
  { lvl: 2, text: 'What Farmers See', page: 7 },
  { lvl: 2, text: 'What to Do', page: 8 },
  { lvl: 1, text: 'F: Feed', page: 9 },
  { lvl: 2, text: 'Why Feed Management Matters', page: 9 },
  { lvl: 2, text: 'What to Check', page: 9 },
  { lvl: 2, text: 'What Farmers See', page: 11 },
  { lvl: 2, text: 'What to Do', page: 11 },
  { lvl: 1, text: 'L: Light', page: 13 },
  { lvl: 2, text: 'Why Light Programs Matter', page: 13 },
  { lvl: 2, text: 'What to Check', page: 14 },
  { lvl: 2, text: 'What Farmers See', page: 14 },
  { lvl: 2, text: 'What to Do', page: 15 },
  { lvl: 1, text: 'A: Air', page: 16 },
  { lvl: 2, text: 'Why Ventilation Matters', page: 16 },
  { lvl: 2, text: 'Key Air Quality Indicators', page: 16 },
  { lvl: 2, text: 'What Farmers See', page: 18 },
  { lvl: 2, text: 'What to Do', page: 18 },
  { lvl: 1, text: 'W: Water', page: 20 },
  { lvl: 2, text: 'Why Water Matters', page: 20 },
  { lvl: 2, text: 'What to Check', page: 20 },
  { lvl: 2, text: 'What Farmers See', page: 22 },
  { lvl: 2, text: 'What to Do', page: 22 },
  { lvl: 1, text: 'S: Sanitation & Space', page: 24 },
  { lvl: 2, text: 'Litter Management', page: 24 },
  { lvl: 2, text: 'Stocking Density', page: 25 },
  { lvl: 2, text: 'What Farmers See', page: 26 },
  { lvl: 2, text: 'What to Do', page: 26 },
  { lvl: 1, text: 'Using T-FLAWS as a System', page: 27 },
  { lvl: 1, text: 'Where to Keep Learning', page: 28 },
  { lvl: 2, text: 'Key Scientific Journals', page: 28 },
  { lvl: 2, text: 'Key Institutional Resources', page: 28 },
  { lvl: 1, text: 'References', page: 29 },
];

const ea = tocEntries.map((e, i) => ({
  ...e,
  anchor: `_Toc${String(100000 + i).padStart(8, '0')}`,
}));

// ============================================================
// DOCUMENT
// ============================================================
const doc = new Document({
  creator: 'CPC Learning Centre',
  title:   'T-FLAWS Assessment Management Tool',
  sections: [

    // ── COVER ────────────────────────────────────────────────
    {
      properties: { titlePage: true, page: { margin } },
      headers: { first: blankHdr },
      footers: { first: blankFtr },
      children: [
        new Paragraph({ spacing: { before: 1800, after: 0 }, children: [run('')] }),

        // Course label
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 200 },
          children:  [run('COURSE 3: CPC SHORT COURSES', { size: 22, bold: true, color: BLUE })],
        }),

        // Logo
        ...(logoBuf ? [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 200, after: 200 },
          children:  [new ImageRun({ data: logoBuf, transformation: { width: 144, height: 144 }, type: 'png' })],
        })] : []),

        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 200, after: 200 },
          children:  [run('T-FLAWS Assessment Management Tool', {
            size: 56, bold: true, color: DKBLUE, font: 'Calibri Light',
          })],
        }),

        // Subtitle
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 600 },
          children:  [run('A Practical Barn Entry Checklist for Canadian Poultry Farmers', {
            size: 30, italics: true, color: BLUE,
          })],
        }),

        // Gold divider
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 400 },
          children:  [run('───────────────────────────────────', { color: BLUE, size: 22 })],
        }),

        // Metadata
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
          children: [run('CPC Short Courses', { bold: true, color: GRAY, size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
          children: [run('Duration: 2 hours', { color: GRAY, size: 22 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 800 },
          children: [run('May 2026', { color: GRAY, size: 22 })] }),

        // Disclaimer
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 0 },
          children:  [run(
            'This course has been developed for educational purposes for commercial poultry farmers in Canada. ' +
            'Content is drawn from the field experience of Canadian poultry consultants, peer-reviewed scientific ' +
            'literature, and industry management guides. This material does not replace the advice of a licensed ' +
            'veterinarian or regulatory authority.',
            { size: 18, italics: true, color: LGRAY },
          )],
        }),
        pb(),
      ],
    },

    // ── TOC ──────────────────────────────────────────────────
    {
      properties: { page: { margin } },
      headers: { default: hdr() },
      footers: { default: ftr() },
      children: [
        h1('Table of Contents'),
        new TableOfContents('Table of Contents', { headingStyleRange: '1-2' }),
        pb(),
      ],
    },

    // ── BODY ─────────────────────────────────────────────────
    {
      properties: { page: { margin } },
      headers: { default: hdr() },
      footers: { default: ftr() },
      children: [

        // ── INTRODUCTION ──────────────────────────────────
        h1('Introduction to T-FLAWS'),
        h2('What Is T-FLAWS?'),
        p('Every time you walk into a barn, you are making decisions. You can feel the air, hear the birds, and see how they are spread across the floor. T-FLAWS gives that walk a consistent structure so nothing gets missed.'),
        p([
          run('T-FLAWS stands for '),
          run('Temperature, Feed, Light, Air, Water, and Sanitation & Space', { bold: true }),
          run('. Six checkpoints. Six things that, when managed well every single day, give your birds the best possible environment to perform and stay healthy.'),
        ]),
        p('T-FLAWS is a barn-entry checklist developed by the CPC Learning Centre as a practical adaptation of the standard FLAWS management framework used across the poultry industry [9]. The addition of Temperature as a standalone first checkpoint reflects how critical thermal management is, particularly in the first week of a flock [1,11].'),
        callout('T-FLAWS is not a disease diagnostic tool. If birds are sick, call your veterinarian. T-FLAWS is what you check before that point. It is what keeps problems from developing in the first place.'),

        h2('Who Is This Course For?'),
        p('This course is for commercial poultry farmers, barn technicians, and farm staff managing broiler, layer, or breeder operations in Canada. The checklist applies across production types. Specific numbers and temperature targets cited in each section refer primarily to broiler production. If you manage layers or turkeys, use your breed management guide for species-specific targets alongside these principles.'),
        p('The six T-FLAWS checkpoints are equally valuable to:'),
        b('Farm owners and employees doing daily barn checks'),
        b('Veterinarians and service technicians visiting the farm'),
        b('New farmers building consistent observation habits from day one'),
        b('Experienced farmers standardizing their routines across multiple barns'),

        h2('How to Use This Checklist'),
        p('Work through T-FLAWS in sequence. Temperature is the first thing you check when you walk through the door. Sanitation and Space is the last scan before you leave. With practice, the full check takes ten to fifteen minutes per barn.'),
        p('Use it every day, on every visit. Record anything that is off and what you did about it. A written daily log gives you patterns over time, and patterns tell you where the next problem will come from before it arrives.'),

        ...imgBlock(IMG.farm, 'png', 5.8, 'Photo 1.1: A commercial broiler barn. T-FLAWS gives every barn visit a consistent six-point structure. Source: CPC Short Courses.'),

        pb(),

        // ── T: TEMPERATURE ────────────────────────────────
        h1('T: Temperature'),
        h2('Why Temperature Matters'),
        p('Temperature is the first thing you assess when you enter the barn, and it is also the most likely factor to be wrong at placement. A day-old chick cannot regulate its own body temperature. It depends entirely on the environment you provide [1].'),
        p('The consequences of getting temperature wrong in the first week are lasting. Cold chicks do not eat or drink properly. Their gut development falls behind, their immune system is compromised, and their seven-day weight, an important early performance milestone, will reflect the failure [1]. Research shows that while seven-day weight correlates with flock direction, measurements from week three onward are the more reliable predictors of final body weight — but by then the gap from a cold start has already compounded. A cold start is one of the most expensive mistakes in broiler production, and it is entirely preventable.'),
        p('The same applies at the other end. Heat stress later in the flock suppresses feed intake, elevates mortality, and cuts your feed conversion ratio [6]. Birds cannot tell you they are too hot. They show you.'),

        h2('Target Ranges by Bird Age'),
        p('The Ross Broiler Management Handbook recommends measuring temperature at chick level, not at ceiling sensor height. On cold nights or with cold floors, bird-level temperature can be 3 to 5 degrees Celsius lower than what your barn controller shows [1]. That gap costs you.'),
        p('Target temperatures at bird level for broilers [1]:'),
        b('Day 0 to 2:  32 to 34 degrees Celsius'),
        b('Day 3 to 7:  reduce by approximately 0.5 degrees every 2 to 3 days as birds feather in'),
        b('Week 2:  approximately 28 to 30 degrees Celsius'),
        b('Week 3:  approximately 24 to 27 degrees Celsius'),
        b('Week 4 and beyond:  18 to 22 degrees Celsius'),
        p('These targets are starting points, not fixed rules. Always look at what the birds are doing. Bird distribution across the barn floor is a more accurate real-time indicator than any sensor reading. Chicks that are comfortable will spread evenly across the heated area, eating and drinking actively.'),
        p('Pre-heat the barn at least 24 to 48 hours before placement, including the floor. Litter surface temperature at chick level should reach 30 degrees Celsius before the first bird arrives [1]. A warm air temperature over a cold floor is not adequate for day-olds.'),

        ...imgBlock(null, null, 5.8, 'Figure 1.1: Chick distribution patterns at correct temperature (even spread), too cold (huddling under heat source), and too hot (crowding to barn edges). Source: Aviagen Ross Broiler Management Handbook, 2025 [1].'),

        h2('What Farmers See'),
        labeled('Cold birds:', 'Chicks huddle tightly in a dense cluster under the heat source, often chirping loudly. They are not exploring, not eating, and not using the water. Early mortality will be elevated. If you see a pile of chicks, the temperature at bird level is too low.'),
        labeled('Heat stressed birds:', 'Birds pant with beaks open and wings held away from the body. They move away from the center of the barn and crowd near the walls or water lines. Feed intake drops. In older, heavier broilers, sudden heat stress can cause cardiac deaths.'),
        labeled('Well-distributed birds:', 'Evenly spread across the heated area, active, vocalizing normally, and visiting feeders and drinkers regularly. This is the target.'),
        callout('If more than 20 percent of your birds are clustered in one part of the barn during the first week, temperature, draft, or light distribution is the cause. Find it before you leave the barn.'),

        h2('What to Do'),
        b('Place a minimum-maximum thermometer at bird level in at least two locations per barn, not on the wall or near the ceiling'),
        b('Check the temperature gradient from the inlet end to the fan end and adjust fan speed or heat distribution accordingly'),
        b('If birds are cold: check for drafts at inlets, check heater output, and verify litter temperature with a surface thermometer'),
        b('If birds are heat stressed: increase ventilation rate first, then evaluate whether setpoint adjustments are needed'),
        b('Record temperature at every barn check alongside bird distribution observations'),
        b('Pre-warm the barn and litter at least 24 to 48 hours before every placement [1]'),

        pb(),

        // ── F: FEED ───────────────────────────────────────
        h1('F: Feed'),
        h2('Why Feed Management Matters'),
        p('A bird that cannot find feed or reach it comfortably does not grow. Feed access is the engine of production, and it is also one of the most reliable early-warning signals in your barn. Birds reduce feed intake before they show any other visible sign of stress or illness [1,11].'),
        p('A drop in daily feed consumption of more than 10 percent from the previous day, without a corresponding change in diet or management, is a red flag. Before you call it a feed problem, check the other five T-FLAWS points. Hot barns, poor air quality, low water flow, and high stocking density all suppress feed intake before they show up as anything else.'),
        p('Feed management is not just about keeping the bins full. It is about making sure every bird, in every corner of your barn, can reach good quality feed without competition, waste, or physical barriers. When this is right, growth is even and your flock coefficient of variation stays low.'),

        h2('What to Check'),
        p('At every barn walk, assess each of the following:'),
        labeled('Feeder levels:', 'Pans and troughs should have adequate feed without being overfilled. Overfilling increases waste and allows birds to sort, leaving fines at the bottom and wasting nutrient-dense particles.'),
        labeled('Feeder height:', 'The lip of the feeder should sit at back level as the bird stands. Too high and smaller birds cannot reach it. Too low and feed is wasted into the litter [11]. The CPC Broiler Management Bulletin recommends adjusting feeder height at a minimum of once per week as birds grow [11].'),
        labeled('Feed distribution:', 'Walk the full barn length and confirm feed is flowing to all stations. Auger failures, blocked joints, or bridged feed can leave entire sections without feed while the bins appear full.'),
        labeled('Feed quality:', 'Check for bridging (compacted feed that blocks flow from the bin), wet or caked feed near drinker lines, unusual odor, or visible mold. High-moisture or poorly stored feed is the most common cause of bridging [11].'),
        labeled('Access:', 'Every bird should be able to reach a feeder without displacing another. In the first week this is critical, as young chicks establish their position in the flock hierarchy through access to resources.'),

        ...imgBlock(IMG.flock4, 'png', 5.8, 'Photo 2.1: Early flock assessment. Even access to feeders and good bird distribution across the barn is a visible indicator of correct temperature, light, and feed management. Source: CPC Short Courses.'),

        h2('What Farmers See'),
        labeled('High weight variation (CV):', 'A flock with a wide spread of bird sizes at seven or fourteen days often traces back to uneven feed access in the first days. Some birds had consistent access; others competed and fell behind. That gap compounds through the grow-out.'),
        labeled('Birds pecking at empty pans:', 'Birds are programmed to keep seeking feed. If you see birds pecking at an empty pan or auger trough, feed is not reaching that station. Check the delivery system upstream from that point.'),
        labeled('Litter wet near feed lines:', 'Bridged or damp feed falls out of pans or auger tubes into the litter. Wet feed near feeder lines is a bridge and blockage indicator, not just a waste problem.'),
        labeled('Sorting behavior:', 'If birds are pushing feed around rather than eating steadily, the feed form or particle size may be wrong. Chicks on crumbles should not be sorting as though they are on mash.'),

        h2('What to Do'),
        b('Adjust feeder height at minimum once per week; keep a record of adjustments with date and bird age [11]'),
        b('Walk the full feeder line at every check and manually test flow at the far end of the barn'),
        b('Remove wet, molded, or visibly contaminated feed from pans immediately and identify the source of moisture'),
        b('Monitor daily feed consumption using bin meters or manual records and compare to breed target consumption curves [1]'),
        b('If a batch of feed smells abnormal or shows unusual bridging, retain a sample and notify your feed supplier before feeding the whole delivery'),
        b('In the first 48 hours, check crop fill at 2, 4, 8, 12, and 24 hours post-placement: target 75% of crops full at 2 hours, 100% by 48 hours. A bird with an empty crop at 24 hours is already behind [1]'),

        pb(),

        // ── L: LIGHT ──────────────────────────────────────
        h1('L: Light'),
        h2('Why Light Programs Matter'),
        p('Light is a powerful management tool that is easy to forget about because it is always on. Birds live by light cycles. Light duration and intensity control when they eat, when they rest, and how their metabolism runs. A poorly managed light program is a source of chronic, invisible stress that shows up in your performance data without an obvious cause.'),
        p('For broilers, the first seven days require bright, consistent light for 23 hours per day. This is not about stimulating production. It is about making sure day-old chicks find the feed and water that will determine everything that follows [1]. The Ross Broiler Management Handbook recommends a minimum intensity of 20 lux during this period [1].'),
        p('After the first week, most commercial programs reduce light intensity and introduce a dark period. The Ross 308 program targets 18 hours of light and 6 hours of darkness per day from week two onward [1]. A meaningful dark period supports circadian rhythm, rest behavior, and welfare. However, research cautions that excessive darkness (beyond what programs prescribe) can actually impair bone mineralization and growth. The goal is the right amount of darkness on schedule — not more, not less [1].'),

        h2('What to Check'),
        b('Walk every section of the barn and visually confirm all bulbs and fixtures are functioning'),
        b('Identify any dark zones (bulb failures, fixture faults) and any unusually bright areas'),
        b('Check your controller or timer program against the target hours of light for the current day of age'),
        b('Measure lux intensity with a light meter if available, particularly after replacing bulbs or retrofitting LED fixtures'),
        b('For layers: confirm that the photoperiod schedule is tracking correctly for age of lay and production targets'),

        callout('One burned-out section in a dark barn is enough to push birds away from feeders and waterers in that area. If you see birds piling in a lit section while an adjacent section is empty, look up. A bulb or circuit has failed.'),

        h2('What Farmers See'),
        labeled('Crowding in lit zones:', 'Birds naturally move toward light. When one section is darker than the rest, birds leave it and crowd the brighter areas. Feed and water access in the dark zone falls immediately. Weight variation in the flock increases.'),
        labeled('Restless birds at night:', 'If birds are never fully settling, the dark period is inadequate or lights are leaking from fixtures. Birds need true darkness to achieve a proper rest cycle.'),
        labeled('Layer production deviations:', 'If your hens fall below production targets or go off lay unexpectedly, verify the light schedule before looking at nutrition or disease. An incorrectly programmed timer is one of the first things to check.'),
        labeled('Poor uniformity in growers:', 'Uneven lux across the barn during the first week is a contributor to uneven feed and water access in that critical window, which translates directly to weight variation at seven days.'),

        h2('What to Do'),
        b('Replace failed bulbs the same day you find them, not at the next maintenance cycle'),
        b('Verify timer accuracy at each weekly check; timers drift and controllers can fail silently'),
        b('Use the breed management handbook as the primary reference for light schedules; your integrator may have additional requirements [1]'),
        b('After installing LED fixtures, verify lux levels with a meter and compare to your target intensity, not just visual assessment'),
        b('Keep a light program log with every change noted, so production deviations can be correlated with management events'),
        b('In growing barns, check that dark periods are genuinely dark; even small light leaks from curtains or door gaps disrupt the rest cycle'),

        pb(),

        // ── A: AIR ────────────────────────────────────────
        h1('A: Air'),
        h2('Why Ventilation Matters'),
        p('Ventilation is the most underestimated management factor in commercial poultry. It is invisible, it requires constant adjustment, and when it fails, birds absorb the consequences before most farmers notice anything wrong.'),
        p('The job of ventilation is to remove heat, moisture, ammonia, carbon dioxide, and dust, and to replace that air with fresh air delivered at the right temperature and speed for the birds in front of you [1,5]. Minimum ventilation must run every hour of every day, including cold Canadian winters. Shutting down fans to save on heating costs in January is one of the most common management errors in commercial production. The cost of that decision arrives weeks later in respiratory disease, poor litter, and compromised feed conversion.'),
        p('Ventilation is not just a comfort issue. It is a health, welfare, and productivity issue. Getting air quality right is as important as any vaccine or feed additive on your farm [5].'),

        h2('Key Air Quality Indicators'),
        labeled('Ammonia:', 'Ammonia is the single most practical air quality indicator you have on a daily barn walk. Research confirms that at concentrations above 10 ppm at bird level, ammonia begins suppressing immune function, with measurable cytokine changes observed at 15 ppm [5]. Some studies note that production impacts become more evident closer to 20 ppm, but the immune system is already under stress before that point. Above 25 ppm, well-documented ocular damage occurs, including corneal thickening, conjunctival edema, and swelling, making birds more vulnerable to every respiratory pathogen they encounter [5]. At 50 ppm and above, direct tissue damage to the respiratory tract becomes pronounced. The practical rule: do not wait for a number. If you can smell ammonia when you enter the barn, fix it immediately.'),
        p('The most important thing to know about ammonia is that you can smell it before your birds are in serious danger. If you walk into the barn and can smell ammonia at your standing height, concentrations at bird level are higher than they are at your nose. Fix it now, not at the end of the day.'),
        callout('The ammonia rule: if you can smell it when you walk in, your birds have been breathing unsafe concentrations since before your last visit. Ventilation rate needs to increase and litter moisture needs to be assessed immediately.'),
        labeled('Carbon dioxide:', 'CO2 above 3,000 ppm indicates the minimum ventilation rate is insufficient for the current stocking density and bird size [1]. CO2 itself is not as immediately damaging as ammonia at these concentrations, but it is a reliable indicator of overall air quality. If CO2 is high, minimum ventilation is too low.'),
        labeled('Relative humidity:', 'During brooding (the first two weeks), target relative humidity is 60 to 70 percent to protect day-old respiratory surfaces. From two weeks onward, 50 to 60 percent is the appropriate target [5]. Below 50 percent, dust levels rise and respiratory irritation increases. Above 70 percent at any age, litter moisture builds rapidly, ammonia production accelerates, and footpad dermatitis rates climb. Humidity is a direct reflection of ventilation rate; if humidity is high, your minimum ventilation is too low.'),
        labeled('Air temperature and speed:', 'The temperature and speed of incoming air at bird level matters. In cold weather, cold air entering too fast and landing on birds causes drafts, which chills young birds and causes them to huddle even when your barn thermostat shows an adequate temperature. Adjust inlet openings to direct air up and across the roof before it falls to bird level [1].'),

        ...imgBlock(IMG.house, 'jpg', 5.8, 'Photo 3.1: Commercial broiler barn interior. Proper ventilation keeps air fresh at bird level without drafts. Litter condition and bird distribution are visible indicators of air quality management. Source: CPC Short Courses.'),

        h2('What Farmers See'),
        b('Persistent wet eyes or foam eyes on multiple birds: early sign of ammonia exposure above safe levels'),
        b('Sneezing, head shaking, or rattling sounds: dust and ammonia irritating the upper airway'),
        b('Open-mouth breathing in cool conditions: indicates high CO2, not heat'),
        b('Condensation running down walls and pooling at the base: humidity too high, ventilation rate too low'),
        b('Rapid litter deterioration not explained by drinker leaks: insufficient air exchange is allowing moisture to build in the litter'),
        b('Birds avoiding certain barn sections: check for cold drafts from inlets at those locations'),

        h2('What to Do'),
        b('Check all fans for correct function and airflow direction at every visit; note any that are slow or reversed'),
        b('Check inlet opening positions and adjust for outside temperature and wind conditions according to your barn management system [1]'),
        b('Walk the full barn length at bird level and feel for drafts, check for stagnant zones, and smell for ammonia in every section'),
        b('If you detect ammonia: increase ventilation rate and immediately check litter moisture in the affected area'),
        b('Use an ammonia meter or test strips at bird level, not at standing height, for accurate readings'),
        b('Do not shut down minimum ventilation in cold weather; adjust heater output to compensate for increased fresh air, not fan speed [1]'),
        b('Maintain a scheduled ventilation equipment maintenance log; fans, controllers, and inlets fail gradually and silently'),

        pb(),

        // ── W: WATER ──────────────────────────────────────
        h1('W: Water'),
        h2('Why Water Matters'),
        p('Water is the most critical nutrient in your barn. Broilers consume approximately 1.7 to 1.8 times more water than feed by volume at comfortable temperatures, and this ratio increases significantly during heat stress [2]. The correlation between water and feed intake is 0.98 — nearly 1:1. Restrict water and feed consumption drops rapidly in response. By the time you notice reduced consumption on a meter or a daily record, the bird is already behind.'),
        p('Water management in a commercial barn is more than making sure the tanks are full. It involves pressure, flow rate, line height, water temperature, and water quality at the point of drinking, not at the header tank. A line that passes every tank test can still fail at the nipple if pressure is wrong, biofilm is heavy, or height adjustment is overdue [2,10].'),
        p('The CPC Drinking Water Management Bulletin notes that water intake monitoring is one of the most sensitive daily health indicators available to the farmer [10]. A drop in water consumption before any other sign of disease is detectable is a consistent pattern. If your meter readings drop by more than 10 percent compared to the previous day without a management change, investigate all T-FLAWS points and contact your veterinarian.'),

        h2('What to Check'),
        labeled('Nipple flow:', 'Activate several nipples along each line by pressing the trigger pin and confirm that water flows freely. A nipple that requires excessive force or produces only a trickle has failed or is blocked [10].'),
        labeled('Line pressure:', 'Overpressure causes nipples to drip constantly, wetting the litter below. Underpressure means birds work hard for very little water and drink less than they need. Pressure regulators must be checked and adjusted as bird size increases and demand grows [2].'),
        labeled('Line height:', 'Birds should drink with their head raised at approximately 45 degrees. Too low and birds waste water into the litter. Too high and young birds, or lighter birds in a mixed-size flock, cannot reach the nipple without stretching, which they will simply stop doing [2,10]. Adjust line height at minimum once per week.'),
        labeled('Water temperature:', 'Warm water reduces consumption. Water delivered to the nipple should be cool, ideally 10 to 14 degrees Celsius [2]. In summer, this requires attention to insulation on supply lines and possibly chilling systems in extreme heat.'),
        labeled('Consumption records:', 'If your system has water meters, check daily volume against the breed target curve. The Ross Broiler Management Handbook provides expected water intake by day of age at a given temperature [1]. Any deviation greater than 10 percent in either direction needs an explanation.'),
        labeled('Line cleanliness:', 'Biofilm develops on the inside of drinker lines within days of a flock placement. Flushing lines daily and using a sanitization protocol approved by your veterinarian keeps bacterial counts low at the point of consumption [2,10].'),

        ...imgBlock(null, null, 5.8, 'Figure 5.1: Nipple drinker line height by bird age. The correct drinking angle is approximately 45 degrees with the bird\'s head raised. Adjust weekly. Source: Aviagen Water Quality 2025 [2].'),

        h2('What Farmers See'),
        labeled('Birds clustered at drinker lines waiting:', 'Flow is insufficient for the number of birds at that line. This can be a pressure issue, a blocked nipple, or a failed regulator.'),
        labeled('Wet litter under drinker lines:', 'Overpressure or dripping nipples. The wet litter under the line will generate ammonia and footpad problems within days if not corrected.'),
        labeled('Yellow or stringy droppings:', 'Can indicate dehydration or reduced water intake. Check flow and pressure before assuming a disease cause.'),
        labeled('Increased aggression and early feather pecking:', 'Competition at water points is a common and underappreciated trigger for early pecking behavior. Ensure there are enough functioning nipples per bird for the current age and density.'),

        h2('What to Do'),
        b('Flush drinker lines at the beginning of every flock and at regular intervals during production [2,10]'),
        b('Use a validated line-sanitization protocol recommended by your veterinarian; consult the CPC Drinking Water Management bulletin for guidance [10]'),
        b('Adjust line height at least once per week; tie a marked string to the line at placement and measure against bird back height at each adjustment [10]'),
        b('Test water quality at the nipple, not just at the header tank, at minimum once per flock; test for pH, total dissolved solids, and bacterial counts [2]'),
        b('If nipple flow is low, check the regulator, filter, and the full line for blockages or heavy biofilm'),
        b('During hot weather, check water temperature at the nipple and increase line-flush frequency to keep water cool'),
        b('Record daily water consumption and flag any drop of more than 10 percent for the same day of age versus previous flocks [1,10]'),

        pb(),

        // ── S: SANITATION & SPACE ─────────────────────────
        h1('S: Sanitation & Space'),
        h2('Litter Management'),
        p('Litter is not just bedding. It is a living microbial environment that generates heat, moisture, and ammonia when it is mismanaged, and provides thermal insulation, dust-bathing substrate, and foot comfort when it is managed well. Wet litter affects Temperature (T), Air quality (A), and Water management (W) simultaneously. Getting litter right is the foundation of the whole T-FLAWS system.'),
        p('The scientific target for litter moisture content is 20 to 25 percent. University extension research and industry guidelines consistently identify this range as the standard for optimal broiler production [7]. Above 25 percent, footpad dermatitis rates begin climbing. Above 30 percent, ammonia production accelerates sharply and conditions for Clostridium-related gut disease become favorable. Good litter is loose, friable, light-colored, and dry enough to crumble when you pick up a handful. Problem litter is wet, dark, caked, and smells of ammonia from across the barn.'),
        p('Common causes of wet litter include:'),
        b('Leaking nipple drinkers or failed pressure regulators'),
        b('Inadequate ventilation allowing humidity to build in the litter surface'),
        b('High dietary salt levels driving excess water consumption'),
        b('Disease causing watery droppings'),
        b('Insufficient litter depth at placement or poor-quality litter material'),
        p('Wet patches spread. Moisture creates a feedback loop — wet litter prevents drying underneath, microbial activity generates more heat and moisture, and the affected area grows. A small wet patch under a dripping nipple becomes a large problem within days if not corrected. Walk the full barn perimeter and the center on every visit. Litter problems are easier to catch in a corner than to remediate across an entire barn floor.'),

        callout('If your litter is wet, your ammonia is rising and your ventilation rate needs to increase. Fix the source of moisture, increase ventilation, and consider applying a litter amendment if recommended by your veterinarian. Do not wait for footpad scores to tell you what the litter already shows.'),

        h2('Stocking Density'),
        p('Stocking density affects every other T-FLAWS checkpoint. Higher density means more heat produced per square meter (T), more moisture and ammonia in the air (A), more competition for feeders and waterers (F and W), and less space per bird to rest, move, and express normal behavior (welfare).'),
        p('The National Farm Animal Care Council (NFACC) Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys sets the legal and welfare standards for commercial broiler production in Canada. Under conventional programs, the maximum stocking density is 31 kg per square meter live weight. Programs with enhanced welfare auditing can operate up to 38 kg per square meter [4].'),
        p('These numbers are maximums, not targets. Running consistently at the ceiling of the allowable density means your ventilation system, feeding system, and water system have no margin for error. When something goes wrong on a hot day in a barn at maximum density, everything fails faster and harder than in a barn with space to spare.'),

        ...imgBlock(IMG.biosec, 'png', 5.8, 'Photo 4.1: Biosecurity at the barn entrance. Proper sanitation starts before you enter. A clean biosecurity line protects every bird inside. Source: CPC Short Courses.'),

        h2('What Farmers See'),
        labeled('Wet, dark, caked litter patches:', 'Most commonly found under drinker lines, near walls, and in corners with poor air circulation. Check for the moisture source before applying a treatment.'),
        labeled('Strong ammonia on barn entry:', 'If the smell hits you at the door, litter moisture is high and ventilation rate is insufficient. Both problems need to be addressed simultaneously.'),
        labeled('Reddened or eroded footpads:', 'Early footpad dermatitis is a visible outcome of wet litter. By the time you see it on the birds, the litter has been wet for several days. Check and score footpads weekly to catch the trend before it becomes a processing problem.'),
        labeled('Competition at feeders and waterers:', 'Birds unable to access resources without displacing others indicates stocking density is creating bottlenecks. Review placement density and feeder/waterer allocation.'),
        labeled('Increased aggression and piling:', 'Overcrowded birds under thermal or feed stress develop piling behavior, particularly at night. This can cause smothering and elevated mortality. Investigate the root cause rather than just managing the symptom.'),

        h2('What to Do'),
        b('Walk the full barn length and perimeter for litter inspection at every visit; focus on corners and drinker lines where wet patches start'),
        b('Fix water leaks immediately, the same day they are identified, not at the next maintenance cycle'),
        b('Increase ventilation rate when litter surface is visibly damp, even if other parameters appear acceptable'),
        b('Apply a litter amendment product only if recommended by your veterinarian and consistent with your production protocol; some amendments alter ammonia chemistry without addressing the root cause [7]'),
        b('Ensure full cleanout, disinfection, and complete dry-down between every flock [7,8]'),
        b('Do not place a new flock on litter that does not meet your pre-placement quality targets, regardless of schedule pressure [7]'),
        b('Maintain stocking density within NFACC limits; adjust for seasonal conditions, and plan density reductions in summer months when ventilation capacity is most stressed [4]'),

        pb(),

        // ── SYSTEM ────────────────────────────────────────
        h1('Using T-FLAWS as a System'),
        p('The value of T-FLAWS is not in any single point. It is in the discipline of checking all six, in the same order, every time you enter a barn.'),
        p('The six points are connected. A problem in one almost always affects the others:'),
        b('Cold temperature causes birds to huddle, which localizes their droppings and wets the litter under the heat source (T worsening S)'),
        b('High ammonia from wet litter suppresses feed intake and irritates airways, making birds more vulnerable to respiratory disease (A and S worsening F and health)'),
        b('Poor ventilation raises humidity, accelerates litter breakdown, and raises ammonia further (A worsening both A and S in a feedback loop)'),
        b('Restricted water causes feed intake to fall rapidly — the two are correlated at 0.98; fix water first before investigating other causes (W driving F)'),
        b('High stocking density creates competition for every resource, amplifying any deficiency in T, F, L, A, or W (S amplifying everything else)'),
        p('When you find a T-FLAWS problem, look at the points most likely to have contributed to it and the points most likely to be affected by it. A barn walk that finds wet litter near the drinkers is not just a water pressure check. It is also a prompt to check ammonia, ventilation rate, footpad condition, and feed intake for the section affected.'),
        callout('The farmers who get the most from T-FLAWS are not the ones who use it to find problems. They are the ones who use it to prevent them. By the time a problem is visible in your birds, it has usually been building in your management for several days.'),

        ...imgBlock(IMG.digital, 'png', 5.8, 'Figure 6.1: Digital flock management tools can support daily T-FLAWS records, making patterns visible across flocks and seasons. Source: CPC Short Courses.'),

        pb(),

        // ── WHERE TO KEEP LEARNING ────────────────────────
        h1('Where to Keep Learning'),
        h2('Key Scientific Journals'),
        b('Poultry Science: the primary peer-reviewed research journal for commercial poultry production (poultryscience.org)'),
        b("World's Poultry Science Journal: WPSA journal covering global production and welfare research"),
        b('Canadian Journal of Animal Science: covers Canadian production conditions, regulation, and management'),
        b('Animals: open-access journal with applied welfare and management research'),

        h2('Key Institutional Resources'),
        b('CPC Learning Centre, Canadian Poultry Consultants Ltd.: canadianpoultry.ca/learning-centre/ — Technical Bulletins, Disease Profiles, Broiler and Layer Flock Management guides'),
        b('Aviagen Resource Centre: aviagen.com — Ross and ArborAcres breed management handbooks, water quality and biosecurity guides, updated annually'),
        b('National Farm Animal Care Council (NFACC): nfacc.ca — Codes of Practice for all Canadian poultry species'),
        b('Canadian Food Inspection Agency (CFIA): inspection.canada.ca — Biosecurity standards for commercial poultry production'),
        b('Poultry Industry Council (PIC): poultryindustrycouncil.ca — Canadian production data, extension resources, and on-farm benchmarking tools'),

        pb(),

        // ── REFERENCES ────────────────────────────────────
        h1('References'),
        p('References listed in order of appearance.'),

        new Paragraph({ spacing: { before: 100, after: 80 }, children: [
          run('[1]', { bold: true }), run('  Aviagen. Ross Broiler Management Handbook. Aviagen Group Ltd., Huntsville, AL, USA, 2025.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[2]', { bold: true }), run('  Aviagen. Water Quality in Poultry Production. Aviagen Group Ltd., Huntsville, AL, USA, 2025.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[3]', { bold: true }), run('  Bell, D.D., Weaver, W.D. (eds). Commercial Chicken Meat and Egg Production, 5th edition. Springer Science & Business Media, New York, 2002.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[4]', { bold: true }), run('  National Farm Animal Care Council (NFACC). Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys. NFACC, Lacombe, AB, Canada, 2016.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[5]', { bold: true }), run('  Pottguter, R. Poultry Signals: A Practical Guide for Poultry Farming. Roodbont Publishers, Zutphen, Netherlands, 2009.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[6]', { bold: true }), run('  Daghir, N.J. (ed). Poultry Production in Hot Climates, 2nd edition. CABI, Wallingford, UK, 2008.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[7]', { bold: true }), run('  Aviagen. Best Practices in Biosecurity for Ross Broiler Operations. Aviagen Group Ltd., Huntsville, AL, USA.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[8]', { bold: true }), run('  Canadian Food Inspection Agency (CFIA). Biosecurity Guide for Commercial Poultry Production. CFIA, Ottawa, ON, Canada.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[9]', { bold: true }), run('  CPC Learning Centre. T-FLAWS Barn Management Framework. Canadian Poultry Consultants Ltd., Canada. [Unpublished proprietary framework. Developed by the CPC Learning Centre. Confirmed by CPC, personal communication, 2026.]'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[10]', { bold: true }), run('  CPC Learning Centre. Drinking Water Management for Broilers. CPC Technical Bulletin, Flock Management Series. Canadian Poultry Consultants Ltd., Canada.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          run('[11]', { bold: true }), run('  CPC Learning Centre. Broiler Management. CPC Technical Bulletin, Flock Management Series. Canadian Poultry Consultants Ltd., Canada.'),
        ]}),
      ],
    },
  ],
});

// ── Build ─────────────────────────────────────────────────────
console.log('Building document...');
const rawBuf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, rawBuf);
console.log('Initial file written. Applying post-build patches...');

// ── POST-BUILD PATCH ──────────────────────────────────────────
const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tocRow(e) {
  const style  = e.lvl === 1 ? 'TOC1' : 'TOC2';
  const indent = e.lvl === 1 ? 0 : 220;
  const text   = escapeXml(e.text);
  return (
    '<w:p><w:pPr>' +
      `<w:pStyle w:val="${style}"/>` +
      '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>' +
      '<w:spacing w:after="60"/>' +
      (indent ? `<w:ind w:left="${indent}"/>` : '') +
    '</w:pPr>' +
    `<w:hyperlink w:anchor="${e.anchor}" w:history="1">` +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>` +
      '<w:r><w:tab/></w:r>' +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="22"/></w:rPr><w:t>${e.page}</w:t></w:r>` +
    '</w:hyperlink></w:p>'
  );
}

const cachedRows = ea.map(tocRow).join('');

// 1. Patch document.xml
let docXml = await outZip.file('word/document.xml').async('string');
const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  sdt = sdt.replace(/\sw:dirty="true"/g, '');
  sdt = sdt.replace(
    /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
    `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`,
  );
  docXml = docXml.replace(sdtMatch[0], sdt);
}
docXml = docXml.replace(/\sw:dirty="true"/g, '');

// 2. Inject bookmarks
const norm = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
let entryIdx  = 0;
let bookmarkId = 1000;
const hRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
docXml = docXml.replace(hRe, (match, lvlStr) => {
  if (entryIdx >= ea.length) return match;
  const lvl  = Number(lvlStr);
  const text = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
  const entry = ea[entryIdx];
  if (lvl !== entry.lvl) return match;
  if (norm(text) !== norm(entry.text)) return match;
  entryIdx++;
  const id = bookmarkId++;
  return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
});
if (entryIdx !== ea.length) {
  console.warn(`TOC bookmark warning: ${entryIdx}/${ea.length} matched.`);
  console.warn('Unmatched:', ea.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | '));
}
outZip.file('word/document.xml', docXml);

// 3. settings.xml — updateFields=false (robust: remove any existing, then insert)
let settings = await outZip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
settings = settings.replace(/<w:updateFields[^>]*>[\s\S]*?<\/w:updateFields>/g, '');
settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
outZip.file('word/settings.xml', settings);

// 4. TOC styles
let stylesXml = await outZip.file('word/styles.xml').async('string');
if (!/w:styleId="TOC1"/.test(stylesXml)) {
  const tocStyles =
    '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
  stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
  outZip.file('word/styles.xml', stylesXml);
}

// 5. Verify
const dirtyLeft  = (docXml.match(/w:dirty=/g) || []).length;
const bookmarks  = (docXml.match(/<w:bookmarkStart/g) || []).length;
const hyperlinks = (docXml.match(/<w:hyperlink/g) || []).length;
console.log(`w:dirty remaining : ${dirtyLeft}  (must be 0)`);
console.log(`TOC bookmarks     : ${bookmarks}`);
console.log(`TOC hyperlinks    : ${hyperlinks}  (both must equal ${ea.length})`);
console.log(`updateFields      :`, settings.match(/<w:updateFields[^>]*>/g));
if (dirtyLeft > 0) throw new Error(`${dirtyLeft} w:dirty flags remain — dialog will fire`);

// 6. Write final
const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log(`\nDone. Output: ${OUT_FILE}`);
console.log('NOTE: Word shows the field-update dialog on FIRST open only.');
console.log('      Click YES once, then Ctrl+S. It will not appear again on subsequent opens.');
