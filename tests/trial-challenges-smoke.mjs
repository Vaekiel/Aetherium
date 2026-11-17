import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(file,'utf8');
const load=file=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(file)));
const {TRIAL_CHALLENGES,TRIAL_MEDAL_NAMES,trialChallengesFor,trialChallengeCount}=
  await load('src/trial-challenges.js');
const {recordPersonalBest,emptyTrialRecords}=await load('src/trial-records.js');
const {recordTrialWin,trialScore,trialReward}=await load('src/trial-progress.js');
assert.equal(TRIAL_CHALLENGES.length,5);
assert.deepEqual(TRIAL_MEDAL_NAMES,['Bronze','Argent','Or']);
const relevant=['errors','moves','attempts','hints','errors'];
const scoreFor=(index,value)=>{
 if(index===3)return 80;
 return trialScore(index,{[relevant[index]]:value});
};
for(let index=0;index<5;index++){
 const blank=trialChallengesFor(index,null,null);
 assert.deepEqual(blank.map(m=>m.earned),[false,false,false]);
 assert.deepEqual(blank.map(m=>m.name),TRIAL_MEDAL_NAMES);
 assert.equal(trialChallengeCount(index,null,null),0);
 assert.ok(blank.every(m=>m.description&&m.description.length>10));
 const legacy={wins:13,bestScore:100,bestMode:'maitrise'};
 assert.deepEqual(trialChallengesFor(index,legacy,null).map(m=>m.earned),[true,false,false],
  'Old aggregate wins grant Bronze but must not invent advanced achievements');
 assert.equal(trialChallengeCount(index,legacy,undefined),1);
 const goldLimit=TRIAL_CHALLENGES[index].gold.limit;
 const silverLimit=TRIAL_CHALLENGES[index].silver.limit;
 assert.ok(goldLimit<silverLimit,'Gold must be harder than Silver');
 let records=emptyTrialRecords();
 const aggregate={wins:0,bestScore:0,bestMode:null};
 records=recordPersonalBest(records,index,'initiation',scoreFor(index,0),{[relevant[index]]:0});
 assert.deepEqual(trialChallengesFor(index,aggregate,records[index]).map(m=>m.earned),[true,false,false],
  'Initiation cannot unlock advanced medals even with a flawless score');
 records=recordPersonalBest(records,index,'aventure',scoreFor(index,silverLimit+1),
  {[relevant[index]]:silverLimit+1});
 assert.deepEqual(trialChallengesFor(index,aggregate,records[index]).map(m=>m.earned),[true,false,false],
  'A performance above the Silver threshold must not unlock it');
 records=recordPersonalBest(records,index,'aventure',scoreFor(index,silverLimit),
  {[relevant[index]]:silverLimit});
 assert.deepEqual(trialChallengesFor(index,aggregate,records[index]).map(m=>m.earned),[true,true,false],
  'Silver unlocks precisely at the target threshold');
 records=recordPersonalBest(records,index,'maitrise',scoreFor(index,goldLimit+1),
  {[relevant[index]]:goldLimit+1});
 assert.deepEqual(trialChallengesFor(index,aggregate,records[index]).map(m=>m.earned),[true,true,false],
  'An unqualified Mastery performance cannot unlock Gold');
 records=recordPersonalBest(records,index,'maitrise',scoreFor(index,goldLimit),
  {[relevant[index]]:goldLimit});
 assert.deepEqual(trialChallengesFor(index,aggregate,records[index]).map(m=>m.earned),[true,true,true],
  'Gold can be earned in a qualifying Mastery game');
 assert.equal(trialChallengeCount(index,aggregate,records[index]),3);
 const preserved=JSON.stringify(records);
 const medal1=trialChallengesFor(index,aggregate,records[index]);
 const medal2=trialChallengesFor(index,aggregate,records[index]);
 assert.deepEqual(medal1,medal2,'Medals are deterministic on each re-render');
 assert.equal(JSON.stringify(records),preserved,'Reading medals must never mutate saves');
 const masteryOnly=emptyTrialRecords();
 const justGold=recordPersonalBest(masteryOnly,index,'maitrise',scoreFor(index,goldLimit),
  {[relevant[index]]:goldLimit});
 assert.deepEqual(trialChallengesFor(index,{wins:0},justGold[index]).map(m=>m.earned),
  [true,true,true],'A hard Gold result should also satisfy easier medal tiers');
}
assert.deepEqual(trialChallengesFor(-1,{},{}),[]);
assert.deepEqual(trialChallengesFor(5,{},{}),[]);
assert.equal(trialChallengeCount(-2,{},{}),0);
const corrupted={maitrise:{wins:0,bestScore:100,bestMetric:0},
 aventure:{wins:1,bestScore:null,bestMetric:0}};
assert.deepEqual(trialChallengesFor(0,{wins:0},corrupted).map(m=>m.earned),
 [true,false,false],'Incomplete records cannot unlock advanced medals');
const a=recordTrialWin([],0,'aventure',83);
const b=recordPersonalBest([],0,'aventure',83,{errors:1});
assert.equal(trialChallengeCount(0,a[0],b[0]),2);
assert.equal(trialReward(35,'aventure',83),35,'Medals do not alter currency or reward rules');
const main=read('src/main.js'),html=read('index.html'),css=read('src/trial-progress.css');
assert.ok(main.includes("from './trial-challenges.js'"));
assert.ok(main.includes("trialChallengesFor(index,entry,record)"));
assert.ok(main.includes("el('section','trial-challenges')"));
assert.ok(main.includes("el('div','trial-challenges-list')"));
assert.ok(main.includes("el('span','trial-challenges-summary')"));
assert.ok(main.includes("medals.filter(item=>item.earned).length"));
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
assert.ok(!main.includes('state.trialChallenges='),
 'The medals are earned from existing records, not a second save system');
assert.ok(main.includes('state.trialRecords=recordPersonalBest'));
assert.ok(main.includes('state.trialStats=recordTrialWin'));
assert.ok(css.includes('.trial-challenge.is-earned'));
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(css.includes('@media(max-width:360px)'));
assert.ok(html.includes('src/main.js?v='));
assert.ok(html.includes('src/trial-progress.css?v=defis-1.7.3'));
console.log('AETHERIUM 1.7.3 — 15 médailles: seuils, anciens scores, victoires, rétrocompatibilité et rendu OK');
