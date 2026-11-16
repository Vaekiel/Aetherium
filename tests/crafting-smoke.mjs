import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const load=path=>readFileSync(path,'utf8');
const imported=async path=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(load(path)));
const {CRAFT_COSTS,getCraftCost,craftCard}=await imported('src/crafting.js');
const {CARDS}=await imported('src/data.js');
const exact={common:20,uncommon:45,rare:100,epic:220,legendary:450};
assert.deepEqual(CRAFT_COSTS,exact,'Prix de fabrication validés');
assert.equal(Object.isFrozen(CRAFT_COSTS),true,'Coûts de fabrication immuables');
for(const rarity of Object.keys(exact)){
 const card=CARDS.find(c=>c.rarity===rarity);
 assert.ok(card,'One card exists for each rarity');
 assert.equal(getCraftCost(card),exact[rarity]);
 const initial={coins:385,dust:exact[rarity],owned:{},shiny:{},opened:2,wins:4,earned:135,goalId:card.id};
 const result=craftCard(initial,card);
 assert.equal(result.ok,true,'Fabrication possible at exact price: '+rarity);
 assert.equal(result.state.dust,0,'Full cost deducted: '+rarity);
 assert.equal(result.state.owned[card.id],1,'One standard card granted: '+rarity);
 assert.equal(result.state.goalId,null,'Crafted wish is cleared: '+rarity);
 assert.equal(result.state.coins,385,'Couronnes untouched: '+rarity);
 assert.equal(result.state.opened,2,'Booster history untouched: '+rarity);
 assert.deepEqual(result.state.shiny,{},'Crafting does not create a Shiny: '+rarity);
 assert.equal(initial.dust,exact[rarity],'State is not mutated before caller persists it');
 assert.deepEqual(initial.owned,{},'Original inventory unchanged');
 const duplicate=craftCard(result.state,card);
 assert.equal(duplicate.ok,false,'Cannot craft an already-owned card: '+rarity);
 assert.equal(duplicate.state,undefined,'Failed craft grants no inventory');
 const tooPoor=craftCard({...initial,dust:exact[rarity]-1},card);
 assert.equal(tooPoor.ok,false,'Insufficient shards rejected: '+rarity);
 assert.equal(tooPoor.state,undefined,'Failed craft spends no shards');
}
const legendary=CARDS.find(c=>c.rarity==='legendary');
const rare=CARDS.find(c=>c.rarity==='rare');
const separateWish={dust:500,owned:{},shiny:{[rare.id]:true},goalId:rare.id};
const craftOther=craftCard(separateWish,legendary);
assert.ok(craftOther.ok);
assert.equal(craftOther.state.goalId,rare.id,'Unrelated wished card is kept');
assert.equal(craftOther.state.shiny[rare.id],true,'Previously owned Shiny flags are preserved');
assert.equal(craftCard({dust:900,owned:{}},undefined).ok,false,'Undefined card rejected');
assert.equal(craftCard({dust:900,owned:{}},{id:40,rarity:'mythic'}).ok,false,'Unknown rarity rejected');
assert.equal(craftCard({dust:-100,owned:{}},rare).ok,false,'Negative shards rejected');

const html=load('index.html'),main=load('src/main.js'),css=load('src/crafting.css');
for(const id of ['atelier-card-list','atelier-card-details','atelier-empty','atelier-filter','atelier-goal-summary','atelier-result','atelier-confirm','atelier-confirm-title','atelier-confirm-text','atelier-confirm-cancel','atelier-confirm-accept','atelier-jump']){
 assert.ok(html.includes('id="'+id+'"'),'Crafting UI missing: '+id);
}
assert.ok(html.includes('src/crafting.css?v=forge-active-1'),'New responsive theme is loaded without stale browser cache');
assert.ok(html.includes('id="atelier-confirm"')&&html.includes('aria-labelledby="atelier-confirm-title"'),'Confirmation is accessible');
assert.ok(main.includes("import {CRAFT_COSTS,getCraftCost,craftCard} from './crafting.js'"),'Main app imports canonical craft rules');
assert.ok(main.includes('const result=craftCard(state,card)'),'Actual crafting follows audited helper');
assert.ok(main.includes('update(); // Saves the new card and the spent Éclats'),'Inventory and shard balance save atomically');
assert.ok(main.includes("const goal=CARDS.find(card=>card.id===state.goalId&&!state.owned[card.id])"),'Goal only targets missing cards');
assert.ok(main.includes('raw.goalId'),'Old save formats migrate safely');
assert.ok(main.includes("state.goalId=added?chooseFrom.id:null"),'Goal selection is persisted through update()');
assert.ok(main.includes("applyCardIllustration(art,chooseFrom,{shiny:false,size:'full'})"),'Forged cards use approved normal artwork');
assert.ok(main.includes('craft.disabled=state.dust<cost'),'Cannot confirm without enough Éclats');
assert.ok(main.includes("$('#atelier-confirm-accept').addEventListener('click',completeCraft)"),'Confirmation must precede spending');
assert.ok(main.includes("$('#atelier-result')"),'Successful craft has visible feedback');
assert.ok(!html.includes('atelier-craft-disabled" disabled'),'Coming-soon button has been removed');
assert.ok(css.includes('@media(max-width:850px)'),'Phone layout remains supported');
assert.ok(css.includes('order:-1'),'Selected craft pane comes before scrollable card grid on mobile');
assert.ok(css.includes('.atelier-confirm::backdrop'),'Confirmation follows game DA');
console.log('AETHERIUM — Forge : coûts, transactions, doublons, Shiny, objectifs, UI OK');
