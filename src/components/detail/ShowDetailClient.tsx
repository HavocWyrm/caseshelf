"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Format, ShowDetail } from "@/types/item";
import { updateShowDetails } from "@/actions/pages/showDetails";
import DetailLayout from "@/components/detail/DetailLayout";
import GenreList from "@/components/detail/GenreList";
import FieldLabel from "@/components/metadata/FieldLabel";
import UnlockButton from "@/components/metadata/UnlockButton";
import MetadataActions from "@/components/metadata/MetadataActions";
import MetadataSource from "@/components/metadata/MetadataSource";
import FranchiseInput from "@/components/ui/FranchiseInput";
import GenreSelect from "@/components/ui/GenreSelect";
import { selectionFromGenres } from "@/lib/helpers/genreSelection";
import { listingUrlError } from "@/lib/helpers/listingUrl";
import styles from "@/styles/detail.module.css";
import formStyles from "@/styles/form.module.css";
import { ExternalLink } from "lucide-react";

type Props = {
    item: ShowDetail;
    formats: Format[];
};

const formDataFrom = (item: ShowDetail) => ({
    title: item.title,
    owned: item.owned,
    formatId: item.format_id,
    releaseYear: item.release_year?.toString() ?? "",
    franchiseName: item.franchise_name ?? "",
    franchiseOrder: item.franchise_order?.toString() ?? "",
    siteUrl: item.site_url ?? "",
    siteLabel: item.site_label ?? "",
    synopsis: item.synopsis ?? "",
    seasonsOwned: item.seasons_owned?.toString() ?? "",
    totalSeasons: item.total_seasons?.toString() ?? "",
    network: item.network ?? "",
    seriesStatus: item.series_status ?? "",
});

const numberOrNull = (value: string) => (value === "" ? null : Number(value));

export default function ShowDetailClient({ item, formats }: Props) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [genres, setGenres] = useState(() => selectionFromGenres(item.genres));
    const [formData, setFormData] = useState(() => formDataFrom(item));

    useEffect(() => {
        setFormData(formDataFrom(item));
        setGenres(selectionFromGenres(item.genres));
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : name === "formatId" ? Number(value) : value,
        }));
    };

    const handleSave = async () => {
        const listingError = formData.owned ? null : listingUrlError(formData.siteUrl);
        setSaveError(listingError);
        if (listingError) return;
        try {
            await updateShowDetails(item.id, {
                title: formData.title,
                owned: formData.owned,
                formatId: formData.formatId,
                genres,
                releaseYear: numberOrNull(formData.releaseYear),
                franchiseName: formData.franchiseName,
                franchiseOrder: numberOrNull(formData.franchiseOrder),
                siteUrl: formData.owned ? "" : formData.siteUrl,
                siteLabel: formData.owned ? "" : formData.siteLabel,
                synopsis: formData.synopsis,
                seasonsOwned: numberOrNull(formData.seasonsOwned) ?? 0,
                totalSeasons: numberOrNull(formData.totalSeasons),
                network: formData.network,
                seriesStatus: formData.seriesStatus,
            });
        } catch {
            setSaveError("Couldn't save your changes. Please try again.");
            return;
        }
        setIsEditing(false);
        router.refresh();
    };

    const handleCancel = () => {
        setSaveError(null);
        setFormData(formDataFrom(item));
        setGenres(selectionFromGenres(item.genres));
        setIsEditing(false);
    };

    return (
        <DetailLayout
            title={item.title}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            saveError={saveError}
            titleLock={item.locked_field.includes("title") && <UnlockButton itemId={item.id} lockableField="title" label="Title" />}
            metadataSource={<MetadataSource metadata={item} />}
            topBarActions={
                <MetadataActions
                    itemId={item.id}
                    mediaType="show"
                    title={item.title}
                    metadata={item}
                />
            }
            titleInput={
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
                <FieldLabel label="Genres" itemId={item.id} lockableField="genre" lockedFields={item.locked_field} />
                {isEditing ? (
                    <GenreSelect mediaType="show" value={genres} onChange={setGenres} />
                ) : (
                    <GenreList genres={item.genres} />
                )}
            </div>

            <div className={styles.field}>
                <FieldLabel label="Release Year" itemId={item.id} lockableField="release_year" lockedFields={item.locked_field} />
                {isEditing ? (
                    <input
                        className={formStyles.input}
                        type="number"
                        name="releaseYear"
                        placeholder="e.g. 1994"
                        min={1900}
                        max={2100}
                        value={formData.releaseYear}
                        onChange={handleChange}
                    />
                ) : (
                    <span className={styles.fieldValue}>{item.release_year ?? "—"}</span>
                )}
            </div>

            <div className={styles.field}>
                <FieldLabel label="Network" itemId={item.id} lockableField="network" lockedFields={item.locked_field} />
                {isEditing ? (
                    <input
                        className={formStyles.input}
                        type="text"
                        name="network"
                        value={formData.network}
                        onChange={handleChange}
                    />
                ) : (
                    <span className={styles.fieldValue}>{item.network ?? "—"}</span>
                )}
            </div>
            <div className={styles.field}>
                <FieldLabel label="Total Seasons" itemId={item.id} lockableField="total_seasons" lockedFields={item.locked_field} />
                {isEditing ? (
                    <input
                        className={formStyles.input}
                        type="number"
                        name="totalSeasons"
                        min={1}
                        value={formData.totalSeasons}
                        onChange={handleChange}
                    />
                ) : (
                    <span className={styles.fieldValue}>{item.total_seasons ?? "—"}</span>
                )}
            </div>
            <div className={styles.field}>
                <FieldLabel label="Series Status" itemId={item.id} lockableField="series_status" lockedFields={item.locked_field} />
                {isEditing ? (
                    <input
                        className={formStyles.input}
                        type="text"
                        name="seriesStatus"
                        placeholder="e.g. Ended"
                        value={formData.seriesStatus}
                        onChange={handleChange}
                    />
                ) : (
                    <span className={styles.fieldValue}>{item.series_status ?? "—"}</span>
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
                <span className={styles.fieldLabel}>Seasons Owned</span>
                {isEditing ? (
                    <input
                        className={formStyles.input}
                        type="number"
                        name="seasonsOwned"
                        min={0}
                        value={formData.seasonsOwned}
                        onChange={handleChange}
                    />
                ) : (
                    <span className={styles.fieldValue}>
                        {item.seasons_owned > 0 ? item.seasons_owned : "—"}
                    </span>
                )}
            </div>

            <div className={styles.field}>
                <FieldLabel label="Franchise" itemId={item.id} lockableField="franchise" lockedFields={item.locked_field} />
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

            <div className={styles.field}>
                <FieldLabel label="Synopsis" itemId={item.id} lockableField="synopsis" lockedFields={item.locked_field} />
                {isEditing ? (
                    <textarea
                        className={`${formStyles.input} ${formStyles.textarea}`}
                        name="synopsis"
                        rows={5}
                        value={formData.synopsis}
                        onChange={handleChange}
                    />
                ) : (
                    <p className={styles.synopsis}>{item.synopsis ?? "—"}</p>
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
