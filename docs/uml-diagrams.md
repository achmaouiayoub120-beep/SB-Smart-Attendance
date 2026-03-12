# Diagrammes UML - SB Smart Attendance

Ce document présente les diagrammes UML modélisant l'application de gestion des présences. Ces diagrammes permettent de visualiser la structure, les interactions et le comportement du système.

*Note : Les diagrammes utilisent la syntaxe Mermaid qui est rendue nativement par GitHub.*

## 1. Diagramme des Cas d'Utilisation

Ce diagramme illustre les interactions possibles entre les différents types d'utilisateurs (acteurs) et le système.

```mermaid
usecaseDiagram
    actor Étudiant as student
    actor Professeur as prof
    actor Administrateur as admin

    package "SB Smart Attendance" {
        usecase "S'authentifier" as UC1
        usecase "Consulter les statistiques" as UC2
        
        usecase "Scanner un QR Code" as UC3
        usecase "Consulter l'historique" as UC4
        
        usecase "Créer une session" as UC5
        usecase "Générer QR Code" as UC6
        usecase "Clôturer la session" as UC7
        
        usecase "Gérer les étudiants" as UC8
        usecase "Gérer les professeurs" as UC9
        usecase "Gérer les modules" as UC10
    }

    student --> UC1
    prof --> UC1
    admin --> UC1

    student --> UC2
    prof --> UC2
    admin --> UC2

    student --> UC3
    student --> UC4

    prof --> UC5
    prof --> UC6
    prof --> UC7
    UC5 ..> UC6 : <<include>>

    admin --> UC8
    admin --> UC9
    admin --> UC10
```

## 2. Diagramme de Classes

Modélisation des entités de données manipulées par l'application et de leurs relations.

```mermaid
classDiagram
    class User {
        <<abstract>>
        +String id
        +String email
        +String firstName
        +String lastName
        +String role
        +Date createdAt
        +login()
        +logout()
    }

    class Student {
        +String studentId
        +String department
        +String class
        +Float attendanceRate
    }

    class Professor {
        +String department
        +Int totalSessions
    }

    class Admin {
    }

    class Module {
        +String id
        +String name
        +String code
        +String professorId
    }

    class Session {
        +String id
        +String moduleId
        +Date date
        +String status
        +String qrCode
        +Date qrCodeExpiresAt
        +generateQR()
        +closeSession()
    }

    class AttendanceRecord {
        +String id
        +String sessionId
        +String studentId
        +String status
        +Date date
    }

    User <|-- Student
    User <|-- Professor
    User <|-- Admin

    Professor "1" -- "*" Module : Enseigne
    Module "1" -- "*" Session : Contient
    Session "1" -- "*" AttendanceRecord : Enregistre
    Student "1" -- "*" AttendanceRecord : Possède
```

## 3. Diagramme de Séquence (Prise de Présence)

Ce diagramme décrit chronologiquement le processus de validation de la présence : de la génération du QR code par le professeur au scan par l'étudiant.

```mermaid
sequenceDiagram
    actor Professeur
    participant App_Prof as Application (Prof)
    participant Context as DataContext
    participant App_Etu as Application (Étudiant)
    actor Étudiant

    Professeur->>App_Prof: Clique sur "Démarrer Session"
    App_Prof->>Context: startSession(moduleId, profId)
    Context-->>App_Prof: Session créée (sessionId, qrCode)
    App_Prof->>Professeur: Affiche le QR Code (Valide 2 min)
    
    Étudiant->>App_Etu: Ouvre le Scanner QR
    App_Etu->>Étudiant: Active la caméra
    Étudiant->>App_Etu: Scanne le code affiché par le Prof
    App_Etu->>App_Etu: Valide le format du QR Code
    
    alt QR Code valide et non expiré
        App_Etu->>Context: markAttendance(sessionId, studentId, "present")
        Context-->>App_Etu: Succès
        App_Etu->>Étudiant: Message "Présence validée"
    else QR Code invalide / expiré
        App_Etu->>Étudiant: Message d'erreur "QR Code expiré"
    end
    
    loop Toutes les 2 minutes
        App_Prof->>Context: regenerateQRCode(sessionId)
        Context-->>App_Prof: Nouveau QR Code
        App_Prof->>Professeur: Rafraîchit l'affichage
    end
```

## 4. Architecture de l'Application Modèle Vue

Bien qu'il s'agisse d'une application frontend React Native, l'architecture respecte une séparation des responsabilités.

```mermaid
graph TD
    UI[Couche UI / Écrans] --> Context[Couche Context / État Global]
    Context --> Services[Couche Services]
    Services --> DB[(Stockage Local : AsyncStorage)]
    
    subgraph "Couche UI (Vues)"
        App(app/)
        Components(src/components/)
    end
    
    subgraph "Couche État (Gestionnaires)"
        AuthContext(src/context/AuthContext)
        DataContext(src/context/DataContext)
    end
    
    subgraph "Couche Services (Accès données)"
        MockAPI(src/services/mock-data.ts)
    end
    
    UI --> App
    UI --> Components
    Context --> AuthContext
    Context --> DataContext
    Services --> MockAPI
```
