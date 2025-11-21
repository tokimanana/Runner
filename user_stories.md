# User Stories - Système de gestion TO

## Sprint 0 : Setup & Infrastructure

### US-0.1 : Setup du projet
**En tant que** développeur  
**Je veux** initialiser le projet Angular + Firebase  
**Afin de** commencer le développement

**Critères d'acceptation :**
- [ ] Projet Angular 16+ créé avec Angular CLI
- [ ] Firebase initialisé (Firestore, Auth, Hosting)
- [ ] Structure de dossiers établie (modules, services, models)
- [ ] Configuration des environnements (dev, prod)
- [ ] Routing de base configuré
- [ ] UI library installée (Angular Material ou PrimeNG)

**Estimation :** 2 jours

---

### US-0.2 : Authentification multi-tenant
**En tant que** utilisateur  
**Je veux** me connecter avec mon compte TO  
**Afin de** accéder aux données de mon organisation

**Critères d'acceptation :**
- [ ] Page de login avec email/password
- [ ] Vérification du tourOperatorId au login
- [ ] Redirection selon le rôle (Admin/Manager/Agent)
- [ ] Guard pour protéger les routes
- [ ] Déconnexion fonctionnelle
- [ ] Gestion des erreurs d'authentification

**Estimation :** 2 jours

---

## Sprint 1 : Configuration de base (Hotels, Rooms, Meals)

### US-1.1 : Créer un hôtel
**En tant que** Manager  
**Je veux** créer un nouvel hôtel  
**Afin de** commencer à configurer mes contrats

**Critères d'acceptation :**
- [ ] Formulaire de création : nom, code, destination, adresse, contact
- [ ] Validation des champs obligatoires
- [ ] Vérification unicité du code hôtel
- [ ] Sauvegarde dans Firestore avec tourOperatorId
- [ ] Message de confirmation
- [ ] Liste des hôtels créés affichée

**Estimation :** 1 jour

---

### US-1.2 : Configurer les Age Categories d'un hôtel
**En tant que** Manager  
**Je veux** définir les tranches d'âge pour un hôtel  
**Afin de** différencier les tarifs selon l'âge des clients

**Critères d'acceptation :**
- [ ] Interface pour ajouter des catégories (Infant, Child, Adult)
- [ ] Champs : nom, minAge, maxAge
- [ ] Validation : maxAge > minAge
- [ ] Validation : pas de chevauchement d'âges
- [ ] Ordre personnalisable (drag & drop ou numéro)
- [ ] Modification et suppression possibles
- [ ] Au moins une catégorie obligatoire

**Estimation :** 2 jours

---

### US-1.3 : Créer des Room Types
**En tant que** Manager  
**Je veux** créer des types de chambres pour un hôtel  
**Afin de** définir les capacités disponibles

**Critères d'acceptation :**
- [ ] Sélection de l'hôtel parent
- [ ] Formulaire : nom, code, maxAdults, maxChildren, description
- [ ] Validation : capacités > 0
- [ ] Liste des rooms par hôtel
- [ ] Modification et suppression
- [ ] Statut actif/inactif

**Estimation :** 1.5 jour

---

### US-1.4 : Créer des Meal Plans
**En tant que** Manager  
**Je veux** créer des régimes alimentaires  
**Afin de** les associer aux contrats

**Critères d'acceptation :**
- [ ] Formulaire : code (BB, HB, FB, AI), nom, description
- [ ] Validation unicité du code
- [ ] Liste des meal plans avec recherche/filtrage
- [ ] Modification et suppression
- [ ] Statut actif/inactif

**Estimation :** 1 jour

---

### US-1.5 : Créer des Markets & Currencies
**En tant que** Manager  
**Je veux** définir mes marchés cibles et devises  
**Afin de** configurer les contrats par zone géographique

