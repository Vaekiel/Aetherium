import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {CARDS as ORIGINES,drawPack,PACK_PRICE,CHROMATIC_RATE} from '../src/data.js';
import {CARDS,REFLETS_CARDS,AU_DELA_CARDS,AU_DELA_BOOSTER_CARDS,drawRefletsPack,drawAuDelaPack} from '../src/collection-data.js';
import {CARD_ART} from '../src/card-art.js';
import {collectionById,cardsForCollection} from '../src/seasons.js';
import {getCraftCost,craftCard} from '../src/crafting.js';
import {validateSaveState} from '../src/save-backup.js';

const read=p=>readFileSync(p,'utf8');
assert.equal(ORIGINES.length,24);
assert.equal(REFLETS_CARDS.length,24);
assert.equal(AU_DELA_CARDS.length,24);
assert.equal(AU_DELA_BOOSTER_CARDS.length,23);
assert.equal(CARDS.length,72);
assert.deepEqual(CARDS.map(c=>c.id),Array.from({length:72},(_,i)=>i+1));
assert.equal(collectionById('marches-de-verre','au-dela-du-verre').released,true);
assert.equal(cardsForCollection(CARDS,'marches-de-verre','au-dela-du-verre').length,24);
assert.equal(PACK_PRICE,100);
assert.equal(CHROMATIC_RATE,.03);
const signature=CARDS.find(c=>c.id===72);
assert.ok(signature.signature);
assert.equal(signature.boosterEligible,false);
assert.equal(getCraftCost(signature),null);
assert.equal(craftCard({owned:{},dust:99999},signature).ok,false);
assert.ok(!AU_DELA_BOOSTER_CARDS.some(c=>c.id===72));
assert.equal(AU_DELA_BOOSTER_CARDS.filter(c=>c.rarity==='legendary').length,2);
for(const card of AU_DELA_CARDS){
 const art=CARD_ART[card.id];
 assert.ok(art,'Approved art for '+card.id);
 for(const asset of [art.thumbnail,art.full]){
  const bytes=readFileSync(asset.slice(2));
  assert.ok(bytes.length>20000,'Art binary is nonempty: '+asset);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
}
const wrapper=readFileSync('assets/boosters/au-dela-du-verre-reliquaire-v3.webp');
assert.ok(wrapper.length>50000&&wrapper.length<700000);
assert.equal(wrapper.toString('ascii',0,4),'RIFF');
assert.equal(wrapper.toString('ascii',8,12),'WEBP');
for(const fixed of [0,.02999,.03,.2,.5,.72,.95,.999]){
 const third=drawAuDelaPack(()=>fixed);
 assert.equal(third.length,5);
 assert.ok(third.every(c=>c.id>=49&&c.id<=71&&c.id!==72));
 assert.notEqual(CARDS[third[4].id-1].rarity,'common');
 assert.ok(third.every(c=>c.shiny===(fixed<.03)));
 assert.ok(drawPack(()=>fixed).every(c=>c.id<=24));
 assert.ok(drawRefletsPack(()=>fixed).every(c=>c.id>=25&&c.id<=48));
}
const save={coins:310,dust:45,opened:2,wins:3,earned:300,
 owned:{1:1,25:2,49:1,71:1},shiny:{49:true},
 goalId:50,difficulty:'aventure',trialStats:[],trialRecords:[],
 collectionMilestones:{},recentFinds:[],alchemyKnown:[],titleId:null,expedition:{}};
assert.equal(validateSaveState(save,CARDS.map(c=>c.id)).cards,4,
 'Saves retain old cards and accept the third collection without a key migration');
const source=read('src/main.js'),html=read('index.html'),css=read('src/au-dela-booster.css');
assert.ok(html.includes('data-booster="au-dela-du-verre"'));
assert.ok(html.includes('src="./assets/boosters/au-dela-du-verre-reliquaire-v3.webp"'));
assert.ok(html.includes('au-dela-booster.css?v=au-dela-booster-1'));
assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
assert.ok(css.includes('@media(max-width:850px)'));
assert.ok(css.includes('@media(max-width:420px)'));
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(source.includes("boosterArt.classList.toggle('pack-au-dela',isAuDela);"));
assert.ok(source.includes("boosterArt.classList.toggle('reliquaire-au-dela',isAuDela);"),
  'Selecting Au-delà du Verre uses its full premium foil envelope');
assert.ok(source.includes("const SAVE='aetherium-save-v1'"));
assert.ok(source.includes("const missing=CARDS.filter(card=>!state.owned[card.id]&&getCraftCost(card)!==null);"));
const start=source.indexOf('function openOriginesBooster(){');
const end=source.indexOf("$('#buy').addEventListener('click',openOriginesBooster);",start);
assert.ok(start>0&&end>start);
const script=source.slice(start,end);
const node=()=>({hidden:false,textContent:'',classList:{add(){},remove(){},contains(){return false}},
 style:{width:''},replaceChildren(){},scrollIntoView(){}});
const pack=node(),opening=node(),grid=node(),progress=node(),fill=node(),actions=node(),
 summary=node(),next=node(),step=node(),title=node(),msg=node(),page=node();
const state={coins:300,dust:0,opened:0,owned:{1:1,25:1},shiny:{},recentFinds:[]};
let saved=0,thirdDraws=0;
const ctx={
 selectedBooster:'au-dela-du-verre',boosterBusy:false,state,CARDS,PACK_PRICE,
 drawAuDelaPack(){thirdDraws++;return drawAuDelaPack(()=>.5)},
 drawPack(){throw Error('Wrong booster pool: Origines')},
 drawRefletsPack(){throw Error('Wrong booster pool: Reflets')},
 duplicateDustReward(){return 5},
 recordRecentFind:(list,id,kind)=>[{id,kind},...list].slice(0,6),
 cancelBoosterTimers(){},update(){saved++},
 boosterSummary:summary,boosterGrid:grid,boosterActions:actions,
 nextPullButton:next,boosterProgress:progress,boosterProgressFill:fill,
 boosterStep:step,boosterOpening:opening,boosterArt:pack,
 currentDraw:[],drawSummary:null,reducedMotion:{matches:true},
 mobileView:{matches:false},BOOSTER_UNSEAL_MS:980,
 afterBooster(){},showBoosterCard(){},
 $:selector=>selector==='#pack-title'?title:selector==='#pack-msg'?msg:selector==='#page-boosters'?page:null
};
runInNewContext(script+'openOriginesBooster()',ctx);
assert.equal(thirdDraws,1);
assert.equal(state.coins,200);
assert.equal(state.opened,1);
assert.equal(saved,1,'Purchase saved exactly once before reveal');
assert.equal(ctx.currentDraw.length,5);
assert.ok(Object.keys(state.owned).some(id=>Number(id)>=49&&Number(id)<=71));
assert.ok(Object.keys(state.owned).every(id=>Number(id)!==72));
runInNewContext(script+'openOriginesBooster()',ctx);
assert.equal(thirdDraws,1,'Second tap while unsealing cannot buy a duplicate packet');
assert.equal(saved,1);
assert.equal(state.coins,200);
assert.equal(state.owned[1],1);
assert.equal(state.owned[25],1);
console.log('Au-delà du Verre — 23 tirables, 1 Signature réservée, 24 arts HD, ouverture unique, 3 boosters isolés et sauvegardes compatibles.');
