# Description du Projet : SB Smart Attendance

## Contexte

Dans les établissements d'enseignement supérieur comme l'**École Supérieure de Technologie (EST) Sidi Bennour**, la gestion des présences est une tâche administrative chronophage et source de litiges. L'appel traditionnel prend du temps sur les séances de cours, tandis que les feuilles d'émargement papier sont sujettes à falsification et posent des problèmes de stockage et de centralisation.

Ce projet vise à fournir une solution numérique de bout en bout qui digitalise et sécurise cette étape critique. 

## Vision de l'Application

**SB Smart Attendance** est une application mobile moderne conçue pour automatiser l'enregistrement des présences lors des cours. En s'appuyant sur la génération de QR codes dynamiques et temporaires, elle permet de vérifier instantanément et de consigner la présence des étudiants dans la salle de classe, de manière transparente.

### Principes Directeurs :
- **Rapidité :** Le processus de prise de présence doit être instantané. Un "scan" suffit.
- **Fiabilité :** Empêcher les triches (QR code limité à 2 minutes de validité).
- **Accessibilité :** Interface ergonomique, avec un suivi clair et transparent.
- **Rôle centralisé :** La donnée récoltée doit être consultable en temps réel par toutes les parties prenantes (étudiants, administration, professeurs).

## Acteurs et Expérience Utilisateur

### 👨‍🎓 L'Étudiant (Utilisateur Principal)
L'étudiant télécharge l'application et se connecte avec ses identifiants scolaires. Son tableau de bord lui indique son taux d'assiduité par module et s'il se trouve en situation de "risque" (pénalités pour absences répétées). En arrivant en classe, l'étudiant clique sur le bouton **"Scanner le QR Code"**. Une fois le code du professeur lu, sa présence est sauvegardée avec l'horodatage exact. 

### 👨‍🏫 Le Professeur (Gestionnaire de Session)
Lors du lancement de son cours, le professeur s'authentifie, sélectionne le module enseigné dans l'agenda, puis initie la session. L'interface affiche immédiatement **un QR code en plein écran**. Le professeur peut suivre, en direct, l'incrémentation du nombre d’étudiants pointés présents par rapport à l'effectif total. À la fin de la période (ou manuellement), le professeur ferme la session. 

### 👨‍💼 L'Administrateur (Contrôle et Supervision)
L'administration dispose d'une vue "macro" sur l'établissement. Par son interface d'administration, elle ajoute de nouveaux comptes (professeurs et étudiants), configure les modules (associations module-professeur), et dispose de tableaux récapitulatifs sur le taux global d'absentéisme au sein des différentes filières.

## Valeur Pédagogique (Projet Universitaire)

Le but de ce projet universitaire est double : 

1. **Compétence Technique :** Construire une application Frontend bout en bout fonctionnelle avec un framework moderne (React Native/Expo). Appliquer les bonnes pratiques d'ingénierie logicielle (architecture propre, composants réutilisables, styles factorisés dans un thème, Hooks et Contextes de données).
2. **Réponse à un Problème Fonctionnel :** Proposer une solution viable, directement utile pour les formateurs, afin de répondre à un défi présent sur le campus.

### Périmètre du Projet (Scope)

* Ce qui **EST** inclus : Le développement mobile multiplateforme de bout-en-bout (UI/UX, gestion d'état, navigation globale, scanneur QR, interface d'administration).
* Ce qui **N'EST PAS** inclus dans cette version MVP : Le déploiement d'un vrai backend distant. Les données sont persistées en local via le moteur `AsyncStorage` pour prouver le concept lors des soutenances universitaires. Les diagrammes UML et l'architecture décrivent comment s'interfacer avec un backend futur.
