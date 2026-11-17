import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const css=read('src/booster-packaging.css');
const legacyCss=read('src/booster.css');
const image=read('assets/boosters/origines-portal.svg');
const data=read('src/data.js');
const main=read('src/main.js');
const pack=html.match(/<div class="pack pack-origines" id="booster-pack" aria-hidden="true">([\s\S]*?)<\/div>/)?.[1];
assert.ok(pack,'Pack Origines is a decorative wrapper preserving the opening handler target');
for(const name of [
 'pack-artwork','pack-foil','pack-sidefold','pack-crimp-top','pack-crimp-bottom',
 'pack-wordmark','pack-collection','pack-crest','pack-title','pack-edition'
]) assert.ok(pack.includes('class="'+name+'"')||
 pack.includes(' '+name+'"'),'Pack structure contains '+name);
assert.ok(pack.includes('AETHERIUM'));
assert.ok(pack.includes('LES MARCHES DE VERRE'));
assert.ok(pack.includes('ORIGINES'));
assert.ok(pack.includes('SAISON I · 5 CARTES'));
assert.ok(pack.includes('src="./assets/boosters/origines-portal.svg"'));
assert.ok(!pack.includes('derniere-etoile')&&!pack.includes('dragon-de-cristal'),
 'The wrapper never spoils a collectible by showing its art');
assert.ok(!pack.includes('<button'),'Decorative artwork cannot accidentally trigger purchases');
assert.equal((html.match(/id="booster-pack"/g)||[]).length,1);
assert.ok(html.includes('src/booster.css'));
assert.ok(html.includes('src/booster-packaging.css?v=origines-182'));
assert.ok(!css.includes('data:image/')&&!css.includes('cards/derniere-etoile'),
 'Packaging has an independent asset rather than copied card art');
assert.ok(css.includes('.pack.pack-origines'));
assert.ok(css.includes('.pack-crimp-top')&&css.includes('.pack-crimp-bottom'),
 'Physical top and bottom wrapper seals exist');
assert.ok(css.includes('.pack-sidefold'),'Side fold gives the packet volume');
assert.ok(css.includes('.pack-foil'),'Foil glint is present');
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(css.includes('@media(max-width:420px)'));
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(css.includes('aetherium-foil-unseal'),'Existing opening animation gains a short foil unseal');
assert.ok(legacyCss.includes('.pack.is-opening'),'Unseal class remains driven by validated controller');
assert.ok(image.startsWith('<svg'));
assert.ok(image.includes('</svg>'));
assert.ok(image.includes('viewBox="0 0 600 850"'));
assert.ok(image.includes('Ancient segmented arch'));
assert.ok(image.includes('Faceted floating crystal'));
assert.ok(!image.includes('<script')&&!image.includes('http://')&&!image.includes('href='),
 'Original artwork is self-contained and cannot load other resources');
for(const token of ['const boosterArt=','boosterArt.classList.add(\'is-opening\')',
  'state.coins-=PACK_PRICE','drawPack()','state.opened++','state.dust+=5',
  'update(); // Persists the purchase','showBoosterCard(0,false)',
  'boosterGrid.classList.add(\'booster-gallery\')']){
 assert.ok(main.includes(token),'Purchase, reveals and local save remain untouched: '+token);
}
assert.ok(data.includes('export const PACK_PRICE=100')||
 data.includes('PACK_PRICE = 100')||data.includes('PACK_PRICE=100'));
console.log('AETHERIUM 1.8.2 — Origines foil: original non-spoiler artwork, mobile, motion, unopened/reveal economy OK');
