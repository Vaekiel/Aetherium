import {RARITIES,PACK_PRICE,drawPack} from './data.js?v=booster-variety-1';
import {CARDS,drawRefletsPack,drawAuDelaPack} from './collection-data.js?v=au-dela-booster-1';
import {CRAFT_COSTS,getCraftCost,craftCard} from './crafting.js';
import {duplicateDustReward} from './duplicate-rewards.js';
import {boosterMoment} from './booster-feedback.js?v=booster-polish-1';
import {applyCardIllustration,hasApprovedArt,CARD_ART} from './card-art.js?v=au-dela-booster-1';
import {codexProgress,filterCodex} from './codex.js';
import {FINISHES,FINISH_KEYS,restoreFinishCounts,synchronizeFinishCounts,finishQuantity,finishUnique,finishTotal,preferredFinish} from './finishes.js';
import {enableHolographicInspection} from './finish-interaction.js';
import {sanitizeRecentFinds,recordRecentFind,buildLivingArchive} from './living-archives.js?v=au-dela-booster-1';
import {createBackup,decodeBackup,installImportedSave,restorePreviousSave,PREVIOUS_SAVE_KEY,MAX_BACKUP_SIZE} from './save-backup.js';
import {SEASONS,seasonById,collectionById,cardsForCollection,collectionForCard,seasonProgress} from './seasons.js?v=au-dela-booster-1';
import {mountRefletsGallery} from './reflets-gallery.js?v=reflets-final-24';
import {mountAuDelaGallery} from './au-dela-gallery.js?v=au-dela-lot-3';
import {milestonesFor,sanitizeMilestoneClaims,uniqueCardsOwned,collectionMilestoneStatus,claimCollectionMilestone} from './collection-milestones.js?v=au-dela-journal-1';
import {DIFFICULTIES,validDifficulty,trialRules,trialObjective,trialScore,trialReward,emptyTrialStats,sanitizedTrialStats,recordTrialWin,masteryLevel} from './trial-progress.js?v=mastery-balance-2';
import {TRIAL_RECORD_MODES,TRIAL_RECORD_METRICS,sanitizedTrialRecords,recordPersonalBest,recordMetricLabel} from './trial-records.js';
import {trialChallengesFor} from './trial-challenges.js';
import {TRIAL_TITLES,earnedTrialTitles,validEquippedTitle,toggleEquippedTitle} from './trial-titles.js';
import {EXPEDITION_ROUTES,FINALE_ID,FINALE_PREREQUISITES,FINALE_VOWS,canStartFinale,chooseFinaleVow,awardFinaleCard,sanitizeExpedition,startExpedition,abandonExpedition,armExpedition,expeditionVictory,expeditionSummary} from './expeditions.js?v=dernier-accord-1';
import {nextRuneRitual,runeExpectedAt} from './rune-rituals.js';
import {makeEtherPuzzle,etherRule,evaluateEtherAttempt,etherAttemptFeedback} from './ether-lock-puzzles.js';
import {nextMemoryRitual,buildMemoryDeck} from './memory-rituals.js';
import {makeExcavationSite,chooseExcavationGuide} from './excavation-sites.js';
import {ALCHEMY_ESSENCES,ALCHEMY_MODES,ALCHEMY_RECIPE_COUNT,alchemyClue,recipeIndex,rememberAlchemyRecipe,sanitizeAlchemyKnown} from './alchemy-rituals.js';

