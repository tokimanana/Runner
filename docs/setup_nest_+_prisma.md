# Setup NestJS + Prisma + PostgreSQL - Guide complet

## 📋 Prérequis

- Node.js 18+
- Docker Desktop (pour PostgreSQL)
- VSCode avec extensions :
  - Prisma (officiel)
  - ESLint
  - Prettier

---

## 🚀 Phase 1 : Créer le projet Backend

### Étape 1 : Initialiser NestJS

```bash
# Installer NestJS CLI globalement
npm install -g @nestjs/cli

# Créer le projet backend
npx @nestjs/cli new backend

# Choisir npm comme package manager
# Navigate to backend
cd backend
```

### Étape 2 : Installer Prisma

```bash
# Installer Prisma
npm install -D prisma
npm install @prisma/client

# Installer autres dépendances
npm install @nestjs/config
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/jwt
npm install bcrypt
npm install class-validator class-transformer

# Dev dependencies
npm install -D @types/passport-jwt @types/bcrypt
```

### Étape 3 : Initialiser Prisma

```bash
# Initialiser Prisma (crée prisma/schema.prisma)
npx prisma init
```

Cela crée :
```
backend/
├── prisma/
│   └── schema.prisma
└── .env
```

### Étape 4 : Configurer `.env`

```env
# backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tour_operator?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

---

## 🐘 Phase 2 : Setup PostgreSQL avec Docker

### Créer `docker-compose.yml` (à la racine du projet)

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

### Démarrer PostgreSQL

```bash
# Depuis la racine du projet
docker-compose up -d

# Vérifier que ça tourne
docker ps
```

**Accès pgAdmin :**
- URL : http://localhost:5050
- Email : admin@admin.com
- Password : admin

**Connexion à la DB dans pgAdmin :**
- Host : postgres
- Port : 5432
- Username : postgres
- Password : postgres
- Database : tour_operator

---

## 📊 Phase 3 : Copier le schema.prisma

### Remplacer `prisma/schema.prisma`

Copie le contenu de l'artifact "schema.prisma - Complet et optimisé" dans :
```
backend/prisma/schema.prisma
```

### Générer le client Prisma

```bash
# Depuis backend/
npx prisma generate
```

Cela crée le client TypeScript typé automatiquement !

### Créer les tables dans la DB

```bash
# Créer la migration initiale
npx prisma migrate dev --name init

# Prisma va :
# 1. Créer toutes les tables
# 2. Appliquer les contraintes (foreign keys, unique, etc.)
# 3. Créer les indexes
```

### Visualiser le schéma (optionnel)

```bash
# Ouvre une interface web pour voir ton schéma
npx prisma studio
```

Accès : http://localhost:5555

---

## 🏗️ Phase 4 : Structure NestJS

### Architecture recommandée

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── prisma/                  # Module Prisma global
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── auth/                    # Authentification JWT
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── roles.decorator.ts
│   │
│   ├── hotels/                  # Module Hotels
│   │   ├── hotels.module.ts
│   │   ├── hotels.controller.ts
│   │   ├── hotels.service.ts
│   │   └── dto/
│   │       ├── create-hotel.dto.ts
│   │       └── update-hotel.dto.ts
│   │
│   ├── contracts/               # Module Contracts
│   │   ├── contracts.module.ts
│   │   ├── contracts.controller.ts
│   │   ├── contracts.service.ts
│   │   └── dto/
│   │
│   ├── offers/                  # Module Offers
│   │   ├── offers.module.ts
│   │   ├── offers.controller.ts
│   │   ├── offers.service.ts
│   │   └── dto/
│   │
│   ├── booking/                 # Module Booking
│   │   ├── booking.module.ts
│   │   ├── booking.controller.ts
│   │   ├── booking.service.ts
│   │   └── dto/
│   │
│   └── pricing/                 # Pricing Engine (Service pur)
│       ├── pricing.module.ts
│       └── pricing.service.ts
│
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```

---

## 🔧 Phase 5 : Créer le PrismaModule (IMPORTANT)

### `src/prisma/prisma.service.ts`

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

### `src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Rend PrismaService disponible partout
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Importer dans `app.module.ts`

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

---

## 🏨 Phase 6 : Exemple complet - Module Hotels

### Générer le module

```bash
# Depuis backend/
nest g module hotels
nest g controller hotels
nest g service hotels
```

### `src/hotels/dto/create-hotel.dto.ts`

