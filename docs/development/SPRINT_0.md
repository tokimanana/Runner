# Sprint 0 - Setup Infrastructure

## 🎯 Objectif Sprint
Mettre en place toute l'infrastructure du projet : monorepo NX, backend NestJS, frontend Angular 19, base de données PostgreSQL, authentification JWT basique.

**Durée estimée :** 1-2 jours
**Statut :** 🔄 En cours

---

## Décisions d'architecture prises en Sprint 0

| Décision | Choix | Raison |
|----------|-------|--------|
| Framework frontend | Angular 19 standalone | Pas de NgModule, `inject()` |
| UI Library | PrimeNG 19 | Pas Angular Material |
| CSS | Tailwind CSS v4 | Utility-first, compatible PrimeNG |
| State Management | NgRx 19 (auth uniquement) | Single source of truth pour les tokens |
| State features CRUD | BehaviorSubject | Moins de complexité, suffisant |
| Monorepo | NX 22 | Gestion apps/libs partagées |
| ORM | Prisma 7 | Type-safe, migrations versionnées |
| Auth | JWT (access + refresh) | Stateless, scalable |
| Token access | Mémoire (NgRx store) | Sécurisé contre XSS |
| Token refresh | Cookie httpOnly | Auto-envoyé, survit au reload |
| Erreurs backend | `throw new UnauthorizedException()` | HTTP status corrects pour catchError |
| Guards | UrlTree | Délègue navigation à Angular |
| Injection | `inject()` | Pattern Angular 19 |
| Components | Standalone uniquement | Pas de NgModule |

---

## Backend Tasks

### S0-BE-001 : Initialiser NestJS dans NX
- **Branch :** `feature/S0-BE-001-nestjs-init`
- **Commit :** `feat(backend): initialize NestJS app in NX monorepo`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done
- **Files :**
  - `apps/backend/src/main.ts`
  - `apps/backend/src/app.module.ts`

---

### S0-BE-002 : Setup Docker PostgreSQL
- **Branch :** `feature/S0-BE-002-docker-postgres`
- **Commit :** `feat(infra): setup Docker PostgreSQL and pgAdmin`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done
- **Description :**
  - PostgreSQL 15 + pgAdmin via Docker Compose
  - Réseau isolé `dev-network`
  - Backend et frontend lancés en local (`nx serve`) — Docker uniquement pour la DB en dev
- **Files :**
  - `docker-compose.yml`
  - `apps/backend/Dockerfile`
  - `apps/frontend/Dockerfile`
  - `.dockerignore`

**URLs :**
| Service | URL |
|---------|-----|
| pgAdmin | http://localhost:5050 |
| PostgreSQL | localhost:5432 |

```bash
# Démarrer uniquement la DB en dev
docker compose up -d postgres pgadmin
```

---

### S0-BE-003 : Configurer Prisma
- **Branch :** `feature/S0-BE-003-prisma-init`
- **Commit :** `feat(prisma): configure Prisma 7 with PostgreSQL and User schema`
- **Priority :** P0 | **SP :** 2
- **Status :** ✅ Done
- **Description :**
  Initialiser Prisma 7 dans le monorepo NX et configurer la connexion PostgreSQL.

  **Architecture Prisma 7 :**
  - `schema.prisma` → structure uniquement (modèles, enums)
  - `prisma.config.ts` → configuration runtime (url de connexion, chemins)
  - ⚠️ `url` n'est plus dans `schema.prisma` — breaking change Prisma 7

- **Files :**
  - `apps/backend/prisma/schema.prisma`
  - `apps/backend/prisma.config.ts`
  - `apps/backend/.env`

```prisma
enum UserRole {
  ADMIN
  MANAGER
  AGENT
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  passwordHash   String
  firstName      String
  lastName       String
  role           UserRole @default(AGENT)
  tourOperatorId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

**.env :**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/runner"
JWT_SECRET="dev-secret-key"
```

**Commands — toujours depuis `apps/backend/` :**
```bash
cd apps/backend
npx prisma migrate dev --name init --config prisma.config.ts
npx prisma generate --config prisma.config.ts
npx prisma studio --config prisma.config.ts
```

