// What to check per picture type, plus the auto-check verdict (flow_qa.py -> logs/flow_qa, served in flow.json as item.qa).
// Shown next to the picture in the review screens of assets.html (lightbox) and board.html (Review new images).
(() => {
  const TIPS = {
    all: ['Matches its name and prompt (a slow Flow run can save a late picture under the next name)', 'No text, letters, numbers or logos',
      'Nothing cut off at the edges', 'Not a duplicate of a neighbour'],
    cutout: ['Background white or near-white: a painted or dark background stays as a solid square after keying', 'One object, centred, readable at 24 px'],
    plate: ['Centre empty and calm: live text goes there', 'Even border all round, corners intact (the middle stretches, the corners stay)',
      'Bars and heads repeat cleanly left to right, no big feature at one end'],
    pose: ['Same character as its reference: colours, outfit, markings, proportions', 'Flat single background colour; whole body (or the same bust framing) in frame',
      'No extra or melted limbs; held items correct', 'Fits the set: same style, scale and framing as this character\'s other poses'],
    '3d': ['No black ink outlines, glow, neon, shadow or rim light (they get baked into the model)', 'Every part thick and solid: no thin sails, fronds, handles or flames',
      'Plain light-grey background, one subject, slight 3/4 view at eye level'],
    scene: ['A quiet area where the title or the board sits', 'Fills the frame; no text'],
    art: ['Reads well at the size it is shown in the game'],
  };
  const NAME = { cutout: 'Cut-out', plate: 'Plate / frame', pose: 'Pose', '3d': '3D source', scene: 'Background', art: 'Painting' };
  const type = i => {
    const n = i.name || '', p = (i.prompt || '').toLowerCase();
    if (i.root === 'flow-3d' || /^3D (wave|sources)/.test(i.wave || '')) return '3d';
    if (i.wave === 'Boss poses' || p.includes('pose:')) return 'pose';
    if (/plate|frame|panel|button|btn|nametag|nameplate|pill|-bar$|-head$|topbar|bubble|ribbon|sheet|tray|slot|chip|row$|-seat/.test(n)) return 'plate';
    if (/^(ttl-bg|table-|title|bg-|back-|cover)/.test(n) || p.includes('background picture')) return 'scene';
    if (p.includes('white background')) return 'cutout';
    return 'art';
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const qa = q => {
    if (!q) return '<div style="color:#9599a1">Auto check: not run for this picture yet</div>';
    if (q.ok === true) return '<div style="color:#4cb36b">Auto check: no defects found (it does not judge style, sets or 9-slice: check those)</div>';
    if (q.ok === false) return `<div style="color:#e0574a"><b>Auto check flagged:</b><ul style="margin:4px 0 0 18px;padding:0">${(q.issues || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    return '<div style="color:#f2b33d"><b>UNCHECKED</b>: the auto check refused this picture. Check every point yourself.</div>';
  };
  window.reviewTips = i => {
    if (!i || i.kind === '3d' && i.glb) return '';  // finished 3D models are voted on the 3D page
    const t = type(i);
    return `<details open style="border:1px solid #2d3138;border-radius:8px;padding:8px 10px;font-size:12.5px;line-height:1.4">
      <summary style="cursor:pointer;font-weight:600">What to check · ${NAME[t]}</summary>
      <div style="margin:6px 0">${qa(i.qa)}</div>
      <ul style="margin:0 0 0 18px;padding:0">${[...TIPS[t], ...TIPS.all].map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>`;
  };
})();
