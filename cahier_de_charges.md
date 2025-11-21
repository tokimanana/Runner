# Cahier des charges - Système de gestion de réservations pour Tour-Opérateurs

## 1. Contexte et objectif

### 1.1 Présentation
Application web back-office permettant aux tour-opérateurs (TO) de :
- Configurer leurs contrats hôteliers (tarifs, offres, suppléments)
- Simuler des réservations complexes avec calculs tarifaires automatiques
- Gérer des règles promotionnelles flexibles et cumulables

### 1.2 Utilisateurs cibles
- **Admins/Managers TO** : Configuration complète des contrats, gestion des utilisateurs
- **Agents TO** : Simulation de réservations, consultation des tarifs

### 1.3 Architecture multi-tenant
Chaque TO dispose de son propre espace isolé (contrats, hôtels, utilisateurs).

---

## 2. Fonctionnalités principales

### 2.1 Gestion des hôtels
- Création/modification d'hôtels (nom, code, destination, contact)
- Configuration des **Age Categories** spécifiques à chaque hôtel
  - Exemple Hotel A : Infant (0-1), Child (2-11), Adult (12+)
  - Exemple Hotel B : Baby (0-2), Child (3-17), Adult (18+)

### 2.2 Gestion des Room Types
- Création de types de chambres par hôtel
- Définition de la capacité (adultes, enfants)
- Association à un hôtel

### 2.3 Gestion des Meal Plans
- Configuration des régimes alimentaires (BB, HB, FB, AI, etc.)
- Prix en supplément ou inclus dans le tarif de base

### 2.4 Gestion des Markets & Currencies
- Définition des marchés cibles (France, UK, Allemagne, etc.)
- Association des devises (EUR, GBP, USD, etc.)

### 2.5 Gestion des Contrats/Tarifs
Un contrat définit :
- **Hôtel, Room Type, Meal Plan, Market, Currency**
- **Période de validité** (date début/fin)
- **Mode de tarification** :
  - Par personne par nuit
  - Par chambre par nuit
  - **Hybride** : certains rooms par personne, d'autres par chambre
- **Règles spéciales** :
  - Exemple : "Enfant gratuit si 2 adultes dans la chambre"
  - Exemple : "3ème adulte à 50% du tarif"

### 2.6 Gestion des Offres promotionnelles
Une offre contient :
- Nom, description
- **Période de validité** (dates)
- **Type de réduction** :
  - **Pourcentage** (ex: -10%)
  - **Montant fixe** (ex: -50€)
- **Mode d'application** :
  - **Cumulative** : les réductions se cumulent (ex: -10% puis -5% = -14.5%)
    - Calcul : Prix × (1 - 0.10) × (1 - 0.05)
  - **Combinable** : les réductions s'additionnent avant application (ex: -10% + -5% = -15%)
    - Calcul : Prix × (1 - 0.15)
- **Scope d'application** (paramétrable) :
  - Sur le tarif room
  - Sur le meal plan
  - Sur les suppléments (au cas par cas)
- **Contrainte** : Une offre cumulative ne peut jamais être mélangée avec une offre combinable

### 2.7 Gestion des Suppléments
- Création de suppléments (Transfer, Excursion, Extra bed, etc.)
- **Prix et unité** :
  - Par personne
  - Par chambre
  - Par séjour (forfait)
- **Paramètre** : Peut recevoir des réductions (Oui/Non)

### 2.8 Simulation de réservation
L'agent sélectionne :
1. **Hôtel**
2. **Dates de séjour** (check-in / check-out)
3. **Market & Currency**
4. **Chambres** :
   - Room Type
   - Nombre d'adultes et enfants (avec âges respectant les Age Categories)
   - Meal Plan choisi
5. **Offres applicables** (le système liste les offres valides pour la période)
6. **Suppléments** (optionnel)

Le système calcule automatiquement :
- Prix par chambre par nuit
- Application des offres **nuit par nuit** si période partielle
- Prix des suppléments avec ou sans réduction
- **Total détaillé** avec breakdown

---

## 3. Règles métier critiques

### 3.1 Application des offres sur période partielle
**Exemple** :
- Offre valable du 7 au 15 juillet
- Séjour du 14 au 16 juillet (3 nuits)
- **Résultat** : L'offre s'applique uniquement sur les nuits du 14 et 15 juillet (2 nuits sur 3)
- **Calcul nuit par nuit** : chaque nuit est évaluée individuellement

