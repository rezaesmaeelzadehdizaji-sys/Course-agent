// ============================================================
// generate-course10.mjs — Course 10: Necropsy of Normal Birds
// CPC Short Courses
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course10.mjs
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
const OUT_DIR   = path.join(__dirname, 'Course 10');
const OUT_FILE  = path.join(OUT_DIR, 'Necropsy_Normal_Birds_draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');

const COURSE_TITLE = 'Necropsy of Normal Birds';

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}
function productBuf(name) {
  const p = path.join(OUT_DIR, `product_${name}.jpg`);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}
function jpegDims(buf) {
  let i = 2;
  while (i < buf.length - 10) {
    if (buf[i] !== 0xFF) break;
    const marker = buf[i + 1];
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
      return { h: (buf[i+5]<<8)|buf[i+6], w: (buf[i+7]<<8)|buf[i+8] };
    }
    const segLen = (buf[i+2]<<8)|buf[i+3];
    i += 2 + segLen;
  }
  return null;
}

// COLORS
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

// HELPERS
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
function numberedRef(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })],
    numbering: { reference: 'references-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
function image(buf, caption, widthIn = 5.9) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.6);
  const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
  const type = isJpeg ? 'jpg' : 'png';
  try {
    if (isJpeg) {
      const d = jpegDims(buf);
      if (d && d.w > 0 && d.h > 0) hpx = Math.round(wpx * d.h / d.w);
    } else {
      const view = new DataView(buf.buffer, buf.byteOffset);
      const pw   = view.getUint32(16, false);
      const ph   = view.getUint32(20, false);
      if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
    }
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type })],
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
function productImage(buf, caption, widthIn = 2.3) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 1.33);
  try {
    const d = jpegDims(buf);
    if (d) hpx = Math.round(wpx * d.h / d.w);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'jpg' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
    }),
  ];
}
function photoPlaceholder(label, brief, captionText) {
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: label, color: '595959', size: 22, font: 'Calibri', bold: true })], alignment: AlignmentType.CENTER, spacing: { before: convertInchesToTwip(0.25), after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: brief, color: '888888', size: 20, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: 'Photograph to be supplied by CPC team.', color: 'BBBBBB', size: 18, font: 'Calibri', italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: convertInchesToTwip(0.25) } }),
              ],
              shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
              borders: {
                top:    { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                left:   { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                right:  { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
              },
              margins: { top: convertInchesToTwip(0.2), bottom: convertInchesToTwip(0.2), left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: captionText, italics: true, color: '555555', size: 20, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 } }),
  ];
}

