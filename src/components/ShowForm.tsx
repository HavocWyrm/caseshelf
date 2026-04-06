"use client";
import { useState } from "react";
import { ShowItem, Format } from "@/types/item";
import { createShow, updateShow } from "@/actions/show";
import styles from "@/styles/form.module.css";

type Props = {
    item?: ShowItem;
    formats: Format[];
    onComplete: () => void;
};

export default function ShowForm({ item, formats, onComplete }: Props) {
    const [formData, setFormData] = useState({
        title: item?.title ?? "",
        owned: item?.owned ?? false,
        formatId: item?.format_id ?? formats[0]?.id ?? 0,
        seasonsOwned: item?.seasons_owned ?? 0,
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
        const seasonsOwned = Number(formData.seasonsOwned);
        if (item) {
            await updateShow(item.id, formData.title, formData.owned, formData.formatId, seasonsOwned);
        } else {
            await createShow(formData.title, formData.owned, formData.formatId, seasonsOwned);
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

            <div className={styles.field}>
                <label className={styles.label} htmlFor="seasonsOwned">Seasons Owned</label>
                <input className={styles.input} type="number" id="seasonsOwned" name="seasonsOwned" min={0} value={formData.seasonsOwned} onChange={handleChange} />
            </div>

            <button className={styles.submitButton} type="submit">{item ? "Save" : "Create"}</button>
        </form>
    );
}