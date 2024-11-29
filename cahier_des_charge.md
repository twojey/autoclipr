# Introduction
Autoclipr est une application web très simple qui utilise le navigateur et les ressources locales de l'utilisateur pour l'aider à éditer une de ses vidéos. 

# Import de video
+ L'application permet dans un premier temps d'importer une vidéo depuis son ordinateur. Ensuite on doit pouvoir avoir un cadre où on peut voir la preview de la vidéo en temps réel. 
+ L'utilisateur peut importer une vidéo de toute longueur. Il a juste la restriction de devoir exporter un clip d'une duée maximale de 2 minutes
+ On doit pouvoir utiliser la barre d'espace pour mettre la video en play / pause

# Interface
L'inferface d'Autoclipr est la suivante :
+ Une barre header en haut de la page
++ Le header a à gauche un logo, le nom autoclipr clicable qui redirige vers l'écran d'accueil et à droite un bouton qui est le centre de notification, puis un bouton qui est le switch de theme
## L'ecran d'accueil contient 
++ un titre posé sur le background "Create clips in seconds for free"
++ Un encadré qui permet d'importer un fichier video qui réagit au glisser-déposer de fichier et un bouton dans l'encadré qui permet aussi d'importer une vidéo
## La page d'édition de video
++ La page d'édition de video contient un encadré général
++ On a un canva video qui sert a prévisualiser l'état de la video
++ On a un bouton overlay "export clip" en haut a droite du canva video
++ On a une section en dessous du canva video qui est la sections de controle
++ La section de controle contient tous les boutons de controles ainsi que la timeline qui permet d'éditer un clip
## Exporter un clip ouvre un modal pour l'export
++ Le modal export contient 3 options avec une option "rapide" préselectionnée
++ L'utilisateur doit selectioner pour cliquer sur un bouton pour lancer l'export
++ Le modal a un bouton retour également
++ Pendant l'export le modal affiche une barre de progression et un bouton pour annuler l'export en cours
++ Une fois l'export terminé cela doit afficher une preview de la video



# Edition video
On doit définir une largeur maximale pour la section d'édition de video.
Quand on arrive dans l'interface d'édition, la vidéo est en pause et l'utilisateur dispose d'une timeline qui lui permet de mettre play/pause et de faire un cut dans la video en utilisant la timeline.
On doit pouvoir utiliser la barre d'espace pour mettre la video en play / pause

# Timeline
+ La timeline doit disposer d'un bouton "play / pause".
+ La timeline doit avoir une borne gauche et une borne droite avec une zone centrale. 
+ Un clip doit avoir une durée maximale de 2 minutes.
+ La zone de cut a une valeur initiale de 30 secondes.
+ La timeline est composée de 2 barres latérales "fines" avec un rectangle "court et épais" chacune.
+ La timeline doit avoir une tete de lecture

# Comportement de la timeline
+ On doit pouvoir "tirer" les bornes pour allonger ou raccourcir la durée du clip avec un clic prolongé sur une des bornes. 
+ Quand on tire une borne, cela amene la tete de lecture a la meme position que la borne qui bouge
+ Quand on tire une borne, la video doit se mettre en pause et reprendre ensuite son etat initial
+ On doit pouvoir faire glisser la fenetre du cut dans la timeline. 
+ On doit pouvoir faire "glisser" la fenetre de la timeline avec un clic prolongé sur la zone centrale.
+ Quand on fait glisser la zone de cut, cela amene la tete de lecture sur la borne gauche du "début"
+ On doit pouvoir faire un clic pour déplacer la tete de lecture dans la timeline, ce clic est déplace la zone de cut.
+ Si le clic qui déplace la tete de lecture est a l'interieur de la zone de cut, cela ne doit pas déplacer la zone de cut

# Echelle et timeline
On doit pouvoir modifier l'échelle du temps de la timeline avec un bouton de zoom. Le but est de pouvoir faire varier la taille de la zone de cut 

# Controls
La page d'édition doit posséder 
- un bouton d'export
- Le bouton export doit toujours mettre la vidéo en pause
- Un bouton pause / play qui apparait au hover du canva de la video preview
- Un controle pour le zoom de la time line
- Un bouton play / pause
- Une timeline avec une zone de cut réglable
- Le temps actuel de la vidéo
- Le temps total de la vidéo
- La durée actuelle de la zone de cut

# Export de clip
Une fois que l'utilisateur a trouver où faire son cut, il doit pouvoir explorter son clip.
Quand il exporte son clip, cela doit ouvrir une nouvelle fenetre qui va lui générer un fichier video correspondant. On doit pouvoir lire le fichier video, reveneir sur l'ecran d'édition ou télécharger le fichier video dans cet ecran.
Le lecteur video dans la fenetre modale doit avoir une hauteur maximale
Le lecteure video doit etre au format de la video (9:16)

Quand on export la vidéo on doit avoir un modal qui apparait pour demander à l'utilisateur quel qualité d'export il choix et il doit avoir 3 choix avec 720p le choix de basse qualité

# Crop & Format
+ La vidéo éditée doit toujours etre a l'intérieur du canva video
+ On doit avoir un overlay au format 9:16 qui a initialement 80% de la hauteur du canva video
+ L'overlay contient la zone qui doit etre render quand on export la video
+ La video éditée doit avoir 100% de la hauteur de l'overlay quand on charge la page et adapter se largeur
+ On doit pouvoir drag la vidéo pour la déplacer dans le canva video
+ Pendant qu'on drag la vidéo cela doit faire apparaitre une grille 3x3 dans l'overlay 
+ Il doit y avoir en background du canva la video qui occupe toute la largeur du canva, la video doit etre floutée
+ Pendant qu'on drag la vidéo la video background doit disparaitre
+ Si le curseur de l'utilisateur est au dessus de la vidéo, les zoom et dezoom ne doivent plus etre transmis au navigateur
+ Si le curseur est au dessus de la vidéo on doit pouvoir utiliser le zoom pour faire grandir la taille de la video éditée et le dézoom pour diminuer la taille


# Export et crop
+ La video exportée doit correspondre à l'image visible a l'intérieur de l'overlay 9:16
+ Il faut prendre en compte tous les elements graphiques superposés dans le canva video
+ La video background floutée est à prendre en compte dans l'export

# Placement et taille
+ La vidéo éditée doit toujours etre a l'intérieur du canva video
+ Il faut rajouter une barre de controle en overlay du canva video
+ La barre de controle a 4 boutons
+ Un bouton "rectangle vertical" qui permet de régler la taille de la vidéo éditée pour qu'elle ait la meme hauteur que l'overlay 9:16
+ Ce bouton "Rectangle vertical" déplace la vidéo éditée pour que son centre soit au milieu de la hauteur de l'overlay. Il n'y a pas de déplacement horizontal associé
+ Un bouton "Rectangle horizontal" qui permet de régler la taille de la vidéo éditée pour qu'elle ait la meme largeur que l'overlay 9:16
+ Ce bouton "Rectangle horizontal" déplace la vidéo éditée pour que son centresoit au milieu de la largeur de l'overlay. Il n'y a pas de déplacement vertical associé.
+ Un bouton "loupe +" qui permet de zoomer et de faire grandir la taille de la video éditée
+ Un bouton "loupe -" qui permet de dézoomer et de faire diminuer la taille de la vidéo éditée

# Qualité du code
Je veux que tu factorise le code du projet pour t'assurer que le projet est modulable et facile à maintenir. Essaye au possible d'avoir des elements réutilisés et d'avoir un code de qualité de classe mondiale pour que les fichier qui ont du code contiennent assez peu de code par fichier
