import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {
 FINALE_ID,FINALE_PREREQUISITES,FINALE_VOWS,canStartFinale,
 emptyExpedition,sanitizeExpedition,startExpedition,chooseFinaleVow,
 armExpedition,expeditionVictory,awardFinaleCard,expeditionSummary,abandonExpedition
} from '../src/expeditions.js';
import {CARDS,AU_DELA_BOOSTER_CARDS,drawAuDelaPack} from '../src/collection-data.js';
import {getCraftCost,craftCard} from '../src/crafting.js';
import {createBackup,decodeBackup,validateSaveState} from '../src/save-backup.js';
import {trialScore,trialReward,recordTrialWin} from '../src/trial-progress.js';
import {recordPersonalBest} from '../src/trial-records.js';
import {recordRecentFind} from '../src/living-archives.js';

const read=p=>readFileSync(p,'utf8');
const legacy=emptyExpedition();
const allThree={...legacy,completedRoutes:[...FINALE_PREREQUISITES]};
assert.equal(FINALE_ID,'dernier-accord');
assert.equal(FINALE_VOWS.length,3);
assert.equal(new Set(FINALE_VOWS.map(x=>x.id)).size,3);
assert.ok(FINALE_VOWS.every(x=>x.name.length>8&&x.text.length>40&&x.ending.length>45));
assert.equal(canStartFinale(legacy),false);
assert.equal(canStartFinale({...legacy,completedRoutes:FINALE_PREREQUISITES.slice(0,2)}),false);
assert.equal(canStartFinale(allThree),true);
assert.equal(startExpedition(legacy,FINALE_ID,'aventure').route,null,
 'The finale cannot be started until all three earlier routes are completed');
assert.equal(startExpedition(allThree,FINALE_ID,'maitrise').route,null,
 'Maîtrise requires the first finale completion');
assert.equal(startExpedition(allThree,FINALE_ID,'aventure').route,FINALE_ID);
assert.equal(startExpedition(allThree,FINALE_ID,'initiation').route,FINALE_ID);
assert.equal(startExpedition(legacy,'verriers','aventure').route,'verriers',
 'Existing expeditions remain playable and unrestricted');

let current=startExpedition(allThree,FINALE_ID,'aventure');
assert.equal(expeditionSummary(current).total,4);
for(const [index,game] of [1,3,0].entries()){
 assert.equal(expeditionSummary(current).stage.game,game);
 const wrong=expeditionVictory(armExpedition(current),(game+1)%5,'aventure');
 assert.equal(wrong.advanced,false);
 const right=expeditionVictory(armExpedition(current),game,'aventure');
 assert.equal(right.advanced,true);
 assert.equal(right.finished,false);
 assert.equal(right.state.step,index+1);
 current=right.state;
}
assert.equal(current.step,3);
assert.equal(current.choice,null);
assert.equal(armExpedition(current).armed,false,
 'The last rite cannot begin until a story decision is chosen');
assert.equal(chooseFinaleVow(current,'bad').choice,null);
current=chooseFinaleVow(current,'memoires');
assert.equal(current.choice,'memoires');
assert.equal(sanitizeExpedition(JSON.parse(JSON.stringify(current))).choice,'memoires',
 'The narrative decision survives a reload between acts');
assert.equal(chooseFinaleVow(armExpedition(current),'ponts').choice,'memoires',
 'The choice is locked once the final trial starts');
const finished=expeditionVictory(armExpedition(current),4,'aventure');
assert.equal(finished.advanced,true);
assert.equal(finished.finished,true);
assert.equal(finished.state.step,4);
assert.equal(finished.state.choice,'memoires');
assert.deepEqual(finished.state.completedRoutes,[...FINALE_PREREQUISITES,FINALE_ID]);
assert.equal(expeditionVictory(finished.state,4,'aventure').advanced,false,
 'A second callback cannot complete the same act twice');
