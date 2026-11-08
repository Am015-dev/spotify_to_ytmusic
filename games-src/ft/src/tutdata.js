// ---------- the coached game: a stacked bazaar and market so the needed situations come up; every move is free; never saved ----------
// Rules checklist the tutorial teaches (tutor.js lists the step that covers each):
//  goal / points   most points wins; coins, tribes, tiles, goods and djinns all count
//  bid             turn-order track, dearer spots play first, same price: later bidder first, two markers each with two players, coins are points
//  move            lift everyone from a tile, drop one per tile (up, down, left, right), never straight back, the last must land on its colour
//  take            take every person of that colour from the tile; an emptied tile is claimed with a camel
//  tribes          Traders (goods), Masons (coins by blue tiles, a Mystic adds one), Sages (2 points, pay for djinns), Advisors (1 + 10 per rival with fewer), Shadows
//  tiles           Stall (3 coins for a good), Hamlet (palace 5), Shrine (summon a djinn), Oasis (palm 3), Grand Bazaar (6 coins for 2 goods)
//  goods / Mystics sets of different kinds score 1/3/7/13...; sell a set at the end of a turn; Mystics never score but boost Masons and Shadows
//  computer        the computer plays by the same rules, one step at a time
//  end             the last camel ends the game; score coins, Advisors, Sages, djinns, tiles with palms and palaces, goods
const TUT_SEED=20261009;
// tile index = row*6+col (rows A-E, columns 1-6). The five stages of the lesson, all drawn on this one board:
//   comp A  (turn 1) lifts Sages from L11 and walks 10, 9 to the Shrine on 8, takes the Sages, claims it and summons a djinn
//   you T1  (turn 2) lift the Traders on 24, walk 25, 26 to the Stall on 27, take 4 Traders, claim it, buy a Mystic, sell 4 goods
//   comp B  (turn 3) lifts Advisors from 5 and walks 4, 3 to the Oasis on 2, takes the Advisors, claims it, plants a palm
//   you T2  (turn 4) lift the mixed tile on 19, walk 20, 21 to the Hamlet on 15, take 4 Masons (+1 with your Mystic), claim it, raise a palace
const TUT_KEYS={   // tile index -> [kind, value] (value only where several exist)
  8:['sacred',6],9:['village'],14:['sacred',6],15:['village'],21:['sacred',6],   // the five blue tiles around the Hamlet on 15
  10:['oasis'],16:['small'],20:['small'],22:['oasis'],                                      // and the four red ones, so the Masons earn on exactly five blue tiles
  2:['oasis'],27:['small'],19:['oasis'],24:['small'],26:['large']};
const TUT_PEOPLE={   // tile index -> its three people (the rest of the bazaar is filled from what is left)
  11:['elder','elder','elder'],8:['elder','elder','elder'],5:['vizier','vizier','vizier'],2:['vizier','vizier','vizier'],
  24:['merchant','merchant','merchant'],27:['merchant','merchant','merchant'],19:['builder','vizier','vizier'],15:['builder','builder','builder'],13:['vizier','assassin','assassin']};
const TUT_MARKET=['fish','wheat','silk','fakir','pottery','spice','fakir','jewels','papyrus'];
const TUT_DJ=['nakhla','wazira','hikma'];
function tutBuild(){
  // 1. the tiles: the keyed positions get their kind, everything else keeps the order the seed gave
  const pool=G.board.slice(),out=new Array(G.W*G.H).fill(null);
  for(const i in TUT_KEYS){const [k,v]=TUT_KEYS[i];const j=pool.findIndex(t=>t.k===k&&(v==null||t.v===v));if(j<0)throw new Error('tutorial: no '+k+' tile');out[i]=pool.splice(j,1)[0]}
  for(let i=0;i<out.length;i++)if(!out[i])out[i]=pool.shift();
  G.board=out.map((t,i)=>Object.assign(t,{i,m:[],camel:null,tent:null,palm:0,pal:0}));
  // 2. the people: the keyed tiles first, the rest dealt from what is left
  const left={};for(const c in MEEPLE_COUNT)left[c]=MEEPLE_COUNT[c];
  for(const i in TUT_PEOPLE){G.board[i].m=TUT_PEOPLE[i].slice();for(const c of TUT_PEOPLE[i])left[c]--}
  const rest=[];for(const c in left)for(let k=0;k<left[c];k++)rest.push(c);shuffle(rest);
  for(const t of G.board){while(t.m.length<3)t.m.push(rest.pop())}
  G.bag=[];
  // 3. the goods market and the djinns on offer
  const all=G.market.concat(G.rdeck);for(const r of TUT_MARKET){const j=all.indexOf(r);all.splice(j,1)}
  G.market=TUT_MARKET.slice();G.rdeck=all;
  for(const k of TUT_DJ){let j=G.djDeck.indexOf(k);if(j>=0)G.djDeck.splice(j,1);else{j=G.djRow.indexOf(k);if(j>=0)G.djRow.splice(j,1)}}
  G.djRow=TUT_DJ.slice();
  // 4. the order the markers bid in: you, Teal, you, Teal
  G.bidQueue=[{p:0,k:0},{p:1,k:0},{p:0,k:1},{p:1,k:1}];
  G.coach=1}
function tutNew(){const keep=DEFSEED;setSeed(TUT_SEED);
  try{newGame({np:2,seats:['human','ai'],lv:['normal','normal'],mode:'x',names:['You','Farid'],coach:true})}finally{DEFSEED=keep}
  tutBuild();for(const p of G.pl)p.camels=3;   // three camels each: a coached game is over in a few rounds
  lg('The coached game begins.','big')}
