import {CARDS,RARITIES,PACK_PRICE,drawPack} from './data.js';
import {CRAFT_COSTS,getCraftCost,craftCard} from './crafting.js';
import {applyCardIllustration,hasApprovedArt,CARD_ART} from './card-art.js';
import {CODEX_CHAPTERS,chapterFor,chapterCards,codexProgress,filterCodex} from './codex.js';

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
const fresh=()=>({coins:300,dust:0,owned:{},shiny:{},wins:0,earned:0,opened:0,goalId:null});
function load(){try{const raw=JSON.parse(localStorage.getItem(SAVE));if(!raw||typeof raw!=='object')return fresh();const s=fresh();for(const field of ['coins','dust','wins','earned','opened'])if(Number.isSafeInteger(raw[field])&&raw[field]>=0&&raw[field]<1e9)s[field]=raw[field];for(const c of CARDS){const n=raw.owned?.[c.id];if(Number.isSafeInteger(n)&&n>0&&n<1e6)s.owned[c.id]=n;if(raw.shiny?.[c.id]===true&&s.owned[c.id])s.shiny[c.id]=true}if(Number.isSafeInteger(raw.goalId)&&CARDS.some(c=>c.id===raw.goalId)&&!s.owned[raw.goalId])s.goalId=raw.goalId;return s}catch{return fresh()}}
let state=load();
let boosterBusy=false;
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state))}catch{notify('Sauvegarde indisponible dans ce navigateur.')}}
let toastTimer;
function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
function update(){if(state.goalId&&state.owned[state.goalId])state.goalId=null;save();$('#coins').textContent=state.coins.toLocaleString('fr-FR');$('#dust').textContent=state.dust.toLocaleString('fr-FR');$('#buy').disabled=state.coins<PACK_PRICE||boosterBusy;$('#collection-progress').textContent=Object.keys(state.owned).length+' / '+CARDS.length;
$('#mobile-collection-progress').textContent=Object.keys(state.owned).length+' / '+CARDS.length+' obtenues';
  const chromaticTotal=Object.keys(state.shiny).length;
  $('#codex-card-count').textContent=Object.keys(state.owned).length+' / '+CARDS.length;
  $('#codex-chromatic-count').textContent=chromaticTotal+' / '+CARDS.length;
  $('#mobile-chromatic-count').textContent='✧ '+chromaticTotal+' / '+CARDS.length+' Chromatiques';
  renderAchievements();renderAtelier()}
function grant(value){state.coins+=value;state.earned+=value;state.wins++;update();notify('+'+value+' Couronnes remportées !')}
const MAIN_PAGES=['jouer','boosters','collection','atelier'];
const APP_PAGES=[...MAIN_PAGES,'succes'];
let forgeSelectedId=null;
let forgeFilter='all';
let pendingCraftId=null;

function renderAtelier(){
  $('#atelier-dust').textContent=state.dust.toLocaleString('fr-FR');
  $('#atelier-collected').textContent=Object.keys(state.owned).length+' / '+CARDS.length;
  const duplicates=Object.values(state.owned).reduce((sum,n)=>sum+Math.max(0,n-1),0);
  $('#atelier-duplicates').textContent=duplicates.toLocaleString('fr-FR');

  // Keep a wanted card visible between sessions, even after a page reload.
  const goal=CARDS.find(card=>card.id===state.goalId&&!state.owned[card.id]);
  const summary=$('#atelier-goal-summary');
  summary.replaceChildren();
  if(goal){
    const cost=getCraftCost(goal);
    const remaining=Math.max(0,cost-state.dust);
    summary.append(el('strong','atelier-goal-name',goal.name));
    const progress=el('div','atelier-goal-meter');
    progress.setAttribute('role','progressbar');
    progress.setAttribute('aria-label','Progression vers '+goal.name);
    progress.setAttribute('aria-valuemin','0');
    progress.setAttribute('aria-valuemax',String(cost));
    progress.setAttribute('aria-valuenow',String(Math.min(state.dust,cost)));
    const fill=el('span');
    fill.style.width=Math.min(100,(state.dust/cost)*100)+'%';
    progress.append(fill);
    summary.append(progress,el('p','',remaining?remaining+' Éclats manquants sur '+cost:'Tu peux fabriquer cette carte !'));
    summary.append(button('Voir mon objectif ›',()=>{
      forgeSelectedId=goal.id;
      forgeFilter='all';
      $('#atelier-filter').value='all';
      renderAtelier();
      $('#atelier-card-details').scrollIntoView({behavior:'smooth',block:'nearest'});
    },'secondary atelier-side-link'));
  }else summary.append(el('p','atelier-goal-placeholder','Choisis une carte manquante et désigne-la comme objectif. Ta progression sera conservée.'));

  const missing=CARDS.filter(card=>!state.owned[card.id]);
  const visible=missing.filter(card=>
    forgeFilter==='all'||(forgeFilter==='affordable'?state.dust>=getCraftCost(card):card.rarity===forgeFilter));
  const chooseFrom=visible.find(c=>c.id===forgeSelectedId)
    ||visible.find(c=>c.id===state.goalId)
    ||visible[0]||null;
  forgeSelectedId=chooseFrom?.id??null;
  const gallery=$('#atelier-card-list');
  gallery.replaceChildren();
  $('#atelier-empty').hidden=visible.length>0;
  $('#atelier-empty').textContent=missing.length===0
    ?'Ton Codex est complet ! Tu possèdes les 24 cartes des Origines.'
    :'Aucune carte manquante ne correspond à ce filtre.';
  for(const card of visible){
    const selected=card.id===forgeSelectedId;
    const wish=card.id===state.goalId;
    const cost=getCraftCost(card);
    const tile=el('button','atelier-craft-tile'+(selected?' is-selected':'')+(wish?' is-wished':''));
    tile.type='button';
    tile.dataset.cardId=String(card.id);
    tile.setAttribute('aria-pressed',String(selected));
    tile.setAttribute('aria-label',card.name+', '+RARITIES[card.rarity].label+', '+cost+' Éclats'+(wish?', carte convoitée':''));
    tile.style.setProperty('--rarity-color',RARITIES[card.rarity].color);
    const art=el('img','atelier-craft-art');
    applyCardIllustration(art,card,{shiny:false,size:'thumbnail'});
    art.alt='';
    const label=el('span','atelier-craft-name',card.name);
    const costLine=el('span','atelier-craft-cost','✦ '+cost+' Éclats');
    tile.append(art,label,costLine);
    if(wish)tile.append(el('span','atelier-wish-badge','✧ OBJECTIF'));
    if(state.dust>=cost)tile.classList.add('is-affordable');
    tile.addEventListener('click',()=>{
      forgeSelectedId=card.id;
      renderAtelier();
      if(mobileView.matches)$('#atelier-card-details').scrollIntoView({behavior:'smooth',block:'start'});
      else gallery.querySelector('[data-card-id="'+card.id+'"]')?.focus({preventScroll:true});
    });
    gallery.append(tile);
  }

  const details=$('#atelier-card-details');
  details.replaceChildren();
  if(!chooseFrom){
    const text=missing.length===0
      ?'Toutes les cartes des Origines ont rejoint ton Codex. Les versions Chromatiques restent à découvrir en booster.'
      :'Modifie le filtre pour choisir une carte à fabriquer.';
    details.append(el('p','kicker','LES FORGES DES ARCHIVES'),el('h3','',missing.length?'Aucune recette affichée':'Le Codex est complet'),el('p','atelier-detail-placeholder',text));
    if(missing.length===0)details.append(button('Explorer mon Codex ›',()=>navigate('collection'),'secondary atelier-detail-link'));
    return;
  }
  const cost=getCraftCost(chooseFrom);
  const remaining=Math.max(0,cost-state.dust);
  const art=el('img','atelier-detail-art');
  applyCardIllustration(art,chooseFrom,{shiny:false,size:'full'});
  art.alt='Illustration de '+chooseFrom.name;
  const frame=el('div','atelier-detail-frame');
  frame.style.setProperty('--rarity-color',RARITIES[chooseFrom.rarity].color);
  frame.append(art);
  const meter=el('div','atelier-detail-meter');
  meter.setAttribute('role','progressbar');
  meter.setAttribute('aria-label','Éclats pour fabriquer '+chooseFrom.name);
  meter.setAttribute('aria-valuemin','0');
  meter.setAttribute('aria-valuemax',String(cost));
  meter.setAttribute('aria-valuenow',String(Math.min(cost,state.dust)));
  const fill=el('span');fill.style.width=Math.min(100,state.dust/cost*100)+'%';
  meter.append(fill);
  const craft=button('Forger · '+cost+' Éclats',()=>askCraft(chooseFrom.id),'primary atelier-craft-action');
  craft.disabled=state.dust<cost;
  craft.title=remaining?'Encore '+remaining+' Éclats nécessaires':'Forger cette carte et dépenser '+cost+' Éclats';
  const goalButton=button(state.goalId===chooseFrom.id?'Retirer mon objectif':'✧ Choisir comme objectif',()=>{
    const added=state.goalId!==chooseFrom.id;
    state.goalId=added?chooseFrom.id:null;
    update();
    notify(added?'Carte convoitée : '+chooseFrom.name:'Objectif retiré.');
  },'secondary atelier-goal-action');
  goalButton.setAttribute('aria-pressed',String(state.goalId===chooseFrom.id));
  const count=el('div','atelier-detail-count','✦ '+state.dust+' / '+cost+' Éclats');
  const message=el('p','atelier-detail-progress',remaining?remaining+' Éclats encore nécessaires':'La Forge peut accueillir cette carte.');
  details.append(el('p','kicker','FICHE DE FABRICATION'),frame,
    el('h3','',chooseFrom.name),
    el('p','atelier-detail-rarity',RARITIES[chooseFrom.rarity].label+' · '+chooseFrom.type),
    el('p','atelier-detail-lore','« '+chooseFrom.lore+' »'),
    count,meter,message,craft,goalButton);
}

