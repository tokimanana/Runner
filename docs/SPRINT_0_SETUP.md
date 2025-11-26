# Sprint 0 – Setup Infrastructure & Foundation (1-2 jours)

## Objectif
Mettre en place l'infrastructure backend (NestJS + Prisma + PostgreSQL) et frontend (Angular standalone) avec les bases de l'authentification et du routing.

---

## Phase 1 : Backend Setup (NestJS + Prisma + PostgreSQL)

### 1.1 Créer le projet NestJS

```bash
# À la racine du projet (ou dans un dossier backend/)
npx @nestjs/cli new backend
cd backend

# Choisir npm comme package manager
```

### 1.2 Installer les dépendances essentielles

```bash
npm install @prisma/client
npm install -D prisma
npm install @nestjs/config
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/jwt
npm install bcrypt class-validator class-transformer
npm install -D @types/passport-jwt @types/bcrypt
npm install @nestjs/swagger swagger-ui-express
```

### 1.3 Initialiser Prisma

```bash
npx prisma init
```

Cela crée:
- `prisma/schema.prisma`
- `.env`

### 1.4 Configurer `.env` (backend)

```env
# backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tour_operator?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
```

### 1.5 Créer `docker-compose.yml` (à la racine du projet)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: tour-operator-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tour_operator
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: tour-operator-pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres-data:
```

### 1.6 Démarrer PostgreSQL

```bash
# À la racine du projet
docker-compose up -d

# Vérifier que les conteneurs tournent
docker ps

# Accès pgAdmin: http://localhost:5050
# Email: admin@admin.com
# Password: admin
```

### 1.7 Copier le schema Prisma

Copie le contenu de `schema.prisma.txt` dans `backend/prisma/schema.prisma`.

### 1.8 Générer le client Prisma et créer les tables

```bash
cd backend

# Générer le client TypeScript
npx prisma generate

# Créer la migration initiale
npx prisma migrate dev --name init

# Vérifier le schéma (interface web)
npx prisma studio
# Accès: http://localhost:5555
```

### 1.9 Créer le PrismaModule global

**`backend/src/prisma/prisma.service.ts`**
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**`backend/src/prisma/prisma.module.ts`**
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

### 1.10 Créer le module Auth (structure minimale)

```bash
cd backend
nest g module auth
nest g controller auth
nest g service auth
```

**`backend/src/auth/auth.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

**`backend/src/auth/auth.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
      },
    };
  }

  async register(email: string, password: string, firstName: string, lastName: string, tourOperatorId: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: 'AGENT',
        tourOperatorId,
      },
    });
    return this.login(user);
  }
}
```

**`backend/src/auth/strategies/jwt.strategy.ts`**
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

**`backend/src/auth/auth.controller.ts`**
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; firstName: string; lastName: string; tourOperatorId: string },
  ) {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName, body.tourOperatorId);
  }
}
```

### 1.11 Créer le module Hotels (CRUD minimal)

```bash
cd backend
nest g module hotels
nest g controller hotels
nest g service hotels
```

**`backend/src/hotels/hotels.service.ts`**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tourOperatorId: string) {
    return this.prisma.hotel.findMany({
      where: { tourOperatorId },
      include: { ageCategories: true, roomTypes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: { ageCategories: true, roomTypes: true },
    });
    if (!hotel) throw new NotFoundException(`Hotel ${id} not found`);
    return hotel;
  }

  async create(tourOperatorId: string, data: any) {
    return this.prisma.hotel.create({
      data: { ...data, tourOperatorId },
      include: { ageCategories: true, roomTypes: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.hotel.update({
      where: { id },
      data,
      include: { ageCategories: true, roomTypes: true },
    });
  }

  async remove(id: string) {
    return this.prisma.hotel.delete({ where: { id } });
  }
}
```

**`backend/src/hotels/hotels.controller.ts`**
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HotelsService } from './hotels.service';

@Controller('hotels')
@UseGuards(AuthGuard('jwt'))
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.hotelsService.findAll(req.user.tourOperatorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.hotelsService.create(req.user.tourOperatorId, body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.hotelsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(id);
  }
}
```

**`backend/src/hotels/hotels.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';

