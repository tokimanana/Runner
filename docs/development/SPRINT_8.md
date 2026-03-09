# Sprint 8 - Finitions, Performance & Tests

## 🎯 Objectif Sprint

Finaliser l'application : historique bookings, export PDF, dashboard stats réelles, tests, accessibilité, documentation.

**Durée estimée :** 3-4 jours
**Story Points :** 26 points

---

## Backend Tasks

### S8-BE-001 : Optimisation requêtes DB (indexes)

- **Type :** Performance
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `perf/S8-BE-001-db-indexes`
- **Commit :** `perf(database): add missing indexes for frequent queries`
- **Description :**
  - Analyser les requêtes lentes avec EXPLAIN
  - Ajouter indexes manquants :
    - `bookings.userId, bookings.createdAt`
    - `bookings.hotelId, bookings.checkIn`
    - `contracts.tourOperatorId, contracts.hotelId`
    - `offers.tourOperatorId`
  - Créer migration Prisma
- **Acceptance Criteria :**
  - ✅ Indexes ajoutés
  - ✅ Migration appliquée sans erreur
- **Files :**
  - `apps/backend/prisma/schema.prisma`
  - `apps/backend/prisma/migrations/`

---

### S8-BE-002 : Endpoint GET /bookings (historique)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S8-BE-002-bookings-history`
- **Commit :** `feat(booking): add bookings history endpoint with filters`
- **Description :**
  - GET /bookings (liste des simulations)
  - Filtres :
    - userId (AGENT voit les siennes, ADMIN/MANAGER voient toutes)
    - hotelId
    - dateRange (checkIn between)
    - status (SIMULATION, CONFIRMED, CANCELLED)
  - Pagination (limit 50, offset)
  - Include : hotel, market, user
  - Order by createdAt DESC
- **Acceptance Criteria :**
  - ✅ Liste retournée avec filtres
  - ✅ Isolation multi-tenant (tourOperatorId)
  - ✅ AGENT voit uniquement ses bookings
- **Files :**
  - `apps/backend/src/booking/booking.controller.ts`
  - `apps/backend/src/booking/booking.service.ts`

---

### S8-BE-003 : Endpoint POST /bookings (sauvegarder simulation)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S8-BE-003-save-booking`
- **Commit :** `feat(booking): add endpoint to save booking simulation`
- **Description :**
  - POST /bookings (sauvegarder résultat calcul)
  - Payload : BookingCalculateCriteria + result
  - Créer Booking, BookingRooms, NightlyBreakdown, etc.
  - Status par défaut : SIMULATION
- **Acceptance Criteria :**
  - ✅ Booking sauvegardé en DB
  - ✅ Toutes les relations créées
  - ✅ Retourne bookingId
- **Files :**
  - `apps/backend/src/booking/booking.controller.ts`
  - `apps/backend/src/booking/booking.service.ts`

---

### S8-BE-004 : Endpoint GET /bookings/:id

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 1
- **Branch :** `feature/S8-BE-004-booking-detail`
- **Commit :** `feat(booking): add booking detail endpoint`
- **Description :**
  - GET /bookings/:id
  - Include : hotel, market, currency, user, rooms, nightlyBreakdown, appliedOffers, supplements
  - Vérifier accès (userId si AGENT)
- **Acceptance Criteria :**
  - ✅ Détail complet retourné
  - ✅ Accès contrôlé selon rôle
- **Files :**
  - `apps/backend/src/booking/booking.controller.ts`
  - `apps/backend/src/booking/booking.service.ts`

---

### S8-BE-005 : Endpoint DELETE /bookings/:id

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 1
- **Branch :** `feature/S8-BE-005-delete-booking`
- **Commit :** `feat(booking): add delete booking endpoint`
- **Description :**
  - DELETE /bookings/:id
  - Bloqué si status = CONFIRMED
  - Vérifier accès (userId si AGENT)
  - Cascade delete géré par Prisma
- **Acceptance Criteria :**
  - ✅ Suppression fonctionne
  - ✅ Bloquée si CONFIRMED
  - ✅ Accès contrôlé
- **Files :**
  - `apps/backend/src/booking/booking.controller.ts`
  - `apps/backend/src/booking/booking.service.ts`

---

### S8-BE-006 : Swagger documentation complète

- **Type :** Documentation
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `docs/S8-BE-006-swagger`
- **Commit :** `docs(api): add comprehensive Swagger documentation`
- **Description :**
  - @ApiTags sur tous les controllers
  - @ApiOperation sur tous les endpoints
  - @ApiResponse pour success/error
  - @ApiProperty sur tous les DTOs
