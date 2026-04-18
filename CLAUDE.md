# T-FLAWS Poultry Course Generator — Claude Code Guide

## Project Overview

A single-page web application that generates the first of 17 poultry training courses for Canadian commercial farmers as a downloadable Word document (.docx). This first course, **T-FLAWS – Assessment Management Tool**, serves as the structural and stylistic template for all subsequent courses.

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
    ├── references.js          — APA citations & bibliography entries
    └── doc-generator.js       — Builds the Document using docx library, returns Blob
```

## Tech Stack

- **docx v9.6.1** via `https://esm.sh/docx@9.6.1` — client-side .docx generation
- Pure ES modules (`type="module"`) — no build step, no Node.js server
- Download via `URL.createObjectURL` — no FileSaver.js dependency
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

- **Citation style:** APA throughout (in-text and bibliography)
- **Unverifiable claims:** Mark with `[NEEDS SOURCE]` in bold red — never fabricate citations
- **Tone:** Formal and precise for definitions/science; practical and direct for farm guidance
- **Audience:** Experienced Canadian commercial poultry farmers (not veterinary professionals)

### Authoritative Sources

Content must be drawn from: Merck Veterinary Manual, Poultry Science journal, CFIA, CVMA, NFACC Codes of Practice, Aviagen Ross 308 manuals, Cobb 500 manuals, Lohmann Management Guide, AVMA, MSD Animal Health, Zoetis, CEVA, HIPRA, Boehringer Ingelheim, Elanco Learning Center, Canadian Poultry Consultant Learning Centre.

### Local Reference Library

`D:\Course agent\Avian medicine sources\` contains 100+ poultry medicine and science PDFs. Always draw from these for factual content and citations. Key titles:

- *Diseases of Poultry, 14th Edition* — primary disease reference (prefer over 13th ed.)
- *Diseases of Poultry, 13th Edition*
- CEVA Handbook of Poultry Diseases (Vol 1 & 2)
- Elanco Broiler Disease Reference Guide
- *Clinical Avian Medicine* — Harrison & Ritchie
- *Avian Medicine: Principles and Application* — Harrison & Ritchie
- *Avian Medicine and Surgery* — Bob Doneley
- BSAVA Manual of Backyard Poultry Medicine and Surgery
- *Commercial Chicken Meat and Egg Production* — Donald D. Bell
- *Commercial Poultry Nutrition*
- *Broiler Breeder Production*
- *Poultry Signals — A Practical Guide for Poultry Farming*
- *Avian Influenza Virus* — Erica Spackman
- *Avian Influenza and Newcastle Disease* — Ilaria Capua
- *Poultry Coccidiosis* — Donal P. Conway
- *Controlling Salmonella in Poultry* — Scott M. Russel
- *Storey's Guide to Raising Turkeys*
- *POULTRY PRODUCTION IN HOT CLIMATES* — Nuhad J. Daghir
- Intervet — Important Poultry Diseases
- FAO-CEVA Poultry Disease Diagnosis Picture Book
- *Handbook of Poultry Science and Technology*
- *Common Poultry Diseases and Their Prevention* — Tablante, 2013

When citing these, use the book title and author as the APA citation — not the file path.

## Word Document Structure

Every course document must follow this structure:
1. Cover page (title, subtitle, date)
2. Table of Contents (requires "Update Field" in Word after opening)
3. Introduction
4. Main content sections with Heading 1 / Heading 2 hierarchy
5. Image placeholders — gray bordered table cell + caption (no actual images embedded)
6. Recommended peer-reviewed journals
7. References/bibliography (APA hanging indent)

## Template Architecture

This project is designed so the remaining 16 courses reuse the same structure. To create a new course:
- Copy `course-content.js` → rename and replace content
- Copy `references.js` → rename and replace citations
- `doc-generator.js`, `app.js`, `styles.css`, and `index.html` remain unchanged

## Known Constraints

- TOC is a Word field — it appears blank until the user right-clicks and selects **Update Field**
- ES module imports are blocked on `file://` — always test via a local HTTP server
- Image placeholders use a single-cell gray table — no actual images are embedded in the .docx
