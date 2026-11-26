import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const load=path=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(path)));
const {REFLETS_BRISES_DIRECTION,REFLETS_BRISES_DRAFT}=await load('src/reflets-brises-catalog.js');
const {CARDS,PACK_PRICE,CHROMATIC_RATE,drawPack}=await load('src/data.js');
const {CARDS:ALL_CARDS,REFLETS_CARDS,drawRefletsPack}=await import('../src/collection-data.js');
const {SEASONS,collectionById,cardsForCollection,seasonProgress}=await load('src/seasons.js');
const {CRAFT_COSTS}=await load('src/crafting.js');
const {DUPLICATE_DUST}=await load('src/duplicate-rewards.js');

assert.equal(REFLETS_BRISES_DIRECTION.collectionId,'reflets-brises');
assert.equal(REFLETS_BRISES_DIRECTION.released,true);
assert.equal(REFLETS_BRISES_DRAFT.length,24,'Reflets brisés has precisely 24 designed cards');
assert.ok(Object.isFrozen(REFLETS_BRISES_DRAFT),'Catalogue is immutable');
assert.ok(REFLETS_BRISES_DRAFT.every(card=>Object.isFrozen(card)));
assert.deepEqual(REFLETS_BRISES_DRAFT.map(c=>c.id),
 Array.from({length:24},(_,i)=>i+25),'Draft IDs exactly reserve 25–48');
const names=REFLETS_BRISES_DRAFT.map(c=>c.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
const originesNames=CARDS.map(c=>c.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
assert.equal(new Set(names).size,24,'All draft names are unique');
assert.ok(!names.some(name=>originesNames.includes(name)),'No original card is renamed or reused');
assert.deepEqual(
 Object.fromEntries(['common','uncommon','rare','epic','legendary'].map(
 rarity=>[rarity,REFLETS_BRISES_DRAFT.filter(c=>c.rarity===rarity).length])),
 {common:6,uncommon:6,rare:6,epic:3,legendary:3},
 'Draft follows the established 24-card rarity mix');
for(const card of REFLETS_BRISES_DRAFT){
 assert.equal(card.collectionId,'reflets-brises');
 assert.ok(['Héros','Créature','Sort','Artefact'].includes(card.type));
 assert.ok(card.name.length>=8&&card.lore.length>30&&card.artBrief.length>40);
 assert.equal(typeof card.attack,'undefined','No premature gameplay stats');
 assert.equal(typeof card.health,'undefined','No premature gameplay stats');
}
assert.equal(Object.keys(REFLETS_BRISES_DIRECTION.palette).length,6);
assert.match(REFLETS_BRISES_DIRECTION.artStyle,/Pixel art HD/);
const part=collectionById('marches-de-verre','reflets-brises');
assert.equal(part.released,true,'Second collection is now available in Codex');
assert.equal(part.first,25);
assert.equal(part.last,48);
assert.equal(cardsForCollection(ALL_CARDS,'marches-de-verre','reflets-brises').length,24,
 'All Reflets cards are collectible within their published chapter');
assert.equal(ALL_CARDS.length,72);
assert.deepEqual(REFLETS_CARDS.map(c=>c.id),Array.from({length:24},(_,i)=>i+25));
assert.equal(CARDS.length,24,'Production catalogue remains Origines only');
assert.deepEqual(CARDS.map(c=>c.id),Array.from({length:24},(_,i)=>i+1));
for(const random of [0,0.03,0.25,0.49,0.76,0.9,0.999]){
 const booster=drawPack(()=>random);
 assert.equal(booster.length,5);
 assert.ok(booster.every(card=>card.id>=1&&card.id<=24),
  'Origines booster cannot draw the draft');
}
assert.deepEqual(seasonProgress(ALL_CARDS,{},{}),{
 planned:72,released:72,discovered:0,chromatic:0,
 collectionsReleased:3,collectionsPlanned:3,
 percentReleased:100,percentCollected:0
});
for(const random of [0,0.03,0.25,0.49,0.76,0.9,0.999]){
 const cards=drawRefletsPack(()=>random);
 assert.equal(cards.length,5);
 assert.ok(cards.every(c=>c.id>=25&&c.id<=48));
 assert.notEqual(ALL_CARDS[cards[4].id-1].rarity,'common');
}
assert.equal(SEASONS.length,2);
assert.equal(PACK_PRICE,100);
assert.equal(CHROMATIC_RATE,0.03);
assert.deepEqual(CRAFT_COSTS,{common:20,uncommon:45,rare:100,epic:220,legendary:450});
assert.deepEqual(DUPLICATE_DUST,{common:5,uncommon:7,rare:10,epic:15,legendary:25});
const main=read('src/main.js');
const gameData=read('src/data.js');
const artwork=read('src/card-art.js');
const save=read('src/save-backup.js');
assert.ok(main.includes("from './collection-data.js?v=seasons-09'"),'The game loads the released catalogue');
assert.ok(!gameData.includes('reflets-brises-catalog'),'Booster pools remain unchanged');
assert.ok(!artwork.includes('reflets-brises-catalog'),'No placeholder art is published');
assert.ok(save.includes("GAME_SAVE_KEY='aetherium-save-v1'"),'Save key is unchanged');
assert.ok(read('docs/reflets-brises-design.md').includes('Au-delà du Verre'));
console.log('AETHERIUM Reflets brisés — 24 published cards, isolated booster pool, Origines/save/economy intact');
