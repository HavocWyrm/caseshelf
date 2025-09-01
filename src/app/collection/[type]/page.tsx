import prisma from "@lib/db";
import AddItemButton from "@/components/ui/button/AddItemButton";
import ItemCard from "@/components/features/items/ItemCard";
import PageHeader from "@/components/layout/PageHeader";
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

    const getDisplayName = (type: CollectionItemType): string => {
        switch (type) {
            case "GAME":
                return "Games";
            case "MOVIE":
                return "Movies";
            case "SHOW":
                return "Shows";
            default:
                return "Collection";
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">

            <PageHeader
                pageTitle={getDisplayName(type)}
            />
            <AddItemButton itemType={type.toString()} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </main>
    );
}