// HEADER / FOOTER
function buildHeader() {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
          new TextRun({ text: COURSE_TITLE, color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
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
          new TextRun({ text: 'CPC Short Courses  |  Course 10  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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

// COVER
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 10: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 },
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
    children.push(new Paragraph({
      children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
      alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
    }));
  }
  children.push(
    new Paragraph({
      children: [new TextRun({ text: COURSE_TITLE, bold: true, color: DARK_BLUE, size: 52, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Knowing What Healthy Looks Like, So You Can Spot What Is Not', color: MED_BLUE, size: 26, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 560 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '', color: GOLD })],
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
      spacing: { before: 0, after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'CPC Short Courses', bold: true, color: '595959', size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Duration: 1-Hour Lecture, 1-Hour Workshop', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Prerequisite: Course 6 (Poultry Anatomy and Physiology)', color: '595959', size: 22, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'June 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 800 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature, industry management guides, and veterinary anatomy and diagnostic resources. This material does not replace the advice of a licensed veterinarian or pathologist. Always handle dead birds and tissues under your farm biosecurity plan.', color: '808080', size: 18, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
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

// TOC + INTRO
function buildIntroSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', { headingStyleRange: '1-2' }),

      h1('Introduction'),
      para('A necropsy, the careful post-mortem examination of a bird, is one of the most useful tools you have for understanding what is really going on in your flock [1]. But here is the part farmers often miss. You cannot recognize a sick organ until you know exactly what a healthy one looks like. A swollen liver only looks swollen if you have handled dozens of normal livers first. A cloudy air sac only stands out if you know an air sac should be clear enough to read through. This course is about building that eye.'),
      para('The CPC Learning Centre \'Spotting Disease Early\' guide says it plainly: knowing what is normal, and how to detect what is abnormal, is the heart of good flock management [2]. So before we ever talk about lesions and disease, which is the job of Course 11, we are going to open healthy birds on purpose. We will walk through a clean, systematic necropsy and look at every organ the way it should look in a bird that was doing fine.'),
      para('Because a fast-growing meat bird and a hen in full lay are built for completely different jobs, their insides look different too. A normal broiler is mostly muscle. A normal layer is mostly a working egg factory. This course covers both, so you can read either bird with confidence and tell the difference between a true problem and a perfectly normal feature. That skill helps you catch disease early, spot a feed or management issue, and talk clearly with your veterinarian and the diagnostic lab.'),
      para('This is a hands-on module. The lecture builds the picture in your head, and the workshop puts a knife in your hand. By the end, opening a bird should feel routine, and a healthy organ should look familiar enough that an abnormal one jumps right out at you.'),

      h2('Learning Objectives'),
      bullet('Explain why opening a healthy bird is the foundation for ever recognizing a sick one.'),
      bullet('Carry out a basic necropsy safely and in the same order every time, under proper biosecurity.'),
      bullet('Identify the normal appearance, color, texture, and size of every major organ system.'),
      bullet('Recognize the normal growth features of meat birds (broilers).'),
      bullet('Describe the normal reproductive features of layers and breeders, including how an egg is built.'),
      bullet('Compare normal anatomy between a fast-growing broiler and an egg-producing hen.'),
      bullet('Tell normal findings apart from the early signs of disease, nutritional shortfall, or a management slip.'),
      bullet('Use what you see on the table to make better flock health and management decisions.'),
    ],
  };
}

// SECTION 1
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 1: Purpose of Conducting a Necropsy on Normal Birds'),

      h2('1.1 Why It Is Important to Learn Normal Anatomy'),
      para('Think about how you already read your flock. You know what a healthy bird sounds like at night, how feed should be disappearing, and what normal droppings look like. The inside of the bird works exactly the same way. Once you have seen enough normal hearts, livers, and guts, your eye learns the pattern, and anything off that pattern stands out fast [3].'),
      para('This is why we start with healthy birds. A bird that died of old age, an injury, or was culled for a leg problem still has a full set of normal organs to study. Open it on a quiet day, with no pressure to find a cause, and just look. Build a memory of normal color, normal size, and normal feel. That memory is the reference you will measure every future bird against. For the full picture of how each organ system is built and what it does, see Course 6 (Poultry Anatomy and Physiology) in this series, which is the prerequisite for this course.'),
      ...image(figBuf('fig10_1.png'), 'Figure 1.1: Knowing normal is the first link in the chain. It is what lets you catch a change early, reach a diagnosis faster, and keep losses down. Source: CPC Short Courses.'),

      h2('1.2 How Baseline Knowledge Improves Disease Detection'),
      para('A necropsy is only as good as the person reading the bird. Two people can open the same carcass. One sees a jumble of organs. The other sees a slightly pale liver and a touch of fluid around the heart and knows to take samples. The difference is not talent. It is having a clear baseline of normal in your head [1,2].'),
      para('The CPC Learning Centre \'Spotting Disease Early\' guide makes the same point about the whole bird, inside and out. It walks the farmer from the head to the toes, checking color, size, shape, and position of each part, asking one question at every step: is this normal, or is something off [2]? A necropsy is that same head-to-toe habit, just carried on into the body cavity.'),
      para('There is a money side to this too. A bird submitted to the lab with a clear story and clean samples gets a faster, surer answer. A bird opened by someone who cannot tell a normal spleen from a swollen one wastes everyone\'s time and can send you chasing the wrong problem. Learning normal first is the cheapest insurance you can buy against a missed or delayed diagnosis [1].'),
    ],
  };
}

// SECTION 2
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 2: General Necropsy Procedure'),

      h2('2.1 Needed Tools, Preparation, and Biosecurity'),
      para('You do not need a fancy lab to do a good farm necropsy. You need a few sharp tools, a cleanable surface, and a plan. A basic kit covers most birds: a sharp knife with a 4 to 6 inch blade, a pair of poultry or bone shears for cutting ribs, tissue scissors, forceps with teeth for holding tissue, and disposable gloves [1]. If you plan to send anything to the lab, add some jars of 10 percent buffered formalin, a marker, and labeling tape so samples are ready to go [1].'),
      ...image(figBuf('fig10_2.png'), 'Figure 2.1: A simple, reliable necropsy kit. Lay it all out before you start so you never have to stop mid-bird to hunt for a tool. Source: CPC Short Courses.'),
      para('Set out everything before the first cut. Once your hands are dirty and you are inside the bird, stopping to find a tool is how samples get contaminated and how you lose your place in the routine. Work on a surface you can disinfect, or lay down a fresh plastic sheet for each session.'),
      para('Biosecurity runs the whole time. A dead bird can still carry live pathogens, and some of them can make people sick. Wear dedicated barn footwear and disposable gloves, keep the work area away from live birds and feed, and wash your hands before and after [1]. If you ever suspect a serious reportable disease or a bug that infects people, stop, close the bird up, and call your veterinarian rather than carrying on. Dedicated boots keep what is on the necropsy floor from walking back into your barns.'),
      ...productImage(productBuf('elastic_top_boots'), 'Photo 2.1: Elastic Top Boots. Durable rubber boots kept just for the necropsy and barn-entry routine, easy to wash and disinfect. Source: canadianpoultry.ca/shop.'),
      para('When you are done, clean up like you mean it. Bag the carcass and tissues for proper disposal under your farm plan, then wash and disinfect every tool, the table, and your boots. A foaming chlorine wash lifts the organic muck off tools and surfaces, and a broad-spectrum disinfectant finishes the job on anything that touched the bird.'),
      ...productImage(productBuf('chlorinated_evo_wash'), 'Photo 2.2: Chlorinated EVO Wash. A foaming chlorine-based wash for cleaning organic matter off necropsy tools and surfaces before disinfection. Source: canadianpoultry.ca/shop.'),
      ...productImage(productBuf('virocid'), 'Photo 2.3: Virocid. A broad-spectrum disinfectant for the final wipe-down of tools, the table, and footwear after a necropsy session. Source: canadianpoultry.ca/shop.'),

      h2('2.2 Opening the Bird and Exposing the Organ Systems'),
      para('A good necropsy is one you do the same way every single time. When the routine never changes, you never skip an organ, and your normal picture stays consistent from bird to bird [4]. The systematic method below follows the standard field sequence used in poultry practice [1,4].'),
      ...image(figBuf('fig10_3.png'), 'Figure 2.2: The same five-stage routine, bird after bird. A fixed order is what keeps you from missing something. Source: CPC Short Courses.'),
      para('Here is the routine, stage by stage:'),
      numbered('Before you cut. Review the flock history and note what the live birds were doing. Euthanize the bird humanely by cervical dislocation if it is not already dead. Then look it over from the outside, head to toe, before you open anything [1,2].'),
      numbered('Start at the head. Wet the feathers down so they do not get in the way. Lay the bird on its back. Open the mouth and look in. Follow the throat down, open the windpipe, and check the sinuses just under the eyes. This is where you catch early airway changes [1,4].'),
      numbered('Open the body. Cut the skin between each leg and the belly, then pull and twist the legs outward until both hips pop free and the bird lies flat. Cut and peel the breast skin back to expose the big breast muscles and the belly wall [4].'),
      numbered('Expose the organs. Cut along both sides of the breastbone and through the ribs, then lift the whole breast plate off. Now the chest and belly are open in one clean view. Look at the surface of everything before you start moving organs around [4].'),
      numbered('Examine in order. Work through every system the same way each time: liver, spleen, and pancreas, then heart and lungs, then the air sacs, then the full gut from crop to vent including the cecal tonsils, then the kidneys, the sciatic nerves in the legs, the joints, and finally the brain [1,4].'),
      para('Take it slow the first few times. Speed comes on its own once the order is burned into your hands. The goal is not to be fast. The goal is to see every organ, every time.'),
    ],
  };
}

// SECTION 3
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 3: Normal Anatomy Overview (All Bird Types)'),

      h2('3.1 External Examination: Skin, Feathers, Joints, and Feet'),
      para('The necropsy starts before you open the bird. The outside tells you a lot, and it is the same head-to-toe check the CPC Learning Centre \'Spotting Disease Early\' guide uses on live birds [2]. Run your eye and your hands over the whole carcass first.'),
      bullet([{ text: 'Skin and feathers: ', bold: true }, { text: 'Healthy skin is a soft, even cream to pale yellow, depending on diet, with no scabs, bruising, or swelling. Feathers should be clean, well-set, and full for the bird\'s age. Note any bare patches, soiling around the vent, or caked litter on the feet.' }]),
      bullet([{ text: 'Head: ', bold: true }, { text: 'Eyes bright and clear, nostrils clean and dry, comb and wattles a normal full color for the bird type. The sinuses just below the eyes should be flat, not puffed up.' }]),
      bullet([{ text: 'Joints and legs: ', bold: true }, { text: 'Hocks and feet should be cool, smooth, and the same size on both sides. A normal joint is not hot, swollen, or hard. Footpads should be smooth, without deep cracks or black scabs.' }]),
      bullet([{ text: 'Body condition: ', bold: true }, { text: 'Run a finger along the keel bone in the center of the breast. In a well-conditioned bird the breast muscle is full and rounds out on either side of the keel. A sharp, prominent keel with sunken muscle means the bird was thin.' }]),
      ...image(figBuf('photo3_1_broiler_external.jpg'), 'Photo 3.1: A healthy eight-week-old broiler. Clean, well-set feathers, a bright clear eye, and a full breast. Get your eye used to a normal bird on the outside before you ever open one. Source: AJ. Adekunle, Wikimedia Commons (CC BY-SA 4.0).', 3.3),

      h2('3.2 Internal Organs: Heart, Lungs, Liver, Spleen, and Intestines'),
      para('Once the breast plate is off, the chest and belly open up in front of you. Before you move anything, take in where each organ sits and how it looks. Photo 3.2 shows the normal layout you should expect [3,4].'),
      ...image(figBuf('photo3_2_necropsy_organs.png'), 'Photo 3.2: The chest and belly of a healthy bird with the breast plate lifted. Knowing where each organ belongs is half the battle. Source: CPC Short Courses.'),
      para('Here is what normal looks like, organ by organ:'),
      bullet([{ text: 'Heart: ', bold: true }, { text: 'Sits high and central, tucked in a thin clear sac. It is a firm, pale to medium red cone with smooth surfaces. The sac around it (the pericardium) holds only a tiny amount of clear fluid. Cloudy fluid or a thick coating is not normal [4].' }]),
      bullet([{ text: 'Lungs: ', bold: true }, { text: 'A pair of bright pink, spongy organs pressed up against the ribs along the back. In a healthy bird they sit flush against the back wall and spring back when pressed. They should not be firm, dark, or wet [3].' }]),
      bullet([{ text: 'Liver: ', bold: true }, { text: 'The biggest organ in the belly, in two lobes, a deep red-brown with smooth, sharp edges. In a young bird right after a meal it can carry a normal tan, slightly fatty look. A liver that is pale, yellow and greasy, or crumbly, or that has a coating on it, is worth a closer look [3,4].' }]),
      bullet([{ text: 'Spleen: ', bold: true }, { text: 'A small, round, dark red to purple organ, about the size of a cherry, sitting near the junction of the proventriculus and gizzard. Normal is small and firm. A spleen swollen to two or three times that size points to a problem [3,4].' }]),
      bullet([{ text: 'Gizzard and proventriculus: ', bold: true }, { text: 'The proventriculus is the glandular stomach, a short tube before the gizzard. The gizzard is the thick muscular grinder, pale and very firm, usually holding grit and feed. Its tough inner lining peels back to a green-yellow surface, which is normal [5].' }]),
      bullet([{ text: 'Intestines and ceca: ', bold: true }, { text: 'A soft, coiled, pink-tan tube running from the gizzard to the vent. Chickens have two blind pouches called ceca that branch off near the end and normally hold pasty, mustard-brown contents. A small bump partway down the small intestine, called Meckel\'s diverticulum, is a normal leftover from the embryo, not a lesion [5].' }]),
      bullet([{ text: 'Kidneys: ', bold: true }, { text: 'Deep red-brown organs set into the bone along the back, in three sections on each side. You see them after the gut is lifted out. Pale, swollen kidneys with white urate streaks running through them can signal a problem, though a little white urate is normal [3].' }]),

      h2('3.3 Normal Colors, Textures, and Organ Sizes'),
      para('Color, texture, and size are your three quick checks on any organ. With a healthy bird in front of you, these become second nature. The table below is a pocket reference for what normal looks and feels like in a chicken [3,4,5].'),
      normalOrganTable(),
      new Paragraph({ spacing: { before: 80, after: 0 } }),
      para('Two cautions on color. First, diet changes things. Birds on high-corn diets store more yellow pigment, so skin and fat run more yellow, which is normal. Second, a recently dead bird that has sat too long will discolor on its own as it breaks down. That is why fresh birds give the truest picture, and why a bird that has been dead for hours can fool you into seeing problems that were never there [1].'),
    ],
  };
}

