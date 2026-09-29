"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameGenre, MediaGenre } from "@/types/item";
import {
    togglePlatform,
    toggleFormat,
    savePlatformOrder,
    saveFormatOrder,
    saveGameGenreOrder,
    saveMediaGenreOrder,
} from "@/actions/pages/settings";
import ToggleList from "@/components/settings/ToggleList";
import OrderList from "@/components/settings/OrderList";
import styles from "@/styles/settings.module.css";
import pageStyles from "@/styles/page.module.css";

type Tab = "tracking" | "sorting";

type ToggleItem = { id: number; name: string; enabled: boolean };

type Props = {
    platforms: ToggleItem[];
    formats: ToggleItem[];
    gameGenres: GameGenre[];
    mediaGenres: MediaGenre[];
};

const byName = <T extends { name: string }>(items: T[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name));

const withEnabled = (items: ToggleItem[], id: number, enabled: boolean) =>
    items.map((item) => (item.id === id ? { ...item, enabled } : item));

// Reorders the items named in `orderedIds` into the slots they already occupy,
// leaving hidden (disabled) items where they were so they keep their place.
function applyOrder<T extends { id: number }>(items: T[], orderedIds: number[]): T[] {
    const byId = new Map(items.map((item) => [item.id, item]));
    const moved = new Set(orderedIds);
    const queue = [...orderedIds];
    return items.map((item) => (moved.has(item.id) ? byId.get(queue.shift()!)! : item));
}

export default function SettingsClient({ platforms, formats, gameGenres, mediaGenres }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get("tab") as Tab) ?? "tracking";

    const [platformList, setPlatformList] = useState(platforms);
    const [formatList, setFormatList] = useState(formats);
    const [gameGenreList, setGameGenreList] = useState(gameGenres);
    const [mediaGenreList, setMediaGenreList] = useState(mediaGenres);

    const setTab = (tab: Tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`/settings?${params.toString()}`);
    };

    const handlePlatformToggle = (id: number, enabled: boolean) => {
        setPlatformList((prev) => withEnabled(prev, id, enabled));
        togglePlatform(id, enabled);
    };

    const handleFormatToggle = (id: number, enabled: boolean) => {
        setFormatList((prev) => withEnabled(prev, id, enabled));
        toggleFormat(id, enabled);
    };

    const handlePlatformReorder = (ids: number[]) => {
        const next = applyOrder(platformList, ids);
        setPlatformList(next);
        savePlatformOrder(next.map((item) => item.id));
    };

    const handleFormatReorder = (ids: number[]) => {
        const next = applyOrder(formatList, ids);
        setFormatList(next);
        saveFormatOrder(next.map((item) => item.id));
    };

    const handleGameGenreReorder = (ids: number[]) => {
        setGameGenreList(applyOrder(gameGenreList, ids));
        saveGameGenreOrder(ids);
    };

    const handleMediaGenreReorder = (ids: number[]) => {
        setMediaGenreList(applyOrder(mediaGenreList, ids));
        saveMediaGenreOrder(ids);
    };

    return (
        <div className={styles.page}>
            <div className={pageStyles.tabs}>
                <button
                    className={`${pageStyles.tab} ${activeTab === "tracking" ? pageStyles.tabActive : ""}`}
                    onClick={() => setTab("tracking")}
                >
                    Tracking
                </button>
                <button
                    className={`${pageStyles.tab} ${activeTab === "sorting" ? pageStyles.tabActive : ""}`}
                    onClick={() => setTab("sorting")}
                >
                    Sorting
                </button>
            </div>

            {activeTab === "tracking" ? (
                <>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Platforms</h2>
                        <p className={styles.sectionDescription}>
                            Select the platforms you want to track. Disabled platforms will not appear in the game form dropdown.
                        </p>
                        <ToggleList
                            items={byName(platformList)}
                            onToggle={handlePlatformToggle}
                            warning="Disabling a platform will not remove existing games — it only prevents new games from using it."
                        />
                    </section>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Formats</h2>
                        <p className={styles.sectionDescription}>
                            Select the formats you want to track. Disabled formats will not appear in the movie or show form dropdown.
                        </p>
                        <ToggleList
                            items={byName(formatList)}
                            onToggle={handleFormatToggle}
                            warning="Disabling a format will not remove existing items — it only prevents new items from using it."
                        />
                    </section>
                </>
            ) : (
                <>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Platforms</h2>
                        <p className={styles.sectionDescription}>
                            Drag platforms into the order you want them shelved. Games are grouped by platform first.
                        </p>
                        <OrderList
                            items={platformList.filter((item) => item.enabled)}
                            onReorder={handlePlatformReorder}
                        />
                    </section>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Game Genres</h2>
                        <p className={styles.sectionDescription}>
                            Drag genres into the order you want them shelved. Within each platform, games are sorted by this order.
                        </p>
                        <OrderList items={gameGenreList} onReorder={handleGameGenreReorder} />
                    </section>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Formats</h2>
                        <p className={styles.sectionDescription}>
                            Drag formats into the order you want them shelved. Movies and shows are grouped by format first.
                        </p>
                        <OrderList
                            items={formatList.filter((item) => item.enabled)}
                            onReorder={handleFormatReorder}
                        />
                    </section>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Movie &amp; Show Genres</h2>
                        <p className={styles.sectionDescription}>
                            Drag genres into the order you want them shelved. Within each format, movies and shows are sorted by this order.
                        </p>
                        <OrderList items={mediaGenreList} onReorder={handleMediaGenreReorder} />
                    </section>
                </>
            )}
        </div>
    );
}
