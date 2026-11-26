// Real Chromium responsive coverage for the five Épreuves.
// Run after booster-browser-smoke.mjs while the CI HTTP server and Chrome are alive.
import assert from 'node:assert/strict';

if(process.env.AETHERIUM_BROWSER_TEST!=='1'){
  console.log('Épreuves : contrôle visuel navigateur réservé à Chromium');
  process.exit(0);
}

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function debuggerEndpoint(){
  for(let attempt=0;attempt<50;attempt++){
    try{
      const response=await fetch('http://127.0.0.1:9222/json/list');
      const targets=await response.json();
      const page=targets.find(target=>target.type==='page'&&target.url.includes('127.0.0.1:8765'));
      if(page)return page.webSocketDebuggerUrl;
    }catch{}
    await sleep(200);
  }
  throw Error('La page Chromium est inaccessible');
}
const ws=new WebSocket(await debuggerEndpoint());
await new Promise((resolve,reject)=>{
  ws.addEventListener('open',resolve,{once:true});
  ws.addEventListener('error',reject,{once:true});
});
let nextId=0;
const pending=new Map(),exceptions=[];
ws.addEventListener('message',event=>{
  const data=JSON.parse(String(event.data));
  if(data.method==='Runtime.exceptionThrown'){
    exceptions.push(data.params?.exceptionDetails?.exception?.description||data.params?.exceptionDetails?.text);
  }
  if(data.id&&pending.has(data.id)){
    const {resolve,reject}=pending.get(data.id);
    pending.delete(data.id);
    data.error?reject(Error(data.error.message)):resolve(data.result);
  }
});
function command(method,params={}){
  const id=++nextId;
  return new Promise((resolve,reject)=>{
    pending.set(id,{resolve,reject});
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function evaluate(expression){
  const response=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);
  return response.result.value;
}
async function until(condition,label){
  for(let i=0;i<40;i++){
    if(await condition())return;
    await sleep(150);
  }
  throw Error('Délai dépassé : '+label);
}

await command('Runtime.enable');
await command('Page.enable');
await command('Emulation.clearDeviceMetricsOverride');
await command('Page.navigate',{url:'http://127.0.0.1:8765/?trial-e2e=1#jouer'});
await until(()=>evaluate("document.querySelectorAll('#game-picker .game-choice').length===5&&Boolean(document.querySelector('.game.mobile-active'))"),'Épreuves chargées');
await evaluate("document.querySelector('#launch-play').click()");
await until(()=>evaluate("document.querySelector('#arcane-launch')?.hidden===true"),'Entrée en jeu');

async function snapshot(width,height,mobile){
  await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
  await sleep(120);
  return evaluate(`(()=>{
    const $=selector=>document.querySelector(selector);
    const picker=$('#game-picker');
    const stage=$('#page-jouer .play-stage');
    const active=$('#page-jouer .game.mobile-active');
    const rect=selector=>$(selector).getBoundingClientRect();
    return {
      viewport:window.innerWidth,
      docWidth:document.documentElement.scrollWidth,
      visible:!!active&&getComputedStyle(active).display!=='none',
      pickerCount:picker.children.length,
      selected:picker.querySelectorAll('.game-choice[aria-pressed="true"]').length,
      pickerScrollable:picker.scrollWidth>picker.clientWidth+3,
      boardWidth:rect('#page-jouer .game.mobile-active .board').width,
      stageWidth:stage.getBoundingClientRect().width,
      boardBeforeRecords:rect('#page-jouer .game.mobile-active .board').top<rect('#page-jouer .game.mobile-active .trial-records').top,
      actionsBeforeRecords:rect('#page-jouer .game.mobile-active .small-actions').top<rect('#page-jouer .game.mobile-active .trial-records').top,
      difficultyFits:rect('#difficulty-options').right<=window.innerWidth+2,
      portalBelowStage:rect('#page-jouer .expedition-portal').top>=stage.getBoundingClientRect().bottom,
      redundantPanels:document.querySelectorAll('#page-jouer .intro, #page-jouer .play-lore').length
    };
  })()`);
}

for(const [width,height,mobile,label] of [
  [360,740,true,'téléphone compact'],
  [390,844,true,'téléphone'],
  [768,1024,true,'tablette'],
  [1440,900,false,'ordinateur']
]){
  const view=await snapshot(width,height,mobile);
  console.log('Épreuves '+label,JSON.stringify(view));
  assert.equal(view.pickerCount,5,label+' : les cinq choix existent');
  assert.equal(view.selected,1,label+' : une seule épreuve sélectionnée');
  assert.equal(view.redundantPanels,0,label+' : aucun panneau narratif inutile');
  assert.ok(view.visible&&view.boardWidth>100,label+' : plateau visible');
  assert.ok(view.boardBeforeRecords&&view.actionsBeforeRecords,label+' : jeu avant records');
  assert.ok(view.portalBelowStage,label+' : Expéditions après jeu');
  assert.ok(view.difficultyFits,label+' : difficultés à l’intérieur du viewport');
  assert.ok(view.docWidth<=view.viewport+2,label+' : aucun débordement horizontal global');
  if(width<1000)assert.ok(view.pickerScrollable,label+' : choix défilants');
  else assert.ok(!view.pickerScrollable,label+' : les cinq choix tiennent en largeur');
}

await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
const selected=await evaluate(`(()=>{
  document.querySelectorAll('#game-picker .game-choice')[3].click();
  document.querySelector('#difficulty-options [data-difficulty="maitrise"]').click();
  const target=document.querySelectorAll('#game-picker .game-choice')[3];
  return {
    label:target.textContent,
    pressed:target.getAttribute('aria-pressed'),
    visible:document.querySelectorAll('#page-jouer .game.mobile-active')[0]?.id,
    difficulty:document.querySelector('#difficulty-options [data-difficulty="maitrise"]').getAttribute('aria-pressed')
  };
})()`);
assert.ok(selected.label.includes('Fouilles interdites'));
assert.equal(selected.pressed,'true');
assert.equal(selected.visible,'trial-panel-3');
assert.equal(selected.difficulty,'true');

const navigation=await evaluate(`(()=>{
  const current=document.querySelector('#trial-panel-3');
  const buttons=current.querySelectorAll('.trial-switch-button');
  const count=current.querySelector('.trial-switch-count').textContent;
  buttons[1].click();
  const next=document.querySelector('#page-jouer .game.mobile-active');
  const selectedTile=document.querySelector('#game-picker .game-choice[aria-pressed="true"]');
  return {
    count,hasTwoButtons:buttons.length===2,
    nextId:next.id,selectedTile: selectedTile.getAttribute('aria-controls'),
    nextCount:next.querySelector('.trial-switch-count').textContent,
    difficulty:document.querySelector('#difficulty-options [data-difficulty="maitrise"]').getAttribute('aria-pressed')
  };
})()`);
assert.equal(navigation.count,'04 / 05','Le compteur indique le rang de l’épreuve');
assert.equal(navigation.hasTwoButtons,true,'Deux commandes seulement, sans surcharge');
assert.equal(navigation.nextId,'trial-panel-4','Suivante ouvre la dernière épreuve');
assert.equal(navigation.selectedTile,'trial-panel-4','Le carrousel reste synchronisé');
assert.equal(navigation.nextCount,'05 / 05','Le compteur suit le changement');
assert.equal(navigation.difficulty,'true','La difficulté choisie est conservée');
const boundaries=await evaluate(`(()=>{
  const first=document.querySelector('#trial-panel-0 .trial-switch-button');
  const last=document.querySelector('#trial-panel-4 .trial-switch-button:last-child');
  return {firstDisabled:first.disabled,lastDisabled:last.disabled,
    lastLabel:last.getAttribute('aria-label'),
    focusTarget:document.querySelector('#trial-title-4').getAttribute('tabindex')};
})()`);
assert.ok(boundaries.firstDisabled&&boundaries.lastDisabled,'Les flèches aux extrémités sont désactivées');
assert.ok(boundaries.lastLabel.includes('Dernière épreuve'),'Boutons correctement annoncés au lecteur d’écran');
assert.equal(boundaries.focusTarget,'-1','Le titre est ciblable au changement d’épreuve');
// Check the new variants in the live controller and a normal alchemy discovery.
await evaluate("document.querySelectorAll('#game-picker .game-choice')[0].click();document.querySelector('[data-difficulty=\"aventure\"]').click()");
const runeTitles=await evaluate("(()=>{const p=document.querySelector('#trial-panel-0'),seen=new Set();for(let i=0;i<60;i++){seen.add(p.querySelector('.rune-ritual-name').textContent);p.querySelector('.small-actions button').click()}return [...seen]})()");
assert.ok(runeTitles.includes('La Danse des constellations'));
await evaluate("document.querySelector('[data-difficulty=\"maitrise\"]').click()");
const masteryTitles=await evaluate("(()=>{const p=document.querySelector('#trial-panel-0'),seen=new Set();for(let i=0;i<80;i++){seen.add(p.querySelector('.rune-ritual-name').textContent);p.querySelector('.small-actions button').click()}return [...seen]})()");
assert.ok(masteryTitles.includes('Le Cœur du sceau'));
await evaluate("document.querySelector('[data-difficulty=\"aventure\"]').click();document.querySelectorAll('#game-picker .game-choice')[1].click()");
const memoryLayout=await evaluate("(()=>{const p=document.querySelector('#trial-panel-1');for(let i=0;i<60&&p.querySelector('.memory-ritual-title').textContent!=='Les Deux Rives';i++)p.querySelector('.small-actions button').click();const tiles=[...p.querySelectorAll('.memory-tile')];const left=tiles.filter((_,i)=>i%4<2).map(t=>t.dataset.id).sort(),right=tiles.filter((_,i)=>i%4>=2).map(t=>t.dataset.id).sort();return {title:p.querySelector('.memory-ritual-title').textContent,count:tiles.length,left,right,unique:new Set(left).size}})()");
assert.equal(memoryLayout.title,'Les Deux Rives');assert.equal(memoryLayout.count,16);assert.equal(memoryLayout.unique,8);assert.deepEqual(memoryLayout.left,memoryLayout.right);
await evaluate("document.querySelectorAll('#game-picker .game-choice')[4].click();document.querySelector('[data-difficulty=\"maitrise\"]').click()");
const alchemyLabel=await evaluate("document.querySelector('#trial-panel-4 .alchemy-board').getAttribute('aria-label')");
assert.ok(alchemyLabel.includes('3 ingrédients'));
console.log('Trial variety Chromium: new rune sequences, two-bank memory layout, three-ingredient Mastery label OK.');
// Play the complete Initiation circuit using real trial click handlers.
await command('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});
await evaluate("document.querySelector('#arcane-circuits').open=true");
const circuitFit=await evaluate("(()=>{const b=document.querySelector('#arcane-circuits');return {count:b.querySelectorAll('.circuit-choice').length,fit:b.getBoundingClientRect().right<=innerWidth+2&&document.documentElement.scrollWidth<=innerWidth+2,buttons:[...b.querySelectorAll('.circuit-select')].every(x=>x.getBoundingClientRect().height>=44)}})()");
assert.deepEqual(circuitFit,{count:3,fit:true,buttons:true});
await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
const circuitBefore=await evaluate("JSON.parse(localStorage.getItem('aetherium-save-v1'))");
await evaluate("document.querySelector('[data-circuit=\"lumieres\"] .circuit-select').click();document.querySelector('.circuit-play').click()");
assert.equal(await evaluate("document.querySelector('#page-jouer .game.mobile-active').id"),'trial-panel-0');
assert.equal(await evaluate("document.querySelector('[data-difficulty=\"initiation\"]').getAttribute('aria-pressed')"),'true');
await evaluate("document.querySelector('.circuit-pause').click();document.querySelector('.circuit-play').click()");
await evaluate("(()=>{const p=document.querySelector('#trial-panel-0');for(let i=1;i<=12;i++)[...p.querySelectorAll('button.tile')].find(t=>t.getAttribute('aria-label')?.startsWith('Rune '+i+' sur')).click();return true})()");
assert.equal(await evaluate("document.querySelector('#circuit-summary').textContent"),'Étape 2/3');
await evaluate("document.querySelector('.circuit-return').click();document.querySelector('.circuit-play').click()");
await evaluate("(()=>{const tiles=[...document.querySelectorAll('#trial-panel-1 .memory-tile')];for(const id of new Set(tiles.map(t=>t.dataset.id)))tiles.filter(t=>t.dataset.id===id).forEach(t=>t.click());return true})()");
assert.equal(await evaluate("document.querySelector('#circuit-summary').textContent"),'Étape 3/3');
await evaluate("document.querySelector('.circuit-play').click()");
await evaluate("(()=>{const p=document.querySelector('#trial-panel-2'),tiles=[...p.querySelectorAll('.ether-crystal')],vals=tiles.map(t=>Number(t.querySelector('.ether-crystal-value').textContent)),target=Number(p.querySelector('.ether-target').textContent);for(let a=0;a<6;a++)for(let b=a+1;b<6;b++)for(let c=b+1;c<6;c++)if(vals[a]+vals[b]+vals[c]===target){[a,b,c].forEach(i=>tiles[i].click());p.querySelector('.small-actions .primary').click();return true}throw Error('No valid lock solution')})()");
assert.equal(await evaluate("document.querySelector('#circuit-summary').textContent"),'Circuit achevé · 300/300');
const circuitAfter=await evaluate("JSON.parse(localStorage.getItem('aetherium-save-v1'))");
assert.equal(circuitAfter.coins,circuitBefore.coins+130);assert.equal(circuitAfter.wins,circuitBefore.wins+3);
assert.deepEqual(circuitAfter.expedition,circuitBefore.expedition);assert.deepEqual(circuitAfter.owned,circuitBefore.owned);
await evaluate("document.querySelector('.circuit-replay').click()");
assert.equal(await evaluate("document.querySelector('#circuit-summary').textContent"),'Étape 1/3');
await evaluate("document.querySelector('.circuit-leave').click()");
assert.ok(await evaluate("document.querySelector('[data-circuit=\"lumieres\"]').textContent.includes('300/300')"));
console.log('Circuits Chromium: compact layout, actual three-trial sequence, pause/replay, 300/300, exactly 130 normal Crowns and unchanged expedition/collection OK.');
assert.deepEqual(exceptions,[],'Aucune erreur JavaScript pendant la navigation des Épreuves');
ws.close();
console.log('Épreuves responsive : 360 / 390 / 768 / 1440 px, sélection et difficulté OK');