**Critères d'acceptation :**
- [ ] Formulaire Markets : nom, code (FR, UK, DE...)
- [ ] Formulaire Currencies : code (EUR, USD), symbole, nom
- [ ] Liste avec statut actif/inactif
- [ ] Une currency peut être associée à plusieurs markets
- [ ] Validation unicité des codes

**Estimation :** 1 jour

---

## Sprint 2 : Contrats tarifaires

### US-2.1 : Créer un contrat simple (par chambre)
**En tant que** Manager  
**Je veux** créer un contrat tarifaire simple  
**Afin de** définir un prix par chambre par nuit

**Critères d'acceptation :**
- [ ] Sélection : Hotel, Room Type, Meal Plan, Market, Currency
- [ ] Dates de validité (from/to)
- [ ] Mode de tarification : PER_ROOM
- [ ] Prix par nuit (un seul champ)
- [ ] Validation : dates cohérentes
- [ ] Sauvegarde et affichage dans la liste

**Estimation :** 2 jours

---

### US-2.2 : Créer un contrat complexe (par personne)
**En tant que** Manager  
**Je veux** créer un contrat avec tarifs par catégorie d'âge  
**Afin de** différencier les prix selon l'âge

**Critères d'acceptation :**
- [ ] Sélection du mode PER_PERSON
- [ ] Affichage dynamique des Age Categories de l'hôtel choisi
- [ ] Saisie d'un prix pour chaque catégorie
- [ ] Validation : au moins une catégorie avec prix
- [ ] Sauvegarde dans subcollection `prices`

**Estimation :** 2 jours

---

### US-2.3 : Créer un contrat hybride
**En tant que** Manager  
**Je veux** mélanger tarifs par chambre et par personne  
**Afin de** gérer des contrats complexes

**Critères d'acceptation :**
- [ ] Sélection du mode HYBRID
- [ ] Pour chaque Room Type dans le contrat :
  - [ ] Choix du mode (PER_ROOM ou PER_PERSON)
  - [ ] Saisie du/des prix selon le mode
- [ ] Validation : cohérence des données
- [ ] Affichage clair dans la liste des contrats

**Estimation :** 3 jours

---

### US-2.4 : Ajouter des règles spéciales
**En tant que** Manager  
**Je veux** définir des règles tarifaires exceptionnelles  
**Afin de** gérer les cas spéciaux (enfant gratuit, 3ème adulte à 50%, etc.)

**Critères d'acceptation :**
- [ ] Interface pour ajouter une règle à un contrat
- [ ] Types de règles prédéfinis (FREE_CHILD, DISCOUNT_THIRD_ADULT)
- [ ] Configuration des conditions :
  - [ ] Âge max de l'enfant
  - [ ] Nombre min d'adultes
  - [ ] Pourcentage de réduction
- [ ] Validation des conditions
- [ ] Affichage des règles associées au contrat

**Estimation :** 2 jours

---

## Sprint 3 : Offres promotionnelles

### US-3.1 : Créer une offre en pourcentage
**En tant que** Manager  
**Je veux** créer une offre de réduction en %  
**Afin de** promouvoir mes produits

**Critères d'acceptation :**
- [ ] Formulaire : nom, description, dates validité
- [ ] Type : PERCENTAGE
- [ ] Valeur : nombre entre 0 et 100
- [ ] Mode de calcul : CUMULATIVE ou COMBINABLE
- [ ] Options d'application : room, meal plan
- [ ] Statut actif/inactif

**Estimation :** 1.5 jour

---

### US-3.2 : Créer une offre en montant fixe
**En tant que** Manager  
**Je veux** créer une offre avec montant fixe  
**Afin de** offrir une réduction absolue

**Critères d'acceptation :**
- [ ] Type : FLAT_AMOUNT
- [ ] Valeur : montant positif
- [ ] Mêmes options que US-3.1
- [ ] Validation : montant > 0

**Estimation :** 1 jour

---

### US-3.3 : Associer une offre aux suppléments
**En tant que** Manager  
**Je veux** choisir quels suppléments peuvent recevoir l'offre  
**Afin de** personnaliser les promotions

