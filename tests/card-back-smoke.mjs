// Keep the universal back consistent across boosters and avoid revealing rarity too early.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=relative=>readFileSync(new URL(relative,import.meta.url),'utf8');
const css=read('../src/booster.css');
const js=read('../src/main.js');
const html=read('../index.html');
const image=readFileSync(new URL('../assets/cards/aetherium-back-original-v3.webp',import.meta.url));

assert.equal(image.toString('ascii',0,4),'RIFF','The back must be a valid WebP container');
assert.equal(image.toString('ascii',8,12),'WEBP');
assert.ok(image.length>10000,'The optimized illustration should not be empty');
// This standalone asset has an alpha channel; it is not a crop of a mockup.
const vp8x=image.indexOf(Buffer.from('VP8X'));
assert.ok(vp8x>0,'The card back must have a WebP extended header');
assert.equal(image[vp8x+8]&0x10,0x10,'The back outline must have transparent corners');
const width=image[vp8x+12]|(image[vp8x+13]<<8)|(image[vp8x+14]<<16);
const height=image[vp8x+15]|(image[vp8x+16]<<8)|(image[vp8x+17]<<16);
assert.equal(width+1,640);
assert.equal(height+1,960);
assert.ok(css.includes("background:transparent url('../assets/cards/aetherium-back-original-v3.webp')"));
assert.ok(css.includes(".booster-single .pull-back{box-shadow:none}"));
assert.match(css,/\.pull-back\s*\{[^}]*aetherium-back-original-v3\.webp/s);
assert.match(css,/\.pull-back:focus-visible\s*\{/);
assert.match(js,/back\.setAttribute\('aria-label','Retourner la carte '/);
assert.doesNotMatch(js,/back\.append\(el\('span','back-glyph'/);
assert.match(html,/booster\.css\?v=card-back-original-v3/);
console.log('Dos Aetherium universel : illustration, accessibilité et cache OK');
