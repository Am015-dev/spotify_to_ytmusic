# pART4 · player car on the road (per-wheel suspension, body-only pitch), steering front wheels, tyre shadows; boats in the water (module art4.js)
exec(open('P.py').read());exec(open('artlib.py').read())
RR("s.pitch=(s.pitch||0)+(clamp(-acc*.006,-.14,.14)+wP-(s.pitch||0))","s.pitch=(s.pitch||0)+(clamp(acc*.004,-.09,.09)+wP-(s.pitch||0))")
ART_mod('art4.js');save()
