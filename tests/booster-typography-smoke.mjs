import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('index.html','utf8');
const js=readFileSync('src/main.js','utf8');
const script=readFileSync('scripts/build-unified-boosters.py','utf8');
for(const [booster,filename] of [
 ['origines','origines-unified-v5.webp'],
 ['reflets-brises','reflets-brises-unified-v5.webp'],
 ['au-dela-du-verre','au-dela-du-verre-unified-v5.webp']
]){
 const img=readFileSync('assets/boosters/'+filename);
 assert.ok(img.byteLength>50000&&img.byteLength<700000,'Optimized premium WebP exists for '+booster);
 assert.equal(img.toString('ascii',0,4),'RIFF');
 assert.equal(img.toString('ascii',8,12),'WEBP');
 assert.ok(html.includes('data-booster="'+booster+'"'));
 assert.equal(html.split('src="./assets/boosters/'+filename+'"').length-1,2,
  'Gallery and opening use the same foil artwork for '+booster);
}
assert.equal(html.split('SAISON 1 · 5 CARTES').length-1,4,
 'Three catalogue packs and the opening dialog carry identical metadata');
assert.ok(!html.includes('SAISON II')&&!html.includes('SAISON III'));
const {boosterView}=await import('../src/booster-views.js');
for(const id of ['origines','reflets-brises','au-dela-du-verre'])assert.equal(boosterView(id).edition,'SAISON 1 · 5 CARTES');
assert.ok(js.includes('textContent=view.edition'));
assert.ok(script.includes('master.copy()')&&script.includes('art_mask(master)')&&script.includes('title_image(title)'),
 'Three pack designs use the same master foil, mask and title typography');
assert.ok(!html.includes('origines-reliquaire-normalized-v2.webp')&&
 !html.includes('reflets-brises-reliquaire-normalized-v2.webp'),
 'No previous artwork remains referenced');
console.log('AETHERIUM : trois pochettes, Saison 1, 5 cartes, visuels conservés.');
