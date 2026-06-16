// ============================================================
// generate-course17.mjs — Course 17: Regulatory Framework in Poultry Production
// CPC Short Courses
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course17.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
  Header, Footer, PageNumber, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, convertInchesToTwip, HeadingLevel,
  LevelFormat, TableOfContents, ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 17');
const OUT_FILE  = path.join(OUT_DIR, 'Regulatory_Framework_in_Poultry_Production_draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');
const COURSE_TITLE = 'Regulatory Framework in Poultry Production';

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

// ---- colors ----
const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

// ---- helpers ----
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
        text: seg.text, bold: seg.bold || false, italics: seg.italics || false,
        color: seg.color || BODY_GRAY, size: seg.size || 24, font: 'Calibri',
      }))
    : [run(text, { bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })];
  return new Paragraph({
    children,
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing:   { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent:    opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}
function h1(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } }); }
function h2(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } }); }

function bullet(text, lvl = 0) {
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, italics: seg.italics || false, color: seg.color || BODY_GRAY, size: 24, font: 'Calibri' }))
    : [new TextRun({ text, color: BODY_GRAY, size: 24, font: 'Calibri' })];
  return new Paragraph({ children, numbering: { reference: 'bullet-list', level: lvl }, spacing: { after: 80, line: 276, lineRule: 'auto' } });
}
function numberedRef(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' })],
    numbering: { reference: 'references-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function image(buf, caption, widthIn = 5.9) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  let hpx = Math.round(wpx * 0.66);
  try {
    const view = new DataView(buf.buffer, buf.byteOffset);
    const pw = view.getUint32(16, false);
    const ph = view.getUint32(20, false);
    if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: 'png' })],
      alignment: AlignmentType.CENTER, spacing: { before: 160, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, color: '555555', size: 20, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 },
    }),
  ];
}

// ---- header / footer ----
function buildHeader() {
  return new Header({ children: [ new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ text: COURSE_TITLE, color: MED_BLUE, size: 18, font: 'Calibri', bold: true }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  }) ] });
}
function buildFooter() {
  return new Footer({ children: [ new Paragraph({
    children: [
      new TextRun({ text: 'CPC Short Courses  |  Course 17  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.CURRENT], color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ text: ' of ', color: '888888', size: 18, font: 'Calibri' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], color: '888888', size: 18, font: 'Calibri' }),
    ],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
  }) ] });
}

const pageMargin = {
  top: convertInchesToTwip(1), bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25),
};

// ---- cover ----
function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 17: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 },
    }),
  ];
  if (logoBuffer) {
    let lw = 144, lh = 144;
    try {
      const view = new DataView(logoBuffer.buffer, logoBuffer.byteOffset);
      const pw = view.getUint32(16, false), ph = view.getUint32(20, false);
      if (pw > 0 && ph > 0) lh = Math.round(lw * ph / pw);
    } catch (_) {}
    children.push(new Paragraph({
      children: [new ImageRun({ data: logoBuffer, transformation: { width: lw, height: lh }, type: 'png' })],
      alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
    }));
  }
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Regulatory Framework in Poultry Production', bold: true, color: DARK_BLUE, size: 46, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Understanding the Rules That Govern Poultry Farming in Canada', color: MED_BLUE, size: 26, font: 'Calibri', italics: true })],
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
      children: [new TextRun({ text: 'Duration: 2 Hours', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'June 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 800 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. It summarizes federal and provincial laws, national supply management, industry codes, and on-farm assurance programs as a general guide. It does not replace the official text of any act or regulation, the manuals of the program you are audited under, the direction of your provincial marketing board, or the advice of a licensed veterinarian or regulatory authority. Always follow the current version of the law and program that applies to your farm.', color: '808080', size: 18, font: 'Calibri', italics: true })],
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

// ---- TOC + Introduction ----
function buildIntroSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter() },
    children: [
      h1('Table of Contents'),
      new TableOfContents('Table of Contents', { headingStyleRange: '1-3' }),
      pageBreak(),

      h1('Introduction'),
      para('Raising healthy birds is only half the job. Running a poultry farm in Canada also means working inside a set of rules. Some come from the federal government, some from your province, and some from the industry itself through supply management and the on-farm programs you are audited under. Those rules cover animal welfare, biosecurity, food safety, how birds are transported, how product is processed and labeled, and the records you keep. They exist to protect bird health, public health, and a fair, stable marketplace for every producer.'),
      para('For a lot of farmers, the regulatory side feels like a maze. The good news is that it holds together once you can see the shape of it. There are really just three layers: the federal government sets the floor, national industry bodies build the programs, and your provincial board delivers and audits them on your farm. Almost everything you deal with day to day hangs off one of those three.'),
      para('This course walks through that whole framework in plain language. We will cover who regulates poultry and what each body does, how supply management works, the welfare codes and care programs, the biosecurity and disease rules, the food safety and processing standards, the records and audits that prove you are compliant, how it all plays out in one province as an example, and what compliance means for your bottom line. The aim is simple. When you understand why the rules exist and what they ask of you, staying compliant stops being a burden and becomes just part of running a good farm.'),
      para('A note on scope. This course explains the framework. It does not replace the official text of any law or the manual of the program you are audited under. When a specific number or rule matters for your farm, always check the current version with your provincial board, your processor, or your veterinarian.'),

      h2('Learning Objectives'),
      bullet('Name the main federal, provincial, and industry bodies that regulate poultry production in Canada, and know what each one does.'),
      bullet('Explain how the supply management system works for poultry and eggs, and what being part of it means for your farm.'),
      bullet('Understand the role and importance of the NFACC Codes of Practice for poultry care, housing, welfare, transport, and handling.'),
      bullet('Describe what current regulations require for biosecurity, animal health, and disease prevention.'),
      bullet('Understand your obligations around food safety, processing, and selling poultry products, including slaughter, microbial control, and labeling.'),
      bullet('Know which records you must keep, and what to expect during audits, inspections, and compliance checks.'),
      bullet('See how federal, provincial, and industry rules fit together, and how they shape what you do on the farm.'),
      bullet('Identify the practical steps that keep you compliant and let you benefit from the system: better welfare, stronger biosecurity, market access, and consumer trust.'),
    ],
  };
}

