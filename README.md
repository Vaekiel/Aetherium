# ✦ AETHERIUM — Chroniques des Arcanes

Jeu de collection **100 % gratuit**, jouable dans un navigateur et conçu pour Noctiloom Studio.

**Boucle de jeu :** réussir des mini-jeux → gagner des Couronnes → ouvrir des boosters → compléter le Codex → découvrir des cartes rares et Shiny.

## Jouer en local

Aucun package à installer. Le jeu utilise les modules JavaScript natifs et doit être servi par un serveur HTTP local :

```bash
python3 -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000`.

Pour un hébergement statique (GitHub Pages, Netlify ou Vercel), publier **la racine du dépôt** sans étape de build.

## Fonctionnalités de la première version

- Interface française, responsive, légère, avec quatre sections : Jouer, Boosters, Collection, Succès.
- Cinq mini-jeux : chemin runique, mémoire, serrure numérique, fouilles à pièges et laboratoire.
- Progression libre sans limite d'énergie ; récompenses attribuées aux défis réussis.
- Booster standard de cinq cartes pour 100 Couronnes, avec garantie d'une Inhabituelle au minimum.
- 24 cartes réparties en cinq raretés ; variantes Shiny et Éclats de doublons.
- Recherche et filtres dans la collection ; panneau permettant d'admirer la carte agrandie.
- Sauvegarde locale automatique via `localStorage` ; contrôle de validation des données chargées.
- Succès liés à la progression.

## Direction artistique

**Référence approuvée :** maquette finale AETHERIUM (collection au crépuscule). Fond bleu nuit / violet, accents or et lavande discrets, illustrations pixel art HD détaillées, navigation sans surcharge.

**Important :** les illustrations incluses à ce stade sont des *placeholders procéduraux*, uniques mais encore loin du niveau HD définitif. Elles sont regroupées dans `src/art.js` et pourront être remplacées par des sprites conçus individuellement, sans changer la logique du jeu.

## Organisation

```text
index.html        Interface / point d'entrée
src/main.js       Navigation, sauvegarde, mini-jeux, collection, boutique
src/data.js       Catalogue de cartes et probabilités des boosters
src/art.js        Illustrations temporaires en pixel art
src/style.css     Design responsive
```

## Probabilités des boosters

| Rareté | Tirage classique |
| --- | ---: |
| Commune | 55 % |
| Inhabituelle | 27 % |
| Rare | 12 % |
| Épique | 5 % |
| Légendaire | 1 % |

La cinquième carte est garantie **Inhabituelle ou mieux** (65 % / 25 % / 8 % / 2 %). Chaque carte a **5 %** de chances d'être Shiny. Ces taux sont indépendants de la collection possédée ; les doublons donnent 5 Éclats.

## Suite du développement

Créer les illustrations de cartes définitives, approfondir les mini-jeux, ajouter des albums et objectifs de collection, rendre les Éclats utilisables pour fabriquer des cartes, ajouter des effets d'ouverture et renforcer les tests automatisés.

Pas de compte, pas de cash shop, pas de données personnelles envoyées à un serveur.

## Licence

**AETHERIUM est un projet propriétaire — Tous droits réservés.** Le jeu est gratuit pour les joueurs, mais la reproduction, la redistribution, la modification ou l'exploitation du code et des ressources sans autorisation écrite préalable ne sont pas permises, sous réserve des exceptions légales et des éventuelles licences de tiers. Voir [LICENSE](LICENSE).
