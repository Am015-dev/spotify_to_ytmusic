'use strict';
// tChkGo judging: a GO that throws (eval ReferenceError, GO exception) or never prints its pass line must be FAIL, never PASS.
const {verdict,evalError}=require('../chkgo_verdict.js');
// same path as tools/tChkGo.js: run the GO's evaluate, catch as tChkGo does, then judge
const judge=async(thunk,ctx={})=>{let said='',threw=false;try{said=(await thunk())||''}catch(e){threw=true;said=evalError(e)}return verdict({said,threw,...ctx})};
module.exports=async T=>{
 T.group('chkgo');
 const refErr=()=>{throw new ReferenceError('LAZY is not defined')};
 const r1=await judge(refErr);
 T.eq(r1.ok,false,'throw-eval-refError-is-FAIL');
 T.ok(/^EVAL ReferenceError: LAZY is not defined$/.test(r1.said),'throw-eval-one-line-text',r1.said);
 T.eq((await judge(async()=>{throw new Error('boom\nsecond line')})).ok,false,'async-throw-is-FAIL');
 T.ok(!/\n/.test((await judge(async()=>{throw new Error('a\nb')})).said),'error-text-one-line');
 T.eq((await judge(async()=>'')).ok,false,'no-pass-line-is-FAIL');
 T.eq((await judge(async()=>'Drive 40 m… ')).ok,false,'still-running-is-FAIL');
 T.eq((await judge(async()=>'Drove to the spot ✓')).ok,true,'pass-line-is-PASS');
 T.eq((await judge(async()=>'Drove to the spot ✓',{newErr:true})).ok,false,'new-page-error-is-FAIL');
 T.eq((await judge(async()=>'Drove to the spot ✓',{nav:1})).ok,false,'navigation-is-FAIL');
 T.eq((await judge(async()=>'❌ too slow')).ok,false,'BAD-text-is-FAIL');
};
