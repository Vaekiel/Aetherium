/* Authoring contract for new collections; existing season I assets are unchanged.
   One authored record carries both gameplay metadata and the illustration slug.
   This function never publishes cards or invents stats/lore. */
export const FUTURE_ART_STANDARD=Object.freeze({
  thumbnailWidth:350,thumbnailHeight:525,fullWidth:1024,fullHeight:1536,
  format:'webp',boosterWidth:640,boosterHeight:1040
});
export function defineStandardArt(slug,version){
  if(typeof slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error('Invalid art slug');
  if(typeof version!=='string'||!/^[a-zA-Z0-9.-]+$/.test(version))throw new Error('Invalid art version');
  const {thumbnailWidth,thumbnailHeight,fullWidth,fullHeight}=FUTURE_ART_STANDARD;
  return Object.freeze({thumbnail:'./assets/cards/'+slug+'-thumb.webp',full:'./assets/cards/'+slug+'.webp',
    thumbnailWidth,thumbnailHeight,fullWidth,fullHeight,version});
}
export function defineCollectionContent({title,first,last,artVersion,entries}){
  if(typeof title!=='string'||!title.trim()||!Number.isSafeInteger(first)||first<1||last!==first+23||
    !Array.isArray(entries)||entries.length!==24)throw new Error('Invalid collection authoring plan');
  const cards=[],art={},slugs=new Set();
  for(const [index,entry] of entries.entries()){
    if(entry.id!==first+index||slugs.has(entry.slug))throw new Error('Invalid card ID or repeated illustration: '+entry.id);
    slugs.add(entry.slug);
    const {id,name,type,rarity,lore,attack,health,slug,signature=false}=entry;
    if(typeof signature!=='boolean'||(signature&&id!==last))throw new Error('Invalid Signature: '+id);
    const boosterEligible=entry.boosterEligible??!signature;
    if(typeof boosterEligible!=='boolean'||boosterEligible===signature)throw new Error('Invalid booster eligibility: '+id);
    cards.push(Object.freeze({id,name,type,rarity,lore,attack,health,series:title,signature,boosterEligible}));
    art[id]=defineStandardArt(slug,artVersion);
  }
  return Object.freeze({cards:Object.freeze(cards),art:Object.freeze(art)});
}
