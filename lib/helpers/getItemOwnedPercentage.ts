import prisma from "@lib/db";
import { CollectionItemType } from "@/generated/prisma";

export async function getItemOwnedPercentage(itemType: CollectionItemType): Promise<number> {
    const total = await prisma.collectionItem.count({ where: { type: itemType } });
    const owned = await prisma.collectionItem.count({
        where: { type: itemType, status: "OWNED" },
    });

    if (total === 0) return 0; // Avoid division by zero

    return Math.round((owned / total) * 100);
}