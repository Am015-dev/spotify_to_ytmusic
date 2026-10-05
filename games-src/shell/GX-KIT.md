# GX kit: shared settings, reference, undo, recap, results and offline

`gx-kit.js` + `gx-kit.css` add opt-in parts to the board-first shell (`shell.js`, `SPEC.md`). Nothing changes for a
game until it calls them; every existing `GX` call behaves as before (`test/kit-test.js` checks this). Pilot:
Hollowbough (`hollowbough/game/src/ui8.js`, published as the preview `games/hollowbough-next/`). Budget: under an
hour per game for 1–6, plus the game's own data for the reference.

Tests: `node games-src/shell/test/kit-test.js` (jsdom, 30 tests). Needs jsdom in `games-src/node_modules`.

## 0. Include it (build.py, head, body)

```python
# build.py
SRC['gx-kit.js'] = os.path.join(SP, 'shell', 'gx-kit.js')
ORDER = ['shell.js', 'gx-kit.js', ...]            # right after shell.js, before the game's own scripts
h = rd(os.path.join(D, 'head.html')).replace('/*SHELL_CSS*/', rd(os.path.join(SP, 'shell', 'shell.css')) + '\n' + rd(os.path.join(SP, 'shell', 'gx-kit.css')))
```
```html
<script src="shell.js"></script>
<script src="gx-kit.js"></script>
```
Pitfalls:
- `shell.js` declares `const GX` (a global lexical binding). The kit extends **that** object and also sets `window.GX`
  to it. Never write `var GX` or `window.GX = {...}` in a game.
- Load the kit after `shell.js` and call the kit after `GX.init(...)`.
- Your own `GX.onShow = ...` keeps working; the kit uses `GX.beforeShow(fn)` internally.

## 1. Shared settings (`gns-prefs`) and the Menu

Stored once for the whole shelf as `localStorage['gns-prefs']`:
`{master, music, sfx, anim:'slow'|'normal'|'fast'|'off', ai:'slow'|'normal'|'fast', text:0.9|1|1.15|1.3, cb, lefty, reduce, haptics}`.

```js
GX.settings({
  id: 'setd',               // reuse your existing bar button data-gx="setd" (default 'gx-setd')
  title: 'Menu',
  game:  S => S.appendChild(GX.row('This game', [newBtn, saveBtn, loadBtn])),
  sound: S => S.appendChild(GX.row('Sound', GX.onoff(on, v => setSound(v)))),   // optional extra rows
  speed: S => {}, help: S => S.appendChild(GX.row('Read', [rulesBtn, cardsBtn])),
  graphics: S => S.appendChild(GX.row('Graphics', GX.seg([['auto','Auto'],['high','High'],['low','Low']], level, setLevel))),
  about: { name: 'My Game', version: '1.2', text: 'Credits line.' },
  shelf: '../'              // where credits.html / privacy.html / terms.html live (default '../')
});
GX.renderSettings();         // re-draw while it is open (do NOT call it from your render loop: it would reset sliders)
```
Sections are always **Game · Sound · Speed · Help · Graphics · Accessibility · About** (empty ones are skipped).
The kit fills Sound (master/music/effects sliders, vibration), Speed (animations, computer players),
Accessibility (text size, colour-blind help, left-handed, reduce motion) and About (credits, privacy, terms,
all cards on the shelf). Developer tools ("Show speed", "Test speed", "Copy report") appear only with `?dev=1`:
delete your own "Speed tool" buttons.

Helpers: `GX.row(label, kids, hint)`, `GX.seg([[value,label]...], current, onPick)`, `GX.onoff(on, set)`,
`GX.slider(0..1, set)`.

Reading the settings:
```js
AIDELAY = GX.aiDelay(650);                        // slow ×2, fast ×0.25
GX.onPref((k, v, all) => { if (k === 'ai') AIDELAY = GX.aiDelay(650); if (k === 'cb') render(); });
const ms = GX.animMs(400);                         // 0 when animations are off or motion is reduced
if (GX.reduced()) skipTheFlight();
GX.buzz(15);                                       // navigator.vibrate when supported and "Vibration" is on
```
- **Volume** goes to `gameaudio.js` by itself (`GA.setVolume('master'|'music'|'sfx')`). After `GA.init(...)` call
  `GX.applyPrefs()` once so the shared levels win over the game's old per-game ones. Keep your own sound on/off.
