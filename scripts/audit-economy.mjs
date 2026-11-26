// Read-only seeded economy audit. No browser storage, no gameplay changes.
// Run: node scripts/audit-economy.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CARDS as ORIGINES,drawPack,PACK_PRICE} from '../src/data.js';
import {REFLETS_CARDS,AU_DELA_BOOSTER_CARDS,drawRefletsPack,drawAuDelaPack} from '../src/collection-data.js';
import {duplicateDustReward,DUPLICATE_DUST} from '../src/duplicate-rewards.js';
import {getCraftCost,craftCard,CRAFT_COSTS} from '../src/crafting.js';
import {trialReward,DIFFICULTIES} from '../src/trial-progress.js';
import {milestonesFor,claimCollectionMilestone} from '../src/collection-milestones.js';

const seasonId='marches-de-verre';
const editions=[
 ['origines',ORIGINES,drawPack],
 ['reflets-brises',REFLETS_CARDS,drawRefletsPack],
 ['au-dela-du-verre',AU_DELA_BOOSTER_CARDS,drawAuDelaPack]
];
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const trialBlock=source.slice(source.indexOf('const definitions=['),source.indexOf('const mini=[];'));
const trials=[...trialBlock.matchAll(/name:'([^']+)'[^\n]+reward:(\d+)/g)].map(m=>({name:m[1],base:Number(m[2])}));
assert.equal(trials.length,5);
const startCoins=Number(source.match(/const fresh=\(\)=>\(\{coins:(\d+)/)?.[1]);
assert.ok(Number.isSafeInteger(startCoins));
const p=(a,n)=>a[Math.ceil(n*a.length)-1];
const summary=values=>{
 const a=[...values].sort((a,b)=>a-b);
 return {p10:p(a,.1),median:p(a,.5),p90:p(a,.9),mean:Number((a.reduce((s,n)=>s+n,0)/a.length).toFixed(1))};
};
function seeded(seed){
 let x=seed>>>0;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};
}
function claim(state,edition,pool){
 for(const entry of milestonesFor(seasonId,edition)){
  if(state.collectionMilestones[seasonId+'/'+edition]?.includes(entry.threshold))continue;
  const r=claimCollectionMilestone({seasonId,collectionId:edition,threshold:entry.threshold,cards:pool,owned:state.owned,claims:state.collectionMilestones});
  if(!r.ok)continue;
  state.collectionMilestones=r.claims;
  state[r.milestone.reward.currency]+=r.milestone.reward.amount;
 }
}
function blank(){return {coins:0,dust:0,owned:{},collectionMilestones:{},goalId:null}}
function sample(edition,pool,draw,seed,withFinishes){
 const rng=seeded(seed),byId=new Map(pool.map(c=>[c.id,c]));
 const state=blank(),collection=new Set(),finishes=Object.fromEntries(['normal','calligraphic','chromatic','holographic'].map(f=>[f,new Set()]));
 const result={};
 const milestones=[6,12,18];
 let pack=0,allFinish=0;
 while(!result.natural||!result.forge||(withFinishes&&!allFinish)){
  assert.ok(++pack<=100000,'Simulation exceeded limit');
  for(const pull of draw(rng)){
   const card=byId.get(pull.id);
   assert.ok(card);
   if(state.owned[pull.id])state.dust+=duplicateDustReward(card);
   state.owned[pull.id]=(state.owned[pull.id]||0)+1;
   collection.add(pull.id);
   if(withFinishes)finishes[pull.finish].add(pull.id);
  }
  if(!result.natural){
   claim(state,edition,pool);
   for(const n of milestones)if(collection.size>=n&&!result['at'+n])result['at'+n]=pack;
   if(collection.size===pool.length)result.natural=pack;
  }
  // Conservative, reproducible policy: reserve dust for all still-missing
  // cards, then craft them at once, avoiding later wasted purchases.
  if(!result.forge){
   const missing=pool.filter(c=>!state.owned[c.id]);
   const need=missing.reduce((n,c)=>n+getCraftCost(c),0);
   if(state.dust>=need){
    let copy={...state,owned:{...state.owned}};
    for(const card of missing){
     const crafted=craftCard(copy,card);
     assert.ok(crafted.ok);
     copy=crafted.state;
    }
    assert.ok(pool.every(c=>copy.owned[c.id]>0));
    result.forge=pack;
    result.crafted=missing.length;
    result.forgeDust=need;
    // Crowns granted by milestones before completion of the target set.
    // The full 24-card reward is only available after the goal is reached.
    result.preCompletionCoins=state.coins-(collection.size===24?100:0);
   }
  }
  if(withFinishes){
   for(const [finish,set] of Object.entries(finishes)){
    if(set.size===pool.length&&!result[finish])result[finish]=pack;
   }
   if(Object.values(finishes).every(set=>set.size===pool.length))allFinish=pack;
  }
 }
 if(withFinishes)result.allFinish=allFinish;
 return result;
}
const rounds=600,specialRounds=100;
const rows=[];
for(const [index,[edition,pool,draw]] of editions.entries()){
 const samples=[];
 for(let i=0;i<rounds;i++)samples.push(sample(edition,pool,draw,((index+1)*1000003+(i+1)*7919)>>>0,i<specialRounds));
 const fields=['at6','at12','at18','natural','forge','crafted','forgeDust','preCompletionCoins'];
 const row={edition,cards:pool.length,runs:rounds,finishRuns:specialRounds};
 for(const f of fields)row[f]=summary(samples.map(s=>s[f]));
 for(const f of ['normal','calligraphic','chromatic','holographic','allFinish'])row[f]=summary(samples.slice(0,specialRounds).map(s=>s[f]));
 assert.ok(samples.every(s=>s.forge<=s.natural));
 rows.push(row);
 console.log('ECONOMY_EDITION '+JSON.stringify(row));
}
console.log('ECONOMY_RULES '+JSON.stringify({startCoins,packPrice:PACK_PRICE,duplicate:DUPLICATE_DUST,forge:CRAFT_COSTS,trials:trials.map(t=>({...t,rewards:Object.fromEntries(DIFFICULTIES.map(m=>[m.id,[trialReward(t.base,m.id,80),trialReward(t.base,m.id,100)]]))}))}));
// The single-collection simulations are deliberately isolated: dust cannot
// be borrowed from another edition. Signature and expeditions are excluded.
// For a planning estimate only, add medians across editions (not a season median).
const summed=rows.reduce((n,r)=>n+r.forge.median,0);
const crowns=Math.max(0,summed*PACK_PRICE-startCoins-2*185-85);
console.log('ECONOMY_PLANNING '+JSON.stringify({sumOfEditionMedians:summed,netCrownsEstimate:crowns,assumedMilestonesBeforeSeasonCompletion:455,
 examples:[{crownsPerWin:55,wins:Math.ceil(crowns/55)},{crownsPerWin:70,wins:Math.ceil(crowns/70)}]}));
console.log('Economy audit complete; no game or save changes.');
