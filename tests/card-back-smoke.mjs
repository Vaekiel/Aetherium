// Keep the universal back consistent across boosters and avoid revealing rarity too early.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=relative=>readFileSync(new URL(relative,import.meta.url),'utf8');
const css=read('../src/booster.css');
const js=read('../src/main.js');
const html=read('../index.html');
const image=readFileSync(new URL('../assets/cards/aetherium-back-v1.webp',import.meta.url));

assert.equal(image.toString('ascii',0,4),'RIFF','The back must be a valid WebP container');
assert.equal(image.toString('ascii',8,12),'WEBP');
assert.ok(image.length>10000,'The optimized illustration should not be empty');
assert.match(css,/\.pull-back\s*\{[^}]*aetherium-back-v1\.webp/s);
assert.match(css,/\.pull-back:focus-visible\s*\{/);
assert.match(js,/back\.setAttribute\('aria-label','Retourner la carte '/);
assert.doesNotMatch(js,/back\.append\(el\('span','back-glyph'/);
assert.match(html,/booster\.css\?v=card-back-v1/);
console.log('Dos Aetherium universel : illustration, accessibilité et cache OK');
