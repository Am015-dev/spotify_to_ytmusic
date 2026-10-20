"""Fit the learned landing value: python3 vfit.py out_aiw.js in1.jsonl [in2.jsonl ...]  (JSON lines from vgen.js: features..., label, scenario id)
A small MLP (ReLU) with a logistic output, trained with soft labels (1 = landed, partial credit otherwise). Written as FA.AIW = {w:{}, v:{mu,sd,W,b}}."""
import sys, json, numpy as np
out = sys.argv[1]; X = []; Y = []
for f in sys.argv[2:]:
    for l in open(f):
        r = json.loads(l); X.append(r[:-2]); Y.append(r[-2])
X = np.array(X, dtype=np.float64); Y = np.array(Y, dtype=np.float64); n = len(X); print('samples', n, 'mean label', Y.mean())
mu = X.mean(0); sd = X.std(0); sd[sd < 1e-6] = 1.0; Z = (X - mu) / sd
rng = np.random.default_rng(1); perm = rng.permutation(n); nv = n // 20; vi, ti = perm[:nv], perm[nv:]
H1, H2 = 96, 48; d = Z.shape[1]
W1 = rng.normal(0, np.sqrt(2 / d), (d, H1)); b1 = np.zeros(H1); W2 = rng.normal(0, np.sqrt(2 / H1), (H1, H2)); b2 = np.zeros(H2); W3 = rng.normal(0, 0.05, (H2, 1)); b3 = np.zeros(1)
P = [W1, b1, W2, b2, W3, b3]; M = [np.zeros_like(p) for p in P]; V = [np.zeros_like(p) for p in P]; t = 0
def fwd(x):
    h1 = np.maximum(0, x @ P[0] + P[1]); h2 = np.maximum(0, h1 @ P[2] + P[3]); return h1, h2, (h2 @ P[4] + P[5])[:, 0]
def loss(idx):
    z = fwd(Z[idx])[2]; p = 1 / (1 + np.exp(-z)); y = Y[idx]; return -(y * np.log(p + 1e-9) + (1 - y) * np.log(1 - p + 1e-9)).mean()
base = Y[ti].mean(); bl = -(Y[vi] * np.log(base) + (1 - Y[vi]) * np.log(1 - base)).mean(); print('baseline val loss', bl)
lr = 2e-3; EP = int(__import__('os').environ.get('EP', 25))
for ep in range(EP):
    rng.shuffle(ti)
    for k in range(0, len(ti), 512):
        idx = ti[k:k + 512]; x = Z[idx]; y = Y[idx]; h1, h2, z = fwd(x); p = 1 / (1 + np.exp(-z)); dz = ((p - y) / len(idx))[:, None]
        g = [None] * 6; g[4] = h2.T @ dz; g[5] = dz.sum(0); d2 = (dz @ P[4].T) * (h2 > 0); g[2] = h1.T @ d2; g[3] = d2.sum(0); d1 = (d2 @ P[2].T) * (h1 > 0); g[0] = x.T @ d1; g[1] = d1.sum(0)
        t += 1
        for i in range(6):
            g[i] = g[i] + 1e-5 * P[i] if i % 2 == 0 else g[i]
            M[i] = 0.9 * M[i] + 0.1 * g[i]; V[i] = 0.999 * V[i] + 0.001 * g[i] ** 2
            P[i] -= lr * (M[i] / (1 - 0.9 ** t)) / (np.sqrt(V[i] / (1 - 0.999 ** t)) + 1e-8)
    if ep % 5 == 4 or ep == EP - 1: print('epoch', ep + 1, 'train', round(loss(ti[:20000]), 4), 'val', round(loss(vi), 4))
    if ep == int(EP * 0.7): lr *= 0.3
r = lambda a: np.round(a, 4).tolist()
v = {'mu': r(mu), 'sd': r(sd), 'W': [r(P[0].T), r(P[2].T), r(P[4].T)], 'b': [r(P[1]), r(P[3]), r(P[5])]}
open(out, 'w').write('(function (g) { var FA = g.FA = g.FA || {}; FA.AIW = { w: {}, v: ' + json.dumps(v, separators=(',', ':')) + ' }; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n')
print('wrote', out)
