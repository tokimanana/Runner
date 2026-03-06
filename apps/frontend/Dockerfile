# ─────────────────────────────────────────
# Stage 1 – deps : install all dependencies
# ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

RUN npm ci

# ─────────────────────────────────────────
# Stage 2 – dev : hot-reload development
# ─────────────────────────────────────────
FROM deps AS dev
WORKDIR /app

COPY . .

EXPOSE 4200

CMD ["npx", "nx", "serve", "frontend", "--host=0.0.0.0", "--poll=2000", "--disable-host-check"]

# ─────────────────────────────────────────
# Stage 3 – builder : compile for production
# ─────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY . .

RUN npx nx build frontend --configuration=production

# ─────────────────────────────────────────
# Stage 4 – production (served by nginx)
# ─────────────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config for Angular (handles deep links / SPA routing)
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled Angular app
COPY --from=builder /app/dist/apps/frontend /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
