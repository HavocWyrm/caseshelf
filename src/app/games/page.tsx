import { getGames } from "@/actions/game";
import ItemCard from "@/components/collection/ItemCard";
import AddItemButton from "@/components/collection/AddItemButton";
import styles from "@/styles/collection.module.css";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
    const games = await getGames();

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <AddItemButton itemType="game" />
            </div>
            {games.length === 0 ? (
                <p className="text-muted">No games yet.</p>
            ) : (
                <div className="items-grid">
                    {games.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}