function normalOrganTable() {
  const colW = [1900, 2400, 2400, 1940];
  const hdrBg = '2E74B5';
  const altBg = 'EBF2FA';
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
  const hdrCell = (text, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA }, borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })] })],
  });
  const dataCell = (text, i, shade) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA }, borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.LEFT, spacing: { before: 50, after: 50 }, children: [run(text, { size: 18, color: BODY_GRAY })] })],
  });
  const headers = ['Organ', 'Normal color', 'Normal texture', 'Normal size'];
  const rows = [
    ['Heart', 'Pale to medium red', 'Firm, smooth', 'Small cone, central'],
    ['Liver', 'Deep red-brown', 'Smooth, sharp edges', 'Largest organ, two lobes'],
    ['Spleen', 'Dark red to purple', 'Firm, round', 'Cherry-sized'],
    ['Lungs', 'Bright pink', 'Spongy, springy', 'Flat, set against ribs'],
    ['Gizzard', 'Pale tan muscle', 'Very firm, hard', 'Large, thick-walled'],
    ['Intestines', 'Pink-tan', 'Soft, pliable', 'Long, coiled'],
    ['Kidneys', 'Red-brown', 'Soft, lobed', 'Set into the backbone'],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((cell, ci) => dataCell(cell, ci, ri % 2 === 1)) })),
    ],
  });
}

