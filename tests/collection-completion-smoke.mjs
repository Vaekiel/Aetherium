import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {CARDS} from '../src/collection-data.js';
import {completionPlan,completionRecipes,filterCompletionRecipes} from '../src/collection-completion.js';
import {restoreFinishCounts} from '../src/finishes.js';
import {craftFinish,getFinishCraftCost} from '../src/finish-crafting.js';
const state={owned:{1:1,2:2,72:1},shiny:{2:true,72:true},dust:1000};
state.finishCounts=restoreFinishCounts(state.owned,state.shiny);
const before=JSON.stringify(state),origines=CARDS.slice(0,24),last=CARDS.slice(48);
const rows=completionPlan(origines,state);
assert.deepEqual(rows.map(r=>r.total),[24,24,24,24]);
assert.deepEqual(rows.map(r=>r.unique),[2,0,1,0]);
assert.deepEqual(rows.map(r=>r.recipes),[0,2,1,2]);
assert.deepEqual(rows.map(r=>r.cost),[0,getFinishCraftCost(CARDS[0],'calligraphic')+getFinishCraftCost(CARDS[1],'calligraphic'),getFinishCraftCost(CARDS[0],'chromatic'),getFinishCraftCost(CARDS[0],'holographic')+getFinishCraftCost(CARDS[1],'holographic')]);
assert.deepEqual(completionPlan(last,state).map(r=>r.total),[23,23,24,23]);
assert.deepEqual(completionPlan(last,state).map(r=>r.recipes),[0,0,0,0]);
assert.deepEqual(completionRecipes(state,CARDS[71]),[]);
assert.deepEqual(completionRecipes(state,CARDS[2]),[]);
assert.deepEqual(filterCompletionRecipes(origines,state,'chromatic').map(c=>c.id),[1]);
assert.deepEqual(filterCompletionRecipes(origines,state,'holographic').map(c=>c.id),[1,2]);
assert.equal(filterCompletionRecipes(origines,state,'all'),origines);
assert.equal(JSON.stringify(state),before);
const result=craftFinish(state,CARDS[0],'chromatic');
assert.ok(result.ok);
assert.equal(completionPlan(origines,result.state).find(r=>r.finish==='chromatic').recipes,0);
assert.deepEqual(completionPlan([],{owned:{},finishCounts:{},dust:0}).map(r=>r.total),[0,0,0,0]);
console.log('Collection completion: chapter objectives, real costs, recipes, Signature excluded, read-only and post-forge refresh OK.');

// Execute the actual filter shortcut, including resetting the other controls.
const source=readFileSync('src/main.js','utf8');
const shortcut=source.slice(source.indexOf('function showCompletionRecipes(finish){'),source.indexOf('function renderCodexSeasons(){'));
const input={value:'old search'},chip={focus(){},scrollIntoView(){}};
const groups=Object.fromEntries(['type','rarity','finish','discovery'].map(attr=>[attr,['all','other'].map(value=>({dataset:{[attr]:value},active:false,pressed:null,classList:{toggle(name,active){this.owner.active=active}},setAttribute(name,value){this.pressed=value}}))]));
for(const group of Object.values(groups))for(const control of group)control.classList.owner=control;
let renders=0;
const ctx={filterFinish:'normal',filterType:'Héros',filterRarity:'rare',discoveryFilter:'missing',missingFinish:'all',
 $:q=>q==='#search'?input:q==='#codex-completion-clear'?chip:{selector:q},
 $$:(q,root)=>{assert.ok(root.selector==='#collection-filters'||root.selector==='.codex-discovery-tabs');return groups[q.match(/data-(\w+)/)[1]]},
 renderCodexResults(){renders++}
};
runInNewContext(shortcut+"showCompletionRecipes('holographic')",ctx);
assert.equal(ctx.missingFinish,'holographic');assert.equal(renders,1);assert.equal(input.value,'');
for(const key of ['filterFinish','filterType','filterRarity','discoveryFilter'])assert.equal(ctx[key],'all');
for(const group of Object.values(groups))assert.deepEqual(group.map(c=>[c.active,c.pressed]),[[true,'true'],[false,'false']]);
console.log('Completion shortcut: compatible filter controls reset and single render OK.');
