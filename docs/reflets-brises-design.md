# AETHERIUM — Saison I, Partie II : Les Reflets brisés

> **État : conception / non publiée.** Ce fichier sert de bible interne de création. Le dépôt GitHub est public : les lecteurs du code peuvent en consulter les révélations. Rien ici ne débloque de cartes ou de boosters dans le jeu.

## Promesse

> **Dans les Marches de Verre, les miroirs n’obéissent plus.**

Après la découverte des premières archives, les voyageurs remarquent que leurs reflets tardent à les suivre. Des chemins se prolongent de l’autre côté des vitres, les souvenirs ne coïncident plus, et des êtres ressemblant aux disparus frappent doucement contre le verre. On les appelle les Dédoublés.

Le **Revers** n’est ni une dimension maléfique, ni un simple monde parallèle. C’est la mémoire des possibles abandonnés. Certains Dédoublés veulent retrouver une place parmi les vivants ; d’autres protègent les souvenirs qui les ont engendrés. La collection pose une question : **une vie qui n’a pas eu lieu mérite-t-elle d’être sauvée ?**

Cette partie introduit le mystère de la Fracture primordiale sans résoudre le dernier secret des Marches : la révélation complète appartient à la Partie III, **Au-delà du Verre**.

## Progression narrative du set (24 cartes)

| Bloc | Numéros | Raretés | Expérience recherchée |
|---|---|---|---|
| I — L'étrangeté | 25–30 | 6 Communes | La nature et les objets du quotidien se dédoublent |
| II — Les rencontres | 31–36 | 6 Inhabituelles | Les habitants du Revers révèlent leurs intentions |
| III — Les conséquences | 37–42 | 6 Rares | Les choix et les souvenirs deviennent des forces actives |
| IV — Le palais | 43–45 | 3 Épiques | Les voyageurs atteignent le cœur des possibles perdus |
| V — La fracture | 46–48 | 3 Légendaires | La vérité ouvre un mystère plus vaste |

La liste canonique des **24 noms, types, raretés, fragments de lore et briefs d’illustration** se trouve dans `src/reflets-brises-catalog.js`. Ne pas copier des versions divergentes dans `src/data.js` avant la sortie.

## Direction artistique — crépuscule brisé

**Continuité.** Conserver l’identité d’Aetherium : pixel art HD très détaillé, contours nets, tonalité fantasy élégante, composition de carte verticale, ombres bleu nuit. Les cadres et les attributs de rareté sont gérés par l’interface existante, pas dessinés dans l’illustration.

**Différence avec Origines.** Origines présente des figures isolées dans des lieux lisibles. Les Reflets brisés privilégient les perspectives dédoublées, les lignes de fuite contradictoires, la matière vitreuse fissurée et les silhouettes dont l’ombre raconte une autre histoire. Éviter l’effet « même carte avec un filtre violet ».

**Palette principale :**

| Usage | Teinte | Hex |
|---|---|---|
| Nuits et arrière-plans | Indigo profond | `#151729` |
| Architecture et vêtements | Violet de faille | `#383253` |
| Fissures et passages | Turquoise vitreux | `#78bdb9` |
| Reflets et silhouettes | Lavande spectrale | `#c4addc` |
| Lumière et surface | Blanc de verre | `#dbe8e8` |
| Accent légendaire uniquement | Or antique | `#e5c68c` |

**Cohérence des 24 images :**
- Illustration verticale au **même rapport de forme que les 24 cartes Origines** ; grande version HD puis miniature distincte, sans détérioration de l’image.
- Un **sujet principal identifiable en vignette** (silhouette, arme, créature ou phénomène), accompagné de détails en deuxième lecture.
- Éclairage localisé (turquoise/lavande) et fond plus sombre ; prévoir une lecture correcte dans le Codex sur mobile.
- Pas de texte, noms de carte, interface, badge de rareté, watermark ni bordure peinte dans l’art source.
- Une carte Chromatique reprend exactement la même illustration : **l’effet de finition reste celui du CSS existant**.

**Repère visuel pour le futur booster.** Pochette sombre presque noir-violet, un large miroir brisé en diagonale laissant apercevoir un paysage inversé, sceau argenté avec une fêlure centrale et peu d’accents lumineux. Conserver la chorégraphie d’ouverture du booster Origines, mais adapter le décor et la façade plutôt que recréer une deuxième logique d’achat.

## Contrat technique — progression sans régression

1. Les IDs **25 à 48 sont réservés** à Reflets brisés. Les IDs 1 à 24 d’Origines ne changent jamais.
2. Le catalogue de conception **n’est pas importé** par le jeu : les tirages, la Forge, le Codex jouable, les monnaies et les sauvegardes doivent continuer à ne connaître que les 24 cartes publiées.
3. La collection reste `released:false` dans `src/seasons.js` tant que les 24 images HD, leurs miniatures, leurs entrées `src/card-art.js`, leur booster et tous les tests ne sont pas prêts.
4. À la publication, ajouter un **pool de boosters par collection**. Le booster Origines doit continuer à ne tirer que les IDs 1–24 ; Reflets brisés doit tirer uniquement 25–48, avec une garantie de rareté équivalente. Ne pas mélanger les deux pools.
5. Le prix de 100 Couronnes, la probabilité Chromatique de 3 %, et les valeurs d’Éclats / Forge de la version 1.8.6 restent inchangés sauf décision d’équilibrage explicite.
6. Les sauvegardes anciennes restent compatibles. Après extension des IDs valides, vérifier l’export et l’import des cartes 25–48 **avant** ouverture au public.
7. Les récompenses de progression propres à Reflets brisés ne doivent pas être disponibles avant la publication.

## Prochain jalon artistique

Réaliser **une seule illustration pilote** : `#38 Cerf sans reflet`, rare. Le contraste du cerf lumineux et de l’eau incapable de le refléter constitue un test facile à évaluer sur téléphone. Vérifier d’abord l’illustration au vrai format de carte, puis produire les 23 autres dans la même grammaire visuelle.

Ne pas créer de statistiques, de cartes dans le jeu, de faux fichiers d’images ou de booster jouable avant validation de ce jalon.
