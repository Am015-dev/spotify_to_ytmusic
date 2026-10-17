#!/usr/bin/env bash
# Visual baselines live OUTSIDE the work branch: games-src/.baselines/ (git-ignored) <-> orphan branch ui-baselines. Machine-only: never open the images.
#   baselines.sh pull   fetch ui-baselines into games-src/.baselines/
#   baselines.sh push   commit games-src/.baselines/ to ui-baselines and push (plain push, no force; fetches + merges first)
set -euo pipefail
ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"; DIR="$ROOT/games-src/.baselines"; BR=ui-baselines; REMOTE="${BASELINES_REMOTE:-origin}"
WT="$(mktemp -d)"; trap 'git -C "$ROOT" worktree remove --force "$WT" >/dev/null 2>&1 || true; rm -rf "$WT"' EXIT
fetch() { git -C "$ROOT" fetch -q "$REMOTE" "$BR" 2>/dev/null && return 0 || return 1; }
case "${1:-}" in
  pull)
    mkdir -p "$DIR"
    if fetch; then git -C "$ROOT" worktree add -q --detach "$WT" "$REMOTE/$BR"; cp -a "$WT"/*.png "$DIR"/ 2>/dev/null || true; echo "pulled $(ls "$DIR" | wc -l) baselines"
    else echo "no $BR branch on $REMOTE yet"; fi ;;
  push)
    [ -d "$DIR" ] || { echo "nothing in $DIR"; exit 1; }
    if fetch; then git -C "$ROOT" worktree add -q --detach "$WT" "$REMOTE/$BR"
    else git -C "$ROOT" worktree add -q --detach "$WT" HEAD; git -C "$WT" checkout -q --orphan "$BR"; git -C "$WT" rm -rq --cached . >/dev/null 2>&1 || true; find "$WT" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
      git -C "$WT" -c user.name=baselines -c user.email=baselines@localhost commit -q --allow-empty -m "ui-baselines: initial empty commit"; fi
    cp -a "$DIR"/*.png "$WT"/ 2>/dev/null || true
    git -C "$WT" add -A -- '*.png'
    if git -C "$WT" diff --cached --quiet; then echo "baselines unchanged"; else git -C "$WT" -c user.name=baselines -c user.email=baselines@localhost commit -q -m "baselines: ${2:-update}"; fi
    git -C "$WT" push -q "$REMOTE" "HEAD:refs/heads/$BR" && echo "pushed $BR" ;;
  *) echo "usage: baselines.sh pull|push [message]"; exit 2 ;;
esac
