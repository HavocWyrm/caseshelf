CREATE TABLE franchise (
  id    BIGSERIAL,
  name  TEXT NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

CREATE TABLE franchise_item (
  id                 BIGSERIAL,
  franchise_id       BIGINT NOT NULL REFERENCES franchise(id) ON DELETE CASCADE,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  franchise_order    SMALLINT,
  PRIMARY KEY (id),
  UNIQUE (franchise_id, collection_item_id)
);

CREATE TABLE item_url (
  id                 BIGSERIAL,
  collection_item_id BIGINT NOT NULL REFERENCES collection_item(id) ON DELETE CASCADE,
  site_url                TEXT NOT NULL,
  site_label              TEXT,
  PRIMARY KEY (id)
);