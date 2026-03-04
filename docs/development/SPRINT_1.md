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
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
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

### S1-BE-002 : Endpoint GET /auth/me *(P2 — optionnel)*
- **Type :** Feature
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

---

### S1-BE-003 : Refresh token (cookie httpOnly) *(P0)*
- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S1-BE-003-refresh-token`
- **Commit :** `feat(auth): implement refresh token with httpOnly cookie`
- **Description :**
  - Générer 2 tokens à la connexion : `access_token` (15min) + `refresh_token` (7j)
  - Stocker le refresh token **hashé** en base (table `RefreshToken`)
  - Envoyer via cookie httpOnly

**Pourquoi cookie httpOnly ?**
- `access_token` en mémoire (NgRx store) — sécurisé contre XSS, perdu au reload
- `refresh_token` en cookie httpOnly — jamais accessible en JavaScript,
  envoyé automatiquement par le navigateur, survit au reload de page

**Schema Prisma à ajouter :**
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

```typescript
// POST /auth/login
@Post('login')
async login(@Body() body, @Res({ passthrough: true }) res: Response) {
  const user = await this.authService.validateUser(body.email, body.password);
  if (!user) throw new UnauthorizedException('Invalid credentials');
  const result = await this.authService.login(user);

  res.cookie('refresh_token', result.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Ne jamais retourner refresh_token dans le body
  return { access_token: result.access_token, user: result.user };
}

// POST /auth/refresh — cookie envoyé automatiquement
@Post('refresh')
async refresh(@Req() req: Request) {
  const refreshToken = req.cookies['refresh_token'];
  if (!refreshToken) throw new UnauthorizedException();
  return this.authService.refreshToken(refreshToken);
  // Retourne : { access_token, user }
}

// POST /auth/logout
@Post('logout')
@UseGuards(AuthGuard('jwt'))
async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies['refresh_token'];
  if (refreshToken) await this.authService.revokeRefreshToken(refreshToken);
  res.clearCookie('refresh_token');
  return { success: true };
}
```

- **Acceptance Criteria :**
  - ✅ Login retourne `{ access_token, user }` + set cookie httpOnly
  - ✅ POST /auth/refresh valide le cookie et retourne nouveau `access_token` + `user`
  - ✅ POST /auth/logout invalide le token en DB + efface le cookie
  - ✅ Refresh token hashé en DB
- **Files :**
  - `apps/backend/src/auth/auth.controller.ts`
  - `apps/backend/src/auth/auth.service.ts`
  - `apps/backend/prisma/schema.prisma`

---

### S1-BE-004 : Seed data utilisateurs *(déjà fait en S0-BE-006)*
- **Status :** ✅ Done (Sprint 0)
- **Note :** Seed créé en S0-BE-006 avec `upsert`. Rien à faire.

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

| Item | ADMIN | MANAGER | AGENT |
|------|-------|---------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Hotels *(Sprint 2)* | ✅ | ✅ | ❌ |
| Saisons *(Sprint 2)* | ✅ | ✅ | ❌ |
| Référentiels *(Sprint 3)* | ✅ | ✅ | ❌ |
| Contrats *(Sprint 4)* | ✅ | ✅ | ❌ |
| Offres *(Sprint 5)* | ✅ | ✅ | ❌ |
| Booking *(Sprint 6)* | ✅ | ✅ | ✅ |
| Historique *(Sprint 8)* | ✅ | ✅ | ✅ |

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
  () => this.actions$.pipe(
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

### S1-FE-006 : Rehydratation au reload *(dépend de S1-BE-003)*
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

### S1-FE-007 : Refresh token interceptor *(dépend de S1-BE-003)*
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
          store.dispatch(AuthActions.loginSuccess({ user, accessToken: access_token }));
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

## Ordre d'exécution Sprint 1

```
Backend :
S1-BE-001 (RolesGuard)
S1-BE-003 (Refresh token) ← P0
S1-BE-002 (GET /auth/me)  ← P2, seulement si temps restant

Frontend :
S1-FE-001 (RoleGuard)
  → S1-FE-002 (Shell)
    → S1-FE-003 (Sidebar)
    → S1-FE-004 (Header)
      → S1-FE-005 (Logout)
  → (attendre S1-BE-003)
    → S1-FE-006 (Rehydratation)
    → S1-FE-007 (Refresh interceptor)
```

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
feat(auth): create RolesGuard and @Roles decorator
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

---

## Risques
| Risque | Mitigation |
|--------|------------|
| Cookie httpOnly bloqué CORS | Configurer `credentials: 'include'` + CORS backend |
| Refresh loop infini | Exclure `/auth/refresh` du retry dans l'interceptor |
| Requêtes parallèles sur 401 | Un seul refresh à la fois (flag ou BehaviorSubject) |
