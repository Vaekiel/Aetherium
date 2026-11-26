// Compare the cost of completing each finish with the baseline audit.
// No currency or save mutation; isolated editions, deterministic draw sequence.
import assert from 'node:assert/strict';
import {CARDS as ORIGINES,drawPack} from '../src/data.js';
import {REFLETS_CARDS,AU_DELA_BOOSTER_CARDS,drawRefletsPack,drawAuDelaPack} from '../src/collection-data.js';
import {duplicateDustReward} from '../src/duplicate-rewards.js';
import {getFinishCraftCost} from '../src/finish-crafting.js';
import {FINISH_KEYS} from '../src/finishes.js';
function seeded(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
for(const [index,[label,pool,draw]] of [['origines',ORIGINES,drawPack],['reflets-brises',REFLETS_CARDS,drawRefletsPack],['au-dela-du-verre',AU_DELA_BOOSTER_CARDS,drawAuDelaPack]].entries()){
 const results=[];
 for(let i=0;i<200;i++){
  const rng=seeded((index+1)*1000003+(i+1)*7919),seen=new Set(),variants=new Set();
  const byId=new Map(pool.map(c=>[c.id,c]));
  let dust=0,pack=0,needed;
  do{
   assert.ok(++pack<20000);
   for(const pull of draw(rng)){
    if(seen.has(pull.id))dust+=duplicateDustReward(byId.get(pull.id));
    seen.add(pull.id);variants.add(pull.id+':'+pull.finish);
   }
   // All still-missing finishes; a missing discovery can first be forged as Normal.
   needed=pool.reduce((total,c)=>total+FINISH_KEYS.reduce((n,f)=>n+(variants.has(c.id+':'+f)?0:getFinishCraftCost(c,f)),0),0);
  }while(dust<needed);
  results.push(pack);
 }
 results.sort((a,b)=>a-b);
 console.log('FINISH_FORGE_SIM '+JSON.stringify({edition:label,runs:results.length,p10:results[19],median:results[99],p90:results[179]}));
}
