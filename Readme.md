# Runner — Tour Operator System

Plateforme de gestion et simulation de réservations pour Tour-Opérateurs (TO).
Permet aux agents commerciaux de simuler des séjours hôteliers avec calcul de prix en temps réel, gestion des offres promotionnelles et breakdown détaillé nuit par nuit.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Angular 19 + PrimeNG + NgRx |
| Backend | NestJS 11 + Prisma ORM |
| Base de données | PostgreSQL 15 |
| Monorepo | NX 22 |
| Tests | Jest + Playwright |

---

## Architecture NX

Ce projet utilise **NX** comme outil de gestion de monorepo. NX permet de gérer frontend et backend dans un seul repository tout en gardant une séparation claire des responsabilités.

```
Runner/
├── apps/
│   ├── frontend/          ← Application Angular 19
│   └── backend/           ← API NestJS 11
├── docs/                  ← Documentation projet
├── nx.json                ← Configuration NX
└── package.json           ← Dépendances partagées
```

### Commandes NX

```bash
# Lancer les deux apps simultanément
npm start

# Lancer séparément
npm run start:frontend     # http://localhost:4200
npm run start:backend      # http://localhost:3000

# Build
npm run build

# Tests
npm run test

# Lint
npm run lint
```

---

## Overview du projet

### Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **ADMIN** | Configuration complète + gestion utilisateurs |
| **MANAGER** | Gestion hôtels, contrats, offres |
| **AGENT** | Simulation de réservations uniquement |

### Modules principaux

**Configuration** (ADMIN + MANAGER)
- Hôtels — types de chambres, catégories d'âge
- Contrats tarifaires — périodes, prix PER_ROOM / PER_OCCUPANCY
- Offres promotionnelles — modes SEQUENTIAL et ADDITIVE
- Données de référence — saisons, marchés, devises, suppléments

**Simulation** (tous les rôles)
- Wizard 5 étapes : hôtel → chambres → offres → suppléments → récapitulatif
- Calcul prix en temps réel avec breakdown nuit par nuit
- Export PDF

### Logique métier clé

Le moteur de calcul applique les offres **nuit par nuit** selon leur période de validité :

```
Prix final = Prix base
  × (1 - offre1) × (1 - offre2)   ← mode SEQUENTIAL
  × (1 - (offre1 + offre2))        ← mode ADDITIVE
  + suppléments
```

Les offres SEQUENTIAL et ADDITIVE **ne peuvent pas être mixées** sur une même réservation.

---

## Installation

### Prérequis

- Node.js 22+
- Docker + Docker Compose
- NX CLI : `npm install -g nx`

### Setup

```bash
# 1. Cloner le projet
git clone https://github.com/ton-repo/runner.git
cd runner

# 2. Installer les dépendances
npm install

# 3. Configurer les environnements
cp apps/frontend/src/environments/environment.example.ts apps/frontend/src/environments/environment.ts
cp apps/frontend/src/environments/environment.prod.example.ts apps/frontend/src/environments/environment.prod.ts

# 4. Lancer PostgreSQL
docker-compose up -d

# 5. Initialiser la base de données
cd apps/backend
npx prisma migrate dev
npx prisma db seed

# 6. Lancer le projet
cd ../..
npm start
```

### Credentials de test

| Rôle | Email | Password |
|------|-------|----------|
| Admin | admin@horizon.com | password123 |
| Manager | manager@horizon.com | password123 |
| Agent | agent@horizon.com | password123 |

---

## Structure des sprints

| Sprint | Objectif | SP |
|--------|----------|----|
| Sprint 0 | Setup infrastructure | 13 |
| Sprint 1 | Auth + Layout + Users | 26 |
| Sprint 2 | Hôtels + Saisons | 34 |
| Sprint 3 | Données de référence | 21 |
| Sprint 4 | Contrats tarifaires | 55 |
| Sprint 5 | Offres promotionnelles | 29 |
| Sprint 6 | Booking Wizard UI | 34 |
| Sprint 7 | Moteur de calcul | 47 |
| Sprint 8 | Finalisation + Tests | 26 |
| **Total** | | **280 SP** |

---

## Workflow Git

```
main          ← production, protégée
  ↑
dev           ← intégration, protégée
  ↑
feature/S1-FE-001-...   ← branches de travail
```

Toute contribution passe par une **Pull Request** vers `dev`.
Les merges vers `main` se font uniquement en fin de sprint.

Convention de nommage des branches :
- `feature/` — nouvelle fonctionnalité
- `chore/` — configuration, setup
- `fix/` — correction de bug
- `hotfix/` — correction urgente en production

---

## Documentation

La documentation complète est disponible dans `/docs` :

- `Architecture.md` — décisions d'architecture
- `regles_metier.md` — règles de calcul des prix
- `exemples_concrets.md` — cas de tarification réels
- `SPRINT_0_DETAILED.md` — détail des tickets Sprint 0
- `diagramme_de_classe.md` — modèle de données
- `diagram_de_sequence.md` — flux de réservation

## Docker
Pour lancer le projet en local avec Docker, utilisez les commandes suivantes :

```bash
# Build and run the project for the first time
docker-compose up

# Stop the project
docker-compose down

# Rebuild the project after making changes or add new packages
docker-compose up --build
```


