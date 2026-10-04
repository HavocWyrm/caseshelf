import { CollectionItem } from "@/types/item";

const typeRoute = {
    game: "/games",
    movie: "/movies",
    show: "/shows",
} as const;

export function getDetailRoute(item: Pick<CollectionItem, "id" | "type">): string {
    return `${typeRoute[item.type]}/${item.id}`;
}
