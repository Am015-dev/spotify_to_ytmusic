// PURPOSE: real bullet pictures (converted approved previews) for enemy orb/needle/shell/rocket and every player weapon; ?bulletart=0 = the old dots
// FLAG: none (always on)
// TEST: bulletart-test.js
/* ---------- bulletart.js (owner, 21 Oct 2026: "plain dots as bullets"). The pictures are media/fx-bullet-{needle,rocket,shell}.webp and fx-w-<weapon>-{bullet,hit,muzzle}.webp
   (96 px, alpha, converted from the approved 256 px previews; listed in media/ready.json). The draw sites already exist: ai.js / readable.js (needle, shell, rocket, rotated to travel direction),
   fxwave.js FXW.bullet (player shots by weapon id), readable.js orb (painted orb at full strength). This file only holds the switch: with RET.bulletart off the ids below read as "not there",
   so the old code shapes draw. Hitboxes are not touched (b.r / b.js stay). */
const BA=window.BA={own:n=>/^fx-bullet-(needle|rocket|shell)$/.test(n)||/^fx-w-[a-z]+-(bullet|hit|muzzle)$/.test(n)};
