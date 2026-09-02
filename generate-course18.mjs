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
  const children = Array.isArray(text)
    ? text.map(seg => new TextRun({ text: seg.text, italics: seg.italics || false, color: BODY_GRAY, size: 22, font: 'Calibri' }))
    : [new TextRun({ text, color: BODY_GRAY, size: 22, font: 'Calibri' })];
  return new Paragraph({
    children,
    numbering: { reference: 'references-list', level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
  });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }
// Reads the pixel dimensions out of a JPEG's SOF marker so photos keep their aspect ratio.
function jpegDims(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
      return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
function image(buf, caption, widthIn = 5.9) {
  if (!buf) return [];
  const dpi = 96;
  const wpx = Math.round(widthIn * dpi);
  const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
  let hpx = Math.round(wpx * 0.66);
  try {
    if (isJpeg) {
      const d = jpegDims(buf);
      if (d && d.w > 0 && d.h > 0) hpx = Math.round(wpx * d.h / d.w);
    } else {
      const view = new DataView(buf.buffer, buf.byteOffset);
      const pw = view.getUint32(16, false);
      const ph = view.getUint32(20, false);
      if (pw > 0 && ph > 0) hpx = Math.round(wpx * ph / pw);
    }
  } catch (_) {}
  return [
    new Paragraph({
      children: [new ImageRun({ data: buf, transformation: { width: wpx, height: hpx }, type: isJpeg ? 'jpg' : 'png' })],
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
      children: [new TextRun({ text: 'September 2026', color: '595959', size: 22, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 800 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'This course has been developed for educational purposes for commercial poultry farmers in Canada. Because it covers current issues, the disease situation, figures, and dates in it reflect September 2026 and will change over time. It does not replace the current guidance of the Canadian Food Inspection Agency, your provincial marketing board, or your veterinarian. Always confirm the present disease situation and reporting requirements with the CFIA and a licensed veterinarian before acting. The CPC team reviews and updates this series as the situation moves. If you spot something that has changed, tell us so we can correct it.', color: '808080', size: 18, font: 'Calibri', italics: true })],
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
      para('This course is about the issues that matter most right now. We start with why staying current is worth your time and where to get information you can trust. Then we spend most of the course on avian influenza: what it is, where it stands today, how it gets onto farms, how to recognize it, your legal duty to report it, and how an outbreak is handled. Then we look at the wider world of emerging and re-emerging diseases, the ones surveillance is watching in Canada right now, and the part you play in catching the next one early. We finish with antimicrobial resistance, the slow-moving threat sitting behind every disease, and what responsible antibiotic use looks like on your farm.'),
      para('A quick word on currency. By its nature, a hot-topics course goes out of date. The numbers and the disease situation in these pages reflect September 2026. The big picture should hold for a while, but the details move fast. Always confirm the current situation with the CFIA and your own veterinarian before you act on it.'),

      h2('Learning Objectives'),
      bullet('Explain why staying current on poultry hot topics protects your farm, and where to find information you can trust.'),
      bullet('Describe what avian influenza is, the difference between low and high pathogenic strains, and where the disease stands today in Canada and around the world.'),
      bullet('Recognize the warning signs of avian influenza and carry out your legal duty to report a suspected case to the CFIA.'),
      bullet('Protect yourself and your staff around a zoonotic virus, and know what to tell your physician after an exposure.'),
      bullet('Understand how an avian influenza outbreak is handled in Canada, and the biosecurity steps that protect your flock during high-risk periods.'),
      bullet('Describe what happens to a healthy farm caught inside a control zone, what it takes to move birds, eggs, feed, or manure, and what compensation does and does not cover.'),
      bullet('Explain where the vaccination question stands in Canada and why it is not an option on your farm today.'),
      bullet('Explain what makes a disease emerging or re-emerging, and name the disease issues currently on the radar in Canada.'),
      bullet('Understand how disease surveillance and early warning work, and the part you play in catching the next threat early.'),
      bullet('Explain what antimicrobial resistance is, what Canada and the poultry industry have done about it, and what responsible antibiotic use means on your farm.'),
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
      para('Avian influenza, or bird flu, is a viral disease caused by influenza A viruses. The viruses are sorted by two proteins on their surface, called H and N, which is where names like H5N1 come from [1]. The basic virology is well described in standard references for anyone who wants the depth [2,3]. What a farmer needs to know is that not all strains are equal. Low pathogenic avian influenza, or LPAI, often causes mild signs or none at all. High pathogenic avian influenza, or HPAI, is the dangerous one. In an unvaccinated flock it can push mortality to nearly 100 percent within a few days of exposure [4]. In Canada, every high pathogenic strain is reportable by law, and so is low pathogenic avian influenza of the H5 and H7 subtypes, because those two can turn from mild to deadly once they get into domestic birds [1]. We come back to what that means for you shortly.'),
      para('The strain driving the current crisis is an H5N1 virus from a group scientists label clade 2.3.4.4b. It first reached North America in late 2021, spread across Canada through 2022, and has not left since [5]. The toll has been heavy. Since it arrived, more than 650 Canadian farms and flocks have been infected and roughly 17.5 million birds have been lost. British Columbia alone accounts for more than half of those birds [5]. In 2025 the country lost 82 commercial flocks. The first half of 2026 has been quieter, but cases have still turned up in several provinces, so nobody is calling it over [5]. Spring and fall, when wild birds migrate, are the riskiest times.'),
      para('What makes this strain different is how far it has spread beyond birds. Since 2024 it has infected dairy cattle in the United States, passing from cow to cow through the milking process, something never seen with this virus before [6]. It has killed cats, foxes, skunks, and marine mammals, and it has turned up in sheep, goats, and other farmed mammals [6].'),
      para('People have been infected too, almost always after close contact with sick animals. By the middle of 2026 the United States had reported about 70 human H5N1 cases since 2024, most of them mild, one of them fatal, and no sign of the virus passing from person to person [7]. A second death, in November 2025, is the one worth knowing about. A Washington State backyard flock owner died after catching a related virus called H5N5, the first time that virus had ever been found in a person [8]. Investigators traced it back to the owner’s own ducks and the sediment in their watering basin, and those ducks looked perfectly healthy [8]. That is the part to take home: waterfowl can be carrying a dangerous virus and show you nothing at all. About 135 people connected to that case were monitored and none of them got sick [8]. For the average farmer the human risk is still an occupational one, tied to close contact with birds and the wet ground they live on, not a reason for panic.'),
      para('So what do you actually do about it? Wear protective equipment when you handle sick or dead birds, and treat a barn with heavy unexplained death loss as a place to cover up before you walk in. Watch yourself for fever, cough, or sore or watery eyes for a few days after that kind of exposure, and if you get sick, tell your physician you work with poultry. That one sentence changes what they test you for. Get your seasonal flu shot too. It does not protect you against bird flu, but it lowers the chance of a human flu virus and a bird flu virus meeting in the same person, which is how a virus that spreads between people could be built. Canada has also authorized a human H5N1 vaccine and holds doses for people at higher occupational risk, including those routinely involved in culling infected poultry [9]. For the full protective-equipment routine, see Course 8 (Fundamentals of Poultry Vaccination and Treatment) in this series.'),
      ...image(figBuf('fig2.jpg'), 'Figure 2.1: The widening reach of H5N1 clade 2.3.4.4b. Once a bird virus, it now reaches many mammals and, rarely, people, though it still does not spread easily between people. Source: CPC Short Courses.'),

      h2('2.2 How It Spreads and Gets Onto Farms'),
      para('The natural home of avian influenza is wild waterfowl. Ducks and geese carry the virus and shed it in their droppings, often without looking sick at all [1,10]. That is what makes it so hard to keep out. The reservoir is flying overhead and landing on the pond next to your barn, and it gives no warning.'),
      ...image(figBuf('photo_waterfowl_water.jpg'), 'Photo 2.1: Waterfowl on open water beside the barns. Any pond, slough, or standing puddle that wild ducks and geese can share with your birds is a direct line from the reservoir into your flock, and it is the reason waterfowl operations and farms near water carry extra risk. Source: CPC Short Courses.'),
      para('From that reservoir, the virus gets onto farms by hitching a ride. Contaminated surface water or feed, boots and clothing that touched an infected area, shared equipment, trucks and crates moving between farms, and rodents or small wild birds slipping into the barn are all common routes. Once it reaches a single bird inside a barn, HPAI moves through the flock fast. The lesson is blunt: nearly every farm outbreak starts with the virus crossing the line between the dirty outside and the clean barn, and tight biosecurity is the only thing that reliably keeps it out. For the full biosecurity playbook, from the line of separation to boot changes and downtime, see Course 2 (Biosecurity) in this series.'),
      para('There is a harder lesson underneath that, and British Columbia has the numbers for it. Researchers went back through the 2022 and 2023 outbreak and worked out where each infection actually came from, using the genetics of the virus alongside the field investigations. Of 127 infected commercial farms, only about one in six were separate introductions from wild birds. Close to two thirds were the virus moving from one farm to another [11]. Most striking of all, simply being within 200 meters of an infected farm predicted whether you went down better than having any direct contact with one [11]. Read that again if you farm in a dense poultry area. Your own biosecurity is still the thing you control, but in a tight production zone your neighborhood is part of your risk, and the weeks after a nearby break are the weeks to be strictest.'),
      ...image(figBuf('fig1-new.jpg'), 'Figure 2.2: How avian influenza reaches your barn. The virus starts in wild birds and rides onto the farm on contaminated water and feed, on people and clothing, on shared equipment, and on rodents and small wild birds. Source: CPC Short Courses.'),

      h2('2.3 Recognizing It and Your Legal Duty to Report'),
      para('The classic warning sign of HPAI is sudden, severe death loss, birds dying quickly and in numbers that do not add up. Before or alongside that, the CFIA lists what to watch for. Birds go quiet and deeply depressed. Egg production drops, and the eggs you do get come soft-shelled or shell-less. You may also see diarrhea, swelling of the skin under the eyes, combs and wattles swollen and congested, and hemorrhages on the hocks [1]. Many of these signs overlap with other diseases, which is exactly why you do not try to diagnose it yourself. For how avian influenza signs compare with other common poultry diseases, see Course 7 (Common Poultry Diseases) in this series.'),
      ...image(figBuf('photo_ai_signs.jpg'), 'Photo 2.2: What highly pathogenic avian influenza looks like. From the outside you may see a swollen face, a comb and wattles turned blue-purple, and bruising and blood spots on the shanks and feet (top row). The bleeding through the trachea, proventriculus, heart, pancreas, and intestine is what the veterinarian finds at post-mortem, not something to go opening birds for yourself. No single lesion confirms it, but the outside signs together with sudden heavy death loss mean you stop, leave the birds where they are, and call. Source: Diseases of Poultry, 14th ed.; Picture Book of Infectious Poultry Diseases (FAO-CEVA); CEVA Handbook of Poultry Diseases; ASA Handbook on Poultry Diseases.'),
      para('Here is the part that is not optional. Avian influenza is a reportable disease under the federal Health of Animals Act. By law, a suspicion is enough. You must notify the CFIA right away, and you do not wait for a lab to confirm anything first [1]. The moment you suspect it, call your veterinarian and the CFIA, and then hold everything in place. Do not move birds, eggs, manure, or equipment off the property while you wait. Reporting fast is both the law and the best way to stop a barn problem from becoming a regional one. For the wider framework of reportable diseases and who regulates what, see Course 17 (Regulatory Framework in Poultry Production) in this series.'),

      h2('2.4 The Outbreak Response and What Happens to Your Farm'),
      para('When the CFIA confirms HPAI on a farm, it moves quickly to stamp it out before it spreads. Your farm goes under quarantine, formally called a Declaration of Infected Place, and no birds, eggs, or manure move on or off the property without CFIA permission [12]. The agency also draws a primary control zone around the area and controls movement inside it [13]. The flock is humanely destroyed, then the barn is stripped of litter and manure and wet cleaned and disinfected. New birds normally cannot come in until at least 14 days after the final cleaning and disinfection inspection is approved [12].'),
      para('Now the part that catches far more farms than the disease itself. When a control zone goes up, every poultry farm inside it is affected, not just the infected one. If your flock is healthy and your neighbor is the one who broke, you are still inside the zone. Birds, hatching eggs, table eggs, manure, litter, feed, and anything else that has been around birds cannot move into, out of, within, or through that zone without CFIA permission [14]. Some movements run under a general permit and some need a specific one, and the CFIA runs an online tool that tells you which applies to the move you need to make [14]. This is the outbreak experience most producers actually have. Know before it happens who at your processor, hatchery, and feed mill handles permits, because the week your neighbor breaks is a bad week to be working that out from scratch.'),
      para('Be clear-eyed about compensation too. The CFIA pays for animals and things it orders destroyed and for the cost of disposing of them, at market value up to maximum amounts set in the regulations [15]. Those maximums are ceilings, and the agency says plainly that compensation may not cover full replacement value. Two things it does not cover are worth knowing before you need them: loss of future revenue, and anything ordered cleaned and disinfected [15]. So the birds are paid for within limits, but the empty weeks, the lost production, and the cleanout labor largely sit with you. Talk to your marketing board and your insurance provider about that gap while things are calm.'),
      para('One more thing that does not appear in any CFIA document. Watching a flock you raised get depopulated is hard, and it is harder still when it is your family farm, your barn, and your year of work. Producers who have been through it describe it as a grief, and the quiet weeks afterward with empty barns can be worse than the day itself. That reaction is normal and it is common. The Do More Agriculture Foundation runs mental health support built for Canadian farmers, including a moderated peer support community, and most provinces have a farm-specific help line as well [16]. Use them, and watch for it in your staff and your neighbors too.'),
      h2('2.5 The Vaccination Question'),
      para('The question the whole sector is watching is whether vaccination will ever join that response. Canada\'s answer to bird flu has always been to stamp it out, not to vaccinate. Part of the reason is trade, because vaccinating a flock can complicate exports and has to be weighed against its effect on surveillance, so Canada has stayed cautious [17]. But the sheer length of this outbreak has pushed the question back onto the table. A CFIA task force formed in 2023 has been weighing whether vaccination could earn a place in the response [13], and that work has now moved off paper. In August 2026 the CFIA launched a confined field trial on two commercial farms in Manitoba, starting with an egg-laying operation, with a turkey operation expected to join in 2027 [18]. The agency is blunt about what this is and is not. It is there to gather evidence on whether the vaccines work and how you would even deliver them on a working farm. It is not a decision to vaccinate, not a national program, and not a change to any current control measure [18]. Vaccinated birds can still be infected and still spread the virus, so vaccination would sit on top of biosecurity, never in place of it [18]. None of this makes vaccination an option on your farm today, and any real change would arrive with new rules and trade talks attached. It is the live policy question in the sector, so keep an eye on the CFIA for where it lands [17].'),
      h2('2.6 Surveillance and Protecting Your Flock'),
      para('Behind the scenes, Canada runs a national surveillance program called the Canadian Notifiable Avian Influenza Surveillance System, or CanNAISS. It watches for the virus through testing in flocks that show signs, before slaughter, and in hatcheries, and it is what lets Canada prove to trading partners that its flocks are monitored [19]. That surveillance, plus a fast, organized response, is what keeps an outbreak from spreading farm to farm.'),
      para('Your part is prevention, and it matters most when the risk is highest. Raise your guard during spring and fall migration, when wild birds are moving and the virus is most active. The CPC Learning Centre Spotting Disease Early guide reinforces the habit that protects you: walk the barn every day, know your normal numbers, and act the moment something looks off [20]. Keep wild birds away from your feed and water, tighten who and what comes through your door, and never let a suspicious death loss sit unreported.'),
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
      para('An emerging disease is one that is new, newly arrived in an area, or suddenly behaving worse than it used to. A re-emerging disease is an old foe coming back, often in a changed form that the usual vaccines or management do not fully cover [10]. The two ideas blur together in practice, and both keep landing on Canadian farms.'),
      para('A handful of forces drive this. Wild birds move diseases along their migratory flyways, ignoring every border. The global movement of birds, eggs, and equipment carries pathogens between regions. Crowded, intensive production gives a virus or bacterium plenty of hosts to adapt in. And the bugs themselves keep changing, mutating and swapping genes so that a familiar disease can suddenly wear a new face. You cannot stop these forces, but understanding them tells you why vigilance never goes out of style.'),

      h2('3.2 Diseases on the Radar in Canada'),
      para('Avian influenza jumping into dairy cattle and other mammals, covered in Section 2, is itself a textbook case of a virus emerging into new territory. But it is not the only one on the Canadian radar. A clear, closer-to-home example is a variant strain of infectious bronchitis virus known as DMV/1639. It was first picked up in Canada in 2015, in an Ontario layer flock with production problems and rising mortality. It spread fast. By 2016 it had become the most important viral chicken pathogen in the province, hitting every kind of chicken operation, and it is now the most frequently detected infectious bronchitis variant in Canadian testing [21].'),
      para('What makes DMV/1639 a good lesson is how quietly it does its damage. It can infect young pullets and harm the developing reproductive tract, producing what is called false layer syndrome. The hens look perfectly healthy but never lay the way they should, so the loss shows up as missing eggs rather than sick birds [22]. It is a reminder that emerging diseases do not always announce themselves with dramatic death loss.'),
      ...image(figBuf('photo_ibv_cystic_oviduct.jpg'), 'Photo 3.1: A fluid-filled cystic oviduct in a hen that met infectious bronchitis virus as a young pullet. The bird looks healthy, eats, and holds her weight, but the oviduct never developed properly, so the eggs never come. This is the false layer picture behind the DMV/1639 story, and it is only found once a bird is opened up at the laboratory. Source: CPC Learning Centre; Picture Book of Infectious Poultry Diseases (FAO-CEVA).', 4.2),
      para('DMV/1639 is also not the end of the story for infectious bronchitis. This virus is a shape-shifter that swaps pieces of its genetic code with other strains, and Canadian diagnostic labs keep turning up brand-new versions. As recently as 2024, two previously unrecognized IBV variants were found in Canadian flocks hit by drops in egg production, each one a recombinant that had blended parts of other viruses into something new [23]. The worry with any new variant is always the same. The vaccine that protected your birds against last year’s strain may not fully cover this year’s, which is why a strain your program handled five years ago is worth rechecking with your veterinarian today.'),
      para('A different disease has been climbing in Canadian broiler barns: inclusion body hepatitis, or IBH. It is caused by fowl adenoviruses, and it usually hits broilers between three and five weeks old as a sudden jump in deaths, with pale, swollen, mottled livers showing up at post-mortem [24]. What marks it as a genuine emerging disease is the trend. IBH outbreaks have been rising in Canada and worldwide since about 2015, and the mix of virus types behind them has shifted. FAdV8b is now the strain found most often, where FAdV8a and FAdV11 used to share the load [25]. IBH has long been the kind of disease that moves in after something else has weakened the birds, usually infectious bursal disease or chicken anemia virus. It now turns up in flocks as a primary problem on its own too [24]. Either way, it is a reminder to look past the liver and ask what else is going on in that flock.'),
      ...image(figBuf('photo_ibh_liver.jpg'), 'Photo 3.2: Inclusion body hepatitis livers. A swollen, pale, greasy-looking liver in one bird (top left) and a badly swollen, mottled liver in another (right), with swollen kidneys in the same bird (bottom left). This is the picture the laboratory sends back when a three to five week old broiler flock starts dying without warning. Source: CPC Learning Centre.'),
      para('If you want the clearest recent example of a disease that simply was not here and now is, it is avian metapneumovirus, or aMPV. It turned up in Canadian commercial poultry for the first time in 2024, confirmed in two Ontario turkey flocks that April, and it was in Manitoba and Quebec before the year was out [26,27]. It is no longer news. It is established. Ontario alone had recorded over a hundred confirmed cases by late 2025. The people who work on it now describe it the way they describe infectious bronchitis: a respiratory virus that will keep circulating in the industry rather than one anybody is going to chase back out [27].'),
      para([
        { text: 'What it looks like depends on the bird. Turkeys take it hardest, with swollen heads and sinuses, snicking, and mortality that has run as high as 40 percent in bad cases. In chickens and layers the death loss is much lower, but the virus opens the door for secondary bacteria, and what you actually notice is a drop in eggs and feed with more ' },
        { text: 'E. coli', italics: true },
        { text: ' than usual behind it [27]. Vaccines are in limited use in Canada under CFIA-approved doses while full licensing is worked out, so this is a live conversation to have with your veterinarian rather than a settled program [27]. The lesson to take from aMPV is the one this whole section is built on. A disease that was somebody else\u2019s problem in 2023 was in Canadian barns in 2024 and endemic by 2025. That is how fast the map changes.' },
      ]),
      ...image(figBuf('photo_ampv.jpg'), 'Photo 3.3: Avian metapneumovirus. From the outside you see a swollen head in broilers and breeders and swollen sinuses under the eyes in turkeys (top row). The exudate packing the head and the inflamed ovary (bottom row) are what the laboratory finds, and they show why the secondary bacteria do most of the damage. Source: CEVA Handbook of Poultry Diseases.'),

      h2('3.3 Surveillance and Early Warning'),
      para('Catching an emerging disease early depends on a chain that starts on your barn floor and ends with national surveillance. Each link matters, and the first one is you.'),
      ...image(figBuf('fig3.jpg'), 'Figure 3.1: Catching an emerging disease early. The chain runs from the farmer’s daily barn walk, through the veterinarian and the diagnostic lab, into national surveillance, and back out as early warning. Source: CPC Short Courses.'),
      para('It works like this. Your daily observations, and the birds and samples your veterinarian sends to a provincial diagnostic laboratory, are how new and unusual problems first get spotted. The work that identified the DMV/1639 strain in Canada came out of exactly this kind of laboratory testing of field cases [21]. Those labs feed their results into national systems, including the avian influenza surveillance run through CanNAISS, so that a threat appearing on scattered farms is recognized as a pattern early rather than discovered one barn at a time [19]. The earlier the pattern is seen, the faster vaccines, alerts, and management advice can catch up to it.'),

      h2('3.4 What Farmers Should Do'),
      para('For all the science and surveillance behind it, the most powerful early-warning tool in the country is still a farmer who walks the barn every day and reports what does not look right. You are the first link in the chain, and a problem you catch and report on Monday is far cheaper for everyone than the same problem found across the region a month later [20].'),
      para('The practical habits are the same ones that serve you everywhere else. Keep your biosecurity tight, keep good records, and know the normal numbers for your flock so the abnormal jumps out at you. Work closely with your veterinarian, and never sit on a suspicion, whether it is a reportable disease or just something new and strange. For the systematic daily monitoring framework that helps you catch these changes early, see Course 3 (T-FLAWS Assessment Management Tool) in this series. Stay curious, stay current, and you become part of the system that keeps the whole industry ahead of the next threat.'),
    ],
  };
}

// ---- Section 4 ----
function buildSection4() {
  return {
    properties: { page: { margin: pageMargin } },
    headers: { default: buildHeader() }, footers: { default: buildFooter() },
    children: [
      h1('Section 4: Antimicrobial Resistance (AMR)'),
      para('The last hot topic in this course is not a single disease but a slow-moving threat that sits behind every disease: antimicrobial resistance, or AMR. It has gone from a background worry to a front-page issue for the whole poultry industry, and it is one of the few topics where what you do in your barn is directly connected to human health.'),

      h2('4.1 What AMR Is and Why It Is a Hot Topic'),
      para('AMR is what happens when the bugs we treat with antibiotics learn to survive them. Every time an antibiotic is used, in people or in animals, the bacteria that live through it get a chance to adapt. Use these drugs too often or too loosely and the resistant strains take over, which leaves you with medicines that no longer work when you truly need them. Health authorities around the world now rank AMR as one of the biggest threats to human medicine, and poultry is part of that conversation because the same families of drugs are used on both sides.'),
      para([
        { text: 'Canada has a clear, homegrown example of why this matters. For years, an antibiotic called ceftiofur was used in some chicken hatcheries. National surveillance found that resistance to it in ' },
        { text: 'Salmonella', italics: true },
        { text: ' Heidelberg, a bug that makes people sick, rose and fell in retail chicken and in human infections almost in lockstep [28]. When hatcheries in Quebec voluntarily stopped using the drug, resistance dropped sharply in both chicken and people, then climbed again when use resumed [28]. It is about as clear a demonstration as you can get that on-farm antibiotic use reaches all the way to the dinner table. That kind of evidence, tracked by the national surveillance program CIPARS, is exactly why AMR became a hot topic [29].' },
      ]),

      h2('4.2 What Canada and the Poultry Industry Are Doing About It'),
      para('Both government and the industry have moved hard on this. On the regulatory side, since December 2018 Health Canada has required a veterinary prescription for every medically important antibiotic used in animals, and it had the growth-promotion claims stripped off those products [30]. In plain terms, you can no longer buy these antibiotics over the counter, and you cannot use them just to make birds grow faster. Every important antibiotic now runs through your veterinarian.'),
      para('The poultry industry did not wait to be forced. Through the Chicken Farmers of Canada Responsible Antimicrobial Use Strategy, the chicken sector eliminated the preventive use of the antibiotic categories most important to human medicine. It started with the highest-priority Category I drugs in 2014 and moved to Category II in 2018 [31]. The plan to drop preventive use of the next tier, Category III, was reassessed. Rather than a hard ban, the sector chose to keep pushing those numbers down through voluntary work with hatcheries, feed companies, and veterinarians [31]. The payoff has been real drops in resistance in the bacteria that surveillance tracks, which is the whole point of the exercise.'),

      h2('4.3 What It Means for Your Farm'),
      para('For you, antimicrobial stewardship is now just part of good farming, not an optional extra. The guiding idea is simple: use antibiotics as little as possible and as much as necessary. That means treating real, diagnosed disease under your veterinarian’s direction instead of reaching for antibiotics out of habit. Record every treatment with its dose and withdrawal time. Then respect that withdrawal time to the day before any birds or eggs leave the farm. If a drug is ever used off-label and the withdrawal time is not obvious, your veterinarian can request a science-based interval from CgFARAD, the Canadian residue-avoidance service set up for exactly that question [32].'),
      para('It is worth being honest about what happens when the antibiotics come out. Gut health is where it shows first. Necrotic enteritis and coccidiosis are the two that press hardest, and in Canadian broilers the great majority of medically important antibiotic use has been aimed at necrotic enteritis in the first place [33]. Take the drug away and put nothing in its place and you will meet that disease. What fills the gap is not one product but a program: coccidiosis vaccination or a proper rotation, clean water, and dry litter. Feed that does not swing on the birds helps too, and so does the biosecurity that keeps the challenge low in the first place [33].'),
      para('The best way to use fewer antibiotics is to need fewer. Strong biosecurity, good vaccination, clean water, and solid day-to-day management keep birds healthy enough that they rarely need treating in the first place. Stewardship and good husbandry are the same thing seen from two sides. For the full picture on treatment, vaccination, and antimicrobial stewardship on the farm, see Course 8 (Fundamentals of Poultry Vaccination and Treatment) in this series.'),
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
      para('References are listed in order of first appearance in the text. Sources are the Canadian Food Inspection Agency and other government agencies, peer-reviewed veterinary literature, standard reference texts, and the CPC Learning Centre. Disease-situation figures reflect September 2026 and should be re-confirmed against current CFIA reporting.'),
      numberedRef('Canadian Food Inspection Agency. Facts about avian influenza. Ottawa: CFIA; [cited 2026 Sep]. Available from: inspection.canada.ca'),
      numberedRef('Capua I, Alexander DJ, editors. Avian Influenza and Newcastle Disease: A Field and Laboratory Manual. Milan: Springer; 2009.'),
      numberedRef('Spackman E, editor. Avian Influenza Virus (Methods in Molecular Biology, vol. 436). Totowa, NJ: Humana Press; 2008.'),
      numberedRef('Merck Veterinary Manual. Avian influenza in poultry and wild birds. Rahway, NJ: Merck & Co.; [cited 2026 Sep]. Available from: merckvetmanual.com'),
      numberedRef('Canadian Food Inspection Agency. Avian influenza: latest bird flu situation. Ottawa: CFIA; [cited 2026 Sep]. Available from: inspection.canada.ca'),
      numberedRef('American Veterinary Medical Association. Avian influenza virus type A (H5N1) in U.S. dairy cattle. Schaumburg, IL: AVMA; [cited 2026 Sep]. Available from: avma.org'),
      numberedRef('Centers for Disease Control and Prevention. H5 bird flu: current situation. Atlanta, GA: CDC; [cited 2026 Sep]. Available from: cdc.gov'),
      numberedRef('Kibiger L, Oltean HN, Leitz L, Krause E, Barrett D, Halloran A, et al. Fatal human case of highly pathogenic avian influenza A(H5N5) in a backyard flock owner, Washington, November 2025. MMWR Morb Mortal Wkly Rep. 2026;75(17):221-225. doi:10.15585/mmwr.mm7517a2'),
      numberedRef('Public Health Agency of Canada. Avian influenza A(H5N1): for health professionals. Ottawa: PHAC; [cited 2026 Sep]. Available from: canada.ca'),
      numberedRef('Thomas NJ, Hunter DB, Atkinson CT, editors. Infectious Diseases of Wild Birds. Ames, IA: Blackwell Publishing; 2007.'),
      numberedRef('Howden K, French SK, Racicot M, Signore AV, Best C, Perrey J, et al. Applying field and genomic epidemiology methods to investigate transmission networks of highly pathogenic avian influenza A (H5N1) in domestic poultry in British Columbia, Canada (2022-2023). Transbound Emerg Dis. 2025;2025:4099285. doi:10.1155/tbed/4099285'),
      numberedRef('Canadian Food Inspection Agency. Avian influenza: what to expect if your animals are infected. Ottawa: CFIA; [cited 2026 Sep]. Available from: inspection.canada.ca'),
      numberedRef('Canadian Food Inspection Agency. Overview of how Canada prevents, prepares and responds to bird flu outbreaks. Ottawa: CFIA; [cited 2026 Sep]. Available from: inspection.canada.ca'),
      numberedRef('Canadian Food Inspection Agency. Avian influenza: permits and conditions needed for movement control. Ottawa: CFIA; [cited 2026 Sep]. Available from: inspection.canada.ca'),
      numberedRef('Canadian Food Inspection Agency. Animal health compensation: what to expect when an animal is ordered destroyed. Ottawa: CFIA; [cited 2026 Sep]. Available from: inspection.canada.ca'),
      numberedRef('The Do More Agriculture Foundation. Mental health resources for Canadian agriculture. Saskatoon, SK: Do More Ag; [cited 2026 Sep]. Available from: domore.ag'),
      numberedRef('Canadian Food Inspection Agency. Exploring avian influenza vaccination in poultry in Canada. Ottawa: CFIA; [cited 2026 Sep]. Available from: inspection.canada.ca/en/animal-health/terrestrial-animals/diseases/reportable/avian-influenza/vaccination'),
      numberedRef('Canadian Food Inspection Agency. The Canadian Food Inspection Agency launches confined field trial to explore poultry vaccination against highly pathogenic avian influenza (HPAI). Ottawa: CFIA; 2026 Aug 4 [cited 2026 Sep]. Available from: inspection.canada.ca'),
      numberedRef('Canadian Food Inspection Agency. Avian influenza surveillance: Canadian Notifiable Avian Influenza Surveillance System (CanNAISS). Ottawa: CFIA; [cited 2026 Sep]. Available from: inspection.canada.ca'),
      numberedRef('Spotting Disease Early [Flock Management Guide]. CPC Learning Centre. Available from: cpclearningcentre.ca'),
      numberedRef('Ojkic D, Susta L, Martin E. Genotyping of infectious bronchitis virus in Canada. J Vet Diagn Invest. 2024;36(6):804-808. doi:10.1177/10406387241265955'),
      numberedRef('Hassan MSH, Ali A, Buharideen SM, Goldsmith D, Coffin CS, Cork SC, van der Meer F, Boulianne M, Abdul-Careem MF. Pathogenicity of the Canadian Delmarva (DMV/1639) infectious bronchitis virus (IBV) on female reproductive tract of chickens. Viruses. 2021;13(12):2488. doi:10.3390/v13122488'),
      numberedRef('Farooq M, Ali A, Hassan MSH, Abdul-Careem MF. Nucleotide and amino acid analyses of unique infectious bronchitis virus (IBV) variants from Canadian poultry flocks with drop in egg production. Genes (Basel). 2024;15(11):1480. doi:10.3390/genes15111480'),
      numberedRef('El-Shall NA, El-Hamid HSA, Elkady MF, Ellakany HF, Elbestawy AR, Gado AR, et al. Epidemiology, pathology, prevention, and control strategies of inclusion body hepatitis and hepatitis-hydropericardium syndrome in poultry: a comprehensive review. Front Vet Sci. 2022;9:963199. doi:10.3389/fvets.2022.963199'),
      numberedRef('Ojkic D, Lopes J, Sandrock C, Ratsep E, Brouwer E, Brooks A, Rossi T, Martin E. Fowl adenovirus infection and inclusion body hepatitis in Canada: genotyping trends from 2008 to 2024. J Vet Diagn Invest. 2026;38(2):168-173. doi:10.1177/10406387251412366'),
      numberedRef('Ontario Animal Health Network. Avian metapneumovirus (aMPV) detected in Ontario. Guelph, ON: OAHN; 2024 [cited 2026 Sep]. Available from: oahn.ca'),
      numberedRef('Canadian Poultry Magazine. aMPV\'s shifting landscape. Simcoe, ON: Annex Business Media; 2026 Jan 16 [cited 2026 Sep]. Available from: canadianpoultrymag.com'),
      numberedRef([
        { text: 'Dutil L, Irwin R, Finley R, Ng LK, Avery BP, Boerlin P, et al. Ceftiofur resistance in ' },
        { text: 'Salmonella enterica', italics: true },
        { text: ' serovar Heidelberg from chicken meat and humans, Canada. Emerg Infect Dis. 2010;16(1):48-54. doi:10.3201/eid1601.090729' },
      ]),
      numberedRef('Public Health Agency of Canada. Canadian Integrated Program for Antimicrobial Resistance Surveillance (CIPARS): annual report. Guelph, ON: PHAC; [cited 2026 Sep]. Available from: canada.ca'),
      numberedRef('Health Canada. Responsible use of medically important antimicrobials in animals. Ottawa: Health Canada; [cited 2026 Sep]. Available from: canada.ca'),
      numberedRef('Chicken Farmers of Canada. Responsible Antimicrobial Use Strategy. Ottawa: Chicken Farmers of Canada; [cited 2026 Sep]. Available from: chickenfarmers.ca'),
      numberedRef('Canadian Global Food Animal Residue Avoidance Databank (CgFARAD). Request withdrawal information. Saskatoon, SK: University of Saskatchewan; [cited 2026 Sep]. Available from: cgfarad.ca'),
      numberedRef('Chicken Farmers of Canada. Necrotic enteritis and coccidiosis. Ottawa: Chicken Farmers of Canada; [cited 2026 Sep]. Available from: chickenfarmers.ca'),
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
      buildSection4(),
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
    { lvl: 1, text: 'Section 1: Staying Current on Poultry Hot Topics', page: 5 },
    { lvl: 2, text: '1.1 What Hot Topics Are and Why They Matter to Your Farm', page: 5 },
    { lvl: 2, text: '1.2 Where to Get Reliable, Current Information', page: 5 },
    { lvl: 1, text: 'Section 2: Avian Influenza', page: 6 },
    { lvl: 2, text: '2.1 What Avian Influenza Is and Where It Stands Today', page: 6 },
    { lvl: 2, text: '2.2 How It Spreads and Gets Onto Farms', page: 8 },
    { lvl: 2, text: '2.3 Recognizing It and Your Legal Duty to Report', page: 9 },
    { lvl: 2, text: '2.4 The Outbreak Response and What Happens to Your Farm', page: 10 },
    { lvl: 2, text: '2.5 The Vaccination Question', page: 11 },
    { lvl: 2, text: '2.6 Surveillance and Protecting Your Flock', page: 12 },
    { lvl: 1, text: 'Section 3: Emerging and Re-Emerging Disease Issues', page: 13 },
    { lvl: 2, text: '3.1 What Emerging Means and What Drives It', page: 13 },
    { lvl: 2, text: '3.2 Diseases on the Radar in Canada', page: 13 },
    { lvl: 2, text: '3.3 Surveillance and Early Warning', page: 16 },
    { lvl: 2, text: '3.4 What Farmers Should Do', page: 17 },
    { lvl: 1, text: 'Section 4: Antimicrobial Resistance (AMR)', page: 18 },
    { lvl: 2, text: '4.1 What AMR Is and Why It Is a Hot Topic', page: 18 },
    { lvl: 2, text: '4.2 What Canada and the Poultry Industry Are Doing About It', page: 18 },
    { lvl: 2, text: '4.3 What It Means for Your Farm', page: 19 },
    { lvl: 1, text: 'Recommended Peer-Reviewed Journals', page: 20 },
    { lvl: 1, text: 'References', page: 21 },
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
