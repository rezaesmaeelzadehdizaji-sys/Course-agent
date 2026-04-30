# CPC Short Courses — Claude Code Guide

## Project Overview

**CPC Short Courses** is a poultry education project designed to generate 17 short training courses for Canadian commercial poultry farmers as downloadable Word documents (.docx).

The project currently includes two completed reference courses:

- Course 3: **T-FLAWS – Assessment Management Tool**  
  Path: D:\Course agent\Course 3\T-FLAWS_Assessment_Management_Tool.docx

- Course 7: **Common Poultry Diseases — Practical Training for Farmers**  
  Path: D:\Course agent\Course 7\7-Common Poultry Diseases — Practical Training for Farmers.docx

These two completed courses define the structural, stylistic, and instructional standard for all remaining courses.

Each new course may follow its own topic-specific outline, but must remain consistent in:
- Structure
- Tone
- Section hierarchy
- Citation style
- Farmer-oriented clarity

## Project Naming

- Overall project name: **CPC Short Courses**
- Total courses: **17 short courses**
- Reference courses:
  - Course 3: **T-FLAWS – Assessment Management Tool**
  - Course 7: **Common Poultry Diseases — Practical Training for Farmers**

## File Structure

```
d:\Course agent\
├── CLAUDE.md                  — This file
├── index.html                 — Landing page with download button
├── css/
│   └── styles.css             — Web app styling
└── js/
    ├── app.js                 — Button handler, loading state, download trigger
    ├── course-content.js      — All course text as structured data objects
    ├── references.js          — Numbered citations & bibliography entries
    └── doc-generator.js       — Builds the Document using docx library, returns Blob
```

## Tech Stack

- **docx v9.6.1** via `https://esm.sh/docx@9.6.1` , client-side .docx generation
- Pure ES modules (`type="module"`) , no build step, no Node.js server
- Download via `URL.createObjectURL` , no FileSaver.js dependency
- **Local HTTP server required** for development (ES modules block on `file://`)

### Running Locally

```bash
# Option 1
npx serve .

# Option 2 (Python)
python -m http.server 8080

# Then open: http://localhost:8080
```

## Content Standards

- **Tone:** Scientifically accurate but always expressed in a practical, farmer-flow style
- **Audience:** Experienced Canadian commercial poultry farmers (not veterinary professionals)
- **Unverifiable claims:** Mark with `[NEEDS SOURCE]` in bold red, never fabricate

## Default Writing Mode (MANDATORY)

All content must be written in **Farmer-Flow Writing Mode by default**.

This does NOT require user prompting.

### Priority Rule

This mode overrides:
- Content Standards
- Any unspecified tone instructions

Unless explicitly overridden by the user

### Definition

Write as:
"An experienced poultry veterinarian or consultant explaining real farm situations to a farm manager."

### Rules

- Use practical, real-world explanations
- Avoid academic tone unless explicitly required
- Use natural sentence flow
- Focus on what farmers see, manage, and decide

### Forbidden Style

- Textbook definitions without context
- Overly formal or robotic language
- Repetitive sentence structures
- Generic AI-like phrasing

### Punctuation Style Rule

Use em dashes (—) sparingly.

Do not rely on em dashes, semicolons, or overly polished punctuation patterns to create emphasis.

Prefer clear, direct farmer-flow sentences using periods or simple commas.

If a paragraph contains multiple em dashes, semicolons, or polished punctuation patterns that make the text feel AI-generated, rewrite it into simpler, more natural sentences.

### Rewrite Rule

If text sounds:
- AI-generated
- too formal
- not practical

→ Rewrite automatically before final output

## Citation and Reference Standard

- Citation style: **Numbered (Vancouver-style)**

### In-text Citations
- Use sequential numbers in square brackets:
  Example: Avian influenza can spread rapidly in commercial flocks [1].
- Multiple citations: [1,2] or [1–3]
- Reuse the same number for repeated references

### Reference List
- List references in order of appearance
- Do not alphabetize

