// Aetherium — actual booster purchase updates four separate finish inventories.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {restoreFinishCounts} from '../src/finishes.js';
const main=readFileSync('src/main.js','utf8');
const from=main.indexOf('function openOriginesBooster(){');
const to=main.indexOf("$('#buy').addEventListener('click',openOriginesBooster);",from);
assert.ok(from>0&&to>from);
const code=main.slice(from,to);
function box(){
 const values=new Set();
 return {style:{width:''},classList:{
  add(...a){a.forEach(x=>values.add(x))},remove(...a){a.forEach(x=>values.delete(x))},
  contains(x){return values.has(x)}
 },hidden:false,replaceChildren(){},scrollIntoView(){}};
}
const state={coins:300,dust:0,opened:0,owned:{1:2},shiny:{1:true},recentFinds:[]};
state.finishCounts=restoreFinishCounts(state.owned,state.shiny);
const draw=[
 {id:1,shiny:false,finish:'normal'},
 {id:1,shiny:true,finish:'chromatic'},
 {id:1,shiny:false,finish:'holographic'},
 {id:1,shiny:false,finish:'calligraphic'},
 {id:1,shiny:false,finish:'holographic'}
];
const pack=box(),opening=box(),grid=box(),summary=box(),actions=box();
const next=box(),progress=box(),progressFill=box(),step=box(),page=box();
let saved=0;
const sandbox={
 boosterBusy:false,state,CARDS:[{id:1,rarity:'common',name:'Veilleuse de Nacre'}],
 PACK_PRICE:100,boosterView:id=>id==='origines'?{collection:{id}}:null,
 drawCollectionPack(id){assert.equal(id,'origines');return draw},duplicateDustReward:()=>5,
 recordRecentFind:(items)=>items,
 selectedBooster:'origines',
 cancelBoosterTimers(){},boosterArt:pack,boosterOpening:opening,boosterGrid:grid,
 boosterSummary:summary,boosterActions:actions,nextPullButton:next,
 boosterProgress:progress,boosterProgressFill:progressFill,boosterStep:step,
 drawSummary:null,currentDraw:[],reducedMotion:{matches:true},mobileView:{matches:false},
 showBoosterCard(){},update(){saved++},
 $:selector=>selector==='#page-boosters'?page:box()
};
sandbox.CARD_BY_ID=new Map(sandbox.CARDS.map(c=>[c.id,c]));
runInNewContext(code+'openOriginesBooster()',sandbox);
assert.equal(state.coins,200);
assert.equal(state.opened,1);
assert.equal(state.owned[1],7);
assert.equal(state.shiny[1],true);
assert.equal(state.finishCounts.normal[1],2);
assert.equal(state.finishCounts.chromatic[1],2);
assert.equal(state.finishCounts.holographic[1],2);
assert.equal(state.finishCounts.calligraphic[1],1);
assert.equal(Object.values(state.finishCounts).reduce((n,part)=>n+(part[1]||0),0),7);
assert.equal(sandbox.drawSummary.shinyCount,1);
assert.equal(sandbox.drawSummary.holographicCount,2);
assert.equal(sandbox.drawSummary.calligraphicCount,1);
assert.equal(state.dust,25,'Rarity-based duplicates unaffected by variant finish');
assert.equal(sandbox.currentDraw[3].finish,'calligraphic');
assert.equal(saved,1,'Exactly one save before the reveal');
console.log('Booster gains: separate 4-finish inventory, Chromatique backward compatibility, price and shards unchanged.');
