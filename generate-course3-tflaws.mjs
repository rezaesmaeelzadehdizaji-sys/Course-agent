// ============================================================
// generate-course3-tflaws.mjs — Course 3: T-FLAWS Assessment Management Tool
// CPC Short Courses — Fully corrected content (May 2026)
// T-FLAWS = Temperature, Feed, Light, Air, Water, Sanitation & Space
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
const OUT_DIR  = path.join(__dirname, 'Course 3');
const OUT_FILE = path.join(OUT_DIR, 'T-FLAWS_Assessment_Management_Tool_draft.docx');
const SRC_FILE = path.join(OUT_DIR, '_source_images.docx');

// ── Extract CPC logo from source docx ────────────────────────
const srcZip = await JSZip.loadAsync(fs.readFileSync(SRC_FILE));
const logoBuf = await srcZip.file('word/media/image1.png').async('nodebuffer');

// ── Load available barn photos ────────────────────────────────
const houseImg = fs.existsSync(path.join(OUT_DIR, 'broiler_house.jpg'))
  ? fs.readFileSync(path.join(OUT_DIR, 'broiler_house.jpg')) : null;
const flockImg = fs.existsSync(path.join(OUT_DIR, 'broiler_flock.jpg'))
  ? fs.readFileSync(path.join(OUT_DIR, 'broiler_flock.jpg')) : null;

// ── Colour palette ────────────────────────────────────────────
const BLUE   = '2E74B5';
const GOLD   = 'C9A84C';
const GRAY   = '595959';
const LGRAY  = '888888';
const WHITE  = 'FFFFFF';
const DGRAY  = '3C3C3C';

// ── Typography helpers ────────────────────────────────────────
const rp = (text, opts = {}) => new TextRun({
  text,
  font: 'Calibri',
  size: opts.size ?? 22,
  bold: opts.bold ?? false,
  italics: opts.italics ?? false,
  color: opts.color ?? DGRAY,
  ...opts,
});

const heading1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 160 },
  children: [new TextRun({ text, font: 'Calibri', size: 28, bold: true, color: BLUE })],
});

const heading2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 100 },
  children: [new TextRun({ text, font: 'Calibri', size: 24, bold: true, color: BLUE })],
});

const para = (children, opts = {}) => new Paragraph({
  spacing: { before: 120, after: 120, line: 276 },
  alignment: opts.align ?? AlignmentType.LEFT,
  children: Array.isArray(children) ? children : [rp(children, opts)],
});

const bullet = (text, lvl = 0) => new Paragraph({
  bullet: { level: lvl },
  spacing: { before: 60, after: 60, line: 276 },
  children: [rp(text, { size: 22 })],
});

const callout = (text) => new Paragraph({
  spacing: { before: 160, after: 160, line: 276 },
  indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
  border: {
    left: { style: BorderStyle.THICK, size: 12, color: GOLD, space: 8 },
  },
  children: [rp(text, { italics: true, color: GRAY })],
});

const imgPlaceholder = (caption) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  margins: { top: 100, bottom: 100 },
  rows: [
    new TableRow({ children: [
      new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: 'F2F2F2' },
        borders: {
          top:    { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          left:   { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          right:  { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
        },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 800, after: 800 },
          children: [rp('[Image placeholder]', { color: '999999', italics: true })],
        })],
      }),
    ]}),
  ],
});

const captionPara = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 60, after: 160 },
  children: [rp(text, { italics: true, size: 20, color: GRAY })],
});

const photo = (buf, w, h, caption) => [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 60 },
    children: buf ? [new ImageRun({ data: buf, transformation: {
      width: convertInchesToTwip(w), height: convertInchesToTwip(h),
    }})] : [rp('[Photo placeholder]', { color: '999999', italics: true })],
  }),
  captionPara(caption),
];

// ── Header / Footer factory ───────────────────────────────────
const makeHeader = (title) => new Header({ children: [new Paragraph({
  alignment: AlignmentType.RIGHT,
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  children: [
    rp('CPC Short Courses  |  ', { size: 18, color: LGRAY }),
    rp(title, { size: 18, bold: true, color: BLUE }),
  ],
})]});

const makeFooter = (courseNum) => new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  children: [
    rp(`CPC Short Courses  |  Course ${courseNum}  |  Page `, { size: 18, color: LGRAY }),
    new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: LGRAY }),
    rp(' of ', { size: 18, color: LGRAY }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: LGRAY }),
  ],
})]});

const blankHeader  = new Header({ children: [new Paragraph('')] });
const blankFooter  = new Footer({ children: [new Paragraph('')] });

