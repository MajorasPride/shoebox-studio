# Shoebox Studio: handoff notes

_Last updated: Nov 13, 2026 (v1.6c live: v1.6a + v1.6b + v1.6c merged to `main`; rollback copy of v1.5.2 in `/v1.5.2/`)_

## Vision
- Shoebox Studio is the **one video game that holds everything**: you make game assets, levels, stories and music, and you make whole games, all inside it. The owner's other tools plug in as stations. Their working copies stay with Claude, and the game gets big updates when the owner says so.
- Models (from the planning chat): LittleBigPlanet (Play, Create, Share) and Animal Crossing (townsfolk you craft, real clock, seasons, daily chores, a museum for crafts). Little Town is the hub, and later **any building can hold a level you made**. Dioramas ("fill a shoebox scene") can turn into playable levels. All original designs and names: no Nintendo or LBP characters, and trademarked toy names stay generic.

## How updates work (owner's rule, Nov 12, 2026)
- Small updates happen **on our end** in working copies: the private Claude artifacts, plus the `dev` branch of this repo.
- The public game (`main` branch = the live website) only gets **big, fleshed-out updates**, and only when the owner says go.
- Staged work waits on `dev`. It's in the repo but not on the website.
- **Nothing goes live without the owner's final look.** Before every big update, give the owner a private preview of the whole `dev` version to play. Push to `main` only after they say go.
- **One-time exception (Nov 13, 2026):** the owner chose to put this first update (v1.4) live right away, without the preview step ("push everything we talked about now to the website, I wanna see how it goes"). The normal rule above still applies to every future update.
- **Second exception (Nov 13, 2026):** the owner asked for v1.6a, v1.6b and v1.6c to be built and put live the same night ("build everything and go live tonight"), each tested on `dev` first, with a rollback copy of the live version. Done by Opus in Claude Code on the laptop. The preview-first rule is back in force from the next update.

## Name
- **Shoebox Studio**, tagline **Cut, Paste, Play**. Renamed from Craft Loft (and before that, Platformer Editor).
- Short name: "Shoebox" or "SBS". Never "SS".
- Save keys (`craftloft_*`) and the library file format (`craftloft-library`) were left as they were on purpose, so old saves still load.

