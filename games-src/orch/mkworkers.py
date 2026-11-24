#!/usr/bin/env python3
"""raw-sessions.jsonl (one get_session/list_sessions record per line) -> workers.json for the dashboard."""
import json, datetime, os
SP = os.path.dirname(os.path.abspath(__file__))
recs = {}
for line in open(os.path.join(SP, 'raw-sessions.jsonl')):
    line = line.strip()
    if not line:
        continue
    try:
        o = json.loads(line)
    except Exception:
        continue
    o = o.get('ccr', o)
    if 'id' not in o:
        continue
    old = recs.get(o['id'], {})
    old.update({k: v for k, v in o.items() if v not in (None, '', {}, [])})
    recs[o['id']] = old
GAMES = ['twin-thrones','meadowfold','hollowbough','lantern-dive','crown-city-smash','doorkick','thornbound','redline-rally','perch-and-plume','stitchwise','cauldron-fair','shipwreck','short-fuse','kaiten-kitchen','nebula-aces','final-approach','emberclimb','sunglaze','sands-of-qamar','vale-of-banners','wildmark','tidewake','rampart-and-vine','vinegrave','ochre-horizon','vellum-shire','onyx-atelier']
ALIAS = {'mars':'ochre-horizon','estate':'vellum-shire','harmony':'meadowfold','gem':'onyx-atelier','roman':'roman trade (new)','mosaic':'roman trade (new)','dungeon':'dungeon crawler (new)','epic':'fantasy war (new)','pcaudit':'PC layout','calm':'shared / shell','vale':'vale-of-banners','sands':'sands-of-qamar','crown':'crown-city-smash','kaiten':'kaiten-kitchen','nebula':'nebula-aces','perch':'perch-and-plume','redline':'redline-rally','rampart':'rampart-and-vine','lantern':'lantern-dive','cauldron':'cauldron-fair'}
def game_of(t):
    t = t.lower()
    for g in GAMES:
        if g in t:
            return g
    for k, v in ALIAS.items():
        if k in t:
            return v
    return 'other'
out = []
for o in recs.values():
    if o.get('created_at', '') < open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'reset.txt')).read().strip():
        continue
    t = o.get('title', '')
    tag, _, task = t.partition(':')
    em = o.get('external_metadata', {}) or {}
    pts = o.get('post_turn_summary') or em.get('post_turn_summary') or {}
    u = em.get('usage', {}) or {}
    br = ''
    try:
        br = o['session_context']['outcomes'][0]['git_repository']['git_info']['branches'][0]
    except Exception:
        br = (em.get('current_branches') or {}).get('', '')
    model = o.get('configured_model') or (o.get('session_context') or {}).get('model', '')
    out.append(dict(
        id=o['id'], game=game_of(t), tag=tag.strip(), task=task.strip() or t,
        model=model.replace('claude-', '').replace('-5-5', ' 5.5'),
        bucket=o.get('status_bucket', '').replace('SESSION_STATUS_BUCKET_', '').lower(),
        summary=pts.get('recent_action') or pts.get('status_detail') or o.get('task_summary') or em.get('task_summary') or '',
        created=o.get('created_at'), updated=o.get('updated_at'), branch=br,
        tokens_out=u.get('output_tokens'), cache_read=u.get('cache_read_tokens'),
        cost_usd=u.get('cost_usd'), context_used=(em.get('context_usage') or {}).get('used_tokens') or None))
json.dump(dict(updated=datetime.datetime.now(datetime.UTC).isoformat(), workers=out),
          open(os.path.join(SP, 'workers.json'), 'w'), indent=1)
print(len(out), 'workers;', sum(1 for w in out if w['bucket'] == 'working'), 'working')
