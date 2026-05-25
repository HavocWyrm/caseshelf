CREATE TYPE item_type AS ENUM ('game', 'movie', 'show');

CREATE TABLE platform (
  id   BIGSERIAL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (id)
);

CREATE TABLE format (
  id   BIGSERIAL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (id)
);

CREATE TABLE collection_item (
  id    BIGSERIAL,
  title TEXT NOT NULL,
  type  item_type NOT NULL,
  owned BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

CREATE TABLE game (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  platform_id        BIGINT NOT NULL REFERENCES platform(id),
  PRIMARY KEY (id)
);

CREATE TABLE movie (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  format_id          BIGINT NOT NULL REFERENCES format(id),
  PRIMARY KEY (id)
);

CREATE TABLE show (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  format_id          BIGINT NOT NULL REFERENCES format(id),
  seasons_owned      SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

CREATE TABLE franchise (
  id    BIGSERIAL,
  name  TEXT NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

CREATE TABLE franchise_item (
  id                 BIGSERIAL,
  franchise_id       BIGINT NOT NULL REFERENCES franchise(id) ON DELETE CASCADE,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  order              SMALLINT,
  PRIMARY KEY (id),
  UNIQUE (franchise_id, collection_item_id)
);

CREATE TABLE item_url (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE UNIQUE,
  site_url           TEXT NOT NULL,
  site_label         TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE "user" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  "scope" TEXT,
  "idToken" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "verification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);