// ===================== W480: no hidden glyphs behind the painted icons =====================
// Icons are painted (CSS background art) and keep an emoji glyph in the page only as a fallback. Once the art is there the glyph is removed,
// so no 0px or clipped text is left on the page (text audits, screen readers, copy and paste).
(function(){
  const SEL='i.ri,i.e2,.mi,.tok,.thi,.own';let pend=false;
  function sweep(root){for(const el of (root||document).querySelectorAll(SEL)){if(el.children.length||!el.textContent)continue;
    let has=false;try{has=getComputedStyle(el).backgroundImage!=='none'}catch(e){}
    if(has){if(!el.hasAttribute('aria-label')&&!el.getAttribute('role'))el.setAttribute('aria-hidden','true');el.textContent=''}}}
  function later(){if(pend)return;pend=true;requestAnimationFrame(()=>{pend=false;try{sweep()}catch(e){}})}
  new MutationObserver(()=>{try{sweep()}catch(e){}}).observe(document.body,{childList:true,subtree:true,characterData:false});
  document.addEventListener('DOMContentLoaded',later);window.addEventListener('load',()=>setTimeout(later,300));setInterval(later,1500);
})();
