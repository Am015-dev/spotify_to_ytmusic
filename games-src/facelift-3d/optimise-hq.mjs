// Re-runnable: node games-src/facelift-3d/optimise-hq.mjs [item-filter] [--no-sprites]
// Needs @gltf-transform/{core,extensions,functions}, meshoptimizer, sharp, three, playwright-core in $TOOLS (default /tmp/claude-0/tools).
// Reads games-src/facelift-3d/<game>/<item>.glb and writes the FULL-DETAIL files:
//   games/<game>/models/<item>.glb       HQ (all source triangles, 1024 px textures, meshopt 16/10/14-bit)
//   games/<game>/models/<item>.webp      1024 px sprite (rendered at 2048, 4x MSAA, downscaled)
//   games/<game>/models/<item>@512.webp  512 px sprite
// <item>-lite.glb is the old small version made by optimise.mjs (kept as is; copy it before running the old script again).
// Never decimate below 40k triangles or 1024 px textures without the owner's OK; above 40k we simplify to 40k with a tiny error.
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
const FILTER = process.argv.slice(2).find(a => !a.startsWith('--'));
const SPRITES = !process.argv.includes('--no-sprites');
const MAX_TRIS = 40000;

// the 57 items of optimise-results.json (the -t60000/-t120000 tower-c variants stay out)
const ITEMS = JSON.parse(fs.readFileSync(path.join(SRC, 'optimise-results.json'), 'utf8')).map(r => ({ g: r.g, i: r.i }));

await MeshoptEncoder.ready; await MeshoptSimplifier.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const triCount = doc => doc.getRoot().listMeshes().flatMap(m => m.listPrimitives())
  .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0);

const results = [];
for (const it of ITEMS) {
  if (FILTER && !(it.g + '/' + it.i).includes(FILTER)) continue;
  const srcPath = path.join(SRC, it.g, it.i + '.glb');
  const doc = await io.read(srcPath);
  const root = doc.getRoot();
  await doc.transform(F.flatten(), F.join({ keepNamed: false }), F.weld(), F.center({ pivot: 'below' }));
  const before = triCount(doc);
  let simplified = false;
  if (before > MAX_TRIS) {
    simplified = true;
    for (const prim of root.listMeshes().flatMap(m => m.listPrimitives())) {
      const idx = prim.getIndices(), P = new Float32Array(prim.getAttribute('POSITION').getArray());
      const target = Math.floor(MAX_TRIS * idx.getCount() / 3 / before) * 3;
      const [out] = MeshoptSimplifier.simplify(new Uint32Array(idx.getArray()), P, 3, target, 0.0005, ['LockBorder']);
      idx.setArray(new Uint32Array(out));
    }
    await doc.transform(F.prune(), F.unweld(), F.weld());
  }
  // textures stay at source resolution; re-encode as WebP q90 (base colour and metal/rough kept)
  for (const tex of root.listTextures()) {
    const buf = await sharp(Buffer.from(tex.getImage())).webp({ quality: 90, effort: 6 }).toBuffer();
    tex.setImage(new Uint8Array(buf)).setMimeType('image/webp');
  }
  await doc.transform(F.prune(), F.meshopt({ encoder: MeshoptEncoder, level: 'high', quantizePosition: 16, quantizeNormal: 10, quantizeTexcoord: 14 }));
  const out = await io.writeBinary(doc);
  const dir = path.join(ROOT, 'games', it.g, 'models'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, it.i + '.glb'), out);
  const lite = path.join(dir, it.i + '-lite.glb');
  const r = { ...it, kb: Math.round(out.length / 1024), liteKb: fs.existsSync(lite) ? Math.round(fs.statSync(lite).size / 1024) : null,
    tris: triCount(doc), before, simplified, srcKb: Math.round(fs.statSync(srcPath).size / 1024) };
  results.push(r);
  console.log(it.g + '/' + it.i, r.kb + 'KB (lite ' + r.liteKb + ')', r.tris, 'tris');
}
if (!FILTER) fs.writeFileSync(path.join(SRC, 'optimise-hq-results.json'), JSON.stringify(results, null, 1));
if (!SPRITES) process.exit(0);

// ---- sprites: 2048 render, 4x MSAA, soft key + rim light, transparent, downscaled to 1024 and 512 ----
const html = `<!doctype html><html><body style="margin:0"><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const N=2048;
const cv=document.createElement('canvas');cv.width=cv.height=N;document.body.appendChild(cv);
const gl=cv.getContext('webgl2',{antialias:true,alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
const r=new THREE.WebGLRenderer({canvas:cv,context:gl});r.setPixelRatio(1);r.setSize(N,N,false);r.setClearColor(0,0);
r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.0;
const s=new THREE.Scene();
const env=new THREE.PMREMGenerator(r);
s.environment=env.fromScene(new THREE.Scene().add(new THREE.HemisphereLight(0xffffff,0x998877,2.2)),0.04).texture; // soft studio fill
s.add(new THREE.HemisphereLight(0xffffff,0x887766,0.9));
const key=new THREE.DirectionalLight(0xfff4e6,2.2);key.position.set(3,5,4);s.add(key);     // soft key
const rim=new THREE.DirectionalLight(0xcfe0ff,2.0);rim.position.set(-4,3,-5);s.add(rim);    // rim
const fill=new THREE.DirectionalLight(0xffffff,0.5);fill.position.set(-3,1,3);s.add(fill);
const L=new GLTFLoader();L.setMeshoptDecoder(MeshoptDecoder);
window.shot=async url=>{const g=await L.loadAsync(url);const o=g.scene;s.add(o);
 const b=new THREE.Box3().setFromObject(o),c=b.getCenter(new THREE.Vector3()),z=b.getSize(new THREE.Vector3());
 const rad=Math.max(z.x,z.y,z.z)*0.5*Math.sqrt(3);const cam=new THREE.PerspectiveCamera(30,1,0.01,100);
 const dist=rad/Math.sin(THREE.MathUtils.degToRad(15))*0.72;const dir=new THREE.Vector3(0.62,0.5,0.8).normalize();
 cam.position.copy(c).addScaledVector(dir,dist);cam.lookAt(c);r.render(s,cam);const u=cv.toDataURL('image/png');s.remove(o);return u;};
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
const page = await browser.newPage({ viewport: { width: 256, height: 256 } });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.goto(`http://localhost:${port}/`); await page.waitForFunction('window.ready');
for (const r of results) {
  const data = await page.evaluate(u => window.shot(u), `/games/${r.g}/models/${r.i}.glb`);
  const png = Buffer.from(data.split(',')[1], 'base64');
  const dir = path.join(ROOT, 'games', r.g, 'models');
  for (const [px, name] of [[1024, r.i + '.webp'], [512, r.i + '@512.webp']])
    await sharp(png).resize(px, px, { kernel: 'lanczos3' }).webp({ quality: 90, alphaQuality: 95, effort: 5 }).toFile(path.join(dir, name));
}
await browser.close(); srv.close();
console.log('done', results.length, 'models, HQ KB', results.reduce((a, r) => a + r.kb, 0));
