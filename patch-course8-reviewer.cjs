// patch-course8-reviewer.cjs
// Addresses Course 8 reviewer comments by directly patching Vaccination_draft.docx XML.
// Run: node patch-course8-reviewer.cjs
const JSZip = require('jszip');
const fs = require('path') && require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ---- run / paragraph builders (match existing body style) ----
const r  = (t) => `<w:r><w:t xml:space="preserve">${esc(t)}</w:t></w:r>`;
const rb = (t) => `<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r>`;
const ri = (t) => `<w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r>`;
const P  = (...runs) => `<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>${runs.join('')}</w:p>`;
const H2 = (t) => `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`;
const SPACER = `<w:p><w:pPr><w:spacing w:before="80" w:after="0"/></w:pPr></w:p>`;

// ---- table builder (matches existing Table 1.1 markup) ----
const CELL_BORDERS = '<w:tcBorders><w:top w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:left w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:bottom w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:right w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/></w:tcBorders>';
const TBL_PR = '<w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders><w:tblCellMar><w:left w:w="60" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>';

function cellRun(seg){ // seg = {t, i?:bool}
  const it = seg.i ? '<w:i/><w:iCs/>' : '';
  return `<w:r><w:rPr>${it}<w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">${esc(seg.t)}</w:t></w:r>`;
}
function hdrCell(w, t){
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${CELL_BORDERS}<w:shd w:val="solid" w:color="2E74B5" w:fill="auto"/></w:tcPr><w:p><w:pPr><w:spacing w:before="60" w:after="60"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="FFFFFF"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p></w:tc>`;
}
function dataCell(w, segs, shade, center){
  const shd = shade ? 'EBF2FA' : 'FFFFFF';
  const jc = center ? '<w:jc w:val="center"/>' : '';
  const runs = (Array.isArray(segs)?segs:[{t:segs}]).map(cellRun).join('');
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${CELL_BORDERS}<w:shd w:val="solid" w:color="${shd}" w:fill="auto"/></w:tcPr><w:p><w:pPr><w:spacing w:before="50" w:after="50"/>${jc}</w:pPr>${runs}</w:p></w:tc>`;
}
function buildTable(cols, headers, rows, opts){
  opts = opts || {};
  const centerCols = opts.centerCols || []; // array of col indices centered
  const grid = `<w:tblGrid>${cols.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`;
  const headRow = `<w:tr><w:trPr><w:tblHeader/></w:trPr>${headers.map((h,i)=>hdrCell(cols[i],h)).join('')}</w:tr>`;
  const dataRows = rows.map((row,ri2)=>`<w:tr>${row.map((cell,ci)=>dataCell(cols[ci],cell,ri2%2===1,centerCols.indexOf(ci)>=0)).join('')}</w:tr>`).join('');
  return `<w:tbl>${TBL_PR}${grid}${headRow}${dataRows}</w:tbl>`;
}

