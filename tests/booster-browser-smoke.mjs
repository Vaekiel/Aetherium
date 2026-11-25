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
await command('Page.navigate',{url:'http://127.0.0.1:8765/?booster-e2e=1&recto-test=1#boosters'});
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
const installedManifest=await evaluate("fetch('./manifest.webmanifest').then(r=>r.json())");
assert.equal(installedManifest.display_override[0],'fullscreen');
assert.equal(installedManifest.icons.length,2);

// Simulate camera notches using the browser's actual safe-area CSS env values.
// This catches selector precedence regressions that source-only tests miss.
await command('Emulation.setDeviceMetricsOverride',{
 width:390,height:844,deviceScaleFactor:1,mobile:true
});
await command('Emulation.setSafeAreaInsetsOverride',{
 insets:{top:48,left:0,right:0,bottom:16}
});
await sleep(120);
const portraitCutout=await evaluate(`(()=>{
 const header=document.querySelector('#app > header.top');
 const wallet=document.querySelector('.top .wallet');
 const cs=getComputedStyle(header);
 return {paddingTop:parseFloat(cs.paddingTop),paddingLeft:parseFloat(cs.paddingLeft),
  walletTop:wallet.getBoundingClientRect().top,viewport:innerWidth}
})()`);
console.log('Notch portrait:',JSON.stringify(portraitCutout));
assert.ok(portraitCutout.paddingTop>=56,'Top safe area should reserve the 48px camera cutout');
assert.ok(portraitCutout.walletTop>=48,'Currencies are below the selfie camera');

await command('Emulation.setDeviceMetricsOverride',{
 width:831,height:377,deviceScaleFactor:1,mobile:true,
 screenOrientation:{type:'landscapePrimary',angle:90}
});
await command('Emulation.setSafeAreaInsetsOverride',{
 insets:{top:0,left:52,right:18,bottom:0}
});
await sleep(120);
const landscapeCutout=await evaluate(`(()=>{
 const header=document.querySelector('#app > header.top');
 const wallet=document.querySelector('.top .wallet');
 const cs=getComputedStyle(header);
 const w=wallet.getBoundingClientRect();
 return {paddingTop:parseFloat(cs.paddingTop),
  paddingLeft:parseFloat(cs.paddingLeft),paddingRight:parseFloat(cs.paddingRight),
  walletLeft:w.left,walletRight:w.right,viewport:innerWidth}
})()`);
console.log('Notch landscape:',JSON.stringify(landscapeCutout));
assert.ok(landscapeCutout.paddingTop<=8,'Landscape keeps the compact header');
assert.ok(landscapeCutout.paddingLeft>=52,'Left cutout safe area is respected');
assert.ok(landscapeCutout.paddingRight>=18,'Right cutout safe area is respected');
assert.ok(landscapeCutout.walletRight<=831-18+1,'Currency remains clear of right cutout');
await command('Emulation.setSafeAreaInsetsOverride',{
 insets:{top:0,left:0,right:0,bottom:0}
});

