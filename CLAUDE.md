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

- **Tone:** Formal and precise for definitions/science; practical and direct for farm guidance
- **Audience:** Experienced Canadian commercial poultry farmers (not veterinary professionals)
- **Unverifiable claims:** Mark with `[NEEDS SOURCE]` in bold red, never fabricate

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
1. Cover page (title, subtitle, date)
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

Tier 1, Scientific textbooks & journals  
Tier 2, Industry manuals & official orgs  
Tier 3, Supplementary online  

### Validation Rules

- Cross-check all claims
- Prefer updated sources
- Never fabricate references
- Mark unknown as **[NEEDS SOURCE]**

## Final File Publishing Rule

When the user says:

"This is the final file of course X"

(where X = course number, e.g., 3, 7, 10, etc.)

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

- Do NOT manually upload to Vercel  
- Deployment must happen via GitHub push  
- Confirm that Vercel auto-deploy will update the site  

### Safety Rule

- Only replace files when explicitly marked as FINAL  
- Do not overwrite previous versions without confirmation

## Known Constraints

- TOC is a Word field, it appears blank until the user right-clicks and selects **Update Field**
- ES module imports are blocked on `file://`, always test via a local HTTP server
- Image placeholders use a single-cell gray table, no actual images are embedded in the .docx

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
