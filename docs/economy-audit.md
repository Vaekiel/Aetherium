# AETHERIUM — Audit économique, étape 1 : variété des boosters

*19 novembre 2026 — Saison I, Origines et Les Reflets brisés.*

## Constats sur les règles actuelles

| Mécanique | Valeur |
| --- | --- |
| Paquet | 5 cartes / 100 Couronnes |
| Victoire mini-jeu | 35, 45, 50, 65 ou 60 Couronnes avant bonus de difficulté |
| Raretés des quatre premiers tirages | 55 % Commune, 27 % Inhabituelle, 12 % Rare, 5 % Épique, 1 % Légendaire |
| Cinquième tirage | Inhabituelle garantie (65 % Inhabituelle, 25 % Rare, 8 % Épique, 2 % Légendaire) |
| Finition Chromatique | 3 % indépendamment pour chaque carte |
| Éclats par doublon | 5 / 7 / 10 / 15 / 25 (Commune à Légendaire) |
| Forge | 20 / 45 / 100 / 220 / 450 Éclats (Commune à Légendaire) |

Sur un paquet entièrement constitué de **doublons déjà possédés**, le gain théorique moyen est de **36,11 Éclats**. Une Légendaire ciblée représente en moyenne ~50,4 boosters de tirages *sans la Forge* ; l'atelier de fabrication joue donc un rôle important contre la malchance. Il serait prématuré de réduire massivement les coûts de la Forge ou d'augmenter les taux légendaires sans retour de joueurs.

## Premier défaut mesuré : répétitions dans un même sachet

Simulation reproductible de 15 000 premiers boosters, avec les mêmes taux mais avant protection :

- Environ **45 %** des premiers boosters contiennent au moins une répétition d'une carte dans le même paquet.
- En moyenne, un premier booster présente environ **4,48 cartes différentes** sur cinq.
- Cette frustration apparaît dès l'ouverture du tout premier paquet, sans même posséder de collection.

## Correction livrée

Le tirage conserve les **mêmes probabilités de rareté** et les **mêmes 3 % de Chromatiques**. Pour chaque emplacement, il privilégie une carte **non encore présente dans ce paquet, de la même rareté**.

Si toutes les cartes de cette rareté sont déjà dans le paquet (par exemple cinq tirages Légendaires, alors que la collection n'en possède que trois), un doublon reste possible. Cela évite de modifier artificiellement la rareté attribuée par le tirage et garantit qu'aucune Légendaire n'est supprimée ou ajoutée.

La protection est **interne au paquet uniquement** : une carte déjà présente dans la collection du joueur peut toujours réapparaître et rapporter normalement des Éclats. Aucun suivi supplémentaire n'est ajouté aux sauvegardes. Les deux éditions utilisent le même algorithme, chacune limitée à ses 24 cartes.

## Périmètre préservé et vérifications

- Achat unique de 100 Couronnes, cinq cartes, animations et sauvegarde avant ouverture.
- Poids des raretés, dernière carte garantie et taux Chromatique.
- Récompenses de doublons, Forge, Couronnes des cinq mini-jeux, paliers narratifs.
- Compatibilité des sauvegardes locales et de leurs exports/imports.

Le test `tests/booster-variety-smoke.mjs` vérifie la diversité intra-paquet, les cas d'épuisement d'une rareté, l'absence de mélange entre éditions et les distributions des tirages sur 12 000 boosters simulés.

## Étape 2 — Maîtrise, Fouilles et Forge

**Audit du mode Maîtrise.** Avant cette correction, une victoire difficile ne rapportait que 10 Couronnes supplémentaires par rapport au même mini-jeu en Aventure. Les cinq jeux sont pourtant plus contraignants (moins d'erreurs autorisées, tentative réduite, fouilles plus longues, trois ingrédients en alchimie). Le bonus de victoire Maîtrise passe à **15 Couronnes** : cinq de plus qu'avant, sans multiplier les gains ni supprimer les bonus de précision.

**Score des Fouilles interdites.** L'ancienne fonction renvoyait toujours **80/100**, quelle que soit l'utilisation des sondes : le bonus de précision de cinq Couronnes n'était jamais accessible. La nouvelle règle : **100 points - 10 points par sonde effectivement demandée**, avec plancher à zéro. Une victoire sans sonde ou avec une seule sonde donne le bonus de précision ordinaire. La première case sûre annoncée au départ ne compte pas comme sonde demandée. Les médailles et les records continuent d'utiliser le nombre de sondes réellement demandées.

| Situation | Avant | Après |
| --- | ---: | ---: |
| Victoire en Maîtrise, chemin runique sans erreur | 50 Couronnes | 55 Couronnes |
| Victoire en Maîtrise, Fouilles avec deux sondes | 75 Couronnes | 80 Couronnes |
| Victoire en Maîtrise, Fouilles sans sonde | 75 Couronnes | 85 Couronnes |
| Victoire en Aventure, Fouilles sans sonde | 65 Couronnes | 70 Couronnes |

**Rôle de la Forge.** Un paquet entièrement composé de doublons rapporte en moyenne 36,11 Éclats. Une Légendaire ciblée à 450 Éclats représente environ **12,46 boosters intégralement doublons**, et davantage pendant les premières phases de découverte. Les coûts restent donc inchangés : la Forge garantit une issue à la malchance, sans remplacer la recherche de cartes rares dans les boosters. L'achat, les doubles et les récompenses narratives n'ont pas changé.

Les fonctions `trialScore` et `trialReward` restent pures, la progression garde la même clé locale et les nouvelles règles sont vérifiées dans `tests/mastery-economy-smoke.mjs`. **Aucun déplacement de ressources ni changement de format de sauvegarde**.

## Prochain contrôle recommandé

Recueillir quelques essais réels sur les cinq mini-jeux (temps moyen, échec en mode Maîtrise, réussites sans sonde), puis réévaluer les gains par minute plutôt que de modifier les probabilités des cartes sans données.
