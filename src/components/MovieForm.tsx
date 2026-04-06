"use client";
import { useState } from "react";
import { MovieItem, Format } from "@/types/item";
import { createMovie, updateMovie } from "@/actions/movie";
import styles from "@/styles/form.module.css";

type Props = {
    item?: MovieItem;
    formats: Format[];
    onComplete: () => void;
};

export default function MovieForm({ item, formats, onComplete }: Props) {
    const [formData, setFormData] = useState({
        title: item?.title ?? "",
        owned: item?.owned ?? false,
        formatId: item?.format_id ?? formats[0]?.id ?? 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : name === "formatId" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (item) {
            await updateMovie(item.id, formData.title, formData.owned, formData.formatId);
        } else {
            await createMovie(formData.title, formData.owned, formData.formatId);
        }
        onComplete();
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label className={styles.label} htmlFor="title">Title</label>
                <input className={styles.input} type="text" id="title" name="title" value={formData.title} onChange={handleChange} />
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="formatId">Format</label>
                <select className={styles.select} id="formatId" name="formatId" value={formData.formatId} onChange={handleChange}>
                    {formats.map((format) => (
                        <option key={format.id} value={format.id}>{format.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.checkboxField}>
                <input type="checkbox" id="owned" name="owned" checked={formData.owned} onChange={handleChange} />
                <label className={styles.checkboxLabel} htmlFor="owned">Owned</label>
            </div>

            <button className={styles.submitButton} type="submit">{item ? "Save" : "Create"}</button>
        </form>
    );
}