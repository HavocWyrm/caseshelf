"use client";
import formStyles from "@/styles/form.module.css";
import styles from "@/styles/metadata.module.css";

type Props = {
    genres: string[];
    onChooseOwn: () => void;
};

export default function ProviderGenreChips({ genres, onChooseOwn }: Props) {
    return (
        <div className={styles.providerGenres}>
            {genres.length > 0 ? (
                <ul className={formStyles.chips}>
                    {genres.map((name, index) => (
                        <li key={name} className={`${formStyles.chip} ${index === 0 ? formStyles.chipPrimary : ""}`}>
                            {name}
                        </li>
                    ))}
                </ul>
            ) : (
                <span className={styles.searchStatus}>No genres from the provider.</span>
            )}
            <button type="button" className={styles.linkButton} onClick={onChooseOwn}>Choose genres myself</button>
        </div>
    );
}
