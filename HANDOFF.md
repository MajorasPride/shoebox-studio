# Shoebox Studio: handoff notes

_Last updated: Nov 12, 2026_

## Name
- **Shoebox Studio**, tagline **Cut, Paste, Play**. Renamed from Craft Loft (and before that, Platformer Editor).
- Short name: "Shoebox" or "SBS". Never "SS".
- Save keys (`craftloft_*`) and the library file format (`craftloft-library`) were left as they were on purpose, so old saves still load.

## Links
- Live site: https://majoraspride.github.io/shoebox-studio/
- Repo: https://github.com/MajorasPride/shoebox-studio
- Original v1 artifact (Craft Loft): https://claude.ai/artifact/AnfU7AN5iGdXarANhJpL5z. This repo's `index.html` is now the main copy.

## Decisions (Nov 12, 2026)
- Beat Bop Doodle becomes **"a Shoebox Studio game"**:
  - It keeps its own repo and site (`beat-bop-doodle`), so it can be updated and pushed by itself.
  - Its title screen gets a small "a Shoebox Studio game" line, and its site gets a link back to Shoebox Studio. Approved, not yet built.
  - It shows up as a **retro NES-style console in the player's house** in Little Town, not in the studio lobby.
  - The console loads the **live** Beat Bop Doodle site, so updates show up automatically. When offline, it shows a "no signal" TV screen with no backup copy.
- Book nooks: a later feature (tiny dioramas you make and slide between books).

## Open questions (answer on a cheaper model)
- **The house:** what it's for, what's inside, and how it connects to Little Town and the lobby. Talk this through before building the console.

## Build list (go through with the owner before pushing)
1. Done: rename + tagline, pushed to the public repo.
2. Beat Bop Doodle: "a Shoebox Studio game" line + link back.
3. House in Little Town, with the NES-style console loading Beat Bop Doodle.
