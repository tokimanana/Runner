# 📊 Récapitulatif Global - Runner Tour Operator System

## 🎯 Vue d'ensemble du Projet

**Nom :** Runner - Tour Operator System
**Durée totale MVP :** 9-10 semaines (2.5 mois)
**Total Story Points :** 275 points
**Sprints :** 9 (Sprint 0 à Sprint 8)

---

## 📅 Planning Sprint par Sprint

| Sprint       | Titre                | Durée           | SP      | Statut      |
| ------------ | -------------------- | --------------- | ------- | ----------- |
| **Sprint 0** | Setup Infrastructure | 1-2j            | 13      | ✅ Terminé  |
| **Sprint 1** | Auth & Layout        | 2-3j            | 21      | 🔄 En cours |
| **Sprint 2** | Hotels + Seasons     | 4-5j            | 34      | ⏳ À faire  |
| **Sprint 3** | Référentiels         | 3j              | 21      | ⏳ À faire  |
| **Sprint 4** | Contracts            | 6-7j            | 55      | ⏳ À faire  |
| **Sprint 5** | Offers               | 3-4j            | 29      | ⏳ À faire  |
| **Sprint 6** | Booking UI           | 4-5j            | 34      | ⏳ À faire  |
| **Sprint 7** | Pricing Engine       | 5-7j            | 47      | ⏳ À faire  |
| **Sprint 8** | Finitions & Tests    | 3-4j            | 26      | ⏳ À faire  |
| **TOTAL**    |                      | **31-40 jours** | **275** |             |

---

## 🏗️ Architecture Technique

### Stack

| Couche           | Technologie                                             | Version |
| ---------------- | ------------------------------------------------------- | ------- |
| Monorepo         | NX                                                      | 22      |
| Backend          | NestJS                                                  | 11      |
| ORM              | Prisma                                                  | 7       |
| Database         | PostgreSQL                                              | 15      |
| Auth             | JWT + Passport                                          | -       |
| API Docs         | Swagger                                                 | -       |
| Frontend         | Angular                                                 | 19      |
| State Management | NgRx (auth + booking) / BehaviorSubject (features CRUD) | 19      |
| UI Library       | PrimeNG                                                 | 19      |
| CSS              | Tailwind CSS                                            | v4      |
| Containerisation | Docker                                                  | -       |

### Règles d'architecture clés

**NgRx uniquement pour :**

- Auth (partagée partout, tokens, rôles)
- Booking Wizard (état complexe multi-étapes + effects calculatePrice)

**BehaviorSubject pour tous les autres services :**

- Hotels, Seasons, MealPlans, Markets, Currencies, Supplements, Contracts, Offers

**Pourquoi cette distinction ?**
NgRx apporte de la complexité (actions, reducers, effects, selectors). Elle n'est justifiée
que pour les states partagés globalement ou avec des side effects complexes.
Les services CRUD n'ont pas besoin de ce overhead.

**`take(1)` obligatoire :**
Tous les `subscribe()` dans les services utilisent `take(1)` pour éviter les fuites mémoire.

**`inject()` uniquement :**
Pas de `constructor injection`. Angular 19 utilise `inject()`.

**Standalone components uniquement :**
Pas de NgModule. Angular 19 full standalone.

**Guards avec UrlTree :**

```typescript
return router.createUrlTree(['/dashboard']); // ✅
// pas : router.navigate(['/dashboard']); return false; // ❌
```

**Erreurs backend :**

```typescript
throw new UnauthorizedException(); // ✅
// pas : return { error: 'Unauthorized' }; // ❌
```

**Interceptors — forme fonctionnelle uniquement :**

```typescript
export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {}
```

**Validation formulaires — règles backend uniquement :**

- Ne jamais ajouter des contraintes non confirmées par le backend
- `Validators.required` + `Validators.email` sont acceptables (contraintes universelles)

**Wildcard route (`**`) :\*\*

- Redirige vers `''` (→ dashboard via AuthGuard)
- Sprint 1 : ajouter `redirectIfAuthenticatedGuard` sur `/login` (sous-tâche S1-FE-002)

---

