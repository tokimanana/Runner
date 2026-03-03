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

# Generate Prisma client
#RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

EXPOSE 3000

CMD ["npx", "nx", "serve", "backend", "--host=0.0.0.0"]

# ─────────────────────────────────────────
# Stage 3 – builder : compile for production
# ─────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY . .

RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
RUN npx nx build backend --configuration=production

# ─────────────────────────────────────────
# Stage 4 – production
# ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Only copy production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist/apps/backend ./dist

# Copy Prisma schema + generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY apps/backend/prisma ./prisma

EXPOSE 3000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]