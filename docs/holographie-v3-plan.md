# AETHERIUM — Plan de fabrication holographique V3

**Carte pilote :** #23 — Vyrath, Fléau Céleste (Origines, Créature, Légendaire)  
**Statut :** cahier des charges validé pour fabrication ; les calques graphiques réels restent à produire.  
**Périmètre :** une seule carte de démonstration, puis inspection Chromatique si les tests sont concluants.  
**Priorités :** pixel art HD intact, relief visible, confort tactile, performance, zéro modification économique.

## 1. Point de départ réel (novembre 2026)

- Image originale approuvée : `assets/cards/vyrath-fleau-celeste.webp`.
- Démo technique autonome : `holographie.html` (V2).
- La V2 affiche **deux copies d'une même illustration**, décalées et masquées radialement ; elle n'a donc **pas encore** de détourage réel du dragon.
- Le jeu affiche ses illustrations dans `src/main.js` via `applyCardIllustration` (`src/card-art.js`).
- L'inspection utilise `.inspector-art-shell`, produite par `inspect(c, shiny, scroll, chromaticPreview)`.
- Les Chromatiques sont des **finitions indépendantes des raretés** (`src/chromatic.css` et sauvegarde `state.shiny`). Ne pas rebaptiser la rareté, modifier son taux ou ajouter une propriété persistée.

## 2. Direction graphique : vrais plans indépendants

Conserver l'illustration originale comme référence pour le placement et la cohérence du pixel art HD. Fabriquer cinq ressources alignées sur **le même canevas, la même définition et le même cadrage** ; ne pas interpoler en ajoutant du flou.

| Plan | Fichier prévu | Contenu | Déplacement maximum indicatif |
|---|---|---|---|
| 0 — fond | `assets/cards/holo/vyrath/background.webp` | Ciel, horizon, lumière lointaine, décor reconstruit **derrière** le dragon | ±3 px |
| 1 — intermédiaire | `assets/cards/holo/vyrath/midground.webp` | Ruines, rochers, reliefs secondaires détourés, alpha transparent | ±7 px |
| 2 — sujet | `assets/cards/holo/vyrath/subject.webp` | Dragon détouré avec bords nets et alpha propre ; aucun morceau de l'arrière-plan | ±13 px |
| 3 — magie | `assets/cards/holo/vyrath/magic.webp` | Cristaux, runes, étincelles et brumes isolées, alpha transparent | ±17 px |
| 4 — film holo | CSS sur le conteneur, **pas dans le fichier d'art** | Réflexion spectrale dirigée, irisations masquées, liseré prismatique | Suit le point de contact |

**Contrainte fondamentale :** la scène ne doit jamais laisser apparaître un trou derrière un déplacement du dragon. Il faut donc **reconstituer le décor occulté** sous le sujet. Des masques radiaux ou deux images identiques ne suffisent pas. Préserver la silhouette du dragon et les caractéristiques des pixels d'origine ; ne pas régénérer la carte entière en changeant le personnage.

**Format conseillé :** WebP RGBA pour les calques finaux (PNG de travail si nécessaire), en gardant le WebP original comme fallback. Vérifier dimensions et alpha avant publication. Une marge de décor cachée permet les légers décalages sans faire apparaître les limites.

## 3. Comportement et rendu

- Carte physique : rotation générale limitée à ±10° en X et Y, ombre projetée légèrement déplacée et bordure lumineuse plus forte côté lumière.
- Parallaxe : déplacement progressif des plans, dans l'ordre ci-dessus ; davantage de profondeur visuelle par différence de vitesse, **sans déformation ni flou des sprites**.
- Holographie : film irisé léger, effet de lumière qui suit les coordonnées du pointeur, zones brillantes distinctes des zones sombres ; éviter le voile arc-en-ciel permanent sur toute l'image.
- Magie : de très rares scintillements localisés, éventuellement une boucle de 2–3 secondes sur la seule carte inspectée ; ne pas animer l'ensemble du Codex.
- Réglages du prototype : intensité holographique 0–100 %, profondeur 0–100 %, recentrage. Les valeurs n'entrent pas dans la sauvegarde du jeu.
- Respect de `prefers-reduced-motion` : suppression des rotations et de la parallaxe, carte statique très lisible, finition Chromatique perceptible sans mouvement.
- Interactions : souris sur PC ; geste tactile sur mobile/tablette ; gyroscope **facultatif** après consentement explicite lorsqu'il est disponible ; clavier en solution d'accessibilité.
- Appliquer les mises à jour via `requestAnimationFrame`, faire évoluer principalement `transform` et les variables CSS ; suspendre les calculs inutiles quand la carte est masquée.

## 4. Architecture technique prévue (sans casser l'existant)

**Phase A — assets.** Détourer Vyrath et créer les quatre calques graphiques. Comparer la superposition statique à l'original pixel art HD. Rejeter les bordures floues ou les lacunes dans le ciel.

**Phase B — composant de démo isolée.** Remplacer dans `holographie.html` les deux images dupliquées par les vrais calques. Conserver un `<img>` de secours pointant vers le fichier d'origine ; s'il manque un calque, revenir à l'image normale. Profils « complet », « léger » et « statique » sélectionnables selon préférences et capacités.

**Phase C — validation croisée.** Vérifier Chrome/Edge/Firefox sur PC, Safari iOS, Chrome Android, tablet et petits écrans. Tester souris, tactile vertical, clavier, permission du capteur, retour d'arrière-plan, orientation écran, mode réduction de mouvement. Vérifier que le texte et la navigation restent cliquables.

**Phase D — intégration progressive.** Créer un composant réutilisable (par exemple `src/holo-card.js` + `src/holo-card.css`), appelé **uniquement** dans `inspect()` pour la carte #23 en mode Chromatique/aperçu. Toutes les autres cartes utilisent `applyCardIllustration()` sans changement. Réserver une version CSS simplifiée aux miniatures si la V3 est validée. Aucun changement initial au tirage ni à la révélation du booster.

**Phase E — extension.** Après validation, rendre les calques configurables par ID, sans multiplier les traitements par carte. Le format ne doit jamais forcer toutes les cartes à disposer de calques 3D.

## 5. Critères d'acceptation

1. Le dragon paraît clairement **devant** un décor reconstitué, même lors d'une inclinaison maximale.
2. Le pixel art HD reste net ; pas de contours mangés, ghosting ou artifices de doublage visibles.
3. La carte reste lisible avec effet à 0 %, et sans permission des capteurs.
4. Le parcours Codex → carte → inspection → retour fonctionne sur mobile et PC.
5. Aucune modification de `state.owned`, `state.shiny`, des probabilités, des sauvegardes ni du contenu des boosters.
6. Les appareils peu puissants obtiennent un fallback fluide ; pas de superposition d'effets animés sur 20 cartes à la fois.
7. Les vérifications GitHub Actions et le déploiement GitHub Pages passent avant activation dans le jeu.

## 6. Ordre de réalisation retenu

1. **Fabriquer les 4 vrais calques** de Vyrath, vérifier les silhouettes et la reconstruction du fond.
2. **Mettre à jour la page de démo** avec un rendu multi-plans et comparer la V2 à la V3.
3. **Tester sur appareil réel**, ajuster profondeur et taux de reflets avec les retours.
4. **Ajouter le composant à l'inspecteur** Chromatique en gardant l'original comme fallback.
5. Envisager l'extension aux autres cartes **après** validation esthétique et performance.

La réalisation n'est **pas achevée** tant que les quatre calques indépendants ne sont pas livrés et testés. Le présent document est un plan technique, pas une certification de rendu V3.
