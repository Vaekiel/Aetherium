/* AETHERIUM 1.8.6 — Reward duplicates by the rarity actually drawn.
   Separate from crafting costs, pack odds and saved balances.
   Chromatic finish does not multiply the duplicate payout. */
export const DUPLICATE_DUST=Object.freeze({
  common:5,
  uncommon:7,
  rare:10,
  epic:15,
  legendary:25
});

export function duplicateDustReward(card){
  if(!card||!Object.prototype.hasOwnProperty.call(DUPLICATE_DUST,card.rarity))return 0;
  return DUPLICATE_DUST[card.rarity];
}
