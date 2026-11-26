/* AETHERIUM — Épreuves vivantes · Mémoire ancienne
   Pure layouts. Exactly two copies of every symbol, always eight fair pairs.
   Difficulty changes presentation, never the reward or saved player state. */
export const MEMORY_RITUALS=Object.freeze([
 Object.freeze({id:'guided',title:'Les Archives familières',
   rule:'Deux paires se cachent dans chaque ligne. Observe les quatre tablettes ensemble.',
   previewMs:0}),
 Object.freeze({id:'ancient',title:'Les Tablettes oubliées',
   rule:'Les souvenirs sont dispersés sur toute la table : retrouve les huit paires.',
   previewMs:0}),
 Object.freeze({id:'echoes',title:'Les Échos croisés',
   rule:'Chaque symbole possède un écho dans l’autre moitié de la table.',
   previewMs:0}),
 Object.freeze({id:'glimpse',title:'Le Souffle du passé',
   rule:'Observe les tablettes révélées brièvement au départ, puis retrouve leurs paires.',
   previewMs:2400}),
 Object.freeze({id:'rives',title:'Les Deux Rives',
   rule:'Chaque symbole se trouve une fois dans les deux colonnes de gauche et une fois dans les deux colonnes de droite.',
   previewMs:0})
]);
export function memoryRitualsFor(mode='aventure'){
 const ids=mode==='initiation'?['guided']:
   mode==='maitrise'?['ancient','glimpse']:['ancient','echoes','rives'];
 return MEMORY_RITUALS.filter(item=>ids.includes(item.id));
}
export function nextMemoryRitual(mode='aventure',previousId=null,random=Math.random){
 const items=memoryRitualsFor(mode);
 const available=items.length>1?items.filter(item=>item.id!==previousId):items;
 const n=Number(random());
 const safe=Number.isFinite(n)?Math.max(0,Math.min(n,1-Number.EPSILON)):0;
 return available[Math.floor(safe*available.length)];
}
export function buildMemoryDeck(runes,ritual,shuffle){
 if(!Array.isArray(runes)||runes.length!==8||new Set(runes.map(item=>item.id)).size!==8)
   throw new Error('Il faut huit symboles de mémoire différents.');
 if(typeof shuffle!=='function')throw new Error('Un mélangeur est nécessaire.');
 const make=(item,suffix)=>({...item,key:item.id+'-'+suffix});
 const id=ritual?.id??'ancient';
 if(id==='guided'){
   const symbols=shuffle(runes);
   return Array.from({length:4},(_,index)=>{
     const pair=symbols.slice(index*2,index*2+2);
     return shuffle(pair.flatMap(item=>[make(item,'a'),make(item,'b')]));
   }).flat();
 }
 if(id==='echoes'){
   const symbols=shuffle(runes);
   return [...shuffle(symbols.map(item=>make(item,'a'))),
           ...shuffle(symbols.map(item=>make(item,'b')))];
 }
 if(id==='rives'){
   const left=shuffle(runes.map(item=>make(item,'a')));
   const right=shuffle(runes.map(item=>make(item,'b')));
   return Array.from({length:4},(_,row)=>[...left.slice(row*2,row*2+2),...right.slice(row*2,row*2+2)]).flat();
 }
 return shuffle(runes.flatMap(item=>[make(item,'a'),make(item,'b')]));
}
