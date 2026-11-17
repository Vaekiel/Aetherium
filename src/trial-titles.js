/* AETHERIUM 1.7.3 — Honorific titles. Cosmetic only.
   The existing Gold medals are the sole source of unlocking.
   A saved selection is honored only while its Gold medal remains earned. */
import {trialChallengesFor} from './trial-challenges.js';

export const TRIAL_TITLES=Object.freeze([
  Object.freeze({id:0,name:'Gardien des Runes',trial:'Chemin runique',symbol:'✧'}),
  Object.freeze({id:1,name:'Archiviste des Souvenirs',trial:'Mémoire ancienne',symbol:'◈'}),
  Object.freeze({id:2,name:'Maître des Sceaux',trial:'Serrure d’Éther',symbol:'◇'}),
  Object.freeze({id:3,name:'Explorateur des Ruines',trial:'Fouilles interdites',symbol:'✦'}),
  Object.freeze({id:4,name:'Grand Alchimiste',trial:'Laboratoire arcanique',symbol:'❖'})
]);

export function earnedTrialTitles(rawStats,rawRecords){
  const stats=Array.isArray(rawStats)?rawStats:[];
  const records=Array.isArray(rawRecords)?rawRecords:[];
  return TRIAL_TITLES.map(title=>Object.freeze({
    ...title,
    earned:trialChallengesFor(title.id,stats[title.id],records[title.id])
      .some(medal=>medal.id==='or'&&medal.earned)
  }));
}

export function validEquippedTitle(rawId,stats,records){
  if(!Number.isInteger(rawId)||rawId<0||rawId>=TRIAL_TITLES.length)return null;
  const title=earnedTrialTitles(stats,records)[rawId];
  return title?.earned?rawId:null;
}

export function toggleEquippedTitle(rawId,requestedId,stats,records){
  const requested=validEquippedTitle(requestedId,stats,records);
  if(requested===null)return validEquippedTitle(rawId,stats,records);
  return validEquippedTitle(rawId,stats,records)===requested?null:requested;
}
