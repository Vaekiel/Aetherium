import assert from 'node:assert/strict';
import {CARDS as ORIGINES,drawPack,drawPackFromPool,
 RARITIES,PACK_PRICE,CHROMATIC_RATE} from '../src/data.js';
import {REFLETS_CARDS,drawRefletsPack} from '../src/collection-data.js';
import {CRAFT_COSTS} from '../src/crafting.js';
import {DUPLICATE_DUST} from '../src/duplicate-rewards.js';
import {readFileSync} from 'node:fs';

const pools=[
 {name:'Origines',cards:ORIGINES,draw:drawPack,first:1,last:24},
 {name:'Reflets brisés',cards:REFLETS_CARDS,draw:drawRefletsPack,first:25,last:48}
];
const expectedWeights={common:55,uncommon:27,rare:12,epic:5,legendary:1};
assert.deepEqual(Object.fromEntries(
 Object.entries(RARITIES).map(([key,value])=>[key,value.weight])),expectedWeights);
assert.equal(CHROMATIC_RATE,0.03);
assert.equal(PACK_PRICE,100);
assert.deepEqual(CRAFT_COSTS,{common:20,uncommon:45,rare:100,epic:220,legendary:450});
assert.deepEqual(DUPLICATE_DUST,{common:5,uncommon:7,rare:10,epic:15,legendary:25});

function assertPack(pack,pool){
 assert.equal(pack.length,5,pool.name+' always draws five cards');
 const ids=new Set(pool.cards.map(card=>card.id));
 const picked=[];
 for(const item of pack){
  assert.ok(ids.has(item.id),'A card must come from the chosen pool: '+pool.name);
  assert.equal(typeof item.shiny,'boolean');
  const card=pool.cards.find(card=>card.id===item.id);
  const prior=picked.filter(x=>x.rarity===card.rarity);
  const same=prior.some(x=>x.id===item.id);
  if(same){
   const options=pool.cards.filter(x=>x.rarity===card.rarity).length;
   assert.equal(new Set(prior.map(x=>x.id)).size,options,
    'Same-packet duplicates are only allowed if that rarity has run out of other cards');
  }
  picked.push(card);
 }
 assert.notEqual(picked[4].rarity,'common','The fifth card still guarantees uncommon or better');
 return picked;
}
function rngWithSeed(seed){
 let state=seed>>>0;
 return ()=>{
  state=(state+0x6d2b79f5)>>>0;
  let x=state;
  x=Math.imul(x^(x>>>15),x|1);
  x^=x+Math.imul(x^(x>>>7),x|61);
  return ((x^(x>>>14))>>>0)/4294967296;
 };
}
for(const pool of pools){
 for(const fixed of [0.001,0.02999,0.03,0.1,0.5,0.72,0.94,0.999]){
  const pack=pool.draw(()=>fixed);
  const cards=assertPack(pack,pool);
  if(fixed===0.5||fixed===0.72)
   assert.equal(new Set(pack.map(x=>x.id)).size,5,
    'With six cards in the rarity pool, all five slots can be different');
  if(fixed===0.999){
   assert.equal(new Set(pack.map(x=>x.id)).size,3,
    'Once three legendary designs are used, repeat is allowed without changing rarity');
   assert.ok(cards.every(card=>card.rarity==='legendary'));
  }
 }
 assert.ok(pool.draw(()=>0.02999).every(item=>item.shiny));
 assert.ok(pool.draw(()=>0.03).every(item=>!item.shiny));
}
assert.deepEqual(drawPackFromPool(ORIGINES,()=>0.72),drawPack(()=>0.72),
 'Original booster delegates to the shared anti-repeat selection algorithm');
const draws=12000,rarityCount=Object.fromEntries(Object.keys(RARITIES).map(k=>[k,0]));
let chromaticCount=0,rareRepeats=0;
const originesRng=rngWithSeed(0xa37e2026),refletsRng=rngWithSeed(0xa37e2026);
for(let i=0;i<draws;i++){
 const [a,b]=[drawPack(originesRng),drawRefletsPack(refletsRng)];
 const [originesCards,refletsCards]=[
  assertPack(a,pools[0]),assertPack(b,pools[1])
 ];
 // Identical seed, card quantities, rarity distribution and chromatic finishes:
 // no collection is easier to complete by choosing its booster.
 assert.deepEqual(originesCards.map(card=>card.rarity),refletsCards.map(card=>card.rarity));
 assert.deepEqual(a.map(x=>x.shiny),b.map(x=>x.shiny));
 for(const card of originesCards)rarityCount[card.rarity]++;
 chromaticCount+=a.filter(item=>item.shiny).length;
 if(new Set(a.map(x=>x.id)).size<5)rareRepeats++;
}
const weightsPerSlot={common:.44,uncommon:.346,rare:.146,epic:.056,legendary:.012};
for(const [rarity,expected] of Object.entries(weightsPerSlot)){
 const observed=rarityCount[rarity]/(draws*5);
 assert.ok(Math.abs(observed-expected)<.012,
  rarity+' distribution should remain close to original '+expected+', got '+observed);
}
assert.ok(Math.abs(chromaticCount/(draws*5)-.03)<.006,
 'The effective Chromatic probability remains 3 percent per card');
assert.ok(rareRepeats<50,
 'Remaining repeats should only happen when the same-rarity pool is exhausted');

const js=readFileSync('src/main.js','utf8');
const html=readFileSync('index.html','utf8');
assert.ok(js.includes("from './data.js?v=booster-variety-1'"));
assert.ok(js.includes("from './collection-data.js?v=booster-variety-1'"));
assert.ok(html.includes('main.js?v=au-dela-lot-2'));
assert.ok(js.includes("edition==='origines'?drawPack():drawRefletsPack()"),
 'The purchase and reveal handler still chooses the correct booster');
assert.ok(js.includes('state.coins-=PACK_PRICE')&&js.includes('state.dust+=dustGain'),
 'Pack purchases and duplicate rewards are unchanged');
console.log('AETHERIUM boosters: more variety inside each 5-card packet, same rarity and Chromatic odds, isolated pools and unchanged economy');
