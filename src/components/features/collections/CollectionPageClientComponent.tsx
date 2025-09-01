"use client";

import { usePageTitle } from "@component/layout/hooks/usePageTitle";
import AddItemButton from "@component/ui/button/AddItemButton";
import ItemCard from "@component/features/items/ItemCard";
import { GameItem, MovieItem, ShowItem } from "@/app/types/collectionItemQuery";
import { CollectionItemType } from "@/generated/prisma";

interface CollectionPageClientProps {
    type: CollectionItemType;
    items: GameItem[] | MovieItem[] | ShowItem[];
}

export default function CollectionPageClient({ type, items }: CollectionPageClientProps) {
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

    usePageTitle(getDisplayName(type));

    return (
        <div className="collection-page">
            <AddItemButton itemType={type.toString()} />
            <div className="items-grid">
                {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}