# Structure du Projet NX - Runner

## Vue d'ensemble

Ce projet utilise **NX** comme monorepo manager avec deux applications principales:
- **Backend**: API NestJS
- **Frontend**: Application Angular

## Structure correcte

```
/home/tokimanana/Projects/Runner/
├── apps/
│   ├── backend/
│   │   ├── src/                    # Code source TypeScript
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.service.ts
│   │   │   └── main.ts
│   │   ├── test/                   # Tests e2e
│   │   ├── dist/                   # Fichiers compilés (généré par build)
│   │   ├── tsconfig.json           # Configuration TypeScript
│   │   ├── tsconfig.build.json     # Configuration pour la compilation
│   │   ├── jest.config.ts          # Configuration Jest
│   │   └── project.json            # Configuration NX
│   │
│   └── frontend/
│       ├── src/                    # Code source TypeScript/Angular
│       │   ├── app/
│       │   ├── assets/
│       │   ├── index.html
│       │   ├── main.ts
│       │   └── styles.scss
│       ├── public/
│       ├── dist/                   # Fichiers compilés (généré par build)
│       ├── tsconfig.json           # Configuration TypeScript
│       ├── tsconfig.app.json       # Configuration pour l'app
│       ├── jest.config.ts          # Configuration Jest
│       └── project.json            # Configuration NX
│
├── dist/                           # Répertoire de sortie global
│   ├── apps/
│   │   ├── backend/                # Fichiers compilés du backend
│   │   └── frontend/               # Fichiers compilés du frontend
│   └── coverage/                   # Rapports de couverture
│
├── docs/                           # Documentation
├── node_modules/                   # Dépendances (ignoré par git)
├── nx.json                         # Configuration NX
├── package.json                    # Dépendances du projet
└── tsconfig.json                   # Configuration TypeScript racine
```

## Points clés de la restructuration

### ✅ Corrections apportées

1. **Séparation source/compilation**
   - Les fichiers `.ts` restent dans `src/`
   - Les fichiers compilés `.js` et `.js.map` vont dans `dist/`
   - Les fichiers `.js` générés dans `src/` ont été supprimés

2. **Configuration TypeScript**
   - Ajout de `rootDir: "src"` pour indiquer la source
   - Ajout de `outDir: "dist"` pour la sortie
   - Ajout de `paths` pour les alias `@/*`
   - Inclusion/exclusion correctes des fichiers

3. **Configuration Jest**
   - Chemins de couverture corrigés
   - Mappage des modules pour les alias
   - Répertoires racine correctement définis

4. **Configuration NX**
   - Backend: utilise `@nx/node:build` au lieu de `nx:run-commands`
   - Frontend: utilise `@angular-devkit/build-angular:browser`
   - Chemins de sortie cohérents

5. **Nettoyage**
   - Suppression du répertoire dupliqué `apps/backend/apps/`
   - Suppression de tous les fichiers `.js` et `.js.map` générés
   - Nettoyage des répertoires `dist/` locaux

## Commandes disponibles

```bash
# Démarrer le développement
npm start

# Builder les applications
npm run build

# Lancer les tests
npm run test

# Linter le code
npm run lint

# Formater le code
npm run format
```

## Commandes spécifiques par app

```bash
# Backend
nx build backend
nx serve backend
nx test backend
nx lint backend

# Frontend
nx build frontend
nx serve frontend
nx test frontend
nx lint frontend
```

## Alias d'import

Vous pouvez maintenant utiliser les alias `@/` pour importer depuis `src/`:

```typescript
// Au lieu de:
import { AppService } from '../../../services/app.service';

// Utilisez:
import { AppService } from '@/services/app.service';
```

## Prochaines étapes

1. Exécuter `npm install` pour s'assurer que toutes les dépendances sont installées
2. Exécuter `npm run build` pour compiler les applications
3. Exécuter `npm run test` pour vérifier que les tests passent
4. Commencer le développement avec `npm start`
