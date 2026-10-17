'use strict';
// tChkGo verdict for ONE checklist GO. PASS only when the GO printed a pass line: no throw, no eval error, not still "…" (never finished),
// no BAD text, no new page error, no navigation. Anything else is FAIL. Shared by tools/tChkGo.js and tools/unit/logic_chkgo.js.
const BAD=/❌|can't|no .* nearby|loading a test drive|first|get back|works while/i;
// error text on ONE line (the report is one line per item)
const oneLine=s=>String(s).replace(/\s+/g,' ').trim().slice(0,200);
const evalError=e=>'EVAL '+oneLine(e&&e.message?e.name+': '+e.message:e);
// said: what the GO printed; threw: the eval or the GO raised; newErr: a page error arrived during the item; nav: the page navigated
function verdict({said,threw=false,newErr=false,nav=0}){
  const s=oneLine(said||'');
  const ok=!threw&&!!s&&!/…$/.test(s)&&!BAD.test(s)&&!newErr&&!nav;
  return {ok,said:s};
}
module.exports={verdict,evalError,oneLine};
