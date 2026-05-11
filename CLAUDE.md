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

## MANDATORY RULE — NEEDS SOURCE (NON-NEGOTIABLE)

**If you cannot verify a claim, definition, statistic, acronym expansion, or any factual statement from the local reference library, an authoritative source, or a web search — you MUST write `[NEEDS SOURCE]` in bold red. No exceptions.**

This rule applies to:
- Every factual claim, threshold, dosage, percentage, or statistic
- Every acronym expansion (e.g., what an abbreviation stands for)
- Every definition of a proprietary tool, protocol, or method
- Every claim attributed to a specific organization or person
- CPC-specific content, tools, or terminology that only the CPC team can confirm

**NEVER:**
- Guess, infer, or derive an acronym expansion without a written source
- Fill in details to make text sound complete
- Assume a definition is correct because it fits the acronym letters
- Write anything that sounds factual without a verifiable source behind it

### Deep Research Mode (MANDATORY FOR ALL COURSES)

**Every course must go through Deep Research Mode before any content is drafted. This is not optional.**

#### Installed Research Skills (use these — do not skip)

Three research skills are installed and symlinked to Claude Code in `.agents/skills/`:

| Skill | Trigger | Best for |
|---|---|---|
| `/deep-research` | Multi-source research, citation tracking, structured report | Full course topic research — run in **deep** mode for each major section, **ultradeep** for critical management claims |
| `/academic-researcher` | Peer-reviewed paper analysis, Vancouver citation formatting, methodology critique | Verifying specific thresholds and statistics against scientific literature |
| `/deep-research-agent` | Systematic literature review across PubMed, Google Scholar, industry databases | When a topic needs exhaustive academic coverage (disease mechanisms, regulatory standards) |

#### What Deep Research Mode Means

Before writing a single section of any course, run the following pipeline in order:

**Step 1 — Local library scan**
Search `D:\Course agent\Avian medicine sources\` for every major topic in the course outline. Identify which books and bulletins cover it and extract specific figures, thresholds, and recommendations.

**Step 2 — `/deep-research` (deep mode)**
Run `/deep-research` on every major section topic. Use **deep mode** (8 phases, 10-20 min) as the default for course content. Use **ultradeep mode** (8+ phases, 20-45 min) for any claim involving specific regulatory limits, management thresholds, or safety numbers. The skill:
- Retrieves from multiple sources simultaneously
- Triangulates conflicting evidence
- Tracks citations at the claim level
- Critiques and refines findings before reporting

**Step 3 — `/academic-researcher` for peer-reviewed verification**
After Step 2, run `/academic-researcher` on any claim citing a specific statistic, threshold, or study finding. This skill:
- Searches PubMed, Google Scholar, and JSTOR
- Evaluates methodology quality and sample size
- Flags studies with weak evidence (small N, single study, outdated)
- Formats citations in Vancouver style ready to paste into the reference list

**Step 4 — Cross-check every number**
Every specific figure (temperature range, ppm limit, kg/m² density, lux level, pH, flow rate, etc.) must be confirmed in at least two independent sources. If sources conflict, report both with citations and flag the discrepancy in the content.

**Step 5 — Document findings before writing**
Record all confirmed sources per topic. This is the research record the content is built from. Write nothing until this record exists.

**Step 6 — Mark gaps honestly**
Any claim that cannot be confirmed in at least two independent sources gets `[NEEDS SOURCE]` in the text. No exceptions. No educated guesses.

#### When to Run Deep Research Mode

- Before generating any new course document
- Before regenerating or significantly revising an existing course
- When updating a section with new content
- When a user asks to verify a specific claim in an existing course

#### Deep Research Mode for Course 3 (T-FLAWS)

Deep research was run in May 2026 and confirmed the following key figures. All are cross-checked against at least two sources:

| Checkpoint | Claim | Sources confirmed |
|---|---|---|
| T: Temperature | Day 0-2 broilers: 32-34°C at bird level | CONFIRMED — McGill University; Ross 2025 [1] |
| T: Temperature | Reduce ~0.5°C per 2-3 days as feathering develops | CONFIRMED — Ross 2025 [1] |
| T: Temperature | Bird-level vs ceiling sensor gap: 3-5°C possible | CONFIRMED — Ross 2025 [1] |
| A: Air | Ammonia >10 ppm begins suppressing immunity; effects clearer at 15-20 ppm | PARTIALLY CONFIRMED — PMC/NIH; some studies find minimal production impact below 20 ppm; immune changes confirmed at 15 ppm |
| A: Air | Ammonia >25 ppm causes documented eye damage (corneal/conjunctival); respiratory tissue damage more pronounced at 50+ ppm | CONFLICTING — eye damage well-confirmed [PubMed]; direct respiratory tissue damage at 25 ppm contested; "permanent" removed from course |
| A: Air | CO2 >3,000 ppm indicates inadequate minimum ventilation | CONFIRMED — SenseHub/MSD; Vostermans Ventilation; multiple sources |
| A: Air | Humidity 60-70% brooding; 50-60% from week 2 onward | CONFIRMED — Alabama Extension; Ralco Agriculture; course UPDATED with age-specific ranges |
| W: Water | Water:feed ratio ~1.7-1.8:1 at thermoneutral temperatures | CONFIRMED — Mississippi State University Extension (range 1.6-1.8:1) |
| W: Water | Ideal water temperature at nipple: 10-14°C | CONFIRMED — Aviagen Water Quality 2025 [2] |
| W: Water | pH target: 6.0-8.0 at the drinker | CONFIRMED — Aviagen Water Quality 2025 [2] |
| S: Sanitation | Litter moisture target: 20-25% (NOT "below 30%") | CONFIRMED — UGA Extension; Mississippi State; course CORRECTED from "below 30%" to "20-25%" |
| S: Space | NFACC conventional max: 31 kg/m² live weight | CONFIRMED — NFACC Code of Practice [4] (official documentation) |
| S: Space | NFACC enhanced welfare max: 38 kg/m² live weight | CONFIRMED — NFACC Code of Practice [4] |
| L: Light | First 7 days: minimum 20 lux, 23 hours/day | CONFIRMED — Aviagen technical bulletin; industry standard |
| L: Light | After week 1: minimum 6 hours dark period per 24h | CONFIRMED — Aviagen breeding guidelines; welfare research |

#### Full Qualitative Claim Verification (May 2026 — 42 claims checked)

Deep research was extended to all qualitative, causal, and management claims. 36 of 42 confirmed outright. 6 corrections applied:

| Claim | Original | Corrected | Source |
|---|---|---|---|
| 7-day weight as predictor | "one of the strongest predictors of final body weight" | "important early milestone; week-3+ measurements are more reliable predictors" | Poultry World; UF IFAS (R²=0.14-0.21 at week 1) |
| First 48h feeder checks | "check every 2-3 hours" | "check crop fill at 2h (75% target), 4h, 8h, 12h, 24h (100% target)" | EW Nutrition; Ross Handbook 2025 |
| Dark period and bone health | "associated with better bone mineralization" | "appropriate dark periods support welfare and rest; excessive darkness impairs bone mineralization" | Springer; ScienceDirect — research found excessive darkness reduces bone ash % |
| Water restriction timing | "feed intake falls within hours" | "feed intake drops rapidly (water:feed correlation 0.98)" — "within hours" lacks direct peer-reviewed citation | The Poultry Site; Aviagen |
| Wet patch spread rate | "doubles in size every few days" | "grows rapidly through moisture feedback loop" — doubling rate not directly cited in literature | Mississippi State; UGA Extension |
| System: water→feed link | "fall within hours" | "fall rapidly" — same timing caveat as above | Aviagen Water Utilization brief |

Remaining 36 claims all confirmed against PubMed, PMC, university extension, Aviagen, NFACC, and industry sources. No major scientific errors found in the course.

**The T-FLAWS incident (May 2026):** The AI fabricated the acronym expansion "Toes, Feathers, Legs, Activity, Weight, and Skin" and inserted it into the official Course 3 document without any source check. The correct T-FLAWS framework (confirmed by CPC — see below) is entirely different. The fabricated content was also structurally wrong: the entire course was built around the wrong topic. A web search would have found the real FLAWS framework immediately. When in doubt: write `[NEEDS SOURCE]`, stop, and ask.

---

## T-FLAWS Framework (CPC Learning Centre — CONFIRMED)

**T-FLAWS** is a practical barn-entry checklist for farmers, veterinarians, and technicians. It focuses on gold-standard management — NOT disease diagnostics.

- **FLAWS** is a standard management tool within the poultry industry (publicly documented).
- **T-FLAWS** is a specific adaptation introduced by the **CPC Learning Centre** (Mike and Dr. Stew).

### Correct T-FLAWS Acronym

| Letter | Stands for |
|--------|-----------|
| T | Temperature |
| F | Feed |
| L | Light |
| A | Air |
| W | Water |
| S | Sanitation & Space |

### Course 3 Development Notes

- CPC already possesses educational materials for this framework. Reza must coordinate with the CPC team to gather these before any major content revision.
- Present all content from a farmer's perspective — practical, accessible, not overly technical veterinary language.
- The current Course 3 draft content (built around the incorrect acronym) must be fully replaced once CPC materials are received.
- Do NOT rewrite course body sections until CPC source materials are in hand.

---

## Content Standards

- **Tone:** Scientifically accurate but always expressed in a practical, farmer-flow style
- **Audience:** Experienced Canadian commercial poultry farmers (not veterinary professionals)
- **Unverifiable claims:** Mark with `[NEEDS SOURCE]` in bold red — MANDATORY, never fabricate
- **Spelling:** **American English only.** Apply uniformly across all 17 courses, drafts, dashboard copy, and any generated docx output. Never mix British and American forms.

### American English Spelling Rules (MANDATORY)

Use these forms (and their inflections) consistently. This rule cannot be overridden by topic, source, or quoted material outside of direct verbatim citations.

- **-or, not -our:** color, behavior, favor, flavor, harbor, honor, labor, neighbor, vapor, odor, rumor, vigor.
- **-ize / -ization, not -ise / -isation:** organization, realize, recognize, analyze, hospitalization, colonization, optimize, minimize, maximize, prioritize, standardize, characterize, summarize, categorize, emphasize, utilize, immunize, sterilize, specialize, generalize, harmonize, stabilize, neutralize, visualize, criticize.
- **-er, not -re:** center, fiber, liter, meter, theater.
- **-ense, not -ence:** defense, offense, license (noun and verb), practice (noun and verb).
- **No -ae- / -oe- digraphs:** feces, fecal, edema, anemia, diarrhea, hemorrhage, hemoglobin, pediatric, esophagus.
- **Single-l in inflections:** traveling, traveled, labeling, labeled, modeling, modeled, signaling, canceled.
- **Other forms:** program (not programme), gray (not grey), mold (not mould), sulfur (not sulphur), aluminum (not aluminium), tire (not tyre), maneuver (not manoeuvre), judgment (not judgement), aging (not ageing).

### Pre-publish Spelling Sweep (MANDATORY)

Before reporting any course .docx as done (final or draft), run a sweep against the document.xml text and convert any British forms found. Use this Node.js sweep as a checkpoint:

```js
const checks = [/\b\w+isation\b/gi,/\b\w+ised\b/gi,/\b\w+ising\b/gi,/\b\w+ises\b/gi,/\bcolour/gi,/\bbehaviour/gi,/\bcentre/gi,/\bdefenc/gi,/\bneighbour/gi,/\bhospitalis/gi,/\bcolonis/gi,/\bgrey\b/gi,/\bmould/gi,/\bsulph/gi,/\bfaec/gi,/\boedem/gi,/\banaem/gi,/\bdiarrhoea/gi,/\bhaemo/gi,/\baluminium/gi,/\btyre/gi,/\bmanoeuvre/gi,/\bprogramme/gi];
// Run each against the joined <w:t> text. Any hit must be converted before publishing.
```

## CPC Learning Centre Materials Integration (MANDATORY)

These courses are produced by CPC. CPC Learning Centre materials must be actively incorporated into every course wherever they are relevant. This is not optional and does not require user prompting.

### Rule

Before writing any section, scan `D:\Course agent\Avian medicine sources\CPC learning centre\` for bulletins, disease profiles, and flock management guides that cover that section's topic. If relevant material exists, draw from it and cite it.

### What counts as CPC material

- Technical bulletins in `CPC learning centre\Technical Bulletins\`
- Disease profiles in `CPC learning centre\Broilers-Disease Profiles\`, `Layers-Disease Profiles\`, `Breeders-Disease Profiles\`, `Turkeys-Disease Profiles\`
- Flock management guides in any `Flock Management\` or `Flock management\` subfolder
- Any CPC-authored content found online at `cpclearningcentre.ca` or `canadianpoultry.ca`

### How to integrate

- Extract specific facts, figures, protocols, and recommendations directly from the CPC source — do not paraphrase from memory
- Apply the American English sweep to any CPC source text before incorporating (CPC sources sometimes use British forms)
- Strip any citation numbers from the source document that belong to its own reference list; replace with the correct citation number from the course being written
- Cite every CPC source in the course reference list using format: `Author (if named). Title [Technical Bulletin / Disease Profile / Flock Management Guide]. CPC Learning Centre; [year if stated] [cited 2026 Apr]. Available from: cpclearningcentre.ca`

### Depth of integration

Integrate CPC content in proportion to its relevance, not as a formality. When CPC has a dedicated bulletin on a topic (e.g., darkling beetles, drinking water management, probiotics, spotting disease early, hatching egg care), that bulletin should be the primary source for that topic and its specifics should appear in the course content. Do not reduce CPC content to a single generic sentence when a full bulletin is available.

### CPC Learning Centre Attribution in Body Text (MANDATORY)

**Never cite CPC Learning Centre materials with a number alone.** Every sentence that draws on a CPC source must name the CPC Learning Centre explicitly in the text.

**Format:** "The CPC Learning Centre [document title] [verb]..."

Examples:
- "The CPC Learning Centre Drinking Water Management guide recommends..."
- "The CPC Learning Centre Introduction to Probiotics guide explains..."
- "The CPC Learning Centre 'Spotting Disease Early' guide puts it well:"
- "...is the CPC Learning Centre standard for..."
- "The CPC Learning Centre recommends rotating insecticide classes..."

**Why:** CPC produces and owns these courses. Making the attribution explicit in the prose reinforces the CPC brand with every reader and makes clear that recommendations come from a recognized Canadian poultry authority, not from the document author. A citation number alone does not achieve this.

**How to apply:**
- The first sentence that introduces a CPC bulletin's content must name the bulletin and attribute it to the CPC Learning Centre
- Subsequent sentences in the same paragraph referencing the same bulletin do not need to repeat the attribution
- Do not shorten "CPC Learning Centre" to just "CPC" in attribution sentences

### Where CPC materials have already been used (reference for future courses)

| Course | CPC Source | Section |
|--------|-----------|---------|
| Course 3 | Drinking Water Management (Leslie M, 2011) | W: Water — biofilm purge protocol, nipple flow rate, well disinfection |
| Course 3 | Broiler Management | T: Temperature — temperature tables |
| Course 3 | CPC Lighting Program Guidelines for Broilers 2026 | L: Light — lux levels, dark period schedule |
| Course 4 | Darkling Beetles (Kehler L) | Section 2.4 — vector role, life cycle, insecticide rotation |
| Course 4 | Drinking Water Management (Leslie M, 2011) | Section 2.2, 3.2 — water quality standards, biofilm purge |
| Course 4 | An Introduction to Probiotics | Section 3.3 — CE mechanism, Nurmi/Rantala 1973, Bacillus stability |
| Course 4 | Spotting Disease Early | Section 6.3 — water before feed, five-sense walk, bird conformation |
| Course 4 | Hatching Egg Care | Section 5.3 — shell pore mechanism, sweating, collection frequency |

---

## CPC Shop Products (canadianpoultry.ca/shop)

CPC sells products directly relevant to poultry farm management. When writing a course section that covers a task or practice these products are used for, include the product by name with its photo and a one-line factual description. Do not include pricing, "buy now" language, or unsolicited promotion.

### Rule

Include a CPC shop product reference only when:
- The course section is actively discussing the task the product is used for (e.g., barn cleanout, biosecurity footwear, boot dips)
- The product name and function add practical value to the reader
- It does not turn the section into advertising

### Format

One sentence woven into the relevant bullet or paragraph that names the product and its function. Follow immediately with a product photo:
```
Photo X.Y: [Product Name]. [One-line description]. Source: canadianpoultry.ca/shop.
```

### Products available (May 2026)

| Product | Function | Relevant course topics |
|---|---|---|
| Elastic Top Boots | Dedicated barn footwear | Biosecurity, protective clothing |
| Chlorinated EVO Wash | Foaming chlorine wash for footwear/equipment | Boot dips, biosecurity entry, equipment sanitation |
| Proxy Clean | Heavy-duty organic matter remover | Barn cleanout (wash step before disinfection) |
| Virocid | Broad-spectrum disinfectant (bacteria/viruses/fungi) | Barn cleanout (disinfection step) |
| Enhanced Litter Treatment | Reduces bacterial load, ammonia, moisture | Pre-placement litter management |
| Amprolium 9.6% Solution | Anti-coccidial treatment | Coccidiosis-related courses |
| Panacur AquaSol | Fenbendazole dewormer | Parasite management courses |
| Biomin Sol | Probiotic for backyard birds | Backyard poultry courses only |

### Image embedding (technical)

Download product images to the course directory as `product_{name}.jpg`. Use the `productImage()` function pattern from the Course 4 generator:
- `productBuf(name)` loads the file
- `productImage(buf, caption, widthIn = 2.3)` renders at 2.3" (JPEG, portrait 3:4 ratio)
- Use `jpegDims()` for aspect ratio calculation
- Caption sourced to `canadianpoultry.ca/shop`

Image URLs: `https://canadianpoultry.ca/wp-content/uploads/2026/02/[Product-Name].jpg`

