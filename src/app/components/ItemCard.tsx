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
    <div
      onClick={handleClick}
      className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white cursor-pointer"
    >
      {item.coverArt?.url && (
        <img
          src={item.coverArt.url}
          alt={item.name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}

      <h3 className="text-xl font-semibold" style={{ color: "black" }}>
        {item.name}
        {item.type === "GAME" && item.gameDetails?.platform?.name && (
          <>: {item.gameDetails.platform.name}</>
        )}
      </h3>

      {item.type === "MOVIE" && item.movieDetails && (
        <p className="text-gray-600 mt-1" style={{ color: "black" }}>
          {item.movieDetails.runtimeMinutes} minutes
        </p>
      )}

      {item.type === "SHOW" && item.showDetails && (
        <p className="text-gray-600 mt-1" style={{ color: "black" }}>
          {item.showDetails.seasonCount} seasons
        </p>
      )}

      <p className="text-gray-600 mt-1" style={{ color: "black" }}>
        {item.status}
      </p>

      <p className="text-gray-600 mt-1" style={{ color: "black" }}>
        {item.description}
      </p>
    </div>
  );
}
