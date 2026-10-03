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
 const vis=e=>{if(!e.isConnected)return false;for(let n=e;n&&n!==document.documentElement;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<.05||n.hidden)return false}if(getComputedStyle(e).display==='contents')return true;const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
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
   if(!vis(el)||/^(SCRIPT|STYLE|CANVAS|TITLE|OPTION)$/.test(el.tagName))continue;
   const rg=document.createRange();rg.selectNodeContents(t);const rs=[...rg.getClientRects()].filter(r=>r.width>.5&&r.height>.5);if(!rs.length)continue;
   const L=Math.min(...rs.map(r=>r.left)),T=Math.min(...rs.map(r=>r.top)),R=Math.max(...rs.map(r=>r.right)),B=Math.max(...rs.map(r=>r.bottom));
   const lab=nm(el)+' "'+txt.slice(0,32)+'"';
   // own-box clipping (element or any block ancestor up to the panel)
   for(const c of clipAnc(el,true)){const n=c.n,s=getComputedStyle(n);const hid=/(hidden|clip)/.test(s.overflowY);const hidx=/(hidden|clip)/.test(s.overflowX);
     if(hid&&!c.sc&&n.scrollHeight>n.clientHeight+1&&n.clientHeight>0){const nr=n.getBoundingClientRect();if(B>nr.bottom+1||T<nr.top-1){out.push('TEXT CLIPPED (height '+n.scrollHeight+'>'+n.clientHeight+' in '+nm(n)+'): '+lab);break}}
     if(hidx&&!c.sc&&n.scrollWidth>n.clientWidth+1&&s.textOverflow!=='ellipsis'&&n.clientWidth>0){const nr=n.getBoundingClientRect();if(R>nr.right+1||L<nr.left-1){out.push('TEXT CLIPPED (width '+n.scrollWidth+'>'+n.clientWidth+' in '+nm(n)+'): '+lab);break}}}
   // glyph box vs clipping ancestors
   let bad=false,scrolled=false;
   for(const c of clipAnc(el)){const q=c.n.getBoundingClientRect();
     const inter=!(R<=q.left||L>=q.right||B<=q.top||T>=q.bottom);
     const cut=L<q.left-1.5||R>q.right+1.5||T<q.top-1.5||B>q.bottom+1.5;
     if(c.sc){if(!inter)scrolled=true;else if(cut&&c.n.scrollHeight<=c.n.clientHeight+1&&c.n.scrollWidth<=c.n.clientWidth+1){bad=nm(c.n)}continue}
     if(c.hid&&inter&&cut){bad=nm(c.n);break}}
   if(bad){out.push('TEXT OUTSIDE CLIPPER '+bad+' ['+[L,T,R,B].map(Math.round)+']: '+lab);continue}
   if(scrolled)continue;
   // inside a scroller whose box straddles the viewport edge is also an overflow; plain viewport check
   if((L<-1.5||T<-1.5||R>VW+1.5||B>VH+1.5)&&R>0&&B>0&&L<VW&&T<VH){const sc=clipAnc(el).some(c=>c.sc&&c.n.scrollHeight>c.n.clientHeight+1);if(!sc)out.push('TEXT OUTSIDE VIEWPORT ['+[L,T,R,B].map(Math.round)+'] vs '+VW+'x'+VH+': '+lab)}
  }
 }
 // primary button(s)
 const PRI='.pri,.primary,.go,.btn.go,.btn.pri,.pb.pri,.ps-go,[data-a=cont],[data-a=next],[data-a=ok],[data-a=take],[data-a=start],[data-a=coachok],[data-a=pnext],[data-ui=start],[data-ui=play],[data-ph=go],[data-ph=dismiss],[data-tour=next],[data-a=sunkok],[data-a=guided]';
 const cands=[...document.querySelectorAll(PRI)].filter(b=>vis(b)&&b.tagName!=='A'||vis(b)&&b.tagName==='A');
 const seenb=new Set();
 for(const b of cands){
   if(!inPanel(b)&&!b.closest('#modal,#startscreen,.start,.menu'))continue;
   if(b.disabled||b.getAttribute('aria-disabled')==='true')continue;
   if(b.closest('.gx-bar')&&!/start|cont/.test(b.className))continue;
   const r=b.getBoundingClientRect();const lab=nm(b)+' "'+(b.textContent||'').trim().slice(0,20)+'"';
   // skip buttons that live inside a scroller and are scrolled out of it only if some other primary is reachable? no: report
   if(r.left<-1||r.top<-1||r.right>VW+1||r.bottom>VH+1){out.push('PRIMARY BUTTON NOT FULLY IN VIEWPORT ['+[r.left,r.top,r.right,r.bottom].map(Math.round)+'] '+lab);continue}
   const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);
   if(h&&!(h===b||b.contains(h))){const o=h.closest('.scrim,.zoom,.oppfull,.modal,#modal,#pzoom,[class*=overlay],[class*=scrim]');const fx=(()=>{for(let n=h;n&&n!==document.body;n=n.parentElement){const st=getComputedStyle(n);if(st.position==='fixed'){const q=n.getBoundingClientRect();if(q.width*q.height>.6*VW*VH&&!n.contains(b))return true}}return false})();if(o||fx)continue}
   if(!h||!(h===b||b.contains(h)||h.contains(b)&&h.closest('button,a,[data-a]')===b)){out.push('PRIMARY BUTTON COVERED by '+(h?nm(h):'none')+': '+lab);continue}
   // clipped by a scroller / hidden ancestor
   for(const c of clipAnc(b)){const q=c.n.getBoundingClientRect();if(r.left<q.left-1||r.right>q.right+1||r.top<q.top-1||r.bottom>q.bottom+1){out.push('PRIMARY BUTTON CLIPPED by '+nm(c.n)+' '+(c.sc?'(scrolled away)':'')+' btn['+[r.left,r.top,r.right,r.bottom].map(Math.round)+'] clip['+[q.left,q.top,q.right,q.bottom].map(Math.round)+']: '+lab);break}}
 }
 return [...new Set(out)];
})()`;
exports.SRC=SRC;
exports.run=async(page)=>{try{return await page.evaluate(SRC)}catch(e){return ['phfit eval error '+e.message.slice(0,80)]}};
