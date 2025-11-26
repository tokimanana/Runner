# Guide de démarrage - Tour Operator System (Version SQL)

## 🚀 Phase 0 : Setup Infrastructure (Jours 1-2)

1. **Base de données & Backend**
   - Lancer Docker avec PostgreSQL (`docker-compose up`).
   - Initialiser NestJS (`nest new backend`).
   - Configurer Prisma (`npx prisma init`).
   - Copier le `schema.prisma` dans le projet.
   - Lancer la migration : `npx prisma migrate dev --name init`.
   - **NOUVEAU** : Lancer le script de seed (`npx prisma db seed`) pour avoir des données.

2. **Frontend Angular**
   - Créer le projet (`ng new frontend`).
   - Installer Angular Material & NgRx.
   - Configurer le client HTTP pour pointer vers `http://localhost:3000`.

---

## 🏗️ Phase 1 : Les Fondations (Backend First)

**Objectif :** Avoir une API qui tourne pour gérer les hôtels avant de faire l'écran.

1. **Backend (NestJS)**
   - Créer le module `Auth` (Login/Register + JWT Guard).
   - Créer le module `Hotels` (Controller + Service).
   - Implémenter le CRUD : `GET /hotels`, `POST /hotels`.
   - *Test :* Utiliser Swagger (`http://localhost:3000/api`) pour créer un hôtel et vérifier qu'il est dans la DB.

2. **Frontend (Angular)**
   - Créer la page de Login.
   - Créer le service `HotelsService` (appel API).
   - Créer la liste des hôtels (affichage des données API).

---

## 🏨 Phase 2 : Configuration Avancée (Hôtels & Chambres)

1. **Backend**
   - Ajouter les endpoints pour `AgeCategories` (sous-ressource hôtel).
   - Ajouter les endpoints pour `RoomTypes`.
   - Ajouter les endpoints pour `MealPlans`.

2. **Frontend**
   - Formulaire de création d'hôtel complet.
   - Gestionnaire de `Room Types` (Ajout/Suppression dynamique).

---

## 📜 Phase 3 : Contrats & Tarifs (Le gros morceau)

1. **Backend**
   - Créer le module `Contracts`.
   - Gérer la structure complexe : Contrat -> Périodes -> Prix.
   - *Challenge :* Validation que les périodes ne se chevauchent pas.

2. **Frontend**
   - Écran de liste des contrats.
   - Formulaire complexe de contrat (Wizard ou Tabulation).
   - Grille de saisie des prix (MatTable avec inputs).

---

## 🏷️ Phase 4 : Offres Promotionnelles

1. **Backend**
   - Module `Offers`.
   - Logique : Une offre peut être liée à des suppléments.

2. **Frontend**
   - CRUD Offres.
   - Sélecteur de suppléments applicables.

---

## 🧮 Phase 5 : Moteur de Calcul & Réservation

C'est le cœur du système.

1. **Backend (Moteur de prix)**
   - Créer un service `PricingService` (pas de controller, juste de la logique).
   - Méthode `calculatePrice(criteria)` :
     - Récupère le contrat valide.
     - Calcule le prix de base (nuit par nuit).
     - Applique les offres (Combinable vs Cumulative).
     - Ajoute les suppléments.
   - Endpoint `POST /bookings/simulate` qui appelle ce service.

2. **Frontend**
   - Tunnel de réservation (Wizard 5 étapes).
   - Affichage du prix en temps réel (ou au bouton "Calculer").
   - Affichage du "Breakdown" (Détail nuit par nuit reçu du backend).

---

## 🧪 Stratégie de Test

Pour valider que tes calculs sont justes sans interface graphique :

1. **Seed Data :** Utilise le fichier `seed.ts` pour remettre la base au propre à chaque test.
2. **Jest (Backend) :** Écris des tests unitaires pour `PricingService`.
   - *Cas test :* "Prix 100€, Offre -10%, Résultat attendu = 90€".