# Course 8 (Vaccination & Treatment) — Source of Truth

**The course document is the source of truth, not a generator script.**

- **Live file:** `Course 8/Vaccination_draft.docx` (and its rendered `Vaccination_draft.pdf`)
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
- `renumber-course8.cjs` — restores Vancouver citation order after any
  reference is added or moved; physically reorders the bibliography.
- `toc-refresh-course8.cjs` — refreshes cached TOC page numbers from the
  rendered PDF so the PDF's table of contents matches the body.

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
