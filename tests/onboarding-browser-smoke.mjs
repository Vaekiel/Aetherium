// Real Chromium first-time player journey.
// Run after booster-browser-smoke.mjs while the CI HTTP server and Chrome are alive.
import assert from 'node:assert/strict';

if(process.env.AETHERIUM_BROWSER_TEST!=='1'){
  console.log('Onboarding: real browser test enabled in CI');
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
await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
await command('Page.navigate',{url:'http://127.0.0.1:8765/?onboarding-e2e=1#jouer'});
await until(()=>evaluate("document.readyState==='complete'&&!!document.querySelector('#guide-action')"),'Initial app loaded');
await evaluate("localStorage.removeItem('aetherium-save-v1');localStorage.removeItem('aetherium-guide-dismissed-v1');location.reload();true");
await until(()=>evaluate("document.readyState==='complete'&&document.querySelector('#arcane-launch')?.hidden===false&&document.querySelectorAll('#game-picker .game-choice').length===5"),'Fresh player');
await evaluate("document.querySelector('#launch-play').click()");
await until(()=>evaluate("document.querySelector('#arcane-launch').hidden"),'Enter game');
const welcome=await evaluate("(()=>{const g=document.querySelector('#beginner-guide');return {hidden:g.hidden,text:g.textContent,coins:JSON.parse(localStorage.getItem('aetherium-save-v1')).coins,modal:document.querySelector('dialog[open]')!==null}})()");
assert.equal(welcome.hidden,false);assert.equal(welcome.coins,300);assert.ok(welcome.text.includes('3 boosters'));assert.equal(welcome.modal,false);
for(const [width,height] of [[320,740],[390,844],[768,1024],[1280,900]]){
 await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<=850});
 await sleep(100);
 const fits=await evaluate("(()=>{const g=document.querySelector('#beginner-guide'),r=g.getBoundingClientRect();return r.width>0&&r.right<=innerWidth+2&&document.documentElement.scrollWidth<=innerWidth+2&&[...g.querySelectorAll('button')].every(b=>b.getBoundingClientRect().height>=44)})()");
 assert.ok(fits,'Guide fits at '+width+'px');
}
await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
const original=await evaluate("localStorage.getItem('aetherium-save-v1')");
await evaluate("document.querySelector('#guide-dismiss').click()");
assert.equal(await evaluate("document.querySelector('#beginner-guide').hidden"),true);
assert.equal(await evaluate("localStorage.getItem('aetherium-save-v1')"),original);
await evaluate("location.reload();true");
await until(()=>evaluate("document.readyState==='complete'&&document.querySelector('#arcane-launch')?.hidden===false&&document.querySelectorAll('#game-picker .game-choice').length===5"),'Dismissed reload');
await evaluate("document.querySelector('#launch-play').click()");
await until(()=>evaluate("document.querySelector('#arcane-launch').hidden"),'Enter game again');
assert.equal(await evaluate("document.querySelector('#beginner-guide').hidden"),true);
await evaluate("document.querySelector('.footer-tools').open=true;document.querySelector('#guide-reopen').click()");
assert.equal(await evaluate("document.querySelector('#beginner-guide').hidden"),false);
await evaluate("document.querySelector('#guide-action').click()");
assert.equal(await evaluate("document.querySelector('#page-boosters').classList.contains('active')"),true);
await evaluate("document.querySelector('.booster-choice[data-booster=\"origines\"]').click()");
assert.equal(await evaluate("document.querySelector('#booster-dialog').open"),true);
await evaluate("document.querySelector('#buy').click()");
await until(()=>evaluate("document.querySelector('#booster-actions').hidden===false"),'First booster purchased');
await evaluate("document.querySelector('#reveal-all').click()");
await until(()=>evaluate("document.querySelector('#booster-codex-action').hidden===false"),'Recap shortcut');
const first=await evaluate("(()=>{const s=JSON.parse(localStorage.getItem('aetherium-save-v1'));return {coins:s.coins,opened:s.opened,copies:Object.values(s.owned).reduce((a,b)=>a+b,0)}})()");
assert.deepEqual(first,{coins:200,opened:1,copies:5});
await evaluate("document.querySelector('#booster-codex-action').click()");
await until(()=>evaluate("document.querySelector('#page-collection').classList.contains('active')&&!document.querySelector('#booster-dialog').open"),'Codex shortcut');
assert.ok(await evaluate("document.querySelectorAll('#card-grid .card:not(.is-sealed)').length>0"));
await evaluate("document.querySelector('nav [data-page=\"jouer\"]').click()");
assert.ok(await evaluate("document.querySelector('#guide-copy').textContent.includes('Gagne des Couronnes')"));
await evaluate("document.querySelector('#guide-action').click()");
await evaluate("document.querySelector('[data-difficulty=\"initiation\"]').click();document.querySelector('#game-picker .game-choice').click()");
await evaluate("(()=>{for(let i=1;i<=12;i++){const tile=[...document.querySelectorAll('#trial-panel-0 .rune-tile')].find(t=>t.getAttribute('aria-label').startsWith('Rune '+i+' sur'));if(!tile)throw Error('Missing rune '+i);tile.click()}return true})()");
const win=await evaluate("(()=>{const s=JSON.parse(localStorage.getItem('aetherium-save-v1'));return {coins:s.coins,wins:s.wins,opened:s.opened}})()");
assert.deepEqual(win,{coins:235,wins:1,opened:1});
assert.equal(await evaluate("document.querySelector('#beginner-guide').hidden"),true,'Completion hides the guide immediately even after reopening an incomplete guide');
await evaluate("location.reload();true");
await until(()=>evaluate("document.readyState==='complete'&&document.querySelector('#arcane-launch')?.hidden===false&&document.querySelectorAll('#game-picker .game-choice').length===5"),'Completed reload');
await evaluate("document.querySelector('#launch-play').click()");
await until(()=>evaluate("document.querySelector('#arcane-launch').hidden"),'Completed profile');
assert.equal(await evaluate("document.querySelector('#beginner-guide').hidden"),true);
await evaluate("document.querySelector('nav [data-page=\"boosters\"]').click()");
for(let i=0;i<2;i++){
 await evaluate("document.querySelector('.booster-choice[data-booster=\"origines\"]').click();document.querySelector('#buy').click();document.querySelector('#reveal-all').click()");
 await until(()=>evaluate("!document.querySelector('#booster-codex-action').hidden"),'Additional booster recap');
 await evaluate("document.querySelector('#booster-close').click()");
 await sleep(100);
}
await evaluate("document.querySelector('.booster-choice[data-booster=\"origines\"]').click()");
const low=await evaluate("({disabled:document.querySelector('#buy').disabled,hidden:document.querySelector('#booster-funds').hidden,text:document.querySelector('#booster-funds-text').textContent})");
assert.equal(low.disabled,true);assert.equal(low.hidden,false);assert.ok(low.text.includes('65 Couronnes'));
await evaluate("document.querySelector('#booster-funds-action').click()");
assert.ok(await evaluate("document.querySelector('#page-jouer').classList.contains('active')&&!document.querySelector('#booster-dialog').open"));
assert.deepEqual(exceptions,[]);
console.log('Onboarding Chromium: fresh profile, 4 viewports, dismiss/reload/reopen, real booster and Codex, first win, automatic completion, insufficient funds and no JS exceptions OK.');
ws.close();
