// AETHERIUM V5 — relief only on the stationary scenery, no dragon displacement.
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie-v5.html'),'utf8');
const code=readFileSync(resolve(root,'src/holo-v5-background.js'),'utf8');

assert.match(html,/<script src="\.\/src\/holo-v5-background\.js"/);
assert.match(html,/class="fallback"[^>]+vyrath-fleau-celeste\.webp/);
assert.match(html,/<canvas id="volume-canvas"/);
assert.match(html,/\.art \.foreground,\.art \.magic,\.art \.dragon-shade,\.art \.dragon-sculpt/,'Old dragon volume must be hidden');
assert.doesNotMatch(html,/class="layer (?:backdrop|midground)"/,'Detached scenery must remain excluded');
assert.match(code,/float bg=1\.-smoothstep/,'Effect must exclude the dragon matte');
assert.match(code,/float dragon=max\(dragonAt\(uv\)/,'Dragon rim must be protected');
assert.match(code,/gl_FragColor=vec4\(original,1\.\)/,'Dragon and untouched areas must have identical original RGB');
assert.match(code,/gl_FragColor=vec4\(clamp\(scenery,0\.,1\.\),1\.\)/,'Single opaque output image');
assert.match(code,/uRuins,uForeground/,'Background distinct planes required');
assert.match(code,/midAhead=texture2D/,'Architecture edge-lighting must exist');
assert.match(code,/nearAhead=texture2D/,'Foreground edge-lighting must exist');
assert.doesNotMatch(code,/uTilt|uv-travel|uv-distortion|createRadialGradient|heightAt\(/,
  'No interior moving bumps or parallax texture displacement');
assert.match(code,/UNPACK_FLIP_Y_WEBGL/,'Source and depth zones must share the same texture coordinates');
assert.doesNotMatch(code,/localStorage|sessionStorage|drawPack/,'No collection or saves mutation');
assert.doesNotMatch(html,/localStorage|sessionStorage|drawPack/);
assert.ok(statSync(resolve(root,'assets/cards/holo/vyrath/subject.webp')).size>1000);
assert.doesNotThrow(()=>new Function(code));
console.log('V5 OK: only scenery relief, original Vyrath pixels locked, no disconnected layers, save untouched.');
