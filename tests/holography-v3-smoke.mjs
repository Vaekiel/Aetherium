// AETHERIUM — Vyrath holo V3 isolated smoke test.
// This test never changes any collection, booster, or saved progression.
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie.html'),'utf8');
for(const name of ['background','midground','subject','magic']){
  const relative='assets/cards/holo/vyrath/'+name+'.webp';
  assert.ok(html.includes('./'+relative),'Demo must reference '+relative);
  assert.ok(statSync(resolve(root,relative)).size>200,'Asset must be present: '+relative);
}
assert.match(html,/class="fallback"[^>]*vyrath-fleau-celeste\.webp/,'Missing original art fallback');
assert.match(html,/Promise\.all\(layers\.map/,'All four layers must load before the V3 is shown');
assert.match(html,/prefers-reduced-motion:\s*reduce/,'Reduced-motion support required');
assert.match(html,/id="compare"/,'Static comparison required');
assert.ok(!html.includes('localStorage'),'Prototype must not mutate collection saves');
assert.ok(!html.includes('drawPack('),'Prototype must not change booster odds');
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(code,'Inline interaction script must exist');
assert.doesNotThrow(()=>new Function(code),'Inline script must parse');
console.log('Vyrath V3: 4 independent layers, fallback, A/B, accessibility, and syntax OK');
