/* Codex gallery: keep existing nodes and load small images independently
 * of viewport observation. Only nearby cards upgrade to HD and animate.
 */
export function reconcileCodexGrid(gallery,entries,createTile,onRemove=()=>{},onAdd=()=>{}){
 const current=new Map(Array.from(gallery.children).map(tile=>[tile.dataset.cardId,tile]));
 const wanted=new Set(entries.map(entry=>String(entry.card.id)));
 for(const [id,tile] of current){
  if(!wanted.has(id)){onRemove(tile);tile.remove();current.delete(id)}
 }
 for(const [index,entry] of entries.entries()){
  const id=String(entry.card.id);
  let tile=current.get(id);
  if(tile&&tile.dataset.renderKey!==entry.key){
   onRemove(tile);tile.remove();tile=null;
  }
  if(!tile){
   tile=createTile(entry);tile.dataset.renderKey=entry.key;
   gallery.insertBefore(tile,gallery.children[index]||null);
   onAdd(tile);
  }else if(gallery.children[index]!==tile)gallery.insertBefore(tile,gallery.children[index]||null);
 }
}
export function createCodexViewport(upgrade){
 const observed=new Set();
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!observed.has(entry.target))continue;
   entry.target.classList.toggle('codex-near-view',entry.isIntersecting);
   if(entry.isIntersecting)upgrade(entry.target.querySelector('img'));
  }
 },{rootMargin:'220px 0px'}):null;
 return {
  add(tile){
   if(!tile.querySelector('img'))return;
   observed.add(tile);
   if(observer)observer.observe(tile);
   else{tile.classList.add('codex-near-view');upgrade(tile.querySelector('img'))}
  },
  remove(tile){observer?.unobserve(tile);observed.delete(tile);tile.classList.remove('codex-near-view')},
  clear(){observer?.disconnect();for(const tile of observed)tile.classList.remove('codex-near-view');observed.clear()}
 };
}
