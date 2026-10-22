// PURPOSE: eye strain pass: flash/glitch rate and alpha caps, shake caps, glow/scan lines, text floors, Comfort settings, colour-blind remap
// FLAG: RET.comfort (?comfort=0)
// TEST: comfort-test.js
/* ---------- comfort.js: eye strain (owner, 21 Oct 2026, real gamer feedback "EYE STRAIN"). Flag RET.comfort, default ON; ?comfort=0 = the old look and feel.
   Test: nightrun/comfort-test.js (flashes, contrast, caps, text size, settings). Only global effect parameters live here; hitboxes, timing, armour.js and hard.js are untouched.
   FLASH   the full-screen flash (G.flash) and glitch (G.glitch) may start at most 3 times a second and their overlay alpha is capped (Full .10, Reduced .05, Off 0): under the
           WCAG 2.3.1 general flash threshold at every level. Warning blinks run at 6 Hz at most (3 flashes a second, BK()).
   SHAKE   amplitude cap Full 8 / Low 4 / Off 0 (it decays at 40 per second: never longer than 0.2 s). Reduced motion (prefers-reduced-motion, settings > Comfort) = no shake, no edge or tier pulse, no HUD pop.
   GLOW    Low (default) scales every glow sprite (G_), the tier wash and the edge pulse to 60%. Scan lines: On (default, softer and wider apart) / Off; the vignette is lighter.
   TEXT    canvas text is never below 12 css px on a phone (HUD 14), DOM font sizes below 12 px are raised to 12 (Large text: 14 / HUD 16), the dim text colour is lighter (4.5:1).
   COLOUR  Colour-blind palette (Deuteranopia / Protanopia): one hue remap of every canvas colour (greens -> blue, reds -> orange), installed only while on.
   Settings group "Comfort" (SET.flash, shake, glow, scan, txt, hc, cbp, rm + the Calm mode preset) lives in the one Settings card; saved with mnr_set. ---------- */
