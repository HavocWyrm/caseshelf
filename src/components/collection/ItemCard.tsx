"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useModal } from "@/lib/helpers/ModalContext";
import { CollectionItem } from "@/types/item";
import styles from "@/styles/itemCard.module.css";

type Props = {
    item: CollectionItem;
};

function getDetail(item: CollectionItem): string {
    if (item.type === "game") return item.platform_name;
    if (item.type === "movie") return item.format_name;
    if (item.type === "show") return item.format_name;
    return "";
}

export default function ItemCard({ item }: Props) {
    const { openEditModal, openDeleteModal } = useModal();

    return (
        <div className={styles.card}>
            <div className={styles.actions}>
                <button
                    className={styles.actionBtn}
                    onClick={() => openEditModal(item)}
                    title="Edit"
                >
                    <Pencil size={14} />
                </button>
                <button
                    className={'${styles.actionBtn} ${styles.actionBtnDanger}'}
                    onClick={() => openDeleteModal(item)}
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div className={styles.detail}>{getDetail(item)}</div>
            <div className={styles.title}>{item.title}</div>
        </div>
    );
}