import { getSortedShows } from "@/actions/pages/sort";
import SortPageClient from "@/components/sort/SortPageClient";

export const dynamic = "force-dynamic";

export default async function ShowSortPage() {
    const items = await getSortedShows();
    return <SortPageClient items={items} type="show" />;
}