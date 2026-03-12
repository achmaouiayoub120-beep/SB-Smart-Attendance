# Architecture du Système - SB Smart Attendance

Ce document offre un aperçu technique approfondi de l'architecture retenue pour l'application d'enregistrement des présences. L'application est un **client "Lourd" JavaScript**, architecturé de manière réactive pour gérer un grand volume d'informations d'état.

## Technologies Fondamentales

* **Framework :** React Native 0.76
* **Moteur d'Exécution :** Expo SDK 52 (Framework managé accélérant grandement le développement multiplateformes iOS/Android/Web)
* **Couche de Routage :** Expo Router (Routage fondé sur l'architecture des fichiers, équivalent organique à Next.js dans le domaine mobile)
* **Système de Typage :** TypeScript (Garantit une grande sûreté du développement et un modèle de données rigoureux)
* **Design & Style :** React Native StyleSheet + Thème personnalisé globalisé (pas d'ad-hoc styling).

## Modèle Architecture Frontend (MVVM simplifié)

L'architecture actuelle permet de séparer complètement la présentation, la logique de session et les données.  

### 1. Couche de Stockage (Persistance) - `AsyncStorage`
Puisqu'il s'agit d'un MVP universitaire fonctionnant sans serveur dorsal, cette couche repose sur des clés paires de valeurs stockées par le biais d'un pont asynchrone sur de la base embarquée au téléphone:
- **Keys :** `estsb_users`, `estsb_sessions`, `estsb_attendance`, etc.
- **Cycle :** Chargement asynchrone à l'amorçage de l'app de `MOCK_DATA` initiales + Sauvegarde à chaque action "d'écriture".

### 2. Couche Etat Global - `Context Providers`
L'application instancie **deux Providers React Context** wrappant globalement tous les écrans dans le `_layout.tsx` principal.
- **`AuthContext.tsx` :** Maintient l'état authentifié, identifie l'utilisateur courant, et ses droits (Rôle `student` ou `admin` ou `prof`). Offre les fonctions `login()` et `logout()`.
- **`DataContext.tsx` :** Le système nerveux de l'application. Fournit :
  - L'état de l'application stocké en mémoire de travail de React.
  - La logique Métier encapsulée dans des Hooks : `markAttendance()`, `startSession()`, `regenerateQRCode()`.

### 3. Couche Vue / Composants Fonctionnels
Les pages (répertoire `/app`) sont minces ("Thin Views"). Elles s'abonnent aux Context Providers via `useData()` ou `useAuth()`. Tout l'état lourd en calculs ou CRUD s'effectue hors des vues. 

- Les pages intègrent des composants (`src/components/dashboard/*.tsx`) isolant les rendus d'UI complexes en "Briques Légo" pour l'intégration de sous-Vues ou de Graphiques d'Analytique.

## Cycle de Vie du Composant Clé : La Session QR

Le processus métier principal (Scénario d'Assiduité) repose sur :

1. L'instanciation par le compte *Professeur* d'un identifiant `sessionId`.
2. Un utilitaire pseudo-aléatoire code une chaîne agrégée `{sessionId + moduleId + timeStamp}`.
3. Ce Hash est représenté graphiquement via `react-native-svg` sans nécessiter de serveur pour générer une image.
4. L'appareil de l'étudiant photographie via la caméra l'écran.
5. S'abonnant au DataContext, le scan modifie `estsb_attendance` de status="absent" à "present".

## Sécurité & Anti-Triche (Implémentation Mocked)
- Les QR codes de la vue Session sont dynamiques. Ils disposent d'un `qrCodeExpiresAt` calé sur le temps Unix à + 120 secondes de la génération. 
- Au terme du décompte, la fonction appelle `regenerateQRCode()`, ce qui invalide toute photographie du QR Code qui aurait été transmise hors-les-murs par un étudiant inscrit absent.

## Extensions Architectures Futures (Vers l'Industrie)

Si le projet universitaire doit un jour se muer en produit final :

* Remplacement radical du `mock-data.ts` et de la routine `AsyncStorage` dans les Hooks Context par l'initialisation de `TanStack React Query` et `Axios` ou par une connexion directe `Firebase SDK/Supabase`.
* Conserver les Interfaces Protocolaire dans le `src/types/index.ts` qui contraindront uniformément les entités retournées par les futures requêtes API Backend (DTOs).
* Ajout d'une géolocalisation pour l'étudiant (pour conditionner le `markAttendance()` de l'Étudiant au fait de se situer géographiquement le périmètre du bâtiment de l'EST Sidi Bennour).
