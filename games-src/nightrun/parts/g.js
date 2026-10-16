/* ---------- G: owner test checklist, first-tap buttons, power-up levels, weapons (2 slots, LV1-5), fairness net.
   Loaded after lagfix.js and before c.js; everything here hooks in through wrappers or the DOM, like upgrades.js. ---------- */

/* ===== 1. TEST CHECKLIST (same pattern as the other game: PASS / FAIL + note per item, saved on the device, COPY RESULTS) =====
   Add the items of every new version at the top; NR_VER is the newest version. Results live in localStorage 'mnr_chk'. */
const NR_VER='L2';
const NR_CHECKLIST=[
 {ver:'L3',id:'clear-pay',text:'Clearing a stage now pays Neon: 40 plus 12 per stage number the first time, 25 more for each new star, and a tenth of that on later clears. Everything in the garage costs far less (weapons, perks), and kills pay a bit more, so a full build is a matter of hours, not weeks. Fail a stage twice and the next try gets +1 hull; fail four times and it is a little easier too. Do the prices feel fair?'},
 {ver:'L3',id:'ship-mounts',text:'Your ship now shows the weapons you equip: a coloured circle on slot 1, a triangle on slot 2, a split ring when they fuse, and a flash from the mounts when you fire. See it in WEAPONS and the Garage. Painted mounts come later. Does it read at a glance?'},
 {ver:'L2',id:'weapon-levels',text:'Weapons grow with your Neon: Garage > WEAPONS has 16 weapons (8 new: Frost Beam, Flame Arc, Plasma Wave, Shrapnel Shell, Echo Drone, Gravity Well, Rail Sniper, Storm Cell). Buy one with Neon, then buy its levels 1 to 10 (a level bar, the power it gives and the next new ability are on every card). In a run the pit-stop pickups add up to 2 more levels on top. Does a higher level feel stronger, and are the prices fair?'},
 {ver:'L2',id:'fight-back',text:'Enemies now fly in and fight back: they cannot be hit until they are fully on screen (a red ring at the edge shows where they come in), every enemy lives at least about a second on screen even against a maxed build, and chargers glide in before they dash. Do waves feel like a fight now, on Easy too?'},
 {ver:'L2',id:'no-idle',text:'Standing still is no longer safe: parking in one spot (or nudging a few pixels) now brings the red static discharge that no shield, heal or revive can outlast, plus aimed shots from the edge of the screen. Keep moving and nothing changes. Does it feel fair?'},
 {ver:'L1',id:'weapons-fusions',text:'Eight weapons now (new: Arc Chain, Orbit Blades, Ricochet Disc, Mine Layer). Put two DIFFERENT weapons in the two slots on the WEAPONS sheet and they fuse: a named fusion with its own effect and +12% damage. The fusion pictures are shapes until the art arrives. Do the new weapons feel different, and is a fusion worth choosing?'},
 {ver:'L1',id:'phone-hud',text:'On a phone the run shows the city: one slim strip on top (score, combo, hull, heat), small chips for shield, revive and power-ups under it, dash and EMP charge on their buttons. Nothing sits over the middle of the screen. Test link: ?scn=nr-hud-busy.'},
 {ver:'L1',id:'flight-school',text:'New FLIGHT SCHOOL (title > FLIGHT SCHOOL, or Settings > REPLAY TUTORIAL; new players are offered it once): about 3 minutes of tiny challenges: rings, gold on-beat shots, a slow fan, the on-beat dash, pickups and tier, EMP and heat, your two weapons and their fusion, a leader. SKIP is always top right, you can never lose, and the first clear gives +60 Neon for the Garage.'},
 {ver:'L1',id:'story-map',text:'STORY opens a painted route map: 40 stages in five districts (8 each), mini-bosses and bosses are bigger medallions, your next stage glows, locked stages show a padlock. Tap a stage: a plate shows goal, the three stars, your best and PLAY. Scroll along the road (up on a phone, sideways on a wide screen).'},
 {ver:'L1',id:'challenges',text:'Each district has an optional challenge stage that opens after its mini-boss: a side branch on the map. NO-HIT ends on the first hull hit, SPEED needs the kills before the clock, PERFECT needs a PERFECT count. Each pays up to 3 stars.'},
 {ver:'L1',id:'curve',text:'Difficulty rises a little every stage with no sudden spike: stage 1 to 4 feel gentle, a boss is slightly above the stages around it.'},
 {ver:'L1',id:'pit-build',text:'Pit stop: cards show a build path icon (Glass Cannon, Tank, Beat Combo), the effect now and next, HEAT chips, a + chip when a card completes a synergy, and BOSS PICK / BUILD PICK badges. The line under it names the next boss and what it fires.'},
 {ver:'L1',id:'pit-limits',text:'A run holds 6 different upgrades (7 from stage 14, 8 from stage 28). Tap an owned icon twice to sell one level for half its price. Heat: damage upgrades raise the HEAT percentage, Coolant lowers it. Stock changes each run and each pit stop; REROLL costs more every time.'},
 {ver:'L1',id:'garage-builds',text:'Garage > LOAD: three build buttons equip the best perks of a path, the path bars show the 2-piece and 4-piece bonus (the 4-piece bonus has a price), green chips show active synergies. Glass Core, Greedy Pilot, Lead Plating and Beat Addict each show a TRADE-OFF line. SHIPS cards show a moving fire pattern.'},
 {ver:'L1',id:'market',text:'Garage > SHOP: four daily offers (one is on sale), 2 buys a day, a cargo hold for 3 that you can sell back at 60%, NEW OFFERS for Neon, a BOSS PICK badge and the next boss line.'},
 {ver:'K1',id:'lag-smooth',text:'Smoother on a big monitor: pause, settings, garage, shop and the story map no longer redraw the game behind them at full speed, the sky has one blended pass less, and a machine that cannot keep 60 fps lowers the sharpness of the picture by itself after a few seconds (soft but smooth). Play a district, a boss fight and a pit stop on a big screen; Settings > FPS counter shows the speed.'},
 {ver:'K1',id:'lab-stage',text:'The LAB is its own stage now: title > LAB (or Settings > OPEN LAB, or the address ending in ?lab=1). You fly in a quiet arena with a panel at the bottom: BOSS, FOES, ITEMS, CHEATS. EXIT goes back to the title. Nothing of it is in a normal run any more (no LAB chip, no LAB in the pause menu).'},
 {ver:'K1',id:'lab-bosses',text:'BOSS tab: tap any of the ten bosses; pick its district; INTRO plays the entrance. PHASE 1/2/3 jumps into that phase and keeps it. ATTACK forces one pattern (fan, ring, spiral, laser, summon). POSE holds one frame of its sprite sheet (idle, wind-up, charge, fire, recover). HIT shows the damage flash, DEATH the explosion, then it comes back. Check every boss moves, winds up and fires.'},
 {ver:'K1',id:'lab-foes',text:'FOES tab: one enemy at a time (drone, turret, charger, gunship, gate, flank, swarm, mine, elite, leader). ITEMS tab: shards, hull, upgrade, EMP and the four power-ups, either as a pickup or switched on at once. CHEATS tab: the old test switches (stages, difficulty, god mode, Neon, garage).'},
 {ver:'K1',id:'text-align',text:'Every label sits inside its painted plate or button on every screen: title, story map (stage name and goal readable, nothing cut), HUD (HULL/HEAT/DASH/EMP and the weapon line inside their frame, score inside its frame), pause, settings, garage tabs (the selected tab is readable), shop, chest, results, LAB. On a phone no text is smaller than 11 px.'},
 {ver:'J3',id:'boss-anim',text:'Every boss now animates: it moves through its idle frames, and when it is about to fire (the beat before) it winds up, then shows the shot and recovers. Check Adler, Krake, Ice, Kronos, Tresor, Bruecke, Schranke, Messe, Hoplite and Talos (title > LAB > BOSS). No white boxes or fringes round any of them, size looks like before.'},
 {ver:'J3',id:'no-overlap',text:'Nothing overlaps: difficulty badges in the LAB are small icons, the story map shows number medallion, stage name and stars on one line on a small phone (375x553), the boss sub-title matches the boss.'},
 {ver:'J2',id:'ui-menus',text:'Menu, pause, garage, shop and story buttons are painted plates (angular on title and pause, round pills in garage, shop, story and settings); the settings card has a painted frame, header and rows. Every label is readable and every button still reacts to a tap.'},
 {ver:'J2',id:'ui-hud',text:'In a run the score and the hull/heat/dash/EMP bars sit in painted housings and the hint line in a speech bubble; all numbers stay easy to read. On a phone the pause, DASH and EMP buttons are the painted round buttons and still work.'},
 {ver:'J2',id:'ui-story-map',text:'On the story map every stage number sits on a medallion: open, done (laurel), boss (crown) or locked (padlock); garage and shop item icons sit in round chrome buttons.'},
 {ver:'J2',id:'arcade-cut',text:'New: ARCADE stages. Tap a stage on the map and pick ARCADE (about 3 minutes, boss at the end) or CLASSIC (the full song). Same stars, goals scaled to the length. Is a short stage a better fit for a quick session?'},
 {ver:'J1',id:'music-clean',text:'The music NEVER distorts or changes pitch: grab TEMPO UP (the song stays the same speed, you shoot double-time and score x2), grab SLOW GROOVE (enemies and bullets slow to bullet time, the song only gets a soft muffle), drop to 1 hull, and die. The song is clean every time, no chipmunk, no crackle.'},
 {ver:'J1',id:'no-crops',text:'No picture looks cropped: boss intro portraits and the ship cards in the garage and shop sit in round neon badges, pickups, perks, medals and badges have no square backgrounds, and the phone view has painted rooftops scrolling at the sides.'},
 {ver:'J1',id:'all-painted',text:'Every screen is painted: both mini-bosses (Tresor-Wart, Messe-Waechter) have their own art, the shield link between a leader and its drones is a painted beam. Only the 13 base perk icons are still line icons (they are on the missing-assets page).'},
 {ver:'J1',id:'set-pieces',text:'In one minute of play something new happens every 8 to 10 seconds: a WEAVE of drones crossing on the beat, a LASER FENCE across the screen (find the green gap, it fires on the bar line), a mini-boss about every 50 s. Clear a set piece and a shower of shards sweeps across the screen.'},
 {ver:'J1',id:'drop-moment',text:'Every 16 bars: DROP counts down 4-3-2-1 at the top, and a DASH on the downbeat blows the screen clear (all bullets, score burst, tier up, shard shower). Miss it and only the bullets near you vanish. Does it feel big?'},
 {ver:'J1',id:'boss-ground',text:'Bosses on wheels and legs now stay on the road with a proper shadow instead of hopping. In portrait mode, where there is no road, they are swapped for a flying boss of the same tier. Do the bosses look grounded now?'},
 {ver:'I9',id:'painted-icons',text:'All the grey placeholder boxes are gone: painted kit perk icons (Garage TUNE and LOAD), painted SOON cards (no PLACEHOLDER tag), difficulty badges, stage medals, squad leader with painted crown, glowing homing orbs and the Drift, Lancer and Nova ships. Anything still a plain shape?'},
 {ver:'I9',id:'painted-chest',text:'Boss chest: painted closed chest and card backs, painted card faces, and the chest opens when you pick a card.'},
 {ver:'I9',id:'painted-surfaces',text:'Garage / pit stop screens and the pause + settings screens now sit on painted backgrounds (dark wash on top). Is every card and button still easy to read, on the phone upright and sideways?'},
 {ver:'I8',id:'calm-hud',text:'Less clutter: the ship ring (beat cue) and the shield circle are small and faint, the stat chips and upgrade icons round the ship and under the score are gone, no BEST line, no big faint word in the backdrop. Only a small shield and revive count remain. Settings > Gameplay > HUD switches back to Full. Is it calm enough, and can you still hit the beat?'},
 {ver:'I7',id:'idle',text:'Stand still with your best build: after about 9 s a red dashed ring tightens round the ship and every 2 s you lose 1 hull (STATIC DISCHARGE) that shields cannot stop. Moving resets it. You cannot win by standing still any more.'},
 {ver:'I7',id:'bullet-kinds',text:'Enemy fire now varies: thin fast NEEDLES from drones, round ORBS, big slow orange SHELLS that take 2 hull, and ROCKETS that home for a moment and burst into 5 pellets when you shoot them twice.'},
 {ver:'I7',id:'perk-pressure',text:'The more perks and upgrades you own, the tougher the enemies (up to 3x hull). A maxed ship should still have to fight.'},
 {ver:'I6',id:'chest',text:'After every district boss a BOSS CHEST opens: three face-down cards, tap one to flip it and get +1 hull, a shield, EMP, Neon, a revive or a random upgrade. Then the pit stop. LAB can switch it off.'},
 {ver:'I8',id:'one-more-run',text:'The game-over and stage-clear screens now show a bar to the cheapest thing you can still unlock, and a big ONE MORE RUN button that restarts at once. Does the bar make you want one more go?'},
 {ver:'I6',id:'new-ships',text:'Three new ships in Garage > SHIPS: Drift (a wide fan), Lancer (a piercing lance every second shot) and Nova (a ring burst every third shot). They show as shapes until the art arrives. Do they feel different and worth the price?'},
 {ver:'I6',id:'badges',text:'The difficulty button on the title and the LAB show a badge per difficulty, and the stage clear screen shows a medal. Garage ship cards now show the painted ship portraits.'},
 {ver:'I6',id:'leader-look',text:'Squad leaders have a gold sheen on top of the crown and the rings so you can spot them at a glance.'},
 {ver:'I5',id:'placeholders',text:'Placeholder art is in: kit perk icons (Garage TUNE and LOAD), the SOON cards and the medal on the stage clear screen show a hatched PLACEHOLDER box with the file name. games-src/nightrun/ASSETS-NEEDED.md lists every file, its size and where it goes.'},
 {ver:'I4',id:'no-slow',text:'The song NEVER slows down any more: low hull, SLOW GROOVE and dying keep the tempo. At 1 hull the screen edges pulse red on the beat and a soft heartbeat thumps under the music. Does it sound good now?'},
 {ver:'I4',id:'lab-smooth',text:'TEST LAB: clicking any button (difficulty, god mode, Neon, unlock, spawn) no longer makes the game hitch, also right after loading.'},
 {ver:'I4',id:'kits',text:'Garage > TUNE has 15 new STARTING KIT perks (Wing Cannons, Rear Guard, Piercer, Arc Chain, Chrono Dash, Ricochet, Aegis, Orbit Guns, Seeker Shots, Score Magnet, Neon Interest, Fortune, Second Wind, Overdrive Core, EMP Cell). Equip them in LOAD; they give you that upgrade from the first second of the run.'},
 {ver:'I4',id:'market2',text:'Garage > SHOP offers can now be the new weapon upgrades too (wing cannons, piercing, chain lightning, orbit guns ...).'},
 {ver:'I3',id:'diff5',text:'Settings > Difficulty (and the title button) now has Easy, Normal, Hard, Very hard and Legend. Very hard and Legend have faster fire, more elites, almost no repairs and the smart-enemy tricks from the start.'},
 {ver:'I3',id:'loadout',text:'Garage > LOAD: only EQUIPPED perks work. You have 4 slots (+1 per 15 story stars). Equip and unequip freely, and SELL a level to get 60% of its price back.'},
 {ver:'I3',id:'prices',text:'Prices are tougher: perks cost 1.5x, pit-stop cards 1.25x and kills pay less Neon. Do you now have to choose what to buy?'},
 {ver:'I3',id:'market',text:'Garage > SHOP: three daily offers (they change each day), at most two purchases a day, and they apply to your next run only.'},
 {ver:'I3',id:'soon',text:'Garage > SOON lists placeholders for features we may add (Weapon Forge, Contracts, Pilot Ranks, Boss Trophies, Ship Skins, Squad Roster, Leaderboards). Tell us which you want first.'},
 {ver:'I3',id:'lab',text:'Title screen > LAB (and the pause menu): open all stages, set the difficulty, god mode, add Neon, unlock or reset the garage, and in a run spawn a boss, a leader or a gunship, skip a district.'},
 {ver:'I2',id:'stories30',text:'Story now has 30 stages, six per city (Bankenviertel, Mainufer, Ostend, Messe, Athina): a run, a hunt, a special stage, a mini-boss, a hard convoy stage and the boss. Your old stars moved to the same stages.'},
 {ver:'I2',id:'leaders',text:'From stage 4 on a wave can come with a LEADER: gold crown, big hull, a bar over its head. Drones near it have a cyan shield link (they take under half damage). Kill the leader first: the squad panics and speeds up. It fires a 5-way fan every fourth beat, with a red warning ring first.'},
 {ver:'I2',id:'dodgers',text:'From about stage 8 some drones slide sideways out of your shots, so keep your aim on them or use wide weapons.'},
 {ver:'I2',id:'smart-aim',text:'From stage 6 on every shooter aims where your ship is going, not where it is. Keep changing direction.'},
 {ver:'I2',id:'homing',text:'From about stage 14 some gunship shots are ringed in white and curve toward you for a moment. They turn slowly: dash or sidestep.'},
 {ver:'I2',id:'harder',text:'With a fully upgraded ship the game still fights back: enemies get tougher and shoot faster the more perks you own, and later stages are tougher. Is it hard enough now? Tell us where it is still too easy.'},
 {ver:'I1',id:'ships',text:'Your ship is now a painted ship. Pick each ship in the garage (Courier, Triplet, Half-time Heavy, Echo, Swing, Synth): each looks different in the garage card and in the run, with a flickering engine jet that follows the beat.'},
 {ver:'I1',id:'enemies',text:'Drones (with spinning rotors), turrets (the barrel turns to aim), chargers, gunships, gates, flankers, swarm and mines are painted sprites that bob a little and flash white when hit. Hit boxes feel the same as before.'},
 {ver:'I1',id:'bosses',text:'Each boss is a painted boss: Adler, Flusskrake, Zentral-ICE, Kronos, Talos (Athens) and the Hoplite mini-boss. A phase change pulses a glow, hits tint it red, and the boss portrait shows above the warning banner.'},
 {ver:'I1',id:'backdrops',text:'Every district has a painted night backdrop with painted skyline strips that scroll at different speeds (phone upright: a painted portrait backdrop). It is dimmed so shots and bullets stay easy to read.'},
 {ver:'I1',id:'effects',text:'Shots, muzzle flashes, hit sparks, explosions (bigger for gunships and bosses) and the EMP shockwave are painted light effects. Enemy bullets are still the brightest, easiest things to see on screen.'},
 {ver:'I1',id:'pickups',text:'Shards (spinning), hull, weapon upgrade, EMP and the four music power coins (Drum, Tempo, Slow, Drop) are painted pickups, also in the power-up bar.'},
 {ver:'I1',id:'title-end',text:'Title screen, GAME OVER and STAGE CLEAR now have painted key art behind the text, in landscape and on a phone held upright. Buttons stay readable and tappable.'},
 {ver:'I1',id:'athina-music',text:'Athens (stages 13 to 16 and free play) has its own music, and TALOS has his own boss track. Dash and shoot on the beat: the PERFECT ring still meets the beat.'},
 {ver:'I1',id:'perf-art',text:'Nothing got slower: a whole stage and a boss fight with the new art run as smoothly as before (FPS counter in settings), also on a phone.'},
 {ver:'H1',id:'afk',text:'Stop moving with your best guns: within about 30 seconds (20 on Hard) a red lane locks on your row and a beam hits you, and enemies shoot faster. Moving away always dodges it.'},
 {ver:'H1',id:'afk-score',text:'Standing still pays less and less: kills score far fewer points and your multiplier melts. Keep moving to keep the score.'},
 {ver:'H1',id:'fewer',text:'The screen has far fewer enemy bullets (25 at most on Normal, 35 on Hard, 18 on a phone), each one aimed at you and glowing a beat before it fires.'},
 {ver:'H1',id:'quiet-shots',text:'Your own shots are thinner and dimmer, so the lime enemy bullets stand out clearly.'},
 {ver:'H1',id:'caps',text:'Damage, crit, double-shot and drone perks stack only up to a limit, so the garage descriptions now match what you really get.'},
 {ver:'G1',id:'btn-first-tap',text:'Open the game and tap ENDLESS, STORY, DAILY RUN or SETTINGS the moment they appear (they now show up about a second after loading, and no longer move). Each reacts on the first tap, every time. Try it a few times, reloading each time.'},
 {ver:'G1',id:'btn-menus',text:'Pause, FLY AGAIN, TITLE, RESUME and the pit-stop buttons all react on the first tap, with no double action.'},
 {ver:'G1',id:'lvl-garage',text:'Garage TUNE: Shield, Hull, Dash, Drone and Revive go up to level 5 (Shield Regen to 6), the other perks to 10 or 12. Each level costs more than the last.'},
 {ver:'G1',id:'lvl-pit',text:'Pit stop: every upgrade card shows level pips and what the next level does. Buying the same upgrade again raises it up to level 5.'},
 {ver:'G1',id:'lvl-power',text:'Collect the same power-up twice in one run. The second time its HUD icon shows LV2 and it lasts longer. A third pickup shows LV3, and so on up to LV5.'},
 {ver:'G1',id:'wp-explain',text:'At your first pit stop the WEAPONS sheet opens by itself: four weapons, each with a small looping demo and a few words.'},
 {ver:'G1',id:'wp-equip',text:'Pit stop > WEAPONS: tap a weapon to put it in one of the 2 slots (tap again to take it out). The pit-stop timer waits while you choose. The next stage fires what you chose.'},
 {ver:'G1',id:'wp-title',text:'Title screen > WEAPONS: pick your two weapons before you launch. They are still equipped on your next run.'},
 {ver:'G1',id:'wp-xp',text:'Collect the pink weapon pickups (gunships, turrets, bosses drop them). The weapon with the lower level gains a level and you see it bottom left (for example PULSE 2).'},
 {ver:'G1',id:'wp-feel',text:'The four weapons feel different: Pulse is a wide spread, Lance is one long piercing beam, Swarm missiles chase enemies, Cannon fires a heavy shell on every beat.'},
 {ver:'G1',id:'fair-hit',text:'After a hit the ship blinks for about one second and nothing can hurt it in that time.'},
 {ver:'G1',id:'fair-spawn',text:'Nothing hits you the moment it appears. Every shot and enemy is visible and has a warning first.'},
 {ver:'G1',id:'fair-boss',text:'Boss fight on a phone: the bullets stay readable and there is always a gap to fly through.'},
 {ver:'G1',id:'fair-hard',text:'Normal feels fair but not easy and gets harder through the stage. Hard is still hard.'},
 {ver:'G1',id:'songs-continue',text:'Songs carry on from stage to stage: the next song fades in, no silence and no restart from the beginning.'},
 {ver:'G1',id:'no-lag',text:'On desktop a whole stage plays without stutter (turn on the FPS counter in settings if you want to see it).'},
 {ver:'G1',id:'endless',text:'Keep playing past the last stage (endless): there is still new content, such as mutators and mini-bosses, not the same stage again.'},
 {ver:'G1',id:'boss-music',text:'Each boss fight switches to its own boss music and the normal song comes back afterwards.'},
 {ver:'G1',id:'checklist',text:'This CHECKLIST opens from the title screen and from settings. PASS and FAIL stay after a reload, and COPY RESULTS copies the text.'}];
{const KEY='mnr_chk',esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const ld=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}},sv=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
 const k=it=>it.ver+'/'+it.id,cur=()=>NR_CHECKLIST.filter(it=>it.ver===NR_VER);
 const left=()=>{const s=ld();return cur().filter(it=>!(s[k(it)]&&s[k(it)].st)).length};
 const st=document.createElement('style');st.textContent=`#nrChk{position:fixed;inset:0;z-index:9100;display:flex;align-items:center;justify-content:center;background:rgba(5,3,12,.78);padding:8px;box-sizing:border-box;-webkit-user-select:none;user-select:none}#nrChk[hidden]{display:none}
#nrChk .cc{width:min(720px,100%);max-height:100%;display:flex;flex-direction:column;background:#0d0820;border:2px solid var(--cyan);border-radius:14px;color:var(--ink);font:600 13px var(--display)}
#nrChk .ch{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid #3a2b5c}#nrChk .ch b{font:700 18px var(--display);letter-spacing:.12em;color:var(--cyan)}#nrChk .ch small{color:var(--dim);font-size:12px}
#nrChk button{font:700 13px var(--display);min-width:44px;min-height:44px;border-radius:8px;border:2px solid var(--cyan);background:#1a1033;color:#fff;padding:0 10px;cursor:pointer}#nrChk .ch [data-c=copy]{margin-left:auto}
#nrChk .cb{overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:4px 10px 10px}#nrChk .ci{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #ffffff14;flex-wrap:wrap}
#nrChk .ci p{flex:1 1 280px;margin:0;line-height:1.35;font-size:13px;font-weight:500}#nrChk .ci .pa.on{background:#3dffb0;border-color:#3dffb0;color:#0d0820}#nrChk .ci .fa.on{background:#ff3050;border-color:#ff3050}
#nrChk .ci input{flex:1 1 100%;min-height:36px;font:13px var(--display);background:#140c26;color:#fff;border:1px solid #19e3ff55;border-radius:8px;padding:4px 8px;-webkit-user-select:text;user-select:text}
#nrChk .msg{color:var(--amber);font-size:12px;white-space:pre-wrap}`;document.head.appendChild(st);
 const ov=document.createElement('div');ov.id='nrChk';ov.hidden=true;document.body.appendChild(ov);
 const text=()=>{const s=ld();return 'Mainhattan Nightrun checklist '+NR_VER+'\n'+NR_CHECKLIST.map(it=>{const r=s[k(it)]||{};return `${it.ver} ${it.id}: ${r.st||'-'}${r.n?' · '+r.n:''}`}).join('\n')};
 const badge=()=>{const n=left();document.querySelectorAll('.ckB').forEach(b=>b.textContent='CHECKLIST'+(n?` (${n})`:''))};
 const render=msg=>{const s=ld();let h=`<div class="cc"><div class="ch"><b>CHECKLIST</b><small>${esc(NR_VER)} · ${left()} to test</small><button data-c="copy" type="button">COPY RESULTS</button><button data-c="x" type="button" aria-label="Close">✕</button></div><div class="cb">${msg?`<div class="msg">${esc(msg)}</div>`:''}`;
  for(const it of NR_CHECKLIST){const r=s[k(it)]||{};h+=`<div class="ci" data-k="${esc(k(it))}"><p>${it.ver===NR_VER?'':`<small>${esc(it.ver)} · </small>`}${esc(it.text)}</p><button class="pa ${r.st==='PASS'?'on':''}" data-c="PASS" type="button">PASS</button><button class="fa ${r.st==='FAIL'?'on':''}" data-c="FAIL" type="button">FAIL</button><input type="text" placeholder="note (optional)" value="${esc(r.n||'')}"></div>`}
  ov.innerHTML=h+'</div></div>';badge()};
 const copy=()=>{const t=text(),done=()=>render('Copied. Paste it into the chat.');
  const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}a.remove();ok?done():render('Copy was blocked here. Select this text and copy it:\n'+t)};
  try{navigator.clipboard.writeText(t).then(done,fb)}catch(e){fb()}};
 const shut=()=>{ov.hidden=true};
 ov.addEventListener('click',e=>{if(e.target===ov){shut();return}const b=e.target.closest('button');if(!b)return;const c=b.dataset.c;try{AU.sfx('pick')}catch(er){}
  if(c==='x')shut();else if(c==='copy')copy();else if(c==='PASS'||c==='FAIL'){const key=b.closest('.ci').dataset.k,s=ld();s[key]=Object.assign(s[key]||{},{st:s[key]&&s[key].st===c?'':c});sv(s);const sc=ov.querySelector('.cb').scrollTop;render();ov.querySelector('.cb').scrollTop=sc}});
 ov.addEventListener('change',e=>{const i=e.target;if(i.tagName!=='INPUT')return;const key=i.closest('.ci').dataset.k,s=ld();s[key]=Object.assign(s[key]||{},{n:i.value.slice(0,200)});sv(s)});
 for(const ev of['touchstart','touchmove','touchend','pointerdown','mousedown','wheel'])ov.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 addEventListener('keydown',e=>{if(ov.hidden)return;if(e.code==='Escape'){shut();e.stopImmediatePropagation();e.preventDefault();return;}
   if(e.target&&e.target.tagName==='INPUT')return;if(e.code==='Enter'||e.code==='Space')e.stopImmediatePropagation();},true);   // Enter / Space inside the sheet never starts the game
 window.nrChkOpen=()=>{render();ov.hidden=false};
 const mk=()=>{const b=document.createElement('button');b.type='button';b.className='go dim ckB';b.addEventListener('click',e=>{e.stopPropagation();nrChkOpen()});return b};
 const trow=document.querySelector('#title .row');
 {const sb=document.getElementById('setBody');if(sb){const w=document.createElement('div');w.style.cssText='margin:10px 0 4px';w.appendChild(mk());sb.appendChild(w);}}   // top of the settings list: the footer is too narrow for a third button on a small phone
 if(trow){const r2=document.createElement('div');r2.className='row';r2.id='titleRow2';r2.appendChild(mk());trow.after(r2);}
 badge();
 window.__chk={open:()=>nrChkOpen(),text,items:NR_CHECKLIST,left,ver:NR_VER};}

