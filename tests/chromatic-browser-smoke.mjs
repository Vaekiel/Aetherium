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
await until(()=>evaluate("document.readyState==='complete' && document.querySelector('#arcane-launch')?.hidden===false"),'Title ready');
await evaluate("document.querySelector('#launch-play').click()");
await until(()=>evaluate("document.querySelector('#arcane-launch')?.hidden===true"),'Enter game');
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
await until(()=>evaluate("document.readyState==='complete' && document.querySelector('#arcane-launch')?.hidden===false"),'Title ready');
await evaluate("document.querySelector('#launch-play').click()");
await until(()=>evaluate("document.querySelector('#arcane-launch')?.hidden===true"),'Enter game');
for(const width of [360,768,1280]){
  await command('Emulation.setDeviceMetricsOverride',{
    width,height:Math.max(730,Math.round(width*.9)),deviceScaleFactor:1,mobile:width<=850
  });
  await sleep(150);
  let referenceDimensions=null;
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
      const outer=panel?.querySelector('.recto-lab-card')?.getBoundingClientRect();
      const art=shell?.getBoundingClientRect();
      const result={rarity:panel?.dataset.rarity,source:image?.currentSrc||'',
        dimensions:[outer?.width,outer?.height,art?.width,art?.height],
        imageRatio:image?.naturalWidth/image?.naturalHeight,
        fit:image?getComputedStyle(image).objectFit:null,
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
    assert.ok(inspection.dimensions.every(n=>n>0),'Card and aperture dimensions are visible');
    if(!referenceDimensions)referenceDimensions=inspection.dimensions;
    else assert.ok(inspection.dimensions.every((n,i)=>Math.abs(n-referenceDimensions[i])<=2),
      collection+' shares the same card and aperture dimensions at '+width+'px');
    if(inspection.imageRatio<.75)assert.equal(inspection.fit,'cover','Tall art fills the common aperture');
  }
}
// Verify Calligraphique against the real browser cascade, including inline art style.
await evaluate(`(()=>{
 const save=JSON.parse(localStorage.getItem('aetherium-save-v1'));
 for(const id of [8,36,60]){
  save.owned[id]=4;
  for(const f of ['normal','calligraphic','chromatic','holographic'])save.finishCounts[f][id]=1;
 }
 localStorage.setItem('aetherium-save-v1',JSON.stringify(save));
 location.reload();return true;
})()`);
await until(()=>evaluate("Boolean(document.querySelector('.codex-chapter[data-collection=\\\"origines\\\"]'))"),'Codex reload');
await until(()=>evaluate("document.readyState==='complete' && document.querySelector('#arcane-launch')?.hidden===false"),'Title ready');
await evaluate("document.querySelector('#launch-play').click()");
await until(()=>evaluate("document.querySelector('#arcane-launch')?.hidden===true"),'Enter game');
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
assert.ok(finishes.filter?.includes('grayscale(1)'), 'Calligraphic grayscale wins over inline filter');
// Check all four finishes in the actual official recto, one representative
// per collection, across phone, tablet and desktop layouts.
for(const width of [360,768,1280]){
 await command('Emulation.setDeviceMetricsOverride',{
  width,height:Math.max(730,Math.round(width*.9)),deviceScaleFactor:width<=768?2:1,mobile:width<=850
 });
 await sleep(180);
 let reference=null;
 for(const [collection,id,lockedId] of [['origines',8,7],['reflets-brises',36,35],['au-dela-du-verre',60,59]]){
  await evaluate("(()=>{const close=document.querySelector('#inspect-close');if(document.body.classList.contains('sheet-open'))close.click();return true})()");
  await evaluate("document.querySelector('.codex-chapter[data-collection=\""+collection+"\"]').click();true");
  await until(()=>evaluate("Boolean(document.querySelector('#card-grid [data-card-id=\""+id+"\"]'))"),collection+' grid');
  await evaluate("document.querySelector('#card-grid [data-card-id=\""+id+"\"]').click()");
  for(const [index,finish] of ['normal','calligraphic','chromatic','holographic'].entries()){
   const info=await evaluate("(async()=>{"+
    "const button=document.querySelectorAll('#inspector .finish-choice')["+index+"];"+
    "if(button.disabled)throw Error('Owned finish incorrectly locked');button.click();"+
    "const front=document.querySelector('#inspector .recto-lab-"+finish+"');"+
    "if(!front)throw Error('Wrong official recto');const image=front.querySelector('.recto-lab-illustration');"+
    "await image.decode();const r=front.getBoundingClientRect();const art=front.querySelector('.recto-lab-art');"+
    "let pointer=null;"+
    (finish==='holographic'?
     "front.dispatchEvent(new PointerEvent('pointermove',{clientX:r.left+r.width*.8,clientY:r.top+r.height*.3,pointerType:'"+(width<=850?"touch":"mouse")+"'}));"+
     "await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));pointer=parseFloat(front.style.getPropertyValue('--holo-x'));":"")+
    "return {width:r.width,height:r.height,source:image.currentSrc,filter:getComputedStyle(image).filter,rim:getComputedStyle(art,'::before').animationName,pointer,selected:[...document.querySelectorAll('#inspector .finish-choice')].filter(b=>b.getAttribute('aria-pressed')==='true').length};})()");
   assert.ok(info.width>0&&info.height>0,collection+' '+finish+' visible');
   assert.ok(info.source.includes('/assets/cards/'),'Authored art retained');
   assert.equal(info.selected,1,'Exactly one selected finish');
   if(!reference)reference=[info.width,info.height];
   assert.ok(Math.abs(info.width-reference[0])<=2&&Math.abs(info.height-reference[1])<=2,
      collection+' '+finish+' shares common card dimensions at '+width+'px');
   if(finish==='calligraphic')assert.ok(info.filter.includes('grayscale(1)'));
   else assert.ok(!info.filter.includes('grayscale(1)'),'Only Calligraphique is monochrome');
   if(finish==='chromatic')assert.equal(info.rim,'chromatic-rim-orbit');
   if(finish==='holographic')assert.ok(info.pointer>65,'Holographic pointer/touch changes highlight');
  }
  if(width<=850)await evaluate("document.querySelector('#inspect-close').click()");
  await evaluate("document.querySelector('#card-grid [data-card-id=\""+lockedId+"\"]').click()");
  const availability=await evaluate("[...document.querySelectorAll('#inspector .finish-choice')].map(b=>b.disabled)");
  assert.deepEqual(availability,[true,true,false,true],'Only the owned Chromatique may be previewed');
  if(width<=850)await evaluate("document.querySelector('#inspect-close').click()");
 }
 console.log('Four-finish browser regression OK at '+width+'px (3 collections).');
}
// Signature's exclusive evolution does not make Normal completion impossible.
const objectives=await evaluate("(()=>Object.fromEntries(['normal','calligraphic','chromatic','holographic'].map(f=>[f,document.querySelector('#codex-progress-'+f).textContent.split(' / ')[1]])))()");
assert.deepEqual(objectives,{normal:'71',calligraphic:'71',chromatic:'72',holographic:'71'});
const maxima=await evaluate("(()=>Object.fromEntries(['normal','calligraphic','chromatic','holographic'].map(f=>[f,document.querySelector('#codex-'+f+'-track').getAttribute('aria-valuemax')])))()");
assert.deepEqual(maxima,objectives);
await evaluate("document.querySelector('.codex-chapter[data-collection=\"au-dela-du-verre\"]').click();true");
await evaluate("document.querySelector('#card-grid [data-card-id=\"72\"]').click()");
const labels=await evaluate("[...document.querySelectorAll('#inspector .finish-choice')].map(b=>b.getAttribute('aria-label'))");
assert.ok(labels[0].includes('Évoluée en Chromatique'));
assert.ok(labels[1].includes('Non disponible pour la Signature'));
assert.ok(labels[3].includes('Non disponible pour la Signature'));
console.log('Signature targets and locked-finish explanations OK.');
// Exercise a real Forge transaction, cancellation and reload on mobile.
await command('Emulation.setDeviceMetricsOverride',{width:360,height:800,deviceScaleFactor:2,mobile:true});
await evaluate("(()=>{const s=JSON.parse(localStorage.getItem('aetherium-save-v1'));s.dust=1000;localStorage.setItem('aetherium-save-v1',JSON.stringify(s));location.reload();return true})()");
await until(()=>evaluate("document.readyState==='complete' && document.querySelector('#arcane-launch')?.hidden===false"),'Forge title ready');
await evaluate("document.querySelector('#launch-play').click()");
await until(()=>evaluate("document.querySelector('#arcane-launch')?.hidden===true"),'Enter Forge game');
await evaluate("location.hash='atelier';true");
await until(()=>evaluate("document.querySelector('#page-atelier').classList.contains('active')"),'Forge page');
await evaluate("(()=>{const select=document.querySelector('#atelier-mode');select.value='holographic';select.dispatchEvent(new Event('change'));return true})()");
await until(()=>evaluate("Boolean(document.querySelector('#atelier-card-list [data-card-id=\"1\"]'))"),'Missing holographic recipe');
const candidates=await evaluate("({signature:!!document.querySelector('#atelier-card-list [data-card-id=\"72\"]'),already:!!document.querySelector('#atelier-card-list [data-card-id=\"8\"]')})");
assert.deepEqual(candidates,{signature:false,already:false});
await evaluate("document.querySelector('#atelier-card-list [data-card-id=\"1\"]').click()");
await evaluate("document.querySelector('.atelier-craft-action').click()");
await until(()=>evaluate("document.querySelector('#atelier-confirm').open"),'Forge confirmation');
await evaluate("document.querySelector('#atelier-confirm-cancel').click()");
assert.equal(await evaluate("JSON.parse(localStorage.getItem('aetherium-save-v1')).dust"),1000);
await sleep(100);
await evaluate("document.querySelector('.atelier-craft-action').click()");
await evaluate("document.querySelector('#atelier-confirm-accept').click()");
const forged=await evaluate("(()=>{const s=JSON.parse(localStorage.getItem('aetherium-save-v1'));return {dust:s.dust,owned:s.owned[1],holo:s.finishCounts.holographic[1],chroma:s.finishCounts.chromatic[1],visible:!!document.querySelector('#atelier-card-list [data-card-id=\"1\"]')}})()");
assert.deepEqual(forged,{dust:945,owned:2,holo:1,chroma:1,visible:false});
await evaluate("location.reload();true");
await until(()=>evaluate("document.readyState==='complete' && document.querySelector('#arcane-launch')?.hidden===false"),'Reload after Forge');
await evaluate("document.querySelector('#launch-play').click()");
assert.equal(await evaluate("JSON.parse(localStorage.getItem('aetherium-save-v1')).finishCounts.holographic[1]"),1);
console.log('Finish Forge browser: mobile recipe, cancellation, exact cost, previous finish, reload OK.');
ws.close();
console.log('Chromatique and four-finish browser audit: 72-card catalog, 3 collections, 3 viewports, approved art, ownership, CSS and pointer interaction OK');
