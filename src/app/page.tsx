import prisma from "@lib/db";

import DashboardPageClient from "@component/features/dashboard/DashboardPageClientComponent";
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

  return <DashboardPageClient groupedByType={groupedByType} />;
}
