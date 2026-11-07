# AUDIT-R2: redline-rally

Read-only independent audit (W340). No game file was changed; the build was run locally and served from a local static copy.

## Checks run

- Sizes: phone 390x763 (2x), phone-s 375x553 (2x), PC 1440x860.
- Independent UI audit: `games-src/scripts/ui-audit.spec.js`, rules A-F on the title, board, panel and menu surfaces (rule C and D: no failures).
- Scenario tests: `games-src/scripts/scenarios.spec.js`, 4 `?scn=` scenarios (menu, rr-board, rr-corner, rr-result) x 3 sizes = 12 tests.

## Result

- Audit: 33 failing checks across the 3 sizes (28 unique checks).
- Scenario tests: 12 of 12 failed (68 failing checks inside them).

## Failing checks (audit)

- **B text contrast / busy background** | screen: `start` | element: `div#title.screen>div.tbox>button#playB.big` `"Play" contrast 3.50:1 (<4.5)` | measured: "Play" contrast 3.50:1 (<4.5) | pass: contrast >= 4.5:1 for the text, or a flat backing so the text is not over a busy background | sizes: phone, pc
- **B text contrast / busy background** | screen: `panel menuB` | element: `div.sheet>div>button#m3.big` `"Keep racing" contrast 3.52:1 (<4.5)` | measured: "Keep racing" contrast 3.52:1 (<4.5) | pass: contrast >= 4.5:1 for the text, or a flat backing so the text is not over a busy background | sizes: phone, phone-s
- **B text contrast / busy background** | screen: `board` | element: `div#panel>div#acts>button#goB.go` `"Go!" contrast 3.34:1 (<4.5)` | measured: "Go!" contrast 3.34:1 (<4.5) | pass: contrast >= 4.5:1 for the text, or a flat backing so the text is not over a busy background | sizes: phone, phone-s, pc
- **B text contrast / busy background** | screen: `start` | element: `div#title.screen>div.tbox>button#playB.big` `"Play" contrast 3.52:1 (<4.5)` | measured: "Play" contrast 3.52:1 (<4.5) | pass: contrast >= 4.5:1 for the text, or a flat backing so the text is not over a busy background | sizes: phone-s
- **A text size** | screen: `start` | element: `div.tbox>h1.logo>small` `"CARD-DRIVEN RACING" 14px (min 16)` | measured: "CARD-DRIVEN RACING" 14px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `start` | element: `div#title.screen>div.tbox>div.lbl` `"Track" 13px (min 16)` | measured: "Track" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `start` | element: `div#s-track.row>button.opt>small` `"Fast and flowing. Big straig" 13px (min 16)` | measured: "Fast and flowing. Big straig" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `start` | element: `div#s-track.row>button.opt>small` `"Technical. Tight bends punis" 13px (min 16)` | measured: "Technical. Tight bends punis" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `start` | element: `div#title.screen>div.tbox>div.lbl` `"Laps" 13px (min 16)` | measured: "Laps" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `start` | element: `div#title.screen>div.tbox>div.lbl` `"Rival drivers" 13px (min 16)` | measured: "Rival drivers" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `start` | element: `div#title.screen>div.tbox>div.lbl` `"Players on this device" 13px (min 16)` | measured: "Players on this device" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `start` | element: `div#title.screen>div.tbox>div.lbl` `"Rival skill" 13px (min 16)` | measured: "Rival skill" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#topbar>div.grow>span.pill` `"Lap" 14px (min 16)` | measured: "Lap" 14px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div.grow>span.pill>b#tLap` `"1/2" 14px (min 16)` | measured: "1/2" 14px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#topbar>div.grow>span.pill` `"Place" 14px (min 16)` | measured: "Place" 14px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div.grow>span.pill>b#tPos` `"5/5" 14px (min 16)` | measured: "5/5" 14px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#topbar>div.grow>span#tTrk.pill` `"Sunline Speedway" 14px (min 16)` | measured: "Sunline Speedway" 14px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#panel>div#gears>span.gl` `"Gear" 13px (min 16)` | measured: "Gear" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#gears>button.gb>i` `"-1" 13px (min 16)` | measured: "-1" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#hand>button.cd>span.t` `"Stress" 13px (min 16)` | measured: "Stress" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#panel>div.chips>span` `"Engine" 13px (min 16)` | measured: "Engine" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div.chips>span>b` `"6" 13px (min 16)` | measured: "6" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#panel>div.chips>span` `"Deck" 13px (min 16)` | measured: "Deck" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div.chips>span>b` `"8" 13px (min 16)` | measured: "8" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#panel>div.chips>span` `"Discard" 13px (min 16)` | measured: "Discard" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div.chips>span>b` `"0" 13px (min 16)` | measured: "0" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **A text size** | screen: `board` | element: `div#panel>div.chips>span` `"Heat in hand" 13px (min 16)` | measured: "Heat in hand" 13px (min 16) | pass: font >= 13px on phone sizes, >= 16px at PC width | sizes: pc
- **B text contrast / busy background** | screen: `panel menuB` | element: `div.sheet>div>button#m3.big` `"Keep racing" contrast 3.50:1 (<4.5)` | measured: "Keep racing" contrast 3.50:1 (<4.5) | pass: contrast >= 4.5:1 for the text, or a flat backing so the text is not over a busy background | sizes: pc

## Failing checks (scenarios)

