# Spécifications d'Export Vidéo

Je veux qu'on travaille sur la fonction de rendu pour exporter les vidéos. Le but est de générer une vidéo qui va correspondre au temps définie par la zone de cut (timeline) par l'utilisateur et à la composition qu'il aura généré dans le canva vidéo. La vidéo générée doit etre conforme au contenu qui est à l'intérieur de l'overlay 9:16.

## Table des Matières
1. [Architecture Globale](#architecture-globale)
2. [Composants Principaux](#composants-principaux)
3. [Gestion des Ressources](#gestion-des-ressources)
4. [Implémentation Détaillée](#implémentation-détaillée)
5. [Plan de Développement](#plan-de-développement)

## Architecture Globale

### Vue d'Ensemble
L'export vidéo dans Autoclipr est géré par une architecture en trois couches :
1. **Controller d'Export** : Orchestration globale des étapes d'exportation.
2. **Renderer de Frames** : Génération des frames de la vidéo à partir des éléments visuels.
3. **Worker d'Export** : Utilisation de FFmpeg pour l'encodage et l'assemblage de la vidéo finale.

### Flux de Données
1. **Capture des frames vidéo** : Les frames sont capturées et prêtes à être traitées.
2. **Application des calques et effets** : Les calques dynamiques (textes, images, etc.) et effets sont appliqués.
3. **Traitement audio synchronisé** : L'audio est extrait, découpé, et synchronisé avec la vidéo.
4. **Encodage par chunks** : Le traitement de la vidéo se fait par segments (chunks), permettant d'optimiser les performances et d'éviter les surcharges de mémoire.
5. **Assemblage final** : Une fois tous les chunks encodés, la vidéo est assemblée en un fichier complet.

## Composants Principaux

### 1. **ExportController**
Le `ExportController` orchestre l'ensemble du processus d'exportation vidéo :
- Il gère la capture des frames.
- Il applique les effets et calques sur chaque frame.
- Il coordonne le traitement audio.
- Il divise la vidéo en segments (chunks) pour un encodage plus facile et une meilleure gestion de la mémoire.
- Il utilise un worker pour gérer le processus d'encodage.

### 2. **AudioProcessor**
L'`AudioProcessor` extrait et traite l'audio à partir du `videoElement` :
- Il extrait un segment audio à partir des temps `startTime` et `endTime`.
- L'audio est manipulé pour correspondre à la durée de la vidéo et peut être modifié en vitesse, si nécessaire.

### 3. **FrameRenderer**
Le `FrameRenderer` génère les frames de la vidéo :
- Il nettoie le canvas avant chaque rendu.
- Il applique les calques visuels et effets à chaque frame en fonction du temps.
- Il utilise un cache intelligent pour réutiliser les frames lorsque c'est possible, optimisant ainsi la performance.

## Gestion des Ressources

### Mémoire
- Un buffer circulaire est utilisé pour gérer les frames, réduisant ainsi l'empreinte mémoire.
- Le cache de calques est optimisé pour éviter une surcharge de mémoire en limitant sa taille et en supprimant les calques anciens.

### Performance
- Le traitement est effectué par petits segments de 1 seconde (chunks) pour mieux gérer les ressources.
- Des Web Workers sont utilisés pour effectuer l'encodage sans bloquer le thread principal, permettant ainsi une interface utilisateur réactive.
- Les calques statiques (invariables au fil du temps) sont stockés en cache pour éviter des recalculs inutiles.

## Implémentation Détaillée

### 1. **Gestion des Chunks**
L'exportation vidéo se fait en divisant la vidéo en segments (chunks) de durée fixe. Cela permet de traiter chaque segment indépendamment et de manière efficace en mémoire.

- Un chunk est défini par une durée et un intervalle de temps (par exemple, chaque chunk dure 1 seconde).

### 2. **Encodage FFmpeg**
Chaque chunk est ensuite encodé en utilisant FFmpeg, en combinant les frames générées et l'audio associé. FFmpeg est utilisé pour :
- Appliquer la compression vidéo et audio.
- Fusionner les différents chunks en un seul fichier de sortie.

### 3. **Cache des Calques**
Les calques visuels (textes, images, animations) sont souvent redessinés pendant le rendu vidéo. Pour améliorer les performances, un cache est utilisé pour éviter de redessiner les mêmes calques de manière répétitive.

- Le cache est limité en taille pour éviter une surcharge mémoire.
- Un mécanisme de nettoyage est utilisé pour supprimer les éléments anciens du cache.

## Plan de Développement

### Semaine 1 : Prototype de Base
- Développement de l'`ExportController`.
- Mise en place de la configuration de FFmpeg.wasm pour l'encodage vidéo.
- Tests de base pour l'export vidéo.

### Semaine 2 : Audio et Optimisation
- Intégration de l'`AudioProcessor` pour le traitement audio.
- Optimisation de la gestion de la mémoire (buffer circulaire, cache).
- Tests de performance et de synchronisation audio/vidéo.

### Semaine 3 : Animations et Tests
- Prise en charge des calques animés et effets visuels.
- Implémentation d'un cache intelligent pour les calques.
- Tests d'intégration pour s'assurer que l'ensemble du processus fonctionne correctement.

### Semaine 4 : Finalisation
- Développement de l'interface utilisateur d'export.
- Mise en place de la gestion des erreurs et des logs détaillés.
- Documentation et préparation pour la mise en production.

## Notes Techniques

### Résolutions Supportées
- **720p (1280x720)**
- **1080p (1920x1080)**
- **1440p (2560x1440)**

### Paramètres d'Encodage
- **Codec Vidéo** : H.264
- **Codec Audio** : AAC
- **Bitrate Audio** : 192k
- **CRF** : 23 (qualité)
- **Preset** : medium

### Limitations Connues
1. **Mémoire maximale** : 2GB par worker.
2. **Taille maximale de fichier** : 4GB.
3. **Durée maximale recommandée** : 30 minutes pour éviter les problèmes de mémoire et de traitement.

## Considérations Futures

### Améliorations Potentielles
1. **Support du GPU pour l'encodage** : Optimisation des performances avec l'utilisation du GPU.
2. **Export parallèle multi-workers** : Utilisation de plusieurs workers pour encoder plusieurs segments simultanément.
3. **Compression adaptative** : Ajustement automatique du bitrate en fonction de la qualité et des contraintes de mémoire.
4. **Preview en temps réel** : Permettre un aperçu en temps réel pendant l'exportation pour améliorer l'expérience utilisateur.

### Maintenance
- **Monitoring des performances** : Suivi des ressources consommées pendant l'export.
- **Logs détaillés** : Logs pour déboguer les erreurs et suivre l'état d'avancement.
- **Métriques d'utilisation** : Collecte de données sur l'utilisation pour améliorer les versions futures.

---

Cette spécification définit l'architecture, les composants clés et les objectifs de l'algorithme d'export vidéo pour Autoclipr. Elle permet de guider le développement de l'application tout en tenant compte des ressources disponibles et des performances nécessaires pour un export efficace et fluide.