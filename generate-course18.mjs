// ============================================================
// generate-course18.mjs — Course 18: Current Poultry Issues (Hot Topics)
// CPC Short Courses
// Farmer-Flow writing mode, American English, Vancouver citations
// Run: node generate-course18.mjs
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
  Header, Footer, PageNumber, BorderStyle, convertInchesToTwip, HeadingLevel,
  LevelFormat, TableOfContents, ImageRun,
} from 'docx';
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, 'Course 18');
const OUT_FILE  = path.join(OUT_DIR, 'Current_Poultry_Issues_Hot_Topics_draft.docx');
const LOGO_PATH = path.join(__dirname, 'logo.png');
const COURSE_TITLE = 'Current Poultry Issues (Hot Topics)';

function figBuf(name) {
  const p = path.join(OUT_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

const DARK_BLUE = '1F3864';
const MED_BLUE  = '2E74B5';
const BODY_GRAY = '3C3C3C';
const GOLD      = 'C9A84C';

function run(text, opts = {}) {
  return new TextRun({
    text, bold: opts.bold || false, italics: opts.italics || false,
    color: opts.color || BODY_GRAY, size: opts.size || 24, font: 'Calibri',
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
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160, line: 276, lineRule: 'auto' },
    indent: opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
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
      new TextRun({ text: 'CPC Short Courses  |  Course 18  |  Page ', color: '888888', size: 18, font: 'Calibri' }),
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

function buildCoverSection() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const children = [
    new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 1440, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: 'COURSE 18: CPC SHORT COURSES', bold: true, color: MED_BLUE, size: 24, font: 'Calibri' })],
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
      children: [new TextRun({ text: 'Current Poultry Issues (Hot Topics)', bold: true, color: DARK_BLUE, size: 46, font: 'Calibri Light' })],
      alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Avian Influenza and Emerging Disease Issues in Canadian Poultry', color: MED_BLUE, size: 26, font: 'Calibri', italics: true })],
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
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Because it covers current issues, the disease situation, figures, and dates in it reflect mid-2026 and will change over time. It does not replace the current guidance of the Canadian Food Inspection Agency, your provincial marketing board, or your veterinarian. Always confirm the present disease situation and reporting requirements with the CFIA and a licensed veterinarian before acting.', color: '808080', size: 18, font: 'Calibri', italics: true })],
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
      para('Poultry farming never stands still. New diseases show up, old ones come back wearing a new coat, and a virus that lived in wild birds one season can be in your barn the next. Nothing has driven that home for Canadian farmers like avian influenza. In just a few years it has gone from an occasional scare to a yearly threat that has cost the industry millions of birds. Staying on top of issues like this is not just a job for veterinarians and government. It is part of protecting your own flock and your own livelihood.'),
      para('This course is about the issues that matter most right now. We start with why staying current is worth your time and where to get information you can trust. Then we spend most of the course on avian influenza: what it is, where it stands today, how it gets onto farms, how to recognize it, your legal duty to report it, and how an outbreak is handled. Finally we look at the wider world of emerging and re-emerging diseases, the ones surveillance is watching in Canada right now, and the part you play in catching the next one early.'),
      para('A quick word on currency. By its nature, a hot-topics course goes out of date. The numbers and the disease situation in these pages reflect mid-2026. The big picture should hold for a while, but the details move fast. Always confirm the current situation with the CFIA and your own veterinarian before you act on it.'),

      h2('Learning Objectives'),
      bullet('Explain why staying current on poultry hot topics protects your farm, and where to find information you can trust.'),
      bullet('Describe what avian influenza is, the difference between low and high pathogenic strains, and where the disease stands today in Canada and around the world.'),
      bullet('Recognize the warning signs of avian influenza and carry out your legal duty to report a suspected case to the CFIA.'),
      bullet('Understand how an avian influenza outbreak is handled in Canada, and the biosecurity steps that protect your flock during high-risk periods.'),
      bullet('Explain what makes a disease emerging or re-emerging, and name the disease issues currently on the radar in Canada.'),
      bullet('Understand how disease surveillance and early warning work, and the part you play in catching the next threat early.'),
    ],
  };
}

