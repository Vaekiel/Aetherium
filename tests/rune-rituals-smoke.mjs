import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(path,'utf8');
const moduleSource=path=>'data:text/javascript;charset=utf-8,'+encodeURIComponent(read(path));
const {RUNE_RITUALS,runeRitualsFor,nextRuneRitual,runeExpectedAt}=
  await import(moduleSource('src/rune-rituals.js'));
const {trialRules}=await import(moduleSource('src/trial-progress.js'));

assert.deepEqual(runeRitualsFor('initiation').map(x=>x.id),['ascendant']);
assert.deepEqual(runeRitualsFor('aventure').map(x=>x.id),['ascendant','descendant','alternance']);
assert.deepEqual(runeRitualsFor('maitrise').map(x=>x.id),['ascendant','descendant','miroir','alternance','convergence']);
assert.deepEqual(runeRitualsFor('aventure-inconnu').map(x=>x.id),['ascendant','descendant','alternance']);
assert.deepEqual(RUNE_RITUALS.map(r=>r.order.length),[12,12,12,12,12]);
for(const ritual of RUNE_RITUALS){
  assert.equal(new Set(ritual.order).size,12,'Each ritual uses every rune exactly once');
  assert.deepEqual([...ritual.order].sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i+1));
  assert.ok(ritual.title&&ritual.rule,'Rules are explained before playing');
  assert.equal(runeExpectedAt(ritual,0),ritual.order[0]);
  assert.equal(runeExpectedAt(ritual,11),ritual.order[11]);
  assert.equal(runeExpectedAt(ritual,12),null);
  assert.equal(Object.isFrozen(ritual.order),true);
}
assert.deepEqual([...RUNE_RITUALS[0].order],Array.from({length:12},(_,i)=>i+1));
assert.deepEqual([...RUNE_RITUALS[1].order],Array.from({length:12},(_,i)=>12-i));
assert.deepEqual([...RUNE_RITUALS[2].order],[1,12,2,11,3,10,4,9,5,8,6,7]);
assert.equal(nextRuneRitual('initiation','ascendant',()=>1).id,'ascendant');
assert.equal(nextRuneRitual('aventure','ascendant',()=>0).id,'descendant');
assert.equal(nextRuneRitual('aventure','descendant',()=>1).id,'alternance');
assert.equal(nextRuneRitual('maitrise','ascendant',()=>0).id,'descendant');
assert.equal(nextRuneRitual('maitrise','ascendant',()=>1).id,'convergence');
assert.equal(nextRuneRitual('maitrise','miroir',()=>1).id,'convergence');
let previous=null;
for(let i=0;i<200;i++){
 const ritual=nextRuneRitual('maitrise',previous,()=>i/200);
 assert.notEqual(ritual.id,previous,'Repeating a grille varies the pattern when possible');
 previous=ritual.id;
}

