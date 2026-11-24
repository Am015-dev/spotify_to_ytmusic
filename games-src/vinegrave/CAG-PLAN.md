# Vinegrave scenario lessons

## s1 wire the lesson engine into the build
files: games-src/vinegrave/build.py, games-src/vinegrave/src/body.html
kind: change
difficulty: easy
do: In build.py add 'gx-scenario-tutor.js': SH('gx-scenario-tutor.js') and 'lessons.js': os.path.join(D, 'lessons.js') to the SRC dict (SRC order does not matter, body.html order does), and add 'gx-scenario-tutor.css' to the css tuple (after 'gx-tutor.css').
- In src/body.html add `<script src="gx-scenario-tutor.js"></script>` right after the gx-tutor.js tag, and `<script src="lessons.js"></script>` as the LAST script tag, after ui.js.
- Create a stub games-src/vinegrave/lessons.js containing only `(function(){})();` so the build passes (a later step fills it).
done-when: `cd games-src/vinegrave && python3 build.py && grep -q GXST vinegrave.html && grep -q "lessons.js\|gxst" vinegrave.html`

## s2 lessons.js helpers and lessons 1-4
needs: s1
files: games-src/vinegrave/lessons.js
kind: change
difficulty: medium
do: Replace the stub with the real file, ES5 IIFE (var, function, no arrow, no const/let), about 150 lines, following the brief exactly. Model it on games-src/cauldron-fair/lessons.js (same structure: header comment, helpers, `lessons` array, `go`, setTimeout(go,300)). Lessons 1-4 only (play, dig, travel, plane); the array is extended by a later step.
done-when: `cd games-src/vinegrave && node --check lessons.js && python3 build.py`

## s3 lessons 5-8
needs: s2
files: games-src/vinegrave/lessons.js
kind: change
difficulty: medium
do: Append lessons 5-8 (discover, overcome, market, research) to the existing `lessons` array in lessons.js, same object shape and helpers, specs in the brief. Touch nothing else.
done-when: `cd games-src/vinegrave && node --check lessons.js && python3 build.py`

## s4 lessons test
needs: s3
files: games-src/vinegrave/lessons-test.js
kind: change
difficulty: medium
do: Create lessons-test.js by copying games-src/cauldron-fair/lessons-test.js and adapting it (html = vinegrave.html, storage key gxst-vinegrave, SOLVE table and targets from the brief, proof sheets to vinegrave/proof/lessons-<size>-sheet.jpg). Run it and fix the test (not the game) until it prints PASS.
done-when: `cd games-src/vinegrave && node lessons-test.js`
