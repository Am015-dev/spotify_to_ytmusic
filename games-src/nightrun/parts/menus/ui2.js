// PURPOSE: one menu style: one plate shape (rounded rectangle), one font family, one solid selected/focus ring, no dashed lines,
//          a desktop title that uses the screen, and one size ladder for ships, pickups and bullets in play
// FLAG: ui2 (?ui2=0 = the old painted skewed plates and sizes)
// TEST: qa/loadgate.js (no page errors), fingerprint-test.js (state hashes); looks reviewed in UI2-REVIEW.md (1440x860, 1280x720, 390x763)
/* ---------- UI2: owner, 22 Oct 2026: "the game on PC is ugly, the menus are ugly, the selections look like sloppy dashes",
   "size of the assets is not correct". The painted plates (ui-btn-*.webp) are skewed parallelograms whose bevels eat the label, they sat next
   to rectangular info boxes, and sub-labels used a monospace face. With ui2 every button is the same flat rounded plate (role by colour:
   pink = primary, cyan / violet = secondary), all text is the display face, selected = filled plate + solid ring, keyboard focus = solid
   cyan ring, and every dashed border or outline in the menus is drawn solid. ---------- */
if(RET.ui2===undefined)RET.ui2=!/[?&]ui2=0/.test(location.search);
if(RET.ui2){
  document.documentElement.classList.add('ui2');
  const st=document.createElement('style');st.id='ui2css';
  st.textContent=`
html.ui2{--mono:var(--display);--u2r:10px;--u2line:#4a3b7a;--u2fill:linear-gradient(180deg,#22184a,#150e30);--u2ring:#49e6ff}
html.ui2 button.go,html.ui2 .pg button.go,html.ui2 #setm .sfoot button.go,html.ui2 button.go.alt,html.ui2 button.go.dim{
  background:var(--u2fill)!important;border:1.5px solid var(--u2line)!important;border-radius:var(--u2r)!important;clip-path:none!important;
  color:var(--ink)!important;text-shadow:none!important;box-shadow:inset 0 1px 0 #ffffff14,0 2px 10px #0008;padding:.5em 1.1em!important;
  font-family:var(--display)!important;letter-spacing:.08em;line-height:1.15;filter:none!important;transition:border-color .12s,background .12s,transform .12s;overflow:visible}
html.ui2 button.go small{font-family:var(--display)!important;font-weight:500!important;letter-spacing:.02em!important;text-transform:none;opacity:.78;color:var(--ink)}
html.ui2 button.go:hover{border-color:#fff!important;background:linear-gradient(180deg,#2d2160,#1b1240)!important;transform:translateY(-1px)}
html.ui2 button.go:focus-visible,html.ui2 button:focus-visible,html.ui2 [tabindex]:focus-visible{outline:none!important;box-shadow:0 0 0 2px #05030c,0 0 0 4px var(--u2ring)!important}
html.ui2 button.go.on,html.ui2 button.go[aria-selected=true],html.ui2 button.go[aria-pressed=true]{background:linear-gradient(180deg,#c8308a,#9c1d63)!important;border-color:#ffd0ea!important;color:#fff!important}
html.ui2 button.go.hubBk,html.ui2 button.go.alt.hubBk{padding:0!important;display:inline-flex;align-items:center;justify-content:center;line-height:1;padding-bottom:3px!important}
html.ui2 #playBtn,html.ui2 #resumeBtn,html.ui2 #srNext,html.ui2 #againBtn{background:linear-gradient(180deg,#c8308a,#9c1d63)!important;border-color:#ffd0ea!important;color:#fff!important;letter-spacing:.14em}
html.ui2 #playBtn small{opacity:.92}
html.ui2 #playBtn:hover,html.ui2 #resumeBtn:hover,html.ui2 #srNext:hover,html.ui2 #againBtn:hover{background:linear-gradient(180deg,#ff78c4,#d4368d)!important}
html.ui2 .row>button.go{white-space:nowrap;align-self:stretch}
html.ui2 .hubDot{top:-6px!important;right:-6px!important;width:14px;height:14px}
html.ui2 #hubStat,html.ui2 #sgTile,html.ui2 .hub-story{border-radius:var(--u2r)!important;border:1.5px solid var(--u2line)!important;background:#0b0720e6!important;font-family:var(--display)!important}
html.ui2 #sgTile{border-left:4px solid #ffb547!important;width:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box}
html.ui2 #hubStory{padding:0!important;margin:0!important;width:100%}
html.ui2 .eyebrow{letter-spacing:.18em}
html.ui2 .keys kbd,html.ui2 .keys span:nth-child(odd){border-radius:6px}
html.ui2 .gfChip{border-radius:var(--u2r)!important;border-style:solid!important}
html.ui2 #gaCards .card .pp{display:flex;gap:2px;max-width:220px}
html.ui2 #gaCards .card .pp i{flex:1 1 0;height:6px!important;border-radius:3px}
html.ui2 #setm .card{border:1.5px solid var(--u2line)!important;border-image:none!important;border-radius:14px!important;background:#0a061cf2!important}
html.ui2 #setm .card h2{background:none!important;font-style:normal!important;border-bottom:1.5px solid var(--u2line);text-shadow:none!important}
html.ui2 #setm .seg,html.ui2 #setm .sl{background:#140d2ee6!important;border:1.5px solid var(--u2line);border-radius:var(--u2r);padding:10px 16px!important;margin-bottom:8px}
html.ui2 #setm,html.ui2 #setm *{font-style:normal!important}
html.ui2 #setm .seg button{border-radius:8px!important;border:1.5px solid var(--u2line)!important;background:var(--u2fill)!important;color:var(--ink)!important}
html.ui2 #setm .seg button[aria-pressed="true"]{background:linear-gradient(180deg,#c8308a,#9c1d63)!important;border-color:#ffd0ea!important;color:#fff!important}
html.ui2 #garage .tabs{gap:6px}
html.ui2 #garage .tabs button.go{padding:.4em .5em!important;letter-spacing:.03em;font-size:clamp(12px,3.3vw,16px)!important;min-width:0}
html.ui2 #hubJump{padding:8px 12px 8px!important;gap:8px!important}
html.ui2 #hubJump button{border-radius:8px!important;border:1.5px solid var(--u2line)!important;background:var(--u2fill)!important;color:var(--ink)!important}
html.ui2 .tdBar button{border-radius:var(--u2r)!important}
@media (min-width:1024px) and (min-height:640px){
  html.ui2 #title .in{left:0;right:0;padding-left:max(6vw,48px)!important;box-sizing:border-box}
  html.ui2 #title h1{font-size:clamp(64px,min(7vw,13vh),112px)!important}
  html.ui2 #title .lede{font-size:clamp(17px,1.5vw,22px)!important;max-width:40ch}
  html.ui2 #title .eyebrow{font-size:clamp(13px,1.05vw,16px)!important}
  html.ui2 #ttMain{max-width:none!important;width:clamp(460px,36vw,600px)!important;gap:14px!important}
  html.ui2 #playBtn{min-height:clamp(76px,10vh,96px)!important;font-size:clamp(22px,1.9vw,30px)!important}
  html.ui2 #playBtn small{font-size:clamp(14px,1.05vw,17px)!important}
  html.ui2 #hubGrid{gap:14px!important}
  html.ui2 #hubGrid .go{min-height:clamp(60px,8vh,76px)!important;font-size:clamp(16px,1.3vw,20px)!important}
  html.ui2 #hubGrid .go small{font-size:clamp(13px,.95vw,15px)!important}
  html.ui2 #hubStat,html.ui2 #sgTile{font-size:clamp(15px,1.1vw,17px)!important;padding:10px 16px!important}
}`;
  document.head.appendChild(st);
  /* every dashed line in the menu CSS (parts inject their own <style> at load and later) is drawn solid */
  const solid=()=>{for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules;}catch(e){continue;}
    const fix=list=>{for(const r of list){if(r.cssRules)fix(r.cssRules);const s=r.style;if(!s)continue;
      for(const p of ['border-style','border-top-style','border-right-style','border-bottom-style','border-left-style','outline-style'])if(s.getPropertyValue(p)==='dashed'||s.getPropertyValue(p)==='dotted')s.setProperty(p,'solid',s.getPropertyPriority(p));}};
    fix(rs);}};
  solid();addEventListener('load',solid);setTimeout(solid,1500);
  new MutationObserver(m=>{if(m.some(x=>[...x.addedNodes].some(n=>n.tagName==='STYLE')))solid();}).observe(document.head,{childList:true});
}
/* in play: one size ladder. foeart drew each enemy at k x its hit radius with k from 2.3 to 5.1, so a weak drone (r 14, k 5.1 = 71 px) out-sized
   a turret (r 20, k 3.1 = 62 px). With ui2 every mapped enemy uses the same k, so picture size follows hit size: drone 59 < turret 84 < heavies,
   all below the player ship; leaders stay a quarter larger. Bosses and the native sheets (gunship, kamikaze, fleet) are untouched. Art only. */
if(RET.ui2&&window.ENEMY_ART)for(const id in ENEMY_ART){const a=ENEMY_ART[id];if(!a||a.native||typeof a.k!=='number')continue;a.k=4.2;if(a.L&&typeof a.L.k==='number')a.L.k=5.25;}
