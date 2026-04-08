"use client";
import { useState, useEffect, useRef } from "react";
import { GameItem, Platform } from "@/types/item";
import { createGame, updateGame } from "@/actions/game";
import { getPlatforms } from "@/actions/platform";
import styles from "@/styles/modal.module.css";
import formStyles from "@/styles/form.module.css";

type Props = {
    item?: GameItem;
    onComplete: () => void;
    onCreateAnother?: () => void;
    onClose: () => void;
};

export default function GameFormModal({ item, onComplete, onCreateAnother, onClose }: Props) {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [formData, setFormData] = useState({
        title: item?.title ?? "",
        owned: item?.owned ?? false,
        platformId: item?.platform_id ?? 0,
    });
    const continueRef = useRef(false);

    useEffect(() => {
        getPlatforms().then((data) => {
            setPlatforms(data);
            if (!item) {
                setFormData((prev) => ({ ...prev, platformId: data[0]?.id ?? 0 }));
            }
        });
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : name === "platformId" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (item) {
            await updateGame(item.id, formData.title, formData.owned, formData.platformId);
            onComplete();
        } else {
            await createGame(formData.title, formData.owned, formData.platformId);
            if (continueRef.current) {
                setFormData((prev) => ({ ...prev, title: "" }));
                continueRef.current = false;
                onCreateAnother?.();
            } else {
                onComplete();
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{item ? "Edit Game" : "Add Game"}</h2>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>
                <form className={formStyles.form} onSubmit={handleSubmit}>
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="title">Title</label>
                        <input className={formStyles.input} type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="platformId">Platform</label>
                        <select className={formStyles.select} id="platformId" name="platformId" value={formData.platformId} onChange={handleChange}>
                            {platforms.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={formStyles.checkboxField}>
                        <input type="checkbox" id="owned" name="owned" checked={formData.owned} onChange={handleChange} />
                        <label className={formStyles.checkboxLabel} htmlFor="owned">Owned</label>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        {onCreateAnother && (
                            <button
                                type="submit"
                                className="btn"
                                onClick={() => { continueRef.current = true; }}
                            >
                                Create & Add Another
                            </button>
                        )}
                        <button type="submit" className="btn">{item ? "Save" : "Create"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}