### Rules
- Never fabricate references
- Every number must correspond to a real source
- If not verifiable → mark as **[NEEDS SOURCE]**
- Do not cite file paths; cite real sources (author, title, year)

### Authoritative Sources

Content must be drawn from: Merck Veterinary Manual, Poultry Science journal, CFIA, CVMA, NFACC Codes of Practice, Aviagen Ross 308 manuals, Cobb 500 manuals, Lohmann Management Guide, AVMA, MSD Animal Health, Zoetis, CEVA, HIPRA, Boehringer Ingelheim, Elanco Learning Center, Canadian Poultry Consultant Learning Centre.

### Local Reference Library

`D:\Course agent\Avian medicine sources\` contains 100+ poultry medicine and science PDFs. Always draw from these for factual content and citations. Key titles:

- *Diseases of Poultry, 14th Edition*, primary disease reference (prefer over 13th ed.)
- *Diseases of Poultry, 13th Edition*
- CEVA Handbook of Poultry Diseases (Vol 1 & 2)
- Elanco Broiler Disease Reference Guide
- *Clinical Avian Medicine*, Harrison & Ritchie
- *Avian Medicine: Principles and Application*, Harrison & Ritchie
- *Avian Medicine and Surgery*, Bob Doneley
- BSAVA Manual of Backyard Poultry Medicine and Surgery
- *Commercial Chicken Meat and Egg Production*, Donald D. Bell
- *Commercial Poultry Nutrition*
- *Broiler Breeder Production*
- *Poultry Signals, A Practical Guide for Poultry Farming*
- *Avian Influenza Virus*, Erica Spackman
- *Avian Influenza and Newcastle Disease*, Ilaria Capua
- *Poultry Coccidiosis*, Donal P. Conway
- *Controlling Salmonella in Poultry*, Scott M. Russel
- *Storey's Guide to Raising Turkeys*
- *POULTRY PRODUCTION IN HOT CLIMATES*, Nuhad J. Daghir
- Intervet, Important Poultry Diseases
- FAO-CEVA Poultry Disease Diagnosis Picture Book
- *Handbook of Poultry Science and Technology*
- *Common Poultry Diseases and Their Prevention*, Tablante, 2013

When citing these, use the book title and author as the citation source, not the file path.

## Word Document Structure

Every course document must follow this structure:
1. Cover page (MANDATORY FORMAT)

- Must include CPC branding
- Must include CPC logo (or placeholder if embedding not possible)

- Must include:
  - Course title
  - Subtitle (if applicable)
  - CPC Short Courses
  - Date

- Must look like a professional industry training document (NOT generic AI output)

2. Table of Contents (requires "Update Field" in Word after opening)
3. Introduction
4. Main content sections with Heading 1 / Heading 2 hierarchy
5. Image placeholders, gray bordered table cell + caption (no actual images embedded)
6. Recommended peer-reviewed journals
7. References/bibliography (numbered, in order of appearance)

## Template Architecture

All courses must follow a consistent structure based on two reference courses:

- Course 3 (T-FLAWS)
- Course 7 (Common Poultry Diseases)

### Core Structure (Mandatory)

1. Cover page  
2. Table of Contents  
3. Introduction  
4. Main sections (Heading hierarchy)  
5. Practical farmer-focused explanations  
6. Image placeholders  
7. Recommended journals  
8. References (Numbered style)

### Flexible Layer

- Course-specific outline
- Topic-specific sections
- Disease or management variations

### Consistency Rules

- Maintain similar structure across all 17 courses
- Keep tone practical and farmer-oriented
- Keep scientific accuracy
- Keep formatting consistent

## Production-Grade Course Generation Workflow

Before generating any course:

1. Parse both reference files:
   - Course 3 docx
   - Course 7 docx

2. Extract:
   - Structure
   - Headings
   - Tone
   - Depth of explanation
   - Formatting patterns

3. Compare with new course outline

4. Generate content aligned with:
   - Outline
   - Reference structure
   - CPC standards

5. Perform auto-alignment check:
   - Structure consistency
   - Tone consistency
   - Proper citation format
   - Missing references marked

6. Evaluate using Farmer-Flow Style Scoring System
7. Rewrite if needed before finalizing

## Agent Behavior & Validation Protocol

### Core Principle

Prioritize:
- Accuracy
- Practical usability
- Consistency across courses

### Reference Alignment Rule

Always align output with:
- Course 3
- Course 7

### Source Priority

Tier 1 — Scientific textbooks & peer-reviewed journals  
Tier 2 — Industry manuals, official organizations, and current field guidance  
Tier 3 — Supplementary online sources    

### Validation Rules

- Cross-check all claims
- Prefer updated sources
- Never fabricate references
- Mark unknown as **[NEEDS SOURCE]**

## Farmer-Flow Style Scoring System

Before finalizing any content, score from 1–5:

1. Practical farm relevance
2. Humanized flow
3. Farmer clarity
4. Field-vet voice
5. Sentence rhythm
6. Action-oriented value

## Mandatory Humanization Pass

After generating or revising any course content, the agent must perform a separate humanization pass.

This pass is mandatory and must happen after the scientific/content pass.

### Humanization Pass Requirements

The agent must:

1. Review each section for AI-like wording.
2. Identify sentences that sound too polished, generic, academic, or report-like.
3. Rewrite those sentences into farmer-flow language.
4. Keep the scientific meaning and numbered references intact.
5. Re-score the rewritten section using the Farmer-Flow Style Scoring System.

The course cannot be considered ready unless this separate humanization pass has been completed.

### Minimum passing:
- Total ≥ 24/30
- No score below 4

### If failed:
→ Rewrite automatically

### Final check:
- Does it sound like a real poultry consultant?
- Is it practical for farm use?
- Does it feel AI-generated?

If yes → rewrite

### Rewrite Method (MANDATORY)

When rewriting:

- Convert abstract explanations into practical farm observations
- Replace definitions with "what farmers actually see"
- Use cause → signs → impact → action flow
- Shorten long sentences
- Remove academic phrasing

Do NOT:
- change scientific meaning
- remove references

## Final File Publishing Rule

When the user says:

"This is the final file of course X"

(where X = course number, e.g., 3, 7, 10, etc.)

### Final Validation Before Publishing

Before pushing final file:

- Must pass Style Scoring System
- Must follow CPC cover page rules
- Must match reference course structure

### Actions Required

1. Identify the course number and name  
2. Replace the previous version of that course file  
3. Save the new final `.docx` in the correct course folder  

### GitHub Update

If GitHub is connected:

- Stage the updated file  
- Commit with message:
  "Final version - Course X updated"
- Push to repository  

If not connected:
- Tell the user what to upload manually  

### Vercel Deployment

The user-facing dashboard is a **separate Vercel project** at `cpc-short-courses-series-dashboard.vercel.app`, deployed from the [dashboard/](dashboard/) subdirectory. It is NOT the same as the static landing page in [index.html](index.html).

**Critical:** the dashboard does NOT read course files from `Course X/` at runtime. It serves pre-built `.docx` files bundled into the Next.js Lambda from [dashboard/public/docs/](dashboard/public/docs/) (see the static-path shortcut in [dashboard/src/app/api/courses/[courseId]/generate-docx/route.ts](dashboard/src/app/api/courses/%5BcourseId%5D/generate-docx/route.ts) ~line 52). Updating only `Course X/T-FLAWS_*.docx` will leave the dashboard serving the stale build.

**Slug mapping** (filename Vercel serves at `/docs/<slug>.docx`):
- Course 3 → `t-flaws-assessment-management-tool.docx`
- Course 4 → `course-04-salmonella-food-safety.docx`
- Course 7 → `course-07-common-poultry-diseases.docx`

**Vercel auto-deploy stalls silently.** Pushing to `main` does NOT reliably trigger a new deploy on this project — observed multiple times, sometimes the most recent production build is days old while `main` has new commits. Do not assume `git push` is enough.

**Quick-deploy procedure (run after every Course X publish):**

1. Update both copies of the final file:
   ```bash
   cp "Course 3/T-FLAWS_Assessment_Management_Tool.docx" "dashboard/public/docs/t-flaws-assessment-management-tool.docx"
   ```
2. Commit and push the dashboard copy alongside the course file.
3. **Force a Vercel production deploy from the dashboard directory:**
   ```bash
   cd dashboard && vercel deploy --prod --yes
   ```
   (Vercel CLI is already installed at `C:\Users\rezae\AppData\Roaming\npm\vercel.cmd` and project link is configured.)
4. Verify the live site is serving the new file by comparing `Content-Length` to the on-disk size:
   ```bash
   curl -sI "https://cpc-short-courses-series-dashboard.vercel.app/docs/<slug>.docx?cb=$(date +%s)" | grep -i content-length
   ```
   The number must match `ls -la dashboard/public/docs/<slug>.docx`. A stale `Content-Length` means the deploy did not pick up the new file — re-run step 3.

**LFS note:** all `.docx`/`.pdf`/`.png`/`.jpg` files are tracked by Git LFS (see [.gitattributes](.gitattributes)). Vercel does fetch LFS objects during build, so this is not the cause of the stall — the cause is the GitHub→Vercel webhook itself, which is why a manual `vercel deploy --prod` is required.

### Safety Rule

- Only replace files when explicitly marked as FINAL  
- Do not overwrite previous versions without confirmation

## Known Constraints

- TOC is a Word field, it appears blank until the user right-clicks and selects **Update Field**
- ES module imports are blocked on `file://`, always test via a local HTTP server
- Image placeholders use a single-cell gray table, no actual images are embedded in the .docx

