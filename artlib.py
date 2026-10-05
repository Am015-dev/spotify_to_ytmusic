# art patch helpers: modules live between /*ART<name>*/ … /*ART</name>*/ markers and are swapped in place on rebuilds;
# the v86 module texts (deployed without markers) are removed first; anchor edits are skipped when already applied.
import subprocess
def ART_mod(name):
    global s
    body=open(name).read();o,c='/*ART<%s>*/'%name,'/*ART</%s>*/'%name
    try:
        if name=='art4.js': raise Exception('keep')
        old=subprocess.run(['git','show','3b8ef17:'+name],capture_output=True,text=True).stdout
        if old and old in s: s=s.replace(old+'\n','',1) if old+'\n' in s else s.replace(old,'',1)
    except Exception: pass
    if o in s:
        i=s.index(o);j=s.index(c,i)+len(c);s=s[:i]+o+body+c+s[j:]
    else: R('window.__mho={',o+body+c+'\nwindow.__mho={')
def RR(a,b):
    if b in s: return
    if a in s: R(a,b)
    else: raise SystemExit('ANCHOR MISSING: '+a[:80])