/* ===== 2. FIRST-TAP BUTTONS =====
   The first tap on a phone could be lost: the page re-laid itself out on the first touch, so the button moved between finger down and finger up and no click came.
   (b.js now knows a phone from the start.) On top of that every button fires on pointer UP over the button it was pressed on (judged by where it was when pressed),
   once; the browser's own click that follows is swallowed, so nothing runs twice. Keyboard clicks (detail 0) and the on-screen DASH/EMP/PAUSE pads (their own pointerdown) are left alone. */
{let dn=null,lastUp=-1e9,synth=false;
 const btnOf=t=>{const b=t&&t.closest&&t.closest('button');return b&&!b.disabled&&b.id!=='calPad'&&!b.closest('#touch')?b:null;};
 const shown=b=>b.isConnected&&b.getClientRects().length>0;
 addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0){dn=null;return;}const b=btnOf(e.target);dn=b?{b,x:e.clientX,y:e.clientY,r:b.getBoundingClientRect(),id:e.pointerId}:null;},true);
 addEventListener('pointercancel',()=>{dn=null;},true);
 addEventListener('pointerup',e=>{const d=dn;dn=null;if(!d||d.id!==e.pointerId||!shown(d.b))return;
   if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>16)return;                                  // a drag or a scroll, not a tap
   const r=d.r,inside=e.clientX>=r.left-4&&e.clientX<=r.right+4&&e.clientY>=r.top-4&&e.clientY<=r.bottom+4;
   if(!inside&&btnOf(document.elementFromPoint(e.clientX,e.clientY))!==d.b)return;
   lastUp=e.timeStamp;synth=true;try{d.b.click();}finally{synth=false;}},true);
 addEventListener('click',e=>{if(synth||!e.isTrusted||e.detail===0)return;if(e.timeStamp-lastUp<900&&btnOf(e.target)){e.stopImmediatePropagation();e.preventDefault();}},true);
 window.__tap={get last(){return lastUp}};}