### Used to date

| Course | Product | Section |
|---|---|---|
| Course 4 | Elastic Top Boots | Section 4.2 — dedicated barn footwear |
| Course 4 | Chlorinated EVO Wash | Section 4.2 — boot dips |
| Course 4 | Proxy Clean | Section 4.3 — organic matter removal before disinfection |
| Course 4 | Virocid | Section 4.3 — broad-spectrum disinfection |
| Course 4 | Enhanced Litter Treatment | Section 4.3 — pre-placement litter management |

---

## Cross-References to Other CPC Short Courses (MANDATORY)

When writing any course in the series, you MUST include cross-references to other CPC Short Courses whenever a topic in the current course has been explained in more depth in another course and the reader would benefit from being directed there.

### Rule

If a topic is covered at summary level in the current course but covered in full detail in another course in this series, include a cross-reference sentence pointing the reader to that course.

### Format

One sentence, woven into the paragraph where the topic appears. Use this format:

> For more on [topic], see Course X ([Short Course Title]) in this series.

**Use parentheses around the course title, not em dashes.** The official course titles contain em dashes; wrapping in parentheses avoids inserting them into body prose.

### Placement rules

- Place the cross-reference sentence at the natural point in the paragraph where the gap arises, not at the end of a section as a generic footer
- Never create a standalone "For more information" section or callout box
- Maximum 2 to 3 cross-references per course — only where genuinely needed, not as a habit

