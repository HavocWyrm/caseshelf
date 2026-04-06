import { getMovies } from "@/actions/movie";
import ItemCard from "@/components/collection/ItemCard";
import AddItemButton from "@/components/collection/AddItemButton";
import styles from "@/styles/collection.module.css";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
    const movies = await getMovies();

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <AddItemButton itemType="movie" />
            </div>
            {movies.length === 0 ? (
                <p className="text-muted">No movies yet.</p>
            ) : (
                <div className="items-grid">
                    {movies.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}