// SECTION 4
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 4: Normal Meat Bird Features (Broilers)'),
      para('A modern broiler is a young bird bred to grow fast and put on muscle. When you open one, that single fact explains most of what you see. The bird is built for meat, and almost everything inside reflects a body working hard to grow [6].'),

      h2('4.1 Musculoskeletal Development and the Large Breast Muscles'),
      para('The first thing that hits you in a broiler is the breast. The two breast muscles are huge, deep, and pale pink, far bigger in proportion than anything you see in a laying hen. That is the whole point of the bird, and it is completely normal [6]. Healthy breast muscle is firm, evenly colored, and dry to the touch.'),
      para('Because broilers grow so fast, the skeleton is racing to keep up. Leg and wing bones are still relatively soft and the growth plates are active. This is normal for a young, fast-growing bird, but it is also why leg and skeletal issues show up in this class of bird. Look for legs that are straight and even, and breast muscle that is clean. Pale streaks or hard pale patches in the breast are not normal and are worth sampling [7].'),
      ...image(figBuf('photo4_1_broiler_breast.jpg'), 'Photo 4.1: The deep, pale, firm breast muscle of a meat bird. That heavy breast, far bigger in proportion than anything on a laying hen, is the normal signature of a broiler. Source: Wikimedia Commons (public domain).', 5.0),

      h2('4.2 Heart, Liver, and Metabolic Features in Fast-Growing Birds'),
      para('Pushing that much growth puts a real load on the heart and the liver, and a normal broiler shows it. The heart is working hard to feed all that muscle with oxygen. In a healthy bird it is still a firm, clean red cone, but this is the class of bird where heart and circulation problems turn up, so it pays to know the normal heart well [7].'),
      para('The liver in a growing broiler is large and busy, processing feed into body weight. A normal broiler liver can carry a slightly tan, mildly fatty look, especially right after a good meal, and that alone is not a disease. What you are learning here is the line between a normal well-fed liver and one that has tipped into pale, greasy, or crumbly, which is not normal [3,7]. The more normal livers you handle, the easier that line is to see.'),

      h2('4.3 Typical Gastrointestinal Tract Condition'),
      para('Open the gut of a healthy, well-fed broiler and it should look busy and full. The crop at the base of the neck often holds feed and water. The gizzard is packed with ground feed and grit. The intestines are full, soft, and pink-tan, with normal pasty contents moving through [5].'),
      para('The ceca, the two blind pouches near the back end, normally hold a pasty mustard-brown material, and they empty out a looser dropping every so often, which is normal cecal dropping and not diarrhea. A healthy gut wall is thin enough that you can almost see the contents through it. A thick, reddened, or ballooned gut is a change worth noting, but in a normal bird the whole tract simply looks like a working food line [5].'),

      h2('4.4 Normal Reproductive Structures'),
      para('Here is where a young broiler looks very different from a laying hen, and it trips up a lot of beginners. In a young meat bird, the reproductive organs are tiny and undeveloped, because the bird is harvested long before it would ever mature [8]. In a young female, the ovary is a small, flat, pale patch up against the backbone, with no visible yolks. In a young male, the testes are two small, pale, bean-shaped organs in the same area.'),
      para('None of this is a problem. It is exactly what a normal immature bird should show. The mistake to avoid is looking for the big yolk cluster of a laying hen in a six-week-old broiler and thinking something is wrong because it is missing. It is supposed to be missing. We cover the fully developed version next.'),
    ],
  };
}

