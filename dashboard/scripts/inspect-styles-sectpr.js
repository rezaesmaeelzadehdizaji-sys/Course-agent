const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_styles");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);

const stylesXml = fs.readFileSync(path.join(ex, "word", "styles.xml"), "utf-8");
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

// Extract CourseTitle, CoverSubtitle, CoverMeta, Disclaimer styles
const styleNames = ["CourseTitle", "CoverSubtitle", "CoverMeta", "Disclaimer", "Heading1", "TOC1", "TOC2"];
for (const name of styleNames) {
  const start = stylesXml.indexOf(`w:styleId="${name}"`);
  if (start === -1) { console.log(`\n=== ${name}: NOT FOUND ===`); continue; }
  const styleStart = stylesXml.lastIndexOf("<w:style", start);
  const styleEnd = stylesXml.indexOf("</w:style>", styleStart) + 10;
  const style = stylesXml.slice(styleStart, styleEnd);
  // Extract key properties
  const szMatch = style.match(/<w:sz w:val="(\d+)"/);
  const spaceAfterMatch = style.match(/<w:spacing[^>]*w:after="(\d+)"/);
  const spaceBeforeMatch = style.match(/<w:spacing[^>]*w:before="(\d+)"/);
  const lineMatch = style.match(/<w:spacing[^>]*w:line="(\d+)"/);
  const pbMatch = style.match(/w:pageBreakBefore/);
  console.log(`\n=== ${name} ===`);
  console.log(`  sz: ${szMatch ? szMatch[1] + ' (' + (parseInt(szMatch[1])/2) + 'pt)' : 'not set'}`);
  console.log(`  spacing before: ${spaceBeforeMatch ? spaceBeforeMatch[1] + ' twips (' + Math.round(parseInt(spaceBeforeMatch[1])/1440*100)/100 + '")'  : 'not set'}`);
  console.log(`  spacing after: ${spaceAfterMatch ? spaceAfterMatch[1] + ' twips' : 'not set'}`);
  console.log(`  line: ${lineMatch ? lineMatch[1] : 'not set'}`);
  console.log(`  pageBreakBefore: ${pbMatch ? 'YES' : 'no'}`);
}

// Check body-level sectPr (should be near end of document.xml)
const bodyEnd = docXml.lastIndexOf("</w:body>");
const sectPrStart = docXml.lastIndexOf("<w:sectPr", bodyEnd);
if (sectPrStart !== -1) {
  const sectPrEnd = docXml.indexOf("</w:sectPr>", sectPrStart) + 11;
  console.log("\n=== Body sectPr ===");
  console.log(docXml.slice(sectPrStart, sectPrEnd));
} else {
  console.log("\n=== Body sectPr: NOT FOUND ===");
}
