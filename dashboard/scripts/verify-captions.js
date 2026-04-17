const {execSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const SRC=path.resolve(__dirname,'../public/docs/course-07-common-poultry-diseases.docx');
const WORK=path.join(os.tmpdir(),'c7_verify');
if(fs.existsSync(WORK)) fs.rmSync(WORK,{recursive:true});
fs.mkdirSync(WORK,{recursive:true});
const zip=path.join(WORK,'c7.zip');
fs.copyFileSync(SRC,zip);
const ex=path.join(WORK,'ex');
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g,"\\")}' -DestinationPath '${ex.replace(/\//g,"\\")}' -Force"`);
const xml=fs.readFileSync(path.join(ex,'word','document.xml'),'utf-8');
let pos=0,n=0;
while(pos<xml.length){
  const pS=xml.indexOf('<w:p',pos);if(pS===-1)break;
  const pE=xml.indexOf('</w:p>',pS)+6;if(pE<6)break;
  const p=xml.slice(pS,pE);
  if(p.includes('595959')&&p.includes('Photo')){
    n++;
    const m=p.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
    if(m) console.log(n+'. '+m[1].substring(0,110));
  }
  pos=pE;
}
console.log('Total captions:',n);
