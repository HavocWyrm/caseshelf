"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { searchMetadata } from "@/actions/pages/metadata";
import { ItemType } from "@/types/item";
import { MetadataSearchResult } from "@/types/metadata";
import styles from "@/styles/metadata.module.css";
import formStyles from "@/styles/form.module.css";

const PROVIDER_NAME: Record<ItemType, string> = { game: "IGDB", movie: "TMDB", show: "TMDB" };

type Props = {
    mediaType: ItemType;
    platformId?: number | null;
    initialQuery?: string;
    onSelect: (result: MetadataSearchResult) => void;
};

export default function ProviderSearch({ mediaType, platformId, initialQuery = "", onSelect }: Props) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<MetadataSearchResult[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setError(null);
        const response = await searchMetadata(mediaType, query, platformId);
        setIsSearching(false);
        if (response.ok) {
            setResults(response.data);
        } else {
            setResults(null);
            setError(response.message);
        }
    };

    return (
        <div className={styles.search}>
            <div className={styles.searchBar}>
                <input
                    className={formStyles.input}
                    type="search"
                    placeholder={`Search ${PROVIDER_NAME[mediaType]}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            runSearch();
                        }
                    }}
                    autoFocus
                />
                <button type="button" className="btn" onClick={runSearch} disabled={isSearching || !query.trim()}>
                    <Search size={16} aria-hidden />
                    <span className={styles.visuallyHidden}>Search</span>
                </button>
            </div>

            {isSearching && <p className={styles.searchStatus}>Searching…</p>}
            {error && <p className={styles.searchError} role="alert">{error}</p>}
            {results && results.length === 0 && !isSearching && (
                <p className={styles.searchStatus}>No matches. Try another title, or enter it manually.</p>
            )}
            {results && results.length > 0 && (
                <ul className={styles.results}>
                    {results.map((result) => (
                        <li key={result.provider_id}>
                            <button type="button" className={styles.result} onClick={() => onSelect(result)}>
                                <span className={styles.resultTitle}>
                                    {result.title}
                                    {result.year && <span className={styles.resultYear}> ({result.year})</span>}
                                </span>
                                {result.overview && <span className={styles.resultOverview}>{result.overview}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
