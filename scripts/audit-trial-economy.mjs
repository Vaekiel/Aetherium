// Read-only audit: actual rewards and safe-probe rules, hypothetical time scenarios.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DIFFICULTIES,trialRules,trialReward,trialScore} from '../src/trial-progress.js';
import {makeExcavationSite,chooseExcavationGuide} from '../src/excavation-sites.js';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const trialBlock=source.slice(source.indexOf('const definitions=['),source.indexOf('const mini=[];'));
const trials=[...trialBlock.matchAll(/name:'([^']+)'[^\n]+reward:(\d+)/g)].map(m=>({name:m[1],base:Number(m[2])}));
assert.equal(trials.length,5);
const round=n=>Number(n.toFixed(2));
const expectedPerHour=(reward,success,seconds)=>3600*reward*success/seconds;
for(const t of trials){
 const base=t.base;
 const low=Object.fromEntries(DIFFICULTIES.map(m=>[m.id,trialReward(base,m.id,0)]));
 const high=Object.fromEntries(DIFFICULTIES.map(m=>[m.id,trialReward(base,m.id,100)]));
 const thresholds={
  masteryVsAdventureEqualDurationOrdinary:round(100*low.aventure/low.maitrise),
  masteryVsAdventureEqualDurationPerfect:round(100*high.aventure/high.maitrise),
  masteryVsAdventure25PercentLongerPerfect:round(125*high.aventure/high.maitrise),
  adventureVsInitiationEqualDurationPerfect:round(100*high.initiation/high.aventure)
 };
 const scenarios=[30,60,90].map(seconds=>({seconds,success:.8,adventure:round(expectedPerHour(high.aventure,.8,seconds)),mastery:round(expectedPerHour(high.maitrise,.8,seconds))}));
 console.log('TRIAL_ECONOMY '+JSON.stringify({name:t.name,low,high,thresholds,scenarios}));
}
function seeded(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
for(const {id:mode} of DIFFICULTIES){
 const rng=seeded(18173),target=trialRules(3,mode).safeTarget;
 let victories=0;
 for(let i=0;i<1000;i++){
  const site=makeExcavationSite(null,rng);
  const dug=new Set([site.entrance]);
  assert.ok(!site.bombs.has(site.entrance));
  for(let n=1;n<target;n++){
   const guide=chooseExcavationGuide(site,dug,rng);
   assert.ok(guide&&!site.bombs.has(guide.index)&&!dug.has(guide.index));
   dug.add(guide.index);
  }
  if(dug.size===target)victories++;
 }
 assert.equal(victories,1000);
 const hints=target-1,score=trialScore(3,{hints});
 console.log('TRIAL_SAFE_PROBES '+JSON.stringify({mode,simulations:1000,victories,safeTiles:target,hints,minActions:target+hints,score,reward:trialReward(trials[3].base,mode,score)}));
}
console.log('Trial economy audit complete: no reward or gameplay changes; hourly examples are assumptions, not player telemetry.');
