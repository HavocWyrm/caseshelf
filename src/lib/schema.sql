CREATE TYPE item_type AS ENUM ('game', 'movie', 'show');

CREATE TABLE platform (
  id               BIGSERIAL,
  name             TEXT NOT NULL,
  short_name       TEXT NOT NULL,
  igdb_platform_id INTEGER UNIQUE,
  enabled          BOOLEAN NOT NULL DEFAULT true,
  sort_order       INTEGER,
  PRIMARY KEY (id)
);

CREATE TABLE format (
  id         BIGSERIAL,
  name       TEXT NOT NULL,
  enabled    BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (id)
);

CREATE TABLE genre (
  id                BIGSERIAL,
  media_type        item_type NOT NULL,
  name              TEXT NOT NULL,
  sort_order        INTEGER,
  provider          TEXT,
  provider_genre_id TEXT,
  PRIMARY KEY (id),
  CHECK ((provider IS NULL) = (provider_genre_id IS NULL))
);

CREATE UNIQUE INDEX genre_media_type_name_key ON genre (media_type, lower(name));
CREATE UNIQUE INDEX genre_provider_key ON genre (provider, provider_genre_id) WHERE provider IS NOT NULL;

CREATE FUNCTION genre_default_sort_order() RETURNS trigger AS $$
BEGIN
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO NEW.sort_order
    FROM genre
    WHERE media_type = NEW.media_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER genre_default_sort_order
  BEFORE INSERT ON genre
  FOR EACH ROW EXECUTE FUNCTION genre_default_sort_order();

CREATE TABLE collection_item (
  id                  BIGSERIAL,
  title               TEXT NOT NULL,
  type                item_type NOT NULL,
  owned               BOOLEAN NOT NULL DEFAULT false,
  release_year        SMALLINT,
  provider            TEXT,
  provider_id         TEXT,
  metadata_fetched_at TIMESTAMPTZ,
  locked_field        TEXT[] NOT NULL DEFAULT '{}',
  synopsis            TEXT,
  PRIMARY KEY (id),
  CONSTRAINT collection_item_provider_check CHECK (
    provider IS NULL
    OR (provider = 'igdb' AND type = 'game')
    OR (provider = 'tmdb' AND type IN ('movie', 'show'))
  ),
  CONSTRAINT collection_item_provider_id_check CHECK ((provider IS NULL) = (provider_id IS NULL))
);

CREATE INDEX collection_item_provider_idx ON collection_item (provider, provider_id) WHERE provider IS NOT NULL;

CREATE TABLE game (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  platform_id        BIGINT NOT NULL REFERENCES platform(id),
  developer          TEXT,
  publisher          TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE movie (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  format_id          BIGINT NOT NULL REFERENCES format(id),
  runtime_minutes    SMALLINT,
  director           TEXT,
  certification      TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE show (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  format_id          BIGINT NOT NULL REFERENCES format(id),
  seasons_owned      SMALLINT NOT NULL DEFAULT 0,
  total_seasons      SMALLINT,
  network            TEXT,
  series_status      TEXT,
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
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE UNIQUE,
  franchise_order    SMALLINT,
  PRIMARY KEY (id)
);

CREATE TABLE item_url (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE UNIQUE,
  site_url           TEXT NOT NULL,
  site_label         TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE item_genre (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  genre_id           BIGINT NOT NULL REFERENCES genre(id) ON DELETE CASCADE,
  is_primary         BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id),
  UNIQUE (collection_item_id, genre_id)
);

CREATE UNIQUE INDEX item_genre_primary_key ON item_genre (collection_item_id) WHERE is_primary;

CREATE TABLE setting (
  key        TEXT,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key)
);

CREATE TABLE job_run (
  id              BIGSERIAL,
  job_name        TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at     TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
  processed_count INTEGER NOT NULL DEFAULT 0,
  summary         JSONB NOT NULL DEFAULT '{}',
  error           TEXT,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX job_run_running_key ON job_run (job_name) WHERE status = 'running';
CREATE INDEX job_run_job_name_idx ON job_run (job_name, started_at DESC);
