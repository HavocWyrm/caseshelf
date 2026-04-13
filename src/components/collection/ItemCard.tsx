"use client";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

function getDetailRoute(item: CollectionItem): string {
    if (item.type === "game") return `/games/${item.id}`;
    if (item.type === "movie") return `/movies/${item.id}`;
    if (item.type === "show") return `/shows/${item.id}`;
    return "/";
}

export default function ItemCard({ item }: Props) {
    const { openDeleteModal } = useModal();
    const router = useRouter();
    const logoUrl = getLogoUrl(item);

    return (
        <div className={styles.card} onClick={() => router.push(getDetailRoute(item))}>
            <div className={styles.actions}>
                <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }}
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>

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