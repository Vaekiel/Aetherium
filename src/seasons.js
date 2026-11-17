/* AETHERIUM 1.7 — Permanent seasons, 24-card collections, no fabricated cards.
   The published card catalogue is still src/data.js (Origines, IDs 1–24).
   Metadata for future collections does not create collectibles or booster pools. */
export const CARDS_PER_COLLECTION=24;
export const COLLECTIONS_PER_SEASON=3;
export const CARDS_PER_SEASON=CARDS_PER_COLLECTION*COLLECTIONS_PER_SEASON;

const part=(id,number,title,subtitle,{released=false,first=null,last=null,signature=false}={})=>Object.freeze({
  id,number,title,subtitle,plannedCards:CARDS_PER_COLLECTION,released,first,last,signature
});
const season=(id,number,title,subtitle,collections)=>Object.freeze({
  id,number,title,subtitle,plannedCards:CARDS_PER_SEASON,collections:Object.freeze(collections)
});
export const SEASONS=Object.freeze([
  season('marches-de-verre',1,'Les Marches de Verre',
    'Une région de cristaux oubliés, de gardiens et de secrets enfouis.',[
      part('origines','I','Origines','Les premières légendes des Marches de Verre.',{released:true,first:1,last:24}),
      part('reflets-brises','II','Les Reflets brisés','Les anomalies du verre révèlent de nouveaux mystères.'),
      part('au-dela-du-verre','III','Au-delà du Verre','L’ultime secret des Marches attend d’être découvert.',{signature:true})
    ]),
  season('plateau-nebuleux',2,'Le Plateau Nébuleux',
    'Un autre horizon d’Aetherium, encore inexploré.',[
      part('plateau-1','I','Collection I','Les légendes de cette région seront dévoilées ultérieurement.'),
      part('plateau-2','II','Collection II','Une deuxième collection à découvrir.'),
      part('plateau-3','III','Collection III','La conclusion de cette future saison.',{signature:true})
    ])
]);
export const seasonById=id=>SEASONS.find(s=>s.id===id)??null;
export const collectionById=(seasonId,collectionId)=>seasonById(seasonId)?.collections.find(c=>c.id===collectionId)??null;
export function cardsForCollection(cards,seasonId,collectionId){
  const part=collectionById(seasonId,collectionId);
  if(!part?.released||!Number.isInteger(part.first)||!Number.isInteger(part.last))return [];
  return cards.filter(card=>card.id>=part.first&&card.id<=part.last);
}
export const collectionForCard=card=>{
  if(!card)return null;
  for(const season of SEASONS)for(const collection of season.collections){
    if(collection.released&&card.id>=collection.first&&card.id<=collection.last)return {season,collection};
  }
  return null;
};
export function seasonProgress(cards,owned={},shiny={},seasonId='marches-de-verre'){
  const season=seasonById(seasonId);
  if(!season)return null;
  const available=season.collections.flatMap(part=>cardsForCollection(cards,seasonId,part.id));
  const released=available.length;
  const discovered=available.filter(card=>Number(owned[card.id])>0).length;
  const chromatic=available.filter(card=>Number(owned[card.id])>0&&shiny[card.id]===true).length;
  return {
    planned:season.plannedCards,released,discovered,chromatic,
    collectionsReleased:season.collections.filter(part=>part.released).length,
    collectionsPlanned:season.collections.length,
    percentReleased:Math.round(100*released/season.plannedCards),
    percentCollected:released?Math.round(100*discovered/released):0
  };
}
