import {artFor} from './art.js';
import {REFLETS_GALLERY_ART} from './reflets-gallery.js';
import {AU_DELA_GALLERY_ART} from './au-dela-gallery.js';

// Source of truth for authored artwork. Add an entry for every approved card;
// the remaining cards keep their temporary atlas visuals until replaced.
// Dedicated artwork: 24 cards each for Origines, Reflets brisés and Au-delà du Verre.
export const CARD_ART = Object.freeze({
  1: Object.freeze({
    thumbnail: './assets/cards/veilleuse-de-nacre-thumb.webp',
    full: './assets/cards/veilleuse-de-nacre.webp'
  }),
  2: Object.freeze({thumbnail: './assets/cards/sylve-eclaireuse-thumb.webp', full: './assets/cards/sylve-eclaireuse.webp'}),
  3: Object.freeze({thumbnail: './assets/cards/golem-de-rouille-thumb.webp', full: './assets/cards/golem-de-rouille.webp'}),
  4: Object.freeze({thumbnail: './assets/cards/floraison-cendree-thumb.webp', full: './assets/cards/floraison-cendree.webp'}),
  5: Object.freeze({thumbnail: './assets/cards/epee-de-brume-thumb.webp', full: './assets/cards/epee-de-brume.webp'}),
  6: Object.freeze({thumbnail: './assets/cards/feu-follet-thumb.webp', full: './assets/cards/feu-follet.webp'}),
  7: Object.freeze({thumbnail: './assets/cards/archiviste-nocturne-thumb.webp', full: './assets/cards/archiviste-nocturne.webp'}),
  8: Object.freeze({thumbnail: './assets/cards/cerf-des-lueurs-thumb.webp', full: './assets/cards/cerf-des-lueurs.webp'}),
  9: Object.freeze({thumbnail: './assets/cards/meduse-d-ether-thumb.webp', full: './assets/cards/meduse-d-ether.webp'}),
  10: Object.freeze({thumbnail: './assets/cards/lame-prismatique-thumb.webp', full: './assets/cards/lame-prismatique.webp'}),
  11: Object.freeze({thumbnail: './assets/cards/chant-des-cendres-thumb.webp', full: './assets/cards/chant-des-cendres.webp'}),
  12: Object.freeze({thumbnail: './assets/cards/gardienne-de-jade-thumb.webp', full: './assets/cards/gardienne-de-jade.webp'}),
  13: Object.freeze({thumbnail: './assets/cards/roi-des-lucioles-thumb.webp', full: './assets/cards/roi-des-lucioles.webp'}),
  14: Object.freeze({thumbnail: './assets/cards/horloge-du-neant-thumb.webp', full: './assets/cards/horloge-du-neant.webp'}),
  15: Object.freeze({thumbnail: './assets/cards/dragon-de-cristal-thumb.webp', full: './assets/cards/dragon-de-cristal.webp'}),
  16: Object.freeze({thumbnail: './assets/cards/oracle-des-marees-thumb.webp', full: './assets/cards/oracle-des-marees.webp'}),
  17: Object.freeze({thumbnail: './assets/cards/pluie-astrale-thumb.webp', full: './assets/cards/pluie-astrale.webp'}),
  18: Object.freeze({thumbnail: './assets/cards/lion-d-obsidienne-thumb.webp', full: './assets/cards/lion-d-obsidienne.webp'}),
  19: Object.freeze({thumbnail: './assets/cards/eclipse-vivante-thumb.webp', full: './assets/cards/eclipse-vivante.webp'}),
  20: Object.freeze({thumbnail: './assets/cards/reine-des-ronces-thumb.webp', full: './assets/cards/reine-des-ronces.webp'}),
  21: Object.freeze({thumbnail: './assets/cards/coeur-du-colosse-thumb.webp', full: './assets/cards/coeur-du-colosse.webp'}),
  22: Object.freeze({thumbnail: './assets/cards/astra-reine-fractale-thumb.webp', full: './assets/cards/astra-reine-fractale.webp'}),
  23: Object.freeze({thumbnail: './assets/cards/vyrath-fleau-celeste-thumb.webp', full: './assets/cards/vyrath-fleau-celeste.webp'}),
  24: Object.freeze({thumbnail: './assets/cards/derniere-etoile-thumb.webp', full: './assets/cards/derniere-etoile.webp'}),
  ...Object.fromEntries(REFLETS_GALLERY_ART.map(card=>[
    card.id,Object.freeze({thumbnail:card.thumb,full:card.hd})
  ])),
  ...Object.fromEntries(AU_DELA_GALLERY_ART.map(card=>[
    card.id,Object.freeze({thumbnail:card.thumb,full:card.hd})
  ]))
});

