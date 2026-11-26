# Chantier 01 — Stabilité (P0), lot 1
Base auditée : 27531f92dd29bca05fffb2ac20726dd22a1de977.

## Risques traités
- Le chargeur revenait silencieusement à une partie neuve si le JSON était illisible ; l'autosave de démarrage pouvait écraser les données originales.
- Deux onglets pouvaient écraser successivement la progression de l'autre.
- Une erreur de stockage n'était signalée que par un toast temporaire.

## Correctif
- Capture unique du snapshot local, contrôle de sa structure, protection de l'original en cas de problème, alerte persistante.
- Contrôle optimiste de la valeur stockée avant écriture, import, restauration et réinitialisation.
- Export des données brutes si récupération nécessaire ; les données brutes ne constituent pas une sauvegarde portable importable.
- La clé aetherium-save-v1 et le format portable version 1 sont inchangés.
- Le contrôle entre onglets n'est pas une transaction atomique inter-processus ; aucune protection contre la suppression des données du site par le navigateur.

## Validation
- Tests automatiques de corruption, compatibilité ancienne, quatre finitions, onglet obsolète, stockage inaccessible et quota, récupération explicite.
- Exécuter Verify static game et les tests Chromium de la CI avant fusion.
- Tester manuellement sur Safari iOS et Android Chrome, sauvegardes réelles avant/après, puis poursuivre audit performances, règles des boosters et affichage des finitions.
