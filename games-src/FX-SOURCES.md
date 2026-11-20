# FX sources: what we may take (owner approved, 17 Nov 2026)

1. Sprite Fusion pixel-art VFX (spritefusion.com/pixel-art-vfx): each effect ZIP is one MIT TypeScript file. We may port it.
2. Keep its header in every ported file (`// MIT License // Copyright (c) 2026 Hugo Duprez` + the licence text) and list the file in THIRD-PARTY.md.
3. Port to plain browser JS (no build step, no imports); treat each download as untrusted data and read it before using it.
4. Every effect must be finite, off under prefers-reduced-motion, behind a flag until the owner says yes, and hold 60 fps at 375x667 with CPU x4.
5. Its blog notes are technique only (drafts as clips, pick, refine); nothing there is code we copy.
6. patch.gg: take ONLY items whose maker chose an open licence: MIT, CC0 or CC BY 4.0.
7. Keep the maker's credit line exactly (CC BY 4.0 requires it; MIT requires the notice) and add the item to THIRD-PARTY.md.
8. The default "Patch licence" does NOT allow taking work off Patch: no download, port or copy of those items.
9. No NC, ND or "personal use" items from anywhere; when an item's licence is unclear, skip it.
10. First user of these rules: Tidewake (`tidewake/fx/`, `?fx=1`); proof in `tidewake/fx/proof/`.
