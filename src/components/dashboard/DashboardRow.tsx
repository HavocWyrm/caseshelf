"use client";
import { useRouter } from "next/navigation";
import { Gamepad2, Film, TvMinimal, ChevronRight, Plus } from "lucide-react";
import { useModal } from "@/lib/helpers/ModalContext";
import styles from "@/styles/dashboard.module.css";

type Props = {
    itemType: "game" | "movie" | "show";
    owned: number;
    total: number;
};

const iconMap = {
    game: <Gamepad2 size={28} />,
    movie: <Film size={28} />,
    show: <TvMinimal size={28} />,
};

const labelMap = {
    game: "Games",
    movie: "Movies",
    show: "Shows",
};

const routeMap = {
    game: "/games",
    movie: "/movies",
    show: "/shows",
};

export default function DashboardRow({ itemType, owned, total }: Props) {
    const router = useRouter();
    const { openAddModal } = useModal();

    return (
        <div className={styles.row}>
            <div className={styles.icon}>{iconMap[itemType]}</div>
            <div className={styles.label}>{labelMap[itemType]}</div>
            <div className={styles.count}>
                {total === 0 ? (
                    <span className={styles.countEmpty}>No items yet</span>
                ) : (
                    <span>{owned} / {total} owned</span>
                )}
            </div>
            <div className={styles.actions}>
                <button
                    className="btn-outline"
                    onClick={() => openAddModal(itemType)}
                    title={'Add ${labelMap[itemType]}'}
                >
                    <Plus size={16} />
                </button>
                <button
                    className="btn-outline"
                    onClick={() => router.push(routeMap[itemType])}
                    title={'View ${labelMap[itemType]}'}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}