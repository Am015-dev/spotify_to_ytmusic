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

## 9. Help kit (`gx-help.js` + `gx-help.css`): coach bubbles, lightbulb, rules cards
Help is **on demand** (the bulb) or **first time only** (a coach bubble), short, pointing at the board, and easy to switch off. Never an
advice card that appears on its own twice. Needs `gx-viewport.js` (relayout on rotation goes through `GXV.watch`; without it the kit
falls back to resize listeners). Everything the kit draws has `data-help` (phone-check skips those for the 8-word rule).

```js
GXH.init({ game: 'slug', defaultOn: true,                       // tips remembered per game: localStorage 'gxh-<slug>' {on, seen}
  steps: { bid: { target: () => document.querySelector('#hand'), title: 'Make a secret bid',      // title <= 4 words
                  text: 'Tap a card, then the glowing spot.', pic: () => svgString } },           // text <= 20 words, pic optional
  rules: [ { phase: 'bid', title: 'Bid in secret', text: '<= 20 words', pic: () => svgString }, // 2-4 cards per phase; no phase = general
           { title: 'The goal', text: '...', pic: () => '...' } ],
  avoid: '.glow,.rec,#act .btn' });                              // bubbles never cover the core (56px) of these, nor the target
GXH.phase(phaseId | null);        // call at the end of every render; first time a phase is reached its bubble shows (arrow + soft ring on the target,
                                  // title, one sentence, "Got it"); a tap anywhere dismisses (and still reaches what was tapped); one bubble at a time
GXH.bulb({ el: '#bulbbtn',        // an existing button (an SVG bulb is injected) or omit it for a floating bottom-right bulb
  suggest: () => ({ target: () => rect|el, from: () => rect|el /*card to pick up first*/, why: '<= 15 words' }) /* or null */,
  rulesFor: () => phaseId });     // tap: glowing ring + ghost finger (from -> target) + bubble with the why and "How does this work?" (rules cards)
GXH.setEnabled(bool); GXH.enabled(); GXH.reset(); GXH.rules(phaseId?); GXH.hide(); GXH.state();
GXH.settingsHTML({rowClass:'mrow', btnClass:'btn'})  // "Tips On/Off" + "Reset tips" rows (string); GXH.settingsRow() returns a node. Clicks are handled by the kit.
```
- A target is an element, a function returning one, `{left,top,width,height}` or `{x,y}`. A function is re-evaluated on every relayout.
- If `suggest()` returns null (no safe advice) the bulb shows only the rules cards: never a wrong hint. The suggestion must come from the
  game's real advice function; keep one `planFor(move)` that gives the target rect and use it for the ghost finger, the glow and the bulb.
- Bubble placement scans the screen for the free spot nearest the target that covers neither the target nor the core of any `avoid` element.

Add it to a game (about an hour):
1. `build.py`: `SRC['gx-viewport.js']`, `SRC['gx-help.js']` from `shell/`, inline the css after `shell.css` (`head.replace('</style>', rd(shell/gx-help.css)+'</style>', 1)`),
   and `<script src="gx-viewport.js"></script><script src="gx-help.js"></script>` in the body right after `shell.js`.
