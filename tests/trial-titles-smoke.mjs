import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=path=>readFileSync(path,'utf8');
const load=path=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(path)));
const {TRIAL_TITLES,earnedTrialTitles,validEquippedTitle,toggleEquippedTitle}=
  await import('../src/trial-titles.js');
const {recordPersonalBest,emptyTrialRecords,sanitizedTrialRecords}=await load('src/trial-records.js');
const {recordTrialWin,trialScore,sanitizedTrialStats}=await load('src/trial-progress.js');
const {trialChallengesFor}=await load('src/trial-challenges.js');
assert.deepEqual(TRIAL_TITLES.map(t=>t.name),[
  'Gardien des Runes','Archiviste des Souvenirs','Maître des Sceaux',
  'Explorateur des Ruines','Grand Alchimiste']);
assert.deepEqual(TRIAL_TITLES.map(t=>t.id),[0,1,2,3,4]);
assert.ok(TRIAL_TITLES.every(x=>x.symbol&&x.trial));
let stats=sanitizedTrialStats([]);
let records=emptyTrialRecords();
assert.deepEqual(earnedTrialTitles(stats,records).map(t=>t.earned),[false,false,false,false,false]);
assert.equal(validEquippedTitle(0,stats,records),null,'Locked titles never equip');
assert.equal(validEquippedTitle('0',stats,records),null);
assert.equal(validEquippedTitle(5,stats,records),null);
assert.equal(toggleEquippedTitle(null,0,stats,records),null);
stats=recordTrialWin(stats,0,'maitrise',100);
assert.equal(trialChallengesFor(0,stats[0],records[0])[0].earned,true);
assert.equal(earnedTrialTitles(stats,records)[0].earned,false,'Legacy global score is not a Gold medal');
const metrics=['errors','moves','attempts','hints','errors'];
const winning=[0,10,0,2,0];
for(let id=0;id<5;id++){
 const score=id===3?80:trialScore(id,{[metrics[id]]:winning[id]});
 records=recordPersonalBest(records,id,'maitrise',score,{[metrics[id]]:winning[id]});
 const titles=earnedTrialTitles(stats,records);
 assert.equal(titles[id].earned,true,'Gold medal unlocks its exact title');
 assert.equal(trialChallengesFor(id,stats[id],records[id]).find(x=>x.id==='or').earned,true);
 assert.equal(validEquippedTitle(id,stats,records),id);
}
assert.deepEqual(earnedTrialTitles(stats,records).map(t=>t.earned),[true,true,true,true,true]);
assert.equal(toggleEquippedTitle(null,2,stats,records),2);
assert.equal(toggleEquippedTitle(2,2,stats,records),null,'Selecting favorite twice removes it');
assert.equal(toggleEquippedTitle(2,4,stats,records),4,'Only one favorite at once');
assert.equal(toggleEquippedTitle(4,-1,stats,records),4,'Invalid requests do not wipe a favorite');
const walletBefore=JSON.stringify(records);
assert.equal(earnedTrialTitles(stats,records)[1].name,'Archiviste des Souvenirs');
assert.equal(JSON.stringify(records),walletBefore,'Title lookup is read only');
// Existing saved wins remain valid, but no legacy-only title is invented.
const oldStats=recordTrialWin([],3,'maitrise',100);
assert.equal(validEquippedTitle(3,oldStats,[],),null);
const main=read('src/main.js');
const html=read('index.html');
const css=read('src/trial-titles.css');
assert.ok(main.includes("from './trial-titles.js'"));
assert.ok(main.includes('titleId:null'));
assert.ok(main.includes('if(Number.isInteger(raw.titleId)&&raw.titleId>=0&&raw.titleId<5)s.titleId=raw.titleId;'));
assert.ok(main.includes('state.titleId=validEquippedTitle(state.titleId,state.trialStats,state.trialRecords);'));
assert.ok(main.includes('renderHonorifics();'));
assert.ok(main.includes('state.titleId=next;\n      save();'));
assert.ok(html.includes('id="honorific-list"'));
assert.ok(html.includes('id="honorific-active"'));
assert.ok(html.includes('src/trial-titles.css?v=titres-1.7.3'));
assert.ok(html.includes('src/main.js?v=titres-1.7.3'));
assert.ok(css.includes('@media(max-width:590px)'));
assert.ok(css.includes('.honorific.is-equipped'));
assert.ok(css.includes(':focus-visible'));
assert.ok(css.includes('prefers-reduced-motion'));
const fresh=main.slice(main.indexOf('const fresh='),main.indexOf('function load(){'));
const loader=main.slice(main.indexOf('function load(){'),main.indexOf('let state=load();'));
const {sanitizeMilestoneClaims}=await load('src/collection-milestones.js');
const {sanitizeAlchemyKnown}=await load('src/alchemy-rituals.js');
const {CARDS}=await load('src/data.js');
function restore(raw){
 return runInNewContext(fresh+loader+'load()',{
  CARDS,SAVE:'aetherium-save-v1',sanitizeMilestoneClaims,
  sanitizeAlchemyKnown,sanitizedTrialRecords,
  localStorage:{getItem:()=>JSON.stringify(raw)}
 });
}
const legacy={coins:715,dust:50,earned:1145,wins:19,opened:7,
 owned:{1:2},shiny:{1:true},
 trialStats:[{wins:4,bestScore:100,bestMode:'maitrise'}],
 alchemyKnown:[0,12]};
