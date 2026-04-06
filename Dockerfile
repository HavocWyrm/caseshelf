# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.5.0

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

FROM base as deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM deps as build
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

FROM base as final
ENV NODE_ENV production
USER node
COPY --chown=node:node package.json .
COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/.next/ ./.next/
COPY --chown=node:node --from=build /usr/src/app/public/ ./public/
COPY --chown=node:node --from=build /usr/src/app/src/lib/migrations/ ./src/lib/migrations/
COPY --chown=node:node next.config.ts .

EXPOSE 3000
CMD npm start