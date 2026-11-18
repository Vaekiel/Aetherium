/* AETHERIUM — Published collections. The Origines data and RNG remain intact.
   New Reflets cards are sourced from the approved, fully illustrated catalogue. */
import {CARDS as ORIGINES_CARDS,rollRarity,CHROMATIC_RATE} from './data.js';
import {REFLETS_BRISES_DRAFT} from './reflets-brises-catalog.js';

export const REFLETS_CARDS=Object.freeze(REFLETS_BRISES_DRAFT.map((card,i)=>Object.freeze({
  id:card.id,name:card.name,type:card.type,rarity:card.rarity,lore:card.lore,
  attack:3+Math.floor(i*1.4),health:5+Math.floor(i*1.2),
  series:'Les Reflets brisés'
})));
export const CARDS=Object.freeze([...ORIGINES_CARDS,...REFLETS_CARDS]);
export const CARD_BY_ID=new Map(CARDS.map(card=>[card.id,card]));

// A separate 24-card pool prevents crossover between the two boosters.
// Fifth card retains the exact guaranteed-uncommon roll; Chromatics stay 3%.
export function drawRefletsPack(rng=Math.random){
  return Array.from({length:5},(_,i)=>{
    const rarity=rollRarity(rng,i===4);
    const available=REFLETS_CARDS.filter(card=>card.rarity===rarity);
    const sample=Math.min(available.length-1,Math.floor(rng()*available.length));
    return {id:available[sample].id,shiny:rng()<CHROMATIC_RATE};
  });
}
