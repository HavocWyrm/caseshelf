"use client";

import { useRouter } from "next/navigation";
import type {
  GameItem,
  MovieItem,
  ShowItem,
} from "@/app/types/collectionItemQuery";

type Props = {
  item: GameItem | MovieItem | ShowItem;
};

export default function ItemCard({ item }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/item/${item.id}`);
  };

  return (
    <div onClick={handleClick} className="item-card" style={{ backgroundImage: item.coverArt?.url ? `url(${item.coverArt.url})` : "", }} >
      <div className="item-card-format">
        <p>
          {item.type === "GAME" ? item.gameDetails?.platform?.logo.toString() ?? "" : ""}
          {item.type === "MOVIE" ? item.movieDetails?.format?.name ?? "" : ""}
          {item.type === "SHOW" ? item.showDetails?.format?.name ?? "" : ""}
        </p>
      </div>
      <div className="item-card-title">
        <p>
          {item.name}
        </p>
      </div>
    </div>
  );
}
