"use client";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import styles from "@/styles/settings.module.css";

type Item = {
    id: number;
    name: string;
};

type Props = {
    items: Item[];
    onReorder: (ids: number[]) => void;
};

export default function OrderList({ items, onReorder }: Props) {
    // Holds the live order while a drag is in progress; null otherwise.
    const [draft, setDraft] = useState<Item[] | null>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const displayed = draft ?? items;

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: number) => {
        e.dataTransfer.effectAllowed = "move";
        setDraft(items);
        setDraggingId(id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>, overId: number) => {
        e.preventDefault();
        if (draggingId === null || draggingId === overId) return;
        setDraft((prev) => {
            if (!prev) return prev;
            const from = prev.findIndex((item) => item.id === draggingId);
            const to = prev.findIndex((item) => item.id === overId);
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    };

    const handleDragEnd = () => {
        const ids = displayed.map((item) => item.id);
        if (ids.join() !== items.map((item) => item.id).join()) {
            onReorder(ids);
        }
        setDraft(null);
        setDraggingId(null);
    };

    if (items.length === 0) {
        return <p className={styles.sectionDescription}>Nothing enabled to sort.</p>;
    }

    return (
        <ol className={styles.orderList}>
            {displayed.map((item, index) => (
                <li
                    key={item.id}
                    className={`${styles.orderItem} ${draggingId === item.id ? styles.orderItemDragging : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDrop={(e) => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                >
                    <GripVertical size={16} className={styles.grip} />
                    <span className={styles.orderNumber}>{index + 1}</span>
                    {item.name}
                </li>
            ))}
        </ol>
    );
}
