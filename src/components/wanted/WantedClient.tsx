"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { GameItem, MovieItem, ShowItem, Platform, Format } from "@/types/item";
import { markAsOwned } from "@/actions/pages/wanted";
import styles from "@/styles/wanted.module.css";
import formStyles from "@/styles/form.module.css";

type Tab = "game" | "movie" | "show";

type Props = {
    games: GameItem[];
    movies: MovieItem[];
    shows: ShowItem[];
    platforms: Platform[];
    formats: Format[];
};

export default function WantedClient({ games, movies, shows, platforms, formats }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get("type") as Tab) ?? "game";

    const [localGames, setLocalGames] = useState(games);
    const [localMovies, setLocalMovies] = useState(movies);
    const [localShows, setLocalShows] = useState(shows);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const setTab = (tab: Tab) => {
        setFilter("all");
        setSearch("");
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", tab);
        router.push(`/wanted?${params.toString()}`);
    };

    const handleMarkOwned = async (id: number) => {
        await markAsOwned(id);
        if (activeTab === "game") setLocalGames((prev) => prev.filter((i) => i.id !== id));
        if (activeTab === "movie") setLocalMovies((prev) => prev.filter((i) => i.id !== id));
        if (activeTab === "show") setLocalShows((prev) => prev.filter((i) => i.id !== id));
    };

    const filterOptions = activeTab === "game"
        ? platforms.map((p) => ({ id: p.id, name: p.name }))
        : formats.map((f) => ({ id: f.id, name: f.name }));

    const filterLabel = activeTab === "game" ? "Platform" : "Format";

    const filteredItems = (() => {
        const items = activeTab === "game" ? localGames
            : activeTab === "movie" ? localMovies
                : localShows;

        return items.filter((item) => {
            const detail = item.type === "game" ? item.platform_name : item.format_name;
            if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
            if (filter !== "all" && detail !== filter) return false;
            return true;
        });
    })();

    return (
        <div className={styles.page}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "game" ? styles.tabActive : ""}`}
                    onClick={() => setTab("game")}
                >
                    Games
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "movie" ? styles.tabActive : ""}`}
                    onClick={() => setTab("movie")}
                >
                    Movies
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "show" ? styles.tabActive : ""}`}
                    onClick={() => setTab("show")}
                >
                    Shows
                </button>
            </div>

            <div className={styles.filterBar}>
                <input
                    className={formStyles.input}
                    type="text"
                    placeholder="Search title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className={formStyles.select}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All {filterLabel}s</option>
                    {filterOptions.map((o) => (
                        <option key={o.id} value={o.name}>{o.name}</option>
                    ))}
                </select>
            </div>

            {filteredItems.length === 0 ? (
                <p className={styles.empty}>No items match your search criteria.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>{filterLabel}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.id} className={styles.row}>
                                <td
                                    className={styles.titleCell}
                                    onClick={() => router.push(`/${item.type === "game" ? "games" : item.type === "movie" ? "movies" : "shows"}/${item.id}`)}
                                >
                                    {item.title}
                                </td>
                                <td className={styles.detailCell}>
                                    {item.type === "game" ? item.platform_name : item.format_name}
                                </td>
                                <td className={styles.actionCell}>
                                    <button
                                        className={styles.ownedButton}
                                        onClick={() => handleMarkOwned(item.id)}
                                    >
                                        Mark as Owned ✓
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}