## Links
- Live site: https://majoraspride.github.io/shoebox-studio/
- Repo: https://github.com/MajorasPride/shoebox-studio
- Original v1 artifact (Craft Loft): https://claude.ai/artifact/AnfU7AN5iGdXarANhJpL5z. This repo's `index.html` is now the main copy.
- Plan & Results doc (Google Docs): https://docs.google.com/document/d/1qK_6I6-r1UYR5d-sLYLuauwfbBMBov7so18W7_4GTrY/edit. Command Tracker: project P004, ticket T007, result R008.
- Drive backup of v1.4 `index.html`: https://drive.google.com/file/d/1p-Xa8B4TIeGIKZFM86gN3wfOVEDcd90x/view
- Private preview: none for v1.4 or v1.6 (skipped on the owner's say-so, see the exceptions above). Make one for the next big update. The old v1.6a-only preview (https://claude.ai/artifact/VTxhaBaQ53PrajfmktvuPZ) is out of date.
- Rollback copies (whole game, playable): `/v1.4/` and `/v1.5.2/` (https://majoraspride.github.io/shoebox-studio/v1.5.2/). To roll back the live site, copy `v1.5.2/index.html` over `index.html` on `main` (the 3D files can stay; nothing loads them).
- Tests: `Projects/tools/shoebox/test.js <label> [checks-file]` (Playwright, S23 Ultra 384x824 touch + 1920x1080, makes a real v1.5.2 save first). Check files: `checks-v16a.js`, `checks-v16b.js`, `checks-v16c.js`. Screenshots go to `Projects/screenshots/shoebox/<label>/`.

## What v1.6c added (built Nov 13, 2026 by Opus in Claude Code on the laptop)
Code: `r3d.js` (the whole 3D view, an ES module) + `lib/three.module.min.js` (three.js r160, MIT, see CREDITS.md) + a small "v1.6c" block at the end of index.html's main script. The 3D files load only the first time you open 3D, so 2D is as light as before.
1. **Retro 3D is unlocked.** Open it from the **🧊 3D** button in Little Town (Build and Walk), the **🧊 3D** button in the studio and the house (between Move things and Quick jump), or the old Retro 3D button in Make a Level (there it says levels come later). **◀ Back to 2D** or the phone's Back button returns to the same place in 2D.
2. **Scenes come from the same save data.** Little Town 3D is built from `TOWN` (paper floor with the grid and tape corners, cardboard shoebox walls around it, the wooden table outside). The house and studio are buildings: their 2D drawing is the front, on a cardboard box (the house gets a red roof). The studio and house rooms use the room's own 2D background as the floor and back wall, and every station (`STATION_DRAW`) stands up as a cutout with its name tag.
3. **Crafted pieces are standing cutouts** with a little cardboard foot and a soft shadow. Flat cutouts turn to face you (like sprites in old 3D games), so drawings and signs never read backwards; doors and gates keep their hinge, and Papercraft / Puffy clay pieces stay real 3D. Opening 3D town faces you toward the middle of town. Roads lie flat. Cars keep driving (the game's own `townActs`) and stop for you. Street lights and building windows glow at night (the clock keeps running). Doors open and close. Glow pieces glow at night and glitter pieces sparkle (v1.6b tags).
4. **First-person walk.** Left thumb joystick walks, drag anywhere else to look. PC: WASD or arrows, mouse drag, Q/R to turn, E or Enter to use, Esc to leave. Walk up to a building door or a station and a yellow button offers it ("Go into My House", "Sit at the School Desk", ...). Stations open their 2D screen; the studio door and the house's front door lead back out to 3D town. Leaving saves where you stood (`TOWN.hero`, `craftloft_lobby`, `craftloft_househero`).
5. **Retro look**: rendered at about 640 px on the long side and scaled up with chunky pixels. Camera about 80° across (taller on a phone, up to 96°).
6. **Make it 3D** (Toy Box > tap a piece > 🧊 Make it 3D): pick **Cutout**, **Papercraft** (folds up out of the paper into a thick layered piece with a fold-out stand) or **Puffy clay** (puffs up round in the middle, from the drawing's own shape). A spinning preview shows it. Saved on the toy as `toy.m3d` ('paper' | 'clay'; no key = cutout), so Retro 3D town shows it that way. 2D stays the same.
- Choices made: three.js instead of a home-made 3D engine (well tested, works on phones, MIT). Copied into the repo so the game doesn't depend on another website. Buildings are "2D facade on a box", the way real shoebox dioramas are made, so they always match the 2D art. Make a Level has no 3D yet. The pet doesn't follow you in 3D yet.
- Tests run (Playwright `Projects/tools/shoebox/test.js` + `checks-v16c.js`, 384x824 touch and 1920x1080): 3D town opens with every piece, the joystick walks, dragging looks, cars drive in 3D, night, house door > 3D house > TV opens Beat Bop Doodle, studio in 3D > School Desk opens, studio door > 3D town, phone Back closes 3D, Make it 3D saves Papercraft and Puffy clay and they show in 3D town, all 2D screens and an old v1.5.2 save still fine. No page errors. 36/36.
- Not checked: a real phone's GPU (the test browser uses a software renderer), and how the 3D view feels to play.

## What v1.6b added (built Nov 13, 2026 by Opus in Claude Code on the laptop)
Code: search "v1.6b" (one block at the end of the main script, plus small hooks).
1. **Art mediums.** School Desk > Draw has an **🎨 Art box** chip. Pick one of 12 mediums and a colour; the Pencil chip then shows the medium you're drawing with. Pencil, Coloured pencils, Markers, Crayons, Watercolour, Poster paint, Charcoal, Chalk pastels, Oil pastels, Gel pen, Glitter pen, Glow pen. They're all brushes made in code (`MEDIA`, `medSeg`). Grain mediums use a tinted texture fixed to the paper (`GRAIN`, `grainPat`), so the paper's tooth shows through and gaps stay put when you go over a line. Charcoal and pencil come in one colour only. Choice saved as `craftloft_artbox` {med, col, stock}.
2. **Paper stocks.** Paper tab: the first chip picks the stock for the next sheet (`STOCKS`, `stockTex`): Construction (old default), Sketch, Watercolour (paint spreads wider on it), Cardstock, Lined notebook paper, Cardboard (corrugated), Kraft, Black art paper, Tracing (see-through), Glitter card, Glow paper. Sketch, Watercolour, Lined, Cardboard, Black and Glow paper have their own colour, so the colour row shows just that one.
3. **Pieces remember what made them.** `p.med` = {m:[medium ids], stock, glow:'#colour', gl:1}. Kept through cut, copy, desk save, Toy Box and Copy to desk. Toys carry it as `toy.med`.
4. **Medium tag and filter in the Toy Box.** A "Medium" row under the type row filters by medium (only mediums you've used are shown). Cards show the medium emojis. The asset dialog has "Medium (tap to tag)" to fix the tags by hand, plus the paper stock.
5. **Handy Notebook** (📓 button in Little Town, in both Build and Walk). A bottom sheet: the town keeps running above it, so you can tap to walk with it open. 12 mediums, 12 colours, Undo, Clear, page ◀ ▶, **＋ Quick sketch** (new page, up to 24), **🏷️ Make a sticker** (cuts the drawing out with a white sticker edge and puts it in the Toy Box as a Sticker, with its medium tags). Pages saved as `craftloft_notebook` {pages:[{src, med}], i}. Leaving town closes it.
6. **Glow and glitter in Little Town.** Pieces with Glow pen or on Glow paper glow from dusk to dawn (`townFx`, uses `nightK`). Pieces with Glitter pen or on Glitter card twinkle with little stars all day.
- Choices made: glow lights up the whole piece (a soft halo in the glow colour), not just the glow-pen lines. That keeps saves small (no second picture per piece). A stroke-only glow would need a glow mask per part; that's a possible later upgrade.
- Tests run (Playwright `Projects/tools/shoebox/test.js` + `checks-v16b.js`, 384x824 touch and 1920x1080): a real v1.5.2 save loads, every screen and tool opens, all 12 mediums drawn with real pointer strokes, all 9 stocks at the time (v1.6c later added Lined notebook paper and Cardboard, 11 now), Toy Box tags, filter and tag edit, notebook used while walking (hero walks with it open), Quick sketch, sticker, glow and glitter at night, reload keeps the notebook and art box. No page errors. 30/30.

## What v1.6a added (built Nov 13, 2026 by Opus; ticket T013; live since Nov 13 with v1.6c)
Code: search "v1.6a". It was first sent as a patch/bundle in Drive (folder "Shoebox Studio v1.6a (dev, not live)"); the laptop run applied the bundle to `dev` unchanged and re-tested it.
1. **Game clock, day and night.** One shared clock (`CLK`, save key `craftloft_clock` = {m: minutes 0..1440, sp: 1 normal, 2 fast, 0 paused}). One game day = 8 real minutes (`DAYSEC`). Dawn 5:00-7:00, day 7:00-17:00, dusk 17:00-19:30, night 19:30-5:00. Tints Little Town (`townNight`), the studio's round window and the house window (`skyCol`). The sun/moon button in the top bar (studio, house, town) opens the clock: pause/run, 2x, jump to day, jump to night.
2. **Things behave like what they are.** Each town item has a behavior tag `it.act`: `vehicle`, `light`, `door` or `none` (`TACT`). Toys carry a default `toy.act`; the Toy Box dialog ("In Little Town it...") and the asset card both have the Behavior picker, and the town item bar has a button to change it per item.
   - Vehicles follow **road pieces** (toys with `road:1`; they lie flat under everything, snap to a 100 px grid and never block walking). They pick the straightest next piece, turn around at road ends, park on a lone piece, and stop when the hero is just ahead (`townActs`, `VEH`). Positions save every 8 s and when you leave town.
   - Lights glow from dusk to dawn (strength kept in `LITE`, not saved). House and studio windows glow too.
   - Doors open and close on tap in walk mode (`it.open`), and an open door can be walked through.
3. **Showcase town.** New saves only (`mkShowTown`): a road loop with two cars, four street lights, the house, the studio, a park (trees, bench, flower beds, garden gate) and a "Made in Shoebox Studio" sign. All pieces are code-made toys with ids `show_*` (`mkShowToys`), added to every toy box (old towns are not touched). Build mode has **Showcase** (reset to showcase town): it asks first and keeps the old town in `craftloft_town_backup`.
4. **Flip paper** (School Desk, Move and Draw chips: 🔄 Flip). Every sheet has a front and a back: `p.art` is the side you see, `p.back` the other side (stored in its own view, so its shape is the mirror), `p.side` front/back. Card-flip animation (`p.flipA`). The back shows a faint mirrored see-through of the front (`flatSkin`). Cuts and copies keep the back; the desk save keeps both sides. The old mirror button is now **↔️ Mirror**. Flip needs a flat, loose piece (not folded, not stuck).
   - Toy box: if the piece has a back, the dialog asks "Which side?" (Front by default). A single two-sided sheet also stores `toy.sheet` {front, back} so "Copy to desk" brings back both sides.
5. **Projector** (studio station, left of the floor, with a rolled-up screen under the window). Flipbook maker: pick Toy Box pieces as pages in order, speed 4-12 a second, loop on/off, Preview, Save as asset type `animation` {frames: toy ids, fps, loop}. The projector plays it full screen: the cloth screen rolls down, a beam from a small cardboard projector, page counter, Back and Again buttons (`projPlay`, `OVL='proj'`).
6. **Console save** (house TV console, Beat Bop Doodle): a "Save to Studio" button in the tool bar. "Save this song" keeps Beat Bop Doodle's own song format (`songData()` / `ds_song2`: {len, bpm, notes [[step,row,'inst']], rep, times, barRep}) as asset type `music`. "Snap the screen" takes the biggest visible canvas and makes a framed **sticker** toy (asset type `sticker`).
7. **Level music.** Make a Level has a 🎵 button: pick a music asset (or none). Saved in the level as `LVL.music` {aid, name, song copy}. It loops while you play (`songPlay`, a small synth that follows Beat Bop Doodle's rows and instruments); the music box goes quiet meanwhile.
8. New asset types: Sticker, Animation, Music (export/import included). Version label v1.6a.
- Tests run (Playwright, Galaxy S23 Ultra size 384x824 touch, plus 1280x800): new save shows the showcase town; clock runs, lights and windows come on at night; a car drives the whole loop and stops for the hero; a Toy Box piece set to Drives follows the road and one set to Lights up glows at night; flip a sheet, draw on both sides, reload keeps both; 3-page flipbook plays on the projector; song and screenshot saved from the console; song picked as level music and plays; a hand-made v1.5 town loads unchanged; every screen and Story Shelf open; no page errors.
- Not checked: the owner's real phone, and audio by ear.

## What v1.5 added (built Nov 13, 2026 by Opus in chat, live; ticket T008)
1. **The studio is a building in Little Town** ("SHOEBOX STUDIO", a cardboard shoebox on its side). Walk mode: tap it, the hero walks to the door and goes in. Build mode: tap to go in, drag to move it. It blocks walking like the house.
2. **The studio's Little Town door** now puts you outside the studio building in walk mode (was: town in build mode at the old spot). Coming in from town puts you at the studio door inside.
3. **Both buildings move** (house and studio), positions saved in the town save (`TOWN.house`, `TOWN.studio`). Old towns get a studio at a default spot (600, 470).
4. **Resume where you left off.** Save key `craftloft_where` = {s: home | house | town, walk}. Tapping the title screen goes there. Screens inside the studio (desk, class, kit, levels, toy box) resume to the studio. House position is saved as `craftloft_househero`, studio as `craftloft_lobby`, town in the town save. New players start in the studio.
5. If the hero is blocked close to a building's door (within 190 px), it goes in anyway, so you can't get stuck behind your own house.
6. Rollback copy of v1.4 is in `/v1.4/`.
- Code: search "v1.5:" comments, `BLD`, `bldAt`, `drawTownStudio`, `resume()`.
- Tests run: Playwright at 412x860 and 1280x800: studio door to town, walk into house and studio, move studio, reload resumes house / studio / town (walk mode kept), brand-new save starts in studio, all screens and Story Shelf open, no page errors.

## What v1.5.2 added (Nov 13, 2026, live)
- **Full screen button** (⛶) in the top bar, next to Settings. Tap to go full screen, tap again (🗗) to leave. If it was left on, tapping the title screen turns it back on (browsers need a tap). Hidden on browsers that can't do it (iPhone Safari). Save key `craftloft_fs`. Owner wanted this in v1.5; it was missed in the first v1.5 order.

## What v1.5.1 added (Nov 13, 2026, live)
- **Move things** button in the studio and the house (bottom left). Tap it, drag any station or piece of furniture, tap Done. Wall things (Art Class board, doors, Cork Board, Display Shelf) slide along the wall; floor things go anywhere on the floor. Saved per room: `craftloft_stnpos_lobby`, `craftloft_stnpos_househero`. Code: search "v1.5.1".
- Not yet: a "reset room" button, and the background art (rugs, windows) stays put.

## Art direction (owner, Nov 12, 2026: standing rule)
- Shoebox Studio is **one mixed-media piece**: clay, yarn, paper, cardboard, glow-in-the-dark and glitter sit together with real-art, diorama and book-nook realism, a little cartoon. Original art only (pictures he shared of yarn/paper/clay games and book nooks are for feel, never copied).
- Long-term roadmap (also in the Plan & Results doc): v1.6 default starter town where things behave like what they are (car drives, streetlight lights up, day and night); assets in every medium; picture stickers (import photos as stickers several ways, realistic photo stickers, GIF stickers later); his own art later.
- **The Player Hand** (idea, Nov 12): it's all about imagination, we're just kids playing. Later the toys you make come alive, and the player is a giant hand from above (original design, inspired by the hand in Smash) that picks up and plays with them.
- **Platform fighter maker** (later): build your own Smash-style party fighting game inside Shoebox Studio, with your own toys as fighters. Original characters only.

## What v1.4 added (built Nov 13, 2026, live)
1. **Bookshelf station in the studio lobby.** Label "Bookshelf", subtitle "Story Shelf". Walk up and tap it (or use the yellow button, or Quick jump) and Story Shelf opens. The shelf has two dotted empty gaps, kept on purpose for **book nooks**.
2. **Story Shelf** lives in `/story-shelf/` (the public edition of Story Loom, save key `storyshelf_v1`). Not changed in this update.
3. **Beat Bop Doodle** lives in `/beat-bop-doodle/` (one file). Its header now says "a Shoebox Studio game".
4. **The house in Little Town.** A cardboard house with a paper roof stands on the tabletop. Inside is one small room: a TV with a retro game console (opens Beat Bop Doodle), the front door back to town, a Display Shelf (coming soon), Pet Beds (coming soon) and a taped "decoration spot" on the floor.
5. Quick jump has two new lines: My House and Bookshelf. The version tag reads v1.4.
6. The Dress-up Mirror moved down a little to make room for the bookshelf.

## How the new parts work (for the next builder)
All of this is in `index.html`. Search for the comment titles below.
- **Rooms.** The lobby code now runs any room. `RM` is the room you are in: `LOB` (the studio) or `HOUSE`. Each room has a size, a station list (`stn`) and a background function (`bg`). The lobby's stations are still the `STATIONS` list. To add a station: one line in the room's list and one draw function in `STATION_DRAW`. A station does one thing: `go:'screen'`, `act:()=>...`, or `soon:1`.
- **Built-in tools ("BUILT-IN TOOLS" comment).** `TOOLS` lists each tool's folder. `openTool('shelf')` or `openTool('bbd')` shows the tool full screen in a frame, with a bar on top: a "Back to the studio / house" button, the tool's name, and a small ↗ link that opens the tool on its own page. The phone's Back button also closes it. The studio's music goes quiet and the game loop pauses while a tool is open. Closing removes the frame, so the tool's sound stops.
- **Saves.** Each tool saves under its own keys in the same browser storage (`storyshelf_v1`, `ds_*`), so nothing clashes with `craftloft_*`.
- **The house in town ("The player's house stands in Little Town" comment).** Its place is saved inside the town save as `TOWN.house`. Old towns get one added at a default spot the first time they load. Build mode: tap it to go in, drag it to move it. Walk mode: tap it, the hero walks to the door and goes in. It blocks walking like other pieces. The front door inside puts the hero back at the house door in walk mode.
- **The house room.** `HOUSE` and `drawHouseRoom`. It's drawn like a shoebox diorama with the roof on top. Places left open on purpose: the dotted shapes on the Display Shelf, the dotted ovals next to the pet bed, and the taped decoration spot.
- **Beat Bop Doodle's in-game copy** has no manifest and no service worker. Reason: it runs inside the game in a frame, and a service worker in a subfolder could keep serving an old copy after a big update. The stand-alone Beat Bop Doodle site keeps its own.
- **Tests run:** Playwright at phone (412×860) and PC (1280×800) size, from a v1.3 save: walked to the bookshelf, opened and closed Story Shelf (button and phone Back), entered the house from town in build and walk mode, opened and closed Beat Bop Doodle from the console, left by the front door, dragged the house, checked every other screen still opens. No page errors.
- **Not checked:** the live site itself after the push. The build machine could not open github.io, so the owner's phone is the first look at the live copy. If the bookshelf or console shows a blank frame there, check that `/story-shelf/` and `/beat-bop-doodle/` are being served.

## How the built-in tools work (decided Nov 12, 2026, replaces the earlier "load the live site" plan)
- **Working copies** are where small updates happen with Claude:
  - Story Loom: the private Claude artifact (https://claude.ai/artifact/PsTZ7n8XEwmmE1uL6UWTS4).
  - Beat Bop Doodle: its own repo (`beat-bop-doodle`). It has the same "a Shoebox Studio game" line, with a link back to Shoebox Studio.
- **Shoebox Studio keeps its own copy** of each tool inside this repo (`/story-shelf/`, `/beat-bop-doodle/`). These copies only change when the owner says to **push a big update** into the game. The game is not updated all the time.
- No separate public websites are needed for these tools. There is no story-loom repo, and the game copies work offline (Beat Bop Doodle's pixel font needs the internet; without it a plain font shows).
- Story Loom's in-game copy is named **Story Shelf**. It's the public edition: no Ask Claude buttons, no cloud save, its own save key (`storyshelf_v1`).
- Story Shelf needs **lots of tutorials and worked examples** (owner, Nov 12: "we are going to be doing a lot of work on this"). It already has the 2-minute tour, the follow-along worked example "The Salt Bell" and the short example "Pip's Lanterns". Add more over time: one per tool, plus genre examples (detective, horror, multiple endings). Write original example stories only, never the owner's own stories.
- Book nooks: a later feature (tiny dioramas you make and slide between books). The bookshelf already has the gaps for them.

## Open questions (answer on a cheaper model)
- **v1.6 (new):** Glow pieces light up as a whole (a soft halo). Should only the glow-pen lines glow instead? (Needs a second picture per piece, so bigger saves.)
- **v1.6 (new):** The plan doc lists craft-material tags too (paper, clay, yarn, cardboard, realistic). Right now the Medium tag holds the drawing mediums plus the paper stock. Add material tags when clay and yarn crafting exist?
- **v1.6 (new):** Retro 3D draws at about 640 px and scales up with chunky pixels. Keep that look, or sharper? Make a Level in 3D next, or the pet walking with you in 3D?
- Keep Beat Bop Doodle's existing public site, or turn it off? (It is still on, and now links back to Shoebox Studio.)
- **The house: what is it for?** Built so far: one room with the console. Ideas that fit the plan: your crafts on display (museum / fridge-gallery feel), pets sleeping in their beds, decorating with things you made, a place to save or rest. Which of these, and in what order?
- **Where does the house stand?** Now: one house in Little Town at a default spot, and you can drag it. Should it also have a door from the studio lobby? (Quick jump already goes straight there.)
- **What does the house look like?** Now it's a fixed cardboard house. Should the player craft or decorate the outside too (paint, roof colour, their own cut-out pieces)?
- **More rooms later?** (Bedroom, kitchen with the fridge gallery, a yard.) The room code can take more rooms.
- **Pet beds:** one bed per companion kind (dog, chicken, cat), or one bed the current pet uses? Should the pet stay home when you leave?
- **Other games on the console:** only Beat Bop Doodle for now. Should the console later show a list of the levels and games you made ("cartridges")?
- **Book nooks:** how are they made (a diorama station? the School Desk?), and do they open into anything when tapped?
- **Bookshelf spot:** it stands on the right side of the studio floor, next to the Toy Chest. OK there?
- Still open from v1.3: pixel size for UI parts, 16 px (built) or 32 px? Add the downloads capability so Export saves a real file inside the Claude viewer?

## Build list
1. Done: rename + tagline.
2. Done (v1.4, live): Story Shelf in `/story-shelf/` + the studio bookshelf station that opens it.
3. Done (v1.4, live): Beat Bop Doodle in `/beat-bop-doodle/` + the "a Shoebox Studio game" line (also on the stand-alone site).
4. Done as a simple first version (v1.4, live): house in Little Town, with the console that opens Beat Bop Doodle. Its full purpose is still open (see the questions).

## Next steps
- Owner plays v1.6 on the phone (live site) and says what to change. Most worth a look: Retro 3D on the real phone (speed, joystick feel), the art mediums at the School Desk, the Handy Notebook while walking.
- VHS spot with a cloth backdrop for the projector: planned, not built (its own small order).
- 3D ideas not built yet: Make a Level in 3D, the pet following you in 3D, glow-pen lines glowing on their own (now the whole piece glows), real 3D water and physics (from the plan doc).
- Answer the house questions, then build the first real house feature (suggested: show crafted pieces on the Display Shelf and the decoration spot, since the Toy Box already holds them).
- Pet beds: let the companion nap in its bed.
- Book nooks on the bookshelf.
- More Story Shelf tutorials and worked examples.
- The other "coming soon" stations: Fridge Gallery, Supply Shop, Dress-up Mirror, Art Studio, Cork Board.
- Recommendation: let buildings in Little Town hold levels (the "buildings are level doors" idea). The house code is a ready pattern for it.
