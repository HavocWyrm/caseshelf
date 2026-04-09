"use client";
import { useState } from "react";
import { GameItem, Platform } from "@/types/item";
import ItemCard from "@/components/collection/ItemCard";
import FilterBar from "@/components/ui/FilterBar";
import AddItemButton from "@/components/collection/AddItemButton";
import styles from "@/styles/collection.module.css";

type Props = {
    games: GameItem[];
    platforms: Platform[];
    franchises: string[];
};

export default function GamesClient({ games, platforms, franchises }: Props) {
    const [search, setSearch] = useState("");
    const [owned, setOwned] = useState<"all" | "owned" | "wanted">("all");
    const [selectedFranchise, setSelectedFranchise] = useState("all");
    const [selectedPlatform, setSelectedPlatform] = useState("all");

    const filtered = games.filter((item) => {
        if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (owned === "owned" && !item.owned) return false;
        if (owned === "wanted" && item.owned) return false;
        if (selectedFranchise !== "all" && item.franchise_name !== selectedFranchise) return false;
        if (selectedPlatform !== "all" && item.platform_name !== selectedPlatform) return false;
        return true;
    });

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <AddItemButton itemType="game" />
            </div>
            <FilterBar
                search={search}
                onSearchChange={setSearch}
                owned={owned}
                onOwnedChange={setOwned}
                franchises={franchises}
                selectedFranchise={selectedFranchise}
                onFranchiseChange={setSelectedFranchise}
                typeOptions={platforms.map((p) => p.name)}
                selectedType={selectedPlatform}
                onTypeChange={setSelectedPlatform}
                typeLabel="Platform"
            />
            {filtered.length === 0 ? (
                <p className="text-muted">No games match your filters.</p>
            ) : (
                <div className="items-grid">
                    {filtered.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}