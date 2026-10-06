# pART6 · no car shadows (module art6.js; art3.js lost its blob shadows) + race jump gaps the Rookie car clears at its normal
# top speed without boost (level data/geometry only: city ramps ≥ 0.36 slope, pit half-widths 36-42 → 32 m, the 206 m Main river gap → a 70 m break mid-river)
exec(open('P.py').read());exec(open('artlib.py').read())
ART_mod('art6.js')
for k,h in [("id:'gleis',name:'GLEISFELD',kind:'pit',at:[-1110,300],half:",40),("id:'a5',name:'A5',kind:'pit',at:[-1440,1575],half:",42),
            ("id:'gleis2',name:'BAHNEINSCHNITT',kind:'pit',at:[-1050,-1700],half:",36),("id:'isap',name:'ISAP',kind:'pit',at:[-552,-20],half:",40),
            ("id:'metro',name:'METRO',kind:'pit',at:[650,470],half:",38),("id:'ymit',name:'PERIFERIAKI',kind:'pit',at:[4560,2020],half:",42),
            ("id:'athinas',name:'ATHINAS',kind:'pit',at:[135,420],half:",38)]:
    if k+'32,' not in s: RR(k+'%d,'%h,k+'32,')
RR("{id:'main',name:'MAIN',kind:'river',xmin:0,xmax:9e9,","{id:'main',name:'MAIN',kind:'river',xmin:0,xmax:9e9,jw:70,")
RR("if(a>=0)J.push({...js,s0:a*ds,s1:bb*ds,floor:-6.5})","if(a>=0){let s0=a*ds,s1=bb*ds;if(js.jw&&s1-s0>js.jw){const c=(s0+s1)/2;s0=c-js.jw/2;s1=c+js.jw/2}J.push({...js,s0,s1,floor:-6.5})}")
# city ramps: at least 0.36 rise per metre (same height, shorter run) so a 150 km/h takeoff flies 63+ m (the hardest city jump goal is 60 m)
RR("function addRamp(x,z,h,len,hgt,w,col,Y0){","function addRamp(x,z,h,len,hgt,w,col,Y0){if(hgt>0&&len>9&&hgt/len<.36)len=hgt/.36;")
save()
