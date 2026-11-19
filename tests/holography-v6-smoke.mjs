// Aetherium V6: rebuilt pixel-art world behind unmodified dragon.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie-v6.html'),'utf8');
const js=readFileSync(resolve(root,'src/holo-v6-world.js'),'utf8');

assert.match(html,/<script src="\.\/src\/holo-v6-world\.js"/);
assert.match(html,/<canvas id="world-canvas"/);
assert.match(html,/class="fallback"[^>]+vyrath-fleau-celeste\.webp/);
assert.match(html,/holographie-v5\.html/,'Old V5 retained for comparison');
assert.match(html,/\.art \.foreground,\.art \.magic,\.art \.dragon-shade,\.art \.dragon-sculpt/,
  'Previous duplicated dragon/lights must be hidden');
for(const key of ['drawSky()','drawRuins()','drawNear()','floatingIsland(','petals(','crystal(','moon(']){
  assert.ok(js.includes(key),'New world missing independent hand-drawn detail: '+key);
}
assert.match(js,/images=\[original,dragon,drawSky\(\),drawRuins\(\),drawNear\(\)\]/,
  'Independent world planes are textures, not a static color filter');
assert.match(js,/texture2D\(uSky,uv\+tilt\*\.004\)/);
assert.match(js,/texture2D\(uRuins,uv-tilt\*\.016\)/);
assert.match(js,/texture2D\(uNear,uv-tilt\*\.031\)/);
assert.match(js,/float creature=dragonAt\(uv\)/,'Source dragon must be excluded');
assert.match(js,/gl_FragColor=vec4\(mix\(world,intact,keep\),1\.\)/,
  'Dragon source must be above the reconstructed environment in one opaque output');
assert.doesNotMatch(js,/cv2\.inpaint|background\.webp|midground\.webp/,
  'Rejected inpainted background must not be reused');
assert.doesNotMatch(js,/localStorage|sessionStorage|drawPack|openBooster/,
  'Prototype must not touch cards, packs or saves');
assert.doesNotMatch(html,/localStorage|sessionStorage|drawPack|openBooster/);
assert.doesNotThrow(()=>new Function(js),'V6 browser script must parse');
console.log('V6 world: three new pixel-art planes, independent parallax, untouched dragon and saves.');
