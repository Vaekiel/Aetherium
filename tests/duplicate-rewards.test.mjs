import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,RARITIES,PACK_PRICE,CHROMATIC_RATE} from '../src/data.js';
import {CRAFT_COSTS} from '../src/crafting.js';
import {DUPLICATE_DUST,duplicateDustReward} from '../src/duplicate-rewards.js';

const payout={common:5,uncommon:7,rare:10,epic:15,legendary:25};
const craft={common:20,uncommon:45,rare:100,epic:220,legendary:450};

test('every known rarity has its exact immutable duplicate reward',()=>{
 assert.deepEqual(DUPLICATE_DUST,payout);
 assert.equal(Object.isFrozen(DUPLICATE_DUST),true);
 for(const [rarity,amount] of Object.entries(payout)){
  const card=CARDS.find(card=>card.rarity===rarity);
  assert.ok(card,'The published set has a '+rarity+' card');
  assert.equal(duplicateDustReward(card),amount);
  assert.equal(duplicateDustReward({...card,shiny:true}),amount,
   'Chromatic visuals do not double the duplicate reward');
 }
 assert.equal(duplicateDustReward(null),0);
 assert.equal(duplicateDustReward({rarity:'unknown'}),0);
});

test('the economy retains the existing pack price, rarity odds and Forge costs',()=>{
 assert.equal(PACK_PRICE,100);
 assert.equal(CHROMATIC_RATE,0.03);
 assert.deepEqual(Object.fromEntries(Object.entries(RARITIES).map(([key,v])=>[key,v.weight])),
  {common:55,uncommon:27,rare:12,epic:5,legendary:1});
 assert.deepEqual(CRAFT_COSTS,craft);
});

test('five duplicates in any one rarity grant exactly five scaled rewards',()=>{
 for(const [rarity,amount] of Object.entries(payout)){
  const card=CARDS.find(c=>c.rarity===rarity);
  const awarded=Array.from({length:5},()=>duplicateDustReward(card)).reduce((a,b)=>a+b,0);
  assert.equal(awarded,5*amount);
 }
});

test('all-duplicate booster expected value improves without changing rarity probabilities',()=>{
 // Standard slots: 55/27/12/5/1, final guaranteed slot: 65/25/8/2.
 const normal=Object.entries(RARITIES).reduce((total,[rarity,entry])=>
  total+entry.weight*DUPLICATE_DUST[rarity]/100,0);
 const guaranteed=(65*payout.uncommon+25*payout.rare+
  8*payout.epic+2*payout.legendary)/100;
 const before=5*5;
 const after=4*normal+guaranteed;
 assert.equal(Number(normal.toFixed(2)),6.84);
 assert.equal(Number(after.toFixed(2)),36.11);
 assert.ok(after>before);
});
