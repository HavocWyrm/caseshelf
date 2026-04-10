"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Format, MovieItem } from "@/types/item";
import { updateMovieDetails } from "@/actions/pages/movieDetails";
import DetailLayout from "@/components/detail/DetailLayout";
import FranchiseInput from "@/components/ui/FranchiseInput";
import styles from "@/styles/detail.module.css";
import formStyles from "@/styles/form.module.css";
import { ExternalLink } from "lucide-react";

type Props = {
    item: MovieItem;
    formats: Format[];
};

export default function MovieDetailClient({ item, formats }: Props) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: item.title,
        owned: item.owned,
        formatId: item.format_id,
        franchiseName: item.franchise_name ?? "",
        franchiseOrder: item.franchise_order?.toString() ?? "",
        siteUrl: item.site_url ?? "",
        siteLabel: item.site_label ?? "",
    });
    useEffect(() => {
        setFormData({
            title: item.title,
            owned: item.owned,
            formatId: item.format_id,
            franchiseName: item.franchise_name ?? "",
            franchiseOrder: item.franchise_order?.toString() ?? "",
            siteUrl: item.site_url ?? "",
            siteLabel: item.site_label ?? "",
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

    const handleSave = async () => {
        const franchiseOrder = formData.franchiseOrder === "" ? null : Number(formData.franchiseOrder);
        const siteUrl = formData.owned ? "" : formData.siteUrl;
        const siteLabel = formData.owned ? "" : formData.siteLabel;
        await updateMovieDetails(
            item.id,
            formData.title,
            formData.owned,
            formData.formatId,
            formData.franchiseName,
            franchiseOrder,
            siteUrl,
            siteLabel
        );
        setIsEditing(false);
        router.refresh();
    };

    const handleCancel = () => {
        setFormData({
            title: item.title,
            owned: item.owned,
            formatId: item.format_id,
            franchiseName: item.franchise_name ?? "",
            franchiseOrder: item.franchise_order?.toString() ?? "",
            siteUrl: item.site_url ?? "",
            siteLabel: item.site_label ?? "",
        });
        setIsEditing(false);
    };

    return (
        <DetailLayout
            title={item.title}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            titleField={
                <input
                    className={formStyles.input}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            }
        >

            <div className={styles.field}>
                <span className={styles.fieldLabel}>Format</span>
                {isEditing ? (
                    <select className={formStyles.select} name="formatId" value={formData.formatId} onChange={handleChange}>
                        {formats.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                ) : (
                    <span className={styles.fieldValue}>{item.format_name}</span>
                )}
            </div>

            <div className={styles.field}>
                <span className={styles.fieldLabel}>Status</span>
                {isEditing ? (
                    <div className={formStyles.checkboxField}>
                        <input type="checkbox" name="owned" checked={formData.owned} onChange={handleChange} />
                        <label className={formStyles.checkboxLabel}>Owned</label>
                    </div>
                ) : (
                    <span className={`${styles.badge} ${item.owned ? styles.badgeOwned : styles.badgeWanted}`}>
                        {item.owned ? "Owned" : "Wanted"}
                    </span>
                )}
            </div>

            <div className={styles.field}>
                <span className={styles.fieldLabel}>Franchise</span>
                {isEditing ? (
                    <>
                        <FranchiseInput
                            value={formData.franchiseName}
                            onChange={(value) => setFormData((prev) => ({ ...prev, franchiseName: value }))}
                        />
                        <input
                            className={formStyles.input}
                            type="number"
                            name="franchiseOrder"
                            placeholder="Entry #"
                            min={1}
                            value={formData.franchiseOrder}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    <span className={styles.fieldValue}>
                        {item.franchise_name
                            ? `${item.franchise_name}${item.franchise_order ? ` #${item.franchise_order}` : ""}`
                            : "—"}
                    </span>
                )}
            </div>

            {(isEditing && !formData.owned) || item.site_url ? (
                <div className={styles.field}>
                    <span className={styles.fieldLabel}>Listing</span>
                    {isEditing && !formData.owned ? (
                        <div className={formStyles.inlineFields}>
                            <input
                                className={formStyles.input}
                                type="text"
                                name="siteLabel"
                                placeholder="Site"
                                value={formData.siteLabel}
                                onChange={handleChange}
                            />
                            <input
                                className={formStyles.input}
                                type="url"
                                name="siteUrl"
                                placeholder="URL"
                                value={formData.siteUrl}
                                onChange={handleChange}
                            />
                        </div>
                    ) : !formData.owned && item.site_url ? (
                        <a
                            href={item.site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.listingLink}
                        >
                            <ExternalLink size={14} />
                            {item.site_label ?? item.site_url}
                        </a>
                    ) : null}
                </div>
            ) : null}
        </DetailLayout>
    );
}