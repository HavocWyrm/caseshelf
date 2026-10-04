DELETE FROM franchise_item older
USING franchise_item newer
WHERE older.collection_item_id = newer.collection_item_id
  AND older.id < newer.id;

ALTER TABLE franchise_item
  DROP CONSTRAINT IF EXISTS franchise_item_franchise_id_collection_item_id_key;

ALTER TABLE franchise_item
  ADD CONSTRAINT franchise_item_collection_item_id_key UNIQUE (collection_item_id);

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

INSERT INTO genre (media_type, name, sort_order)
SELECT 'game', name, sort_order FROM game_genre;

INSERT INTO genre (media_type, name, sort_order)
SELECT 'movie', name, sort_order FROM media_genre;

INSERT INTO genre (media_type, name, sort_order)
SELECT 'show', name, ROW_NUMBER() OVER (ORDER BY name) FROM media_genre;

CREATE TABLE item_genre (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  genre_id           BIGINT NOT NULL REFERENCES genre(id) ON DELETE CASCADE,
  is_primary         BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id),
  UNIQUE (collection_item_id, genre_id)
);

CREATE UNIQUE INDEX item_genre_primary_key ON item_genre (collection_item_id) WHERE is_primary;

INSERT INTO item_genre (collection_item_id, genre_id, is_primary)
SELECT game.collection_item_id, genre.id, true
FROM game
INNER JOIN game_genre ON game_genre.id = game.primary_genre_id
INNER JOIN genre ON genre.media_type = 'game' AND genre.name = game_genre.name;

INSERT INTO item_genre (collection_item_id, genre_id, is_primary)
SELECT movie.collection_item_id, genre.id, true
FROM movie
INNER JOIN media_genre ON media_genre.id = movie.primary_genre_id
INNER JOIN genre ON genre.media_type = 'movie' AND genre.name = media_genre.name;

INSERT INTO item_genre (collection_item_id, genre_id, is_primary)
SELECT show.collection_item_id, genre.id, true
FROM show
INNER JOIN media_genre ON media_genre.id = show.primary_genre_id
INNER JOIN genre ON genre.media_type = 'show' AND genre.name = media_genre.name;

ALTER TABLE game  DROP COLUMN primary_genre_id;
ALTER TABLE movie DROP COLUMN primary_genre_id;
ALTER TABLE show  DROP COLUMN primary_genre_id;

DROP TABLE game_genre;
DROP TABLE media_genre;

ALTER TABLE format DROP COLUMN sort_order;

ALTER TABLE collection_item
  ADD COLUMN provider            TEXT,
  ADD COLUMN provider_id         TEXT,
  ADD COLUMN metadata_fetched_at TIMESTAMPTZ,
  ADD COLUMN locked_field        TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN synopsis            TEXT,
  ADD CONSTRAINT collection_item_provider_check CHECK (
    provider IS NULL
    OR (provider = 'igdb' AND type = 'game')
    OR (provider = 'tmdb' AND type IN ('movie', 'show'))
  ),
  ADD CONSTRAINT collection_item_provider_id_check CHECK ((provider IS NULL) = (provider_id IS NULL));

CREATE INDEX collection_item_provider_idx ON collection_item (provider, provider_id) WHERE provider IS NOT NULL;

ALTER TABLE game
  ADD COLUMN developer TEXT,
  ADD COLUMN publisher TEXT;

ALTER TABLE movie
  ADD COLUMN runtime_minutes SMALLINT,
  ADD COLUMN director        TEXT,
  ADD COLUMN certification   TEXT;

ALTER TABLE show
  ADD COLUMN total_seasons SMALLINT,
  ADD COLUMN network       TEXT,
  ADD COLUMN series_status TEXT;

CREATE TABLE setting (
  key        TEXT,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key)
);

ALTER TABLE platform
  ADD COLUMN igdb_platform_id INTEGER UNIQUE,
  ADD COLUMN short_name       TEXT;

UPDATE platform
SET name = igdb.name, short_name = igdb.short_name, igdb_platform_id = igdb.igdb_platform_id
FROM (VALUES
  ('PS1',                                 7,   'PlayStation',                        'PS1'),
  ('PS2',                                 8,   'PlayStation 2',                      'PS2'),
  ('PS3',                                 9,   'PlayStation 3',                      'PS3'),
  ('PS4',                                 48,  'PlayStation 4',                      'PS4'),
  ('PS5',                                 167, 'PlayStation 5',                      'PS5'),
  ('PSP',                                 38,  'PlayStation Portable',               'PSP'),
  ('PS Vita',                             46,  'PlayStation Vita',                   'PS Vita'),
  ('Xbox',                                11,  'Xbox',                               'Xbox'),
  ('Xbox 360',                            12,  'Xbox 360',                           'Xbox 360'),
  ('Xbox One',                            49,  'Xbox One',                           'Xbox One'),
  ('Xbox Series X|S',                     169, 'Xbox Series X|S',                    'Xbox X|S'),
  ('Nintendo Entertainment System (NES)', 18,  'Nintendo Entertainment System',      'NES'),
  ('Super Nintendo (SNES)',               19,  'Super Nintendo Entertainment System', 'SNES'),
  ('Nintendo 64',                         4,   'Nintendo 64',                        'N64'),
  ('GameCube',                            21,  'Nintendo GameCube',                  'GameCube'),
  ('Wii',                                 5,   'Wii',                                'Wii'),
  ('Wii U',                               41,  'Wii U',                              'Wii U'),
  ('Nintendo Switch',                     130, 'Nintendo Switch',                    'Switch'),
  ('Nintendo Switch 2',                   508, 'Nintendo Switch 2',                  'Switch 2'),
  ('Game Boy',                            33,  'Game Boy',                           'Game Boy'),
  ('Game Boy Color',                      22,  'Game Boy Color',                     'GBC'),
  ('Game Boy Advance',                    24,  'Game Boy Advance',                   'GBA'),
  ('Nintendo DS',                         20,  'Nintendo DS',                        'DS'),
  ('Nintendo 3DS',                        37,  'Nintendo 3DS',                       '3DS'),
  ('PC',                                  6,   'PC (Microsoft Windows)',             'PC'),
  ('Sega Saturn',                         32,  'Sega Saturn',                        'Saturn'),
  ('Sega Dreamcast',                      23,  'Dreamcast',                          'Dreamcast'),
  ('Sega Mega Drive',                     29,  'Sega Mega Drive/Genesis',            'Mega Drive'),
  ('Atari 2600',                          59,  'Atari 2600',                         'Atari 2600'),
  ('Atari Jaguar',                        62,  'Atari Jaguar',                       'Jaguar'),
  ('Atari Lynx',                          61,  'Atari Lynx',                         'Lynx'),
  ('Neo Geo',                             80,  'Neo Geo AES',                        'Neo Geo')
) AS igdb (old_name, igdb_platform_id, name, short_name)
WHERE platform.name = igdb.old_name;

UPDATE platform SET short_name = name WHERE short_name IS NULL;

ALTER TABLE platform ALTER COLUMN short_name SET NOT NULL;

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
