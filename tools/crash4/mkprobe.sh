#!/usr/bin/env bash
# crash-4: out/<ver>/probe.html = index.html with tools/crash4/probe.js inserted as a module before the game module
set -e;cd "$(dirname "$0")/../..";O=out/$1;python3 - "$O" <<'P'
import sys;o=sys.argv[1];h=open(o+'/index.html').read();i=h.index("<script type=\"module\">");p=open('tools/crash4/probe.js').read()
open(o+'/probe.html','w').write(h[:i]+'<script type="module">'+p+'</script>'+h[i:]);print('PROBE_OK')
P
