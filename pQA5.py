# pQA5 · Athens density down to Frankfurt levels. tPlay: Athens 9–22 smashes/min and 4–6 traffic cars within 120 m,
# Frankfurt 6–8 smashes/min and 1–2 cars. Athens keeps 2 of every 5 traffic cars, and 5 of every 9 small street props (trees stay).
exec(open('P.py').read())
R("CT.push(performance.now());OC_props(L,D);HUB.props=L;",
  "if(CID!=='fra'){let j=0,k=0;for(const p of L){if(!/tree|palm|bush|cypress|olive|pine|plant/i.test(p.t)&&(k++%9)<4)continue;L[j++]=p}L.length=j}CT.push(performance.now());OC_props(L,D);HUB.props=L;")
R('window.__mho={','''// QA5: thinner Athens traffic (cars parked dead stay hidden; hubTrafficStep never revives dead=1e9)
buildHubTraffic=(f=>function(){const r=f.apply(this,arguments);if(CID!=='fra'&&HUB.cars)HUB.cars.forEach((c,i)=>{if(i%5>1)c.dead=1e9});return r})(buildHubTraffic);
window.__mho={''')
save()