### When a cross-reference is warranted

- The current course names a topic, tool, or framework that another course covers in full (e.g., Course 4 mentions daily litter monitoring → Course 3 covers T-FLAWS sanitation in detail)
- A disease or condition is mentioned as a risk factor and its full profile lives in another course (e.g., immunosuppressive diseases mentioned in Course 4 → Course 7 covers disease profiles)
- A management practice is referenced but not taught in the current course (e.g., brooding temperature is relevant but not the course topic)

### Cross-references used to date

| Course | Reference placed | Points to |
|--------|-----------------|-----------|
| Course 4, Section 4.3 | Daily litter/sanitation monitoring during flock | Course 3 (T-FLAWS Assessment Management Tool) |
| Course 4, Section 3.3 | Immunosuppressive disease profiles | Course 7 (Common Poultry Diseases) |
| Course 4, Section 2.4 | Biosecurity protocols for rodent/pest control | Course 2 (Biosecurity) |

Update this table as new cross-references are added in future courses.

---

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

### Punctuation Style Rule (STRICT — NO EM DASHES)

**Never use em dashes (—) or en dashes (–) in body prose.** This is the single most recurring AI-tell in generated content. Replace with periods, commas, colons, or rewritten sentences. Verify with `(xml.match(/—/g) || []).length === 0` before publishing every course.

