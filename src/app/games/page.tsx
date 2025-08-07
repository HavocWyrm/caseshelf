import prisma from "@lib/db";
import AddItemButton from "@component/AddItemButton";
import ItemCard from "@component/ItemCard";
import { gameItemInclude, GameItem } from "@/app/types/collectionItemQuery";

export default async function GamesPage() {
  const items = await prisma.collectionItem.findMany({
    where: { type: "GAME" },
    include: gameItemInclude,
  }) as GameItem[];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Games</h1>
      <AddItemButton itemType="GAME" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
