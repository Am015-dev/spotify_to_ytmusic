# Animation sources (Windows pipeline output, not wired)

- `crown-city-smash/voltusk-{idle,attack}.webm`: Flow image-to-video clips with alpha (cut-out), `voltusk-idle-sheet.webp` frame sheet; `refs/`: the monster pictures used as video input.
- `mainhattan-nightrun/01-boss-sek-adler.webm`: MiniMax H3 take 1 of the Adler boss (does not loop yet: play forward then reversed, or wait for a loop take); `refs/`: boss pictures; `poses/`: attack/pose stills per boss used as video references (prompts in the json files; Kronos atk1-4 and Messe-Waechter atk1-4 not generated yet).

Wire into the games only after the owner approves a clip in the viewer (`anims.html`).
