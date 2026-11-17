import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=path=>readFileSync(path,'utf8');
const moduleFor=path=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(path)));
const {MEMORY_RITUALS,memoryRitualsFor,nextMemoryRitual,buildMemoryDeck}=
  await moduleFor('src/memory-rituals.js');
const {trialRules}=await moduleFor('src/trial-progress.js');
const names=Array.from({length:8},(_,i)=>({id:'sym-'+i,label:'Rune '+i,sprite:i+1}));
const shuffle=list=>[...list].reverse();
assert.deepEqual(memoryRitualsFor('initiation').map(r=>r.id),['guided']);
assert.deepEqual(memoryRitualsFor('aventure').map(r=>r.id),['ancient','echoes']);
assert.deepEqual(memoryRitualsFor('maitrise').map(r=>r.id),['ancient','glimpse']);
assert.equal(nextMemoryRitual('aventure','ancient',()=>0).id,'echoes');
assert.equal(nextMemoryRitual('aventure','echoes',()=>0).id,'ancient');
assert.equal(nextMemoryRitual('maitrise','ancient',()=>0).id,'glimpse');
assert.equal(nextMemoryRitual('maitrise','glimpse',()=>0).id,'ancient');
assert.equal(nextMemoryRitual('initiation','guided',()=>0).id,'guided');
for(const ritual of MEMORY_RITUALS){
 const deck=buildMemoryDeck(names,ritual,shuffle);
 assert.equal(deck.length,16);
 assert.equal(new Set(deck.map(t=>t.key)).size,16);
 for(const name of names)assert.equal(deck.filter(t=>t.id===name.id).length,2,
   'Every ritual preserves two copies of '+name.id);
 if(ritual.id==='guided')for(let row=0;row<4;row++){
   const subset=deck.slice(row*4,row*4+4);
   assert.equal(new Set(subset.map(tile=>tile.id)).size,2,'Two complete pairs per guided row');
   for(const id of new Set(subset.map(tile=>tile.id)))
     assert.equal(subset.filter(tile=>tile.id===id).length,2);
 }
 if(ritual.id==='echoes')for(const name of names){
   assert.equal(deck.slice(0,8).filter(t=>t.id===name.id).length,1);
   assert.equal(deck.slice(8).filter(t=>t.id===name.id).length,1);
 }
 assert.ok(ritual.title.length>8&&ritual.rule.length>20);
}
assert.throws(()=>buildMemoryDeck([],MEMORY_RITUALS[0],shuffle));