@Module({
  providers: [HotelsService],
  controllers: [HotelsController],
})
export class HotelsModule {}
```

### 1.12 Mettre à jour `app.module.ts`

**`backend/src/app.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HotelsModule,
  ],
})
export class AppModule {}
```

### 1.13 Démarrer le backend

```bash
cd backend
npm run start:dev
```

Le backend tourne sur **http://localhost:3000**.

Teste avec curl ou Postman:
```bash
# Login (crée d'abord un user en DB ou via register)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# GET hotels (avec JWT)
curl http://localhost:3000/hotels \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Phase 2 : Frontend Setup (Angular Standalone)

### 2.1 Créer le projet Angular

```bash
# À la racine du projet (ou dans un dossier frontend/)
ng new frontend --routing --style=scss --standalone

cd frontend
```

### 2.2 Installer les dépendances

```bash
npm install @angular/material @angular/cdk
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
npm install @ngrx/entity
```

### 2.3 Configurer les environments

**`frontend/src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

**`frontend/src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
};
```

### 2.4 Configurer `app.config.ts`

**`frontend/src/app/app.config.ts`**
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { environment } from './environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './core/auth/store/auth.reducer';
import { AuthEffects } from './core/auth/store/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // NgRx Store
    provideStore({
      auth: authReducer,
    }),
    
    // NgRx Effects
    provideEffects([AuthEffects]),
    
    // NgRx DevTools
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
  ],
};
```

### 2.5 Créer le service Auth

**`frontend/src/app/core/auth/auth.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.access_token);
        this.tokenSubject.next(response.access_token);
      }),
    );
  }

  register(email: string, password: string, firstName: string, lastName: string, tourOperatorId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      email,
      password,
      firstName,
      lastName,
      tourOperatorId,
    }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.access_token);
        this.tokenSubject.next(response.access_token);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
```

### 2.6 Créer l'interceptor Auth

**`frontend/src/app/core/interceptors/auth.interceptor.ts`**
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
```

### 2.7 Créer les Guards

**`frontend/src/app/core/auth/auth.guard.ts`**
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### 2.8 Créer le Store Auth (NgRx)

**`frontend/src/app/core/auth/store/auth.state.ts`**
```typescript
export interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};
```

**`frontend/src/app/core/auth/store/auth.actions.ts`**
```typescript
import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>(),
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: any; token: string }>(),
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>(),
);

export const logout = createAction('[Auth] Logout');

export const register = createAction(
  '[Auth] Register',
  props<{ email: string; password: string; firstName: string; lastName: string; tourOperatorId: string }>(),
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: any; token: string }>(),
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>(),
);
```

**`frontend/src/app/core/auth/store/auth.reducer.ts`**
```typescript
import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.logout, () => initialAuthState),
  on(AuthActions.register, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
```

**`frontend/src/app/core/auth/store/auth.effects.ts`**
```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) =>
            AuthActions.loginSuccess({
              user: response.user,
              token: response.access_token,
            }),
          ),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.error.message || 'Login failed' })),
          ),
        ),
      ),
    ),
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ email, password, firstName, lastName, tourOperatorId }) =>
        this.authService.register(email, password, firstName, lastName, tourOperatorId).pipe(
          map((response) =>
            AuthActions.registerSuccess({
              user: response.user,
              token: response.access_token,
            }),
          ),
          catchError((error) =>
            of(AuthActions.registerFailure({ error: error.error.message || 'Register failed' })),
          ),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private authService: AuthService) {}
}
```

**`frontend/src/app/core/auth/store/auth.selectors.ts`**
```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState, (state) => state.user);
export const selectToken = createSelector(selectAuthState, (state) => state.token);
export const selectAuthLoading = createSelector(selectAuthState, (state) => state.loading);
export const selectAuthError = createSelector(selectAuthState, (state) => state.error);
export const selectIsAuthenticated = createSelector(selectToken, (token) => !!token);
```

### 2.9 Créer les routes

**`frontend/src/app/app.routes.ts`**
```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
```

### 2.10 Créer le composant Login

**`frontend/src/app/features/auth/login/login.component.ts`**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../core/auth/store/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-title>Login</mat-card-title>
        <mat-card-content>
          <form (ngSubmit)="onLogin()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="email" name="email" type="email" required />
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [(ngModel)]="password" name="password" type="password" required />
            </mat-form-field>

            <div *ngIf="error$ | async as error" class="error-message">
              {{ error }}
            </div>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="loading$ | async"
              class="full-width"
            >
              {{ (loading$ | async) ? 'Logging in...' : 'Login' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    mat-card {
      width: 100%;
      max-width: 400px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .error-message {
      color: red;
      margin-bottom: 16px;
    }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  constructor(private store: Store, private router: Router) {}

  onLogin(): void {
    if (this.email && this.password) {
      this.store.dispatch(AuthActions.login({ email: this.email, password: this.password }));
      // Redirection gérée par effect ou guard
      setTimeout(() => this.router.navigate(['/dashboard']), 500);
    }
  }
}
```