// ---- Section 1 ----
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 1: Overview of the Regulatory Landscape'),
      para('Before we get into any single rule, it helps to see the whole map. Poultry in Canada is regulated at three levels at once: the federal government, the national industry, and your province. They are not in competition. Each one handles a different part of the job, and they are designed to fit together so that a chicken raised in British Columbia is held to the same core standard as one raised in Ontario or Nova Scotia.'),
      ...image(figBuf('fig17_1.png'), 'Figure 1.1: The three layers of poultry regulation in Canada. Federal law sets the floor, national industry bodies set the programs, and your provincial board delivers and audits them on your farm. Source: CPC Short Courses.'),

      h2('1.1 Who Regulates Poultry in Canada: Federal, Provincial, and Industry'),
      para('Start with the federal government, because it sets the rules everyone else builds on. Two bodies matter most. Agriculture and Agri-Food Canada is the federal department responsible for farming policy, research, and trade, and it is the department that oversees the national supply management agencies [1]. Alongside it sits the Canadian Food Inspection Agency, usually just called the CFIA. The CFIA is the federal regulator for food safety, animal health, and plant health, and for poultry that means it runs the rules on meat and egg inspection, humane transport, on-farm biosecurity standards, and the control of serious animal diseases [2].'),
      para('The second layer is the national industry. Supply-managed poultry and eggs are run by national producer agencies, and those agencies are overseen by a federal body called the Farm Products Council of Canada [3]. This is where the on-farm food safety and animal care programs that audit your barn actually come from. We will get into how that works in Section 2.'),
      para('The third layer is your province. Farming is partly a provincial responsibility, so each province has its own marketing board for each poultry type. Your provincial board is the body you deal with most: it holds your quota, licenses your farm, and delivers the national programs on the ground, including scheduling your audits. Provinces also have their own animal welfare and environmental laws that apply on top of the federal and national rules.'),

      h2('1.2 Key Regulatory Agencies and Organizations'),
      para('It is worth putting names to the bodies you will run into, because the same handful come up again and again across every part of this course.'),
      bullet([{ text: 'Agriculture and Agri-Food Canada (AAFC): ', bold: true }, { text: 'the federal farming department. Sets agricultural policy, funds research and risk-management programs, handles trade, and is the department responsible for the national supply management agencies [1].' }]),
      bullet([{ text: 'Canadian Food Inspection Agency (CFIA): ', bold: true }, { text: 'the federal food safety and animal health regulator. Inspects federally registered processing plants, enforces humane transport, sets the national on-farm biosecurity standard, and leads the response to reportable diseases like avian influenza [2].' }]),
      bullet([{ text: 'Farm Products Council of Canada (FPCC): ', bold: true }, { text: 'the federal body that oversees the national supply management system for poultry and eggs, supervising the producer agencies that run it [3].' }]),
      bullet([{ text: 'National producer agencies: ', bold: true }, { text: 'Chicken Farmers of Canada, Egg Farmers of Canada, Turkey Farmers of Canada, and Canadian Hatching Egg Producers. These set national production and run the on-farm food safety and animal care programs.' }]),
      bullet([{ text: 'National Farm Animal Care Council (NFACC): ', bold: true }, { text: 'the body that develops Canada’s Codes of Practice for the care and handling of farm animals. The poultry Codes are the welfare backbone the on-farm programs are built on, covered in Section 3.' }]),
      bullet([{ text: 'Provincial marketing boards: ', bold: true }, { text: 'for example the BC Chicken Marketing Board or BC Egg. They hold quota, license farms, and deliver and audit the programs in each province, covered in Section 7.' }]),
      para('Keep that list in mind as we go. Nearly every rule in this course is set, delivered, or enforced by one of these bodies, and knowing which one is responsible tells you who to call when you have a question.'),
    ],
  };
}

