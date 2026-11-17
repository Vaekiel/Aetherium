import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=path=>readFileSync(path,'utf8');
const moduleFor=path=>import('data:text/javascript;charset=utf-8,'+encodeURIComponent(read(path)));
const {makeEtherPuzzle,etherRule,evaluateEtherAttempt,etherAttemptFeedback}=
 await moduleFor('src/ether-lock-puzzles.js');
const {trialRules,trialReward}=await moduleFor('src/trial-progress.js');

const triples=[];
for(let a=0;a<6;a++)for(let b=a+1;b<6;b++)for(let c=b+1;c<6;c++)triples.push([a,b,c]);
assert.equal(triples.length,20);
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(const mode of ['initiation','aventure','maitrise']){
 for(let seed=1;seed<=150;seed++){
  const puzzle=makeEtherPuzzle(mode,seeded(seed));
  assert.equal(puzzle.values.length,6);
  assert.equal(new Set(puzzle.values).size,6);
  assert.ok(puzzle.values.every(v=>Number.isInteger(v)&&v>=1&&v<=12));
  assert.ok(puzzle.solution.every(index=>index>=0&&index<6));
  assert.equal(puzzle.difficulty,mode);
  assert.ok(etherRule(puzzle).length>25,'Public logic rule is always present');
  const valid=triples.filter(indices=>evaluateEtherAttempt(puzzle,indices).won);
  assert.equal(valid.length,1,'Exactly one deducible trio '+mode+' seed='+seed);
  assert.deepEqual(valid[0],[...puzzle.solution],
    'No unrelated trio can open the lock');
  const correct=evaluateEtherAttempt(puzzle,puzzle.solution);
  assert.equal(correct.won,true);
  assert.equal(correct.matches,3);
  assert.equal(correct.difference,0);
  assert.equal(correct.clueCorrect,true);
  assert.equal(evaluateEtherAttempt(puzzle,[0,0,1]),null);
  assert.equal(evaluateEtherAttempt(puzzle,[0,1,6]),null);
  assert.equal(evaluateEtherAttempt(puzzle,[0,1]),null);
  const wrong=triples.find(indices=>!evaluateEtherAttempt(puzzle,indices).won);
  const feedback=etherAttemptFeedback(puzzle,evaluateEtherAttempt(puzzle,wrong));
  assert.ok(feedback.includes('cristal'),'Every unsuccessful attempt identifies matching stones');
 }
}
assert.deepEqual([0,1,2].map(i=>trialRules(2,['initiation','aventure','maitrise'][i]).maxAttempts),[5,3,2],
 'Existing attempt budgets remain unchanged');
assert.equal(trialReward(50,'initiation',100),50,'Base reward remains unchanged');
assert.equal(makeEtherPuzzle('unknown',()=>0).difficulty,'aventure','Unknown difficulty falls back to Aventure');

const main=read('src/main.js'),css=read('src/lock.css'),html=read('index.html');
assert.ok(main.includes("from './ether-lock-puzzles.js'"),'Controller uses new pure puzzle module');
assert.ok(main.includes('const puzzle=makeEtherPuzzle(g.mode)'), 'Difficulty selects generated puzzle');
assert.ok(main.includes('if(result.won)'),'Only actual rule validation awards victory');
assert.ok(main.includes('etherAttemptFeedback(puzzle,result)'),'Post-attempt feedback integrated');
assert.ok(main.includes("$('.ether-lock-rule-text',g.card).textContent=etherRule(puzzle)"),
 'Visible instructions are connected to real rules');
assert.ok(main.includes('const totalAttempts=trialRules(2,g.mode).maxAttempts'),
 'Existing attempt budget untouched');
assert.ok(main.includes('complete(2,')&&main.includes('reward:50'),'Existing success reward kept');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Legacy save key unchanged');
assert.ok(css.includes('.ether-lock-rule-text')&&css.includes('ether-lock-atlas.webp'),
 'Clues are styled without replacing crystal art');
assert.ok(html.includes('src/main.js?v=memoire-1.7.2'));
assert.ok(html.includes('src/lock.css?v=logique-1.7.2'));

