FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY apps/backend ./apps/backend

# Exposer le port
EXPOSE 3000

# Démarrer en mode watch
CMD ["npx", "nx", "serve", "backend", "--host", "0.0.0.0"]