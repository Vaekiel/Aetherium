import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=p=>readFileSync(p,'utf8');
const {
 DIFFICULTIES,TRIAL_COUNT,validDifficulty,trialRules,trialObjective,trialScore,trialReward,
 sanitizedTrialStats,recordTrialWin,masteryLevel
}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read('src/trial-progress.js')));
assert.deepEqual(DIFFICULTIES.map(m=>m.id),['initiation','aventure','maitrise']);
assert.equal(TRIAL_COUNT,5);
assert.equal(validDifficulty('nonsense'),'aventure');
assert.deepEqual([0,1,2].map(i=>trialRules(0,DIFFICULTIES[i].id).maxErrors),[5,3,2],'Rune failure budgets vary');
assert.deepEqual([0,1,2].map(i=>trialRules(1,DIFFICULTIES[i].id).maxMoves),[null,null,16],'Memory expert limited to 16 turns');
assert.deepEqual([0,1,2].map(i=>trialRules(2,DIFFICULTIES[i].id).maxAttempts),[5,3,2],'Lock difficulty varies');
assert.deepEqual([0,1,2].map(i=>trialRules(3,DIFFICULTIES[i].id).safeTarget),[8,10,12],'Excavation safe target varies');
assert.deepEqual([0,1,2].map(i=>trialRules(4,DIFFICULTIES[i].id).maxErrors),[5,3,2],'Alchemy errors vary');
assert.equal(trialObjective(0,'initiation'),'Activer 12 runes dans l’ordre · 5 erreurs maximum.');
assert.equal(trialObjective(0,'maitrise'),'Activer 12 runes dans l’ordre · 2 erreurs maximum.');
assert.equal(trialObjective(1,'maitrise'),'Retrouver 8 paires de tablettes · 16 coups maximum.');
assert.equal(trialObjective(2,'aventure'),'Aligner 3 cristaux sur la valeur cible · 3 essais maximum.');
assert.equal(trialObjective(3,'maitrise'),'Explorer 12 dalles sûres sur 25 en évitant 5 pièges.');
assert.equal(trialObjective(4,'initiation'),'Préparer 3 potions · 5 mélanges ratés maximum.');
assert.equal(trialScore(0,{errors:0}),100);
assert.equal(trialScore(0,{errors:3}),46);
assert.equal(trialScore(1,{moves:16}),68);
assert.equal(trialScore(2,{attempts:2}),60);
assert.equal(trialScore(3,{}),80);
assert.equal(trialScore(4,{errors:1}),80);
assert.equal(trialReward(35,'initiation',100),35,'Easy mode is not more profitable');
assert.equal(trialReward(35,'aventure',100),40,'Flawless adventure offers small bonus');
assert.equal(trialReward(35,'maitrise',100),50,'Expert gives maximum 15 bonus');
assert.equal(trialReward(65,'maitrise',80),75,'Excavation bonus is moderated');
assert.equal(sanitizedTrialStats({}).length,5);
const bad=[{wins:-7,bestScore:120,bestMode:'unlocked'},{wins:3,bestScore:80,bestMode:'aventure'}];
const clean=sanitizedTrialStats(bad);
assert.deepEqual(clean[0],{wins:0,bestScore:0,bestMode:null});
assert.deepEqual(clean[1],{wins:3,bestScore:80,bestMode:'aventure'});
const first=recordTrialWin([],0,'initiation',93);
assert.equal(first[0].wins,1);
assert.equal(first[0].bestScore,93);
const second=recordTrialWin(first,0,'maitrise',75);
assert.equal(second[0].wins,2);
assert.equal(second[0].bestScore,93);
assert.equal(second[0].bestMode,'maitrise');
assert.equal(first[0].wins,1,'Recording another victory does not mutate previous stats');
assert.equal(masteryLevel(0).title,'À découvrir');
assert.equal(masteryLevel(3).title,'Apprenti');
assert.equal(masteryLevel(8).title,'Initié');
assert.equal(masteryLevel(20).title,'Maître');

const {sanitizeMilestoneClaims}=await import('data:text/javascript;charset=utf-8,'+
 encodeURIComponent(read('src/collection-milestones.js')));
const main=read('src/main.js'),html=read('index.html'),style=read('src/trial-progress.css');
assert.ok(main.includes("from './trial-progress.js'"),'Game imports pure progression');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Legacy save key preserved');
assert.ok(main.includes('state.trialStats=recordTrialWin('),'Victory records stored');
assert.ok(main.includes("const difficultyButtons=$$('#difficulty-options [data-difficulty]');"),
  'All difficulty buttons are selected, not just the first button');
assert.ok(main.includes('g.descriptionEl.textContent=trialObjective(index,g.mode)'),
  'The displayed goal follows the chosen mode and current game');
assert.ok(main.includes('grant(earned)'),'Actual bonus reaches saved wallet');
assert.ok(main.includes('trialStarters[selectedGame]()'),'Switching mode restarts the active trial');
assert.ok(main.includes('if(mini[index].mode!==state.difficulty)'),'Switching games applies new difficulty');
for(const selector of ['difficulty-options','difficulty-hint','data-difficulty="initiation"',
 'data-difficulty="aventure"','data-difficulty="maitrise"'])
  assert.ok(html.includes(selector),'Difficulty UI contains '+selector);