// SECTION 5
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 5: Normal Layer and Breeder Features'),
      para('A laying hen or a breeder is a different animal from a broiler, and her insides show it. She is older, leaner in the breast, and her body is given over to producing eggs. When you open a hen in lay, the reproductive tract is the star of the show, and it is large, active, and easy to mistake for something abnormal if you have never seen it [8].'),

      h2('5.1 Reproductive System: Ovary, Oviduct, and Egg Development'),
      para('In almost all birds, only the left ovary and oviduct develop and work. The right side regresses before the bird ever hatches and stays as a tiny remnant, which is completely normal [8]. So when you open a hen and find a working tract on the left side only, that is exactly right.'),
      para('The ovary in a hen in lay looks like a small bunch of grapes: a cluster of yolks at different sizes, from tiny pale ones up to a full yellow yolk ready to be released. The biggest one ovulates next, and the smaller ones are waiting their turn. This graded cluster is the normal sign of a productive hen [8].'),
      ...image(figBuf('fig10_5.png'), 'Figure 5.1: The normal working hen. A graded cluster of yolks on the ovary feeds into the five sections of the oviduct, which build the egg over about a day. Source: CPC Short Courses.'),
      para('Once a yolk is released, it travels down the oviduct, a long folded tube with five sections that each do one job. The infundibulum catches the yolk. The magnum wraps it in egg white. The isthmus adds the shell membranes. The shell gland lays down the hard shell, which takes the longest, around 18 to 21 hours. The vagina passes the finished egg out. Start to finish, building one egg takes about 24 to 26 hours [8].'),
      para('In a hen mid-cycle you may well find a soft, forming egg or a fully shelled egg sitting in the tract. That is normal. The whole tube will look wide, fleshy, and active in a hen at peak lay, and it shrinks right down again when she stops laying.'),

      h2('5.2 Bone Health and Keel Evaluation'),
      para('A laying hen pulls a huge amount of calcium out of her own body every day to build shells, so her skeleton tells an important story. Healthy laying birds carry a special store of bone, called medullary bone, inside the leg bones that acts as a calcium bank for shell-making. Crack a normal leg bone and that spongy inner bone is a normal finding in a hen in lay [3].'),
      para('The keel, the long breastbone down the center of the chest, is your quick body-condition check and also a calcium check. Run a finger down it. In a well-managed hen it is straight and firm with good muscle on both sides. Some older laying hens show a slightly bent or dented keel, which is common in the field. A keel and ribs that flex too easily, though, point to a calcium or bone problem rather than normal lay [3,7].'),

      h2('5.3 Organ Size and Fat Distribution in Productive Hens'),
      para('A hen in full lay reads differently from a broiler in almost every organ. The liver is large and works hard turning feed into yolk, and under the influence of laying hormones a normal laying-hen liver takes on a yellow, slightly fatty look. A bit of that is normal in a productive hen, which is the opposite of what you would call normal in a young broiler [3,7].'),
      para('Fat sits differently too. A productive hen keeps a fat pad in the lower belly and fat around the working tract, and that ebbs and flows with where she is in her laying cycle. A leaner breast on a laying hen is normal, because her body is spending its energy on eggs, not on packing muscle. Read each organ against the job the bird is doing, and a hen in lay makes perfect sense [8].'),
    ],
  };
}

// SECTION 6
function buildSection6() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 6: Comparing Bird Types: Key Differences to Note'),

      h2('6.1 Growth Versus Reproduction Priorities'),
      para('The single best trick for reading a bird on the table is to ask what job that bird was built for. A broiler is built for growth. A layer is built for eggs. Once you hold that in your head, the differences inside stop being confusing and start making sense [6,8].'),
      ...image(figBuf('fig10_6.png'), 'Figure 6.1: Same species, two different normals. A broiler is built for growth and a hen for eggs, so read each bird against its job. Source: CPC Short Courses.'),
      para('A broiler pours everything into muscle and grows out in weeks, so it is heavy in the breast with an immature tract. A layer pours everything into egg production over months, so she is leaner in the breast with a big, busy reproductive tract. Neither is wrong. They are two normal endpoints of two different jobs.'),

      h2('6.2 Body Fat, Muscle Mass, and Organ Development'),
      para('Line the two birds up and the contrasts are clear. The broiler has massive pale breast muscle and a belly fat pad from heavy feeding. The hen has moderate breast muscle and her fat shifts with the laying cycle. The broiler\'s reproductive organs are tiny threads. The hen\'s ovary is a full cluster of yolks with a wide, active oviduct [3,8].'),
      para('Even the liver reads differently. A mild fatty look is normal in a fast-fed broiler and also normal in a hen in lay, but for different reasons: growth in one, egg-yolk production in the other. The lesson is simple. Do not judge a hen\'s organs by a broiler\'s rulebook, or the other way around.'),

      h2('6.3 How Production Stage Influences Necropsy Findings'),
      para('Age and stage change what normal looks like, and this is where many false alarms come from. A young bird has a large bursa and thymus, which are immune organs that shrink as the bird matures. A pullet not yet in lay has a small, quiet reproductive tract that has not switched on yet. A hen at peak lay has a tract in full swing. A hen going out of lay has a shrinking tract that can look almost collapsed [2,3].'),
      para('So before you call anything abnormal, anchor it to the bird in front of you: its type, its age, and where it is in its production cycle. The CPC Learning Centre \'Spotting Disease Early\' guide makes the same point about live birds, noting that standards and normal appearance change as birds get older [2]. The organ is only normal or abnormal relative to what that exact bird should show right now.'),
    ],
  };
}

