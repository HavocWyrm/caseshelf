import { ItemMetadataState } from "@/types/metadata";

export type ItemType = "game" | "movie" | "show";

export type BaseItem = {
  id: number;
  title: string;
  type: ItemType;
  owned: boolean;
  franchise_name: string | null;
  franchise_order: number | null;
  site_label: string | null;
  site_url: string | null;
  release_year: number | null;
  genres: ItemGenre[];
};

export type GameItem = BaseItem & {
  type: "game";
  platform_id: number;
  platform_name: string;
  platform_short_name: string;
  platform_igdb_id: number | null;
  primary_genre_name: string | null;
};

export type MovieItem = BaseItem & {
  type: "movie";
  format_id: number;
  format_name: string;
  primary_genre_name: string | null;
};

export type ShowItem = BaseItem & {
  type: "show";
  format_id: number;
  format_name: string;
  seasons_owned: number;
  primary_genre_name: string | null;
};

export type CollectionItem = GameItem | MovieItem | ShowItem;

export type GameMetadata = {
  synopsis: string | null;
  developer: string | null;
  publisher: string | null;
};

export type MovieMetadata = {
  synopsis: string | null;
  runtime_minutes: number | null;
  director: string | null;
  certification: string | null;
};

export type ShowMetadata = {
  synopsis: string | null;
  total_seasons: number | null;
  network: string | null;
  series_status: string | null;
};

export type GameDetail = GameItem & GameMetadata & ItemMetadataState;
export type MovieDetail = MovieItem & MovieMetadata & ItemMetadataState;
export type ShowDetail = ShowItem & ShowMetadata & ItemMetadataState;

export type DetailsInput = {
  title: string;
  owned: boolean;
  genres: GenreSelection;
  releaseYear: number | null;
  franchiseName: string;
  franchiseOrder: number | null;
  siteUrl: string;
  siteLabel: string;
  synopsis: string;
};

export type GameDetailsInput = DetailsInput & {
  platformId: number;
  developer: string;
  publisher: string;
};

export type MovieDetailsInput = DetailsInput & {
  formatId: number;
  runtimeMinutes: number | null;
  director: string;
  certification: string;
};

export type ShowDetailsInput = DetailsInput & {
  formatId: number;
  seasonsOwned: number;
  totalSeasons: number | null;
  network: string;
  seriesStatus: string;
};

export type Platform = {
  id: number;
  name: string;
};

export type Format = {
  id: number;
  name: string;
};

export type Genre = {
  id: number;
  name: string;
};

export type ItemGenre = Genre & {
  is_primary: boolean;
};

export type GenreSelection = {
  ids: number[];
  primaryId: number | null;
};