# Sprint 0 – Setup Infrastructure & Foundation

> ⚠️ Ce document reflète les décisions techniques **réellement prises** sur le projet Runner.
> Il remplace la version initiale qui utilisait Angular Material, NgModule et constructor injection.

---

## Stack technique retenue

| Couche          | Technologie                    | Pourquoi                                            |
| --------------- | ------------------------------ | --------------------------------------------------- |
| Frontend        | Angular 19 standalone          | Pas de NgModule, plus léger, moderne                |
| UI              | PrimeNG 19                     | Tables complexes, wizards, formulaires imbriqués    |
| State Auth      | NgRx 19                        | Partagé partout, traçabilité, time-travel debugging |
| State CRUD      | BehaviorSubject / Signal Store | Données simples par feature, pas besoin de NgRx     |
| Styles          | Tailwind CSS v4 + PrimeNG Aura | Utility-first, cohérent avec PrimeNG                |
| Monorepo        | NX 22                          | Workspace apps/ + libs/ (Sprint 1+)                 |
| Backend         | NestJS 11 + Prisma ORM         | Voir Phase 1                                        |
| Base de données | PostgreSQL 15 (Docker)         | Voir Phase 1                                        |

---

## Phase 1 : Backend Setup (NestJS + Prisma + PostgreSQL)

### 1.1 Initialiser NestJS dans le monorepo NX

```bash
# Depuis la racine du monorepo
nx generate @nx/nest:application backend
```

### 1.2 Installer les dépendances backend

```bash
cd apps/backend

npm install @prisma/client @nestjs/config
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install bcrypt class-validator class-transformer
npm install -D prisma @types/passport-jwt @types/bcrypt
```

### 1.3 Initialiser Prisma

```bash
npx prisma init
```

Crée :

- `prisma/schema.prisma`
- `.env`

### 1.4 Configurer `.env` (backend)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tour_operator?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
```

> ⚠️ Ne jamais commiter `.env`. Commiter `.env.example` avec des valeurs fictives.

### 1.5 Créer `docker-compose.yml` à la racine du monorepo

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: runner-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tour_operator
    ports:
      - '5432:5432'
    volumes:
      - postgres-data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: runner-pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - '5050:80'
    depends_on:
      - postgres

volumes:
  postgres-data:
```

```bash
docker-compose up -d
docker ps
# pgAdmin : http://localhost:5050
```

### 1.6 Copier le schema Prisma et générer le client

```bash
# Copier schema.prisma depuis /docs/schema.prisma.txt
npx prisma generate
npx prisma migrate dev --name init
```

### 1.7 PrismaModule global

**`apps/backend/src/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**`apps/backend/src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 1.8 Auth Module

```bash
nest g module auth
nest g controller auth
nest g service auth
```

**`apps/backend/src/auth/auth.controller.ts`**

```typescript
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      // ✅ Retourner HTTP 401, pas { error: '...' } avec HTTP 200
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
```

> ⚠️ **Bonne pratique** : toujours utiliser `throw new UnauthorizedException()` de NestJS.
> Ne jamais retourner `{ error: '...' }` avec un HTTP 200 — le frontend ne pourra pas catcher l'erreur correctement.

**`apps/backend/src/auth/auth.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tourOperatorId: user.tourOperatorId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tourOperatorId: user.tourOperatorId,
      },
    };
  }
}
```

**`apps/backend/src/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tourOperatorId: payload.tourOperatorId,
    };
  }
}
```

### 1.9 Hotels Module minimal

```bash
nest g module hotels
nest g controller hotels
nest g service hotels
```

Endpoints minimaux pour Sprint 0 :

- `GET /hotels` — liste (protégé JWT)
- `POST /hotels` — création (protégé JWT)

---

## Phase 2 : Frontend Setup (Angular 19 + NX)

### 2.1 Structure des fichiers

```
apps/frontend/src/app/
├── core/
│   ├── auth/
│   │   ├── models/
│   │   │   └── auth.model.ts
│   │   ├── store/
│   │   │   ├── auth.state.ts
│   │   │   ├── auth.actions.ts
│   │   │   ├── auth.reducer.ts
│   │   │   ├── auth.selectors.ts
│   │   │   └── auth.effects.ts
│   │   └── auth.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts
├── features/
│   ├── auth/login/
│   │   ├── login.component.ts
│   │   └── login.component.html
│   └── dashboard/
│       └── dashboard.component.ts
├── app.config.ts
├── app.routes.ts
└── app.component.ts
```

### 2.2 Environments

```
apps/frontend/src/environments/
├── environment.ts        ← copié depuis environment.prod.ts (ignoré Git)
├── environment.dev.ts    ← valeurs locales (ignoré Git)
├── environment.prod.ts   ← valeurs production (commité tant que fictif)
└── environment.example.ts ← template commité
```

