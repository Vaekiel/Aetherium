import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SEASONS} from '../src/seasons.js';
import {CARDS,BOOSTER_REGISTRY} from '../src/collection-data.js';
import {RARITIES} from '../src/data.js';
import {FINISH_KEYS} from '../src/finishes.js';
import {CARD_ART} from '../src/card-art.js';
import {BOOSTER_VIEWS} from '../src/booster-views.js';
import {FUTURE_ART_STANDARD} from '../src/content-standard.js';
import {validateSeasonCatalog} from '../src/season-conformity.js';

assert.deepEqual(validateSeasonCatalog({seasons:SEASONS,cards:CARDS,art:CARD_ART,boosters:BOOSTER_REGISTRY,views:BOOSTER_VIEWS,rarities:RARITIES,finishKeys:FINISH_KEYS}),[]);
function webpDimensions(path){
  const b=readFileSync(path);
  assert.equal(b.toString('ascii',0,4),'RIFF',path);
  assert.equal(b.toString('ascii',8,12),'WEBP',path);
  for(let i=12;i+8<=b.length;){
    const type=b.toString('ascii',i,i+4),size=b.readUInt32LE(i+4),data=i+8;
    assert.ok(data+size<=b.length,'Truncated WebP '+path);
    if(type==='VP8X'&&size>=10)return [b.readUIntLE(data+4,3)+1,b.readUIntLE(data+7,3)+1];
    if(type==='VP8L'&&size>=5&&b[data]===0x2f){const bits=b.readUInt32LE(data+1);return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1]}
    if(type==='VP8 '&&size>=10&&b[data+3]===0x9d&&b[data+4]===1&&b[data+5]===0x2a)
      return [b.readUInt16LE(data+6)&0x3fff,b.readUInt16LE(data+8)&0x3fff];
    i=data+size+(size%2);
  }
  throw new Error('No readable WebP dimensions: '+path);
}
for(const {season,collection,pool} of BOOSTER_REGISTRY.values()){
  const view=BOOSTER_VIEWS[collection.id];
  const packSize=webpDimensions(view.art);
  if(season.number>1)assert.deepEqual(packSize,[FUTURE_ART_STANDARD.boosterWidth,FUTURE_ART_STANDARD.boosterHeight],view.art);
  for(const card of CARDS.filter(c=>c.id>=collection.first&&c.id<=collection.last)){
    const art=CARD_ART[card.id];
    const thumb=webpDimensions(art.thumbnail),full=webpDimensions(art.full);
    // Historical assets have mixed dimensions; do not silently resize them.
    if(season.number>1){
      assert.deepEqual(thumb,[FUTURE_ART_STANDARD.thumbnailWidth,FUTURE_ART_STANDARD.thumbnailHeight],art.thumbnail);
      assert.deepEqual(full,[FUTURE_ART_STANDARD.fullWidth,FUTURE_ART_STANDARD.fullHeight],art.full);
    }
  }
  assert.equal(pool.length,collection.plannedCards-(collection.signature?1:0));
}
console.log('Season release gate: all published records, image files and future pixel dimensions conform.');