assert.ok(html.includes('src/trial-progress.css?v=arcanes-1.6.0.1'),'Difficulty stylesheet versioned');
assert.ok(html.includes('src/main.js?v=seasons-1.7.1'),'Current script versioned');
assert.ok(style.includes('@media(max-width:850px)'),'Mobile difficulty controls supported');
assert.ok(style.includes('min-height:44px'),'Difficulty mode targets have mobile tap area');
const freshCode=main.slice(main.indexOf('const fresh='),main.indexOf('function load(){'));
const loadCode=main.slice(main.indexOf('function load(){'),main.indexOf('let state=load();'));
const legacy={coins:75,dust:23,wins:7,earned:890,opened:4,owned:{1:2},shiny:{1:true},goalId:2};
const loaded=runInNewContext(freshCode+loadCode+'load()',{
 localStorage:{getItem:key=>key==='aetherium-save-v1'?JSON.stringify(legacy):null},
 CARDS:await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read('src/data.js'))).then(m=>m.CARDS),
 SAVE:'aetherium-save-v1',sanitizeMilestoneClaims
});
assert.equal(loaded.coins,75);assert.equal(loaded.dust,23);
assert.equal(loaded.owned[1],2);assert.equal(loaded.shiny[1],true);
assert.equal(loaded.difficulty,'aventure','Old saves start on classic difficulty');
assert.deepEqual(Array.from(loaded.trialStats),[],'Old saves do not invent past performance');

// Exercise the actual browser-side selector wiring with DOM-shaped button objects.
// In particular, this catches querying only one element and trying to iterate it.
const makeButton=mode=>({
  dataset:{difficulty:mode},
  handlers:{},
  attributes:{},
  classList:{toggle(){}},
  setAttribute(name,value){this.attributes[name]=value;},
  addEventListener(name,handler){this.handlers[name]=handler;},
  click(){assert.equal(typeof this.handlers.click,'function');this.handlers.click();}
});
const modeButtons=DIFFICULTIES.map(mode=>makeButton(mode.id));
const pickerButtons=Array.from({length:5},()=>makeButton(null));
const mockGame=()=>({mode:'aventure',card:{classList:{toggle(){}}}});
const mockHint={textContent:''};
const browser={state:{difficulty:'aventure'},mini:Array.from({length:5},mockGame),
 selectedGame:0,DIFFICULTIES,validDifficulty,picker:{},starts:[0,0,0,0,0],
 goals:Array(5).fill(''),messages:[],saves:0,
 $:selector=>selector==='#difficulty-hint'?mockHint:null,
 $$:selector=>selector==='#difficulty-options [data-difficulty]'?modeButtons:
   selector==='.game-choice'?pickerButtons:[],
 renderTrialMastery:null,
 save(){browser.saves++;},
 notify(message){browser.messages.push(message);}
};
browser.trialStarters=browser.mini.map((_,i)=>()=>{browser.mini[i].mode=browser.state.difficulty;browser.starts[i]++;});
browser.renderTrialMastery=()=>browser.mini.forEach((item,i)=>{browser.goals[i]=trialObjective(i,item.mode);});
const uiStart=main.indexOf('function selectGame(index){');
const uiEnd=main.indexOf('function makeCard(',uiStart);
assert.ok(uiStart>0&&uiEnd>uiStart,'Extract current in-game difficulty UI');
runInNewContext(main.slice(uiStart,uiEnd),browser);
assert.equal(modeButtons.filter(button=>button.attributes['aria-pressed']==='true').length,1);
assert.equal(modeButtons[1].attributes['aria-pressed'],'true','Aventure selected by default');
modeButtons[2].click();
assert.equal(browser.state.difficulty,'maitrise','Expert button changes actual game state');
assert.equal(browser.starts[0],1,'Changing mode restarts the selected game');
assert.equal(browser.goals[0],trialObjective(0,'maitrise'),'Expert rune objective updates');
assert.equal(modeButtons[2].attributes['aria-pressed'],'true','Selected expert button updates visually');
browser.selectGame(3);
assert.equal(browser.selectedGame,3);
assert.equal(browser.starts[3],1,'Choosing another game applies selected difficulty');
assert.equal(browser.goals[3],trialObjective(3,'maitrise'),'Excavation target updates to 12');
modeButtons[0].click();
assert.equal(browser.state.difficulty,'initiation','Initiation button changes actual state');
assert.equal(browser.starts[3],2,'Initiation restarts the active excavation');
assert.equal(browser.goals[3],trialObjective(3,'initiation'),'Excavation target updates to 8');
assert.equal(browser.saves,2,'Each mode switch is saved');
assert.equal(browser.messages.length,2,'Both mode switches give user feedback');

console.log('AETHERIUM 1.6.0 — difficultés, progression, Couronnes et anciennes sauvegardes OK');
