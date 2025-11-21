# Rôles et permissions - Tour Operator System

## Vue d'ensemble

```
ADMIN (Super utilisateur)
  ↓
MANAGER (Gestionnaire opérationnel)
  ↓
AGENT (Utilisateur final)
```

---

## 👑 ADMIN - Super utilisateur

### Définition
**C'est le "propriétaire" du compte Tour-Opérateur**

### Responsabilités
- Gestion complète de l'organisation
- Configuration système
- Gestion des utilisateurs
- Accès à TOUT

### Permissions

#### ✅ Gestion des utilisateurs
```typescript
✅ Créer des utilisateurs (Admin, Manager, Agent)
✅ Modifier les rôles
✅ Désactiver/supprimer des utilisateurs
✅ Réinitialiser les mots de passe
✅ Voir les logs d'activité
```

#### ✅ Configuration complète
```typescript
✅ Créer/Modifier/Supprimer : Hotels
✅ Créer/Modifier/Supprimer : Contracts
✅ Créer/Modifier/Supprimer : Offers
✅ Créer/Modifier/Supprimer : Supplements
✅ Créer/Modifier/Supprimer : MealPlans, Markets, Currencies
```

#### ✅ Réservations
```typescript
✅ Créer des simulations
✅ Voir TOUTES les simulations (tous les users)
✅ Modifier/Supprimer n'importe quelle simulation
✅ Export global des données
```

#### ✅ Rapports & Analytics
```typescript
✅ Dashboard complet
✅ Statistiques avancées
✅ Export Excel/PDF global
```

### Cas d'usage typique
**Jean Dupont - Directeur du TO "France Voyages"**
- Configure le système au départ
- Crée les utilisateurs de son équipe
- Gère les contrats stratégiques
- Supervise l'activité globale

---

## 👔 MANAGER - Gestionnaire opérationnel

### Définition
**Responsable de la gestion quotidienne des contrats et offres**

### Responsabilités
- Configuration des produits (hotels, contrats, offres)
- Supervision des simulations
- Pas de gestion des utilisateurs

### Permissions

#### ✅ Configuration des produits
```typescript
✅ Créer/Modifier/Supprimer : Hotels
✅ Créer/Modifier/Supprimer : Contracts
✅ Créer/Modifier/Supprimer : Offers
✅ Créer/Modifier/Supprimer : Supplements
✅ Créer/Modifier : MealPlans, Markets (pas supprimer)
```

#### ✅ Réservations
```typescript
✅ Créer des simulations
✅ Voir toutes les simulations de son équipe
✅ Modifier ses propres simulations
✅ Export des simulations
```

#### ❌ Pas d'accès à
```typescript
❌ Gestion des utilisateurs
❌ Modification des rôles
❌ Configuration système avancée
❌ Logs d'activité
```

### Cas d'usage typique
**Marie Leroy - Product Manager chez "France Voyages"**
- Configure les nouveaux contrats hôteliers
- Crée les offres promotionnelles
- Vérifie les simulations de l'équipe
- Gère les tarifs

---

## 🎯 AGENT - Utilisateur opérationnel

### Définition
**Utilisateur qui fait des simulations de réservations**

### Responsabilités
- Simuler des réservations pour les clients
- Consulter les tarifs
- Pas de configuration

### Permissions

#### ✅ Réservations uniquement
```typescript
✅ Créer des simulations
✅ Voir ses propres simulations
✅ Modifier ses propres simulations
✅ Export de ses simulations
```

#### ✅ Consultation (lecture seule)
```typescript
✅ Voir la liste des hotels (read-only)
✅ Voir les contrats valides (read-only)
✅ Voir les offres disponibles (read-only)
✅ Voir les suppléments (read-only)
```

#### ❌ Pas d'accès à
```typescript
❌ Créer/Modifier/Supprimer : Hotels
❌ Créer/Modifier/Supprimer : Contracts
❌ Créer/Modifier/Supprimer : Offers
❌ Gestion des utilisateurs
❌ Voir les simulations des autres agents
```

### Cas d'usage typique
**Paul Martin - Agent commercial chez "France Voyages"**
- Reçoit une demande client : "Séjour à Paris, 7 nuits, 2 adultes + 1 enfant"
- Fait une simulation dans le système
- Obtient le tarif détaillé
- Présente l'offre au client

---

## Tableau comparatif des permissions

