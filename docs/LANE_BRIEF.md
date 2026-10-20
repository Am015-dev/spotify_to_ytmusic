# Lane brief template (Mainhattan Overdrive)

Copy this block into the lane prompt. One target, one deliverable, about 30 min or 100k context.

```
Lane: <lane>-r<nn>   Target: <one number, e.g. "Athens PC boot longest gap <= 1.17 s">
Repro: <exact command that shows the miss today, e.g. "tools/build.sh && TAG=pc-boot-lt node tools/unit/run.js">
Files you may touch: <list>   Files OFF-LIMITS: src/99c_checklist.js (unless it is the lane's assert), tune.json, deploy.sh
Flag: WIP behind a flag that defaults OFF until its tests pass.
Before push (on the BUILT page): tools/build.sh; node tools/unit/run.js (0 FAIL); TAG=<lane tag>; TAG=life1,xf1,terrain
Push only to alex/od-int2 (fetch + rebase). No other branches.
Stop after one deliverable. Write docs/HANDOFF_<lane>.md (5 lines max), push, then STOP.
Message the coordinator once, at the end, <= 5 lines: commit, what changed, measured result, what is left.
Never ask Alex anything; take the recommended option and note it in one line.
Token rule: print pass/fail lines only (| tail -5); no polling or sleeps; hand off at 100k context.
```

## Which model

| Model | Use for |
|---|---|
| Haiku | Mechanical work only: branch cleanup, ledger rows, changelog text, renames |
| Sonnet | Bug with a repro, UI, tuning, tests, integration, telemetry (default for fixes) |
| Opus | Design or feel plans, reviews of feel, or a bug Sonnet missed twice |
| Opus (plan first) | Any target missed by two lanes: write the plan, or drop the target |
