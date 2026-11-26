/* The circuits are replayable, untimed, session-only events.
 * Normal trial victories are the only source of currency and saved records.
 * Starting, pausing and replaying never mutate the player's saved state. */
const circuit=(id,title,description,mode,games)=>Object.freeze({id,title,description,mode,games:Object.freeze(games)});
export const ARCANE_CIRCUITS=Object.freeze([
 circuit('lumieres','La Veillée des Lumières','Trois épreuves pour rallumer les lanternes des Archives.','initiation',[0,1,2]),
 circuit('passeurs','Le Rendez-vous des Passeurs','Des fouilles aux potions, puis aux runes : retrouve le chemin des voyageurs.','aventure',[3,4,0]),
 circuit('convergence','Le Défi de la Convergence','Mets à l’épreuve ta logique, ta mémoire et ton alchimie.','maitrise',[2,1,4])
]);
const definition=id=>ARCANE_CIRCUITS.find(c=>c.id===id)||null;
export function createCircuitSession(){
 let run=null;const best=new Map();
 function view(){
  const current=definition(run?.id);
  if(!current)return null;
  const scores=[...run.scores],finished=scores.length===current.games.length;
  return {circuit:current,scores,step:scores.length,game:current.games[scores.length]??null,
   armed:run.armed,finished,total:scores.reduce((n,v)=>n+v,0),max:current.games.length*100,
   best:best.get(current.id)??null};
 }
 return {
  view,best:id=>best.get(id)??null,
  start(id){if(!definition(id))return false;run={id,scores:[],armed:false};return true},
  arm(expeditionArmed=false){const v=view();if(!v||v.finished||expeditionArmed)return false;run.armed=true;return true},
  pause(){if(run)run.armed=false},
  leave(){run=null},
  reset(){run=null;best.clear()},
  victory(game,mode,score,expeditionArmed=false){
   const v=view();
   if(!v||!v.armed||v.finished||expeditionArmed||v.game!==game||v.circuit.mode!==mode||
      !Number.isSafeInteger(score)||score<0||score>100)return {advanced:false,finished:false};
   run.scores.push(score);run.armed=false;
   const next=view();
   if(next.finished)best.set(run.id,Math.max(best.get(run.id)??0,next.total));
   return {advanced:true,finished:next.finished,view:view()};
  }
 };
}
