/* AETHERIUM — Au-delà du Verre, collection complète en aperçu artistique : cartes 49–72.
   Les illustrations alimentent le Codex publié. La carte Signature n° 72
   n'est disponible ni dans les boosters ni à la Forge. */
import {AU_DELA_DU_VERRE_DRAFT} from './au-dela-du-verre-catalog.js';

const ILLUSTRATIONS=Object.freeze([
  [49,'passeur-des-aubes'],
  [50,'mousse-de-l-entreverre'],
  [51,'lanternes-jumelles'],
  [52,'brume-des-deux-rivages'],
  [53,'mesange-de-la-couture'],
  [54,'boussole-du-dedans'],
  [55,'emissaire-des-possibles'],
  [56,'tisserande-de-quartz'],
  [57,'clef-de-l-horizon'],
  [58,'rite-des-voix-accordees'],
  [59,'renard-des-intervalles'],
  [60,'veilleur-des-passages'],
  [61,'soryn-des-deux-rives'],
  [62,'horloge-du-premier-choix'],
  [63,'griffon-de-verre-serein'],
  [64,'marche-entre-les-mondes'],
  [65,'serment-des-passages'],
  [66,'armure-de-l-aube-intacte'],
  [67,'observatoire-des-horizons'],
  [68,'aelys-gardienne-des-liens'],
  [69,'convergence-des-souvenirs'],
  [70,'arpenteur-des-premiers-jours'],
  [71,'phenix-des-destins-reunis'],
  [72,'coeur-des-marches']
]);

const RARETE=Object.freeze({
  common:'Commune',
  uncommon:'Inhabituelle',
  rare:'Rare',
  epic:'Épique',
  legendary:'Légendaire'
});

export const AU_DELA_GALLERY_ART=Object.freeze(ILLUSTRATIONS.map(([id,slug])=>{
  const carte=AU_DELA_DU_VERRE_DRAFT.find(item=>item.id===id);
  if(!carte)throw new Error('Illustration sans carte dans Au-delà du Verre : '+id);
  return Object.freeze({
    id,slug,name:carte.name,type:carte.type,rarity:carte.rarity,lore:carte.lore,signature:carte.signature,
    hd:'./assets/cards/'+slug+'.webp',
    thumb:'./assets/cards/'+slug+'-thumb.webp'
  });
}));

// Un montage par écran : ne pas recréer les images à chaque changement de filtre.
export function mountAuDelaGallery(conteneur){
  if(!conteneur||conteneur.dataset.loaded==='true')return;
  const fragment=document.createDocumentFragment();
  for(const carte of AU_DELA_GALLERY_ART){
    const figure=document.createElement('figure');
    figure.className='au-dela-gallery-card';
    figure.dataset.rarity=carte.rarity;
    if(carte.signature)figure.dataset.signature='true';

    const lien=document.createElement('a');
    lien.className='au-dela-gallery-card-art';
    lien.href=carte.hd;
    lien.target='_blank';
    lien.rel='noopener';
    lien.setAttribute('aria-label','Voir l’illustration HD de '+carte.name);

    const image=document.createElement('img');
    image.src=carte.thumb;
    image.srcset=carte.thumb+' 350w, '+carte.hd+' 1024w';
    image.sizes='(max-width:570px) 43vw, (max-width:850px) 28vw, 170px';
    image.width=350;
    image.height=525;
    image.loading='lazy';
    image.decoding='async';
    image.alt='Illustration de '+carte.name+' — '+carte.type;
    lien.append(image);

    const legende=document.createElement('figcaption');
    const meta=document.createElement('span');
    meta.className='au-dela-gallery-meta';
    meta.textContent='N° '+carte.id+' · '+RARETE[carte.rarity]+' · '+carte.type+(carte.signature?' · Signature':'');
    const titre=document.createElement('strong');
    titre.textContent=carte.name;
    const lore=document.createElement('em');
    lore.textContent='« '+carte.lore+' »';
    legende.append(meta,titre,lore);
    figure.append(lien,legende);
    fragment.append(figure);
  }
  conteneur.replaceChildren(fragment);
  conteneur.dataset.loaded='true';
}
