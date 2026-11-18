/* AETHERIUM 1.8.4 — Archives Vivantes.
   The showcase reads existing possessions without changing card odds, costs or
   unlock rules. Only future first discoveries are added to the local journal. */
import {RARITIES} from './data.js';
import {CARDS} from './collection-data.js';
import {SEASONS,cardsForCollection} from './seasons.js';

export const RECENT_DISCOVERY_LIMIT=6;
const FIND_KINDS=new Set(['new','chromatic','forge']);
const validCardIds=new Set(CARDS.map(card=>card.id));

export function sanitizeRecentFinds(entries){
  if(!Array.isArray(entries))return [];
  return entries.filter(entry=>entry&&Number.isSafeInteger(entry.id)
    &&validCardIds.has(entry.id)&&FIND_KINDS.has(entry.kind))
    .slice(0,RECENT_DISCOVERY_LIMIT)
    .map(entry=>({id:entry.id,kind:entry.kind}));
}

export function recordRecentFind(entries,id,kind){
  const earlier=sanitizeRecentFinds(entries);
  if(!validCardIds.has(id)||!FIND_KINDS.has(kind))return earlier;
  return [{id,kind},...earlier].slice(0,RECENT_DISCOVERY_LIMIT);
}

export function buildLivingArchive(cards,allCards,owned={},shiny={},recentFinds=[]){
  const ownedCards=cards.filter(card=>Number(owned[card.id])>0);
  const ownedIds=new Set(ownedCards.map(card=>card.id));
  const rarityKeys=Object.keys(RARITIES);
  const rarityOrder=Object.fromEntries(rarityKeys.map((rarity,index)=>[rarity,index]));
  const featured=[...ownedCards].sort((a,b)=>
    rarityOrder[b.rarity]-rarityOrder[a.rarity] ||
    Number(!!shiny[b.id])-Number(!!shiny[a.id]) || a.id-b.id).slice(0,3);
  const byId=new Map(cards.map(card=>[card.id,card]));
  const recent=sanitizeRecentFinds(recentFinds)
    .filter(event=>ownedIds.has(event.id)&&byId.has(event.id))
    .slice(0,3).map(event=>({...event,card:byId.get(event.id)}));
  const rarities=rarityKeys.map(key=>({
    key,label:RARITIES[key].label,
    total:cards.filter(card=>card.rarity===key).length,
    collected:ownedCards.filter(card=>card.rarity===key).length
  })).filter(entry=>entry.total>0);
  const published=SEASONS.flatMap(season=>season.collections
    .filter(collection=>collection.released)
    .map(collection=>({
      season,collection,
      cards:cardsForCollection(allCards,season.id,collection.id)
    }))).filter(entry=>entry.cards.length>0);
  const completed=published.filter(entry=>
    entry.cards.every(card=>Number(owned[card.id])>0));
  return {
    discovered:ownedCards.length,
    chromatic:ownedCards.filter(card=>shiny[card.id]===true).length,
    recent,featured,rarities,completed,
    publishedCount:published.length
  };
}
