import {createSaveSession} from '../src/save-session.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=file=>readFileSync(file,'utf8');
const load=path=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(path)));
const {CARDS}=await load('src/data.js');
const {CARDS:ALL_CARDS}=await import('../src/collection-data.js');
const {cardsForCollection}=await load('src/seasons.js');
const {
  COLLECTION_MILESTONES,collectionMilestoneKey,milestonesFor,
  sanitizeMilestoneClaims,uniqueCardsOwned,
  collectionMilestoneStatus,claimCollectionMilestone
}=await load('src/collection-milestones.js');
const seasonId='marches-de-verre',collectionId='origines';
const cards=cardsForCollection(ALL_CARDS,seasonId,collectionId);
const refletsId='reflets-brises',refletsKey='marches-de-verre/reflets-brises';
const refletsCards=cardsForCollection(ALL_CARDS,seasonId,refletsId);
const auDelaId='au-dela-du-verre',auDelaKey='marches-de-verre/au-dela-du-verre';
const auDelaCards=cardsForCollection(ALL_CARDS,seasonId,auDelaId);
assert.equal(cards.length,24);
assert.equal(refletsCards.length,24);
assert.deepEqual(refletsCards.map(c=>c.id),Array.from({length:24},(_,i)=>i+25));
assert.equal(collectionMilestoneKey(seasonId,collectionId),'marches-de-verre/origines');
assert.deepEqual(milestonesFor(seasonId,collectionId).map(m=>m.threshold),[6,12,18,24]);
assert.deepEqual(milestonesFor(seasonId,collectionId).map(m=>[m.reward.currency,m.reward.amount]),
  [['coins',30],['coins',55],['dust',20],['coins',100]]);
assert.equal(milestonesFor('plateau-nebuleux','plateau-1').length,0,'Future seasons do not award anything');
assert.deepEqual(milestonesFor(seasonId,refletsId).map(m=>m.threshold),[6,12,18,24]);
assert.deepEqual(milestonesFor(seasonId,refletsId).map(m=>[m.reward.currency,m.reward.amount]),
  [['coins',30],['coins',55],['dust',20],['coins',100]],
  'Reflets receives the same balanced one-time rewards as Origines');
assert.ok(milestonesFor(seasonId,refletsId).every(m=>m.fragment.length>90),
  'Each Reflets threshold has a complete original narrative fragment');
assert.equal(auDelaCards.length,24);
assert.deepEqual(auDelaCards.map(c=>c.id),Array.from({length:24},(_,i)=>i+49));
assert.deepEqual(milestonesFor(seasonId,auDelaId).map(m=>m.threshold),[6,12,18,24]);
assert.deepEqual(milestonesFor(seasonId,auDelaId).map(m=>[m.reward.currency,m.reward.amount]),
  [['coins',30],['coins',55],['dust',20],['coins',100]],
  'Au-delà du Verre keeps the original balanced narrative fragment payouts');
assert.ok(milestonesFor(seasonId,auDelaId).every(m=>m.fragment.length>120),
  'The third collection has four complete, original narrative pages');
assert.equal(Object.keys(COLLECTION_MILESTONES).length,3);
const own=n=>Object.fromEntries(cards.slice(0,n).map((card,i)=>[card.id,i===0?2:1]));
const ownReflets=n=>Object.fromEntries(refletsCards.slice(0,n).map((card,i)=>[card.id,i===0?3:1]));
const ownAuDela=n=>Object.fromEntries(auDelaCards.slice(0,n).map(card=>[card.id,1]));
assert.equal(uniqueCardsOwned(cards,own(1)),1,'Copies do not increase distinct-card count');
assert.equal(uniqueCardsOwned(cards,{1:-1,2:Infinity,3:1.5,4:'2',5:1}),1,
  'Malformed ownership never unlocks a threshold');
