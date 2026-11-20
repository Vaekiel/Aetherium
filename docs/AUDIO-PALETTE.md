# AETHERIUM — Palette sonore des Archives

**État : conception sonore et prototype jouable, fichiers IA non encore générés.**
Le prototype en place utilise une **synthèse Web Audio originale, exécutée localement**.
Il ne faut pas présenter les sons actuels comme générés par une IA.
Les morceaux créés par Stable Audio pourront les remplacer après génération
et vérification de la licence.

## Direction artistique

Fantasy nocturne, ancienne, mystérieuse mais douce. Verre, cristal,
parchemin, ruines, magie légère. Sonorité feutrée et chaleureuse.
**Sans voix, sans percussion insistante, sans mélodie envahissante.**
Les effets fréquents sont subtils. Pas de références à un artiste,
une chanson ou une bande originale existante.

## Ambiances IA à générer (Stable Audio)

Créer des boucles instrumentales sans couture, de 30 à 60 secondes,
no vocals, no drums, restrained dynamics, dark fantasy.
Normaliser et adoucir les transitions. Volume ambiant plus bas
que celui des effets.

| Nom du futur fichier | Écran | Prompt en anglais |
| --- | --- | --- |
| ambient-epreuves.ogg | Épreuves | Seamless game ambience in moonlit magical ruins, soft crystal drones, distant stone wind, faint resonant bells, intimate mysterious dark fantasy, gentle evolving atmosphere, no voice, no percussion, no melody |
| ambient-boosters.ogg | Boosters | Seamless subtle fantasy card unsealing room ambience, warm arcane hum, shimmer of crystalline glass and whispered paper texture, quiet anticipation, delicate low drone, no speech, no drums |
| ambient-codex.ogg | Codex | Seamless peaceful enchanted library ambience, old parchment and still air, soft warm glass harmonics, distant gentle wind through ancient shelves, contemplative midnight fantasy, no speech, no percussion |
| ambient-atelier.ogg | Atelier | Seamless cozy fantasy magical forge ambience, soft resonant metals, glowing crystals, low humming enchantments and gently crackling energy, calm workshop atmosphere, no hammering, no voice, no rhythm |
| ambient-expeditions.ogg | Expéditions | Seamless restrained fantasy exploration ambience, faint cavern draft, distant resonances of ancient glass and stone, muted mystical drone, slow quiet suspense, no vocals, no footsteps |
| ambient-chroniques.ogg | Chroniques | Seamless quiet fantasy archive hall ambience, warm sustained harp-like resonance, delicate crystalline overtones, ancient remembrance and quiet achievement, no rhythmic melody, no voice |

## Effets courts IA à générer

| Nom du futur fichier | Déclencheur | Durée visée | Prompt en anglais |
| --- | --- | --- | --- |
| ui-tap.ogg | Action discrète | 0,1–0,2 s | Tiny soft magical stone interface tap, short dry glass tick, warm and elegant, isolated sound effect |
| ui-select.ogg | Épreuve, difficulté, filtre, booster | 0,2–0,35 s | Short elegant arcane selection chime, two faint glass notes, silky attack, premium fantasy game UI |
| ui-page.ogg | Changement d'écran | 0,2–0,4 s | Soft single resonant archival bell as a fantasy menu page opens, quiet and precise |
| booster-unseal.ogg | Décellement | 0,6–1,0 s | Magical paper and foil card pack unsealing, gentle rising shimmer, soft crystalline burst, short tactile fantasy sound effect |
| reveal-normal.ogg | Carte classique | 0,3–0,5 s | Light transparent glass chime for revealing a collectible fantasy card, understated and short |
| reveal-rare.ogg | Carte rare | 0,5–0,7 s | Delicate crystalline double chime for a rare fantasy collectible discovery, tasteful shine, no fanfare |
| reveal-epic.ogg | Carte épique | 0,7–1,0 s | Elegant magical high-rarity card reveal, three layered crystal harmonics, restrained deep shimmer |
| reveal-legendary.ogg | Carte légendaire | 0,9–1,3 s | Memorable but soft legendary fantasy card reveal, ascending crystal tones over warm low resonance, graceful and not loud |
| reward.ogg | Couronnes gagnées | 0,5–0,9 s | Gentle victorious three-note glass reward chime for ancient fantasy puzzle completion, warm and understated |
| forge.ogg | Fabrication | 0,5–1,0 s | Tiny arcane forge sound, low enchanted metal resonance followed by a crystalline sparkle, gentle mysterious crafting |

## Intégration des fichiers IA

Placer les fichiers approuvés dans le dossier assets/audio. Prévoir des
versions audio légères, avec coupe sans clic et boucle vérifiée sur mobile.

Le prototype intégré dans src/audio.js permet déjà :
- activation et coupure globale (muet au lancement, sans lecture automatique),
- choix indépendants ambiance / effets et volume,
- mémorisation locale des préférences audio dans aetherium-audio-v1,
- six caractères d'ambiance selon la page,
- bruitages de navigation, sélection, décèlement, révélation et récompense,
- coupure automatique de l'ambiance dans un onglet masqué.

La prochaine étape de production IA reste : connecter un générateur,
générer les sons, sélectionner les versions, importer les vrais fichiers.
**Ne pas marquer les sons du prototype comme « IA »**.

## Licence et documentation

Suno Free (fin 2026) ne permet pas l'exploitation commerciale des créations.
Stable Audio inclut l'utilisation de morceaux et sons intégrés aux jeux sur
son offre gratuite, sous réserve des conditions applicables.

Sources officielles :
- https://help.suno.com/en/articles/9601601
- https://kb.stability.ai/knowledge-base/stable-audio-commerical-and-usage-licensing
- https://stableaudio.com/

Conserver pour chaque génération : fournisseur, modèle, prompt, date,
plan utilisé, fichier source, preuve de licence et droits d'intégration.
