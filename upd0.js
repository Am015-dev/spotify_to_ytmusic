// ---------- OD_CHANGELOG: newest first. EVERY deploy prepends one entry {v, date, items:[{t:'FIXED'|'NEW'|'CHANGED', s:'plain English'}]} (2-4 items).
const OD_CHANGELOG=[
 {v:'v87a',date:'6 Oct 2026',items:[{t:'NEW',s:'This UPDATES screen: open it from the title screen or the pause menu to see what changed in each version.'},{t:'NEW',s:'A small "What\'s new" note appears once after each update.'},{t:'CHANGED',s:'Credits now say "Base assets: Kenney (CC0)" next to "3D models by Alex".'}]},
 {v:'v87',date:'6 Oct 2026',items:[{t:'CHANGED',s:'Race tracks are narrower and double-tap ◀/▶ does a sideways SMASH lunge.'},{t:'NEW',s:'Rival health bars: 3 SMASH hits wreck a rival.'},{t:'CHANGED',s:'BOOST is plain boost again; touching cars is just a bump.'},{t:'FIXED',s:'Car shows right after a wreck; faster road/off-road swap; tinted coupé glass.'}]},
 {v:'v86z',date:'6 Oct 2026',items:[{t:'FIXED',s:'Steering works after a crash: the car turns from a standstill and frees itself if wedged.'}]},
 {v:'v86y',date:'6 Oct 2026',items:[{t:'NEW',s:'Your driver is a real LEGO minifig: open-face helmet with a face, hands on its own steering wheel.'},{t:'NEW',s:'8 driver presets plus new faces and hair in the garage DRIVER tab.'},{t:'CHANGED',s:'Credits: 3D models by Alex.'}]},
 {v:'v86x',date:'6 Oct 2026',items:[{t:'FIXED',s:'No more screen shaking at speed; AI cars steer smoothly.'},{t:'CHANGED',s:'Camera sits closer and lower, wider view and speed lines when fast.'},{t:'CHANGED',s:'BOOST is SMASH: it always wrecks what you hit, and refills faster.'}]},
 {v:'v86w',date:'6 Oct 2026',items:[{t:'FIXED',s:'Hill and park grass sits exactly on the ground (was up to 30 cm off).'},{t:'FIXED',s:'Fewer grass patches poking through roads.'}]},
 {v:'v86v',date:'6 Oct 2026',items:[{t:'FIXED',s:'No dark shadow blobs under cars; each tyre has a small soft shadow.'},{t:'FIXED',s:'Every race jump clears at normal top speed without boost (Main river gap shortened).'}]},
 {v:'v86u',date:'6 Oct 2026',items:[{t:'FIXED',s:'No orange glow ball over the car at the top of ramp jumps.'}]},
 {v:'v86t',date:'6 Oct 2026',items:[{t:'FIXED',s:'City ramp jumps are reachable and fly long, soft arcs with no landing damage.'},{t:'FIXED',s:'Tyres rest on the visible asphalt.'}]},
 {v:'v86q',date:'6 Oct 2026',items:[{t:'FIXED',s:'No orange glow ball when the car scrapes walls or bumps.'}]},
 {v:'v86p',date:'6 Oct 2026',items:[{t:'CHANGED',s:'City box trucks look like LEGO: cab windows, grille, ribbed box, mudguards.'}]},
 {v:'v86n',date:'6 Oct 2026',items:[{t:'FIXED',s:'Race opponents no longer fill the screen when they overtake you.'}]},
 {v:'v86m',date:'6 Oct 2026',items:[{t:'FIXED',s:'Jump and start texts in English (JUMP!, START, FINISH).'},{t:'FIXED',s:'Camera never ends up inside the 4×4 after a vehicle swap; the swap burst is smaller.'}]},
 {v:'v86l',date:'6 Oct 2026',items:[{t:'CHANGED',s:'Missions forgive leaving the road (small, eased slowdown).'},{t:'CHANGED',s:'+12 % top speed with a wider view.'},{t:'FIXED',s:'Barrel rolls only in a SMASH; cars only break from a SMASH or above 150 km/h.'}]},
 {v:'v86k',date:'6 Oct 2026',items:[{t:'CHANGED',s:'Races drive like real cars: 0–100 in 4–5 s, real braking, shorter races.'},{t:'FIXED',s:'Tyres on the track, no glow trails or light cones under cars.'},{t:'CHANGED',s:'Lighter race HUD on the phone.'}]},
 {v:'v86j',date:'5 Oct 2026',items:[{t:'FIXED',s:'Race opponents are grounded LEGO cars (no hovering or glow).'},{t:'CHANGED',s:'Car handling has weight: 150 km/h city top speed, real braking distance, smooth wall hits.'},{t:'FIXED',s:'FIRE button is back in races.'}]},
 {v:'v86i',date:'5 Oct 2026',items:[{t:'FIXED',s:'No light columns: objectives are rings on the ground.'},{t:'CHANGED',s:'Thinner Athens crowds.'}]},
 {v:'v86h',date:'5 Oct 2026',items:[{t:'CHANGED',s:'LEGO world pass: true-size studs, grey Athens asphalt, streets follow the hills.'},{t:'FIXED',s:'No pink water; boats sit level in the water with foam.'}]},
 {v:'v86g',date:'5 Oct 2026',items:[{t:'CHANGED',s:'One objective line at a time; TAP TO OPEN prompt sits below the car.'}]},
 {v:'v86f',date:'5 Oct 2026',items:[{t:'CHANGED',s:'Drives like a car: grip steering, camera locked behind.'},{t:'FIXED',s:'Wheels roll and sit on the road; no hover shadow or blue thruster puffs.'},{t:'CHANGED',s:'District names show as small toasts.'}]}];
const OD_VER=OD_CHANGELOG[0].v;
