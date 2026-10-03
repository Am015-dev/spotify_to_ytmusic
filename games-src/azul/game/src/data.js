// ---------- Sunglaze: constants. Numbers follow the published game; names and art are original. ----------
// tile codes: 0..4 the five glazes, 5 = prism tile (joker promo), 6 = the Sun token on a breakage line
const NC=5,PRISM=5,SUN=6;
const TNAME=['Cobalt','Saffron','Garnet','Obsidian','Frost','Prism'];
const TCSS=['#1f4fa8','#f0b429','#c2362f','#23252b','#bfe6ea','#f4f0ff'];
const TINK=['#fff5d8','#b5451b','#ffe3b0','#e2b24a','#1d6f84','#7b5bc4'];
const TICON=['◆','✹','✤','☾','❄','✧'];
const PER_COLOUR=20;
const FACTORIES={2:5,3:7,4:9};           // 2N+1 kilns
const PER_FACTORY=4;
const FLOOR=[-1,-1,-2,-2,-2,-3,-3];     // breakage line, 7 spaces
const BONUS={row:2,col:7,colour:10};
// the printed mosaic: wall[r][c] holds glaze (c-r) mod 5, so Cobalt runs down the main diagonal
const WALLC=(r,c)=>((c-r)%5+5)%5;
const WALLCOL=(k,r)=>(k+r)%5;             // column of glaze k in row r
// prism promo: tiles removed per glaze and prisms added, by player count
const PRISMSET={2:{remove:1,add:5},3:{remove:2,add:10},4:{remove:2,add:10}};
const PNAMES=['Coral','Olive','Indigo','Plum'];
const PCOL=['#e0674a','#6f8f2e','#3d5bb8','#9a4a8c'];
