/* Collection planning uses the real inventory and the same Forge eligibility
 * as the transaction itself. Signature is never a craft recipe. */
import {FINISH_KEYS} from './finishes.js?v=finish-order-2';
import {finishObjective} from './finish-objectives.js?v=signature-targets-1';
import {canCraftFinish,getFinishCraftCost} from './finish-crafting.js?v=forge-finish-1';
export function completionRecipes(state,card){
 return FINISH_KEYS.filter(finish=>canCraftFinish(state,card,finish))
  .map(finish=>({finish,cost:getFinishCraftCost(card,finish)}));
}
export function completionPlan(cards,state){
 return FINISH_KEYS.map(finish=>{
  const progress=finishObjective(cards,state.finishCounts,finish);
  const recipes=cards.filter(card=>canCraftFinish(state,card,finish));
  const costs=recipes.map(card=>getFinishCraftCost(card,finish));
  return {finish,...progress,missing:progress.total-progress.unique,
   recipes:recipes.length,cost:costs.reduce((sum,n)=>sum+n,0),
   affordable:costs.filter(n=>n<=state.dust).length};
 });
}
export function filterCompletionRecipes(cards,state,finish){
 if(!FINISH_KEYS.includes(finish))return cards;
 return cards.filter(card=>canCraftFinish(state,card,finish));
}
