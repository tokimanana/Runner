# Sprint 0 - Setup Infrastructure

## 🎯 Objectif Sprint
Mettre en place toute l'infrastructure du projet : monorepo NX, backend NestJS, frontend Angular 19, base de données PostgreSQL, authentification JWT basique.

**Durée estimée :** 1-2 jours
**Statut :** ✅ Terminé

> **Documentation détaillée :** voir `SPRINT_0_SETUP.md`

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
| ORM | Prisma | Type-safe, migrations |
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
- **Status :** ✅ Done
- **Files :**
  - `apps/backend/src/main.ts`
  - `apps/backend/src/app.module.ts`

---

### S0-BE-002 : Configurer Prisma + PostgreSQL
- **Branch :** `feature/S0-BE-002-prisma-setup`
- **Commit :** `feat(backend): configure Prisma with PostgreSQL`
- **Status :** ✅ Done
- **Files :**
  - `apps/backend/prisma/schema.prisma`
  - `docker-compose.yml`
  - `apps/backend/.env`

---

### S0-BE-003 : Créer AuthModule (JWT basique)
- **Branch :** `feature/S0-BE-003-auth-module`
- **Commit :** `feat(auth): create auth module with JWT strategy`
- **Status :** ✅ Done
- **Description :**
  - `POST /auth/login` → retourne `{ access_token, user }` ou HTTP 401
  - JWT Strategy avec Passport
  - Validation : `throw new UnauthorizedException()` (jamais `return { error }`)
- **Files :**
  - `apps/backend/src/auth/auth.module.ts`
  - `apps/backend/src/auth/auth.service.ts`
  - `apps/backend/src/auth/auth.controller.ts`
  - `apps/backend/src/auth/strategies/jwt.strategy.ts`
  - `apps/backend/src/auth/guards/jwt-auth.guard.ts`

---

### S0-BE-004 : Créer HotelsModule (stub)
- **Branch :** `feature/S0-BE-004-hotels-stub`
- **Commit :** `feat(hotels): create hotels module stub`
- **Status :** ✅ Done
- **Description :**
  - Module créé avec structure de base
  - CRUD complet implémenté en Sprint 2
- **Files :**
  - `apps/backend/src/hotels/hotels.module.ts`
  - `apps/backend/src/hotels/hotels.controller.ts`
  - `apps/backend/src/hotels/hotels.service.ts`

---

### S0-BE-005 : Créer RolesGuard
- **Branch :** `feature/S0-BE-005-roles-guard`
- **Commit :** `feat(auth): create roles guard with Reflector`
- **Status :** ✅ Done

```typescript
// apps/backend/src/auth/guards/roles.guard.ts
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
// apps/backend/src/auth/decorators/roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

---

### S0-BE-006 : Seed data utilisateurs
- **Branch :** `feature/S0-BE-006-seed`
- **Commit :** `feat(seed): add users seed with bcrypt`
- **Status :** ✅ Done

```typescript
// apps/backend/prisma/seed.ts
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

---

## Frontend Tasks

### S0-FE-001 : Initialiser Angular 19 dans NX
- **Branch :** `feature/S0-FE-001-angular-init`
- **Commit :** `feat(frontend): initialize Angular 19 standalone app`
- **Status :** ✅ Done
- **Files :**
  - `apps/frontend/src/main.ts`
  - `apps/frontend/src/app/app.config.ts`
  - `apps/frontend/src/app/app.routes.ts`

---

### S0-FE-002 : Installer PrimeNG 19 + Tailwind CSS v4
- **Branch :** `feature/S0-FE-002-primeng-tailwind`
- **Commit :** `feat(frontend): install PrimeNG 19 and Tailwind CSS v4`
- **Status :** ✅ Done
- **Files :**
  - `apps/frontend/src/styles.css`
  - `apps/frontend/tailwind.config.js`

---

### S0-FE-003 : Configurer NgRx Store (auth)
- **Branch :** `feature/S0-FE-003-ngrx-auth`
- **Commit :** `feat(auth): configure NgRx store for auth`
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
- **Status :** ✅ Done
- **Description :**
  - Méthodes : `login()`, `logout()`, `refresh()`
  - Pas de stockage de token (NgRx store = single source of truth)
- **Files :**
  - `apps/frontend/src/app/core/auth/auth.service.ts`

---

### S0-FE-005 : Créer AuthInterceptor
- **Branch :** `feature/S0-FE-005-auth-interceptor`
- **Commit :** `feat(auth): create auth interceptor reading from NgRx store`
- **Status :** ✅ Done
- **Description :**
  - Interceptor fonctionnel (pas de classe)
  - Lit `access_token` depuis `store.select(selectAccessToken).pipe(take(1))`
  - Ajoute header `Authorization: Bearer <token>`