if(RET.comfort===undefined)RET.comfort=window.CMF_ON!==false;
const COM=window.COM={
  clk:0,lf:-9,lg:-9,pf:0,pg:0,k:1,hud:0,phone:false,
  on(){return !!RET.comfort;},
  cap:{flash:[0,.05,.10],shake:[0,4,8]},
  /* --- rate limiter: called once a frame by render() before the overlays are drawn --- */
  gate(dt){this.clk+=dt;if(!(this.clk-(this.kT||-9)<.5)){this.kT=this.clk;this.k=cv.getBoundingClientRect().width/cv.width||1;this.phone=!!(window.touchUI||innerWidth<=700);}
    if(!this.on())return;const g=G;
    if(g.flash>this.pf+.01){if(this.clk-this.lf<.34)g.flash=this.pf;else this.lf=this.clk;}this.pf=g.flash;
    if(g.glitch>this.pg+.01){if(this.clk-this.lg<.34)g.glitch=this.pg;else this.lg=this.clk;}this.pg=g.glitch;},
  fa(){const a=G.flash*.5;return this.on()?Math.min(a,this.cap.flash[SET.flash]??.1):a;},      // overlay alpha of the white flash
  ga(){const a=G.glitch*.25;return this.on()?Math.min(a,.06):a;},                              // overlay alpha of the red glitch tint
  gk(){return this.on()?.4:1;},                                                                 // glitch tear offset factor
  sk(v){if(!this.on())return v;if(SET.rm)return 0;return Math.min(v,this.cap.shake[SET.shake]??8);},   // screen shake amplitude
  g(){return this.on()&&SET.glow<2?.6:1;},                                                      // glow factor (Low = 60%)
  pg_(){return this.on()&&SET.rm?0:this.g();},                                                  // edge / tier pulse: none in reduced motion
  scanP(){if(!this.on())return null;return{a:SET.scan===false?0:.07,pitch:4,v:SET.scan===false?.3:.4,k:(SET.scan===false?0:1)+'|'};},   // scan lines + vignette strength
  /* --- text: canvas fonts get a floor in css px (setter hook), DOM rules get theirs by rewriting the sheets once --- */
  minC(){return this.on()&&this.phone?(SET.txt==='large'?14:12):0;},
  minH(){return this.on()&&this.phone?(SET.txt==='large'?16:14):0;},
  minD(){return this.on()?(SET.txt==='large'?14:12):0;},
  /* --- colour-blind hue remap --- */
  cbMap(c){const m=this.cbc||(this.cbc=new Map()),k=SET.cbp+c;let r=m.get(k);if(r!==undefined)return r;r=this.cbRemap(c);if(m.size>4000)m.clear();m.set(k,r);return r;},
  cbRemap(c){const mm=/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(c);if(!mm)return c;let h=mm[1];if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    const R=parseInt(h.slice(0,2),16)/255,Gc=parseInt(h.slice(2,4),16)/255,B=parseInt(h.slice(4,6),16)/255,al=h.length===8?h.slice(6):'',mx=Math.max(R,Gc,B),mn=Math.min(R,Gc,B),d=mx-mn;
    if(d<.12)return c;let hu=d?mx===R?((Gc-B)/d+6)%6:mx===Gc?(B-R)/d+2:(R-Gc)/d+4:0;hu*=60;let l=(mx+mn)/2;const s=d/(1-Math.abs(2*l-1));
    if(hu>=95&&hu<=175)hu=210;else if(hu>=335||hu<=22){hu=32;if(SET.cbp==='prot')l=Math.min(.78,l+.12);}else return c;   // greens -> blue, reds -> orange (protanopia: reds are dark, lift them)
    const q=(1-Math.abs(2*l-1))*s,x=q*(1-Math.abs((hu/60)%2-1)),m=l-q/2,[r,g,b]=hu<60?[q,x,0]:hu<120?[x,q,0]:hu<180?[0,q,x]:hu<240?[0,x,q]:hu<300?[x,0,q]:[q,0,x];
    const hx=v=>Math.round((v+m)*255).toString(16).padStart(2,'0');return '#'+hx(r)+hx(g)+hx(b)+al;},
  hy(){return this.on()&&this.phone?3:0;},                                                        // the x-tier label drops 3 px when its font is raised to 14
  cbOn:false,
  cbApply(){const on=SET.cbp==='deut'||SET.cbp==='prot';if(on===this.cbOn){this.cbc&&this.cbc.clear();return;}this.cbOn=on;const P=CanvasRenderingContext2D.prototype,me=this;
    for(const p of ['fillStyle','strokeStyle','shadowColor']){if(on){const d=Object.getOwnPropertyDescriptor(P,p);(me.cbd||(me.cbd={}))[p]=d;
        Object.defineProperty(P,p,{configurable:true,enumerable:d.enumerable,get:d.get,set(v){d.set.call(this,typeof v==='string'&&v[0]==='#'?me.cbMap(v):v);}});}
      else if(me.cbd&&me.cbd[p])Object.defineProperty(P,p,me.cbd[p]);}
    const G0=CanvasGradient.prototype;if(on){me.cbg=G0.addColorStop;G0.addColorStop=function(o,c){return me.cbg.call(this,o,typeof c==='string'&&c[0]==='#'?me.cbMap(c):c);};}else if(me.cbg)G0.addColorStop=me.cbg;
    for(const k in gc)delete gc[k];},                                                           // the glow sprites are cached by colour
  /* --- the minimum canvas font (setter hook, always installed, a no-op while the floor is 0) --- */
  fontHook(){const P=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(P,'font'),me=this;
    Object.defineProperty(P,'font',{configurable:true,enumerable:d.enumerable,get:d.get,set(v){
      const f=me.hud?me.minH():me.minC();if(f&&this.canvas===cv&&typeof v==='string'){const m=/(\d+(?:\.\d+)?)px/.exec(v);if(m){const t=this.getTransform(),css=parseFloat(m[1])*Math.hypot(t.a,t.b)*me.k;
        if(css<f-.01)v=v.replace(m[0],(parseFloat(m[1])*f/css).toFixed(2)+'px');}}
      d.set.call(this,v);}});},
  /* --- DOM: raise every font size below the floor in the stylesheets (originals kept, so the text size can change live) --- */
  css(){const mn=this.minD(),seen=this.cssSeen||(this.cssSeen=new WeakMap());
    const walk=rules=>{for(const r of rules){if(r.cssRules&&!r.style){try{walk(r.cssRules);}catch(e){}continue;}if(!r.style)continue;
      const sm=seen.get(r)||(seen.set(r,{}),seen.get(r));
      for(const p of ['font-size','font']){let o=sm[p];if(o===undefined){const v=r.style.getPropertyValue(p);if(!/\d\s*px/.test(v)){sm[p]=null;continue;}o=sm[p]=v;}if(o===null)continue;
        const nv=mn?o.replace(/(^|[^\d.])(\d+(?:\.\d+)?)px/g,(a,b,n)=>+n<mn&&+n>=6?b+mn+'px':a):o;if(nv!==r.style.getPropertyValue(p))r.style.setProperty(p,nv,r.style.getPropertyPriority(p));}}};
    for(const sh of document.styleSheets){try{walk(sh.cssRules);}catch(e){}}},
  /* --- settings --- */
  rows:{flash:{k:'flash',l:'Flash intensity',o:[[2,'Full'],[1,'Reduced'],[0,'Off']]},shake:{k:'shake',l:'Screen shake',o:[[2,'Full'],[1,'Low'],[0,'Off']]}},
  schema(SC){if(!this.on())return;const vis=SC.find(x=>x.g==='Visuals'),acc=SC.find(x=>x.g==='Accessibility'),mv=(g,k)=>{if(!g)return;g.rows=g.rows.filter(r=>r.k!==k);};
    mv(vis,'shake');mv(vis,'flash');mv(acc,'hc');mv(acc,'rm');
    const grp={g:'Comfort',rows:[this.rows.flash,this.rows.shake,{k:'glow',l:'Glow',o:[[2,'Full'],[1,'Low']]},{k:'scan',l:'Scan lines',o:[[true,'On'],[false,'Off']]},
      {k:'txt',l:'Text size',o:[['normal','Normal'],['large','Large']]},{k:'hc',l:'High-contrast bullets',o:[[false,'Off'],[true,'On']]},
      {k:'cbp',l:'Colour-blind palette',o:[['off','Off'],['deut','Deuteranopia'],['prot','Protanopia']]},{k:'rm',l:'Reduced motion',o:[[false,'Off'],[true,'On']]},
      {k:'calmm',l:'Calm mode',o:[[false,'Off'],[true,'On']]}]};
    SC.splice(Math.max(0,SC.indexOf(vis))+1,0,grp);},
  CALM:{flash:0,shake:0,glow:1,scan:false,rm:true,part:1},
  onSet(k,v){if(!this.on())return;
    if(k==='calmm'){if(v){SET.calmBk={};for(const q in this.CALM)SET.calmBk[q]=SET[q];Object.assign(SET,this.CALM);}else if(SET.calmBk){Object.assign(SET,SET.calmBk);delete SET.calmBk;}}
    else if(k in this.CALM||k==='txt'||k==='cbp'||k==='hc'){if(SET.calmm){SET.calmm=false;delete SET.calmBk;}}},
  apply(){if(!this.on())return;this.cbApply();this.css();document.documentElement.classList.toggle('cmf',true);document.documentElement.classList.toggle('cmf-tl',SET.txt==='large');}
};
/* defaults (Defaults button: Object.assign(SET,DEFS)); existing saves get Low shake once (SET.cv). Flash stays Full by default (a lower level turns SET.reduce on, which switches gameplay juice and rules off): Full is capped by itself */
Object.assign(DEFS,{shake:RET.comfort?1:DEFS.shake,glow:RET.comfort?1:2,scan:true,txt:'normal',cbp:'off',calmm:false});
if(RET.comfort){for(const k of['glow','scan','txt','cbp','calmm'])if(SET[k]===undefined)SET[k]=DEFS[k];
  if(!SET.cv){SET.cv=1;SET.shake=Math.min(SET.shake,1);}
  if(SET.rm===undefined)SET.rm=RM;deriveSet();}
