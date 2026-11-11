// node audio/test/jsdom.test.js [slug]
// Loads gameaudio.js + one audio-data.js into jsdom (no Web Audio) and checks that nothing throws.
// Also runs against stub AudioContexts that throw or fail to decode, to prove the synth fallback path.
const fs = require('fs'), path = require('path');
const { JSDOM } = require(path.join(__dirname, '../../node_modules/jsdom'));
const A = path.join(__dirname, '..');
const slug = process.argv[2] || 'sands';
const GA_SRC = fs.readFileSync(path.join(A, 'gameaudio.js'), 'utf8');
const DATA_SRC = fs.readFileSync(path.join(A, slug, 'audio-data.js'), 'utf8');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

function run(label, setup) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><body><button id=b>x</button></body>', { runScripts: 'dangerously', url: 'https://example.test/' });
  const w = dom.window;
  w.addEventListener('error', e => errors.push(e.message));
  w.console.error = (...a) => errors.push(a.join(' '));
  if (setup) setup(w);
  const s = w.document.createElement('script');
  s.textContent = GA_SRC + '\n' + DATA_SRC + `
  window.__r = (function(){
    var out = {};
    out.init = GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'t'});
    out.hasBefore = GA.has(Object.keys(GA_DATA.sfx)[0]);
    document.getElementById('b').dispatchEvent(new Event('pointerdown',{bubbles:true}));
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'a'}));
    out.play = GA.play('click', {vol:.5, rate:1.2, pan:-.3, jitter:.1});
    out.playMissing = GA.play('nope');
    out.loop = GA.loop('rain'); out.stop = GA.stopLoop('rain');
    out.music = GA.music(Object.keys(GA_DATA.music)[0]); out.musicOff = GA.music(null);
    out.sfx = GA.setSfx(false); out.sfx2 = GA.setSfx(true);
    out.mus = GA.setMusic(false); out.mus2 = GA.setMusic(true);
    out.vol = GA.setVolume('music', 2); out.vol2 = GA.setVolume('sfx', -1);
    out.garbage = [GA.play(), GA.play(null, 5), GA.loop({}), GA.init(null), GA.init({sfx:{bad:'!!!not base64'}}), GA.music(42)];
    out.state = GA.state();
    out.hasAfter = GA.has('click');
    return out;
  })();`;
  let threw = null;
  try { w.document.body.appendChild(s); } catch (e) { threw = e; }
  return new Promise(res => setTimeout(() => {
    const r = w.__r;
    ok(!threw && r, `${label}: script ran without throwing`);
    ok(errors.length === 0, `${label}: no window errors ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
    if (r) {
      ok(r.hasBefore === false && r.hasAfter === false, `${label}: GA.has() false (synth fallback stays active)`);
      ok(r.play === false && r.playMissing === false, `${label}: GA.play returns false silently`);
      ok(r.vol === 1 && r.vol2 === 0, `${label}: volumes clamp`);
      let persisted = null; try { persisted = w.localStorage.getItem('t_ga_musvol'); } catch (e) {}
      ok(persisted === '1' || label.includes('storage'), `${label}: volume persisted in localStorage (${persisted})`);
      ok(r.state && r.state.total >= 20, `${label}: state() works (${JSON.stringify({audio: r.state.audio, decoded: r.state.decoded, total: r.state.total})})`);
    }
    res();
  }, 150));
}

(async () => {
  console.log(`gameaudio.js + ${slug}/audio-data.js`);
  await run('plain jsdom (no AudioContext)');
  await run('AudioContext constructor throws', w => { w.AudioContext = function () { throw new Error('boom'); }; });
  await run('decodeAudioData always fails', w => {
    w.AudioContext = function () {
      const p = { value: 1, setTargetAtTime() {}, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} };
      this.state = 'running'; this.currentTime = 0; this.destination = {};
      this.createGain = () => ({ gain: Object.assign({}, p), connect() {} });
      this.resume = () => Promise.resolve();
      this.decodeAudioData = (ab, okcb, errcb) => { setTimeout(() => errcb && errcb(new Error('EncodingError')), 0); return Promise.reject(new Error('EncodingError')); };
    };
  });
  await run('localStorage throws (storage blocked)', w => {
    Object.defineProperty(w, 'localStorage', { get() { throw new Error('SecurityError'); } });
  });
  await run('atob missing', w => { w.atob = undefined; });
  console.log(fails ? `\n${fails} FAILED` : '\nall passed');
  process.exit(fails ? 1 : 0);
})();