```typescript
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

### `src/hotels/hotels.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tourOperatorId: string) {
    return this.prisma.hotel.findMany({
      where: { tourOperatorId },
      include: {
        ageCategories: true,
        roomTypes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: {
        ageCategories: true,
        roomTypes: true,
      },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async create(tourOperatorId: string, createHotelDto: CreateHotelDto) {
    return this.prisma.hotel.create({
      data: {
        ...createHotelDto,
        tourOperatorId,
      },
      include: {
        ageCategories: true,
        roomTypes: true,
      },
    });
  }

  async update(id: string, updateHotelDto: UpdateHotelDto) {
    const hotel = await this.findOne(id); // Vérifie que l'hôtel existe

    return this.prisma.hotel.update({
      where: { id },
      data: updateHotelDto,
      include: {
        ageCategories: true,
        roomTypes: true,
      },
    });
  }

  async remove(id: string) {
    const hotel = await this.findOne(id);
    
    return this.prisma.hotel.delete({
      where: { id },
    });
  }

  // Age Categories
  async createAgeCategory(hotelId: string, data: { name: string; minAge: number; maxAge: number }) {
    return this.prisma.ageCategory.create({
      data: {
        ...data,
        hotelId,
      },
    });
  }

  async getAgeCategories(hotelId: string) {
    return this.prisma.ageCategory.findMany({
      where: { hotelId },
      orderBy: { minAge: 'asc' },
    });
  }
}
```

### `src/hotels/hotels.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT)
  findAll(@CurrentUser() user: any) {
    return this.hotelsService.findAll(user.tourOperatorId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT)
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createHotelDto: CreateHotelDto, @CurrentUser() user: any) {
    return this.hotelsService.create(user.tourOperatorId, createHotelDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    return this.hotelsService.update(id, updateHotelDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(id);
  }

  // Age Categories
  @Get(':id/age-categories')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT)
  getAgeCategories(@Param('id') hotelId: string) {
    return this.hotelsService.getAgeCategories(hotelId);
  }

  @Post(':id/age-categories')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createAgeCategory(@Param('id') hotelId: string, @Body() data: any) {
    return this.hotelsService.createAgeCategory(hotelId, data);
  }
}
```

---

## 🔐 Phase 7 : Auth JWT (simplifié)

Je te donne les fichiers essentiels :

### `src/auth/strategies/jwt.strategy.ts`

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

### `src/auth/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### `src/auth/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### `src/auth/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

---

## ▶️ Phase 8 : Lancer le backend

### Démarrer le serveur

```bash
# Depuis backend/
npm run start:dev
```

Le backend tourne sur : **http://localhost:3000**

### Tester avec cURL ou Postman

```bash
# GET tous les hôtels (nécessite un JWT)
curl http://localhost:3000/hotels \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Commandes Prisma utiles

```bash
# Générer le client après modification du schema
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name add_new_field

# Appliquer les migrations en prod
npx prisma migrate deploy

# Reset la DB (DEV ONLY)
npx prisma migrate reset

# Ouvrir Prisma Studio (interface visuelle)
npx prisma studio

# Formater le schema
npx prisma format
```

---

## 🎯 Prochaines étapes

1. ✅ Setup terminé
2. ⏭️ Implémenter Auth complète (register, login)
3. ⏭️ Créer le module Contracts
4. ⏭️ Créer le module Offers
5. ⏭️ Créer le Pricing Engine Service
6. ⏭️ Créer le module Booking

---

## 🚨 Troubleshooting

### Erreur : "Can't reach database server"
```bash
# Vérifier que PostgreSQL tourne
docker ps

# Redémarrer si besoin
docker-compose restart postgres
```

### Erreur : "Prisma Client not generated"
```bash
npx prisma generate
```

### Erreur : "Port 5432 déjà utilisé"
```bash
# Si tu as un autre Postgres qui tourne
# Change le port dans docker-compose.yml :
ports:
  - "5433:5432"  # Utilise 5433 localement

# Et dans .env :
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/tour_operator?schema=public"
```

---

## ✅ Checklist de validation

- [ ] Docker PostgreSQL tourne
- [ ] `npx prisma migrate dev` réussi
- [ ] `npx prisma studio` ouvre l'interface
- [ ] `npm run start:dev` démarre le backend
- [ ] http://localhost:3000 répond
- [ ] VSCode reconnaît le schema.prisma (autocomplétion)

---

**Setup terminé ! 🎉**