import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSaveSession,parseStoredSave} from '../src/save-session.js';
import {GAME_SAVE_KEY} from '../src/save-backup.js';

const ids=[1,2,3];
const legacy={coins:400,owned:{1:2},shiny:{1:true}};
const current={...legacy,dust:8,wins:2,earned:100,opened:1,finishCounts:{normal:{},chromatic:{1:1},holographic:{1:1},calligraphic:{}}};
function store(raw=null){
  let value=raw;
  return {getItem:()=>value,setItem:(key,next)=>{assert.equal(key,GAME_SAVE_KEY);value=next},raw:()=>value};
}
for(const raw of ['{broken','null','[]','{}',JSON.stringify({...legacy,owned:{99:1}}),JSON.stringify({...current,finishCounts:{...current.finishCounts,holographic:{1:2}}}),JSON.stringify({...legacy,futureField:true})]){
  const storage=store(raw),session=createSaveSession(()=>storage,ids);
  assert.ok(session.needsRecovery);
  assert.equal(session.raw,raw);
  assert.throws(()=>session.write(legacy),/illisible/);
  assert.equal(storage.raw(),raw,'Unreadable or unknown original is never silently overwritten');
}
assert.deepEqual(parseStoredSave(JSON.stringify(legacy),ids),legacy);
const historical={...legacy,shiny:{1:true,2:true},titleId:-1};
assert.deepEqual(parseStoredSave(JSON.stringify(historical),ids),historical,
 'Known orphan markers and stale titles do not block the historic loader');
assert.deepEqual(parseStoredSave(JSON.stringify(current),ids),current);
const fresh=store(),first=createSaveSession(()=>fresh,ids);
first.write(legacy);
const second=createSaveSession(()=>fresh,ids);
first.write(current);
assert.throws(()=>second.write(legacy),/autre onglet/);
assert.throws(()=>second.assertCurrent(),/autre onglet/);
assert.equal(fresh.raw(),JSON.stringify(current));
const reopened=createSaveSession(()=>fresh,ids);
assert.deepEqual(reopened.rawState,current);
const bad=store('broken'),recovery=createSaveSession(()=>bad,ids);
recovery.write(legacy,{replace:true});
assert.equal(bad.raw(),JSON.stringify(legacy));
assert.equal(recovery.problem,'');
const readFailure=createSaveSession(()=>{throw Error('SecurityError')},ids);
assert.throws(()=>readFailure.write(legacy),/indisponible/);
const full=store(JSON.stringify(legacy));
const quota=createSaveSession(()=>full,ids);
const set=full.setItem;
full.setItem=()=>{throw Error('QuotaExceededError')};
assert.throws(()=>quota.write(current),/indisponible/);
assert.equal(full.raw(),JSON.stringify(legacy));
full.setItem=set;
quota.write(current);
assert.equal(full.raw(),JSON.stringify(current));
const main=readFileSync('src/main.js','utf8'),html=readFileSync('index.html','utf8');
assert.ok(main.includes('saveSession.write(state)'));
assert.ok(main.includes('saveSession.rawState'));
assert.ok(main.includes('saveSession.assertCurrent();\n    installImportedSave'));
assert.ok(main.includes('saveSession.assertCurrent();\n    parseStoredSave'));
assert.ok(html.includes('id="save-warning" role="alert" hidden'));
console.log('AETHERIUM save session: corruption, legacy, exact finishes, stale tabs, quota and recovery OK.');
