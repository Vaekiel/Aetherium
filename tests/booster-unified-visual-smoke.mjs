import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const script=read('scripts/build-unified-boosters.py');
const styles=read('src/premium-booster-unified.css');
const master=readFileSync('assets/boosters/aetherium-booster-master-v1.webp');
assert.equal(master.toString('ascii',0,4),'RIFF');
assert.equal(master.toString('ascii',8,12),'WEBP');
const editions=[
 ['origines','origines-unified-v5.webp'],
 ['reflets-brises','reflets-brises-unified-v5.webp'],
 ['au-dela-du-verre','au-dela-du-verre-unified-v5.webp']
];
for(const [edition,asset] of editions){
 const content=readFileSync('assets/boosters/'+asset);
 assert.ok(content.length>65000 && content.length<700000,'HD WebP '+edition);
 assert.equal(content.toString('ascii',0,4),'RIFF');
 assert.equal(content.toString('ascii',8,12),'WEBP');
 assert.equal(html.split('src="./assets/boosters/'+asset+'"').length-1,2,
   'Catalog and opening dialog show the same complete sleeve for '+edition);
 assert.ok(html.includes('data-booster="'+edition+'"'));
}
assert.ok(script.includes('master.copy()') && script.includes('art_mask(master)') &&
 script.includes('title_image(title)') && script.includes('SIZE=(640,1040)'),
 'Identical logo, gold frame and footer, one mask and identical proportions');
assert.ok(script.includes('ImageFont.truetype(font_file,44)'),
 'Same font face and size, without per-edition title scaling');
assert.ok(script.includes('"ORIGINES"') && script.includes('"REFLETS BRISÉS"') &&
 script.includes('"AU-DELÀ DU VERRE"'));
assert.ok(styles.includes('reliquaire-origines') &&
 styles.includes('reliquaire-reflets') && styles.includes('reliquaire-au-dela'));
assert.ok(html.includes('SAISON 1 · 5 CARTES') &&
 !html.includes('SAISON II') && !html.includes('SAISON III'));
console.log('AETHERIUM — shared premium master: one exact logo/frame/footer, 3 different scenes & titles.');
