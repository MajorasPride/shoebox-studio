# Shoebox Studio: handoff notes

_Last updated: Nov 12, 2026_

## Vision
- Shoebox Studio is the **one video game that holds everything**: you make game assets, levels, stories and music, and you make whole games, all inside it. The owner's other tools plug in as stations. Their working copies stay with Claude, and the game gets big updates when the owner says so.

## Name
- **Shoebox Studio**, tagline **Cut, Paste, Play**. Renamed from Craft Loft (and before that, Platformer Editor).
- Short name: "Shoebox" or "SBS". Never "SS".
- Save keys (`craftloft_*`) and the library file format (`craftloft-library`) were left as they were on purpose, so old saves still load.

## Links
- Live site: https://majoraspride.github.io/shoebox-studio/
- Repo: https://github.com/MajorasPride/shoebox-studio
- Original v1 artifact (Craft Loft): https://claude.ai/artifact/AnfU7AN5iGdXarANhJpL5z. This repo's `index.html` is now the main copy.

## How the built-in tools work (decided Nov 12, 2026, replaces the earlier "load the live site" plan)
- **Working copies** are where small updates happen with Claude:
  - Story Loom: the private Claude artifact (https://claude.ai/artifact/PsTZ7n8XEwmmE1uL6UWTS4).
  - Beat Bop Doodle: its own repo (`beat-bop-doodle`).
- **Shoebox Studio keeps its own copy** of each tool inside this repo (planned folders: `/story-shelf/`, `/beat-bop-doodle/`). These copies only change when the owner says to **push a big update** into the game. The game is not updated all the time.
- No separate public websites are needed for these tools. There is no story-loom repo, and the game copies work offline.
- Story Loom's in-game copy is named **Story Shelf**. It's the public edition: no Ask Claude buttons, no cloud save, its own save key (`storyshelf_v1`). It's staged in `/story-shelf/` but not pushed or linked yet.
- Story Shelf needs **lots of tutorials and worked examples** (owner, Nov 12: "we are going to be doing a lot of work on this"). It already has the 2-minute tour, the follow-along worked example "The Salt Bell" and the short example "Pip's Lanterns". Add more over time: one per tool, plus genre examples (detective, horror, multiple endings). Write original example stories only, never the owner's own stories.
- Story Loom opens from a **bookshelf in the studio lobby**. Later, book nooks can live on the same shelf.
- Beat Bop Doodle opens from a **retro NES-style console in the player's house**. Its "a Shoebox Studio game" title line is approved.
- Book nooks: a later feature (tiny dioramas you make and slide between books).

## Open questions (answer on a cheaper model)
- Keep Beat Bop Doodle's existing public site, or turn it off?
- **The house:** what it's for, what's inside, and how it connects to Little Town and the lobby. Talk this through before building the console.

## Build list (go through with the owner before pushing)
1. Done: rename + tagline, pushed to the public repo.
2. Add Story Shelf into `/story-shelf/` + the studio bookshelf station that opens it.
3. Add Beat Bop Doodle into `/beat-bop-doodle/` + the "a Shoebox Studio game" line.
4. House in Little Town, with the NES-style console that opens Beat Bop Doodle.
