/* MatMath tests: engine geometry vs tests/expected.json (python oracle). */
'use strict';
const fs=require('fs'),path=require('path');
const M=require(path.join(__dirname,'..','engine.js'));
const items=JSON.parse(fs.readFileSync(path.join(__dirname,'expected.json'),'utf8')).items;
let pass=0,fail=0;
const EPS=1e-9;
function eq(l,a,b){if(a===b)pass++;else{fail++;console.log('FAIL '+l+': got '+a+' want '+b);}}
function close(l,a,b){if(Math.abs(a-b)<EPS)pass++;else{fail++;console.log('FAIL '+l+': got '+a+' want '+b);}}
const WARN_MAP={'window-not-positive':'overlap consumes','print-too-big':'larger than the frame','negative-border':'negative border','thin-border':'visually thin'};
for(const it of items){
  const T=it.name+' ';
  const r=M.compute(it.input);
  const o=it.oracle;
  close(T+'winW',r.window.w,o.window_w);
  close(T+'winH',r.window.h,o.window_h);
  close(T+'left',r.borders.left,o.left);
  close(T+'right',r.borders.right,o.right);
  close(T+'top',r.borders.top,o.top);
  close(T+'bottom',r.borders.bottom,o.bottom);
  close(T+'cutL',r.cuts.left,o.cut_left);
  close(T+'cutR',r.cuts.right,o.cut_right);
  close(T+'cutT',r.cuts.top,o.cut_top);
  close(T+'cutB',r.cuts.bottom,o.cut_bottom);
  // warnings: engine messages must cover the oracle warning classes
  for(const w of o.warnings){
    const frag=WARN_MAP[w];
    if(r.warnings.some(m=>m.indexOf(frag)>=0))pass++;
    else{fail++;console.log('FAIL '+T+'missing warning '+w+' in '+JSON.stringify(r.warnings));}
  }
  if(o.warnings.length===0){
    eq(T+'no warnings',r.warnings.length,0);
  }
}
// units round-trip
close('mm->in',M.fromMm(25.4,'in'),1);
close('in->mm',M.toMm(1,'in'),25.4);
// optical mode keeps total vertical border
const r=M.compute({unit:'mm',frameW:400,frameH:400,printW:200,printH:200,overlap:3,mode:'optical',weight:0.15});
close('optical sum',r.borders.top+r.borders.bottom,206);
if(!(r.borders.bottom>r.borders.top)){fail++;console.log('FAIL optical bottom>top');}else pass++;
// even mode symmetry
const r2=M.compute({unit:'mm',frameW:400,frameH:400,printW:200,printH:200,overlap:3,mode:'even'});
close('even top=bottom',r2.borders.top,r2.borders.bottom);
console.log(pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
