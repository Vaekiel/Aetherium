import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const main=read('src/main.js'),css=read('src/booster.css');
const cardArt=read('src/card-art.js');
const html=read('index.html');
const start=main.indexOf('function boosterCardArtwork(item){');
const end=main.indexOf('function showBoosterCard(index',start);
assert.ok(start>0&&end>start,'The actual single-card helper is available');
const helper=main.slice(start,end);
function node(tag='',className=''){
 return {
  tagName:tag,className,children:[],
  style:{cssText:'--edge: #ffebac'},
  get firstChild(){return this.children[0]||null},
  append(child){if(child.parent){child.parent.children=child.parent.children.filter(c=>c!==child)}
   this.children.push(child);child.parent=this},
  querySelector(selector){
   for(const child of this.children){
    if(selector===child.tagName)return child;
    const nested=child.querySelector?.(selector);if(nested)return nested;
   }
   return null;
  }
 };
}
for(const shiny of [false,true]){
 const image=node('img');
 const card=node('button',shiny?'card is-chromatic':'card');
 const parent=shiny?node('span','chromatic-art-window'):card;
 parent.append(image);if(shiny)card.append(parent);
 card.append(node('div','info'));
 let applied=0;
 const runtime={
  makeCard(c,isShiny){assert.equal(c.id,4);assert.equal(isShiny,shiny);return card},
  el:node,
  applyCardIllustration(img,c,options){
   applied++;
   assert.equal(img,image);
   assert.equal(c.id,4);
   assert.deepEqual(JSON.parse(JSON.stringify(options)),{shiny,size:'full'});
   img.loading=options.size==='full'?'eager':'lazy';
   img.decoding='async'; // Mirrors shared art helper: booster must override
   img.src='./assets/cards/floraison-cendree.webp?v=20261116-unframed';
   img.onerror=()=>{img.src='fallback-art'};
  }
 };
 const result=runInNewContext(helper+
  'boosterCardArtwork({card:{id:4,name:"Floraison Cendrée"},shiny:'+shiny+'})',runtime);
 assert.equal(result.tagName,'div','Preview must not be an interactive Codex button');
 assert.equal(result.className,card.className);
 assert.equal(result.querySelector('img'),image,'Image remains inside rendered artwork');
 assert.equal(image.loading,'eager','Mobile face-up images must never be lazy');
 assert.equal(image.decoding,'sync','Android face-up illustration must decode synchronously');
 assert.equal(image.fetchPriority,'high','Visible reveal requests image promptly');
 assert.equal(applied,1,'Use the real full-size card path exactly once');
 assert.ok(image.src.includes('/floraison-cendree.webp'));
 assert.equal(typeof image.onerror,'function','Existing fallback remains attached');
 assert.ok(result.querySelector('div'),'Card name and rarity info remain visible');
}
assert.ok(cardArt.includes("floraison-cendree.webp"),'The pictured card has a full-size art entry');
assert.ok(cardArt.includes("img.onerror=()=>"),'Missing images fall back without crashing the reveal');
const begin=css.indexOf('AETHERIUM 1.8.2.1 — Android / WebView image reveal fix');
assert.ok(begin>0,'The WebView-specific presentation fix must be present');
const patched=css.slice(begin);
assert.ok(patched.includes('transform-style:flat'));
assert.ok(patched.includes('backface-visibility:visible'));
assert.ok(patched.includes('visibility:visible'));
assert.ok(patched.includes('.pull-flip.is-revealed .pull-front'));
assert.ok(patched.includes('.pull-front .card img'));
assert.ok(patched.includes('object-fit:cover'));
assert.ok(patched.includes('prefers-reduced-motion:reduce'));
assert.ok(!/rotateY\(/.test(patched),'Revealed mobile image must not rotate in a 3D compositing layer');
for(const text of [
 'state.coins-=PACK_PRICE','state.opened++','state.dust+=5',
 'update(); // Persists the purchase',
 'boosterGrid.classList.add(\'booster-gallery\')']){
 assert.ok(main.includes(text),'The original game economy/persistence remains unchanged: '+text);
}
assert.ok(html.includes('src/main.js?v=booster-reveal-fix-1821'),
  'New JavaScript is not served from the cached broken version');
assert.ok(html.includes('src/booster.css?v=booster-reveal-fix-1821'),
  'New 2D presentation is not masked by old cached CSS');
console.log('AETHERIUM 1.8.2.1 — mobile reveal: full HD art, eager sync, shiny and normal, 2D face, economy OK');
