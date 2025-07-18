import prisma from "@lib/db";
import { CollectionItemType } from "@/generated/prisma";

export async function isDuplicate(
  name: string,
  type: CollectionItemType,
  platformName?: string,
  discFormat?: string
): Promise<boolean> {
  const nameFilter = {
    equals: name,
    mode: "insensitive" as const,
  };

  const baseFilter: any = {
    name: nameFilter,
    type,
  };

  if (type === "GAME" && platformName) {
    return await prisma.collectionItem.findFirst({
      where: {
        ...baseFilter,
        gameDetails: {
          platform: {
            name: {
              equals: platformName,
              mode: "insensitive",
            },
          },
        },
      },
    }) !== null;
  }

  if ((type === "MOVIE" || type === "SHOW") && discFormat) {
    const detailKey = type === "MOVIE" ? "movieDetails" : "showDetails";

    return (await prisma.collectionItem.findFirst({
      where: {
        ...baseFilter,
        [detailKey]: {
          discFormat: {
            equals: discFormat,
            mode: "insensitive",
          },
        },
      },
    })) !== null;
  }

  return await prisma.collectionItem.findFirst({
    where: baseFilter,
  }) !== null;
}