import { getSortedMovies } from "@/actions/pages/sort";
import SortPageClient from "@/components/sort/SortPageClient";

export const dynamic = "force-dynamic";

export default async function MovieSortPage() {
    const items = await getSortedMovies();
    return <SortPageClient items={items} type="movie" />;
}