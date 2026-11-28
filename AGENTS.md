# Consignes pour les agents IA (ChatGPT, Codex et autres)

Ce dépôt est publié par **Noctiloom Studio**. Lisez ce fichier avant toute modification.

## Plateforme Noctiloom Studio

Aetherium est installable (PWA) et publié dans la boutique du studio. Les règles à respecter, les problèmes connus et les optimisations possibles sont dans [`docs/NOCTILOOM-PLATEFORME.md`](docs/NOCTILOOM-PLATEFORME.md).

En résumé :

- Ne modifiez ni ne supprimez `sw.js`, `noctiloom-pwa.js` et `manifest.webmanifest`.
- Dans `index.html`, gardez le lien vers le manifest et la balise `<script src="./noctiloom-pwa.js" defer></script>`.
- N'utilisez que des chemins relatifs.
- Ne changez pas les clés de sauvegarde sans migration.
- Commentaires, messages de commit et documentation en français.
