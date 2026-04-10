"use client";
import { useState, useEffect, useRef } from "react";
import { ShowItem, Format } from "@/types/item";
import { createShow, updateShow } from "@/actions/pages/show";
import { getFormats } from "@/actions/attributes/format";
import FranchiseInput from "@/components/ui/FranchiseInput";
import styles from "@/styles/modal.module.css";
import formStyles from "@/styles/form.module.css";

type Props = {
    item?: ShowItem;
    onComplete: () => void;
    onCreateAnother?: () => void;
    onClose: () => void;
};

export default function ShowFormModal({ item, onComplete, onCreateAnother, onClose }: Props) {
    const [formats, setFormats] = useState<Format[]>([]);
    const [formData, setFormData] = useState({
        title: item?.title ?? "",
        owned: item?.owned ?? false,
        formatId: item?.format_id ?? 0,
        franchiseName: item?.franchise_name ?? "",
        franchiseOrder: item?.franchise_order ?? "",
        seasonsOwned: item?.seasons_owned ?? 0,
        site_label: item?.site_label ?? "",
        site_url: item?.site_url ?? "",
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
                : name === "formatId" || name === "seasonsOwned" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const franchiseOrder = formData.franchiseOrder === "" ? null : Number(formData.franchiseOrder);
        if (item) {
            await updateShow(item.id, formData.title, formData.owned, formData.formatId, formData.seasonsOwned, formData.franchiseName, franchiseOrder, formData.site_url, formData.site_label);
            onComplete();
        } else {
            await createShow(formData.title, formData.owned, formData.formatId, formData.seasonsOwned, formData.franchiseName, franchiseOrder, formData.site_url, formData.site_label);
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
                    <h2 className={styles.modalTitle}>{item ? "Edit Show" : "Add Show"}</h2>
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
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="franchiseName">Franchise</label>
                        <FranchiseInput
                            value={formData.franchiseName}
                            onChange={(value) => setFormData((prev) => ({ ...prev, franchiseName: value }))}
                        />
                    </div>
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="franchiseOrder">Franchise №</label>
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
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="seasonsOwned">Seasons Owned</label>
                        <input className={formStyles.input} type="number" id="seasonsOwned" name="seasonsOwned" min={0} value={formData.seasonsOwned} onChange={handleChange} />
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