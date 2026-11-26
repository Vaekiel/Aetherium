# Chantier 01 — lot 3 : vérification des probabilités

Aucune modification de l'économie. Le test porte sur les probabilités actuellement programmées.

| Rareté | Places 1–4 | Place 5 |
|---|---:|---:|
| Commune | 55 % | 0 % |
| Inhabituelle | 27 % | 65 % |
| Rare | 12 % | 25 % |
| Épique | 5 % | 8 % |
| Légendaire | 1 % | 2 % |

Finitions indépendantes de la rareté : Normale 93 %, Calligraphique 2 %, Chromatique 3 %, Holographique 2 %.

Probabilité théorique d'au moins une légendaire par booster : 1 - 0,99^4 × 0,98, soit environ 5,86 %.

Test reproductible : 100 000 boosters par édition (1,5 million de cartes au total), frontières des intervalles, cinq cartes par paquet, exclusivité des pools, accessibilité de toutes les cartes éligibles et répétitions uniquement si la rareté est épuisée. La Signature reste hors tirage.

Les observations chiffrées sont imprimées dans les logs de CI ; le test échoue si les écarts dépassent six écarts-types (avec plancher numérique) ou si une règle est violée. Il ne constitue pas un rééquilibrage.
