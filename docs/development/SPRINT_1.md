# Sprint 1 - Auth & Layout

## 🎯 Objectif Sprint

Auth complète avec refresh token cookie httpOnly + layout de l'application (Shell, Sidebar, Header).

**Durée estimée :** 2-3 jours
**Story Points :** 21 points
**Statut :** 🔄 En cours

---

## Backend Tasks

### S1-BE-001 : RolesGuard + décorateurs

- **Type :** Feature
- **Status :** ✅ Done
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `feature/S1-BE-001-roles-guard`
- **Commit :** `feat(auth): create RolesGuard and @Roles decorator`
- **Description :**
  - Créer `RolesGuard` utilisant `Reflector`
  - Créer décorateur `@Roles(...roles)`
  - Support plusieurs rôles : `@Roles(UserRole.ADMIN, UserRole.MANAGER)`
  - Retourne HTTP 403 si rôle insuffisant

```typescript
// apps/backend/src/auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// apps/backend/src/auth/decorators/roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

- **Acceptance Criteria :**
  - ✅ Guard fonctionne avec 1 ou plusieurs rôles
  - ✅ HTTP 403 si rôle insuffisant
- **Files :**
  - `apps/backend/src/auth/guards/roles.guard.ts`
  - `apps/backend/src/auth/decorators/roles.decorator.ts`

---

### S1-BE-002 : Endpoint GET /auth/me _(P2 — optionnel)_

- **Type :** Feature
- **Status :** Skipped
- **Priority :** P2
- **Story Points :** 1
- **Branch :** `feature/S1-BE-002-auth-me`
- **Commit :** `feat(auth): add GET /auth/me endpoint`
- **Description :**
  - **Déprioritisé** — pas nécessaire si S1-BE-003 (refresh token) est implémenté.
    Le refresh retourne déjà `{ access_token, user }`.
  - À implémenter uniquement si S1-BE-003 n'est pas prêt à temps.

```typescript
// Décorateur CurrentUser
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);

// Controller
@Get('me')
@UseGuards(AuthGuard('jwt'))
getMe(@CurrentUser() user: any) {
  return this.authService.findMe(user.userId);
}

// Service — select pour ne jamais exposer passwordHash
async findMe(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, tourOperatorId: true },
  });
}
```

- **Acceptance Criteria :**
  - ✅ GET /auth/me retourne user sans passwordHash
  - ✅ HTTP 401 si JWT invalide

- **Status :** ❌ Cancelled — obsolète depuis S1-BE-005. `/auth/refresh` retourne déjà `{ user }` via full httpOnly cookie.
---

### S1-BE-003 : Refresh token (cookie httpOnly) _(P0)_

Look at S1-BE-005

---

### S1-BE-004 : Seed data utilisateurs _(déjà fait en S0-BE-007)_

- **Status :** ✅ Done (S0-BE-006)
- **Note :** `ROLES_KEY` extrait en constante exportée dans le décorateur — légèrement différent du snippet du doc mais fonctionnellement identique.

---

### S1-BE-005 : Fix LoginResponse — access_token et refresh_token en cookies httpOnly

- **Type :** Bugfix / Refactor
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `fix/S1-BE-005-login-response-cookies`
- **Commit :** `fix(auth): move access_token to httpOnly cookie, return user only in body`

#### Description

**Nouveaux endpoints**

| Endpoint | Rôle |
| ---------------------- | ------------------------------------------------------- |
| `POST /auth/login` | Set les deux cookies, retourne `{ user }` |
| `POST /auth/refresh` | Vérifie le refresh token, set un nouveau access token cookie |
| `POST /auth/logout` | Efface les deux cookies |

**Corrections de design**

- `register` ne connecte plus automatiquement — cohérent avec le flux B2B où c'est l'admin qui crée les comptes
- `UserTokenData` supprimé — `UserResponseType` est la source de vérité unique, `passwordHash` ne peut plus fuiter
- `catch` typé — les erreurs 500 ne sont plus masquées en 401

**Sécurité JWT renforcée**

- Deux secrets distincts : `JWT_SECRET` pour l'access, `JWT_REFRESH_SECRET` pour le refresh
- Champ `type: 'access' | 'refresh'` dans le payload vérifié explicitement des deux côtés — un refresh token ne peut pas usurper un access token même si les secrets étaient compromis

**Infrastructure**

- `cookie-parser` installé et enregistré avant tous les middlewares
- `JwtStrategy` migré vers un extracteur cookie custom au lieu du header `Authorization: Bearer`

#### Acceptance Criteria

- ✅ Login retourne `{ user }` + set deux cookies httpOnly (`access_token`, `refresh_token`)
- ✅ POST `/auth/refresh` valide le cookie et retourne un nouveau cookie `access_token`
- ✅ POST `/auth/logout` efface les deux cookies
- ✅ `register` ne connecte plus automatiquement
- ✅ `passwordHash` impossible à exposer via `UserResponseType`
- ✅ `cookie-parser` enregistré avant tous les middlewares

#### Files

- `apps/backend/src/auth/auth.controller.ts`
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/auth/strategies/jwt.strategy.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/main.ts`