function askCraft(cardId){
  const card=CARDS.find(c=>c.id===cardId&&!state.owned[c.id]);
  if(!card)return notify('Cette carte se trouve déjà dans ton Codex.');
  const cost=getCraftCost(card);
  if(state.dust<cost)return notify('Tu ne possèdes pas encore assez d’Éclats.');
  pendingCraftId=card.id;
  $('#atelier-confirm-text').textContent='Fabriquer « '+card.name+' » pour '+cost+' Éclats ? Solde actuel : '+state.dust+' Éclats.';
  const modal=$('#atelier-confirm');
  if(typeof modal.showModal==='function')modal.showModal();
  else if(window.confirm('Fabriquer '+card.name+' pour '+cost+' Éclats ?'))completeCraft();
  else pendingCraftId=null;
}

function completeCraft(){
  const cardId=pendingCraftId;
  pendingCraftId=null;
  const modal=$('#atelier-confirm');
  if(modal.open)modal.close();
  const card=CARDS.find(c=>c.id===cardId);
  const result=craftCard(state,card);
  if(!result.ok)return notify(result.reason);
  state=result.state;
  forgeSelectedId=null;
  update(); // Saves the new card and the spent Éclats in one state update.
  renderCollection();
  const report=$('#atelier-result');
  report.hidden=false;
  report.textContent='✧ '+card.name+' rejoint ton Codex ! −'+result.cost+' Éclats.';
  notify('Carte fabriquée : '+card.name+' !');
}
$('#atelier-filter').addEventListener('change',event=>{
  forgeFilter=event.target.value;
  forgeSelectedId=null;
  renderAtelier();
});
$('#atelier-jump').addEventListener('click',()=>{
  $('#atelier-catalogue-title').scrollIntoView({behavior:'smooth',block:'start'});
  $('#atelier-catalogue-title').focus({preventScroll:true});
});
$('#atelier-confirm-cancel').addEventListener('click',()=>{
  pendingCraftId=null;
  $('#atelier-confirm').close();
});
$('#atelier-confirm-accept').addEventListener('click',completeCraft);
$('#atelier-confirm').addEventListener('close',()=>{pendingCraftId=null});
function navigate(page){
  if(!APP_PAGES.includes(page))return;
  closeSheets(false);
  $$('.page').forEach(el=>el.classList.toggle('active',el.id==='page-'+page));
  $$('nav [data-page]').forEach(el=>{
    const active=el.dataset.page===page;
    el.classList.toggle('active',active);
    if(active)el.setAttribute('aria-current','page');
    else el.removeAttribute('aria-current');
  });
  $('#chroniques-link').classList.toggle('active',page==='succes');
  if(page==='collection')renderCollection();
  if(page==='atelier')renderAtelier();
  if(page==='succes')renderAchievements();
  history.replaceState(null,'','#'+page);
  if(mobileView.matches)window.scrollTo(0,0);
}
$$('nav [data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
function button(text,handler,className='secondary'){const b=el('button',className,text);b.type='button';b.addEventListener('click',handler);return b}
function tileGrid(host,values,columns,handler){host.replaceChildren();host.style.setProperty('--cols',columns);for(let i=0;i<values.length;i++){const t=button(String(values[i]),()=>handler(values[i],i,t),'tile');host.append(t)}}
const definitions=[
{name:'Chemin runique',description:'Active 12 runes dans l’ordre. Trois erreurs et le sceau se brise.',reward:35},
{name:'Mémoire ancienne',description:'Retourne les tablettes des Archives et retrouve les huit paires runiques.',reward:45},
{name:'Serrure d’Éther',description:'Choisis trois cristaux pour atteindre la valeur cible en trois tentatives.',reward:50},
{name:'Fouilles interdites',description:'Ouvre dix cases sans déclencher les cinq pièges cachés. Les nombres donnent les pièges voisins.',reward:65},
{name:'Laboratoire arcanique',description:'Reproduis trois recettes. Trois mauvaises préparations terminent l’épreuve.',reward:60}
];
const mini=[];
definitions.forEach((d,i)=>{const card=el('article','game');card.append(el('h3','',String(i+1).padStart(2,'0')+' · '+d.name),el('p','',d.description),el('div','reward','♛ +'+d.reward+' Couronnes'));const status=el('div','status');status.setAttribute('aria-live','polite');const board=el('div','board');const actions=el('div','small-actions');card.append(board,status,actions);$('#games').append(card);mini.push({card,board,status,actions,reward:d.reward,won:false,ended:false});});
function complete(i,description){const g=mini[i];if(g.ended)return;g.ended=true;g.status.textContent='✓ '+description;grant(g.reward)}
const runeNames=['Soleil','Lune','Constellations','Œil','Spirale','Arbre','Rose des vents','Étoiles','Montagne','Vagues','Sablier','Flamme'];
function startRunes(){
  const g=mini[0];
  g.ended=false;
  g.card.classList.add('rune-trial');
  g.board.classList.add('rune-board');
  g.status.classList.add('rune-statusline');
  g.status.classList.remove('is-complete','is-failed');
  let next=1,errors=0;
  let hud=g.card.querySelector('.rune-hud');
  if(!hud){
    hud=el('div','rune-hud');
    const left=el('div','rune-goal');
    left.append(el('span','', 'Rune suivante : '),el('strong','rune-target'));
    hud.append(left,el('span','rune-faults'));
    const meter=el('div','rune-meter');
    meter.setAttribute('aria-hidden','true');
    for(let index=0;index<12;index++)meter.append(el('span'));
    g.board.before(hud,meter);
  }
  const meter=g.card.querySelector('.rune-meter');
  const updateHud=()=>{
    $('.rune-target',hud).textContent=next>12?'12 / 12 ✓':String(next).padStart(2,'0')+' / 12';
    $('.rune-faults',hud).textContent='Erreurs : '+errors+' / 3';
    [...meter.children].forEach((node,i)=>node.classList.toggle('filled',i<next-1));
  };
  g.board.replaceChildren();
  g.board.style.setProperty('--cols',4);
  const order=shuffle(Array.from({length:12},(_,i)=>i+1));
  for(const value of order){
    const b=button('',()=>{},'tile rune-tile');
    b.setAttribute('aria-label','Rune '+value+' sur 12 : '+runeNames[value-1]);
    b.setAttribute('title','Rune '+value+' · '+runeNames[value-1]);
    b.style.setProperty('--rune-x',((value-1)%4/3*100)+'%');
    b.style.setProperty('--rune-y',(Math.floor((value-1)/4)/2*100)+'%');
    const art=el('span','rune-art');
    art.setAttribute('aria-hidden','true');
    b.append(art,el('span','rune-number',String(value).padStart(2,'0')));
    b.addEventListener('click',()=>{
      if(g.ended||b.disabled)return;
      if(value===next){
        b.disabled=true;
        b.classList.add('done');
        next++;
        updateHud();
        if(next===13){
          g.status.classList.add('is-complete');
          complete(0,'Sceau restauré ! Les douze runes brillent de nouveau.');
        }else g.status.textContent='Rune '+value+' activée · cherche la '+next+'.';
      }else{
        errors++;
        b.classList.remove('wrong');
        void b.offsetWidth;
        b.classList.add('wrong');
        setTimeout(()=>b.classList.remove('wrong'),360);
        updateHud();
        if(errors>=3){
          g.ended=true;
          g.status.classList.add('is-failed');
          g.status.textContent='Le sceau s’est brisé. Relance une grille pour réessayer.';
        }else g.status.textContent='Ce n’est pas la rune '+next+' · '+errors+'/3 erreurs.';
      }
    });
    g.board.append(b);
  }
  updateHud();
  g.status.textContent='Active les pierres dans l’ordre des numéros, de 1 à 12.';
  g.actions.replaceChildren(button('✧ Nouvelle grille',startRunes));
}
const memoryRunes=[
  {id:'sun',label:'Soleil',sprite:1},
  {id:'moon',label:'Lune',sprite:2},
  {id:'stars',label:'Constellations',sprite:3},
  {id:'eye',label:'Œil ancien',sprite:4},
  {id:'spiral',label:'Spirale',sprite:5},
  {id:'tree',label:'Arbre-mémoire',sprite:6},
  {id:'compass',label:'Rose des vents',sprite:7},
  {id:'flare',label:'Étoiles jumelles',sprite:8}
];

let memorySession=0;
let memoryTurnTimer=null;
function startMemory(){
  const g=mini[1];
  const session=++memorySession;
  if(memoryTurnTimer!==null){clearTimeout(memoryTurnTimer);memoryTurnTimer=null;}
  g.ended=false;
  g.card.classList.add('memory-trial');
  g.board.classList.add('memory-board');
  g.status.classList.add('memory-statusline');
  g.status.classList.remove('is-complete','is-failed');

  let first=null, second=null, lock=false, moves=0, matches=0, mistakes=0;

  let hud=g.card.querySelector('.memory-hud');
  if(!hud){
    hud=el('div','memory-hud');
    const stats=el('div','memory-stats');
    stats.append(
      el('span','memory-label','Paires : '),
      el('strong','memory-pairs','0 / 8'),
      el('span','memory-gap',' · '),
      el('span','memory-label','Coups : '),
      el('strong','memory-moves','0')
    );
    const faults=el('span','memory-faults','Erreurs : 0');
    hud.append(stats,faults);
    const meter=el('div','memory-meter');
    meter.setAttribute('aria-hidden','true');
    for(let i=0;i<8;i++)meter.append(el('span'));
    g.board.before(hud,meter);
  }
  const meter=g.card.querySelector('.memory-meter');
  const updateHud=()=>{
    $('.memory-pairs',hud).textContent=`${matches} / 8`;
    $('.memory-moves',hud).textContent=String(moves);
    $('.memory-faults',hud).textContent=`Erreurs : ${mistakes}`;
    [...meter.children].forEach((node,i)=>node.classList.toggle('filled',i<matches));
  };

  const tiles=shuffle(memoryRunes.flatMap(r=>[
    {...r,key:`${r.id}-a`},
    {...r,key:`${r.id}-b`}
  ]));

  const reveal=(button)=>{
    button.disabled=true;
    button.classList.add('is-revealed');
    button.setAttribute('aria-pressed','true');
    button.setAttribute('aria-label',button.dataset.label+' — révélée');
  };
  const conceal=(button)=>{
    button.disabled=false;
    button.classList.remove('is-revealed');
    button.setAttribute('aria-pressed','false');
    button.setAttribute('aria-label',button.dataset.hiddenLabel);
  };
  const markMatched=(a,b)=>{
    a.classList.add('is-matched');
    b.classList.add('is-matched');
    a.setAttribute('aria-label',a.dataset.label+' — paire trouvée');
    b.setAttribute('aria-label',b.dataset.label+' — paire trouvée');
  };

  g.board.replaceChildren();
  g.board.style.setProperty('--cols',4);
  g.board.setAttribute('role','group');
  g.board.setAttribute('aria-label','Table de mémoire : seize tablettes runiques à associer en huit paires');

  tiles.forEach((item,index)=>{
    const buttonTile=el('button','tile memory-tile');
    buttonTile.type='button';
    buttonTile.dataset.id=item.id;
    buttonTile.dataset.label=item.label;
    buttonTile.dataset.sprite=String(item.sprite);
    buttonTile.dataset.hiddenLabel=`Tuile mémoire ${index+1} : face cachée`;
    buttonTile.setAttribute('aria-label',buttonTile.dataset.hiddenLabel);
    buttonTile.setAttribute('aria-pressed','false');
    buttonTile.style.setProperty('--sprite-x',((item.sprite-1)%4/3*100)+'%');
    buttonTile.style.setProperty('--sprite-y',(Math.floor((item.sprite-1)/4)/2*100)+'%');

    const shell=el('span','memory-shell');
    const back=el('span','memory-face memory-back');
    back.append(el('span','memory-back-glyph','✧'));
    const front=el('span','memory-face memory-front');
    front.append(el('span','memory-front-art'));
    shell.append(back,front);
    buttonTile.append(shell);

    buttonTile.addEventListener('click',()=>{
      if(g.ended||lock||buttonTile.classList.contains('is-revealed')||buttonTile.classList.contains('is-matched'))return;
      reveal(buttonTile);

      if(!first){
        first=buttonTile;
        g.status.textContent='Choisis une seconde tablette pour retrouver le symbole.';
        return;
      }

      second=buttonTile;
      lock=true;
      moves++;
      updateHud();

      if(first.dataset.id===second.dataset.id){
        markMatched(first,second);
        matches++;
        g.status.textContent=`Paire trouvée : ${first.dataset.label}.`;
        first=null; second=null; lock=false;
        updateHud();

        if(matches===8){
          g.status.classList.add('is-complete');
          complete(1,'La Mémoire ancienne est restaurée ! Les huit paires scintillent de nouveau.');
        }
      }else{
        mistakes++;
        g.status.textContent='Les deux reliques ne résonnent pas ensemble.';
        g.card.querySelector('.memory-faults').textContent=`Erreurs : ${mistakes}`;
        const pair=[first,second];
        pair.forEach(tile=>tile.classList.add('is-wrong'));
        memoryTurnTimer=setTimeout(()=>{
          memoryTurnTimer=null;
          if(session!==memorySession)return;
          pair.forEach(tile=>{tile.classList.remove('is-wrong');conceal(tile)});
          first=null;second=null;lock=false;
          g.status.textContent='Observe bien les symboles et retrouve leurs paires.';
        },560);
      }
    });

    g.board.append(buttonTile);
  });

  updateHud();
  g.status.textContent='Retourne les tablettes runiques et recompose les huit paires anciennes.';
  g.actions.replaceChildren(button('✧ Nouvelle table',startMemory));
}

/* Serrure d'Éther — a three-crystal sum lock with authentic illustrated sprites. */
function startLock(){
  const g=mini[2];
  g.ended=false;
  g.card.classList.add('lock-trial');
  g.board.classList.add('ether-lock-board');
  g.status.classList.add('ether-lock-status');
  g.status.classList.remove('is-complete','is-failed');

  // The three hidden solution stones guarantee at least one possible combination.
  const solution=Array.from({length:3},()=>2+Math.floor(Math.random()*9));
  const target=solution.reduce((a,b)=>a+b,0);
  const numbers=shuffle([...solution,...Array.from({length:3},()=>1+Math.floor(Math.random()*10))]);
  let selected=[],tries=0;
  const totalAttempts=3;

  let hud=g.card.querySelector('.ether-lock-hud');
  if(!hud){
    hud=el('div','ether-lock-hud');
    const dial=el('div','ether-lock-dial');
    dial.setAttribute('aria-hidden','true');
    const readout=el('div','ether-lock-readout');
    const label=el('span','ether-label','OBJECTIF DU SCEAU');
    const objective=el('strong','ether-target');
    const counters=el('div','ether-counters');
    counters.append(el('span','ether-sum'),el('span','ether-attempts'));
    const slots=el('div','ether-slots');
    slots.setAttribute('aria-label','Trois emplacements pour les cristaux sélectionnés');
    for(let i=0;i<3;i++)slots.append(el('span','ether-slot','◇'));
    readout.append(label,objective,counters,slots);
    hud.append(dial,readout);
    g.board.before(hud);
  }
  const dial=$('.ether-lock-dial',hud);
  dial.classList.remove('is-open','is-broken','is-warning');
  const targetEl=$('.ether-target',hud);
  targetEl.textContent=String(target);
  const sumEl=$('.ether-sum',hud);
  const attemptsEl=$('.ether-attempts',hud);
  const slots=$$('.ether-slot',hud);

  let validateButton;
  const updateHud=()=>{
    const sum=selected.reduce((n,i)=>n+numbers[i],0);
    sumEl.textContent='Somme : '+sum+' / '+target;
    attemptsEl.textContent='Essais : '+(totalAttempts-tries)+' / '+totalAttempts;
    slots.forEach((slot,i)=>{
      const filled=i<selected.length;
      slot.classList.toggle('filled',filled);
      slot.textContent=filled?String(numbers[selected[i]]):'◇';
    });
    if(validateButton)validateButton.disabled=g.ended||selected.length!==3;
  };
  const updateChoice=(index,element)=>{
    if(g.ended)return;
    dial.classList.remove('is-warning');
    const existing=selected.indexOf(index);
    if(existing!==-1){
      selected.splice(existing,1);
      element.classList.remove('selected');
      element.setAttribute('aria-pressed','false');
    }else if(selected.length<3){
      selected.push(index);
      element.classList.add('selected');
      element.setAttribute('aria-pressed','true');
    }else{
      g.status.textContent='Trois cristaux maximum : retire une pierre pour en choisir une autre.';
      return;
    }
    updateHud();
    g.status.textContent=selected.length===3
      ?'Trois cristaux prêts : active le mécanisme.'
      :'Choisis '+(3-selected.length)+' cristal'+(3-selected.length>1?'s':'')+' supplémentaire'+(3-selected.length>1?'s':'')+'.';
  };

  g.board.replaceChildren();
  g.board.setAttribute('role','group');
  g.board.setAttribute('aria-label','Six cristaux numérotés, choisis-en trois pour atteindre le nombre cible');
  g.board.style.setProperty('--cols',3);
  const crystalTypes=['Azur','Améthyste','Ambre','Émeraude','Givre','Prisme'];
  numbers.forEach((value,index)=>{
    const crystal=el('button','tile ether-crystal');
    crystal.type='button';
    crystal.setAttribute('aria-pressed','false');
    crystal.setAttribute('aria-label','Cristal '+crystalTypes[index]+' de valeur '+value);
    crystal.style.setProperty('--ether-x',((index+1)%3/2*100)+'%');
    crystal.style.setProperty('--ether-y',(Math.floor((index+1)/3)/2*100)+'%');
    const artwork=el('span','ether-crystal-art');
    artwork.setAttribute('aria-hidden','true');
    const number=el('span','ether-crystal-value',String(value));
    number.setAttribute('aria-hidden','true');
    crystal.append(artwork,number);
    crystal.addEventListener('click',()=>updateChoice(index,crystal));
    g.board.append(crystal);
  });

  validateButton=button('✦ Activer le sceau',()=>{
    if(g.ended||selected.length!==3)return;
    const sum=selected.reduce((n,i)=>n+numbers[i],0);
    if(sum===target){
      dial.classList.add('is-open');
      g.card.classList.add('lock-solved');
      g.status.classList.add('is-complete');
      validateButton.disabled=true;
      complete(2,'Serrure d’Éther ouverte ! Les trois cristaux sont alignés.');
      return;
    }
    tries++;
    selected=[];
    $$('.ether-crystal',g.board).forEach(crystal=>{
      crystal.classList.remove('selected');
      crystal.setAttribute('aria-pressed','false');
    });
    if(tries>=totalAttempts){
      g.ended=true;
      g.status.classList.add('is-failed');
      dial.classList.remove('is-warning');
      dial.classList.add('is-broken');
      g.status.textContent='Le mécanisme s’est figé. Relance une nouvelle serrure.';
    }else{
      dial.classList.remove('is-warning');
      void dial.offsetWidth;
      dial.classList.add('is-warning');
      g.status.textContent='Énergie '+sum+' au lieu de '+target+' : encore '+(totalAttempts-tries)+' essai'+(totalAttempts-tries>1?'s':'')+'.';
    }
    updateHud();
  },'primary');
  g.actions.replaceChildren(validateButton,button('Nouveau mécanisme',()=>{g.card.classList.remove('lock-solved');startLock()}));
  g.card.classList.remove('lock-solved');
  updateHud();
  g.status.textContent='Sélectionne trois cristaux et aligne leur énergie sur le nombre cible.';
}

/* Fouilles interdites: 25 sealed excavation sites, five traps, ten safe discoveries. */
function startMines(){
  const g=mini[3];
  g.ended=false;
  g.card.classList.add('excavation-trial');
  g.board.classList.add('excavation-board');
  g.status.classList.add('excavation-status');
  g.status.classList.remove('is-complete','is-failed');

  const bombs=new Set(shuffle(Array.from({length:25},(_,i)=>i)).slice(0,5));
  let safe=0;
  const countNearby=i=>{
    const x=i%5,y=Math.floor(i/5);
    let count=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;
      const xx=x+dx,yy=y+dy;
      if(xx>=0&&xx<5&&yy>=0&&yy<5&&bombs.has(yy*5+xx))count++;
    }
    return count;
  };
  const setArtwork=(tile,index)=>{
    tile.style.setProperty('--exc-x',((index%3)/2*100)+'%');
    tile.style.setProperty('--exc-y',(Math.floor(index/3)/2*100)+'%');
  };

  let hud=g.card.querySelector('.excavation-hud');
  if(!hud){
    hud=el('div','excavation-hud');
    const relic=el('div','excavation-relic');
    relic.setAttribute('aria-hidden','true');
    const stats=el('div','excavation-stats');
    stats.append(
      el('span','excavation-kicker','FOUILLES DES ARCHIVES'),
      el('div','excavation-counter'),
      el('span','excavation-danger','5 pièges dissimulés')
    );
    hud.append(relic,stats);
    const meter=el('div','excavation-meter');
    meter.setAttribute('aria-hidden','true');
    for(let i=0;i<10;i++)meter.append(el('span'));
    g.board.before(hud,meter);
  }
  const relic=$('.excavation-relic',hud);
  relic.classList.remove('is-victorious','is-failed');
  const meter=g.card.querySelector('.excavation-meter');
  const updateHud=()=>{
    $('.excavation-counter',hud).textContent=safe+' / 10 cases sûres';
    $('.excavation-danger',hud).textContent=g.ended
      ?(safe===10?'Fouille accomplie':'Piège déclenché'):'5 pièges dissimulés';
    [...meter.children].forEach((node,index)=>node.classList.toggle('filled',index<safe));
  };

  g.board.replaceChildren();
  g.board.style.setProperty('--cols',5);
  g.board.setAttribute('role','group');
  g.board.setAttribute('aria-label','Site de fouilles : vingt-cinq dalles, cinq pièges dissimulés');
  const tiles=[];
  for(let i=0;i<25;i++){
    const tile=el('button','tile excavation-tile');
    tile.type='button';
    tile.setAttribute('aria-label','Fouiller la dalle '+(i+1));
    tile.setAttribute('title','Dalle '+(i+1));
    setArtwork(tile,0);
    const sprite=el('span','excavation-art');
    sprite.setAttribute('aria-hidden','true');
    tile.append(sprite);
    tile.addEventListener('click',()=>{
      if(g.ended||tile.disabled)return;
      tile.disabled=true;
      tile.classList.add('is-dug');
      if(bombs.has(i)){
        g.ended=true;
        relic.classList.add('is-failed');
        g.status.classList.add('is-failed');
        // After a failure reveal the hidden traps, but do not alter prior discoveries.
        for(const position of bombs){
          const dangerTile=tiles[position];
          dangerTile.disabled=true;
          dangerTile.classList.add('is-trap');
          if(position===i)dangerTile.classList.add('is-triggered');
          setArtwork(dangerTile,3);
          dangerTile.setAttribute('aria-label','Dalle '+(position+1)+' : piège runique');
        }
        tiles.forEach(b=>b.disabled=true);
        updateHud();
        g.status.textContent='Une rune corrompue s’est éveillée. Les cinq pièges sont révélés : recommence une fouille.';
        return;
      }
      const adjacent=countNearby(i);
      // Empty sites occasionally display a glowing discovery; numbered clues remain crystal-clear.
      const discoveries=[1,2,4,5,6];
      setArtwork(tile,adjacent===0?discoveries[(i*7)%discoveries.length]:1);
      tile.classList.add('is-safe');
      tile.setAttribute('aria-label','Dalle '+(i+1)+' fouillée : '+(adjacent?adjacent+' piège'+(adjacent>1?'s':'')+' voisin'+(adjacent>1?'s':''):'aucun piège voisin'));
      if(adjacent){
        const clue=el('span','excavation-clue',String(adjacent));
        clue.setAttribute('aria-hidden','true');
        tile.append(clue);
      }
      safe++;
      updateHud();
      if(safe===10){
        relic.classList.add('is-victorious');
        g.status.classList.add('is-complete');
        tiles.forEach(b=>b.disabled=true);
        complete(3,'Fouille accomplie ! Dix dalles sûres ont été explorées.');
      }else g.status.textContent='Dalle '+(i+1)+' : '+(adjacent?adjacent+' piège(s) voisin(s).':'aucun piège adjacent.')+' Continue la fouille.';
    });
    g.board.append(tile);
    tiles.push(tile);
  }
  updateHud();
  g.status.textContent='Soulève les dalles. Les nombres révèlent combien de pièges entourent une case.';
  g.actions.replaceChildren(button('✧ Nouvelle fouille',startMines));
}

