import {readFileSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
const read=f=>readFileSync(f,'utf8');
const main=read('src/main.js'),css=read('src/alchemy.css'),html=read('index.html');
assert.ok(html.includes('src/alchemy.css'),'Alchemy stylesheet is linked');
assert.ok(css.includes('alchemy-atlas.webp'),'HD sprite atlas is used');
assert.ok(css.includes('background-size:300% 300%'),'Nine 3x3 sprite crops');
assert.ok(css.includes('.alchemy-cauldron.is-success')&&css.includes('.alchemy-cauldron.is-error'),'Success and failure sprites');
assert.ok(css.includes('.alchemy-board')&&css.includes('.alchemy-ingredient'),'Specialized ingredient tiles');
assert.ok(css.includes('@media(max-width:850px)'),'Mobile breakpoint supported');
assert.ok(css.includes('prefers-reduced-motion'),'Reduced-motion supported');
assert.ok(statSync('assets/minigames/alchemy-atlas.webp').size>100_000,'Optimized HD artwork shipped');
assert.ok(main.includes("name:'Laboratoire arcanique'"),'Fifth game remains in catalogue');
assert.ok(main.includes('reward:60'),'Original 60-Crown reward retained');
assert.ok(main.includes("const SAVE='aetherium-save-v1'"),'Save key unchanged');
const begin=main.indexOf('function startAlchemy()');
const end=main.indexOf('const trialStarters=[startRunes,startMemory,startLock,startMines,startAlchemy];',begin);
assert.ok(begin>=0&&end>begin,'Alchemy runtime code exists');
const code=main.slice(begin,end);
for(const marker of ["selectedRecipes=shuffle(recipes.filter(recipe=>recipe[1].length===requiredIngredients)).slice(0,3)","for(let i=0;i<ingredients.length;i++)","g.board.style.setProperty('--cols',3)","if(errors===maxErrors)","if(round===3)","complete(4,'Alchimie maîtrisée !","if(g.ended||busy","const session=++alchemySession","clearTimeout(alchemyTimer)","session!==alchemySession","setAttribute('aria-pressed'","button('✦ Mélanger'"]){
 assert.ok(code.includes(marker),'Missing gameplay marker: '+marker);
}
assert.ok(!code.includes('tileGrid(g.board'),'Generic tiles are gone');
assert.ok(!code.includes('alchemy-requirement'),'The potion panel must never display the correct ingredients');
assert.ok(!code.includes('required.map('),'The recipe solution must not be converted to an on-screen hint');
assert.ok(code.includes("const [name]=selectedRecipes[Math.min(round,2)];"),
  'The brewing panel only reads the recipe name during selection');
assert.ok(code.includes("const [name,required]=selectedRecipes[round];"),
  'Hidden ingredient combinations remain available to validate the mixture');
assert.ok(code.includes('Déduis deux ingrédients grâce aux indices du sceau'),
  'The player is encouraged to infer and remember the correct ingredients');
assert.ok(!css.includes('.alchemy-requirement'),
  'Removed solution display no longer leaves an orphaned CSS rule');
const ingredientLine=main.match(/^const ingredients=.*;$/m)?.[0];
const recipeStart=main.indexOf('const recipes=[');
const recipeEnd=main.indexOf('];',recipeStart);
const recipeLine=recipeStart>=0&&recipeEnd>recipeStart?main.slice(recipeStart,recipeEnd+2):null;
assert.ok(recipeLine&&ingredientLine,'Original formulas remain present');
const {recipes,ingredients}=runInNewContext(ingredientLine+'\n'+recipeLine+'\n({recipes,ingredients})');
assert.equal(recipes.length,20,'Twenty recipes, including all five original ones');
assert.equal(ingredients.length,6,'Six original ingredients remain');
for(const [name,required] of recipes){
 assert.ok(name.length>0&&[2,3].includes(required.length),'Recipes have 2 or 3 ingredients');
 assert.ok(required.every(i=>Number.isInteger(i)&&i>=0&&i<6),'Recipes have valid ingredients');
}
assert.equal(recipes.filter(r=>r[1].length===3).length,8,'Eight three-essence Mastery recipes');
assert.equal(recipes.filter(r=>r[1].length===2).length,12,'Twelve two-essence recipes');
assert.deepEqual(Array.from(recipes[0][1]),[0,4],'Legacy recipe 0 is immutable');
assert.deepEqual(Array.from(recipes[4][1]),[2,4],'Legacy recipe 4 is immutable');
assert.ok(main.includes("from './alchemy-rituals.js'"),'Five known formulas use solvable clues');
assert.ok(code.includes("renderGrimoire()"),'The laboratory shows an earned-recipe journal');
assert.ok(code.includes("save(); // Preserve discoveries immediately"),'Every discovered formula is saved');
assert.ok(html.includes('src/alchemy.css?v=alchemy-mastery-172b'),'Alchemy CSS refreshed');
assert.ok(html.includes('src/main.js?v=expedition-dediee-1.8.1'),'Alchemy JS refreshed');
assert.ok(main.includes("g.mode==='maitrise'?3:2"),'Mastery requires a third ingredient');
assert.ok(main.includes("s.alchemyKnown=sanitizeAlchemyKnown(raw.alchemyKnown)"),'Old local saves migrate safely');
console.log('AETHERIUM — Laboratoire : 20 recettes, mode Maîtrise triple et Grimoire : OK');
