/* AETHERIUM — Quiet, accessible highlights only after a booster is revealed.
   Pure presentation helper: never changes the cards, odds or wallet. */
const RARITY_PRIORITY=Object.freeze({common:0,uncommon:1,rare:2,epic:3,legendary:4});

export function boosterMoment(draw){
  if(!Array.isArray(draw)||!draw.length)return null;
  const chromatic=draw.find(item=>item?.shiny===true&&typeof item.card?.name==='string');
  if(chromatic)return Object.freeze({
    kind:'chromatic',symbol:'✧',title:'Éclat chromatique',
    detail:chromatic.card.name
  });
  const rarest=draw.filter(item=>item?.card?.rarity in RARITY_PRIORITY)
    .sort((a,b)=>RARITY_PRIORITY[b.card.rarity]-RARITY_PRIORITY[a.card.rarity])[0];
  if(!rarest)return null;
  if(rarest.card.rarity==='legendary')return Object.freeze({
    kind:'legendary',symbol:'✦',title:'Une légende révélée',
    detail:rarest.card.name
  });
  if(rarest.card.rarity==='epic')return Object.freeze({
    kind:'epic',symbol:'✧',title:'Une relique épique',
    detail:rarest.card.name
  });
  return null;
}
