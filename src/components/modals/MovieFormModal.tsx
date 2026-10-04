"use client";
import { useState, useEffect, useRef } from "react";
import { Format, GenreSelection } from "@/types/item";
import { MetadataPreview, MetadataSearchResult } from "@/types/metadata";
import { createMovie } from "@/actions/pages/movie";
import { getFormats } from "@/actions/attributes/format";
import { getMetadataAvailability, previewMetadata } from "@/actions/pages/metadata";
import FranchiseInput from "@/components/ui/FranchiseInput";
import GenreSelect from "@/components/ui/GenreSelect";
import ProviderSearch from "@/components/metadata/ProviderSearch";
import MatchBanner from "@/components/metadata/MatchBanner";
import ProviderGenreChips from "@/components/metadata/ProviderGenreChips";
import { NO_GENRES } from "@/lib/helpers/genreSelection";
import { mergeUntouched } from "@/lib/helpers/prefill";
import styles from "@/styles/modal.module.css";
import formStyles from "@/styles/form.module.css";
import metadataStyles from "@/styles/metadata.module.css";

type Props = {
    onComplete: () => void;
    onCreateAnother?: () => void;
    onClose: () => void;
};

const EMPTY_FORM = {
    title: "",
    owned: false,
    formatId: 0,
    releaseYear: "",
    franchiseName: "",
    franchiseOrder: "",
    site_label: "",
    site_url: "",
    synopsis: "",
    runtimeMinutes: "",
    director: "",
    certification: "",
};

type FormData = typeof EMPTY_FORM;
type Prefill = Partial<FormData>;

function prefillFrom(preview: MetadataPreview): Prefill {
    return {
        title: preview.title ?? "",
        releaseYear: preview.release_year?.toString() ?? "",
        synopsis: preview.synopsis ?? "",
        franchiseName: preview.franchise?.name ?? "",
        franchiseOrder: preview.franchise?.order?.toString() ?? "",
        runtimeMinutes: preview.fields.runtime_minutes?.toString() ?? "",
        director: preview.fields.director?.toString() ?? "",
        certification: preview.fields.certification?.toString() ?? "",
    };
}

