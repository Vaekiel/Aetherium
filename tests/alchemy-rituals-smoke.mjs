import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=file=>readFileSync(file,'utf8');
const load=file=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(file)));
const {ALCHEMY_ESSENCES,ALCHEMY_MODES,ALCHEMY_RECIPE_COUNT,alchemyClue,recipeIndex,
 sanitizeAlchemyKnown,rememberAlchemyRecipe}=await load('src/alchemy-rituals.js');
const {trialRules}=await load('src/trial-progress.js');
const originalRecipes=[
 ['Élixir de Vie',[0,4]],['Sérum solaire',[1,2]],['Souffle lunaire',[3,5]],
 ['Sève d’Aurore',[0,1]],['Nectar cristallin',[2,4]]
];
assert.equal(ALCHEMY_ESSENCES.length,6);
assert.equal(ALCHEMY_RECIPE_COUNT,20);
assert.equal(Object.keys(ALCHEMY_MODES).length,3);
for(const mode of ['initiation','aventure']){
 for(let variant=0;variant<=2;variant++)for(const recipe of originalRecipes){
   const clue=alchemyClue(mode,recipe,variant);
   assert.equal(clue.answerCount,1,'Exactly one valid recipe for '+recipe[0]+' in '+mode);
   assert.deepEqual(clue.required,recipe[1]);
   assert.equal(clue.mode,mode);
   assert.ok(clue.detail.length>35);
   assert.equal(clue.detail.includes('undefined'),false);
 }
}
for(const recipe of [
 ['Couronne des Trois Saisons',[0,1,5]],['Essence du Verre',[0,2,5]],
 ['Sceau de l’Équinoxe',[1,3,4]],['Sève des Constellations',[0,1,2]],
 ['Prisme du Crépuscule',[2,3,4]],['Aube des Ronces',[0,3,5]],
 ['Couronne du Solstice',[1,4,5]],['Rituel des Trois Astres',[1,2,3]]
]){
 for(let variant=0;variant<=5;variant++){
  const clue=alchemyClue('maitrise',recipe,variant);
  assert.equal(clue.answerCount,1,'Mastery clue is always uniquely solvable');
  assert.deepEqual(clue.required,recipe[1]);
  assert.ok(clue.detail.includes('trois essences'));
 }
}
assert.throws(()=>alchemyClue('maitrise',['test',[0,0]]));
assert.equal(alchemyClue('unknown',originalRecipes[0]).mode,'aventure');
assert.throws(()=>alchemyClue('maitrise',originalRecipes[0]),'Old pairs cannot be selected in Mastery');
assert.throws(()=>alchemyClue('aventure',['Un trio',[0,1,2]]));
assert.equal(recipeIndex(originalRecipes,'Sève d’Aurore'),3);
assert.equal(recipeIndex(originalRecipes,'unknown'),-1);
assert.deepEqual(sanitizeAlchemyKnown([3,1,1,25,-1,2.5,4,'0',0]),[0,1,3,4]);
assert.deepEqual(sanitizeAlchemyKnown([19,12,19,0,20]),[0,12,19]);
assert.deepEqual(sanitizeAlchemyKnown({1:true}),[]);
assert.deepEqual(rememberAlchemyRecipe([2],2),[2]);
assert.deepEqual(rememberAlchemyRecipe([2],4),[2,4]);
assert.deepEqual(rememberAlchemyRecipe([2],-1),[2]);
assert.deepEqual([0,1,2].map(i=>trialRules(4,['initiation','aventure','maitrise'][i]).maxErrors),
 [5,3,2],'Original error budgets preserved');
const main=read('src/main.js');
assert.ok(main.includes('reward:60'));
assert.ok(main.includes("const SAVE='aetherium-save-v1'"));
assert.ok(main.includes("s.alchemyKnown=sanitizeAlchemyKnown(raw.alchemyKnown)"),
 'The old save key reads a validated expanded formula catalogue');
assert.ok(main.includes("state.alchemyKnown=remembered")&&main.includes("save(); // Preserve discoveries immediately"),
 'Recipes persist immediately, even when a trial is interrupted');
assert.ok(main.includes("shuffle(recipes.filter(recipe=>recipe[1].length===requiredIngredients)).slice(0,3)"));
assert.ok(main.includes("g.mode==='maitrise'?3:2"));
assert.ok(main.includes('slot.hidden=index>=requiredIngredients'));
assert.ok(main.includes("from './alchemy-rituals.js'"));
const asState=(values)=>{
 const start=main.slice(main.indexOf('const fresh='),main.indexOf('function load(){'));
 const loader=main.slice(main.indexOf('function load(){'),main.indexOf('let state=load();'));
 return runInNewContext(start+loader+'load()',{
   CARDS:[],SAVE:'aetherium-save-v1',
   sanitizeMilestoneClaims:raw=>raw??{},sanitizeAlchemyKnown,
   localStorage:{getItem:()=>JSON.stringify(values)}
 });
};
const legacy=asState({coins:192,dust:44,wins:3,earned:200,opened:8,owned:{},
 difficulty:'maitrise',alchemyKnown:undefined});
