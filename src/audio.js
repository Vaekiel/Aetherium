/* AETHERIUM — soundscape prototype (original Web Audio synthesis).
   Not AI-generated audio. Replace or layer these voices with licensed Stable
   Audio assets once the final stems have been generated and approved.
   No autoplay: audio starts only from an explicit user interaction. */
const STORAGE_KEY='aetherium-audio-v1';
const ROOMS=Object.freeze({
  jouer:[146.83,220.00,349.23,523.25],
  boosters:[164.81,246.94,329.63,493.88],
  collection:[130.81,196.00,329.63,392.00],
  atelier:[110.00,164.81,261.63,329.63],
  expeditions:[116.54,174.61,293.66,349.23],
  succes:[196.00,293.66,392.00,493.88]
});
const DEFAULTS={volume:30,ambience:true,effects:true};
const readPrefs=()=>{
  try{
    const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    return {
      volume:Math.max(0,Math.min(100,Number.isFinite(Number(stored.volume))?Number(stored.volume):DEFAULTS.volume)),
      ambience:stored.ambience!==false,
      effects:stored.effects!==false
    };
  }catch{return {...DEFAULTS}}
};
const prefs=readPrefs();
const button=document.querySelector('#audio-toggle');
const dialog=document.querySelector('#audio-dialog');
const enable=document.querySelector('#audio-enabled');
const ambienceControl=document.querySelector('#audio-ambience');
const effectsControl=document.querySelector('#audio-effects');
const volumeControl=document.querySelector('#audio-volume');
const volumeValue=document.querySelector('#audio-volume-value');
let active=false,ctx=null,master=null,ambientBus=null,fxBus=null,padGain=null;
let padVoices=[],noiseBuffer=null,chimeTimer=null,lastReveal=0;
let currentRoom=document.querySelector('.page.active')?.id.replace('page-','')||'jouer';
const now=()=>ctx?.currentTime||0;
const persist=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(prefs))}catch{/* private browsing */}};
function refreshControls(){
  button.classList.toggle('is-on',active);
  button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-label',active?'Désactiver tous les sons':'Activer les sons du jeu');
  button.setAttribute('title',active?'Couper le son':'Activer le son');
  button.querySelector('.audio-toggle-glyph').textContent=active?'♫':'♪';
  enable.checked=active;
  ambienceControl.checked=prefs.ambience;
  effectsControl.checked=prefs.effects;
  volumeControl.value=String(prefs.volume);
  volumeValue.textContent=prefs.volume+' %';
}
function buildEngine(){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return false;
  try{ctx=new AudioContextClass()}catch{return false}
  master=ctx.createGain();
  master.gain.value=0;
  master.connect(ctx.destination);
  ambientBus=ctx.createGain();
  ambientBus.gain.value=0;
  ambientBus.connect(master);
  fxBus=ctx.createGain();
  fxBus.gain.value=0;
  fxBus.connect(master);
  padGain=ctx.createGain();
  padGain.gain.value=0;
  const filter=ctx.createBiquadFilter();
  filter.type='lowpass';
  filter.frequency.value=740;
  filter.Q.value=.25;
  padGain.connect(filter);
  filter.connect(ambientBus);
  // Three light, detuned voices: no large audio download on mobile.
  for(const [index,type] of ['sine','triangle','sine'].entries()){
    const oscillator=ctx.createOscillator();
    oscillator.type=type;
    oscillator.detune.value=[-4,2,5][index];
    const level=ctx.createGain();
    level.gain.value=[.23,.045,.12][index];
    oscillator.connect(level);level.connect(padGain);oscillator.start();
    padVoices.push(oscillator);
  }
  const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.9),ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);
  noiseBuffer=buffer;
  return true;
}
function applyMix(){
  if(!ctx)return;
  const t=now();
  master.gain.setTargetAtTime(active?prefs.volume/100*.42:0,t,.06);
  fxBus.gain.setTargetAtTime(active&&prefs.effects?1:0,t,.04);
  ambientBus.gain.setTargetAtTime(active&&prefs.ambience&&!document.hidden ? 0.14 : 0,t,.7);
}
function roomTo(page){
  currentRoom=ROOMS[page]?page:'jouer';
  if(!ctx)return;
  const t=now(),notes=ROOMS[currentRoom];
  // Fade down before retuning to avoid a glissando between screens.
  padGain.gain.cancelScheduledValues(t);
  padGain.gain.setTargetAtTime(.0001,t,.1);
  padVoices.forEach((voice,index)=>{
    const hz=notes[Math.min(index,notes.length-1)]/[2,1,1][index];
    voice.frequency.cancelScheduledValues(t);
    voice.frequency.setValueAtTime(hz,t+.34);
  });
  padGain.gain.setTargetAtTime(.48,t+.36,.48);
}
function oscillatorTone(frequency,duration,level=.12,type='sine',when=now()){
  if(!ctx||!active||!prefs.effects||document.hidden)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(Math.max(60,frequency),when);
  gain.gain.setValueAtTime(.0001,when);
  gain.gain.exponentialRampToValueAtTime(Math.max(.001,level),when+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(gain);gain.connect(fxBus);
  osc.start(when);osc.stop(when+duration+.025);
}
function bell(frequency,level=.13){
  const t=now();
  oscillatorTone(frequency,.52,level,'sine',t);
  oscillatorTone(frequency*2.006,.29,level*.22,'sine',t+.012);
}
function sound(kind,detail){
  if(!active||!prefs.effects||!ctx||document.hidden)return;
  const t=now();
  if(kind==='tap')oscillatorTone(540,.085,.055,'sine',t);
  if(kind==='select'){
    oscillatorTone(390,.11,.07,'triangle',t);
    oscillatorTone(585,.2,.045,'sine',t+.045);
  }
  if(kind==='page')bell(440,.065);
  if(kind==='forge'){
    oscillatorTone(196,.35,.1,'triangle',t);
    bell(392,.12);
  }
  if(kind==='reward'){
    [392,493.88,587.33].forEach((f,i)=>{
      oscillatorTone(f,.40,.085,'sine',t+i*.085);
      oscillatorTone(f*2,.19,.015,'sine',t+i*.085);
    });
  }
  if(kind==='reveal'){
    const rarity=String(detail||'common');
    const radiant=rarity==='legendary'||rarity==='epic';
    const f=radiant?587.33:rarity==='rare'?493.88:392;
    bell(f,radiant?.22:.1);
    if(radiant)oscillatorTone(f*1.5,.75,.1,'sine',t+.11);
  }
  if(kind==='unseal'&&noiseBuffer){
    const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    src.buffer=noiseBuffer;
    filter.type='bandpass';filter.Q.value=.6;
    filter.frequency.setValueAtTime(240,t);
    filter.frequency.exponentialRampToValueAtTime(1800,t+.48);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(.17,t+.08);
    gain.gain.exponentialRampToValueAtTime(.0001,t+.58);
    src.connect(filter);filter.connect(gain);gain.connect(fxBus);
    src.start(t);src.stop(t+.62);
    oscillatorTone(196,.50,.075,'triangle',t);
  }
}
function ambientAccent(){
  if(!active||!prefs.ambience||!ctx||document.hidden)return;
  const notes=ROOMS[currentRoom]||ROOMS.jouer;
  const n=notes[Math.floor(Math.random()*notes.length)];
  // Sparse musical atmosphere, not a looping tune.
  const t=now(),out=ctx.createGain(),o=ctx.createOscillator();
  o.type='sine';o.frequency.value=n*([1,2][Math.floor(Math.random()*2)]);
  out.gain.setValueAtTime(.0001,t);
  out.gain.exponentialRampToValueAtTime(.018,t+.07);
  out.gain.exponentialRampToValueAtTime(.0001,t+2.4);
  o.connect(out);out.connect(ambientBus);o.start(t);o.stop(t+2.5);
}
function stopChimes(){if(chimeTimer){clearInterval(chimeTimer);chimeTimer=null}}
function startChimes(){
  stopChimes();
  chimeTimer=setInterval(ambientAccent,9200);
}
async function setActive(next){
  if(next&&!ctx&&!buildEngine()){
    button.setAttribute('title','Audio indisponible sur ce navigateur');
    return;
  }
  active=next;
  if(active){
    try{await ctx.resume()}catch{active=false}
    if(active){roomTo(currentRoom);startChimes()}
  }else stopChimes();
  applyMix();refreshControls();
}
button.addEventListener('click',()=>{setActive(!active)});
document.querySelector('#audio-options').addEventListener('click',()=>dialog.showModal());
document.querySelector('#audio-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target===dialog)dialog.close();
});
enable.addEventListener('change',()=>{setActive(enable.checked)});
ambienceControl.addEventListener('change',()=>{prefs.ambience=ambienceControl.checked;persist();applyMix()});
effectsControl.addEventListener('change',()=>{prefs.effects=effectsControl.checked;persist();applyMix()});
volumeControl.addEventListener('input',()=>{
  prefs.volume=Number(volumeControl.value);
  persist();applyMix();refreshControls();
});
document.addEventListener('visibilitychange',()=>{
  applyMix();
  if(!document.hidden&&active&&ctx?.state==='suspended')ctx.resume().catch(()=>{});
});
const pageObserver=new MutationObserver(()=>{
  const page=document.querySelector('.page.active')?.id.replace('page-','');
  if(page&&page!==currentRoom)roomTo(page);
});
document.querySelectorAll('.page').forEach(node=>pageObserver.observe(node,{attributes:true,attributeFilter:['class']}));
document.addEventListener('click',event=>{
  if(!active||dialog.open)return;
  const target=event.target.closest('button');
  if(!target||target===button||target.id==='audio-options')return;
  if(target.matches('#buy'))sound('unseal');
  else if(target.matches('#next-pull,#reveal-all'))sound('tap');
  else if(target.closest('.game-picker,.difficulty-options,.booster-selector,.codex-season-list,.codex-chapter-list,.codex-discovery-tabs,.atelier-card-list,.honorific-list'))sound('select');
  else if(target.closest('#atelier-confirm'))sound('forge');
  else if(target.closest('.top nav')||target.hasAttribute('data-go'))sound('page');
},true);
const pulls=document.querySelector('#pulls');
new MutationObserver(records=>{
  if(!active||!prefs.effects)return;
  const revealed=records.find(record=>
    record.type==='attributes'&&record.attributeName==='class'&&
    record.target.matches?.('.pull-flip')&&
    record.target.classList.contains('is-revealed')
  );
  if(!revealed||performance.now()-lastReveal<120)return;
  lastReveal=performance.now();
  sound('reveal',revealed.target.dataset.rarity);
}).observe(pulls,{subtree:true,attributes:true,attributeFilter:['class']});
const coins=document.querySelector('#coins');
let lastCoins=Number(coins.textContent.replace(/[^\d]/g,''))||0;
new MutationObserver(()=>{
  const next=Number(coins.textContent.replace(/[^\d]/g,''))||0;
  if(active&&next>lastCoins)sound('reward');
  lastCoins=next;
}).observe(coins,{subtree:true,childList:true,characterData:true});
refreshControls();
