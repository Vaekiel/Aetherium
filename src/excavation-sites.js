/* AETHERIUM 1.7.2 — Fouilles interdites.
   Pure site maps with five traps, a safe entrance and an optional artifact.
   An optional guide never charges or uncovers a tile. Requested probes reduce the completion score. */
export const EXCAVATION_SIDE=5;
export const EXCAVATION_TRAPS=5;
export const EXCAVATION_SITES=Object.freeze([
 Object.freeze({
   id:'cour-des-verriers',
   title:'La Cour des Verriers',
   description:'Sous les pavés brisés, les anciens verriers ont laissé des éclats de leur art.',
   artifact:'Un éclat de vitrail aux reflets d’aurore.',
   traps:Object.freeze([0,4,18,22,24])
 }),
 Object.freeze({
   id:'cloitre-des-veilleurs',
   title:'Le Cloître des Veilleurs',
   description:'Les pierres d’un cloître oublié gardent la trace d’une veille sans fin.',
   artifact:'Une petite effigie portant le sceau des veilleurs.',
   traps:Object.freeze([2,7,18,20,24])
 }),
 Object.freeze({
   id:'terrasses-du-prisme',
   title:'Les Terrasses du Prisme',
   description:'Les terrasses cristallines recouvrent des vestiges plus anciens que les Marches.',
   artifact:'Une inscription gravée sur un fragment de prisme.',
   traps:Object.freeze([5,9,12,16,22])
 })
]);
const boundedRandom=random=>{
 const n=Number(random());
 return Number.isFinite(n)?Math.max(0,Math.min(1-Number.EPSILON,n)):0;
};
const choose=(items,random)=>items[Math.floor(boundedRandom(random)*items.length)];
function transform(index,rotation,mirror){
 let x=index%EXCAVATION_SIDE,y=Math.floor(index/EXCAVATION_SIDE);
 if(mirror)x=EXCAVATION_SIDE-1-x;
 for(let turn=0;turn<rotation;turn++){
   [x,y]=[EXCAVATION_SIDE-1-y,x];
 }
 return y*EXCAVATION_SIDE+x;
}
export function countExcavationNeighbors(bombs,index){
 const x=index%EXCAVATION_SIDE,y=Math.floor(index/EXCAVATION_SIDE);
 let total=0;
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   if(dx===0&&dy===0)continue;
   const xx=x+dx,yy=y+dy;
   if(xx>=0&&xx<EXCAVATION_SIDE&&yy>=0&&yy<EXCAVATION_SIDE&&
      bombs.has(yy*EXCAVATION_SIDE+xx))total++;
 }
 return total;
}
export function makeExcavationSite(previousId=null,random=Math.random){
 const available=EXCAVATION_SITES.length>1
   ?EXCAVATION_SITES.filter(site=>site.id!==previousId):EXCAVATION_SITES;
 const template=choose(available,random);
 const rotation=Math.floor(boundedRandom(random)*4);
 const mirror=boundedRandom(random)<.5;
 const bombs=new Set(template.traps.map(index=>transform(index,rotation,mirror)));
 const numbers=Array.from({length:25},(_,index)=>countExcavationNeighbors(bombs,index));
 const safe=Array.from({length:25},(_,index)=>index).filter(index=>!bombs.has(index));
 const vacant=safe.filter(index=>numbers[index]===0);
 // A clearly marked entrance is never trapped and always has zero neighbors.
 const entrance=choose(vacant.length?vacant:safe,random);
 const artifact=choose(safe.filter(index=>index!==entrance),random);
 return Object.freeze({
   id:template.id,title:template.title,description:template.description,
   artifact:template.artifact,entrance,artifactIndex:artifact,
   bombs,numbers:Object.freeze(numbers)
 });
}
export function chooseExcavationGuide(site,dug=new Set(),random=Math.random){
 if(!site||!(site.bombs instanceof Set))return null;
 const remaining=Array.from({length:25},(_,i)=>i)
   .filter(index=>!site.bombs.has(index)&&!dug.has(index));
 if(!remaining.length)return null;
 // Prefer a provably safe neighbor of any previously uncovered empty tile.
 const certain=remaining.filter(index=>{
   const x=index%5,y=Math.floor(index/5);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     if(dx===0&&dy===0)continue;
     const xx=x+dx,yy=y+dy;
     if(xx>=0&&xx<5&&yy>=0&&yy<5){
       const neighbor=yy*5+xx;
       if(dug.has(neighbor)&&site.numbers[neighbor]===0)return true;
     }
   }
   return false;
 });
 const selection=choose(certain.length?certain:remaining,random);
 return Object.freeze({
   index:selection,
   deduction:certain.length>0
 });
}