// ---- Section 1 ----
function buildSection1() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 1: Staying Current on Poultry Hot Topics'),
      para('Before we dig into any single disease, it is worth asking why a course like this exists at all. Most of what you do on a poultry farm is built on solid, settled knowledge. But some issues move fast, and on those, last year’s thinking is not enough. Knowing which issues are moving, and where to get good information on them, is a skill of its own.'),

      h2('1.1 What Hot Topics Are and Why They Matter to Your Farm'),
      para('A hot topic is simply an issue that is changing fast enough to matter to your decisions right now. A new disease appears. An old one shows up in a part of the country that never had it. A virus that used to cause mild illness starts killing whole flocks. These are not textbook topics that sit still. They shift from one season to the next, and they can reach your farm before the books catch up.'),
      para('The reason they matter is money and birds. A disease can jump from rare to everywhere in a single migration season, and the farms that come through best are almost always the ones that saw it coming and tightened up early. Staying current is cheap insurance. An hour spent understanding a threat before it arrives is worth far more than a week spent reacting after it is already in the barn.'),

      h2('1.2 Where to Get Reliable, Current Information'),
      para('The hard part is not finding information. It is finding information you can trust, because rumor travels faster than fact during an outbreak. A few sources are worth more than the rest. The Canadian Food Inspection Agency, the CFIA, is the official source for disease status, outbreaks, and control measures in Canada, and its avian influenza fact sheet is the place to start for the straight facts [1]. Your provincial marketing board passes CFIA alerts and program changes down to you and is a good local channel. And your own veterinarian can tell you what a national alert means for your specific barn.'),
      para('Be careful with social media and the rumor mill, especially when an outbreak has everyone on edge. A scary post that turns out to be wrong can push you into a costly overreaction, and a reassuring one that turns out to be wrong can cost you a flock. When something big is moving, go to the CFIA and your veterinarian first, and treat everything else as a tip to be checked, not a fact to act on.'),
    ],
  };
}

