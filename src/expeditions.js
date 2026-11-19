/* AETHERIUM — Les Expéditions des Marches de Verre.
   Three existing routes plus the four-stage finale, with a story choice
   and a one-time Signature reward. No changes to trial odds or currency. */
export const FINALE_ID='dernier-accord';
export const FINALE_PREREQUISITES=Object.freeze(['verriers','veilleurs','traversee-reflets']);
export const FINALE_VOWS=Object.freeze([
 Object.freeze({id:'ponts',name:'Bâtir des ponts',
  text:'Chaque rive garde ses racines ; des ponts permettront aux destins de se rencontrer.',
  ending:'Des arches s’élèvent dans l’aube. Les peuples restent libres de traverser, sans renier leur origine.'}),
 Object.freeze({id:'memoires',name:'Garder les mémoires',
  text:'Aucune voix ne sera effacée, même lorsqu’elle contredit le récit des anciens.',
  ending:'Les pierres des Marches se couvrent de noms oubliés. Deux histoires peuvent désormais être racontées ensemble.'}),
 Object.freeze({id:'passages',name:'Ouvrir les passages',
  text:'Les chemins demeureront ouverts à ceux qui désirent choisir leur avenir.',
  ending:'Le premier passage se déplie vers une terre inconnue. De nouveaux horizons attendent leurs voyageurs.'})
]);
export const canStartFinale=raw=>{
 const completed=completedRoutes(raw?.completedRoutes);
 return FINALE_PREREQUISITES.every(id=>completed.includes(id));
};
export const finaleVowById=id=>FINALE_VOWS.find(vow=>vow.id===id)||null;

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
 }),
 Object.freeze({
  id:'traversee-reflets',name:'La Traversée des Reflets',symbol:'◇',
  lead:'Explorer le monde derrière les miroirs',hint:'Mémoire · Runes · Serrure',
  prologue:'Au bord d’un lac sans vent, ton reflet se retourne avant toi. Il désigne une porte dont l’autre rive n’existe pas sur les cartes.',
  fragment:'La Lettre de l’autre rive',
  ending:'Derrière le dernier miroir, une lettre porte deux écritures, identiques mais datées d’aubes différentes. Une phrase demeure lisible : « Nous ne sommes pas vos ombres, mais les chemins que vous n’avez pas pris. » Au bas de la page, le sceau des Marches se fend en trois.',
  stages:Object.freeze([
   Object.freeze({game:1,title:'Les Souvenirs déplacés',
    text:'Les tablettes présentent des scènes familières, mais un détail change dans chaque souvenir. Retrouve leurs véritables échos.',
    after:'Les images retrouvent leur place. Dans l’une d’elles, ton reflet tient un alphabet de lumière que tu ne connais pas.'}),
   Object.freeze({game:0,title:'L’Écriture du Miroir',
    text:'Les signes du passage s’allument dans un ordre instable. Recompose la séquence pour franchir le seuil.',
    after:'L’ordre des runes brise une première illusion. Au loin, un verrou se reflète dans une porte qui n’existe plus.'}),
   Object.freeze({game:2,title:'La Porte à deux issues',
    text:'Un mécanisme de cristal garde la dernière salle du Revers. Trouve la combinaison exacte pour ouvrir le passage.',
    after:'La porte cède. Derrière le verre, quelqu’un a laissé un témoignage à l’intention des voyageurs.'})
  ])
 }),
 Object.freeze({
  id:FINALE_ID,name:'Le Dernier Accord',symbol:'✦',
  lead:'Réunir les deux rives · finale de la Saison I',
  hint:'4 actes · Signature à gagner',
  prologue:'Le sceau des Marches s’est fendu en trois. Les bornes des Verriers, les voix des Veilleurs et la Lettre du Revers forment maintenant une même carte. Néméria attend devant les arches : elle refuse de condamner une rive pour sauver l’autre.',
  fragment:'Le Serment des Deux Rives',
  ending:'Ni une victoire sur l’autre rive, ni une porte refermée : le monde a choisi d’accueillir plusieurs destins. Néméria dépose dans tes mains un cœur de verre vivant, témoin de cet accord.',
  stages:Object.freeze([
   Object.freeze({game:1,title:'Acte I · Les Voix oubliées',
    text:'Deux fresques racontent la même nuit avec des souvenirs opposés. Retrouve leurs échos sans effacer aucune version.',
    after:'Les mémoires se répondent. Une silhouette de l’autre rive prononce ton nom sans crainte.'}),
   Object.freeze({game:3,title:'Acte II · Le Chemin des possibles',
    text:'Sous les arches fissurées, les dalles du passage vacillent. Trouve une route sûre pour les voyageurs des deux rives.',
    after:'Tu traverses les dalles sans qu’aucun chemin ne s’effondre derrière toi. Le verre ne sépare plus : il soutient.'}),
   Object.freeze({game:0,title:'Acte III · Les Runes de l’Accord',
    text:'Les anciens glyphes et l’écriture du Revers se mêlent. Retrouve leur séquence commune pour réveiller le cœur endormi.',
    after:'Les signes ne se combattent plus. Une lumière turquoise rejoint l’aube corail au-dessus des Marches.'}),
   Object.freeze({game:4,title:'Acte IV · Le Dernier Serment',
    text:'Choisis le serment que tu transmettras aux générations futures, puis réalise le rituel alchimique de la Convergence.',
    after:'Les deux lumières se rejoignent sans se confondre. Le Cœur des Marches s’éveille au creux de tes mains.'})
  ])
 })
]);
const routeById=id=>EXPEDITION_ROUTES.find(route=>route.id===id)||null;
const MODE_IDS=Object.freeze(['initiation','aventure','maitrise']);
const completedRoutes=raw=>{
 if(!Array.isArray(raw))return [];
 const ids=EXPEDITION_ROUTES.filter(route=>raw.includes(route.id)).map(route=>route.id);
 // A finale flag is meaningful only if its three prerequisite stories exist.
 return ids.includes(FINALE_ID)&&!FINALE_PREREQUISITES.every(id=>ids.includes(id))
  ?ids.filter(id=>id!==FINALE_ID):ids;
};
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
 if(route.id===FINALE_ID&&!canStartFinale(clean))return clean;
 if(route.id===FINALE_ID&&raw.mode==='maitrise'&&!clean.completedRoutes.includes(FINALE_ID))
  return clean;
 clean.route=route.id;clean.mode=raw.mode;clean.step=raw.step;
 if(route.id===FINALE_ID){
  clean.choice=finaleVowById(raw.choice)?.id||null;
  if(raw.step===route.stages.length&&!clean.choice)return emptyExpeditionWithAchievements(clean);
 }
 clean.armed=raw.step<route.stages.length&&raw.armed===true&&
   !(route.id===FINALE_ID&&raw.step===3&&!clean.choice);
 return clean;
}
function emptyExpeditionWithAchievements(data){
 return {...emptyExpedition(),completedRoutes:data.completedRoutes};
}
export function chooseFinaleVow(raw,vowId){
 const current=sanitizeExpedition(raw);
 if(current.route!==FINALE_ID||current.step!==3||current.armed||!finaleVowById(vowId))
  return current;
 return {...current,choice:vowId};
}
export function startExpedition(raw,routeId,mode){
 const prior=sanitizeExpedition(raw);
 const route=routeById(routeId);
 if(!route||!MODE_IDS.includes(mode))return prior;
 if(route.id===FINALE_ID){
  if(!canStartFinale(prior))return prior;
  // First playthrough must be in Initiation or Aventure; Maîtrise is a true replay.
  if(mode==='maitrise'&&!prior.completedRoutes.includes(FINALE_ID))return prior;
 }
 return {route:route.id,step:0,mode,armed:false,completedRoutes:prior.completedRoutes,
  ...(route.id===FINALE_ID?{choice:null}:{})};
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
 const stage=expeditionStage(current);
 if(!stage||current.route===FINALE_ID&&current.step===3&&!current.choice)return current;
 return {...current,armed:true};
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
// Reward is granted by the game only on a verified final-stage victory.
// In the same save: normal collectible once, Chromatic once on a Maîtrise replay.
// This never changes card quantity for a replay or rewards another expedition.
export function awardFinaleCard(state,result){
 if(!result?.advanced||!result.finished||result.state?.route!==FINALE_ID||!state)
  return {normal:false,chromatic:false};
 const owned=state.owned||{},shiny=state.shiny||{};
 const normal=!(Number(owned[72])>0);
 const chromatic=result.state.mode==='maitrise'&&shiny[72]!==true;
 if(normal)state.owned={...owned,72:1};
 if(chromatic){
  // Maîtrise is locked until a first completion has been recorded.
  if(!result.state.completedRoutes.includes(FINALE_ID))return {normal,chromatic:false};
  state.shiny={...shiny,72:true};
 }
 return {normal,chromatic};
}
export function expeditionSummary(raw){
 const current=sanitizeExpedition(raw),route=routeById(current.route);
 return {current,route,stage:expeditionStage(current),
  complete:!!route&&current.step===route.stages.length,
  discovered:current.completedRoutes.length,
  total:EXPEDITION_ROUTES.length
 };
}
