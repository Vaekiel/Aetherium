/* AETHERIUM — Annales des Marches. A read-only anthology of earned lore.
 * Locked entries deliberately return no title, text, card IDs or source names.
 * No new claims, inventory, currencies, unlock persistence or spoiler previews.
 */
import {SEASONS,cardsForCollection} from './seasons.js?v=au-dela-booster-1';
import {collectionMilestoneStatus} from './collection-milestones.js?v=au-dela-journal-1';
import {sanitizeExpedition,EXPEDITION_ROUTES,FINALE_ID,canStartFinale} from './expeditions.js?v=dernier-accord-1';
const echo=(id,chapter,cards,title,body,finale=false)=>Object.freeze({id,chapter,cards:Object.freeze(cards),title,body,finale});
export const LORE_ECHOES=Object.freeze([
 echo('echo-01','origines',[1,2,6],'Les lanternes du sentier',
  'Sylve avait coutume de marquer les chemins sûrs d’un trait de craie. Dans les ruines, les marques disparaissaient sous l’humidité. Elle apprit alors à suivre la Veilleuse de Nacre : sa lumière ne s’éloignait jamais du dernier voyageur. Les feux follets, eux, dansaient à l’écart. Depuis, les marcheurs distinguent les lueurs qui attendent de celles qui appellent.'),
 echo('echo-02','origines',[7,10,14],'La minute qui manque',
  'Dans un livre sans date, l’Archiviste Nocturne a noté une étrange observation : l’Horloge du Néant avance parfois alors que toutes les autres restent immobiles. À cet instant, une lame prismatique posée sur la table montre un reflet différent de la pièce. L’Archiviste n’a pas cherché à corriger cette minute. Il lui a laissé une page blanche.'),
 echo('echo-03','reflets-brises',[25,26,31],'Le carrefour absent',
  'La Cartographe des Absents a retrouvé, dans un éclat de miroir, le plan d’une rue qu’aucun habitant ne reconnaissait. La Guetteuse du Revers lui a indiqué l’endroit où s’arrêter : là où les pavés finissaient, une autre perspective continuait dans le verre. La cartographe a dessiné les deux moitiés du carrefour, sans décider laquelle devait figurer en premier.'),
 echo('echo-04','reflets-brises',[33,41,43],'Le fil derrière la porte',
  'Les portes du Palais des Dédoublés ne débouchent pas toujours sur la même salle. Un voyageur a tendu un fil entre deux seuils pour retrouver son chemin. Le Gardien du seuil inversé ne l’a pas empêché de passer ; il a attendu qu’il consente à regarder de l’autre côté. Lorsque le fil a vibré, aucune des deux portes ne s’est refermée.'),
 echo('echo-05','au-dela-du-verre',[49,51,54],'La chaleur partagée',
  'Un jour de brume, la boussole d’un voyageur s’est immobilisée entre deux sentiers. Le Passeur des Aubes a suspendu les lanternes jumelles de part et d’autre du passage. Les flammes se sont répondu, et l’aiguille s’est tournée vers elles. Le voyageur a compris que certains chemins se trouvent non en choisissant une direction, mais en retrouvant ceux que l’on attend.'),
 echo('echo-06','au-dela-du-verre',[55,56,65],'Les noms sur le métier',
  'L’Émissaire des Possibles a confié deux lettres à la Tisserande de Quartz. Elles racontaient des souvenirs différents d’un même lieu. L’artisane a noué les fils sans en retirer aucun. Sur la bordure, elle a laissé assez d’espace pour que chaque voyageur y inscrive son nom. Ainsi se transmet le Serment des Passages : aucune mémoire n’a besoin d’en effacer une autre pour être entendue.'),
 echo('echo-07','au-dela-du-verre',[68,71,72],'Une page encore blanche',
  'Au retour du Dernier Accord, les voyageurs ont confié aux Archives le récit de leur traversée. Aelys en a protégé les voix distinctes. Sous les ailes du Phénix, le Cœur des Marches a gardé leur lumière commune. La dernière page du registre demeure blanche, non parce que le passé est oublié, mais parce que nul ne peut encore écrire les choix de ceux qui viendront.',true)
]);
const owns=(owned,id)=>Number.isSafeInteger(owned?.[id])&&owned[id]>0;
const locked=(id,title,progress)=>({id,unlocked:false,title,progress});
const revealed=(id,title,body,source,cards=[])=>({id,unlocked:true,title,body,source,cards});
const group=(id,label,entries)=>({id,label,entries,unlocked:entries.filter(e=>e.unlocked).length,total:entries.length});
export function loreArchive(cards,state={}){
 const owned=state.owned||{};
 const published=SEASONS.flatMap(season=>season.collections.filter(part=>part.released)
   .map(part=>({season,part,cards:cardsForCollection(cards,season.id,part.id)}))).filter(entry=>entry.cards.length);
 const byId=new Map(published.flatMap(entry=>entry.cards).map(card=>[card.id,card]));
 const expedition=sanitizeExpedition(state.expedition);
 const completed=new Set(expedition.completedRoutes);
 const finaleCompleted=completed.has(FINALE_ID)&&canStartFinale(expedition);
 const finale=finaleCompleted&&owns(owned,72)&&byId.has(72);
 const echoes=LORE_ECHOES.filter(e=>e.cards.every(id=>byId.has(id))).map((e,index)=>{
  const progress=e.cards.filter(id=>owns(owned,id)).length;
  if(progress!==e.cards.length||(e.finale&&!finale))
   return locked(e.id,'Écho scellé '+String(index+1).padStart(2,'0'),progress+' / '+e.cards.length+' archives liées retrouvées'+(e.finale&&!finaleCompleted?' · récit d’expédition à achever':''));
  const part=published.find(p=>p.part.id===e.chapter);
  return revealed(e.id,e.title,e.body,part?.part.title||'Les Marches de Verre',e.cards.map(id=>({id,name:byId.get(id).name})));
 });
 const fragments=published.flatMap(({season,part,cards:partCards})=>
  collectionMilestoneStatus(season.id,part.id,partCards,owned,state.collectionMilestones).map((entry,index)=>{
   const id='journal-'+part.id+'-'+index;
   const signatureProtected=part.signature&&entry.threshold===part.plannedCards&&!owns(owned,part.last);
   return entry.status==='claimed'&&!signatureProtected
    ?revealed(id,entry.title,entry.fragment,part.title)
    :locked(id,'Fragment scellé · '+part.title,entry.status==='claimable'?'À révéler dans le Journal des découvertes':entry.threshold+' archives · Journal des découvertes');
  }));
 const routes=EXPEDITION_ROUTES.map((route,index)=>{
  const id='route-'+index;
  return completed.has(route.id)&&(route.id!==FINALE_ID||finale)
   ?revealed(id,route.fragment,route.ending,route.name)
   :locked(id,'Récit scellé '+String(index+1).padStart(2,'0'),'Terminer l’expédition correspondante');
 });
 return [group('echoes','Les Échos du Codex',echoes),group('fragments','Le Journal retrouvé',fragments),group('routes','Les Récits des voyageurs',routes)];
}
