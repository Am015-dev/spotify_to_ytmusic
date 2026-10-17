// Re-runnable: node games-src/facelift-3d/optimise.mjs [item-filter]
// Needs @gltf-transform/{core,extensions,functions}, meshoptimizer, sharp, three, playwright-core installed in $TOOLS (default /tmp/claude-0/tools).
// Reads games-src/facelift-3d/<game>/<item>.glb, writes games/<game>/models/<item>.glb (+ .webp 512 thumbnail).
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import http from 'http';
const TOOLS = process.env.TOOLS || '/tmp/claude-0/tools';
const req = createRequire(TOOLS + '/x.js');
const { NodeIO } = req('@gltf-transform/core');
const { ALL_EXTENSIONS } = req('@gltf-transform/extensions');
const F = req('@gltf-transform/functions');
const { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } = req('meshoptimizer');
const sharp = req('sharp');
const { chromium } = req('playwright-core');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const SRC = path.join(ROOT, 'games-src/facelift-3d');
const FILTER = process.argv[2];

// [game, item, triangle budget, base texture px, keep metal/rough texture]
// Budgets sit under the FACELIFT.md KB targets (30-300 KB); hero pieces get 1024 px.
const T = (g, i, tris, tex = 512, metal = false) => ({ g, i, tris, tex, metal });
const ITEMS = [
  T('cauldron-fair','bag',4000,512), T('cauldron-fair','chip',800,256),
  T('crown-city-smash','clampede',6000), T('crown-city-smash','dot',5000), T('crown-city-smash','fountain',3000),
  T('crown-city-smash','token-energy',500,256), T('crown-city-smash','token-heart',500,256), T('crown-city-smash','token-star',500,256),
  T('crown-city-smash','tower-a',3500), T('crown-city-smash','tower-b',3500), T('crown-city-smash','tower-c',3500), T('crown-city-smash','tower-d',3500),
  T('doorkick-dungeon','die',1500,256), T('doorkick-dungeon','door',5000,1024),
  T('doorkick-dungeon','hero-grub',3000,512), T('doorkick-dungeon','hero-morwen',3000,512), T('doorkick-dungeon','hero-pip',3000,512), T('doorkick-dungeon','hero-tansy',3000,512),
  T('final-approach','plane',6000,512,true),
  T('hollowbough','ever-tree',6000), T('hollowbough','worker',800,256),
  T('kaiten-kitchen','cloche',2500), T('kaiten-kitchen','plate',2000),
  T('lantern-dive','lantern',3500,512,true),
  T('nebula-aces','na-lancer',10000,512,true), T('nebula-aces','na-talon',14000,512,true),
  T('nebula-aces','na-rock-a',1000,256), T('nebula-aces','na-rock-b',1000,256), T('nebula-aces','na-rock-c',1000,256),
  T('rampart-and-vine','piece-champ',1800,256), T('rampart-and-vine','piece-hog',1800,256), T('rampart-and-vine','piece-mason',1800,256), T('rampart-and-vine','piece-meeple',1500,256),
  T('sands-of-qamar','camel',3000,512), T('sands-of-qamar','lamp',6000,1024,true), T('sands-of-qamar','meeple',1500,256),
  T('sands-of-qamar','palace',3000,512), T('sands-of-qamar','palm',2500,512),
  ...['carpenter','cook','explorer','friday'].map(n => T('shipwreck-isle','sw-'+n,8000,512)),
  T('shipwreck-isle','sw-fire',2500), T('shipwreck-isle','sw-palisade',3000), T('shipwreck-isle','sw-raft',3000), T('shipwreck-isle','sw-shelter',3000),
  T('shipwreck-isle','sw-palm-a',2000,256), T('shipwreck-isle','sw-palm-b',2000,256), T('shipwreck-isle','sw-palm-c',2000,256),
  T('short-fuse','bomb',6000,1024,true), T('short-fuse','pliers',9000,512,true),
  T('sunglaze','plate',2500), T('sunglaze','sun',1800,256),
  T('thornbound','crown',3500,512,true), T('thornbound','throne',6000),
  T('tidewake','junk',8000,512), T('tidewake','leviathan',10000,1024),
];
const MAX = 300 * 1024;

await MeshoptEncoder.ready; await MeshoptSimplifier.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

function triCount(doc) {
  let n = 0;
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives())
    n += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
  return n;
}

async function resizeTex(tex, px, webp) {
  const buf = await sharp(Buffer.from(tex.getImage())).resize(px, px, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: webp, effort: 5 }).toBuffer();
  tex.setImage(new Uint8Array(buf)).setMimeType('image/webp');
}

