# JU · moment-to-moment feel: research targets

Scope: free roam and missions (races were tuned separately). **[src]** = a fact from a source below. **[kb]** = a design target from game-feel practice that I chose for this game, with the reasoning given.
Research time was about 30 min. LEGO 2K Drive publishes no numbers (2K's feature page is behind a 403; no frame data found), so most of the numbers below are [kb] targets borrowed from the genre it copies (Mario Kart drift/boost, Burnout risk/reward, Forza Horizon open world).

## 1 · Speed and boost
| item | finding | target for us |
|---|---|---|
| boost source | [src] The boost meter fills on its own and fills faster from smashing destructible objects and from drifting (racinggames.gg, Push Square). Smashing also repairs the car (GTPlanet, Game Informer). | keep: smash → boost + heal (already in base) |
| boost activation | [src] Holding Boost pops turbines out and gives "a big burst of speed". Class B adds *Brickbash* (hold boost > 3 s to smash rivals); Class A adds *Quickbash* (a full meter gives a token, double-tap for a much faster burst). | [kb] boost speed ×1.25–1.4 over cruise top speed, reached in < 0.6 s |
| top speed / time to top | [src] No published numbers. Reviews describe muscle cars with "ludicrous top speeds" and light cars with high acceleration. | [kb] city cruise top speed reached in **4–6 s** from standstill (arcade norm; Swink's "responsiveness"); boost tops out at **≥ 1.3×** cruise |
| boost uptime | [kb] Burnout's "risk = reward": boost is earned, not ambient. In free roam with plenty of smashing, the player should be boosting **15–35 %** of the time. | 15–35 % of a 3-minute drive |

## 2 · Drift → boost
| item | finding | target |
|---|---|---|
| LEGO 2K drift | [src] Gas + brake + steer. Pink trail. A small pink drift meter above the blue boost meter converts into boost when the drift ends. | drift charge should visibly fill the boost bar |
| tiers | [src] Mario Kart 8 Deluxe: blue Mini-Turbo **0.621 s**, orange Super **1.674 s**, pink Ultra **2.633 s** of boost (Nintendo tutorial via Super Mario Wiki). Spark colour tells the tier. | 3 tiers with colour-coded sparks: blue → orange → purple |
| charge curve | [kb] The gaps between tiers should grow (≈ 0.5 / 1.1 / 2.0 s), so tier 1 is easy and tier 3 is a commitment. The payout should grow faster than linearly per tier (MK8 ratio ≈ 1 : 2.7 : 4.2). | turbo ≈ 0.6 / 1.6 / 2.6 s, boost-bar payout 8 / 18 / 32 % |
| tier-up cue | [kb] Each tier change needs its own instant cue (spark colour change + tick sound + small pop), because the player is looking at the road, not the HUD. | cue within one frame of the tier change |

## 3 · Camera
| item | finding | target |
|---|---|---|
| FOV kick | [src] SuperTuxKart's speed-camera patch: up to **+8°** FOV above 70 % of top speed, with a slight pull-back on boost. Wider FOV reads as faster (ArtsIT 2016 "perceived camera velocity" paper; f1technical thread). | [kb] base → top speed **+8–10°**, boost adds **+6–8°**, kick eases out in ~0.3 s |
| look-ahead | [kb] Aim the camera into the turn by the yaw rate and lateral slip so the exit is visible during a drift. | aim point shifts **2–5 m** laterally in a hard turn / drift |
| height / lag | [kb] Lower and slightly further back at speed (more ground flow in view). Chase lag 0.15–0.25 s. | height drops **≥ 0.6 m** from cruise to top speed; lag ≈ 0.17 s (k = 6/s) |
| speed lines | [kb] Start at ~70 % of top speed, peak with boost. Keep within the mission caps (speedFx ≤ 0.3 in story missions). | ≤ 0.3 opacity in missions |

## 4 · Impact: hit-stop, shake, slow-mo
| item | finding | target |
|---|---|---|
| hit-stop | [src] A 50–100 ms freeze on a heavy hit makes it feel connected; longer reads as lag (wayline.io game-feel lesson; bugnet hitstop guide). A user study found 0.1–0.2 s preferred for hit-stop and 0.2–0.4 s for slow-mo (SciTePress 2024). | **60–90 ms** on takedowns and big smashes, scaled by hit size; **off in split-screen** (one player's freeze must not stop the other's view) |
| sound sync | [src] Impact sound within ~12–15 ms of the visual (eastondev game-feel article). | sound fires on the impact frame, not after the freeze |
| shake budget | [src] "Juice it or lose it" (Jonasson & Purho, 2012) lists screen shake as one tool among tweening, squash-and-stretch, particles and sound; overuse muddies readability. | [kb] keep the bug-fix caps: shake ≤ 1.0 (decays 3/s), mission hitFx ≤ 0.3, flash ≤ 0.25, colour fringe (uCA) never above its base value of 0.035·hitFx + 0.02·flash |
| slow-mo | [src] Burnout 3 Impact Time / Aftertouch: slow-mo after a crash. | [kb] slow-mo stays for mission set pieces only; roam uses hit-stop instead |

## 5 · Reward rate
| item | finding | target |
|---|---|---|
| events per minute | [kb] Open-world arcade racers keep the player in a loop of small rewards; "fun redesign" in this repo targets *a snack every minute* and constant micro-feedback. | **≥ 12 feedback events / min** while driving in the city (studs, smash, near miss, drift tier, air, combo) |
| dead time | [kb] the brief | longest stretch with no feedback event **≤ 8 s** on a city drive |

## 6 · Smash feedback
| item | finding | target |
|---|---|---|
| brick spray / studs | [src] Much of the world is destructible: "smashed and crushed under your wheels" (Game Informer). | brick debris + stud fountain on every smash (already in base) |
| boost refill | [src] Smashing fills boost faster than the passive fill. | small props **+4 %**, traffic **+12 %** (base values kept) |
| sound | [kb] distinct brick-clack per hit, and a heavier crunch for big props | already in base |

## 7 · Landing, near miss, combo
| item | finding | target |
|---|---|---|
| landing | [kb] squash on landing (Jonasson & Purho: squash and stretch), dust puff, small shake scaled by impact; an air-time bonus above ~0.6 s of air | squash 15–25 % for ~0.2 s, bonus pop with air seconds |
| near miss | [src] Burnout: near misses, oncoming lanes and drifting earn boost. | near miss at **city speeds** (≥ 15 m/s, pass within ~4.5 m) with a boost payout |
| combo | [src] Burnout chains boost; [kb] one chain meter across smash, drift, near miss and air with a multiplier, and a big pop on cash-out | chain timer ~2.8 s, multiplier steps ×2/×3/×5, cash-out pop scaled by size |

## Sources
- racinggames.gg, LEGO 2K Drive beginners guide and drift guide: https://racinggames.gg/misc/lego-2k-drive-beginners-guide-5-essential-tips-and-tricks-you-need-to-know · https://racinggames.gg/misc/how-to-drift-in-lego-2k-drive
- Push Square, LEGO 2K Drive tips and tricks: https://www.pushsquare.com/guides/lego-2k-drive-tips-and-tricks-for-beginners
- GTPlanet review: https://www.gtplanet.net/?p=125445 · Game Informer review: https://gameinformer.com/review/lego-2k-drive/stud-your-engines
- LEGO 2K Drive PC manual: https://cdn.2kgames.com/manuals/legodrive/pc/2KGWIN_LEGO_2K_Drive_PC_Online_Manual_ENG.pdf
- Super Mario Wiki, Mini-Turbo (MK8DX durations from Nintendo's tutorial): https://www.mariowiki.com/Mini-Turbo
- Burnout 3: Takedown (Wikipedia; GameSpot feature preview): https://en.wikipedia.org/wiki/Burnout_3:_Takedown
- SuperTuxKart speed-lines/FOV patch thread: https://forum.supertuxkart.net/thread-200.html
- "Increasing the Perceived Camera Velocity in 3D Racing Games by Changing Camera Attributes", ArtsIT 2016: https://eudl.eu/doi/10.1007/978-3-319-55834-9_14
- Hit-stop / slow-mo duration study, SciTePress 2024: https://www.scitepress.org/Papers/2024/124614/124614.pdf
- wayline.io Game Feel & Juice lesson: https://www.wayline.io/learn/game-feel/1 · bugnet hitstop guide: https://bugnet.io/blog/how-to-fix-hitstop-or-freeze-frame-feeling-off
- eastondev, "Where does game feel come from": https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/
- Jonasson & Purho, "Juice it or lose it" (Nordic Game Jam 2012), summary: https://rpgplayground.com/research-making-a-juicy-game/
- Swink, *Game Feel* (2008); summary of polish and metrics chapters: https://lizengland.com/blog/review-game-feel-by-steve-swink/ · https://www.gamedeveloper.com/game-platforms/feature-game-feel---the-secret-ingredient-
