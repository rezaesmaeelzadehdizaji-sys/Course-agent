/**
 * Seed Script — Course 1 (T-FLAWS)
 *
 * Usage (after npm install):
 *   cd dashboard
 *   npx ts-node --esm supabase/seed/course-01.ts
 *
 * Or use the package.json script:
 *   npm run seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

// ============================================================
// COURSE 1 DATA
// Sourced from ../../../js/course-content.js and references.js
// ============================================================

const META = {
  title: "T-FLAWS – Assessment Management Tool",
  subtitle: "A Structured Flock Assessment Framework for Commercial Poultry Farmers in Canada",
  organization: "Canadian Poultry Training Series",
  date: "April 2026",
  version: "1.0",
  disclaimer:
    "This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature and industry management guides. Items marked [NEEDS SOURCE] require additional verification before publication.",
}

const INTRODUCTION = {
  title: "Introduction to T-FLAWS",
  paragraphs: [
    "T-FLAWS is a structured flock assessment framework designed to provide commercial poultry farmers with a systematic, repeatable method for evaluating flock health and welfare at the barn level. The acronym stands for Toes, Feathers, Legs, Activity, Weight, and Skin — six key indicators that, when assessed together, provide a comprehensive picture of flock status at any point in the production cycle.",
    "The T-FLAWS framework was developed in response to growing regulatory and market requirements for documented welfare assessments in Canadian poultry production. The National Farm Animal Care Council (NFACC) Code of Practice for the care and handling of hatching eggs, breeders, chickens and turkeys (2016) establishes minimum welfare standards and encourages producers to implement systematic on-farm welfare monitoring programs. T-FLAWS operationalizes this expectation into a practical barn-level tool.",
    "Unlike single-indicator welfare assessments, T-FLAWS provides a multi-dimensional view of flock status. Problems detected in one indicator often correlate with — or predict — problems in others. For example, a flock with elevated footpad dermatitis scores (Toes) is likely experiencing wet litter conditions that may also manifest as hock burns (Skin) and reduced activity (Activity) due to discomfort. By assessing all six components together, producers can identify root causes more efficiently and respond before problems escalate.",
  ],
  subsections: [
    {
      heading: "Purpose of This Guide",
      paragraphs: [
        "This guide provides detailed protocols for assessing each T-FLAWS component, interpreting findings, and implementing evidence-based management responses. It is intended for use by experienced commercial poultry farmers, barn supervisors, and farm advisors working with broiler, layer, and breeder operations across Canada.",
        "The guide is structured so that each T-FLAWS component is treated as a standalone module. Producers may begin with the component most relevant to their current production challenge, or work through all six components as part of a scheduled flock assessment.",
      ],
    },
    {
      heading: "How to Use T-FLAWS",
      paragraphs: [
        "T-FLAWS assessments should be conducted systematically, following the same protocol each time to enable meaningful comparison across flocks and production cycles. Before entering the barn, gather your assessment materials: a scoring sheet (or tablet with digital form), a catch pen or landing net for capturing birds for close examination, and appropriate personal protective equipment (PPE).",
        "For each component, the protocol specifies a minimum sample size, the examination procedure, and a scoring scale. Scores should be recorded on a per-bird basis where applicable, with summary statistics (mean score, prevalence of each score category) calculated at the flock level. These summary statistics are what you will compare to benchmarks and track over time.",
        "Assessment findings should be documented and retained as part of your flock records. Many on-farm welfare programs and processor audits require documented welfare assessments at specified intervals.",
      ],
    },
    {
      heading: "When to Conduct T-FLAWS Assessments",
      paragraphs: [
        "For broiler operations, formal T-FLAWS assessments are recommended at the following intervals: Day 7 (establishment check — focus on Activity and Weight), Day 14 (early growth check — all components), Day 21 (mid-cycle check — all components), Day 28 (pre-thinning assessment — all components), Day 35 or at thinning/depopulation (pre-harvest assessment).",
        "For layer and breeder operations, assessments should be conducted monthly during the laying period, with additional assessments following any significant flock event (disease outbreak, equipment failure, extreme weather event).",
        "In addition to scheduled formal assessments, daily walk-throughs remain essential. The T-FLAWS framework is designed to complement — not replace — attentive daily observation.",
      ],
    },
  ],
}

// Section keys in order
const SECTIONS = [
  { section_key: 'toes',     letter: 'T', title: 'Toes',     full_title: 'T — Toes',     sort_order: 0 },
  { section_key: 'feathers', letter: 'F', title: 'Feathers', full_title: 'F — Feathers', sort_order: 1 },
  { section_key: 'legs',     letter: 'L', title: 'Legs',     full_title: 'L — Legs',     sort_order: 2 },
  { section_key: 'activity', letter: 'A', title: 'Activity', full_title: 'A — Activity', sort_order: 3 },
  { section_key: 'weight',   letter: 'W', title: 'Weight',   full_title: 'W — Weight',   sort_order: 4 },
  { section_key: 'skin',     letter: 'S', title: 'Skin',     full_title: 'S — Skin',     sort_order: 5 },
]

// NOTE: Subsection content is loaded from the existing course-content.js.
// Run this script from the dashboard/ directory so the relative path resolves correctly.
// If you prefer to inline the content, paste it here directly.
async function loadSectionSubsections(): Promise<Record<string, object>> {
  // Read the raw JS file and extract the sections array using eval-safe approach
  // Since course-content.js uses ESM exports, we use a file read + regex extraction approach

  const contentPath = path.resolve(__dirname, '../../../js/course-content.js')

  if (!fs.existsSync(contentPath)) {
    console.warn(`course-content.js not found at ${contentPath}. Sections will have empty subsections.`)
    console.warn('You can fill in section content via the dashboard editor.')
    return {}
  }

  // Dynamically import using a data URL trick to bypass the CDN import
  // We'll read the file, replace the CDN import and export, and eval it
  // This is safe since we control the source file
  let raw = fs.readFileSync(contentPath, 'utf-8')

  // The file imports from CDN and exports const courseContent
  // We need to extract the sections object without executing the CDN import
  // Use a regex to find the sections array
  const sectionsMatch = raw.match(/sections:\s*\[[\s\S]*?(?=\n\s*journalSection)/m)

  if (!sectionsMatch) {
    console.warn('Could not parse sections from course-content.js. Fill content via the dashboard editor.')
    return {}
  }

  // Build per-key subsections by parsing the structure manually
  // Instead, read the whole content object as a module
  // Replace the CDN import and the export line, then evaluate
  raw = raw
    .replace(/^import\s+.*?from\s+["']https?:\/\/[^"']+["'];?\s*/gm, '')
    .replace(/^export const courseContent\s*=\s*/, 'const courseContent = ')
    .replace(/^export\s+/gm, '')

  try {
    const fn = new Function(`${raw}\n return courseContent;`)
    const content = fn()
    const result: Record<string, object> = {}
    for (const section of content.sections) {
      result[section.id] = section.subsections
    }
    return result
  } catch (e) {
    console.warn('Could not evaluate course-content.js:', e)
    return {}
  }
}