const old=restore(legacy);
assert.equal(old.titleId,null);
assert.equal(old.coins,715);
assert.equal(old.dust,50);
assert.equal(old.owned[1],2);
assert.equal(old.shiny[1],true);
assert.deepEqual(Array.from(old.alchemyKnown),[0,12]);
const saved=restore({...legacy,trialRecords:records,titleId:4});
assert.equal(saved.titleId,4);
assert.equal(validEquippedTitle(saved.titleId,saved.trialStats,saved.trialRecords),4);
const corrupt=restore({...legacy,trialRecords:[],titleId:4});
assert.equal(validEquippedTitle(corrupt.titleId,corrupt.trialStats,corrupt.trialRecords),null,
 'Saved favorite is refused if its Gold medal is missing');
assert.equal(restore({...legacy,titleId:-1}).titleId,null);
// Browser-shaped interactive title selector: real handler code.
function node(tag='div',klass='',value=''){
 const all=new Set(klass.split(/\s+/).filter(Boolean));
 return {tagName:tag,className:klass,textContent:value,disabled:false,
  attrs:{},children:[],events:{},
  classList:{contains:name=>all.has(name)},
  append(...items){this.children.push(...items)},
  replaceChildren(...items){this.children=[...items]},
  setAttribute(name,val){this.attrs[name]=String(val)},
  addEventListener(event,handler){this.events[event]=handler},
  click(){if(!this.disabled)this.events.click?.()}
 };
}
const active=node('p'),list=node('div');
const renderCode=main.slice(main.indexOf('function renderHonorifics(){'),
 main.indexOf('function renderAchievements(){'));
assert.ok(renderCode.startsWith('function renderHonorifics(){'));
function exerciseUI(){
 const sandbox={
  state:{trialStats:[],trialRecords:[],titleId:null},
  earnedTrialTitles,validEquippedTitle,toggleEquippedTitle,
  $:key=>key==='#honorific-active'?active:key==='#honorific-list'?list:null,
  el:node,button(label,handler,klass){const b=node('button',klass,label);b.addEventListener('click',handler);return b},
  saves:0,alerts:[],
  save(){this.saves++},
  notify(message){this.alerts.push(message)}
 };
 const context=runInNewContext(renderCode+'({renderHonorifics})',sandbox);
 const render=context.renderHonorifics;
 render();
 assert.equal(list.children.length,5);
 assert.equal(list.children.filter(b=>!b.disabled).length,0);
 assert.equal(active.textContent,'Aucun titre équipé');
 list.children[0].click();
 assert.equal(sandbox.saves,0,'Locked title click must do nothing');
 let newRecords=emptyTrialRecords();
 newRecords=recordPersonalBest(newRecords,0,'maitrise',100,{errors:0});
 newRecords=recordPersonalBest(newRecords,4,'maitrise',100,{errors:0});
 sandbox.state.trialRecords=newRecords;
 render();
 assert.equal(list.children.filter(b=>!b.disabled).length,2);
 assert.equal(list.children[0].attrs['aria-pressed'],'false');
 list.children[0].click();
 assert.equal(sandbox.state.titleId,0);
 assert.equal(sandbox.saves,1,'Equip triggers a single save');
 assert.equal(list.children[0].attrs['aria-pressed'],'true');
 assert.equal(active.textContent,'✦ Gardien des Runes');
 list.children[4].click();
 assert.equal(sandbox.state.titleId,4);
 assert.equal(sandbox.saves,2);
 assert.equal(active.textContent,'✦ Grand Alchimiste');
 assert.equal(list.children.filter(b=>b.attrs['aria-pressed']==='true').length,1,
   'Exactly one title is visually selected');
 list.children[4].click();
 assert.equal(sandbox.state.titleId,null);
 assert.equal(sandbox.saves,3,'Unequip saves locally');
 assert.equal(active.textContent,'Aucun titre équipé');
 render();
 assert.equal(sandbox.saves,3,'Rerenders never rewrite the saved favorite');
}
exerciseUI();
console.log('AETHERIUM 1.7.3 — 5 titres: médaille d’Or, sélection, verrouillage, sauvegardes et UI OK');
