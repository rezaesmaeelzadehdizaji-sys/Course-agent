const JSZip=require('jszip');const fs=require('fs');
const SRC='Course 8/Vaccination_draft.docx';

// split a run's <w:t> so each genus token becomes an italic run, preserving original rPr
function italicizeRun(runXml, genusRe){
  const rpr=(runXml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/)||[''])[0];
  const text=(runXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/)||[])[1]||'';
  const irpr = rpr ? rpr.replace('<w:rPr>','<w:rPr><w:i/><w:iCs/>') : '<w:rPr><w:i/><w:iCs/></w:rPr>';
  const mk=(rp,t)=> t==='' ? '' : `<w:r>${rp}<w:t xml:space="preserve">${t}</w:t></w:r>`;
  const parts=text.split(genusRe); // capture group -> matches at odd indices
  return parts.map((seg,i)=> i%2===0 ? mk(rpr,seg) : mk(irpr,seg)).join('');
}

(async()=>{
  const z=await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml=await z.file('word/document.xml').async('string');
  const genusRe=/\b(Salmonella|Mycoplasma|Eimeria|Escherichia|Clostridium|Pasteurella)\b/;

  const targets=[
    'killed Salmonella bacterins are added to the pre-lay',
    'Concurrent Mycoplasma infection.',
    'Mycoplasma colonizes the respiratory lining',
  ];
  let fixed=0;
  for(const sub of targets){
    const ti=xml.indexOf(sub);
    if(ti<0) throw new Error('target not found: '+sub);
    const rStart=xml.lastIndexOf('<w:r>',ti);
    const rEnd=xml.indexOf('</w:r>',ti)+'</w:r>'.length;
    const run=xml.slice(rStart,rEnd);
    if(!/<w:r>/.test(run)) throw new Error('run boundary error: '+sub);
    const rep=italicizeRun(run,genusRe);
    xml=xml.slice(0,rStart)+rep+xml.slice(rEnd);
    fixed++;
  }

  // convert the 4 reference page-range en dashes to hyphens (only en dashes in doc)
  const enBefore=(xml.match(/–/g)||[]).length;
  xml=xml.replace(/–/g,'-');

  if((xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g)||[]).length) throw new Error('unescaped &');
  if((xml.match(/—/g)||[]).length) throw new Error('em dash');
  if((xml.match(/w:dirty=/g)||[]).length) throw new Error('w:dirty');
  z.file('word/document.xml',xml);

  // updateFields=false in settings.xml
  let settings=await z.file('word/settings.xml').async('string');
  settings=settings.replace(/<w:updateFields[^>]*\/>/g,'');
  if(/<w:settings\b[^>]*>/.test(settings)){
    settings=settings.replace(/(<\/w:settings>)/,'<w:updateFields w:val="false"/>$1');
  }
  z.file('word/settings.xml',settings);

  fs.writeFileSync(SRC, await z.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
  console.log('Italicized genus runs:',fixed,'| en-dashes converted:',enBefore,'| updateFields=false set:', /<w:updateFields w:val="false"\/>/.test(settings));
})().catch(e=>{console.error('FAILED:',e.message);process.exit(1);});
