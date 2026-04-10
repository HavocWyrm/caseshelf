"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import styles from "@/styles/detail.module.css";

type Props = {
    title: string;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    titleField?: React.ReactNode;
    children: React.ReactNode;
};

export default function DetailLayout({
    title,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    titleField,
    children,
}: Props) {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    <ChevronLeft size={18} />
                    Back
                </button>
                {!isEditing && (
                    <button className="btn" onClick={onEdit}>Edit</button>
                )}
            </div>

            <div className={styles.card}>
                {isEditing ? (
                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Title</span>
                        {titleField}
                    </div>
                ) : (
                    <h1 className={styles.title}>{title}</h1>
                )}
                {children}
            </div>

            {isEditing && (
                <div className={styles.editControls}>
                    <button className="btn-outline" onClick={onCancel}>Cancel</button>
                    <button className="btn" onClick={onSave}>Save</button>
                </div>
            )}
        </div>
    );
}