"use client";
import { useState, useEffect, useRef } from "react";
import { GameItem, Platform, GameGenre } from "@/types/item";
import { createGame, updateGame } from "@/actions/pages/game";
import { getPlatforms } from "@/actions/attributes/platform";
import { getGameGenres } from "@/actions/attributes/genre";
import FranchiseInput from "@/components/ui/FranchiseInput";
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
    const [genres, setGenres] = useState<GameGenre[]>([]);
    const [formData, setFormData] = useState({
        title: item?.title ?? "",
        owned: item?.owned ?? false,
        platformId: item?.platform_id ?? 0,
        genreId: item?.primary_genre_id?.toString() ?? "",
        releaseYear: item?.release_year?.toString() ?? "",
        franchiseName: item?.franchise_name ?? "",
        franchiseOrder: item?.franchise_order ?? "",
        site_label: item?.site_label ?? "",
        site_url: item?.site_url ?? "",
    });
    const continueRef = useRef(false);

    useEffect(() => {
        getPlatforms().then((data) => {
            setPlatforms(data);
            if (!item) {
                setFormData((prev) => ({ ...prev, platformId: data[0]?.id ?? 0 }));
            }
        });
        getGameGenres().then(setGenres);
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

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const franchiseOrder = formData.franchiseOrder === "" ? null : Number(formData.franchiseOrder);
        const genreId = formData.genreId === "" ? null : Number(formData.genreId);
        const releaseYear = formData.releaseYear === "" ? null : Number(formData.releaseYear);
        if (item) {
            await updateGame(item.id, formData.title, formData.owned, formData.platformId, genreId, releaseYear, formData.franchiseName, franchiseOrder, formData.site_url, formData.site_label);
            onComplete();
        } else {
            await createGame(formData.title, formData.owned, formData.platformId, genreId, releaseYear, formData.franchiseName, franchiseOrder, formData.site_url, formData.site_label);
            if (continueRef.current) {
                resetPartialForm();
                continueRef.current = false;
                onCreateAnother?.();
            } else {
                onComplete();
            }
        }
    };

    const resetPartialForm = () =>
        setFormData((prev) => ({
            ...prev,
            title: "",
            releaseYear: "",
            franchiseName: "",
            franchiseOrder: "",
        }));

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
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="genreId">Genre</label>
                        <select className={formStyles.select} id="genreId" name="genreId" value={formData.genreId} onChange={handleChange}>
                            <option value="">No Genre</option>
                            {genres.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="releaseYear">Release Year</label>
                        <input
                            className={formStyles.input}
                            type="number"
                            id="releaseYear"
                            name="releaseYear"
                            placeholder="e.g. 1994"
                            min={1900}
                            max={2100}
                            value={formData.releaseYear}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="franchiseName">Franchise</label>
                        <FranchiseInput
                            value={formData.franchiseName}
                            onChange={(value) => setFormData((prev) => ({ ...prev, franchiseName: value }))}
                        />
                        <label className={formStyles.label} htmlFor="franchiseOrder">Franchise #</label>
                        <input
                            className={formStyles.input}
                            type="number"
                            id="franchiseOrder"
                            name="franchiseOrder"
                            min={1}
                            value={formData.franchiseOrder}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={formStyles.checkboxField}>
                        <input type="checkbox" id="owned" name="owned" checked={formData.owned} onChange={handleChange} />
                        <label className={formStyles.checkboxLabel} htmlFor="owned">Owned</label>
                    </div>
                    {!formData.owned && (
                        <div className={formStyles.inlineFields}>
                            <div className={formStyles.field}>
                                <label className={formStyles.label} htmlFor="site_label">Site</label>
                                <input
                                    className={formStyles.input}
                                    type="text"
                                    id="site_label"
                                    name="site_label"
                                    value={formData.site_label}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={formStyles.field}>
                                <label className={formStyles.label} htmlFor="site_url">URL</label>
                                <input
                                    className={formStyles.input}
                                    type="url"
                                    id="site_url"
                                    name="site_url"
                                    value={formData.site_url}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}
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