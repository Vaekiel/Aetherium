// AETHERIUM — V4.2: rigid depth, protected horns/muzzle, fixed scenery.
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie-v4-2.html'),'utf8');
const js=readFileSync(resolve(root,'src/holo-v4-2.js'),'utf8');

assert.match(html,/<script src="\.\/src\/holo-v4-2\.js"/);
assert.match(html,/<canvas id="volume-canvas"/);
assert.match(html,/class="fallback"[^>]+vyrath-fleau-celeste\.webp/);
assert.match(html,/holographie-v4-1\.html/,'V4.1 comparison preserved');
assert.doesNotMatch(html,/class="layer (?:backdrop|midground)"/,'No detached scenery allowed');
assert.match(js,/const polygons=\[/,'Rigid anatomical plates required');
assert.doesNotMatch(js,/float heightAt|vec3 normal=|createRadialGradient/,'No bulging heightmap');
assert.match(js,/safe22=uPixel\*22\.0/,'All silhouette borders must be guarded');
assert.match(js,/headStep=uPixel\*38\.0/,'Horns and muzzle need wider protected rims');
assert.match(js,/headPlate=min\(/,'Head seam must be protected');
assert.match(js,/result=mix\(painted,result,safeInterior\)/,'Original pixels must be retained along edges');
assert.match(js,/visible\*safeInterior\*clamp/,'No double alpha silhouette at the rim');
assert.match(js,/destination-in/,'Plate masks must clip to the dragon');
assert.match(js,/if\(!gl\)throw Error/,'WebGL fallback required');
assert.ok(statSync(resolve(root,'assets/cards/holo/vyrath/subject.webp')).size>1000);
assert.doesNotMatch(js,/localStorage|sessionStorage|drawPack/);
assert.doesNotMatch(html,/localStorage|sessionStorage|drawPack/);
assert.doesNotThrow(()=>new Function(js),'Renderer JavaScript must parse');
console.log('V4.2 verified: rigid planes, protected horns/muzzle/seams, fixed scenery, fallback, no save changes.');
