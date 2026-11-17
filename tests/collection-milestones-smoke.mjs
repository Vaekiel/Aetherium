import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=file=>readFileSync(file,'utf8');
const load=path=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(path)));
const {CARDS}=await load('src/data.js');
const {cardsForCollection}=await load('src/seasons.js');
const {
  COLLECTION_MILESTONES,collectionMilestoneKey,milestonesFor,
  sanitizeMilestoneClaims,uniqueCardsOwned,
  collectionMilestoneStatus,claimCollectionMilestone
}=await load('src/collection-milestones.js');
const seasonId='marches-de-verre',collectionId='origines';
const cards=cardsForCollection(CARDS,seasonId,collectionId);
assert.equal(cards.length,24);
assert.equal(collectionMilestoneKey(seasonId,collectionId),'marches-de-verre/origines');
assert.deepEqual(milestonesFor(seasonId,collectionId).map(m=>m.threshold),[6,12,18,24]);
assert.deepEqual(milestonesFor(seasonId,collectionId).map(m=>[m.reward.currency,m.reward.amount]),
  [['coins',30],['coins',55],['dust',20],['coins',100]]);
assert.equal(milestonesFor('plateau-nebuleux','plateau-1').length,0,'Future seasons do not award anything');
assert.equal(milestonesFor(seasonId,'reflets-brises').length,0,'Unreleased parts have no reward pool');
assert.equal(Object.keys(COLLECTION_MILESTONES).length,1);
const own=n=>Object.fromEntries(cards.slice(0,n).map((card,i)=>[card.id,i===0?2:1]));
assert.equal(uniqueCardsOwned(cards,own(1)),1,'Copies do not increase distinct-card count');
assert.equal(uniqueCardsOwned(cards,{1:-1,2:Infinity,3:1.5,4:'2',5:1}),1,
  'Malformed ownership never unlocks a threshold');
for(const n of [0,5,6,11,12,17,18,23,24]){
 const expected=[6,12,18,24].map(t=>n>=t?'claimable':'locked');
 assert.deepEqual(collectionMilestoneStatus(seasonId,collectionId,cards,own(n),{}).map(x=>x.status),expected);
}
const fullOwn=own(24);
const corrupted={
 'marches-de-verre/origines':[6,6,12,1,24,'18',18,999],
 'plateau-nebuleux/plateau-1':[6,12,18,24],garbage:1
};
assert.deepEqual(sanitizeMilestoneClaims(corrupted),{'marches-de-verre/origines':[6,12,18,24]});
assert.deepEqual(sanitizeMilestoneClaims([]),{});
assert.deepEqual(sanitizeMilestoneClaims(null),{});
const invalid=claimCollectionMilestone({
 seasonId,collectionId,threshold:24,cards,owned:own(23),claims:{}
});
assert.equal(invalid.ok,false,'Twenty-three unique cards cannot unlock the final reward');
const initial=claimCollectionMilestone({
 seasonId,collectionId,threshold:6,cards,owned:own(6),claims:{}
});
assert.equal(initial.ok,true);
assert.deepEqual(initial.claims,{'marches-de-verre/origines':[6]});
assert.equal(initial.milestone.fragment.length>50,true,'An actual narrative fragment is included');
const repeat=claimCollectionMilestone({
 seasonId,collectionId,threshold:6,cards,owned:own(24),claims:initial.claims
});
assert.equal(repeat.ok,false,'Reward cannot be claimed a second time');
const unknown=claimCollectionMilestone({
 seasonId,collectionId:'reflets-brises',threshold:6,cards,owned:fullOwn,claims:{}
});
assert.equal(unknown.ok,false,'A future collection cannot trigger rewards');
const wrong=claimCollectionMilestone({
 seasonId,collectionId,threshold:10,cards,owned:fullOwn,claims:{}
});
assert.equal(wrong.ok,false,'Arbitrary thresholds are rejected');
const main=read('src/main.js'),html=read('index.html'),css=read('src/codex.css');
for(const id of ['codex-milestones','codex-milestones-list','codex-milestones-count','codex-milestones-progress'])
 assert.ok(html.includes('id="'+id+'"'),'Missing journal widget: '+id);
assert.ok(html.includes('<details id="codex-milestones"')&&html.includes('hidden>'),
 'The journal starts compact and hidden until a released collection is selected');
assert.ok(!html.includes(milestonesFor(seasonId,collectionId)[0].fragment),
 'No narrative spoilers are embedded in the initial HTML');
assert.ok(main.includes("from './collection-milestones.js'"),'Pure collection milestones are imported');
assert.ok(main.includes('renderCollectionMilestones(availableCards)'),'Released collections render their journal');
assert.ok(main.includes("$('#codex-milestones').hidden=true"),
 'Unreleased collections hide the journal');