**Critères d'acceptation :**
- [ ] Liste des suppléments disponibles
- [ ] Sélection multiple (checkbox)
- [ ] Pour chaque supplément : activer/désactiver la réduction
- [ ] Sauvegarde dans subcollection `applicableSupplements`

**Estimation :** 1.5 jour

---

### US-3.4 : Gérer les offres cumulatives vs combinables
**En tant que** Manager  
**Je veux** comprendre et choisir le mode de calcul  
**Afin de** appliquer correctement mes offres

**Critères d'acceptation :**
- [ ] Tooltip explicatif sur CUMULATIVE vs COMBINABLE
- [ ] Exemple de calcul affiché dans l'interface
- [ ] Validation : impossible de mixer les deux modes dans une réservation
- [ ] Message d'avertissement si conflit détecté

**Estimation :** 1 jour

---

## Sprint 4 : Suppléments

### US-4.1 : Créer des suppléments
**En tant que** Manager  
**Je veux** créer des suppléments (transfer, excursion, etc.)  
**Afin de** les ajouter aux réservations

**Critères d'acceptation :**
- [ ] Formulaire : nom, description, prix
- [ ] Unité : PER_PERSON, PER_ROOM, PER_STAY
- [ ] Flag : canReceiveDiscount (oui/non)
- [ ] Statut actif/inactif
- [ ] Liste avec recherche/filtrage

**Estimation :** 1.5 jour

---

## Sprint 5 : Simulation de réservation (MVP)

### US-5.1 : Sélectionner un hôtel et des dates
**En tant que** Agent  
**Je veux** choisir un hôtel et une période de séjour  
**Afin de** démarrer une simulation

**Critères d'acceptation :**
- [ ] Liste des hôtels actifs
- [ ] Date picker : check-in et check-out
- [ ] Validation : check-out > check-in
- [ ] Calcul automatique du nombre de nuits
- [ ] Affichage des contrats valides pour cette période

**Estimation :** 1.5 jour

---

### US-5.2 : Sélectionner des chambres et guests
**En tant que** Agent  
**Je veux** choisir les chambres et préciser le nombre de personnes  
**Afin de** calculer le tarif adapté

**Critères d'acceptation :**
- [ ] Liste des Room Types disponibles
- [ ] Pour chaque room :
  - [ ] Nombre d'adultes (min 1, max selon capacité)
  - [ ] Nombre d'enfants (max selon capacité)
  - [ ] Âge de chaque enfant (selon Age Categories)
- [ ] Validation des capacités
- [ ] Possibilité d'ajouter plusieurs chambres
- [ ] Sélection du Meal Plan par chambre

**Estimation :** 3 jours

---

### US-5.3 : Appliquer des offres valides
**En tant que** Agent  
**Je veux** voir et sélectionner les offres disponibles  
**Afin de** réduire le prix de la réservation

**Critères d'acceptation :**
- [ ] Affichage automatique des offres valides pour la période
- [ ] Filtrage des offres selon les dates de séjour
- [ ] Sélection multiple d'offres (si compatibles)
- [ ] Warning si mix CUMULATIVE + COMBINABLE
- [ ] Aperçu de la réduction estimée

**Estimation :** 2 jours

---

### US-5.4 : Ajouter des suppléments
**En tant que** Agent  
**Je veux** ajouter des suppléments à la réservation  
**Afin de** compléter l'offre

