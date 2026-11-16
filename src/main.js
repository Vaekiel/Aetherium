import {CARDS,RARITIES,PACK_PRICE,drawPack} from './data.js';
import {applyCardIllustration,hasApprovedArt,CARD_ART} from './card-art.js';

const $=(q,root=document)=>root.querySelector(q);
const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
const mobileView=window.matchMedia('(max-width:850px)');
const sheetScrim=$('#sheet-scrim'), filterDrawer=$('#collection-filters'), inspectorShell=$('#inspector-shell');
let sheetReturnFocus=null;
function closeSheets(restoreFocus=true){
  document.body.classList.remove('sheet-open');
  sheetScrim.hidden=true;
  filterDrawer.classList.remove('is-open');
  inspectorShell.classList.remove('is-open');
  $('#filter-open').setAttribute('aria-expanded','false');
  if(mobileView.matches){
    filterDrawer.inert=true;
    inspectorShell.inert=true;
    filterDrawer.setAttribute('aria-hidden','true');
    inspectorShell.setAttribute('aria-hidden','true');
  }
  if(restoreFocus&&sheetReturnFocus?.isConnected)sheetReturnFocus.focus({preventScroll:true});
  sheetReturnFocus=null;
}
function openSheet(kind){
  if(!mobileView.matches)return;
  const previousFocus=document.activeElement;
  closeSheets(false);
  sheetReturnFocus=previousFocus;
  const target=kind==='filters'?filterDrawer:inspectorShell;
  target.inert=false;
  target.setAttribute('aria-hidden','false');
  target.classList.add('is-open');
  sheetScrim.hidden=false;
  document.body.classList.add('sheet-open');
  if(kind==='filters')$('#filter-open').setAttribute('aria-expanded','true');
  (kind==='filters'?$('#filter-close'):$('#inspect-close')).focus({preventScroll:true});
}
function syncMobileSheets(){
  closeSheets(false);
  for(const target of [filterDrawer,inspectorShell]){
    if(mobileView.matches){
      target.setAttribute('role','dialog');
      target.setAttribute('aria-modal','true');
      target.setAttribute('aria-hidden','true');
      target.inert=true;
    }else{
      target.removeAttribute('role');
      target.removeAttribute('aria-modal');
      target.removeAttribute('aria-hidden');
      target.inert=false;
    }
  }
  selectGame(selectedGame);
}
$('#filter-open').addEventListener('click',()=>openSheet('filters'));
$('#filter-close').addEventListener('click',()=>closeSheets());
$('#filter-done').addEventListener('click',()=>closeSheets());
$('#inspect-close').addEventListener('click',()=>closeSheets());
sheetScrim.addEventListener('click',()=>closeSheets());
document.addEventListener('keydown',event=>{
  if(!document.body.classList.contains('sheet-open'))return;
  if(event.key==='Escape'){event.preventDefault();closeSheets();return}
  if(event.key!=='Tab')return;
  const active=filterDrawer.classList.contains('is-open')?filterDrawer:inspectorShell;
  const items=$$('button:not([disabled]),input:not([disabled]),a[href]',active).filter(x=>!x.hidden);
  if(!items.length)return;
  const first=items[0],last=items[items.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});
mobileView.addEventListener('change',syncMobileSheets);

// The first art atlas uses twelve reference illustrations cropped from the
// approved Collection mockup. These are *visual placeholders*, not final art
// for the corresponding 24 catalogue entries. All gameplay/save data is unchanged.
const SAVE='aetherium-save-v1';
const fresh=()=>({coins:300,dust:0,owned:{},shiny:{},wins:0,earned:0,opened:0});
function load(){try{const raw=JSON.parse(localStorage.getItem(SAVE));if(!raw||typeof raw!=='object')return fresh();const s=fresh();for(const field of ['coins','dust','wins','earned','opened'])if(Number.isSafeInteger(raw[field])&&raw[field]>=0&&raw[field]<1e9)s[field]=raw[field];for(const c of CARDS){const n=raw.owned?.[c.id];if(Number.isSafeInteger(n)&&n>0&&n<1e6)s.owned[c.id]=n;if(raw.shiny?.[c.id]===true&&s.owned[c.id])s.shiny[c.id]=true}return s}catch{return fresh()}}
let state=load();
let boosterBusy=false;
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state))}catch{notify('Sauvegarde indisponible dans ce navigateur.')}}
let toastTimer;
function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
function update(){save();$('#coins').textContent=state.coins.toLocaleString('fr-FR');$('#dust').textContent=state.dust.toLocaleString('fr-FR');$('#buy').disabled=state.coins<PACK_PRICE||boosterBusy;$('#collection-progress').textContent=Object.keys(state.owned).length+' / '+CARDS.length;
$('#mobile-collection-progress').textContent=Object.keys(state.owned).length+' / '+CARDS.length+' obtenues';renderAchievements()}
function grant(value){state.coins+=value;state.earned+=value;state.wins++;update();notify('+'+value+' Couronnes remportées !')}
function navigate(page){closeSheets(false);$$('.page').forEach(el=>el.classList.toggle('active',el.id==='page-'+page));$$('nav [data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));if(page==='collection')renderCollection();if(page==='succes')renderAchievements();history.replaceState(null,'','#'+page);if(mobileView.matches)window.scrollTo(0,0)}
$$('nav [data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
function button(text,handler,className='secondary'){const b=el('button',className,text);b.type='button';b.addEventListener('click',handler);return b}
function tileGrid(host,values,columns,handler){host.replaceChildren();host.style.setProperty('--cols',columns);for(let i=0;i<values.length;i++){const t=button(String(values[i]),()=>handler(values[i],i,t),'tile');host.append(t)}}
const definitions=[
{name:'Chemin runique',description:'Active 12 runes dans l’ordre. Trois erreurs et le sceau se brise.',reward:35},
{name:'Mémoire ancienne',description:'Retrouve quatre paires de glyphes en dix essais maximum.',reward:45},
{name:'Serrure d’Éther',description:'Choisis trois cristaux pour atteindre la valeur cible en trois tentatives.',reward:50},
{name:'Fouilles interdites',description:'Ouvre dix cases sans déclencher les cinq pièges cachés. Les nombres donnent les pièges voisins.',reward:65},
{name:'Laboratoire arcanique',description:'Reproduis trois recettes. Trois mauvaises préparations terminent l’épreuve.',reward:60}
];
const mini=[];
definitions.forEach((d,i)=>{const card=el('article','game');card.append(el('h3','',String(i+1).padStart(2,'0')+' · '+d.name),el('p','',d.description),el('div','reward','♛ +'+d.reward+' Couronnes'));const status=el('div','status');status.setAttribute('aria-live','polite');const board=el('div','board');const actions=el('div','small-actions');card.append(board,status,actions);$('#games').append(card);mini.push({card,board,status,actions,reward:d.reward,won:false,ended:false});});
function complete(i,description){const g=mini[i];if(g.ended)return;g.ended=true;g.status.textContent='✓ '+description;grant(g.reward)}
function startRunes(){const g=mini[0];g.ended=false;let next=1,errors=0;g.status.textContent='Prochaine rune : 1 · erreurs : 0/3';tileGrid(g.board,shuffle(Array.from({length:12},(_,i)=>i+1)),4,(v,i,b)=>{if(g.ended||b.disabled)return;if(v===next){b.disabled=true;b.classList.add('done');next++;if(next===13)complete(0,'Sceau restauré !')}else{errors++;if(errors>=3){g.ended=true;g.status.textContent='Sceau brisé. Recommence.'}}if(!g.ended)g.status.textContent='Prochaine rune : '+next+' · erreurs : '+errors+'/3'});g.actions.replaceChildren(button('Nouvelle grille',startRunes))}
function startMemory(){const g=mini[1];g.ended=false;let open=[],matched=0,tries=0,busy=false;const glyphs=shuffle(['☾','✦','◈','◆','☾','✦','◈','◆']);g.status.textContent='0/4 paires · 0/10 essais';tileGrid(g.board,glyphs.map(()=>'?'),4,(_,i,b)=>{if(g.ended||busy||b.disabled||open.some(x=>x.i===i))return;b.textContent=glyphs[i];b.classList.add('selected');open.push({i,b});if(open.length===2){tries++;const pair=open;open=[];if(glyphs[pair[0].i]===glyphs[pair[1].i]){matched++;pair.forEach(x=>{x.b.disabled=true;x.b.classList.add('done')});if(matched===4)complete(1,'Mémoire restaurée !')}else{busy=true;setTimeout(()=>{pair.forEach(x=>{x.b.textContent='?';x.b.classList.remove('selected')});busy=false},700)}if(tries>=10&&matched!==4){g.ended=true;g.status.textContent='Mémoire épuisée. Recommence.'}else if(!g.ended)g.status.textContent=matched+'/4 paires · '+tries+'/10 essais'}});g.actions.replaceChildren(button('Recommencer',startMemory))}
function startLock(){const g=mini[2];g.ended=false;const solution=Array.from({length:3},()=>2+Math.floor(Math.random()*9));const target=solution.reduce((a,b)=>a+b,0);const numbers=shuffle([...solution,...Array.from({length:3},()=>1+Math.floor(Math.random()*10))]);let selected=[],tries=0;g.status.textContent='Cible : '+target+' · 3 essais';tileGrid(g.board,numbers,3,(_,i,b)=>{if(g.ended)return;const p=selected.indexOf(i);if(p>=0){selected.splice(p,1);b.classList.remove('selected')}else if(selected.length<3){selected.push(i);b.classList.add('selected')}});g.actions.replaceChildren(button('Valider',()=>{if(g.ended)return;if(selected.length!==3){g.status.textContent='Sélectionne exactement trois cristaux.';return}const sum=selected.reduce((n,i)=>n+numbers[i],0);if(sum===target)complete(2,'Serrure ouverte !');else{tries++;g.status.textContent='Somme '+sum+' · cible '+target+' · '+(3-tries)+' essai(s)';if(tries===3){g.ended=true;g.status.textContent='Serrure verrouillée. Recommence.'}}selected=[];$$('.tile',g.board).forEach(b=>b.classList.remove('selected'))},'primary'),button('Nouveau défi',startLock))}
function startMines(){const g=mini[3];g.ended=false;const bombs=new Set(shuffle(Array.from({length:25},(_,i)=>i)).slice(0,5));let safe=0;g.status.textContent='0/10 cases sûres · 5 pièges';tileGrid(g.board,Array(25).fill('◇'),5,(_,i,b)=>{if(g.ended||b.disabled)return;if(bombs.has(i)){b.textContent='✕';g.ended=true;g.status.textContent='Piège déclenché ! Recommence.';return}const x=i%5,y=Math.floor(i/5);let adjacent=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<5&&yy>=0&&yy<5&&bombs.has(yy*5+xx))adjacent++}b.textContent=adjacent?String(adjacent):'·';b.disabled=true;b.classList.add('done');safe++;if(safe===10)complete(3,'Fouille accomplie !');else g.status.textContent=safe+'/10 cases sûres · 5 pièges'});g.actions.replaceChildren(button('Nouvelle fouille',startMines))}
const ingredients=[['☘','Mousse'],['☀','Soleil'],['◈','Cristal'],['☾','Lune'],['✿','Fleur'],['❄','Givre']];
const recipes=[['Élixir de Vie',[0,4]],['Sérum solaire',[1,2]],['Souffle lunaire',[3,5]],['Sève d’Aurore',[0,1]],['Nectar cristallin',[2,4]]];
function startAlchemy(){const g=mini[4];g.ended=false;let round=0,errors=0;function next(){if(g.ended)return;const [name,required]=recipes[Math.floor(Math.random()*recipes.length)];let selected=[];g.status.textContent='Potion '+(round+1)+'/3 · '+name+' : '+required.map(i=>ingredients[i][1]).join(' + ')+' · erreurs '+errors+'/3';tileGrid(g.board,ingredients.map(([icon,name])=>icon+' '+name),3,(_,i,b)=>{if(g.ended)return;const index=selected.indexOf(i);if(index>=0){selected.splice(index,1);b.classList.remove('selected')}else if(selected.length<2){selected.push(i);b.classList.add('selected')}if(selected.length===2){if(selected.every(x=>required.includes(x))){round++;if(round===3)complete(4,'Alchimie maîtrisée !');else next()}else{errors++;if(errors===3){g.ended=true;g.status.textContent='Mélange instable. Recommence.'}else next()}}})}g.actions.replaceChildren(button('Recommencer',startAlchemy));next()}
[startRunes,startMemory,startLock,startMines,startAlchemy].forEach(fn=>fn());
const picker=$('#game-picker');
let selectedGame=0;
definitions.forEach((entry,index)=>{
  const control=button((index+1)+' · '+entry.name,()=>selectGame(index),'game-choice');
  control.setAttribute('aria-pressed',String(index===0));
  picker.append(control);
});
function selectGame(index){
  selectedGame=index;
  mini.forEach((item,i)=>item.card.classList.toggle('mobile-active',i===index));
  $$('.game-choice',picker).forEach((b,i)=>{
    b.classList.toggle('active',i===index);
    b.setAttribute('aria-pressed',String(i===index));
  });
}
selectGame(0);
function makeCard(c,isShiny=false,locked=false){const preview=locked&&(c.id===1||(previewArt&&hasApprovedArt(c.id)));const reallyLocked=locked&&!preview;const b=el('button','card'+(reallyLocked?' locked':''));b.type='button';b.style.setProperty('--edge',RARITIES[c.rarity].color);const img=el('img');applyCardIllustration(img,c,{shiny:isShiny,size:'thumbnail'});b.append(img);const meta=el('div','info');meta.append(el('div','name',reallyLocked?'Carte inconnue':c.name),el('div','meta',RARITIES[c.rarity].label+' · '+c.type));b.append(meta);if(!locked&&state.owned[c.id])b.append(el('span','amount','×'+state.owned[c.id]));if(isShiny)b.append(el('span','shine','✦ SHINY'));if(preview){b.append(el('span','shine','APERÇU'));b.setAttribute('aria-label','Voir l’illustration de '+c.name+' sans posséder cette carte')}if(reallyLocked)b.disabled=true;else b.addEventListener('click',()=>{if($('#page-boosters').classList.contains('active'))navigate('collection');inspect(c,isShiny)});return b}
let filterType='all',filterRarity='all',selectedCard=null,previewArt=false;
function inspect(c,shiny=false,scroll=true){selectedCard={id:c.id,shiny};const panel=$('#inspector');panel.replaceChildren();panel.style.setProperty('--edge',RARITIES[c.rarity].color);const img=el('img');applyCardIllustration(img,c,{shiny,size:'full'});const kicker=el('p','kicker','ARCHIVE '+String(c.id).padStart(3,'0')+' · '+RARITIES[c.rarity].label);const title=el('h2','',c.name);const desc=el('p','', '« '+c.lore+' »');const stats=el('div','stats');stats.append(el('span','','⚔ '+c.attack),el('span','','♥ '+c.health),el('span','','×'+(state.owned[c.id]||0)));panel.append(img,kicker,title,el('p','muted',c.type+(shiny?' · ✦ Shiny':'')+(state.owned[c.id]?'':' · Aperçu non possédé')),desc,stats);if(state.shiny[c.id])panel.append(button(shiny?'Voir la carte normale':'Voir la version Shiny',()=>inspect(c,!shiny)));if(scroll){if(mobileView.matches)openSheet('inspector');else if(matchMedia('(max-width:1050px)').matches)panel.scrollIntoView({behavior:'smooth',block:'nearest'})}}
function renderCollection(){const q=$('#search').value.trim().toLocaleLowerCase('fr');const gallery=$('#card-grid');gallery.replaceChildren();const cards=CARDS.filter(c=>(filterType==='all'||c.type===filterType)&&(filterRarity==='all'||c.rarity===filterRarity||(filterRarity==='shiny'&&state.shiny[c.id]))&&c.name.toLocaleLowerCase('fr').includes(q));for(const c of cards)gallery.append(makeCard(c,!!state.shiny[c.id],!state.owned[c.id]));$('#empty').textContent=cards.length?'':'Aucune carte ne correspond à la recherche.';
const appliedFilters=(filterType!=='all'?1:0)+(filterRarity!=='all'?1:0);
const filterCount=$('#filter-count');filterCount.hidden=appliedFilters===0;filterCount.textContent=String(appliedFilters);if(!selectedCard)inspect(CARDS[0],false,false);else if(selectedCard?.id&&(state.owned[selectedCard.id]||selectedCard.id===1||(previewArt&&hasApprovedArt(selectedCard.id))))inspect(CARDS.find(c=>c.id===selectedCard.id),selectedCard.shiny,false);update()}
$('#search').addEventListener('input',renderCollection);
const previewToggle=$('#preview-art');
function syncPreviewToggle(){
 previewToggle.textContent=previewArt?'Masquer les aperçus':'Voir les '+Object.keys(CARD_ART).length+' illustrations';
 previewToggle.setAttribute('aria-pressed',String(previewArt));
 previewToggle.classList.toggle('active',previewArt);
}
previewToggle.addEventListener('click',()=>{
 previewArt=!previewArt;
 if(!previewArt&&selectedCard&&!state.owned[selectedCard.id]&&selectedCard.id!==1)selectedCard={id:1,shiny:false};
 syncPreviewToggle();
 renderCollection();
});
syncPreviewToggle();

$$('[data-type]').forEach(b=>b.addEventListener('click',()=>{filterType=b.dataset.type;$$('[data-type]').forEach(x=>x.classList.toggle('active',x===b));renderCollection()}));
$$('[data-rarity]').forEach(b=>b.addEventListener('click',()=>{filterRarity=b.dataset.rarity;$$('[data-rarity]').forEach(x=>x.classList.toggle('active',x===b));renderCollection()}));

/* Origines booster: one sealed card at a time, from a five-card stack.
   A purchase is saved before presentation; revealing never re-rolls or charges. */
const boosterArt=$('#booster-pack'),boosterOpening=$('#booster-opening');
const boosterGrid=$('#pulls'),boosterProgress=$('#booster-progress'),boosterProgressFill=$('#booster-progress span');
const boosterActions=$('#booster-actions'),boosterSummary=$('#booster-summary');
const revealAllButton=$('#reveal-all'),nextPullButton=$('#next-pull'),boosterStep=$('#booster-step');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const boosterTimers=new Set();
let currentDraw=[],drawSummary=null,currentIndex=0,cardFaceUp=false,changingCard=false;
function afterBooster(ms,action){
  const id=setTimeout(()=>{boosterTimers.delete(id);action()},ms);
  boosterTimers.add(id);
}
function cancelBoosterTimers(){for(const id of boosterTimers)clearTimeout(id);boosterTimers.clear()}
function clearBoosterScene(){
  cancelBoosterTimers();
  boosterBusy=false;
  currentDraw=[];drawSummary=null;currentIndex=0;cardFaceUp=false;changingCard=false;
  boosterArt.classList.remove('is-opening');
  boosterOpening.classList.remove('is-unsealing');
  boosterGrid.classList.remove('booster-pulls','booster-single','booster-gallery');
  boosterGrid.replaceChildren();
  boosterProgress.hidden=true;
  boosterProgressFill.style.width='0%';
  boosterStep.hidden=true;
  boosterActions.hidden=true;
  nextPullButton.hidden=true;
  boosterSummary.hidden=true;
  boosterSummary.replaceChildren();
}
/** The face-up card is decorative: tapping it should not leave the reveal sequence. */
function boosterCardArtwork(item){
  const buttonCard=makeCard(item.card,item.shiny);
  const artwork=el('div',buttonCard.className);
  artwork.style.cssText=buttonCard.style.cssText;
  while(buttonCard.firstChild)artwork.append(buttonCard.firstChild);
  return artwork;
}
function showBoosterCard(index,focus=true){
  if(!boosterBusy||index<0||index>=currentDraw.length)return;
  currentIndex=index;cardFaceUp=false;changingCard=false;
  const item=currentDraw[index];
  boosterGrid.classList.remove('booster-gallery');
  boosterGrid.classList.add('booster-pulls','booster-single');
  boosterGrid.replaceChildren();
  const tile=el('div','pull-flip');
  tile.dataset.rarity=item.card.rarity;
  tile.style.setProperty('--pull-edge',RARITIES[item.card.rarity].color);
  tile.classList.toggle('is-shiny',item.shiny);
  const frame=el('div','pull-frame');
  const back=el('button','pull-back');
  back.type='button';
  back.setAttribute('aria-label','Retourner la carte '+(index+1)+' sur '+currentDraw.length);
  back.append(el('span','back-glyph','✧'),el('span','back-caption','TOUCHER POUR RÉVÉLER'));
  back.addEventListener('click',()=>revealBoosterCard());
  const front=el('div','pull-front');
  front.inert=true;front.setAttribute('aria-hidden','true');
  front.append(boosterCardArtwork(item));
  frame.append(back,front);
  const tag=el('div','pull-tag'+(item.shiny?' is-shiny':item.isNew?' is-new':' is-duplicate'),
    item.shiny?'✦ Shiny':item.isNew?'✧ Nouvelle carte':'Doublon · +5 Éclats');
  tile.append(frame,tag);
  boosterGrid.append(tile);
  boosterProgressFill.style.width=(index/currentDraw.length*100)+'%';
  boosterStep.hidden=false;
  boosterStep.textContent='Carte '+(index+1)+' / '+currentDraw.length;
  nextPullButton.hidden=true;
  $('#pack-title').textContent='Carte '+(index+1)+' sur '+currentDraw.length;
  $('#pack-msg').textContent='Touche le dos de la carte pour révéler son illustration.';
  if(focus)back.focus({preventScroll:true});
}
function revealBoosterCard(){
  if(!boosterBusy||cardFaceUp||changingCard)return;
  const tile=boosterGrid.querySelector('.pull-flip');
  if(!tile)return;
  cardFaceUp=true;
  tile.classList.add('is-revealed');
  const back=tile.querySelector('.pull-back'),front=tile.querySelector('.pull-front');
  back.disabled=true;back.tabIndex=-1;back.setAttribute('aria-hidden','true');
  front.inert=false;front.removeAttribute('aria-hidden');
  boosterProgressFill.style.width=((currentIndex+1)/currentDraw.length*100)+'%';
  const item=currentDraw[currentIndex];
  $('#pack-title').textContent=item.card.name;
  $('#pack-msg').textContent=RARITIES[item.card.rarity].label+(item.shiny?' · ✦ Shiny':'')+
    (item.isNew?' · Nouvelle carte':' · Doublon (+5 Éclats)');
  nextPullButton.textContent=currentIndex===currentDraw.length-1?'Voir les cinq cartes':'Carte suivante ›';
  nextPullButton.hidden=false;
  // Keep the card on screen until the player chooses to continue.
  if(reducedMotion.matches)nextPullButton.focus({preventScroll:true});
  else afterBooster(420,()=>{if(boosterBusy&&cardFaceUp)nextPullButton.focus({preventScroll:true})});
}
function completeBoosterReveal(){
  if(!boosterBusy)return;
  cancelBoosterTimers();
  boosterBusy=false;changingCard=false;
  boosterArt.classList.remove('is-opening');
  boosterOpening.classList.remove('is-unsealing');
  boosterActions.hidden=true;nextPullButton.hidden=true;boosterStep.hidden=true;
  boosterGrid.classList.remove('booster-pulls','booster-single');
  boosterGrid.classList.add('booster-gallery');
  boosterGrid.replaceChildren(...currentDraw.map(item=>makeCard(item.card,item.shiny)));
  boosterSummary.hidden=false;
  boosterSummary.replaceChildren(
    el('span','',drawSummary.newCount+' nouvelle(s)'),
    el('span','',drawSummary.duplicates+' doublon(s) · +'+(drawSummary.duplicates*5)+' Éclats'),
    el('span',drawSummary.shinyCount?'booster-star':'',drawSummary.shinyCount+' Shiny')
  );
  $('#pack-title').textContent='Archive ouverte · '+state.opened;
  $('#pack-msg').textContent='Voici tes cinq cartes. Touche une carte pour la retrouver dans le Codex.';
  boosterProgressFill.style.width='100%';
  update();
}
function advanceBoosterCard(){
  if(!boosterBusy||!cardFaceUp||changingCard)return;
  if(currentIndex===currentDraw.length-1){completeBoosterReveal();return}
  changingCard=true;
  cancelBoosterTimers();
  nextPullButton.disabled=true;
  const oldTile=boosterGrid.querySelector('.pull-flip');
  if(oldTile)oldTile.classList.add('is-leaving');
  const next=()=>{
    nextPullButton.disabled=false;
    if(boosterBusy)showBoosterCard(currentIndex+1);
  };
  if(reducedMotion.matches)next();
  else afterBooster(235,next);
}
function revealBoosterAll(){
  if(!boosterBusy)return;
  // Skipping the presentation does not change the already-saved five cards.
  completeBoosterReveal();
}
function openOriginesBooster(){
  if(boosterBusy||state.coins<PACK_PRICE)return;
  cancelBoosterTimers();
  boosterBusy=true;
  const results=drawPack();
  state.coins-=PACK_PRICE;
  state.opened++;
  let newCount=0,duplicates=0,shinyCount=0;
  currentDraw=results.map(item=>{
    const card=CARDS[item.id-1];
    const isNew=!state.owned[card.id];
    if(isNew)newCount++;else{duplicates++;state.dust+=5}
    state.owned[card.id]=(state.owned[card.id]||0)+1;
    if(item.shiny){state.shiny[card.id]=true;shinyCount++}
    return {...item,card,isNew};
  });
  drawSummary={newCount,duplicates,shinyCount};
  update(); // Persists the purchase before any animation or navigation.
  boosterSummary.hidden=true;
  boosterSummary.replaceChildren();
  boosterGrid.replaceChildren();
  boosterGrid.classList.remove('booster-gallery');
  boosterActions.hidden=false;nextPullButton.hidden=true;
  boosterProgress.hidden=false;boosterProgressFill.style.width='0%';
  boosterStep.hidden=false;boosterStep.textContent='Préparation des cartes…';
  $('#pack-title').textContent='Le sceau des Origines s’éveille…';
  $('#pack-msg').textContent='Le paquet s’ouvre : cinq découvertes t’attendent.';
  boosterOpening.classList.add('is-unsealing');
  boosterArt.classList.add('is-opening');
  const startReveal=()=>{
    if(!boosterBusy)return;
    boosterArt.classList.remove('is-opening');
    boosterOpening.classList.remove('is-unsealing');
    showBoosterCard(0,false);
    if(mobileView.matches&&$('#page-boosters').classList.contains('active')&&!reducedMotion.matches)
      boosterOpening.scrollIntoView({behavior:'smooth',block:'start'});
  };
  if(reducedMotion.matches)startReveal();
  else afterBooster(560,startReveal);
}
$('#buy').addEventListener('click',openOriginesBooster);
revealAllButton.addEventListener('click',revealBoosterAll);
nextPullButton.addEventListener('click',advanceBoosterCard);

const success=[['Premiers pas','Terminer une épreuve',()=>state.wins>=1],['Explorateur','Terminer 10 épreuves',()=>state.wins>=10],['Archéologue','Terminer 50 épreuves',()=>state.wins>=50],['Curieux','Ouvrir son premier booster',()=>state.opened>=1],['Collectionneur','Découvrir 12 cartes',()=>Object.keys(state.owned).length>=12],['Archiviste','Découvrir les 24 cartes',()=>Object.keys(state.owned).length>=24],['Éclat rare','Trouver une carte Shiny',()=>Object.keys(state.shiny).length>=1],['Pactole','Gagner 1 000 Couronnes',()=>state.earned>=1000],['Chasseur de légendes','Obtenir une carte légendaire',()=>CARDS.some(c=>c.rarity==='legendary'&&state.owned[c.id])]];
function renderAchievements(){const root=$('#achievements');root.replaceChildren();for(const [title,description,test] of success){const done=test();const box=el('article','achievement'+(done?'':' locked'));box.append(el('h3','',done?'✦ '+title:'◇ '+title),el('p','',description),el('small','muted',done?'Accompli':'À découvrir'));root.append(box)}}
$('#reset').addEventListener('click',()=>{if(!confirm('Effacer définitivement les cartes et la progression sauvegardées sur cet appareil ?'))return;clearBoosterScene();state=fresh();selectedCard=null;$('#inspector').replaceChildren(el('p','muted','Sélectionne une carte découverte pour l’admirer.'));$('#pulls').replaceChildren();$('#pack-title').textContent='Les archives attendent leur voyageur.';$('#pack-msg').textContent='Gagne des Couronnes en jouant pour ouvrir des boosters.';update();renderCollection();notify('Progression réinitialisée.')});
syncMobileSheets();
update();
navigate(['jouer','boosters','collection','succes'].includes(location.hash.slice(1))?location.hash.slice(1):'jouer');
window.addEventListener('hashchange',()=>{
  const page=location.hash.slice(1);
  if(['jouer','boosters','collection','succes'].includes(page)&&!$('#page-'+page).classList.contains('active'))navigate(page);
});