## "This document contains fields that may refer to other files" Dialog (CONFIRMED FIX)

**This is the Word dialog that appears every time a generated .docx is opened.** It is triggered by Word's client-side setting `File → Options → Advanced → General → Update automatic links at open`, which fires for **any** live field in the document (TOC, PAGE, NUMPAGES, hyperlinks). Trusted Locations and File-Properties → Unblock **do not suppress this dialog**, which is a separate setting from macro/active-content trust.

**Do not iterate. Do not strip fields one by one. Use this exact procedure on first build:**

### Step 1 — Build the document with a real TOC and live page numbers
- Use `TableOfContents` from the docx library for the TOC.
- Use `PageNumber.CURRENT` / `PageNumber.TOTAL_PAGES` for page numbers in headers/footers.
- Do **not** replace TOC or page numbers with static text. The dialog will reappear later for an unrelated reason and the user loses real page numbers in exchange for nothing.

### Step 2 — Post-build patch (mandatory) inside the same generator script
After `Packer.toBuffer(doc)` and before final write:

1. **Strip `w:dirty="true"` from every `<w:fldChar>` in the document.** The docx library emits `<w:fldChar w:fldCharType="begin" w:dirty="true"/>` on the TOC field. The `dirty` flag tells Word the field needs to be updated, which re-fires the "fields may refer to other files" dialog **even with cached entries and `updateFields=false`**. Run `xml.replace(/\sw:dirty="true"/g, '')` over the whole document.xml.
2. **Inject pre-cached TOC entries** into the empty `<w:sdtContent>` the docx library produced. Build one `<w:p>` per heading entry with:
   - `<w:pStyle w:val="TOC1"/>` or `TOC2`
   - `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>`
   - The heading text run, a `<w:r><w:tab/></w:r>`, then the page number run.
   - Insert them between `<w:fldChar w:fldCharType="separate"/>` and `<w:fldChar w:fldCharType="end"/>`.
