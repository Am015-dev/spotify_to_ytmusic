// ===== phone mode switch (runs in <head>, before the first paint) =====
// html.ph when the short side <= 500 px, or touch (pointer:coarse) and short side <= 600; ?phone=1 / ?phone=0 force it.
// ph-p / ph-l = portrait / landscape. Sets --ph-bw/--ph-bh (board box) and the safe-area vars (?safe=t,r,b,l for tests).
(function(){var R=document.documentElement,q=location.search;
  function safeq(){var m=/[?&]safe=([^&]+)/.exec(q);if(!m)return null;var a=m[1].split(',').map(Number);return a.length===4&&a.every(function(x){return x>=0})?a:null}
  function env(){var s=safeq();if(s)return s;try{var p=document.createElement('div');p.style.cssText='position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
      R.appendChild(p);var c=getComputedStyle(p);var r=[parseFloat(c.paddingTop)||0,parseFloat(c.paddingRight)||0,parseFloat(c.paddingBottom)||0,parseFloat(c.paddingLeft)||0];R.removeChild(p);return r}catch(e){return [0,0,0,0]}}
  var PHONE=window.PHONE={on:false,land:false,bar:48,zone:200,
    want:function(){if(/[?&]phone=1/.test(q))return true;if(/[?&]phone=0/.test(q))return false;var s=Math.min(innerWidth,innerHeight);var co=false;try{co=matchMedia('(pointer:coarse)').matches}catch(e){}return s<=500||(co&&s<=600)},
    apply:function(){var W=innerWidth,H=innerHeight,on=PHONE.want(),land=W>H,st=R.style;PHONE.on=on;PHONE.land=land;
      R.classList.toggle('ph',on);R.classList.toggle('ph-l',on&&land);R.classList.toggle('ph-p',on&&!land);
      if(!on){['--ph-bw','--ph-bh','--sat','--sar','--sab','--sal','--ph-bar','--pz-l','--pz-t'].forEach(function(p){st.removeProperty(p)});return}
      PHONE.bar=land?48:52;var s=env();st.setProperty('--sat',s[0]+'px');st.setProperty('--sar',s[1]+'px');st.setProperty('--sab',s[2]+'px');st.setProperty('--sal',s[3]+'px');st.setProperty('--ph-bar',PHONE.bar+'px');
      var aw=W-s[1]-s[3],ah=H-s[0]-s[2],bw,bh;
      if(land){bh=ah;bw=Math.min(Math.round(ah*1.28),aw-300);bw=Math.max(bw,Math.round(ah*.9))}
      else{bw=aw;bh=Math.max(Math.round(aw*.75),Math.min(Math.round(aw*1.3),ah-PHONE.bar-PHONE.zone))}
      st.setProperty('--ph-bw',bw+'px');st.setProperty('--ph-bh',bh+'px');
      st.setProperty('--pz-l',(land?s[3]+bw:s[3])+'px');st.setProperty('--pz-t',(land?s[0]+PHONE.bar:s[0]+PHONE.bar+bh)+'px');PHONE.bw=bw;PHONE.bh=bh;PHONE.aw=aw;PHONE.ah=ah}};
  PHONE.apply();var t;function again(){clearTimeout(t);PHONE.apply();t=setTimeout(function(){PHONE.apply();if(window.phLayout)phLayout()},150)}
  addEventListener('resize',again);addEventListener('orientationchange',again)})();