// ---- Section 2 ----
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 2: Supply Management and Market Regulation'),
      para('If you raise chicken, turkey, eggs, or hatching eggs in Canada, you are part of supply management. It is the single biggest thing that shapes how your farm operates, from how many birds you can place to the price you get for them. It is worth understanding well, because it is also the part of the system that gives you the most stability.'),

      h2('2.1 How Supply Management Works for Poultry and Eggs'),
      para('Supply management rests on three pillars. Get these three and you understand the whole system [4].'),
      ...image(figBuf('fig17_2.png'), 'Figure 2.1: The three pillars of supply management. Production is matched to demand, imports are controlled, and prices are set to cover the cost of production. Source: CPC Short Courses.'),
      para('The first pillar is production discipline. Total Canadian production is matched to what Canadians will actually buy, and that total is divided among farmers as quota. Your quota is your share, your right to produce and sell a set amount. Because supply is matched to demand, the market does not swing between gluts and shortages the way an open market does.'),
      para('The second pillar is import control. Imports are managed through tariff rate quotas, which let a set amount of poultry come in at a low tariff and apply much higher tariffs above that. This keeps cheaper foreign product from flooding the market and undercutting the domestic price [4].'),
      para('The third pillar is producer pricing. Prices are set using a cost-of-production approach, so the price is built to cover what it actually costs an efficient farmer to raise the birds. Put the three together and you get the point of the whole system: stable supply, predictable prices, and a fair return for farmers, all without ongoing government subsidies.'),

      h2('2.2 Relevant Legislation and Organizational Oversight'),
      para('Supply management is not just an industry handshake. It rests on federal law. The Farm Products Agencies Act is the federal statute that created the framework and the national agencies that run it [5]. Under that Act sits the Farm Products Council of Canada, the federal body that supervises the national poultry and egg agencies and reports to the Minister of Agriculture [3].'),
      para('Below the federal layer, the national agencies, Chicken Farmers of Canada, Egg Farmers of Canada, Turkey Farmers of Canada, and Canadian Hatching Egg Producers, allocate production among the provinces and run the national programs. Then your provincial board takes it from there, holding individual quota, licensing farms, and dealing with producers directly. So the chain runs from federal law, to the national council, to the national agency, to your provincial board, and finally to your farm. Each link has a defined job, which is why a question about your quota goes to your provincial board, while a question about national allocation sits higher up the chain.'),
      para('For you as a producer, the practical takeaways are simple. You need quota to produce. You produce to that quota. You follow the national on-farm programs that come bundled with being in the system. And in return you get a stable, predictable market that an open commodity market simply cannot offer.'),
    ],
  };
}

// ---- Section 3 ----
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 3: Animal Welfare and Care Standards'),
      para('Animal welfare is no longer a soft topic in Canadian poultry. It is written into national standards, built into the programs you are audited under, and backed by law. The good news is that the welfare rules line up almost perfectly with good production. Birds that are comfortable, healthy, and handled well grow better and cost you less in losses.'),

      h2('3.1 Codes of Practice for the Care and Handling of Poultry'),
      para('The foundation for poultry welfare in Canada is the Codes of Practice developed by the National Farm Animal Care Council. These are not vague guidelines. They are detailed, consensus-built national standards written by farmers, veterinarians, researchers, processors, and animal welfare groups working together. For meat birds and breeders, the standard is the Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys, published in 2016 [6]. For the laying side, it is the Code of Practice for the Care and Handling of Pullets and Laying Hens, published in 2017 [7].'),
      para('The Codes matter to you for two reasons. First, they are the welfare backbone that the on-farm animal care programs are built on, so the requirements you are audited against trace straight back to them. Second, in several provinces, following the Code is recognized in law as the accepted standard of care, which we will come back to in Section 7. The Codes spell out both requirements, the things you must do, and recommended practices, the things you should aim for.'),

      h2('3.2 Mandated Housing, Environment, Feeding, Transport, and Handling Standards'),
      para('The Codes and the care programs translate welfare into specific, checkable practices across the bird’s whole life. On housing and environment, that means stocking density limits, ventilation that keeps air quality right, litter kept dry enough to protect foot health, and lighting programs with a proper dark period for rest. For the full daily framework that ties temperature, air, litter, light, and space together, see Course 3 (T-FLAWS Assessment Management Tool) in this series.'),
      para('On feeding and water, birds must have access to enough clean feed and water for their age and number. On handling, the standards cover how birds are caught, carried, and loaded, because rough handling causes bruising, injury, and downgrades at the plant. Each commodity turns these standards into an auditable on-farm animal care program: the Chicken Farmers of Canada Animal Care Program for broilers [8], the Egg Farmers of Canada Animal Care Program alongside Start Clean-Stay Clean for layers [9], and the Turkey Farmers of Canada Flock Care Program for turkeys [10]. All of them put the NFACC Code into practice and verify it through audits.'),
      para('Transport is its own regulated area, and it changed significantly in recent years. The federal rules for moving animals live in Part XII of the Health of Animals Regulations, and a major update came into force on February 20, 2020, replacing requirements that had not been meaningfully changed since 1977 [11]. The updated rules tightened the maximum times birds can go without feed, water, and rest, and they set clearer expectations for assessing whether an animal is fit to load. The practical message for you is straightforward: birds must be fit for the trip, and the clock on feed, water, and rest starts before they leave your farm. Catching crews and transporters share responsibility, but it begins with the birds you present for loading.'),
    ],
  };
}

