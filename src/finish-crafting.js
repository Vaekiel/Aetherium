/* Targeted finish forging; adds a copy, never consumes a previous one. */
import {CRAFT_COSTS,getCraftCost} from './crafting.js';
import {restoreFinishCounts,finishQuantity} from './finishes.js?v=finish-order-2';
export const FINISH_CRAFT_COSTS=Object.freeze({
 normal:CRAFT_COSTS,
 calligraphic:Object.freeze({common:45,uncommon:75,rare:120,epic:190,legendary:300}),
 chromatic:Object.freeze({common:35,uncommon:60,rare:95,epic:150,legendary:240}),
 holographic:Object.freeze({common:55,uncommon:90,rare:145,epic:230,legendary:360})
});
export function getFinishCraftCost(card,finish){
 if(getCraftCost(card)===null||!Object.hasOwn(FINISH_CRAFT_COSTS,finish))return null;
 return FINISH_CRAFT_COSTS[finish][card.rarity]??null;
}
export function canCraftFinish(state,card,finish){
 return getFinishCraftCost(card,finish)!==null&&Number.isSafeInteger(state?.owned?.[card.id])
  &&state.owned[card.id]>0&&state.owned[card.id]<999999
  &&!(finish==='chromatic'&&state.shiny?.[card.id]===true)
  &&finishQuantity(state.finishCounts,finish,card.id)===0;
}
export function craftFinish(state,card,finish){
 const cost=getFinishCraftCost(card,finish);
 if(cost===null)return {ok:false,reason:'Finition réservée ou inconnue.'};
 if(!state||!Number.isSafeInteger(state.owned?.[card.id])||!state.owned[card.id])
  return {ok:false,reason:'Découvre d’abord cette carte.'};
 const counts=restoreFinishCounts(state.owned,state.shiny,state.finishCounts);
 if(!canCraftFinish({...state,finishCounts:counts},card,finish))
  return {ok:false,reason:'Finition déjà possédée ou inventaire plein.'};
 if(!Number.isSafeInteger(state.dust)||state.dust<cost)
  return {ok:false,reason:'Éclats insuffisants.'};
 const owned={...state.owned,[card.id]:state.owned[card.id]+1};
 counts[finish][card.id]=1;
 const shiny={...(state.shiny||{})};
 if(finish==='chromatic')shiny[card.id]=true;
 return {ok:true,cost,state:{...state,dust:state.dust-cost,owned,shiny,finishCounts:counts}};
}
