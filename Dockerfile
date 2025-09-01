# ---- Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma

COPY lib ./lib

COPY src ./src

RUN npx prisma generate

RUN npm run build

# ---- Runner ----
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/caseshelf.db

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma

COPY ./docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["/app/entrypoint.sh"]