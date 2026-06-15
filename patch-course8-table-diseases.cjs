// patch-course8-table-diseases.cjs
// Rebuild the Quick Reference table data rows to match exactly the diseases
// mentioned in Sections 1-6: remove Mycoplasma (only in intro/Section 7),
// add IBH and Salmonella (Section 5), fix AE (Section 4, wing web only).
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const COLS = [2250, 1500, 3450, 1440];
const CENTER = [1, 3];
const B = '<w:tcBorders><w:top w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:left w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:bottom w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:right w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/></w:tcBorders>';

function run(seg){ // seg = {t, i?}
  const it = seg.i ? '<w:i/><w:iCs/>' : '';
  return `<w:r><w:rPr>${it}<w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">${esc(seg.t)}</w:t></w:r>`;
}
function dataCell(ci, segs, shade){
  const shd = shade ? 'EBF2FA' : 'FFFFFF';
  const jc = CENTER.includes(ci) ? '<w:jc w:val="center"/>' : '';
  return `<w:tc><w:tcPr><w:tcW w:w="${COLS[ci]}" w:type="dxa"/>${B}<w:shd w:val="solid" w:color="${shd}" w:fill="auto"/></w:tcPr>`+
    `<w:p><w:pPr><w:spacing w:before="50" w:after="50"/>${jc}</w:pPr>${segs.map(run).join('')}</w:p></w:tc>`;
}

// disease rows (cells = arrays of {t,i} segments) — order groups injection/breeder diseases last
const ROWS = [
  [[{t:"Marek's Disease"}], [{t:'Live'}], [{t:'In-ovo, or injection under the skin at the hatchery'}], [{t:'Sections 5, 6'}]],
  [[{t:'Gumboro (IBD)'}], [{t:'Live'}], [{t:'Drinking water; in-ovo'}], [{t:'Sections 1, 6'}]],
  [[{t:'Newcastle Disease'}], [{t:'Live and killed'}], [{t:'Water, coarse and fine spray, eye drop (live); injection (killed)'}], [{t:'Sections 1, 2, 3, 5'}]],
  [[{t:'Infectious Bronchitis'}], [{t:'Live and killed'}], [{t:'Coarse and fine spray, eye drop, water (live); injection (killed)'}], [{t:'Sections 1, 2, 3, 5'}]],
  [[{t:'Infectious Laryngotracheitis (ILT)'}], [{t:'Live'}], [{t:'Eye drop; coarse spray'}], [{t:'Sections 2, 3'}]],
  [[{t:'Fowl Pox'}], [{t:'Live'}], [{t:'Wing web'}], [{t:'Section 4'}]],
  [[{t:'Avian Encephalomyelitis (AE)'}], [{t:'Live'}], [{t:'Wing web'}], [{t:'Section 4'}]],
  [[{t:'Coccidiosis'}], [{t:'Live oocyst'}], [{t:'Drinking water; spray (hatchery or barn)'}], [{t:'Sections 1, 2'}]],
  [[{t:'Egg Drop Syndrome (EDS-76)'}], [{t:'Killed'}], [{t:'Injection'}], [{t:'Section 5'}]],
  [[{t:'Reovirus (viral arthritis)'}], [{t:'Live and killed'}], [{t:'Injection (live and killed)'}], [{t:'Section 5'}]],
  [[{t:'Inclusion Body Hepatitis (IBH)'}], [{t:'Killed (autogenous)'}], [{t:'Injection'}], [{t:'Section 5'}]],
  [[{t:'Salmonella', i:true},{t:' (SE, ST)'}], [{t:'Killed (bacterin)'}], [{t:'Injection'}], [{t:'Section 5'}]],
];

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // locate the master table: the <w:tbl> containing the header "Main delivery route(s)"
  const marker = 'Main delivery route(s)';
  const mi = xml.indexOf(marker);
  if (mi < 0) throw new Error('master table header not found');
  const tblStart = xml.lastIndexOf('<w:tbl>', mi);
  const tblEnd = xml.indexOf('</w:tbl>', mi) + '</w:tbl>'.length;
  const tbl = xml.slice(tblStart, tblEnd);

  // keep tblPr + tblGrid + header row; the header row is the first <w:tr> (has <w:tblHeader/>)
  const firstTrEnd = tbl.indexOf('</w:tr>') + '</w:tr>'.length;
  if (!/(<w:tblHeader\/>)/.test(tbl.slice(0, firstTrEnd))) throw new Error('first row is not the header');
  const prefix = tbl.slice(0, firstTrEnd); // tblPr + grid + header row

  const dataRows = ROWS.map((row, ri) =>
    `<w:tr>${row.map((segs, ci) => dataCell(ci, segs, ri % 2 === 1)).join('')}</w:tr>`
  ).join('');

  const newTbl = prefix + dataRows + '</w:tbl>';
  xml = xml.slice(0, tblStart) + newTbl + xml.slice(tblEnd);

  // sanity: Mycoplasma gone from table, IBH + Salmonella present
  if (/Mycoplasma \(MG, MS\)/.test(newTbl)) throw new Error('Mycoplasma still in table');
  if (!/Inclusion Body Hepatitis/.test(newTbl) || !/Salmonella/.test(newTbl)) throw new Error('IBH/Salmonella missing');
  if ((xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g) || []).length) throw new Error('unescaped &');
  if ((xml.match(/w:dirty=/g) || []).length) throw new Error('w:dirty introduced');
  if ((xml.match(/—/g) || []).length) throw new Error('em dash');

  zip.file('word/document.xml', xml);
  fs.writeFileSync(SRC, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('Table rebuilt: 12 disease rows (removed Mycoplasma; added IBH, Salmonella; fixed AE).');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
