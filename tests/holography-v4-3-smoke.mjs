// AETHERIUM V4.3 — regression: one opaque frame, no duplicated source contours.
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie-v4-3.html'),'utf8');
const code=readFileSync(resolve(root,'src/holo-v4-3.js'),'utf8');

assert.match(html,/<script src="\.\/src\/holo-v4-3\.js"/);
assert.match(html,/<canvas id="volume-canvas"/);
assert.match(html,/class="fallback"[^>]+vyrath-fleau-celeste\.webp/);
assert.match(html,/holographie-v4-2\.html/,'Older version kept for A/B comparison');
assert.doesNotMatch(html,/class="layer (?:backdrop|midground)"/,'No moving scenery layers');
assert.match(code,/gl_FragColor=vec4\(texture2D\(uImage,uv\)\.rgb,1\.0\)/,
  'Unchanged scene pixels must be fully opaque, not transparent overlay');
assert.match(code,/gl_FragColor=vec4\(clamp\(result,0\.,1\.\),1\.0\)/,
  'Dragon should be composited in a single fully opaque frame');
assert.doesNotMatch(code,/gl_FragColor=vec4\(0\.\)/,
  'Transparent output would let the original image create double contours');
assert.doesNotMatch(code,/gl_FragColor=vec4\(clamp\(result,0\.,1\.\),\s*visible/,
  'No semi-transparent dragon duplicate');
assert.match(code,/result=mix\(painted,result,blend\)/,
  'Parallax must fade into original inside the silhouette');
assert.match(code,/headStep=uPixel\*38\.0/,'Head, snout and horns protection remains');
assert.match(code,/safe22=uPixel\*22\.0/,'Claws and other edge protection remains');
assert.match(code,/const polygons=\[/,'Four anatomical zones preserved');
assert.match(code,/if\(!gl\)throw Error/,'WebGL fallback required');
assert.ok(statSync(resolve(root,'assets/cards/holo/vyrath/subject.webp')).size>1000);
assert.doesNotMatch(code,/localStorage|sessionStorage|drawPack/);
assert.doesNotMatch(html,/localStorage|sessionStorage|drawPack/);
assert.doesNotThrow(()=>new Function(code));
console.log('V4.3: single opaque frame, no duplicate outline on paws/horns/snout; scenery locked and saves unchanged.');
