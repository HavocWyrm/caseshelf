"use client";
import { useState, useEffect, useRef } from "react";
import { MovieItem, Format } from "@/types/item";
import { createMovie, updateMovie } from "@/actions/movie";
import { getFormats } from "@/actions/format";
import styles from "@/styles/modal.module.css";
import formStyles from "@/styles/form.module.css";

type Props = {
    item?: MovieItem;
    onComplete: () => void;
    onCreateAnother?: () => void;
    onClose: () => void;
};

export default function MovieFormModal({ item, onComplete, onCreateAnother, onClose }: Props) {
    const [formats, setFormats] = useState<Format[]>([]);
    const [formData, setFormData] = useState({
        title: item?.title ?? "",
        owned: item?.owned ?? false,
        formatId: item?.format_id ?? 0,
    });
    const continueRef = useRef(false);

    useEffect(() => {
        getFormats().then((data) => {
            setFormats(data);
            if (!item) {
                setFormData((prev) => ({ ...prev, formatId: data[0]?.id ?? 0 }));
            }
        });
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : name === "formatId" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (item) {
            await updateMovie(item.id, formData.title, formData.owned, formData.formatId);
            onComplete();
        } else {
            await createMovie(formData.title, formData.owned, formData.formatId);
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
                    <h2 className={styles.modalTitle}>{item ? "Edit Movie" : "Add Movie"}</h2>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>
                <form className={formStyles.form} onSubmit={handleSubmit}>
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="title">Title</label>
                        <input className={formStyles.input} type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="formatId">Format</label>
                        <select className={formStyles.select} id="formatId" name="formatId" value={formData.formatId} onChange={handleChange}>
                            {formats.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
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