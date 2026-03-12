# SB Smart Attendance

Une application mobile intelligente de gestion des présences pour l'École Supérieure de Technologie (EST) Sidi Bennour. Développée avec React Native et Expo, cette application modernise le suivi des absences en utilisant la technologie des QR Codes.

## 🎯 Objectifs du Projet

- **Automatiser** le processus de prise de présence pendant les cours
- **Réduire** le temps perdu lors de l'appel manuel
- **Centraliser** les données d'assiduité pour une meilleure gestion administrative
- **Fournir** des statistiques en temps réel aux étudiants, professeurs, et administrateurs

## 👥 Fonctionnalités par Profil

### 👨‍🎓 Étudiant
- **Tableau de bord personnel** : Vue d'ensemble du taux de présence et des prochains cours.
- **Scan de QR Code** : Validation instantanée de la présence en scannant le code généré par le professeur.
- **Historique** : Consultation détaillée des présences, absences et retards par module.
- **Notifications** : Alertes automatiques en cas d'absence non justifiée.

### 👨‍🏫 Professeur
- **Gestion des sessions** : Création et clôture des sessions de cours.
- **Générateur de QR Code** : Génération de QR codes dynamiques et temporaires (valides 2 minutes) pour éviter la fraude.
- **Suivi en temps réel** : Visualisation instantanée des étudiants présents et absents.
- **Statistiques du module** : Analyse de l'assiduité globale pour les modules enseignés.

### 👨‍💼 Administrateur
- **Gestion des utilisateurs** : Opérations CRUD (Création, Lecture, Mise à jour, Suppression) sur les comptes étudiants et professeurs.
- **Gestion des modules** : Affectation des professeurs aux différents modules d'enseignement.
- **Vue d'ensemble** : Accès aux statistiques globales de l'établissement.

## 🛠 Technologies Utilisées

- **Frontend Mobile** : React Native avec Expo
- **Navigation** : Expo Router (Navigation basée sur le système de fichiers)
- **Stylisation** : StyleSheet natif avec un système de design personnalisé (Thème centralisé)
- **Stockage de données** : AsyncStorage (Persistance locale simulée pour la démonstration)
- **Icônes** : Lucide React Native
- **Typage** : TypeScript pour une base de code robuste et sans erreurs

## 📁 Structure du Projet

```text
EST-SB-Smart-Attendance/
├── app/                  # Écrans de l'application (Expo Router)
│   ├── _layout.tsx       # Configuration de la navigation et des contextes
│   ├── index.tsx         # Écran de démarrage / Splash screen
│   ├── login.tsx         # Écran de connexion
│   ├── dashboard.tsx     # Tableaux de bord (redirige selon le rôle)
│   ├── scan.tsx          # Scanner de QR Code (Étudiant)
│   ├── session.tsx       # Générateur de QR Code (Professeur)
│   ├── admin.tsx         # Panel d'administration
│   └── ...               # Autres écrans (profil, historique, analytics)
├── src/                  # Code source principal
│   ├── components/       # Composants réutilisables (Tableaux de bord spécifiques)
│   ├── constants/        # Thèmes, couleurs, et constantes globales
│   ├── context/          # Contextes React (Auth, Data)
│   ├── services/         # Services et données simulées (Mock Data)
│   └── types/            # Interfaces TypeScript
├── assets/               # Images, polices et icônes
└── docs/                 # Documentation académique et diagrammes UML
```

## 🚀 Guide d'Installation Rapide

Prérequis : Node.js (v18+) et npm.

1. **Cloner ou télécharger le projet**
2. **Ouvrir un terminal dans le dossier du projet**
3. **Installer les dépendances**
   ```bash
   npm install
   ```
4. **Lancer l'application**
   ```bash
   npx expo start
   ```

## 📱 Exécuter l'Application

Une fois la commande `npx expo start` exécutée, un QR code apparaîtra dans votre terminal :

- **Sur un téléphone physique** : Téléchargez l'application **Expo Go** (iOS/Android) et scannez le QR code.
- **Sur navigateur Web** : Appuyez sur la touche `w` dans le terminal pour ouvrir la prévisualisation web.
- **Sur émulateur** : Appuyez sur `a` (Android) ou `i` (iOS) si vous avez les outils de développement installés.

### Comptes de Démonstration

Le mot de passe pour tous les comptes de test est `password`.

| Rôle | Email |
| :--- | :--- |
| **Étudiant** | `student@estsb.ma` |
| **Professeur** | `prof@estsb.ma` |
| **Administrateur** | `admin@estsb.ma` |

## 📚 Documentation Technique

Consultez le dossier `docs/` pour plus de détails sur l'architecture du système :

- [Description détaillée du projet](./docs/project-description.md)
- [Architecture du système](./docs/system-architecture.md)
- [Diagrammes UML](./docs/uml-diagrams.md)

## 🔮 Améliorations Futures (Production)

Pour passer d'un projet universitaire de démonstration à une application en production :

1. Remplacer `AsyncStorage` et les Mock Data par une API RESTful (Node.js/Express ou Laravel).
2. Connecter l'application à une base de données réelle (PostgreSQL ou MongoDB).
3. Implémenter l'authentification avec JWT (JSON Web Tokens).
4. Ajouter des notifications Push natives via Expo Push Services.
5. Intégrer un système d'exportation des données au format Excel ou PDF pour l'administration.