```typescript
// apps/frontend/src/app/core/interceptors/auth.interceptor.ts
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

> **Pourquoi `take(1)` ?**
> `store.select()` retourne un Observable infini. `take(1)` se désabonne
> automatiquement après la première valeur — pas de fuite mémoire.

> **Pourquoi lire depuis le store et pas AuthService ?**
> Le store est la single source of truth. Lire depuis AuthService
> crée un risque de divergence entre le store et le service.

---

### S0-FE-006 : Créer AuthGuard
- **Branch :** `feature/S0-FE-006-auth-guard`
- **Commit :** `feat(auth): create auth guard with UrlTree`
- **Status :** ✅ Done

```typescript
// apps/frontend/src/app/core/guards/auth.guard.ts
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

> **Pourquoi `UrlTree` et pas `router.navigate() + return false` ?**
> Angular gère la priorité entre plusieurs guards avec UrlTree.
> `false` + `navigate()` peut créer des conflits si plusieurs guards s'exécutent.

---

### S0-FE-007 : Créer LoginComponent
- **Branch :** `feature/S0-FE-007-login`
- **Commit :** `feat(auth): create login component with PrimeNG`
- **Status :** ✅ Done
- **Description :**
  - Standalone component
  - **Reactive Form** : email, password
  - PrimeNG : `p-inputtext`, `p-password`, `p-button`
  - `inject()` — pas de constructor injection
  - Dispatch `AuthActions.login` au submit
- **Files :**
  - `apps/frontend/src/app/features/auth/login/login.component.ts`

---

### S0-FE-008 : Configurer les routes
- **Branch :** `feature/S0-FE-008-routes`
- **Commit :** `chore(routing): configure app routes with lazy loading`
- **Status :** ✅ Done

```typescript
// app.routes.ts
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

---

### S0-FE-009 : Créer DashboardComponent (placeholder)
- **Branch :** `feature/S0-FE-009-dashboard`
- **Commit :** `feat(dashboard): create dashboard placeholder component`
- **Status :** ✅ Done
- **Description :**
  - Standalone component
  - Contenu placeholder — stats réelles en Sprint 8
- **Files :**
  - `apps/frontend/src/app/features/dashboard/dashboard.component.ts`

---

### S0-FE-010 : Configurer environments
- **Branch :** `feature/S0-FE-010-environments`
- **Commit :** `chore(config): configure environment files`
- **Status :** ✅ Done
- **Description :**
  - `environment.ts` — base (gitignored)
  - `environment.dev.ts` — valeurs locales (gitignored)
  - `environment.prod.ts` — production (committé)
  - `environment.example.ts` — template (committé)
  - `fileReplacements` dans `project.json`
  - Toujours importer `environment.ts` uniquement
- **Files :**
  - `apps/frontend/src/environments/environment.ts` (gitignored)
  - `apps/frontend/src/environments/environment.dev.ts` (gitignored)
  - `apps/frontend/src/environments/environment.prod.ts`
  - `apps/frontend/src/environments/environment.example.ts`

---

### S0-FE-011 : Refactor — Token dans NgRx store
- **Branch :** `feature/S0-FE-011-token-ngrx-store`
- **Commit :** `refactor(auth): read token from NgRx store instead of AuthService`
- **Status :** ✅ Done
- **Description :**
  - Interceptor lit `selectAccessToken` depuis le store
  - `AuthService` ne stocke plus le token
  - `auth.effects.ts` ne fait plus `authService.setAccessToken()`
  - `selectAccessToken` ajouté dans `auth.selectors.ts`

---

## Definition of Done - Sprint 0

- ✅ Docker PostgreSQL + pgAdmin démarrés
- ✅ Prisma schema appliqué, tables créées
- ✅ NestJS démarre sur http://localhost:3000
- ✅ `POST /auth/login` retourne `{ access_token, user }` ou HTTP 401
- ✅ `nx serve frontend` démarre sur http://localhost:4200
- ✅ Login → Dashboard fonctionnel
- ✅ NgRx store auth configuré
- ✅ Interceptor lit le token depuis le store (`selectAccessToken`)
- ✅ AuthGuard avec UrlTree
- ✅ PrimeNG 19 + Tailwind CSS v4 opérationnels
- ✅ Environment files configurés (fileReplacements)
- ✅ Seed : 3 utilisateurs créés avec `upsert`