**`environment.example.ts`**

```typescript
export const environment = {
  production: false, // true en production
  apiUrl: 'http://localhost:3000', // https://api.monapp.com en production
};
```

> Le `fileReplacements` dans `project.json` remplace `environment.ts` par `environment.dev.ts` en développement.
> Ne jamais importer `environment.dev.ts` ou `environment.prod.ts` directement — toujours importer `environment.ts`.

### 2.3 Installer les dépendances frontend

```bash
# UI
npm install primeng @primeng/themes primeicons

# NgRx
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools

# Tailwind CSS v4
npm install tailwindcss @tailwindcss/postcss postcss
```

### 2.4 Configurer Tailwind CSS v4

Créer `apps/frontend/.postcssrc.json` :

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Ajouter dans `apps/frontend/src/styles.scss` :

```scss
@import 'tailwindcss';
@import 'primeicons/primeicons.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
}
```

### 2.5 `app.config.ts`

```typescript
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { authReducer } from './core/auth/store/auth.reducer';
import { AuthEffects } from './core/auth/store/auth.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.dark-mode' } },
    }),
  ],
};
```

### 2.6 Auth Model

```typescript
// auth.model.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tourOperatorId: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
```

### 2.7 NgRx Auth Store

**Décision** : NgRx pour l'auth car le token et l'user sont partagés partout dans l'app.
Pour les features CRUD (Hotels, Contracts...), utiliser BehaviorSubject — plus simple, pas besoin de traçabilité globale.

**`auth.state.ts`**

```typescript
import { User } from '../models/auth.model';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
};
```

**`auth.actions.ts`**

```typescript
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../models/auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ email: string; password: string }>(),
    'Login Success': props<{ user: User; accessToken: string }>(),
    'Login Failure': props<{ error: string }>(),
    Logout: emptyProps(),
    'Logout Success': emptyProps(),
  },
});
```

**`auth.reducer.ts`**

```typescript
import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import { AuthActions } from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, accessToken }) => ({
    ...state,
    isLoading: false,
    user,
    accessToken,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(AuthActions.logout, () => initialAuthState)
);
```

**`auth.selectors.ts`**

```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);
export const selectAccessToken = createSelector(
  selectAuthState,
  (state) => state.accessToken
);
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.user
);
export const selectUserRole = createSelector(
  selectCurrentUser,
  (user) => user?.role ?? null
);
export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);
export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);
```

**`auth.effects.ts`**

```typescript
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../auth.service';
import { AuthActions } from './auth.actions';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) =>
            AuthActions.loginSuccess({
              user: response.user,
              accessToken: response.access_token,
            })
          ),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // ✅ Le token est stocké dans le reducer (store), pas dans AuthService
  // L'effect ne fait que naviguer
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => void this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => void this.router.navigate(['/login']))
      ),
    { dispatch: false }
  );
}
```

### 2.8 AuthService

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { LoginResponse } from './models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
    });
  }
}
```

> **Pourquoi pas de `setAccessToken()` / `getAccessToken()` ?**
> Le token est la responsabilité du store NgRx. `AuthService` ne stocke rien — il fait uniquement les appels HTTP.
> L'interceptor lit le token directement depuis le store via `selectAccessToken`.

### 2.9 Auth Interceptor

```typescript
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, switchMap, take } from 'rxjs';
import { selectAccessToken } from '../auth/store/auth.selectors';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const store = inject(Store);

  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap((token) => {
      if (!token) return next(req);
      const newReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      return next(newReq);
    })
  );
}
```

> **Pourquoi `set` et pas `append` ?**
> `set` remplace le header s'il existe déjà. `append` en ajoute un second.
> Pour Authorization, on veut toujours une seule valeur.

> **Pourquoi lire depuis le store et pas AuthService ?**
> Le store est la source de vérité unique. Si on stockait aussi dans AuthService,
> les deux pourraient diverger — bug difficile à tracer.

### 2.10 Auth Guard

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectIsAuthenticated } from '../auth/store/auth.selectors';

export const AuthGuard = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) return true;
      return router.createUrlTree(['/login']);
    })
  );
};
```

> **Pourquoi `UrlTree` et pas `false` + `router.navigate()` ?**
> `UrlTree` délègue la navigation à Angular qui peut prioriser entre plusieurs guards.
> C'est la bonne pratique Angular 15+.

> **Pourquoi `take(1)` ?**
> `store.select()` retourne une Observable infinie. `take(1)` se désabonne
> après la première valeur — évite les fuites mémoire.

