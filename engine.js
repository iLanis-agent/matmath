/* MatMath engine: picture-frame mat board geometry.
   All math in millimeters internally (inches converted at the edge).
   Pure JS, no deps, browser + Node. */
(function(root,factory){
  if(typeof module==='object'&&module.exports){module.exports=factory();}
  else{root.MatMath=factory();}
})(typeof self!=='undefined'?self:this,function(){
'use strict';
var IN=25.4;
function toMm(v,unit){return unit==='in'?v*IN:v;}
/* frame: {w,h} opening the mat must fit (inside of frame)
   print: {w,h} artwork size
   overlap: how much the window covers the print edge (each side)
   mode: 'even' | 'optical'  (optical bottoms the window slightly below center)
   weight: optical bottom extra as fraction of vertical border (e.g. 0.15)
   minBorder: warn if any border is thinner than this */
function compute(o){
  var unit=o.unit||'mm';
  var fw=toMm(o.frameW,unit),fh=toMm(o.frameH,unit);
  var pw=toMm(o.printW,unit),ph=toMm(o.printH,unit);
  var overlap=toMm(o.overlap,unit);
  var weight=o.weight==null?0.15:o.weight;
  var minBorder=toMm(o.minBorder==null?25:o.minBorder,unit);
  var warnings=[];
  // window = print minus overlap on every side
  var winW=pw-2*overlap, winH=ph-2*overlap;
  if(winW<=0||winH<=0)warnings.push('overlap consumes the print: window is not positive');
  // borders
  var bw=(fw-winW)/2,bh=(fh-winH)/2;
  var top,left,right,bottom;
  left=right=bw;
  if(o.mode==='optical'){
    // split vertical border so the window sits above center: top smaller, bottom larger
    top=bh*(1-weight);
    bottom=bh*(1+weight);
  }else{
    top=bottom=bh;
  }
  if(pw>fw||ph>fh)warnings.push('print is larger than the frame - it cannot be matted as given');
  var borders=[left,right,top,bottom];
  for(var i=0;i<4;i++){
    if(borders[i]<0)warnings.push('negative border: window does not fit the frame');
    else if(borders[i]<minBorder)warnings.push('border under '+round1(fromMm(minBorder,unit))+unitLabel(unit)+' - visually thin');
  }
  return {
    unit:unit,
    window:{w:winW,h:winH},
    borders:{left:left,right:right,top:top,bottom:bottom},
    // cut marks: distance from mat board edge to each window edge
    cuts:{left:left,right:left+winW,top:top,bottom:top+winH},
    warnings:uniq(warnings)
  };
}
function uniq(a){var r=[];for(var i=0;i<a.length;i++)if(r.indexOf(a[i])<0)r.push(a[i]);return r;}
function fromMm(v,unit){return unit==='in'?v/IN:v;}
function round1(v){return Math.round(v*10)/10;}
function unitLabel(u){return u==='in'?'in':'mm';}
function fmt(v,unit){
  var x=fromMm(v,unit);
  return unit==='in'?(Math.round(x*100)/100).toFixed(2):(Math.round(x*10)/10).toFixed(1);
}
return {compute:compute,fmt:fmt,toMm:toMm,fromMm:fromMm};
});
