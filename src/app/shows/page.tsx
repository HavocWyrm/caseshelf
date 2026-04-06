import { getShows } from "@/actions/show";
import ItemCard from "@/components/collection/ItemCard";
import AddItemButton from "@/components/collection/AddItemButton";
import styles from "@/styles/collection.module.css";

export const dynamic = "force-dynamic";

export default async function ShowsPage() {
    const shows = await getShows();

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <AddItemButton itemType="show" />
            </div>
            {shows.length === 0 ? (
                <p className="text-muted">No shows yet.</p>
            ) : (
                <div className="items-grid">
                    {shows.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}