### 2.11 Routes

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
```

> **Pourquoi le Guard sur la route parente et pas sur chaque route enfant ?**
> DRY — en Sprint 2+ il y aura 10+ routes protégées. Le guard sur le parent
> protège automatiquement tous les enfants sans répétition.

> **Pourquoi `loadComponent` (lazy loading) ?**
> Angular ne charge le composant que quand la route est visitée.
> Sur un projet avec 20+ features, ça réduit significativement le bundle initial.

### 2.12 Login Component

**`login.component.ts`**

```typescript
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthActions } from '../../core/auth/store/auth.actions';
import {
  selectIsLoading,
  selectAuthError,
} from '../../core/auth/store/auth.selectors';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AsyncPipe,
    Message,
    Password,
    Button,
    InputText,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  isLoading$: Observable<boolean> = this.store.select(selectIsLoading);
  error$: Observable<string | null> = this.store.select(selectAuthError);

  onLogin(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.store.dispatch(
        AuthActions.login({
          email: this.email?.value,
          password: this.password?.value,
        })
      );
    }
  }
}
```

> **Pourquoi Reactive Forms et pas Template-driven ?**
> Meilleur contrôle depuis le TS, cohérent avec NgRx.
> Template-driven met trop de logique dans le HTML.

> **Pourquoi pas de `reset()` après dispatch ?**
> On ne sait pas encore si le login va réussir. Si échec, l'utilisateur
> doit pouvoir corriger ses credentials sans tout ressaisir.

> **Pourquoi `markAllAsTouched()` avant le `if` ?**
> Pour afficher les erreurs de validation même si l'utilisateur n'a
> pas touché les champs — utile quand il clique Submit directement.

**`login.component.html`**

```html
<div class="card flex justify-center">
  <form
    [formGroup]="loginForm"
    (ngSubmit)="onLogin()"
    class="flex flex-col gap-4 sm:w-56"
  >
    <div class="flex flex-col gap-1">
      <label for="email">Email</label>
      <input pInputText id="email" formControlName="email" type="email" />
      @if (email?.touched && email?.invalid) {
      <p-message severity="error" size="small" variant="simple"
        >Email invalide.</p-message
      >
      }

      <label for="password">Mot de passe</label>
      <p-password
        inputId="password"
        formControlName="password"
        [feedback]="false"
        toggleMask
        fluid
      />
      @if (password?.touched && password?.invalid) {
      <p-message severity="error" size="small" variant="simple"
        >Mot de passe requis.</p-message
      >
      } @if (error$ | async; as error) {
      <p-message severity="error">{{ error }}</p-message>
      }
    </div>

    <p-button
      type="submit"
      label="Se connecter"
      [loading]="isLoading$ | async"
      [disabled]="isLoading$ | async"
    />
  </form>
</div>
```

### 2.13 Dashboard Component (Sprint 0 — vide)

```typescript
import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../core/auth/store/auth.selectors';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe],
  template: `
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenue, {{ (currentUser$ | async)?.firstName }}</p>
    </div>
  `,
})
export class DashboardComponent {
  private readonly store = inject(Store);
  readonly currentUser$ = this.store.select(selectCurrentUser);
}
```

---

## Definition of Done Sprint 0

### Backend

- ✅ Docker PostgreSQL + pgAdmin démarrés
- ✅ Prisma schema appliqué, tables créées
- ✅ NestJS démarre sur http://localhost:3000
- ✅ `POST /auth/login` retourne `{ access_token, user }` ou HTTP 401
- ✅ `GET /hotels` accessible avec JWT valide

### Frontend

- ✅ `nx serve frontend` démarre sur http://localhost:4200
- ✅ `/login` affiche le formulaire
- ✅ `/dashboard` accessible après login, protégé par AuthGuard
- ✅ NgRx store auth configuré et fonctionnel
- ✅ Interceptor ajoute le Bearer token depuis le store
- ✅ Tailwind CSS opérationnel

### Intégration

- ✅ Login frontend → backend → JWT stocké dans le store NgRx
- ✅ Logout réinitialise le store et redirige vers `/login`

---

## Commandes utiles

```bash
# Monorepo
nx serve frontend          # Démarrer le frontend
nx serve backend           # Démarrer le backend
nx build frontend          # Build production frontend

# Prisma
npx prisma generate        # Générer le client TypeScript
npx prisma migrate dev     # Créer une migration
npx prisma db seed         # Lancer le seed
npx prisma studio          # Interface web — http://localhost:5555

# Docker
docker-compose up -d       # Démarrer PostgreSQL + pgAdmin
docker-compose down        # Arrêter les services
docker ps                  # Lister les conteneurs actifs

# Git workflow
git checkout -b feature/S0-FE-XXX-titre   # Nouvelle branche feature
git commit -m "feat(scope): description"   # Convention de commit
# PRs vers dev — jamais vers main directement
```

---

## Conventions de commit

```
feat(auth): implement NgRx auth store
fix(interceptor): handle null token correctly
chore(styles): install Tailwind CSS v4
refactor(auth): read token from store instead of AuthService
docs(readme): add project setup guide
```
