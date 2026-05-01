// ============================================================
// generate-course5.mjs — Course 5: Sustainability in Poultry Farming
// CPC Short Courses
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course5.mjs
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
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  HeadingLevel,
  LevelFormat,
  TableOfContents,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 5');
const OUT_FILE  = path.join(OUT_DIR, 'Sustainability_in_Poultry_Farming_draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

// ============================================================
// COLORS
// ============================================================
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

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

function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({
        text:    seg.text,
        bold:    seg.bold    || false,
        italics: seg.italics || false,
        color:   seg.color   || BODY_GRAY,
        size:    seg.size    || 24,
        font:    'Calibri',
      }))
    : [run(text, { bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })];
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
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });
}

function bullet(text, lvl = 0) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY_GRAY, size: 24, font: 'Calibri' }))
    : [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}

function numbered(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })],
    numbering: { reference: 'numbered-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Gray placeholder table for figures
function placeholder(caption, description) {
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: description || '[Image to be supplied]', color: '888888', size: 22, font: 'Calibri', italics: true })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: convertInchesToTwip(0.4), after: convertInchesToTwip(0.4) },
                }),
              ],
              shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
              borders: {
                top:    { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                left:   { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                right:  { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
              },
              margins: {
                top:    convertInchesToTwip(0.3),
                bottom: convertInchesToTwip(0.3),
                left:   convertInchesToTwip(0.2),
                right:  convertInchesToTwip(0.2),
              },
            }),
          ],
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 240 },
    }),
  ];
}

// Embedded PNG figure + italic caption
function image(buf, caption, widthIn = 5.8) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.6);
  try {
    const view = new DataView(buf.buffer, buf.byteOffset);
    const pw   = view.getUint32(16, false);
    const ph   = view.getUint32(20, false);
    if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'png' })],
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

// ============================================================
// HEADER / FOOTER
// ============================================================
function buildHeader() {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ text: 'Sustainability in Poultry Farming', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
        ],
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
      }),
    ],
  });
}

