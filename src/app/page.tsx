import prisma from "@lib/db";

import DashboardCard from "@component/DashboardCard";
import { CollectionItemType } from "@/generated/prisma";

export default async function Home() {
  const items = await prisma.collectionItem.findMany();

  const groupedByType: Record<CollectionItemType, number> = {
    GAME: 0,
    MOVIE: 0,
    SHOW: 0,
  };

  for (const item of items) {
    groupedByType[item.type]++;
  }

  return (
    <main className="h-full w-full max-w-full">
      <div className="grid grid-cols-3 gap-6 h-full">
        {(Object.entries(groupedByType) as [CollectionItemType, number][]).map(
          ([itemType, itemCount]) => (
            <DashboardCard
              key={itemType}
              itemCount={itemCount}
              itemType={itemType}
            />
          ),
        )}
      </div>
    </main>
  );
}
