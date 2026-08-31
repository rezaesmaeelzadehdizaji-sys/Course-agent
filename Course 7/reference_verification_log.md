# Course 7 — Reference Verification Log (Vancouver conversion audit)

Audit date: 2026-07-20
Auditor: Claude Code (CPC Short Courses agent)
File audited: `Course 7/7-Common Poultry Diseases_Practical Training for Farmers_V.1.docx`

## Context
Course 7 currently has **no in-text citations** (body prose is uncited) and an APA
author-date bibliography, categorized (Journals / Institutional / Surveillance / Scientific
Articles). The user asked to convert to Vancouver (numbered, in order of first appearance)
to match the other courses, including adding in-text [N] markers.

Before any reformat, every fabrication-risk reference was verified against CrossRef / PubMed /
publisher sources. Findings below.

## REMOVE — fabricated / cannot be located (do not carry into Vancouver list)
- **Pickup PA, et al. (2006). The extent and control of avian influenza in Canada.** — Cannot be
  located anywhere (CrossRef, web, PHAC). FABRICATED. Remove. (Matches CLAUDE.md audit note.)
- **Rautenschlein S, Haase C (2019). IBDV: factors and mechanisms affecting pathogenicity. Avian
  Pathology 48(S1):S18-S29.** — Cannot be located (no such 2019 Avian Pathology supplement paper).
  The entry even carried a "[Note: verify supplement page numbers]" tell. FABRICATED. Remove.
  Replace, if IBD needs a citation, with a verified IBD review.

## FIX — real papers, but cited wrong in Course 7
- **Ruhnke et al. (2019)** → WRONG AUTHORS. Correct (CrossRef, doi:10.1177/1040638719843577):
  **Brochu NM, Guerin MT, Varga C, Lillie BN, Brash ML, Susta L. A two-year prospective study of
  small poultry flocks in Ontario, Canada, part 1: prevalence of viral and bacterial pathogens.
  J Vet Diagn Invest. 2019;31(3):327-335.**
- **Opengart K (2008)** → WRONG CHAPTER TITLE + PAGES. Course 7 says "Necrotic dermatitis, pp.
  1092-1095". Correct: **Opengart K. Necrotic enteritis. In: Saif YM, editor. Diseases of Poultry.
  12th ed. Ames (IA): Blackwell; 2008. p. 872-877.**
- **Elfadil AA, Vaillancourt JP, Meek AH (1996)** → MISSING CO-AUTHOR (Gyles CL). CrossRef confirms
  4th author **C. L. Gyles**. NOTE: title also needs confirming — CrossRef returned "A Prospective
  Study of Cellulitis in Broiler Chickens in Southern Ontario" (Avian Diseases 1996;40(3), start
  p.677, doi:10.2307/1592281). Course 7's title "Description of cellulitis lesions and associations
  between cellulitis and other indicators of health..." may be a SEPARATE companion paper — must
  pin the exact title/end page before finalizing (CLAUDE.md notes end page 677-689).
- **Dhama K, et al. (2013)** → WRONG TITLE WORD. Course 7 says "zoonotic importance"; correct title
  is "...and their zoonotic **Significance**: A review." Pak J Biol Sci. 2013;16(20):1076-1085.
  doi:10.3923/pjbs.2013.1076.1085.

## VERIFIED CORRECT (real, cited accurately)
- Blake DP, Knox J, Dehaeck B, et al. Re-calculating the cost of coccidiosis in chickens. Vet Res.
  2020;51:115. doi:10.1186/s13567-020-00837-2. ✓
- Wideman RF, Rhoads DD, Erf GF, Anthony NB. Pulmonary arterial hypertension (ascites syndrome) in
  broilers: a review. Poult Sci. 2013;92(1):64-83. doi:10.3382/ps.2012-02745. ✓
- López-Osorio S, Chaparro-Gutiérrez JJ, Gómez-Osorio LM. Overview of poultry Eimeria life cycle
  and host-parasite interactions. Front Vet Sci. 2020;7:384. doi:10.3389/fvets.2020.00384. ✓
- Zuidhof MJ, Schneider BL, Carney VL, Korver DR, Robinson FE. Growth, efficiency, and yield of
  commercial broilers from 1957, 1978, and 2005. Poult Sci. 2014;93(12):2970-2982. ✓ (also in Course 6)
- Bell DD, Weaver WD Jr, editors. Commercial Chicken Meat and Egg Production. 5th ed. Springer; 2002. ✓
- Swayne DE, editor. Diseases of Poultry. 14th ed. Wiley-Blackwell; 2020. ✓

## STILL TO VERIFY before finalizing the list
- Conway DP, McKenzie ME. Poultry Coccidiosis: Diagnostic and Testing Procedures. 3rd ed. Blackwell; 2007.
- Stipkovits L, Kempf I. Mycoplasmoses in poultry. Rev Sci Tech. 1996;15(4):1495-1525.
- EFSA. Scientific opinion on Salmonella control in poultry flocks... EFSA Journal 2019;17(2):5596.
- Elfadil exact title/end page (companion-paper ambiguity, above).

