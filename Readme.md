# Runner — Tour Operator System

Système de gestion pour tour-opérateurs : hôtels, contrats, tarification et réservations.

---

## Stack technique

| Couche          | Technologie                       |
| --------------- | --------------------------------- |
| Frontend        | Angular 19 + PrimeNG 19 + NgRx 19 |
| Backend         | NestJS 11 + Prisma ORM            |
| Base de données | PostgreSQL 15 (Docker)            |
| Styles          | Tailwind CSS v4                   |
| Monorepo        | NX 22                             |
| Tests           | Jest + Playwright                 |

---

## Prérequis

- Node.js 20+
- Docker + Docker Compose
- NX CLI : `npm install -g nx`

---

## Installation

### 1. Cloner le repo

```bash
git clone <repo-url>
cd Runner
npm install
```

### 2. Configurer les environments

```bash
# Frontend
cp apps/frontend/src/environments/environment.example.ts apps/frontend/src/environments/environment.ts
cp apps/frontend/src/environments/environment.example.ts apps/frontend/src/environments/environment.dev.ts
# Adapter les valeurs dans environment.dev.ts
```

### 3. Démarrer PostgreSQL

```bash
docker-compose up -d
```

### 4. Initialiser la base de données

```bash
cd apps/backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Démarrer les applications

```bash
# Terminal 1 — Frontend
nx serve frontend

# Terminal 2 — Backend
nx serve backend
```

- Frontend : http://localhost:4200
- Backend : http://localhost:3000
- pgAdmin : http://localhost:5050
- Prisma Studio : `npx prisma studio` → http://localhost:5555

---

## Credentials de test (après seed)

| Email              | Mot de passe | Rôle    |
| ------------------ | ------------ | ------- |
| admin@runner.com   | Admin1234!   | ADMIN   |
| manager@runner.com | Manager1234! | MANAGER |
| agent@runner.com   | Agent1234!   | AGENT   |

---

## Structure du monorepo

```
Runner/
├── apps/
│   ├── frontend/          ← Angular 19
│   └── backend/           ← NestJS 11
├── libs/                  ← Libs partagées (Sprint 1+)
├── docs/                  ← Documentation technique
├── docker-compose.yml
└── package.json
```

---

## Git workflow

```
main          ← stable, merge en fin de sprint uniquement
  └── dev     ← branche d'intégration
        └── feature/S0-FE-006-auth-interceptor  ← branches de tickets
```

**Conventions de commit** : `type(scope): description`

| Type       | Usage                                       |
| ---------- | ------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                     |
| `fix`      | Correction de bug                           |
| `chore`    | Configuration, dépendances                  |
| `refactor` | Refactoring sans changement de comportement |
| `docs`     | Documentation                               |
| `test`     | Tests                                       |

---

## Documentation

| Fichier                          | Contenu                    |
| -------------------------------- | -------------------------- |
| `docs/Architecture.md`           | Architecture globale       |
| `docs/regles_metier.md`          | Logique de calcul des prix |
| `docs/exemples_concrets.md`      | Cas de tarification réels  |
| `docs/diagramme_de_classe.md`    | Modèle de données          |
| `docs/diagram_de_sequence.md`    | Flux applicatifs           |
| `docs/SPRINT_0_SETUP.md`         | Guide setup Sprint 0       |
| `docs/SPRINTS_1_TO_8_ROADMAP.md` | Roadmap complète           |