assert.equal(legacy.coins,192);
assert.equal(legacy.dust,44);
assert.equal(legacy.difficulty,'maitrise');
assert.deepEqual(Array.from(legacy.alchemyKnown),[]);
const migrated=asState({coins:100,dust:10,alchemyKnown:[3,0,3,55,'1',-1,18]});
assert.deepEqual(Array.from(migrated.alchemyKnown),[0,3,18],'Existing and new IDs survive reload');
assert.equal(migrated.coins,100);

function element(tag='div',cls='',txt=''){
 const set=new Set(cls.split(/\s+/).filter(Boolean));
 const node={tagName:tag,children:[],parent:null,dataset:{},attrs:{},events:{},
  disabled:false,textContent:txt,style:{setProperty(){}},
  classList:{
    add(...names){names.forEach(name=>set.add(name))},
    remove(...names){names.forEach(name=>set.delete(name))},
    contains(name){return set.has(name)},
    toggle(name,on){const should=on===undefined?!set.has(name):on;
      if(should)set.add(name);else set.delete(name);return should}
  },
  setAttribute(name,value){node.attrs[name]=String(value)},
  append(...children){for(const child of children){child.parent=node;node.children.push(child)}},
  replaceChildren(...children){node.children=[];node.append(...children)},
  before(...children){const at=node.parent?.children.indexOf(node);
    if(at===undefined||at<0)throw Error('Unattached element');
    node.parent.children.splice(at,0,...children);
    for(const child of children)child.parent=node},
  querySelector(selector){
    const sought=selector.replace(/^\./,'');
    const scan=root=>{for(const child of root.children){
      if(child.classList.contains(sought))return child;
      const match=scan(child);if(match)return match;
    }return null};
    return scan(node);
  },
  querySelectorAll(selector){
    const sought=selector.replace(/^\./,'');const found=[];
    const scan=root=>{for(const child of root.children){
      if(child.classList.contains(sought))found.push(child);
      scan(child);
    }};scan(node);return found;
  },
  addEventListener(event,cb){(node.events[event]??=[]).push(cb)},
  click(){if(!node.disabled)for(const fn of node.events.click??[])fn()}
 };
 return node;
}
const start=main.indexOf('const ingredients=');
const end=main.indexOf('const trialStarters=[',start);
assert.ok(start>=0&&end>start);
const controller=main.slice(start,end);
assert.ok(!controller.includes('alchemy-requirement'),'No leaked answer in the main potion panel');
assert.ok(!controller.includes('required.map('),'Exact formula is only revealed in learned Grimoire');
assert.ok(controller.includes('alchemyClue(g.mode,selectedRecipes[round],round+session)'));
assert.ok(controller.includes('if(session!==alchemySession||g.ended)return'));
const recipesDeclaration=controller.slice(controller.indexOf('const ingredients='),controller.indexOf('/* Laboratoire arcanique:'));
const {recipes}=runInNewContext(recipesDeclaration+'({recipes})');
assert.equal(recipes.length,20);
assert.deepEqual(Array.from(recipes[0][1]),[0,4],'Original recipe 0 remains unchanged');
assert.deepEqual(Array.from(recipes[4][1]),[2,4],'Original recipe 4 remains unchanged');
assert.equal(recipes.filter(recipe=>recipe[1].length===2).length,12);
assert.equal(recipes.filter(recipe=>recipe[1].length===3).length,8);
assert.equal(new Set(recipes.map(x=>x[1].join(','))).size,20,'All mixtures are distinct');
for(const [name,required] of recipes){
 assert.equal(required.length===3||required.length===2,true);
 assert.ok(name&&required.every(index=>index>=0&&index<6));
}

