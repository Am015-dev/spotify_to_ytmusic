# Board-first layout: spec for every game on the shelf

User complaint (verbatim): "user needs to scroll around and some texts overlap with the board … maybe more interactive so we have the full game board and pop up that can close, please find optimal solution for all games".

## The rules (all must hold at 1366×768, 1920×1080, 768×1024 and 390×844, and inside the shelf's iframe, which is the viewport minus ~46px)

1. **The page never scrolls.** `document.documentElement.scrollHeight <= innerHeight` and `scrollWidth <= innerWidth`, on the start screen too and during play. Only inner panels may scroll (the dock body, popup bodies, a hand-of-cards strip scrolling sideways).
2. **The whole board is visible.** The board (3D canvas or table area) fills `.gx-board`, which is the space left after the top bar and the dock. The canvas is sized to BOTH the width and height of `.gx-board` (not width × fixed ratio). Fit the 3D camera so the full mat/arena/table is in view for that aspect ratio (portrait phones included).
3. **No text covers the board**, except small labels anchored to board objects (name plates over monsters/ships, tile labels) and at most one compact status chip in a board corner. Every other overlay that currently sits on the board (choice modals, tour boxes, dice trays, story cards, round banners, prompt boxes, HUD panels) moves into the **dock** or into the **top bar**.
4. **One dock** holds "what to do now": the step indicator, the current prompt/question with its option buttons, and the primary action buttons (Roll, End turn, Start the day…). On wide screens (≥1000px) it is a right column (`--gx-dock-w`), on narrow screens a sheet under the board. It is in flow, so it never overlaps the board; the board shrinks instead. A collapse button (`data-gx="dock"`) hides it (desktop) or shrinks it to its header (phone, `data-gx="sheet"` cycles min / normal / full). When the game needs a decision from a human, call `GX.showDock()` so the question is never hidden.
5. **Everything else is a popup that can close**: logs/diaries, card lists/shops/market, player boards and hands of opponents, squads, camp/character sheets, rules, card reference. Use `GX.drawer(id,title,bodyEl,wide)` once at boot to wrap the existing element (keep its id so the game's existing render code still writes into it) and add a toolbar button `<button class="gx-ibtn" data-gx="ID">📜 Log</button>` in the top bar (on phones the bar scrolls sideways; keep labels short, icons first). Popups close with ✕, Esc and a tap on the backdrop (the shell does this). Existing modal dialogs that are *not* in-game choices (start screen, rules, game over) may stay as they are, but must fit the viewport (their own inner scroll, `max-height:calc(100dvh - 32px)`).
6. **Nothing important lost**: every piece of information and every button that exists now must still be reachable (in the dock, the bar, or a popup). Things a player needs every turn (their own resources/hand, what is for sale, whose turn) should be visible without opening a popup — put compact versions in the dock or the bar; the full view can be a popup.
7. Keep each game's own look (colours, fonts, art). Theme the shell with the `--gx-*` CSS variables. Touch targets ≥ 40px. Keyboard and screen-reader behaviour must not regress.

## The shell (shared files — copy them into your game folder, do not edit the originals)

`games-src/shell/shell.css` and `shell.js`. Inline them in the build (add to build.py like the other files). Markup:

```html
<div class="gx-app">
  <header class="gx-bar"> title … <span class="gx-sp"></span> toolbar buttons (data-gx="drawerId") … </header>
  <div class="gx-main">
    <main class="gx-board"> the board (canvas / table) </main>
    <aside class="gx-dock"><div class="gx-dock-head"><span class="gx-grab" data-gx="sheet"></span><span class="gx-dt">title</span><button class="gx-ibtn" data-gx="dock" aria-label="Hide panel">⇥</button></div><div class="gx-dock-body"> prompt… </div></aside>
    <button class="gx-ibtn gx-reopen" data-gx="dock">☰ Panel</button>
  </div>
</div>
```
JS: `GX.init({key:'<game prefix>'})` at boot; `GX.onResize((w,h)=>…)` to resize the renderer/camera; `GX.drawer(...)`, `GX.show(id)`, `GX.close()`, `GX.showDock()`.

## Done means (prove each with a script and screenshots, then report numbers)

- A Playwright script (use `PW=$(npm root -g)/playwright`, launch args `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`) that, at the 4 viewport sizes, loads the start screen, starts a game against the computer, plays a few turns through the real buttons, opens and closes every popup (✕ and Esc), and asserts: no page scroll, canvas/board rect fully inside the viewport and not covered (use `document.elementFromPoint` at a 5×5 grid of points over the board: every hit must be the board canvas/table or an anchored label), dock visible when a human decision is pending, no console errors.
- Screenshots at every size (start, mid-turn, a choice pending, a popup open) — look at them yourself and fix what looks wrong (clipped text, overlapping, tiny board).
- The game's existing automated tests (gauntlet / rules / click tests in its folder) still pass; update the click tests if selectors moved.
- Rebuild the game's html with its build.py. Do NOT copy into the suite or the repo, do NOT publish, do NOT commit — the lead does that.
- Report back briefly: what moved where, the measured numbers, anything you could not solve.