// ---- Section 2 ----
function buildSection2() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 2: Avian Influenza'),
      para('If there is one hot topic every Canadian poultry farmer needs to understand, it is avian influenza. It is the single biggest disease threat facing the industry today, it is reportable by law, and the current strain is behaving in ways nobody had seen before. This section is the heart of the course.'),

      h2('2.1 What Avian Influenza Is and Where It Stands Today'),
      para('Avian influenza, or bird flu, is a viral disease caused by influenza A viruses. The viruses are sorted by two proteins on their surface, called H and N, which is where names like H5N1 come from [1]. The basic virology is well described in standard references for anyone who wants the depth [2,3]. What a farmer needs to know is that not all strains are equal. Low pathogenic avian influenza, or LPAI, often causes mild signs or none at all. High pathogenic avian influenza, or HPAI, is the dangerous one. It can kill most of a flock within a day or two. In Canada, the H5 and H7 subtypes are reportable by law, a point we come back to shortly [1].'),
      para('The strain driving the current crisis is an H5N1 virus from a group scientists label clade 2.3.4.4b. It first reached North America in late 2021, spread across Canada through 2022, and has not left since [4]. The toll has been heavy. In 2025 alone, Canada lost more than 80 commercial flocks to the disease, with British Columbia hit hardest for the fourth year running, and the first commercial case of 2026 was confirmed in January [4]. Spring and fall, when wild birds migrate, are the riskiest times.'),
      para('What makes this strain different is how far it has spread beyond birds. Since 2024 it has infected dairy cattle in the United States, passing from cow to cow through the milking process, something never seen with this virus before [5]. It has killed cats, foxes, skunks, and marine mammals, and it has turned up in sheep, goats, and other farmed mammals [5]. There have been human cases too, almost all in people with close contact with infected animals. As of mid-2025 the United States had reported roughly 70 human cases and a single death, most of them mild, and with no sign of the virus spreading from person to person [6]. For the average farmer the human risk is still an occupational one, tied to close contact with sick birds, not a reason for panic.'),
      ...image(figBuf('fig18_2.png'), 'Figure 2.1: The widening reach of H5N1 clade 2.3.4.4b. Once a bird virus, it now reaches many mammals and, rarely, people, though it still does not spread easily between people. Source: CPC Short Courses.'),

      h2('2.2 How It Spreads and Gets Onto Farms'),
      para('The natural home of avian influenza is wild waterfowl. Ducks and geese carry the virus and shed it in their droppings, often without looking sick at all [1,7]. That is what makes it so hard to keep out. The reservoir is flying overhead and landing on the pond next to your barn, and it gives no warning.'),
      ...image(figBuf('fig18_1.png'), 'Figure 2.2: How avian influenza reaches your barn. The virus starts in wild birds and rides onto the farm on contaminated water and feed, on people and clothing, on shared equipment, and on rodents and small wild birds. Source: CPC Short Courses.'),
      para('From that reservoir, the virus gets onto farms by hitching a ride. Contaminated surface water or feed, boots and clothing that touched an infected area, shared equipment, trucks and crates moving between farms, and rodents or small wild birds slipping into the barn are all common routes. Once it reaches a single bird inside a barn, HPAI moves through the flock fast. The lesson is blunt: nearly every farm outbreak starts with the virus crossing the line between the dirty outside and the clean barn, and tight biosecurity is the only thing that reliably keeps it out. For the full biosecurity playbook, from the line of separation to boot changes and downtime, see Course 2 (Biosecurity) in this series.'),

      h2('2.3 Recognizing It and Your Legal Duty to Report'),
      para('The classic warning sign of HPAI is sudden, severe death loss, birds dying quickly and in numbers that do not add up. Before or alongside that, you may see a sharp drop in feed and water intake, a fall in egg production, swelling and purple discoloration of the comb and wattles, and respiratory or nervous-system signs [1]. Many of these signs overlap with other diseases, which is exactly why you do not try to diagnose it yourself. For how avian influenza signs compare with other common poultry diseases, see Course 7 (Common Poultry Diseases) in this series.'),
      para('Here is the part that is not optional. Avian influenza is a reportable disease under the federal Health of Animals Act. By law, a suspicion is enough. You must notify the CFIA right away, and you do not wait for a lab to confirm anything first [1]. The moment you suspect it, call your veterinarian and the CFIA, and then hold everything in place. Do not move birds, eggs, manure, or equipment off the property while you wait. Reporting fast is both the law and the best way to stop a barn problem from becoming a regional one. For the wider framework of reportable diseases and who regulates what, see Course 17 (Regulatory Framework in Poultry Production) in this series.'),

      h2('2.4 The Outbreak Response and Protecting Your Farm'),
      para('When the CFIA confirms HPAI on a farm, it moves quickly to stamp it out before it spreads. The infected premises is placed under quarantine, and the agency draws control zones around it. Within those zones, the movement of birds, eggs, equipment, and anything else that could carry the virus is tightly controlled, into, out of, and within the zone [8]. Affected flocks are humanely depopulated, the barn is cleaned and disinfected, and there is a required downtime before any new birds come in. Federal compensation is available for birds that are ordered destroyed [8].'),
      para('Behind the scenes, Canada runs a national surveillance program called the Canadian Notifiable Avian Influenza Surveillance System, or CanNAISS. It watches for the virus through testing in flocks that show signs, before slaughter, and in hatcheries, and it is what lets Canada prove to trading partners that its flocks are monitored [9]. That surveillance, plus a fast, organized response, is what keeps an outbreak from spreading farm to farm.'),
      para('Your part is prevention, and it matters most when the risk is highest. Raise your guard during spring and fall migration, when wild birds are moving and the virus is most active. The CPC Learning Centre Spotting Disease Early guide reinforces the habit that protects you: walk the barn every day, know your normal numbers, and act the moment something looks off [10]. Keep wild birds away from your feed and water, tighten who and what comes through your door, and never let a suspicious death loss sit unreported.'),
    ],
  };
}

