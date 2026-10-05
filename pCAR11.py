# CAR11: the district card ("MESSE · 0% COMPLETE") no longer covers the screen centre while driving: small top-right toast,
# name + percentage only, at most 2 s.
exec(open('P.py').read())
if 'crToast' in s:
    print('OK');raise SystemExit
JS=r'''
(()=>{const st=document.createElement('style');st.id='crToast';st.textContent=`
html body #ogArea{left:auto!important;right:calc(12px + env(safe-area-inset-right,0px))!important;top:calc(10px + env(safe-area-inset-top,0px))!important;transform:none!important;max-width:200px!important;padding:4px 10px!important;border-radius:10px!important;text-align:right!important;font-size:12px!important}
html body #ogArea b{font-size:13px!important;letter-spacing:.05em!important}html body #ogArea em{font-size:12px!important;display:inline!important;margin-left:6px}
html body #ogArea .ogBar,html body #ogArea span{display:none!important}`;document.head.appendChild(st)})();
OG_pop=(f=>function(a,first){f(a,first);OG.popT=Math.min(OG.popT||0,2)})(OG_pop);
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
save()
print('OK')
