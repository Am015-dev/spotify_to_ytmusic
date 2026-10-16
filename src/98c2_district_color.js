// ===== C2 (city-2, 2026-10-16): DISTRICT COLOUR BLOCKING. docs/CITY_VARIETY.md #2. ?c2=0 = old look.
// Every district gets a bold LEGO family {f facade, a accent (every ~4th building), r roof}; building tints are blended toward it (instance colour / vertex colour only: no new meshes, no rnd()).
// Hooks: putK + lzKm tint (60_city_build4, Kenney facades), DR_fraSplit (95_drive_flow, Frankfurt fillers), E() colour (60_city_build3, Athens facades + roofs).
const C2={on:!/[?&]c2=0\b/.test(location.search),st:{}};
const C2_F={ // family: facade, accent, roof
 glass:['#86b4ea','#e4eeff','#3c4a66'],terra:['#f2a65a','#e0563c','#8a3a2a'],neon:['#c070e0','#ff4aa0','#3a2a5a'],apple:['#8fd070','#f2d23c','#7a4a2a'],
 dock:['#ff9a30','#3f9fe6','#555a60'],teal:['#4cc8c0','#ffd24a','#2a6a70'],sun:['#ffd860','#ff7a5a','#c04a3a'],plum:['#e88ab0','#8fd070','#7a2a5a'],
 white:['#f6f9ff','#2a7ad8','#2a7ad8'],ochre:['#f0c060','#e8803a','#b0502a'],coral:['#ff8a9a','#ffd24a','#8a2a4a'],mint:['#7fd8c8','#ff6a4a','#2a6a8a'],
 lilac:['#b8a0f0','#ffd24a','#5a3a8a'],lime:['#c8e870','#ff8ab0','#c0503a'],sand:['#ecd49a','#4aa0d8','#a0603a']};
const C2_D={Bankenviertel:'glass',Innenstadt:'glass',Messe:'glass',Westend:'glass',Altstadt:'terra',Nordend:'terra',Bahnhofsviertel:'neon',Sachsenhausen:'apple',Osthafen:'dock',Gutleut:'dock',Gallus:'dock',Fechenheim:'dock',
 Bockenheim:'teal',Bornheim:'teal',Ostend:'teal',Niederrad:'sun',Oberrad:'sun',Schwanheim:'plum','Höchst & Griesheim':'plum',Offenbach:'dock',
 Anafiotika:'white',Plaka:'white',Thiseio:'white','Areios Pagos':'white',Kolonaki:'ochre',Ilisia:'ochre',Lykavittos:'ochre',Evangelismos:'ochre',Monastiraki:'coral',Psyrri:'coral',Gazi:'coral',Kerameikos:'coral',Metaxourgeio:'coral',
 Syntagma:'mint',Omonia:'mint',Kentro:'mint',Exarcheia:'mint',Koukaki:'lilac',Petralona:'lilac',Neapoli:'lilac',Pangrati:'lilac',Mets:'lilac',Makrygianni:'sand',Akropoli:'sand',Filopappou:'sand',
 'Palaio Psychiko':'lime','Neo Psychiko':'lime',Filothei:'lime',Chalandri:'lime',Marousi:'lime'};
const C2_K=Object.keys(C2_F),C2_cache=new Map(),C2_col=new Map();
function C2_fam(x,z){if(!C2.on)return null;const k=Math.floor(x/60)*100000+Math.floor(z/60);let v=C2_cache.get(k);if(v!==undefined)return v;let n='';try{n=districtAt(x,z)}catch(e){}
 let f=C2_D[n];if(!f){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;f=C2_K[h%C2_K.length]}v=C2_F[f];v.n=f;C2_cache.set(k,v);return v}
const C2_c=h=>C2_col.get(h)||(C2_col.set(h,new THREE.Color(h)),C2_col.get(h));
const C2_pick=(x,z,s)=>{const F=C2_fam(x,z);if(!F)return null;return DR_h(x*.137+s,z*.211-s)<.27?F[1]:F[0]};
// Kenney / LEGO-set tint (hex string): 78 % toward the district colour, a little of the old tint and a lightness wobble keep neighbours different
function C2_tint(x,z,base,salt){const t=C2_pick(x,z,salt||0);if(!t)return base;const c=C2_c(t).clone().lerp(C2_c(base||'#ffffff'),.18);c.offsetHSL(0,0,(DR_h(x*.31,z*.29)-.5)*.14);C2.st.k=(C2.st.k||0)+1;return'#'+c.getHexString()}
// Athens E() colour (int): pale walls -> facade/accent, pale thin slabs (roof caps) -> roof colour; grey details (antennas, dark trims) stay
function C2_int(col,x,z,sx,sy,sz){const F=C2_fam(x,z);if(!F||typeof col!=='number')return col;const r=col>>16&255,g=col>>8&255,b=col&255;if(Math.min(r,g,b)<0xd0)return col;C2.st.a=(C2.st.a||0)+1;
 if(sy<=.6&&sx>2&&sz>2)return C2_c(F[2]).clone().offsetHSL(0,0,(DR_h(x*.7,z*.9)-.5)*.1).getHex();
 const c=C2_c(C2_pick(x,z,3)).clone().lerp(new THREE.Color(col),.12);c.offsetHSL(0,0,(DR_h(x*.31,z*.29)-.5)*.12);return c.getHex()}
// Frankfurt fillers: facade palette for one block (alternating strong/light so neighbours split at grazing angles) + roof colour
function C2_fra(cx,cz,T){const F=C2_fam(cx,cz);if(!F)return{T,roof:'#a85a3c',on:false};const f=C2_c(F[0]),a=C2_c(F[1]);return{on:true,roof:F[2],T:[f.clone(),a.clone(),f.clone().offsetHSL(.02,0,.1),a.clone().offsetHSL(-.02,0,-.1),f.clone().offsetHSL(-.02,0,-.1)].map(c=>'#'+c.getHexString())}}
// test view: car on the road nearest a district's centre, looking at the centre (tools/tCity2Shots.js)
function C2_view(n){const d=DIST_R.find(d=>d.name===n);if(!d)return null;const cx=(d.x0+d.x1)/2,cz=(d.z0+d.z1)/2,s=rfSnap(cx,cz,400);if(!s)return null;const h=Math.atan2(cx-s[0],cz-s[1]);roamWarp(s[0],s[1],h);RO.v=0;camSnap=true;return[s[0],s[1],h,(C2_fam(s[0],s[1])||{}).n]}
window.__c2={C2,fam:C2_fam,tint:C2_tint,view:C2_view};