**Critères d'acceptation :**
- [ ] Liste des suppléments actifs
- [ ] Pour chaque supplément :
  - [ ] Quantité (selon l'unité : nb personnes, chambres, ou 1 si par séjour)
  - [ ] Prix unitaire affiché
  - [ ] Indication si réduction applicable
- [ ] Ajout/suppression dynamique
- [ ] Calcul en temps réel du total suppléments

**Estimation :** 2 jours

---

### US-5.5 : Calculer le prix total
**En tant que** Agent  
**Je veux** obtenir le prix final de la réservation  
**Afin de** présenter le tarif au client

**Critères d'acceptation :**
- [ ] Bouton "Calculer le prix"
- [ ] Appel API au moteur de calcul backend (NestJS PricingService)
- [ ] Affichage du résultat :
  - [ ] Sous-total chambres
  - [ ] Réductions appliquées
  - [ ] Total suppléments
  - [ ] **Total final**
- [ ] Gestion des erreurs (contrat manquant, offre invalide)
- [ ] Sauvegarde de la simulation en base de données

**Estimation :** 3 jours

---

### US-5.6 : Consulter le breakdown détaillé
**En tant que** Agent  
**Je veux** voir le détail nuit par nuit  
**Afin de** comprendre le calcul du prix

**Critères d'acceptation :**
- [ ] Tableau récapitulatif :
  - [ ] Date de chaque nuit
  - [ ] Prix de base
  - [ ] Offres appliquées cette nuit (nom + montant)
  - [ ] Prix final de la nuit
- [ ] Détail par chambre si plusieurs chambres
- [ ] Export en CSV (optionnel pour MVP)

**Estimation :** 2 jours

---

## Sprint 6 : Moteur de calcul tarifaire (Backend)

### US-6.1 : Calculer le prix de base par nuit
**En tant que** système  
**Je veux** calculer le prix de chaque nuit  
**Afin de** appliquer ensuite les offres

**Critères d'acceptation :**
- [ ] Récupération du contrat valide
- [ ] Calcul selon le mode (PER_PERSON ou PER_ROOM)
- [ ] Application des règles spéciales (enfant gratuit, etc.)
- [ ] Gestion du meal plan (inclus ou en supplément)
- [ ] Retour du prix brut par nuit

**Estimation :** 2 jours

---

### US-6.2 : Appliquer les offres nuit par nuit
**En tant que** système  
**Je veux** vérifier si chaque offre est valide pour chaque nuit  
**Afin de** gérer les périodes partielles

**Critères d'acceptation :**
- [ ] Boucle sur chaque nuit du séjour
- [ ] Pour chaque nuit, vérifier si date dans [validFrom, validTo] de chaque offre
- [ ] Si valide, marquer l'offre comme applicable
- [ ] Si invalide, ne pas appliquer
- [ ] Retour de la liste des offres par nuit

**Estimation :** 2 jours

---

### US-6.3 : Appliquer les offres combinables
**En tant que** système  
**Je veux** additionner les réductions puis appliquer  
**Afin de** respecter le mode COMBINABLE

**Critères d'acceptation :**
- [ ] Identification des offres COMBINABLE sélectionnées
- [ ] Calcul : totalReduction = sum(offre.value)
- [ ] Application : prixFinal = prixBase × (1 - totalReduction / 100)
- [ ] Retour du montant réduit

**Estimation :** 1 jour

---

### US-6.4 : Appliquer les offres cumulatives
**En tant que** système  
**Je veux** appliquer les réductions successivement  
**Afin de** respecter le mode CUMULATIVE

**Critères d'acceptation :**
- [ ] Identification des offres CUMULATIVE sélectionnées
- [ ] Tri des offres (ordre défini ou par valeur décroissante)
- [ ] Boucle : prixTemp = prixTemp × (1 - offre.value / 100)
- [ ] Retour du montant final après toutes les réductions

**Estimation :** 1 jour

---

### US-6.5 : Calculer les suppléments avec réductions
**En tant que** système  
**Je veux** appliquer les offres aux suppléments autorisés  
**Afin de** calculer leur prix final

**Critères d'acceptation :**
- [ ] Pour chaque supplément :
  - [ ] Vérifier si canReceiveDiscount = true
  - [ ] Si oui, appliquer les offres selon leur configuration
  - [ ] Si non, garder le prix plein tarif
- [ ] Calcul selon l'unité (× quantité)
- [ ] Retour du total suppléments

**Estimation :** 2 jours

---

### US-6.6 : Générer le breakdown complet
**En tant que** système  
**Je veux** structurer toutes les données calculées  
**Afin de** les renvoyer au frontend

**Critères d'acceptation :**
- [ ] Structure JSON claire :
  - [ ] Détail par nuit (date, prix base, réductions, prix final)
  - [ ] Détail par chambre
  - [ ] Détail par supplément
  - [ ] Sous-totaux et total global
- [ ] Sauvegarde dans Firestore (collection `bookings`)
- [ ] Retour au client en <500ms

**Estimation :** 2 jours

---

## Sprint 7 : Administration & Qualité de vie

### US-7.1 : Gérer les utilisateurs
**En tant que** Admin  
**Je veux** créer et gérer les comptes utilisateurs  
**Afin de** contrôler les accès

**Critères d'acceptation :**
- [ ] Liste des utilisateurs de mon TO
- [ ] Création : email, nom, prénom, rôle
- [ ] Modification du rôle
- [ ] Désactivation (soft delete)
- [ ] Envoi email d'invitation (Firebase Auth)

**Estimation :** 2 jours

---

### US-7.2 : Consulter l'historique des simulations
**En tant que** Manager  
**Je veux** voir toutes les simulations effectuées  
**Afin de** analyser l'activité

**Critères d'acceptation :**
- [ ] Liste paginée des bookings (status SIMULATION)
- [ ] Filtres : par user, par hôtel, par date
- [ ] Affichage : date, hôtel, total, créé par
- [ ] Ouverture du détail complet
- [ ] Export CSV (optionnel)

**Estimation :** 2 jours

---

### US-7.3 : Exporter une simulation en PDF
**En tant que** Agent  
**Je veux** télécharger une simulation en PDF  
**Afin de** la partager avec le client

**Critères d'acceptation :**
- [ ] Bouton "Exporter PDF" sur le détail d'une simulation
- [ ] Génération du PDF avec :
  - [ ] Infos hôtel, dates, chambres
  - [ ] Breakdown détaillé
  - [ ] Total
- [ ] Logo du TO (optionnel)
- [ ] Téléchargement automatique

**Estimation :** 2 jours

---

## Backlog futur (post-MVP)

### US-8.1 : Gestion des taxes
- Configuration des taxes (%, montant fixe)
- Application selon pays/hôtel
- Affichage séparé dans le breakdown

### US-8.2 : Gestion des disponibilités
- Allotements par hôtel/room/période
- Vérification avant réservation
- Warning si stock faible

### US-8.3 : Workflow de validation
- Statuts : Simulation → Brouillon → En attente → Confirmée
- Notifications par email
- Historique des changements

### US-8.4 : Dashboard analytics
- KPIs : nb simulations, taux de conversion
- Graphiques par hôtel, par market
- Top offres utilisées

### US-8.5 : Multi-langue
- Interface en FR, EN, ES
- Configuration par utilisateur
- Traduction des contenus dynamiques

---

## Priorisation pour le POC

### Must Have (4-5 semaines)
- US-0.1, US-0.2 (Setup + Auth)
- US-1.1 à US-1.5 (Configuration de base)
- US-2.1, US-2.2 (Contrats simples)
- US-3.1 (Offres en %)
- US-4.1 (Suppléments)
- US-5.1 à US-5.6 (Simulation complète)
- US-6.1 à US-6.6 (Moteur de calcul)

### Should Have (2-3 semaines)
- US-2.3 (Contrats hybrides)
- US-2.4 (Règles spéciales)
- US-3.2 à US-3.4 (Offres avancées)
- US-7.1, US-7.2 (Administration)

### Nice to Have (après POC)
- US-7.3 (Export PDF)
- US-8.x (Fonctionnalités avancées)

---

**Total estimation MVP : 35-40 jours de développement**
