<h1 align="center">✦ AETHERIUM</h1>
<p align="center"><em>Chroniques des Arcanes · Collectionne les légendes, révèle les archives.</em></p>
<p align="center">
  <a href="https://vaekiel.github.io/Aetherium/"><img src="https://img.shields.io/badge/%E2%96%B6_JOUER-EN_LIGNE-b89af0?style=for-the-badge&labelColor=15162a" alt="Jouer à AETHERIUM dans le navigateur"></a>
</p>
<p align="center"><strong>Jeu gratuit · PC, tablette et smartphone · aucune installation</strong></p>

> **Mise en ligne :** après activation de GitHub Pages dans `Settings → Pages → Build and deployment → Source : GitHub Actions`, la publication est automatisée. Le lien ci-dessus devient utilisable lorsque le premier déploiement est terminé.

---

Jeu de collection **100 % gratuit**, jouable dans un navigateur et conçu pour Noctiloom Studio.

**Boucle de jeu :** réussir des mini-jeux → gagner des Couronnes → ouvrir des boosters → compléter le Codex → découvrir des cartes rares et Shiny.

## ▶ Jouer en ligne

**[▶ Lancer AETHERIUM](https://vaekiel.github.io/Aetherium/)** — fonctionne dans un navigateur moderne sur ordinateur, tablette et téléphone. La sauvegarde est locale à chaque navigateur.

### Jouer en local

Aucun package à installer. Le jeu utilise les modules JavaScript natifs et doit être servi par un serveur HTTP local :

```bash
python3 -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000`.

Le workflow `.github/workflows/pages.yml` valide les modules JavaScript et publie automatiquement la racine du dépôt sur GitHub Pages à chaque push sur `main`.

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

**Important :** l'interface utilise à présent un décor et 12 illustrations de référence extraits de la maquette de collection validée (`assets/scenery/` et `assets/cards/`). **Ce sont des placeholders de direction artistique** : les 24 cartes ne disposent pas encore d'illustrations finales individuelles. L'atlas de référence est volontairement compressé ; pour atteindre le niveau pixel art HD de la maquette, il faudra produire puis intégrer des illustrations distinctes en résolution suffisante. `src/art.js` reste disponible comme rendu de secours.

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
