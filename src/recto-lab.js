/* AETHERIUM — universal revealed card front. Rendering only. */
const ICONS = Object.freeze({
  eclat: './assets/icons/stat-eclat-hd.webp',
  garde: './assets/icons/stat-garde-hd.webp',
  flux: './assets/icons/stat-flux-hd.webp'
});
const element=(tag,cls='',text='')=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text)node.textContent=text;
  return node;
};
function fitTitle(title){
  const zone=title.parentElement;
  if(!zone?.isConnected||!zone.clientWidth)return;
  const width=zone.closest('.recto-lab-card')?.clientWidth||320;
  const max=width>365?25:width>300?21:Math.max(11,Math.floor(width*.06));
  const min=7;
  title.style.fontSize=max+'px';
  while(parseFloat(title.style.fontSize)>min &&
    (title.scrollWidth>zone.clientWidth-12||title.scrollHeight>zone.clientHeight-4)){
    title.style.fontSize=(parseFloat(title.style.fontSize)-.5)+'px';
  }
}
function cardLabel(card){
  // Rarity comes directly from the actual card's metadata, not an illustration.
  const names={common:'Commune',uncommon:'Inhabituelle',rare:'Rare',epic:'Épique',legendary:'Légendaire'};
  return names[card.rarity]||card.rarity;
}

export function createCardFront({card,finish='normal',artwork}){
  const front=element('article','recto-lab-card recto-lab-'+finish);
  front.dataset.rarity=card.rarity;
  front.dataset.cardId=String(card.id);
  front.style.setProperty('--recto-rarity',({
    common:'#f9fbff',uncommon:'#62dfa8',rare:'#64b9ff',epic:'#cc82ff',
    legendary:'#ffd27b'})[card.rarity]||'#f9fbff');
  front.setAttribute('aria-label',card.name+', '+cardLabel(card)+
    ', Éclat '+card.attack+', Garde '+card.health);

  // Authentic universal card back under independent, readable HTML zones.
  const back=element('img','recto-lab-original-back');
  back.src='./assets/cards/aetherium-back-original-v3.webp';
  back.alt='';back.setAttribute('aria-hidden','true');
  back.decoding='async';front.append(back);

  const titleZone=element('header','recto-lab-title-plaque');
  const title=element('strong','recto-lab-name',card.name);
  titleZone.append(title);front.append(titleZone);

  const art=element('div','recto-lab-art');
  // Reuse the image node, including its original load/error fallback.
  const image=artwork.querySelector('img');
  image.classList.add('recto-lab-illustration');
  if(!image.alt)image.alt='Illustration de '+card.name;
  // Narrow 2:3 artworks must fill the same aperture as the wider Origines art.
  // Never stretch the source; retain the complete original for inspection.
  const fitArt=()=>{
    if(!image.naturalWidth||!image.naturalHeight)return;
    art.classList.toggle('recto-art-portrait',image.naturalWidth/image.naturalHeight<.75);
  };
  image.addEventListener('load',fitArt);
  fitArt();
  art.append(image);front.append(art);

  const footer=element('div','recto-lab-footer');
  const rarity=element('div','recto-lab-rarity');
  rarity.append(
    element('span','recto-lab-rarity-label',cardLabel(card)),
    element('span','recto-lab-divider','✦'),
    element('span','recto-lab-type',card.type)
  );
  const stats=element('div','recto-lab-stats');
  const flux=Math.max(1,Math.round((card.attack+card.health)/4));
  for(const [key,label,num] of [
    ['eclat','Éclat',card.attack],['garde','Garde',card.health],['flux','Flux',flux]
  ]){
    const stat=element('div','recto-lab-stat');
    const icon=element('img','recto-lab-stat-icon');
    icon.src=ICONS[key];icon.alt='';icon.setAttribute('aria-hidden','true');
    const statCopy=element('span','recto-lab-stat-copy');
    statCopy.append(element('small','',label),element('strong','',String(num)));
    stat.append(icon,statCopy);stats.append(stat);
  }
  footer.append(rarity,stats);front.append(footer);
  requestAnimationFrame(()=>fitTitle(title));
  if(typeof ResizeObserver==='function'){
    // Observe only while mounted; release detached cards after resizing.
    const observer=new ResizeObserver(()=>{
      if(!front.isConnected){observer.disconnect();return;}
      fitTitle(title);
    });
    observer.observe(front);
  }
  return front;
}
export function attachRectoLabInspector({panel,card,finish,artwork}){
  const front=createCardFront({card,finish,artwork});
  artwork.replaceWith(front);
  // A full-size illustration stays available outside the card when cropped.
  const image=front.querySelector('.recto-lab-illustration');
  const copy=panel.querySelector('.inspector-copy');
  if(copy&&image){
    const link=element('a','recto-full-art-link','Voir l’illustration entière');
    link.target='_blank';link.rel='noopener noreferrer';
    const syncLink=()=>{
      const src=image.currentSrc||image.src;
      const isPortrait=image.naturalWidth>0&&image.naturalHeight>0&&image.naturalWidth/image.naturalHeight<.75;
      link.hidden=!(isPortrait&&/\/assets\/cards\//.test(src));
      if(!link.hidden)link.href=src;
    };
    image.addEventListener('load',syncLink);
    syncLink();
    copy.append(link);
  }
  panel.classList.add('recto-lab-mode-new');
  return front;
}
