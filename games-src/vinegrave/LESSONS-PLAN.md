# Vinegrave scenario lessons: plan for the worker (GXST engine, shell/GXST.md; pattern: ../cauldron-fair/lessons.js and lessons-test.js)

## s1 wire
files: build.py, src/body.html, src/head.html (only if needed)
do: add gx-scenario-tutor.js (shell dir) to SRC and a `<script src="gx-scenario-tutor.js"></script>` + `<script src="lessons.js"></script>` tag to
body.html (gx-scenario-tutor.js after gx-tutor.js; lessons.js LAST, after ui.js); lessons.js is read from vinegrave/lessons.js (D dir, not src/).
Add gx-scenario-tutor.css to the css list in build.py. Copy how ../cauldron-fair/build.py does it.
done-when: `python3 build.py && grep -q GXST vinegrave.html`

## s2 lessons
needs: s1
PATHS: all paths in this plan are relative to games-src/vinegrave/ (repo root is two levels up).
files: lessons.js (new, ES5 IIFE like cauldron-fair/lessons.js; ~130 lines)
do: engine globals: G (getter), UI, VG (engine), VAI (ai), render(), startGame(mode,o), V=VD data. Player is seat 0 (G.p[0]), rival seat 1.
Header comment: rule -> lesson table. Helpers:
- ready(): typeof G!=='undefined' && typeof startGame==='function' && typeof VG!=='undefined' && typeof render==='function'.
- stack(sp): L.on=true; L.n=0; L.bought=null; UI.fast=true; try{GX.close()}catch; try{GXH.setEnabled(false);GXH.hide()}catch; startGame('vs',{np:2,lvl:'easy',seed:sp.seed||5});
  then `sp.fix(G)` mutates G.p[0].hand (ids), G.p[0].res, G.row, G.sites; set G.p[1].passed? NO: rival is scripted (see go()). Then render(); return a Promise
  resolving after 400 ms (setTimeout). UI.fast=true makes the rival and effects instant.
- me()=G.p[0]. settled(): !!G && !UI.busy && G.phase==='play' && VG.actor(G)===0 (my turn again) OR G.phase==='over'.
- go(): wait until ready(). Then (a) wrap VAI.choose: when L.on && GXST.active() return the move {t:'pass'} found in VG.moves(G) (rival always passes at once),
  else call the original; (b) wrap global `save` and `showGoal` so they do nothing while GXST.active() (lessons never overwrite the saved game, no goal popup);
  (c) wrap doMove: if L.on && VG.actor(G)===0 and the move is not free (!m.free) and m.t!=='ans': L.n++; if m.t==='buy' L.bought=G.row[m.r]; if m.t==='pass' L.passed=true; then call original;
  (d) hidden slot: `<div id="gxst-slot" hidden>` appended to body; (e) GXST.init({game:'vinegrave', scenarios:lessons, qParent:'#gxst-slot', keepClear:['#dock','#row','#map','.gx-bar'], settled:settled});
  (f) a click on `[data-lessons-open]` calls GXST.picker(); (g) listen window 'gxst': close/picker -> L.on=false; start/retry -> L.on=true;
  (h) ?lesson=<id> in location.search: after boot start it: GXST.start(id). `window.VGLessons={open:GXST.picker}`. Call go via setTimeout(go,300).
Lessons (id, title<=3 words, goal<=12 words, par = my main actions needed). All: success judged on real G; fail returns a one-sentence cause->effect or false.
 hand ids: dread, grant (coin 1), trail (compass 1); all cards have a Boot icon. Items: lamp (ship icon), ledger, journal(2vp, cost 3), sextant, pickaxe, canteen, machete.
