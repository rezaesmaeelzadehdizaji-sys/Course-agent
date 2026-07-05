/* Apply Natasha Buckler (CPC) reviewer comments to the Edited NB 06242026 Course 8 file,
   plus mandatory CLAUDE.md mechanical fixes, then strip all review comments. */
const JSZip = require('jszip');
const fs = require('fs');

const SRC = 'Course 8/Revised Course 8 - Edited NB 06242026.docx';
const OUT = 'Course 8/Revised Course 8 - Edited NB 06242026.docx';

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function run(t){return '<w:r><w:t xml:space="preserve">'+esc(t)+'</w:t></w:r>';}
function boldRun(t){return '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">'+esc(t)+'</w:t></w:r>';}

// bold lead-in heading paragraph (justify both, spacing after 80)
function headPara(t){
  return '<w:p><w:pPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:b/><w:bCs/></w:rPr></w:pPr>'+boldRun(t)+'</w:p>';
}
// bullet paragraph (ListParagraph + numId 2)
function bullet(t){
  return '<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>'+run(t)+'</w:p>';
}

// Generic: replace inner runs between commentRangeStart/End for id N with newRuns (markers kept, stripped later)
function repl(xml, id, newRuns){
  const re = new RegExp('(<w:commentRangeStart w:id="'+id+'"/>)[\\s\\S]*?(<w:commentRangeEnd w:id="'+id+'"/>)');
  if(!re.test(xml)) throw new Error('comment range '+id+' not found');
  return xml.replace(re, '$1'+newRuns+'$2');
}

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // ---- [3] antibody -> antibodies ----
  xml = repl(xml, 3, run('antibodies '));

  // ---- [5] protect chicks -> protect the chicks ----
  xml = repl(xml, 5, run('protect the chicks '));

  // ---- [6] rephrase ----
  xml = repl(xml, 6, run('However, if chicks are vaccinated too late, they may remain unprotected when disease exposure occurs'));

  // ---- [7] delete the "There are two types of vaccine" intro paragraph ----
  xml = xml.replace(/<w:p w14:paraId="34DD8DE1"[\s\S]*?<\/w:p>/, '');

  // ---- [8] new MLV paragraph text (bold lead) ----
  const mlv = boldRun('Modified-live vaccines (MLVs)') +
    run(' contain a live virus that has been weakened so it can still infect and replicate in the bird without causing clinical disease. Because the virus actually replicates, it stimulates strong local immunity at the site of administration, whether in the gut, eye, or respiratory tract, and often provides effective protection after a single dose. The trade-off is that live vaccines are fragile and sensitive to handling. They can lose effectiveness if the cold chain is broken or if they come into contact with chlorine, disinfectants, or other environmental contaminants. In addition, some degree of vaccine reaction is expected because the vaccine virus is actively replicating in the flock. Most vaccines administered by drinking water, spray, eye drop, or wing-web methods in this course are modified-live vaccines [4,5].');
  xml = repl(xml, 8, mlv);

  // ---- [19] convert Before/During/After checklist to point form ----
  const block =
    headPara('Before vaccination:') +
    bullet('Confirm chlorine is off.') +
    bullet('Check drinkers are clean with no disinfectant residue.') +
    bullet('Confirm vaccine vials were stored at 2-8°C and are within expiry.') +
    bullet('Run a plain-water practice run 24-48 hours in advance to confirm volume and timing [11].') +
    headPara('During vaccination:') +
    bullet('Walk the flock at 30-minute intervals.') +
    bullet('Confirm birds are actively drinking.') +
    bullet('Confirm the vaccine solution is white (milk still active) or blue (commercial stabilizers) and moving through the drinker lines. If solution runs clear, something is wrong with distribution.') +
    headPara('After vaccination:') +
    bullet('Check that the full prepared volume was consumed within two hours.') +
    bullet('If large volumes remain, investigate: drinker system blockage, poor water starvation, or birds deterred from drinking by environmental stressors.');
  xml = xml.replace(/<w:p w14:paraId="06EE7B44"[\s\S]*?<w:commentReference w:id="19"\/><\/w:r><\/w:p>/, block);

  // ---- [24] ----
  xml = repl(xml, 24, run('dedicated exclusively to vaccine administration '));

  // ---- [25] ----
  xml = repl(xml, 25, run('Never use this equipment for herbicides, pesticides, disinfectants, or other chemicals, as even trace residues can inactivate live vaccine organisms and compromise flock protection.'));

  // ---- [26] special: replace the full "Spray at a light source..." sentence spanning runs ----
  const find26 = '<w:commentRangeStart w:id="26"/><w:r><w:t xml:space="preserve">Spray </w:t></w:r><w:commentRangeEnd w:id="26"/><w:r w:rsidR="0025480E"><w:rPr><w:rStyle w:val="CommentReference"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:commentReference w:id="26"/></w:r><w:r><w:t>at a light source to observe spray particle size and pattern. Large';
  if(!xml.includes(find26)) throw new Error('comment 26 exact span not found');
  xml = xml.replace(find26, '<w:r><w:t xml:space="preserve">Test the spray pattern against a light source to observe droplet size and pattern. Large');

  // ---- [27] ----
  xml = repl(xml, 27, run('may not reach the birds uniformly. '));

  // ---- [29] cold-chain paragraph ----
  xml = repl(xml, 29, run('Cold-chain management is just as important for spray vaccination as it is for drinking-water vaccination. Store vaccines at 2-8°C (35-45°F) and transport them to the barn in a cooler with ice packs until they are ready to be mixed and used [16]. Protect vaccine vials and prepared vaccine solutions from direct sunlight at all times. Live vaccines are highly sensitive to heat and ultraviolet light. Exposure to elevated temperatures or sunlight can rapidly reduce vaccine viability, resulting in poor flock immunity even when administration technique is otherwise correct [16].'));

  // ---- [33] PPE sentence ----
  xml = repl(xml, 33, run('Standard personal protective equipment (PPE) requirements for live NDV vaccination, including gloves, eye protection, proper vaccine vial disposal, and hand hygiene, are outlined in Section 1.7.'));

  // ---- [34] ----
  xml = repl(xml, 34, run('Coarse spray vaccination requires one additional precaution in comparison to other vaccine methods: the use of a mask or respirator.'));

  // ---- [52] ----
  xml = repl(xml, 52, run('. Movement at the time of injection can compromise vaccine delivery, resulting in partial or failed vaccine uptake.'));

  // ---- [60] ----
  xml = repl(xml, 60, run('When properly calibrated, these systems deliver consistent doses and automatically reset between birds, improving uniformity and efficiency compared to manual syringes. '));

  // ---- [61] ----
  xml = repl(xml, 61, run('Set the injector to the dose specified on the vaccine label. Before starting flock administration, deliver five test doses into a graduated syringe or calibrated measuring tube to confirm accurate output. Use the test fluid recommended by the vaccine manufacturer or injector supplier for calibration. '));

  // ---- [62] ----
  xml = repl(xml, 62, run('On larger flocks, automatic multi-dose injectors are preferred due to improved speed and dose consistency. Manual syringes may result in greater variability between birds and are generally less suitable for high-volume administration [21].'));

  // ---- [63] ----
  xml = repl(xml, 63, run('A second calibration check should be performed midway through the vaccination session [21]. Changes in vaccine viscosity, temperature effects, or normal wear on injector components can lead to dose variation during extended runs. Performing an additional five test shots at the midpoint helps confirm that the injector remains accurately calibrated and delivering the intended dose.'));

  // ============ GLOBAL COMMENT STRIP ============
  xml = xml.replace(/<w:commentRangeStart w:id="\d+"\/>/g, '');
  xml = xml.replace(/<w:commentRangeEnd w:id="\d+"\/>/g, '');
  // remove any run that contains a commentReference
  xml = xml.replace(/<w:r\b[^>]*>(?:(?!<\/w:r>)[\s\S])*?<w:commentReference w:id="\d+"\/>(?:(?!<\/w:r>)[\s\S])*?<\/w:r>/g, '');

  // ============ MECHANICAL CLAUDE.md FIXES ============
  const before = { dash:(xml.match(/[–—]/g)||[]).length };
  xml = xml.replace(/[–—]/g, '-');              // en/em dash -> hyphen
  xml = xml.replace(/litre/g, 'liter');                  // British -> American (litres, microlitres)
  xml = xml.replace(/metre/g, 'meter');                  // metres/metre -> meters/meter
  const vetBefore = (xml.match(/\bvet\b/g)||[]).length;
  xml = xml.replace(/\bvet\b/g, 'veterinarian');         // lowercase short form only (journal 'Vet' capitalized, untouched)

  // guard: no unescaped ampersand
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if(bad) throw new Error('Unescaped & ('+bad.length+')');

  zip.file('word/document.xml', xml);

  // remove comment part files
  ['word/comments.xml','word/commentsExtended.xml','word/commentsIds.xml','word/commentsExtensible.xml'].forEach(f=>{ if(zip.file(f)) zip.remove(f); });
  // scrub relationships
  let rels = await zip.file('word/_rels/document.xml.rels').async('string');
  rels = rels.replace(/<Relationship[^>]*comments(?:Extended|Ids|Extensible)?\.xml"[^>]*\/>/g, '');
  zip.file('word/_rels/document.xml.rels', rels);
  // scrub content types
  let ct = await zip.file('[Content_Types].xml').async('string');
  ct = ct.replace(/<Override PartName="\/word\/comments(?:Extended|Ids|Extensible)?\.xml"[^>]*\/>/g, '');
  zip.file('[Content_Types].xml', ct);

  const buf = await zip.generateAsync({type:'nodebuffer', compression:'DEFLATE'});
  fs.writeFileSync(OUT, buf);

  console.log('Patched. dashes removed:', before.dash, '| vet->veterinarian:', vetBefore);
  console.log('remaining en/em dash:', (xml.match(/[–—]/g)||[]).length);
  console.log('remaining commentReference:', (xml.match(/commentReference/g)||[]).length);
  console.log('remaining litre/metre/vet:', (xml.match(/litre|metre/g)||[]).length, (xml.match(/\bvet\b/g)||[]).length);
})();