assert.ok(main.includes("if(claimed){")&&main.includes("'« '+entry.fragment+' »'"),
 'Story fragments are only rendered for claimed milestones');
assert.ok(main.includes('state.collectionMilestones=result.claims'),
 'Claims are persisted with wallet updates');
assert.ok(main.includes("s.collectionMilestones=sanitizeMilestoneClaims(raw.collectionMilestones)"),
 'Old saves can be loaded without losing a card');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Save key unchanged');
assert.ok(css.includes('#page-collection .codex-milestones'),
 'Midnight-violet journal design is present');
assert.ok(css.includes('@media(max-width:390px)'),
 'The smallest mobile screens display one clear tile per row');
assert.ok(html.includes('src/main.js?v=alchemy-mastery-172b'));
assert.ok(html.includes('src/codex.css?v=seasons-1.7.1'));

// Execute the real source save loader in a VM with legacy player data.
const freshCode=main.slice(main.indexOf('const fresh='),main.indexOf('function load(){'));
const loadCode=main.slice(main.indexOf('function load(){'),main.indexOf('let state=load();'));
const legacy={coins:430,dust:125,wins:3,earned:800,opened:15,
 owned:own(12),shiny:{1:true},goalId:20,difficulty:'maitrise'};
const legacyState=runInNewContext(freshCode+loadCode+'load()',{
 SAVE:'aetherium-save-v1',CARDS,sanitizeMilestoneClaims,
 localStorage:{getItem:()=>JSON.stringify(legacy)}
});
assert.equal(legacyState.coins,430);assert.equal(legacyState.dust,125);
assert.equal(legacyState.owned[1],2);assert.equal(legacyState.shiny[1],true);
assert.equal(legacyState.difficulty,'maitrise');
assert.deepEqual(JSON.parse(JSON.stringify(legacyState.collectionMilestones)),{});
assert.deepEqual(collectionMilestoneStatus(seasonId,collectionId,cards,legacyState.owned,legacyState.collectionMilestones)
 .map(x=>x.status),['claimable','claimable','locked','locked'],
 'Legacy progress can claim unlocked achievements retroactively');
const saved=JSON.parse(JSON.stringify({...legacy,collectionMilestones:{'marches-de-verre/origines':[6]}}));
const restored=runInNewContext(freshCode+loadCode+'load()',{
 SAVE:'aetherium-save-v1',CARDS,sanitizeMilestoneClaims,
 localStorage:{getItem:()=>JSON.stringify(saved)}
});
assert.deepEqual(JSON.parse(JSON.stringify(restored.collectionMilestones)),{'marches-de-verre/origines':[6]},
 'Already claimed rewards survive reload without duplication');

// Invoke the REAL game handler. One successful click must credit and persist once.
const claimStart=main.indexOf('function claimDiscoveryFragment(');
const claimEnd=main.indexOf('function renderCollectionMilestones(',claimStart);
assert.ok(claimStart>0&&claimEnd>claimStart,'Discover the real game claim handler');
const gameState={coins:430,dust:125,earned:800,wins:3,owned:own(12),collectionMilestones:{}};
let updates=0,refreshes=0;
const notices=[];
const sandbox={
 state:gameState,activeSeason:seasonId,activeCollection:collectionId,
 CARDS,cardsForCollection,claimCollectionMilestone,
 update(){updates++;},renderCollection(){refreshes++;},notify(message){notices.push(message);}
};
runInNewContext(main.slice(claimStart,claimEnd)+
 'claimDiscoveryFragment(6);claimDiscoveryFragment(6);claimDiscoveryFragment(12);claimDiscoveryFragment(18);',sandbox);
assert.equal(gameState.coins,430+30+55,'Exactly two available Crown rewards are credited');
assert.equal(gameState.dust,125,'Locked shards cannot be granted');
assert.equal(gameState.earned,800+30+55,'Earned-currency stats remain consistent');
assert.deepEqual(JSON.parse(JSON.stringify(gameState.collectionMilestones)),
 {'marches-de-verre/origines':[6,12]},'Claims are stored exactly once');
assert.equal(updates,2,'Duplicate and locked claims never write a save');
assert.equal(refreshes,2,'Only genuine claims rerender the journal');
assert.equal(notices.length,4,'Every attempt has a feedback message');
assert.equal(gameState.wins,3,'Collecting rewards cannot count as a mini-game victory');
assert.ok(main.includes('state=fresh()'),'Reset still clears all milestones');
console.log('AETHERIUM 1.7.1 — fragments scellés, récompenses uniques, anciens joueurs, UI et sauvegarde OK');
