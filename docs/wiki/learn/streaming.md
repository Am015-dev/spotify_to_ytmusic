# Learn: on-demand streaming (fiveplay.lol io worker)
Source: https://fiveplay.lol/ web glue only (index.html module script, /b/8b0b5899ed/io_worker.js, loader.js, wgpu_worker.js), read 2026-10-24. A browser port of a large open-world game; game data, wasm and archives NOT inspected. Techniques below in our words.

## What it requests
- One dedicated **io worker** serves every file read of the engine threads. Threads post a request into a shared table (file id, offset, length, destination) and block; the worker fetches and copies the bytes in.
- Reads are **HTTP Range** requests on the original files (`Range: bytes=a-b`), cut into 4 KB store blocks; ranges closer than 64 blocks are merged into one request.
- Small compressible files (shader text, metadata, xml/json) are fetched **whole, server-compressed**: the engine reads them fully anyway.
- A recorded **boot read set** (~580-600 MB, same for every visitor) is fetched at page load in parallel with engine start-up, 32 range "lanes" at once. Batches of many tiny pieces go as one request whose answer is a static, CDN-cacheable file named by a hash of the request.
- Measured by them: one host stream gives a few hundred KB/s, so **speed = number in flight** (6 streams 3.4 MB/s, 64 = 7.1, 128 = 14.1 MB/s).

## Read-ahead hints
- The engine writes **hints** (reads it has queued but not issued) into a ring; the worker fetches them now, up to 96 in flight: ~3 reads/s became "as fast as the link".
- Two classes: queued reads (normal) and look-ahead at objects requested but not yet queued (low). Low ones run only while < 48 are in flight and with `fetch(..., {priority:'low'})`, because blocking reads once waited 6.6 s behind 32 prefetch streams.
- Sequential large reads double their read-ahead 64 KB -> 512 KB; random reads fetch only what they need (big blocks made boot download 25x larger).
- A demand read for blocks already in flight **joins** that fetch instead of refetching.

## Persistent store
- **OPFS** (`navigator.storage.getDirectory()` -> `createSyncAccessHandle()` inside the worker): `store.bin` is append-only; `journal.bin` maps (file, block) -> offset, written after the data is flushed. The journal header holds the manifest version; another version = start empty.
- Sync handles are exclusive per tab: on `pagehide` the page broadcasts "close" so a reload gets the store; a second tab falls back to a 48 MB memory cache.
- Why not Cache API / service worker: each response ArrayBuffer stayed alive until that worker's GC ran (~1.5 GB renderer memory, plus ~0.9 GB in the SW). Streaming chunks straight into OPFS avoids JS buffers. They now **delete** their old `gamedata*` Cache entries at boot.
- Save games/settings go to **IndexedDB** instead (shared across tabs, not versioned).

## Cache-busting
- Code under `/b/<build-id>/...` (the host rewrites the id at serve time): cached forever, a new build = new URLs.
- Data URLs carry `?v=<manifest version>`; the same URL always has the same bytes, so CDN may cache for ever. Their own fetches use `cache:'no-store'` because OPFS is the cache.
- 503/500/429 or no answer: retried up to 8 times with growing jittered waits (~20 s), only before any body byte was used.

## Progress
- Workers post `{pct,label}` and `{dl: bytes}` (every 400 ms) on a `BroadcastChannel('game-progress')`. The page shows MB and MB/s over a 3 s window; from 72 % the bar follows data bytes vs an expected 1.2 GB; between reports it creeps at most 6 points so it never looks frozen.
- Stall watchdog: 30 s with no message -> "device may be out of memory" text.

## What we have / gap
- We load `km.js`, `models.js`, `models/*.js`, `xc/*.js` as `<script>` tags (`src/10z_lazy.js:XC`, `src/98ld_stub.js`), whole files, no persistent cache, no hints. Plan: [../plan/open-world-streaming.md](../plan/open-world-streaming.md). Our streamer: [../game/render-and-perf.md](../game/render-and-perf.md).
