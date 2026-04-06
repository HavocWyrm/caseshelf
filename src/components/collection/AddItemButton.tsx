"use client";
import { Plus } from "lucide-react";
import { useModal } from "@/lib/helpers/ModalContext";

type Props = {
    itemType: "game" | "movie" | "show";
};

const labelMap = {
    game: "Add Game",
    movie: "Add Movie",
    show: "Add Show",
};

export default function AddItemButton({ itemType }: Props) {
    const { openAddModal } = useModal();

    return (
        <button className="btn" onClick={() => openAddModal(itemType)}>
            <Plus size={16} />
            {labelMap[itemType]}
        </button>
    );
}