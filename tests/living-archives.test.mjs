import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS} from '../src/collection-data.js';
import {
  sanitizeRecentFinds,recordRecentFind,buildLivingArchive,RECENT_DISCOVERY_LIMIT
} from '../src/living-archives.js';

test('Les anciennes sauvegardes sans historique restent compatibles',()=>{
  const result=buildLivingArchive(CARDS,CARDS,{1:2,22:1},{},undefined);
  assert.equal(result.discovered,2);
  assert.equal(result.recent.length,0);
  assert.equal(result.featured[0].id,22);
  assert.equal(result.publishedCount,2);
  assert.equal(result.completed.length,0);
});

test('Seules les collections publiées sont considérées complétables',()=>{
  const owned=Object.fromEntries(CARDS.map(card=>[card.id,1]));
  const result=buildLivingArchive(CARDS,CARDS,owned,{},[]);
  assert.equal(result.discovered,CARDS.length);
  assert.equal(result.publishedCount,2);
  assert.equal(result.completed.length,2);
  assert.equal(result.completed[0].collection.id,'origines');
});

test('Le registre ignore les découvertes corrompues et reste borné',()=>{
  const polluted=[
    {id:1,kind:'new'},null,{id:999,kind:'forge'},{id:2,kind:'unknown'},
    ...Array.from({length:20},(_,i)=>({id:(i%24)+1,kind:'new'}))
  ];
  const recent=sanitizeRecentFinds(polluted);
  assert.equal(recent.length,RECENT_DISCOVERY_LIMIT);
  assert.ok(recent.every(e=>CARDS.some(card=>card.id===e.id)));
  assert.deepEqual(sanitizeRecentFinds({}),[]);
});

test('Une première découverte Chromatique ou une fabrication rejoint le journal',()=>{
  let history=recordRecentFind([],3,'new');
  history=recordRecentFind(history,3,'chromatic');
  history=recordRecentFind(history,22,'forge');
  assert.deepEqual(history,[
    {id:22,kind:'forge'},{id:3,kind:'chromatic'},{id:3,kind:'new'}
  ]);
  assert.deepEqual(recordRecentFind(history,999,'new'),history);
});

test('Raretés, vitrines et découvertes reflètent les possessions réelles',()=>{
  const owned={1:5,7:1,22:1};
  const result=buildLivingArchive(CARDS,CARDS,owned,{7:true},
    [{id:22,kind:'forge'},{id:4,kind:'new'},{id:7,kind:'chromatic'}]);
  assert.equal(result.discovered,3);
  assert.equal(result.chromatic,1);
  assert.equal(result.featured[0].id,22);
  assert.deepEqual(result.recent.map(e=>e.id),[22,7]);
  assert.equal(result.rarities.find(x=>x.key==='common').collected,1);
});
