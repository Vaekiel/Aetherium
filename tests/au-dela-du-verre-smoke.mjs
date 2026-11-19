import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AU_DELA_DU_VERRE_DIRECTION as direction,
 AU_DELA_DU_VERRE_DRAFT as draft} from '../src/au-dela-du-verre-catalog.js';
import {CARDS as published,drawRefletsPack,REFLETS_CARDS} from '../src/collection-data.js';
import {CARDS as origines,drawPack,PACK_PRICE,CHROMATIC_RATE} from '../src/data.js';
import {SEASONS,collectionById,cardsForCollection,seasonProgress,collectionForCard}
 from '../src/seasons.js';
import {CRAFT_COSTS} from '../src/crafting.js';
import {DUPLICATE_DUST} from '../src/duplicate-rewards.js';
import {milestonesFor} from '../src/collection-milestones.js';

const read=p=>readFileSync(p,'utf8');
const main=read('src/main.js'),html=read('index.html');
const css=read('src/codex.css');
const catalogue=read('src/au-dela-du-verre-catalog.js');
const publishedSource=read('src/collection-data.js');
const initialSaveKey="const SAVE='aetherium-save-v1'";
assert.equal(direction.released,false);
assert.equal(direction.collectionId,'au-dela-du-verre');
assert.equal(direction.seasonId,'marches-de-verre');
assert.match(direction.artStyle,/Pixel art HD/);
assert.equal(Object.keys(direction.palette).length,6);
assert.equal(direction.chapters.length,5);
assert.equal(draft.length,24);
assert.ok(Object.isFrozen(draft)&&draft.every(item=>Object.isFrozen(item)));
assert.deepEqual(draft.map(c=>c.id),Array.from({length:24},(_,i)=>49+i));
const names=draft.map(c=>c.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
const legacyNames=published.map(c=>c.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
assert.equal(new Set(names).size,24);
assert.ok(!names.some(name=>legacyNames.includes(name)),'No published card is duplicated');
assert.deepEqual(Object.fromEntries(['common','uncommon','rare','epic','legendary'].map(
 rarity=>[rarity,draft.filter(card=>card.rarity===rarity).length])),
 {common:6,uncommon:6,rare:6,epic:3,legendary:3});
for(const card of draft){
 assert.equal(card.collectionId,'au-dela-du-verre');
 assert.ok(['Héros','Créature','Sort','Artefact'].includes(card.type));
 assert.ok(card.name.length>=8);
 assert.ok(card.lore.length>40);
 assert.ok(card.artBrief.length>75,'Every art brief must be ready for detailed illustration: '+card.name);
 assert.equal(card.signature,card.id===72);
 assert.equal(card.boosterEligible,card.id!==72);
 assert.equal(typeof card.attack,'undefined');
 assert.equal(typeof card.health,'undefined');
 assert.ok(!card.artBrief.includes('watermark'));
}
const signature=draft.filter(card=>card.signature);
assert.equal(signature.length,1,'Exactly one special Signature');
assert.equal(signature[0].name,'Cœur des Marches');
assert.equal(signature[0].rarity,'legendary');
assert.equal(draft.filter(card=>card.boosterEligible).length,23);
assert.equal(draft.filter(card=>card.boosterEligible&&card.rarity==='legendary').length,2);
assert.deepEqual(direction.chapters.map(c=>[c.first,c.last]),
 [[49,54],[55,60],[61,66],[67,69],[70,72]]);
for(const [i,chapter] of direction.chapters.entries()){
 assert.equal(draft.filter(c=>c.id>=chapter.first&&c.id<=chapter.last).length,
  [6,6,6,3,3][i]);
}
assert.equal(published.length,48,'Only the two released collections are playable');
assert.equal(origines.length,24);
assert.equal(REFLETS_CARDS.length,24);
assert.deepEqual(published.map(c=>c.id),Array.from({length:48},(_,i)=>i+1));
const part=collectionById('marches-de-verre','au-dela-du-verre');
assert.equal(part.released,false);
assert.equal(part.signature,true);
assert.equal(part.first,null);
assert.equal(part.last,null);
assert.equal(cardsForCollection(published,'marches-de-verre','au-dela-du-verre').length,0);
assert.equal(collectionForCard({id:72}),null);
assert.deepEqual(seasonProgress(published,{},{}),{
 planned:72,released:48,discovered:0,chromatic:0,
 collectionsReleased:2,collectionsPlanned:3,
 percentReleased:67,percentCollected:0
});
assert.deepEqual(milestonesFor('marches-de-verre','au-dela-du-verre'),[],
 'No unavailable narrative prize is granted early');
for(const rng of [0,.03,.17,.42,.67,.88,.999]){
 assert.ok(drawPack(()=>rng).every(card=>card.id<=24));
 assert.ok(drawRefletsPack(()=>rng).every(card=>card.id>=25&&card.id<=48));
}
assert.ok(!publishedSource.includes('au-dela-du-verre-catalog'),
 'Draft not imported into published catalogue or booster pool');
assert.ok(!main.includes("from './au-dela-du-verre-catalog"),
 'The future draft is excluded from live game loading');
assert.ok(main.includes(initialSaveKey));
assert.equal(PACK_PRICE,100);
assert.equal(CHROMATIC_RATE,.03);
assert.deepEqual(CRAFT_COSTS,{common:20,uncommon:45,rare:100,epic:220,legendary:450});
assert.deepEqual(DUPLICATE_DUST,{common:5,uncommon:7,rare:10,epic:15,legendary:25});
assert.ok(html.includes('id="au-dela-teaser"'));
assert.ok(html.includes('id="au-dela-teaser" class="au-dela-teaser" hidden'),
 'Teaser remains hidden until its forthcoming collection is selected');
assert.ok(html.includes('Deux mémoires. Un seul horizon à construire.'));
assert.ok(main.includes("const showAuDelaTeaser=isUpcoming&&activeSeason==='marches-de-verre'&&selectedPart.id==='au-dela-du-verre';"),
 'Only the correct upcoming chapter may display the teaser');
assert.ok(main.includes("$('#au-dela-teaser').hidden=!showAuDelaTeaser;"));
assert.ok(main.includes("$('#collection-layout').hidden=isUpcoming"));
assert.ok(main.includes("$('#codex-milestones').hidden=true;"));
assert.ok(main.includes("$('#codex-living').hidden=true;"));
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
assert.ok(css.includes('#page-collection #au-dela-teaser[hidden]{display:none!important}'));
assert.ok(css.includes('@media(max-width:550px)'));
assert.ok(css.includes('@media(max-width:350px)'));
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(html.includes('codex.css?v=au-dela-pilot-49'));
assert.ok(html.includes('main.js?v=au-dela-lot-1'));
assert.ok(read('docs/au-dela-du-verre-design.md').includes('23 cartes classiques'));
assert.ok(!catalogue.includes('localStorage'),'Draft cannot edit saves');
console.log('AETHERIUM Saison I — 24 concepts and non-spoiler responsive teaser, 48 old cards unchanged, Signature excluded, no new draws or saves');
