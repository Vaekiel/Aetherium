import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {CARDS as ORIGINES,drawPack,drawPackFromPool,RARITIES,PACK_PRICE,FINISH_RATES} from '../src/data.js';
import {CARDS,CARD_BY_ID,CARD_GROUPS,REFLETS_CARDS,AU_DELA_BOOSTER_CARDS,BOOSTER_REGISTRY,buildPublishedCatalog,buildBoosterRegistry,drawCollectionPack,boosterById} from '../src/collection-data.js';
import {SEASONS,cardsForCollection,collectionForCard,seasonProgress} from '../src/seasons.js';
import {CARD_ART} from '../src/card-art.js';
import {BOOSTER_VIEWS,boosterView} from '../src/booster-views.js';
import {FINISH_KEYS,restoreFinishCounts} from '../src/finishes.js';
import {getCraftCost} from '../src/crafting.js';
import {getFinishCraftCost} from '../src/finish-crafting.js';
import {validateSeasonCatalog} from '../src/season-conformity.js';
import {defineCollectionContent,FUTURE_ART_STANDARD} from '../src/content-standard.js';
import {createBackup,decodeBackup,validateSaveState,GAME_SAVE_KEY} from '../src/save-backup.js';
import {parseStoredSave,createSaveSession} from '../src/save-session.js';

const input={seasons:SEASONS,cards:CARDS,art:CARD_ART,boosters:BOOSTER_REGISTRY,views:BOOSTER_VIEWS,rarities:RARITIES,finishKeys:FINISH_KEYS};
assert.deepEqual(validateSeasonCatalog(input),[]);
assert.equal(CARDS.length,72);
assert.deepEqual(CARDS.map(c=>c.id),Array.from({length:72},(_,i)=>i+1));
assert.equal(CARD_BY_ID.get(72).signature,true);
assert.equal(getCraftCost(CARD_BY_ID.get(72)),null);
for(const finish of FINISH_KEYS)assert.equal(getFinishCraftCost(CARD_BY_ID.get(72),finish),null);
assert.deepEqual([...BOOSTER_REGISTRY.values()].map(b=>b.pool.length),[24,24,23]);
assert.equal(PACK_PRICE,100);
assert.deepEqual(FINISH_RATES,{chromatic:.03,holographic:.02,calligraphic:.02});

const rng=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
for(const [id,pool] of [['origines',ORIGINES],['reflets-brises',REFLETS_CARDS],['au-dela-du-verre',AU_DELA_BOOSTER_CARDS]]){
  for(let seed=0;seed<500;seed++){
    const expected=id==='origines'?drawPack(rng(seed)):drawPackFromPool(pool,rng(seed));
    const actual=drawCollectionPack(id,rng(seed));
    assert.deepEqual(actual,expected);
    assert.equal(actual.length,5);
    assert.ok(actual.every(c=>pool.some(p=>p.id===c.id)&&c.id!==72&&FINISH_KEYS.includes(c.finish)));
    assert.notEqual(CARD_BY_ID.get(actual[4].id).rarity,'common');
  }
  assert.ok(boosterView(id));
}
const future=SEASONS[1];
assert.deepEqual(future.collections.map(c=>[c.first,c.last]),[[73,96],[97,120],[121,144]]);
assert.equal(seasonProgress(CARDS,{}, {},future.id).released,0);
for(const part of future.collections){
  assert.deepEqual(cardsForCollection(CARDS,future.id,part.id),[]);
  assert.equal(boosterById(part.id),null);
  assert.equal(boosterView(part.id),null);
  assert.throws(()=>drawCollectionPack(part.id));
}
assert.throws(()=>drawCollectionPack('not-a-booster'));
assert.equal(collectionForCard({id:73}),null);

// Synthetic release in memory only: no fictional cards or lore enter the live catalogue.
const part=future.collections[0];
const authored=defineCollectionContent({title:'TEST',first:part.first,last:part.last,artVersion:'test-1',
  entries:ORIGINES.map(c=>({...c,id:c.id+72,slug:'test-card-'+c.id}))});
const synthetic=authored.cards;
assert.equal(authored.art[73].fullHeight,FUTURE_ART_STANDARD.fullHeight);
assert.throws(()=>defineCollectionContent({title:'TEST',first:73,last:96,artVersion:'test-1',entries:[] }));
const groups={...CARD_GROUPS,[part.id]:synthetic};
assert.deepEqual(buildPublishedCatalog(SEASONS,groups),CARDS);
const released=SEASONS.map(s=>s.id!==future.id?s:{...s,collections:s.collections.map(c=>c.id===part.id?{...c,released:true}:c)});
const expanded=buildPublishedCatalog(released,groups);
assert.equal(expanded.length,96);
assert.deepEqual(expanded.slice(0,72),CARDS);
const expandedRegistry=buildBoosterRegistry(released,expanded);
assert.deepEqual(expandedRegistry.get(part.id).pool.map(c=>c.id),synthetic.map(c=>c.id));
const expandedInput={...input,seasons:released,cards:expanded,art:{...CARD_ART,...authored.art},boosters:expandedRegistry,
  views:{...BOOSTER_VIEWS,[part.id]:{title:'TEST',label:'TEST',description:'TEST',message:'TEST',theme:'standard',art:'./assets/boosters/test.webp'}}};
