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
    titleInput?: React.ReactNode;
    titleLock?: React.ReactNode;
    metadataSource?: React.ReactNode;
    topBarActions?: React.ReactNode;
    saveError?: string | null;
    children: React.ReactNode;
};

export default function DetailLayout({
    title,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    titleInput,
    titleLock,
    metadataSource,
    topBarActions,
    saveError,
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
                    <div className={styles.topActions}>
                        {topBarActions}
                        <button className="btn" onClick={onEdit}>Edit</button>
                    </div>
                )}
            </div>

            <div className={styles.card}>
                {isEditing ? (
                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Title</span>
                        {titleInput}
                    </div>
                ) : (
                    <h1 className={styles.title}>{title}{titleLock}</h1>
                )}
                {children}
                {!isEditing && metadataSource}
            </div>

            {isEditing && (
                <div className={styles.editControls}>
                    {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}
                    <button className="btn-outline" onClick={onCancel}>Cancel</button>
                    <button className="btn" onClick={onSave}>Save</button>
                </div>
            )}
        </div>
    );
}
