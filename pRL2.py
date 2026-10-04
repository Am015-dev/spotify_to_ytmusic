# RL2 (release-82 integration, owner decision): juice's "dead time" stud trail is off. It spawned studs on the road with no hit,
# which reads as the phantom bursts the owner reported (tOB: 0 bursts without a real-hit cause). Applied after pJU1.
exec(open('P.py').read())
R("deadT:5,airMin:.8};","deadT:Infinity,airMin:.8};")
save()
