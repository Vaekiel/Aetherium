/* AETHERIUM 1.7.1 — Collection discoveries and once-only narrative rewards.
   Only released collections with authored milestones can award anything.
   Locked narrative fragments are never rendered before a player claims them. */
const originsKey='marches-de-verre/origines';
const refletsKey='marches-de-verre/reflets-brises';
const auDelaKey='marches-de-verre/au-dela-du-verre';
const milestone=(threshold,title,fragment,currency,amount)=>Object.freeze({
  threshold,title,fragment,reward:Object.freeze({currency,amount})
});
export const COLLECTION_MILESTONES=Object.freeze({
  [originsKey]:Object.freeze([
    milestone(6,'Le premier éclat',
      'Sur les premières pages du Codex, des fragments de lumière se répondent. Les Archives ne semblent pas faites pour raconter des histoires isolées : elles attendent qu’un regard les réunisse.',
      'coins',30),
    milestone(12,'Les voix du verre',
      'Un motif apparaît entre les légendes. Les mêmes éclats de verre sont évoqués dans des lieux que tout sépare. Le hasard n’explique plus ces échos.',
      'coins',55),
    milestone(18,'Les signes du seuil',
      'Les anciens voyageurs gravaient des marques dans la pierre, toujours tournées vers un horizon sans nom. Au crépuscule, certains jurent que ces signes brillent encore.',
      'dust',20),
    milestone(24,'La promesse des Marches',
      'La dernière page d’Origines ne ferme pas le livre. Elle laisse une question ouverte : que reste-t-il d’un monde lorsque ses reflets cessent de lui obéir ?',
      'coins',100)
  ]),
  [refletsKey]:Object.freeze([
    milestone(6,'Les images en retard',
      'À l’aube, les vitres des maisons abandonnées continuent de refléter ceux qui les ont quittées. Une silhouette tarde à disparaître, puis lève la main vers un voyageur qui ne lui ressemble pas.',
      'coins',30),
    milestone(12,'Les voix du Revers',
      'Les Dédoublés ne réclament ni conquête ni vengeance. Ils murmurent des noms que personne n’a portés, des promesses jamais faites, des chemins que le monde a oubliés de suivre.',
      'coins',55),
    milestone(18,'Le palais des possibles',
      'Sous les arches renversées, les couloirs conduisent à des souvenirs contradictoires. Chaque porte conserve une vie différente. Au cœur du palais, quelqu’un tente de les préserver avant qu’elles ne s’effacent.',
      'dust',20),
    milestone(24,'La première fêlure',
      'Les derniers fragments révèlent une vérité inquiétante : les miroirs n’ont pas inventé ces autres destinées. Ils ont seulement rendu visible une blessure bien plus ancienne. Derrière le verre, un dernier horizon attend encore son nom.',
      'coins',100)
  ]),
  [auDelaKey]:Object.freeze([
    milestone(6,'La couture invisible',
      'Au pied des arches, une lueur turquoise court entre deux pierres qu’aucun mortier ne relie. Les artisans des deux rives comprennent qu’il ne faut pas effacer la fissure : elle peut devenir le commencement d’un passage.',
      'coins',30),
    milestone(12,'Ceux qui portent les deux noms',
      'Une messagère présente deux noms gravés sur la même lanterne. L’un appartient aux Marches, l’autre au Revers. Aucun n’est mensonger. Les voyageurs commencent à entendre ces vies comme deux voix capables de chanter ensemble.',
      'coins',55),
    milestone(18,'La carte des futurs',
      'Dans une salle ouverte sur deux aubes, Néméria déroule un atlas dont les routes n’apparaissent que lorsque deux mains en tiennent les bords. À son centre, quatre anciens signes attendent le retour des voyageurs et un serment encore sans mots.',
      'dust',20),
    milestone(24,'Le serment des horizons',
      'Le Cœur des Marches a retrouvé sa place parmi les légendes. Sur la dernière page du Codex, les noms des deux rives demeurent distincts, mais une même lumière les éclaire. Le livre ne se referme pas : une page vierge porte déjà les contours d’un nouvel horizon.',
      'coins',100)
  ])
});
export const collectionMilestoneKey=(seasonId,collectionId)=>seasonId+'/'+collectionId;
export const milestonesFor=(seasonId,collectionId)=>
  COLLECTION_MILESTONES[collectionMilestoneKey(seasonId,collectionId)]??[];
export function sanitizeMilestoneClaims(raw){
  const clean={};
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return clean;
  for(const [key,entries] of Object.entries(COLLECTION_MILESTONES)){
    const supplied=raw[key];
    if(!Array.isArray(supplied))continue;
    const valid=entries.filter(entry=>supplied.includes(entry.threshold)).map(entry=>entry.threshold);
    if(valid.length)clean[key]=valid;
  }
  return clean;
}
export const uniqueCardsOwned=(cards,owned={})=>
  cards.filter(card=>Number.isSafeInteger(owned?.[card.id])&&owned[card.id]>0).length;
export function collectionMilestoneStatus(seasonId,collectionId,cards,owned,claims){
  const claimed=sanitizeMilestoneClaims(claims)[collectionMilestoneKey(seasonId,collectionId)]??[];
  const count=uniqueCardsOwned(cards,owned);
  return milestonesFor(seasonId,collectionId).map(entry=>({
    ...entry,status:claimed.includes(entry.threshold)?'claimed':
      count>=entry.threshold?'claimable':'locked'
  }));
}
export function claimCollectionMilestone({seasonId,collectionId,threshold,cards,owned,claims}){
  const entries=milestonesFor(seasonId,collectionId);
  const entry=entries.find(item=>item.threshold===threshold);
  const cleaned=sanitizeMilestoneClaims(claims);
  if(!entry)return {ok:false,reason:'Palier de collection inconnu.',claims:cleaned};
  const key=collectionMilestoneKey(seasonId,collectionId);
  if(cleaned[key]?.includes(entry.threshold))
    return {ok:false,reason:'Ce fragment a déjà été récupéré.',claims:cleaned};
  if(uniqueCardsOwned(cards,owned)<entry.threshold)
    return {ok:false,reason:'Il reste des cartes à découvrir avant ce fragment.',claims:cleaned};
  return {
    ok:true,
    milestone:entry,
    claims:{...cleaned,[key]:[...(cleaned[key]??[]),entry.threshold].sort((a,b)=>a-b)}
  };
}
