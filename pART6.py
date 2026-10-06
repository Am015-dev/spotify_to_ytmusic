# pART6 · no car shadows (module art6.js; art3.js lost its blob shadows) + race jump gaps the Rookie car clears at its normal
# top speed without boost (level data only: pit half-widths 36-42 → 32 m, the 206 m Main river gap → a 70 m break mid-river)
exec(open('P.py').read());exec(open('artlib.py').read())
ART_mod('art6.js')
for k,h in [("id:'gleis',name:'GLEISFELD',kind:'pit',at:[-1110,300],half:",40),("id:'a5',name:'A5',kind:'pit',at:[-1440,1575],half:",42),
            ("id:'gleis2',name:'BAHNEINSCHNITT',kind:'pit',at:[-1050,-1700],half:",36),("id:'isap',name:'ISAP',kind:'pit',at:[-552,-20],half:",40),
            ("id:'metro',name:'METRO',kind:'pit',at:[650,470],half:",38),("id:'ymit',name:'PERIFERIAKI',kind:'pit',at:[4560,2020],half:",42),
            ("id:'athinas',name:'ATHINAS',kind:'pit',at:[135,420],half:",38)]:
    if k+'32,' not in s: RR(k+'%d,'%h,k+'32,')
RR("{id:'main',name:'MAIN',kind:'river',xmin:0,xmax:9e9,","{id:'main',name:'MAIN',kind:'river',xmin:0,xmax:9e9,jw:70,")
RR("if(a>=0)J.push({...js,s0:a*ds,s1:bb*ds,floor:-6.5})","if(a>=0){let s0=a*ds,s1=bb*ds;if(js.jw&&s1-s0>js.jw){const c=(s0+s1)/2;s0=c-js.jw/2;s1=c+js.jw/2}J.push({...js,s0,s1,floor:-6.5})}")
# race traffic contact patch: the car footprint ×1.1/×1.05 instead of a 1.45×1.2 blob
RR("_s2.set(c.wid*1.45,1,c.len*1.2)","_s2.set(c.wid*1.1,1,c.len*1.05)")
# grass sits 1.5 cm (was 10 cm; tyres rest at groundAt+0.03 since pCAR22) under the physics ground: tyres touch the grass (±0.05 m); draped streets (+4.5 cm) still show (cell error ≤ 5 cm)
if "y0:(o.y0||0)-.005}" not in s: RR("{...o,hilly:TR_res,y0:(o.y0||0)-.1}","{...o,hilly:TR_res,y0:(o.y0||0)-.015}")
save()
