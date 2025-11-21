# Guide de démarrage - Tour Operator System

---

## 🚀 Étapes de développement (Ordre recommandé)

### Phase 0 : Setup initial (2-3 jours)

#### Jour 1 : Projet Backend NestJS
```bash
# 1. Créer le projet NestJS
npx @nestjs/cli new backend
cd backend

# 2. Installer les dépendances principales
npm install @prisma/client
npm install -D prisma
npm install @nestjs/config
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/jwt
npm install bcrypt class-validator class-transformer
npm install -D @types/passport-jwt @types/bcrypt

# 3. Initialiser Prisma
npx prisma init
```

#### Jour 2 : Configuration PostgreSQL & Prisma
```bash
# 1. Copier le schema.prisma dans prisma/schema.prisma

# 2. Créer docker-compose.yml à la racine du projet

# 3. Démarrer PostgreSQL
docker-compose up -d

# 4. Créer les tables
npx prisma migrate dev --name init

# 5. Lancer le seed
npx prisma db seed

# 6. Vérifier avec Prisma Studio
npx prisma studio
```

#### Jour 3 : Projet Angular
```bash
# 1. Créer le projet Angular
ng new frontend --routing --style=scss --standalone

cd frontend

# 2. Installer les dépendances
npm install @angular/material @angular/cdk
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools

# 3. Créer la structure de base
ng g module core
ng g module shared
```

