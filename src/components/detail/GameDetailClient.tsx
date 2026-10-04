"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameDetail, Platform } from "@/types/item";
import { updateGameDetails } from "@/actions/pages/gameDetails";
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
    item: GameDetail;
    platforms: Platform[];
};

const formDataFrom = (item: GameDetail) => ({
    title: item.title,
    owned: item.owned,
    platformId: item.platform_id,
    releaseYear: item.release_year?.toString() ?? "",
    franchiseName: item.franchise_name ?? "",
    franchiseOrder: item.franchise_order?.toString() ?? "",
    siteUrl: item.site_url ?? "",
    siteLabel: item.site_label ?? "",
    synopsis: item.synopsis ?? "",
    developer: item.developer ?? "",
    publisher: item.publisher ?? "",
});

const numberOrNull = (value: string) => (value === "" ? null : Number(value));

export default function GameDetailClient({ item, platforms }: Props) {
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
                : name === "platformId" ? Number(value) : value,
        }));
    };

    const handleSave = async () => {
        const listingError = formData.owned ? null : listingUrlError(formData.siteUrl);
        setSaveError(listingError);
        if (listingError) return;
        try {
            await updateGameDetails(item.id, {
                title: formData.title,
                owned: formData.owned,
                platformId: formData.platformId,
                genres,
                releaseYear: numberOrNull(formData.releaseYear),
                franchiseName: formData.franchiseName,
                franchiseOrder: numberOrNull(formData.franchiseOrder),
                siteUrl: formData.owned ? "" : formData.siteUrl,
                siteLabel: formData.owned ? "" : formData.siteLabel,
                synopsis: formData.synopsis,
                developer: formData.developer,
                publisher: formData.publisher,
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
                    mediaType="game"
                    title={item.title}
                    platformId={item.platform_id}
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
                <span className={styles.fieldLabel}>Platform</span>
                {isEditing ? (
                    <select className={formStyles.select} name="platformId" value={formData.platformId} onChange={handleChange}>
                        {platforms.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                ) : (
                    <span className={styles.fieldValue}>{item.platform_name}</span>
                )}
            </div>

            <div className={styles.field}>
                <FieldLabel label="Genres" itemId={item.id} lockableField="genre" lockedFields={item.locked_field} />
                {isEditing ? (
                    <GenreSelect mediaType="game" value={genres} onChange={setGenres} />
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
                <FieldLabel label="Developer" itemId={item.id} lockableField="developer" lockedFields={item.locked_field} />
                {isEditing ? (
                    <input
                        className={formStyles.input}
                        type="text"
                        name="developer"
                        value={formData.developer}
                        onChange={handleChange}
                    />
                ) : (
                    <span className={styles.fieldValue}>{item.developer ?? "—"}</span>
                )}
            </div>
            <div className={styles.field}>
                <FieldLabel label="Publisher" itemId={item.id} lockableField="publisher" lockedFields={item.locked_field} />
                {isEditing ? (
                    <input
                        className={formStyles.input}
                        type="text"
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                    />
                ) : (
                    <span className={styles.fieldValue}>{item.publisher ?? "—"}</span>
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