// Stress the pixel-art header in the smallest portrait widths before opening
// anything; no icon, number or title should end up behind another control.
for(const width of [320,360,390,760,1280]){
 await command('Emulation.setDeviceMetricsOverride',{
  width,height:800,deviceScaleFactor:1,mobile:width<=850
 });
 await sleep(140);
 const strip=await evaluate(`(()=>{
  const root=document.querySelector('#app > header.top');
  const brand=root.querySelector('.brand');
  const word=brand.querySelector('.brand-wordmark');
  const letters=document.createRange();
  letters.selectNodeContents(word);
  const glyphs=letters.getBoundingClientRect();
  const rule=getComputedStyle(word,'::after');
  const btns=[
   ...root.querySelectorAll('.wallet-link'),
   root.querySelector('#chroniques-link'),
   root.querySelector('#immersive-toggle')
  ].filter(x=>getComputedStyle(x).display!=='none'&&!x.hidden);
  const rect=e=>{const r=e.getBoundingClientRect();return {
   left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height
  }};
  return {
   viewport:innerWidth,brand:rect(brand),
   brandFits:brand.scrollWidth<=brand.clientWidth+2,
   wordmark:{...rect(word),textLeft:glyphs.left,textRight:glyphs.right,
     ruleWidth:parseFloat(rule.width),ruleMarginLeft:parseFloat(rule.marginLeft),
     ruleDisplay:rule.display,oldRuleDisplay:getComputedStyle(brand,'::after').display},
   subtitlePresent:brand.querySelector('small')!==null,
   controls:btns.map(x=>({id:x.id||x.getAttribute('data-go'),
     ...rect(x),icon:x.querySelector('.relic-icon')?.className,
     image:x.querySelector('.relic-icon')
       ?getComputedStyle(x.querySelector('.relic-icon')).backgroundImage:''})),
   previousNav:root.querySelector('nav [data-page="boosters"]')!==null,
   saveControls:document.querySelector('#backup-open')!==null
  };
 })()`);
 console.log('Relic header '+width+'px:',JSON.stringify(strip));
 assert.ok(strip.controls.length>=3,'Currency and Chroniques controls always exist');
 assert.ok(strip.controls.every(c=>c.width>=34&&c.height>=34),'Every module is touchable');
 assert.ok(strip.controls.every(c=>c.image.includes('header-relics.png')),'All controls use HD pixel-art relic sprites');
 assert.ok(strip.controls.at(-1).right<=width+2,'No header module overflows the viewport');
 assert.ok(strip.controls.every((c,i)=>i===0||c.left>=strip.controls[i-1].right-1),
  'Header controls do not overlap at '+width+'px');
 assert.ok(strip.brand.right<=strip.controls[0].left+2,
  'Logo is clear of the wallet at '+width+'px');
 assert.ok(strip.brandFits,'Brand is not visually cropped at '+width+'px');
 assert.equal(strip.subtitlePresent,false,'No subtitle in the top header');
 assert.equal(strip.wordmark.oldRuleDisplay,'none','Old misaligned underline stays hidden');
 assert.equal(strip.wordmark.ruleDisplay,'block','Underline is rendered below the actual title');
 assert.ok(strip.wordmark.ruleWidth>strip.wordmark.width*.84&&
  strip.wordmark.ruleWidth<strip.wordmark.width*.92,
  'Underline width follows the word, not the expanding brand container');
 const lineCenter=strip.wordmark.left+strip.wordmark.ruleMarginLeft+strip.wordmark.ruleWidth/2;
 const labelCenter=(strip.wordmark.textLeft+strip.wordmark.textRight)/2;
 assert.ok(Math.abs(lineCenter-labelCenter)<2,
  'Underline is truly centered under AETHERIUM at '+width+'px');
 assert.ok(strip.previousNav&&strip.saveControls,'Main navigation and backups unchanged');
}