const JOURNAL_SECTION = {
  title: "Recommended Peer-Reviewed Journals and Resources",
  intro: "The following peer-reviewed journals represent the primary scientific literature sources for poultry health, welfare, and production management. Producers and advisors seeking to review evidence-based practices should consult these sources directly.",
  journals: [
    { name: "Poultry Science", publisher: "Oxford University Press / Poultry Science Association", scope: "Comprehensive coverage of poultry biology, production, nutrition, health, and welfare.", issn: "0032-5791" },
    { name: "British Poultry Science", publisher: "Taylor & Francis", scope: "Applied and fundamental research on poultry production and welfare.", issn: "0007-1668" },
    { name: "Avian Diseases", publisher: "American Association of Avian Pathologists", scope: "Pathology, diagnosis, and epidemiology of avian diseases.", issn: "0005-2086" },
    { name: "World's Poultry Science Journal", publisher: "Cambridge University Press / World's Poultry Science Association", scope: "Review articles and synthesis of global poultry science research.", issn: "0043-9339" },
    { name: "Journal of Applied Poultry Research", publisher: "Oxford University Press / Poultry Science Association", scope: "Applied research directly relevant to commercial poultry production.", issn: "1056-6171" },
    { name: "Veterinary Record", publisher: "BMJ Journals / British Veterinary Association", scope: "Clinical and research findings in veterinary medicine including poultry.", issn: "0042-4900" },
    { name: "Preventive Veterinary Medicine", publisher: "Elsevier", scope: "Epidemiology, population medicine, and disease prevention in animal production.", issn: "0167-5877" },
    { name: "PLoS ONE", publisher: "Public Library of Science", scope: "Open-access multidisciplinary research including animal science and welfare.", issn: "1932-6203" },
    { name: "Animals", publisher: "MDPI", scope: "Open-access journal covering all aspects of animal science and welfare.", issn: "2076-2615" },
    { name: "Frontiers in Veterinary Science", publisher: "Frontiers Media", scope: "Open-access veterinary research including poultry production and health.", issn: "2297-1769" },
  ],
  institutional_resources: [
    "https://www.nfacc.ca/codes-of-practice/chickens-turkeys-and-breeders",
    "https://www.merckvetmanual.com/poultry",
    "https://www.aviagen.com/brands/ross/resources/",
    "https://www.cobb-vantress.com/resources/",
    "https://www.welfarequalitynetwork.net/en/",
    "https://www.inspection.gc.ca/animal-health/terrestrial-animals/",
    "https://www.canadianveterinarians.net/about/positions/animal-welfare/",
  ],
}

