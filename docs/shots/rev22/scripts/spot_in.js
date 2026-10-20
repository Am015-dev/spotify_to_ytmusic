(()=>{const P=[[2890,-2185],[-3841,2580],[682,-1549],[-2342,-2016],[959,-1845],[-2268,-1260],[1842,-2954],[3079,-2617],[-2541,2037],[-1613,-1711]];const R=[];
for(const[x,z]of P){const row={x,z,prof:[]};for(let d=-6;d<=6;d+=2){const o=roamTerr(x+d,z,99,{});groundYs(x+d,z);row.prof.push([d,+o.g.toFixed(2),+_G[0].toFixed(2),o.deck?('deck:'+(o.deck.id||o.deck.name||'?')):'']);}
 const rp=RO.ramps.filter(r=>Math.hypot(r.x-x,r.z-z)<20).map(r=>({x:Math.round(r.x),z:Math.round(r.z),h:+r.hgt.toFixed(1),len:r.len,w:r.w,dk:!!r.dk,k:r.kind||r.id||''}));row.ramps=rp;
 const d=athRoadD(x,z,30);row.road=d?{e:+d.e.toFixed(1)}:null;R.push(row)}return JSON.stringify({R,nr:RO.ramps.length,nd:ALL_DECKS.length})})()
