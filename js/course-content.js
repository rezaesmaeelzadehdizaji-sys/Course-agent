// ============================================================
// course-content.js — T-FLAWS Course Text Content
// T-FLAWS Assessment Management Tool
// Course 1 of 17 — Template for all subsequent courses
// ============================================================

export const courseContent = {
  meta: {
    title: "T-FLAWS – Assessment Management Tool",
    subtitle: "A Structured Flock Assessment Framework for Commercial Poultry Farmers in Canada",
    courseNumber: "Course 1 of 17",
    organization: "Canadian Poultry Training Series",
    date: "April 2026",
    version: "1.0",
    disclaimer:
      "This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature and industry management guides. Items marked [NEEDS SOURCE] require additional verification before publication.",
  },

  introduction: {
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
  },

  sections: [
    // ====================================================
    // T — TOES
    // ====================================================
    {
      id: "toes",
      letter: "T",
      title: "Toes",
      fullTitle: "T — Toes",
      subsections: {
        whatItIs: {
          heading: "What It Is",
          paragraphs: [
            "The Toes component of T-FLAWS encompasses the assessment of foot health, with a primary focus on footpad dermatitis (FPD), also known as pododermatitis or contact dermatitis of the plantar foot surface. FPD is a necrotic skin condition affecting the plantar surface (bottom) of the foot, characterized by discoloration, erosion, and — in severe cases — deep ulcerative lesions that penetrate through skin into underlying tissue (Shepherd & Fairchild, 2010).",
            "In addition to FPD, the Toes assessment includes evaluation of bumblefoot (plantar pododermatitis with secondary Staphylococcus aureus infection), curled toe syndrome, toe necrosis, and nail condition. Each condition has distinct etiology and management implications.",
            "FPD is scored on a standardized scale. The Welfare Quality® Assessment Protocol for Poultry uses a three-point scale: Score 0 — no lesion or very slight discoloration of skin; Score 1 — superficial lesion, discoloration, mild erosion; Score 2 — severe lesion, deep ulceration, necrosis, affecting more than one-third of the footpad surface (Welfare Quality®, 2009).",
          ],
        },
        whyItMatters: {
          heading: "Why It Matters",
          paragraphs: [
            "Footpad dermatitis is widely recognized as the primary animal welfare indicator used in commercial poultry audits across Canada and internationally. FPD prevalence and severity are included in the requirements of the Canadian Chicken Farmers' Animal Care Program and referenced in the NFACC Code of Practice (2016).",
            "Beyond welfare compliance, FPD has direct economic consequences. Feet are a marketable by-product of broiler processing in several markets. Grade 2 FPD lesions result in feet being downgraded or condemned at the processing plant, reducing revenue. Studies in Europe have quantified production losses attributable to severe FPD at several dollars per bird affected (Shepherd & Fairchild, 2010).",
            "FPD also serves as an environmental indicator. Its prevalence is directly and consistently correlated with litter moisture content, ammonia concentration at bird level, and stocking density (Ekstrand et al., 1997). A flock with elevated FPD scores is signaling a litter management problem that, left unaddressed, will worsen throughout the grow-out cycle.",
          ],
        },
        howToAssess: {
          heading: "How to Assess",
          paragraphs: [
            "Sample size: A minimum of 100 birds per barn should be examined in each formal T-FLAWS assessment. Birds should be selected randomly from multiple locations throughout the barn (minimum five locations, evenly distributed from end to end and side to side) to ensure the sample is representative of the entire flock.",
            "Procedure: Catch and lift each bird. Hold the bird securely in a vertical position with the feet accessible. Examine both feet. Score each foot individually using the 0–2 Welfare Quality® scale. Record the score for each foot separately. The footpad score for that bird is the higher of the two foot scores.",
            "Timing: FPD lesions develop over time. Meaningful assessment is typically possible from Day 21 onward in broiler flocks. Lesions that develop early (before Day 14) may indicate particularly acute litter or environmental problems and should be flagged for immediate investigation.",
            "Recording: Calculate the prevalence of each score category (% of feet scored 0, 1, or 2). The key metric for benchmarking and audit purposes is the prevalence of Score 2 lesions. Target: less than 5% of feet with Score 2 lesions (NFACC, 2016).",
          ],
        },
        abnormalFindings: {
          heading: "What Abnormal Findings Indicate",
          paragraphs: [
            "Score 1 FPD (mild, superficial): Indicates early-stage contact dermatitis. Typically reversible with prompt litter management intervention. If prevalence exceeds 20% of feet at Day 21 or later, consider this an early warning requiring immediate action.",
            "Score 2 FPD (severe, ulcerative): Indicates chronic or acute exposure to wet, high-ammonia litter conditions. Lesions at this stage cause pain and may impair the bird's ability to access feed and water. If more than 5% of feet have Score 2 lesions, a comprehensive litter and ventilation review is mandatory.",
            "Bumblefoot (swollen, firm nodule on footpad): Indicates secondary bacterial infection (commonly Staphylococcus aureus) typically following skin disruption. More common in heavier birds and in operations with rough or abrasive flooring surfaces.",
            "Curled toe paralysis: Toes that curl laterally or inward may indicate riboflavin (Vitamin B2) deficiency, with chicks most susceptible in the first two weeks of life. Can also result from incubation problems or genetic factors (Merck Veterinary Manual, 2022).",
            "Toe necrosis: Dark, desiccated toe tips, most commonly seen in young chicks, are often associated with high brooding temperature, dehydration, or in-ovo/hatchery issues. [NEEDS SOURCE]",
          ],
        },
        managementResponses: {
          heading: "Recommended Management Responses",
          paragraphs: [
            "Litter moisture management: Target litter moisture content below 25%. Litter moisture above 30% is strongly associated with FPD development. Reduce moisture by improving ventilation (increase minimum ventilation rates), repairing drinker leaks, and adjusting nipple drinker height and pressure. If litter is already wet, consider top-dressing with dry litter material or applying a licensed litter amendment.",
            "Ammonia control: Maintain ammonia levels below 25 ppm at bird level at all times (NFACC, 2016). Ammonia above this threshold causes respiratory irritation and also exacerbates FPD lesion severity. Increase air exchanges, ensure adequate fresh air intake even in cold weather, and consider approved litter treatment products if ammonia cannot be controlled by ventilation alone.",
            "Drinker management: Inspect all nipple drinker lines daily. Adjust nipple height so birds must reach slightly upward (approximately 45° angle for nipple drinker systems). Verify water pressure is within the manufacturer's specification — excessive pressure leads to dripping and wet litter.",
            "Nutritional considerations: Biotin (Vitamin B7) deficiency has been associated with increased FPD susceptibility. Ensure feed biotin levels meet or exceed breed-specific recommendations (typically 150–300 mcg/kg of complete feed). Consult your nutritionist before making dietary changes (Merck Veterinary Manual, 2022).",
            "Stocking density: Review stocking density relative to NFACC Code minimums. Reducing stocking density reduces litter contamination load and ammonia production, which directly reduces FPD risk (NFACC, 2016).",
          ],
          imagePlaceholder: {
            caption:
              "Figure 1. Footpad dermatitis scoring scale (Welfare Quality® 0–2 scale). Score 0: no lesion; Score 1: superficial erosion; Score 2: deep ulceration.",
            description:
              "Photograph illustrating three footpads side by side representing Score 0 (healthy, intact skin with no discoloration), Score 1 (mild discoloration and superficial surface erosion), and Score 2 (severe ulcerative lesion with necrotic tissue). Source: Welfare Quality® Assessment Protocol for Poultry (2009).",
          },
        },
      },
    },

    // ====================================================
    // F — FEATHERS
    // ====================================================
    {
      id: "feathers",
      letter: "F",
      title: "Feathers",
      fullTitle: "F — Feathers",
      subsections: {
        whatItIs: {
          heading: "What It Is",
          paragraphs: [
            "The Feathers component assesses plumage condition across the flock, evaluating feather coverage, integrity, and the presence of feather damage or loss. Plumage condition is scored by examining multiple body regions — typically breast, back, wings, tail, and neck — on a standardized scale from 0 (full, intact feather coverage) to 4 (large bare skin area) per region, as used in the LayWel and similar welfare assessment protocols.",
            "The assessment distinguishes between feather loss attributable to feather pecking (a behavioral cause), feather breakage or loss due to ectoparasite infestation, and developmental feathering abnormalities. Each has distinct management implications and must be differentiated during assessment.",
            "Feather pecking is the behavioral act of one bird pecking at the feathers of another. It ranges from gentle feather pecking (minor, does not damage feathers) to severe feather pecking (forceful, removes feathers, can break skin and lead to cannibalism). Severe feather pecking is one of the most significant behavioral welfare problems in laying hen production (Bilcik & Keeling, 1999).",
          ],
        },
        whyItMatters: {
          heading: "Why It Matters",
          paragraphs: [
            "Feather condition is directly linked to production efficiency. Feathers are the primary insulating layer for poultry. Birds with compromised feather coverage must expend more metabolic energy maintaining body temperature, reducing feed conversion efficiency. Studies have documented a feed conversion ratio (FCR) penalty of 5–15% in birds with significant feather loss, depending on ambient temperature and extent of bare skin area (Riber et al., 2018).",
            "In laying hen operations, feather pecking can escalate rapidly from feather damage to cannibalism, resulting in mortality and significant flock-level welfare deterioration. Once blood is drawn at a pecking site, other birds are attracted to the wound, and cannibalism can spread through a flock within hours. Feather pecking is therefore both a welfare indicator and a welfare risk that demands prompt intervention (Daigle, 2017).",
            "Feather quality is also an aesthetic and commercial consideration at processing. Birds presenting with incomplete feathering or extensive pin feathers at slaughter age can increase processing labor costs due to difficult defeathering and carcass preparation.",
          ],
        },
        howToAssess: {
          heading: "How to Assess",
          paragraphs: [
            "Sample size: A minimum of 50 birds per barn for feather scoring in broiler operations; at least 50 birds per house for layer operations, assessed from multiple cage rows or aviary zones as applicable.",
            "Procedure: Catch each bird and conduct a visual and manual examination of feather coverage across all body regions. Score each region on a 0–4 scale: 0 = full feather coverage, 1 = slight loss (<5 feathers missing), 2 = moderate loss (visible skin, <5 cm²), 3 = significant loss (bare area 5–10 cm²), 4 = severe loss (bare area >10 cm² or open wound).",
            "Distinguish the cause of feather loss: Feather pecking leaves a characteristic pattern — feathers pulled out at the base, with quills often present. Ectoparasite damage typically causes feather breakage rather than clean removal, and often shows a bilateral distribution. Developmental feathering issues present as slow feathering or uniformly poor feather development across the flock.",
            "Timing: Feather condition should be assessed at all scheduled T-FLAWS intervals in layer and breeder operations. In broiler operations, assessment from Day 21 onward is most informative as feathering is substantially complete by this age.",
          ],
        },
        abnormalFindings: {
          heading: "What Abnormal Findings Indicate",
          paragraphs: [
            "Feather loss concentrated on the back and vent area: Most consistent with feather pecking behavior. The vent region is the most common initial target for feather peckers. If this pattern is observed, examine the lighting program, stocking density, feed access, and nutritional adequacy immediately.",
            "Broken or frayed feathers across the flock (bilateral, symmetrical): Suggests ectoparasite pressure — most commonly northern fowl mite (Ornithonyssus sylviarum) in Canada, or red mite (Dermanyssus gallinae) in housing with persistent residual populations. Examine birds carefully at night (when red mite is active and visible) and inspect cracks and crevices in housing structures.",
            "Stress bars (fault bars): Horizontal, transverse lines of weakened feather structure visible across the feather vane. Indicate a systemic stress event (disease episode, nutritional deficiency, or severe environmental stressor) at the time the feather was developing. The location of stress bars on the feather can help estimate when the event occurred (Riber et al., 2018).",
            "Slow feathering or absent feathering in young chicks: May indicate riboflavin deficiency, or could reflect the sex-linked late-feathering gene in certain commercial layer lines (where slow feathering is a genetic trait used for sexing at hatch). Consult your nutritionist and genetics supplier.",
          ],
        },
        managementResponses: {
          heading: "Recommended Management Responses",
          paragraphs: [
            "Feather pecking — lighting: Reduce light intensity to levels below 10 lux for broiler operations; below 20 lux in layer systems where feasible. Avoid direct sunlight creating bright spots that attract birds and stimulate pecking behavior. Ensure lighting is uniform throughout the barn (coefficient of variation <20%) (NFACC, 2016).",
            "Feather pecking — enrichment and management: Provide environmental enrichment to redirect pecking behavior. Pecking blocks, hanging objects, and straw bales have demonstrated efficacy in reducing feather pecking in floor-housed systems. Ensure adequate feeder and drinker space to reduce competition at resources.",
            "Feather pecking — nutritional: Ensure dietary methionine and cysteine (sulfur-containing amino acids, SAA) levels meet or exceed breed recommendations. SAA deficiency has been associated with increased feather pecking. Consult your nutritionist if SAA levels are suspect (Merck Veterinary Manual, 2022).",
            "Ectoparasites: Implement an integrated pest management protocol. For northern fowl mite, treatment with approved acaricides applied directly to birds may be warranted. For red mite, housing sanitation between flocks and application of approved products to cracks, crevices, and structural elements is the primary control strategy. Fluralaner (Exzolt, MSD Animal Health) is a licensed in-water treatment for poultry red mite in Canada [NEEDS SOURCE — confirm Canadian licensing status].",
            "Stocking density review: If feather pecking is persistent and environmental modifications have not resolved the problem, review stocking density relative to NFACC Code maximums. Overcrowding is a significant risk factor for feather pecking and cannibalism (NFACC, 2016).",
          ],
          imagePlaceholder: {
            caption:
              "Figure 2. Feather condition scoring examples. Score 0: full, intact plumage; Score 2: moderate feather loss on the dorsal surface; Score 4: extensive bare skin with evidence of tissue damage.",
            description:
              "Photographs showing three hens illustrating the feather scoring scale: a hen with complete feather coverage on the back and wings (Score 0); a hen with a defined area of feather loss over the dorsal midline (Score 2); and a hen with a large bare area on the back and evidence of skin trauma (Score 4). Source: LayWel Welfare Assessment Protocol for Laying Hens.",
          },
        },
      },
    },

    // ====================================================
    // L — LEGS
    // ====================================================
    {
      id: "legs",
      letter: "L",
      title: "Legs",
      fullTitle: "L — Legs",
      subsections: {
        whatItIs: {
          heading: "What It Is",
          paragraphs: [
            "The Legs component assesses locomotion and structural leg health, using gait scoring as the primary tool. The Bristol Gait Scoring Scale (Kestin et al., 1992) is the most widely used and validated method in the industry: Score 0 — normal, no impairment; Score 1 — slight gait abnormality, minor difficulty; Score 2 — definite gait abnormality, noticeable difficulty walking; Score 3 — marked gait abnormality, the bird is reluctant to move; Score 4 — unable to walk without assistance; Score 5 — unable to walk.",
            "The Legs assessment also includes evaluation of hock burn (contact dermatitis at the hock joint), angular limb deformities (valgus — outward deviation, varus — inward deviation), tibial dyschondroplasia (TD — failure of the proximal tibial growth plate to ossify), spondylolisthesis (kinky back — vertebral compression causing posterior paresis), joint swelling (indicating septic arthritis, viral arthritis, or mycoplasma infection), and tendon rupture.",
            "Hock burn scoring follows the same 0–2 scale as footpad dermatitis and is assessed alongside gait scoring in the same bird examination.",
          ],
        },
        whyItMatters: {
          heading: "Why It Matters",
          paragraphs: [
            "Lameness is widely regarded as the single most significant welfare and production problem in commercial broiler production. A landmark study by Knowles et al. (2008) found that 27.6% of birds at slaughter age in commercial UK flocks had a gait score of 3 or above, indicating significant impairment. While Canadian prevalence data are not as comprehensively published, the same growth-rate-driven skeletal challenges apply to modern commercial broiler genetics.",
            "Birds with gait scores of 3 or above are in pain and are unable to access feed and water normally. Severely lame birds spend most of their time lying down, often on wet litter, which compounds leg health problems with FPD and hock burn (Merck Veterinary Manual, 2022). Lame birds also have significantly lower body weights at slaughter, directly reducing revenue.",
            "Leg health assessment is also an audit requirement under most Canadian processor welfare programs and NFACC-aligned welfare assessments. Gait scoring results at processing provide feedback to farms on the severity and prevalence of leg problems — but this information comes too late in the cycle to allow in-cycle intervention. The T-FLAWS in-barn assessment gives producers actionable data while they can still make a difference.",
          ],
        },
        howToAssess: {
          heading: "How to Assess",
          paragraphs: [
            "Sample size: A minimum of 150 birds per barn for gait scoring. Gait assessment requires observing birds walking, which means birds must not be caught — they must be observed undisturbed on the barn floor.",
            "Procedure (Gait): Walk slowly down the barn, disturbing birds as little as possible and observing their gait as they move away. Score birds as you observe them walking. Focus on the bird's ability to walk in a straight line, weight-bearing symmetry, and any stumbling, hesitation, or falling. Record the score for each bird observed. After gait scoring, catch a representative subset (minimum 30 birds) for hock burn examination and physical leg assessment.",
            "Procedure (Hock burn): With the bird restrained, examine the hock joint area on both legs. Score on the 0–2 FPD scale: 0 = no lesion; 1 = superficial discoloration; 2 = deep ulcerative lesion.",
            "Post-mortem assessment: At depopulation or during planned mortality removal, examine the tibiae of lame or dead birds for TD lesions (a characteristic white, cartilaginous plug in the proximal tibial growth plate). This provides diagnostic information complementary to in-barn gait scoring.",
            "Timing: Gait scoring is most meaningful from Day 28 onward in broiler operations, when birds are large enough for gait abnormalities to be reliably scored. Earlier assessment at Day 14–21 is useful for detecting angular limb deformities.",
          ],
        },
        abnormalFindings: {
          heading: "What Abnormal Findings Indicate",
          paragraphs: [
            "Gait score 3 or above in more than 5% of observed birds: Indicates a significant lameness problem requiring immediate investigation. This prevalence trigger is commonly used in welfare audit programs (Knowles et al., 2008). Investigate growth rate management, lighting program, floor surface, and nutritional status.",
            "Hock burn prevalence above 5% (Score 2): Indicates wet litter or inadequate bedding in the hock contact area. Often occurs together with elevated FPD scores, as both reflect the same underlying litter moisture problem.",
            "Valgus or varus deformity (angular limb deviation): Bilateral presentation suggests a nutritional or genetic component. Unilateral presentation may indicate injury or developmental asymmetry. Rapid growth rate is the primary predisposing factor. Most commonly observed between Days 14–28.",
            "Tibial dyschondroplasia (identified post-mortem): A failure of the proximal tibial growth plate to ossify, resulting in a white cartilaginous plug. Associated with rapid growth, nutritional imbalances (calcium:phosphorus ratio, Vitamin D3), and certain mycotoxin exposures (Merck Veterinary Manual, 2022).",
            "Swollen joints (hot, fluid-filled, unilateral): Suggests septic arthritis (bacterial — often Staphylococcus or Enterococcus) or viral arthritis (Reovirus). Submit affected birds for veterinary diagnosis. [NEEDS SOURCE — confirm current Canadian Reovirus prevalence data]",
          ],
        },
        managementResponses: {
          heading: "Recommended Management Responses",
          paragraphs: [
            "Lighting program: Implement a lighting program that provides a minimum of 6 consecutive hours of darkness per day throughout the grow-out, as required by NFACC (2016). Periods of darkness are associated with reduced activity intensity and allow skeletal development to better keep pace with muscle growth. Review your current lighting program against the breed manual specifications (Aviagen, 2022; Cobb-Vantress, 2021).",
            "Floor and bedding management: Ensure bedding depth is at least 5 cm at placement. Monitor and maintain bedding quality throughout the cycle. Wet, compacted, or absent bedding is a significant risk factor for leg problems. Consider rubber mats near drinker lines if localized wetness is a recurring issue.",
            "Nutrition: Verify calcium and phosphorus levels in the diet meet breed specifications. Ensure the calcium:available phosphorus ratio is within the recommended range. Confirm Vitamin D3 levels are adequate. If TD is diagnosed post-mortem, consult your nutritionist for a feed review.",
            "Growth rate management: Discuss alternative lighting programs or controlled feeding strategies with your veterinarian and nutritionist if leg problems are recurring across flocks. Some producers in Canada are successfully using welfare-improved genetics with slower growth trajectories to reduce leg problem prevalence [NEEDS SOURCE].",
            "Stocking density: Reducing stocking density reduces the physical load on the barn floor surface and litter, indirectly benefiting leg health and hock burn outcomes (NFACC, 2016).",
          ],
          imagePlaceholder: {
            caption:
              "Figure 3. Bristol Gait Scoring Scale (0–5). Score 0: normal locomotion; Score 2: definite gait impairment; Score 4: bird unable to walk without support.",
            description:
              "Photographic series showing broiler chickens demonstrating each gait score level from 0 to 5. Score 0 shows a bird walking normally with fluid, balanced movement. Score 2 shows a bird with visible difficulty maintaining balance. Score 4 shows a bird that can only move by using its wings for support. Score 5 shows a bird in lateral recumbency, unable to rise. Source: Adapted from Kestin et al. (1992), Veterinary Record.",
          },
        },
      },
    },

    // ====================================================
    // A — ACTIVITY
    // ====================================================
    {
      id: "activity",
      letter: "A",
      title: "Activity",
      fullTitle: "A — Activity",
      subsections: {
        whatItIs: {
          heading: "What It Is",
          paragraphs: [
            "The Activity component assesses the behavioral status of the flock — what proportion of birds are engaged in different behaviors at the time of observation, how birds are distributed throughout the barn, and the quality of the flock's response to human presence. Activity is a composite welfare indicator that reflects the cumulative effect of environmental quality, health status, nutritional adequacy, and management practices.",
            "Key behavioral measures include: flock distribution (even versus clustered), feeding behavior (proportion at feeders), drinking behavior (proportion at drinkers), resting (standing versus lying), preening and dustbathing activity, and fear response (flight distance — the distance at which birds move away from an approaching observer).",
            "Activity monitoring is increasingly being integrated into precision livestock farming (PLF) systems that use cameras, microphones, or floor-level sensors to continuously monitor behavioral indicators. However, the foundational T-FLAWS Activity assessment is based on direct observation by a trained assessor, which remains the practical standard for most Canadian operations.",
          ],
        },
        whyItMatters: {
          heading: "Why It Matters",
          paragraphs: [
            "Flock activity patterns are highly sensitive to environmental and health changes, often showing measurable shifts before clinical signs of disease or production loss are apparent. Research has demonstrated that changes in feeding behavior, measured by automatic feed pan weight sensors, precede clinical diagnosis of several common poultry diseases by 24–48 hours (Dawkins et al., 2004). While most farms do not have automated feed monitoring, attentive observation during daily walk-throughs can detect similar behavioral changes.",
            "Activity also directly reflects pain and discomfort. Lame birds spend significantly more time lying down; birds in pain from respiratory disease reduce feeding and social behavior. Reduced activity in a significant proportion of the flock during the active (light) period is therefore both a welfare concern and a production signal.",
            "Flock distribution patterns reflect environmental gradients within the barn. Birds cluster toward areas with preferred temperature, light intensity, air quality, and resource access. An uneven distribution signals an environmental problem that, if not corrected, will result in uneven growth across the barn and increased welfare risks for birds in suboptimal zones (EFSA, 2012).",
          ],
        },
        howToAssess: {
          heading: "How to Assess",
          paragraphs: [
            "Preparation: Before entering the barn, pause at the door for 2 minutes. Observe from the doorway without disturbing the flock. Note the proportion of birds that are standing, walking, or lying, and the distribution pattern across the visible floor area.",
            "Distribution scoring: Score flock distribution on a 3-point scale: 1 = evenly distributed (birds spread uniformly across the barn floor); 2 = moderately uneven distribution (some clustering, but birds present throughout the barn); 3 = severely uneven distribution (large areas devoid of birds, dense clustering in specific zones).",
            "Fear response (flight distance): Walk slowly down the center of the barn at a consistent, non-threatening pace. Measure the distance (in meters) at which birds begin to move away from you. A flight distance of 1 meter or less indicates well-habituated birds with good human-animal interaction. A flight distance above 2 meters suggests inadequate human contact or a recent fear-provoking event.",
            "Behavioral time budget: Observe 100 birds from a fixed observation point for 5 minutes. Record the behavior of each bird at 1-minute intervals (standing, walking, feeding, drinking, resting, preening, or other). Calculate the percentage of birds engaged in each behavior at each interval.",
            "Conduct assessments at consistent times of day (at least once in the first third of the light period and once in the middle of the light period) to capture both active and rest periods.",
          ],
        },
        abnormalFindings: {
          heading: "What Abnormal Findings Indicate",
          paragraphs: [
            "Clustering near heat sources (brooders, walls, corners): Temperature management failure. If birds are piling near brooders, ambient temperature is below the comfort zone. If birds cluster near walls and avoid the center, a cold zone or draft is present at floor level. If birds crowd away from one end of the barn, verify heater function in that zone.",
            "Clustering away from walls, birds congregated in the center: Overheating at the barn perimeter or, in summer, inadequate tunnel ventilation. Also seen with predator disturbance (birds pack toward the center away from walls with perceived predator access).",
            "More than 70% of birds resting during the active light period: Suggests pain, illness, or poor environmental quality. Investigate air quality (ammonia >25 ppm, CO₂ >3,000 ppm, O₂ <19.6%) as a priority. Also consider presence of a subclinical disease challenge.",
            "High flight distance (>2 meters): Indicates inadequate human habituation. Increase the frequency and duration of barn walks. Birds with high fear responses are harder to handle during vaccination, thinning, and depopulation, with associated welfare and production consequences (Jones, 1996).",
            "Piling behavior: Birds piling on top of each other indicates a panic response — most often triggered by sudden loud noise, unexpected light changes (flickering or failure), predator access, or a vehicle collision with the building. Investigate the trigger and implement corrective measures. Piling can result in significant mortalities from crushing.",
          ],
        },
        managementResponses: {
          heading: "Recommended Management Responses",
          paragraphs: [
            "Temperature management: If distribution problems are detected, systematically measure temperature at multiple points at bird level (30 cm above floor) across the barn. Map the temperature distribution and identify cold or hot zones. Adjust heater placement, ventilation baffles, or curtains as needed to achieve temperature uniformity within ±2°C across the barn.",
            "Ventilation and air quality: Measure ammonia and CO₂ at bird level. If ammonia exceeds 10 ppm at nose level (25 ppm at bird level), increase minimum ventilation rate immediately. Consult your ventilation program and compare current settings to the breed-specific environmental guidelines (Aviagen, 2022).",
            "Human habituation: Increase the frequency of calm, slow barn walk-throughs. Habituated birds are associated with better welfare outcomes and lower handling stress. Avoid sudden movements, loud noise, or running in the barn.",
            "Lighting uniformity: Measure light intensity at multiple points across the barn floor. If variation exceeds 20% (coefficient of variation), reposition or replace bulbs to achieve uniform light distribution. Uneven lighting creates preferred zones that concentrate birds and resources, increasing competition and reducing overall flock performance.",
            "Behavioral investigation: If a sudden change in flock activity is observed without an obvious environmental explanation, immediately review mortality levels and submit fresh dead birds for post-mortem examination. Behavioral change is often the first detectable sign of an emerging disease challenge.",
          ],
          imagePlaceholder: {
            caption:
              "Figure 4. Flock distribution patterns — normal (even) versus abnormal (clustered). Left: uniform distribution across barn floor indicates good environmental conditions. Right: clustering pattern suggests a temperature, light, or air quality gradient.",
            description:
              "Two aerial photographs of broiler barns taken from the same vantage point. The first shows birds distributed evenly across the entire barn floor with no visible clustering (normal). The second shows birds densely packed in the center of the barn with large open areas along the walls, indicating a cold perimeter or thermal comfort issue. Source: Adapted from Aviagen Environmental Management Supplement (2022).",
          },
        },
      },
    },

    // ====================================================
    // W — WEIGHT
    // ====================================================
    {
      id: "weight",
      letter: "W",
      title: "Weight",
      fullTitle: "W — Weight",
      subsections: {
        whatItIs: {
          heading: "What It Is",
          paragraphs: [
            "The Weight component assesses body weight and uniformity across the flock. It encompasses individual bird weights, flock average body weight, weight uniformity (expressed as coefficient of variation, CV%), comparison to breed-standard growth curves, and body condition scoring. For younger chicks, crop fill assessment at 24 and 48 hours post-placement is an important supplementary measure.",
            "Body weight is measured using calibrated hanging scales or digital platform scales. The coefficient of variation (CV%) is the standard metric for uniformity: CV = (Standard Deviation ÷ Mean Body Weight) × 100. A lower CV% indicates a more uniform flock. Target CV% for broilers is below 10% at all assessment ages. For layer pullets approaching point of lay, a CV% below 8% is the target to ensure synchronous onset of lay (Lohmann Tierzucht, 2021).",
            "Breed-standard growth curves are published by the genetics companies (Aviagen for Ross breeds, Cobb-Vantress for Cobb breeds, Lohmann for Lohmann layer breeds) and are available as downloadable performance guides. These curves represent the expected average body weight at each age under optimal management conditions and are the primary benchmark for evaluating flock growth trajectory.",
          ],
        },
        whyItMatters: {
          heading: "Why It Matters",
          paragraphs: [
            "Body weight is the primary key performance indicator (KPI) for commercial broiler production. It directly determines revenue per bird and drives the calculation of feed conversion ratio (FCR) — the single most important measure of production efficiency. Deviations from the breed-standard growth curve, even of modest magnitude, have compounding effects on final weight and profitability (Zuidhof et al., 2014).",
            "Weight uniformity affects processing efficiency. A flock with high CV% at harvest produces birds with a wide range of carcass weights, making it difficult to hit target product specifications. Processors frequently apply financial penalties for loads with excessive uniformity variation. Uniformity also affects layer performance: flocks with poor uniformity at point of lay have a flattened, extended laying curve with lower peak production compared to uniform flocks (Lohmann Tierzucht, 2021).",
            "Crop fill at 24 hours post-chick placement is a critical early indicator of placement quality. A well-managed placement results in more than 95% of chicks having a full, soft crop within 24 hours of placement, indicating that chicks found feed and water promptly. Poor crop fill is associated with early growth setbacks that may not be fully recovered during the grow-out period.",
          ],
        },
        howToAssess: {
          heading: "How to Assess",
          paragraphs: [
            "Sample size: Weigh a minimum of 100 birds per barn at each assessment. Select birds randomly from at least five locations distributed across the length and width of the barn. Do not select birds based on their apparent size — random selection is essential for an accurate estimate of flock mean and uniformity.",
            "Procedure: Weigh each bird individually using a calibrated scale. Record each weight. After weighing all sampled birds, calculate the mean weight, standard deviation, and CV%: CV% = (SD ÷ Mean) × 100. Compare mean weight to the breed-standard curve for the assessment age.",
            "Crop fill assessment (Day 1 chicks): At 24 hours post-placement, catch and gently palpate the crop of a minimum of 50 chicks. Score each crop: Full (soft, well-filled, easy to detect); Partially filled (slightly firm, not completely full); Empty (flat, no feed palpable). Target: >95% of chicks with full crops at 24 hours.",
            "Assessment frequency: Weigh birds weekly from Day 7 onward. Plot the weekly mean weights against the breed-standard curve to visually identify growth deviations early. Maintain consistent assessment days each week to allow valid comparison across assessments.",
          ],
        },
        abnormalFindings: {
          heading: "What Abnormal Findings Indicate",
          paragraphs: [
            "Flock mean weight more than 10% below breed standard at any assessment age: A significant growth deficit. Investigate feed quality (have the current feed batch tested), water availability and flow rates, air quality, and disease pressure. Notify your veterinarian if the deficit is accompanied by elevated mortality or clinical signs.",
            "CV% above 12% at any assessment age (broilers): Indicates poor flock uniformity. Common causes include: uneven feeder and drinker distribution or equipment malfunction creating resource competition; environmental gradients (temperature, air quality) forcing some birds to preferential zones; subclinical disease affecting a subset of the flock; and social competition in groups with excessively large density.",
            "Bimodal weight distribution (two distinct weight peaks when data is graphed): Indicates two identifiable subpopulations within the flock — likely 'winners' and 'losers' in competition for feed and water. This pattern warrants immediate investigation of resource access and may require practical sorting (grading) in operations where that is feasible.",
            "Poor crop fill at 24 hours (<90% full crops): Indicates placement conditions were inadequate. Common causes: temperature too low for newly placed chicks (chicks seek warmth instead of feed); feed or water not accessible in the placement zone (feeders or drinkers too far from where chicks were placed, or equipment not activated); chicks stressed during transport (Aviagen, 2022).",
          ],
        },
        managementResponses: {
          heading: "Recommended Management Responses",
          paragraphs: [
            "If below breed-standard weight: First, verify scale calibration and sampling protocol before assuming a true growth problem. If the deficit is confirmed, systematically investigate feed delivery (flow rates, pan fill levels), water delivery (flow rates, pressure), air quality, and health status. Have the current feed lot tested for nutrient analysis if other causes are not identified.",
            "Improving uniformity: If CV% is elevated, audit feeder and drinker placement and function. Ensure every bird has access to a feeder within 3 meters (maximum). Check that all feeders are delivering at the same fill level and at equal intervals. Verify water flow rates are uniform across all drinker lines. Identify and correct any environmental gradients.",
            "Poor crop fill: If crop fill at 24 hours is below target, verify brooding temperature at chick level (25–30°C range at placement), check that supplemental feeders (crumble trays or paper sheets) are positioned within 30 cm of all birds at placement, verify water flow rate in drinker lines, and confirm chick placement temperature in the transport vehicle.",
            "Nutrition review: If growth lag persists despite adequate environmental conditions, consult your nutritionist. Energy density, amino acid balance, and digestibility of the current feed formulation should be reviewed. Also consider whether the current vaccination or medication program is suppressing intake (Cobb-Vantress, 2021).",
          ],
          imagePlaceholder: {
            caption:
              "Figure 5. Body weight distribution histogram illustrating the difference between a uniform flock (narrow, bell-shaped distribution; CV = 7%) and a non-uniform flock (wide, flat or bimodal distribution; CV = 18%).",
            description:
              "Two side-by-side histograms showing body weight frequency distributions for the same breed at Day 35. The left histogram shows a tight, normally distributed bell curve centered near the breed standard mean, with a CV of approximately 7%. The right histogram shows a wide, flat distribution with two peaks, indicating poor uniformity (CV approximately 18%). The breed-standard target weight is indicated by a vertical dashed line on both graphs. Source: Adapted from Aviagen Ross 308 Performance Objectives (2022).",
          },
        },
      },
    },

    // ====================================================
    // S — SKIN
    // ====================================================
    {
      id: "skin",
      letter: "S",
      title: "Skin",
      fullTitle: "S — Skin",
      subsections: {
        whatItIs: {
          heading: "What It Is",
          paragraphs: [
            "The Skin component assesses the integrity and condition of the bird's integument beyond the foot (which is addressed under Toes) and hock (addressed under Legs). The primary conditions assessed are cellulitis (subcutaneous inflammation), breast blisters (sternal bursitis), contact dermatitis at the breast and hock, ammonia burns on ventral skin surfaces, skin color abnormalities (cyanosis, jaundice, pallor), subcutaneous hemorrhage, and traumatic skin injuries including scratches and tears.",
            "Cellulitis, also known as necrotic dermatitis or clostridial dermatitis when Clostridium septicum is involved, is a severe inflammatory condition of the subcutaneous tissues, characterized by serosanguineous fluid and fibrinous exudate beneath the skin, typically on the ventral surface, thighs, and breast. It is a leading cause of condemnation at Canadian processing plants (Elfadil et al., 1996; CFIA, 2019).",
            "Breast blisters (sternal bursitis) are fluid-filled swellings over the keel bone, caused by chronic pressure and friction between the breast and litter surface. They are most common in heavy broilers during the final weeks of grow-out and in broiler breeders.",
          ],
        },
        whyItMatters: {
          heading: "Why It Matters",
          paragraphs: [
            "Skin condition is the most direct indicator of processing plant condemnation risk. Cellulitis is the primary cause of total carcass condemnation in Canadian broiler processing plants, representing significant economic loss for producers (Elfadil et al., 1996). Unlike partial condemnations (which affect individual parts), a whole-bird condemnation means zero revenue from that bird.",
            "Breast blisters and skin lesions downgrade carcass value even when they do not result in condemnation. Grade B or condemned portions reduce the average value per bird processed and can result in processor incentive penalties.",
            "Skin condition also reflects the quality of bird handling throughout the production cycle. Scratches and skin tears inflicted during catching and loading are directly associated with cellulitis development — the break in skin integrity allows environmental bacteria (particularly Escherichia coli and Staphylococcus aureus) to colonize subcutaneous tissues. Catching quality is therefore a critical control point for cellulitis prevention (Opengart, 2008).",
          ],
        },
        howToAssess: {
          heading: "How to Assess",
          paragraphs: [
            "In-barn assessment: During scheduled weighing or routine handling, flip birds and examine the ventral surface (breast, abdomen, and thigh area). Score each bird for: breast blister presence and size (absent, small <2 cm, large >2 cm); skin scratches or tears (absent, present — localized, present — extensive); discoloration (normal, pale, cyanotic, icteric/yellow-green).",
            "Breast blister palpation: Gently palpate the keel bone area. A breast blister presents as a soft, fluctuant swelling over the sternum. Large blisters may be visible without palpation. Note the size and whether the blister is intact or ruptured.",
            "Skin color assessment: Examine the wattle, comb (in layers and breeders), and unfeathered ventral skin for color abnormalities. Cyanosis (blue-purple discoloration) indicates cardiovascular or respiratory compromise. Jaundice (yellow-green, icteric coloration of unfeathered skin) indicates hepatic disease or certain systemic infections.",
            "Processing plant feedback: Request condemnation data by category from your processor at every kill. Analyze cellulitis condemnation rates and compare to your in-barn skin assessment results and management records. This feedback loop is one of the most valuable tools available for identifying and correcting skin health problems.",
          ],
        },
        abnormalFindings: {
          heading: "What Abnormal Findings Indicate",
          paragraphs: [
            "Cellulitis (subcutaneous inflammation with fluid/fibrinous exudate on inspection or post-mortem): Indicates bacterial infection of the subcutaneous space. The most common entry route is a scratch or skin break. Primary pathogens include Escherichia coli (most common), Staphylococcus aureus, and Clostridium septicum (Opengart, 2008). Elevated cellulitis prevalence in a flock should trigger review of catching procedures, stocking density, feeder and drinker design, and E. coli vaccination program.",
            "Breast blisters in more than 5% of birds: Indicates prolonged contact between breast and litter. Most commonly seen in the final third of a long grow-out cycle, in heavy birds with rapid growth, and in flocks with poor gait scores (lame birds spend more time lying on their breast). Litter quality and gait health are the primary management targets.",
            "Ammonia burns (reddened, inflamed ventral skin over breast and abdomen in contact with litter): Indicates prolonged exposure to high-ammonia, wet litter conditions. Litter moisture above 35% and ammonia above 25 ppm at bird level are strongly associated with this condition.",
            "Cyanosis: Indicates reduced oxygen delivery — consider right-sided heart failure (ascites/Pulmonary Hypertension Syndrome in fast-growing broilers), respiratory disease (infectious bronchitis, Newcastle disease, mycoplasmosis), or poor ventilation (high CO₂, low O₂). Cyanotic birds should be flagged for immediate veterinary attention.",
            "Jaundice (icterus): Associated with hepatic disease — Marek's disease (liver tumors), inclusion body hepatitis (Fowl adenovirus), or aflatoxicosis from contaminated feed. Submit affected birds for histopathology and toxicology testing.",
          ],
        },
        managementResponses: {
          heading: "Recommended Management Responses",
          paragraphs: [
            "Cellulitis prevention: The most effective prevention strategy is minimizing skin breaks. Review catching and loading procedures — well-trained catching crews using proper technique significantly reduce catch-related scratches. Ensure all sharp or abrasive surfaces inside the barn (equipment, rough flooring edges, exposed wire) are eliminated. Review feeder pan design for sharp edges. Consider E. coli vaccination programs: Poulvac E. coli (Zoetis) is a licensed product in Canada that has demonstrated efficacy in reducing cellulitis condemnation rates in broilers (Zoetis, 2021).",
            "Breast blister management: Improve litter quality (drier litter reduces duration and severity of contact). Identify and reduce the proportion of lame birds (gait score 3+ birds spend more time in sternal recumbency). In broiler breeders, ensure perch access so birds do not spend extended time in sternal recumbency on the litter.",
            "Ammonia and litter burn: Implement litter management protocol as described in the Toes section. Target litter moisture below 25% and ammonia below 10 ppm at nose level for all birds throughout the grow-out.",
            "Skin color abnormalities: Cyanosis or jaundice affecting more than an isolated individual bird constitutes an emergency requiring same-day contact with your poultry veterinarian. Collect fresh dead birds (chilled, not frozen) for post-mortem examination and diagnostic laboratory submission.",
            "Processing feedback utilization: When condemnation data is received from the processor, compare cellulitis and blister condemnation rates to the assessment data collected in-barn during the same flock. Use this correlation to refine your in-barn assessment protocol and identify which in-barn observations most accurately predict condemnation outcomes for your operation.",
          ],
          imagePlaceholder: {
            caption:
              "Figure 6. Skin condition examples. Left: cellulitis lesion on the ventral thigh area (fibrinous exudate visible on cross-section at post-mortem). Centre: sternal bursitis (breast blister) over the keel bone. Right: contact dermatitis (ammonia burn) on the breast and abdomen.",
            description:
              "Three photographs illustrating distinct skin conditions in commercial broiler chickens. The first shows a ventral view of a broiler carcass with a cellulitis lesion visible as a yellow, fibrinous plaque on the thigh and abdominal area. The second shows a close-up of a sternal blister — a fluctuant, fluid-filled swelling over the keel bone. The third shows reddened, inflamed skin on the ventral breast area of a live bird, characteristic of ammonia-contact dermatitis. Sources: Opengart (2008); Elfadil et al. (1996).",
          },
        },
      },
    },
  ],

  journalSection: {
    title: "Recommended Peer-Reviewed Journals and Resources",
    intro:
      "The following peer-reviewed journals represent the primary scientific literature base for poultry health, welfare, and production research. Producers, advisors, and veterinarians seeking to access current evidence on topics covered in this course are encouraged to search these publications. Most are accessible through university library systems; some provide open-access options for selected articles.",
    journals: [
      {
        name: "Poultry Science",
        publisher: "Oxford University Press (on behalf of Poultry Science Association)",
        scope:
          "Peer-reviewed research on all aspects of poultry production, health, nutrition, genetics, and processing. The flagship journal of the Poultry Science Association.",
        issn: "0032-5791",
      },
      {
        name: "Avian Diseases",
        publisher: "American Association of Avian Pathologists (AAAP)",
        scope:
          "Peer-reviewed research focused on avian diseases, with emphasis on diagnostic pathology, infectious disease, and immunology.",
        issn: "0005-2086",
      },
      {
        name: "World's Poultry Science Journal",
        publisher: "Taylor & Francis (on behalf of World's Poultry Science Association)",
        scope:
          "Review articles, original research, and commentary on international poultry science covering production, nutrition, genetics, health, and welfare.",
        issn: "0043-9339",
      },
      {
        name: "British Poultry Science",
        publisher: "Taylor & Francis",
        scope:
          "Peer-reviewed research with a focus on European poultry production systems, genetics, nutrition, and welfare.",
        issn: "0007-1668",
      },
      {
        name: "Journal of Applied Poultry Research",
        publisher: "Oxford University Press (on behalf of Poultry Science Association)",
        scope:
          "Applied research directly relevant to commercial poultry production, including management, environment, processing, and economics.",
        issn: "1056-6171",
      },
      {
        name: "Avian Pathology",
        publisher: "Taylor & Francis (on behalf of Houghton Poultry Research Station)",
        scope:
          "Peer-reviewed research on avian diseases, diagnostics, pathology, and immunology.",
        issn: "0307-9457",
      },
      {
        name: "Animal Welfare",
        publisher: "UFAW (Universities Federation for Animal Welfare)",
        scope:
          "Peer-reviewed research on animal welfare science, policy, and practice across all species, including poultry.",
        issn: "0962-7286",
      },
      {
        name: "Applied Animal Behaviour Science",
        publisher: "Elsevier",
        scope:
          "Peer-reviewed research on the behavior of domestic and laboratory animals, with strong coverage of poultry behavioral welfare.",
        issn: "0168-1591",
      },
      {
        name: "Canadian Veterinary Journal",
        publisher: "Canadian Veterinary Medical Association (CVMA)",
        scope:
          "Peer-reviewed clinical and research articles relevant to veterinary practice in Canada, including poultry medicine.",
        issn: "0008-5286",
      },
      {
        name: "Veterinary Record",
        publisher: "BMJ Publishing Group (on behalf of BVA)",
        scope:
          "Leading UK veterinary journal with broad coverage of clinical findings, case reports, and research across all species.",
        issn: "0042-4900",
      },
    ],
    institutionalResources: [
      "National Farm Animal Care Council (NFACC) — Codes of Practice: www.nfacc.ca",
      "Canadian Food Inspection Agency (CFIA) — Meat Hygiene and Animal Welfare: www.inspection.gc.ca",
      "Aviagen Technical Resources — Ross Breed Manuals: www.aviagen.com",
      "Cobb-Vantress Technical Resources — Cobb Breed Manuals: www.cobb-vantress.com",
      "Lohmann Tierzucht — Layer Breed Guides: www.lohmann-tierzucht.com",
      "Merck Veterinary Manual — Poultry Section: www.merckvetmanual.com/poultry",
      "Welfare Quality® Assessment Protocols: www.welfarequalitynetwork.net",
    ],
  },
};
