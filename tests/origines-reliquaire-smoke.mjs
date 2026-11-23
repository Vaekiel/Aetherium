import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html'),main=read('src/main.js');
const css=read('src/origines-reliquaire.css'),ui=read('src/ui-harmony.css');
const asset='assets/boosters/origines-unified-v5.webp';
const binary=readFileSync(asset);
assert.ok(binary.byteLength>60000&&binary.byteLength<350000,
 'Full premium packet should be optimized for mobile without losing HD details');
assert.equal(binary.toString('ascii',0,4),'RIFF');
assert.equal(binary.toString('ascii',8,12),'WEBP');
assert.ok(html.includes('src="./'+asset+'"'));
assert.equal((html.match(/src="\.\/assets\/boosters\/origines-unified-v5\.webp"/g)||[]).length,2,
 'Gallery and enlarged modal use precisely the same approved design');
assert.ok(html.includes('booster-tile-pack reliquaire-origines'));
assert.ok(html.includes('pack-origines pack-illustrated reliquaire-origines'));
assert.ok(ui.includes('@import "./origines-reliquaire.css?v=1";'));
assert.ok(html.includes('origines=1'),'Bust styling cache for mobile PWA');
assert.ok(css.includes('.booster-tile-pack.reliquaire-origines .pack-scene'));
assert.ok(css.includes('#booster-pack.reliquaire-origines .pack-scene'));
assert.ok(css.includes('inset:0;')&&css.includes('object-fit:cover;')&&css.includes('transform:none;'));
assert.ok(css.includes('.pack-wordmark')&&css.includes('.pack-title')&&css.includes('opacity:0;'),
 'Do not overlay CSS titles atop lettering already embossed in HD artwork');
assert.ok(main.includes("boosterArt.classList.toggle('reliquaire-origines',!isReflets&&!isAuDela);"),
 'Only the Origines edition uses the new full-wrapper treatment');
for(const edition of ['reflets-brises','au-dela-du-verre']){
 assert.ok(html.includes('data-booster="'+edition+'"'),'Other boosters remain available');
}
assert.ok(html.includes('reflets-brises-unified-v5.webp'));
assert.ok(html.includes('au-dela-du-verre-unified-v5.webp'));
assert.ok(html.includes('id="buy"')&&html.includes('id="reveal-all"'));
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
console.log('AETHERIUM — sachet Reliquaire Origines optimisé, galerie + fenêtre, autres éditions et sauvegardes intactes');