const ingredients=[['☘','Mousse'],['☀','Soleil'],['◈','Cristal'],['☾','Lune'],['✿','Fleur'],['❄','Givre']];
const recipes=[['Élixir de Vie',[0,4]],['Sérum solaire',[1,2]],['Souffle lunaire',[3,5]],['Sève d’Aurore',[0,1]],['Nectar cristallin',[2,4]]];
/* Laboratoire arcanique: three recipes, two ingredients each, three mistakes maximum.
   HD sprites are presentation only; the five original recipes and reward are retained. */
let alchemySession=0;
let alchemyTimer=null;
function startAlchemy(){
  const g=mini[4];
  const session=++alchemySession;
  if(alchemyTimer!==null){clearTimeout(alchemyTimer);alchemyTimer=null}
  g.ended=false;
  g.card.classList.add('alchemy-trial');
  g.board.classList.add('alchemy-board');
  g.status.classList.add('alchemy-status');
  g.status.classList.remove('is-complete','is-failed');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const selectedRecipes=shuffle([...recipes]).slice(0,3);
  let round=0,errors=0,selected=[],busy=false;

  let hud=g.card.querySelector('.alchemy-hud');
  if(!hud){
    hud=el('div','alchemy-hud');
    const cauldron=el('div','alchemy-cauldron');
    cauldron.setAttribute('aria-hidden','true');
    const panel=el('div','alchemy-recipe');
    panel.append(
      el('span','alchemy-kicker','GRIMOIRE DES ARCHIVES'),
      el('strong','alchemy-name'),
      el('span','alchemy-requirement'),
      el('div','alchemy-counters'),
      el('div','alchemy-slots')
    );
    const counters=$('.alchemy-counters',panel);
    counters.append(el('span','alchemy-round'),el('span','alchemy-errors'));
    const slots=$('.alchemy-slots',panel);
    slots.setAttribute('aria-label','Deux ingrédients sélectionnés');
    for(let i=0;i<2;i++)slots.append(el('span','alchemy-slot','◇'));
    hud.append(cauldron,panel);
    const meter=el('div','alchemy-meter');
    meter.setAttribute('aria-hidden','true');
    for(let i=0;i<3;i++)meter.append(el('span'));
    g.board.before(hud,meter);
  }
  const cauldron=$('.alchemy-cauldron',hud);
  const meter=g.card.querySelector('.alchemy-meter');
  const slots=$$('.alchemy-slot',hud);
  const ingredientNames=ingredients.map(item=>item[1]);
  const symbols=['Mousse','Soleil','Cristal','Lune','Fleur','Givre'];
  const ingredientButtons=[];
  let mixButton;

  const updateHud=()=>{
    const [name,required]=selectedRecipes[Math.min(round,2)];
    $('.alchemy-name',hud).textContent=name;
    $('.alchemy-requirement',hud).textContent='Ingrédients : '+required.map(i=>ingredientNames[i]).join(' + ');
    $('.alchemy-round',hud).textContent='Potion '+Math.min(round+1,3)+' / 3';
    $('.alchemy-errors',hud).textContent='Erreurs '+errors+' / 3';
    [...meter.children].forEach((node,i)=>node.classList.toggle('filled',i<round));
    slots.forEach((slot,i)=>{
      const filled=i<selected.length;
      slot.classList.toggle('filled',filled);
      slot.textContent=filled?ingredientNames[selected[i]]:'◇';
    });
    ingredientButtons.forEach((button,index)=>{
      const active=selected.includes(index);
      button.classList.toggle('selected',active);
      button.setAttribute('aria-pressed',String(active));
    });
    if(mixButton)mixButton.disabled=g.ended||busy||selected.length!==2;
  };

  g.board.replaceChildren();
  g.board.setAttribute('role','group');
  g.board.setAttribute('aria-label','Six ingrédients magiques : choisis deux ingrédients pour chaque potion');
  g.board.style.setProperty('--cols',3);
  for(let i=0;i<ingredients.length;i++){
    const tile=el('button','tile alchemy-ingredient');
    tile.type='button';
    tile.setAttribute('aria-label','Sélectionner '+ingredientNames[i]);
    tile.setAttribute('aria-pressed','false');
    tile.style.setProperty('--alchemy-x',((i%3)/2*100)+'%');
    tile.style.setProperty('--alchemy-y',(Math.floor(i/3)/2*100)+'%');
    const artwork=el('span','alchemy-art');
    artwork.setAttribute('aria-hidden','true');
    tile.append(artwork,el('span','alchemy-ingredient-name',symbols[i]));
    tile.addEventListener('click',()=>{
      if(g.ended||busy)return;
      const prior=selected.indexOf(i);
      if(prior!==-1)selected.splice(prior,1);
      else if(selected.length<2)selected.push(i);
      else{
        g.status.textContent='Deux ingrédients maximum : retire une sélection pour la remplacer.';
        return;
      }
      updateHud();
      g.status.textContent=selected.length===2
        ?'Les ingrédients sont prêts : mélange-les dans le chaudron.'
        :'Sélectionne deux ingrédients pour préparer la potion.';
    });
    ingredientButtons.push(tile);
    g.board.append(tile);
  }
  const showRecipe=()=>{
    if(g.ended)return;
    selected=[];busy=false;
    cauldron.classList.remove('is-success','is-error','is-brewing');
    g.status.classList.remove('is-complete','is-failed');
    updateHud();
    g.status.textContent='Reproduis la recette du grimoire, puis mélange les deux ingrédients.';
  };
  const mix=()=>{
    if(g.ended||busy||selected.length!==2)return;
    busy=true;
    updateHud();
    cauldron.classList.remove('is-success','is-error');
    cauldron.classList.add('is-brewing');
    g.status.textContent='Le mélange entre en résonance…';
    const choice=[...selected];
    const [name,required]=selectedRecipes[round];
    alchemyTimer=setTimeout(()=>{
      alchemyTimer=null;
      if(session!==alchemySession||g.ended)return;
      cauldron.classList.remove('is-brewing');
      const success=choice.every(i=>required.includes(i));
      if(success){
        round++;
        cauldron.classList.add('is-success');
        updateHud();
        if(round===3){
          g.status.classList.add('is-complete');
          ingredientButtons.forEach(button=>button.disabled=true);
          complete(4,'Alchimie maîtrisée ! Trois potions créées dans les Archives.');
          if(mixButton)mixButton.disabled=true;
          return;
        }
        g.status.textContent='✓ '+name+' réussie ! Préparation de la potion suivante…';
      }else{
        errors++;
        cauldron.classList.add('is-error');
        updateHud();
        if(errors===3){
          g.ended=true;
          g.status.classList.add('is-failed');
          ingredientButtons.forEach(button=>button.disabled=true);
          g.status.textContent='Mélange instable : le laboratoire est scellé. Recommence une nouvelle session.';
          if(mixButton)mixButton.disabled=true;
          return;
        }
        g.status.textContent='Mélange instable : il reste '+(3-errors)+' erreur'+(3-errors>1?'s':'')+' possible'+(3-errors>1?'s':'')+'.';
      }
      alchemyTimer=setTimeout(()=>{
        alchemyTimer=null;
        if(session===alchemySession)showRecipe();
      },reduced?170:850);
    },reduced?30:570);
  };
  mixButton=button('✦ Mélanger',mix,'primary');
  g.actions.replaceChildren(mixButton,button('Nouvelle session',startAlchemy));
  showRecipe();
}

