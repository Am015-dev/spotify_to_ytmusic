/* ===== RETENTION (loads after meta.js): flags for the 10-hour plan, see RETENTION.md. Every flag false = the game plays exactly as before. ===== */
var RET=window.RET=window.RET||{};
Object.assign(RET,{clearPay:true,econ:true,mercy:true},{wk:.36,tk:.12,nk:.045});   // wk: weapon price scale, tk: perk price scale, nk: Neon per kill (see RETENTION.md B2)
/* B1: a stage clear pays 40+12n Neon the first time, +25 per new star, 10% of the base on later clears */
RET.payClear=function(n,sum){const old=sSave.stars[n]||0,first=old<1,base=40+12*n,ns=Math.max(0,sum-old);
  const pay=first?base+25*ns:Math.round(base*.1)+25*ns;GA.bank+=pay;gsave();this.last={n,pay,first,ns};return pay;};
RET.resultRow=function(){const l=this.last;return l&&l.pay?`<div class="sr ok"><span class="sg">◆</span> +${l.pay} Neon${l.first?' · first clear':''}</div>`:'';};
/* B3: failed tries per stage (kept in this browser); 2 fails = +1 hull on the next try, 4 = the stage level also drops by 0.3. A clear resets it. */
RET.fails={};try{const o=JSON.parse(localStorage.getItem('mnr_retfail')||'{}');if(o&&typeof o==='object')for(const k in o)RET.fails[k]=Math.max(0,o[k]|0);}catch(e){}
RET.saveFails=()=>{try{localStorage.setItem('mnr_retfail',JSON.stringify(RET.fails));}catch(e){}};
RET.mercyHull=n=>(RET.fails[n]|0)>=2?1:0;
RET.mercyLvl=n=>(RET.fails[n]|0)>=4?.3:0;
NR.on('runEnd',d=>{if(!RET.mercy||!d||!d.story)return;const n=d.story;
  if(d.cleared)delete RET.fails[n];else RET.fails[n]=(RET.fails[n]|0)+1;RET.saveFails();});
NR.on('runStart',d=>{if(!RET.mercy||!d||!d.story||!RET.mercyHull(d.story))return;
  G.note={t:3,txt:'MERCY: +1 hull'+(RET.mercyLvl(d.story)?', a little easier':'')+' this try'};});
/* B2: what a full garage costs, summed from the live prices (econ-test.js prints it) */
RET.totalCost=function(){let t=0;
  for(const d of TP_DEF)for(let l=0;l<d.max;l++)t+=tpPrice(d,l);
  for(const id of WP_IDS){t+=WPD[id].p?(RET.econ?Math.max(5,Math.round(WPD[id].p*RET.wk)):WPD[id].p):0;for(let L=1;L<WP_MAX;L++)t+=WPX_PRICE(L);}
  for(const a of [SHIPS,CREW,THEMES])for(const x of a)t+=x.p||0;
  return t;};
RET.probe=()=>({w:WPX_PRICE(1),k:tpPrice(TP_BY.dmg,0)});
