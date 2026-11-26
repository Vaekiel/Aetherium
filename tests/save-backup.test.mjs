import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {CARDS} from '../src/data.js';
import {
 GAME_SAVE_KEY,PREVIOUS_SAVE_KEY,BACKUP_FORMAT,MAX_BACKUP_SIZE,
 createBackup,decodeBackup,validateSaveState,
 installImportedSave,restorePreviousSave
} from '../src/save-backup.js';

const ids=CARDS.map(c=>c.id);
const gameState=()=>({
 coins:485,dust:70,owned:{1:3,7:2,22:1},shiny:{7:true,22:true},
 wins:42,earned:1580,opened:18,goalId:4,difficulty:'maitrise',
 trialStats:[{wins:4,bestScore:90,bestMode:'maitrise'}],
 trialRecords:[{maitrise:{wins:1,bestScore:95,lastScore:95,bestMetric:0}}],
 collectionMilestones:{'marches-de-verre/origines':[6]},
 recentFinds:[{id:22,kind:'chromatic'}],
 alchemyKnown:[0,2,15],titleId:2,
 expedition:{route:'verriers',step:1,mode:'maitrise',armed:true,completedRoutes:[]}
});
const storage=(source,rollback=null)=>{
 const memory=new Map([[GAME_SAVE_KEY,source]]);
 if(rollback!==null)memory.set(PREVIOUS_SAVE_KEY,rollback);
 return {
  memory,getItem(key){return memory.has(key)?memory.get(key):null},
  setItem(key,value){memory.set(key,value)},removeItem(key){memory.delete(key)}
 };
};

test('export/import preserves every current gameplay field without altering the game',async()=>{
 const original=gameState();
 const before=JSON.stringify(original);
 const now=new Date('2026-11-17T18:00:00.000Z');
 const exported=await createBackup(original,ids,webcrypto,now);
 const envelope=JSON.parse(exported);
 assert.equal(envelope.format,BACKUP_FORMAT);
 assert.equal(envelope.saveKey,GAME_SAVE_KEY);
 assert.match(envelope.checksum,/^[a-f0-9]{64}$/);
 assert.equal(JSON.stringify(original),before,'Export must not mutate live progress');
 const restored=await decodeBackup(exported,ids,webcrypto);
 assert.deepEqual(restored.state,original);
 assert.deepEqual(restored.stats,{
  cards:3,chromatic:2,crowns:485,shards:70,opened:18
 });
});

test('damaged, mismatched, oversized or foreign backups are rejected',async()=>{
 const exported=await createBackup(gameState(),ids,webcrypto);
 const invalid={...JSON.parse(exported),version:99};
 await assert.rejects(()=>decodeBackup(JSON.stringify(invalid),ids,webcrypto),/compatible/);
 const bad=JSON.parse(exported);
 bad.state.coins=999999;
 await assert.rejects(()=>decodeBackup(JSON.stringify(bad),ids,webcrypto),/altéré/);
 await assert.rejects(()=>decodeBackup('not json',ids,webcrypto),/JSON/);
 await assert.rejects(()=>decodeBackup('x'.repeat(MAX_BACKUP_SIZE+1),ids,webcrypto),/volumineux/);
});

test('inconsistent card catalog and unsafe game values cannot be imported',async()=>{
 const base=gameState();
 assert.throws(()=>validateSaveState({...base,owned:{999:1}},ids),/Carte/);
 assert.throws(()=>validateSaveState({...base,owned:{1:-1}},ids),/Carte/);
 assert.throws(()=>validateSaveState({...base,shiny:{2:true}},ids),/Chromatique/);
 assert.throws(()=>validateSaveState({...base,coins:Infinity},ids),/progression/);
 assert.throws(()=>validateSaveState({...base,secret:'unknown'},ids),/non compatible/);
 const backup=await createBackup(base,ids,webcrypto);
 await assert.rejects(()=>decodeBackup(backup,[1,2,3],webcrypto),/Carte/);
});

test('current save is captured before import and can be restored',()=>{
 const old=JSON.stringify(gameState());
 const incoming={...gameState(),coins:999,opened:99,owned:{1:1},shiny:{}};
 const mem=storage(old);
 installImportedSave(mem,incoming);
 assert.equal(mem.getItem(PREVIOUS_SAVE_KEY),old);
 assert.equal(JSON.parse(mem.getItem(GAME_SAVE_KEY)).coins,999);
 restorePreviousSave(mem);
 assert.equal(mem.getItem(GAME_SAVE_KEY),old);
 assert.equal(mem.getItem(PREVIOUS_SAVE_KEY),null);
});

test('failure to write the backup or new save leaves the existing data intact',()=>{
 const old=JSON.stringify(gameState());
 const incoming={...gameState(),coins:333};
 const mem=storage(old,'older preserved rollback');
 const oldSet=mem.setItem;
 mem.setItem=function(key,val){
  if(key===GAME_SAVE_KEY)throw Error('QuotaExceeded');
  return oldSet.call(this,key,val);
 };
 assert.throws(()=>installImportedSave(mem,incoming),/conservée/);
 assert.equal(mem.getItem(GAME_SAVE_KEY),old);
 assert.equal(mem.getItem(PREVIOUS_SAVE_KEY),'older preserved rollback');
 const blocked=storage(old);
 blocked.setItem=()=>{throw Error('QuotaExceeded')};
 assert.throws(()=>installImportedSave(blocked,incoming),/protéger/);
 assert.equal(blocked.getItem(GAME_SAVE_KEY),old);
});

test('no rollback exists until an import has occurred',()=>{
 const mem=storage(JSON.stringify(gameState()));
 assert.throws(()=>restorePreviousSave(mem),/Aucune sauvegarde/);
});

test('user-facing backup controls and legacy save key remain wired',()=>{
 assert.equal(GAME_SAVE_KEY,'aetherium-save-v1');
});

test('preview economy and backups cannot cross the normal save boundary',async()=>{
 const production=await import('../src/save-backup.js');
 const previousWindow=globalThis.window;
 try{
   globalThis.window={location:new URL('https://vaekiel.github.io/Aetherium-dev/')};
   const dev=await import('../src/save-backup.js?dev-isolation-test=1');
   assert.equal(dev.DEV_PREVIEW,true);
   assert.equal(dev.GAME_SAVE_KEY,'aetherium-dev-save-v1');
   assert.notEqual(dev.PREVIOUS_SAVE_KEY,production.PREVIOUS_SAVE_KEY);
   const live=gameState();
   const simulated={...live,coins:999999,dust:12345};
   const mem=storage(JSON.stringify(live));
   dev.installImportedSave(mem,simulated);
   assert.deepEqual(JSON.parse(mem.getItem(production.GAME_SAVE_KEY)),live);
   assert.deepEqual(JSON.parse(mem.getItem(dev.GAME_SAVE_KEY)),simulated);
   const devBackup=await dev.createBackup(simulated,ids,webcrypto);
   const prodBackup=await production.createBackup(live,ids,webcrypto);
   await assert.rejects(()=>production.decodeBackup(devBackup,ids,webcrypto),/compatible/);
   await assert.rejects(()=>dev.decodeBackup(prodBackup,ids,webcrypto),/compatible/);
   assert.deepEqual((await dev.decodeBackup(devBackup,ids,webcrypto)).state,simulated);
   assert.equal(dev.isDevelopmentPreview(new URL('https://vaekiel.github.io/Aetherium/')),false);
   assert.equal(dev.isDevelopmentPreview(new URL('http://localhost:8000/')),true);
 }finally{
   if(previousWindow===undefined)delete globalThis.window;
   else globalThis.window=previousWindow;
 }
});
