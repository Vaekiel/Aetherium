import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=path=>readFileSync(path,'utf8');
const loaded=await import('data:text/javascript;charset=utf-8,'+
 encodeURIComponent(read('src/trial-records.js')));
const {TRIAL_RECORD_MODES,TRIAL_RECORD_METRICS,emptyTrialRecords,
 sanitizedTrialRecords,recordPersonalBest,recordMetricLabel}=loaded;
const {trialScore,trialReward,recordTrialWin,sanitizedTrialStats,masteryLevel,
 trialObjective,DIFFICULTIES}=await import('data:text/javascript;charset=utf-8,'+
 encodeURIComponent(read('src/trial-progress.js')));
const {trialChallengesFor}=await import('data:text/javascript;charset=utf-8,'+
 encodeURIComponent(read('src/trial-challenges.js')));
assert.deepEqual(TRIAL_RECORD_MODES,['initiation','aventure','maitrise']);
assert.deepEqual(TRIAL_RECORD_METRICS.map(x=>x.key),
 ['errors','moves','attempts','hints','errors']);
assert.equal(emptyTrialRecords().length,5);
const empty=sanitizedTrialRecords(null);
assert.equal(empty[0].initiation.bestScore,null);
assert.equal(empty[0].initiation.bestMetric,null);
assert.equal(empty[0].initiation.wins,0);
assert.equal(empty[4].maitrise.bestScore,null);
const invalid=sanitizedTrialRecords([
 {initiation:{wins:1,bestScore:101,lastScore:50,bestMetric:2},
  aventure:{wins:-1,bestScore:80,lastScore:80},
  maitrise:{wins:2,bestScore:90,lastScore:70,bestMetric:-3}},
 {initiation:{wins:1,bestScore:95,lastScore:80,bestMetric:12}},
 ...Array(4).fill(null)
]);
assert.equal(invalid[0].initiation.wins,0);
assert.equal(invalid[0].aventure.wins,0);
assert.equal(invalid[0].maitrise.bestMetric,null);
assert.equal(invalid[1].initiation.bestMetric,12);
assert.equal(recordMetricLabel(0,0),'0 erreur');
assert.equal(recordMetricLabel(0,2),'2 erreurs');
assert.equal(recordMetricLabel(3,1),'1 sonde');
assert.equal(recordMetricLabel(2,null),'—');
let records=emptyTrialRecords();
let initial=records;
records=recordPersonalBest(records,0,'initiation',71,{errors:1});
assert.equal(initial[0].initiation.wins,0,'Old snapshot is never mutated');
assert.equal(records[0].initiation.wins,1);
assert.equal(records[0].initiation.bestScore,71);
assert.equal(records[0].initiation.bestMetric,1);
records=recordPersonalBest(records,0,'initiation',100,{errors:0});
assert.equal(records[0].initiation.wins,2);
assert.equal(records[0].initiation.bestScore,100);
assert.equal(records[0].initiation.bestMetric,0);
records=recordPersonalBest(records,0,'initiation',45,{errors:3});
assert.equal(records[0].initiation.bestScore,100,'Record cannot be reduced by a later success');
assert.equal(records[0].initiation.lastScore,45,'Latest success is recorded');
assert.equal(records[0].initiation.bestMetric,0,'Best metric cannot get worse');
records=recordPersonalBest(records,0,'maitrise',85,{errors:1});
assert.equal(records[0].maitrise.wins,1);
assert.equal(records[0].initiation.wins,3,'Different modes never overwrite one another');
assert.equal(records[0].aventure.wins,0);
records=recordPersonalBest(records,1,'maitrise',68,{moves:16});
records=recordPersonalBest(records,1,'maitrise',80,{moves:13});
assert.equal(records[1].maitrise.bestMetric,13,'Memory best counts fewest moves');
records=recordPersonalBest(records,2,'aventure',80,{attempts:1});
assert.equal(records[2].aventure.bestMetric,1,'Lock counts failed attempts');
records=recordPersonalBest(records,3,'maitrise',80,{hints:3});
records=recordPersonalBest(records,3,'maitrise',80,{hints:0});
assert.equal(records[3].maitrise.bestMetric,0,'Excavation records self-sufficient play');
records=recordPersonalBest(records,4,'maitrise',60,{errors:2});
assert.equal(records[4].maitrise.bestMetric,2,'Alchemy records mixing mistakes');
const saved=JSON.parse(JSON.stringify(records));
assert.deepEqual(sanitizedTrialRecords(saved),records,'Records round-trip in local JSON');
for(const [i,mode,score,perf] of [
 [-1,'aventure',100,{}],[9,'aventure',100,{}],[0,'invalid',100,{}],[0,'aventure',Number.NaN,{}]
]){
 const before=JSON.stringify(records);
 records=recordPersonalBest(records,i,mode,score,perf);
 assert.equal(JSON.stringify(records),before,'Invalid input cannot affect saved results');
}
const main=read('src/main.js');
assert.ok(main.includes("from './trial-records.js'"));
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
assert.ok(main.includes('trialRecords:[]'));
assert.ok(main.includes('s.trialRecords=sanitizedTrialRecords(raw.trialRecords)'));
assert.ok(main.includes('state.trialRecords=recordPersonalBest(state.trialRecords,i,g.mode,score,performance)'));
assert.ok(main.includes('state.trialStats=recordTrialWin(state.trialStats,i,g.mode,score)'));
assert.ok(main.includes("el('details','trial-records')"));
assert.ok(main.includes('recordMetricLabel(index,best.bestMetric)'));
assert.ok(main.includes("['Mode','Victoires','Score',TRIAL_RECORD_METRICS[i].label]"),
 'The final column names the concrete skill instead of generic Performance');
