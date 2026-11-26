// Chromium regression of Chromatique art, rarity frames and viewport layout.
import assert from 'node:assert/strict';

if(process.env.AETHERIUM_BROWSER_TEST!=='1'){
  console.log('Chromatique browser test: enabled by the Chromium CI job');
  process.exit(0);
}

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function endpoint(){
  for(let attempt=0;attempt<50;attempt++){
    try{
      const response=await fetch('http://127.0.0.1:9222/json/list');
      const pages=await response.json();
      const page=pages.find(item=>item.type==='page'&&item.url.includes('127.0.0.1:8765'));
      if(page)return page.webSocketDebuggerUrl;
    }catch{}
    await sleep(250);
  }
  throw Error('Chromium debug page was not found');
}
const ws=new WebSocket(await endpoint());
await new Promise((resolve,reject)=>{
  ws.addEventListener('open',resolve,{once:true});
  ws.addEventListener('error',reject,{once:true});
});
let seq=0;
const pending=new Map();
ws.addEventListener('message',event=>{
  const data=JSON.parse(String(event.data));
  if(!data.id||!pending.has(data.id))return;
  const {resolve,reject}=pending.get(data.id);pending.delete(data.id);
  data.error?reject(Error(data.error.message)):resolve(data.result);
});
function command(method,params={}){
  const id=++seq;
  return new Promise((resolve,reject)=>{
    pending.set(id,{resolve,reject});
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function evaluate(expression){
  const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
  return r.result?.value;
}
async function until(check,label){
  for(let i=0;i<55;i++){
    try{if(await check())return;}catch{}
    await sleep(180);
  }
  throw Error('Timed out: '+label);
}

await command('Runtime.enable');
await command('Page.enable');
await command('Page.navigate',{url:'http://127.0.0.1:8765/?chromatic-audit=1#collection'});
await until(()=>evaluate("document.readyState==='complete' && !!document.querySelector('#card-grid')"),'initial Codex load');
// Isolated synthetic save: every card has exactly one Chromatique copy.
await evaluate(`(()=>{
 const ids=Array.from({length:72},(_,i)=>i+1);
 const owned=Object.fromEntries(ids.map(id=>[id,1]));
 const shiny=Object.fromEntries(ids.map(id=>[id,true]));
 localStorage.setItem('aetherium-save-v1',JSON.stringify({
  coins:300,dust:0,owned,shiny,opened:0,
  finishCounts:{normal:{},chromatic:owned,holographic:{},calligraphic:{}}
 }));
 location.reload();
 return true;
})()`);
await until(()=>evaluate("document.querySelector('#page-collection')?.classList.contains('active') && document.querySelectorAll('#card-grid .card.is-chromatic').length===24"),'all Origines Chromatiques present');
for(const width of [360,768,1280]){
  await command('Emulation.setDeviceMetricsOverride',{
    width,height:Math.max(730,Math.round(width*.9)),deviceScaleFactor:1,mobile:width<=850
  });
  await sleep(150);
  for(const [collection,representatives] of [
    ['origines',[1,8,24]],
    ['reflets-brises',[25,36,48]],
    ['au-dela-du-verre',[49,60,72]]
  ]){
    await evaluate(`document.querySelector('.codex-chapter[data-collection="${collection}"]').click();true`);
    await until(()=>evaluate("document.querySelectorAll('#card-grid .card.is-chromatic').length===24"),collection+' full grid');
    const result=await evaluate(`(async()=>{
      const ids=${JSON.stringify(representatives)};
      const cards=[...document.querySelectorAll('#card-grid .card')];
      const selected=ids.map(id=>document.querySelector('#card-grid .card[data-card-id="'+id+'"]'));
      selected.forEach(card=>{
        const img=card?.querySelector('img');
        if(img)img.loading='eager';
      });
      await Promise.all(selected.map(card=>card?.querySelector('img')?.decode().catch(()=>null)));
      const info=selected.map(card=>{
        if(!card)return {missing:true};
        const window=card.querySelector('.chromatic-art-window');
        const image=window?.querySelector('img');
        const bounds=card.getBoundingClientRect();
        return {
          id:Number(card.dataset.cardId),rarity:card.dataset.rarity,
          outerWidth:bounds.width,outerRight:bounds.right,
          chromatic:card.classList.contains('is-chromatic'),
          foil:getComputedStyle(window,'::after').content,
          rim:getComputedStyle(window,'::before').animationName,
          cardOverlay:getComputedStyle(card,'::after').content,
          imageWidth:image?.naturalWidth||0,
          imageSource:image?.currentSrc||image?.src||''
        };
      });
      return {count:cards.length,chromaticCount:cards.filter(c=>c.classList.contains('is-chromatic')).length,
        info,viewport:innerWidth};
    })()`);
    assert.equal(result.count,24,collection+' at '+width+'px: 24 cards');
    assert.equal(result.chromaticCount,24,'All cards use their Chromatique finish');
    for(const card of result.info){
      assert.equal(card.missing,undefined,'Card exists for every representative ID');
      assert.ok(card.chromatic,'Chromatique class on '+card.id);
      assert.ok(card.rarity,'Rarity data on '+card.id);
      assert.ok(card.outerWidth>45,'Usable card width for '+card.id+' on '+width+'px');
      assert.ok(card.outerRight<=width+4,'Card does not overflow right edge');
      assert.ok(card.imageWidth>0,'Decoded artwork for card '+card.id);
      assert.ok(card.imageSource.includes('/assets/cards/')&&card.imageSource.includes('.webp'),
        'Card '+card.id+' uses its approved WebP, never procedural fallback');
      assert.equal(card.cardOverlay,'none','No full-card glare over captions');
      assert.equal(card.rim,'chromatic-rim-orbit','Chromatique prismatic rim remains active');
    }
    const inspection=await evaluate(`(async()=>{
      const card=document.querySelector('#card-grid .card[data-card-id="${representatives[0]}"]');
      card.click();
      const image=document.querySelector('#inspector .recto-lab-card.recto-lab-chromatic .recto-lab-illustration');
      if(image)await image.decode().catch(()=>null);
      const shell=document.querySelector('#inspector .recto-lab-card.recto-lab-chromatic .recto-lab-art');
      const panel=document.querySelector('#inspector');
      const result={rarity:panel?.dataset.rarity,source:image?.currentSrc||'',
        naturalWidth:image?.naturalWidth||0,
        rim:shell?getComputedStyle(shell,'::before').animationName:null,
        overflow:shell?getComputedStyle(shell).overflow:null};
      const close=document.querySelector('#inspect-close');
      if(close&&document.body.classList.contains('sheet-open'))close.click();
      return result;
    })()`);
    assert.ok(inspection.rarity,'Inspector keeps its rarity frame');
    assert.ok(inspection.naturalWidth>0,'Inspector full-size authored image loads');
    assert.ok(inspection.source.includes('/assets/cards/'),'Inspector never swaps authored art');
    assert.equal(inspection.rim,'chromatic-rim-orbit','Animated border preserved');
    assert.equal(inspection.overflow,'hidden','Inner prismatic border remains clipped');
  }
}
// Verify Calligraphique against the real browser cascade, including inline art style.
await evaluate(`(()=>{
 const save=JSON.parse(localStorage.getItem('aetherium-save-v1'));
 save.owned[8]=4;
 for(const f of ['normal','calligraphic','chromatic','holographic'])save.finishCounts[f][8]=1;
 localStorage.setItem('aetherium-save-v1',JSON.stringify(save));
 location.reload();return true;
})()`);
await until(()=>evaluate("Boolean(document.querySelector('.codex-chapter[data-collection=\\\"origines\\\"]'))"),'Codex reload');
await evaluate("document.querySelector('.codex-chapter[data-collection=\\\"origines\\\"]').click()");
await until(()=>evaluate("Boolean(document.querySelector('#card-grid [data-card-id=\\\"8\\\"]'))"),'Cerf available');
await evaluate("document.querySelector('#card-grid [data-card-id=\\\"8\\\"]').click()");
const finishes=await evaluate(`(()=>{
 const buttons=[...document.querySelectorAll('#inspector .finish-choice')];
 buttons[1].click();
 const image=document.querySelector('#inspector .recto-lab-calligraphic .recto-lab-illustration');
 return {labels:buttons.map(b=>b.getAttribute('aria-label')),filter:image?getComputedStyle(image).filter:null};
})()`);
assert.deepEqual(finishes.labels.map(s=>s.split(' · ')[0]),['Normale','Calligraphique','Chromatique','Holographique']);
assert.match(finishes.filter||'',/grayscale\\(1\\)/,'Calligraphic grayscale wins over inline filter');
ws.close();
console.log('Chromatique browser audit: 72 cards across 3 collections, 3 viewports, approved art, CSS layers, rarity and inspector OK');