| Fonctionnalité | ADMIN | MANAGER | AGENT |
|----------------|-------|---------|-------|
| **Utilisateurs** |
| Créer utilisateurs | ✅ | ❌ | ❌ |
| Modifier rôles | ✅ | ❌ | ❌ |
| **Hotels** |
| Créer/Modifier | ✅ | ✅ | ❌ |
| Supprimer | ✅ | ✅ | ❌ |
| Consulter | ✅ | ✅ | ✅ (read-only) |
| **Contracts** |
| Créer/Modifier | ✅ | ✅ | ❌ |
| Supprimer | ✅ | ✅ | ❌ |
| Consulter | ✅ | ✅ | ✅ (read-only) |
| **Offers** |
| Créer/Modifier | ✅ | ✅ | ❌ |
| Supprimer | ✅ | ✅ | ❌ |
| Consulter | ✅ | ✅ | ✅ (read-only) |
| **Simulations (Bookings)** |
| Créer | ✅ | ✅ | ✅ |
| Voir les siennes | ✅ | ✅ | ✅ |
| Voir toutes | ✅ | ✅ | ❌ |
| Modifier les siennes | ✅ | ✅ | ✅ |
| Modifier celles des autres | ✅ | ❌ | ❌ |
| **Rapports** |
| Dashboard complet | ✅ | ✅ | ❌ |
| Export global | ✅ | ✅ | ❌ |
| Export perso | ✅ | ✅ | ✅ |

---

## Implémentation dans le code

### Guard avec rôles

```typescript
// app.routes.ts
{
  path: 'hotels',
  loadChildren: () => import('./features/hotels/hotels.routes'),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'MANAGER'] }  // AGENT exclu
}

{
  path: 'booking',
  loadChildren: () => import('./features/booking/booking.routes'),
  canActivate: [authGuard]  // Tous les rôles authentifiés
}

{
  path: 'admin/users',
  loadComponent: () => import('./features/admin/users-management.component'),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN'] }  // ADMIN uniquement
}
```

### Vérification dans les composants

```typescript
// hotels-list.component.ts
export class HotelsListComponent {
  canEdit$ = this.authService.hasRole(['ADMIN', 'MANAGER']);
  canDelete$ = this.authService.hasRole(['ADMIN', 'MANAGER']);
  
  constructor(private authService: AuthService) {}
}
```

```html
<!-- hotels-list.component.html -->
<button *ngIf="canEdit$ | async" (click)="onEdit(hotel)">
  Modifier
</button>

<button *ngIf="canDelete$ | async" (click)="onDelete(hotel)">
  Supprimer
</button>
```

### Firestore Rules

```javascript
// Exemple : Bookings
match /bookings/{bookingId} {
  allow read: if request.auth != null && (
    // Agent : voir uniquement les siennes
    resource.data.userId == request.auth.uid ||
    // Manager/Admin : voir toutes
    getUserRole() in ['ADMIN', 'MANAGER']
  );
  
  allow create: if request.auth != null;
  
  allow update, delete: if request.auth != null && (
    // Agent : modifier uniquement les siennes
    resource.data.userId == request.auth.uid ||
    // Manager/Admin : modifier toutes
    getUserRole() in ['ADMIN', 'MANAGER']
  );
}
```

---

## Cas d'usage réels

### Scénario 1 : Setup initial
1. **ADMIN Jean** crée le compte "France Voyages"
2. **ADMIN Jean** configure :
   - Hotels (Paris, Nice, Lyon)
   - Markets (France, UK)
   - MealPlans (BB, HB, FB)
3. **ADMIN Jean** crée les utilisateurs :
   - Marie (MANAGER)
   - Paul (AGENT)

### Scénario 2 : Gestion quotidienne
1. **MANAGER Marie** reçoit un nouveau contrat de l'Hotel Paris
2. **MANAGER Marie** crée le contrat avec :
   - Périodes tarifaires
   - Prix par room type
   - Offres promotionnelles
3. **AGENT Paul** peut maintenant utiliser ce contrat pour simuler

### Scénario 3 : Simulation client
1. **AGENT Paul** reçoit un appel client
2. **AGENT Paul** ouvre l'app et fait une simulation
3. **AGENT Paul** voit le tarif et le présente au client
4. **MANAGER Marie** peut voir la simulation de Paul dans l'historique
5. **ADMIN Jean** peut voir toutes les simulations et exporter des stats

---

## Évolution possible (V2)

### Rôles supplémentaires potentiels

**FINANCE** (Contrôleur financier)
- Accès read-only à tout
- Export avancé
- Statistiques financières

**SALES_DIRECTOR** (Directeur commercial)
- Voir toutes les simulations
- Dashboard analytics
- Pas de modification de config

**SUPPORT** (Support client)
- Voir simulations
- Pas de création/modification

---

## Conclusion

### En résumé :
- **ADMIN** = Tout pouvoir (1 par TO)
- **MANAGER** = Configuration produits + supervision (2-5 par TO)
- **AGENT** = Simulations uniquement (10-50 par TO)

### Ratio typique d'un TO :
```
1 ADMIN
3 MANAGERS
20 AGENTS
```

**Exemple concret "France Voyages" :**
- 1 Admin (Directeur général)
- 3 Managers (Product Managers par région)
- 25 Agents (Commerciaux)

---
