FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci 

COPY . .

RUN npx prisma generate
RUN npm run build

RUN npm prune --omit=dev

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# RUN apk add --no-cache libssl3

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY bin/stockfish /app/bin/stockfish

# Make stockfish executable
RUN chmod +x /app/bin/stockfish
EXPOSE 3000
CMD ["node", "dist/src/index.js"]