// ── TOC entries (for post-build patch) ────────────────────────
const tocEntries = [
  { lvl: 1, text: 'Introduction to T-FLAWS', page: 3 },
  { lvl: 2, text: 'What Is T-FLAWS?', page: 3 },
  { lvl: 2, text: 'Who Is This Course For?', page: 3 },
  { lvl: 2, text: 'How to Use This Checklist', page: 4 },
  { lvl: 1, text: 'T: Temperature', page: 5 },
  { lvl: 2, text: 'Why Temperature Matters', page: 5 },
  { lvl: 2, text: 'Target Ranges by Bird Age', page: 6 },
  { lvl: 2, text: 'What Farmers See', page: 7 },
  { lvl: 2, text: 'What to Do', page: 8 },
  { lvl: 1, text: 'F: Feed', page: 9 },
  { lvl: 2, text: 'Why Feed Management Matters', page: 9 },
  { lvl: 2, text: 'What to Check', page: 9 },
  { lvl: 2, text: 'What Farmers See', page: 10 },
  { lvl: 2, text: 'What to Do', page: 11 },
  { lvl: 1, text: 'L: Light', page: 12 },
  { lvl: 2, text: 'Why Light Programs Matter', page: 12 },
  { lvl: 2, text: 'What to Check', page: 13 },
  { lvl: 2, text: 'What Farmers See', page: 13 },
  { lvl: 2, text: 'What to Do', page: 14 },
  { lvl: 1, text: 'A: Air', page: 15 },
  { lvl: 2, text: 'Why Ventilation Matters', page: 15 },
  { lvl: 2, text: 'Key Air Quality Indicators', page: 15 },
  { lvl: 2, text: 'What Farmers See', page: 16 },
  { lvl: 2, text: 'What to Do', page: 17 },
  { lvl: 1, text: 'W: Water', page: 18 },
  { lvl: 2, text: 'Why Water Matters', page: 18 },
  { lvl: 2, text: 'What to Check', page: 18 },
  { lvl: 2, text: 'What Farmers See', page: 19 },
  { lvl: 2, text: 'What to Do', page: 20 },
  { lvl: 1, text: 'S: Sanitation & Space', page: 21 },
  { lvl: 2, text: 'Litter Management', page: 21 },
  { lvl: 2, text: 'Stocking Density', page: 22 },
  { lvl: 2, text: 'What Farmers See', page: 22 },
  { lvl: 2, text: 'What to Do', page: 23 },
  { lvl: 1, text: 'Using T-FLAWS as a System', page: 24 },
  { lvl: 1, text: 'Where to Keep Learning', page: 25 },
  { lvl: 2, text: 'Key Scientific Journals', page: 25 },
  { lvl: 2, text: 'Key Institutional Resources', page: 25 },
  { lvl: 1, text: 'References', page: 26 },
];

const entriesWithAnchor = tocEntries.map((e, i) => ({
  ...e,
  anchor: `_Toc${String(100000 + i).padStart(8, '0')}`,
}));

// ============================================================
// DOCUMENT BODY
// ============================================================

