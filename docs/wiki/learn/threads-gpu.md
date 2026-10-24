# Learn: threads, GPU worker, shader packs, COOP/COEP (fiveplay.lol)
Source: https://fiveplay.lol/ index.html, /b/8b0b5899ed/loader.js, wgpu_worker.js, response headers, read 2026-10-24 (web glue only).

## Their layout
- Page owns only the `<canvas>`: `canvas.transferControlToOffscreen()` -> posted to `loader.js` (engine "main thread" worker) -> on to a **GPU worker** that owns the WebGPU device. The page keeps title screen, input, audio worklet.
- Engine threads never call WebGPU: they write commands into a **ring buffer in shared memory**; the GPU worker drains it on its own event loop. Results (readback, queries) come back through a fence word the thread waits on with `Atomics.wait`.
- Status between threads: `BroadcastChannel`s (`game-progress`, `game-fps`, `game-crash`, `game-log`, `game-io`).
- Headers seen: `cross-origin-opener-policy: same-origin`, `cross-origin-embedder-policy: credentialless`, `cross-origin-resource-policy: cross-origin`. Without `crossOriginIsolated` the page refuses to start (it needs SharedArrayBuffer).
- Windows Chrome rounds short waits up to 15.6 ms; an empty `setInterval(()=>{},1)` on the page switches it to a fine timer (1 ms wait: 15.5 ms -> 2.1 ms).

## Shader packs and prewarm
- ~6,000 shaders per session were one request each (minutes on a far host). Now **packs of ~4 MB grouped by effect** + `index.json` (pack, offset, sizes): ~20 requests. A pack is dropped from memory 8 s after last use (~70 MB if all stayed).
- Pipelines are keyed by **recipe** (shader hashes, vertex layout, topology, blend/depth/raster state, target formats). Recipes seen are saved per browser in **IndexedDB** every 20 s, plus a shipped seed `pipelines.json`. While loading, recipes whose shaders arrived are **compiled ahead**, 2-8 at a time (cores - 1); a draw with the same recipe uses it at once.
- A draw whose pipeline is still compiling is **skipped**, not stalled; the title screen stays until 1.5 s pass with no skipped draw (max 60 s). First view needed a few hundred pipelines; before this, 28,000 draws/s were skipped (white holes).

## Feasible for us
| Technique | Needs isolation? | Claude artifact page | GitHub Pages |
|---|---|---|---|
| OffscreenCanvas + WebGL in a worker | no | likely (probe first) | yes |
| Workers + postMessage/transferables | no | yes | yes |
| SharedArrayBuffer, Atomics.wait | **yes** | no | only via SW trick |
| OPFS sync handle (in a worker) | no | probe (sandboxed origin) | yes |
| IndexedDB / Cache API | no | yes, may be empty (private mode) | yes |
| `fetch` priority hints | no | yes | yes |
| Packs / prewarm keyed by recipe | no | yes | yes |

- **Headers**: neither host lets us set COOP/COEP. The artifact is served by claude.ai in a sandboxed frame; GitHub Pages has no custom headers (fixed `max-age=600`). The known workaround is a service worker that re-serves the page with COOP/COEP after one reload (coi-serviceworker, MIT). It can work on GitHub Pages; inside the artifact frame the parent is not isolated, so treat it as **not available**.
- **Without isolation** we still get: render in an OffscreenCanvas worker (three.js supports it; iOS Safari has OffscreenCanvas WebGL since 16.4), workers that build geometry and post back transferable ArrayBuffers (zero copy), OPFS/IndexedDB caches, packed shader warm-up. We lose shared-memory threads and `measureUserAgentSpecificMemory`.
- Our renderer runs on the main thread; warm-up is `src/98bp_warmall.js` (renderer.compile with all objects visible). See [../game/render-and-perf.md](../game/render-and-perf.md), plan [../plan/open-world-streaming.md](../plan/open-world-streaming.md).
