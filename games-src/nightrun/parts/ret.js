/* ---------- retention parts (RETENTION.md). Each item has a flag in RET; a flag set to false leaves the game exactly as it was. ---------- */
const RET=window.RET=window.RET||{};
if(RET.oneMore===undefined)RET.oneMore=true;   // B5: run-end screens show Neon banked, the next unlock bar and a ONE MORE RUN button
RET.next=function(){   // the cheapest thing still to buy: {n, price, bank, pct, can}; null when everything is owned
  let best=null;const add=(n,p)=>{if(!(p>0))return;if(!best||p<best.price)best={n,price:p};};
  for(const id of WP_IDS){const cur=WP.pl[id]|0;if(cur>=WP_MAX)continue;add(WPD[id].n+' LV'+(cur+1),WP.price(id));}
  for(const s of SHIPS)if(s.id!=='std'&&!GA.own['ship_'+s.id])add(s.n,s.p||0);
  for(const c of CREW)if(!GA.own[c.id])add(c.n,c.p||0);
  for(const h of THEMES)if(h.id!=='neon'&&!GA.own['th_'+h.id])add(h.n,h.p||0);
  if(!best)return null;best.bank=GA.bank;best.pct=Math.min(100,Math.floor(100*GA.bank/best.price));best.can=GA.bank>=best.price;return best;};
{const st=document.createElement('style');st.textContent=`
.retBar{width:100%;max-width:min(92%,420px);margin:.5em auto;text-align:center;font-family:var(--mono);font-size:clamp(12px,min(3.4vw,2.4vh),17px);line-height:1.3;color:var(--dim)}
.retBar b{color:#fff}.retBar .rb{height:.9em;border-radius:99px;background:#ffffff1a;overflow:hidden;margin-top:.3em}
.retBar .rb i{display:block;height:100%;background:linear-gradient(90deg,#19e3ff,#ffb020)}.retBar.can .rb i{background:#ffb020}
`;document.head.appendChild(st);}
function retMake(id,host){let e=$(id);if(!e){e=document.createElement('div');e.id=id;e.className='retBar';host.insertBefore(e,host.querySelector('.row'));}return e;}
function retShow(){
  const on=RET.oneMore,add=($('oNeon')&&/nothing/.test($('oNeon').textContent))?0:(SH.lastBank|0),nx=on?RET.next():null,pay='Failed runs still pay: '+(add?'+'+add+' Neon banked':'nothing banked this time');
  for(const [id,host] of [['retO',$('over').querySelector('.in')],['retR',$('stres').querySelector('.in')]]){
    const e=retMake(id,host);e.hidden=!on;if(!on)continue;
    e.className='retBar'+(nx&&nx.can?' can':'');
    e.innerHTML=(id==='retO'?pay+'<br>':'')+(nx?(nx.can?'Ready in Garage: <b>'+nx.n+'</b> '+nx.price:'Next: <b>'+nx.n+'</b> '+nx.bank+'/'+nx.price)+'<div class="rb"><i style="width:'+nx.pct+'%"></i></div>':'Everything unlocked');}
  $('againBtn').textContent=on?'ONE MORE RUN':'FLY AGAIN';$('srRetry').textContent=on?'ONE MORE RUN':'RETRY';}
NR.on('runEnd',d=>{if(!d||d.quit)return;retShow();});

/* ===== B1 pay, B2 economy, B3 mercy ===== */
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
