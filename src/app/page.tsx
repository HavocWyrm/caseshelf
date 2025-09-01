import prisma from "@lib/db";

import DashboardCard from "@/components/features/dashboard/DashboardCard";
import PageHeader from "@/components/layout/PageHeader";
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

      <PageHeader
        pageTitle="CaseShelf"
      />
      <div className="grid grid-cols-3 gap-6 h-full">
        {(Object.entries(groupedByType) as [CollectionItemType, number][]).map(
          ([itemType, itemCount]) => (
            <DashboardCard
              key={itemType}
              itemType={itemType}
            />
          ),
        )}
      </div>
    </main>
  );
}
