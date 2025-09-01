import prisma from "@lib/db";
import CollectionPageClient from "@/components/features/collections/CollectionPageClientComponent";
import { gameItemInclude, GameItem, movieItemInclude, MovieItem, showItemInclude, ShowItem } from "@/app/types/collectionItemQuery";
import { CollectionItemType } from "@/generated/prisma";

interface CollectionPageProps {
    params: Promise<{
        type: string;
    }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { type: typeParam } = await params;
    const type = typeParam.toUpperCase() as CollectionItemType;
    let items: GameItem[] | MovieItem[] | ShowItem[] = [];

    console.log("Fetching items for type:", type);

    if (type === "GAME") {
        items = await prisma.collectionItem.findMany({
            where: { type: "GAME" },
            include: gameItemInclude,
        }) as GameItem[]
    }
    else if (type === "MOVIE") {
        items = await prisma.collectionItem.findMany({
            where: { type: "MOVIE" },
            include: movieItemInclude,
        }) as MovieItem[]
    }
    else if (type === "SHOW") {
        items = await prisma.collectionItem.findMany({
            where: { type: "SHOW" },
            include: showItemInclude
        }) as ShowItem[]
    }

    return <CollectionPageClient type={type} items={items} />;
}