// ---- Section 4 ----
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 4: Biosecurity, Animal Health, and Disease Prevention'),
      para('Disease is the fastest way to lose a flock and, in the worst cases, to put a whole region at risk. That is why biosecurity and disease control are some of the most developed rules in the entire framework. Part of this is your own program requirement, and part of it is federal law that applies to every bird owner in the country.'),

      h2('4.1 On-Farm Biosecurity Standards and Disease-Control Regulations'),
      para('The national reference point for keeping disease off poultry farms is the CFIA National Avian On-Farm Biosecurity Standard [12]. It frames the whole job around two ideas. Exclusion means keeping disease off the farm in the first place. Containment means stopping it from spreading if it does get in. Almost every biosecurity practice you follow, the line between the dirty outside and the clean barn, the footbath or boot change, dedicated barn clothing, the visitor log, and pest and wild-bird control, is just one of those two ideas in action.'),
      para('Your on-farm food safety program turns that standard into daily requirements you are audited on. For chicken, the Chicken Farmers of Canada Raised by a Canadian Farmer On-Farm Food Safety Program covers biosecurity, feed and water, cleaning and disinfection, inputs, flock monitoring, and records, all built on the HACCP hazard-control approach used across the food industry [13]. Because biosecurity is the backbone of disease prevention and worth knowing in real depth, this course only summarizes it. For the full set of protocols, from line-of-separation design to disinfectant selection and downtime between flocks, see Course 2 (Biosecurity) in this series.'),
      para('Catching a problem early is part of disease control too. The CPC Learning Centre Spotting Disease Early guide makes the point that walking the barn every day with your eyes, ears, and nose catches trouble while it is still small, and that the daily record is where that walk gets written down [14]. That habit is not just good management. It is also what lets you meet your legal duty to report serious disease quickly, which we cover next.'),

      h2('4.2 Reportable Diseases and Your Legal Duty to Report'),
      para('Some diseases are so serious that the law requires them to be reported. Under the federal Health of Animals Act, certain diseases are designated reportable, and anyone who owns or cares for the animals must notify the CFIA of a suspected case [15]. For poultry, the two that matter most are avian influenza and Newcastle disease. Both are reportable, which means you do not get to wait and see. A suspicion is enough to trigger the legal duty to report [16].'),
      ...image(figBuf('fig17_3.png'), 'Figure 4.1: What to do if you suspect a reportable disease. Reporting fast is both the law and the best way to protect your flock and the farms around you. Source: CPC Short Courses.'),
      para('Here is how it works in practice. If you see warning signs, a sudden jump in mortality, a sharp drop in feed or water intake, or respiratory or nervous-system signs spreading through the flock, you call your veterinarian and report to the CFIA right away. You do not move birds, eggs, or equipment off the farm while you wait. The CFIA then investigates, samples the flock, and confirms or rules out the disease. If a disease like avian influenza is confirmed, the response can include quarantine, movement control, humane depopulation, and cleaning and disinfection, with federal compensation available for animals ordered destroyed [16]. Reporting fast is not only the law. It is the single best thing you can do to protect your own flock and the farms around you. For the clinical picture behind these diseases and how to recognize them, see Course 7 (Common Poultry Diseases) in this series.'),

      h2('4.3 Regulatory Requirements for Hatcheries, Breeders, and Supply Flocks'),
      para('Disease control does not start at the broiler barn. It starts up the chain, with breeders and hatcheries, because a problem there can spread to every flock they supply. Hatcheries in Canada operate under federal oversight, and breeder and hatching-egg flocks run their own food safety and animal care programs through Canadian Hatching Egg Producers. The principle is simple: the cleaner and healthier the top of the pyramid, the safer every flock below it. The CPC Learning Centre Hatching Egg Care guidance reflects the same idea, that careful handling and hygiene at the breeder and hatching-egg stage protects bird health all the way down the chain.'),
      para('Antimicrobial use is the other animal-health area where the rules and the industry have moved hard. Through the Chicken Farmers of Canada Responsible Antimicrobial Use Strategy, the sector has already eliminated the preventive use of the antibiotics most important to human medicine and continues to push overall use down [17]. On your farm, this shows up as careful, recorded, veterinarian-guided treatment rather than routine preventive dosing, and as complete medication records with proper withdrawal times. For the full picture on vaccination, treatment, and antimicrobial stewardship, see Course 8 (Fundamentals of Poultry Vaccination and Treatment) in this series.'),
    ],
  };
}

