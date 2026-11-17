/* AETHERIUM 1.7 — Codex functions operate on cards from the selected released
   collection. Season/collection metadata lives in seasons.js, not here. */
export function codexProgress(cards,owned={},shiny={}){
  const total=cards.length;
  const discovered=cards.filter(card=>Number(owned[card.id])>0).length;
  const chromatic=cards.filter(card=>Number(owned[card.id])>0&&shiny[card.id]===true).length;
  return {
    total,discovered,chromatic,missing:total-discovered,
    percent:total?Math.round(discovered/total*100):0,
    chromaticPercent:total?Math.round(chromatic/total*100):0
  };
}
const normalized=text=>String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export function filterCodex(cards,{type='all',rarity='all',finish='all',discovery='all',query='',owned={},shiny={}}={}){
  const term=normalized(query.trim());
  return cards.filter(card=>
    (type==='all'||card.type===type)&&
    (rarity==='all'||card.rarity===rarity)&&
    (finish!=='chromatic'||(Number(owned[card.id])>0&&shiny[card.id]===true))&&
    (discovery==='all'||(discovery==='collected'?Number(owned[card.id])>0:!Number(owned[card.id])))&&
    normalized(card.name).includes(term)
  );
}
