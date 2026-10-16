# TRACKS 2K (tracks-1, 2026-10-16)

## 2K Drive race courses: what the sources say
- Races are part of the open world ("Forza Horizon"-like), with frequent shortcuts, elevated shortcuts, jumps, aerial power-ups, and AI that takes shortcuts too: https://en.wikipedia.org/wiki/Lego_2K_Drive · https://jumpdashroll.com/article/lego-2k-drive-review
- Tracks are "littered with power-ups and obstacles"; turbo comes from smashing scenery and drifting: https://www.destructoid.com/lego-2k-drive-review-destructoid-lego-racer/
- Rubber-banding is the most common complaint, so keep it mild and symmetric: https://totalgamingaddicts.com/lego-2k-drive-pc-review-great-racing-fun-for-smaller-gamers/
- What we built: the first rival duel (Rossi, "Westend Split", ?tk1=0 turns it off) runs on real Frankfurt streets. Bockenheimer Landstraße (ramp) → SPLIT: Anlagenring (wide, 3 turbo pads) or Neue Mainzer Straße (shorter) → Gutleutstraße (big jump) → finish. It has 5 brick checkpoint arches and 8 rows of "?" item bricks (TURBO / BRICK BLAST / SHIELD) that fire on pickup, so phones need no extra button. Rossi uses the same routes and bricks. His blast is announced 0.7 s before it lands and hits at most once per 8 s.

## Audit of the current race option (old elements that no longer fit)
1. All 6 SPR_TRACK city sprints (Zeil Dash, Mainkai Run, Bridge, Wald, Slalom, Tour) and rival duels 2-8 + the boss still load the spline "tron" track (20_race_world.js), not the city. NOT fixed here (one race per slice).
2. Plain city sprints (sp_ring, sp_henninger, …) still use neon torus gates. They should use tkArch() (98tk_city_duel.js), which was left for the next slice.
3. The spline race HUD timer under the 🐞 and the dev bar over the left third belong to the rv2k/devui lane.
4. rv2k/race-handsoff could not pass in tChkGo because it needs 240 s of real time. With tk1 on, it now runs on a fake clock (tkRun).