- L1 play  'Play a card': fix: hand=['dread','dread','grant','trail','trail']. goal 'Gain a compass this turn.' par 1.
    success: me().res.compass >= 1+startCompass (record sp.c0 = res.compass in fix). fail: L.n>=1 && !success -> 'That did not give a compass. Trail Notes give a compass, Patron Letters a coin.' also if L.passed 'Passing ends your round with nothing gained.'
    hints: ['Which card says compass?', {say:'Tap Trail Notes, then Play.', target: first #hand .cd that glows}].  debrief 'A played card does its effect. You get one main action a turn.'
- L2 dig 'Dig a camp': fix: hand=['dread','grant','trail','dread','trail']; goal 'Dig where a tablet is waiting.' par 1.
    success: me().res.tablet>=1. fail: L.n>=1 && !success -> 'That camp gave other goods, not a tablet. Each camp has its own reward.'
    hints: ['Read each camp. Which one pays a tablet?', {say:'Tap Lookout Cliff, then Dig.', target: '.site' element of site c-cliff (find via G.sites index)}]. debrief 'Camp rewards differ. A card you pay with leaves your hand.'
- L3 travel 'Pay the travel': fix: hand=['lamp','dread','dread','grant','trail']; goal 'Dig at a camp that needs a Boat.' par 1. Camps with ship: c-wreck, c-cove.
    success: G.sites c-wreck or c-cove occ===0. fail: L.n>=1 && !success -> 'You dug a Boot camp. The goal was a Boat camp, which needs a Boat card.'
   hint show: tap the Tin Lamp card? NO: target the Old Wreck site. debrief 'Each travel icon is paid by one card. Boat cards pay Boat or Boot.'
- L4 plane 'Buy a Plane': fix: hand=['dread','dread','trail','grant','trail'], res.coin=2; goal 'Dig the Old Wreck. You hold no Boat card.' par 1.
    success: site c-wreck occ===0. fail: L.n>=1 && !success -> 'You did not reach the Old Wreck. Two coins buy a Plane, and a Plane pays any icon.'
    debrief '2 coins = a Plane. A Plane pays any travel icon.'
done-when: `node --check lessons.js`

## s2b more lessons
needs: s2
files: lessons.js
do: lessons.js already exists with helpers and lessons 1-4 (array `lessons`). Append lessons 5-8 to the array, keeping the same object shape and helpers. Same specs as below.
- L5 discover 'Find a ruin': fix: hand=['dread','dread','grant','trail','trail'], res.compass=3; goal 'Discover a hidden ruin and take its idol.' par 1.
    success: me().idols.length>=1. fail: L.n>=1 && !success -> 'You dug a camp instead. A hidden ruin needs 3 compasses and gives an idol.'
    target hint: the hidden level-1 site (G.sites with lvl===1 && !tile, first). debrief 'Three compasses open a ruin: an idol (3 points) and loot. A guardian wakes there.'
- L6 overcome 'Beat a guardian': fix: x=G.sites[5]; x.tile=G.s1.pop(); x.guard=G.guards.pop(); x.occ=0; me().ex=1; me().res={coin:5,compass:5,tablet:3,arrow:3,jewel:3}; hand=['dread','dread','grant','trail','trail']
   (copy the vg-overcome setup in src/scn.js); goal 'Overcome the guardian on your ruin.' par 1. success: me().guards.length>=1.
    fail: L.n>=1 && !success -> 'You left the guardian. Unbeaten, it sends a Dread card home with you at round end.'
    target: the .site[data-i="5"]. debrief 'Pay its cost: 5 points and a boon to use later. Leave it and Dread follows you home.'
- L7 market 'Buy a card': fix: res.coin=3; G.row[0..4]=['ledger','journal','pickaxe','sextant','canteen']; hand=['dread','dread','grant','trail','trail']; goal 'Buy the card worth 2 points.' par 1.
    success: L.bought==='journal'. fail: L.bought && L.bought!=='journal' -> 'That card is worth less. Check the points on each card.'
    target: the #row .cd that is journal (index 1). debrief 'Items cost coins and go to the bottom of your deck. Some are worth end points.'
- L8 research 'Climb the track': fix: me().glass=1; me().note=0; res={coin:0,compass:0,tablet:1,arrow:1,jewel:0}; hand as lesson 7; goal 'Gain 2 compasses from the research track.' par 1.
    success: me().glass===2. fail: L.n>=1 && !success -> 'The notebook row pays a coin. The magnifier row 2 pays two compasses.'
    target: '#track'. debrief 'The magnifier leads. The notebook follows but never passes it. Each row pays a bonus.'
Every lesson object also has rule: one sentence (the rule taught). hints[0] is a nudge question, hints[1] = {say, target: fn returning the element}.
done-when: `node --check lessons.js`

## s3 test
needs: s2b
files: lessons-test.js (new; copy ../cauldron-fair/lessons-test.js and adapt)
do: html = vinegrave.html; storage key 'gxst-vinegrave'; drop game-specific SOLVE (below) and cauldron's 'lose'/'game' branches; keep picker, wrong->fail->Retry, right->win 3 stars,
hint ring, minimise/drag/close, progress, 0 errors, contact sheet to vinegrave/proof/lessons-<size>-sheet.jpg. A tap is: select by CSS then tap the glow; selection then Go is `#gobtn`.
Targets T: hand card by glyph: {t:'#hand .cd',re:/Trail Notes/}, {t:'#hand .cd',re:/Patron/}; Play/Dig/Buy/Discover/Beat all via {c:'#gobtn'}; camp sites {t:'#map .site',re:/Lookout/}, /Clear Spring/, /Old Wreck/; hidden ruin {c:'#map .site.l1.hid'};
row card {t:'#row .cd',re:/Trade Ledger/}, /Dusty Journal/; track {c:'#track'} then choice {t:'#qbox [data-a=mv]',re:/magnifier|glass/i} vs /notebook/i (check the text in the browser, adjust); pass {c:'#passbtn'}.
myTurn(): wait until `#pacts` is rendered and !UI.busy. SOLVE: play wrong=[Patron,gobtn] right=[Trail,gobtn]; dig wrong=[Clear Spring,gobtn] right=[Lookout,gobtn]; travel wrong=[Clear Spring,gobtn] right=[Old Wreck,gobtn];
plane wrong=[Clear Spring,gobtn] right=[Old Wreck,gobtn]; discover wrong=[Clear Spring,gobtn] right=[hidden ruin,gobtn]; overcome wrong=[pass] right=[site idx 5 (.site[data-i="5"]),gobtn]; market wrong=[Ledger,gobtn] right=[Journal,gobtn]; research wrong=[track, notebook choice] right=[track, magnifier choice].
Add a phone-width check: at 402x874 the card (.gxst-card) must not overlap #hand or #row rects at lesson start (note it if it does; do not fail the lesson).
done-when: `node lessons-test.js`