function buildFooter() {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'CPC Short Courses  |  Course 5  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ children: [PageNumber.CURRENT], color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ text: ' of ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], color: '888888', size: 18, font: 'Calibri' }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
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
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),

    // Line 1: Course label
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 5: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
  ];

  // CPC Logo
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
        spacing: { before: 200, after: 200 },
      })
    );
  }

  children.push(
    // Course title
    new Paragraph({
      children: [new TextRun({ text: 'Sustainability in Poultry Farming', bold: true, color: DARK_BLUE, size: 56, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    }),

    // Subtitle
    new Paragraph({
      children: [new TextRun({ text: 'Practical Strategies for a Profitable and Responsible Farm', color: MED_BLUE, size: 28, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 560 },
    }),

    // Gold horizontal rule
    new Paragraph({
      children: [new TextRun({ text: '', color: GOLD })],
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
      spacing: { before: 0, after: 400 },
    }),

    // Metadata: CPC Short Courses
    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    // Duration
    new Paragraph({
      children: [new TextRun({ text: 'Duration: 2 Hours', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),

    // Date
    new Paragraph({
      children: [new TextRun({ text: 'May 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
    }),

    // Disclaimer
    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature, industry management guides, and regulatory documents. This material does not replace the advice of a licensed veterinarian, agronomist, or regulatory authority.', color: '808080', size: 18, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
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
// TABLE OF CONTENTS
// ============================================================
function buildTocSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', { headingStyleRange: '1-3' }),
    ],
  };
}

// ============================================================
// INTRODUCTION
// ============================================================
function buildIntroSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Introduction'),
      para('Sustainability in poultry farming is not a program you buy or a certification you hang on the wall. It is the way you run the operation every day. It means raising birds in a way that protects the land, keeps the flock healthy, and keeps the farm profitable not just this cycle, but ten and twenty years from now. Demand for poultry is rising, feed costs are climbing, and the pressure to manage waste and protect water and air is only going to increase [1,2]. The farmers who understand how to get more out of every bag of feed, every liter of water, and every kilowatt of electricity are the ones who will still be farming when all of this gets harder.'),
      para('That is what this course is about. Not expensive technology or complicated programs. Practical, low-cost decisions that most farmers can act on right now. Some of them will save money directly, by cutting feed waste or reducing your heating bill. Some will protect the farm from regulatory or community problems down the road. And some will help you build the kind of operation that is easier to hand off to the next generation or to scale up when the opportunity comes.'),
      para('By the end of this course, you will be able to look at your own barn, your own records, and your own numbers and identify where the biggest gaps are. Then you will know exactly what to do about them.'),
      h2('Learning Objectives'),
      para('By completing this course, you will be able to:'),
      bullet('Understand the meaning of sustainability and why it is important for the long-term success of poultry farming.'),
      bullet('Identify sustainable farming practices that reduce waste, save money, and protect the environment.'),
      bullet('Recognize the impact of poultry production on soil, water, air, and local communities.'),
      bullet('Use resources more efficiently, including feed, water, energy, and housing materials.'),
      bullet('Apply proper manure management techniques to improve soil health and reduce pollution.'),
      bullet('Adopt healthier flock management practices that support animal welfare and reduce losses.'),
      bullet('Explore renewable energy options, such as solar or biogas, suitable for a poultry farm.'),
      bullet('Evaluate your own farm operations and identify simple changes to improve sustainability.'),
      bullet('Understand the benefits of sustainability, including lower costs, higher productivity, and better market acceptance.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 1: ENVIRONMENTAL IMPACT
// ============================================================
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 1: Environmental Impact of Poultry Farming'),
      para('Commercial poultry production is one of the most efficient ways to convert plant-based feed into high-quality animal protein. The feed-conversion numbers for broilers are the envy of the red-meat sector [4,5]. But the scale of the industry means that even small inefficiencies, at a flock level, add up to significant environmental pressure when you multiply them across millions of birds. Understanding where that pressure comes from is the first step toward managing it [1,2].'),

      h2('1.1  Understanding the Environmental Footprint'),
      para('Global livestock agriculture contributes roughly 14.5% of all human-caused greenhouse gas emissions, and the poultry sector accounts for about 8% of that total [2]. On a per-kilogram-of-protein basis, poultry compares well against beef, pork, and lamb. A life cycle assessment of broiler production in the United Kingdom found that broilers produce considerably less greenhouse gas per kilogram of product than most red meat species [13]. But comparing favorably to beef does not mean the footprint is negligible, especially when total Canadian production volumes are factored in.'),
      para('The main environmental concerns in commercial poultry farming are not exotic or hard to identify. They come down to three things: what goes into the birds (feed, water, energy), what comes out (manure, ammonia, wastewater), and how both sides of that equation interact with the land, water, and air around your farm [1].'),
      ...image(figBuf('fig1_1.png'), 'Figure 1.1: Environmental footprint of a commercial broiler farm. Major inputs (feed, water, energy, chicks) flow through the production system; outputs include saleable meat, manure with fertilizer value, ammonia and GHG emissions, and wastewater that requires management to prevent contamination.'),

      h2('1.2  Water: Use and Contamination Risk'),
      para('Water is used in two ways on a poultry farm: the birds drink it, and the farm uses it for cleaning and cooling. Broilers consume roughly 1.7 to 2.0 times their feed intake by weight in water, and that ratio climbs sharply in hot weather [7]. A 20,000-bird broiler barn at peak consumption can use tens of thousands of liters per day. That is not a small number, and in regions where groundwater or municipal water costs are rising, it matters to the bottom line.'),
      para('The bigger risk, though, is what happens to the water that leaves the farm. Runoff from litter storage areas, uncovered manure piles, and land application sites can carry nitrogen, phosphorus, and pathogens into nearby streams, ditches, and groundwater [1]. Phosphorus from over-applied litter does not flush out of soil quickly. It accumulates, and once it reaches a waterway it drives algal growth that depletes oxygen and kills fish. Many provincial environmental regulations now require buffer zones, setback distances from water courses, and nutrient management planning for exactly this reason.'),
      para('Leaking drinker lines inside the barn are also a water management problem. A single loose nipple connection can drip hundreds of liters per day without anyone noticing, and wet litter is one of the most common and expensive problems in broiler production. The connection between poor water management inside the barn and poor litter quality outside is direct [7,12].'),

      h2('1.3  Soil: Nutrients, Runoff, and Land Management'),
      para('Poultry manure is one of the most nitrogen- and phosphorus-dense organic materials available to Canadian crop farmers [3]. Handled well, it is a genuine asset. A typical broiler litter analysis will show 2.5 to 4.0 percent nitrogen, 1.5 to 3.0 percent phosphorus pentoxide, and similar levels of potassium on a dry-weight basis [3]. Applied at the right rate to the right fields at the right time, litter reduces fertilizer costs, improves soil organic matter, and builds long-term soil health.'),
      para('Handled badly, those same nutrients become a liability. Over-application leads to nitrogen leaching into groundwater and phosphorus buildup in the soil that eventually reaches waterways. Surface applications before rain events can cause direct runoff. And applying to frozen or saturated ground can move nutrients into drainage systems with very little uptake by the crop [1]. The solution is a nutrient management plan based on actual manure analysis, matched to crop removal rates and soil test results. This does not have to be complicated, but it does have to be done.'),

      h2('1.4  Air Quality: Ammonia, Dust, and Odor'),
      para('Ammonia is the most significant air pollutant from commercial poultry operations, and it affects you, your birds, and your neighbors [8]. Inside the barn, ammonia above 25 parts per million (ppm) starts to damage the respiratory mucosa of birds, increasing susceptibility to respiratory disease. Above 50 ppm, it is a welfare concern and a direct production problem [6]. You usually smell ammonia well before it reaches those levels, but chronic low-level exposure in workers is also a health concern over time.'),
      para('Outside the barn, ammonia emissions contribute to acid deposition and ecosystem nitrogen loading. Ammonia from agriculture is a recognized contributor to fine particulate formation in the atmosphere [8]. Communities near large poultry operations frequently cite odor as a quality-of-life issue, and in some regions this has driven regulatory tightening on stocking density, manure storage, and land application timing.'),
      para('Dust from dry litter and feathers carries bacteria, endotoxins, and other bioactive compounds that can travel beyond the barn perimeter. Good litter management reduces dust generation at the source, but controlling it entirely is difficult. Proper ventilation management is the main tool available in a commercial barn [9,11].'),
      ...image(figBuf('fig1_2.png'), 'Figure 1.2: Ammonia in the broiler barn. Manure urea is converted to NH3 by urease enzymes. High litter moisture, elevated temperature, and poor ventilation accelerate production. Impacts range from respiratory damage in birds at greater than 25 ppm to community odor issues and ecosystem nitrogen loading beyond the barn.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 2: EFFICIENT USE OF RESOURCES
// ============================================================
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 2: Efficient Use of Resources'),
      para('Resource efficiency and sustainability are the same thing from a financial perspective. Every kilogram of feed that does not become bird weight is a direct financial loss. Every liter of water that leaks before a bird drinks it is wasted input cost. Every hour your heaters run longer than needed because cold air is infiltrating through a gap in the barn wall is money you paid for nothing. Improving resource efficiency is not an environmental gesture. It is the core of a profitable operation [4,5].'),

      h2('2.1  Reducing Feed Waste'),
      para('Feed represents 60 to 70 percent of the total cost of broiler production [5]. That single number explains why feed efficiency is the most watched metric in the industry, and why even small improvements in feed conversion ratio (FCR) show up directly in profitability. A 0.1-point improvement in FCR on a 20,000-bird barn running at good feed prices represents a meaningful reduction in cost per kilogram of gain.'),
      para('Feed waste comes from several specific places, and most of them are fixable without capital expense:'),
      bullet([{ text: 'Feeder height: ', bold: true }, { text: 'The most common waste point in broiler barns. Feeders set too low allow birds to scratch feed out. Feeders set too high cause birds to strain and spill. Adjust feeder height to the shoulder level of the birds weekly throughout the grow-out [4,11].' }]),
      bullet([{ text: 'Wet feed under drinkers: ', bold: true }, { text: 'Leaking nipples drip water into the feed pan below, creating wet, moldy feed that birds avoid. Check drinker lines daily in the first week and after any pressure adjustment.' }]),
      bullet([{ text: 'Rodent access to feed: ', bold: true }, { text: 'Rats and mice do not just eat feed. They contaminate far more than they consume. A single active rodent infestation can account for hundreds of kilograms of feed loss per cycle, plus pathogen introduction risk.' }]),
      bullet([{ text: 'Phase feeding: ', bold: true }, { text: 'Matching feed nutrient density to the growth phase of the flock reduces the overfeeding of expensive amino acids and phosphorus in later grow-out stages. Most integrators now provide phase-feeding schedules; follow them [5].' }]),
      bullet([{ text: 'Feed storage integrity: ', bold: true }, { text: 'Moisture intrusion into bins causes caking, mold, and mycotoxin formation that reduces feed intake and bird performance. Inspect bin seals and aeration systems between cycles.' }]),
      para('Tracking feed delivery dates and tonnage against performance records gives you a clear picture of where your FCR sits relative to flock targets. If the number is drifting, find the source before the next placement.'),

      h2('2.2  Water-Saving Practices'),
      para('Water efficiency in a poultry barn is mostly about drinker management and leak detection. Nipple drinker systems are more water-efficient than bell drinkers when maintained correctly, but a nipple system with poor pressure regulation or worn seals can leak just as badly as an open-water system [7].'),
      bullet([{ text: 'Line pressure: ', bold: true }, { text: 'Maintain nipple drinker line pressure within the range recommended by your equipment supplier, typically 15 to 25 psi for most nipple types. Excess pressure causes dripping; insufficient pressure reduces intake in hot weather [7].' }]),
      bullet([{ text: 'Water meters: ', bold: true }, { text: 'Install a meter on every barn and read it at the same time every day, at minimum during the first week of placement and during hot weather. A sudden increase in daily consumption signals a leak or a sick flock before mortality numbers go up [7].' }]),
      bullet([{ text: 'Line flushing and cleaning: ', bold: true }, { text: 'Biofilm builds inside drinker lines over the course of a flock cycle. Salmonella and other pathogens survive inside it through a normal flush. Properly clean lines between every flock with an approved acid or enzyme product to break down biofilm and restore water quality [7].' }]),
      bullet([{ text: 'Cleaning water use: ', bold: true }, { text: 'Pressure washing between flocks uses significant water. Where possible, dry-clean first to remove the bulk of litter and debris before water is applied. This reduces total cleaning water needed and improves wash effectiveness.' }]),
      para('A barn that tracks daily water consumption per bird is a barn where leaks do not go undetected for weeks. The cost of a meter and five minutes of daily reading is paid back the first time it catches a drinker problem before it damages the litter and the flock.'),

      h2('2.3  Smart Energy Use on the Farm'),
      para('Heating and ventilation together make up the largest share of energy costs in a broiler operation, and both have significant room for efficiency improvement without major capital expenditure [9].'),
      bullet([{ text: 'Brooder management: ', bold: true }, { text: 'Pre-heat the barn and bring floor temperature to target before chick arrival. A barn that is too cold on day one costs more to heat through the whole grow-out because early chilling suppresses immune development and starter performance [4].' }]),
      bullet([{ text: 'Minimum ventilation programs: ', bold: true }, { text: 'In cold weather, minimum ventilation is not optional. It removes moisture that condenses in litter and insulation, protects air quality for the birds, and prevents ammonia accumulation. Cutting ventilation to save heat almost always costs more in wet litter management and performance losses than it saves in gas [9].' }]),
      bullet([{ text: 'Lighting: ', bold: true }, { text: 'LED lighting draws 50 to 80 percent less power than incandescent bulbs for the same lux output, and modern LED systems designed for poultry are dimmable and last several years without replacement. Payback on a full LED conversion is typically within a few production cycles [NEEDS SOURCE].' }]),
      bullet([{ text: 'Barn insulation: ', bold: true }, { text: 'Insulation gaps and deteriorated vapor barriers are common in older barns. Infrared thermography between flocks can identify where heat is escaping. Sealing and re-insulating concentrated problem areas is far cheaper than continuously compensating with higher heater output.' }]),
      bullet([{ text: 'Variable-speed fans: ', bold: true }, { text: 'Fixed-speed fans run at full power or not at all. Variable-speed fan controllers reduce energy consumption during mild weather when full ventilation capacity is not needed. The energy savings over a full year are significant in climates with mild spring and fall seasons.' }]),
      ...image(figBuf('fig2_1.png'), 'Figure 2.1: Resource efficiency in a commercial broiler barn. For each of the three major inputs (feed, water, energy), the diagram contrasts common waste points against actionable efficiency measures. Every resource saved per kilogram of gain is a direct cost reduction.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 3: MANURE AND WASTE MANAGEMENT
// ============================================================
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 3: Manure and Waste Management'),
      para('Manure is the most visible byproduct of poultry production, and how you manage it determines whether it becomes an asset or a liability. Handled well, poultry litter is one of the most nutrient-dense organic fertilizers available to Canadian crop farmers. Handled poorly, it is a source of water contamination, air quality complaints, and regulatory problems [1,3]. The difference between those two outcomes is mostly a matter of planning and timing.'),

      h2('3.1  Turning Manure into Fertilizer'),
      para('A typical broiler barn running 20,000 birds on a 6 to 8-week cycle will produce 50 to 80 tonnes of litter per cycle, depending on litter depth, moisture content, and the number of flocks built up on the litter [3,5]. Broiler litter, after composting or dry storage, typically analyzes at 2.5 to 4.0 percent total nitrogen, 1.5 to 3.0 percent phosphorus pentoxide, and similar potassium levels on a dry-weight basis [3]. At current synthetic fertilizer prices, properly utilized litter has real agronomic value that reduces fertilizer costs for the fields it goes on and builds long-term soil health.'),
      para('The key steps to making that work:'),
      bullet([{ text: 'Get a manure analysis done: ', bold: true }, { text: 'Nutrient content varies widely between flocks depending on feed formulation, litter type, flock age, and moisture. Without an actual analysis, you are guessing at application rates. Most provincial labs and many commercial labs offer manure analysis at low cost.' }]),
      bullet([{ text: 'Develop a nutrient management plan: ', bold: true }, { text: 'Match the application rate to what the crop will actually remove. Over-application does not grow a better crop. It just puts excess nutrients where rain can move them into water.' }]),
      bullet([{ text: 'Apply at the right time: ', bold: true }, { text: 'Fall application on bare soil before freeze-up is the least efficient approach in terms of nutrient retention. Spring pre-plant application or incorporation into a growing crop maximizes nutrient uptake and reduces losses [1].' }]),
      bullet([{ text: 'Maintain application records: ', bold: true }, { text: 'Date, field, volume, analysis result, and weather conditions at application. Many provinces now require these records, and they protect you if a neighbor complains about runoff.' }]),

      h2('3.2  Reducing Pollution and Managing Odors'),
      para('Odor and ammonia from litter storage and land application are the most common sources of neighbor complaints against poultry operations in Canada. Managing these issues is both a regulatory compliance matter and a community relations matter [8]. A few practical steps make a real difference:'),
      bullet([{ text: 'Cover stored litter: ', bold: true }, { text: 'Open litter piles generate ammonia continuously and provide an ideal environment for flies. Cover piles with tarps or move litter quickly to a covered storage facility. A covered pile has significantly lower odor and nitrogen loss than an exposed pile [3].' }]),
      bullet([{ text: 'Compost before land application: ', bold: true }, { text: 'Composting raw litter reduces pathogens, cuts odor during application, and stabilizes nutrients to reduce ammonia volatilization from the field surface [3]. Well-composted litter is also easier to spread uniformly.' }]),
      bullet([{ text: 'Litter amendments: ', bold: true }, { text: 'Products such as alum (aluminum sulfate) and acidifying amendments reduce ammonia volatilization in the barn and reduce phosphorus solubility in the litter. Reduced barn ammonia means better air quality, better litter, and better bird performance [12].' }]),
      bullet([{ text: 'Buffer zones: ', bold: true }, { text: 'Maintain setback distances from water courses, drainage tiles, wells, and property lines as required by provincial environmental regulations. These are not optional. Violations carry financial penalties and can restrict future operations.' }]),
      bullet([{ text: 'Inform neighbors: ', bold: true }, { text: 'Before a major land application event, let nearby residences know in advance. It sounds simple, but it prevents most of the complaints that escalate into regulatory inspections.' }]),

      h2('3.3  Safe Storage and Handling'),
      para('Litter that is stored correctly is a managed resource. Litter that is left in poor conditions becomes a source of pathogen spread, fly breeding, and nutrient runoff. The basics of safe storage are not complicated, but they need to be built into your routine between flocks [1,3]:'),
      bullet('Store litter away from surface water, drainage tiles, and ground-water wells. A minimum 15- to 30-meter setback from any water body is a starting point; provincial regulations may require more.'),
      bullet('Do not store litter on frozen ground where runoff cannot be absorbed. If the litter has to move before the ground is ready, covered temporary storage is better than an uncovered pile on frozen soil.'),
      bullet('Remove dead birds promptly, every day, and follow provincial regulations for disposal. Composting is the preferred on-farm method where it is permitted; the mortality compost area should be separate from litter storage and well away from barn entries.'),
      bullet('Clean and re-grade the area around litter storage annually to prevent water from pooling and running into the pile or toward water courses.'),
      ...image(figBuf('fig3_1.png'), 'Figure 3.1: Closed-loop manure management cycle for a commercial broiler farm. Well-managed litter moves from removal through covered storage, nutrient analysis, optional composting, and matched land application to maximize crop nutrient recovery and minimize environmental risk.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 4: ANIMAL WELFARE AND FLOCK HEALTH
// ============================================================
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 4: Animal Welfare and Flock Health'),
      para('A sick bird is the least sustainable thing on a poultry farm. It consumes feed and water without converting them efficiently, it may require medication that costs money and limits market options, and if it dies it represents a total input loss. Welfare and sustainability are not separate agendas. They point toward the same management decisions [6,11].'),

      h2('4.1  Healthy Birds as a Sustainability Pillar'),
      para('In a commercial broiler barn, mortality and condemnation rates are the most direct measures of how well the flock is being managed. Condemnations at the plant represent birds that were raised to slaughter weight but could not be sold. Mortality over about 3 to 4 percent is a signal that something in the management chain needs attention, whether that is biosecurity, nutrition, water quality, ventilation, or disease pressure [4,6].'),
      para('Preventive health management reduces the need for antibiotics, which matters increasingly because antimicrobial resistance (AMR) is changing the regulatory environment for livestock production. Canada has progressively restricted medically important antibiotic use in food animals, and those restrictions will continue to tighten [10]. Farms that have reduced antibiotic dependence through better management are already better positioned for what is coming. The farms that have not will face compliance costs and potential market access restrictions that are avoidable if the underlying management issues are addressed now.'),
      para('Good biosecurity is the foundation. It keeps new pathogens out of the barn and prevents cross-contamination between flocks and between neighboring operations. It does not require expensive equipment. It requires consistent habits: dedicated footwear, controlled access, downtime between farm visits, and a dead-bird disposal system that does not create a pathogen reservoir near the barn [6].'),

      h2('4.2  Housing and Ventilation'),
      para('Ventilation is the single most important management system in a broiler barn for litter quality, air quality, and bird welfare. The goal of a minimum ventilation program in cold weather is not complicated: move enough air to remove the moisture the birds produce, while keeping the barn warm enough for performance [9]. That balance point is not the same every day. It changes with outside temperature, bird age, stocking density, and litter condition.'),
      para('The target for litter moisture is 20 to 25 percent. Above 30 percent, you start to see the consequences: footpad dermatitis, breast blisters, increased ammonia, and a higher disease burden [12]. Footpad dermatitis in particular is a welfare and commercial quality issue. Severe footpad scoring at the plant reduces carcass value and reflects directly on your management record. By the time you see bad pads at the plant, the litter problem that caused them has already been affecting your birds for weeks.'),
      para('What drives litter moisture up:'),
      bullet('Insufficient minimum ventilation, especially in the first two weeks of a flock cycle'),
      bullet('Drinker leaks, particularly at nipple connections and pressure regulator fittings'),
      bullet('Birds with enteric disease that causes wet droppings'),
      bullet('High stocking density relative to ventilation capacity'),
      bullet('Cool, damp weather with inadequate heating to maintain barn temperature target'),
      para('What brings it down:'),
      bullet('Increasing minimum ventilation rate (even at the cost of some heat)'),
      bullet('Running the barn slightly warmer to increase the moisture-carrying capacity of the air'),
      bullet('Fixing drinker leaks immediately when discovered'),
      bullet('Using a litter amendment to slow moisture absorption and ammonia release during high-risk periods [12]'),

      h2('4.3  Reducing Flock Stress'),
      para('Chronic stress suppresses immune function and increases susceptibility to respiratory and enteric disease. Acute stress events, catching, feed withdrawal, temperature spikes, and sudden lighting changes, can trigger mortality spikes and lasting performance depression [6]. Most stress in a commercial flock comes from management decisions, and most of it is preventable.'),
      bullet([{ text: 'Stocking density: ', bold: true }, { text: 'Follow integrator guidelines. Overcrowding limits air circulation, worsens litter quality, increases competition for feed and water, and raises the aggression level in the barn. The short-term gain from placing extra birds is rarely worth the management problems it creates [4,6].' }]),
      bullet([{ text: 'Light management: ', bold: true }, { text: 'Gradual dimming programs at the end of the day reduce panic and pile-up injuries. Dark hours allow birds to rest, which is important for both welfare and growth efficiency. Sudden lighting changes, especially during catching, cause injuries that reduce carcass quality [4].' }]),
      bullet([{ text: 'Feed and water access: ', bold: true }, { text: 'Interruptions to feed or water access, even for a few hours, are stressful and cause compensatory feeding responses that worsen FCR. Check feeders and drinkers every morning, not just when you think there might be a problem.' }]),
      bullet([{ text: 'Temperature management: ', bold: true }, { text: 'Birds at the wrong temperature will show you immediately: panting and wing spreading indicate heat stress, huddling near the brooders indicates cold. Both responses consume energy that should be going into growth, and prolonged thermal stress increases mortality [4,9].' }]),
      ...image(figBuf('fig4_1.png'), 'Figure 4.1: Litter moisture cause-and-effect chain. Poor ventilation, drinker leaks, enteric disease, and high stocking density drive litter moisture above 30%. The resulting welfare consequences include footpad dermatitis, breast blisters, elevated ammonia, increased disease pressure, and performance loss. Target: 20 to 25% litter moisture throughout the grow-out.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 5: LOW-COST SUSTAINABLE SOLUTIONS
// ============================================================
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 5: Low-Cost Sustainable Solutions'),
      para('Not every sustainable improvement requires a capital investment. The highest-return changes on most poultry farms are management changes, not equipment purchases. The ones that do require some investment, LED lighting, fan controllers, and litter amendments, tend to pay back within a small number of production cycles. The bigger-ticket options, solar panels and biogas systems, take longer but have become far more accessible as equipment costs have come down and provincial grant programs have expanded.'),

      h2('5.1  Composting and Reuse of Materials'),
      para('Composting is the most accessible and immediate sustainability tool available to poultry farmers, and it applies to both litter and mortalities [3]. Done correctly, it eliminates pathogens, reduces odor and volume, and produces a stable fertilizer product that is easier to spread and more predictable in nutrient release than raw litter.'),
      h3('In-Barn Mortality Composting'),
      para('A properly managed mortality composting bin inside the barn, or in a covered facility adjacent to it, processes daily mortalities without requiring off-farm disposal. The key is maintaining the correct carbon-to-nitrogen ratio by adding dry litter as cover material, monitoring temperature to confirm pathogen kill (minimum 55 degrees Celsius for three or more days), and turning the pile periodically to maintain aerobic conditions. When done correctly, it eliminates the need for daily deadstock removal to a refrigerated bin, which is a labor and odor management benefit as much as an environmental one [3].'),
      h3('Between-Flock Windrow Composting'),
      para('If your litter management plan includes cleanout between flocks, windrow composting of the removed litter on a pad or in a covered area converts it into a more stable, pathogen-reduced fertilizer before land application. Composting also reduces the volume of material to be transported, which cuts hauling costs [3].'),
      h3('Partial Litter Reuse'),
      para('In-place litter management, where litter is managed across multiple flocks rather than fully removed each time, is common in broiler production and can reduce heating costs and maintain beneficial microbial communities that suppress Salmonella colonization. The key condition is that litter quality must stay within the target moisture and ammonia range. Partial litter that is wet or heavily caked needs to be removed even if the full cleanout is not scheduled. Caked litter in corners and under feeders and drinkers provides no benefit and a real Salmonella risk [12].'),

      h2('5.2  Natural Light and Airflow'),
      para('In established barns, making use of natural light and passive airflow is limited by the existing design. Retrofit options include:'),
      bullet([{ text: 'Translucent ridge panels: ', bold: true }, { text: 'Where the barn design allows, polycarbonate or fiberglass translucent panels installed at the ridge or on the south side of the roof reduce daytime lighting requirements during high-light months. This needs to be balanced against summer heat gain [NEEDS SOURCE].' }]),
      bullet([{ text: 'Natural ventilation supplementation: ', bold: true }, { text: 'In mild weather, carefully managed inlet door opening can reduce fan run time. This only works in well-designed, appropriately insulated barns and requires close monitoring of temperature, humidity, and litter condition.' }]),
      para('In Canada\'s climate, full reliance on natural ventilation for commercial broiler production is not practical or appropriate. Mechanical systems remain essential for bird welfare compliance and performance. Natural ventilation strategies should be treated as supplemental tools that reduce mechanical ventilation costs during favorable conditions, not as replacements [6].'),
      para('For new construction, building orientation can make a meaningful difference. Orienting the long axis of the barn to catch prevailing summer winds while protecting against prevailing winter winds reduces both cooling and heating energy demand. This is an architectural decision that costs nothing if made at the design stage and cannot be corrected after construction.'),

      h2('5.3  Affordable Renewable Energy: Solar and Biogas'),
      para('Two renewable energy technologies have become practically relevant for commercial poultry farms in Canada in recent years: solar photovoltaic (PV) systems and anaerobic digestion (biogas). Both have upfront capital requirements, but the economics have improved significantly as equipment costs have fallen and government programs have expanded [NEEDS SOURCE].'),
      h3('Solar Photovoltaic Systems'),
      para('Commercial poultry barns have large, often south-facing roof surfaces that are well-suited to PV installation. A barn with 1,000 to 2,000 square meters of south-facing roof area has the potential to generate a substantial portion of its annual electricity demand from solar, with excess power sold back to the grid through provincial net metering programs where available [NEEDS SOURCE]. The economics depend on your province\'s net metering rules, local electricity rates, and available grant or financing programs.'),
      para('Key considerations before investing in solar:'),
      bullet('Get the roof inspected for structural load capacity before installing panels. Older barn roofs may require reinforcement.'),
      bullet('Check provincial net metering regulations and utility connection requirements in your area. Rules vary significantly between provinces.'),
      bullet('Explore available federal and provincial grant programs through Agriculture and Agri-Food Canada and provincial farm organizations [NEEDS SOURCE].'),
      bullet('Get multiple quotes from installers with experience in agricultural installations, not just residential or commercial.'),
      h3('Biogas (Anaerobic Digestion)'),
      para('Anaerobic digestion converts organic material, including poultry litter and mortalities, into biogas (primarily methane) that can be used for heating and electricity generation, and a residual digestate that can be applied to land as a fertilizer [3,14]. The technology is proven, and several Canadian farm operations have installed biogas systems successfully.'),
      para('The economics of biogas are more complex than solar. Capital costs are higher, maintenance requirements are more demanding, and the system works best with consistent manure volumes. For individual operations, biogas is most feasible at larger scales or in consortium arrangements where multiple farms share a facility and spread the capital cost [3,14]. Before pursuing biogas, get a detailed feasibility study that includes your manure volume, moisture content, available feedstocks, and local energy prices.'),
      ...image(figBuf('fig5_1.png'), 'Figure 5.1: Renewable energy options for commercial poultry farms. Solar PV panels on barn roofs generate electricity for barn use and grid export through provincial net metering programs. Anaerobic digestion of poultry litter produces biogas for heat and power generation, and a nutrient-rich digestate for land application. Both technologies are eligible for federal and provincial grant support.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 6: ECONOMIC BENEFITS OF SUSTAINABILITY
// ============================================================
function buildSection6() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 6: Economic Benefits of Sustainability'),
      para('Sustainable farming and profitable farming point in the same direction. Every resource saved is a cost not incurred. Every environmental problem avoided is a legal or regulatory cost not paid. And increasingly, every documented sustainability practice is an asset in your contract relationship with your integrator and in your position relative to the market [14]. This is not a soft argument. The numbers are real.'),

      h2('6.1  Lowering Production Costs'),
      para('The most direct economic benefit of sustainability improvements is reduced input cost per kilogram of gain. The two biggest levers are feed efficiency and energy cost.'),
      bullet([{ text: 'Feed efficiency: ', bold: true }, { text: 'A 0.1-point improvement in FCR on a 20,000-bird barn over a grow-out cycle represents a direct reduction in feed cost per kilogram of meat produced. At current feed prices, this is a meaningful number per cycle, and it compounds across every cycle you run [5].' }]),
      bullet([{ text: 'Water management: ', bold: true }, { text: 'Undetected drinker leaks waste water, damage litter, and cost more in litter amendments, ventilation adjustments, and performance losses than the water itself costs. Daily water metering is the lowest-cost monitoring tool available and often pays for itself in a single cycle [7].' }]),
      bullet([{ text: 'Litter management: ', bold: true }, { text: 'Good litter quality reduces the volume of litter amendments needed, reduces the cost of between-flock cleanout when it is required, and reduces the disease pressure that leads to medication costs [12].' }]),
      bullet([{ text: 'Energy: ', bold: true }, { text: 'Insulation improvements, LED lighting, and variable-speed fan controllers reduce fixed energy costs that are paid every cycle regardless of performance. These improvements often pay back within one to three years [NEEDS SOURCE].' }]),
      bullet([{ text: 'Manure value: ', bold: true }, { text: 'Litter sold or land-applied with proper nutrient documentation has real financial value to crop operations. Well-managed, analyzed litter commands better pricing and longer-term supply relationships than litter of unknown or poor quality [3].' }]),

      h2('6.2  Market Value and Consumer Trust'),
      para('Consumer expectations around poultry production are changing, and they are changing faster than most farmers realize. Survey data consistently show that a growing proportion of consumers want assurance that the chicken they buy was raised under conditions that respected animal welfare and minimized environmental impact [14]. Most consumers cannot visit a farm and verify this themselves. They rely on the programs and certifications their retailer or processor has in place.'),
      para('This matters to you because integrators are increasingly required by their retail customers to demonstrate that their contracted growers meet defined environmental and welfare standards. Farms with documented records, compliance with environmental regulations, low medication use, and participation in animal care programs are in a stronger contract position than farms that cannot provide that documentation [6,10].'),
      para('Third-party certification programs in Canada, including Certified Canadian Chicken, require participating farms to meet documented standards for feed, water, housing, ventilation, animal welfare, and environmental compliance. Meeting those standards is not a separate cost for farms that are already managing their operations well. It is formal recognition of practices that sustainable operations are already doing.'),

      h2('6.3  Long-Term Farm Resilience'),
      para('The farms that will still be operating profitably in twenty years are the ones being managed with that time horizon in mind today. Resilience does not happen by accident. It comes from a series of decisions that reduce exposure to input price volatility, regulatory risk, and market access restrictions.'),
      bullet([{ text: 'Input cost volatility: ', bold: true }, { text: 'Feed prices, energy prices, and water costs all fluctuate. Farms with tight resource efficiency are less exposed to each of those spikes because they are already using less per unit of output [5].' }]),
      bullet([{ text: 'Regulatory compliance: ', bold: true }, { text: 'Environmental regulations on manure storage, land application, ammonia emissions, and water protection are tightening across Canada. Farms that are already meeting or exceeding current standards will absorb new requirements with less disruption than farms that are not [1].' }]),
      bullet([{ text: 'Antimicrobial resistance: ', bold: true }, { text: 'The regulatory trajectory on antibiotic use in food animals is clearly toward further restriction. Farms that have already reduced antibiotic dependence through better management are better positioned for those changes than farms that have not started [10].' }]),
      bullet([{ text: 'Farm value and succession: ', bold: true }, { text: 'A farm with documented practices, good environmental compliance history, modern equipment in good condition, and a track record of strong performance is worth more and is easier to transfer to the next generation or to a purchaser.' }]),
      ...image(figBuf('fig6_1.png'), 'Figure 6.1: Economic benefits of sustainable farm management organized by time horizon. Immediate savings include feed FCR improvements, water leak detection, and LED lighting cost reductions. Medium-term benefits include improved contract position and reduced regulatory risk. Long-term resilience covers input price volatility protection, higher farm value at succession, and full renewable energy potential.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 7: FARMER SELF-ASSESSMENT
// ============================================================
function buildSection7() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 7: Farmer Self-Assessment'),
      para('Reading about sustainability is one thing. Knowing where your own farm stands is different. The most useful thing you can do after completing this course is walk through your own operation with the same critical eye you would use on someone else\'s barn. Most of the problems described in this course are visible. They show up in your records, in your litter, in your mortality data, and in your energy and feed bills. The question is whether you are looking for them.'),

      h2('7.1  Evaluating Your Current Practices'),
      para('Start with the numbers you already have. Most Canadian commercial poultry farmers track at least FCR, mortality, and placement-to-slaughter weight. Pull your last three to five flock records and look for trends:'),
      bullet([{ text: 'Feed conversion ratio: ', bold: true }, { text: 'Is your FCR tracking with integrator targets, or is it consistently above? If it is above, which part of the grow-out is the gap worst? Early FCR problems usually point to chick quality, brooder management, or feed access. Late FCR problems often point to disease pressure, overcrowding, or feeder management.' }]),
      bullet([{ text: 'Mortality: ', bold: true }, { text: 'Is mortality concentrated in the first week (chick quality or brooding issues), mid-grow (disease or environmental stress), or late grow (ascites, lameness)? Each pattern points to a different management area.' }]),
      bullet([{ text: 'Water consumption: ', bold: true }, { text: 'If you track it: is daily consumption per bird within expected range for the age and temperature? Sudden spikes or sustained elevation suggests a drinker leak or enteric disease.' }]),
      bullet([{ text: 'Energy bills: ', bold: true }, { text: 'Compare heating costs per cycle against outside temperature degree-days. If your heating costs are high relative to the weather, the barn is losing more heat than it should, through insulation gaps, unsealed inlets, or aging equipment.' }]),
      bullet([{ text: 'Litter condition: ', bold: true }, { text: 'What does your litter look like at day 14, day 28, and at the end of the grow-out? Litter that is wet or caked by day 14 is a ventilation or drinker management problem. Litter that holds up until week four and then goes wet is often a bird health or stocking density problem.' }]),
      bullet([{ text: 'Ammonia level: ', bold: true }, { text: 'If you use an ammonia meter: what does the reading look like at bird level on a cold morning with minimum ventilation running? Above 20 ppm is a warning. Above 25 ppm needs to be corrected before the next morning walk.' }]),

      h2('7.2  Identifying Areas for Improvement'),
      para('Once you have reviewed your numbers, the next step is ranking the gaps by impact and by how easy they are to close. Not all sustainability improvements are equal. Some of them are free, or close to it. Some require modest spending. And some require capital investment that needs careful planning.'),
      h3('Low-Hanging Fruit: No or Minimal Cost'),
      bullet('Adjust feeder height weekly to match bird growth.'),
      bullet('Walk every barn every day and log drinker line performance; fix leaks the day you find them.'),
      bullet('Review your minimum ventilation program against current bird age and weather conditions.'),
      bullet('Confirm that all litter storage is covered and set back from water courses.'),
      bullet('Get a manure analysis done on your next litter removal.'),
      bullet('Start tracking daily water consumption per bird if you are not already doing so.'),
      h3('Medium-Term: Modest Investment'),
      bullet('Install water meters on any barns that do not have them.'),
      bullet('Switch to LED lighting if you have not already.'),
      bullet('Install variable-speed controllers on fan circuits where fixed-speed fans are currently running.'),
      bullet('Develop a written nutrient management plan for all fields receiving litter.'),
      bullet('Apply a litter amendment during high-moisture risk periods (early flock, winter weather).'),
      h3('Long-Term: Capital Planning'),
      bullet('Assess barn insulation and address any significant heat loss areas identified by inspection.'),
      bullet('Get a feasibility study for solar installation if your barn roof and provincial net metering rules make it potentially viable.'),
      bullet('Explore available provincial and federal programs for farm environmental improvements.'),
      bullet('Consult with your veterinarian about reducing antibiotic reliance through preventive management improvements.'),

      h2('7.3  A Simple Sustainability Action Plan'),
      para('The goal is not to change everything at once. The goal is to identify one or two specific improvements per grow-out cycle and track what happens when you make them. That gives you real data from your own operation, not theory, and it builds the habit of looking critically at your own numbers.'),
      para('A simple action plan looks like this:'),
      numbered('Pick one area to focus on this cycle: feed, water, energy, litter, or health.'),
      numbered('Identify one specific thing to change in that area, something concrete and measurable.'),
      numbered('Record your baseline before you change it: current FCR, current water consumption, current energy bill, or current litter moisture.'),
      numbered('Implement the change and keep the record.'),
      numbered('At the end of the cycle, compare the result to the baseline.'),
      numbered('Share the result with your veterinarian, fieldperson, or nutritionist. Their experience with other farms will help you interpret what you are seeing.'),
      para('The farms that consistently improve their sustainability performance are not the ones that made one big investment and stopped. They are the ones that make small, tracked improvements every cycle and build the discipline of knowing their own numbers. That discipline is worth more than any single technology change.'),
      ...image(figBuf('fig7_1.png'), 'Figure 7.1: Farmer self-assessment cycle applied once per grow-out. Step 1: measure baseline performance (FCR, water, energy, litter). Step 2: identify the gap against targets. Step 3: implement one specific, measurable change. Step 4: track the result and share findings with the veterinarian or fieldperson. Repeat each cycle to build a continuous improvement habit.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SUMMARY AND KEY TAKEAWAYS
// ============================================================
function buildSummarySection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Summary and Key Takeaways'),
      para('Sustainability in poultry farming is not a separate program running alongside your production operation. It is the production operation, managed well. Every practice in this course that reduces waste, improves resource efficiency, or protects the farm from environmental and regulatory risk also improves the farm\'s profitability and long-term viability.'),
      para('The key points to carry forward from this course:'),
      bullet([{ text: 'Environmental impact is manageable: ', bold: true }, { text: 'The water, soil, and air impacts of poultry production are real, but they are manageable with standard good-management practices. Nutrient management planning, covered manure storage, proper litter moisture control, and biosecurity are not special sustainability add-ons. They are the foundation of a well-run farm [1,2,3].' }]),
      bullet([{ text: 'Resource efficiency = profit: ', bold: true }, { text: 'Feed waste, water leaks, and energy loss all have a direct financial cost that is paid every cycle. Closing those gaps is both the right environmental decision and the highest-return management investment available [5,7].' }]),
      bullet([{ text: 'Litter is an asset: ', bold: true }, { text: 'Poultry litter has real fertilizer value. Managed properly, it replaces synthetic fertilizer costs for the farms that receive it and builds long-term soil health. Managed poorly, it becomes a source of regulatory and community problems [3].' }]),
      bullet([{ text: 'Animal welfare and production efficiency align: ', bold: true }, { text: 'Birds under chronic stress or in poor environmental conditions do not perform well. Managing housing, ventilation, stocking density, and feeding and watering programs to support welfare is also managing for better FCR and lower mortality [6,12].' }]),
      bullet([{ text: 'Renewable energy is increasingly accessible: ', bold: true }, { text: 'Solar PV and biogas are not future technology. They are installed and operating on Canadian poultry farms today. The feasibility depends on your barn, your province, and the programs available. The time to evaluate them is before energy costs rise further [NEEDS SOURCE].' }]),
      bullet([{ text: 'Sustainability protects your market position: ', bold: true }, { text: 'Integrators, retailers, and consumers are moving toward documented environmental and welfare standards. Farms with good records and documented practices are better positioned for the contract and market environment that is already here [14].' }]),
      bullet([{ text: 'Start with one improvement per cycle: ', bold: true }, { text: 'You do not need to change everything at once. Pick one specific, measurable improvement, track it, and build from there. The discipline of knowing your own numbers is worth more than any single investment.' }]),
      para('Sustainability is good for the planet. It is also good for your farm\'s bottom line. Those two things are not in tension. They point in exactly the same direction.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// RECOMMENDED PEER-REVIEWED JOURNALS
// ============================================================
function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para('The following journals publish current research on sustainable poultry production, environmental management, feed efficiency, animal welfare, and resource use in commercial livestock systems. These are appropriate sources for farmers seeking to stay current with emerging research in the field.'),
      bullet([{ text: 'Poultry Science ', bold: true, italics: true }, { text: '(Elsevier / Poultry Science Association) — The primary peer-reviewed journal for commercial poultry production research, including nutrition, management, housing, and disease.' }]),
      bullet([{ text: "World's Poultry Science Journal ", bold: true, italics: true }, { text: "(World's Poultry Science Association) — Broad coverage of international poultry research including sustainability and environmental management." }]),
      bullet([{ text: 'Bioresource Technology ', bold: true, italics: true }, { text: '(Elsevier) — Covers manure management, composting, biogas, and nutrient cycling relevant to poultry waste management.' }]),
      bullet([{ text: 'Biosystems Engineering ', bold: true, italics: true }, { text: '(Elsevier) — Engineering approaches to ammonia emission control, ventilation systems, and energy management in livestock buildings.' }]),
      bullet([{ text: 'Journal of Cleaner Production ', bold: true, italics: true }, { text: '(Elsevier) — Covers life cycle assessment, renewable energy integration, and environmental footprint reduction across agricultural systems.' }]),
      bullet([{ text: 'Animal ', bold: true, italics: true }, { text: '(Cambridge University Press / BSAS) — Covers animal welfare, behavior, physiology, and their relationship to production systems.' }]),
      bullet([{ text: 'Canadian Journal of Animal Science ', bold: true, italics: true }, { text: '(NRC Research Press) — Canadian-focused research on livestock production, nutrition, and management, including regulatory context.' }]),
      pageBreak(),
    ],
  };
}

// ============================================================
// REFERENCES
// ============================================================
function buildReferencesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('References'),
      para('References are listed in order of first appearance in the text. All sources are peer-reviewed literature, industry management guides, or documents from recognized regulatory and scientific bodies.'),
      numbered('Steinfeld H, Gerber P, Wassenaar T, Castel V, Rosales M, de Haan C. Livestock\'s Long Shadow: Environmental Issues and Options. Rome: Food and Agriculture Organization of the United Nations; 2006.'),
      numbered('Gerber PJ, Steinfeld H, Henderson B, Mottet A, Opio C, Dijkman J, et al. Tackling Climate Change Through Livestock: A Global Assessment of Emissions and Mitigation Opportunities. Rome: Food and Agriculture Organization of the United Nations; 2013.'),
      numbered('Kelleher BP, Leahy JJ, Henihan AM, O\'Dwyer TF, Sutton D, Leahy MJ. Advances in poultry litter disposal technology: a review. Bioresour Technol. 2002;83(1):27-36.'),
      numbered('Aviagen. Ross Broiler Management Handbook. Huntsville, AL: Aviagen; 2025.'),
      numbered('Bell DD, Weaver WD. Commercial Chicken Meat and Egg Production. 5th ed. New York: Springer; 2002.'),
      numbered('National Farm Animal Care Council (NFACC). Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys. Lacombe: NFACC; 2016.'),
      numbered('Aviagen. Water Quality for Poultry. Edinburgh: Aviagen; 2025.'),
      numbered('Ndegwa PM, Hristov AN, Arogo J, Sheffield RE. A review of ammonia emission mitigation techniques for concentrated animal feeding operations. Biosyst Eng. 2008;100(4):453-469.'),
      numbered('Xin H, Berry IL, Tabler GT, Costello TA. Heat and moisture production of poultry and their housing systems: broilers. Trans ASAE. 1994;37(1):293-303.'),
      numbered('Canadian Animal Health Surveillance System (CAHSS). Canadian Antimicrobial Use Surveillance System Annual Report. Ottawa: CAHSS; 2020.'),
      numbered('Poultry Signals: A Practical Guide for Poultry Farming. Zutphen: Roodbont Publishers; 2011.'),
      numbered('Miles DM, Rowe DE, Cathcart TC. High litter moisture content suppresses litter microbial activity. Poult Sci. 2011;90(4):893-900.'),
      numbered('Leinonen I, Williams AG, Wiseman J, Guy J, Kyriazakis I. Predicting the environmental impacts of chicken systems in the United Kingdom through a life cycle assessment: broiler production systems. Poult Sci. 2012;91(1):8-25.'),
      numbered('Food and Agriculture Organization of the United Nations (FAO). Poultry Development Review. Rome: FAO; 2013.'),
    ],
  };
}

// ============================================================
// STYLES
// ============================================================
function buildStyles() {
  return {
    default: {
      document: {
        run:       { font: 'Calibri', size: 24, color: BODY_GRAY },
        paragraph: { spacing: { after: 160, line: 276, lineRule: 'auto' } },
      },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 36, bold: true, color: DARK_BLUE },
        paragraph: {
          spacing: { before: 480, after: 240 },
          border:  { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
          outlineLevel: 0,
        },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 30, bold: true, color: MED_BLUE },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 26, bold: true, italics: true, color: MED_BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  };
}

// ============================================================
// NUMBERING
// ============================================================
function buildNumbering() {
  return {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(1.0), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
    ],
  };
}

// ============================================================
// BUILD AND WRITE
// ============================================================
async function main() {
  console.log('Building Course 5: Sustainability in Poultry Farming...');

  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       'Sustainability in Poultry Farming',
    description: 'Course 5 — CPC Short Courses',
    features:    { updateFields: false },
    styles:      buildStyles(),
    numbering:   buildNumbering(),
    sections: [
      buildCoverSection(),
      buildTocSection(),
      buildIntroSection(),
      buildSection1(),
      buildSection2(),
      buildSection3(),
      buildSection4(),
      buildSection5(),
      buildSection6(),
      buildSection7(),
      buildSummarySection(),
      buildJournalSection(),
      buildReferencesSection(),
    ],
  });

  let buffer = await Packer.toBuffer(doc);

  // Post-build patch via JSZip
  const zip = await JSZip.loadAsync(buffer);

  // 1. settings.xml — disable auto field update to suppress dialog
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!settings.includes('<w:updateFields')) {
    settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  }
  zip.file('word/settings.xml', settings);

  // 2–3. document.xml — strip dirty flags + inject cached TOC + inject bookmarks
  let docXml = await zip.file('word/document.xml').async('string');

  // 2. Strip w:dirty="true" from all field characters
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  // 3. TOC entries with anchors for clickable rows
  const entriesWithAnchor = [
    { lvl: 1, text: 'Introduction',                                             page: 3  },
    { lvl: 2, text: 'Learning Objectives',                                       page: 3  },
    { lvl: 1, text: 'Section 1: Environmental Impact of Poultry Farming',        page: 5  },
    { lvl: 2, text: '1.1  Understanding the Environmental Footprint',            page: 5  },
    { lvl: 2, text: '1.2  Water: Use and Contamination Risk',                    page: 5  },
    { lvl: 2, text: '1.3  Soil: Nutrients, Runoff, and Land Management',         page: 6  },
    { lvl: 2, text: '1.4  Air Quality: Ammonia, Dust, and Odor',                 page: 7  },
    { lvl: 1, text: 'Section 2: Efficient Use of Resources',                     page: 8  },
    { lvl: 2, text: '2.1  Reducing Feed Waste',                                  page: 8  },
    { lvl: 2, text: '2.2  Water-Saving Practices',                               page: 9  },
    { lvl: 2, text: '2.3  Smart Energy Use on the Farm',                         page: 10 },
    { lvl: 1, text: 'Section 3: Manure and Waste Management',                    page: 11 },
    { lvl: 2, text: '3.1  Turning Manure into Fertilizer',                       page: 11 },
    { lvl: 2, text: '3.2  Reducing Pollution and Managing Odors',                page: 12 },
    { lvl: 2, text: '3.3  Safe Storage and Handling',                            page: 13 },
    { lvl: 1, text: 'Section 4: Animal Welfare and Flock Health',                page: 14 },
    { lvl: 2, text: '4.1  Healthy Birds as a Sustainability Pillar',             page: 14 },
    { lvl: 2, text: '4.2  Housing and Ventilation',                              page: 15 },
    { lvl: 2, text: '4.3  Reducing Flock Stress',                                page: 16 },
    { lvl: 1, text: 'Section 5: Low-Cost Sustainable Solutions',                 page: 17 },
    { lvl: 2, text: '5.1  Composting and Reuse of Materials',                    page: 17 },
    { lvl: 2, text: '5.2  Natural Light and Airflow',                            page: 18 },
    { lvl: 2, text: '5.3  Affordable Renewable Energy: Solar and Biogas',        page: 19 },
    { lvl: 1, text: 'Section 6: Economic Benefits of Sustainability',             page: 21 },
    { lvl: 2, text: '6.1  Lowering Production Costs',                            page: 21 },
    { lvl: 2, text: '6.2  Market Value and Consumer Trust',                      page: 22 },
    { lvl: 2, text: '6.3  Long-Term Farm Resilience',                            page: 22 },
    { lvl: 1, text: 'Section 7: Farmer Self-Assessment',                         page: 23 },
    { lvl: 2, text: '7.1  Evaluating Your Current Practices',                    page: 23 },
    { lvl: 2, text: '7.2  Identifying Areas for Improvement',                    page: 24 },
    { lvl: 2, text: '7.3  A Simple Sustainability Action Plan',                  page: 25 },
    { lvl: 1, text: 'Summary and Key Takeaways',                                 page: 26 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals',                        page: 27 },
    { lvl: 1, text: 'References',                                                page: 28 },
  ].map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function tocRow(e) {
    const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
    const indent    = e.lvl === 1 ? '' : '<w:ind w:left="440"/>';
    const text      = escapeXml(e.text);
    return (
      '<w:p><w:pPr>' +
        `<w:pStyle w:val="${styleName}"/>` +
        '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs>' +
        indent +
      '</w:pPr>' +
      `<w:hyperlink w:anchor="${e.anchor}" w:history="1">` +
        `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>` +
        '<w:r><w:tab/></w:r>' +
        `<w:r><w:t>${e.page}</w:t></w:r>` +
      '</w:hyperlink></w:p>'
    );
  }

  const tocEntries   = entriesWithAnchor.map(tocRow).join('');
  const sepTag       = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag       = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx       = docXml.indexOf(sepTag);
  if (sepIdx !== -1) {
    const endIdx = docXml.indexOf(endTag, sepIdx);
    if (endIdx !== -1) {
      docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
    }
  }

  // 3b. Inject bookmarks around heading paragraphs for clickable TOC
  {
    let entryIdx  = 0;
    let bookmarkId = 1000;
    const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    docXml = docXml.replace(headingRegex, (match, lvlStr) => {
      if (entryIdx >= entriesWithAnchor.length) return match;
      const lvl      = Number(lvlStr);
      const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
      const heading  = textRuns.trim();
      const entry    = entriesWithAnchor[entryIdx];
      const norm     = (s) => s.replace(/\s+/g, ' ').trim();
      if (lvl !== entry.lvl) return match;
      if (norm(heading) !== norm(entry.text)) return match;
      entryIdx++;
      const id = bookmarkId++;
      return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
    });
    if (entryIdx !== entriesWithAnchor.length) {
      console.warn(`Course 5 TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
    }
  }

  // 4. Add TOC1 / TOC2 styles to styles.xml if missing
  let stylesXml = await zip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    const tocStyles =
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="440"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
    stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
    zip.file('word/styles.xml', stylesXml);
  }

  // 5. Sanity check: must have 0 dirty flags
  const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
  if (dirtyLeft > 0) {
    throw new Error(`Still ${dirtyLeft} w:dirty flags in document.xml — "fields may refer to other files" dialog will appear`);
  }

  // 6. Validate no unescaped ampersands
  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found), Word will reject the file`);

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
  console.log('');
  console.log('TOC note: First open in Word, click Yes on the fields dialog, then Ctrl+S.');
  console.log('Subsequent opens will not show the dialog.');
}

main().catch(err => { console.error(err); process.exit(1); });