### 3.2 Cumul des offres
- **Offres cumulatives** :
  - Réduction A : -10%
  - Réduction B : -5%
  - Calcul : Prix × (1 - 0.10) × (1 - 0.05) = Prix × 0.855 = **-14.5%**

- **Offres combinables** :
  - Réduction A : -10%
  - Réduction B : -5%
  - Calcul : Prix × (1 - (0.10 + 0.05)) = Prix × 0.85 = **-15%**

- **Interdiction** : Impossible de mélanger une offre cumulative avec une combinable dans la même réservation

### 3.3 Tarification hybride
Un même contrat peut avoir :
- Room Standard : tarif par chambre (ex: 100€/nuit)
- Room Suite : tarif par personne (ex: 80€/personne/nuit)

### 3.4 Suppléments avec réductions
- Chaque supplément a un flag "Peut recevoir réduction"
- Si activé, les offres s'appliquent selon les règles configurées
- Si désactivé, le supplément reste au prix plein tarif

---

## 4. Modules techniques à développer

### Phase 1 : Configuration (Admins/Managers)
1. Gestion des hôtels et Age Categories
2. Gestion des Room Types
3. Gestion des Meal Plans
4. Gestion des Markets & Currencies
5. Gestion des Contrats/Tarifs
6. Gestion des Offres
7. Gestion des Suppléments

### Phase 2 : Simulation (Agents)
8. Interface de simulation de réservation
9. Moteur de calcul tarifaire
10. Affichage détaillé du breakdown

### Phase 3 : Administration
11. Gestion des utilisateurs (Admins, Agents)
12. Logs et historique des simulations
13. Export des résultats (PDF, Excel)

---

## 5. Technologies proposées

### Frontend
- **Angular** (v16+ Standalone)
- **Angular Material** pour les composants UI
- **NgRx** pour la gestion d'état
- **RxJS** pour la réactivité

### Backend
- **NestJS** (Framework TypeScript structuré)
- **Prisma** (ORM Type-safe pour PostgreSQL)
- **PostgreSQL** (Base de données relationnelle)
- **Passport + JWT** (Authentification sécurisée)

### Infrastructure
- **Docker** pour PostgreSQL en local
- **pgAdmin** pour l'administration de la base de données

---

## 6. Points à valider ultérieurement

### 6.1 Taxes
- Mode de calcul (%, montant fixe, par nuit/personne)
- Variables selon pays/hôtel
- Intégration dans le breakdown final

### 6.2 Calcul nuit par nuit
- Confirmation que toutes les règles s'appliquent au niveau de chaque nuit
- Impact sur les performances si séjours longs (30+ nuits)

### 6.3 Évolutions futures
- Gestion des disponibilités (allotements)
- Workflow de validation des réservations
- Intégration avec systèmes externes (PMS, Channel Manager)
- Reporting et analytics avancés

---

## 7. Priorisation des user stories

### Must Have (MVP)
- Créer/modifier un hôtel avec Age Categories
- Créer des Room Types et Meal Plans
- Créer un contrat tarifaire simple (par chambre ou par personne)
- Créer une offre de réduction (% ou montant fixe)
- Simuler une réservation basique (1 chambre, 1 offre)
- Calculer le prix total avec breakdown

### Should Have (V1)
- Gestion des suppléments avec réductions
- Application des offres sur périodes partielles
- Tarification hybride (par chambre ET par personne dans un même contrat)
- Offres cumulatives vs combinables
- Gestion des utilisateurs (Admin/Agent)

### Nice to Have (V2+)
- Export PDF/Excel des simulations
- Historique des simulations
- Gestion des taxes
- Dashboard analytics
- Multi-langue

---

## 8. Estimation de charge (en jours de développement)

| Phase | Fonctionnalités | Estimation |
|-------|----------------|-----------|
| Setup | Architecture, Firebase, Angular setup | 2-3j |
| Auth | Authentification multi-tenant | 2j |
| Hotels | CRUD Hotels + Age Categories | 3j |
| Rooms & Meals | CRUD Room Types, Meal Plans | 2j |
| Markets | CRUD Markets & Currencies | 1j |
| Contracts | CRUD Contrats/Tarifs (complexe) | 5j |
| Offers | CRUD Offres avec règles | 4j |
| Supplements | CRUD Suppléments | 2j |
| Booking UI | Interface de simulation | 4j |
| Calcul Engine | Moteur de calcul tarifaire | 6-8j |
| Tests & Debug | Tests, corrections, optimisation | 5j |
| **TOTAL MVP** | | **36-40 jours** |

---

**Document vivant - Version 1.0**