const $=(q,root=document)=>root.querySelector(q);
const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
const mobileView=window.matchMedia('(max-width:850px)');
const sheetScrim=$('#sheet-scrim'), filterDrawer=$('#collection-filters'), inspectorShell=$('#inspector-shell');
let sheetReturnFocus=null;
function closeSheets(restoreFocus=true){
  // A mobile Codex inspection lives in the browser top layer, not inside
  // the animated page stacking context beneath the blurred scrim.
  if(inspectorShell.matches(':popover-open'))inspectorShell.hidePopover();
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
  // Native popover top layer is always in front of backdrop-filter and the
  // animated Codex page; its content never receives background blur.
  if(kind==='inspector'&&typeof target.showPopover==='function')target.showPopover();
  sheetScrim.hidden=false;
  document.body.classList.add('sheet-open');
  if(kind==='filters')$('#filter-open').setAttribute('aria-expanded','true');
  (kind==='filters'?$('#filter-close'):$('#inspect-close')).focus({preventScroll:true});
}
function syncMobileSheets(){
  closeSheets(false);
  for(const target of [filterDrawer,inspectorShell]){
    if(mobileView.matches){
      if(target===inspectorShell)target.setAttribute('popover','manual');
      target.setAttribute('role','dialog');
      target.setAttribute('aria-modal','true');
      target.setAttribute('aria-hidden','true');
      target.inert=true;
    }else{
      if(target===inspectorShell)target.removeAttribute('popover');
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
const fresh=()=>({coins:300,dust:0,owned:{},shiny:{},wins:0,earned:0,opened:0,goalId:null,difficulty:'aventure',trialStats:[],collectionMilestones:{},recentFinds:[],alchemyKnown:[],trialRecords:[],titleId:null,expedition:{route:null,step:0,mode:null,armed:false,completedRoutes:[]}});
function load(){try{const raw=JSON.parse(localStorage.getItem(SAVE));if(!raw||typeof raw!=='object')return fresh();const s=fresh();for(const field of ['coins','dust','wins','earned','opened'])if(Number.isSafeInteger(raw[field])&&raw[field]>=0&&raw[field]<1e9)s[field]=raw[field];for(const c of CARDS){const n=raw.owned?.[c.id];if(Number.isSafeInteger(n)&&n>0&&n<1e6)s.owned[c.id]=n;if(raw.shiny?.[c.id]===true&&s.owned[c.id])s.shiny[c.id]=true}if(Number.isSafeInteger(raw.goalId)&&CARDS.some(c=>c.id===raw.goalId&&c.signature!==true)&&!s.owned[raw.goalId])s.goalId=raw.goalId;if(['initiation','aventure','maitrise'].includes(raw.difficulty))s.difficulty=raw.difficulty;if(Array.isArray(raw.trialStats))s.trialStats=raw.trialStats;if(Array.isArray(raw.trialRecords))s.trialRecords=sanitizedTrialRecords(raw.trialRecords);s.collectionMilestones=sanitizeMilestoneClaims(raw.collectionMilestones);if(Array.isArray(raw.recentFinds))s.recentFinds=sanitizeRecentFinds(raw.recentFinds);if(Array.isArray(raw.alchemyKnown))s.alchemyKnown=sanitizeAlchemyKnown(raw.alchemyKnown);if(Number.isInteger(raw.titleId)&&raw.titleId>=0&&raw.titleId<5)s.titleId=raw.titleId;if(raw.expedition)s.expedition=sanitizeExpedition(raw.expedition);return s}catch{return fresh()}}
let state=load();
// Adopt legacy cards without altering the original key or owned quantities.
// Existing 'shiny' booleans map to at least one Chromatique; new saves have
// exact quantities per finish and are restored without guessing.
try{
  const old=JSON.parse(localStorage.getItem(SAVE)||'null');
  state.finishCounts=restoreFinishCounts(state.owned,state.shiny,old?.finishCounts);
}catch{
  state.finishCounts=restoreFinishCounts(state.owned,state.shiny);
}
synchronizeFinishCounts(state);
state.trialStats=sanitizedTrialStats(state.trialStats);
state.trialRecords=sanitizedTrialRecords(state.trialRecords);
state.titleId=validEquippedTitle(state.titleId,state.trialStats,state.trialRecords);
state.expedition=sanitizeExpedition(state.expedition);
let boosterBusy=false;
function save(){synchronizeFinishCounts(state);try{localStorage.setItem(SAVE,JSON.stringify(state))}catch{notify('Sauvegarde indisponible dans ce navigateur.')}}
let toastTimer;
function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
function update(){if(state.goalId&&state.owned[state.goalId])state.goalId=null;save();$('#coins').textContent=state.coins.toLocaleString('fr-FR');$('#dust').textContent=state.dust.toLocaleString('fr-FR');$('#buy').disabled=state.coins<PACK_PRICE||boosterBusy;for(const control of $$('.booster-choice'))control.disabled=boosterBusy;$('#collection-progress').textContent=Object.keys(state.owned).length+' / '+CARDS.length;
$('#mobile-collection-progress').textContent=Object.keys(state.owned).length+' / '+CARDS.length+' obtenues';
  const chromaticTotal=Object.keys(state.shiny).length;
  $('#codex-card-count').textContent=Object.keys(state.owned).length+' / '+CARDS.length;
  $('#codex-chromatic-count').textContent=chromaticTotal+' / '+CARDS.length;
  $('#mobile-chromatic-count').textContent='✧ '+chromaticTotal+' / '+CARDS.length+' Chromatiques';
  for(const finish of FINISH_KEYS){
    const unique=finishUnique(state.finishCounts,finish,CARDS);
    const copies=finishTotal(state.finishCounts,finish,CARDS);
    const el=document.querySelector('#codex-'+finish+'-count');
    if(el)el.textContent=unique+' / '+CARDS.length+' · '+copies+' ex.';
    const mobile=document.querySelector('#mobile-'+finish+'-count');
    if(mobile)mobile.textContent=FINISHES[finish].symbol+' '+unique+' / '+CARDS.length;
  }
  renderAchievements();renderAtelier()}
function grant(value){state.coins+=value;state.earned+=value;state.wins++;update();notify('+'+value+' Couronnes remportées !')}
const MAIN_PAGES=['jouer','boosters','collection','atelier'];
const APP_PAGES=[...MAIN_PAGES,'succes','expeditions'];
let forgeSelectedId=null;
let forgeFilter='all';
let pendingCraftId=null;

function renderAtelier(){
  $('#atelier-dust').textContent=state.dust.toLocaleString('fr-FR');
  $('#atelier-collected').textContent=Object.keys(state.owned).length+' / '+CARDS.length;
  const duplicates=Object.values(state.owned).reduce((sum,n)=>sum+Math.max(0,n-1),0);
  $('#atelier-duplicates').textContent=duplicates.toLocaleString('fr-FR');

  // Keep a wanted card visible between sessions, even after a page reload.
  const goal=CARDS.find(card=>card.id===state.goalId&&!state.owned[card.id]&&getCraftCost(card)!==null);
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

  const missing=CARDS.filter(card=>!state.owned[card.id]&&getCraftCost(card)!==null);
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
    ?'Tu possèdes toutes les cartes disponibles en booster ou à la Forge. La Signature du dernier chapitre se mérite en aventure.'
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
      ?'Toutes les cartes accessibles à la Forge ont rejoint ton Codex. Les Chromatiques restent à découvrir en booster ; la Signature est une récompense d’aventure.'
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
  const card=CARDS.find(c=>c.id===cardId&&!state.owned[c.id]&&!c.signature);
  if(!card)return notify('Cette carte se trouve déjà dans ton Codex.');
  const cost=getCraftCost(card);
  if(cost===null)return notify('Cette carte est réservée à une aventure, elle ne peut pas être fabriquée.');
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
  state.recentFinds=recordRecentFind(state.recentFinds,card.id,'forge');
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
  if(page==='expeditions')renderExpedition();
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
{name:'Laboratoire arcanique',description:'Déduis deux ingrédients du nom de chaque potion et mémorise les mélanges réussis.',reward:60}
];
const mini=[];
definitions.forEach((d,i)=>{
  const card=el('article','game');
  const descriptionEl=el('p','trial-objective',trialObjective(i,state.difficulty));
  const rewardEl=el('div','reward','♛ +'+d.reward+' Couronnes');
  const masteryEl=el('div','trial-mastery');
  const recordsEl=el('details','trial-records');
  const recordsHeader=el('summary','trial-records-summary');
  recordsHeader.append(el('span','trial-records-symbol','✧'),
    el('span','trial-records-heading','Records'),
    el('span','trial-records-current'),
    el('span','trial-challenges-summary'));
  const recordsTable=el('table','trial-records-table');
  recordsTable.setAttribute('aria-label','Records personnels par difficulté');
  const recordsHead=el('thead');
  const headerRow=el('tr');
  for(const name of ['Mode','Victoires','Score',TRIAL_RECORD_METRICS[i].label]){
    headerRow.append(el('th','',name));
  }
  recordsHead.append(headerRow);
  recordsTable.append(recordsHead,el('tbody'));
  const challengePanel=el('section','trial-challenges');
  challengePanel.setAttribute('aria-label','Défis des Maîtres');
  challengePanel.append(el('strong','trial-challenges-heading','Défis des Maîtres'),
    el('div','trial-challenges-list'));
  recordsEl.append(recordsHeader,recordsTable,challengePanel);
  const status=el('div','status');status.setAttribute('aria-live','polite');
  const board=el('div','board'),actions=el('div','small-actions');
  card.append(el('h3','',String(i+1).padStart(2,'0')+' · '+d.name),
    descriptionEl,rewardEl,masteryEl,recordsEl,board,status,actions);
  $('#games').append(card);
  mini.push({card,board,status,actions,reward:d.reward,rewardEl,masteryEl,recordsEl,descriptionEl,mode:state.difficulty,ended:false});
});
function renderTrialMastery(){
  const stats=sanitizedTrialStats(state.trialStats);
  mini.forEach((g,index)=>{
    const entry=stats[index],level=masteryLevel(entry.wins);
    g.descriptionEl.textContent=trialObjective(index,g.mode);
    g.masteryEl.textContent='✧ '+level.title+(entry.wins?' · '+entry.wins+' victoire'+(entry.wins>1?'s':''):'');
    g.masteryEl.setAttribute('aria-label','Maîtrise de '+definitions[index].name+' : '+level.title+
      ', '+entry.wins+' victoires, meilleur score '+entry.bestScore+' sur 100');
    const record=sanitizedTrialRecords(state.trialRecords)[index];
    const current=record[g.mode];
    $('.trial-records-current',g.recordsEl).textContent=current.wins?
      current.bestScore+'/100':'—';
    const body=$('tbody',g.recordsEl);
    body.replaceChildren();
    TRIAL_RECORD_MODES.forEach(mode=>{
      const best=record[mode],row=el('tr',mode===g.mode?'is-current':'');
      const label=DIFFICULTIES.find(d=>d.id===mode).label;
      row.append(el('th','',label),
        el('td','',String(best.wins)),
        el('td','',best.bestScore===null?'—':best.bestScore+'/100'),
        el('td','',recordMetricLabel(index,best.bestMetric)));
      body.append(row);
    });
    const medals=trialChallengesFor(index,entry,record);
    const medalCount=medals.filter(item=>item.earned).length;
    $('.trial-challenges-summary',g.recordsEl).textContent='✦ '+medalCount+'/3';
    const challengeList=$('.trial-challenges-list',g.recordsEl);
    challengeList.replaceChildren();
    for(const medal of medals){
      const line=el('div','trial-challenge'+(medal.earned?' is-earned':''));
      line.dataset.grade=medal.id;
      line.setAttribute('aria-label',medal.name+' · '+medal.description+
        ' · '+(medal.earned?'obtenue':'à débloquer'));
      const sign=el('span','trial-challenge-medal',medal.earned?'✦':'◇');
      sign.setAttribute('aria-hidden','true');
      line.append(sign,el('strong','trial-challenge-name',medal.name),
        el('span','trial-challenge-goal',medal.description),
        el('span','trial-challenge-status',medal.earned?'✓':'—'));
      challengeList.append(line);
    }
    const metric=TRIAL_RECORD_METRICS[index];
    g.recordsEl.setAttribute('aria-label','Carnet des records de '+definitions[index].name+
      ' · '+metric.label+' · '+current.wins+' victoires dans la difficulté actuelle');
    const levelMode=DIFFICULTIES.find(d=>d.id===g.mode)||DIFFICULTIES[1];
    const high=trialReward(g.reward,g.mode,100);
    g.rewardEl.textContent='♛ '+g.reward+' Couronnes'+(high>g.reward?' · jusqu’à +'+(high-g.reward)+' bonus':'');
    g.rewardEl.title='Mode '+levelMode.label+' · récompense de base conservée';
  });
}
function complete(i,description,performance={}){
  const g=mini[i];if(g.ended)return;
  g.ended=true;
  const score=trialScore(i,performance);
  const earned=trialReward(g.reward,g.mode,score);
  state.trialStats=recordTrialWin(state.trialStats,i,g.mode,score);
  state.trialRecords=recordPersonalBest(state.trialRecords,i,g.mode,score,performance);
  const expeditionResult=state.expedition?.route?
    expeditionVictory(state.expedition,i,g.mode):{advanced:false};
  let finaleAward=null;
  if(expeditionResult.advanced){
    state.expedition=expeditionResult.state;
    if(expeditionResult.finished&&state.expedition.route==='dernier-accord'){
      finaleAward=awardFinaleCard(state,expeditionResult);
      if(finaleAward.normal)state.recentFinds=recordRecentFind(state.recentFinds,72,'new');
      if(finaleAward.chromatic)state.recentFinds=recordRecentFind(state.recentFinds,72,'chromatic');
    }
  }
  g.status.textContent='✓ '+description+' · '+score+'/100 · +'+earned+' Couronnes';
  grant(earned); // Persists the completed act and the Signature in the same save.
  if(finaleAward?.chromatic)notify('✧ Cœur des Marches Chromatique obtenu !');
  else if(finaleAward?.normal)notify('✦ Cœur des Marches rejoint ton Codex !');
  renderTrialMastery();
  if(expeditionResult.advanced){
    renderExpedition();
    // The victory belongs to the original mini-game; the player chooses
    // when to return to the story instead of losing the result screen.
    g.actions?.append(button('✧ Suite de l’expédition',()=>navigate('expeditions'),
      'secondary expedition-return'));
  }
}
const runeNames=['Soleil','Lune','Constellations','Œil','Spirale','Arbre','Rose des vents','Étoiles','Montagne','Vagues','Sablier','Flamme'];
let previousRuneRitual=null;
function startRunes(){
  const g=mini[0];
  g.ended=false;g.mode=state.difficulty;
  const ritual=nextRuneRitual(g.mode,previousRuneRitual);
  previousRuneRitual=ritual.id;
  const blind=g.mode==='maitrise';
  const maxErrors=trialRules(0,g.mode).maxErrors;
  g.card.classList.add('rune-trial');
  g.board.classList.add('rune-board');
  g.status.classList.add('rune-statusline');
  g.status.classList.remove('is-complete','is-failed');
  let step=0,next=runeExpectedAt(ritual,0),errors=0;
  let hud=g.card.querySelector('.rune-hud');
  if(!hud){
    hud=el('div','rune-hud');
    const left=el('div','rune-goal');
    left.append(el('span','', 'Rune suivante : '),el('strong','rune-target'));
    hud.append(left,el('span','rune-faults'));
    const meter=el('div','rune-meter');
    meter.setAttribute('aria-hidden','true');
    for(let index=0;index<12;index++)meter.append(el('span'));
    const banner=el('div','rune-ritual');
    banner.append(el('span','rune-ritual-glyph','✧'),
      el('div','rune-ritual-copy'));
    $('.rune-ritual-copy',banner).append(el('strong','rune-ritual-name'),
      el('span','rune-ritual-rule'));
    g.board.before(banner,hud,meter);
  }
  const ritualBanner=g.card.querySelector('.rune-ritual');
  $('.rune-ritual-name',ritualBanner).textContent=ritual.title;
  $('.rune-ritual-rule',ritualBanner).textContent=ritual.rule;
  const meter=g.card.querySelector('.rune-meter');
  const updateHud=()=>{
    $('.rune-target',hud).textContent=step===12?'12 / 12 ✓':
      blind?'Étape '+String(step+1).padStart(2,'0')+' / 12':
      String(next).padStart(2,'0')+' / 12';
    $('.rune-faults',hud).textContent='Erreurs : '+errors+' / '+maxErrors;
    [...meter.children].forEach((node,i)=>node.classList.toggle('filled',i<step));
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
        step++;
        next=runeExpectedAt(ritual,step);
        updateHud();
        if(step===12){
          g.status.classList.add('is-complete');
          complete(0,'Sceau restauré ! Les douze runes brillent de nouveau.',{errors});
        }else g.status.textContent=blind?
          'Rune '+value+' activée · poursuis le rituel.':
          'Rune '+value+' activée · cherche la '+next+'.';
      }else{
        errors++;
        b.classList.remove('wrong');
        void b.offsetWidth;
        b.classList.add('wrong');
        setTimeout(()=>b.classList.remove('wrong'),360);
        updateHud();
        if(errors>=maxErrors){
          g.ended=true;
          g.status.classList.add('is-failed');
          g.status.textContent='Le sceau s’est brisé. Relance une grille pour réessayer.';
        }else g.status.textContent=blind?
          'La rune ne répond pas · '+errors+'/'+maxErrors+' erreurs.':
          'Ce n’est pas la rune '+next+' · '+errors+'/'+maxErrors+' erreurs.';
      }
    });
    g.board.append(b);
  }
  updateHud();
  g.status.textContent=blind?
    'Observe la règle du rituel : le prochain numéro n’est pas indiqué en Maîtrise.':
    'Observe le rituel et suis l’ordre indiqué pour réveiller les pierres.';
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
let previousMemoryRitual=null;
function startMemory(){
  const g=mini[1];
  g.mode=state.difficulty;
  const maxMoves=trialRules(1,g.mode).maxMoves;
  const ritual=nextMemoryRitual(g.mode,previousMemoryRitual);
  previousMemoryRitual=ritual.id;
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
    const banner=el('div','memory-ritual');
    banner.append(el('span','memory-ritual-glyph','✦'));
    const copy=el('div','memory-ritual-copy');
    copy.append(el('strong','memory-ritual-title'),el('span','memory-ritual-rule'));
    banner.append(copy);
    const fresco=el('section','memory-fresco');
    fresco.setAttribute('aria-label','Fresque ancienne : 0 fragment sur 8 retrouvé');
    const frescoHeading=el('div','memory-fresco-header');
    frescoHeading.append(el('strong','memory-fresco-title','La Fresque oubliée'),
      el('span','memory-fresco-count','0 / 8 fragments'));
    const frescoGrid=el('div','memory-fresco-grid');
    frescoGrid.setAttribute('aria-hidden','true');
    for(let i=0;i<8;i++)frescoGrid.append(el('span','memory-fresco-piece'));
    fresco.append(frescoHeading,frescoGrid);
    g.board.before(banner,hud,meter,fresco);
  }
  $('.memory-ritual-title',g.card).textContent=ritual.title;
  $('.memory-ritual-rule',g.card).textContent=ritual.rule;
  const fresco=g.card.querySelector('.memory-fresco');
  const frescoPieces=Array.from(fresco.querySelectorAll('.memory-fresco-piece'));
  fresco.classList.remove('is-restored');
  frescoPieces.forEach(piece=>piece.classList.remove('is-revealed'));
  $('.memory-fresco-count',fresco).textContent='0 / 8 fragments';
  fresco.setAttribute('aria-label','Fresque ancienne : 0 fragment sur 8 retrouvé');
  const meter=g.card.querySelector('.memory-meter');
  const updateHud=()=>{
    $('.memory-pairs',hud).textContent=`${matches} / 8`;
    $('.memory-moves',hud).textContent=String(moves)+(maxMoves===null?'':' / '+maxMoves);
    $('.memory-faults',hud).textContent=`Erreurs : ${mistakes}`;
    [...meter.children].forEach((node,i)=>node.classList.toggle('filled',i<matches));
    frescoPieces.forEach((piece,i)=>piece.classList.toggle('is-revealed',i<matches));
    fresco.classList.toggle('is-restored',matches===8);
    $('.memory-fresco-count',fresco).textContent=matches===8?
      'Fresque restaurée · 8 / 8':matches+' / 8 fragments';
    fresco.setAttribute('aria-label','Fresque ancienne : '+matches+' fragment'+
      (matches>1?'s':'')+' sur 8 retrouvé'+(matches>1?'s':''));
  };

  const tiles=buildMemoryDeck(memoryRunes,ritual,shuffle);

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
          complete(1,'La Mémoire ancienne est restaurée ! Les huit paires scintillent de nouveau.',{moves,errors:mistakes});
        }
      }else{
        mistakes++;
        g.status.textContent='Les deux reliques ne résonnent pas ensemble.';
        g.card.querySelector('.memory-faults').textContent=`Erreurs : ${mistakes}`;
        const pair=[first,second];
        pair.forEach(tile=>tile.classList.add('is-wrong'));
        memoryTurnTimer=setTimeout(()=>{
          memoryTurnTimer=null;
          if(session!==memorySession||g.ended)return;
          pair.forEach(tile=>{tile.classList.remove('is-wrong');conceal(tile)});
          first=null;second=null;lock=false;
          g.status.textContent='Observe bien les symboles et retrouve leurs paires.';
        },560);
      }
      if(maxMoves!==null&&moves>=maxMoves&&!g.ended){
        g.ended=true;
        g.status.classList.add('is-failed');
        g.status.textContent='Limite de '+maxMoves+' coups atteinte. Lance une nouvelle table pour réessayer.';
      }
    });

    g.board.append(buttonTile);
  });

  updateHud();
  g.status.textContent='Retrouve les huit paires pour reconstituer la fresque.'+
    (maxMoves===null?'':' Objectif Maîtrise : '+maxMoves+' coups maximum.');
  g.actions.replaceChildren(button('✧ Nouvelle table',startMemory));
  if(ritual.previewMs){
    // The opening glimpse is non-interactive. Restart or difficulty changes
    // cancel its timeout and invalidate it by session ID.
    lock=true;
    g.board.classList.add('is-previewing');
    g.status.textContent='Souffle du passé : observe les seize symboles avant que le voile retombe.';
    memoryTurnTimer=setTimeout(()=>{
      memoryTurnTimer=null;
      if(session!==memorySession||g.ended)return;
      g.board.classList.remove('is-previewing');
      lock=false;
      g.status.textContent='Le voile est retombé. Retrouve les huit paires de mémoire.';
    },ritual.previewMs);
  }else g.board.classList.remove('is-previewing');
}

