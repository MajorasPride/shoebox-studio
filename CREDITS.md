# Credits and licenses

Shoebox Studio's art, sound and music are made in code by MajorasPride. There are no outside pictures, sounds or fonts in the game.

## Outside code
| What | Where | Version | License | Used for |
|---|---|---|---|---|
| three.js | `lib/three.module.min.js` | r160 | MIT, full text in `lib/THREE-LICENSE.txt` (Copyright 2010-2023 three.js authors) | Retro 3D mode and Make it 3D (`r3d.js`). Only loaded when you open 3D. |
| three-mesh-bvh | `lib/three-mesh-bvh.module.min.js` | 0.7.8 (only `MeshBVH`, bundled with esbuild, imports three from `./three.module.min.js`) | MIT, full text in `lib/THREE-MESH-BVH-LICENSE.txt` (Copyright 2018 Garrett Johnson) | Retro 3D: the camera stops at walls and solid things (T029). Only loaded when you open 3D. |
| spectral.js | `lib/spectral.js` | 3.0.0 (unchanged minified build) | MIT, full text in `lib/SPECTRAL-LICENSE.txt` (Copyright 2025 Ronald van Wijnen) | Paint mixing: wet mediums and the palette mix like real paint (T024). |
| perfect-freehand | `lib/perfect-freehand.js` | 1.2.3 (the CommonJS build wrapped as a plain script) | MIT, full text in `lib/PERFECT-FREEHAND-LICENSE.txt` (Copyright 2021 Stephen Ruiz Ltd) | Smooth pressure strokes with the S Pen (T024). |

The felt, knit, stitched and burlap texture painters in `mediums.js` (`GRAIN_PAINT`) are copied from Mythic Forge's `myth-forge/materials.js` (repo MajorasPride/titan-clash), which is MajorasPride's own code (T024).

Mixbox is not used (its licence is non-commercial).
Make it 3D's Puff (T033) follows the inflate idea from Google's Monster Mash (Apache 2.0 for its own code); it is our own code and copies nothing from Monster Mash or its Triangle library.

## Built-in tools (our own)
- Story Shelf (`story-shelf/`) and Beat Bop Doodle (`beat-bop-doodle/`) are MajorasPride's own games. Beat Bop Doodle's pixel font loads from Google Fonts when online (SIL Open Font License); without the internet a plain font shows.

## Art
- The default art is made in code. Players can swap any of it for their own on the Art Swap board (T022).
- When `art/default-pack.json` is in the repo (MajorasPride's own art pack), that art is the default for every new player, and the title screen says "Art by MajorasPride". The order that adds the pack also adds the line "Art by MajorasPride" to this file. No pack file is in the repo yet.