/* the title buttons appear once the page has been built, the fonts are in and the layout has stopped moving (head.html hides them until then) */
{const go=()=>setTimeout(()=>requestAnimationFrame(()=>document.documentElement.classList.add('rdy')),400);
 Promise.race([document.fonts&&document.fonts.ready,new Promise(r=>setTimeout(r,1500))]).then(go,go);}

/* ===== 3. POWER-UP LEVELS: picking the same power-up again levels it (up to LV5): longer, and stronger where it can be ===== */
const PWL={};
const PW_LV_MAX=5;
NR.on('runStart',()=>{for(const k in PWL)delete PWL[k];});
{const give=PW.give;
 PW.give=function(kind,ob){const lv=Math.min(PW_LV_MAX,(PWL[kind]||0)+1),r=give.call(this,kind,ob);if(!r)return r;PWL[kind]=lv;
   if(kind==='fix'){if(lv>=3&&P.hp<P.max)P.hp++;}
   else if(kind!=='drop'){const a=this.st().act.find(x=>x.k===kind);if(a){a.lv=lv;a.d*=1+.2*(lv-1);}}
   if(lv>1){floater(P.x,P.y-60,PWK[kind].n.split(' ')[0]+' LV'+lv,PWK[kind].c);G.hint={t:3,txt:say(PWK[kind].tip+' · LV'+lv)};}
   return r;};
 const tk=PW.tick;PW.tick=function(dt){const s=this.st(),before=G.score,ls=s.ls,a=s.act.find(x=>x.k==='tempo');tk.call(this,dt);
   if(a&&a.lv>1&&before>ls){G.score+=Math.round((before-ls)*.25*(a.lv-1));s.ls=G.score;}};          // Tempo Up: score x2.0, x2.25 ... x3.0
 const bl=PW.blast;PW.blast=function(ob){bl.call(this,ob);const lv=PWL.drop||1;if(lv>1)for(const e of G.en){if(e.type==='boss'){if(e.x<W-20)e.hp-=4*(lv-1);}else e.hp-=7*(lv-1);}};   // Drop: a harder blast
 const hd=PW.hud;PW.hud=function(t,x0,y0,k){hd.call(this,t,x0,y0,k);const s=G.pw;if(!s)return;k=k||1;x0=x0==null?18:x0;let y=y0==null?112:y0;
   for(const a of s.act){if(a.lv>1){ctx.save();ctx.translate(x0,y);ctx.scale(k,k);ctx.font='700 10px "Share Tech Mono",monospace';ctx.textAlign='center';ctx.fillStyle=PWK[a.k].c;ctx.fillText('LV'+a.lv,14,18);ctx.restore();}y+=46*k;}};}