## 📦 Modules Backend (NestJS)

| Module                | Endpoint                         | Multi-tenant |
| --------------------- | -------------------------------- | ------------ |
| PrismaModule (global) | -                                | -            |
| AuthModule            | /auth                            | ✅           |
| HotelsModule          | /hotels                          | ✅           |
| SeasonsModule         | /seasons                         | ✅           |
| MealPlansModule       | /meal-plans                      | ✅           |
| MarketsModule         | /markets                         | ✅           |
| CurrenciesModule      | /currencies                      | ❌ (global)  |
| SupplementsModule     | /supplements                     | ✅           |
| ContractsModule       | /contracts                       | ✅           |
| OffersModule          | /offers                          | ✅           |
| BookingModule         | /booking, /bookings              | ✅           |
| PricingModule         | (service pur, pas de controller) | -            |

> **Currencies est global** : accessible par tous les tour operators, pas de filtrage tourOperatorId.

---

## 🎭 Rôles & Accès

| Feature                                 | ADMIN | MANAGER | AGENT |
| --------------------------------------- | ----- | ------- | ----- |
| Hotels                                  | ✅    | ✅      | ❌    |
| Seasons                                 | ✅    | ✅      | ❌    |
| Référentiels (MealPlans, Markets, etc.) | ✅    | ✅      | ❌    |
| Contracts                               | ✅    | ✅      | ❌    |
| Offers                                  | ✅    | ✅      | ❌    |
| Booking / Simulation                    | ✅    | ✅      | ✅    |
| Historique (toutes)                     | ✅    | ✅      | ❌    |
| Historique (les siennes)                | ✅    | ✅      | ✅    |

---

## 🔑 Credentials Test (Seed Data)

| Email              | Password      | Rôle    |
| ------------------ | ------------- | ------- |
| admin@runner.com   | Password1234! | ADMIN   |
| manager@runner.com | Password1234! | MANAGER |
| agent@runner.com   | Password1234! | AGENT   |

---

## 🔐 Stratégie Auth

| Token         | Stockage             | Durée   | Usage                                    |
| ------------- | -------------------- | ------- | ---------------------------------------- |
| access_token  | Mémoire (NgRx store) | 15 min  | Envoyé dans Authorization header         |
| refresh_token | Cookie httpOnly      | 7 jours | Envoyé automatiquement par le navigateur |

**Flux au reload :**

1. App démarre → `APP_INITIALIZER` appelle `POST /auth/refresh`
2. Cookie httpOnly envoyé automatiquement par le navigateur
3. Succès → store rehydraté avec `access_token` + `user`
4. Échec → `AuthGuard` redirige vers `/login`

**Flux sur 401 (interceptor) :**

1. Requête → 401 reçu
2. Interceptor appelle `POST /auth/refresh`
3. Succès → nouveau `access_token` → retry requête originale
4. Échec → dispatch `logout` → redirect `/login`

**Sprint 0 — version simplifiée (pas de refresh token encore) :**

- `access_token` stocké en mémoire dans `AuthService`
- Interceptor lit `authService.getAccessToken()` directement
- Pas d'appel HTTP au logout (backend pas encore prêt)
- `logoutSuccess` action réservée Sprint 1

---

## 💰 Pricing Engine — Concepts Clés

### Modes de tarification chambre

- **PER_ROOM** : prix fixe par nuit indépendamment de l'occupation
- **PER_OCCUPANCY** : prix selon la configuration exacte (nb adultes + nb enfants + âges)

### Modes de réduction offres

- **SEQUENTIAL** : `Prix × (1-A) × (1-B)` — les réductions se multiplient
- **ADDITIVE** : `Prix × (1-(A+B))` — les réductions s'additionnent
- ⚠️ Non-mixables : on ne peut pas combiner SEQUENTIAL et ADDITIVE

### Types de suppléments

| Type                 | Calcul                   |
| -------------------- | ------------------------ |
| PER_PERSON_PER_NIGHT | prix × personnes × nuits |
| PER_PERSON_PER_STAY  | prix × personnes         |
| PER_ROOM_PER_NIGHT   | prix × chambres × nuits  |
| PER_ROOM_PER_STAY    | prix × chambres          |

