// Small QR Code encoder written for this shelf (byte mode, error correction M, versions 1-10). No third-party code.
// QR.matrix(text) -> array of rows of booleans (true = dark); QR.svg(text, px) -> SVG markup with a 4-module quiet zone.
const QR=(()=>{
  const ECC=[10,16,26,18,24,16,18,22,22,26], NB=[1,1,1,2,2,4,4,4,5,5];
  const EXP=new Array(512),LOG=new Array(256);
  (function(){let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11D}for(let i=255;i<512;i++)EXP[i]=EXP[i-255]})();
  const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
  function gen(d){let p=[1];for(let i=0;i<d;i++){const q=new Array(p.length+1).fill(0);for(let j=0;j<p.length;j++){q[j]^=p[j];q[j+1]^=mul(p[j],EXP[i])}p=q}return p}
  function rs(data,d){const g=gen(d),r=new Array(d).fill(0);for(const b of data){const f=b^r.shift();r.push(0);for(let i=0;i<d;i++)r[i]^=mul(g[i+1],f)}return r}
  const raw=v=>{let r=(16*v+128)*v+64;if(v>=2){const n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r};
  const dataCW=v=>Math.floor(raw(v)/8)-ECC[v-1]*NB[v-1];
  const bit=(x,i)=>((x>>>i)&1)!==0;
  function matrix(text){
    const bytes=[...new TextEncoder().encode(text)];let ver=1;
    for(;ver<=10;ver++){if(4+(ver<10?8:16)+bytes.length*8<=dataCW(ver)*8)break}
    if(ver>10)throw new Error('QR: text too long');
    const bits=[];const put=(v,n)=>{for(let i=n-1;i>=0;i--)bits.push((v>>>i)&1)};
    put(4,4);put(bytes.length,ver<10?8:16);bytes.forEach(b=>put(b,8));
    const cap=dataCW(ver)*8;put(0,Math.min(4,cap-bits.length));while(bits.length%8)bits.push(0);
    for(let p=0xEC;bits.length<cap;p^=0xEC^0x11)put(p,8);
    const cw=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=b<<1|bits[i+j];cw.push(b)}
    const nb=NB[ver-1],el=ECC[ver-1],rc=Math.floor(raw(ver)/8),ns=nb-rc%nb,sl=Math.floor(rc/nb);
    const blocks=[];let k=0;
    for(let i=0;i<nb;i++){const dl=sl-el+(i<ns?0:1);const d=cw.slice(k,k+dl);k+=dl;blocks.push({d,e:rs(d,el)})}
    const all=[];for(let i=0;i<=sl-el;i++)blocks.forEach(b=>{if(i<b.d.length)all.push(b.d[i])});
    for(let i=0;i<el;i++)blocks.forEach(b=>all.push(b.e[i]));
    const size=ver*4+17;const M=[],F=[];for(let i=0;i<size;i++){M.push(new Array(size).fill(false));F.push(new Array(size).fill(false))}
    const set=(x,y,v)=>{M[y][x]=v;F[y][x]=true};
    for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
    const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=size||y>=size)continue;const d=Math.max(Math.abs(dx),Math.abs(dy));set(x,y,d!==2&&d!==4)}};
    finder(3,3);finder(size-4,3);finder(3,size-4);
    if(ver>1){const n=Math.floor(ver/7)+2,step=Math.ceil((ver*4+4)/(n*2-2))*2,pos=[6];for(let p=size-7;pos.length<n;p-=step)pos.splice(1,0,p);
      for(let i=0;i<n;i++)for(let j=0;j<n;j++){if((i===0&&j===0)||(i===0&&j===n-1)||(i===n-1&&j===0))continue;
        for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(pos[i]+dx,pos[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}}
    const fmt=mask=>{const d=mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412;
      for(let i=0;i<=5;i++)set(8,i,bit(b,i));set(8,7,bit(b,6));set(8,8,bit(b,7));set(7,8,bit(b,8));for(let i=9;i<15;i++)set(14-i,8,bit(b,i));
      for(let i=0;i<8;i++)set(size-1-i,8,bit(b,i));for(let i=8;i<15;i++)set(8,size-15+i,bit(b,i));set(8,size-8,true)};
    fmt(0);
    if(ver>=7){let r=ver;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(ver<<12)|r;for(let i=0;i<18;i++){const a=size-11+i%3,c=Math.floor(i/3);set(a,c,bit(b,i));set(c,a,bit(b,i))}}
    let i=0;const total=all.length*8;
    for(let right=size-1;right>=1;right-=2){if(right===6)right=5;
      for(let v=0;v<size;v++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-v:v;if(!F[y][x]&&i<total){M[y][x]=bit(all[i>>3],7-(i&7));i++}}}
    const masks=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
    const base=M.map(r=>r.slice());let best=null,bp=1e9;
    for(let m=0;m<8;m++){const T=base.map(r=>r.slice());for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!F[y][x]&&masks[m](x,y))T[y][x]=!T[y][x];
      for(let y=0;y<size;y++)for(let x=0;x<size;x++)M[y][x]=T[y][x];fmt(m);const R=M.map(r=>r.slice());const p=penalty(R,size);if(p<bp){bp=p;best=R}}
    return best;
  }
  function penalty(R,n){let p=0;
    for(let t=0;t<2;t++){const g=(a,b)=>t?R[b][a]:R[a][b];
      for(let a=0;a<n;a++){let run=1;for(let b=1;b<n;b++){if(g(a,b)===g(a,b-1)){run++}else{if(run>=5)p+=run-2;run=1}}if(run>=5)p+=run-2;
        for(let b=0;b+10<n;b++){const s=[];for(let q=0;q<11;q++)s.push(g(a,b+q)?1:0);const j=s.join('');if(j==='10111010000'||j==='00001011101')p+=40}}}
    let dark=0;for(let y=0;y<n;y++)for(let x=0;x<n;x++){if(R[y][x])dark++;if(x&&y&&R[y][x]===R[y][x-1]&&R[y][x]===R[y-1][x]&&R[y][x]===R[y-1][x-1])p+=3}
    p+=Math.floor(Math.abs(dark*20-n*n*10)/(n*n))*10;return p}
  function svg(text,px){const m=matrix(text),n=m.length,q=4;let d='';
    for(let y=0;y<n;y++){let x=0;while(x<n){if(m[y][x]){let e=x;while(e<n&&m[y][e])e++;d+='M'+(x+q)+' '+(y+q)+'h'+(e-x)+'v1h-'+(e-x)+'z';x=e}else x++}}
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(n+q*2)+' '+(n+q*2)+'" width="'+px+'" height="'+px+'" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="100%" height="100%" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>'}
  return {matrix,svg};
})();
if(typeof module!=='undefined')module.exports=QR;