async function process_(it, tries) {
  const src = path.join(SRC, it.g, it.i + '.glb');
  const doc = await io.read(src);
  const root = doc.getRoot();
  await doc.transform(
    F.flatten(), F.join({ keepNamed: false }), F.weld(),
    F.center({ pivot: 'below' }), // y=0 at lowest point, centred on x/z
  );
  const before = triCount(doc);
  const ratio = Math.min(1, it.tris / before);
  // position+UV simplification (UV seams don't lock), permissive collapse, then sloppy as last resort
  for (const prim of root.listMeshes().flatMap(m => m.listPrimitives())) {
    const pos = prim.getAttribute('POSITION'), uv = prim.getAttribute('TEXCOORD_0');
    const idx = prim.getIndices();
    const total = idx.getCount(), target = Math.max(12, Math.floor(it.tris * 3 * total / (before * 3) / 3) * 3);
    if (total <= target * 1.03) continue;
    const P = new Float32Array(pos.getArray()), I = new Uint32Array(idx.getArray());
    const U = new Float32Array(uv.getArray());
    let out = I;
    for (const err of [0.05, 0.3, 1]) {
      [out] = MeshoptSimplifier.simplifyWithAttributes(I, P, 3, U, 2, [1], null, target, err, ['Permissive', 'Prune']);
      if (out.length <= target * 1.1) break;
    }
    if (out.length > target * 1.1) [out] = MeshoptSimplifier.simplifySloppy(I, P, 3, null, target, 1);
    idx.setArray(out.length > 65535 * 3 || true ? new Uint32Array(out) : out);
  }
  await doc.transform(F.prune(), F.unweld(), F.weld()); // drop orphaned vertices
  const mat = root.listMaterials()[0];
  const baseTex = mat.getBaseColorTexture();
  const mrTex = mat.getMetallicRoughnessTexture();
  if (baseTex) await resizeTex(baseTex, tries.tex, tries.q);
  if (it.metal && mrTex) await resizeTex(mrTex, Math.min(256, tries.tex), 70);
  else { if (mrTex) { mat.setMetallicRoughnessTexture(null); mrTex.dispose(); } mat.setMetallicFactor(0).setRoughnessFactor(0.75); }
  await doc.transform(F.prune(), F.meshopt({ encoder: MeshoptEncoder, level: 'high' }));
  return { doc, before, after: triCount(doc) };
}

const results = [];
for (const it of ITEMS) {
  if (FILTER && !(it.g + '/' + it.i).includes(FILTER)) continue;
  // retry with fewer triangles / smaller texture / lower quality until under 300 KB
  let cfg = { ...it }, tries = { tex: it.tex, q: 80 }, out, doc, before, after;
  for (let k = 0; k < 10; k++) {
    ({ doc, before, after } = await process_(cfg, tries));
    out = await io.writeBinary(doc);
    if (out.length <= MAX) break;
    // cheapest loss first: texture quality, then texture size, then triangles
    if (tries.q > 60) tries.q -= 10; else if (tries.tex > 512) tries.tex /= 2; else if (k < 4) tries.q = 55; else if (tries.tex > 256) tries.tex /= 2; else cfg.tris = Math.round(cfg.tris * 0.8);
  }
  const dir = path.join(ROOT, 'games', it.g, 'models'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, it.i + '.glb'), out);
  results.push({ ...it, kb: Math.round(out.length / 1024), tris: after, before, budget: cfg.tris, srcKb: Math.round(fs.statSync(path.join(SRC, it.g, it.i + '.glb')).size / 1024), changed: cfg.tris !== it.tris });
  console.log(it.g + '/' + it.i, results.at(-1).kb + 'KB', after, 'tris (from', before + ')');
}

// ---- thumbnails: headless three.js, 3/4 view, transparent 512x512 ----
const html = `<!doctype html><html><body style="margin:0"><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setSize(512,512);r.setClearColor(0,0);
r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;document.body.appendChild(r.domElement);
const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0xffffff,0x887766,1.6));
const d=new THREE.DirectionalLight(0xffffff,2.4);d.position.set(3,5,4);s.add(d);
const d2=new THREE.DirectionalLight(0xbbccff,0.8);d2.position.set(-4,2,-3);s.add(d2);
const L=new GLTFLoader();L.setMeshoptDecoder(MeshoptDecoder);
window.shot=async url=>{const g=await L.loadAsync(url);const o=g.scene;s.add(o);
 const b=new THREE.Box3().setFromObject(o),c=b.getCenter(new THREE.Vector3()),z=b.getSize(new THREE.Vector3());
 const rad=Math.max(z.x,z.y,z.z)*0.5*Math.sqrt(3);const cam=new THREE.PerspectiveCamera(30,1,0.01,100);
 const dist=rad/Math.sin(THREE.MathUtils.degToRad(15))*0.72;const dir=new THREE.Vector3(0.62,0.5,0.8).normalize();
 cam.position.copy(c).addScaledVector(dir,dist);cam.lookAt(c);r.render(s,cam);const u=r.domElement.toDataURL('image/png');s.remove(o);return u;};
window.ready=true;</script></body></html>`;
const srv = http.createServer((q, res) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/') { res.setHeader('content-type', 'text/html'); return res.end(html); }
  const p = u.startsWith('/three/') ? path.join(TOOLS, 'node_modules', u) : path.join(ROOT, u);
  fs.readFile(p, (e, b) => { if (e) { res.statusCode = 404; return res.end(); }
    res.setHeader('content-type', p.endsWith('.js') ? 'text/javascript' : 'application/octet-stream'); res.end(b); });
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.goto(`http://localhost:${port}/`); await page.waitForFunction('window.ready');
for (const r of results) {
  const url = `/games/${r.g}/models/${r.i}.glb`;
  const data = await page.evaluate(u => window.shot(u), url);
  const png = Buffer.from(data.split(',')[1], 'base64');
  await sharp(png).webp({ quality: 85, alpha: 'inside', alphaQuality: 90 }).toFile(path.join(ROOT, 'games', r.g, 'models', r.i + '.webp'));
}
await browser.close(); srv.close();
fs.writeFileSync(path.join(SRC, 'optimise-results.json'), JSON.stringify(results, null, 1));
console.log('done', results.length, 'models, total KB', results.reduce((a, r) => a + r.kb, 0));
