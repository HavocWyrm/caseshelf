import { Star } from "lucide-react";
import { ItemGenre } from "@/types/item";
import styles from "@/styles/detail.module.css";

type Props = {
    genres: ItemGenre[];
};

// It's assumed the first genre returned by a provider's API is going to be the primary
export default function GenreList({ genres }: Props) {
    if (genres.length === 0) return <span className={styles.fieldValue}>—</span>;
    return (
        <ul className={styles.genreList}>
            {genres.map((genre) => (
                <li
                    key={genre.id}
                    className={`${styles.genreChip} ${genre.is_primary ? styles.genrePrimary : ""}`}
                    title={genre.is_primary ? "Primary genre" : undefined}
                >
                    {genre.is_primary && <Star size={12} fill="currentColor" aria-label="Primary" />}
                    {genre.name}
                </li>
            ))}
        </ul>
    );
}
