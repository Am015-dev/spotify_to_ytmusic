---
name: cost-efficiency
description: Keep AI agent work cheap without losing quality. Use when planning or running multi-agent / multi-worker projects (orchestrators, subagents, cloud sessions, parallel fixers and reviewers), when writing a brief for a worker, when choosing a model for a task, when a session or worker is getting long, or when someone asks "is this efficient?", "why is this so expensive?", "how do I cut cost?". Also use before spawning more than 2 workers at once.
---

# Cost efficiency for agent work

The bill is mostly **context re-read, not new work**. Every tool call re-reads the whole conversation so far. In one measured day, workers wrote 5.7M tokens but re-read 1,965M (about 345:1); re-reads are cheap per token but dominate at that volume. So the two biggest levers are **shorter sessions** and **the right model**, then **less duplicated work**.

## 1. Pick the model by task (always set it explicitly)
| Tier | Use for | Examples |
|---|---|---|
| Smallest (Haiku-class) | Mechanical, no judgement | run tests, copy/rename, list files, data-table edits, refresh a dashboard, bisect by flag |
| Middle (Sonnet-class) | Well-specified work with a clear list or a measurable gate | "fix these 8 items from the review", bug with a repro, tuning to a number, research |
| Largest (Opus-class) | Open design, feel, cross-system changes, independent review/scoring, anything a cheaper tier failed twice | "make it fun", redesign a content set, architecture, strict reviewer |
Escalate one tier after a failed attempt; never use the largest tier for chores. Measured: the same kind of fix round cost ~$4 on the middle tier vs $8–17 on the largest.

## 2. Keep every session short
- Brief each worker for **one deliverable, ~30 min, hard stop ~45 min**, then report and stop. No "and while you're there…".
- Long sessions get expensive per step: a worker at 300k tokens of context pays for those 300k on every call. A middle-tier worker that ran 56 min to 330k context still cost $13 — the model alone doesn't save you; length does.
- Search instead of reading: use a search/explore subagent or grep for line ranges; never read whole large/generated files (built bundles, lockfiles, minified code, logs). Read only the lines you change.
- If a task is big, split it into sequential short workers with a hand-off note, rather than one marathon.
- The orchestrator itself: summarise and hand off (a HANDOFF note) before its context gets huge.

## 3. Don't duplicate work
- Run the expensive gate (full test suite, browser tests) **once** per worker; re-run only if the result looks flaky.
- Don't run an independent full review after every fix round. Gate reviews on a cheap signal first (e.g. the fixer's own quick test / user-proxy score ≥ threshold). Below the threshold, send the findings straight to the next fixer.
- Give each worker the exact list it must fix (from the last review/test), so it doesn't re-discover problems.
- Reuse tools: when a worker writes a useful test/probe/recorder, keep it in the repo and point later workers at it.
- Batch small related fixes into one worker instead of one worker each.

## 4. Brief template (paste into every worker prompt)
```
Goal: <one deliverable>. Model: <tier, why>.
Inputs: <exact list / review file / repro>. Read: <2-4 files or docs>, nothing else.
Efficiency: aim ~30 min, stop by 45. Search, don't read whole files. Run the full test suite ONCE.
Done when: <measurable gates>. Then report in <=10 lines: commit, gates, what changed, what's open. Stop.
```

## 5. Watch the meter
- Track cost per worker and per goal (e.g. per feature/game). Compare rounds: cost should fall or results should rise; if a goal has eaten 3+ rounds with flat results, stop and rethink the approach (often it needs a design pass on a bigger model, not more cheap polish).
- Signals to act on: a worker past 45 min; context > 200k; the same gate run 3+ times; the same issue reported by two rounds; many idle-but-alive workers.
- Dashboards and status refreshes cost tokens too: refresh on a slow cadence (e.g. 30–40 min) and incrementally (only changed items).

## 6. Quick checklist before spawning workers
- [ ] Is this one deliverable with a clear "done"? If not, split it.
- [ ] Is the model tier the cheapest that can do it well?
- [ ] Does the brief carry the exact inputs, so the worker won't explore?
- [ ] Is a full review really needed now, or can a cheap signal gate it?
- [ ] Are there already enough workers on this goal? (Parallelism multiplies cost; it doesn't make one task cheaper.)
