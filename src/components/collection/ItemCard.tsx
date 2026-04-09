"use client";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useModal } from "@/lib/helpers/ModalContext";
import { CollectionItem } from "@/types/item";
import { platformLogoMap, formatLogoMap } from "@/lib/helpers/logoMaps";
import styles from "@/styles/itemCard.module.css";

type Props = {
    item: CollectionItem;
};

function getLogoUrl(item: CollectionItem): string | null {
    if (item.type === "game") return platformLogoMap[item.platform_name] ?? null;
    if (item.type === "movie") return formatLogoMap[item.format_name] ?? null;
    if (item.type === "show") return formatLogoMap[item.format_name] ?? null;
    return null;
}

function getDetailText(item: CollectionItem): string {
    if (item.type === "game") return item.platform_name;
    if (item.type === "movie") return item.format_name;
    if (item.type === "show") return item.format_name;
    return "";
}

export default function ItemCard({ item }: Props) {
    const { openEditModal, openDeleteModal } = useModal();
    const logoUrl = getLogoUrl(item);

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
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => openDeleteModal(item)}
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            {item.site_url && (
                <a
                    href={item.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkButton}
                    title={item.site_label ?? "View listing"}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink size={14} />
                </a>
            )}
            <div className={styles.detail}>
                {logoUrl ? (
                    <Image
                        src={logoUrl}
                        alt={getDetailText(item)}
                        width={32}
                        height={32}
                        className={styles.logo}
                    />
                ) : (
                    <span>{getDetailText(item)}</span>
                )}
            </div>
            <div className={styles.title}>{item.title}</div>
        </div>
    );
}