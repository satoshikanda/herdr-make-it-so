# Sources and changes

Retrieved 2026-11-04.

- Official Herdr gallery: https://herdr.dev/gallery/
- Original LCARS recipe: https://github.com/jkuepker/herdr-layouts/blob/main/lcars/RECIPE.md
- Original code: https://github.com/jkuepker/herdr-layouts/blob/main/lcars/mods/lcars/main.js (reported modification 2026-10-29T23:11:27Z)
- Original layout: https://github.com/jkuepker/herdr-layouts/blob/main/lcars/layouts/lcars.json (reported modification 2026-10-29T20:20:23Z)
- Original license: https://github.com/jkuepker/herdr-layouts/blob/main/LICENSE — MIT, Copyright (c) 2026 Josef Kuepker. Full notice retained in LICENSE.
- Official app guide: https://github.com/herdrdev/herdr-app/blob/master/defaults/AGENTS.md
- Official app API: https://github.com/herdrdev/herdr-app/blob/master/defaults/herdr.d.ts
- Official window-button usage: https://github.com/herdrdev/herdr-app/blob/master/defaults/mods/tabs/main.js

This package is a modified distribution of the MIT-licensed LCARS code and layout, not an independently invented implementation. Modifications: independent `make-it-so` namespace; remove all Shepherdr integration, HTTP polling, filesystem reads and shell execution; scrollable sidebar and bounded machine picker; unavailable local core handling; clock timers only in clock-bearing parts; native window action buttons with original SVGs; built-in fonts; tests and Japanese guide. The MIT terms cover the software modifications and original supporting code/documentation, only to the extent contributors can license them. They do not relicense the separately licensed Antonio font, visual references, franchise marks/designs, or all underlying elements in screenshots. See THIRD-PARTY-NOTICES.md for the scope and remaining rights limitations.

The original release bundled no fonts. Refit 02 adds Antonio under its separate OFL license below. No Lucide icons or upstream screenshots are distributed. The preview is an original schematic with fictional sample data, not a native runtime screenshot.


## Refit 02: visual research (2026-11-05)

Four reference images were downloaded privately and visually inspected, following image searches for classic TNG panels, Okudagrams and Picard screens. They are not redistributed in this package.

1. TNG Descent sensor prop image: https://wrathofdhanprops.blogspot.com/2018/06/okudagrams-part-ii-creating-24th.html
   Direct reference: https://2.bp.blogspot.com/-t81uNO8SLs8/WyHAP1Kgv2I/AAAAAAAAC_U/2f7AKm6N0O0t2JTGr3yqLM9dSlKacYZ0gCLcBGAs/s1600/Descent.jpg
   Applied: cream and lavender elbows, black gutters, tightly condensed headings, aligned numeric columns. No diagram or text copied.
2. TNG operations/communications panel compilation: https://www.universostartrek.com/star_trek_lcars.htm
   Direct reference: https://www.universostartrek.com/lcars_tng_1.jpg
   Applied: large curved color slabs, labels in slab corners, half-rounded row ends, unequal colored segments. Secondary/fan reference, not treated as verified production artwork.
3. Iconomancy Science I reconstruction: https://www.iconomancy.com/lcars-tng
   Direct reference: https://images.squarespace-cdn.com/content/v1/683483060b36be3d1e492bcd/1b305630-b716-4cb8-8d7f-86b55c3bf896/LCARS%2BScience%2B1%2BConsole.png?format=1500w
   Applied: hierarchy between narrow labels and large counters; cream, peach and mauve pairing. This is a recreation reference, not original production art.
4. Titan ready-room graphic reference: https://picard.trekcore.com/gallery/thumbnails.php?album=73&page=6&sort=dd
   Direct reference: https://picard.trekcore.com/gallery/albums/behind-the-scenes/s3-production/304-titan-ready-room-graphic.jpg
   Image itself credits a recreation by Michael Overton based on original artwork by Andrew Jarvis. Applied: restrained dark secondary rails, thin parallel strips and short data-index groups. No starship art, schematic or image is embedded.

A Julien's Auctions Enterprise-D image returned HTTP 503 and was not used as a visually confirmed reference.

Typography reference: https://www.thelcars.com/fonts.php (site author's discussion of compressed fonts and Antonio; used as contemporary implementation reference, not an official Star Trek specification).

## Antonio font (separate license)

- Official Google Fonts metadata: https://github.com/google/fonts/blob/main/ofl/antonio/METADATA.pb
- Font: https://raw.githubusercontent.com/google/fonts/main/ofl/antonio/Antonio%5Bwght%5D.ttf
- License: https://raw.githubusercontent.com/google/fonts/main/ofl/antonio/OFL.txt
- Copyright 2013 The Antonio Project Authors. Unmodified variable font; SIL Open Font License 1.1 retained at mods/make-it-so/fonts/OFL.txt. This license applies to the font, not the MIT code.

Refit changes: local Antonio typography; compact 188px sidebar; deeper 58/38px upper elbow; unequal segmented rails; half-rounded tabs; thin native-pane frames; three numbered sidebar groups; real session counters; explicit empty Agent state; actual date instead of decorative stardate; accurate machine count. No source imagery or fictional telemetry added. Original version preserved separately before changes.

現行のプレビューは自作の概念図です。第三者の参照画像・劇中素材・実アプリのスクリーンショットは同梱していません。名称と画面表示は独立した「Make it so」の名称を使用しています。
