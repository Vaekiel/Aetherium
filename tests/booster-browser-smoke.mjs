// Real Chromium coverage for the published static site (no external JS deps).
// Run with a local HTTP server and Chrome --remote-debugging-port=9222.
import assert from 'node:assert/strict';

if(process.env.AETHERIUM_BROWSER_TEST!=='1'){
 console.log('AETHERIUM : test Chrome réservé à la phase navigateur');
 process.exit(0);
}

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function readJson(url){
 const response=await fetch(url);
 if(!response.ok)throw Error('CDP endpoint '+url+' returned '+response.status);
 return response.json();
}
async function endpoint(){
 for(let attempt=0;attempt<50;attempt++){
  try{
   const pages=await readJson('http://127.0.0.1:9222/json/list');
   const page=pages.find(item=>item.type==='page'&&item.url.includes('127.0.0.1:8765'));
   if(page)return page.webSocketDebuggerUrl;
  }catch{}
  await sleep(250);
 }
 throw Error('Chromium did not expose a debug page');
}
const ws=new WebSocket(await endpoint());
await new Promise((resolve,reject)=>{
 ws.addEventListener('open',resolve,{once:true});
 ws.addEventListener('error',reject,{once:true});
});
let index=0;
const pending=new Map(),jsErrors=[];
ws.addEventListener('message',event=>{
 const message=JSON.parse(String(event.data));
 if(message.method==='Runtime.exceptionThrown'){
  const detail=message.params?.exceptionDetails;
  jsErrors.push({
    text:detail?.text,
    location:detail?.url+':'+detail?.lineNumber+':'+detail?.columnNumber,
    description:detail?.exception?.description,
    stack:detail?.stackTrace?.callFrames?.slice(0,7).map(f=>f.functionName+'@'+f.url+':'+f.lineNumber)
  });
 }
 if(message.id&&pending.has(message.id)){
  const {resolve,reject}=pending.get(message.id);pending.delete(message.id);
  if(message.error)reject(Error(message.error.message));
  else resolve(message.result);
 }
});
function command(method,params={}){
 const id=++index;
 return new Promise((resolve,reject)=>{
  pending.set(id,{resolve,reject});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const data=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
 if(data.exceptionDetails)throw Error('Browser JS: '+data.exceptionDetails.text+' '+data.exceptionDetails.exception?.description);
 return data.result?.value;
}
async function until(check,label){
 for(let n=0;n<45;n++){
  if(await check())return;
  await sleep(150);
 }
 throw Error('Timeout: '+label);
}
await command('Runtime.enable');
await command('Page.enable');
// Reload after Runtime.enable to capture early module errors instead of missing them.
await command('Page.navigate',{url:'http://127.0.0.1:8765/?booster-e2e=1#boosters'});
await sleep(1800);
console.log('Initial page',JSON.stringify(await evaluate(`({
 url:location.href,ready:document.readyState,hash:location.hash,
 active:[...document.querySelectorAll('.page.active')].map(p=>p.id),
 choices:document.querySelectorAll('.booster-choice').length,
 seasons:document.querySelectorAll('#booster-season-tabs button').length,
 scripts:[...document.scripts].map(s=>s.src).slice(-3)
})`)));
console.log('Initial JS exceptions',JSON.stringify(jsErrors));
await until(()=>evaluate("Boolean(document.querySelector('#page-boosters.active') && document.querySelector('#booster-season-tabs button'))"),'game booted on #boosters');

for(const [width,columns] of [[390,2],[760,3],[1280,3]]){
 await command('Emulation.setDeviceMetricsOverride',{
  width,height:900,deviceScaleFactor:1,mobile:width<760
 });
 await sleep(120);
 const overview=await evaluate(`(()=>{
  const page=document.querySelector('#page-boosters');
  const gallery=document.querySelector('#booster-gallery');
  const cards=[...gallery.querySelectorAll('.booster-choice')];
  const show=el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right}};
  return {
    columns:getComputedStyle(gallery).gridTemplateColumns.split(' ').filter(Boolean).length,
    display:getComputedStyle(gallery).display,
    gallery:show(gallery), cards:cards.map(show), viewport:innerWidth,
    link:[...document.styleSheets].map(s=>s.href||'').filter(s=>s.includes('booster-gallery')),
    pageVisible:getComputedStyle(page).display,
    images:cards.map(c=>c.querySelector('.pack-scene img').complete)
  }
 })()`);
 console.log('Gallery '+width+'px:',JSON.stringify(overview));
 assert.equal(overview.display,'grid','Actual CSS grid must be applied');
 assert.equal(overview.columns,columns,'Responsive '+width+'px expected columns');
 assert.equal(overview.cards.length,3);
 assert.equal(overview.pageVisible,'block');
 assert.ok(overview.cards.every(c=>c.width>90&&c.height>150),'All booster tiles must have real dimensions');
 assert.ok(overview.cards.every(c=>c.right<=width+2),'No horizontal overflow on '+width);
 for(const edition of ['origines','reflets-brises','au-dela-du-verre']){
  await evaluate(`document.querySelector('.booster-choice[data-booster="${edition}"]').click()`);
  const detail=await evaluate(`(()=>{
   const dlg=document.querySelector('#booster-dialog'),buy=document.querySelector('#buy');
   const pack=document.querySelector('#booster-pack');
   const r=dlg.getBoundingClientRect();
   return {open:dlg.open,modal:dlg.matches(':modal'),display:getComputedStyle(dlg).display,
    width:r.width,height:r.height,left:r.left,right:r.right,buy:buy.disabled,
    title:document.querySelector('#booster-family-title').textContent,
    packVisible:getComputedStyle(pack).display,packWidth:pack.getBoundingClientRect().width}
  })()`);
  console.log('Dialog '+width+'px '+edition+':',JSON.stringify(detail));
  assert.equal(detail.open,true);
  assert.equal(detail.modal,true,'Must sit in top layer');
  assert.ok(detail.width>230&&detail.height>200);
  assert.ok(detail.left>=-3&&detail.right<=width+3);
  assert.ok(detail.packWidth>90,'Booster artwork must be visible');
  await evaluate("document.querySelector('#booster-close').click()");
  const after=await evaluate("document.querySelector('#booster-dialog').open");
  assert.equal(after,false,'Close button must work');
 }
}
// Exercise an actual draw in the ephemeral CI browser, never a real save.
await evaluate("document.querySelector('.booster-choice[data-booster=\"origines\"]').click()");
const before=await evaluate(`(()=>{
 const save=JSON.parse(localStorage.getItem('aetherium-save-v1'));
 return {coins:save.coins,opened:save.opened,
  total:Object.values(save.owned||{}).reduce((a,b)=>a+b,0),
  canBuy:!document.querySelector('#buy').disabled}
})()`);
assert.equal(before.canBuy,true,'Fresh player has enough Couronnes for the first pack');
await evaluate("document.querySelector('#buy').click()");
await until(()=>evaluate("document.querySelector('#booster-dialog').classList.contains('has-results')"),'reveal stage opened');
await until(()=>evaluate("document.querySelector('#pulls .pull-flip')!==null"),'first sealed card appeared');
await evaluate("document.querySelector('#reveal-all').click()");
const after=await evaluate(`(()=>{
 const save=JSON.parse(localStorage.getItem('aetherium-save-v1'));
 const dialog=document.querySelector('#booster-dialog');
 return {coins:save.coins,opened:save.opened,
  total:Object.values(save.owned||{}).reduce((a,b)=>a+b,0),
  cards:document.querySelectorAll('#pulls .card').length,
  summary:!document.querySelector('#booster-summary').hidden,
  dialogOpen:dialog.open}
})()`);
console.log('Actual purchase and reveal:',JSON.stringify({before,after}));
assert.equal(after.coins,before.coins-100);
assert.equal(after.opened,before.opened+1);
assert.equal(after.total,before.total+5);
assert.equal(after.cards,5,'The final five cards are visible');
assert.equal(after.summary,true);
assert.equal(after.dialogOpen,true);
await evaluate("document.querySelector('#booster-close').click()");
assert.equal(await evaluate("document.querySelector('#booster-dialog').open"),false);

assert.deepEqual(jsErrors,[],'No unexpected browser JavaScript errors');
ws.close();
console.log('AETHERIUM : vrai navigateur, galerie/fiche PC tablette mobile et 3 boosters OK');
