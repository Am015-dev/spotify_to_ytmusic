// Emits the numeric setup block of every mission (no names, no rule text) from the research file.
const M=require('../../missions.json').missions;
const rng=s=>{if(!s)return null;const m=String(s).match(/([\d.]+)-([\d.]+)/);return m?[+m[1],+m[2]]:null};
function col(c){if(!c||c.mode==='none')return null;const o={m:c.mode==='out_of'?'of':c.mode};
  if(c.mode==='exact')o.n=c.count;if(c.mode==='out_of'){o.n=c.keep;o.of=c.of}if(c.mode==='fixed'){o.vals=c.values;o.n=c.values.length}
  const r=rng(c.candidates);if(r)o.cand=r;if(c.dealing&&c.dealing!=='shuffled')o.deal=c.dealing;return o}
const out=[];
for(const x of M){const w=x.wires;const o={n:x.number};if(x.players.length!==4)o.pl=x.players;
  const bm=rng(w.blue.values)[1];if(bm!==12)o.blue=bm;const r=col(w.red),y=col(w.yellow);if(r)o.red=r;if(y)o.yel=y;
  const t=x.two_player_overrides||{};const tw={};if(t.red)tw.red=col(t.red);if(t.yellow)tw.yel=col(t.yellow);if(t.captain_no_opening_info)tw.capNoInfo=1;if(t.captain_random_opening_info)tw.capRandInfo=1;
  if(Object.keys(tw).length)o.two=tw;
  const d=x.detonator.start;if(d!=='players')o.dial=d;
  const e=x.equipment;const eo={};if(e.count!=='players')eo.n=e.count;if(e.exclude&&e.exclude.length)eo.ex=e.exclude;if(e.fixed)eo.fixed=e.fixed;if(Object.keys(eo).length)o.eq=eo;
  const c=x.characters||{};if(c.mode&&c.mode!=='standard')o.chars=c.mode;if(c.exclude)o.chEx=c.exclude;
  if(x.timer)o.timer=x.timer.two_player_seconds?{s:x.timer.seconds,s2:x.timer.two_player_seconds}:{s:x.timer.seconds};
  out.push(JSON.stringify(o))}
console.log('const MISSION_SETUP=[\n'+out.join(',\n')+'];');
