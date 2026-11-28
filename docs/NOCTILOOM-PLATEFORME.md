# Aetherium sur la plateforme Noctiloom Studio

Aetherium est publié dans la boutique de **Noctiloom Studio** : https://noctiloom-studio.github.io/Aetherium/

Le fonctionnement complet de la plateforme est décrit dans le dépôt de la boutique :
https://github.com/Noctiloom-Studio/Noctiloom-Studio.github.io/blob/main/docs/FONCTIONNEMENT.md

## Règles à respecter dans ce dépôt

1. **Fichiers d'installation : ne pas les modifier ni les supprimer.**
   - `sw.js` : mode hors-ligne. Seule `VERSION` peut changer (passer à `v2`, `v3`…) après un gros changement de fichiers. La constante `JEU` reste `aetherium`.
   - `noctiloom-pwa.js` : bouton « Installer le jeu ».
   - `manifest.webmanifest` et `assets/icons/aetherium-app-*.png` : identité de l'application installée.
2. **`index.html`** : garder la ligne `<script src="./noctiloom-pwa.js" defer></script>` avant `</body>` et le lien vers le manifest dans `<head>`.
3. **Chemins relatifs uniquement** (`./src/main.js`, jamais `/src/main.js`) : le jeu est servi sous `/Aetherium/`.
4. **Sauvegardes** : elles sont stockées dans le navigateur et liées à l'adresse du site. Ne jamais changer les clés de sauvegarde sans migration.
5. **Publication** : le workflow `pages.yml` publie tout le dépôt à chaque envoi sur `main`. Aucun fichier à lister.
6. **Langue** : commentaires de code, messages de commit et documentation en français.

## Problèmes constatés

- **Test « Verify static game » en échec depuis le 26 novembre 2026** (merge `dc00506`, chantier « saisons », dernier succès `2a8c002`). L'étape en échec est « Exercise the booster gallery in real Chromium » (`verify.yml`) : elle enchaîne quatre tests de navigateur (`booster-browser-smoke`, `trial-responsive-browser-smoke`, `chromatic-browser-smoke`, `onboarding-browser-smoke`). Les logs détaillés sont visibles dans l'onglet Actions du dépôt. À corriger : trouver lequel des quatre tests échoue et pourquoi. Ce n'est pas lié à la plateforme, et la publication du jeu n'est pas bloquée.
- **Conflit de casse** : `docs/ECONOMY-AUDIT.md` et `docs/economy-audit.md` coexistent dans le dépôt. Windows n'en garde qu'un, ce qui provoque un faux fichier modifié. Renommer l'un des deux (par exemple `economy-audit-2.md`) puis supprimer le doublon si le contenu est identique.
- **Anciennes adresses** : `vaekiel.github.io/Aetherium` ne fonctionne plus. Les liens du `README.md` ont été mis à jour.

## Optimisations possibles

- Précharger les fichiers essentiels dans `sw.js` pour un mode hors-ligne complet dès l'installation (aujourd'hui le cache se remplit au fil du jeu).
- Monter la version des actions GitHub (`actions/checkout`, `actions/setup-node`) : Node.js 20 est signalé comme obsolète.
- Vérifier que l'export de sauvegarde (`save-backup`) est bien mis en avant pour les joueurs qui changent d'adresse ou d'appareil.