NR.on('beat',()=>{if(!G.live||G.dead||SH.active||!PW.on('drum'))return;const a=G.pw.act.find(x=>x.k==='drum'),lv=a&&a.lv||1;if(lv<3)return;     // Drum Burst LV3+: a wider burst on every beat
  const x=P.x+22,y=P.y;G.pb.push({x,y:y-10,vx:880,vy:-150,dm:1,pf:0},{x,y:y+10,vx:880,vy:150,dm:1,pf:0});if(lv>=5)G.pb.push({x,y:y-14,vx:860,vy:-260,dm:1,pf:0},{x,y:y+14,vx:860,vy:260,dm:1,pf:0});});
NR.on('fire',f=>{if(!PW.on('tri'))return;const a=G.pw.act.find(x=>x.k==='tri'),lv=a&&a.lv||1;if(lv<3)return;                                    // Triple Shot LV3+: another pair of side shots
  G.pb.push({x:f.x,y:f.y-12,vx:840,vy:-300,dm:.7*tpDmg(),pf:0},{x:f.x,y:f.y+12,vx:840,vy:300,dm:.7*tpDmg(),pf:0});});
NR.on('tick',()=>{if(!G.live||G.dead)return;if(PW.on('nr')){const a=G.pw.act.find(x=>x.k==='nr');SH.nx=TP.nx0*(2+.5*((a&&a.lv||1)-1));}});   // Neon Rain pays x2.0 ... x4.0

/* ===== 4. WEAPONS: four weapons, two slots, equipped in the pit stop (or on the title screen), each LV1-5 =====
   Pickups ("up" drops) give XP to the equipped weapon with the lower level. The base guns of the ship are unchanged; weapons add to them. */