for(const n of [0,5,6,11,12,17,18,23,24]){
 const expected=[6,12,18,24].map(t=>n>=t?'claimable':'locked');
 assert.deepEqual(collectionMilestoneStatus(seasonId,collectionId,cards,own(n),{}).map(x=>x.status),expected);
 assert.deepEqual(collectionMilestoneStatus(seasonId,refletsId,refletsCards,ownReflets(n),{}).map(x=>x.status),expected);
 assert.deepEqual(collectionMilestoneStatus(seasonId,auDelaId,auDelaCards,ownAuDela(n),{}).map(x=>x.status),expected);
}
assert.deepEqual(collectionMilestoneStatus(seasonId,refletsId,refletsCards,own(24),{})
 .map(x=>x.status),['locked','locked','locked','locked'],
 'Owning all Origines cards cannot unlock Reflets milestones');
const fullOwn=own(24);
const corrupted={
 'marches-de-verre/origines':[6,6,12,1,24,'18',18,999],
 [refletsKey]:[6,6,12,15,'24',24,999],
 [auDelaKey]:[6,6,12,13,'24',24,999],
 'plateau-nebuleux/plateau-1':[6,12,18,24],garbage:1
};
assert.deepEqual(sanitizeMilestoneClaims(corrupted),{
 'marches-de-verre/origines':[6,12,18,24],
 [refletsKey]:[6,12,24],
 [auDelaKey]:[6,12,24]
});
assert.deepEqual(sanitizeMilestoneClaims([]),{});
assert.deepEqual(sanitizeMilestoneClaims(null),{});
const invalid=claimCollectionMilestone({
 seasonId,collectionId,threshold:24,cards,owned:own(23),claims:{}
});
const cannotClaimThirdFromOldCards=claimCollectionMilestone({
 seasonId,collectionId:auDelaId,threshold:6,cards:auDelaCards,owned:{...own(24),...ownReflets(24)},claims:{}
});
assert.equal(cannotClaimThirdFromOldCards.ok,false,
 'Finishing the other two collections cannot reveal the third journal');
const firstThird=claimCollectionMilestone({
 seasonId,collectionId:auDelaId,threshold:6,cards:auDelaCards,owned:ownAuDela(6),claims:{}
});
assert.equal(firstThird.ok,true);
assert.deepEqual(firstThird.claims,{[auDelaKey]:[6]});
assert.equal(claimCollectionMilestone({
 seasonId,collectionId:auDelaId,threshold:6,cards:auDelaCards,owned:ownAuDela(24),
 claims:firstThird.claims
}).ok,false,'The first third-collection fragment pays only once');
assert.equal(claimCollectionMilestone({
 seasonId,collectionId:auDelaId,threshold:24,cards:auDelaCards,owned:ownAuDela(23),claims:{}
}).ok,false,'The fourth fragment requires the story-only Signature');
const lastThird=claimCollectionMilestone({
 seasonId,collectionId:auDelaId,threshold:24,cards:auDelaCards,owned:ownAuDela(24),
 claims:firstThird.claims
});
assert.equal(lastThird.ok,true,'Winning the finale makes all 24 unique cards collectible');
assert.equal(lastThird.milestone.title,'Le serment des horizons');
assert.deepEqual(lastThird.claims,{[auDelaKey]:[6,24]});
assert.equal(claimCollectionMilestone({
 seasonId,collectionId:auDelaId,threshold:24,cards:auDelaCards,owned:ownAuDela(24),
 claims:lastThird.claims
}).ok,false,'The concluding story page cannot pay twice');
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
 seasonId,collectionId:'plateau-1',threshold:6,cards,owned:fullOwn,claims:{}
});
assert.equal(unknown.ok,false,'An unpublished collection cannot grant rewards');
const refletsInitial=claimCollectionMilestone({
 seasonId,collectionId:refletsId,threshold:6,cards:refletsCards,owned:ownReflets(6),claims:initial.claims
});
assert.equal(refletsInitial.ok,true,'Six Reflets cards unlock their own first fragment');
assert.deepEqual(refletsInitial.claims,{
 'marches-de-verre/origines':[6],[refletsKey]:[6]
},'Both collections retain independent one-time claim histories');
assert.equal(claimCollectionMilestone({
 seasonId,collectionId:refletsId,threshold:6,cards:refletsCards,owned:ownReflets(24),claims:refletsInitial.claims
}).ok,false,'No repeat claim of a Reflets reward');
assert.equal(claimCollectionMilestone({
 seasonId,collectionId:refletsId,threshold:24,cards:refletsCards,owned:ownReflets(23),claims:{}
}).ok,false,'The final Reflets story requires all 24 distinct cards');
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
 'No Origines story spoilers are embedded in the initial HTML');
