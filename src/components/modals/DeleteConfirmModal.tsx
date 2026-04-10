"use client";
import { deleteItem } from "@/actions/pages/item";
import { CollectionItem } from "@/types/item";
import styles from "@/styles/modal.module.css";

type Props = {
    item: CollectionItem;
    onComplete: () => void;
    onClose: () => void;
};

export default function DeleteConfirmModal({ item, onComplete, onClose }: Props) {
    const handleDelete = async () => {
        await deleteItem(item.id);
        onComplete();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Delete Item</h2>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>
                <p className={styles.modalBody}>
                    Are you sure you want to delete <strong>{item.title}</strong>? This cannot be undone.
                </p>
                <div className={styles.modalFooter}>
                    <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                    <button type="button" className={styles.deleteButton} onClick={handleDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
}