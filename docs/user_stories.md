# User Stories - Version Cohérente PostgreSQL

## Stack Confirmée : Angular + NestJS + PostgreSQL

### US-1 : Authentification JWT
**En tant que** utilisateur  
**Je veux** me connecter avec email/mot de passe  
**Afin de** accéder à l'application

**Stack :**
- Backend : NestJS + JWT
- Frontend : NgRx pour auth state
- DB : PostgreSQL table `users`

### US-2 : Gestion Hotels
**En tant que** Admin  
**Je veux** créer et gérer des hôtels  
**Afin de** les utiliser dans les contrats

**Stack :**
- Backend : NestJS CRUD
- Frontend : NgRx pour hotels state
- DB : PostgreSQL tables `hotels`, `age_categories`, `room_types`

### US-3 : Contrats Tarifaires
**En tant que** Admin  
**Je veux** créer des contrats avec périodes  
**Afin de** définir les tarifs

**Stack :**
- Backend : NestJS relations complexes
- Frontend : NgRx pour contracts state
- DB : PostgreSQL tables `contracts`, `contract_periods`, `room_prices`

### US-4 : Simulation Réservation
**En tant que** Agent  
**Je veux** simuler une réservation complète  
**Afin de** calculer le prix

**Stack :**
- Backend : NestJS Pricing Service
- Frontend : NgRx pour booking wizard state
- DB : PostgreSQL tables `bookings`, `booking_rooms`

## Schéma de Données Confirmé

Toutes les données sont stockées dans **PostgreSQL** avec le schéma Prisma fourni.

**Plus de Firestore/NoSQL** - Tout est relationnel avec Prisma ORM.