FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci 

# COPY ecosystem.config.js ./
COPY . .

RUN npx prisma generate
RUN npm run build

RUN npm prune --omit=dev

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y stockfish && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/src/index.js"]
