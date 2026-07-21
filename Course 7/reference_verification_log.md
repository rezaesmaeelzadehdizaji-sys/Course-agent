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
