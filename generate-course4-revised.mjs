// ============================================================
// generate-course4-revised.mjs — Course 4: Salmonella & Food Safety
// CPC Short Courses — Canadian Poultry Training Series
// REVISED: Farmer-Flow rewrites, removed lecture-specific sections,
//          aligned with CLAUDE.md Farmer-Flow Style Scoring System
// Uses docx v9.6.1 (local node_modules)
// Run: node generate-course4-revised.mjs
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
  TableOfContents,
  LevelFormat,
  ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 4');
const OUT_FILE  = path.join(OUT_DIR, 'Course 4 - revised aligned draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

// Image paths
function imgPath(n) { return path.join(OUT_DIR, `img${n}.png`); }
function imgBuf(n)  { return fs.existsSync(imgPath(n)) ? fs.readFileSync(imgPath(n)) : null; }
function imgBuf0()  {
  const p = path.join(OUT_DIR, 'img0_salmonella.png');
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

// ============================================================
// COLOURS
// ============================================================
const DARK_BLUE  = '1F3864';
const MED_BLUE   = '2E74B5';
const BODY_GRAY  = '3C3C3C';
const GOLD       = 'C9A84C';

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
    ? text.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY_GRAY, size: seg.size || 24, font: 'Calibri' }))
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


// Embedded PNG image + caption
function image(buf, caption, widthIn = 5.8) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  // Read actual PNG dimensions from IHDR chunk
  let hpx = Math.round(wpx * 0.47); // default fallback ratio
  try {
    const view = new DataView(buf.buffer, buf.byteOffset);
    const pw   = view.getUint32(16, false);
    const ph   = view.getUint32(20, false);
    if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
  } catch (_) {}

  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: buf,
          transformation: { width: wpx, height: hpx },
          type: 'png',
        }),
      ],
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
          new TextRun({ text: 'Salmonella and Food Safety', color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'Canadian Poultry Training Series  |  Course 4 of 17  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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
// COVER PAGE  — matches Course 3 / Course 7 pattern exactly
// ============================================================
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

  const children = [
    // Large top spacer
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1800, after: 0 } }),

    // Course label — small blue uppercase
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 4 OF 17: CANADIAN POULTRY TRAINING SERIES', bold: true, color: MED_BLUE, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 200 },
    }),
  ];

  // CPC Logo (if present)
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
  }

  children.push(
    // Main title
    new Paragraph({
      children: [new TextRun({ text: 'Salmonella & Food Safety', bold: true, color: DARK_BLUE, size: 56, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 200, after: 200 },
    }),

    // Subtitle
    new Paragraph({
      children: [new TextRun({ text: 'Protecting Your Flock, Your Farm, and Your Customers', color: MED_BLUE, size: 30, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 600 },
    }),

    // Divider
    new Paragraph({
      children: [new TextRun({ text: '───────────────────────────────────', color: MED_BLUE, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 400 },
    }),

    // Organization
    new Paragraph({
      children: [new TextRun({ text: 'Canadian Poultry Training Series Course', bold: true, color: '595959', size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
    }),

    // Duration
    new Paragraph({
      children: [new TextRun({ text: 'Duration: 1.5-Hour Lecture', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
    }),

    // Date
    new Paragraph({
      children: [new TextRun({ text: 'April 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 800 },
    }),

    // Disclaimer
    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature, industry management guides, and regulatory documents. This material does not replace the advice of a licensed veterinarian or regulatory authority.', color: '808080', size: 18, font: 'Calibri', italics: true })],
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
// TABLE OF CONTENTS — real Word TOC field (no hyperlink switch,
// which was triggering the "fields referencing other files" dialog)
// JSZip post-processing injects pre-cached entries so page numbers
// display immediately; user can still right-click > Update Field.
// ============================================================
function buildTocSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', {
        headingStyleRange: '1-3',
      }),
      pageBreak(),
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
      para('Salmonella is the kind of problem that hides in a healthy-looking flock. The birds eat, the birds drink, mortality is normal, your morning walk turns up nothing unusual. Then the swab results come back from the plant and your week is suddenly very different [1]. That is the part that makes Salmonella so hard. You cannot watch a bird and tell whether it is shedding. So everything in your program has to work whether or not you ever see a sick bird.'),
      para('The numbers are big enough to take seriously. The Public Health Agency of Canada estimates around 87,500 illnesses, 925 hospitalisations, and 17 deaths a year from non-typhoidal Salmonella, with poultry consistently near the top of the source list [2]. That is why the regulators are interested in what you do. CFIA standards apply to your product, and when a positive comes back on your flock it does not stay quiet between you and the plant [3].'),
      para('What this course does is walk you through what Salmonella actually is, how it gets into a barn, and what works to keep it out. Biosecurity, hygiene, cleanout, pre-harvest management, records, and the rules you have to follow. By the end you will know where the high-risk doors are on your operation and exactly what to do at each one before the sampling truck arrives.'),
      h2('Learning Objectives'),
      para('By completing this course, you will be able to:'),
      bullet('Know why Salmonella is your biggest ongoing food safety obligation, and how regulators will hold you accountable.'),
      bullet('Spot the specific entry points on your farm where Salmonella gets in, and what it takes to close them.'),
      bullet('Understand what your birds will (and will not) show you when Salmonella is present in the flock.'),
      bullet('Apply the layered control measures that consistently keep flock and carcass contamination low.'),
      bullet('Run your cleanout, hygiene, and pest control programs in a way that holds up to a third-party audit.'),
      bullet('Keep the records that demonstrate your food safety program is working, and protect you if a flock tests positive.'),
      bullet('Know exactly when to report to CFIA, and what happens if you do not.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 1: UNDERSTANDING SALMONELLA
// ============================================================
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 1: Understanding Salmonella'),
      h2('1.1 What Is Salmonella?'),
      para('Salmonella is not one bug. It is a big family, more than 2,600 different variants called serovars, and most of them do not matter in poultry production [1]. The two that matter to you in Canada are Salmonella Enteritidis (SE) and Salmonella Typhimurium (ST). They cause most of the human illness traced back to Canadian poultry, and they are what your food safety program has to push back against [2].'),
      para('For day-to-day decisions on the farm, think of Salmonella in three groups:'),
      bullet([{ text: 'Paratyphoid serovars (SE, ST, Salmonella Infantis): ', bold: true }, { text: 'Your birds will not look sick with these. Adult birds carry them silently and shed them in their droppings. The contamination still reaches the consumer. These are the serovars driving most of the Salmonella food safety pressure on Canadian broiler and layer farms [1,2].' }]),
      bullet([{ text: 'Host-adapted serovars (Pullorum, Gallinarum): ', bold: true }, { text: 'These cause visible, serious disease in your birds: high mortality and sick flocks. Both are federally reportable. If you suspect either one, stop what you are doing and call CFIA immediately [3].' }]),
      bullet([{ text: 'Arizonosis: ', bold: true }, { text: 'Caused by Salmonella arizonae, primarily a concern in turkey flocks. Less common in Canada [4].' }]),
      ...image(imgBuf(1), 'Figure 1.1: Salmonella classification in commercial poultry. Paratyphoid serovars (SE, ST) are the primary food safety concern. Pullorum disease and fowl typhoid are reportable diseases in Canada. (Generated diagram, CPC Short Courses.)'),
      h2('1.2 The Biology of Salmonella'),
      para('A few things about how this bug behaves explain why cleanout shortcuts always come back to haunt you:'),
      bullet([{ text: 'Survives in the barn environment: ', bold: true }, { text: 'In dry litter, dust, soil, and on equipment surfaces, Salmonella can stay alive for weeks to months. A barn that looks clean is not necessarily safe [1,5].' }]),
      bullet([{ text: 'Grows across a wide temperature range: ', bold: true }, { text: 'Salmonella multiplies between 7 and 48°C, fastest around 37°C. Anything that sits at room temperature after slaughter is a growth opportunity.' }]),
      bullet([{ text: 'Survives drying: ', bold: true }, { text: 'Dried fecal dust can carry live Salmonella. This is why dry-sweeping before washing matters. You have to remove that material physically before disinfectant can reach the surface [5].' }]),
      bullet([{ text: 'Killed by heat: ', bold: true }, { text: 'Cooking destroys Salmonella completely. An internal temperature of 74°C throughout the product is the line [2]. Below that, the risk remains.' }]),
      ...image(imgBuf0(), 'Figure 1.2: Scientific illustration of Salmonella typhimurium. Each cell is a rod-shaped (bacillus) gram-negative bacterium measuring 0.7-1.5 x 2-5 micrometres. Peritrichous flagella (visible as thin filaments projecting in all directions) give the organism motility and aid colonization of the intestinal tract. (Generated scientific illustration, CPC Short Courses. Actual electron micrographs to be supplied by the CPC team.)', 5.8),
      h2('1.3 How Salmonella Affects Birds'),
      para('In a broiler or layer barn, most birds carrying Salmonella look completely normal. They eat, they drink, they grow, they lay. The whole time they are quietly dropping the bug into the litter and onto everything else [1]. You cannot pick those birds out by sight, and that is the entire problem.'),
      para('Young chicks, especially under three weeks, are the exception. When Salmonella does cause clinical disease at that age you will see:'),
      bullet('Weakness and lethargy'),
      bullet('Huddling and chilling'),
      bullet('Diarrhea and pasting of the vent'),
      bullet('Increased mortality in the first week of life'),
      para("In a layer flock, SE has an extra trick. It can colonise the hen's reproductive tract and get inside the egg before the shell forms. The route is called transovarian transmission [1,6]. The shell looks perfectly clean and uncracked, but the inside is already contaminated. That is why SE in a laying flock is taken so seriously, and why the egg safety steps later in this course are not optional."),
      h2('1.4 How Salmonella Affects Humans'),
      para('When a person gets sick from contaminated poultry, it comes on fast. Symptoms hit 6 to 72 hours after eating, cramping, diarrhea that can turn bloody, nausea, fever around 38 to 39°C, generally a bad few days. A healthy adult usually clears it in four to seven days [2].'),
      para('Children under five, elderly people, pregnant women, and anyone whose immune system is already weak, it can put them in the hospital. That is who is buying your product. They do not have the reserves to shake off what you and I would. There is also a longer-term problem. Antimicrobial overuse on poultry farms is one of the things driving resistance in Salmonella strains that later show up in hospitals with limited treatment options. Antimicrobial stewardship on your farm matters past your property line [2,7].'),
      h2('1.5 How Salmonella Spreads: Transmission Routes'),
      para('There are two paths into a flock. Either the bug comes in with the chick (vertical), or it comes in after placement on something that touches the barn (horizontal). Your control plan has to cover both [1].'),
      h3('Vertical Transmission'),
      para('Vertical means the problem is already on board the day the chicks land. If the breeder flock is positive for SE, contaminated eggs hatch contaminated chicks and the day-old birds you place are already shedding [1,6]. The cleanest barn in the country cannot fix what walked in the door on placement day.'),
      h3('Horizontal Transmission'),
      para("Horizontal is what most farms fight every day. Anything that comes near the barn can carry it. Feed, biofilm in the drinker line, rodents, flies, darkling beetles, a wild bird that got in, a worker who did not change boots between barns, a piece of equipment that came over from the next farm [1,5]. Any one of those routes is enough to start an outbreak in a clean flock."),
      ...image(imgBuf(3), 'Figure 1.3: Salmonella transmission routes. Vertical transmission (left) passes infection from breeder to egg to chick. Horizontal transmission (right) spreads Salmonella through feed, water, rodents, insects, people, and equipment. (Generated diagram, CPC Short Courses.)'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 2: RISKS ON THE POULTRY FARM
// ============================================================
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 2: Risks on the Poultry Farm'),
      para('Salmonella does not appear out of nowhere. It comes in on something you can usually trace, and once it sets up in the barn environment it is not leaving without a real cleanout [1,5]. The point of this section is to walk you through the doors it uses, one at a time, so you can see which ones are open on your operation.'),
      h2('2.1 Contaminated Feed'),
      para('Feed is one of the most direct routes onto the farm. Animal-origin ingredients (meat and bone meal, feather meal, fish meal) can carry the bug, and while most mills heat-treat finished feed, that protection is gone the minute the bag is opened or the bin is exposed to the elements [5]. Post-mill contamination during transport and storage is a real, documented risk. Things to watch for:'),
      bullet('Purchasing feed from suppliers without documented Salmonella control programs'),
      bullet('Storing feed in open bins accessible to rodents and wild birds'),
      bullet('Using damaged feed bags or bins where moisture can enter and support bacterial growth'),
      bullet('Providing feed that has been stored too long, especially in warm, humid conditions'),
      h2('2.2 Contaminated Water'),
      para("Most farmers keep an eye on the feed and forget about the water. Surface water from a dugout, pond, or open stream carries a heavy bacterial load. Well water is usually cleaner but can go wrong with seasonal changes or with aging infrastructure [1]. The bigger water problem is inside the barn though, and it is biofilm. Biofilm is the slimy layer on the inside of your drinker line that builds up over the course of a flock. Salmonella lives inside it and survives a normal flush. The only thing that breaks it down is a proper water-line clean with an approved acid or enzyme product between flocks. If you are not doing that at turnover, you are starting every new flock on a contaminated water line."),
      h2('2.3 Carrier Birds and Asymptomatic Shedding'),
      para("Once some of your birds pick Salmonella up, they become carriers. They shed it on and off in their droppings, and they look completely normal the whole time [1]. You cannot pick them out by walking the barn. And anything that stresses the flock pushes the shedding higher, feed withdrawal, a concurrent infection, the chaos of catching. That is why barn contamination tends to peak in the 24 to 48 hours before loading. You are stressing the birds at the exact worst time."),
      h2('2.4 Wild Animals, Rodents, and Insects'),
      para('The hardest introductions to prevent are the ones you did not invite. Each of these has its own way of getting around your defences:'),
      bullet([{ text: 'Rodents: ', bold: true }, { text: 'Rats and mice are heavily colonized with Salmonella and contaminate everything they touch (feed, water, litter) through their droppings and urine. A single rodent can shed millions of Salmonella organisms per gram of feces [5]. One active rodent infestation can undo a good biosecurity program.' }]),
      bullet([{ text: 'Wild birds: ', bold: true }, { text: 'Starlings, sparrows, and pigeons that get into your barn drop Salmonella directly into the feed and litter. They are hard to keep out completely, but gaps in walls, fans, and vents make it much worse [1].' }]),
      bullet([{ text: 'Darkling beetles (Alphitobius diaperinus): ', bold: true }, { text: 'Once established in litter, these insects are almost impossible to eliminate. They carry Salmonella through flock cycles and survive even after thorough cleanout by hiding deep in insulation and cracks [1,5].' }]),
      bullet([{ text: 'Flies: ', bold: true }, { text: 'House flies pick up Salmonella from manure or dead birds and carry it directly to feed, drinkers, and barn surfaces. A fly pressure problem is a Salmonella amplification problem.' }]),
      h2('2.5 Farm Worker Practices'),
      para("The most mobile carrier on your farm is whoever walked through the door this morning. Every worker, technician, vet, and visitor who was on another poultry farm earlier that day can bring Salmonella in on their boots, coveralls, and hands, and almost nobody knows when it is happening [1,5]. Where this goes wrong:"),
      bullet('Moving between barns without changing boots and outer clothing'),
      bullet('Entering the barn after visiting another poultry farm without observing the required downtime'),
      bullet('Inadequate or no handwashing before and after barn entry'),
      bullet('Sharing equipment (shovels, rakes, forklifts) between barns without disinfection'),
      bullet('Allowing catching crews onto the farm without enforcing your biosecurity protocols'),
      h2('2.6 Equipment and Litter'),
      para("Equipment moves quietly between barns and farms, and it carries the bug with it. Egg flats, chick delivery boxes, feed trucks, litter handling gear, dead bird bins [1,5]. None of it looks contaminated. Any of it can be. And the litter itself builds up a load week by week as the flock ages. By the time you are pushing slaughter weight, the litter is a real reservoir on its own, completely separate from the birds."),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 3: PREVENTION AND CONTROL
// ============================================================
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 3: Prevention and Control Measures'),
      para('There is no single product or program that gets rid of Salmonella on its own. Anyone who tells you otherwise is trying to sell you something. The thing that actually works is layering. You stack several controls so that when one fails, the next one catches it. That is what this section is built around [1,5].'),
      h2('3.1 Biosecurity: The Foundation'),
      para('Biosecurity is the wall around the barn. It is not one thing, it is a list of things you do every day. Who comes in. What vehicles cross the line. What equipment moves between farms. What chicks land on placement day. Every one of those is a possible introduction route [1,5].'),
      bullet('Establish a clearly marked farmyard boundary. Limit the number of entry points and post biosecurity requirement signs at all entry points.'),
      bullet('Maintain a visitor log. Record the name, organization, date, and any recent poultry farm contacts for every person who enters the production area.'),
      bullet('Require a minimum 48-hour downtime for anyone who has visited another poultry operation before entering your barns.'),
      bullet('Require all delivery vehicles to be washed and disinfected before entering the production area whenever possible.'),
      h3('All-In and All-Out Management'),
      para('The single most effective tool you have for breaking the cycle between flocks is all-in, all-out. One flock in, one flock out, full cleanout in between [1]. Continuous housing, where you put new birds in before the old flock is fully gone, almost guarantees Salmonella carries over. The new flock walks into a contaminated environment on day one and you are uphill for the whole grow-out.'),
      ...image(imgBuf(5), 'Figure 3.1: Biosecurity zones and entry protocol. The clean zone (left) encompasses the production barn and dedicated equipment. The entry point (centre) enforces boot dips, coverall changes, handwashing, and visitor logging. The outside zone (right) includes public roads and delivery vehicles, which must not cross the line. (Generated diagram, CPC Short Courses.)'),
      h2('3.2 Feed and Water Safety'),
      para('Start with the feed supplier. Ask whether their program covers heat treatment of finished feed, post-processing contamination controls, and routine environmental Salmonella testing. If they cannot show you the paperwork, get a different supplier [5]. On the farm side, every bag and bin gets sealed and covered. No leftover feed sitting between flocks. Zero rodent access to any feed storage, ever.'),
      para('Water: test well water for total coliform and E. coli at least once a year. Run an in-line treatment system, chlorination or acidification works fine for most Canadian operations. Flush and clean drinker lines at the end of every cycle with an approved cleaner that breaks down biofilm [1].'),
      h2('3.3 Competitive Exclusion'),
      para("Competitive exclusion is a simple idea: get the right bacteria into the chick before Salmonella does. These products are mixes of beneficial gut bacteria, applied to day-old chicks. They colonise the intestine and crowd Salmonella out before it can establish [1,5]. CE works best at hatch, before any exposure, and only as part of a broader biosecurity and management program. Several CE products are licensed in Canada. Ask your vet which one fits your placement schedule and production type."),
      h2('3.4 Vaccination'),
      para('SE vaccines are available in Canada and are standard in layer and breeder operations, where the contamination of the egg itself is the main concern [1,8].'),
      bullet([{ text: 'Live attenuated vaccines: ', bold: true }, { text: 'Given in water or by spray to young pullets. These prime the gut\'s immune response, making it harder for Salmonella to establish in the intestinal tract and reducing shedding.' }]),
      bullet([{ text: 'Killed vaccines: ', bold: true }, { text: 'Injected at or near transfer to the layer barn, as a booster after the live series. Associated with lower rates of egg contamination [1,8].' }]),
      para('Vaccination brings colonisation down and cuts the odds of transovarian transmission, but it does not clear Salmonella out of a flock. Treat it as one layer of a program, not a replacement for biosecurity and management. Your integrator or provincial vet will tell you which schedule fits your production type and the current regulations [3].'),
      h2('3.5 Rodent and Pest Control'),
      para('Rodents are one of the most reliable ways for Salmonella to get into a barn, and one of the hardest pest problems to clear out once they are settled in. Your rodent program has to be active, documented, and continuous. Do not wait until you see them to start working at it. The basics:'),
      bullet('Regular inspection of the barn perimeter and interior for signs of rodent activity (droppings, gnaw marks, burrows, runways).'),
      bullet('Maintaining an uncluttered cleared zone around the exterior of all barn buildings to eliminate rodent harborage.'),
      bullet('Sealing all gaps larger than 6 mm in barn walls, foundations, and roof lines.'),
      bullet('Placing and maintaining bait stations at regular intervals around the barn perimeter and under feed storage bins.'),
      bullet('Keeping records of rodent activity levels and bait consumption to track program effectiveness.'),
      h2('3.6 Salmonella Monitoring and Testing'),
      para("Under Canada's National Salmonella Action Plan for Chicken (NSAPC), your integrator runs pre-harvest flock testing. Treat that result as real information, not paperwork. It tells you whether the biosecurity is working and whether a specific barn is carrying a heavier load than the rest [3]. When a positive comes back, use it. Pull out your cleanout records, visitor logs, and pest control sheets. Find where the gap was. Fix it. Write down what you changed. Then call your vet about what to add to the next cycle."),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 4: GOOD HYGIENE PRACTICES
// ============================================================
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 4: Good Hygiene Practices'),
      para('A biosecurity plan is only as good as the people doing it. If the workers, including you, are skipping basic hygiene some of the time, the plan is worthless. Salmonella moves on hands, boots, coveralls, and equipment, and every shortcut becomes a new way for it to spread [5,9].'),
      h2('4.1 Handwashing'),
      para('Your hands touch birds, equipment, litter, and your own face in a way nothing else on the farm does. That makes them the fastest transfer route for Salmonella you have, and also the easiest one to interrupt. The procedure is the same one you have heard a hundred times, but it actually has to be done:'),
      numbered('Wet hands with clean, running water (warm or cold).'),
      numbered('Apply soap and lather thoroughly, covering all surfaces including backs of hands, between fingers, and under nails.'),
      numbered('Scrub for at least 20 seconds.'),
      numbered('Rinse completely under running water.'),
      numbered('Dry with a clean paper towel or air dryer. Never share cloth towels.'),
      para('Wash hands before and immediately after entering any poultry barn, after handling live birds or carcasses, after handling litter or soiled equipment, before eating or drinking, and after using the toilet. Provide adequate handwashing facilities at every barn entry point with clean running water, soap, and disposable paper towels [9].'),
      h2('4.2 Protective Clothing and Footwear'),
      bullet([{ text: 'Coveralls or dedicated barn clothing: ', bold: true }, { text: 'Worn only inside the barn. Change and launder after each flock cycle or more frequently if visibly soiled.' }]),
      bullet([{ text: 'Dedicated barn boots: ', bold: true }, { text: 'Rubber or waterproof boots used only inside the designated barn or production area. Boots are among the most effective vehicles for transferring Salmonella between barns [1].' }]),
      bullet([{ text: 'Boot dips: ', bold: true }, { text: 'Maintain footbaths at every barn entrance using an approved disinfectant at the correct concentration. Change disinfectant solutions regularly; a fouled boot dip is ineffective and may spread contamination [5].' }]),
      bullet([{ text: 'Gloves: ', bold: true }, { text: 'Wear disposable or cleanable gloves when handling carcasses, taking samples, or administering medications. Change gloves between barns.' }]),
      h2('4.3 Barn Cleanout and Disinfection'),
      para('Cleanout is the one window in the flock cycle where you can actually reset the barn. Everything that comes after, your biosecurity, your CE product, your vaccination, is fighting uphill against whatever Salmonella load you left in the building. A proper cleanout breaks that cycle [1,5].'),
      ...image(imgBuf(4), 'Figure 4.1: Between-flock cleanout and disinfection protocol. Each step builds on the previous; skipping any step significantly reduces effectiveness. Dry cleanout and full drying before disinfectant application are the two most commonly skipped steps. (Generated diagram, CPC Short Courses.)'),
      h3('Key Cleanout Principles'),
      bullet('Remove all litter, manure, and debris from the barn, including corners, under feed and water lines, and wall edges.'),
      bullet('Dry-sweep or blow down all surfaces including walls, ceiling, fans, and attic spaces where dust accumulates.'),
      bullet('Apply a detergent-based foaming agent and pressure-wash all surfaces. Start from the top (ceiling, fans, light fixtures) and work down to the floor.'),
      bullet('Allow the barn to dry completely before applying disinfectant. Salmonella disinfection is significantly less effective on wet surfaces.'),
      bullet('Apply an approved disinfectant at the correct concentration and contact time. Rotate between disinfectant classes over successive flock cycles.'),
      bullet('Allow the barn to sit empty for at least 7 to 14 days after disinfection before the next flock.'),
      h2('4.4 Waste Management'),
      para('Litter coming out of a positive flock is a contamination hazard the second it leaves the barn. Cover it, contain it, keep it well away from barn entrances, water sources, and the neighbours. Fresh untreated manure from a positive flock does not go onto fields that grow produce eaten raw. The downstream risk is not theoretical [5,9].'),
      para('Dead birds: pull them every day and process them immediately. Mortality piling up in the barn or in a bin is a Salmonella amplifier and an audit flag at the same time. Two reasons to keep on top of it.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 5: SAFE PROCESSING AND STORAGE
// ============================================================
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 5: Safe Processing and Storage'),
      para('The plant does the kill but the farm decides how much Salmonella shows up on the truck. The colonisation level in your flock at loading is what drives carcass contamination at slaughter. Your test results, your relationship with the integrator, and your market access all trace back to what you did in the barn in the days before pickup [3,6].'),
      h2('5.1 Pre-Harvest Management'),
      para('The window from final feed withdrawal to loading is the worst time for Salmonella in your flock. Withdrawal stress, the chaos of catching, the stress of transport, all of it pushes carrier birds to shed at higher rates. And feathers smeared with fecal material during catching go straight onto the processing line [1,5]. Whatever you do in those 24 to 48 hours shows up in your carcass numbers.'),
      bullet([{ text: 'Feed withdrawal timing: ', bold: true }, { text: 'Follow your processor\'s specified feed withdrawal guidelines. Excessive withdrawal time causes intestinal damage that increases contamination risk during processing [6].' }]),
      bullet([{ text: 'Water access: ', bold: true }, { text: 'Maintain water access up to 1 to 2 hours before catching. Dehydrated birds experience more intestinal fragility at slaughter.' }]),
      bullet([{ text: 'Catching crew biosecurity: ', bold: true }, { text: 'Ensure catching crew members change into clean coveralls and boots before entering the barn. Crews working across multiple farms in a single day carry a higher Salmonella transfer risk.' }]),
      h2('5.2 Temperature Control'),
      ...image(imgBuf(2), 'Figure 5.1: Temperature control for Salmonella safety. Refrigeration slows growth but does not kill bacteria. The danger zone (4 to 60°C) allows rapid multiplication. Cooking to 74°C throughout the product destroys Salmonella completely. (Generated diagram, CPC Short Courses.)'),
      bullet([{ text: 'Refrigeration: ', bold: true }, { text: 'Fresh poultry meat must be kept at or below 4°C at all times after processing. Refrigeration slows Salmonella growth greatly but does not eliminate it.' }]),
      bullet([{ text: 'Freezing: ', bold: true }, { text: 'Frozen poultry should be stored at or below -18°C. Freezing does not kill Salmonella; frozen poultry must still be handled and cooked correctly.' }]),
      bullet([{ text: 'Cooking temperature: ', bold: true }, { text: 'All poultry products must reach an internal temperature of at least 74°C (165°F) throughout the product to ensure Salmonella destruction [2,9]. This applies to all cuts, including wings and thighs close to the bone.' }]),
      bullet([{ text: 'Cold chain maintenance: ', bold: true }, { text: 'Do not allow poultry products to sit at room temperature for more than 2 hours. After cooking, maintain hot food above 60°C, or cool rapidly to below 4°C within 2 hours.' }]),
      h2('5.3 Egg Safety: On-Farm Practices for Layer Operations'),
      bullet('Keep nesting areas clean and dry. Wet, soiled nests dramatically increase the risk of shell contamination.'),
      bullet('Collect eggs frequently: minimum 3 to 4 times per day for loose-housed flocks. Frequent collection reduces the time eggs spend in a warm, contaminated environment.'),
      bullet('Remove floor eggs promptly. Floor eggs have a much higher rate of fecal shell contamination and must not be sold as Grade A.'),
      bullet([{ text: 'Do not wash eggs ', bold: true }, { text: 'unless you are licensed and equipped to do so under CFIA-approved conditions. Washing with water cooler than the egg creates a negative pressure differential that actively pulls surface bacteria into the egg through the shell pores [6].' }]),
      bullet('Cool eggs promptly after collection to below 12 degrees Celsius. Store eggs at 7 to 12 degrees Celsius pending grading.'),
      bullet('Use clean, sanitized egg flats or crates. Reusable plastic egg flats must be washed and disinfected between uses.'),
      h2('5.4 Preventing Cross-Contamination'),
      para('If you do direct sales or any on-farm processing, cross-contamination is your problem to manage. Raw poultry onto a board, a surface, or a pair of hands that then touch ready-to-eat food is one of the most common ways people get sick from chicken [2]. The rules are simple. They have to be followed every time:'),
      bullet('Use separate, color-coded cutting boards and utensils for raw poultry and other foods.'),
      bullet('Wash hands thoroughly after handling raw poultry and before touching any other food or surface.'),
      bullet('Sanitize all surfaces and equipment that have contacted raw poultry.'),
      bullet('Store raw poultry below and away from ready-to-eat foods in refrigerators and transport coolers.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// SECTION 6: FARMER RESPONSIBILITIES
// ============================================================
function buildSection6() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 6: Farmer Responsibilities and Consumer Safety'),
      para('Salmonella control in Canada is not optional. It is in federal law, in provincial regulation, and in the program rules of every major commodity organisation you sell into. Knowing which rules apply to you, what records you have to keep, and when to call CFIA matters as much as anything you do in the barn [3,9].'),
      h2('6.1 Regulatory Framework in Canada'),
      bullet([{ text: 'Canadian Food Inspection Agency (CFIA): ', bold: true }, { text: 'Oversees the Safety of Human Food Regulations and administers the National Salmonella Action Plan for Chicken (NSAPC). The NSAPC includes pre-harvest surveillance of commercial broiler flocks, with testing conducted at defined intervals before slaughter. Positive flock results may trigger additional interventions at the processing plant [3].' }]),
      bullet([{ text: 'Chicken Farmers of Canada (CFC): ', bold: true }, { text: 'Administers the On-Farm Food Safety (OFFS) Program for broiler producers, which requires documented biosecurity and Salmonella control practices. Producers are subject to third-party audits [3].' }]),
      bullet([{ text: 'Egg Farmers of Canada (EFC): ', bold: true }, { text: 'Administers the Start Clean and Stay Clean on-farm food safety program for commercial egg producers, which includes requirements for Salmonella control and flock testing [3].' }]),
      bullet([{ text: 'Reportable diseases: ', bold: true }, { text: 'Salmonella Pullorum and Salmonella Gallinarum are reportable diseases under federal and most provincial regulations. Any suspected case must be reported to your provincial veterinarian or the CFIA immediately [3].' }]),
      h2('6.2 Record-Keeping'),
      para('If your flock tests positive and CFIA comes knocking, your records decide whether the situation is manageable or serious. Records are not paperwork, they are proof that you were running a clean, responsible operation. At minimum, keep:'),
      bullet([{ text: 'Visitor and crew log: ', bold: true }, { text: 'Date, name, organization, and recent farm contacts for every person who enters the production area.' }]),
      bullet([{ text: 'Flock placement records: ', bold: true }, { text: 'Source of chicks or pullets, arrival date, number of birds, any health concerns noted at delivery.' }]),
      bullet([{ text: 'Feed records: ', bold: true }, { text: 'Feed supplier, delivery dates, batch or lot numbers. Retain delivery tickets.' }]),
      bullet([{ text: 'Cleanout and disinfection records: ', bold: true }, { text: 'Date, products used, concentrations, contact times, and environmental swab results for each flock cycle.' }]),
      bullet([{ text: 'Salmonella testing results: ', bold: true }, { text: 'Flock-level results from integrator or provincial testing programs and any on-farm environmental monitoring results.' }]),
      bullet([{ text: 'Pest control records: ', bold: true }, { text: 'Dates of inspections, rodent activity levels observed, bait products used, and contractor visit records.' }]),
      para('All records should be retained for a minimum of 2 years or as required by your provincial food safety program.'),
      h2('6.3 Monitoring Flock Health'),
      para('Your birds will not tell you when Salmonella is shedding, but they will give you small signs that something in the barn is off. Your daily walk is the most under-used food safety tool you own. What to look for:'),
      bullet('Walk the barn at least twice daily and record observations.'),
      bullet('Check feed and water consumption. Unexpected drops are one of the earliest indicators of flock stress or disease.'),
      bullet('Observe bird behavior and distribution. Huddling, crowding near feeders and drinkers, or avoiding certain areas are warning signs.'),
      bullet('Assess litter condition. Wet areas under drinker lines or unexplained wet patches may indicate leaks or abnormal fecal output.'),
      bullet('Note fecal consistency and color. Loose, watery, or discolored droppings can indicate enteric infection.'),
      bullet('Count and record daily mortality. Remove dead birds immediately.'),
      bullet('Report any unusual signs to your veterinarian promptly. Early investigation prevents disease from spreading.'),
      h2('6.4 Key Takeaways'),
      bullet('Salmonella is a zoonotic pathogen that can be carried by healthy-appearing birds and transmitted to humans through poultry products.'),
      bullet('The two serovars of greatest food safety concern in Canadian poultry are Salmonella Enteritidis and Salmonella Typhimurium.'),
      bullet('Control requires a layered approach: biosecurity, feed and water management, competitive exclusion, vaccination (where appropriate), hygiene, and monitoring.'),
      bullet('All-in and all-out management, combined with thorough cleanout and disinfection between flocks, is the most effective tool for breaking the Salmonella cycle between flocks.'),
      bullet('All poultry products must reach 74°C internal temperature to ensure Salmonella destruction.'),
      bullet('Record-keeping is not administrative burden; it is the evidence that your food safety program works.'),
      bullet('Salmonella Pullorum and Salmonella Gallinarum are reportable diseases; suspected cases must be reported to CFIA immediately.'),
      pageBreak(),
    ],
  };
}

// ============================================================
// RECOMMENDED JOURNALS
// ============================================================
function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para('If you want to keep up with the science behind anything in this course, these are the journals where the work shows up. Most of them have open-access articles, and your provincial extension service usually carries plain-language summaries of the bigger papers.'),
      bullet([{ text: 'Poultry Science ', italics: true }, { text: '(official journal of the Poultry Science Association): Publishes original research on all aspects of poultry biology, health, and production, including Salmonella epidemiology and control.' }]),
      bullet([{ text: 'Avian Diseases ', italics: true }, { text: '(official journal of the American Association of Avian Pathologists): Focuses on poultry and avian health, with frequent Salmonella-related content.' }]),
      bullet([{ text: 'Avian Pathology ', italics: true }, { text: '(official journal of the World Veterinary Poultry Association): International journal covering avian infectious diseases, including Salmonella serovars and control strategies.' }]),
      bullet([{ text: 'Zoonoses and Public Health ', italics: true }, { text: '(Wiley-Blackwell): Covers the science of zoonotic diseases at the human-animal-environment interface, including foodborne Salmonella.' }]),
      bullet([{ text: 'Journal of Food Protection ', italics: true }, { text: '(International Association for Food Protection): Covers food safety science, including pathogen reduction in poultry processing and handling.' }]),
      bullet([{ text: 'Foodborne Pathogens and Disease ', italics: true }, { text: '(Mary Ann Liebert): Publishes research on the epidemiology, ecology, and control of foodborne pathogens, including Salmonella in poultry supply chains.' }]),
      bullet([{ text: 'International Journal of Food Microbiology ', italics: true }, { text: '(Elsevier): Broad food microbiology scope including Salmonella ecology, antimicrobial resistance, and control interventions.' }]),
      pageBreak(),
    ],
  };
}

// ============================================================
// REFERENCES
// ============================================================
function buildReferencesSection() {
  const refs = [
    '[1]  Russell SM. Controlling Salmonella in Poultry Production. Woodhead Publishing; 2012.',
    '[2]  Public Health Agency of Canada. Salmonellosis (non-typhoidal) [Internet]. Ottawa: Government of Canada; 2023 [cited 2026 Apr]. Available from: phac-aspc.gc.ca',
    '[3]  Canadian Food Inspection Agency. National Salmonella Action Plan for Chicken [Internet]. Ottawa: Government of Canada; 2023 [cited 2026 Apr]. Available from: inspection.canada.ca',
    '[4]  Swayne DE, Boulianne M, Logue CM, McDougald LR, Nair V, Suarez DL, editors. Diseases of Poultry. 14th ed. Hoboken (NJ): Wiley-Blackwell; 2020.',
    '[5]  Bell DD, Weaver WD. Commercial Chicken Meat and Egg Production. 5th ed. Norwell (MA): Springer; 2002.',
    '[6]  Tablante NL. Common Poultry Diseases and Their Prevention. eXtension; 2013.',
    '[7]  World Health Organization. WHO List of Critically Important Antimicrobials for Human Medicine. 6th rev. Geneva: WHO; 2019.',
    '[8]  CEVA Sante Animale. CEVA Handbook of Poultry Diseases. Vol 1. Libourne: CEVA; 2020.',
    '[9]  National Farm Animal Care Council (NFACC). Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens and Turkeys. Lacombe (AB): NFACC; 2016.',
  ];

  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('References'),
      para('References are listed in order of first citation. This course draws primarily from the following peer-reviewed textbooks, regulatory guidance documents, and industry resources held in the Canadian Poultry Consultants reference library.'),
      ...refs.map(r => new Paragraph({
        children: [new TextRun({ text: r, color: BODY_GRAY, size: 22, font: 'Calibri' })],
        spacing: { after: 120, line: 260, lineRule: 'auto' },
        indent:  { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.4) },
      })),
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
          {
            level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 24, color: BODY_GRAY },
            },
          },
          {
            level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 22, color: BODY_GRAY },
            },
          },
        ],
      },
      {
        reference: 'numbered-list',
        levels: [
          {
            level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.35) }, spacing: { after: 80 } },
              run: { font: 'Calibri', size: 24, color: BODY_GRAY },
            },
          },
        ],
      },
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
        run: { font: 'Calibri', size: 24, color: BODY_GRAY },
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
// BUILD AND WRITE
// ============================================================
async function main() {
  console.log('Building Course 4: Salmonella and Food Safety...');

  const doc = new Document({
    creator:     'Canadian Poultry Consultants',
    title:       'Salmonella and Food Safety',
    description: 'Course 4 of 17 — CPC Short Courses',
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
      buildJournalSection(),
      buildReferencesSection(),
    ],
  });

  let buffer = await Packer.toBuffer(doc);

  // Post-process with JSZip:
  //  1. settings.xml — strip <w:updateFields> (prevents auto-update dialog)
  //  2. document.xml — strip w:dirty="true" (suppresses "update fields" dialog on open)
  //  3. document.xml — inject pre-cached TOC entries with page numbers so the TOC
  //     displays correctly immediately without requiring a manual update
  //  4. document.xml — italicize formal Latin genus/species names in all body text
  const zip = await JSZip.loadAsync(buffer);

  // 1. settings.xml
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  zip.file('word/settings.xml', settings);

  // 2-4. document.xml
  let docXml = await zip.file('word/document.xml').async('string');

  // 2. Remove w:dirty="true" from every fldChar element
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  // 3. Inject pre-cached TOC entries with estimated page numbers
  //    Format: TOC1/TOC2 styled paragraphs with dot-leader tab + page number
  //    Each entry is wrapped in a hyperlink so Ctrl+click jumps to the matching
  //    heading bookmark we inject below.
  const entriesWithAnchor = [
    { lvl: 1, text: 'Introduction', page: 4 },
    { lvl: 2, text: 'Learning Objectives', page: 4 },
    { lvl: 1, text: 'Section 1: Understanding Salmonella', page: 5 },
    { lvl: 2, text: '1.1  What Is Salmonella?', page: 5 },
    { lvl: 2, text: '1.2  The Biology of Salmonella', page: 6 },
    { lvl: 2, text: '1.3  How Salmonella Affects Birds', page: 6 },
    { lvl: 2, text: '1.4  How Salmonella Affects Humans', page: 7 },
    { lvl: 2, text: '1.5  How Salmonella Spreads: Transmission Routes', page: 7 },
    { lvl: 1, text: 'Section 2: Risks on the Poultry Farm', page: 8 },
    { lvl: 2, text: '2.1  Contaminated Feed', page: 8 },
    { lvl: 2, text: '2.2  Contaminated Water', page: 8 },
    { lvl: 2, text: '2.3  Carrier Birds and Asymptomatic Shedding', page: 9 },
    { lvl: 2, text: '2.4  Wild Animals, Rodents, and Insects', page: 9 },
    { lvl: 2, text: '2.5  Farm Worker Practices', page: 9 },
    { lvl: 2, text: '2.6  Equipment and Litter', page: 10 },
    { lvl: 1, text: 'Section 3: Prevention and Control Measures', page: 10 },
    { lvl: 2, text: '3.1  Biosecurity: The Foundation', page: 10 },
    { lvl: 2, text: '3.2  Feed and Water Safety', page: 11 },
    { lvl: 2, text: '3.3  Competitive Exclusion', page: 11 },
    { lvl: 2, text: '3.4  Vaccination', page: 12 },
    { lvl: 2, text: '3.5  Rodent and Pest Control', page: 12 },
    { lvl: 2, text: '3.6  Salmonella Monitoring and Testing', page: 12 },
    { lvl: 1, text: 'Section 4: Good Hygiene Practices', page: 13 },
    { lvl: 2, text: '4.1  Handwashing', page: 13 },
    { lvl: 2, text: '4.2  Protective Clothing and Footwear', page: 13 },
    { lvl: 2, text: '4.3  Barn Cleanout and Disinfection', page: 14 },
    { lvl: 2, text: '4.4  Waste Management', page: 15 },
    { lvl: 1, text: 'Section 5: Safe Processing and Storage', page: 15 },
    { lvl: 2, text: '5.1  Pre-Harvest Management', page: 15 },
    { lvl: 2, text: '5.2  Temperature Control', page: 16 },
    { lvl: 2, text: '5.3  Egg Safety: On-Farm Practices for Layer Operations', page: 16 },
    { lvl: 2, text: '5.4  Preventing Cross-Contamination', page: 17 },
    { lvl: 1, text: 'Section 6: Farmer Responsibilities and Consumer Safety', page: 18 },
    { lvl: 2, text: '6.1  Regulatory Framework in Canada', page: 18 },
    { lvl: 2, text: '6.2  Record-Keeping', page: 18 },
    { lvl: 2, text: '6.3  Monitoring Flock Health', page: 19 },
    { lvl: 2, text: '6.4  Key Takeaways', page: 19 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals', page: 20 },
    { lvl: 1, text: 'References', page: 21 },
  ].map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function tocRow(e) {
    const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
    const indent = e.lvl === 1 ? '' : '<w:ind w:left="440"/>';
    const text = escapeXml(e.text);
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

  const tocEntries = entriesWithAnchor.map(tocRow).join('');

  const sepTag = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx = docXml.indexOf(sepTag);
  if (sepIdx !== -1) {
    const endIdx = docXml.indexOf(endTag, sepIdx);
    if (endIdx !== -1) {
      docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
    }
  }

  // 3b. Inject bookmarks around the matching heading paragraphs so the TOC
  //     hyperlinks resolve. Walk Heading1/Heading2 paragraphs in document
  //     order and consume entries one at a time.
  {
    let entryIdx = 0;
    let bookmarkId = 1000;
    const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    docXml = docXml.replace(headingRegex, (match, lvlStr) => {
      if (entryIdx >= entriesWithAnchor.length) return match;
      const lvl = Number(lvlStr);
      const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
      const heading = textRuns.trim();
      const entry = entriesWithAnchor[entryIdx];
      // Compare loosely on whitespace (TOC text uses two spaces between number and title)
      const norm = (s) => s.replace(/\s+/g, ' ').trim();
      if (lvl !== entry.lvl) return match;
      if (norm(heading) !== norm(entry.text)) return match;
      entryIdx++;
      const id = bookmarkId++;
      return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
    });
    if (entryIdx !== entriesWithAnchor.length) {
      console.warn(`Course 4 TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
    }
  }

  // 4. Italicize formal Latin genus/species names in all non-heading paragraphs
  //    Rule: Salmonella (genus) always italic; Salmonella + known lowercase species also italic
  //    Serovar names (Enteritidis, Typhimurium, Pullorum, Gallinarum, Infantis) NOT italic
  //    Alphitobius diaperinus (darkling beetle) also italic
  //
  //    IMPORTANT: <w:i/> must be inserted at the correct OOXML position within <w:rPr>:
  //    after <w:rFonts> and <w:b>/<w:bCs>, but BEFORE <w:color> and <w:sz>.
  //    Inserting at the start (after <w:rPr>) violates schema order and Word silently ignores it.
  function insertItalic(rPr) {
    if (!rPr) return '<w:rPr><w:i/></w:rPr>';
    // The docx library writes <w:i w:val="false"/> on every non-italic run.
    // Adding a second <w:i/> after it is invalid OOXML — Word uses the first one and
    // ignores the second, so italic never renders. Replace the explicit-false instead.
    if (rPr.includes('<w:i w:val="false"/>')) {
      return rPr
        .replace('<w:i w:val="false"/>', '<w:i/>')
        .replace('<w:iCs w:val="false"/>', '<w:iCs/>');
    }
    // Already italic (e.g. figure captions) — no change needed
    if (/<w:i\/>|<w:i>/.test(rPr)) return rPr;
    // No italic element at all — insert before <w:color> or <w:sz> (correct OOXML position)
    for (const anchor of ['<w:color ', '<w:sz ', '<w:szCs ', '</w:rPr>']) {
      const idx = rPr.indexOf(anchor);
      if (idx !== -1) return rPr.slice(0, idx) + '<w:i/>' + rPr.slice(idx);
    }
    return rPr.replace('<w:rPr>', '<w:rPr><w:i/>');
  }

  docXml = docXml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, para => {
    if (/w:val="Heading[123]"/.test(para)) return para;
    return para.replace(
      /(<w:r\b[^>]*>)((?:<w:rPr>[\s\S]*?<\/w:rPr>)?)(<w:t(?:\s+xml:space="preserve")?>)([\s\S]*?)(<\/w:t>\s*<\/w:r>)/g,
      (m, rOpen, rPr, _tOpen, text) => {
        if (!/Salmonella|Alphitobius/.test(text)) return m;
        const rPrItalic = insertItalic(rPr);
        const parts = [];
        let last = 0;
        const taxRe = /Salmonella(?:[ ](?:arizonae|typhimurium|enterica|bongori))?|Alphitobius[ ]+diaperinus/g;
        let sm;
        while ((sm = taxRe.exec(text)) !== null) {
          if (sm.index > last) parts.push({ t: text.slice(last, sm.index), i: false });
          parts.push({ t: sm[0], i: true });
          last = sm.index + sm[0].length;
        }
        if (last < text.length) parts.push({ t: text.slice(last), i: false });
        return parts
          .filter(p => p.t.length > 0)
          .map(p => `${rOpen}${p.i ? rPrItalic : rPr}<w:t xml:space="preserve">${p.t}</w:t></w:r>`)
          .join('');
      }
    );
  });

  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found), Word will reject`);

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
}

main().catch(err => { console.error(err); process.exit(1); });
