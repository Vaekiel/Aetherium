/* AETHERIUM 1.7.3 — Défis des Maîtres.
   Pure, cosmetic achievements derived from existing saved victory records.
   Old aggregate victories unlock Bronze only; detailed requirements are
   granted from trustworthy mode-specific metrics recorded since 1.7.3. */
export const TRIAL_MEDAL_NAMES=Object.freeze(['Bronze','Argent','Or']);
export const TRIAL_CHALLENGES=Object.freeze([
  Object.freeze({
    silver:Object.freeze({limit:1,text:'Aventure / Maîtrise · 1 erreur max'}),
    gold:Object.freeze({limit:0,text:'Maîtrise · aucune erreur'})
  }),
  Object.freeze({
    silver:Object.freeze({limit:12,text:'Aventure / Maîtrise · 12 coups max'}),
    gold:Object.freeze({limit:10,text:'Maîtrise · 10 coups max'})
  }),
  Object.freeze({
    silver:Object.freeze({limit:1,text:'Aventure / Maîtrise · 1 essai raté max'}),
    gold:Object.freeze({limit:0,text:'Maîtrise · aucun essai raté'})
  }),
  Object.freeze({
    silver:Object.freeze({limit:4,text:'Aventure / Maîtrise · 4 sondes max'}),
    gold:Object.freeze({limit:2,text:'Maîtrise · 2 sondes max'})
  }),
  Object.freeze({
    silver:Object.freeze({limit:1,text:'Aventure / Maîtrise · 1 mélange raté max'}),
    gold:Object.freeze({limit:0,text:'Maîtrise · aucun mélange raté'})
  })
]);
const validWins=number=>Number.isSafeInteger(number)&&number>0&&number<=999999;
const qualified=(entry,limit)=>entry&&typeof entry==='object'&&
  validWins(entry.wins)&&Number.isSafeInteger(entry.bestMetric)&&
  entry.bestMetric>=0&&entry.bestMetric<=limit&&
  Number.isSafeInteger(entry.bestScore)&&entry.bestScore>=0&&entry.bestScore<=100;
export function trialChallengesFor(index,aggregate,personal){
  const config=TRIAL_CHALLENGES[index];
  if(!config)return [];
  const stats=aggregate&&typeof aggregate==='object'?aggregate:{};
  const records=personal&&typeof personal==='object'?personal:{};
  const existingWin=validWins(stats.wins)||
    ['initiation','aventure','maitrise'].some(mode=>validWins(records[mode]?.wins));
  const silver=qualified(records.aventure,config.silver.limit)||
    qualified(records.maitrise,config.silver.limit);
  const gold=qualified(records.maitrise,config.gold.limit);
  return [
    {id:'bronze',name:'Bronze',description:'Remporter une victoire',earned:!!existingWin||!!silver||!!gold},
    {id:'argent',name:'Argent',description:config.silver.text,earned:!!silver||!!gold},
    {id:'or',name:'Or',description:config.gold.text,earned:!!gold}
  ];
}
export function trialChallengeCount(index,aggregate,personal){
  return trialChallengesFor(index,aggregate,personal).filter(item=>item.earned).length;
}
