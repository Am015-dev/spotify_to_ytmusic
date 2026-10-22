// onfoot-edge-r22e31: registers the on-foot world-edge GO (OF_edgeGo in 98of_onfoot.js); a separate module because 99c_checklist.js is at its 200 KB cap
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.push({ver:'edge1',id:'onfoot-edge',area:'people',text:'foot: · WORLD EDGE (📍 GO: on foot, runs straight at each edge N S E W and at the 2 spots where the bot left the world, 20 s each). You stop 10 m inside the world box like the car (slow-down + TURN BACK banner), never below the ground, no jump. Frankfurt + Athens.'});
 __chk.GO['edge1/onfoot-edge']=['fra','ath'].map(c=>({c,n:'run at the edges',secs:60,fn:()=>OF_edgeGo()}))},500)}