/* Serrure d'Éther — a three-crystal sum lock with authentic illustrated sprites. */
function startLock(){
  const g=mini[2];
  g.ended=false;g.mode=state.difficulty;
  g.card.classList.add('lock-trial');
  g.board.classList.add('ether-lock-board');
  g.status.classList.add('ether-lock-status');
  g.status.classList.remove('is-complete','is-failed');

  // Each public sum + rule uniquely identifies one possible trio.
  // Feedback is informative rather than an arbitrary trial-and-error trap.
  const puzzle=makeEtherPuzzle(g.mode);
  const target=puzzle.target;
  const numbers=puzzle.values;
  let selected=[],tries=0;
  const totalAttempts=trialRules(2,g.mode).maxAttempts;

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
    const briefing=el('div','ether-lock-rule');
    briefing.append(el('strong','ether-lock-rule-title','✧ Règle du sceau'),
      el('span','ether-lock-rule-text'));
    g.board.before(hud,briefing);
  }
  const dial=$('.ether-lock-dial',hud);
  dial.classList.remove('is-open','is-broken','is-warning');
  $('.ether-lock-rule-text',g.card).textContent=etherRule(puzzle);
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
    const result=evaluateEtherAttempt(puzzle,selected);
    if(!result)return;
    if(result.won){
      dial.classList.add('is-open');
      g.card.classList.add('lock-solved');
      g.status.classList.add('is-complete');
      validateButton.disabled=true;
      complete(2,'Serrure d’Éther ouverte ! Les trois cristaux sont alignés.',{attempts:tries});
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
      g.status.textContent=etherAttemptFeedback(puzzle,result)+
        ' Le mécanisme s’est figé. Relance une nouvelle serrure.';
    }else{
      dial.classList.remove('is-warning');
      void dial.offsetWidth;
      dial.classList.add('is-warning');
      g.status.textContent=etherAttemptFeedback(puzzle,result)+
        ' Encore '+(totalAttempts-tries)+' essai'+(totalAttempts-tries>1?'s':'')+'.';
    }
    updateHud();
  },'primary');
  g.actions.replaceChildren(validateButton,button('Nouveau mécanisme',()=>{g.card.classList.remove('lock-solved');startLock()}));
  g.card.classList.remove('lock-solved');
  updateHud();
  g.status.textContent=g.mode==='initiation'
    ?'Choisis trois cristaux pour atteindre la somme indiquée.'
    :'Trouve les trois cristaux qui satisfont la somme ET la règle du sceau.';
}

/* Fouilles interdites: three archaeological sites, always 25 tiles and five traps. */
let previousExcavationSite=null;
function startMines(){
  const g=mini[3];
  g.ended=false;g.mode=state.difficulty;
  const safeTarget=trialRules(3,g.mode).safeTarget;
  g.card.classList.add('excavation-trial');
  g.board.classList.add('excavation-board');
  g.status.classList.add('excavation-status');
  g.status.classList.remove('is-complete','is-failed');

  const site=makeExcavationSite(previousExcavationSite);
  previousExcavationSite=site.id;
  g.card.dataset.excavationSite=site.id;
  const bombs=site.bombs;
  const countNearby=i=>site.numbers[i];
  const dug=new Set();
  let safe=0,sondes=0;
  let guidedIndex=null;
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
    const sitePanel=el('div','excavation-site-panel');
    sitePanel.append(el('span','excavation-site-kicker','✧ CARNET DE FOUILLES'),
      el('strong','excavation-site-name'),
      el('p','excavation-site-description'),
      el('span','excavation-artifact-note'));
    g.board.before(sitePanel,hud,meter);
  }
  const sitePanel=$('.excavation-site-panel',g.card);
  $('.excavation-site-name',sitePanel).textContent=site.title;
  $('.excavation-site-description',sitePanel).textContent=site.description;
  const artifactNote=$('.excavation-artifact-note',sitePanel);
  artifactNote.textContent='◇ Vestige facultatif à découvrir · sans bonus de Couronnes';
  const relic=$('.excavation-relic',hud);
  relic.classList.remove('is-victorious','is-failed');
  const meter=g.card.querySelector('.excavation-meter');
  meter.replaceChildren(...Array.from({length:safeTarget},()=>el('span')));
  const updateHud=()=>{
    $('.excavation-counter',hud).textContent=safe+' / '+safeTarget+' cases sûres';
    $('.excavation-danger',hud).textContent=g.ended
      ?(safe===safeTarget?'Fouille accomplie':'Piège déclenché'):'5 pièges dissimulés';
    [...meter.children].forEach((node,index)=>node.classList.toggle('filled',index<safe));
  };

  g.board.replaceChildren();
  g.board.style.setProperty('--cols',5);
  g.board.setAttribute('role','group');
  g.board.setAttribute('aria-label','Site de fouilles : vingt-cinq dalles, cinq pièges dissimulés');
  const tiles=[];
  const clearGuide=()=>{
    if(guidedIndex===null)return;
    const old=tiles[guidedIndex];
    if(old&&!old.disabled){
      old.classList.remove('is-guided');
      old.setAttribute('aria-label','Fouiller la dalle '+(guidedIndex+1));
    }
    guidedIndex=null;
  };
  const markGuide=(hint)=>{
    clearGuide();
    if(!hint||g.ended)return;
    guidedIndex=hint.index;
    const tile=tiles[guidedIndex];
    tile.classList.add('is-guided');
    tile.setAttribute('aria-label','Dalle '+(guidedIndex+1)+' : passage sûr repéré par la sonde');
    g.status.textContent=hint.deduction
      ?'Les dalles déjà observées indiquent un passage sûr. Suis la lueur turquoise.'
      :'La sonde a repéré un passage sûr. Suis la lueur turquoise.';
  };
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
      clearGuide();
      dug.add(i);
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
        if(sondeButton)sondeButton.disabled=true;
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
      if(i===site.artifactIndex){
        tile.classList.add('is-artifact');
        const mark=el('span','excavation-artifact-mark','✧');
        mark.setAttribute('aria-hidden','true');
        tile.append(mark);
        artifactNote.textContent='✧ Vestige retrouvé : '+site.artifact;
        tile.setAttribute('aria-label',tile.getAttribute('aria-label')+' · vestige retrouvé');
      }
      safe++;
      updateHud();
      if(safe===safeTarget){
        relic.classList.add('is-victorious');
        g.status.classList.add('is-complete');
        tiles.forEach(b=>b.disabled=true);
        if(sondeButton)sondeButton.disabled=true;
        complete(3,'Fouille accomplie ! '+safeTarget+' dalles sûres ont été explorées.',{hints:sondes});
      }else g.status.textContent='Dalle '+(i+1)+' : '+(adjacent?adjacent+' piège(s) voisin(s).':'aucun piège adjacent.')+' Continue la fouille.';
    });
    g.board.append(tile);
    tiles.push(tile);
  }
  updateHud();
  let sondeButton=button('✧ Sonder un passage',()=>{
    if(g.ended)return;
    const hint=chooseExcavationGuide(site,dug);
    if(hint){sondes++;markGuide(hint)}
    else g.status.textContent='Tous les passages sûrs ont été explorés.';
  });
  g.actions.replaceChildren(sondeButton,button('✧ Nouvelle fouille',startMines));
  markGuide({index:site.entrance,deduction:false});
}

const ingredients=[['☘','Mousse'],['☀','Soleil'],['◈','Cristal'],['☾','Lune'],['✿','Fleur'],['❄','Givre']];
const recipes=[
['Élixir de Vie',[0,4]],['Sérum solaire',[1,2]],['Souffle lunaire',[3,5]],['Sève d’Aurore',[0,1]],['Nectar cristallin',[2,4]],
['Rosée de Cristal',[0,2]],['Floraison Solaire',[1,4]],['Givre de Verre',[2,5]],['Brume des Racines',[0,3]],['Braise d’Hiver',[1,5]],['Éclipse Florale',[3,4]],['Pétales de Givre',[4,5]],
['Couronne des Trois Saisons',[0,1,5]],['Essence du Verre',[0,2,5]],['Sceau de l’Équinoxe',[1,3,4]],['Sève des Constellations',[0,1,2]],['Prisme du Crépuscule',[2,3,4]],['Aube des Ronces',[0,3,5]],['Couronne du Solstice',[1,4,5]],['Rituel des Trois Astres',[1,2,3]]
];
/* Laboratoire arcanique: three recipes, two ingredients each, three mistakes maximum.
   HD sprites are presentation only; the five original recipes and reward are retained. */
