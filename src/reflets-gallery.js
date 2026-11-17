/* AETHERIUM — Reflets brisés, LOTS 1 + 2.
   Illustration previews only. Never append these drafts to src/data.js:
   the existing booster, collection and crafting systems stay locked. */
import {REFLETS_BRISES_DRAFT} from './reflets-brises-catalog.js';

const slugs=Object.freeze([
  [25,'eclat-fugueur'],
  [26,'guetteuse-du-revers'],
  [27,'papillon-de-silice'],
  [28,'pluie-a-l-envers'],
  [29,'miroir-d-ecorce'],
  [30,'loup-aux-deux-ombres'],
  [31,'cartographe-des-absents'],
  [32,'sentinelle-des-felures'],
  [33,'fil-des-deux-rives'],
  [34,'serment-retourne'],
  // Lot 2 — #35 awaits its approved illustration; #38 has a dedicated pilot.
  [36,'ronce-reflechie'],
  [37,'copiste-des-visages'],
  [39,'sablier-des-heures-doubles'],
  [40,'maree-de-verre'],
  [41,'gardien-du-seuil-inverse'],
  [42,'lame-de-parallaxe'],
  [43,'palais-des-dedoubles'],
  [44,'cendre-de-l-autre-soleil'],
  [45,'elyra-la-sans-visage']
]);
const rarityLabels=Object.freeze({
  common:'Commune',
  uncommon:'Inhabituelle',
  rare:'Rare',
  epic:'Épique',
  legendary:'Légendaire'
});

export const REFLETS_GALLERY_ART=Object.freeze(slugs.map(([id,slug])=>{
  const card=REFLETS_BRISES_DRAFT.find(card=>card.id===id);
  if(!card)throw new Error('Illustration non liée au catalogue des Reflets : '+id);
  return Object.freeze({
    id,slug,
    name:card.name,type:card.type,rarity:card.rarity,lore:card.lore,
    hd:'./assets/cards/'+slug+'.webp',
    thumb:'./assets/cards/'+slug+'-thumb.webp'
  });
}));

// Mount once, then leave images untouched when switching between Codex pages.
export function mountRefletsGallery(container){
  if(!container||container.dataset.loaded==='true')return;
  const fragment=document.createDocumentFragment();
  for(const card of REFLETS_GALLERY_ART){
    const figure=document.createElement('figure');
    figure.className='reflets-gallery-card';
    figure.dataset.rarity=card.rarity;
    const link=document.createElement('a');
    link.href=card.hd;
    link.target='_blank';
    link.rel='noopener';
    link.className='reflets-gallery-card-art';
    link.setAttribute('aria-label','Voir l’illustration HD : '+card.name);
    const picture=document.createElement('img');
    picture.src=card.thumb;
    picture.width=350;
    picture.height=525;
    picture.alt='Illustration de '+card.name+' — '+card.type;
    picture.loading='lazy';
    picture.decoding='async';
    link.append(picture);
    const caption=document.createElement('figcaption');
    const category=document.createElement('span');
    category.className='reflets-gallery-category';
    category.textContent='N° '+card.id+' · '+rarityLabels[card.rarity]+' · '+card.type;
    const name=document.createElement('strong');
    name.textContent=card.name;
    const lore=document.createElement('em');
    lore.textContent='« '+card.lore+' »';
    caption.append(category,name,lore);
    figure.append(link,caption);
    fragment.append(figure);
  }
  container.replaceChildren(fragment);
  container.dataset.loaded='true';
}