const doc = new Document({
  creator: 'CPC Learning Centre',
  title: 'T-FLAWS Assessment Management Tool',
  description: 'CPC Short Courses — Course 3',
  styles: {
    paragraphStyles: [
      { id: 'Normal', name: 'Normal', run: { font: 'Calibri', size: 22, color: DGRAY } },
    ],
  },
  sections: [

    // ── SECTION 1: Cover page (no header/footer) ─────────────
    {
      properties: { page: { size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) } } },
      headers: { default: blankHeader },
      footers: { default: blankFooter },
      children: [
        // Top label
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: convertInchesToTwip(1.2), after: 240 },
          children: [rp('COURSE 3: CPC SHORT COURSES', { size: 22, bold: true, color: BLUE })],
        }),
        // CPC Logo
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 280 },
          children: [new ImageRun({
            data: logoBuf,
            transformation: { width: convertInchesToTwip(1.6), height: convertInchesToTwip(1.6) },
          })],
        }),
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 200 },
          children: [rp('T-FLAWS Assessment Management Tool', { size: 48, bold: true, color: BLUE })],
        }),
        // Subtitle
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 360 },
          children: [rp('A Practical Barn Entry Checklist for Canadian Poultry Farmers', {
            size: 28, italics: true, color: BLUE,
          })],
        }),
        // Gold rule
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 360 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
          children: [rp('')],
        }),
        // Metadata
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
          children: [rp('CPC Short Courses', { size: 22, bold: true, color: GRAY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
          children: [rp('Duration: 2 hours', { size: 22, color: GRAY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 },
          children: [rp('May 2026', { size: 22, color: GRAY })] }),
        // Disclaimer
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [rp(
            'This course has been developed for educational purposes for commercial poultry farmers in Canada. ' +
            'Content is drawn from the field experience of Canadian poultry consultants, peer-reviewed scientific ' +
            'literature, and industry management guides. This material does not replace the advice of a licensed ' +
            'veterinarian or regulatory authority.',
            { size: 18, color: LGRAY, italics: true },
          )],
        }),
      ],
    },

    // ── SECTION 2: TOC ────────────────────────────────────────
    {
      properties: { page: { size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) } } },
      headers: { default: makeHeader('T-FLAWS Assessment Management Tool') },
      footers: { default: makeFooter(3) },
      children: [
        heading1('Table of Contents'),
        new TableOfContents('Table of Contents', {
          hyperlink: true,
          headingStyleRange: '1-2',
          stylesWithLevels: [{ styleName: 'Heading1', level: 1 }, { styleName: 'Heading2', level: 2 }],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },

    // ── SECTION 3: Body ───────────────────────────────────────
    {
      properties: { page: { size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) } } },
      headers: { default: makeHeader('T-FLAWS Assessment Management Tool') },
      footers: { default: makeFooter(3) },
      children: [

        // ── INTRODUCTION ────────────────────────────────────
        heading1('Introduction to T-FLAWS'),
        heading2('What Is T-FLAWS?'),
        para('Every time you walk into a barn, you are making decisions. You can feel the air, hear the birds, and see how they are distributed across the floor. T-FLAWS gives that walk a structure.'),
        para([
          rp('T-FLAWS stands for '),
          rp('Temperature, Feed, Light, Air, Water, and Sanitation & Space', { bold: true }),
          rp('. Six checkpoints. Six things that, if you get them right consistently, give your birds the best possible environment to perform and stay healthy.'),
        ]),
        para(
          'T-FLAWS was introduced by the CPC Learning Centre as a practical barn-entry checklist for farmers, ' +
          'veterinarians, and technicians. It is an adaptation of the industry-standard FLAWS management framework, ' +
          'with Temperature added as a standalone first check, reflecting how critical thermal management is, ' +
          'especially in the first days of a flock [1,9].',
        ),
        callout(
          'T-FLAWS is not a disease diagnostic tool. If birds are sick, call your veterinarian. ' +
          'T-FLAWS is what you do before that point. It is what keeps problems from developing in the first place.',
        ),

        heading2('Who Is This Course For?'),
        para(
          'This course is written for commercial poultry farmers managing broiler, layer, or breeder operations in Canada. ' +
          'The checklist applies across production types. Specific numbers and targets cited in each section refer ' +
          'primarily to broiler production where species-specific data is given. If you manage layers or turkeys, ' +
          'consult your breed guide and veterinarian for species-specific targets.',
        ),
        para('The six T-FLAWS points are equally relevant to:', ),
        bullet('Farm employees and barn technicians checking flocks'),
        bullet('Veterinarians and service technicians on farm visits'),
        bullet('New farmers building daily observation habits'),
        bullet('Experienced farmers standardizing their barn-walk routines'),

        heading2('How to Use This Checklist'),
        para(
          'T-FLAWS works as a walk-through sequence. You check each point in order, starting with Temperature ' +
          'when you step inside the door, and finishing with Sanitation and Space as you scan the floor and ' +
          'perimeter. The whole check takes ten to fifteen minutes in a barn you know well.',
        ),
        para('Use it:'),
        bullet('At every barn entry, every day'),
        bullet('As a record system, noting any point that is off and the corrective action taken'),
        bullet('As a communication tool between farm staff, so everyone checks the same six things in the same order'),

        ...photo(flockImg, 6.0, 3.5, 'Photo 1.1: A well-managed commercial broiler flock. T-FLAWS gives every barn walk a consistent structure.'),

        new Paragraph({ children: [new PageBreak()] }),

        // ── T: TEMPERATURE ──────────────────────────────────
        heading1('T: Temperature'),
        heading2('Why Temperature Matters'),
        para(
          'Temperature is the first thing you assess when you walk into a barn. It is also the most likely ' +
          'factor to be wrong at placement. A day-old chick cannot regulate its own body temperature — it depends ' +
          'entirely on the environment you provide [1].',
        ),
        para(
          'Poor thermal management in the first week of life causes increased early mortality, poor gut development, ' +
          'reduced feed intake, and uneven flock weight distribution that compounds through the entire grow-out [1]. ' +
          'A cold start is one of the most expensive mistakes in broiler production, and it is entirely preventable.',
        ),

        heading2('Target Ranges by Bird Age'),
        para(
          'The Ross Broiler Management Handbook recommends measuring temperature at chick level, not at ceiling ' +
          'sensor height. On cold nights or with cold floors, bird-level temperature can be 3 to 5°C lower than ' +
          'what your controller display shows [1].',
        ),
        para('Target temperatures at bird level (broilers) [1]:'),
        bullet('Day 0 to 2: 32 to 34°C'),
        bullet('Day 3 to 7: reduce by approximately 0.5°C every 2 to 3 days as birds feather in'),
        bullet('Week 2: approximately 28 to 30°C'),
        bullet('Week 3: approximately 24 to 27°C'),
        bullet('Week 4 and beyond: 18 to 22°C'),
        para(
          'These are starting points. Always observe bird behavior and adjust. Bird distribution across the ' +
          'barn floor is a more reliable indicator than a thermostat reading alone.',
        ),
        imgPlaceholder(''),
        captionPara('Figure 1.1: Ideal bird distribution pattern at correct temperature. Birds spread evenly with no crowding or piling.'),

        heading2('What Farmers See'),
        para([rp('Signs of cold stress:', { bold: true })]),
        bullet('Birds huddling tightly under heat sources'),
        bullet('High-pitched distress calls, especially in the first 24 hours'),
        bullet('Reduced activity, little exploration of the barn floor'),
        bullet('Birds not reaching feed and water stations at the barn edges'),
        bullet('Elevated first-week mortality'),
        para([rp('Signs of heat stress:', { bold: true })]),
        bullet('Birds spreading to barn edges, avoiding the center'),
        bullet('Panting with beaks open, wings held away from the body'),
        bullet('Crowding near water drinkers'),
        bullet('Reduced feed intake, especially during the hottest part of the day [6]'),
        bullet('Pale combs and wattles in older birds'),
        callout(
          'If you see birds panting at the water lines, your temperature is already high enough to reduce ' +
          'feed conversion. Fix ventilation first — cooling birds through air movement is more effective ' +
          'than lowering the thermostat setpoint alone.',
        ),

        heading2('What to Do'),
        bullet('Pre-heat the barn at least 24 to 48 hours before chick placement, including the floor and litter [1]'),
        bullet('Place a minimum thermometer at chick level at multiple points along the barn length'),
        bullet('Check temperature gradient along the barn, from inlet end to fan end, and adjust accordingly'),
        bullet('If birds are huddling, increase heat and check for drafts near inlets'),
        bullet('If birds are spreading to edges, increase ventilation and reduce heat output'),
        bullet('Record temperature at every barn check and compare to target for day of age'),

        new Paragraph({ children: [new PageBreak()] }),

        // ── F: FEED ─────────────────────────────────────────
        heading1('F: Feed'),
        heading2('Why Feed Management Matters'),
        para(
          'A bird that cannot find feed or reach it properly does not grow. Feed intake is the engine of ' +
          'production. It is also one of the most reliable early-warning indicators of a problem, because ' +
          'birds reduce intake before they show any other visible sign of stress or disease [1].',
        ),
        para(
          'A drop in daily feed consumption of more than 10% from the previous day, without a change in ' +
          'management or diet, is a red flag that warrants investigation of all T-FLAWS points, ' +
          'and a call to your veterinarian if you cannot identify the cause.',
        ),

        heading2('What to Check'),
        para('At every barn walk, assess the following:'),
        bullet('Feeder levels: are pans or troughs adequately filled?'),
        bullet('Feeder height: the lip of the pan or trough should sit at back level as the bird stands [1]'),
        bullet('Feed distribution: is feed reaching all feeders along the barn length?'),
        bullet('Feed quality: check for bridging (clumped feed blocking flow), wet or moldy feed, or fine particle separation'),
        bullet('Access: can all birds reach a feeder without crowding others out?'),
        para(
          'The Ross Broiler Management Handbook recommends adjusting feeder height at least once per week ' +
          'to match the bird\'s growing frame [1]. Feeders set too high exclude smaller, lighter birds. ' +
          'Feeders set too low increase feed waste and litter contamination, which compounds your S (Sanitation) problem.',
        ),
        imgPlaceholder(''),
        captionPara('Figure 2.1: Correct feeder height and distribution. Every bird should be able to access feed without competing.'),

        heading2('What Farmers See'),
        para([rp('Signs of poor feed access:', { bold: true })]),
        bullet('High coefficient of variation (CV) in body weights — a wide spread of bird sizes in the same flock'),
        bullet('Birds bunching around one feeder while others are empty'),
        bullet('Birds pecking at empty pans'),
        bullet('Visible weight drop on the weekly average compared to breed target'),
        bullet('Litter that smells of fermented feed near specific feeder lines'),

        para([rp('Signs of feed quality issues:', { bold: true })]),
        bullet('Birds sorting, pushing through feed without eating'),
        bullet('Increased water consumption without a change in temperature (birds trying to compensate for high salt or dusty feed)'),
        bullet('Visible mold or dark discoloration in the feed'),

        heading2('What to Do'),
        bullet('Check and adjust feeder height at least once per week as birds grow [1]'),
        bullet('Check auger and conveyor lines for bridging or mechanical blockages'),
        bullet('Remove wet, caked, or visibly contaminated feed from pans immediately'),
        bullet('Record daily feed consumption from bin meters if available, and compare to breed targets [1]'),
        bullet('Contact your feed supplier if you suspect quality issues in the batch — retain a sample for testing'),

        new Paragraph({ children: [new PageBreak()] }),

        // ── L: LIGHT ────────────────────────────────────────
        heading1('L: Light'),
        heading2('Why Light Programs Matter'),
        para(
          'Light programs control when birds eat, sleep, move, and grow. A poorly managed light program ' +
          'produces birds that are chronically fatigued, have compromised bone and leg development, and ' +
          'underperform at every production metric.',
        ),
        para(
          'For broilers, the first seven days require bright, continuous light to ensure chicks find feed and ' +
          'water immediately after placement [1]. The Ross Broiler Management Handbook recommends a minimum ' +
          'intensity of 20 lux for the first seven days, maintained for 23 hours per day [1].',
        ),
        para(
          'After the first week, most programs reduce light intensity and introduce a dark period of at least ' +
          'six hours in every 24-hour cycle [1]. This dark period is directly linked to better leg development ' +
          'and reduced metabolic disease incidence. It is not optional.',
        ),
        callout(
          'Leg problems in broilers are among the leading welfare and production issues in the industry. ' +
          'Providing an adequate dark period from week two onward is one of the most effective and lowest-cost ' +
          'management interventions available to you [1].',
        ),

        heading2('What to Check'),
        bullet('Walk the barn and confirm all light bulbs and fixtures are functioning'),
        bullet('Identify any dark zones and any overly bright zones — light distribution should be even'),
        bullet('Check your timer program against the day-of-age target for your breed and production type'),
        bullet('Measure light intensity with a lux meter if available, especially when changing bulbs or fixtures'),
        bullet('For layers: confirm photoperiod schedule is on track for age of lay and production targets'),

        imgPlaceholder(''),
        captionPara('Figure 3.1: Uniform light distribution in a commercial broiler barn. Uneven lighting causes birds to pile in bright spots.'),

        heading2('What Farmers See'),
        para([rp('Signs of lighting problems:', { bold: true })]),
        bullet('Birds crowding in lit areas, avoiding dark zones — indicates uneven distribution'),
        bullet('Restless birds that never fully settle — may indicate no adequate dark period'),
        bullet('Leg problems and lameness increasing in the second half of the flock — may indicate dark period deficiency'),
        bullet('Reduced feed intake compared to breed targets, especially in growers — can reflect inadequate light hours'),
        bullet('Layer hens failing to reach or maintain peak production on schedule'),

        heading2('What to Do'),
        bullet('Replace burned-out bulbs immediately — do not let dark zones persist'),
        bullet('Verify timer accuracy at each weekly check; controllers can drift or fail silently'),
        bullet('Use the breed management guide for your specific genetics as the primary reference for light schedules [1]'),
        bullet('For LED retrofit programs, confirm lux levels post-installation with a light meter'),
        bullet('Keep a log of light program changes so any production deviation can be correlated with management'),

        new Paragraph({ children: [new PageBreak()] }),

        // ── A: AIR ──────────────────────────────────────────
        heading1('A: Air'),
        heading2('Why Ventilation Matters'),
        para(
          'Ventilation is the most underestimated management factor in commercial poultry production. It is invisible, ' +
          'it requires constant adjustment, and when it fails, the birds absorb the consequences before most farmers ' +
          'notice the problem.',
        ),
        para(
          'The purpose of ventilation in a poultry barn is to remove heat, moisture, carbon dioxide, ' +
          'and ammonia, and to deliver fresh air at a temperature and speed appropriate to the birds\' age and ' +
          'stocking density [5]. Minimum ventilation must run continuously, even in cold weather. Shutting down ' +
          'fans in winter to save heating costs is one of the most common — and most damaging — management errors.',
        ),

        heading2('Key Air Quality Indicators'),
        para([rp('Ammonia (NH', { bold: true }), rp('3', { bold: true, verticalAlign: 'subscript' }), rp('):', { bold: true })]),
        para(
          'Ammonia is your most accessible air quality indicator. At concentrations above 10 ppm at bird level, ' +
          'ammonia is already reducing feed conversion efficiency and increasing susceptibility to respiratory disease [5]. ' +
          'Above 25 ppm, it causes permanent damage to the birds\' eyes and upper respiratory tract [5].',
        ),
        callout(
          'If you can smell ammonia when you enter the barn, your birds have been breathing concentrations ' +
          'above safe limits for longer than you have been aware. The rule: if you smell it, fix it today.',
        ),
        para([rp('Carbon Dioxide (CO', { bold: true }), rp('2', { bold: true, verticalAlign: 'subscript' }), rp('):', { bold: true })]),
        para(
          'CO2 concentration above 3,000 ppm indicates that minimum ventilation rate is insufficient for the ' +
          'current stocking density and bird size [1]. CO2 itself is not as acutely toxic as ammonia at these ' +
          'levels, but it is a reliable proxy for overall air freshness.',
        ),
        para([rp('Relative Humidity:', { bold: true })]),
        para(
          'Target relative humidity is 50 to 70%. Below 50%, dust becomes a respiratory irritant. ' +
          'Above 70%, litter moisture rises quickly, ammonia production accelerates, and footpad dermatitis ' +
          'rates increase [5].',
        ),
        imgPlaceholder(''),
        captionPara('Figure 4.1: Minimum ventilation schematic. Inlets and fans must be sized and positioned to ensure air reaches all areas of the barn.'),

        heading2('What Farmers See'),
        bullet('Persistent eye discharge or foam eyes — early sign of ammonia exposure'),
        bullet('Increased sneezing or head shaking — dust or ammonia irritation'),
        bullet('Birds gasping or showing open-mouth breathing that is not temperature-related'),
        bullet('Heavy, wet condensation on walls and ceiling — humidity too high, ventilation rate too low'),
        bullet('Dusty air that reduces visibility — dust particles are inflammatory to lung tissue'),
        bullet('Litter surface becoming wet or caked rapidly despite adequate temperature'),

        heading2('What to Do'),
        bullet('Check all fans for function and correct rotation direction at every visit'),
        bullet('Check inlet opening positions are correct for the outside temperature and wind conditions [1]'),
        bullet('Walk the full barn length to identify cold or stagnant zones at bird level'),
        bullet('Use an ammonia meter or test strips at bird level, not at standing height'),
        bullet('If ammonia is high, increase ventilation rate and check litter moisture before adjusting other parameters'),
        bullet('Service fans, controllers, and inlets on a scheduled maintenance calendar, not reactively'),

        new Paragraph({ children: [new PageBreak()] }),

        // ── W: WATER ────────────────────────────────────────
        heading1('W: Water'),
        heading2('Why Water Matters'),
        para(
          'Water is the most important nutrient in poultry production. Broilers consume approximately 1.7 to 1.8 ' +
          'times more water than feed by volume at comfortable temperatures, and this ratio can double during heat ' +
          'stress [2]. Any restriction in water access immediately limits feed intake, which then limits growth.',
        ),
        para(
          'A bird that cannot access clean water within 30 seconds of looking for it will start to reduce its feed ' +
          'intake within hours. The effect compounds over days. Water restriction is a more immediate production ' +
          'threat than most visible welfare issues.',
        ),

        heading2('What to Check'),
        para('On every barn walk, check:'),
        bullet('Nipple drinkers: are they flowing? Activate several along each line to confirm'),
        bullet('Pressure: a dripping line wets the litter; a line with no pressure means birds cannot drink'),
        bullet('Line height: nipples should be positioned so birds drink with their head raised at approximately 45 degrees [2]'),
        bullet('Water temperature: cool water (approximately 10 to 14°C at the drinker) encourages consumption [2]'),
        bullet('Water consumption: if your system tracks daily water use via meters, compare to breed targets'),
        bullet('Line cleanliness: biofilm inside drinker lines reduces water quality and can carry pathogens [2]'),

        para(
          'The Aviagen Water Quality guidelines outline acceptable parameters for water delivered to the drinker: ' +
          'pH between 6.0 and 8.0, total dissolved solids below 1,000 ppm, and total coliform count of zero ' +
          'at the point of use [2]. Water that meets these standards at the well or header tank can still fail at ' +
          'the drinker if lines are not maintained.',
        ),

        imgPlaceholder(''),
        captionPara('Figure 5.1: Nipple drinker line height adjustment by bird age. Line height must increase as birds grow to maintain correct drinking angle.'),

        heading2('What Farmers See'),
        bullet('Birds gathered at drinkers and waiting — indicates inadequate flow or pressure'),
        bullet('Water pooling under drinker lines — overpressure, causing wet litter'),
        bullet('Increased pecking behavior and early aggression — often a sign of water competition'),
        bullet('Reduced feed consumption without obvious cause — check water access first'),
        bullet('Wet litter concentrated under drinker lines while areas around feeders remain dry'),
        bullet('Yellow-tinged or viscous droppings — can indicate dehydration'),

        heading2('What to Do'),
        bullet('Flush drinker lines at the start of each flock and regularly during production [2]'),
        bullet('Use a line-sanitization protocol appropriate to your water source, following your veterinarian\'s guidance'),
        bullet('Adjust drinker height weekly to match bird growth [2]'),
        bullet('Test water quality at the drinker at least once per flock — not just from the header tank'),
        bullet('If flow rate is low, check the regulator, filter, and line for blockages or biofilm buildup'),
        bullet('Record daily water consumption and flag any day-over-day drop of more than 10%'),

        new Paragraph({ children: [new PageBreak()] }),

        // ── S: SANITATION & SPACE ────────────────────────────
        heading1('S: Sanitation & Space'),
        heading2('Litter Management'),
        para(
          'Litter is not just bedding. It is a living system that generates heat, moisture, ammonia, and pathogens ' +
          'if not managed correctly. Wet litter affects temperature (T), air quality (A), and water management (W) ' +
          'simultaneously. Getting litter right is the foundation everything else builds on.',
        ),
        para(
          'Target litter moisture is below 30%. Above this level, footpad dermatitis rates rise significantly, ' +
          'ammonia production accelerates, and gut health problems including necrotic enteritis become more likely [7]. ' +
          'Good litter is loose, friable, and uniformly light in color. Problem litter is wet, dark, caked, ' +
          'and smells strongly of ammonia.',
        ),
        para('Causes of wet litter include:'),
        bullet('Water leaks from drinker lines or pressure regulators'),
        bullet('Inadequate ventilation and high relative humidity'),
        bullet('High dietary sodium or high water intake from disease or diet'),
        bullet('Over-stocking relative to ventilation capacity'),
        bullet('Insufficient litter depth or poor litter material at placement'),

        callout(
          'Walk the perimeter as well as the center. Litter problems often start along the walls and near ' +
          'water lines before spreading. Catching wet spots early costs you ten minutes. Ignoring them costs ' +
          'you footpad scores, condemnations, and AMR risk from over-antibiotic use.',
        ),

        heading2('Stocking Density'),
        para(
          'Stocking density affects every other T-FLAWS point. Higher density means more heat produced per square ' +
          'meter, more moisture, more ammonia, more competition for feed and water, and less space for each bird ' +
          'to express normal behavior.',
        ),
        para(
          'The National Farm Animal Care Council (NFACC) Code of Practice for the Care and Handling of Hatching ' +
          'Eggs, Breeders, Chickens, and Turkeys sets the standards for commercial broiler production in Canada. ' +
          'Under conventional programs, the maximum stocking density is 31 kg per square meter live weight. Programs ' +
          'with enhanced welfare auditing allow up to 38 kg per square meter [4].',
        ),
        para(
          'These are maximums, not targets. Stocking below the maximum gives your ventilation system more capacity ' +
          'to handle the inevitable hot days, equipment failures, and unexpected health challenges that occur in ' +
          'any commercial flock.',
        ),

        ...photo(houseImg, 6.0, 3.5, 'Photo 2.1: Commercial broiler barn interior. Litter condition and bird distribution are visible at a glance during a barn walk.'),

        heading2('What Farmers See'),
        para([rp('Signs of litter problems:', { bold: true })]),
        bullet('Dark, wet, or caked patches on the floor, especially under drinker lines and near walls'),
        bullet('Strong ammonia smell at bird level during the barn walk'),
        bullet('Birds with visibly reddened or eroded footpads — early footpad dermatitis'),
        bullet('Litter sticking to the skin around the bird\'s feet and legs'),
        para([rp('Signs of overcrowding:', { bold: true })]),
        bullet('Visible competition at feeders and drinkers — birds cannot access resources without displacing others'),
        bullet('Increased aggression, feather-pecking, or piling behavior'),
        bullet('Rapid deterioration of litter quality as bird size increases'),
        bullet('Greater-than-expected mortality in the second half of the flock'),

        heading2('What to Do'),
        bullet('Perform daily litter checks, walking the full barn length and perimeter'),
        bullet('Correct water leaks immediately — wet litter from a dripping nipple worsens faster than you expect'),
        bullet('Apply litter amendment products if recommended by your veterinarian and in line with your production protocol'),
        bullet('Ensure full cleanout, disinfection, and dry-down are completed between flocks [7,8]'),
        bullet('Do not place a new flock until litter and environment meet your pre-placement targets [7]'),
        bullet('Maintain stocking densities within NFACC limits and adjust for seasonal conditions [4]'),

        new Paragraph({ children: [new PageBreak()] }),

        // ── SYSTEM ──────────────────────────────────────────
        heading1('Using T-FLAWS as a System'),
        para(
          'The power of T-FLAWS is not in any single point. It is in using all six together, in the same order, ' +
          'every time you enter a barn.',
        ),
        para('The points do not operate in isolation. They amplify each other:'),
        bullet('Cold temperatures cause birds to crowd under heat sources, wetting litter — S problem caused by T'),
        bullet('High ammonia from wet litter drives birds toward cool wall areas away from feed — F problem caused by A and S'),
        bullet('Inadequate ventilation raises humidity, worsens litter, raises ammonia — A causes both S and A to deteriorate together'),
        bullet('Restricted water causes feed intake to fall — W drives F'),
        para(
          'When one T-FLAWS point is failing, look for the others that may already be affected. A systematic ' +
          'check takes ten to fifteen minutes. A reactive response to a production problem that built up over ' +
          'a week of missed checks can cost you an entire flock.',
        ),
        callout(
          'The best T-FLAWS users do not use the checklist to find problems. They use it to prevent them. ' +
          'By the time a problem is visible in your birds, it has been building in your management for days.',
        ),
        para(
          'Record your observations at every check. A written record gives you the pattern. And the pattern ' +
          'tells you where your next problem is most likely to come from before it arrives.',
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ── WHERE TO KEEP LEARNING ───────────────────────────
        heading1('Where to Keep Learning'),
        heading2('Key Scientific Journals'),
        bullet('Poultry Science — American industry\'s leading peer-reviewed research journal (poultryScience.org)'),
        bullet('World\'s Poultry Science Journal — WPSA journal covering global production and welfare research'),
        bullet('Canadian Journal of Animal Science — covers Canadian-specific production conditions and regulations'),
        bullet('Animals — open-access journal covering welfare and management applied research'),

        heading2('Key Institutional Resources'),
        bullet('Canadian Poultry Consultants (CPC) Learning Centre — canadianpoultry.ca/learning-centre/ — Technical Bulletins, Disease Profiles, Flock Management resources'),
        bullet('Aviagen Resource Centre — aviagen.com — Ross and ArborAcres breed management handbooks, water quality and biosecurity guides'),
        bullet('National Farm Animal Care Council (NFACC) — nfacc.ca — Codes of Practice for all Canadian poultry species'),
        bullet('Canadian Food Inspection Agency (CFIA) — inspection.canada.ca — Biosecurity standards for commercial poultry'),
        bullet('Poultry Industry Council (PIC) — poultryindustrycouncil.ca — Canadian production data and extension resources'),

        new Paragraph({ children: [new PageBreak()] }),

        // ── REFERENCES ───────────────────────────────────────
        heading1('References'),
        para('References are cited in order of appearance in this course.'),
        new Paragraph({ spacing: { before: 120, after: 80 }, children: [
          rp('[1]  Aviagen. ', { bold: true }), rp('Ross Broiler Management Handbook. '),
          rp('Aviagen Group Ltd., Huntsville, AL, USA, 2025.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          rp('[2]  Aviagen. ', { bold: true }), rp('Water Quality in Poultry Production. '),
          rp('Aviagen Group Ltd., Huntsville, AL, USA, 2025.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          rp('[3]  Bell, D.D., Weaver, W.D. (eds). ', { bold: true }),
          rp('Commercial Chicken Meat and Egg Production, 5th edition. '),
          rp('Springer Science & Business Media, New York, 2002.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          rp('[4]  National Farm Animal Care Council (NFACC). ', { bold: true }),
          rp('Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys. '),
          rp('NFACC, Lacombe, AB, Canada, 2016.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          rp('[5]  Pottguter, R. ', { bold: true }),
          rp('Poultry Signals: A Practical Guide for Poultry Farming. '),
          rp('Roodbont Publishers, Zutphen, Netherlands, 2009.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          rp('[6]  Daghir, N.J. (ed). ', { bold: true }),
          rp('Poultry Production in Hot Climates, 2nd edition. '),
          rp('CABI, Wallingford, UK, 2008.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          rp('[7]  Aviagen. ', { bold: true }),
          rp('Best Practices in Biosecurity for Ross Broiler Operations. '),
          rp('Aviagen Group Ltd., Huntsville, AL, USA.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          rp('[8]  Canadian Food Inspection Agency (CFIA). ', { bold: true }),
          rp('Biosecurity Guide for Commercial Poultry Production. '),
          rp('CFIA, Ottawa, ON, Canada.'),
        ]}),
        new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          rp('[9]  CPC Learning Centre. ', { bold: true }),
          rp('T-FLAWS Barn Entry Framework. '),
          rp('Canadian Poultry Consultants Ltd., Canada. [Developed by Mike and Dr. Stew, CPC Learning Centre.]'),
        ]}),
      ],
    },
  ],
});

// ── Build initial file ────────────────────────────────────────
console.log('Building document...');
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buf);
console.log('Initial file written. Applying post-build patches...');

// ── POST-BUILD PATCH ──────────────────────────────────────────
const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tocRow(e) {
  const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
  const indent    = e.lvl === 1 ? 0 : 220;
  const text      = escapeXml(e.text);
  return (
    '<w:p><w:pPr>' +
      `<w:pStyle w:val="${styleName}"/>` +
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

const cachedRows = entriesWithAnchor.map(tocRow).join('');

// 1. Patch document.xml
let docXml = await outZip.file('word/document.xml').async('string');
const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  sdt = sdt.replace(/\sw:dirty="true"/g, '');
  sdt = sdt.replace(
    /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
    `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`
  );
  docXml = docXml.replace(sdtMatch[0], sdt);
}
docXml = docXml.replace(/\sw:dirty="true"/g, '');

// 2. Inject bookmarks around headings
const norm = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
let entryIdx = 0;
let bookmarkId = 1000;
const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
docXml = docXml.replace(headingRegex, (match, lvlStr) => {
  if (entryIdx >= entriesWithAnchor.length) return match;
  const lvl = Number(lvlStr);
  const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
  const heading = textRuns.trim();
  const entry = entriesWithAnchor[entryIdx];
  if (lvl !== entry.lvl) return match;
  if (norm(heading) !== norm(entry.text)) return match;
  entryIdx++;
  const id = bookmarkId++;
  return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
});
if (entryIdx !== entriesWithAnchor.length) {
  console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries.`);
  console.warn('Unmatched:', entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | '));
}
outZip.file('word/document.xml', docXml);

// 3. settings.xml: updateFields=false
let settings = await outZip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
settings = settings.replace(
  '<w:displayBackgroundShape/>',
  '<w:displayBackgroundShape/><w:updateFields w:val="false"/>',
);
if (!settings.includes('<w:updateFields')) {
  settings = settings.replace('</w:settings>', '<w:updateFields w:val="false"/></w:settings>');
}
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

// 5. Sanity check
const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
if (dirtyLeft > 0) throw new Error(`Still ${dirtyLeft} w:dirty flags — dialog will appear`);

const bookmarks  = (docXml.match(/<w:bookmarkStart/g) || []).length;
const hyperlinks = (docXml.match(/<w:hyperlink/g) || []).length;
console.log(`w:dirty remaining: ${dirtyLeft} (must be 0)`);
console.log(`TOC bookmarks: ${bookmarks}, hyperlinks: ${hyperlinks} (both should equal ${entriesWithAnchor.length})`);

// 6. Write final
const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
console.log(`\nDone. Output: ${OUT_FILE}`);
console.log('Open in Word. Click Yes on the field dialog, then Ctrl+S to cache it permanently.');
