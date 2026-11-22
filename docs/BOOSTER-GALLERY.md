# Galerie des Boosters — Aetherium

La vue Boosters utilise **un seul gabarit d'emballage** en CSS (`src/booster-gallery.css`).
Chaque paquet conserve un paysage différent en **pixel art HD**, découpé dans l'image de paquet déjà approuvée. Le cadre, les plis, le sceau, la typographie et les proportions restent identiques.

## Ajouter un booster publié

1. Ajouter dans `index.html` une `button.booster-choice` au sein de `#booster-gallery`, avec `data-booster`, `data-season` et `data-season-title`. L'intérieur doit reprendre `.booster-tile-pack`, `.pack-scene > img` et `.booster-tile-caption`. Mettre l'illustration HD du thème dans l'image.
2. La barre `#booster-season-tabs` et le filtrage sont construits à partir des saisons des tuiles **publiées**. Il n'existe pas d'onglet pour les saisons futures non disponibles.
3. Ajouter la classe/l'image correspondante à `#booster-pack` et son activation dans `selectBooster` dans `src/main.js` ; maintenir le même emballage CSS.
4. Brancher le tirage sur la fonction de la nouvelle collection dans `openOriginesBooster`. Le prix et l'algorithme des cartes restent du côté du moteur, et la sauvegarde **doit intervenir avant toute animation**.
5. Vérifier le rendu et le déclenchement sur mobile, tablette, PC, clavier, ainsi que les tests de régression.

Ne jamais utiliser comme vignette une carte collectionnable non possédée ou une image révélant un secret narratif. Le seul élément différent entre les emballages est **l'illustration du paysage** et le **nom** du booster, pas le cadre.

La fiche d'ouverture est un `<dialog>` natif, ouvert par la tuile. Elle utilise les contrôles d'achat et de révélation existants. Une fermeture durant l'ouverture finalise le récapitulatif **sans nouveau tirage ni dépense**, puis ferme la fiche. La sauvegarde reste `aetherium-save-v1`.
