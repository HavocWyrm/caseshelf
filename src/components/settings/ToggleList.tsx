"use client";
import { useState } from "react";
import styles from "@/styles/settings.module.css";

type Item = {
    id: number;
    name: string;
    enabled: boolean;
};

type Props = {
    items: Item[];
    onToggle: (id: number, enabled: boolean) => void;
    warning: string;
};

export default function ToggleList({ items, onToggle, warning }: Props) { // TODO: add warning handling
    const [showWarning, setShowWarning] = useState(false);

    const handleToggle = (id: number, currentEnabled: boolean) => {
        if (currentEnabled && !showWarning) {
            setShowWarning(true);
        }
        onToggle(id, !currentEnabled);
    };

    return (
        <div className={styles.toggleList}>
            {showWarning && (
                <p className={styles.warning}>
                    Disabling an option will not remove existing items — it only prevents new items from using it.
                </p>
            )}
            <ul className={styles.list}>
                {items.map((item) => (
                    <li key={item.id} className={styles.listItem}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={item.enabled}
                                onChange={() => handleToggle(item.id, item.enabled)}
                            />
                            {item.name}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}