- **Text size**: the kit scales `.gx-dock-body`, `.gx-drawer-body`, the recap strip and anything with class `gx-tx`
  by `var(--gx-text)`. Size other text with `calc(14px * var(--gx-text,1))` where it matters.
- **Colour-blind help**: `html.cb` is set. Put `<i class="gx-cbm">${GX.mark(seat)}</i>` next to every
  colour-coded piece (it is only shown with `html.cb`), or style `html.cb .piece` with patterns.
- **Left-handed**: `html.lefty` moves the dock and the drawers to the left on wide screens. Flip your own button
  rows on phones: `html.lefty #acts{flex-direction:row-reverse}`.
- **Reduce motion / animations off**: `html.gx-reduce` / `html.gx-noanim` shorten CSS transitions; JS
  animations must ask `GX.animMs()`.

## 2. Component reference drawer

Data format (JSON-safe, so `node` can read it for the shelf-wide `games/reference.html`):
```js
[{ id: 'cards', title: 'Cards', items: [
   { id: 'c12', name: 'Twig Barge', count: 3, text: 'Gain 2 twigs.', tags: ['Production', 'Construction'],
     meta: 'Costs 1 twig · 1 point', extra: 'Longer help shown in the big view', pic: { card: 34 } } ] }, ...]
```
```js
GX.reference(sections, {
  title: 'Cards & places', label: 'Cards',                 // top-bar button label (keep it short)
  picture: (item, big) => cardEl(item.pic.card, big ? 200 : 52),   // Node, SVG/HTML string or image URL; null = no picture
  inGame: item => isOnTheTable(item),                      // optional "In this game" chip
  before: '[data-gx="logd"]'                               // optional: put the button before this bar button
});
GX.refOpen('c12');                                         // open straight at one item (e.g. "Read it big" on a card pop-up)
```
Search matches name, text, tags and meta (all words). Section chips + up to 14 tag chips (AND). Tap an item for
the big view with ‹ › (and arrow keys). Phones get the shell's bottom sheet, desktops the side drawer.
Put the data builder in its own file (`src/refdata.js` in Hollowbough) that works in node and the page.
Pitfall: item ids must be unique across sections; don't use the original game's role keys as ids.

## 3. Undo

```js
GX.undo.config({
  get: () => G,
  set: s => { G = s; clearTransientUI(); save(); render(); schedule(); },
  owner: g => g.phase === 'over' ? null : actorOf(g),   // seat whose decision it is
  online: () => NET.on, allowOnline: false,             // off online unless you can undo on the host safely
  onChange: can => renderButtons()
});
// in act(m), for a local human:
GX.undo.snap(m.label);              // BEFORE applying
const r = apply(G, m);
if (!r.ok) GX.undo.drop();          // refused: forget the snapshot
else GX.undo.check((before, now) => now.deck.length !== before.deck.length || now.rng !== before.rng);  // reveal => sealed
// a button: if (GX.undo.can()) show <button data-a="undo"> -> GX.undo.undo()
GX.undo.seal('confirm');            // when the player confirms (e.g. "End turn"), or any time the game knows better
GX.undo.clear();                    // new game, load, game over
```
`check()` seals by itself when `owner` changes (the turn passed). The state must be JSON (it is in every game).
Pitfalls: snapshot only local human moves (never in `aiStep`); drop queued UI items that belong to the undone
step (Hollowbough filters `UI.after` by log number); a random number drawn or a card revealed must seal.

## 4. "Since your last turn" strip