const WPD={
  pulse:{n:'PULSE SPREAD',s:'PULSE',c:'#ff8ad8',tx:'Wide spread. Best against crowds.'},
  laser:{n:'LASER LANCE',s:'LANCE',c:'#7dffd8',tx:'One beam pierces every enemy in line.'},
  swarm:{n:'HOMING SWARM',s:'SWARM',c:'#ffb020',tx:'Missiles hunt the nearest enemy.'},
  beat:{n:'BEAT CANNON',s:'CANNON',c:'#ffe14d',tx:'A heavy shell on every beat.'},
  arc:{n:'ARC CHAIN',s:'ARC',c:'#8fe9ff',tx:'Lightning leaps from foe to foe.'},
  orbit:{n:'ORBIT BLADES',s:'BLADES',c:'#b6ff5a',tx:'Blades spin round you and slice.'},
  disc:{n:'RICOCHET DISC',s:'DISC',c:'#ff7a45',tx:'A razor disc bounces off the walls.'},
  mine:{n:'MINE LAYER',s:'MINES',c:'#c08aff',tx:'Mines you drop blast what they touch.'}};
/* FUSIONS: two different weapons in the two slots fuse. Every weapon has two tags; the first rule below that fits the pair gives the effect
   (9 effects for all 28 pairs, plus +12% damage). A rule is [tag of the owner weapon, tag of the partner (null = any), effect]. */
