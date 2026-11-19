// Aetherium V6.1 — HD pixel-art refinements without changing V6 depth or Vyrath.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie-v6-1.html'),'utf8');
const code=readFileSync(resolve(root,'src/holo-v6-1-world.js'),'utf8');
const v6=readFileSync(resolve(root,'src/holo-v6-world.js'),'utf8');

assert.match(html,/<script src="\.\/src\/holo-v6-1-world\.js"/);
assert.match(html,/<canvas id="world-canvas"/);
assert.match(html,/class="fallback"[^>]+vyrath-fleau-celeste\.webp/);
assert.match(html,/holographie-v6\.html/,'V6 comparison must remain accessible');
assert.match(html,/\.art \.foreground,\.art \.magic,\.art \.dragon-shade,\.art \.dragon-sculpt/,
  'Previous duplicate dragon overlays must stay disabled');
for (const fn of ['drawSky()','drawRuins()','drawNear()','stonemasonry(','fallingWater(','ivy(','cliffDetail(','pixelStroke(','crystal(','petals(']) {
  assert.ok(code.includes(fn),'V6.1 visual detail missing '+fn);
}
for (const sampling of [
  'texture2D(uSky,uv+tilt*.004)',
  'texture2D(uRuins,uv-tilt*.016)',
  'texture2D(uNear,uv-tilt*.031)',
  'gl_FragColor=vec4(mix(world,intact,keep),1.)'
]){
  assert.ok(code.includes(sampling),'Parallax or Vyrath protection changed '+sampling);
  assert.ok(v6.includes(sampling),'V6 matching baseline missing '+sampling);
}
assert.match(code,/images=\[original,dragon,drawSky\(\),drawRuins\(\),drawNear\(\)\]/);
assert.match(code,/float creature=dragonAt\(uv\)/,'Dragon must remain protected');
assert.doesNotMatch(code,/cv2\.inpaint|background\.webp|midground\.webp/,
  'Previously rejected inpainted assets must not return');
assert.doesNotMatch(code,/localStorage|sessionStorage|drawPack|openBooster/);
assert.doesNotMatch(html,/localStorage|sessionStorage|drawPack|openBooster/);
assert.doesNotThrow(()=>new Function(code),'Renderer script must parse');
console.log('V6.1: improved scene details, identical three depth planes, Vyrath and saves untouched.');