const REFERENCES = [
  { ref_key: "Aviagen2022Ross",      apa: "Aviagen. (2022). Ross 308 broiler: Performance objectives. Aviagen Group. https://www.aviagen.com/assets/Tech_Center/Ross_Broiler/Ross308-BroilerPO2022-EN.pdf", short: "(Aviagen, 2022)", sort_order: 0 },
  { ref_key: "Aviagen2022Mgmt",      apa: "Aviagen. (2022). Ross broiler management handbook. Aviagen Group. https://www.aviagen.com/assets/Tech_Center/Ross_Broiler/Ross-BroilerHandbook2018-EN.pdf", short: "(Aviagen, 2022)", sort_order: 1 },
  { ref_key: "AviagenEnv2022",       apa: "Aviagen. (2022). Ross broiler: Environmental management supplement. Aviagen Group.", short: "(Aviagen, 2022)", sort_order: 2 },
  { ref_key: "Bilcik1999",           apa: "Bilcik, B., & Keeling, L. J. (1999). Changes in feather condition in relation to feather pecking and aggressive behaviour in laying hens. British Poultry Science, 40(4), 444–451. https://doi.org/10.1080/00071669987188", short: "(Bilcik & Keeling, 1999)", sort_order: 3 },
  { ref_key: "CEVA2020",             apa: "CEVA Animal Health. (2020). Poultry feather condition scoring guide. CEVA Santé Animale.", short: "(CEVA Animal Health, 2020)", sort_order: 4 },
  { ref_key: "CFIA2022",             apa: "Canadian Food Inspection Agency. (2022). Codes of practice for the care and handling of chickens, turkeys and breeders from hatch to slaughter. Government of Canada. https://www.inspection.gc.ca", short: "(CFIA, 2022)", sort_order: 5 },
  { ref_key: "CFIACondemnation2019", apa: "Canadian Food Inspection Agency. (2019). Meat hygiene manual of procedures: Chapter 17 — Post-mortem examination procedures and dispositions. Government of Canada.", short: "(CFIA, 2019)", sort_order: 6 },
  { ref_key: "Cobb2021",             apa: "Cobb-Vantress. (2021). Cobb 500 broiler performance and nutrition supplement. Cobb-Vantress Inc. https://www.cobb-vantress.com", short: "(Cobb-Vantress, 2021)", sort_order: 7 },
  { ref_key: "Cobb2021Mgmt",         apa: "Cobb-Vantress. (2021). Cobb broiler management guide. Cobb-Vantress Inc. https://www.cobb-vantress.com", short: "(Cobb-Vantress, 2021)", sort_order: 8 },
  { ref_key: "CVMA2020",             apa: "Canadian Veterinary Medical Association. (2020). CVMA position statement on farm animal welfare. CVMA. https://www.canadianveterinarians.net", short: "(CVMA, 2020)", sort_order: 9 },
  { ref_key: "Daigle2017",           apa: "Daigle, C. L. (2017). The effect of feather pecking on welfare and productivity. Journal of Applied Poultry Research, 26(4), 560–572. https://doi.org/10.3382/japr/pfx028", short: "(Daigle, 2017)", sort_order: 10 },
  { ref_key: "Dawkins2004",          apa: "Dawkins, M. S., Donnelly, C. A., & Jones, T. A. (2004). Chicken welfare is influenced more by housing conditions than by stocking density. Nature, 427(6972), 342–344. https://doi.org/10.1038/nature02226", short: "(Dawkins et al., 2004)", sort_order: 11 },
  { ref_key: "EFSA2012",             apa: "European Food Safety Authority. (2012). Scientific opinion on the welfare of chickens on farm. EFSA Journal, 10(1), 2424. https://doi.org/10.2903/j.efsa.2012.2424", short: "(EFSA, 2012)", sort_order: 12 },
  { ref_key: "Elfadil1996",          apa: "Elfadil, A. A., Vaillancourt, J. P., & Meek, A. H. (1996). Description of cellulitis lesions and associations between cellulitis and other indicators of health in broiler chickens. Avian Diseases, 40(3), 677–688. https://doi.org/10.2307/1592285", short: "(Elfadil et al., 1996)", sort_order: 13 },
  { ref_key: "Ekstrand1997",         apa: "Ekstrand, C., Algers, B., & Svedberg, J. (1997). Rearing conditions and foot-pad dermatitis in Swedish broiler chickens. Preventive Veterinary Medicine, 31(3–4), 167–174. https://doi.org/10.1016/S0167-5877(96)01141-4", short: "(Ekstrand et al., 1997)", sort_order: 14 },
  { ref_key: "Jones1996",            apa: "Jones, R. B. (1996). Fear and adaptability in poultry: Insights, implications and imperatives. World's Poultry Science Journal, 52(2), 131–174. https://doi.org/10.1079/WPS19960013", short: "(Jones, 1996)", sort_order: 15 },
  { ref_key: "Kestin1992",           apa: "Kestin, S. C., Knowles, T. G., Tinch, A. E., & Gregory, N. G. (1992). Prevalence of leg weakness in broiler chickens and its relationship with genotype. Veterinary Record, 131(9), 190–194. https://doi.org/10.1136/vr.131.9.190", short: "(Kestin et al., 1992)", sort_order: 16 },
  { ref_key: "Knowles2008",          apa: "Knowles, T. G., Kestin, S. C., Haslam, S. M., Brown, S. N., Green, L. E., Butterworth, A., Pope, S. J., Pfeiffer, D., & Nicol, C. J. (2008). Leg disorders in broiler chickens: Prevalence, risk factors and prevention. PLoS ONE, 3(2), e1545. https://doi.org/10.1371/journal.pone.0001545", short: "(Knowles et al., 2008)", sort_order: 17 },
  { ref_key: "Lohmann2021",          apa: "Lohmann Tierzucht. (2021). Lohmann LSL-Classic management guide. Lohmann Tierzucht GmbH. https://www.lohmann-tierzucht.com", short: "(Lohmann Tierzucht, 2021)", sort_order: 18 },
  { ref_key: "Merck2022Footpad",     apa: "Merck Veterinary Manual. (2022). Footpad dermatitis in poultry. Merck & Co., Inc. https://www.merckvetmanual.com/poultry/integumentary-system/footpad-dermatitis-in-poultry", short: "(Merck Veterinary Manual, 2022)", sort_order: 19 },
  { ref_key: "Merck2022Lameness",    apa: "Merck Veterinary Manual. (2022). Lameness in poultry. Merck & Co., Inc. https://www.merckvetmanual.com/poultry/musculoskeletal-disorders/lameness-in-poultry", short: "(Merck Veterinary Manual, 2022)", sort_order: 20 },
  { ref_key: "Merck2022Skin",        apa: "Merck Veterinary Manual. (2022). Skin disorders in poultry. Merck & Co., Inc. https://www.merckvetmanual.com/poultry/integumentary-system", short: "(Merck Veterinary Manual, 2022)", sort_order: 21 },
  { ref_key: "NFACC2016",            apa: "National Farm Animal Care Council. (2016). Code of practice for the care and handling of hatching eggs, breeders, chickens and turkeys. NFACC. https://www.nfacc.ca/codes-of-practice/chickens-turkeys-and-breeders", short: "(NFACC, 2016)", sort_order: 22 },
  { ref_key: "Norton1997",           apa: "Norton, R. A. (1997). Effect of oregano and thyme oils on virulence of Salmonella in broilers and the immunological status in broilers: Infectious agents affecting the integument. World's Poultry Science Journal, 53(2), 155–160. https://doi.org/10.1079/WPS19970013", short: "(Norton, 1997)", sort_order: 23 },
  { ref_key: "Opengart2008",         apa: "Opengart, K. (2008). Necrotic dermatitis. In Y. M. Saif, A. M. Fadly, J. R. Glisson, L. R. McDougald, L. K. Nolan, & D. E. Swayne (Eds.), Diseases of poultry (12th ed., pp. 1092–1095). Blackwell Publishing.", short: "(Opengart, 2008)", sort_order: 24 },
  { ref_key: "Riber2018",            apa: "Riber, A. B., van de Weerd, H. A., de Jong, I. C., & Steenfeldt, S. (2018). Review of environmental enrichment for broiler chickens. Poultry Science, 97(2), 378–396. https://doi.org/10.3382/ps/pex245", short: "(Riber et al., 2018)", sort_order: 25 },
  { ref_key: "Shepherd2010",         apa: "Shepherd, E. M., & Fairchild, B. D. (2010). Footpad dermatitis in poultry. Poultry Science, 89(10), 2043–2051. https://doi.org/10.3382/ps.2010-00671", short: "(Shepherd & Fairchild, 2010)", sort_order: 26 },
  { ref_key: "WelfareQuality2009",   apa: "Welfare Quality®. (2009). Welfare Quality® assessment protocol for poultry (broilers, laying hens). Welfare Quality® Consortium. https://www.welfarequalitynetwork.net", short: "(Welfare Quality®, 2009)", sort_order: 27 },
  { ref_key: "Zoetis2021Ecoli",      apa: "Zoetis. (2021). Poulvac E. coli: Product monograph. Zoetis Canada Inc.", short: "(Zoetis, 2021)", sort_order: 28 },
  { ref_key: "Zuidhof2014",          apa: "Zuidhof, M. J., Schneider, B. L., Carney, V. L., Korver, D. R., & Robinson, F. E. (2014). Growth, efficiency, and yield of commercial broilers from 1957, 1978, and 2005. Poultry Science, 93(12), 2970–2982. https://doi.org/10.3382/ps.2014-04291", short: "(Zuidhof et al., 2014)", sort_order: 29 },
]