const WTAG={pulse:['spread','rapid'],laser:['pierce','beam'],swarm:['homing','volley'],beat:['burst','heavy'],arc:['chain','shock'],orbit:['orbit','melee'],disc:['bounce','disc'],mine:['mine','blast']};
const FU_RULES=[['homing','burst','bomblets'],['bounce','pierce','rebound'],['pierce','spread','split'],['orbit',null,'orbitfire'],['chain',null,'zap'],['mine',null,'shrapnel'],['homing',null,'seek'],['burst',null,'echo'],['bounce',null,'bounce']];
const FU_TX={split:'Shots pierce, then split once',bomblets:'Each shell frees 3 homing bomblets',rebound:'Piercing shots that bounce back',orbitfire:'Blades also fire as they spin',zap:'Partner hits leap on as lightning',shrapnel:'Mine blasts spit sharp shards',seek:'Partner shots home in on foes',echo:'Each shell adds a partner volley',bounce:'Partner shots bounce once'};
const FU_NAMES={'arc-beat':'Thunder Drum','arc-disc':'Storm Quoit','arc-laser':'Volt Spear','arc-mine':'Static Field','arc-orbit':'Halo Spark','arc-pulse':'Fork Flash','arc-swarm':'Chain Hornets','beat-disc':'Bass Ricochet','beat-laser':'Kick Lance','beat-mine':'Subwoofer Trap','beat-orbit':'Metronome Ring','beat-pulse':'Drop Fan','beat-swarm':'Bomblet Choir','disc-laser':'Mirror Lance','disc-mine':'Pinball Grave','disc-orbit':'Saw Carousel','disc-pulse':'Rain Bounce','disc-swarm':'Boomerang Bees','laser-mine':'Tripwire Beam','laser-orbit':'Lantern Spin','laser-pulse':'Needle Storm','laser-swarm':'Hunter Needles','mine-orbit':'Satellite Mines','mine-pulse':'Seed Spray','mine-swarm':'Hive Mines','orbit-pulse':'Comet Crown','orbit-swarm':'Wasp Halo','pulse-swarm':'Pollen Burst'};
const FUSE_ON=true;                                        // switch for the whole fusion feature
const FU_K=1.12;                                           // fusion damage bonus
const pbCap=()=>touchUI||rotMode?44:64;                    // most player bullets alive at once; weapon and fusion shots that do not fit are skipped
const pbRoom=n=>G.pb.length+(n||1)<=pbCap();
const WP_IDS=Object.keys(WPD),WP_NEED=[2,3];                    // in-run pit-stop pickups: LV1 to LV2, LV2 to LV3 (each in-run level adds one effective level, at most +2; wpx.js)
const WP_ALL=/[?&]all=1/.test(location.search);                       // test link: every weapon counts as owned
const WPX={fire:{},demo:{}};                                      // the eight newer weapons (wpx.js) plug into the fire / demo code here
const WP_MAX=10,WP_RUN_MAX=3;                                    // permanent levels 1..10 (bought in the garage); effective level = permanent + in-run bonus, at most 10
const WP={eq:['pulse',null],lv:{},xp:{},pl:{pulse:1},vc:0,open:false,bl:[],mn:[],fuT:0,lmy:-999,mode:'pit',seen:!!load('mnr_wpseen',false),
  permOf(id){return Math.max(1,this.pl[id]|0);},          // permanent (garage) level; a weapon that is not owned counts as 1 (test hooks may equip it)
  has(id){return (this.pl[id]|0)>0||WP_ALL;},
  runOf(id){return this.lv[id]||1;},                       // in-run pit-stop level 1..3
  lvOf(id){return Math.min(WP_MAX,this.permOf(id)+Math.min(WP_RUN_MAX-1,this.runOf(id)-1));},   // effective level that drives damage, rate, size and count
  eqIds(){return this.eq.filter(Boolean);},
  canGain(){return this.eqIds().some(id=>this.runOf(id)<WP_RUN_MAX&&this.lvOf(id)<WP_MAX);},
  maxLv(){let m=1;for(const id of this.eqIds())m=Math.max(m,this.lvOf(id));return m;},
  sync(){if(typeof P!=='undefined'&&P)P.wl=1+Math.floor((this.maxLv()-1)/2.25);},   // ships that scale with the weapon level (Half-time Heavy) keep their old 1..5 range,
  save(){save('mnr_wp',{eq:this.eq});save('mnr_wplv',this.pl);},
  reset(){this.lv={};this.xp={};this.vc=0;this.bl=[];this.mn=[];this.fuT=4;this.lmy=-999;this.sync();},
  // the fusion of the two equipped weapons (null when only one, or the same one twice)
  fu(){const[a,b]=this.eq;if(!FUSE_ON||!a||!b||a===b)return null;const k=a<b?a+'-'+b:b+'-'+a;if(this._fk===k)return this._f;this._fk=k;this._f=null;const[x,y]=k.split('-');
    for(const[t1,t2,fx]of FU_RULES){const tx=WTAG[x],ty=WTAG[y];let own=null,par=null;
      if(t1==='*'){own=x;par=y;}
      else if(t2){if(tx.includes(t1)&&ty.includes(t2)){own=x;par=y;}else if(ty.includes(t1)&&tx.includes(t2)){own=y;par=x;}}
      else if(tx.includes(t1)){own=x;par=y;}else if(ty.includes(t1)){own=y;par=x;}
      if(own){this._f={id:'fu-'+k,img:'fx-fuse-'+k,timg:'fx-fuse-tag-'+(t1==='*'?'any':t1)+'-'+(t2||'any'),k,name:FU_NAMES[k]||fuName(x,y),fx,tx:FU_TX[fx],own,par,c1:WPD[x].c,c2:WPD[y].c};break;}}
    return this._f;},
  fk(){return this.fu()?FU_K:1;},
  // options a fusion adds to the bullets of weapon id
  mod(id,o){const f=this.fu();o=Object.assign({},o);if(!f)return o;const fx=f.fx,mine=id===f.own||id===f.par;
    if(fx==='split'&&mine){if(!o.px){o.px=new Set();o.pn=1;}o.sp=1;}
    else if(fx==='rebound'&&mine){if(!o.px){o.px=new Set();o.pn=99;}o.rc=Math.max(o.rc||0,1);}
    else if(fx==='seek'&&id===f.par)o.hk=Math.max(o.hk||0,1.8);
    else if(fx==='bounce'&&id===f.par)o.rc=Math.max(o.rc||0,1);
    else if(fx==='zap'&&id===f.par)o.zp=1;
    else if(fx==='chill'&&id===f.par)o.cl=1.6;
    else if(fx==='splash'&&id===f.par)o.ax=1;
    else if(fx==='wide'&&id===f.par)o.rad=(o.rad||0)+4;
    else if(fx==='pierce1'&&id===f.par){if(!o.px){o.px=new Set();o.pn=1;}else if(o.pn!=null&&o.pn<90)o.pn++;}
    return o;},
  gain(){const ids=this.eqIds().filter(id=>this.runOf(id)<WP_RUN_MAX&&this.lvOf(id)<WP_MAX);if(!ids.length){P.emp=Math.min(3,P.emp+1);floater(P.x,P.y-24,'EMP +1','#ffb020');return;}
    ids.sort((a,b)=>this.lvOf(a)-this.lvOf(b));const id=ids[0],d=WPD[id];this.xp[id]=(this.xp[id]||0)+1;
    if(this.xp[id]>=WP_NEED[this.runOf(id)-1]){this.xp[id]=0;this.lv[id]=this.runOf(id)+1;floater(P.x,P.y-24,d.s+' LV'+this.lvOf(id),d.c);G.rings.push({x:P.x,y:P.y,l:.5,m:.5,c:d.c});}
    else floater(P.x,P.y-24,d.s+' '+this.xp[id]+'/'+WP_NEED[this.runOf(id)-1],d.c);
    this.sync();if(this.open)this.draw();},
  // the shots of the equipped weapons, called inside the ship's volley so every upgrade (damage, crits, piercing...) applies to them too
  shots(std,pf){this.vc++;const f=this.fu(),k=this.fk();
    const mk=id=>(vx,vy,d,o)=>{if(!pbRoom())return;if(id!=='drone')WPX.last={vx,vy,d,o:o||{}};std(vx,vy,d*k,this.mod(id,o));};   // WPX.last: the drone repeats it
    for(const id of this.eq){if(id)this.fire1(id,mk(id),this.lvOf(id));}
    if(f&&f.fx==='orbitfire'&&this.vc%2===0){const par=f.par,st=mk(par);for(const b of this.bl)st(900,0,.45,{x:b.x,y:b.y,col:WPD[par].c,len:10,th:3});}},
  // one weapon's part of a volley
  fire1(id,std,L){
    if(id==='pulse'){const d=.82+.012*(L-1),v=[L>=3?145:130,L>=3?250:240];if(L>=6)v.push(60);if(L>=10)v.push(330);
      for(const a of v){std(870,-a,d,{col:'#ff8ad8',len:12});std(870,a,d,{col:'#ff8ad8',len:12});}}
    else if(id==='laser'){if(L>=8||this.vc%(L>=4?3:2)!==(L>=4?2:1))std(1500,0,2+.04*(L-1),{big:1,px:new Set(),pn:99,rad:L>=6?3:0,col:'#7dffd8',len:90,th:3.5+.25*(L-1)});}
    else if(id==='swarm'){if(this.vc%2===1){const n=1+(L>=6),d=.85+.015*(L-1);for(let i=0;i<n;i++)std(520,(i-(n-1)/2)*300+rnd(-60,60),d,{hk:2.6+.4*Math.min(L,7),col:'#ffb020',len:10,th:4});}}
    else if(id==='disc'){if(this.vc%2===0){const rc=2+(L>=10),d=(.95+.02*(L-1))*(L>=6?.4:1),o=()=>({rc,px:new Set(),pn:99,rad:6,big:1,col:'#ff7a45',len:16,th:8});
      if(L>=6){std(560,-400,d,o());std(560,400,d,o());}else std(560,(this.vc%4===0?-1:1)*400,d,o());}}
    else if(id==='arc'){if(this.vc%2===0)this.arcZap(L);}
    else if(id==='mine'){if(this.vc%3===0)this.dropMine(L);}
    else if(WPX.fire[id])WPX.fire[id](std,L);},
  // can this foe be hurt by direct (non-bullet) damage right now?
  tgt(e){return e.hp>0&&!e.dying&&e.type!=='gate'&&e.x<W-6&&(e.type!=='boss'||e.x<W-20);},
  hurtE(e,dm){e.hp-=dm*(e.shl?.45:1);e.flash=.08;},
  // ARC CHAIN: the nearest foe in range, then it jumps from foe to foe (1+L jumps)
  arcZap(L){const R=270+14*L,dm=(1.2+.01*(L-1))*tpDmg()*this.fk();let cx=P.x+18,cy=P.y;const hit=new Set();
    for(let i=0;i<2+(L>=6)+(L>=10);i++){let best=null,bd=i?150:R;for(const e of G.en){if(hit.has(e)||!this.tgt(e)||e.x<P.x-30)continue;const d=Math.hypot(e.x-cx,e.y-cy);if(d<bd){bd=d;best=e;}}
      if(!best)break;hit.add(best);this.hurtE(best,dm);AX.arcs.push({x1:cx,y1:cy,x2:best.x,y2:best.y,l:.22});cx=best.x;cy=best.y;}
    if(hit.size)AU.sfx('graze');},
  // a lightning leap from foe e to the nearest other foe (zap fusion)
  leap(e,dm){let best=null,bd=170;for(const o of G.en){if(o===e||!this.tgt(o))continue;const d=Math.hypot(o.x-e.x,o.y-e.y);if(d<bd){bd=d;best=o;}}
    if(best){this.hurtE(best,dm);AX.arcs.push({x1:e.x,y1:e.y,x2:best.x,y2:best.y,l:.2});}},
  // MINE LAYER: a mine only drops when the ship has moved since the last one, so sitting still lays nothing new
  dropMine(L){if(Math.abs(P.y-this.lmy)<14)return;this.lmy=P.y;if(this.mn.length>=(L>=6?5:4))return;this.mn.push({x:P.x-26,y:P.y,vx:70,t:0,L});},
  boom(m){const f=this.fu(),k=this.fk(),L=m.L,R=62+3*L,dm=(3.6+.1*(L-1))*tpDmg()*k;let first=null;
    for(const e of G.en){if(!this.tgt(e))continue;if(Math.hypot(e.x-m.x,e.y-m.y)<R+e.r){this.hurtE(e,dm);if(!first)first=e;}}
    G.rings.push({x:m.x,y:m.y,l:.3,m:.3,c:WPD.mine.c});burst(m.x,m.y,WPD.mine.c,8,200,.35);AU.sfx('hit');
    if(f&&f.fx==='shrapnel'){for(let i=0;i<4&&pbRoom();i++){const a=i*Math.PI/2+.4;G.pb.push(Object.assign({x:m.x,y:m.y,vx:Math.cos(a)*600,vy:Math.sin(a)*600,dm:.55*tpDmg()*k,pf:0,col:WPD[f.par].c,len:10,th:3,fz:1}));}}
    if(f&&f.fx==='zap'&&f.par==='mine'&&first)this.leap(first,dm*.5);},
  // bullet hit hook (called from b.js for bullets that carry sp / zp)
  hit(b,e){if(b.sp){b.sp=0;for(const s of[-1,1]){if(!pbRoom())break;G.pb.push({x:b.x,y:b.y,vx:640,vy:s*300,dm:b.dm*.5,pf:b.pf,col:b.col,len:10,th:3,fz:1});}}
    if(b.zp)this.leap(e,b.dm*.5);},
  // per-tick work of the blades and mines
  upd(dt){if(!G.live||G.dead||SH.active||P.over)return;if(this.fuT>0)this.fuT-=dt;
    const ids=this.eqIds(),k=this.fk();
    if(ids.includes('orbit')){const L=this.lvOf('orbit'),n=2+(L>=3)+(L>=9),r=44+3*Math.min(L,6),a0=bpos()*Math.PI,dm=(.9+.015*(L-1))*tpDmg()*k;this.bl.length=n;
      for(let i=0;i<n;i++){const a=a0+i*Math.PI*2/n,b=this.bl[i]=this.bl[i]||{};b.x=P.x+Math.cos(a)*r;b.y=P.y+Math.sin(a)*r;b.a=a;
        for(const e of G.en){if(!this.tgt(e)||G.t-(e.ob||-9)<.28)continue;if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+12){e.ob=G.t;this.hurtE(e,dm);burst(b.x,b.y,WPD.orbit.c,2,120,.2);}}}}
    else this.bl.length=0;
    if(!ids.includes('mine'))this.mn.length=0;
    for(let i=this.mn.length-1;i>=0;i--){const m=this.mn[i];m.t+=dt;m.x+=m.vx*dt;let go=m.t>7||m.x>W+20;
      if(!go&&m.t>.35)for(const e of G.en){if(this.tgt(e)&&Math.hypot(e.x-m.x,e.y-m.y)<e.r+16){go=2;break;}}
      if(go){this.mn.splice(i,1);if(go===2)this.boom(m);}}},
  drawWorld(t){if(!G||!G.live||G.dead)return;const c=ctx;
    if(this.bl.length){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=WPD.orbit.c;c.fillStyle=WPD.orbit.c;c.lineWidth=2;c.globalAlpha=.25;c.beginPath();c.arc(P.x,P.y,44+3*Math.min(this.lvOf('orbit'),6),0,7);c.stroke();c.globalAlpha=.95;
      for(const b of this.bl){c.beginPath();c.moveTo(b.x+Math.cos(b.a+1.57)*10,b.y+Math.sin(b.a+1.57)*10);c.lineTo(b.x+Math.cos(b.a)*7,b.y+Math.sin(b.a)*7);c.lineTo(b.x-Math.cos(b.a+1.57)*10,b.y-Math.sin(b.a+1.57)*10);c.closePath();c.fill();}c.restore();}
    if(this.mn.length){c.save();c.globalCompositeOperation='lighter';for(const m of this.mn){const on=m.t>.35,p=.6+.4*Math.sin(t*8+m.x);c.globalAlpha=on?p:.35;c.strokeStyle=c.fillStyle=WPD.mine.c;c.lineWidth=2;c.beginPath();c.arc(m.x,m.y,6,0,7);c.stroke();c.beginPath();c.arc(m.x,m.y,2.5,0,7);c.fill();
      for(let i=0;i<6;i++){const a=i*1.047+t;c.beginPath();c.moveTo(m.x+Math.cos(a)*6,m.y+Math.sin(a)*6);c.lineTo(m.x+Math.cos(a)*10,m.y+Math.sin(a)*10);c.stroke();}}c.restore();}},
  beat(){if(!G.live||G.dead||SH.active||P.over||!this.eq.includes('beat'))return;const L=this.lvOf('beat'),dm=(7+.2*(L-1))*tpDmg()*this.fk();
    const f=this.fu(),k=this.fk(),mo=o=>this.mod('beat',o);
    if(pbRoom(3)){G.pb.push(mo({x:P.x+28,y:P.y,vx:760,vy:0,dm,pf:1,big:1,rad:8,px:new Set(),pn:Math.floor(L/3),col:'#ffe14d',len:40,th:9+.3*(L-1)}));
    if(L>=4)G.pb.push(mo({x:P.x+20,y:P.y-8,vx:740,vy:-130,dm:dm*.35,pf:1,big:1,px:new Set(),pn:0,col:'#ffe14d',len:24,th:6}),mo({x:P.x+20,y:P.y+8,vx:740,vy:130,dm:dm*.35,pf:1,big:1,px:new Set(),pn:0,col:'#ffe14d',len:24,th:6}));}
    if(f&&f.fx==='bomblets')G.delayed.push({t:BT.spb*.4,f:()=>{if(G.dead||!running||P.over)return;for(const vy of[-170,0,170])if(pbRoom())G.pb.push({x:P.x+110,y:P.y,vx:540,vy,dm:dm*.3,pf:0,hk:3,col:WPD.swarm.c,len:10,th:5,fz:1});}});
    if(f&&f.fx==='echo'){const par=f.par,st=(vx,vy,d,o)=>{if(pbRoom())G.pb.push(Object.assign({x:P.x+22,y:P.y,vx,vy,dm:d*SH.dmk()*tpDmg()*k,pf:0,fz:1},this.mod(par,o)));};this.fire1(par,st,this.lvOf(par));}
    G.rings.push({x:P.x+24,y:P.y,l:.25,m:.25,c:'#ffe14d'});AU.sfx('shot');},
  // short text for the HUD: "PULSE 2 · LANCE 1"
  hud(c,x,y,k){c.save();c.font=`${Math.round(11*(k||1))}px "Share Tech Mono",monospace`;c.textAlign='left';let xx=x;
    for(const id of this.eq){const d=id&&WPD[id],t=d?d.s+' '+this.lvOf(id):'-';if(d)xx+=RIG.chip(c,id,this.eq.indexOf(id),xx,y,k||1);c.fillStyle=d?d.c:'#dcd8f6';c.fillText(t,xx,y);xx+=c.measureText(t).width+10*(k||1);}
    const f=this.fu();if(f&&this.fuT>0){c.globalAlpha=Math.min(1,this.fuT);c.fillStyle='#ffe14d';c.fillText('FUSION '+f.name.toUpperCase(),x,y+13*(k||1));}c.restore();},
  toggle(id){const i=this.eq.indexOf(id);let m;
    if(i>=0){if(this.eqIds().length<2){this.msg('Keep one weapon equipped');return;}this.eq[i]=null;m=WPD[id].s+' removed';}
    else{let j=this.eq.indexOf(null);if(j<0)j=this.lvOf(this.eq[0])<this.lvOf(this.eq[1])?0:1;this.eq[j]=id;m=WPD[id].s+' in slot '+(j+1);}
    this.save();this.sync();AU.sfx('up');this.msg(m);this.draw();},
  msg(t){const el=$('wpMsg');if(el)el.textContent=t;}};
{const ld=load('mnr_wp',null);if(ld&&Array.isArray(ld.eq)){WP.eq=[WP_IDS.includes(ld.eq[0])?ld.eq[0]:null,WP_IDS.includes(ld.eq[1])&&ld.eq[1]!==ld.eq[0]?ld.eq[1]:null];if(!WP.eqIds().length)WP.eq=['pulse',null];}}
window.__wp=Object.assign(WP,{lvl(id,n){this.lv[id]=n;}});          // test hook
RIG.ok=true;window.__rig=Object.assign(RIG,{GA,SHIPS,pushPos:()=>[P.x,P.y]});          // test hook
NR.on('runStart',()=>WP.reset());NR.on('tick',dt=>{WP.sync();WP.upd(dt);});
{const pd=PW.draw;PW.draw=function(t){pd.call(this,t);WP.drawWorld(t);};const cl=SH.close;SH.close=function(){cl.call(this);WP.fuT=4;};}NR.on('beat',()=>WP.beat());

