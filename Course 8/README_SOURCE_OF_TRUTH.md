# Course 8 (Vaccination & Treatment) — Source of Truth

**The course document is the source of truth, not a generator script.**

- **Live file:** `Course 8/RV-revised-NB-edited course 8 draft.docx` (and its rendered `.pdf`). This file was originally created as `Vaccination_draft.docx`, renamed to `Revised Course 8.docx`, then renamed again (marked "final") to its current name — this document was not kept in sync with those renames until 2026-07-21. `Course 8/Revised Course 8.docx` is a superseded intermediate copy; do not edit it, it is not what's published. Confirm the live file by diffing its byte size against `dashboard/public/docs/course-08-vaccination-treatment.docx` (the two must match exactly after every publish).
- **Companion summary:** `Course 8/Summary_Page_Course8_Vaccination.docx`

## Why there is no working generator

`generate-course8.mjs` (now `generate-course8.DEPRECATED.mjs`) builds an **old
6-section** version of the course in the wrong order. The live course diverged
from it and has been maintained by **direct XML patching** of the `.docx` since.
The deprecated generator is guarded so it will refuse to run (it would otherwise
overwrite the current course and silently drop Sections 7 & 8 and many edits).

Current document structure (8 sections):

1. Section 1 — Water Vaccination
2. Section 2 — Spray Vaccination (incl. 2.9 Fine Spray)
3. Section 3 — Eye Drop Vaccination
4. Section 4 — Wing Web Vaccination
5. Section 5 — Injection Vaccination
6. Section 6 — In-Ovo Vaccination (+ Table 6.1: vaccines by disease & delivery route)
7. Section 7 — Post-Vaccination Reactions
8. Section 8 — Principles of Treatment (Including AMR)

## How to edit this course

Edit the `.docx` directly with jszip patch scripts, following
`CLAUDE.md` ("Editing .docx Files Directly (Node.js)"). Reference scripts from
the June 2026 reviewer-comment pass live in the project root:

- `patch-course8-reviewer.cjs` — content edits (intro immunology foundation,
  antibody table, live/killed vs modified-live, cold-chain definition,
  CPC-attribution thinning, Table 6.1, Section 8 culture & sensitivity).
- `renumber-course8.cjs` — a **one-time** June 2026 script with a hardcoded
  old→new citation map and hardcoded path to the old `Vaccination_draft.docx`
  filename. Do not run as-is; use it only as a pattern reference for the
  bibliography physical-reorder technique (find bib paragraphs via
  `w:hanging="504"` + the bold-blue-label regex, relabel, sort, reassemble).
- `toc-refresh-course8.cjs` — path corrected 2026-07-21 to point at the
  current live file. Refreshes cached TOC page numbers by exact/prefix line
  matching against `pdftotext` output. **Known limitation:** headings that
  wrap across two lines in the rendered PDF (e.g. "Section 7: ... What to
  Expect and When / to Act") or whose TOC text has drifted from the actual
  heading text (e.g. TOC says "8.3 Treatment Routes" but the heading itself
  reads "8.3 Treatment Route" — a pre-existing typo, not yet fixed) will not
  be found by this matcher and must be checked by hand against the rendered
  PDF pages. Always spot-check the "not found" list, don't assume they're
  unchanged.
- `patch-course8-killedvax-fix.cjs` — 2026-07-21: corrected the live-vs-killed
  vaccine immunology paragraph and inserted a new reference (see
  `reference_verification_log.md`). Kept as a worked example of the
  placeholder-then-remap technique for inserting a mid-document citation
  without the cascade regex catching the newly-inserted marker.

### Standard workflow after any edit

```bash
node patch-course8-<change>.cjs          # apply the text/table edits
node renumber-course8.cjs                # only if references changed
# regenerate the PDF:
"/c/Program Files/LibreOffice/program/soffice.exe" --headless --convert-to pdf \
  --outdir "Course 8" "Course 8/Vaccination_draft.docx"
node toc-refresh-course8.cjs             # sync TOC page numbers to the new PDF
# re-render the PDF once more so the refreshed TOC is baked in:
"/c/Program Files/LibreOffice/program/soffice.exe" --headless --convert-to pdf \
  --outdir "Course 8" "Course 8/Vaccination_draft.docx"
```

Always validate before reporting done: mammoth parses with 0 messages,
0 em/en dashes, 0 `w:dirty` flags, every `&` escaped as `&amp;` in patched XML,
and citation first-appearance order is sequential 1..N.

## If the course is ever rebuilt from scratch

If a clean generator is wanted in the future, build a **new** one
(`generate-course8-v2.mjs`) that reproduces the 8-section structure above,
verify it against this `.docx` page by page, and only then retire the patch
workflow. Do not resurrect `generate-course8.DEPRECATED.mjs`.