assert.deepEqual(validateSeasonCatalog(expandedInput),[]);
assert.ok(validateSeasonCatalog({...expandedInput,art:{...expandedInput.art,73:{...authored.art[73],fullWidth:999}}}).some(e=>e.includes('Nonstandard future illustration')));
assert.ok(validateSeasonCatalog({...expandedInput,views:{...expandedInput.views,[part.id]:{...expandedInput.views[part.id],theme:'origines'}}}).some(e=>e.includes('shared design')));
assert.throws(()=>buildPublishedCatalog(released,CARD_GROUPS));
assert.ok(validateSeasonCatalog({...input,cards:[...CARDS,CARDS[0]]}).some(e=>e.includes('duplicate card ID')));
assert.ok(validateSeasonCatalog({...input,cards:[...CARDS,synthetic[0]]}).some(e=>e.includes('Unreleased content exposed')));
const noArt={...CARD_ART};delete noArt[1];
assert.ok(validateSeasonCatalog({...input,art:noArt}).some(e=>e.includes('Missing illustration')));
const noView={...BOOSTER_VIEWS};delete noView.origines;
assert.ok(validateSeasonCatalog({...input,views:noView}).some(e=>e.includes('booster presentation')));
const badPool=new Map(BOOSTER_REGISTRY);
badPool.set('au-dela-du-verre',{...badPool.get('au-dela-du-verre'),pool:[...badPool.get('au-dela-du-verre').pool,CARD_BY_ID.get(72)]});
assert.ok(validateSeasonCatalog({...input,boosters:badPool}).some(e=>e.includes('Invalid booster pool')));

const ids=CARDS.map(c=>c.id),expandedIds=expanded.map(c=>c.id);
const legacy={coins:456,dust:123,wins:5,earned:200,opened:3,owned:{1:3,25:1,72:1},shiny:{1:true,72:true},
  goalId:2,difficulty:'aventure',trialStats:[],trialRecords:[],collectionMilestones:{'marches-de-verre/origines':[6]},recentFinds:[],alchemyKnown:[],titleId:null,expedition:{completedRoutes:[]}};
const current={...legacy,finishCounts:restoreFinishCounts(legacy.owned,legacy.shiny,{normal:{1:1,25:1},calligraphic:{1:1},chromatic:{1:1,72:1},holographic:{}})};
assert.equal(GAME_SAVE_KEY,'aetherium-save-v1');
for(const save of [legacy,current]){
  const raw=JSON.stringify(save);
  assert.deepEqual(parseStoredSave(raw,expandedIds),save);
  assert.deepEqual(validateSaveState(save,ids),validateSaveState(save,expandedIds));
  const backup=await createBackup(save,ids,webcrypto,new Date('2026-11-26T00:00:00Z'));
  assert.deepEqual((await decodeBackup(backup,expandedIds,webcrypto)).state,save);
  const stored=new Map([[GAME_SAVE_KEY,raw]]);
  const storage={getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)};
  const session=createSaveSession(()=>storage,expandedIds);
  assert.equal(session.problem,'');
  session.write(save);
  assert.equal(stored.get(GAME_SAVE_KEY),raw);
}
const later={...current,owned:{...current.owned,73:1},finishCounts:{...current.finishCounts,normal:{...current.finishCounts.normal,73:1}}};
assert.doesNotThrow(()=>validateSaveState(later,expandedIds));
assert.throws(()=>validateSaveState(later,ids));
const rawLater=JSON.stringify(later);
const stored=new Map([[GAME_SAVE_KEY,rawLater]]);
const staleVersion=createSaveSession(()=>({getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)}),ids);
assert.ok(staleVersion.problem);
assert.throws(()=>staleVersion.write(current));
assert.equal(stored.get(GAME_SAVE_KEY),rawLater);

// Filesystem/HTML gate: all currently published artwork exists and is WebP.
const html=readFileSync('index.html','utf8');
for(const [id,view] of Object.entries(BOOSTER_VIEWS)){
  assert.ok(html.includes('data-booster="'+id+'"'));
  assert.ok(html.includes(view.art));
}
for(const part of future.collections)assert.ok(!html.includes('data-booster="'+part.id+'"'));
for(const path of [...Object.values(CARD_ART).flatMap(a=>[a.thumbnail,a.full]),...Object.values(BOOSTER_VIEWS).map(v=>v.art)]){
  assert.ok(existsSync(path),'Missing asset: '+path);
  const bytes=readFileSync(path);
  assert.equal(bytes.toString('ascii',0,4),'RIFF',path);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',path);
}
console.log('Chantier 09: catalogue, 1500 deterministic draws, art files, draft isolation, legacy and future save guards OK.');