let alchemySession=0;
let alchemyTimer=null;
function startAlchemy(){
  const g=mini[4];
  g.mode=state.difficulty;
  const maxErrors=trialRules(4,g.mode).maxErrors;
  const session=++alchemySession;
  if(alchemyTimer!==null){clearTimeout(alchemyTimer);alchemyTimer=null}
  g.ended=false;
  g.card.classList.add('alchemy-trial');
  g.board.classList.add('alchemy-board');
  g.status.classList.add('alchemy-status');
  g.status.classList.remove('is-complete','is-failed');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const requiredIngredients=g.mode==='maitrise'?3:2;
  const selectedRecipes=shuffle(recipes.filter(recipe=>recipe[1].length===requiredIngredients)).slice(0,3);
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
      el('div','alchemy-counters'),
      el('div','alchemy-slots')
    );
    const counters=$('.alchemy-counters',panel);
    counters.append(el('span','alchemy-round'),el('span','alchemy-errors'));
    const slots=$('.alchemy-slots',panel);
    slots.setAttribute('aria-label','Emplacements pour les ingrédients sélectionnés');
    for(let i=0;i<3;i++)slots.append(el('span','alchemy-slot','◇'));
    hud.append(cauldron,panel);
    const meter=el('div','alchemy-meter');
    meter.setAttribute('aria-hidden','true');
    for(let i=0;i<3;i++)meter.append(el('span'));
    const hint=el('div','alchemy-ritual');
    hint.append(el('span','alchemy-ritual-icon','✧'));
    const hintCopy=el('div','alchemy-ritual-copy');
    hintCopy.append(el('strong','alchemy-ritual-title'),el('span','alchemy-ritual-clue'));
    hint.append(hintCopy);
    const family=el('p','alchemy-family-legend',
      'Essences : Végétales — Mousse, Fleur · Astrales — Soleil, Lune · Minérales — Cristal, Givre');
    g.board.before(hud,meter,hint,family);
  }
  let grimoire=g.card.querySelector('.alchemy-grimoire');
  if(!grimoire){
    grimoire=el('details','alchemy-grimoire');
    const head=el('summary','alchemy-grimoire-head');
    head.append(el('span','alchemy-grimoire-symbol','✦'));
    const headText=el('span','alchemy-grimoire-heading');
    headText.append(el('strong','', 'Le Grimoire retrouvé'),el('small','alchemy-grimoire-count'));
    head.append(headText);
    grimoire.append(head,el('div','alchemy-grimoire-list'));
    g.actions.before(grimoire);
  }
  const renderGrimoire=()=>{
    const known=state.alchemyKnown||[];
    $('.alchemy-grimoire-count',grimoire).textContent=known.length+' / '+recipes.length+' formules retrouvées';
    const list=$('.alchemy-grimoire-list',grimoire);
    list.replaceChildren();
    recipes.forEach((recipe,index)=>{
      const advanced=recipe[1].length===3;
      if(index===0||index===12){
        list.append(el('div','alchemy-grimoire-section',
          advanced?'✦ FORMULES DU GRAND ŒUVRE · MAÎTRISE':'✧ FORMULES DES ARCHIVES · INITIATION ET AVENTURE'));
      }
      const discovered=known.includes(index);
      const entry=el('div','alchemy-grimoire-entry'+(discovered?' is-known':'')+(advanced?' is-advanced':''));
      const title=el('strong','alchemy-grimoire-recipe',
        discovered?'✧ '+recipe[0]:(advanced?'◇ Grand Œuvre scellé '+(index-11):'◇ Formule scellée '+(index+1)));
      const detail=el('span','alchemy-grimoire-detail',
        discovered?recipe[1].map(i=>ingredients[i][1]).join(' + '):
          (advanced?'Une alchimie à trois essences reste à découvrir.':'Réussis cette potion pour en conserver la formule.'));
      entry.append(title,detail);
      list.append(entry);
    });
  };
  renderGrimoire();
  const cauldron=$('.alchemy-cauldron',hud);
  const meter=g.card.querySelector('.alchemy-meter');
  const slots=$$('.alchemy-slot',hud);
  slots.forEach((slot,index)=>slot.hidden=index>=requiredIngredients);
  $('.alchemy-slots',hud).style.setProperty('--alchemy-slot-count',requiredIngredients);
  const ingredientNames=ingredients.map(item=>item[1]);
  const symbols=['Mousse','Soleil','Cristal','Lune','Fleur','Givre'];
  const ingredientButtons=[];
  let mixButton;

  const updateHud=()=>{
    const [name]=selectedRecipes[Math.min(round,2)];
    $('.alchemy-name',hud).textContent=name;
    $('.alchemy-round',hud).textContent='Potion '+Math.min(round+1,3)+' / 3';
    $('.alchemy-errors',hud).textContent='Erreurs '+errors+' / '+maxErrors;
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
    if(mixButton)mixButton.disabled=g.ended||busy||selected.length!==requiredIngredients;
  };

  g.board.replaceChildren();
  g.board.setAttribute('role','group');
  g.board.setAttribute('aria-label','Six ingrédients magiques : choisis deux ingrédients pour chaque potion');
  g.board.style.setProperty('--cols',3);
  for(let i=0;i<ingredients.length;i++){
    const tile=el('button','tile alchemy-ingredient');
    tile.type='button';
    tile.setAttribute('aria-label','Sélectionner '+ingredientNames[i]+', sceau '+(i+1)+', essence '+ALCHEMY_ESSENCES[i]);
    tile.setAttribute('title',ingredientNames[i]+' · Sceau '+(i+1)+' · Essence '+ALCHEMY_ESSENCES[i]);
    tile.setAttribute('aria-pressed','false');
    tile.style.setProperty('--alchemy-x',((i%3)/2*100)+'%');
    tile.style.setProperty('--alchemy-y',(Math.floor(i/3)/2*100)+'%');
    const artwork=el('span','alchemy-art');
    artwork.setAttribute('aria-hidden','true');
    tile.append(artwork,el('span','alchemy-ingredient-name',symbols[i]),
      el('span','alchemy-seal-number',String(i+1)));
    tile.addEventListener('click',()=>{
      if(g.ended||busy)return;
      const prior=selected.indexOf(i);
      if(prior!==-1)selected.splice(prior,1);
      else if(selected.length<requiredIngredients)selected.push(i);
      else{
        g.status.textContent=requiredIngredients+' ingrédients maximum : retire une sélection pour la remplacer.';
        return;
      }
      updateHud();
      g.status.textContent=selected.length===requiredIngredients
        ?'Les essences sont prêtes : active le chaudron.'
        :'Sélectionne '+(requiredIngredients-selected.length)+' essence'+
          (requiredIngredients-selected.length>1?'s':'')+' supplémentaire'+
          (requiredIngredients-selected.length>1?'s':'')+'.';
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
    const clue=alchemyClue(g.mode,selectedRecipes[round],round+session);
    $('.alchemy-ritual-title',g.card).textContent=clue.title+' · '+ALCHEMY_MODES[clue.mode].title;
    $('.alchemy-ritual-clue',g.card).textContent=clue.detail;
    g.status.textContent=g.mode==='maitrise'?
      'Le Grand Œuvre exige trois essences : recoupe les indices pour trouver la seule combinaison juste.':
      'Déduis deux ingrédients grâce aux indices du sceau et conserve les formules dans ton grimoire.';
  };
  const mix=()=>{
    if(g.ended||busy||selected.length!==requiredIngredients)return;
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
        const knownId=recipeIndex(recipes,name);
        const remembered=rememberAlchemyRecipe(state.alchemyKnown,knownId);
        if(remembered.length>state.alchemyKnown.length){
          state.alchemyKnown=remembered;
          save(); // Preserve discoveries immediately, even if this trial later fails.
          renderGrimoire();
        }
        round++;
        cauldron.classList.add('is-success');
        updateHud();
        if(round===3){
          g.status.classList.add('is-complete');
          ingredientButtons.forEach(button=>button.disabled=true);
          complete(4,'Alchimie maîtrisée ! Trois potions créées dans les Archives.',{errors});
          if(mixButton)mixButton.disabled=true;
          return;
        }
        g.status.textContent='✓ '+name+' réussie ! Retiens ce mélange pour la prochaine fois…';
      }else{
        errors++;
        cauldron.classList.add('is-error');
        updateHud();
        if(errors===maxErrors){
          g.ended=true;
          g.status.classList.add('is-failed');
          ingredientButtons.forEach(button=>button.disabled=true);
          g.status.textContent='Mélange instable : le laboratoire est scellé. Recommence une nouvelle session.';
          if(mixButton)mixButton.disabled=true;
          return;
        }
        g.status.textContent='Mélange instable : il reste '+(maxErrors-errors)+' erreur'+(maxErrors-errors>1?'s':'')+' possible'+(maxErrors-errors>1?'s':'')+'.';
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

const trialStarters=[startRunes,startMemory,startLock,startMines,startAlchemy];
trialStarters.forEach(fn=>fn());
renderTrialMastery();
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
  if(mini[index].mode!==state.difficulty){trialStarters[index]();renderTrialMastery();}
  selectedGame=index;
  mini.forEach((item,i)=>item.card.classList.toggle('mobile-active',i===index));
  $$('.game-choice',picker).forEach((b,i)=>{
    b.classList.toggle('active',i===index);
    b.setAttribute('aria-pressed',String(i===index));
  });
}
selectGame(0);
const difficultyButtons=$$('#difficulty-options [data-difficulty]');
function renderDifficultyChoice(){
  for(const control of difficultyButtons){
    const active=control.dataset.difficulty===state.difficulty;
    control.classList.toggle('is-active',active);
    control.setAttribute('aria-pressed',String(active));
  }
  const mode=DIFFICULTIES.find(d=>d.id===state.difficulty);
  $('#difficulty-hint').textContent=mode.description;
}
difficultyButtons.forEach(control=>control.addEventListener('click',()=>{
  const next=validDifficulty(control.dataset.difficulty);
  if(next===state.difficulty)return;
  state.difficulty=next;
  trialStarters[selectedGame]();
  renderDifficultyChoice();
  renderTrialMastery();
  save();
  notify('Mode '+DIFFICULTIES.find(d=>d.id===next).label+' · épreuve relancée.');
}));
renderDifficultyChoice();
function renderExpedition(){
  const view=expeditionSummary(state.expedition);
  const portalText=$('#expedition-shortcut-progress');
  portalText.textContent=view.route&&!view.complete?
    view.route.name+' · étape '+(view.current.step+1)+'/'+view.route.stages.length:
    view.discovered?view.discovered+'/'+view.total+' fragments découverts':
    EXPEDITION_ROUTES.length+' chemins à découvrir';
  $('#expedition-counter').textContent=view.discovered+'/'+view.total+' fragments';
  const host=$('#expedition-content');
  host.replaceChildren();
  const lead=el('div','expedition-lead');
  const leadText=el('div','expedition-lead-text');
  const isRevers=view.route?.id==='traversee-reflets';
  const isFinale=view.route?.id===FINALE_ID;
  leadText.append(el('span','expedition-kicker',!view.route?'LES EXPÉDITIONS · MARCHES DE VERRE':
    isFinale?'FINALE · AU-DELÀ DU VERRE':
    isRevers?'CHAPITRE II · LES REFLETS BRISÉS':'CHAPITRE I · LE SEUIL DES VERRIERS'),
    el('h3','expedition-title',!view.route?'Les Chemins des Marches':
      isFinale?'Le Dernier Accord':isRevers?'Le Passage du Revers':'Le Seuil des Verriers'));
  lead.append(leadText);
  host.append(lead);
  const startRoute=routeId=>{
    const isNewFinale=routeId===FINALE_ID&&!view.current.completedRoutes.includes(FINALE_ID);
    const isMasteryReprise=routeId===FINALE_ID&&!isNewFinale&&!state.shiny?.[72];
    const mode=isMasteryReprise?'maitrise':
      isNewFinale&&state.difficulty==='maitrise'?'aventure':state.difficulty;
    state.expedition=startExpedition(state.expedition,routeId,mode);
    save();
    renderExpedition();
  };
  const chooser=heading=>{
    if(heading)host.append(el('p','expedition-description',heading));
    const choices=el('div','expedition-choices');
    EXPEDITION_ROUTES.forEach(route=>{
      const done=view.current.completedRoutes.includes(route.id);
      const locked=route.id===FINALE_ID&&!canStartFinale(view.current);
      const pick=button('',()=>{if(!locked)startRoute(route.id)},
        'expedition-choice'+(done?' is-discovered':'')+
        (route.id==='traversee-reflets'?' is-reflets':'')+
        (route.id===FINALE_ID?' is-finale':''));
      pick.disabled=locked;
      pick.append(el('span','expedition-choice-symbol',route.symbol));
      const copy=el('span','expedition-choice-copy');
      let hint=route.hint;
      if(route.id===FINALE_ID){
        const have=FINALE_PREREQUISITES.filter(id=>view.current.completedRoutes.includes(id)).length;
        hint=locked?'Scellé · '+have+'/3 expéditions achevées':
          done&&!state.shiny?.[72]?'✧ Rejouer en Maîtrise pour la Chromatique':
          done?'La Signature est acquise · chapitre rejouable':'Le Cœur des Marches t’attend';
      }
      copy.append(el('strong','',route.name),el('small','',hint));
      pick.append(copy,el('span','expedition-choice-status',locked?'🔒':done?'✓':'›'));
      pick.setAttribute('aria-label',route.name+', '+hint+(done?', parcours déjà découvert':''));
      choices.append(pick);
    });
    host.append(choices);
  };
  if(!view.route){
    chooser('Les trois premiers chemins conduisent à la Convergence. Termine les expéditions des Verriers, des Veilleurs et du Revers pour ouvrir Le Dernier Accord.');
    return;
  }
  if(view.complete){
    host.append(el('p','expedition-chapter',view.route.symbol+' '+view.route.name+' · parcours achevé'),
      el('h4','expedition-fragment','✦ '+view.route.fragment),
      el('p','expedition-description',view.route.ending));
    if(isFinale){
      const vow=FINALE_VOWS.find(item=>item.id===view.current.choice);
      if(vow)host.append(el('p','expedition-after',vow.ending));
      if(state.owned?.[72]){
        const reward=el('div','expedition-finale-reward');
        const art=el('img','expedition-finale-art');
        applyCardIllustration(art,CARDS[71],{shiny:!!state.shiny?.[72],size:'thumbnail'});
        art.alt='Cœur des Marches'+(state.shiny?.[72]?' Chromatique':'');
        const text=el('div','expedition-finale-copy');
        text.append(el('small','expedition-finale-eyebrow','✦ RÉCOMPENSE UNIQUE · ARCHIVE 072'),
          el('h4','',state.shiny?.[72]?'Cœur des Marches · Chromatique':'Cœur des Marches'),
          el('p','expedition-description',state.shiny?.[72]
            ?'Le serment a traversé le rite de Maîtrise. La Signature Chromatique est désormais gravée dans ton Codex.'
            :'La Signature a rejoint ton Codex. Reviens en difficulté Maîtrise pour éveiller sa version Chromatique.'));
        const see=button('Voir la Signature dans le Codex',()=>{
          activeSeason='marches-de-verre';
          activeCollection='au-dela-du-verre';
          navigate('collection');
          inspect(CARDS[71],!!state.shiny?.[72]);
        },'secondary expedition-finale-link');
        text.append(see);
        reward.append(art,text);
        host.append(reward);
      }
    }
    chooser(isFinale?'Le chemin reste ouvert. Tu peux rejouer l’aventure ou explorer les autres routes.':
      'Choisis un autre itinéraire, ou repars sur celui-ci.');
    return;
  }
  const stage=view.stage,mode=DIFFICULTIES.find(d=>d.id===view.current.mode).label;
  host.append(el('p','expedition-chapter',view.route.symbol+' '+view.route.name+
    ' · '+mode+' · étape '+(view.current.step+1)+'/'+view.route.stages.length));
  const progress=el('div','expedition-progress');
  progress.setAttribute('role','list');
  view.route.stages.forEach((item,index)=>{
    const label=el('span','expedition-progress-step'+
      (index<view.current.step?' is-done':index===view.current.step?' is-now':''),
      index<view.current.step?'✓':String(index+1));
    label.setAttribute('role','listitem');
    label.setAttribute('aria-label',item.title+(index<view.current.step?' terminée':
      index===view.current.step?' en cours':' à venir'));
    progress.append(label);
  });
  host.append(progress);
  if(view.current.step===0){
    host.append(el('p','expedition-description',view.route.prologue));
  }else{
    host.append(el('p','expedition-after',view.route.stages[view.current.step-1].after));
  }
  host.append(el('h4','expedition-stage-title',stage.title),
    el('p','expedition-description',stage.text));
  if(isFinale&&view.current.step===3){
    host.append(el('p','expedition-description',
      'Néméria t’écoute. Il n’existe pas de mauvaise réponse : ce choix façonnera l’épilogue, sans modifier la récompense.'));
    const vows=el('div','expedition-final-vows');
    for(const vow of FINALE_VOWS){
      const active=view.current.choice===vow.id;
      const pick=button('',()=>{
        state.expedition=chooseFinaleVow(state.expedition,vow.id);
        save();
        renderExpedition();
      },'expedition-vow'+(active?' is-selected':''));
      pick.setAttribute('aria-pressed',String(active));
      pick.append(el('strong','',vow.name),el('small','',vow.text));
      vows.append(pick);
    }
    host.append(vows);
  }
  const controls=el('div','expedition-actions');
  const play=button(view.current.armed?'↻ Rejouer l’étape':'✧ Rejoindre l’épreuve',()=>{
    // The route remembers its starting difficulty; an easier win cannot skip a stage.
    if(state.difficulty!==view.current.mode){
      state.difficulty=view.current.mode;
      renderDifficultyChoice();
    }
    state.expedition=armExpedition(state.expedition);
    if(!state.expedition.armed)return;
    save();
    trialStarters[stage.game]();
    selectGame(stage.game);
    renderTrialMastery();
    renderExpedition();
    navigate('jouer');
    const target=mini[stage.game].card;
    target.scrollIntoView({behavior:'smooth',block:'start'});
    target.querySelector('button:not([disabled])')?.focus({preventScroll:true});
  },'primary expedition-continue');
  play.disabled=isFinale&&view.current.step===3&&!view.current.choice;
  controls.append(play,button('Quitter le parcours',()=>{
    state.expedition=abandonExpedition(state.expedition);
    save();
    renderExpedition();
  },'secondary expedition-leave'));
  host.append(controls);
}
function makeCard(c,isShiny=false,locked=false){
  const finish=typeof isShiny==='string'?isShiny:(isShiny?'chromatic':'normal');
  const chromatic=finish==='chromatic'&&!locked;
  const holographic=finish==='holographic'&&!locked;
  const calligraphic=finish==='calligraphic'&&!locked;
  const preview=locked&&(c.id===1||(previewArt&&hasApprovedArt(c.id)));
  const reallyLocked=locked&&!preview;
  const b=el('button','card'+(reallyLocked?' is-sealed':'')+(chromatic?' is-chromatic':'')+
    (holographic?' is-holographic':'')+(calligraphic?' is-calligraphic':''));
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
    }else if(holographic||calligraphic){
      const art=el('span','finish-art-window');
      art.append(img);b.append(art);
    }else b.append(img);
  }
  const meta=el('div','info');
  meta.append(el('div','name',reallyLocked?(c.signature?'Signature scellée':'Archive scellée'):c.name),
    el('div','meta',reallyLocked?'À découvrir · '+RARITIES[c.rarity].label:RARITIES[c.rarity].label+' · '+c.type));
  b.append(meta);
  if(!locked&&finishQuantity(state.finishCounts,finish,c.id))
    b.append(el('span','amount','×'+finishQuantity(state.finishCounts,finish,c.id)));
  if(chromatic)b.append(el('span','shine chromatic-seal','✧ CHROMATIQUE'));
  if(holographic)b.append(el('span','shine holographic-seal','◈ HOLOGRAPHIQUE'));
  if(calligraphic)b.append(el('span','shine calligraphic-seal','✒ CALLIGRAPHIQUE'));
  if(preview){
    b.append(el('span','shine','APERÇU'));
    b.setAttribute('aria-label','Voir l’illustration de '+c.name+' sans posséder cette carte');
  }else if(reallyLocked){
    b.setAttribute('aria-label','Archive '+String(c.id).padStart(3,'0')+', non découverte : ouvrir la fiche scellée');
  }else if(chromatic){
    b.setAttribute('aria-label',c.name+' — version Chromatique, '+RARITIES[c.rarity].label);
  }else if(holographic||calligraphic){
    b.setAttribute('aria-label',c.name+' — version '+FINISHES[finish].label+', '+RARITIES[c.rarity].label);
  }
  b.addEventListener('click',()=>{
    if($('#page-boosters').classList.contains('active')){
      const chapter=collectionForCard(c);
      if(chapter){activeSeason=chapter.season.id;activeCollection=chapter.collection.id;}
      navigate('collection');
    }
    if(reallyLocked)inspectSealed(c);
    else inspect(c,chromatic,true,false,finish);
  });
  return b;
}
let filterType='all',filterRarity='all',filterFinish='all',selectedCard=null,previewArt=false;
let activeSeason=SEASONS[0].id,activeCollection=SEASONS[0].collections[0].id;
let discoveryFilter='all',codexVisibleCards=[];
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
  else{
    const finish=FINISHES[filterFinish]?filterFinish:preferredFinish(state.finishCounts,card.id);
    inspect(card,finish==='chromatic',false,finish==='chromatic'&&!state.shiny[card.id],finish);
  }
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
  const location=collectionForCard(c);
  const collectionLabel=location?'Saison '+location.season.number+' · '+location.collection.title:'Les Archives';
  const copy=el('div','inspector-copy');
  copy.append(
    el('p','kicker','ARCHIVE '+String(c.id).padStart(3,'0')+' · '+RARITIES[c.rarity].label),
    el('h2','','Archive non découverte'),
    el('p','codex-inspector-chapter',collectionLabel),
    el('p','muted',c.signature
      ?'Le Cœur des Marches est une Signature unique. Elle ne peut être obtenue ni dans les boosters ni à la Forge ; son déblocage sera lié à l’aventure finale.'
      :'Cette page est encore scellée. Découvre cette carte dans les boosters ou façonne-la dans l’Atelier.'),
    ...(c.signature
      ?[button('Voir les expéditions',()=>navigate('expeditions'),'secondary')]
      :[button('Ouvrir des boosters',()=>navigate('boosters'),'secondary'),button('Explorer l’Atelier',()=>navigate('atelier'),'secondary')]));
  addCodexNavigation(copy,c);
  panel.append(seal,copy);
  markCodexSelected(c.id);
  if(scroll){
    if(mobileView.matches)openSheet('inspector');
    else if(matchMedia('(max-width:1050px)').matches)panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}
