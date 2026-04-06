export type ItemType = "game" | "movie" | "show";

export type BaseItem = {
  id: number;
  title: string;
  type: ItemType;
  owned: boolean;
};

export type GameItem = BaseItem & {
  type: "game";
  platform_id: number;
  platform_name: string;
};

export type MovieItem = BaseItem & {
  type: "movie";
  format_id: number;
  format_name: string;
};

export type ShowItem = BaseItem & {
  type: "show";
  format_id: number;
  format_name: string;
  seasons_owned: number;
};

export type CollectionItem = GameItem | MovieItem | ShowItem;

export type Platform = {
  id: number;
  name: string;
};

export type Format = {
  id: number;
  name: string;
};