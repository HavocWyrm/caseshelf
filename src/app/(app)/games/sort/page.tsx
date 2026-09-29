import { getSortedGames } from "@/actions/pages/sort";
import SortPageClient from "@/components/sort/SortPageClient";

export const dynamic = "force-dynamic";

export default async function GameSortPage() {
    const items = await getSortedGames();
    return <SortPageClient items={items} type="game" />;
}