### Performance Pricing Engine

- **Max 2 requêtes DB** par calcul (contract + offers)
- Toutes les opérations EN MÉMOIRE dans la boucle nuit par nuit
- Cible : < 2s pour 30 nuits, < 5s pour 150 nuits

---

## 🗂️ Structure NX Monorepo

```
runner/
├── apps/
│   ├── frontend/          # Angular 19
│   │   └── src/app/
│   │       ├── core/
│   │       │   ├── auth/
│   │       │   │   ├── models/
│   │       │   │   │   └── auth.model.ts           ✅ Sprint 0
│   │       │   │   ├── store/
│   │       │   │   │   ├── auth.actions.ts         ✅ Sprint 0
│   │       │   │   │   ├── auth.reducer.ts         ✅ Sprint 0
│   │       │   │   │   ├── auth.effects.ts         ✅ Sprint 0
│   │       │   │   │   ├── auth.selectors.ts       ✅ Sprint 0
│   │       │   │   │   └── auth.state.ts           ✅ Sprint 0
│   │       │   │   └── auth.service.ts             ✅ Sprint 0
│   │       │   ├── guards/
│   │       │   │   ├── auth.guard.ts               ✅ Sprint 0
│   │       │   │   └── role.guard.ts               ⏳ Sprint 1
│   │       │   ├── interceptors/
│   │       │   │   ├── auth.interceptor.ts         ✅ Sprint 0
│   │       │   │   └── refresh.interceptor.ts      ⏳ Sprint 1
│   │       │   └── shell/                          ⏳ Sprint 1
│   │       │       ├── shell.component.ts
│   │       │       ├── sidebar/
│   │       │       └── header/
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   │   └── login/
│   │       │   │       └── login.component.ts      ✅ Sprint 0
│   │       │   ├── dashboard/
│   │       │   │   └── dashboard.component.ts      ✅ Sprint 0 (placeholder)
│   │       │   ├── hotels/                         ⏳ Sprint 2
│   │       │   ├── seasons/                        ⏳ Sprint 2
│   │       │   ├── meal-plans/                     ⏳ Sprint 3
│   │       │   ├── markets/                        ⏳ Sprint 3
│   │       │   ├── currencies/                     ⏳ Sprint 3
│   │       │   ├── supplements/                    ⏳ Sprint 3
│   │       │   ├── contracts/                      ⏳ Sprint 4
│   │       │   ├── offers/                         ⏳ Sprint 5
│   │       │   └── booking/                        ⏳ Sprint 6
│   │       ├── shared/
│   │       │   ├── services/
│   │       │   └── models/
│   │       ├── app.config.ts                       ✅ Sprint 0
│   │       ├── app.routes.ts                       ✅ Sprint 0
│   │       └── app.component.ts                    ✅ Sprint 0
│   └── backend/           # NestJS 11
│       └── src/
│           ├── auth/                               ⏳ Sprint 0 BE
│           ├── hotels/                             ⏳ Sprint 2
│           ├── seasons/                            ⏳ Sprint 2
│           ├── meal-plans/                         ⏳ Sprint 3
│           ├── markets/                            ⏳ Sprint 3
│           ├── currencies/                         ⏳ Sprint 3
│           ├── supplements/                        ⏳ Sprint 3
│           ├── contracts/                          ⏳ Sprint 4
│           ├── offers/                             ⏳ Sprint 5
│           ├── booking/                            ⏳ Sprint 6
│           └── pricing/                            ⏳ Sprint 7
├── libs/                  # Librairies partagées NX (à créer Sprint 2+)
├── docker-compose.yml
└── README.md
```

---

## 🚀 Commandes Rapides

```bash
# Démarrer tout
docker-compose up -d                    # PostgreSQL + pgAdmin
nx serve backend                        # NestJS sur :3000
nx serve frontend                       # Angular sur :4200

# Base de données (depuis apps/backend/)
npx prisma migrate dev --config prisma.config.ts
npx prisma db seed --config prisma.config.ts
npx prisma studio --config prisma.config.ts

# Générer un component NX
nx g @nx/angular:component apps/frontend/src/app/<path>/<name> --dry-run

# Tests
nx test backend
nx test frontend
nx e2e frontend

# Build
nx build backend --configuration=production
nx build frontend --configuration=production
```