---

## Frontend Tasks

### S1-FE-001 : RoleGuard

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `feature/S1-FE-001-role-guard`
- **Commit :** `feat(auth): create role guard with UrlTree`
- **Description :**
  - Guard fonctionnel lisant `selectUserRole` depuis le store
  - Rôles attendus depuis `route.data['roles']`
  - Redirige vers `/dashboard` (pas `/login`) si rôle insuffisant

```typescript
// apps/frontend/src/app/core/guards/role.guard.ts
export const RoleGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[];

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (!requiredRoles || requiredRoles.includes(role!)) return true;
      return router.createUrlTree(['/dashboard']); // UrlTree — pas navigate()
    })
  );
};

// Utilisation dans les routes
{
  path: 'admin',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: ...
}
```

> **Pourquoi rediriger vers `/dashboard` et pas `/login` ?**
> L'utilisateur est authentifié — il a juste le mauvais rôle.
> Le renvoyer vers `/login` serait incohérent.

- **Acceptance Criteria :**
  - ✅ Guard bloque selon le rôle
  - ✅ Redirige vers `/dashboard` si rôle insuffisant
  - ✅ UrlTree utilisé (pas navigate())
  - ✅ take(1) utilisé
- **Files :**
  - `apps/frontend/src/app/core/guards/role.guard.ts`

---

### S1-FE-002 : Shell component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S1-FE-002-shell`
- **Commit :** `feat(shell): create shell layout component`
- **Description :**
  - Layout : Sidebar + Header + `<router-outlet>`
  - Lazy-loadé via `loadComponent`
  - Route parente pour toutes les pages protégées
  - Ajouter `redirectIfAuthenticatedGuard` sur la route `/login`
    Si connecté → redirige vers `/dashboard`

```typescript
// app.routes.ts
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
}
```

> **Pourquoi lazy-loader le Shell ?**
> Cohérence — tous les composants sont lazy-loadés.
> Le Shell est chargé uniquement quand l'utilisateur accède à une route protégée.

> **Pourquoi Shell sur la route parente ?**
> DRY — Sidebar + Header définis une seule fois pour toutes les routes protégées.

- **Acceptance Criteria :**
  - ✅ Shell visible sur toutes les routes protégées
  - ✅ `/login` n'affiche PAS le Shell
  - ✅ `<router-outlet>` dans la zone main
- **Files :**
  - `apps/frontend/src/app/core/shell/shell.component.ts`

---

### S1-FE-003 : Sidebar component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S1-FE-003-sidebar`
- **Commit :** `feat(shell): create sidebar component with role-based navigation`
- **Description :**
  - Navigation items filtrés selon `selectUserRole`
  - Sprint 1 : Dashboard uniquement — items ajoutés au fil des sprints
  - `RouterLinkActive` pour le lien actif
  - PrimeNG primeicons

**Items sidebar par rôle :**

| Item                      | ADMIN | MANAGER | AGENT |
| ------------------------- | ----- | ------- | ----- |
| Dashboard                 | ✅    | ✅      | ✅    |
| Hotels _(Sprint 2)_       | ✅    | ✅      | ❌    |
| Saisons _(Sprint 2)_      | ✅    | ✅      | ❌    |
| Référentiels _(Sprint 3)_ | ✅    | ✅      | ❌    |
| Contrats _(Sprint 4)_     | ✅    | ✅      | ❌    |
| Offres _(Sprint 5)_       | ✅    | ✅      | ❌    |
| Booking _(Sprint 6)_      | ✅    | ✅      | ✅    |
| Historique _(Sprint 8)_   | ✅    | ✅      | ✅    |

- **Acceptance Criteria :**
  - ✅ Items filtrés selon le rôle
  - ✅ Lien actif mis en évidence
  - ✅ Navigation fonctionne
