/* Le Bandeau des Archives.
   Lightweight display-only feedback. Never writes coins or save data.
   Mutations are driven by the existing game update() routine. */
const relicCounters=[
  document.getElementById('coins'),
  document.getElementById('dust')
].filter(Boolean);

for(const counter of relicCounters){
  let previous=Number(counter.textContent.replace(/[^\d]/g,''))||0;
  const button=counter.closest('.wallet-link');
  if(!button)continue;
  let clearEffect=0;
  new MutationObserver(()=>{
    const next=Number(counter.textContent.replace(/[^\d]/g,''))||0;
    if(next>previous){
      button.classList.remove('is-gaining');
      // Re-trigger the small cosmetic highlight on consecutive rewards.
      void button.offsetWidth;
      button.classList.add('is-gaining');
      window.clearTimeout(clearEffect);
      clearEffect=window.setTimeout(()=>button.classList.remove('is-gaining'),480);
    }
    previous=next;
  }).observe(counter,{childList:true,subtree:true,characterData:true});
}