### 2.11 Créer le composant Dashboard (vide pour Sprint 0)

**`frontend/src/app/features/dashboard/dashboard.component.ts`**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="dashboard-container">
      <mat-card>
        <mat-card-title>Dashboard</mat-card-title>
        <mat-card-content>
          <p>Welcome to the Tour Operator System!</p>
          <p>More features coming soon...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
  `],
})
export class DashboardComponent {}
```

### 2.12 Démarrer le frontend

```bash
cd frontend
ng serve
```

Le frontend tourne sur **http://localhost:4200**.

---

## Definition of Done (Sprint 0)

### Backend
- ✅ Docker PostgreSQL + pgAdmin démarrés et accessibles.
- ✅ Prisma schema appliqué, tables créées.
- ✅ NestJS démarre sur http://localhost:3000.
- ✅ Auth module: login/register fonctionnels (testés avec curl/Postman).
- ✅ Hotels CRUD accessible avec JWT.
- ✅ Swagger optionnel sur /api.

### Frontend
- ✅ Angular standalone app démarre sur http://localhost:4200.
- ✅ Login page fonctionnelle (formulaire + appel API).
- ✅ Dashboard page vide mais accessible après login.
- ✅ Auth guard protège les routes.
- ✅ NgRx store auth configuré (login/logout actions).
- ✅ HttpClient + interceptor JWT en place.

### Intégration
- ✅ Login frontend → backend auth → JWT token stocké.
- ✅ GET /hotels avec JWT fonctionne.
- ✅ Logout efface le token et redirige vers login.

---

## Checklist de validation

- [ ] `docker ps` montre postgres et pgadmin.
- [ ] `http://localhost:5050` (pgAdmin) accessible.
- [ ] `http://localhost:5555` (Prisma Studio) montre les tables.
- [ ] `npm run start:dev` (backend) démarre sans erreur.
- [ ] `ng serve` (frontend) démarre sans erreur.
- [ ] Login avec credentials valides fonctionne.
- [ ] Dashboard accessible après login.
- [ ] Logout redirige vers login.
- [ ] GET /hotels retourne une liste (vide ou avec données seed).

---

## Prochaines étapes (Sprint 1)

- Améliorer Auth: roles guard, refresh token.
- Créer un layout (header + sidebar).
- Ajouter des données seed pour tester.
- Commencer le module Hotels (liste + formulaire).

---

## Commandes utiles

```bash
# Backend
cd backend
npm run start:dev          # Démarrer en dev
npx prisma studio         # Ouvrir Prisma Studio
npx prisma migrate dev     # Créer une migration
npx prisma db seed        # Lancer le seed

# Frontend
cd frontend
ng serve                   # Démarrer en dev
ng generate component ...  # Générer un composant
ng build                   # Build production

# Docker
docker-compose up -d       # Démarrer les services
docker-compose down        # Arrêter les services
docker ps                  # Lister les conteneurs
```

---

**Sprint 0 prêt à être exécuté ! 🚀**
