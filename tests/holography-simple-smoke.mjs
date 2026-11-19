// Aetherium: deliberately simple foil-only proof; no artwork displacement.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'holographie-simple.html'),'utf8');
assert.match(html,/<title>Aetherium — Carte holographique interactive<\/title>/);
assert.match(html,/assets\/cards\/vyrath-fleau-celeste\.webp/,
  'Only the approved Vyrath image should render');
assert.doesNotMatch(html,/assets\/cards\/holo\/vyrath|<canvas|<img[^>]*class="layer"/,
  'No background/dragon cutouts, depth maps, WebGL or reconstruction');
assert.match(html,/class="prism"/);
assert.match(html,/class="ribbon"/);
assert.match(html,/class="grain"/);
assert.match(html,/class="glint"/);
assert.match(html,/id="intensity"/);
assert.match(html,/id="sensor"/);
assert.match(html,/id="reset"/);
assert.match(html,/id="compare"/);
assert.match(html,/card\.addEventListener\('pointerdown'/);
assert.match(html,/card\.addEventListener\('pointermove'/);
assert.match(html,/card\.addEventListener\('keydown'/);
assert.match(html,/DeviceOrientationEvent\.requestPermission/);
assert.match(html,/window\.addEventListener\('deviceorientation'/);
assert.match(html,/calibration=\{gamma:e\.gamma,beta:e\.beta\}/);
assert.match(html,/if\(usingSensor\)disableSensor\(\)/);
assert.match(html,/prefers-reduced-motion:reduce/);
assert.match(html,/@media\(max-width:730px\)/);
assert.match(html,/touch-action:none/);
assert.doesNotMatch(html,/localStorage|sessionStorage|drawPack|openBooster|fetch\(/,
  'Prototype must not modify saves or booster settings');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'Interaction script is required');
assert.doesNotThrow(()=>new Function(script),'Inline JavaScript must parse');
assert.equal((html.match(/assets\/cards\/vyrath-fleau-celeste\.webp/g)||[]).length,1,
  'Original must not be duplicated');
console.log('Holographie simple: original art only, foil/touch/mouse/gyro/keyboard, accessibility and saves OK.');