### URLs

- **Frontend :** http://localhost:4200
- **Backend API :** http://localhost:3000
- **Swagger :** http://localhost:3000/api
- **pgAdmin :** http://localhost:5050
- **Prisma Studio :** http://localhost:5555

---

## 📝 Convention Git

### Branches

```
main                                    # Production (protégée)
dev                                     # Développement (protégée)
feature/S{sprint}-{BE|FE}-{n}-{desc}   # Features
fix/S{sprint}-{BE|FE}-{n}-{desc}       # Bugfixes
chore/S{sprint}-{BE|FE}-{n}-{desc}     # Tasks techniques
test/S{sprint}-{BE|FE}-{n}-{desc}      # Tests
perf/S{sprint}-{BE|FE}-{n}-{desc}      # Performance
docs/S{sprint}-DOC-{n}-{desc}          # Documentation
```

### Commits

```
feat(scope): description      # Nouvelle fonctionnalité
fix(scope): description       # Correction bug
chore(scope): description     # Tâche technique
perf(scope): description      # Optimisation performance
test(scope): description      # Tests
docs(scope): description      # Documentation
refactor(scope): description  # Refactoring
```

### Stratégie de merge PRs

| Type de branche | Stratégie de merge |
| --------------- | ------------------ |
| `docs/`         | Rebase and merge   |
| `feature/`      | Squash and merge   |
| `fix/`          | Squash and merge   |
| `chore/`        | Squash and merge   |

---

## 🧪 Tests & Qualité Cibles

| Scope          | Coverage | Tests E2E              |
| -------------- | -------- | ---------------------- |
| Backend        | > 80%    | Endpoints critiques    |
| PricingService | > 90%    | 10+ tests obligatoires |
| Frontend       | > 70%    | Flow booking complet   |

### Lighthouse Targets

- Performance : > 85
- Accessibility : > 90
- Best Practices : > 90

---

## 📊 Métriques de Succès MVP

### Fonctionnel

- ✅ Login / Logout avec refresh token httpOnly
- ✅ Layout shell avec sidebar dynamique selon rôle
- ✅ CRUD Hotels avec Age Categories et Room Types
- ✅ CRUD Seasons, MealPlans, Markets, Currencies, Supplements
- ✅ Contrats avec tarification PER_ROOM et PER_OCCUPANCY
- ✅ Offres SEQUENTIAL et ADDITIVE non-mixables
- ✅ Wizard booking 5 étapes complet
- ✅ Pricing Engine < 2s pour 30 nuits
- ✅ Breakdown nuit par nuit
- ✅ Export PDF
- ✅ Historique simulations

### Technique

- ✅ Max 2 requêtes DB par calcul de prix
- ✅ NgRx pour auth et booking uniquement
- ✅ BehaviorSubject + take(1) pour tous les autres services
- ✅ Standalone components Angular 19
- ✅ Guards avec UrlTree
- ✅ Interceptors fonctionnels (pas de classe)
- ✅ Exceptions NestJS (jamais return { error })
- ✅ Cookie httpOnly pour refresh token
- ✅ Validation formulaires = règles backend uniquement

---

## 🔮 Roadmap Post-MVP (V2)

- [ ] Booking confirmation (pas juste simulation)
- [ ] SpecialRules (enfant gratuit, early booking, etc.)
- [ ] Allotments (quotas chambres)
- [ ] Blackout dates
- [ ] Multi-devises avec taux de change
- [ ] Notifications email
- [ ] Multi-langue (i18n)
- [ ] Cache Redis
- [ ] CI/CD complet (GitHub Actions)
- [ ] Monitoring (Sentry)

---

**🎉 Runner - Tour Operator System**
**Version MVP : 1.0.0**
**Stack : Angular 19 + NestJS 11 + NX 22 + PrimeNG 19 + Tailwind v4**
