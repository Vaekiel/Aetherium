/* AETHERIUM 1.5 — chapters are views of existing Origines cards, never new cards. */
export const CODEX_CHAPTERS=Object.freeze([
  Object.freeze({id:'lueurs',number:'I',title:'Premières Lueurs',subtitle:'Les premiers gardiens des Archives',sigil:'✧',first:1,last:6}),
  Object.freeze({id:'memoires',number:'II',title:'Mémoires Anciennes',subtitle:'Les gardiens des savoirs oubliés',sigil:'◇',first:7,last:12}),
  Object.freeze({id:'merveilles',number:'III',title:'Terres de Légende',subtitle:'Les merveilles du monde éveillé',sigil:'✦',first:13,last:18}),
  Object.freeze({id:'astres',number:'IV',title:'Au-delà des Astres',subtitle:'Là où les mythes deviennent éternels',sigil:'✳',first:19,last:24})
]);
export const chapterFor=card=>CODEX_CHAPTERS.find(chapter=>card.id>=chapter.first&&card.id<=chapter.last);
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
export function chapterCards(cards,id){
  const chapter=CODEX_CHAPTERS.find(item=>item.id===id);
  return chapter?cards.filter(card=>card.id>=chapter.first&&card.id<=chapter.last):cards;
}
const normalized=text=>String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export function filterCodex(cards,{chapter='all',type='all',rarity='all',finish='all',discovery='all',query='',owned={},shiny={}}={}){
  const allowed=chapterCards(cards,chapter),term=normalized(query.trim());
  return allowed.filter(card=>
    (type==='all'||card.type===type)&&
    (rarity==='all'||card.rarity===rarity)&&
    (finish!=='chromatic'||(Number(owned[card.id])>0&&shiny[card.id]===true))&&
    (discovery==='all'||(discovery==='collected'?Number(owned[card.id])>0:!Number(owned[card.id])))&&
    normalized(card.name).includes(term)
  );
}