The only allowed em/en dash usage is:
- Inside table cells for ranges like `Day 14–21`, `30–50 lux`, `32–34°C` (en dash, U+2013, for numeric ranges only)
- Inside table cells where `—` indicates "no data" / "not applicable"
- Never in body paragraphs, callouts, bullets, or labeled entries

Common temptations that must be rewritten:
- `X — Y` (parenthetical) → `X. Y.` or `X, Y.` or restructure
- `X — find the leak and fix it` → `X. Find the leak and fix it.`
- `Something is wrong — heat, short feed, poor air — and it needs fixing` → `Something is wrong: heat, short feed, poor air. It needs fixing.`

Also avoid heavy reliance on semicolons or overly polished punctuation patterns. Prefer plain periods and commas. Run the dash check on the final docx XML before reporting any course as done.

### Phrases to Avoid (AI-sounding patterns flagged in real CPC review)

Rewrite all of these on sight. They sound like a corporate report, not a vet talking to a farmer.

| Avoid | Use instead |
|---|---|
| "X indicates Y is creating bottlenecks" | "If you're seeing X, you have a Y problem" |
| "Birds unable to access resources without displacing others" | "Birds pushing each other off feeders" |
| "Investigate the root cause rather than just managing the symptom" | "Find what's driving it. Spreading them out is not a fix." |
| "develop piling behavior" | "start piling at night" |
| "Warm water reduces consumption" | "Birds back off warm water fast. Press a nipple and feel what comes out." |
| "Birds need true darkness to achieve a proper rest cycle" | "Birds settle quickly in true darkness. If they're still moving around, something is letting light in." |
| "X is recommended to draw chicks to the feed" | "Push that up to X right where you need chicks to find feed" |
| "A flock with a wide spread of bird sizes at seven or fourteen days often traces back to" | "High CV at seven or fourteen days almost always starts in" |
| "Auger failures, blocked joints, or bridged feed can leave entire sections without feed" | "A failed auger or blocked joint can starve a whole section while the bin reads full" |
| "Some pecking and bossing around is normal. Birds naturally sort out who is in charge, but it is a gradual process that plays out over several weeks" | "Some pecking-order sorting is normal and works itself out over time" |
| "compounds through the grow-out" | "gets wider every week through the grow-out" |
| "consistent with welfare research" / "associated with" / "exhibits" | rewrite as direct cause→effect |

The pattern: clinical jargon, passive voice, abstraction, and "X-then-explanation" structures all signal AI. Replace with **what the farmer sees → what to do**.

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
- **Never fabricate references — ever**
- Every number must correspond to a real, verifiable source
- If not verifiable → write **[NEEDS SOURCE]** and stop — do not guess
- Do not cite file paths; cite real sources (author, title, year)
- This applies to acronym expansions, definitions, and proprietary CPC content — if the CPC team has not confirmed it in writing, it gets **[NEEDS SOURCE]**

### Authoritative Sources

Content must be drawn from: Merck Veterinary Manual, Poultry Science journal, CFIA, CVMA, NFACC Codes of Practice, Aviagen Ross 308 manuals, Cobb 500 manuals, Lohmann Management Guide, AVMA, MSD Animal Health, Zoetis, CEVA, HIPRA, Boehringer Ingelheim, Elanco Learning Center, Canadian Poultry Consultant Learning Centre.

### Local Reference Library

