/* Atelier des Arcanes — pure, auditable crafting rules.
   No random draws, no shiny creation, no changes to booster odds. */
export const CRAFT_COSTS=Object.freeze({
  common:20,
  uncommon:45,
  rare:100,
  epic:220,
  legendary:450
});

export function getCraftCost(card){
  if(!card||card.signature===true||card.id===72||!Object.prototype.hasOwnProperty.call(CRAFT_COSTS,card.rarity))return null;
  return CRAFT_COSTS[card.rarity];
}

export function craftCard(state,card){
  const cost=getCraftCost(card);
  if(cost===null||!Number.isSafeInteger(card.id)||card.id<1)
    return {ok:false,reason:'Carte inconnue.'};
  if(!state||typeof state!=='object')
    return {ok:false,reason:'Sauvegarde indisponible.'};
  if((state.owned?.[card.id]||0)>0)
    return {ok:false,reason:'Cette carte est déjà dans ton Codex.'};
  if(!Number.isSafeInteger(state.dust)||state.dust<cost)
    return {ok:false,reason:'Éclats insuffisants.'};
  return {
    ok:true,
    cost,
    state:{
      ...state,
      dust:state.dust-cost,
      owned:{...state.owned,[card.id]:1},
      goalId:state.goalId===card.id?null:(state.goalId??null)
    }
  };
}
