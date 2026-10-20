# On-foot enemies and boss (parts/footen.js)

Data and behaviour only; the on-foot engine (`parts/foot.js`) calls it and `FA.draw` paints it. HP is for Normal (the engine scales it). Damage: 1 = half a heart.
Test: `node games-src/nightrun/footen-test.js` (fake env, 200+ checks: telegraphs, ranges, shield/turret/mech hit rules, token cap, boss phases, damage cap).
Every attack has a visible wind-up of 0.4 s or more, projectiles are slow enough for a running + jumping hero, nothing spawns on the hero, and at most 2 ranged enemies aim/fire at once (token in `G.ftok`).

| Enemy | What it does | How to beat it | HP | Telegraph | Drops |
|---|---|---|---|---|---|
| Grunt | Walks at you, one melee swing (1) | Shoot it, or step back out of reach | 3 | 0.5 s wind-up | heal / speed / damage (20%) |
| Gunman | Holds 280-420 px, aims, fires 3 rounds on 3 beats; backs off if you close in; aborts the aim if you rush it | Move after the aim cue (angle is locked), rush it | 4 | 0.6 s aim cue | hmg / heal / magnet (30%) |
| Shield cop | Front shield blocks bullets (8 blocked hits break it); slow advance; shield bash (1, knock-back); slow to turn | Melee it, jump over and shoot its back, or break the shield | 8 | 0.5 s bash wind-up | shield / damage / shotgun (50%) |
| Bruiser | Slow walk; charge (2) with 0.8 s crouch; ground slam = two shock waves (1) + ring (2); winded 0.8 s after a charge | Sidestep the charge, jump the shock waves, shoot while it is winded | 18 | 0.8 s (charge and slam) | one weapon (shotgun / hmg / flame) |
| Knife runner | Fast; crouches, then dash-slash x2 (1 each); vaults low obstacles | Kill it before it arrives (2 hp); jump or backstep the dash | 2 | 0.4 s crouch | speed / heal / bomb (25%) |
| Sniper | Fixed on its ledge; red aim line for one beat (min 0.5 s), line locks 0.28 s before one fast shot (2) | Leave the line after it locks; shoot it | 3 | 1 beat aim line | arc / damage / slow (40%) |
| Drone | Only flyer; sine path inside the air band, hovers over you, blinks then drops a small bomb (1) | Shoot it (2 hp) or step out from under it | 2 | 0.4 s blink | bomb / magnet / heal (25%) |
| Turret | Fixed; pops up (0.4 s rise + 0.4 s aim), fires 3 shots 0.32 s apart (1), retracts | Hit it only while it is up (armoured otherwise) | 6 | 0.8 s pop-up | damage / heal / slow (35%) |
| Mech walker | Slow, turns slowly. Rocket arc at range 230-380 px (2); stomp up close = two ground waves (2) + ring (2) | Shoot the back (double damage, "WEAK POINT"); jump the waves; sidestep the rocket | 30 | 0.7 s rocket, 0.6 s stomp | 2 of rocket / arc / heal / shield / bomb |

## Boss: the Warden (`FOOT_BOSS.warden`, 400 hp)
Armoured corporate enforcer. Phases at 66% and 33%. Every phase change waits for the next bar line (4 beats) and is followed by one calm bar with no attacks (PHASE label).
**Damage cap:** at most `maxHp / 100` damage in any 1.0 s (400 hp = 4/s), the rest is shown as CLANG, so a fight takes about 100-140 s whatever the weapon.

| Phase | Verbs | Counter |
|---|---|---|
| 1 | Shoulder charge (0.8 s crouch, then 390 px/s, 2 dmg, 0.9 s winded after); pistol bursts (0.6 s aim, 3 rounds on beats) | Sidestep or jump the charge, shoot it while winded; leave the locked line |
| 2 | Deploys 2 drones; deploys a shield wall (front hits CLANG; it is slow to turn); ground shockwave line (0.7 s raise, 2 dmg, 250 px/s) | Jump over it and hit its back: back hits break the wall (8), then it is stunned 2 beats. Jump the shockwave. Wall returns 12 s later |
| 3 (enrage) | Faster (x1.3); armour halves damage; beat-locked laser bar: low beam (jump), then high beam (crouch), one beat of warning each | Jump the low, crouch the high. If the laser misses you the Warden is EXPOSED for 2 beats (full damage); armoured the rest of the time |

Boss poses: the usual set plus `attack2` (raise/deploy/laser) and `enrage` (calm bar, phase 3 idle).

## Engine contract (also written at the top of footen.js)
- `e.x` centre, `e.y` feet (flyers: centre); `env.P` the same. Ground from `env.G.floorY` or `env.G.groundAt(x)`. The engine calls `ai` every frame until `e.remove`.
- Hit: `e.hp -= dmg; def.onHit(e,dmg,env,hit)` (hit = `{x:attackerX, melee:bool}`, optional). `onHit` hands hp back for blocked or capped damage, so run `onHit` before checking `hp <= 0`. `def.canHit(e) === false` means bullets pass through (hidden turret).
- Death: `def.onDeath(e,env)` once; then keep calling `ai` until `e.remove` (0.5 s death pose). Spawn `e.dropList` (pickup ids rolled with `env.rnd`). Dead enemies do nothing (`e.dead`).
- `env.shoot(e,angle,speed,dmg,opts)` opts: `kind` (bullet, sniper, bomb, rocket, shock, shockline), `grav`, `ground` (rides the floor, jumpable), `w,h,life`, `blast`, `ox,oy` muzzle, `vx`.
- `env.melee(e,{x,y,w,h},dmg,opts)` rect is top-left; returns true if it hit the hero; may be called every frame while a hazard is active (hero invulnerability de-duplicates). `opts.beam` = laser, `opts.knock` = push.
- Optional: `env.fx(name,x,y,opts)` (die, clang, break, weak, shockring, phase, exposed, wall, wallbreak, spark), `env.spawn(type,x,y,opts)` (Warden drones; without it they are queued in `e.spawnQ`), `G.obs` low obstacles `[{x,w,h}]` for the knife vault, `G.airTop/airBottom` for the drone band.
- Beat clock: `env.G.beat` (counter, bar line = multiple of 4) with optional `G.beatLen` or `G.bpm`; without it a 120 bpm clock from `G.time` is used.
- Cues for the art: `e.telegraph/e.teleP` (0..1 wind-up progress), `e.aimCue`, `e.aim` (sniper line), `e.up/e.upAmt` (turret), `e.shield/e.sh`, `e.laser {kind,on,tele,y,h,x,w}`, `e.wall {hp,up}`, `e.exposed/e.label`, `e.phase`.
- W2: poses used are idle, run-a, run-b, jump, fall, shoot, melee, hit, die, crouch, crouch-shoot, plus boss `attack2` and `enrage`.