`D:\Course agent\Avian medicine sources\` contains 100+ poultry medicine and science PDFs. Always draw from these for factual content and citations. Key titles:

**Disease & Clinical References**
- *Diseases of Poultry, 14th Edition*, primary disease reference (prefer over 13th ed.)
- *Diseases of Poultry, 13th Edition*
- CEVA Handbook of Poultry Diseases (Vol 1 & 2)
- Elanco Broiler Disease Reference Guide
- *Clinical Avian Medicine*, Harrison & Ritchie
- *Avian Medicine: Principles and Application*, Harrison & Ritchie
- *Avian Medicine and Surgery*, Bob Doneley
- BSAVA Manual of Backyard Poultry Medicine and Surgery
- Intervet, Important Poultry Diseases
- FAO-CEVA Poultry Disease Diagnosis Picture Book
- *Common Poultry Diseases and Their Prevention*, Tablante, 2013
- *Poultry Coccidiosis*, Donal P. Conway
- *Avian Influenza Virus*, Erica Spackman
- *Avian Influenza and Newcastle Disease*, Ilaria Capua
- Global Strategy for the Prevention and Control of HPAI (WHO/FAO)
- Lesion Age and Samples (post-mortem lesion aging reference)
- 8 Poultry Diseases with Liver Lesions

**Production & Management**
- *Commercial Chicken Meat and Egg Production*, Donald D. Bell
- *Commercial Poultry Nutrition*
- *Broiler Breeder Production*
- *Poultry Signals, A Practical Guide for Poultry Farming*
- *Storey's Guide to Raising Turkeys*
- *POULTRY PRODUCTION IN HOT CLIMATES*, Nuhad J. Daghir
- *Handbook of Poultry Science and Technology*
- Ross Broiler Management Handbook 2025 (Aviagen)
- Water Quality 2025 (Aviagen)
- Best Practices in Biosecurity (Aviagen/Ross)
- Pre-Brooding Management (industry guide)
- Broiler Chick Quality Manual (Parts I & II)
- The Ultimate Chick Comfort Guide
- First 24 Hours of Chicks
- Hatchery Solutions; Troubleshooting Your Hatchery
- From Broiler Processing: Preparing to Feed World Nutrition

**Food Safety & Biosecurity**
- *Controlling Salmonella in Poultry*, Scott M. Russel
- Biosecurity Guide for Commercial Poultry Production
- Rodent Control is a Key Factor in Poultry Biosecurity and Sustainability
- Controlling Insects in Poultry Production
- Biosec mLearning (biosecurity e-learning resource)
- Poultry Hygiene (industry guide)

**Nutrition**
- Amino Acids in Broiler Nutrition
- Antioxidants in Layer Feed
- Yace/Trace Minerals in Poultry Nutrition
- Solutions of the Fatty Liver Syndrome in Laying Hens
- Role of Organic Acids in Poultry Nutrition
- Selenium in Poultry Nutrition and Health (2018)
- Nutrition and Feeding of Organic Poultry (CABI, 2018)
- Moisture Retention for Higher Feed Mill Efficiency
- Feed Strategies Magazine (2025); Feed Strategy Magazine (2025)
- 2024 Innovad Global Feed Mycotoxin Survey
- Sampling Procedure for Mycotoxin Analysis (DSM)
- Alternative Protein Sources for Food and Feed

**Layer & Egg Production**
- Heat Stress in Laying Hens (Part II)
- Double-Yolk Eggs in Commercial Laying Hens
- Optimizing Saleable Eggs, Efficiency and Profitability
- Egg Bioscience and Biotechnology

**Welfare & Stress**
- Effects of Chronic Stress on Poultry (Part II)
- Heat Stress in Poultry: Solving the Problem
- Poultry Behaviour and Welfare

**Antimicrobial Use**
- CAHS AMU Report (Canadian Antimicrobial Use in Animals, EN Final) — use for AMR/stewardship sections

**Meat Science**
- Gracey's Meat Hygiene

When citing these, use the book title and author as the citation source, not the file path.

## Word Document Structure

Every course document must follow this structure:
1. Cover page (MANDATORY FORMAT)

- Must include CPC branding
- Must include CPC logo (or placeholder if embedding not possible)

- Must include (in this exact order, top to bottom):
  1. **Line 1:** `COURSE X: CPC SHORT COURSES` — all caps, bold, blue (`2E74B5`), centered. Replace X with the course number. Do NOT use "CANADIAN POULTRY TRAINING SERIES" or any other series name.
  2. **CPC logo** (centered)
  3. **Course title** — large, bold, blue (`2E74B5`), centered
  4. **Subtitle** — italic, blue (`2E74B5`), centered (if applicable)
  5. **Gold horizontal rule** (`C9A84C`) — implemented as plain ASCII underscores (`___________________________________`) in gold (`C9A84C`), size 22, centered. **NEVER use Unicode box-drawing characters (`───`) — they render as a thick gray rectangle in Word.** Confirmed correct implementation from Course 3 generator.
  6. **Metadata line:** `CPC Short Courses` — NOT "Canadian Poultry Training Series" or any variant
  7. **Duration** (e.g., `Duration: 2 hours`)
  8. **Date** (e.g., `April 2026`)
  9. **Disclaimer paragraph** — standard CPC educational disclaimer

- Must look like a professional industry training document (NOT generic AI output)

2. Table of Contents (requires "Update Field" in Word after opening)
3. Introduction
4. Main content sections with Heading 1 / Heading 2 hierarchy
5. Image placeholders, gray bordered table cell + caption (no actual images embedded)
6. Recommended peer-reviewed journals
7. References/bibliography (numbered, in order of appearance)

### Page Footer Format (MANDATORY)

Every page footer (including all section footer*.xml parts) must use this exact format:

```
CPC Short Courses  |  Course X  |  Page N of M
```

Styling (match Course 3 and Course 4 exactly):
- Font: Calibri, size 9pt (`sz val="18"`), gray (`888888`), centered
- Top border: single gold line (`C9A84C`, `sz="4"`)
- `Page N of M` uses live `PAGE` and `NUMPAGES` fields — never static text
- Separator: two spaces, pipe, two spaces: `  |  `
- Replace `X` with the course number. Do NOT include "of 17" or any total-course count.
- Apply to every `footer*.xml` part so all sections stay in sync.

XML template (paste verbatim, change course number only):
```xml
<w:p>
  <w:pPr><w:pBdr><w:top w:val="single" w:color="C9A84C" w:sz="4"/></w:pBdr><w:jc w:val="center"/></w:pPr>
  <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:color w:val="888888"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
    <w:t xml:space="preserve">CPC Short Courses  |  Course X  |  Page </w:t></w:r>
  <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:color w:val="888888"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
    <w:fldChar w:fldCharType="begin"/><w:instrText xml:space="preserve">PAGE</w:instrText><w:fldChar w:fldCharType="separate"/><w:fldChar w:fldCharType="end"/></w:r>
  <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:color w:val="888888"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
    <w:t xml:space="preserve"> of </w:t></w:r>
  <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:color w:val="888888"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
    <w:fldChar w:fldCharType="begin"/><w:instrText xml:space="preserve">NUMPAGES</w:instrText><w:fldChar w:fldCharType="separate"/><w:fldChar w:fldCharType="end"/></w:r>
