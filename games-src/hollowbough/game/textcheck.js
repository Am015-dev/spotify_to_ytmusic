// textcheck.js: in-page check of every visible text: contrast >= 4.5:1 against the nearest painted background (ancestor colours,
// blended), and no cut words (text wider than its box with overflow hidden/ellipsis, or a single word broken by width).
// Used by play-ui.js after every few taps. Returns a list of problem strings.
module.exports=function(){
  const P=[];const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
  const pc=s=>{const m=String(s).match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return [a[0],a[1],a[2],a.length>3?a[3]:1]};
  const bgOf=el=>{let layers=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const cs=getComputedStyle(e);const c=pc(cs.backgroundColor);for(const ps of ['::before','::after']){const pb=getComputedStyle(e,ps).backgroundImage;if(pb&&/url\(/.test(pb))return {img:true}}if(e.tagName==='IMG')return {img:true};if(/url\(/.test(cs.borderImageSource||''))return {img:true};if(cs.backgroundImage&&cs.backgroundImage!=='none'&&!/gradient/.test(cs.backgroundImage))return {img:true};if(/gradient/.test(cs.backgroundImage)){const m=cs.backgroundImage.match(/rgba?\([^)]+\)/g);if(m){const cc=pc(m[0]);layers.push(cc);if(cc[3]>=.95)break}}if(c&&c[3]>0){layers.push(c);if(c[3]>=.95)break}}
    let base=[255,255,255];for(let i=layers.length-1;i>=0;i--){const c=layers[i];base=base.map((v,k)=>v*(1-c[3])+c[k]*c[3])}return {c:base}};
  const where=el=>{const o=[];for(let e=el,i=0;e&&i<4;e=e.parentElement,i++)o.push(String(e.className&&e.className.baseVal!==undefined?'':e.className).split(' ')[0]||e.tagName);return o.join('<')};
  const seen=new Set();
  const all=[...document.querySelectorAll('body *')];
  for(const el of all){
    if(!el.childNodes.length)continue;let own='';for(const n of el.childNodes)if(n.nodeType===3)own+=n.textContent;own=own.trim();if(!own||own.length<2)continue;
    const r=el.getBoundingClientRect();if(r.width<2||r.height<2||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;
    const cs=getComputedStyle(el);if(cs.visibility==='hidden'||+cs.opacity===0)continue;let op=1;for(let e=el;e;e=e.parentElement){op*=+getComputedStyle(e).opacity;if(e.hidden)op=0}if(op<.5)continue;
    if(el.closest('[aria-hidden="true"],.gx-perf,#perfhud'))continue;
    {let moving=false;for(let e=el;e&&!moving;e=e.parentElement)if(e.getAnimations&&e.getAnimations().some(x=>x.playState==='running'))moving=true;if(moving)continue}   // mid-animation: judged once it lands
    const cx=r.left+Math.min(r.width/2,20),cy=r.top+r.height/2;const t=document.elementFromPoint(Math.max(0,Math.min(innerWidth-1,cx)),Math.max(0,Math.min(innerHeight-1,cy)));if(t&&!(t===el||el.contains(t)||t.contains(el)))continue;
    const key=own.slice(0,30);
    {const fz=parseFloat(cs.fontSize);window.__minFz=Math.min(window.__minFz||99,fz);if(fz<13.95&&!seen.has('s'+key)){seen.add('s'+key);P.push('small '+fz+'px "'+key+'" '+where(el))}}
    const fg=pc(cs.color);const bg=bgOf(el);
    if(fg&&bg.c&&!(cs.textShadow&&cs.textShadow!=='none'&&/(\d+(\.\d+)?)px (\d+(\.\d+)?)px (\d+(\.\d+)?)px/.test(cs.textShadow)&&lum(fg)>.5&&false)){const a=fg[3];const f=fg.slice(0,3).map((v,k)=>v*a+bg.c[k]*(1-a));const L1=lum(f),L2=lum(bg.c);const cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
      if(cr<4.5&&!seen.has('c'+key)){seen.add('c'+key);P.push('contrast '+cr.toFixed(1)+' "'+key+'" '+cs.color+' on rgb('+bg.c.map(Math.round)+')')}}
    const ov=cs.overflow+cs.overflowX+cs.textOverflow;
    if(/hidden|clip|ellipsis/.test(ov)&&el.scrollWidth>el.clientWidth+1&&!seen.has('w'+key)){seen.add('w'+key);P.push('cut "'+key+'" '+el.scrollWidth+'>'+el.clientWidth+' '+where(el))}
    // broken word: a word longer than the box forces mid-word break
    if(/break-word|anywhere|break-all/.test(cs.overflowWrap+cs.wordBreak)){const rg=document.createRange();for(const n of el.childNodes)if(n.nodeType===3){const words=n.textContent.split(/\s+/);let off=0;for(const w of words){const i=n.textContent.indexOf(w,off);off=i+w.length;if(w.length<3)continue;rg.setStart(n,i);rg.setEnd(n,i+w.length);if(rg.getClientRects().length>1&&!seen.has('b'+w)){seen.add('b'+w);P.push('broken word "'+w+'"')}}}}
    // clipped by an ancestor with overflow hidden
    for(let e=el.parentElement,d=0;e&&d<4;e=e.parentElement,d++){const s=getComputedStyle(e);if(/hidden|clip/.test(s.overflow+s.overflowX+s.overflowY)){const pr=e.getBoundingClientRect();if((r.right>pr.right+2||r.left<pr.left-2||r.bottom>pr.bottom+2||r.top<pr.top-2)&&!seen.has('k'+key)){if(s.overflowX!=='auto'&&s.overflowX!=='scroll'&&s.overflowY!=='auto'&&s.overflowY!=='scroll'){seen.add('k'+key);P.push('clipped "'+key+'" '+where(el)+' ['+[r.top,r.bottom,r.left,r.right,pr.top,pr.bottom,pr.left,pr.right].map(Math.round)+'] '+s.overflowX+'/'+s.overflowY)}}break}}
  }
  // every tap target 44px+ on its short side (visible, uncovered, enabled)
  for(const el of document.querySelectorAll('button,.btn,[data-a],[role=button],.tile.glow,.glow[data-t],.chipb,.gx-tab,.pv-tab')){
    const r=el.getBoundingClientRect();if(r.width<2||r.height<2||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;
    const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.pointerEvents==='none'||el.disabled)continue;let op=1;for(let e=el;e;e=e.parentElement){op*=+getComputedStyle(e).opacity;if(e.hidden)op=0}if(op<.5)continue;
    if(el.closest('[aria-hidden="true"],.gx-perf,#perfhud'))continue;
    const t=document.elementFromPoint(Math.max(0,Math.min(innerWidth-1,r.left+r.width/2)),Math.max(0,Math.min(innerHeight-1,r.top+r.height/2)));if(t&&!(t===el||el.contains(t)||t.contains(el)))continue;
    if(el.parentElement&&el.parentElement.closest('button,.btn,[data-a]'))continue;
    const k='t'+(el.textContent||el.className).trim().slice(0,20);
    if(Math.min(r.width,r.height)<43.5&&!seen.has(k)){seen.add(k);P.push('target '+Math.round(r.width)+'x'+Math.round(r.height)+' "'+(el.textContent||'').trim().slice(0,20)+'" '+where(el))}
  }
  // the seat chips never overlap each other or leave the screen
  {const cs=[...document.querySelectorAll('#bd .chip')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>4);
   for(let i=0;i<cs.length;i++){const a=cs[i];if(a.left<-1||a.right>innerWidth+1)P.push('chip off screen ['+Math.round(a.left)+','+Math.round(a.right)+']');for(let j=i+1;j<cs.length;j++){const b=cs[j];if(a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1)P.push('chips overlap')}}}
  return P;
};