// ---- Section 5 ----
function buildSection5() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 5: Food Safety, Processing, and Product Standards'),
      para('Once your birds leave the farm, they enter a second world of regulation built around one goal: making sure the food that reaches Canadians is safe. You do not run a processing plant, but these rules shape who you can ship to and what your product has to be, so it pays to understand the framework.'),

      h2('5.1 Regulation of Poultry Products for Slaughter, Processing, and Sale'),
      para('The main federal law here is the Safe Food for Canadians Act, with its regulations that came fully into force on January 15, 2019 [18]. Together they pulled a patchwork of older food rules into one modern system run by the CFIA. Three ideas sit at the center of it. Licensing means businesses that process, import, or trade food across provincial or national borders need a federal license. Preventive controls mean those businesses must have a written plan to identify and control food safety hazards. Traceability means being able to trace product one step back to where it came from and one step forward to where it went [19].'),
      para('Where a bird is processed decides which rules apply. A federally registered plant operates under CFIA inspection and can ship product between provinces and for export. A provincially licensed plant is inspected by the province and sells within that province. This is why your processor and your market are linked: the plant you ship to determines whether your birds can be sold across the country or only inside your province.'),

      h2('5.2 Standards for Labeling, Slaughter, Pathogen Control, and Processing'),
      para('Inside the plant, the rules get specific in ways that still matter to farmers. Slaughter must be humane, and humane treatment at slaughter is a requirement the CFIA enforces directly. The CFIA has suspended plant licenses for failing to meet it, which is a reminder that the welfare standards you follow on the farm carry right through to the end of the line [19].'),
      para([
        { text: 'Pathogen control is a major focus, especially for organisms like ' },
        { text: 'Salmonella', italics: true },
        { text: ' that can move from live birds into the food chain. Plants run testing and sanitation programs to keep contamination down, and that work starts with the birds you deliver. A flock that arrives clean, healthy, and free of disease makes the plant’s job easier and your product safer. For how on-farm practices reduce ' },
        { text: 'Salmonella', italics: true },
        { text: ' and other foodborne risks before birds ever reach the plant, see Course 4 (' },
        { text: 'Salmonella', italics: true },
        { text: ' and Food Safety) in this series.' },
      ]),
      para('Labeling and grading round out the product standards. Eggs are graded and labeled under federal grading rules, and poultry meat carries inspection and labeling requirements so that what is on the package is accurate. Claims like organic, free-range, or raised without antibiotics are regulated too, which means a farmer cannot simply print them. They have to be backed by the practices and the program behind them. The single thread running through all of it is honesty: the label has to match what is actually in the package.'),
    ],
  };
}

// ---- Section 6 ----
function buildSection6() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 6: Record-Keeping, Audits, and Compliance'),
      para('All the rules in this course share one thing: you have to be able to prove you followed them. That proof is your records, and the check on those records is your audit. This is the part of compliance you live with every single day, and it is also the part most under your control.'),

      h2('6.1 What Records Need to Be Maintained'),
      para('The records you are required to keep are, almost entirely, the same records you should keep to run the place well. That is the key insight: compliance paperwork and good management are the same paperwork. Your on-farm food safety and animal care programs spell out the list, but it comes down to a handful of things kept current and on file [13].'),
      ...image(figBuf('fig17_4.png'), 'Figure 6.1: The core records every poultry farm keeps. The paperwork an auditor wants is the same paperwork that runs a good barn. Source: CPC Short Courses.'),
      bullet([{ text: 'Flock and mortality records: ', bold: true }, { text: 'daily mortality, flock performance, and placement and shipping dates.' }]),
      bullet([{ text: 'Treatment and medication records: ', bold: true }, { text: 'every drug given, the reason, the dose, and the withdrawal time observed before shipping.' }]),
      bullet([{ text: 'Feed and water records: ', bold: true }, { text: 'feed tags and source, medicated feed handling, and your annual water test result.' }]),
      bullet([{ text: 'Biosecurity records: ', bold: true }, { text: 'the visitor log, cleaning and disinfection, pest control, and dead-bird handling.' }]),
      bullet([{ text: 'Animal care and shipping records: ', bold: true }, { text: 'vaccination, barn environment, density and any high-density monitoring, plus receiving slips and catch-and-load records.' }]),
      para('The habit that makes records easy is writing them down the same day, not reconstructing a month from memory. The CPC Learning Centre Spotting Disease Early guide makes the same point: the daily barn walk and the daily record go together, and the record is only useful if it is filled in while the day is fresh [14].'),

      h2('6.2 How Audits, Inspections, and Compliance Checks Are Carried Out'),
      para('For most farmers, the main compliance check is the annual on-farm program audit, delivered through your provincial board. A trained auditor visits, walks the barn, reviews your records against the program standard, and notes where you meet it and where you fall short. These programs use trained and, in many cases, third-party auditors to keep the results consistent and credible across the whole country [8,10]. Pass it, and you keep your standing in the program and your ability to ship.'),
      para('A regulatory inspection is different from a program audit. That is when a government body, usually the CFIA, comes directly, most often during a disease investigation, a trace-back, or a food safety concern. Provincial agencies may also inspect for environmental rules or deadstock disposal. The difference is who sends them and why, but the way you prepare is the same: keep your records current and your barn run to standard every day, so any visit is a confirmation rather than a scramble.'),
      para('Getting ready for and getting through an audit is a big enough topic that this series gives it its own course. For the full walkthrough of preparing for an audit, hosting the auditor, and closing out corrective actions, see Course 16 (Preparing for an Inspection Audit) in this series.'),
    ],
  };
}

