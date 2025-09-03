# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY next.config.* ./
COPY postcss.config.* ./
COPY *.mjs ./

COPY prisma ./prisma
COPY lib ./lib
COPY src ./src
COPY public ./public

RUN npx prisma generate

ENV DATABASE_URL="file:./build-temp.db"
RUN npx prisma db push --force-reset

RUN npm run build -- --no-lint

# ---- Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/caseshelf.db

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/src/generated ./src/generated

COPY ./docker/entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

RUN ls -la /app/entrypoint.sh && head -5 /app/entrypoint.sh

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

CMD ["/app/entrypoint.sh"]