assert.ok(!html.includes(milestonesFor(seasonId,refletsId)[0].fragment),
 'No Reflets story spoilers are embedded in the initial HTML');
assert.ok(!html.includes(milestonesFor(seasonId,auDelaId)[0].fragment),
 'Third journal story stays locked until claimed');
assert.ok(main.includes("from './collection-milestones.js?v=au-dela-journal-1'"),'Versioned third-journal metadata is imported');
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
assert.ok(html.includes('src/main.js?v='));
assert.ok(html.includes('src/codex.css?v=au-dela-pilot-49'));

// Execute the real source save loader in a VM with legacy player data.
const freshCode=main.slice(main.indexOf('const fresh='),main.indexOf('function load(){'));
const loadCode=main.slice(main.indexOf('function load(){'),main.indexOf('let state=load();'));
const legacy={coins:430,dust:125,wins:3,earned:800,opened:15,
 owned:own(12),shiny:{1:true},goalId:20,difficulty:'maitrise'};
const legacyState=runInNewContext(freshCode+loadCode+'load()',{
 SAVE:'aetherium-save-v1',CARDS,sanitizeMilestoneClaims,
 saveSession:createSaveSession(()=>({getItem:()=>JSON.stringify(legacy)}),CARDS.map(c=>c.id))
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
 saveSession:createSaveSession(()=>({getItem:()=>JSON.stringify(saved)}),CARDS.map(c=>c.id))
});
assert.deepEqual(JSON.parse(JSON.stringify(restored.collectionMilestones)),{'marches-de-verre/origines':[6]},
 'Already claimed rewards survive reload without duplication');
const mixedSave={...legacy,owned:{...own(12),...ownReflets(18)},
 collectionMilestones:{'marches-de-verre/origines':[6,12],[refletsKey]:[6,12,18]}};
const restoredMixed=runInNewContext(freshCode+loadCode+'load()',{
 SAVE:'aetherium-save-v1',CARDS:ALL_CARDS,sanitizeMilestoneClaims,
 saveSession:createSaveSession(()=>({getItem:()=>JSON.stringify(mixedSave)}),ALL_CARDS.map(c=>c.id))
});
assert.deepEqual(JSON.parse(JSON.stringify(restoredMixed.collectionMilestones)),mixedSave.collectionMilestones,
 'Combined Origines and Reflets claims survive existing-key local save reload');
assert.equal(restoredMixed.owned[25],3);
const thirdSave={...legacy,owned:{...own(12),...ownReflets(18),...ownAuDela(18)},
 collectionMilestones:{...mixedSave.collectionMilestones,[auDelaKey]:[6,12,18]}};
const restoredThird=runInNewContext(freshCode+loadCode+'load()',{
 SAVE:'aetherium-save-v1',CARDS:ALL_CARDS,sanitizeMilestoneClaims,
 saveSession:createSaveSession(()=>({getItem:()=>JSON.stringify(thirdSave)}),ALL_CARDS.map(c=>c.id))
});
assert.deepEqual(JSON.parse(JSON.stringify(restoredThird.collectionMilestones)),
 thirdSave.collectionMilestones,'Old and new collection fragments survive one save load');
assert.equal(restoredThird.owned[49],1);

