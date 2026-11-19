// AETHERIUM — Vyrath holo V3.1 fixed-scene smoke test.
// This test never changes any collection, booster, or saved progression.
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie.html'),'utf8');
for(const name of ['subject','magic']){
  const relative='assets/cards/holo/vyrath/'+name+'.webp';
  assert.ok(html.includes('./'+relative),'Demo must reference '+relative);
  assert.ok(statSync(resolve(root,relative)).size>200,'Asset must be present: '+relative);
}
assert.match(html,/class="fallback"[^>]*vyrath-fleau-celeste\.webp/,'Missing original artwork');
assert.doesNotMatch(html,/class="layer (?:backdrop|midground)"/,'Reconstructed scenery must never render in V3.1');
assert.match(html,/\.art \.fallback\{z-index:0;transform:scale\(1\.085\)\}/,'Approved scene must stay fixed and visible');
assert.match(html,/Promise\.all\(layers\.map/,'Subject and magic must load before enabling depth');
assert.match(html,/prefers-reduced-motion:\s*reduce/,'Reduced-motion support required');
assert.match(html,/id="compare"/,'Static comparison required');
assert.ok(!html.includes('localStorage'),'Prototype must not mutate collection saves');
assert.ok(!html.includes('drawPack('),'Prototype must not change booster odds');
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(code,'Inline interaction script must exist');
assert.doesNotThrow(()=>new Function(code),'Inline script must parse');
console.log('Vyrath V3.1: original scene locked, dragon lighting and magic overlays, comparison, accessibility and syntax OK');