- **Files :**
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.ts`

---

### S1-FE-004 : Header component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `feature/S1-FE-004-header`
- **Commit :** `feat(shell): create header component`
- **Description :**
  - Affiche `firstName + lastName` depuis `selectCurrentUser`
  - Badge rôle avec **`p-tag`** PrimeNG
  - `p-avatar` avec initiales de l'utilisateur
  - Bouton logout
- **Acceptance Criteria :**
  - ✅ Nom utilisateur affiché
  - ✅ Badge rôle visible
  - ✅ Bouton logout présent
- **Files :**
  - `apps/frontend/src/app/core/shell/header/header.component.ts`

---

### S1-FE-005 : Logout fonctionnel

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `feature/S1-FE-005-logout`
- **Commit :** `feat(auth): implement logout with cookie invalidation`
- **Description :**
  - Bouton logout dans Header dispatch `AuthActions.logout`
  - Effect : appelle `POST /auth/logout` (invalide cookie) → redirect `/login`
  - Store NgRx réinitialisé via reducer

```typescript
logout$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          tap(() => void this.router.navigate(['/login'])),
          catchError(() => {
            void this.router.navigate(['/login']);
            return EMPTY;
          })
        )
      )
    ),
  { dispatch: false }
);
```

- **Acceptance Criteria :**
  - ✅ Logout invalide le cookie refresh token
  - ✅ Store NgRx réinitialisé
  - ✅ Redirection vers `/login`
- **Files :**
  - `apps/frontend/src/app/core/auth/store/auth.effects.ts`
  - `apps/frontend/src/app/core/shell/header/header.component.ts`

---

### S1-FE-006 : Rehydratation au reload _(dépend de S1-BE-003)_

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S1-FE-006-rehydratation`
- **Commit :** `feat(auth): add app initializer for session rehydration`
- **Description :**
  - Au démarrage de l'app → `POST /auth/refresh`
  - Cookie httpOnly envoyé automatiquement par le navigateur
  - Succès → dispatch `loginSuccess({ access_token, user })`
  - Échec → ne rien faire → `AuthGuard` redirige vers `/login`

```typescript
// app.config.ts
{
  provide: APP_INITIALIZER,
  useFactory: (store: Store, authService: AuthService) => () =>
    authService.refresh().pipe(
      tap((response) => store.dispatch(AuthActions.loginSuccess({
        user: response.user,
        accessToken: response.access_token,
      }))),
      catchError(() => EMPTY), // Silencieux — AuthGuard gère la redirection
    ),
  deps: [Store, AuthService],
  multi: true,
}
```

> **Pourquoi pas `GET /auth/me` ?**
> Avec le cookie httpOnly, `POST /auth/refresh` retourne déjà `{ access_token, user }`.
> `GET /auth/me` est redondant — il nécessiterait un access_token valide en mémoire,
> ce qui n'est pas le cas au reload.

- **Acceptance Criteria :**
  - ✅ Reload de page ne déconnecte pas l'utilisateur
  - ✅ Store rehydraté silencieusement
  - ✅ Si cookie expiré → AuthGuard redirige vers `/login`
- **Files :**
  - `apps/frontend/src/app/app.config.ts`

---

