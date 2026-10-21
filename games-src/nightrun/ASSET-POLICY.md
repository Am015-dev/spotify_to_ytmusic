# Asset policy (owner, 21 Oct 2026)

- Nobody on the team creates new art assets (no generated, drawn or procedurally painted pictures: no new sprites, backgrounds, icons, rings made to look like art).
- What is missing gets a PLACEHOLDER only: a plain flat shape (triangle, circle, box) with the asset id as its label, plus a line in an ASSETS-NEEDED file with the id, size, frames, facing and a Flow prompt, so the owner generates it in a wave.
- Allowed: recolouring / tinting / scaling / flipping / re-timing existing approved assets (bullets, explosions, enemy stand-ins), removing visual noise, moving or resizing UI.
- Not allowed: composing a new background, new character, new prop or new icon in code to replace a missing asset.
- When real art arrives (assets-inbox/, ingest-assets.py), it replaces the placeholder automatically through the existing ART.pic / ART.anim fallbacks.
