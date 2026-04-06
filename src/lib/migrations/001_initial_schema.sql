CREATE TYPE item_type AS ENUM ('game', 'movie', 'show');

CREATE TABLE platform (
  id   BIGSERIAL,
  name TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE format (
  id   BIGSERIAL,
  name TEXT NOT NULL,
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

INSERT INTO platform (name) VALUES
  ('PS1'), ('PS2'), ('PS3'), ('PS4'), ('PS5'),
  ('PSP'), ('PS Vita'),
  ('Xbox'), ('Xbox 360'), ('Xbox One'), ('Xbox Series X|S'),
  ('Nintendo Entertainment System (NES)'), ('Super Nintendo (SNES)'),
  ('Nintendo 64'), ('GameCube'), ('Wii'), ('Wii U'),
  ('Nintendo Switch'), ('Nintendo Switch 2'),
  ('Game Boy'), ('Game Boy Color'), ('Game Boy Advance'),
  ('Nintendo DS'), ('Nintendo 3DS'),
  ('PC'),
  ('Sega Saturn'), ('Sega Dreamcast'), ('Sega Mega Drive'),
  ('Atari 2600'), ('Atari Jaguar'), ('Atari Lynx'),
  ('Neo Geo');

INSERT INTO format (name) VALUES
  ('Blu-ray'), ('Blu-ray 3D'), ('UHD Blu-ray'),
  ('DVD'), ('VHS'), ('Betamax'),
  ('VCD'), ('HD DVD'), ('Laserdisc');