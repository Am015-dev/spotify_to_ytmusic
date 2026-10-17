// node games-src/facelift-3d/contact-sheet.mjs  -> games-src/facelift-3d/contact-sheet.png
// Rows: 10 representative models x (source | HQ | lite); each cell shows 3 views (front 3/4, back 3/4, top-down) at 1024 px model size.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import http from 'http';
const TOOLS = process.env.TOOLS || '/tmp/claude-0/tools';
const req = createRequire(TOOLS + '/x.js');
const sharp = req('sharp'); const { chromium } = req('playwright-core');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const PICK = [['cauldron-fair','bag'],['crown-city-smash','tower-b'],['doorkick-dungeon','hero-pip'],['final-approach','plane'],['nebula-aces','na-talon'],
  ['sands-of-qamar','lamp'],['shipwreck-isle','sw-carpenter'],['short-fuse','bomb'],['short-fuse','pliers'],['tidewake','leviathan']];
const CELL = 320;
const html = `<!doctype html><html><body style="margin:0"><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const N=${CELL};
const r=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});r.setSize(N,N);r.setClearColor(0x3a3d46,1);
r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;document.body.appendChild(r.domElement);
const s=new THREE.Scene();
s.environment=new THREE.PMREMGenerator(r).fromScene(new THREE.Scene().add(new THREE.HemisphereLight(0xffffff,0x998877,2.2)),0.04).texture;
s.add(new THREE.HemisphereLight(0xffffff,0x887766,0.9));
const key=new THREE.DirectionalLight(0xfff4e6,2.2);key.position.set(3,5,4);s.add(key);
const rim=new THREE.DirectionalLight(0xcfe0ff,2.0);rim.position.set(-4,3,-5);s.add(rim);
const L=new GLTFLoader();L.setMeshoptDecoder(MeshoptDecoder);
const VIEWS=[[0.62,0.5,0.8],[-0.7,0.4,-0.7],[0.05,1,0.25]];
window.shots=async url=>{const g=await L.loadAsync(url);const o=g.scene;s.add(o);const out=[];
 const b=new THREE.Box3().setFromObject(o),c=b.getCenter(new THREE.Vector3()),z=b.getSize(new THREE.Vector3());
 const rad=Math.max(z.x,z.y,z.z)*0.5*Math.sqrt(3);const cam=new THREE.PerspectiveCamera(30,1,0.01,100);
 const dist=rad/Math.sin(THREE.MathUtils.degToRad(15))*0.72;
 for(const v of VIEWS){cam.position.copy(c).addScaledVector(new THREE.Vector3(...v).normalize(),dist);cam.lookAt(c);r.render(s,cam);out.push(r.domElement.toDataURL('image/png'));}
 s.remove(o);return out;};
window.ready=true;</script></body></html>`;
const srv = http.createServer((q, res) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/') { res.setHeader('content-type', 'text/html'); return res.end(html); }
  const p = u.startsWith('/three/') ? path.join(TOOLS, 'node_modules', u) : path.join(ROOT, u);
  fs.readFile(p, (e, b) => { if (e) { res.statusCode = 404; return res.end(); }
    res.setHeader('content-type', p.endsWith('.js') ? 'text/javascript' : 'application/octet-stream'); res.end(b); });
}).listen(0);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 256, height: 256 } });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.goto(`http://localhost:${srv.address().port}/`); await page.waitForFunction('window.ready');
const kinds = [['source', (g, i) => `/games-src/facelift-3d/${g}/${i}.glb`], ['HQ', (g, i) => `/games/${g}/models/${i}.glb`], ['lite', (g, i) => `/games/${g}/models/${i}-lite.glb`]];
// one sheet per model row pair: layout rows = models, columns = 3 kinds x 3 views
const rows = [];
for (const [g, i] of PICK) {
  const cells = [];
  for (const [, f] of kinds) for (const d of await page.evaluate(u => window.shots(u), f(g, i))) cells.push(Buffer.from(d.split(',')[1], 'base64'));
  rows.push(cells);
}
const W = 9 * CELL, H = rows.length * CELL;
const comp = [];
rows.forEach((cells, r) => cells.forEach((b, c) => comp.push({ input: b, left: c * CELL, top: r * CELL })));
const out = path.join(ROOT, 'games-src/facelift-3d/contact-sheet.png');
await sharp({ create: { width: W, height: H, channels: 3, background: '#3a3d46' } }).composite(comp).png().toFile(out);
// split into two readable halves (5 models each) for viewing
for (const [n, a] of [[1, 0], [2, 5]]) await sharp(out).extract({ left: 0, top: a * CELL, width: W, height: 5 * CELL }).toFile(out.replace('.png', `-${n}.png`));
await browser.close(); srv.close(); console.log('ok', PICK.map(p => p[1]).join(' '));
