FROM node:20-alpine

WORKDIR /app

RUN npm install -g @angular/cli

# Copier les fichiers de dépendances
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY apps/frontend ./apps/frontend

# Exposer le port Angular dev server
EXPOSE 4200

# Démarrer en mode développement avec hot-reload
CMD ["npx", "nx", "serve", "frontend", "--host", "0.0.0.0", "--poll", "2000"]
