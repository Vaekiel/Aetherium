import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {boosterMoment} from '../src/booster-feedback.js';
import {PACK_PRICE,CHROMATIC_RATE} from '../src/data.js';
import {CRAFT_COSTS} from '../src/crafting.js';

const item=(id,rarity,{shiny=false,isNew=false,dustGain=0}={})=>({
  id,card:{id,name:'Carte '+id,rarity},shiny,isNew,dustGain
});
const normals=[item(1,'common'),item(2,'uncommon'),item(3,'rare')];
assert.equal(boosterMoment([]),null);
assert.equal(boosterMoment(normals),null,'Normal packs should stay visually lightweight');
const epic=[...normals,item(4,'epic')];
assert.deepEqual(boosterMoment(epic),{
 kind:'epic',symbol:'✧',title:'Une relique épique',detail:'Carte 4'
});
assert.deepEqual(boosterMoment([...epic,item(5,'legendary')]),{
 kind:'legendary',symbol:'✦',title:'Une légende révélée',detail:'Carte 5'
});
const chromatic=[...epic,item(6,'common',{shiny:true})];
assert.deepEqual(boosterMoment(chromatic),{
 kind:'chromatic',symbol:'✧',title:'Éclat chromatique',detail:'Carte 6'
},'Chromatic takes precedence over a less distinctive rarity reveal');
assert.equal(boosterMoment([item(5,'legendary')]).kind,'legendary');
assert.ok(Object.isFrozen(boosterMoment(epic)),'Presentation result is immutable');
assert.equal(PACK_PRICE,100);
assert.equal(CHROMATIC_RATE,.03);
assert.deepEqual(CRAFT_COSTS,{common:20,uncommon:45,rare:100,epic:220,legendary:450});

const main=readFileSync('src/main.js','utf8');
const html=readFileSync('index.html','utf8');
const css=readFileSync('src/booster-feedback.css','utf8');
assert.ok(html.includes('booster-feedback.css?v=booster-polish-1'));
assert.ok(html.includes('main.js?v=au-dela-lot-3'),
 'Current controller is cache-busted while booster feedback stays intact');
assert.ok(main.includes("from './booster-feedback.js?v=booster-polish-1'"));
assert.ok(main.includes('const moment=boosterMoment(currentDraw);'));
assert.ok(main.indexOf('const moment=boosterMoment(currentDraw);')>
  main.indexOf('function completeBoosterReveal(){'),
  'Highlights appear only when the entire pack is shown');
assert.ok(!/rotateY\(|filter:blur|backdrop-filter/.test(css),
  'No 3D flipping or blurred HD art on Android');
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(css.includes('.booster-moment-chromatic'));
assert.ok(css.includes('.booster-moment-legendary'));
assert.ok(css.includes('.booster-moment-epic'));
assert.ok(css.includes('.pull-flip.is-revealed'),'The small accent starts only on reveal');
assert.ok(css.includes('pointer-events')===false,'Visual accents never intercept controls');

const start=main.indexOf('function completeBoosterReveal(){');
const end=main.indexOf('function advanceBoosterCard(){',start);
assert.ok(start>=0&&end>start);
const code=main.slice(start,end);
function node(tag='',cls='',content=''){
 const classes=new Set(cls.split(' ').filter(Boolean));
 return {
  tagName:tag,className:cls,textContent:content,children:[],hidden:false,
  style:{width:'0%'},attributes:{},
  classList:{
    add(...names){for(const name of names)classes.add(name)},
    remove(...names){for(const name of names)classes.delete(name)},
    contains(name){return classes.has(name)}
  },
  append(...items){this.children.push(...items)},
  replaceChildren(...items){this.children=items},
  setAttribute(k,v){this.attributes[k]=v}
 };
}
function runCase(draw){
 const state={coins:725,dust:38,owned:{1:1},shiny:{},opened:6};
 const before=JSON.stringify(state);
 const boosterSummary=node('div','booster-summary'),boosterGrid=node('div','booster-pulls booster-single');
 const boosterArt=node(),boosterOpening=node(),boosterActions=node(),nextPullButton=node(),boosterStep=node();
 const boosterProgressFill=node(),title=node(),message=node();
 boosterArt.classList.add('is-opening');
 boosterOpening.classList.add('is-unsealing');
 let updates=0,cancels=0,artCards=0;
 const sandbox={
   boosterBusy:true,changingCard:true,
   boosterArt,boosterOpening,boosterActions,nextPullButton,boosterStep,
   boosterGrid,boosterSummary,boosterProgressFill,
   currentDraw:draw,drawSummary:{newCount:2,duplicates:3,shinyCount:draw.filter(c=>c.shiny).length,
    holographicCount:draw.filter(c=>c.finish==='holographic').length,
    calligraphicCount:draw.filter(c=>c.finish==='calligraphic').length,dustEarned:21},
   state,boosterMoment,
   cancelBoosterTimers(){cancels++},
   update(){updates++},
   makeCard(){artCards++;return node('button','card')},
   el:node,
   $:selector=>selector==='#pack-title'?title:selector==='#pack-msg'?message:null
 };
 runInNewContext(code+'completeBoosterReveal()',sandbox);
 assert.equal(sandbox.boosterBusy,false);
 assert.equal(sandbox.changingCard,false);
 assert.equal(cancels,1);
 assert.equal(updates,1,'Only a regular UI refresh, not a new purchase');
 assert.equal(artCards,draw.length,'All existing cards still render');
 assert.equal(JSON.stringify(state),before,'Revealing a booster never changes inventory or currency');
 assert.equal(boosterArt.classList.contains('is-opening'),false);
 assert.equal(boosterOpening.classList.contains('is-unsealing'),false);
 assert.equal(boosterActions.hidden,true);
 assert.equal(boosterSummary.hidden,false);
 assert.equal(boosterGrid.children.length,draw.length);
 assert.equal(boosterSummary.children.length,draw.some(c=>c.shiny||['epic','legendary'].includes(c.card.rarity))?6:5);
 assert.ok(boosterSummary.children.some(c=>c.textContent==='0 Holographique(s)'));
 assert.ok(boosterSummary.children.some(c=>c.textContent==='0 Calligraphique(s)'));
 assert.ok(boosterSummary.children.some(c=>c.textContent==='2 nouvelle(s)'));
 assert.equal(boosterProgressFill.style.width,'100%');
 assert.equal(nextPullButton.hidden,true);
 return boosterSummary.children[0];
}
const quiet=runCase([...normals,item(7,'common'),item(8,'common')]);
assert.equal(quiet.textContent,'2 nouvelle(s)','Normal booster summary retains its first counter');
const highlight=runCase([...normals,item(4,'epic'),item(6,'common',{shiny:true})]);
assert.equal(highlight.className,'booster-moment booster-moment-chromatic');
assert.equal(highlight.children[0].attributes['aria-hidden'],'true');
assert.equal(highlight.children[1].children[0].textContent,'Éclat chromatique');
assert.equal(highlight.children[1].children[1].textContent,'Carte 6');
console.log('AETHERIUM — Exceptional booster reveal polish, accessible late summary, 2D Android safety, unchanged wallet and Codex');