2. Add a bulb button to the top bar (`<button class="gx-ibtn gxh-bulb" id="bulbbtn" data-help type="button" aria-label="Hint"></button>`).
3. Write `hlp.js`: `phaseId()` (null when the player has nothing to decide), `steps` (one per phase, targets = the glowing things), `rules` (2-4 cards per phase,
   pictures from the game's art or small SVG), `suggest()` from the advice function, then `GXH.init(...)`, `GXH.bulb(...)` once and `GXH.phase(phaseId())` after every render.
4. Add `GXH.settingsHTML()` to the menu. Remove any old Hint button and auto advice cards.
5. Sweep: copy the "help kit checks" block of `thornbound/game/sweep.js` (bubble per phase appears once, never covers target/glow, dismisses on tap; bulb finger = advice
   function, why <= 15 words, rules 2-4 cards <= 20 words with a picture; tips-off game shows nothing) and the bubble geometry check in `checks()`.
Pilot: Thornbound (`thornbound/game/src/ui11.js`).

## 10. Tutorial kit (`gx-tutor.js` + `gx-tutor.css`): a staged game that teaches every rule by doing it once
One staged game per game, ~12-20 steps, 3-6 minutes: each step spotlights ONE thing (everything else is dimmed and eats taps), a bubble with an arrow says
one short thing, and the step moves on only when the player does exactly that. Reuses the help kit's bubble look (`gx-help.css`), so load both css files.
Needs `gx-viewport.js` (bubbles are re-placed after a rotation through `GXV.watch`). Everything the kit draws has `data-help`.

```js
GXT.start({ game: 'slug',
  setup: () => { /* build the FIXED staged game: seed, deck, dice, hands; start it behind the kit */ },
  steps: [ { id: 'bid1', title: 'Bid in secret',                   // title <= 4 words (optional)
             say: 'Tap your 5 to pick it.',                        // <= 20 words, or () => string for numbers read from the engine
             target: () => el | {left,top,width,height} | {x,y},   // the spotlight (a function: it is re-read on every relayout and every 100 ms)
             also: () => el | [el],                                // more spotlights that stay live (e.g. the card to drag)
             wait: { type: 'tap'|'drag'|'event', match: a => bool, times: 2 } | null,   // null = a "Next" button; times = taps needed (default 1)
             from: () => el,                                       // drag steps: where the ghost finger starts
             ready: () => bool,                                    // the game has reached this state (default: the target exists); polled, the step waits (never guess with timers)
             onEnter: () => {}, onNext: () => {}, ai: () => void | Promise,   // scripted computer move; onNext = what Next does (e.g. close the event card)
             side: 'top'|'bottom', wrong: 'Tap the glowing one.', pending: 'Watch the board' } ],
  onDone: ({choice}) => {},     // choice 'play' | 'story' from the end card ("You know the rules": Play a real game / Story mode)
  onExit: () => {},             // Skip tutorial
  story: true, endTitle, endText });
GXT.act({type:'tap'|'drag'|'event', ...game fields})   // returns true = go on, false = not what this step asks (ignore the action)
GXT.active() GXT.current() GXT.state() GXT.skip() GXT.stop() GXT.lint(steps)
GXT.menuHTML({game, first: isFirstVisit, cls: 'btn', launch: startTutorial})   // the menu entry, see below
GXT.status(game) GXT.isDone(game) GXT.markDone(game) GXT.reset(game)
```
How a step runs: the game reaches the state (`ready()`), the rects settle for ~200 ms, then the spotlight appears (cells around the hole eat taps; a tap there shakes the
bubble and shows "Tap the glowing one."), the ghost finger shows the tap (or the drag from `from`), the bubble sits where it covers no spotlight. The game's input
handlers call `GXT.act(action)` BEFORE applying the action and stop when it returns false; `match(action)` says whether it is the asked action. Between steps a
transparent shield blocks input while the game moves on (a "Watch the board" pill after ~1 s). Top strip: progress dots with "n/N" and "Skip tutorial".
Rotation: re-placed through `GXV.watch`; spotlight geometry is re-read, so a target that moves (hand re-fan, map relayout) is followed.
- Pause long events for a Next step in the game, not in the kit: a card that auto-advances (clash result, round summary, bid reveal) must not advance while the
  current step holds it. Give such steps a `hold: c => bool` of your own and check `GXT.current().hold` when the auto-advance timer FIRES (not when it starts).
  `onNext` then closes the card.
- Programmatic moves of the game (skipping a season with nothing to use) must not go through `GXT.act`: set a flag around them.
- A tap is often two actions (select a card, then a region). Teach the first pair as two steps, then pre-select the card in `ready()` so later steps need one tap.
- A hand of overlapping cards: aim the spotlight at the card's visible strip, or the tap lands on the neighbour.
- Progress is `localStorage['gxt-<game>']` = `{done, open, step}`. Done -> the menu shows "Tutorial ✓". A reload mid-way -> the menu entry opens "Restart or Exit".
- Do not save the staged game as a normal game, and keep the game's own help bubbles/bulb quiet while `GXT.active()` (the help kit checks `tutOn()` in Thornbound).
Menu helper (put it in the title menu, the setup screen and the in-game menu; it is a `<button data-gxt-open>` with `<b>` + `<span>`, click handled by the kit):
first visit -> "New here? Learn in 5 minutes" as the FIRST option; afterwards "Tutorial"; when done "Tutorial ✓"; half done "Tutorial (continue?)".
Pass `first` yourself (`firstTime()`), `launch` = the function that calls `GXT.start`.

Add a tutorial to a game (about two hours):
1. `build.py`: `SRC['gx-tutor.js']` from `shell/`, inline `gx-tutor.css` after `gx-help.css`, `<script src="gx-tutor.js"></script>` after `gx-help.js`. Needs gx-viewport and gx-help.
2. Add a staged mode to the game (fixed seed, scripted computer, usually ONE round or one short scenario: add a 1-round length to the engine if it has none) that is never saved.
3. Write `tutor.js`: `tutSteps()` in the order the rules come up (goal and board, then each phase once: choose, reveal, place, special piece, conflict, scoring, end), a scripted computer (override the AI
   pick for the seat in this mode), `tutStart()` = `GXT.start({...})`, wrappers around the game's input functions that call `GXT.act`, hold hooks for auto-advancing cards, `tutOn()`.
4. Menu: `GXT.menuHTML` in the title (first option on a first visit), setup and in-game menu. Replace any old guided-first-game button and coach pop-ups.
5. `tutor-test.js` (copy `thornbound/game/tutor-test.js`): does exactly what each step asks at 390x763 and 375x553 (+ a rotation and a leave-and-return run), checks short text, spotlight visible and not covered,
   bubble inside the screen and off the spotlight, wrong taps do not advance and shake the bubble, the end card, "Tutorial ✓", no page errors, nothing stuck > 8 s. LOOK at the screenshots.
Pilot: Thornbound (`thornbound/game/src/ui12.js`, 19 steps, ~5 minutes).

## Checklist per game
1. build.py + head + body (section 0).
2. `GX.settings({...})` replaces the old menu; delete Speed tool buttons; `AIDELAY = GX.aiDelay(base)`.
3. `GX.applyPrefs()` after `GA.init`; colour-blind marks on player-coloured pieces.
4. `GX.reference(...)` from the game's data + a "Read it big" button on card pop-ups.
5. Undo in `act()`; an Undo button where the player decides.
6. Recap: push in the AI step, mark in `act()`.
7. `GNS.achievements` at boot, `GNS.result` on game over, `GNS.saved` in save/clear.
8. `GX.offline()` at boot.
9. Help kit (section 9): bulb, first-time bubbles, Tips switch.
10. Run the game's click / layout tests and `kit-test.js`; look at the screenshots.
