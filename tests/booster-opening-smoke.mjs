import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=file=>readFileSync(file,'utf8');
const {duplicateDustReward}=await import('data:text/javascript;charset=utf-8,'+
 encodeURIComponent(read('src/duplicate-rewards.js')));
const html=read('index.html'),main=read('src/main.js');
const css=read('src/booster-packaging.css');
const picture=read('assets/boosters/origines-portal.svg');
const match=main.match(/const BOOSTER_UNSEAL_MS=(\d+);/);
assert.ok(match,'Booster scene duration is explicit and shared');
const duration=Number(match[1]);
assert.equal(duration,980);
assert.ok(html.includes('src/main.js?v='));
assert.ok(html.includes('src/booster-packaging.css?v=ouverture-183'));
assert.ok(html.includes('class="pack-seal"'));
assert.ok(html.includes('class="pack-seal-left"'));
assert.ok(html.includes('class="pack-seal-right"'));
assert.ok(html.includes('class="pack-rip"'));
assert.ok(!html.includes('derniere-etoile-thumb.webp'),
  'The wrapper does not reveal an actual collectible');
assert.ok(css.includes('aetherium-pack-rupture 980ms'));
for(const name of ['aetherium-ripped-edge','aetherium-seal-left',
 'aetherium-seal-right','aetherium-tear-trace','aetherium-seal-glyph']){
 assert.ok(css.includes('@keyframes '+name),'Foil sequence includes '+name);
}
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(css.includes('@media(max-width:420px)'));
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
assert.ok(picture.includes('</svg>')&&picture.includes('Faceted floating crystal'));
const start=main.indexOf('function openOriginesBooster(){');
const end=main.indexOf("$('#buy').addEventListener('click',openOriginesBooster);",start);
assert.ok(start>0&&end>start,'The actual purchase and reveal handler is available');
const handler=main.slice(start,end);
assert.ok(handler.includes('update(); // Persists the purchase before any animation or navigation.'));
assert.ok(handler.includes('afterBooster(BOOSTER_UNSEAL_MS,startReveal);'));
assert.ok(handler.includes('if(reducedMotion.matches)startReveal();'));
assert.ok(!handler.includes('setInterval('));
function box(){
 const classes=new Set();
 return {hidden:false,style:{width:''},textContent:'',classList:{
  add(...ids){ids.forEach(id=>classes.add(id))},
  remove(...ids){ids.forEach(id=>classes.delete(id))},
  contains:id=>classes.has(id)
 },replaceChildren(){},scrollIntoView(){}};
}
function simulate(reduced){
 const timers=[],renders=[],ui={
  title:box(),message:box(),page:box()
 };
 const pack=box(),opening=box(),grid=box(),progress=box();
 const summary=box(),actions=box(),next=box(),step=box(),fill=box();
 let saves=0,draws=0,cancels=0;
 const state={coins:300,opened:0,owned:{},shiny:{},dust:0,recentFinds:[]};
 const sandbox={
  boosterBusy:false,state,CARDS:Array.from({length:4},(_,i)=>({id:i+1,name:i===3?'Floraison Cendrée':'Carte',rarity:i===3?'rare':'common'})),
  PACK_PRICE:100,duplicateDustReward,
  drawPack(){draws++;return Array.from({length:5},(_,i)=>({id:4,shiny:i===0}))},
  update(){saves++},
  recordRecentFind(entries,id,kind){return [{id,kind},...entries].slice(0,6)},
  cancelBoosterTimers(){cancels++},
  boosterSummary:summary,boosterGrid:grid,boosterActions:actions,
  nextPullButton:next,boosterProgress:progress,boosterProgressFill:fill,
  boosterStep:step,boosterOpening:opening,boosterArt:pack,
  currentDraw:[],drawSummary:null,
  reducedMotion:{matches:reduced},mobileView:{matches:false},
  BOOSTER_UNSEAL_MS:duration,
  afterBooster(ms,callback){timers.push({ms,callback})},
  showBoosterCard(index,focus){renders.push({index,focus})},
  $:selector=>selector==='#pack-title'?ui.title:
   selector==='#pack-msg'?ui.message:
   selector==='#page-boosters'?ui.page:null
 };
 runInNewContext(handler+'openOriginesBooster()',sandbox);
 assert.equal(draws,1,'The pack contents are drawn exactly once');
 assert.equal(state.coins,200,'The price remains 100 Couronnes');
 assert.equal(state.opened,1,'Exactly one booster is counted');
 assert.equal(state.owned[4],5,'All five copies are persisted before the animation');
 assert.equal(state.shiny[4],true);
 assert.equal(state.dust,40,'Four Rare duplicates award 10 Éclats each');
 assert.equal(sandbox.drawSummary.dustEarned,40,'Booster summary uses exact rewards, not 5 per duplicate');
 assert.equal(sandbox.currentDraw[0].dustGain,0,'The first unique card grants no Éclats');
 assert.equal(sandbox.currentDraw[1].dustGain,10,'A duplicate records its rarity-based reward');
 assert.equal(state.recentFinds.length,1,'Le registre ne compte pas les doublons');
 assert.equal(state.recentFinds[0].kind,'chromatic','La première Chromatique est enregistrée');
 assert.equal(saves,1,'Purchase is saved immediately, before timers');
 assert.equal(cancels,1);
 assert.equal(sandbox.boosterBusy,true);
 assert.equal(pack.classList.contains('is-opening'),!reduced);
 assert.equal(opening.classList.contains('is-unsealing'),!reduced);
 runInNewContext(handler+'openOriginesBooster()',sandbox);
 assert.equal(draws,1,'Double click never buys twice');
 assert.equal(state.coins,200);
 if(reduced){
  assert.equal(timers.length,0,'Reduced motion must not queue animations');
  assert.deepEqual(renders,[{index:0,focus:false}]);
  assert.equal(pack.classList.contains('is-opening'),false);
 }else{
  assert.deepEqual(timers.map(item=>item.ms),[370,duration]);
  assert.equal(renders.length,0,'The first card waits for the foil sequence');
  timers[0].callback();
  assert.equal(ui.message.textContent,'Le sceau se brise…');
  assert.equal(renders.length,0,'Progress caption does not reveal early');
  timers[1].callback();
  assert.deepEqual(renders,[{index:0,focus:false}]);
  assert.equal(pack.classList.contains('is-opening'),false);
  assert.equal(opening.classList.contains('is-unsealing'),false);
 }
 assert.equal(saves,1,'Unsealing never buys or saves again');
 assert.equal(state.coins,200,'Animation does not change balance');
}
simulate(false);
simulate(true);
console.log('AETHERIUM 1.8.3 — Sceau: 2 étapes, prix unique, 5 cartes, mobile, animations réduites et sauvegarde OK');
