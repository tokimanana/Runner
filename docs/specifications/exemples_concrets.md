# Exemples Concrets - Cas Réels de Tarification

## 📋 Cas 1 : Tarification PER_OCCUPANCY avec Enfants

### Configuration Hotel

**Grand Hotel Paris - Room Suite** :
- Max capacity : 2 adultes + 2 enfants
- Age Categories :
  - Infant (0-2 ans)
  - Child (3-11 ans)
  - Adult (12+ ans)

### Tarifs Configurés (PER_OCCUPANCY)

```typescript
OccupancyRates: [
  // Single (1 adulte)
  {
    numAdults: 1,
    numChildren: 0,
    ratesPerAge: {
      "adult_cat_id": { rate: 120, order: 1 }
    },
    totalRate: 120
  },
  
  // Double (2 adultes)
  {
    numAdults: 2,
    numChildren: 0,
    ratesPerAge: {
      "adult_cat_id": { rate: 90, order: 1 },
      "adult_cat_id": { rate: 90, order: 2 }
    },
    totalRate: 180
  },
  
  // Double + 1 enfant (1er enfant gratuit)
  {
    numAdults: 2,
    numChildren: 1,
    ratesPerAge: {
      "adult_cat_id": { rate: 90, order: 1 },
      "adult_cat_id": { rate: 90, order: 2 },
      "child_cat_id": { rate: 0, order: 1 }
    },
    totalRate: 180
  },
  
  // Double + 2 enfants (2ème enfant payant)
  {
    numAdults: 2,
    numChildren: 2,
    ratesPerAge: {
      "adult_cat_id": { rate: 90, order: 1 },
      "adult_cat_id": { rate: 90, order: 2 },
      "child_cat_id": { rate: 0, order: 1 },
      "child_cat_id": { rate: 40, order: 2 }
    },
    totalRate: 220
  }
]
```

### Simulation Agent

**Réservation** :
- Hôtel : Grand Hotel Paris
- Room : Suite
- Check-in : 20/12/2024
- Check-out : 27/12/2024 (7 nuits)
- Occupants : 2 adultes + 1 enfant (5 ans)

**Calcul** :
```
Configuration détectée : 2 adultes + 1 enfant
OccupancyRate trouvé : totalRate = 180€/nuit

Prix room :
  180€ × 7 nuits = 1,260€
```

**Détail breakdown** :
```
Nuit 1 (20/12) : 180€ (1er adulte 90€ + 2ème adulte 90€ + 1er enfant 0€)
Nuit 2 (21/12) : 180€
...
Nuit 7 (26/12) : 180€

TOTAL : 1,260€
```

---

## 📋 Cas 2 : Offres SEQUENTIAL vs ADDITIVE

### Configuration Offres

**Offre A - Early Booking** :
- Type : PERCENTAGE
- Value : 10%
- Mode : **SEQUENTIAL**
- Période : 01/12/2024 → 31/01/2025

**Offre B - Long Stay** :
- Type : PERCENTAGE
- Value : 5%
- Mode : **SEQUENTIAL**
- Période : 01/11/2024 → 31/03/2025

**Offre C - Last Minute** :
- Type : PERCENTAGE
- Value : 15%
- Mode : **ADDITIVE**
- Période : 15/12/2024 → 20/12/2024

---

### Scénario A : 2 Offres SEQUENTIAL

**Réservation** :
- Séjour : 20-27/12/2024 (7 nuits)
- Prix base room : 180€/nuit
- Offres sélectionnées : Early Booking (-10%) + Long Stay (-5%)

**Calcul nuit par nuit** :
```
Nuit 1 (20/12) :
  Prix base : 180€
  Early Booking valide ? ✅ Oui (dans 01/12 → 31/01)
  Long Stay valide ? ✅ Oui (dans 01/11 → 31/03)
  
  Calcul SEQUENTIAL :
    180€ × (1 - 0.10) = 162€
    162€ × (1 - 0.05) = 153.90€
  
  Réduction totale : 26.10€ (14.5%)

Nuit 2 (21/12) : Idem = 153.90€
...
Nuit 7 (26/12) : Idem = 153.90€

TOTAL : 153.90€ × 7 = 1,077.30€
Économie : 182.70€
```

---

### Scénario B : Offre ADDITIVE Seule

**Réservation** :
- Séjour : 18-21/12/2024 (3 nuits)
- Prix base room : 180€/nuit
- Offre sélectionnée : Last Minute (-15%)

**Calcul nuit par nuit** :
```
Nuit 1 (18/12) :
  Prix base : 180€
  Last Minute valide ? ✅ Oui (dans 15/12 → 20/12)
  
  Calcul ADDITIVE :
    180€ × (1 - 0.15) = 153€
  
  Réduction totale : 27€ (15%)

Nuit 2 (19/12) : Idem = 153€
Nuit 3 (20/12) : Idem = 153€

TOTAL : 153€ × 3 = 459€
Économie : 81€
```

---

### Scénario C : Tentative Mixage (Refusé)

