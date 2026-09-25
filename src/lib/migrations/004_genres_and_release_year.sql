CREATE TABLE game_genre (
  id         BIGSERIAL,
  name       TEXT NOT NULL UNIQUE,
  sort_order INTEGER,
  PRIMARY KEY (id)
);

CREATE TABLE media_genre (
  id         BIGSERIAL,
  name       TEXT NOT NULL UNIQUE,
  sort_order INTEGER,
  PRIMARY KEY (id)
);

ALTER TABLE game
  ADD COLUMN primary_genre_id BIGINT REFERENCES game_genre(id) ON DELETE SET NULL;

ALTER TABLE movie
  ADD COLUMN primary_genre_id BIGINT REFERENCES media_genre(id) ON DELETE SET NULL;

ALTER TABLE show
  ADD COLUMN primary_genre_id BIGINT REFERENCES media_genre(id) ON DELETE SET NULL;

ALTER TABLE collection_item
  ADD COLUMN release_year SMALLINT;

ALTER TABLE platform
  ADD COLUMN sort_order INTEGER;

ALTER TABLE format
  ADD COLUMN sort_order INTEGER;

INSERT INTO game_genre (name) VALUES
    ('Action'),
    ('Adventure'),
    ('Arcade'),
    ('Visual Novel'),
    ('MOBA'),
    ('Point-and-Click'),
    ('Fighting'),
    ('Shooter'),
    ('Music'),
    ('Platform'),
    ('Puzzle'),
    ('Racing'),
    ('Real Time Strategy (RTS)'),
    ('Role-Playing (RPG)'),
    ('Simulator'),
    ('Sport'),
    ('Strategy'),
    ('Turn-Based Strategy (TBS)'),
    ('Tactical'),
    ('Hack and Slash');

INSERT INTO media_genre (name) VALUES
    ('Action'),
    ('Adventure'),
    ('Animation'),
    ('Anime'),
    ('Awards Show'),
    ('Children'),
    ('Comedy'),
    ('Crime'),
    ('Documentary'),
    ('Drama'),
    ('Family'),
    ('Fantasy'),
    ('Food'),
    ('Game Show'),
    ('History'),
    ('Home and Garden'),
    ('Horror'),
    ('Indie'),
    ('Martial Arts'),
    ('Mini-Series'),
    ('Musical'),
    ('Mystery'),
    ('News'),
    ('Podcast'),
    ('Reality'),
    ('Romance'),
    ('Science Fiction'),
    ('Soap'),
    ('Sport'),
    ('Suspense'),
    ('Talk Show'),
    ('Thriller'),
    ('Travel'),
    ('War'),
    ('Western');

UPDATE game_genre SET sort_order = ordered.position
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS position FROM game_genre) ordered
WHERE game_genre.id = ordered.id;

UPDATE media_genre SET sort_order = ordered.position
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS position FROM media_genre) ordered
WHERE media_genre.id = ordered.id;

UPDATE platform SET sort_order = ordered.position
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS position FROM platform) ordered
WHERE platform.id = ordered.id;

UPDATE format SET sort_order = ordered.position
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS position FROM format) ordered
WHERE format.id = ordered.id;
