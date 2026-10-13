const M=__mho,R=M.RO,out={};const run=(boost,secs)=>{const s=[];M.K.ArrowUp=true;M.K.ShiftLeft=boost;for(let i=0;i<secs*60;i++){if(boost&&window.pl!==undefined);__tick(1);if(i%30===0)s.push(Math.round(R.v*3.6))}M.K.ArrowUp=false;M.K.ShiftLeft=false;return s};
// straight road east of the drop: follow route start heading
const ch=R.ch;out.stage=ch&&ch.v2&&ch.v2.L.st[ch.v2.si].t;out.pos=[R.x,R.z,R.h];
out.gas=run(false,10);out.bm=__dbg&&__dbg.pl?__dbg.pl.bm:null;out.boost=run(true,8);out.pos2=[Math.round(R.x),Math.round(R.z)];return out;
