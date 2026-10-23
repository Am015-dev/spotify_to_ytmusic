# W157: street balance (23 Oct 2026, streetsim)

streetsim table before -> after (50 runs per bot, same seeds):

| bot | cleared | hearts lost/run | cover blocks/run | ducked shots/run | threat peak |
|---|---|---|---|---|---|
| nearest | 44% -> 4% | 14.4 -> 8.9 | 0.1 -> 0.9 | 0.0 -> 0.0 | 84.8 -> 86.7% |
| gfirst | 52% -> 50% | 15.8 -> 13.2 | 0.1 -> 1.4 | 0.5 -> 0.5 | 88.6 -> 86.7% |
| dodge | 88% -> 80% | 13.3 -> 9.3 | 0.1 -> 3.5 | 0.0 -> 3.5 | 91.1 -> 85.4% |

All streetsim gates PASS (new: best bot 60-80%, gunner-first >= nearest-first + 15 points, ducking >= 2 and cover >= 2 per run for the dodge bot, peak 82-88%). dodge sits ON the 80% edge.

What changed (streethard.js, all behind RET.streethard): gunner shots are big head-high slugs (SLUGR 26, y 389): only a duck avoids them (the jump hop of the bots does not), crates block them (a slug's radius counts), Kai within HUG 90 px of a crate is covered even by the gunner's own crate; a covered crate every COVERGAP 250 px up to 900 px before the boss (was one per ~750 px); rusher hp x1.7 (6 pistol shots), gunner x2.2, GMAX 1, calls from 65 s to 135 s every 5 s (first after 2 s), no extra heart, threat peak wave 7.4 at 130 s. streetsim.js: new gates, DBG= (page hook) and LIST=1 (stuck runs) options.

OPEN (why the old tests fail, not changed because their bot is the 'nearest' bot): street3-test (a)(b) need a cleared run from the nearest-first bot (now 4%, 2/50) and streethard-test (a)(c)(d) use old limits (gunner ttk 6.1, decent bot clears 0/8). Next: lift nearest-first to 20-30% without lifting dodge past 80% (ideas: a heal when 2 hearts down every 6 s; this lifted nearest only to 10%), or update those tests to the gfirst/dodge bots. The nearest bot also leaves 30 lingering foes (gunners behind the new crates). Rusher hp 1.6 -> 1.7 is a cliff (5 -> 6 pistol shots): dodge 86 -> 74-84%.
