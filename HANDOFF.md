# Shoebox Studio: handoff notes

_Last updated: Nov 13, 2026 (v1.5.1, live)_

## Vision
- Shoebox Studio is the **one video game that holds everything**: you make game assets, levels, stories and music, and you make whole games, all inside it. The owner's other tools plug in as stations. Their working copies stay with Claude, and the game gets big updates when the owner says so.
- Models (from the planning chat): LittleBigPlanet (Play, Create, Share) and Animal Crossing (townsfolk you craft, real clock, seasons, daily chores, a museum for crafts). Little Town is the hub, and later **any building can hold a level you made**. Dioramas ("fill a shoebox scene") can turn into playable levels. All original designs and names: no Nintendo or LBP characters, and trademarked toy names stay generic.

## How updates work (owner's rule, Nov 12, 2026)
- Small updates happen **on our end** in working copies: the private Claude artifacts, plus the `dev` branch of this repo.
- The public game (`main` branch = the live website) only gets **big, fleshed-out updates**, and only when the owner says go.
- Staged work waits on `dev`. It's in the repo but not on the website.
- **Nothing goes live without the owner's final look.** Before every big update, give the owner a private preview of the whole `dev` version to play. Push to `main` only after they say go.
- **One-time exception (Nov 13, 2026):** the owner chose to put this first update (v1.4) live right away, without the preview step ("push everything we talked about now to the website, I wanna see how it goes"). The normal rule above still applies to every future update.

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
- Private preview: none for v1.4. It was skipped on the owner's say-so (see the one-time exception above). Make one for the next big update.

## What v1.5 added (built Nov 13, 2026 by Opus in chat, live; ticket T008)
1. **The studio is a building in Little Town** ("SHOEBOX STUDIO", a cardboard shoebox on its side). Walk mode: tap it, the hero walks to the door and goes in. Build mode: tap to go in, drag to move it. It blocks walking like the house.
2. **The studio's Little Town door** now puts you outside the studio building in walk mode (was: town in build mode at the old spot). Coming in from town puts you at the studio door inside.
3. **Both buildings move** (house and studio), positions saved in the town save (`TOWN.house`, `TOWN.studio`). Old towns get a studio at a default spot (600, 470).
4. **Resume where you left off.** Save key `craftloft_where` = {s: home | house | town, walk}. Tapping the title screen goes there. Screens inside the studio (desk, class, kit, levels, toy box) resume to the studio. House position is saved as `craftloft_househero`, studio as `craftloft_lobby`, town in the town save. New players start in the studio.
5. If the hero is blocked close to a building's door (within 190 px), it goes in anyway, so you can't get stuck behind your own house.
6. Rollback copy of v1.4 is in `/v1.4/`.
- Code: search "v1.5:" comments, `BLD`, `bldAt`, `drawTownStudio`, `resume()`.
- Tests run: Playwright at 412x860 and 1280x800: studio door to town, walk into house and studio, move studio, reload resumes house / studio / town (walk mode kept), brand-new save starts in studio, all screens and Story Shelf open, no page errors.

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
- Owner plays v1.5 on the live site and says what to change.
- T009: v1.6 default starter town (Opus to plan).
- Answer the house questions, then build the first real house feature (suggested: show crafted pieces on the Display Shelf and the decoration spot, since the Toy Box already holds them).
- Pet beds: let the companion nap in its bed.
- Book nooks on the bookshelf.
- More Story Shelf tutorials and worked examples.
- Retro 3D mode (the planned work order from v1.3) and the other "coming soon" stations: Fridge Gallery, Supply Shop, Dress-up Mirror, Art Studio, Cork Board.
- Recommendation: let buildings in Little Town hold levels (the "buildings are level doors" idea). The house code is a ready pattern for it.
