"use client";
import formStyles from "@/styles/form.module.css";
import styles from "@/styles/filterBar.module.css";

type Props = {
    search: string;
    onSearchChange: (value: string) => void;
    owned: "all" | "owned" | "wanted";
    onOwnedChange: (value: "all" | "owned" | "wanted") => void;
    franchises: string[];
    selectedFranchise: string;
    onFranchiseChange: (value: string) => void;
    typeOptions: string[];
    selectedType: string;
    onTypeChange: (value: string) => void;
    typeLabel: string;
};

export default function FilterBar({
    search, onSearchChange,
    owned, onOwnedChange,
    franchises, selectedFranchise, onFranchiseChange,
    typeOptions, selectedType, onTypeChange,
    typeLabel,
}: Props) {
    return (
        <div className={styles.bar}>
            <input
                className={formStyles.input}
                type="text"
                placeholder="Search title..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <select
                className={formStyles.select}
                value={owned}
                onChange={(e) => onOwnedChange(e.target.value as "all" | "owned" | "wanted")}
            >
                <option value="all">All</option>
                <option value="owned">Owned</option>
                <option value="wanted">Wanted</option>
            </select>
            <select
                className={formStyles.select}
                value={selectedFranchise}
                onChange={(e) => onFranchiseChange(e.target.value)}
            >
                <option value="all">All Franchises</option>
                {franchises.map((f) => (
                    <option key={f} value={f}>{f}</option>
                ))}
            </select>
            <select
                className={formStyles.select}
                value={selectedType}
                onChange={(e) => onTypeChange(e.target.value)}
            >
                <option value="all">All {typeLabel}s</option>
                {typeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>
        </div>
    );
}