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
const end=main.indexOf('[startRunes,startMemory,startLock,startMines,startAlchemy].forEach',begin);
assert.ok(begin>=0&&end>begin,'Alchemy runtime code exists');
const code=main.slice(begin,end);
for(const marker of ["selectedRecipes=shuffle([...recipes]).slice(0,3)","for(let i=0;i<ingredients.length;i++)","g.board.style.setProperty('--cols',3)","if(errors===3)","if(round===3)","complete(4,'Alchimie maîtrisée !","if(g.ended||busy","const session=++alchemySession","clearTimeout(alchemyTimer)","session!==alchemySession","setAttribute('aria-pressed'","button('✦ Mélanger'"]){
 assert.ok(code.includes(marker),'Missing gameplay marker: '+marker);
}
assert.ok(!code.includes('tileGrid(g.board'),'Generic tiles are gone');
const recipeLine=main.match(/^const recipes=.*;$/m)?.[0];
const ingredientLine=main.match(/^const ingredients=.*;$/m)?.[0];
assert.ok(recipeLine&&ingredientLine,'Original five recipe definitions present');
const {recipes,ingredients}=runInNewContext(ingredientLine+'\n'+recipeLine+'\n({recipes,ingredients})');
assert.equal(recipes.length,5,'Five original recipes remain');
assert.equal(ingredients.length,6,'Six original ingredients remain');
for(const [name,required] of recipes){
 assert.ok(name.length>0&&required.length===2,'Every recipe requires exactly two ingredients');
 assert.ok(required.every(i=>Number.isInteger(i)&&i>=0&&i<6),'Recipes have valid ingredients');
}
console.log('AETHERIUM — Laboratoire arcanique HD : smoke checks OK');
