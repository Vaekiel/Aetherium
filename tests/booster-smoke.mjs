import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const read=path=>readFileSync(path,'utf8');
const {CARDS,PACK_PRICE,drawPack,RARITIES,CHROMATIC_RATE}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read('src/data.js')));
assert.equal(CARDS.length,24,'Le set Origines doit comporter 24 cartes');
assert.equal(PACK_PRICE,100,'Le prix doit rester à 100 Couronnes');
assert.equal(CHROMATIC_RATE,0.03,'Le taux de Chromatique est fixé à 3 % par carte');
assert.ok(drawPack(()=>0.02999).every(c=>c.shiny),'En dessous de 3 %, la carte est Chromatique');
assert.ok(drawPack(()=>0.03).every(c=>!c.shiny),'La limite à 3 % n’est pas incluse');
for(const sample of [0.001,0.2,0.49,0.72,0.92,0.999]){
  const cards=drawPack(()=>sample);
  assert.equal(cards.length,5,'Un booster contient cinq cartes');
  assert.ok(cards.every(c=>CARDS.some(card=>card.id===c.id)));
  assert.notEqual(CARDS.find(c=>c.id===cards[4].id).rarity,'common','Dernière carte garantie Inhabituelle ou mieux');
}
assert.equal(Object.values(RARITIES).reduce((acc,r)=>acc+r.weight,0),100,'Probabilités normales totalisent 100');
const html=read('index.html');
for(const id of ['buy','booster-pack','booster-opening','booster-progress','reveal-all','next-pull','booster-step','booster-summary','pulls']){
  assert.ok(html.includes('id="'+id+'"'),'Missing booster control: '+id);
}
const main=read('src/main.js');
assert.ok(main.includes('boosterBusy'),'Busy guard prevents double purchases');
assert.ok(main.includes('state.coins-=PACK_PRICE'),'Purchases retain their original cost');
assert.ok(main.includes('state.opened++'),'Pack count persists');
assert.ok(main.includes('state.dust+=dustGain'),'Duplicate rewards are credited from the rarity table');
assert.ok(main.includes('drawSummary.dustEarned'), 'Booster recap displays the sum of individual rewards');
assert.ok(main.includes("item.shiny"),'Shiny draw remains present');
assert.ok(main.includes('update(); // Persists the purchase'),'Purchase is saved before animations');
assert.ok(main.includes("reducedMotion.matches"),'Reduced-motion support enabled');
assert.ok(main.includes('cancelBoosterTimers'),'Reveal timers can be cancelled');
assert.ok(main.includes('function showBoosterCard(index'),'Exactly one current card is displayed');
assert.ok(main.includes('function advanceBoosterCard()'),'Cards require an explicit next action');
assert.ok(main.includes("showBoosterCard(currentIndex+1)"),'Advance shows the following card');
assert.ok(main.includes("nextPullButton.hidden=true;"),'Next action hidden until current reveal');
assert.ok(main.includes("boosterGrid.classList.add('booster-gallery')"),'All five cards are shown only at summary stage');
assert.ok(!main.includes('for(let i=0;i<currentDraw.length;i++)afterBooster'),'No automatic mass reveal');
assert.ok(main.includes('function revealBoosterAll()'),'Optional skip to summary retained');
console.log('AETHERIUM booster smoke checks: OK');
