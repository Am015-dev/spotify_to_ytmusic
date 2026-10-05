# pART4 · boats only, edited INSIDE the live v86 vehicle block (its car grounding/shadows now belong to the cars session and stay untouched):
# boats keep their own ride height (driver stays in the hull), gentle bow rise; foam wake as before
exec(open('P.py').read());exec(open('artlib.py').read())
RR("const base=ART4_base(s,ud,boat);const land=(RO.landK||0);ud.m.position.y=base-land*.18+(boat?Math.sin((s.bob||0)*.55)*.08:0);",
   "if(!boat){const base=ART4_base(s,ud,false);const land=(RO.landK||0);ud.m.position.y=base-land*.18}")
RR("const bow=Math.min(.16,Math.abs(RO.v)*.003);ud.m.rotateX(bow)","const bow=Math.min(.06,Math.abs(RO.v)*.001);ud.m.rotateX(bow)")
save()
