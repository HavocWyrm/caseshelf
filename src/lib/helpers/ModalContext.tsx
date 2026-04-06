"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CollectionItem } from "@/types/item";

type ModalState =
    | null
    | { type: "add"; itemType: "game" | "movie" | "show" }
    | { type: "edit"; item: CollectionItem }
    | { type: "delete"; item: CollectionItem };

type ModalContextType = {
    openAddModal: (itemType: "game" | "movie" | "show") => void;
    openEditModal: (item: CollectionItem) => void;
    openDeleteModal: (item: CollectionItem) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) throw new Error("useModal must be used within a ModalProvider");
    return context;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [modalState, setModalState] = useState<ModalState>(null);
    const router = useRouter();

    const openAddModal = useCallback((itemType: "game" | "movie" | "show") => {
        setModalState({ type: "add", itemType });
    }, []);

    const openEditModal = useCallback((item: CollectionItem) => {
        setModalState({ type: "edit", item });
    }, []);

    const openDeleteModal = useCallback((item: CollectionItem) => {
        setModalState({ type: "delete", item });
    }, []);

    const closeModal = useCallback(() => {
        setModalState(null);
    }, []);

    const handleSuccess = useCallback(() => {
        setModalState(null);
        router.refresh();
    }, [router]);

    return (
        <ModalContext.Provider value={{ openAddModal, openEditModal, openDeleteModal, closeModal }}>
            {children}
            {modalState?.type === "add" && modalState.itemType === "game" && (
                <GameFormModal onComplete={handleSuccess} onClose={closeModal} />
            )}
            {modalState?.type === "add" && modalState.itemType === "movie" && (
                <MovieFormModal onComplete={handleSuccess} onClose={closeModal} />
            )}
            {modalState?.type === "add" && modalState.itemType === "show" && (
                <ShowFormModal onComplete={handleSuccess} onClose={closeModal} />
            )}
            {modalState?.type === "edit" && modalState.item.type === "game" && (
                <GameFormModal item={modalState.item} onComplete={handleSuccess} onClose={closeModal} />
            )}
            {modalState?.type === "edit" && modalState.item.type === "movie" && (
                <MovieFormModal item={modalState.item} onComplete={handleSuccess} onClose={closeModal} />
            )}
            {modalState?.type === "edit" && modalState.item.type === "show" && (
                <ShowFormModal item={modalState.item} onComplete={handleSuccess} onClose={closeModal} />
            )}
            {modalState?.type === "delete" && (
                <DeleteConfirmModal item={modalState.item} onComplete={handleSuccess} onClose={closeModal} />
            )}
        </ModalContext.Provider>
    );
}

import GameFormModal from "@/components/modals/GameFormModal";
import MovieFormModal from "@/components/modals/MovieFormModal";
import ShowFormModal from "@/components/modals/ShowFormModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";