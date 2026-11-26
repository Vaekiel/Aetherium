import assert from 'node:assert/strict';
import {CARDS} from '../src/collection-data.js';
import {FINISH_KEYS,restoreFinishCounts,synchronizeFinishCounts} from '../src/finishes.js';
import {getFinishCraftCost,canCraftFinish,craftFinish,FINISH_CRAFT_COSTS} from '../src/finish-crafting.js';
import {createBackup,decodeBackup} from '../src/save-backup.js';
const ids=CARDS.map(c=>c.id);
for(const rarity of ['common','uncommon','rare','epic','legendary']){
 const card=CARDS.find(c=>c.rarity===rarity),id=card.id;
 const base={coins:300,dust:10000,opened:2,wins:4,earned:200,owned:{[id]:2},shiny:{},finishCounts:restoreFinishCounts({[id]:2}),goalId:null};
 let state=base;
 for(const f of ['chromatic','calligraphic','holographic']){
  const price=getFinishCraftCost(card,f);
  assert.equal(price,FINISH_CRAFT_COSTS[f][rarity]);
  assert.ok(canCraftFinish(state,card,f));
  const before=JSON.stringify(state);
  assert.equal(craftFinish({...state,dust:price-1},card,f).ok,false);
  const r=craftFinish(state,card,f);
  assert.ok(r.ok);
  assert.equal(JSON.stringify(state),before);
  assert.equal(r.state.dust,state.dust-price);
  assert.equal(r.state.owned[id],state.owned[id]+1);
  assert.equal(r.state.finishCounts[f][id],1);
  assert.equal(r.state.finishCounts.normal[id],2);
  assert.equal(r.state.coins,300);
  assert.equal(r.state.opened,2);
  assert.equal(craftFinish(r.state,card,f).ok,false);
  state=r.state;
 }
 synchronizeFinishCounts(state);
 assert.equal(state.shiny[id],true);
 assert.equal(state.owned[id],5);
 assert.equal(FINISH_KEYS.reduce((s,f)=>s+(state.finishCounts[f][id]||0),0),5);
 const backup=await createBackup(state,ids);
 const decoded=await decodeBackup(backup,ids);
 assert.deepEqual(decoded.state.finishCounts,state.finishCounts);
 assert.equal(decoded.state.dust,state.dust);
 const specialOnly={...base,owned:{[id]:1},shiny:{[id]:true},finishCounts:restoreFinishCounts({[id]:1},{[id]:true})};
 assert.ok(canCraftFinish(specialOnly,card,'normal'));
 const normal=craftFinish(specialOnly,card,'normal');
 assert.equal(normal.state.finishCounts.normal[id],1);
 assert.equal(normal.state.finishCounts.chromatic[id],1);
 assert.equal(normal.state.owned[id],2);
 assert.equal(craftFinish({...base,owned:{}},card,'chromatic').ok,false);
}
const signature=CARDS.find(c=>c.id===72);
for(const f of FINISH_KEYS)assert.equal(getFinishCraftCost(signature,f),null);
assert.equal(getFinishCraftCost(CARDS[0],'invalid'),null);
console.log('Finish Forge: all rarities, balance, ownership, preservation, legacy normal recovery, save roundtrip and Signature exclusion OK.');