- **Acceptance Criteria :**
  - ✅ Swagger UI complet sur /api
  - ✅ Tous les endpoints documentés
- **Files :**
  - Tous les `*.controller.ts`
  - Tous les `*.dto.ts`

---

## Frontend Tasks

### S8-FE-001 : Créer BookingHistory Component

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S8-FE-001-booking-history`
- **Commit :** `feat(booking): create booking history component with filters`
- **Description :**
  - Créer `features/booking/components/booking-history/`
  - Tableau **`p-table`** PrimeNG : Date, Hotel, Dates séjour, Total, Créé par, Actions
  - Filtres avec **`p-select`** + **`p-datepicker`** :
    - Hotel
    - Créé par (si ADMIN/MANAGER)
    - Date range
  - Pagination PrimeNG
  - Actions : View Detail, Delete (avec **`p-confirmdialog`**)
- **Acceptance Criteria :**
  - ✅ Liste affichée depuis API
  - ✅ Filtres fonctionnels
  - ✅ Pagination fonctionne
  - ✅ AGENT voit uniquement ses bookings
- **Files :**
  - `apps/frontend/src/app/features/booking/components/booking-history/booking-history.component.ts`

---

### S8-FE-002 : Créer BookingDetail Component (lecture seule)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S8-FE-002-booking-detail`
- **Commit :** `feat(booking): create booking detail view component`
- **Description :**
  - Créer `features/booking/components/booking-detail/`
  - Affichage lecture seule :
    - Infos générales
    - Chambres configurées
    - Offres appliquées
    - Suppléments
    - Prix final
    - Bouton breakdown **`p-dialog`**
  - Route : /booking/:id
- **Acceptance Criteria :**
  - ✅ Détail affiché depuis API
  - ✅ Breakdown modal fonctionne
- **Files :**
  - `apps/frontend/src/app/features/booking/components/booking-detail/booking-detail.component.ts`

---

### S8-FE-003 : Export PDF (booking summary)

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 3
- **Branch :** `feature/S8-FE-003-export-pdf`
- **Commit :** `feat(booking): add PDF export functionality`
- **Description :**
  - Installer : `npm install jspdf jspdf-autotable`
  - Créer `shared/services/export.service.ts`
  - Méthode `exportBookingToPDF(booking)`
  - Contenu PDF : header, infos réservation, tableau prix, total final
  - Bouton "Export PDF" dans BookingSummary et BookingDetail

```typescript
// export.service.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';

exportBookingToPDF(booking: Booking): void {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Runner - Simulation de Réservation', 20, 20);
  doc.setFontSize(12);
  doc.text(`Hôtel: ${booking.hotel.name}`, 20, 40);
  doc.text(`Dates: ${booking.checkIn} → ${booking.checkOut}`, 20, 50);

  (doc as any).autoTable({
    startY: 60,
    head: [['Description', 'Montant']],
    body: [
      ['Chambres (avant réductions)', `${booking.roomsSubtotal}€`],
      ['Réductions', `-${booking.discountAmount}€`],
      ['Suppléments', `${booking.supplementsTotal}€`],
      ['TOTAL', `${booking.totalAmount}€`],
    ],
  });

  doc.save(`booking_${booking.id}.pdf`);
}
```

- **Acceptance Criteria :**
  - ✅ PDF généré avec toutes les infos
  - ✅ Téléchargement fonctionne
- **Files :**
  - `apps/frontend/src/app/shared/services/export.service.ts`

---

### S8-FE-004 : Améliorer Dashboard (stats réelles)

