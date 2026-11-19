// AETHERIUM — isolated holographic V4 proof: no save/booster changes.
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie-v4.html'),'utf8');
const js=readFileSync(resolve(root,'src/holo-v4.js'),'utf8');
assert.match(html,/<canvas id="volume-canvas"/,'V4 must include a depth renderer');
assert.match(html,/<script src="\.\/src\/holo-v4\.js"/,'V4 module must be loaded');
assert.match(html,/class="fallback"[^>]+assets\/cards\/vyrath-fleau-celeste\.webp/,'Original locked painting required');
assert.doesNotMatch(html,/class="layer (?:midground|backdrop)"/,'No moving landscape layers permitted');
assert.match(js,/uWing,uBody,uHead,uFront/,'Wing, torso, head and foreclaw depth planes required');
assert.match(js,/texture2D\(uSubject,uv\)\.a/,'Depth must stay inside the original dragon matte');
assert.match(js,/if\(!gl\)throw Error/,'WebGL failure must fall back safely');
assert.match(js,/UNPACK_FLIP_Y_WEBGL/,'Texture coordinates must align with the original image');
assert.match(js,/requestAnimationFrame/,'Frame updates must be throttled');
assert.ok(statSync(resolve(root,'assets/cards/holo/vyrath/subject.webp')).size>1000,'Source dragon mask required');
assert.doesNotMatch(js,/localStorage|sessionStorage|fetch\(.*POST|drawPack/,'V4 must not touch saved progress or draws');
assert.doesNotMatch(html,/localStorage|sessionStorage|drawPack/,'V4 page must remain save-free');
assert.doesNotThrow(()=>new Function(js),'V4 script must parse');
console.log('V4: 4-depth experiment exists; background immobile, fallback intact, no save mutation.');