// ---- Section 7 ----
function buildSection7() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 7: Provincial Variation in British Columbia'),
      para('So far we have talked about the national framework. But farming is also a provincial matter, so the rules land slightly differently in each province. The best way to see how the layers fit is to look at one province in detail. British Columbia makes a good example, and the same pattern repeats with local differences right across the country.'),

      h2('7.1 How Provincial Regulations Overlay Federal and Industry Rules'),
      para('In British Columbia, supply management is delivered under a provincial law called the Natural Products Marketing (BC) Act [20]. That Act is what gives the provincial commodity boards their authority. The BC Chicken Marketing Board, for instance, was created under it and is the body that holds quota, licenses growers, and delivers and audits the national on-farm programs for BC chicken farmers [21]. If you grow chicken in BC, the Board is the regulator you deal with most.'),
      para('Sitting above all the BC commodity boards is a provincial supervisory body, the BC Farm Industry Review Board, often shortened to BCFIRB. It supervises every regulated marketing board and commission in the province, hears appeals, and makes sure the boards act in the broader public interest [22]. So the BC chain runs from the provincial Act, to the supervisory BCFIRB, down to the individual commodity board, and finally to your farm. It mirrors the federal structure, just one level down.'),

      h2('7.2 The Role of Provincial Acts, Marketing Boards, and Welfare Laws'),
      para('Provinces also carry their own animal welfare law, and this is where the welfare Codes from Section 3 gain real legal teeth. In British Columbia, the Prevention of Cruelty to Animals Act, the PCA Act, is the main law protecting farm animals from distress [23]. It is enforced by the BC SPCA, whose officers are appointed as special provincial constables for that purpose [24]. Here is the part that matters most for a farmer: under the PCA Act, following the generally accepted NFACC Code of Practice is recognized as a defense against a charge of causing distress. In plain terms, raising your birds to the Code is not just good practice. It is your legal protection.'),
      para('The same multi-board structure covers every poultry type in the province. Alongside the BC Chicken Marketing Board sit BC Egg, the British Columbia Broiler Hatching Egg Commission, and the BC Turkey Marketing Board, each regulating its own sector under the same provincial Act and the same supervisory board [25]. The exact board names and some details differ from province to province, but the shape is the same everywhere: a provincial marketing law, a supervisory body, a commodity board for each poultry type, and a provincial welfare law backing the national Codes. Learn the pattern in one province and you can find your way around any of them.'),
    ],
  };
}

// ---- Section 8 ----
function buildSection8() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 8: Implications for Farmers and Good Practices'),
      para('We have covered a lot of bodies, laws, and programs. Now let us bring it back to your barn. What does all of this actually mean for the way you run your farm day to day, and why is it worth taking seriously beyond just staying out of trouble?'),

      h2('8.1 What Compliance Means for Everyday Farm Management'),
      para('The most useful thing to realize is that almost none of this asks you to do extra work that does not already pay off. Keeping daily mortality and treatment records, testing your water once a year, running solid biosecurity, handling birds gently, following the Code on density and environment, and reporting disease fast are all things a good farmer does anyway. Compliance is mostly a matter of doing them consistently and writing them down. The framework is not asking you to farm differently. It is asking you to farm well and keep proof.'),
      para('In practice, that means building the requirements into your routine instead of treating them as a separate chore. Record as you go, not at audit time. Keep your biosecurity tight every day, not just when someone is watching. Know which body to call for which question: your provincial board for quota and program issues, your veterinarian and the CFIA for disease, your processor for product and shipping. When compliance lives inside your daily routine, it stops being a burden you carry and becomes just the way the farm runs.'),

      h2('8.2 The Advantages: Market Access, Consumer Trust, and Better Birds'),
      para('Following the framework buys you real things. The first is market access. Being in good standing with your on-farm programs and your quota is what lets you ship at all, and a federally inspected supply chain is what opens national and export markets. The second is consumer trust. When a grocery chain or a shopper asks how Canadian poultry can be guaranteed safe and humanely raised, the answer is the audited national programs that every registered farmer follows. That shared standard lets the whole industry speak with one voice, and it protects the price you get from being dragged down by one bad operator.'),
      para('The third advantage is the quietest but maybe the most valuable: better birds. Strong biosecurity means fewer disease breaks. Good welfare means less mortality and fewer downgrades. Careful records mean you catch a feed or water problem before it becomes a loss. The same practices that keep you compliant are the ones that keep your flock healthy and your margins intact. Compliance and good farming are not two different jobs. They are the same job, looked at from two angles.'),

      h2('8.3 The Risks of Non-Compliance and How to Avoid Them'),
      para('The flip side is real, and it is worth being clear-eyed about. Falling out of compliance can cost you your program standing and, with it, your ability to ship. It can mean failed audits and corrective actions that pile up. Welfare violations can bring charges under provincial law, with serious penalties. And failing to report a reportable disease, or moving birds when you should not, can turn a containable problem into a regional disaster and expose you to federal enforcement.'),
      para('Avoiding all of that is less about fear and more about habit. Keep your records current and honest. Never invent a record you did not make. Run your biosecurity every day. Report disease the moment you suspect it, without waiting for certainty. Stay in regular contact with your provincial board and your veterinarian so a small question never grows into a big problem. Do those things and the regulatory framework stops being something that happens to you. It becomes the backbone of a farm that is trusted, profitable, and built to last.'),
    ],
  };
}

// ---- Journals ----
function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para('The following journals publish current research on poultry health, welfare, food safety, and the policy and economics behind supply management. They are good sources for farmers, service reps, and veterinarians who want to stay current with the evidence behind the rules and programs covered in this course:'),
      bullet([{ text: 'Poultry Science ', bold: true, italics: true }, { text: '(Elsevier / Poultry Science Association): broad research on commercial poultry nutrition, management, housing, and welfare.' }]),
      bullet([{ text: 'Journal of Applied Poultry Research ', bold: true, italics: true }, { text: '(Poultry Science Association): applied, on-farm studies on management practices, food safety, and production.' }]),
      bullet([{ text: 'Canadian Journal of Animal Science ', bold: true, italics: true }, { text: '(Canadian Science Publishing): Canadian livestock production, welfare, and policy-relevant research.' }]),
      bullet([{ text: 'Canadian Veterinary Journal ', bold: true, italics: true }, { text: '(Canadian Veterinary Medical Association): Canadian veterinary practice, disease surveillance, and food-animal welfare.' }]),
    ],
  };
}

