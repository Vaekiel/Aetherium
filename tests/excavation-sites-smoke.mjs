import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=file=>readFileSync(file,'utf8');
const imports=file=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(file)));
const {EXCAVATION_SIDE,EXCAVATION_TRAPS,EXCAVATION_SITES,
  makeExcavationSite,countExcavationNeighbors,chooseExcavationGuide}=
  await imports('src/excavation-sites.js');
const {trialRules,trialReward}=await imports('src/trial-progress.js');
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
assert.equal(EXCAVATION_SIDE,5);
assert.equal(EXCAVATION_TRAPS,5);
assert.equal(EXCAVATION_SITES.length,3);
for(const template of EXCAVATION_SITES){
 assert.equal(template.traps.length,5);
 assert.equal(new Set(template.traps).size,5);
 assert.ok(template.title&&template.description&&template.artifact);
}
const seen=new Set();
for(let seed=1;seed<=300;seed++){
 const site=makeExcavationSite(null,rng(seed*17));
 seen.add(site.id);
 assert.equal(site.numbers.length,25);
 assert.equal(site.bombs.size,5);
 assert.ok([...site.bombs].every(index=>Number.isInteger(index)&&index>=0&&index<25));
 assert.equal(site.bombs.has(site.entrance),false,'Marked entrance can never be trapped');
 assert.equal(site.numbers[site.entrance],0,'The entrance always has no trapped neighbors');
 assert.equal(site.bombs.has(site.artifactIndex),false,'Optional find is always harmless');
 assert.notEqual(site.artifactIndex,site.entrance);
 for(let index=0;index<25;index++)
   assert.equal(site.numbers[index],countExcavationNeighbors(site.bombs,index),
     'Every numeric tile counts its eight adjacent traps accurately');
 const dug=new Set();
 for(let turn=0;turn<20;turn++){
   const guided=chooseExcavationGuide(site,dug,rng(seed+turn));
   assert.ok(guided&&guided.index>=0&&guided.index<25);
   assert.equal(site.bombs.has(guided.index),false,'Sonde never marks a trap');
   assert.equal(dug.has(guided.index),false,'Sonde never repeats an opened tile');
   if(guided.deduction){
     const x=guided.index%5,y=Math.floor(guided.index/5);
     let emptyNeighbor=false;
     for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
       const xx=x+dx,yy=y+dy;
       if((dx||dy)&&xx>=0&&xx<5&&yy>=0&&yy<5&&
         dug.has(yy*5+xx)&&site.numbers[yy*5+xx]===0)emptyNeighbor=true;
     }
     assert.equal(emptyNeighbor,true,'Reasoned safe tiles neighbor an opened zero');
   }
   dug.add(guided.index);
 }
 assert.equal(chooseExcavationGuide(site,dug),null,'Guide stops after all safe tiles are excavated');
 const next=makeExcavationSite(site.id,rng(seed+999));
 assert.notEqual(next.id,site.id,'The next dig visits a different site');
}
assert.equal(seen.size,3,'All three archaeological landscapes appear');
assert.deepEqual([0,1,2].map(n=>trialRules(3,['initiation','aventure','maitrise'][n]).safeTarget),
 [8,10,12],'The original difficulty objectives are preserved');
assert.equal(trialReward(65,'initiation',80),65,'Base reward unchanged');

function node(tag='div',classes='',textContent=''){
 const set=new Set(classes.split(/\s+/).filter(Boolean));
 const el={tagName:tag,children:[],parent:null,dataset:{},textContent,disabled:false,
  attrs:{},events:{},style:{setProperty(){}},
  classList:{
    add(...names){names.forEach(name=>set.add(name))},
    remove(...names){names.forEach(name=>set.delete(name))},
    contains(name){return set.has(name)},
    toggle(name,on){const active=on===undefined?!set.has(name):on;
      if(active)set.add(name);else set.delete(name);return active}
  },
  setAttribute(name,value){el.attrs[name]=String(value)},
  getAttribute(name){return el.attrs[name]??null},
  append(...children){for(const child of children){child.parent=el;el.children.push(child)}},
  replaceChildren(...children){el.children=[];el.append(...children)},
  before(...children){const at=el.parent?.children.indexOf(el);
    if(at===undefined||at<0)throw Error('Unattached element');
    el.parent.children.splice(at,0,...children);for(const child of children)child.parent=el},
  querySelector(selector){const name=selector.replace(/^\./,'');
   const walk=parent=>{for(const child of parent.children){
     if(child.classList.contains(name))return child;
     const result=walk(child);if(result)return result;
   }return null};return walk(el)},
  querySelectorAll(selector){const name=selector.replace(/^\./,'');const found=[];
   const walk=parent=>{for(const child of parent.children){
     if(child.classList.contains(name))found.push(child);
     walk(child);
   }};walk(el);return found},
  addEventListener(name,listener){(el.events[name]??=[]).push(listener)},
  click(){if(!el.disabled)for(const listener of el.events.click??[])listener()}
 };
 return el;
}
const main=read('src/main.js');
const start=main.indexOf('let previousExcavationSite=null;');
const end=main.indexOf('const ingredients=',start);
assert.ok(start>=0&&end>start,'Real excavation controller remains isolated');
const controller=main.slice(start,end);
assert.ok(main.includes("from './excavation-sites.js'"));
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
assert.ok(main.includes('reward:65'));
assert.ok(controller.includes('if(safe===safeTarget)'));
assert.ok(controller.includes("complete(3,'Fouille accomplie !"));
assert.ok(controller.includes("const countNearby=i=>site.numbers[i]"));
assert.ok(controller.includes('const hint=chooseExcavationGuide(site,dug)'));
assert.ok(controller.includes('i===site.artifactIndex'));
assert.ok(controller.includes("g.card.dataset.excavationSite=site.id"));