// ---------------------------------------------------------------
(async () => {
  if (!fs.existsSync(SRC)) throw new Error('Source not found: ' + SRC);
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');
  const log = [];

  // helper: exact whole-string replace, assert exactly one occurrence
  function replaceOnce(find, repl, label){
    const n = xml.split(find).length - 1;
    if (n !== 1) throw new Error(`[${label}] expected 1 match, found ${n}`);
    xml = xml.replace(find, () => repl);
    log.push(`OK replaceOnce: ${label}`);
  }
  function replaceAll(find, repl, label){
    const n = xml.split(find).length - 1;
    if (n < 1) throw new Error(`[${label}] expected >=1 match, found ${n}`);
    xml = xml.split(find).join(repl);
    log.push(`OK replaceAll(${n}): ${label}`);
  }
  function insertBeforePara(marker, block, label){
    const mi = xml.indexOf(marker);
    if (mi < 0) throw new Error(`[${label}] marker not found`);
    const re = /<w:p[ >]/g; let last = -1, m;
    while ((m = re.exec(xml)) && m.index < mi) last = m.index;
    if (last < 0) throw new Error(`[${label}] no paragraph opener before marker`);
    xml = xml.slice(0, last) + block + xml.slice(last);
    log.push(`OK insertBeforePara: ${label}`);
  }
  function insertAfterPara(marker, block, label){
    const mi = xml.indexOf(marker);
    if (mi < 0) throw new Error(`[${label}] marker not found`);
    const ci = xml.indexOf('</w:p>', mi);
    if (ci < 0) throw new Error(`[${label}] no </w:p> after marker`);
    const at = ci + '</w:p>'.length;
    xml = xml.slice(0, at) + block + xml.slice(at);
    log.push(`OK insertAfterPara: ${label}`);
  }

  // ============================================================
  // (1) INTRO THEME: "Vaccination is not equal to Immunity"
  // ============================================================
  const themePara = P(
    rb('Vaccination is not the same thing as immunity. '),
    r("That one idea runs through this whole course. Giving the vaccine is the action you take. Immunity is the result you are after, and it only shows up when the bird's own immune system answers that vaccine and builds protection. A vial can be opened, the dose can go in, and the records can say the flock was done, while the birds still carry almost no protection. Everything that follows is about closing that gap: turning the act of vaccinating into real immunity in the flock.")
  );
  insertBeforePara('Every vaccine you give a bird is only as good', themePara, 'intro-theme');

  // ============================================================
  // (2+3) IMMUNOLOGY FOUNDATION: passive/active, antibody table, live/killed, antigen specificity
  // ============================================================
  // Replace para [78] (innate/trained) with H2 primer + passive/active + two-arms
  const old78 = `<w:p w14:paraId="1B675DA0" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>How the avian immune system responds to vaccines.</w:t></w:r><w:r><w:t xml:space="preserve"> A bird's immune system has two layers that work together [2]. The first is present from hatch and responds immediately to any threat, without recognizing what it is. The second is the trained layer: it learns from vaccination or infection and builds a specific response that is faster and stronger the next time the bird meets that pathogen. That second layer is what vaccination is building [2].</w:t></w:r></w:p>`;
  const new78 =
    H2('Vaccination Versus Immunity: A Short Primer') +
    P(
      rb('How the bird gets protected: passive and active immunity. '),
      r("A bird is protected in two ways [2]. The first is passive immunity: ready-made antibodies the chick receives from its mother through the egg. The chick did nothing to earn them. They are simply handed over, and they fade out over the first few weeks of life. The second is active immunity: protection the bird builds for itself after it meets a pathogen or a vaccine. Active immunity takes a week or two to come up, but it lasts, and it can be boosted. Vaccination works by driving active immunity in a controlled, safe way, without making the bird sick.")
    ) +
    P(
      r("Active immunity has two arms that back each other up: antibodies that block a pathogen before it takes hold, and immune cells that clean up the bird's own cells once they are infected [2]. Different vaccines and different routes lean on these arms in different ways, which is the reason each method in this course is set up a little differently.")
    );
  replaceOnce(old78, new78, 'rewrite-78-primer');

  // Replace para [79] with reworded antibody prose + lead line + TABLE
  const old79 = `<w:p w14:paraId="677F8270" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:t>Three types of antibody matter in a poultry vaccination program. IgM appears first after any new exposure. IgY (the same as IgG in mammals) builds up after IgM and is what serology measures when you send samples to the lab. IgA works at mucosal surfaces: the gut lining, the airways, and the eyes. It catches pathogens at the entry point and stops them attaching before they can get into the bird. Eye drop, coarse spray, and water vaccines work mainly through IgA. Killed injected vaccines work mainly through I</w:t></w:r><w:r><w:t>gY [2].</w:t></w:r></w:p>`;
  const antibodyTable = buildTable(
    [2200, 6440],
    ['Antibody', 'Main role'],
    [
      [[{t:'IgY'}], [{t:'Main blood antibody. Long-term, whole-body protection.'}]],
      [[{t:'IgA'}], [{t:'Protects the wet surfaces: the gut and the respiratory tract.'}]],
      [[{t:'IgM'}], [{t:'First antibody produced when an infection starts.'}]],
    ],
    { centerCols: [0] }
  );
  const new79 =
    P(r("Three types of antibody matter in a poultry vaccination program. IgM appears first after any new exposure. IgY, the same as IgG in mammals, builds up after IgM and is what serology measures when you send samples to the lab. IgA works at the wet surfaces: the gut lining, the airways, and the eyes. It catches pathogens right at the entry point and stops them attaching before they get into the bird. Eye drop, coarse spray, and water vaccines work mainly through IgA. Killed injected vaccines work mainly through IgY [2].")) +
    P(r("These three antibodies are the most important for protecting hatching and newborn chicks:")) +
    antibodyTable +
    SPACER;
  replaceOnce(old79, new79, 'rewrite-79-antibody-table');

  // Replace para [80] — drop verbose CPC attribution
  const old80 = `<w:p w14:paraId="AA010001" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">The CPC Learning Centre Maternal Antibody Transfer bulletin explains that IgY (the avian equivalent of IgG) gives chicks broad, system-wide protection against diseases like Infectious Bursal Disease, passing from the hen through the egg yolk to the chick's bloodstream. This is exactly why vaccinating your breeder hens properly has such a direct effect on how well your chicks are protected in those first critical days after hatch [3].</w:t></w:r></w:p>`;
  const new80 = P(r("IgY, the avian version of IgG, gives chicks broad, whole-body protection against diseases like Infectious Bursal Disease. It passes from the hen through the egg yolk into the chick's bloodstream. That is exactly why vaccinating your breeder hens properly has such a direct effect on how well your chicks are protected in those first critical days after hatch [3]."));
  replaceOnce(old80, new80, 'thin-80-maternal');

  // Replace para [82] — drop attribution + ADD live/killed + antigen specificity blocks
  const old82 = `<w:p w14:paraId="AA010002" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">The CPC Learning Centre Maternal Antibody Transfer bulletin is clear that there are no universal titer targets to aim for [3]. Titers vary by region, flock history, and program. The most practical approach is to track your own breeder titers over time and work with your veterinarian to set farm-specific baselines for your operation.</w:t></w:r></w:p>`;
  const new82 =
    P(r("There are no universal titer targets to aim for [3]. Titers vary by region, flock history, and program. The most practical approach is to track your own breeder titers over time and work with your veterinarian to set farm-specific baselines for your operation.")) +
    P(
      rb('Two kinds of vaccine: modified-live and killed. '),
      r("Almost every vaccine you give falls into one of two camps, and they behave very differently in the bird. Modified-live vaccines, often called MLV, carry live virus that has been weakened so it still infects and multiplies in the bird but without causing real disease. Because the virus actually replicates, it triggers strong local protection right where it is applied, in the gut, the eye, or the airway, and it often works from a single dose. The trade-off is that live virus is fragile and reactive. It dies easily if the cold chain breaks or if chlorine or disinfectant gets near it, and it always produces some visible vaccine reaction in the flock. Most of the water, spray, eye drop, and wing web vaccines in this course are modified-live [5,16].")
    ) +
    P(
      rb('Killed (inactivated) vaccines '),
      r("carry virus or bacteria that have been completely killed, then blended with an oil adjuvant that releases the antigen slowly. A killed vaccine cannot replicate and cannot spread, so it is very safe and very stable, but on its own it gives a weaker signal. It works best as a booster on top of earlier live priming, and it has to be injected. Its strength is a high, long-lasting level of blood antibody, the IgY a layer or breeder needs to carry protection through a full production cycle and to pass on as maternal antibody to her chicks. That is why the pre-lay injection round in Section 5 uses killed products [5,16].")
    ) +
    P(
      rb('Why some diseases are easier to vaccinate against than others. '),
      r("It is far easier to build a strong vaccine against a small, simple virus than against a large, complex parasite. A virus like Newcastle Disease shows the immune system only a handful of surface targets, so one well-matched vaccine covers it well. "),
      ri('Eimeria'),
      r(", the parasite behind coccidiosis, is a large organism with many life stages, and each stage shows the immune system a different set of targets. There is no practical killed vaccine for it. That is why coccidiosis vaccines are live oocysts given in the water or by spray, deliberately cycling a low dose of the parasite through the flock so the birds build their own immunity to the whole organism. Bacteria sit in between, which is why killed bacterial products like the "),
      ri('Mycoplasma'),
      r(" vaccines protect less predictably than a good viral vaccine [5,16].")
    );
  replaceOnce(old82, new82, 'thin-82-add-immunology');

  // ============================================================
  // (4) ACCENT LEARNING OBJECTIVES — convert label para to H2 heading + lead line
  // ============================================================
  const old84 = `<w:p w14:paraId="725A5CA4" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Learning objectives for Course 8:</w:t></w:r></w:p>`;
  const new84 = H2('Learning Objectives') + P(r("By the end of this course, you should be able to:"));
  replaceOnce(old84, new84, 'accent-learning-objectives');

  // ============================================================
  // (6) DEFINE COLD CHAIN in 1.3
  // ============================================================
  const coldChainDef = P(
    rb('What "cold chain" means. '),
    r("The cold chain is the unbroken run of refrigeration that keeps a vaccine between 2°C and 8°C every step of the way: from the manufacturer, through the distributor, into your farm fridge, and right up to the moment you open the vial in the barn. A cold chain failure is any point along that route where the vaccine gets too warm, or freezes. The damage is invisible. The vial looks exactly the same, but the live virus inside is dead or weakened, and nothing you do in the barn afterward brings it back.")
  );
  insertBeforePara('Live vaccines are biological materials. They are alive, and they die at the wrong temperature', coldChainDef, 'cold-chain-def');

  // ============================================================
  // (7) RENAME 1.6 (heading + cached TOC row)
  // ============================================================
  replaceAll('1.6  Running the Vaccination', '1.6  Vaccination Day: Delivering the Dose', 'rename-1.6');

  // ============================================================
  // (9) THIN CPC LEARNING CENTRE REPETITION in Sections 1 & 2
  // ============================================================
  replaceOnce(
    'The CPC Learning Centre General Principles of Vaccination guide explains that two immune mechanisms run in parallel after vaccination',
    'Two immune mechanisms run in parallel after vaccination',
    'thin-cpc-100');
  replaceOnce(
    ' The CPC Learning Centre General Principles of Vaccination guide specifies that all used and unused vaccines must be properly disposed of by incineration.',
    '',
    'thin-cpc-174');
  replaceOnce(
    'The CPC Learning Centre General Principles of Vaccination guide is explicit: vaccinate only healthy birds [1].',
    'Vaccinate only healthy birds [1].',
    'thin-cpc-176');
  replaceOnce(
    'The CPC Learning Centre General Principles of Vaccination guide describes a stair-step approach: start with coarse spray for an initial prime',
    'Vaccination follows a stair-step approach: start with coarse spray for an initial prime',
    'thin-cpc-191');
  replaceOnce(
    'The CPC Learning Centre General Principles of Vaccination guide describes fine spray as the next step in a stair-step program:',
    'Fine spray is the next step in a stair-step program:',
    'thin-cpc-277');

  // ============================================================
  // (10) MASTER VACCINE / DISEASE / ROUTE TABLE after Section 6
  // ============================================================
  const masterLead =
    P(
      rb('One page, every method. '),
      r("You have now walked through every route used on Canadian poultry farms. The table below pulls them together: each major disease, whether its vaccine is live or killed, the main way it is delivered, and where to find it in this course. Use it as a quick reference when you sit down with your veterinarian to build or review a program. Keep the theme in mind: the route gets the vaccine into the bird, but it is the bird's own immune response that turns it into protection.")
    ) +
    P(rb('Table 6.1: '), r('Poultry vaccines by disease and delivery route.'));
  const masterTable = buildTable(
    [2250, 1500, 3450, 1440],
    ['Disease', 'Vaccine type', 'Main delivery route(s)', 'In this course'],
    [
      [[{t:"Marek's Disease"}], [{t:'Live'}], [{t:'In-ovo, or injection under the skin at the hatchery'}], [{t:'Sections 5, 6'}]],
      [[{t:'Gumboro (IBD)'}], [{t:'Live'}], [{t:'Drinking water; in-ovo'}], [{t:'Sections 1, 6'}]],
      [[{t:'Newcastle Disease'}], [{t:'Live and killed'}], [{t:'Water, coarse and fine spray, eye drop (live); injection (killed)'}], [{t:'Sections 1, 2, 3, 5'}]],
      [[{t:'Infectious Bronchitis'}], [{t:'Live and killed'}], [{t:'Coarse and fine spray, eye drop, water (live); injection (killed)'}], [{t:'Sections 1, 2, 3, 5'}]],
      [[{t:'Infectious Laryngotracheitis (ILT)'}], [{t:'Live'}], [{t:'Eye drop; coarse spray'}], [{t:'Sections 2, 3'}]],
      [[{t:'Fowl Pox'}], [{t:'Live'}], [{t:'Wing web'}], [{t:'Section 4'}]],
      [[{t:'Avian Encephalomyelitis (AE)'}], [{t:'Live'}], [{t:'Wing web; drinking water'}], [{t:'Sections 1, 4'}]],
      [[{t:'Coccidiosis'}], [{t:'Live oocyst'}], [{t:'Drinking water; spray (hatchery or barn)'}], [{t:'Sections 1, 2'}]],
      [[{t:'Egg Drop Syndrome (EDS-76)'}], [{t:'Killed'}], [{t:'Injection'}], [{t:'Section 5'}]],
      [[{t:'Mycoplasma', i:true},{t:' (MG, MS)'}], [{t:'Killed'}], [{t:'Injection'}], [{t:'Section 5'}]],
    ],
    { centerCols: [1, 3] }
  );
  insertAfterPara('Hatchery Management and Incubation Biology course in this series.', masterLead + masterTable + SPACER, 'master-table');

  // ============================================================
  // (11) SECTION 8 — immunity prevents disease
  // ============================================================
  const old456 = `<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">Vaccination prevents disease. But when birds get sick despite vaccination, or when an unrelated bacterial infection hits the flock, your birds may need antibiotic treatment. Knowing how to use antibiotics legally, responsibly, and effectively is part of running a modern Canadian poultry operation.</w:t></w:r></w:p>`;
  const new456 = P(
    rb('Immunity prevents disease, not the act of vaccinating itself. '),
    r("That is the theme that has run through this whole course. Even so, a well-immunized flock can still get sick: a bacterial infection takes hold, a disease the program does not cover shows up, or immunity falls short in part of the flock. When that happens, your birds may need antibiotic treatment. Knowing how to use antibiotics legally, responsibly, and effectively is part of running a modern Canadian poultry operation.")
  );
  replaceOnce(old456, new456, 'sec8-immunity-prevents');

  // ============================================================
  // (12) SECTION 8 — culture & sensitivity (farmer's key steps)
  // ============================================================
  const csPara81 = P(
    rb('The most responsible first step: find out what you are treating. '),
    r("Before any antibiotic goes in, the most valuable thing you can do is get a diagnosis. Pull a few freshly dead or cull birds, get them to your veterinarian or the diagnostic lab quickly, and ask for bacterial culture and a sensitivity test, often written as culture and sensitivity, or C and S. The culture tells you which bacteria are actually causing the problem. The sensitivity report tells you which antibiotics still kill that exact bug on your farm, and which ones it already shrugs off. Treating on a guess wastes time, wastes money, and quietly breeds more resistance whenever the drug you reached for was never going to work. A targeted treatment based on a culture and sensitivity report is both the most effective treatment and the most responsible one [23].")
  );
  insertAfterPara('That approach reduces the selection pressure you apply and keeps those tools working longer for everyone.', csPara81, 'sec8.1-cs');

  const csPara82 = P(
    rb('What your veterinarian needs from you. '),
    r("A prescription is only as good as the information behind it, and you are the eyes on the flock. The steps are simple. Keep your veterinarian updated on what you are seeing in the barn, the daily mortality, the feed and water intake, and how the birds are behaving, well before a problem turns into a crisis. When birds start dying, submit fresh birds for post-mortem and for culture and sensitivity rather than waiting and treating blind. Give the lab a clear history: bird age, the vaccination program, what you are seeing, and anything you have already treated with. Then follow the prescription exactly, the full dose for the full course, so you knock the infection right down instead of leaving the toughest, most resistant bacteria behind to come back stronger. The better your information and your samples, the better the treatment decision your vet can make.")
  );
  insertAfterPara('it is required before any prescription treatment can begin.', csPara82, 'sec8.2-farmer-steps');

  // ============================================================
  // VALIDATION
  // ============================================================
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML (${bad.length} found) — Word will reject`);
  const emDash = (xml.match(/—/g) || []).length;
  if (emDash > 0) throw new Error(`Em dash present (${emDash})`);
  const dirty = (xml.match(/w:dirty=/g) || []).length;
  if (dirty > 0) throw new Error(`w:dirty flags present (${dirty})`);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);

  console.log(log.join('\n'));
  console.log('\nValidation: no unescaped &, 0 em dashes, 0 dirty flags.');
  console.log('Written:', SRC, '—', (buf.length/1024).toFixed(1), 'KB');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