[startRunes,startMemory,startLock,startMines,startAlchemy].forEach(fn=>fn());
const picker=$('#game-picker');
let selectedGame=0;
const trialSubtitles=['Ordre & observation','Mémoire & association','Logique des cristaux','Exploration & prudence','Recettes & alchimie'];
definitions.forEach((entry,index)=>{
  const control=button('',()=>selectGame(index),'game-choice');
  control.append(el('span','game-choice-name',(index+1)+' · '+entry.name),
    el('span','game-choice-hint',trialSubtitles[index]));
  control.setAttribute('aria-label','Choisir '+entry.name);
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
function makeCard(c,isShiny=false,locked=false){
  const chromatic=!!isShiny&&!locked;
  const preview=locked&&(c.id===1||(previewArt&&hasApprovedArt(c.id)));
  const reallyLocked=locked&&!preview;
  const b=el('button','card'+(reallyLocked?' is-sealed':'')+(chromatic?' is-chromatic':''));
  b.type='button';
  b.dataset.cardId=String(c.id);
  b.style.setProperty('--edge',RARITIES[c.rarity].color);
  if(reallyLocked){
    const art=el('span','codex-sealed-art');
    art.setAttribute('aria-hidden','true');
    art.append(el('span','codex-sealed-glyph','✧'),
      el('span','codex-sealed-number','ARCHIVE '+String(c.id).padStart(3,'0')));
    b.append(art);
  }else{
    const img=el('img');
    applyCardIllustration(img,c,{shiny:chromatic,size:'thumbnail'});
    if(chromatic){
      const art=el('span','chromatic-art-window');
      art.append(img);b.append(art);
    }else b.append(img);
  }
  const meta=el('div','info');
  meta.append(el('div','name',reallyLocked?'Archive scellée':c.name),
    el('div','meta',reallyLocked?'À découvrir · '+RARITIES[c.rarity].label:RARITIES[c.rarity].label+' · '+c.type));
  b.append(meta);
  if(!locked&&state.owned[c.id])b.append(el('span','amount','×'+state.owned[c.id]));
  if(chromatic)b.append(el('span','shine chromatic-seal','✧ CHROMATIQUE'));
  if(preview){
    b.append(el('span','shine','APERÇU'));
    b.setAttribute('aria-label','Voir l’illustration de '+c.name+' sans posséder cette carte');
  }else if(reallyLocked){
    b.setAttribute('aria-label','Archive '+String(c.id).padStart(3,'0')+', non découverte : ouvrir la fiche scellée');
  }else if(chromatic){
    b.setAttribute('aria-label',c.name+' — version Chromatique, '+RARITIES[c.rarity].label);
  }
  b.addEventListener('click',()=>{
    if($('#page-boosters').classList.contains('active'))navigate('collection');
    if(reallyLocked)inspectSealed(c);
    else inspect(c,chromatic);
  });
  return b;
}
// The side-by-side Codex guide deliberately uses the same approved artwork:
// this is a visual demonstration and NEVER grants a Chromatique.
const comparisonCard=CARDS[0];
applyCardIllustration($('#chromatic-example-normal'),comparisonCard,{shiny:false,size:'full'});
applyCardIllustration($('#chromatic-example-special'),comparisonCard,{shiny:false,size:'full'});
let filterType='all',filterRarity='all',filterFinish='all',selectedCard=null,previewArt=false;
let activeChapter='all',discoveryFilter='all',codexVisibleCards=[];
const codexOverview={id:'all',number:'✦',title:'Toutes les archives',
  subtitle:'Les légendes d’Origines réunies',sigil:'✦'};
function markCodexSelected(id){
  $$('#card-grid .card').forEach(tile=>{
    const selected=Number(tile.dataset.cardId)===id;
    tile.classList.toggle('is-selected',selected);
    tile.setAttribute('aria-pressed',String(selected));
  });
}
function codexBrowseTo(card){
  if(!card)return;
  const locked=!state.owned[card.id]&&card.id!==1&&!(previewArt&&hasApprovedArt(card.id));
  if(locked)inspectSealed(card,false);
  else inspect(card,filterFinish==='normal'?false:!!state.shiny[card.id],false);
}
function addCodexNavigation(panel,c){
  const index=codexVisibleCards.findIndex(item=>item.id===c.id);
  if(index<0)return;
  const nav=el('div','codex-inspector-navigation');
  nav.setAttribute('aria-label','Feuilleter les archives affichées');
  const previous=button('‹ Précédente',()=>browse(index-1),'codex-inspector-prev');
  const next=button('Suivante ›',()=>browse(index+1),'codex-inspector-next');
  previous.disabled=index===0;
  next.disabled=index===codexVisibleCards.length-1;
  nav.append(previous,el('small','',String(index+1)+' / '+codexVisibleCards.length),next);
  panel.append(nav);
  function browse(target){
    codexBrowseTo(codexVisibleCards[target]);
    const heading=$('#inspector h2');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
  }
}
function inspectSealed(c,scroll=true){
  selectedCard={id:c.id,shiny:false,sealed:true};
  const panel=$('#inspector');
  panel.replaceChildren();
  panel.classList.remove('is-chromatic');
  const seal=el('div','codex-sealed-inspector');
  seal.setAttribute('aria-hidden','true');
  seal.append(el('span','','✧'),el('span','','ARCHIVE '+String(c.id).padStart(3,'0')));
  const chapter=chapterFor(c);
  panel.append(seal,
    el('p','kicker','ARCHIVE '+String(c.id).padStart(3,'0')+' · '+RARITIES[c.rarity].label),
    el('h2','','Archive non découverte'),
    el('p','codex-inspector-chapter',chapter?'Chapitre '+chapter.number+' · '+chapter.title:'Origines'),
    el('p','muted','Cette page est encore scellée. Découvre cette carte dans les boosters ou façonne-la dans l’Atelier.'));
  panel.append(button('Ouvrir des boosters',()=>navigate('boosters'),'secondary'),
    button('Explorer l’Atelier',()=>navigate('atelier'),'secondary'));
  addCodexNavigation(panel,c);
  markCodexSelected(c.id);
  if(scroll){
    if(mobileView.matches)openSheet('inspector');
    else if(matchMedia('(max-width:1050px)').matches)panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}
function inspect(c,shiny=false,scroll=true,chromaticPreview=false){
  // Legacy shiny flags and owned quantities remain the only saved data.
  const ownedChromatic=!!state.shiny[c.id];
  const previewChromatic=!!shiny&&!ownedChromatic&&!!chromaticPreview;
  const chromatic=!!shiny&&(ownedChromatic||previewChromatic);
  selectedCard={id:c.id,shiny:chromatic,preview:previewChromatic};
  const panel=$('#inspector');
  panel.replaceChildren();
  panel.classList.toggle('is-chromatic',chromatic);
  panel.style.setProperty('--edge',RARITIES[c.rarity].color);
  const img=el('img');
  applyCardIllustration(img,c,{shiny:chromatic,size:'full'});
  img.alt='Illustration de '+c.name+(chromatic?', version Chromatique':'');
  const artwork=el('div','inspector-art-shell'+(chromatic?' is-chromatic':''));
  artwork.append(img);
  if(chromatic){
    artwork.append(el('span','inspector-chromatic-seal','✧ CHROMATIQUE'));
    if(previewChromatic)artwork.append(el('span','inspector-chromatic-preview','APERÇU · NON POSSÉDÉ'));
  }
  const kicker=el('p','kicker','ARCHIVE '+String(c.id).padStart(3,'0')+' · '+RARITIES[c.rarity].label);
  const title=el('h2','',c.name);
  const chapter=chapterFor(c);
  const chapterLabel=el('p','codex-inspector-chapter',chapter?'Chapitre '+chapter.number+' · '+chapter.title:'Origines');
  const desc=el('p','','« '+c.lore+' »');
  const stats=el('div','stats');
  stats.append(el('span','','⚔ '+c.attack),el('span','','♥ '+c.health),el('span','','×'+(state.owned[c.id]||0)));
  panel.append(artwork,kicker,title,chapterLabel,el('p','muted',c.type+
    (chromatic?' · ✧ Version Chromatique':' · Version normale')+
    (previewChromatic?' · Aperçu uniquement':state.owned[c.id]?'':' · Aperçu non possédé')),desc,stats);
  if(ownedChromatic){
    panel.append(button(chromatic?'Voir la version normale':'Voir la version Chromatique',
      ()=>inspect(c,!chromatic,false),'secondary chromatic-toggle'));
  }else if(state.owned[c.id]||previewArt||c.id===1){
    const toggle=button(chromatic?'Voir la version normale':'✧ Prévisualiser en Chromatique',
      ()=>inspect(c,!chromatic,false,!chromatic),'secondary chromatic-toggle');
    toggle.setAttribute('aria-label',chromatic?'Revenir à la carte normale':'Voir une simulation Chromatique sans débloquer cette carte');
    panel.append(toggle);
    if(!chromatic)panel.append(el('p','chromatic-inspector-hint',
      'Tu ne possèdes pas cette variante : aperçu visuel sans déblocage.'));
  }
  addCodexNavigation(panel,c);
  markCodexSelected(c.id);
  if(scroll){
    if(mobileView.matches)openSheet('inspector');
    else if(matchMedia('(max-width:1050px)').matches)panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}
function renderCodexChapters(){
  const totals=codexProgress(CARDS,state.owned,state.shiny);
  $('#codex-progress-discovered').textContent=totals.discovered+' / '+totals.total;
  $('#codex-progress-chromatic').textContent=totals.chromatic+' / '+totals.total;
  $('#codex-progress-fill').style.width=totals.percent+'%';
  $('#codex-chromatic-fill').style.width=totals.chromaticPercent+'%';
  $('#codex-progress-track').setAttribute('aria-valuenow',String(totals.discovered));
  $('#codex-chromatic-track').setAttribute('aria-valuenow',String(totals.chromatic));
  const holder=$('#codex-chapter-list');
  if(!holder.childElementCount){
    for(const chapter of [codexOverview,...CODEX_CHAPTERS]){
      const tile=button('',()=>{activeChapter=chapter.id;renderCollection()},'codex-chapter');
      tile.dataset.chapter=chapter.id;
      const eyebrow=el('span','codex-chapter-eyebrow',
        chapter.id==='all'?'✦ ALBUM ORIGINES':'✦ CHAPITRE '+chapter.number);
      const name=el('span','codex-chapter-name',chapter.title);
      const count=el('span','codex-chapter-count');
      const track=el('span','codex-chapter-track');
      track.setAttribute('aria-hidden','true');
      track.append(el('span'));
      tile.append(eyebrow,name,count,track);
      holder.append(tile);
    }
  }
  for(const tile of $$('.codex-chapter',holder)){
    const id=tile.dataset.chapter,chapter=CODEX_CHAPTERS.find(item=>item.id===id);
    const stats=codexProgress(chapterCards(CARDS,id),state.owned,state.shiny);
    const active=id===activeChapter;
    tile.classList.toggle('is-active',active);
    tile.classList.toggle('is-complete',stats.total>0&&stats.discovered===stats.total);
    tile.setAttribute('aria-pressed',String(active));
    tile.setAttribute('aria-label',(chapter?'Chapitre '+chapter.number+', ':'')+
      (chapter?.title??'Toutes les archives')+', '+stats.discovered+' cartes sur '+stats.total+
      ', '+stats.chromatic+' Chromatiques');
    $('.codex-chapter-count',tile).textContent=stats.discovered+' / '+stats.total+
      ' · ✧ '+stats.chromatic;
    $('.codex-chapter-track>span',tile).style.width=stats.percent+'%';
  }
  const active=CODEX_CHAPTERS.find(chapter=>chapter.id===activeChapter);
  $('#codex-chapter-title').textContent=active?'Chapitre '+active.number+' · '+active.title:'Toutes les archives';
  $('#codex-chapter-subtitle').textContent=active?.subtitle??'Les légendes d’Origines réunies';
}
function renderCollection(){
  renderCodexChapters();
  const gallery=$('#card-grid');
  const q=$('#search').value.trim();
  const cards=filterCodex(CARDS,{chapter:activeChapter,type:filterType,rarity:filterRarity,
    finish:filterFinish,discovery:discoveryFilter,query:q,owned:state.owned,shiny:state.shiny});
  codexVisibleCards=cards;
  gallery.replaceChildren();
  for(const c of cards){
    const chromatic=filterFinish==='normal'?false:!!state.shiny[c.id];
    gallery.append(makeCard(c,chromatic,!state.owned[c.id]));
  }
  const inChapter=chapterCards(CARDS,activeChapter).length;
  $('#codex-results').textContent=cards.length+' / '+inChapter+' archives';
  const empty=$('#empty');
  empty.classList.add('codex-empty');
  empty.hidden=cards.length>0;
  empty.textContent=cards.length?'':filterFinish==='chromatic'?
    'Aucune Chromatique ne correspond à ces filtres. Essaie un autre chapitre ou une autre rareté.':
    discoveryFilter==='collected'?'Aucune carte découverte ne correspond à ces critères.':
    'Aucune archive ne correspond à cette recherche.';
  const appliedFilters=(filterType!=='all'?1:0)+(filterRarity!=='all'?1:0)+
    (filterFinish!=='all'?1:0)+(discoveryFilter!=='all'?1:0);
  const filterCount=$('#filter-count');
  filterCount.hidden=appliedFilters===0;
  filterCount.textContent=String(appliedFilters);
  const next=cards.find(c=>c.id===selectedCard?.id)||cards[0];
  if(next){
    const revealed=!!state.owned[next.id]||next.id===1||(previewArt&&hasApprovedArt(next.id));
    if(!revealed)inspectSealed(next,false);
    else{
      const chromatic=filterFinish==='normal'?false:
        filterFinish==='chromatic'?!!state.shiny[next.id]:
        (selectedCard?.id===next.id?selectedCard.shiny:!!state.shiny[next.id]);
      inspect(next,chromatic,false,!!(selectedCard?.id===next.id&&selectedCard?.preview&&chromatic));
    }
  }else{
    selectedCard=null;
    const panel=$('#inspector');
    panel.classList.remove('is-chromatic');
    panel.replaceChildren(el('p','muted','Choisis un autre chapitre ou ajuste les filtres pour feuilleter les archives.'));
  }
  update();
}
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
  syncPreviewToggle();renderCollection();
});
syncPreviewToggle();
$$('[data-type]').forEach(b=>b.addEventListener('click',()=>{
  filterType=b.dataset.type;
  $$('[data-type]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});
  renderCollection();
}));
$$('[data-rarity]').forEach(b=>b.addEventListener('click',()=>{
  filterRarity=b.dataset.rarity;
  $$('[data-rarity]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});
  renderCollection();
}));
$$('[data-finish]').forEach(b=>b.addEventListener('click',()=>{
  filterFinish=b.dataset.finish;
  $$('[data-finish]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});
  renderCollection();
}));
$$('[data-discovery]').forEach(b=>b.addEventListener('click',()=>{
  discoveryFilter=b.dataset.discovery;
  $$('[data-discovery]').forEach(x=>{
    x.classList.toggle('is-active',x===b);
    x.setAttribute('aria-pressed',String(x===b));
  });
  renderCollection();
}));

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
  // Booster reveals are full-size views, not enlarged thumbnails.
  const revealedImage=artwork.querySelector('img');
  if(revealedImage)applyCardIllustration(revealedImage,item.card,{shiny:item.shiny,size:'full'});
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
  tile.classList.toggle('is-chromatic',item.shiny);
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
  const tag=el('div','pull-tag'+(item.shiny?' is-chromatic':item.isNew?' is-new':' is-duplicate'),
    item.shiny?'✧ CARTE CHROMATIQUE':item.isNew?'✧ Nouvelle carte':'Doublon · +5 Éclats');
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
  if(currentDraw[currentIndex].shiny)tile.classList.add('chromatic-unveiling');
  const back=tile.querySelector('.pull-back'),front=tile.querySelector('.pull-front');
  back.disabled=true;back.tabIndex=-1;back.setAttribute('aria-hidden','true');
  front.inert=false;front.removeAttribute('aria-hidden');
  boosterProgressFill.style.width=((currentIndex+1)/currentDraw.length*100)+'%';
  const item=currentDraw[currentIndex];
  $('#pack-title').textContent=item.card.name;
  $('#pack-msg').textContent=RARITIES[item.card.rarity].label+(item.shiny?' · ✧ CHROMATIQUE !':'')+
    (item.isNew?' · Nouvelle carte':' · Doublon (+5 Éclats)');
  nextPullButton.textContent=currentIndex===currentDraw.length-1?'Voir les cinq cartes':'Carte suivante ›';
  nextPullButton.hidden=false;
  // Keep the card on screen until the player chooses to continue.
  if(reducedMotion.matches)nextPullButton.focus({preventScroll:true});
  else afterBooster(item.shiny?950:420,()=>{if(boosterBusy&&cardFaceUp)nextPullButton.focus({preventScroll:true})});
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
    el('span',drawSummary.shinyCount?'booster-star':'',drawSummary.shinyCount+' Chromatique(s)')
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

const success=[['Premiers pas','Terminer une épreuve',()=>state.wins>=1],['Explorateur','Terminer 10 épreuves',()=>state.wins>=10],['Archéologue','Terminer 50 épreuves',()=>state.wins>=50],['Curieux','Ouvrir son premier booster',()=>state.opened>=1],['Collectionneur','Découvrir 12 cartes',()=>Object.keys(state.owned).length>=12],['Archiviste','Découvrir les 24 cartes',()=>Object.keys(state.owned).length>=24],['Éclat rare','Trouver une carte Chromatique',()=>Object.keys(state.shiny).length>=1],['Pactole','Gagner 1 000 Couronnes',()=>state.earned>=1000],['Chasseur de légendes','Obtenir une carte légendaire',()=>CARDS.some(c=>c.rarity==='legendary'&&state.owned[c.id])]];
function renderAchievements(){const root=$('#achievements');root.replaceChildren();for(const [title,description,test] of success){const done=test();const box=el('article','achievement'+(done?'':' locked'));box.append(el('h3','',done?'✦ '+title:'◇ '+title),el('p','',description),el('small','muted',done?'Accompli':'À découvrir'));root.append(box)}}
$('#reset').addEventListener('click',()=>{if(!confirm('Effacer définitivement les cartes et la progression sauvegardées sur cet appareil ?'))return;clearBoosterScene();state=fresh();selectedCard=null;forgeSelectedId=null;forgeFilter='all';$('#atelier-filter').value='all';$('#atelier-result').hidden=true;$('#inspector').replaceChildren(el('p','muted','Sélectionne une carte découverte pour l’admirer.'));$('#pulls').replaceChildren();$('#pack-title').textContent='Les archives attendent leur voyageur.';$('#pack-msg').textContent='Gagne des Couronnes en jouant pour ouvrir des boosters.';update();renderCollection();notify('Progression réinitialisée.')});
syncMobileSheets();
update();
navigate(APP_PAGES.includes(location.hash.slice(1))?location.hash.slice(1):'jouer');
window.addEventListener('hashchange',()=>{
  const page=location.hash.slice(1);
  if(APP_PAGES.includes(page)&&!$('#page-'+page).classList.contains('active'))navigate(page);
});