export default function MovieFormModal({ onComplete, onCreateAnother, onClose }: Props) {
    const [formats, setFormats] = useState<Format[]>([]);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [step, setStep] = useState<"search" | "form">("search");
    const [match, setMatch] = useState<MetadataSearchResult | null>(null);
    const [preview, setPreview] = useState<MetadataPreview | null>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [customGenres, setCustomGenres] = useState(false);
    const [genres, setGenres] = useState<GenreSelection>(NO_GENRES);
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const continueRef = useRef(false);
    const prefillRef = useRef<Prefill | null>(null);

    useEffect(() => {
        getFormats().then((data) => {
            setFormats(data);
            setFormData((prev) => ({ ...prev, formatId: data[0]?.id ?? 0 }));
        });
        getMetadataAvailability("movie")
            .then(setAvailable)
            .catch(() => setAvailable(false));
    }, []);

    const showSearch = available === true && step === "search";

    const loadPreview = async (providerId: string) => {
        setIsPreviewing(true);
        setPreviewError(null);
        const response = await previewMetadata("movie", providerId);
        setIsPreviewing(false);
        if (!response.ok) {
            setPreviewError(response.message);
            return null;
        }
        const next = prefillFrom(response.data);
        setPreview(response.data);
        const previous = prefillRef.current;
        prefillRef.current = next;
        setFormData((prev) => mergeUntouched(prev, previous, next));
        return response.data;
    };

    const handleSelect = async (result: MetadataSearchResult) => {
        setMatch(result);
        setCustomGenres(false);
        setStep("form");
        await loadPreview(result.provider_id);
    };

    const handleManual = () => {
        setMatch(null);
        setPreview(null);
        setPreviewError(null);
        setCustomGenres(true);
        setStep("form");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        const numberOrNull = (value: string) => (value === "" ? null : Number(value));
        const useProviderGenres = match !== null && !customGenres;
        await createMovie(
            {
                title: formData.title,
                owned: formData.owned,
                formatId: formData.formatId,
                genres: useProviderGenres ? NO_GENRES : genres,
                releaseYear: numberOrNull(formData.releaseYear),
                franchiseName: formData.franchiseName,
                franchiseOrder: numberOrNull(formData.franchiseOrder),
                siteUrl: formData.owned ? "" : formData.site_url,
                siteLabel: formData.owned ? "" : formData.site_label,
                synopsis: formData.synopsis,
                runtimeMinutes: numberOrNull(formData.runtimeMinutes),
                director: formData.director,
                certification: formData.certification,
            },
            match ? { providerId: match.provider_id, customGenres } : null
        );
        if (continueRef.current) {
            continueRef.current = false;
            setFormData((prev) => ({ ...EMPTY_FORM, formatId: prev.formatId, owned: prev.owned }));
            setGenres(NO_GENRES);
            setMatch(null);
            setPreview(null);
            prefillRef.current = null;
            setStep("search");
            onCreateAnother?.();
        } else {
            onComplete();
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Add Movie</h2>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>

                {available === null ? (
                    <p className={metadataStyles.searchStatus}>Loading…</p>
                ) : showSearch ? (
                    <>
                        <ProviderSearch mediaType="movie" onSelect={handleSelect} />
                        <div className={metadataStyles.manualChoice}>
                            <button type="button" className="btn-outline" onClick={handleManual}>Enter manually</button>
                        </div>
                    </>
                ) : (
                    <form className={formStyles.form} onSubmit={handleSubmit}>
                        {match && (
                            <MatchBanner
                                preview={preview}
                                isLoading={isPreviewing}
                                onChangeMatch={() => setStep("search")}
                                onManual={handleManual}
                            />
                        )}
                        {!match && available && (
                            <div className={metadataStyles.banner}>
                                <span>Entering manually.</span>
                                <button type="button" className={metadataStyles.linkButton} onClick={() => setStep("search")}>
                                    Search TMDB instead
                                </button>
                            </div>
                        )}
                        {previewError && <p className={metadataStyles.searchError} role="alert">{previewError}</p>}

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
                            <label className={formStyles.label} htmlFor="genres">Genres</label>
                            {match && !customGenres ? (
                                <ProviderGenreChips genres={preview?.genres ?? []} onChooseOwn={() => setCustomGenres(true)} />
                            ) : (
                                <GenreSelect id="genres" mediaType="movie" value={genres} onChange={setGenres} />
                            )}
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
                            <label className={formStyles.label} htmlFor="director">Director</label>
                            <input className={formStyles.input} type="text" id="director" name="director" value={formData.director} onChange={handleChange} />
                        </div>
                        <div className={formStyles.inlineFields}>
                            <div className={formStyles.field}>
                                <label className={formStyles.label} htmlFor="runtimeMinutes">Runtime (min)</label>
                                <input className={formStyles.input} type="number" id="runtimeMinutes" name="runtimeMinutes" min={1} value={formData.runtimeMinutes} onChange={handleChange} />
                            </div>
                            <div className={formStyles.field}>
                                <label className={formStyles.label} htmlFor="certification">Certification</label>
                                <input className={formStyles.input} type="text" id="certification" name="certification" placeholder="e.g. 12A" value={formData.certification} onChange={handleChange} />
                            </div>
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
                        <div className={formStyles.field}>
                            <label className={formStyles.label} htmlFor="synopsis">Synopsis</label>
                            <textarea
                                className={`${formStyles.input} ${formStyles.textarea}`}
                                id="synopsis"
                                name="synopsis"
                                rows={4}
                                value={formData.synopsis}
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
                                    disabled={isPreviewing}
                                    onClick={() => { continueRef.current = true; }}
                                >
                                    Create & Add Another
                                </button>
                            )}
                            <button type="submit" className="btn" disabled={isPreviewing}>Create</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