for(const [width,columns] of [[390,2],[760,3],[1280,3]]){
 await command('Emulation.setDeviceMetricsOverride',{
  width,height:900,deviceScaleFactor:1,mobile:width<760
 });
 await sleep(120);
 const immersive=await evaluate(`(()=>{
  const b=document.querySelector('#immersive-toggle');
  const r=b.getBoundingClientRect();
  return {enabled:document.fullscreenEnabled,hidden:b.hidden,
   display:getComputedStyle(b).display,left:r.left,right:r.right,
   width:r.width,pressed:b.getAttribute('aria-pressed')}
 })()`);
 const scenery=await evaluate(`(()=>{
    const layer=document.querySelector('#app > .ambient-landscape');
    const app=document.querySelector('#app');
    const before=getComputedStyle(layer,'::before');
    const after=getComputedStyle(layer,'::after');
    const appBefore=getComputedStyle(app,'::before');
    const appAfter=getComputedStyle(app,'::after');
    return {
      background:getComputedStyle(layer).backgroundImage,
      beforeDisplay:before.display,beforeContent:before.content,
      afterDisplay:after.display,afterContent:after.content,
      appBeforeDisplay:appBefore.display,appAfterDisplay:appAfter.display
    };
  })()`);
 console.log('Mobile scenery '+width+'px:',JSON.stringify(scenery));
 if(width<=850){
  assert.equal(scenery.beforeDisplay,'none','No stretched left background artwork on mobile');
  assert.equal(scenery.afterDisplay,'none','No legacy overlay on mobile');
  assert.equal(scenery.appBeforeDisplay,'none','No pseudo landscape on mobile');
  assert.equal(scenery.appAfterDisplay,'none','No decorative footer artifact on mobile');
  assert.ok(!scenery.background.includes('url('),'A gentle gradient replaces mobile background art');
 }
 console.log('Immersive '+width+'px',JSON.stringify(immersive));
 if(width<=850&&immersive.enabled){
  assert.equal(immersive.hidden,false,'Supported mobile browsers have a fullscreen action');
  assert.ok(immersive.width>=40&&immersive.right<=width+2,'Fullscreen button fits mobile header');
 }else{
  assert.equal(immersive.display,'none','No useless fullscreen action on desktop');
 }
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
 const names=await evaluate(`[...document.querySelectorAll('#booster-gallery .booster-choice')].map(card=>{
  const wrapper=card.querySelector('.booster-tile-pack');
  const title=wrapper.querySelector('.pack-title');
  const caption=card.querySelector('.booster-tile-caption strong');
  const t=title.getBoundingClientRect(),p=wrapper.getBoundingClientRect();
  return {name:title.textContent,centering:getComputedStyle(title).justifyContent,
   align:getComputedStyle(title).textAlign,caption:getComputedStyle(caption).justifyContent,
   midpoint:Math.abs((t.left+t.right-p.left-p.right)/2)}
 })`);
 console.log('Booster title alignment '+width+'px:',JSON.stringify(names));
 assert.ok(names.every(n=>n.centering==='center'&&n.align==='center'&&n.caption==='center'&&n.midpoint<2),
  'All three catalog titles must be centered on every screen');
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
  const wrap=await evaluate(`(()=>{
   const pack=document.querySelector('#booster-pack');
   const scene=pack.querySelector('.pack-scene');
   const image=pack.querySelector('.pack-artwork');
   const rect=e=>{const r=e.getBoundingClientRect();return {
     width:r.width,height:r.height,left:r.left,top:r.top
   }};
   const one=document.querySelector('#booster-gallery [data-booster="origines"] .booster-tile-pack');
   const first=one.querySelector('.pack-scene img');
   const fp=first.getBoundingClientRect(),wp=one.getBoundingClientRect();
   return {premium:pack.classList.contains('reliquaire-origines'),
    imageSrc:image.getAttribute('src'),imageLoaded:image.complete&&image.naturalWidth>0,
    imageDisplay:getComputedStyle(image).display,
    scene:rect(scene),frame:rect(pack),
    artFit:getComputedStyle(image).objectFit,
    textOpacity:getComputedStyle(pack.querySelector('.pack-title')).opacity,
    catalogSrc:first.getAttribute('src'),catalogLoaded:first.complete&&first.naturalWidth>0,
    catalogInset:Math.abs(fp.width-wp.width)+Math.abs(fp.height-wp.height)}
  })()`);
  if(edition==='origines'){
   assert.equal(wrap.premium,true,'The first booster uses the premium sachet');
   assert.ok(wrap.imageSrc.endsWith('origines-unified-v5.webp'));
   assert.ok(wrap.catalogSrc.endsWith('origines-unified-v5.webp'));
   assert.ok(wrap.imageLoaded&&wrap.catalogLoaded,'Approved HD sachet must load in both views');
   assert.equal(wrap.imageDisplay,'block');
   assert.equal(wrap.artFit,'cover','Entire sachet fills the gallery and dialog');
   assert.equal(wrap.textOpacity,'0','Do not print a second title atop the real packet');
   assert.ok(Math.abs(wrap.scene.width-wrap.frame.width)<2&&
    Math.abs(wrap.scene.height-wrap.frame.height)<2,'No old central illustration crop');
   assert.ok(wrap.catalogInset<3,'Catalog displays the full premium packet');
  }else{
   assert.equal(wrap.premium,false,'Other editions preserve their existing artwork');
  }
  const alignment=await evaluate(`(()=>{
   const pack=document.querySelector('#booster-pack');
   const title=pack.querySelector('.pack-title');
   const h=document.querySelector('#booster-family-title');
   const p=pack.getBoundingClientRect(),t=title.getBoundingClientRect();
   const styles=getComputedStyle(title);
   return {centering:styles.justifyContent,textAlign:styles.textAlign,
    titleMidpointError:Math.abs((t.left+t.right-p.left-p.right)/2),
    headingCentered:getComputedStyle(h).textAlign}
  })()`);
  assert.equal(alignment.centering,'center','Physical packet title is horizontally centered');
  assert.equal(alignment.textAlign,'center');
  assert.ok(alignment.titleMidpointError<2);
  assert.equal(alignment.headingCentered,'center','Dialog heading is centered');
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
await sleep(1500);
console.log('Reveal debug',JSON.stringify(await evaluate(`(()=>{
 const s=JSON.parse(localStorage.getItem('aetherium-save-v1'));
 const root=document.querySelector('#booster-dialog');
 const grid=document.querySelector('#pulls');
 return {opened:s.opened,coins:s.coins,modalOpen:root.open,modalClass:root.className,
   gridClass:grid.className,gridNodes:grid.children.length,gridHtml:grid.innerHTML.slice(0,300),
   status:document.querySelector('#pack-msg').textContent,step:document.querySelector('#booster-step').textContent}
})()`)), 'exceptions:',JSON.stringify(jsErrors));
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

// A real Couronne reward only triggers a purely decorative short pulse.
const rewardCheck=await evaluate(`(()=>{
 const coins=document.querySelector('#coins');
 const button=coins.closest('.wallet-link');
 coins.textContent=String(Number(coins.textContent)+1);
 return {button:button.className,icon:button.querySelector('.relic-icon--crown')!==null};
})()`);
await sleep(50);
assert.equal(await evaluate("document.querySelector('#coins').closest('.wallet-link').classList.contains('is-gaining')"),true,
 'Earning resources should trigger visual feedback only');
assert.equal(rewardCheck.icon,true);
// Regression: Cerf des Lueurs uses the original Codex illustration again.
await evaluate("document.querySelector('button[data-page=\"collection\"]').click()");
await until(()=>evaluate("Boolean(document.querySelector('#page-collection.active #preview-art'))"),'Codex ready');
await evaluate("document.querySelector('#preview-art').click()");
await until(()=>evaluate("Boolean(document.querySelector('#card-grid [data-card-id=\"8\"]'))"),'Original Cerf in gallery');
await evaluate("document.querySelector('#card-grid [data-card-id=\"8\"]').click()");
await until(()=>evaluate("Boolean(document.querySelector('#inspector .inspector-art-shell img'))"),'Original inspector ready');
await until(()=>evaluate("document.querySelector('#inspector .inspector-art-shell img').complete"),'Original Cerf artwork loaded');
const originalCerf=await evaluate(`(()=>{
 const inspector=document.querySelector('#inspector');
 const img=inspector.querySelector('.inspector-art-shell img');
 return {hasPilot:!!inspector.querySelector('.pilot-card-front'),
  src:img.currentSrc||img.src,loaded:img.complete&&img.naturalWidth>300,
  width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height,
  title:inspector.querySelector('.inspector-copy h2')?.textContent};
})()`);
console.log('Original Cerf restored:',JSON.stringify(originalCerf));
assert.equal(originalCerf.hasPilot,false,'Experimental frame must be absent');
assert.equal(originalCerf.title,'Cerf des Lueurs');
assert.ok(originalCerf.src.includes('cerf-des-lueurs.webp'),'The original artwork is used');
assert.ok(originalCerf.loaded,'Original HD image loads');
assert.ok(originalCerf.width>60&&originalCerf.height>100,'Original artwork is visible');
// The shared Codex styling only changes text and stat components, never the original art.
const polish=await evaluate(`(()=>{
 const panel=document.querySelector('#inspector');
 const img=panel.querySelector('.inspector-art-shell img');
 const copy=panel.querySelector('.inspector-copy');
 return {active:panel.classList.contains('is-card-polished'),
  imageSource:img.currentSrc||img.src,imageLoaded:img.complete&&img.naturalWidth>300,
  imageSize:[img.getBoundingClientRect().width,img.getBoundingClientRect().height],
  title:copy.querySelector('h2')?.textContent,
  rarity:copy.querySelector('.kicker')?.textContent,
  lore:copy.querySelector('p:not(.kicker):not(.muted):not(.codex-inspector-chapter)')?.textContent,
  stats:copy.querySelectorAll('.stats > span').length,
  statsDisplay:getComputedStyle(copy.querySelector('.stats')).display};
})()`);
console.log('Polished Cerf on Chromium:',JSON.stringify(polish));
assert.equal(polish.active,true,'Approved shared Codex style active on Cerf');
assert.ok(polish.imageSource.includes('cerf-des-lueurs.webp'));
assert.ok(polish.imageLoaded&&polish.imageSize[0]>60&&polish.imageSize[1]>100);
assert.equal(polish.title,'Cerf des Lueurs');
assert.ok(polish.rarity.includes('Inhabituelle'),'Original rarity is still shown');
assert.ok(polish.lore.includes('souvenirs'),'Original lore is still shown');
assert.equal(polish.stats,3,'Stats keep their existing three values');
assert.equal(polish.statsDisplay,'grid','Three compact stat cells are visible');
const cerfStats=await evaluate(`(()=>{
 const panel=document.querySelector('#inspector');
 const stats=[...panel.querySelectorAll('.stats > .stat-stat')].map(s=>{
  const glyph=s.querySelector('.stat-glyph');
  const rect=glyph?.getBoundingClientRect();
  return {name:s.querySelector('.stat-name')?.textContent,
   value:Number(s.querySelector('.stat-value')?.textContent),
   icon:glyph?.getAttribute('src'),visible:!!rect && rect.width>=39 && rect.height>=39,
   loaded:glyph?.complete && glyph?.naturalWidth===144 && glyph?.naturalHeight===144};
 });
 return {stats,inventory:panel.querySelector('.stat-inventory-total')?.textContent};
})()`);
console.log('Cerf real pixel-art glyphs:',JSON.stringify(cerfStats));
assert.deepEqual(cerfStats.stats.map(s=>s.name),['Éclat','Garde','Flux']);
assert.deepEqual(cerfStats.stats.map(s=>s.value),[12,13,6]);
assert.ok(cerfStats.stats.every(s=>s.visible && s.loaded),'Three pixel-art icons must load');
assert.ok(cerfStats.stats.every(s=>/^\.\/assets\/icons\/stat-(eclat|garde|flux)-hd\.webp$/.test(s.icon)),
 'Only approved HD pixel-art images are rendered');
assert.match(cerfStats.inventory,/Possédées : ×/);

await evaluate("document.querySelector('#card-grid [data-card-id=\"7\"]').click()");
await until(()=>evaluate("(()=>{const img=document.querySelector('#inspector .inspector-art-shell img');return img?.complete && img?.naturalWidth>300})()"),'Archiviste HD artwork fully loaded');
const other=await evaluate(`(()=>{
 const panel=document.querySelector('#inspector');
 const img=panel.querySelector('.inspector-art-shell img');
 const stats=[...panel.querySelectorAll('.stats > .stat-stat')];
 return {active:panel.classList.contains('is-card-polished'),
   title:panel.querySelector('.inspector-copy h2')?.textContent,
   art:img?.currentSrc||img?.src,artLoaded:img?.complete&&img?.naturalWidth>300,
   statsDisplay:getComputedStyle(panel.querySelector('.stats')).display,
   names:stats.map(s=>s.querySelector('.stat-name')?.textContent),
   iconsLoaded:stats.every(s=>s.querySelector('img')?.complete && s.querySelector('img')?.naturalWidth===144),
   values:stats.map(s=>Number(s.querySelector('.stat-value')?.textContent)),
   inventory:panel.querySelector('.stat-inventory-total')?.textContent};
})()`);
console.log('Second card uses HD stats:',JSON.stringify(other));
assert.equal(other.active,true,'The common style applies to every revealed card');
assert.equal(other.title,'Archiviste Nocturne');
assert.ok(other.art.includes('archiviste-nocturne.webp') && other.artLoaded,
 'Each card keeps its own approved HD artwork');
assert.equal(other.statsDisplay,'grid','Three HD stat cells on every card');
assert.deepEqual(other.names,['Éclat','Garde','Flux']);
assert.ok(other.iconsLoaded,'Approved HD glyphs render on a second card');
assert.ok(other.values.every(Number.isFinite),'Stats use the corresponding card values');
assert.match(other.inventory,/Possédées : ×/);
// Experiment only, on a separate branch: no save changes or booster changes.
assert.equal(await evaluate("Boolean(document.querySelector('.recto-lab-entry .recto-lab-open'))"),true,
 'The recto test dock must be accessible');
await evaluate("document.querySelector('.recto-lab-open').click()");
await evaluate("document.querySelectorAll('.recto-lab-switch-button')[1].click()");
await until(()=>evaluate("Boolean(document.querySelector('#inspector.recto-lab-mode-new .recto-lab-card'))"),'New recto is visible');
await until(()=>evaluate("(()=>{const c=document.querySelector('#inspector .recto-lab-card');return [...c.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)})()"),'Real art and frame loaded');
const recto=await evaluate(`(()=>{
 const panel=document.querySelector('#inspector'),card=panel.querySelector('.recto-lab-card');
 const title=card.querySelector('.recto-lab-name'),art=card.querySelector('.recto-lab-illustration');
 return {name:title.textContent,objectFit:getComputedStyle(art).objectFit,art:art.currentSrc,
  frame:card.querySelector('.recto-lab-frame').naturalWidth,
  titleWidth:title.scrollWidth,maxWidth:title.parentElement.clientWidth,
  titleHeight:title.scrollHeight,maxHeight:title.parentElement.clientHeight,
  stats:[...card.querySelectorAll('.recto-lab-stat-copy strong')].map(s=>Number(s.textContent))};
})()`);
console.log('New recto preview in Chromium:',JSON.stringify(recto));
assert.equal(recto.name,'Cerf des Lueurs');
assert.equal(recto.objectFit,'contain','Original art must not be cropped or zoomed');
assert.ok(recto.art.includes('cerf-des-lueurs.webp'));
assert.ok(recto.frame>300,'Transparent frame asset loaded');
assert.ok(recto.titleWidth<=recto.maxWidth+3&&recto.titleHeight<=recto.maxHeight+3,
 'Title fits inside a single ornament');
const titleLayer=await evaluate(`(()=>{
 const card=document.querySelector('#inspector .recto-lab-card');
 const title=card.querySelector('.recto-lab-title-zone');
 const frame=card.querySelector('.recto-lab-frame');
 return {titleZ:Number(getComputedStyle(title).zIndex),
  frameZ:Number(getComputedStyle(frame).zIndex),
  contrast:getComputedStyle(title,'::before').backgroundImage,
  fullFrame:frame.currentSrc.includes('frame-integral-v5.png?v=5')};
})()`);
assert.ok(titleLayer.titleZ>titleLayer.frameZ,'Title text must sit above decorative frame');
assert.ok(titleLayer.contrast.includes('radial-gradient'),'Title is readable over illustration');
assert.equal(titleLayer.fullFrame,true,'Frame uses new cache version');
assert.deepEqual(recto.stats,[12,13,6]);
await evaluate("document.querySelector('.recto-lab-switch-button').click()");
assert.equal(await evaluate("document.querySelector('#inspector .inspector-art-shell')?.getBoundingClientRect().height>40"),true,
 'Original inspector remains visible when comparing');
await evaluate("document.querySelectorAll('.recto-lab-open')[1].click()");
await until(()=>evaluate("document.querySelector('#inspector .recto-lab-name')?.textContent.includes('Astra')"),'Long name example opened');
await evaluate("document.querySelectorAll('.recto-lab-switch-button')[1].click()");
await until(()=>evaluate("document.querySelector('#inspector .recto-lab-name')?.getBoundingClientRect().width>100"),'Astra name is visible in actual new front');
const longTitle=await evaluate(`(()=>{
 const n=document.querySelector('#inspector .recto-lab-name');
 return {name:n.textContent,width:n.scrollWidth,boxWidth:n.parentElement.clientWidth,
  height:n.scrollHeight,boxHeight:n.parentElement.clientHeight};
})()`);
console.log('Long title fit:',JSON.stringify(longTitle));
assert.ok(longTitle.boxWidth>100&&longTitle.boxHeight>20,
 'Long-name cartouche must be visible, not a hidden zero-size measurement');
assert.ok(longTitle.width<=longTitle.boxWidth+3&&longTitle.height<=longTitle.boxHeight+3,
 'Longer card names must fit their cartouche');

assert.deepEqual(jsErrors,[],'No unexpected browser JavaScript errors');
ws.close();
console.log('AETHERIUM : vrai navigateur, galerie/fiche PC tablette mobile et 3 boosters OK');