### S1-FE-007 : Refresh token interceptor _(dépend de S1-BE-003)_

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S1-FE-007-refresh-interceptor`
- **Commit :** `feat(auth): add refresh token interceptor for 401 handling`
- **Description :**
  - Sur réception d'un HTTP 401 :
    - Appeler `POST /auth/refresh`
    - Succès → stocker nouveau `access_token` dans le store → retry requête originale
    - Échec → dispatch `AuthActions.logout`
  - Exclure `/auth/login` et `/auth/refresh` du retry
  - Gérer les requêtes parallèles (un seul refresh à la fois)

```typescript
// apps/frontend/src/app/core/interceptors/refresh.interceptor.ts
return next(authReq).pipe(
  catchError((error) => {
    if (error.status === 401 && !req.url.includes('/auth/')) {
      return authService.refresh().pipe(
        switchMap(({ access_token, user }) => {
          store.dispatch(
            AuthActions.loginSuccess({ user, accessToken: access_token })
          );
          const retryReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${access_token}`),
          });
          return next(retryReq);
        }),
        catchError(() => {
          store.dispatch(AuthActions.logout());
          return throwError(() => error);
        })
      );
    }
    return throwError(() => error);
  })
);
```

- **Acceptance Criteria :**
  - ✅ 401 → refresh → retry fonctionne
  - ✅ `/auth/login` et `/auth/refresh` exclus du retry
  - ✅ Échec du refresh → logout
- **Files :**
  - `apps/frontend/src/app/core/interceptors/refresh.interceptor.ts`
  - `apps/frontend/src/app/app.config.ts` (enregistrer l'interceptor)

---

### S1-FE-008 : Sidebar theming

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feature/S1-FE-008-sidebar-theming`
- **Commit :** `feat(shell): apply Runner theme to sidebar`
- **Description :**
  - Remplacer les couleurs hardcodées du SCSS par les design tokens PrimeNG
  - Palette marron/beige Runner (inspirée Claude AI)
  - Nettoyage SCSS général
- **Acceptance Criteria :**
  - ✅ Sidebar utilise les variables PrimeNG (pas de couleurs hardcodées)
  - ✅ Palette Runner appliquée
- **Files :**
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.scss`
  - `apps/frontend/src/styles.css` (variables globales Runner)
- **Status :** ✅ Done

---

### S1-FE-009 : Cleanup Sprint 1 — debug logs and dead code

- **Type :** Refactor
- **Priority :** P2
- **Story Points :** 0
- **Branch :** `refactor/S1-FE-009-cleanup`
- **Commit :** `refactor(auth): remove debug logs and dead code`
- **Description :**
  - Retirer console.log de login$ effect
  - Supprimer logout$ commenté dans auth.effects.ts
  - Retirer commentaire simulation state dans app.config.ts
- **Acceptance Criteria :**
  - ✅ Aucun console.log en production
  - ✅ Aucun code commenté
- **Files :**
  - `apps/frontend/src/app/core/auth/store/auth.effects.ts`
  - `apps/frontend/src/app/app.config.ts`
- **Status :** ✅ Done

---

### S1-FE-011 : Login page UX/UI improvement

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 1
- **Branch :** `feature/S1-FE-011-login-ui`
- **Commit :** `feat(auth): improve login page UX/UI`
- **Description :**
  - Centrer la page avec card
  - Header avec icône Runner et tagline
  - Structure HTML corrigée — champs email et password dans leurs propres divs
  - Variables PrimeNG Aura pour le theming (--p-surface-\*, --p-primary-color)
  - Placeholder email
  - Label "Sign in" au lieu de "Login"
  - `fluid` sur tous les inputs
  - `!!` cast sur `isLoading$` pour éviter null avec `[disabled]` et `[loading]`
  - Retrait `CommonModule` inutile
  - `styleUrl` singulier — Angular 19
- **Acceptance Criteria :**
  - ✅ Page centrée avec card
  - ✅ Validation des champs fonctionnelle
  - ✅ Loading state sur le bouton
  - ✅ Erreur store affichée
- **Files :**
  - `apps/frontend/src/app/features/auth/login/login.component.ts`
  - `apps/frontend/src/app/features/auth/login/login.component.html`
  - `apps/frontend/src/app/features/auth/login/login.component.scss`
- **Status :** ✅ Done

---

### S1-FE-012 : Dark/Light mode toggle

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 1
- **Branch :** `feature/S1-FE-012-dark-light-toggle`
- **Commit :** `feat(shell): add dark/light mode toggle`
- **Description :**
  - Bouton toggle dans le Header
  - Ajouter/retirer classe `.app-dark` sur `<body>`
  - Cohérent avec `darkModeSelector: '.app-dark'` configuré dans `app.config.ts`
  - Persister le choix dans localStorage
- **Acceptance Criteria :**
  - ✅ Toggle visible dans le Header
  - ✅ Dark/light mode fonctionne sur tous les composants PrimeNG
  - ✅ Choix persisté au reload
- **Files :**
  - `apps/frontend/src/app/core/shell/header/header.component.ts`
  - `apps/frontend/src/app/core/shell/header/header.component.html`
- **Status :** ⏳ À faire

---

## Definition of Done - Sprint 1

- ✅ Login réel frontend ↔ backend fonctionne
- ✅ Layout Shell visible avec Sidebar + Header sur toutes les pages protégées
- ✅ `/login` n'affiche PAS le Shell
- ✅ Logout invalide le cookie refresh token en DB
- ✅ Store NgRx réinitialisé après logout
- ✅ RoleGuard bloque les routes selon le rôle
- ✅ Redirection `/dashboard` si rôle insuffisant (pas `/login`)
- ✅ Reload de page ne déconnecte pas l'utilisateur (cookie httpOnly)
- ✅ HTTP 401 → refresh automatique → retry (interceptor)

---

## Convention commits Sprint 1

```
feat(auth): implement refresh token with httpOnly cookie
feat(auth): add GET /auth/me endpoint
feat(auth): create role guard with UrlTree
feat(shell): create shell layout component
feat(shell): create sidebar component with role-based navigation
feat(shell): create header component
feat(auth): implement logout with cookie invalidation
feat(auth): add app initializer for session rehydration
feat(auth): add refresh token interceptor for 401 handling
```

---

## Dépendances

- Sprint 0 ✅ doit être terminé
