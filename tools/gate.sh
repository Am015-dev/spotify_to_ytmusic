#!/bin/bash
# gate.sh <url of the BUILT page> [outdir]: the deploy gate (rule 12 phone profile (iPhone UA + touch 852x393), built page): TAG=why,life1,xf1,terrain on fra+ath in parallel. Prints PASS/FAIL + fail list.
U=${1:-http://localhost:8812/index.html}; O=${2:-/tmp/gate}
R=$(PHONE=1 TAG=${TAG:-why,life1,xf1,terrain} tools/tGo.sh "$U" "$O" | tail -1)
node -e "const r=JSON.parse(process.argv[1]);console.log((r.fail.length||r.errors?'FAIL ':'PASS ')+r.pass+'/'+r.total+' '+JSON.stringify(r.fail)+' errors='+r.errors+' wall='+r.wall_s+'s')" "$R"