**Checklist Phase 0 :**
- [ ] Backend NestJS démarre sur http://localhost:3000
- [ ] PostgreSQL accessible via pgAdmin (http://localhost:5050)
- [ ] Prisma Studio montre les données du seed
- [ ] Frontend Angular démarre sur http://localhost:4200
- [ ] Structure de dossiers créée

---

### Phase 1 : Auth & Layout (2 jours)

#### Tasks
1. **Créer AuthService**
```typescript
ng g service core/auth/auth
```

2. **Créer Guards**
```typescript
ng g guard core/auth/auth
ng g guard core/auth/role
```

3. **Créer composants de layout**
```typescript
ng g component shared/components/header
ng g component shared/components/sidebar
ng g component shared/components/loading-spinner
```

4. **Page de login**
```typescript
ng g component core/auth/login
```

**Checklist Phase 1 :**
- [ ] Login/Logout fonctionnel
- [ ] Guards protègent les routes
- [ ] Layout avec header + sidebar
- [ ] Routing de base configuré

---

### Phase 2 : Module Hotels (5 jours)

#### Jour 1-2 : Store & Services
```typescript
# Générer le store
ng g store features/hotels/store/Hotels --module features/hotels/hotels.module.ts

# Créer le service
ng g service features/hotels/services/hotels

# Créer les models
touch src/app/shared/models/hotel.model.ts
```

#### Jour 3-4 : Composants
```typescript
ng g component features/hotels/components/hotels-list
ng g component features/hotels/components/hotel-form
ng g component features/hotels/components/age-categories
ng g component features/hotels/components/room-types-manager
```

#### Jour 5 : Intégration & Tests
- Connexion Firestore
- CRUD complet des hôtels
- Gestion des Age Categories
- Gestion des Room Types

**Checklist Phase 2 :**
- [ ] Liste des hôtels affichée
- [ ] Création d'un hôtel fonctionnelle
- [ ] Modification/Suppression d'un hôtel
- [ ] Gestion des Age Categories
- [ ] Gestion des Room Types
- [ ] Validation des formulaires

---

### Phase 3 : Module Contracts (7 jours)

#### Jour 1-2 : Modèles & Store
```typescript
ng g store features/contracts/store/Contracts --module features/contracts/contracts.module.ts
ng g service features/contracts/services/contracts
touch src/app/shared/models/contract.model.ts
```

#### Jour 3-5 : Composants de base
```typescript
ng g component features/contracts/components/contracts-list
ng g component features/contracts/components/contract-form
ng g component features/contracts/components/period-form
```

#### Jour 6-7 : Sous-composants complexes
```typescript
ng g component features/contracts/components/room-prices-manager
ng g component features/contracts/components/meal-supplements-manager
ng g component features/contracts/components/stop-sales-manager
```

**Checklist Phase 3 :**
- [ ] Création contrat avec périodes
- [ ] Saisie des tarifs par room type
- [ ] Gestion des meal plan supplements
- [ ] Gestion des stop sales dates
- [ ] Validation : périodes non-chevauchantes
- [ ] Support tarification PER_ROOM et PER_PERSON

---

### Phase 4 : Module Offers (4 jours)

#### Jour 1-2 : Store & CRUD
```typescript
ng g store features/offers/store/Offers --module features/offers/offers.module.ts
ng g service features/offers/services/offers
ng g component features/offers/components/offers-list
ng g component features/offers/components/offer-form
```

#### Jour 3-4 : Gestion des périodes
```typescript
ng g component features/offers/components/offer-periods-manager
ng g component features/offers/components/applicable-supplements-manager
```

**Checklist Phase 4 :**
- [ ] Création offres (% et montant fixe)
- [ ] Mode CUMULATIVE vs COMBINABLE
- [ ] Gestion des périodes multiples
- [ ] Association aux suppléments
- [ ] Validation min stay

---

### Phase 5 : Module Booking - Partie 1 (5 jours)

#### Jour 1-2 : Store & UI Wizard
```typescript
ng g store features/booking/store/Booking --module features/booking/booking.module.ts
ng g component features/booking/components/booking-wizard
ng g component features/booking/components/step1-hotel-dates
ng g component features/booking/components/step2-rooms
```

#### Jour 3-4 : Steps 3 & 4
```typescript
ng g component features/booking/components/step3-offers
ng g component features/booking/components/step4-supplements
```

#### Jour 5 : Step 5 Summary
```typescript
ng g component features/booking/components/step5-summary
ng g component features/booking/components/breakdown-detail
```

**Checklist Phase 5 :**
- [ ] Wizard 5 étapes fonctionnel
- [ ] Sélection hôtel + dates
- [ ] Sélection chambres + guests
- [ ] Sélection offres
- [ ] Sélection suppléments
- [ ] Affichage résumé

---

### Phase 6 : Pricing Engine (6-8 jours)

#### Jour 1-3 : Service de base
```typescript
ng g service features/booking/services/pricing-engine
```

**Implémenter :**
- [ ] Calcul prix de base par nuit
- [ ] Identification de la période tarifaire
- [ ] Calcul selon PER_ROOM / PER_PERSON
- [ ] Application meal plan supplements

#### Jour 4-6 : Application des offres
- [ ] Vérification périodes d'offres (offerPeriods)
- [ ] Mode COMBINABLE (additionner %)
- [ ] Mode CUMULATIVE (appliquer successivement)
- [ ] Application nuit par nuit

#### Jour 7-8 : Finitions
- [ ] Gestion des règles spéciales
- [ ] Vérification stop sales dates
- [ ] Vérification min stay
- [ ] Calcul suppléments avec réductions
- [ ] Génération du breakdown complet

**Checklist Phase 6 :**
- [ ] Calcul prix correct pour PER_ROOM
- [ ] Calcul prix correct pour PER_PERSON
- [ ] Offres appliquées nuit par nuit
- [ ] Offres partielles sur périodes multiples
- [ ] Breakdown détaillé généré
- [ ] Tests unitaires du pricing engine

---

### Phase 7 : Suppléments & Finitions (3 jours)

#### Tasks
```typescript
ng g module features/supplements --routing
ng g component features/supplements/components/supplements-list
ng g component features/supplements/components/supplement-form
```

**Checklist Phase 7 :**
- [ ] CRUD suppléments
- [ ] Intégration dans booking
- [ ] Application des réductions aux suppléments

---

### Phase 8 : Administration (3 jours)

```typescript
ng g module features/admin --routing
ng g component features/admin/components/users-management
ng g component features/admin/components/booking-history
```

**Checklist Phase 8 :**
- [ ] Gestion des utilisateurs
- [ ] Historique des simulations
- [ ] Filtres et recherche

---

### Phase 9 : Tests & Optimisations (3-5 jours)

#### Tasks prioritaires
1. **Tests unitaires** : Services critiques (PricingEngine, HotelsService)
2. **Tests d'intégration** : Flows complets
3. **Performance** : 
   - Pagination Firestore
   - Optimistic updates
   - Lazy loading modules
4. **UX** :
   - Messages d'erreur clairs
   - Loading indicators
   - Confirmations actions critiques

---

## 📦 Dépendances complètes

```json
{
  "dependencies": {
    "@angular/animations": "^16.0.0",
    "@angular/common": "^16.0.0",
    "@angular/compiler": "^16.0.0",
    "@angular/core": "^16.0.0",
    "@angular/forms": "^16.0.0",
    "@angular/material": "^16.0.0",
    "@angular/platform-browser": "^16.0.0",
    "@angular/platform-browser-dynamic": "^16.0.0",
    "@angular/router": "^16.0.0",
    "@angular/fire": "^7.6.0",
    "firebase": "^10.0.0",
    "@ngrx/store": "^16.0.0",
    "@ngrx/effects": "^16.0.0",
    "@ngrx/entity": "^16.0.0",
    "@ngrx/store-devtools": "^16.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.13.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^16.0.0",
    "@angular/cli": "^16.0.0",
    "@angular/compiler-cli": "^16.0.0",
    "@types/jasmine": "~4.3.0",
    "jasmine-core": "~4.6.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.0.0",
    "typescript": "~5.0.0"
  }
}
```

---

## 🎯 Ordre de priorité (MVP)

### Sprint 1 (2 semaines) : Foundation
- Phase 0 : Setup
- Phase 1 : Auth & Layout
- Phase 2 : Module Hotels

### Sprint 2 (2 semaines) : Configuration
- Phase 3 : Module Contracts
- Phase 4 : Module Offers

### Sprint 3 (2 semaines) : Booking Core
- Phase 5 : Booking UI
- Phase 6 : Pricing Engine (début)

### Sprint 4 (2 semaines) : Finitions MVP
- Phase 6 : Pricing Engine (fin)
- Phase 7 : Suppléments
- Phase 9 : Tests essentiels

**Total MVP : 8 semaines (2 mois)**

---

## 🧪 Tests recommandés

### Tests unitaires prioritaires
```typescript
// pricing-engine.service.spec.ts
describe('PricingEngineService', () => {
  it('should calculate PER_ROOM pricing correctly', () => {});
  it('should calculate PER_PERSON pricing correctly', () => {});
  it('should apply COMBINABLE offers correctly', () => {});
  it('should apply CUMULATIVE offers correctly', () => {});
  it('should handle partial offer periods', () => {});
  it('should respect stop sales dates', () => {});
  it('should validate min stay requirements', () => {});
});
```

---

## 📊 Métriques de succès du POC

- [ ] Un user peut créer un hôtel avec age categories
- [ ] Un user peut créer un contrat avec plusieurs périodes
- [ ] Un user peut créer une offre avec périodes multiples
- [ ] Un agent peut simuler une réservation complète
- [ ] Le pricing engine calcule correctement (tests validés)
- [ ] Le breakdown nuit par nuit est généré
- [ ] Performance < 2s pour calcul booking 30 nuits

---

## 🚨 Points d'attention

### ⚠️ Firestore Queries
- Attention aux limites de requêtes imbriquées
- Prévoir des indexes composites
- Pagination obligatoire pour listes longues

### ⚠️ Pricing Engine
- Tester avec des cas edge (périodes chevauchantes, offres multiples)
- Performance si 100+ nuits
- Gérer les erreurs de contrat manquant

### ⚠️ UX
- Feedback visuel pendant calculs longs
- Sauvegarde automatique des simulations
- Messages d'erreur explicites

---

## 📚 Ressources utiles

- **Angular** : https://angular.io/docs
- **NgRx** : https://ngrx.io/docs
- **Firebase** : https://firebase.google.com/docs/firestore
- **Angular Material** : https://material.angular.io/components

---

## ✨ Prochaine étape IMMÉDIATE

**Commence par créer le projet Angular et configurer Firebase !**

```bash
ng new tour-operator-system --routing --style=scss --strict
cd tour-operator-system
npm install @angular/fire firebase
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
ng add @angular/material
```

Puis crée un projet Firebase sur https://console.firebase.google.com/

Une fois fait, on pourra commencer l'implémentation du module Hotels ! 🚀

---