// SECTION 7
function buildSection7() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 7: Common Mistakes to Avoid'),
      para('Most necropsy mistakes are not about missing a lesion. They are about calling something a lesion when it was normal all along, or wrecking a good sample through sloppy handling. Knowing these traps ahead of time saves you a lot of false alarms and wasted lab fees.'),
      ...image(figBuf('fig10_7.png'), 'Figure 7.1: Three traps that turn a normal bird into a false alarm. Most lesions called in by new staff are normal structures. Source: CPC Short Courses.'),

      h2('7.1 Misinterpreting Natural Variations'),
      para('The body is full of normal structures that look alarming the first time you see them. The small bump partway down the small intestine, Meckel\'s diverticulum, is a normal embryo leftover, not a tumor. A firm, dark spleen is normal. White urate streaks in the kidneys are normal waste, not always disease. A bile-stained patch on the gut wall where the gallbladder sat is just staining [3,5].'),
      para('The fix is the whole reason this course exists. Open enough normal birds and these stop looking like findings and start looking like furniture. When you are unsure whether something is a normal variation or a real change, flag it and set it against a known healthy bird rather than guessing. Seeing true lesions side by side with normal tissue is how that doubt finally clears.'),

      h2('7.2 Poor Sampling or Contamination'),
      para('A necropsy that produces a bad sample is worse than no necropsy, because it sends a wrong answer to the lab. The rule is garbage in, garbage out. Frozen tissue is torn apart at the cell level and is useless for the pathologist, so chill samples, do not freeze them. A bird that has been dead for hours is already breaking down and will mislead you, so work with fresh birds [1].'),
      para('Cross-contamination is the other big one. If you handle the gut and then touch the lung with the same dirty blade, you can drag gut bacteria onto a clean organ and produce a false result. Work clean organs first, dirty gut last, and wipe or change tools in between. And submit a representative set, not one bird. The CPC Learning Centre \'Spotting Disease Early\' guide advises sending 10 to 12 birds when mortality is present, so the lab sees the real pattern and not one odd individual [2]. For the full process of choosing, collecting, and submitting samples to the lab, see Course 9 (The Value of Poultry Diagnostics) in this series.'),

      h2('7.3 Ignoring Age-Related Differences'),
      para('The last trap is judging an organ without thinking about the bird\'s age. The clearest example is the bursa of Fabricius, a round immune organ near the vent. In a young bird it is plump and large, and that is exactly how it should be. It reaches its biggest size in the first couple of months, then naturally shrinks as the bird matures and is nearly gone by laying age [3].'),
      para('If you do not know that, a big bursa in a young bird can look swollen and a shrunken bursa in an old hen can look diseased, when both are perfectly normal for their age. The same goes for the thymus in the neck, for fat stores, and for the whole reproductive tract. Always ask how old the bird is and what stage it is in before you decide what its organs should look like.'),
    ],
  };
}

// SECTION 8
function buildSection8() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Section 8: Hands-On Demonstration and Case Review'),
      para('The workshop is where all of this comes together. We open two healthy birds, a broiler and a layer, and walk every organ system on each one. The aim is not to find disease. The aim is to lock in what normal looks and feels like in two very different birds, so your hands and your eye both remember it [1,4].'),

      h2('8.1 Walk-Through Necropsy of a Broiler and a Layer'),
      para('We run the exact same five-stage routine on both birds, side by side. Outside check first, then head and airway, then open the body, lift the breast plate, and work through every organ in the same order. Doing them back to back is the whole point, because the contrasts teach faster than either bird alone [4].'),
      para('On the broiler, expect the signature of a meat bird: a big pale breast, a busy full gut, a large working liver, and a tiny undeveloped reproductive tract. On the layer, expect the signature of an egg producer: a leaner breast, a grape-like cluster of yolks on the ovary, a wide active oviduct that may hold a forming egg, and calcium-rich leg bones. Two healthy birds, two completely different normal pictures.'),
      ...image(figBuf('photo8_1_hen_insitu.png'), 'Photo 8.1: The layer half of the comparison, opened up with the organs still in place. The standout in a productive hen is the reproductive tract: the cluster of yellow pre-ovulatory follicles on the ovary and the wide, active oviduct (magnum, infundibulum, shell gland) filling the body cavity. A broiler the same age has almost nothing here. Source: Apperson et al., Veterinary Sciences 2017 (CC BY 4.0).', 5.0),

      h2('8.2 Identifying Healthy Organs in Both Types'),
      para('As we work, name each organ out loud and call its color, texture, and size before moving on. Heart firm and clean. Liver deep red-brown with sharp edges. Spleen small, round, and firm. Lungs bright pink and spongy. Gut soft and full. This habit of naming and grading each organ is the same skill the lab uses, and it is what you will carry back to your own barn [3,4].'),
      para('By the end of the session, opening a bird should feel routine and a healthy organ should look familiar. That is the finish line for this course. You now have a clear picture of normal in both a broiler and a hen, which is the foundation you need before moving on to diseased birds. Course 11 (Necropsy of Common Diseases) in this series picks up from here and shows you what happens to these same organs when disease strikes.'),
      ...image(figBuf('photo8_2_hen_ovary.png'), 'Photo 8.2: The same tract lifted out and laid flat. The graded cluster of developing yolks on the ovary, biggest down to smallest, is the mark of a hen in full lay, with the oviduct stretched out below. Source: Apperson et al., Veterinary Sciences 2017 (CC BY 4.0).', 5.5),
    ],
  };
}

