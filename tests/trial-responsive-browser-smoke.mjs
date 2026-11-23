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
assert.deepEqual(exceptions,[],'Aucune erreur JavaScript pendant la navigation des Épreuves');
ws.close();
console.log('Épreuves responsive : 360 / 390 / 768 / 1440 px, sélection et difficulté OK');
