import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {DIFFICULTIES,trialScore,trialReward,recordTrialWin} from '../src/trial-progress.js';
import {recordPersonalBest} from '../src/trial-records.js';
import {CARDS,RARITIES,PACK_PRICE,CHROMATIC_RATE} from '../src/data.js';
import {REFLETS_CARDS} from '../src/collection-data.js';
import {DUPLICATE_DUST,duplicateDustReward} from '../src/duplicate-rewards.js';
import {CRAFT_COSTS,craftCard} from '../src/crafting.js';

const baseRewards=[35,45,50,65,60];
assert.equal(PACK_PRICE,100);
assert.equal(CHROMATIC_RATE,0.03);
assert.deepEqual(DIFFICULTIES.map(m=>m.bonus),[0,0,15]);
for(const base of baseRewards){
  assert.equal(trialReward(base,'initiation',100),base);
  assert.equal(trialReward(base,'aventure',100),base+5);
  assert.equal(trialReward(base,'maitrise',80),base+15);
  assert.equal(trialReward(base,'maitrise',100),base+20);
  assert.ok((base+5)/(base+20)<0.83,
    'Mastery makes sense when the clear rate is a reasonable fraction of Adventure');
}
for(const [hints,score] of [[0,100],[1,90],[2,80],[3,70],[5,50],[10,0]]){
  assert.equal(trialScore(3,{hints}),score);
}
assert.equal(trialReward(65,'initiation',trialScore(3,{hints:0})),65);
assert.equal(trialReward(65,'aventure',trialScore(3,{hints:0})),70);
assert.equal(trialReward(65,'aventure',trialScore(3,{hints:2})),65);
assert.equal(trialReward(65,'maitrise',trialScore(3,{hints:0})),85);
assert.equal(trialReward(65,'maitrise',trialScore(3,{hints:1})),85);
assert.equal(trialReward(65,'maitrise',trialScore(3,{hints:2})),80);

assert.deepEqual(CRAFT_COSTS,{common:20,uncommon:45,rare:100,epic:220,legendary:450});
assert.deepEqual(DUPLICATE_DUST,{common:5,uncommon:7,rare:10,epic:15,legendary:25});
const normal=Object.entries(RARITIES).reduce((sum,[rarity,entry])=>
  sum+entry.weight*DUPLICATE_DUST[rarity]/100,0);
const guaranteed=(65*7+25*10+8*15+2*25)/100;
const duplicatePackValue=4*normal+guaranteed;
assert.equal(Number(duplicatePackValue.toFixed(2)),36.11,
  'Long-term shard earning is unchanged: average all-duplicate pack earns 36.11');
assert.ok(CRAFT_COSTS.legendary/duplicatePackValue>12&&CRAFT_COSTS.legendary/duplicatePackValue<13,
  'Crafting a targeted legendary remains a sizable but reachable end-game goal');
for(const card of [CARDS.find(c=>c.rarity==='legendary'),
 REFLETS_CARDS.find(c=>c.rarity==='legendary')]){
 const old={coins:845,earned:900,opened:12,wins:9,
   dust:450,owned:{},shiny:{},goalId:card.id};
 const result=craftCard(old,card);
 assert.equal(result.ok,true);
 assert.equal(result.state.owned[card.id],1);
 assert.equal(result.state.dust,0);
 assert.equal(result.state.coins,845);
 assert.equal(result.state.earned,900);
 assert.equal(result.state.opened,12);
 assert.equal(old.dust,450,'Crafting never mutates the original save');
 assert.equal(duplicateDustReward(card),25,'Legendary duplicate payout does not change');
 assert.equal(craftCard(result.state,card).ok,false,'No free duplicate Forge cards');
}

// Execute the real browser-side victory handler for a zero-probe excavation.
// The bonus must reach the wallet exactly once, while keeping the save schema.
const main=readFileSync('src/main.js','utf8');
const start=main.indexOf('function complete(i,description,performance={}){');
const end=main.indexOf('const runeNames=',start);
assert.ok(start>=0&&end>start);
const source=main.slice(start,end);
const game={mode:'maitrise',reward:65,ended:false,status:{textContent:''}};
const state={coins:100,dust:9,earned:200,wins:1,
 trialStats:[],trialRecords:[],expedition:{route:null}};
let credits=0,refreshes=0;
runInNewContext(source+
  "complete(3,'Fouilles accomplies',{hints:0});"+
  "complete(3,'Fouilles accomplies',{hints:0});",{
 mini:[null,null,null,game],state,
 trialScore,trialReward,recordTrialWin,recordPersonalBest,
 grant(earned){credits++;state.coins+=earned;state.earned+=earned;state.wins++},
 renderTrialMastery(){refreshes++}
});
assert.equal(credits,1,'A finished trial can never be credited twice');
assert.equal(state.coins,185,'Zero-probe Mastery victory gives 85 Crowns');
assert.equal(state.earned,285);
assert.equal(state.dust,9,'The mode does not mint shards');
assert.equal(state.trialStats[3].bestScore,100);
assert.equal(state.trialRecords[3].maitrise.bestMetric,0);
assert.equal(refreshes,1);
assert.ok(game.status.textContent.includes('100/100 · +85 Couronnes'));

const html=readFileSync('index.html','utf8');
assert.ok(html.includes('main.js?v=revers-expedition-1'),'The browser loads fresh changes');
assert.ok(main.includes("from './trial-progress.js?v=mastery-balance-2'"));
assert.ok(main.includes("complete(3,'Fouille accomplie ! '+safeTarget+' dalles sûres ont été explorées.',{hints:sondes})"),
  'The game sends real probe usage to scoring');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'No migration is needed');
console.log('AETHERIUM Maîtrise / Forge: adjusted expert bonus, excavation probe scoring, stable crafting and saved progression');