// ---- Section 3 ----
function buildSection3() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 3: Emerging and Re-Emerging Disease Issues'),
      para('Avian influenza gets the headlines, but it is not the only disease story worth watching. New and changing diseases are a constant fact of poultry farming, and the farmer who understands how they emerge is better placed to catch the next one early. This section steps back to look at the bigger pattern.'),

      h2('3.1 What Emerging Means and What Drives It'),
      para('An emerging disease is one that is new, newly arrived in an area, or suddenly behaving worse than it used to. A re-emerging disease is an old foe coming back, often in a changed form that the usual vaccines or management do not fully cover [7]. The two ideas blur together in practice, and both keep landing on Canadian farms.'),
      para('A handful of forces drive this. Wild birds move diseases along their migratory flyways, ignoring every border. The global movement of birds, eggs, and equipment carries pathogens between regions. Crowded, intensive production gives a virus or bacterium plenty of hosts to adapt in. And the bugs themselves keep changing, mutating and swapping genes so that a familiar disease can suddenly wear a new face. You cannot stop these forces, but understanding them tells you why vigilance never goes out of style.'),

      h2('3.2 Diseases on the Radar in Canada'),
      para('Avian influenza jumping into dairy cattle and other mammals, covered in Section 2, is itself a textbook case of a virus emerging into new territory. But it is not the only one on the Canadian radar. A clear, closer-to-home example is a variant strain of infectious bronchitis virus known as DMV/1639. It moved into Eastern Canadian layer flocks and, within a few years, became one of the most commonly found infectious bronchitis strains in Ontario and Quebec [11].'),
      para('What makes DMV/1639 a good lesson is how quietly it does its damage. It can infect young pullets and harm the developing reproductive tract, producing what is called false layer syndrome. The hens look perfectly healthy but never lay the way they should, so the loss shows up as missing eggs rather than sick birds [12]. It is a reminder that emerging diseases do not always announce themselves with dramatic death loss. Other long-standing diseases keep evolving too, which is why the vaccines and management programs behind them have to keep pace, and why a strain that your vaccine handled five years ago is worth rechecking today.'),

      h2('3.3 Surveillance and Early Warning'),
      para('Catching an emerging disease early depends on a chain that starts on your barn floor and ends with national surveillance. Each link matters, and the first one is you.'),
      ...image(figBuf('fig18_3.png'), 'Figure 3.1: Catching an emerging disease early. The chain runs from the farmer’s daily barn walk, through the veterinarian and the diagnostic lab, into national surveillance, and back out as early warning. Source: CPC Short Courses.'),
      para('It works like this. Your daily observations, and the birds and samples your veterinarian sends to a provincial diagnostic laboratory, are how new and unusual problems first get spotted. The work that identified the DMV/1639 strain in Canada came out of exactly this kind of laboratory testing of field cases [11]. Those labs feed their results into national systems, including the avian influenza surveillance run through CanNAISS, so that a threat appearing on scattered farms is recognized as a pattern early rather than discovered one barn at a time [9]. The earlier the pattern is seen, the faster vaccines, alerts, and management advice can catch up to it.'),

      h2('3.4 What Farmers Should Do'),
      para('For all the science and surveillance behind it, the most powerful early-warning tool in the country is still a farmer who walks the barn every day and reports what does not look right. You are the first link in the chain, and a problem you catch and report on Monday is far cheaper for everyone than the same problem found across the region a month later [10].'),
      para('The practical habits are the same ones that serve you everywhere else. Keep your biosecurity tight, keep good records, and know the normal numbers for your flock so the abnormal jumps out at you. Work closely with your veterinarian, and never sit on a suspicion, whether it is a reportable disease or just something new and strange. For the systematic daily monitoring framework that helps you catch these changes early, see Course 3 (T-FLAWS Assessment Management Tool) in this series. Stay curious, stay current, and you become part of the system that keeps the whole industry ahead of the next threat.'),
    ],
  };
}

function buildJournalSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Recommended Peer-Reviewed Journals'),
      para('The following journals publish current research on poultry diseases, avian influenza, and emerging infections. They are good sources for farmers, service reps, and veterinarians who want to follow the science behind the hot topics in this course:'),
      bullet([{ text: 'Avian Diseases ', bold: true, italics: true }, { text: '(American Association of Avian Pathologists): poultry disease, avian influenza, and diagnostic research.' }]),
      bullet([{ text: 'Avian Pathology ', bold: true, italics: true }, { text: '(Taylor & Francis / WVPA): pathogenesis, diagnosis, and control of poultry diseases worldwide.' }]),
      bullet([{ text: 'Emerging Infectious Diseases ', bold: true, italics: true }, { text: '(US Centers for Disease Control and Prevention): emerging and zoonotic diseases, including avian influenza spillover.' }]),
      bullet([{ text: 'Journal of Veterinary Diagnostic Investigation ', bold: true, italics: true }, { text: '(American Association of Veterinary Laboratory Diagnosticians): diagnostic methods and disease surveillance.' }]),
    ],
  };
}

