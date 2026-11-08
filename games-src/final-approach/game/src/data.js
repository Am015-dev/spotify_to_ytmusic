// Final Approach static data. Names, text and art are original; numbers (tracks, values, thresholds) follow the rules of the game this one is based on.
// alt rows: [feet, first seat (0 pilot, 1 co-pilot), reroll token on the row]. Track spaces: [planes at setup, traffic-die icons, permitted axis positions or null]; space 1 is where you start, the last space is the airport.
// Axis positions: negative = tilted toward the pilot, positive = toward the co-pilot.
(function (g) {
var FA = g.FA = g.FA || {};
FA.DATA = {
  game: "Final Approach",
  airline: "Kestrel Air",
  rounds: 7,
  diffs: {
    "green": {"name":"Routine landing","c":"#4aa84a"},
    "yellow": {"name":"Exceptional conditions","c":"#e2b81c"},
    "red": {"name":"Elite pilots only","c":"#d8402c"},
    "black": {"name":"Heroic landing","c":"#2c2c34"}
  },
  alt: {"tu":[[6000,0,0],[5000,1,0],[4000,0,0],[3000,1,0],[2000,0,0],[1000,1,0],[0,0,0]],"gy":[[6000,0,1],[5000,1,0],[4000,0,0],[3000,1,0],[2000,0,1],[1000,1,0],[0,0,0]],"rb":[[6000,0,1],[5000,1,0],[4000,0,0],[3000,1,0],[2000,0,0],[1000,1,0],[0,0,0]]},
  speedFaces: [2,3,3,4,4,5],
  rerollTotal: 3,
  coffeeMax: 3,
  planeSupply: 12,
  keroStart: 20,
  keroSkip: 6,
  windStart: 10,
  windMod: [-3,-3,-2,-2,-1,0,1,2,2,3,3,3,2,2,1,0,-1,-2,-2,-3],
  gear: [[1,2],[3,4],[5,6]],
  flaps: [[1,2],[2,3],[4,5],[5,6]],
  brakes: [2,4,6],
  iceBrakes: [2,3,4,5],
  tracks: {
    "tut-a": {"size":5,"sp":[[0,0,null],[0,0,null],[0,0,null],[0,0,null],[0,0,null]]},
    "tut-b": {"size":6,"sp":[[0,0,null],[0,0,null],[1,0,null],[0,0,null],[1,0,null],[0,0,null]]},
    "tut-c": {"size":3,"sp":[[0,0,null],[1,0,null],[0,0,null]]},
    "tut-d": {"size":4,"sp":[[0,0,null],[0,0,null],[1,0,null],[0,0,null]]},
    "pad-g": {"size":7,"sp":[[0,0,null],[0,0,null],[1,0,null],[2,0,null],[1,0,null],[3,0,null],[2,0,null]]},
    "fox-g": {"size":6,"sp":[[0,1,null],[1,0,null],[1,1,null],[2,0,null],[2,1,null],[2,0,null]]},
    "sea-g": {"size":8,"sp":[[0,2,null],[1,0,null],[1,0,[-1,0]],[2,0,null],[1,0,[-2,-1]],[0,0,[-2,-1,0]],[2,0,null],[1,0,null]]},
    "orr-g": {"size":8,"sp":[[0,2,null],[0,0,null],[1,0,null],[0,1,null],[1,0,null],[1,0,null],[1,0,null],[0,0,null]]},
    "gcx-g": {"size":8,"sp":[[0,4,null],[0,0,null],[0,1,null],[0,0,null],[1,1,null],[2,1,null],[1,0,null],[2,0,null]]},
    "cas-g": {"size":8,"sp":[[0,1,null],[0,0,[-1,0]],[1,1,null],[1,0,[1,2]],[0,0,null],[1,1,null],[1,0,null],[1,0,null]]},
    "fox-y": {"size":6,"sp":[[1,2,null],[1,0,null],[1,1,null],[2,1,null],[1,1,null],[2,0,null]]},
    "bwr-y": {"size":5,"sp":[[0,3,null],[1,0,[-2,-1]],[1,0,[-1,0]],[1,0,[-2,-1]],[1,0,null]]},
    "plm-y": {"size":7,"sp":[[0,2,null],[0,0,null],[2,0,null],[1,1,null],[2,1,null],[3,0,null],[1,0,null]]},
    "frm-y": {"size":6,"sp":[[0,2,null],[0,0,null],[1,1,null],[1,0,null],[1,1,null],[0,0,null]]},
    "cas-y": {"size":8,"sp":[[0,0,null],[0,0,null],[1,0,null],[3,1,null],[0,0,null],[3,1,null],[2,0,null],[3,0,null]]},
    "tws-y": {"size":8,"sp":[[0,2,null],[0,0,[1,2]],[1,0,null],[1,1,[0,1]],[0,0,[1,2]],[1,0,null],[1,0,[1,2]],[1,0,null]]},
    "gcx-y": {"size":8,"sp":[[0,1,null],[1,1,null],[0,0,[-1,0,1]],[2,2,null],[2,1,null],[1,0,null],[3,0,[1,2]],[1,0,null]]},
    "cls-r": {"size":6,"sp":[[0,3,null],[1,0,null],[1,0,[-2,-1]],[1,1,[-2,-1,0]],[1,0,[1,2]],[1,0,null]]},
    "sea-r": {"size":8,"sp":[[1,3,null],[0,0,[-1,0]],[1,0,null],[1,1,[-2,-1]],[1,1,[-1,0]],[2,1,null],[1,0,[-2,-1]],[1,0,null]]},
    "plm-r": {"size":7,"sp":[[0,3,null],[1,0,null],[2,1,null],[2,0,null],[1,1,null],[1,0,null],[2,0,null]]},
    "orr-r": {"size":8,"sp":[[1,3,null],[0,0,null],[1,1,null],[0,0,null],[0,1,null],[1,0,null],[0,1,null],[0,0,null]]},
    "bwr-r": {"size":5,"sp":[[0,3,null],[1,0,[-2,-1]],[1,2,[-1,0]],[1,0,[-2,-1]],[2,0,null]]},
    "frm-b": {"size":6,"sp":[[0,2,null],[0,0,[-2,-1,0]],[2,1,null],[1,0,[0,1,2]],[1,0,[-1,0,1]],[0,0,null]]},
    "tws-b": {"size":8,"sp":[[0,3,null],[0,0,[0,1]],[1,1,null],[0,0,[-2]],[1,0,[-1,0]],[1,1,[0,1]],[1,0,[1,2]],[1,0,null]]},
    "cls-b": {"size":6,"sp":[[1,3,null],[0,0,null],[1,1,[-2,-1]],[1,1,[-2,-1]],[1,1,[2]],[1,0,null]]}
  },
  tutorials: [
    {"id":"t1","lad":1,"ap":"pad","col":"green","trk":"tut-a","alt":"tu","mods":[],"ab":0,"title":"Keep it level","text":"Only one control today: the axis. Land with the plane level."},
    {"id":"t2","lad":2,"ap":"pad","col":"green","trk":"tut-a","alt":"tu","mods":[],"ab":0,"title":"Speed and the runway","text":"Add the engines: fly the approach and stop on the airport."},
    {"id":"t3","lad":3,"ap":"pad","col":"green","trk":"tut-b","alt":"tu","mods":[],"ab":0,"title":"Clear the way","text":"Add the radio: send planes away before you reach them."},
    {"id":"t4","lad":4,"ap":"pad","col":"green","trk":"tut-b","alt":"tu","mods":[],"ab":0,"title":"Wheels and flaps","text":"Add landing gear and flaps: both must be down to land."},
    {"id":"tt","lad":0,"ap":"pad","col":"green","trk":"tut-d","alt":"gy","mods":[],"ab":0,"title":"Tutorial flight","text":"A short, easy flight: four rounds, one new control each."},
    {"id":"t5","lad":5,"ap":"pad","col":"green","trk":"tut-b","alt":"tu","mods":[],"ab":0,"title":"Brakes","text":"Add the brakes: they set how fast you may touch down."}
  ],
  airports: {
    "pad": {"code":"PAD","name":"Port Alder","city":"Port Alder","tod":"dawn","wx":"snow","ter":"water","blurb":"A wide river, a snowy shore and a pink sunrise. The friendliest runway on the map."},
    "fox": {"code":"FXM","name":"Foxmere","city":"Foxmere","tod":"night","wx":"fog","ter":"city","blurb":"A black river cuts through a lit-up old city. Traffic queues along the approach."},
    "sea": {"code":"SBB","name":"Seabright Bay","city":"Seabright","tod":"dusk","wx":"clear","ter":"water","blurb":"A snow-capped volcano, a wide turn over the bay and a runway that juts into the water."},
    "orr": {"code":"ORR","name":"Lake Orrin","city":"Orrin","tod":"night","wx":"snow","ter":"plain","blurb":"A long narrow lake on your right, a sleeping city on your left, and a fuel gauge to watch."},
    "gcx": {"code":"GCX","name":"Grand Crossing","city":"Grand Crossing","tod":"night","wx":"clear","ter":"city","blurb":"The busiest hub on the map: parked jets as far as the eye can see and a sky full of lights."},
    "cas": {"code":"CSM","name":"Castlemoor","city":"Castlemoor","tod":"dusk","wx":"clear","ter":"city","blurb":"Red roofs, a hundred spires and old hills beyond. A calm place to practise."},
    "bwr": {"code":"BWR","name":"Bowlrock","city":"Bowlrock","tod":"day","wx":"haze","ter":"mountain","blurb":"An airport at the bottom of a bowl of mountains: drop fast and turn tight."},
    "plm": {"code":"PLR","name":"Palmreach","city":"Palmreach","tod":"dusk","wx":"rain","ter":"water","blurb":"A sugar-white beach, warm rain, and a tail wind that pushes you in too fast."},
    "frm": {"code":"FRM","name":"Frostmere","city":"Frostmere","tod":"night","wx":"snow","ter":"ice","blurb":"A white peninsula under low cloud. The runway is covered in fresh snow."},
    "tws": {"code":"TWS","name":"Twin Spires","city":"Twin Spires","tod":"night","wx":"storm","ter":"plain","blurb":"Two glass towers and electrical storms all round. Thread the gap between the cells."},
    "cls": {"code":"CLS","name":"Cloudspire","city":"Cloudspire","tod":"day","wx":"haze","ter":"mountain","blurb":"A narrow valley high in the mountains. Only a handful of pilots are cleared to land here."}
  },
  scenarios: [
    {"id":"g1","ap":"pad","col":"green","trk":"pad-g","alt":"gy","mods":[],"ab":0,"title":"First Light","text":"Your first flight is going well. The sun comes up over the frozen river. Perfect conditions for a smooth landing."},
    {"id":"g2","ap":"fox","col":"green","trk":"fox-g","alt":"gy","mods":[],"ab":0,"title":"Lights on the River","text":"Lights shimmer along the river as you near the city. There is traffic at the end of your approach. Stay calm."},
    {"id":"g3","ap":"sea","col":"green","trk":"sea-g","alt":"gy","mods":[],"ab":0,"title":"The Long Left Turn","text":"With the volcano behind you, make a wide left turn over the bay and line up with the runway that juts into the water."},
    {"id":"g4","ap":"orr","col":"green","trk":"orr-g","alt":"gy","mods":["kero"],"ab":0,"title":"Eyes on the Gauge","text":"The city is on your left and the long lake shimmers on your right. Keep an eye on your fuel."},
    {"id":"g5","ap":"gcx","col":"green","trk":"gcx-g","alt":"gy","mods":["intern"],"ab":0,"title":"The Nervous Trainee","text":"You break through the cloud over a hub packed with traffic. On top of that you have a nervous trainee to teach."},
    {"id":"g6","ap":"cas","col":"green","trk":"cas-g","alt":"gy","mods":["kero"],"ab":2,"title":"Hours in the Logbook","text":"Your skills are improving. Use special abilities to land safely among the spires of the old town."},
    {"id":"y1","ap":"fox","col":"yellow","trk":"fox-y","alt":"gy","mods":["intern"],"ab":0,"title":"Fog and Holding Patterns","text":"Thick fog has filled the sky with jets circling the city. You need to be alert from the very start of your approach."},
    {"id":"y2","ap":"bwr","col":"yellow","trk":"bwr-y","alt":"gy","mods":["kero"],"ab":2,"title":"Down Into the Bowl","text":"The airport sits at the bottom of a ring of mountains. You must descend quickly and make a very tight final turn."},
    {"id":"y3","ap":"plm","col":"yellow","trk":"plm-y","alt":"gy","mods":["wind"],"ab":1,"title":"The Silent Tower","text":"The tower is not answering. A strong tail wind pushes you in too fast over the beach. Turn wide and control your speed."},
    {"id":"y4","ap":"frm","col":"yellow","trk":"frm-y","alt":"gy","mods":["ice"],"ab":1,"title":"Fresh Snow","text":"Low cloud, a white peninsula and a runway like a skating rink. Use a light touch."},
    {"id":"y5","ap":"cas","col":"yellow","trk":"cas-y","alt":"gy","mods":["leak"],"ab":2,"title":"A Quiet Alarm","text":"The sky is clear, the hills are beautiful, and an alarm sounds: you are losing fuel. Manage your speed and hope for luck."},
    {"id":"y6","ap":"tws","col":"yellow","trk":"tws-y","alt":"gy","mods":["kero"],"ab":1,"title":"Between the Storms","text":"Electrical storms rumble ahead. Keep the plane in line between the storm cells. It will be a bumpy landing."},
    {"id":"y7","ap":"gcx","col":"yellow","trk":"gcx-y","alt":"gy","mods":["leak"],"ab":1,"title":"Holiday Rush","text":"It is the busiest travel day of the year, and a fuel leak means you must push through the traffic to make it in time."},
    {"id":"r1","ap":"cls","col":"red","trk":"cls-r","alt":"rb","mods":["kero","real"],"ab":2,"title":"The Foothills","text":"The locals call them foothills; anywhere else they would be mountains. A narrow valley, thin air and the clock running."},
    {"id":"r2","ap":"sea","col":"red","trk":"sea-r","alt":"rb","mods":["kero","intern"],"ab":1,"title":"Blossom Skies","text":"A festival fills the sky with planes and the air corridor is narrow. Your trainee is on board. Focus."},
    {"id":"r3","ap":"plm","col":"red","trk":"plm-r","alt":"rb","mods":["wind","leak"],"ab":2,"title":"Storm Tail","text":"You are flying in at the tail end of a tropical cyclone: very high winds and a narrow corridor. Why are your palms so sweaty?"},
    {"id":"r4","ap":"orr","col":"red","trk":"orr-r","alt":"rb","mods":["leak","ice"],"ab":2,"title":"Frozen Runway","text":"The runway is frozen solid and the fuel gauge has been low for half an hour. A hundred and fifty people depend on you."},
    {"id":"r5","ap":"bwr","col":"red","trk":"bwr-r","alt":"rb","mods":["kero","wind"],"ab":2,"title":"Drop to the Left","text":"Landing here haunts your dreams. Drop to the left between the mountains and do whatever it takes."},
    {"id":"b1","ap":"frm","col":"black","trk":"frm-b","alt":"rb","mods":["wind","ice"],"ab":2,"title":"Whiteout","text":"You pierce the cloud into a blizzard. The runway lights shimmer dimly through the snow. Concentrate. Focus. Land."},
    {"id":"b2","ap":"tws","col":"black","trk":"tws-b","alt":"rb","mods":["kero","real"],"ab":2,"title":"Lightning Alley","text":"Lightning flashes all around. Getting to the airport will take every last ounce of your concentration, and time is against you."},
    {"id":"b3","ap":"cls","col":"black","trk":"cls-b","alt":"rb","mods":["kero","real"],"ab":2,"title":"Only Eight Pilots","text":"The most dangerous airport on the map. The weather is clear, but only eight pilots are cleared to land here. Add your name to the list."}
  ],
  mods: {
    "traffic": {"name":"Busy Sky","text":"Some spaces show dice icons. Roll the traffic die once per icon. Each roll adds a plane that many spaces ahead. Your own space counts as 1."},
    "turns": {"name":"Tight Corridor","text":"A corridor tab limits the axis. You may fly on only when the axis matches the tab. It is checked on each space you leave. C is level. L1 or L2 tilt left. R1 or R2 tilt right."},
    "kero": {"name":"Fuel Watch","text":"Fuel starts at 20. A die on the fuel space burns its value. No die there burns 6 at round end. Below 0 you lose."},
    "leak": {"name":"Fuel Leak","text":"There is no fuel space. When both engine dice are down, burn their difference plus 1. Below 0 you lose."},
    "wind": {"name":"Tail Wind","text":"A wind dial adds to your engine total. It starts at +3. Each round the axis tilt turns the dial."},
    "intern": {"name":"Trainee","text":"A die on your trainee space takes the next token. Place the token at once as a die. The die must differ from the token. Train all six before you land."},
    "ice": {"name":"Icy Runway","text":"The brakes become four columns: 2, 3, 4, 5. Fill both spaces of the next column in one round. Pilot takes the top, anyone the bottom. All four must be done to land."},
    "real": {"name":"Against the Clock","text":"Each round has a 60-second timer after the roll. When it ends, unplaced dice are lost. Missing axis or engine dice lose the game."}
  },
  abilities: {
    "antic": {"name":"Second Look","text":"Each round the first player may reroll one die. Do it before placing."},
    "adapt": {"name":"Flip Side","text":"Once per game, flip one unplaced die to its opposite face."},
    "mastery": {"name":"Twin Thrust","text":"Equal engine dice earn a reroll token, if one is left."},
    "control": {"name":"Steady Hands","text":"Equal axis dice earn a coffee token, if one is left."},
    "sync": {"name":"Cross-Check","text":"Once a round, after a gear die and a flap die, roll the traffic die. The co-pilot places it as an extra die."},
    "together": {"name":"Hand-Over","text":"Once a round, each of you puts a die here. Swap the values, then take them back."}
  },
  crew: [
    {"id":0,"role":"Pilot","name":"Captain Ines Marlow","short":"Ines","color":"#2f6fd0","story":"Ines has flown night mail for twenty years. She runs gear and brakes.","enjoy":"Pick the Pilot to keep her level and brake at the end."},
    {"id":1,"role":"Co-pilot","name":"First Officer Ravi Okoro","short":"Ravi","color":"#e07a1f","story":"Ravi learned on gliders. He runs the flaps and two radios.","enjoy":"Pick the Co-pilot to clear traffic and time the flaps."}
  ]
};
if (typeof module === 'object' && module.exports) module.exports = FA.DATA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