function exercise(mode,{fail=false,restart=false,knownBefore=[]}={}){
 const card=element('article','game'),board=element('div','board'),
   status=element('div','status'),actions=element('div','actions');
 card.append(board,status,actions);
 const g={card,board,status,actions,mode:null,ended:false};
 const state={difficulty:mode,alchemyKnown:[...knownBefore]};
 const completions=[];const timers=new Map();let nextTimer=1,saved=0;
 const ctx={
   mini:[null,null,null,null,g],state,trialRules,alchemyClue,recipeIndex,
   rememberAlchemyRecipe,ALCHEMY_ESSENCES,ALCHEMY_MODES,
   window:{matchMedia:()=>({matches:true})},
   el:element,
   $:(selector,root)=>root.querySelector(selector),
   $$:(selector,root)=>root.querySelectorAll(selector),
   shuffle:array=>[...array],
   setTimeout(fn,ms){const id=nextTimer++;timers.set(id,fn);return id},
   clearTimeout(id){timers.delete(id)},
   save(){saved++},
   button(text,handler,klass='secondary'){
     const b=element('button',klass,text);b.addEventListener('click',handler);return b},
   complete(index,message,performance){
     completions.push({index,message,performance});
     g.ended=true
   }
 };
 runInNewContext(controller+'startAlchemy()',ctx);
 const flush=()=>{let tries=0;while(timers.size){
   if(++tries>5)throw Error('Unexpected infinite alchemy timers');
   const jobs=[...timers.values()];timers.clear();for(const job of jobs)job();
 }};
 assert.equal(board.children.length,6);
 assert.equal(card.querySelectorAll('.alchemy-ingredient').length,6);
 assert.equal(card.querySelectorAll('.alchemy-seal-number').length,6);
 assert.ok(card.querySelector('.alchemy-ritual-clue').textContent.length>35);
 const book=card.querySelector('.alchemy-grimoire');
 assert.ok(book,'The Grimoire exists alongside the original stage');
 assert.equal(card.querySelectorAll('.alchemy-grimoire-entry').length,20);
 assert.ok(card.querySelector('.alchemy-grimoire-count').textContent.includes(knownBefore.length+' / 20'));
 assert.equal(card.querySelectorAll('.alchemy-grimoire-entry').filter(t=>t.classList.contains('is-known')).length,knownBefore.length);
 const mix=()=>actions.children[0].click();
 const select=indices=>indices.forEach(index=>board.children[index].click());
 assert.equal(actions.children[0].disabled,true,'A mix requires the correct ingredient count');
 assert.equal(card.querySelectorAll('.alchemy-slot').filter(slot=>!slot.hidden).length,
   mode==='maitrise'?3:2,'Visible slots match difficulty');
 if(restart){
   select([0,4]);mix();
   assert.equal(timers.size,1);
   actions.children[1].click();
   assert.equal(timers.size,0,'Restart cancels the brewing timer');
   assert.equal(state.alchemyKnown.length,knownBefore.length);
   assert.equal(saved,0,'Interrupted recipes never count as discovered');
 }
 if(fail){
   const incorrect=mode==='maitrise'?[0,1,2]:[0,2];
   for(let attempt=0;attempt<trialRules(4,mode).maxErrors;attempt++){
      select(incorrect);mix();flush();
   }
   assert.equal(g.ended,true,'Exceeding error budget fails the experiment');
   assert.equal(completions.length,0);
   assert.equal(saved,0);
   assert.equal(state.alchemyKnown.length,knownBefore.length);
   return;
 }
 const firstThree=mode==='maitrise'?[12,13,14]:[0,1,2];
 for(let i=0;i<3;i++){
   const recipeId=firstThree[i];
   const ingredientsFor=recipes[recipeId][1];
   select(ingredientsFor);
   assert.equal(actions.children[0].disabled,false);
   mix();flush();
   assert.ok(state.alchemyKnown.includes(recipeId),'Learned formula is saved in the local Grimoire');
   assert.equal(card.querySelectorAll('.alchemy-grimoire-entry').filter(t=>t.classList.contains('is-known')).length,
     new Set([...knownBefore,...firstThree.slice(0,i+1)]).size);
 }
 assert.equal(g.ended,true);
 assert.equal(completions.length,1);
 assert.equal(completions[0].index,4);
 assert.equal(completions[0].performance.errors,0);
 assert.equal(state.alchemyKnown.length,new Set([...knownBefore,...firstThree]).size);
 assert.equal(saved,3-firstThree.filter(id=>knownBefore.includes(id)).length,
   'Every NEW formula is written exactly once');
 mix();assert.equal(completions.length,1,'Completed lab cannot grant a duplicate victory');
}
exercise('initiation');
exercise('aventure',{restart:true});
exercise('maitrise');
exercise('maitrise',{fail:true});
exercise('initiation',{knownBefore:[0,1,2]});
const html=read('index.html'),css=read('src/alchemy.css');
assert.ok(html.includes('src/alchemy.css?v=alchemy-mastery-172b'));
assert.ok(html.includes('src/main.js?v=records-clean-1.7.3'));
assert.ok(css.includes('.alchemy-grimoire-list'));
assert.ok(css.includes('.alchemy-ritual-clue'));
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(css.includes('prefers-reduced-motion'));
console.log('AETHERIUM 1.7.2 — 20 recettes, trios de Maîtrise, indices uniques et sauvegardes OK');
