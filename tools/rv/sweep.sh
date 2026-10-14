#!/bin/bash
# sweep.sh <city> <views.json> <outdir>
S=$(cd $(dirname $0) && pwd)
curl -s --max-time 600 -X POST "http://127.0.0.1:8897/eval?city=$1" --data-binary @$S/rvlib.js; echo
python3 - "$@" > $S/run_$1.js <<'P'
import json,sys
S=__import__('os').environ['RVS']+'/'
c,v,o=sys.argv[1:4]
print("globalThis.__RVOUT=%s;globalThis.__RVVIEWS=%s;globalThis.__RVMET=%s;"%(json.dumps(o),open(v).read(),json.dumps(open(S+'met.js').read())))
print("const require=globalThis.require;")
print(open(S+'sweep_body.js').read())
P
curl -s --max-time 3000 -X POST "http://127.0.0.1:8897/run?city=$1" --data-binary @$S/run_$1.js; echo
