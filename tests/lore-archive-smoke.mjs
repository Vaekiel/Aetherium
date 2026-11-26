import assert from 'node:assert/strict';
import {CARDS} from '../src/collection-data.js';
import {LORE_ECHOES,loreArchive} from '../src/lore-archive.js';
import {COLLECTION_MILESTONES} from '../src/collection-milestones.js';
import {EXPEDITION_ROUTES} from '../src/expeditions.js';
const get=(state,id)=>loreArchive(CARDS,state).find(g=>g.id===id);
const all=state=>loreArchive(CARDS,state).flatMap(g=>g.entries);
const empty={owned:{},collectionMilestones:{},expedition:{}};
assert.deepEqual(loreArchive(CARDS,empty).map(g=>[g.total,g.unlocked]),[[7,0],[12,0],[4,0]]);
for(const entry of all(empty))assert.deepEqual(Object.keys(entry).sort(),['id','progress','title','unlocked']);
for(const echo of LORE_ECHOES){
 assert.equal(echo.cards.length,new Set(echo.cards).size);
 assert.ok(echo.cards.every(id=>CARDS.some(c=>c.id===id)));
 assert.ok(echo.body.length>180);
 const partial={owned:Object.fromEntries(echo.cards.slice(0,-1).map(id=>[id,1]))};
 const locked=get(partial,'echoes').entries.find(e=>e.id===echo.id);
 assert.equal(locked.unlocked,false);assert.equal(locked.body,undefined);
 assert.ok(!JSON.stringify(locked).includes(echo.title));
 if(!echo.finale){
  const found={owned:Object.fromEntries(echo.cards.map(id=>[id,1]))};
  const item=get(found,'echoes').entries.find(e=>e.id===echo.id);
  assert.equal(item.unlocked,true);assert.equal(item.body,echo.body);
  assert.deepEqual(item.cards.map(c=>c.id),[...echo.cards]);
 }
}
const owned=Object.fromEntries(CARDS.map(c=>[c.id,1]));
const partial={owned,collectionMilestones:{'marches-de-verre/origines':[6]},expedition:{completedRoutes:['verriers']}};
const groups=loreArchive(CARDS,partial);
assert.deepEqual(groups.map(g=>[g.total,g.unlocked]),[[7,6],[12,1],[4,1]]);
assert.equal(get(partial,'fragments').entries[0].body,COLLECTION_MILESTONES['marches-de-verre/origines'][0].fragment);
assert.equal(get(partial,'routes').entries[0].body,EXPEDITION_ROUTES[0].ending);
assert.equal(get(partial,'echoes').entries[6].unlocked,false);
const complete={owned,collectionMilestones:Object.fromEntries(Object.entries(COLLECTION_MILESTONES).map(([k,v])=>[k,v.map(x=>x.threshold)])),expedition:{completedRoutes:EXPEDITION_ROUTES.map(r=>r.id)}};
const before=JSON.stringify(complete);
assert.ok(all(complete).every(entry=>entry.unlocked&&entry.body));
assert.equal(all(complete).length,23);
assert.equal(JSON.stringify(complete),before);
const noSignature={...complete,owned:{...owned}};delete noSignature.owned[72];
assert.equal(get(noSignature,'echoes').entries[6].unlocked,false);
assert.equal(get(noSignature,'routes').entries[3].unlocked,false);
assert.equal(get(noSignature,'fragments').entries[11].unlocked,false);
assert.equal(get({...complete,expedition:{completedRoutes:['dernier-accord']}},'routes').entries[3].unlocked,false);
assert.equal(get(empty,'fragments').entries.filter(e=>e.body).length,0);
assert.ok(!JSON.stringify(loreArchive(CARDS,empty)).includes('Néméria'));
assert.ok(!JSON.stringify(loreArchive(CARDS,empty)).includes('Cœur des Marches'));
assert.ok(!JSON.stringify(loreArchive(CARDS,empty)).includes('Le Plateau'));
console.log('Lore archive: 23 pages, seven original echoes, exact card gates, claimed journal and completed routes, sealed redaction, finale protection and read-only state OK.');