**Réservation** :
- Séjour : 18-21/12/2024
- Offres sélectionnées : Last Minute (ADDITIVE) + Early Booking (SEQUENTIAL)

**Comportement UI** :
```
Agent clique sur "Last Minute" (ADDITIVE)
  → L'offre est ajoutée
  → Toutes les offres SEQUENTIAL deviennent grisées
  → Tooltip : "⚠️ Les offres séquentielles ne sont pas compatibles 
               avec les offres additives"

Agent essaie de cliquer sur "Early Booking"
  → Rien ne se passe (disabled)
  → Notification : "Veuillez désélectionner 'Last Minute' pour 
                    activer les offres séquentielles"
```

---

## 📋 Cas 3 : Application Partielle d'Offre

### Configuration Offre

**Offre Été** :
- Type : PERCENTAGE
- Value : 20%
- Mode : SEQUENTIAL
- Période : **07/07/2025 → 15/07/2025**

---

### Scénario : Chevauchement Partiel

**Réservation** :
- Séjour : **14-18/07/2025** (5 nuits)
- Prix base room : 200€/nuit
- Offre sélectionnée : Offre Été (-20%)

**Calcul nuit par nuit** :
```
Nuit 1 (14/07) :
  Offre Été valide ? ✅ Oui (14/07 dans 07/07 → 15/07)
  Prix : 200€ × (1 - 0.20) = 160€

Nuit 2 (15/07) :
  Offre Été valide ? ✅ Oui (15/07 dans 07/07 → 15/07)
  Prix : 200€ × (1 - 0.20) = 160€

Nuit 3 (16/07) :
  Offre Été valide ? ❌ Non (16/07 hors période)
  Prix : 200€ (plein tarif)

Nuit 4 (17/07) :
  Offre Été valide ? ❌ Non
  Prix : 200€

Nuit 5 (18/07) :
  Offre Été valide ? ❌ Non
  Prix : 200€

TOTAL :
  2 nuits à 160€ = 320€
  3 nuits à 200€ = 600€
  TOTAL = 920€

Économie : 80€ (2 nuits sur 5)
```

**Récapitulatif** :
```
Breakdown :
  Nuits avec offre : 2/5
  Prix moyen/nuit : 184€
  Économie totale : 80€ (8%)
```

---

## 📋 Cas 4 : Meal Plan Supplement

### Configuration

**Base Meal Plan** : BB (inclus dans tarif room)

**Meal Plan Supplements** :
```typescript
MealPlanSupplements: [
  {
    mealPlanId: "HB_id",
    occupancyRates: {
      "1-0": 15,  // Single = +15€/nuit
      "2-0": 30,  // Double = +30€/nuit
      "2-1": 40,  // Double + 1 enfant = +40€/nuit
      "2-2": 50   // Double + 2 enfants = +50€/nuit
    }
  },
  {
    mealPlanId: "FB_id",
    occupancyRates: {
      "1-0": 30,
      "2-0": 60,
      "2-1": 75,
      "2-2": 90
    }
  }
]
```

---

### Simulation Agent

**Réservation** :
- Room : Suite (2 adultes + 1 enfant)
- Prix room : 180€/nuit (BB inclus)
- Meal plan choisi : **HB** (Half Board)
- Durée : 7 nuits

**Calcul** :
```
Prix room (avec BB) : 180€/nuit
Supplément HB (2-1) : +40€/nuit

Prix total/nuit : 180€ + 40€ = 220€/nuit
Prix total séjour : 220€ × 7 = 1,540€

Détail :
  Room + BB : 1,260€
  Supplément HB : 280€
  TOTAL : 1,540€
```

---

## 📋 Cas 5 : Suppléments avec Unités Différentes

### Configuration Suppléments

```typescript
Supplements: [
  {
    name: "Transfert aéroport",
    price: 50,
    unit: "PER_PERSON_PER_STAY",
    canReceiveDiscount: true
  },
  {
    name: "Excursion ville",
    price: 80,
    unit: "PER_PERSON_PER_STAY",
    canReceiveDiscount: true
  },
  {
    name: "Upgrade vue mer",
    price: 30,
    unit: "PER_ROOM_PER_NIGHT",
    canReceiveDiscount: false
  },
  {
    name: "Pack romantique",
    price: 100,
    unit: "PER_ROOM_PER_STAY",
    canReceiveDiscount: false
  }
]
```

---

### Simulation Agent

**Réservation** :
- 4 personnes (2 adultes + 2 enfants)
- 2 chambres
- 7 nuits
- Offre : Early Booking -10% (SEQUENTIAL)

**Suppléments sélectionnés** :
1. ✅ Transfert aéroport (4 personnes)
2. ✅ Excursion ville (2 personnes seulement - ajusté par agent)
3. ✅ Upgrade vue mer (1 chambre)
4. ✅ Pack romantique (1 chambre)

---

**Calcul** :

