import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REFLETS_GALLERY_ART} from '../src/reflets-gallery.js';
import {REFLETS_BRISES_DRAFT} from '../src/reflets-brises-catalog.js';
import {CARDS,PACK_PRICE,CHROMATIC_RATE,drawPack} from '../src/data.js';
import {collectionById,cardsForCollection} from '../src/seasons.js';

const read=path=>readFileSync(path,'utf8');
const html=read('index.html');
const main=read('src/main.js');
const data=read('src/data.js');
const art=read('src/card-art.js');
const css=read('src/reflets-gallery.css');

assert.equal(REFLETS_GALLERY_ART.length,19,'Nineteen original artworks are previewed');
assert.deepEqual(REFLETS_GALLERY_ART.map(x=>x.id),
 [...Array.from({length:10},(_,i)=>i+25),36,37,39,40,41,42,43,44,45],
 'First ten and nine batch-2 cards are shown; missing #35 and pilot #38 are not duplicated');
assert.equal(new Set(REFLETS_GALLERY_ART.map(x=>x.slug)).size,19,'No duplicate illustrations');
assert.ok(REFLETS_GALLERY_ART.every(x=>Object.isFrozen(x)),'Preview metadata is immutable');

for(const card of REFLETS_GALLERY_ART){
 const planned=REFLETS_BRISES_DRAFT.find(x=>x.id===card.id);
 assert.ok(planned);
 assert.equal(card.name,planned.name,'Names follow the canonical future card list');
 assert.equal(card.rarity,planned.rarity,'Rarity follows the canonical future card list');
 assert.equal(card.lore,planned.lore,'Lore follows the canonical future card list');
 for(const [path,suffix] of [[card.hd,'HD'],[card.thumb,'thumbnail']]){
  assert.ok(path.startsWith('./assets/cards/'),suffix+' must stay in the assets folder');
  const buf=readFileSync(path.slice(2));
  assert.ok(buf.length>20000,'Real '+suffix+' illustration is required for #'+card.id);
  assert.equal(buf.toString('ascii',0,4),'RIFF','WebP RIFF header for '+path);
  assert.equal(buf.toString('ascii',8,12),'WEBP','WebP image header for '+path);
 }
}
for(const id of ['reflets-gallery','reflets-gallery-grid','reflets-art-preview']){
 assert.ok(html.includes('id="'+id+'"'),'Codex gallery DOM element: '+id);
}
assert.ok(html.includes('reflets-gallery.css?v=lot2-19'),'Gallery stylesheet is cache busted');
assert.ok(html.includes('main.js?v=reflets-lot2-19'),'Main JS controller is cache busted');
assert.ok(main.includes("import {mountRefletsGallery} from './reflets-gallery.js';"));
assert.ok(main.includes("$('#reflets-gallery').hidden=!showRefletsPreview"));
assert.ok(main.includes("if(showRefletsPreview)mountRefletsGallery($('#reflets-gallery-grid'));"));
assert.ok(css.includes('@media(max-width:570px)'),'Supports phone grid');
assert.ok(css.includes('#page-collection #reflets-gallery[hidden]'),'Other collections hide preview');
assert.ok(read('src/reflets-gallery.js').includes("picture.loading='lazy'"));
assert.ok(read('src/reflets-gallery.js').includes("link.target='_blank'"));

const part=collectionById('marches-de-verre','reflets-brises');
assert.equal(part.released,false,'Reflets brisés remains unreleased');
assert.equal(CARDS.length,24,'Original card database unchanged');
assert.equal(cardsForCollection(CARDS,'marches-de-verre','reflets-brises').length,0,
 'Preview images are not collectible cards');
assert.equal(PACK_PRICE,100);
assert.equal(CHROMATIC_RATE,0.03);
for(const value of [0,0.025,0.13,0.31,0.65,0.95,0.999]){
 assert.ok(drawPack(()=>value).every(card=>card.id<25),
  'Original boosters cannot contain any Reflets previews');
}
assert.ok(!data.includes('reflets-gallery'),'Booster logic never imports previews');
assert.ok(!art.includes('reflets-gallery'),'Playable art pool never imports previews');
assert.ok(!main.includes('reflets-brises-catalog'),'Draft catalogue is only imported by preview module');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Legacy save key stays stable');
console.log('AETHERIUM Reflets brisés — 19 complete HD + thumbnails; 20 previews including pilot; no gameplay leaks');
