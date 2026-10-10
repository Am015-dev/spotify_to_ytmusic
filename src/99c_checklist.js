// ===== CK: in-game TEST CHECKLIST (Alex 2026-10-08: "I will play, just include a check list inside the game update so I can validate").
// OD_CHECKLIST = items per version; each gets ✅ PASS / ❌ FAIL + an optional note, saved in localStorage 'mho_chk'. "COPY RESULTS" copies
// plain text (version, id, status, note) to paste to the coordinator. Opens from "✔ CHECKLIST" in the ⚙ drawer header and the UPDATES screen.
// The buttons show how many items of the current version are still unanswered. Every deploy adds its own items (newest version first).
const OD_CHECKLIST=[
 {ver:'v89s',id:'rally-garage',text:'Garage → RIDES → Rally S1: the white/yellow rally car shows with its wing, curved hood and 4 wheels; SAVE & DRIVE works.'},
 {ver:'v89s',id:'rally-drive',text:'Drive the Rally S1 for a minute: it sits on the road (no floating), steers like the other cars, nothing falls off.'},
 {ver:'v89s',id:'speedboat',text:'RIDES → WATER → Harbour Speedboat, then drive into the river: the red boat with its driver sits in the water.'},
 {ver:'v89s',id:'bank',text:'Frankfurt start: the red/white LEGO bank stands on the grass by the road; driving into it you bump its walls, not thin air.'},
 {ver:'v89s',id:'taxi',text:'RIDES → Yellow Taxi (40468): it looks like the LEGO set and drives normally.'},
 {ver:'v89q',id:'night-blocks',text:'Drive at dusk/night: no pink or white blocks float next to your car or traffic.'},
 {ver:'v89p',id:'night-mem',text:'iPhone: drive 15 min in Frankfurt at dusk/night: no slowdown, no reload.'},
 {ver:'v89o',id:'gar-stop',text:'Drive through Eleni\'s garage ring without stopping: no menu pops up; stop in it: the menu opens.'},
 {ver:'v89o',id:'ath-gb-road',text:'Athens: golden bricks are on roads, not in blocks or on the hill.'},
 {ver:'v89o',id:'plate-gear',text:'Phone: the district name in the top right is fully visible below the ⚙ button, also during a challenge.'},
 {ver:'v89n',id:'ath-mem',text:'iPhone: start in Athens: the city loads in about a minute and the page never reloads while you drive 5 min.'},
 {ver:'v89l',id:'stuck-push',text:'Drive slowly into a stopped car and keep GAS on: within a second it is pushed aside and you can pass.'},
 {ver:'v89l',id:'drift-brake',text:'Phone: at 60 km/h or more, keep GAS on, steer and hold BRAKE for a moment: the car drifts (pink trail, mini-turbo after). A quick BRAKE tap only brakes.'},
 {ver:'v89k',id:'gold-brick',text:'Golden bricks look like a big gold 2×2 LEGO brick at car-roof height (no pole), and you collect it by driving through.'},
 {ver:'v89j',id:'tip-avatar',text:'Oma Hilde\'s tip text never runs under her picture.'},
 {ver:'v89j',id:'walls-pill',text:'Frankfurt: no plain beige walls; the TAP TO OPEN pill doesn\'t cover the speed bar.'},
 {ver:'v89i',id:'perf-thumbs',text:'Garage: part pictures and car cards all show (no blank tiles), and PAINT recolours them.'},
 {ver:'v89i',id:'perf-ctx',text:'iPhone: open and close the garage 3×, then drive: no black screen, no reload.'},
 {ver:'v89h',id:'ath-take2',text:'Athens: stop near traffic, get out and walk up to a car that stops for you (walk round a scooter if one is in front): 🚗 TAKE appears and you drive off with ★1.'},
 {ver:'v89h',id:'ath-fill',text:'Athens: drive 1 to 1.5 km out from the centre and look between the streets: blocks have windows and balconies, no long blank grey or beige walls.'},
 {ver:'v89h',id:'pin-yield',text:'Phone: at the story start Oma Hilde\'s tip is fully readable, and tapping ❚❚ shows the whole PAUSE card (RESUME not covered). The checklist bar comes back afterwards.'},
 {ver:'v89g',id:'ro_start',text:'RACE → Riverbank Rally (or Coast Rally in Athens). You start 8th at the back: you see the whole field ahead on a wide open course, and the big 8TH top-left changes as you pass cars.'},
 {ver:'v89g',id:'ro_route',text:'At a fork, follow the orange arrows onto the dirt SHORTCUT (you turn into a 4×4), or the blue arrows into the water lane (you turn into a boat). Both feel faster than the road.'},
 {ver:'v89g',id:'ro_jump',text:'Jump the creek (Frankfurt) or the olive crest (Athens) at full speed: you fly over and land on the far side.'},
 {ver:'v89g',id:'ro_cliff',text:'Drive off the cliff edge on purpose: you see a real drop to the water, "OFF THE CLIFF!" appears, and you are back on the road within 3 s (tap to respawn at once). You keep your place.'},
 {ver:'v88z',id:'speed',text:'Take a sports car (Hot Rod) onto the Autobahn and hold GAS: the HUD reaches about 230 km/h, BOOST takes it past 260. A 4×4 tops out around 155. Steering feels the same as before.'},
 {ver:'v88z',id:'kreuz',text:'Autobahn west of the city, at the Frankfurter Kreuz: drive under the flyover at full speed, then take the A5 over it. No drop, no sudden stop, no invisible wall.'},
 {ver:'v88z',id:'ramps',text:'Drive along a street to a yellow ramp: it sits in your lane, no traffic queued on it, and you can jump it. Try the ramp on the Eiserner Steg footbridge.'},
 {ver:'v88z',id:'traffic',text:'Frankfurt: a few city buses, fewer police and trucks. Athens: more scooters, fewer taxis. Does the traffic look right?'},
 {ver:'v88z',id:'ath-walls',text:'Athens: drive around Eleni\'s Garage (Psyrri) and a RAMP JUMP pop-up ring. Any invisible walls or getting stuck between buildings?'},
 {ver:'v89f',id:'g13-search',text:'Garage BUILD: type “headlight” in Search parts: the headlight brick shows up; tap + to put it in the TRAY.'},
 {ver:'v89f',id:'g13-turn',text:'Hold a part and turn it on X, Y and Z (⟲ AXES pad, or PC R / T / F), then ✔ PLACE it on the car.'},
 {ver:'v89f',id:'g13-join',text:'SELECT 3 loose parts → JOIN: they become one 🔗 Piece; save it and find it in MY PARTS.'},
 {ver:'v89f',id:'g13-paint',text:'Tap PAINT in the BUILD bar: the colour chips open and the next part uses the colour you tapped.'},
 {ver:'v89e',id:'stream-drive',text:'Drive 2 min fast on the Autobahn and then across Athens: no grey holes or buildings popping in close to you, no stutter.'},
 {ver:'v89e',id:'stream-ios',text:'iPhone: play 10 min in Athens and Frankfurt: the page never reloads or crashes.'},
 {ver:'v89d',id:'jack-take',text:'Get out next to a street, step in front of a slow car or walk up to a parked one: the yellow button reads 🚗 TAKE. Tap it (PC: F).'},
 {ver:'v89d',id:'jack-pull',text:'After TAKE: the driver is pulled out, a "HEY!" bubble shows (not hidden under the cards at the top) and he runs off. Is he as tall as you?'},
 {ver:'v89d',id:'jack-drive',text:'Drive the taken car away: ★1 shows next to the speed, the camera is as far back as with your own car, and the tyres sit on the road.'},
 {ver:'v89d',id:'ath-park',text:'Athens: look for cars parked at the kerb. Walk up to one and tap ENTER to drive it.'},
 {ver:'v89b1',id:'foot-cam',text:'On foot, hold the stick a little to the right for 10 s: you walk a wide curve or straight line, NOT endless circles, and the camera does not keep spinning.'},
 {ver:'v89b1',id:'foot-orbit',text:'On foot, drag on the empty right side of the screen: the camera turns around you (and up/down). Double-tap there: it goes back behind you. Buttons still work.'},
 {ver:'v89a',id:'foot-exit',text:'Drive, then stop and let go of the pedals: BRAKE turns into a yellow 🚪 EXIT. Tap it (PC: F). Your minifig steps out next to the car, the driver seat is empty, the car stays parked.'},
 {ver:'v89a',id:'foot-walk',text:'On foot: drag on the left half of the screen to walk, push far to run; RUN and JUMP work. Walk 30 m along a street: no getting stuck on kerbs, the camera stays behind you and never inside a wall. Your minifig is as tall as the people around.'},
 {ver:'v89a',id:'foot-pc',text:'PC: stop the car, press F (or E) to get out, walk with WASD (Shift runs, Space jumps), press F next to a car to get in.'},
 {ver:'v89a',id:'foot-enter',text:'Walk up to a parked car at the kerb (Frankfurt) or back to your own car: 🚪 ENTER appears. Tap it, drive away 100 m: the car sits on the road, all controls work as before.'},
 {ver:'v88y',id:'gp-canvas',text:'Garage BUILD → MY PARTS → CANVAS: an empty green 32×32 baseplate. Place a few bricks, pinch to zoom and drag with two fingers to move the view, then ← CAR: your car is unchanged.'},
 {ver:'v88y',id:'gp-part',text:'On the canvas: ☝ SELECT your bricks → ⛓ GROUPS → MAKE GROUP → 💾 SAVE PART. Back on the car, MY PARTS → tap the part, tap a spot at the side of the car, ✔ PLACE: it appears on both sides. SAVE & DRIVE, reload: it is still there.'},
 {ver:'v88y',id:'gp-tiles',text:'BUILD → TILES: round, quarter, macaroni, slope, curve and printed tiles look like real LEGO tiles; nothing overlaps the buttons while holding or selecting a part.'},
 {ver:'v88x',id:'ath-dress',text:'Athens: drive along streets for 1 minute: orange trees, green kiosks, parked scooters and bollards line the pavements; more crowds/cafés; smashing one gives a brick burst. Is Athens lively enough?'},
 {ver:'v88x',id:'steg-tower',text:'Frankfurt: drive to the Eiserner Steg (red iron footbridge): the 4 towers at its ends have windows, a door and a red roof (no plain beige pillar).'},
 {ver:'v88x',id:'crowd-car',text:'Look at crowds next to parked cars: nobody stands inside a car.'},
 {ver:'v88w',id:'bricks2x',text:'Drive slowly past houses and shops: walls show LEGO brick rows, low flat roofs show studs, nothing flickers or shimmers. Far away the city looks as before.'},
 {ver:'v88w',id:'world-smooth2',text:'PC and phone: drive 1 minute in Frankfurt and in Athens. ⚙ TUNE → Life → Show FPS: copy the line into the notes (draws about 200 or less). Map icons still float over missions.'},
 {ver:'v88w',id:'ath-popup',text:'Athens: drive along streets for 1–2 minutes: a pop-up challenge ring (RAMP JUMP, DRIFT ZONE…) appears ahead in your lane; drive through it to start.'},
 {ver:'v88v',id:'world-smooth',text:'PC and phone: drive 1 minute fast in Frankfurt and in Athens. It feels smoother than before. ⚙ TUNE → Life → Show FPS: copy the line into the notes (draws should be about 250 or less, tris about 1 M).'},
 {ver:'v88v',id:'world-look',text:'Look far down long streets and from bridges: the far city still looks like the city (same colours, no holes, no flicker). Up close, buildings, trees and cars look exactly as before.'},
 {ver:'v88v',id:'world-cars',text:'Traffic cars look normal up close; far away they look simpler but have the right colour and shape, and no car pops in or out right in front of you.'},
 {ver:'v88u',id:'perf-smooth',text:'The game runs smoothly on PC and phone in Frankfurt and in Athens: drive 1 minute fast through busy streets, no stutter. If it still lags: ⚙ TUNE → Life → turn on "Show FPS" and send a screenshot of the line at the bottom while driving.'},
 {ver:'v88u',id:'perf-pc',text:'Turn on ⚙ TUNE → Life → Show FPS on PC, drive in Frankfurt for 30 s, and copy the line at the bottom left into the notes here.'},
 {ver:'v88u',id:'perf-people',text:'Streets still feel alive but not crowded: a few groups of people ahead, not a crowd everywhere.'},
 {ver:'v88u',id:'perf-pop',text:'The first pop-up ring of a drive appears without a hitch.'},
 {ver:'v88t',id:'sc-rides',text:'Garage RIDES → STREET: a SPEED SERIES row shows Time Coupe, Red Hypercar and Gold Formula; each looks like a LEGO Speed Champions car (8 studs wide, chunky, real parts).'},
 {ver:'v88t',id:'sc-drive',text:'Equip each of the 3 new cars, SAVE & DRIVE: all four tyres sit on the road and it handles like the other normal cars.'},
 {ver:'v88t',id:'sc-guide',text:'▶ GUIDE on each of the 3 new cars plays it step by step (chassis → wheels → nose → sides → cockpit → rear → wing).'},
 {ver:'v88t',id:'sc-traffic',text:'Drive around Frankfurt or Athens: you meet the grey Time Coupe and the red Hypercar in traffic. In a race, some rivals drive the new cars.'},
 {ver:'v88t',id:'sb-pal',text:'In the guide tap ✋ BUILD IT: the next part is already selected (highlighted) in the parts palette, in its colour, and scrolled into view.'},
 {ver:'v88t',id:'sb-onetap',text:'In BUILD IT, one tap on (or near) the green ghost places the part straight away; no second tap or PLACE needed.'},
 {ver:'v88q',id:'pin-fold',text:'Garage RIDES: the checklist shows as a small ✓ chip and does not cover the car; tap it to open. In a race it stays folded during the 3-2-1-GO countdown, then opens again.'},
 {ver:'v88p',id:'life-crowds',text:'Drive 1 minute in Frankfurt and in Athens: at most street corners ahead you see a group of 3-6 people standing together; they turn to look, wave and hop as you come by.'},
 {ver:'v88p',id:'life-dodge',text:'Drive fast past a corner group: the people leap out of the way; nobody stands on the road.'},
 {ver:'v88p',id:'life-stalls',text:'You pass market stalls (striped awnings, fruit boxes) and café tables with umbrellas on the pavements. Drive into one: it bursts into bricks and studs; it does not stop you dead.'},
 {ver:'v88p',id:'life-parked',text:'Parked cars stand half on the kerb on many streets ahead; driving into one slowly bumps you off it, fast smashes it.'},
 {ver:'v88p',id:'pop-ring',text:'While free-roaming, every ~30 s a coloured ring with a sign (RAMP JUMP, DRIFT ZONE, SMASH STREAK, CONE SLALOM) appears on the road ahead in your lane. Only one at a time, no new buttons or panels.'},
 {ver:'v88p',id:'pop-play',text:'Drive through a ring: the objective line shows the challenge, the progress and the seconds left. Finish it: big brick burst and +150 studs. Miss it: a short MISSED message, nothing else.'},
 {ver:'v88p',id:'pop-each',text:'Try all four: the ramp launches you, the drift counts only while drifting, the crates smash, the cones fly when you clip them.'},
 {ver:'v88p',id:'life-fps2',text:'On the phone the game still runs smoothly in a busy street with a pop-up running.'},
 {ver:'v88o',id:'pin-strip',text:'This checklist stays on screen while you drive, race and build: answer with ✅ / ❌, ‹ › to move, tap the counter to fold it to a chip. Steering and gas keep working while you tap it.'},
 {ver:'v88o',id:'clear-base',text:'Garage BUILD → ⋯ MORE → CLEAR on a normal car and on the Bus: only the chassis and wheels stay, with one clean grid and nothing overlapping. UNDO brings the build back.'},
 {ver:'v88o',id:'gx-palette',text:'Garage BUILD (phone): the parts palette shows 2 rows of bigger tiles with names; swipe it sideways to see more. ▾ makes it small again.'},
 {ver:'v88o',id:'gx-chips',text:'Tap the category chips (BRICKS, PLATES, SLOPES…): only those parts show. Pick a few parts, then tap 🕘 RECENT: the parts you just used are first.'},
 {ver:'v88o',id:'gx-fav',text:'Long-press a part tile (right-click on PC): it gets a ★ and shows under ★ FAVS. Long-press again removes it. It is still there after a reload.'},
 {ver:'v88o',id:'gx-make',text:'Tap ☝ SELECT, tap 3–4 parts, then MAKE GROUP: a group "Group 1" appears in the ⛓ GROUPS list. ✎ renames it.'},
 {ver:'v88o',id:'gx-eye',text:'In ⛓ GROUPS tap the 👁 eye: the group disappears and its parts cannot be tapped; tap again to show it. SAVE & DRIVE with it hidden: the car you drive is complete.'},
 {ver:'v88o',id:'gx-ops',text:'Tap a group name: MOVE, COPY, MIRROR and DELETE work on the whole group (UNDO brings a deleted group back).'},
 {ver:'v88o',id:'gx-hideup',text:'Open a big template (Bus), step the LAYER ▼ down and tap HIDE UP: everything above the layer disappears so you can build inside; SHOW UP brings it back.'},
 {ver:'v88n',id:'life-people',text:'Drive 1 minute in Frankfurt: you see people on the pavements most of the time, and some wave both arms as you pass them.'},
 {ver:'v88n',id:'life-traffic',text:'Traffic cars show up on the streets around you (not only far away), including orange and pink street racers; they still do not block the inner lane.'},
 {ver:'v88n',id:'life-pigeons',text:'Drive toward a group of grey pigeons on a pavement: they fly off before you reach them. White gulls circle high above.'},
 {ver:'v88n',id:'life-sky',text:'Look around: red/white flags flap on some rooftops and a LEGO blimp slowly circles over the city (Athens: blue/white flags).'},
 {ver:'v88n',id:'life-boats',text:'Frankfurt: boats sail up and down the Main. Drive the boat into one: you bounce off, you do not pass through it.'},
 {ver:'v88n',id:'life-colours',text:'Frankfurt buildings have bold LEGO colours (red, yellow, blue, green); Athens old-town houses are warm yellow/orange. Nothing looks washed out.'},
 {ver:'v88n',id:'life-fps',text:'On the phone the game runs as smoothly as before in a busy street (no new stutter).'},
 {ver:'v88n',id:'life-knob',text:'⚙ TUNE → Life → "World life (master)" at 0 makes the streets quiet again; at 1.5 they get busier.'},
 {ver:'v88l',id:'sb-open',text:'Garage RIDES: every car card has ▶ GUIDE; tapping it plays that car being built step by step (parts drop in, a parts box on the left, a counter like 1/22 top right).'},
 {ver:'v88l',id:'sb-ctrl',text:'In the guide: ◀ ▶ change the step, PLAY/PAUSE, ×1/×2, the slider jumps; no button covers the car on the phone; EXIT goes back to the garage with your car unchanged.'},
 {ver:'v88l',id:'sb-more',text:'BUILD → ⋯ MORE → BUILD GUIDE works for any car (also the bus or your own build); EXIT returns to BUILD.'},
 {ver:'v88l',id:'sb-diy',text:'In the guide tap ✋ BUILD IT: the next parts show as a green ghost; tapping near it snaps the part in; 💡 PLACE IT places it for you; ✕ before the end restores the car.'},
 {ver:'v88k',id:'su-rides',text:'Garage RIDES → STREET: the row STREET RACER FAMILY shows 4 cars (Orange Street Racer + 3 variations), then TUNER FRIENDS with 3 more.'},
 {ver:'v88k',id:'su-look',text:'Orange Street Racer looks like the LEGO set: orange, open top with blue seats, lime side graphics, grey wing on struts, silver wheels.'},
 {ver:'v88k',id:'su-drive',text:'Equip the Orange Street Racer, SAVE & DRIVE: it drives like the other normal cars (not slow like the bus).'},
 {ver:'v88k',id:'su-tyres',text:'All four tyres of every new car sit on the road, including the Widebody Track Racer and the Black Gold V8 (gold wheels).'},
 {ver:'v88k',id:'su-build',text:'✎ BUILD on a new car: its parts load and you can remove the wing or recolour it.'},
 {ver:'v88i',id:'big-rides',text:'Garage RIDES: the Sightseeing Bus, Box Truck, Stretch Limo and Monster Truck show up and look like LEGO vehicles; equip each one and SAVE & DRIVE.'},
 {ver:'v88i',id:'big-junction',text:'Drive the Bus or the Truck through 3 junctions in Frankfurt: it turns wider than a car but never gets stuck on a corner.'},
 {ver:'v88i',id:'big-feel',text:'A big car picks up speed more slowly than the Hot Rod, and the camera shows the whole vehicle.'},
 {ver:'v88i',id:'big-tyres',text:'All four tyres of each big template sit on the road (no floating, no sinking), including the Monster Truck.'},
 {ver:'v88i',id:'big-build',text:'Garage BUILD on a big template: you can place bricks along the full length and on the roof; the camera shows the whole car.'},
 {ver:'v88i',id:'big-pc-cam',text:'On PC: drive the Bus and the Box Truck; the camera sits above the roof and you can see the road ahead over the vehicle.'},
 {ver:'v88i',id:'big-limo',text:'Drive the Stretch Limo through a few junctions: it turns wider than a car, tyres on the road, nothing stuck.'},
 {ver:'v88i',id:'small-same',text:'Switch back to a normal car: it drives exactly like before.'},
 {ver:'v88h',id:'city-reenter',text:'Leave free roam (menu, a race or garage SAVE & DRIVE), come back, then logbook ALL (TEST) → GO to Hot Drop: the city is fully built around you (road, kerbs, grass, buildings), no floating roofs.'},
 {ver:'v88h',id:'city-far',text:'After coming back to free roam, drive or GO to the far side of town (2+ km): the streets and buildings there are drawn, not a pale empty plane.'},
 {ver:'v88g',id:'turn60',text:'Normal turn at a junction at 50–80 km/h with GAS only: the car turns cleanly where it points, no sliding sideways.'},
 {ver:'v88g',id:'brake-turn',text:'Brake briefly before or in a turn (tap BRAKE, or ↓ while holding ↑ on PC): the car slows down and does NOT start a drift.'},
 {ver:'v88g',id:'drift-gb',text:'Hold GAS + BRAKE together while steering at 80+ km/h for about a second: it still becomes a drift.'},
 {ver:'v88g',id:'phone-thumb',text:'Phone: rest your thumb near the line between GAS and BRAKE and tap BRAKE in a turn: no accidental drift.'},
 {ver:'v88f',id:'steer-turn',text:'Turn left or right at a junction at 60–80 km/h: the car settles straight within about a second, no wobbling.'},
 {ver:'v88f',id:'steer-tap',text:'Tap ◀ or ▶ briefly on a straight road: the car moves over a little, no jerk and no swinging back and forth.'},
 {ver:'v88f',id:'route-follow',text:'Hot Drop (follow Hilde): the yellow route follows the roads, no sudden U-turns, and the top line says "left/right in … m" a few seconds before each turn.'},
 {ver:'v88f',id:'route-zig',text:'Any mission with a route: no random left-right zig-zags through side streets.'},
 {ver:'v88f',id:'build-layer',text:'Garage BUILD: ▲▼ changes the layer; bricks land on the chosen layer and the layers above are see-through.'},
 {ver:'v88f',id:'build-view',text:'Garage BUILD: the TOP / SIDE / 3D buttons switch the view.'},
 {ver:'v88f',id:'map-chips',text:'Map: the legend chips hide and show garages, races and other icons; your choice is still there after you close and reopen the map.'},
 {ver:'v88f',id:'garage-popup',text:'Garage: a CATEGORY / COLOUR / MORE popup closes after you pick, and no buttons hide under each other or under ⚙.'},
 {ver:'v88f',id:'music',text:'Music plays after your first tap (iPhone and the Claude app).'}];
{const KEY='mho_chk',esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}},save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
 const k=it=>it.ver+'/'+it.id,cur=()=>OD_CHECKLIST.filter(it=>it.ver===OD_CHECKLIST[0].ver);
 const open=()=>{const s=load();return cur().filter(it=>!(s[k(it)]&&s[k(it)].st)).length};
 const st=document.createElement('style');st.textContent=`#odChk{position:fixed;inset:0;z-index:9100;display:flex;align-items:center;justify-content:center;background:rgba(10,14,30,.6);padding:8px;box-sizing:border-box;user-select:none;-webkit-user-select:none}#odChk[hidden]{display:none}
#odChk .cc{width:min(720px,100%);max-height:100%;display:flex;flex-direction:column;background:#0b1626;border:3px solid #3ddc84;border-radius:16px;color:#e8f2fa;font:600 13px system-ui}
#odChk .ch{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:2px solid #1d3550}#odChk .ch b{font:italic 900 20px var(--hud,system-ui)}#odChk .ch small{color:#9fb3c8;font-size:12px}
#odChk .ch button,#odChk .ci button{font:900 13px system-ui;min-width:44px;min-height:44px;border-radius:10px;border:2px solid #4ceaff;background:#12304a;color:#fff;padding:0 10px}#odChk .ch [data-c=copy]{margin-left:auto}body.ckOn #tuG{visibility:hidden}
#odChk .cb{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 10px 10px}#odChk .ci{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #ffffff14;flex-wrap:wrap}
#odChk .ci p{flex:1 1 300px;margin:0;line-height:1.35;font-size:13px}#odChk .ci .pa.on{background:#3ddc84;border-color:#3ddc84;color:#0b1626}#odChk .ci .fa.on{background:#ff4d6d;border-color:#ff4d6d}
#odChk .ci input{flex:1 1 100%;min-height:36px;font:13px system-ui;background:#0d1a2c;color:#fff;border:1px solid #4ceaff55;border-radius:8px;padding:4px 8px;user-select:text;-webkit-user-select:text}
#odChk .msg{color:#ffd12c;font-size:12px}.ckB{font:800 13px system-ui;min-height:44px;border-radius:10px;border:2px solid #3ddc84;background:#10301f;color:#fff;padding:0 10px}`;document.head.appendChild(st);
 const ov=document.createElement('div');ov.id='odChk';ov.hidden=true;document.body.appendChild(ov);
 for(const ev of['touchstart','touchmove','touchend','pointerdown','mousedown','wheel'])ov.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 for(const ev of['keydown','keyup'])ov.addEventListener(ev,e=>{if(e.target.tagName==='INPUT')e.stopPropagation()});
 const text=()=>{const s=load();return 'Mainhattan Overdrive checklist '+OD_VER+'\n'+OD_CHECKLIST.map(it=>{const r=s[k(it)]||{};return `${it.ver} ${it.id}: ${r.st||'-'}${r.n?' · '+r.n:''}`}).join('\n')};
 const badge=()=>{try{pinR()}catch(e){}const n=open();document.querySelectorAll('.ckB').forEach(b=>b.textContent='✔ CHECKLIST'+(n?` (${n})`:''))};
 const render=msg=>{const s=load(),v=OD_CHECKLIST[0].ver;let h=`<div class="cc"><div class="ch"><b>TEST CHECKLIST</b><small>${esc(v)} · ${open()} open</small><button data-c="copy">COPY RESULTS</button><button class="x" data-c="x">✕</button></div><div class="cb">${msg?`<div class="msg">${esc(msg)}</div>`:''}`;
  for(const it of OD_CHECKLIST){const r=s[k(it)]||{};h+=`<div class="ci" data-k="${esc(k(it))}"><p>${it.ver===v?'':`<small>${esc(it.ver)} · </small>`}${esc(it.text)}</p><button class="pa ${r.st==='PASS'?'on':''}" data-c="PASS">✅ PASS</button><button class="fa ${r.st==='FAIL'?'on':''}" data-c="FAIL">❌ FAIL</button><input type="text" placeholder="note (optional)" value="${esc(r.n||'')}"></div>`}
  ov.innerHTML=h+'</div></div>';badge()};
 const copy=()=>{const t=text();const done=()=>render('Copied: paste it to the coordinator.');
  const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}a.remove();ok?done():render('Copy blocked here; long-press to select:\n'+t)};
  try{navigator.clipboard.writeText(t).then(done,fb)}catch(e){fb()}};
 ov.addEventListener('click',e=>{if(e.target===ov){ov.hidden=true;document.body.classList.remove('ckOn');return}const b=e.target.closest('button');if(!b)return;const c=b.dataset.c;try{AU.sfx('pick')}catch(er){}
  if(c==='x'){ov.hidden=true;document.body.classList.remove('ckOn')}else if(c==='copy')copy();else if(c==='PASS'||c==='FAIL'){const key=b.closest('.ci').dataset.k,s=load();s[key]=Object.assign(s[key]||{},{st:s[key]&&s[key].st===c?'':c});save(s);render()}});
 ov.addEventListener('change',e=>{const i=e.target;if(i.tagName!=='INPUT')return;const key=i.closest('.ci').dataset.k,s=load();s[key]=Object.assign(s[key]||{},{n:i.value.slice(0,200)});save(s)});
 window.odChkOpen=()=>{render();ov.hidden=false;document.body.classList.add('ckOn')};
 const mk=()=>{const b=document.createElement('button');b.className='ckB';b.addEventListener('click',e=>{e.stopPropagation();try{if(typeof TU_toggle==='function')TU_toggle(false)}catch(er){}document.getElementById('odUpd')&&(document.getElementById('odUpd').hidden=true);odChkOpen()});return b};
 // ⚙ drawer header (re-rendered on every change) and the UPDATES screen header
 if(typeof TU_render==='function'){const r0=TU_render;TU_render=function(){r0.apply(this,arguments);const th=TU.el&&TU.el.querySelector('.th');if(th&&!th.querySelector('.ckB'))th.appendChild(mk());badge()}}
 if(typeof window.odUpdOpen==='function'){const u0=window.odUpdOpen;window.odUpdOpen=function(){u0.apply(this,arguments);const u=document.querySelector('#odUpd .ub');if(u&&!u.querySelector('.ckB')){const b=mk();b.style.cssText='display:block;margin:8px 0 2px';u.insertBefore(b,u.firstChild)}badge()}}
 // ---- PIN (Alex 2026-10-08: "the checklist should be staying while i am playing the game"): a mini checklist pinned on screen in roam, races,
 // missions and the garage. Expanded: counter (tap = fold to a chip), item text (tap = full panel with notes + COPY RESULTS), ✅ / ❌, ‹ ›.
 // Folded: a "✓ 3/8" chip. It can only be dismissed (✕ on the chip) once every item of the version is answered. State lives in mho_chk._pin.
 // Touches on it never reach the controls under it and it never pauses the game.
 const pst=()=>{const s=load(),v=OD_CHECKLIST[0].ver;let P=s._pin;if(!P||P.v!==v)P={v,i:0,col:0,done:0};return P},psave=P=>{const s=load();s._pin=P;save(s)};
 // the strip walks the items of the newest 3 versions (a small hotfix release must not hide the open items of the release before it)
 const pinItems=()=>{const V=[...new Set(OD_CHECKLIST.map(it=>it.ver))].slice(0,3);return OD_CHECKLIST.filter(it=>V.includes(it.ver))};
 let pinBkOpen=0;const pinBk=()=>{const X=document.getElementById('gbx');return !!X&&!X.hidden&&X.getClientRects().length>0};
 // v88o2 (reviewer): folded in every garage mode (it covered the car preview in RIDES) unless opened there, and during the race GO countdown + first 3 s
 // RF5 (reviewer): folded chip in races, parked under LAP; hidden only while the big FINISH place text shows; on results at the card's top-right corner
 const pinCd=()=>{try{return state==='countdown'||state==='race'||state==='results'}catch(e){return false}},pinRun=()=>{try{return state==='finished'}catch(e){return false}};
 const pin=document.createElement('div');pin.id='odPin';pin.hidden=true;document.body.appendChild(pin);
 for(const ev of['touchstart','touchmove','touchend','pointerdown','pointerup','pointermove','mousedown','mouseup','wheel','dblclick'])pin.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 const pinR=()=>{const P=pst(),C=pinItems(),s=load(),n=C.length,ans=C.filter(it=>s[k(it)]&&s[k(it)].st).length;
  const busy=!ov.hidden||!n||pinRun()||P.done&&ans===n||!!document.querySelector('#gbx.sbDiy')||(()=>{const l=document.getElementById('loading');return l&&!l.hidden&&getComputedStyle(l).display!=='none'})();
  pin.hidden=!!busy;if(busy)return;P.i=Math.max(0,Math.min(n-1,P.i|0));const it=C[P.i],r=s[k(it)]||{};let h;const pinBld=pinBk()&&typeof GB_!=='undefined'&&GB_.bk,fold=P.col||(pinBk()&&(!pinBkOpen||pinBld))||pinCd();
  if(fold)h=`<button class="pc" data-p="exp" title="Show the checklist">✓ ${ans}/${n}</button>`+(ans===n?`<button class="px" data-p="done" title="Hide (all answered)">✕</button>`:'');
  else h=`<button class="pn" data-p="col" title="Fold"><b>${P.i+1}/${n}</b><small>▴ ${ans}✓</small></button><p data-p="full" title="Open the full checklist (notes, COPY RESULTS)">${esc(it.text)}</p>`+
   `<button class="pa ${r.st==='PASS'?'on':''}" data-p="PASS" title="Pass">✅</button><button class="fa ${r.st==='FAIL'?'on':''}" data-p="FAIL" title="Fail">❌</button>`+
   `<span class="pv"><button data-p="prev" title="Previous">‹</button><button data-p="next" title="Next">›</button></span>`;
  pin.classList.toggle('col',!!fold);if(pin._h!==h){pin._h=h;pin.innerHTML=h}pinPlace()};
 // garage: sit in the free band between the left column (mode rail, selection / groups panels) and the right column (layer views, side panel)
 const pinPlace=()=>{const X=document.getElementById('gbx'),vis=e=>!!e&&!e.hidden&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0;
  {const st=(()=>{try{return state}catch(e){return''}})(),at=(x,y)=>{pin.style.transform='none';pin.style.width='';pin.style.left=Math.round(x)+'px';pin.style.top=Math.round(y)+'px'};
   if(st==='countdown'||st==='race'){const l=document.getElementById('lap');if(vis(l)){const r=l.getBoundingClientRect();at(r.left,r.bottom+10);return}}
   if(st==='results'){const c=document.querySelector('#results .card');if(vis(c)){const r=c.getBoundingClientRect();at(r.right-12-pin.offsetWidth,r.top+8);return}}}
  if(!vis(X)){pin.style.left='';pin.style.width='';pin.style.transform='';
   // roam / race / missions: below the objective line (quest tracker, objective pill) when it sits at the top centre
   if(innerWidth>900&&innerHeight>500){const g=document.querySelector('#tuG,#tuB,[id^="tu"][id$="G"]');let t=108;if(vis(g)){const r=g.getBoundingClientRect();if(r.top<160&&r.right>innerWidth-120)t=Math.round(r.bottom)+10}
    pin.style.transform='none';pin.style.left=Math.round(innerWidth-16-pin.offsetWidth)+'px';pin.style.top=t+'px';return}
   const a=pin.getBoundingClientRect();let t=54;for(const e of document.querySelectorAll('#roamArrow,#qTrk,#obj,[id*="Obj"],[class*="Pill"],[class*="pill"]')){if(pin.contains(e)||!vis(e))continue;const r=e.getBoundingClientRect();
    if(r.top<110&&r.bottom<150&&r.right>a.left&&r.left<a.right&&r.height<70)t=Math.max(t,Math.round(r.bottom)+6)}
   pin.style.top=t===54?'':`calc(env(safe-area-inset-top,0px) + ${t}px)`;return}pin.style.top='';let L=0,R=innerWidth;
  for(const q of['#r2R','#gxG','#slBar','#gsBar']){const e=document.querySelector(q);if(vis(e)){const r=e.getBoundingClientRect();if(r.top<120)L=Math.max(L,r.right+6)}}
  for(const q of['#b25 .b25V','#gbx .gbp']){const e=document.querySelector(q);if(vis(e)){const r=e.getBoundingClientRect();if(r.top<120&&r.left>L)R=Math.min(R,r.left-6)}}
  const w=Math.min(340,R-L),x=L+Math.max(0,(R-L-pin.offsetWidth)/2);if(w<200){pin.style.left='';pin.style.width='';pin.style.transform='';return}
  pin.style.transform='none';pin.style.width=P_col()?'':w+'px';pin.style.left=Math.round(P_col()?x:L+(R-L-w)/2)+'px'};
 const P_col=()=>pin.classList.contains('col');
 pin.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-p]');if(!b)return;const a=b.dataset.p,P=pst(),C=pinItems(),n=C.length;try{AU.sfx('pick')}catch(er){}
  if(a==='col'){P.col=1;pinBkOpen=0}else if(a==='exp'&&pinBk()&&typeof GB_!=='undefined'&&GB_.bk){psave(P);odChkOpen();pinR();return}else if(a==='exp'){P.col=0;if(pinBk())pinBkOpen=1}else if(a==='done'){P.done=1}else if(a==='prev'){P.i=(P.i-1+n)%n}else if(a==='next'){P.i=(P.i+1)%n}else if(a==='full'){psave(P);odChkOpen();pinR();return}
  else if(a==='PASS'||a==='FAIL'){const s=load(),key=k(C[P.i]),was=s[key]&&s[key].st===a;s[key]=Object.assign(s[key]||{},{st:was?'':a});s._pin=P;save(s);
   if(!was){for(let j=1;j<=n;j++){const q=C[(P.i+j)%n],x=s[k(q)];if(!(x&&x.st)){P.i=(P.i+j)%n;break}}}}
  psave(P);pinR();badge()});
 {const st2=document.createElement('style');st2.textContent=`#odPin{position:fixed;z-index:8990;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 54px);width:min(340px,calc(100vw - 16px));box-sizing:border-box;display:flex;align-items:center;gap:4px;padding:4px;
 background:rgba(11,22,38,.88);border:2px solid #3ddc84;border-radius:12px;color:#e8f2fa;font:600 12px system-ui;user-select:none;-webkit-user-select:none;touch-action:manipulation;box-shadow:0 2px 0 rgba(0,0,0,.35)}#odPin[hidden]{display:none}
#odPin button{min-height:44px;border-radius:9px;border:2px solid #4ceaff;background:#12304a;color:#fff;font:900 12px system-ui;padding:0;cursor:pointer;flex:none}
#odPin .pn{width:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-color:#3ddc84}#odPin .pn b{font-size:13px}#odPin .pn small{font-size:12px;color:#9fe8bf;font-weight:800}
#odPin p{flex:1;min-width:0;margin:0;line-height:15px;max-height:30px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;cursor:pointer;font-size:12px}
#odPin .pa,#odPin .fa{width:44px;font-size:17px}#odPin .pa.on{background:#3ddc84;border-color:#3ddc84}#odPin .fa.on{background:#ff4d6d;border-color:#ff4d6d}
#odPin .pv{display:flex;flex-direction:column;gap:2px}#odPin .pv button{width:28px;min-height:21px;height:21px;font-size:15px;line-height:1}
#odPin.col{width:auto;padding:2px;gap:3px}#odPin.col .pc{padding:0 12px;border-color:#3ddc84;background:#10301f;font-size:13px}#odPin.col .px{width:44px}
body.ckOn #odPin{display:none}body:has(#npcSay:not([hidden])) #odPin{display:none!important}body:has(#odPin:not([hidden])) #gbx.r2 #gsTip{top:calc(var(--r2hh,52px) + 66px)}`;document.head.appendChild(st2)}
 setInterval(pinR,700);pinR();
 // v89h: the strip never draws over a card (Alex: tip hidden at the start; PAUSE card's RESUME + title covered in roam). While any modal/card
 // v89j: + the first-drive tutorial card, the main menu's CHOOSE ACTIVITY title and garage dropdown lists (same 8 px rule).
 // is open that covers most of the screen or comes within 8 px of the strip's spot, the strip steps aside (body.odYield); it returns when it closes.
 // Races and results keep their own chip placement (RF5: under LAP, inside the results card's top-right corner).
 const YS='#npcSay,#roamPause,#pause,#results,#settings,#chRes,#spRes,#roamPop,#journal,#roamMap,#story,#roamCard,#cmap,#slots,#profile,#gbx,#odChk,#credBox,[role=dialog],.modal,#roamTut,#home .hbar h2,[role=listbox],[role=menu],.r2Pop,.r2Menu,.r2List,.gbDrop';
 let pinBox=null;const yVis=e=>{if(e.hidden||e.closest('[hidden]'))return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)return null;const r=e.getBoundingClientRect();return r.width>4&&r.height>4?r:null};
 const yieldStep=()=>{try{const P=document.getElementById('odPin');if(!P)return;if(!P.hidden&&(!document.body.classList.contains('odYield')||!pinBox)){const r=P.getBoundingClientRect();if(r.width>4)pinBox={l:r.left,t:r.top,r:r.right,b:r.bottom}}
   let y=false;if(pinBox&&!P.hidden&&!pinCd()&&!pinRun()){const VA=innerWidth*innerHeight;for(const e of document.querySelectorAll(YS)){if(e===P||P.contains(e))continue;const r=yVis(e);if(!r)continue;
     if(r.width*r.height>VA*.4||(r.left<pinBox.r+8&&r.right>pinBox.l-8&&r.top<pinBox.b+8&&r.bottom>pinBox.t-8)){y=true;break}}}
   document.body.classList.toggle('odYield',y)}catch(e){}};
 {const st3=document.createElement('style');st3.textContent='body.odYield #odPin{display:none!important}';document.head.appendChild(st3)}setInterval(yieldStep,120);
 window.__chk={open:()=>odChkOpen(),text,items:OD_CHECKLIST,pin:()=>pinR(),pinSt:()=>pst()}}