function inspect(c,shiny=false,scroll=true,chromaticPreview=false,finishOverride=null){
  // Legacy shiny flags remain mirrored; actual quantities live in finishCounts.
  const ownedChromatic=!!state.shiny[c.id];
  const previewChromatic=!!shiny&&!ownedChromatic&&!!chromaticPreview;
  const chromatic=!!shiny&&(ownedChromatic||previewChromatic);
  selectedCard={id:c.id,shiny:chromatic,preview:previewChromatic};
  const activeFinish=FINISHES[finishOverride]?finishOverride:(chromatic?'chromatic':'normal');
  const ownedActive=finishQuantity(state.finishCounts,activeFinish,c.id)>0;
  const previewFinish=!ownedActive;
  selectedCard.finish=activeFinish;
  selectedCard.preview=previewFinish;
  const panel=$('#inspector');
  panel.replaceChildren();
  panel.classList.toggle('is-chromatic',activeFinish==='chromatic');
  panel.classList.toggle('is-holographic',activeFinish==='holographic');
  panel.classList.toggle('is-calligraphic',activeFinish==='calligraphic');
  panel.style.setProperty('--edge',RARITIES[c.rarity].color);
  const img=el('img');
  applyCardIllustration(img,c,{shiny:chromatic,size:'full'});
  img.alt='Illustration de '+c.name+(chromatic?', version Chromatique':'');
  const artwork=el('div','inspector-art-shell'+(chromatic?' is-chromatic':'')+
    (activeFinish==='holographic'?' is-holographic':'')+
    (activeFinish==='calligraphic'?' is-calligraphic':''));
  artwork.append(img);
  if(chromatic){
    artwork.append(el('span','inspector-chromatic-seal','✧ CHROMATIQUE'));
    if(previewChromatic)artwork.append(el('span','inspector-chromatic-preview','APERÇU · NON POSSÉDÉ'));
  }
  if(activeFinish==='holographic')enableHolographicInspection(artwork);
  const kicker=el('p','kicker','ARCHIVE '+String(c.id).padStart(3,'0')+' · '+RARITIES[c.rarity].label);
  const title=el('h2','',c.name);
  const location=collectionForCard(c);
  const chapterLabel=el('p','codex-inspector-chapter',location?'Saison '+location.season.number+' · '+location.collection.title:'Les Archives');
  const desc=el('p','','« '+c.lore+' »');
  const stats=el('div','stats');
  stats.append(el('span','','⚔ '+c.attack),el('span','','♥ '+c.health),el('span','','×'+(state.owned[c.id]||0)));
  const copy=el('div','inspector-copy');
  copy.append(kicker,title,chapterLabel,el('p','muted',c.type+
    ' · '+FINISHES[activeFinish].symbol+' Version '+FINISHES[activeFinish].label+
    (previewFinish?' · Aperçu non possédé':'')),desc,stats);
  const ledger=el('div','variant-ledger');
  ledger.setAttribute('aria-label','Quantités possédées par finition');
  for(const finish of FINISH_KEYS){
    const entry=el('span','');
    entry.append(el('strong','',FINISHES[finish].symbol+' '+FINISHES[finish].label+': '),
      document.createTextNode('×'+finishQuantity(state.finishCounts,finish,c.id)));
    ledger.append(entry);
  }
  copy.append(ledger);
  if(ownedChromatic){
    copy.append(button(chromatic?'Voir la version normale':'Voir la version Chromatique',
      ()=>inspect(c,!chromatic,false),'secondary chromatic-toggle'));
  }else if(state.owned[c.id]||previewArt||c.id===1){
    const toggle=button(chromatic?'Voir la version normale':'✧ Prévisualiser en Chromatique',
      ()=>inspect(c,!chromatic,false,!chromatic),'secondary chromatic-toggle');
    toggle.setAttribute('aria-label',chromatic?'Revenir à la carte normale':'Voir une simulation Chromatique sans débloquer cette carte');
    copy.append(toggle);
    if(!chromatic)copy.append(el('p','chromatic-inspector-hint',
      'Tu ne possèdes pas cette variante : aperçu visuel sans déblocage.'));
  }
  const picker=el('div','finish-picker');
  picker.setAttribute('role','group');
  picker.setAttribute('aria-label','Choisir une finition de cette carte');
  for(const finish of FINISH_KEYS){
    const quantity=finishQuantity(state.finishCounts,finish,c.id);
    const selected=activeFinish===finish;
    const selector=button(FINISHES[finish].symbol+' '+FINISHES[finish].label,
      ()=>inspect(c,finish==='chromatic',false,finish==='chromatic'&&!quantity,finish),
      'secondary finish-choice');
    selector.setAttribute('aria-pressed',String(selected));
    selector.append(el('span','finish-state',quantity?'Possédée · ×'+quantity:'Aperçu · non possédée'));
    picker.append(selector);
  }
  copy.append(picker);
  addCodexNavigation(copy,c);
  panel.append(artwork,copy);
  markCodexSelected(c.id);
  if(scroll){
    if(mobileView.matches)openSheet('inspector');
    else if(matchMedia('(max-width:1050px)').matches)panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}
function renderCodexSeasons(){
  const seasons=$('#codex-season-list');
  if(!seasons.childElementCount){
    for(const season of SEASONS){
      const control=button('',()=>{
        if(activeSeason===season.id)return;
        closeSheets(false);
        activeSeason=season.id;
        activeCollection=season.collections[0].id;
        selectedCard=null;
        renderCollection();
      },'codex-season');
      control.dataset.season=season.id;
      control.append(el('span','codex-season-number','SAISON '+String(season.number).padStart(2,'0')),
        el('strong','codex-season-name',season.title),
        el('span','codex-season-state'));
      seasons.append(control);
    }
  }
  for(const control of $$('.codex-season',seasons)){
    const season=seasonById(control.dataset.season);
    const progress=seasonProgress(CARDS,state.owned,state.shiny,season.id);
    const active=season.id===activeSeason;
    control.classList.toggle('is-active',active);
    control.setAttribute('aria-pressed',String(active));
    control.setAttribute('aria-label','Saison '+season.number+' : '+season.title+
      ', '+progress.released+' cartes publiées sur '+progress.planned);
    $('.codex-season-state',control).textContent=
      progress.released?progress.collectionsReleased+' / '+progress.collectionsPlanned+' collections disponibles':'À venir';
  }
  const season=seasonById(activeSeason);
  const progress=seasonProgress(CARDS,state.owned,state.shiny,activeSeason);
  $('#codex-season-title').textContent='Saison '+season.number+' — '+season.title;
  $('#codex-season-description').textContent=season.subtitle;
  $('#codex-season-publication').textContent=progress.released+' / '+progress.planned+' cartes publiées';
  $('#codex-season-published-fill').style.width=progress.percentReleased+'%';
  $('#codex-season-published-track').setAttribute('aria-valuenow',String(progress.released));
  $('#codex-season-published-track').setAttribute('aria-valuemax',String(progress.planned));
  $('#codex-season-discovered').textContent=progress.discovered+' cartes obtenues';
  $('.collection-edition').textContent='✧ Saison '+season.number+' · '+season.title;

  const partHolder=$('#codex-collection-list');
  partHolder.replaceChildren();
  for(const part of season.collections){
    const active=part.id===activeCollection;
    const partCards=cardsForCollection(CARDS,season.id,part.id);
    const stats=codexProgress(partCards,state.owned,state.shiny);
    const tile=button('',()=>{
      if(activeCollection===part.id)return;
      closeSheets(false);
      activeCollection=part.id;
      selectedCard=null;
      renderCollection();
    },'codex-chapter'+(active?' is-active':'')+(part.released&&stats.total===stats.discovered?' is-complete':'')+(part.released?'':' is-upcoming'));
    tile.dataset.collection=part.id;
    tile.setAttribute('aria-pressed',String(active));
    tile.setAttribute('aria-label','Partie '+part.number+' : '+part.title+
      (part.released?', '+stats.discovered+' cartes obtenues sur '+stats.total:', à venir'));
    const eyebrow=el('span','codex-chapter-eyebrow','✦ PARTIE '+part.number);
    const title=el('span','codex-chapter-name',part.title);
    const count=el('span','codex-chapter-count',
      part.released?stats.discovered+' / '+part.plannedCards+' · ✧ '+stats.chromatic:'À venir · '+part.plannedCards+' cartes');
    tile.append(eyebrow,title,count);
    if(part.signature)tile.append(el('span','codex-part-signature','✧ Carte Signature'));
    if(part.released){
      const track=el('span','codex-chapter-track');
      track.setAttribute('aria-hidden','true');
      const fill=el('span');fill.style.width=stats.percent+'%';
      track.append(fill);tile.append(track);
    }
    partHolder.append(tile);
  }
  const collection=collectionById(activeSeason,activeCollection);
  $('#codex-chapter-title').textContent='Partie '+collection.number+' · '+collection.title;
  $('#codex-chapter-subtitle').textContent=collection.subtitle+(collection.id==='au-dela-du-verre'?' · 23 cartes en booster, une Signature à mériter lors du final.':'');
  const stats=codexProgress(season.collections.flatMap(part=>cardsForCollection(CARDS,season.id,part.id)),state.owned,state.shiny);
  $('#codex-progress-discovered').textContent=stats.discovered+' / '+stats.total;
  $('#codex-progress-chromatic').textContent=stats.chromatic+' / '+stats.total;
  const chapterCards=season.collections.flatMap(part=>cardsForCollection(CARDS,season.id,part.id));
  for(const finish of FINISH_KEYS){
    const target=document.querySelector('#codex-progress-'+finish);
    if(target)target.textContent=finishUnique(state.finishCounts,finish,chapterCards)+' / '+stats.total;
    const fill=document.querySelector('#codex-'+finish+'-fill');
    if(fill)fill.style.width=(stats.total?100*finishUnique(state.finishCounts,finish,chapterCards)/stats.total:0)+'%';
  }
  $('#codex-progress-fill').style.width=stats.percent+'%';
  $('#codex-chromatic-fill').style.width=stats.chromaticPercent+'%';
  $('#codex-progress-track').setAttribute('aria-valuenow',String(stats.discovered));
  $('#codex-progress-track').setAttribute('aria-valuemax',String(Math.max(stats.total,1)));
  $('#codex-chromatic-track').setAttribute('aria-valuenow',String(stats.chromatic));
  $('#codex-chromatic-track').setAttribute('aria-valuemax',String(Math.max(stats.total,1)));
}
function claimDiscoveryFragment(threshold){
  const cards=cardsForCollection(CARDS,activeSeason,activeCollection);
  const result=claimCollectionMilestone({
    seasonId:activeSeason,collectionId:activeCollection,threshold,
    cards,owned:state.owned,claims:state.collectionMilestones
  });
  if(!result.ok){notify(result.reason);return}
  const reward=result.milestone.reward;
  // All changes happen in one synchronous update, saved before confirmation.
  state.collectionMilestones=result.claims;
  if(reward.currency==='coins'){
    state.coins+=reward.amount;
    state.earned+=reward.amount;
  }else state.dust+=reward.amount;
  update();
  renderCollection();
  notify('✧ '+result.milestone.title+' · +'+reward.amount+
    (reward.currency==='coins'?' Couronnes':' Éclats')+' !');
}
function renderCollectionMilestones(cards){
  const journal=$('#codex-milestones');
  const entries=milestonesFor(activeSeason,activeCollection);
  journal.hidden=!entries.length;
  if(!entries.length)return;
  const count=uniqueCardsOwned(cards,state.owned);
  const statuses=collectionMilestoneStatus(
    activeSeason,activeCollection,cards,state.owned,state.collectionMilestones);
  const recovered=statuses.filter(entry=>entry.status==='claimed').length;
  const pending=statuses.filter(entry=>entry.status==='claimable').length;
  $('#codex-milestones-count').textContent=pending
    ?pending+' fragment'+(pending>1?'s':'')+' à révéler'
    :recovered+' / '+entries.length+' fragments retrouvés';
  $('#codex-milestones-progress').textContent=count+' / '+cards.length+' cartes différentes';
  const holder=$('#codex-milestones-list');
  holder.replaceChildren();
  for(const entry of statuses){
    const unlocked=entry.status!=='locked';
    const claimed=entry.status==='claimed';
    const tile=el('article','codex-milestone-card'+(unlocked?' is-unlocked':'')+
      (claimed?' is-claimed':''));
    const number=el('span','codex-milestone-number',
      '✧ '+String(entry.threshold).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0'));
    const title=el('strong','codex-milestone-title',unlocked?entry.title:'Fragment scellé');
    const award=el('span','codex-milestone-award','+'+entry.reward.amount+
      (entry.reward.currency==='coins'?' Couronnes':' Éclats'));
    tile.append(number,title,award);
    if(claimed){
      tile.append(el('p','codex-milestone-story','« '+entry.fragment+' »'),
        el('span','codex-milestone-state','✦ Fragment retrouvé'));
    }else if(unlocked){
      tile.append(el('p','codex-milestone-message','Une page des Archives attend ton regard.'));
      tile.append(button('✧ Révéler le fragment',()=>claimDiscoveryFragment(entry.threshold),
        'codex-milestone-claim'));
    }else tile.append(el('p','codex-milestone-message',
      'Encore '+(entry.threshold-count)+' carte'+(entry.threshold-count>1?'s':'')+' à découvrir.'));
    holder.append(tile);
  }
}
function renderLivingArchives(cards){
  const panel=$('#codex-living');
  panel.hidden=!cards.length;
  if(!cards.length)return;
  const archive=buildLivingArchive(cards,CARDS,state.owned,state.shiny,state.recentFinds);
  $('#living-summary').textContent=archive.discovered+' / '+cards.length+
    ' cartes · '+archive.completed.length+' / '+archive.publishedCount+' collection'+
    (archive.publishedCount>1?'s':'')+' complète'+(archive.publishedCount>1?'s':'');
  $('#living-recent-caption').textContent=archive.recent.length
    ?'Les nouveaux trésors du registre':'À partir de ta prochaine trouvaille';
  const recentHolder=$('#living-recent');
  const featuredHolder=$('#living-featured');
  recentHolder.replaceChildren();
  featuredHolder.replaceChildren();

  const addCard=(holder,card,note)=>{
    const chromatic=!!state.shiny[card.id];
    const tile=button('',()=>inspect(card,chromatic),
      'living-tile'+(chromatic?' is-chromatic':''));
    tile.style.setProperty('--living-edge',RARITIES[card.rarity].color);
    tile.setAttribute('aria-label','Voir '+card.name+' · '+RARITIES[card.rarity].label+
      (chromatic?' · Chromatique':''));
    const art=el('img');
    applyCardIllustration(art,card,{shiny:chromatic,size:'thumbnail'});
    art.alt='';
    art.loading='lazy';
    const info=el('span','living-tile-info');
    info.append(el('strong','living-tile-name',card.name),
      el('span','living-tile-note',note));
    tile.append(art,info);
    holder.append(tile);
  };
  if(archive.recent.length){
    for(const event of archive.recent){
      const note=event.kind==='forge'?'Façonnée à la Forge':
        event.kind==='chromatic'?'✧ Découverte Chromatique':'Première découverte';
      addCard(recentHolder,event.card,note);
    }
  }else recentHolder.append(el('p','living-empty',
    'Tes prochaines découvertes apparaîtront ici. Tes anciennes cartes sont toujours présentes dans le Codex.'));
  if(archive.featured.length){
    for(const card of archive.featured)addCard(featuredHolder,card,
      RARITIES[card.rarity].label+(state.shiny[card.id]?' · ✧ Chromatique':''));
  }else featuredHolder.append(el('p','living-empty',
    'Les cartes les plus précieuses de ta collection prendront place ici.'));

  const rarityHolder=$('#living-rarities');
  rarityHolder.replaceChildren();
  for(const entry of archive.rarities){
    const line=el('div','living-rarity-line');
    const label=el('div','living-rarity-label');
    label.append(el('span','',entry.label),
      el('strong','',entry.collected+' / '+entry.total));
    const track=el('div','living-rarity-track');
    track.setAttribute('role','progressbar');
    track.setAttribute('aria-label',entry.label+' découvertes');
    track.setAttribute('aria-valuemin','0');
    track.setAttribute('aria-valuemax',String(entry.total));
    track.setAttribute('aria-valuenow',String(entry.collected));
    const fill=el('span');
    fill.style.width=(100*entry.collected/entry.total)+'%';
    track.append(fill);
    line.append(label,track);
    rarityHolder.append(line);
  }
  $('#living-complete-count').textContent=archive.completed.length+
    ' / '+archive.publishedCount+' disponibles';
  const completeHolder=$('#living-completions');
  completeHolder.replaceChildren();
  if(archive.completed.length){
    for(const item of archive.completed)completeHolder.append(
      el('span','living-complete-badge',
        '✦ Saison '+item.season.number+' · '+item.collection.title+' achevée'));
  }else completeHolder.append(el('p','living-completion-note',
    'Rassemble toutes les cartes d’une collection pour voir son sceau apparaître ici.'));
}
function renderCollection(){
  renderCodexSeasons();
  const selectedPart=collectionById(activeSeason,activeCollection);
  const availableCards=cardsForCollection(CARDS,activeSeason,activeCollection);
  const isUpcoming=!selectedPart.released;
  $('#codex-upcoming').hidden=!isUpcoming;
  const showRefletsPreview=isUpcoming&&activeSeason==='marches-de-verre'&&selectedPart.id==='reflets-brises';
  const showAuDelaTeaser=isUpcoming&&activeSeason==='marches-de-verre'&&selectedPart.id==='au-dela-du-verre';
  $('#au-dela-teaser').hidden=!showAuDelaTeaser;
  $('#au-dela-gallery').hidden=!showAuDelaTeaser;
  if(showAuDelaTeaser)mountAuDelaGallery($('#au-dela-gallery-grid'));
  $('#reflets-art-preview').hidden=!showRefletsPreview;
  $('#reflets-gallery').hidden=!showRefletsPreview;
  if(showRefletsPreview)mountRefletsGallery($('#reflets-gallery-grid'));
  $('#collection-layout').hidden=isUpcoming;
  if(isUpcoming){
    $('#codex-milestones').hidden=true;
    $('#codex-living').hidden=true;
    $('#codex-upcoming-title').textContent='Partie '+selectedPart.number+' · '+selectedPart.title;
    $('#codex-upcoming-description').textContent=selectedPart.subtitle;
    $('#codex-upcoming-note').textContent=selectedPart.signature
      ?'24 cartes prévues, dont une carte Signature obtenue par accomplissement. Aucun booster disponible pour le moment.'
      :'24 cartes prévues. Cette collection sera disponible dans une prochaine mise à jour.';
    selectedCard=null;
    codexVisibleCards=[];
    update();
    return;
  }
  renderCollectionMilestones(availableCards);
  renderLivingArchives(availableCards);
  const gallery=$('#card-grid');
  const q=$('#search').value.trim();
  const cards=filterCodex(availableCards,{type:filterType,rarity:filterRarity,
    finish:filterFinish,discovery:discoveryFilter,query:q,owned:state.owned,shiny:state.shiny,
    finishCounts:state.finishCounts});
  codexVisibleCards=cards;
  gallery.replaceChildren();
  for(const c of cards){
    const finish=filterFinish==='normal'?'normal':(FINISHES[filterFinish]?filterFinish:preferredFinish(state.finishCounts,c.id));
    gallery.append(makeCard(c,finish,!state.owned[c.id]));
  }
  const inChapter=availableCards.length;
  $('#codex-results').textContent=cards.length+' / '+inChapter+' archives';
  const empty=$('#empty');
  empty.classList.add('codex-empty');
  empty.hidden=cards.length>0;
  empty.textContent=cards.length?'':filterFinish==='chromatic'?
    'Aucune Chromatique ne correspond à ces filtres. Essaie une autre rareté ou une autre collection.':
    (filterFinish==='holographic'||filterFinish==='calligraphic')?
    'Aucune '+FINISHES[filterFinish].label+' possédée pour cette collection.':
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
      const finish=FINISHES[filterFinish]?filterFinish:
        (selectedCard?.id===next.id&&selectedCard.finish?selectedCard.finish:
          preferredFinish(state.finishCounts,next.id));
      const chromatic=finish==='chromatic';
      inspect(next,chromatic,false,chromatic&&finishQuantity(state.finishCounts,finish,next.id)===0,finish);
    }
  }else{
    selectedCard=null;
    const panel=$('#inspector');
    panel.classList.remove('is-chromatic','is-holographic','is-calligraphic');
    panel.replaceChildren(el('p','muted','Choisis une autre collection ou ajuste les filtres pour feuilleter les archives.'));
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

/* Season I boosters: one sealed card at a time, from a five-card stack.
   A purchase is saved before presentation; revealing never re-rolls or charges. */
const boosterArt=$('#booster-pack'),boosterOpening=$('#booster-opening');
const boosterGrid=$('#pulls'),boosterProgress=$('#booster-progress'),boosterProgressFill=$('#booster-progress span');
const boosterActions=$('#booster-actions'),boosterSummary=$('#booster-summary');
const revealAllButton=$('#reveal-all'),nextPullButton=$('#next-pull'),boosterStep=$('#booster-step');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
// The packet seal and the first card are one sequence; no additional roll
// or payment happens while the foil animation is running.
const BOOSTER_UNSEAL_MS=980;
const boosterTimers=new Set();
let currentDraw=[],drawSummary=null,currentIndex=0,cardFaceUp=false,changingCard=false;
let selectedBooster='origines';
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
/* Switch only between complete released collections. Never change a purchased
   draw during its animation or re-roll cards on edition change. */
function selectBooster(edition){
  if(boosterBusy||!['origines','reflets-brises','au-dela-du-verre'].includes(edition))return;
  const isReflets=edition==='reflets-brises';
  const isAuDela=edition==='au-dela-du-verre';
  selectedBooster=edition;
  clearBoosterScene();
  boosterArt.classList.toggle('pack-reflets',isReflets);
  boosterArt.classList.toggle('pack-au-dela',isAuDela);
  $('#booster-pack .pack-title').textContent=isAuDela?'AU-DELÀ DU VERRE':isReflets?'REFLETS BRISÉS':'ORIGINES';
  $('#booster-pack .pack-edition').textContent='SAISON I · 5 CARTES';
  $('#booster-collection-kicker').textContent='SAISON I · LES MARCHES DE VERRE · PARTIE '+(isAuDela?'III':isReflets?'II':'I');
  $('#booster-family-title').textContent='Booster '+(isAuDela?'Au-delà du Verre':isReflets?'des Reflets brisés':'des Origines');
  $('#booster-family-description').textContent=isAuDela
    ?'Partie III des Marches de Verre. Cinq cartes parmi 23 découvertes, dont au moins une Inhabituelle ou mieux. La 24e, le Cœur des Marches, est une Signature à mériter dans l’aventure finale : elle ne peut jamais sortir du paquet.'
    :isReflets
      ?'Partie II des Marches de Verre. Cinq cartes du Revers, dont une Inhabituelle au minimum. Les 24 nouvelles légendes t’attendent.'
      :'Partie I des Marches de Verre. Cinq cartes, dont au moins une Inhabituelle ou mieux. Une chance de découvrir une version Chromatique.';
  for(const control of $$('.booster-choice')){
    const active=control.dataset.booster===edition;
    control.classList.toggle('is-selected',active);
    control.setAttribute('aria-pressed',String(active));
  }
  $('#pack-title').textContent=isAuDela?'Deux rives, un même horizon.':isReflets?'Les miroirs du Revers t’attendent.':'Les archives attendent leur voyageur.';
  $('#pack-msg').textContent='Choisis ton booster puis dépense 100 Couronnes pour révéler cinq cartes.';
  update();
}
$$('.booster-choice').forEach(control=>control.addEventListener('click',
  ()=>selectBooster(control.dataset.booster)));

/** The face-up card is decorative: tapping it should not leave the reveal sequence.
 * Loading the artwork eagerly is important: on Android WebView a lazy image
 * inside an initially hidden, flipping card can remain a blank rectangle. */
function boosterCardArtwork(item){
  const buttonCard=makeCard(item.card,item.finish??item.shiny);
  const artwork=el('div',buttonCard.className);
  artwork.style.cssText=buttonCard.style.cssText;
  while(buttonCard.firstChild)artwork.append(buttonCard.firstChild);
  // Use the full-size art, not the Codex thumbnail, and request it before
  // the player turns the face up. Keep applyCardIllustration's error fallback.
  const revealedImage=artwork.querySelector('img');
  if(revealedImage){
    revealedImage.loading='eager';
    revealedImage.decoding='sync';
    revealedImage.fetchPriority='high';
    applyCardIllustration(revealedImage,item.card,{shiny:item.shiny,size:'full'});
    // The shared helper normally decodes asynchronously. Only the booster
    // preview needs synchronous paint immediately after reveal.
    revealedImage.loading='eager';
    revealedImage.decoding='sync';
    revealedImage.fetchPriority='high';
    revealedImage.alt='Illustration de '+item.card.name;
  }
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
  tile.classList.toggle('is-holographic',item.finish==='holographic');
  tile.classList.toggle('is-calligraphic',item.finish==='calligraphic');
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
  const specialFinish=item.finish&&item.finish!=='normal'?item.finish:(item.shiny?'chromatic':null);
  const tag=el('div','pull-tag'+(item.shiny?' is-chromatic':item.isNew?' is-new':' is-duplicate'),
    specialFinish?FINISHES[specialFinish].symbol+' CARTE '+FINISHES[specialFinish].label.toUpperCase():
    item.isNew?'✧ Nouvelle carte':'Doublon · +'+item.dustGain+' Éclats');
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
  $('#pack-msg').textContent=RARITIES[item.card.rarity].label+
    ((item.finish&&item.finish!=='normal')?' · '+FINISHES[item.finish].symbol+' '+FINISHES[item.finish].label.toUpperCase()+' !':
      item.shiny?' · ✧ CHROMATIQUE !':'')+
    (item.isNew?' · Nouvelle carte':' · Doublon (+'+item.dustGain+' Éclats)');
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
  boosterGrid.replaceChildren(...currentDraw.map(item=>makeCard(item.card,item.finish??item.shiny)));
  boosterSummary.hidden=false;
  // A single, late reveal highlight for exceptional finds. Never preview
  // hidden cards or alter the already-saved purchase and shard rewards.
  const moment=boosterMoment(currentDraw);
  const momentNote=moment?el('div','booster-moment booster-moment-'+moment.kind):null;
  if(momentNote){
    const copy=el('div','booster-moment-copy');
    copy.append(el('strong','booster-moment-title',moment.title),
      el('small','booster-moment-detail',moment.detail));
    const mark=el('span','booster-moment-mark',moment.symbol);
    mark.setAttribute('aria-hidden','true');
    momentNote.append(mark,copy);
  }
  boosterSummary.replaceChildren(
    ...(momentNote?[momentNote]:[]),
    el('span','',drawSummary.newCount+' nouvelle(s)'),
    el('span','',drawSummary.duplicates+' doublon(s) · +'+drawSummary.dustEarned+' Éclats'),
    el('span',drawSummary.shinyCount?'booster-star':'',drawSummary.shinyCount+' Chromatique(s)'),
    el('span',drawSummary.holographicCount?'booster-star':'',drawSummary.holographicCount+' Holographique(s)'),
    el('span',drawSummary.calligraphicCount?'booster-star':'',drawSummary.calligraphicCount+' Calligraphique(s)')
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
  const edition=typeof selectedBooster==='undefined'?'origines':selectedBooster;
  const results=edition==='au-dela-du-verre'?drawAuDelaPack():edition==='origines'?drawPack():drawRefletsPack();
  state.coins-=PACK_PRICE;
  state.opened++;
  let newCount=0,duplicates=0,shinyCount=0,dustEarned=0;
  let holographicCount=0,calligraphicCount=0;
  currentDraw=results.map(item=>{
    const card=CARDS[item.id-1];
    const isNew=!state.owned[card.id];
    const dustGain=isNew?0:duplicateDustReward(card);
    if(isNew)newCount++;else{duplicates++;state.dust+=dustGain;dustEarned+=dustGain}
    state.owned[card.id]=(state.owned[card.id]||0)+1;
    const finish=item.finish||(item.shiny?'chromatic':'normal');
    if(!state.finishCounts)state.finishCounts={normal:{},chromatic:{},holographic:{},calligraphic:{}};
    const finishInventory=state.finishCounts[finish]||state.finishCounts.normal;
    finishInventory[card.id]=(finishInventory[card.id]||0)+1;
    const firstChromatic=item.shiny&&!state.shiny[card.id];
    if(item.shiny){state.shiny[card.id]=true;shinyCount++}
    if(finish==='holographic')holographicCount++;
    if(finish==='calligraphic')calligraphicCount++;
    if(firstChromatic||isNew){
      state.recentFinds=recordRecentFind(state.recentFinds,card.id,
        firstChromatic?'chromatic':'new');
    }
    return {...item,finish,card,isNew,dustGain};
  });
  drawSummary={newCount,duplicates,shinyCount,holographicCount,calligraphicCount,dustEarned};
  update(); // Persists the purchase before any animation or navigation.
  boosterSummary.hidden=true;
  boosterSummary.replaceChildren();
  boosterGrid.replaceChildren();
  boosterGrid.classList.remove('booster-gallery');
  boosterActions.hidden=false;nextPullButton.hidden=true;
  boosterProgress.hidden=false;boosterProgressFill.style.width='0%';
  boosterStep.hidden=false;boosterStep.textContent='Préparation des cartes…';
  $('#pack-title').textContent=edition==='au-dela-du-verre'?'Les deux horizons s’accordent…':edition==='origines'?'Le sceau des Origines s’éveille…':'Le sceau des Reflets brisés s’éveille…';
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
  else{
    afterBooster(370,()=>{
      if(boosterBusy)$('#pack-msg').textContent='Le sceau se brise…';
    });
    afterBooster(BOOSTER_UNSEAL_MS,startReveal);
  }
}
$('#buy').addEventListener('click',openOriginesBooster);
revealAllButton.addEventListener('click',revealBoosterAll);
nextPullButton.addEventListener('click',advanceBoosterCard);

const success=[['Premiers pas','Terminer une épreuve',()=>state.wins>=1],['Explorateur','Terminer 10 épreuves',()=>state.wins>=10],['Archéologue','Terminer 50 épreuves',()=>state.wins>=50],['Curieux','Ouvrir son premier booster',()=>state.opened>=1],['Collectionneur','Découvrir 12 cartes',()=>Object.keys(state.owned).length>=12],['Archiviste','Découvrir les 24 cartes',()=>Object.keys(state.owned).length>=24],['Éclat rare','Trouver une carte Chromatique',()=>Object.keys(state.shiny).length>=1],['Pactole','Gagner 1 000 Couronnes',()=>state.earned>=1000],['Chasseur de légendes','Obtenir une carte légendaire',()=>CARDS.some(c=>c.rarity==='legendary'&&state.owned[c.id])]];
function renderHonorifics(){
  const titles=earnedTrialTitles(state.trialStats,state.trialRecords);
  const equipped=validEquippedTitle(state.titleId,state.trialStats,state.trialRecords);
  const current=equipped===null?null:titles[equipped];
  const active=$('#honorific-active');
  active.textContent=current?'✦ '+current.name:'Aucun titre équipé';
  const list=$('#honorific-list');
  list.replaceChildren();
  titles.forEach(title=>{
    const selected=equipped===title.id;
    const tile=button('',()=>{
      if(!title.earned)return;
      const next=toggleEquippedTitle(state.titleId,title.id,state.trialStats,state.trialRecords);
      if(next===state.titleId)return;
      state.titleId=next;
      save();
      renderHonorifics();
      notify(next===null?'Titre retiré.':'Titre équipé : '+title.name);
    },'honorific'+(title.earned?' is-unlocked':' is-locked')+(selected?' is-equipped':''));
    tile.disabled=!title.earned;
    tile.setAttribute('aria-pressed',String(selected));
    tile.setAttribute('aria-label',title.name+' · '+(selected?'équipé, retirer le titre':
      title.earned?'obtenu, équiper le titre':'verrouillé, médaille d’Or requise'));
    tile.append(
      el('span','honorific-symbol',title.earned?title.symbol:'◇'),
      el('span','honorific-name',title.name),
      el('span','honorific-state',selected?'Équipé':title.earned?'Choisir':'À débloquer')
    );
    list.append(tile);
  });
}
function renderAchievements(){
  const root=$('#achievements');
  root.replaceChildren();
  for(const [title,description,test] of success){
    const done=test();
    const box=el('article','achievement'+(done?'':' locked'));
    box.append(el('h3','',done?'✦ '+title:'◇ '+title),el('p','',description),
      el('small','muted',done?'Accompli':'À découvrir'));
    root.append(box);
  }
  renderHonorifics();
}
// Save transfer remains opt-in and cannot interfere with game loops or rewards.
const backupDialog=$('#backup-dialog');
const backupStatus=$('#backup-status');
const backupFile=$('#backup-file');
const backupRestore=$('#backup-restore');
let backupBusy=false;
function backupMessage(message,error=false){
  backupStatus.textContent=message;
  backupStatus.classList.toggle('is-error',error);
}
function syncBackupRestore(){
  try{backupRestore.disabled=localStorage.getItem(PREVIOUS_SAVE_KEY)===null}
  catch{backupRestore.disabled=true}
}
$('#backup-open').addEventListener('click',()=>{
  backupMessage('');
  syncBackupRestore();
  backupDialog.showModal();
});
$('#backup-close').addEventListener('click',()=>backupDialog.close());
$('#backup-export').addEventListener('click',async()=>{
  if(backupBusy)return;
  backupBusy=true;
  const control=$('#backup-export');
  control.disabled=true;
  backupMessage('Préparation du fichier de sauvegarde…');
  try{
    const json=await createBackup(state,CARDS.map(card=>card.id));
    const file=new Blob([json],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(file);
    try{
      const link=document.createElement('a');
      link.href=url;
      link.download='Aetherium-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.append(link);
      link.click();
      link.remove();
    }finally{
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }
    backupMessage('Fichier préparé. Conserve-le dans un emplacement sûr.');
  }catch(error){
    backupMessage(error?.message||'Exportation impossible dans ce navigateur.',true);
  }finally{
    backupBusy=false;
    control.disabled=false;
  }
});
$('#backup-import').addEventListener('click',()=>{
  if(!backupBusy)backupFile.click();
});
backupFile.addEventListener('change',async()=>{
  const file=backupFile.files?.[0];
  backupFile.value='';
  if(!file||backupBusy)return;
  backupBusy=true;
  const control=$('#backup-import');
  control.disabled=true;
  backupMessage('Vérification du fichier…');
  try{
    if(file.size>MAX_BACKUP_SIZE)
      throw new Error('Fichier trop volumineux (maximum : 1 Mo).');
    const parsed=await decodeBackup(await file.text(),CARDS.map(card=>card.id));
    const {stats,createdAt}=parsed;
    const date=new Date(createdAt).toLocaleString('fr-FR');
    const message='Sauvegarde du '+date+'\n\n'+
      stats.cards+' cartes · '+stats.chromatic+' Chromatiques\n'+
      stats.crowns+' Couronnes · '+stats.shards+' Éclats\n'+
      stats.opened+' boosters ouverts\n\n'+
      'Remplacer la progression de ce navigateur par cette sauvegarde ?\n'+
      'La progression actuelle sera conservée localement pour annuler cet import.';
    if(!window.confirm(message)){
      backupMessage('Importation annulée : ta progression n’a pas été modifiée.');
      return;
    }
    installImportedSave(localStorage,parsed.state);
    window.location.reload(); // Reload the normal, already-tested game loader.
  }catch(error){
    backupMessage(error?.message||'Fichier invalide : aucune modification effectuée.',true);
  }finally{
    backupBusy=false;
    control.disabled=false;
    syncBackupRestore();
  }
});
backupRestore.addEventListener('click',()=>{
  if(backupBusy||backupRestore.disabled)return;
  if(!window.confirm('Restaurer la sauvegarde d’avant le dernier import ? La progression actuelle sera remplacée.'))return;
  try{
    restorePreviousSave(localStorage);
    window.location.reload();
  }catch(error){
    backupMessage(error?.message||'Restauration impossible.',true);
    syncBackupRestore();
  }
});
$('#reset').addEventListener('click',()=>{if(!confirm('Effacer définitivement les cartes et la progression sauvegardées sur cet appareil ?'))return;clearBoosterScene();try{localStorage.removeItem(PREVIOUS_SAVE_KEY)}catch{}state=fresh();state.trialStats=sanitizedTrialStats(state.trialStats);trialStarters.forEach(start=>start());renderTrialMastery();renderDifficultyChoice();renderExpedition();selectedCard=null;forgeSelectedId=null;forgeFilter='all';$('#atelier-filter').value='all';$('#atelier-result').hidden=true;$('#inspector').replaceChildren(el('p','muted','Sélectionne une carte découverte pour l’admirer.'));$('#pulls').replaceChildren();$('#pack-title').textContent='Les archives attendent leur voyageur.';$('#pack-msg').textContent='Gagne des Couronnes en jouant pour ouvrir des boosters.';update();renderCollection();notify('Progression réinitialisée.')});
syncMobileSheets();
selectBooster('origines');
renderExpedition();
update();
navigate(APP_PAGES.includes(location.hash.slice(1))?location.hash.slice(1):'jouer');
window.addEventListener('hashchange',()=>{
  const page=location.hash.slice(1);
  if(APP_PAGES.includes(page)&&!$('#page-'+page).classList.contains('active'))navigate(page);
});