> **Règle :** après chaque modification du schema → `migrate dev` puis `generate`. `generated/` est gitignored.

**Acceptance Criteria :**
- ✅ Migration `init` appliquée sans erreur
- ✅ Table `User` + enum `UserRole` créés dans PostgreSQL
- ✅ Client TypeScript généré dans `generated/prisma`
- ✅ Prisma Studio accessible

---

### S0-BE-004 : Créer PrismaModule
- **Branch :** `feature/S0-BE-004-prisma-module`
- **Commit :** `feat(prisma): create PrismaService and PrismaModule`
- **Priority :** P0 | **SP :** 1
- **Status :** ⏳ À faire
- **Description :**
  Créer la couche d'accès à la base de données dans NestJS.

- **Files :**
  - `apps/backend/src/prisma/prisma.service.ts`
  - `apps/backend/src/prisma/prisma.module.ts`

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

```typescript
// prisma.module.ts
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

> **Pourquoi `@Global()` ?** Évite d'importer `PrismaModule` dans chaque module — une seule fois dans `AppModule` suffit.

**Acceptance Criteria :**
- ✅ `PrismaService` injectable dans tous les modules
- ✅ Connexion DB établie au démarrage de NestJS

---

### S0-BE-005 : Créer AuthModule (JWT basique)
- **Branch :** `feature/S0-BE-005-auth-module`
- **Commit :** `feat(auth): create auth module with JWT strategy`
- **Priority :** P0 | **SP :** 3
- **Status :** ⏳ À faire
- **Description :**
  - `POST /auth/login` → retourne `{ access_token, user }` ou HTTP 401
  - JWT Strategy avec Passport
  - Validation : `throw new UnauthorizedException()` — jamais `return { error }`
  - `select` Prisma pour ne jamais exposer `passwordHash`

- **Files :**
  - `apps/backend/src/auth/auth.module.ts`
  - `apps/backend/src/auth/auth.service.ts`
  - `apps/backend/src/auth/auth.controller.ts`
  - `apps/backend/src/auth/strategies/jwt.strategy.ts`
  - `apps/backend/src/auth/guards/jwt-auth.guard.ts`

**Acceptance Criteria :**
- ✅ `POST /auth/login` retourne `{ access_token, user }` avec credentials valides
- ✅ `POST /auth/login` retourne HTTP 401 avec credentials invalides
- ✅ `passwordHash` jamais exposé dans la réponse
- ✅ Testé avec les 3 credentials seed

---

### S0-BE-006 : Créer RolesGuard
- **Branch :** `feature/S0-BE-006-roles-guard`
- **Commit :** `feat(auth): create RolesGuard and @Roles decorator`
- **Priority :** P0 | **SP :** 1
- **Status :** ⏳ À faire
- **Files :**
  - `apps/backend/src/auth/guards/roles.guard.ts`
  - `apps/backend/src/auth/decorators/roles.decorator.ts`

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

```typescript
// roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

**Acceptance Criteria :**
- ✅ Route sans `@Roles` → accessible par tous les users authentifiés
- ✅ Route avec `@Roles(UserRole.ADMIN)` → HTTP 403 si rôle insuffisant

---

### S0-BE-007 : Seed data utilisateurs
- **Branch :** `feature/S0-BE-007-seed`
- **Commit :** `feat(seed): add users seed with bcrypt`
- **Priority :** P0 | **SP :** 1
- **Status :** ⏳ À faire
- **Files :**
  - `apps/backend/prisma/seed.ts`

```typescript
const hashedPassword = await bcrypt.hash('Password1234!', 10);

for (const u of [
  { email: 'admin@runner.com', firstName: 'Admin', lastName: 'Runner', role: 'ADMIN' },
  { email: 'manager@runner.com', firstName: 'Marie', lastName: 'Manager', role: 'MANAGER' },
  { email: 'agent@runner.com', firstName: 'Jean', lastName: 'Agent', role: 'AGENT' },
]) {
  await prisma.user.upsert({
    where: { email: u.email },
    update: {},
    create: { ...u, passwordHash: hashedPassword, tourOperatorId: tourOperator.id },
  });
}
```

