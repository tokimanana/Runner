# Commandes CLI - NX

Guide rapide des commandes essentielles pour développer avec NX.

## 🚀 Démarrage du projet

```bash
# Installer les dépendances
npm install

# Démarrer le développement (serveurs de dev)
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

---

## 📱 Frontend (Angular)

### Commandes principales

```bash
# Serveur de dev (http://localhost:4200)
npx nx serve frontend

# Build production
npx nx build frontend

# Tests
npx nx test frontend

# Linter
npx nx lint frontend

# Générer un composant
npx nx generate @nx/angular:component --project=frontend --name=components/navbar

# Générer un service
npx nx generate @nx/angular:service --project=frontend --name=services/auth

# Générer un guard
npx nx generate @nx/angular:guard --project=frontend --name=guards/auth

# Générer un pipe
npx nx generate @nx/angular:pipe --project=frontend --name=pipes/custom
```

---

## 🔧 Backend (NestJS)

### Commandes principales

```bash
# Serveur de dev (http://localhost:3000)
npx nx serve backend

# Build production
npx nx build backend

# Tests
npx nx test backend

# Linter
npx nx lint backend

# Générer un module complet (module + service + controller)
npx nx generate @nx/nest:resource --project=backend --name=users

# Générer un service
npx nx generate @nx/nest:service --project=backend --name=services/email

# Générer un controller
npx nx generate @nx/nest:controller --project=backend --name=api/products

# Générer un guard
npx nx generate @nx/nest:guard --project=backend --name=guards/jwt

# Générer un interceptor
npx nx generate @nx/nest:interceptor --project=backend --name=interceptors/logging
```

---

## 🗄️ Base de données (Prisma)

```bash
# Générer les types Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name add_users_table

# Voir l'interface Prisma Studio
npx prisma studio

# Seed la base de données
npx ts-node docs/database/seed.ts
```

---

## 📊 Utiles

```bash
# Afficher le graph du projet
npx nx graph

# Voir la structure des projets
npx nx show backend

# Vérifier la configuration
npx nx print-affected

# Nettoyer le cache
npx nx reset
```

---

## 💡 Conseils rapides

- Les commandes `npm run` lancent **tous les projets**
- Les commandes `npx nx` ciblent un **projet spécifique**
- Utilise `--help` pour plus de détails : `npx nx serve --help`
- Les fichiers `.spec.ts` sont les tests
- Les fichiers `.dto.ts` (Backend) sont les Data Transfer Objects