- **text clipping (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: no text clipped: N=1 [board menuB] text clipped: "Sunline Speedway" <span#tTrk.pill in div.grow 185,3,-11,4> | pass: text fits its box (no clipping)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: every font a loaded shelf face: N=60 [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Redline Rally" <h1.logo> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "CARD-DRIVEN RACING" <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Track" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Sunline Speedway" <button.opt.on> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Fast and flowing. Big " <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Hairpin Hill" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Technical. Tight bends" <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Laps" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "1 lap" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "2 laps" <button.opt.on> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "3 laps" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Rival drivers" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "1" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "2" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **scenario check** | scenario: `?scn=menu` (phone 390x763) | element/measured: no text covered at its centre: N=1 [board] text not topmost: "Sunline Speedway" <span#tTrk.pill> is under <button#menuB> | pass: check passes
- **scenario check** | scenario: `?scn=menu` (phone 390x763) | element/measured: no box or text cut by the screen edge or an overflow:hidden parent: N=2 [board] cut by overflow:hidden <div.grow> (11 px): text "Sunline Speedway" <span#tTrk.pill> | pass: check passes
- **scenario check** | scenario: `?scn=menu` (phone 390x763) | element/measured: [board] cut by overflow:hidden <div.grow> (21 px): box "Sunline Speedway" <span#tTrk.pill> | pass: check passes
- **text clipping (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: text clipped: "Sunline Speedway" <span#tTrk.pill in div.grow 185,3,-11,4> | pass: text fits its box (no clipping)
- **data-engine read (scenario)** | scenario: `?scn=menu` (phone 390x763) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **text clipping (scenario)** | scenario: `?scn=rr-board` (phone 390x763) | element/measured: text clipped: "Sunline Speedway" <span#tTrk.pill in div.grow 182,3,-8,4> | pass: text fits its box (no clipping)
- **data-engine read (scenario)** | scenario: `?scn=rr-board` (phone 390x763) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **data-engine read (scenario)** | scenario: `?scn=rr-corner` (phone 390x763) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **text clipping (scenario)** | scenario: `?scn=rr-result` (phone 390x763) | element/measured: text clipped: "Sunline Speedway" <span#tTrk.pill in div.grow 182,3,-8,4> | pass: text fits its box (no clipping)
- **data-engine read (scenario)** | scenario: `?scn=rr-result` (phone 390x763) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **text clipping (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: no text clipped: N=1 [board menuB] text clipped: "Sunline Speedway" <span#tTrk.pill in div.grow 182,3,-23,4> | pass: text fits its box (no clipping)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: every font a loaded shelf face: N=60 [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Redline Rally" <h1.logo> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "CARD-DRIVEN RACING" <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Track" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Sunline Speedway" <button.opt.on> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Fast and flowing. Big " <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Hairpin Hill" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Technical. Tight bends" <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Laps" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "1 lap" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "2 laps" <button.opt.on> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "3 laps" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Rival drivers" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "1" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "2" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **scenario check** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: no text covered at its centre: N=1 [board] text not topmost: "Sunline Speedway" <span#tTrk.pill> is under <button#menuB> | pass: check passes
- **scenario check** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: no box or text cut by the screen edge or an overflow:hidden parent: N=2 [board] cut by overflow:hidden <div.grow> (23 px): text "Sunline Speedway" <span#tTrk.pill> | pass: check passes
- **scenario check** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: [board] cut by overflow:hidden <div.grow> (33 px): box "Sunline Speedway" <span#tTrk.pill> | pass: check passes
- **text clipping (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: text clipped: "Sunline Speedway" <span#tTrk.pill in div.grow 182,3,-23,4> | pass: text fits its box (no clipping)
- **data-engine read (scenario)** | scenario: `?scn=menu` (phone-s 375x553) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **text clipping (scenario)** | scenario: `?scn=rr-board` (phone-s 375x553) | element/measured: text clipped: "Sunline Speedway" <span#tTrk.pill in div.grow 182,3,-23,4> | pass: text fits its box (no clipping)
- **data-engine read (scenario)** | scenario: `?scn=rr-board` (phone-s 375x553) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **data-engine read (scenario)** | scenario: `?scn=rr-corner` (phone-s 375x553) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **text clipping (scenario)** | scenario: `?scn=rr-result` (phone-s 375x553) | element/measured: text clipped: "Sunline Speedway" <span#tTrk.pill in div.grow 182,3,-23,4> | pass: text fits its box (no clipping)
- **data-engine read (scenario)** | scenario: `?scn=rr-result` (phone-s 375x553) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: every font a loaded shelf face: N=61 [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Redline Rally" <h1.logo> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "CARD-DRIVEN RACING" <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Track" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Sunline Speedway" <button.opt.on> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Fast and flowing. Big " <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Hairpin Hill" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Technical. Tight bends" <small> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Laps" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "1 lap" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "2 laps" <button.opt.on> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "3 laps" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "Rival drivers" <div.lbl> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "1" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **font check (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: [title] font "system-ui" is not a shelf face (Cinzel / Alegreya Sans): "2" <button.opt> | pass: font loaded from Cinzel / Alegreya Sans (@font-face present)
- **data-engine read (scenario)** | scenario: `?scn=menu` (PC 1440x860) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **data-engine read (scenario)** | scenario: `?scn=rr-board` (PC 1440x860) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **data-engine read (scenario)** | scenario: `?scn=rr-corner` (PC 1440x860) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing
- **data-engine read (scenario)** | scenario: `?scn=rr-result` (PC 1440x860) | element/measured: data-engine "G.cars.0.eng" threw Unexpected number | pass: data hook reads the value without throwing

