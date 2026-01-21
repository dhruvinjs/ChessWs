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

# Installing the pm2 to restart the server again if it crashes
RUN npm install -g pm2
COPY ecosystem.config.cjs ./

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.cjs"]