/* ----- the WEAPONS sheet: one card per weapon with a 2-second looping demo and a few words ----- */
{const st=document.createElement('style');st.textContent=`
#wpm .slots{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto;font-family:var(--mono);font-size:clamp(11px,calc(var(--u)*3.2),15px);color:var(--dim)}
#wpm .slots b{color:var(--ink);font-weight:400;border:1px solid #3a2b5c;background:#140c26;border-radius:4px;padding:2px 8px}
#wpL{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));grid-auto-rows:min-content;gap:calc(var(--u)*2);overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;flex:1 1 0;min-height:0;padding:4px 2px}
#wpL .card{flex-direction:row;text-align:left;justify-content:flex-start;gap:10px;padding:8px 10px;min-height:76px;position:relative}
#wpL .card canvas{width:108px;height:52px;flex:0 0 auto;background:#0a0618;border-radius:6px}
#wpL .card .tx{flex:1 1 0}#wpL .card .slot{position:absolute;top:4px;right:8px;font-family:var(--mono);font-size:11px;color:var(--c);letter-spacing:.06em}
#wpL .card .pp{display:flex;gap:2px;margin-top:3px}#wpL .card .pp i{display:block;width:clamp(8px,calc(var(--u)*3),14px);height:5px;border-radius:1px;background:#ffffff22}#wpL .card .pp i.on{background:var(--c)}
#wpL .card.sel{background:#22123f}
#wpFu{flex:0 0 auto;display:flex;gap:10px;align-items:center;min-height:30px;font-family:var(--mono);font-size:clamp(11px,calc(var(--u)*3.2),15px);color:var(--dim);padding:2px 4px}
#wpShip{display:block;width:min(100%,300px);height:auto;aspect-ratio:300/96;margin:0 auto 4px;flex:0 0 auto}#wpFu canvas{width:56px;height:56px;flex:0 0 auto}#wpFu .n{color:#ffe14d;font-size:1.05em;letter-spacing:.04em}#wpFu .t{color:var(--ink)}
#shWpRow{display:flex;gap:10px;align-items:center;flex:0 0 auto;min-height:44px}#shWpRow button{flex:0 0 auto;min-width:44px;padding:.4em 1em}#shWpRow span{font-family:var(--mono);color:var(--dim);font-size:clamp(11px,calc(var(--u)*3.2),15px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#titleRow2{margin-top:2px}#titleRow2 .go{font-size:clamp(12px,min(1.6vw,2.8vh),16px)}`;document.head.appendChild(st);}
const wpEl=document.createElement('div');wpEl.id='wpm';wpEl.className='ov solid pg';wpEl.hidden=true;
wpEl.innerHTML='<div class="top"><span class="ttl">WEAPONS</span><span class="slots" id="wpSl"></span></div><canvas id="wpShip" width="300" height="96"></canvas><div id="wpL"></div><div id="wpFu"></div><div class="msg" id="wpMsg"></div><div class="bot"><button class="go alt" id="wpGo" type="button">DONE</button></div>';
stage.appendChild(wpEl);
{const DEMO=(id,c,t,col)=>{                                       // t: 0..2 seconds, the demo loops
   c.clearRect(0,0,108,52);const sy=26;c.fillStyle='#ffffff';c.beginPath();c.moveTo(6,sy-6);c.lineTo(18,sy);c.lineTo(6,sy+6);c.closePath();c.fill();
   const foe=(x,y,hit)=>{c.fillStyle=hit?'#ffffff':'#ff3050';c.beginPath();c.arc(x,y,5,0,7);c.fill();};
   c.strokeStyle=col;c.fillStyle=col;c.lineWidth=2;c.lineCap='round';
   if(id==='pulse'){foe(98,12,0);foe(98,26,0);foe(98,40,0);const p=(t%.5)/.5;for(const a of[-.45,-.2,0,.2,.45]){const d=20+p*78;c.beginPath();c.moveTo(18+Math.cos(a)*(d-8),sy+Math.sin(a)*(d-8));c.lineTo(18+Math.cos(a)*d,sy+Math.sin(a)*d);c.stroke();}}
   else if(id==='laser'){const p=(t%1)/1,len=Math.min(1,p*1.6)*84;foe(50,sy,p*84>32);foe(72,sy,p*84>54);foe(94,sy,p*84>76);c.lineWidth=3;c.beginPath();c.moveTo(20,sy);c.lineTo(20+len,sy);c.stroke();c.globalAlpha=.3;c.lineWidth=7;c.stroke();c.globalAlpha=1;}
   else if(id==='swarm'){const p=(t%1)/1,tg=[[96,10],[100,28],[94,44]];tg.forEach((q,i)=>foe(q[0],q[1],p>.92));
     tg.forEach((q,i)=>{const dir=i===1?0:(i===0?-1:1),x=18+(q[0]-18)*p,y=sy+(q[1]-sy)*p-dir*Math.sin(p*Math.PI)*-16;c.beginPath();c.arc(x,y,2.6,0,7);c.fill();});}
   else if(id==='arc'){const tg=[[52,12],[78,40],[98,18]],on=(t%.8)<.4;tg.forEach(q=>foe(q[0],q[1],on));if(on){c.beginPath();c.moveTo(18,sy);let px=18,py=sy;for(const q of tg){c.lineTo((px+q[0])/2+rnd(-4,4),(py+q[1])/2+rnd(-6,6));c.lineTo(q[0],q[1]);px=q[0];py=q[1];}c.stroke();}}
   else if(id==='orbit'){foe(70-((t%2)/2)*30,sy-4,((t%2)/2)>.5);for(let i=0;i<3;i++){const a=t*6.28+i*2.094,x=18+Math.cos(a)*16,y=sy+Math.sin(a)*16;c.beginPath();c.moveTo(x+Math.cos(a+1.57)*5,y+Math.sin(a+1.57)*5);c.lineTo(x+Math.cos(a)*4,y+Math.sin(a)*4);c.lineTo(x-Math.cos(a+1.57)*5,y-Math.sin(a+1.57)*5);c.closePath();c.fill();}}
   else if(id==='disc'){foe(98,sy,false);const p=(t%2)/2,x=18+p*80,y=sy-20+Math.abs(((p*3)%1)*2-1)*40;c.beginPath();c.arc(x,y,4.5,0,7);c.fill();c.globalAlpha=.4;c.beginPath();c.arc(x-9,y,3,0,7);c.fill();c.globalAlpha=1;}
   else if(id==='mine'){const p=(t%2)/2;[38,60].forEach(x=>{c.beginPath();c.arc(x,sy,4+Math.sin(t*9+x)*.8,0,7);c.stroke();});const fx=98-p*44;foe(fx,sy,p>.7);if(p>.7){c.globalAlpha=1-(p-.7)/.3;c.beginPath();c.arc(60,sy,10+(p-.7)*60,0,7);c.stroke();c.globalAlpha=1;}}
   else if(WPX.demo[id])WPX.demo[id](c,t,col,foe,sy);
   else{const p=(t%1)/1,ring=(t%1)<.3?(t%1)/.3:0;c.globalAlpha=1-ring;c.beginPath();c.arc(20,sy,4+ring*14,0,7);c.stroke();c.globalAlpha=1;foe(94,sy,p>.8&&p<.95);
     const x=20+p*70;c.fillRect(x-8,sy-4,18,8);}
 };
 WPX.demoFn=(id,c,t,col)=>{c.clearRect(0,0,108,52);DEMO(id,c,t,col);};
 let raf=0;const loop=()=>{raf=0;if(wpEl.hidden)return;const t=(performance.now()/1000)%2;for(const cv of wpEl.querySelectorAll('canvas[data-id]')){const c=cv.getContext('2d'),n='wp-'+cv.dataset.id;if(ART.have(n)){c.clearRect(0,0,108,52);c.drawImage(ART.bm[n],28,0,52,52);}else DEMO(cv.dataset.id,c,t,WPD[cv.dataset.id].c);}raf=requestAnimationFrame(loop);};
 WP.fuIcon=function(c,f,z){c.clearRect(0,0,z,z);const m=z/2;
   if(ART.have(f.img)){c.drawImage(ART.bm[f.img],0,0,z,z);return;}
   if(f.timg&&ART.have(f.timg)){c.drawImage(ART.bm[f.timg],0,0,z,z);return;}
   c.save();c.lineCap='round';c.shadowBlur=z*.12;
   c.strokeStyle=f.c1;c.shadowColor=f.c1;c.lineWidth=z*.1;c.beginPath();c.arc(m,m,z*.36,Math.PI*.5,Math.PI*1.5);c.stroke();
   c.strokeStyle=f.c2;c.shadowColor=f.c2;c.beginPath();c.arc(m,m,z*.36,-Math.PI*.5,Math.PI*.5);c.stroke();
   c.shadowBlur=0;c.lineWidth=z*.045;c.strokeStyle=f.c1;c.beginPath();c.moveTo(z*.22,z*.78);c.lineTo(z*.78,z*.22);c.stroke();c.strokeStyle=f.c2;c.beginPath();c.moveTo(z*.22,z*.22);c.lineTo(z*.78,z*.78);c.stroke();
   c.fillStyle='#ffffff';c.font=`700 ${Math.round(z*.26)}px "Chakra Petch",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(f.name.split(' ').map(w=>w[0]).join(''),m,m+z*.02);c.restore();};
 WP.draw=function(){const box=$('wpL');box.innerHTML='';RIG.pic($('wpShip'),GA.ship);
   for(const id of WP_IDS){const d=WPD[id],L=this.lvOf(id),slot=this.eq.indexOf(id),b=document.createElement('button');b.type='button';b.className='card'+(slot>=0?' sel':'')+(this.has(id)?'':' no');b.style.setProperty('--c',d.c);b.dataset.id=id;
     b.innerHTML=`<canvas width="108" height="52" data-id="${id}"></canvas><div class="tx"><div class="n">${d.n}</div><div class="t">${d.tx}</div><div class="pp">${Array.from({length:WP_MAX},(_,i)=>`<i class="${i<this.permOf(id)&&this.has(id)?'on':i<L?'run':''}"></i>`).join('')}</div></div><span class="slot">${!this.has(id)?'LOCKED':slot>=0?'SLOT '+(slot+1):'TAP TO EQUIP'}</span>`;
     b.addEventListener('click',()=>this.toggle(id));box.appendChild(b);}
   const fu=this.fu(),fb=$('wpFu');
   if(fu){fb.innerHTML=`<canvas width="112" height="112" id="wpFuC"></canvas><div><div class="n">FUSION: ${fu.name.toUpperCase()}</div><div class="t">${fu.tx} · +12% damage</div></div>`;WP.fuIcon($('wpFuC').getContext('2d'),fu,112);}
   else fb.innerHTML='<div>Equip two different weapons to fuse them.</div>';
   $('wpSl').innerHTML=this.eq.map((id,i)=>`<b>${i+1}: ${id?WPD[id].s+' '+this.lvOf(id):'empty'}</b>`).join('');
   if(!raf)raf=requestAnimationFrame(loop);
   const row=$('shWpTx');if(row)row.textContent=this.eq.map(id=>id?WPD[id].s+' '+this.lvOf(id):'-').join(' · ');};
 WP.show=function(mode){this.mode=mode||'pit';this.open=true;this.seen=true;save('mnr_wpseen',true);this.msg('');this.draw();wpEl.hidden=false;try{AU.sfx('pick')}catch(e){}};
 WP.hide=function(){if(!this.open)return;this.open=false;wpEl.hidden=true;if(this.mode==='pit'&&typeof SH!=='undefined'&&SH.active)SH.draw();this.draw();};
 $('wpGo').addEventListener('click',()=>WP.hide());
 addEventListener('keydown',e=>{if(!WP.open)return;if(e.code==='Escape'||e.code==='Enter'||e.code==='Space'){WP.hide();e.stopImmediatePropagation();e.preventDefault();}},true);}
// a WEAPONS button + the loadout in the pit stop (above GO), and on the title screen
{const row=document.createElement('div');row.id='shWpRow';row.innerHTML='<button class="go dim" id="shWp" type="button">WEAPONS</button><span id="shWpTx"></span>';$('shMsg').after(row);
 $('shWp').addEventListener('click',()=>WP.show('pit'));
 const t2=document.getElementById('titleRow2'),b=document.createElement('button');b.type='button';b.className='go dim';b.id='wpBtn';b.textContent='WEAPONS';b.addEventListener('click',()=>WP.show('title'));
 if(t2)t2.insertBefore(b,t2.firstChild);}
// the pit-stop clock waits while the sheet is open; the first pit stop opens it by itself (not under test automation, which drives the shop buttons)
{const tk=SH.tick;SH.tick=function(dt){if(WP.open){pressed={};return;}tk.call(this,dt);};
 const pit=SH.pit;SH.pit=function(cb){pit.call(this,cb);if(this.active&&!WP.seen&&!navigator.webdriver)WP.show('pit');WP.draw();};}
WP.draw();

/* ===== 5. FAIR NET (b.js has the rest: bodies hurt only on screen, the bullet cap) =====
   Leaving the pit stop gives 1.2 s of safety, so the first shots of the next district never meet a ship that was still deciding. */
{const close=SH.close;SH.close=function(){const was=this.active;close.call(this);if(was&&P)P.inv=Math.max(P.inv||0,1.2);};}
// Hard: the safety blink after a hit is shorter (1 s instead of 1.5 s), so Hard stays hard while Normal and Easy are kinder
{const h0=hurt;hurt=function(){const hp0=P.hp;h0();if(HARD&&P.hp<hp0)P.inv=Math.min(P.inv,1);};}
