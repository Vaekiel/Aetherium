/* AETHERIUM — experimental recto only, isolated behind ?recto-test=1.
   Never changes collection data, saves, booster views or the production design. */
const LAB_ENABLED = new URLSearchParams(window.location.search).get('recto-test') === '1';
const ICONS = Object.freeze({
  eclat: './assets/icons/stat-eclat-hd.webp',
  garde: './assets/icons/stat-garde-hd.webp',
  flux: './assets/icons/stat-flux-hd.webp'
});
// E2E testing starts with the original inspector to preserve existing regression checks.
let currentMode = new URLSearchParams(window.location.search).has('booster-e2e') ? 'old' : 'new';
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
  const max=width>365?25:width>300?21:18;
  const min=10;
  title.style.fontSize=max+'px';
  while(parseFloat(title.style.fontSize)>min &&
    (title.scrollWidth>zone.clientWidth-24||title.scrollHeight>zone.clientHeight-8)){
    title.style.fontSize=(parseFloat(title.style.fontSize)-.5)+'px';
  }
}
function cardLabel(card){
  // Rarity comes directly from the actual card's metadata, not an illustration.
  const names={common:'Commune',uncommon:'Inhabituelle',rare:'Rare',epic:'Épique',legendary:'Légendaire'};
  return names[card.rarity]||card.rarity;
}

function appendCard({card,finish,artwork}){
  const front=element('article','recto-lab-card recto-lab-'+finish);
  front.dataset.rarity=card.rarity;
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
  const source=artwork.querySelector('img');
  const image=element('img','recto-lab-illustration');
  image.src=source.currentSrc||source.src;
  image.alt='Illustration de '+card.name;
  image.decoding='async';
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
  return front;
}
export function attachRectoLabInspector({panel,card,finish,artwork}){
  if(!LAB_ENABLED)return;
  const bar=element('div','recto-lab-switch');
  const heading=element('span','recto-lab-switch-label','ESSAI RECTO · '+card.name);
  const original=element('button','recto-lab-switch-button','Recto actuel');
  const proposed=element('button','recto-lab-switch-button','Nouveau recto');
  for(const b of [original,proposed])b.type='button';
  bar.append(heading,original,proposed);
  const preview=appendCard({card,finish,artwork});
  const update=mode=>{
    currentMode=mode;
    panel.classList.toggle('recto-lab-mode-new',mode==='new');
    original.setAttribute('aria-pressed',String(mode==='old'));
    proposed.setAttribute('aria-pressed',String(mode==='new'));
    if(mode==='new')requestAnimationFrame(()=>fitTitle(preview.querySelector('.recto-lab-name')));
  };
  original.addEventListener('click',()=>update('old'));
  proposed.addEventListener('click',()=>update('new'));
  panel.prepend(bar,preview);
  update(currentMode);
}
export function initRectoLab({cards,inspect,navigate}){
  if(!LAB_ENABLED)return;
  const target=document.querySelector('#page-collection .collection-header');
  if(!target || document.querySelector('.recto-lab-entry'))return;
  const panel=element('div','recto-lab-entry');
  const text=element('div','recto-lab-entry-text');
  text.append(element('strong','','ATELIER · RECTO EXPÉRIMENTAL'),element('span','','Comparaison isolée : aucun déblocage, aucune modification de sauvegarde.'));
  panel.append(text);
  for(const [id,label] of [[8,'Cerf des Lueurs'],[22,'Astra (nom long)']]){
    const button=element('button','recto-lab-open',label);
    button.type='button';
    button.addEventListener('click',()=>{
      const c=cards.find(c=>c.id===id);
      if(!c)return;
      navigate('collection');
      inspect(c,false,true,false,'normal');
    });
    panel.append(button);
  }
  target.insertAdjacentElement('afterend',panel);
}
