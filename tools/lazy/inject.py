import sys,os   # stdin = page text, env XCV = {name:hash} JSON -> stdout (replaces the /*XCV*/{}/*end*/ placeholder of src/10z_lazy.js)
s=sys.stdin.read();a='/*XCV*/{}/*end*/';assert a in s,'XCV placeholder missing';sys.stdout.write(s.replace(a,'/*XCV*/'+os.environ['XCV']+'/*end*/',1))
