# Learn: low-memory phone profile (fiveplay.lol)
Source: https://fiveplay.lol/ index.html module script, read 2026-10-24 (web glue only). Their numbers, our words.

## Trigger
- `navigator.deviceMemory <= 4` (browsers report 4 for 4 GB and less), or `?low=1`; `?low=0` forbids it. Safari has no `deviceMemory` -> for iPhone we must use our own UA/tier test.
- A banner tells the user it is a low-memory device and to close other tabs.

## Settings (all at once)
- **Threads**: pretend 2 cores -> 54 workers instead of 80-116 (each Web Worker costs ~20 MB). Normal profile caps at 4 cores.
- **Textures**: quality 0 = top mip skipped on the GPU -> a quarter of texture memory.
- **Shadows off** (a level below the menu's lowest; `?shadows=1` keeps the lowest). The cascade shadow pass was about a third of all draws (600-900 of 1,300-2,900 per frame), and a 4-core Chromebook spent ~110 us per draw.
- Minimum ped/vehicle **variety**, city **density** 0, LOD scale 0, reflections/particles/grass 0, no network stack.
- **Back buffer cap** 2560x1440 (vs 3840x2160): screen-sized render targets dominate GPU memory. `?scale=0.75` renders at 75 %.
- Script log channels below warning are off (formatting them was ~87 % of log lines in play).

## Measured result (theirs, Node run at the world)
- GPU memory **1.16 GB -> 0.5 GB**; streamed assets **1.38 GB -> 0.95 GB**.
- With `?log=1`, low profile also posts `performance.measureUserAgentSpecificMemory()` every 15 s so the last reading before a crash is in the log (needs cross-origin isolation).

## Crash honesty
- Engine crashes come back on a `BroadcastChannel('game-crash')`; text matching memory/OOM shows "this looks like a lack of memory: close other tabs and reload". A stall of 30 s with no progress says the same. A dead tab ("Aw, Snap!") cannot report, so the hint is shown up front.

## Lessons for us
- One switch, many knobs: thread count, texture mip skip, shadows, density, render size, measured as a pair (GPU MB, streamed MB).
- Draw count is the phone cost: kill the pass that is a third of draws first.
- Count workers: if we add workers, budget ~20 MB each on iPhone.
- What we have: tiers `src/98gt_gfxtier.js:GFX_detect` (0 = phone), compaction `src/98pc_compact.js`, budgets `src/98rb_roam_budget.js`. Gap: no memory number per tier, no texture mip skip, no crash/OOM hint. Plan: [../plan/open-world-streaming.md](../plan/open-world-streaming.md).