const REFERENCE_ART=[3,1,10,9,7,5,4,2,5,8,6,11,0,7,0,1,8,6,4,11,10,11,0,8];
const REFERENCE_ATLAS='./assets/cards/reference-atlas.webp';
const BLANK_PIXEL='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

export function hasApprovedArt(id){return Object.hasOwn(CARD_ART,id)}

/** Apply the same art consistently in the collection, inspector and booster. */
export function applyCardIllustration(img,card,{shiny=false,size='thumbnail'}={}){
  img.alt='Illustration de '+card.name;
  img.decoding='async';
  img.loading=size==='full'?'eager':'lazy';
  img.style.backgroundImage='none';
  img.style.backgroundSize='';
  img.style.backgroundPosition='';
  img.style.backgroundRepeat='';
  // Preserve every original HD illustration. Chromatic foil is a separate CSS layer.
  img.style.filter='none';
  img.style.imageRendering='auto';
  img.style.objectFit='cover';
  img.onerror=null;
  // An <img> element can be reused when switching a finish or inspecting a card.
  // Remove stale responsive candidates before assigning a new illustration.
  img.removeAttribute('srcset');
  img.removeAttribute('sizes');
  const approved=CARD_ART[card.id];
  if(approved){
    const version=card.id>=49?'?v=au-dela-release-1':card.id>=25?'?v=reflets-release-1':card.id>=22?'?v=origines-b03':card.id>=12?'?v=origines-b02':'?v=20261116-unframed';
    if(size==='thumbnail'){
      // Mobile cards can occupy ~150–220 CSS pixels at 3x density.
      // Let the browser select the original 1138px illustration when a
      // 350px miniature would otherwise appear soft or pixelated.
      img.sizes='(max-width: 589px) calc((100vw - 56px) / 2), (max-width: 850px) calc((100vw - 80px) / 3), (max-width: 1200px) 175px, 220px';
      img.srcset=approved.thumbnail+version+' 350w, '+approved.full+version+(card.id>=49?' 1024w':' 1138w');
    }
    img.src=(size==='full'?approved.full:approved.thumbnail)+version;
    img.onerror=()=>{
      // A broken high-density candidate must not replace an approved HD
      // illustration with an unrelated procedural background. First try
      // the other authored size without the browser's stale srcset.
      const failedSource=img.currentSrc||img.src||'';
      const failedFull=failedSource.includes(approved.full.replace(/^\./,''));
      const alternate=(failedFull?approved.thumbnail:approved.full)+version;
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.onerror=()=>{
        img.onerror=null;
        img.style.filter='none';
        img.style.imageRendering='pixelated';
        // Fallback art is neutral: a Chromatique changes only the CSS finish.
        img.src=artFor(card,false);
      };
      img.src=alternate;
    };
    return;
  }
  // Reference tiles are only placeholders: they must never masquerade as
  // individually illustrated final cards.
  const index=REFERENCE_ART[card.id-1]??0;
  const column=index%4, row=Math.floor(index/4);
  img.src=BLANK_PIXEL;
  img.style.backgroundImage='url("'+REFERENCE_ATLAS+'"),url("'+artFor(card,shiny)+'")';
  img.style.backgroundSize='400% 300%,100% 100%';
  img.style.backgroundPosition=(column/3*100)+'% '+(row/2*100)+'%,center';
  img.style.backgroundRepeat='no-repeat';
  img.style.imageRendering='pixelated';
}
