import assert from 'node:assert/strict';
import {ARCANE_CIRCUITS,createCircuitSession} from '../src/arcane-circuits.js';
import {trialReward} from '../src/trial-progress.js';
const s=createCircuitSession();
assert.equal(s.view(),null);
assert.equal(s.start('unknown'),false);
for(const c of ARCANE_CIRCUITS){
 assert.equal(new Set(c.games).size,3);
 assert.ok(c.games.every(g=>g>=0&&g<5));
 assert.equal(s.start(c.id),true);assert.equal(s.view().step,0);
 assert.equal(s.victory(c.games[0],c.mode,100).advanced,false);
 assert.equal(s.arm(true),false);
 assert.equal(s.arm(),true);
 assert.equal(s.victory(c.games[0],c.mode,100,true).advanced,false);
 assert.equal(s.victory(c.games[1],c.mode,100).advanced,false);
 assert.equal(s.victory(c.games[0],c.mode==='initiation'?'maitrise':'initiation',100).advanced,false);
 assert.equal(s.victory(c.games[0],c.mode,101).advanced,false);
 s.pause();assert.equal(s.victory(c.games[0],c.mode,100).advanced,false);
 for(let i=0;i<3;i++){
  assert.equal(s.arm(),true);
  const result=s.victory(c.games[i],c.mode,100-i*10);
  assert.equal(result.advanced,true);
  assert.equal(result.finished,i===2);
  assert.equal(s.victory(c.games[i],c.mode,100).advanced,false,'Duplicate and unarmed wins never count');
 }
 assert.equal(s.view().total,270);assert.equal(s.view().best,270);assert.equal(s.view().max,300);
 assert.equal(s.arm(),false);
 s.view().scores.push(100);assert.equal(s.view().total,270,'View is a copy');
 s.leave();assert.equal(s.view(),null);assert.equal(s.best(c.id),270);
 s.start(c.id);
 for(const game of c.games){s.arm();s.victory(game,c.mode,60)}
 assert.equal(s.view().total,180);assert.equal(s.best(c.id),270);
 s.start(c.id);
 for(const game of c.games){s.arm();s.victory(game,c.mode,100)}
 assert.equal(s.best(c.id),300);
}
s.reset();assert.equal(s.view(),null);assert.ok(ARCANE_CIRCUITS.every(c=>s.best(c.id)===null));
assert.equal([35,45,50].reduce((n,b)=>n+trialReward(b,'initiation',100),0),130);
console.log('Arcane circuits: three permanent circuits, ordered armed victories, difficulty and expedition isolation, pause/replay, personal session best, reset and ordinary rewards OK.');
