import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {AU_DELA_DU_VERRE_DRAFT} from '../src/au-dela-du-verre-catalog.js';
import {CARDS,drawRefletsPack} from '../src/collection-data.js';
import {CARDS as ORIGINES,drawPack} from '../src/data.js';
import {collectionById,cardsForCollection} from '../src/seasons.js';

const read=p=>readFileSync(p,'utf8');
function webpSize(path){
 const bytes=readFileSync(path);
 assert.ok(bytes.length>20000,'A real detailed WebP is required: '+path);
 assert.equal(bytes.toString('ascii',0,4),'RIFF',path);
 assert.equal(bytes.toString('ascii',8,12),'WEBP',path);
 assert.equal(bytes.toString('ascii',12,16),'VP8 ',path+' must contain a VP8 image');
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length,'WebP byte count intact');
 assert.deepEqual([...bytes.subarray(23,26)],[0x9d,0x01,0x2a]);
 return [bytes.readUInt16LE(26)&0x3fff,bytes.readUInt16LE(28)&0x3fff];
}
assert.deepEqual(webpSize('assets/cards/passeur-des-aubes.webp'),[1024,1536]);
assert.deepEqual(webpSize('assets/cards/passeur-des-aubes-thumb.webp'),[350,525]);
assert.ok(statSync('assets/cards/passeur-des-aubes-thumb.webp').size <
 statSync('assets/cards/passeur-des-aubes.webp').size,
 'Mobile thumbnail is smaller than the full HD image');
const html=read('index.html'),css=read('src/codex.css'),main=read('src/main.js');
assert.ok(html.includes('id="au-dela-teaser" class="au-dela-teaser" hidden'));
assert.ok(html.includes('class="au-dela-pilot"'));
assert.ok(html.includes('src="./assets/cards/passeur-des-aubes-thumb.webp"'));
assert.ok(html.includes('srcset="./assets/cards/passeur-des-aubes-thumb.webp 350w, ./assets/cards/passeur-des-aubes.webp 1024w"'));
assert.ok(html.includes('sizes="(max-width:550px) 64vw, 205px"'));
assert.ok(html.includes('loading="lazy" decoding="async"'));
assert.ok(html.includes('href="./assets/cards/passeur-des-aubes.webp"'));
assert.ok(html.includes('Commune · Illustration pilote'));
assert.ok(html.includes('codex.css?v=au-dela-pilot-49'));
assert.ok(css.includes('.au-dela-pilot-art img'));
assert.ok(css.includes('image-rendering:pixelated'));
assert.ok(css.includes('grid-template-columns:minmax(0,205px) minmax(0,1fr)'));
assert.ok(css.includes('@media(max-width:550px)'));
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(css.includes('#page-collection #au-dela-teaser[hidden]'));
assert.ok(main.includes("$('#au-dela-teaser').hidden=!showAuDelaTeaser;"),
 'The teaser is visible only for the unreleased chapter');
const pilot=AU_DELA_DU_VERRE_DRAFT.find(c=>c.id===49);
assert.equal(pilot.name,'Passeur des Aubes');
assert.equal(pilot.rarity,'common');
assert.equal(pilot.boosterEligible,true,'Future eligibility is metadata only, not live access');
assert.equal(collectionById('marches-de-verre','au-dela-du-verre').released,false);
assert.deepEqual(cardsForCollection(CARDS,'marches-de-verre','au-dela-du-verre'),[]);
assert.equal(CARDS.length,48);
assert.equal(ORIGINES.length,24);
for(const random of [0,.02,.3,.6,.8,.98]){
 assert.ok(drawPack(()=>random).every(x=>x.id<25));
 assert.ok(drawRefletsPack(()=>random).every(x=>x.id>=25&&x.id<=48));
}
assert.ok(!read('src/collection-data.js').includes('au-dela-du-verre-catalog'),
 'A pilot preview must not create a third pack');
assert.ok(!read('src/card-art.js').includes('passeur-des-aubes'),
 'Pilot preview must not fake a collectible artwork entry before launch');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
console.log('AETHERIUM Au-delà du Verre : Passeur des Aubes HD WebP + mobile thumbnail in locked Codex teaser; 48 released cards and old saves intact');
