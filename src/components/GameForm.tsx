"use client";
import { useState } from "react";
import { GameItem, Platform } from "@/types/item";
import { createGame, updateGame } from "@/actions/game";
import styles from "@/styles/form.module.css";

type Props = {
    item?: GameItem;
    platforms: Platform[];
    onComplete: () => void;
};

export default function GameForm({ item, platforms, onComplete }: Props) {
    const [formData, setFormData] = useState({
        title: item?.title ?? "",
        owned: item?.owned ?? false,
        platformId: item?.platform_id ?? platforms[0]?.id ?? 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : name === "platformId" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (item) {
            await updateGame(item.id, formData.title, formData.owned, formData.platformId);
        } else {
            await createGame(formData.title, formData.owned, formData.platformId);
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
                <label className={styles.label} htmlFor="platformId">Platform</label>
                <select className={styles.select} id="platformId" name="platformId" value={formData.platformId} onChange={handleChange}>
                    {platforms.map((platform) => (
                        <option key={platform.id} value={platform.id}>{platform.name}</option>
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