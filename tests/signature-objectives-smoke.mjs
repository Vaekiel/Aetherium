import assert from 'node:assert/strict';
import {CARDS} from '../src/collection-data.js';
import {FINISH_KEYS,restoreFinishCounts,synchronizeFinishCounts} from '../src/finishes.js';
import {finishObjective} from '../src/finish-objectives.js';
import {awardFinaleCard,FINALE_ID,FINALE_PREREQUISITES} from '../src/expeditions.js';
import {codexProgress} from '../src/codex.js';

const standard=CARDS.filter(c=>!c.signature);
const owned=Object.fromEntries(standard.map(c=>[c.id,4]));
const shiny=Object.fromEntries(standard.map(c=>[c.id,true]));
const counts=Object.fromEntries(FINISH_KEYS.map(f=>[f,Object.fromEntries(standard.map(c=>[c.id,1]))]));
const state={owned,shiny,finishCounts:counts};
for(const f of FINISH_KEYS){
 const progress=finishObjective(CARDS,counts,f);
 assert.equal(progress.total,f==='chromatic'?72:71);
 assert.equal(progress.unique,71);
 assert.equal(progress.percent,f==='chromatic'?100*71/72:100);
}
const result=mode=>({advanced:true,finished:true,state:{route:FINALE_ID,mode,completedRoutes:[...FINALE_PREREQUISITES,FINALE_ID]}});
assert.deepEqual(awardFinaleCard(state,result('aventure')),{normal:true,chromatic:false});
synchronizeFinishCounts(state);
assert.equal(state.finishCounts.normal[72],1);
assert.deepEqual(finishObjective(CARDS,state.finishCounts,'normal'),{total:71,unique:71,copies:71,percent:100});
assert.equal(codexProgress(CARDS,state.owned,state.shiny).discovered,72);
assert.deepEqual(awardFinaleCard(state,result('maitrise')),{normal:false,chromatic:true});
synchronizeFinishCounts(state);
assert.equal(state.finishCounts.normal[72],undefined);
assert.equal(state.finishCounts.chromatic[72],1);
assert.equal(state.owned[72],1);
for(const f of FINISH_KEYS){
 const progress=finishObjective(CARDS,state.finishCounts,f);
 assert.equal(progress.percent,100,'All attainable objectives complete');
 assert.equal(progress.unique,progress.total);
}
assert.deepEqual(finishObjective([],counts,'normal'),{total:0,unique:0,copies:0,percent:0});
assert.equal(finishObjective(CARDS.slice(0,24),counts,'holographic').total,24);
const legacy=restoreFinishCounts({72:1},{72:true});
assert.equal(finishObjective(CARDS,legacy,'chromatic').unique,1);
assert.equal(finishObjective(CARDS,legacy,'normal').unique,0);
const before=JSON.stringify(state);
finishObjective(CARDS,state.finishCounts,'normal');
assert.equal(JSON.stringify(state),before,'Progress is read-only');
console.log('Signature objectives: 71/72 targets, normal-to-chromatic evolution, complete collection, legacy save, future empty season OK.');