function buildReferencesSection() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('References'),
      para('References are listed in order of first appearance in the text. Sources are the Canadian Food Inspection Agency and other government agencies, peer-reviewed veterinary literature, standard reference texts, and the CPC Learning Centre. Disease-situation figures reflect mid-2026 and should be re-confirmed against current CFIA reporting.'),
      numberedRef('Canadian Food Inspection Agency. Facts about avian influenza. Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('Capua I, Alexander DJ, editors. Avian Influenza and Newcastle Disease: A Field and Laboratory Manual. Milan: Springer; 2009.'),
      numberedRef('Spackman E, editor. Avian Influenza Virus (Methods in Molecular Biology, vol. 436). Totowa, NJ: Humana Press; 2008.'),
      numberedRef('Canadian Food Inspection Agency. Avian influenza: latest bird flu situation. Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('American Veterinary Medical Association. Avian influenza virus type A (H5N1) in U.S. dairy cattle. Schaumburg, IL: AVMA; [cited 2026 Jun]. Available from: avma.org'),
      numberedRef('Centers for Disease Control and Prevention. H5 bird flu: current situation. Atlanta, GA: CDC; [cited 2026 Jun]. Available from: cdc.gov'),
      numberedRef('Thomas NJ, Hunter DB, Atkinson CT, editors. Infectious Diseases of Wild Birds. Ames, IA: Blackwell Publishing; 2007.'),
      numberedRef('Canadian Food Inspection Agency. Overview of how Canada prevents, prepares and responds to bird flu outbreaks. Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('Canadian Food Inspection Agency. Avian influenza surveillance: Canadian Notifiable Avian Influenza Surveillance System (CanNAISS). Ottawa: CFIA; [cited 2026 Jun]. Available from: inspection.canada.ca'),
      numberedRef('Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
      numberedRef('Ojkic D, Susta L, Martin E. Genotyping of infectious bronchitis virus in Canada. J Vet Diagn Invest. 2024;36(6):804-808. doi:10.1177/10406387241265955'),
      numberedRef('Hassan MSH, Ali A, Buharideen SM, Goldsmith D, Coffin CS, Cork SC, van der Meer F, Boulianne M, Abdul-Careem MF. Pathogenicity of the Canadian Delmarva (DMV/1639) infectious bronchitis virus (IBV) on female reproductive tract of chickens. Viruses. 2021;13(12):2488. doi:10.3390/v13122488'),
    ],
  };
}

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

async function main() {
  console.log('Building Course 18: Current Poultry Issues (Hot Topics)...');
  const doc = new Document({
    creator: 'CPC Short Courses',
    title: COURSE_TITLE,
    description: 'Course 18 — CPC Short Courses',
    features: { updateFields: false },
    styles: buildStyles(),
    numbering: buildNumbering(),
    sections: [
      buildCoverSection(),
      buildIntroSection(),
      buildSection1(),
      buildSection2(),
      buildSection3(),
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
    { lvl: 1, text: 'Section 1: Staying Current on Poultry Hot Topics', page: 4 },
    { lvl: 2, text: '1.1 What Hot Topics Are and Why They Matter to Your Farm', page: 4 },
    { lvl: 2, text: '1.2 Where to Get Reliable, Current Information', page: 4 },
    { lvl: 1, text: 'Section 2: Avian Influenza', page: 5 },
    { lvl: 2, text: '2.1 What Avian Influenza Is and Where It Stands Today', page: 5 },
    { lvl: 2, text: '2.2 How It Spreads and Gets Onto Farms', page: 6 },
    { lvl: 2, text: '2.3 Recognizing It and Your Legal Duty to Report', page: 7 },
    { lvl: 2, text: '2.4 The Outbreak Response and Protecting Your Farm', page: 8 },
    { lvl: 1, text: 'Section 3: Emerging and Re-Emerging Disease Issues', page: 9 },
    { lvl: 2, text: '3.1 What Emerging Means and What Drives It', page: 9 },
    { lvl: 2, text: '3.2 Diseases on the Radar in Canada', page: 10 },
    { lvl: 2, text: '3.3 Surveillance and Early Warning', page: 10 },
    { lvl: 2, text: '3.4 What Farmers Should Do', page: 11 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals', page: 12 },
    { lvl: 1, text: 'References', page: 13 },
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
      console.warn(`Course 18 TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length}. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
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
