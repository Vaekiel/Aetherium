/* Presentation metadata is separate from probabilities and the saved inventory.
   Only a released collection with a registered presentation may open a pack. */
import {boosterById} from './collection-data.js?v=seasons-09';
const view=(title,label,description,message,theme,art)=>Object.freeze({title,label,description,message,theme,art});
export const BOOSTER_VIEWS=Object.freeze({
  origines:view('ORIGINES','Booster des Origines','Cinq cartes à révéler, dont au moins une Inhabituelle.','Les archives attendent leur voyageur.','origines','./assets/boosters/origines-unified-v5.webp'),
  'reflets-brises':view('REFLETS BRISÉS','Booster des Reflets brisés','Cinq cartes issues du Revers, dont au moins une Inhabituelle.','Les miroirs du Revers t’attendent.','reflets','./assets/boosters/reflets-brises-unified-v5.webp'),
  'au-dela-du-verre':view('AU-DELÀ DU VERRE','Booster Au-delà du Verre','Cinq cartes venues d’au-delà du Verre, dont au moins une Inhabituelle. Le reste attend d’être découvert.','Deux rives, un même horizon.','au-dela','./assets/boosters/au-dela-du-verre-unified-v5.webp')
});
export function boosterView(id){
  const booster=boosterById(id);
  const view=Object.hasOwn(BOOSTER_VIEWS,id)?BOOSTER_VIEWS[id]:null;
  if(!booster||!view)return null;
  const {season,collection}=booster;
  const roman=['','I','II','III','IV','V','VI','VII','VIII','IX','X'][season.number]??String(season.number);
  return {...view,season,collection,edition:'SAISON '+season.number+' · 5 CARTES',
    kicker:'SAISON '+roman+' · '+season.title.toLocaleUpperCase('fr-FR')+' · PARTIE '+collection.number};
}