```js
GX.recap.attach('#dockbody', { before: true, title: 'Since your turn' });   // once at boot
GX.recap.seats(humanSeats);          // new game / load (hot-seat: every human seat gets its own summary)
// after a computer (or other player) move:
GX.recap.push(logLinesOfThatMove, actorSeat);
// when a human decides:
GX.recap.mark(seat);                 // their summary starts again
GX.recap.view(viewSeat);             // in render(): whose summary is shown (hot-seat)
GX.recap.clear();                    // new game
```
One line collapsed (count + last line), tap to expand, × to dismiss. Online clients do not see it yet unless the
game pushes the host's log lines to them.

## 5. Results, statistics and achievements (`GNS`)

```js
GNS.achievements('hollowbough', [                 // shelf id, same as games/index.html GAMES[].id
  { id: 'win', name: 'Top of the tree', how: 'Beat the computer players.', test: r => r.won && r.mode === 'vs' },
  { id: 'sixty', name: 'Bustling burrow', how: 'Score 60 or more.', test: r => r.score >= 60 },
  { id: 'full', name: 'Fifteen roofs', how: '15 cards in your city.', test: (r, stats, raw) => raw.extra.city >= 15 } ]);
// on game over, once (skip it when nobody local played):
const res = GNS.result({ game: 'hollowbough', mode: 'vs'|'solo'|'hot'|'guided'|'online', level: 'hard',
  seats: [{ name: 'You', me: true }, { name: 'Fern', ai: 'normal' }], winner: 0 /* seat, [seats] or -1 */,
  scores: [52, 45], turns: 70, ms: 600000, extra: { city: 15 } });
res.earned   // new achievements -> show them on the end screen
GNS.saved('hollowbough', true|false);              // in save() / clearSave(): feeds the shelf's Continue row
```
Stored as `gns-results` (last 200), `gns-stats`, `gns-ach`, `gns-achdef`, `gns-saves`. The shelf home shows the
Continue row and **Stats & achievements** next to the trophies. Pitfalls: `me` decides "won" (hot-seat counts as
played, not won); call `GNS.achievements` at boot so the shelf can list achievements before the first win;
also add the game's save key to `SAVEKEYS` in `games/index.html` if it never calls `GNS.saved`.

## 6. Offline and "a new version is ready"

```js
GX.offline({ sw: '../sw.js', scope: '../' });     // at boot; no-op on file:// and in jsdom
```
Registers the shelf's service worker and shows **"A new version is ready — tap to reload"** when `sw.js` reports
that this page's stored copy changed, or a new worker takes over. Add the game's slug to `SLUGS` in `games/sw.js`
when it ships (then it can be downloaded for offline play on the Saves page), and its save-key prefix to
`PREFIX` in `games/sync.html`.

## 7. Legal pages

`games/credits.html`, `privacy.html`, `terms.html` are generated: `python3 games-src/legal/gen.py`. The Menu's
About section links them. When a game adds a library, font or a non-CC0 sound, add it to `gen.py` and re-run.

## 8. Viewport relayout (`gx-viewport.js`)
Inline `shell/gx-viewport.js` before the game script, then replace every resize / orientationchange / ResizeObserver handler with one call:
`GXV.watch(m => { applyPhone(); if (G && UI.started) render(); })`. `m = {w, h, safe, key}` is measured from a fixed full-screen probe,
not innerWidth/innerHeight; fn runs only when the key changes, debounced at 40/120/420 ms, and once at once on `watch`.
Read sizes in the layout function from `GXV.now()`. `GXV.poke()` forces a relayout. Never add a second resize listener.

## Checklist per game
1. build.py + head + body (section 0).
2. `GX.settings({...})` replaces the old menu; delete Speed tool buttons; `AIDELAY = GX.aiDelay(base)`.
3. `GX.applyPrefs()` after `GA.init`; colour-blind marks on player-coloured pieces.
4. `GX.reference(...)` from the game's data + a "Read it big" button on card pop-ups.
5. Undo in `act()`; an Undo button where the player decides.
6. Recap: push in the AI step, mark in `act()`.
7. `GNS.achievements` at boot, `GNS.result` on game over, `GNS.saved` in save/clear.
8. `GX.offline()` at boot.
9. Run the game's click / layout tests and `kit-test.js`; look at the screenshots.
