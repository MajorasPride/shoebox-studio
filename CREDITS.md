# Credits and licenses

Shoebox Studio's art, sound and music are made in code by MajorasPride. There are no outside pictures, sounds or fonts in the game.

## Outside code
| What | Where | Version | License | Used for |
|---|---|---|---|---|
| three.js | `lib/three.module.min.js` | r160 | MIT, full text in `lib/THREE-LICENSE.txt` (Copyright 2010-2023 three.js authors) | Retro 3D mode and Make it 3D (`r3d.js`). Only loaded when you open 3D. |

## Built-in tools (our own)
- Story Shelf (`story-shelf/`) and Beat Bop Doodle (`beat-bop-doodle/`) are MajorasPride's own games. Beat Bop Doodle's pixel font loads from Google Fonts when online (SIL Open Font License); without the internet a plain font shows.

## Looks pass (looks test, Nov 13 2026, dev only)
| What | Licence | Where |
|---|---|---|
| spectral.js 3.0.0 (Ronald van Wijnen) — real paint mixing (Kubelka-Munk) | MIT | `looks/spectral.min.js`, licence in `looks/spectral-LICENSE.txt` |
| Jersey 10 font (The Soft Type Project Authors) — pixel UI titles and button words | SIL OFL 1.1 | `looks/ui/jersey-10-latin-400-normal.woff2`, licence in `looks/ui/OFL-Jersey10.txt` |
| Desk supplies, yarn/knit/felt/clay textures (Real, Toon, Pixel style kits) | Our own, made in Blender from code by MajorasPride | `looks/assets/`, scripts in `tools/blender/` |
| Pixel UI frames (9-slice) | Our own, made in code | `looks/ui/f_*.png` |
Checked and not used: Mixbox (non-commercial licence). Kenney UI/Particle packs (CC0) were not needed for this test: the frames match the kraft palette better made in code; three.quarks (MIT) is kept for 3D effects in Retro 3D later.
