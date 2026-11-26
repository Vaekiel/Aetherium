import assert from 'node:assert/strict';
import {CARDS as ORIGINES,drawPack,rollRarity,rollFinish} from '../src/data.js';
import {REFLETS_CARDS,AU_DELA_BOOSTER_CARDS,drawRefletsPack,drawAuDelaPack} from '../src/collection-data.js';

// Explicit specifications, not derived from the implementation under test.
const regular={common:.55,uncommon:.27,rare:.12,epic:.05,legendary:.01};
const guaranteed={common:0,uncommon:.65,rare:.25,epic:.08,legendary:.02};
const finishes={normal:.93,calligraphic:.02,chromatic:.03,holographic:.02};
for(const [x,expected] of [[0,'common'],[.549999,'common'],[.55,'uncommon'],[.819999,'uncommon'],[.82,'rare'],[.939999,'rare'],[.94,'epic'],[.989999,'epic'],[.99,'legendary'],[.999999,'legendary']])
 assert.equal(rollRarity(()=>x),expected);
for(const [x,expected] of [[0,'uncommon'],[.649999,'uncommon'],[.65,'rare'],[.899999,'rare'],[.9,'epic'],[.979999,'epic'],[.98,'legendary'],[.999999,'legendary']])
 assert.equal(rollRarity(()=>x,true),expected);
for(const [x,expected] of [[0,'chromatic'],[.029999,'chromatic'],[.03,'holographic'],[.049999,'holographic'],[.05,'calligraphic'],[.069999,'calligraphic'],[.07,'normal'],[.999999,'normal']])
 assert.equal(rollFinish(()=>x),expected);

function seeded(seed){
 let x=seed>>>0;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296};
}
const count=(obj,key)=>{obj[key]=(obj[key]||0)+1};
const sample=100000;
function verifyRates(actual,expected,total,label){
 for(const [key,p] of Object.entries(expected)){
  const observed=(actual[key]||0)/total;
  const tolerance=p===0?0:Math.max(.0005,6*Math.sqrt(p*(1-p)/total));
  assert.ok(Math.abs(observed-p)<=tolerance,label+' '+key+' : observed '+observed+' expected '+p);
 }
}
const pct=(counts,total)=>Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,Number((v/total*100).toFixed(3))]));
for(const [label,pool,draw,seed] of [
 ['Origines',ORIGINES,drawPack,1234567],
 ['Reflets brisés',REFLETS_CARDS,drawRefletsPack,2345678],
 ['Au-delà du Verre',AU_DELA_BOOSTER_CARDS,drawAuDelaPack,3456789]
]){
 const rng=seeded(seed),byId=new Map(pool.map(c=>[c.id,c]));
 const poolSizes={};for(const c of pool)count(poolSizes,c.rarity);
 const seenEver=new Set(),normalCounts={},lastCounts={},finishCounts={};
 let legendaryPacks=0;
 for(let i=0;i<sample;i++){
  const pack=draw(rng);
  assert.equal(pack.length,5);
  const seen=new Set(),rarityCounts={};
  let legendary=false;
  for(const [slot,pull] of pack.entries()){
   const card=byId.get(pull.id);
   assert.ok(card&&!card.signature,label+': pull outside eligible pool');
   assert.ok(Object.hasOwn(finishes,pull.finish));
   assert.equal(pull.shiny,pull.finish==='chromatic');
   count(slot===4?lastCounts:normalCounts,card.rarity);
   count(finishCounts,pull.finish);
   count(rarityCounts,card.rarity);
   if(seen.has(pull.id))assert.ok(rarityCounts[card.rarity]>poolSizes[card.rarity],
      'Repeat before exhausting same rarity');
   seen.add(pull.id);seenEver.add(pull.id);
   if(card.rarity==='legendary')legendary=true;
  }
  if(legendary)legendaryPacks++;
 }
 assert.equal(seenEver.size,pool.length,'Every eligible card is reachable');
 verifyRates(normalCounts,regular,sample*4,label+' slots 1–4');
 verifyRates(lastCounts,guaranteed,sample,label+' slot 5');
 verifyRates(finishCounts,finishes,sample*5,label+' finish');
 const chance=1-Math.pow(.99,4)*.98;
 assert.ok(Math.abs(legendaryPacks/sample-chance)<.005);
 console.log(JSON.stringify({booster:label,packs:sample,eligible:pool.length,slots1to4:pct(normalCounts,sample*4),slot5:pct(lastCounts,sample),finishes:pct(finishCounts,sample*5),packsWithLegendary:Number((legendaryPacks/sample*100).toFixed(3))}));
}
console.log('AETHERIUM odds audit: 300,000 seeded boosters / 1,500,000 cards; boundaries, pools, finishes, rarity guarantee and repeat rules OK.');