assert.ok(main.includes("el('span','trial-records-heading','Records')"),
 'The record heading is concise');
assert.ok(!main.includes('Suivi détaillé depuis la version'),
 'Redundant release notes are not displayed in every game');
assert.ok(!main.includes('première victoire à découvrir'),
 'The empty record label stays compact');
assert.ok(!main.includes("' · record '+entry.bestScore"),
 'The global record is not shown twice beside the detailed book');
assert.ok(main.includes('const body=$(\'tbody\',g.recordsEl)'));
assert.ok(main.includes("complete(3,'Fouille accomplie ! '+safeTarget+' dalles sûres ont été explorées.',{hints:sondes})"));
const freshCode=main.slice(main.indexOf('const fresh='),main.indexOf('function load(){'));
const loadCode=main.slice(main.indexOf('function load(){'),main.indexOf('let state=load();'));
const legacy={coins:435,dust:45,wins:7,earned:1050,opened:6,owned:{1:2},
 shiny:{1:true},difficulty:'maitrise',alchemyKnown:[0,1,12],
 trialStats:[{wins:11,bestScore:96,bestMode:'maitrise'}]};
const {sanitizeMilestoneClaims}=await import('data:text/javascript;charset=utf-8,'+
 encodeURIComponent(read('src/collection-milestones.js')));
const {sanitizeAlchemyKnown}=await import('data:text/javascript;charset=utf-8,'+
 encodeURIComponent(read('src/alchemy-rituals.js')));
const {CARDS}=await import('data:text/javascript;charset=utf-8,'+
 encodeURIComponent(read('src/data.js')));
function restore(save){
 const sandbox={SAVE:'aetherium-save-v1',CARDS,sanitizeMilestoneClaims,sanitizeAlchemyKnown,
  sanitizedTrialRecords,localStorage:{getItem:()=>JSON.stringify(save)}};
 return runInNewContext(freshCode+loadCode+'load()',sandbox);
}
const migrated=restore(legacy);
assert.equal(migrated.coins,435);
assert.equal(migrated.dust,45);
assert.equal(migrated.owned[1],2);
assert.equal(migrated.shiny[1],true);
assert.equal(migrated.trialStats[0].wins,11,'Eleven old wins survive');
assert.equal(migrated.trialStats[0].bestScore,96,'Legacy global best survives');
assert.deepEqual(Array.from(migrated.alchemyKnown),[0,1,12]);
assert.deepEqual(Array.from(migrated.trialRecords),[],'No mode-specific results invented');
const recovered=restore({...legacy,trialRecords:saved});
assert.equal(recovered.trialRecords[0].initiation.bestScore,100);
assert.equal(recovered.trialRecords[1].maitrise.bestMetric,13);
assert.equal(recovered.trialStats[0].wins,11,'Legacy and detailed records coexist');

const code=main.slice(main.indexOf('function complete(i,description,performance={}){'),
 main.indexOf('const runeNames=',main.indexOf('function complete(i,description,performance={}){')));
assert.ok(code.includes('grant(earned)'));
function exerciseComplete(){
 const g={mode:'maitrise',reward:45,ended:false,status:{textContent:''}};
 const state={trialStats:[],trialRecords:[]};
 let money=0,notifications=0;
 const browser={mini:[null,g],state,trialScore,trialReward,
  recordTrialWin,recordPersonalBest,
  grant(value){money+=value;notifications++},
  renderTrialMastery(){}};
 runInNewContext(code+'complete(1,\'Mémoire restaurée\',{moves:12,errors:0});',browser);
 assert.equal(state.trialStats[1].wins,1);
 assert.equal(state.trialRecords[1].maitrise.wins,1);
 assert.equal(state.trialRecords[1].maitrise.bestMetric,12);
 assert.equal(state.trialRecords[1].maitrise.bestScore,84);
 assert.equal(money,trialReward(45,'maitrise',84));
 assert.equal(notifications,1);
 assert.ok(g.status.textContent.includes('84/100'));
 runInNewContext('complete(1,\'Encore\',{moves:8});',browser);
 assert.equal(money,trialReward(45,'maitrise',84),'Completed trial cannot credit twice');
 assert.equal(state.trialStats[1].wins,1);
 assert.equal(state.trialRecords[1].maitrise.wins,1);
}
exerciseComplete();
const css=read('src/trial-progress.css'),html=read('index.html');
assert.ok(css.includes('.trial-records-summary'));
assert.ok(css.includes('.trial-records-table'));
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(html.includes('src/trial-progress.css?v=defis-1.7.3'));
assert.ok(html.includes('src/main.js?v=seuil-1.8.0'));
// Render the actual responsive record UI using a minimal, DOM-shaped tree.
const renderCode=main.slice(main.indexOf('function renderTrialMastery(){'),
 main.indexOf('function complete(i,description,performance={}){'));