- **Type :** Enhancement
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feat/S8-FE-004-dashboard-stats`
- **Commit :** `feat(dashboard): display real statistics from API`
- **Description :**
  - Cards stats :
    - Nombre d'hôtels actifs
    - Nombre de contrats actifs
    - Nombre de simulations ce mois
  - Liste des dernières simulations (depuis API)
  - Graphique optionnel : simulations par mois
- **Acceptance Criteria :**
  - ✅ Stats réelles affichées
  - ✅ Liste dernières simulations
- **Files :**
  - `apps/frontend/src/app/features/dashboard/dashboard.component.ts`
  - `apps/backend/src/stats/stats.controller.ts` (nouveau endpoint)

---

### S8-FE-005 : Tests unitaires Frontend

- **Type :** Test
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `test/S8-FE-005-frontend-tests`
- **Commit :** `test(frontend): add unit tests for core components`
- **Description :**
  - Composants critiques :
    - BookingWizard (navigation)
    - RoomConfiguration (validation capacités)
    - OffersSelection (blocage SEQUENTIAL/ADDITIVE)
    - BookingSummary (affichage résultat)
  - Services :
    - BookingService (calculatePrice)
    - OffersService (validateCompatibility)
  - Mock HttpClient
- **Acceptance Criteria :**
  - ✅ Coverage > 70%
  - ✅ Tous les tests passent
- **Files :**
  - `apps/frontend/src/app/features/booking/**/*.spec.ts`

---

### S8-FE-006 : Accessibilité (A11y)

- **Type :** Enhancement
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feat/S8-FE-006-accessibility`
- **Commit :** `feat(a11y): improve accessibility with ARIA labels`
- **Description :**
  - ARIA labels sur tous les formulaires
  - Navigation clavier (Tab, Enter, Escape)
  - Contraste couleurs (WCAG AA — ratio > 4.5:1)
  - Focus visible sur tous les éléments interactifs
  - PrimeNG est accessible by default — vérifier les overrides Tailwind
- **Acceptance Criteria :**
  - ✅ Navigation clavier fonctionne
  - ✅ ARIA labels présents
  - ✅ Lighthouse Accessibility > 90/100
- **Files :**
  - Tous les composants

---

### S8-FE-007 : Responsive Mobile

- **Type :** Enhancement
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feat/S8-FE-007-responsive`
- **Commit :** `feat(ui): improve mobile responsive design`
- **Description :**
  - Tester sur 320px, 768px, 1024px
  - Sidebar collapse sur mobile (PrimeNG p-sidebar ou p-drawer)
  - Tables **`p-table`** avec scroll horizontal sur mobile
  - Boutons min 44×44px
  - Formulaires adaptés mobile
- **Acceptance Criteria :**
  - ✅ App utilisable sur mobile
  - ✅ Pas de scroll horizontal non voulu
  - ✅ Boutons assez grands
- **Files :**
  - Composants Tailwind CSS

---

## Documentation Tasks

### S8-DOC-001 : README.md complet

- **Type :** Documentation
- **Priority :** P1
- **Story Points :** 1
- **Branch :** `docs/S8-DOC-001-readme`
- **Commit :** `docs: update README with complete setup instructions`
- **Description :**
  - Mettre à jour le README.md existant
  - Vérifier que les instructions de setup sont à jour
  - Ajouter section Architecture NX monorepo
- **Acceptance Criteria :**
  - ✅ README complet et à jour
  - ✅ Instructions de setup fonctionnent
- **Files :**
  - `README.md`

---

### S8-DOC-002 : Guide utilisateur

- **Type :** Documentation
- **Priority :** P2
- **Story Points :** 1
- **Branch :** `docs/S8-DOC-002-user-guide`
- **Commit :** `docs: create user guide`
- **Description :**
  - Créer `docs/USER_GUIDE.md`
  - Sections : Login, Créer un hôtel, Créer un contrat, Créer une offre, Faire une simulation
- **Acceptance Criteria :**
  - ✅ Guide utilisateur complet
- **Files :**
  - `docs/USER_GUIDE.md`

---

## Definition of Done - Sprint 8

### Backend

- ✅ Indexes optimisés
- ✅ Endpoints bookings : history, save, detail, delete
- ✅ Swagger documentation complète
- ✅ Tous les tests passent

### Frontend

- ✅ Historique bookings avec filtres (p-table)
- ✅ Détail booking lecture seule
- ✅ Export PDF fonctionne
- ✅ Dashboard avec stats réelles
- ✅ Tests unitaires > 70% coverage
- ✅ Accessibilité améliorée
- ✅ Responsive mobile

### Documentation

- ✅ README.md à jour
- ✅ Guide utilisateur
- ✅ Swagger API docs

### Performance

- ✅ Lighthouse score > 85/100
- ✅ Temps de réponse API < 500ms
- ✅ Calcul pricing < 2s pour 30 nuits

### Qualité Code

- ✅ Pas de console.log en production
- ✅ ESLint + Prettier appliqués
- ✅ Pas de warnings build Angular

---

## Dépendances

- Sprint 7 doit être terminé

---

## Risques

| Risque                   | Mitigation                          |
| ------------------------ | ----------------------------------- |
| Export PDF complexe      | Template simple jsPDF               |
| Performance mobile lente | Tester tôt, optimiser avec Tailwind |
| Tests trop longs         | Paralléliser si possible            |