</w:p>
```

### Page Header Format (MANDATORY)

Every page header (all sections except optionally the cover page) must use this exact format:

```
CPC Short Courses  |  [Course Title]
```

Styling (match Course 3 and Course 4 exactly):
- Right-aligned
- Bottom border: single gold line (`C9A84C`, `sz="4"`)
- Left part `CPC Short Courses  |  `: Calibri, size 9pt, gray (`888888`), not bold
- Right part `[Course Title]`: Calibri, size 9pt, bold, blue (`2E74B5`)
- Apply to every `header*.xml` part so all sections stay in sync.

XML template (paste verbatim, change course title only):
```xml
<w:p>
  <w:pPr><w:pBdr><w:bottom w:val="single" w:color="C9A84C" w:sz="4"/></w:pBdr><w:jc w:val="right"/></w:pPr>
  <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:color w:val="888888"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
    <w:t xml:space="preserve">CPC Short Courses  |  </w:t></w:r>
  <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
    <w:t xml:space="preserve">[Course Title Here]</w:t></w:r>
</w:p>
```

### Figure Caption Rule (MANDATORY)

Every figure and photo caption ends with `Source: <attribution>.` Use **`Source: CPC Short Courses.`** for diagrams, photos, and tables produced for or owned by CPC (the default for this project). Cite a third-party source by name only when the image is reproduced from outside the CPC library (e.g. `Source: Aviagen Ross 308 Manual, 2025.`).

Do NOT use AI-generation disclaimers like `(Generated diagram, CPC Short Courses.)`, `(Generated scientific illustration, ...)`, or "Actual electron micrographs to be supplied by the CPC team." in the caption — these read as drafts or provenance notes, not finished captions. The course is presented as a finished CPC product; the generation method belongs in internal notes, not in the rendered caption.

When swapping a figure for a photo or vice-versa (e.g. replacing a diagram with a real photograph), update both the prefix (`Figure X.Y` → `Photo X.Y`) and the caption text — describe the new image accurately, do not reuse the old caption verbatim.

### Figure vs. Photo Labeling (MANDATORY)

Use two parallel caption sequences depending on what the image actually is:

- **`Figure X.Y:`** for diagrams, charts, schematics, scientific illustrations, flowcharts, and any rendered/generated artwork. Numbered per chapter (Figure 1.1, 1.2, 2.1, etc.).
- **`Photo X.Y:`** for real photographs (barn shots, equipment, birds, lesions, post-mortem images, field scenes). Numbered per chapter as a separate sequence (Photo 1.1, 1.2, 2.1, etc.), so adding or removing a photo does not renumber any figures and vice versa.

Apply the labeling based on the medium of the image, not on its source — a stock photo and a farm-shot photo both get `Photo`; a generated diagram and a hand-drawn schematic both get `Figure`.

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

Before generating any course, run every step in order. Do not skip any step.

**Phase 1 — Research (before writing a single word)**

1. Scan `D:\Course agent\Avian medicine sources\CPC learning centre\` for every major section topic. Read any relevant CPC bulletins, disease profiles, or flock management guides and extract specific facts, protocols, and figures. This is the primary source layer for these courses — CPC materials always come first.
2. Scan the broader local library at `D:\Course agent\Avian medicine sources\` for scientific and industry sources covering the same topics.
3. Run `/deep-research` (deep mode) on each major section topic — retrieve, triangulate, synthesize, cite.
4. Run `/academic-researcher` on any specific statistic or threshold — verify against peer-reviewed sources.
5. Record all confirmed sources. Mark any unconfirmed claim `[NEEDS SOURCE]`.

**Phase 2 — Structure alignment**

6. Parse both reference courses:
   - Course 3 (T-FLAWS): `Course 3/T-FLAWS_Assessment_Management_Tool_draft.docx`
   - Course 7 (Common Poultry Diseases): `Course 7/Common_Poultry_Diseases_draft.docx`
7. Extract: structure, headings, tone, depth, formatting patterns.
8. Compare with new course outline and align.
9. Identify cross-reference opportunities: review the course outlines of all published courses in the series. For each section topic in the new course, note whether another published course covers that topic in greater depth. Flag those for cross-reference sentences.

**Phase 3 — Content generation**

10. Generate content aligned with: outline, reference structure, CPC standards, research findings from Phase 1.
11. Every claim must trace back to a confirmed source from Phase 1.
12. No number, threshold, or management recommendation without a citation.
13. Integrate CPC Learning Centre material actively throughout — not as a token citation at the end, but woven into the section content where the CPC source is directly relevant.
14. Insert cross-reference sentences at the point where each identified cross-reference gap arises (see Phase 2, step 9). Use format: "For more on [topic], see Course X ([Short Title]) in this series."

**Phase 4 — Validation**

15. Auto-alignment check: structure consistency, tone consistency, citation format, missing references.
16. Spelling sweep: run British English detection against all `<w:t>` text.
17. Cover page check: confirm gold rule uses plain underscores (`___...___`) in GOLD (`C9A84C`), not Unicode box-drawing characters.
18. Evaluate using Farmer-Flow Style Scoring System (minimum 24/30, no score below 4).
19. Rewrite automatically if score fails.
20. Humanization pass: identify and rewrite any AI-sounding sections before finalizing.

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

0. **Regenerate the draft first.** After a previous push, Git LFS may show the draft as deleted from the working tree (`git status` shows ` D Course X/..._draft.docx`) even though it is committed in history. Always run the generator (`node generate-courseX-*.mjs`) once before publishing, then verify the file is on disk and the byte count is in the expected range. Do not assume the on-disk draft is the latest.

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

## Subscripts and Superscripts in Chemical Formulas

CO2, NH3, H2O, mg/L, m², kg/m² and similar will appear in every course. The TextRun-per-character approach is the pattern. Helpers go at the top of the generator alongside `run()` and `labeled()`.

```js
// Helpers — add once near the top of every course generator
const co2r  = () => [run('CO'), run('2',  { subScript: true })];
const nh3r  = () => [run('NH'), run('3',  { subScript: true })];
const h2or  = () => [run('H'),  run('2',  { subScript: true }), run('O')];
const m2r   = () => [run('m'),  run('2',  { superScript: true })];
const kgm2r = () => [run('kg/m'), run('2', { superScript: true })];
```

For `labeled()` and `b()` to accept these (they return arrays of TextRuns, not strings), the helpers must spread arrays:

```js
const labeled = (label, body) => p([
  run(label + ' ', { bold: true }),
  ...(Array.isArray(body) ? body : [run(body)]),
]);
// b() already handles arrays via: children: Array.isArray(text) ? text : [run(text)]
```

Usage:
```js
labeled('Carbon dioxide:', [
  ...co2r(), run(' above 3,000 ppm indicates inadequate ventilation [1]. If '),
  ...co2r(), run(' is high, minimum ventilation is too low.'),
]),
b([run('Open-mouth breathing in cool conditions: indicates high '), ...co2r(), run(', not heat')]),
```

Verify in the build: `(xml.match(/w:vertAlign w:val="subscript"/g) || []).length` must equal the count of subscript runs you injected. Plain `CO2` left in the docx XML is a bug.

---

## Inline Data Tables in Course Generators

Course 3 added two inline data tables (temperature targets, lighting schedule). The pattern below is the canonical recipe — copy it verbatim into any generator that needs a table.

**Column widths must sum to 8640 twips** (page content width = 8.5" − 2×1.25" margins = 6"). The function name (`tempTable`, `lightingTable`, `densityTable`, etc.) is per-table; everything else is identical.

```js
function someTable() {
  const colW = [/* twips, must sum to 8640 */];
  const hdrBg = '2E74B5';   // CPC blue header
  const altBg = 'EBF2FA';   // light blue zebra-stripe
  const bdr = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' };
  const cellBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const hdrCell = (text, i) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: hdrBg },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [run(text, { bold: true, size: 18, color: 'FFFFFF' })],
    })],
  });

  const dataCell = (text, i, shade) => new TableCell({
    width: { size: colW[i], type: WidthType.DXA },
    borders: cellBorders,
    shading: { type: ShadingType.SOLID, color: shade ? altBg : 'FFFFFF' },
    children: [new Paragraph({
      // Center numeric columns; left-align text columns (typically the last "Notes" column)
      alignment: i === colW.length - 1 ? AlignmentType.LEFT : AlignmentType.CENTER,
      spacing: { before: 50, after: 50 },
      children: [run(text, { size: 18, color: BODY })],
    })],
  });

  const headers = [/* … */];
  const rows    = [[/* … */], [/* … */]];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    rows: [
      new TableRow({ children: headers.map((h, i) => hdrCell(h, i)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => dataCell(cell, ci, ri % 2 === 1)),
      })),
    ],
  });
}
```

In the document body, use it like an image block:
```js
p('Target ranges from CPC source [4,11]:'),
someTable(),
new Paragraph({ spacing: { before: 80, after: 0 } }),  // breathing room after table
```

Use **en dash (–, U+2013)** for ranges inside cells (`Day 14–21`, `30–50 lux`). Em dashes are still banned even in tables; use `-` or `–` only.

---

## Extracting Tables and Text from CPC Source Docx Files

When the user points to a CPC source `.docx` (e.g. `Avian medicine sources/CPC learning centre/.../something.docx`) as the basis for a section, extract its content programmatically — never re-type by hand.

```js
const JSZip = require('jszip');
const fs    = require('fs');

(async () => {
  const z   = await JSZip.loadAsync(fs.readFileSync('<path/to/cpc.docx>'));
  const xml = await z.file('word/document.xml').async('string');

  // Get every non-empty text run in order. For tables, runs come out left-to-right,
  // top-to-bottom, so you can chunk by `cols` to reconstruct rows.
  const texts = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(m => m[1]);
  texts.forEach((t, i) => console.log(i, JSON.stringify(t)));
})();
```

After extraction:
1. **Apply American English sweep** — CPC sources sometimes use British forms (e.g. "behaviour"). Convert before pasting into the generator.
2. **Strip the source's internal citation numbers** ("[1, 4, 12]" inside the source doc refers to *its* references, not yours). Replace with the matching numbers from your course's reference list.
3. **Verify nothing was paraphrased silently** — the user said "keep it as it is now", so the source text is the ground truth, not your rewrite of it.

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