const makeNode=(tag='div',cssClass='',text='')=>{
 const names=new Set(cssClass.split(/\s+/).filter(Boolean));
 const node={tagName:tag,textContent:text,children:[],parent:null,disabled:false,
   attrs:{},events:{},style:{setProperty(){}},
   classList:{
    add(...x){x.forEach(y=>names.add(y))},
    remove(...x){x.forEach(y=>names.delete(y))},
    contains(n){return names.has(n)},
    toggle(n,on){const active=on===undefined?!names.has(n):on;
      if(active)names.add(n);else names.delete(n);return active}
   },
   setAttribute(key,value){this.attrs[key]=String(value)},
   append(...elements){for(const child of elements){child.parent=this;this.children.push(child)}},
   replaceChildren(...elements){this.children=[];this.append(...elements)},
   before(...elements){const where=this.parent?.children.indexOf(this);
      if(where===undefined||where<0)throw Error('Detached element');
      this.parent.children.splice(where,0,...elements);elements.forEach(e=>e.parent=this)},
   addEventListener(type,listener){(this.events[type]??=[]).push(listener)},
   click(){if(!this.disabled)for(const cb of this.events.click??[])cb()},
   querySelector(selector){const name=selector.slice(1);const scan=root=>{
       for(const child of root.children){
         if(child.classList.contains(name))return child;
         const nested=scan(child);if(nested)return nested;
       }
       return null
     };return scan(this)},
   querySelectorAll(selector){const name=selector.slice(1),out=[];
     const scan=root=>{for(const child of root.children){
       if(child.classList.contains(name))out.push(child);scan(child)
     }};scan(this);return out}
 };
 return node;
};
const start=main.indexOf('function startLock()');
const end=main.indexOf('/* Fouilles interdites:',start);
assert.ok(start>=0&&end>start,'Actual lock controller is extractable');
const controller=main.slice(start,end);
function exercise(mode,lose=false){
 const puzzle=makeEtherPuzzle(mode,seeded(mode==='maitrise'?122:14));
 const card=makeNode('article','game'),board=makeNode('div','board'),
  status=makeNode('div','status'),actions=makeNode('div','actions');
 card.append(board,status,actions);
 const g={card,board,status,actions,mode:null,ended:false};
 const winnings=[];
 const ctx={mini:[null,null,g],state:{difficulty:mode},
  makeEtherPuzzle:()=>puzzle,etherRule,evaluateEtherAttempt,etherAttemptFeedback,trialRules,
  el:makeNode,$:(q,root)=>root.querySelector(q),
  $$:(q,root)=>root.querySelectorAll(q),
  button(text,handler,klass='secondary'){
   const element=makeNode('button',klass,text);
   element.addEventListener('click',handler);return element
  },
  complete(index,msg,performance){winnings.push({index,msg,performance});g.ended=true}
 };
 runInNewContext(controller+'startLock()',ctx);
 assert.equal(board.children.length,6,'Six clickable crystals remain');
 assert.equal(card.querySelector('.ether-lock-rule-text').textContent,etherRule(puzzle),
   'Displayed rule matches the generator');
 assert.equal(card.querySelector('.ether-target').textContent,String(puzzle.target));
 const validate=actions.children[0];
 const choose=indices=>indices.forEach(index=>board.children[index].click());
 assert.equal(validate.disabled,true,'Cannot confirm incomplete selection');
 if(lose){
  const wrong=triples.find(indices=>!evaluateEtherAttempt(puzzle,indices).won);
  const cap=trialRules(2,mode).maxAttempts;
  for(let attempt=1;attempt<=cap;attempt++){
   choose(wrong);
   assert.equal(validate.disabled,false);
   validate.click();
   assert.equal(winnings.length,0,'Wrong guesses never reward');
   assert.ok(status.textContent.includes('cristal'),'Useful feedback is shown on failure');
   if(attempt<cap)assert.equal(validate.disabled,true,'Selection is cleared between attempts');
  }
  assert.equal(g.ended,true);
  assert.ok(card.querySelector('.ether-lock-dial').classList.contains('is-broken'));
  choose(puzzle.solution);validate.click();
  assert.equal(winnings.length,0,'Failed lock cannot issue later rewards');
 }else{
  choose([puzzle.solution[0]]);
  assert.equal(validate.disabled,true,'One crystal cannot activate the dial');
  board.children[puzzle.solution[0]].click(); // deselect
  choose(puzzle.solution);
  assert.equal(validate.disabled,false);
  validate.click();
  assert.equal(winnings.length,1);
  assert.equal(winnings[0].index,2);
  assert.equal(winnings[0].performance.attempts,0);
  assert.ok(card.querySelector('.ether-lock-dial').classList.contains('is-open'));
  validate.click();
  assert.equal(winnings.length,1,'Victory can only be rewarded once');
 }
 return {puzzle,g,winnings};
}
for(const mode of ['initiation','aventure','maitrise']){
 exercise(mode,false);
 exercise(mode,true);
}
console.log('AETHERIUM 1.7.2 — Serrure logique : 450 mécanismes uniques, clics, indices, échecs et gains OK');
