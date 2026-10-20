/* ---------- DENSITY: a per-stage budget of enemy bullets on screen (flag RET.density, default ON; ?density=0 = the old rules). Test: nightrun/density-test.js. BALANCE.md "Density".
   Industry practice: a shooter ramps the amount of readable fire, not its speed, and alternates heavy and light stretches. The budget (Normal): planned bullets on screen in a HEAVY
   stretch rise from about 9 at stage 3 to 22 at stage 30; a LIGHT stretch (a breather, every 40 s: 28 s heavy, 12 s light, the first 10 s of a stage light) is half of it.
   Easy x.75, Hard x1.45, Very hard x1.6 (DF.dn); never above ebCap()-3 so enemy fire keeps its room.
   When the screen holds fewer bullets than the budget, the director (dir.js beat hook) sends a SLOW CURTAIN: 3 to 6 columns of slow bullets that fall from the top, announced by a marker for
   >= .65 s; columns are >= 110 px apart (also from columns still falling) so the free gap is >= 96 px, none above the ship's column, speed 105-135 (BCAP and ebCap still apply: eb()).
   Not during bosses, the tutorial, the Lab or the pit stop. ---------- */
if(RET.density===undefined)RET.density=!/[?&]density=0/.test(location.search);
const DENS=window.DENS={st:{curtains:0,bul:0,maxGap:0},busy:0,last:-9,px:[],
  get on(){return!!RET.density&&!G.tut&&!G.lab&&!G.boss&&!G.bossDone&&!SH.active&&!(ST.on&&ST.n<=2);},
  idx(){return ST.on?ST.n:20+G.di*3+(G.loop|0);},
  heavy(){const t=(G.t+30)%40;return t<28;},                         // false = a breather
  budget(){const n=this.idx(),h=clamp(8.5+(24-8.5)*(n-3)/27,5,24.5)*(DF.dn||1),cap=ebCap()-2;
    return Math.min(this.heavy()?h:h*.6,cap);},
  lead(){return Math.max(2,Math.ceil(.7/(BT.spb||.5)));},            // marker beats: >= .65 s at any tempo
  cols(k){const xs=this.px.slice();for(const b of G.eb)if(b.dn&&!b.dead)xs.push(b.x);const out=[];let tries=0;
    while(out.length<k&&tries++<60){const x=gr(150,W-60);if(Math.abs(x-P.x)<90)continue;if(xs.some(q=>Math.abs(q-x)<115)||out.some(q=>Math.abs(q-x)<115))continue;out.push(x);}return out;},
  beat(){const w=this.st.why||(this.st.why={call:0,off:0,cool:0,full:0,nocol:0,ok:0});w.call++;if(!RET.density||!this.on||G.dbar<2&&!ST.on){w.off++;return;}
    if(G.bc<this.last+2){w.cool++;return;}
    const want=this.budget(),have=G.eb.length+this.busy*3,def=want-have;if(def<3){w.full++;return;}
    const k=clamp(Math.ceil(def/3.2),2,7),xs=this.cols(k);if(!xs.length){w.nocol++;return;}w.ok++;
    this.last=G.bc;this.busy+=xs.length;for(const x of xs)this.px.push(x);this.st.curtains++;
    const sp=gr(105,135),per=this.idx()>=10?4:3;
    for(const x of xs)WARN.push({x,y:12,b:G.bc,kind:'rain'});
    DIR.later(this.lead(),()=>{for(const x of xs){const w=WARN.findIndex(q=>q.x===x&&q.kind==='rain');if(w>=0)WARN.splice(w,1);const pi=this.px.indexOf(x);if(pi>=0)this.px.splice(pi,1);this.busy=Math.max(0,this.busy-1);if(G.dead||G.boss||Math.abs(x-P.x)<70)continue;
      for(let j=0;j<per;j++){const n=G.eb.length;eb.src={arm:true};eb(x,8+j*40,Math.PI/2,sp,'#ffa02d',5);eb.src=null;if(G.eb.length>n){G.eb[n].dn=1;this.st.bul++;}}}});}};
/* boss fights show at most MAXV distinct attacks (industry: 6-12): the rarest ones are gated out of every phase list (never a list left empty); armour.js HP and caps are untouched */
DENS.MAXV=12;
DENS.trimBoss=function(e){if(!RET.density||!e.lists)return;const cnt={};for(const l of e.lists)for(const v of l)cnt[v]=(cnt[v]||0)+1;
  const ks=Object.keys(cnt);this.st.k=ks.length;if(ks.length<=this.MAXV)return;
  ks.sort((a,b)=>cnt[a]-cnt[b]||(e.lists[e.lists.length-1].indexOf(b)-e.lists[e.lists.length-1].indexOf(a)));
  for(const v of ks){if(Object.keys(cnt).length<=this.MAXV)break;
    if(e.lists.some(l=>l.length>1||l[0]!==v)&&e.lists.every(l=>l.filter(x=>x!==v).length>0)){e.lists=e.lists.map(l=>l.filter(x=>x!==v));delete cnt[v];}}
  this.st.trim=(this.st.trim||0)+1;};
NR.on('runStart',()=>{DENS.busy=0;DENS.last=-9;DENS.px.length=0;});
/* a boss gets its moveset (and so its trimmed list) at spawn, not on its first beat: the old phase lists never show next to the new ones */
{const sb=spawnBoss;spawnBoss=function(o){const b=sb(o);if(RET.density&&b&&b.bm===undefined&&window.BMV&&!(window.BPL&&BPL.on))try{BMV.init(b);}catch(e){}return b;};}
