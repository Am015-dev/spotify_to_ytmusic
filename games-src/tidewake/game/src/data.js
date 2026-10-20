// ===================== Tidewake data =====================
// Board: 6x6 squares, columns/rows numbered 1-6 (gold die = column, blue die = row). Ports on a square run clockwise from the
// top-left: 0,1 top (left to right), 2,3 right (top to bottom), 4,5 bottom (right to left), 6,7 left (bottom to top).
// Direction of port p = p>>1 (0 N, 1 E, 2 S, 3 W). Rotating a current 90 degrees clockwise adds 2 to every port.
var BW=6;
var SHIP_NAMES=['Crimson','Azure','Jade','Amber','Violet','Teal','Ivory','Onyx'];
var SHIP_HEX=['#c0392b','#2f6fb5','#2e9c6a','#d9a21b','#7b4fb5','#1fa3a3','#e8e1cf','#2a2f3a'];
// the 35 distinct currents = every perfect matching of the 8 ports (CONFIRMED set, same as the original tile set)
var BASE_PATHS=[[[0,4],[1,5],[2,7],[3,6]],[[0,4],[1,5],[2,6],[3,7]],[[0,5],[1,4],[2,7],[3,6]],[[0,4],[1,3],[2,6],[5,7]],[[0,7],[1,2],[3,4],[5,6]],[[0,4],[1,2],[3,7],[5,6]],[[0,4],[1,2],[3,6],[5,7]],[[0,3],[1,6],[2,5],[4,7]],[[0,3],[1,5],[2,6],[4,7]],[[0,3],[1,4],[2,7],[5,6]],[[0,3],[1,4],[2,6],[5,7]],[[0,3],[1,2],[4,7],[5,6]],[[0,2],[1,7],[3,5],[4,6]],[[0,2],[1,7],[3,4],[5,6]],[[0,2],[1,6],[3,5],[4,7]],[[0,2],[1,6],[3,4],[5,7]],[[0,2],[1,5],[3,7],[4,6]],[[0,2],[1,5],[3,6],[4,7]],[[0,2],[1,4],[3,7],[5,6]],[[0,2],[1,4],[3,6],[5,7]],[[0,2],[1,3],[4,7],[5,6]],[[0,2],[1,3],[4,6],[5,7]],[[0,1],[2,7],[3,6],[4,5]],[[0,1],[2,7],[3,5],[4,6]],[[0,1],[2,7],[3,4],[5,6]],[[0,1],[2,6],[3,7],[4,5]],[[0,1],[2,6],[3,5],[4,7]],[[0,1],[2,6],[3,4],[5,7]],[[0,1],[2,5],[3,7],[4,6]],[[0,1],[2,5],[3,6],[4,7]],[[0,1],[2,4],[3,7],[5,6]],[[0,1],[2,4],[3,6],[5,7]],[[0,1],[2,3],[4,7],[5,6]],[[0,1],[2,3],[4,6],[5,7]],[[0,1],[2,3],[4,5],[6,7]]];
// DESIGN CHOICE (the real multiset of the 21 duplicates is unverified): 56 currents = the 35 distinct + these 21 types, spread evenly
var EXTRA_TYPES=[0,1,3,5,6,8,10,11,13,15,16,18,20,21,23,25,26,28,30,31,33];
var NCUR=56,GATE_ID=56,CANNON_IDS=[57,58,59,60,61];
var CUR_TYPE=[];for(let i=0;i<35;i++)CUR_TYPE.push(i);for(const t of EXTRA_TYPES)CUR_TYPE.push(t);
var PAIR=BASE_PATHS.map(ps=>{const a=new Array(8);for(const [x,y] of ps){a[x]=y;a[y]=x}return a});
// ROTP[type][r][port] = exit port when entering at that port with the tile turned r quarter-turns clockwise
var ROTP=PAIR.map(a=>[0,1,2,3].map(r=>{const o=new Array(8);for(let p=0;p<8;p++)o[(p+2*r)%8]=(a[p]+2*r)%8;return o}));
// leviathans: GUESSED layouts (official arrow layouts not found). arr = what die faces 1..5 do (N/E/S/W = step, R = turn by rd quarter-turns), 6 = spawn.
// order = the activation number in the tile corner; gold = tie-break arrow. Their facing (rot 0-3) is random on placement and turns the arrows with it.
var LEV=[
 {id:0,nm:'Brinemaw',order:1,gold:0,arr:['N','E','S','W','R'],rd:1},
 {id:1,nm:'Krakenreach',order:2,gold:0,arr:['E','R','W','N','S'],rd:-1},
 {id:2,nm:'Tidegrave',order:3,gold:1,arr:['S','W','R','E','N'],rd:1},
 {id:3,nm:'Reefwyrm',order:3,gold:0,arr:['R','N','E','S','W'],rd:-1},
 {id:4,nm:'Gloomfin',order:4,gold:0,arr:['W','S','N','R','E'],rd:1},
 {id:5,nm:'Stormcoil',order:5,gold:0,arr:['E','N','R','W','S'],rd:-1},
 {id:6,nm:'Hollowmaw',order:6,gold:0,arr:['S','R','N','E','W'],rd:1},
 {id:7,nm:'Dredgeback',order:7,gold:1,arr:['N','W','E','R','S'],rd:-1},
 {id:8,nm:'Saltshade',order:7,gold:0,arr:['R','E','S','N','W'],rd:1},
 {id:9,nm:'Abyssal Crown',order:8,gold:0,arr:['W','N','S','E','R'],rd:-1}];
var WAVE_ID=10,MAEL_ID=11;            // Rogue Wave and Maelstrom ride in the leviathan deck
var MAEL_ARR=['E','S','W','N',null,null]; // maelstrom: die 1-6 (5 and 6 = no move)
var DIRN={N:0,E:1,S:2,W:3};
var GATE_NAME='Rift Gate',CANNON_NAME='Deck Cannon',WAVE_NAME='Rogue Wave',MAEL_NAME='Maelstrom';
var LEV_AT_START={1:6,2:6,3:6,4:6,5:5,6:5,7:4,8:4};