```
1. Transfert aéroport
   Unité : PER_PERSON_PER_STAY
   Quantité : 4 personnes
   Prix : 50€ × 4 = 200€
   Réduction applicable : ✅ Oui (offre -10%)
   Prix final : 200€ × (1 - 0.10) = 180€

2. Excursion ville
   Unité : PER_PERSON_PER_STAY
   Quantité : 2 personnes (agent a modifié)
   Prix : 80€ × 2 = 160€
   Réduction applicable : ✅ Oui (offre -10%)
   Prix final : 160€ × (1 - 0.10) = 144€

3. Upgrade vue mer
   Unité : PER_ROOM_PER_NIGHT
   Quantité : 1 chambre × 7 nuits
   Prix : 30€ × 1 × 7 = 210€
   Réduction applicable : ❌ Non (canReceiveDiscount = false)
   Prix final : 210€

4. Pack romantique
   Unité : PER_ROOM_PER_STAY
   Quantité : 1 chambre
   Prix : 100€ × 1 = 100€
   Réduction applicable : ❌ Non
   Prix final : 100€

TOTAL SUPPLÉMENTS :
  Avec réduction : 180€ + 144€ = 324€
  Sans réduction : 210€ + 100€ = 310€
  TOTAL : 634€
```

---

## 📋 Cas 6 : Calcul Complet - Facture Finale

### Récapitulatif Réservation

- **Hôtel** : Grand Hotel Paris
- **Séjour** : 20-27/12/2024 (7 nuits)
- **Market** : France
- **Currency** : EUR

---

**Chambres** :

**Chambre 1** : Suite
- Occupants : 2 adultes + 1 enfant (5 ans)
- Prix base : 180€/nuit (BB inclus)
- Meal plan : HB (+40€/nuit)
- Prix total chambre/nuit : 220€

**Chambre 2** : Standard
- Occupants : 2 adultes
- Prix base : 150€/nuit (BB inclus)
- Meal plan : BB (pas de supplément)
- Prix total chambre/nuit : 150€

---

**Offres** :
- Early Booking -10% (SEQUENTIAL)
- Long Stay -5% (SEQUENTIAL)

---

**Suppléments** :
- Transfert aéroport : 4 personnes
- Upgrade vue mer : 1 chambre (Chambre 1)

---

### Calcul Détaillé

**STEP 1 : Prix Chambres** (avant réductions)
```
Chambre 1 : 220€ × 7 nuits = 1,540€
Chambre 2 : 150€ × 7 nuits = 1,050€

Sous-total chambres : 2,590€
```

---

**STEP 2 : Application Offres** (nuit par nuit)

**Chambre 1** :
```
Nuit 1 : 220€ × (1 - 0.10) × (1 - 0.05) = 187.95€
Nuit 2-7 : Idem

Prix final Chambre 1 : 187.95€ × 7 = 1,315.65€
Réduction : 224.35€ (14.5%)
```

**Chambre 2** :
```
Nuit 1 : 150€ × (1 - 0.10) × (1 - 0.05) = 128.25€
Nuit 2-7 : Idem

Prix final Chambre 2 : 128.25€ × 7 = 897.75€
Réduction : 152.25€ (14.5%)
```

**Total chambres après offres** : 2,213.40€

---

**STEP 3 : Suppléments**

```
Transfert aéroport :
  50€ × 4 personnes = 200€
  Réduction -14.5% = 200€ × 0.855 = 171€

Upgrade vue mer :
  30€ × 1 chambre × 7 nuits = 210€
  Pas de réduction (canReceiveDiscount = false)

Total suppléments : 381€
```

---

**STEP 4 : FACTURE FINALE**

```
┌──────────────────────────────────────────────────┐
│  GRAND HOTEL PARIS - Simulation                  │
│  Séjour : 20-27 Décembre 2024 (7 nuits)          │
├──────────────────────────────────────────────────┤
│                                                  │
│  CHAMBRES                                        │
│  ─────────────────────────────────────────────   │
│  • Suite (2 adultes + 1 enfant, HB)              │
│    Base : 1,540.00€                              │
│    Réduction -14.5% : -224.35€                   │
│    Sous-total : 1,315.65€                        │
│                                                  │
│  • Standard (2 adultes, BB)                      │
│    Base : 1,050.00€                              │
│    Réduction -14.5% : -152.25€                   │
│    Sous-total : 897.75€                          │
│                                                  │
│  Total chambres : 2,213.40€                      │
│                                                  │
│  SUPPLÉMENTS                                     │
│  ─────────────────────────────────────────────   │
│  • Transfert aéroport (4 pax)                    │
│    Base : 200.00€                                │
│    Réduction -14.5% : -29.00€                    │
│    Sous-total : 171.00€                          │
│                                                  │
│  • Upgrade vue mer (1 chambre, 7 nuits)          │
│    Prix : 210.00€                                │
│                                                  │
│  Total suppléments : 381.00€                     │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  TOTAL GÉNÉRAL : 2,594.40€                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  Économie totale : 405.60€                       │
│  Prix sans offres : 3,000.00€                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---