assert.ok(renderCode.startsWith('function renderTrialMastery(){'));
function dom(tag='',cls='',value=''){
 const classes=new Set(cls.split(' ').filter(Boolean));
 const n={tagName:tag,textContent:value,children:[],attrs:{},dataset:{},
  classList:{contains:token=>classes.has(token)},
  append(...items){n.children.push(...items)},
  replaceChildren(...items){n.children=[...items]},
  setAttribute(key,val){n.attrs[key]=String(val)},
  querySelector(selector){
   const key=selector.slice(0,1)==='.'?selector.slice(1):selector;
   const find=parent=>{for(const child of parent.children){
    if(child.tagName===key||child.classList.contains(key))return child;
    const result=find(child);if(result)return result;
   }return null};return find(n);
  }
 };
 return n;
}
const definitions=['Chemin runique','Mémoire ancienne','Serrure d’Éther',
 'Fouilles interdites','Laboratoire arcanique'].map(name=>({name}));
const mini=Array.from({length:5},(_,index)=>{
 const recordsEl=dom('details','trial-records'),summary=dom('summary','trial-records-summary');
 summary.append(dom('span','trial-records-current'),dom('span','trial-challenges-summary'));
 recordsEl.append(summary,dom('tbody'),dom('div','trial-challenges-list'));
 return {mode:index===0?'initiation':'aventure',reward:[35,45,50,65,60][index],
  descriptionEl:{textContent:''},rewardEl:{textContent:'',title:''},
  masteryEl:{textContent:'',attrs:{},setAttribute(name,value){this.attrs[name]=value}},
  recordsEl};
});
const uiCtx={mini,definitions,state:{trialStats:[
 {wins:11,bestScore:100,bestMode:'maitrise'}],trialRecords:records},
  sanitizedTrialStats,sanitizedTrialRecords,masteryLevel,
  TRIAL_RECORD_MODES,TRIAL_RECORD_METRICS,recordMetricLabel,trialChallengesFor,
  DIFFICULTIES,trialObjective,trialReward,
  $:(selector,root)=>root.querySelector(selector),el:dom};
runInNewContext(renderCode+'renderTrialMastery()',uiCtx);
const firstRecords=mini[0].recordsEl.querySelector('tbody');
assert.equal(firstRecords.children.length,3,'Each game renders one row per difficulty');
assert.equal(mini[0].recordsEl.querySelector('.trial-challenges-summary').textContent,'✦ 2/3',
 'Old aggregate wins secure Bronze, while the qualifying Mastery record secures Silver');
const firstChallenges=mini[0].recordsEl.querySelector('.trial-challenges-list');
assert.equal(firstChallenges.children.length,3,'Every records panel renders the three medals');
assert.equal(firstChallenges.children[0].children[1].textContent,'Bronze');
assert.equal(firstChallenges.children[0].classList.contains('is-earned'),true);
assert.equal(firstChallenges.children[1].classList.contains('is-earned'),true);
assert.equal(firstChallenges.children[2].classList.contains('is-earned'),false);
assert.equal(mini[2].recordsEl.querySelector('.trial-challenges-summary').textContent,'✦ 2/3',
 'An Aventure challenge may award the Silver tier');
assert.equal(mini[3].recordsEl.querySelector('.trial-challenges-summary').textContent,'✦ 3/3',
 'Qualifying Mastery excavation grants all three medals');
assert.equal(mini[3].recordsEl.querySelector('.trial-challenges-list').children[2].dataset.grade,'or');
assert.equal(firstRecords.children[0].children[2].textContent,'100/100');
assert.equal(firstRecords.children[0].children[3].textContent,'0 erreur');
assert.equal(firstRecords.children[2].children[2].textContent,'85/100');
assert.equal(mini[0].recordsEl.querySelector('.trial-records-current').textContent,'100/100',
 'Current best is displayed without a redundant mode name');
assert.ok(mini[0].masteryEl.textContent.includes('11 victoires'),
 'Legacy aggregate mastery remains visible alongside the new mode records');
assert.equal(mini[1].recordsEl.querySelector('tbody').children[2].children[3].textContent,'13 coups');
assert.equal(mini[3].recordsEl.querySelector('tbody').children[2].children[3].textContent,'0 sonde');
assert.equal(mini[4].recordsEl.querySelector('tbody').children[2].children[3].textContent,'2 mélanges ratés');
mini[0].mode='maitrise';
runInNewContext('renderTrialMastery()',uiCtx);
assert.equal(mini[0].recordsEl.querySelector('.trial-records-current').textContent,'85/100',
 'Changing difficulty updates the visible current record without touching the save');
console.log('AETHERIUM 1.7.3 — Carnet : UI réel, modes séparés, ancienne sauvegarde et victoires protégées OK');