3. **Set `<w:updateFields w:val="false"/>` in `word/settings.xml`** (NOT `true`). With dirty stripped and entries cached, you want Word to leave the field alone. `true` would re-trigger the update dialog.
4. **Add `TOC1` and `TOC2` styles to `word/styles.xml`** if missing (right tab leader, indent for TOC2). Without these, Word renders the cached rows without dot leaders.

### Step 3 — Tell the user the one-time save trick
The first time the file opens, Word still shows the dialog because the fields are flagged dirty. Tell the user:
> "Click **Yes** once, then press **Ctrl+S** to save. The dialog will not appear on subsequent opens because the field values are now cached in the saved layout."

If the user wants to disable the dialog globally for all documents: `File → Options → Advanced → General → uncheck "Update automatic links at open"`.

### What does NOT work (do not waste time on these)
- ❌ Removing the `\h` hyperlink switch from the TOC field — does not stop the dialog.
- ❌ Replacing the live TOC with bullet text — kills the real TOC and the dialog still fires from PAGE/NUMPAGES in footers.
- ❌ Replacing PAGE/NUMPAGES with static text — kills page numbering and the dialog can still fire from any other field; loses functionality for nothing.
- ❌ Adding the folder to Trusted Locations — controls a different security category.
- ❌ File Properties → Unblock — controls Mark-of-the-Web, not the field-update prompt.
- ❌ Setting `<w:updateFields w:val="true"/>` while leaving `w:dirty="true"` on the field — Word still treats the field as dirty and re-fires the dialog. The two fixes go together: strip dirty AND set updateFields=false.

