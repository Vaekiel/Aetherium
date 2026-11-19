// Aetherium: four collectible finishes with exact quantities and legacy migration.
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {CHROMATIC_RATE,HOLOGRAPHIC_RATE,CALLIGRAPHIC_RATE,rollFinish,drawPack,CARDS} from '../src/data.js';
import {FINISHES,FINISH_KEYS,restoreFinishCounts,finishQuantity,finishUnique,finishTotal,preferredFinish,synchronizeFinishCounts} from '../src/finishes.js';
import {createBackup,decodeBackup,validateSaveState} from '../src/save-backup.js';

assert.deepEqual(FINISH_KEYS,['normal','chromatic','holographic','calligraphic']);
assert.equal(FINISHES.calligraphic.label,'Calligraphique');
assert.equal(CHROMATIC_RATE,.03,'Existing 3% Chromatique rate must remain unchanged');
assert.equal(HOLOGRAPHIC_RATE,.02);
assert.equal(CALLIGRAPHIC_RATE,.02);
assert.equal(rollFinish(()=>.02999),'chromatic');
assert.equal(rollFinish(()=>.03),'holographic');
assert.equal(rollFinish(()=>.04999),'holographic');
assert.equal(rollFinish(()=>.05),'calligraphic');
assert.equal(rollFinish(()=>.06999),'calligraphic');
assert.equal(rollFinish(()=>.07),'normal');
for(const [roll,finish] of [[.019,'chromatic'],[.04,'holographic'],[.06,'calligraphic'],[.3,'normal']]){
 const cards=drawPack(()=>roll);
 assert.equal(cards.length,5);
 assert.ok(cards.every(c=>c.finish===finish));
 assert.ok(cards.every(c=>c.shiny===(finish==='chromatic')),'Chromatic legacy flag mirrors finish');
}
const oldOwned={1:3,2:1,23:4};
const oldShiny={1:true,23:true};
const restored=restoreFinishCounts(oldOwned,oldShiny);
assert.equal(finishQuantity(restored,'normal',1),2,'Old 3 copies: 2 normal');
assert.equal(finishQuantity(restored,'chromatic',1),1,'One Chromatique recovered from historical flag');
assert.equal(finishQuantity(restored,'normal',2),1);
assert.equal(finishQuantity(restored,'chromatic',23),1);
assert.equal(finishQuantity(restored,'normal',23),3);
assert.equal(finishTotal(restored,'normal'),6);
assert.equal(finishUnique(restored,'normal'),3);
const onlyChrom=restoreFinishCounts({1:1},{1:true});
assert.deepEqual(onlyChrom.normal,{},'Do not persist zero-valued finish quantities');
const state={coins:300,dust:55,wins:1,earned:900,opened:4,
 owned:{1:5,2:1,23:4},shiny:{1:true,23:true},finishCounts:restored};
synchronizeFinishCounts(state);
assert.equal(finishQuantity(state.finishCounts,'normal',1),4,
 'Forge/quest adds a normal copy but retains its historical Chromatique');
assert.equal(finishQuantity(state.finishCounts,'chromatic',1),1);
state.finishCounts.holographic[1]=1;
state.finishCounts.normal[1]=3;
state.finishCounts.calligraphic[23]=2;
state.finishCounts.normal[23]=1;
synchronizeFinishCounts(state);
assert.equal(finishQuantity(state.finishCounts,'holographic',1),1);
assert.equal(finishQuantity(state.finishCounts,'calligraphic',23),2);
assert.equal(finishQuantity(state.finishCounts,'chromatic',23),1);
assert.equal(preferredFinish(state.finishCounts,23),'calligraphic');
assert.equal(finishTotal(state.finishCounts,'holographic'),1);
assert.equal(finishUnique(state.finishCounts,'calligraphic'),1);
assert.doesNotThrow(()=>validateSaveState(state,CARDS.map(c=>c.id)));
const json=await createBackup(state,CARDS.map(c=>c.id),webcrypto);
const imported=await decodeBackup(json,CARDS.map(c=>c.id),webcrypto);
assert.deepEqual(imported.state.finishCounts,state.finishCounts,'Exact quantities must survive portable export/import');
assert.equal(imported.state.owned[1],5,'Original owned totals persist');
assert.equal(imported.state.shiny[1],true,'Chromatic legacy flags persist');
assert.throws(()=>validateSaveState({...state,finishCounts:{
 ...state.finishCounts,holographic:{1:8}}},CARDS.map(c=>c.id)),/Quantité de finitions/);
const html=readFileSync('index.html','utf8');
const main=readFileSync('src/main.js','utf8');
const css=readFileSync('src/finishes.css','utf8');
for(const finish of FINISH_KEYS){
 assert.ok(html.includes('data-finish="'+finish+'"'),'Filter missing '+finish);
 assert.ok(html.includes('id="codex-'+finish+'-count"')||finish==='chromatic',
   'Desktop inventory count missing '+finish);
 assert.ok(html.includes('id="codex-progress-'+finish+'"'),'Chapter progress missing '+finish);
 assert.ok(main.includes('state.finishCounts'),'Runtime must persist new per-finish inventory');
}
assert.match(main,/finishInventory\[card\.id\]=\(finishInventory\[card\.id\]\|\|0\)\+1/,
  'Each booster copy increments only its own finish bucket');
assert.match(main,/finishCounts:state\.finishCounts/,'Codex filters must use exact finish quantities');
assert.match(main,/const picker=el\('div','finish-picker'\)/,'Inspector has four finish choices');
assert.match(main,/enableHolographicInspection\(artwork\)/,'Holographic inspector supports pointer and optional gyro');
assert.match(css,/grayscale\(1\) contrast\(1\.62\)/,'Calligraphic ink artwork is visibly monochrome');
assert.match(css,/inspector-art-shell\.is-holographic::after/,'Holographic cards have interactive prism overlay');
assert.match(html,/src\/finishes\.css\?v=finishes-2/,'New finishes stylesheet is loaded');
console.log('AETHERIUM 4 finishes: exact rolls, old saves, own counts, preview filters, portable backups and art CSS OK.');
