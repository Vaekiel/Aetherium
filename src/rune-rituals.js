/* AETHERIUM 1.7.2 — Three fair, explicitly explained rune sequences.
   A ritual is always a complete permutation of the original twelve runes.
   No change to the underlying reward, score, card save or sprite mapping. */
const ascending=Object.freeze(Array.from({length:12},(_,index)=>index+1));
const descending=Object.freeze([...ascending].reverse());
const mirrored=Object.freeze(Array.from({length:12},(_,index)=>
  index%2===0?index/2+1:12-(index-1)/2));
export const RUNE_RITUALS=Object.freeze([
  Object.freeze({id:'ascendant',title:'L’Éveil des pierres',
    rule:'Active les runes de 1 à 12, dans l’ordre ancestral.',
    order:ascending}),
  Object.freeze({id:'descendant',title:'L’Écho des pierres',
    rule:'Le sceau se referme : active les runes de 12 à 1.',
    order:descending}),
  Object.freeze({id:'miroir',title:'Le Chemin des reflets',
    rule:'Alterne les extrêmes : 1, 12, 2, 11, 3, 10… jusqu’au centre.',
    order:mirrored})
]);
export function runeRitualsFor(difficulty='aventure'){
  const ids=difficulty==='initiation'?['ascendant']:
    difficulty==='maitrise'?['ascendant','descendant','miroir']:
    ['ascendant','descendant'];
  return RUNE_RITUALS.filter(ritual=>ids.includes(ritual.id));
}
export function nextRuneRitual(difficulty='aventure',previousId=null,random=Math.random){
  const available=runeRitualsFor(difficulty);
  const candidates=available.length>1
    ?available.filter(ritual=>ritual.id!==previousId)
    :available;
  const draw=Number(random());
  const normalized=Number.isFinite(draw)?Math.max(0,Math.min(draw,1-Number.EPSILON)):0;
  return candidates[Math.floor(normalized*candidates.length)];
}
export const runeExpectedAt=(ritual,step)=>ritual?.order?.[step]??null;
