"use client";
import { useState } from "react";
import { ShowItem, Format } from "@/types/item";
import ItemCard from "@/components/collection/ItemCard";
import FilterBar from "@/components/ui/FilterBar";
import AddItemButton from "@/components/collection/AddItemButton";
import styles from "@/styles/collection.module.css";

type Props = {
    shows: ShowItem[];
    formats: Format[];
    franchises: string[];
};

export default function ShowsClient({ shows, formats, franchises }: Props) {
    const [search, setSearch] = useState("");
    const [owned, setOwned] = useState<"all" | "owned" | "wanted">("all");
    const [selectedFranchise, setSelectedFranchise] = useState("all");
    const [selectedFormat, setSelectedFormat] = useState("all");

    const filtered = shows.filter((item) => {
        if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (owned === "owned" && !item.owned) return false;
        if (owned === "wanted" && item.owned) return false;
        if (selectedFranchise !== "all" && item.franchise_name !== selectedFranchise) return false;
        if (selectedFormat !== "all" && item.format_name !== selectedFormat) return false;
        return true;
    });

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <AddItemButton itemType="show" />
            </div>
            <FilterBar
                search={search}
                onSearchChange={setSearch}
                owned={owned}
                onOwnedChange={setOwned}
                franchises={franchises}
                selectedFranchise={selectedFranchise}
                onFranchiseChange={setSelectedFranchise}
                typeOptions={formats.map((f) => f.name)}
                selectedType={selectedFormat}
                onTypeChange={setSelectedFormat}
                typeLabel="Format"
            />
            {filtered.length === 0 ? (
                <p className="text-muted">No shows match your filters.</p>
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