assert.deepEqual(sanitizeExpedition(JSON.parse(JSON.stringify(finished.state)),finished.state);

const rewardState={owned:{1:1,25:1},shiny:{},recentFinds:[]};
const first=awardFinaleCard(rewardState,finished);
assert.deepEqual(first,{normal:true,chromatic:false});
assert.equal(rewardState.owned[72],1);
assert.equal(rewardState.shiny[72],undefined);
assert.deepEqual(awardFinaleCard(rewardState,finished),{normal:false,chromatic:false},
 'Reprocessing a completed first victory cannot duplicate the Signature');
assert.equal(awardFinaleCard(rewardState,{...finished,advanced:false}).normal,false);
const masterStart=startExpedition(abandonExpedition(finished.state),FINALE_ID,'maitrise');
assert.equal(masterStart.route,FINALE_ID,'Mastery replay unlocks after the ordinary victory');
let master=masterStart;
for(const game of [1,3,0]){
 const result=expeditionVictory(armExpedition(master),game,'maitrise');
 assert.equal(result.advanced,true);
 master=result.state;
}
master=chooseFinaleVow(master,'passages');
const masteryVictory=expeditionVictory(armExpedition(master),4,'maitrise');
assert.equal(masteryVictory.finished,true);
assert.deepEqual(awardFinaleCard(rewardState,masteryVictory),{normal:false,chromatic:true});
assert.equal(rewardState.owned[72],1,'A Chromatic completion does not grant a duplicate copy');
assert.equal(rewardState.shiny[72],true);
assert.deepEqual(awardFinaleCard(rewardState,masteryVictory),{normal:false,chromatic:false});
assert.equal(getCraftCost(CARDS[71]),null);
assert.equal(craftCard({owned:{},dust:99999},CARDS[71]).ok,false);
assert.equal(AU_DELA_BOOSTER_CARDS.some(c=>c.id===72),false);
for(const fixed of [0,.12,.6,.999]){
 assert.ok(drawAuDelaPack(()=>fixed).every(c=>c.id!==72));
}
assert.equal(sanitizeExpedition({
 route:FINALE_ID,step:4,mode:'maitrise',choice:'ponts',
 completedRoutes:[FINALE_ID]
}).route,null,'A forged finale completion cannot survive missing route prerequisites');
assert.equal(sanitizeExpedition({
 ...masterStart,step:4,choice:null,completedRoutes:[...FINALE_PREREQUISITES,FINALE_ID]
}).route,null,'Missing final vow invalidates a forged ending');

const live=read('src/main.js');
const begin=live.indexOf('function complete(i,description,performance={}){');
const stop=live.indexOf('const runeNames=',begin);
assert.ok(begin>=0&&stop>begin);
const completeSource=live.slice(begin,stop);
const mini=Array.from({length:5},(_,i)=>({
 mode:'aventure',ended:false,reward:[35,45,50,65,60][i],
 status:{textContent:''},actions:{append(){}}
}));
const local={
 trialStats:[],trialRecords:[],expedition:armExpedition(current),
 owned:{},shiny:{},recentFinds:[],coins:100,wins:0
};
const observed={saved:0,notices:[],rendered:0};
const sandbox={
 mini,state:local,expeditionVictory,awardFinaleCard,recordRecentFind,
 trialScore,trialReward,recordTrialWin,recordPersonalBest,
 grant(n){local.coins+=n;local.wins++;observed.saved++},
 renderTrialMastery(){},renderExpedition(){observed.rendered++},
 notify(msg){observed.notices.push(msg)},
 button:(label,fn)=>({label,fn}),navigate(){}
};
runInNewContext(completeSource+"complete(4,'Le rituel est achevé',{errors:0});",sandbox);
assert.equal(local.owned[72],1,'The real mini-game completion grants the final card');
assert.equal(observed.saved,1,'Normal award and coins persist in the same update');
assert.equal(local.wins,1,'One trial win, no invented free victory');
assert.equal(local.expedition.step,4);
assert.equal(local.recentFinds[0].id,72);
assert.equal(local.recentFinds[0].kind,'new');
assert.equal(observed.rendered,1);
assert.ok(observed.notices[0].includes('Cœur des Marches'));
runInNewContext(completeSource+"complete(4,'Le rituel est achevé',{errors:0});",sandbox);
assert.equal(observed.saved,1,'A double finish never credits the card or coins twice');
const masterGame=mini[4];
masterGame.ended=false;masterGame.mode='maitrise';
local.expedition=armExpedition(master);
runInNewContext(completeSource+"complete(4,'Le rituel est achevé',{errors:0});",sandbox);
assert.equal(local.owned[72],1);
assert.equal(local.shiny[72],true);
assert.equal(local.recentFinds[0].kind,'chromatic');
assert.equal(observed.saved,2);
assert.equal(observed.notices.filter(x=>x.includes('Chromatique')).length,1);

const save={
 coins:150,dust:20,wins:7,earned:560,opened:5,
 owned:{1:2,25:1,72:1},shiny:{72:true},goalId:null,
 difficulty:'maitrise',trialStats:[],trialRecords:[],collectionMilestones:{},
 recentFinds:[{id:72,kind:'chromatic'}],alchemyKnown:[],titleId:null,
 expedition:masteryVictory.state
};
assert.equal(validateSaveState(save,CARDS.map(c=>c.id)).cards,3);
const exported=await createBackup(save,CARDS.map(c=>c.id),webcrypto);
const imported=await decodeBackup(exported,CARDS.map(c=>c.id),webcrypto);
assert.deepEqual(imported.state,save,'Portable backup restores the choice, Signature and Chromatic finish');
const old={...save,owned:{1:2},shiny:{},expedition:legacy};
assert.equal(validateSaveState(old,CARDS.map(c=>c.id)).cards,1,
 'Pre-finale saves still validate with unchanged format');

const css=read('src/expedition-finale.css'),html=read('index.html');
assert.ok(html.includes('expedition-finale.css?v=dernier-accord-1'));
assert.ok(html.includes('final=dernier-accord-1'));
assert.ok(css.includes('expedition-final-vows')&&css.includes('expedition-finale-reward'));
assert.ok(css.includes('@media(max-width:720px)'));
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(live.includes('chooseFinaleVow(state.expedition,vow.id)'));
assert.ok(live.includes('awardFinaleCard(state,expeditionResult)'));
assert.ok(live.includes("const isMasteryReprise=routeId===FINALE_ID&&!isNewFinale&&!state.shiny?.[72];"));
console.log('AETHERIUM Le Dernier Accord — 4 actes, 3 prérequis, choix sauvegardé, Signature et Chromatique uniques, ancien format de sauvegarde préservé.');
