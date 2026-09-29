"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CollectionItem } from "@/types/item";
import styles from "@/styles/sort.module.css";
import pageStyles from "@/styles/page.module.css";

type Props = {
    items: CollectionItem[];
    type: "game" | "movie" | "show";
};

function getGroupLabel(item: CollectionItem): string {
    const shelf = item.type === "game" ? item.platform_name : item.format_name;
    const genre = item.primary_genre_name ?? "No Genre";
    return `${shelf} — ${genre}`;
}

function getDisplayTitle(item: CollectionItem): string {
    if (item.franchise_name) {
        return item.franchise_order
            ? `${item.franchise_name} #${item.franchise_order} — ${item.title}`
            : `${item.franchise_name} — ${item.title}`;
    }
    return item.title;
}

function getSubtitle(item: CollectionItem): string {
    const parts = [];
    if (item.release_year) parts.push(item.release_year.toString());
    return parts.join(" · ");
}

export default function SortPageClient({ items, type }: Props) {
    const router = useRouter();
    const typeLabel = type === "game" ? "Games" : type === "movie" ? "Movies" : "Shows";
    const backHref = type === "game" ? "/games" : type === "movie" ? "/movies" : "/shows";

    const groups: { label: string; items: CollectionItem[] }[] = [];
    for (const item of items) {
        const label = getGroupLabel(item);
        const existing = groups.find((g) => g.label === label);
        if (existing) {
            existing.items.push(item);
        } else {
            groups.push({ label, items: [item] });
        }
    }

    let counter = 1;

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <button className={styles.backButton} onClick={() => router.push(backHref)}>
                    <ChevronLeft size={18} />
                    Back to {typeLabel}
                </button>
                <h1 className={styles.heading}>Sort Order — {typeLabel}</h1>
                <span className={styles.count}>{items.length} items</span>
            </div>

            {items.length === 0 ? (
                <p className={pageStyles.empty}>No owned {typeLabel.toLowerCase()} to sort yet.</p>
            ) : (
                groups.map((group) => (
                    <div key={group.label} className={styles.group}>
                        <h2 className={styles.groupLabel}>{group.label}</h2>
                        <ol className={styles.list} start={counter}>
                            {group.items.map((item) => {
                                const num = counter++;
                                const subtitle = getSubtitle(item);
                                return (
                                    <li key={item.id} className={styles.listItem}>
                                        <span className={styles.number}>{num}</span>
                                        <span className={styles.itemTitle}>{getDisplayTitle(item)}</span>
                                        {subtitle && (
                                            <span className={styles.subtitle}>{subtitle}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                ))
            )}
        </div>
    );
}