### Reference implementation
See [generate-course3-revised.mjs](generate-course3-revised.mjs) — the post-build patch block at the bottom of the file is the canonical pattern. Copy it for any new course generator.

### Drop-in code (paste verbatim after `Packer.toBuffer(doc)`)

```js
import JSZip from './node_modules/jszip/dist/jszip.js';

// Write initial buffer first
fs.writeFileSync(OUT_FILE, await Packer.toBuffer(doc));

// ---- POST-BUILD PATCH: kill the "fields may refer to other files" dialog ----
const outZip = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));

// 1. Build cached TOC rows. tocEntries = [{ lvl: 1|2, text, page }]
function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function tocRow(e) {
  const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
  const indent    = e.lvl === 1 ? 0 : 220;
  const text      = escapeXml(e.text);
  return (
    '<w:p>' +
      '<w:pPr>' +
        `<w:pStyle w:val="${styleName}"/>` +
        '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>' +
        '<w:spacing w:after="60"/>' +
        (indent ? `<w:ind w:left="${indent}"/>` : '') +
      '</w:pPr>' +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>` +
      '<w:r><w:tab/></w:r>' +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="22"/></w:rPr><w:t>${e.page}</w:t></w:r>` +
    '</w:p>'
  );
}
const cachedRows = tocEntries.map(tocRow).join('');

// 2. Patch document.xml: strip ALL w:dirty flags + inject cached rows into the SDT
let docXml = await outZip.file('word/document.xml').async('string');
const sdtMatch = docXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
if (sdtMatch) {
  let sdt = sdtMatch[0];
  sdt = sdt.replace(/\sw:dirty="true"/g, '');                  // CRITICAL
  sdt = sdt.replace(
    /<w:fldChar w:fldCharType="separate"\/><\/w:r><\/w:p>/,
    `<w:fldChar w:fldCharType="separate"/></w:r></w:p>${cachedRows}`
  );
  docXml = docXml.replace(sdtMatch[0], sdt);
  docXml = docXml.replace(/\sw:dirty="true"/g, '');             // belt-and-braces
  outZip.file('word/document.xml', docXml);
}

// 3. Patch settings.xml: updateFields=false (NOT true)
let settings = await outZip.file('word/settings.xml').async('string');
settings = settings.replace(/<w:updateFields[^/]*\/>/g, '');
settings = settings.replace(
  '<w:displayBackgroundShape/>',
  '<w:displayBackgroundShape/><w:updateFields w:val="false"/>'
);
outZip.file('word/settings.xml', settings);

// 4. Add TOC1 / TOC2 styles to styles.xml if missing
let stylesXml = await outZip.file('word/styles.xml').async('string');
if (!/w:styleId="TOC1"/.test(stylesXml)) {
  const tocStyles =
    '<w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs><w:spacing w:after="60"/><w:ind w:left="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>';
  stylesXml = stylesXml.replace('</w:styles>', tocStyles + '</w:styles>');
  outZip.file('word/styles.xml', stylesXml);
}

// 5. Sanity check: must be 0 dirty flags remaining
const dirtyLeft = (docXml.match(/w:dirty=/g) || []).length;
if (dirtyLeft > 0) throw new Error(`Still ${dirtyLeft} w:dirty flags in document.xml — dialog will appear`);

// 6. Write final patched docx
const patched = await outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT_FILE, patched);
```

