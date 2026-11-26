/* AETHERIUM — Published collections. The Origines data and RNG remain intact.
   New Reflets cards are sourced from the approved, fully illustrated catalogue. */
import {CARDS as ORIGINES_CARDS,drawPackFromPool} from './data.js?v=booster-variety-1';
import {REFLETS_BRISES_DRAFT} from './reflets-brises-catalog.js';
import {AU_DELA_DU_VERRE_DRAFT} from './au-dela-du-verre-catalog.js';
import {SEASONS} from './seasons.js?v=seasons-09';

export const REFLETS_CARDS=Object.freeze(REFLETS_BRISES_DRAFT.map((card,i)=>Object.freeze({
  id:card.id,name:card.name,type:card.type,rarity:card.rarity,lore:card.lore,
  attack:3+Math.floor(i*1.4),health:5+Math.floor(i*1.2),
  series:'Les Reflets brisés'
})));
// The finale contains 23 pack cards and one story-only Signature (ID 72).
// Keep the full 24-card Codex visible, but explicitly exclude the Signature
// from the RNG pool, crafting and general booster purchases.
export const AU_DELA_CARDS=Object.freeze(AU_DELA_DU_VERRE_DRAFT.map((card,i)=>Object.freeze({
  id:card.id,name:card.name,type:card.type,rarity:card.rarity,lore:card.lore,
  attack:3+Math.floor(i*1.4),health:5+Math.floor(i*1.2),
  series:'Au-delà du Verre',signature:card.signature,
  boosterEligible:card.boosterEligible
})));
export const AU_DELA_BOOSTER_CARDS=Object.freeze(AU_DELA_CARDS.filter(card=>card.boosterEligible));
// Register one authored group per released collection. Draft groups are never
// added to the playable catalogue merely because their IDs have been reserved.
export const CARD_GROUPS=Object.freeze({
  origines:ORIGINES_CARDS,
  'reflets-brises':REFLETS_CARDS,
  'au-dela-du-verre':AU_DELA_CARDS
});
export function buildPublishedCatalog(seasons,groups){
  const cards=[];
  for(const season of seasons)for(const part of season.collections){
    if(!part.released)continue;
    const group=Object.hasOwn(groups,part.id)?groups[part.id]:null;
    if(!Array.isArray(group))throw new Error('Missing published collection: '+part.id);
    cards.push(...group);
  }
  return Object.freeze(cards);
}
export const CARDS=buildPublishedCatalog(SEASONS,CARD_GROUPS);
export const CARD_BY_ID=new Map(CARDS.map(card=>[card.id,card]));

// Published collections are the only source of booster pools. Keep the
// existing card objects, order and RNG so historical saves and draws are stable.
export function buildBoosterRegistry(seasons,cards){
  const registry=new Map();
  for(const season of seasons)for(const collection of season.collections){
    if(!collection.released)continue;
    if(registry.has(collection.id))throw new Error('Duplicate collection ID: '+collection.id);
    const pool=Object.freeze(cards.filter(card=>card.id>=collection.first&&card.id<=collection.last&&card.signature!==true&&card.boosterEligible!==false));
    registry.set(collection.id,Object.freeze({season,collection,pool}));
  }
  return registry;
}
export const BOOSTER_REGISTRY=buildBoosterRegistry(SEASONS,CARDS);
export const boosterById=id=>BOOSTER_REGISTRY.get(id)??null;
export function drawCollectionPack(id,rng=Math.random){
  const booster=boosterById(id);
  if(!booster)throw new Error('Booster indisponible : '+id);
  return drawPackFromPool(booster.pool,rng);
}
// Historical exports stay available to existing callers and smoke tests.
export function drawRefletsPack(rng=Math.random){return drawCollectionPack('reflets-brises',rng)}
export function drawAuDelaPack(rng=Math.random){return drawCollectionPack('au-dela-du-verre',rng)}
