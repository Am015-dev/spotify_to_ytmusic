# Coordinator handoff (2026-10-14 02:45Z)
Live: v90m-beta.37 (brave-carson). Deploy: $SCRATCH/deploy.sh <out/ver> "<msg>" with DEPLOY_TRAILER; it copies *.js, models/, xc/, music/. Then republish the Beta artifact P6zT2b2SwfHYguRTtb67Ug with files km.js, models.js, tune.json, models/lx.js, models/as.js, xc/*.js.
Builds come from int-4 (out/v90m-beta.N on alex/od-int2). Deploy within 1 min of a green BUILD; the matrix runs after deploy, roll back by redeploying the previous out/.
Active workers (all trunk-based on alex/od-int2):
| lane | session |
|---|---|
| int-4 integrator (Sonnet) | session_01QewuGcL86b169339CDxRy9 |
| cam-2 camera refit + sinking (Sonnet) | session_01EYkuBARKhEtuoc447HjjLv |
| foot-2 spawns/on-foot (Sonnet) | session_01Wk3tCUz39tLELACJC821Sk |
| test-1 20k matrix + monkey bot (Sonnet) | session_01U93UmpgV3ZVvcvjyQjCyUu |
| rev-1 bug sweep per build (Opus) | session_01NLojdbGj4iCwrAEBorf7Yj |
| xform-1 driving feel + portrait UI (Opus) | session_013BAHoBj5ikZM6Z6zGNhLkJ |
| trk-3 races/tracks (Opus) | session_01VLUU7qG6rkKBd6UtN9FwoQ |
| art-3 world objects/facades (Opus) | session_01Lav2AWo3iEKJTMMk8cCcCt |
| gfx-2 lighting → ON (Opus) | session_01W4Vv4TLL1rd3tZA62JLNjA |
| life-2 LDraw set pieces (Opus) | session_01DhpmPrE3mCsD3ixJsHMF5M |
| asset-2 LEGO props/trees (Opus) | session_011hY1WVvJaZ5tESSJwrB8Bn |
| terr-2 junction + Athens boot (Opus) | session_01SJyUaEvvwz8HeAGesfn3N3 |
Pending for beta.38: xform 3dac918, art-3 1436c5a/5f08d65, life 9697f7c9.
Rules learnt tonight: never archive before checking work is pushed; a worker past 150k hands off; never route around a permission denial; status = get_session on one session; report to Alex only on deploys or when asked.