### Verification (run after build to confirm)
```bash
node -e "
const JSZip = require('jszip'); const fs = require('fs');
(async () => {
  const z = await JSZip.loadAsync(fs.readFileSync(OUT_FILE));
  const xml = await z.file('word/document.xml').async('string');
  const settings = await z.file('word/settings.xml').async('string');
  console.log('w:dirty count (must be 0):', (xml.match(/w:dirty=/g)||[]).length);
  console.log('updateFields:', (settings.match(/<w:updateFields[^/]*\\/>/g)||[]));
  console.log('SDT cached rows:', (xml.match(/<w:pStyle w:val=\"TOC[12]\"/g)||[]).length);
})();
"
```

If `w:dirty count` is anything other than 0, the dialog will fire. That is the single most important number to verify.

---

## Clickable TOC Entries (Ctrl+click jumps to heading)

By default the cached TOC rows produced by the recipe above are **plain text** — they look right but Ctrl+click does nothing. Word's native TOC (and Course 7's hand-built file) makes each row clickable by:
1. Wrapping the row's text/tab/page-number runs in `<w:hyperlink w:anchor="_TocXXXX" w:history="1">…</w:hyperlink>`.
2. Placing matching `<w:bookmarkStart w:id="N" w:name="_TocXXXX"/>` / `<w:bookmarkEnd w:id="N"/>` around the corresponding heading paragraph.

Apply this to every new course generator. The pattern that worked for Course 3 and Course 4:

### Step 1 — give every TOC entry a unique anchor

Convert the flat `tocEntries` array into objects with an `anchor` field. The anchor name must be unique per entry; `_Toc<8-digit zero-padded>` matches Word's convention well enough that Word treats them as native:

```js
const entriesWithAnchor = tocEntries.map((e, i) => ({
  ...e,
  anchor: `_Toc${String(100000 + i).padStart(8, '0')}`,
}));
```

### Step 2 — wrap each cached row in a hyperlink