> **Pourquoi `upsert` ?** Idempotent — relancer le seed ne crée pas de doublons.

**Credentials de test :**

| Email | Password | Rôle |
|-------|----------|------|
| admin@runner.com | Password1234! | ADMIN |
| manager@runner.com | Password1234! | MANAGER |
| agent@runner.com | Password1234! | AGENT |

```bash
cd apps/backend
npx prisma db seed --config prisma.config.ts
```

**Acceptance Criteria :**
- ✅ 3 utilisateurs créés en DB
- ✅ Seed idempotent — peut être relancé sans erreur
- ✅ `POST /auth/login` fonctionne avec les 3 credentials

---

## Frontend Tasks

### S0-FE-001 : Initialiser Angular 19 dans NX
- **Branch :** `feature/S0-FE-001-angular-init`
- **Commit :** `feat(frontend): initialize Angular 19 standalone app`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done
- **Files :**
  - `apps/frontend/src/main.ts`
  - `apps/frontend/src/app/app.config.ts`
  - `apps/frontend/src/app/app.routes.ts`

---

### S0-FE-002 : Installer PrimeNG 19 + Tailwind CSS v4
- **Branch :** `feature/S0-FE-002-primeng-tailwind`
- **Commit :** `feat(frontend): install PrimeNG 19 and Tailwind CSS v4`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done
- **Files :**
  - `apps/frontend/src/styles.css`
  - `apps/frontend/tailwind.config.js`

---

### S0-FE-003 : Configurer NgRx Store (auth)
- **Branch :** `feature/S0-FE-003-ngrx-auth`
- **Commit :** `feat(auth): configure NgRx store for auth`
- **Priority :** P0 | **SP :** 2
- **Status :** ✅ Done
- **Description :**
  - Actions : `loginSuccess`, `loginFailure`, `logout`
  - Reducer : `accessToken`, `user`, `loading`, `error`
  - Selectors : `selectCurrentUser`, `selectAccessToken`, `selectUserRole`, `selectIsAuthenticated`
  - Effects : `login$`, `logout$`
- **Files :**
  - `apps/frontend/src/app/core/auth/store/auth.actions.ts`
  - `apps/frontend/src/app/core/auth/store/auth.reducer.ts`
  - `apps/frontend/src/app/core/auth/store/auth.effects.ts`
  - `apps/frontend/src/app/core/auth/store/auth.selectors.ts`

---

### S0-FE-004 : Créer AuthService
- **Branch :** `feature/S0-FE-004-auth-service`
- **Commit :** `feat(auth): create auth service`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done
- **Description :**
  - Méthodes : `login()`, `logout()`, `refresh()`
  - Pas de stockage de token — NgRx store = single source of truth
- **Files :**
  - `apps/frontend/src/app/core/auth/auth.service.ts`

---

