CREATE TABLE IF NOT EXISTS collection_item (
  id       BIGSERIAL,
  name     TEXT NOT NULL,
  platform TEXT NOT NULL,
  owned    BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);