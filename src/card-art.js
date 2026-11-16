import {artFor} from './art.js';

// Source of truth for authored artwork. Add an entry for every approved card;
// the remaining cards keep their temporary atlas visuals until replaced.
// 1 = Veilleuse de Nacre (common, Origins).
export const CARD_ART = Object.freeze({
  1: Object.freeze({
    thumbnail: './assets/cards/veilleuse-de-nacre-thumb.webp',
    full: './assets/cards/veilleuse-de-nacre.webp'
  })
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
  img.style.filter=shiny?'hue-rotate(24deg) saturate(1.16) brightness(1.08)':'none';
  img.style.imageRendering='auto';
  img.style.objectFit='cover';
  img.onerror=null;
  const approved=CARD_ART[card.id];
  if(approved){
    img.src=size==='full'?approved.full:approved.thumbnail;
    img.onerror=()=>{
      img.onerror=null;
      img.style.filter='none';
      img.style.imageRendering='pixelated';
      img.src=artFor(card,shiny);
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
