# HANDOFF W199: launch lag on PC (headless Chromium 1440x860, fresh cache, no service worker, 3 runs each, qa/launch-probe.js)

- Changes: art.js ART.load = fetch + createImageBitmap(blob) (decode off the main thread), start-up loads (ART.boot) capped at 8 in flight, the player's ship + first backdrop + shots first; later on-demand loads start at once.
  preload.js: bottom line #ldLine ("Loading art 34/120" -> "Ready", first text before 0.5 s) and a bar in the stage veil. head.html: the line's markup + css.
- Frame stalls > 50 ms in the first 20 s: before 9-11 (about 1200 ms stalled), after 2-4 (about 500 ms). Image requests in flight at once: up to 126 before, 51-71 after (rest is on-demand strips).
- NOT met: long-task total did not halve (before 322-447 ms, after 353-373 ms) and one task is still > 200 ms: the single ~350 ms task at t=60-110 ms is the parse of the one 2.3 MB inline script
  (an IIFE, so it cannot be cut into several scripts). Next step if wanted: an external .js file the service worker caches (V8 code cache) or minify.
- Note: a first, cold probe of the old build read 2990 ms of long tasks; warm re-runs of the same build read 320-450 ms. Compare only A/B runs of the same session.
