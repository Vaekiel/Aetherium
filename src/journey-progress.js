/* Permanent, cosmetic journey objectives. No new state, claim, XP or payout.
 * Only real saved progress is used; aggregate legacy wins do not invent
 * difficulty-specific records. Fully released seasons have stable objectives.
 */
import {SEASONS,cardsForCollection} from './seasons.js?v=au-dela-booster-1';
import {FINISH_KEYS} from './finishes.js?v=finish-order-2';
import {finishObjective} from './finish-objectives.js?v=signature-targets-1';
import {sanitizedTrialStats} from './trial-progress.js?v=mastery-balance-2';
import {TRIAL_RECORD_MODES,sanitizedTrialRecords} from './trial-records.js';
import {trialChallengesFor} from './trial-challenges.js';
import {sanitizeExpedition,EXPEDITION_ROUTES} from './expeditions.js?v=dernier-accord-1';
import {sanitizeAlchemyKnown,ALCHEMY_RECIPE_COUNT} from './alchemy-rituals.js';
import {milestonesFor,collectionMilestoneStatus} from './collection-milestones.js?v=au-dela-journal-1';
const count=n=>Number.isSafeInteger(n)&&n>=0?n:0;
function track(id,label,description,current,thresholds,page){
 const targets=[...new Set(thresholds.filter(n=>Number.isSafeInteger(n)&&n>0))].sort((a,b)=>a-b);
 const total=targets.at(-1)||0,achieved=targets.filter(n=>current>=n).length;
 return {id,label,description,current,total,targets,achieved,next:targets.find(n=>n>current)??null,
   complete:total>0&&current>=total,percent:total?Math.min(100,100*current/total):0,page};
}
export function journeyProgress(cards,state={}){
 const collection=[];
 for(const season of SEASONS){
  if(!season.collections.every(part=>part.released))continue;
  const seasonCards=season.collections.flatMap(part=>cardsForCollection(cards,season.id,part.id));
  if(!seasonCards.length||seasonCards.length!==season.plannedCards)continue;
  const prefix=season.id;
  const discovered=seasonCards.filter(card=>count(state.owned?.[card.id])>0).length;
  const finishStats=FINISH_KEYS.map(f=>finishObjective(seasonCards,state.finishCounts,f));
  const finishTotal=finishStats.reduce((n,f)=>n+f.total,0);
  const finishCount=finishStats.reduce((n,f)=>n+f.unique,0);
  collection.push(track(prefix+'-cards','Archives · '+season.title,'Cartes différentes découvertes dans cette saison.',discovered,[12,24,48,seasonCards.length].filter(n=>n<=seasonCards.length),'collection'));
  collection.push(track(prefix+'-finishes','Les quatre finitions · '+season.title,'Versions différentes obtenues ; la Signature compte uniquement en Chromatique.',finishCount,[25,75,150,finishTotal].filter(n=>n<=finishTotal),'collection'));
 }
 const stats=sanitizedTrialStats(state.trialStats),records=sanitizedTrialRecords(state.trialRecords);
 const medals=stats.reduce((n,row,index)=>n+trialChallengesFor(index,row,records[index]).filter(m=>m.earned).length,0);
 const modes=records.reduce((n,row)=>n+TRIAL_RECORD_MODES.filter(mode=>row[mode].wins>0).length,0);
 const trials=[
  track('wins','Persévérance','Victoires cumulées, toutes difficultés confondues.',count(state.wins),[10,50,100,250],'jouer'),
  track('versatility','Voyageur polyvalent','Une victoire dans chaque combinaison Épreuve / difficulté.',modes,[5,10,records.length*TRIAL_RECORD_MODES.length],'jouer'),
  track('medals','Médailles des Arcanes','Médailles de Bronze, Argent et Or déjà acquises.',medals,[5,10,stats.length*3],'jouer')
 ];
 const releasedParts=SEASONS.flatMap(season=>season.collections.filter(p=>p.released).map(part=>({season,part})));
 let fragments=0,fragmentTotal=0;
 for(const {season,part} of releasedParts){
  const entries=collectionMilestoneStatus(season.id,part.id,cardsForCollection(cards,season.id,part.id),state.owned,state.collectionMilestones);
  fragments+=entries.filter(e=>e.status==='claimed').length;
  fragmentTotal+=milestonesFor(season.id,part.id).length;
 }
 const routeCount=sanitizeExpedition(state.expedition).completedRoutes.length;
 const exploration=[
  track('routes','Les chemins des Marches','Expéditions différentes terminées, sans compter les répétitions.',routeCount,[1,2,EXPEDITION_ROUTES.length],'expeditions'),
  track('fragments','Mémoire des Archives','Fragments du Journal des découvertes déjà révélés.',fragments,[4,8,fragmentTotal].filter(n=>n<=fragmentTotal),'collection'),
  track('alchemy','Grimoire arcanique','Recettes d’alchimie différentes découvertes.',sanitizeAlchemyKnown(state.alchemyKnown).length,[5,10,ALCHEMY_RECIPE_COUNT],'jouer')
 ].filter(t=>t.total>0);
 return [
  {id:'collection',label:'Le collectionneur',tracks:collection},
  {id:'trials',label:'Le maître des Arcanes',tracks:trials},
  {id:'exploration',label:'Le voyageur des Marches',tracks:exploration}
 ].filter(group=>group.tracks.length>0);
}
