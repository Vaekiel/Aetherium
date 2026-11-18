import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {CARDS as ORIGINES_CARDS,PACK_PRICE,CHROMATIC_RATE,drawPack} from '../src/data.js';
import {CARDS,REFLETS_CARDS,CARD_BY_ID,drawRefletsPack} from '../src/collection-data.js';
import {REFLETS_GALLERY_ART} from '../src/reflets-gallery.js';
import {CARD_ART} from '../src/card-art.js';
import {collectionById,cardsForCollection,seasonProgress} from '../src/seasons.js';
import {validateSaveState} from '../src/save-backup.js';

const read=path=>readFileSync(path,'utf8');
assert.equal(ORIGINES_CARDS.length,24);
assert.equal(REFLETS_CARDS.length,24);
assert.equal(CARDS.length,48);
assert.deepEqual(CARDS.map(c=>c.id),Array.from({length:48},(_,i)=>i+1));
assert.equal(new Set(CARDS.map(c=>c.name)).size,48);
assert.equal(PACK_PRICE,100);
assert.equal(CHROMATIC_RATE,0.03);
assert.equal(collectionById('marches-de-verre','reflets-brises').released,true);
assert.equal(cardsForCollection(CARDS,'marches-de-verre','reflets-brises').length,24);
assert.equal(seasonProgress(CARDS,{},{}).released,48);
for(const random of [0,0.02,0.031,0.2,0.49,0.72,0.9,0.999]){
 for(const [draw,first,last] of [[drawPack,1,24],[drawRefletsPack,25,48]]){
  const pack=draw(()=>random);
  assert.equal(pack.length,5);
  assert.ok(pack.every(card=>card.id>=first&&card.id<=last));
  assert.notEqual(CARD_BY_ID.get(pack[4].id).rarity,'common','Fifth card guarantees at least uncommon');
 }
}
assert.ok(drawRefletsPack(()=>0.02999).every(card=>card.shiny));
assert.ok(drawRefletsPack(()=>0.03).every(card=>!card.shiny));
for(const card of REFLETS_CARDS){
 assert.ok(card.attack>=3&&card.health>=5);
 assert.equal(card.series,'Les Reflets brisés');
 const art=CARD_ART[card.id];
 const gallery=REFLETS_GALLERY_ART.find(item=>item.id===card.id);
 assert.ok(gallery,'Metadata exists for '+card.id);
 assert.equal(art.full,gallery.hd);
 assert.equal(art.thumbnail,gallery.thumb);
 for(const path of [art.full,art.thumbnail]){
  const bytes=readFileSync(path.slice(2));
  assert.ok(bytes.length>20000);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
}
const ids=CARDS.map(card=>card.id);
const state={
 coins:200,dust:10,opened:1,wins:0,earned:0,
 owned:{1:1,25:1,48:2},shiny:{48:true},goalId:26,difficulty:'aventure',
 trialStats:[],trialRecords:[],collectionMilestones:{},recentFinds:[{id:48,kind:'new'}],
 alchemyKnown:[],titleId:null,expedition:{}
};
assert.equal(validateSaveState(state,ids).cards,3);
assert.throws(()=>validateSaveState(state,ORIGINES_CARDS.map(c=>c.id)),/Carte ou quantité inconnue/);

const source=read('src/main.js');
const start=source.indexOf('function openOriginesBooster(){');
const end=source.indexOf("$('#buy').addEventListener('click',openOriginesBooster);",start);
assert.ok(start>0&&end>start);
const handler=source.slice(start,end);
assert.ok(source.includes("selectedBooster='origines'"));
assert.ok(source.includes("control.dataset.booster"));
assert.ok(handler.includes("edition==='origines'?drawPack():drawRefletsPack()"));
assert.ok(source.includes('const chapter=collectionForCard(c)'),'Card result opens its own Codex chapter');
const box=()=>({
 hidden:false,textContent:'',style:{width:''},
 classList:{add(){},remove(){},contains(){return false}},replaceChildren(){},scrollIntoView(){}
});
let saves=0,originesDraws=0,refletsDraws=0;
const live={coins:300,dust:0,opened:0,owned:{},shiny:{},recentFinds:[]};
const pack=box(),opening=box(),grid=box(),progress=box(),summary=box(),
 actions=box(),next=box(),step=box(),fill=box(),title=box(),message=box(),page=box();
const ctx={
 selectedBooster:'reflets-brises',boosterBusy:false,state:live,CARDS,PACK_PRICE,
 drawPack(){originesDraws++;return drawPack(()=>0.5)},
 drawRefletsPack(){refletsDraws++;return drawRefletsPack(()=>0.5)},
 duplicateDustReward:()=>5,
 recordRecentFind:(entries,id,kind)=>[{id,kind},...entries].slice(0,6),
 cancelBoosterTimers(){},update(){saves++},
 boosterSummary:summary,boosterGrid:grid,boosterActions:actions,
 nextPullButton:next,boosterProgress:progress,boosterProgressFill:fill,
 boosterStep:step,boosterOpening:opening,boosterArt:pack,
 currentDraw:[],drawSummary:null,
 reducedMotion:{matches:true},mobileView:{matches:false},BOOSTER_UNSEAL_MS:980,
 afterBooster(){},showBoosterCard(){},
 $:selector=>selector==='#pack-title'?title:selector==='#pack-msg'?message:selector==='#page-boosters'?page:null
};
runInNewContext(handler+'openOriginesBooster()',ctx);
assert.equal(refletsDraws,1);
assert.equal(originesDraws,0);
assert.equal(live.coins,200);
assert.equal(live.opened,1);
assert.equal(ctx.currentDraw.length,5);
assert.ok(Object.keys(live.owned).every(id=>Number(id)>=25&&Number(id)<=48));
assert.equal(saves,1,'Purchase is persisted before reveal');
runInNewContext(handler+'openOriginesBooster()',ctx);
assert.equal(refletsDraws,1,'Double tap cannot buy twice');
assert.equal(saves,1);
const html=read('index.html'),css=read('src/reflets-booster.css');
for(const id of ['booster-collection-kicker','booster-family-title','booster-family-description'])
 assert.ok(html.includes('id="'+id+'"'));
assert.ok(html.includes('data-booster="origines"')&&html.includes('data-booster="reflets-brises"'));
assert.ok(html.includes('reflets-booster.css?v=reflets-release-1'));
assert.ok(css.includes('@media(max-width:850px)')&&css.includes('.pack.pack-reflets'));

/* Browser startup regression: the booster selector must use querySelectorAll.
   querySelector (single HTMLElement) has no forEach and is not iterable. */
const all=String.fromCharCode(36,36);
assert.ok(source.includes("for(const control of "+all+"('.booster-choice'))"),
  'Both booster controls must be updated using querySelectorAll');
assert.ok(source.includes(all+"('.booster-choice').forEach(control=>control.addEventListener('click'"),
  'The click handlers must be registered on both booster buttons');
const selectorStart=source.indexOf('function selectBooster(edition){');
const selectorEnd=source.indexOf('/** The face-up card',selectorStart);
assert.ok(selectorStart>0&&selectorEnd>selectorStart);
const selectorScript=source.slice(selectorStart,selectorEnd);
const choices=['origines','reflets-brises'].map(booster=>({
 dataset:{booster},
 classList:{toggle(){}},
 setAttribute(){},
 addEventListener(name,fn){if(name==='click')this.activate=fn}
}));
const fields=Object.fromEntries([
 '#booster-pack .pack-title','#booster-pack .pack-edition',
 '#booster-collection-kicker','#booster-family-title',
 '#booster-family-description','#pack-title','#pack-msg'
].map(id=>[id,{textContent:''}]));
let refreshed=0,cleared=0;
const selectorContext={
 boosterBusy:false,selectedBooster:'origines',
 boosterArt:{classList:{toggle(){}}},
 clearBoosterScene(){cleared++},
 update(){refreshed++},
 [String.fromCharCode(36)]:sel=>fields[sel]??null,
 [all]:sel=>sel==='.booster-choice'?choices:[]
};
runInNewContext(selectorScript,selectorContext);
assert.ok(choices.every(choice=>typeof choice.activate==='function'),
  'Both booster options respond to touch/click');
choices[1].activate();
assert.equal(selectorContext.selectedBooster,'reflets-brises');
assert.equal(fields['#booster-family-title'].textContent,'Booster des Reflets brisés');
choices[0].activate();
assert.equal(selectorContext.selectedBooster,'origines');
assert.equal(refreshed,2);
assert.equal(cleared,2);

console.log('AETHERIUM — Reflets brisés: 24 cartes, tirage isolé, images HD, sauvegardes et Origines préservés');
