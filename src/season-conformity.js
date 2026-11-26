/* Release gate: pure validation, never changes gameplay or player storage. */
export const FUTURE_ART_STANDARD=Object.freeze({
  thumbnailWidth:350,thumbnailHeight:525,fullWidth:1024,fullHeight:1536,
  format:'webp',boosterWidth:640,boosterHeight:1040
});
const text=value=>typeof value==='string'&&value.trim().length>0;
const types=new Set(['Héros','Créature','Sort','Artefact']);
const artPath=path=>typeof path==='string'&&/^\.\/assets\/cards\/[a-z0-9-]+\.webp$/.test(path);
const packPath=path=>typeof path==='string'&&/^\.\/assets\/boosters\/[a-z0-9-]+\.webp$/.test(path);
export function validateSeasonCatalog({seasons,cards,art,boosters,views,rarities,finishKeys}){
  const errors=[],require=(ok,message)=>{if(!ok)errors.push(message)};
  const seasonIds=new Set(),seasonNumbers=new Set(),partIds=new Set(),reserved=new Set();
  const ids=new Set(),publishedIds=new Set(),paths=new Set(),publishedParts=new Set();
  for(const card of cards){
    require(Number.isSafeInteger(card.id)&&card.id>0&&!ids.has(card.id),'Invalid or duplicate card ID: '+card.id);
    ids.add(card.id);
    require(text(card.name)&&text(card.lore)&&text(card.series),'Missing card metadata: '+card.id);
    require(types.has(card.type)&&Object.hasOwn(rarities,card.rarity),'Invalid card type/rarity: '+card.id);
    require(Number.isSafeInteger(card.attack)&&card.attack>=0&&Number.isSafeInteger(card.health)&&card.health>=0,'Invalid stats: '+card.id);
    require(card.signature===undefined||typeof card.signature==='boolean','Invalid Signature flag: '+card.id);
    require(card.boosterEligible===undefined||typeof card.boosterEligible==='boolean','Invalid booster flag: '+card.id);
    require(card.signature!==true||card.boosterEligible===false,'Signature must be explicitly excluded: '+card.id);
    const a=art[card.id];
    require(!!a,'Missing illustration: '+card.id);
    if(a){
      require(artPath(a.thumbnail)&&artPath(a.full)&&a.thumbnail!==a.full&&a.thumbnail===a.full.replace(/\.webp$/,'-thumb.webp'),'Invalid illustration paths: '+card.id);
      for(const path of [a.thumbnail,a.full]){
        require(!paths.has(path),'Duplicate illustration path: '+path);paths.add(path);
      }
      require(Number.isSafeInteger(a.thumbnailWidth)&&a.thumbnailWidth>0&&Number.isSafeInteger(a.fullWidth)&&a.fullWidth>a.thumbnailWidth&&text(a.version)&&/^[a-zA-Z0-9.-]+$/.test(a.version),'Invalid illustration delivery metadata: '+card.id);
    }
  }
  for(const key of Object.keys(art))require(ids.has(Number(key)),'Illustration without published card: '+key);
  for(const season of seasons){
    require(text(season.id)&&!seasonIds.has(season.id)&&Number.isSafeInteger(season.number)&&season.number>0&&!seasonNumbers.has(season.number),'Duplicate/invalid season: '+season.id);
    seasonIds.add(season.id);seasonNumbers.add(season.number);
    require(season.collections.length===3&&season.plannedCards===72,'Invalid season plan: '+season.id);
    for(const part of season.collections){
      require(text(part.id)&&!partIds.has(part.id),'Duplicate/invalid collection: '+part.id);partIds.add(part.id);
      const validRange=Number.isSafeInteger(part.first)&&Number.isSafeInteger(part.last)&&part.first>0&&part.last-part.first===23&&part.plannedCards===24;
      require(validRange,'Invalid reserved range: '+part.id);
      if(!validRange)continue;
      for(let id=part.first;id<=part.last;id++){
        require(!reserved.has(id),'Overlapping reservation: '+id);reserved.add(id);
      }
      const group=cards.filter(c=>c.id>=part.first&&c.id<=part.last);
      const booster=boosters.get(part.id);
      if(!part.released){
        require(group.length===0&&!booster&&!Object.hasOwn(views,part.id),'Unreleased content exposed: '+part.id);
        continue;
      }
      publishedParts.add(part.id);
      require(group.length===part.plannedCards,'Incomplete collection: '+part.id);
      const signatures=group.filter(c=>c.signature===true);
      require(signatures.length===(part.signature?1:0)&&(!part.signature||signatures[0]?.id===part.last),'Invalid Signature placement: '+part.id);
      for(const card of group)publishedIds.add(card.id);
      const expected=group.filter(c=>c.signature!==true&&c.boosterEligible!==false);
      require(expected.length===part.plannedCards-(part.signature?1:0),'Unexpected booster exclusion: '+part.id);
      require(!!booster&&booster.season.id===season.id&&booster.collection.id===part.id&&JSON.stringify(booster.pool.map(c=>c.id))===JSON.stringify(expected.map(c=>c.id)),'Invalid booster pool: '+part.id);
      for(const rarity of Object.keys(rarities))require(expected.some(c=>c.rarity===rarity),'Missing booster rarity '+rarity+': '+part.id);
      const view=views[part.id];
      require(!!view&&text(view.title)&&text(view.label)&&text(view.description)&&text(view.message)&&text(view.theme)&&packPath(view.art),'Missing/invalid booster presentation: '+part.id);
    }
  }
  for(const id of ids)require(publishedIds.has(id),'Card outside published collection: '+id);
  for(const id of boosters.keys())require(publishedParts.has(id),'Booster outside published collection: '+id);
  for(const id of Object.keys(views))require(publishedParts.has(id),'Presentation outside published collection: '+id);
  require(JSON.stringify(finishKeys)===JSON.stringify(['normal','calligraphic','chromatic','holographic']),'Invalid finish identifiers/order');
  return errors;
}