// JOURNALS
function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para('The following journals publish current research on poultry anatomy, pathology, and diagnostics. They are useful sources for veterinarians and growers who want to keep up with the science behind what they see on the necropsy table:'),
      bullet([{ text: 'Avian Diseases ', bold: true, italics: true }, { text: '(American Association of Avian Pathologists): Focused on poultry health, pathology, and diagnostic methods.' }]),
      bullet([{ text: 'Poultry Science ', bold: true, italics: true }, { text: '(Poultry Science Association): Research on commercial poultry nutrition, physiology, anatomy, and management.' }]),
      bullet([{ text: 'Avian Pathology ', bold: true, italics: true }, { text: '(World Veterinary Poultry Association): International research on poultry diseases and pathological methods.' }]),
      bullet([{ text: 'Anatomia, Histologia, Embryologia ', bold: true, italics: true }, { text: '(Wiley): Comparative anatomy and histology across species, including poultry.' }]),
    ],
  };
}

// REFERENCES
function buildReferencesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('References'),
      para('References are listed in order of first appearance in the text. All sources are peer-reviewed literature, veterinary anatomy and diagnostic texts, or guides from recognized scientific and industry bodies.'),
      numberedRef('Butcher GD, Miles RD. Avian Necropsy Techniques [VM009]. Gainesville, FL: University of Florida IFAS Extension; [cited 2026 Jun]. Available from: ask.ifas.ufl.edu.'),
      numberedRef('Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca.'),
      numberedRef('Khamas W, Rutllant J. Anatomy and Histology of the Domestic Chicken. Hoboken, NJ: Wiley-Blackwell; 2024.'),
      numberedRef('CEVA Santé Animale. Necropsy: Broilers and Layers [Guide]. Libourne, France: CEVA Santé Animale; 2007.'),
      numberedRef('Jacob J, Pescatore T. Avian Digestive System [ASC-203]. Lexington, KY: University of Kentucky Cooperative Extension; [cited 2026 Jun]. Available from: poultry.extension.org.'),
      numberedRef('Ross Broiler Management Handbook. Huntsville, AL: Aviagen; 2025.'),
      numberedRef('Diseases of Poultry. Swayne DE, editor. 14th ed. Hoboken, NJ: John Wiley & Sons; 2020.'),
      numberedRef('Jacob J. Avian Reproductive System - Female. Poultry Extension; [cited 2026 Jun]. Available from: poultry.extension.org.'),
    ],
  };
}

// STYLES
function buildStyles() {
  return {
    default: { document: { run: { font: 'Calibri', size: 24, color: BODY_GRAY }, paragraph: { spacing: { after: 160, line: 276, lineRule: 'auto' } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', run: { font: 'Calibri Light', size: 36, bold: true, color: DARK_BLUE }, paragraph: { spacing: { before: 480, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { font: 'Calibri Light', size: 30, bold: true, color: MED_BLUE }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 } },
    ],
  };
}

// NUMBERING
function buildNumbering() {
  return {
    config: [
      { reference: 'bullet-list', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(1.0), hanging: convertInchesToTwip(0.25) } } } },
      ] },
      { reference: 'numbered-list', levels: [ { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } } ] },
      { reference: 'references-list', levels: [ { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } } ] },
    ],
  };
}

