/* AETHERIUM 1.8 — Les Expéditions des Marches de Verre.
   First chapter: two replayable routes, three validated mini-game stages each.
   No added currency, no duplicate win rewards and no changes to old games. */
export const EXPEDITION_ROUTES=Object.freeze([
 Object.freeze({
  id:'verriers',name:'Le Sentier des Verriers',symbol:'✧',
  lead:'Suivre les bornes de cristal',hint:'Runes · Fouilles · Alchimie',
  prologue:'Une lueur traverse les bornes effacées. Sous le verre, quelque chose attend encore son nom.',
  fragment:'Le Serment du Verre',
  ending:'Sous la dernière pierre, un fragment raconte qu’autrefois les Verriers protégeaient les passages, et non les trésors.',
  stages:Object.freeze([
   Object.freeze({game:0,title:'La Borne muette',text:'Les premières runes sont couvertes de poussière. Leur ordre ouvrira la voie.',after:'Les runes se répondent. Un ancien chemin apparaît sous tes pas.'}),
   Object.freeze({game:3,title:'Les Dalles fendues',text:'Le sentier disparaît sous une cour de pierres piégées. Une voie sûre existe encore.',after:'Les dalles libèrent une poussière lumineuse. Au loin, un laboratoire veille.'}),
   Object.freeze({game:4,title:'Le Creuset oublié',text:'Derrière une porte de verre, trois formules attendent de réveiller un vieux mécanisme.',after:'Le creuset s’allume, révélant une phrase gravée dans le verre.'})
  ])
 }),
 Object.freeze({
  id:'veilleurs',name:'La Veille des Échos',symbol:'◈',
  lead:'Écouter les souvenirs des Veilleurs',hint:'Mémoire · Serrure · Alchimie',
  prologue:'Au bord des ruines, des voix anciennes résonnent dans les tablettes. Elles semblent guider les voyageurs.',
  fragment:'La Veilleuse sans nom',
  ending:'Une page intacte révèle qu’une Veilleuse resta seule pour préserver la mémoire des Marches. Son nom a été effacé.',
  stages:Object.freeze([
   Object.freeze({game:1,title:'La Fresque perdue',text:'Des tablettes racontent un événement oublié. Retrouve les paires qui leur redonneront sens.',after:'La fresque se recompose et désigne une serrure abandonnée.'}),
   Object.freeze({game:2,title:'Le Verrou des Veilleurs',text:'Un sceau de cristaux garde le passage vers la dernière salle.',after:'Le verrou se défait. Une odeur d’herbes anciennes t’accueille.'}),
   Object.freeze({game:4,title:'L’Atelier des voix',text:'Les recettes des Veilleurs sommeillent dans un creuset de pierre.',after:'Le dernier mélange révèle les mots d’un témoignage perdu.'})
  ])
 })
]);
const routeById=id=>EXPEDITION_ROUTES.find(route=>route.id===id)||null;
const MODE_IDS=Object.freeze(['initiation','aventure','maitrise']);
const completedRoutes=raw=>Array.isArray(raw)?
 EXPEDITION_ROUTES.filter(route=>raw.includes(route.id)).map(route=>route.id):[];
export function emptyExpedition(){
 return {route:null,step:0,mode:null,armed:false,completedRoutes:[]};
}
export function sanitizeExpedition(raw){
 const clean=emptyExpedition();
 if(!raw||typeof raw!=='object')return clean;
 clean.completedRoutes=completedRoutes(raw.completedRoutes);
 const route=routeById(raw.route);
 if(!route||!MODE_IDS.includes(raw.mode))return clean;
 if(!Number.isSafeInteger(raw.step)||raw.step<0||raw.step>route.stages.length)return clean;
 if(raw.step===route.stages.length&&!clean.completedRoutes.includes(route.id))return clean;
 clean.route=route.id;clean.mode=raw.mode;clean.step=raw.step;
 clean.armed=raw.step<route.stages.length&&raw.armed===true;
 return clean;
}
export function startExpedition(raw,routeId,mode){
 const prior=sanitizeExpedition(raw);
 const route=routeById(routeId);
 if(!route||!MODE_IDS.includes(mode))return prior;
 return {route:route.id,step:0,mode,armed:false,completedRoutes:prior.completedRoutes};
}
export function abandonExpedition(raw){
 return {...emptyExpedition(),completedRoutes:sanitizeExpedition(raw).completedRoutes};
}
export function expeditionStage(raw){
 const current=sanitizeExpedition(raw);
 const route=routeById(current.route);
 return route&&current.step<route.stages.length?route.stages[current.step]:null;
}
export function armExpedition(raw){
 const current=sanitizeExpedition(raw);
 return expeditionStage(current)?{...current,armed:true}:current;
}
export function expeditionVictory(raw,gameIndex,mode){
 const current=sanitizeExpedition(raw);
 const stage=expeditionStage(current);
 if(!stage||!current.armed||!Number.isInteger(gameIndex)||
   gameIndex!==stage.game||mode!==current.mode)
  return {state:current,advanced:false,finished:false};
 const route=routeById(current.route);
 const next=current.step+1,finished=next===route.stages.length;
 return {
  advanced:true,finished,
  state:{
   ...current,step:next,armed:false,
   completedRoutes:finished?completedRoutes([...current.completedRoutes,route.id]):current.completedRoutes
  }
 };
}
export function expeditionSummary(raw){
 const current=sanitizeExpedition(raw),route=routeById(current.route);
 return {current,route,stage:expeditionStage(current),
  complete:!!route&&current.step===route.stages.length,
  discovered:current.completedRoutes.length,
  total:EXPEDITION_ROUTES.length
 };
}
