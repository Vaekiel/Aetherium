/* AETHERIUM — optional immersive play.
   No automatic fullscreen request (a trusted user gesture is required).
   Installation via the web app manifest is the durable no-browser-chrome mode. */
const immersiveButton=document.getElementById('immersive-toggle');
const mobileScreen=window.matchMedia('(max-width:850px)');
const displayStandalone=window.matchMedia('(display-mode:standalone)');
const displayFullscreen=window.matchMedia('(display-mode:fullscreen)');

function immersiveInstalled(){
  return displayStandalone.matches||displayFullscreen.matches||
    window.navigator.standalone===true;
}
function syncImmersiveButton(){
  const supported=Boolean(document.fullscreenEnabled&&document.documentElement.requestFullscreen);
  const show=supported&&mobileScreen.matches&&!immersiveInstalled();
  immersiveButton.hidden=!show;
  const active=Boolean(document.fullscreenElement);
  immersiveButton.setAttribute('aria-pressed',String(active));
  immersiveButton.setAttribute('aria-label',active?'Quitter le plein écran':'Passer en plein écran');
  immersiveButton.setAttribute('title',active?'Quitter le plein écran':'Passer en plein écran');
  immersiveButton.querySelector('.immersive-icon').textContent=active?'⤡':'⛶';
}
immersiveButton.addEventListener('click',()=>{
  // Call the browser API immediately while the click's activation is live.
  try{
    const operation=document.fullscreenElement?
      document.exitFullscreen():document.documentElement.requestFullscreen();
    if(operation&&typeof operation.catch==='function'){
      operation.catch(()=>{syncImmersiveButton();});
    }
  }catch{
    syncImmersiveButton();
  }
});
document.addEventListener('fullscreenchange',syncImmersiveButton);
document.addEventListener('fullscreenerror',syncImmersiveButton);
mobileScreen.addEventListener?.('change',syncImmersiveButton);
displayStandalone.addEventListener?.('change',syncImmersiveButton);
displayFullscreen.addEventListener?.('change',syncImmersiveButton);
syncImmersiveButton();