// ---- References ----
function buildReferencesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('References'),
      para('References are listed in order of first appearance in the text. Sources are federal and provincial legislation and agencies, the national supply management bodies and on-farm assurance programs, and the CPC Learning Centre.'),
      numberedRef('Agriculture and Agri-Food Canada. About Agriculture and Agri-Food Canada: mandate and role. Ottawa: Government of Canada; [cited 2026 Jun]. Available from: agriculture.canada.ca'),
      numberedRef('Canadian Food Inspection Agency. About the CFIA: mandate, food safety, and animal health. Ottawa: Government of Canada; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('Farm Products Council of Canada. Who we are and what we do. Ottawa: Government of Canada; [cited 2026 Jun]. Available from: canada.ca/en/farm-products-council'),
      numberedRef('Library of Parliament. Canada’s Supply Management System (Background paper, publication 2018-42-E). Ottawa: Library of Parliament; [cited 2026 Jun]. Available from: lop.parl.ca'),
      numberedRef('Farm Products Agencies Act (RSC 1985, c. F-4). Ottawa: Justice Laws Website, Government of Canada; [cited 2026 Jun]. Available from: laws-lois.justice.gc.ca'),
      numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Hatching Eggs, Breeders, Chickens, and Turkeys. Ottawa: NFACC; 2016 [cited 2026 Jun]. Available from: nfacc.ca'),
      numberedRef('National Farm Animal Care Council. Code of Practice for the Care and Handling of Pullets and Laying Hens. Ottawa: NFACC; 2017 [cited 2026 Jun]. Available from: nfacc.ca'),
      numberedRef('Chicken Farmers of Canada. Raised by a Canadian Farmer Animal Care Program. Ottawa: Chicken Farmers of Canada; [cited 2026 Jun]. Available from: chickenfarmers.ca'),
      numberedRef('Egg Farmers of Canada. Start Clean-Stay Clean and Animal Care Program. Ottawa: Egg Farmers of Canada; [cited 2026 Jun]. Available from: eggfarmers.ca'),
      numberedRef('Turkey Farmers of Canada. Flock Care Program and On-Farm Food Safety Program. Ottawa: Turkey Farmers of Canada; [cited 2026 Jun]. Available from: turkeyfarmersofcanada.ca'),
      numberedRef('Canadian Food Inspection Agency. Health of Animals Regulations Part XII: Transport of Animals. Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('Canadian Food Inspection Agency. National Avian On-Farm Biosecurity Standard. Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('Chicken Farmers of Canada. Raised by a Canadian Farmer On-Farm Food Safety Program. Ottawa: Chicken Farmers of Canada; [cited 2026 Jun]. Available from: chickenfarmers.ca'),
      numberedRef('Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
      numberedRef('Health of Animals Act (SC 1990, c. 21). Ottawa: Justice Laws Website, Government of Canada; [cited 2026 Jun]. Available from: laws-lois.justice.gc.ca'),
      numberedRef('Canadian Food Inspection Agency. Fact sheet: avian influenza (reportable disease). Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('Chicken Farmers of Canada. Responsible Antimicrobial Use Strategy. Ottawa: Chicken Farmers of Canada; [cited 2026 Jun]. Available from: chickenfarmers.ca'),
      numberedRef('Safe Food for Canadians Act (SC 2012, c. 24). Ottawa: Justice Laws Website, Government of Canada; [cited 2026 Jun]. Available from: laws-lois.justice.gc.ca'),
      numberedRef('Canadian Food Inspection Agency. Understanding the Safe Food for Canadians Regulations: a handbook for food businesses. Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('Natural Products Marketing (BC) Act (RSBC 1996, c. 330). Victoria, BC: King’s Printer; [cited 2026 Jun]. Available from: bclaws.gov.bc.ca'),
      numberedRef('British Columbia Chicken Marketing Board. Governance and our story. Abbotsford, BC: BCCMB; [cited 2026 Jun]. Available from: bcchicken.ca'),
      numberedRef('British Columbia Farm Industry Review Board. Regulated marketing. Victoria, BC: Government of British Columbia; [cited 2026 Jun]. Available from: www2.gov.bc.ca'),
      numberedRef('Prevention of Cruelty to Animals Act (RSBC 1996, c. 372). Victoria, BC: King’s Printer; [cited 2026 Jun]. Available from: bclaws.gov.bc.ca'),
      numberedRef('BC SPCA. What is the Prevention of Cruelty to Animals Act (PCA Act)? Vancouver, BC: BC SPCA; [cited 2026 Jun]. Available from: spca.bc.ca'),
      numberedRef('BC Egg Marketing Board; British Columbia Broiler Hatching Egg Commission; BC Turkey Marketing Board. Victoria and Abbotsford, BC; [cited 2026 Jun]. Available from: bcegg.com; bcbhec.com; bcturkey.com'),
    ],
  };
}

// ---- styles ----
function buildStyles() {
  return {
    default: { document: { run: { font: 'Calibri', size: 24, color: BODY_GRAY }, paragraph: { spacing: { after: 160, line: 276, lineRule: 'auto' } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 36, bold: true, color: DARK_BLUE },
        paragraph: { spacing: { before: 480, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 30, bold: true, color: MED_BLUE },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Calibri Light', size: 26, bold: true, italics: true, color: MED_BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
    ],
  };
}

// ---- numbering ----
function buildNumbering() {
  return {
    config: [
      { reference: 'bullet-list', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(1.0), hanging: convertInchesToTwip(0.25) } } } },
      ] },
      { reference: 'references-list', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
      ] },
    ],
  };
}