// BUILD AND WRITE
async function main() {
  console.log('Building Course 10: Necropsy of Normal Birds...');

  const doc = new Document({
    creator:     'CPC Short Courses',
    title:       COURSE_TITLE,
    description: 'Course 10 — CPC Short Courses',
    features:    { updateFields: false },
    styles:      buildStyles(),
    numbering:   buildNumbering(),
    sections: [
      buildCoverSection(),
      buildIntroSection(),
      buildSection1(),
      buildSection2(),
      buildSection3(),
      buildSection4(),
      buildSection5(),
      buildSection6(),
      buildSection7(),
      buildSection8(),
      buildJournalSection(),
      buildReferencesSection(),
    ],
  });

  let buffer = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);

  // settings.xml
  let settings = await zip.file('word/settings.xml').async('string');
  settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
  if (!settings.includes('<w:updateFields')) {
    settings = settings.replace('<w:displayBackgroundShape/>', '<w:displayBackgroundShape/><w:updateFields w:val="false"/>');
  }
  zip.file('word/settings.xml', settings);

  let docXml = await zip.file('word/document.xml').async('string');
  docXml = docXml.replace(/\s*w:dirty="true"/g, '');

  const entriesWithAnchor = [
    { lvl: 1, text: 'Introduction', page: 3 },
    { lvl: 2, text: 'Learning Objectives', page: 3 },
    { lvl: 1, text: 'Section 1: Purpose of Conducting a Necropsy on Normal Birds', page: 4 },
    { lvl: 2, text: '1.1 Why It Is Important to Learn Normal Anatomy', page: 4 },
    { lvl: 2, text: '1.2 How Baseline Knowledge Improves Disease Detection', page: 5 },
    { lvl: 1, text: 'Section 2: General Necropsy Procedure', page: 6 },
    { lvl: 2, text: '2.1 Needed Tools, Preparation, and Biosecurity', page: 6 },
    { lvl: 2, text: '2.2 Opening the Bird and Exposing the Organ Systems', page: 8 },
    { lvl: 1, text: 'Section 3: Normal Anatomy Overview (All Bird Types)', page: 10 },
    { lvl: 2, text: '3.1 External Examination: Skin, Feathers, Joints, and Feet', page: 10 },
    { lvl: 2, text: '3.2 Internal Organs: Heart, Lungs, Liver, Spleen, and Intestines', page: 11 },
    { lvl: 2, text: '3.3 Normal Colors, Textures, and Organ Sizes', page: 13 },
    { lvl: 1, text: 'Section 4: Normal Meat Bird Features (Broilers)', page: 14 },
    { lvl: 2, text: '4.1 Musculoskeletal Development and the Large Breast Muscles', page: 14 },
    { lvl: 2, text: '4.2 Heart, Liver, and Metabolic Features in Fast-Growing Birds', page: 15 },
    { lvl: 2, text: '4.3 Typical Gastrointestinal Tract Condition', page: 16 },
    { lvl: 2, text: '4.4 Normal Reproductive Structures', page: 16 },
    { lvl: 1, text: 'Section 5: Normal Layer and Breeder Features', page: 17 },
    { lvl: 2, text: '5.1 Reproductive System: Ovary, Oviduct, and Egg Development', page: 17 },
    { lvl: 2, text: '5.2 Bone Health and Keel Evaluation', page: 18 },
    { lvl: 2, text: '5.3 Organ Size and Fat Distribution in Productive Hens', page: 19 },
    { lvl: 1, text: 'Section 6: Comparing Bird Types: Key Differences to Note', page: 20 },
    { lvl: 2, text: '6.1 Growth Versus Reproduction Priorities', page: 20 },
    { lvl: 2, text: '6.2 Body Fat, Muscle Mass, and Organ Development', page: 21 },
    { lvl: 2, text: '6.3 How Production Stage Influences Necropsy Findings', page: 21 },
    { lvl: 1, text: 'Section 7: Common Mistakes to Avoid', page: 22 },
    { lvl: 2, text: '7.1 Misinterpreting Natural Variations', page: 22 },
    { lvl: 2, text: '7.2 Poor Sampling or Contamination', page: 23 },
    { lvl: 2, text: '7.3 Ignoring Age-Related Differences', page: 23 },
    { lvl: 1, text: 'Section 8: Hands-On Demonstration and Case Review', page: 24 },
    { lvl: 2, text: '8.1 Walk-Through Necropsy of a Broiler and a Layer', page: 24 },
    { lvl: 2, text: '8.2 Identifying Healthy Organs in Both Types', page: 25 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals', page: 26 },
    { lvl: 1, text: 'References', page: 26 },
  ].map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));

  function escapeXml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
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
  const tocEntries = entriesWithAnchor.map(tocRow).join('');
  const sepTag = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>';
  const endTag = '<w:p><w:r><w:fldChar w:fldCharType="end"/>';
  const sepIdx = docXml.indexOf(sepTag);
  if (sepIdx !== -1) {
    const endIdx = docXml.indexOf(endTag, sepIdx);
    if (endIdx !== -1) docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
  }

  // bookmarks for clickable TOC
  {
    let entryIdx = 0; let bookmarkId = 1000;
    const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    docXml = docXml.replace(headingRegex, (match, lvlStr) => {
      if (entryIdx >= entriesWithAnchor.length) return match;
      const lvl = Number(lvlStr);
      const textRuns = [...match.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
      const heading = textRuns.trim();
      const entry = entriesWithAnchor[entryIdx];
      const norm = (s) => s.replace(/\s+/g, ' ').trim();
      if (lvl !== entry.lvl) return match;
      if (norm(heading) !== norm(entry.text)) return match;
      entryIdx++;
      const id = bookmarkId++;
      return `<w:bookmarkStart w:id="${id}" w:name="${entry.anchor}"/>${match}<w:bookmarkEnd w:id="${id}"/>`;
    });
    if (entryIdx !== entriesWithAnchor.length) {
      console.warn(`Course 10 TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
    }
  }

  // TOC styles
  let stylesXml = await zip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    const tocStyles =
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="440"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
    stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
    zip.file('word/styles.xml', stylesXml);
  }

  const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
  if (dirtyLeft > 0) throw new Error(`Still ${dirtyLeft} w:dirty flags in document.xml`);
  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found)`);

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');

  // Validation sweeps
  const emCount = (docXml.match(/—/g) || []).length;
  console.log('Em dash (U+2014) count (must be 0):', emCount);
  const britChecks = [/\b\w+isation\b/gi,/\bcolour/gi,/\bbehaviour/gi,/\bcentre\b/gi,/\bdefenc/gi,/\bgrey\b/gi,/\bmould/gi,/\bfaec/gi,/\boedem/gi,/\banaem/gi,/\bdiarrhoea/gi,/\bhaemo/gi,/\bfibre/gi,/\blitre/gi];
  const joined = [...docXml.matchAll(/<w:t(?:[^>]*)>([^<]+)<\/w:t>/g)].map(m=>m[1]).join(' ');
  const brit = britChecks.flatMap(rx => joined.match(rx) || []);
  console.log('British spellings found (must be empty):', brit.length ? brit : 'none');
}

main().catch(err => { console.error(err); process.exit(1); });
