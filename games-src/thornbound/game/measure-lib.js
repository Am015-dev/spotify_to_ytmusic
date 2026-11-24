// Phone measuring: in-page sampler for min readable font, min tap target (hit-tested), covered targets.
// Used by measure.js (touch-plays full games and samples every few polls).
module.exports.PAGE=function(){
  const vw=innerWidth,vh=innerHeight,out={fonts:[],taps:[],covered:[]};
  const shown=e=>{const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return null;const r=e.getBoundingClientRect();if(r.width<1||r.height<1||r.bottom<=0||r.top>=vh||r.right<=0||r.left>=vw)return null;
    for(let a=e.parentElement;a;a=a.parentElement){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)return null}return r};
  const anc=e=>{for(let a=e.parentElement;a&&a.tagName!=='BODY';a=a.parentElement){const c=typeof a.className==='string'?a.className:(a.className&&a.className.baseVal)||'';if(/tb-|tbx|rglow|bspot/.test(c))return '<'+c.trim().split(/\s+/)[0]}return ''};
  const lab=e=>(e instanceof SVGElement?anc(e):'')+(e.id?'#'+e.id:'')+(e.tagName.toLowerCase())+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):(e.className&&e.className.baseVal?'.'+e.className.baseVal.split(/\s+/)[0]:''));
  // fonts: every element with its own visible text; SVG text scaled by the CTM
  const W=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=W.nextNode()){const t=n.nodeValue.trim();if(!t||/^[\s​]*$/.test(t))continue;const e=n.parentElement;if(!e||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(e.tagName)||e.closest('defs,symbol,clipPath,mask,pattern'))continue;
    if(e.closest('#perfhud,.perfhud'))continue;const r=shown(e);if(!r)continue;if(e instanceof SVGElement){const sl=e.closest('.tb-slot,.tb-loc');if(sl&&sl.getAnimations&&sl.getAnimations({subtree:true}).length)continue}let px=parseFloat(getComputedStyle(e).fontSize);
    if(e instanceof SVGElement){const m=e.getScreenCTM&&e.getScreenCTM();if(m)px=px*Math.hypot(m.a,m.b)}
    out.fonts.push([Math.round(px*10)/10,t.slice(0,24),lab(e)+(px<10?' {'+(()=>{const c=[];for(let a=e;a&&a.tagName!=='BODY'&&c.length<5;a=a.parentElement){const k=typeof a.className==='string'?a.className:(a.className&&a.className.baseVal)||'';c.push(a.tagName.toLowerCase()+(k?'.'+k.trim().split(/\s+/)[0]:''))}return c.join('<')})()+'}':'')])}
  // tap targets
  const sel='button,a[href],[data-a],[role=button],.bspot,.tb-loc,g.rglow,[onclick],input,select,.hc';
  const seen=new Set();
  for(const e of document.querySelectorAll(sel)){if(seen.has(e))continue;seen.add(e);const re=(e.matches('g.tb-loc')&&e.querySelector('.tb-ring'))||e;const r=shown(re)||shown(e);if(!r)continue;const rs=shown(e)||r;   /* size from the whole group, covered test from the ring */
    if(getComputedStyle(e).pointerEvents==='none')continue;
    if(e.closest('#perfhud,.perfhud'))continue;
    // hit box: probe a grid around the centre, keep points that resolve to e (or a child); box of those points
    const cx=Math.min(Math.max(r.left+r.width/2,1),vw-1),cy=Math.min(Math.max(r.top+r.height/2,1),vh-1);
    const hit=(x,y)=>{if(x<0||y<0||x>=vw||y>=vh)return false;const t=document.elementFromPoint(x,y);return !!t&&(t===e||e.contains(t))};
    const c0=hit(cx,cy);
    // covered test: sample 5 points inside the box
    let ok=0,tot=0;for(const fx of [.2,.5,.8])for(const fy of [.2,.5,.8]){const x=r.left+r.width*fx,y=r.top+r.height*fy;if(x<0||y<0||x>=vw||y>=vh)continue;tot++;if(hit(x,y))ok++}
    const txt=(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,20);
    if(!c0&&tot&&ok===0){out.covered.push([lab(e),txt,Math.round(r.width)+'x'+Math.round(r.height)]);continue}
    if(!c0)out.covered.push([lab(e)+' (centre covered, '+ok+'/'+tot+' pts hit)',txt,Math.round(r.width)+'x'+Math.round(r.height)]);
    const bw=Math.round(Math.min(rs.right,vw)-Math.max(rs.left,0)),bh=Math.round(Math.min(rs.bottom,vh)-Math.max(rs.top,0));
    out.taps.push([Math.round(r.width),Math.round(r.height),bw,bh,lab(e),txt,ok+'/'+tot])}
  return out};
module.exports.agg=function(){return {minFont:{},minTap:{},cov:{},nF:0,nT:0,samples:0}};
module.exports.add=function(A,o){A.samples++;
  for(const [px,t,l] of o.fonts){A.nF++;const k=l+'|'+px;if(!A.minFont[k])A.minFont[k]={px,t,l,n:0};A.minFont[k].n++}
  for(const [w,h,hw,hh,l,t,ok] of o.taps){A.nT++;const k=l;const a=A.minTap[k]||(A.minTap[k]={l,t,w,h,hw,hh,n:0});a.n++;if(Math.min(hw,hh)<Math.min(a.hw,a.hh)){a.w=w;a.h=h;a.hw=hw;a.hh=hh;a.t=t}}
  for(const [l,t,sz] of o.covered){const k=l+'|'+t;if(!A.cov[k])A.cov[k]={l,t,sz,n:0};A.cov[k].n++}};
module.exports.report=function(A,tag,FMIN,TMIN){
  const f=Object.values(A.minFont).sort((a,b)=>a.px-b.px),t=Object.values(A.minTap).sort((a,b)=>Math.min(a.hw,a.hh)-Math.min(b.hw,b.hh));
  const lines=[];lines.push(tag+' samples '+A.samples+' texts '+A.nF+' targets '+A.nT);
  lines.push(tag+' MIN FONT '+(f[0]?f[0].px:'-')+' px');
  for(const x of f.filter(x=>x.px<FMIN).slice(0,14))lines.push('   font '+x.px+' "'+x.t+'" '+x.l+' x'+x.n);
  lines.push(tag+' MIN TAP (box, clipped to screen) '+(t[0]?t[0].hw+'x'+t[0].hh:'-')+' px');
  for(const x of t.filter(x=>Math.min(x.hw,x.hh)<TMIN).slice(0,14))lines.push('   tap '+x.hw+'x'+x.hh+' (box '+x.w+'x'+x.h+') "'+x.t+'" '+x.l+' x'+x.n);
  const c=Object.values(A.cov);lines.push(tag+' COVERED '+c.length);for(const x of c.slice(0,10))lines.push('   covered "'+x.t+'" '+x.l+' '+x.sz+' x'+x.n);
  return {lines,minFont:f[0]?f[0].px:0,minTap:t[0]?Math.min(t[0].hw,t[0].hh):0,nBadF:f.filter(x=>x.px<FMIN).length,nBadT:t.filter(x=>Math.min(x.hw,x.hh)<TMIN).length,ncov:c.length}};
