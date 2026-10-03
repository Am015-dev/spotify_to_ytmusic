// Shared phone-fit check: CLIPPED TEXT + PRIMARY BUTTON. Used by every game's lay-phone.js:
//   const FIT=require('<rel>/phfit.js'); ... const f=await FIT.run(page); f.forEach(m=>prob(tag,m));
// Text: every visible text node inside a panel/dock/pop-up/modal/drawer must not be cut off by an overflow:hidden/clip
//   ancestor (own scrollHeight>clientHeight+1, or its glyph box leaves the clipper), nor run off the viewport
//   (unless it lives in a scrolling (auto/scroll) ancestor and is merely scrolled away).
// Primary button: the visible primary action (.pri/.go/.primary/.rec-go, [data-a=cont|next|ok|take|start|coachok]) in the topmost
//   panel must be fully inside the viewport and hit-test to itself at its centre (not covered by another element).
const SRC=`(()=>{
 const PANELS='#pc,#ppop,#ps,#step,#story,#modal,#ph-pop,#ph-z,#pzoom,.gx-dock,.gx-drawer.on,.pcard,.mbox,.zoom,#netst,.gx-bar,#cardstrip,.ph-card,.ph-pop,#phpop,#phcard,#hud,.pstrip,.dock';
 const VW=innerWidth,VH=innerHeight,out=[];
 const vis=e=>{if(!e.isConnected)return false;for(let n=e;n&&n!==document.documentElement;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<.05||n.hidden||s.contentVisibility==='hidden')return false;if(n.tagName==='DETAILS'&&!n.open&&!(e.closest('summary')&&e.closest('summary').parentElement===n))return false}if(getComputedStyle(e).display==='contents')return true;const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const nm=e=>(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).slice(0,2).join('.'):'')||e.tagName;
 const panels=[...document.querySelectorAll(PANELS)].filter(vis);
 const inPanel=e=>panels.some(p=>p.contains(e));
 const seen=new Set();
 const clipAnc=(e,self)=>{const a=[];let pos=getComputedStyle(e).position;if(self){const s0=getComputedStyle(e);if(/(auto|scroll|hidden|clip)/.test(s0.overflowX+s0.overflowY))a.push({n:e,sc:/(auto|scroll)/.test(s0.overflowX+s0.overflowY),hid:/(hidden|clip)/.test(s0.overflowX+s0.overflowY)})}
  for(let n=e.parentElement;n&&n!==document.documentElement&&n!==document.body;n=n.parentElement){const s=getComputedStyle(n);const tr=(s.transform!=='none'&&s.transform)||(s.filter!=='none'&&s.filter)||s.willChange.includes('transform')||s.contain.includes('paint');
   const skip=(pos==='fixed'&&!tr)||(pos==='absolute'&&s.position==='static'&&!tr);
   if(s.display==='contents')continue;
   if(!skip){const ox=s.overflowX,oy=s.overflowY;const sc=/(auto|scroll)/.test(ox+oy);const hid=/(hidden|clip)/.test(ox+oy);if(sc||hid)a.push({n,sc,hid,ox,oy});pos=s.position}}
  return a};
 for(const p of panels){
  const w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);let t;
  while(t=w.nextNode()){
   const txt=t.nodeValue.replace(/\\s+/g,' ').trim();if(txt.length<1)continue;const el=t.parentElement;if(!el||seen.has(t))continue;seen.add(t);
   if(!vis(el)||/^(SCRIPT|STYLE|CANVAS|TITLE|OPTION)$/.test(el.tagName)||el.closest('svg'))continue;
   const rg=document.createRange();rg.selectNodeContents(t);const rs=[...rg.getClientRects()].filter(r=>r.width>.5&&r.height>.5);if(!rs.length)continue;
   const L=Math.min(...rs.map(r=>r.left)),T=Math.min(...rs.map(r=>r.top)),R=Math.max(...rs.map(r=>r.right)),B=Math.max(...rs.map(r=>r.bottom));
   const lab=nm(el)+' "'+txt.slice(0,32)+'"';
   // own-box clipping (element or any block ancestor up to the panel)
   for(const c of clipAnc(el,true)){const n=c.n,s=getComputedStyle(n);if(c.sc&&(n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1))break;const hid=/(hidden|clip)/.test(s.overflowY);const hidx=/(hidden|clip)/.test(s.overflowX);
     if(hid&&!c.sc&&n.scrollHeight>n.clientHeight+1&&n.clientHeight>0){const nr=n.getBoundingClientRect();if(B>nr.bottom+1||T<nr.top-1){out.push('TEXT CLIPPED (height '+n.scrollHeight+'>'+n.clientHeight+' in '+nm(n)+'): '+lab);break}}
     if(hidx&&!c.sc&&n.scrollWidth>n.clientWidth+1&&s.textOverflow!=='ellipsis'&&n.clientWidth>0){const nr=n.getBoundingClientRect();if(R>nr.right+1||L<nr.left-1){out.push('TEXT CLIPPED (width '+n.scrollWidth+'>'+n.clientWidth+' in '+nm(n)+'): '+lab);break}}}
   // glyph box vs clipping ancestors
   let bad=false,scrolled=false;let vl=L,vt=T,vr=R,vb=B;
   for(const c of clipAnc(el)){const q=c.n.getBoundingClientRect();
     const inter=!(vr<=q.left||vl>=q.right||vb<=q.top||vt>=q.bottom);
     if(!inter){if(c.sc){scrolled=true;break}continue}
     const cut=vl<q.left-1.5||vr>q.right+1.5||vt<q.top-1.5||vb>q.bottom+1.5;
     if(c.sc){const can=c.n.scrollHeight>c.n.clientHeight+1||c.n.scrollWidth>c.n.clientWidth+1;if(cut&&!can){bad=nm(c.n);break}vl=Math.max(vl,q.left);vt=Math.max(vt,q.top);vr=Math.min(vr,q.right);vb=Math.min(vb,q.bottom);continue}
     if(c.hid&&cut){const cs2=getComputedStyle(c.n);const ell=cs2.textOverflow==='ellipsis'||(cs2.webkitLineClamp&&cs2.webkitLineClamp!=='none');if(ell)continue;bad=nm(c.n);break}}
   if(bad){out.push('TEXT OUTSIDE CLIPPER '+bad+' ['+[L,T,R,B].map(Math.round)+']: '+lab);continue}
   if(scrolled)continue;
   if((vl<-1.5||vt<-1.5||vr>VW+1.5||vb>VH+1.5)&&vr>0&&vb>0&&vl<VW&&vt<VH)out.push('TEXT OUTSIDE VIEWPORT ['+[vl,vt,vr,vb].map(Math.round)+'] vs '+VW+'x'+VH+': '+lab)
  }
 }
 // primary button(s)
 const PRI='.pri,.primary,.go,.btn.go,.btn.pri,.pb.pri,.ps-go,[data-a=cont],[data-a=next],[data-a=ok],[data-a=take],[data-a=start],[data-a=coachok],[data-a=pnext],[data-ui=start],[data-ui=play],[data-ph=go],[data-ph=dismiss],[data-tour=next],[data-a=sunkok],[data-a=guided]';
 const cands=[...document.querySelectorAll(PRI)].filter(b=>vis(b)&&b.tagName!=='A'||vis(b)&&b.tagName==='A');
 const grp=new Map();for(const b of cands){let sc=null;for(let n=b.parentElement;n&&n!==document.body;n=n.parentElement){const st=getComputedStyle(n);if(/(auto|scroll)/.test(st.overflowY)&&n.scrollHeight>n.clientHeight+1){sc=n;break}}b.__sc=sc;if(sc)grp.set(sc,(grp.get(sc)||0)+1)}
 for(const b of cands){
   if(!inPanel(b)&&!b.closest('#modal,#startscreen,.start,.menu'))continue;
   if(b.__sc&&grp.get(b.__sc)>1)continue;
   if(b.disabled||b.getAttribute('aria-disabled')==='true')continue;
   if(b.closest('.gx-bar')&&!/start|cont/.test(b.className))continue;
   const r=b.getBoundingClientRect();const lab=nm(b)+' "'+(b.textContent||'').trim().slice(0,20)+'"';
   // skip buttons that live inside a scroller and are scrolled out of it only if some other primary is reachable? no: report
   if(r.left<-1||r.top<-1||r.right>VW+1||r.bottom>VH+1){out.push('PRIMARY BUTTON NOT FULLY IN VIEWPORT ['+[r.left,r.top,r.right,r.bottom].map(Math.round)+'] '+lab);continue}
   const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);
   if(h&&!(h===b||b.contains(h))){const o=h.closest('.scrim,.zoom,.oppfull,.modal,#modal,#pzoom,#ppop,#pc,#pcx,.gx-drawer,.ph-pop,#ph-pop,#ph-z,.more,[role=menu],[class*=overlay],[class*=scrim]');const o2=o&&!o.contains(b)?o:null;const fx=(()=>{for(let n=h;n&&n!==document.body;n=n.parentElement){const st=getComputedStyle(n);if(st.position==='fixed'){const q=n.getBoundingClientRect();if(q.width*q.height>.6*VW*VH&&!n.contains(b))return true}}return false})();if(o2||fx)continue}
   if(!h||!(h===b||b.contains(h)||h.contains(b)&&h.closest('button,a,[data-a]')===b)){out.push('PRIMARY BUTTON COVERED by '+(h?nm(h):'none')+': '+lab);continue}
   // clipped by a scroller / hidden ancestor
   for(const c of clipAnc(b)){const q=c.n.getBoundingClientRect();if(r.left<q.left-1||r.right>q.right+1||r.top<q.top-1||r.bottom>q.bottom+1){out.push('PRIMARY BUTTON CLIPPED by '+nm(c.n)+' '+(c.sc?'(scrolled away)':'')+' btn['+[r.left,r.top,r.right,r.bottom].map(Math.round)+'] clip['+[q.left,q.top,q.right,q.bottom].map(Math.round)+']: '+lab);break}}
 }
 return [...new Set(out)];
})()`;
exports.SRC=SRC;
exports.run=async(page)=>{try{await page.evaluate(()=>{if(!document.getElementById('phfit-noanim')){const st=document.createElement('style');st.id='phfit-noanim';st.textContent='*,*::before,*::after{animation:none!important;transition:none!important}';document.head.appendChild(st)}});await page.evaluate(()=>Promise.race([Promise.all(document.getAnimations().filter(a=>{try{return a.effect.getComputedTiming().endTime!==Infinity&&a.playState==='running'}catch(e){return false}}).map(a=>a.finished.catch(()=>0))),new Promise(r=>setTimeout(r,2500))]));return await page.evaluate(SRC)}catch(e){return ['phfit eval error '+e.message.slice(0,80)]}};
// share of the short side the board must reach: 0.85 normally, 0.75 on short portrait screens (usable height < 800 px)
exports.share=(W,H)=>(W<H&&H<800)?.75:.85;
// extra checks (rc): no empty band > 12 px between the visible content (bar, board, dock) and the viewport edges;
// no heading hidden under a sticky/overlapping element (elementFromPoint at its centre must hit it)
exports.extraSRC=`(()=>{const out=[];const VW=innerWidth,VH=innerHeight;
 const els=[...document.querySelectorAll('.gx-bar,.gx-board,.gx-dock,#phview,#story,#modal .mbox,#start')].filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>20&&r.height>20&&s.display!=='none'&&s.visibility!=='hidden'});
 let l=1e9,t=1e9,r=-1e9,b=-1e9;for(const e of els){const q=e.getBoundingClientRect();l=Math.min(l,q.left);t=Math.min(t,q.top);r=Math.max(r,q.right);b=Math.max(b,q.bottom)}
 if(els.length){if(t>12)out.push('EMPTY BAND top '+Math.round(t));if(l>12)out.push('EMPTY BAND left '+Math.round(l));if(VW-r>12)out.push('EMPTY BAND right '+Math.round(VW-r));if(VH-b>12)out.push('EMPTY BAND bottom '+Math.round(VH-b))}
 for(const h of document.querySelectorAll('.gx-dock h1,.gx-dock h2,.gx-dock h3,.gx-dock h4,#ppop h1,#ppop h2,#ppop h3,#ppop h4,#ppop .pp-t,#story h2,#panel h4')){const q=h.getBoundingClientRect();if(!q.width||!q.height)continue;const s=getComputedStyle(h);if(s.visibility==='hidden'||s.display==='none')continue;
  const x=q.left+Math.min(q.width/2,60),y=q.top+q.height/2;if(x<0||y<0||x>VW||y>VH)continue;
  let clipped=false;for(let n=h.parentElement;n;n=n.parentElement){const cs=getComputedStyle(n);if(/(auto|scroll|hidden)/.test(cs.overflowY)){const nr=n.getBoundingClientRect();if(y<nr.top||y>nr.bottom){clipped=true;break}}}if(clipped)continue;
  const e=document.elementFromPoint(x,y);const TL='#pzoom,#modal,.gx-drawer,#ppop,#pc';if(e&&e.closest(TL)!==h.closest(TL))continue;if(e&&!(h===e||h.contains(e)||e.contains(h)))out.push('HEADING COVERED by '+(e.id||e.className||e.tagName)+': "'+h.textContent.trim().slice(0,30)+'"')}
 return out})()`;
exports.extra=async(page)=>{try{return await page.evaluate(exports.extraSRC)}catch(e){return []}};