### S0-FE-005 : Créer AuthInterceptor
- **Branch :** `feature/S0-FE-005-auth-interceptor`
- **Commit :** `feat(auth): create auth interceptor reading from NgRx store`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done
- **Description :**
  - Interceptor fonctionnel (pas de classe)
  - Lit `access_token` depuis `store.select(selectAccessToken).pipe(take(1))`
  - Ajoute header `Authorization: Bearer <token>`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
        return next(authReq);
      }
      return next(req);
    })
  );
};
```

> **Pourquoi `take(1)` ?** `store.select()` retourne un Observable infini. `take(1)` se désabonne automatiquement après la première valeur — pas de fuite mémoire.

- **Files :**
  - `apps/frontend/src/app/core/interceptors/auth.interceptor.ts`

---

### S0-FE-006 : Créer AuthGuard
- **Branch :** `feature/S0-FE-006-auth-guard`
- **Commit :** `feat(auth): create auth guard with UrlTree`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done

```typescript
export const AuthGuard = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((isAuthenticated) =>
      isAuthenticated ? true : router.createUrlTree(['/login'])
    )
  );
};
```

> **Pourquoi `UrlTree` ?** Angular gère la priorité entre plusieurs guards avec UrlTree. `false` + `navigate()` peut créer des conflits si plusieurs guards s'exécutent.

- **Files :**
  - `apps/frontend/src/app/core/guards/auth.guard.ts`

---

### S0-FE-007 : Créer LoginComponent
- **Branch :** `feature/S0-FE-007-login`
- **Commit :** `feat(auth): create login component with PrimeNG`
- **Priority :** P0 | **SP :** 2
- **Status :** ✅ Done
- **Description :**
  - Standalone component
  - Reactive Form : email, password
  - PrimeNG : `p-inputtext`, `p-password`, `p-button`
  - `inject()` — pas de constructor injection
  - Dispatch `AuthActions.login` au submit
- **Files :**
  - `apps/frontend/src/app/features/auth/login/login.component.ts`

---

### S0-FE-008 : Configurer les routes
- **Branch :** `feature/S0-FE-008-routes`
- **Commit :** `chore(routing): configure app routes with lazy loading`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done

```typescript
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
```

- **Files :**
  - `apps/frontend/src/app/app.routes.ts`

---

### S0-FE-009 : Créer DashboardComponent (placeholder)
- **Branch :** `feature/S0-FE-009-dashboard`
- **Commit :** `feat(dashboard): create dashboard placeholder component`
- **Priority :** P2 | **SP :** 1
- **Status :** ✅ Done
- **Description :** Standalone component placeholder — stats réelles en Sprint 8
- **Files :**
  - `apps/frontend/src/app/features/dashboard/dashboard.component.ts`

---

### S0-FE-010 : Configurer environments
- **Branch :** `feature/S0-FE-010-environments`
- **Commit :** `chore(config): configure environment files`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done
- **Description :**
  - `environment.ts` — base (gitignored)
  - `environment.dev.ts` — valeurs locales (gitignored)
  - `environment.prod.ts` — production (committé)
  - `environment.example.ts` — template (committé)
  - `fileReplacements` dans `project.json`
  - Toujours importer `environment.ts` uniquement
- **Files :**
  - `apps/frontend/src/environments/environment.ts`
  - `apps/frontend/src/environments/environment.dev.ts`
  - `apps/frontend/src/environments/environment.prod.ts`
  - `apps/frontend/src/environments/environment.example.ts`

---

### S0-FE-011 : Refactor — Token dans NgRx store
- **Branch :** `feature/S0-FE-011-token-ngrx-store`
- **Commit :** `refactor(auth): read token from NgRx store instead of AuthService`
- **Priority :** P0 | **SP :** 1
- **Status :** ✅ Done
- **Description :**
  - Interceptor lit `selectAccessToken` depuis le store
  - `AuthService` ne stocke plus le token
  - `auth.effects.ts` ne fait plus `authService.setAccessToken()`
  - `selectAccessToken` ajouté dans `auth.selectors.ts`

---

## Definition of Done - Sprint 0

**Infrastructure :**
- ✅ Docker PostgreSQL + pgAdmin démarrés
- ✅ Prisma schema appliqué, tables créées
- ✅ NestJS démarre sur http://localhost:3000

**Auth :**
- ✅ `POST /auth/login` retourne `{ access_token, user }` ou HTTP 401
- ✅ Seed : 3 utilisateurs créés avec `upsert`
- ✅ RolesGuard opérationnel

**Frontend :**
- ✅ `nx serve frontend` démarre sur http://localhost:4200
- ✅ Login → Dashboard fonctionnel
- ✅ NgRx store auth configuré
- ✅ Interceptor lit le token depuis le store
- ✅ AuthGuard avec UrlTree
- ✅ PrimeNG 19 + Tailwind CSS v4 opérationnels

---

## 🚀 Commandes Rapides

```bash
# DB
docker compose up -d postgres pgadmin

# Backend
cd apps/backend
nx serve backend

# Prisma (depuis apps/backend/)
npx prisma migrate dev --config prisma.config.ts
npx prisma generate --config prisma.config.ts
npx prisma db seed --config prisma.config.ts
npx prisma studio --config prisma.config.ts

# Frontend
nx serve frontend
```