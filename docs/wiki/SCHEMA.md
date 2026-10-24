# Wiki schema (rules for agents)
Pattern: Karpathy "LLM wiki". Raw sources are immutable and pinned (sources/). The wiki is small interlinked pages that the LLM maintains. index.md is the one entry point.

## Page rules
- One topic per page, **<= 4 KB** (tools/wiki_lint.js fails above 4096 bytes). Too big: split and link.
- Names: lowercase-kebab.md. Folders: `racers/` (facts from the LEGO Racers study), `game/` (map of OUR game), `sources/` (pins).
- Page shape: facts with numbers -> source pointers -> "what we have" (file:function) -> gap/known bugs -> links.
- Link, don't copy: other docs by relative link (HANDOFF_*, REVIEW_*, BENCH_2K, LESSONS); our code as `src/<file>.js:<function>`.
- Racers code is open source (LGPL/MIT/GPL, see sources/licences.md). Short excerpts only (<= 30 lines), labelled repo@SHA, path, function, licence; longer ones in racers/code/<topic>.md (<= 4 KB). Never vendor repos: `bash tools/racers_fetch.sh` -> git-ignored ref/racers/. Never LEGO assets. Don't port GPL code without Alex's OK. No code copied from our own src/.
- Every page appears in index.md, one line each.

## Ingest a source
1. Pin it in sources/ (SHA or file + date). 2. Read only what the question needs. 3. Write or update 1-2 pages. 4. Add/refresh the index line. 5. Append a line to log.md. 6. Run `node tools/wiki_lint.js`.

## Query
Read index.md, then only the 1-2 pages it points to. Grep src/ only for what the page does not say. If you had to grep, add the answer to the page.

## Lint
`node tools/wiki_lint.js` -> fails on a page > 4 KB, a broken relative link, or a page missing from index.md. Run before every wiki commit.

## Maintenance
log.md is append-only: `YYYY-MM-DD <lane>: what changed`. When code moves, fix the pointer in the page in the same commit. Stale pointer = bug in the wiki.