COM.fontHook();
HOOK.drawEnemy(de=>function(e,t){   // every ordinary enemy sits on a soft light halo (the existing glow sprite, pale, 30% before the glow setting): a dark hull stays readable on the dark city
    if(RET.comfort&&!RET.clean&&e!==G.boss&&!e.dead&&e.hp>0&&e.r<40){ctx.save();ctx.globalCompositeOperation='lighter';G_(e.x,e.y,e.r*1.45,'#cfd8ff',.3);ctx.restore();}
    return de.call(this,e,t);});
{const h1=drawHUDP,h2=drawHUD,w=(f)=>function(t){COM.hud=1;try{return f.call(this,t);}finally{COM.hud=0;}};drawHUDP=w(h1);drawHUD=w(h2);   // HUD text has the higher floor
  }
/* blinks: a warning blink never runs faster than 6 Hz (3 flashes a second) */
const BK=window.BK=(t,n)=>Math.floor(t*(RET.comfort?Math.min(n,6):n))%2;
/* the stylesheet pass needs every module's CSS to exist: after load, then again once the fonts are in */
if(RET.comfort){document.documentElement.classList.add('cmf');
  const st=document.createElement('style');st.id='cmfCss';st.textContent='html.cmf{--dim:#b9b4e4}html.cmf .stat,html.cmf .keys{color:#c4bfea}'   // dim text 4.5:1 on the panels
    +'html.cmf #taleList .tx,html.cmf #lsC .ln{line-height:1.5;max-width:62ch}html.cmf #taleList .tx div+div{margin-top:5px}html.cmf .pg .card .bt button{letter-spacing:.05em;padding-left:.55em;padding-right:.55em}html.cmf .pg .presets .pst{letter-spacing:.03em}';   // story / lesson cards: at most ~62 characters a line, airier lines
document.head.appendChild(st);
  addEventListener('load',()=>{COM.apply();setTimeout(()=>COM.apply(),1500);});}
