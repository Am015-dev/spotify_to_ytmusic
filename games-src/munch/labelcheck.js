// Label check (no AI eyes): for each control, hide its own text, screenshot its box, compare the text colour with the painted plate behind it. Flags EMPTY (no label/icon), CLIPPED, font < 13px, tap target < 44px, contrast < 4.5.
module.exports=async function audit(p,tag,sel){
 const items=await p.evaluate((sel)=>{const out=[];const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>6&&r.height>6&&s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>.3&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth};
  let i=0;for(const e of document.querySelectorAll(sel)){if(!vis(e))continue;const txt=(e.innerText||e.getAttribute('aria-label')||'').trim();const hasIc=!!e.querySelector('svg,img,i[data-ic]');const s=getComputedStyle(e);const r=e.getBoundingClientRect();
   const lab=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
   // clipped label?
   const clip=e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+3;
   e.setAttribute('data-ca',i);out.push({i,txt:txt.slice(0,30),hasIc,color:s.color,fs:parseFloat(s.fontSize),x:r.left,y:r.top,w:r.width,h:r.height,clip,cls:(e.className||'')+''});i++}return out},sel);
 const bad=[];
 for(const it of items){
  if(!it.txt&&!it.hasIc){bad.push(tag+' EMPTY '+it.cls+' '+Math.round(it.w)+'x'+Math.round(it.h));continue}
  if(it.clip)bad.push(tag+' CLIPPED "'+it.txt+'" '+it.cls);
  if(it.fs<13&&it.txt)bad.push(tag+' small font '+it.fs+' "'+it.txt+'"');
  if((it.h<44||it.w<44)&&!/gx-x|close/.test(it.cls))bad.push(tag+' target '+Math.round(it.w)+'x'+Math.round(it.h)+' "'+it.txt+'" '+it.cls);
  if(!it.txt)continue;
  await p.evaluate(i=>{const e=document.querySelector('[data-ca="'+i+'"]');e.__st=e.getAttribute('style');e.style.setProperty('color','transparent','important');e.style.setProperty('text-shadow','none','important');e.querySelectorAll('*').forEach(c=>{c.style.setProperty('color','transparent','important');c.style.setProperty('text-shadow','none','important');if(c.tagName==='svg'||c.tagName==='SVG')c.style.visibility='hidden'})},it.i);
  const x=Math.max(0,it.x+it.w*.15),y=Math.max(0,it.y+it.h*.25);   // the middle of the plate only (its rim and drop shadow are not behind the text)
  const buf=await p.screenshot({clip:{x,y,width:Math.max(4,Math.min(it.w*.7,innerW(p)-x)),height:Math.max(4,it.h*.5)}});
  await p.evaluate(i=>{const e=document.querySelector('[data-ca="'+i+'"]');e.removeAttribute('style');if(e.__st)e.setAttribute('style',e.__st);e.querySelectorAll('*').forEach(c=>{c.style.removeProperty('color');c.style.removeProperty('text-shadow');c.style.visibility=''})},it.i);
  const m=await p.evaluate(async b64=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;const L=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};let ls=[];for(let k=0;k<d.length;k+=16)ls.push(.2126*L(d[k])+.7152*L(d[k+1])+.0722*L(d[k+2]));ls.sort((a,b)=>a-b);return {lo:ls[Math.floor(ls.length*.1)],md:ls[Math.floor(ls.length*.5)],hi:ls[Math.floor(ls.length*.9)]}},buf.toString('base64'));
  const col=it.color.match(/[\d.]+/g).map(Number);const L=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};const tl=.2126*L(col[0])+.7152*L(col[1])+.0722*L(col[2]);
  const cr=bl=>{const a=Math.max(tl,bl)+.05,b=Math.min(tl,bl)+.05;return a/b};
  const worst=Math.min(cr(m.md),Math.max(cr(m.lo),cr(m.hi))); // median background; fine if text colour is not close
  if(cr(m.md)<4.5)bad.push(tag+' contrast '+cr(m.md).toFixed(1)+' "'+it.txt+'" '+it.cls);
 }
 return {n:items.length,bad};
};
function innerW(p){return p.viewportSize().width}
