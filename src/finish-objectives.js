/* Attainable collection objectives. A Signature evolves in the finale:
 * its Normal is not permanently collectible alongside its Chromatique.
 * Count it once as a discovery, and only in the Chromatique finish objective.
 * Never mutate or hide any actual inventory, including old imports.
 */
import {FINISH_KEYS,finishQuantity} from './finishes.js?v=finish-order-2';
export function finishObjective(cards,counts,finish){
 if(!FINISH_KEYS.includes(finish))throw new Error('Finition inconnue');
 const eligible=cards.filter(card=>!card.signature||finish==='chromatic');
 const unique=eligible.filter(card=>finishQuantity(counts,finish,card.id)>0).length;
 const copies=eligible.reduce((n,card)=>n+finishQuantity(counts,finish,card.id),0);
 return {total:eligible.length,unique,copies,percent:eligible.length?100*unique/eligible.length:0};
}