## Institutional/industry sources (existence-verified as issuing bodies; keep, reformat)
CFIA, NFACC, WOAH, FAO, Aviagen (Ross), Cobb-Vantress, Hy-Line, Lohmann, Merck Vet Manual, CVMA,
CWHC, Elanco, OMAFRA, Turkey Farmers of Canada/CAHSS, Ducks Unlimited Canada, OAHN, Canadian
Poultry Magazine, CPC Learning Centre. These are real organizations; each specific document/URL
should carry `[cited YYYY Mon]` per the Cited-Date Rule when reformatted.

## Journals-consulted list (NOT numbered references)
Avian Diseases, Avian Pathology, British Poultry Science, Canadian Veterinary Journal, Journal of
Applied Poultry Research, Poultry Science, Veterinary Record, World's Poultry Science Journal.
These are journal titles, not cited works — they belong in a "Recommended Journals" section, not
the numbered Vancouver reference list.

---

## 2026-08-30 — IBH figures corrected against the cited source (ref [9], Merck Veterinary Manual)

Raised by the Course 18 claims audit, which found the same disease described with a different
age range in the two courses. Checked Course 7's IBH paragraph against reference **[9]**, the
Merck Veterinary Manual, which is what the paragraph itself cites. Two of its three numbers
were not supported by that source.

### What the sources actually say

**Merck Veterinary Manual (Course 7 ref [9]), Inclusion Body Hepatitis:**
- "Sudden increase in daily mortality from IBH and HHS is usually observed in chickens **< 6 weeks old** and can occur in chicks **as young as 4 days old**"
- "Elevated mortality rate usually lasts for **5 days** with IBH"
- "Mortality rates normally range from 2-40% with IBH"
- "Vertical transmission has been documented in progeny from breeder flocks infected with FAdV-4 and FAdV-8"
- "When breeders are properly vaccinated, antibodies generated by the vaccine are transmitted to the progeny"

**El-Shall NA, et al. Front Vet Sci. 2022;9:963199 (PMID 36304412), cross-check:**
- IBH "typically affects poultry between the ages of **3-5 weeks**"
- "IBH has been documented in chickens as young as **7 and 10 days old**, as well as in 1-day-old turkeys"
- mortality "usually peaked at the 4th day post infection (dpi) and may terminate by the fifth dpi, but deaths may extend for another 2-3 weeks"

The two sources agree: the typical window is early and closes around five to six weeks, and the
disease can strike far younger than three weeks. Neither supports an upper bound of seven weeks.

### Corrections applied

| Claim | Was | Now | Basis |
|---|---|---|---|
| Age range | "IBH mortality is most commonly seen from **3 to 7 weeks** of age" | "Mortality climbs suddenly, most often in broilers **before six weeks of age**, and it can strike chicks only a few days old" | Merck [9], verbatim; also consistent with El-Shall |
| Disease course | "a total course lasting **9 to 15 days**" | "Once it starts, the elevated death loss usually runs **about five days**" | Merck [9], verbatim |
| Peak timing | "peaks within just 3 to 4 days" | removed (folded into the above) | not stated by Merck; El-Shall gives peak at 4 dpi, but the sentence now reads on the Merck figures alone |
| Photo 10 caption | "typically presenting at **3-7 weeks** in broilers" | "causes **sudden mortality** in broilers, most often **before six weeks of age**" | same; also removes the duplicated "in broilers" |

The corrected age range now also supports, rather than contradicts, the paragraph's own opening
line that IBH "can hit surprisingly early." Under the old text the disease was said to start no
earlier than three weeks, which undercut that point.

Claims in the same paragraph re-checked and confirmed against [9], left unchanged: vertical
transmission from breeder flocks, no treatment once it hits, breeder vaccination as the upstream
fix, and autogenous vaccines for recurring farm problems. (Ojkic et al., J Vet Diagn Invest.
2026;38(2):168-173 independently records that "widespread vaccination of broiler breeders was
introduced in Ontario with bivalent, autogenous vaccines," which supports the Canadian relevance
of that last point.)

### Files updated
- `Course 7/7-Common Poultry Diseases_Practical Training for Farmers_V.1.docx`
- `Course 7/Common_Poultry_Diseases_draft.docx`
- `dashboard/public/docs/course-07-common-poultry-diseases.docx`

Course 7 has no body generator, so the docx files were patched directly per the CLAUDE.md
recipe: JSZip only, edits confined to `<w:t>` contents with no structural XML touched, and an
unescaped-ampersand check before writing.

### Verification
- mammoth: 0 messages on all three files; 32 media parts intact in each; paragraph counts unchanged
- unescaped ampersands: 0
- no remaining "3 to 7 weeks" / "3-7 weeks" / "9 to 15 days" anywhere in the text
- LibreOffice render: 35 pages, and all 28 TOC entries still match their actual heading pages,
  so the edit did not shift pagination
- No reference was added or renumbered; the paragraph still cites [9], which now genuinely
  supports every figure in it

### Note
The live dashboard will keep serving the previous build until a production deploy is run from
`dashboard/`. The corrected file is committed to `dashboard/public/docs/`.