// Invoke the REAL game handler. One successful click must credit and persist once.
const claimStart=main.indexOf('function claimDiscoveryFragment(');
const claimEnd=main.indexOf('function renderCollectionMilestones(',claimStart);
assert.ok(claimStart>0&&claimEnd>claimStart,'Discover the real game claim handler');
const gameState={coins:430,dust:125,earned:800,wins:3,owned:own(12),collectionMilestones:{}};
let updates=0,refreshes=0;
const notices=[];
const sandbox={
 state:gameState,activeSeason:seasonId,activeCollection:collectionId,
 CARDS:ALL_CARDS,cardsForCollection,claimCollectionMilestone,
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
const gameReflets={coins:160,dust:18,earned:540,wins:4,
 owned:{...own(8),...ownReflets(18)},collectionMilestones:{'marches-de-verre/origines':[6]}};
let refletsUpdates=0,refletsRefreshes=0;
const refletsNotifications=[];
runInNewContext(main.slice(claimStart,claimEnd)+
 'claimDiscoveryFragment(6);claimDiscoveryFragment(12);claimDiscoveryFragment(18);'+
 'claimDiscoveryFragment(18);claimDiscoveryFragment(24);',{
 state:gameReflets,activeSeason:seasonId,activeCollection:refletsId,
 CARDS:ALL_CARDS,cardsForCollection,claimCollectionMilestone,
 update(){refletsUpdates++},renderCollection(){refletsRefreshes++},
 notify(message){refletsNotifications.push(message)}
});
assert.equal(gameReflets.coins,160+30+55,'Reflets Crowns are credited once');
assert.equal(gameReflets.dust,18+20,'Reflets Shards are credited once');
assert.equal(gameReflets.earned,540+30+55,'Crown earnings remain accurate');
assert.equal(gameReflets.wins,4,'Milestones do not count as trial wins');
assert.deepEqual(JSON.parse(JSON.stringify(gameReflets.collectionMilestones)),{
 'marches-de-verre/origines':[6],[refletsKey]:[6,12,18]
},'Reflets claims never overwrite Origines claims');
assert.equal(refletsUpdates,3,'Only three successful Reflets claims save the game');
assert.equal(refletsRefreshes,3,'Only three successful claims refresh the Codex');
assert.equal(refletsNotifications.length,5,'Duplicate and locked attempts return feedback');
const thirdState={coins:140,dust:5,earned:270,wins:4,
 owned:ownAuDela(18),collectionMilestones:{...gameReflets.collectionMilestones}};
let thirdWrites=0,thirdRefreshes=0;
runInNewContext(main.slice(claimStart,claimEnd)+
 'claimDiscoveryFragment(6);claimDiscoveryFragment(12);claimDiscoveryFragment(18);'+
 'claimDiscoveryFragment(18);claimDiscoveryFragment(24);',{
 state:thirdState,activeSeason:seasonId,activeCollection:auDelaId,
 CARDS:ALL_CARDS,cardsForCollection,claimCollectionMilestone,
 update(){thirdWrites++},renderCollection(){thirdRefreshes++},notify(){}
});
assert.equal(thirdWrites,3,'Only reached third collection milestones can save');
assert.equal(thirdRefreshes,3);
assert.equal(thirdState.coins,140+30+55);
assert.equal(thirdState.dust,5+20);
assert.equal(thirdState.earned,270+30+55);
assert.deepEqual(JSON.parse(JSON.stringify(thirdState.collectionMilestones)),{
 ...gameReflets.collectionMilestones,[auDelaKey]:[6,12,18]
},'Third milestone rewards do not overwrite older claims');
const finalState={...thirdState,owned:ownAuDela(24)};
runInNewContext(main.slice(claimStart,claimEnd)+'claimDiscoveryFragment(24);', {
 state:finalState,activeSeason:seasonId,activeCollection:auDelaId,
 CARDS:ALL_CARDS,cardsForCollection,claimCollectionMilestone,
 update(){thirdWrites++},renderCollection(){thirdRefreshes++},notify(){}
});
assert.equal(finalState.coins,140+30+55+100);
assert.equal(thirdWrites,4,'The finale journal milestone pays once after card 72');
assert.ok(finalState.collectionMilestones[auDelaKey].includes(24));
assert.ok(main.includes('state=fresh()'),'Reset still clears all milestones');
console.log('AETHERIUM — Origines & Reflets: 8 fragments narratifs, récompenses uniques, anti-doublons, sauvegardes compatibles');