// Placeholder titles for courses 2–17
const PLANNED_COURSE_TITLES = [
  null, // index 0 unused
  null, // Course 1 handled above
  'Biosecurity Fundamentals',
  'Vaccination Programs',
  'Nutrition & Feed Management',
  'Water Quality & Management',
  'Ventilation & Environmental Control',
  'Litter Management',
  'Flock Health Monitoring',
  'Disease Recognition & Response',
  'Medication & Treatment Records',
  'Mortality Management',
  'Catching & Loading Best Practices',
  'Record Keeping & Traceability',
  'On-Farm Animal Welfare Audits',
  'Emergency Preparedness',
  'Predator & Pest Management',
  'End-of-Flock Assessment',
]

// ============================================================
// SEED FUNCTION
// ============================================================

async function seed() {
  console.log('🌱 Seeding Course 1 (T-FLAWS)...\n')

  // 1. Insert Course 1
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .upsert({
      course_number: 1,
      slug: 'tflaws-assessment',
      status: 'Complete',
      progress_pct: 100,
      meta: META,
    }, { onConflict: 'course_number' })
    .select()
    .single()

  if (courseErr) {
    console.error('Failed to insert course:', courseErr.message)
    process.exit(1)
  }
  console.log(`✅ Course 1 inserted (id: ${course.id})`)

  // 2. Insert Introduction
  const { error: introErr } = await supabase
    .from('introductions')
    .upsert({ course_id: course.id, ...INTRODUCTION }, { onConflict: 'course_id' })

  if (introErr) console.error('Introduction error:', introErr.message)
  else console.log('✅ Introduction inserted')

  // 3. Load section subsections from course-content.js
  const subsectionsMap = await loadSectionSubsections()

  // 4. Insert Sections
  for (const s of SECTIONS) {
    const { error } = await supabase
      .from('sections')
      .upsert({
        course_id: course.id,
        section_key: s.section_key,
        letter: s.letter,
        title: s.title,
        full_title: s.full_title,
        sort_order: s.sort_order,
        subsections: subsectionsMap[s.section_key] ?? {},
      }, { onConflict: 'course_id,section_key' })

    if (error) console.error(`Section ${s.letter} error:`, error.message)
    else console.log(`✅ Section ${s.full_title} inserted`)
  }

  // 5. Insert Journal Section
  const { error: journalErr } = await supabase
    .from('journal_sections')
    .upsert({ course_id: course.id, ...JOURNAL_SECTION }, { onConflict: 'course_id' })

  if (journalErr) console.error('Journal section error:', journalErr.message)
  else console.log('✅ Journal section inserted')

  // 6. Insert References
  for (const ref of REFERENCES) {
    const { error } = await supabase
      .from('references')
      .upsert({ course_id: course.id, ...ref }, { onConflict: 'course_id,ref_key' })
    if (error) console.error(`Reference ${ref.ref_key} error:`, error.message)
  }
  console.log(`✅ ${REFERENCES.length} references inserted`)

  // 7. Seed stub rows for courses 2–17
  console.log('\n🌱 Seeding placeholder stubs for courses 2–17...')
  for (let num = 2; num <= 17; num++) {
    const title = PLANNED_COURSE_TITLES[num] ?? `Course ${num}`
    const { error } = await supabase
      .from('courses')
      .upsert({
        course_number: num,
        slug: `course-${String(num).padStart(2, '0')}`,
        status: 'Planned',
        progress_pct: 0,
        meta: { title, subtitle: '', organization: 'Canadian Poultry Training Series', date: '', version: '0.1', disclaimer: '' },
      }, { onConflict: 'course_number' })
    if (error) console.error(`Course ${num} stub error:`, error.message)
  }
  console.log('✅ Placeholder stubs for courses 2–17 inserted')

  console.log('\n🎉 Seed complete!')
}

seed().catch(console.error)