```js
function tocRow(e) {
  const styleName = e.lvl === 1 ? 'TOC1' : 'TOC2';
  const indent    = e.lvl === 1 ? 0 : 220;
  const titleSize = 22;
  const text      = escapeXml(e.text);
  return (
    '<w:p><w:pPr>' +
      `<w:pStyle w:val="${styleName}"/>` +
      '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>' +
      '<w:spacing w:after="60"/>' +
      (indent ? `<w:ind w:left="${indent}"/>` : '') +
    '</w:pPr>' +
    `<w:hyperlink w:anchor="${e.anchor}" w:history="1">` +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="${titleSize}"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>` +
      '<w:r><w:tab/></w:r>' +
      `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="3C3C3C"/><w:sz w:val="${titleSize}"/></w:rPr><w:t>${e.page}</w:t></w:r>` +
    '</w:hyperlink></w:p>'
  );
}
const cachedRows = entriesWithAnchor.map(tocRow).join('');
```

### Step 3 — inject bookmarks around the matching heading paragraphs

Run this **after** the cached rows have been injected and **after** `w:dirty` has been stripped. It walks every Heading1/Heading2 paragraph in document order, matches each one against the next unconsumed entry by level + text, and wraps it with bookmark tags carrying the entry's anchor name. Headings that don't match (e.g. the "Table of Contents" h1) are skipped without consuming an entry.

```js
let entryIdx = 0;
let bookmarkId = 1000;
const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading([12])"\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
docXml = docXml.replace(headingRegex, (match, lvlStr) => {
  if (entryIdx >= entriesWithAnchor.length) return match;
  const lvl = Number(lvlStr);
  // Concatenate every <w:t>…</w:t> inside this paragraph to get the heading text
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
  console.warn(`TOC bookmark warning: matched ${entryIdx}/${entriesWithAnchor.length} entries. Unmatched: ${entriesWithAnchor.slice(entryIdx).map(e => `[H${e.lvl}] ${e.text}`).join(' | ')}`);
}
outZip.file('word/document.xml', docXml);
```

The `norm()` step is important when TOC text uses extra whitespace (e.g. Course 4 used `"1.1  What Is Salmonella?"` with two spaces between number and title — without normalization the literal string never matches the heading paragraph's single-spaced text and the bookmark is silently skipped).

### Verification

```bash
node -e "
const JSZip=require('jszip');const fs=require('fs');
(async()=>{
  const z=await JSZip.loadAsync(fs.readFileSync(OUT_FILE));
  const xml=await z.file('word/document.xml').async('string');
  console.log('bookmarkStart:',(xml.match(/<w:bookmarkStart/g)||[]).length);
  console.log('hyperlink:',(xml.match(/<w:hyperlink/g)||[]).length);
})();
"
```

Both numbers must equal the number of TOC entries. If the bookmark count is lower than the hyperlink count, some heading texts didn't match — read the warning, fix the entry text or whitespace, regenerate.

To test end-to-end: convert to PDF with LibreOffice and grep for link annotations:
```bash
"/c/Program Files/LibreOffice/program/soffice.exe" --headless --convert-to pdf --outdir /tmp <out.docx>
node -e "const fs=require('fs');console.log('PDF link count:',(fs.readFileSync('/tmp/<out>.pdf').toString('binary').match(/\/Subtype\s*\/Link/g)||[]).length)"
```
This count should equal the TOC entry count. In Word, Ctrl+click any TOC row should jump to the heading.

### Pitfall — never use `.docx` as both source and output

The Course 3 generator extracted images from a `SRC_FILE` that pointed at the published final docx. After "Final Publishing" copied the draft over the final, the next regeneration extracted images from itself (which had different image filenames) and silently dropped most photos. Two safeguards:
- Keep a separate `_source_images.docx` (or similarly named) as the image-extraction source. Never use the published file as the source.
- After any final-publish copy, run the generator once and check `Object.keys(zip.files).filter(f=>f.startsWith('word/media/')).length` is still in the expected range.

If the source has already been clobbered, the original is recoverable from Git LFS history:
```bash
git show <pre-publish-commit>:"<path/to/source.docx>" | git lfs smudge > recovered.docx
```

---

## Editing .docx Files Directly (Node.js)

When patching an existing `.docx` via Node.js (e.g. to apply text corrections), follow this exact recipe. Any deviation has caused "Word experienced an error trying to open the file."

```js
const JSZip = require('jszip');
const fs    = require('fs');

async function patchDocx(srcPath, outPath, fixes) {
  const zip = await JSZip.loadAsync(fs.readFileSync(srcPath));
  let xml = await zip.file('word/document.xml').async('string');

  // Apply fixes, every replacement string must use &amp; not bare &
  fixes.forEach(([find, replace]) => {
    if (xml.includes(find)) xml = xml.split(find).join(replace);
  });

  // MANDATORY, abort if any unescaped & slipped through
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found), Word will reject`);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(outPath, buf);
}
```

**Rules that must never be broken:**

1. **Use `jszip`, never `adm-zip`**, adm-zip produces zip files Word silently rejects.
2. **Escape every `&` as `&amp;`** in replacement text. Author lists (`Widowski, T., & Harlander-Matauschek`) and inline text with ampersands will break Word if left as bare `&`. mammoth and xmldom tolerate unescaped `&`; Word does not.
3. **Only replace text inside `<w:t>…</w:t>` runs**, never edit `<w:r>`, `<w:p>`, `<w:proofErr>`, or any structural XML tags.
4. **Delete stale lock files** (`~$filename.docx`) before asking the user to reopen.
5. **Verify with mammoth** after writing (`mammoth.extractRawText`), 0 messages is required but not sufficient; Word is the final authority.
6. **Always start from the original LFS object** for any patch session, never chain patches on a previously patched file.
