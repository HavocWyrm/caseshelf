import prisma from "@lib/db";

import AddItemButton from "@component/AddItemButton";
import DashboardCard from "@component/DashboardCard";
import { CollectionItemType } from "@/generated/prisma"

export default async function Home() {
  const items = await prisma.collectionItem.findMany();

  const groupedByType: Record<CollectionItemType, number> = {
    GAME: 0,
    MOVIE: 0,
    SHOW: 0,
  };

  for (const item of items) {
    groupedByType[item.type]++;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome to CaseShelf</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {(Object.entries(groupedByType) as [CollectionItemType, number][]).map(
          ([itemType, itemCount]) => (
            <DashboardCard key={itemType} itemCount={itemCount} itemType={itemType} />
          )
        )}
      </div>
    </main>
  );
}