function exercise(mode,{trap=false}={}){
 const site=makeExcavationSite(null,rng(mode==='maitrise'?901:mode==='aventure'?772:125));
 const card=node('article','game'),board=node('div','board'),
   status=node('div','status'),actions=node('div','actions');
 card.append(board,status,actions);
 const game={card,board,status,actions,mode:null,ended:false};
 const completions=[];
 const sandbox={
   mini:[null,null,null,game],state:{difficulty:mode},
   makeExcavationSite(){return site},chooseExcavationGuide,trialRules,
   el:node,$:(selector,root)=>root.querySelector(selector),
   button(text,fn,kind='secondary'){const b=node('button',kind,text);
     b.addEventListener('click',fn);return b},
   complete(index,description,performance){completions.push({index,description,performance});game.ended=true}
 };
 runInNewContext(controller+'startMines()',sandbox);
 const tiles=board.children;
 assert.equal(tiles.length,25);
 assert.equal(board.attrs.role,'group');
 assert.equal(card.dataset.excavationSite,site.id);
 assert.equal(card.querySelector('.excavation-site-name').textContent,site.title);
 const sonde=actions.children[0],restart=actions.children[1];
 assert.ok(sonde.textContent.includes('Sonder'));
 assert.ok(restart.textContent.includes('Nouvelle'));
 assert.ok(tiles[site.entrance].classList.contains('is-guided'));
 assert.equal(tiles[site.entrance].disabled,false);
 if(trap){
   tiles[[...site.bombs][0]].click();
   assert.equal(game.ended,true,'Triggering a trap ends excavation immediately');
   assert.equal(sonde.disabled,true);
   assert.equal(tiles.filter(tile=>tile.classList.contains('is-trap')).length,5);
   assert.equal(completions.length,0);
   sonde.click();tiles[site.entrance].click();
   assert.equal(completions.length,0,'A failed dig cannot award currency');
   return;
 }
 tiles[site.entrance].click();
 assert.equal(tiles[site.entrance].classList.contains('is-safe'),true);
 assert.equal(tiles[site.entrance].disabled,true);
 assert.equal(card.querySelector('.excavation-counter').textContent.startsWith('1 / '),true);
 // A cosmetic relic has no additional wallet reward or required condition.
 tiles[site.artifactIndex].click();
 assert.equal(tiles[site.artifactIndex].classList.contains('is-artifact'),true);
 assert.ok(card.querySelector('.excavation-artifact-note').textContent.includes(site.artifact));
 assert.equal(completions.length,0);
 const target=trialRules(3,mode).safeTarget;
 let clicks=2;
 while(clicks<target){
   sonde.click();
   const safeTile=tiles.find(tile=>tile.classList.contains('is-guided'));
   assert.ok(safeTile,'The free guide always marks a selectable safe tile');
   const index=tiles.indexOf(safeTile);
   assert.equal(site.bombs.has(index),false);
   safeTile.click();
   clicks++;
 }
 assert.equal(game.ended,true,'The original safe-target victory remains');
 assert.equal(completions.length,1,'One victory only');
 assert.equal(completions[0].index,3);
 assert.equal(completions[0].performance.hints,target-2,'Only manually requested probes enter the personal record');
 assert.equal(sonde.disabled,true,'No more scans after victory');
 assert.equal(card.querySelector('.excavation-counter').textContent,
   target+' / '+target+' cases sûres');
 sonde.click();
 tiles.find(tile=>site.bombs.has(tiles.indexOf(tile))).click();
 assert.equal(completions.length,1,'No reward can be repeated after completion');
}
for(const mode of ['initiation','aventure','maitrise']){
 exercise(mode);
 exercise(mode,{trap:true});
}
const css=read('src/mines.css'),html=read('index.html');
assert.ok(css.includes('.excavation-tile.is-guided'));
assert.ok(css.includes('.excavation-site-panel'));
assert.ok(css.includes('.excavation-tile.is-artifact'));
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(html.includes('src/main.js?v=titres-1.7.3'));
assert.ok(html.includes('src/mines.css?v=fouilles-1.7.2'));
console.log('AETHERIUM 1.7.2 — Fouilles : 300 cartes justes, sonde sûre, vestiges, objectifs et clics réels OK');
