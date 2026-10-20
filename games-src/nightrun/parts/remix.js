/* ---------- remix.js: every run plays a different cut of the stage script (owner 20 Oct 2026: enemies "very predictable and repeatable"). Flag RET.remix (default on); ?remix=0 = the old fixed scripts (no dice drawn).
   Per run one private seeded stream (one GR draw at the stage start, so daily / ?seed= runs stay reproducible) remixes the stage's VARY plan:
     ORDER    the free moments are shuffled among their slots; the intro, the order and timing of everything in the first 30 s (those moments only swap for an equal or cheaper equivalent), the set piece and the breathers stay where they are
     POOL     a moment's formation may be swapped for an equivalent (same feel, cost within 1, same gap class, already unlocked): the original plus up to 3 others
     SET PIECE one of 3 variants: as written | A and B swapped | A replaced by an equivalent
     TIMING   the moments get +-25% of their length (after the first 30 s), the stage keeps its total
     SPACE    per formation instance: entry side (mirror) and speed +-10%; per piece a lane shift of +-18 px (formations that leave a gap are never shifted)
   Balance: sum(cost x length) of the remix must stay within +-5% of the written script, else it is re-rolled (identity if nothing fits). The director still owns WHEN and HOW MUCH;
   telegraphs, gaps >= 96 px, entry grace and bullet caps are untouched. ---------- */
if(RET.remix===undefined)RET.remix=!/[?&]remix=0/.test(location.search);
const RMX=window.RMX={log:{},
  mk(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};},
  base(id){return id.replace(/~r$/,'');},
  cost(m){if(m.sig)return 0;const c=m.ids.map(i=>{const d=FM.L[RMX.base(i)];return d?d.cost:3;});return c.reduce((a,b)=>a+b,0)/c.length;},
  /* the equivalents of one formation on stage n: same job (a shared tag), cost within 1, both span the screen or neither, unlocked, not a micro-event */
  pool(id,n){const b=this.base(id),d=FM.L[b];if(!d||d.ev)return[id];const sh=d.tags.filter(t=>t!=='elite');
    const c=Object.keys(FM.L).filter(k=>{const o=FM.L[k];return k!==b&&!o.ev&&o.t<=n&&Math.abs(o.cost-d.cost)<=1&&(!!o.gap===!!d.gap)&&o.tags.some(t=>sh.includes(t))&&!!o.kinds.includes('gate')===!!d.kinds.includes('gate');})
      .sort((x,y)=>Math.abs(FM.L[x].cost-d.cost)-Math.abs(FM.L[y].cost-d.cost)||(x<y?-1:1)).slice(0,3);
    return[id].concat(c.map(k=>/~r$/.test(id)?k+'~r':k));},
  /* build one candidate; returns {ms,w,sig} */
  cut(st,rr,k0){const n=st.ms.length,ms=st.ms.map(m=>Object.assign({},m,{ids:m.ids.slice()}));
    const free=[];for(let i=k0;i<n;i++)if(!ms[i].sig&&!ms[i].br)free.push(i);
    const mv=free.map(i=>ms[i]);for(let i=mv.length-1;i>0;i--){const j=Math.floor(rr()*(i+1));[mv[i],mv[j]]=[mv[j],mv[i]];}free.forEach((p,j)=>{ms[p]=mv[j];});
    for(let p=0;p<n;p++){const m=ms[p];if(m.sig||m.br)continue;m.ids=m.ids.map(id=>{if(rr()<.2)return id;const c0=(FM.L[RMX.base(id)]||{cost:3}).cost,pl=RMX.pool(id,st.n).filter(q=>p>=k0||(FM.L[RMX.base(q)]||{cost:3}).cost<=c0);return pl[Math.floor(rr()*pl.length)];});m.raw=(m.br?'~':'')+m.ids.join('|')+(m.g?'+g':'');}
    const w=ms.map((m,i)=>i<k0?1:1+(rr()-.5)*.5);const sw=w.reduce((a,b)=>a+b,0);for(let i=0;i<n;i++)w[i]*=n/sw;
    let sig=st.s.sig;const v=Math.floor(rr()*3);
    if(v===1)sig=[sig[0],sig[2],sig[1],sig[3]];
    else if(v===2){const pl=RMX.pool(sig[1],st.n);sig=[sig[0],pl[Math.floor(rr()*pl.length)],sig[2],sig[3]];}
    return{ms,w,sig};},
  hull(ms,w,sig){const sc=(FM.L[sig[1]]||{cost:3}).cost+(FM.L[sig[2]]||{cost:3}).cost;return ms.reduce((a,m,i)=>a+(m.sig?sc/2:this.cost(m))*w[i],0);},
  apply(st){const rr=this.mk((GR()*4294967296)>>>0),n=st.ms.length;if(n<4)return;
    const secBar=4*Math.max(.3,(window.BT&&BT.spb)||.5),perM=Math.max(1,VARY.span()/n),k0=Math.max(1,Math.min(n-3,Math.ceil(30/(secBar*perM))));
    const orig=st.ms.map(m=>(m.sig?'*':m.br?'~':'')+m.ids.join('|')),h0=this.hull(st.ms,st.ms.map(()=>1),st.s.sig);let best=null;
    for(let t=0;t<14&&!best;t++){const c=this.cut(st,rr,k0),h=this.hull(c.ms,c.w,c.sig);if(Math.abs(h/h0-1)<=.05)best=c;}
    st.rr=this.mk((rr()*4294967296)>>>0);
    if(!best)return;
    st.ms=best.ms;st.rb=[0];let a=0;for(const x of best.w){a+=x;st.rb.push(a/n);}st.s=Object.assign({},st.s,{sig:best.sig});st.rmx={o:orig,k0,h:+(this.hull(best.ms,best.w,best.sig)/h0).toFixed(3)};}};
if(window.VARY&&window.FM){
{const pl=VARY.plan;VARY.plan=function(){pl.call(this);if(RET.remix&&this.st&&!G.lab&&!G.tut)try{RMX.apply(this.st);}catch(err){this.st.rmx=null;}};}
{const ix=VARY.idx;VARY.idx=function(){const st=this.st;if(!RET.remix||!st||!st.rb)return ix.call(this);const sp=this.span(),b=Math.max(0,G.dbar);
  if(b>=sp)return ix.call(this);const f=b/sp,n=st.ms.length;let i=0;while(i<n-1&&st.rb[i+1]<=f)i++;return i;};}
{const mk0=FM.make;FM.make=function(id,o){const I=mk0.call(this,id,o);if(RET.remix&&I&&window.VARY&&VARY.st&&VARY.st.rr&&VARY.active()){const rr=VARY.st.rr;I.mir=rr()<.5;I.tk*=1+(rr()-.5)*.2;I.rmx=rr;}return I;};}
{const pc0=FM.piece;FM.piece=function(I){if(RET.remix&&I&&I.rmx)I.rdy=I.def.gap?0:(I.rmx()-.5)*36;return pc0.call(this,I);};}
{const u0=FM.u;FM.u=function(kind,x,y,pf,o){const I=this.cur;if(RET.remix&&I&&I.rdy){const d=I.rdy;if(pf){const p0=pf;pf=(t,q)=>{const p=p0(t,q);return[p[0],p[1]+d];};}else y=clamp(y+d,26,H-26);}return u0.call(this,kind,x,y,pf,o);};}
}
