// F4/R3 probe (W178): mean luma of the stage 1 frame, PC and phone. GAME_DIR=<dir> node qa/pcbright-probe.js '&pcbright=1&mult=1'
// usage: GAME_DIR=<dir> node probe.js "<query>" -> mean luma (backdrop) pc + phone, and saves shots to $SH
const L=require('./lib.js');
(async()=>{const b=await L.boot();try{const q='?sim=1&all=1&nomusic=1'+(process.argv[2]||''),out={};
for(const [W,H,n,touch] of [[1440,860,'pc',false],[390,763,'phone',true]]){
 const p=await L.open(b.br,b.base,W,H,q,0,touch,()=>{localStorage.setItem('mnr_tut','2');});
 await p.evaluate(()=>{const m=window.__mnr;m.startStory(1);m.simOn(true);for(let i=0;i<60*14;i++){m.step(1/60);m.P.hp=m.P.max;if(i===60*13)m.G.mult=2.4;}});
 await p.evaluate(()=>{const m=window.__mnr;m.render(m.G.t,1/60);});
 await L.sleep(300);
 const buf=await p.screenshot({path:(process.env.SH||'/tmp')+`/${n}.png`});
 out[n]=await p.evaluate(async b64=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let s=0,dk=0,N=d.length/4;for(let i=0;i<d.length;i+=4){const y=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];s+=y;if(y<40)dk++;}return {luma:+(s/N).toFixed(1),dark40:+(100*dk/N).toFixed(0)};},buf.toString('base64'));
 out[n].t=await p.evaluate(()=>+window.__mnr.G.t.toFixed(1));
 await p.context().close();}
console.log(JSON.stringify(out));}finally{await b.close();}})();