// Execute the actual startRunes() and click handlers against a minimal DOM.
// This protects against subtle cursor/progress regressions in both ascending and non-ascending paths.
const main=read('src/main.js');
const start=main.indexOf('const runeNames=');
const end=main.indexOf('const memoryRunes=',start);
assert.ok(start>=0&&end>start,'Rune controller extraction points still exist');
const controller=main.slice(start,end);
function element(tag='div',cls='',textContent=''){
 const classNames=new Set(cls.split(/\s+/).filter(Boolean));
 const node={
  tagName:tag,children:[],parent:null,textContent,disabled:false,
  attrs:{},events:{},styles:{},title:'',
  classList:{
    add(...names){names.forEach(name=>classNames.add(name))},
    remove(...names){names.forEach(name=>classNames.delete(name))},
    contains(name){return classNames.has(name)},
    toggle(name,on){const shouldAdd=on===undefined?!classNames.has(name):on;
      if(shouldAdd)classNames.add(name);else classNames.delete(name);return shouldAdd}
  },
  style:{setProperty(name,value){node.styles[name]=value}},
  setAttribute(name,value){node.attrs[name]=String(value)},
  append(...nodes){for(const child of nodes){child.parent=node;node.children.push(child)}},
  replaceChildren(...nodes){node.children=[];node.append(...nodes)},
  before(...nodes){const index=node.parent?.children.indexOf(node)??-1;
    if(index<0)throw Error('before(): missing parent');
    node.parent.children.splice(index,0,...nodes);
    for(const child of nodes)child.parent=node;
  },
  addEventListener(type,callback){(node.events[type]??=[]).push(callback)},
  click(){if(!node.disabled)for(const callback of node.events.click??[])callback()},
  querySelector(selector){const sought=selector.replace(/^\./,'');
    const walk=item=>{for(const child of item.children){if(child.classList.contains(sought))return child;
      const nested=walk(child);if(nested)return nested;}return null};
    return walk(node)
  }
 };
 return node;
}
function instantiate(mode,forceOrderId,wrongFirst=false){
 const card=element('article','game'),board=element('div','board'),
  status=element('div','status'),actions=element('div','actions');
 card.append(board,status,actions);
 const g={card,board,status,actions,mode:'aventure',ended:false};
 const context={
  mini:[g],state:{difficulty:mode},trialRules,completeCalls:[],
  el:element,$:(sel,root)=>root.querySelector(sel),
  button(text,handler,cls='secondary'){const b=element('button',cls,text);
    b.addEventListener('click',handler);return b;},
  nextRuneRitual(difficulty,previousId){
    const candidate=RUNE_RITUALS.find(ritual=>ritual.id===forceOrderId);
    assert.ok(runeRitualsFor(difficulty).includes(candidate));
    return candidate;
  },runeExpectedAt,shuffle:arr=>arr.slice().reverse(),
  complete(index,text,perf){context.completeCalls.push({index,text,perf});g.ended=true},
  setTimeout(){return null}
 };
 vm.runInNewContext(controller+'startRunes()',context);
 const tiles=board.children;
 assert.equal(tiles.length,12);
 const ritual=RUNE_RITUALS.find(x=>x.id===forceOrderId);
 const nextForValue=v=>tiles.find(t=>t.attrs['aria-label'].startsWith('Rune '+v+' sur 12'));
 assert.ok(card.querySelector('.rune-ritual-name').textContent===ritual.title);
 assert.ok(card.querySelector('.rune-ritual-rule').textContent===ritual.rule);
 if(mode==='maitrise')assert.ok(card.querySelector('.rune-target').textContent.includes('Étape 01'));
 else assert.ok(card.querySelector('.rune-target').textContent.includes(String(ritual.order[0]).padStart(2,'0')));
 if(wrongFirst){
   const bad=tiles.find(t=>!t.attrs['aria-label'].startsWith('Rune '+ritual.order[0]+' sur 12'));
   bad.click();assert.equal(context.completeCalls.length,0);
   assert.ok(status.textContent.includes('1/'+trialRules(0,mode).maxErrors));
   if(mode==='maitrise')assert.ok(!status.textContent.includes('rune '+ritual.order[0]));
 }
 for(const value of ritual.order){
  const target=nextForValue(value);
  assert.ok(target,'Missing rune '+value);
  target.click();
  assert.equal(target.disabled,true,'Correct rune cannot be counted twice');
  target.click();
 }
 assert.equal(context.completeCalls.length,1,'Exactly one victory after twelve unique runes');
 assert.equal(context.completeCalls[0].index,0);
 assert.equal(context.completeCalls[0].perf.errors,wrongFirst?1:0);
 assert.ok(card.querySelector('.rune-target').textContent.includes('12 / 12'));
 const filled=card.querySelector('.rune-meter').children.filter(t=>t.classList.contains('filled'));
 assert.equal(filled.length,12,'Every meter segment fills even in descending or mirrored order');
 return {g,tiles,context};
}
instantiate('initiation','ascendant');
instantiate('aventure','ascendant',true);
instantiate('aventure','descendant',true);
instantiate('maitrise','ascendant',true);
instantiate('maitrise','descendant',true);
instantiate('maitrise','miroir',true);
instantiate('aventure','alternance',true);
instantiate('maitrise','alternance',true);
instantiate('maitrise','convergence',true);
assert.deepEqual([...RUNE_RITUALS[3].order],[1,3,5,7,9,11,2,4,6,8,10,12]);
assert.deepEqual([...RUNE_RITUALS[4].order],[6,7,5,8,4,9,3,10,2,11,1,12]);

// Failure path must not grant a win, and no clicks can resume the failed grille.
{
 const card=element('article','game'),board=element('div','board'),
  status=element('div','status'),actions=element('div','actions');
 card.append(board,status,actions);
 const g={card,board,status,actions,mode:'aventure',ended:false};
 const ctx={
  mini:[g],state:{difficulty:'maitrise'},trialRules,el:element,
  $:(s,root)=>root.querySelector(s),
  button(text,handler,cls='secondary'){const b=element('button',cls,text);b.addEventListener('click',handler);return b},
  nextRuneRitual:()=>RUNE_RITUALS[2],runeExpectedAt,shuffle:arr=>arr.slice(),
  complete(){throw Error('A failed ritual must never reward a victory')},
  setTimeout(){return null}
 };
 vm.runInNewContext(controller+'startRunes()',ctx);
 const wrong=board.children.find(t=>t.attrs['aria-label'].startsWith('Rune 3 sur 12'));
 wrong.click();wrong.click();
 assert.equal(g.ended,true,'Mastery still fails after two errors');
 assert.ok(status.classList.contains('is-failed'));
 const text=status.textContent;
 const correct=board.children.find(t=>t.attrs['aria-label'].startsWith('Rune 1 sur 12'));
 correct.click();
 assert.equal(status.textContent,text,'Failed grille cannot advance after its error budget');
}
console.log('AETHERIUM 1.7.2 — 5 parcours runiques résolubles, niveaux et clics réels testés');