// ---- build ----
async function main() {
  console.log('Building Course 17: Regulatory Framework in Poultry Production...');
  const doc = new Document({
    creator: 'CPC Short Courses',
    title: COURSE_TITLE,
    description: 'Course 17 — CPC Short Courses',
    features: { updateFields: false },
    styles: buildStyles(),
    numbering: buildNumbering(),
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
    { lvl: 1, text: 'Section 1: Overview of the Regulatory Landscape', page: 4 },
    { lvl: 2, text: '1.1 Who Regulates Poultry in Canada: Federal, Provincial, and Industry', page: 4 },
    { lvl: 2, text: '1.2 Key Regulatory Agencies and Organizations', page: 5 },
    { lvl: 1, text: 'Section 2: Supply Management and Market Regulation', page: 6 },
    { lvl: 2, text: '2.1 How Supply Management Works for Poultry and Eggs', page: 6 },
    { lvl: 2, text: '2.2 Relevant Legislation and Organizational Oversight', page: 7 },
    { lvl: 1, text: 'Section 3: Animal Welfare and Care Standards', page: 8 },
    { lvl: 2, text: '3.1 Codes of Practice for the Care and Handling of Poultry', page: 8 },
    { lvl: 2, text: '3.2 Mandated Housing, Environment, Feeding, Transport, and Handling Standards', page: 9 },
    { lvl: 1, text: 'Section 4: Biosecurity, Animal Health, and Disease Prevention', page: 10 },
    { lvl: 2, text: '4.1 On-Farm Biosecurity Standards and Disease-Control Regulations', page: 10 },
    { lvl: 2, text: '4.2 Reportable Diseases and Your Legal Duty to Report', page: 11 },
    { lvl: 2, text: '4.3 Regulatory Requirements for Hatcheries, Breeders, and Supply Flocks', page: 12 },
    { lvl: 1, text: 'Section 5: Food Safety, Processing, and Product Standards', page: 13 },
    { lvl: 2, text: '5.1 Regulation of Poultry Products for Slaughter, Processing, and Sale', page: 13 },
    { lvl: 2, text: '5.2 Standards for Labeling, Slaughter, Pathogen Control, and Processing', page: 14 },
    { lvl: 1, text: 'Section 6: Record-Keeping, Audits, and Compliance', page: 15 },
    { lvl: 2, text: '6.1 What Records Need to Be Maintained', page: 15 },
    { lvl: 2, text: '6.2 How Audits, Inspections, and Compliance Checks Are Carried Out', page: 16 },
    { lvl: 1, text: 'Section 7: Provincial Variation in British Columbia', page: 17 },
    { lvl: 2, text: '7.1 How Provincial Regulations Overlay Federal and Industry Rules', page: 17 },
    { lvl: 2, text: '7.2 The Role of Provincial Acts, Marketing Boards, and Welfare Laws', page: 18 },
    { lvl: 1, text: 'Section 8: Implications for Farmers and Good Practices', page: 19 },
    { lvl: 2, text: '8.1 What Compliance Means for Everyday Farm Management', page: 19 },
    { lvl: 2, text: '8.2 The Advantages: Market Access, Consumer Trust, and Better Birds', page: 20 },
    { lvl: 2, text: '8.3 The Risks of Non-Compliance and How to Avoid Them', page: 20 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals', page: 21 },
    { lvl: 1, text: 'References', page: 22 },
  ].map((e, i) => ({ ...e, anchor: `_Toc${String(100000 + i).padStart(8, '0')}` }));

  function escapeXml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
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
    if (endIdx !== -1) docXml = docXml.slice(0, sepIdx + sepTag.length) + tocEntries + docXml.slice(endIdx);
  }

  {
    let entryIdx = 0, bookmarkId = 1000;
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
      console.warn(`Course 17 TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length}. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
    }
  }

  let stylesXml = await zip.file('word/styles.xml').async('string');
  if (!/w:styleId="TOC1"/.test(stylesXml)) {
    const tocStyles =
      '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8640"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="440"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
    stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
    zip.file('word/styles.xml', stylesXml);
  }

  const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
  if (dirtyLeft > 0) throw new Error(`Still ${dirtyLeft} w:dirty flags — dialog will appear`);
  const bad = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found)`);

  const emEn = (docXml.match(/[—–]/g) || []).length;
  if (emEn > 0) console.warn(`WARNING: ${emEn} em/en dash characters found in document.xml`);

  zip.file('word/document.xml', docXml);
  buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Done:', OUT_FILE);
  console.log('Size:', (buffer.length / 1024).toFixed(1), 'KB');
}

main().catch(err => { console.error(err); process.exit(1); });
