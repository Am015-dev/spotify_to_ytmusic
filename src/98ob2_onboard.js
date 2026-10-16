// onboard-2: 2K-style first screen (rv2k2/menu). First launch = one big PLAY; returning = CONTINUE + RACES/GARAGE/BUILD/MORE; the rest under MORE. ?ob2=0 = old menu.
const OB2=!/[?&]ob2=0/.test(location.search);
if(OB2){
  const st=document.createElement('style');st.textContent=`
#ob2{display:none}
#menu.home.ob2 #ob2{display:flex;flex-direction:column;align-items:center;gap:clamp(8px,2vh,16px);margin-top:70px;width:min(92vw,560px);z-index:2}
#menu.home.ob2:not(.ob2more) .hcards,#menu.home.ob2:not(.ob2more) .hfoot{display:none}
#menu.home.ob2:not(.ob2more) .hbar h2{font-size:clamp(16px,2.6vw,26px)}
#menu.home.ob2more #ob2 .ob2m{display:none}
#menu.home.ob2more #ob2{margin-top:0;position:absolute;left:max(12px,env(safe-area-inset-left));bottom:calc(10px + env(safe-area-inset-bottom,0px));width:auto}
#ob2 .ob2play{all:unset;box-sizing:border-box;cursor:pointer;width:100%;min-height:30vh;display:flex;align-items:center;justify-content:center;gap:12px;background:#ffd400;border:6px solid #141413;border-radius:22px;box-shadow:0 10px 0 #141413;font:italic 900 clamp(34px,7vw,64px) var(--hud);color:#141413;letter-spacing:.03em}
#ob2 .ob2play small{font:italic 800 14px var(--hud);display:block}
#ob2 .ob2row{display:flex;gap:10px;width:100%}
#ob2 .ob2row button,#ob2 .ob2back{all:unset;box-sizing:border-box;cursor:pointer;flex:1;min-height:48px;display:flex;align-items:center;justify-content:center;background:#fff;border:4px solid #141413;border-radius:999px;box-shadow:0 5px 0 #141413;font:italic 900 clamp(14px,2.2vw,18px) var(--hud);color:#141413;padding:0 10px}
#ob2 .ob2back{flex:none;padding:0 22px}
#menu.home.ob2:not(.ob2more) .ob2back{display:none}
#ob2 .ob2by{font:italic 800 12px var(--hud);color:#0b1626;text-align:center}
#menu.home.ob2more #ob2 .ob2by{display:none}
#home .hlogo .hby,#home .hc small,#topBtns button{font-size:12px!important}
body.ob2home #odPin,body.ob2home #qaBugTop,body.ob2home #tuG{display:none!important}
#menu.home.ob2:not(.ob2more):not([hidden]) ~ #topBtns{display:none}
body #odNew{top:auto;bottom:calc(8px + env(safe-area-inset-bottom,0px));right:max(10px,env(safe-area-inset-right));padding:1px 4px 1px 10px;gap:6px;font-size:12px;border-width:2px}
body #odNew button{font-size:12px}
@media (max-width:500px) and (orientation:portrait){#home .hbar h2{margin-left:150px!important}#menu.home.ob2 #ob2{margin-top:90px}#ob2 .ob2row{flex-wrap:wrap}#ob2 .ob2row button{flex:1 1 40%}}`;
  document.head.appendChild(st);
  const M=document.getElementById('menu'),H=document.getElementById('home'),$$=s=>document.querySelector(s);
  const hasSave=()=>{for(let n=1;n<=3;n++)try{if(slotInfo(n))return true}catch(e){}return false};
  const bar=document.createElement('div');bar.id='ob2';
  bar.innerHTML=`<button class="ob2play ob2m" id="ob2Play"><span>▶ PLAY<small></small></span></button><div class="ob2row ob2m" id="ob2Row"><button data-k="quick">🏁 RACES</button><button data-k="garage">🔧 GARAGE</button><button data-k="build">🏗 BUILD</button><button data-k="more">⋯ MORE</button></div><button class="ob2back" id="ob2Back">◀ BACK</button><div class="ob2by">Made with ❤ by Alex · 3D models by Alex</div>`;
  H.appendChild(bar);M.classList.add('ob2');
  const click=sel=>{const e=$$(sel);if(e)e.click()},sfx=()=>{try{AU.sfx('pick')}catch(e){}};
  const more=v=>{M.classList.toggle('ob2more',v);sfx()};
  $$('#ob2Play').onclick=()=>click('#hcStory');
  $$('#ob2Back').onclick=()=>more(false);
  $$('#ob2Row').onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;if(k==='more')return more(true);sfx();
    if(k==='quick')click('#home .hc[data-a="quick"]');else if(k==='garage')click('#gbMenuBtn');else if(k==='build')click('#bxMenuBtn')};
  let wasHome=false,shown=0;
  const sync=()=>{const on=M.classList.contains('home')&&!M.hidden;
    if(on&&!wasHome){M.classList.remove('ob2more');const sv=hasSave();$$('#ob2Play span').firstChild.nodeValue=sv?'▶ CONTINUE':'▶ PLAY';$$('#ob2Play small').textContent=sv?'Back to Mainhattan':'Hot Drop · your first drive';
      $$('#ob2Row').style.display=sv?'':'none';const h2=$$('#home .hbar h2');if(h2)h2.textContent=sv?'WELCOME BACK':'WELCOME';
      if(!shown++)setTimeout(()=>{try{localStorage.setItem('mho_seenVer',OD_VER)}catch(e){}},7000)}// banner chip hides itself after 7 s
    wasHome=on;document.body.classList.toggle('ob2home',on&&!M.classList.contains('ob2more'))};
  new MutationObserver(sync).observe(M,{attributes:true,attributeFilter:['class','hidden']});sync();
  window.__ob2={more,sync,hasSave};
}
