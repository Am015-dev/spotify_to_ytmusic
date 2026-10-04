# ATC: Athens campaign "Drakos' Akropolis"

## What changed
- **`atc.js`** (one module, inserted by `pATC1.py` with a single anchor): the 3-chapter Athens campaign against Thanos Drakos from `docs/fun_redesign.md` §3.4. It is built on m1.js, so the missions are `M1_DEF` entries that reuse the M1 scene, goon, checkpoint, rival and stage system. All UI text is in English. The characters are Greek: Eleni (mentor), Yiayia Froso, Kyria Maria, rivals Yiannis Pappas and Katerina Lambrou, Spiros the moped gang leader, and Drakos.

| Ch | Mission 1 | Mission 2 | Mission 3 | Rival race | Reward |
|---|---|---|---|---|---|
| 1 Kalos irthes | Koulouri Rush (Monastiraki → Plaka/Koukaki van chase) | Moped Swarm (Ermou, 12 mopeds + Spiros) | Acropolis Climb (Dionysiou Areopagitou under the Parthenon, Plaka drift) | Pappas, Historic Centre | **Ghost** charge at each mission start, ITEM button on |
| 2 Ta stena | The Stolen Amphora (Acropolis Museum → **gate A→B** → Benaki Museum) | Beat the Metro (Syntagma → **gate B→A** → Omonia; the metro is a visible rival train) | King of Lycabettus (hold the summit zone 60 s, then the lieutenant) | Lambrou, Vasilissis Sofias | **Magnet**: item boxes fly to you in missions |
| 3 O Drakos | Blackout at Syntagma (4 generators, riot, lieutenant) | Kifisias Convoy (tail up Kifisias from Athens Tower → **gate C→D** → Chalandri) | Taverna Night (Plaka chain, drift show) | **Finale: Drakos** from the Panathenaic Stadium and back | Akropolis Cup, `DRAKOS` flag (his car), studs |

- **How the campaign works with the 4 districts:** each stage is tagged with its district. A mission either stays inside one district or contains an `atcGate` stage. That stage targets the real DRIVE TO gate (taken from `HUB.gates`, the nearest one towards the next stage) and shows a ring there. When the car reaches the gate, the mission state (stage, time, HP, item) is saved to the `mho_atc` store and `athDistGo` reloads into the next district. After the reload, the mission resumes at the first stage of the new district through the M1 checkpoint restore. Retrying a whole mission after a transfer also resumes in the current district.
- **NEXT pill in Athens:** it shows the current campaign step. If the step starts in another district, the pill reads "Starts in X · tap to go" and tapping it travels to that district. Only the current step's mark is placed, and only in its start district.
- Saves are per slot and per city (`mho_atc` is added to `CK`/`CITYK`). Frankfurt and the M1 story are untouched.

## Patch order
`./reapply.sh pATC1.py` prints REAPPLY_OK. Anchors are listed in `ANCHORS.md` (1 text anchor plus function wraps). The page grows by about 30 KB.

## Test results
- **`node tATC.js`**: **53 pass / 0 fail** in 450 s wall time, on a fresh Athens save. The m1 bot plays all 12 entries. Each start district is reached with a real mouse click on the NEXT pill (which reloads the page). There are 3 real district reloads inside missions (amphora A→B, metro B→A, Kifisias C→D), and each resumes at the correct first stage of the new district. All 3 reward scenes play (skipped with a real click on SKIP), all rewards are granted, the campaign reaches step 12, and there are zero page or console errors. Bot game time per mission (s): koulouri 60, mopeds 36, climb 147, pappas 172, amphora 130, metro 65, lyka 100, lambrou 116, blackout 83, kifisias 108, taverna 66, drakos 99.
- **`node smoke.js .`**: **SMOKE PASS**, sheet checked (`smoke/sheet.png`). Two earlier smoke runs crashed in "ath B" with "Execution context destroyed". The smoke drive picks a random direction from the Kolonaki spawn, about 500 m from district B's west edge, so it can drive out of B and the base reloads the page. With the patch, idling in B causes no navigation. The base passed its one run and the patched build passed its third.

## Known gaps
- The bot moves by teleport steps. The missions are not tuned for humans: the 4–7 min target from the design doc is not met (bot times are 1–3 min), and time limits and difficulty are untested with a real player.
- The moped is a simple box scooter with a minifig rider, and Spiros uses the M1 lieutenant AI. The reward scene's orbit camera can sit close to buildings (see `docs/atc_shots/reward_ch1.jpg`).
- Rival item-hit pop-ups are renamed, but some shared M1 radio lines still assume Frankfurt (for example Kaiser's line when goons join mid-race is only for `duel`, so it does not fire here).
- Not done: Magnet towing the giant ball, a separate Piraeus boat extension, and replay marks for finished missions.

Screenshots: `docs/atc_shots/` (gate arrival in B and D, reward scenes for Ch1 and Ch3) and `smoke/sheet.png`.
