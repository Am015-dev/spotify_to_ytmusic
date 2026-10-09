const M=__mho,R=M.RO,o=[];
for(const [x,z] of [[437,-403],[683,-782]]){__m1.warp(x,z,0);__tick(2);const r={at:[x,z],y:+R.y.toFixed(2),g:+M.gnd(x,z,R.y+4).toFixed(2),hit:!!M.roamHitAt(x,z,2,R.y),hitB:(()=>{const h=M.roamHitAt(x,z,2,R.y);return h?JSON.stringify(h).slice(0,200):null})()};
 const s=[];M.K.ArrowUp=true;for(let i=0;i<240;i++){__tick(1);if(i%30===0)s.push([Math.round(R.x),Math.round(R.z),+R.y.toFixed(1),Math.round(R.v*3.6)])}M.K.ArrowUp=false;r.s=s;o.push(r)}return o;