function element(tag='div',classes='',textContent=''){
 const classSet=new Set(classes.split(/\s+/).filter(Boolean));
 const el={tagName:tag,textContent,children:[],parent:null,dataset:{},attrs:{},
  disabled:false,events:{},styles:{},style:{setProperty(name,value){el.styles[name]=value}},
  classList:{
   add(...args){args.forEach(x=>classSet.add(x))},
   remove(...args){args.forEach(x=>classSet.delete(x))},
   contains(name){return classSet.has(name)},
   toggle(name,force){const value=force===undefined?!classSet.has(name):force;
     if(value)classSet.add(name);else classSet.delete(name);return value}
  },
  setAttribute(name,value){el.attrs[name]=String(value)},
  append(...nodes){for(const child of nodes){child.parent=el;el.children.push(child)}},
  replaceChildren(...nodes){el.children=[];el.append(...nodes)},
  before(...nodes){const pos=el.parent?.children.indexOf(el);
   if(pos<0||pos===undefined)throw Error('Element not mounted');
   el.parent.children.splice(pos,0,...nodes);for(const node of nodes)node.parent=el},
  querySelector(selector){
   const name=selector.replace(/^\./,'');
   const search=parent=>{for(const child of parent.children){
    if(child.classList.contains(name))return child;
    const found=search(child);if(found)return found;
   }return null};return search(el)
  },
  querySelectorAll(selector){
   const name=selector.replace(/^\./,'');const result=[];
   const search=parent=>{for(const child of parent.children){
    if(child.classList.contains(name))result.push(child);
    search(child);
   }};search(el);return result;
  },
  addEventListener(name,cb){(el.events[name]??=[]).push(cb)},
  click(){if(!el.disabled)for(const cb of el.events.click??[])cb()}
 };
 return el;
}
const source=read('src/main.js');
const from=source.indexOf('const memoryRunes=');
const until=source.indexOf('/* Serrure d\'Éther',from);
assert.ok(from>=0&&until>from,'Actual memory controller exists');
const code=source.slice(from,until);
assert.ok(code.includes('buildMemoryDeck(memoryRunes,ritual,shuffle)'));
assert.ok(code.includes('memory-fresco-piece'));
assert.ok(code.includes('if(session!==memorySession||g.ended)return'));
assert.ok(source.includes("const SAVE='aetherium-save-v1'"));
assert.ok(source.includes('reward:45'));
const originalRunes=[
 {id:'sun',label:'Soleil'},{id:'moon',label:'Lune'},{id:'stars',label:'Constellations'},
 {id:'eye',label:'Œil ancien'},{id:'spiral',label:'Spirale'},
 {id:'tree',label:'Arbre-mémoire'},{id:'compass',label:'Rose des vents'},
 {id:'flare',label:'Étoiles jumelles'}
];
function exercise(mode,ritualId,{wrong=false,fail=false,restart=false}={}){
 const card=element('article','game'),board=element('div','board'),
  status=element('div','status'),actions=element('div','actions');
 card.append(board,status,actions);
 const game={card,board,status,actions,mode:null,ended:false};
 const timers=new Map();let nextTimer=1;const completed=[];
 const ctx={
  mini:[null,game],state:{difficulty:mode},trialRules,el:element,
  $:(query,root)=>root.querySelector(query),
  $$:(query,root)=>root.querySelectorAll(query),
  shuffle,
  nextMemoryRitual(currentMode){const ritual=MEMORY_RITUALS.find(r=>r.id===ritualId);
   assert.ok(memoryRitualsFor(currentMode).includes(ritual));return ritual},
  buildMemoryDeck,
  setTimeout(fn,ms){const id=nextTimer++;timers.set(id,{fn,ms});return id},
  clearTimeout(id){timers.delete(id)},
  button(text,cb,cls='secondary'){const b=element('button',cls,text);
    b.addEventListener('click',cb);return b},
  complete(index,message,stats){completed.push({index,message,stats});game.ended=true}
 };
 runInNewContext(code+'startMemory()',ctx);
 const flush=()=>{const entries=[...timers.values()];timers.clear();entries.forEach(t=>t.fn())};
 assert.equal(board.children.length,16,'Sixteen playable tablets');
 assert.equal(card.querySelector('.memory-ritual-title').textContent,
  MEMORY_RITUALS.find(r=>r.id===ritualId).title);
 assert.equal(card.querySelector('.memory-fresco-piece'),card.querySelectorAll('.memory-fresco-piece')[0]);
 assert.equal(card.querySelectorAll('.memory-fresco-piece').length,8,'Eight fresco pieces');
 assert.ok(card.querySelector('.memory-fresco-count').textContent.includes('0 / 8'));
 if(ritualId==='glimpse'){
  assert.equal(board.classList.contains('is-previewing'),true);
  board.children[0].click();
  assert.equal(board.children[0].disabled,false,'Cannot touch cards during opening glimpse');
  assert.equal(timers.size,1,'Opening glimpse has an active timeout');
  if(restart){
   actions.children[0].click();
   assert.equal(timers.size,1,'Old preview timer is cancelled on restart');
  }
  flush();
  assert.equal(board.classList.contains('is-previewing'),false);
 }else assert.equal(board.classList.contains('is-previewing'),false);
 const tiles=board.children;
 const firstDifferent=()=>tiles.find(t=>t.dataset.id!==tiles[0].dataset.id);
 if(fail){
  const max=trialRules(1,mode).maxMoves;
  assert.equal(max,16);
  for(let i=0;i<max;i++){
   tiles[0].click();firstDifferent().click();flush();
  }
  assert.equal(game.ended,true,'Mastery fails at its original sixteen-move cap');
  assert.equal(completed.length,0);
  assert.ok(status.classList.contains('is-failed'));
  tiles[0].click();assert.equal(completed.length,0,'Failed run cannot grant another victory');
  return;
 }
 if(wrong){
  tiles[0].click();firstDifferent().click();
  assert.equal(timers.size,1);
  flush();
  assert.equal(tiles[0].disabled,false,'Wrong tablets can be retried');
 }
 for(const name of originalRunes){
  const pair=tiles.filter(t=>t.dataset.id===name.id);
  assert.equal(pair.length,2);
  pair.forEach(t=>t.click());
  assert.ok(pair.every(t=>t.classList.contains('is-matched')));
 }
 assert.equal(completed.length,1,'Eight matching pairs complete the game once');
 assert.equal(completed[0].index,1);
 assert.equal(completed[0].stats.moves,wrong?9:8);
 assert.equal(completed[0].stats.errors,wrong?1:0);
 assert.equal(card.querySelectorAll('.memory-fresco-piece').filter(t=>t.classList.contains('is-revealed')).length,8);
 assert.equal(card.querySelector('.memory-fresco').classList.contains('is-restored'),true);
 assert.ok(card.querySelector('.memory-fresco-count').textContent.includes('8 / 8'));
 tiles[0].click();assert.equal(completed.length,1,'Win cannot be credited twice');
}
exercise('initiation','guided',{wrong:true});
exercise('aventure','ancient',{wrong:true});
exercise('aventure','echoes');
exercise('maitrise','ancient');
exercise('maitrise','glimpse',{restart:true});
exercise('maitrise','ancient',{fail:true});
const html=read('index.html'),css=read('src/memory.css');
assert.ok(html.includes('src/main.js?v=titres-1.7.3'));
assert.ok(html.includes('src/memory.css?v=memoire-1.7.2'));
assert.ok(css.includes('.memory-board.is-previewing'));
assert.ok(css.includes('dusk-horizon.webp'));
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(css.includes('prefers-reduced-motion'));
console.log('AETHERIUM 1.7.2 — Mémoire ancienne : 4 rituels, fresque, aperçu, relance, victoires et échecs OK');
